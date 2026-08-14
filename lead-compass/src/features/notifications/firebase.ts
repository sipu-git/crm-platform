import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const app = initializeApp(firebaseConfig);

export async function requestPushToken(): Promise<string | null> {
  if (!vapidKey || !(await isSupported())) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const workerConfig = new URLSearchParams(
    Object.entries(firebaseConfig).filter(([, value]) => Boolean(value)) as [string, string][],
  );
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${workerConfig.toString()}`,
  );
  const messaging = getMessaging(app);
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
}

export async function subscribeToForegroundMessages(handler: (payload: MessagePayload) => void) {
  if (!(await isSupported())) return () => undefined;
  return onMessage(getMessaging(app), handler);
}
