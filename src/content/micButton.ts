const MASTHEAD = "ytd-masthead";
const MIC_TYPES = ":is(#voice-search-button, ytd-voice-search-button-renderer)";
const MIC_SELECTOR = `${MASTHEAD} ${MIC_TYPES}`;
const MIC_CSS = `${MIC_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observedRoot: Element | null = null;
let micRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachMic = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    if (!micRoot?.isConnected) {
        micRoot = document.querySelector(MASTHEAD);
    }

    if (!micRoot) {
        return;
    }

    for (const mic of micRoot.querySelectorAll(MIC_TYPES)) {
        mic.remove();
    }
};

const scheduleCleanup = (): void => {
    if (scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(detachMic);
};

const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        if (record.addedNodes.length > 0) {
            scheduleCleanup();
            return;
        }
    }
};

const observer = new MutationObserver(onMutations);

const setStyles = (enabled: boolean): void => {
    if (!enabled) {
        styleElement?.remove();
        styleElement = null;
        return;
    }

    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = MIC_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const stopObserving = (): void => {
    observer.disconnect();
    observedRoot = null;
    micRoot = null;
};

const observeHeader = (): void => {
    const root = document.querySelector(MASTHEAD);

    if (root === observedRoot && root?.isConnected) {
        detachMic();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer.observe(root, { childList: true, subtree: true });
    detachMic();
};

export const initMicButton = (enabled: boolean): void => {
    active = enabled;
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    observeHeader();
};
