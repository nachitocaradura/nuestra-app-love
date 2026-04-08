// sw.js - Este archivo puede estar vacío, pero DEBE existir
self.addEventListener('push', function(event) {
  console.log('Push recibido');
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

