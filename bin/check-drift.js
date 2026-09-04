#!/usr/bin/env node
'use strict';

/**
 * The OMNI Standard — drift-prevention check (Step 7).
 *
 * Run from inside a product repo (`npx omni-check-drift` once @omni/tokens
 * is installed). Walks app/, components/, and lib/ for two specific ways a
 * PR can silently reintroduce a hardcoded color instead of an OMNI token:
 *
 *   1. Tailwind's own default color palette (bg-red-500, text-blue-600,
 *      border-gray-200, ...) — nobody should reach for these once
 *      @omni/tokens/tailwind-preset exists; every real need (a semantic
 *      state, a product accent, a neutral) already has a token for it.
 *   2. A raw hex color, anywhere — an arbitrary-value Tailwind class
 *      (bg-[#1E40AF]), an inline style, or a plain string literal.
 *
 * This is deliberately a plain Node script, not a custom ESLint rule: it
 * ships today, needs no eslint-plugin scaffolding, and still fails a build
 * or CI step the same way a lint error would (non-zero exit code). A real
 * ESLint rule (inline editor squiggles, autofix) is the natural next step
 * once this pattern has proven itself across a few products — not a
 * reason to hold Step 7 back until then.
 *
 * A line is exempt if it ends with `// omni-drift-ignore` — for the rare
 * legitimate case (e.g. a <canvas> pixel op, a third-party color the
 * product doesn't control).
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_DIRS = ['app', 'components', 'lib'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.css']);
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'public']);
const IGNORE_MARKER = 'omni-drift-ignore';

// Tailwind's default palette — every family it ships, every numbered stop.
// Matched as a Tailwind utility prefix (bg-/text-/border-/ring-/from-/
// via-/to-/fill-/stroke-/divide-/outline-/accent-/caret-/decoration-/
// shadow-) followed by one of these families and a numbered stop.
const TAILWIND_FAMILIES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber',
  'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue',
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];
const UTILITY_PREFIXES = [
  'bg', 'text', 'border', 'ring', 'from', 'via', 'to', 'fill', 'stroke',
  'divide', 'outline', 'accent', 'caret', 'decoration', 'shadow',
];
const TAILWIND_PALETTE_RE = new RegExp(
  `\\b(?:${UTILITY_PREFIXES.join('|')})-(?:${TAILWIND_FAMILIES.join('|')})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
);

// Arbitrary-value Tailwind hex (bg-[#1E40AF], text-[#fff]) or a bare hex
// literal anywhere else (inline style, JS string).
const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

function walk(dir, files) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // directory doesn't exist in this product — fine, skip it
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
}

function checkFile(file, violations) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.includes(IGNORE_MARKER)) return;
    const paletteMatch = line.match(TAILWIND_PALETTE_RE);
    if (paletteMatch) {
      violations.push({
        file, line: i + 1, kind: 'tailwind-default-palette',
        snippet: line.trim(), match: paletteMatch[0],
      });
    }
    const hexMatch = line.match(HEX_RE);
    if (hexMatch) {
      violations.push({
        file, line: i + 1, kind: 'raw-hex-color',
        snippet: line.trim(), match: hexMatch[0],
      });
    }
  });
}

function main() {
  const roots = process.argv.slice(2);
  const dirs = roots.length > 0 ? roots : DEFAULT_DIRS;
  const files = [];
  for (const dir of dirs) walk(dir, files);

  const violations = [];
  for (const file of files) checkFile(file, violations);

  if (violations.length === 0) {
    console.log(`omni-check-drift: clean — ${files.length} files checked, 0 violations.`);
    process.exit(0);
  }

  console.error(`omni-check-drift: ${violations.length} violation(s) found in ${files.length} files checked.\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.kind}]  ${v.match}`);
    console.error(`    ${v.snippet}`);
  }
  console.error(
    '\nUse an OMNI token instead (omni-* / accent-* / success|warning|error|info), ' +
    `or add "// ${IGNORE_MARKER}" to the end of the line if this is a deliberate, reviewed exception.`,
  );
  process.exit(1);
}

main();
