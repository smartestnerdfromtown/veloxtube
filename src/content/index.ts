import { initHomeShorts } from "./homeShorts";
import { initSearchShorts } from "./searchShorts";
import { initSidebarShorts } from "./sidebarShorts";
import { initSidebarFooter } from "./sidebarFooter";
import { initTopLogo } from "./topLogo";

const HOME_CLASS = "veloxtube-home";
const SEARCH_CLASS = "veloxtube-search";
const SIDEBAR_CLASS = "veloxtube-sidebar";
const KEYS = [
  "homeShortsEnabled",
  "searchShortsEnabled",
  "sidebarShortsEnabled",
  "sidebarFooterEnabled",
] as const;

type Flags = {
  homeShortsEnabled: boolean;
  searchShortsEnabled: boolean;
  sidebarShortsEnabled: boolean;
  sidebarFooterEnabled: boolean;
};

const DEFAULTS: Flags = {
  homeShortsEnabled: true,
  searchShortsEnabled: true,
  sidebarShortsEnabled: true,
  sidebarFooterEnabled: true,
};

let flags: Flags = DEFAULTS;
let scheduled = false;

const apply = (): void => {
  scheduled = false;
  document.documentElement.classList.toggle(HOME_CLASS, flags.homeShortsEnabled);
  document.documentElement.classList.toggle(SEARCH_CLASS, flags.searchShortsEnabled);
  document.documentElement.classList.toggle(SIDEBAR_CLASS, flags.sidebarShortsEnabled);
  initHomeShorts(flags.homeShortsEnabled);
  initSearchShorts(flags.searchShortsEnabled);
  initSidebarShorts(flags.sidebarShortsEnabled);
  initSidebarFooter(flags.sidebarFooterEnabled);
  initTopLogo();
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
