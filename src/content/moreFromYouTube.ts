// The section title is text-only, so its promotional links are the stable CSS anchor.
const MORE_FROM_YOUTUBE_CSS = `
ytd-guide-renderer ytd-guide-section-renderer:has(
  a[href$="/premium"],
  a[href*="music.youtube.com"],
  a[href*="youtubekids.com"],
  a[href$="/labs"]
) {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;

export const initMoreFromYouTube = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = MORE_FROM_YOUTUBE_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};
