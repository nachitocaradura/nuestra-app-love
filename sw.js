// sw.js - VERSIÓN 1.0.1
const VERSION = 'v1.0.1'; 

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

let currentListener = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_CHAT_DATA') {
    const { userId, parejaId } = event.data;
    
    // Si ya había un vigilante, lo quitamos para no duplicar
    if (currentListener) currentListener();

    currentListener = db.collection("mensajes")
      .where("chatId", "in", [userId + parejaId, parejaId + userId])
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(async (snapshot) => {
        const clients = await self.clients.matchAll({ type: 'window' });
        // Comprobamos si hay alguna pestaña de nuestra web abierta y visible
        const isAppActive = clients.some(c => c.visibilityState === 'visible');

        if (!isAppActive) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const m = change.doc.data();
              if (m.senderId !== userId) {
                self.registration.showNotification("Mensaje nuevo 💕", {
                  body: m.text,
                  icon: m.senderPhoto || '',
                  tag: 'chat-notification',
                  renotify: true
                });
              }
            }
          });
        }
      });
  }
});

// Forzar actualización inmediata
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
