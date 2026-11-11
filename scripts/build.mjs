import { build, context } from "esbuild";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

const watch = process.argv.includes("--watch");

const entryPoints = (await readdir("src", { recursive: true }))
  .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"))
  .map((file) => join("src", file));

await mkdir("dist", { recursive: true });
await copyFile("src/manifest.json", "dist/manifest.json");

const options = {
  entryPoints,
  outdir: "dist",
  bundle: true,
  treeShaking: true,
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  target: "firefox142",
  format: "iife",
  legalComments: "none",
  logLevel: "info",
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
