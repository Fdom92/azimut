import { sunTimes, solarPosition, dayLengthMinutes } from "../astro/solar.js";
import { moonPhase, moonTimes, moonHorizontal } from "../astro/lunar.js";

// Turns raw astronomical output into the rows the panel renders.
export function sunReport(date, latitude, longitude) {
  const times = sunTimes(date, latitude, longitude);
  const now = solarPosition(date, latitude, longitude);
  const length = dayLengthMinutes(times);

  return {
    polar: times.polar,
    dayLength: length,
    now: {
      altitude: now.altitude,
      azimuth: now.azimuth,
      compass: compassPoint(now.azimuth),
      isUp: now.altitude > -0.833,
    },
    moon: moonReport(date, latitude, longitude),
    events: [
      { key: "astronomicalDawn", label: "Amanecer astronómico", at: times.astronomicalDawn },
      { key: "nauticalDawn", label: "Amanecer náutico", at: times.nauticalDawn },
      { key: "civilDawn", label: "Amanecer civil", at: times.civilDawn },
      { key: "blueHourMorningStart", label: "Hora azul (inicio)", at: times.blueHourMorningStart },
      { key: "sunrise", label: "Orto", at: times.sunrise, emphasis: true },
      { key: "goldenHourMorningEnd", label: "Fin hora dorada", at: times.goldenHourMorningEnd },
      { key: "solarNoon", label: "Mediodía solar", at: times.solarNoon, emphasis: true },
      { key: "goldenHourEveningStart", label: "Inicio hora dorada", at: times.goldenHourEveningStart },
      { key: "sunset", label: "Ocaso", at: times.sunset, emphasis: true },
      { key: "blueHourEveningEnd", label: "Hora azul (fin)", at: times.blueHourEveningEnd },
      { key: "civilDusk", label: "Anochecer civil", at: times.civilDusk },
      { key: "nauticalDusk", label: "Anochecer náutico", at: times.nauticalDusk },
      { key: "astronomicalDusk", label: "Anochecer astronómico", at: times.astronomicalDusk },
    ],
  };
}

// The moon gets the same treatment as the sun: where it is now, when it
// crosses the horizon, and how much of it is lit — which is the number that
// decides whether you can walk without a headtorch.
export function moonReport(date, latitude, longitude) {
  const phase = moonPhase(date);
  const times = moonTimes(date, latitude, longitude);
  const now = moonHorizontal(date, latitude, longitude);

  return {
    phase,
    moonrise: times.moonrise,
    moonset: times.moonset,
    alwaysUp: times.alwaysUp,
    alwaysDown: times.alwaysDown,
    now: {
      altitude: now.altitude,
      azimuth: now.azimuth,
      compass: compassPoint(now.azimuth),
      isUp: now.altitude > 0,
    },
    distanceKm: phase.distance,
  };
}

const POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO",
];

export function compassPoint(azimuth) {
  const index = Math.round(azimuth / 22.5) % 16;
  return POINTS[index];
}

export function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Number("") is 0, not NaN, so a blank field used to sail through a
// Number.isFinite check and quietly compute for latitude 0, longitude 0 — the
// Gulf of Guinea, with a plausible-looking twelve-hour day. Blank has to be
// rejected before the conversion, and the range checked after it.
export function parseCoordinate(raw, { min, max }) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

export function parseLatitude(raw) {
  return parseCoordinate(raw, { min: -90, max: 90 });
}

export function parseLongitude(raw) {
  return parseCoordinate(raw, { min: -180, max: 180 });
}
