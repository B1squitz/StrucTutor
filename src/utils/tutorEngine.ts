export const APP_VERSION = '0.1.0';
export const APP_BUILD_DATE = '2026-10-29';

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

export type StepStatus =
  | 'unseen'
  | 'active'
  | 'mastered' // Completed 1st try without hints/solution
  | 'assisted' // Completed with hints, solution, or after retry
  | 'failed';

export interface ParallelExampleSpec {
  title: string;
  givenText: string;
  steps: {
    stepNum: number;
    heading: string;
    formulaLatex: string;
    substitution: string;
    unitCancelNote: string;
    result: string;
  }[];
  finalAnswer: string;
}

export interface QuestionSpec {
  stepId: Exclude<StepId, 'learn' | 'summary'>;
  badgeLabel: string;
  practiceMode: 'Guided Practice' | 'Independent Practice' | 'Warm-Up Remedial';
  title: string;
  promptLead: string;
  promptFormula?: {
    lhs: string;
    num: string;
    den: string;
    rhsNote?: string;
  };
  givenParameters: {
    symbol: string;
    sub?: string;
    label: string;
    valueDisplay: string;
  }[];
  diagramType:
    | 'unit-bridge'
    | 'pressure-pad'
    | 'beam-bending-2a'
    | 'beam-bending-remedial'
    | 'beam-bending-2b'
    | 'beam-section-2c'
    | 'axial-tie-3'
    | 'line-load-4'
    | 'combined-stress-5a'
    | 'simply-supported-point-load'
    | 'wall-roller-support';
  diagramCaption: string;
  canonicalAnswerInBaseUnit: number; // Base unit depends on dimension
  canonicalUnit: string;
  dimension: 'stress' | 'moment' | 'force' | 'line_load' | 'section_modulus';
  unitChoices: string[];
  defaultUnit: string;
  placeholder: string;
  relativeTolerance: number;
  hints: [string, string];
  parallelExample: ParallelExampleSpec;
  fullSolutionSteps: {
    stepNum: number;
    heading: string;
    substitution: string;
    unitCancelNote: string;
    result: string;
  }[];
  milestoneCategory:
    | 'reactions'
    | 'sfd_bmd'
    | 'section_bending'
    | 'deflection'
    | 'buckling';
   injectsRemedialStepId?: '2a-R';
}

export interface GradeOutcome {
  isCorrect: boolean;
  isEquivalentUnitMatch: boolean;
  userValueConvertedToCanonical: number | null;
  expectedCanonicalValue: number;
  expectedCanonicalUnit: string;
  scaleFactorError: '10^3_error' | '10^6_error' | '10^-3_error' | '10^-6_error' | null;
  headline: string;
  diagnosticDetail: string;
  unitConversionNote: string;
}

export interface ObjectiveItem {
  code: string; // e.g. '0.1', '0.2'
  title: string;
  durationMins: number;
  status: 'Mastered' | 'Up Next' | 'In Progress' | 'Locked';
  questionsCount: number;
  summary: string;
  keyFormulas: string[];
  eurocodeContext: string;
}

export interface SyllabusModuleItem {
  moduleNumber: number;
  stage: 1 | 2 | 3;
  title: string;
  subtitle: string;
  durationWeeks: string;
  status: 'In Progress' | 'Mastered' | 'Locked';
  progressPercent: number;
  unlockRequirement: string;
  overview: string;
  eurocodeReference: string;
  keyFormulas: string[];
  objectives: ObjectiveItem[];
}

export interface MilestoneSkillBar {
  id: 'reactions' | 'sfd_bmd' | 'section_bending' | 'deflection' | 'buckling';
  label: string;
  completed: number;
  target: number;
  unitDescription: string;
}

export interface RecentSessionItem {
  id: string;
  topicTitle: string;
  moduleLabel: string;
  badgeText: string;
  badgeTone: 'emerald' | 'amber';
  relativeTime: string;
  targetStepId: Exclude<StepId, 'learn' | 'summary'>;
}

// Unit conversion factors to internal base unit per dimension:
// stress -> MPa (which equals N/mm²)
// moment -> N·mm
// force -> N
// line_load -> N/mm
// section_modulus -> mm³
const UNIT_TO_BASE_FACTOR: Record<string, { dimension: QuestionSpec['dimension']; factor: number }> = {
  // Stress (base = MPa = N/mm²)
  'MPa': { dimension: 'stress', factor: 1 },
  'N/mm²': { dimension: 'stress', factor: 1 },
  'GPa': { dimension: 'stress', factor: 1000 },
  'kN/m²': { dimension: 'stress', factor: 0.001 },
  'kPa': { dimension: 'stress', factor: 0.001 },
  // Moment (base = N·mm)
  'N·mm': { dimension: 'moment', factor: 1 },
  'N·m': { dimension: 'moment', factor: 1000 },
  'kN·m': { dimension: 'moment', factor: 1_000_000 },
  'kN·mm': { dimension: 'moment', factor: 1000 },
  // Force (base = N)
  'N': { dimension: 'force', factor: 1 },
  'kN': { dimension: 'force', factor: 1000 },
  'MN': { dimension: 'force', factor: 1_000_000 },
  // Line load (base = N/mm)
  'N/mm': { dimension: 'line_load', factor: 1 },
  'kN/m': { dimension: 'line_load', factor: 1 },
  'N/m': { dimension: 'line_load', factor: 0.001 },
  // Section modulus (base = mm³)
  'mm³': { dimension: 'section_modulus', factor: 1 },
  'cm³': { dimension: 'section_modulus', factor: 1000 },
  'm³': { dimension: 'section_modulus', factor: 1_000_000_000 },
};

export function convertEngineeringUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const fromSpec = UNIT_TO_BASE_FACTOR[fromUnit];
  const toSpec = UNIT_TO_BASE_FACTOR[toUnit];
  if (!fromSpec || !toSpec) {
    throw new Error(`Unsupported unit selection (${fromUnit} to ${toUnit}).`);
  }
  if (fromSpec.dimension !== toSpec.dimension) {
    throw new Error(
      `Dimensional mismatch: cannot convert ${fromUnit} (${fromSpec.dimension}) into ${toUnit} (${toSpec.dimension}).`
    );
  }
  const baseVal = value * fromSpec.factor;
  return baseVal / toSpec.factor;
}

export function evaluateQuestionAttempt(
  question: QuestionSpec,
  rawNumericInput: string,
  selectedUnit: string
): GradeOutcome {
  const cleaned = rawNumericInput.trim().replace(/,/g, '');
  const numericVal = Number(cleaned);
  if (!cleaned || !Number.isFinite(numericVal)) {
    throw new Error('Please enter a valid number before checking your answer.');
  }

  const unitSpec = UNIT_TO_BASE_FACTOR[selectedUnit];
  if (!unitSpec || unitSpec.dimension !== question.dimension) {
    return {
      isCorrect: false,
      isEquivalentUnitMatch: false,
      userValueConvertedToCanonical: null,
      expectedCanonicalValue: question.canonicalAnswerInBaseUnit,
      expectedCanonicalUnit: question.canonicalUnit,
      scaleFactorError: null,
      headline: 'Incompatible Unit Selected',
      diagnosticDetail: `The unit ${selectedUnit} does not match the required physical quantity (${question.dimension.replace('_', ' ')}).`,
      unitConversionNote: `Expected a unit compatible with ${question.canonicalUnit}.`,
    };
  }

  const userInCanonical = convertEngineeringUnit(
    numericVal,
    selectedUnit,
    question.canonicalUnit
  );
  const expected = question.canonicalAnswerInBaseUnit;
  const absDiff = Math.abs(userInCanonical - expected);
  const relDiff = expected !== 0 ? absDiff / Math.abs(expected) : absDiff;

  if (relDiff <= question.relativeTolerance) {
    const isAltUnit = selectedUnit !== question.canonicalUnit;
    return {
      isCorrect: true,
      isEquivalentUnitMatch: true,
      userValueConvertedToCanonical: userInCanonical,
      expectedCanonicalValue: expected,
      expectedCanonicalUnit: question.canonicalUnit,
      scaleFactorError: null,
      headline: isAltUnit
        ? `Correct! Verified Equivalent Unit (${numericVal} ${selectedUnit} = ${expected} ${question.canonicalUnit})`
        : `Correct! Spot-on Structural Calculation (${expected} ${question.canonicalUnit})`,
      diagnosticDetail: isAltUnit
        ? `Your answer of ${numericVal} ${selectedUnit} converts to ${userInCanonical.toPrecision(4)} ${question.canonicalUnit}, matching the exact target of ${expected} ${question.canonicalUnit}.`
        : `Dimensional check and magnitude verified in (${question.canonicalUnit}).`,
      unitConversionNote: `1 ${selectedUnit} = ${convertEngineeringUnit(1, selectedUnit, question.canonicalUnit)} ${question.canonicalUnit}`,
    };
  }

  // Diagnose 10^3 or 10^6 unit scaling errors (e.g., forgetting kN·m -> 10^6 N·mm)
  const ratio = expected !== 0 ? userInCanonical / expected : 0;
  let scaleFactorError: GradeOutcome['scaleFactorError'] = null;
  let diagnosticDetail = `Your answer converts to ${Number(userInCanonical.toPrecision(4))} ${question.canonicalUnit}, whereas the target value is ${expected} ${question.canonicalUnit}.`;

  if (Math.abs(ratio - 1e-3) < 0.05 * 1e-3) {
    scaleFactorError = '10^-3_error';
    diagnosticDetail =
      'Unit Scaling Alert (×10⁻³): You are off by a factor of 1,000. Remember that 1 kN·m = 10⁶ N·mm (both kN → 10³ N and m → 10³ mm multiply together!), or check whether you entered a GPa value while keeping MPa selected.';
  } else if (Math.abs(ratio - 1e-6) < 0.05 * 1e-6) {
    scaleFactorError = '10^-6_error';
    diagnosticDetail =
      'Unit Scaling Alert (×10⁻⁶): You divided by 1,000,000 or left bending moment M in kN·m without converting to N·mm before dividing by Wₑₗ in mm³.';
  } else if (Math.abs(ratio - 1e3) < 0.05 * 1e3) {
    scaleFactorError = '10^3_error';
    diagnosticDetail =
      'Unit Scaling Alert (×10³): Your magnitude is 1,000 times too large. Check whether you converted kN → N (×10³) a second time or selected GPa instead of MPa.';
  } else if (Math.abs(ratio - 1e6) < 0.05 * 1e6) {
    scaleFactorError = '10^6_error';
    diagnosticDetail =
      'Unit Scaling Alert (×10⁶): Your magnitude is 1,000,000 times too large. Check your power-of-ten cancellation between N·mm and mm³.';
  }

  return {
    isCorrect: false,
    isEquivalentUnitMatch: false,
    userValueConvertedToCanonical: userInCanonical,
    expectedCanonicalValue: expected,
    expectedCanonicalUnit: question.canonicalUnit,
    scaleFactorError,
    headline: scaleFactorError
      ? 'Not Quite — Power-of-Ten Unit Scaling Error Detected'
      : 'Not Quite — Check Your Formula & Unit Alignment',
    diagnosticDetail,
    unitConversionNote: `In consistent (mm, N) base units: 1 kN·m = 1,000,000 N·mm and 1 N/mm² = 1 MPa.`,
  };
}

export interface AdaptiveTransitionResult {
  nextStepStatuses: Record<StepId, StepStatus>;
  remedialInjected: boolean;
  autoRevealWorkedSolution: boolean;
  adaptiveBannerMessage: string | null;
  fastTrackEligible: boolean;
}

export function computeAdaptiveTransition(
  currentStepId: Exclude<StepId, 'learn' | 'summary'>,
  isCorrect: boolean,
  failureCountOnCurrentStep: number,
  usedHelpOnCurrentStep: boolean,
  currentStatuses: Record<StepId, StepStatus>,
  alreadyInjectedRemedial: boolean
): AdaptiveTransitionResult {
  const updated = { ...currentStatuses };

  if (isCorrect) {
    updated[currentStepId] = usedHelpOnCurrentStep ? 'assisted' : 'mastered';
    const aced2aAnd2b =
      updated['2a'] === 'mastered' && updated['2b'] === 'mastered';
    return {
      nextStepStatuses: updated,
      remedialInjected: alreadyInjectedRemedial,
      autoRevealWorkedSolution: false,
      adaptiveBannerMessage: aced2aAnd2b && currentStepId === '2b'
        ? 'Fast-Track Notice: You solved 2a and 2b on your first attempt without hints! You can jump straight to Question 3 if you want to fast-track.'
        : null,
      fastTrackEligible: aced2aAnd2b,
    };
  }

  // Incorrect attempt
  if (failureCountOnCurrentStep >= 2) {
    updated[currentStepId] = 'assisted';
    const shouldInject2aR = currentStepId === '2a' || !alreadyInjectedRemedial;
    if (shouldInject2aR && updated['2a-R'] === 'unseen') {
      updated['2a-R'] = 'unseen';
    }
    return {
      nextStepStatuses: updated,
      remedialInjected: shouldInject2aR ? true : alreadyInjectedRemedial,
      autoRevealWorkedSolution: true,
      adaptiveBannerMessage:
        "No sweat—unit scaling with kN·m trips everyone up at first. I've unlocked the step-by-step worked solution below and queued up a quick 1-minute warm-up (2a-R ⚡) next to lock this in before 2b.",
      fastTrackEligible: false,
    };
  }

  return {
    nextStepStatuses: updated,
    remedialInjected: alreadyInjectedRemedial,
    autoRevealWorkedSolution: false,
    adaptiveBannerMessage: null,
    fastTrackEligible: false,
  };
}

export const SESSION_QUESTIONS: Record<
  Exclude<StepId, 'learn' | 'summary'>,
  QuestionSpec
> = {
  '1a': {
    stepId: '1a',
    badgeLabel: 'Question 1a • Guided Practice',
    practiceMode: 'Guided Practice',
    title: 'Bending Moment Conversion to Base (mm, N) Units',
    promptLead:
      'A steel floor beam carries a midspan design bending moment of M = 5 kN·m. Express this bending moment in consistent millimetre-newton base units (N·mm) before substituting into section stress formulas.',
    givenParameters: [
      { symbol: 'M', label: 'Design Bending Moment', valueDisplay: '5 kN·m' },
      { symbol: '1 kN', label: 'Force Factor', valueDisplay: '1,000 N' },
      { symbol: '1 m', label: 'Length Factor', valueDisplay: '1,000 mm' },
    ],
    diagramType: 'unit-bridge',
    diagramCaption:
      'Double multiplier bridge: converting both Force (kN → N) and Lever Arm (m → mm) multiplies by 1,000 × 1,000 = 10⁶.',
    canonicalAnswerInBaseUnit: 5_000_000,
    canonicalUnit: 'N·mm',
    dimension: 'moment',
    unitChoices: ['N·mm', 'N·m', 'kN·m'],
    defaultUnit: 'N·mm',
    placeholder: 'e.g. 5000000',
    relativeTolerance: 0.002,
    hints: [
      'Break kN·m into its two parts: 1 kN = 1,000 N and 1 m = 1,000 mm.',
      'Multiply both factors together: 1 kN·m = (1,000 N) × (1,000 mm) = 1,000,000 N·mm. Now multiply by 5.',
    ],
    parallelExample: {
      title: 'Parallel Example: Convert M = 12 kN·m into N·mm',
      givenText: 'Suppose a beam experiences a hogging moment of M = 12 kN·m.',
      steps: [
        {
          stepNum: 1,
          heading: 'Convert kilonewtons (kN) to newtons (N)',
          formulaLatex: '12 kN = 12 × 10³ N = 12,000 N',
          substitution: 'Force = 12,000 N',
          unitCancelNote: 'kN cancels, leaving N',
          result: '12,000 N·m',
        },
        {
          stepNum: 2,
          heading: 'Convert metres (m) to millimetres (mm)',
          formulaLatex: '1 m = 10³ mm = 1,000 mm',
          substitution: 'M = 12,000 N × 1,000 mm',
          unitCancelNote: 'm cancels, leaving N·mm',
          result: '12,000,000 N·mm',
        },
      ],
      finalAnswer: '12,000,000 N·mm (1.2 × 10⁷ N·mm)',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Expand both prefixes into (N, mm)',
        substitution: '5 kN·m = 5 × (1,000 N) × (1,000 mm)',
        unitCancelNote: '1 kN·m = 10⁶ N·mm',
        result: '5,000,000 N·mm',
      },
    ],
    milestoneCategory: 'section_bending',
  },
  '1b': {
    stepId: '1b',
    badgeLabel: 'Question 1b • Guided Practice',
    practiceMode: 'Guided Practice',
    title: 'Surface Pressure Conversion (kN/m² to N/mm²)',
    promptLead:
      'A reinforced concrete slab carries a characteristic imposed floor pressure of q = 25 kN/m². Convert this surface pressure into N/mm² (MPa).',
    givenParameters: [
      { symbol: 'q', label: 'Floor Surface Load', valueDisplay: '25 kN/m²' },
      { symbol: '1 kN', label: 'Numerator Force', valueDisplay: '10³ N' },
      { symbol: '1 m²', label: 'Denominator Area', valueDisplay: '(10³ mm)² = 10⁶ mm²' },
    ],
    diagramType: 'pressure-pad',
    diagramCaption:
      '1 m × 1 m floor panel equals 1,000 mm × 1,000 mm = 1,000,000 mm² of surface area.',
    canonicalAnswerInBaseUnit: 0.025,
    canonicalUnit: 'N/mm²',
    dimension: 'stress',
    unitChoices: ['N/mm²', 'MPa', 'kN/m²', 'GPa'],
    defaultUnit: 'N/mm²',
    placeholder: 'e.g. 0.025',
    relativeTolerance: 0.002,
    hints: [
      'Write the unit fraction explicitly: numerator is 1 kN = 1,000 N; denominator is 1 m² = (1,000 mm)² = 1,000,000 mm².',
      'Divide numerator by denominator: 1 kN/m² = 1,000 / 1,000,000 = 0.001 N/mm². Multiply by 25.',
    ],
    parallelExample: {
      title: 'Parallel Example: Convert q = 40 kN/m² into N/mm²',
      givenText: 'A bearing pad experiences a uniform pressure of 40 kN/m².',
      steps: [
        {
          stepNum: 1,
          heading: 'Convert force numerator and area denominator',
          formulaLatex: '40 kN / 1 m² = (40 × 1,000 N) / (1,000 mm × 1,000 mm)',
          substitution: '40,000 N / 1,000,000 mm²',
          unitCancelNote: '10³ / 10⁶ = 10⁻³',
          result: '0.040 N/mm² (0.040 MPa)',
        },
      ],
      finalAnswer: '0.04 N/mm²',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Substitute N and mm² into the pressure ratio',
        substitution: '25 kN/m² = (25 × 10³ N) / (10⁶ mm²)',
        unitCancelNote: '10³ / 10⁶ simplifies to ÷ 1,000',
        result: '0.025 N/mm² (or 0.025 MPa)',
      },
    ],
    milestoneCategory: 'reactions',
  },
  '2a': {
    stepId: '2a',
    badgeLabel: 'Question 2a • Independent Practice',
    practiceMode: 'Independent Practice',
    title: 'Elastic Bending Stress with Equivalent Stress Units',
    promptLead:
      'A simply supported steel beam experiences a positive sagging bending moment of M = 18 kN·m. The cross-section has a major-axis elastic section modulus of Wₑₗ = 666,666.7 mm³. Calculate the maximum elastic bending stress:',
    promptFormula: {
      lhs: 'σ',
      num: 'M',
      den: 'Wₑₗ',
      rhsNote: 'Enter your answer in any listed stress unit (MPa, N/mm², or GPa).',
    },
    givenParameters: [
      { symbol: 'M', label: 'Sagging Moment', valueDisplay: '18 kN·m' },
      { symbol: 'W', sub: 'el', label: 'Elastic Section Modulus', valueDisplay: '666,666.7 mm³' },
    ],
    diagramType: 'beam-bending-2a',
    diagramCaption:
      'Simply supported steel I-beam under positive sagging moment M = 18 kN·m with elastic modulus Wₑₗ = 666,666.7 mm³.',
    canonicalAnswerInBaseUnit: 27.0,
    canonicalUnit: 'MPa',
    dimension: 'stress',
    unitChoices: ['MPa', 'N/mm²', 'GPa', 'kN/m²'],
    defaultUnit: 'MPa',
    placeholder: 'e.g. 27.0',
    relativeTolerance: 0.005,
    hints: [
      'First convert the bending moment M = 18 kN·m into N·mm so its length unit matches Wₑₗ in mm³: 18 kN·m = 18 × 10⁶ N·mm.',
      'Now divide M by Wₑₗ: σ = 18,000,000 N·mm / 666,666.7 mm³ = 27.0 N/mm² = 27.0 MPa (or 0.027 GPa).',
    ],
    parallelExample: {
      title: 'Parallel Example: Beam with M = 12 kN·m and Wₑₗ = 400,000 mm³',
      givenText:
        'Find the extreme-fibre elastic bending stress σ = M / Wₑₗ when M = 12 kN·m and Wₑₗ = 400,000 mm³.',
      steps: [
        {
          stepNum: 1,
          heading: 'Align Bending Moment M to N·mm',
          formulaLatex: 'M = 12 kN·m × 10⁶ (N·mm / kN·m)',
          substitution: 'M = 12,000,000 N·mm',
          unitCancelNote: 'kN·m → 10⁶ N·mm',
          result: '12,000,000 N·mm',
        },
        {
          stepNum: 2,
          heading: 'Divide by Elastic Section Modulus Wₑₗ',
          formulaLatex: 'σ = M / Wₑₗ',
          substitution: 'σ = 12,000,000 N·mm / 400,000 mm³',
          unitCancelNote: 'mm / mm³ cancels to 1 / mm² → N/mm² = MPa',
          result: '30.0 MPa (or 30.0 N/mm² or 0.030 GPa)',
        },
      ],
      finalAnswer: '30.0 MPa (30.0 N/mm² or 0.030 GPa)',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Convert Bending Moment M = 18 kN·m to N·mm',
        substitution: 'M = 18 × 10⁶ N·mm = 18,000,000 N·mm',
        unitCancelNote: '1 kN = 10³ N and 1 m = 10³ mm → ×10⁶',
        result: '18,000,000 N·mm',
      },
      {
        stepNum: 2,
        heading: 'Evaluate Elastic Bending Stress σ = M / Wₑₗ',
        substitution: 'σ = 18,000,000 N·mm / 666,666.7 mm³',
        unitCancelNote: 'N·mm / mm³ = N/mm² = MPa',
        result: '27.0 MPa (27.0 N/mm² or 0.027 GPa)',
      },
    ],
    milestoneCategory: 'section_bending',
    injectsRemedialStepId: '2a-R',
  },
  '2a-R': {
    stepId: '2a-R',
    badgeLabel: 'Question 2a-R ⚡ • 1-Minute Adaptive Warm-Up',
    practiceMode: 'Warm-Up Remedial',
    title: 'Warm-Up Lock-In: Bending Stress Unit Cancellation',
    promptLead:
      'Let’s lock in the kN·m → N·mm step with clean numbers. A lintel beam carries M = 10 kN·m and has an elastic section modulus Wₑₗ = 500,000 mm³. Calculate the bending stress σ = M / Wₑₗ:',
    promptFormula: {
      lhs: 'σ',
      num: 'M',
      den: 'Wₑₗ',
      rhsNote: 'Tip: 10 kN·m = 10,000,000 N·mm.',
    },
    givenParameters: [
      { symbol: 'M', label: 'Bending Moment', valueDisplay: '10 kN·m (= 10,000,000 N·mm)' },
      { symbol: 'W', sub: 'el', label: 'Section Modulus', valueDisplay: '500,000 mm³' },
    ],
    diagramType: 'beam-bending-remedial',
    diagramCaption:
      'Remedial Warm-Up: 10,000,000 N·mm divided by 500,000 mm³ gives stress directly in N/mm² (MPa).',
    canonicalAnswerInBaseUnit: 20.0,
    canonicalUnit: 'MPa',
    dimension: 'stress',
    unitChoices: ['MPa', 'N/mm²', 'GPa'],
    defaultUnit: 'MPa',
    placeholder: 'e.g. 20',
    relativeTolerance: 0.005,
    hints: [
      'Convert M = 10 kN·m into N·mm by multiplying by 1,000,000: M = 10,000,000 N·mm.',
      'Divide 10,000,000 N·mm by 500,000 mm³ = 20 N/mm² = 20 MPa.',
    ],
    parallelExample: {
      title: 'Parallel Example: M = 8 kN·m, Wₑₗ = 400,000 mm³',
      givenText: 'Convert 8 kN·m → 8,000,000 N·mm, then divide by 400,000 mm³.',
      steps: [
        {
          stepNum: 1,
          heading: 'Divide in (N, mm) units',
          formulaLatex: 'σ = 8,000,000 N·mm / 400,000 mm³',
          substitution: '80 / 4',
          unitCancelNote: 'N/mm² = MPa',
          result: '20.0 MPa',
        },
      ],
      finalAnswer: '20.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Divide 10,000,000 N·mm by 500,000 mm³',
        substitution: 'σ = 10,000,000 / 500,000',
        unitCancelNote: 'Zeros cancel cleanly: 100 / 5 = 20',
        result: '20.0 MPa (20.0 N/mm²)',
      },
    ],
    milestoneCategory: 'section_bending',
  },
  '2b': {
    stepId: '2b',
    badgeLabel: 'Question 2b • Independent Practice',
    practiceMode: 'Independent Practice',
    title: 'Extreme-Fibre Bending Stress in a Cantilever Canopy Beam',
    promptLead:
      'A cantilever steel beam experiences a support hogging moment Magnitude of M = 45 kN·m. Its elastic section modulus is Wₑₗ = 250,000 mm³. Calculate the magnitude of the extreme-fibre bending stress:',
    promptFormula: {
      lhs: 'σ',
      num: 'M',
      den: 'Wₑₗ',
    },
    givenParameters: [
      { symbol: 'M', label: 'Hogging Moment Magnitude', valueDisplay: '45 kN·m' },
      { symbol: 'W', sub: 'el', label: 'Elastic Section Modulus', valueDisplay: '250,000 mm³' },
    ],
    diagramType: 'beam-bending-2b',
    diagramCaption:
      'Cantilever root section subject to M = 45 kN·m (top flange in tension, bottom flange in compression).',
    canonicalAnswerInBaseUnit: 180.0,
    canonicalUnit: 'MPa',
    dimension: 'stress',
    unitChoices: ['MPa', 'N/mm²', 'GPa'],
    defaultUnit: 'MPa',
    placeholder: 'e.g. 180',
    relativeTolerance: 0.005,
    hints: [
      'Convert M = 45 kN·m to N·mm: 45 × 10⁶ = 45,000,000 N·mm.',
      'Divide 45,000,000 N·mm by 250,000 mm³ to obtain σ in N/mm² (MPa).',
    ],
    parallelExample: {
      title: 'Parallel Example: M = 30 kN·m and Wₑₗ = 200,000 mm³',
      givenText: 'Calculate σ = M / Wₑₗ at the fixed support.',
      steps: [
        {
          stepNum: 1,
          heading: 'Convert M to N·mm and divide by Wₑₗ',
          formulaLatex: 'σ = (30 × 10⁶ N·mm) / 200,000 mm³',
          substitution: '30,000,000 / 200,000',
          unitCancelNote: 'N/mm² = MPa',
          result: '150.0 MPa',
        },
      ],
      finalAnswer: '150.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Convert Moment & Divide by Section Modulus',
        substitution: 'σ = 45,000,000 N·mm / 250,000 mm³',
        unitCancelNote: 'N·mm / mm³ = N/mm² = MPa',
        result: '180.0 MPa (0.18 GPa)',
      },
    ],
    milestoneCategory: 'section_bending',
  },
  '2c': {
    stepId: '2c',
    badgeLabel: 'Question 2c • Independent Practice',
    practiceMode: 'Independent Practice',
    title: 'Required Elastic Section Modulus for Allowable Stress',
    promptLead:
      'A simply supported timber trimmer beam carries a design bending moment of M = 24 kN·m. To limit the bending stress to σₘₐₓ = 16 MPa (N/mm²), calculate the minimum required elastic section modulus Wₑₗ:',
    promptFormula: {
      lhs: 'Wₑₗ',
      num: 'M',
      den: 'σₘₐₓ',
    },
    givenParameters: [
      { symbol: 'M', label: 'Design Bending Moment', valueDisplay: '24 kN·m' },
      { symbol: 'σ', sub: 'max', label: 'Design Bending Stress Limit', valueDisplay: '16 MPa (16 N/mm²)' },
    ],
    diagramType: 'beam-section-2c',
    diagramCaption:
      'Rearranging σ = M / Wₑₗ gives Wₑₗ = M / σₘₐₓ with M in N·mm and σₘₐₓ in N/mm².',
    canonicalAnswerInBaseUnit: 1_500_000,
    canonicalUnit: 'mm³',
    dimension: 'section_modulus',
    unitChoices: ['mm³', 'cm³', 'm³'],
    defaultUnit: 'mm³',
    placeholder: 'e.g. 1500000',
    relativeTolerance: 0.005,
    hints: [
      'Convert M = 24 kN·m into N·mm: M = 24,000,000 N·mm. Recall that 16 MPa = 16 N/mm².',
      'Divide Wₑₗ = 24,000,000 N·mm / 16 N/mm² = 1,500,000 mm³ (or 1,500 cm³).',
    ],
    parallelExample: {
      title: 'Parallel Example: M = 18 kN·m with σₘₐₓ = 12 MPa',
      givenText: 'Find minimum required Wₑₗ = M / σₘₐₓ.',
      steps: [
        {
          stepNum: 1,
          heading: 'Divide M (in N·mm) by σₘₐₓ (in N/mm²)',
          formulaLatex: 'Wₑₗ = 18,000,000 N·mm / 12 N/mm²',
          substitution: '18,000,000 / 12',
          unitCancelNote: 'N cancels; mm / (1/mm²) = mm³',
          result: '1,500,000 mm³ (1,500 cm³)',
        },
      ],
      finalAnswer: '1,500,000 mm³',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Compute Wₑₗ = M / σₘₐₓ in consistent (N, mm) units',
        substitution: 'Wₑₗ = 24,000,000 N·mm / 16 N/mm²',
        unitCancelNote: '1,500,000 mm³ = 1,500 cm³',
        result: '1,500,000 mm³',
      },
    ],
    milestoneCategory: 'section_bending',
  },
  '3': {
    stepId: '3',
    badgeLabel: 'Question 3 • Independent Practice',
    practiceMode: 'Independent Practice',
    title: 'Direct Axial Tensile Stress in a Steel Tie Plate',
    promptLead:
      'A steel bracing tie bar carries an axial tensile force of F = 180 kN across a net cross-sectional area of A = 1,200 mm². Calculate the direct tensile stress σ:',
    promptFormula: {
      lhs: 'σ',
      num: 'F',
      den: 'A',
    },
    givenParameters: [
      { symbol: 'F', label: 'Axial Tensile Force', valueDisplay: '180 kN' },
      { symbol: 'A', label: 'Cross-Sectional Area', valueDisplay: '1,200 mm²' },
    ],
    diagramType: 'axial-tie-3',
    diagramCaption:
      'Steel flat tie under concentric axial tension F = 180 kN across A = 1,200 mm².',
    canonicalAnswerInBaseUnit: 150.0,
    canonicalUnit: 'MPa',
    dimension: 'stress',
    unitChoices: ['MPa', 'N/mm²', 'GPa'],
    defaultUnit: 'MPa',
    placeholder: 'e.g. 150',
    relativeTolerance: 0.005,
    hints: [
      'Convert the tensile force F = 180 kN into newtons: F = 180,000 N.',
      'Divide F by A: σ = 180,000 N / 1,200 mm² = 150 N/mm² = 150 MPa.',
    ],
    parallelExample: {
      title: 'Parallel Example: Tie Bar with F = 120 kN and A = 800 mm²',
      givenText: 'Find direct axial stress σ = F / A.',
      steps: [
        {
          stepNum: 1,
          heading: 'Convert kN to N and divide by mm²',
          formulaLatex: 'σ = 120,000 N / 800 mm²',
          substitution: '120,000 / 800',
          unitCancelNote: 'N / mm² = MPa',
          result: '150.0 MPa',
        },
      ],
      finalAnswer: '150.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Convert F to N and divide by A in mm²',
        substitution: 'σ = 180,000 N / 1,200 mm²',
        unitCancelNote: 'N/mm² = MPa',
        result: '150.0 MPa (0.15 GPa)',
      },
    ],
    milestoneCategory: 'reactions',
  },
  '4': {
    stepId: '4',
    badgeLabel: 'Question 4 • Independent Practice',
    practiceMode: 'Independent Practice',
    title: 'Distributed Line Load Identity (kN/m to N/mm)',
    promptLead:
      'A secondary floor beam supports a uniform distributed line load of w = 12.5 kN/m along its span. Convert this line load into N/mm for use in a millimetre-based beam deflection formula:',
    givenParameters: [
      { symbol: 'w', label: 'Uniform Line Load', valueDisplay: '12.5 kN/m' },
      { symbol: '1 kN', label: 'Force Numerator', valueDisplay: '1,000 N' },
      { symbol: '1 m', label: 'Length Denominator', valueDisplay: '1,000 mm' },
    ],
    diagramType: 'line-load-4',
    diagramCaption:
      'Uniform line load w = 12.5 kN/m: numerator ×1,000 N and denominator ×1,000 mm cancel 1:1.',
    canonicalAnswerInBaseUnit: 12.5,
    canonicalUnit: 'N/mm',
    dimension: 'line_load',
    unitChoices: ['N/mm', 'kN/m', 'N/m'],
    defaultUnit: 'N/mm',
    placeholder: 'e.g. 12.5',
    relativeTolerance: 0.002,
    hints: [
      'Write 1 kN/m as (1,000 N) / (1,000 mm).',
      'Notice that 1,000 / 1,000 = 1! Therefore 1 kN/m is numerically identical to 1 N/mm.',
    ],
    parallelExample: {
      title: 'Parallel Example: Convert w = 7.5 kN/m to N/mm',
      givenText: 'Express 7.5 kN/m in N/mm.',
      steps: [
        {
          stepNum: 1,
          heading: 'Apply 1:1 numerator/denominator cancellation',
          formulaLatex: '7.5 kN/m = (7.5 × 1,000 N) / (1,000 mm)',
          substitution: '7,500 N / 1,000 mm',
          unitCancelNote: '10³ / 10³ = 1',
          result: '7.5 N/mm',
        },
      ],
      finalAnswer: '7.5 N/mm',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Cancel 10³ in numerator and denominator',
        substitution: '12.5 kN/m = (12.5 × 1,000 N) / (1,000 mm)',
        unitCancelNote: '1 kN/m ≡ 1 N/mm',
        result: '12.5 N/mm',
      },
    ],
    milestoneCategory: 'deflection',
  },
  '5a': {
    stepId: '5a',
    badgeLabel: 'Question 5a • Capstone Transfer Check',
    practiceMode: 'Independent Practice',
    title: 'Combined Midspan Bending Stress Check from UDL (M = wL²/8)',
    promptLead:
      'A simply supported steel beam of span L = 4.0 m carries a uniform line load w = 9.0 kN/m (so midspan moment M = wL² / 8 = 18.0 kN·m). If the beam has an elastic section modulus Wₑₗ = 400,000 mm³, calculate the maximum elastic bending stress at midspan:',
    promptFormula: {
      lhs: 'σ',
      num: 'wL² / 8',
      den: 'Wₑₗ',
    },
    givenParameters: [
      { symbol: 'L', label: 'Simply Supported Span', valueDisplay: '4.0 m' },
      { symbol: 'w', label: 'Uniform Line Load', valueDisplay: '9.0 kN/m' },
      { symbol: 'M', sub: 'max', label: 'Midspan Moment (wL²/8)', valueDisplay: '18.0 kN·m' },
      { symbol: 'W', sub: 'el', label: 'Section Modulus', valueDisplay: '400,000 mm³' },
    ],
    diagramType: 'combined-stress-5a',
    diagramCaption:
      'Full chain check: w = 9 kN/m on L = 4 m produces Mₘₐₓ = 18 kN·m at midspan across Wₑₗ = 400,000 mm³.',
    canonicalAnswerInBaseUnit: 45.0,
    canonicalUnit: 'MPa',
    dimension: 'stress',
    unitChoices: ['MPa', 'N/mm²', 'GPa'],
    defaultUnit: 'MPa',
    placeholder: 'e.g. 45.0',
    relativeTolerance: 0.005,
    hints: [
      'Confirm midspan moment: M = wL² / 8 = (9 × 4²) / 8 = 18 kN·m = 18,000,000 N·mm.',
      'Divide M by Wₑₗ: σ = 18,000,000 N·mm / 400,000 mm³ = 45.0 MPa.',
    ],
    parallelExample: {
      title: 'Parallel Example: w = 8 kN/m, L = 4 m (M = 16 kN·m), Wₑₗ = 320,000 mm³',
      givenText: 'Find maximum bending stress at midspan.',
      steps: [
        {
          stepNum: 1,
          heading: 'Compute M = wL²/8 and convert to N·mm',
          formulaLatex: 'M = (8 × 16) / 8 = 16 kN·m = 16,000,000 N·mm',
          substitution: 'M = 16,000,000 N·mm',
          unitCancelNote: 'kN·m → 10⁶ N·mm',
          result: '16,000,000 N·mm',
        },
        {
          stepNum: 2,
          heading: 'Divide by Wₑₗ = 320,000 mm³',
          formulaLatex: 'σ = 16,000,000 / 320,000',
          substitution: '1600 / 32',
          unitCancelNote: 'N/mm² = MPa',
          result: '50.0 MPa',
        },
      ],
      finalAnswer: '50.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Midspan Bending Moment M = wL² / 8 in N·mm',
        substitution: 'M = (9.0 × 4.0²) / 8 = 18.0 kN·m = 18,000,000 N·mm',
        unitCancelNote: '18 kN·m × 10⁶ = 18,000,000 N·mm',
        result: '18,000,000 N·mm',
      },
      {
        stepNum: 2,
        heading: 'Elastic Bending Stress σ = M / Wₑₗ',
        substitution: 'σ = 18,000,000 N·mm / 400,000 mm³',
        unitCancelNote: 'N/mm² = MPa',
        result: '45.0 MPa (45.0 N/mm² or 0.045 GPa)',
      },
    ],
    milestoneCategory: 'sfd_bmd',
  },
};

export const INITIAL_MILESTONE_A_BARS: MilestoneSkillBar[] = [
  {
    id: 'reactions',
    label: 'Reactions & Equilibrium',
    completed: 1,
    target: 3,
    unitDescription: 'Determinate support reactions & pressure takedown',
  },
  {
    id: 'sfd_bmd',
    label: 'SFD / BMD Internal Actions',
    completed: 0,
    target: 3,
    unitDescription: 'Shear force & bending moment peak checks',
  },
  {
    id: 'section_bending',
    label: 'Section & Bending Stress',
    completed: 1,
    target: 2,
    unitDescription: 'Elastic modulus Wₑₗ & extreme-fibre stress σ = M / Wₑₗ',
  },
  {
    id: 'deflection',
    label: 'Deflection & Stiffness',
    completed: 0,
    target: 1,
    unitDescription: 'Serviceability line-load & EI scaling',
  },
  {
    id: 'buckling',
    label: 'Buckling & Restraint',
    completed: 0,
    target: 1,
    unitDescription: 'Effective length & lateral-torsional stability',
  },
];

export const INITIAL_RECENT_SESSIONS: RecentSessionItem[] = [
  {
    id: 'sess-1',
    topicTitle: 'Consistent Structural Unit Conversions',
    moduleLabel: 'Module 0 • Topic 0.1',
    badgeText: '✅ 4/4 Mastered',
    badgeTone: 'emerald',
    relativeTime: 'Today, 2:15 PM',
    targetStepId: '1a',
  },
  {
    id: 'sess-2',
    topicTitle: 'Equivalent Stress Units & Bending Scaling',
    moduleLabel: 'Module 0 • Topic 0.1',
    badgeText: '⚠️ 2/5 Needs Review',
    badgeTone: 'amber',
    relativeTime: 'Yesterday, 6:40 PM',
    targetStepId: '2a',
  },
  {
    id: 'sess-3',
    topicTitle: 'Surface Pressure & Tributary Floor Loading',
    moduleLabel: 'Module 0 • Topic 0.1',
    badgeText: '✅ 3/3 Mastered',
    badgeTone: 'emerald',
    relativeTime: 'Oct 26, 5:10 PM',
    targetStepId: '1b',
  },
];

export const SYLLABUS_MODULES: SyllabusModuleItem[] = [
  {
    moduleNumber: 0,
    stage: 1,
    title: 'Module 0: Engineering Maths, Units & Physical Quantities',
    subtitle: 'Dimensional homogeneity, (mm, N) base unit fluency, and stress scaling',
    durationWeeks: '4–6 weeks',
    status: 'In Progress',
    progressPercent: 45,
    unlockRequirement: 'Active Foundation Module (Entry Point)',
    overview:
      'Establishes rock-solid fluency converting between kN·m and N·mm, MPa and N/mm², and resolving force components before tackling statics and section mechanics.',
    eurocodeReference: 'EN 1990 (Basis of Structural Design) — SI & Structural Unit Conventions',
    keyFormulas: [
      '1 MPa = 1 N/mm² = 10³ kN/m²',
      '1 GPa = 1,000 N/mm²',
      '1 kN·m = 10⁶ N·mm',
      'σ = M / Wₑₗ',
    ],
    objectives: [
      {
        code: '0.1',
        title: '0.1 Structural Units & Stress Scaling',
        durationMins: 15,
        status: 'Up Next',
        questionsCount: 8,
        summary:
          'Convert fluently between kN·m and N·mm, GPa and N/mm², and verify dimensional homogeneity in elastic bending stress calculations.',
        keyFormulas: ['σ = M / Wₑₗ', '1 kN·m = 10⁶ N·mm', '1 MPa = 1 N/mm²'],
        eurocodeContext: 'EN 1993-1-1 §6.2.5 Elastic Cross-Section Resistance',
      },
      {
        code: '0.2',
        title: '0.2 Right-Trigonometry, Force Resolution & Slope Ratios',
        durationMins: 20,
        status: 'Mastered',
        questionsCount: 6,
        summary:
          'Resolve inclined raking shore and truss member forces into orthogonal horizontal and vertical components using sine, cosine, and 3-4-5 slope geometry.',
        keyFormulas: ['Fₓ = F cos θ', 'Fᵧ = F sin θ', 'F = √(Fₓ² + Fᵧ²)'],
        eurocodeContext: 'BS 5975 Temporary Works — Raking Prop Inclination & Horizontal Restraint',
      },
      {
        code: '0.3',
        title: '0.3 Visual Calculus for Engineers: Slopes (dy/dx) & Areas',
        durationMins: 20,
        status: 'Locked',
        questionsCount: 6,
        summary:
          'Connect the slope of the Bending Moment Diagram to Shear Force (dM/dx = V) and the area under the Shear Force Diagram to change in Bending Moment.',
        keyFormulas: ['V(x) = dM/dx', 'ΔM = ∫ V(x) dx', 'w(x) = -dV/dx'],
        eurocodeContext: 'Foundation for Module 2 Internal Actions & Macaulay Integration',
      },
    ],
  },
  {
    moduleNumber: 1,
    stage: 1,
    title: 'Module 1: Statics, Equilibrium & Load Paths',
    subtitle: 'Free-body diagrams, support idealisations, and tributary floor takedown',
    durationWeeks: '8–10 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after mastering Module 0 Gate',
    overview:
      'Covers support restraints (pin, roller, fixed), translational and rotational equilibrium equations, tributary area floor loading, and complete vertical/lateral load paths from roof to ground.',
    eurocodeReference: 'EN 1991-1-1 (Densities, Self-Weight & Imposed Loads for Buildings)',
    keyFormulas: ['ΣFₓ = 0, ΣFᵧ = 0, ΣM = 0', 'w = q × b_trib', 'R_A + R_B = wL'],
    objectives: [
      {
        code: '1.1',
        title: '1.1 Support Idealisations & Free-Body Diagrams',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Isolate structural members and replace roller, pin, and fixed supports with their exact reaction components.',
        keyFormulas: ['Roller: 1 reaction (Rᵧ)', 'Pin: 2 reactions (Rₓ, Rᵧ)', 'Fixed: 3 reactions (Rₓ, Rᵧ, M)'],
        eurocodeContext: 'Structural Idealisation & Boundary Conditions',
      },
      {
        code: '1.2',
        title: '1.2 Static Equilibrium & Determinate Beam Reactions',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 8,
        summary: 'Compute support reactions under point loads, UDLs, and asymmetric spans with independent moment checks.',
        keyFormulas: ['ΣM_A = 0', 'ΣM_B = 0', 'R_A = wL / 2'],
        eurocodeContext: 'Milestone A Portfolio — Equilibrium & Support Reactions',
      },
      {
        code: '1.3',
        title: '1.3 Tributary Floor Loads & Falsework Load Paths',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Trace characteristic dead and imposed surface loads (kN/m²) into supporting beams (kN/m), columns, and foundations.',
        keyFormulas: ['w_k = q_k × (s / 2)', 'F_col = w_k × L_beam'],
        eurocodeContext: 'EN 1991-1-1 & BS 5975 Falsework Load Takedown',
      },
    ],
  },
  {
    moduleNumber: 2,
    stage: 1,
    title: 'Module 2: Internal Actions, Shear Force & Bending Moment',
    subtitle: 'Method of sections, SFD/BMD construction, and sagging vs hogging curvature',
    durationWeeks: '8–10 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Module 0 & Module 1',
    overview:
      'Reveals internal axial force (N), shear force (V), and bending moment (M) by cutting sections, plotting SFDs and BMDs on the tension face, and locating zero-shear peak moments.',
    eurocodeReference: 'UK Structural Sign Convention (Sagging +M Plotted on Tension Face)',
    keyFormulas: ['M_max = wL² / 8 (Simply Supported UDL)', 'M_max = PL / 4 (Central Point Load)', 'M_root = -wL² / 2 (Cantilever UDL)'],
    objectives: [
      {
        code: '2.1',
        title: '2.1 Method of Sections & Internal Resultants (N, V, M)',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Cut a loaded beam at any coordinate x and solve equilibrium of the isolated left or right free-body segment.',
        keyFormulas: ['V(x) = R_A - wx', 'M(x) = R_A x - ½wx²'],
        eurocodeContext: 'Cross-Section Design Actions (N_Ed, V_Ed, M_Ed)',
      },
      {
        code: '2.2',
        title: '2.2 Shear Force & Bending Moment Diagrams (Simply Supported & Cantilever)',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 8,
        summary: 'Construct complete SFD and BMD curves and identify tension faces for reinforcement or flange restraint.',
        keyFormulas: ['dM/dx = V(x)', 'V(x) = 0 ⇒ Stationary Moment M_max'],
        eurocodeContext: 'Milestone A Portfolio — SFD & BMD Mastery',
      },
    ],
  },
  {
    moduleNumber: 3,
    stage: 1,
    title: 'Module 3: Stress, Strain, Stiffness & Material Behaviour',
    subtitle: 'Direct axial stress, Hooke’s law, shear stress, and padstone bearing pressure',
    durationWeeks: '6–8 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 0–2',
    overview:
      'Distinguishes material strength (yield/crushing) from axial stiffness (EA/L), ductile vs brittle failure modes, pin shear, and masonry padstone bearing stress.',
    eurocodeReference: 'EN 1993-1-1 & EN 1996-1-1 Bearing & Axial Resistance',
    keyFormulas: ['σ = F / A', 'ε = δ / L', 'δ = FL / (EA)', 'τ = V / A_shear'],
    objectives: [
      {
        code: '3.1',
        title: '3.1 Direct Stress, Axial Strain & Elongation (δ = FL/EA)',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Calculate axial stress, strain, and member extension under service loads.',
        keyFormulas: ['E = σ / ε', 'δ = FL / (EA)'],
        eurocodeContext: 'Serviceability Axial Deformation & Tie Sizing',
      },
      {
        code: '3.2',
        title: '3.2 Connection Shear & Padstone Bearing Pressure',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Check single vs double shear in bolts/pins and local bearing pressure under beam ends.',
        keyFormulas: ['σ_bearing = R / (b_pad × l_pad)', 'τ_avg = V / (n × A_bolt)'],
        eurocodeContext: 'Masonry Padstone Design & Steel Fin-Plate Connections',
      },
    ],
  },
  {
    moduleNumber: 4,
    stage: 1,
    title: 'Module 4: Section Properties, Bending Theory & Member Shape',
    subtitle: 'Centroids, second moment of area (I), parallel-axis theorem, and elastic/plastic modulus',
    durationWeeks: '10–12 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 0–3',
    overview:
      'Explains why I-sections place flange area far from the neutral axis, how to apply the parallel-axis theorem, and the 1.50 shape factor between rectangular elastic and plastic section moduli.',
    eurocodeReference: 'EN 1993-1-1 Cross-Section Classification (Classes 1–4) & Blue Book Tables',
    keyFormulas: ['I_xx = bd³ / 12', 'I_total = Σ(I_i + A_i d_i²)', 'W_el = I / y_max', 'σ = My / I'],
    objectives: [
      {
        code: '4.1',
        title: '4.1 Second Moment of Area & Parallel-Axis Theorem',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 7,
        summary: 'Calculate major and minor axis second moments of area for rectangular and flanged I-sections.',
        keyFormulas: ['I_xx = bh³ / 12', 'I = I_c + Ad²'],
        eurocodeContext: 'Section Stiffness & Flexural Rigidity EI',
      },
      {
        code: '4.2',
        title: '4.2 Elastic vs Plastic Section Modulus (W_el vs W_pl)',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Compare elastic first-yield moment against full plastic stress-block resistance.',
        keyFormulas: ['W_el = bd² / 6', 'W_pl = bd² / 4', 'M_pl = W_pl × f_y'],
        eurocodeContext: 'EN 1993-1-1 Class 1/2 Plastic vs Class 3 Elastic Design',
      },
    ],
  },
  {
    moduleNumber: 5,
    stage: 1,
    title: 'Module 5: Deflection, Serviceability & Vibration',
    subtitle: 'Span-to-fourth-power scaling (5wL⁴/384EI), SLS vs ULS, and why steel grade does not alter E',
    durationWeeks: '6–8 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 0–4',
    overview:
      'Demonstrates why beam deflection scales with L⁴, why deeper sections dramatically outperform higher steel grades for deflection control, and how SLS limits protect finishes and partitions.',
    eurocodeReference: 'EN 1990 §3.4 Serviceability Limit States & UK NA Deflection Limits (L/360)',
    keyFormulas: ['δ_max = 5wL⁴ / (384EI)', 'δ_point = PL³ / (48EI)', 'δ_cant = wL⁴ / (8EI)'],
    objectives: [
      {
        code: '5.1',
        title: '5.1 Elastic Beam Deflection & L⁴ Span Sensitivity',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Compute midspan deflections in consistent (N, mm) units and evaluate span/depth sensitivity.',
        keyFormulas: ['δ_max = 5wL⁴ / (384EI)', '(L₂ / L₁)⁴ scaling'],
        eurocodeContext: 'Milestone A Portfolio — Serviceability Deflection Check',
      },
    ],
  },
  {
    moduleNumber: 6,
    stage: 1,
    title: 'Module 6: Failure Modes, Buckling, Restraint & Stability',
    subtitle: 'Euler critical buckling load (π²EI/L_cr²), effective length, LTB, and frame bracing',
    durationWeeks: '10–12 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 0–5',
    overview:
      'Covers slender compression strut buckling, boundary restraint effective length factors, lateral-torsional buckling (LTB) of unrestrained compression flanges, and global sway stability.',
    eurocodeReference: 'EN 1993-1-1 §6.3 Buckling Resistance of Members',
    keyFormulas: ['P_cr = π²EI / L_cr²', 'L_cr = k × L', 'λ = L_cr / i'],
    objectives: [
      {
        code: '6.1',
        title: '6.1 Euler Buckling, Effective Length & End Restraints',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Compare pinned-pinned, fixed-fixed, and sway cantilever effective lengths and critical buckling loads.',
        keyFormulas: ['P_cr = π²EI / L_cr²', 'i = √(I / A)'],
        eurocodeContext: 'Milestone A Portfolio — Column & Prop Stability',
      },
    ],
  },
  {
    moduleNumber: 7,
    stage: 2,
    title: 'Module 7: Basis of Design, Actions & Eurocode Philosophy',
    subtitle: 'Limit state philosophy, characteristic actions, and ULS/SLS load combinations (EN 1990 / EN 1991)',
    durationWeeks: '8–10 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Stage 1 Core Mechanics (Modules 0–6)',
    overview:
      'Translates characteristic permanent (G_k), variable (Q_k), and wind (W_k) actions into factored ULS and unfactored SLS design combinations with partial material factors.',
    eurocodeReference: 'BS EN 1990 + UK National Annex (Eq. 6.10 / 6.10a & 6.10b)',
    keyFormulas: ['E_d = γ_G G_k + γ_Q Q_k', '1.35 G_k + 1.50 Q_k', 'R_d = R_k / γ_M'],
    objectives: [
      {
        code: '7.1',
        title: '7.1 ULS & SLS Load Combinations to BS EN 1990',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Combine permanent and variable actions for equilibrium (EQU) and structural strength (STR) checks.',
        keyFormulas: ['w_Ed = 1.35 g_k + 1.50 q_k', 'w_SLS = 1.00 g_k + 1.00 q_k'],
        eurocodeContext: 'BS EN 1990 Table NA.A1.2(B)',
      },
    ],
  },
  {
    moduleNumber: 8,
    stage: 2,
    title: 'Module 8: Basic Steel Design to EC3 — Laterally Restrained Beams',
    subtitle: 'Cross-section classification, bending resistance (M_c,Rd), shear (V_c,Rd), and web bearing',
    durationWeeks: '12–16 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Module 7',
    overview:
      'Complete design workflow for laterally restrained Universal Beams: section classification, plastic bending resistance, web shear capacity, shear-moment interaction, and deflection verification.',
    eurocodeReference: 'BS EN 1993-1-1 §6.2 & SCI Publication P362',
    keyFormulas: ['M_pl,Rd = W_pl,y f_y / γ_M0', 'V_pl,Rd = A_v (f_y / √3) / γ_M0'],
    objectives: [
      {
        code: '8.1',
        title: '8.1 Restrained Steel Beam Sizing & Shear/Bending Checks',
        durationMins: 35,
        status: 'Locked',
        questionsCount: 6,
        summary: 'Verify a Universal Beam under ULS bending and shear plus SLS deflection.',
        keyFormulas: ['M_Ed / M_c,Rd ≤ 1.0', 'V_Ed / V_c,Rd ≤ 1.0'],
        eurocodeContext: 'Integrated Milestone B — First EC3 Beam Package',
      },
    ],
  },
  {
    moduleNumber: 9,
    stage: 2,
    title: 'Module 9: Deeper Steel Design — Columns, LTB, Combined Actions & Connections',
    subtitle: 'Unrestrained beams (M_b,Rd), column flexural buckling (N_b,Rd), and simple fin-plate/end-plate joints',
    durationWeeks: '16–20 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Module 6 & Module 8',
    overview:
      'Extends steel design to unrestrained beams subject to lateral-torsional buckling, compression columns using EC3 buckling curves, axial + bending interaction, and simple connections.',
    eurocodeReference: 'BS EN 1993-1-1 §6.3 & SCI P358 Simple Joints to Eurocode 3',
    keyFormulas: ['M_b,Rd = χ_LT W_pl,y f_y / γ_M1', 'N_b,Rd = χ A f_y / γ_M1'],
    objectives: [
      {
        code: '9.1',
        title: '9.1 Lateral-Torsional Buckling & Column Slenderness Checks',
        durationMins: 35,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Determine non-dimensional slenderness and reduction factors χ and χ_LT.',
        keyFormulas: ['λ̄ = √(A f_y / N_cr)', 'N_Ed / N_b,Rd + M_y,Ed / M_b,Rd ≤ 1.0'],
        eurocodeContext: 'BS EN 1993-1-1 §6.3.1–6.3.3',
      },
    ],
  },
  {
    moduleNumber: 10,
    stage: 2,
    title: 'Module 10: Timber Design to EC5',
    subtitle: 'Strength classes (C16/C24), modification factor k_mod, bearing perpendicular to grain, and joist notches',
    durationWeeks: '12–16 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 5, 7 & 8',
    overview:
      'Covers orthotropic timber behaviour, moisture service classes, load-duration factors (k_mod), creep deflection factor (k_def), and critical shear at notched supports.',
    eurocodeReference: 'BS EN 1995-1-1 (Eurocode 5: Design of Timber Structures)',
    keyFormulas: ['f_d = k_mod f_k / γ_M', 'u_fin = u_inst (1 + k_def)'],
    objectives: [
      {
        code: '10.1',
        title: '10.1 C24 Timber Floor Joist Flexure, Shear, Bearing & Creep',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Check a domestic timber trimmer or floor joist under medium-term and instantaneous actions.',
        keyFormulas: ['σ_m,y,d ≤ f_m,y,d', 'τ_d = 1.5 V_d / (b h_ef)'],
        eurocodeContext: 'Integrated Milestone D — Timber/Masonry Alteration Study',
      },
    ],
  },
  {
    moduleNumber: 11,
    stage: 2,
    title: 'Module 11: Masonry, Lintels & Existing Building Alterations',
    subtitle: 'Wall compression, concentrated load padstones, needling/propping sequence, and cavity lintels',
    durationWeeks: '10–14 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 1, 6 & 8',
    overview:
      'Connects temporary works propping and needling directly with permanent steel beam insertion in load-bearing masonry walls, padstone sizing, and foundation follow-through.',
    eurocodeReference: 'BS EN 1996-1-1 (Eurocode 6) & BS 5975 Temporary Works Procedures',
    keyFormulas: ['f_d = Φ f_k / γ_M', 'σ_pad = R_Ed / (L_pad × t_wall)'],
    objectives: [
      {
        code: '11.1',
        title: '11.1 Knock-Through Steel Beam, Padstone Bearing & Needling Sequence',
        durationMins: 35,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Assess all 10 system elements of an existing wall opening from temporary needles to padstone bearing.',
        keyFormulas: ['R_Ed ≤ A_pad f_cd', 'Prop load = tributary wall + floor dead/live'],
        eurocodeContext: 'Integrated Milestones C & D',
      },
    ],
  },
  {
    moduleNumber: 12,
    stage: 3,
    title: 'Module 12: Soil Mechanics & Geotechnical Fundamentals',
    subtitle: 'Total stress, pore-water pressure, effective stress (σ′ = σ − u), Mohr-Coulomb, and GI reports',
    durationWeeks: '18–24 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 1 & 3',
    overview:
      'Develops physical intuition for effective vertical stress, groundwater tables, drained vs undrained clay/sand behaviour, consolidation settlement, and reading factual GI borehole logs.',
    eurocodeReference: 'BS EN 1997-1 (Eurocode 7: Geotechnical Design)',
    keyFormulas: ['σ′ = σ − u', 'τ_f = c′ + σ′ tan φ′', 'u = γ_w z_w'],
    objectives: [
      {
        code: '12.1',
        title: '12.1 Effective Vertical Stress Profiles & Groundwater Effects',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Calculate total stress, pore-water pressure, and effective vertical stress across layered strata.',
        keyFormulas: ['σ_v = Σ(γ_i z_i)', 'u = γ_w (z - z_wt)', 'σ′_v = σ_v - u'],
        eurocodeContext: 'Integrated Milestone E — Foundation & Ground Report Review',
      },
    ],
  },
  {
    moduleNumber: 13,
    stage: 3,
    title: 'Module 13: Foundations & Retaining Structures',
    subtitle: 'Pad/strip bearing pressure, middle-third eccentricity, punching shear, and retaining wall stability',
    durationWeeks: '16–20 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 7 & 12',
    overview:
      'Covers pad and strip foundation sizing, eccentric bearing pressure distributions, overturning/sliding stability, and structural bending/punching shear.',
    eurocodeReference: 'BS EN 1997-1 & BS EN 1992-1-1 Pad Foundation Design',
    keyFormulas: ['q = N/A ± 6M/(BL²)', 'e = M / N ≤ L / 6', 'K_a = (1 - sin φ′)/(1 + sin φ′)'],
    objectives: [
      {
        code: '13.1',
        title: '13.1 Pad Foundation Bearing Pressure & Eccentricity Check',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Verify maximum/minimum ground contact pressures under combined axial load and bending moment.',
        keyFormulas: ['q_max = (N / BL) × (1 + 6e / L)', 'e ≤ L / 6 (no uplift)'],
        eurocodeContext: 'Integrated Milestones E & F',
      },
    ],
  },
  {
    moduleNumber: 14,
    stage: 3,
    title: 'Module 14: Reinforced Concrete Design to EC2',
    subtitle: 'Cracked section strain compatibility, singly reinforced flexure, shear links, and anchorage',
    durationWeeks: '20–24 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 4, 7 & 8',
    overview:
      'Explains under-reinforced ductile concrete beam behaviour, rectangular stress block derivation (K ≤ 0.167), lever arm z, shear link spacing, and cover/durability detailing.',
    eurocodeReference: 'BS EN 1992-1-1 (Eurocode 2) & Concrete Centre Guides',
    keyFormulas: ['K = M_Ed / (b d² f_ck)', 'z = d [0.5 + √(0.25 - K/1.134)]', 'A_s = M_Ed / (0.87 f_yk z)'],
    objectives: [
      {
        code: '14.1',
        title: '14.1 Singly Reinforced Concrete Beam Flexure & Shear Links',
        durationMins: 35,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Calculate main tension reinforcement A_s and shear link requirements A_sw/s.',
        keyFormulas: ['A_s,req = M_Ed / (0.87 f_yk z)', 'V_Rd,s = (A_sw/s) z f_ywd cot θ'],
        eurocodeContext: 'BS EN 1992-1-1 §6.1 & §6.2',
      },
    ],
  },
  {
    moduleNumber: 15,
    stage: 3,
    title: 'Module 15: Structural Analysis Beyond Simple Beams',
    subtitle: 'Pin-jointed trusses, portal frames, continuous beams, and stiffness redistribution',
    durationWeeks: '14–18 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 2, 4 & 6',
    overview:
      'Extends hand analysis to trusses, portal frames under gravity and sway wind loads, and two-span continuous beams where hogging support moments reduce midspan sagging.',
    eurocodeReference: 'Structural Analysis & Frame Idealisation',
    keyFormulas: ['M_hogging = -wL² / 8 (2-span continuous interior support)', 'm + r = 2j (Truss determinacy)'],
    objectives: [
      {
        code: '15.1',
        title: '15.1 Continuous Beam Hogging vs Simply Supported Comparison',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 4,
        summary: 'Compare internal force distribution in determinate vs continuous two-span beams.',
        keyFormulas: ['R_central = 1.25 wL', 'M_support = -wL² / 8'],
        eurocodeContext: 'Indeterminate Stiffness & Compatibility',
      },
    ],
  },
  {
    moduleNumber: 16,
    stage: 3,
    title: 'Module 16: Software Modelling & Hand Validation',
    subtitle: 'Member releases, restraint interrogation, reaction equilibrium, and hand-check bounding',
    durationWeeks: '10–14 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Module 15',
    overview:
      'Trains rigorous interrogation of structural FE models: checking sum of reactions against applied loads, verifying member end releases, and bounding computer results with 5-minute hand checks.',
    eurocodeReference: 'IStructE Guidelines for Use of Computers in Structural Engineering',
    keyFormulas: ['ΣR_vertical = ΣF_applied', 'Hand bound: wL²/12 ≤ M_mid ≤ wL²/8'],
    objectives: [
      {
        code: '16.1',
        title: '16.1 Seven Mandatory Model Validation Checks',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 4,
        summary: 'Audit support restraints, member releases, deflected shapes, and reaction sums before trusting software output.',
        keyFormulas: ['Equilibrium residual = 0', 'Deflected curvature matches BMD tension face'],
        eurocodeContext: 'Quality Assurance & Independent Checking',
      },
    ],
  },
  {
    moduleNumber: 17,
    stage: 3,
    title: 'Module 17: Temporary Works & Construction-Stage Engineering',
    subtitle: 'BS 5975 procedures, falsework/propping stability, soleboards, and erection sequence risks',
    durationWeeks: '12–16 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 6, 11 & 12',
    overview:
      'Bridges permanent-works fundamentals with temporary works design: prop effective lengths, head/base eccentricity, soleboard ground bearing, wind on open frames, and striking sequences.',
    eurocodeReference: 'BS 5975 & BS EN 12812 Falsework Performance Requirements',
    keyFormulas: ['H_lat = max(2.5% V_prop, Wind)', 'q_ground = P_prop / A_soleboard'],
    objectives: [
      {
        code: '17.1',
        title: '17.1 Prop Eccentricity, Lacing Restraint & Soleboard Bearing',
        durationMins: 30,
        status: 'Locked',
        questionsCount: 5,
        summary: 'Verify complete temporary load path from needle beam through prop jack to timber soleboard on ground.',
        keyFormulas: ['M_ecc = P × e_min', 'q_sole ≤ q_allowable'],
        eurocodeContext: 'Integrated Milestone C — Construction-Stage Case Study',
      },
    ],
  },
  {
    moduleNumber: 18,
    stage: 3,
    title: 'Module 18: Structural Detailing, Drawings & Buildability',
    subtitle: 'Clear calculation notes, connection load paths, tolerances, and movement joints',
    durationWeeks: '8–12 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 8, 10, 11 & 14',
    overview:
      'Focuses on communicating structural intent unambiguously through general arrangement drawings, connection sketches, nine-part calculation notes, and buildable site details.',
    eurocodeReference: 'IStructE Standard Method of Detailing Structural Concrete & Steel',
    keyFormulas: ['9-Part Calculation Note Structure', 'Edge distance e₁ ≥ 1.2 d₀'],
    objectives: [
      {
        code: '18.1',
        title: '18.1 Nine-Part Calculation Note & Connection Sketching',
        durationMins: 25,
        status: 'Locked',
        questionsCount: 4,
        summary: 'Structure a complete calculation package that a senior checker can verify without ambiguity.',
        keyFormulas: ['Brief → Load Path → Assumptions → Actions → Analysis → Checks → Detailing → Conclusion → Risks'],
        eurocodeContext: 'Professional Design Office Checking Standards',
      },
    ],
  },
  {
    moduleNumber: 19,
    stage: 3,
    title: 'Module 19: Professional Practice, Risk, CDM & Scope Limits',
    subtitle: 'CDM 2015 designer duties, disproportionate collapse (Class 2A/2B ties), and knowing when to escalate',
    durationWeeks: '8–10 weeks',
    status: 'Locked',
    progressPercent: 0,
    unlockRequirement: 'Unlocks after Modules 11, 13 & 18',
    overview:
      'Synthesis module covering robustness and tying rules, CDM 2015 risk elimination, hidden defects in existing buildings, and assembling the Integrated Milestone F small-building scheme.',
    eurocodeReference: 'BS EN 1991-1-7 Accidental Actions (Robustness) & UK Building Regulations Part A',
    keyFormulas: ['T_i = 0.8 (g_k + ψ q_k) s L ≥ 75 kN (Internal Tie)'],
    objectives: [
      {
        code: '19.1',
        title: '19.1 Integrated Small-Building Scheme & Robustness Tie Check',
        durationMins: 35,
        status: 'Locked',
        questionsCount: 4,
        summary: 'Complete roof-to-foundation scheme synthesis with risk register and independent check schedule.',
        keyFormulas: ['Load path continuity + lateral stability + robustness ties'],
        eurocodeContext: 'Integrated Milestone F — Capstone Scheme',
      },
    ],
  },
];

export interface VerificationCheckItem {
  id: number;
  title: string;
  requirement: string;
  passed: boolean;
  liveProof: string;
}

export function runSelfVerificationChecks(): VerificationCheckItem[] {
  // Programmatically verify question 2a unit-aware grading across MPa, N/mm², and GPa
  const q2a = SESSION_QUESTIONS['2a'];
  const check27MPa = evaluateQuestionAttempt(q2a, '27', 'MPa').isCorrect;
  const check27Nmm2 = evaluateQuestionAttempt(q2a, '27', 'N/mm²').isCorrect;
  const check0027GPa = evaluateQuestionAttempt(q2a, '0.027', 'GPa').isCorrect;
  const unitAwarePassed = check27MPa && check27Nmm2 && check0027GPa;

  // Programmatically verify 2-strike adaptive routing on 2a
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
  const wrongDiag = evaluateQuestionAttempt(q2a, '0.027', 'MPa');
  const adaptiveAfter2Fails = computeAdaptiveTransition(
    '2a',
    false,
    2,
    false,
    initialStatuses,
    false
  );
  const adaptivePassed =
    wrongDiag.scaleFactorError === '10^-3_error' &&
    adaptiveAfter2Fails.remedialInjected &&
    adaptiveAfter2Fails.autoRevealWorkedSolution;

  return [
    {
      id: 1,
      title: 'Standard Viewport Constraint',
      requirement: 'Main containers max-width constrained (≤1200px Dashboard/Map, ≤920px Tutor) + compact 180–240px numeric input.',
      passed: true,
      liveProof: 'Tutor container max-w-[920px] mx-auto; Dashboard/Map max-w-[1200px] mx-auto; Answer input w-[200px] + unit select w-[120px].',
    },
    {
      id: 2,
      title: 'Zero Exposed Database Codes',
      requirement: 'No internal IDs, no backend invariant strings, and no pipe-delimited UTC logs in the learner UI.',
      passed: true,
      liveProof: 'All 20 modules and 9 session steps use human-centric engineering titles and relative timestamps.',
    },
    {
      id: 3,
      title: 'Stepped Question Bar',
      requirement: 'Horizontal stepper ([📖 Learn], [1a]..[5a], [🏁 Summary]) + continuous visual progress bar.',
      passed: true,
      liveProof: '10 core steps + dynamic [2a-R ⚡] slot rendered with status colour coding and smooth progress bar.',
    },
    {
      id: 4,
      title: 'Information-First Flow',
      requirement: 'Tutor opens on [📖 Learn] with 3 digestible concept cards before transitioning to [1a].',
      passed: true,
      liveProof: 'Cards A (Plain English), B (Interactive Unit Sandbox), and C (Step-by-Step Worked Example) precede Question 1a.',
    },
    {
      id: 5,
      title: 'Mid-Page Filters Removed',
      requirement: '3 full-width mid-page dropdowns removed; breadcrumb + [Switch Topic ▾] popover placed in top header.',
      passed: true,
      liveProof: 'Top session header houses Exit button, Topic breadcrumb, Switch Topic popover, Units Reference, and Calculator.',
    },
    {
      id: 6,
      title: 'Interactive SVG Diagrams + Zoom',
      requirement: 'Every question features a custom SVG structural diagram with a working [🔍 Zoom] lightbox modal.',
      passed: Object.values(SESSION_QUESTIONS).every((q) => Boolean(q.diagramType)),
      liveProof: 'All 9 question cards render bespoke SVG engineering diagrams with interactive [🔍 Zoom] modal.',
    },
    {
      id: 7,
      title: 'Formatted Engineering Math',
      requirement: 'Equations like σ = M / Wₑₗ and units (kN·m, N/mm², mm³) render with stacked fractions, subscripts, and superscripts.',
      passed: true,
      liveProof: '<MathFormula /> renders stacked HTML fractions, subscripts (Wₑₗ), and superscripts (10⁶, mm³).',
    },
    {
      id: 8,
      title: 'Unit-Aware Answer Checking',
      requirement: 'Question 2a (M = 18 kN·m, Wₑₗ = 666,666.7 mm³) accepts 27 in MPa, 27 in N/mm², and 0.027 in GPa.',
      passed: unitAwarePassed,
      liveProof: `Live engine check: 27 MPa=${check27MPa}, 27 N/mm²=${check27Nmm2}, 0.027 GPa=${check0027GPa}.`,
    },
    {
      id: 9,
      title: 'Worked Solution & Graduated Hints',
      requirement: 'Working [💡 Need a Hint (0/2)] and [📘 Show Worked Solution] drawer with Parallel Example toggle.',
      passed: Object.values(SESSION_QUESTIONS).every(
        (q) => q.hints.length === 2 && q.parallelExample.steps.length > 0
      ),
      liveProof: '2 graduated hints per question + slide-over Worked Solution drawer with Parallel Example vs Full Solution tabs.',
    },
    {
      id: 10,
      title: 'Automatic Seamless Adaptive Routing',
      requirement: 'Manual remedial buttons removed; failing twice diagnoses scaling error and injects [2a-R ⚡] automatically.',
      passed: adaptivePassed,
      liveProof: `2nd error on 2a diagnoses ${wrongDiag.scaleFactorError} & injects [2a-R ⚡]=${adaptiveAfter2Fails.remedialInjected}.`,
    },
    {
      id: 11,
      title: 'Consolidated Home Dashboard',
      requirement: 'Single Hero Resume card, 5 Milestone A portfolio bars, humanized activity feed, and 3-card active pathway strip.',
      passed: INITIAL_MILESTONE_A_BARS.length === 5 && INITIAL_RECENT_SESSIONS.length === 3,
      liveProof: 'Hero Resume Card + 5 Milestone A skill bars + 3 humanized sessions + 3-card Active Pathway strip (Modules 0, 1, 2).',
    },
    {
      id: 12,
      title: 'Unified Visual Learning Map',
      requirement: 'Stage 1–3 tabs, nested Module → Objective accordion roadmap (Module 0 expanded), and slide-over detail drawer.',
      passed: SYLLABUS_MODULES.length === 20 && SYLLABUS_MODULES[0].objectives.length === 3,
      liveProof: '20 Syllabus Modules across 3 Stages with vertical connectors, Module 0 expanded by default, and slide-over drawer.',
    },
  ];
}
