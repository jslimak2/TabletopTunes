/**
 * Movie Database API Service
 * Integrates with The Movie Database (TMDB) API to fetch movie information
 * and supplement the hardcoded soundtrack data with dynamic content
 */

class MovieApiService {
    constructor() {
        // TMDB API key - can be set via environment variable or config
        // Get free API key from https://www.themoviedb.org/settings/api
        this.apiKey = this.getApiKey();
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.cache = new Map();
        this.rateLimitDelay = 250; // 4 requests per second limit
        this.lastRequestTime = 0;
        this.useMockData = !this.apiKey || this.apiKey === 'demo_key';
        
        // Genre ID mapping from TMDB
        this.genreMap = {
            28: 'Action',
            12: 'Adventure',
            16: 'Animation',
            35: 'Comedy',
            80: 'Crime',
            99: 'Documentary',
            18: 'Drama',
            10751: 'Family',
            14: 'Fantasy',
            36: 'History',
            27: 'Horror',
            10402: 'Music',
            9648: 'Mystery',
            10749: 'Romance',
            878: 'Science Fiction',
            10770: 'TV Movie',
            53: 'Thriller',
            10752: 'War',
            37: 'Western'
        };
    }
    
    /**
     * Get API key from various sources
     * @returns {string} API key or demo key
     */
    getApiKey() {
        // Check environment variable (for Node.js backend)
        if (typeof process !== 'undefined' && process.env && process.env.TMDB_API_KEY) {
            return process.env.TMDB_API_KEY;
        }
        
        // Check localStorage (for browser)
        if (typeof localStorage !== 'undefined') {
            const storedKey = localStorage.getItem('tmdb_api_key');
            if (storedKey) return storedKey;
        }
        
        // Default demo key (will use mock data)
        return 'demo_key';
    }
    
    /**
     * Set API key dynamically
     * @param {string} apiKey - TMDB API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.useMockData = !apiKey || apiKey === 'demo_key';
        
        // Store in localStorage if available
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('tmdb_api_key', apiKey);
        }
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

        // Use real API if available, otherwise fall back to mock data
        let results;
        if (this.useMockData) {
            results = this.getMockMovieResults(query);
        } else {
            try {
                await this.respectRateLimit();
                
                const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`TMDB API error: ${response.status}`);
                }
                
                const data = await response.json();
                results = data.results.map(movie => ({
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                    overview: movie.overview,
                    genres: movie.genre_ids.map(id => this.genreMap[id]).filter(Boolean),
                    popularity: movie.popularity,
                    voteAverage: movie.vote_average,
                    posterPath: movie.poster_path
                }));
            } catch (error) {
                console.warn('TMDB API call failed, using mock data:', error);
                results = this.getMockMovieResults(query);
            }
        }
        
        // Cache results for 1 hour
        this.cache.set(cacheKey, results);
        setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        
        return results;
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

        let movieDetails;
        if (this.useMockData) {
            movieDetails = this.getMockMovieDetails(movieId);
        } else {
            try {
                await this.respectRateLimit();
                
                const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&append_to_response=keywords,credits`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`TMDB API error: ${response.status}`);
                }
                
                const data = await response.json();
                movieDetails = {
                    id: data.id,
                    title: data.title,
                    year: data.release_date ? new Date(data.release_date).getFullYear() : null,
                    genre: data.genres.map(g => g.name).join(', '),
                    genres: data.genres.map(g => ({ id: g.id, name: g.name })),
                    overview: data.overview,
                    tagline: data.tagline,
                    runtime: data.runtime,
                    composer: this.extractComposer(data.credits),
                    description: data.overview,
                    popularity: data.popularity,
                    voteAverage: data.vote_average,
                    keywords: data.keywords ? data.keywords.keywords.map(k => k.name) : [],
                    posterPath: data.poster_path,
                    backdropPath: data.backdrop_path
                };
            } catch (error) {
                console.warn('TMDB API call failed, using mock data:', error);
                movieDetails = this.getMockMovieDetails(movieId);
            }
        }
        
        if (movieDetails) {
            this.cache.set(cacheKey, movieDetails);
            setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
        }
        
        return movieDetails;
    }
    
    /**
     * Extract composer from movie credits
     * @param {Object} credits - Movie credits data
     * @returns {string} Composer name or 'Various Artists'
     */
    extractComposer(credits) {
        if (!credits || !credits.crew) return 'Various Artists';
        
        const composer = credits.crew.find(person => 
            person.job === 'Original Music Composer' || 
            person.job === 'Music' ||
            person.department === 'Sound'
        );
        
        return composer ? composer.name : 'Various Artists';
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

        let genreMovies;
        if (this.useMockData) {
            genreMovies = this.getMockGenreMovies(genre);
        } else {
            try {
                // Map genre names to TMDB genre IDs
                const genreIdMap = {
                    'fantasy': 14,
                    'scifi': 878,
                    'horror': 27,
                    'adventure': 12,
                    'mystery': 9648,
                    'war': 10752,
                    'action': 28
                };
                
                const genreId = genreIdMap[genre.toLowerCase()];
                if (!genreId) {
                    genreMovies = this.getMockGenreMovies(genre);
                } else {
                    await this.respectRateLimit();
                    
                    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=100`;
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`TMDB API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    genreMovies = data.results.slice(0, 20).map(movie => ({
                        id: movie.id,
                        title: movie.title,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
                        overview: movie.overview,
                        popularity: movie.popularity
                    }));
                }
            } catch (error) {
                console.warn('TMDB API call failed, using mock data:', error);
                genreMovies = this.getMockGenreMovies(genre);
            }
        }
        
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
    
    /**
     * Build comprehensive movie database for ML matching
     * Fetches popular movies across multiple genres suitable for soundtracks
     * @returns {Promise<Array>} Array of movies with full details
     */
    async buildMovieDatabase() {
        const cacheKey = 'movie_database_full';
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const genres = ['fantasy', 'scifi', 'horror', 'adventure', 'mystery', 'war', 'action'];
        const allMovies = [];
        const seenIds = new Set();
        
        try {
            // Fetch movies for each genre
            for (const genre of genres) {
                const genreMovies = await this.getMoviesByGenre(genre);
                
                // Get full details for each movie
                for (const movie of genreMovies.slice(0, 10)) { // Limit to top 10 per genre
                    if (!seenIds.has(movie.id)) {
                        seenIds.add(movie.id);
                        
                        try {
                            const details = await this.getMovieDetails(movie.id);
                            if (details) {
                                allMovies.push(details);
                            }
                        } catch (error) {
                            console.warn(`Failed to get details for movie ${movie.id}:`, error);
                        }
                    }
                }
            }
            
            // Cache the database for 24 hours
            this.cache.set(cacheKey, allMovies);
            setTimeout(() => this.cache.delete(cacheKey), 24 * 60 * 60 * 1000);
            
            return allMovies;
        } catch (error) {
            console.error('Failed to build movie database:', error);
            return this.getMockMovieDatabase();
        }
    }
    
    /**
     * Get a mock movie database for offline/demo use
     * @returns {Array} Mock movie database
     */
    getMockMovieDatabase() {
        return [
            {
                id: 120,
                title: 'The Lord of the Rings: The Fellowship of the Ring',
                year: 2001,
                genres: [{ name: 'Fantasy' }, { name: 'Adventure' }],
                overview: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
                tagline: 'One ring to rule them all',
                composer: 'Howard Shore',
                keywords: ['fantasy', 'ring', 'fellowship', 'hobbit', 'quest', 'epic']
            },
            {
                id: 11,
                title: 'Star Wars',
                year: 1977,
                genres: [{ name: 'Science Fiction' }, { name: 'Adventure' }],
                overview: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire\'s world-destroying battle station.',
                tagline: 'A long time ago in a galaxy far, far away...',
                composer: 'John Williams',
                keywords: ['space', 'rebellion', 'force', 'empire', 'hero']
            },
            {
                id: 27205,
                title: 'Inception',
                year: 2010,
                genres: [{ name: 'Science Fiction' }, { name: 'Thriller' }],
                overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                tagline: 'Your mind is the scene of the crime',
                composer: 'Hans Zimmer',
                keywords: ['dreams', 'heist', 'reality', 'mind', 'thriller']
            },
            // Add more mock entries as needed
        ];
    }
    
    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovieApiService;
}