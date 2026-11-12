const ROOTS = ['ytd-browse[page-subtype="home"] #header', "ytd-watch-flexy #related"];

const CHIP_SELECTORS = [
  'ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer',
  'ytd-browse[page-subtype="home"] #header yt-chip-cloud-renderer',
  "ytd-watch-flexy ytd-feed-filter-chip-bar-renderer",
  "ytd-watch-flexy yt-related-chip-cloud-renderer",
  "ytd-watch-next-secondary-results-renderer yt-related-chip-cloud-renderer",
].join(",\n");

const CHIP_CSS = `${CHIP_SELECTORS} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
let scheduled = false;
let active = false;

const detachChips = (): void => {
  scheduled = false;

  if (!active) {
    return;
  }

  for (const chips of document.querySelectorAll(CHIP_SELECTORS)) {
    chips.remove();
  }
};

const scheduleCleanup = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(detachChips);
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
  styleElement.textContent = CHIP_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
  observer?.disconnect();
  observer = null;
  observedRoots = [];
};

export const initTopicBar = (enabled: boolean): void => {
  active = enabled;
  setStyles(enabled);

  if (!enabled) {
    disconnectObserver();
    return;
  }

  const roots = ROOTS.map((selector) => document.querySelector(selector)).filter(
    (root): root is Element => root !== null,
  );

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
