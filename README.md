<div align="center">

# 🎰 README CASINO 🎰

### One command. No questions. No backup. Just Vegas.

**Turn any respectable GitHub repository into an unreadable Las Vegas casino.**

</div>

---

## 🚨 WARNING

```text
WARNING:
This command permanently replaces README.md.
No confirmation is shown.
No backup is created.
```

There is no `--dry-run`, no `--force`, no `restore` command, and no prompt.
The moment you press Enter, your existing `README.md` is gone.

**Commit your work first.** Seriously.

---

## 🎲 Usage

Run it in the root of the project you want to ruin:

```bash
cd ~/dev/RaidCoder
npx @issei51/las-vegas-readme
```

That is the entire interface. There are no subcommands, no flags, and no config file.

The project name is taken from the **directory name**, not from `package.json`.
Running the command in `~/dev/RaidCoder` produces a casino for `RaidCoder`.

---

## 📦 What it generates

```text
RaidCoder/
├── src/
├── package.json
├── README.md            ← completely replaced
└── readme-casino/       ← created
    ├── casino.svg       1200 × 420  neon marquee sign
    ├── slots.svg        1000 × 500  three-reel slot machine (always wins)
    ├── stats.svg        1000 × 620  high roller statistics board
    ├── jackpot.svg      1200 × 400  mega jackpot finale
    └── marquee.svg      1200 × 150  scrolling chase lights
```

Every SVG is generated in-process from plain strings. No external API, no network
access, no image downloads, and no SVG library. They are self-contained, use only
system fonts, embed no JavaScript, and animate with SMIL — so they render on
GitHub in both light and dark themes, and still look right where animation is
disabled.

---

## 🃏 Before and after

**Before**

```markdown
# RaidCoder

A small, well-tested utility for coordinating background jobs.

## Installation

npm install raidcoder
```

**After**

```markdown
<div align="center">

<img src="./readme-casino/casino.svg" alt="RAIDCODER Code Casino" width="100%">

<img src="./readme-casino/marquee.svg" alt="Casino marquee lights" width="100%">

# 🎰 RaidCoder 🎰

### WHERE CODE MEETS FINANCIAL IRRESPONSIBILITY

## 💰 REPOSITORY VALUATION

# $8,777,777,777
```

Every run rolls new numbers and a new (always winning) slot result.

---

## 📸 Screenshots

<!-- SCREENSHOT PLACEHOLDER: add docs/screenshot.png showing a generated README on GitHub -->

![Generated README screenshot](docs/screenshot.png)

## 🎬 Demo

<!-- DEMO GIF PLACEHOLDER: add docs/demo.gif showing the CLI running end to end -->

![CLI demo](docs/demo.gif)

---

## ⬇️ Installing from GitHub Packages

This package is published to the **GitHub Packages npm registry**, which only
serves scoped packages. The scope must match the repository owner: a package
named `@issei51/las-vegas-readme` can only be published from the
`ISSEI51` account or organisation. Replace `ISSEI51` everywhere
with your own GitHub username before publishing.

Copy `.npmrc.example` to `.npmrc` and provide a token with the `read:packages`
scope:

```ini
@issei51:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then:

```bash
export GITHUB_TOKEN=ghp_your_token_here
npx @issei51/las-vegas-readme
```

**Never commit `.npmrc` or a token.** `.npmrc` is already in `.gitignore`.

---

## 🛠️ Development

```bash
npm install          # install dependencies
npm run dev          # run the CLI from source via tsx (in a scratch directory!)
npm test             # run the Vitest suite
npm run test:watch   # watch mode
npm run build        # compile TypeScript to dist/
```

Requires **Node.js 20 or newer**. Works on macOS, Linux and Windows.

> ⚠️ `npm run dev` replaces the `README.md` of whatever directory you run it in —
> including this one. Run it inside a throwaway folder.

### Verifying the packaged CLI

```bash
npm run build
npm pack

mkdir /tmp/readme-casino-demo
cd /tmp/readme-casino-demo
echo "# Original README" > README.md
npx /path/to/issei51-las-vegas-readme-1.0.0.tgz
```

---

## 🚀 Publishing

Publishing runs automatically when a **GitHub Release is published**, via
`.github/workflows/publish.yml`. The workflow checks out the repository, sets up
Node.js 20, runs `npm ci`, `npm test` and `npm run build`, then `npm publish`
using `secrets.GITHUB_TOKEN` — no personal token required.

To publish manually:

```bash
npm run build
npm publish
```

`prepublishOnly` runs the tests and the build first, so a failing suite blocks
the release.

---

## 🎰 Project structure

```text
src/
├── cli.ts                    entry point + terminal show
├── takeover.ts               orchestration: mkdir, generate, overwrite
├── constants.ts              palette, slot outcomes, file names
├── types.ts                  shared types
├── svg-parts.ts              reusable SVG fragments (bulbs, glow, stars, coins)
├── generate-readme.ts        the replacement README.md
├── generate-casino-svg.ts    casino.svg
├── generate-slots-svg.ts     slots.svg
├── generate-stats-svg.ts     stats.svg
├── generate-jackpot-svg.ts   jackpot.svg
├── generate-marquee-svg.ts   marquee.svg
└── utils/
    ├── escape-xml.ts         XML / Markdown escaping
    ├── format.ts             number formatting, font fitting
    ├── random.ts             injectable randomness
    └── terminal.ts           zero-dependency ANSI output
```

Zero runtime dependencies. Node.js standard library only.

---

## 📄 License

[MIT](LICENSE)

<div align="center">

**THE HOUSE ALWAYS WINS**

</div>
