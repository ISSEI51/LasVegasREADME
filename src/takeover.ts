import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { ASSETS_DIRECTORY_NAME, SVG_FILE_NAMES } from "./constants.js";
import { generateCasinoSvg } from "./generate-casino-svg.js";
import { generateJackpotSvg } from "./generate-jackpot-svg.js";
import { generateMarqueeSvg } from "./generate-marquee-svg.js";
import { generateReadme } from "./generate-readme.js";
import { generateSlotsSvg } from "./generate-slots-svg.js";
import { generateStatsSvg } from "./generate-stats-svg.js";
import type { CasinoContext, RandomSource } from "./types.js";
import { createCasinoStats, createSlotResult } from "./utils/random.js";

export type TakeoverResult = {
  context: CasinoContext;
  assetsDirectory: string;
  readmePath: string;
  writtenFiles: string[];
};

/** Reads a directory name off an absolute path, rejecting nonsense inputs. */
export function resolveProjectName(projectRoot: string): string {
  const name = path.basename(path.resolve(projectRoot));
  if (name.length === 0 || name === "." || name === ".." || name === path.sep) {
    throw new Error(
      `Unable to determine a project name from the current directory (${projectRoot}). Run this inside a real project folder.`,
    );
  }
  return name;
}

/** Builds one run's worth of randomised casino data. */
export function createCasinoContext(projectName: string, random: RandomSource = Math.random): CasinoContext {
  return {
    projectName,
    stats: createCasinoStats(random),
    slot: createSlotResult(random),
  };
}

/** Ensures `readme-casino/` exists, failing loudly if a file squats the name. */
async function ensureAssetsDirectory(assetsDirectory: string): Promise<void> {
  try {
    const existing = await stat(assetsDirectory);
    if (!existing.isDirectory()) {
      throw new Error(
        `"${ASSETS_DIRECTORY_NAME}" already exists as a file. Remove or rename it and deal the cards again.`,
      );
    }
    return;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }
  await mkdir(assetsDirectory, { recursive: true });
}

/**
 * The whole show: generate art, then overwrite README.md unconditionally.
 * No prompts, no backup, no way back.
 */
export async function runTakeover(
  projectRoot: string,
  random: RandomSource = Math.random,
): Promise<TakeoverResult> {
  const projectName = resolveProjectName(projectRoot);
  const assetsDirectory = path.join(projectRoot, ASSETS_DIRECTORY_NAME);
  const readmePath = path.join(projectRoot, "README.md");
  const context = createCasinoContext(projectName, random);

  await ensureAssetsDirectory(assetsDirectory);

  const assets: Array<[string, string]> = [
    [SVG_FILE_NAMES.casino, generateCasinoSvg(context)],
    [SVG_FILE_NAMES.marquee, generateMarqueeSvg()],
    [SVG_FILE_NAMES.slots, generateSlotsSvg(context)],
    [SVG_FILE_NAMES.stats, generateStatsSvg(context)],
    [SVG_FILE_NAMES.jackpot, generateJackpotSvg(context)],
  ];

  const writtenAssets = await Promise.all(
    assets.map(async ([fileName, markup]) => {
      const target = path.join(assetsDirectory, fileName);
      await writeFile(target, markup, "utf8");
      return target;
    }),
  );

  await writeFile(readmePath, generateReadme(context), "utf8");

  return {
    context,
    assetsDirectory,
    readmePath,
    writtenFiles: [...writtenAssets, readmePath],
  };
}
