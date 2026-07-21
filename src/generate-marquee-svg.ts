import { FONT_STACK, MARQUEE_TEXT, PALETTE } from "./constants.js";
import { escapeXml } from "./utils/escape-xml.js";
import { goldGradient, neonFilter, round, svgRoot } from "./svg-parts.js";

const WIDTH = 1200;
const HEIGHT = 150;
const FONT_SIZE = 40;
const LETTER_SPACING = 4;

/** Horizontal chase-light banner with scrolling text. */
export function generateMarqueeSvg(): string {
  const text = escapeXml(MARQUEE_TEXT);
  // Approximate advance width; exactness is not required for a seamless loop,
  // only consistency between the tile width and the scroll distance.
  const tileWidth = round(MARQUEE_TEXT.length * (FONT_SIZE * 0.62 + LETTER_SPACING) + 80);
  const copies = Math.ceil((WIDTH + tileWidth) / tileWidth) + 1;

  const defs = [
    `<defs>`,
    `<linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${PALETTE.darkRed}"/>`,
    `<stop offset="50%" stop-color="${PALETTE.voidBlack}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.deepPurple}"/>`,
    `</linearGradient>`,
    goldGradient("mgold"),
    goldGradient("mgoldText", false),
    neonFilter("mneon", PALETTE.neonPink, 6),
    neonFilter("mglow", PALETTE.gold, 4),
    `<clipPath id="mclip"><rect x="0" y="46" width="${WIDTH}" height="58"/></clipPath>`,
    `</defs>`,
  ].join("");

  const scrollingText = [
    `<g clip-path="url(#mclip)">`,
    `<g>`,
    `<animateTransform attributeName="transform" type="translate" values="0,0;${round(-tileWidth)},0" dur="12s" repeatCount="indefinite"/>`,
    Array.from({ length: copies }, (_unused, index) =>
      `<text x="${round(index * tileWidth)}" y="90" font-family="${FONT_STACK}" font-size="${FONT_SIZE}" font-weight="bold" letter-spacing="${LETTER_SPACING}" fill="url(#mgoldText)" stroke="${PALETTE.neonRed}" stroke-width="1.2" paint-order="stroke" filter="url(#mglow)">${text}</text>`,
    ).join(""),
    `</g>`,
    `</g>`,
  ].join("");

  /** A row of bulbs whose lit phase travels left to right. */
  const bulbRow = (y: number, phaseOffset: number): string => {
    const spacing = 30;
    const count = Math.floor(WIDTH / spacing);
    const duration = 1.5;
    const phases = 5;
    return Array.from({ length: count }, (_unused, index) => {
      const cx = round(spacing / 2 + index * spacing);
      const begin = round(-(((index + phaseOffset) % phases) * duration) / phases);
      return (
        `<g>` +
        `<circle cx="${cx}" cy="${y}" r="12" fill="${PALETTE.amber}" opacity="0.18">` +
        `<animate attributeName="opacity" values="0.45;0.03;0.03;0.03;0.03" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `</circle>` +
        `<circle cx="${cx}" cy="${y}" r="6" fill="${PALETTE.gold}" stroke="${PALETTE.white}" stroke-width="1" stroke-opacity="0.5" opacity="0.9">` +
        `<animate attributeName="opacity" values="1;0.35;0.2;0.35;0.7" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `<animate attributeName="fill" values="${PALETTE.white};${PALETTE.gold};${PALETTE.amber};${PALETTE.gold};${PALETTE.paleGold}" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `</circle>` +
        `</g>`
      );
    }).join("");
  };

  const body = [
    defs,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mbg)"/>`,
    `<rect x="4" y="4" width="${WIDTH - 8}" height="${HEIGHT - 8}" rx="14" fill="none" stroke="url(#mgold)" stroke-width="6"/>`,
    `<rect x="0" y="40" width="${WIDTH}" height="70" fill="${PALETTE.bloodRed}" opacity="0.35"/>`,
    scrollingText,
    bulbRow(22, 0),
    bulbRow(128, 3),
    `<rect x="0" y="40" width="${WIDTH}" height="1.5" fill="${PALETTE.gold}" opacity="0.6"/>`,
    `<rect x="0" y="108" width="${WIDTH}" height="1.5" fill="${PALETTE.gold}" opacity="0.6"/>`,
  ].join("");

  return svgRoot(WIDTH, HEIGHT, body, "Casino marquee lights");
}
