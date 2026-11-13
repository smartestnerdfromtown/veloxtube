const BELL_SELECTOR = [
    "ytd-masthead #buttons > ytd-notification-topbar-button-renderer",
    "ytd-masthead #notification-button",
].join(",\n");

const BELL_CSS = `${BELL_SELECTOR} {\n  display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;

export const initNotificationBell = (): void => {
    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = BELL_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};
