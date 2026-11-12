// Platform paths remain unique to Explore; channel links can also appear in subscriptions.
const EXPLORE_SECTION = `ytd-guide-renderer #sections > ytd-guide-section-renderer:has(
  a[href="/gaming"],
  a[href^="/podcasts"],
  a[href^="/feed/podcasts"],
  a[href="/playables"],
  a[href^="/feed/trending"],
  a[href^="/feed/storefront"],
  a[href^="/paid_memberships"],
  a[href="/memberships"]
)`;

const EXPLORE_CSS = `${EXPLORE_SECTION} {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;

export const initExploreMenu = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = EXPLORE_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};
