// Usamos la versión compat más reciente (compatible con importScripts)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  authDomain: "nuestra-app-e19af.firebaseapp.com",
  projectId: "nuestra-app-e19af",
  storageBucket: "nuestra-app-e19af.firebasestorage.app",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
});

const messaging = firebase.messaging();

// Notificaciones en BACKGROUND (app cerrada o en segundo plano)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensaje en background:', payload);

  const title = payload.notification?.title || '💕 Nuevo mensaje';
  const body  = payload.notification?.body  || '';
  const icon  = payload.notification?.icon  || '/icono-app-192.png';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icono-app-192.png',
    sound: '/notification.mp3',   // ← tu archivo de sonido
    data: { url: 'https://nuestra-app-love.vercel.app/chat.html' }
  });
});

// Al pulsar la notificación → abrir el chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://nuestra-app-love.vercel.app/chat.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes('nuestra-app-love.vercel.app') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva pestaña
      return clients.openWindow(url);
    })
  );
});
