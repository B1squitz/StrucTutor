import type { AssessmentQuestion, SyllabusModule } from '../types/syllabus';

export interface SchemaValidationReport {
  valid: boolean;
  totalModules: number;
  totalTopics: number;
  totalQuestions: number;
  numericQuestions: number;
  mcqQuestions: number;
  verifiedCount: number;
  draftCount: number;
  mcqLongestCorrectCount: number;
  mcqLongestCorrectRatio: number;
  imperialViolations: string[];
  dependencyViolations: string[];
  duplicateFieldViolations: string[];
  emDashViolations: string[];
  shortExplanationViolations: string[];
  errors: string[];
}

const LEGACY_DUPLICATE_FIELDS = [
  'questionType',
  'requiredUnit',
  'toleranceAbs',
  'assumptionsAndLimitations',
];

const IMPERIAL_REGEX = /\b(inch|inches|foot|feet|ft|lbs|psi|kip|kips|9-inch|yard|yards)\b/i;

const DEPENDENCY_REGEX =
  /\b(the same|previous question|above beam|prior question|Syllabus Example|Example\s+\d+\.\d+)\b/i;

export function validateQuestionSchema(rawQ: Record<string, unknown>): string[] {
  const errs: string[] = [];
  const id = typeof rawQ.id === 'string' ? rawQ.id : 'UNKNOWN_ID';

  for (const legacyKey of LEGACY_DUPLICATE_FIELDS) {
    if (legacyKey in rawQ) {
      errs.push(`${id}: contains retired duplicate field "${legacyKey}"`);
    }
  }

  if (typeof rawQ.id !== 'string' || !rawQ.id.trim()) {
    errs.push(`${id}: missing non-empty id`);
  }
  if (typeof rawQ.moduleNumber !== 'number' || rawQ.moduleNumber < 0 || rawQ.moduleNumber > 19) {
    errs.push(`${id}: invalid moduleNumber`);
  }
  if (typeof rawQ.topicId !== 'string' || !rawQ.topicId.trim()) {
    errs.push(`${id}: missing topicId`);
  }
  if (typeof rawQ.learningObjective !== 'string' || !rawQ.learningObjective.trim()) {
    errs.push(`${id}: missing learningObjective`);
  }
  if (rawQ.type !== 'numeric' && rawQ.type !== 'mcq' && rawQ.type !== 'scenario') {
    errs.push(`${id}: invalid question type "${String(rawQ.type)}"`);
  }
  if (typeof rawQ.prompt !== 'string' || rawQ.prompt.trim().length < 20) {
    errs.push(`${id}: prompt is missing or too short`);
  }
  const hasAssumptions =
    (typeof rawQ.assumptions === 'string' && rawQ.assumptions.trim().length > 0) ||
    (Array.isArray(rawQ.assumptions) &&
      rawQ.assumptions.length > 0 &&
      typeof rawQ.assumptions[0] === 'string' &&
      rawQ.assumptions[0].trim().length > 0);
  if (!hasAssumptions) {
    errs.push(`${id}: missing assumptions`);
  }
  if (typeof rawQ.explanation !== 'string' || rawQ.explanation.trim().length < 80) {
    errs.push(`${id}: explanation must be at least 80 characters (got ${String(rawQ.explanation || '').length})`);
  }
  const hasCitation =
    (typeof rawQ.citation === 'string' && rawQ.citation.trim().length > 0) ||
    (rawQ.citation && typeof rawQ.citation === 'object');
  if (!hasCitation) {
    errs.push(`${id}: missing citation`);
  }
  if (!Array.isArray(rawQ.hints) || rawQ.hints.length < 2) {
    errs.push(`${id}: must include at least 2 progressive hints`);
  }
  if (typeof rawQ.caseFamilyId !== 'string' || !rawQ.caseFamilyId.trim()) {
    errs.push(`${id}: missing caseFamilyId`);
  }
  if (
    rawQ.reviewStatus !== 'Draft' &&
    rawQ.reviewStatus !== 'Verified' &&
    rawQ.reviewStatus !== 'Reviewed' &&
    rawQ.reviewStatus !== 'Flagged' &&
    rawQ.reviewStatus !== 'Pending Review' &&
    rawQ.reviewStatus !== 'Corrected'
  ) {
    errs.push(`${id}: invalid reviewStatus "${String(rawQ.reviewStatus)}"`);
  }
  if (rawQ.reviewStatus === 'Verified' && !rawQ.solverVerificationId) {
    errs.push(`${id}: reviewStatus is "Verified" without a solverVerificationId`);
  }

  if (rawQ.type === 'numeric') {
    if (typeof rawQ.correctAnswer !== 'number' || !Number.isFinite(rawQ.correctAnswer)) {
      errs.push(`${id}: numeric question missing finite correctAnswer`);
    }
    if (typeof rawQ.tolerance !== 'number' || rawQ.tolerance < 0) {
      errs.push(`${id}: numeric question missing non-negative tolerance`);
    }
    if (typeof rawQ.unit !== 'string') {
      errs.push(`${id}: numeric question missing unit string`);
    }
  } else if (rawQ.type === 'mcq') {
    if (!Array.isArray(rawQ.options) || rawQ.options.length < 4) {
      errs.push(`${id}: mcq question must have at least 4 options`);
    }
    if (
      typeof rawQ.correctOptionIndex !== 'number' ||
      rawQ.correctOptionIndex < 0 ||
      rawQ.correctOptionIndex >= (Array.isArray(rawQ.options) ? rawQ.options.length : 0)
    ) {
      errs.push(`${id}: mcq question has out-of-range correctOptionIndex`);
    }
  }

  return errs;
}

export function validateAllModulesSchema(modules: SyllabusModule[]): SchemaValidationReport {
  const imperialViolations: string[] = [];
  const dependencyViolations: string[] = [];
  const duplicateFieldViolations: string[] = [];
  const emDashViolations: string[] = [];
  const shortExplanationViolations: string[] = [];
  const errors: string[] = [];

  let totalTopics = 0;
  let totalQuestions = 0;
  let numericQuestions = 0;
  let mcqQuestions = 0;
  let verifiedCount = 0;
  let draftCount = 0;
  let mcqLongestCorrectCount = 0;

  for (const mod of modules) {
    if (mod.title.includes('\u2014') || mod.introduction.includes('\u2014') || mod.whyItMatters.includes('\u2014')) {
      emDashViolations.push(`Module ${mod.moduleNumber}: header text contains em dash`);
    }
    totalTopics += mod.topics.length;
    const allModQs: AssessmentQuestion[] = [
      ...mod.topics.flatMap((t) => t.questions),
      ...mod.moduleAssessmentQuestions,
    ];

    for (const q of allModQs) {
      totalQuestions++;
      const qErrs = validateQuestionSchema(q as unknown as Record<string, unknown>);
      errors.push(...qErrs);

      for (const legacyKey of LEGACY_DUPLICATE_FIELDS) {
        if (legacyKey in (q as unknown as Record<string, unknown>)) {
          duplicateFieldViolations.push(`${q.id}:${legacyKey}`);
        }
      }

      if (q.reviewStatus === 'Verified') verifiedCount++;
      else if (q.reviewStatus === 'Draft') draftCount++;

      const assumptionsText = Array.isArray(q.assumptions)
        ? q.assumptions.join(' ')
        : String(q.assumptions || '');

      const combinedText = [
        q.prompt,
        q.explanation,
        assumptionsText,
        q.learningObjective,
        ...(q.options || []),
      ].join(' ');

      if (IMPERIAL_REGEX.test(combinedText)) {
        imperialViolations.push(q.id);
      }
      if (DEPENDENCY_REGEX.test(q.prompt)) {
        dependencyViolations.push(`${q.id}: ${q.prompt}`);
      }
      if (combinedText.includes('\u2014')) {
        emDashViolations.push(q.id);
      }
      if (q.explanation.trim().length < 80) {
        shortExplanationViolations.push(q.id);
      }

      if (q.type === 'numeric') {
        numericQuestions++;
      } else if (q.type === 'mcq' && q.options && typeof q.correctOptionIndex === 'number') {
        mcqQuestions++;
        const correctLen = q.options[q.correctOptionIndex].length;
        const maxOtherLen = Math.max(
          ...q.options.filter((_, idx) => idx !== q.correctOptionIndex).map((o) => o.length)
        );
        if (correctLen > maxOtherLen) {
          mcqLongestCorrectCount++;
        }
      }
    }
  }

  const mcqLongestCorrectRatio = mcqQuestions > 0 ? mcqLongestCorrectCount / mcqQuestions : 0;
  if (mcqLongestCorrectRatio > 0.35) {
    errors.push(
      `MCQ length bias violation: correct option is longest in ${(mcqLongestCorrectRatio * 100).toFixed(1)}% of MCQs (limit <= 35%)`
    );
  }

  return {
    valid:
      errors.length === 0 &&
      imperialViolations.length === 0 &&
      dependencyViolations.length === 0 &&
      duplicateFieldViolations.length === 0 &&
      emDashViolations.length === 0 &&
      shortExplanationViolations.length === 0 &&
      mcqLongestCorrectRatio <= 0.35,
    totalModules: modules.length,
    totalTopics,
    totalQuestions,
    numericQuestions,
    mcqQuestions,
    verifiedCount,
    draftCount,
    mcqLongestCorrectCount,
    mcqLongestCorrectRatio,
    imperialViolations,
    dependencyViolations,
    duplicateFieldViolations,
    emDashViolations,
    shortExplanationViolations,
    errors,
  };
}
