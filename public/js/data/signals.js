// Distress signalling. Timings are the ones actually used, not approximations:
// the alpine signal is six per minute answered by three, and SOS is sent as a
// single prosign with no letter gaps inside it.

export const MORSE_UNIT_MS = 200;

// Element lengths in morse units.
const DOT = 1;
const DASH = 3;
const ELEMENT_GAP = 1;

// SOS is one continuous symbol, not the three letters S, O and S sent
// separately — that is what distinguishes the distress call from the word.
export const SOS_ELEMENTS = [DOT, DOT, DOT, DASH, DASH, DASH, DOT, DOT, DOT];

// Expands SOS into an on/off schedule in milliseconds.
export function sosSchedule(unitMs = MORSE_UNIT_MS) {
  const steps = [];
  SOS_ELEMENTS.forEach((length, index) => {
    steps.push({ on: true, ms: length * unitMs });
    if (index < SOS_ELEMENTS.length - 1) {
      steps.push({ on: false, ms: ELEMENT_GAP * unitMs });
    }
  });
  return steps;
}

export function scheduleDurationMs(steps) {
  return steps.reduce((total, step) => total + step.ms, 0);
}

// Alpine distress: six signals inside one minute, then a minute of silence.
// The acknowledgement is three per minute.
export const ALPINE = {
  distress: { count: 6, windowMs: 60000, label: "Socorro" },
  answer: { count: 3, windowMs: 60000, label: "Recibido" },
};

export function alpineSchedule({ count, windowMs }, flashMs = 500) {
  const spacing = windowMs / count;
  const steps = [];
  for (let i = 0; i < count; i++) {
    steps.push({ on: true, ms: flashMs });
    steps.push({ on: false, ms: spacing - flashMs });
  }
  // The minute of silence that separates one round from the next.
  steps.push({ on: false, ms: windowMs });
  return steps;
}

// Ground-to-air symbols, laid out large on open ground with whatever
// contrasts: gear, stones, trampled snow. From the international set.
export const GROUND_SIGNALS = [
  { symbol: "V", meaning: "Necesitamos ayuda" },
  { symbol: "X", meaning: "Necesitamos ayuda médica" },
  { symbol: "N", meaning: "No" },
  { symbol: "Y", meaning: "Sí" },
  { symbol: "→", meaning: "Avanzamos en esta dirección" },
];

export const WHISTLE_CODES = [
  { blasts: "1 pitido largo", meaning: "¿Dónde estás? / atención" },
  { blasts: "2 pitidos", meaning: "Ven hacia mí" },
  { blasts: "3 pitidos", meaning: "Necesito ayuda" },
  { blasts: "6 pitidos por minuto", meaning: "Socorro (señal alpina)" },
];
