export interface GuardOptions {
  /** What to do when DevTools is detected. Default: "none" (only fires callbacks). */
  action?: "none" | "blank" | "redirect";
  /** Used when action is "redirect". */
  redirectUrl?: string;
  /** Block F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U, Ctrl/Cmd+Shift+P. Default: true */
  blockShortcuts?: boolean;
  /** Block right-click menu. Default: true */
  blockContextMenu?: boolean;
  /** Log a console probe to detect undocked DevTools. This can produce console output. Default: false */
  detectConsole?: boolean;
  /** Enable the `debugger` timing check (pauses page while DevTools is open). Default: false */
  useDebugger?: boolean;
  /** Pixel gap between outer/inner window size treated as docked DevTools. Default: 160 */
  sizeThreshold?: number;
  /** Poll interval in ms. Default: 1000 */
  interval?: number;
  onDetect?: () => void;
  onClose?: () => void;
}

export interface GuardController {
  stop(): void;
  isOpen(): boolean;
}

export interface ResolvedGuardOptions {
  action: NonNullable<GuardOptions["action"]>;
  redirectUrl: string;
  blockShortcuts: boolean;
  blockContextMenu: boolean;
  detectConsole: boolean;
  useDebugger: boolean;
  sizeThreshold: number;
  interval: number;
  onDetect?: () => void;
  onClose?: () => void;
}
