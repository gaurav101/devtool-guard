import assert from "node:assert/strict";
import test from "node:test";
import { guardDevTools } from "../dist/index.js";
import { installBrowser, keyboardEvent } from "./helpers.js";

test("returns an inert controller outside a browser", (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  delete globalThis.window;
  delete globalThis.document;
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  });

  const guard = guardDevTools();
  assert.equal(guard.isOpen(), false);
  assert.doesNotThrow(() => guard.stop());
});

test("polls for changes, fires transition callbacks once, and stops cleanly", (t) => {
  const { window, listeners } = installBrowser(t);
  let detections = 0;
  let closures = 0;
  const guard = guardDevTools({
    interval: 25,
    onDetect: () => detections++,
    onClose: () => closures++,
  });

  assert.equal(window.interval, 25);
  assert.equal(guard.isOpen(), false);
  window.outerWidth = 1300;
  window.intervalCallback();
  window.intervalCallback();
  assert.equal(guard.isOpen(), true);
  assert.equal(detections, 1);

  window.outerWidth = 1000;
  window.intervalCallback();
  window.intervalCallback();
  assert.equal(guard.isOpen(), false);
  assert.equal(closures, 1);

  const event = keyboardEvent({ key: "F12" });
  listeners.get("keydown").callback(event);
  assert.equal(event.prevented, true);
  guard.stop();
  guard.stop();
  assert.equal(window.clearedTimer, 42);
  assert.equal(listeners.size, 0);
  window.outerWidth = 1300;
  window.intervalCallback();
  assert.equal(detections, 1);
});

test("applies blank and redirect actions after detection", (t) => {
  const blank = installBrowser(t, { outerWidth: 1300 });
  const blankGuard = guardDevTools({ action: "blank" });
  assert.equal(blank.document.documentElement.innerHTML, "");
  blankGuard.stop();

  const redirect = installBrowser(t, { outerWidth: 1300 });
  const redirectGuard = guardDevTools({
    action: "redirect",
    redirectUrl: "/notice",
  });
  assert.equal(redirect.window.redirectedTo, "/notice");
  redirectGuard.stop();
});

test("cleans up if a detection callback throws", (t) => {
  const { window, listeners } = installBrowser(t, { outerWidth: 1300 });
  assert.throws(
    () => guardDevTools({ onDetect() { throw new Error("callback failure"); } }),
    /callback failure/,
  );
  assert.equal(window.clearedTimer, 42);
  assert.equal(listeners.size, 0);
});

test("cleans up and reports detector errors from polling", (t) => {
  const { window, listeners } = installBrowser(t);
  const originalDebug = console.debug;
  let shouldThrow = false;
  console.debug = () => {
    if (shouldThrow) throw new Error("console unavailable");
  };
  t.after(() => {
    console.debug = originalDebug;
  });

  const guard = guardDevTools({ detectConsole: true });
  shouldThrow = true;
  assert.throws(() => window.intervalCallback(), /console unavailable/);
  assert.equal(window.clearedTimer, 42);
  assert.equal(listeners.size, 0);
  guard.stop();
});

test("cleans up controls if timer setup fails", (t) => {
  const { listeners } = installBrowser(t, {
    setInterval() {
      throw new Error("timer unavailable");
    },
  });
  assert.throws(() => guardDevTools(), /timer unavailable/);
  assert.equal(listeners.size, 0);
});

test("cleans up if the close callback throws", (t) => {
  const { window, listeners } = installBrowser(t, { outerWidth: 1300 });
  const guard = guardDevTools({
    onClose() {
      throw new Error("close callback failure");
    },
  });
  window.outerWidth = 1000;
  assert.throws(() => window.intervalCallback(), /close callback failure/);
  assert.equal(window.clearedTimer, 42);
  assert.equal(listeners.size, 0);
  guard.stop();
});
