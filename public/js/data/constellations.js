// Constellation figures, as Bayer-letter pairs to join.
//
// A word on how much to trust this file. The star positions in stars.js are
// catalogue data and are as good as the Yale BSC. These line figures are not:
// they are the standard patterns written out here, and there is no single
// canonical set — different atlases join different stars. Every segment is
// checked by the test suite for being geometrically plausible, which catches a
// wrong star, but a defensible alternative joining is not an error.
//
// Only constellations that are actually recognisable, and mostly ones visible
// from Iberian latitudes. A sky full of faint figures is worse than a few you
// can pick out.

export const CONSTELLATIONS = [
  {
    con: "Ori",
    name: "Orión",
    note: "El cinturón de tres en fila es lo más reconocible del cielo de invierno.",
    lines: [
      ["α", "ζ"], ["γ", "δ"],
      ["δ", "ε"], ["ε", "ζ"],
      ["ζ", "κ"], ["δ", "β"],
      ["α", "γ"],
    ],
  },
  {
    con: "UMa",
    name: "Osa Mayor",
    note: "El Carro. Sus dos ruedas traseras, Merak y Dubhe, apuntan a la Polar.",
    lines: [
      ["α", "β"], ["β", "γ"], ["γ", "δ"], ["δ", "α"],
      ["δ", "ε"], ["ε", "ζ"], ["ζ", "η"],
    ],
  },
  {
    con: "UMi",
    name: "Osa Menor",
    note: "La Polar es la punta del mango. Su altura sobre el horizonte es tu latitud.",
    lines: [
      ["α", "δ"], ["δ", "ε"], ["ε", "ζ"],
      ["ζ", "β"], ["β", "γ"], ["γ", "η"], ["η", "ζ"],
    ],
  },
  {
    con: "Cas",
    name: "Casiopea",
    note: "Una W en el lado opuesto de la Polar respecto al Carro.",
    lines: [["β", "α"], ["α", "γ"], ["γ", "δ"], ["δ", "ε"]],
  },
  {
    con: "Cyg",
    name: "Cisne",
    note: "La Cruz del Norte. Deneb, en la cola, cierra el Triángulo de Verano.",
    lines: [
      ["α", "γ"], ["γ", "η"], ["η", "β"],
      ["δ", "γ"], ["γ", "ε"],
    ],
  },
  {
    con: "Lyr",
    name: "Lira",
    note: "Vega, la más brillante del verano, con un pequeño paralelogramo colgando.",
    lines: [["α", "ζ"], ["ζ", "β"], ["β", "γ"], ["γ", "δ"], ["δ", "ζ"]],
  },
  {
    con: "Leo",
    name: "Leo",
    note: "La hoz de la cabeza parece un signo de interrogación al revés.",
    lines: [
      ["ε", "μ"], ["μ", "ζ"], ["ζ", "γ"], ["γ", "η"], ["η", "α"],
      ["α", "θ"], ["θ", "β"], ["β", "δ"], ["δ", "γ"],
    ],
  },
  {
    con: "Boo",
    name: "Boyero",
    note: "Una cometa con Arturo en la punta. Se llega siguiendo la curva del mango del Carro.",
    lines: [["α", "ε"], ["ε", "δ"], ["δ", "β"], ["β", "γ"], ["γ", "ρ"], ["ρ", "α"]],
  },
  {
    con: "Sco",
    name: "Escorpio",
    note: "Antares, roja, en el corazón; la cola se curva hasta el aguijón.",
    lines: [
      ["β", "δ"], ["δ", "π"], ["δ", "σ"], ["σ", "α"], ["α", "τ"],
      ["τ", "ε"], ["ε", "μ"], ["μ", "ζ"], ["ζ", "η"], ["η", "θ"],
      ["θ", "ι"], ["ι", "κ"], ["κ", "λ"],
    ],
  },
  {
    con: "CMa",
    name: "Can Mayor",
    note: "Sirio es la estrella más brillante de todo el cielo nocturno.",
    lines: [["β", "α"], ["α", "δ"], ["δ", "ε"], ["ε", "η"]],
  },
  {
    con: "Tau",
    name: "Tauro",
    note: "Aldebarán marca el ojo, en la V de las Híades.",
    lines: [["β", "ζ"], ["ζ", "α"], ["α", "γ"], ["γ", "λ"]],
  },
  {
    con: "Aur",
    name: "Auriga",
    note: "Un pentágono con Capella, que desde el norte casi no llega a ponerse.",
    lines: [["α", "β"], ["β", "θ"], ["θ", "ι"], ["ι", "η"], ["η", "α"]],
  },
];

// Three bright stars in three different constellations, which is why they need
// their own entry: they are the pattern people actually navigate the summer sky
// by, and no single constellation contains them.
export const ASTERISMS = [
  {
    name: "Triángulo de Verano",
    note: "Vega, Deneb y Altair. Alto en el cielo las noches de verano.",
    stars: [
      ["α", "Lyr"],
      ["α", "Cyg"],
      ["α", "Aql"],
    ],
    closed: true,
  },
];
