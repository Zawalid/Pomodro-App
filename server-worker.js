// Register the service worker
self.addEventListener("install", function (event) {
  console.log("Service worker installed");
});

// Activate the service worker
self.addEventListener("activate", function (event) {
  console.log("Service worker activated");
});

// Intercept network requests
self.addEventListener("fetch", function (event) {
  console.log("Fetching resource: " + event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

// Respond to push notifications
self.addEventListener("push", function (event) {
  console.log("Push notification received");
  const title = "Push Notification";
  const options = {
    body: event.data.text(),
    icon: "images/icon.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
