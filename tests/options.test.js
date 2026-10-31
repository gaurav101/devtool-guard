import assert from "node:assert/strict";
import test from "node:test";
import { resolveOptions } from "../dist/lib/options.js";

test("resolves defaults and preserves supplied options", () => {
  assert.deepEqual(resolveOptions({}), {
    action: "none",
    redirectUrl: "about:blank",
    blockShortcuts: true,
    blockContextMenu: true,
    detectConsole: false,
    useDebugger: false,
    sizeThreshold: 160,
    interval: 1000,
    onDetect: undefined,
    onClose: undefined,
  });

  const onDetect = () => {};
  const onClose = () => {};
  assert.deepEqual(resolveOptions({
    action: "redirect",
    redirectUrl: "/safe",
    blockShortcuts: false,
    blockContextMenu: false,
    detectConsole: true,
    useDebugger: true,
    sizeThreshold: 0,
    interval: 10,
    onDetect,
    onClose,
  }), {
    action: "redirect",
    redirectUrl: "/safe",
    blockShortcuts: false,
    blockContextMenu: false,
    detectConsole: true,
    useDebugger: true,
    sizeThreshold: 0,
    interval: 10,
    onDetect,
    onClose,
  });
});

test("validates the options object and action", () => {
  assert.throws(() => resolveOptions(null), TypeError);
  assert.throws(() => resolveOptions("invalid"), TypeError);
  assert.throws(() => resolveOptions({ action: "close" }), /action must be/);
});

test("validates numeric values", () => {
  assert.throws(() => resolveOptions({ sizeThreshold: Number.NaN }), RangeError);
  assert.throws(() => resolveOptions({ sizeThreshold: -1 }), RangeError);
  assert.throws(() => resolveOptions({ interval: 0 }), RangeError);
  assert.throws(() => resolveOptions({ interval: Number.POSITIVE_INFINITY }), RangeError);
});

test("validates redirect URLs", () => {
  assert.throws(() => resolveOptions({ redirectUrl: 1 }), /redirectUrl must be a string/);
  assert.throws(
    () => resolveOptions({ action: "redirect", redirectUrl: "  " }),
    /redirectUrl must be a non-empty string/,
  );
  assert.equal(resolveOptions({ action: "redirect" }).redirectUrl, "about:blank");
  assert.equal(resolveOptions({ redirectUrl: " " }).redirectUrl, " ");
});

test("validates boolean options and callbacks", () => {
  for (const name of ["blockShortcuts", "blockContextMenu", "detectConsole", "useDebugger"]) {
    assert.throws(() => resolveOptions({ [name]: "yes" }), new RegExp(`${name} must be a boolean`));
  }
  assert.throws(() => resolveOptions({ onDetect: true }), /onDetect must be a function/);
  assert.throws(() => resolveOptions({ onClose: true }), /onClose must be a function/);
});
