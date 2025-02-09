const CACHE_NAME = "signcollector-cache-v2"; // ✅ 새로운 버전의 캐시 사용
const urlsToCache = [
  "/first.html",
  "/create.html",
  "/index.html",
  "/mainpage.html",
  "/recognize.html",

  "/create.css",
  "/index.css",
  "/mainpage.css",
  "/recognize.css",
  "/first.css",

  "/create.js",
  "/index.js",
  "/mainpage.js",
  "/recognize.js",
];

// ✅ 설치 이벤트: 최신 파일을 강제로 다시 캐싱
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("✅ 최신 캐시 업데이트!");
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url, { cache: "no-store" })
              .then(response => cache.put(url, response))
              .catch(err => console.error(`❌ 캐싱 실패: ${url}`, err));
          })
        );
      })
  );
});

// ✅ fetch 이벤트: 캐시된 파일 제공 + 최신 파일 요청
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => caches.match("/offline.html"))
  );
});

// ✅ 활성화 이벤트: 이전 캐시 삭제 (자동 업데이트)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log(`🗑️ 기존 캐시 삭제: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
});
