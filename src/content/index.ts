const ROOT_CLASS = "veloxtube";

let scheduled = false;

const apply = (): void => {
  scheduled = false;
  document.documentElement.classList.add(ROOT_CLASS);
};

const schedule = (): void => {
  if (scheduled) {
    return;
  }

  scheduled = true;
  requestAnimationFrame(apply);
};

document.addEventListener("yt-navigate-finish", schedule, { passive: true });
document.addEventListener("yt-page-data-updated", schedule, { passive: true });

schedule();
