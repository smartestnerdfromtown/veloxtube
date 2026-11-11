const MASTHEAD = "ytd-masthead";
const GUIDE_WRAPPER = "#guide-wrapper";

const LOGO_SELECTOR = [
  "ytd-masthead ytd-topbar-logo-renderer",
  "ytd-masthead #logo",
  "ytd-masthead #masthead-logo",
  "#guide-content #header ytd-topbar-logo-renderer",
  "#guide-content #header #logo",
].join(",\n");

const LOGO_CSS = `${LOGO_SELECTOR} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
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
  observedRoots = [];
};

export const initTopLogo = (enabled: boolean): void => {
  active = enabled;
  setStyles(enabled);

  if (!enabled) {
    disconnectObserver();
    return;
  }

  const roots = [MASTHEAD, GUIDE_WRAPPER]
    .map((selector) => document.querySelector(selector))
    .filter((root): root is Element => root !== null);

  const unchanged =
    roots.length === observedRoots.length &&
    roots.every((root, index) => root === observedRoots[index] && root.isConnected);

  if (unchanged) {
    return;
  }

  disconnectObserver();

  if (roots.length === 0) {
    return;
  }

  observer = new MutationObserver(scheduleCleanup);
  observedRoots = roots;

  for (const root of roots) {
    observer.observe(root, { childList: true, subtree: true });
  }

  scheduleCleanup();
};
