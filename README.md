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

1. `npm ci`
2. `npm run build`
3. Open `about:debugging#/runtime/this-firefox`, choose "Load Temporary Add-on", and select `dist/manifest.json`.

`npm run dev` starts a watch build and launches Firefox with the extension loaded.

## Building from source

The release archive contains bundled and minified JavaScript, so reviewers have to rebuild it from this repository to read the source.

The build was made on macOS 15.7.3 (arm64) with Node.js 26.13.0 and npm 11.20.0. Mozilla's default review environment is Ubuntu 24.04 (arm64) with Node.js 24.14.0 and npm 11.9.0. The build script uses only Node's standard library and esbuild, with no platform-specific steps, so the same commands work there. Node.js 24 or newer is required.

```bash
npm ci
npm run build
```

`npm ci` installs the exact dependency versions from `package-lock.json`, which has to stay in the source archive. `npm run build` clears `dist/`, writes the extension into it, packages that directory as `web-ext-artifacts/veloxtube-<version>.zip`, and copies the archive to `released/`.

To check a build, unpack the submitted zip and diff its files against `dist/`. Don't diff the zip files themselves: `web-ext` records timestamps, so two builds of identical code still produce different archives. The JavaScript output depends on the pinned esbuild version, not on the operating system or the Node.js version.

The build tools are esbuild 0.28.2 (MIT) and web-ext 10.8.0 (MPL-2.0), installed from npm as dev dependencies. No build step uses a commercial or web-based tool, and the extension loads no remote code at runtime. Package this repository as the source archive without `dist/`, `node_modules/`, `web-ext-artifacts/`, `released/`, or `.git/`; all of them are generated or local.

The version is read from `src/manifest.json`. Bump it there, and in `package.json`, before every upload, because AMO rejects a version number that already exists.

## Disclaimer

VeloxTube is an independent project and is not affiliated with, endorsed by, or sponsored by YouTube or Google LLC. YouTube is a trademark of Google LLC.

## License

MIT. See [LICENSE](LICENSE).
