/**
 * Unit tests for TabletopTunes core functionality
 * Tests the main application class methods and state management
 */

// Mock DOM elements before importing the main script
const mockElements = {};

global.document = {
  getElementById: jest.fn((id) => mockElements[id] || {
    addEventListener: jest.fn(),
    style: {},
    classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
    innerHTML: '',
    textContent: '',
    value: ''
  }),
  querySelector: jest.fn(() => ({ addEventListener: jest.fn() })),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn(() => ({
    addEventListener: jest.fn(),
    setAttribute: jest.fn(),
    style: {},
    classList: { add: jest.fn(), remove: jest.fn() }
  }))
};

// Load the game database
const fs = require('fs');
const path = require('path');
const gameDataPath = path.join(__dirname, '../../game-soundtrack-data.js');
eval(fs.readFileSync(gameDataPath, 'utf8'));

// Make BOARD_GAMES_DATABASE available globally
global.BOARD_GAMES_DATABASE = BOARD_GAMES_DATABASE;
global.window = { BOARD_GAMES_DATABASE };

// Load the main script
const scriptPath = path.join(__dirname, '../../script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Create a mock TabletopTunes class by evaluating only the class definition
const classMatch = scriptContent.match(/class TabletopTunes \{[\s\S]*?\n\}/);
if (classMatch) {
  eval(classMatch[0]);
}

describe('TabletopTunes Core Functionality', () => {
  let tabletopTunes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock required DOM elements
    mockElements['audio-player'] = {
      addEventListener: jest.fn(),
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      currentTime: 0,
      duration: 100
    };
    
    // Create a new instance
    tabletopTunes = new TabletopTunes();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with default values', () => {
      expect(tabletopTunes.currentPlaylist).toEqual([]);
      expect(tabletopTunes.currentTrackIndex).toBe(0);
      expect(tabletopTunes.isPlaying).toBe(false);
      expect(tabletopTunes.isShuffle).toBe(false);
      expect(tabletopTunes.isLoop).toBe(false);
      expect(tabletopTunes.currentCategory).toBeNull();
      expect(tabletopTunes.currentBoardGame).toBeNull();
      expect(tabletopTunes.matchingMode).toBe('category');
    });

    test('should have predefined soundtrack categories', () => {
      expect(tabletopTunes.soundtracks).toHaveProperty('ambient');
      expect(tabletopTunes.soundtracks).toHaveProperty('fantasy');
      expect(tabletopTunes.soundtracks).toHaveProperty('scifi');
      expect(tabletopTunes.soundtracks).toHaveProperty('horror');
      expect(tabletopTunes.soundtracks).toHaveProperty('adventure');
      expect(tabletopTunes.soundtracks).toHaveProperty('tavern');
    });

    test('each soundtrack category should have proper structure', () => {
      Object.entries(tabletopTunes.soundtracks).forEach(([category, tracks]) => {
        expect(Array.isArray(tracks)).toBe(true);
        expect(tracks.length).toBeGreaterThan(0);
        
        tracks.forEach(track => {
          expect(track).toHaveProperty('name');
          expect(track).toHaveProperty('duration');
          expect(track).toHaveProperty('url');
          expect(track).toHaveProperty('description');
          expect(track).toHaveProperty('movie');
        });
      });
    });
  });

  describe('Board Game Search Functionality', () => {
    test('searchBoardGame should find exact matches', () => {
      const result = tabletopTunes.searchBoardGame('Gloomhaven');
      
      expect(result).toBeDefined();
      expect(tabletopTunes.currentBoardGame).toBe('Gloomhaven');
      expect(tabletopTunes.matchingMode).toBe('boardgame');
    });

    test('searchBoardGame should handle non-existent games gracefully', () => {
      const result = tabletopTunes.searchBoardGame('NonExistentGame12345');
      
      // Should fall back to theme-based matching
      expect(result).toBeDefined();
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('reason');
    });

    test('getGameFromDatabase should handle exact matches', () => {
      const result = tabletopTunes.getGameFromDatabase('gloomhaven');
      expect(result).toBeDefined();
      expect(result.category).toBe('adventure');
    });

    test('getGameFromDatabase should handle partial matches', () => {
      const result = tabletopTunes.getGameFromDatabase('catan');
      expect(result).toBeDefined();
    });
  });

  describe('Theme Analysis and Matching', () => {
    test('extractAdvancedKeywords should extract meaningful keywords', () => {
      if (typeof tabletopTunes.extractAdvancedKeywords === 'function') {
        const keywords = tabletopTunes.extractAdvancedKeywords('fantasy dragon magic');
        
        expect(Array.isArray(keywords)).toBe(true);
        expect(keywords.length).toBeGreaterThan(0);
      }
    });

    test('suggestByTheme should provide reasonable suggestions', () => {
      const result = tabletopTunes.suggestByTheme('zombie apocalypse survival');
      
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('confidence');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    test('getDefaultRecommendation should return ambient fallback', () => {
      const result = tabletopTunes.getDefaultRecommendation('random input');
      
      expect(result.category).toBe('ambient');
      expect(result.confidence).toBe(40);
      expect(result.tracks).toEqual(tabletopTunes.soundtracks.ambient);
    });
  });

  describe('Playlist Management', () => {
    beforeEach(() => {
      // Set up a sample playlist
      tabletopTunes.currentPlaylist = [
        { name: 'Track 1', duration: '3:30', url: '#' },
        { name: 'Track 2', duration: '4:15', url: '#' },
        { name: 'Track 3', duration: '2:45', url: '#' }
      ];
    });

    test('nextTrack should advance to next track', () => {
      tabletopTunes.currentTrackIndex = 0;
      tabletopTunes.nextTrack();
      
      expect(tabletopTunes.currentTrackIndex).toBe(1);
    });

    test('nextTrack should loop to beginning when at end', () => {
      tabletopTunes.currentTrackIndex = 2;
      tabletopTunes.nextTrack();
      
      expect(tabletopTunes.currentTrackIndex).toBe(0);
    });

    test('previousTrack should go to previous track', () => {
      tabletopTunes.currentTrackIndex = 1;
      tabletopTunes.previousTrack();
      
      expect(tabletopTunes.currentTrackIndex).toBe(0);
    });

    test('previousTrack should loop to end when at beginning', () => {
      tabletopTunes.currentTrackIndex = 0;
      tabletopTunes.previousTrack();
      
      expect(tabletopTunes.currentTrackIndex).toBe(2);
    });

    test('selectCategory should load correct soundtrack', () => {
      tabletopTunes.selectCategory('fantasy');
      
      expect(tabletopTunes.currentCategory).toBe('fantasy');
      expect(tabletopTunes.currentPlaylist).toEqual(tabletopTunes.soundtracks.fantasy);
      expect(tabletopTunes.currentTrackIndex).toBe(0);
    });
  });

  describe('Audio Player State Management', () => {
    test('togglePlayPause should handle empty playlist', () => {
      tabletopTunes.currentPlaylist = [];
      
      // Should not throw an error
      expect(() => tabletopTunes.togglePlayPause()).not.toThrow();
      expect(tabletopTunes.isPlaying).toBe(false);
    });

    test('play should set isPlaying to true', () => {
      tabletopTunes.currentPlaylist = [{ name: 'Test Track', duration: '3:00' }];
      tabletopTunes.play();
      
      expect(tabletopTunes.isPlaying).toBe(true);
    });

    test('pause should set isPlaying to false', () => {
      tabletopTunes.isPlaying = true;
      tabletopTunes.pause();
      
      expect(tabletopTunes.isPlaying).toBe(false);
    });

    test('toggleShuffle should toggle shuffle state', () => {
      const initialShuffle = tabletopTunes.isShuffle;
      tabletopTunes.toggleShuffle();
      
      expect(tabletopTunes.isShuffle).toBe(!initialShuffle);
    });

    test('toggleLoop should toggle loop state', () => {
      const initialLoop = tabletopTunes.isLoop;
      tabletopTunes.toggleLoop();
      
      expect(tabletopTunes.isLoop).toBe(!initialLoop);
    });
  });

  describe('Utility Functions', () => {
    test('getDurationInSeconds should convert time strings correctly', () => {
      if (typeof tabletopTunes.getDurationInSeconds === 'function') {
        expect(tabletopTunes.getDurationInSeconds('3:30')).toBe(210);
        expect(tabletopTunes.getDurationInSeconds('1:15')).toBe(75);
        expect(tabletopTunes.getDurationInSeconds('0:45')).toBe(45);
      }
    });

    test('formatTime should format seconds correctly', () => {
      if (typeof tabletopTunes.formatTime === 'function') {
        expect(tabletopTunes.formatTime(210)).toBe('3:30');
        expect(tabletopTunes.formatTime(75)).toBe('1:15');
        expect(tabletopTunes.formatTime(45)).toBe('0:45');
      }
    });

    test('getCategoryIcon should return appropriate icons', () => {
      if (typeof tabletopTunes.getCategoryIcon === 'function') {
        expect(tabletopTunes.getCategoryIcon('fantasy')).toContain('dragon');
        expect(tabletopTunes.getCategoryIcon('horror')).toContain('ghost');
        expect(tabletopTunes.getCategoryIcon('scifi')).toContain('rocket');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid category selection gracefully', () => {
      expect(() => tabletopTunes.selectCategory('invalid-category')).not.toThrow();
    });

    test('should handle empty game search gracefully', () => {
      expect(() => tabletopTunes.searchBoardGame('')).not.toThrow();
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(() => tabletopTunes.searchBoardGame(null)).not.toThrow();
      expect(() => tabletopTunes.searchBoardGame(undefined)).not.toThrow();
    });
  });
});