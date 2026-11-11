import { createShortsCleaner } from "./shortsCleaner";

const MATCHER =
  'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]), ytd-rich-section-renderer:has(ytd-reel-shelf-renderer), ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer, ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-item-renderer:has(a[href^="/shorts/"]), ytd-reel-item-renderer';

export const initHomeShorts = createShortsCleaner({
  container: 'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents',
  matcher: MATCHER,
});
