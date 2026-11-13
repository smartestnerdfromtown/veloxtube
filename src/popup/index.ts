const KEYS = [
    "homeShortsEnabled",
    "searchShortsEnabled",
    "sidebarShortsEnabled",
    "sidebarFooterEnabled",
    "topLogoEnabled",
    "notificationBellEnabled",
    "topicBarEnabled",
    "moreFromYouTubeEnabled",
    "exploreMenuEnabled",
    "inFeedAdsEnabled",
] as const;

type Key = (typeof KEYS)[number];

const DEFAULTS: Record<Key, boolean> = {
    homeShortsEnabled: true,
    searchShortsEnabled: true,
    sidebarShortsEnabled: true,
    sidebarFooterEnabled: true,
    topLogoEnabled: true,
    notificationBellEnabled: true,
    topicBarEnabled: true,
    moreFromYouTubeEnabled: true,
    exploreMenuEnabled: true,
    inFeedAdsEnabled: true,
};

const getInput = (key: Key): HTMLInputElement => {
    const input = document.getElementById(key);

    if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Missing popup input: ${key}`);
    }

    return input;
};

const inputs = KEYS.map((key) => [key, getInput(key)] as const);

const reloadYouTubeTab = async (): Promise<void> => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (tab?.id !== undefined && tab.url?.startsWith("https://www.youtube.com")) {
        await browser.tabs.reload(tab.id);
    }
};

void browser.storage.local.get([...KEYS]).then((stored) => {
    for (const [key, input] of inputs) {
        input.checked = (stored[key] as boolean | undefined) ?? DEFAULTS[key];
    }
});

for (const [key, input] of inputs) {
    input.addEventListener("change", () => {
        void browser.storage.local.set({ [key]: input.checked }).then(reloadYouTubeTab);
    });
}
