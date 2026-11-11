import { createShortsCleaner } from "./shortsCleaner";

const MATCHER =
  'ytd-guide-entry-renderer:has(a[title="Shorts"]), ytd-guide-entry-renderer:has(a[href^="/shorts"]), ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]), ytd-mini-guide-entry-renderer[aria-label="Shorts"]';

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

export const initSidebarShorts = (enabled: boolean): void => {
  cleanGuide(enabled);
  cleanMiniGuide(enabled);
};
