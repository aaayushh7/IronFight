// Meal Recovery Tracker — Service Worker
// Handles PWA caching and scheduled meal-time notifications

const CACHE_NAME = "meal-tracker-v2";
const STATIC_ASSETS = ["/", "/plan", "/progress", "/complain", "/settings"];

// ─── Install: pre-cache shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// ─── Fetch: network-first, fall back to cache ────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only cache same-origin GET requests
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Skip API routes — always network
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Notification click: focus or open the app ───────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});

// ─── Message: schedule meal-time reminders ───────────────────────────────────
// Receives { type: 'SCHEDULE_REMINDERS', meals: [{ label, emoji, startTime, msUntil }] }
const scheduledTimers = [];

self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_REMINDERS") {
    // Clear any previously scheduled timers
    scheduledTimers.forEach(clearTimeout);
    scheduledTimers.length = 0;

    const { meals } = event.data;
    meals.forEach((meal) => {
      if (meal.msUntil <= 0 || meal.msUntil > 24 * 60 * 60 * 1000) return;

      const id = setTimeout(() => {
        self.registration.showNotification(`${meal.emoji} Time for ${meal.label}!`, {
          body: `Your ${meal.label.toLowerCase()} window is open 🌸 Don't miss it!`,
          icon: "/apple-icon",
          badge: "/apple-icon",
          tag: `meal-${meal.type}`,
          renotify: false,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
          data: { url: "/" },
        });
      }, meal.msUntil);

      scheduledTimers.push(id);
    });
  }
});
