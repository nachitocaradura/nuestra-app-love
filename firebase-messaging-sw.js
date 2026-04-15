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

const TAG = 'nuestra-app-chat';

// Leer mensajes acumulados desde IndexedDB
function getMensajes() {
  return new Promise((resolve) => {
    const req = indexedDB.open('notidb', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('pendientes', { autoIncrement: true });
    req.onsuccess = e => {
      const db  = e.target.result;
      const tx  = db.transaction('pendientes', 'readonly');
      const st  = tx.objectStore('pendientes');
      const all = st.getAll();
      all.onsuccess = () => resolve(all.result || []);
      all.onerror   = () => resolve([]);
    };
    req.onerror = () => resolve([]);
  });
}

// Añadir mensaje y devolver todos los acumulados
function addMensaje(texto) {
  return new Promise((resolve) => {
    const req = indexedDB.open('notidb', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('pendientes', { autoIncrement: true });
    req.onsuccess = e => {
      const db = e.target.result;
      const tx = db.transaction('pendientes', 'readwrite');
      const st = tx.objectStore('pendientes');
      st.add(texto);
      tx.oncomplete = () => {
        // Leer todos después de añadir
        const tx2  = db.transaction('pendientes', 'readonly');
        const all  = tx2.objectStore('pendientes').getAll();
        all.onsuccess = () => resolve(all.result || []);
        all.onerror   = () => resolve([texto]);
      };
    };
    req.onerror = () => resolve([texto]);
  });
}

// Borrar todos los mensajes acumulados
function limpiarMensajes() {
  return new Promise((resolve) => {
    const req = indexedDB.open('notidb', 1);
    req.onsuccess = e => {
      const db = e.target.result;
      const tx = db.transaction('pendientes', 'readwrite');
      tx.objectStore('pendientes').clear();
      tx.oncomplete = () => resolve();
    };
    req.onerror = () => resolve();
  });
}

messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Mensaje recibido:', payload);

  const notif      = payload.notification || {};
  const senderName = (notif.title || '💕').replace('💕 ', '');
  const body       = notif.body  || '';
  const icon       = payload.webpush?.notification?.icon || '/icono-app-192.png';
  const url        = 'https://nuestra-app-love.vercel.app/chat.html';

  // Comprobar si la notificación anterior sigue visible
  const notifsActivas = await self.registration.getNotifications({ tag: TAG });
  
  // Si no hay notificación activa, limpiar acumulados (usuario la borró)
  if (notifsActivas.length === 0) {
    await limpiarMensajes();
  }

  // Acumular el nuevo mensaje
  const todos = await addMensaje(body);

  // Construir el body agrupado
  const bodyAgrupado = todos.join('\n');
  const titulo       = todos.length > 1
    ? `💕 ${senderName} (${todos.length} mensajes)`
    : `💕 ${senderName}`;

  // Mostrar con tag fijo → reemplaza la anterior en vez de acumular
  await self.registration.showNotification(titulo, {
    body:     bodyAgrupado,
    icon,
    badge:    '/icono-app-192.png',
    tag:      TAG,       // ← mismo tag = reemplaza la notificación anterior
    renotify: true,      // ← vibra/suena igualmente aunque reemplace
    data:     { url }
  });
});

// Cuando el usuario toca la notificación → limpiar acumulados y abrir chat
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://nuestra-app-love.vercel.app/chat.html';
  
  event.waitUntil(
    limpiarMensajes().then(() =>
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('nuestra-app-love.vercel.app') && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    )
  );
});

// Cuando el usuario desliza y borra la notificación → limpiar acumulados
self.addEventListener('notificationclose', (event) => {
  if (event.notification.tag === TAG) {
    limpiarMensajes();
  }
});
