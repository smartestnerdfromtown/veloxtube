const MIC_SELECTOR = [
    "ytd-masthead #voice-search-button",
    "ytd-masthead ytd-voice-search-button-renderer",
].join(",\n");

const MIC_CSS = `${MIC_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;

export const initMicButton = (): void => {
    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = MIC_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};
