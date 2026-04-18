/**
 * Browser-side push notification utilities.
 * Handles service worker registration and push subscription management.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

/** Convert a base64 URL-safe string to a Uint8Array (required by PushManager) */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

/** Register the service worker if not already registered */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  const existing = await navigator.serviceWorker.getRegistration("/sw.js");
  if (existing) return existing;

  return navigator.serviceWorker.register("/sw.js");
}

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  return Notification.requestPermission();
}

/** Get the current push subscription for this browser, if any */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/** Subscribe this browser to push notifications */
export async function subscribeToPush(): Promise<PushSubscription> {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return subscription;
}

/** Unsubscribe this browser from push notifications */
export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getCurrentSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
}
