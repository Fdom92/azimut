import { sunReport, formatTime, formatDuration, compassPoint } from "./modules/sunMoon.js";
import { listLocations, saveLocation, deleteLocation } from "./store.js";
import {
  shadowMethod,
  watchMethod,
  polarisMethod,
  magneticToTrue,
} from "./astro/orientation.js";
import { playSchedule, createTone, PATTERNS } from "./modules/distress.js";
import { GROUND_SIGNALS, WHISTLE_CODES } from "./data/signals.js";
import { region } from "./data/regions/iberia.js";
import {
  cloudsByLevel,
  cloudsBySeverity,
  signs,
  stormActions,
  source,
  SEVERITY_LABEL,
} from "./modules/weather.js";
import {
  knotsByGroup,
  missingParts,
  imageAttribution,
  progress,
} from "./modules/knots.js";

const home = document.getElementById("home");
const backBtn = document.getElementById("back");
const panels = [...document.querySelectorAll(".panel")];

const form = document.getElementById("sun-form");
const latInput = document.getElementById("lat");
const lonInput = document.getElementById("lon");
const dateInput = document.getElementById("date");
const resultEl = document.getElementById("sun-result");
const savedEl = document.getElementById("saved");
const savedList = document.getElementById("saved-list");

// ---- Navigation ----

function showTool(id) {
  home.hidden = true;
  backBtn.hidden = false;
  for (const panel of panels) panel.hidden = panel.id !== id;
}

function showHome() {
  home.hidden = false;
  backBtn.hidden = true;
  for (const panel of panels) panel.hidden = true;
}

for (const tile of document.querySelectorAll(".tile[data-tool]")) {
  tile.addEventListener("click", () => {
    showTool(tile.dataset.tool);
    if (tile.dataset.tool === "orient") renderOrientation();
  });
}

backBtn.addEventListener("click", () => {
  stopSignal();
  showHome();
});

// ---- Sun and moon ----

dateInput.value = new Date().toISOString().slice(0, 10);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

document.getElementById("locate").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Este navegador no expone geolocalización.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      latInput.value = coords.latitude.toFixed(4);
      lonInput.value = coords.longitude.toFixed(4);
      render();
    },
    (err) => showError(`No se pudo obtener la posición: ${err.message}`),
    { enableHighAccuracy: true, timeout: 15000 }
  );
});

document.getElementById("save-location").addEventListener("click", async () => {
  const lat = Number(latInput.value);
  const lon = Number(lonInput.value);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    showError("Introduce una latitud y longitud válidas antes de guardar.");
    return;
  }
  const name = prompt("Nombre del sitio");
  if (!name) return;
  await saveLocation({ name, lat, lon });
  await renderSaved();
});

async function renderSaved() {
  const locations = await listLocations();
  savedEl.hidden = locations.length === 0;
  savedList.replaceChildren(
    ...locations.map((loc) => {
      const li = document.createElement("li");

      const use = document.createElement("button");
      use.type = "button";
      use.className = "link";
      use.textContent = `${loc.name} (${loc.lat.toFixed(3)}, ${loc.lon.toFixed(3)})`;
      use.addEventListener("click", () => {
        latInput.value = loc.lat;
        lonInput.value = loc.lon;
        render();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "link danger";
      remove.textContent = "borrar";
      remove.addEventListener("click", async () => {
        await deleteLocation(loc.id);
        await renderSaved();
      });

      li.append(use, remove);
      return li;
    })
  );
}

function render() {
  const lat = Number(latInput.value);
  const lon = Number(lonInput.value);
  const date = new Date(`${dateInput.value}T12:00:00`);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Number.isNaN(date.getTime())) {
    showError("Revisa la latitud, la longitud y la fecha.");
    return;
  }

  const report = sunReport(date, lat, lon);
  resultEl.hidden = false;
  resultEl.replaceChildren();

  if (report.polar) {
    const notice = document.createElement("p");
    notice.className = "notice";
    notice.textContent =
      report.polar === "above"
        ? "Sol de medianoche: el sol no se pone en esta fecha."
        : "Noche polar: el sol no sale en esta fecha.";
    resultEl.append(notice);
  }

  const summary = document.createElement("dl");
  summary.className = "summary";
  addPair(summary, "Duración del día", formatDuration(report.dayLength));
  addPair(
    summary,
    "Sol ahora",
    report.now.isUp
      ? `${report.now.altitude.toFixed(1)}° de altura, ${report.now.azimuth.toFixed(0)}° (${report.now.compass})`
      : "Bajo el horizonte"
  );
  resultEl.append(summary);

  const list = document.createElement("ul");
  list.className = "events";
  for (const event of report.events) {
    const li = document.createElement("li");
    if (event.emphasis) li.className = "emphasis";
    const name = document.createElement("span");
    name.textContent = event.label;
    const value = document.createElement("time");
    value.textContent = formatTime(event.at);
    li.append(name, value);
    list.append(li);
  }
  resultEl.append(list);
}

function addPair(dl, term, value) {
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.textContent = value;
  dl.append(dt, dd);
}

function showError(message) {
  resultEl.hidden = false;
  const p = document.createElement("p");
  p.className = "notice error";
  p.textContent = message;
  resultEl.replaceChildren(p);
}

// ---- Orientation ----

const orientResult = document.getElementById("orient-result");
const compassReading = document.getElementById("compass-reading");

function currentPosition() {
  const lat = Number(latInput.value);
  const lon = Number(lonInput.value);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

function renderOrientation() {
  const position = currentPosition();
  orientResult.replaceChildren();

  if (!position) {
    const p = document.createElement("p");
    p.className = "notice";
    p.textContent =
      "Introduce una posición en Sol y luna primero — los métodos solares la necesitan.";
    orientResult.append(p);
    return;
  }

  const now = new Date();
  const shadow = shadowMethod(now, position.lat, position.lon);
  const watch = watchMethod(now, position.lat, position.lon);
  const polaris = polarisMethod(position.lat);

  orientResult.append(
    methodCard(
      "Palo y sombra",
      shadow.usable
        ? `El sol está a ${shadow.sunAzimuth.toFixed(0)}° (${compassPoint(shadow.sunAzimuth)}), ${shadow.sunAltitude.toFixed(0)}° sobre el horizonte. La sombra de cualquier objeto vertical apunta a ${shadow.shadowPointsTo.toFixed(0)}° (${compassPoint(shadow.shadowPointsTo)}).`
        : "El sol está demasiado bajo ahora mismo: la sombra se alarga y la dirección deja de ser fiable. Espera a que suba más de 5°."
    ),
    methodCard(
      "Método del reloj",
      watch.usable
        ? `Pon el reloj plano y la aguja horaria apuntando al sol. La bisectriz entre esa aguja y las 12 marca el ${watch.bisectorCardinal === "S" ? "sur" : "norte"}. Ojo: usa la hora solar, no la del móvil — en España el reloj va muy por delante del sol y es donde falla la versión clásica del truco.`
        : "El sol está demasiado bajo para este método ahora mismo."
    ),
    methodCard(
      "La Polar",
      polaris.visible
        ? `${polaris.pointerInstruction} Comprobación: la Polar debe quedar a unos ${polaris.expectedAltitude.toFixed(0)}° sobre el horizonte, que es tu latitud. Si no cuadra, no es esa estrella.`
        : "Desde el hemisferio sur la Polar no se ve. Usa la Cruz del Sur."
    )
  );
}

function methodCard(title, body) {
  const card = document.createElement("div");
  card.className = "card";
  const h = document.createElement("h3");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  card.append(h, p);
  return card;
}

document.getElementById("compass-start").addEventListener("click", async () => {
  const Sensor = window.DeviceOrientationEvent;
  if (!Sensor) {
    compassReading.textContent = "Este dispositivo no expone orientación.";
    return;
  }
  if (typeof Sensor.requestPermission === "function") {
    try {
      const granted = await Sensor.requestPermission();
      if (granted !== "granted") {
        compassReading.textContent = "Permiso denegado.";
        return;
      }
    } catch {
      compassReading.textContent = "No se pudo pedir permiso de orientación.";
      return;
    }
  }
  window.addEventListener("deviceorientationabsolute", onHeading);
  window.addEventListener("deviceorientation", onHeading);
});

function onHeading(event) {
  const magnetic =
    event.webkitCompassHeading ??
    (event.absolute && event.alpha != null ? 360 - event.alpha : null);
  if (magnetic == null) {
    compassReading.textContent =
      "El dispositivo entrega orientación relativa, no absoluta: no sirve como brújula.";
    return;
  }
  const declination = region.magneticDeclination.approxDegrees;
  const trueHeading = magneticToTrue(magnetic, declination);
  compassReading.textContent =
    `${trueHeading.toFixed(0)}° (${compassPoint(trueHeading)}) respecto al norte geográfico — ` +
    `declinación aplicada ${declination}°, aproximada para la península.`;
}

// ---- Distress ----

const patternSelect = document.getElementById("pattern");
const patternDesc = document.getElementById("pattern-desc");
const strobe = document.getElementById("strobe");
const startBtn = document.getElementById("signal-start");
const stopBtn = document.getElementById("signal-stop");

let stopFn = null;
let tone = null;

for (const [key, pattern] of Object.entries(PATTERNS)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = pattern.label;
  patternSelect.append(option);
}

function describePattern() {
  patternDesc.textContent = PATTERNS[patternSelect.value].description;
}
patternSelect.addEventListener("change", describePattern);
describePattern();

startBtn.addEventListener("click", async () => {
  stopSignal();

  const useScreen = document.getElementById("use-screen").checked;
  const useAudio = document.getElementById("use-audio").checked;
  if (!useScreen && !useAudio) {
    patternDesc.textContent = "Elige al menos un emisor: pantalla o sonido.";
    return;
  }

  if (useAudio) {
    tone = createTone();
    await tone?.resume();
  }
  if (useScreen) strobe.hidden = false;

  const steps = PATTERNS[patternSelect.value].steps();
  stopFn = playSchedule(steps, {
    onState: (on) => {
      if (useScreen) strobe.classList.toggle("on", on);
      if (useAudio) tone?.set(on);
    },
  });

  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", stopSignal);

function stopSignal() {
  stopFn?.();
  stopFn = null;
  tone?.close();
  tone = null;
  strobe.hidden = true;
  strobe.classList.remove("on");
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

// Never leave a strobe or a tone running in a background tab.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopSignal();
});

fillList("ground-signals", GROUND_SIGNALS, (s) => [s.symbol, s.meaning]);
fillList("whistle-codes", WHISTLE_CODES, (c) => [c.blasts, c.meaning]);

function fillList(id, items, project) {
  const list = document.getElementById(id);
  list.replaceChildren(
    ...items.map((item) => {
      const [left, right] = project(item);
      const li = document.createElement("li");
      const a = document.createElement("span");
      a.className = "signal-key";
      a.textContent = left;
      const b = document.createElement("span");
      b.textContent = right;
      li.append(a, b);
      return li;
    })
  );
}

// ---- Weather signs ----

const cloudList = document.getElementById("cloud-list");
const byLevelBtn = document.getElementById("by-level");
const bySeverityBtn = document.getElementById("by-severity");

function cloudCard(cloud) {
  const card = document.createElement("div");
  card.className = "card cloud";

  const head = document.createElement("div");
  head.className = "cloud-head";

  const name = document.createElement("h4");
  name.textContent = `${cloud.name} (${cloud.code})`;

  const badge = document.createElement("span");
  badge.className = `badge ${cloud.severity}`;
  badge.textContent = SEVERITY_LABEL[cloud.severity];

  head.append(name, badge);

  const appearance = document.createElement("p");
  appearance.className = "muted";
  appearance.textContent = cloud.appearance;

  const indicates = document.createElement("p");
  indicates.textContent = cloud.indicates;

  const lead = document.createElement("p");
  lead.className = "hint";
  lead.textContent = `Antelación: ${cloud.leadTime}`;

  card.append(head, appearance, indicates, lead);
  return card;
}

function renderCloudsByLevel() {
  cloudList.replaceChildren();
  for (const group of cloudsByLevel()) {
    if (group.clouds.length === 0) continue;
    const heading = document.createElement("h4");
    heading.className = "group-heading";
    heading.textContent = group.label;
    cloudList.append(heading, ...group.clouds.map(cloudCard));
  }
}

function renderCloudsBySeverity() {
  cloudList.replaceChildren(...cloudsBySeverity().map(cloudCard));
}

byLevelBtn.addEventListener("click", () => {
  byLevelBtn.classList.add("active");
  bySeverityBtn.classList.remove("active");
  renderCloudsByLevel();
});

bySeverityBtn.addEventListener("click", () => {
  bySeverityBtn.classList.add("active");
  byLevelBtn.classList.remove("active");
  renderCloudsBySeverity();
});

renderCloudsByLevel();

const signList = document.getElementById("sign-list");
signList.replaceChildren(
  ...signs().map((entry) => {
    const card = document.createElement("div");
    card.className = "card";
    const h = document.createElement("h4");
    h.textContent = entry.sign;
    const p = document.createElement("p");
    p.textContent = entry.means;
    card.append(h, p);
    return card;
  })
);

document.getElementById("storm-actions").replaceChildren(
  ...stormActions().map((action) => {
    const li = document.createElement("li");
    li.textContent = action;
    return li;
  })
);

const sourceEl = document.getElementById("weather-source");
const sourceLink = document.createElement("a");
sourceLink.href = source().url;
sourceLink.textContent = source().label;
sourceLink.rel = "noopener noreferrer";
sourceEl.append("Clasificación según ", sourceLink, ".");

// ---- Knots ----
//
// Entries are shown with what they are still missing rather than hidden, so
// the gap stays visible instead of quietly looking finished.

const knotList = document.getElementById("knot-list");

function knotCard(knot) {
  const card = document.createElement("div");
  card.className = "card";

  const head = document.createElement("div");
  head.className = "cloud-head";

  const name = document.createElement("h4");
  name.textContent = knot.name;
  head.append(name);

  const pending = missingParts(knot);
  if (pending.length > 0) {
    const badge = document.createElement("span");
    badge.className = "badge pending";
    badge.textContent = `Falta: ${pending.join(", ")}`;
    head.append(badge);
  }
  card.append(head);

  if (knot.aka.length > 0) {
    const aka = document.createElement("p");
    aka.className = "hint";
    aka.style.marginTop = "0";
    aka.textContent = `También: ${knot.aka.join(", ")}`;
    card.append(aka);
  }

  const use = document.createElement("p");
  use.textContent = knot.use;
  card.append(use);

  const characteristics = document.createElement("p");
  characteristics.className = "muted";
  characteristics.textContent = knot.characteristics;
  card.append(characteristics);

  if (knot.image) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = `img/knots/${knot.image.file}`;
    img.alt = `Diagrama del ${knot.name}`;
    img.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.textContent = imageAttribution(knot.image);
    figure.append(img, caption);
    card.append(figure);
  }

  if (knot.steps.length > 0) {
    const steps = document.createElement("ol");
    steps.className = "steps";
    for (const step of knot.steps) {
      const li = document.createElement("li");
      li.textContent = step;
      steps.append(li);
    }
    card.append(steps);
  }

  for (const warning of knot.warnings) {
    const p = document.createElement("p");
    p.className = "warning";
    p.textContent = warning;
    card.append(p);
  }

  return card;
}

const { done, total } = progress();
const progressEl = document.getElementById("knots-progress");
progressEl.textContent =
  done === total
    ? `Los ${total} nudos están ilustrados y revisados.`
    : `${done} de ${total} nudos completos. Los pasos y las ilustraciones se sacan de una fuente y los revisa una persona antes de darlos por buenos — un diagrama mal enseña un nudo distinto al que dice.`;

knotList.replaceChildren();
for (const group of knotsByGroup()) {
  const heading = document.createElement("h4");
  heading.className = "group-heading";
  heading.textContent = group.label;

  const description = document.createElement("p");
  description.className = "hint";
  description.style.margin = "0 0 12px";
  description.textContent = group.description;

  knotList.append(heading, description, ...group.knots.map(knotCard));
}

renderSaved();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Offline caching is a bonus; the app works without it.
  });
}
