import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_QUESTIONS,
  SYLLABUS_MODULES,
  convertEngineeringUnit,
  evaluateQuestionAttempt,
  computeAdaptiveTransition,
  runSelfVerificationChecks,
  StepId,
  StepStatus,
} from './tutorEngine';

test('convertEngineeringUnit handles stress, moment, line load, and section modulus accurately', () => {
  assert.equal(convertEngineeringUnit(18, 'kN·m', 'N·mm'), 18_000_000);
  assert.equal(convertEngineeringUnit(27, 'MPa', 'N/mm²'), 27);
  assert.equal(convertEngineeringUnit(0.027, 'GPa', 'MPa'), 27);
  assert.equal(convertEngineeringUnit(25, 'kN/m²', 'N/mm²'), 0.025);
  assert.equal(convertEngineeringUnit(12.5, 'kN/m', 'N/mm'), 12.5);
  assert.equal(convertEngineeringUnit(1500, 'cm³', 'mm³'), 1_500_000);
});

test('Question 2a accepts 27 in MPa, 27 in N/mm², and 0.027 in GPa as mathematically equivalent', () => {
  const q2a = SESSION_QUESTIONS['2a'];
  const resMPa = evaluateQuestionAttempt(q2a, '27', 'MPa');
  const resNmm2 = evaluateQuestionAttempt(q2a, '27', 'N/mm²');
  const resGPa = evaluateQuestionAttempt(q2a, '0.027', 'GPa');

  assert.equal(resMPa.isCorrect, true);
  assert.equal(resNmm2.isCorrect, true);
  assert.equal(resGPa.isCorrect, true);
  assert.equal(resGPa.isEquivalentUnitMatch, true);
});

test('Misconception detector identifies 10^-3 and 10^3 unit scaling errors on Question 2a', () => {
  const q2a = SESSION_QUESTIONS['2a'];
  const tooSmall = evaluateQuestionAttempt(q2a, '0.027', 'MPa');
  assert.equal(tooSmall.isCorrect, false);
  assert.equal(tooSmall.scaleFactorError, '10^-3_error');

  const tooLarge = evaluateQuestionAttempt(q2a, '27000', 'MPa');
  assert.equal(tooLarge.isCorrect, false);
  assert.equal(tooLarge.scaleFactorError, '10^3_error');
});

test('Adaptive state machine injects 2a-R warm-up and unlocks worked solution after 2 failed attempts', () => {
  const initialStatuses: Record<StepId, StepStatus> = {
    learn: 'mastered',
    '1a': 'mastered',
    '1b': 'mastered',
    '2a': 'active',
    '2a-R': 'unseen',
    '2b': 'unseen',
    '2c': 'unseen',
    '3': 'unseen',
    '4': 'unseen',
    '5a': 'unseen',
    summary: 'unseen',
  };

  const after1stFail = computeAdaptiveTransition('2a', false, 1, false, initialStatuses, false);
  assert.equal(after1stFail.remedialInjected, false);
  assert.equal(after1stFail.autoRevealWorkedSolution, false);

  const after2ndFail = computeAdaptiveTransition('2a', false, 2, false, initialStatuses, false);
  assert.equal(after2ndFail.remedialInjected, true);
  assert.equal(after2ndFail.autoRevealWorkedSolution, true);
  assert.ok(after2ndFail.adaptiveBannerMessage?.includes('2a-R'));
});

test('All 20 syllabus modules and session questions are free of forbidden database IDs and pass 12/12 self-verification', () => {
  assert.equal(SYLLABUS_MODULES.length, 20);
  const serialized = JSON.stringify({ SYLLABUS_MODULES, SESSION_QUESTIONS });
  assert.equal(serialized.includes('MATH-01'), false);
  assert.equal(serialized.includes('P2-UNITS-02'), false);
  assert.equal(serialized.includes('MOD-00'), false);
  assert.equal(serialized.includes('Buckingham Pi Invariant'), false);

  const checks = runSelfVerificationChecks();
  assert.equal(checks.length, 12);
  for (const c of checks) {
    assert.equal(c.passed, true, `Check ${c.id} (${c.title}) failed`);
  }
});
