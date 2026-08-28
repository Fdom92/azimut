import {
  sosSchedule,
  alpineSchedule,
  ALPINE,
  MORSE_UNIT_MS,
} from "../data/signals.js";

// Plays an on/off schedule through a screen element and an oscillator,
// looping until stopped. Returns a stop function.
//
// Both emitters are optional: the caller may pass only a screen, only audio,
// or both. Screen strobing is the battery-expensive one and the UI warns
// before starting it.
export function playSchedule(steps, { onState, loop = true } = {}) {
  let cancelled = false;
  let timer = null;

  const run = async () => {
    while (!cancelled) {
      for (const step of steps) {
        if (cancelled) break;
        onState?.(step.on);
        await new Promise((resolve) => {
          timer = setTimeout(resolve, step.ms);
        });
      }
      if (!loop) break;
    }
    onState?.(false);
  };

  run();

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    onState?.(false);
  };
}

// A single oscillator gated on and off — cheaper and more reliable than
// creating a node per beep.
export function createTone(frequency = 1000) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gain).connect(ctx.destination);
  osc.start();

  return {
    set(on) {
      // Ramp rather than step, so the speaker does not click on every element.
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(on ? 0.25 : 0, now, 0.01);
    },
    async resume() {
      if (ctx.state === "suspended") await ctx.resume();
    },
    close() {
      try {
        osc.stop();
        ctx.close();
      } catch {
        // Already torn down.
      }
    },
  };
}

export const PATTERNS = {
  sos: {
    label: "SOS (morse)",
    description:
      "Tres cortos, tres largos, tres cortos, sin separación entre letras. Es un único símbolo, no las letras S-O-S sueltas.",
    steps: () => sosSchedule(MORSE_UNIT_MS),
  },
  alpineDistress: {
    label: "Señal alpina de socorro",
    description:
      "Seis señales repartidas en un minuto, después un minuto de silencio, y se repite. Es la señal reconocida en montaña europea.",
    steps: () => alpineSchedule(ALPINE.distress),
  },
  alpineAnswer: {
    label: "Respuesta: recibido",
    description:
      "Tres señales en un minuto. Confirma a quien pide socorro que se le ha visto.",
    steps: () => alpineSchedule(ALPINE.answer),
  },
};
