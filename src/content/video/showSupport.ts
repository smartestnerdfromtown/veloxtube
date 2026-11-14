const WATCH_OWNER = "ytd-watch-flexy ytd-video-owner-renderer";
const JOIN_TARGETS = [
    "#sponsor-button",
    ':is(button-view-model, yt-button-view-model, ytd-button-renderer):has(:is(button, a)[aria-label*="Thanks" i])',
];
const JOIN_TARGETS_SELECTOR = JOIN_TARGETS.join(",\n");
const JOIN_SELECTOR = JOIN_TARGETS.map((target) => `${WATCH_OWNER} ${target}`).join(",\n");
const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;

const detachThanksButton = (): void => {
    scheduled = false;

    if (!observedRoot?.isConnected) {
        observedRoot = document.querySelector(WATCH_OWNER);
    }

    if (!observedRoot) return;

    for (const joinButton of observedRoot.querySelectorAll(JOIN_TARGETS_SELECTOR)) {
        joinButton.remove();
    }
};

const scheduleDetach = (): void => {
    if (scheduled) return;

    scheduled = true;
    queueMicrotask(detachThanksButton);
};

const onMutations = (records: MutationRecord[]): void => {
    if (records.some((record) => record.addedNodes.length > 0)) {
        scheduleDetach();
    }
};

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
    observer?.disconnect();
    observer = null;
    observedRoot = null;
    scheduled = false;
};

export const initVideoThanksButton = (enabled: boolean): void => {
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    const root = document.querySelector(WATCH_OWNER);

    if (root === observedRoot && root?.isConnected) {
        detachThanksButton();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer = new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true });
    detachThanksButton();
};
