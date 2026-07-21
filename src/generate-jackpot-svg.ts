import { FONT_STACK, MONO_STACK, PALETTE } from "./constants.js";
import type { CasinoContext } from "./types.js";
import { escapeXml } from "./utils/escape-xml.js";
import { fitFontSize, formatCurrency } from "./utils/format.js";
import {
  bulbRing,
  burstBackground,
  coin,
  coinGradient,
  goldGradient,
  lightSweep,
  neonFilter,
  round,
  scatter,
  shadowFilter,
  starField,
  svgRoot,
  sweepGradient,
} from "./svg-parts.js";

const WIDTH = 1200;
const HEIGHT = 400;

/** Closing ceremony: confetti, coins, and a completely fictional number. */
export function generateJackpotSvg(context: CasinoContext): string {
  const valuation = formatCurrency(context.stats.valuation);
  const valuationFontSize = fitFontSize(valuation, 760, 82, { widthRatio: 0.62, minFontSize: 30 });

  const defs = [
    `<defs>`,
    `<radialGradient id="jbg" cx="50%" cy="48%" r="70%">`,
    `<stop offset="0%" stop-color="${PALETTE.bloodRed}"/>`,
    `<stop offset="55%" stop-color="${PALETTE.darkRed}"/>`,
    `<stop offset="100%" stop-color="${PALETTE.voidBlack}"/>`,
    `</radialGradient>`,
    goldGradient("jgold"),
    goldGradient("jgoldText", false),
    coinGradient("goldCoin"),
    sweepGradient("jsweep"),
    neonFilter("jneonGold", PALETTE.gold, 8),
    neonFilter("jneonPink", PALETTE.neonPink, 7),
    neonFilter("jneonRed", PALETTE.neonRed, 5),
    shadowFilter("jshadow", "#000000", 12, 6),
    `<clipPath id="jclip"><rect x="18" y="18" width="${WIDTH - 36}" height="${HEIGHT - 36}" rx="22"/></clipPath>`,
    `</defs>`,
  ].join("");

  const background = [
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${PALETTE.voidBlack}"/>`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#jbg)"/>`,
    burstBackground(WIDTH, HEIGHT, 36, 0.09),
    starField(WIDTH, HEIGHT, 60, { seed: 77, safeTop: 40, safeBottom: 350 }),
    // Scrim: the rotating rays are far too busy to read gold text against.
    `<ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2}" rx="470" ry="180" fill="${PALETTE.voidBlack}" opacity="0.55"/>`,
    `<ellipse cx="${WIDTH / 2}" cy="${HEIGHT / 2}" rx="380" ry="150" fill="${PALETTE.voidBlack}" opacity="0.45"/>`,
  ].join("");

  // Confetti stays in the side gutters so the headline remains readable.
  const confetti = Array.from({ length: 54 }, (_unused, index) => {
    const x = round(scatter(index * 4.1 + 2) * WIDTH);
    const y = round(scatter(index * 6.7 + 13) * HEIGHT);
    if (x > 210 && x < WIDTH - 210 && y > 30 && y < HEIGHT - 40) return "";
    const size = round(6 + scatter(index * 3.3 + 5) * 8);
    const drift = round(2.4 + scatter(index * 2.9 + 7) * 3.2);
    const spin = round(2.2 + scatter(index * 5.1 + 9) * 4);
    const color =
      index % 4 === 0
        ? PALETTE.gold
        : index % 4 === 1
          ? PALETTE.paleGold
          : index % 4 === 2
            ? PALETTE.neonPink
            : PALETTE.amber;
    return [
      `<g transform="translate(${x},${y})"><g>`,
      `<animateTransform attributeName="transform" type="translate" values="0,0;0,${round(size * 2)};0,0" dur="${drift}s" repeatCount="indefinite"/>`,
      `<rect x="${round(-size / 2)}" y="${round(-size * 0.8)}" width="${size}" height="${round(size * 1.6)}" rx="2" fill="${color}" opacity="0.85">`,
      `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${spin}s" repeatCount="indefinite"/>`,
      `</rect>`,
      `</g></g>`,
    ].join("");
  }).join("");

  const coins = [
    coin(96, 118, 30, "$", 2.8),
    coin(158, 176, 22, "7", 3.4),
    coin(70, 236, 24, "$", 2.4),
    coin(1104, 118, 30, "$", 3.1),
    coin(1042, 176, 22, "7", 2.6),
    coin(1130, 236, 24, "$", 3.6),
    coin(200, 322, 20, "7", 3.0),
    coin(1000, 322, 20, "$", 2.7),
  ].join("");

  const headline = [
    // Solid pale gold, not the bevel gradient: the gradient's dark stops vanish
    // against the burst. The blink only dips to 0.72 so it stays legible.
    `<text x="${WIDTH / 2}" y="104" font-family="${FONT_STACK}" font-size="74" font-weight="bold" letter-spacing="12" fill="${PALETTE.paleGold}" stroke="${PALETTE.neonRed}" stroke-width="2.5" paint-order="stroke" text-anchor="middle" filter="url(#jneonGold)">MEGA JACKPOT`,
    `<animate attributeName="fill" values="${PALETTE.paleGold};${PALETTE.white};${PALETTE.gold};${PALETTE.paleGold}" dur="1.1s" repeatCount="indefinite"/>`,
    `<animate attributeName="opacity" values="1;0.85;1" dur="1.1s" repeatCount="indefinite"/>`,
    `</text>`,

    `<text x="${WIDTH / 2}" y="146" font-family="${FONT_STACK}" font-size="22" font-weight="bold" letter-spacing="9" fill="${PALETTE.paleGold}" text-anchor="middle">YOUR README IS NOW WORTH</text>`,

    `<text x="${WIDTH / 2}" y="${round(146 + 24 + valuationFontSize * 0.78)}" font-family="${MONO_STACK}" font-size="${valuationFontSize}" font-weight="bold" fill="${PALETTE.gold}" text-anchor="middle" filter="url(#jneonGold)">${escapeXml(valuation)}`,
    `<animate attributeName="fill" values="${PALETTE.gold};${PALETTE.paleGold};${PALETTE.amber};${PALETTE.gold}" dur="2.6s" repeatCount="indefinite"/>`,
    `</text>`,

    `<text x="${WIDTH / 2}" y="316" font-family="${FONT_STACK}" font-size="32" font-weight="bold" letter-spacing="8" fill="${PALETTE.neonPink}" text-anchor="middle" filter="url(#jneonPink)">THE HOUSE ALWAYS WINS`,
    `<animate attributeName="opacity" values="1;0.6;1" dur="1.9s" repeatCount="indefinite"/>`,
    `</text>`,

    `<text x="${WIDTH / 2}" y="356" font-family="${FONT_STACK}" font-size="19" font-weight="bold" letter-spacing="3" fill="${PALETTE.gold}" text-anchor="middle" opacity="0.9">YOUR CODE MAY BE BROKEN, BUT YOUR README IS RICH</text>`,
  ].join("");

  const frame = [
    `<rect x="8" y="8" width="${WIDTH - 16}" height="${HEIGHT - 16}" rx="26" fill="none" stroke="url(#jgold)" stroke-width="8" filter="url(#jshadow)"/>`,
    `<rect x="26" y="26" width="${WIDTH - 52}" height="${HEIGHT - 52}" rx="18" fill="none" stroke="${PALETTE.neonRed}" stroke-width="2" opacity="0.7">`,
    `<animate attributeName="opacity" values="0.85;0.25;0.85" dur="1.4s" repeatCount="indefinite"/>`,
    `</rect>`,
  ].join("");

  const body = [
    defs,
    background,
    confetti,
    coins,
    frame,
    bulbRing(20, 20, WIDTH - 40, HEIGHT - 40, { spacing: 42, radius: 6, phases: 3, duration: 0.9 }),
    headline,
    lightSweep("jclip", "jsweep", 18, 18, WIDTH - 36, HEIGHT - 36, 4.2),
  ].join("");

  return svgRoot(WIDTH, HEIGHT, body, `Mega jackpot worth ${escapeXml(valuation)}`);
}
