import {
  sunReport,
  formatTime,
  formatDuration,
  compassPoint,
  parseLatitude,
  parseLongitude,
} from "./modules/sunMoon.js";
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
import { buildSunChart } from "./modules/sunChart.js";
import { buildMoonDisc } from "./modules/moonPhase.js";
import { buildCompass, crossCheck } from "./modules/compass.js";
import {
  stickAndShadow,
  watchDial,
  polarisFinder,
} from "./modules/orientDiagrams.js";
import { buildCloudChart } from "./modules/cloudChart.js";
import { CLOUDS } from "./data/clouds.js";
import {
  byCategory as natureByCategory,
  allSources as natureSources,
  DISCLAIMER as NATURE_DISCLAIMER,
} from "./modules/nature.js";
import { diagramFor } from "./modules/natureDiagrams.js";
import { allFormats, toMGRS } from "./geo/coordinates.js";
import { mgrsAnatomy, stormScale } from "./modules/coordDiagram.js";
import { buildPaceChart, buildBreakdown } from "./modules/paceChart.js";
import {
  estimateMinutes,
  descentAdjustmentMinutes,
  daylightCheck,
  formatMinutes,
  PACE_FACTORS,
} from "./modules/pace.js";
import { stormDistanceKm, stormVerdict } from "./modules/weather.js";

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
    const tool = tile.dataset.tool;
    showTool(tool);
    if (tool === "sunMoon") openSunMoon();
    if (tool === "coords") openCoords();
    if (tool === "orient") {
      renderOrientationPosition();
      renderOrientation();
      refreshCompass();
    }
  });
}

// Position is entered in one panel but every solar method depends on it, so
// asking for it once and sharing it beats sending people back and forth.
let locating = false;

function requestPosition({ onDone } = {}) {
  if (!navigator.geolocation || locating) return;
  locating = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locating = false;
      latInput.value = coords.latitude.toFixed(4);
      lonInput.value = coords.longitude.toFixed(4);
      onDone?.(true);
    },
    () => {
      locating = false;
      onDone?.(false);
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

// The panel used to open on three blank inputs, hiding everything it computes
// behind manual data entry. Now it asks for a position once and draws
// immediately; declining just leaves the form ready.
let sunMoonOpened = false;

function openSunMoon() {
  if (sunMoonOpened) return;
  sunMoonOpened = true;

  if (currentPosition()) {
    render();
    return;
  }

  resultEl.hidden = false;
  resultEl.replaceChildren(notice("Buscando tu posición…"));
  requestPosition({
    onDone: (ok) => {
      if (ok) return render();
      resultEl.replaceChildren(
        notice("Sin posición todavía. Métela a mano o toca «Usar mi posición».")
      );
    },
  });
}

function notice(message) {
  const p = document.createElement("p");
  p.className = "notice";
  p.textContent = message;
  return p;
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
  requestPosition({
    onDone: (ok) =>
      ok ? render() : showError("No se pudo obtener la posición."),
  });
});

document.getElementById("save-location").addEventListener("click", async () => {
  const position = currentPosition();
  if (!position) {
    showError("Introduce una latitud y longitud válidas antes de guardar.");
    return;
  }
  const { lat, lon } = position;
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
  const position = currentPosition();
  const date = new Date(`${dateInput.value}T12:00:00`);

  if (!position || Number.isNaN(date.getTime())) {
    showError(
      "Revisa la latitud (-90 a 90), la longitud (-180 a 180) y la fecha."
    );
    return;
  }

  const { lat, lon } = position;
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
  resultEl.append(buildSunChart(date, lat, lon));
  resultEl.append(buildMoonBlock(report.moon));

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

function buildMoonBlock(moon) {
  const card = document.createElement("div");
  card.className = "card moon-block";

  const disc = buildMoonDisc(moon.phase);

  const info = document.createElement("div");
  info.className = "moon-info";

  const name = document.createElement("h4");
  name.textContent = moon.phase.name;

  const lit = document.createElement("p");
  lit.className = "muted";
  lit.textContent = `${Math.round(moon.phase.illuminated * 100)}% iluminada · ${Math.round(moon.distanceKm).toLocaleString("es-ES")} km`;

  const dl = document.createElement("dl");
  dl.className = "summary flush";

  if (moon.alwaysUp) {
    addPair(dl, "Hoy", "No se pone");
  } else if (moon.alwaysDown) {
    addPair(dl, "Hoy", "No sale");
  } else {
    addPair(dl, "Orto lunar", formatTime(moon.moonrise));
    addPair(dl, "Ocaso lunar", formatTime(moon.moonset));
  }

  addPair(
    dl,
    "Ahora",
    moon.now.isUp
      ? `${moon.now.altitude.toFixed(0)}° de altura, ${moon.now.azimuth.toFixed(0)}° (${moon.now.compass})`
      : "Bajo el horizonte"
  );

  info.append(name, lit, dl);
  card.append(disc, info);
  return card;
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
  const lat = parseLatitude(latInput.value);
  const lon = parseLongitude(lonInput.value);
  return lat != null && lon != null ? { lat, lon } : null;
}

function renderOrientationPosition() {
  positionBar(document.getElementById("orient-position"), () => {
    renderOrientationPosition();
    renderOrientation();
    refreshCompass();
  });
}

function renderOrientation() {
  const position = currentPosition();
  orientResult.replaceChildren();

  if (!position) {
    orientResult.append(
      notice("Con una posición, aquí salen los tres métodos calculados para tu sitio y tu hora.")
    );
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
        ? `El sol está a ${shadow.sunAzimuth.toFixed(0)}° (${compassPoint(shadow.sunAzimuth)}), ${shadow.sunAltitude.toFixed(0)}° sobre el horizonte. Clava algo vertical: su sombra apunta a ${shadow.shadowPointsTo.toFixed(0)}° (${compassPoint(shadow.shadowPointsTo)}).`
        : "El sol está demasiado bajo ahora mismo: la sombra se alarga y la dirección deja de ser fiable. Espera a que suba más de 5°.",
      stickAndShadow()
    ),
    methodCard(
      "Método del reloj",
      watch.usable
        ? `Pon el reloj plano y la aguja horaria apuntando al sol. La bisectriz entre esa aguja y las 12 marca el ${watch.bisectorCardinal === "S" ? "sur" : "norte"}. Ojo: usa la hora solar, no la del móvil — en España el reloj va muy por delante del sol y es donde falla la versión clásica del truco.`
        : "El sol está demasiado bajo para este método ahora mismo.",
      watchDial(watch.bisectorCardinal)
    ),
    methodCard(
      "La Polar",
      polaris.visible
        ? `${polaris.pointerInstruction} Comprobación: la Polar debe quedar a unos ${polaris.expectedAltitude.toFixed(0)}° sobre el horizonte, que es tu latitud. Si no cuadra, no es esa estrella.`
        : "Desde el hemisferio sur la Polar no se ve. Usa la Cruz del Sur.",
      polaris.visible ? polarisFinder() : null
    )
  );
}

function methodCard(title, body, diagram) {
  const card = document.createElement("div");
  card.className = "card";
  const h = document.createElement("h3");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = body;
  card.append(h, p);
  if (diagram) card.append(diagram);
  return card;
}

const compassMount = document.getElementById("compass-mount");
const compassWidget = buildCompass();
compassMount.append(compassWidget.svg);

let lastHeading = null;

// Redraw the rose whenever either input moves: the device heading, or the
// sun's bearing as the day goes on.
function refreshCompass() {
  const position = currentPosition();
  const sunAzimuth = position
    ? shadowMethod(new Date(), position.lat, position.lon)
    : null;
  const azimuth = sunAzimuth?.usable ? sunAzimuth.sunAzimuth : null;
  compassWidget.update({ heading: lastHeading, sunAzimuth: azimuth });

  if (lastHeading == null) return;

  const check = crossCheck(lastHeading, azimuth);
  const bearing = `${lastHeading.toFixed(0)}° (${compassPoint(lastHeading)})`;
  if (!check.comparable) {
    compassReading.textContent = `Miras hacia ${bearing} respecto al norte geográfico. Sin sol sobre el horizonte no hay con qué contrastarlo.`;
    return;
  }
  compassReading.textContent = check.trustworthy
    ? `Miras hacia ${bearing}. Coincide con la posición del sol (${check.delta.toFixed(0)}° de diferencia), así que la lectura es buena.`
    : `Miras hacia ${bearing}, pero eso discrepa ${check.delta.toFixed(0)}° de donde está el sol. Fíate del sol: algo cerca está perturbando el magnetómetro.`;
}

refreshCompass();

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
  lastHeading = magneticToTrue(magnetic, region.magneticDeclination.approxDegrees);
  refreshCompass();
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

document.getElementById("cloud-chart").append(buildCloudChart(CLOUDS));

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

  // When nothing is done yet, the header line above already says so — a badge
  // on all ten entries is noise. Only mark entries that differ from that.
  const pending = missingParts(knot);
  if (pending.length > 0 && pending.length < 3) {
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

// ---- Nature ----

document.getElementById("nature-disclaimer").textContent = NATURE_DISCLAIMER;

function natureCard(entry) {
  const card = document.createElement("div");
  card.className = "card";
  if (entry.emergency) card.classList.add("warn");

  const head = document.createElement("div");
  head.className = "cloud-head";
  const name = document.createElement("h4");
  name.textContent = entry.name;
  head.append(name);
  if (entry.emergency) {
    const badge = document.createElement("span");
    badge.className = "badge danger";
    badge.textContent = "Urgencia";
    head.append(badge);
  }
  card.append(head);

  if (entry.aka.length > 0) {
    card.append(para(`También: ${entry.aka.join(", ")}`, "hint"));
  }

  card.append(labelled("Dónde", entry.where), labelled("Cómo es", entry.recognise));

  // The diagram sits with the description it illustrates, not at the top:
  // it is a companion to the prose, not a thing to identify from.
  const diagram = diagramFor(entry.id);
  if (diagram) card.append(diagram);

  card.append(labelled("Qué implica", entry.risk));

  if (entry.identificationNote) {
    const note = para(entry.identificationNote, "notice");
    card.append(note);
  }

  card.append(section("Qué hacer", entry.actions, "ol", "actions-list"));
  if (entry.never.length > 0) {
    card.append(section("Nunca", entry.never, "ul", "never-list"));
  }

  const sources = document.createElement("p");
  sources.className = "hint";
  sources.append("Fuente: ");
  entry.sources.forEach((source, index) => {
    if (index > 0) sources.append(" · ");
    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = source.label;
    link.rel = "noopener noreferrer";
    sources.append(link);
  });
  card.append(sources);

  return card;
}

function para(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  return p;
}

function labelled(term, text) {
  const wrapper = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = `${term}. `;
  wrapper.append(strong, text);
  return wrapper;
}

function section(title, items, listTag, className) {
  const wrapper = document.createElement("div");
  wrapper.className = className;
  const heading = document.createElement("p");
  heading.className = "section-label";
  heading.textContent = title;
  const list = document.createElement(listTag);
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  }
  wrapper.append(heading, list);
  return wrapper;
}

const natureList = document.getElementById("nature-list");
natureList.replaceChildren();
for (const group of natureByCategory()) {
  if (group.entries.length === 0) continue;
  const heading = document.createElement("h4");
  heading.className = "group-heading";
  heading.textContent = group.label;
  natureList.append(heading, ...group.entries.map(natureCard));
}

document.getElementById("nature-sources").replaceChildren(
  ...natureSources().map((source) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = source.label;
    link.rel = "noopener noreferrer";
    li.append(link);
    return li;
  })
);

// ---- Coordinates ----

const coordsResult = document.getElementById("coords-result");

function openCoords() {
  renderCoordsPosition();
  if (currentPosition()) return renderCoords();

  coordsResult.replaceChildren(notice("Buscando tu posición…"));
  requestPosition({
    onDone: (ok) => {
      renderCoordsPosition();
      if (ok) return renderCoords();
      coordsResult.replaceChildren(
        notice("Sin posición. Métela en Sol y luna o toca «Usar mi posición».")
      );
    },
  });
}

function renderCoordsPosition() {
  positionBar(document.getElementById("coords-position"), () => {
    renderCoordsPosition();
    renderCoords();
  });
}

function renderCoords() {
  const position = currentPosition();
  coordsResult.replaceChildren();
  if (!position) return;

  const mgrs = toMGRS(position.lat, position.lon);
  if (mgrs) {
    const explainer = document.createElement("div");
    explainer.className = "card";
    const heading = document.createElement("h4");
    heading.textContent = "Cómo se lee una referencia";
    explainer.append(heading, mgrsAnatomy(mgrs));
    coordsResult.append(explainer);
  }

  const formats = allFormats(position.lat, position.lon);
  for (const key of ["decimal", "ddm", "dms", "utm", "mgrs"]) {
    const format = formats[key];
    if (!format) continue;

    const card = document.createElement("div");
    card.className = "card";

    const heading = document.createElement("h4");
    heading.textContent = format.label;

    const value = document.createElement("p");
    value.className = "coord-value";
    value.textContent = format.value;

    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = format.note;

    card.append(heading, value, note);
    coordsResult.append(card);
  }
}

// One position control, rendered wherever a panel needs it.
//
// It carries manual entry as well as geolocation. Offering only "use my
// location" left a dead end whenever the GPS was refused, unavailable or
// simply indoors — the coordinates panel had no way at all to get a position
// into it, which defeated the point of the panel.
function positionBar(bar, onUpdate) {
  const position = currentPosition();
  bar.replaceChildren();
  bar.classList.toggle("stacked", true);

  const top = document.createElement("div");
  top.className = "position-row";

  const label = document.createElement("span");
  label.textContent = position
    ? `Posición: ${position.lat.toFixed(4)}, ${position.lon.toFixed(4)}`
    : "Sin posición";
  if (!position) label.className = "muted";

  const locate = document.createElement("button");
  locate.type = "button";
  locate.className = "link";
  locate.textContent = position ? "actualizar" : "Usar mi posición";
  locate.addEventListener("click", () => {
    locate.textContent = "buscando…";
    requestPosition({
      onDone: (ok) => {
        if (!ok) locate.textContent = "no disponible — métela a mano";
        onUpdate();
      },
    });
  });

  top.append(label, locate);

  const manual = document.createElement("div");
  manual.className = "position-manual";

  const latField = coordinateField("Lat", latInput.value, "-90 a 90");
  const lonField = coordinateField("Lon", lonInput.value, "-180 a 180");

  const apply = document.createElement("button");
  apply.type = "button";
  apply.textContent = "Aplicar";
  apply.addEventListener("click", () => {
    const lat = parseLatitude(latField.input.value);
    const lon = parseLongitude(lonField.input.value);
    if (lat == null || lon == null) {
      label.textContent = "Revisa los valores: latitud -90 a 90, longitud -180 a 180.";
      label.className = "muted";
      return;
    }
    latInput.value = lat;
    lonInput.value = lon;
    onUpdate();
  });

  manual.append(latField.wrapper, lonField.wrapper, apply);
  bar.append(top, manual);
}

function coordinateField(labelText, value, placeholder) {
  const wrapper = document.createElement("label");
  wrapper.className = "position-field";

  const text = document.createElement("span");
  text.textContent = labelText;

  const input = document.createElement("input");
  input.type = "number";
  input.step = "any";
  input.value = value;
  input.placeholder = placeholder;

  wrapper.append(text, input);
  return { wrapper, input };
}

// ---- Pace ----

const paceForm = document.getElementById("pace-form");
const paceSelect = document.getElementById("pace-factor");
const paceResult = document.getElementById("pace-result");

for (const option of PACE_FACTORS) {
  const node = document.createElement("option");
  node.value = String(option.factor);
  node.textContent = option.label;
  if (option.id === "normal") node.selected = true;
  paceSelect.append(node);
}

paceForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const distanceKm = Number(document.getElementById("dist").value);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    paceResult.replaceChildren(notice("Introduce una distancia mayor que cero."));
    return;
  }

  const minutes = estimateMinutes({
    distanceKm,
    ascentMetres: Number(document.getElementById("ascent").value) || 0,
    descentMetres: Number(document.getElementById("descent").value) || 0,
    factor: Number(paceSelect.value),
  });

  paceResult.replaceChildren();

  const summary = document.createElement("dl");
  summary.className = "summary";
  addPair(summary, "Tiempo estimado", formatMinutes(minutes));
  paceResult.append(summary);

  const factor = Number(paceSelect.value);
  const ascent = Number(document.getElementById("ascent").value) || 0;
  const descent = Number(document.getElementById("descent").value) || 0;
  const breakdown = buildBreakdown({
    flatMinutes: distanceKm * 12 * factor,
    climbMinutes: (ascent / 100) * 10 * factor,
    descentMinutes: Math.max(0, descentAdjustmentMinutes(descent, distanceKm) * factor),
  });
  if (breakdown) {
    const card = document.createElement("div");
    card.className = "card";
    const heading = document.createElement("h4");
    heading.textContent = "En qué se va el tiempo";
    card.append(heading, breakdown);
    paceResult.append(card);
  }

  const position = currentPosition();
  if (!position) {
    paceResult.append(
      notice("Con una posición puesta, además te digo si llegas antes de que anochezca.")
    );
    return;
  }

  const light = daylightCheck({
    start: new Date(),
    minutes,
    latitude: position.lat,
    longitude: position.lon,
  });

  const card = document.createElement("div");
  card.className = light.verdict === "dark" ? "card warn" : "card";

  const heading = document.createElement("h4");
  heading.textContent = `Llegada estimada: ${formatTime(light.arrival)}`;
  card.append(heading);

  if (light.sunset) {
    card.append(
      buildPaceChart({
        start: new Date(),
        arrival: light.arrival,
        sunset: light.sunset,
        civilDusk: light.civilDusk,
      })
    );
  }

  if (light.verdict) {
    const verdicts = {
      comfortable: `Con luz de sobra: el ocaso es a las ${formatTime(light.sunset)}.`,
      tight: `Justo. El sol se pone a las ${formatTime(light.sunset)} y a las ${formatTime(light.civilDusk)} ya necesitas frontal. Sales con ${Math.round(light.marginToDusk)} min de margen.`,
      dark: `Llegas de noche. A las ${formatTime(light.civilDusk)} se acaba la luz útil, ${Math.round(-light.marginToDusk)} min antes de tu llegada. Lleva frontal o recorta.`,
    };
    const p = document.createElement("p");
    p.textContent = verdicts[light.verdict];
    card.append(p);
  }

  paceResult.append(card);
});

// ---- Storm distance ----

const thunderGap = document.getElementById("thunder-gap");
const stormOutput = document.getElementById("storm-distance");

thunderGap.addEventListener("input", () => {
  const raw = thunderGap.value.trim();
  if (raw === "") {
    stormOutput.textContent = "—";
    stormOutput.className = "reading";
    return;
  }

  const km = stormDistanceKm(Number(raw));
  if (km == null) {
    stormOutput.textContent = "—";
    stormOutput.className = "reading";
    return;
  }

  const verdict = stormVerdict(km);
  stormOutput.textContent = verdict.text;
  stormOutput.className = `reading ${verdict.level}`;

  stormScaleMount.replaceChildren(stormScale(km));
});

const stormScaleMount = document.getElementById("storm-scale");

renderSaved();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Offline caching is a bonus; the app works without it.
  });

  // When a new worker takes over, this page is still running the HTML it
  // loaded from the previous version while any further fetch would come from
  // the new one. Reloading once puts the document and its modules back on the
  // same version — without it, a deploy can leave a running tab with a script
  // that throws partway through and panels that never finish building.
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });
}
