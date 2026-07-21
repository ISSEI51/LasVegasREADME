import { describe, expect, it } from "vitest";

import { escapeMarkdown, escapeXml } from "../src/utils/escape-xml.js";

describe("escapeXml", () => {
  it("escapes all five XML predefined entities", () => {
    expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
  });

  it("escapes ampersands before anything else", () => {
    expect(escapeXml("&lt;")).toBe("&amp;lt;");
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeXml("RaidCoder-2024_v7")).toBe("RaidCoder-2024_v7");
  });

  it("neutralises a script injection attempt in a directory name", () => {
    const escaped = escapeXml(`<script>alert("x")</script>`);
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
    expect(escaped).not.toContain('"');
  });
});

describe("escapeMarkdown", () => {
  it("escapes XML entities plus backticks and backslashes", () => {
    const escaped = escapeMarkdown('a`b\\c<d>&e"f');
    expect(escaped).not.toContain("`");
    expect(escaped).not.toContain("\\");
    expect(escaped).not.toContain("<");
    expect(escaped).toContain("&amp;");
  });
});
