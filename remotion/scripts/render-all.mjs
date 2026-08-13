import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../../static/video/autopay");
mkdirSync(OUT, { recursive: true });

// [compositionId, posterFrame]
const clips = [
  ["setup-subscription", 150],
  ["self-service-tour", 120],
  ["retry-to-recovery", 120],
  ["notification-emails", 60],
  ["add-card-flow", 150],
];

for (const [id, poster] of clips) {
  console.log(`▶ rendering ${id}`);
  execSync(
    `npx remotion render src/index.ts ${id} ${OUT}/${id}.mp4 --codec=h264 --crf=28`,
    { stdio: "inherit", cwd: resolve(here, "..") },
  );
  execSync(
    `npx remotion still src/index.ts ${id} ${OUT}/${id}-poster.png --frame=${poster}`,
    { stdio: "inherit", cwd: resolve(here, "..") },
  );
}
console.log(`✓ done → ${OUT}`);
