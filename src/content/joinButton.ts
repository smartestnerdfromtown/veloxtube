const CHANNEL_ACTIONS = "yt-page-header-renderer yt-flexible-actions-view-model button-view-model";

const JOIN_SELECTOR = [
    "ytd-watch-flexy #sponsor-button",
    "yt-page-header-renderer #sponsor-button",
    "ytd-c4-tabbed-header-renderer #sponsor-button",
    `${CHANNEL_ACTIONS}:has(button[aria-label*="Join" i])`,
    `${CHANNEL_ACTIONS}:has(button.ytSpecButtonShapeNextTonal.ytSpecButtonShapeNextIconLeading)`,
    `${CHANNEL_ACTIONS}:has(button.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--icon-leading)`,
].join(",\n");

const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;

export const initJoinButton = (): void => {
    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = JOIN_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};
