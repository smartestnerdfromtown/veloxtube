import { initHomeShorts } from "./homeShorts";
import { initSearchShorts } from "./searchShorts";

const HOME_CLASS = "veloxtube-home";
const SEARCH_CLASS = "veloxtube-search";
const KEYS = ["homeShortsEnabled", "searchShortsEnabled"] as const;

type Flags = { homeShortsEnabled: boolean; searchShortsEnabled: boolean };

const DEFAULTS: Flags = { homeShortsEnabled: true, searchShortsEnabled: true };

let flags: Flags = DEFAULTS;
let scheduled = false;

const apply = (): void => {
  scheduled = false;
  document.documentElement.classList.toggle(HOME_CLASS, flags.homeShortsEnabled);
  document.documentElement.classList.toggle(SEARCH_CLASS, flags.searchShortsEnabled);
  initHomeShorts(flags.homeShortsEnabled);
  initSearchShorts(flags.searchShortsEnabled);
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
