// Cloud types and what they indicate.
//
// Classification follows the ten genera of the WMO International Cloud Atlas
// (https://cloudatlas.wmo.int/). The "indicates" field is empirical: these are
// signs that have held up in mid-latitude westerly flow, which is what the
// Iberian peninsula sits in. They are not a forecast, and the module says so.

export const LEVELS = {
  high: "Alta (5-13 km)",
  mid: "Media (2-7 km)",
  low: "Baja (0-2 km)",
  vertical: "Desarrollo vertical",
};

export const CLOUDS = [
  {
    code: "Ci",
    name: "Cirros",
    level: "high",
    appearance: "Filamentos blancos y finos, como mechones o plumas. Hielo.",
    indicates: "Suelen ser lo primero que anuncia un frente cálido acercándose.",
    leadTime: "12-24 h",
    severity: "watch",
  },
  {
    code: "Cs",
    name: "Cirrostratos",
    level: "high",
    appearance: "Velo blanquecino que cubre el cielo. Produce halo alrededor del sol o la luna.",
    indicates: "El halo es de los indicadores más fiables: frente en camino, lluvia después.",
    leadTime: "12-18 h",
    severity: "watch",
  },
  {
    code: "Cc",
    name: "Cirrocúmulos",
    level: "high",
    appearance: "Granulado fino, como escamas. El clásico cielo aborregado.",
    indicates: "Aire inestable en altura. Tiempo cambiante.",
    leadTime: "12-24 h",
    severity: "watch",
  },
  {
    code: "As",
    name: "Altostratos",
    level: "mid",
    appearance: "Manto gris uniforme. El sol se ve como tras un cristal esmerilado, sin halo.",
    indicates: "El frente ya está encima. Lluvia continua a pocas horas.",
    leadTime: "3-6 h",
    severity: "watch",
  },
  {
    code: "Ac",
    name: "Altocúmulos",
    level: "mid",
    appearance: "Rollos o bancos algodonosos de tamaño medio, en hileras.",
    indicates:
      "Si por la mañana aparecen con torrecillas verticales (castellanus), la atmósfera está inestable y hay tormenta probable por la tarde.",
    leadTime: "6-12 h",
    severity: "caution",
  },
  {
    code: "Ns",
    name: "Nimbostratos",
    level: "mid",
    appearance: "Capa gris oscura y espesa que tapa el sol por completo.",
    indicates: "Lluvia o nieve continua, ya en curso o inminente. Sin aparato eléctrico.",
    leadTime: "en curso",
    severity: "caution",
  },
  {
    code: "St",
    name: "Estratos",
    level: "low",
    appearance: "Capa baja y uniforme, sin relieve. Es la niebla levantada del suelo.",
    indicates: "Llovizna y, sobre todo, visibilidad mala. En montaña el riesgo es perderse, no el agua.",
    leadTime: "en curso",
    severity: "caution",
  },
  {
    code: "Sc",
    name: "Estratocúmulos",
    level: "low",
    appearance: "Capa baja con grumos y claros entre ellos.",
    indicates: "Normalmente benigno. Poca o ninguna precipitación.",
    leadTime: "—",
    severity: "calm",
  },
  {
    code: "Cu",
    name: "Cúmulos",
    level: "vertical",
    appearance: "Algodones de base plana y contornos definidos.",
    indicates:
      "Planos y pequeños (humilis) son buen tiempo. Lo que importa es si crecen: si por la mañana ganan altura rápido, la tarde acaba en tormenta.",
    leadTime: "según crezcan",
    severity: "watch",
  },
  {
    code: "Cb",
    name: "Cumulonimbos",
    level: "vertical",
    appearance: "Torre enorme y oscura, con la cima aplanada en forma de yunque.",
    indicates:
      "Tormenta. Rayo, granizo, rachas violentas de viento y corrientes descendentes. Es la única nube de esta lista que exige actuar ya.",
    leadTime: "inmediato",
    severity: "danger",
  },
  {
    code: "Ac len",
    name: "Lenticulares",
    level: "mid",
    appearance: "Lentes o platillos suspendidos, quietos, normalmente a sotavento de una sierra.",
    indicates:
      "Viento fuerte en altura formando onda sobre el relieve. La nube está quieta pero el aire la atraviesa a gran velocidad. Mala señal para crestas y cumbres.",
    leadTime: "en curso",
    severity: "caution",
  },
];

// Signs that are not cloud classification.
export const SIGNS = [
  {
    sign: "Halo alrededor del sol o la luna",
    means: "Cirrostratos. Frente aproximándose, precipitación en 12-18 h.",
  },
  {
    sign: "Cielo rojo al atardecer",
    means:
      "Aire seco entrando por el oeste, que es de donde viene el tiempo en la península. Suele anunciar buen día siguiente. Al amanecer significa lo contrario: el aire seco ya ha pasado de largo.",
  },
  {
    sign: "Los cúmulos crecen rápido antes del mediodía",
    means:
      "Inestabilidad. En montaña es la señal clásica de tormenta vespertina: la regla es estar bajando de la cumbre a primera hora de la tarde, no subiendo.",
  },
  {
    sign: "Racha de viento fría y repentina con el cielo cargado",
    means:
      "Corriente descendente por delante de una tormenta. La tormenta llega en minutos, no en horas.",
  },
  {
    sign: "La presión cae rápido",
    means: "Frente o borrasca acercándose. Cuanto más rápido cae, más viento traerá.",
  },
];

// Standard lightning safety. This is the one part of the module that is
// instruction rather than observation.
export const STORM_ACTIONS = [
  "Baja de crestas, cumbres y collados. La altura relativa es lo que te expone.",
  "Aléjate de árboles aislados, postes, vallas metálicas y vías ferratas.",
  "Suelta piolet, bastones y todo lo metálico largo, y deja el material a distancia.",
  "Si estás expuesto: agáchate sobre los pies juntos, sin tumbarte y sin apoyar las manos, para reducir el contacto con el suelo.",
  "Cuevas poco profundas y salientes no protegen: la corriente circula por la roca.",
  "Espera 30 minutos desde el último trueno antes de volver a terreno expuesto.",
];

export const SOURCE = {
  label: "WMO International Cloud Atlas",
  url: "https://cloudatlas.wmo.int/",
};
