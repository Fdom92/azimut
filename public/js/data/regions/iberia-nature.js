// Iberian nature reference.
//
// Reference, not identifier. Every entry describes what you might meet and
// what to do about it; none of them asks you to decide your own safety from a
// description. For the snakes in particular the identification is included so
// that harmless colubrids stop being killed on sight — it deliberately does
// NOT gate the first aid, because the response to any bite is the same.
//
// No mushrooms, in any form. It is the obvious thing to add and it is the one
// that kills people.
//
// Each entry carries its sources. Nothing here is written from memory.

export const CATEGORIES = {
  reptiles: "Reptiles",
  insectos: "Insectos y arácnidos",
  plantas: "Plantas",
};

export const NATURE = [
  {
    id: "viboras",
    name: "Víboras",
    aka: ["hocicuda", "de Seoane", "áspid"],
    category: "reptiles",
    where:
      "Las tres especies ibéricas: la de Seoane en la cornisa cantábrica, Galicia y norte de Navarra; la áspid en el norte de Cataluña, Aragón, Navarra, País Vasco y La Rioja; la hocicuda en buena parte del resto de la península.",
    recognise:
      "Ojo pequeño con pupila vertical, cabeza triangular bien separada del cuerpo y cubierta de escamas pequeñas, cuerpo corto y robusto, y cola que se estrecha de golpe. Las culebras tienen pupila redonda, cabeza ovalada con placas grandes, cuerpo estilizado y cola que se afina poco a poco. La hocicuda se reconoce por el morro levantado.",
    risk:
      "Alrededor de un centenar de mordeduras al año en España, con mortalidad prácticamente nula. No es mortal, pero sí necesita asistencia sanitaria: el dolor es intenso y la gravedad se valora en el hospital.",
    actions: [
      "Llama al 112 y traslada sin demora. Ningún primer auxilio justifica retrasar la llegada al hospital.",
      "Quita anillos, reloj y ropa apretada de la zona antes de que se hinche — si no, actúan de torniquete.",
      "Inmoviliza el miembro con una férula y mantenlo quieto: reduce el dolor, la hinchazón y la absorción.",
      "Cubre la mordedura con un apósito limpio y seco, sin manipularla.",
      "Para el dolor, paracetamol.",
      "Si puedes describir la serpiente sin acercarte ni perseguirla, ayuda al hospital a elegir el antídoto.",
    ],
    never: [
      "Torniquete.",
      "Succionar el veneno: no aporta ningún beneficio.",
      "Cortar o hacer incisiones en la herida.",
      "Aplicar calor o frío extremos.",
      "Aplicar alcohol.",
      "Aspirina o antiinflamatorios tipo ibuprofeno: aumentan el sangrado.",
    ],
    identificationNote:
      "Distinguir víbora de culebra no cambia lo que tienes que hacer. Ante cualquier mordedura, el protocolo es el mismo y termina en el hospital. Saber diferenciarlas sirve para no matar culebras inofensivas, no para decidir si te atiendes.",
    emergency: true,
    // The Asociación Herpetológica Española publishes a protocol at
    // herpetologica.es that belongs here too, but its certificate would not
    // verify when this was written, so it is not cited as a source for
    // content nobody read. Add it once checked.
    sources: [
      { label: "Desnivel — Mordedura de víbora", url: "https://www.desnivel.com/excursionismo/mordedura-de-vibora/" },
    ],
  },

  {
    id: "garrapatas",
    name: "Garrapatas",
    aka: [],
    category: "insectos",
    where:
      "Herbazales, matorral y bordes de sendero, sobre todo de primavera a principios de otoño. Se suben desde la vegetación al rozarla.",
    recognise:
      "Ácaro sin segmentación visible del cuerpo, que se fija a la piel y se hincha conforme se alimenta. Busca en pliegues: ingles, axilas, detrás de las rodillas y las orejas, y en el cuero cabelludo.",
    risk:
      "La picadura en sí es indolora. El riesgo está en los patógenos que puede transmitir, y aumenta cuanto más tiempo permanezca fijada — por eso lo que importa es retirarla pronto y bien.",
    actions: [
      "Pinzas de punta fina, lo más pegadas a la piel que puedas.",
      "Tira hacia arriba con fuerza firme, constante y perpendicular a la piel. Sin girar ni dar tirones bruscos.",
      "Limpia después la zona y tus manos con agua y jabón, alcohol o yodado.",
      "Guarda la garrapata en una bolsa cerrada por si hace falta identificarla. No la aplastes.",
      "Vigila la zona las semanas siguientes. Si aparece una mancha roja que crece, fiebre o malestar, ve al médico y cuenta que te picó una garrapata.",
    ],
    never: [
      "Aceite, vaselina, petróleo, alcohol o anestésicos para que 'se suelte': el Ministerio los desaconseja expresamente porque facilitan el contagio.",
      "Calor, cigarrillos o mecheros.",
      "Tirar con los dedos, retorcerla o cortarla con tijeras — se rompe y las piezas bucales quedan dentro.",
    ],
    emergency: false,
    sources: [
      { label: "Ministerio de Sanidad — Guía de actuación ante picadura de garrapata (PDF)", url: "https://www.sanidad.gob.es/areas/alertasEmergenciasSanitarias/preparacionRespuesta/docs/Guia_actuacion_picadura_garrapata_20170915.pdf" },
      { label: "Comunidad de Madrid — Garrapatas", url: "https://www.comunidad.madrid/salud/garrapatas" },
    ],
  },

  {
    id: "procesionaria",
    name: "Procesionaria del pino",
    aka: ["Thaumetopoea pityocampa"],
    category: "insectos",
    where:
      "Pinares y parques con coníferas. Los bolsones blancos cuelgan de las ramas; las orugas descienden en fila india a enterrarse, de finales de invierno a primavera, y con inviernos suaves se adelantan.",
    recognise:
      "Oruga peluda que avanza en procesión, una detrás de otra. El peligro no es que muerda: son sus pelos urticantes, que se desprenden y vuelan.",
    risk:
      "En personas, irritación de piel, ojos y vías respiratorias, y reacciones alérgicas que a veces necesitan atención médica. En perros el riesgo es mucho mayor: al olerlas o lamerlas sufren inflamación grave de lengua y boca, con riesgo de necrosis y de compromiso respiratorio.",
    actions: [
      "No frotes ni rasques: frotar rompe más pelos y extiende la toxina.",
      "Lava en abundancia con agua templada. El agua desnaturaliza la toxina.",
      "Quítate la ropa que haya tocado los pelos y lávala aparte.",
      "Si hay perro implicado, al veterinario de inmediato — es una urgencia, no algo que se mire mañana.",
      "En personas, si hay dificultad para respirar, hinchazón de cara o boca, o reacción que va a más: 112.",
    ],
    never: [
      "Frotar la zona o los ojos.",
      "Manipular las orugas o los bolsones, ni siquiera con palo: los pelos vuelan.",
      "Dejar que el perro husmee el suelo en pinares durante la temporada.",
    ],
    emergency: false,
    sources: [
      { label: "112 Comunidad de Madrid — alerta por procesionaria", url: "https://www.madridactual.es/noticias-regionales/medio-ambiente/el-112-lanza-una-alerta-por-la-procesionaria-y-da-claves-para-evitar-riesgos-20260324-8093226.html" },
    ],
  },

  {
    id: "velutina",
    name: "Avispa velutina",
    aka: ["avispa asiática", "Vespa velutina"],
    category: "insectos",
    where:
      "Bien establecida en la cornisa cantábrica y Galicia, extendiéndose. Nidos grandes en altura, a menudo en árboles.",
    recognise:
      "Mayor que la avispa común y menor que el avispón europeo. Cabeza negra y abdomen oscuro con una franja anaranjada; las otras dos tiran a amarillo claro.",
    risk:
      "El veneno es parecido al de la avispa común, pero al ser más grande inyecta más cantidad y la picadura duele más. El riesgo real está en las picaduras múltiples y en las personas alérgicas — en torno al 3% de la población reacciona al veneno de avispa.",
    actions: [
      "Lava con agua y jabón y desinfecta.",
      "Aplica frío para contener la hinchazón.",
      "Aléjate del nido sin agitar los brazos: la defensa es colectiva.",
      "Picaduras múltiples, picadura en boca o garganta, o cualquier señal de reacción general — dificultad para respirar, hinchazón lejos del pinchazo, mareo: 112 de inmediato.",
      "Si la persona lleva autoinyector de adrenalina por alergia conocida, que lo use y aun así llama al 112.",
    ],
    never: [
      "Agitar o golpear cerca de un nido.",
      "Intentar retirar un nido por tu cuenta: eso lo hace personal especializado.",
    ],
    emergency: false,
    sources: [
      { label: "La Región — cómo evitar la picadura de velutina y qué hacer", url: "https://www.laregion.es/galicia/como-evitar-picadura-velutina-avispa-asiatica_1_20230629-2338408.html" },
    ],
  },

  {
    id: "fitofotodermatitis",
    name: "Plantas que queman con el sol",
    aka: ["fitofotodermatitis", "higuera", "ruda", "Heracleum"],
    category: "plantas",
    where:
      "Higuera en toda España — hoja y savia son lo más fototóxico. También ruda, cicuta y otras umbelíferas grandes.",
    recognise:
      "No se reconoce por la lesión, se reconoce por la secuencia: tocaste la planta, te dio el sol, y entre 24 y 48 horas después aparece la reacción, con el máximo hacia las 72 horas. Empieza con ardor y enrojecimiento y puede llegar a ampollas.",
    risk:
      "Es una reacción fototóxica, no alérgica: le pasa a cualquiera, no hace falta haberse sensibilizado antes. Hacen falta tres cosas a la vez: savia, sol y piel húmeda o sudada.",
    actions: [
      "Si acabas de tocarla, lava con agua y jabón cuanto antes — limita cuánto fototóxico se absorbe.",
      "Tapa la zona del sol durante los días siguientes.",
      "En casos leves, compresas húmedas y crema hidratante.",
      "Si salen ampollas extensas, afecta a la cara, o la reacción va a más, ve al médico.",
    ],
    never: [
      "Manipular estas plantas al sol o justo antes de exponerte.",
      "Reventar las ampollas.",
    ],
    emergency: false,
    sources: [
      { label: "Desnivel — atención a la fitofotodermatosis", url: "https://www.desnivel.com/escalada-roca/reacciones-alergicas-atencion-a-la-fitofotodermatosis/" },
      { label: "Medicina General y de Familia — fitofotodermatosis tras contacto con higuera", url: "https://mgyf.org/reconocimiento-abordaje-fitofotodermatosis/" },
    ],
  },
];

export const DISCLAIMER =
  "Esto orienta, no diagnostica ni sustituye a un profesional. Ante cualquier duda o si la cosa va a peor, 112.";

export const EMERGENCY_NUMBER = "112";
