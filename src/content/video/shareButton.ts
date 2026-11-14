const WATCH_METADATA = "ytd-watch-metadata";
const BUTTON = ":is(yt-button-view-model, button-view-model)";
const SHARE_LABEL = ':is([aria-label*="Share" i], [title*="Share" i])';
const SHARE_BUTTON = `:is(${BUTTON}:has(${SHARE_LABEL}), ${BUTTON}${SHARE_LABEL})`;
const HIDE_SHARE_BUTTON_CSS = `${WATCH_METADATA} ${SHARE_BUTTON} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;

const detachShareButton = (): void => {
    scheduled = false;

    if (!observedRoot?.isConnected) {
        observedRoot = document.querySelector(WATCH_METADATA);
    }

    if (!observedRoot) return;

    for (const joinButton of observedRoot.querySelectorAll(SHARE_BUTTON)) {
        joinButton.remove();
    }
};

const scheduleDetach = (): void => {
    if (scheduled) return;

    scheduled = true;
    queueMicrotask(detachShareButton);
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
    styleElement.textContent = HIDE_SHARE_BUTTON_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const stopObserving = (): void => {
    observer?.disconnect();
    observer = null;
    observedRoot = null;
    scheduled = false;
};

export const initVideoShareButton = (enabled: boolean): void => {
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    const root = document.querySelector(WATCH_METADATA);

    if (root === observedRoot && root?.isConnected) {
        detachShareButton();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer = new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true });
    detachShareButton();
};
