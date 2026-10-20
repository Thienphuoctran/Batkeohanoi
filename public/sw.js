// public/sw.js — Service Worker GiaoHuu.vn PWA
const CACHE_NAME = "giaohuu-pwa-v3";
const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/api/logo",
  "/images/vintage-scrapbook.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Precache non-critical asset skip:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Chỉ xử lý các yêu cầu GET, bỏ qua POST (Server Actions) và WebSocket Supabase
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bỏ qua các yêu cầu API realtime hoặc Supabase Auth
  if (url.pathname.startsWith("/api/auth") || url.hostname.includes("supabase")) {
    return;
  }

  // Đối với tài nguyên tĩnh (ảnh, icon, logo): Thử cache trước, nếu không có mới tải mạng
  if (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/api/logo")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Đối với các trang HTML: Network-first với fallback về cache nếu mạng 4G sân bóng mất sóng
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
