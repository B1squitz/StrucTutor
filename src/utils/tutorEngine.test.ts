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
import {
  ALL_SYLLABUS_MODULES,
  getModuleByNumber,
  getModuleById,
  getTopicById,
} from '../data/fullSyllabus';
import {
  FIVE_STUDY_RULES,
  CALCULATION_NOTE_STRUCTURE,
  INTEGRATED_PROJECT_MILESTONES,
  COURSE_DEVELOPMENT_REQUIREMENTS,
} from '../data/syllabusMetadata';
import {
  isNinetyPercentPass,
  formatAssessmentPercentage,
  gradeAssessmentQuestion,
  evaluateAssessmentSubmission,
  createInitialCourseProgressState,
  recordAssessmentAttempt,
  computeCourseProgressSummary,
  loadCourseProgressState,
  saveCourseProgressState,
  resetCourseProgressState,
  buildSyllabusCoverageMap,
  PROGRESS_STORAGE_KEY,
} from './assessmentEngine';

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

test('All 20 legacy syllabus items and session questions pass 12/12 self-verification', () => {
  assert.equal(SYLLABUS_MODULES.length, 20);
  const checks = runSelfVerificationChecks();
  assert.equal(checks.length, 12);
  for (const c of checks) {
    assert.equal(c.passed, true, `Check ${c.id} (${c.title}) failed`);
  }
});

test('Verification 1: Modules 0 to 19 appear once and in exact order, preserving Module 0', () => {
  assert.equal(ALL_SYLLABUS_MODULES.length, 20);
  for (let i = 0; i < 20; i++) {
    const mod = ALL_SYLLABUS_MODULES[i];
    assert.equal(mod.moduleNumber, i, `Expected module at index ${i} to have moduleNumber ${i}`);
    const expectedId = `MOD-${String(i).padStart(2, '0')}`;
    assert.equal(mod.id, expectedId);
    assert.equal(getModuleByNumber(i)?.id, expectedId);
    assert.equal(getModuleById(expectedId)?.moduleNumber, i);
  }
  // Explicitly verify 0 is preserved and not treated as falsy
  const mod0 = getModuleByNumber(0);
  assert.ok(mod0, 'Module 0 must be returned by getModuleByNumber(0)');
  assert.equal(mod0.moduleNumber, 0);
});

test('Verification 2 & 3: Every module has syllabus-led topics (>=5 Qs per topic) and a >=20-question End-of-Module Assessment', () => {
  const seenQuestionIds = new Set<string>();
  const seenTopicIds = new Set<string>();

  for (const mod of ALL_SYLLABUS_MODULES) {
    assert.ok(mod.title.length > 5, `${mod.id} missing title`);
    assert.ok(mod.summary.length > 10, `${mod.id} missing summary`);
    assert.ok(mod.whyItMatters.length > 10, `${mod.id} missing whyItMatters`);
    assert.ok(mod.learningGate.length > 10, `${mod.id} missing learningGate`);
    assert.ok(mod.objectives.length >= 3, `${mod.id} should have at least 3 learning objectives`);
    assert.ok(mod.WorkedExamples.length >= 1, `${mod.id} should have worked examples`);
    assert.ok(mod.topics.length >= 3, `${mod.id} should have at least 3 syllabus topics`);
    assert.ok(
      mod.moduleAssessment.length >= 20,
      `${mod.id} End-of-Module Assessment has ${mod.moduleAssessment.length} questions; required >= 20`
    );

    const moduleTopicSet = new Set(mod.topics.map((t) => t.id));

    for (const topic of mod.topics) {
      assert.equal(seenTopicIds.has(topic.id), false, `Duplicate topic ID ${topic.id}`);
      seenTopicIds.add(topic.id);
      assert.ok(
        topic.assessmentQuestions.length >= 5,
        `Topic ${topic.id} has ${topic.assessmentQuestions.length} questions; required >= 5`
      );
      assert.ok(topic.subtopics.length >= 2, `Topic ${topic.id} needs subtopics`);
      assert.ok(topic.futureContentNote.length > 10, `Topic ${topic.id} needs futureContentNote`);
      assert.equal(getTopicById(topic.id)?.topic.id, topic.id);

      for (const q of topic.assessmentQuestions) {
        assert.equal(seenQuestionIds.has(q.id), false, `Duplicate question ID ${q.id}`);
        seenQuestionIds.add(q.id);
        assert.equal(q.topicId, topic.id, `Question ${q.id} topicId mismatch`);
      }
    }

    for (const mq of mod.moduleAssessment) {
      assert.equal(seenQuestionIds.has(mq.id), false, `Duplicate module question ID ${mq.id}`);
      seenQuestionIds.add(mq.id);
      assert.equal(
        moduleTopicSet.has(mq.topicId),
        true,
        `Module question ${mq.id} references topic ${mq.topicId} not in ${mod.id}`
      );
    }
  }
});

test('Verification 4: Every question across all 20 modules grades its own correctAnswer as true and rejects wrong answers', () => {
  for (const mod of ALL_SYLLABUS_MODULES) {
    const allModuleQuestions = [
      ...mod.topics.flatMap((t) => t.assessmentQuestions),
      ...mod.moduleAssessment,
    ];

    for (const q of allModuleQuestions) {
      assert.ok(q.prompt.length > 10, `${q.id} prompt too short`);
      assert.ok(q.assumptions.length > 3, `${q.id} assumptions missing`);
      assert.ok(q.explanation.length > 10, `${q.id} explanation too short`);
      assert.ok(q.reviewNotice.length > 5, `${q.id} reviewNotice missing`);

      const correctRes = gradeAssessmentQuestion(q, q.correctAnswer);
      assert.equal(
        correctRes.isCorrect,
        true,
        `Question ${q.id} failed to grade its own correctAnswer (${q.correctAnswer}) as correct`
      );

      if (q.type === 'numeric') {
        assert.ok(q.unit && q.unit.length > 0, `Numeric question ${q.id} missing unit`);
        const tol = q.tolerance ?? 0;
        const wrongVal = Number(q.correctAnswer) + Math.max(tol * 10, 100);
        const wrongRes = gradeAssessmentQuestion(q, String(wrongVal));
        assert.equal(
          wrongRes.isCorrect,
          false,
          `Numeric question ${q.id} should reject out-of-tolerance value ${wrongVal}`
        );
      } else {
        assert.ok(q.options && q.options.length >= 3, `MCQ ${q.id} needs options`);
        const wrongIdx = (Number(q.correctAnswer) + 1) % q.options.length;
        const wrongRes = gradeAssessmentQuestion(q, wrongIdx);
        assert.equal(
          wrongRes.isCorrect,
          false,
          `MCQ ${q.id} should reject wrong option index ${wrongIdx}`
        );
      }
    }
  }
});

test('Verification 5: Assessments enforce exact 90% pass mark including boundary cases and never round <90% up to 90%', () => {
  // 20-question module assessment boundaries
  assert.equal(isNinetyPercentPass(20, 20), true);
  assert.equal(isNinetyPercentPass(19, 20), true);
  assert.equal(isNinetyPercentPass(18, 20), true); // 18/20 = exactly 90.0% -> PASS
  assert.equal(isNinetyPercentPass(17, 20), false); // 17/20 = 85.0% -> FAIL

  // 5-question topic assessment boundaries
  assert.equal(isNinetyPercentPass(5, 5), true); // 5/5 = 100% -> PASS
  assert.equal(isNinetyPercentPass(4, 5), false); // 4/5 = 80% -> FAIL

  // Boundary case where raw percentage is 89.47% or 89.95%: must FAIL and never display "90.0%"
  assert.equal(isNinetyPercentPass(17, 19), false); // 89.4736% -> FAIL
  assert.equal(formatAssessmentPercentage(17, 19), '89.4%');
  assert.equal(isNinetyPercentPass(899, 1000), false); // 89.9% -> FAIL
  assert.equal(formatAssessmentPercentage(899, 1000), '89.9%');
  assert.equal(formatAssessmentPercentage(18, 20), '90.0%');

  // Test evaluateAssessmentSubmission on Module 0's 20-question assessment
  const mod0 = getModuleByNumber(0)!;
  const qs = mod0.moduleAssessment;
  assert.equal(qs.length, 20);

  // Build 18/20 correct answers -> PASS
  const answers18: Record<string, string | number> = {};
  qs.forEach((q, idx) => {
    answers18[q.id] = idx < 18 ? q.correctAnswer : -999999;
  });
  const sub18 = evaluateAssessmentSubmission('MODULE-MOD-00', qs, answers18);
  assert.equal(sub18.correctCount, 18);
  assert.equal(sub18.passed, true);
  assert.equal(sub18.scorePercent, 90);

  // Build 17/20 correct answers -> FAIL
  const answers17: Record<string, string | number> = {};
  qs.forEach((q, idx) => {
    answers17[q.id] = idx < 17 ? q.correctAnswer : -999999;
  });
  const sub17 = evaluateAssessmentSubmission('MODULE-MOD-00', qs, answers17);
  assert.equal(sub17.correctCount, 17);
  assert.equal(sub17.passed, false);
  assert.equal(sub17.scorePercent, 85);
});

test('Verification 6, 7, 8, 9: Fresh user starts at 0%, failed exam stays 0%, passing 1 module gives 5% (1/20), and retakes do not double-count', () => {
  let state = createInitialCourseProgressState(ALL_SYLLABUS_MODULES);
  let summary = computeCourseProgressSummary(state, ALL_SYLLABUS_MODULES);

  // Fresh start = 0%
  assert.equal(summary.overallProgressPercent, 0);
  assert.equal(summary.completedModulesCount, 0);
  assert.equal(summary.totalModulesCount, 20);
  assert.equal(summary.passedTopicsCount, 0);
  assert.equal(summary.totalAttemptsCount, 0);
  assert.equal(state.attemptHistory.length, 0);

  // Failed Module 0 exam (17/20 = 85%) -> does NOT complete module
  state = recordAssessmentAttempt(state, {
    assessmentId: 'MODULE-MOD-00',
    assessmentType: 'module',
    moduleId: 'MOD-00',
    moduleNumber: 0,
    title: 'Module 0 Exam',
    scorePercent: 85,
    correctCount: 17,
    totalQuestions: 20,
    passed: false,
    timestampIso: '2026-10-30T10:00:00.000Z',
  });
  summary = computeCourseProgressSummary(state, ALL_SYLLABUS_MODULES);
  assert.equal(summary.completedModulesCount, 0);
  assert.equal(summary.overallProgressPercent, 0);
  assert.equal(summary.totalAttemptsCount, 1);
  assert.equal(state.modules['MOD-00'].passed, false);
  assert.equal(state.modules['MOD-00'].bestScorePercent, 85);

  // Passing Module 0 exam (18/20 = 90%) -> completes Module 0, overall progress = 1/20 = 5%
  state = recordAssessmentAttempt(state, {
    assessmentId: 'MODULE-MOD-00',
    assessmentType: 'module',
    moduleId: 'MOD-00',
    moduleNumber: 0,
    title: 'Module 0 Exam',
    scorePercent: 90,
    correctCount: 18,
    totalQuestions: 20,
    passed: true,
    timestampIso: '2026-10-30T10:15:00.000Z',
  });
  summary = computeCourseProgressSummary(state, ALL_SYLLABUS_MODULES);
  assert.equal(summary.completedModulesCount, 1);
  assert.equal(summary.overallProgressPercent, 5);
  assert.equal(state.modules['MOD-00'].passed, true);

  // Retaking Module 0 exam and passing again (20/20 = 100%) -> does NOT double count (stays 1/20 = 5%)
  state = recordAssessmentAttempt(state, {
    assessmentId: 'MODULE-MOD-00',
    assessmentType: 'module',
    moduleId: 'MOD-00',
    moduleNumber: 0,
    title: 'Module 0 Exam',
    scorePercent: 100,
    correctCount: 20,
    totalQuestions: 20,
    passed: true,
    timestampIso: '2026-10-30T10:30:00.000Z',
  });
  summary = computeCourseProgressSummary(state, ALL_SYLLABUS_MODULES);
  assert.equal(summary.completedModulesCount, 1);
  assert.equal(summary.overallProgressPercent, 5);
  assert.equal(state.modules['MOD-00'].bestScorePercent, 100);
  assert.equal(state.modules['MOD-00'].attemptsCount, 3);
});

test('Verification 10: Genuine progress survives reload via versioned storage without clearing unrelated keys', () => {
  const store: Record<string, string> = {
    unrelated_app_key: 'keep_me_intact',
    legacy_fake_progress: '{"xp":1240,"progress":45}',
  };
  const mockStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };

  // Fresh load ignores legacy keys and starts at 0%
  const loadedFresh = loadCourseProgressState(ALL_SYLLABUS_MODULES, mockStorage);
  assert.equal(
    computeCourseProgressSummary(loadedFresh, ALL_SYLLABUS_MODULES).overallProgressPercent,
    0
  );

  // Record a pass on Module 3 and save
  const afterPass = recordAssessmentAttempt(loadedFresh, {
    assessmentId: 'MODULE-MOD-03',
    assessmentType: 'module',
    moduleId: 'MOD-03',
    moduleNumber: 3,
    title: 'Module 3 Exam',
    scorePercent: 95,
    correctCount: 19,
    totalQuestions: 20,
    passed: true,
    timestampIso: '2026-10-30T11:00:00.000Z',
  });
  saveCourseProgressState(afterPass, mockStorage);
  assert.ok(store[PROGRESS_STORAGE_KEY]);

  // Reload and verify genuine progress survived
  const reloaded = loadCourseProgressState(ALL_SYLLABUS_MODULES, mockStorage);
  const reloadedSummary = computeCourseProgressSummary(reloaded, ALL_SYLLABUS_MODULES);
  assert.equal(reloadedSummary.completedModulesCount, 1);
  assert.equal(reloadedSummary.overallProgressPercent, 5);
  assert.equal(reloaded.modules['MOD-03'].passed, true);

  // Reset progress and verify unrelated_app_key is untouched
  const afterReset = resetCourseProgressState(ALL_SYLLABUS_MODULES, mockStorage);
  assert.equal(
    computeCourseProgressSummary(afterReset, ALL_SYLLABUS_MODULES).overallProgressPercent,
    0
  );
  assert.equal(store.unrelated_app_key, 'keep_me_intact');
});

test('Verification 11: Coverage map, Five Study Rules, 9-Part Calculation Note, Milestones A-F, and [UI1] requirements are complete', () => {
  const coverage = buildSyllabusCoverageMap(ALL_SYLLABUS_MODULES);
  assert.equal(coverage.length, 20);
  for (const modCov of coverage) {
    assert.equal(modCov.moduleAssessmentQuestions, 20);
    assert.ok(modCov.totalTopicQuestions >= 15);
    for (const topCov of modCov.topics) {
      assert.ok(topCov.topicQuestionCount >= 5);
      assert.ok(topCov.moduleQuestionCount >= 1);
    }
  }

  assert.equal(FIVE_STUDY_RULES.length, 5);
  assert.equal(CALCULATION_NOTE_STRUCTURE.length, 9);
  assert.equal(INTEGRATED_PROJECT_MILESTONES.length, 6);
  assert.equal(COURSE_DEVELOPMENT_REQUIREMENTS.length, 5);
});
