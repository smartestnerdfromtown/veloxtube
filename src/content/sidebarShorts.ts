import { createShortsCleaner } from "./shortsCleaner";

const MATCHER =
  'ytd-guide-entry-renderer:has(a[title="Shorts"]), ytd-guide-entry-renderer:has(a[aria-label="Shorts"]), ytd-guide-entry-renderer:has(a[href^="/shorts"]), ytd-mini-guide-entry-renderer:has(a[title="Shorts"]), ytd-mini-guide-entry-renderer:has(a[aria-label="Shorts"]), ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]), ytd-mini-guide-entry-renderer[aria-label="Shorts"]';

const cleanGuide = createShortsCleaner({
  container: "ytd-guide-renderer",
  matcher: MATCHER,
  subtree: true,
});

const cleanMiniGuide = createShortsCleaner({
  container: "ytd-mini-guide-renderer",
  matcher: MATCHER,
  subtree: true,
});

let enabled = true;
let scheduled = false;

const run = (): void => {
  scheduled = false;
  cleanGuide(enabled);
  cleanMiniGuide(enabled);
};

export const initSidebarShorts = (value: boolean): void => {
  enabled = value;

  if (scheduled) {
    return;
  }

  scheduled = true;
  queueMicrotask(run);
};
