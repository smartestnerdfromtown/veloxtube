import { createShortsCleaner } from "./shortsCleaner";

const cleanFooter = createShortsCleaner({
  container: "ytd-guide-renderer",
  matcher: "#footer",
  subtree: true,
});

export const initSidebarFooter = (): void => {
  cleanFooter(true);
};
