const HOME = 'ytd-browse[page-subtype="home"]';
const HOME_HEADER = `${HOME} #header`;
const HIDDEN_HEADER = "veloxtube-chip-header";

const ROOTS = [
  `${HOME} > #header`,
  `${HOME} ytd-rich-grid-renderer > #header`,
  `${HOME} #chips-below`,
  `${HOME} #home-chips`,
  "ytd-watch-flexy #related",
];

const CHIP_SELECTORS = [
  `${HOME} ytd-feed-filter-chip-bar-renderer`,
  `${HOME} #header yt-chip-cloud-renderer`,
  `${HOME} #chips-below`,
  `${HOME} #home-chips`,
  "ytd-watch-flexy #related ytd-feed-filter-chip-bar-renderer",
  "ytd-watch-flexy #related yt-related-chip-cloud-renderer",
  "ytd-watch-next-secondary-results-renderer yt-related-chip-cloud-renderer",
].join(",\n");

const CHIP_CSS = `${CHIP_SELECTORS},
${HOME_HEADER}.${HIDDEN_HEADER} {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
let pendingNodes: Element[] = [];
let scheduled = false;
let active = false;

const detach = (chip: Element): void => {
  chip.closest(HOME_HEADER)?.classList.add(HIDDEN_HEADER);
  chip.remove();
};

const detachIn = (root: Element): void => {
  if (!root.isConnected) {
    return;
  }

  if (root.matches(CHIP_SELECTORS)) {
    detach(root);
    return;
  }

  for (const chip of root.querySelectorAll(CHIP_SELECTORS)) {
    if (chip.isConnected) {
      detach(chip);
    }
  }
};

const detachAll = (): void => {
  for (const chip of document.querySelectorAll(CHIP_SELECTORS)) {
    if (chip.isConnected) {
      detach(chip);
    }
  }
};

const flush = (): void => {
  scheduled = false;

  if (!active) {
    pendingNodes = [];
    return;
  }

  const nodes = pendingNodes;
  pendingNodes = [];

  for (const node of nodes) {
    detachIn(node);
  }
};

const scheduleCleanup = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(flush);
};

const onMutations = (records: MutationRecord[]): void => {
  let added = false;

  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node instanceof Element) {
        pendingNodes.push(node);
        added = true;
      }
    }
  }

  if (added) {
    scheduleCleanup();
  }
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
  pendingNodes = [];
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

  observer = new MutationObserver(onMutations);
  observedRoots = roots;

  for (const root of roots) {
    observer.observe(root, { childList: true, subtree: true });
  }

  detachAll();
};
