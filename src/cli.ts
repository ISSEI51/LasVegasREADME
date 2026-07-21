#!/usr/bin/env node
import path from "node:path";

import { ASSETS_DIRECTORY_NAME, SVG_FILE_NAMES } from "./constants.js";
import { runTakeover } from "./takeover.js";
import { isInteractive, line, paint, rewriteLine, sleep } from "./utils/terminal.js";

const BANNER = [
  "╔══════════════════════════════════════════╗",
  "║                                          ║",
  "║       🎰 README CASINO TAKEOVER 🎰       ║",
  "║                                          ║",
  "╚══════════════════════════════════════════╝",
];

const STEPS = [
  "Installing neon lights...",
  "Inflating repository valuation...",
  "Ignoring code quality...",
  "Selling technical debt to investors...",
  "Replacing README.md...",
];

const REEL_FACES = ["777", "BAR", "$$$", "BUG", "ANY"];

/** Short, skippable theatrics. Never delays more than ~1 second total. */
async function pause(milliseconds: number): Promise<void> {
  if (!isInteractive()) return;
  await sleep(milliseconds);
}

async function spinReels(symbol: string): Promise<void> {
  if (!isInteractive()) {
    line(paint(`[ ${symbol} ] [ ${symbol} ] [ ${symbol} ]`, "gold", "bold"));
    return;
  }
  for (let frame = 0; frame < 8; frame += 1) {
    const faces = [0, 1, 2].map((reel) => {
      const settled = frame >= 5 + reel;
      return settled ? symbol : (REEL_FACES[(frame * 3 + reel * 2) % REEL_FACES.length] ?? symbol);
    });
    rewriteLine(paint(`  [ ${faces.join(" ] [ ")} ]`, "gold", "bold"));
    await sleep(70);
  }
  rewriteLine(paint(`  [ ${symbol} ] [ ${symbol} ] [ ${symbol} ]`, "gold", "bold"));
  line();
}

async function progressBar(): Promise<void> {
  const width = 28;
  if (!isInteractive()) {
    line(paint(`  ${"█".repeat(width)} 100%`, "green", "bold"));
    return;
  }
  for (let step = 1; step <= width; step += 1) {
    const filled = "█".repeat(step);
    const empty = "░".repeat(width - step);
    const percent = String(Math.round((step / width) * 100)).padStart(3, " ");
    rewriteLine(`  ${paint(filled, "gold")}${paint(empty, "dim")} ${paint(`${percent}%`, "white", "bold")}`);
    await sleep(16);
  }
  line();
}

function reportFailure(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write("\n");
  line(paint("🎰 CASINO CONSTRUCTION FAILED", "red", "bold"));
  line();
  line("Unable to replace README.md:");
  line(paint(message, "red"));
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const projectRoot = process.cwd();

  line();
  for (const bannerLine of BANNER) {
    line(paint(bannerLine, "pink", "bold"));
  }
  line();

  // Work starts immediately; the animation below is only catching up with it.
  // The no-op catch defuses an unhandled rejection while we are still animating —
  // the real error still surfaces from the `await takeover` below.
  const takeover = runTakeover(projectRoot);
  takeover.catch(() => undefined);

  line(`${paint("Project detected:", "white")} ${paint(path.basename(projectRoot), "gold", "bold")}`);
  line();

  for (const step of STEPS) {
    line(`  ${paint("▸", "pink")} ${paint(step, "amber")}`);
    await pause(90);
  }
  line();

  // The filesystem work is already done by now; the show just caught up with it.
  const result = await takeover;

  await spinReels(result.context.slot.symbol);
  await progressBar();
  line();

  line(paint("  JACKPOT!", "gold", "bold"));
  line();
  line(paint("README.md has been completely replaced.", "white", "bold"));
  line(paint("No backup was created.", "red", "bold"));
  line(paint("Your repository is now legally a casino.", "pink", "bold"));
  line();
  line(paint(`  ${ASSETS_DIRECTORY_NAME}/`, "dim"));
  for (const fileName of Object.values(SVG_FILE_NAMES)) {
    line(paint(`    ${fileName}`, "dim"));
  }
  line();
}

try {
  await main();
} catch (error) {
  reportFailure(error);
}
