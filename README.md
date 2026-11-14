# VeloxTube

VeloxTube is a minimal Firefox extension that hides selected interface elements on YouTube. Every change is controlled by a toggle in the toolbar popup. It is not an ad blocker and does not block video ads.

## Features

- Masthead: hides the top logo, notification bell, and microphone button.
- Home and search: hides Shorts.
- Sidebar: hides Shorts, the footer links, "More from YouTube", and the Explore menu.
- Feeds: hides the topic bar and in-feed sponsored cards.
- Video page: hides the Join, Thanks, and Share buttons.
- Channel page: hides the Join button.

## Privacy

VeloxTube does not collect, store, sell, or transmit personal data. There is no telemetry, analytics, tracking, or remote logging, and the extension makes no network requests of its own.

All preferences are boolean on/off flags saved with `browser.storage.local`. They stay in the local Firefox profile and are never sent anywhere. The extension reads and modifies the DOM only on YouTube pages. The popup reads the active tab's URL solely to decide whether to reload a YouTube tab after a setting changes; that value is not stored or transmitted.

The add-on's manifest declares `data_collection_permissions.required: ["none"]`, matching the behavior above.

## Permissions

- `storage` — saves the toggle states locally.
- `*://*.youtube.com/*` — lets the content script hide elements on YouTube pages.

No other permissions are requested.

## Installation

Load the built extension temporarily:

1. `npm install`
2. `npm run build`
3. Open `about:debugging#/runtime/this-firefox`, choose "Load Temporary Add-on", and select `dist/manifest.json`.

`npm run dev` starts a watch build and launches Firefox with the extension loaded.

## Source code

All code is written in TypeScript and bundled at build time. The extension does not download, evaluate, or execute remote code. The readable source is in `src/`; `npm run build` produces the release bundle.

## Disclaimer

VeloxTube is an independent project and is not affiliated with, endorsed by, or sponsored by YouTube or Google LLC. YouTube is a trademark of Google LLC.

## License

MIT. See [LICENSE](LICENSE).
