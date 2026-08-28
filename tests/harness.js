// Runs in both the browser (tests/index.html) and Node (npm test).
// Nothing here touches the DOM unless a render element is handed in.

const tests = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export function assert(cond, message) {
  if (!cond) throw new Error(message || "assertion failed");
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || "not equal"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export function assertClose(actual, expected, tolerance, message) {
  if (!Number.isFinite(actual)) {
    throw new Error(`${message || "not close"}: got non-finite ${actual}`);
  }
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message || "not close"}: expected ${expected} ±${tolerance}, got ${actual}`
    );
  }
}

export function assertOrdered(values, message) {
  for (let i = 1; i < values.length; i++) {
    const [prevName, prev] = values[i - 1];
    const [name, current] = values[i];
    if (!(prev <= current)) {
      throw new Error(
        `${message || "out of order"}: ${prevName} (${prev.toISOString?.() ?? prev}) should precede ${name} (${current.toISOString?.() ?? current})`
      );
    }
  }
}

export async function runAll(renderEl) {
  const results = [];
  for (const { name, fn } of tests) {
    try {
      await fn();
      results.push({ name, pass: true });
    } catch (err) {
      results.push({ name, pass: false, error: err.message || String(err) });
    }
  }

  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.length - passCount;

  if (renderEl) {
    renderEl.innerHTML = `
      <p><strong>${passCount} pasaron, ${failCount} fallaron</strong> (${results.length} total)</p>
      <ul>
        ${results
          .map(
            (r) =>
              `<li style="color:${r.pass ? "#34d399" : "#f87171"}">${r.pass ? "✓" : "✗"} ${escapeHtml(r.name)}${
                r.error ? ` — ${escapeHtml(r.error)}` : ""
              }</li>`
          )
          .join("")}
      </ul>
    `;
  }

  console.log(`${passCount}/${results.length} tests passed`);
  for (const r of results.filter((r) => !r.pass)) {
    console.error(`FAIL: ${r.name} — ${r.error}`);
  }

  return { passCount, failCount, results };
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
