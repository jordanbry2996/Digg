const CACHE_NAME = "motherload-v1";

const FILES = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.json",
  "./sw.js",
  "./icon.svg"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(FILES);

      })

  );

});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    })

  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(cached => {

        return cached ||
          fetch(event.request);

      })

  );

});
