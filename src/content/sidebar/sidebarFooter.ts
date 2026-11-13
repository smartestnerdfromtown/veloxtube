const FOOTER_SELECTOR = "#guide-content ytd-guide-renderer #footer";
const FOOTER_CSS = `${FOOTER_SELECTOR} { display: none !important; }`;
const GUIDE_ROOT = "#guide-wrapper";

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoot: Element | null = null;
let scheduled = false;
let active = false;

const detachFooters = (): void => {
    scheduled = false;

    if (!active) {
        return;
    }

    for (const footer of document.querySelectorAll(FOOTER_SELECTOR)) {
        footer.remove();
    }
};

const scheduleCleanup = (): void => {
    if (scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(detachFooters);
};

const setFooterStyles = (enabled: boolean): void => {
    if (!enabled) {
        styleElement?.remove();
        styleElement = null;
        return;
    }

    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = FOOTER_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

const disconnectObserver = (): void => {
    observer?.disconnect();
    observer = null;
    observedRoot = null;
};

export const initSidebarFooter = (enabled: boolean): void => {
    active = enabled;
    setFooterStyles(enabled);

    if (!enabled) {
        disconnectObserver();
        return;
    }

    const root = document.querySelector(GUIDE_ROOT);

    if (root === observedRoot && root?.isConnected) {
        return;
    }

    disconnectObserver();

    if (!root) {
        return;
    }

    observer = new MutationObserver(scheduleCleanup);
    observedRoot = root;
    observer.observe(root, { childList: true, subtree: true });
    scheduleCleanup();
};
