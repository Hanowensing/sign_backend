// sw.js
const CACHE_NAME = "signcollector-cache-v1";
const urlsToCache = [
  "/admin.html",
  "/first.html",
  "/create.html",
  "/index.html",
  "/mainpage.html",
  "/recognize.html",
  "/register.html",
  "/offline.html",

  "/common.css",
  "/create.css",
  "/index.css",
  "/mainpage.css",
  "/recognize.css",
  "/register.css",
  "/first.css",

  "/create.js",
  "/index.js",
  "/mainpage.js",
  "/recognize.js",
  "/register.js"
];

// 설치 이벤트: 파일들을 캐시
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
  );
});

// fetch 이벤트: 캐시된 자원을 우선적으로 사용
self.addEventListener("fetch", event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;  // 캐시된 응답이 있으면 반환
          }
          
          // 네트워크 요청이 실패하면 offline.html을 반환
          return fetch(event.request).catch(() => {
            return caches.match("/offline.html");  // 오프라인 페이지 제공
          });
        })
    );
  });

// 활성화 이벤트: 오래된 캐시 정리
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});
