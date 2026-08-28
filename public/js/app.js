import { sunReport, formatTime, formatDuration } from "./modules/sunMoon.js";
import { listLocations, saveLocation, deleteLocation } from "./store.js";

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
  tile.addEventListener("click", () => showTool(tile.dataset.tool));
}
backBtn.addEventListener("click", showHome);

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

renderSaved();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Offline caching is a bonus; the app works without it.
  });
}
