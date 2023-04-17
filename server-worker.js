// Register the service worker
const CACHE_NAME = "my-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Respond to push notifications
self.addEventListener("push", function (event) {
  console.log("Push notification received");
  const title = "Push Notification";
  const options = {
    body: event.data.text(),
    icon: "/icon.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
