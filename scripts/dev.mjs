import { spawn } from "node:child_process";

const webExtArgs = [
  "run",
  "--source-dir=dist",
  "--browser-console",
  "--pref=nimbus.validation.enabled=false",
  "--pref=browser.search.suggest.enabled=false",
];

const children = [
  spawn("node", ["scripts/build.mjs", "--watch"], { stdio: "inherit" }),
  spawn("web-ext", webExtArgs, { stdio: "inherit" }),
];

const stop = () => {
  for (const child of children) {
    child.kill();
  }
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
