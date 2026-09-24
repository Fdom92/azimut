// Screen Wake Lock, wrapped so callers can ask for it without branching on
// whether the platform has it.
//
// The distress strobe is why this exists. Without a lock the phone dims and
// locks after its usual timeout, the page goes hidden, and the signal stops —
// which is worse than never starting one, because by then you have stopped
// looking for another way to be seen.
//
// A refusal is ordinary rather than exceptional: battery saver declines these
// flatly, and the request only succeeds when the page is visible. So the API
// here returns a boolean the caller can put on screen, not an exception to
// swallow quietly.

// Two features want the screen awake — the distress signal and the compass —
// and they overlap. Holding one sentinel between them means walking out of the
// compass releases the lock an emergency signal is relying on, so callers name
// themselves and the lock survives while any of them still wants it.
const owners = new Set();

let sentinel = null;

export function wakeLockSupported() {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

export function wakeLockHeld() {
  return Boolean(sentinel) && !sentinel.released;
}

export async function requestWakeLock(owner) {
  owners.add(owner);
  if (!wakeLockSupported()) return false;
  if (wakeLockHeld()) return true;

  try {
    sentinel = await navigator.wakeLock.request("screen");
    // The platform drops the lock on its own when the page is hidden, and
    // does not hand it back. Forgetting this is how a second request later
    // looks held when it is not.
    sentinel.addEventListener("release", () => {
      sentinel = null;
    });
    return true;
  } catch {
    sentinel = null;
    return false;
  }
}

export async function releaseWakeLock(owner) {
  owners.delete(owner);
  if (owners.size > 0) return; // someone else still needs the screen on

  const held = sentinel;
  sentinel = null;
  try {
    await held?.release();
  } catch {
    // Already gone — the page was hidden, or the platform reclaimed it.
  }
}
