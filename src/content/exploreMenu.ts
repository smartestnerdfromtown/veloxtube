const TARGET_TITLE = "Explore";
const SECTION_CLASS = "veloxtube-explore-menu";
const SECTION_SELECTOR = "ytd-guide-renderer #sections > ytd-guide-section-renderer";
const MINI_ENTRY_SELECTOR = "ytd-mini-guide-renderer ytd-mini-guide-entry-renderer";

// Platform paths remain unique to Explore; channel links can also appear in subscriptions.
const EXPLORE_LINKS = [
  'a[href="/gaming"]',
  'a[href^="/podcasts"]',
  'a[href^="/feed/podcasts"]',
  'a[href^="/feed/trending"]',
  'a[href^="/feed/explore"]',
  'a[href="/playables"]',
  'a[href^="/feed/storefront"]',
  'a[href^="/paid_memberships"]',
  'a[href="/memberships"]',
].join(",\n");

const EXPLORE_SECTION = `${SECTION_SELECTOR}:has(${EXPLORE_LINKS})`;
const EXPLORE_MARKED = `${SECTION_SELECTOR}.${SECTION_CLASS}`;
const EXPLORE_ENTRY = `${MINI_ENTRY_SELECTOR}:has(${EXPLORE_LINKS})`;

const EXPLORE_CSS = `${EXPLORE_SECTION},
${EXPLORE_MARKED},
${EXPLORE_ENTRY} {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
let scheduled = false;
let active = false;

const isExploreSection = (section: Element): boolean => {
  const title = section.querySelector("#guide-section-title")?.textContent?.trim();

  return title === TARGET_TITLE || section.querySelector(EXPLORE_LINKS) !== null;
};

const detachExplore = (): void => {
  scheduled = false;

  if (!active) {
    return;
  }

  for (const section of document.querySelectorAll(SECTION_SELECTOR)) {
    if (isExploreSection(section)) {
      section.classList.add(SECTION_CLASS);
      section.remove();
    }
  }

  for (const entry of document.querySelectorAll(EXPLORE_ENTRY)) {
    entry.remove();
  }
};

const scheduleDetach = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(detachExplore);
};

const onMutations = (records: MutationRecord[]): void => {
  if (!active) {
    return;
  }

  for (const record of records) {
    if (record.addedNodes.length > 0) {
      scheduleDetach();
      return;
    }
  }
};

const setStyles = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = EXPLORE_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
  observer?.disconnect();
  observer = null;
  observedRoots = [];
};

const findRoots = (): Element[] => {
  // #guide survives full, collapsed, and mini layouts; #guide-wrapper is the fallback.
  const guide = document.querySelector("#guide") ?? document.querySelector("#guide-wrapper");
  const miniGuide = document.querySelector("ytd-mini-guide-renderer");

  return [guide, miniGuide].filter((root): root is Element => root !== null);
};

const observeRoots = (): void => {
  const roots = findRoots();

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

  detachExplore();
};

const teardown = (): void => {
  active = false;
  disconnectObserver();
  styleElement?.remove();
  styleElement = null;
};

export const initExploreMenu = (enabled: boolean): void => {
  if (!enabled) {
    teardown();
    return;
  }

  active = true;
  setStyles();
  observeRoots();
};
