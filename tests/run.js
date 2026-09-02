import {
  test,
  assert,
  assertEqual,
  assertClose,
  assertOrdered,
  runAll,
} from "./harness.js";

import {
  toJulianDay,
  fromJulianDay,
  julianCentury,
  julianDayStart,
  J2000,
} from "../public/js/astro/julian.js";

import {
  sunTimes,
  solarPosition,
  solarDeclination,
  equationOfTime,
  dayLengthMinutes,
} from "../public/js/astro/solar.js";

import {
  shadowAzimuth,
  shadowMethod,
  watchMethod,
  polarisMethod,
  magneticToTrue,
  trueToMagnetic,
  bearingDelta,
} from "../public/js/astro/orientation.js";

import {
  sosSchedule,
  alpineSchedule,
  scheduleDurationMs,
  ALPINE,
} from "../public/js/data/signals.js";

import { CLOUDS, LEVELS } from "../public/js/data/clouds.js";
import { placementCodes } from "../public/js/modules/cloudChart.js";

import { KNOTS, GROUPS } from "../public/js/data/knots.js";
import {
  knotsByGroup,
  isComplete,
  missingParts,
  IMAGE_FIELDS,
} from "../public/js/modules/knots.js";
import {
  cloudsByLevel,
  cloudsBySeverity,
  source,
  SEVERITY_LABEL,
} from "../public/js/modules/weather.js";

// Reference sites. Longitude is positive east.
const MADRID = { lat: 40.4168, lon: -3.7038 };
const SYDNEY = { lat: -33.8688, lon: 151.2093 };
const TROMSO = { lat: 69.6492, lon: 18.9553 };
const QUITO = { lat: -0.1807, lon: -78.4678 };

const JUNE_SOLSTICE = new Date("2026-06-21T12:00:00Z");
const DEC_SOLSTICE = new Date("2026-12-21T12:00:00Z");
const MARCH_EQUINOX = new Date("2026-03-20T12:00:00Z");
const SEPT_EQUINOX = new Date("2026-09-23T12:00:00Z");

// ---- julian.js ----

test("julian: J2000.0 epoch is 2000-01-01T12:00Z", () => {
  assertClose(toJulianDay(new Date("2000-01-01T12:00:00Z")), J2000, 1e-6);
});

test("julian: unix epoch is JD 2440587.5", () => {
  assertClose(toJulianDay(new Date("1970-01-01T00:00:00Z")), 2440587.5, 1e-6);
});

test("julian: round-trips through fromJulianDay", () => {
  const original = new Date("2026-08-28T17:43:11Z");
  const roundTripped = fromJulianDay(toJulianDay(original));
  assertClose(roundTripped.getTime(), original.getTime(), 1);
});

test("julian: century at J2000 is zero, one century later is 1", () => {
  assertClose(julianCentury(J2000), 0, 1e-9);
  assertClose(julianCentury(J2000 + 36525), 1, 1e-9);
});

test("julian: julianDayStart lands on midnight UTC regardless of time of day", () => {
  const morning = julianDayStart(new Date("2026-08-28T04:00:00Z"));
  const evening = julianDayStart(new Date("2026-08-28T23:59:00Z"));
  assertEqual(morning, evening, "same calendar day must give the same JD");
  assertClose(fromJulianDay(morning).getUTCHours(), 0, 1e-6);
});

// ---- Solar declination ----
// The sun's declination is the one solar quantity with textbook values:
// ±23.44° at the solstices, 0° at the equinoxes.

test("solar: declination is +23.44 at the June solstice", () => {
  const t = julianCentury(toJulianDay(JUNE_SOLSTICE));
  assertClose(solarDeclination(t), 23.44, 0.15);
});

test("solar: declination is -23.44 at the December solstice", () => {
  const t = julianCentury(toJulianDay(DEC_SOLSTICE));
  assertClose(solarDeclination(t), -23.44, 0.15);
});

test("solar: declination passes through zero at both equinoxes", () => {
  for (const date of [MARCH_EQUINOX, SEPT_EQUINOX]) {
    const t = julianCentury(toJulianDay(date));
    assert(
      Math.abs(solarDeclination(t)) < 1,
      `declination should be near zero at ${date.toISOString()}, got ${solarDeclination(t)}`
    );
  }
});

// ---- Equation of time ----

test("solar: equation of time stays within its known ±17 minute envelope", () => {
  for (let day = 0; day < 365; day += 5) {
    const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
    const eot = equationOfTime(julianCentury(toJulianDay(date)));
    assert(
      Math.abs(eot) < 17,
      `equation of time out of range on ${date.toISOString()}: ${eot}`
    );
  }
});

// ---- Rise and set ordering ----

test("solar: twilight events occur in the correct order at Madrid", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  assertOrdered(
    [
      ["astronomicalDawn", t.astronomicalDawn],
      ["nauticalDawn", t.nauticalDawn],
      ["civilDawn", t.civilDawn],
      ["sunrise", t.sunrise],
      ["solarNoon", t.solarNoon],
      ["sunset", t.sunset],
      ["civilDusk", t.civilDusk],
      ["nauticalDusk", t.nauticalDusk],
      ["astronomicalDusk", t.astronomicalDusk],
    ],
    "twilight sequence"
  );
});

test("solar: sunrise and sunset are symmetric about solar noon", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  const beforeNoon = t.solarNoon - t.sunrise;
  const afterNoon = t.sunset - t.solarNoon;
  assertClose(beforeNoon, afterNoon, 1000, "rise/set asymmetry about solar noon");
});

// ---- Day length ----

test("solar: equinox day is a little over 12 hours (refraction, not exactly 12)", () => {
  const length = dayLengthMinutes(
    sunTimes(MARCH_EQUINOX, MADRID.lat, MADRID.lon)
  );
  assert(
    length > 720 && length < 740,
    `equinox day length should sit just above 12h, got ${length} minutes`
  );
});

test("solar: northern summer days are longer than northern winter days", () => {
  const june = dayLengthMinutes(sunTimes(JUNE_SOLSTICE, MADRID.lat, MADRID.lon));
  const december = dayLengthMinutes(sunTimes(DEC_SOLSTICE, MADRID.lat, MADRID.lon));
  assert(june > december, `expected ${june} > ${december}`);
  assert(june > 870, `Madrid June solstice should exceed 14.5h, got ${june}`);
  assert(december < 580, `Madrid December solstice should fall under 9.7h, got ${december}`);
});

test("solar: the southern hemisphere reverses the seasons", () => {
  const june = dayLengthMinutes(sunTimes(JUNE_SOLSTICE, SYDNEY.lat, SYDNEY.lon));
  const december = dayLengthMinutes(sunTimes(DEC_SOLSTICE, SYDNEY.lat, SYDNEY.lon));
  assert(december > june, `Sydney: expected December ${december} > June ${june}`);
});

test("solar: the equator holds near 12 hours all year", () => {
  for (const date of [JUNE_SOLSTICE, DEC_SOLSTICE, MARCH_EQUINOX]) {
    const length = dayLengthMinutes(sunTimes(date, QUITO.lat, QUITO.lon));
    assertClose(length, 720, 20, `equator day length on ${date.toISOString()}`);
  }
});

// ---- Polar cases ----

test("solar: midnight sun above the Arctic Circle at the June solstice", () => {
  const t = sunTimes(JUNE_SOLSTICE, TROMSO.lat, TROMSO.lon);
  assertEqual(t.sunrise, null, "sun should not rise — it never set");
  assertEqual(t.polar, "above", "expected polar day");
  assertEqual(dayLengthMinutes(t), null);
});

test("solar: polar night above the Arctic Circle at the December solstice", () => {
  const t = sunTimes(DEC_SOLSTICE, TROMSO.lat, TROMSO.lon);
  assertEqual(t.sunrise, null, "sun should not rise at all");
  assertEqual(t.polar, "below", "expected polar night");
});

// ---- Position: altitude and azimuth ----

test("solar: noon altitude matches 90 - |latitude - declination|", () => {
  const t = sunTimes(JUNE_SOLSTICE, MADRID.lat, MADRID.lon);
  const { altitude, declination } = solarPosition(
    t.solarNoon,
    MADRID.lat,
    MADRID.lon
  );
  const expected = 90 - Math.abs(MADRID.lat - declination);
  assertClose(altitude, expected, 0.3, "noon altitude");
});

test("solar: the sun sits due south at northern-hemisphere solar noon", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  const { azimuth } = solarPosition(t.solarNoon, MADRID.lat, MADRID.lon);
  assertClose(azimuth, 180, 0.5, "azimuth at solar noon in Madrid");
});

test("solar: the sun sits due north at southern-hemisphere solar noon", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), SYDNEY.lat, SYDNEY.lon);
  const { azimuth } = solarPosition(t.solarNoon, SYDNEY.lat, SYDNEY.lon);
  const fromNorth = Math.min(azimuth, 360 - azimuth);
  assertClose(fromNorth, 0, 0.5, "azimuth at solar noon in Sydney");
});

test("solar: the sun rises in the east and sets in the west", () => {
  const t = sunTimes(new Date("2026-03-20T00:00:00Z"), MADRID.lat, MADRID.lon);
  const rise = solarPosition(t.sunrise, MADRID.lat, MADRID.lon).azimuth;
  const set = solarPosition(t.sunset, MADRID.lat, MADRID.lon).azimuth;
  assertClose(rise, 90, 2, "sunrise azimuth near due east at the equinox");
  assertClose(set, 270, 2, "sunset azimuth near due west at the equinox");
});

test("solar: altitude is near zero at the moment of sunrise and sunset", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  for (const [name, when] of [["sunrise", t.sunrise], ["sunset", t.sunset]]) {
    const { altitude } = solarPosition(when, MADRID.lat, MADRID.lon);
    assertClose(altitude, -0.833, 0.2, `altitude at ${name}`);
  }
});

// ---- Orientation ----

test("orient: a shadow falls exactly opposite the sun", () => {
  for (const azimuth of [0, 45, 179, 180, 181, 359.5]) {
    assertClose(shadowAzimuth(azimuth), (azimuth + 180) % 360, 1e-9);
  }
});

test("orient: at northern solar noon the shadow points due north", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  const { shadowPointsTo } = shadowMethod(t.solarNoon, MADRID.lat, MADRID.lon);
  const fromNorth = Math.min(shadowPointsTo, 360 - shadowPointsTo);
  assertClose(fromNorth, 0, 0.5, "shadow bearing at Madrid solar noon");
});

test("orient: at southern solar noon the shadow points due south", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), SYDNEY.lat, SYDNEY.lon);
  const { shadowPointsTo } = shadowMethod(t.solarNoon, SYDNEY.lat, SYDNEY.lon);
  assertClose(shadowPointsTo, 180, 0.5, "shadow bearing at Sydney solar noon");
});

test("orient: the shadow method is unusable with the sun near the horizon", () => {
  const t = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon);
  assert(!shadowMethod(t.sunrise, MADRID.lat, MADRID.lon).usable, "unusable at sunrise");
  assert(shadowMethod(t.solarNoon, MADRID.lat, MADRID.lon).usable, "usable at noon");
});

test("orient: the watch bisector lands on the meridian for each hemisphere", () => {
  const noon = sunTimes(new Date("2026-08-28T00:00:00Z"), MADRID.lat, MADRID.lon).solarNoon;
  const north = watchMethod(noon, MADRID.lat, MADRID.lon);
  const south = watchMethod(noon, SYDNEY.lat, SYDNEY.lon);
  assertEqual(north.bisectorCardinal, "S");
  assertEqual(south.bisectorCardinal, "N");
});

test("orient: Polaris sits at an altitude equal to your latitude", () => {
  assertClose(polarisMethod(40.4168).expectedAltitude, 40.4168, 1e-9);
  assert(!polarisMethod(-33.87).visible, "not visible from the southern hemisphere");
});

test("orient: magnetic and true bearings round-trip through declination", () => {
  for (const declination of [-8, -1, 0, 3.5, 12]) {
    for (const heading of [0, 90, 187.4, 359]) {
      const trueBearing = magneticToTrue(heading, declination);
      assertClose(trueToMagnetic(trueBearing, declination), heading, 1e-9);
    }
  }
});

test("orient: bearing delta takes the short way around the compass", () => {
  assertClose(bearingDelta(350, 10), 20, 1e-9);
  assertClose(bearingDelta(10, 350), 20, 1e-9);
  assertClose(bearingDelta(0, 180), 180, 1e-9);
  assertClose(bearingDelta(90, 90), 0, 1e-9);
});

// ---- Distress signalling ----

test("signals: SOS is one prosign — nine elements, eight gaps, no letter breaks", () => {
  const steps = sosSchedule(200);
  assertEqual(steps.filter((s) => s.on).length, 9, "nine keyed elements");
  assertEqual(steps.filter((s) => !s.on).length, 8, "eight intra-symbol gaps");
});

test("signals: SOS timing is 15 units keyed plus 8 units of gap", () => {
  const steps = sosSchedule(200);
  const on = steps.filter((s) => s.on).reduce((sum, s) => sum + s.ms, 0);
  const off = steps.filter((s) => !s.on).reduce((sum, s) => sum + s.ms, 0);
  assertEqual(on, 15 * 200, "three dots, three dashes, three dots");
  assertEqual(off, 8 * 200);
  assertEqual(scheduleDurationMs(steps), 23 * 200);
});

test("signals: the alpine distress signal is six inside one minute", () => {
  const steps = alpineSchedule(ALPINE.distress, 500);
  assertEqual(steps.filter((s) => s.on).length, 6);
  const spacing = steps[0].ms + steps[1].ms;
  assertEqual(spacing, 10000, "one signal every ten seconds");
});

test("signals: the acknowledgement is three inside one minute", () => {
  const steps = alpineSchedule(ALPINE.answer, 500);
  assertEqual(steps.filter((s) => s.on).length, 3);
  assertEqual(steps[0].ms + steps[1].ms, 20000, "one signal every twenty seconds");
});

test("signals: each round is followed by a full minute of silence", () => {
  const steps = alpineSchedule(ALPINE.distress, 500);
  const last = steps[steps.length - 1];
  assertEqual(last.on, false);
  assertEqual(last.ms, 60000);
});

// ---- Weather signs ----
//
// Content, not computation — so these guard against the failure mode content
// actually has: an entry that is half-filled, mislabelled, or silently
// dropped from a view.

test("weather: every cloud entry is complete and uses a known level", () => {
  const levels = Object.keys(LEVELS);
  const severities = Object.keys(SEVERITY_LABEL);
  for (const cloud of CLOUDS) {
    for (const field of ["code", "name", "appearance", "indicates", "leadTime"]) {
      assert(
        typeof cloud[field] === "string" && cloud[field].trim().length > 0,
        `${cloud.code || "(sin código)"}: campo "${field}" vacío`
      );
    }
    assert(levels.includes(cloud.level), `${cloud.code}: nivel desconocido "${cloud.level}"`);
    assert(
      severities.includes(cloud.severity),
      `${cloud.code}: severidad desconocida "${cloud.severity}"`
    );
  }
});

test("weather: cloud codes are unique", () => {
  const codes = CLOUDS.map((c) => c.code);
  assertEqual(new Set(codes).size, codes.length, "duplicated cloud code");
});

test("weather: grouping by level keeps every cloud and invents none", () => {
  const grouped = cloudsByLevel().flatMap((group) => group.clouds);
  assertEqual(grouped.length, CLOUDS.length, "a cloud was dropped or duplicated");
});

test("weather: severity ordering puts the storm cloud first", () => {
  const worstFirst = cloudsBySeverity();
  assertEqual(worstFirst[0].code, "Cb", "cumulonimbus should sort first");
  assertEqual(worstFirst[worstFirst.length - 1].severity, "calm");
});

test("weather: exactly one cloud is marked as demanding immediate action", () => {
  const dangerous = CLOUDS.filter((c) => c.severity === "danger");
  assertEqual(dangerous.length, 1, "only the cumulonimbus should be 'danger'");
});

test("weather: the module cites its source", () => {
  assert(source().url.startsWith("https://"), "source needs a URL");
  assert(source().label.length > 0, "source needs a label");
});

test("weather: the altitude chart draws every cloud and invents none", () => {
  const dataCodes = new Set(CLOUDS.map((c) => c.code));
  const drawnCodes = placementCodes();

  for (const code of drawnCodes) {
    assert(dataCodes.has(code), `el diagrama dibuja "${code}", que no está en los datos`);
  }
  for (const code of dataCodes) {
    assert(drawnCodes.includes(code), `"${code}" está en los datos pero no se dibuja`);
  }
  assertEqual(new Set(drawnCodes).size, drawnCodes.length, "código duplicado en el diagrama");
});

// ---- Knots ----
//
// The safety-critical fields (steps, image) are filled from a source rather
// than from memory, so these tests guard the discipline around them: nothing
// claims to be finished before it is, and no image can arrive without the
// attribution its licence requires.

test("knots: ids are unique", () => {
  const ids = KNOTS.map((k) => k.id);
  assertEqual(new Set(ids).size, ids.length, "duplicated knot id");
});

test("knots: every knot belongs to a declared group", () => {
  const groups = Object.keys(GROUPS);
  for (const knot of KNOTS) {
    assert(groups.includes(knot.group), `${knot.id}: grupo desconocido "${knot.group}"`);
  }
});

test("knots: descriptive fields are filled in", () => {
  for (const knot of KNOTS) {
    for (const field of ["name", "use", "characteristics"]) {
      assert(
        typeof knot[field] === "string" && knot[field].trim().length > 0,
        `${knot.id}: campo "${field}" vacío`
      );
    }
    assert(Array.isArray(knot.warnings), `${knot.id}: warnings debe ser array`);
    assert(Array.isArray(knot.steps), `${knot.id}: steps debe ser array`);
    assertEqual(typeof knot.reviewed, "boolean", `${knot.id}: reviewed debe ser booleano`);
  }
});

test("knots: an image cannot be added without full attribution", () => {
  for (const knot of KNOTS) {
    if (knot.image == null) continue;
    for (const field of IMAGE_FIELDS) {
      assert(
        typeof knot.image[field] === "string" && knot.image[field].trim().length > 0,
        `${knot.id}: la imagen no declara "${field}" — la licencia lo exige`
      );
    }
  }
});

test("knots: nothing is marked reviewed while its steps or image are missing", () => {
  for (const knot of KNOTS) {
    if (!knot.reviewed) continue;
    assert(knot.steps.length > 0, `${knot.id}: marcado revisado sin pasos`);
    assert(knot.image != null, `${knot.id}: marcado revisado sin ilustración`);
  }
});

test("knots: grouping keeps every knot and invents none", () => {
  const grouped = knotsByGroup().flatMap((group) => group.knots);
  assertEqual(grouped.length, KNOTS.length, "un nudo se ha perdido o duplicado al agrupar");
});

test("knots: missingParts names exactly what an entry still lacks", () => {
  const bare = { steps: [], image: null, reviewed: false };
  assertEqual(missingParts(bare).join(","), "pasos,ilustración,revisión");

  const halfway = { steps: ["uno"], image: { file: "x.svg" }, reviewed: false };
  assertEqual(missingParts(halfway).join(","), "revisión");
  assert(!isComplete(halfway), "no está completo hasta que se revisa");

  const done = { steps: ["uno"], image: { file: "x.svg" }, reviewed: true };
  assertEqual(missingParts(done).length, 0);
  assert(isComplete(done));
});

// Ephemeris cross-check.
//
// Everything above is an invariant that holds by construction, so the suite
// proves internal consistency but not absolute accuracy. Absolute accuracy is
// confirmed by hand against the NOAA Solar Calculator
// (https://gml.noaa.gov/grad/solcalc/) and pinned here as literals once
// checked. Do not fill these in from memory — read them off the calculator.
//
// test("solar: matches NOAA for Madrid on <date>", () => { ... });

const resultsEl =
  typeof document !== "undefined" ? document.getElementById("results") : null;
const summary = await runAll(resultsEl);

if (typeof window !== "undefined") {
  window.__testSummary = summary;
} else if (summary.failCount > 0) {
  process.exit(1);
}
