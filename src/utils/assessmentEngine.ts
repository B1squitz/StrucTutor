import {
  AssessmentAttemptRecord,
  AssessmentQuestion,
  AssessmentSubmissionResult,
  CourseProgressState,
  ModuleCoverageReport,
  QuestionSubmissionResult,
  NormalizedSyllabusModule,
} from '../types/syllabus';

export const PROGRESS_STORAGE_KEY = 'structtutor_course_progress_v2';
export const STORAGE_KEY_V2 = PROGRESS_STORAGE_KEY;
export const COURSE_REVISION_ID = '2026-rebuild-syllabus-v2.0';
export const PASS_MARK_PERCENT = 90;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Exact 90% pass check using integer arithmetic (correctCount * 10 >= totalQuestions * 9)
 * so floating-point noise or display rounding never passes a sub-90% score.
 */
export function isNinetyPercentPass(correctCount: number, totalQuestions: number): boolean {
  if (!Number.isInteger(correctCount) || !Number.isInteger(totalQuestions) || totalQuestions <= 0) {
    return false;
  }
  if (correctCount < 0 || correctCount > totalQuestions) {
    return false;
  }
  return correctCount * 10 >= totalQuestions * 9;
}

/**
 * Formats an assessment score percentage as a string (e.g. "90.0%", "85.0%", "89.4%").
 * Critical rule: a score strictly below 90% is truncated to 1 decimal place so
 * e.g. 17/19 (89.47%) or 899/1000 (89.9%) never rounds up to "90.0%".
 */
export function formatAssessmentPercentage(correctCount: number, totalQuestions: number): string {
  if (totalQuestions <= 0) {
    return '0.0%';
  }
  const exactPercentage = (correctCount / totalQuestions) * 100;
  const passed = isNinetyPercentPass(correctCount, totalQuestions);

  if (!passed) {
    const truncated = Math.floor(exactPercentage * 10) / 10;
    return `${truncated.toFixed(1)}%`;
  }

  return `${exactPercentage.toFixed(1)}%`;
}

/**
 * Grades a single question (numeric with tolerance or single-answer MCQ/scenario).
 */
export function gradeAssessmentQuestion(
  question: AssessmentQuestion,
  rawSubmittedAnswer: string | number | undefined
): QuestionSubmissionResult {
  const qType = question.type ?? question.questionType;

  if (qType === 'numeric') {
    const expected = Number(question.correctAnswer);
    const unit = question.unit ?? question.requiredUnit ?? '';
    const absTol =
      typeof question.toleranceAbs === 'number'
        ? question.toleranceAbs
        : typeof question.tolerance === 'number'
        ? question.tolerance
        : Math.max(Math.abs(expected) * 0.015, 1e-4);

    const strVal =
      rawSubmittedAnswer === undefined || rawSubmittedAnswer === null
        ? ''
        : String(rawSubmittedAnswer).trim();

    const numericToken = strVal
      .replace(/,/g, '')
      .match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    const parsed = numericToken ? Number(numericToken[0]) : NaN;

    const isCorrect =
      strVal.length > 0 &&
      Number.isFinite(parsed) &&
      Math.abs(parsed - expected) <= absTol + 1e-6;

    const expectedDisplay = `${expected} ${unit}`.trim();

    return {
      questionId: question.id,
      topicId: question.topicId,
      submittedValue: strVal.length > 0 ? `${strVal} ${unit}`.trim() : 'No answer submitted',
      isCorrect,
      correctAnswerDisplay: expectedDisplay,
      expectedDisplay,
      explanation: question.explanation,
      assumptionsAndLimitations: question.assumptions ?? question.assumptionsAndLimitations,
    };
  }

  // MCQ or Scenario question
  const options = question.options ?? [];
  const correctIdx =
    typeof question.correctOptionIndex === 'number'
      ? question.correctOptionIndex
      : Number(question.correctAnswer);

  const strVal =
    rawSubmittedAnswer === undefined || rawSubmittedAnswer === null
      ? ''
      : String(rawSubmittedAnswer).trim();
  const submittedIdx = strVal.length > 0 ? Number(strVal) : NaN;
  const isValidOption =
    Number.isInteger(submittedIdx) && submittedIdx >= 0 && submittedIdx < options.length;
  const isCorrect = isValidOption && submittedIdx === correctIdx;

  const expectedDisplay = options[correctIdx] ?? '';

  return {
    questionId: question.id,
    topicId: question.topicId,
    submittedValue: isValidOption ? options[submittedIdx] : 'No option selected',
    isCorrect,
    correctAnswerDisplay: expectedDisplay,
    expectedDisplay,
    explanation: question.explanation,
    assumptionsAndLimitations: question.assumptions ?? question.assumptionsAndLimitations,
  };
}

/**
 * Evaluates a complete Topic Assessment or End-of-Module Assessment submission.
 */
export function evaluateAssessmentSubmission(
  assessmentId: string,
  questions: AssessmentQuestion[],
  answersByQuestionId: Record<string, string | number>,
  submittedAtIso: string = new Date().toISOString()
): AssessmentSubmissionResult {
  const itemResults = questions.map((q) =>
    gradeAssessmentQuestion(q, answersByQuestionId[q.id])
  );

  const totalQuestions = questions.length;
  const correctCount = itemResults.filter((r) => r.isCorrect).length;
  const passed = isNinetyPercentPass(correctCount, totalQuestions);
  const exactPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const scorePercent = !passed
    ? Math.floor(exactPercent * 10) / 10
    : Math.round(exactPercent * 10) / 10;
  const displayPercentage = formatAssessmentPercentage(correctCount, totalQuestions);

  return {
    assessmentId,
    totalQuestions,
    correctCount,
    scorePercent,
    displayPercentage,
    passed,
    submittedAtIso,
    itemResults,
  };
}

/**
 * Creates a clean, zero-progress initial state with no fabricated history or demo scores.
 */
export function createInitialCourseProgressState(
  modules: NormalizedSyllabusModule[] = [],
  nowIso: string = new Date().toISOString()
): CourseProgressState {
  const modEntries: CourseProgressState['modules'] = {};
  const topEntries: CourseProgressState['topics'] = {};

  for (const mod of modules) {
    modEntries[mod.id] = {
      attemptsCount: 0,
      bestScorePercent: 0,
      passed: false,
      lastAttemptIso: null,
    };
    for (const top of mod.topics) {
      topEntries[top.id] = {
        attemptsCount: 0,
        bestScorePercent: 0,
        passed: false,
        lastAttemptIso: null,
      };
    }
  }

  return {
    schemaVersion: 2,
    courseRevisionId: COURSE_REVISION_ID,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    modules: modEntries,
    topics: topEntries,
    attemptHistory: [],
  };
}

/**
 * Records a genuine Topic Assessment or End-of-Module Assessment attempt.
 * Retakes update the attempt count and best score, and never double-count completed modules.
 */
export function recordAssessmentAttempt(
  prevState: CourseProgressState,
  params: {
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
  const timestampIso = params.timestampIso ?? new Date().toISOString();
  const strictlyPassed =
    params.passed && isNinetyPercentPass(params.correctCount, params.totalQuestions);
  const displayPercentage = formatAssessmentPercentage(
    params.correctCount,
    params.totalQuestions
  );

  const attemptRecord: AssessmentAttemptRecord = {
    attemptId: `${params.assessmentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    assessmentId: params.assessmentId,
    assessmentType: params.assessmentType,
    assessmentKind: params.assessmentType,
    moduleId: params.moduleId,
    moduleNumber: params.moduleNumber,
    topicId: params.topicId,
    title: params.title,
    timestampIso,
    correctCount: params.correctCount,
    totalQuestions: params.totalQuestions,
    scorePercent: params.scorePercent,
    exactPercentage: params.scorePercent,
    displayPercentage,
    passed: strictlyPassed,
  };

  const nextModules = { ...prevState.modules };
  const nextTopics = { ...prevState.topics };

  if (params.assessmentType === 'module') {
    const prevMod = nextModules[params.moduleId] ?? {
      attemptsCount: 0,
      bestScorePercent: 0,
      passed: false,
      lastAttemptIso: null,
    };
    nextModules[params.moduleId] = {
      attemptsCount: prevMod.attemptsCount + 1,
      bestScorePercent: Math.max(prevMod.bestScorePercent, params.scorePercent),
      passed: Boolean(prevMod.passed || strictlyPassed),
      lastAttemptIso: timestampIso,
    };
  } else if (params.topicId) {
    const prevTop = nextTopics[params.topicId] ?? {
      attemptsCount: 0,
      bestScorePercent: 0,
      passed: false,
      lastAttemptIso: null,
    };
    nextTopics[params.topicId] = {
      attemptsCount: prevTop.attemptsCount + 1,
      bestScorePercent: Math.max(prevTop.bestScorePercent, params.scorePercent),
      passed: Boolean(prevTop.passed || strictlyPassed),
      lastAttemptIso: timestampIso,
    };
  }

  return {
    ...prevState,
    updatedAtIso: timestampIso,
    modules: nextModules,
    topics: nextTopics,
    attemptHistory: [attemptRecord, ...prevState.attemptHistory].slice(0, 250),
  };
}

export interface CourseProgressSummary {
  overallProgressPercent: number;
  completedModulesCount: number;
  totalModulesCount: number;
  passedTopicsCount: number;
  totalTopicsCount: number;
  totalAttemptsCount: number;
}

/**
 * Computes overall course progress strictly from passed End-of-Module Assessments (at >=90%).
 * - Fresh start = 0% (0/20 modules completed).
 * - Passing 1 module = 5% (1/20 modules completed).
 * - Retaking a passed module never double-counts completion.
 */
export function computeCourseProgressSummary(
  state: CourseProgressState,
  modules: NormalizedSyllabusModule[]
): CourseProgressSummary {
  const totalModulesCount = modules.length; // 20
  let completedModulesCount = 0;
  let passedTopicsCount = 0;
  let totalTopicsCount = 0;

  for (const mod of modules) {
    if (state.modules[mod.id]?.passed) {
      completedModulesCount += 1;
    }
    for (const top of mod.topics) {
      totalTopicsCount += 1;
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

function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Loads genuine v2 course progress from versioned storage, ignoring any older
 * keys so legacy demo data never reappears.
 */
export function loadCourseProgressState(
  modules: NormalizedSyllabusModule[],
  customStorage?: StorageLike | null
): CourseProgressState {
  const storage = customStorage !== undefined ? customStorage : getDefaultStorage();
  const fresh = createInitialCourseProgressState(modules);
  if (!storage) {
    return fresh;
  }

  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<CourseProgressState>;
    if (
      parsed &&
      parsed.schemaVersion === 2 &&
      parsed.courseRevisionId === COURSE_REVISION_ID &&
      typeof parsed.modules === 'object' &&
      parsed.modules !== null &&
      typeof parsed.topics === 'object' &&
      parsed.topics !== null &&
      Array.isArray(parsed.attemptHistory)
    ) {
      return {
        ...fresh,
        createdAtIso: parsed.createdAtIso ?? fresh.createdAtIso,
        updatedAtIso: parsed.updatedAtIso ?? fresh.updatedAtIso,
        modules: { ...fresh.modules, ...parsed.modules },
        topics: { ...fresh.topics, ...parsed.topics },
        attemptHistory: parsed.attemptHistory,
      };
    }
    return fresh;
  } catch {
    return fresh;
  }
}

export function saveCourseProgressState(
  state: CourseProgressState,
  customStorage?: StorageLike | null
): boolean {
  const storage = customStorage !== undefined ? customStorage : getDefaultStorage();
  if (!storage) return false;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function resetCourseProgressState(
  modules: NormalizedSyllabusModule[],
  customStorage?: StorageLike | null
): CourseProgressState {
  const fresh = createInitialCourseProgressState(modules);
  const storage = customStorage !== undefined ? customStorage : getDefaultStorage();
  if (storage) {
    try {
      storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore write error in restricted mode
    }
  }
  return fresh;
}

/**
 * Builds the Syllabus-to-Assessment Coverage Map across all 20 modules.
 */
export function buildSyllabusCoverageMap(
  modules: NormalizedSyllabusModule[]
): ModuleCoverageReport[] {
  return modules.map((mod) => {
    const topicRows = mod.topics.map((top) => {
      const modQuestionsForTopic = mod.moduleAssessment.filter(
        (mq) => mq.topicId === top.id
      );
      return {
        topicId: top.id,
        code: top.code,
        title: top.title,
        topicQuestionCount: top.assessmentQuestions.length,
        moduleQuestionCount: modQuestionsForTopic.length,
        questionIds: [
          ...top.assessmentQuestions.map((q) => q.id),
          ...modQuestionsForTopic.map((q) => q.id),
        ],
      };
    });

    const totalTopicQuestions = topicRows.reduce(
      (sum, r) => sum + r.topicQuestionCount,
      0
    );

    return {
      moduleId: mod.id,
      moduleNumber: mod.moduleNumber,
      title: mod.title,
      topicCount: mod.topics.length,
      totalTopicQuestions,
      moduleAssessmentQuestions: mod.moduleAssessment.length,
      topics: topicRows,
    };
  });
}
