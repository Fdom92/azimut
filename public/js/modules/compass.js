// A rose you turn the phone against. It carries two references at once:
//
//   - the magnetic heading from the device, which is convenient and flaky
//   - the sun's bearing, which is computed and trustworthy
//
// Showing both is the point. If the needle and the sun disagree, the sun is
// right and the magnetometer is being disturbed — which is exactly what a
// single-reference compass hides from you.

const SVG_NS = "http://www.w3.org/2000/svg";
const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 96;

const CARDINALS = [
  { label: "N", angle: 0 },
  { label: "E", angle: 90 },
  { label: "S", angle: 180 },
  { label: "O", angle: 270 },
];

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

// Bearings run clockwise from north; SVG angles run counter-clockwise from
// the positive x axis, hence the offset.
function pointAt(bearing, distance) {
  const radians = ((bearing - 90) * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * distance,
    y: CENTER + Math.sin(radians) * distance,
  };
}

export function buildCompass() {
  const svg = el("svg", {
    viewBox: `0 0 ${SIZE} ${SIZE}`,
    class: "compass",
    role: "img",
    "aria-label": "Rosa de los vientos",
  });

  // Everything inside this group rotates with the device.
  const rose = el("g", { class: "rose" });

  rose.append(el("circle", { cx: CENTER, cy: CENTER, r: RADIUS, class: "rose-ring" }));

  for (let bearing = 0; bearing < 360; bearing += 15) {
    const major = bearing % 45 === 0;
    const outer = pointAt(bearing, RADIUS);
    const inner = pointAt(bearing, RADIUS - (major ? 12 : 6));
    rose.append(
      el("line", {
        x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y,
        class: major ? "tick major" : "tick",
      })
    );
  }

  for (const { label, angle } of CARDINALS) {
    const at = pointAt(angle, RADIUS - 28);
    const text = el("text", {
      x: at.x, y: at.y + 5,
      class: label === "N" ? "cardinal north" : "cardinal",
      "text-anchor": "middle",
    });
    text.textContent = label;
    rose.append(text);
  }

  // North needle.
  const tip = pointAt(0, RADIUS - 44);
  rose.append(
    el("path", {
      d: `M ${CENTER} ${tip.y} L ${CENTER - 9} ${CENTER} L ${CENTER + 9} ${CENTER} Z`,
      class: "needle-north",
    })
  );

  // Sun marker, positioned per update.
  const sun = el("circle", { cx: CENTER, cy: CENTER, r: 7, class: "sun-marker" });
  const sunLabel = el("text", { class: "sun-label", "text-anchor": "middle" });
  sunLabel.textContent = "☉";
  rose.append(sun, sunLabel);

  svg.append(rose);

  // Fixed index mark at the top: the direction the top of the phone points.
  svg.append(
    el("path", {
      d: `M ${CENTER} 8 L ${CENTER - 7} 22 L ${CENTER + 7} 22 Z`,
      class: "index-mark",
    })
  );

  return {
    svg,
    // heading: where the top of the device points, degrees from true north.
    // sunAzimuth: null when the sun is below the horizon.
    update({ heading, sunAzimuth }) {
      const rotation = Number.isFinite(heading) ? -heading : 0;
      rose.setAttribute("transform", `rotate(${rotation} ${CENTER} ${CENTER})`);

      const visible = Number.isFinite(sunAzimuth);
      sun.style.display = visible ? "" : "none";
      sunLabel.style.display = visible ? "" : "none";
      if (visible) {
        const at = pointAt(sunAzimuth, RADIUS - 44);
        sun.setAttribute("cx", at.x);
        sun.setAttribute("cy", at.y);
        sunLabel.setAttribute("x", at.x);
        sunLabel.setAttribute("y", at.y + 4);
      }
    },
  };
}

// How far apart two bearings are, and whether that gap is large enough to
// mean the magnetometer is being disturbed.
export function crossCheck(magneticTrueHeading, sunBearingFromDevice) {
  if (!Number.isFinite(magneticTrueHeading) || !Number.isFinite(sunBearingFromDevice)) {
    return { comparable: false };
  }
  let delta = Math.abs(magneticTrueHeading - sunBearingFromDevice);
  if (delta > 180) delta = 360 - delta;
  return {
    comparable: true,
    delta,
    trustworthy: delta <= 15,
  };
}
