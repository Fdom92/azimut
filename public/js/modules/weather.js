import { CLOUDS, LEVELS, SIGNS, STORM_ACTIONS, SOURCE } from "../data/clouds.js";

export const SEVERITY_LABEL = {
  calm: "Tranquilo",
  watch: "Vigilar",
  caution: "Precaución",
  danger: "Peligro",
};

const ORDER = ["danger", "caution", "watch", "calm"];

// Grouped by altitude for browsing, since that is how you actually pick a
// cloud out of the sky: first how high it is, then what it looks like.
export function cloudsByLevel() {
  return Object.keys(LEVELS).map((level) => ({
    level,
    label: LEVELS[level],
    clouds: CLOUDS.filter((cloud) => cloud.level === level),
  }));
}

// Worst-first, for the "what should worry me" view.
export function cloudsBySeverity() {
  return [...CLOUDS].sort(
    (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity)
  );
}

export function signs() {
  return SIGNS;
}

export function stormActions() {
  return STORM_ACTIONS;
}

export function source() {
  return SOURCE;
}

// Light is effectively instantaneous over these distances; sound covers about
// a kilometre every three seconds. Counting the gap gives the distance to the
// strike, and watching that number shrink tells you the storm is coming at you
// rather than passing by — which is the part worth acting on.
const SECONDS_PER_KM = 3;

export function stormDistanceKm(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return seconds / SECONDS_PER_KM;
}

export function stormVerdict(km) {
  if (km == null) return null;
  if (km < 3) return { level: "danger", text: "Encima. Estás dentro del radio de caída de rayo: baja y refúgiate ya." };
  if (km < 10) return { level: "caution", text: "Cerca. Si el intervalo se acorta, viene hacia ti." };
  return { level: "watch", text: "Lejos por ahora. Cuenta otra vez en unos minutos para saber si se acerca." };
}
