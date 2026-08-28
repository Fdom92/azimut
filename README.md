# Azimut

Wilderness tools that work with no signal — a Progressive Web App that runs entirely in your browser, no backend, no account, no build step. Everything is computed on-device and the data ships with the app.

The name is the product: an *azimuth* is the angle from true north, and the way solar position is expressed. Orientation and sun position are the core of the app.

Sibling to [Cerberus](https://github.com/Fdom92/cerberus), in the same idiom: vanilla ES modules, zero dependencies, `public/` is the whole deployable app.

## Why

Most outdoor apps assume connectivity, an account, and a server round-trip for things that are pure arithmetic. Sunrise does not need an API. Azimut computes it locally, works with the radio off, and never sends your position anywhere — it never leaves the device.

## Tools

| Tool | What it does | Status |
|---|---|---|
| **Sun and moon** | Sunrise, sunset, solar noon, civil/nautical/astronomical twilight, golden and blue hour, current sun altitude and azimuth | Shipped |
| **Orientation** | Stick-and-shadow, watch method, Polaris at night; magnetic compass where supported | Planned |
| **Knots** | Ten essential knots, stepped illustrations | Planned |
| **Distress** | Alpine distress signal, SOS, ground-to-air symbols; screen strobe and audio tone | Planned |
| **Weather signs** | Cloud types and what they indicate | Planned |
| **Iberian nature** | Snakes, processionary, ticks, irritant plants — what to do, sourced | Planned |

## Accuracy

Solar position follows NOAA's formulation of Meeus, *Astronomical Algorithms* (ch. 25 and 15), accurate to well under a minute at the latitudes this targets.

The test suite proves internal consistency by construction: declination hits ±23.44° at the solstices and zero at the equinoxes, twilight events stay ordered, sunrise and sunset are symmetric about solar noon, the equator holds near 12 hours year-round, and the Arctic Circle produces midnight sun in June and polar night in December.

Absolute accuracy is a separate claim. Cross-checks against the [NOAA Solar Calculator](https://gml.noaa.gov/grad/solcalc/) are pinned as literals in `tests/run.js` once verified by hand — not filled in from memory.

## Architecture

Vanilla HTML/CSS/JS, ES modules, zero dependencies, zero build step. `public/` is the entire deployable app:

```
public/
  index.html            shell: home grid + one <section> per tool
  css/style.css         dark-first, light via prefers-color-scheme
  js/
    app.js              nav, forms, rendering
    store.js            IndexedDB wrapper (localStorage, then memory, as fallbacks)
    astro/
      julian.js         Julian date and shared helpers
      solar.js          solar position, rise/set, twilights
    modules/
      sunMoon.js        presentation layer over astro/
    data/regions/       region-scoped content (fauna, flora, declination)
  manifest.webmanifest, sw.js, icons/    PWA install + offline precache
```

Anything region-specific lives under `data/regions/`. Universal content — sun, moon, knots, distress — stays outside it, so adding a region later is a data file rather than a refactor.

`package.json` carries no dependencies and no build. It exists so Node treats `.js` as ES modules when running the suite, and to hold the two scripts below.

## Getting started

No install, no build:

```bash
npm run serve
```

Open `http://localhost:8080`. Everything works offline from there; the only optional platform features are Geolocation (GPS works without a network connection) and, later, the device compass.

## Tests

The astronomical modules are pure functions, so the same suite runs in Node and in the browser:

```bash
npm test
```

Or open `tests/index.html` in any browser. CI runs the suite and only deploys if it passes.

## Deploying

`public/` is a static directory — serve it anywhere. GitHub Actions deploys it to Pages on every push to `main`, after the tests pass.

## Licence

MIT.
