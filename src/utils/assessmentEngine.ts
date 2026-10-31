import type {
  AssessmentQuestion,
  AssessmentSubmissionResult,
  CourseProgressState,
  ModuleProgressRecord,
  NormalizedSyllabusModule,
  QuestionGradeOutcome,
  ReviewStatus,
  TopicProgressRecord,
  TutorPracticePersistedState,
} from '../types/syllabus';
import { SYLLABUS_REVISION_ID } from '../data/syllabusMetadata';
import { tryConvertEngineeringUnit } from './tutorEngine';
import { formatEngineeringNumber } from './beamEngine';

export const PROGRESS_STORAGE_KEY = 'structtutor_course_progress_v2';
export const TOPIC_PASS_THRESHOLD_PERCENT = 90;
const LEGACY_STORAGE_KEYS = [
  'structtutor_course_progress_v1',
  'structtutor_progress',
];

const IDB_DB_NAME = 'StructTutorOfflineDB';
const IDB_STORE_NAME = 'course_progress';
const IDB_RECORD_KEY = 'active_learner_profile';

export type { QuestionGradeOutcome };

export function isNinetyPercentPass(
  correctCount: number,
  totalQuestions: number
): boolean {
  if (totalQuestions <= 0) return false;
  return correctCount * 10 >= totalQuestions * 9;
}

/**
 * Formats an assessment percentage truncated to 1 decimal place (never rounding <90% up to 90.0%)
 * as required by Verification 5 in tutorEngine.test.ts.
 */
export function formatAssessmentPercentage(
  correctCount: number,
  totalQuestions: number
): string {
  if (totalQuestions <= 0) return '0.0%';
  const rawPct = (correctCount / totalQuestions) * 100;
  const truncatedTenths = Math.floor(rawPct * 10 + 1e-9) / 10;
  return `${truncatedTenths.toFixed(1)}%`;
}

function hashStringSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface ShuffledMcqPresentation {
  options: string[];
  correctOptionIndex: number;
  shuffledToOriginalIndex: number[];
  originalToShuffledIndex: number[];
}

export function shuffleMcqOptionsWithSeed(
  question: Pick<AssessmentQuestion, 'id' | 'options' | 'correctOptionIndex' | 'correctAnswer'>,
  attemptSeed: string | number = 'default-seed'
): ShuffledMcqPresentation {
  const rawOptions = question.options ?? [];
  const origCorrect = Number(question.correctOptionIndex ?? question.correctAnswer ?? 0);
  const n = rawOptions.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  if (n > 1) {
    let state = hashStringSeed(`${question.id}::${String(attemptSeed)}`);
    const nextRand = () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }
  }

  const options = indices.map((origIdx) => rawOptions[origIdx]);
  const originalToShuffledIndex = new Array<number>(n);
  indices.forEach((origIdx, shufIdx) => {
    originalToShuffledIndex[origIdx] = shufIdx;
  });

  const correctOptionIndex = originalToShuffledIndex[origCorrect] ?? 0;

  return {
    options,
    correctOptionIndex,
    shuffledToOriginalIndex: indices,
    originalToShuffledIndex,
  };
}

export interface GradeAssessmentOptions {
  attemptSeed?: string | number;
  selectedUnit?: string;
  answerUsesShuffledIndex?: boolean;
}

function parseNumericWithUnit(
  rawAnswer: string | number,
  explicitSelectedUnit?: string
): { numericValue: number; detectedUnit?: string } {
  if (typeof rawAnswer === 'number') {
    return { numericValue: rawAnswer, detectedUnit: explicitSelectedUnit };
  }
  const trimmed = String(rawAnswer ?? '').trim();
  if (!trimmed) {
    return { numericValue: Number.NaN, detectedUnit: explicitSelectedUnit };
  }

  const match = trimmed.match(
    /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-zA-Z°²³⁴/·^0-9-]+)?$/i
  );
  if (match) {
    const numericValue = Number(match[1]);
    const inlineUnit = match[2]?.trim();
    return {
      numericValue,
      detectedUnit: explicitSelectedUnit || inlineUnit,
    };
  }

  return { numericValue: Number(trimmed), detectedUnit: explicitSelectedUnit };
}

export function gradeAssessmentQuestion(
  question: AssessmentQuestion,
  rawAnswer: string | number | undefined,
  options?: GradeAssessmentOptions
): QuestionGradeOutcome {
  if (question.type === 'mcq') {
    const rawOpts = question.options ?? [];
    const origCorrectIdx = Number(
      question.correctOptionIndex ?? question.correctAnswer ?? 0
    );

    let shuffled: ShuffledMcqPresentation | undefined;
    if (options?.attemptSeed !== undefined) {
      shuffled = shuffleMcqOptionsWithSeed(question, options.attemptSeed);
    }

    const parsedIdx =
      typeof rawAnswer === 'number'
        ? rawAnswer
        : rawAnswer !== undefined && String(rawAnswer).trim() !== ''
        ? Number(rawAnswer)
        : -1;

    let isCorrect = false;
    if (Number.isInteger(parsedIdx) && parsedIdx >= 0) {
      if (shuffled && options?.answerUsesShuffledIndex) {
        isCorrect = parsedIdx === shuffled.correctOptionIndex;
      } else {
        isCorrect = parsedIdx === origCorrectIdx;
      }
    }

    const expectedText =
      rawOpts[origCorrectIdx] ?? `Option ${origCorrectIdx + 1}`;
    return {
      questionId: question.id,
      isCorrect,
      userAnswer: rawAnswer ?? '',
      expectedDisplay: expectedText,
      explanation: question.explanation,
      shuffledOptions: shuffled?.options,
      shuffledCorrectIndex: shuffled?.correctOptionIndex,
    };
  }

  // Numeric question grading with unit-aware conversion (N4)
  const target = Number(question.correctAnswer ?? 0);
  const requiredUnit = question.unit ?? '';
  const baseTol =
    question.tolerance ?? Math.max(Math.abs(target) * 0.02, 1e-4);

  const { numericValue, detectedUnit } = parseNumericWithUnit(
    rawAnswer ?? '',
    options?.selectedUnit
  );

  if (!Number.isFinite(numericValue)) {
    return {
      questionId: question.id,
      isCorrect: false,
      userAnswer: rawAnswer ?? '',
      expectedDisplay: `${formatEngineeringNumber(target)}${
        requiredUnit ? ` ${requiredUnit}` : ''
      }`,
      explanation: question.explanation,
      unitRequired: requiredUnit,
      unitDiagnostic: 'No valid numeric value entered.',
    };
  }

  let valueInCanonicalUnit = numericValue;
  let unitDiagnostic: string | undefined;

  if (detectedUnit && requiredUnit && detectedUnit !== requiredUnit) {
    const conv = tryConvertEngineeringUnit(
      numericValue,
      detectedUnit,
      requiredUnit
    );
    if (conv.ok) {
      valueInCanonicalUnit = conv.convertedValue;
      unitDiagnostic = `Converted ${formatEngineeringNumber(
        numericValue
      )} ${detectedUnit} → ${formatEngineeringNumber(
        valueInCanonicalUnit
      )} ${requiredUnit}.`;
    } else {
      return {
        questionId: question.id,
        isCorrect: false,
        userAnswer: rawAnswer ?? '',
        expectedDisplay: `${formatEngineeringNumber(target)}${
          requiredUnit ? ` ${requiredUnit}` : ''
        }`,
        explanation: question.explanation,
        unitRequired: requiredUnit,
        unitDiagnostic: conv.error,
      };
    }
  }

  const diff = Math.abs(valueInCanonicalUnit - target);
  const isCorrect = diff <= baseTol;

  if (!isCorrect && target !== 0) {
    const ratio = Math.abs(valueInCanonicalUnit / target);
    if (
      Math.abs(ratio - 1000) < 25 ||
      Math.abs(ratio - 0.001) < 2.5e-5 ||
      Math.abs(ratio - 1e6) < 25000 ||
      Math.abs(ratio - 1e-6) < 2.5e-8
    ) {
      unitDiagnostic = `Power-of-ten unit scaling error detected: your digits match ${formatEngineeringNumber(
        target
      )} ${requiredUnit}, but are scaled by 10³ or 10⁶.`;
    } else if (Math.abs(valueInCanonicalUnit + target) <= baseTol) {
      unitDiagnostic = `Sign convention error: magnitude matches ${formatEngineeringNumber(
        Math.abs(target)
      )} ${requiredUnit}, but sign is opposite.`;
    }
  }

  return {
    questionId: question.id,
    isCorrect,
    userAnswer: rawAnswer ?? '',
    expectedDisplay: `${formatEngineeringNumber(target)}${
      requiredUnit ? ` ${requiredUnit}` : ''
    }`,
    explanation: question.explanation,
    unitRequired: requiredUnit,
    unitDiagnostic,
  };
}

export function evaluateAssessmentSubmission(
  assessmentId: string,
  questions: AssessmentQuestion[],
  userAnswers: Record<string, string | number>,
  options?: {
    attemptSeed?: string | number;
    selectedUnits?: Record<string, string>;
    answerUsesShuffledIndex?: boolean;
  }
): AssessmentSubmissionResult {
  const questionOutcomes: Record<string, QuestionGradeOutcome> = {};
  let correctCount = 0;

  for (const q of questions) {
    const ans = userAnswers[q.id];
    const outcome = gradeAssessmentQuestion(q, ans, {
      attemptSeed: options?.attemptSeed,
      selectedUnit: options?.selectedUnits?.[q.id],
      answerUsesShuffledIndex: options?.answerUsesShuffledIndex,
    });
    questionOutcomes[q.id] = outcome;
    if (outcome.isCorrect) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length;
  const rawPct = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const scorePercent = Math.floor(rawPct * 10 + 1e-9) / 10;
  const passed = isNinetyPercentPass(correctCount, totalQuestions);

  return {
    assessmentId,
    totalQuestions,
    correctCount,
    scorePercent,
    passed,
    passMarkPercent: 90,
    questionOutcomes,
    submittedAtIso: new Date().toISOString(),
  };
}

export function createInitialCourseProgressState(
  modules: NormalizedSyllabusModule[]
): CourseProgressState {
  const now = new Date().toISOString();
  const topics: Record<string, TopicProgressRecord> = {};
  const modMap: Record<string, ModuleProgressRecord> = {};

  for (const mod of modules) {
    modMap[mod.id] = {
      moduleId: mod.id,
      moduleNumber: mod.moduleNumber,
      attemptsCount: 0,
      bestScorePercent: 0,
      lastScorePercent: null,
      passed: false,
      lastAttemptIso: null,
    };
    for (const top of mod.topics) {
      topics[top.id] = {
        topicId: top.id,
        moduleId: mod.id,
        moduleNumber: mod.moduleNumber,
        attemptsCount: 0,
        bestScorePercent: 0,
        lastScorePercent: null,
        passed: false,
        lastAttemptIso: null,
      };
    }
  }

  return {
    version: 2,
    syllabusRevisionId: SYLLABUS_REVISION_ID,
    initializedAtIso: now,
    lastUpdatedAtIso: now,
    modules: modMap,
    topics,
    attemptHistory: [],
    completedDesignScenarios: [],
    questionReviewOverrides: {},
  };
}

export function recordAssessmentAttempt(
  state: CourseProgressState,
  input: {
    assessmentId: string;
    assessmentType: 'topic' | 'module';
    moduleId: string;
    moduleNumber: number;
    topicId?: string;
    title: string;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
    timestampIso?: string;
  }
): CourseProgressState {
  const now = input.timestampIso ?? new Date().toISOString();
  const passed =
    input.passed && isNinetyPercentPass(input.correctCount, input.totalQuestions);

  const nextTopics = { ...state.topics };
  const nextModules = { ...state.modules };

  if (input.assessmentType === 'topic' && input.topicId) {
    const prev = nextTopics[input.topicId] ?? {
      topicId: input.topicId,
      moduleId: input.moduleId,
      moduleNumber: input.moduleNumber,
      attemptsCount: 0,
      bestScorePercent: 0,
      lastScorePercent: null,
      passed: false,
      lastAttemptIso: null,
    };
    nextTopics[input.topicId] = {
      ...prev,
      attemptsCount: prev.attemptsCount + 1,
      bestScorePercent: Math.max(prev.bestScorePercent, input.scorePercent),
      lastScorePercent: input.scorePercent,
      passed: prev.passed || passed,
      lastAttemptIso: now,
    };
  } else {
    const prevMod = nextModules[input.moduleId] ?? {
      moduleId: input.moduleId,
      moduleNumber: input.moduleNumber,
      attemptsCount: 0,
      bestScorePercent: 0,
      lastScorePercent: null,
      passed: false,
      lastAttemptIso: null,
    };
    nextModules[input.moduleId] = {
      ...prevMod,
      attemptsCount: prevMod.attemptsCount + 1,
      bestScorePercent: Math.max(prevMod.bestScorePercent, input.scorePercent),
      lastScorePercent: input.scorePercent,
      passed: prevMod.passed || passed,
      lastAttemptIso: now,
    };
  }

  const logItem = {
    attemptId: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    assessmentId: input.assessmentId,
    assessmentType: input.assessmentType,
    moduleId: input.moduleId,
    moduleNumber: input.moduleNumber,
    topicId: input.topicId,
    title: input.title,
    scorePercent: input.scorePercent,
    correctCount: input.correctCount,
    totalQuestions: input.totalQuestions,
    passed,
    timestampIso: now,
  };

  return {
    ...state,
    lastUpdatedAtIso: now,
    modules: nextModules,
    topics: nextTopics,
    attemptHistory: [logItem, ...state.attemptHistory].slice(0, 250),
  };
}

export function saveTutorSessionToProgress(
  state: CourseProgressState,
  tutorPractice: TutorPracticePersistedState
): CourseProgressState {
  const now = new Date().toISOString();
  return {
    ...state,
    lastUpdatedAtIso: now,
    tutorPractice: {
      ...tutorPractice,
      lastUpdatedIso: now,
    },
  };
}

export function computeCourseProgressSummary(
  state: CourseProgressState,
  modules: NormalizedSyllabusModule[]
) {
  const totalModulesCount = modules.length;
  const totalTopicsCount = modules.reduce((acc, m) => acc + m.topics.length, 0);

  let completedModulesCount = 0;
  let passedTopicsCount = 0;

  for (const mod of modules) {
    if (state.modules[mod.id]?.passed) {
      completedModulesCount += 1;
    }
    for (const top of mod.topics) {
      if (state.topics[top.id]?.passed) {
        passedTopicsCount += 1;
      }
    }
  }

  const overallProgressPercent =
    totalModulesCount > 0
      ? Math.round((completedModulesCount / totalModulesCount) * 100)
      : 0;

  return {
    overallProgressPercent,
    completedModulesCount,
    totalModulesCount,
    passedTopicsCount,
    totalTopicsCount,
    totalAttemptsCount: state.attemptHistory.length,
  };
}

/**
 * Non-destructive migration of stored progress across schema versions or syllabusRevisionId updates (N7).
 * Never wipes user progress when syllabusRevisionId changes.
 */
export function migrateCourseProgressState(
  rawParsed: Record<string, unknown> | null | undefined,
  modules: NormalizedSyllabusModule[]
): CourseProgressState {
  const fresh = createInitialCourseProgressState(modules);
  if (!rawParsed || typeof rawParsed !== 'object') {
    return fresh;
  }

  const mergedModules = { ...fresh.modules };
  const rawModules = (rawParsed.modules ?? rawParsed.moduleProgress) as
    | Record<string, Partial<ModuleProgressRecord> & { examPassed?: boolean; examBestScorePercent?: number; examAttemptsCount?: number }>
    | undefined;

  if (rawModules && typeof rawModules === 'object') {
    for (const mod of modules) {
      const saved =
        rawModules[mod.id] ?? rawModules[String(mod.moduleNumber)];
      if (saved && typeof saved === 'object') {
        mergedModules[mod.id] = {
          moduleId: mod.id,
          moduleNumber: mod.moduleNumber,
          attemptsCount: Number(
            saved.attemptsCount ?? saved.examAttemptsCount ?? 0
          ),
          bestScorePercent: Number(
            saved.bestScorePercent ?? saved.examBestScorePercent ?? 0
          ),
          lastScorePercent:
            saved.lastScorePercent !== undefined ? saved.lastScorePercent : null,
          passed: Boolean(saved.passed ?? saved.examPassed),
          lastAttemptIso: saved.lastAttemptIso ?? null,
        };
      }
    }
  }

  const mergedTopics = { ...fresh.topics };
  const rawTopics = (rawParsed.topics ?? rawParsed.topicProgress) as
    | Record<string, Partial<TopicProgressRecord>>
    | undefined;

  if (rawTopics && typeof rawTopics === 'object') {
    for (const [tid, saved] of Object.entries(rawTopics)) {
      const legacyMatch = /^M(\d+)-T(\d+)$/i.exec(tid);
      const normalizedTid = legacyMatch
        ? `MOD${String(Number(legacyMatch[1])).padStart(2, '0')}-T${legacyMatch[2]}`
        : tid;
      if (saved && typeof saved === 'object' && mergedTopics[normalizedTid]) {
        mergedTopics[normalizedTid] = {
          ...mergedTopics[normalizedTid],
          attemptsCount: Number(saved.attemptsCount ?? 0),
          bestScorePercent: Number(saved.bestScorePercent ?? 0),
          lastScorePercent:
            saved.lastScorePercent !== undefined ? saved.lastScorePercent : null,
          passed: Boolean(saved.passed),
          lastAttemptIso: saved.lastAttemptIso ?? null,
        };
      }
    }
  }

  const attemptHistory = Array.isArray(rawParsed.attemptHistory)
    ? (rawParsed.attemptHistory as CourseProgressState['attemptHistory'])
    : [];

  const completedDesignScenarios = Array.isArray(
    rawParsed.completedDesignScenarios
  )
    ? (rawParsed.completedDesignScenarios as string[])
    : [];

  const questionReviewOverrides =
    rawParsed.questionReviewOverrides &&
    typeof rawParsed.questionReviewOverrides === 'object'
      ? (rawParsed.questionReviewOverrides as Record<string, ReviewStatus>)
      : {};

  return {
    version: 2,
    syllabusRevisionId: SYLLABUS_REVISION_ID,
    initializedAtIso: String(
      rawParsed.initializedAtIso ?? fresh.initializedAtIso
    ),
    lastUpdatedAtIso: String(
      rawParsed.lastUpdatedAtIso ?? fresh.lastUpdatedAtIso
    ),
    modules: mergedModules,
    topics: mergedTopics,
    attemptHistory,
    tutorPractice: rawParsed.tutorPractice as TutorPracticePersistedState | undefined,
    completedDesignScenarios,
    questionReviewOverrides,
  };
}

export function loadCourseProgressState(
  modules: NormalizedSyllabusModule[],
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined =
    typeof window !== 'undefined' ? window.localStorage : undefined
): CourseProgressState {
  if (!storage) {
    return createInitialCourseProgressState(modules);
  }

  try {
    let rawJson = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!rawJson) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const candidate = storage.getItem(legacyKey);
        if (candidate) {
          rawJson = candidate;
          break;
        }
      }
    }
    if (!rawJson) {
      const initial = createInitialCourseProgressState(modules);
      storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const migrated = migrateCourseProgressState(parsed, modules);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return createInitialCourseProgressState(modules);
  }
}

export function saveCourseProgressState(
  state: CourseProgressState,
  storage: Pick<Storage, 'setItem'> | undefined =
    typeof window !== 'undefined' ? window.localStorage : undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
  void syncCourseProgressToIndexedDB(state);
}

export function resetCourseProgressState(
  modules: NormalizedSyllabusModule[],
  storage: Pick<Storage, 'setItem'> | undefined =
    typeof window !== 'undefined' ? window.localStorage : undefined
): CourseProgressState {
  const fresh = createInitialCourseProgressState(modules);
  saveCourseProgressState(fresh, storage);
  return fresh;
}

export function exportCourseProgressJson(state: CourseProgressState): string {
  return JSON.stringify(
    {
      schema: 'StructTutorCourseProgressBackup',
      exportedAt: new Date().toISOString(),
      appVersion: '0.2.0',
      state,
    },
    null,
    2
  );
}

export function importCourseProgressJson(
  jsonText: string,
  modules: NormalizedSyllabusModule[]
): { ok: true; state: CourseProgressState } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const candidateState = (
      parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed
    ) as Record<string, unknown>;
    if (
      !candidateState.modules &&
      !candidateState.topics &&
      !candidateState.topicProgress &&
      !candidateState.tutorPractice
    ) {
      return {
        ok: false,
        error:
          'Invalid backup file: missing modules, topics, or tutorPractice records.',
      };
    }
    const migrated = migrateCourseProgressState(candidateState, modules);
    return { ok: true, state: migrated };
  } catch (err) {
    return {
      ok: false,
      error: `Failed to parse JSON backup: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

export async function syncCourseProgressToIndexedDB(
  state: CourseProgressState
): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
        tx.objectStore(IDB_STORE_NAME).put(state, IDB_RECORD_KEY);
        tx.oncomplete = () => {
          db.close();
          resolve(true);
        };
        tx.onerror = () => {
          db.close();
          resolve(false);
        };
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function loadCourseProgressFromIndexedDB(
  modules: NormalizedSyllabusModule[]
): Promise<CourseProgressState | null> {
  if (typeof indexedDB === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(IDB_STORE_NAME, 'readonly');
        const getReq = tx.objectStore(IDB_STORE_NAME).get(IDB_RECORD_KEY);
        getReq.onsuccess = () => {
          db.close();
          if (getReq.result) {
            resolve(
              migrateCourseProgressState(
                getReq.result as Record<string, unknown>,
                modules
              )
            );
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => {
          db.close();
          resolve(null);
        };
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function buildSyllabusCoverageMap(modules: NormalizedSyllabusModule[]) {
  return modules.map((mod) => {
    const totalTopicQuestions = mod.topics.reduce(
      (acc, t) => acc + t.assessmentQuestions.length,
      0
    );
    const moduleAssessmentQuestions = mod.moduleAssessment.length;

    const topics = mod.topics.map((t) => {
      const moduleQuestionCount = mod.moduleAssessment.filter(
        (mq) => mq.topicId === t.id
      ).length;
      return {
        topicId: t.id,
        code: t.code,
        title: t.title,
        topicQuestionCount: t.assessmentQuestions.length,
        moduleQuestionCount: Math.max(1, moduleQuestionCount),
      };
    });

    return {
      moduleId: mod.id,
      moduleNumber: mod.moduleNumber,
      code: mod.code,
      title: mod.title,
      topicsCount: mod.topics.length,
      workedExamplesCount: mod.workedExamples.length,
      learningGatesCount: mod.learningGates.length,
      totalTopicQuestions,
      moduleAssessmentQuestions,
      totalQuestions: totalTopicQuestions + moduleAssessmentQuestions,
      topics,
    };
  });
}

export interface AdaptiveStudyPlanResult {
  learnerPaceMode: 'Accelerated' | 'Standard' | 'Consolidation';
  averageRecentScorePercent: number;
  nextRecommendedTopic: {
    moduleNumber: number;
    topicId: string;
    title: string;
    rationale: string;
  };
  dueReviews: Array<{
    targetId: string;
    moduleNumber: number;
    title: string;
    reason: string;
    priorityScore: number;
  }>;
}

export function computeAdaptiveStudyPlan(
  state: CourseProgressState,
  modules?: NormalizedSyllabusModule[]
): AdaptiveStudyPlanResult {
  const recent = state.attemptHistory.slice(0, 8);
  const avgScore =
    recent.length > 0
      ? Math.round(
          recent.reduce((acc, a) => acc + a.scorePercent, 0) / recent.length
        )
      : 0;

  const learnerPaceMode: AdaptiveStudyPlanResult['learnerPaceMode'] =
    recent.length >= 2 && avgScore >= 92
      ? 'Accelerated'
      : recent.length >= 1 && avgScore < 80
      ? 'Consolidation'
      : 'Standard';

  const dueReviews: AdaptiveStudyPlanResult['dueReviews'] = [];
  const nowMs = Date.now();

  for (const topRec of Object.values(state.topics)) {
    if (topRec.attemptsCount > 0 && !topRec.passed) {
      dueReviews.push({
        targetId: topRec.topicId,
        moduleNumber: topRec.moduleNumber,
        title: `Topic ${topRec.topicId} (Module ${topRec.moduleNumber})`,
        reason: `Best score ${topRec.bestScorePercent.toFixed(
          0
        )}% is below the 90% pass gate.`,
        priorityScore: 100 - topRec.bestScorePercent,
      });
    } else if (topRec.passed && topRec.lastAttemptIso) {
      const days = Math.floor(
        (nowMs - new Date(topRec.lastAttemptIso).getTime()) / 86_400_000
      );
      if (days >= 7) {
        dueReviews.push({
          targetId: topRec.topicId,
          moduleNumber: topRec.moduleNumber,
          title: `Topic ${topRec.topicId} (Module ${topRec.moduleNumber})`,
          reason: `Spaced retention review (${days} days since last pass).`,
          priorityScore: 50 + days,
        });
      }
    }
  }

  dueReviews.sort((a, b) => b.priorityScore - a.priorityScore);

  // Pick next unpassed topic in sequence
  let nextModNum = 0;
  let nextTopId = 'M0-T1';
  let nextTitle = 'Topic 0.1: Units, Conversions & Dimensional Consistency';
  let rationale =
    'Start with Module 0 Topic 0.1 to establish strict SI dimensional consistency.';

  if (dueReviews.length > 0) {
    nextModNum = dueReviews[0].moduleNumber;
    nextTopId = dueReviews[0].targetId;
    nextTitle = dueReviews[0].title;
    rationale = dueReviews[0].reason;
  } else if (modules && modules.length > 0) {
    outer: for (const mod of modules) {
      for (const top of mod.topics) {
        if (!state.topics[top.id]?.passed) {
          nextModNum = mod.moduleNumber;
          nextTopId = top.id;
          nextTitle = `${top.code}: ${top.title}`;
          rationale = `Next unpassed syllabus gate in ${mod.code}.`;
          break outer;
        }
      }
    }
  }

  return {
    learnerPaceMode,
    averageRecentScorePercent: avgScore,
    nextRecommendedTopic: {
      moduleNumber: nextModNum,
      topicId: nextTopId,
      title: nextTitle,
      rationale,
    },
    dueReviews: dueReviews.slice(0, 6),
  };
}
