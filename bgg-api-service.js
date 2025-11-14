/**
 * BoardGameGeek API Service
 * Handles API calls to BoardGameGeek XML API v2 to retrieve game information
 * and automatically generate theme-based soundtrack suggestions
 */

class BGGApiService {
    constructor() {
        this.baseUrl = 'https://www.boardgamegeek.com/xmlapi2';
        this.cache = new Map();
        this.rateLimitDelay = 1000; // 1 second between requests to respect BGG API limits
        this.lastRequestTime = 0;
    }

    /**
     * Search for board games by name
     * @param {string} query - The game name to search for
     * @returns {Promise<Array>} Array of game search results
     */
    async searchGames(query) {
        const cacheKey = `search_${query.toLowerCase()}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.respectRateLimit();

        try {
            const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&type=boardgame`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`BGG API search failed: ${response.status}`);
            }

            const xmlText = await response.text();
            const results = this.parseSearchResults(xmlText);
            
            // Cache results for 10 minutes
            this.cache.set(cacheKey, results);
            setTimeout(() => this.cache.delete(cacheKey), 10 * 60 * 1000);
            
            return results;
        } catch (error) {
            console.warn('BGG search failed:', error);
            return [];
        }
    }

    /**
     * Get detailed game information by BGG ID
     * @param {number} gameId - The BGG game ID
     * @returns {Promise<Object|null>} Game details object or null if failed
     */
    async getGameDetails(gameId) {
        const cacheKey = `game_${gameId}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.respectRateLimit();

        try {
            const url = `${this.baseUrl}/thing?id=${gameId}&stats=1`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`BGG API thing failed: ${response.status}`);
            }

            const xmlText = await response.text();
            const gameDetails = this.parseGameDetails(xmlText);
            
            if (gameDetails) {
                // Cache results for 1 hour
                this.cache.set(cacheKey, gameDetails);
                setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
            }
            
            return gameDetails;
        } catch (error) {
            console.warn('BGG game details failed:', error);
            return null;
        }
    }

    /**
     * Get game information by name with intelligent matching
     * @param {string} gameName - The game name to look up
     * @returns {Promise<Object|null>} Game details with generated themes
     */
    async getGameByName(gameName) {
        try {
            // First search for the game
            const searchResults = await this.searchGames(gameName);
            
            if (!searchResults || searchResults.length === 0) {
                return null;
            }

            // Take the first result (usually most relevant)
            const firstResult = searchResults[0];
            const gameDetails = await this.getGameDetails(firstResult.id);
            
            if (!gameDetails) {
                return null;
            }

            // Generate themes and soundtrack recommendations
            const themes = this.generateThemesFromGame(gameDetails);
            const category = this.determineCategoryFromThemes(themes);
            
            return {
                id: gameDetails.id,
                name: gameDetails.name,
                description: gameDetails.description,
                yearPublished: gameDetails.yearPublished,
                minPlayers: gameDetails.minPlayers,
                maxPlayers: gameDetails.maxPlayers,
                playingTime: gameDetails.playingTime,
                complexity: gameDetails.complexity,
                rating: gameDetails.rating,
                categories: gameDetails.categories,
                mechanisms: gameDetails.mechanisms,
                families: gameDetails.families,
                themes: themes,
                category: category,
                source: 'boardgamegeek',
                suggestedSoundtracks: this.generateSoundtrackSuggestions(themes, category, gameDetails)
            };
        } catch (error) {
            console.warn('Error getting game by name:', error);
            return null;
        }
    }

    /**
     * Parse XML search results from BGG API
     * @param {string} xmlText - XML response text
     * @returns {Array} Parsed search results
     */
    parseSearchResults(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.getElementsByTagName('item');
            
            const results = [];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const name = item.getElementsByTagName('name')[0]?.getAttribute('value');
                const yearPublished = item.getElementsByTagName('yearpublished')[0]?.getAttribute('value');
                
                if (name) {
                    results.push({
                        id: parseInt(item.getAttribute('id')),
                        name: name,
                        yearPublished: yearPublished ? parseInt(yearPublished) : null
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.warn('Error parsing search results:', error);
            return [];
        }
    }

    /**
     * Parse detailed game XML from BGG API
     * @param {string} xmlText - XML response text
     * @returns {Object|null} Parsed game details
     */
    parseGameDetails(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const item = xmlDoc.getElementsByTagName('item')[0];
            
            if (!item) return null;

            const name = item.getElementsByTagName('name')[0]?.getAttribute('value');
            const description = item.getElementsByTagName('description')[0]?.textContent;
            const yearPublished = item.getElementsByTagName('yearpublished')[0]?.getAttribute('value');
            const minPlayers = item.getElementsByTagName('minplayers')[0]?.getAttribute('value');
            const maxPlayers = item.getElementsByTagName('maxplayers')[0]?.getAttribute('value');
            const playingTime = item.getElementsByTagName('playingtime')[0]?.getAttribute('value');
            
            // Get rating information
            const statistics = item.getElementsByTagName('statistics')[0];
            const ratings = statistics?.getElementsByTagName('ratings')[0];
            const average = ratings?.getElementsByTagName('average')[0]?.getAttribute('value');
            const complexity = ratings?.getElementsByTagName('averageweight')[0]?.getAttribute('value');
            
            // Get categories and mechanisms
            const categories = [];
            const mechanisms = [];
            const families = [];
            
            const links = item.getElementsByTagName('link');
            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const type = link.getAttribute('type');
                const value = link.getAttribute('value');
                
                if (type === 'boardgamecategory') {
                    categories.push(value);
                } else if (type === 'boardgamemechanic') {
                    mechanisms.push(value);
                } else if (type === 'boardgamefamily') {
                    families.push(value);
                }
            }

            return {
                id: parseInt(item.getAttribute('id')),
                name: name,
                description: description ? description.replace(/<[^>]*>/g, '') : '', // Strip HTML
                yearPublished: yearPublished ? parseInt(yearPublished) : null,
                minPlayers: minPlayers ? parseInt(minPlayers) : null,
                maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
                playingTime: playingTime ? parseInt(playingTime) : null,
                rating: average ? parseFloat(average) : null,
                complexity: complexity ? parseFloat(complexity) : null,
                categories: categories,
                mechanisms: mechanisms,
                families: families
            };
        } catch (error) {
            console.warn('Error parsing game details:', error);
            return null;
        }
    }

    /**
     * Generate themes from BGG game data
     * @param {Object} gameDetails - Parsed game details from BGG
     * @returns {Array} Array of theme strings
     */
    generateThemesFromGame(gameDetails) {
        const themes = new Set();
        
        // Map BGG categories to themes
        const categoryMappings = {
            'Adventure': ['adventure', 'exploration'],
            'Fantasy': ['fantasy', 'magic', 'medieval'],
            'Science Fiction': ['scifi', 'futuristic', 'space'],
            'Horror': ['horror', 'dark', 'suspense'],
            'War': ['war', 'military', 'conflict'],
            'Medieval': ['medieval', 'historical'],
            'Ancient': ['historical', 'ancient'],
            'Modern Warfare': ['modern', 'military'],
            'Space Exploration': ['space', 'exploration', 'scifi'],
            'Mystery': ['mystery', 'detective'],
            'Cooperative': ['cooperative', 'teamwork'],
            'Economic': ['strategy', 'economic'],
            'City Building': ['building', 'civilization'],
            'Civilization': ['civilization', 'building'],
            'Trading': ['economic', 'trading'],
            'Racing': ['racing', 'speed'],
            'Sports': ['sports', 'competitive'],
            'Pirates': ['pirates', 'adventure'],
            'Zombies': ['horror', 'zombies', 'survival'],
            'Post-Apocalyptic': ['post-apocalyptic', 'survival'],
            'Steampunk': ['steampunk', 'alternative'],
            'Cyberpunk': ['cyberpunk', 'futuristic']
        };

        // Add themes based on categories
        gameDetails.categories.forEach(category => {
            if (categoryMappings[category]) {
                categoryMappings[category].forEach(theme => themes.add(theme));
            }
        });

        // Map mechanisms to themes
        const mechanismMappings = {
            'Cooperative Play': ['cooperative'],
            'Role Playing': ['roleplay', 'storytelling'],
            'Simulation': ['realistic', 'simulation'],
            'Area Control': ['territorial', 'conflict'],
            'Worker Placement': ['strategy', 'resource'],
            'Deck / Pool Building': ['strategy', 'tactical'],
            'Tile Placement': ['building', 'creative'],
            'Storytelling': ['narrative', 'storytelling'],
            'Campaign / Battle Card Driven': ['campaign', 'tactical']
        };

        gameDetails.mechanisms.forEach(mechanism => {
            if (mechanismMappings[mechanism]) {
                mechanismMappings[mechanism].forEach(theme => themes.add(theme));
            }
        });

        // Analyze description for additional themes
        if (gameDetails.description) {
            const description = gameDetails.description.toLowerCase();
            const descriptionKeywords = {
                'dungeon': ['dungeon', 'adventure'],
                'dragon': ['fantasy', 'epic'],
                'space': ['scifi', 'space'],
                'zombie': ['horror', 'survival'],
                'war': ['war', 'conflict'],
                'mystery': ['mystery', 'detective'],
                'cooperative': ['cooperative'],
                'build': ['building'],
                'explore': ['exploration']
            };

            Object.keys(descriptionKeywords).forEach(keyword => {
                if (description.includes(keyword)) {
                    descriptionKeywords[keyword].forEach(theme => themes.add(theme));
                }
            });
        }

        // Default themes if none found
        if (themes.size === 0) {
            themes.add('strategy');
            themes.add('board game');
        }

        return Array.from(themes);
    }

    /**
     * Determine category from themes for soundtrack matching
     * @param {Array} themes - Array of theme strings
     * @returns {string} Category name
     */
    determineCategoryFromThemes(themes) {
        // Priority order for category determination
        const categoryMappings = [
            { keywords: ['horror', 'zombies', 'dark'], category: 'horror' },
            { keywords: ['fantasy', 'magic', 'medieval', 'dragon'], category: 'fantasy' },
            { keywords: ['scifi', 'space', 'futuristic', 'cyberpunk'], category: 'scifi' },
            { keywords: ['adventure', 'exploration', 'pirates'], category: 'adventure' },
            { keywords: ['mystery', 'detective'], category: 'mystery' },
            { keywords: ['war', 'military', 'conflict'], category: 'war' },
            { keywords: ['cooperative', 'teamwork'], category: 'cooperative' },
            { keywords: ['building', 'civilization'], category: 'strategy' }
        ];

        for (const mapping of categoryMappings) {
            if (mapping.keywords.some(keyword => themes.includes(keyword))) {
                return mapping.category;
            }
        }

        return 'strategy'; // Default category
    }

    /**
     * Generate soundtrack suggestions based on themes and category
     * Now supports ML/NLP-based matching when ML service is available
     * @param {Array} themes - Game themes
     * @param {string} category - Game category
     * @param {Object} gameDetails - Full game details
     * @returns {Array} Array of soundtrack suggestions
     */
    async generateSoundtrackSuggestions(themes, category, gameDetails) {
        // Check if ML matching service is available
        if (typeof window !== 'undefined' && window.MLMatchingService && window.MovieApiService) {
            try {
                const mlService = new window.MLMatchingService();
                const movieService = new window.MovieApiService();
                
                // Build movie database
                const movieDatabase = await movieService.buildMovieDatabase();
                
                // Use ML matching
                const matches = await mlService.matchGameToMovies(gameDetails, movieDatabase);
                
                if (matches && matches.length > 0) {
                    return matches.slice(0, 3).map(match => ({
                        movie: match.movie.title,
                        reason: match.matchReasons.join('. '),
                        tracks: this.generateTrackListForMovie(match.movie),
                        score: match.score,
                        year: match.movie.year,
                        composer: match.movie.composer,
                        mlGenerated: true
                    }));
                }
            } catch (error) {
                console.warn('ML matching failed, falling back to rule-based:', error);
            }
        }
        
        // Fallback to existing rule-based matching
        // Use the existing movie soundtrack categories mapping
        if (typeof window !== 'undefined' && window.MOVIE_SOUNDTRACK_CATEGORIES) {
            const categoryData = window.MOVIE_SOUNDTRACK_CATEGORIES[category];
            if (categoryData && categoryData.movies) {
                return categoryData.movies.slice(0, 2).map(movie => ({
                    movie: movie,
                    reason: `Auto-generated suggestion based on BGG data: ${themes.join(', ')}`,
                    tracks: ['Main Theme', 'Adventure Begins', 'Epic Finale'], // Generic track names
                    mlGenerated: false
                }));
            }
        }

        // Fallback suggestions
        const fallbackSuggestions = {
            fantasy: [
                { movie: 'The Lord of the Rings', reason: 'Epic fantasy adventure', tracks: ['Concerning Hobbits', 'The Bridge of Khazad Dum', 'The Return of the King'] },
                { movie: 'Game of Thrones', reason: 'Dark fantasy themes', tracks: ['Main Title', 'The Rains of Castamere', 'Light of the Seven'] }
            ],
            scifi: [
                { movie: 'Star Wars', reason: 'Space adventure themes', tracks: ['Main Title', 'The Imperial March', 'Duel of the Fates'] },
                { movie: 'Blade Runner', reason: 'Futuristic atmosphere', tracks: ['Main Titles', 'Love Theme', 'Tears in Rain'] }
            ],
            horror: [
                { movie: 'The Conjuring', reason: 'Horror and suspense', tracks: ['Main Title', 'The Music Box', 'Annabelle'] },
                { movie: 'Halloween', reason: 'Classic horror atmosphere', tracks: ['Main Theme', 'Laurie Knows', 'The Shape Hunts'] }
            ],
            default: [
                { movie: 'Hans Zimmer Collection', reason: 'Versatile orchestral themes', tracks: ['Time', 'No Time for Caution', 'Mountains'] }
            ]
        };

        return fallbackSuggestions[category] || fallbackSuggestions.default;
    }
    
    /**
     * Generate a track list for a movie based on its genre and mood
     * @param {Object} movie - Movie data
     * @returns {Array} Array of track names
     */
    generateTrackListForMovie(movie) {
        const genres = movie.genres ? movie.genres.map(g => g.name || g) : [];
        
        // Genre-specific track templates
        if (genres.includes('Fantasy')) {
            return ['Main Theme', 'The Journey Begins', 'Magic and Wonder', 'Epic Battle', 'Triumphant Return'];
        } else if (genres.includes('Science Fiction')) {
            return ['Opening Titles', 'Space Theme', 'Technology', 'Alien Encounter', 'Final Frontier'];
        } else if (genres.includes('Horror')) {
            return ['Ominous Opening', 'Building Tension', 'The Terror', 'Chase Theme', 'Final Confrontation'];
        } else if (genres.includes('Adventure')) {
            return ['Adventure Theme', 'The Quest', 'Discovery', 'Action Sequence', 'Victory'];
        } else if (genres.includes('War')) {
            return ['March Theme', 'Before Battle', 'Combat', 'Sacrifice', 'After War'];
        } else {
            return ['Main Theme', 'Character Theme', 'Action Theme', 'Emotional Theme', 'Finale'];
        }
    }

    /**
     * Respect BGG API rate limits
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BGGApiService;
} else if (typeof window !== 'undefined') {
    window.BGGApiService = BGGApiService;
}