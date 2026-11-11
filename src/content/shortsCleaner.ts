type CleanerOptions = {
  container: string;
  matcher: string;
  subtree?: boolean;
  pruneSection?: boolean;
};

export const createShortsCleaner = ({
  container,
  matcher,
  subtree = false,
  pruneSection = false,
}: CleanerOptions): (() => void) => {
  const remove = (element: Element): void => {
    const richSection = element.closest("ytd-rich-section-renderer");

    if (richSection) {
      richSection.remove();
      return;
    }

    const section = pruneSection ? element.closest("ytd-item-section-renderer") : null;
    element.remove();

    if (section?.querySelector("#contents")?.childElementCount === 0) {
      section.remove();
    }
  };

  const purge = (root: Element): void => {
    if (root.matches(matcher)) {
      remove(root);
      return;
    }

    for (const element of root.querySelectorAll(matcher)) {
      remove(element);
    }
  };

  const onMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) {
          purge(node);
        }
      }
    }
  };

  let observer: MutationObserver | undefined;
  let target: Element | null = null;

  return (): void => {
    const root = document.querySelector(container);

    if (root === target) {
      return;
    }

    observer?.disconnect();
    target = root;

    if (!root) {
      return;
    }

    purge(root);

    observer ??= new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree });
  };
};
