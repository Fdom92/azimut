// Clouds drawn at the height they actually occur. This is how printed cloud
// charts work, and it is the fastest way to narrow an identification: first
// how high it is, then what shape it has.
//
// The shapes are schematic on purpose. They are cues for recognition, not
// photographs, and nothing here asks the reader to decide safety from a
// drawing — the entry text does that.

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 640;
const HEIGHT = 380;
const PAD = { top: 14, right: 14, bottom: 24, left: 46 };

const KM_MAX = 13;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function y(km) {
  const usable = HEIGHT - PAD.top - PAD.bottom;
  return PAD.top + ((KM_MAX - km) / KM_MAX) * usable;
}

const LAYERS = [
  { label: "Alta", from: 5, to: 13 },
  { label: "Media", from: 2, to: 5 },
  { label: "Baja", from: 0, to: 2 },
];

// x is a fraction of the drawable width; km is the height of the shape's base.
const PLACEMENTS = [
  { code: "Ci", x: 0.1, km: 9.5, shape: "wisp" },
  { code: "Cs", x: 0.3, km: 8, shape: "veil" },
  { code: "Cc", x: 0.5, km: 7, shape: "ripple" },
  { code: "Ac len", x: 0.74, km: 4.7, shape: "lens" },
  { code: "Ac", x: 0.14, km: 3.6, shape: "ripple" },
  { code: "As", x: 0.36, km: 3, shape: "veil" },
  { code: "Ns", x: 0.56, km: 2.2, shape: "slab" },
  { code: "Sc", x: 0.12, km: 1.4, shape: "lumps" },
  { code: "St", x: 0.34, km: 0.6, shape: "slab" },
  { code: "Cu", x: 0.55, km: 1.1, shape: "puff" },
  { code: "Cb", x: 0.85, km: 1.5, shape: "tower" },
];

function px(fraction) {
  return PAD.left + fraction * (WIDTH - PAD.left - PAD.right);
}

function drawShape(shape, cx, cy, severityClass) {
  const g = el("g", { class: `cloud-shape ${severityClass}` });

  switch (shape) {
    case "wisp":
      for (let i = 0; i < 3; i++) {
        g.append(
          el("path", {
            d: `M ${cx - 26} ${cy + i * 7} q 14 -7 28 -2 q 10 3 22 -4`,
            class: "stroke-only",
          })
        );
      }
      break;

    case "veil":
      g.append(el("rect", { x: cx - 30, y: cy - 5, width: 62, height: 11, rx: 5, class: "soft" }));
      g.append(el("rect", { x: cx - 22, y: cy + 8, width: 46, height: 7, rx: 3, class: "soft" }));
      break;

    case "ripple":
      for (let i = 0; i < 5; i++) {
        g.append(el("circle", { cx: cx - 24 + i * 12, cy, r: 5 }));
        g.append(el("circle", { cx: cx - 18 + i * 12, cy: cy + 10, r: 4 }));
      }
      break;

    case "lens":
      g.append(el("ellipse", { cx, cy, rx: 34, ry: 8 }));
      g.append(el("ellipse", { cx, cy: cy + 13, rx: 22, ry: 5 }));
      break;

    case "slab":
      g.append(el("rect", { x: cx - 34, y: cy - 8, width: 70, height: 20, rx: 6 }));
      break;

    case "lumps":
      for (let i = 0; i < 4; i++) {
        g.append(el("rect", { x: cx - 30 + i * 17, y: cy - 6, width: 14, height: 13, rx: 5 }));
      }
      break;

    case "puff":
      g.append(el("circle", { cx: cx - 11, cy, r: 10 }));
      g.append(el("circle", { cx: cx + 3, cy: cy - 4, r: 13 }));
      g.append(el("circle", { cx: cx + 17, cy, r: 9 }));
      g.append(el("rect", { x: cx - 22, y: cy + 6, width: 46, height: 5, rx: 2 }));
      break;

    case "tower": {
      // Base, body, and the anvil that gives it away from a distance.
      g.append(el("rect", { x: cx - 24, y: cy - 4, width: 50, height: 8, rx: 3 }));
      g.append(el("rect", { x: cx - 20, y: cy - 96, width: 42, height: 96, rx: 14 }));
      g.append(el("ellipse", { cx: cx + 1, cy: cy - 100, rx: 44, ry: 11 }));
      break;
    }
  }

  return g;
}

export function buildCloudChart(clouds) {
  const svg = el("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "cloud-chart",
    role: "img",
    "aria-label":
      "Diagrama de tipos de nube situados a la altura a la que se forman",
  });

  for (const layer of LAYERS) {
    svg.append(
      el("rect", {
        x: PAD.left,
        y: y(layer.to),
        width: WIDTH - PAD.left - PAD.right,
        height: y(layer.from) - y(layer.to),
        class: "layer-band",
      })
    );
    const label = el("text", {
      x: PAD.left + 6,
      y: y(layer.to) + 15,
      class: "layer-label",
    });
    label.textContent = layer.label;
    svg.append(label);
  }

  for (const km of [0, 2, 5, 8, 11, 13]) {
    svg.append(
      el("line", {
        x1: PAD.left, x2: WIDTH - PAD.right, y1: y(km), y2: y(km), class: "grid",
      })
    );
    const tick = el("text", {
      x: PAD.left - 8, y: y(km) + 4, class: "axis-label", "text-anchor": "end",
    });
    tick.textContent = `${km} km`;
    svg.append(tick);
  }

  // Ground.
  svg.append(
    el("line", {
      x1: PAD.left, x2: WIDTH - PAD.right, y1: y(0), y2: y(0), class: "ground",
    })
  );

  const bySeverity = new Map(clouds.map((c) => [c.code, c.severity]));

  for (const placement of PLACEMENTS) {
    const severity = bySeverity.get(placement.code) || "calm";
    const cx = px(placement.x);
    const cy = y(placement.km);
    svg.append(drawShape(placement.shape, cx, cy, `sev-${severity}`));

    // Each shape extends a different distance below its anchor, so the label
    // offset follows the shape rather than one flat number.
    const labelDrop = { tower: 20, lens: 30, puff: 26 }[placement.shape] ?? 24;
    const label = el("text", {
      x: cx,
      y: cy + labelDrop,
      class: "cloud-code",
      "text-anchor": "middle",
    });
    label.textContent = placement.code;
    svg.append(label);
  }

  return svg;
}

// Every cloud in the data should have somewhere to sit on the chart, and the
// chart should not invent codes the data does not have.
export function placementCodes() {
  return PLACEMENTS.map((p) => p.code);
}
