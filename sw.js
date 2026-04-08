importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Configuración (Usa la versión 8 aquí por compatibilidad del SDK en SW)
firebase.initializeApp({
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  projectId: "nuestra-app-e19af",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
});

const messaging = firebase.messaging();

// Este evento se dispara cuando llega una notificación y la APP ESTÁ CERRADA
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification.title || "Nuevo mensaje 💕";
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || 'icono-app-192.png',
    badge: 'icono-app-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/chat.html' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Al hacer click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
