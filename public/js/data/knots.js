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
    steps: [
      "Dobla la cuerda sobre sí misma y forma un seno tan largo como quieras que quede el anillo.",
      "Con el seno doble, traza un ocho: pásalo por encima de las dos hebras, rodéalas por detrás y tráelo otra vez al frente.",
      "Mete la punta del seno por el ojo que queda arriba, junto al cruce.",
      "Aprieta tirando de cada hebra por separado, hasta que las dos vayan paralelas en todo el recorrido sin montarse.",
      "Para encordarte al arnés se traza igual, pero con el chicote pasado por el arnés, siguiendo después el recorrido del nudo al revés.",
    ],
    image: {
      file: "ocho.jpg",
      title: "Figure of eight loop",
      author: "Satsun (Wikipedia en inglés)",
      license: "CC BY-SA 3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:FigureOfEightLoop.jpg",
      note: "Hecho por seno, doblando la cuerda. Encordado al arnés se traza igual, siguiendo el recorrido con el chicote.",
    },
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
    steps: [
      "Forma un bucle con la cuerda.",
      "Forma un segundo bucle idéntico, girando en el mismo sentido que el primero.",
      "Monta el segundo bucle por detrás del primero, uno encima de otro.",
      "Mete los dos bucles a la vez en el mosquetón y cierra el seguro.",
      "Aprieta tirando de las dos hebras. Para regular la distancia al anclaje, desliza cuerda a través del nudo sin deshacerlo.",
    ],
    image: {
      file: "ballestrinque.jpg",
      title: "EB1911 - Knot - Fig. 12 - Clove Hitch",
      author: "Anónimo, Encyclopædia Britannica 1911",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:EB1911_-_Knot_-_Fig._12_-_Clove_Hitch.jpg",
      note: "Dibujado alrededor de un palo. Sobre mosquetón el nudo es el mismo.",
    },
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
    steps: [
      "Forma un seno en mitad de la cuerda.",
      "Retuerce el seno dos vueltas completas sobre sí mismo: queda una figura con dos ojos.",
      "Lleva la punta del seno hacia abajo y pásala por el ojo inferior, como marca la flecha del dibujo.",
      "Aprieta tirando a la vez del anillo y de los dos cabos de la cuerda.",
    ],
    image: {
      file: "mariposa.png",
      title: "Alpine butterfly knot diagram",
      author: "LadyofHats",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:Alpine_butterfly_knot_diagram.png",
      note: "Cuatro pasos, de arriba abajo.",
    },
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
    steps: [
      "Pon las dos cuerdas paralelas y solapadas, con los chicotes apuntando en sentidos opuestos.",
      "Con el chicote de una, da dos vueltas alrededor de la otra cuerda.",
      "Pasa ese chicote por dentro de las dos vueltas y aprieta: queda un nudo doble mordiendo la otra cuerda.",
      "Repite lo mismo con el chicote de la segunda cuerda, en sentido contrario.",
      "Tira de las dos cuerdas para juntar los dos nudos: deben quedar pegados y simétricos.",
    ],
    image: {
      file: "pescador-doble.png",
      title: "Double Fisherman's knot",
      author: "Autor no identificado (Wikimedia Commons)",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:Double_Fisherman%27s_knot.svg",
      note: "Cuatro pasos, de arriba abajo. Cada cabo hace su nudo y luego se juntan.",
    },
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
    steps: [
      "Haz un ocho simple en el chicote de una de las cuerdas, sin apretarlo del todo.",
      "Mete el chicote de la segunda cuerda por el final del ocho y sigue su recorrido al revés, hebra contra hebra.",
      "Sácalo por donde había entrado el chicote de la primera.",
      "Aprieta tirando de las cuatro hebras por separado.",
      "Deja cabo sobrante en los dos extremos.",
    ],
    image: {
      file: "ocho-union.png",
      title: "Dubbeleachtknoop (Flemish bend)",
      author: "Jeroen van der Vegt",
      license: "CC0",
      source:
        "https://commons.wikimedia.org/wiki/File:Dubbeleachtknoop.svg",
    },
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
      "La UIAA lo desaconseja para escalada y alpinismo desde 1998: no aguanta bien las cargas oblicuas ni los impactos, y puede deshacerse al aliviarse la tensión. Para encordarte, usa el ocho.",
      "Puede aflojarse con cargas cíclicas o sacudidas. Rematar siempre con un nudo de tope.",
    ],
    steps: [
      "Forma un ojo pequeño en la cuerda, dejando el chicote por encima.",
      "Pasa el chicote por dentro del ojo, de abajo hacia arriba.",
      "Rodea con el chicote la hebra de carga, por detrás.",
      "Vuelve a meter el chicote por el ojo, en sentido contrario al que salió.",
      "Aprieta y remata con un nudo de tope sobre la hebra de carga.",
    ],
    image: {
      file: "as-de-guia.png",
      title: "Bowline",
      author: "Lucasbosch",
      license: "CC BY 3.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Bowline.svg",
      note: "Aquí el cabo sale por fuera del anillo. La variante con el cabo por dentro se considera más segura.",
    },
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
    steps: [
      "Necesitas un anillo de cordino cerrado, de diámetro claramente menor que el de la cuerda.",
      "Pasa el anillo por detrás de la cuerda y mete un extremo por el otro: queda una cabeza de alondra.",
      "Repite la vuelta dos o tres veces más, metiendo el anillo por dentro de sí mismo cada vez.",
      "Ordena las vueltas para que queden paralelas y sin montarse unas sobre otras.",
      "Pruébalo antes de confiarle el peso: debe deslizar al empujarlo con la mano y morder al cargarlo.",
    ],
    image: {
      file: "prusik.jpg",
      title: "Nodo prusik",
      author: "AnticheSere (Wikimedia Commons)",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:Nodo-prusik.JPG",
    },
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
    steps: [
      "Con un anillo de cordino, enrolla tres o cuatro vueltas alrededor de la cuerda, todas en el mismo sentido.",
      "Pasa el extremo libre del anillo por el bucle que queda al final de las vueltas.",
      "Tira hacia abajo para que las vueltas se cierren sobre la cuerda.",
      "Carga siempre en el mismo sentido: el machard muerde en una sola dirección.",
    ],
    image: {
      file: "machard.jpg",
      title: "The Klemheist with Loop",
      author: "Alan W. Grogono",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:Klemheist2.jpg",
    },
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
    steps: [
      "Forma un bucle con la cuerda.",
      "Da media vuelta al bucle para que las dos hebras se crucen.",
      "Mete el bucle en un mosquetón de seguro, mejor de pera, y cierra el seguro.",
      "Comprueba que el nudo se voltea solo dentro del mosquetón al cambiar el sentido de la cuerda.",
    ],
    image: {
      file: "dinamico.jpg",
      title: "HMS / medio ballestrinque sobre mosquetón",
      author: "Mark in the wiki (Wikipedia en alemán)",
      license: "Dominio público",
      source:
        "https://commons.wikimedia.org/wiki/File:HMS_complete.jpg",
    },
    reviewed: false,
  },
  {
    id: "taz",
    name: "Nudo taz",
    aka: ["nudo de mula", "mule knot"],
    group: "bloqueo",
    use: "Bloquear la cuerda del nudo dinámico para dejarla fija y liberar las manos.",
    characteristics: "Se hace sobre un dinámico ya montado y se deshace bajo carga.",
    warnings: [],
    steps: [
      "Con el dinámico cargado, sujeta firme la hebra de frenado.",
      "Haz un seno con la hebra de frenado y pásalo por detrás de las dos hebras que salen del mosquetón.",
      "Mete el seno por el bucle que se forma y aprieta el conjunto contra el dinámico.",
      "Remata el sobrante con un nudo simple alrededor de la cuerda cargada, para que no pueda soltarse solo.",
      "Para liberar, deshaz primero el remate: el nudo se suelta tirando del chicote aunque esté cargado.",
    ],
    image: {
      file: "taz.jpg",
      title: "Munter Mule Hitch",
      author: "Zaripov999",
      license: "CC BY-SA 4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Munter_Mule_Hitch.jpg",
      note: "Abajo el dinámico sobre el mosquetón; encima la mula que lo bloquea.",
    },
    reviewed: false,
  },
];
