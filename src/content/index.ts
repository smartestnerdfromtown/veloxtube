import { initHomeShorts } from "./home/homeShorts";
import { initSearchShorts } from "./search/searchShorts";
import { initSidebarShorts } from "./sidebar/sidebarShorts";
import { initSidebarFooter } from "./sidebar/sidebarFooter";
import { initTopLogo } from "./masthead/topLogo";
import { initNotificationBell } from "./masthead/notificationBell";
import { initMicButton } from "./masthead/micButton";

// Video Page
import { initVideoJoinButton } from "./video/joinButton";
import { initVideoThanksButton } from "./video/showSupport";

import { initChannelJoinButton } from "./channel/joinButton";
import { initTopicBar } from "./feeds/topicBar";
import { initMoreFromYouTube } from "./sidebar/moreFromYouTube";
import { initInFeedAds } from "./feeds/inFeedAds";
import { initExploreMenu } from "./sidebar/exploreMenu";

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

    // Video Page
    "videoJoinButtonEnabled",
    "videoThanksButtonEnabled",

    "channelJoinButtonEnabled",
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

    // Video Page
    videoJoinButtonEnabled: boolean;
    videoThanksButtonEnabled: boolean;

    channelJoinButtonEnabled: boolean;
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

    // Video Page
    videoJoinButtonEnabled: true,
    videoThanksButtonEnabled: true,

    channelJoinButtonEnabled: true,
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

    // Video Page
    initVideoJoinButton(flags.videoJoinButtonEnabled);
    initVideoThanksButton(flags.videoThanksButtonEnabled);

    initChannelJoinButton(flags.channelJoinButtonEnabled);
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
