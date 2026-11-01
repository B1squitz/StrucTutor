export type Segment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; displayMode: boolean };

interface DelimiterRule {
  open: string;
  close: string;
  displayMode: boolean;
}

const DELIMITERS: DelimiterRule[] = [
  { open: '\\[', close: '\\]', displayMode: true },
  { open: '$$', close: '$$', displayMode: true },
  { open: '\\(', close: '\\)', displayMode: false },
  { open: '$', close: '$', displayMode: false },
];

/**
 * Finds the earliest opening delimiter at or after `pos`.
 */
function findEarliestOpeningDelimiter(
  input: string,
  pos: number
): { openIdx: number; rule: DelimiterRule } | null {
  let earliest: { openIdx: number; rule: DelimiterRule } | null = null;

  for (const rule of DELIMITERS) {
    let searchFrom = pos;
    while (searchFrom < input.length) {
      const idx = input.indexOf(rule.open, searchFrom);
      if (idx === -1) break;

      // Handle escaped dollar sign: \$ is not an opening math delimiter
      if (rule.open === '$' && idx > 0 && input[idx - 1] === '\\') {
        searchFrom = idx + 1;
        continue;
      }

      // If matching single '$', make sure it is not part of '$$'
      if (rule.open === '$') {
        if (input[idx + 1] === '$' || (idx > 0 && input[idx - 1] === '$')) {
          searchFrom = idx + 1;
          continue;
        }
      }

      if (!earliest || idx < earliest.openIdx) {
        earliest = { openIdx: idx, rule };
      }
      break;
    }
  }

  return earliest;
}

/**
 * Searches for the matching closing delimiter for a given rule starting from `searchFrom`.
 */
function findClosingDelimiter(
  input: string,
  rule: DelimiterRule,
  searchFrom: number
): number {
  if (rule.close === '$') {
    let cur = searchFrom;
    while (cur < input.length) {
      const idx = input.indexOf('$', cur);
      if (idx === -1) return -1;
      // Skip escaped dollar: \$
      if (idx > 0 && input[idx - 1] === '\\') {
        cur = idx + 1;
        continue;
      }
      // Ensure it's not part of $$
      if (input[idx + 1] === '$' || (idx > 0 && input[idx - 1] === '$')) {
        cur = idx + 1;
        continue;
      }
      return idx;
    }
    return -1;
  }

  return input.indexOf(rule.close, searchFrom);
}

/**
 * Parses rich text into text and math segments based on LaTeX delimiters.
 * Delimiters:
 *   \[ ... \] and $$ ... $$ -> displayMode: true
 *   \( ... \) and $ ... $   -> displayMode: false
 * If a closing delimiter has not arrived yet (mid-stream), the opening delimiter
 * and everything after are treated as plain text — never throws.
 */
export function parseRichText(input: string): Segment[] {
  if (!input) return [];

  const segments: Segment[] = [];
  let pos = 0;

  const pushText = (text: string) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.type === 'text') {
      last.value += text;
    } else {
      segments.push({ type: 'text', value: text });
    }
  };

  while (pos < input.length) {
    const match = findEarliestOpeningDelimiter(input, pos);
    if (!match) {
      pushText(input.slice(pos));
      break;
    }

    const { openIdx, rule } = match;
    const closeIdx = findClosingDelimiter(input, rule, openIdx + rule.open.length);

    if (closeIdx === -1) {
      // Closing delimiter has not arrived yet (mid-stream).
      // Treat the opening delimiter and everything after as plain text.
      pushText(input.slice(pos));
      break;
    }

    // Push any text preceding the math delimiter
    if (openIdx > pos) {
      pushText(input.slice(pos, openIdx));
    }

    const mathValue = input.slice(openIdx + rule.open.length, closeIdx).trim();
    segments.push({
      type: 'math',
      value: mathValue,
      displayMode: rule.displayMode,
    });

    pos = closeIdx + rule.close.length;
  }

  return segments;
}
