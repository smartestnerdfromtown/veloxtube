const SECTION_CLASS = "veloxtube-explore-menu";
const SECTIONS_ROOT = "ytd-guide-renderer #sections";
const GUIDE_SECTION = "ytd-guide-section-renderer";
const SECTION_SELECTOR = `${SECTIONS_ROOT} > ${GUIDE_SECTION}`;
const MINI_GUIDE = "ytd-mini-guide-renderer";
const MINI_ENTRY_SELECTOR = `${MINI_GUIDE} #items > ytd-mini-guide-entry-renderer`;

const EXPLORE_LINK_SELECTOR = [
    'a[href="/gaming"]',
    'a[href^="/feed/"]',
    'a[href^="/podcasts"]',
    'a[href$="memberships"]',
    'a[href="/playables"]',
].join(",");

const EXPLORE_SECTION = `${SECTION_SELECTOR}:has(${EXPLORE_LINK_SELECTOR})`;
const EXPLORE_ENTRY = `${MINI_ENTRY_SELECTOR}:has(${EXPLORE_LINK_SELECTOR})`;

const EXPLORE_CSS = `${EXPLORE_SECTION},
${EXPLORE_ENTRY} {
  display: none !important;
}`;

let styleElement: HTMLStyleElement | null = null;
let observer: MutationObserver | null = null;
let observedRoots: Element[] = [];
let guideRoot: Element | null = null;
let sectionsRoot: Element | null = null;
let miniGuideRoot: Element | null = null;
const pendingTargets = new Set<Element>();
let scheduled = false;
let active = false;

const isExploreSection = (section: Element): boolean =>
    section.classList.contains(SECTION_CLASS) ||
    section.querySelector(EXPLORE_LINK_SELECTOR) !== null;

const detachSection = (section: Element): void => {
    section.classList.add(SECTION_CLASS);
    section.remove();
};

const getGuideRoot = (): Element | null => {
    if (guideRoot?.isConnected) {
        return guideRoot;
    }

    guideRoot = document.querySelector("#guide") ?? document.querySelector("#guide-wrapper");
    return guideRoot;
};

const getSectionsRoot = (): Element | null => {
    if (sectionsRoot?.isConnected) {
        return sectionsRoot;
    }

    sectionsRoot = getGuideRoot()?.querySelector(SECTIONS_ROOT) ?? null;
    return sectionsRoot;
};

const getMiniGuideRoot = (): Element | null => {
    if (miniGuideRoot?.isConnected) {
        return miniGuideRoot;
    }

    miniGuideRoot = document.querySelector(MINI_GUIDE);
    return miniGuideRoot;
};


const sweepSections = (root: Element | null, selector: string): void => {
    if (!root) {
        return;
    }

    for (const section of root.querySelectorAll(selector)) {
        if (isExploreSection(section)) {
            detachSection(section);
        }
    }
}

const sweepEntries = (root: Element | null, selector: string): void => {
    if (!root) {
        return;
    }

    for (const entry of root.querySelectorAll(selector)) {
        entry.remove();
    }
};


const detachExplore = (): void => {
    sweepSections(getSectionsRoot(), `:scope > ${GUIDE_SECTION}`);
    sweepEntries(getMiniGuideRoot(), EXPLORE_ENTRY);
};

const purge = (node: Element): void => {
    const entry = node.closest(EXPLORE_ENTRY);

    if (entry) {
        entry.remove();
        return;
    }

    const section = node.closest(SECTION_SELECTOR);

    if (section) {
        if (isExploreSection(section)) {
            detachSection(section);
        }

        return;
    }

    sweepSections(node, SECTION_SELECTOR);
    sweepEntries(node, EXPLORE_ENTRY);
};

const flush = (): void => {
    scheduled = false;

    if (!active) {
        pendingTargets.clear();
        return;
    }

    for (const target of pendingTargets) {
        if (target.isConnected) {
            purge(target);
        }
    }

    pendingTargets.clear();
};

const scheduleFlush = (): void => {
    if (scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(flush);
};

const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        for (const node of record.addedNodes) {
            if (node instanceof Element) pendingTargets.add(node);
        }
    }
    if (pendingTargets.size > 0) scheduleFlush();
};

const setStyles = (): void => {
    if (styleElement?.isConnected) {
        return;
    }

    styleElement = document.createElement("style");
    styleElement.textContent = EXPLORE_CSS;
    (document.head ?? document.documentElement).append(styleElement);
};

// Release every strong reference so detached sidebar nodes stay collectable.
const disconnectObserver = (): void => {
    observer?.disconnect();
    observer = null;
    observedRoots = [];
    guideRoot = null;
    sectionsRoot = null;
    miniGuideRoot = null;
    pendingTargets.clear();
};

//// It works, just do not touch it
const observeRoots = (): void => {
    const guide = getGuideRoot();
    const sections = getSectionsRoot();
    const miniGuide = getMiniGuideRoot();
    const roots = [guide, sections, miniGuide].filter((root): root is Element => root !== null);

    const unchanged =
        roots.length === observedRoots.length &&
        roots.every((root, index) => root === observedRoots[index] && root.isConnected);

    if (unchanged) {
        return;
    }

    disconnectObserver();

    if (roots.length === 0) {
        return;
    }

    observer = new MutationObserver(onMutations);
    observedRoots = roots;

    if (sections?.parentElement) {
        observer.observe(sections.parentElement, { childList: true });
    }

    if (sections) {
        observer.observe(sections, { childList: true, subtree: true });
    }

    if (miniGuide) {
        observer.observe(miniGuide, { childList: true, subtree: true });
    }

    detachExplore();
};
////

const teardown = (): void => {
    active = false;
    disconnectObserver();
    styleElement?.remove();
    styleElement = null;
};

export const initExploreMenu = (enabled: boolean): void => {
    if (!enabled) {
        teardown();
        return;
    }

    active = true;
    setStyles();
    observeRoots();
};
