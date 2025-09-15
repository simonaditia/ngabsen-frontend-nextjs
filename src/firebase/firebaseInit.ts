// src/firebase/firebaseInit.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./firebaseConfig";

let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  const firebaseApp = initializeApp(firebaseConfig);
  messaging = getMessaging(firebaseApp);
}

// Fungsi untuk mendapatkan deviceToken FCM
export async function requestDeviceToken() {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Listener pesan FCM saat aplikasi aktif
export function listenFCMMessages(callback: (payload: any) => void) {
  if (messaging) {
    onMessage(messaging, callback);
  }
}
