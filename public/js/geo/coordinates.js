// Coordinate formats and conversions on the WGS84 ellipsoid.
//
// The reason this module exists is the emergency call. What decides whether
// help reaches you is giving your position in the format the person on the
// other end is writing down, and reading decimal degrees to someone expecting
// degrees and minutes — or the reverse — is a real and common failure.
//
// UTM and MGRS follow Snyder's series, which is accurate to well under a
// millimetre inside a zone. The round-trip test holds the whole chain: convert
// out and back and you must land within a centimetre of where you started.

// WGS84.
const A = 6378137.0;
const F = 1 / 298.257223563;
const E2 = 2 * F - F * F;
const K0 = 0.9996;

const rad = Math.PI / 180;
const deg = 180 / Math.PI;

// ---- Decimal, degrees-minutes-seconds, degrees-decimal-minutes ----

export function toDMS(value, axis) {
  const hemisphere = pickHemisphere(value, axis);
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFull = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFull);
  const seconds = (minutesFull - minutes) * 60;
  return { degrees, minutes, seconds, hemisphere };
}

// Degrees and decimal minutes: the format most rescue services and marine
// radio actually use.
export function toDDM(value, axis) {
  const hemisphere = pickHemisphere(value, axis);
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutes = (absolute - degrees) * 60;
  return { degrees, minutes, hemisphere };
}

export function formatDMS(value, axis, precision = 1) {
  const { degrees, minutes, seconds, hemisphere } = toDMS(value, axis);
  return `${degrees}° ${String(minutes).padStart(2, "0")}′ ${seconds.toFixed(precision).padStart(precision + 3, "0")}″ ${hemisphere}`;
}

export function formatDDM(value, axis, precision = 3) {
  const { degrees, minutes, hemisphere } = toDDM(value, axis);
  return `${degrees}° ${minutes.toFixed(precision).padStart(precision + 3, "0")}′ ${hemisphere}`;
}

// Spanish maps write O for Oeste, but these readouts are set in a monospaced
// face beside digits and get read aloud over a radio, where an O next to a
// string of numbers is indistinguishable from a zero. W is the international
// convention, is understood here, and cannot be misheard as a digit — and for
// a position someone is writing down under pressure, that wins.
function pickHemisphere(value, axis) {
  if (axis === "lat") return value >= 0 ? "N" : "S";
  return value >= 0 ? "E" : "W";
}

// ---- UTM ----

// Zone numbering, including the two exceptions that exist in the real grid:
// zone 32 is widened for southern Norway, and Svalbard skips 32, 34 and 36.
export function utmZone(latitude, longitude) {
  let zone = Math.floor((longitude + 180) / 6) + 1;

  if (latitude >= 56 && latitude < 64 && longitude >= 3 && longitude < 12) {
    zone = 32;
  }
  if (latitude >= 72 && latitude < 84) {
    if (longitude >= 0 && longitude < 9) zone = 31;
    else if (longitude >= 9 && longitude < 21) zone = 33;
    else if (longitude >= 21 && longitude < 33) zone = 35;
    else if (longitude >= 33 && longitude < 42) zone = 37;
  }
  return zone;
}

const BANDS = "CDEFGHJKLMNPQRSTUVWX";

// Latitude bands run 8 degrees each from -80, except X which is 12.
export function latitudeBand(latitude) {
  if (latitude < -80 || latitude > 84) return null;
  if (latitude >= 72) return "X";
  return BANDS[Math.floor((latitude + 80) / 8)];
}

function meridionalArc(phi) {
  return (
    A *
    ((1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256) * phi -
      ((3 * E2) / 8 + (3 * E2 ** 2) / 32 + (45 * E2 ** 3) / 1024) * Math.sin(2 * phi) +
      ((15 * E2 ** 2) / 256 + (45 * E2 ** 3) / 1024) * Math.sin(4 * phi) -
      ((35 * E2 ** 3) / 3072) * Math.sin(6 * phi))
  );
}

export function toUTM(latitude, longitude) {
  if (latitude < -80 || latitude > 84) return null;

  const zone = utmZone(latitude, longitude);
  const band = latitudeBand(latitude);
  const centralMeridian = ((zone - 1) * 6 - 180 + 3) * rad;

  const phi = latitude * rad;
  const lambda = longitude * rad;

  const ePrime2 = E2 / (1 - E2);
  const n = A / Math.sqrt(1 - E2 * Math.sin(phi) ** 2);
  const t = Math.tan(phi) ** 2;
  const c = ePrime2 * Math.cos(phi) ** 2;
  const a = (lambda - centralMeridian) * Math.cos(phi);
  const m = meridionalArc(phi);

  const easting =
    K0 *
      n *
      (a +
        ((1 - t + c) * a ** 3) / 6 +
        ((5 - 18 * t + t ** 2 + 72 * c - 58 * ePrime2) * a ** 5) / 120) +
    500000;

  let northing =
    K0 *
    (m +
      n *
        Math.tan(phi) *
        (a ** 2 / 2 +
          ((5 - t + 9 * c + 4 * c ** 2) * a ** 4) / 24 +
          ((61 - 58 * t + t ** 2 + 600 * c - 330 * ePrime2) * a ** 6) / 720));

  if (latitude < 0) northing += 10000000;

  return {
    zone,
    band,
    hemisphere: latitude >= 0 ? "N" : "S",
    easting,
    northing,
  };
}

export function fromUTM({ zone, hemisphere, easting, northing }) {
  const x = easting - 500000;
  const y = hemisphere === "S" ? northing - 10000000 : northing;

  const ePrime2 = E2 / (1 - E2);
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));

  const m = y / K0;
  const mu = m / (A * (1 - E2 / 4 - (3 * E2 ** 2) / 64 - (5 * E2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const c1 = ePrime2 * Math.cos(phi1) ** 2;
  const t1 = Math.tan(phi1) ** 2;
  const n1 = A / Math.sqrt(1 - E2 * Math.sin(phi1) ** 2);
  const r1 = (A * (1 - E2)) / (1 - E2 * Math.sin(phi1) ** 2) ** 1.5;
  const d = x / (n1 * K0);

  const latitude =
    phi1 -
    ((n1 * Math.tan(phi1)) / r1) *
      (d ** 2 / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ePrime2) * d ** 4) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ePrime2 - 3 * c1 ** 2) * d ** 6) / 720);

  const longitude =
    (d -
      ((1 + 2 * t1 + c1) * d ** 3) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ePrime2 + 24 * t1 ** 2) * d ** 5) / 120) /
    Math.cos(phi1);

  const centralMeridian = (zone - 1) * 6 - 180 + 3;

  return {
    latitude: latitude * deg,
    longitude: centralMeridian + longitude * deg,
  };
}

// ---- MGRS ----

// The 100 km square letters. Columns cycle through three sets by zone; rows
// alternate between two sets by zone parity. I and O are skipped throughout,
// because they read as 1 and 0.
const COLUMN_SETS = ["ABCDEFGH", "JKLMNPQR", "STUVWXYZ"];
const ROW_ODD = "ABCDEFGHJKLMNPQRSTUV";
const ROW_EVEN = "FGHJKLMNPQRSTUVABCDE";

export function toMGRS(latitude, longitude, digits = 5) {
  const utm = toUTM(latitude, longitude);
  if (!utm || !utm.band) return null;

  const { zone, band, easting, northing } = utm;

  const columnIndex = Math.floor(easting / 100000) - 1;
  const columnLetter = COLUMN_SETS[(zone - 1) % 3][columnIndex];

  const rowLetters = zone % 2 === 1 ? ROW_ODD : ROW_EVEN;
  const rowLetter = rowLetters[Math.floor(northing / 100000) % 20];

  const divisor = 10 ** (5 - digits);
  const e = Math.floor((easting % 100000) / divisor);
  const n = Math.floor((northing % 100000) / divisor);

  return {
    zone,
    band,
    square: `${columnLetter}${rowLetter}`,
    easting: e,
    northing: n,
    digits,
    text: `${zone}${band} ${columnLetter}${rowLetter} ${String(e).padStart(digits, "0")} ${String(n).padStart(digits, "0")}`,
  };
}

// Every representation of one point, for the panel to render side by side.
export function allFormats(latitude, longitude) {
  const utm = toUTM(latitude, longitude);
  const mgrs = toMGRS(latitude, longitude);

  return {
    decimal: {
      label: "Grados decimales",
      value: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      note: "Lo que usan los mapas y las apps.",
    },
    ddm: {
      label: "Grados y minutos",
      value: `${formatDDM(latitude, "lat")}  ${formatDDM(longitude, "lon")}`,
      note: "El formato que suelen pedir por radio y en rescate.",
    },
    dms: {
      label: "Grados, minutos y segundos",
      value: `${formatDMS(latitude, "lat")}  ${formatDMS(longitude, "lon")}`,
      note: "El clásico de la cartografía impresa.",
    },
    utm: utm && {
      label: "UTM",
      value: `${utm.zone}${utm.band} ${Math.round(utm.easting)} E ${Math.round(utm.northing)} N`,
      note: "Metros sobre la cuadrícula. Es lo que llevan los mapas del IGN.",
    },
    mgrs: mgrs && {
      label: "MGRS",
      value: mgrs.text,
      note: "Cuadrícula militar, usada también en rescate.",
    },
  };
}
