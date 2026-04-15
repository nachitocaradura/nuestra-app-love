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

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Payload recibido:', JSON.stringify(payload));

  // Primero cerramos TODAS las notificaciones automáticas que FCM
  // pueda haber mostrado ya con el campo notification del payload
  self.registration.getNotifications().then(notifs => {
    notifs.forEach(n => {
      // Cerramos las genéricas (las que no tienen foto de perfil en el body)
      if (!n.body || n.body === '') n.close();
    });
  });

  const notif   = payload.notification || {};
  const title   = notif.title || '💕 Nuevo mensaje';
  const body    = notif.body  || '';
  const icon    = payload.webpush?.notification?.icon || '/icono-app-192.png';
  const url     = 'https://nuestra-app-love.vercel.app/chat.html';

  // Usamos tag fijo para que si llega duplicado, reemplace en vez de acumularse
  self.registration.showNotification(title, {
    body,
    icon,
    badge:    '/icono-app-192.png',
    tag:      'mensaje-' + (payload.data?.chatId || 'chat'),
    renotify: true,
    data:     { url }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://nuestra-app-love.vercel.app/chat.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('nuestra-app-love.vercel.app') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
