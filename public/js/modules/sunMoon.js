import { sunTimes, solarPosition, dayLengthMinutes } from "../astro/solar.js";

// Turns raw astronomical output into the rows the panel renders.
export function sunReport(date, latitude, longitude) {
  const times = sunTimes(date, latitude, longitude);
  const now = solarPosition(date, latitude, longitude);
  const length = dayLengthMinutes(times);

  return {
    polar: times.polar,
    dayLength: length,
    now: {
      altitude: now.altitude,
      azimuth: now.azimuth,
      compass: compassPoint(now.azimuth),
      isUp: now.altitude > -0.833,
    },
    events: [
      { key: "astronomicalDawn", label: "Amanecer astronómico", at: times.astronomicalDawn },
      { key: "nauticalDawn", label: "Amanecer náutico", at: times.nauticalDawn },
      { key: "civilDawn", label: "Amanecer civil", at: times.civilDawn },
      { key: "blueHourMorningStart", label: "Hora azul (inicio)", at: times.blueHourMorningStart },
      { key: "sunrise", label: "Orto", at: times.sunrise, emphasis: true },
      { key: "goldenHourMorningEnd", label: "Fin hora dorada", at: times.goldenHourMorningEnd },
      { key: "solarNoon", label: "Mediodía solar", at: times.solarNoon, emphasis: true },
      { key: "goldenHourEveningStart", label: "Inicio hora dorada", at: times.goldenHourEveningStart },
      { key: "sunset", label: "Ocaso", at: times.sunset, emphasis: true },
      { key: "blueHourEveningEnd", label: "Hora azul (fin)", at: times.blueHourEveningEnd },
      { key: "civilDusk", label: "Anochecer civil", at: times.civilDusk },
      { key: "nauticalDusk", label: "Anochecer náutico", at: times.nauticalDusk },
      { key: "astronomicalDusk", label: "Anochecer astronómico", at: times.astronomicalDusk },
    ],
  };
}

const POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO",
];

export function compassPoint(azimuth) {
  const index = Math.round(azimuth / 22.5) % 16;
  return POINTS[index];
}

export function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

export function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
