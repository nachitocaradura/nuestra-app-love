importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js');

const firebaseConfig = {
  apiKey: "AIzaSyCfTEVS4EhcQxuj3S_zN-zxn_rnRRM2RE8",
  authDomain: "nuestra-app-e19af.firebaseapp.com",
  projectId: "nuestra-app-e19af",
  storageBucket: "nuestra-app-e19af.firebasestorage.app",
  messagingSenderId: "839568134740",
  appId: "1:839568134740:web:bf76380b03b9e90d1d13c1"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_CHAT_DATA') {
    const { userId, parejaId } = event.data;

    // Escuchar mensajes nuevos
    db.collection("mensajes")
      .where("chatId", "in", [userId + parejaId, parejaId + userId])
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const m = change.doc.data();
            // Si el mensaje es de la pareja, lanzar notificación
            if (m.senderId === parejaId) {
              self.registration.showNotification("Nuevo mensaje de tu amor 💕", {
                body: m.text,
                icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                vibrate: [200, 100, 200],
                tag: 'chat-notif',
                renotify: true
              });
            }
          }
        });
      });
  }
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
