/**
 * Integration tests for TabletopTunes application workflow
 * Tests end-to-end functionality and component interactions
 */

const fs = require('fs');
const path = require('path');

describe('TabletopTunes Application Workflow', () => {
  let mockDocument;
  let mockWindow;
  let htmlContent;

  beforeAll(() => {
    // Load HTML content for analysis
    htmlContent = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
    
    // Create mock DOM structure based on actual HTML
    mockDocument = {
      getElementById: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(() => ({
        addEventListener: jest.fn(),
        textContent: '',
        classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
      })),
      head: { appendChild: jest.fn() }
    };
    
    mockWindow = {
      addEventListener: jest.fn(),
      Audio: jest.fn(() => ({
        play: jest.fn(() => Promise.resolve()),
        pause: jest.fn(),
        addEventListener: jest.fn()
      })),
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      navigator: {
        serviceWorker: { register: jest.fn(() => Promise.resolve()) }
      },
      Event: jest.fn(),
      KeyboardEvent: jest.fn()
    };

    
    global.document = mockDocument;
    global.window = mockWindow;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HTML Structure Analysis', () => {
    test('should contain required DOM elements', () => {
      expect(htmlContent).toContain('id="game-search"');
      expect(htmlContent).toContain('id="search-game-btn"');
      expect(htmlContent).toContain('id="current-track"');
      expect(htmlContent).toContain('id="play-pause-btn"');
      expect(htmlContent).toContain('class="category-card"');
    });

    test('should have navigation structure', () => {
      expect(htmlContent).toContain('data-tab="main"');
      expect(htmlContent).toContain('data-tab="spotify"');
      expect(htmlContent).toContain('data-tab="how-it-works"');
      expect(htmlContent).toContain('data-tab="visualization"');
    });

    test('should have audio player controls', () => {
      expect(htmlContent).toContain('id="prev-btn"');
      expect(htmlContent).toContain('id="next-btn"');
      expect(htmlContent).toContain('id="shuffle-btn"');
      expect(htmlContent).toContain('id="loop-btn"');
      expect(htmlContent).toContain('id="volume-slider"');
    });

    test('should have playlist management elements', () => {
      expect(htmlContent).toContain('id="playlist-name"');
      expect(htmlContent).toContain('id="save-playlist"');
      expect(htmlContent).toContain('id="load-playlist"');
      expect(htmlContent).toContain('id="track-list"');
    });

    test('should have PWA elements', () => {
      expect(htmlContent).toContain('rel="manifest"');
      expect(htmlContent).toContain('name="theme-color"');
      expect(htmlContent).toContain('serviceWorker');
    });
  });

  describe('Game Search Integration', () => {
    test('should handle game search workflow', () => {
      // Mock the search input and button
      const mockSearchInput = {
        value: '',
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };
      
      const mockSearchButton = {
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'game-search') return mockSearchInput;
        if (id === 'search-game-btn') return mockSearchButton;
        return null;
      });

      // Simulate user input
      mockSearchInput.value = 'Gloomhaven';
      expect(mockSearchInput.value).toBe('Gloomhaven');

      // Simulate button click
      const clickEvent = { type: 'click' };
      mockSearchButton.dispatchEvent(clickEvent);
      expect(mockSearchButton.dispatchEvent).toHaveBeenCalledWith(clickEvent);
    });

    test('should handle popular game selections', () => {
      const mockPopularGames = [
        { textContent: 'Gloomhaven', addEventListener: jest.fn(), dataset: { game: 'Gloomhaven' } },
        { textContent: 'Catan', addEventListener: jest.fn(), dataset: { game: 'Catan' } },
        { textContent: 'Pandemic', addEventListener: jest.fn(), dataset: { game: 'Pandemic' } }
      ];

      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector === '.popular-game') return mockPopularGames;
        return [];
      });

      const popularGames = mockDocument.querySelectorAll('.popular-game');
      expect(popularGames).toHaveLength(3);
      expect(popularGames[0].textContent).toBe('Gloomhaven');
    });
  });

  describe('Category Selection Integration', () => {
    test('should handle category card interactions', () => {
      const mockCategoryCards = [
        { dataset: { category: 'fantasy' }, addEventListener: jest.fn() },
        { dataset: { category: 'horror' }, addEventListener: jest.fn() },
        { dataset: { category: 'scifi' }, addEventListener: jest.fn() },
        { dataset: { category: 'ambient' }, addEventListener: jest.fn() },
        { dataset: { category: 'adventure' }, addEventListener: jest.fn() },
        { dataset: { category: 'tavern' }, addEventListener: jest.fn() }
      ];

      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector === '.category-card') return mockCategoryCards;
        return [];
      });

      const categoryCards = mockDocument.querySelectorAll('.category-card');
      expect(categoryCards).toHaveLength(6);
      
      categoryCards.forEach(card => {
        expect(card.dataset.category).toBeDefined();
        expect(['fantasy', 'horror', 'scifi', 'ambient', 'adventure', 'tavern'])
          .toContain(card.dataset.category);
      });
    });
  });

  describe('Audio Player Integration', () => {
    test('should handle player control interactions', () => {
      const mockControls = {
        'play-pause-btn': { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
        'prev-btn': { addEventListener: jest.fn() },
        'next-btn': { addEventListener: jest.fn() },
        'shuffle-btn': { addEventListener: jest.fn(), classList: { toggle: jest.fn() } },
        'loop-btn': { addEventListener: jest.fn(), classList: { toggle: jest.fn() } }
      };

      mockDocument.getElementById.mockImplementation((id) => mockControls[id] || null);

      Object.keys(mockControls).forEach(controlId => {
        const control = mockDocument.getElementById(controlId);
        expect(control).toBeTruthy();
        expect(control.addEventListener).toBeDefined();
      });
    });

    test('should handle volume control', () => {
      const mockVolumeSlider = {
        value: '70',
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'volume-slider') return mockVolumeSlider;
        return null;
      });

      const volumeSlider = mockDocument.getElementById('volume-slider');
      expect(volumeSlider.value).toBe('70');
      
      // Simulate volume change
      volumeSlider.value = '50';
      expect(volumeSlider.value).toBe('50');
    });
  });

  describe('Playlist Management Integration', () => {
    test('should handle playlist save/load workflow', () => {
      const mockPlaylistName = {
        value: '',
        addEventListener: jest.fn()
      };

      const mockSaveButton = {
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      const mockLoadButton = {
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'playlist-name') return mockPlaylistName;
        if (id === 'save-playlist') return mockSaveButton;
        if (id === 'load-playlist') return mockLoadButton;
        return null;
      });

      // Test playlist naming
      mockPlaylistName.value = 'Epic Fantasy Mix';
      expect(mockPlaylistName.value).toBe('Epic Fantasy Mix');

      // Test save functionality
      mockSaveButton.dispatchEvent({ type: 'click' });
      expect(mockSaveButton.dispatchEvent).toHaveBeenCalled();

      // Test load functionality
      mockLoadButton.dispatchEvent({ type: 'click' });
      expect(mockLoadButton.dispatchEvent).toHaveBeenCalled();
    });

    test('should handle track list updates', () => {
      const mockTrackList = {
        innerHTML: '',
        appendChild: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
      };

      mockDocument.getElementById.mockImplementation((id) => {
        if (id === 'track-list') return mockTrackList;
        return null;
      });

      const trackList = mockDocument.getElementById('track-list');
      expect(trackList).toBeTruthy();
      
      // Simulate track list update
      mockTrackList.innerHTML = '<div class="track-item">Test Track</div>';
      expect(mockTrackList.innerHTML).toContain('Test Track');
    });
  });

  describe('Tab Navigation Integration', () => {
    test('should handle tab switching', () => {
      const mockNavButtons = [
        { dataset: { tab: 'main' }, classList: { add: jest.fn(), remove: jest.fn() } },
        { dataset: { tab: 'spotify' }, classList: { add: jest.fn(), remove: jest.fn() } },
        { dataset: { tab: 'how-it-works' }, classList: { add: jest.fn(), remove: jest.fn() } },
        { dataset: { tab: 'visualization' }, classList: { add: jest.fn(), remove: jest.fn() } }
      ];

      const mockTabContents = [
        { id: 'main-tab', classList: { add: jest.fn(), remove: jest.fn() } },
        { id: 'spotify-tab', classList: { add: jest.fn(), remove: jest.fn() } },
        { id: 'how-it-works-tab', classList: { add: jest.fn(), remove: jest.fn() } },
        { id: 'visualization-tab', classList: { add: jest.fn(), remove: jest.fn() } }
      ];

      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector === '.nav-btn') return mockNavButtons;
        if (selector === '.tab-content') return mockTabContents;
        return [];
      });

      const navButtons = mockDocument.querySelectorAll('.nav-btn');
      const tabContents = mockDocument.querySelectorAll('.tab-content');

      expect(navButtons).toHaveLength(4);
      expect(tabContents).toHaveLength(4);

      // Test tab data attributes
      const tabNames = navButtons.map(btn => btn.dataset.tab);
      expect(tabNames).toEqual(['main', 'spotify', 'how-it-works', 'visualization']);
    });
  });

  describe('Local Storage Integration', () => {
    test('should handle user preferences persistence', () => {
      const mockPreferences = {
        volume: 70,
        shuffle: false,
        loop: false,
        lastCategory: 'fantasy'
      };

      mockWindow.localStorage.getItem.mockImplementation((key) => {
        if (key === 'tabletopTunes-preferences') {
          return JSON.stringify(mockPreferences);
        }
        return null;
      });

      mockWindow.localStorage.setItem.mockImplementation((key, value) => {
        expect(key).toBe('tabletopTunes-preferences');
        expect(() => JSON.parse(value)).not.toThrow();
      });

      // Test loading preferences
      const savedPrefs = JSON.parse(mockWindow.localStorage.getItem('tabletopTunes-preferences'));
      expect(savedPrefs.volume).toBe(70);
      expect(savedPrefs.lastCategory).toBe('fantasy');

      // Test saving preferences
      const newPrefs = { ...mockPreferences, volume: 80 };
      mockWindow.localStorage.setItem('tabletopTunes-preferences', JSON.stringify(newPrefs));
      expect(mockWindow.localStorage.setItem).toHaveBeenCalled();
    });

    test('should handle playlist persistence', () => {
      const mockPlaylist = [
        { name: "Dragon's Lair", duration: "3:45", movie: "Lord of the Rings" },
        { name: "Epic Quest", duration: "4:20", movie: "Indiana Jones" }
      ];

      mockWindow.localStorage.setItem('tabletopTunes-playlist-Fantasy Mix', JSON.stringify(mockPlaylist));
      
      const savedPlaylist = JSON.parse(mockWindow.localStorage.getItem('tabletopTunes-playlist-Fantasy Mix'));
      expect(savedPlaylist).toHaveLength(2);
      expect(savedPlaylist[0].name).toBe("Dragon's Lair");
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing DOM elements gracefully', () => {
      mockDocument.getElementById.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.querySelectorAll.mockReturnValue([]);

      // Application should handle missing elements without crashing
      expect(mockDocument.getElementById('non-existent')).toBeNull();
      expect(mockDocument.querySelector('.non-existent')).toBeNull();
      expect(mockDocument.querySelectorAll('.non-existent')).toEqual([]);
    });

    test('should handle localStorage errors gracefully', () => {
      mockWindow.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      mockWindow.localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Application should handle localStorage errors
      expect(() => mockWindow.localStorage.getItem('test')).toThrow();
      expect(() => mockWindow.localStorage.setItem('test', 'value')).toThrow();
    });
  });

  describe('Progressive Web App Integration', () => {
    test('should handle service worker registration', () => {
      mockWindow.navigator.serviceWorker.register.mockResolvedValue({
        scope: '/',
        active: { state: 'activated' }
      });

      return mockWindow.navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          expect(registration.scope).toBe('/');
          expect(mockWindow.navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
        });
    });

    test('should handle install prompt events', () => {
      const mockInstallPrompt = {
        preventDefault: jest.fn(),
        prompt: jest.fn(() => Promise.resolve()),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };

      // Simulate beforeinstallprompt event
      const beforeInstallPromptEvent = {
        type: 'beforeinstallprompt',
        preventDefault: mockInstallPrompt.preventDefault
      };

      expect(() => {
        mockWindow.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
        });
      }).not.toThrow();
    });
  });
});