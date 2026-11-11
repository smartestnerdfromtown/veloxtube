import { initHomeShorts } from "./homeShorts";
import { initSearchShorts } from "./searchShorts";

const ROOT_CLASS = "veloxtube";

let scheduled = false;

const apply = (): void => {
  scheduled = false;
  document.documentElement.classList.add(ROOT_CLASS);
  initHomeShorts();
  initSearchShorts();
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

schedule();
