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
}: CleanerOptions): ((enabled: boolean) => void) => {
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
      if (element.isConnected) {
        remove(element);
      }
    }
  };

  let observer: MutationObserver | undefined;
  let target: Element | null = null;
  let pending: Element[] = [];
  let scheduled = false;

  const flush = (): void => {
    scheduled = false;

    if (!observer) {
      pending = [];
      return;
    }

    const nodes = pending;
    pending = [];

    for (const node of nodes) {
      if (node.isConnected) {
        purge(node);
      }
    }
  };

  const onMutations = (records: MutationRecord[]): void => {
    let added = false;

    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) {
          pending.push(node);
          added = true;
        }
      }
    }

    if (!added || scheduled) {
      return;
    }

    scheduled = true;
    queueMicrotask(flush);
  };

  return (enabled: boolean): void => {
    if (!enabled) {
      observer?.disconnect();
      observer = undefined;
      target = null;
      pending = [];
      return;
    }

    const root = document.querySelector(container);

    if (root === target && (!root || root.isConnected)) {
      return;
    }

    observer?.disconnect();
    target = root;
    pending = [];

    if (!root) {
      observer = undefined;
      return;
    }

    purge(root);

    observer ??= new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree });
  };
};
