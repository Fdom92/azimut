// The phase drawn as the disc you would actually see: a dark circle with the
// lit part bounded by the limb on one side and the terminator on the other.
//
// The terminator is the projection of a circle seen edge-on, so it is an
// ellipse whose horizontal radius shrinks to nothing at the quarters and
// grows back to the full radius at new and full moon. Getting that curve
// right is the difference between a moon and a pac-man.

const SVG_NS = "http://www.w3.org/2000/svg";
const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = 46;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

// Path for the illuminated region of a disc of radius R.
export function litPath(illuminated, waxing, radius = RADIUS, center = CENTER) {
  const k = Math.min(1, Math.max(0, illuminated));

  // Horizontal radius of the terminator ellipse.
  const rx = radius * Math.abs(1 - 2 * k);

  // The terminator runs bottom to top. In SVG's y-down frame, sweep 1 on that
  // leg bows the curve to the left and sweep 0 bows it to the right.
  //
  // Waxing lights the right limb, so a gibbous needs the terminator bowing
  // left, into the dark side, to enclose more than half the disc — sweep 1.
  // A crescent needs it bowing right, into the lit side — sweep 0. Waning
  // mirrors both.
  const gibbous = k > 0.5;
  const limbSweep = waxing ? 1 : 0;
  const innerSweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;

  const top = center - radius;
  const bottom = center + radius;

  return [
    `M ${center} ${top}`,
    `A ${radius} ${radius} 0 0 ${limbSweep} ${center} ${bottom}`,
    `A ${rx} ${radius} 0 0 ${innerSweep} ${center} ${top}`,
    "Z",
  ].join(" ");
}

export function buildMoonDisc(phase) {
  const svg = el("svg", {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    class: "moon-disc",
    role: "img",
    "aria-label": `${phase.name}, ${Math.round(phase.illuminated * 100)} por ciento iluminada`,
  });

  svg.append(el("circle", { cx: CENTER, cy: CENTER, r: RADIUS, class: "moon-dark" }));

  // A sliver below about one percent is not worth drawing — it renders as an
  // artefact rather than a crescent.
  if (phase.illuminated > 0.01) {
    svg.append(
      el("path", {
        d: litPath(phase.illuminated, phase.waxing),
        class: "moon-lit",
      })
    );
  }

  svg.append(
    el("circle", { cx: CENTER, cy: CENTER, r: RADIUS, class: "moon-edge" })
  );

  return svg;
}
