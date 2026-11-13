import { copyFile, mkdir, readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("src/manifest.json", "utf8"));
const name = manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const file = `${name}-${manifest.version}.zip`;

await mkdir("released", { recursive: true });
await copyFile(`web-ext-artifacts/${file}`, `released/${file}`);
console.log(`released/${file}`);
