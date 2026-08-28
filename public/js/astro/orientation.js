// Finding north without an instrument. Everything here derives from the solar
// position in solar.js, so it works with the radio off — and the first three
// methods work with the phone off entirely.

import { solarPosition } from "./solar.js";
import { normalizeDegrees } from "./julian.js";

// A shadow falls directly away from the sun.
export function shadowAzimuth(sunAzimuth) {
  return normalizeDegrees(sunAzimuth + 180);
}

// Stick-and-shadow: plant something vertical, look at where its shadow points.
// That direction is the bearing returned here; north is 0.
export function shadowMethod(date, latitude, longitude) {
  const sun = solarPosition(date, latitude, longitude);
  return {
    usable: sun.altitude > 5,
    sunAzimuth: sun.azimuth,
    sunAltitude: sun.altitude,
    shadowPointsTo: shadowAzimuth(sun.azimuth),
  };
}

// Watch method: hold the watch flat, hour hand at the sun. In the northern
// hemisphere the bisector between the hour hand and 12 points south; in the
// southern hemisphere, align 12 with the sun and the bisector points north.
//
// Returned as the bearing of the bisector plus which cardinal it marks, using
// apparent solar time rather than clock time — Spain's clock runs well ahead
// of its sun, which is exactly where the classic version of this trick fails.
export function watchMethod(date, latitude, longitude) {
  const sun = solarPosition(date, latitude, longitude);
  const northern = latitude >= 0;
  return {
    usable: sun.altitude > 5,
    hemisphere: northern ? "north" : "south",
    sunAzimuth: sun.azimuth,
    // The bisector always lies on the meridian: south above the equator,
    // north below it.
    bisectorPointsTo: northern ? 180 : 0,
    bisectorCardinal: northern ? "S" : "N",
  };
}

// Polaris sits within a degree of the celestial pole, so its altitude above
// the horizon equals your latitude. That doubles as a way to check you have
// found the right star.
export function polarisMethod(latitude) {
  return {
    visible: latitude > 0,
    expectedAltitude: latitude,
    pointerInstruction:
      "Localiza el Carro (Osa Mayor). La línea que une Merak con Dubhe, las dos ruedas traseras, prolongada unas cinco veces, cae en la Polar.",
  };
}

// Magnetic compasses read magnetic north; maps and everything above use true
// north. Declination is the difference — east positive.
export function magneticToTrue(magneticHeading, declination) {
  return normalizeDegrees(magneticHeading + declination);
}

export function trueToMagnetic(trueHeading, declination) {
  return normalizeDegrees(trueHeading - declination);
}

// Smallest angle between two bearings, 0 to 180.
export function bearingDelta(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return diff > 180 ? 360 - diff : diff;
}
