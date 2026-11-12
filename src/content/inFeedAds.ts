const AD_NODES = [
  "ytd-ad-slot-renderer",
  "ytd-search-pyv-renderer",
  "ytd-promoted-sparkles-web-renderer",
  "ytd-promoted-sparkles-text-search-renderer",
  "ytd-promoted-video-renderer",
  "ytd-compact-promoted-video-renderer",
  "ytd-display-ad-renderer",
  "ytd-carousel-ad-renderer",
  "ytd-in-feed-ad-layout-renderer",
];

const AD_CARDS = [
  "ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
  "ytd-rich-item-renderer:has(ytd-promoted-sparkles-web-renderer)",
  "ytd-rich-item-renderer:has(ytd-promoted-video-renderer)",
  "ytd-rich-item-renderer:has(ytd-compact-promoted-video-renderer)",
  "ytd-rich-item-renderer:has(ytd-display-ad-renderer)",
  "ytd-rich-item-renderer:has(ytd-carousel-ad-renderer)",
  "ytd-rich-item-renderer:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad)",
  "ytd-video-renderer:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad)",
  "yt-lockup-view-model:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad)",
  "ytd-item-section-renderer:has(> #contents > ytd-ad-slot-renderer:only-child)",
  "ytd-item-section-renderer:has(> #contents > ytd-search-pyv-renderer:only-child)",
];

const AD_BADGE_SELECTOR = "badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad";
const AD_NODE_SELECTOR = AD_NODES.join(",\n");
const AD_SELECTOR = [...AD_NODES, ...AD_CARDS].join(",\n");

// Hide the ad node and its enclosing feed card together to avoid empty slots.
const AD_CSS = `${AD_SELECTOR} {
  display: none !important;
}`;

const FEED_ROOTS = [
  'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer',
  "ytd-search ytd-section-list-renderer",
  "ytd-watch-flexy #related",
];

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
let pendingNodes: Element[] = [];
let scheduled = false;
let active = false;

// Remove the enclosing card or ad-only section so no blank feed slot remains.
const removeAd = (ad: Element): void => {
  const richItem = ad.closest("ytd-rich-item-renderer");

  if (richItem) {
    richItem.remove();
    return;
  }

  const card = ad.closest("ytd-video-renderer, yt-lockup-view-model");

  if (card) {
    card.remove();
    return;
  }

  const section = ad.closest("ytd-item-section-renderer");
  const contents = section?.querySelector(":scope > #contents");

  if (section && contents?.childElementCount === 1) {
    section.remove();
    return;
  }

  ad.remove();
};

const removeAdBadge = (badge: Element): void => {
  const richItem = badge.closest("ytd-rich-item-renderer");

  if (richItem) {
    richItem.remove();
    return;
  }

  const card = badge.closest("ytd-video-renderer, yt-lockup-view-model");
  (card ?? badge).remove();
};

// Added nodes can be the ad itself, a wrapper, or content injected into an existing ad slot.
const purge = (node: Element): void => {
  const ad = node.closest(AD_NODE_SELECTOR);

  if (ad) {
    removeAd(ad);
  } else {
    for (const element of node.querySelectorAll(AD_NODE_SELECTOR)) {
      if (element.isConnected) {
        removeAd(element);
      }
    }
  }

  const badge = node.closest(AD_BADGE_SELECTOR);

  if (badge) {
    removeAdBadge(badge);
    return;
  }

  for (const element of node.querySelectorAll(AD_BADGE_SELECTOR)) {
    if (element.isConnected) {
      removeAdBadge(element);
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
    if (node.isConnected) {
      purge(node);
    }
  }
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
    for (const node of record.addedNodes) {
      if (node instanceof Element) {
        pendingNodes.push(node);
        added = true;
      }
    }
  }

  if (added) {
    scheduleFlush();
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
  styleElement.textContent = AD_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
  observer?.disconnect();
  observer = null;
  observedRoots = [];
  pendingNodes = [];
};

export const initInFeedAds = (enabled: boolean): void => {
  active = enabled;
  setStyles(enabled);

  if (!enabled) {
    disconnectObserver();
    return;
  }

  const roots = FEED_ROOTS.map((selector) => document.querySelector(selector)).filter(
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
    purge(root);
  }
};
