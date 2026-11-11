const KEYS = ["homeShortsEnabled", "searchShortsEnabled", "sidebarShortsEnabled"] as const;

type Key = (typeof KEYS)[number];

const DEFAULTS: Record<Key, boolean> = {
  homeShortsEnabled: true,
  searchShortsEnabled: true,
  sidebarShortsEnabled: true,
};

const getInput = (key: Key): HTMLInputElement => {
  const input = document.getElementById(key);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Missing popup input: ${key}`);
  }

  return input;
};

const inputs = KEYS.map((key) => [key, getInput(key)] as const);

void browser.storage.local.get([...KEYS]).then((stored) => {
  for (const [key, input] of inputs) {
    input.checked = (stored[key] as boolean | undefined) ?? DEFAULTS[key];
  }
});

for (const [key, input] of inputs) {
  input.addEventListener("change", () => {
    void browser.storage.local.set({ [key]: input.checked });
  });
}
