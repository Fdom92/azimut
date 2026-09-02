// The daylight question drawn as a timeline: when you set off, when the
// estimate has you arriving, and where the light runs out. A number of minutes
// either way is abstract; seeing the arrival marker fall past the dusk band is
// not.

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 640;
const HEIGHT = 168;
const PAD = { left: 20, right: 20, top: 44, bottom: 44 };
const TRACK_Y = 84;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function buildPaceChart({ start, arrival, sunset, civilDusk }) {
  // Span the whole thing plus a margin either side, so nothing sits on an edge.
  const points = [start, arrival, sunset, civilDusk].filter(Boolean);
  const earliest = Math.min(...points.map((d) => d.getTime()));
  const latest = Math.max(...points.map((d) => d.getTime()));
  const padding = Math.max((latest - earliest) * 0.12, 15 * 60000);
  const from = earliest - padding;
  const to = latest + padding;

  const x = (date) =>
    PAD.left + ((date.getTime() - from) / (to - from)) * (WIDTH - PAD.left - PAD.right);

  const svg = el("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "pace-chart",
    role: "img",
    "aria-label": "Línea de tiempo con la salida, la llegada estimada y el final de la luz",
  });

  // Daylight up to sunset, then the failing light between sunset and dusk.
  if (sunset) {
    svg.append(
      el("rect", {
        x: PAD.left,
        y: TRACK_Y - 11,
        width: Math.max(0, x(sunset) - PAD.left),
        height: 22,
        rx: 4,
        class: "pace-daylight",
      })
    );
  }
  if (sunset && civilDusk) {
    svg.append(
      el("rect", {
        x: x(sunset),
        y: TRACK_Y - 11,
        width: Math.max(0, x(civilDusk) - x(sunset)),
        height: 22,
        rx: 4,
        class: "pace-dusk",
      })
    );
  }

  // The track itself, and the walk drawn on top of it.
  svg.append(
    el("line", {
      x1: PAD.left, x2: WIDTH - PAD.right, y1: TRACK_Y, y2: TRACK_Y, class: "pace-track",
    })
  );
  svg.append(
    el("line", {
      x1: x(start), x2: x(arrival), y1: TRACK_Y, y2: TRACK_Y, class: "pace-walk",
    })
  );

  const marker = (date, label, className, above) => {
    const cx = x(date);
    svg.append(
      el("line", {
        x1: cx, x2: cx,
        y1: above ? TRACK_Y - 14 : TRACK_Y + 14,
        y2: above ? TRACK_Y - 28 : TRACK_Y + 28,
        class: `pace-tick ${className}`,
      })
    );
    const text = el("text", {
      x: cx,
      y: above ? TRACK_Y - 36 : TRACK_Y + 48,
      class: `pace-label ${className}`,
      "text-anchor": clampAnchor(cx),
    });
    text.textContent = `${label} ${formatClock(date)}`;
    svg.append(text);
  };

  marker(start, "Salida", "start", true);
  marker(arrival, "Llegada", "arrival", false);
  if (sunset) marker(sunset, "Ocaso", "sunset", true);
  if (civilDusk) marker(civilDusk, "Sin luz", "dusk", false);

  svg.append(el("circle", { cx: x(start), cy: TRACK_Y, r: 5, class: "pace-dot start" }));
  svg.append(el("circle", { cx: x(arrival), cy: TRACK_Y, r: 6, class: "pace-dot arrival" }));

  return svg;
}

// Keeps end labels from running off the edge of the viewBox.
function clampAnchor(cx) {
  if (cx < 78) return "start";
  if (cx > WIDTH - 78) return "end";
  return "middle";
}

// Where the time actually goes: flat ground against climbing. Seeing that a
// short walk with a lot of ascent is mostly climbing explains the estimate
// better than the total does.
export function buildBreakdown({ flatMinutes, climbMinutes, descentMinutes }) {
  const parts = [
    { label: "Terreno llano", minutes: flatMinutes, className: "flat" },
    { label: "Subida", minutes: climbMinutes, className: "climb" },
  ];
  if (descentMinutes > 0) {
    parts.push({ label: "Bajada fuerte", minutes: descentMinutes, className: "descent" });
  }

  const total = parts.reduce((sum, p) => sum + p.minutes, 0);
  if (total <= 0) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "breakdown";

  const bar = document.createElement("div");
  bar.className = "breakdown-bar";
  for (const part of parts) {
    if (part.minutes <= 0) continue;
    const segment = document.createElement("div");
    segment.className = `breakdown-segment ${part.className}`;
    segment.style.width = `${(part.minutes / total) * 100}%`;
    segment.title = `${part.label}: ${Math.round(part.minutes)} min`;
    bar.append(segment);
  }

  const legend = document.createElement("div");
  legend.className = "breakdown-legend";
  for (const part of parts) {
    if (part.minutes <= 0) continue;
    const item = document.createElement("span");
    const swatch = document.createElement("span");
    swatch.className = `breakdown-swatch ${part.className}`;
    item.append(swatch, `${part.label}: ${Math.round(part.minutes)} min`);
    legend.append(item);
  }

  wrapper.append(bar, legend);
  return wrapper;
}
