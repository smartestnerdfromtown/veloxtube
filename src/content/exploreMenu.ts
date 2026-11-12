const TARGET_TITLE = "Explore";
const SECTION_CLASS = "veloxtube-explore-menu";
const SECTIONS_ROOT = "ytd-guide-renderer #sections";
const GUIDE_SECTION = "ytd-guide-section-renderer";
const SECTION_SELECTOR = `${SECTIONS_ROOT} > ${GUIDE_SECTION}`;
const MINI_GUIDE = "ytd-mini-guide-renderer";
const MINI_ENTRY_SELECTOR = `${MINI_GUIDE} #items > ytd-mini-guide-entry-renderer`;

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
let sectionsRoot: Element | null = null;
let miniGuideRoot: Element | null = null;
const pendingTargets = new Set<Element>();
let scheduled = false;
let active = false;

const isExploreSection = (section: Element): boolean => {
  const title = section.querySelector("#guide-section-title")?.textContent?.trim();

  return (
    section.classList.contains(SECTION_CLASS) ||
    title === TARGET_TITLE ||
    section.querySelector(EXPLORE_LINKS) !== null
  );
};

const detachSection = (section: Element): void => {
  section.classList.add(SECTION_CLASS);
  section.remove();
};

const getSectionsRoot = (): Element | null => {
  if (sectionsRoot?.isConnected) {
    return sectionsRoot;
  }

  sectionsRoot = document.querySelector(SECTIONS_ROOT);
  return sectionsRoot;
};

const getMiniGuideRoot = (): Element | null => {
  if (miniGuideRoot?.isConnected) {
    return miniGuideRoot;
  }

  miniGuideRoot = document.querySelector(MINI_GUIDE);
  return miniGuideRoot;
};

// Initial and navigation sweeps stay scoped to the cached sidebar containers.
const detachExplore = (): void => {
  const sections = getSectionsRoot();

  if (sections) {
    for (const section of sections.querySelectorAll(`:scope > ${GUIDE_SECTION}`)) {
      if (isExploreSection(section)) {
        detachSection(section);
      }
    }
  }

  const miniGuide = getMiniGuideRoot();

  if (miniGuide) {
    for (const entry of miniGuide.querySelectorAll(EXPLORE_ENTRY)) {
      entry.remove();
    }
  }
};

// Check only the mutated subtree, not the whole guide, during rapid updates.
const purge = (node: Element): void => {
  const section = node.closest(SECTION_SELECTOR);

  if (section) {
    if (isExploreSection(section)) {
      detachSection(section);
    }
  } else {
    for (const candidate of node.querySelectorAll(SECTION_SELECTOR)) {
      if (isExploreSection(candidate)) {
        detachSection(candidate);
      }
    }
  }

  const entry = node.closest(EXPLORE_ENTRY);

  if (entry) {
    entry.remove();
    return;
  }

  for (const miniEntry of node.querySelectorAll(EXPLORE_ENTRY)) {
    miniEntry.remove();
  }
};

const flush = (): void => {
  scheduled = false;

  if (!active) {
    pendingTargets.clear();
    return;
  }

  for (const target of pendingTargets) {
    if (target.isConnected) {
      purge(target);
    }
  }

  pendingTargets.clear();
};

const scheduleFlush = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(flush);
};

const onMutations = (records: MutationRecord[]): void => {
  if (!active) {
    return;
  }

  let added = false;

  for (const record of records) {
    if (record.addedNodes.length > 0 && record.target instanceof Element) {
      pendingTargets.add(record.target);
      added = true;
    }
  }

  if (added) {
    scheduleFlush();
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
  sectionsRoot = null;
  miniGuideRoot = null;
  pendingTargets.clear();
};

const findRoots = (): Element[] => {
  // #guide survives full, collapsed, and mini layouts; #guide-wrapper is the fallback.
  const guide = document.querySelector("#guide") ?? document.querySelector("#guide-wrapper");
  const miniGuide = document.querySelector(MINI_GUIDE);

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
