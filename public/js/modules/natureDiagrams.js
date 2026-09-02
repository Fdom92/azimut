// Schematic diagrams for the nature entries.
//
// Deliberately not photographs. A photograph invites you to match it against
// the animal in front of you and decide your own safety — which is the exact
// thing this module refuses to do. A schematic shows the one feature the text
// is talking about and nothing else, so it illustrates the prose rather than
// standing in for a field guide.
//
// These are also the only images here that can be drawn honestly: a round
// pupil versus a slit one, or tweezers held perpendicular to skin, are simple
// geometry. A viper's markings are not, and are not attempted.

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function text(content, x, y, className = "diagram-label") {
  const node = el("text", { x, y, class: className, "text-anchor": "middle" });
  node.textContent = content;
  return node;
}

function frame(width, height, title) {
  return el("svg", {
    viewBox: `0 0 ${width} ${height}`,
    class: "diagram",
    role: "img",
    "aria-label": title,
  });
}

// Head shape and pupil, side by side. These two features are what the entry
// text describes, and they are the ones that survive being drawn simply.
export function viperVsColubrid() {
  const svg = frame(320, 190, "Comparación esquemática entre cabeza de víbora y de culebra");

  // --- Viper, left: triangular head, vertical pupil ---
  svg.append(
    el("path", {
      d: "M 24 96 L 74 62 L 104 82 L 104 106 L 74 126 Z",
      class: "diagram-shape",
    })
  );
  svg.append(el("ellipse", { cx: 76, cy: 88, rx: 11, ry: 9, class: "diagram-eye" }));
  svg.append(el("ellipse", { cx: 76, cy: 88, rx: 2.5, ry: 7.5, class: "diagram-pupil" }));
  svg.append(text("Víbora", 66, 152, "diagram-caption"));
  svg.append(text("pupila vertical", 66, 168));

  // --- Colubrid, right: oval head, round pupil ---
  svg.append(
    el("path", {
      d: "M 196 94 Q 226 66 262 80 Q 292 92 292 100 Q 292 110 262 120 Q 226 132 196 104 Z",
      class: "diagram-shape",
    })
  );
  svg.append(el("ellipse", { cx: 254, cy: 96, rx: 10, ry: 9, class: "diagram-eye" }));
  svg.append(el("circle", { cx: 254, cy: 96, r: 5, class: "diagram-pupil" }));
  svg.append(text("Culebra", 244, 152, "diagram-caption"));
  svg.append(text("pupila redonda", 244, 168));

  // Separator, to stop the two reading as one animal.
  svg.append(el("line", { x1: 160, x2: 160, y1: 40, y2: 140, class: "diagram-divider" }));

  return svg;
}

// The grip and the direction of pull — the two things the guidance insists on
// and the two that get done wrong.
export function tickRemoval() {
  const svg = frame(300, 190, "Pinzas sujetando la garrapata pegadas a la piel y tirando en perpendicular");

  // Skin.
  svg.append(el("rect", { x: 20, y: 132, width: 260, height: 34, rx: 6, class: "diagram-skin" }));
  svg.append(text("piel", 50, 156, "diagram-caption"));

  // Tick, small, at the skin line.
  svg.append(el("ellipse", { cx: 160, cy: 126, rx: 13, ry: 10, class: "diagram-shape" }));
  svg.append(el("line", { x1: 160, y1: 132, x2: 160, y2: 142, class: "diagram-object" }));

  // Tweezers gripping right at the skin, not around the swollen body.
  svg.append(el("line", { x1: 142, y1: 54, x2: 155, y2: 122, class: "diagram-object" }));
  svg.append(el("line", { x1: 178, y1: 54, x2: 165, y2: 122, class: "diagram-object" }));

  // Pull arrow, straight up.
  svg.append(el("line", { x1: 226, y1: 118, x2: 226, y2: 58, class: "diagram-arrow" }));
  svg.append(el("path", { d: "M 221 62 L 226 48 L 231 62 Z", class: "diagram-arrow-head" }));
  svg.append(text("tirón firme", 250, 96));
  svg.append(text("y perpendicular", 250, 110));

  svg.append(text("agarra pegado a la piel, no por el cuerpo", 150, 184));
  return svg;
}

// The distinguishing bands, at the level of detail the entry text uses.
export function waspComparison() {
  const svg = frame(320, 160, "Comparación esquemática entre avispa común y velutina");

  const wasp = (cx, bodyClass, bandClass, label, caption) => {
    const group = el("g", {});
    group.append(el("ellipse", { cx, cy: 60, rx: 12, ry: 10, class: "diagram-shape dark" }));
    group.append(el("ellipse", { cx, cy: 88, rx: 16, ry: 22, class: bodyClass }));
    group.append(el("rect", { x: cx - 16, y: 84, width: 32, height: 9, class: bandClass }));
    group.append(text(label, cx, 128, "diagram-caption"));
    group.append(text(caption, cx, 144));
    return group;
  };

  svg.append(wasp(88, "diagram-shape yellow", "diagram-band dark", "Avispa común", "amarillo claro"));
  svg.append(wasp(232, "diagram-shape dark", "diagram-band orange", "Velutina", "franja anaranjada"));
  svg.append(el("line", { x1: 160, x2: 160, y1: 40, y2: 112, class: "diagram-divider" }));

  return svg;
}

// Which entry gets which diagram. Entries without one simply render text.
export const DIAGRAMS = {
  viboras: viperVsColubrid,
  garrapatas: tickRemoval,
  velutina: waspComparison,
};

export function diagramFor(id) {
  const builder = DIAGRAMS[id];
  return builder ? builder() : null;
}
