// Diagrams for measuring by eye.
//
// Each of these is a proportion argument, and a proportion is the one thing a
// drawing explains better than a sentence: the two similar triangles in the
// shadow method are obvious the moment you see them side by side, and close to
// impossible to hold in your head from prose alone.

const SVG_NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  return node;
}

function label(text, x, y, className = "diagram-label", anchor = "middle") {
  const node = el("text", { x, y, class: className, "text-anchor": anchor });
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

// Eye at the left, arm out to the right, and the angle each gesture subtends
// drawn as a wedge from the eye. Drawn to scale against each other: the fist
// wedge really is ten times the little finger.
export function handAngles() {
  const svg = frame(320, 200, "El ángulo que cubre cada gesto con el brazo estirado");

  const eyeX = 34;
  const eyeY = 100;
  const armLength = 210;

  svg.append(el("circle", { cx: eyeX, cy: eyeY, r: 9, class: "diagram-eye" }));
  svg.append(el("circle", { cx: eyeX + 2, cy: eyeY, r: 3.5, class: "diagram-pupil" }));

  // The arm, as a straight line out to where the hand is held.
  svg.append(
    el("line", {
      x1: eyeX + 12,
      y1: eyeY,
      x2: eyeX + armLength,
      y2: eyeY,
      class: "diagram-arrow",
      "stroke-dasharray": "3 4",
    })
  );
  svg.append(label("brazo estirado", eyeX + 110, eyeY + 18, "diagram-caption"));

  // One wedge per gesture, opening from the eye. Angles are exaggerated in
  // neither direction — they are drawn at their true relative size.
  const gestures = [
    { deg: 20, y: 30, text: "mano abierta · 20°" },
    { deg: 10, y: 60, text: "puño · 10°" },
    { deg: 5, y: 82, text: "tres dedos · 5°" },
    { deg: 1, y: 96, text: "meñique · 1°" },
  ];

  const scale = 2.6; // pixels of half-height per degree, at the hand
  for (const g of gestures) {
    const half = (g.deg / 2) * scale;
    const x = eyeX + armLength;
    const wedge = el("path", {
      d: `M ${eyeX} ${eyeY} L ${x} ${eyeY - half} L ${x} ${eyeY + half} Z`,
      class: "diagram-band",
    });
    svg.append(wedge);
    svg.append(
      el("line", {
        x1: x,
        y1: eyeY - half,
        x2: x,
        y2: eyeY + half,
        class: "diagram-hand",
      })
    );
  }

  // Labels stacked below, so the wedges stay readable.
  let ly = 148;
  for (const g of gestures) {
    svg.append(label(g.text, 160, ly, "diagram-caption"));
    ly += 15;
  }

  return svg;
}

// Fists stacked between the sun and the horizon. The whole point of the
// gesture: each one is roughly forty minutes of remaining light.
export function fistsToHorizon(fists = 3) {
  const count = Math.max(0, Math.min(8, Math.round(fists)));
  const svg = frame(300, 190, "Puños apilados entre el sol y el horizonte");

  const groundY = 160;
  svg.append(el("line", { x1: 15, x2: 285, y1: groundY, y2: groundY, class: "diagram-ground" }));

  const step = 26;
  const x = 150;
  const sunY = groundY - count * step - 12;

  const sun = el("text", { x, y: sunY, class: "diagram-glyph", "text-anchor": "middle" });
  sun.textContent = "☀️";
  svg.append(sun);

  for (let i = 0; i < count; i++) {
    const top = groundY - (i + 1) * step;
    svg.append(
      el("rect", {
        x: x - 16,
        y: top + 3,
        width: 32,
        height: step - 6,
        rx: 6,
        class: "diagram-band",
      })
    );
    svg.append(label("10°", x, top + step / 2 + 4, "diagram-caption"));
  }

  // Deliberately no total here. The count is rounded to whole fists, so a
  // total computed from it disagrees with the exact one the card shows beside
  // it — two numbers for the same thing, which is the defect this app already
  // had once in the pace breakdown. The rule per fist is the teachable part;
  // the exact remaining light is the card's job.
  const text =
    count === 0
      ? "El sol ya está en el horizonte"
      : `cada puño ≈ 40 min de luz`;
  svg.append(label(text, 150, groundY + 22, "diagram-label"));

  return svg;
}

// Two similar triangles side by side. Seeing them together is the argument.
export function shadowProportion() {
  const svg = frame(320, 190, "Tu sombra y la del árbol forman el mismo triángulo");

  const groundY = 155;
  svg.append(el("line", { x1: 15, x2: 305, y1: groundY, y2: groundY, class: "diagram-ground" }));

  // Person: short, with a short shadow.
  const personX = 60;
  const personTop = groundY - 34;
  svg.append(el("line", { x1: personX, y1: groundY, x2: personX, y2: personTop, class: "diagram-object" }));
  svg.append(el("line", { x1: personX, y1: groundY, x2: personX + 46, y2: groundY, class: "diagram-shadow" }));
  svg.append(el("line", { x1: personX, y1: personTop, x2: personX + 46, y2: groundY, class: "diagram-ray" }));
  svg.append(label("tú", personX - 12, personTop + 16, "diagram-caption"));
  svg.append(label("tu sombra", personX + 23, groundY + 16, "diagram-caption"));

  // Tree: taller, with a proportionally longer shadow and the same ray angle.
  const treeX = 190;
  const treeTop = groundY - 102;
  svg.append(el("line", { x1: treeX, y1: groundY, x2: treeX, y2: treeTop, class: "diagram-object" }));
  svg.append(el("line", { x1: treeX, y1: groundY, x2: treeX + 138, y2: groundY, class: "diagram-shadow" }));
  svg.append(el("line", { x1: treeX, y1: treeTop, x2: treeX + 138, y2: groundY, class: "diagram-ray" }));
  svg.append(label("árbol", treeX - 22, treeTop + 16, "diagram-caption"));
  svg.append(label("su sombra", treeX + 69, groundY + 16, "diagram-caption"));

  svg.append(label("mismo ángulo de sol, misma forma de triángulo", 160, 182, "diagram-caption"));

  return svg;
}

// The hat brim trick: the same downward angle turned around gives the same
// distance on your own side.
export function hatBrim() {
  const svg = frame(320, 180, "La visera marca el mismo ángulo a un lado y al otro");

  const eyeX = 160;
  const eyeY = 54;
  const groundY = 130;

  svg.append(el("line", { x1: 15, x2: 305, y1: groundY, y2: groundY, class: "diagram-ground" }));

  svg.append(el("circle", { cx: eyeX, cy: eyeY, r: 9, class: "diagram-eye" }));
  svg.append(el("circle", { cx: eyeX, cy: eyeY, r: 3.5, class: "diagram-pupil" }));
  svg.append(el("line", { x1: eyeX, y1: groundY, x2: eyeX, y2: eyeY + 8, class: "diagram-object" }));

  // Sight line across the river, and the mirrored one on your own bank.
  svg.append(el("line", { x1: eyeX, y1: eyeY, x2: eyeX + 118, y2: groundY, class: "diagram-ray" }));
  svg.append(el("line", { x1: eyeX, y1: eyeY, x2: eyeX - 118, y2: groundY, class: "diagram-ray" }));

  svg.append(label("otra orilla", eyeX + 118, groundY - 8, "diagram-caption"));
  svg.append(label("cuenta los pasos", eyeX - 60, groundY - 8, "diagram-caption"));

  svg.append(label("mismo ángulo → misma distancia", 160, 158, "diagram-label"));

  return svg;
}

// Why the horizon is where it is: the sight line leaves the curve at a tangent.
export function horizonCurve() {
  const svg = frame(320, 170, "El horizonte es donde la vista deja de tocar el suelo");

  // A wide, shallow arc reads as a curved surface without looking like a ball.
  svg.append(
    el("path", {
      d: "M 10 160 Q 160 90 310 160",
      class: "diagram-ground",
      fill: "none",
    })
  );

  const eyeX = 160;
  const eyeY = 74;
  svg.append(el("line", { x1: eyeX, y1: 112, x2: eyeX, y2: eyeY + 8, class: "diagram-object" }));
  svg.append(el("circle", { cx: eyeX, cy: eyeY, r: 8, class: "diagram-eye" }));
  svg.append(el("circle", { cx: eyeX, cy: eyeY, r: 3, class: "diagram-pupil" }));

  // Tangents: they graze the curve and carry on past it.
  svg.append(el("line", { x1: eyeX, y1: eyeY, x2: 302, y2: 150, class: "diagram-ray" }));
  svg.append(el("line", { x1: eyeX, y1: eyeY, x2: 18, y2: 150, class: "diagram-ray" }));

  svg.append(label("aquí se pierde de vista", 160, 132, "diagram-caption"));
  svg.append(label("cuanto más alto, más lejos", 160, 30, "diagram-label"));

  return svg;
}

export const DIAGRAMS = {
  mano: handAngles,
  arbol: shadowProportion,
  rio: hatBrim,
  horizonte: horizonCurve,
};

export function diagramFor(id) {
  return DIAGRAMS[id] ? DIAGRAMS[id]() : null;
}
