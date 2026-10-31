import assert from "node:assert/strict";
import test from "node:test";
import { detectDevTools } from "../dist/lib/detector.js";
import { resolveOptions } from "../dist/lib/options.js";
import { installBrowser } from "./helpers.js";

test("detects window dimension changes and honors the threshold", (t) => {
  const { window } = installBrowser(t);
  const options = resolveOptions({});

  assert.equal(detectDevTools(options), false);
  window.outerWidth = 1160;
  assert.equal(detectDevTools(options), false);
  window.outerWidth = 1161;
  assert.equal(detectDevTools(options), true);
  window.outerWidth = 1000;
  window.outerHeight = 961;
  assert.equal(detectDevTools(options), true);
});

test("console probe is opt-in and reports whether the stack is inspected", (t) => {
  installBrowser(t);
  const originalDebug = console.debug;
  let probeCount = 0;
  console.debug = (probe) => {
    probeCount++;
    void probe.stack;
  };
  t.after(() => {
    console.debug = originalDebug;
  });

  assert.equal(detectDevTools(resolveOptions({})), false);
  assert.equal(probeCount, 0);
  assert.equal(detectDevTools(resolveOptions({ detectConsole: true })), true);
  assert.equal(probeCount, 1);
});

test("debugger timing check detects a pause longer than the threshold", (t) => {
  installBrowser(t);
  const originalNow = performance.now;
  const clockValues = [0, 0, 0, 101, 0, 100];
  performance.now = () => clockValues.shift();
  t.after(() => {
    performance.now = originalNow;
  });

  const options = resolveOptions({ useDebugger: true });
  assert.equal(detectDevTools(options), false);
  assert.equal(detectDevTools(options), true);
  assert.equal(detectDevTools(options), false);
});

test("does not use later detector strategies once an earlier one detects", (t) => {
  const { window } = installBrowser(t, {
    outerWidth: 1200,
  });
  const originalDebug = console.debug;
  console.debug = () => {
    throw new Error("console probe should not run");
  };
  t.after(() => {
    console.debug = originalDebug;
  });

  assert.equal(detectDevTools(resolveOptions({ detectConsole: true, useDebugger: true })), true);
  window.outerWidth = 1000;
});

test("console probe can report closed when the stack is not inspected", (t) => {
  installBrowser(t);
  const originalDebug = console.debug;
  console.debug = () => {};
  t.after(() => {
    console.debug = originalDebug;
  });

  assert.equal(detectDevTools(resolveOptions({ detectConsole: true })), false);
});
