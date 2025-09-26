/**
 * Movie Database API Service
 * Integrates with The Movie Database (TMDB) API to fetch movie information
 * and supplement the hardcoded soundtrack data with dynamic content
 */

class MovieApiService {
    constructor() {
        // Using a demo API key - in production, this should be environment-based
        // TMDB provides a free tier for personal/educational projects
        this.apiKey = 'demo_key'; // Replace with actual API key
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.cache = new Map();
        this.rateLimitDelay = 250; // 4 requests per second limit
        this.lastRequestTime = 0;
    }

    /**
     * Rate limiting to respect API limits
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => 
                setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
            );
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Search for movies by title
     * @param {string} query - Movie title to search for
     * @returns {Promise<Array>} Array of movie search results
     */
    async searchMovies(query) {
        const cacheKey = `search_movies_${query.toLowerCase()}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // For demo purposes, return mock data based on common soundtrack movies
        // In production, this would make actual API calls
        const mockResults = this.getMockMovieResults(query);
        
        // Cache results for 1 hour
        this.cache.set(cacheKey, mockResults);
        setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        
        return mockResults;
    }

    /**
     * Get detailed movie information including soundtrack data
     * @param {number} movieId - TMDB movie ID
     * @returns {Promise<Object|null>} Movie details with soundtrack info
     */
    async getMovieDetails(movieId) {
        const cacheKey = `movie_details_${movieId}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Mock detailed movie data
        const movieDetails = this.getMockMovieDetails(movieId);
        
        if (movieDetails) {
            this.cache.set(cacheKey, movieDetails);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        }
        
        return movieDetails;
    }

    /**
     * Get soundtrack information for a specific movie
     * @param {string} movieTitle - Movie title
     * @returns {Promise<Object|null>} Soundtrack information
     */
    async getMovieSoundtrack(movieTitle) {
        const cacheKey = `soundtrack_${movieTitle.toLowerCase()}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const soundtrackData = this.generateSoundtrackData(movieTitle);
        
        if (soundtrackData) {
            this.cache.set(cacheKey, soundtrackData);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        }
        
        return soundtrackData;
    }

    /**
     * Get movies by genre suitable for board game themes
     * @param {string} genre - Genre name (fantasy, horror, sci-fi, etc.)
     * @returns {Promise<Array>} Array of movies in the genre
     */
    async getMoviesByGenre(genre) {
        const cacheKey = `genre_${genre.toLowerCase()}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const genreMovies = this.getMockGenreMovies(genre);
        
        this.cache.set(cacheKey, genreMovies);
        setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        
        return genreMovies;
    }

    /**
     * Mock movie search results based on query
     * In production, this would call the actual TMDB API
     */
    getMockMovieResults(query) {
        const normalizedQuery = query.toLowerCase();
        
        // Mock database of popular soundtrack movies
        const movieDatabase = {
            'lord of the rings': [
                { id: 120, title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, genre: 'Fantasy' },
                { id: 121, title: 'The Lord of the Rings: The Two Towers', year: 2002, genre: 'Fantasy' },
                { id: 122, title: 'The Lord of the Rings: The Return of the King', year: 2003, genre: 'Fantasy' }
            ],
            'star wars': [
                { id: 11, title: 'Star Wars: A New Hope', year: 1977, genre: 'Sci-Fi' },
                { id: 181, title: 'Star Wars: The Empire Strikes Back', year: 1980, genre: 'Sci-Fi' },
                { id: 183, title: 'Star Wars: Return of the Jedi', year: 1983, genre: 'Sci-Fi' }
            ],
            'harry potter': [
                { id: 671, title: 'Harry Potter and the Philosopher\'s Stone', year: 2001, genre: 'Fantasy' },
                { id: 672, title: 'Harry Potter and the Chamber of Secrets', year: 2002, genre: 'Fantasy' },
                { id: 673, title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, genre: 'Fantasy' }
            ],
            'pirates': [
                { id: 285, title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003, genre: 'Adventure' }
            ],
            'indiana jones': [
                { id: 85, title: 'Raiders of the Lost Ark', year: 1981, genre: 'Adventure' },
                { id: 87, title: 'Indiana Jones and the Temple of Doom', year: 1984, genre: 'Adventure' }
            ],
            'blade runner': [
                { id: 78, title: 'Blade Runner', year: 1982, genre: 'Sci-Fi' },
                { id: 335984, title: 'Blade Runner 2049', year: 2017, genre: 'Sci-Fi' }
            ],
            'interstellar': [
                { id: 157336, title: 'Interstellar', year: 2014, genre: 'Sci-Fi' }
            ],
            'inception': [
                { id: 27205, title: 'Inception', year: 2010, genre: 'Sci-Fi' }
            ],
            'dark knight': [
                { id: 155, title: 'The Dark Knight', year: 2008, genre: 'Action' }
            ]
        };

        // Find matching movies
        let results = [];
        for (const [key, movies] of Object.entries(movieDatabase)) {
            if (key.includes(normalizedQuery) || normalizedQuery.includes(key.split(' ')[0])) {
                results.push(...movies);
            }
        }

        return results.slice(0, 10); // Limit to 10 results
    }

    /**
     * Get mock detailed movie information
     */
    getMockMovieDetails(movieId) {
        const detailsDatabase = {
            120: {
                id: 120,
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                year: 2001,
                genre: 'Fantasy',
                composer: 'Howard Shore',
                runtime: 178,
                description: 'Epic fantasy adventure with iconic orchestral score',
                soundtrack_highlights: [
                    'Concerning Hobbits',
                    'The Ring Goes South',
                    'A Knife in the Dark',
                    'The Bridge of Khazad Dum',
                    'May It Be'
                ]
            },
            11: {
                id: 11,
                title: 'Star Wars: A New Hope',
                year: 1977,
                genre: 'Sci-Fi',
                composer: 'John Williams',
                runtime: 121,
                description: 'Space opera with legendary orchestral themes',
                soundtrack_highlights: [
                    'Main Title',
                    'Imperial March',
                    'Princess Leia\'s Theme',
                    'The Force Theme',
                    'Throne Room and End Title'
                ]
            },
            78: {
                id: 78,
                title: 'Blade Runner',
                year: 1982,
                genre: 'Sci-Fi',
                composer: 'Vangelis',
                runtime: 117,
                description: 'Cyberpunk masterpiece with electronic synthesizer score',
                soundtrack_highlights: [
                    'Main Titles',
                    'Blush Response',
                    'Wait for Me',
                    'Rachel\'s Song',
                    'Tears in Rain'
                ]
            }
        };

        return detailsDatabase[movieId] || null;
    }

    /**
     * Generate soundtrack data for a movie
     */
    generateSoundtrackData(movieTitle) {
        const soundtrackTemplates = {
            fantasy: {
                mood: 'Epic and mystical',
                tracks: ['Main Theme', 'The Journey Begins', 'Magic and Wonder', 'Battle Theme', 'Victory and Hope'],
                tempo: 'Moderate to Fast',
                instrumentation: 'Full Orchestra with Choir'
            },
            scifi: {
                mood: 'Futuristic and atmospheric',
                tracks: ['Space Theme', 'Technology', 'Alien Contact', 'Future Vision', 'Final Frontier'],
                tempo: 'Varied',
                instrumentation: 'Electronic Synthesizers and Orchestra'
            },
            horror: {
                mood: 'Dark and suspenseful',
                tracks: ['Ominous Beginning', 'Building Tension', 'The Horror Revealed', 'Chase Scene', 'Final Confrontation'],
                tempo: 'Slow to Fast',
                instrumentation: 'Strings, Percussion, and Sound Effects'
            },
            adventure: {
                mood: 'Exciting and heroic',
                tracks: ['Adventure Theme', 'The Quest', 'Heroic Moment', 'Action Sequence', 'Triumphant Return'],
                tempo: 'Moderate to Fast',
                instrumentation: 'Full Orchestra with Brass Section'
            }
        };

        // Determine genre based on movie title keywords
        const title = movieTitle.toLowerCase();
        let genre = 'adventure'; // default
        
        if (title.includes('lord of the rings') || title.includes('harry potter') || title.includes('dragon')) {
            genre = 'fantasy';
        } else if (title.includes('star wars') || title.includes('blade runner') || title.includes('alien')) {
            genre = 'scifi';
        } else if (title.includes('halloween') || title.includes('exorcist') || title.includes('horror')) {
            genre = 'horror';
        }

        const template = soundtrackTemplates[genre];
        
        return {
            movie: movieTitle,
            genre: genre,
            composer: 'Various Artists', // Could be enhanced with real composer data
            ...template,
            gameplayFit: `Perfect for ${genre} themed board games`,
            duration: '45-60 minutes of curated tracks'
        };
    }

    /**
     * Get movies by genre for theme-based recommendations
     */
    getMockGenreMovies(genre) {
        const genreMovies = {
            fantasy: [
                'The Lord of the Rings: The Fellowship of the Ring',
                'Harry Potter and the Philosopher\'s Stone',
                'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe',
                'The Hobbit: An Unexpected Journey',
                'Game of Thrones',
                'The Princess Bride'
            ],
            scifi: [
                'Star Wars: A New Hope',
                'Blade Runner',
                'Interstellar',
                'The Matrix',
                'Alien',
                'Star Trek',
                'Tron: Legacy'
            ],
            horror: [
                'Halloween',
                'The Exorcist',
                'Psycho',
                'The Shining',
                'Jaws',
                'The Conjuring',
                'Sinister'
            ],
            adventure: [
                'Indiana Jones: Raiders of the Lost Ark',
                'Pirates of the Caribbean: The Curse of the Black Pearl',
                'The Mummy',
                'National Treasure',
                'Tomb Raider',
                'The Goonies'
            ],
            mystery: [
                'Sherlock Holmes',
                'Murder on the Orient Express',
                'The Maltese Falcon',
                'Knives Out',
                'Gone Girl',
                'The Girl with the Dragon Tattoo'
            ]
        };

        return genreMovies[genre.toLowerCase()] || [];
    }

    /**
     * Enhance existing game suggestions with dynamic movie data
     * @param {Object} gameData - Existing game data from local database
     * @returns {Promise<Object>} Enhanced game data with API movie information
     */
    async enhanceGameSuggestions(gameData) {
        if (!gameData || !gameData.suggestedSoundtracks) {
            return gameData;
        }

        // Enhance each soundtrack suggestion with API data
        const enhancedSoundtracks = await Promise.all(
            gameData.suggestedSoundtracks.map(async (soundtrack) => {
                try {
                    const movieDetails = await this.getMovieSoundtrack(soundtrack.movie);
                    return {
                        ...soundtrack,
                        enhanced: movieDetails || {},
                        apiSource: !!movieDetails
                    };
                } catch (error) {
                    console.warn(`Failed to enhance ${soundtrack.movie}:`, error);
                    return soundtrack;
                }
            })
        );

        return {
            ...gameData,
            suggestedSoundtracks: enhancedSoundtracks,
            enhanced: true,
            lastUpdated: new Date().toISOString()
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovieApiService;
}