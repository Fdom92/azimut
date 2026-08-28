// Saved locations. IndexedDB when available, localStorage otherwise, and a
// plain in-memory map when neither is (private windows, embedded viewers).

const DB_NAME = "azimut";
const DB_VERSION = 1;
const STORE = "locations";
const LS_KEY = "azimut.locations";

let memoryFallback = null;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no indexedDB"));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listLocations() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return readFallback();
  }
}

export async function saveLocation(location) {
  const record = { id: location.id || crypto.randomUUID(), ...location };
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const all = readFallback().filter((l) => l.id !== record.id);
    writeFallback([...all, record]);
  }
  return record;
}

export async function deleteLocation(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    writeFallback(readFallback().filter((l) => l.id !== id));
  }
}

function readFallback() {
  if (memoryFallback) return memoryFallback;
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    memoryFallback = memoryFallback || [];
    return memoryFallback;
  }
}

function writeFallback(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    memoryFallback = list;
  }
}
