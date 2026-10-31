import type { GuardOptions, ResolvedGuardOptions } from "./types.js";

export function resolveOptions(options: GuardOptions): ResolvedGuardOptions {
  if (options === null || typeof options !== "object") {
    throw new TypeError("guardDevTools options must be an object");
  }
  if (
    options.action !== undefined &&
    !["none", "blank", "redirect"].includes(options.action)
  ) {
    throw new TypeError('action must be "none", "blank", or "redirect"');
  }
  if (
    options.sizeThreshold !== undefined &&
    (!Number.isFinite(options.sizeThreshold) || options.sizeThreshold < 0)
  ) {
    throw new RangeError("sizeThreshold must be a finite non-negative number");
  }
  if (
    options.interval !== undefined &&
    (!Number.isFinite(options.interval) || options.interval <= 0)
  ) {
    throw new RangeError("interval must be a finite positive number");
  }
  if (
    options.redirectUrl !== undefined &&
    typeof options.redirectUrl !== "string"
  ) {
    throw new TypeError("redirectUrl must be a string");
  }
  if (
    options.action === "redirect" &&
    options.redirectUrl !== undefined &&
    !options.redirectUrl.trim()
  ) {
    throw new TypeError("redirectUrl must be a non-empty string for redirect action");
  }
  for (const [name, value] of [
    ["blockShortcuts", options.blockShortcuts],
    ["blockContextMenu", options.blockContextMenu],
    ["detectConsole", options.detectConsole],
    ["useDebugger", options.useDebugger],
  ] as const) {
    if (value !== undefined && typeof value !== "boolean") {
      throw new TypeError(`${name} must be a boolean`);
    }
  }
  for (const [name, callback] of [
    ["onDetect", options.onDetect],
    ["onClose", options.onClose],
  ] as const) {
    if (callback !== undefined && typeof callback !== "function") {
      throw new TypeError(`${name} must be a function`);
    }
  }

  return {
    action: options.action ?? "none",
    redirectUrl: options.redirectUrl ?? "about:blank",
    blockShortcuts: options.blockShortcuts ?? true,
    blockContextMenu: options.blockContextMenu ?? true,
    detectConsole: options.detectConsole ?? false,
    useDebugger: options.useDebugger ?? false,
    sizeThreshold: options.sizeThreshold ?? 160,
    interval: options.interval ?? 1000,
    onDetect: options.onDetect,
    onClose: options.onClose,
  };
}
