// The section title is text-only, so its promotional links are the stable CSS anchor.
const SECTION_SELECTOR = `ytd-guide-renderer ytd-guide-section-renderer:has(
  a[href$="/premium"],
  a[href*="music.youtube.com"],
  a[href*="youtubekids.com"],
  a[href$="/labs"]
)`;

const SECTION_CSS = `${SECTION_SELECTOR} {
  display: none !important;
}`;

const GUIDE_ROOT = "#guide-wrapper";

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let guideRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachSections = (): void => {
  scheduled = false;

  if (!active || !guideRoot?.isConnected) {
    return;
  }

  for (const section of guideRoot.querySelectorAll(SECTION_SELECTOR)) {
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
