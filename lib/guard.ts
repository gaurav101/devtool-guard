import { installBrowserControls } from "./browser-controls.js";
import { isBrowser } from "./browser.js";
import { detectDevTools } from "./detector.js";
import { resolveOptions } from "./options.js";
import type { GuardController, GuardOptions } from "./types.js";

/**
 * Best-effort browser DevTools detection; this cannot prevent access or replace
 * server-side security controls.
 */
export function guardDevTools(options: GuardOptions = {}): GuardController {
  const config = resolveOptions(options);
  if (!isBrowser()) return { stop() {}, isOpen: () => false };

  let open = false;
  let stopped = false;
  let timer: number | undefined;
  let removeControls = () => {};

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (timer !== undefined) window.clearInterval(timer);
    removeControls();
  };

  const reactToDetection = () => {
    config.onDetect?.();
    if (config.action === "blank") document.documentElement.innerHTML = "";
    else if (config.action === "redirect") {
      window.location.replace(config.redirectUrl);
    }
  };

  const check = () => {
    if (stopped) return;
    try {
      const detected = detectDevTools(config);
      if (detected && !open) {
        open = true;
        reactToDetection();
      } else if (!detected && open) {
        open = false;
        config.onClose?.();
      }
    } catch (error) {
      stop();
      throw error;
    }
  };

  try {
    removeControls = installBrowserControls(config);
    timer = window.setInterval(check, config.interval);
    check();
  } catch (error) {
    stop();
    throw error;
  }

  return { isOpen: () => open, stop };
}
