/**
 * ML/NLP Matching Service
 * Advanced board game to movie soundtrack matching using natural language processing
 * and semantic similarity algorithms
 */

class MLMatchingService {
    constructor() {
        this.cache = new Map();
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        ]);
        
        // Theme/genre keywords for semantic matching
        this.themeKeywords = {
            fantasy: ['magic', 'wizard', 'dragon', 'fantasy', 'medieval', 'knight', 'castle', 'sword', 'quest', 'dungeon', 'elf', 'dwarf', 'orc', 'spell', 'enchanted', 'mythical', 'legendary'],
            scifi: ['space', 'alien', 'future', 'robot', 'technology', 'cyber', 'galactic', 'star', 'planet', 'science', 'futuristic', 'android', 'spaceship', 'laser', 'AI', 'virtual'],
            horror: ['horror', 'scary', 'dark', 'evil', 'monster', 'zombie', 'vampire', 'ghost', 'haunted', 'curse', 'demon', 'terror', 'fear', 'nightmare', 'supernatural', 'undead'],
            adventure: ['adventure', 'explore', 'journey', 'quest', 'expedition', 'discover', 'treasure', 'hero', 'travel', 'danger', 'challenge', 'mission', 'voyage'],
            war: ['war', 'battle', 'combat', 'military', 'army', 'soldier', 'conflict', 'warfare', 'tactical', 'strategy', 'campaign', 'invasion'],
            mystery: ['mystery', 'detective', 'investigation', 'crime', 'clue', 'puzzle', 'secret', 'hidden', 'solve', 'enigma', 'suspense'],
            historical: ['history', 'historical', 'ancient', 'medieval', 'renaissance', 'empire', 'civilization', 'era', 'dynasty', 'classical'],
            cooperative: ['cooperative', 'team', 'together', 'alliance', 'united', 'collaborative', 'group', 'collective'],
            competitive: ['competitive', 'versus', 'opponent', 'rival', 'contest', 'compete', 'challenge', 'winner'],
            economic: ['economic', 'trade', 'merchant', 'business', 'market', 'resource', 'commerce', 'money', 'wealth'],
            survival: ['survival', 'survive', 'apocalypse', 'disaster', 'crisis', 'emergency', 'desperate', 'struggle']
        };
        
        // Movie genre to theme mapping for reverse lookup
        this.movieGenreToTheme = {
            'Fantasy': 'fantasy',
            'Science Fiction': 'scifi',
            'Horror': 'horror',
            'Adventure': 'adventure',
            'Action': 'adventure',
            'War': 'war',
            'Mystery': 'mystery',
            'Thriller': 'mystery',
            'History': 'historical',
            'Drama': 'historical'
        };
    }

    /**
     * Main matching function - finds best movie soundtracks for a board game
     * @param {Object} gameData - BGG game data with description, categories, mechanics
     * @param {Array} movieDatabase - Array of movie data from TMDB
     * @returns {Promise<Array>} Sorted array of movie matches with scores
     */
    async matchGameToMovies(gameData, movieDatabase) {
        const cacheKey = `match_${gameData.id || gameData.name}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Extract and process game features
        const gameFeatures = this.extractGameFeatures(gameData);
        
        // Calculate similarity scores for each movie
        const movieScores = await Promise.all(
            movieDatabase.map(async movie => {
                const score = await this.calculateSimilarityScore(gameFeatures, movie);
                return {
                    movie: movie,
                    score: score,
                    matchReasons: this.generateMatchReasons(gameFeatures, movie, score)
                };
            })
        );
        
        // Sort by score and take top matches
        const topMatches = movieScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .filter(match => match.score > 0.3); // Minimum threshold
        
        // Cache results
        this.cache.set(cacheKey, topMatches);
        setTimeout(() => this.cache.delete(cacheKey), 30 * 60 * 1000); // 30 min cache
        
        return topMatches;
    }

    /**
     * Extract meaningful features from game data
     * @param {Object} gameData - Raw game data from BGG
     * @returns {Object} Processed features
     */
    extractGameFeatures(gameData) {
        const description = (gameData.description || '').toLowerCase();
        const categories = (gameData.categories || []).map(c => c.toLowerCase());
        const mechanics = (gameData.mechanisms || gameData.mechanics || []).map(m => m.toLowerCase());
        
        // Tokenize and clean description
        const tokens = this.tokenize(description);
        const cleanedTokens = tokens.filter(token => !this.stopWords.has(token));
        
        // Extract themes from all sources
        const themes = this.extractThemes(cleanedTokens, categories, mechanics);
        
        // Calculate TF-IDF-like weights for key terms
        const termWeights = this.calculateTermWeights(cleanedTokens);
        
        return {
            description: description,
            tokens: cleanedTokens,
            categories: categories,
            mechanics: mechanics,
            themes: themes,
            termWeights: termWeights,
            name: gameData.name || ''
        };
    }

    /**
     * Tokenize text into words
     * @param {string} text - Input text
     * @returns {Array<string>} Array of tokens
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2);
    }

    /**
     * Extract themes from game data
     * @param {Array} tokens - Cleaned tokens from description
     * @param {Array} categories - Game categories
     * @param {Array} mechanics - Game mechanics
     * @returns {Object} Theme scores
     */
    extractThemes(tokens, categories, mechanics) {
        const themeScores = {};
        
        // Check each theme
        for (const [theme, keywords] of Object.entries(this.themeKeywords)) {
            let score = 0;
            
            // Check tokens
            for (const token of tokens) {
                for (const keyword of keywords) {
                    if (token.includes(keyword) || keyword.includes(token)) {
                        score += 2;
                    }
                }
            }
            
            // Check categories
            for (const category of categories) {
                for (const keyword of keywords) {
                    if (category.includes(keyword) || keyword.includes(category)) {
                        score += 3;
                    }
                }
            }
            
            // Check mechanics
            for (const mechanic of mechanics) {
                for (const keyword of keywords) {
                    if (mechanic.includes(keyword) || keyword.includes(mechanic)) {
                        score += 1;
                    }
                }
            }
            
            if (score > 0) {
                themeScores[theme] = score;
            }
        }
        
        return themeScores;
    }

    /**
     * Calculate term weights (simplified TF-IDF)
     * @param {Array} tokens - Cleaned tokens
     * @returns {Object} Term weights
     */
    calculateTermWeights(tokens) {
        const termFreq = {};
        
        // Calculate term frequency
        for (const token of tokens) {
            termFreq[token] = (termFreq[token] || 0) + 1;
        }
        
        // Normalize by document length
        const maxFreq = Math.max(...Object.values(termFreq));
        const weights = {};
        
        for (const [term, freq] of Object.entries(termFreq)) {
            weights[term] = freq / maxFreq;
        }
        
        return weights;
    }

    /**
     * Calculate similarity score between game and movie
     * @param {Object} gameFeatures - Processed game features
     * @param {Object} movie - Movie data from TMDB
     * @returns {Promise<number>} Similarity score (0-1)
     */
    async calculateSimilarityScore(gameFeatures, movie) {
        let totalScore = 0;
        let weights = [];
        
        // 1. Theme/Genre matching (30% weight)
        const genreScore = this.calculateGenreScore(gameFeatures.themes, movie.genres || []);
        totalScore += genreScore * 0.3;
        weights.push('genre');
        
        // 2. Description similarity (40% weight)
        const descScore = this.calculateTextSimilarity(
            gameFeatures.tokens,
            this.tokenize(movie.overview || '')
        );
        totalScore += descScore * 0.4;
        weights.push('description');
        
        // 3. Keyword matching (20% weight)
        const keywordScore = this.calculateKeywordScore(
            gameFeatures.termWeights,
            movie.overview || '',
            movie.tagline || ''
        );
        totalScore += keywordScore * 0.2;
        weights.push('keywords');
        
        // 4. Mood/Tone matching (10% weight)
        const moodScore = this.calculateMoodScore(gameFeatures, movie);
        totalScore += moodScore * 0.1;
        weights.push('mood');
        
        return Math.min(totalScore, 1.0);
    }

    /**
     * Calculate genre/theme similarity
     * @param {Object} gameThemes - Game theme scores
     * @param {Array} movieGenres - Movie genre strings
     * @returns {number} Genre similarity score
     */
    calculateGenreScore(gameThemes, movieGenres) {
        if (Object.keys(gameThemes).length === 0 || movieGenres.length === 0) {
            return 0;
        }
        
        let matchScore = 0;
        const totalGameThemes = Object.values(gameThemes).reduce((a, b) => a + b, 0);
        
        for (const genre of movieGenres) {
            const themeKey = this.movieGenreToTheme[genre];
            if (themeKey && gameThemes[themeKey]) {
                matchScore += gameThemes[themeKey] / totalGameThemes;
            }
        }
        
        return Math.min(matchScore, 1.0);
    }

    /**
     * Calculate text similarity using Jaccard similarity and cosine similarity
     * @param {Array} tokens1 - First set of tokens
     * @param {Array} tokens2 - Second set of tokens
     * @returns {number} Similarity score
     */
    calculateTextSimilarity(tokens1, tokens2) {
        if (tokens1.length === 0 || tokens2.length === 0) {
            return 0;
        }
        
        // Jaccard similarity
        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        const jaccard = intersection.size / union.size;
        
        // Simple cosine similarity based on term overlap
        const commonTerms = intersection.size;
        const cosine = commonTerms / Math.sqrt(tokens1.length * tokens2.length);
        
        // Average of both metrics
        return (jaccard + cosine) / 2;
    }

    /**
     * Calculate keyword matching score
     * @param {Object} gameTermWeights - Weighted game terms
     * @param {string} movieOverview - Movie overview text
     * @param {string} movieTagline - Movie tagline
     * @returns {number} Keyword score
     */
    calculateKeywordScore(gameTermWeights, movieOverview, movieTagline) {
        const movieText = (movieOverview + ' ' + movieTagline).toLowerCase();
        const movieTokens = this.tokenize(movieText);
        
        let matchScore = 0;
        let totalWeight = 0;
        
        for (const [term, weight] of Object.entries(gameTermWeights)) {
            totalWeight += weight;
            if (movieTokens.some(token => token.includes(term) || term.includes(token))) {
                matchScore += weight;
            }
        }
        
        return totalWeight > 0 ? matchScore / totalWeight : 0;
    }

    /**
     * Calculate mood/tone similarity
     * @param {Object} gameFeatures - Game features
     * @param {Object} movie - Movie data
     * @returns {number} Mood score
     */
    calculateMoodScore(gameFeatures, movie) {
        // Simplified mood detection based on keywords
        const darkMoodKeywords = ['dark', 'horror', 'evil', 'death', 'war', 'conflict', 'fear'];
        const lightMoodKeywords = ['fun', 'family', 'party', 'friendly', 'casual', 'light'];
        const epicMoodKeywords = ['epic', 'grand', 'legendary', 'adventure', 'quest', 'hero'];
        
        const gameText = gameFeatures.description;
        const movieText = (movie.overview || '').toLowerCase();
        
        let gameMood = this.detectMood(gameText, darkMoodKeywords, lightMoodKeywords, epicMoodKeywords);
        let movieMood = this.detectMood(movieText, darkMoodKeywords, lightMoodKeywords, epicMoodKeywords);
        
        // Compare moods
        if (gameMood === movieMood) {
            return 1.0;
        } else if ((gameMood === 'dark' && movieMood === 'epic') || 
                   (gameMood === 'epic' && movieMood === 'dark')) {
            return 0.5;
        }
        
        return 0.3;
    }

    /**
     * Detect mood from text
     * @param {string} text - Input text
     * @param {Array} darkKeywords - Dark mood keywords
     * @param {Array} lightKeywords - Light mood keywords
     * @param {Array} epicKeywords - Epic mood keywords
     * @returns {string} Detected mood
     */
    detectMood(text, darkKeywords, lightKeywords, epicKeywords) {
        const tokens = this.tokenize(text);
        
        let darkScore = tokens.filter(t => darkKeywords.some(k => t.includes(k))).length;
        let lightScore = tokens.filter(t => lightKeywords.some(k => t.includes(k))).length;
        let epicScore = tokens.filter(t => epicKeywords.some(k => t.includes(k))).length;
        
        if (darkScore > lightScore && darkScore > epicScore) return 'dark';
        if (lightScore > darkScore && lightScore > epicScore) return 'light';
        if (epicScore > darkScore && epicScore > lightScore) return 'epic';
        
        return 'neutral';
    }

    /**
     * Generate human-readable match reasons
     * @param {Object} gameFeatures - Game features
     * @param {Object} movie - Movie data
     * @param {number} score - Match score
     * @returns {Array<string>} Match reasons
     */
    generateMatchReasons(gameFeatures, movie, score) {
        const reasons = [];
        
        // Theme matches
        const movieGenres = (movie.genres || []).map(g => g.name || g);
        for (const genre of movieGenres) {
            const themeKey = this.movieGenreToTheme[genre];
            if (themeKey && gameFeatures.themes[themeKey]) {
                reasons.push(`${genre} theme matches game's ${themeKey} elements`);
            }
        }
        
        // High-level similarity
        if (score > 0.7) {
            reasons.push('Strong thematic and narrative alignment');
        } else if (score > 0.5) {
            reasons.push('Good thematic compatibility');
        }
        
        // Specific keyword matches
        const movieText = (movie.overview || '').toLowerCase();
        const importantTokens = Object.entries(gameFeatures.termWeights)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([token]) => token);
        
        for (const token of importantTokens) {
            if (movieText.includes(token)) {
                reasons.push(`Key element "${token}" appears in movie description`);
                break; // Only show one keyword reason
            }
        }
        
        return reasons.slice(0, 3); // Limit to top 3 reasons
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
    module.exports = MLMatchingService;
} else if (typeof window !== 'undefined') {
    window.MLMatchingService = MLMatchingService;
}
