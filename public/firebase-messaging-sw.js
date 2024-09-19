importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const firebaseConfig = {
    apiKey: "AIzaSyC6-MgewzZHUGEDqqZSQP2qZakU3gq8-z4",
    authDomain: "chat-app-fb511.firebaseapp.com",
    projectId: "chat-app-fb511",
    storageBucket: "chat-app-fb511.appspot.com",
    messagingSenderId: "515552768870",
    appId: "1:515552768870:web:a0bc59a82862ec2a3e8ea7",
    measurementId: "G-C2QGW19RYN"
};

// Initialize Firebase app in the service worker context
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Received background message ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image
    };

    self.ServiceWorkerRegistration.notification(notificationTitle, notificationOptions)
});