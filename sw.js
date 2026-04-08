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
    
    db.collection("mensajes")
      .where("chatId", "in", [userId + parejaId, parejaId + userId])
      .orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot(async (snapshot) => {
        const clients = await self.clients.matchAll({ type: 'window' });
        const isVisible = clients.some(c => c.visibilityState === 'visible');

        if (!isVisible) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const m = change.doc.data();
              if (m.senderId !== userId) {
                self.registration.showNotification("Nuevo mensaje 💕", {
                  body: m.text,
                  icon: m.senderPhoto || '',
                  tag: 'chat'
                });
              }
            }
          });
        }
      });
  }
});

// Esto obliga al SW a no morir
self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
