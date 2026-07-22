// Log-file preparation for GitHub issues. Pure and dependency-free so it can
// run in the browser (file is read client-side only) and on the server (body
// budgeting). Nothing here persists anything.

export const MAX_LOG_FILE_BYTES = 5 * 1024 * 1024;
// Characters of log content the client sends along with a report.
export const LOG_CONTENT_BUDGET = 40_000;
// Hard ceiling for a GitHub issue body is 65536 characters; keep headroom.
export const MAX_ISSUE_BODY = 65_000;

// Heuristic: NUL bytes or a high share of control characters mean the file is
// not a text log (e.g. a renamed archive or savegame).
export function isProbablyBinary(sample: string): boolean {
  const probe = sample.slice(0, 2000);
  if (probe.length === 0) return false;
  if (probe.includes("\0")) return true;
  let control = 0;
  for (const ch of probe) {
    const code = ch.charCodeAt(0);
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) control++;
  }
  return control / probe.length > 0.05;
}

// Home directories often contain the player's real name.
export function redactUserPaths(text: string): {
  content: string;
  redacted: boolean;
} {
  let redacted = false;
  const content = text
    .replace(/([A-Za-z]:\\Users\\)[^\\/\s"']+/gi, (_m, prefix: string) => {
      redacted = true;
      return `${prefix}***`;
    })
    .replace(/(\/home\/)[^/\s"']+/g, (_m, prefix: string) => {
      redacted = true;
      return `${prefix}***`;
    })
    .replace(/(\/Users\/)[^/\s"']+/g, (_m, prefix: string) => {
      redacted = true;
      return `${prefix}***`;
    });
  return { content, redacted };
}

const ERROR_LINE = /\[ERROR\]|\bERROR\b|Exception|Traceback|^\s+at\s/m;
const STACK_LINE = /^\s+(at\s|\.{3}|File ")|^\s{4,}\S/;

// Keeps the parts of a log a maintainer actually needs: the header (loader
// version, OS, mod list), every error with its stack trace, and the tail.
// Falls back to head + tail when no error markers exist. `[...]` marks gaps.
export function extractLogContent(
  text: string,
  budget: number,
): { content: string; truncated: boolean } {
  if (text.length <= budget) {
    return { content: text, truncated: false };
  }

  const lines = text.split("\n");
  const gap = "[...]";

  // Header: enough lines to cover the MelonLoader banner and mod list.
  const headerLines: string[] = [];
  let headerChars = 0;
  const headerBudget = Math.min(8000, Math.floor(budget * 0.3));
  for (const line of lines) {
    if (headerChars + line.length + 1 > headerBudget) break;
    headerLines.push(line);
    headerChars += line.length + 1;
  }

  // Error blocks: the matching line plus its stack frames.
  const blocks: string[] = [];
  let blockChars = 0;
  const blockBudget = Math.floor(budget * 0.5);
  let i = headerLines.length;
  while (i < lines.length && blockChars < blockBudget) {
    if (ERROR_LINE.test(lines[i])) {
      const block: string[] = [lines[i]];
      let j = i + 1;
      while (
        j < lines.length &&
        block.length < 30 &&
        (STACK_LINE.test(lines[j]) || ERROR_LINE.test(lines[j]))
      ) {
        block.push(lines[j]);
        j++;
      }
      const joined = block.join("\n");
      if (blockChars + joined.length + gap.length + 2 <= blockBudget) {
        blocks.push(joined);
        blockChars += joined.length + gap.length + 2;
      }
      i = j;
    } else {
      i++;
    }
  }

  // Tail: the last lines before the crash or shutdown.
  const used = headerChars + blockChars;
  const tailBudget = Math.max(0, budget - used - 3 * (gap.length + 2));
  const tailLines: string[] = [];
  let tailChars = 0;
  for (let k = lines.length - 1; k >= 0 && tailChars < tailBudget; k--) {
    tailLines.unshift(lines[k]);
    tailChars += lines[k].length + 1;
  }
  if (tailChars > tailBudget && tailLines.length > 0) {
    tailLines.shift();
  }

  const parts = [headerLines.join("\n")];
  if (blocks.length > 0) {
    parts.push(gap, blocks.join(`\n${gap}\n`));
  }
  parts.push(gap, tailLines.join("\n"));

  let content = parts.join("\n");
  if (content.length > budget) {
    content = `${content.slice(0, budget - gap.length - 1)}\n${gap}`;
  }
  return { content, truncated: true };
}

export interface PreparedLog {
  content: string;
  truncated: boolean;
  redacted: boolean;
  originalLength: number;
}

export function prepareLogForIssue(raw: string): PreparedLog {
  const { content: safe, redacted } = redactUserPaths(raw);
  const { content, truncated } = extractLogContent(safe, LOG_CONTENT_BUDGET);
  return { content, truncated, redacted, originalLength: raw.length };
}

// Wraps log content in a collapsed markdown block. The fence is always longer
// than any backtick run inside, so the content cannot break out of it.
export function buildLogMarkdown(params: {
  fileName: string;
  content: string;
  truncated: boolean;
  locale: "de" | "en";
}): string {
  const truncatedNote =
    params.locale === "en" ? " (shortened)" : " (gekürzt)";
  const summary = `${params.fileName}${params.truncated ? truncatedNote : ""}`;
  const longestRun = params.content.match(/`+/g)?.reduce(
    (max, run) => Math.max(max, run.length),
    0,
  ) ?? 0;
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return [
    "<details>",
    `<summary>${summary}</summary>`,
    "",
    `${fence}text`,
    params.content,
    fence,
    "",
    "</details>",
  ].join("\n");
}

// Builds the log section so the total issue body stays under MAX_ISSUE_BODY.
// Shrinks the log content as needed; returns null when not even a stub fits.
export function buildBoundedLogMarkdown(params: {
  fileName: string;
  content: string;
  truncated: boolean;
  locale: "de" | "en";
  availableChars: number;
}): string | null {
  let { content, truncated } = { ...params };
  let markdown = buildLogMarkdown({ ...params, content, truncated });
  while (markdown.length > params.availableChars) {
    if (content.length < 200) return null;
    content = content.slice(0, Math.floor(content.length * 0.8));
    truncated = true;
    markdown = buildLogMarkdown({ ...params, content, truncated });
  }
  return markdown;
}
