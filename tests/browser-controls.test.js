import assert from "node:assert/strict";
import test from "node:test";
import { installBrowserControls } from "../dist/lib/browser-controls.js";
import { installBrowser, keyboardEvent } from "./helpers.js";

test("blocks supported developer-tools and view-source shortcuts", (t) => {
  const { listeners } = installBrowser(t);
  const remove = installBrowserControls({ blockShortcuts: true, blockContextMenu: true });
  const handler = listeners.get("keydown").callback;

  for (const shortcut of [
    { key: "F12" },
    { key: "i", ctrlKey: true, shiftKey: true },
    { key: "J", metaKey: true, shiftKey: true },
    { key: "c", ctrlKey: true, shiftKey: true },
    { key: "p", metaKey: true, shiftKey: true },
    { key: "u", ctrlKey: true },
    { key: "i", metaKey: true, altKey: true },
    { key: "u", metaKey: true, altKey: true },
  ]) {
    const event = keyboardEvent(shortcut);
    handler(event);
    assert.equal(event.prevented, true, JSON.stringify(shortcut));
    assert.equal(event.stopped, true, JSON.stringify(shortcut));
  }

  for (const normalKey of [
    { key: "i" },
    { key: "u", shiftKey: true },
    { key: "i", metaKey: true },
    { key: "u", altKey: true },
  ]) {
    const event = keyboardEvent(normalKey);
    handler(event);
    assert.equal(event.prevented, false, JSON.stringify(normalKey));
  }

  const menuEvent = { prevented: false, preventDefault() { this.prevented = true; } };
  listeners.get("contextmenu").callback(menuEvent);
  assert.equal(menuEvent.prevented, true);
  remove();
  assert.equal(listeners.size, 0);
});

test("can disable either control and removal is idempotent", (t) => {
  const { listeners } = installBrowser(t);
  const removeContextOnly = installBrowserControls({
    blockShortcuts: false,
    blockContextMenu: true,
  });
  assert.deepEqual([...listeners.keys()], ["contextmenu"]);
  removeContextOnly();
  removeContextOnly();
  assert.equal(listeners.size, 0);

  const removeNone = installBrowserControls({
    blockShortcuts: false,
    blockContextMenu: false,
  });
  assert.equal(listeners.size, 0);
  removeNone();
});

test("cleans up partially installed controls when listener registration fails", (t) => {
  const removed = [];
  installBrowser(t, {
    addEventListener(type) {
      if (type === "contextmenu") throw new Error("registration failed");
    },
    removeEventListener(type) {
      removed.push(type);
    },
  });

  assert.throws(
    () => installBrowserControls({ blockShortcuts: true, blockContextMenu: true }),
    /registration failed/,
  );
  assert.deepEqual(removed, ["keydown", "contextmenu"]);
});
