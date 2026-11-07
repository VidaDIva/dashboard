import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const swPath = resolve("dist/sw.js");
const pushPath = resolve("public/push-sw.js");

const sw = readFileSync(swPath, "utf8");
const push = readFileSync(pushPath, "utf8");

if (!sw.includes('addEventListener("push"')) {
  writeFileSync(swPath, `${sw}\n\n${push}\n`);
}
