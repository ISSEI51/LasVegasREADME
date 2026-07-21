/** Number and text formatting helpers for the casino boards. */

/** 8777777777 -> "8,777,777,777". Locale independent by design. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError("formatNumber requires a finite number");
  }
  const negative = value < 0;
  const digits = Math.trunc(Math.abs(value)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? `-${grouped}` : grouped;
}

/** 8777777777 -> "$8,777,777,777". */
export function formatCurrency(value: number): string {
  return `$${formatNumber(value)}`;
}

/**
 * Shrinks a font size so `text` still fits inside `maxWidth`.
 *
 * Advance width is estimated as `chars * (fontSize * widthRatio + letterSpacing)`.
 * Rough, but SVG has no text measurement and this only has to keep a casino sign
 * inside its frame. Uppercase bold Arial needs a ratio around 0.72.
 */
export function fitFontSize(
  text: string,
  maxWidth: number,
  baseFontSize: number,
  options: { widthRatio?: number; minFontSize?: number; letterSpacing?: number } = {},
): number {
  const widthRatio = options.widthRatio ?? 0.62;
  const minFontSize = options.minFontSize ?? 14;
  const letterSpacing = options.letterSpacing ?? 0;
  const characters = Math.max(text.length, 1);

  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return minFontSize;
  }

  const widthForGlyphs = maxWidth - characters * letterSpacing;
  const fitted = widthForGlyphs / (characters * widthRatio);
  const clamped = Math.min(baseFontSize, fitted);
  return Math.round(Math.max(minFontSize, clamped) * 100) / 100;
}

/**
 * Normalises a directory name into sign-friendly display text.
 * Falls back to a house name when the directory name carries no letters.
 */
export function toDisplayName(rawName: string, fallback = "MYSTERY REPO"): string {
  const collapsed = rawName.replace(/[\s_-]+/g, " ").trim();
  if (collapsed.length === 0) {
    return fallback;
  }
  const upper = collapsed.toUpperCase();
  return upper.length > 40 ? `${upper.slice(0, 39)}…` : upper;
}
