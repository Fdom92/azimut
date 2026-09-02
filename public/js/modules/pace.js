import { sunTimes } from "../astro/solar.js";

// Naismith's rule and the daylight question it exists to answer.
//
// Naismith is a planning estimate, not a prediction, and it is known to run
// optimistic: it assumes steady walking, no stops, decent ground and decent
// weather. Treating its output as a schedule is how people end up finishing in
// the dark, so the module says so and the pace factor exists to be used.

const BASE_MINUTES_PER_KM = 12; // one hour per five kilometres
const MINUTES_PER_100M_ASCENT = 10; // one hour per six hundred metres

export const PACE_FACTORS = [
  { id: "brisk", label: "Ligero, sin peso", factor: 0.85 },
  { id: "normal", label: "Normal", factor: 1 },
  { id: "loaded", label: "Con mochila pesada", factor: 1.25 },
  { id: "hard", label: "Terreno malo o grupo lento", factor: 1.5 },
];

// Langmuir's correction. Gentle descent is faster than flat; steep descent is
// slower, because you are braking rather than walking.
export function descentAdjustmentMinutes(descentMetres, distanceKm) {
  if (descentMetres <= 0 || distanceKm <= 0) return 0;

  // Average descent gradient, as a rough angle over the whole leg.
  const gradient = Math.atan(descentMetres / (distanceKm * 1000)) * (180 / Math.PI);
  const per300 = descentMetres / 300;

  if (gradient > 12) return per300 * 10; // steep: braking costs time
  if (gradient >= 5) return -per300 * 10; // gentle: you gain a little
  return 0; // barely downhill, no correction worth making
}

export function estimateMinutes({
  distanceKm,
  ascentMetres = 0,
  descentMetres = 0,
  factor = 1,
}) {
  const flat = distanceKm * BASE_MINUTES_PER_KM;
  const climb = (ascentMetres / 100) * MINUTES_PER_100M_ASCENT;
  const descent = descentAdjustmentMinutes(descentMetres, distanceKm);
  return Math.max(0, (flat + climb + descent) * factor);
}

// The question the module is really for: does the estimate land before the
// light goes? Civil dusk is the honest cutoff — after that you need a torch to
// move safely on rough ground, well before it is properly dark.
export function daylightCheck({ start, minutes, latitude, longitude }) {
  const arrival = new Date(start.getTime() + minutes * 60000);
  const times = sunTimes(start, latitude, longitude);

  if (!times.sunset || !times.civilDusk) {
    return { arrival, polar: times.polar };
  }

  const marginToSunset = (times.sunset - arrival) / 60000;
  const marginToDusk = (times.civilDusk - arrival) / 60000;

  return {
    arrival,
    sunset: times.sunset,
    civilDusk: times.civilDusk,
    marginToSunset,
    marginToDusk,
    // Before sunset with room to spare, before dusk but tight, or after dark.
    verdict:
      marginToSunset >= 60 ? "comfortable" : marginToDusk >= 0 ? "tight" : "dark",
  };
}

export function formatMinutes(minutes) {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}
