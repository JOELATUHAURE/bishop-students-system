// This is a simple service worker for offline support

const CACHE_NAME = 'bsu-application-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache API responses
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          }
        ).catch(() => {
          // If the request fails, e.g. when offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-application-forms') {
    event.waitUntil(syncApplicationForms());
  }
});

// Function to sync stored form data when online
async function syncApplicationForms() {
  try {
    // Open the IndexedDB database
    const db = await openDB('offline-forms-db', 1);
    
    // Get all stored forms
    const tx = db.transaction('forms', 'readwrite');
    const store = tx.objectStore('forms');
    const storedForms = await store.getAll();
    
    // Process each form
    for (const form of storedForms) {
      try {
        // Attempt to submit the form
        const response = await fetch(form.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${form.token}`,
          },
          body: JSON.stringify(form.data),
        });
        
        if (response.ok) {
          // If successful, delete from store
          await store.delete(form.id);
        }
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
    
    await tx.complete;
  } catch (error) {
    console.error('Error syncing forms:', error);
  }
}

// Helper function to open IndexedDB
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('forms', { keyPath: 'id' });
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}