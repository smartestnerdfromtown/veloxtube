const WATCH_OWNER = "ytd-watch-flexy ytd-video-owner-renderer";
const JOIN_SELECTOR = "ytd-watch-flexy #sponsor-button";
const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachJoinButton = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    if (!observedRoot?.isConnected) {
        observedRoot = document.querySelector(WATCH_OWNER);
    }

    if (!observedRoot) {
        return;
    }

    for (const joinButton of observedRoot.querySelectorAll("#sponsor-button")) {
        joinButton.remove();
    }
};

const scheduleDetach = (): void => {
    if (!active || scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(detachJoinButton);
};

const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        if (record.addedNodes.length > 0) {
            scheduleDetach();
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
    styleElement.textContent = JOIN_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const stopObserving = (): void => {
    observer.disconnect();
    observedRoot = null;
};

export const initVideoJoinButton = (enabled: boolean): void => {
    active = enabled;
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    const root = document.querySelector(WATCH_OWNER);

    if (root === observedRoot && root?.isConnected) {
        detachJoinButton();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer.observe(root, { childList: true, subtree: true });
    detachJoinButton();
};
