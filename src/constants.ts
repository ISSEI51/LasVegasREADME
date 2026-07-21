import type { SlotResult } from "./types.js";

/** The only palette this package will ever need. */
export const PALETTE = {
  voidBlack: "#050008",
  deepPurple: "#17001f",
  darkRed: "#33000f",
  bloodRed: "#650018",
  neonRed: "#ff003c",
  neonPink: "#ff2bd6",
  amber: "#ffae00",
  gold: "#ffd700",
  paleGold: "#fff3a6",
  white: "#ffffff",
} as const;

export const FONT_STACK = "Arial, Helvetica, Verdana, sans-serif";
export const MONO_STACK = "'Courier New', Courier, monospace";

/** Every outcome is a win. That is the whole business model. */
export const SLOT_OUTCOMES: readonly SlotResult[] = [
  { symbol: "777", title: "777 JACKPOT", subtitle: "MEGA README JACKPOT" },
  { symbol: "BUG", title: "BUG JACKPOT", subtitle: "PRODUCTION INCIDENT BONUS" },
  { symbol: "ANY", title: "ANY JACKPOT", subtitle: "TYPE SAFETY HAS LEFT THE BUILDING" },
  { symbol: "NULL", title: "NULL JACKPOT", subtitle: "NOTHING HAS NEVER LOOKED THIS EXPENSIVE" },
  { symbol: "$$$", title: "$$$ JACKPOT", subtitle: "REVENUE IS A STATE OF MIND" },
  { symbol: "TODO", title: "TODO JACKPOT", subtitle: "COMING SOON SINCE FOREVER" },
] as const;

/** Directory that always receives the generated art. */
export const ASSETS_DIRECTORY_NAME = "readme-casino";

export const SVG_FILE_NAMES = {
  casino: "casino.svg",
  slots: "slots.svg",
  stats: "stats.svg",
  jackpot: "jackpot.svg",
  marquee: "marquee.svg",
} as const;

/** Card suits drawn as text glyphs: universally available, no emoji fonts. */
export const SUITS = ["♠", "♥", "♦", "♣"] as const;

export const MARQUEE_TEXT = "★ JACKPOT ★ CODE ★ CHAOS ★ BUGS ★ 777 ★";
