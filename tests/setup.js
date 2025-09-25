// Global test setup
require('@testing-library/jest-dom');

// Import game data
const gameData = require('../game-soundtrack-data.js');
global.BOARD_GAMES_DATABASE = gameData.BOARD_GAMES_DATABASE;
global.MOVIE_SOUNDTRACK_CATEGORIES = gameData.MOVIE_SOUNDTRACK_CATEGORIES;
global.THEME_TO_GENRE_MAPPING = gameData.THEME_TO_GENRE_MAPPING;
global.MOOD_BASED_SUGGESTIONS = gameData.MOOD_BASED_SUGGESTIONS;

// Mock Response for node environment
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  text() {
    return Promise.resolve(this.body);
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock Audio API
const AudioMock = jest.fn(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 100,
  paused: true,
  volume: 1,
  muted: false,
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock document methods
const mockDocument = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn(() => ({
    addEventListener: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    innerHTML: '',
    textContent: '',
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(),
    }
  }))
};

global.document = mockDocument;

// Mock window objects
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'Audio', {
  value: AudioMock,
  writable: true,
});

Object.defineProperty(global, 'location', {
  value: {
    href: 'http://localhost:8000',
    protocol: 'http:',
    host: 'localhost:8000',
    pathname: '/',
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'jest',
    onLine: true,
    serviceWorker: {
      register: jest.fn(() => Promise.resolve()),
    },
  },
  writable: true,
});

// Mock window for global access
global.window = {
  localStorage: localStorageMock,
  Audio: AudioMock,
  location: global.location,
  navigator: global.navigator,
  addEventListener: jest.fn(),
  Event: jest.fn(),
  KeyboardEvent: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});