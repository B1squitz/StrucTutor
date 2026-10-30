import { AssessmentQuestion, QuestionReviewStatus } from '../types/syllabus';

function extractModuleNumberFromId(idOrTopicId: string): number {
  const match = idOrTopicId.match(/MOD-?(\d+)/i);
  return match ? Number(match[1]) : 0;
}

const DEFAULT_REVIEW_NOTICE =
  'Educational foundation assessment item: first-principles mechanics verified; verify code clauses and partial factors against controlled BSI/Eurocode standards and UK National Annexes before engineering use.';

/**
 * Supports both:
 * 1) Legacy signature (Modules 0..11):
 *    qNum(id, moduleNumber, topicId, learningObjective, prompt, correctAnswer, requiredUnit, explanation, assumptionsAndLimitations, tolerance?, reviewStatus?)
 * 2) Compact signature (Modules 12..19):
 *    qNum(id, topicId, learningObjective, prompt, assumptions, correctAnswer, unit, toleranceAbs, explanation)
 */
export function qNum(
  id: string,
  arg2: number | string,
  arg3: string,
  arg4: string,
  arg5: string,
  arg6: number,
  arg7: string,
  arg8: string | number,
  arg9: string,
  arg10?: number,
  arg11?: QuestionReviewStatus
): AssessmentQuestion {
  if (typeof arg2 === 'number') {
    const moduleNumber = arg2;
    const topicId = arg3;
    const learningObjective = arg4;
    const prompt = arg5;
    const correctAnswer = arg6;
    const requiredUnit = arg7;
    const explanation = String(arg8);
    const assumptionsAndLimitations = arg9;
    const relTol = typeof arg10 === 'number' ? arg10 : 0.015;
    const absTol = Math.max(Math.abs(correctAnswer) * relTol, 1e-4);
    const reviewStatus: QuestionReviewStatus = arg11 ?? 'Self-Checked Calculation';

    return {
      id,
      moduleNumber,
      topicId,
      learningObjective,
      questionType: 'numeric',
      type: 'numeric',
      prompt,
      correctAnswer,
      requiredUnit,
      unit: requiredUnit,
      tolerance: Number(absTol.toPrecision(3)),
      toleranceAbs: absTol,
      explanation,
      assumptionsAndLimitations,
      assumptions: assumptionsAndLimitations,
      reviewStatus,
      reviewNotice: DEFAULT_REVIEW_NOTICE,
    };
  }

  // Compact signature (Modules 12..19)
  const topicId = arg2;
  const moduleNumber = extractModuleNumberFromId(topicId || id);
  const learningObjective = arg3;
  const prompt = arg4;
  const assumptions = arg5;
  const correctAnswer = arg6;
  const unit = arg7;
  const toleranceAbs = typeof arg8 === 'number' ? arg8 : 0.05;
  const explanation = arg9;

  return {
    id,
    moduleNumber,
    topicId,
    learningObjective,
    questionType: 'numeric',
    type: 'numeric',
    prompt,
    correctAnswer,
    requiredUnit: unit,
    unit,
    tolerance: toleranceAbs,
    toleranceAbs,
    explanation,
    assumptionsAndLimitations: assumptions,
    assumptions,
    reviewStatus: 'Self-Checked Calculation',
    reviewNotice: DEFAULT_REVIEW_NOTICE,
  };
}

/**
 * Supports both:
 * 1) Legacy signature (Modules 0..11):
 *    qMcq(id, moduleNumber, topicId, learningObjective, prompt, options, correctOptionIndex, explanation, assumptionsAndLimitations, questionType?, reviewStatus?)
 * 2) Compact signature (Modules 12..19):
 *    qMcq(id, topicId, learningObjective, prompt, assumptions, options, correctOptionIndex, explanation, questionType?)
 */
export function qMcq(
  id: string,
  arg2: number | string,
  arg3: string,
  arg4: string,
  arg5: string,
  arg6: string[] | [string, string, string, string],
  arg7: number,
  arg8: string,
  arg9?: string,
  arg10?: 'mcq' | 'scenario',
  arg11?: QuestionReviewStatus
): AssessmentQuestion {
  if (typeof arg2 === 'number') {
    const moduleNumber = arg2;
    const topicId = arg3;
    const learningObjective = arg4;
    const prompt = arg5;
    const options = arg6 as string[];
    const correctOptionIndex = arg7;
    const explanation = arg8;
    const assumptionsAndLimitations = arg9 ?? 'Standard structural engineering principles apply.';
    const questionType = arg10 ?? 'mcq';
    const reviewStatus: QuestionReviewStatus =
      arg11 ?? 'Foundation Assessment (Requires Technical Review)';

    return {
      id,
      moduleNumber,
      topicId,
      learningObjective,
      questionType,
      type: questionType,
      prompt,
      options,
      correctOptionIndex,
      correctAnswer: correctOptionIndex,
      explanation,
      assumptionsAndLimitations,
      assumptions: assumptionsAndLimitations,
      reviewStatus,
      reviewNotice: DEFAULT_REVIEW_NOTICE,
    };
  }

  // Compact signature (Modules 12..19)
  const topicId = arg2;
  const moduleNumber = extractModuleNumberFromId(topicId || id);
  const learningObjective = arg3;
  const prompt = arg4;
  const assumptions = arg5;
  const options = arg6 as string[];
  const correctOptionIndex = arg7;
  const explanation = arg8;
  const qType: 'mcq' | 'scenario' =
    arg9 === 'scenario' || arg9 === 'mcq' ? arg9 : 'mcq';

  return {
    id,
    moduleNumber,
    topicId,
    learningObjective,
    questionType: qType,
    type: qType,
    prompt,
    options,
    correctOptionIndex,
    correctAnswer: correctOptionIndex,
    explanation,
    assumptionsAndLimitations: assumptions,
    assumptions,
    reviewStatus: 'Foundation Assessment (Requires Technical Review)',
    reviewNotice: DEFAULT_REVIEW_NOTICE,
  };
}
