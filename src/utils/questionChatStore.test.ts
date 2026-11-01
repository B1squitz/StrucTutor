import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { load, save, clear } from './questionChatStore';

describe('questionChatStore per-question isolation and persistence', () => {
  beforeEach(() => {
    clear('q1');
    clear('q2');
  });

  it('saves and restores attached file and text for a specific question', () => {
    const q1State = {
      history: [
        { id: '1', sender: 'user' as const, text: 'Hello', timestamp: '10:00' },
      ],
      attachedFileName: 'beam_analysis.pdf',
      attachedPdfText: '[Page 1]\nMaximum bending moment occurs at midspan.',
    };

    save('q1', q1State);

    const loadedQ1 = load('q1');
    assert.equal(loadedQ1.attachedFileName, 'beam_analysis.pdf');
    assert.equal(
      loadedQ1.attachedPdfText,
      '[Page 1]\nMaximum bending moment occurs at midspan.'
    );
    assert.equal(loadedQ1.history.length, 1);
  });

  it('ensures opening a different question shows no attached file', () => {
    save('q1', {
      history: [],
      attachedFileName: 'eurocode_ec3.pdf',
      attachedPdfText: 'Steel design clause 6.2',
    });

    const loadedQ2 = load('q2');
    assert.equal(loadedQ2.attachedFileName, undefined);
    assert.equal(loadedQ2.attachedPdfText, undefined);
    assert.deepEqual(loadedQ2.history, []);
  });

  it('restores attachment on reload (subsequent load call)', () => {
    save('q1', {
      history: [
        { id: 'm1', sender: 'ai' as const, text: 'Noted', timestamp: '10:05' },
      ],
      attachedFileName: 'shear_design.pdf',
      attachedPdfText: 'V_Ed <= V_Rd,c',
    });

    // Simulating page reload by loading freshly from store
    const reloaded = load('q1');
    assert.equal(reloaded.attachedFileName, 'shear_design.pdf');
    assert.equal(reloaded.attachedPdfText, 'V_Ed <= V_Rd,c');
  });

  it('clearing question state removes the attached file', () => {
    save('q1', {
      history: [],
      attachedFileName: 'draft.pdf',
      attachedPdfText: 'Draft contents',
    });

    clear('q1');
    const cleared = load('q1');
    assert.equal(cleared.attachedFileName, undefined);
    assert.equal(cleared.attachedPdfText, undefined);
    assert.deepEqual(cleared.history, []);
  });
});
