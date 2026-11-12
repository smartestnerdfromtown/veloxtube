const SPONSORED_MARKERS = [
  "badge-shape.ytBadgeShapeAd",
  "badge-shape.yt-badge-shape--ad",
  "feed-ad-metadata-view-model",
  "ad-badge-view-model",
  "ad-details-line-view-model",
  "carousel-ad-card-collection-view-model",
];

const SPONSORED_CARDS = [
  "ytd-rich-item-renderer[is-ad]",
  "ytd-rich-item-renderer[ad-impression]",
  "ytd-rich-item-renderer[is-sponsored]",
  "ytd-video-renderer[is-ad]",
  "ytd-video-renderer[ad-impression]",
  "ytd-video-renderer[is-sponsored]",
];

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

const SPONSORED_SELECTOR = SPONSORED_MARKERS.join(",\n");

const AD_CARDS = [
  "ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
  "ytd-rich-item-renderer:has(ytd-promoted-sparkles-web-renderer)",
  "ytd-rich-item-renderer:has(ytd-promoted-video-renderer)",
  "ytd-rich-item-renderer:has(ytd-compact-promoted-video-renderer)",
  "ytd-rich-item-renderer:has(ytd-display-ad-renderer)",
  "ytd-rich-item-renderer:has(ytd-carousel-ad-renderer)",
  `ytd-rich-item-renderer:has(${SPONSORED_SELECTOR})`,
  `ytd-video-renderer:has(${SPONSORED_SELECTOR})`,
  `yt-lockup-view-model:has(${SPONSORED_SELECTOR})`,
  "ytd-item-section-renderer:has(> #contents > ytd-ad-slot-renderer:only-child)",
  "ytd-item-section-renderer:has(> #contents > ytd-search-pyv-renderer:only-child)",
];

const AD_NODE_SELECTOR = AD_NODES.join(",\n");
const AD_SELECTOR = [...AD_NODES, ...AD_CARDS, ...SPONSORED_CARDS].join(",\n");
const AD_MATCH_SELECTOR = [...AD_NODES, ...SPONSORED_MARKERS, ...SPONSORED_CARDS].join(",\n");

const FEED_ROOTS = [
  'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  'ytd-browse[page-subtype="subscriptions"] ytd-rich-grid-renderer',
  "ytd-search ytd-section-list-renderer",
  "ytd-watch-flexy #related",
];

const FEED_SCOPE = `:is(${FEED_ROOTS.join(",\n")})`;

// Keep ad styles inside feed roots so organic cards and watch UI are untouched.
const AD_CSS = `${FEED_SCOPE} :is(${AD_SELECTOR}) {
  display: none !important;
}`;

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

  const video = ad.closest("ytd-video-renderer");

  if (video) {
    video.remove();
    return;
  }

  const lockup = ad.closest("yt-lockup-view-model");

  if (lockup) {
    lockup.remove();
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

const removeSponsoredCard = (marker: Element): void => {
  const richItem = marker.closest("ytd-rich-item-renderer");

  if (richItem) {
    richItem.remove();
    return;
  }

  const video = marker.closest("ytd-video-renderer");

  if (video) {
    video.remove();
    return;
  }

  const lockup = marker.closest("yt-lockup-view-model");
  (lockup ?? marker).remove();
};

const removeMatch = (element: Element): void => {
  if (element.matches(AD_NODE_SELECTOR)) {
    removeAd(element);
  } else {
    removeSponsoredCard(element);
  }
};

// One combined query covers ad nodes, sponsored markers, and sponsorship attributes.
const purge = (node: Element): void => {
  const match = node.closest(AD_MATCH_SELECTOR);

  if (match) {
    removeMatch(match);
    return;
  }

  for (const element of node.querySelectorAll(AD_MATCH_SELECTOR)) {
    if (element.isConnected) {
      removeMatch(element);
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

// One microtask flush coalesces mutation batches from rapid feed scrolling.
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

const setStyles = (): void => {
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

// Drop every observer, style, and DOM reference when the feature is disabled.
const teardown = (): void => {
  active = false;
  disconnectObserver();
  styleElement?.remove();
  styleElement = null;
};

export const initInFeedAds = (enabled: boolean): void => {
  if (!enabled) {
    teardown();
    return;
  }

  active = true;
  setStyles();

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
