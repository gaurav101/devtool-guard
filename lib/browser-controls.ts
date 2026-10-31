export interface BrowserControlOptions {
  blockShortcuts: boolean;
  blockContextMenu: boolean;
}

function isBlockedKey(event: KeyboardEvent): boolean {
  const modifier = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (event.key === "F12") return true;
  if (modifier && event.shiftKey && ["i", "j", "c", "p"].includes(key)) {
    return true;
  }
  if (event.metaKey && event.altKey && ["i", "j", "c", "u"].includes(key)) {
    return true;
  }
  return modifier && key === "u";
}

export function installBrowserControls(
  options: BrowserControlOptions,
): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (isBlockedKey(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const onContextMenu = (event: Event) => event.preventDefault();

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("contextmenu", onContextMenu, true);
  };

  try {
    if (options.blockShortcuts) {
      window.addEventListener("keydown", onKeyDown, true);
    }
    if (options.blockContextMenu) {
      window.addEventListener("contextmenu", onContextMenu, true);
    }
  } catch (error) {
    remove();
    throw error;
  }

  return () => {
    remove();
  };
}
