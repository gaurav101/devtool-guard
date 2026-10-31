# devtool-guard

A zero-dependency browser utility that offers best-effort DevTools detection and
optional deterrence. It is not a security boundary: users can bypass client-side
checks, and browser behavior varies.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module responsibilities and
guidance on extending the library.

## Install

```sh
npm install devtool-guard
```

## Usage

```ts
import { guardDevTools } from "devtool-guard";

const guard = guardDevTools({
  onDetect: () => console.warn("Developer tools may be open"),
  onClose: () => console.info("Developer tools may be closed"),
});

// Stop polling and remove installed event listeners when the page/component exits.
guard.stop();
```

`guardDevTools` returns a controller with `stop()` and `isOpen()`. In a
non-browser environment it returns an inert controller. By default, detection
uses the gap between the outer and inner window dimensions and polls once per
second. Detection can be inaccurate due to browser chrome, zoom, and window
layout.

Keyboard shortcuts and the context menu are blocked by default. Set
`blockShortcuts` or `blockContextMenu` to `false` to disable those listeners;
they cannot prevent all browser or operating-system developer-tool access.

`detectConsole` enables a console probe for undocked DevTools. It is disabled by
default because it writes to the console each time it runs. `useDebugger`
enables a timing check that may pause execution when DevTools is attached.

The optional `action` is `"none"` (default), `"blank"`, or `"redirect"`.
`"blank"` clears the document; `"redirect"` navigates to `redirectUrl` (default
`about:blank`). Both actions are disruptive and should be chosen deliberately.

## Preventing a flash before JavaScript runs

If the page should start hidden until the application is ready, add this to the
HTML `<head>` and call `reveal()` after startup:

```html
<style>
  html { visibility: hidden; }
</style>
```

```ts
import { reveal } from "devtool-guard";

reveal();
```

This only controls initial visibility when JavaScript runs; it does not prevent
access to page data or guarantee that the page remains hidden.

## Build

```sh
npm install
npm run build
```

## Tests and coverage

```sh
npm test
npm run test:coverage
```

The coverage command enforces at least 95% line, branch, and function coverage
for the compiled library code. It uses the Node.js test runner and coverage
support available in Node.js 24.
