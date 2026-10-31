import assert from "node:assert/strict";
import test from "node:test";
import { isBrowser, reveal } from "../dist/lib/browser.js";
import { installBrowser } from "./helpers.js";

test("detects browser globals and reveals the document", (t) => {
  const { document } = installBrowser(t);
  assert.equal(isBrowser(), true);
  reveal();
  assert.equal(document.documentElement.style.visibility, "visible");
});

test("does not touch the document outside a browser", (t) => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  delete globalThis.window;
  delete globalThis.document;
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
  });

  assert.equal(isBrowser(), false);
  assert.doesNotThrow(reveal);
});
