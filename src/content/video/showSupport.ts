const WATCH_METADATA = "ytd-watch-metadata";
const BUTTON = ":is(button-view-model, yt-button-view-model, ytd-button-renderer)";
const THANKS_LABEL = ':is([aria-label*="Thanks" i], [title*="Thanks" i])';
const THANKS_BUTTON = `:is(${BUTTON}:has(${THANKS_LABEL}), ${BUTTON}${THANKS_LABEL})`;
const HIDE_THANKS_BUTTON_CSS = `${WATCH_METADATA} ${THANKS_BUTTON} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;

const detachThanksButton = (): void => {
    scheduled = false;

    if (!observedRoot?.isConnected) {
        observedRoot = document.querySelector(WATCH_METADATA);
    }

    if (!observedRoot) return;

    for (const joinButton of observedRoot.querySelectorAll(THANKS_BUTTON)) {
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
    styleElement.textContent = HIDE_THANKS_BUTTON_CSS;
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

    const root = document.querySelector(WATCH_METADATA);

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
