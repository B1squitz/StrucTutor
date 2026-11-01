import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRichText } from './parseRichText';

test('parseRichText: \\[ U = \\frac{P^2 L^3}{12 E} \\] → one display math segment', () => {
  const input = '\\[ U = \\frac{P^2 L^3}{12 E} \\]';
  const segments = parseRichText(input);

  assert.equal(segments.length, 1);
  assert.deepEqual(segments[0], {
    type: 'math',
    value: 'U = \\frac{P^2 L^3}{12 E}',
    displayMode: true,
  });
});

test('parseRichText: \\(a+b\\) → one inline math segment', () => {
  const input = '\\(a+b\\)';
  const segments = parseRichText(input);

  assert.equal(segments.length, 1);
  assert.deepEqual(segments[0], {
    type: 'math',
    value: 'a+b',
    displayMode: false,
  });
});

test('parseRichText: \\[ a = (unterminated) → one text segment, no throw', () => {
  const input = '\\[ a =';
  assert.doesNotThrow(() => {
    const segments = parseRichText(input);
    assert.equal(segments.length, 1);
    assert.deepEqual(segments[0], {
      type: 'text',
      value: '\\[ a =',
    });
  });
});

test('parseRichText: supports $$ display math and $ inline math', () => {
  const display = '$$ E = mc^2 $$';
  const segDisplay = parseRichText(display);
  assert.equal(segDisplay.length, 1);
  assert.deepEqual(segDisplay[0], {
    type: 'math',
    value: 'E = mc^2',
    displayMode: true,
  });

  const inline = '$F = ma$';
  const segInline = parseRichText(inline);
  assert.equal(segInline.length, 1);
  assert.deepEqual(segInline[0], {
    type: 'math',
    value: 'F = ma',
    displayMode: false,
  });
});

test('parseRichText: mixed text and math with mid-stream partial chunks', () => {
  const mixed = 'Calculate moment: \\[ M = \\frac{w L^2}{8} \\] where $w = 10$ kN/m and \\(L = 6\\) m.';
  const segs = parseRichText(mixed);

  assert.equal(segs.length, 7);
  assert.equal(segs[0].type, 'text');
  assert.equal(segs[0].value, 'Calculate moment: ');
  assert.deepEqual(segs[1], {
    type: 'math',
    value: 'M = \\frac{w L^2}{8}',
    displayMode: true,
  });
  assert.equal(segs[2].type, 'text');
  assert.equal(segs[2].value, ' where ');
  assert.deepEqual(segs[3], {
    type: 'math',
    value: 'w = 10',
    displayMode: false,
  });
  assert.equal(segs[4].type, 'text');
  assert.equal(segs[4].value, ' kN/m and ');
  assert.deepEqual(segs[5], {
    type: 'math',
    value: 'L = 6',
    displayMode: false,
  });
  assert.equal(segs[6].type, 'text');
  assert.equal(segs[6].value, ' m.');

  // Unterminated mid-stream streaming chunks
  const partial = 'The strain is \\( \\varepsilon = \\Delta L / L';
  const partialSegs = parseRichText(partial);
  assert.equal(partialSegs.length, 1);
  assert.equal(partialSegs[0].type, 'text');
  assert.equal(partialSegs[0].value, partial);
});
