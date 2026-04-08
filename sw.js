// sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js');

// He pegado aquí tus datos del archivo firebase.js que me has pasado
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

let listenerChat = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_CHAT_DATA') {
    const { userId, parejaId } = event.data;
    if (listenerChat) listenerChat();

    listenerChat = db.collection("mensajes")
      .where("chatId", "in", [userId + parejaId, parejaId + userId])
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(async (snapshot) => {
        // Miramos si hay alguna ventana de la app abierta y visible
        const clients = await self.clients.matchAll({ type: 'window' });
        const isAppOpen = clients.some(client => client.visibilityState === 'visible');

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const m = change.doc.data();
            // SOLO notificamos si la app NO está abierta/visible
            if (m.senderId !== userId && !isAppOpen) {
              self.registration.showNotification("Mensaje nuevo 💕", {
                body: m.text,
                icon: m.senderPhoto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                tag: 'chat-msg',
                renotify: true
              });
            }
          }
        });
      });
  }
});
