/**
 * Test fixtures and sample data for TabletopTunes tests
 */

module.exports = {
  // Sample board games for testing
  sampleBoardGames: {
    'Test Game Fantasy': {
      category: 'fantasy',
      themes: ['fantasy', 'magic', 'adventure'],
      suggestedSoundtracks: [
        { 
          movie: 'Lord of the Rings', 
          reason: 'Epic fantasy themes', 
          tracks: ['Concerning Hobbits', 'The Bridge of Khazad Dum'] 
        }
      ]
    },
    'Test Game Horror': {
      category: 'horror',
      themes: ['horror', 'suspense', 'dark'],
      suggestedSoundtracks: [
        { 
          movie: 'The Conjuring', 
          reason: 'Scary atmosphere', 
          tracks: ['Main Theme', 'The Music Box'] 
        }
      ]
    }
  },

  // Sample soundtracks for testing
  sampleSoundtracks: {
    fantasy: [
      { name: "Test Dragon Theme", duration: "3:45", url: "#", description: "Epic dragon music", movie: "Test Movie" },
      { name: "Test Magic Theme", duration: "4:20", url: "#", description: "Magical melody", movie: "Test Movie 2" }
    ],
    horror: [
      { name: "Test Scary Theme", duration: "5:10", url: "#", description: "Spooky sounds", movie: "Test Horror Movie" }
    ],
    ambient: [
      { name: "Test Calm Theme", duration: "6:30", url: "#", description: "Peaceful sounds", movie: "Test Ambient Movie" }
    ]
  },

  // Sample user preferences
  samplePreferences: {
    volume: 75,
    shuffle: false,
    loop: true,
    lastCategory: 'fantasy',
    theme: 'dark'
  },

  // Sample playlists
  samplePlaylists: {
    'Epic Fantasy': [
      { name: "Dragon's Flight", duration: "4:15", movie: "How to Train Your Dragon", category: "fantasy" },
      { name: "Magic Spell", duration: "3:30", movie: "Harry Potter", category: "fantasy" },
      { name: "Forest Journey", duration: "5:45", movie: "Lord of the Rings", category: "fantasy" }
    ],
    'Horror Night': [
      { name: "Haunted House", duration: "6:20", movie: "The Conjuring", category: "horror" },
      { name: "Night Terror", duration: "4:50", movie: "Insidious", category: "horror" }
    ],
    'Chill Ambient': [
      { name: "Ocean Waves", duration: "8:00", movie: "Moana", category: "ambient" },
      { name: "Forest Rain", duration: "7:30", movie: "Studio Ghibli", category: "ambient" }
    ]
  },

  // Sample app states
  sampleAppStates: {
    playing: {
      currentCategory: 'fantasy',
      currentTrackIndex: 1,
      isPlaying: true,
      currentBoardGame: 'Gloomhaven',
      activeTab: 'main',
      volume: 80,
      shuffle: false,
      loop: false
    },
    paused: {
      currentCategory: 'horror',
      currentTrackIndex: 0,
      isPlaying: false,
      currentBoardGame: null,
      activeTab: 'spotify',
      volume: 60,
      shuffle: true,
      loop: true
    }
  },

  // Sample theme analysis results
  sampleThemeAnalysis: {
    'fantasy dragon magic': {
      detectedKeywords: ['fantasy', 'dragon', 'magic'],
      scores: { fantasy: 85, adventure: 60, ambient: 30, horror: 15, scifi: 20, tavern: 25 },
      bestCategory: 'fantasy',
      confidence: 85
    },
    'zombie apocalypse survival': {
      detectedKeywords: ['zombie', 'apocalypse', 'survival'],
      scores: { horror: 80, adventure: 45, ambient: 20, fantasy: 15, scifi: 30, tavern: 10 },
      bestCategory: 'horror',
      confidence: 80
    },
    'space exploration future': {
      detectedKeywords: ['space', 'exploration', 'future'],
      scores: { scifi: 90, adventure: 55, ambient: 25, fantasy: 20, horror: 15, tavern: 10 },
      bestCategory: 'scifi',
      confidence: 90
    }
  },

  // Sample error scenarios
  errorScenarios: {
    invalidJson: 'invalid{json}data',
    corruptedPreferences: '{"volume":"not-a-number","shuffle":"maybe"}',
    emptyPlaylist: [],
    oversizedData: 'x'.repeat(10000000), // Very large string
    nullData: null,
    undefinedData: undefined
  },

  // Mock DOM elements structure
  mockDOMStructure: {
    'game-search': { tagName: 'INPUT', type: 'text', value: '' },
    'search-game-btn': { tagName: 'BUTTON', textContent: 'Find Soundtracks' },
    'current-track': { tagName: 'H3', textContent: 'No track selected' },
    'current-category': { tagName: 'P', textContent: 'Select a soundtrack category' },
    'play-pause-btn': { tagName: 'BUTTON', classList: [] },
    'prev-btn': { tagName: 'BUTTON' },
    'next-btn': { tagName: 'BUTTON' },
    'shuffle-btn': { tagName: 'BUTTON', classList: [] },
    'loop-btn': { tagName: 'BUTTON', classList: [] },
    'volume-slider': { tagName: 'INPUT', type: 'range', value: '70' },
    'playlist-name': { tagName: 'INPUT', type: 'text', value: '' },
    'save-playlist': { tagName: 'BUTTON' },
    'load-playlist': { tagName: 'BUTTON' },
    'track-list': { tagName: 'DIV', innerHTML: '' }
  },

  // Sample HTTP responses for testing
  mockResponses: {
    spotifyAuth: {
      access_token: 'mock-spotify-token',
      token_type: 'Bearer',
      expires_in: 3600
    },
    spotifySearch: {
      tracks: {
        items: [
          {
            id: 'track1',
            name: 'Epic Fantasy Theme',
            artists: [{ name: 'Movie Soundtrack Orchestra' }],
            preview_url: 'https://example.com/preview1.mp3'
          },
          {
            id: 'track2',
            name: 'Dragon Battle',
            artists: [{ name: 'Film Score Composer' }],
            preview_url: 'https://example.com/preview2.mp3'
          }
        ]
      }
    }
  },

  // Performance benchmarks for testing
  performanceBenchmarks: {
    gameSearchMaxTime: 100, // milliseconds
    themeAnalysisMaxTime: 50,
    categorySelectionMaxTime: 30,
    playlistLoadMaxTime: 200,
    localStorageMaxTime: 10
  }
};