// sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  authDomain: "nuestra-app-e19af.firebaseapp.com",
  projectId: "nuestra-app-e19af",
  storageBucket: "nuestra-app-e19af.firebasestorage.app",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
});

const messaging = firebase.messaging();

// Esto atrapa el mensaje cuando la app está cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('Recibido en segundo plano:', payload);
  const notificationTitle = payload.notification.title || "Nuevo mensaje 💕";
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
