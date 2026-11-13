const CHANNEL_PAGE = 'ytd-browse[page-subtype="channels"]';
const HEADER_CONTAINERS = "yt-page-header-renderer, ytd-c4-tabbed-header-renderer";
const SHELF_CONTAINER = "ytd-recognition-shelf-renderer";

const JOIN_WRAPPERS = ":is(button-view-model, yt-button-view-model, ytd-button-renderer)";
const JOIN_LABEL = '[aria-label*="Join" i]';
const JOIN_MARKERS = `:is(${JOIN_LABEL}, .ytSpecButtonShapeNextTonal.ytSpecButtonShapeNextIconLeading, .yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--icon-leading)`;

const JOIN_TARGETS = ["#sponsor-button", JOIN_LABEL, `${JOIN_WRAPPERS}:has(${JOIN_MARKERS})`];
const JOIN_TARGETS_SELECTOR = JOIN_TARGETS.join(",\n");

const SHELF_TARGETS = ["#action-button", JOIN_LABEL];
const SHELF_TARGETS_SELECTOR = SHELF_TARGETS.join(",\n");

const HEADER_SCOPE = `${CHANNEL_PAGE} :is(${HEADER_CONTAINERS})`;
const SHELF_SCOPE = `${CHANNEL_PAGE} ${SHELF_CONTAINER}`;

const JOIN_SELECTOR = [
    ...JOIN_TARGETS.map((target) => `${HEADER_SCOPE} ${target}`),
    ...SHELF_TARGETS.map((target) => `${SHELF_SCOPE} ${target}`),
].join(",\n");

const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

const JOIN_ROOTS = `:is(${HEADER_CONTAINERS}, ${SHELF_CONTAINER}, yt-flexible-actions-view-model)`;

const FEED_ITEM = ":is(ytd-rich-item-renderer, ytd-video-renderer, yt-lockup-view-model)";

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachJoinButtons = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    if (!observedRoot?.isConnected) {
        observedRoot = document.querySelector(CHANNEL_PAGE);
    }

    if (!observedRoot) {
        return;
    }

    for (const header of observedRoot.querySelectorAll(HEADER_CONTAINERS)) {
        for (const joinButton of header.querySelectorAll(JOIN_TARGETS_SELECTOR)) {
            joinButton.remove();
        }
    }

    for (const shelf of observedRoot.querySelectorAll(SHELF_CONTAINER)) {
        for (const joinButton of shelf.querySelectorAll(SHELF_TARGETS_SELECTOR)) {
            joinButton.remove();
        }
    }
};

const scheduleDetach = (): void => {
    if (!active || scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(detachJoinButtons);
};

const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        if (record.target instanceof Element && record.target.closest(JOIN_ROOTS)) {
            scheduleDetach();
            return;
        }

        for (const node of record.addedNodes) {
            if (!(node instanceof Element) || node.matches(FEED_ITEM)) {
                continue;
            }

            if (node.matches(JOIN_ROOTS) || node.querySelector(JOIN_ROOTS)) {
                scheduleDetach();
                return;
            }
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
    styleElement.textContent = JOIN_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const stopObserving = (): void => {
    observer?.disconnect();
    observer = null;
    observedRoot = null;
    scheduled = false;
};

export const initChannelJoinButton = (enabled: boolean): void => {
    active = enabled;
    setStyles(enabled);

    if (!enabled) {
        stopObserving();
        return;
    }

    const root = document.querySelector(CHANNEL_PAGE);

    if (root === observedRoot && root?.isConnected) {
        detachJoinButtons();
        return;
    }

    stopObserving();

    if (!root) {
        return;
    }

    observedRoot = root;
    observer = new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true });
    detachJoinButtons();
};
