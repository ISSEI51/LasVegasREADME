import { FONT_STACK, PALETTE, SUITS } from "./constants.js";
import type { CasinoContext } from "./types.js";
import { escapeXml } from "./utils/escape-xml.js";
import { fitFontSize } from "./utils/format.js";
import {
  bulbRing,
  coin,
  coinGradient,
  diamondPath,
  goldGradient,
  lightSweep,
  neonFilter,
  round,
  shadowFilter,
  starPath,
  svgRoot,
  sweepGradient,
} from "./svg-parts.js";

const WIDTH = 1000;
const HEIGHT = 500;

const REEL_TOP = 168;
const REEL_HEIGHT = 176;
const REEL_WIDTH = 210;
const REEL_GAP = 22;
const REEL_LEFT = 78;

/** A three-reel machine that has never once failed to pay out. */
export function generateSlotsSvg(context: CasinoContext): string {
  const { symbol, title, subtitle } = context.slot;
  const safeSymbol = escapeXml(symbol);
  const symbolFontSize = fitFontSize(symbol, REEL_WIDTH - 40, 92, { widthRatio: 0.7, minFontSize: 30 });
  const titleFontSize = fitFontSize(title, 720, 48, { widthRatio: 0.66, minFontSize: 22 });
  // Narrow enough that the longest subtitle still clears the corner coins.
  const subtitleFontSize = fitFontSize(subtitle, 760, 24, { widthRatio: 0.72, minFontSize: 13 });

  const defs = [
    `<defs>`,
    `<linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.deepPurple}"/>`,
    `<stop offset="60%" stop-color="${PALETTE.voidBlack}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.darkRed}"/>`,
    `</linearGradient>`,
    goldGradient("scabinet"),
    goldGradient("sgoldText", false),
    coinGradient("goldCoin"),
    `<linearGradient id="spanel" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.neonRed}"/>`,
    `<stop offset="55%" stop-color="${PALETTE.bloodRed}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.darkRed}"/>`,
    `</linearGradient>`,
    // Reel symbols get their own gradient: the bevel gold's dark end stops turn
    // short strings like "$$$" muddy.
    `<linearGradient id="sreelText" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.paleGold}"/>`,
    `<stop offset="45%" stop-color="${PALETTE.gold}"/>`,
    `<stop offset="78%" stop-color="${PALETTE.amber}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.paleGold}"/>`,
    `</linearGradient>`,
    `<linearGradient id="sreel" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="#1b0016"/>`,
    `<stop offset="12%" stop-color="#2a0020"/>`,
    `<stop offset="50%" stop-color="#43002f"/>`,
    `<stop offset="88%" stop-color="#2a0020"/>`,
    `<stop offset="100%" stop-color="#1b0016"/>`,
    `</linearGradient>`,
    sweepGradient("ssweep"),
    neonFilter("sneonGold", PALETTE.gold, 6),
    neonFilter("sneonPink", PALETTE.neonPink, 7),
    neonFilter("sneonRed", PALETTE.neonRed, 5),
    shadowFilter("sshadow", "#000000", 12, 8),
    `<clipPath id="sglass"><rect x="${REEL_LEFT - 14}" y="${REEL_TOP - 14}" width="${REEL_WIDTH * 3 + REEL_GAP * 2 + 28}" height="${REEL_HEIGHT + 28}" rx="16"/></clipPath>`,
    `</defs>`,
  ].join("");

  const cabinet = [
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sbg)"/>`,
    `<rect x="14" y="14" width="${WIDTH - 28}" height="${HEIGHT - 28}" rx="28" fill="#12000e" stroke="url(#scabinet)" stroke-width="10" filter="url(#sshadow)"/>`,
    `<rect x="34" y="34" width="${WIDTH - 68}" height="${HEIGHT - 68}" rx="20" fill="none" stroke="${PALETTE.gold}" stroke-width="1.5" opacity="0.45"/>`,
  ].join("");

  const topPanel = [
    `<rect x="150" y="46" width="700" height="86" rx="18" fill="url(#spanel)" stroke="url(#scabinet)" stroke-width="5"/>`,
    `<text x="500" y="106" font-family="${FONT_STACK}" font-size="54" font-weight="bold" letter-spacing="12" fill="${PALETTE.paleGold}" text-anchor="middle" filter="url(#sneonGold)">JACKPOT`,
    `<animate attributeName="fill" values="${PALETTE.paleGold};${PALETTE.white};${PALETTE.amber};${PALETTE.paleGold}" dur="1.2s" repeatCount="indefinite"/>`,
    `<animate attributeName="opacity" values="1;0.72;1" dur="1.2s" repeatCount="indefinite"/>`,
    `</text>`,
    `<path d="${starPath(186, 89, 17)}" fill="${PALETTE.gold}"><animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite"/></path>`,
    `<path d="${starPath(814, 89, 17)}" fill="${PALETTE.gold}"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite"/></path>`,
  ].join("");

  const reelX = (index: number): number => REEL_LEFT + index * (REEL_WIDTH + REEL_GAP);

  // Reel housings and ghost symbols. Drawn before the payline.
  const reelBodies = [0, 1, 2]
    .map((index) => {
      const x = reelX(index);
      const centerX = round(x + REEL_WIDTH / 2);
      const suit = SUITS[index % SUITS.length] ?? "♦";
      return [
        `<rect x="${x}" y="${REEL_TOP}" width="${REEL_WIDTH}" height="${REEL_HEIGHT}" rx="12" fill="url(#sreel)" stroke="url(#scabinet)" stroke-width="5"/>`,
        // Ghost symbols above and below sell the "reel just stopped" look.
        `<text x="${centerX}" y="${REEL_TOP + 34}" font-family="${FONT_STACK}" font-size="26" font-weight="bold" fill="${PALETTE.neonPink}" text-anchor="middle" opacity="0.28">${suit}</text>`,
        `<text x="${centerX}" y="${REEL_TOP + REEL_HEIGHT - 16}" font-family="${FONT_STACK}" font-size="26" font-weight="bold" fill="${PALETTE.neonPink}" text-anchor="middle" opacity="0.28">${suit}</text>`,
      ].join("");
    })
    .join("");

  // Winning symbols sit on top of the payline so they stay readable.
  const reelSymbols = [0, 1, 2]
    .map((index) => {
      const centerX = round(reelX(index) + REEL_WIDTH / 2);
      const centerY = round(REEL_TOP + REEL_HEIGHT / 2);
      return [
        `<text x="${centerX}" y="${round(centerY + symbolFontSize * 0.35)}" font-family="${FONT_STACK}" font-size="${symbolFontSize}" font-weight="bold" letter-spacing="2" fill="url(#sreelText)" stroke="${PALETTE.neonRed}" stroke-width="1.6" paint-order="stroke" text-anchor="middle" filter="url(#sneonGold)">${safeSymbol}`,
        `<animate attributeName="opacity" values="1;0.82;1" dur="${round(1.4 + index * 0.2)}s" repeatCount="indefinite"/>`,
        `</text>`,
      ].join("");
    })
    .join("");

  const winLineY = round(REEL_TOP + REEL_HEIGHT / 2);
  const reelsRight = REEL_LEFT + REEL_WIDTH * 3 + REEL_GAP * 2;
  const winLine = [
    // A <rect>, not a <line>: a zero-height bounding box collapses the filter
    // region and the glow (and the line with it) never renders.
    `<rect x="${REEL_LEFT - 26}" y="${round(winLineY - 2)}" width="${reelsRight - REEL_LEFT + 52}" height="4" rx="2" fill="${PALETTE.neonRed}" opacity="0.55" filter="url(#sneonRed)">`,
    `<animate attributeName="opacity" values="0.7;0.2;0.7" dur="1s" repeatCount="indefinite"/>`,
    `</rect>`,
    `<path d="${diamondPath(REEL_LEFT - 32, winLineY, 10, 15)}" fill="${PALETTE.neonRed}" filter="url(#sneonRed)"/>`,
    `<path d="${diamondPath(reelsRight + 32, winLineY, 10, 15)}" fill="${PALETTE.neonRed}" filter="url(#sneonRed)"/>`,
  ].join("");

  const lever = [
    `<g>`,
    `<rect x="884" y="196" width="26" height="150" rx="13" fill="#2a0016" stroke="url(#scabinet)" stroke-width="3"/>`,
    `<g>`,
    `<animateTransform attributeName="transform" type="rotate" values="0 897 340;-14 897 340;0 897 340" dur="3.2s" repeatCount="indefinite"/>`,
    `<rect x="890" y="200" width="14" height="140" rx="7" fill="url(#scabinet)"/>`,
    `<circle cx="897" cy="196" r="24" fill="${PALETTE.neonRed}" stroke="${PALETTE.gold}" stroke-width="4" filter="url(#sneonRed)"/>`,
    `<circle cx="890" cy="188" r="7" fill="${PALETTE.white}" opacity="0.55"/>`,
    `</g>`,
    `</g>`,
  ].join("");

  const coinSlot = [
    `<rect x="60" y="196" width="26" height="150" rx="13" fill="#2a0016" stroke="url(#scabinet)" stroke-width="3" opacity="0.9"/>`,
    coin(73, 150, 20, "$", 2.6),
    coin(920, 402, 22, "$", 3.1),
    coin(884, 428, 16, "7", 2.2),
    coin(84, 402, 22, "7", 2.8),
    coin(120, 428, 16, "$", 3.4),
  ].join("");

  const payout = [
    `<text x="500" y="396" font-family="${FONT_STACK}" font-size="${titleFontSize}" font-weight="bold" letter-spacing="6" fill="${PALETTE.neonPink}" text-anchor="middle" filter="url(#sneonPink)">${escapeXml(title)}`,
    `<animate attributeName="opacity" values="1;0.55;1" dur="1.5s" repeatCount="indefinite"/>`,
    `</text>`,
    `<text x="500" y="432" font-family="${FONT_STACK}" font-size="${subtitleFontSize}" font-weight="bold" letter-spacing="2" fill="${PALETTE.paleGold}" text-anchor="middle">${escapeXml(subtitle)}</text>`,
    `<text x="500" y="459" font-family="${FONT_STACK}" font-size="15" letter-spacing="3" fill="${PALETTE.gold}" text-anchor="middle" opacity="0.75">PAYLINE 1 · BET MAX · ODDS ${escapeXml(String(context.stats.jackpotNumber))}:1</text>`,
  ].join("");

  const body = [
    defs,
    cabinet,
    bulbRing(28, 28, WIDTH - 56, HEIGHT - 56, { spacing: 44, radius: 5.5, phases: 4, duration: 1.3 }),
    topPanel,
    reelBodies,
    winLine,
    reelSymbols,
    lightSweep("sglass", "ssweep", REEL_LEFT - 14, REEL_TOP - 14, REEL_WIDTH * 3 + REEL_GAP * 2 + 28, REEL_HEIGHT + 28, 4),
    lever,
    coinSlot,
    payout,
  ].join("");

  return svgRoot(WIDTH, HEIGHT, body, `Slot machine showing ${safeSymbol} ${safeSymbol} ${safeSymbol}`);
}
