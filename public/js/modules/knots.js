import { KNOTS, GROUPS } from "../data/knots.js";

// Every field an image needs before it can be shown. Attribution is not
// optional: most freely-licensed diagrams are CC BY or BY-SA, and the credit
// travels with the file. The test suite enforces this so an image cannot be
// dropped in without it.
export const IMAGE_FIELDS = ["file", "title", "author", "license", "source"];

export function knotsByGroup() {
  return Object.keys(GROUPS).map((id) => ({
    id,
    ...GROUPS[id],
    knots: KNOTS.filter((knot) => knot.group === id),
  }));
}

export function isComplete(knot) {
  return knot.reviewed && knot.steps.length > 0 && knot.image != null;
}

// What a half-finished entry is still missing, for the pending badge.
export function missingParts(knot) {
  const missing = [];
  if (knot.steps.length === 0) missing.push("pasos");
  if (knot.image == null) missing.push("ilustración");
  if (!knot.reviewed) missing.push("revisión");
  return missing;
}

export function imageAttribution(image) {
  if (!image) return null;
  return `${image.title} — ${image.author}, ${image.license}`;
}

export function progress() {
  const done = KNOTS.filter(isComplete).length;
  return { done, total: KNOTS.length };
}
