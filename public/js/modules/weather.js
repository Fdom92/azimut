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
