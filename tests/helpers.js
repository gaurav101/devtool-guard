export function installBrowser(t, overrides = {}) {
  const listeners = new Map();
  const state = {
    outerWidth: 1000,
    innerWidth: 1000,
    outerHeight: 800,
    innerHeight: 800,
    location: { replace: (url) => { state.redirectedTo = url; } },
    redirectedTo: undefined,
    addEventListener(type, callback, capture) {
      listeners.set(type, { callback, capture });
    },
    removeEventListener(type, callback, capture) {
      const current = listeners.get(type);
      if (current?.callback === callback && current.capture === capture) {
        listeners.delete(type);
      }
    },
    setInterval(callback, interval) {
      state.intervalCallback = callback;
      state.interval = interval;
      return 42;
    },
    clearInterval(id) {
      state.clearedTimer = id;
    },
    ...overrides,
  };
  const documentStub = {
    documentElement: { innerHTML: "app", style: {} },
  };
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: state,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });

  t.after(() => {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      delete globalThis.window;
    }
    if (previousDocument) {
      Object.defineProperty(globalThis, "document", previousDocument);
    } else {
      delete globalThis.document;
    }
  });

  return { window: state, document: documentStub, listeners };
}

export function keyboardEvent({
  key,
  ctrlKey = false,
  metaKey = false,
  shiftKey = false,
  altKey = false,
} = {}) {
  return {
    key,
    ctrlKey,
    metaKey,
    shiftKey,
    altKey,
    prevented: false,
    stopped: false,
    preventDefault() {
      this.prevented = true;
    },
    stopPropagation() {
      this.stopped = true;
    },
  };
}
