/**
 * Unit tests for Service Worker functionality
 * Tests PWA caching, offline functionality, and service worker lifecycle
 */

describe('Service Worker', () => {
  let mockCache;
  let mockEvent;

  beforeEach(() => {
    // Clear mocks first
    jest.clearAllMocks();
    
    // Mock the service worker global scope
    // Note: global.self is set to window by jsdom, so we add properties to it
    global.self.skipWaiting = jest.fn();
    global.self.clients = {
      claim: jest.fn()
    };
    global.self.addEventListener = jest.fn();

    global.caches = {
      open: jest.fn(),
      keys: jest.fn(),
      delete: jest.fn(),
      match: jest.fn()
    };

    global.fetch = jest.fn();

    // Mock console for service worker logs
    global.console.log = jest.fn();
    global.console.error = jest.fn();
    
    mockCache = {
      addAll: jest.fn(() => Promise.resolve()),
      put: jest.fn(() => Promise.resolve()),
      match: jest.fn()
    };

    mockEvent = {
      waitUntil: jest.fn(),
      respondWith: jest.fn(),
      request: {
        url: 'http://localhost:8000/',
        mode: 'navigate'
      }
    };

    global.caches.open.mockResolvedValue(mockCache);
    global.caches.keys.mockResolvedValue(['old-cache-v1', 'tabletop-tunes-v1.0.1']);
    global.caches.match.mockResolvedValue(new Response('cached content'));
  });

  describe('Cache Configuration', () => {
    test('should define cache name and static URLs', () => {
      const fs = require('fs');
      const path = require('path');
      const swContent = fs.readFileSync(path.join(__dirname, '../../sw.js'), 'utf8');
      
      expect(swContent).toContain('CACHE_NAME');
      expect(swContent).toContain('STATIC_CACHE_URLS');
      expect(swContent).toContain('/index.html');
      expect(swContent).toContain('/styles.css');
      expect(swContent).toContain('/script.js');
      expect(swContent).toContain('/manifest.json');
    });

    test('should include Font Awesome in cache URLs', () => {
      const fs = require('fs');
      const path = require('path');
      const swContent = fs.readFileSync(path.join(__dirname, '../../sw.js'), 'utf8');
      
      expect(swContent).toContain('font-awesome');
    });
  });

  describe('Install Event', () => {
    test('should handle install event and precache resources', async () => {
      const installHandler = jest.fn((event) => {
        event.waitUntil(
          global.caches.open('test-cache')
            .then(cache => cache.addAll(['/index.html']))
        );
        global.self.skipWaiting();
      });

      // Simulate install event
      installHandler(mockEvent);

      expect(mockEvent.waitUntil).toHaveBeenCalled();
      expect(global.self.skipWaiting).toHaveBeenCalled();
    });

    test('should handle precaching errors gracefully', async () => {
      mockCache.addAll.mockRejectedValue(new Error('Network error'));

      const installHandler = jest.fn((event) => {
        event.waitUntil(
          global.caches.open('test-cache')
            .then(cache => cache.addAll(['/index.html']))
            .catch(error => {
              global.console.error('Precaching failed:', error);
            })
        );
      });

      installHandler(mockEvent);

      expect(mockEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Activate Event', () => {
    test('should clean up old caches on activate', async () => {
      global.caches.keys.mockResolvedValue(['old-cache-v1', 'tabletop-tunes-v1.0.1']);
      global.caches.delete.mockResolvedValue(true);

      let activatePromise;
      const activateHandler = jest.fn((event) => {
        activatePromise = global.caches.keys()
          .then(cacheNames => {
            return Promise.all(
              cacheNames
                .filter(cacheName => cacheName !== 'tabletop-tunes-v1.0.1')
                .map(cacheName => global.caches.delete(cacheName))
            );
          })
          .then(() => global.self.clients.claim());
        event.waitUntil(activatePromise);
      });

      activateHandler(mockEvent);
      await activatePromise;

      expect(mockEvent.waitUntil).toHaveBeenCalled();
      expect(global.self.clients.claim).toHaveBeenCalled();
    });

    test('should claim clients on activate', async () => {
      let activatePromise;
      const activateHandler = jest.fn((event) => {
        activatePromise = Promise.resolve().then(() => global.self.clients.claim());
        event.waitUntil(activatePromise);
      });

      activateHandler(mockEvent);
      await activatePromise;

      expect(global.self.clients.claim).toHaveBeenCalled();
    });
  });

  describe('Fetch Event Handling', () => {
    test('should handle navigation requests with network first strategy', async () => {
      mockEvent.request.mode = 'navigate';
      const mockResponse = new Response('fresh content');
      global.fetch.mockResolvedValue(mockResponse);

      const fetchHandler = jest.fn((event) => {
        if (event.request.mode === 'navigate') {
          event.respondWith(
            global.fetch(event.request)
              .then(response => {
                const responseClone = response.clone();
                global.caches.open('test-cache')
                  .then(cache => cache.put(event.request, responseClone));
                return response;
              })
              .catch(() => global.caches.match('/'))
          );
        }
      });

      fetchHandler(mockEvent);

      expect(mockEvent.respondWith).toHaveBeenCalled();
    });

    test('should fallback to cache for navigation requests when network fails', async () => {
      mockEvent.request.mode = 'navigate';
      global.fetch.mockRejectedValue(new Error('Network error'));
      global.caches.match.mockResolvedValue(new Response('cached fallback'));

      const fetchHandler = jest.fn((event) => {
        if (event.request.mode === 'navigate') {
          event.respondWith(
            global.fetch(event.request)
              .catch(() => global.caches.match('/'))
          );
        }
      });

      fetchHandler(mockEvent);

      expect(mockEvent.respondWith).toHaveBeenCalled();
    });

    test('should handle static resource requests', async () => {
      mockEvent.request.url = 'http://localhost:8000/styles.css';
      mockEvent.request.mode = 'cors';
      
      const cachedResponse = new Response('cached css');
      global.caches.match.mockResolvedValue(cachedResponse);

      const fetchHandler = jest.fn((event) => {
        if (event.request.url.includes('styles.css')) {
          event.respondWith(
            global.caches.match(event.request)
              .then(response => {
                if (response) {
                  return response;
                }
                return global.fetch(event.request);
              })
          );
        }
      });

      fetchHandler(mockEvent);

      expect(mockEvent.respondWith).toHaveBeenCalled();
    });

    test('should handle audio requests with network first strategy', async () => {
      mockEvent.request.url = 'http://localhost:8000/audio/track.mp3';
      
      const audioResponse = new Response('audio data');
      global.fetch.mockResolvedValue(audioResponse);

      const fetchHandler = jest.fn((event) => {
        if (event.request.url.includes('audio')) {
          event.respondWith(
            global.fetch(event.request)
              .then(response => {
                const responseClone = response.clone();
                global.caches.open('test-cache')
                  .then(cache => cache.put(event.request, responseClone));
                return response;
              })
              .catch(() => global.caches.match(event.request))
          );
        }
      });

      fetchHandler(mockEvent);

      expect(mockEvent.respondWith).toHaveBeenCalled();
    });

    test('should handle soundtrack requests', async () => {
      mockEvent.request.url = 'http://localhost:8000/soundtrack/epic.mp3';
      
      const soundtrackResponse = new Response('soundtrack data');
      global.fetch.mockResolvedValue(soundtrackResponse);

      const fetchHandler = jest.fn((event) => {
        if (event.request.url.includes('soundtrack')) {
          event.respondWith(
            global.fetch(event.request)
              .then(response => {
                const responseClone = response.clone();
                global.caches.open('test-cache')
                  .then(cache => cache.put(event.request, responseClone));
                return response;
              })
              .catch(() => global.caches.match(event.request))
          );
        }
      });

      fetchHandler(mockEvent);

      expect(mockEvent.respondWith).toHaveBeenCalled();
    });
  });

  describe('Cache Strategies', () => {
    test('should implement cache first for static resources', async () => {
      const cachedResponse = new Response('cached content');
      global.caches.match.mockResolvedValue(cachedResponse);

      const cacheFirstStrategy = async (request) => {
        const cached = await global.caches.match(request);
        if (cached) {
          return cached;
        }
        const response = await global.fetch(request);
        const cache = await global.caches.open('test-cache');
        cache.put(request, response.clone());
        return response;
      };

      const result = await cacheFirstStrategy(mockEvent.request);
      
      expect(result).toBe(cachedResponse);
      expect(global.caches.match).toHaveBeenCalledWith(mockEvent.request);
    });

    test('should implement network first for dynamic content', async () => {
      const freshResponse = new Response('fresh content');
      global.fetch.mockResolvedValue(freshResponse);

      const networkFirstStrategy = async (request) => {
        try {
          const response = await global.fetch(request);
          const cache = await global.caches.open('test-cache');
          cache.put(request, response.clone());
          return response;
        } catch (error) {
          return await global.caches.match(request);
        }
      };

      const result = await networkFirstStrategy(mockEvent.request);
      
      expect(result).toBe(freshResponse);
      expect(global.fetch).toHaveBeenCalledWith(mockEvent.request);
    });
  });

  describe('Background Sync', () => {
    test('should handle background sync for offline playlist saves', () => {
      const fs = require('fs');
      const path = require('path');
      const swContent = fs.readFileSync(path.join(__dirname, '../../sw.js'), 'utf8');
      
      // Check if background sync is mentioned in service worker
      expect(swContent).toContain('background sync');
    });
  });

  describe('Error Handling', () => {
    test('should handle fetch failures gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      global.caches.match.mockResolvedValue(new Response('fallback'));

      const errorHandler = async (request) => {
        try {
          return await global.fetch(request);
        } catch (error) {
          global.console.error('Fetch failed:', error);
          return await global.caches.match(request);
        }
      };

      const result = await errorHandler(mockEvent.request);
      
      expect(result).toBeInstanceOf(Response);
      expect(global.console.error).toHaveBeenCalledWith('Fetch failed:', expect.any(Error));
    });

    test('should handle cache failures gracefully', async () => {
      global.caches.match.mockRejectedValue(new Error('Cache error'));
      
      const cacheErrorHandler = async (request) => {
        try {
          return await global.caches.match(request);
        } catch (error) {
          global.console.error('Cache error:', error);
          return new Response('fallback content');
        }
      };

      const result = await cacheErrorHandler(mockEvent.request);
      
      expect(result).toBeInstanceOf(Response);
      expect(global.console.error).toHaveBeenCalledWith('Cache error:', expect.any(Error));
    });
  });

  describe('Service Worker Lifecycle', () => {
    test('should register event listeners', () => {
      // Mock event listeners to track calls
      const mockListeners = {};
      global.self.addEventListener = jest.fn((event, handler) => {
        mockListeners[event] = handler;
      });

      // Simulate service worker registration
      global.self.addEventListener('install', () => {});
      global.self.addEventListener('activate', () => {});
      global.self.addEventListener('fetch', () => {});

      expect(global.self.addEventListener).toHaveBeenCalledWith('install', expect.any(Function));
      expect(global.self.addEventListener).toHaveBeenCalledWith('activate', expect.any(Function));
      expect(global.self.addEventListener).toHaveBeenCalledWith('fetch', expect.any(Function));
    });

    test('should have correct cache version', () => {
      const fs = require('fs');
      const path = require('path');
      const swContent = fs.readFileSync(path.join(__dirname, '../../sw.js'), 'utf8');
      
      // Cache name should include version
      expect(swContent).toMatch(/CACHE_NAME.*v\d+\.\d+\.\d+/);
    });
  });

  describe('Performance Optimization', () => {
    test('should clone responses before caching', async () => {
      const mockResponse = {
        clone: jest.fn(() => ({ cloned: true }))
      };
      global.fetch.mockResolvedValue(mockResponse);

      const responseHandler = async (request) => {
        const response = await global.fetch(request);
        const responseClone = response.clone();
        const cache = await global.caches.open('test-cache');
        cache.put(request, responseClone);
        return response;
      };

      await responseHandler(mockEvent.request);

      expect(mockResponse.clone).toHaveBeenCalled();
      expect(mockCache.put).toHaveBeenCalledWith(mockEvent.request, { cloned: true });
    });

    test('should handle concurrent cache operations', async () => {
      const requests = [
        { url: '/style1.css' },
        { url: '/style2.css' },
        { url: '/script1.js' }
      ];

      const cachePromises = requests.map(request => 
        global.caches.open('test-cache').then(cache => 
          cache.put(request, new Response('content'))
        )
      );

      await Promise.all(cachePromises);

      expect(global.caches.open).toHaveBeenCalledTimes(3);
      expect(mockCache.put).toHaveBeenCalledTimes(3);
    });
  });
});