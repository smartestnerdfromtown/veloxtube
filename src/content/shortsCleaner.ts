type CleanerOptions = {
    container: string;
    matcher: string;
    subtree?: boolean;
    pruneRichSections?: boolean;
    pruneEmptySections?: boolean;
};



export const createShortsCleaner = ({
    container,
    matcher,
    subtree = false,
    pruneRichSections = false,
    pruneEmptySections = false,
}: CleanerOptions): ((enabled: boolean) => void) => {
    const remove = (element: Element): void => {
        if (pruneRichSections) {
            const richSection = element.closest("ytd-rich-section-renderer");

            if (richSection) {
                richSection.remove();
                return;
            }
        }

        const section = pruneEmptySections ? element.closest("ytd-item-section-renderer") : null;
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
    let pending = new Set<Element>();
    let scheduled = false;

    const flush = (): void => {
        scheduled = false;

        if (!observer) {
            pending.clear();
            return;
        }

        const targets = [...pending];
        const outermost = targets.filter(
            (target) => !targets.some((other) => other !== target && other.contains(target)),
        );
        pending.clear();

        for (const target of outermost) {
            if (target.isConnected) {
                purge(target);
            }
        }
    };

    const onMutations = (records: MutationRecord[]): void => {
        let added = false;

        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof Element) {
                    pending.add(node);
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
            pending.clear();
            return;
        }

        const root = document.querySelector(container);

        if (root === target && (!root || root.isConnected)) {
            return;
        }

        observer?.disconnect();
        target = root;
        pending.clear();

        if (!root) {
            observer = undefined;
            return;
        }

        purge(root);

        observer ??= new MutationObserver(onMutations);
        observer.observe(root, { childList: true, subtree });
    };
};
