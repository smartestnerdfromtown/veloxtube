const TOP_LOGO_CSS = [
  "ytd-masthead #logo",
  "ytd-masthead ytd-topbar-logo-renderer",
  "ytd-masthead #masthead-logo",
].join(",\n");

const STYLE = `${TOP_LOGO_CSS} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;

export const initTopLogo = (): void => {
  if (styleElement?.isConnected) {
    return;
  }

  styleElement = document.createElement("style");
  styleElement.textContent = STYLE;
  (document.head ?? document.documentElement).append(styleElement);
};
