// Where the catalogue stars are in the sky, for an observer at a place and a
// moment.
//
// The hard part was already written for the moon: sidereal time and the
// equatorial-to-horizontal transform live in coords.js. Stars are simpler than
// the moon, because their catalogue positions do not change over an evening —
// what moves is the observer, as the Earth turns.

import { toJulianDay } from "./julian.js";
import { equatorialToHorizontal, localSiderealTime } from "./coords.js";
import { allStars, findByBayer } from "../data/stars.js";

// Catalogue right ascension is in hours; the transform wants degrees.
const HOURS_TO_DEGREES = 15;

export function starPosition(star, jd, latitude, longitude) {
  const lst = localSiderealTime(jd, longitude);
  const { altitude, azimuth } = equatorialToHorizontal(
    star.ra * HOURS_TO_DEGREES,
    star.dec,
    latitude,
    lst
  );
  return { ...star, altitude, azimuth };
}

// Everything above the horizon, brightest first so the drawing order puts the
// prominent stars on top of the faint ones.
export function visibleStars(date, latitude, longitude, { minAltitude = 0 } = {}) {
  const jd = toJulianDay(date);
  const lst = localSiderealTime(jd, longitude);

  return allStars()
    .map((star) => {
      const { altitude, azimuth } = equatorialToHorizontal(
        star.ra * HOURS_TO_DEGREES,
        star.dec,
        latitude,
        lst
      );
      return { ...star, altitude, azimuth };
    })
    .filter((star) => star.altitude > minAltitude)
    .sort((a, b) => a.mag - b.mag);
}

// A star's figure segments, resolved to positions. Segments with either end
// below the horizon are dropped rather than drawn off the edge of the dome.
export function figureSegments(constellation, date, latitude, longitude, { minAltitude = 0 } = {}) {
  const jd = toJulianDay(date);
  const segments = [];

  for (const [a, b] of constellation.lines) {
    const starA = findByBayer(a, constellation.con);
    const starB = findByBayer(b, constellation.con);
    if (!starA || !starB) continue;

    const from = starPosition(starA, jd, latitude, longitude);
    const to = starPosition(starB, jd, latitude, longitude);
    if (from.altitude <= minAltitude || to.altitude <= minAltitude) continue;

    segments.push({ from, to });
  }

  return segments;
}

// Whether a constellation is worth naming right now: most of it up, and high
// enough that it is not lost in the horizon haze.
export function constellationVisibility(constellation, date, latitude, longitude) {
  const jd = toJulianDay(date);
  const bayers = new Set(constellation.lines.flat());

  const stars = [...bayers]
    .map((bayer) => findByBayer(bayer, constellation.con))
    .filter(Boolean)
    .map((star) => starPosition(star, jd, latitude, longitude));

  if (stars.length === 0) return { visible: false, fraction: 0 };

  const up = stars.filter((s) => s.altitude > 0);
  const highest = stars.reduce((max, s) => Math.max(max, s.altitude), -90);

  return {
    visible: up.length / stars.length >= 0.6 && highest > 10,
    fraction: up.length / stars.length,
    highest,
    meanAltitude: up.length ? up.reduce((sum, s) => sum + s.altitude, 0) / up.length : null,
  };
}
