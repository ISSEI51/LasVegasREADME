import { PALETTE } from "./constants.js";

/** Reusable SVG fragments. Everything here is static markup plus SMIL. */

export type Point = { x: number; y: number };

/**
 * Deterministic pseudo-random in [0, 1) from an integer seed.
 * Decorations must look scattered but stay identical across renders, so
 * Math.random() is deliberately not used for layout.
 */
export function scatter(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/** Rounds to 2 decimals to keep generated markup small and diff-friendly. */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Evenly spaced points walking clockwise around a rectangle's perimeter. */
export function perimeterPoints(
  x: number,
  y: number,
  width: number,
  height: number,
  spacing: number,
): Point[] {
  const points: Point[] = [];
  const columns = Math.max(2, Math.round(width / spacing));
  const rows = Math.max(2, Math.round(height / spacing));
  const stepX = width / columns;
  const stepY = height / rows;

  for (let i = 0; i < columns; i += 1) points.push({ x: x + i * stepX, y });
  for (let i = 0; i < rows; i += 1) points.push({ x: x + width, y: y + i * stepY });
  for (let i = columns; i > 0; i -= 1) points.push({ x: x + i * stepX, y: y + height });
  for (let i = rows; i > 0; i -= 1) points.push({ x, y: y + i * stepY });

  return points.map((point) => ({ x: round(point.x), y: round(point.y) }));
}

/** A ring of blinking marquee bulbs. Static opacity keeps it readable if SMIL is off. */
export function bulbRing(
  x: number,
  y: number,
  width: number,
  height: number,
  options: { spacing?: number; radius?: number; phases?: number; duration?: number } = {},
): string {
  const spacing = options.spacing ?? 34;
  const radius = options.radius ?? 6;
  const phases = options.phases ?? 3;
  const duration = options.duration ?? 1.2;

  return perimeterPoints(x, y, width, height, spacing)
    .map((point, index) => {
      const phase = index % phases;
      const begin = round(-(phase * duration) / phases);
      const color = phase === 0 ? PALETTE.paleGold : phase === 1 ? PALETTE.gold : PALETTE.amber;
      return [
        `<g>`,
        `<circle cx="${point.x}" cy="${point.y}" r="${radius * 2.4}" fill="${color}" opacity="0.16">`,
        `<animate attributeName="opacity" values="0.30;0.04;0.30" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>`,
        `</circle>`,
        `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${color}" stroke="${PALETTE.white}" stroke-width="1" stroke-opacity="0.45" opacity="0.95">`,
        `<animate attributeName="opacity" values="1;0.28;1" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>`,
        `</circle>`,
        `</g>`,
      ].join("");
    })
    .join("");
}

/** Neon glow filter definition. */
export function neonFilter(id: string, color: string, blur = 6): string {
  return [
    `<filter id="${id}" x="-75%" y="-75%" width="250%" height="250%">`,
    `<feGaussianBlur stdDeviation="${blur}" result="blur"/>`,
    `<feFlood flood-color="${color}" flood-opacity="0.95" result="color"/>`,
    `<feComposite in="color" in2="blur" operator="in" result="glow"/>`,
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>`,
    `</filter>`,
  ].join("");
}

/** Soft drop shadow used behind panels and frames. */
export function shadowFilter(id: string, color = "#000000", blur = 10, dy = 6): string {
  return [
    `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">`,
    `<feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="${color}" flood-opacity="0.75"/>`,
    `</filter>`,
  ].join("");
}

/** Path data for a five pointed star centred on (cx, cy). */
export function starPath(cx: number, cy: number, outer: number, inner = outer * 0.42): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${round(cx + Math.cos(angle) * radius)},${round(cy + Math.sin(angle) * radius)}`);
  }
  return `M${points.join("L")}Z`;
}

/** Path data for a diamond (card suit style) centred on (cx, cy). */
export function diamondPath(cx: number, cy: number, radiusX: number, radiusY = radiusX * 1.4): string {
  return `M${round(cx)} ${round(cy - radiusY)}L${round(cx + radiusX)} ${round(cy)}L${round(cx)} ${round(cy + radiusY)}L${round(cx - radiusX)} ${round(cy)}Z`;
}

/**
 * A specular highlight that slides across the given box.
 * Requires a gradient with `gradientId` and a clip path with `clipId`.
 */
export function lightSweep(
  clipId: string,
  gradientId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  duration = 4.5,
  begin = 0,
): string {
  const bandWidth = round(width * 0.28);
  return [
    `<g clip-path="url(#${clipId})">`,
    `<rect x="${round(x - bandWidth)}" y="${y}" width="${bandWidth}" height="${height}" fill="url(#${gradientId})" opacity="0">`,
    `<animate attributeName="opacity" values="0;0.85;0.85;0" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>`,
    `<animateTransform attributeName="transform" type="translate" values="0,0;${round(width + bandWidth * 2)},0" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>`,
    `</rect>`,
    `</g>`,
  ].join("");
}

/** The moving-highlight gradient that {@link lightSweep} expects. */
export function sweepGradient(id: string): string {
  return [
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0%" stop-color="${PALETTE.white}" stop-opacity="0"/>`,
    `<stop offset="50%" stop-color="${PALETTE.white}" stop-opacity="0.55"/>`,
    `<stop offset="100%" stop-color="${PALETTE.white}" stop-opacity="0"/>`,
    `</linearGradient>`,
  ].join("");
}

/** Gold bevel gradient used for frames and machine casings. */
export function goldGradient(id: string, vertical = true): string {
  const coords = vertical ? `x1="0" y1="0" x2="0" y2="1"` : `x1="0" y1="0" x2="1" y2="0"`;
  return [
    `<linearGradient id="${id}" ${coords}>`,
    `<stop offset="0%" stop-color="#8a5a00"/>`,
    `<stop offset="18%" stop-color="${PALETTE.gold}"/>`,
    `<stop offset="38%" stop-color="${PALETTE.paleGold}"/>`,
    `<stop offset="55%" stop-color="${PALETTE.gold}"/>`,
    `<stop offset="78%" stop-color="${PALETTE.amber}"/>`,
    `<stop offset="100%" stop-color="#7a4d00"/>`,
    `</linearGradient>`,
  ].join("");
}

/** Radial "spotlight burst" background. */
export function burstBackground(width: number, height: number, rays = 28, opacity = 0.12): string {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.hypot(width, height);
  const wedges: string[] = [];
  for (let i = 0; i < rays; i += 1) {
    const start = ((Math.PI * 2) / rays) * i;
    const end = start + Math.PI / rays;
    const x1 = round(cx + Math.cos(start) * radius);
    const y1 = round(cy + Math.sin(start) * radius);
    const x2 = round(cx + Math.cos(end) * radius);
    const y2 = round(cy + Math.sin(end) * radius);
    wedges.push(`M${round(cx)} ${round(cy)}L${x1} ${y1}L${x2} ${y2}Z`);
  }
  return [
    `<g opacity="${opacity}">`,
    `<path d="${wedges.join("")}" fill="${PALETTE.gold}">`,
    `<animateTransform attributeName="transform" type="rotate" from="0 ${round(cx)} ${round(cy)}" to="360 ${round(cx)} ${round(cy)}" dur="60s" repeatCount="indefinite"/>`,
    `</path>`,
    `</g>`,
  ].join("");
}

/** Scattered twinkling stars that never overlap the given safe band. */
export function starField(
  width: number,
  height: number,
  count: number,
  options: { seed?: number; safeTop?: number; safeBottom?: number } = {},
): string {
  const seed = options.seed ?? 1;
  const safeTop = options.safeTop ?? height;
  const safeBottom = options.safeBottom ?? height;
  const stars: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const x = scatter(seed + i * 3.1) * width;
    const y = scatter(seed + i * 7.7 + 11) * height;
    if (y > safeTop && y < safeBottom) continue;
    const size = 3 + scatter(seed + i * 5.3 + 3) * 7;
    const duration = round(1.4 + scatter(seed + i * 2.2 + 5) * 2.6);
    const begin = round(-scatter(seed + i * 1.7 + 9) * duration);
    const color = i % 3 === 0 ? PALETTE.white : i % 3 === 1 ? PALETTE.gold : PALETTE.neonPink;
    stars.push(
      `<path d="${starPath(round(x), round(y), round(size))}" fill="${color}" opacity="0.75">` +
        `<animate attributeName="opacity" values="0.9;0.15;0.9" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/>` +
        `</path>`,
    );
  }
  return stars.join("");
}

/** Small gold coin with a currency glyph. */
export function coin(cx: number, cy: number, radius: number, glyph = "$", floatSeconds = 0): string {
  const animation =
    floatSeconds > 0
      ? `<animateTransform attributeName="transform" type="translate" values="0,0;0,${round(-radius * 0.7)};0,0" dur="${floatSeconds}s" repeatCount="indefinite"/>`
      : "";
  return [
    `<g>`,
    animation,
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius)}" fill="url(#goldCoin)" stroke="#7a4d00" stroke-width="${round(radius * 0.12)}"/>`,
    `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius * 0.72)}" fill="none" stroke="#a86b00" stroke-width="${round(radius * 0.09)}" opacity="0.8"/>`,
    `<text x="${round(cx)}" y="${round(cy + radius * 0.34)}" font-family="Arial, Helvetica, sans-serif" font-size="${round(radius * 1.05)}" font-weight="bold" fill="#6b4200" text-anchor="middle">${glyph}</text>`,
    `</g>`,
  ].join("");
}

/** Radial gradient used by {@link coin}. */
export function coinGradient(id = "goldCoin"): string {
  return [
    `<radialGradient id="${id}" cx="35%" cy="30%" r="75%">`,
    `<stop offset="0%" stop-color="${PALETTE.paleGold}"/>`,
    `<stop offset="55%" stop-color="${PALETTE.gold}"/>`,
    `<stop offset="100%" stop-color="#b37400"/>`,
    `</radialGradient>`,
  ].join("");
}

/** Wraps generated markup in a root <svg> element. */
export function svgRoot(width: number, height: number, body: string, title: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `,
    `width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">`,
    `<title>${title}</title>`,
    body,
    `</svg>`,
  ].join("");
}
