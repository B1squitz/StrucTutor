import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQuestionContext,
  VERBATIM_LATEX_INSTRUCTION,
  MAX_ATTACHED_PDF_LENGTH,
} from './buildQuestionContext';
import { load, save, clear } from './questionChatStore';

const sampleQuestion = {
  id: 'MOD01-T1-Q1',
  title: 'Statics Concurrent Force Equilibrium',
  prompt: 'A simply supported steel beam spans L = 6.0 m and carries a central point load P = 50 kN. Calculate the midspan bending moment.',
  type: 'numeric',
  unit: 'kN·m',
  options: ['50.0', '75.0', '100.0', '150.0'],
};

test('buildQuestionContext: prompt contains question text verbatim', () => {
  const ctx = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: false,
    history: [],
  });

  assert.ok(
    ctx.systemPrompt.includes(sampleQuestion.prompt),
    'System prompt must contain the full question text verbatim'
  );
  assert.ok(
    ctx.systemPrompt.includes('Question ID: MOD01-T1-Q1'),
    'System prompt must contain question ID'
  );
  assert.ok(
    ctx.systemPrompt.includes('Required Unit: kN·m'),
    'System prompt must contain required unit'
  );
});

test('buildQuestionContext: prompt contains the verbatim LaTeX instruction', () => {
  const ctx = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: false,
    history: [],
  });

  const expectedInstruction =
    "You are tutoring this specific question. Reference the user's current working where relevant. Write all mathematics as LaTeX using \\[ … \\] for display equations and \\( … \\) for inline maths. Do NOT use $…$, $$…$$, or markdown code fences around maths. Do NOT emit JSON, arrays, or [{ … }] wrappers.";

  assert.ok(
    ctx.systemPrompt.includes(expectedInstruction),
    'System prompt must contain the exact verbatim LaTeX formatting instruction'
  );
  assert.equal(VERBATIM_LATEX_INSTRUCTION, expectedInstruction);
});

test('buildQuestionContext: locked vs unlocked solution instructions', () => {
  // Locked
  const lockedCtx = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(
    lockedCtx.systemPrompt.toLowerCase().includes('do not reveal the final answer'),
    'Locked question must explicitly instruct model not to reveal final answer'
  );
  assert.ok(lockedCtx.systemPrompt.includes('LOCKED'));

  // Unlocked
  const unlockedCtx = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: true,
    history: [],
  });
  assert.ok(
    !unlockedCtx.systemPrompt.toLowerCase().includes('do not reveal the final answer'),
    'Unlocked question must not restrict final answer'
  );
  assert.ok(unlockedCtx.systemPrompt.includes('UNLOCKED'));
});

test('buildQuestionContext: with vs without user draft working', () => {
  // With draft
  const draftText = 'M = P*L/4 = 50 * 6 / 4 = 75 kN·m';
  const withDraft = buildQuestionContext({
    question: sampleQuestion,
    userDraft: draftText,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(withDraft.systemPrompt.includes(draftText));

  // Without draft
  const withoutDraft = buildQuestionContext({
    question: sampleQuestion,
    userDraft: undefined,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(withoutDraft.systemPrompt.includes("User's Current Draft Working: None"));
});

test('buildQuestionContext: with/without attached PDF and truncation', () => {
  // Without PDF
  const noPdf = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(!noPdf.systemPrompt.includes('Attached Reference Material'));

  // Short PDF (below threshold)
  const shortPdf = 'Eurocode 3 Table 3.1: Characteristic yield strength fy = 355 N/mm2 for S355 steel.';
  const withShort = buildQuestionContext({
    question: sampleQuestion,
    attachedPdfText: shortPdf,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(withShort.systemPrompt.includes(shortPdf));
  assert.ok(!withShort.systemPrompt.includes('[truncated]'));

  // Long PDF (above threshold -> truncated)
  const longPdf = 'Steel Section Notes '.repeat(300); // 6000 characters > 4000
  assert.ok(longPdf.length > MAX_ATTACHED_PDF_LENGTH);

  const withLong = buildQuestionContext({
    question: sampleQuestion,
    attachedPdfText: longPdf,
    solutionUnlocked: false,
    history: [],
  });
  assert.ok(withLong.systemPrompt.includes('[truncated]'));
  assert.ok(withLong.systemPrompt.includes(longPdf.slice(0, 100)));
});

test('buildQuestionContext: messages returns question history array', () => {
  const history = [
    { id: '1', sender: 'user' as const, text: 'How do I start?', timestamp: '10:00' },
    { id: '2', sender: 'ai' as const, text: 'Consider equilibrium.', timestamp: '10:01' },
  ];
  const ctx = buildQuestionContext({
    question: sampleQuestion,
    solutionUnlocked: false,
    history,
  });
  assert.equal(ctx.messages, history);
  assert.equal(ctx.messages.length, 2);
});

test('questionChatStore: save, load, and clear round-trip', () => {
  const qId = 'TEST-Q-STORE-01';
  clear(qId);

  const initial = load(qId);
  assert.deepEqual(initial.history, []);

  const stateToSave = {
    history: [
      { id: 'm1', sender: 'user' as const, text: 'What is sigma?', timestamp: '12:00' },
      { id: 'm2', sender: 'ai' as const, text: '\\[ \\sigma = \\frac{N}{A} \\]', timestamp: '12:01' },
    ],
    attachedPdfText: 'Sample extract from textbook.',
    attachedFileName: 'beam_tables.pdf',
  };

  save(qId, stateToSave);

  const loaded = load(qId);
  assert.equal(loaded.history.length, 2);
  assert.equal(loaded.history[0].text, 'What is sigma?');
  assert.equal(loaded.history[1].text, '\\[ \\sigma = \\frac{N}{A} \\]');
  assert.equal(loaded.attachedFileName, 'beam_tables.pdf');
  assert.equal(loaded.attachedPdfText, 'Sample extract from textbook.');

  clear(qId);
  const cleared = load(qId);
  assert.deepEqual(cleared.history, []);
});
