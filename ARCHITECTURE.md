# Project Architecture

## Purpose and boundaries

`devtool-guard` is a small, zero-runtime-dependency browser library for
best-effort DevTools detection and optional deterrence. It is not a security
boundary. Detection can be inaccurate, browser controls can be bypassed, and
sensitive data must be protected by server-side controls.

The package exposes a small public API and keeps implementation details inside
`lib/`. Keep browser-specific behavior guarded so importing the package in
Node.js or another non-browser environment remains safe.

## Source layout

| Path | Responsibility |
| --- | --- |
| `index.ts` | Public package entry point. Re-exports supported functions and public types only. |
| `lib/types.ts` | Public option/controller types and internal resolved-options type. |
| `lib/options.ts` | Validates caller input and supplies defaults before browser work begins. |
| `lib/detector.ts` | Combines detection strategies into a boolean result. |
| `lib/browser-controls.ts` | Installs optional keyboard/context-menu listeners and returns their cleanup function. |
| `lib/browser.ts` | Browser-environment detection and the public `reveal()` helper. |
| `lib/guard.ts` | Coordinates setup, polling, state transitions, callbacks, actions, and teardown. |
| `tests/` | Node.js unit tests using browser and timer stubs. |
| `dist/` | Generated JavaScript and declarations; produced by the build and excluded from version control. |

## Runtime flow

1. `guardDevTools()` normalizes and validates options.
2. In a non-browser environment it returns an inert controller without touching
   browser globals.
3. In a browser it installs configured controls, schedules polling, and performs
   an initial detection check.
4. The detector checks window dimensions first, then optional console and
   debugger probes. A positive result transitions the controller to open and
   fires `onDetect` and the configured action once per transition. A negative
   result after an open state transitions to closed and fires `onClose`.
5. `stop()` is idempotent and clears the polling timer and event listeners.
   Errors during setup or callbacks are surfaced after cleanup.

## Adding functionality

Before adding an option or behavior, decide whether it belongs in the public API
or should remain an implementation detail. Prefer a small change in the module
that owns the behavior over adding unrelated responsibilities to `guard.ts`.

### Add a detection strategy

1. Implement the check in `lib/detector.ts` or a focused detector module if the
   strategy grows independently.
2. Add a validated, documented opt-in option in `lib/types.ts` and
   `lib/options.ts`, if the strategy is configurable.
3. Integrate the strategy into `detectDevTools()` while preserving short-circuit
   behavior and the existing default detection cost.
4. Add unit tests for positive and negative detection, option defaults, and any
   boundaries or errors. Use deterministic stubs rather than real browser
   timing.

### Add a browser control or lifecycle behavior

1. Put event-listener registration and its idempotent cleanup in
   `lib/browser-controls.ts` (or a new focused module if the behavior is
   substantially different).
2. Let `lib/guard.ts` coordinate setup and teardown; do not make a control module
   own polling or detection state.
3. Test enabled and disabled behavior, cleanup after normal stop, and cleanup
   when partial setup or callbacks fail.

### Add a public option or action

1. Add the option to `GuardOptions` in `lib/types.ts` with a clear description
   and default.
2. Validate its type and constraints in `lib/options.ts`, then resolve it into
   `ResolvedGuardOptions`.
3. Implement its behavior in the owning module and connect it through
   `lib/guard.ts` only when orchestration is required.
4. Export new public symbols through `index.ts`; avoid exporting internal helpers.
5. Document usage, default behavior, browser limitations, and any disruptive
   effects in `README.md`.
6. Add tests for default, configured, invalid, cleanup, and non-browser behavior
   where applicable.

## Design and compatibility guidelines

- Keep imports safe in server-side JavaScript: do not access `window`,
  `document`, or browser-only APIs at module initialization.
- Normalize options once, before installing timers or listeners.
- Make optional or potentially disruptive behavior opt-in unless compatibility
  and existing API semantics clearly require otherwise.
- Keep cleanup idempotent and ensure errors are surfaced rather than silently
  converted to success.
- Preserve the public API through `index.ts`; avoid exposing implementation
  modules as package entry points without an explicit compatibility decision.
- Detection and prevention are best-effort only; never describe this package as
  a security mechanism.

## Build, tests, and coverage

```sh
npm run build
npm test
npm run test:coverage
```

Tests run against compiled output using the Node.js test runner and deterministic
browser stubs. The coverage script enforces at least 95% line, branch, and
function coverage for compiled library code. Add tests with each behavior
change; do not lower or exclude coverage thresholds merely to make a change pass.
