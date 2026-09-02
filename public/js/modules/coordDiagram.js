// Two diagrams for the coordinates panel.
//
// The first takes an MGRS reference apart and labels each piece, because the
// format is opaque until someone shows you that it is zone, then band, then a
// hundred-kilometre square, then metres east and north inside it.
//
// The second is a scale bar for the storm counter: the gap between flash and
// thunder placed against the distance it means and the action it implies.

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

// Anatomy of an MGRS reference, with each group labelled underneath.
export function mgrsAnatomy(mgrs) {
  const WIDTH = 640;
  const HEIGHT = 150;

  const groups = [
    { text: String(mgrs.zone), label: "Zona", detail: "6° de longitud", className: "zone" },
    { text: mgrs.band, label: "Banda", detail: "8° de latitud", className: "band" },
    { text: mgrs.square, label: "Cuadrado", detail: "100 km", className: "square" },
    { text: String(mgrs.easting).padStart(mgrs.digits, "0"), label: "Este", detail: "metros", className: "easting" },
    { text: String(mgrs.northing).padStart(mgrs.digits, "0"), label: "Norte", detail: "metros", className: "northing" },
  ];

  const svg = el("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "mgrs-anatomy",
    role: "img",
    "aria-label": `Referencia MGRS ${mgrs.text} descompuesta en sus partes`,
  });

  // Width follows character count, but with a floor: the zone and band carry
  // one or two characters and their captions are wider than the box, so purely
  // proportional sizing made the labels collide.
  const gap = 10;
  const usable = WIDTH - 32 - gap * (groups.length - 1);
  const MIN_WIDTH = 82;

  const rawWidths = groups.map((g) => g.text.length);
  const rawTotal = rawWidths.reduce((sum, w) => sum + w, 0);
  const floored = rawWidths.map((w) => Math.max(MIN_WIDTH, (w / rawTotal) * usable));
  const flooredTotal = floored.reduce((sum, w) => sum + w, 0);
  // Rescale so the row still fills the available width exactly.
  const widths = floored.map((w) => (w / flooredTotal) * usable);

  let x = 16;
  for (const [index, group] of groups.entries()) {
    const width = widths[index];

    svg.append(
      el("rect", { x, y: 16, width, height: 44, rx: 6, class: `mgrs-box ${group.className}` })
    );

    const value = el("text", {
      x: x + width / 2, y: 46, class: "mgrs-value", "text-anchor": "middle",
    });
    value.textContent = group.text;
    svg.append(value);

    svg.append(
      el("line", {
        x1: x + width / 2, x2: x + width / 2, y1: 62, y2: 74, class: "mgrs-leader",
      })
    );

    const label = el("text", {
      x: x + width / 2, y: 90, class: "mgrs-label", "text-anchor": "middle",
    });
    label.textContent = group.label;
    svg.append(label);

    const detail = el("text", {
      x: x + width / 2, y: 108, class: "mgrs-detail", "text-anchor": "middle",
    });
    detail.textContent = group.detail;
    svg.append(detail);

    x += width + gap;
  }

  const footer = el("text", { x: WIDTH / 2, y: 136, class: "mgrs-detail", "text-anchor": "middle" });
  footer.textContent = "Se lee siempre primero el este y después el norte.";
  svg.append(footer);

  return svg;
}

// Distance to the storm on a scale, with the three bands the verdict uses.
export function stormScale(km) {
  const WIDTH = 640;
  // Tall enough for the readout under the band labels: it used to sit at
  // y=114 inside a 110-high box and got clipped.
  const HEIGHT = 134;
  const MAX_KM = 25;
  const LEFT = 24;
  const RIGHT = WIDTH - 24;
  const TRACK_Y = 54;

  const x = (value) => LEFT + (Math.min(value, MAX_KM) / MAX_KM) * (RIGHT - LEFT);

  const svg = el("svg", {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: "storm-scale",
    role: "img",
    "aria-label": `La tormenta está a unos ${km.toFixed(1)} kilómetros`,
  });

  const bands = [
    { from: 0, to: 3, className: "danger", label: "Encima" },
    { from: 3, to: 10, className: "caution", label: "Cerca" },
    { from: 10, to: MAX_KM, className: "watch", label: "Lejos" },
  ];

  for (const band of bands) {
    svg.append(
      el("rect", {
        x: x(band.from), y: TRACK_Y - 11,
        width: x(band.to) - x(band.from), height: 22,
        class: `storm-band ${band.className}`,
      })
    );
    const label = el("text", {
      x: (x(band.from) + x(band.to)) / 2, y: TRACK_Y + 34,
      class: `storm-band-label ${band.className}`, "text-anchor": "middle",
    });
    label.textContent = band.label;
    svg.append(label);
  }

  for (const tick of [0, 5, 10, 15, 20, 25]) {
    const at = el("text", { x: x(tick), y: 26, class: "storm-tick", "text-anchor": "middle" });
    at.textContent = tick === MAX_KM ? `${tick}+ km` : `${tick}`;
    svg.append(at);
  }

  // The marker, clamped so a very distant strike still shows at the far end.
  const cx = x(km);
  svg.append(
    el("path", {
      d: `M ${cx} ${TRACK_Y - 16} L ${cx - 7} ${TRACK_Y - 28} L ${cx + 7} ${TRACK_Y - 28} Z`,
      class: "storm-marker",
    })
  );
  svg.append(el("circle", { cx, cy: TRACK_Y, r: 6, class: "storm-marker" }));

  const readout = el("text", { x: cx, y: TRACK_Y + 66, class: "storm-readout", "text-anchor": "middle" });
  readout.textContent = `${km.toFixed(1)} km`;
  svg.append(readout);

  return svg;
}
