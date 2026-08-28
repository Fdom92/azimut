# Azimut — Design Spec v1

**Date:** 2026-08-28
**Status:** Approved, not started

---

## Thesis

Mountain and wilderness tools that work with no signal, no account, and that never phone home. All computation is local; all data ships with the app.

The name is the product: *azimuth* is the angle from north, and the way solar position is expressed. Orientation and sun position — the core of the app — in one word.

## Companion project

Sibling to [Cerberus](https://github.com/Fdom92/cerberus). Same idiom: vanilla ES modules, zero dependencies, zero build step, installable PWA, fully offline. Cerberus inspects things you shouldn't trust; Azimut tells you what you need when nothing else works.

The shell is **copied** from Cerberus, not packaged or submoduled. For small no-build apps, a shared package introduces tooling that contradicts the whole premise, and divergence between two different apps is healthy rather than debt.

---

## Scope

**In v1:** six modules, Iberia region, installable PWA, fully offline.

**Out of v1:** maps, live weather, route tracking, photo identification, packing lists.

Packing lists were considered and cut: it is a to-do list, and the phone already has one. Add later only if its absence is actually felt in use.

---

## Modules

### 1. Sun and moon — the technical core

**Input:** lat/lon (Geolocation API, manual entry, or saved location) + date.

**Output:** sunrise, sunset, solar noon, twilights (civil / nautical / astronomical), golden hour, blue hour. Moonrise, moonset, phase, illuminated fraction.

**Algorithm:** Meeus, *Astronomical Algorithms*. Pure functions, zero dependencies.

**Why it leads:** it is verifiable. Outputs are checked against the NOAA solar calculator and published ephemerides, and the test suite is part of the deliverable. A correct astronomical calculation with no libraries and no network is a clean technical signal.

**Note worth surfacing in the UI:** GPS works without network. Many users assume it does not.

### 2. Orientation — consumes module 1

- **Stick and shadow:** the shadow points away from the sun; combined with the solar azimuth from module 1, gives true north.
- **Watch method:** hour hand at the sun, bisect the angle to 12 → south (northern hemisphere).
- **Polaris at night:** from the Big Dipper, the Merak→Dubhe line extended ×5.
- **Magnetic compass:** optional only. `DeviceOrientationEvent` (`webkitCompassHeading` on iOS, requires permission; `absolute` alpha on Android). Never the primary method — accuracy degrades near metal and electronics, and support is inconsistent across devices. Show an accuracy warning.
- **Magnetic declination:** approximately 0–2°W across Iberia. Ship an approximate per-region value, documented as a simplification. Do not ship a WMM table and do not imply precision that isn't there.

The first three methods work with a dead phone, which is when they matter most.

### 3. Knots

Ten: clove hitch, bowline, figure-eight, reef knot, sheet bend, prusik, munter/UIAA, timber hitch, double fisherman's, girth hitch.

Stepped SVG illustrations. No video — weight.

This module's cost is illustration work, not code.

### 4. Distress signalling

- **Alpine distress signal:** 6 signals per minute, one minute pause, repeat. The acknowledgement is 3 per minute. This is the signal actually used in European mountains.
- **SOS in morse:** `··· ——— ···`
- **Emitters:** fullscreen black/white strobe, plus Web Audio tone. Both work offline.
- **Ground-to-air symbols:** V (require assistance), X (require medical assistance), arrow (proceeding in this direction).
- **Whistle codes.**

**Mandatory warning:** screen strobing drains battery fast. This must be stated before the user starts, not buried.

### 5. Weather signs

Cloud types and what they indicate: cirrus → front within 12–24h; cumulonimbus → storm now; lenticular → strong wind aloft.

Framed honestly: these are **empirical indicators, not forecasts**.

Optional, if the device exposes a barometer: pressure trend.

### 6. Iberian nature — the regional edge

- **Snakes:** vipers (*Vipera latastei*, *V. seoanei*, *V. aspis*) vs. colubrids. How they differ, and above all what to do.
- **Pine processionary:** season, danger to children and dogs, response.
- **Ticks:** correct removal technique — frequently done wrong.
- **Plants:** fig sap under sun, nettles, giant hogweed.
- **Asian hornet, yellow scorpion.**

**Content rule, no exceptions:** reference, not identifier. An identifier says "this is X" and causes harm when wrong; a reference says what exists in the region and what to do. Every entry ends in an action, and serious ones end at 112. Sources cited.

**No mushrooms, in any form.** Not identification, not "probably", not with a disclaimer. It is the obvious feature request and it is the one that kills people.

---

## Architecture

```
public/
  index.html                  home grid + one <section> per module
  css/style.css               dark-first, light via prefers-color-scheme
  js/
    app.js                    nav, forms, rendering
    store.js                  IndexedDB wrapper (localStorage fallback)
    astro/
      julian.js               Julian date and shared helpers
      solar.js                Meeus — sun
      lunar.js                Meeus — moon
    modules/
      sunMoon.js  orient.js  knots.js  distress.js  weather.js  nature.js
    data/
      regions/iberia.js       fauna, flora, declination
      knots.js  clouds.js  signals.js
  manifest.webmanifest, sw.js, icons/
tests/
  harness.js  fixtures.js  run.js
```

Vanilla ES modules. Zero dependencies, zero build step. `public/` is the entire deployable app.

**Design decision that costs nothing now:** everything region-specific lives under `data/regions/`. Universal content (sun, moon, knots, distress) stays outside it. Adding the Alps or Scotland later is then a new data file, not a refactor.

---

## Safety and content rules

1. Reference, never identifier.
2. Every actionable entry terminates in professional help where the stakes warrant it (112).
3. Sources cited in-app, with the date of the guidance where it is versioned.
4. No mushrooms.
5. The magnetic compass is always presented as secondary, with its limitations stated.
6. Battery cost of strobing is stated before use.

---

## Tech stack

| Layer | Choice |
|---|---|
| Language | Vanilla JS, ES modules |
| Build | None |
| Dependencies | None |
| Storage | IndexedDB, localStorage fallback |
| Offline | Service worker, precache all |
| Position | Geolocation API + manual + saved locations |
| Sensors | DeviceOrientation (optional), barometer (optional) |
| Tests | Same harness pattern as Cerberus |
| CI | GitHub Actions → Pages, **running tests before deploy** |

Note on CI: Cerberus currently deploys without running its suite. Azimut should run tests before deploy from the first commit — for a tool whose whole claim is correctness, a heuristic or algorithm regression must not ship on its own.

---

## Phases

| Phase | Contents | Shipping state |
|---|---|---|
| 1 | Shell + sun and moon | Already useful; already has tests against ephemerides |
| 2 | Orientation | Consumes phase 1 |
| 3 | Knots + distress | Illustrated content |
| 4 | Weather + nature | Curated content |

Each phase ships something usable on its own. Abandoning after phase 2 still leaves a working tool.

---

## Open decisions

- **Spelling:** `azimut` (Spanish/Catalan/French/German) chosen over `azimuth` (English). Matches the Iberian content; costs some English-language search visibility.
- **Illustration style for knots:** not yet decided. Stepped SVG confirmed as the format; visual treatment open.
