// The stories behind the figures in constellations.js.
//
// These are the Greek versions, which are the ones the constellation names
// come from — but almost every one has variants, and different tellers swap
// who did what. They are told here as stories rather than as facts, because
// that is what they are. Where a myth explains something you can actually
// check in the sky — why Orion and Scorpius never appear together, why the
// bears never set — that is worth more than the story, so it is said plainly.
//
// `story` is the myth. `look` is what to point at, which is the part that
// matters when you are showing someone rather than reading alone.

export const MYTHS = {
  Ori: {
    story:
      "Orión era un cazador enorme que presumía de poder matar a cualquier animal de la tierra. La diosa Gea, harta, le mandó un escorpión, que era pequeño y acabó con él.",
    look:
      "Zeus los puso a los dos en el cielo, pero en lados opuestos, para que no volvieran a encontrarse. Y se cumple: cuando Orión se pone por el oeste, Escorpio está saliendo por el este. Nunca se ven juntos.",
  },
  UMa: {
    story:
      "Calisto era una ninfa del séquito de Artemisa. Zeus se fijó en ella, y Hera, al enterarse, la convirtió en osa. Años después su hijo Arcas estuvo a punto de matarla cazando, sin saber quién era; Zeus los subió a los dos al cielo antes de que pasara.",
    look:
      "Hera pidió entonces que nunca pudieran bajar a beber al mar. Por eso, desde nuestra latitud, la Osa Mayor da vueltas al polo sin llegar a ponerse nunca: está siempre sobre el horizonte, a cualquier hora y en cualquier mes.",
  },
  UMi: {
    story:
      "La Osa Menor es Arcas, el hijo de Calisto, puesto en el cielo junto a su madre para que nadie volviera a separarlos.",
    look:
      "En la punta del mango está la Polar. No es la estrella más brillante del cielo, ni de lejos — es famosa porque está casi encima del eje de la Tierra y no se mueve. Todas las demás giran a su alrededor durante la noche.",
  },
  Cas: {
    story:
      "Casiopea era una reina que presumió de ser más hermosa que las ninfas del mar. Poseidón se lo tomó mal y mandó un monstruo marino contra su reino. Ella acabó atada a su trono y colocada en el cielo dando vueltas al polo.",
    look:
      "El castigo era pasar media vuelta cabeza abajo, y se ve: unas noches la figura dibuja una W y otras una M, según la hora. Es la misma reina girando.",
  },
  Cyg: {
    story:
      "Cicno vio caer del cielo a su amigo Faetón, que había perdido el control del carro del Sol, y se pasó días zambulléndose en el río para recuperar su cuerpo. Apolo, conmovido, lo convirtió en cisne.",
    look:
      "Vuela a lo largo de la Vía Láctea, con las alas abiertas y el cuello estirado. También se le llama la Cruz del Norte, y se entiende al verla: es una cruz clarísima.",
  },
  Lyr: {
    story:
      "La lira de Orfeo, que tocaba tan bien que paraba a los ríos y amansaba a las fieras. Cuando murió, Zeus puso el instrumento entre las estrellas.",
    look:
      "Vega, su estrella principal, es de las más brillantes del cielo y está casi en el cenit en verano. Hace 12.000 años era ella la estrella polar, y volverá a serlo dentro de otros 12.000.",
  },
  Leo: {
    story:
      "El león de Nemea, al que ninguna flecha ni espada podía atravesar. Heracles tuvo que estrangularlo con los brazos, y luego se quedó su piel como armadura.",
    look:
      "La cabeza y el pecho forman una hoz o un signo de interrogación al revés. Abajo del todo de esa hoz está Régulo, que quiere decir «reyezuelo».",
  },
  Boo: {
    story:
      "El Boyero, el que conduce los bueyes. Muchos lo identifican con Arcas ya adulto, persiguiendo eternamente a su madre osa alrededor del polo.",
    look:
      "Arturo, su estrella, tiene un tono anaranjado y es la más brillante del hemisferio norte. Su nombre significa «guardián del oso». Se encuentra fácil: sigue la curva del mango del Carro y llegas a ella.",
  },
  Sco: {
    story:
      "El escorpión que mató a Orión. Pequeño y discreto, hizo lo que no consiguió ningún animal grande.",
    look:
      "Antares, su corazón, es una estrella roja y enorme. El nombre significa «rival de Ares», es decir, rival de Marte, porque de color se parecen y la gente los confundía.",
  },
  CMa: {
    story:
      "El perro de caza de Orión, que le sigue por el cielo de invierno.",
    look:
      "Sirio es la estrella más brillante de toda la noche. Los egipcios se guiaban por ella: cuando volvía a verse al amanecer, después de meses oculta, el Nilo estaba a punto de desbordarse. De ahí viene la palabra canícula, los días de más calor, los días del perro.",
  },
  Tau: {
    story:
      "Zeus se transformó en un toro blanco y manso para acercarse a Europa. Cuando ella se subió a su lomo, cruzó el mar con ella a cuestas.",
    look:
      "Aldebarán es el ojo del toro, rojizo. Y sobre el lomo están las Pléyades, un puñado de estrellas apretadas: a simple vista se ven seis o siete, pero si miras un poco a un lado en vez de directamente, salen más. Ese truco se llama visión periférica y funciona con cualquier objeto débil.",
  },
  Aur: {
    story:
      "El Auriga, el conductor de carros. Se le atribuye a Erictonio, que inventó el carro de cuatro caballos para poder moverse a pesar de tener las piernas malas.",
    look:
      "Su estrella principal es Capella, «la cabritilla»: la cabra Amaltea, que amamantó a Zeus cuando era un bebé escondido. Es amarilla y muy alta en invierno.",
  },
};

// Keyed by the same `con` codes as CONSTELLATIONS, and the test suite checks
// both directions: a myth for a figure that is not drawn is dead weight, and a
// figure without one renders a card with nothing to open.
//
// The Summer Triangle has no entry on purpose. It lives in ASTERISMS rather
// than CONSTELLATIONS because no single constellation holds it, it is a modern
// navigation aid rather than an ancient figure, and it carries no myth to tell.

export function mythFor(con) {
  return MYTHS[con] ?? null;
}
