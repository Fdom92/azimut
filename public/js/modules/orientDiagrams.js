// Diagrams for the instrument-free methods. Geometry, not topology — unlike a
// knot, a shadow and a bisected angle can be drawn correctly from the same
// definitions the code already computes, and a reader can check them against
// what they see.

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function label(text, x, y, className = "diagram-label") {
  const node = el("text", { x, y, class: className, "text-anchor": "middle" });
  node.textContent = text;
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

// Stick and shadow: the shadow falls directly away from the sun, so once you
// know where the sun is you know the opposite bearing exactly.
export function stickAndShadow() {
  const svg = frame(300, 170, "Palo clavado, sombra apuntando al lado opuesto al sol");

  svg.append(el("line", { x1: 20, x2: 280, y1: 130, y2: 130, class: "diagram-ground" }));

  // Sun, upper left.
  const sun = el("text", { x: 52, y: 40, class: "diagram-glyph", "text-anchor": "middle" });
  sun.textContent = "☀️";
  svg.append(sun);

  // Rays reaching the top of the stick.
  for (let i = 0; i < 3; i++) {
    svg.append(
      el("line", { x1: 66 + i * 6, y1: 46 + i * 8, x2: 148, y2: 66 + i * 3, class: "diagram-ray" })
    );
  }

  // The stick.
  svg.append(el("line", { x1: 150, x2: 150, y1: 60, y2: 130, class: "diagram-object" }));

  // Its shadow, thrown away from the sun.
  svg.append(
    el("path", { d: "M 150 130 L 246 130 L 240 136 L 150 136 Z", class: "diagram-shadow" })
  );

  svg.append(el("line", { x1: 246, x2: 268, y1: 130, y2: 130, class: "diagram-arrow" }));
  svg.append(
    el("path", { d: "M 268 126 L 276 130 L 268 134 Z", class: "diagram-arrow-head" })
  );

  svg.append(label("sombra", 200, 154));
  svg.append(label("sol", 52, 62));
  return svg;
}

// Watch method: hour hand at the sun, and the bisector to twelve marks the
// meridian — south above the equator.
export function watchDial(cardinal = "S") {
  const svg = frame(220, 200, "Esfera de reloj con la aguja horaria al sol y la bisectriz al sur");
  const cx = 110;
  const cy = 100;
  const r = 72;

  svg.append(el("circle", { cx, cy, r, class: "diagram-dial" }));

  for (let hour = 0; hour < 12; hour++) {
    const angle = ((hour * 30 - 90) * Math.PI) / 180;
    const outer = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    const inner = {
      x: cx + Math.cos(angle) * (r - (hour % 3 === 0 ? 10 : 5)),
      y: cy + Math.sin(angle) * (r - (hour % 3 === 0 ? 10 : 5)),
    };
    svg.append(
      el("line", { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, class: "diagram-tick" })
    );
  }

  svg.append(label("12", cx, cy - r + 22, "diagram-hour"));

  // Twelve points up; the hour hand is drawn at four o'clock as an example.
  svg.append(el("line", { x1: cx, y1: cy, x2: cx, y2: cy - r + 14, class: "diagram-twelve" }));

  const handAngle = ((4 * 30 - 90) * Math.PI) / 180;
  svg.append(
    el("line", {
      x1: cx, y1: cy,
      x2: cx + Math.cos(handAngle) * (r - 18),
      y2: cy + Math.sin(handAngle) * (r - 18),
      class: "diagram-hand",
    })
  );

  // Bisector between twelve and the hand.
  const bisectAngle = ((2 * 30 - 90) * Math.PI) / 180;
  svg.append(
    el("line", {
      x1: cx, y1: cy,
      x2: cx + Math.cos(bisectAngle) * (r + 18),
      y2: cy + Math.sin(bisectAngle) * (r + 18),
      class: "diagram-bisector",
    })
  );

  const sun = el("text", {
    x: cx + Math.cos(handAngle) * (r + 20),
    y: cy + Math.sin(handAngle) * (r + 20) + 5,
    class: "diagram-glyph",
    "text-anchor": "middle",
  });
  sun.textContent = "☀️";
  svg.append(sun);

  svg.append(
    label(
      cardinal,
      cx + Math.cos(bisectAngle) * (r + 34),
      cy + Math.sin(bisectAngle) * (r + 34) + 4,
      "diagram-cardinal"
    )
  );

  svg.append(label("aguja horaria al sol", cx, 192));
  return svg;
}

// The pointer stars of the Plough, extended five times to Polaris.
export function polarisFinder() {
  const svg = frame(300, 180, "La Osa Mayor y la línea que apunta a la Polar");

  // Plough, drawn as it commonly appears with the bowl to the right.
  const plough = [
    { x: 250, y: 62, name: "Dubhe" },
    { x: 250, y: 104, name: "Merak" },
    { x: 212, y: 112, name: "" },
    { x: 210, y: 70, name: "" },
    { x: 176, y: 60, name: "" },
    { x: 146, y: 46, name: "" },
    { x: 116, y: 50, name: "" },
  ];

  for (let i = 0; i < plough.length - 1; i++) {
    svg.append(
      el("line", {
        x1: plough[i].x, y1: plough[i].y,
        x2: plough[i + 1].x, y2: plough[i + 1].y,
        class: "diagram-constellation",
      })
    );
  }
  // Close the bowl.
  svg.append(
    el("line", {
      x1: plough[3].x, y1: plough[3].y, x2: plough[0].x, y2: plough[0].y,
      class: "diagram-constellation",
    })
  );

  for (const star of plough) {
    svg.append(el("circle", { cx: star.x, cy: star.y, r: 3.5, class: "diagram-star" }));
    if (star.name) svg.append(label(star.name, star.x, star.y + 20, "diagram-star-name"));
  }

  // Merak through Dubhe, extended.
  svg.append(
    el("line", { x1: 250, y1: 104, x2: 58, y2: 66, class: "diagram-pointer" })
  );

  svg.append(el("circle", { cx: 46, cy: 64, r: 5, class: "diagram-star polar" }));
  svg.append(label("Polar", 46, 46, "diagram-star-name"));
  svg.append(label("×5 la separación entre las dos", 150, 168));

  return svg;
}
