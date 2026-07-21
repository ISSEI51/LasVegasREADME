import { FONT_STACK, PALETTE, SUITS } from "./constants.js";
import type { CasinoContext } from "./types.js";
import { escapeXml } from "./utils/escape-xml.js";
import { fitFontSize, toDisplayName } from "./utils/format.js";
import {
  bulbRing,
  burstBackground,
  diamondPath,
  goldGradient,
  lightSweep,
  neonFilter,
  round,
  shadowFilter,
  starField,
  starPath,
  svgRoot,
  sweepGradient,
} from "./svg-parts.js";

const WIDTH = 1200;
const HEIGHT = 420;

/** The giant marquee sign that opens the README. */
export function generateCasinoSvg(context: CasinoContext): string {
  const displayName = toDisplayName(context.projectName);
  const safeName = escapeXml(displayName);
  // 860px keeps even a 40 character name clear of the corner suit clusters.
  const nameFontSize = fitFontSize(displayName, 860, 104, {
    widthRatio: 0.72,
    letterSpacing: 3,
    minFontSize: 20,
  });

  const defs = [
    `<defs>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.deepPurple}"/>`,
    `<stop offset="45%" stop-color="${PALETTE.voidBlack}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.darkRed}"/>`,
    `</linearGradient>`,
    `<radialGradient id="glowCore" cx="50%" cy="52%" r="62%">`,
    `<stop offset="0%" stop-color="${PALETTE.bloodRed}" stop-opacity="0.95"/>`,
    `<stop offset="60%" stop-color="${PALETTE.darkRed}" stop-opacity="0.55"/>`,
    `<stop offset="100%" stop-color="${PALETTE.voidBlack}" stop-opacity="0"/>`,
    `</radialGradient>`,
    goldGradient("goldFrame"),
    goldGradient("goldText", false),
    sweepGradient("sweep"),
    neonFilter("neonPink", PALETTE.neonPink, 8),
    neonFilter("neonGold", PALETTE.gold, 6),
    neonFilter("neonRed", PALETTE.neonRed, 5),
    shadowFilter("panelShadow"),
    `<clipPath id="signClip"><rect x="26" y="26" width="1148" height="368" rx="26"/></clipPath>`,
    `</defs>`,
  ].join("");

  const background = [
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>`,
    burstBackground(WIDTH, HEIGHT, 30, 0.1),
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowCore)"/>`,
    starField(WIDTH, HEIGHT, 46, { seed: 21, safeTop: 120, safeBottom: 300 }),
  ].join("");

  const frame = [
    `<rect x="10" y="10" width="1180" height="400" rx="30" fill="none" stroke="url(#goldFrame)" stroke-width="8" filter="url(#panelShadow)"/>`,
    `<rect x="26" y="26" width="1148" height="368" rx="26" fill="none" stroke="${PALETTE.neonRed}" stroke-width="3" opacity="0.85">`,
    `<animate attributeName="stroke" values="${PALETTE.neonRed};${PALETTE.neonPink};${PALETTE.gold};${PALETTE.neonRed}" dur="6s" repeatCount="indefinite"/>`,
    `</rect>`,
    `<rect x="40" y="40" width="1120" height="340" rx="20" fill="none" stroke="${PALETTE.gold}" stroke-width="1.5" opacity="0.5"/>`,
  ].join("");

  const bulbs = bulbRing(24, 24, 1152, 372, { spacing: 40, radius: 6.5, phases: 3, duration: 1.1 });

  const suitCluster = (cx: number, cy: number, flip: number): string =>
    SUITS.map((suit, index) => {
      const offsetX = cx + flip * (index % 2) * 34;
      const offsetY = cy + Math.floor(index / 2) * 52;
      const color = index === 1 || index === 2 ? PALETTE.neonRed : PALETTE.paleGold;
      return (
        `<text x="${round(offsetX)}" y="${round(offsetY)}" font-family="${FONT_STACK}" font-size="40" fill="${color}" text-anchor="middle" opacity="0.9">${suit}` +
        `<animate attributeName="opacity" values="0.95;0.35;0.95" dur="${2 + index * 0.4}s" repeatCount="indefinite"/>` +
        `</text>`
      );
    }).join("");

  const decorations = [
    suitCluster(96, 150, 1),
    suitCluster(1104, 150, -1),
    `<text x="96" y="300" font-family="${FONT_STACK}" font-size="52" font-weight="bold" fill="url(#goldText)" text-anchor="middle" filter="url(#neonGold)">777</text>`,
    `<text x="1104" y="300" font-family="${FONT_STACK}" font-size="52" font-weight="bold" fill="url(#goldText)" text-anchor="middle" filter="url(#neonGold)">$</text>`,
    `<path d="${diamondPath(600, 76, 14, 20)}" fill="${PALETTE.neonRed}" filter="url(#neonRed)"/>`,
    `<path d="${starPath(536, 78, 15)}" fill="${PALETTE.gold}" opacity="0.9"/>`,
    `<path d="${starPath(664, 78, 15)}" fill="${PALETTE.gold}" opacity="0.9"/>`,
  ].join("");

  const headline = [
    `<text x="600" y="146" font-family="${FONT_STACK}" font-size="30" font-weight="bold" letter-spacing="10" fill="${PALETTE.paleGold}" text-anchor="middle" filter="url(#neonGold)">★ WELCOME TO ★</text>`,

    `<g filter="url(#neonPink)">`,
    `<text x="600" y="248" font-family="${FONT_STACK}" font-size="${nameFontSize}" font-weight="bold" letter-spacing="3" fill="url(#goldText)" stroke="${PALETTE.neonRed}" stroke-width="2" paint-order="stroke" text-anchor="middle">${safeName}`,
    `<animate attributeName="opacity" values="1;0.86;1" dur="2.4s" repeatCount="indefinite"/>`,
    `</text>`,
    `</g>`,

    `<text x="600" y="300" font-family="${FONT_STACK}" font-size="38" font-weight="bold" letter-spacing="14" fill="${PALETTE.neonPink}" text-anchor="middle" filter="url(#neonPink)">CODE CASINO</text>`,

    `<rect x="330" y="322" width="540" height="2" fill="${PALETTE.gold}" opacity="0.65"/>`,

    `<text x="600" y="358" font-family="${FONT_STACK}" font-size="24" font-weight="bold" letter-spacing="6" fill="${PALETTE.gold}" text-anchor="middle">`,
    `<tspan fill="${PALETTE.neonRed}">OPEN 24 HOURS</tspan>`,
    `<tspan fill="${PALETTE.paleGold}" dx="18">◆</tspan>`,
    `<tspan fill="${PALETTE.gold}" dx="18">NO TESTS REQUIRED</tspan>`,
    `<animate attributeName="opacity" values="1;0.55;1" dur="1.8s" repeatCount="indefinite"/>`,
    `</text>`,
  ].join("");

  const body = [
    defs,
    background,
    frame,
    decorations,
    headline,
    bulbs,
    lightSweep("signClip", "sweep", 26, 26, 1148, 368, 5),
  ].join("");

  return svgRoot(WIDTH, HEIGHT, body, `${safeName} Code Casino sign`);
}
