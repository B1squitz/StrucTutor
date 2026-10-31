import { formatEngineeringNumber } from './beamEngine';

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
> = {
  '1a': {
    id: '1a',
    badgeLabel: 'Step 1a • Support Reaction Equilibrium',
    numberLabel: 'Step 1a of 5',
    topicTag: 'Equilibrium & Support Reactions',
    dimension: 'force',
    difficulty: 'Foundational',
    title: 'Calculate Vertical Support Reaction R_A for Simply Supported UDL Beam',
    promptTitle: 'Calculate Vertical Support Reaction R_A for Simply Supported UDL Beam',
    promptLead:
      'A simply supported steel floor beam spans L = 6.0 m between pinned support A and roller support B. It carries a uniform distributed load w = 4.0 kN/m across its full length. Calculate the vertical support reaction R_A at support A.',
    promptBody:
      'A simply supported steel floor beam spans L = 6.0 m between pinned support A and roller support B. It carries a uniform distributed load w = 4.0 kN/m across its full length. Calculate the vertical support reaction R_A at support A.',
    promptFormula: {
      lhs: 'R_A',
      num: 'w · L',
      den: '2',
      rhsNote: 'by symmetry for a full-span UDL',
    },
    givenParameters: [
      { symbol: 'L', label: 'Span', valueDisplay: '6.0 m' },
      { symbol: 'w', label: 'UDL', valueDisplay: '4.0 kN/m' },
    ],
    givenData: ['Span L = 6.0 m', 'Uniform load w = 4.0 kN/m'],
    diagramType: 'simply_supported_udl',
    diagramCaption:
      'Simply supported beam spanning L = 6.0 m under uniform load w = 4.0 kN/m.',
    defaultUnit: 'kN',
    canonicalUnit: 'kN',
    requiredUnit: 'kN',
    unitChoices: ['kN', 'N', 'MN'],
    allowedUnits: ['kN', 'N', 'MN'],
    canonicalAnswerInBaseUnit: 12.0,
    canonicalAnswer: 12.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.05,
    placeholder: 'e.g. 12.0',
    milestoneCategory: 'eq-reactions',
    skillBarId: 'eq-reactions',
    hints: [
      'First compute the total resultant vertical force W = w × L acting over the 6.0 m span.',
      'By symmetry, the resultant W acts at midspan (x = 3.0 m), so R_A = R_B = W / 2 = (4.0 × 6.0) / 2 kN.',
    ],
    parallelExample: {
      title: 'Parallel Example: 8.0 m Span with w = 5.0 kN/m UDL',
      givenText:
        'A simply supported beam spans L = 8.0 m and carries a uniform load w = 5.0 kN/m over its full length.',
      steps: [
        {
          stepNum: 1,
          heading: 'Total resultant load W',
          formulaLatex: 'W = w · L',
          substitution: '5.0 kN/m × 8.0 m',
          result: '40.0 kN',
          unitCancelNote: '(kN/m) × m = kN',
        },
        {
          stepNum: 2,
          heading: 'Share equally between symmetric supports A and B',
          formulaLatex: 'R_A = W / 2',
          substitution: '40.0 kN / 2',
          result: '20.0 kN',
          unitCancelNote: 'kN',
        },
      ],
      finalAnswer: '20.0 kN',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Compute total resultant downward load W on the 6.0 m span',
        substitution: 'W = 4.0 kN/m × 6.0 m',
        result: '24.0 kN',
        unitCancelNote: '(kN/m) × m = kN',
      },
      {
        stepNum: 2,
        heading: 'Apply moment equilibrium ΣM_B = 0 (or symmetry)',
        substitution: 'R_A = 24.0 kN / 2',
        result: '12.0 kN',
        unitCancelNote: 'kN (upwards)',
      },
    ],
  },
  '1b': {
    id: '1b',
    badgeLabel: 'Step 1b • Peak Sagging Bending Moment',
    numberLabel: 'Step 1b of 5',
    topicTag: 'Internal Bending Moment (UDL)',
    dimension: 'moment',
    difficulty: 'Core Practice',
    title: 'Calculate Maximum Midspan Sagging Moment M_max',
    promptTitle: 'Calculate Maximum Midspan Sagging Moment M_max',
    promptLead:
      'For the 6.0 m simply supported beam carrying a uniform distributed load w = 4.0 kN/m (with vertical reactions R_A = R_B = 12.0 kN), calculate the peak sagging bending moment M_max at midspan (x = 3.0 m).',
    promptBody:
      'For the 6.0 m simply supported beam carrying a uniform distributed load w = 4.0 kN/m (with vertical reactions R_A = R_B = 12.0 kN), calculate the peak sagging bending moment M_max at midspan (x = 3.0 m).',
    promptFormula: {
      lhs: 'M_max',
      num: 'w · L²',
      den: '8',
      rhsNote: 'at midspan x = L / 2 where V(x) = 0',
    },
    givenParameters: [
      { symbol: 'L', label: 'Span', valueDisplay: '6.0 m' },
      { symbol: 'w', label: 'UDL', valueDisplay: '4.0 kN/m' },
      { symbol: 'R', sub: 'A', label: 'Reaction', valueDisplay: '12.0 kN' },
    ],
    givenData: ['Span L = 6.0 m', 'UDL w = 4.0 kN/m', 'Reaction R_A = 12.0 kN'],
    diagramType: 'simply_supported_udl',
    diagramCaption:
      'Parabolic Bending Moment Diagram plotted on the bottom tension face peaking at x = 3.0 m.',
    defaultUnit: 'kN·m',
    canonicalUnit: 'kN·m',
    requiredUnit: 'kN·m',
    unitChoices: ['kN·m', 'N·mm', 'N·m'],
    allowedUnits: ['kN·m', 'N·mm', 'N·m'],
    canonicalAnswerInBaseUnit: 18.0,
    canonicalAnswer: 18.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.05,
    placeholder: 'e.g. 18.0',
    milestoneCategory: 'sfd-bmd',
    skillBarId: 'sfd-bmd',
    hints: [
      'Take a free-body cut at midspan x = 3.0 m where shear force V(x) = 0.',
      'Evaluate M_max = R_A × 3.0 m − (4.0 kN/m × 3.0 m) × 1.5 m, or use w·L² / 8 = (4.0 × 6.0²) / 8.',
    ],
    parallelExample: {
      title: 'Parallel Example: 8.0 m Span with w = 5.0 kN/m UDL',
      givenText:
        'A simply supported beam of span L = 8.0 m carries a uniform distributed load w = 5.0 kN/m.',
      steps: [
        {
          stepNum: 1,
          heading: 'Apply parabolic midspan moment formula',
          formulaLatex: 'M_max = (w · L²) / 8',
          substitution: '(5.0 kN/m × (8.0 m)²) / 8',
          result: '40.0 kN·m',
          unitCancelNote: '(kN/m) × m² = kN·m',
        },
      ],
      finalAnswer: '40.0 kN·m',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Take moments to the left of midspan cut x = 3.0 m',
        substitution: 'M(3.0) = (12.0 kN × 3.0 m) − (12.0 kN × 1.5 m)',
        result: '36.0 − 18.0 = 18.0 kN·m',
        unitCancelNote: 'kN × m = kN·m',
      },
      {
        stepNum: 2,
        heading: 'Cross-check with w·L² / 8',
        substitution: '(4.0 kN/m × 36.0 m²) / 8',
        result: '18.0 kN·m',
        unitCancelNote: 'kN·m (sagging)',
      },
    ],
  },
  '2a': {
    id: '2a',
    badgeLabel: 'Step 2a • Elastic Flexural Stress (Navier)',
    numberLabel: 'Step 2a of 5',
    topicTag: 'Elastic Flexural Stress (Navier Formula)',
    dimension: 'stress',
    difficulty: 'Core Practice',
    title: 'Calculate Extreme Fibre Bending Stress σ_max (in MPa)',
    promptTitle: 'Calculate Extreme Fibre Bending Stress σ_max (in MPa)',
    promptLead:
      'The beam carries a peak sagging bending moment M_max = 18.0 kN·m. Its cross-section is a solid 100 mm × 200 mm rectangle with second moment of area I_xx = 6.67 × 10⁷ mm⁴ and elastic section modulus W_el = b·d²/6 = 6.67 × 10⁵ mm³ (667 cm³). Calculate the maximum longitudinal bending stress σ_max at the extreme fibre (y_max = 100 mm).',
    promptBody:
      'The beam carries a peak sagging bending moment M_max = 18.0 kN·m. Its cross-section is a solid 100 mm × 200 mm rectangle with second moment of area I_xx = 6.67 × 10⁷ mm⁴ and elastic section modulus W_el = b·d²/6 = 6.67 × 10⁵ mm³ (667 cm³). Calculate the maximum longitudinal bending stress σ_max at the extreme fibre (y_max = 100 mm).',
    promptFormula: {
      lhs: 'σ_max',
      num: 'M_max · y_max',
      den: 'I_xx',
      rhsNote: 'Convert M_max to N·mm (× 10⁶) so N·mm / mm³ gives N/mm² = MPa',
    },
    givenParameters: [
      { symbol: 'M', sub: 'max', label: 'Moment', valueDisplay: '18.0 kN·m' },
      { symbol: 'b × d', label: 'Section', valueDisplay: '100 × 200 mm' },
      {
        symbol: 'W',
        sub: 'el',
        label: 'Modulus',
        valueDisplay: '6.67 × 10⁵ mm³ (667 cm³)',
      },
    ],
    givenData: [
      'Peak moment M_max = 18.0 kN·m',
      'Width b = 100 mm, Depth d = 200 mm',
      'Elastic modulus W_el = b·d²/6 = 6.67 × 10⁵ mm³ (667 cm³)',
    ],
    diagramType: 'rectangular_section_stress',
    diagramCaption:
      'Rectangular section 100 mm × 200 mm (W_el = 6.67 × 10⁵ mm³) with linear elastic bending stress distribution.',
    defaultUnit: 'MPa',
    canonicalUnit: 'MPa',
    requiredUnit: 'MPa',
    unitChoices: ['MPa', 'N/mm²', 'GPa', 'kPa'],
    allowedUnits: ['MPa', 'N/mm²', 'GPa', 'kPa'],
    canonicalAnswerInBaseUnit: 27.0,
    canonicalAnswer: 27.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.1,
    placeholder: 'e.g. 27.0',
    milestoneCategory: 'flexure-stress',
    skillBarId: 'flexure-stress',
    hints: [
      'Convert M_max = 18.0 kN·m into N·mm first: 18.0 × 10⁶ N·mm (since 1 kN = 10³ N and 1 m = 10³ mm).',
      'Divide M_max = 18.0 × 10⁶ N·mm by W_el = (100 × 200²)/6 = 6.67 × 10⁵ mm³ to obtain σ_max = 27.0 N/mm² = 27.0 MPa.',
    ],
    parallelExample: {
      title: 'Parallel Example: M = 12.0 kN·m on a 100 mm × 200 mm Section',
      givenText:
        'A 100 mm × 200 mm section (W_el = 6.67 × 10⁵ mm³) resists a bending moment of M = 12.0 kN·m.',
      steps: [
        {
          stepNum: 1,
          heading: 'Convert bending moment from kN·m to N·mm',
          formulaLatex: 'M = 12.0 × 10⁶ N·mm',
          substitution: '12.0 kN·m × (10³ N/kN) × (10³ mm/m)',
          result: '1.20 × 10⁷ N·mm',
          unitCancelNote: 'kN·m → N·mm (×10⁶)',
        },
        {
          stepNum: 2,
          heading: 'Divide by elastic section modulus W_el = b·d²/6',
          formulaLatex: 'σ_max = M / W_el',
          substitution: '(1.20 × 10⁷ N·mm) / (6.67 × 10⁵ mm³)',
          result: '18.0 MPa',
          unitCancelNote: 'N·mm / mm³ = N/mm² ≡ MPa',
        },
      ],
      finalAnswer: '18.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Convert M_max = 18.0 kN·m to consistent N·mm',
        substitution: '18.0 kN·m × 10⁶ (N·mm / kN·m)',
        result: '18,000,000 N·mm (1.80 × 10⁷ N·mm)',
        unitCancelNote: '1 kN·m = 10⁶ N·mm',
      },
      {
        stepNum: 2,
        heading: 'Evaluate elastic section modulus W_el = b·d² / 6',
        substitution: '(100 mm × (200 mm)²) / 6',
        result: '6.67 × 10⁵ mm³ (667 cm³)',
        unitCancelNote: 'mm × mm² = mm³ (3 sig figs)',
      },
      {
        stepNum: 3,
        heading: 'Compute extreme fibre stress σ_max = M_max / W_el',
        substitution: '(1.80 × 10⁷ N·mm) / ((4.00 × 10⁶ / 6) mm³)',
        result: '27.0 MPa (27.0 N/mm²)',
        unitCancelNote: 'N/mm² = MPa',
      },
    ],
  },
  '2a-R': {
    id: '2a-R',
    badgeLabel: 'Step 2a-R • Remedial Unit-Scaling Warm-Up',
    numberLabel: 'Remedial Sub-Step 2a-R',
    topicTag: 'Unit Consistency Drill (kN·m to N·mm)',
    dimension: 'stress',
    difficulty: 'Remedial Sub-Step',
    isRemedial: true,
    title: 'Warm-Up Drill: Convert kN·m to N·mm Before Dividing by W_el',
    promptTitle: 'Warm-Up Drill: Convert kN·m to N·mm Before Dividing by W_el',
    promptLead:
      'To eliminate the 10³ / 10⁶ unit conversion slip, calculate the extreme fibre stress σ in MPa when the same 100 mm × 200 mm section (W_el = 6.67 × 10⁵ mm³) carries a bending moment of M = 6.0 kN·m (= 6.0 × 10⁶ N·mm).',
    promptBody:
      'To eliminate the 10³ / 10⁶ unit conversion slip, calculate the extreme fibre stress σ in MPa when the same 100 mm × 200 mm section (W_el = 6.67 × 10⁵ mm³) carries a bending moment of M = 6.0 kN·m (= 6.0 × 10⁶ N·mm).',
    promptFormula: {
      lhs: 'σ',
      num: '6.0 × 10⁶ N·mm',
      den: '6.67 × 10⁵ mm³',
      rhsNote: 'Cancel 10⁵ between numerator and denominator',
    },
    givenParameters: [
      { symbol: 'M', label: 'Moment', valueDisplay: '6.0 kN·m = 6.0 × 10⁶ N·mm' },
      { symbol: 'W', sub: 'el', label: 'Modulus', valueDisplay: '6.67 × 10⁵ mm³' },
    ],
    givenData: ['M = 6.0 kN·m = 6.0 × 10⁶ N·mm', 'W_el = 6.67 × 10⁵ mm³'],
    diagramType: 'rectangular_section_stress',
    diagramCaption:
      'Unit consistency drill: 6.0 × 10⁶ N·mm divided by W_el = 6.67 × 10⁵ mm³.',
    defaultUnit: 'MPa',
    canonicalUnit: 'MPa',
    requiredUnit: 'MPa',
    unitChoices: ['MPa', 'N/mm²', 'GPa'],
    allowedUnits: ['MPa', 'N/mm²', 'GPa'],
    canonicalAnswerInBaseUnit: 9.0,
    canonicalAnswer: 9.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.05,
    placeholder: 'e.g. 9.0',
    milestoneCategory: 'unit-fluency',
    skillBarId: 'unit-fluency',
    hints: [
      'Write M = 6.0 × 10⁶ N·mm and W_el = (4.0 × 10⁶ / 6) mm³.',
      'Cancel 10⁶: σ = 6.0 / (4.0 / 6) = 36 / 4 = 9.0 MPa.',
    ],
    parallelExample: {
      title: 'Parallel Example: M = 4.0 kN·m on W_el = 6.67 × 10⁵ mm³',
      givenText: 'Compute σ = (4.0 × 10⁶ N·mm) / (6.67 × 10⁵ mm³).',
      steps: [
        {
          stepNum: 1,
          heading: 'Divide in consistent N and mm units',
          formulaLatex: 'σ = M / W_el',
          substitution: '(4.0 × 10⁶ N·mm) / (6.67 × 10⁵ mm³)',
          result: '6.0 MPa',
          unitCancelNote: 'N/mm² = MPa',
        },
      ],
      finalAnswer: '6.0 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Divide M in N·mm by W_el in mm³',
        substitution: '(6.0 × 10⁶ N·mm) / (6.67 × 10⁵ mm³)',
        result: '9.0 MPa',
        unitCancelNote: 'N/mm² = MPa',
      },
    ],
  },
  '2b': {
    id: '2b',
    badgeLabel: 'Step 2b • Elastic Serviceability Deflection',
    numberLabel: 'Step 2b of 5',
    topicTag: 'Elastic Deflection Serviceability (SLS)',
    dimension: 'length',
    difficulty: 'Core Practice',
    title: 'Verify Midspan Vertical Deflection δ_max (in mm)',
    promptTitle: 'Verify Midspan Vertical Deflection δ_max (in mm)',
    promptLead:
      'For the 6.0 m (= 6,000 mm) simply supported beam under unfactored SLS uniform load w = 4.0 kN/m (= 4.0 N/mm), with Young’s modulus E = 210,000 MPa (N/mm²) and second moment of area I = 8.10 × 10⁷ mm⁴, calculate the midspan vertical deflection δ_max.',
    promptBody:
      'For the 6.0 m (= 6,000 mm) simply supported beam under unfactored SLS uniform load w = 4.0 kN/m (= 4.0 N/mm), with Young’s modulus E = 210,000 MPa (N/mm²) and second moment of area I = 8.10 × 10⁷ mm⁴, calculate the midspan vertical deflection δ_max.',
    promptFormula: {
      lhs: 'δ_max',
      num: '5 · w · L⁴',
      den: '384 · E · I',
      rhsNote: 'Use w in N/mm and L in mm so δ_max is in mm',
    },
    givenParameters: [
      { symbol: 'L', label: 'Span', valueDisplay: '6,000 mm' },
      { symbol: 'w', label: 'SLS Load', valueDisplay: '4.0 N/mm' },
      { symbol: 'E', label: 'Modulus', valueDisplay: '210,000 MPa' },
      { symbol: 'I', label: 'Inertia', valueDisplay: '8.10 × 10⁷ mm⁴' },
    ],
    givenData: [
      'L = 6,000 mm',
      'w = 4.0 kN/m = 4.0 N/mm',
      'E = 210,000 N/mm²',
      'I = 8.10 × 10⁷ mm⁴',
    ],
    diagramType: 'simply_supported_udl',
    diagramCaption:
      'Elastic deflected shape under serviceability UDL w = 4.0 N/mm.',
    defaultUnit: 'mm',
    canonicalUnit: 'mm',
    requiredUnit: 'mm',
    unitChoices: ['mm', 'm', 'cm'],
    allowedUnits: ['mm', 'm', 'cm'],
    canonicalAnswerInBaseUnit: 3.97,
    canonicalAnswer: 3.97,
    relativeTolerance: 0.02,
    absoluteTolerance: 0.08,
    placeholder: 'e.g. 3.97',
    milestoneCategory: 'deflection-sls',
    skillBarId: 'deflection-sls',
    hints: [
      'Express all quantities in N and mm: w = 4.0 N/mm, L = 6,000 mm, E = 210,000 N/mm², I = 8.10 × 10⁷ mm⁴.',
      'Compute (5 × 4.0 × 6,000⁴) / (384 × 210,000 × 8.10 × 10⁷) = 3.97 mm.',
    ],
    parallelExample: {
      title: 'Parallel Example: 5.0 m Span with w = 3.0 N/mm',
      givenText:
        'A beam spanning L = 5,000 mm with E = 210,000 MPa and I = 8.10 × 10⁷ mm⁴ carries w = 3.0 N/mm.',
      steps: [
        {
          stepNum: 1,
          heading: 'Substitute N and mm values into 5wL⁴ / (384EI)',
          formulaLatex: 'δ = (5 · w · L⁴) / (384 · E · I)',
          substitution: '(5 × 3.0 × 5,000⁴) / (384 × 210,000 × 8.10 × 10⁷)',
          result: '1.43 mm',
          unitCancelNote: '(N/mm · mm⁴) / (N/mm² · mm⁴) = mm',
        },
      ],
      finalAnswer: '1.43 mm',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Evaluate numerator 5 · w · L⁴ in N·mm³',
        substitution: '5 × 4.0 N/mm × (6,000 mm)⁴',
        result: '2.592 × 10¹⁶ N·mm³',
        unitCancelNote: 'N·mm³',
      },
      {
        stepNum: 2,
        heading: 'Divide by 384 · E · I',
        substitution: '2.592 × 10¹⁶ / (384 × 210,000 × 8.10 × 10⁷)',
        result: '3.97 mm',
        unitCancelNote: 'mm (< L/360 = 16.7 mm)',
      },
    ],
  },
  '2c': {
    id: '2c',
    badgeLabel: 'Step 2c • Superposition (UDL + Point Load)',
    numberLabel: 'Step 2c of 5',
    topicTag: 'Concentrated Point Load Superposition',
    dimension: 'moment',
    difficulty: 'Extension',
    title: 'Combined Midspan Bending Moment (UDL + Central Point Load)',
    promptTitle: 'Combined Midspan Bending Moment (UDL + Central Point Load)',
    promptLead:
      'In addition to the uniform load w = 4.0 kN/m over the 6.0 m span (which gives M_udl = 18.0 kN·m at midspan), a secondary trimmer beam applies a central point load P = 10.0 kN at x = 3.0 m. Calculate the total peak midspan bending moment M_total.',
    promptBody:
      'In addition to the uniform load w = 4.0 kN/m over the 6.0 m span (which gives M_udl = 18.0 kN·m at midspan), a secondary trimmer beam applies a central point load P = 10.0 kN at x = 3.0 m. Calculate the total peak midspan bending moment M_total.',
    promptFormula: {
      lhs: 'M_total',
      num: 'w · L²',
      den: '8',
      rhsNote: 'Plus central point load contribution (P · L) / 4',
    },
    givenParameters: [
      { symbol: 'L', label: 'Span', valueDisplay: '6.0 m' },
      { symbol: 'w', label: 'UDL', valueDisplay: '4.0 kN/m' },
      { symbol: 'P', label: 'Point Load', valueDisplay: '10.0 kN at midspan' },
    ],
    givenData: ['L = 6.0 m', 'w = 4.0 kN/m (M_udl = 18.0 kN·m)', 'P = 10.0 kN at x = 3.0 m'],
    diagramType: 'simply_supported_point',
    diagramCaption:
      'Combined UDL (4.0 kN/m) and central point load (P = 10.0 kN) on a 6.0 m simple span.',
    defaultUnit: 'kN·m',
    canonicalUnit: 'kN·m',
    requiredUnit: 'kN·m',
    unitChoices: ['kN·m', 'N·mm', 'N·m'],
    allowedUnits: ['kN·m', 'N·mm', 'N·m'],
    canonicalAnswerInBaseUnit: 33.0,
    canonicalAnswer: 33.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.1,
    placeholder: 'e.g. 33.0',
    milestoneCategory: 'sfd-bmd',
    skillBarId: 'sfd-bmd',
    hints: [
      'Compute the midspan bending moment from the central point load alone: M_point = (P × L) / 4 = (10.0 × 6.0) / 4 = 15.0 kN·m.',
      'Add the co-located UDL midspan moment: M_total = 18.0 + 15.0 = 33.0 kN·m.',
    ],
    parallelExample: {
      title: 'Parallel Example: M_udl = 20.0 kN·m + Central P = 8.0 kN on L = 6.0 m',
      givenText: 'Combine M_udl = 20.0 kN·m with P = 8.0 kN at midspan on a 6.0 m span.',
      steps: [
        {
          stepNum: 1,
          heading: 'Point load midspan moment P·L / 4',
          formulaLatex: 'M_point = (P · L) / 4',
          substitution: '(8.0 kN × 6.0 m) / 4',
          result: '12.0 kN·m',
          unitCancelNote: 'kN·m',
        },
        {
          stepNum: 2,
          heading: 'Superpose midspan moments',
          formulaLatex: 'M_total = M_udl + M_point',
          substitution: '20.0 + 12.0',
          result: '32.0 kN·m',
          unitCancelNote: 'kN·m',
        },
      ],
      finalAnswer: '32.0 kN·m',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Calculate point load moment M_point = P·L / 4',
        substitution: '(10.0 kN × 6.0 m) / 4',
        result: '15.0 kN·m',
        unitCancelNote: 'kN·m',
      },
      {
        stepNum: 2,
        heading: 'Add co-existing UDL midspan moment M_udl = 18.0 kN·m',
        substitution: '18.0 kN·m + 15.0 kN·m',
        result: '33.0 kN·m',
        unitCancelNote: 'kN·m',
      },
    ],
  },
  '3': {
    id: '3',
    badgeLabel: 'Step 3 • Parabolic Shear Stress (Jourawski)',
    numberLabel: 'Step 3 of 5',
    topicTag: 'Rectangular Section Shear Stress (Jourawski Formula)',
    dimension: 'stress',
    difficulty: 'Core Practice',
    title: 'Calculate Peak Neutral-Axis Shear Stress τ_max',
    promptTitle: 'Calculate Peak Neutral-Axis Shear Stress τ_max',
    promptLead:
      'At the support of the 100 mm × 200 mm rectangular section (area A = 20,000 mm²), the combined vertical shear force is V_max = 17.0 kN (= 17,000 N). Calculate the peak parabolic shear stress τ_max at the neutral axis.',
    promptBody:
      'At the support of the 100 mm × 200 mm rectangular section (area A = 20,000 mm²), the combined vertical shear force is V_max = 17.0 kN (= 17,000 N). Calculate the peak parabolic shear stress τ_max at the neutral axis.',
    promptFormula: {
      lhs: 'τ_max',
      num: '3 · V_max',
      den: '2 · b · d',
      rhsNote: 'Peak neutral-axis shear stress in a rectangle is 1.5 × (V / A)',
    },
    givenParameters: [
      { symbol: 'V', sub: 'max', label: 'Support Shear', valueDisplay: '17.0 kN' },
      { symbol: 'A', label: 'Area b·d', valueDisplay: '20,000 mm²' },
    ],
    givenData: ['V_max = 17.0 kN = 17,000 N', 'b = 100 mm, d = 200 mm (A = 20,000 mm²)'],
    diagramType: 'rectangular_section_stress',
    diagramCaption: 'Rectangular section 100 mm × 200 mm under vertical shear V_max = 17.0 kN.',
    defaultUnit: 'MPa',
    canonicalUnit: 'MPa',
    requiredUnit: 'MPa',
    unitChoices: ['MPa', 'N/mm²', 'kPa'],
    allowedUnits: ['MPa', 'N/mm²', 'kPa'],
    canonicalAnswerInBaseUnit: 1.275,
    canonicalAnswer: 1.275,
    relativeTolerance: 0.015,
    absoluteTolerance: 0.02,
    placeholder: 'e.g. 1.28',
    milestoneCategory: 'flexure-stress',
    skillBarId: 'flexure-stress',
    hints: [
      'Convert V_max = 17.0 kN to 17,000 N and divide by area A = 20,000 mm² to get average shear stress 0.85 MPa.',
      'Multiply by 1.5 for the peak neutral-axis shear stress of a solid rectangle: 1.5 × 0.85 = 1.275 MPa (1.28 MPa).',
    ],
    parallelExample: {
      title: 'Parallel Example: V = 12.0 kN on a 100 mm × 200 mm Section',
      givenText: 'Compute peak shear stress τ_max = 1.5 × V / (b·d) for V = 12,000 N.',
      steps: [
        {
          stepNum: 1,
          heading: 'Evaluate 1.5 × V / A',
          formulaLatex: 'τ_max = (3 · V) / (2 · b · d)',
          substitution: '(3 × 12,000 N) / (2 × 20,000 mm²)',
          result: '0.90 MPa',
          unitCancelNote: 'N / mm² = MPa',
        },
      ],
      finalAnswer: '0.90 MPa',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Compute average shear stress V / (b·d)',
        substitution: '17,000 N / (100 mm × 200 mm)',
        result: '0.85 N/mm²',
        unitCancelNote: 'N/mm² = MPa',
      },
      {
        stepNum: 2,
        heading: 'Apply rectangular parabolic factor 3/2',
        substitution: '1.5 × 0.85 MPa',
        result: '1.28 MPa (1.275 MPa exact)',
        unitCancelNote: 'MPa',
      },
    ],
  },
  '4': {
    id: '4',
    badgeLabel: 'Step 4 • Eurocode ULS Load Combination (EN 1990)',
    numberLabel: 'Step 4 of 5',
    topicTag: 'Eurocode EN 1990 ULS Action Combination',
    dimension: 'line_load',
    difficulty: 'Verification',
    title: 'Calculate Factored ULS Design Load Intensity w_Ed',
    promptTitle: 'Calculate Factored ULS Design Load Intensity w_Ed',
    promptLead:
      'If the beam’s unfactored loading consists of characteristic permanent dead load G_k = 2.5 kN/m and characteristic variable floor load Q_k = 1.5 kN/m, calculate the factored Ultimate Limit State (ULS) design load w_Ed using γ_G = 1.35 and γ_Q = 1.50.',
    promptBody:
      'If the beam’s unfactored loading consists of characteristic permanent dead load G_k = 2.5 kN/m and characteristic variable floor load Q_k = 1.5 kN/m, calculate the factored Ultimate Limit State (ULS) design load w_Ed using γ_G = 1.35 and γ_Q = 1.50.',
    promptFormula: {
      lhs: 'w_Ed',
      num: '1.35 · G_k + 1.50 · Q_k',
      den: '1',
      rhsNote: 'BS EN 1990 Eq. (6.10) ULS combination',
    },
    givenParameters: [
      { symbol: 'G', sub: 'k', label: 'Permanent', valueDisplay: '2.5 kN/m' },
      { symbol: 'Q', sub: 'k', label: 'Variable', valueDisplay: '1.5 kN/m' },
      { symbol: 'γ', sub: 'G,Q', label: 'Factors', valueDisplay: '1.35, 1.50' },
    ],
    givenData: ['G_k = 2.5 kN/m', 'Q_k = 1.5 kN/m', 'γ_G = 1.35, γ_Q = 1.50'],
    diagramType: 'simply_supported_udl',
    diagramCaption: 'Factored ULS design line load w_Ed = 1.35 G_k + 1.50 Q_k.',
    defaultUnit: 'kN/m',
    canonicalUnit: 'kN/m',
    requiredUnit: 'kN/m',
    unitChoices: ['kN/m', 'N/mm', 'N/m'],
    allowedUnits: ['kN/m', 'N/mm', 'N/m'],
    canonicalAnswerInBaseUnit: 5.625,
    canonicalAnswer: 5.625,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.03,
    placeholder: 'e.g. 5.625',
    milestoneCategory: 'eq-reactions',
    skillBarId: 'eq-reactions',
    hints: [
      'Multiply permanent load G_k = 2.5 kN/m by γ_G = 1.35 to get 3.375 kN/m.',
      'Multiply variable load Q_k = 1.5 kN/m by γ_Q = 1.50 to get 2.250 kN/m, and sum: 3.375 + 2.250 = 5.625 kN/m.',
    ],
    parallelExample: {
      title: 'Parallel Example: G_k = 3.0 kN/m and Q_k = 2.0 kN/m',
      givenText: 'Combine G_k = 3.0 kN/m and Q_k = 2.0 kN/m at ULS.',
      steps: [
        {
          stepNum: 1,
          heading: 'Apply 1.35 and 1.50 partial safety factors',
          formulaLatex: 'w_Ed = 1.35 G_k + 1.50 Q_k',
          substitution: '(1.35 × 3.0) + (1.50 × 2.0)',
          result: '7.05 kN/m',
          unitCancelNote: 'kN/m',
        },
      ],
      finalAnswer: '7.05 kN/m',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Combine factored permanent and variable actions',
        substitution: '(1.35 × 2.5 kN/m) + (1.50 × 1.5 kN/m)',
        result: '3.375 + 2.250 = 5.63 kN/m (5.625 kN/m exact)',
        unitCancelNote: 'kN/m',
      },
    ],
  },
  '5a': {
    id: '5a',
    badgeLabel: 'Step 5a • Simpson’s Rule BMD Area Verification',
    numberLabel: 'Step 5a of 5',
    topicTag: 'Independent Verification & Equilibrium Check',
    dimension: 'moment_area',
    difficulty: 'Verification',
    title: 'Compute Parabolic BMD Area ∫ M(x) dx by Simpson’s 1/3 Rule',
    promptTitle: 'Compute Parabolic BMD Area ∫ M(x) dx by Simpson’s 1/3 Rule',
    promptLead:
      'To verify moment-area curvature independently, compute the total area ∫ M(x) dx under the symmetric parabolic bending moment diagram over the span L = 6.0 m when M(0) = 0, M(3.0) = 18.0 kN·m, and M(6.0) = 0.',
    promptBody:
      'To verify moment-area curvature independently, compute the total area ∫ M(x) dx under the symmetric parabolic bending moment diagram over the span L = 6.0 m when M(0) = 0, M(3.0) = 18.0 kN·m, and M(6.0) = 0.',
    promptFormula: {
      lhs: 'Area_M',
      num: '2 · M_max · L',
      den: '3',
      rhsNote: 'Exact by Simpson’s 1/3 rule: (L / 6) · [M(0) + 4·M(L/2) + M(L)]',
    },
    givenParameters: [
      { symbol: 'L', label: 'Span', valueDisplay: '6.0 m' },
      { symbol: 'M', sub: 'max', label: 'Midspan BMD', valueDisplay: '18.0 kN·m' },
    ],
    givenData: ['Span L = 6.0 m', 'M(0) = 0, M(3.0) = 18.0 kN·m, M(6.0) = 0'],
    diagramType: 'simply_supported_udl',
    diagramCaption: 'Parabolic BMD area integration over L = 6.0 m.',
    defaultUnit: 'kN·m²',
    canonicalUnit: 'kN·m²',
    requiredUnit: 'kN·m²',
    unitChoices: ['kN·m²'],
    allowedUnits: ['kN·m²'],
    canonicalAnswerInBaseUnit: 72.0,
    canonicalAnswer: 72.0,
    relativeTolerance: 0.01,
    absoluteTolerance: 0.2,
    placeholder: 'e.g. 72.0',
    milestoneCategory: 'sfd-bmd',
    skillBarId: 'sfd-bmd',
    hints: [
      'For a symmetric quadratic parabola of base L and height M_max, the enclosed area is (2/3) × M_max × L.',
      'Compute (2 / 3) × 18.0 kN·m × 6.0 m = 72.0 kN·m².',
    ],
    parallelExample: {
      title: 'Parallel Example: Parabolic BMD with M_max = 15.0 kN·m on L = 6.0 m',
      givenText: 'Integrate the area under a symmetric parabolic BMD with M_max = 15.0 kN·m and L = 6.0 m.',
      steps: [
        {
          stepNum: 1,
          heading: 'Apply (2/3) · M_max · L',
          formulaLatex: 'Area = (2 · M_max · L) / 3',
          substitution: '(2 × 15.0 × 6.0) / 3',
          result: '60.0 kN·m²',
          unitCancelNote: 'kN·m × m = kN·m²',
        },
      ],
      finalAnswer: '60.0 kN·m²',
    },
    fullSolutionSteps: [
      {
        stepNum: 1,
        heading: 'Apply Simpson’s 1/3 rule over [0, 6.0 m]',
        substitution: '(6.0 m / 6) × (0 + 4 × 18.0 kN·m + 0)',
        result: '72.0 kN·m²',
        unitCancelNote: 'kN·m²',
      },
    ],
  },
};

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
  | { ok: true; convertedValue: number; factor: number }
  | { ok: false; error: string } {
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

export function runSelfVerificationChecks(): Array<{
  id: string;
  title: string;
  label: string;
  passed: boolean;
  detail: string;
}> {
  const stepIds: Array<Exclude<StepId, 'learn' | 'summary'>> = [
    '1a',
    '1b',
    '2a',
    '2a-R',
    '2b',
    '2c',
    '3',
    '4',
    '5a',
  ];

  const stepChecks = stepIds.map((sid) => {
    const q = SESSION_QUESTIONS[sid];
    const res = evaluateQuestionAttempt(
      q,
      String(q.canonicalAnswerInBaseUnit),
      q.canonicalUnit
    );
    return {
      id: `step-${sid}`,
      title: `Step ${sid} canonical solution check (${q.canonicalAnswerInBaseUnit} ${q.canonicalUnit})`,
      label: `Step ${sid}: ${q.title}`,
      passed: res.isCorrect === true,
      detail: `Verified ${q.canonicalAnswerInBaseUnit} ${q.canonicalUnit}`,
    };
  });

  const c10 = convertEngineeringUnit(18, 'kN·m', 'N·mm') === 18_000_000;
  const c11 =
    evaluateQuestionAttempt(SESSION_QUESTIONS['2a'], '0.027', 'GPa').isCorrect ===
    true;
  const c12 = !JSON.stringify(SESSION_QUESTIONS['2a']).includes('666,666.7');

  return [
    ...stepChecks,
    {
      id: 'unit-knm-nmm',
      title: 'Unit Engine: 18 kN·m = 18,000,000 N·mm',
      label: 'Unit Engine: 18 kN·m = 18,000,000 N·mm',
      passed: c10,
      detail: 'Exact 10⁶ factor verified',
    },
    {
      id: 'equiv-gpa-mpa',
      title: 'Equivalent Unit Grader: 0.027 GPa = 27.0 MPa',
      label: 'Equivalent Unit Grader: 0.027 GPa = 27.0 MPa',
      passed: c11,
      detail: 'Cross-prefix SI stress equivalence verified',
    },
    {
      id: 'sig-fig-hygiene-a8',
      title: 'Significant Figure Hygiene (A8): W_el = 6.67 × 10⁵ mm³',
      label: 'Significant Figure Hygiene (A8): W_el = 6.67 × 10⁵ mm³',
      passed: c12,
      detail: 'No false precision 666,666.7 mm³',
    },
  ];
}
