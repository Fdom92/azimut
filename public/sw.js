// Precache the whole app. It is small and entirely static, so there is no
// cache-versus-network strategy to get wrong: cache first, network never.

const CACHE = "azimut-v14";

const ASSETS = [
  ".",
  "index.html",
  "css/style.css",
  "js/app.js",
  "js/store.js",
  "js/astro/julian.js",
  "js/astro/solar.js",
  "js/astro/orientation.js",
  "js/astro/coords.js",
  "js/astro/lunar.js",
  "js/astro/stars.js",
  "js/data/stars.js",
  "js/data/constellations.js",
  "js/modules/skyChart.js",
  "js/modules/sunMoon.js",
  "js/modules/distress.js",
  "js/data/signals.js",
  "js/data/clouds.js",
  "js/data/knots.js",
  "js/modules/knots.js",
  "js/modules/sunChart.js",
  "js/modules/moonPhase.js",
  "js/modules/compass.js",
  "js/modules/orientDiagrams.js",
  "js/modules/cloudChart.js",
  "js/modules/weather.js",
  "js/data/regions/iberia.js",
  "js/data/regions/iberia-nature.js",
  "js/geo/coordinates.js",
  "js/geo/bearing.js",
  "js/modules/waypoints.js",
  "js/modules/pace.js",
  "js/modules/paceChart.js",
  "js/modules/coordDiagram.js",
  "js/modules/nature.js",
  "js/modules/natureDiagrams.js",
  "manifest.webmanifest",
  "icons/icon.svg",
];

// skipWaiting hands control of an already-loaded page to the new worker, so
// the page keeps the HTML it started with while its imports resolve against
// the new cache. That mixed pair is how a stale deploy shows up as a module
// throwing halfway through and leaving half the panels unbuilt.
//
// Taking over fast is still what we want; the page just has to reload when it
// happens, which app.js does on controllerchange.
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
