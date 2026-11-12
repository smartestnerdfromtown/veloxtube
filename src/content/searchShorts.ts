import { createShortsCleaner } from "./shortsCleaner";

const MATCHER =
    'ytd-reel-shelf-renderer, ytd-reel-item-renderer, grid-shelf-view-model:has(a[href^="/shorts/"]), grid-shelf-view-model:has(.shortsLockupViewModelHost), ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, ytd-rich-shelf-renderer[is-shorts], ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-section-renderer:has(ytd-reel-shelf-renderer), ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]), ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-item-renderer:has(a[href^="/shorts/"]), ytd-video-renderer:has(a[href^="/shorts/"]), ytd-video-renderer:has(ytm-shorts-lockup-view-model), ytd-video-renderer:has([overlay-style="SHORTS"]), ytd-video-renderer:has(badge-shape[aria-label="Shorts"]), yt-lockup-view-model:has(a[href^="/shorts/"])';

export const initSearchShorts = createShortsCleaner({
    container: "ytd-search ytd-section-list-renderer > #contents",
    matcher: MATCHER,
    subtree: true,
    pruneRichSections: true,
    pruneEmptySections: true,
});
