// Nombre de la caché
const CACHE_NAME = 'pos-restaurante-pro-cache-v1';

// Archivos para cachear en la instalación
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/index.tsx', // Asumiendo que tu bundler generará un archivo js a partir de esto
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Evento de instalación: se abre la caché y se añaden los archivos principales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: limpia cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento fetch: intercepta las peticiones de red
self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Estrategia: Cache First, then Network
  // Ideal para el shell de la aplicación (archivos estáticos)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en la caché, la devolvemos
        if (response) {
          return response;
        }

        // Si no, hacemos la petición a la red
        return fetch(event.request).then(
          networkResponse => {
            // No cacheamos peticiones a Firebase u otras APIs de terceros
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
               if (event.request.url.includes('firestore.googleapis.com')) {
                   return networkResponse;
               }
            }
            
            // Hacemos una copia de la respuesta para guardarla en caché
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // No cachear datos de Firestore
                if (!event.request.url.includes('firestore.googleapis.com')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        );
      })
      .catch(error => {
        // En caso de error (offline y sin caché), podríamos devolver una página de fallback
        console.error('Fetch fallido; devolviendo fallback si existe:', error);
        // Opcional: caches.match('/offline.html');
      })
  );
});
