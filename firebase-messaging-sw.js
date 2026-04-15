importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  projectId: "nuestra-app-e19af",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
});

const messaging = firebase.messaging();

// Importante: No es estrictamente necesario registrar onBackgroundMessage 
// manualmente si solo quieres mostrar la notificación estándar de Firebase,
// pero si lo haces, asegúrate de que no haya errores de sintaxis.
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icono-app-192.png', // Verifica que esta ruta sea accesible
    badge: '/icono-app-192.png'
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
