// Knots, grouped by what they are for rather than by how they are tied —
// which is how you reach for one in the field.
//
// Two fields are deliberately left empty: `steps` and `image`. Step sequences
// and diagrams are the parts where a plausible-looking mistake teaches the
// wrong knot, and a wrong knot in the mountains is not a cosmetic bug. They
// get filled from a source, not from memory, and `reviewed` stays false until
// a person has checked the entry against one.
//
// The UI shows the pending state rather than hiding it.

export const GROUPS = {
  encordamiento: {
    label: "Encordamiento",
    description: "Unirte a la cuerda, o unir la cuerda a un punto.",
  },
  union: {
    label: "Unión",
    description: "Empalmar dos cuerdas entre sí.",
  },
  bloqueo: {
    label: "Bloqueo",
    description: "Morder la cuerda por fricción: autoseguros, descensos y frenados.",
  },
};

export const KNOTS = [
  {
    id: "ocho",
    name: "Nudo de ocho",
    aka: ["ocho por seno", "figure-eight"],
    group: "encordamiento",
    use: "El nudo de encordamiento estándar en escalada y alpinismo.",
    characteristics:
      "Fácil de revisar de un vistazo, incluso para otra persona: se ve si el trazado está bien porque las hebras van paralelas en todo el recorrido.",
    warnings: [
      "Después de aguantar una caída fuerte cuesta bastante deshacerlo.",
      "Deja siempre cabo sobrante suficiente al salir del nudo.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "ballestrinque",
    name: "Ballestrinque",
    aka: ["clove hitch"],
    group: "encordamiento",
    use: "Unirte a un anclaje o fijar la cuerda a un mosquetón.",
    characteristics:
      "Se hace y se ajusta con una mano, y permite regular la distancia al anclaje sin deshacerlo. Por eso se usa tanto en reuniones.",
    warnings: [
      "Puede correrse si la carga es muy variable o si el mosquetón es muy ancho.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "mariposa",
    name: "Mariposa alpina",
    aka: ["papillón", "alpine butterfly"],
    group: "encordamiento",
    use: "Crear un anillo en mitad de la cuerda: encordarse en el medio, o aislar un tramo dañado dejándolo fuera de carga.",
    characteristics:
      "Aguanta tracción en las tres direcciones sin deformarse, que es lo que lo distingue de otros nudos de seno.",
    warnings: [],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "pescador-doble",
    name: "Pescador doble",
    aka: ["double fisherman's"],
    group: "union",
    use: "Empalmar dos cuerdas, y cerrar anillos de cordino.",
    characteristics: "Muy seguro y compacto.",
    warnings: [
      "Tras cargarlo es difícil de deshacer — para anillos permanentes es una ventaja, para uniones temporales no.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "ocho-union",
    name: "Ocho de unión",
    aka: ["figure-eight bend"],
    group: "union",
    use: "Empalmar dos cuerdas siguiendo el trazado de un ocho.",
    characteristics:
      "Se revisa igual que el ocho de encordamiento, que es su ventaja: un solo trazado que aprender.",
    warnings: [],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "as-de-guia",
    name: "As de guía",
    aka: ["gaza", "bowline"],
    group: "union",
    use: "Formar un anillo fijo que no se cierra sobre sí mismo.",
    characteristics:
      "Se deshace con facilidad incluso después de haber trabajado, a diferencia del ocho.",
    warnings: [
      "Puede aflojarse con cargas cíclicas o sacudidas. Rematar siempre con un nudo de tope.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "prusik",
    name: "Prusik",
    aka: [],
    group: "bloqueo",
    use: "Autoseguro y ascenso por cuerda.",
    characteristics:
      "Muerde en las dos direcciones, y se libera aflojando las vueltas con la mano.",
    warnings: [
      "El cordino tiene que ser bastante más fino que la cuerda sobre la que muerde. Con diámetros parecidos no agarra.",
      "Pierde eficacia con la cuerda mojada o helada.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "machard",
    name: "Machard",
    aka: ["autoblocante francés"],
    group: "bloqueo",
    use: "Autoseguro en rápel.",
    characteristics:
      "Se suelta bajo carga más fácilmente que el prusik, lo que en rápel es justo lo que quieres.",
    warnings: [
      "Al ser más fácil de liberar, también es más fácil que se deslice. Comprueba que muerde antes de confiarle el peso.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "dinamico",
    name: "Nudo dinámico",
    aka: ["UIAA", "vereno", "medio ballestrinque"],
    group: "bloqueo",
    use: "Asegurar o descender sin aparato, directamente sobre un mosquetón.",
    characteristics:
      "Es el recurso cuando se pierde o falla el asegurador. Se invierte solo al cambiar el sentido de la cuerda.",
    warnings: [
      "Retuerce la cuerda de forma notable.",
      "Necesita mosquetón de pera y con seguro; en uno estrecho la cuerda roza donde no debe.",
    ],
    steps: [],
    image: null,
    reviewed: false,
  },
  {
    id: "taz",
    name: "Nudo taz",
    aka: [],
    group: "bloqueo",
    use: "Bloquear la cuerda del nudo dinámico para dejarla fija y liberar las manos.",
    characteristics: "Se hace sobre un dinámico ya montado y se deshace bajo carga.",
    warnings: [],
    steps: [],
    image: null,
    reviewed: false,
  },
];
