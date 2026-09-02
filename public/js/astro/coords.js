// Coordinate transformations shared by anything that works from ecliptic
// positions. The solar module does not use these — NOAA's formulation folds
// the same maths into the equation of time — but the moon needs the general
// path: ecliptic to equatorial to horizontal, via sidereal time.

import { rad, deg, normalizeDegrees, J2000 } from "./julian.js";

// Greenwich mean sidereal time in degrees. Meeus ch. 12.
export function greenwichSiderealTime(jd) {
  const t = (jd - J2000) / 36525;
  const theta =
    280.46061837 +
    360.98564736629 * (jd - J2000) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return normalizeDegrees(theta);
}

export function localSiderealTime(jd, longitude) {
  return normalizeDegrees(greenwichSiderealTime(jd) + longitude);
}

// Ecliptic longitude/latitude to right ascension/declination.
export function eclipticToEquatorial(lambda, beta, obliquity) {
  const l = lambda * rad;
  const b = beta * rad;
  const e = obliquity * rad;

  const ra = Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l)
  );
  const dec = Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)
  );

  return { rightAscension: normalizeDegrees(ra * deg), declination: dec * deg };
}

// Right ascension/declination to altitude and azimuth for an observer.
// Azimuth is degrees clockwise from true north, matching solarPosition.
export function equatorialToHorizontal(
  rightAscension,
  declination,
  latitude,
  localSidereal
) {
  const hourAngle = normalizeDegrees(localSidereal - rightAscension);
  const h = hourAngle * rad;
  const dec = declination * rad;
  const lat = latitude * rad;

  const sinAltitude =
    Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(h);
  const altitude = Math.asin(clamp(sinAltitude, -1, 1));

  const azimuth = Math.atan2(
    Math.sin(h),
    Math.cos(h) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)
  );

  return {
    altitude: altitude * deg,
    // atan2 above measures from south; shift to north-based bearings.
    azimuth: normalizeDegrees(azimuth * deg + 180),
    hourAngle,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
