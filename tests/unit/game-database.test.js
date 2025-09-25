/**
 * Unit tests for the Board Game Database
 * Tests the structure, integrity, and content of the game-soundtrack database
 */

// Import the database
const fs = require('fs');
const path = require('path');

// Load the game database file content
const gameDataPath = path.join(__dirname, '../../game-soundtrack-data.js');
const gameDataContent = fs.readFileSync(gameDataPath, 'utf8');

// Execute the content to get the database objects
eval(gameDataContent);

describe('Board Game Database', () => {
  describe('BOARD_GAMES_DATABASE Structure', () => {
    test('should be defined and be an object', () => {
      expect(BOARD_GAMES_DATABASE).toBeDefined();
      expect(typeof BOARD_GAMES_DATABASE).toBe('object');
      expect(BOARD_GAMES_DATABASE).not.toBeNull();
    });

    test('should contain expected number of games', () => {
      const gameCount = Object.keys(BOARD_GAMES_DATABASE).length;
      expect(gameCount).toBeGreaterThan(15); // Expect at least 15+ games
      expect(gameCount).toBeLessThan(50); // But not an unreasonable amount
    });

    test('should have games with all required properties', () => {
      Object.entries(BOARD_GAMES_DATABASE).forEach(([gameName, gameData]) => {
        expect(gameData).toHaveProperty('category');
        expect(gameData).toHaveProperty('themes');
        expect(gameData).toHaveProperty('suggestedSoundtracks');
        
        expect(typeof gameData.category).toBe('string');
        expect(Array.isArray(gameData.themes)).toBe(true);
        expect(Array.isArray(gameData.suggestedSoundtracks)).toBe(true);
      });
    });

    test('should have soundtracks with proper structure', () => {
      Object.entries(BOARD_GAMES_DATABASE).forEach(([gameName, gameData]) => {
        gameData.suggestedSoundtracks.forEach(soundtrack => {
          expect(soundtrack).toHaveProperty('movie');
          expect(soundtrack).toHaveProperty('reason');
          expect(soundtrack).toHaveProperty('tracks');
          
          expect(typeof soundtrack.movie).toBe('string');
          expect(typeof soundtrack.reason).toBe('string');
          expect(Array.isArray(soundtrack.tracks)).toBe(true);
          expect(soundtrack.tracks.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Specific Game Entries', () => {
    test('should contain popular games', () => {
      const expectedGames = [
        'Gloomhaven',
        'Settlers of Catan',
        'Pandemic',
        'Ticket to Ride',
        'Scythe'
      ];
      
      expectedGames.forEach(gameName => {
        expect(BOARD_GAMES_DATABASE).toHaveProperty(gameName);
      });
    });

    test('Gloomhaven should have correct data structure', () => {
      const gloomhaven = BOARD_GAMES_DATABASE['Gloomhaven'];
      
      expect(gloomhaven.category).toBe('adventure');
      expect(gloomhaven.themes).toContain('fantasy');
      expect(gloomhaven.themes).toContain('combat');
      expect(gloomhaven.suggestedSoundtracks).toHaveLength(3);
    });

    test('Pandemic should have crisis-appropriate themes', () => {
      const pandemic = BOARD_GAMES_DATABASE['Pandemic'];
      
      expect(pandemic.category).toBe('cooperative');
      expect(pandemic.themes).toContain('tension');
      expect(pandemic.themes).toContain('urgency');
      expect(pandemic.themes).toContain('crisis');
    });
  });

  describe('MOVIE_SOUNDTRACK_CATEGORIES', () => {
    test('should be defined with expected categories', () => {
      expect(MOVIE_SOUNDTRACK_CATEGORIES).toBeDefined();
      
      const expectedCategories = ['adventure', 'fantasy', 'scifi', 'horror', 'mystery', 'epic'];
      expectedCategories.forEach(category => {
        expect(MOVIE_SOUNDTRACK_CATEGORIES).toHaveProperty(category);
      });
    });

    test('each category should have required properties', () => {
      Object.entries(MOVIE_SOUNDTRACK_CATEGORIES).forEach(([categoryName, categoryData]) => {
        expect(categoryData).toHaveProperty('name');
        expect(categoryData).toHaveProperty('icon');
        expect(categoryData).toHaveProperty('movies');
        
        expect(typeof categoryData.name).toBe('string');
        expect(typeof categoryData.icon).toBe('string');
        expect(Array.isArray(categoryData.movies)).toBe(true);
        expect(categoryData.movies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('THEME_TO_GENRE_MAPPING', () => {
    test('should be defined and map themes to genres', () => {
      expect(THEME_TO_GENRE_MAPPING).toBeDefined();
      
      // Test some expected mappings
      expect(THEME_TO_GENRE_MAPPING['fantasy']).toContain('fantasy');
      expect(THEME_TO_GENRE_MAPPING['horror']).toContain('horror');
      expect(THEME_TO_GENRE_MAPPING['medieval']).toContain('fantasy');
    });
  });

  describe('MOOD_BASED_SUGGESTIONS', () => {
    test('should contain expected moods', () => {
      expect(MOOD_BASED_SUGGESTIONS).toBeDefined();
      
      const expectedMoods = ['relaxed', 'tense', 'epic', 'mysterious'];
      expectedMoods.forEach(mood => {
        expect(MOOD_BASED_SUGGESTIONS).toHaveProperty(mood);
      });
    });

    test('each mood should have proper structure', () => {
      Object.entries(MOOD_BASED_SUGGESTIONS).forEach(([moodName, moodData]) => {
        expect(moodData).toHaveProperty('description');
        expect(moodData).toHaveProperty('soundtracks');
        
        expect(typeof moodData.description).toBe('string');
        expect(Array.isArray(moodData.soundtracks)).toBe(true);
        
        moodData.soundtracks.forEach(soundtrack => {
          expect(soundtrack).toHaveProperty('movie');
          expect(soundtrack).toHaveProperty('tracks');
          expect(Array.isArray(soundtrack.tracks)).toBe(true);
        });
      });
    });
  });

  describe('Data Consistency', () => {
    test('all game categories should be valid', () => {
      const validCategories = [
        'strategy', 'adventure', 'cooperative', 'horror', 'mystery', 
        'abstract', 'survival', 'classic', 'dice'
      ];
      
      Object.entries(BOARD_GAMES_DATABASE).forEach(([gameName, gameData]) => {
        expect(validCategories).toContain(gameData.category);
      });
    });

    test('theme consistency across games', () => {
      const allThemes = new Set();
      
      Object.values(BOARD_GAMES_DATABASE).forEach(gameData => {
        gameData.themes.forEach(theme => allThemes.add(theme));
      });
      
      // Ensure we have a reasonable variety of themes
      expect(allThemes.size).toBeGreaterThan(10);
      
      // Check for some expected common themes
      expect(allThemes.has('fantasy')).toBe(true);
      expect(allThemes.has('adventure')).toBe(true);
      expect(allThemes.has('strategy')).toBe(true);
    });

    test('no duplicate movie suggestions within games', () => {
      Object.entries(BOARD_GAMES_DATABASE).forEach(([gameName, gameData]) => {
        const movieTitles = gameData.suggestedSoundtracks.map(s => s.movie);
        const uniqueMovies = new Set(movieTitles);
        
        expect(uniqueMovies.size).toBe(movieTitles.length);
      });
    });
  });
});