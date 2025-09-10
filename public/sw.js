// اسم کش
const CACHE_NAME = "salona-cache-v1";

// فایل‌هایی که می‌خوای کش بشن
const urlsToCache = ["/", "/index.html", "/salona.png"];

// نصب Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// فعال شدن Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// واکنش به درخواست‌ها (Fetch)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگر تو کش بود → برگردون
      if (response) {
        return response;
      }
      // اگر نبود → از اینترنت بیار
      return fetch(event.request);
    })
  );
});
