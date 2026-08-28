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
