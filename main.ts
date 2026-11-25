// Entry for "Post the Meme, Win the Feed" (make.fun).
//
// The entry itself is the post on X — this program does no posting.
// Its only job is to hand the gate the post's address: copy POST.json
// from the repository root (the bot dir) into the output directory.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const src = join(botDir, "POST.json");
const dest = join(outputDir, "POST.json");

// Read the source up front so a missing or unreadable POST.json gets
// its own distinct error, separate from a copy failure.
let sourceBytes: Buffer;
try {
  sourceBytes = readFileSync(src);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(
    `post-the-meme: source POST.json is missing or unreadable at ${src}: ${reason}`,
  );
  process.exit(1);
}

try {
  mkdirSync(outputDir, { recursive: true });
  copyFileSync(src, dest);
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(`post-the-meme: failed to copy ${src} -> ${dest}: ${reason}`);
  process.exit(1);
}

// Verify the copy: read back both files and require an exact byte match.
try {
  const destBytes = readFileSync(dest);
  const freshSourceBytes = readFileSync(src);
  if (!destBytes.equals(freshSourceBytes) || !destBytes.equals(sourceBytes)) {
    console.error(
      `post-the-meme: verification failed: ${dest} does not match ${src} byte for byte`,
    );
    process.exit(1);
  }
} catch (err) {
  const reason = err instanceof Error ? err.message : String(err);
  console.error(
    `post-the-meme: verification failed: could not read back ${src} and ${dest} to compare them: ${reason}`,
  );
  process.exit(1);
}
