import { solarPosition } from "../astro/solar.js";
import { moonHorizontal } from "../astro/lunar.js";

// The sun's altitude across a whole day, drawn as a curve over a horizon line
// with the twilight bands shaded underneath. The shape itself carries the
// information a list of times cannot: how high the sun gets, how fast it
// drops, how long the useful light lasts.

const SVG_NS = "http://www.w3.org/2000/svg";

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 34 };

const ALT_MAX = 90;
const ALT_MIN = -20;

// Twilight bands, in degrees below the horizon.
const BANDS = [
  { from: 0, to: -6, className: "band-civil" },
  { from: -6, to: -12, className: "band-nautical" },
  { from: -12, to: -18, className: "band-astronomical" },
];

const SAMPLE_MINUTES = 10;

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function scaleX(minutes) {
  const usable = WIDTH - PAD.left - PAD.right;
  return PAD.left + (minutes / 1440) * usable;
}

function scaleY(altitude) {
  const usable = HEIGHT - PAD.top - PAD.bottom;
  const clamped = Math.max(ALT_MIN, Math.min(ALT_MAX, altitude));
  return PAD.top + ((ALT_MAX - clamped) / (ALT_MAX - ALT_MIN)) * usable;
}

// Samples the day at local wall-clock minutes so the curve lines up with the
// times shown beside it.
export function samplePath(date, latitude, longitude) {
  const points = [];
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  for (let minutes = 0; minutes <= 1440; minutes += SAMPLE_MINUTES) {
    const at = new Date(start.getTime() + minutes * 60000);
    const { altitude, azimuth } = solarPosition(at, latitude, longitude);
    points.push({ minutes, altitude, azimuth, at });
  }
  return points;
}

// The moon on the same axes as the sun. Seeing both at once answers the
// question the two separate lists cannot: will there be any light tonight,
// and when.
function sampleMoonPath(date, latitude, longitude) {
  const points = [];
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  for (let minutes = 0; minutes <= 1440; minutes += SAMPLE_MINUTES) {
    const at = new Date(start.getTime() + minutes * 60000);
    const { altitude } = moonHorizontal(at, latitude, longitude);
    points.push({ minutes, altitude });
  }
  return points;
}

export function buildSunChart(date, latitude, longitude, now = new Date()) {
  const points = samplePath(date, latitude, longitude);

  const svg = el("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "sun-chart",
    role: "img",
    "aria-label": "Altura del sol a lo largo del día",
  });

  // Twilight bands below the horizon.
  for (const band of BANDS) {
    svg.append(
      el("rect", {
        x: PAD.left,
        y: scaleY(band.from),
        width: WIDTH - PAD.left - PAD.right,
        height: scaleY(band.to) - scaleY(band.from),
        class: band.className,
      })
    );
  }

  // Horizon.
  svg.append(
    el("line", {
      x1: PAD.left,
      x2: WIDTH - PAD.right,
      y1: scaleY(0),
      y2: scaleY(0),
      class: "horizon",
    })
  );

  // Altitude gridlines.
  for (const altitude of [30, 60, 90]) {
    svg.append(
      el("line", {
        x1: PAD.left,
        x2: WIDTH - PAD.right,
        y1: scaleY(altitude),
        y2: scaleY(altitude),
        class: "grid",
      })
    );
    const label = el("text", {
      x: PAD.left - 6,
      y: scaleY(altitude) + 4,
      class: "axis-label",
      "text-anchor": "end",
    });
    label.textContent = `${altitude}°`;
    svg.append(label);
  }

  // Hour ticks every three hours.
  for (let hour = 0; hour <= 24; hour += 3) {
    const x = scaleX(hour * 60);
    svg.append(
      el("line", {
        x1: x,
        x2: x,
        y1: HEIGHT - PAD.bottom,
        y2: HEIGHT - PAD.bottom + 4,
        class: "grid",
      })
    );
    const label = el("text", {
      x,
      y: HEIGHT - PAD.bottom + 17,
      class: "axis-label",
      "text-anchor": "middle",
    });
    label.textContent = `${String(hour % 24).padStart(2, "0")}`;
    svg.append(label);
  }

  // The daylight portion, filled down to the horizon.
  const daylight = points.filter((p) => p.altitude > 0);
  if (daylight.length > 1) {
    const area = [
      `M ${scaleX(daylight[0].minutes)} ${scaleY(0)}`,
      ...daylight.map((p) => `L ${scaleX(p.minutes)} ${scaleY(p.altitude)}`),
      `L ${scaleX(daylight[daylight.length - 1].minutes)} ${scaleY(0)}`,
      "Z",
    ].join(" ");
    svg.append(el("path", { d: area, class: "daylight" }));
  }

  // The full curve, including the part below the horizon.
  const curve = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.minutes)} ${scaleY(p.altitude)}`)
    .join(" ");
  svg.append(el("path", { d: curve, class: "sun-path" }));

  // The moon's track, dashed so it reads as the secondary curve.
  const moonPoints = sampleMoonPath(date, latitude, longitude);
  const moonCurve = moonPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.minutes)} ${scaleY(p.altitude)}`)
    .join(" ");
  svg.append(el("path", { d: moonCurve, class: "moon-path" }));

  // Marker for the current moment, only when it falls on the day drawn.
  const sameDay = now.toDateString() === new Date(date).toDateString();
  if (sameDay) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const { altitude } = solarPosition(now, latitude, longitude);
    svg.append(
      el("circle", {
        cx: scaleX(minutes),
        cy: scaleY(altitude),
        r: 6,
        class: altitude > 0 ? "sun-now up" : "sun-now down",
      })
    );
  }

  return svg;
}
