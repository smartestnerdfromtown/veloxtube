import { createShortsCleaner } from "./shortsCleaner";

const FOOTER_CSS = "ytd-guide-renderer #footer { display: none !important; }";

// #guide-content survives guide re-renders, so the observer outlives ytd-guide-renderer.
const cleanFooter = createShortsCleaner({
  container: "#guide-content",
  matcher: "#footer",
  subtree: true,
});

let styleElement: HTMLStyleElement | null = null;

const setFooterStyles = (enabled: boolean): void => {
  if (!enabled) {
    styleElement?.remove();
    styleElement = null;
    return;
  }

  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = FOOTER_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

export const initSidebarFooter = (enabled: boolean): void => {
  setFooterStyles(enabled);
  cleanFooter(enabled);
};
