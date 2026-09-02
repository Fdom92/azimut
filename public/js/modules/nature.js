import {
  NATURE,
  CATEGORIES,
  DISCLAIMER,
  EMERGENCY_NUMBER,
} from "../data/regions/iberia-nature.js";

export { DISCLAIMER, EMERGENCY_NUMBER, CATEGORIES };

export function byCategory() {
  return Object.keys(CATEGORIES).map((id) => ({
    id,
    label: CATEGORIES[id],
    entries: NATURE.filter((entry) => entry.category === id),
  }));
}

export function find(id) {
  return NATURE.find((entry) => entry.id === id) ?? null;
}

// Entries whose response starts with a call rather than ending with one.
export function emergencyEntries() {
  return NATURE.filter((entry) => entry.emergency);
}

// The safety rule the content is written under, exposed so the tests can hold
// it: every entry has to say when to stop self-managing and get professional
// help. For most that is a doctor or a vet; for the ones that can turn
// serious fast it has to be 112 specifically.
const ESCALATION = ["112", "médico", "veterinario", "hospital"];

export function routesToHelp(entry) {
  const text = entry.actions.join(" ").toLowerCase();
  return ESCALATION.some((word) => text.includes(word.toLowerCase()));
}

export function routesToEmergency(entry) {
  return entry.actions.some((action) => action.includes(EMERGENCY_NUMBER));
}

export function allSources() {
  const seen = new Map();
  for (const entry of NATURE) {
    for (const source of entry.sources) {
      if (!seen.has(source.url)) seen.set(source.url, source);
    }
  }
  return [...seen.values()];
}
