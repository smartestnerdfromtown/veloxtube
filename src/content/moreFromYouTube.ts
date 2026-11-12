const TARGET_TITLE = "More from YouTube";
const SECTION_CLASS = "veloxtube-more-from-youtube";
const GUIDE_SECTION_SELECTOR = "ytd-guide-renderer ytd-guide-section-renderer";
const TARGET_SELECTOR = `${GUIDE_SECTION_SELECTOR}.${SECTION_CLASS}`;

const SECTION_CSS = `${TARGET_SELECTOR} {
  display: none !important;
}`;

// #guide survives full, collapsed, and mini guide layouts; #guide-wrapper is the fallback.
const GUIDE_ROOT = "#guide, #guide-wrapper";

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let guideRoot: Element | null = null;
let scheduled = false;
let active = false;

const markTargetSections = (root: Element): void => {
  for (const section of root.querySelectorAll(GUIDE_SECTION_SELECTOR)) {
    const title = section.querySelector("#guide-section-title")?.textContent?.trim();

    if (title === TARGET_TITLE) {
      section.classList.add(SECTION_CLASS);
    }
  }
};

const detachSections = (): void => {
  scheduled = false;

  if (!active || !guideRoot?.isConnected) {
    return;
  }

  markTargetSections(guideRoot);

  for (const section of guideRoot.querySelectorAll(TARGET_SELECTOR)) {
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
  styleElement.textContent = SECTION_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
  observer?.disconnect();
  observer = null;
  guideRoot = null;
};

export const initMoreFromYouTube = (enabled: boolean): void => {
  active = enabled;
  setStyles(enabled);

  if (!enabled) {
    disconnectObserver();
    return;
  }

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
