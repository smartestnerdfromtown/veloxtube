import { build, context } from "esbuild";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const watch = process.argv.includes("--watch");

const entryPoints = (await readdir("src", { recursive: true }))
  .filter((file) => basename(file) === "index.ts" || file.endsWith(".css"))
  .map((file) => join("src", file));

if (!watch) {
  await rm("dist", { recursive: true, force: true });
}

await mkdir("dist", { recursive: true });
await copyFile("src/manifest.json", "dist/manifest.json");

const htmlFiles = (await readdir("src", { recursive: true })).filter((file) =>
  file.endsWith(".html"),
);

await Promise.all(
  htmlFiles.map(async (file) => {
    const target = join("dist", file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join("src", file), target);
  }),
);

const options = {
  entryPoints,
  outdir: "dist",
  outbase: "src",
  bundle: true,
  splitting: false,
  treeShaking: true,
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  target: "firefox142",
  format: "iife",
  charset: "utf8",
  drop: watch ? [] : ["console", "debugger"],
  legalComments: "none",
  logLevel: "info",
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
