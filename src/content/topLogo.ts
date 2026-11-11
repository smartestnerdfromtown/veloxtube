const MASTHEAD = "ytd-masthead";
const LOGO_SELECTOR =
  "ytd-masthead #logo, ytd-masthead ytd-topbar-logo-renderer, ytd-masthead #masthead-logo";
const LOGO_CSS = `${LOGO_SELECTOR} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachLogos = (): void => {
  scheduled = false;

  if (!active) {
    return;
  }

  for (const logo of document.querySelectorAll(LOGO_SELECTOR)) {
    logo.remove();
  }
};

const scheduleCleanup = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(detachLogos);
};

const setStyles = (enabled: boolean): void => {
  if (!enabled) {
    styleElement?.remove();
    styleElement = null;
    return;
  }

  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = LOGO_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
  observer?.disconnect();
  observer = null;
  observedRoot = null;
};

export const initTopLogo = (enabled: boolean): void => {
  active = enabled;
  setStyles(enabled);

  if (!enabled) {
    disconnectObserver();
    return;
  }

  const root = document.querySelector(MASTHEAD);

  if (root === observedRoot && root?.isConnected) {
    return;
  }

  disconnectObserver();

  if (!root) {
    return;
  }

  observer = new MutationObserver(scheduleCleanup);
  observedRoot = root;
  observer.observe(root, { childList: true, subtree: true });
  scheduleCleanup();
};
