const SECTION =
  "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]), ytd-rich-section-renderer:has(ytd-reel-shelf-renderer), ytd-rich-section-renderer:has(ytm-shorts-lockup-view-model)";
const SHELF =
  "ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer, ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model)";
const ITEM =
  'ytd-rich-item-renderer:has(ytm-shorts-lockup-view-model), ytd-rich-item-renderer:has(a[href^="/shorts/"]), ytd-reel-item-renderer';
const MATCHER = `${SECTION}, ${SHELF}, ${ITEM}`;

const remove = (element: Element): void => {
  (element.closest("ytd-rich-section-renderer") ?? element).remove();
};

const purge = (root: Element): void => {
  if (root.matches(MATCHER)) {
    remove(root);
    return;
  }

  for (const element of root.querySelectorAll(MATCHER)) {
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

export const initHomeShorts = (): void => {
  const contents = document.querySelector(
    'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents',
  );

  if (contents === target) {
    return;
  }

  observer?.disconnect();
  target = contents;

  if (!contents) {
    return;
  }

  purge(contents);

  observer ??= new MutationObserver(onMutations);
  observer.observe(contents, { childList: true });
};
