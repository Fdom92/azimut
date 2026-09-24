// Measuring things in the field with nothing but your body.
//
// Every method here is old, and every one is a proportion rather than a
// formula to memorise — which is why they survive without instruments and why
// they are worth teaching. Each entry says what it measures, how to do it, the
// reason it works, and how wrong it can be, because a measurement offered
// without its error is being passed off as something it is not.

export const TECHNIQUES = [
  {
    id: "mano",
    name: "La mano como transportador",
    measures: "Ángulos en el cielo, y cuánta luz queda",
    how: [
      "Estira el brazo del todo. Del todo: si lo doblas, las medidas dejan de valer.",
      "El meñique de canto cubre 1°. Tres dedos juntos, 5°. El puño cerrado, 10°. La mano abierta de pulgar a meñique, 20°.",
      "Para saber cuánta luz queda, apila puños entre el sol y el horizonte.",
      "El sol baja 15° cada hora, así que cada puño son unos 40 minutos.",
    ],
    why:
      "Funciona igual para un niño que para un adulto, y eso sorprende a todo el mundo. La razón es que quien tiene la mano pequeña tiene también el brazo corto, y quien la tiene grande lo tiene largo. Lo que cuenta no es el tamaño de la mano sino la proporción entre la mano y el brazo, y esa es casi la misma en todas las personas.",
    accuracy:
      "Un grado o dos de error, que para calcular luz es de sobra. Cerca del horizonte el aire desvía la luz y el sol parece más alto de lo que está, así que el último puño siempre miente un poco a tu favor.",
  },
  {
    id: "arbol",
    name: "La altura de un árbol",
    measures: "Altura, usando su sombra y la tuya",
    how: [
      "Hace falta sol y suelo más o menos llano.",
      "Mide tu sombra en pasos. Mide la sombra del árbol en pasos.",
      "Divide la sombra del árbol entre la tuya: ese número es cuántas veces más alto es que tú.",
      "Multiplícalo por tu altura y ya está.",
    ],
    why:
      "El sol está tan lejos que sus rayos llegan aquí paralelos. Tu sombra y la del árbol se forman con la misma inclinación, así que los dos triángulos tienen la misma forma y solo cambian de tamaño. Es la misma idea con la que se midió la primera vez la altura de las pirámides.",
    accuracy:
      "Muy buena si el suelo es llano. En cuesta falla, porque la sombra se estira o se encoge sin que el árbol haya cambiado.",
  },
  {
    id: "rio",
    name: "El ancho de un río",
    measures: "Distancia que no puedes cruzar para medirla",
    how: [
      "Ponte en la orilla, mirando al otro lado.",
      "Baja la visera de la gorra, o el canto de la mano en la frente, hasta que el borde te tape justo la otra orilla.",
      "Sin mover la cabeza ni la mano, date la vuelta.",
      "Mira dónde cae ahora esa misma línea, en tu lado. Cuenta los pasos hasta ese punto: ese es el ancho del río.",
    ],
    why:
      "Al no mover la cabeza mantienes exactamente el mismo ángulo hacia abajo. Eso dibuja dos triángulos iguales, uno a cada lado, con el mismo ángulo y la misma altura de ojos — así que la distancia también es la misma.",
    accuracy:
      "Sirve para decidir, no para construir un puente. El error habitual es mover la cabeza al girarse, y entonces sobra o falta bastante.",
  },
  {
    id: "paso",
    name: "Tu paso",
    measures: "Distancias en el suelo",
    how: [
      "Mide 100 metros en un sitio llano y cuenta los pasos dobles que te caben: cuenta solo cuando pisa el pie derecho.",
      "A un adulto le suelen salir unos 62. A un niño, muchos más, y por eso cada uno tiene que medir el suyo.",
      "Apúntalo. A partir de ahí, cualquier distancia es contar y dividir.",
    ],
    why:
      "Es la única medida de esta lista que no se deduce: se calibra. Por eso es la más fiable de todas, y la que más cambia de una persona a otra.",
    accuracy:
      "Muy buena en llano. Cuesta arriba el paso se acorta y cuesta abajo se alarga, así que en montaña cuenta de más.",
  },
  {
    id: "horizonte",
    name: "Hasta dónde se ve",
    measures: "La distancia al horizonte",
    how: [
      "Toma la altura de tus ojos sobre el suelo, en metros.",
      "Saca su raíz cuadrada y multiplica por 3,5. El resultado son kilómetros.",
      "De pie en la playa, unos 4,5 km. Desde un alto de 100 metros, unos 35.",
    ],
    why:
      "El horizonte no está lejos porque no veas más: está ahí porque la Tierra se curva y el suelo se va escondiendo. Subir cambia mucho lo que alcanzas a ver, y por eso el vigía iba siempre en lo alto del mástil.",
    accuracy:
      "Es una aproximación, y el aire la altera: en días fríos y densos se ve algo más lejos de lo que sale en la cuenta.",
  },
];

export function techniqueById(id) {
  return TECHNIQUES.find((t) => t.id === id) ?? null;
}

// Degrees the sun drops in an hour. Earth turns 360° in 24 hours, so this is
// simply 15 — the number the fist trick rests on.
export const DEGREES_PER_HOUR = 15;

// How the hand reads an angle, biggest first so a reading picks the largest
// gesture that fits.
export const HAND_ANGLES = [
  { id: "palmo", label: "Mano abierta", degrees: 20 },
  { id: "puno", label: "Puño", degrees: 10 },
  { id: "tres", label: "Tres dedos", degrees: 5 },
  { id: "menique", label: "Meñique", degrees: 1 },
];

// Express an angle as the gestures that add up to it — "dos puños y tres
// dedos" — which is how you actually measure it rather than how it is written.
export function inHandUnits(degrees) {
  if (!Number.isFinite(degrees) || degrees <= 0) return [];

  const parts = [];
  let left = degrees;
  for (const unit of HAND_ANGLES) {
    const count = Math.floor(left / unit.degrees);
    if (count > 0) {
      parts.push({ ...unit, count });
      left -= count * unit.degrees;
    }
  }
  return parts;
}

// For the sun there is only one gesture worth using: you stack fists, and you
// stop at a half. Decomposing 39° into "one open hand, one fist, three fingers
// and four little fingers" is arithmetically right and useless as an
// instruction — nobody measures the sun that way. That precision belongs to
// small angles, like checking Polaris against your latitude.
export function describeFists(degrees) {
  if (!Number.isFinite(degrees) || degrees <= 0) return "nada";

  const fists = degrees / 10;
  if (fists < 0.4) return "menos de medio puño";

  const whole = Math.floor(fists);
  const rest = fists - whole;
  // "1 puño" has to become "un puño": the digit reads as a measurement, and
  // this is meant to be read aloud to someone holding up their hand.
  const count = (n) => (n === 1 ? "un puño" : `${n} puños`);

  if (rest < 0.25) return whole === 1 ? "un puño" : `unos ${count(whole)}`;
  if (rest < 0.75) return whole === 0 ? "medio puño" : `${count(whole)} y medio`;
  return `casi ${count(whole + 1)}`;
}

export function describeHandUnits(degrees) {
  const parts = inHandUnits(degrees);
  if (parts.length === 0) return "menos de un dedo";

  const words = parts.map((p) => {
    // The 1° unit is named for the gesture, not for "finger". Calling it a
    // finger produces "tres dedos y 2 dedos" for 7°, which reads as a
    // contradiction rather than as two different gestures.
    const name =
      p.id === "puno" ? (p.count === 1 ? "puño" : "puños")
      : p.id === "palmo" ? (p.count === 1 ? "mano abierta" : "manos abiertas")
      : p.id === "tres" ? "tres dedos"
      : p.count === 1 ? "meñique" : "meñiques";
    return p.id === "tres" ? name : `${p.count} ${name}`;
  });

  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(", ")} y ${words[words.length - 1]}`;
}
