// Importa los scripts de Firebase para el Service Worker
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Configuración de Firebase (de tu firebase.js)
firebase.initializeApp({
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  projectId: "nuestra-app-e19af",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
});

const messaging = firebase.messaging();

// Este evento maneja las notificaciones cuando la app está en SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('Recibido mensaje en segundo plano: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icono-app-192.png' // Asegúrate de que esta ruta sea correcta desde la raíz de tu dominio
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- LÓGICA PARA CACHÉ DE LA APLICACIÓN (APP SHELL) ---
// Nombre de la caché
const CACHE_NAME = 'nuestra-app-cache-v1';

// Archivos que queremos cachear (¡ajusta esta lista!)
// Asegúrate de que todas las rutas sean relativas a la raíz de tu dominio
const urlsToCache = [
  '/', // La página de inicio (puede ser index.html o auth.html si es la primera carga)
  '/index.html',
  '/auth.html',
  '/perfil.html',
  '/ruleta.html',
  '/viajes.html',
  '/calendario.html',
  '/chat.html',
  '/recetas.html',
  '/firebase.js'
  // Añade aquí cualquier otro archivo JS, CSS o imagen que tu app necesite para funcionar sin conexión
];

// Evento 'install': se activa cuando se instala el Service Worker por primera vez
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos de la aplicación.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forzar la activación del nuevo Service Worker
      .catch((error) => console.error('[Service Worker] Error al cachear archivos:', error))
  );
});

// Evento 'activate': se activa cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando Service Worker. Limpiando cachés antiguas.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Tomar control de las páginas abiertas inmediatamente
  );
});

// Evento 'fetch': se activa cada vez que la PWA hace una petición de red
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET, ignorar otras
  if (event.request.method !== 'GET') {
    return;
  }

  // Interceptar solo peticiones a URLs que queremos cachear o que podrían estar en caché
  // Esto es una estrategia Cache First (Primero la caché, luego la red)
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el recurso está en caché, lo devolvemos
      if (response) {
        // console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
        return response;
      }

      // Si no está en caché, intentamos obtenerlo de la red
      // console.log('[Service Worker] Obteniendo de la red:', event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          // Si la petición fue exitosa y es un GET (no guardar POSTs, etc.)
          if (networkResponse.status === 200 && networkResponse.type === 'basic') {
            // Clona la respuesta porque la respuesta de la red solo puede ser leída una vez
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no hay caché, puedes devolver una página offline
          // console.log('[Service Worker] Falló la red para:', event.request.url);
          // return caches.match('/offline.html'); // Si tuvieras una página offline
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
