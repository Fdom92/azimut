// Precache the whole app. It is small and entirely static, so there is no
// cache-versus-network strategy to get wrong: cache first, network never.

const CACHE = "azimut-v5";

const ASSETS = [
  ".",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/store.js",
  "js/astro/julian.js",
  "js/astro/solar.js",
  "js/astro/orientation.js",
  "js/modules/sunMoon.js",
  "js/modules/distress.js",
  "js/data/signals.js",
  "js/data/clouds.js",
  "js/data/knots.js",
  "js/modules/knots.js",
  "js/modules/sunChart.js",
  "js/modules/compass.js",
  "js/modules/cloudChart.js",
  "js/modules/weather.js",
  "js/data/regions/iberia.js",
  "manifest.webmanifest",
  "icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});
