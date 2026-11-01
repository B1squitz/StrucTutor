import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanProseText } from './cleanProseText';
import { parseRichText } from './parseRichText';

test('cleanProseText: "load is 10 kN m/s2" → "load is 10 kN m/s²"', () => {
  assert.equal(cleanProseText('load is 10 kN m/s2'), 'load is 10 kN m/s²');
});

test('cleanProseText: m/s2 inside $…$ unchanged when parsed via rich text', () => {
  const input = 'acceleration is 9.81 m/s2 but in math $a = 9.81 m/s2$ holds';
  const segments = parseRichText(input);

  // In RichMessage, cleanProseText is only applied to text segments, never math
  const cleaned = segments.map((seg) =>
    seg.type === 'text' ? cleanProseText(seg.value) : seg.value
  );

  assert.equal(cleaned[0], 'acceleration is 9.81 m/s² but in math ');
  assert.equal(cleaned[1], 'a = 9.81 m/s2');
});

test('cleanProseText: replaces engineering units and mathematical symbols', () => {
  assert.equal(cleanProseText('Area is 400 mm2'), 'Area is 400 mm²');
  assert.equal(cleanProseText('Yield strength fy = 355 N/mm2'), 'Yield strength fy = 355 N/mm²');
  assert.equal(cleanProseText('Floor load is 5.0 kN/m2'), 'Floor load is 5.0 kN/m²');
  assert.equal(cleanProseText('Angle is 45 deg or 30 degrees'), 'Angle is 45 ° or 30 °');
  assert.equal(cleanProseText('Path A -> B with margin <= 5 and load >= 10 +/- 0.5 kN'), 'Path A → B with margin ≤ 5 and load ≥ 10 ± 0.5 kN');
});

test('cleanProseText: removes bold and code markdown markers', () => {
  assert.equal(cleanProseText('This is **bold** text and `code` element'), 'This is bold text and code element');
});

test('cleanProseText: strips leading heading hashes while preserving text', () => {
  const input = '# Heading 1\n## Heading 2\n### Heading 3\nParagraph text';
  const expected = 'Heading 1\nHeading 2\nHeading 3\nParagraph text';
  assert.equal(cleanProseText(input), expected);
});

test('cleanProseText: converts --- and *** lines to blank lines and collapses 3+ blank lines to one', () => {
  const input = 'Section A\n---\n\n\n\nSection B\n***\nEnd';
  const result = cleanProseText(input);

  // --- becomes a blank line, collapsed with subsequent blank lines so there's only 1 blank line (\n\n) between sections
  assert.equal(result.includes('---'), false);
  assert.equal(result.includes('***'), false);
  assert.equal(result.includes('\n\n\n'), false);
});
