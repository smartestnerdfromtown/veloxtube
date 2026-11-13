const CHANNEL_PAGE = 'ytd-browse[page-subtype="channels"]';
const CHANNEL_ACTIONS = `${CHANNEL_PAGE} yt-page-header-renderer yt-flexible-actions-view-model button-view-model`;

const JOIN_SELECTOR = [
    `${CHANNEL_PAGE} yt-page-header-renderer #sponsor-button`,
    `${CHANNEL_PAGE} ytd-c4-tabbed-header-renderer #sponsor-button`,
    `${CHANNEL_ACTIONS}:has(button[aria-label*="Join" i])`,
    `${CHANNEL_ACTIONS}:has(button.ytSpecButtonShapeNextTonal.ytSpecButtonShapeNextIconLeading)`,
    `${CHANNEL_ACTIONS}:has(button.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--icon-leading)`,
    `${CHANNEL_PAGE} ytd-recognition-shelf-renderer #action-button`,
].join(",\n");

const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

const JOIN_ROOTS =
    ":is(yt-page-header-renderer, ytd-recognition-shelf-renderer, yt-flexible-actions-view-model)";

let styleElement: HTMLStyleElement | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachJoinButtons = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    for (const joinButton of document.querySelectorAll(JOIN_SELECTOR)) {
        joinButton.remove();
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
        for (const node of record.addedNodes) {
            if (
                node instanceof Element &&
                (node.matches(JOIN_ROOTS) || node.querySelector(JOIN_ROOTS))
            ) {
                scheduleDetach();
                return;
            }
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
    observer.observe(root, { childList: true, subtree: true });
    detachJoinButtons();
};
