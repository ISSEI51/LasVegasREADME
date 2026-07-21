import { describe, expect, it } from "vitest";

import { SVG_FILE_NAMES } from "../src/constants.js";
import { generateReadme } from "../src/generate-readme.js";
import { createCasinoContext } from "../src/takeover.js";
import { formatCurrency } from "../src/utils/format.js";

/** Deterministic "randomness" so assertions can target exact values. */
const fixedRandom = (): number => 0.5;

describe("generateReadme", () => {
  it("embeds the project name", () => {
    const readme = generateReadme(createCasinoContext("RaidCoder", fixedRandom));
    expect(readme).toContain("RaidCoder");
    expect(readme).toContain("# 🎰 RaidCoder 🎰");
  });

  it("references every generated SVG by relative path", () => {
    const readme = generateReadme(createCasinoContext("RaidCoder", fixedRandom));
    for (const fileName of Object.values(SVG_FILE_NAMES)) {
      expect(readme).toContain(`./readme-casino/${fileName}`);
    }
  });

  it("contains the formatted valuation", () => {
    const context = createCasinoContext("RaidCoder", fixedRandom);
    const readme = generateReadme(context);
    expect(readme).toContain(formatCurrency(context.stats.valuation));
    expect(context.stats.valuation).toBeGreaterThan(0);
  });

  it("is fully centred", () => {
    const readme = generateReadme(createCasinoContext("RaidCoder", fixedRandom));
    expect(readme).toContain('<div align="center">');
    expect(readme).toContain("</div>");
  });

  it("closes every Markdown code fence", () => {
    const readme = generateReadme(createCasinoContext("RaidCoder", fixedRandom));
    const fences = readme.split("\n").filter((line) => line.startsWith("```"));
    expect(fences.length).toBeGreaterThan(0);
    expect(fences.length % 2).toBe(0);
    // Fences must alternate open (with language) / close (bare).
    fences.forEach((fence, index) => {
      if (index % 2 === 0) {
        expect(fence).toBe("```bash");
      } else {
        expect(fence).toBe("```");
      }
    });
  });

  it("escapes HTML-hostile directory names before embedding them", () => {
    const readme = generateReadme(createCasinoContext('<img src=x onerror="a">', fixedRandom));
    expect(readme).not.toContain("<img src=x");
    expect(readme).toContain("&lt;img");
  });

  it("keeps installation and usage sections fixed", () => {
    const readme = generateReadme(createCasinoContext("RaidCoder", fixedRandom));
    expect(readme).toContain("npm install");
    expect(readme).toContain("npm run dev");
  });
});
