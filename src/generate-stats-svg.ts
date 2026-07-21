import { FONT_STACK, MONO_STACK, PALETTE, SUITS } from "./constants.js";
import type { CasinoContext } from "./types.js";
import { escapeXml } from "./utils/escape-xml.js";
import { fitFontSize, formatCurrency, formatNumber } from "./utils/format.js";
import {
  bulbRing,
  burstBackground,
  diamondPath,
  goldGradient,
  neonFilter,
  round,
  shadowFilter,
  svgRoot,
} from "./svg-parts.js";

const WIDTH = 1000;
const HEIGHT = 620;
const ROW_TOP = 140;
const ROW_HEIGHT = 44;
const LABEL_X = 100;
const VALUE_X = 902;

type Row = { label: string; value: string; accent: "gold" | "pink" | "red" | "white" };

/** The high roller board: nine numbers, zero of them audited. */
export function generateStatsSvg(context: CasinoContext): string {
  const { stats } = context;

  const rows: Row[] = [
    { label: "REPOSITORY VALUATION", value: formatCurrency(stats.valuation), accent: "gold" },
    { label: "VIBE LEVEL", value: formatNumber(stats.vibeLevel), accent: "pink" },
    { label: "BUG MULTIPLIER", value: `×${formatNumber(stats.bugMultiplier)}`, accent: "red" },
    { label: "INVESTOR CONFIDENCE", value: `${stats.investorConfidence}%`, accent: "gold" },
    { label: "PRODUCTION READINESS", value: `ALLEGEDLY (${stats.productionConfidence}%)`, accent: "red" },
    { label: "CODE QUALITY", value: "JACKPOT", accent: "pink" },
    { label: "TEST COVERAGE", value: "TRUST ME", accent: "white" },
    { label: "TECHNICAL DEBT", value: `${formatCurrency(stats.technicalDebt)} · COMPOUNDING`, accent: "red" },
    { label: "REVENUE", value: "$0", accent: "gold" },
  ];

  const accentColor: Record<Row["accent"], string> = {
    gold: PALETTE.gold,
    pink: PALETTE.neonPink,
    red: PALETTE.neonRed,
    white: PALETTE.white,
  };
  const accentFilter: Record<Row["accent"], string> = {
    gold: "url(#tneonGold)",
    pink: "url(#tneonPink)",
    red: "url(#tneonRed)",
    white: "url(#tneonGold)",
  };

  const defs = [
    `<defs>`,
    `<linearGradient id="tbg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.voidBlack}"/>`,
    `<stop offset="50%" stop-color="${PALETTE.deepPurple}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.voidBlack}"/>`,
    `</linearGradient>`,
    `<linearGradient id="theader" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.bloodRed}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.darkRed}"/>`,
    `</linearGradient>`,
    goldGradient("tgold"),
    goldGradient("tgoldText", false),
    neonFilter("tneonGold", PALETTE.gold, 5),
    neonFilter("tneonPink", PALETTE.neonPink, 5),
    neonFilter("tneonRed", PALETTE.neonRed, 4),
    shadowFilter("tshadow", "#000000", 10, 6),
    `</defs>`,
  ].join("");

  const frame = [
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#tbg)"/>`,
    burstBackground(WIDTH, HEIGHT, 24, 0.06),
    `<rect x="12" y="12" width="${WIDTH - 24}" height="${HEIGHT - 24}" rx="24" fill="#0b0010" stroke="url(#tgold)" stroke-width="8" filter="url(#tshadow)"/>`,
    `<rect x="30" y="30" width="${WIDTH - 60}" height="${HEIGHT - 60}" rx="16" fill="none" stroke="${PALETTE.neonPink}" stroke-width="2" opacity="0.5"/>`,
  ].join("");

  const header = [
    `<rect x="44" y="48" width="${WIDTH - 88}" height="72" rx="14" fill="url(#theader)" stroke="url(#tgold)" stroke-width="4"/>`,
    // Sized to clear the LIVE badge on the left and the table number on the right.
    `<text x="${WIDTH / 2}" y="95" font-family="${FONT_STACK}" font-size="28" font-weight="bold" letter-spacing="5" fill="${PALETTE.paleGold}" text-anchor="middle" filter="url(#tneonGold)">HIGH ROLLER STATISTICS</text>`,
    // Blinking LIVE badge.
    `<g>`,
    `<rect x="66" y="66" width="88" height="36" rx="8" fill="${PALETTE.voidBlack}" stroke="${PALETTE.neonRed}" stroke-width="2"/>`,
    `<circle cx="88" cy="84" r="7" fill="${PALETTE.neonRed}" filter="url(#tneonRed)">`,
    `<animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite"/>`,
    `</circle>`,
    `<text x="106" y="91" font-family="${FONT_STACK}" font-size="19" font-weight="bold" letter-spacing="2" fill="${PALETTE.neonRed}">LIVE`,
    `<animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite"/>`,
    `</text>`,
    `</g>`,
    `<text x="${WIDTH - 72}" y="91" font-family="${MONO_STACK}" font-size="17" font-weight="bold" letter-spacing="1" fill="${PALETTE.gold}" text-anchor="end">TABLE ${escapeXml(String(context.stats.jackpotNumber))}</text>`,
  ].join("");

  const table = rows
    .map((row, index) => {
      const y = ROW_TOP + index * ROW_HEIGHT;
      const baseline = round(y + ROW_HEIGHT * 0.68);
      const stripe =
        index % 2 === 0
          ? `<rect x="44" y="${y}" width="${WIDTH - 88}" height="${ROW_HEIGHT}" fill="${PALETTE.neonPink}" opacity="0.05"/>`
          : "";
      const valueFontSize = fitFontSize(row.value, 420, 26, { widthRatio: 0.62, minFontSize: 13 });
      const suit = SUITS[index % SUITS.length] ?? "♠";
      const suitColor = index % 2 === 0 ? PALETTE.neonRed : PALETTE.paleGold;
      const suitY = round(y + ROW_HEIGHT * 0.66);
      return [
        stripe,
        // Card marks running down both margins.
        `<text x="66" y="${suitY}" font-family="${FONT_STACK}" font-size="22" fill="${suitColor}" text-anchor="middle" opacity="0.7">${suit}`,
        `<animate attributeName="opacity" values="0.85;0.2;0.85" dur="${round(2.3 + index * 0.29)}s" repeatCount="indefinite"/>`,
        `</text>`,
        `<text x="${WIDTH - 66}" y="${suitY}" font-family="${FONT_STACK}" font-size="22" fill="${suitColor}" text-anchor="middle" opacity="0.7">${suit}`,
        `<animate attributeName="opacity" values="0.2;0.85;0.2" dur="${round(2.3 + index * 0.29)}s" repeatCount="indefinite"/>`,
        `</text>`,
        `<path d="${diamondPath(84, round(y + ROW_HEIGHT / 2), 4, 6)}" fill="${accentColor[row.accent]}" opacity="0.85"/>`,
        `<text x="${LABEL_X}" y="${baseline}" font-family="${FONT_STACK}" font-size="23" font-weight="bold" letter-spacing="2" fill="${PALETTE.paleGold}">${escapeXml(row.label)}</text>`,
        `<text x="${VALUE_X}" y="${baseline}" font-family="${MONO_STACK}" font-size="${valueFontSize}" font-weight="bold" fill="${accentColor[row.accent]}" text-anchor="end" filter="${accentFilter[row.accent]}">${escapeXml(row.value)}`,
        `<animate attributeName="opacity" values="1;0.72;1" dur="${round(2 + index * 0.17)}s" repeatCount="indefinite"/>`,
        `</text>`,
        `<line x1="44" y1="${y + ROW_HEIGHT}" x2="${WIDTH - 44}" y2="${y + ROW_HEIGHT}" stroke="${PALETTE.gold}" stroke-width="1" opacity="0.22"/>`,
      ].join("");
    })
    .join("");

  const footerTop = ROW_TOP + rows.length * ROW_HEIGHT + 10;
  const footer = [
    `<rect x="44" y="${footerTop}" width="${WIDTH - 88}" height="42" rx="10" fill="${PALETTE.darkRed}" opacity="0.75" stroke="${PALETTE.gold}" stroke-width="1.5"/>`,
    `<text x="${WIDTH / 2}" y="${footerTop + 27}" font-family="${FONT_STACK}" font-size="15" font-weight="bold" letter-spacing="2" fill="${PALETTE.gold}" text-anchor="middle">BUGS: PREMIUM · AUDITED BY NOBODY · PAST PERFORMANCE GUARANTEES NOTHING</text>`,
  ].join("");

  const body = [
    defs,
    frame,
    bulbRing(26, 26, WIDTH - 52, HEIGHT - 52, { spacing: 52, radius: 4.5, phases: 3, duration: 1.6 }),
    header,
    table,
    footer,
  ].join("");

  return svgRoot(WIDTH, HEIGHT, body, "High roller statistics board");
}
