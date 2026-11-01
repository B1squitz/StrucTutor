import { formatEngineeringNumber } from './beamEngine';
import sessionQuestionsJson from '../content/session/session-questions.json';

declare const __APP_VERSION__: string | undefined;
declare const __APP_BUILD_DATE__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.2.0';
export const APP_BUILD_DATE: string =
  typeof __APP_BUILD_DATE__ !== 'undefined' ? __APP_BUILD_DATE__ : '30 Oct 2026';

export type StepId =
  | 'learn'
  | '1a'
  | '1b'
  | '2a'
  | '2a-R'
  | '2b'
  | '2c'
  | '3'
  | '4'
  | '5a'
  | 'summary';
export type StepStatus = 'unseen' | 'active' | 'mastered' | 'assisted';

export interface GivenParameterItem {
  symbol: string;
  sub?: string;
  label: string;
  valueDisplay: string;
}

export interface ParallelWorkedStep {
  stepNum: number;
  heading: string;
  formulaLatex?: string;
  substitution: string;
  result: string;
  unitCancelNote: string;
}

export interface QuestionSpec {
  id: Exclude<StepId, 'learn' | 'summary'>;
  badgeLabel: string;
  numberLabel: string;
  topicTag: string;
  dimension: string;
  difficulty:
    | 'Foundational'
    | 'Core Practice'
    | 'Remedial Sub-Step'
    | 'Verification'
    | 'Extension';
  isRemedial?: boolean;
  title: string;
  promptTitle: string;
  promptLead: string;
  promptBody: string;
  imageUrl?: string;
  promptFormula?: {
    lhs: string;
    num: string;
    den: string;
    rhsNote?: string;
  };
  givenParameters: GivenParameterItem[];
  givenData: string[];
  diagramType: string;
  diagramCaption: string;
  defaultUnit: string;
  canonicalUnit: string;
  requiredUnit: string;
  unitChoices: string[];
  allowedUnits: string[];
  canonicalAnswerInBaseUnit: number;
  canonicalAnswer: number;
  relativeTolerance: number;
  absoluteTolerance: number;
  placeholder: string;
  milestoneCategory: string;
  skillBarId: string;
  hints: [string, string];
  parallelExample: {
    title: string;
    givenText: string;
    steps: ParallelWorkedStep[];
    finalAnswer: string;
  };
  fullSolutionSteps: ParallelWorkedStep[];
}

export interface GradeOutcome {
  isCorrect: boolean;
  isEquivalentUnitMatch: boolean;
  userValueConvertedToCanonical: number | null;
  expectedCanonicalValue: number;
  expectedCanonicalUnit: string;
  scaleFactorError:
    | '10^-3_error'
    | '10^3_error'
    | '10^-6_error'
    | '10^6_error'
    | null;
  headline: string;
  diagnosticDetail: string;
  unitConversionNote: string;
  status?:
    | 'correct'
    | 'unit-mismatch'
    | 'sign-error'
    | 'trap-detected'
    | 'numeric-error'
    | 'invalid-input';
}

export interface MilestoneSkillBar {
  id: string;
  label: string;
  completed: number;
  score: number;
  target: number;
  unitDescription: string;
}

export interface ObjectiveItem {
  code: string;
  title: string;
  durationMins: number;
  status: 'Mastered' | 'In Progress' | 'Up Next' | 'Locked';
  questionsCount: number;
  summary: string;
  keyFormulas: string[];
  eurocodeContext: string;
  formulaPreview?: string;
}

export interface SyllabusModuleItem {
  moduleNumber: number;
  stage: 1 | 2 | 3;
  title: string;
  subtitle: string;
  durationWeeks: string;
  status: 'Mastered' | 'In Progress' | 'Locked';
  progressPercent: number;
  unlockRequirement: string;
  overview: string;
  eurocodeReference: string;
  keyFormulas: string[];
  objectives: ObjectiveItem[];
  code?: string;
  summary?: string;
}

export const SESSION_QUESTIONS: Record<
  Exclude<StepId, 'learn' | 'summary'>,
  QuestionSpec
> = sessionQuestionsJson as Record<
  Exclude<StepId, 'learn' | 'summary'>,
  QuestionSpec
>;

export const INITIAL_MILESTONE_A_BARS: MilestoneSkillBar[] = [
  {
    id: 'eq-reactions',
    label: 'Static Equilibrium & Support Reactions',
    completed: 0,
    score: 0,
    target: 10,
    unitDescription: 'ΣF_y = 0 and ΣM = 0 hand checks in kN and m',
  },
  {
    id: 'sfd-bmd',
    label: 'Shear Force & Bending Moment Diagrams',
    completed: 0,
    score: 0,
    target: 10,
    unitDescription: 'Free-body cuts, zero-shear stationary points, and tension-face BMDs',
  },
  {
    id: 'flexure-stress',
    label: 'Section Properties, Flexural & Shear Stress',
    completed: 0,
    score: 0,
    target: 5,
    unitDescription: 'I_xx, W_el = 6.67 × 10⁵ mm³, Navier σ = M/W_el, and Jourawski τ in MPa',
  },
  {
    id: 'deflection-sls',
    label: 'Serviceability Deflection & Stiffness Scaling',
    completed: 0,
    score: 0,
    target: 5,
    unitDescription: 'Consistent (N, mm) deflection checks against L/360 limits',
  },
  {
    id: 'unit-fluency',
    label: 'SI Dimensional Hygiene & Buckling Sketches',
    completed: 0,
    score: 0,
    target: 5,
    unitDescription: 'Zero power-of-ten slips (1 kN·m = 10⁶ N·mm) and effective length sketches',
  },
];

export const SYLLABUS_MODULES: SyllabusModuleItem[] = Array.from(
  { length: 20 },
  (_, idx) => ({
    moduleNumber: idx,
    code: `MOD-${String(idx).padStart(2, '0')}`,
    stage: idx <= 8 ? 1 : idx <= 14 ? 2 : 3,
    title: `Module ${idx}: Structural Engineering Syllabus Module ${idx}`,
    subtitle: `Core structural mechanics and design verification for Module ${idx}.`,
    summary: `Core structural mechanics and design verification for Module ${idx}.`,
    durationWeeks: '6 to 10 weeks',
    status: idx === 0 ? 'In Progress' : 'Locked',
    progressPercent: 0,
    unlockRequirement: '90% pass mark on Topic and Module Assessments',
    overview: 'First-principles mechanics, load paths, and UK Eurocode verification.',
    eurocodeReference: 'BS EN 1990 / BS EN 1991 / BS EN 1992 / BS EN 1993 / BS EN 1997',
    keyFormulas: ['ΣF = 0, ΣM = 0', 'σ = M / W_el', 'δ = 5wL⁴ / (384EI)'],
    objectives: [
      {
        code: `${idx}.1`,
        title: `Topic ${idx}.1 Core Mechanics & Equilibrium`,
        durationMins: 25,
        status: 'Up Next',
        questionsCount: 5,
        summary: 'First-principles equilibrium, load path, and SI unit verification.',
        keyFormulas: ['ΣF_y = 0', 'ΣM = 0'],
        eurocodeContext: '90% Pass Gate',
        formulaPreview: 'R_A = (w · L) / 2',
      },
    ],
  })
);

interface UnitDefinition {
  dimension:
    | 'force'
    | 'length'
    | 'moment'
    | 'stress'
    | 'lineLoad'
    | 'area'
    | 'inertia'
    | 'modulus'
    | 'momentArea';
  toBaseFactor: number;
}

const METRIC_UNIT_TABLE: Record<string, UnitDefinition> = {
  N: { dimension: 'force', toBaseFactor: 1 },
  kN: { dimension: 'force', toBaseFactor: 1e3 },
  MN: { dimension: 'force', toBaseFactor: 1e6 },

  mm: { dimension: 'length', toBaseFactor: 1 },
  cm: { dimension: 'length', toBaseFactor: 10 },
  m: { dimension: 'length', toBaseFactor: 1e3 },

  'N·mm': { dimension: 'moment', toBaseFactor: 1 },
  'N·m': { dimension: 'moment', toBaseFactor: 1e3 },
  'kN·mm': { dimension: 'moment', toBaseFactor: 1e3 },
  'kN·m': { dimension: 'moment', toBaseFactor: 1e6 },
  kNm: { dimension: 'moment', toBaseFactor: 1e6 },
  Nmm: { dimension: 'moment', toBaseFactor: 1 },
  Nm: { dimension: 'moment', toBaseFactor: 1e3 },

  Pa: { dimension: 'stress', toBaseFactor: 1e-6 },
  kPa: { dimension: 'stress', toBaseFactor: 1e-3 },
  'kN/m²': { dimension: 'stress', toBaseFactor: 1e-3 },
  MPa: { dimension: 'stress', toBaseFactor: 1 },
  'N/mm²': { dimension: 'stress', toBaseFactor: 1 },
  GPa: { dimension: 'stress', toBaseFactor: 1e3 },
  'kN/mm²': { dimension: 'stress', toBaseFactor: 1e3 },

  'N/mm': { dimension: 'lineLoad', toBaseFactor: 1 },
  'kN/m': { dimension: 'lineLoad', toBaseFactor: 1 },
  'N/m': { dimension: 'lineLoad', toBaseFactor: 1e-3 },

  'mm²': { dimension: 'area', toBaseFactor: 1 },
  'mm^2': { dimension: 'area', toBaseFactor: 1 },
  'cm²': { dimension: 'area', toBaseFactor: 100 },
  'm²': { dimension: 'area', toBaseFactor: 1e6 },

  'mm³': { dimension: 'modulus', toBaseFactor: 1 },
  'cm³': { dimension: 'modulus', toBaseFactor: 1e3 },
  '10³ mm³': { dimension: 'modulus', toBaseFactor: 1e3 },
  'm³': { dimension: 'modulus', toBaseFactor: 1e9 },

  'mm⁴': { dimension: 'inertia', toBaseFactor: 1 },
  'cm⁴': { dimension: 'inertia', toBaseFactor: 1e4 },
  '10⁶ mm⁴': { dimension: 'inertia', toBaseFactor: 1e6 },
  'm⁴': { dimension: 'inertia', toBaseFactor: 1e12 },

  'kN·m²': { dimension: 'momentArea', toBaseFactor: 1 },
};

const IMPERIAL_FORBIDDEN = new Set([
  'kip',
  'kips',
  'lb',
  'lbs',
  'lbf',
  'psi',
  'ksi',
  'ft',
  'in',
  'inch',
  'ft-lb',
  'kip-ft',
]);

export function convertEngineeringUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const cleanFrom = fromUnit.trim();
  const cleanTo = toUnit.trim();

  if (
    IMPERIAL_FORBIDDEN.has(cleanFrom.toLowerCase()) ||
    IMPERIAL_FORBIDDEN.has(cleanTo.toLowerCase())
  ) {
    throw new Error(
      `Rule M violation: Imperial unit '${fromUnit}' or '${toUnit}' is forbidden in StructTutor.`
    );
  }

  if (cleanFrom === cleanTo) {
    return value;
  }

  const fromDef = METRIC_UNIT_TABLE[cleanFrom];
  const toDef = METRIC_UNIT_TABLE[cleanTo];

  if (!fromDef || !toDef) {
    throw new Error(
      `Unsupported unit conversion from '${fromUnit}' to '${toUnit}'.`
    );
  }

  if (fromDef.dimension !== toDef.dimension) {
    throw new Error(
      `Incompatible dimensions: cannot convert '${fromUnit}' (${fromDef.dimension}) to '${toUnit}' (${toDef.dimension}).`
    );
  }

  const raw = (value * fromDef.toBaseFactor) / toDef.toBaseFactor;
  return Number(raw.toPrecision(12));
}

export function tryConvertEngineeringUnit(
  value: number,
  fromUnit: string,
  toUnit: string
):
  | { ok: true; convertedValue: number; factor: number; error?: string }
  | { ok: false; error: string; convertedValue?: number; factor?: number } {
  try {
    const convertedValue = convertEngineeringUnit(value, fromUnit, toUnit);
    const factor = value !== 0 ? convertedValue / value : 1;
    return { ok: true, convertedValue, factor };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function evaluateQuestionAttempt(
  question: QuestionSpec,
  rawInput: string,
  selectedUnit: string
): GradeOutcome {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error('Please enter a numeric value before checking your answer.');
  }

  const parsedValue = Number(trimmed);
  if (!Number.isFinite(parsedValue)) {
    throw new Error(
      `'${trimmed}' is not a valid number. Enter digits only (e.g. 18 or 27.0).`
    );
  }

  const canonicalUnit = question.canonicalUnit;
  const target = question.canonicalAnswerInBaseUnit;

  let convertedValue = parsedValue;
  let isEquivalentUnitMatch = false;
  let unitConversionNote = `Checked in canonical unit ${canonicalUnit}.`;

  if (selectedUnit && selectedUnit !== canonicalUnit) {
    const conv = tryConvertEngineeringUnit(
      parsedValue,
      selectedUnit,
      canonicalUnit
    );
    if (!conv.ok) {
      return {
        isCorrect: false,
        isEquivalentUnitMatch: false,
        userValueConvertedToCanonical: null,
        expectedCanonicalValue: target,
        expectedCanonicalUnit: canonicalUnit,
        scaleFactorError: null,
        headline: 'Incompatible Engineering Unit',
        diagnosticDetail: conv.error,
        unitConversionNote: `Select a unit compatible with ${canonicalUnit}.`,
        status: 'unit-mismatch',
      };
    }
    convertedValue = conv.convertedValue;
    isEquivalentUnitMatch = true;
    unitConversionNote = `Converted ${formatEngineeringNumber(
      parsedValue
    )} ${selectedUnit} = ${formatEngineeringNumber(
      convertedValue
    )} ${canonicalUnit}.`;
  }

  const allowedTol = Math.max(
    question.absoluteTolerance,
    Math.abs(target) * question.relativeTolerance
  );
  const absDiff = Math.abs(convertedValue - target);

  if (absDiff <= allowedTol) {
    return {
      isCorrect: true,
      isEquivalentUnitMatch,
      userValueConvertedToCanonical: convertedValue,
      expectedCanonicalValue: target,
      expectedCanonicalUnit: canonicalUnit,
      scaleFactorError: null,
      headline: 'Verified Correct - Exact SI Match',
      diagnosticDetail: `Your answer (${formatEngineeringNumber(
        parsedValue
      )} ${selectedUnit}) matches the verified solution ${formatEngineeringNumber(
        target
      )} ${canonicalUnit}.`,
      unitConversionNote,
      status: 'correct',
    };
  }

  // Detect 10^-3, 10^3, 10^-6, 10^6 unit scaling errors
  let scaleFactorError: GradeOutcome['scaleFactorError'] = null;
  if (target !== 0) {
    const ratio = convertedValue / target;
    if (Math.abs(ratio - 1e-3) <= 2e-5) {
      scaleFactorError = '10^-3_error';
    } else if (Math.abs(ratio - 1e3) <= 20) {
      scaleFactorError = '10^3_error';
    } else if (Math.abs(ratio - 1e-6) <= 2e-8) {
      scaleFactorError = '10^-6_error';
    } else if (Math.abs(ratio - 1e6) <= 2e4) {
      scaleFactorError = '10^6_error';
    }
  }

  if (scaleFactorError) {
    return {
      isCorrect: false,
      isEquivalentUnitMatch: false,
      userValueConvertedToCanonical: convertedValue,
      expectedCanonicalValue: target,
      expectedCanonicalUnit: canonicalUnit,
      scaleFactorError,
      headline: `Unit Scaling Error Detected (${scaleFactorError.replace('_', ' ')})`,
      diagnosticDetail: `Your significant digits match ${formatEngineeringNumber(
        target
      )} ${canonicalUnit}, but your value (${formatEngineeringNumber(
        convertedValue
      )} ${canonicalUnit}) is off by a power of 1,000. Remember: 1 kN·m = 10⁶ N·mm and 1 N/mm² = 1 MPa.`,
      unitConversionNote,
      status: 'unit-mismatch',
    };
  }

  return {
    isCorrect: false,
    isEquivalentUnitMatch: false,
    userValueConvertedToCanonical: convertedValue,
    expectedCanonicalValue: target,
    expectedCanonicalUnit: canonicalUnit,
    scaleFactorError: null,
    headline: 'Calculation Discrepancy - Check Free-Body Cut & Units',
    diagnosticDetail: `Your value converts to ${formatEngineeringNumber(
      convertedValue
    )} ${canonicalUnit}, which differs from the verified target. Use a graduated hint or inspect the Parallel Example.`,
    unitConversionNote,
    status: 'numeric-error',
  };
}

export function computeAdaptiveTransition(
  currentStep: StepId,
  isCorrect: boolean,
  newFailCount: number,
  usedHelp: boolean,
  stepStatuses: Record<StepId, StepStatus>,
  remedialAlreadyInjected: boolean
): {
  nextStepStatuses: Record<StepId, StepStatus>;
  remedialInjected: boolean;
  autoRevealWorkedSolution: boolean;
  adaptiveBannerMessage: string | null;
} {
  const nextStepStatuses: Record<StepId, StepStatus> = { ...stepStatuses };

  if (isCorrect) {
    nextStepStatuses[currentStep] = usedHelp ? 'assisted' : 'mastered';
    return {
      nextStepStatuses,
      remedialInjected: remedialAlreadyInjected,
      autoRevealWorkedSolution: false,
      adaptiveBannerMessage: usedHelp
        ? 'Step completed with assistance (Amber). You can re-attempt later for unassisted mastery.'
        : 'Step mastered on first attempt! Proceed to the next step.',
    };
  }

  const inject2aR =
    currentStep === '2a' && newFailCount >= 2 && !remedialAlreadyInjected;
  const autoReveal = newFailCount >= 2;

  if (inject2aR) {
    nextStepStatuses['2a-R'] = 'active';
  }

  return {
    nextStepStatuses,
    remedialInjected: remedialAlreadyInjected || inject2aR,
    autoRevealWorkedSolution: autoReveal,
    adaptiveBannerMessage: inject2aR
      ? 'Adaptive Coach: Two attempts on 2a detected a unit-scaling slip. Remedial Sub-Step 2a-R Warm-Up has been unlocked, along with the full worked solution.'
      : autoReveal
      ? 'Full worked derivation unlocked after two attempts. Review the step-by-step unit cancellation.'
      : null,
  };
}
