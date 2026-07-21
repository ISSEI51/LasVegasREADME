import { describe, expect, it } from "vitest";

import { SLOT_OUTCOMES } from "../src/constants.js";
import { generateCasinoSvg } from "../src/generate-casino-svg.js";
import { generateJackpotSvg } from "../src/generate-jackpot-svg.js";
import { generateMarqueeSvg } from "../src/generate-marquee-svg.js";
import { generateSlotsSvg } from "../src/generate-slots-svg.js";
import { generateStatsSvg } from "../src/generate-stats-svg.js";
import { createCasinoContext } from "../src/takeover.js";
import type { CasinoContext } from "../src/types.js";
import { fitFontSize, formatCurrency, formatNumber, toDisplayName } from "../src/utils/format.js";
import { createCasinoStats, createSlotResult, randomInteger, randomPick } from "../src/utils/random.js";

const context: CasinoContext = createCasinoContext("RaidCoder", () => 0.42);

const generators: Array<[string, () => string]> = [
  ["casino", () => generateCasinoSvg(context)],
  ["marquee", () => generateMarqueeSvg()],
  ["slots", () => generateSlotsSvg(context)],
  ["stats", () => generateStatsSvg(context)],
  ["jackpot", () => generateJackpotSvg(context)],
];

describe.each(generators)("%s.svg", (_name, generate) => {
  const svg = generate();

  it("starts with <svg and ends with </svg>", () => {
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
    expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
  });

  it("declares the SVG namespace", () => {
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("has balanced angle brackets and no stray unescaped markup", () => {
    expect((svg.match(/</g) ?? []).length).toBe((svg.match(/>/g) ?? []).length);
  });

  it("embeds no scripts, external references or foreignObject", () => {
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("foreignObject");
    expect(svg).not.toContain("http://www.w3.org/1999/xhtml");
    expect(svg).not.toMatch(/@import/);
    expect(svg).not.toMatch(/href="https?:/);
    expect(svg).not.toMatch(/url\(['"]?https?:/);
  });

  it("uses only system font stacks", () => {
    const fontFamilies = svg.match(/font-family="([^"]+)"/g) ?? [];
    expect(fontFamilies.length).toBeGreaterThan(0);
    for (const family of fontFamilies) {
      expect(family).toMatch(/Arial|Helvetica|Verdana|sans-serif|monospace|Courier/);
    }
  });
});

describe("slots.svg", () => {
  it("shows the same symbol on all three reels", () => {
    for (const outcome of SLOT_OUTCOMES) {
      const svg = generateSlotsSvg({ ...context, slot: outcome });
      const escaped = outcome.symbol.replace(/\$/g, "\\$");
      const matches = svg.match(new RegExp(`letter-spacing="2"[^>]*>${escaped}<`, "g")) ?? [];
      expect(matches.length).toBe(3);
    }
  });

  it("renders the outcome title and subtitle", () => {
    const outcome = SLOT_OUTCOMES[0];
    if (outcome === undefined) throw new Error("missing fixture");
    const svg = generateSlotsSvg({ ...context, slot: outcome });
    expect(svg).toContain(outcome.title);
    expect(svg).toContain(outcome.subtitle);
  });
});

describe("casino.svg", () => {
  it("includes the required sign copy", () => {
    const svg = generateCasinoSvg(context);
    expect(svg).toContain("★ WELCOME TO ★");
    expect(svg).toContain("CODE CASINO");
    expect(svg).toContain("OPEN 24 HOURS");
    expect(svg).toContain("NO TESTS REQUIRED");
    expect(svg).toContain("RAIDCODER");
  });

  it("escapes hostile project names instead of emitting raw markup", () => {
    const svg = generateCasinoSvg({ ...context, projectName: '</text><script>x</script>' });
    expect(svg).not.toContain("<script");
    expect(svg).toContain("&lt;");
  });
});

describe("jackpot.svg", () => {
  it("shows the valuation and closing copy", () => {
    const svg = generateJackpotSvg(context);
    expect(svg).toContain(formatCurrency(context.stats.valuation));
    expect(svg).toContain("MEGA JACKPOT");
    expect(svg).toContain("THE HOUSE ALWAYS WINS");
    expect(svg).toContain("YOUR CODE MAY BE BROKEN, BUT YOUR README IS RICH");
  });
});

describe("stats.svg", () => {
  it("lists every statistic row and the LIVE badge", () => {
    const svg = generateStatsSvg(context);
    for (const label of [
      "REPOSITORY VALUATION",
      "VIBE LEVEL",
      "BUG MULTIPLIER",
      "INVESTOR CONFIDENCE",
      "PRODUCTION READINESS",
      "CODE QUALITY",
      "TEST COVERAGE",
      "TECHNICAL DEBT",
      "REVENUE",
    ]) {
      expect(svg).toContain(label);
    }
    expect(svg).toContain("HIGH ROLLER STATISTICS");
    expect(svg).toContain(">LIVE");
  });
});

describe("fitFontSize", () => {
  it("returns the base size when the text easily fits", () => {
    expect(fitFontSize("ABC", 900, 100)).toBe(100);
  });

  it("shrinks but never goes below the floor for absurd names", () => {
    const longName = "A".repeat(500);
    const size = fitFontSize(longName, 880, 104, { minFontSize: 26 });
    expect(size).toBe(26);
    expect(Number.isFinite(size)).toBe(true);
  });

  it("stays at the floor when letter-spacing alone exceeds the box", () => {
    const size = fitFontSize("A".repeat(400), 860, 104, { letterSpacing: 3, minFontSize: 20 });
    expect(size).toBe(20);
  });

  it("never returns zero, negative or NaN for edge case inputs", () => {
    for (const [text, width] of [["", 880], ["x", 0], ["long name here", -5]] as const) {
      const size = fitFontSize(text, width, 100);
      expect(Number.isFinite(size)).toBe(true);
      expect(size).toBeGreaterThan(0);
    }
  });

  it("keeps the estimated advance width inside the box, letter-spacing included", () => {
    // Mirrors the casino sign's own settings.
    for (const name of ["RAIDCODER", "SUPER LONG MONOREPO PACKAGE NAME 2026", "A".repeat(40)]) {
      const size = fitFontSize(name, 860, 104, { widthRatio: 0.72, letterSpacing: 3, minFontSize: 20 });
      const estimatedWidth = name.length * (size * 0.72 + 3);
      expect(estimatedWidth).toBeLessThanOrEqual(860 + 1);
    }
  });
});

describe("randomInteger", () => {
  it("stays within the inclusive range across the whole unit interval", () => {
    for (const roll of [0, 0.0001, 0.25, 0.5, 0.75, 0.999999, 1]) {
      const value = randomInteger(1, 10, () => roll);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("hits both bounds", () => {
    expect(randomInteger(5, 9, () => 0)).toBe(5);
    expect(randomInteger(5, 9, () => 0.9999999)).toBe(9);
  });

  it("rejects an inverted range", () => {
    expect(() => randomInteger(10, 1)).toThrow(RangeError);
  });
});

describe("randomPick", () => {
  it("never returns undefined at the range edges", () => {
    const items = ["a", "b", "c"];
    expect(randomPick(items, () => 0)).toBe("a");
    expect(randomPick(items, () => 0.9999999)).toBe("c");
  });

  it("rejects an empty array", () => {
    expect(() => randomPick([])).toThrow(RangeError);
  });
});

describe("createCasinoStats", () => {
  it("keeps every statistic inside its documented range", () => {
    for (const roll of [0, 0.33, 0.5, 0.9999999]) {
      const stats = createCasinoStats(() => roll);
      expect(stats.valuation).toBeGreaterThanOrEqual(100 * 7_777_777);
      expect(stats.valuation).toBeLessThanOrEqual(999 * 7_777_777);
      expect(stats.vibeLevel).toBeGreaterThanOrEqual(7_000);
      expect(stats.vibeLevel).toBeLessThanOrEqual(9_999);
      expect(stats.bugMultiplier).toBeGreaterThanOrEqual(77);
      expect(stats.bugMultiplier).toBeLessThanOrEqual(777);
      expect(stats.investorConfidence).toBeGreaterThanOrEqual(120);
      expect(stats.productionConfidence).toBeLessThanOrEqual(17);
      expect(stats.jackpotNumber).toBe(777);
    }
  });

  it("produces a valuation dense with sevens", () => {
    const digits = String(createCasinoStats(() => 0.5).valuation);
    const sevens = digits.split("").filter((digit) => digit === "7").length;
    expect(sevens / digits.length).toBeGreaterThan(0.4);
  });
});

describe("createSlotResult", () => {
  it("always returns a known winning outcome", () => {
    for (const roll of [0, 0.2, 0.5, 0.9999999]) {
      expect(SLOT_OUTCOMES).toContain(createSlotResult(() => roll));
    }
  });
});

describe("format helpers", () => {
  it("groups digits with commas", () => {
    expect(formatNumber(8_777_777_777)).toBe("8,777,777,777");
    expect(formatNumber(777)).toBe("777");
    expect(formatNumber(0)).toBe("0");
    expect(formatCurrency(1_000)).toBe("$1,000");
  });

  it("normalises directory names for signage", () => {
    expect(toDisplayName("raid-coder")).toBe("RAID CODER");
    expect(toDisplayName("my_cool_repo")).toBe("MY COOL REPO");
    expect(toDisplayName("   ")).toBe("MYSTERY REPO");
    expect(toDisplayName("x".repeat(80)).length).toBeLessThanOrEqual(40);
  });
});
