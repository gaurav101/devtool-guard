export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Reveal a page that was hidden until its client-side application initialized.
 */
export function reveal(): void {
  if (isBrowser()) document.documentElement.style.visibility = "visible";
}
