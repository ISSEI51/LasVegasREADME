/** Zero-dependency ANSI helpers for the terminal floor show. */

const CODES = {
  reset: "\u001B[0m",
  bold: "\u001B[1m",
  dim: "\u001B[2m",
  red: "\u001B[38;5;196m",
  gold: "\u001B[38;5;220m",
  amber: "\u001B[38;5;208m",
  pink: "\u001B[38;5;201m",
  purple: "\u001B[38;5;93m",
  white: "\u001B[97m",
  green: "\u001B[38;5;46m",
} as const;

export type ColorName = keyof Omit<typeof CODES, "reset">;

/** Colour is disabled for pipes, dumb terminals and NO_COLOR. */
export function colorEnabled(stream: NodeJS.WriteStream = process.stdout): boolean {
  if (process.env["NO_COLOR"] !== undefined && process.env["NO_COLOR"] !== "") return false;
  if (process.env["FORCE_COLOR"] === "0") return false;
  if (process.env["FORCE_COLOR"] !== undefined) return true;
  if (process.env["TERM"] === "dumb") return false;
  return stream.isTTY === true;
}

export function paint(text: string, ...colors: ColorName[]): string {
  if (!colorEnabled()) return text;
  return `${colors.map((name) => CODES[name]).join("")}${text}${CODES.reset}`;
}

/** True when it is safe to redraw lines and animate. */
export function isInteractive(stream: NodeJS.WriteStream = process.stdout): boolean {
  return stream.isTTY === true && process.env["CI"] === undefined;
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/** Rewrites the current line; falls back to a plain newline when not a TTY. */
export function rewriteLine(text: string): void {
  if (isInteractive()) {
    process.stdout.write(`\r\u001B[2K${text}`);
    return;
  }
  process.stdout.write(`${text}\n`);
}

export function line(text = ""): void {
  process.stdout.write(`${text}\n`);
}
