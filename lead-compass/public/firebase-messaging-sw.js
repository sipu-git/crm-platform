/* global importScripts, firebase, self */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp(Object.fromEntries(new URL(self.location).searchParams));

const messaging = firebase.messaging();
messaging.onBackgroundMessage(({ data = {} }) => {
  self.registration.showNotification(data.title || "Clearview CRM", {
    body: data.body || "You have a new notification.",
    data: { url: data.url || "/notifications" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
