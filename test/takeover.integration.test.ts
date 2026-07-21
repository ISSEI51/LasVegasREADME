import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { SVG_FILE_NAMES } from "../src/constants.js";
import { resolveProjectName, runTakeover } from "../src/takeover.js";

const createdRoots: string[] = [];

/** Creates a throwaway project directory with a real, respectable README. */
async function createProject(name: string): Promise<string> {
  const parent = await mkdtemp(path.join(tmpdir(), "readme-casino-"));
  createdRoots.push(parent);
  const projectRoot = path.join(parent, name);
  await mkdir(projectRoot, { recursive: true });
  return projectRoot;
}

afterEach(async () => {
  await Promise.all(createdRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("runTakeover", () => {
  it("replaces the README and generates every asset", async () => {
    const projectRoot = await createProject("RaidCoder");
    const originalReadme = "# Original README\n\nThis project is serious and well documented.\n";
    await writeFile(path.join(projectRoot, "README.md"), originalReadme, "utf8");

    const result = await runTakeover(projectRoot);

    const readme = await readFile(path.join(projectRoot, "README.md"), "utf8");
    expect(readme).not.toContain("Original README");
    expect(readme).not.toContain("serious and well documented");
    expect(readme).toContain("RaidCoder");
    expect(readme).toContain("THE HOUSE ALWAYS WINS");
    expect(result.context.projectName).toBe("RaidCoder");

    const assets = await readdir(path.join(projectRoot, "readme-casino"));
    expect(assets.sort()).toEqual(Object.values(SVG_FILE_NAMES).sort());

    for (const fileName of Object.values(SVG_FILE_NAMES)) {
      const svg = await readFile(path.join(projectRoot, "readme-casino", fileName), "utf8");
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    }
  });

  it("creates no backup of any kind", async () => {
    const projectRoot = await createProject("RaidCoder");
    await writeFile(path.join(projectRoot, "README.md"), "# Original\n", "utf8");

    await runTakeover(projectRoot);

    const entries = await readdir(projectRoot);
    expect(entries.sort()).toEqual(["README.md", "readme-casino"]);
    expect(entries.some((entry) => /backup|\.bak|\.orig|~$/i.test(entry))).toBe(false);
  });

  it("works when no README exists yet", async () => {
    const projectRoot = await createProject("FreshRepo");
    await runTakeover(projectRoot);
    const readme = await readFile(path.join(projectRoot, "README.md"), "utf8");
    expect(readme).toContain("FreshRepo");
  });

  it("is idempotent across repeated runs", async () => {
    const projectRoot = await createProject("RaidCoder");
    await runTakeover(projectRoot);
    await expect(runTakeover(projectRoot)).resolves.toBeDefined();
    const assets = await readdir(path.join(projectRoot, "readme-casino"));
    expect(assets).toHaveLength(Object.keys(SVG_FILE_NAMES).length);
  });

  it("fails clearly when a file squats the readme-casino name", async () => {
    const projectRoot = await createProject("Blocked");
    await writeFile(path.join(projectRoot, "readme-casino"), "not a directory", "utf8");

    await expect(runTakeover(projectRoot)).rejects.toThrow(/already exists as a file/);
  });

  it("propagates filesystem errors instead of swallowing them", async () => {
    // A regular file standing where a parent directory should be: mkdir cannot
    // recover from this on any platform.
    const projectRoot = await createProject("Host");
    const blocker = path.join(projectRoot, "blocker");
    await writeFile(blocker, "i am a file", "utf8");

    await expect(runTakeover(path.join(blocker, "Nested"))).rejects.toThrow();
  });

  it("derives the project name from the directory, not package.json", async () => {
    const projectRoot = await createProject("DirectoryName");
    await writeFile(
      path.join(projectRoot, "package.json"),
      JSON.stringify({ name: "totally-different-name" }),
      "utf8",
    );

    await runTakeover(projectRoot);

    const readme = await readFile(path.join(projectRoot, "README.md"), "utf8");
    expect(readme).toContain("DirectoryName");
    expect(readme).not.toContain("totally-different-name");
  });
});

describe("resolveProjectName", () => {
  it("returns the trailing directory name", () => {
    expect(resolveProjectName(path.join(path.sep, "home", "dev", "RaidCoder"))).toBe("RaidCoder");
  });

  it("rejects the filesystem root", () => {
    expect(() => resolveProjectName(path.sep)).toThrow(/Unable to determine a project name/);
  });
});
