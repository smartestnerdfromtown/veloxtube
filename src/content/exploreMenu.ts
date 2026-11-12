// Platform paths remain unique to Explore; channel links can also appear in subscriptions.
const EXPLORE_MATCH = `#sections > ytd-guide-section-renderer:has(
  a[href="/gaming"],
  a[href^="/podcasts"],
  a[href^="/feed/podcasts"],
  a[href="/playables"],
  a[href^="/feed/trending"],
  a[href^="/feed/storefront"],
  a[href^="/paid_memberships"],
  a[href="/memberships"]
)`;

const EXPLORE_CSS = `ytd-guide-renderer ${EXPLORE_MATCH} {
  display: none !important;
}`;

// #guide survives full, collapsed, and mini guide layouts; #guide-wrapper is the fallback.
const GUIDE_ROOT = "#guide, #guide-wrapper";

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let guideRoot: Element | null = null;
let guideRenderer: Element | null = null;
let scheduled = false;
let active = false;

const detachSections = (): void => {
  scheduled = false;

  if (!active || !guideRoot?.isConnected) {
    return;
  }

  if (!guideRenderer?.isConnected || !guideRoot.contains(guideRenderer)) {
    guideRenderer = guideRoot.querySelector("ytd-guide-renderer");
  }

  if (!guideRenderer) {
    return;
  }

  for (const section of guideRenderer.querySelectorAll(EXPLORE_MATCH)) {
    section.remove();
  }
};

const scheduleDetach = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(detachSections);
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
  guideRoot = null;
  guideRenderer = null;
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

  const root = document.querySelector(GUIDE_ROOT);

  if (root === guideRoot && root?.isConnected) {
    return;
  }

  disconnectObserver();
  guideRoot = root;

  if (!root) {
    return;
  }

  observer = new MutationObserver(onMutations);
  observer.observe(root, { childList: true, subtree: true });
  detachSections();
};
