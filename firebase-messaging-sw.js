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

// Android recibe payload solo-data → FCM no muestra nada automático
// Este handler se dispara UNA sola vez y muestra la notificación
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Payload:', JSON.stringify(payload));

  const data  = payload.data  || {};
  const title = data.title    || '💕 Nuevo mensaje';
  const body  = data.body     || '';
  const icon  = data.icon     || '/icono-app-192.png';
  const url   = data.url      || 'https://nuestra-app-love.vercel.app/chat.html';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icono-app-192.png',
    data:  { url }
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
