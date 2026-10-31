import type { ResolvedGuardOptions } from "./types.js";

function checkWindowSize(threshold: number): boolean {
  return (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  );
}

function checkConsole(): boolean {
  let open = false;
  const probe = new Error();
  Object.defineProperty(probe, "stack", {
    get() {
      open = true;
      return "";
    },
  });
  console.debug(probe);
  return open;
}

function checkDebuggerTiming(): boolean {
  const start = performance.now();
  debugger;
  return performance.now() - start > 100;
}

export function detectDevTools(options: ResolvedGuardOptions): boolean {
  return (
    checkWindowSize(options.sizeThreshold) ||
    (options.detectConsole && checkConsole()) ||
    (options.useDebugger && checkDebuggerTiming())
  );
}
