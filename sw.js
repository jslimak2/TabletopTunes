// Service Worker for TabletopTunes PWA
const CACHE_NAME = 'tabletop-tunes-v1.0.1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          }).map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
  );
  self.clients.claim();
});

// Fetch Strategy - Cache First for static resources, Network First for dynamic content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests - Network First for fresh content
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match('/');
        })
    );
    return;
  }

  // Handle static resources with smarter caching strategy
  if (STATIC_CACHE_URLS.some(cachedUrl => request.url.includes(cachedUrl.replace('/', '')))) {
    // Use Network First for HTML files to avoid stale content
    if (request.url.includes('index.html') || request.url.endsWith('/')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return response;
          })
          .catch(() => {
            console.log('[SW] Network failed, serving from cache:', request.url);
            return caches.match(request);
          })
      );
    } else {
      // Use Cache First for CSS, JS, and other static assets
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', request.url);
              return cachedResponse;
            }
            
            console.log('[SW] Fetching and caching:', request.url);
            return fetch(request)
              .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
                return response;
              });
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // Return offline fallback if available
            return caches.match('/');
          })
      );
    }
    return;
  }

  // Handle audio files and other dynamic content with Network First strategy
  if (request.url.includes('audio') || request.url.includes('soundtrack')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle background sync for offline playlist saves
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'save-playlist') {
    event.waitUntil(
      // This would sync saved playlists when back online
      syncOfflinePlaylists()
    );
  }
});

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New soundtrack available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Soundtracks',
        icon: '/icons/icon-128x128.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-128x128.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TabletopTunes', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Utility function for syncing offline data (placeholder)
async function syncOfflinePlaylists() {
  try {
    // This would sync any offline saved playlists to server
    console.log('[SW] Syncing offline playlists...');
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}