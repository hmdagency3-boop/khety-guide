/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope;

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  requireInteraction?: boolean;
  actions?: { action: string; title: string; icon?: string }[];
}

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Push Notifications ──────────────────────────────────────────────────────

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: {
    title: string;
    body: string;
    type?: string;
    icon?: string;
    badge?: string;
    url?: string;
  };

  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Khety Guide", body: event.data.text() };
  }

  const scope = self.registration.scope;

  const options: ExtendedNotificationOptions = {
    body: payload.body,
    icon:  payload.icon  || `${scope}icon-192-any.png`,
    badge: payload.badge || `${scope}icon-192-maskable.png`,
    vibrate: [200, 100, 200],
    dir: "rtl",
    lang: "ar",
    data: { url: payload.url || scope },
    tag: "khety-notification",
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: "open",    title: "📖 افتح الإشعار" },
      { action: "dismiss", title: "✕ تجاهل" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options).catch((err) => {
      console.warn("[SW] showNotification failed, retrying without icon:", err);
      const fallback: ExtendedNotificationOptions = {
        body: payload.body,
        vibrate: [200, 100, 200],
        dir: "rtl",
        lang: "ar",
        data: { url: payload.url || scope },
        tag: "khety-notification",
        renotify: true,
        actions: [
          { action: "open",    title: "📖 افتح الإشعار" },
          { action: "dismiss", title: "✕ تجاهل" },
        ],
      };
      return self.registration.showNotification(payload.title, fallback);
    })
  );
});

// ── Notification Click ──────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  if ((event as NotificationEvent & { action: string }).action === "dismiss") return;

  const scope     = self.registration.scope;
  const targetUrl = (event.notification.data as { url?: string })?.url || scope;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(scope) && "focus" in client) {
            return (client as WindowClient).focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
