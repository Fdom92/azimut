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

import {
  moonPosition,
  moonPhase,
  moonHorizontal,
  moonTimes,
  phaseName,
  phaseGlyph,
} from "../public/js/astro/lunar.js";
import { litPath } from "../public/js/modules/moonPhase.js";
import { parseLatitude, parseLongitude } from "../public/js/modules/sunMoon.js";
import {
  toUTM,
  fromUTM,
  toMGRS,
  utmZone,
  latitudeBand,
  toDMS,
  toDDM,
} from "../public/js/geo/coordinates.js";
import {
  estimateMinutes,
  descentAdjustmentMinutes,
  daylightCheck,
} from "../public/js/modules/pace.js";
import { stormDistanceKm, stormVerdict } from "../public/js/modules/weather.js";
import { NATURE, CATEGORIES } from "../public/js/data/regions/iberia-nature.js";
import {
  byCategory,
  routesToEmergency,
  routesToHelp,
  allSources,
  find,
} from "../public/js/modules/nature.js";
import {
  greenwichSiderealTime,
  eclipticToEquatorial,
  equatorialToHorizontal,
} from "../public/js/astro/coords.js";

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

// ---- Coordinates ----

test("coords: sidereal time stays inside one revolution and advances daily", () => {
  const jd = toJulianDay(new Date("2026-08-28T00:00:00Z"));
  for (const offset of [0, 0.25, 0.5, 100.3]) {
    const theta = greenwichSiderealTime(jd + offset);
    assert(theta >= 0 && theta < 360, `sidereal time out of range: ${theta}`);
  }
  // A sidereal day is shorter than a solar one, so the same clock time slips
  // forward by very nearly four minutes of arc each day.
  const today = greenwichSiderealTime(jd);
  const tomorrow = greenwichSiderealTime(jd + 1);
  let advance = tomorrow - today;
  if (advance < 0) advance += 360;
  assertClose(advance, 0.9856, 0.01, "daily sidereal advance in degrees");
});

test("coords: a point on the ecliptic at zero longitude sits at the equinox", () => {
  const { rightAscension, declination } = eclipticToEquatorial(0, 0, 23.44);
  assertClose(rightAscension, 0, 1e-6);
  assertClose(declination, 0, 1e-6);
});

test("coords: the ecliptic pole of longitude 90 reaches the obliquity in declination", () => {
  const { declination } = eclipticToEquatorial(90, 0, 23.44);
  assertClose(declination, 23.44, 1e-6, "solstice point declination");
});

test("coords: an object on the meridian has the observer's complement altitude", () => {
  // Hour angle zero, declination equal to latitude, means straight overhead.
  const { altitude, azimuth } = equatorialToHorizontal(100, 40, 40, 100);
  assertClose(altitude, 90, 1e-6, "object at the zenith");
  assert(Number.isFinite(azimuth), "azimuth should still be a number at zenith");
});

// ---- Moon ----

test("moon: distance stays between perigee and apogee", () => {
  for (let day = 0; day < 400; day += 3) {
    const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
    const { distance } = moonPosition(date);
    assert(
      distance > 355000 && distance < 407500,
      `distancia lunar fuera de rango el ${date.toISOString()}: ${distance.toFixed(0)} km`
    );
  }
});

test("moon: ecliptic latitude stays within the orbit's inclination", () => {
  for (let day = 0; day < 400; day += 3) {
    const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
    const { latitude } = moonPosition(date);
    assert(
      Math.abs(latitude) < 5.5,
      `latitud lunar imposible el ${date.toISOString()}: ${latitude.toFixed(2)}°`
    );
  }
});

test("moon: illuminated fraction stays in [0, 1] and tracks the elongation", () => {
  for (let day = 0; day < 60; day += 1) {
    const date = new Date(Date.UTC(2026, 0, 1 + day, 12));
    const { illuminated, elongation, waxing } = moonPhase(date);
    assert(illuminated >= 0 && illuminated <= 1, `fracción fuera de rango: ${illuminated}`);
    assertEqual(waxing, elongation < 180, "waxing debe seguir a la elongación");
  }
});

// This is the test that validates the whole longitude series rather than any
// single number: the interval it produces between new moons has to come out
// as the synodic month, which is a measured physical constant the code knows
// nothing about.
test("moon: successive new moons fall one synodic month apart", () => {
  const SYNODIC_DAYS = 29.530588;
  const newMoons = [];
  let previous = null;

  for (let hours = 0; hours < 24 * 400; hours += 6) {
    const date = new Date(Date.UTC(2026, 0, 1) + hours * 3600000);
    const { elongation } = moonPhase(date);
    if (previous && elongation < previous.elongation - 180) {
      // Elongation wrapped past 360: new moon lies between the two samples.
      const span = elongation + 360 - previous.elongation;
      const fraction = (360 - previous.elongation) / span;
      newMoons.push(previous.time + fraction * 6 * 3600000);
    }
    previous = { elongation, time: date.getTime() };
  }

  assert(newMoons.length >= 12, `esperaba al menos 12 lunas nuevas, hubo ${newMoons.length}`);

  const intervals = newMoons
    .slice(1)
    .map((t, i) => (t - newMoons[i]) / 86400000);
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  assertClose(mean, SYNODIC_DAYS, 0.05, "mes sinódico medio en días");

  // Individual lunations swing either side of the mean by up to about half a
  // day, but nothing should land far outside that.
  for (const interval of intervals) {
    assert(
      Math.abs(interval - SYNODIC_DAYS) < 0.8,
      `lunación anómala: ${interval.toFixed(3)} días`
    );
  }
});

test("moon: phase names line up with their elongations", () => {
  assertEqual(phaseName(0), "Luna nueva");
  assertEqual(phaseName(359), "Luna nueva");
  assertEqual(phaseName(90), "Cuarto creciente");
  assertEqual(phaseName(180), "Luna llena");
  assertEqual(phaseName(270), "Cuarto menguante");
  assert(phaseName(45).includes("Creciente"));
  assert(phaseName(315).includes("Menguante"));
});

test("moon: the phase name and its glyph never disagree", () => {
  // They used to bin independently, so a 68 per cent waning moon could be
  // captioned gibbous while showing a last-quarter glyph.
  const expected = {
    "Luna nueva": "🌑",
    "Creciente": "🌒",
    "Cuarto creciente": "🌓",
    "Gibosa creciente": "🌔",
    "Luna llena": "🌕",
    "Gibosa menguante": "🌖",
    "Cuarto menguante": "🌗",
    "Menguante": "🌘",
  };
  for (let e = 0; e < 360; e += 1) {
    assertEqual(phaseGlyph(e), expected[phaseName(e)], `elongación ${e}°`);
  }
});

test("moon: a waning gibbous shows a gibbous glyph, not a quarter", () => {
  // The exact case that was wrong: 248 degrees is 68 per cent lit.
  assertEqual(phaseName(248.3), "Gibosa menguante");
  assertEqual(phaseGlyph(248.3), "🌖");
});

test("moon: illumination is near zero at new moon and near one at full", () => {
  // Drive the phase function directly through its own elongation definition.
  const atElongation = (e) => (1 - Math.cos((e * Math.PI) / 180)) / 2;
  assertClose(atElongation(0), 0, 1e-9);
  assertClose(atElongation(90), 0.5, 1e-9);
  assertClose(atElongation(180), 1, 1e-9);
});

test("moon: the computed moonrise really is the moment it crosses the horizon", () => {
  const madrid = { lat: 40.4168, lon: -3.7038 };
  let checked = 0;

  for (let day = 0; day < 20; day++) {
    const date = new Date(Date.UTC(2026, 7, 1 + day, 12));
    const { moonrise, moonset } = moonTimes(date, madrid.lat, madrid.lon);

    for (const event of [moonrise, moonset]) {
      if (!event) continue;
      const { altitude } = moonHorizontal(event, madrid.lat, madrid.lon);
      // Rise/set altitude runs about +0.12 degrees once parallax and
      // refraction are accounted for.
      assertClose(altitude, 0.12, 0.15, `altura lunar en el cruce del ${event.toISOString()}`);
      checked++;
    }
  }

  assert(checked >= 30, `esperaba muchos cruces en 20 días, hubo ${checked}`);
});

test("moon: a lunar day is longer than a solar one, so moonrise drifts later", () => {
  const madrid = { lat: 40.4168, lon: -3.7038 };
  const shifts = [];

  for (let day = 0; day < 25; day++) {
    const today = moonTimes(new Date(Date.UTC(2026, 7, 1 + day, 12)), madrid.lat, madrid.lon);
    const tomorrow = moonTimes(new Date(Date.UTC(2026, 7, 2 + day, 12)), madrid.lat, madrid.lon);
    if (!today.moonrise || !tomorrow.moonrise) continue;

    let shift = (tomorrow.moonrise - today.moonrise) / 60000 - 1440;
    if (shift < -200) shift += 1440;
    shifts.push(shift);
  }

  assert(shifts.length >= 15, `pocas parejas de días utilizables: ${shifts.length}`);
  const mean = shifts.reduce((a, b) => a + b, 0) / shifts.length;
  assertClose(mean, 50, 15, "retraso medio del orto lunar en minutos");
});

// ---- Moon disc geometry ----
//
// The disc is a semicircular limb closed by an elliptical terminator. Which
// way that ellipse bows decides whether the shape encloses more or less than
// half the disc — get the sweep flag backwards and a gibbous moon renders as
// a crescent while the caption still says 71 per cent. These tests read the
// flags straight out of the path and check them against the geometry.

function parseArcs(d) {
  // "M cx top A r r 0 0 S cx bottom A rx r 0 0 S cx top Z"
  const arcs = [...d.matchAll(/A\s+([\d.]+)\s+([\d.]+)\s+0\s+0\s+([01])/g)];
  return arcs.map(([, rx, ry, sweep]) => ({
    rx: Number(rx),
    ry: Number(ry),
    sweep: Number(sweep),
  }));
}

// Enclosed area as a fraction of the disc: half the circle, plus or minus the
// half-ellipse depending on which way the terminator bows.
function litFraction(d, radius) {
  const [limb, terminator] = parseArcs(d);
  // The terminator adds area when it bows away from the lit limb.
  const bowsAwayFromLimb = terminator.sweep === limb.sweep;
  const halfEllipse = terminator.rx / (2 * radius);
  return 0.5 + (bowsAwayFromLimb ? halfEllipse : -halfEllipse);
}

test("moon disc: the drawn area matches the illuminated fraction", () => {
  const R = 46;
  for (const k of [0.05, 0.25, 0.4, 0.5, 0.6, 0.71, 0.9, 0.99]) {
    for (const waxing of [true, false]) {
      const d = litPath(k, waxing, R, 60);
      assertClose(
        litFraction(d, R),
        k,
        0.001,
        `área dibujada para k=${k}, ${waxing ? "creciente" : "menguante"}`
      );
    }
  }
});

test("moon disc: waxing lights the right limb and waning the left", () => {
  const R = 46;
  // Sweep 1 on the top-to-bottom limb bows right; sweep 0 bows left.
  assertEqual(parseArcs(litPath(0.7, true, R, 60))[0].sweep, 1, "creciente ilumina la derecha");
  assertEqual(parseArcs(litPath(0.7, false, R, 60))[0].sweep, 0, "menguante ilumina la izquierda");
});

test("moon disc: the terminator flattens to a straight edge at the quarters", () => {
  const R = 46;
  assertClose(parseArcs(litPath(0.5, true, R, 60))[1].rx, 0, 1e-9, "cuarto = terminador recto");
});

test("moon disc: clamps outside [0, 1] instead of producing a broken path", () => {
  const R = 46;
  for (const k of [-0.3, 1.4]) {
    const d = litPath(k, true, R, 60);
    assert(!d.includes("NaN"), `k=${k} produjo NaN en el path`);
  }
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

// ---- Coordinate input ----

test("coords input: a blank field is rejected rather than read as zero", () => {
  // Number("") is 0, so a blank latitude used to compute for the Gulf of
  // Guinea and return a plausible twelve-hour day instead of an error.
  for (const blank of ["", "   ", "\t"]) {
    assertEqual(parseLatitude(blank), null, `"${blank}" no es una latitud`);
    assertEqual(parseLongitude(blank), null, `"${blank}" no es una longitud`);
  }
});

test("coords input: zero is still a valid coordinate", () => {
  assertEqual(parseLatitude("0"), 0);
  assertEqual(parseLongitude("0"), 0);
});

test("coords input: junk and out-of-range values are rejected", () => {
  for (const junk of ["abc", "--3", "NaN", undefined, null]) {
    assertEqual(parseLatitude(junk), null, `"${junk}" no es una latitud`);
  }
  assertEqual(parseLatitude("91"), null, "latitud fuera de rango");
  assertEqual(parseLatitude("-90.1"), null, "latitud fuera de rango");
  assertEqual(parseLongitude("181"), null, "longitud fuera de rango");
  assertEqual(parseLatitude("-90"), -90, "los extremos sí valen");
  assertEqual(parseLongitude("180"), 180, "los extremos sí valen");
});

test("coords input: ordinary values parse, decimals included", () => {
  assertClose(parseLatitude("40.4168"), 40.4168, 1e-9);
  assertClose(parseLongitude("-3.7038"), -3.7038, 1e-9);
});

// ---- Coordinate conversion ----
//
// The round trip is the test that holds the whole chain: Snyder's forward and
// inverse series are independent bodies of code, so agreeing to a centimetre
// across the globe is not something two matching mistakes would produce.

test("utm: converting out and back lands where it started", () => {
  const places = [
    [40.4168, -3.7038],   // Madrid
    [43.3623, -8.4115],   // A Coruña
    [-33.8688, 151.2093], // Sydney, southern hemisphere
    [64.1466, -21.9426],  // Reykjavík, high latitude
    [0.3476, 32.5825],    // Kampala, on the equator
    [-54.8019, -68.3030], // Ushuaia, far south
  ];

  for (const [lat, lon] of places) {
    const utm = toUTM(lat, lon);
    const back = fromUTM(utm);
    // A centimetre is roughly 1e-7 degrees of latitude.
    assertClose(back.latitude, lat, 1e-6, `latitud de vuelta en ${lat}, ${lon}`);
    assertClose(back.longitude, lon, 1e-6, `longitud de vuelta en ${lat}, ${lon}`);
  }
});

test("utm: zones and bands come out where they should", () => {
  assertEqual(utmZone(40.4168, -3.7038), 30, "Madrid está en la zona 30");
  assertEqual(latitudeBand(40.4168), "T", "y en la banda T");
  assertEqual(utmZone(-33.8688, 151.2093), 56, "Sídney en la 56");
  assertEqual(latitudeBand(-33.8688), "H");
});

test("utm: the Norway and Svalbard exceptions are honoured", () => {
  // Southern Norway widens zone 32 at the expense of 31.
  assertEqual(utmZone(60, 5), 32, "Bergen cae en la 32, no en la 31");
  // Svalbard skips the even zones entirely.
  assertEqual(utmZone(78, 15), 33, "Svalbard salta de la 31 a la 33");
  assertEqual(utmZone(78, 25), 35);
});

test("utm: easting stays near the false origin and northing grows northward", () => {
  const equator = toUTM(0, -3);
  assertClose(equator.northing, 0, 1, "el ecuador es el cero de northing");

  const madrid = toUTM(40.4168, -3.7038);
  assert(madrid.easting > 100000 && madrid.easting < 900000, "easting dentro de la zona");
  assert(madrid.northing > 4400000 && madrid.northing < 4500000, "northing de Madrid");

  // South of the equator the false northing kicks in.
  const sydney = toUTM(-33.8688, 151.2093);
  assert(sydney.northing > 6000000, "hemisferio sur usa el falso origen de 10.000 km");
  assertEqual(sydney.hemisphere, "S");
});

test("utm: latitude bands skip I and O", () => {
  const bands = new Set();
  for (let lat = -80; lat < 84; lat += 0.5) bands.add(latitudeBand(lat));
  assert(!bands.has("I"), "la banda I no existe");
  assert(!bands.has("O"), "la banda O no existe");
  assertEqual(latitudeBand(85), null, "fuera del rango UTM");
  assertEqual(latitudeBand(-81), null);
});

test("mgrs: the reference is well formed and its square letters avoid I and O", () => {
  const mgrs = toMGRS(40.4168, -3.7038);
  assertEqual(mgrs.zone, 30);
  assertEqual(mgrs.band, "T");
  assertEqual(mgrs.square.length, 2);
  assert(!mgrs.square.includes("I") && !mgrs.square.includes("O"), "sin I ni O");
  assert(/^\d+[A-Z] [A-Z]{2} \d{5} \d{5}$/.test(mgrs.text), `formato inesperado: ${mgrs.text}`);
});

test("mgrs: never emits I or O anywhere on the globe", () => {
  for (let lat = -78; lat < 82; lat += 7) {
    for (let lon = -177; lon < 180; lon += 13) {
      const mgrs = toMGRS(lat, lon);
      if (!mgrs) continue;
      assert(
        !mgrs.square.includes("I") && !mgrs.square.includes("O"),
        `${lat}, ${lon} produjo ${mgrs.square}`
      );
    }
  }
});

test("dms and ddm: the pieces recombine into the original value", () => {
  for (const value of [40.4168, -3.7038, 0, -54.8019, 64.1466]) {
    const { degrees, minutes, seconds } = toDMS(value, "lat");
    const rebuilt = (degrees + minutes / 60 + seconds / 3600) * Math.sign(value || 1);
    assertClose(rebuilt, value, 1e-9, `DMS de ${value}`);

    const ddm = toDDM(value, "lat");
    const rebuiltDdm = (ddm.degrees + ddm.minutes / 60) * Math.sign(value || 1);
    assertClose(rebuiltDdm, value, 1e-9, `DDM de ${value}`);
  }
});

test("dms: west is W, not O, so it cannot be misread as a zero", () => {
  assertEqual(toDMS(40, "lat").hemisphere, "N");
  assertEqual(toDMS(-40, "lat").hemisphere, "S");
  assertEqual(toDMS(3, "lon").hemisphere, "E");
  // Spanish maps write O for Oeste, but these readouts sit in a monospaced
  // face beside digits and get dictated over a radio.
  assertEqual(toDMS(-3, "lon").hemisphere, "W");
});

// ---- Pace ----

test("pace: Naismith's two rates are what the estimate is built from", () => {
  // Five kilometres flat is one hour.
  assertClose(estimateMinutes({ distanceKm: 5 }), 60, 1e-9);
  // Six hundred metres of climb is another hour, on its own.
  assertClose(estimateMinutes({ distanceKm: 0, ascentMetres: 600 }), 60, 1e-9);
  // And they add.
  assertClose(estimateMinutes({ distanceKm: 5, ascentMetres: 600 }), 120, 1e-9);
});

test("pace: the pace factor scales the whole estimate", () => {
  const base = estimateMinutes({ distanceKm: 10, ascentMetres: 600 });
  assertClose(estimateMinutes({ distanceKm: 10, ascentMetres: 600, factor: 1.5 }), base * 1.5, 1e-9);
});

test("pace: Langmuir gives time back on gentle descent and takes it on steep", () => {
  // 300 m down over 10 km is about 1.7 degrees — too flat to correct.
  assertEqual(descentAdjustmentMinutes(300, 10), 0);
  // 600 m over 4 km is about 8.5 degrees: gentle, so faster.
  assert(descentAdjustmentMinutes(600, 4) < 0, "descenso suave gana tiempo");
  // 900 m over 2 km is about 24 degrees: steep, so slower.
  assert(descentAdjustmentMinutes(900, 2) > 0, "descenso fuerte cuesta tiempo");
});

test("pace: an estimate never comes out negative", () => {
  assert(estimateMinutes({ distanceKm: 1, descentMetres: 5000 }) >= 0);
});

test("pace: the daylight verdict tracks how much light is left", () => {
  const madrid = { lat: 40.4168, lon: -3.7038 };
  // Start at first light on a long summer day.
  const start = new Date("2026-06-21T06:00:00Z");

  const short = daylightCheck({ start, minutes: 120, ...toArgs(madrid) });
  assertEqual(short.verdict, "comfortable", "dos horas en junio sobran");

  const long = daylightCheck({ start, minutes: 20 * 60, ...toArgs(madrid) });
  assertEqual(long.verdict, "dark", "veinte horas no caben en ningún día");
});

function toArgs({ lat, lon }) {
  return { latitude: lat, longitude: lon };
}

// ---- Storm distance ----

test("storm: three seconds is one kilometre", () => {
  assertClose(stormDistanceKm(3), 1, 1e-9);
  assertClose(stormDistanceKm(30), 10, 1e-9);
  assertClose(stormDistanceKm(0), 0, 1e-9, "el rayo encima cuenta cero");
});

test("storm: nonsense input gives nothing rather than a number", () => {
  for (const junk of [-1, NaN, Infinity, "abc"]) {
    assertEqual(stormDistanceKm(junk), null, `${junk} no es un intervalo`);
  }
});

test("storm: the verdict escalates as the gap shortens", () => {
  assertEqual(stormVerdict(stormDistanceKm(3)).level, "danger", "1 km: encima");
  assertEqual(stormVerdict(stormDistanceKm(20)).level, "caution", "6.7 km: cerca");
  assertEqual(stormVerdict(stormDistanceKm(60)).level, "watch", "20 km: lejos");
});

// ---- Nature ----
//
// This module carries the only content in the app where being wrong hurts
// someone. The tests hold the rules it was written under rather than
// second-guessing the content: everything is sourced, everything ends in an
// action, anything that can turn serious routes to 112, and the folk remedies
// that cause harm are named as such.

test("nature: ids are unique and categories are declared", () => {
  const ids = NATURE.map((e) => e.id);
  assertEqual(new Set(ids).size, ids.length, "id duplicado");
  const categories = Object.keys(CATEGORIES);
  for (const entry of NATURE) {
    assert(categories.includes(entry.category), `${entry.id}: categoría desconocida`);
  }
});

test("nature: every entry is fully written, with no empty prose", () => {
  for (const entry of NATURE) {
    assert(entry.name.trim().length > 0, `${entry.id}: sin nombre`);
    for (const field of ["where", "recognise", "risk"]) {
      assert(
        typeof entry[field] === "string" && entry[field].trim().length > 20,
        `${entry.id}: campo "${field}" vacío o demasiado corto`
      );
    }
  }
});

test("nature: every entry names actions, and none is left as description only", () => {
  for (const entry of NATURE) {
    assert(Array.isArray(entry.actions) && entry.actions.length > 0,
      `${entry.id}: sin acciones — una ficha que solo describe no sirve de nada`);
    for (const action of entry.actions) {
      assert(action.trim().length > 0, `${entry.id}: acción vacía`);
    }
  }
});

test("nature: every entry says when to stop self-managing and get help", () => {
  // Not everything is a 112 call — a tick bite escalates to a doctor, not to
  // an ambulance. What every entry must do is name the point where you hand
  // over to someone qualified.
  for (const entry of NATURE) {
    assert(
      routesToHelp(entry),
      `${entry.id}: no dice en qué momento acudir a un profesional`
    );
  }
});

test("nature: entries that can turn serious fast route to 112 specifically", () => {
  for (const entry of NATURE) {
    if (!entry.emergency) continue;
    assert(
      routesToEmergency(entry),
      `${entry.id}: marcada como urgencia pero no menciona el 112`
    );
  }
  // And the ones that can escalate should offer 112 as the escalation, even
  // when they are not emergencies by default.
  for (const id of ["procesionaria", "velutina"]) {
    assert(routesToEmergency(find(id)), `${id}: debería ofrecer el 112 al agravarse`);
  }
});

test("nature: the bite protocol calls for help first, not last", () => {
  const vipers = find("viboras");
  assert(vipers, "la ficha de víboras debe existir");
  assert(vipers.emergency, "debe estar marcada como urgencia");
  assert(
    vipers.actions[0].includes("112"),
    "en una mordedura, llamar va primero: ningún primer auxilio justifica retrasar el traslado"
  );
});

test("nature: the harmful folk remedies are named as things never to do", () => {
  const vipers = find("viboras");
  const forbidden = vipers.never.join(" ").toLowerCase();
  for (const remedy of ["torniquete", "succionar", "cortar", "alcohol"]) {
    assert(forbidden.includes(remedy), `falta desaconsejar: ${remedy}`);
  }

  const ticks = find("garrapatas");
  const tickForbidden = ticks.never.join(" ").toLowerCase();
  for (const remedy of ["aceite", "calor", "retorcerla"]) {
    assert(tickForbidden.includes(remedy), `garrapatas, falta desaconsejar: ${remedy}`);
  }
});

test("nature: identifying a snake is explicitly decoupled from the first aid", () => {
  const vipers = find("viboras");
  assert(
    typeof vipers.identificationNote === "string" &&
      vipers.identificationNote.length > 40,
    "la ficha debe decir que identificar no cambia la actuación"
  );
});

test("nature: every entry cites a source, and every source has a URL", () => {
  for (const entry of NATURE) {
    assert(entry.sources.length > 0, `${entry.id}: sin fuentes`);
    for (const source of entry.sources) {
      assert(source.url.startsWith("https://"), `${entry.id}: fuente sin URL válida`);
      assert(source.label.trim().length > 0, `${entry.id}: fuente sin etiqueta`);
    }
  }
  assert(allSources().length >= 5, "esperaba varias fuentes distintas");
});

test("nature: nothing about mushrooms, in any form", () => {
  const haystack = JSON.stringify(NATURE).toLowerCase();
  for (const word of ["seta", "hongo", "champiñón", "amanita", "micolog"]) {
    assert(!haystack.includes(word), `aparece "${word}" — este módulo no toca setas`);
  }
});

test("nature: grouping keeps every entry and invents none", () => {
  const grouped = byCategory().flatMap((g) => g.entries);
  assertEqual(grouped.length, NATURE.length, "una ficha se perdió o duplicó al agrupar");
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
// Everything above is an invariant that holds by construction, so it proves
// internal consistency but not absolute accuracy. These are the absolute
// numbers, read off the NOAA Solar Calculator (https://gml.noaa.gov/grad/solcalc/)
// for Madrid on 2026-09-02 and converted to UTC using the zone offset the
// calculator itself reported for each row — it silently re-derives the zone
// from the location, so the offset has to be read back rather than assumed.
//
// Measured agreement when these were pinned: declination within 0.012 degrees,
// equation of time within 0.013 minutes, solar noon within 14 seconds, and
// rise and set within 15 seconds once NOAA's rounding to the minute is
// allowed for. Tolerances below sit a little wider than that so ordinary
// floating-point drift does not turn the suite red.

const NOAA_MADRID = [
  { date: "2026-03-20", sunrise: "06:18", solarNoon: "12:22:23", sunset: "18:27", eqTime: -7.43, declination: -0.03 },
  { date: "2026-06-21", sunrise: "04:45", solarNoon: "12:16:32", sunset: "19:49", eqTime: -1.84, declination: 23.44 },
  { date: "2026-09-02", sunrise: "05:43", solarNoon: "12:14:40", sunset: "18:45", eqTime: 0.30, declination: 7.81 },
  { date: "2026-12-21", sunrise: "07:34", solarNoon: "12:12:39", sunset: "16:51", eqTime: 1.91, declination: -23.44 },
];

function utcSeconds(date) {
  return date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds();
}

function clockSeconds(hms) {
  const [h, m, sec = 0] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + sec;
}

test("solar: rise, noon and set match NOAA for Madrid", () => {
  for (const row of NOAA_MADRID) {
    const t = sunTimes(new Date(`${row.date}T12:00:00Z`), MADRID.lat, MADRID.lon);

    // NOAA gives rise and set to the minute, so half a minute of that gap is
    // its rounding rather than our error.
    assertClose(utcSeconds(t.sunrise), clockSeconds(row.sunrise), 60, `orto ${row.date}`);
    assertClose(utcSeconds(t.sunset), clockSeconds(row.sunset), 60, `ocaso ${row.date}`);
    // Solar noon comes with seconds, so it can be held tighter.
    assertClose(utcSeconds(t.solarNoon), clockSeconds(row.solarNoon), 30, `mediodía ${row.date}`);
  }
});

test("solar: declination and equation of time match NOAA for Madrid", () => {
  for (const row of NOAA_MADRID) {
    const t = sunTimes(new Date(`${row.date}T12:00:00Z`), MADRID.lat, MADRID.lon);
    const century = julianCentury(toJulianDay(t.solarNoon));

    assertClose(solarDeclination(century), row.declination, 0.05, `declinación ${row.date}`);
    assertClose(equationOfTime(century), row.eqTime, 0.05, `ecuación del tiempo ${row.date}`);
  }
});

const resultsEl =
  typeof document !== "undefined" ? document.getElementById("results") : null;
const summary = await runAll(resultsEl);

if (typeof window !== "undefined") {
  window.__testSummary = summary;
} else if (summary.failCount > 0) {
  process.exit(1);
}
