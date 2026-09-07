# Azimut

Wilderness tools that work with no signal — a Progressive Web App that runs entirely in your browser, no backend, no account, no build step. Everything is computed on-device and the data ships with the app.

**Try it:** [fdom92.github.io/azimut](https://fdom92.github.io/azimut/) — installable, and works with the radio off once loaded.

The name is the product: an *azimuth* is the angle from true north, and the way solar position is expressed. Orientation and position are the core of the app.

The interface is in Spanish, and the reference content — snakes, plants, magnetic declination — is written for the Iberian peninsula. The code and these notes are in English.

Sibling to [Cerberus](https://github.com/Fdom92/cerberus), in the same idiom: vanilla ES modules, zero dependencies, `public/` is the whole deployable app.

## Why

Most outdoor apps assume connectivity, an account, and a server round-trip for things that are pure arithmetic. Sunrise does not need an API. Neither does the bearing back to your car, or the distance to a storm. Azimut computes all of it locally, works with the radio off, and never sends your position anywhere — it never leaves the device.

## Tools

### Emergencies

| Tool | What it does |
|---|---|
| **Distress** | Alpine distress signal (six per minute, answered by three), SOS as a single prosign, ground-to-air symbols, whistle codes. Screen strobe and audio tone, with the battery cost stated before you start |
| **Storm** | Distance from the flash-to-thunder gap, on a scale with the bands that decide what to do, plus lightning safety |

### Tools

| Tool | What it does |
|---|---|
| **Sun and moon** | Sunrise, sunset, solar noon, the three twilights, golden and blue hour, drawn as a day-long altitude curve. Moon phase, rise and set on the same axes |
| **Orientation** | A compass rose carrying two references at once — the device magnetometer and the sun's computed bearing — plus stick-and-shadow, the watch method and Polaris, which all work with the phone switched off |
| **Saved points** | Store where the car or the tent is; get bearing and distance back from anywhere, with the bearing drawn on the compass to walk |
| **Coordinates** | The same position in decimal degrees, degrees and minutes, degrees-minutes-seconds, UTM and MGRS — because what decides whether help reaches you is giving the format the other person is writing down |
| **Pace** | Naismith with Langmuir's descent correction, and the question it exists for: does the light hold until you arrive? |
| **Weather signs** | Cloud types placed at the altitude they form at, and what each indicates. Empirical, and says so |
| **Stars** | The sky overhead for your position and the hour, from the Yale Bright Star Catalogue, with constellation figures |
| **Iberian nature** | Vipers, ticks, processionary, Asian hornet, plants that burn in sunlight — what to do, and the folk remedies that make it worse. Sourced and cited |
| **Knots** | Ten knots grouped by purpose. **Illustrations pending** — see below |

## The state of the knots module

It ships without its diagrams, and the panel says so on every entry. This is deliberate rather than unfinished-by-accident: a knot is topology, and a diagram with one crossing drawn the wrong way teaches a different knot while looking authoritative. In a mountain context that is not a cosmetic bug, so the figures are being sourced rather than generated.

`public/img/knots/README.md` carries the rules for adding them — prefer public domain or CC0, never anything with a NoDerivatives clause if the image needs adapting, bundle rather than hotlink. The test suite refuses an image that arrives without its five attribution fields.

## Accuracy, and how far it has been checked

Different parts of this app are verified to very different degrees, and the distinction is worth keeping.

**Solar position** follows NOAA's formulation of Meeus, *Astronomical Algorithms*. Cross-checked against the [NOAA Solar Calculator](https://gml.noaa.gov/grad/solcalc/) for Madrid on four dates spanning the year: declination within 0.012°, equation of time within 0.013 minutes, solar noon within 14 seconds, rise and set within 15 seconds once NOAA's rounding to the minute is allowed for. Those values are pinned in `tests/run.js`.

**Lunar position** follows Meeus ch. 47, truncated to the dominant terms. The test that validates it is the synodic month: successive new moons found by the code come out 29.53 days apart, a measured constant that appears nowhere in the source.

**Star positions** are Yale BSC catalogue data, not computed here. The transform that places them is checked four ways, the strongest being that the sun put through the star path agrees with the solar module — which shares almost no code with it — to a tenth of a degree.

**UTM and MGRS** follow Snyder's series. Forward and inverse are independent bodies of code, and they round-trip to within a centimetre across six sites in both hemispheres.

**Reference content** — clouds, nature, knots — is sourced and cited per entry rather than computed, and the citations are rendered in the app. The nature module carries the most safety-critical text in the app and its sources are named on every card.

**Constellation figures** are the least-verified thing here, and their own file says so: there is no canonical set, different atlases join different stars, and these are the standard patterns as drawn here. Tests check that every segment joins two real catalogue stars that are close enough together to be neighbours, which catches a wrong star but not a defensible alternative joining.

## Architecture

Vanilla HTML/CSS/JS, ES modules, zero dependencies, zero build step. `public/` is the entire deployable app:

```
public/
  index.html            shell: home grid + one <section> per tool
  css/style.css         dark-first, light via prefers-color-scheme
  js/
    app.js              nav, forms, rendering
    store.js            IndexedDB wrapper (localStorage, then memory, as fallbacks)
    astro/              julian, solar, lunar, stars, coords, orientation
    geo/                coordinates (UTM/MGRS), bearing (great-circle)
    modules/            one per tool, plus the SVG chart builders
    data/               catalogues and reference content
      regions/          anything region-specific, so a new region is a data file
  manifest.webmanifest, sw.js, icons/    PWA install + offline precache
tools/
  build-stars.mjs       run once, by hand; its output is committed
```

Anything region-specific lives under `data/regions/`. Universal content — sun, moon, stars, knots, distress — stays outside it, so adding a region later is a data file rather than a refactor.

`package.json` carries no dependencies and no build. It exists so Node treats `.js` as ES modules when running the suite, and to hold the two scripts below.

## Getting started

No install, no build:

```bash
npm run serve
```

Open `http://localhost:8080`. Everything works offline from there; the optional platform features are Geolocation — GPS works without a network connection — and the device compass.

## Tests

Every computational module is a pure function, so the same suite runs in Node and in the browser:

```bash
npm test
```

Or open `tests/index.html` in any browser. CI runs the suite and only deploys if it passes.

## Regenerating the star catalogue

The catalogue is generated, not hand-written, and its output is committed:

```bash
curl -sL https://raw.githubusercontent.com/brettonw/YaleBrightStarCatalog/master/bsc5-short.json -o /tmp/bsc5-short.json
node tools/build-stars.mjs /tmp/bsc5-short.json
```

It keeps everything to magnitude 4, plus any fainter star a constellation figure needs.

## Credits

Star positions from the [Yale Bright Star Catalogue](http://tdc-www.harvard.edu/catalogs/bsc5.html) (BSC5, equinox and epoch J2000), via [brettonw/YaleBrightStarCatalog](https://github.com/brettonw/YaleBrightStarCatalog) (MIT).

Cloud classification follows the [WMO International Cloud Atlas](https://cloudatlas.wmo.int/). Nature entries cite their sources individually, in the app.

## Licence

MIT.
