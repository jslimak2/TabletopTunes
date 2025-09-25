/**
 * Unit tests for Local Storage functionality
 * Tests user preferences, playlist persistence, and data management
 */

describe('Local Storage Management', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };

    // Mock Storage in global scope
    global.localStorage = mockLocalStorage;
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    jest.clearAllMocks();
  });

  describe('User Preferences Storage', () => {
    test('should save user preferences correctly', () => {
      const preferences = {
        volume: 75,
        shuffle: true,
        loop: false,
        lastCategory: 'fantasy',
        theme: 'dark'
      };

      const savePreferences = (prefs) => {
        localStorage.setItem('tabletopTunes-preferences', JSON.stringify(prefs));
      };

      savePreferences(preferences);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-preferences',
        JSON.stringify(preferences)
      );
    });

    test('should load user preferences correctly', () => {
      const savedPreferences = {
        volume: 80,
        shuffle: false,
        loop: true,
        lastCategory: 'horror',
        theme: 'light'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPreferences));

      const loadPreferences = () => {
        const saved = localStorage.getItem('tabletopTunes-preferences');
        return saved ? JSON.parse(saved) : null;
      };

      const result = loadPreferences();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tabletopTunes-preferences');
      expect(result).toEqual(savedPreferences);
    });

    test('should handle missing preferences gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const loadPreferencesWithDefaults = () => {
        const saved = localStorage.getItem('tabletopTunes-preferences');
        if (saved) {
          return JSON.parse(saved);
        }
        return {
          volume: 70,
          shuffle: false,
          loop: false,
          lastCategory: null,
          theme: 'dark'
        };
      };

      const result = loadPreferencesWithDefaults();

      expect(result.volume).toBe(70);
      expect(result.shuffle).toBe(false);
      expect(result.lastCategory).toBeNull();
    });

    test('should handle corrupted preferences data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json data');

      const loadPreferencesSafely = () => {
        try {
          const saved = localStorage.getItem('tabletopTunes-preferences');
          return saved ? JSON.parse(saved) : null;
        } catch (error) {
          console.warn('Failed to parse preferences:', error);
          return null;
        }
      };

      const result = loadPreferencesSafely();

      expect(result).toBeNull();
    });
  });

  describe('Playlist Storage', () => {
    test('should save playlist correctly', () => {
      const playlist = [
        { name: "Dragon's Lair", duration: "3:45", movie: "Lord of the Rings", category: "fantasy" },
        { name: "Epic Quest", duration: "4:20", movie: "Indiana Jones", category: "adventure" },
        { name: "Haunted Manor", duration: "5:10", movie: "The Conjuring", category: "horror" }
      ];

      const playlistName = 'My Epic Mix';

      const savePlaylist = (name, tracks) => {
        const key = `tabletopTunes-playlist-${name}`;
        localStorage.setItem(key, JSON.stringify(tracks));
      };

      savePlaylist(playlistName, playlist);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-playlist-My Epic Mix',
        JSON.stringify(playlist)
      );
    });

    test('should load playlist correctly', () => {
      const savedPlaylist = [
        { name: "Forest Whispers", duration: "6:30", movie: "Studio Ghibli", category: "ambient" },
        { name: "Ocean Breeze", duration: "4:15", movie: "Moana", category: "ambient" }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPlaylist));

      const loadPlaylist = (name) => {
        const key = `tabletopTunes-playlist-${name}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      };

      const result = loadPlaylist('Chill Mix');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('tabletopTunes-playlist-Chill Mix');
      expect(result).toEqual(savedPlaylist);
    });

    test('should list all saved playlists', () => {
      const mockKeys = [
        'tabletopTunes-preferences',
        'tabletopTunes-playlist-Fantasy Mix',
        'tabletopTunes-playlist-Horror Night',
        'tabletopTunes-playlist-Ambient Chill',
        'other-app-data'
      ];

      // Mock Object.keys for localStorage
      Object.defineProperty(mockLocalStorage, 'length', { value: mockKeys.length });
      mockLocalStorage.key.mockImplementation((index) => mockKeys[index]);

      const getAllPlaylists = () => {
        const playlists = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('tabletopTunes-playlist-')) {
            const name = key.replace('tabletopTunes-playlist-', '');
            playlists.push(name);
          }
        }
        return playlists;
      };

      const result = getAllPlaylists();

      expect(result).toEqual(['Fantasy Mix', 'Horror Night', 'Ambient Chill']);
    });

    test('should delete playlist correctly', () => {
      const deletePlaylist = (name) => {
        const key = `tabletopTunes-playlist-${name}`;
        localStorage.removeItem(key);
      };

      deletePlaylist('Old Mix');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tabletopTunes-playlist-Old Mix');
    });

    test('should handle duplicate playlist names', () => {
      const existingPlaylist = [{ name: "Track 1", duration: "3:00" }];
      const newPlaylist = [{ name: "Track 2", duration: "4:00" }];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPlaylist));

      const savePlaylistWithOverwrite = (name, tracks, overwrite = false) => {
        const key = `tabletopTunes-playlist-${name}`;
        const existing = localStorage.getItem(key);
        
        if (existing && !overwrite) {
          throw new Error('Playlist already exists. Use overwrite=true to replace.');
        }
        
        localStorage.setItem(key, JSON.stringify(tracks));
      };

      // Should throw error without overwrite
      expect(() => {
        savePlaylistWithOverwrite('Existing Mix', newPlaylist);
      }).toThrow('Playlist already exists');

      // Should succeed with overwrite
      expect(() => {
        savePlaylistWithOverwrite('Existing Mix', newPlaylist, true);
      }).not.toThrow();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-playlist-Existing Mix',
        JSON.stringify(newPlaylist)
      );
    });
  });

  describe('Game History Storage', () => {
    test('should save recently searched games', () => {
      const recentGames = ['Gloomhaven', 'Pandemic', 'Scythe', 'Catan'];

      const saveRecentGames = (games) => {
        localStorage.setItem('tabletopTunes-recent-games', JSON.stringify(games));
      };

      saveRecentGames(recentGames);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-recent-games',
        JSON.stringify(recentGames)
      );
    });

    test('should maintain limited history size', () => {
      const addToRecentGames = (newGame, maxHistory = 10) => {
        const saved = localStorage.getItem('tabletopTunes-recent-games');
        let recentGames = saved ? JSON.parse(saved) : [];
        
        // Remove if already exists
        recentGames = recentGames.filter(game => game !== newGame);
        
        // Add to beginning
        recentGames.unshift(newGame);
        
        // Limit size
        if (recentGames.length > maxHistory) {
          recentGames = recentGames.slice(0, maxHistory);
        }
        
        localStorage.setItem('tabletopTunes-recent-games', JSON.stringify(recentGames));
        return recentGames;
      };

      // Mock existing games
      const existingGames = ['Game1', 'Game2', 'Game3'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingGames));

      const result = addToRecentGames('NewGame');

      expect(result).toEqual(['NewGame', 'Game1', 'Game2', 'Game3']);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-recent-games',
        JSON.stringify(['NewGame', 'Game1', 'Game2', 'Game3'])
      );
    });
  });

  describe('App State Storage', () => {
    test('should save current app state', () => {
      const appState = {
        currentCategory: 'fantasy',
        currentTrackIndex: 2,
        isPlaying: true,
        currentBoardGame: 'Gloomhaven',
        activeTab: 'main',
        lastUpdated: Date.now()
      };

      const saveAppState = (state) => {
        localStorage.setItem('tabletopTunes-app-state', JSON.stringify(state));
      };

      saveAppState(appState);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tabletopTunes-app-state',
        JSON.stringify(appState)
      );
    });

    test('should restore app state on load', () => {
      const savedState = {
        currentCategory: 'horror',
        currentTrackIndex: 0,
        isPlaying: false,
        currentBoardGame: 'Betrayal at House on the Hill',
        activeTab: 'spotify',
        lastUpdated: Date.now() - 1000
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const restoreAppState = () => {
        const saved = localStorage.getItem('tabletopTunes-app-state');
        if (saved) {
          const state = JSON.parse(saved);
          // Check if state is not too old (e.g., older than 1 day)
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (Date.now() - state.lastUpdated < oneDayMs) {
            return state;
          }
        }
        return null;
      };

      const result = restoreAppState();

      expect(result).toEqual(savedState);
    });

    test('should ignore stale app state', () => {
      const staleState = {
        currentCategory: 'fantasy',
        lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days old
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(staleState));

      const restoreAppState = () => {
        const saved = localStorage.getItem('tabletopTunes-app-state');
        if (saved) {
          const state = JSON.parse(saved);
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (Date.now() - state.lastUpdated < oneDayMs) {
            return state;
          }
        }
        return null;
      };

      const result = restoreAppState();

      expect(result).toBeNull();
    });
  });

  describe('Data Migration and Cleanup', () => {
    test('should migrate old data format', () => {
      // Mock old format preferences
      const oldFormatData = 'fantasy,75,true,false'; // category,volume,shuffle,loop
      mockLocalStorage.getItem.mockReturnValue(oldFormatData);

      const migratePreferences = () => {
        const saved = localStorage.getItem('tabletopTunes-preferences');
        if (saved && !saved.startsWith('{')) {
          // Old format detected
          const parts = saved.split(',');
          const newFormat = {
            lastCategory: parts[0],
            volume: parseInt(parts[1]) || 70,
            shuffle: parts[2] === 'true',
            loop: parts[3] === 'true',
            theme: 'dark',
            version: '1.0.0'
          };
          localStorage.setItem('tabletopTunes-preferences', JSON.stringify(newFormat));
          return newFormat;
        }
        return saved ? JSON.parse(saved) : null;
      };

      const result = migratePreferences();

      expect(result.lastCategory).toBe('fantasy');
      expect(result.volume).toBe(75);
      expect(result.shuffle).toBe(true);
      expect(result.version).toBe('1.0.0');
    });

    test('should clean up old data', () => {
      const cleanupOldData = () => {
        // Remove data older than version 1.0.0
        const keys = ['old-tabletop-data', 'deprecated-settings'];
        keys.forEach(key => localStorage.removeItem(key));
      };

      cleanupOldData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('old-tabletop-data');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('deprecated-settings');
    });

    test('should handle storage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const saveWithQuotaHandling = (key, data) => {
        try {
          localStorage.setItem(key, data);
          return true;
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            // Clean up old data and try again
            localStorage.removeItem('tabletopTunes-app-state');
            try {
              localStorage.setItem(key, data);
              return true;
            } catch (secondError) {
              console.warn('Unable to save data: storage quota exceeded');
              return false;
            }
          }
          throw error;
        }
      };

      const result = saveWithQuotaHandling('test-key', 'test-data');

      expect(result).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tabletopTunes-app-state');
    });
  });

  describe('Privacy and Security', () => {
    test('should not store sensitive information', () => {
      const sanitizeData = (data) => {
        const sanitized = { ...data };
        // Remove any potentially sensitive keys
        delete sanitized.spotifyAccessToken;
        delete sanitized.userEmail;
        delete sanitized.apiKeys;
        return sanitized;
      };

      const unsafeData = {
        volume: 70,
        spotifyAccessToken: 'secret-token',
        userEmail: 'user@example.com',
        preferences: { theme: 'dark' }
      };

      const result = sanitizeData(unsafeData);

      expect(result.volume).toBe(70);
      expect(result.preferences).toBeDefined();
      expect(result.spotifyAccessToken).toBeUndefined();
      expect(result.userEmail).toBeUndefined();
    });

    test('should validate data before storage', () => {
      const validatePlaylist = (playlist) => {
        if (!Array.isArray(playlist)) return false;
        
        return playlist.every(track => 
          track &&
          typeof track.name === 'string' &&
          typeof track.duration === 'string' &&
          track.name.length > 0 &&
          track.name.length < 200
        );
      };

      const validPlaylist = [
        { name: "Valid Track", duration: "3:45", movie: "Movie" }
      ];

      const invalidPlaylist = [
        { name: "", duration: "3:45" }, // Empty name
        { name: "A".repeat(300), duration: "3:45" } // Too long
      ];

      expect(validatePlaylist(validPlaylist)).toBe(true);
      expect(validatePlaylist(invalidPlaylist)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage not available', () => {
      // Mock localStorage being null (private browsing mode)
      global.localStorage = null;

      const safeLocalStorage = {
        getItem: (key) => {
          try {
            return localStorage ? localStorage.getItem(key) : null;
          } catch (error) {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            if (localStorage) {
              localStorage.setItem(key, value);
              return true;
            }
          } catch (error) {
            console.warn('localStorage not available:', error);
          }
          return false;
        }
      };

      const result1 = safeLocalStorage.getItem('test');
      const result2 = safeLocalStorage.setItem('test', 'value');

      expect(result1).toBeNull();
      expect(result2).toBe(false);
    });

    test('should handle JSON parsing errors', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid{json}');

      const safeJsonParse = (data) => {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.warn('JSON parse error:', error);
          return null;
        }
      };

      const result = safeJsonParse(mockLocalStorage.getItem('test'));

      expect(result).toBeNull();
    });
  });
});