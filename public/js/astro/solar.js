// Solar position and rise/set times.
// NOAA's formulation of Meeus, Astronomical Algorithms, ch. 25 and 15.
// Accurate to well under a minute for the years and latitudes this app targets.

import {
  rad,
  deg,
  julianCentury,
  julianDayStart,
  normalizeDegrees,
} from "./julian.js";

// Zenith angles (degrees from vertical) for each event.
export const ZENITH = {
  sunrise: 90.833, // includes refraction and the sun's apparent radius
  civil: 96,
  nautical: 102,
  astronomical: 108,
};

function geomMeanLongSun(t) {
  return normalizeDegrees(280.46646 + t * (36000.76983 + t * 0.0003032));
}

function geomMeanAnomalySun(t) {
  return 357.52911 + t * (35999.05029 - 0.0001537 * t);
}

function eccentricityEarthOrbit(t) {
  return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

function sunEqOfCenter(t) {
  const m = geomMeanAnomalySun(t) * rad;
  return (
    Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m) * 0.000289
  );
}

function sunApparentLong(t) {
  const trueLong = geomMeanLongSun(t) + sunEqOfCenter(t);
  const omega = 125.04 - 1934.136 * t;
  return trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);
}

export function obliquityCorrection(t) {
  const seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  const meanObliquity = 23 + (26 + seconds / 60) / 60;
  const omega = 125.04 - 1934.136 * t;
  return meanObliquity + 0.00256 * Math.cos(omega * rad);
}

export function solarDeclination(t) {
  const e = obliquityCorrection(t) * rad;
  const lambda = sunApparentLong(t) * rad;
  return Math.asin(Math.sin(e) * Math.sin(lambda)) * deg;
}

// Apparent solar time minus mean solar time, in minutes.
export function equationOfTime(t) {
  const epsilon = obliquityCorrection(t) * rad;
  const l0 = geomMeanLongSun(t) * rad;
  const e = eccentricityEarthOrbit(t);
  const m = geomMeanAnomalySun(t) * rad;

  let y = Math.tan(epsilon / 2);
  y *= y;

  const minutes =
    y * Math.sin(2 * l0) -
    2 * e * Math.sin(m) +
    4 * e * y * Math.sin(m) * Math.cos(2 * l0) -
    0.5 * y * y * Math.sin(4 * l0) -
    1.25 * e * e * Math.sin(2 * m);

  return minutes * deg * 4;
}

// Hour angle in degrees between solar noon and the moment the sun reaches
// `zenith`. Returns null when the event does not occur that day; `polar`
// says which side of the sky the sun stayed on.
function hourAngle(latitude, declination, zenith) {
  const lat = latitude * rad;
  const decl = declination * rad;
  const cosH =
    (Math.cos(zenith * rad) - Math.sin(lat) * Math.sin(decl)) /
    (Math.cos(lat) * Math.cos(decl));

  if (cosH > 1) return { angle: null, polar: "below" }; // never gets that high
  if (cosH < -1) return { angle: null, polar: "above" }; // never gets that low
  return { angle: Math.acos(cosH) * deg, polar: null };
}

// Minutes after 00:00 UTC at which the sun crosses the local meridian.
function solarNoonMinutes(jdStart, longitude) {
  // First pass with the day's midpoint, then refine at the noon we just found.
  const approx = 720 - 4 * longitude;
  const tNoon = julianCentury(jdStart + approx / 1440);
  const refined = 720 - 4 * longitude - equationOfTime(tNoon);
  const tRefined = julianCentury(jdStart + refined / 1440);
  return 720 - 4 * longitude - equationOfTime(tRefined);
}

function minutesToDate(jdStart, minutes) {
  if (minutes == null) return null;
  const epochMs = (jdStart - 2440587.5) * 86400000;
  return new Date(epochMs + minutes * 60000);
}

// Sun altitude and azimuth at an instant. Azimuth is degrees clockwise from
// true north — the value the orientation module consumes.
export function solarPosition(date, latitude, longitude) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = julianCentury(jd);
  const declination = solarDeclination(t);

  const minutesUtc =
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60;

  const trueSolarTime = normalizeMinutes(
    minutesUtc + equationOfTime(t) + 4 * longitude
  );
  const hourAngleDeg = trueSolarTime / 4 - 180;

  const lat = latitude * rad;
  const decl = declination * rad;
  const ha = hourAngleDeg * rad;

  const cosZenith =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const zenith = Math.acos(clamp(cosZenith, -1, 1));

  let azimuth;
  const denominator = Math.cos(lat) * Math.sin(zenith);
  if (Math.abs(denominator) < 1e-9) {
    // Directly overhead or at a pole: azimuth is undefined, so fall back to
    // the meridian the sun culminates on.
    azimuth = latitude > 0 ? 180 : 0;
  } else {
    const cosAz = clamp(
      (Math.sin(lat) * Math.cos(zenith) - Math.sin(decl)) / denominator,
      -1,
      1
    );
    azimuth = 180 - Math.acos(cosAz) * deg;
    if (hourAngleDeg > 0) azimuth = -azimuth;
  }

  return {
    altitude: 90 - zenith * deg,
    azimuth: normalizeDegrees(azimuth),
    declination,
  };
}

// Every rise/set event for one calendar day at one place.
export function sunTimes(date, latitude, longitude) {
  const jdStart = julianDayStart(date);
  const noonMinutes = solarNoonMinutes(jdStart, longitude);
  const tNoon = julianCentury(jdStart + noonMinutes / 1440);
  const declination = solarDeclination(tNoon);

  const event = (zenith) => {
    const { angle, polar } = hourAngle(latitude, declination, zenith);
    if (angle == null) return { rise: null, set: null, polar };
    return {
      rise: minutesToDate(jdStart, noonMinutes - 4 * angle),
      set: minutesToDate(jdStart, noonMinutes + 4 * angle),
      polar: null,
    };
  };

  const day = event(ZENITH.sunrise);
  const civil = event(ZENITH.civil);
  const nautical = event(ZENITH.nautical);
  const astronomical = event(ZENITH.astronomical);
  // Golden hour ends when the sun is 6 degrees up; blue hour spans -6 to -4.
  const goldenEdge = event(84);
  const blueEdge = event(94);

  return {
    solarNoon: minutesToDate(jdStart, noonMinutes),
    sunrise: day.rise,
    sunset: day.set,
    polar: day.polar,
    declination,
    civilDawn: civil.rise,
    civilDusk: civil.set,
    nauticalDawn: nautical.rise,
    nauticalDusk: nautical.set,
    astronomicalDawn: astronomical.rise,
    astronomicalDusk: astronomical.set,
    goldenHourMorningEnd: goldenEdge.rise,
    goldenHourEveningStart: goldenEdge.set,
    blueHourMorningStart: blueEdge.rise,
    blueHourEveningEnd: blueEdge.set,
  };
}

// Daylight in minutes, or null above the polar circles where there is no rise.
export function dayLengthMinutes(times) {
  if (!times.sunrise || !times.sunset) return null;
  return (times.sunset - times.sunrise) / 60000;
}

function normalizeMinutes(value) {
  return ((value % 1440) + 1440) % 1440;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
