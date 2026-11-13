const CHANNEL_ACTIONS = "yt-page-header-renderer yt-flexible-actions-view-model button-view-model";

const JOIN_SELECTOR = [
    "ytd-watch-flexy #sponsor-button",
    "yt-page-header-renderer #sponsor-button",
    "ytd-c4-tabbed-header-renderer #sponsor-button",
    `${CHANNEL_ACTIONS}:has(button[aria-label*="Join" i])`,
    `${CHANNEL_ACTIONS}:has(button.ytSpecButtonShapeNextTonal.ytSpecButtonShapeNextIconLeading)`,
    `${CHANNEL_ACTIONS}:has(button.yt-spec-button-shape-next--tonal.yt-spec-button-shape-next--icon-leading)`,
    'ytd-recognition-shelf-renderer #action-button:has(button[aria-label*="Join" i])',
].join(",\n");

const JOIN_CSS = `${JOIN_SELECTOR} {\n    display: none !important;\n}`;

const JOIN_ROOTS =
    ":is(yt-page-header-renderer, ytd-video-owner-renderer, ytd-recognition-shelf-renderer, yt-flexible-actions-view-model)";

let styleElement: HTMLStyleElement | null = null;
let observedRoot: Element | null = null;
let scheduled = false;

const detachJoinButtons = (): void => {
    scheduled = false;

    for (const joinButton of document.querySelectorAll(JOIN_SELECTOR)) {
        joinButton.remove();
    }
};

const scheduleDetach = (): void => {
    if (scheduled) {
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

const setStyles = (): void => {
    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = JOIN_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

export const initJoinButton = (): void => {
    setStyles();

    const root = document.documentElement;

    if (root === observedRoot && root !== null) {
        detachJoinButtons();
        return;
    }

    observer.disconnect();
    observedRoot = root;

    if (!root) {
        return;
    }

    observer.observe(root, { childList: true, subtree: true });
    detachJoinButtons();
};
