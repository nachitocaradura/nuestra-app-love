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

// Lock anti-duplicados usando IndexedDB (persiste entre instancias del SW)
function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('fcm-dedup', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('msgs', { keyPath: 'id' });
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e);
  });
}

async function yaFueMostrado(id) {
  const db = await abrirDB();
  return new Promise((resolve) => {
    const tx  = db.transaction('msgs', 'readwrite');
    const st  = tx.objectStore('msgs');
    const get = st.get(id);
    get.onsuccess = () => {
      if (get.result) {
        resolve(true); // ya existe → duplicado
      } else {
        st.put({ id, ts: Date.now() }); // guardar y continuar
        resolve(false);
      }
    };
    get.onerror = () => resolve(false);
    // Limpiar entradas viejas (>10s) para no acumular
    const range = IDBKeyRange.upperBound(Date.now() - 10000);
    st.index && st.openCursor?.(range)?.onsuccess;
  });
}

messaging.onBackgroundMessage(async (payload) => {
  console.log('[SW] Payload:', JSON.stringify(payload));

  const data  = payload.data || {};
  const msgId = payload.messageId || (data.chatId + '_' + data.senderId);

  // Si ya mostramos esta noti, salir sin hacer nada
  const duplicado = await yaFueMostrado(msgId);
  if (duplicado) {
    console.log('[SW] Duplicado bloqueado:', msgId);
    return;
  }

  const title = data.title || '💕 Nuevo mensaje';
  const body  = data.body  || '';
  const icon  = data.icon  || '/icono-app-192.png';
  const url   = data.url   || 'https://nuestra-app-love.vercel.app/chat.html';

  await self.registration.showNotification(title, {
    body,
    icon,
    badge:     '/icono-app-192.png',
    tag:       msgId,
    renotify:  false,
    data:      { url }
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
