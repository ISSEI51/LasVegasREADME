/** XML/HTML escaping so a hostile directory name cannot break the SVG. */

/**
 * Escapes the five XML predefined entities. Safe for both element text and
 * double/single quoted attribute values.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Escapes text that is dropped into Markdown, which GitHub renders as HTML.
 * Backticks and backslashes are neutralised too so a directory name cannot
 * open a code span or an escape sequence.
 */
export function escapeMarkdown(value: string): string {
  return escapeXml(value).replace(/\\/g, "&#92;").replace(/`/g, "&#96;");
}
