import { AssessmentQuestion, QuestionReviewStatus, QuestionType } from '../types/syllabus';

export const DEFAULT_DRAFT_REVIEW_NOTICE =
  'Draft study item: verify all clauses, partial factors, and calculations against controlled BSI/Eurocode standards and UK National Annexes before engineering use.';

export const ENGINE_VERIFIED_REVIEW_NOTICE =
  'Engine-Verified Calculation: mathematical mechanics independently checked by solver; verify code clauses and partial factors against controlled BSI/Eurocode standards.';

export interface UnifiedNumericQuestionSpec {
  id: string;
  moduleNumber: number;
  topicId: string;
  learningObjective: string;
  prompt: string;
  assumptions: string;
  correctAnswer: number;
  unit: string;
  tolerance?: number;
  explanation: string;
  citation?: string;
  hints?: [string, string];
  caseFamilyId?: string;
  reviewStatus?: QuestionReviewStatus;
  solverVerificationId?: string;
}

export interface UnifiedMcqQuestionSpec {
  id: string;
  moduleNumber: number;
  topicId: string;
  learningObjective: string;
  type?: 'mcq' | 'scenario';
  prompt: string;
  assumptions: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  citation?: string;
  hints?: [string, string];
  caseFamilyId?: string;
  reviewStatus?: QuestionReviewStatus;
}

export function defaultCitationForModule(moduleNumber: number): string {
  const map: Record<number, string> = {
    0: 'BS EN 1990:2002+A1 Basis of Structural Design & SI Unit Conventions',
    1: 'BS EN 1991-1-1:2002 Actions on Structures & Static Equilibrium Principles',
    2: 'Euler-Bernoulli Beam Theory & UK Sagging/Hogging Sign Convention',
    3: 'Hooke’s Law, Mechanics of Materials & BS EN 1993-1-1 / BS EN 1996-1-1',
    4: 'Parallel Axis Theorem, Elastic/Plastic Section Analysis & BS EN 1993-1-1 Cl. 6.2.5',
    5: 'Euler-Bernoulli Moment-Curvature Integration & BS EN 1990 Serviceability Limits',
    6: 'Euler Elastic Buckling Theory, Ayrton-Perry Formulation & BS EN 1993-1-1 Cl. 6.3',
    7: 'BS EN 1990:2002+A1 Cl. 6.4.3.2 & UK National Annex Load Combinations',
    8: 'BS EN 1993-1-1:2005 Design of Steel Structures Cl. 5.5 & Cl. 6.2',
    9: 'BS EN 1993-1-1:2005 Cl. 6.3.1–6.3.3 & BS EN 1993-1-8 Connections',
    10: 'BS EN 1995-1-1:2004+A2 (Eurocode 5) Design of Timber Structures',
    11: 'BS EN 1996-1-1:2005+A1 (Eurocode 6) Masonry & BS 5975 Temporary Needling',
    12: 'BS EN 1997-1:2004+A1 (Eurocode 7) Geotechnical Design & Terzaghi Effective Stress',
    13: 'BS EN 1997-1:2004 Cl. 6.5 & Cl. 9 / UK National Annex Design Approach 1',
    14: 'BS EN 1992-1-1:2004+A1 (Eurocode 2) Design of Concrete Structures Cl. 6.1–6.2',
    15: 'Classical Indeterminate Structural Analysis & Virtual Work / Flexibility Method',
    16: 'BS 5975:2019 Code of Practice for Temporary Works Procedures & Falsework',
    17: 'IStructE Standard Method of Detailing Structural Concrete & CDM 2015',
    18: 'IStructE Appraisal of Existing Structures & Conservation Engineering Practice',
    19: 'IStructE Design Manual & BS 5975 Category 0–3 Design Check Governance',
  };
  return map[moduleNumber] ?? 'BS EN 1990–1999 Eurocode Suite & Structural Mechanics Principles';
}

export function buildDefaultHints(
  type: QuestionType,
  prompt: string,
  unit: string | undefined,
  explanation: string,
  learningObjective: string
): [string, string] {
  const sentences = explanation
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (type === 'numeric') {
    const h1 = `Identify the governing principle for "${learningObjective}" and align all given values into consistent SI / (N, mm) or (kN, m) units${unit ? ` targeting ${unit}` : ''}.`;
    const h2 =
      sentences.length > 0
        ? `Step-by-step setup: ${sentences[0].replace(/=\s*[-+]?\d[\d,.]*\s*[A-Za-z/%²³⁴·⁻⁰¹²³⁴⁵⁶⁷⁸⁹]*\.?$/, '= ?')}`
        : `Substitute the given parameters into the governing equation and express your final result in ${unit || 'the required unit'}.`;
    return [h1, h2];
  }

  const h1 = `Consider the physical load path, equilibrium boundary conditions, and deformation compatibility for "${learningObjective}".`;
  const h2 =
    sentences.length > 0
      ? `Key engineering insight: ${sentences[0]}`
      : `Eliminate options that violate static equilibrium, unit homogeneity, or Eurocode limit-state rules.`;
  return [h1, h2];
}

/**
 * Single canonical constructor for numeric questions (N12).
 */
export function createNumericQuestion(spec: UnifiedNumericQuestionSpec): AssessmentQuestion {
  const tol =
    typeof spec.tolerance === 'number'
      ? spec.tolerance
      : Number(Math.max(Math.abs(spec.correctAnswer) * 0.015, 1e-4).toPrecision(3));
  const status: QuestionReviewStatus = spec.reviewStatus ?? 'Draft';

  return {
    id: spec.id,
    moduleNumber: spec.moduleNumber,
    topicId: spec.topicId,
    learningObjective: spec.learningObjective,
    type: 'numeric',
    prompt: spec.prompt,
    assumptions: spec.assumptions,
    correctAnswer: spec.correctAnswer,
    unit: spec.unit,
    tolerance: tol,
    explanation: spec.explanation,
    citation: spec.citation ?? defaultCitationForModule(spec.moduleNumber),
    hints:
      spec.hints ??
      buildDefaultHints(
        'numeric',
        spec.prompt,
        spec.unit,
        spec.explanation,
        spec.learningObjective
      ),
    caseFamilyId: spec.caseFamilyId ?? `${spec.topicId}-CF`,
    reviewStatus: status,
    reviewNotice:
      status === 'Verified'
        ? ENGINE_VERIFIED_REVIEW_NOTICE
        : DEFAULT_DRAFT_REVIEW_NOTICE,
    solverVerificationId: spec.solverVerificationId,
  };
}

/**
 * Single canonical constructor for MCQ and Scenario questions (N12).
 */
export function createMcqQuestion(spec: UnifiedMcqQuestionSpec): AssessmentQuestion {
  const qType = spec.type ?? 'mcq';
  const status: QuestionReviewStatus = spec.reviewStatus ?? 'Draft';

  return {
    id: spec.id,
    moduleNumber: spec.moduleNumber,
    topicId: spec.topicId,
    learningObjective: spec.learningObjective,
    type: qType,
    prompt: spec.prompt,
    assumptions: spec.assumptions,
    options: spec.options,
    correctOptionIndex: spec.correctOptionIndex,
    correctAnswer: spec.correctOptionIndex,
    explanation: spec.explanation,
    citation: spec.citation ?? defaultCitationForModule(spec.moduleNumber),
    hints:
      spec.hints ??
      buildDefaultHints(
        qType,
        spec.prompt,
        undefined,
        spec.explanation,
        spec.learningObjective
      ),
    caseFamilyId: spec.caseFamilyId ?? `${spec.topicId}-CF`,
    reviewStatus: status,
    reviewNotice:
      status === 'Verified'
        ? ENGINE_VERIFIED_REVIEW_NOTICE
        : DEFAULT_DRAFT_REVIEW_NOTICE,
  };
}

function extractModuleNumberFromId(idOrTopicId: string): number {
  const match = idOrTopicId.match(/MOD-?(\d+)/i);
  return match ? Number(match[1]) : 0;
}

/**
 * Legacy adapter kept only for migration scripts.
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
  arg10?: number
): AssessmentQuestion {
  if (typeof arg2 === 'number') {
    const relTol = typeof arg10 === 'number' ? arg10 : 0.015;
    const absTol = Number(Math.max(Math.abs(arg6) * relTol, 1e-4).toPrecision(3));
    return createNumericQuestion({
      id,
      moduleNumber: arg2,
      topicId: arg3,
      learningObjective: arg4,
      prompt: arg5,
      correctAnswer: arg6,
      unit: arg7,
      explanation: String(arg8),
      assumptions: arg9,
      tolerance: absTol,
    });
  }

  const topicId = arg2;
  const moduleNumber = extractModuleNumberFromId(topicId || id);
  const toleranceAbs = typeof arg8 === 'number' ? arg8 : 0.05;
  return createNumericQuestion({
    id,
    moduleNumber,
    topicId,
    learningObjective: arg3,
    prompt: arg4,
    assumptions: arg5,
    correctAnswer: arg6,
    unit: arg7,
    tolerance: toleranceAbs,
    explanation: arg9,
  });
}

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
  arg10?: 'mcq' | 'scenario'
): AssessmentQuestion {
  if (typeof arg2 === 'number') {
    return createMcqQuestion({
      id,
      moduleNumber: arg2,
      topicId: arg3,
      learningObjective: arg4,
      prompt: arg5,
      options: arg6 as string[],
      correctOptionIndex: arg7,
      explanation: arg8,
      assumptions: arg9 ?? 'Standard structural engineering principles apply.',
      type: arg10 ?? 'mcq',
    });
  }

  const topicId = arg2;
  const moduleNumber = extractModuleNumberFromId(topicId || id);
  const qType: 'mcq' | 'scenario' =
    arg9 === 'scenario' || arg9 === 'mcq' ? arg9 : 'mcq';
  return createMcqQuestion({
    id,
    moduleNumber,
    topicId,
    learningObjective: arg3,
    prompt: arg4,
    assumptions: arg5,
    options: arg6 as string[],
    correctOptionIndex: arg7,
    explanation: arg8,
    type: qType,
  });
}
