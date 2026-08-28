// Julian date helpers. Meeus, Astronomical Algorithms, ch. 7.

export const J2000 = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;

export const rad = Math.PI / 180;
export const deg = 180 / Math.PI;

export function toJulianDay(date) {
  return date.getTime() / 86400000 + UNIX_EPOCH_JD;
}

export function fromJulianDay(jd) {
  return new Date((jd - UNIX_EPOCH_JD) * 86400000);
}

// Julian centuries since J2000.0 — the time argument every series below expects.
export function julianCentury(jd) {
  return (jd - J2000) / 36525;
}

// Julian day at 00:00 UTC of the calendar day containing `date`.
export function julianDayStart(date) {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return utcMidnight / 86400000 + UNIX_EPOCH_JD;
}

export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}
