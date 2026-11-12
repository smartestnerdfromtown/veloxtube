// Hide the ad renderer and its feed card together so no empty grid cell remains.
const AD_CSS = `
ytd-ad-slot-renderer,
ytd-search-pyv-renderer,
ytd-promoted-sparkles-web-renderer,
ytd-promoted-sparkles-text-search-renderer,
ytd-promoted-video-renderer,
ytd-compact-promoted-video-renderer,
ytd-display-ad-renderer,
ytd-carousel-ad-renderer,
ytd-in-feed-ad-layout-renderer,
ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
ytd-rich-item-renderer:has(ytd-promoted-sparkles-web-renderer),
ytd-rich-item-renderer:has(ytd-promoted-video-renderer),
ytd-rich-item-renderer:has(ytd-compact-promoted-video-renderer),
ytd-rich-item-renderer:has(ytd-display-ad-renderer),
ytd-rich-item-renderer:has(ytd-carousel-ad-renderer),
ytd-rich-item-renderer:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad),
ytd-video-renderer:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad),
yt-lockup-view-model:has(badge-shape.ytBadgeShapeAd, badge-shape.yt-badge-shape--ad),
ytd-item-section-renderer:has(> #contents > ytd-ad-slot-renderer:only-child),
ytd-item-section-renderer:has(> #contents > ytd-search-pyv-renderer:only-child) {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;

export const initInFeedAds = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = AD_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};
