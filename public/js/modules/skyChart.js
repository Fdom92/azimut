// The sky as a dome seen from underneath: zenith at the centre, horizon around
// the rim.
//
// The one thing to get right is the handedness. A map is drawn looking down,
// so east is on the right. A sky chart is drawn looking up, so east is on the
// LEFT — hold the phone overhead with north away from you and the screen
// matches what is above it. Charts that put east on the right are mirror
// images of the real sky, and the mistake is invisible until you try to use
// one. The panel says which way round it is.

import { visibleStars, figureSegments, constellationVisibility } from "../astro/stars.js";
import { CONSTELLATIONS, ASTERISMS } from "../data/constellations.js";
import { findByBayer } from "../data/stars.js";
import { starPosition } from "../astro/stars.js";
import { toJulianDay } from "../astro/julian.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const SIZE = 640;
const CENTER = SIZE / 2;
const RADIUS = 292;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

// Azimuthal equidistant from the zenith: altitude maps linearly to radius, so
// the horizon is the rim and halfway out is 45 degrees up. Angles are mirrored
// for the looking-up view.
function project(altitude, azimuth) {
  const r = ((90 - altitude) / 90) * RADIUS;
  const theta = (azimuth * Math.PI) / 180;
  return {
    x: CENTER - r * Math.sin(theta),
    y: CENTER - r * Math.cos(theta),
  };
}

// Brighter stars are drawn larger. The scale is chosen so Sirius reads as
// clearly dominant without the magnitude-4 background turning to mush.
function starRadius(mag) {
  return Math.max(1.1, 4.6 - mag * 0.72);
}

export function buildSkyChart(date, latitude, longitude) {
  const svg = el("svg", {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    class: "sky-chart",
    role: "img",
    "aria-label": "Mapa del cielo visible ahora desde tu posición",
  });

  svg.append(el("circle", { cx: CENTER, cy: CENTER, r: RADIUS, class: "sky-dome" }));

  // Altitude rings at 30 and 60 degrees, so the dome has some depth to it.
  for (const altitude of [30, 60]) {
    svg.append(
      el("circle", {
        cx: CENTER, cy: CENTER,
        r: ((90 - altitude) / 90) * RADIUS,
        class: "sky-ring",
      })
    );
  }

  // Cardinal marks on the rim.
  for (const [label, azimuth] of [["N", 0], ["E", 90], ["S", 180], ["O", 270]]) {
    const at = project(-6, azimuth);
    const text = el("text", {
      x: at.x, y: at.y + 6, class: "sky-cardinal", "text-anchor": "middle",
    });
    text.textContent = label;
    svg.append(text);
  }

  // Constellation figures underneath the stars.
  const figures = el("g", { class: "sky-figures" });
  for (const constellation of CONSTELLATIONS) {
    for (const { from, to } of figureSegments(constellation, date, latitude, longitude)) {
      const a = project(from.altitude, from.azimuth);
      const b = project(to.altitude, to.azimuth);
      figures.append(el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
    }
  }
  svg.append(figures);

  // Asterisms spanning several constellations get their own dashed treatment.
  const asterisms = el("g", { class: "sky-asterisms" });
  const jd = toJulianDay(date);
  for (const asterism of ASTERISMS) {
    const points = asterism.stars
      .map(([bayer, con]) => findByBayer(bayer, con))
      .filter(Boolean)
      .map((star) => starPosition(star, jd, latitude, longitude));

    if (points.length < 2 || points.some((p) => p.altitude <= 0)) continue;

    const sequence = asterism.closed ? [...points, points[0]] : points;
    for (let i = 0; i < sequence.length - 1; i++) {
      const a = project(sequence[i].altitude, sequence[i].azimuth);
      const b = project(sequence[i + 1].altitude, sequence[i + 1].azimuth);
      asterisms.append(el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y }));
    }
  }
  svg.append(asterisms);

  // Stars, faintest first so the bright ones land on top.
  const stars = visibleStars(date, latitude, longitude);
  const group = el("g", { class: "sky-stars" });
  for (const star of [...stars].reverse()) {
    const at = project(star.altitude, star.azimuth);
    group.append(el("circle", { cx: at.x, cy: at.y, r: starRadius(star.mag), class: "sky-star" }));
  }
  svg.append(group);

  // Only the handful bright enough to pick out get a label; naming everything
  // turns the chart into a wall of text.
  const labels = el("g", { class: "sky-labels" });
  for (const star of stars.filter((s) => s.name && s.mag <= 1.6)) {
    const at = project(star.altitude, star.azimuth);
    const text = el("text", { x: at.x + 9, y: at.y + 4, class: "sky-label" });
    text.textContent = star.name;
    labels.append(text);
  }
  svg.append(labels);

  return { svg, count: stars.length };
}

// The constellations worth telling someone to look for right now.
export function tonightsConstellations(date, latitude, longitude) {
  return CONSTELLATIONS.map((constellation) => ({
    ...constellation,
    ...constellationVisibility(constellation, date, latitude, longitude),
  }))
    .filter((c) => c.visible)
    .sort((a, b) => b.highest - a.highest);
}
