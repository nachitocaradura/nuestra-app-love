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

// Guardamos los IDs de mensajes ya mostrados para evitar duplicados
const shown = new Set();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Payload recibido:', JSON.stringify(payload));

  const data     = payload.data || {};
  const msgId    = payload.messageId || data.chatId + Date.now();
  const title    = data.title || '💕 Nuevo mensaje';
  const body     = data.body  || '';
  const icon     = data.icon  || '/icono-app-192.png';
  const url      = data.url   || 'https://nuestra-app-love.vercel.app/chat.html';

  // Si ya mostramos esta notificación, ignorar
  if (shown.has(msgId)) {
    console.log('[SW] Duplicado ignorado:', msgId);
    return;
  }
  shown.add(msgId);
  // Limpiar después de 5 segundos para no acumular memoria
  setTimeout(() => shown.delete(msgId), 5000);

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/icono-app-192.png',
    tag: msgId,        // ← mismo tag = reemplaza en vez de duplicar
    renotify: false,
    data: { url }
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
