// Position and phase of the moon. Meeus, Astronomical Algorithms, ch. 47 and 48.
//
// The full series carries 60 periodic terms for longitude and distance and 60
// more for latitude. This is a truncation to the dominant terms, which holds
// longitude to a few hundredths of a degree — worth a couple of minutes on a
// rise time, and far below anything that matters for deciding whether there
// will be light to walk by. The truncation is the deliberate trade, not an
// oversight: the full tables would triple the file for accuracy nobody
// standing on a hillside can use.
//
// The moon moves roughly 13 degrees a day, far too fast for the closed-form
// hour-angle trick the sun uses, so rise and set are found by sampling the
// altitude across the day and interpolating the crossings.

import {
  rad,
  deg,
  julianCentury,
  julianDayStart,
  toJulianDay,
  fromJulianDay,
  normalizeDegrees,
} from "./julian.js";

import { obliquityCorrection } from "./solar.js";
import { eclipticToEquatorial, equatorialToHorizontal, localSiderealTime } from "./coords.js";

const EARTH_RADIUS_KM = 6378.14;

// [D, M, M', F, longitude coefficient (1e-6 deg), distance coefficient (1e-3 km)]
const TERMS_LON_DIST = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, -1, -2, 0, -2602, 0],
  [1, 0, 1, 0, 2390, 10056],
  [2, -2, 0, 0, -2348, 6322],
  [0, 2, 0, 0, 2236, -9884],
];

// [D, M, M', F, latitude coefficient (1e-6 deg)]
const TERMS_LAT = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410],
  [0, 1, 0, -1, -1344],
  [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021],
  [4, 0, -1, 1, 833],
];

// Geocentric ecliptic position and distance.
export function moonPosition(date) {
  const jd = toJulianDay(date);
  const t = julianCentury(jd);

  // Mean elements.
  const lPrime = normalizeDegrees(
    218.3164477 + 481267.88123421 * t - 0.0015786 * t * t +
      (t ** 3) / 538841 - (t ** 4) / 65194000
  );
  const d = normalizeDegrees(
    297.8501921 + 445267.1114034 * t - 0.0018819 * t * t +
      (t ** 3) / 545868 - (t ** 4) / 113065000
  );
  const m = normalizeDegrees(
    357.5291092 + 35999.0502909 * t - 0.0001536 * t * t + (t ** 3) / 24490000
  );
  const mPrime = normalizeDegrees(
    134.9633964 + 477198.8675055 * t + 0.0087414 * t * t +
      (t ** 3) / 69699 - (t ** 4) / 14712000
  );
  const f = normalizeDegrees(
    93.272095 + 483202.0175233 * t - 0.0036539 * t * t -
      (t ** 3) / 3526000 + (t ** 4) / 863310000
  );

  // The sun's eccentricity drifts, and terms involving M have to follow it.
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;

  const a1 = normalizeDegrees(119.75 + 131.849 * t);
  const a2 = normalizeDegrees(53.09 + 479264.29 * t);
  const a3 = normalizeDegrees(313.45 + 481266.484 * t);

  let sumL = 0;
  let sumR = 0;
  for (const [cd, cm, cmp, cf, cl, cr] of TERMS_LON_DIST) {
    const argument =
      (cd * d + cm * m + cmp * mPrime + cf * f) * rad;
    const eccentricity = Math.abs(cm) === 1 ? e : Math.abs(cm) === 2 ? e * e : 1;
    sumL += cl * eccentricity * Math.sin(argument);
    sumR += cr * eccentricity * Math.cos(argument);
  }

  let sumB = 0;
  for (const [cd, cm, cmp, cf, cb] of TERMS_LAT) {
    const argument = (cd * d + cm * m + cmp * mPrime + cf * f) * rad;
    const eccentricity = Math.abs(cm) === 1 ? e : Math.abs(cm) === 2 ? e * e : 1;
    sumB += cb * eccentricity * Math.sin(argument);
  }

  // Additive corrections from Venus, Jupiter and the flattening of the Earth.
  sumL += 3958 * Math.sin(a1 * rad)
        + 1962 * Math.sin((lPrime - f) * rad)
        + 318 * Math.sin(a2 * rad);

  sumB += -2235 * Math.sin(lPrime * rad)
        + 382 * Math.sin(a3 * rad)
        + 175 * Math.sin((a1 - f) * rad)
        + 175 * Math.sin((a1 + f) * rad)
        + 127 * Math.sin((lPrime - mPrime) * rad)
        - 115 * Math.sin((lPrime + mPrime) * rad);

  const longitude = normalizeDegrees(lPrime + sumL / 1e6);
  const latitude = sumB / 1e6;
  const distance = 385000.56 + sumR / 1000; // km

  return { longitude, latitude, distance, julianDay: jd };
}

// Altitude and azimuth for an observer, plus the distance the phase needs.
export function moonHorizontal(date, latitude, longitude) {
  const position = moonPosition(date);
  const t = julianCentury(position.julianDay);
  const obliquity = obliquityCorrection(t);

  const equatorial = eclipticToEquatorial(
    position.longitude,
    position.latitude,
    obliquity
  );
  const lst = localSiderealTime(position.julianDay, longitude);
  const horizontal = equatorialToHorizontal(
    equatorial.rightAscension,
    equatorial.declination,
    latitude,
    lst
  );

  return { ...horizontal, ...position, ...equatorial };
}

// Illuminated fraction and where in the cycle the moon is.
// Elongation from the sun is enough: k = (1 - cos ψ) / 2.
export function moonPhase(date) {
  const moon = moonPosition(date);
  const t = julianCentury(moon.julianDay);

  // The sun's apparent longitude, to the accuracy this comparison needs.
  const sunMeanLong = normalizeDegrees(280.46646 + t * (36000.76983 + t * 0.0003032));
  const sunAnomaly = normalizeDegrees(357.52911 + t * (35999.05029 - 0.0001537 * t));
  const centre =
    Math.sin(sunAnomaly * rad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * sunAnomaly * rad) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * sunAnomaly * rad) * 0.000289;
  const sunLongitude = normalizeDegrees(sunMeanLong + centre);

  const elongation = normalizeDegrees(moon.longitude - sunLongitude);
  const illuminated = (1 - Math.cos(elongation * rad)) / 2;

  return {
    elongation,
    illuminated,
    waxing: elongation < 180,
    name: phaseName(elongation),
    glyph: phaseGlyph(elongation),
    distance: moon.distance,
  };
}

// Name and glyph come off the same boundaries. Splitting them means the
// caption and the icon can disagree — a 68 per cent waning moon labelled
// gibbous while showing a last-quarter glyph — which is exactly what happened
// when the glyph binned by a plain round(elongation / 45).
const PHASES = [
  { limit: 10, name: "Luna nueva", glyph: "🌑" },
  { limit: 80, name: "Creciente", glyph: "🌒" },
  { limit: 100, name: "Cuarto creciente", glyph: "🌓" },
  { limit: 170, name: "Gibosa creciente", glyph: "🌔" },
  { limit: 190, name: "Luna llena", glyph: "🌕" },
  { limit: 260, name: "Gibosa menguante", glyph: "🌖" },
  { limit: 280, name: "Cuarto menguante", glyph: "🌗" },
  { limit: 350, name: "Menguante", glyph: "🌘" },
  { limit: 360, name: "Luna nueva", glyph: "🌑" },
];

function phaseBucket(elongation) {
  const e = normalizeDegrees(elongation);
  return PHASES.find((phase) => e < phase.limit) ?? PHASES[PHASES.length - 1];
}

// Eight-point naming, with the quarters given a narrow window so "cuarto
// creciente" means the quarter rather than anything vaguely half-lit.
export function phaseName(elongation) {
  return phaseBucket(elongation).name;
}

export function phaseGlyph(elongation) {
  return phaseBucket(elongation).glyph;
}

// Apparent altitude of the moon's centre at rise and set. Its parallax is
// large enough — nearly a degree — that ignoring it costs minutes.
function riseSetAltitude(distanceKm) {
  const parallax = Math.asin(EARTH_RADIUS_KM / distanceKm) * deg;
  return 0.7275 * parallax - 0.5667;
}

const SAMPLE_MINUTES = 5;

// Rise and set are found by walking the day and interpolating the crossings,
// because the moon moves too fast for the sun's closed form. A day can hold
// no rise, no set, or neither — the moon's day is about 24h50m, so it
// routinely skips one.
export function moonTimes(date, latitude, longitude) {
  const jdStart = julianDayStart(date);
  const startMs = fromJulianDay(jdStart).getTime();

  let previous = null;
  let rise = null;
  let set = null;

  for (let minutes = 0; minutes <= 1440; minutes += SAMPLE_MINUTES) {
    const at = new Date(startMs + minutes * 60000);
    const { altitude, distance } = moonHorizontal(at, latitude, longitude);
    const relative = altitude - riseSetAltitude(distance);

    if (previous) {
      if (previous.relative < 0 && relative >= 0 && rise === null) {
        rise = interpolateCrossing(previous, { minutes, relative }, startMs);
      }
      if (previous.relative >= 0 && relative < 0 && set === null) {
        set = interpolateCrossing(previous, { minutes, relative }, startMs);
      }
    }
    previous = { minutes, relative };
  }

  const alwaysUp = rise === null && set === null && previous.relative >= 0;

  return {
    moonrise: rise,
    moonset: set,
    alwaysUp,
    alwaysDown: rise === null && set === null && !alwaysUp,
  };
}

function interpolateCrossing(before, after, startMs) {
  const span = after.relative - before.relative;
  const fraction = span === 0 ? 0 : -before.relative / span;
  const minutes = before.minutes + fraction * (after.minutes - before.minutes);
  return new Date(startMs + minutes * 60000);
}
