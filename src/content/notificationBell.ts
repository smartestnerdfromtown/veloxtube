const MASTHEAD = "ytd-masthead";

const BELL_SELECTOR = [
    "ytd-masthead #buttons > ytd-notification-topbar-button-renderer",
    "ytd-masthead #notification-button",
].join(",\n");

const BELL_CSS = `${BELL_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachBells = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    for (const bell of document.querySelectorAll(BELL_SELECTOR)) {
        bell.remove();
    }
};

const scheduleCleanup = (): void => {
    if (scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(detachBells);
};

const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        if (record.addedNodes.length > 0) {
            scheduleCleanup();
            return;
        }
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
    styleElement.textContent = BELL_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
    observer?.disconnect();
    observer = null;
    observedRoot = null;
};

export const initNotificationBell = (enabled: boolean): void => {
    active = enabled;
    setStyles(enabled);

    if (!enabled) {
        disconnectObserver();
        return;
    }

    const root = document.querySelector(MASTHEAD);

    if (root === observedRoot && root?.isConnected) {
        return;
    }

    disconnectObserver();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer = new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true });
    detachBells();
};
