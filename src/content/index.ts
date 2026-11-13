import { initHomeShorts } from "./homeShorts";
import { initSearchShorts } from "./searchShorts";
import { initSidebarShorts } from "./sidebarShorts";
import { initSidebarFooter } from "./sidebarFooter";
import { initTopLogo } from "./topLogo";
import { initNotificationBell } from "./notificationBell";
import { initMicButton } from "./micButton";
import { initTopicBar } from "./topicBar";
import { initMoreFromYouTube } from "./moreFromYouTube";
import { initInFeedAds } from "./inFeedAds";
import { initExploreMenu } from "./exploreMenu";

const HOME_CLASS = "veloxtube-home";
const SEARCH_CLASS = "veloxtube-search";
const SIDEBAR_CLASS = "veloxtube-sidebar";
const KEYS = [
    "homeShortsEnabled",
    "searchShortsEnabled",
    "sidebarShortsEnabled",
    "sidebarFooterEnabled",
    "topLogoEnabled",
    "notificationBellEnabled",
    "micButtonEnabled",
    "topicBarEnabled",
    "moreFromYouTubeEnabled",
    "exploreMenuEnabled",
    "inFeedAdsEnabled",
] as const;

type Flags = {
    homeShortsEnabled: boolean;
    searchShortsEnabled: boolean;
    sidebarShortsEnabled: boolean;
    sidebarFooterEnabled: boolean;
    topLogoEnabled: boolean;
    notificationBellEnabled: boolean;
    micButtonEnabled: boolean;
    topicBarEnabled: boolean;
    moreFromYouTubeEnabled: boolean;
    exploreMenuEnabled: boolean;
    inFeedAdsEnabled: boolean;
};

const DEFAULTS: Flags = {
    homeShortsEnabled: true,
    searchShortsEnabled: true,
    sidebarShortsEnabled: true,
    sidebarFooterEnabled: true,
    topLogoEnabled: true,
    notificationBellEnabled: true,
    micButtonEnabled: true,
    topicBarEnabled: true,
    moreFromYouTubeEnabled: true,
    exploreMenuEnabled: true,
    inFeedAdsEnabled: true,
};

let flags: Flags = DEFAULTS;
let scheduled = false;

const apply = (): void => {
    scheduled = false;
    initInFeedAds(flags.inFeedAdsEnabled);
    initMoreFromYouTube(flags.moreFromYouTubeEnabled);
    initExploreMenu(flags.exploreMenuEnabled);
    document.documentElement.classList.toggle(HOME_CLASS, flags.homeShortsEnabled);
    document.documentElement.classList.toggle(SEARCH_CLASS, flags.searchShortsEnabled);
    document.documentElement.classList.toggle(SIDEBAR_CLASS, flags.sidebarShortsEnabled);
    initHomeShorts(flags.homeShortsEnabled);
    initSearchShorts(flags.searchShortsEnabled);
    initSidebarShorts(flags.sidebarShortsEnabled);
    initSidebarFooter(flags.sidebarFooterEnabled);
    initTopLogo(flags.topLogoEnabled);
    initNotificationBell(flags.notificationBellEnabled);
    initMicButton(flags.micButtonEnabled);
    initTopicBar(flags.topicBarEnabled);
};

const schedule = (): void => {
    if (scheduled) {
        return;
    }

    scheduled = true;
    queueMicrotask(apply);
};

document.addEventListener("yt-navigate-finish", schedule, { passive: true });
document.addEventListener("yt-page-data-updated", schedule, { passive: true });

browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") {
        return;
    }

    let changed = false;

    for (const key of KEYS) {
        const change = changes[key];

        if (change) {
            flags = { ...flags, [key]: change.newValue as boolean };
            changed = true;
        }
    }

    if (changed) {
        schedule();
    }
});

void browser.storage.local.get([...KEYS]).then((stored) => {
    flags = { ...DEFAULTS, ...(stored as Partial<Flags>) };
    schedule();
});
