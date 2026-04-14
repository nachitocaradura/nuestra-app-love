importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

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
    icon: '/icono-app-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
