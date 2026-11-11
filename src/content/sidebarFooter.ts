import { createShortsCleaner } from "./shortsCleaner";

const FOOTER_CSS = "ytd-guide-renderer #footer { display: none !important; }";

const cleanFooter = createShortsCleaner({
  container: "ytd-guide-renderer",
  matcher: "#footer",
  subtree: true,
});

let styleElement: HTMLStyleElement | null = null;

const injectFooterStyles = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = FOOTER_CSS;
  (document.head ?? document.documentElement).append(styleElement);
};

export const initSidebarFooter = (): void => {
  injectFooterStyles();
  cleanFooter(true);
};
