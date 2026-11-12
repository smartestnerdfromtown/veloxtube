const CHIP_SELECTORS = [
  'ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer',
  'ytd-browse[page-subtype="home"] #header yt-chip-cloud-renderer',
  "ytd-watch-flexy ytd-feed-filter-chip-bar-renderer",
  "ytd-watch-flexy yt-related-chip-cloud-renderer",
  "ytd-watch-next-secondary-results-renderer yt-related-chip-cloud-renderer",
].join(",\n");

const CHIP_CSS = `${CHIP_SELECTORS} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;

export const initTopicBar = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = CHIP_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};
