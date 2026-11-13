const MASTHEAD = "ytd-masthead";
const BELL_CONTAINER = `${MASTHEAD} #buttons`;
const BELL_TYPES = ":is(ytd-notification-topbar-button-renderer, #notification-button)";
const BELL_SELECTOR = `${BELL_CONTAINER} ${BELL_TYPES}`;
const BELL_CSS = `${BELL_SELECTOR} {\n    display: none !important;\n}`;

let styleElement: HTMLStyleElement | null = null;
let observedRoot: Element | null = null;
let bellContainer: Element | null = null;
let scheduled = false;
let active = false;

const detachBells = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    if (!bellContainer?.isConnected) {
        bellContainer = document.querySelector(BELL_CONTAINER);
    }

    if (!bellContainer) {
        return;
    }

    for (const bell of bellContainer.querySelectorAll(BELL_TYPES)) {
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
    styleElement.textContent = BELL_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const stopObserving = (): void => {
    observer.disconnect();
    observedRoot = null;
    bellContainer = null;
};

export const initNotificationBell = (enabled: boolean): void => {
    active = enabled;
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    const root = document.querySelector(MASTHEAD);

    if (root === observedRoot && root?.isConnected) {
        detachBells();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer.observe(root, { childList: true, subtree: true });
    detachBells();
};
