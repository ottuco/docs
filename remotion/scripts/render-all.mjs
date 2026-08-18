import { execSync } from "node:child_process";
import { mkdirSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const REMOTION = resolve(here, "..");
const OUT = resolve(here, "../../static/video/autopay");
const SCREENS_SRC = resolve(here, "../../static/img/business/autopay");
const SCREENS_DST = resolve(REMOTION, "public/screens");

// The clips sequence the REAL product screenshots. Copy them into the Remotion
// public/ folder (gitignored) so staticFile("screens/…") resolves at render time.
mkdirSync(SCREENS_DST, { recursive: true });
cpSync(SCREENS_SRC, SCREENS_DST, { recursive: true });
mkdirSync(OUT, { recursive: true });

// [compositionId, posterFrame] — frame 50 sits inside every clip's first slide
const clips = [
  ["setup-subscription", 50],
  ["self-service-tour", 50],
  ["retry-to-recovery", 50],
  ["notification-emails", 50],
  ["add-card-flow", 50],
];

for (const [id, poster] of clips) {
  console.log(`▶ rendering ${id}`);
  execSync(`npx remotion render src/index.ts ${id} ${OUT}/${id}.mp4 --codec=h264 --crf=28`, { stdio: "inherit", cwd: REMOTION });
  execSync(`npx remotion still src/index.ts ${id} ${OUT}/${id}-poster.png --frame=${poster}`, { stdio: "inherit", cwd: REMOTION });
}
console.log(`✓ done → ${OUT}`);
