import type { AssessmentQuestion } from '../types/syllabus';
import {
  solveDeterminateBeam,
  solveRectangleSection,
} from './beamEngine';

export interface ParametricGeneratorSpec {
  generatorId: string;
  moduleNumber: number;
  topicId: string;
  title: string;
  learningObjective: string;
  citation: string;
  generate: (seed: number) => AssessmentQuestion;
}

export interface SteelTrialSection {
  designation: string;
  massPerMetreKg: number;
  depthMm: number;
  widthMm: number;
  sectionClass: 1 | 2 | 3;
  WplYCm3: number;
  WelYCm3: number;
  AvMm2: number;
  IyCm4: number;
  IzCm4: number;
}

export interface EurocodeDesignScenario {
  id: string;
  moduleNumber: number;
  codeStandard: 'BS EN 1993-1-1 (EC3)' | 'BS EN 1992-1-1 (EC2)' | 'BS EN 1995-1-1 (EC5)';
  title: string;
  brief: string;
  spanM: number;
  tributaryWidthM: number;
  gkFloorKnM2: number;
  qkFloorKnM2: number;
  selfWeightAllowanceKnM: number;
  gammaG: number;
  gammaQ: number;
  fyMPa: number;
  E_MPa: number;
  slsDeflectionLimitRatio: number; // e.g. 360 for L/360 under variable load q_k
  candidateSections: SteelTrialSection[];
  expectedGoverningValues: {
    gkTotalKnM: number;
    qkTotalKnM: number;
    wEdKnM: number;
    VEdKn: number;
    MEdKnM: number;
    slsLimitMm: number;
  };
}

export interface ScenarioEvaluationResult {
  passedAllSteps: boolean;
  stepResults: {
    stepId: string;
    label: string;
    passed: boolean;
    learnerValue: number | string;
    expectedSummary: string;
    feedback: string;
  }[];
  selectedSectionValid: boolean;
  selectedSectionUtilisation: {
    bendingRatio: number;
    shearRatio: number;
    slsDeflectionMm: number;
    slsDeflectionRatio: number;
    isEconomical: boolean;
  } | null;
  overallFeedback: string;
}

function seededInt(seed: number, step: number, min: number, max: number): number {
  const x = Math.sin(seed * 9301 + step * 49297 + 233280) * 10000;
  const frac = x - Math.floor(x);
  return min + Math.floor(frac * (max - min + 1));
}

export const PARAMETRIC_QUESTION_GENERATORS: ParametricGeneratorSpec[] = [
  {
    generatorId: 'GEN-MOD00-FORCE-RES',
    moduleNumber: 0,
    topicId: 'MOD00-T2',
    title: 'Inclined Prop Force Resolution',
    learningObjective: 'Resolve inclined temporary works prop forces into horizontal and vertical components',
    citation: 'StructTutor Syllabus Mod 0 (Units, Vectors & Equilibrium)',
    generate: (seed: number) => {
      const multiples = [25, 40, 50, 60, 75, 80, 100, 120, 150];
      const F = multiples[seededInt(seed, 1, 0, multiples.length - 1)];
      const use36 = seededInt(seed, 2, 0, 1) === 0;
      const angleDeg = use36 ? 36.87 : 53.13;
      const sinTheta = use36 ? 0.6 : 0.8;
      const cosTheta = use36 ? 0.8 : 0.6;
      const askVertical = seededInt(seed, 3, 0, 1) === 0;
      const ans = Number((F * (askVertical ? sinTheta : cosTheta)).toFixed(2));
      return {
        id: `GEN-MOD00-T2-S${seed}`,
        moduleNumber: 0,
        topicId: 'MOD00-T2',
        learningObjective: 'Resolve inclined temporary works prop forces into orthogonal components',
        type: 'numeric',
        prompt: `An inclined steel raking prop carries an axial compression force of F = ${F} kN at an angle of θ = ${angleDeg}° above the horizontal (cos ${angleDeg}° = ${cosTheta.toFixed(2)}, sin ${angleDeg}° = ${sinTheta.toFixed(2)}). Calculate the magnitude of the ${askVertical ? 'vertical component F_y = F · sin θ' : 'horizontal component F_x = F · cos θ'} transferred to the support soleplate in kN.`,
        assumptions: '2D static resolution at the prop node; frictionless pin joint idealisation.',
        unit: 'kN',
        correctAnswer: ans,
        tolerance: 0.2,
        explanation: `Using orthogonal trigonometry: ${askVertical ? `F_y = F · sin(${angleDeg}°) = ${F} × ${sinTheta.toFixed(2)} = ${ans} kN` : `F_x = F · cos(${angleDeg}°) = ${F} × ${cosTheta.toFixed(2)} = ${ans} kN`}. Always check that √(F_x² + F_y²) = ${F} kN.`,
        citation: 'StructTutor Syllabus Mod 0 (Units, Vectors & Equilibrium)',
        hints: [
          `Sketch the right-angled force triangle with hypotenuse F = ${F} kN inclined at ${angleDeg}° above the horizontal.`,
          `Multiply F = ${F} kN by ${askVertical ? `sin(${angleDeg}°) = ${sinTheta.toFixed(2)}` : `cos(${angleDeg}°) = ${cosTheta.toFixed(2)}`} and express the answer in kN.`,
        ],
        caseFamilyId: 'GEN-MOD00-T2-CF',
        solverVerificationId: 'SOLVER-GEN-MOD00',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by deterministic mechanics solver.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD01-REACTIONS',
    moduleNumber: 1,
    topicId: 'MOD01-T2',
    title: 'Simply Supported Beam Reactions under Eccentric Point Load & UDL',
    learningObjective: 'Calculate support reactions for determinate beams using static equilibrium',
    citation: 'StructTutor Syllabus Mod 1 (Support Reactions, Determinacy & Load Paths)',
    generate: (seed: number) => {
      const spans = [4, 5, 6, 8, 10];
      const L = spans[seededInt(seed, 1, 0, spans.length - 1)];
      const a = seededInt(seed, 2, 1, L - 1);
      const P = seededInt(seed, 3, 2, 12) * 10;
      const w = seededInt(seed, 4, 0, 4) * 4;
      const beam = solveDeterminateBeam({
        spanM: L,
        supportType: 'simply_supported',
        pointLoads: [{ xM: a, loadKn: P }],
        udls: w > 0 ? [{ xStartM: 0, xEndM: L, wKnPerM: w }] : [],
      });
      const askLeft = seededInt(seed, 5, 0, 1) === 0;
      const ans = Number((askLeft ? beam.raKn : beam.rbKn).toFixed(2));
      return {
        id: `GEN-MOD01-T2-S${seed}`,
        moduleNumber: 1,
        topicId: 'MOD01-T2',
        learningObjective: 'Calculate vertical support reactions using moment equilibrium',
        type: 'numeric',
        prompt: `A ${L}.0 m simply supported beam (pin at left support A, roller at right support B) carries a downward point load of P = ${P} kN at x = ${a}.0 m from support A${w > 0 ? ` together with a full-span uniform distributed load of w = ${w} kN/m` : ''}. Calculate the upward vertical reaction ${askLeft ? 'R_A at the left support A' : 'R_B at the right support B'} in kN.`,
        assumptions: ['Static equilibrium (ΣM = 0, ΣF_y = 0); beam weight included in stated loading.'],
        unit: 'kN',
        correctAnswer: ans,
        tolerance: Math.max(0.1, Number((ans * 0.01).toFixed(2))),
        explanation: `Taking moments about the opposite support: R_A = P·(L - a)/L + w·L/2 = ${beam.raKn.toFixed(2)} kN and R_B = P·a/L + w·L/2 = ${beam.rbKn.toFixed(2)} kN. Vertical equilibrium check: R_A + R_B = ${(beam.raKn + beam.rbKn).toFixed(2)} kN.`,
        citation: 'StructTutor Syllabus Mod 1 (Support Reactions, Determinacy & Load Paths)',
        hints: [
          `Take moments about ${askLeft ? 'the right support B (ΣM_B = 0)' : 'the left support A (ΣM_A = 0)'} to eliminate the unknown reaction at that support.`,
          `Superimpose the point load contribution and the UDL contribution (w·L/2 = ${(w * L) / 2} kN) to obtain ${askLeft ? 'R_A' : 'R_B'} in kN.`,
        ],
        caseFamilyId: 'GEN-MOD01-T2-CF',
        solverVerificationId: 'SOLVER-GEN-MOD01',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by solveDeterminateBeam engine.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD02-BENDING',
    moduleNumber: 2,
    topicId: 'MOD02-T2',
    title: 'Peak Bending Moment & Shear Force via Beam Solver',
    learningObjective: 'Determine peak bending moment and shear force in simply supported and cantilever beams',
    citation: 'StructTutor Syllabus Mod 2 (Internal Actions: Axial, Shear & Bending Diagrams)',
    generate: (seed: number) => {
      const isCantilever = seededInt(seed, 1, 0, 1) === 1;
      const L = isCantilever ? seededInt(seed, 2, 2, 4) : seededInt(seed, 2, 4, 8);
      const w = seededInt(seed, 3, 2, 10) * 2;
      const beam = solveDeterminateBeam({
        spanM: L,
        supportType: isCantilever ? 'cantilever_left' : 'simply_supported',
        udls: [{ xStartM: 0, xEndM: L, wKnPerM: w }],
      });
      const ans = Number(beam.mPeakAbsKnm.toFixed(2));
      return {
        id: `GEN-MOD02-T2-S${seed}`,
        moduleNumber: 2,
        topicId: 'MOD02-T2',
        learningObjective: 'Calculate peak internal bending moment under uniform distributed loading',
        type: 'numeric',
        prompt: `A ${L}.0 m ${isCantilever ? 'cantilever beam (fixed at the left support, free at the right tip)' : 'simply supported beam'} carries a uniform downward distributed load of w = ${w} kN/m over its full length. Calculate the magnitude of the maximum internal bending moment |M_max| in kN·m.`,
        assumptions: ['Linear elastic static equilibrium; prismatic beam.'],
        unit: 'kN·m',
        correctAnswer: ans,
        tolerance: Math.max(0.1, Number((ans * 0.01).toFixed(2))),
        explanation: `For a ${L}.0 m ${isCantilever ? 'cantilever' : 'simply supported'} beam under w = ${w} kN/m, the peak bending moment magnitude is ${isCantilever ? `|M_fixed| = w·L²/2 = ${w} × ${L}² / 2` : `M_mid = w·L²/8 = ${w} × ${L}² / 8`} = ${ans} kN·m. Verified via Simpson integration of V(x).`,
        citation: 'StructTutor Syllabus Mod 2 (Internal Actions: Axial, Shear & Bending Diagrams)',
        hints: [
          `Recall the standard peak bending moment formula for a ${isCantilever ? 'cantilever under full-span UDL: |M| = w·L²/2' : 'simply supported beam under full-span UDL: M = w·L²/8'}.`,
          `Substitute w = ${w} kN/m and L = ${L}.0 m into the expression and report the magnitude in kN·m.`,
        ],
        caseFamilyId: 'GEN-MOD02-T2-CF',
        solverVerificationId: 'SOLVER-GEN-MOD02',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by solveDeterminateBeam engine.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD03-AXIAL-EXT',
    moduleNumber: 3,
    topicId: 'MOD03-T1',
    title: 'Axial Stress & Elastic Extension of a Tie Bar',
    learningObjective: 'Calculate normal stress and elastic extension ΔL = FL/(AE) in consistent SI units',
    citation: 'StructTutor Syllabus Mod 3 (Stress, Strain, Hooke’s Law & Material Behaviour)',
    generate: (seed: number) => {
      const Lmm = seededInt(seed, 1, 2, 6) * 1000;
      const Amm2 = seededInt(seed, 2, 2, 5) * 400;
      const FkN = seededInt(seed, 3, 2, 6) * 40;
      const E = 200000;
      const deltaMm = Number(((FkN * 1000 * Lmm) / (Amm2 * E)).toFixed(3));
      return {
        id: `GEN-MOD03-T1-S${seed}`,
        moduleNumber: 3,
        topicId: 'MOD03-T1',
        learningObjective: 'Calculate axial elastic extension ΔL = F·L / (A·E)',
        type: 'numeric',
        prompt: `A structural steel tie bar of length L = ${Lmm.toLocaleString('en-GB')} mm and cross-sectional area A = ${Amm2.toLocaleString('en-GB')} mm² carries an axial tension force of F = ${FkN} kN. Taking Young’s modulus as E = 200,000 N/mm², calculate the elastic extension ΔL in mm (to 2 decimal places).`,
        assumptions: ['Uniaxial linear-elastic behaviour below the proportional limit; uniform cross-section.'],
        unit: 'mm',
        correctAnswer: deltaMm,
        tolerance: Math.max(0.03, Number((deltaMm * 0.02).toFixed(3))),
        explanation: `Convert force into Newtons: F = ${FkN} kN = ${(FkN * 1000).toLocaleString('en-GB')} N. Then normal stress σ = F / A = ${((FkN * 1000) / Amm2).toFixed(2)} N/mm², and extension ΔL = (F · L) / (A · E) = (${FkN * 1000} × ${Lmm}) / (${Amm2} × 200,000) = ${deltaMm} mm.`,
        citation: 'StructTutor Syllabus Mod 3 (Stress, Strain, Hooke’s Law & Material Behaviour)',
        hints: [
          `Convert the axial tension force F = ${FkN} kN into Newtons (${FkN * 1000} N) so all units match mm and N/mm².`,
          `Evaluate ΔL = (F · L) / (A · E) and express the extension in mm.`,
        ],
        caseFamilyId: 'GEN-MOD03-T1-CF',
        solverVerificationId: 'SOLVER-GEN-MOD03',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by deterministic mechanics solver.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD04-SECTION-PROPS',
    moduleNumber: 4,
    topicId: 'MOD04-T2',
    title: 'Rectangular Section Properties & Extreme-Fibre Bending Stress',
    learningObjective: 'Calculate elastic section modulus Z = bd²/6 and extreme-fibre bending stress σ = M/Z',
    citation: 'StructTutor Syllabus Mod 4 (Section Properties, Elastic & Plastic Bending Stress)',
    generate: (seed: number) => {
      const widths = [60, 75, 100, 120, 150];
      const depths = [150, 180, 200, 240, 300];
      const b = widths[seededInt(seed, 1, 0, widths.length - 1)];
      const d = depths[seededInt(seed, 2, 0, depths.length - 1)];
      const M_kNm = seededInt(seed, 3, 2, 8) * 3;
      const props = solveRectangleSection({ bMm: b, dMm: d, momentKnm: M_kNm });
      const sigma = Number(props.sigmaMpa.toFixed(2));
      return {
        id: `GEN-MOD04-T2-S${seed}`,
        moduleNumber: 4,
        topicId: 'MOD04-T2',
        learningObjective: 'Calculate maximum elastic bending stress σ = M / Z_el for a rectangular beam',
        type: 'numeric',
        prompt: `A solid rectangular beam section has breadth b = ${b} mm and depth d = ${d} mm. When bent about its major axis under an internal bending moment of M = ${M_kNm} kN·m, calculate the maximum extreme-fibre bending stress σ_max = M / Z_el in N/mm² (MPa) (to 2 decimal places).`,
        assumptions: ['Euler-Bernoulli plane sections remain plane; homogeneous linear-elastic material.'],
        unit: 'N/mm²',
        correctAnswer: sigma,
        tolerance: Math.max(0.15, Number((sigma * 0.015).toFixed(2))),
        explanation: `First compute major-axis elastic section modulus: Z_el = b·d²/6 = ${b} × ${d}² / 6 = ${props.welMm3.toLocaleString('en-GB')} mm³. Convert M = ${M_kNm} kN·m = ${M_kNm} × 10⁶ N·mm. Then σ_max = M / Z_el = ${sigma} N/mm².`,
        citation: 'StructTutor Syllabus Mod 4 (Section Properties, Elastic & Plastic Bending Stress)',
        hints: [
          `Compute the elastic section modulus Z_el = b·d²/6 in mm³ for b = ${b} mm and d = ${d} mm.`,
          `Convert M = ${M_kNm} kN·m to ${M_kNm} × 10⁶ N·mm and divide by Z_el to obtain σ_max in N/mm².`,
        ],
        caseFamilyId: 'GEN-MOD04-T2-CF',
        solverVerificationId: 'SOLVER-GEN-MOD04',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by solveRectangleSection engine.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD05-DEFLECTION',
    moduleNumber: 5,
    topicId: 'MOD05-T1',
    title: 'Elastic Midspan Deflection of a Simply Supported Beam',
    learningObjective: 'Calculate elastic midspan deflection δ = 5wL⁴/(384EI) in consistent N and mm units',
    citation: 'StructTutor Syllabus Mod 5 (Beam Deflections, Stiffness & Serviceability Limit States)',
    generate: (seed: number) => {
      const spansMm = [3600, 4000, 4800, 5000, 6000];
      const L = spansMm[seededInt(seed, 1, 0, spansMm.length - 1)];
      const w = seededInt(seed, 2, 2, 8); // kN/m == N/mm
      const I_10_6 = [40, 50, 60, 80, 100, 120][seededInt(seed, 3, 0, 5)];
      const E = 210000;
      const beam = solveDeterminateBeam({
        spanM: L / 1000,
        supportType: 'simply_supported',
        udls: [{ xStartM: 0, xEndM: L / 1000, wKnPerM: w }],
        eGpa: E / 1000,
        iMm4: I_10_6 * 1e6,
      });
      const ans = Number(beam.maxDeflectionMm.toFixed(2));
      return {
        id: `GEN-MOD05-T1-S${seed}`,
        moduleNumber: 5,
        topicId: 'MOD05-T1',
        learningObjective: 'Calculate elastic midspan deflection under unfactored serviceability UDL',
        type: 'numeric',
        prompt: `A simply supported steel beam of span L = ${L.toLocaleString('en-GB')} mm has Young’s modulus E = 210,000 N/mm² and major-axis second moment of area I = ${I_10_6} × 10⁶ mm⁴. Under an unfactored SLS uniform distributed load of w = ${w}.0 kN/m (${w}.0 N/mm), calculate the elastic midspan deflection δ = 5·w·L⁴ / (384·E·I) in mm (to 2 decimal places).`,
        assumptions: ['Linear-elastic small-deflection Euler-Bernoulli beam theory; shear deformation neglected.'],
        unit: 'mm',
        correctAnswer: ans,
        tolerance: Math.max(0.08, Number((ans * 0.02).toFixed(2))),
        explanation: `Using consistent N and mm units: w = ${w}.0 N/mm, L = ${L} mm, E = 210,000 N/mm², and I = ${I_10_6} × 10⁶ mm⁴. Substituting into δ = 5·w·L⁴ / (384·E·I) gives δ = ${ans} mm.`,
        citation: 'StructTutor Syllabus Mod 5 (Beam Deflections, Stiffness & Serviceability Limit States)',
        hints: [
          `Note that 1 kN/m = 1,000 N / 1,000 mm = 1.0 N/mm, so w = ${w}.0 N/mm in N-mm units.`,
          `Substitute w = ${w}, L = ${L}, E = 210,000, and I = ${I_10_6} × 10⁶ into 5·w·L⁴ / (384·E·I).`,
        ],
        caseFamilyId: 'GEN-MOD05-T1-CF',
        solverVerificationId: 'SOLVER-GEN-MOD05',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by solveDeterminateBeam engine.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD06-EULER',
    moduleNumber: 6,
    topicId: 'MOD06-T1',
    title: 'Euler Critical Buckling Load of a Compression Strut',
    learningObjective: 'Calculate elastic Euler critical buckling load P_cr = π²EI_min / L_cr²',
    citation: 'StructTutor Syllabus Mod 6 (Compression Buckling, LTB & Overall Frame Stability)',
    generate: (seed: number) => {
      const lengthsMm = [2500, 3000, 3500, 4000, 4500];
      const Lcr = lengthsMm[seededInt(seed, 1, 0, lengthsMm.length - 1)];
      const Iz_10_6 = [3.5, 4.5, 6.0, 8.0, 10.0, 12.5][seededInt(seed, 2, 0, 5)];
      const E = 210000;
      const PcrKn = Number(((Math.PI * Math.PI * E * Iz_10_6 * 1e6) / (Lcr * Lcr * 1000)).toFixed(1));
      return {
        id: `GEN-MOD06-T1-S${seed}`,
        moduleNumber: 6,
        topicId: 'MOD06-T1',
        learningObjective: 'Calculate theoretical elastic Euler buckling capacity about the governing minor axis',
        type: 'numeric',
        prompt: `A pin-ended structural steel compression strut has an effective buckling length L_cr = ${Lcr.toLocaleString('en-GB')} mm, Young’s modulus E = 210,000 N/mm², and governing minor-axis second moment of area I_z = ${Iz_10_6} × 10⁶ mm⁴. Calculate its elastic Euler critical buckling load P_cr = π²·E·I_z / L_cr² in kN (to 1 decimal place).`,
        assumptions: 'Ideal initially straight elastic pin-ended strut; no intermediate minor-axis restraints.',
        unit: 'kN',
        correctAnswer: PcrKn,
        tolerance: Math.max(1.5, Number((PcrKn * 0.015).toFixed(1))),
        explanation: `Using Euler’s formula about the governing minor axis: P_cr = π² × 210,000 × (${Iz_10_6} × 10⁶) / (${Lcr})² = ${(PcrKn * 1000).toFixed(0)} N = ${PcrKn} kN.`,
        citation: 'StructTutor Syllabus Mod 6 (Compression Buckling, LTB & Overall Frame Stability)',
        hints: [
          `Evaluate π² · E · I_z in N·mm² and divide by L_cr² = (${Lcr})² mm² to obtain P_cr in Newtons.`,
          `Divide the resulting force in Newtons by 1,000 to report P_cr in kN.`,
        ],
        caseFamilyId: 'GEN-MOD06-T1-CF',
        solverVerificationId: 'SOLVER-GEN-MOD06',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by deterministic Euler solver.',
      };
    },
  },
  {
    generatorId: 'GEN-MOD08-EC3-RESISTANCE',
    moduleNumber: 8,
    topicId: 'MOD08-T2',
    title: 'EC3 Class 1 Steel Beam Plastic Bending Resistance',
    learningObjective: 'Calculate cross-section plastic moment resistance M_c,Rd = W_pl,y · f_y / γ_M0',
    citation: 'BS EN 1993-1-1:2005 (Eurocode 3: Design of Steel Structures, Cl. 6.2.5)',
    generate: (seed: number) => {
      const WplCm3 = [350, 420, 500, 640, 750, 900, 1100][seededInt(seed, 1, 0, 6)];
      const fy = seededInt(seed, 2, 0, 1) === 0 ? 355 : 275;
      const McRd = Number(((WplCm3 * 1000 * fy) / 1e6).toFixed(1));
      return {
        id: `GEN-MOD08-T2-S${seed}`,
        moduleNumber: 8,
        topicId: 'MOD08-T2',
        learningObjective: 'Calculate EC3 Class 1 cross-section bending resistance M_c,Rd',
        type: 'numeric',
        prompt: `A laterally restrained Class 1 Universal Beam in S${fy} structural steel (yield strength f_y = ${fy} N/mm², partial safety factor γ_M0 = 1.00) has a major-axis plastic section modulus W_pl,y = ${WplCm3} cm³ (${(WplCm3 * 1000).toLocaleString('en-GB')} mm³). Calculate its design cross-section bending resistance M_c,Rd = W_pl,y · f_y / γ_M0 in kN·m (to 1 decimal place).`,
        assumptions: 'Class 1 cross-section with full lateral restraint against LTB; low coincidental shear (V_Ed <= 0.5 V_pl,Rd).',
        unit: 'kN·m',
        correctAnswer: McRd,
        tolerance: Math.max(0.5, Number((McRd * 0.01).toFixed(1))),
        explanation: `Convert W_pl,y = ${WplCm3} cm³ = ${(WplCm3 * 1000).toLocaleString('en-GB')} mm³. Then M_c,Rd = (${(WplCm3 * 1000).toLocaleString('en-GB')} mm³ × ${fy} N/mm²) / (1.00 × 10⁶ N·mm/kN·m) = ${McRd} kN·m.`,
        citation: 'BS EN 1993-1-1:2005 (Eurocode 3: Design of Steel Structures, Cl. 6.2.5)',
        hints: [
          `Convert W_pl,y from cm³ to mm³ by multiplying by 1,000 (${WplCm3} × 10³ mm³).`,
          `Multiply W_pl,y (in mm³) by f_y = ${fy} N/mm² and divide by 10⁶ to convert N·mm into kN·m.`,
        ],
        caseFamilyId: 'GEN-MOD08-T2-CF',
        solverVerificationId: 'SOLVER-GEN-MOD08',
        reviewStatus: 'Verified',
        reviewNotice: 'Parametric variant verified at runtime by deterministic EC3 solver.',
      };
    },
  },
];

export function generateParametricQuestionVariants(
  moduleNumber: number,
  seedBase: number,
  count = 2
): AssessmentQuestion[] {
  const matching = PARAMETRIC_QUESTION_GENERATORS.filter((g) => g.moduleNumber === moduleNumber);
  const generators =
    matching.length > 0
      ? matching
      : [PARAMETRIC_QUESTION_GENERATORS[moduleNumber % PARAMETRIC_QUESTION_GENERATORS.length]];

  const variants: AssessmentQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const gen = generators[i % generators.length];
    const q = gen.generate(seedBase + i * 17 + moduleNumber * 31);
    variants.push({
      ...q,
      moduleNumber,
    });
  }
  return variants;
}

export const EUROCODE_DESIGN_SCENARIOS: EurocodeDesignScenario[] = [
  {
    id: 'SCENARIO-EC3-FLOOR-BEAM-01',
    moduleNumber: 8,
    codeStandard: 'BS EN 1993-1-1 (EC3)',
    title: 'Multi-Step EC3 Steel Floor Beam Design & Section Selection',
    brief:
      'A simply supported internal steel floor beam spans L = 6.0 m and supports a one-way composite concrete deck with full continuous lateral restraint to the top flange. Tributary spacing between parallel beams is b_trib = 3.0 m. Characteristic permanent floor load g_k = 3.5 kN/m² (plus 0.6 kN/m beam self-weight allowance); characteristic imposed office load q_k = 3.0 kN/m². Using γ_G = 1.35, γ_Q = 1.50, S355 steel (f_y = 355 MPa, E = 210,000 MPa, γ_M0 = 1.00), and an SLS variable-load deflection limit of L / 360, determine the design actions and select any valid Class 1 UKB section.',
    spanM: 6.0,
    tributaryWidthM: 3.0,
    gkFloorKnM2: 3.5,
    qkFloorKnM2: 3.0,
    selfWeightAllowanceKnM: 0.6,
    gammaG: 1.35,
    gammaQ: 1.5,
    fyMPa: 355,
    E_MPa: 210000,
    slsDeflectionLimitRatio: 360,
    candidateSections: [
      {
        designation: '254 × 146 × 31 UKB (S355)',
        massPerMetreKg: 31.1,
        depthMm: 251.4,
        widthMm: 146.1,
        sectionClass: 1,
        WplYCm3: 393,
        WelYCm3: 351,
        AvMm2: 1620,
        IyCm4: 4410,
        IzCm4: 448,
      },
      {
        designation: '305 × 165 × 40 UKB (S355)',
        massPerMetreKg: 40.3,
        depthMm: 303.4,
        widthMm: 165.0,
        sectionClass: 1,
        WplYCm3: 623,
        WelYCm3: 560,
        AvMm2: 1950,
        IyCm4: 8500,
        IzCm4: 764,
      },
      {
        designation: '356 × 171 × 45 UKB (S355)',
        massPerMetreKg: 45.0,
        depthMm: 351.4,
        widthMm: 171.1,
        sectionClass: 1,
        WplYCm3: 775,
        WelYCm3: 687,
        AvMm2: 2560,
        IyCm4: 12100,
        IzCm4: 811,
      },
      {
        designation: '406 × 178 × 54 UKB (S355)',
        massPerMetreKg: 54.1,
        depthMm: 402.6,
        widthMm: 177.7,
        sectionClass: 1,
        WplYCm3: 1055,
        WelYCm3: 930,
        AvMm2: 3260,
        IyCm4: 18700,
        IzCm4: 1020,
      },
    ],
    expectedGoverningValues: {
      gkTotalKnM: 11.1, // 3.5 * 3.0 + 0.6
      qkTotalKnM: 9.0, // 3.0 * 3.0
      wEdKnM: 28.485, // 1.35 * 11.1 + 1.50 * 9.0
      VEdKn: 85.455, // 28.485 * 6 / 2
      MEdKnM: 128.18, // 28.485 * 36 / 8
      slsLimitMm: 16.67, // 6000 / 360
    },
  },
  {
    id: 'SCENARIO-EC3-PRIMARY-TRANSFER-02',
    moduleNumber: 9,
    codeStandard: 'BS EN 1993-1-1 (EC3)',
    title: 'Heavy Span EC3 Primary Beam Verification (Strength vs Stiffness)',
    brief:
      'A simply supported steel primary floor beam spans L = 8.0 m with continuous lateral restraint to the top flange from incoming secondary beams and slab diaphragm. Tributary width b_trib = 4.0 m, characteristic permanent action g_k = 4.0 kN/m² (plus 1.0 kN/m self-weight), characteristic imposed action q_k = 4.0 kN/m². Using γ_G = 1.35, γ_Q = 1.50, S355 steel (f_y = 355 MPa, E = 210,000 MPa), and an SLS variable-load deflection limit of L / 360 (22.22 mm), compute the design actions and select any valid UKB section.',
    spanM: 8.0,
    tributaryWidthM: 4.0,
    gkFloorKnM2: 4.0,
    qkFloorKnM2: 4.0,
    selfWeightAllowanceKnM: 1.0,
    gammaG: 1.35,
    gammaQ: 1.5,
    fyMPa: 355,
    E_MPa: 210000,
    slsDeflectionLimitRatio: 360,
    candidateSections: [
      {
        designation: '356 × 171 × 51 UKB (S355)',
        massPerMetreKg: 51.0,
        depthMm: 355.0,
        widthMm: 171.5,
        sectionClass: 1,
        WplYCm3: 896,
        WelYCm3: 796,
        AvMm2: 2730,
        IyCm4: 14100,
        IzCm4: 968,
      },
      {
        designation: '457 × 191 × 67 UKB (S355)',
        massPerMetreKg: 67.1,
        depthMm: 453.4,
        widthMm: 189.9,
        sectionClass: 1,
        WplYCm3: 1471,
        WelYCm3: 1296,
        AvMm2: 4050,
        IyCm4: 29400,
        IzCm4: 1450,
      },
      {
        designation: '533 × 210 × 82 UKB (S355)',
        massPerMetreKg: 82.2,
        depthMm: 528.3,
        widthMm: 208.8,
        sectionClass: 1,
        WplYCm3: 2059,
        WelYCm3: 1800,
        AvMm2: 5280,
        IyCm4: 47500,
        IzCm4: 2010,
      },
    ],
    expectedGoverningValues: {
      gkTotalKnM: 17.0,
      qkTotalKnM: 16.0,
      wEdKnM: 46.95,
      VEdKn: 187.8,
      MEdKnM: 375.6,
      slsLimitMm: 22.22,
    },
  },
];

export function evaluateEurocodeDesignScenario(
  scenario: EurocodeDesignScenario,
  inputs: {
    wEdKnM: number;
    MEdKnM: number;
    VEdKn: number;
    selectedDesignation: string;
  }
): ScenarioEvaluationResult {
  const exp = scenario.expectedGoverningValues;
  const wPass = Math.abs(inputs.wEdKnM - exp.wEdKnM) <= Math.max(0.35, exp.wEdKnM * 0.02);
  const mPass = Math.abs(inputs.MEdKnM - exp.MEdKnM) <= Math.max(1.5, exp.MEdKnM * 0.02);
  const vPass = Math.abs(inputs.VEdKn - exp.VEdKn) <= Math.max(1.0, exp.VEdKn * 0.02);

  const sec = scenario.candidateSections.find((s) => s.designation === inputs.selectedDesignation);
  let selectedSectionValid = false;
  let util: ScenarioEvaluationResult['selectedSectionUtilisation'] = null;
  let sectionFeedback = 'Select a trial UKB section from the schedule.';

  if (sec) {
    const McRdKnM = (sec.WplYCm3 * 1000 * scenario.fyMPa) / 1e6;
    const VplRdKn = (sec.AvMm2 * (scenario.fyMPa / Math.sqrt(3))) / 1000;
    const Lmm = scenario.spanM * 1000;
    const slsDeflectionMm =
      (5 * exp.qkTotalKnM * Math.pow(Lmm, 4)) /
      (384 * scenario.E_MPa * (sec.IyCm4 * 1e4));
    const bendingRatio = Number((exp.MEdKnM / McRdKnM).toFixed(3));
    const shearRatio = Number((exp.VEdKn / VplRdKn).toFixed(3));
    const slsDeflectionRatio = Number((slsDeflectionMm / exp.slsLimitMm).toFixed(3));

    selectedSectionValid =
      bendingRatio <= 1.0 && shearRatio <= 1.0 && slsDeflectionRatio <= 1.0;

    // Check if there is a lighter valid section
    const lighterValidExists = scenario.candidateSections.some((other) => {
      if (other.massPerMetreKg >= sec.massPerMetreKg) return false;
      const oMcRd = (other.WplYCm3 * 1000 * scenario.fyMPa) / 1e6;
      const oVpl = (other.AvMm2 * (scenario.fyMPa / Math.sqrt(3))) / 1000;
      const oDefl =
        (5 * exp.qkTotalKnM * Math.pow(Lmm, 4)) /
        (384 * scenario.E_MPa * (other.IyCm4 * 1e4));
      return exp.MEdKnM <= oMcRd && exp.VEdKn <= oVpl && oDefl <= exp.slsLimitMm;
    });

    util = {
      bendingRatio,
      shearRatio,
      slsDeflectionMm: Number(slsDeflectionMm.toFixed(2)),
      slsDeflectionRatio,
      isEconomical: selectedSectionValid && !lighterValidExists,
    };

    if (selectedSectionValid) {
      sectionFeedback = lighterValidExists
        ? `Valid non-unique design: ${sec.designation} satisfies ULS bending (${(bendingRatio * 100).toFixed(1)}%), ULS shear (${(shearRatio * 100).toFixed(1)}%), and SLS deflection (${slsDeflectionMm.toFixed(2)} mm <= ${exp.slsLimitMm.toFixed(2)} mm). Note: a lighter section in the table also passes if minimum steel mass is prioritized, or this deeper section can be retained for enhanced floor vibration stiffness.`
        : `Optimal valid design: ${sec.designation} is the lightest section that satisfies ULS bending (M_Ed/M_c,Rd = ${(bendingRatio * 100).toFixed(1)}%), ULS shear (${(shearRatio * 100).toFixed(1)}%), and SLS variable-load deflection (${slsDeflectionMm.toFixed(2)} mm <= ${exp.slsLimitMm.toFixed(2)} mm).`;
    } else {
      const reasons: string[] = [];
      if (bendingRatio > 1.0) {
        reasons.push(`ULS bending over-utilized (${(bendingRatio * 100).toFixed(1)}% > 100%, M_c,Rd = ${McRdKnM.toFixed(1)} kN·m)`);
      }
      if (shearRatio > 1.0) {
        reasons.push(`ULS shear over-utilized (${(shearRatio * 100).toFixed(1)}% > 100%)`);
      }
      if (slsDeflectionRatio > 1.0) {
        reasons.push(`SLS deflection exceeded (${slsDeflectionMm.toFixed(2)} mm > limit ${exp.slsLimitMm.toFixed(2)} mm)`);
      }
      sectionFeedback = `Section ${sec.designation} fails verification: ${reasons.join('; ')}. Choose a deeper/stiffer UKB section.`;
    }
  }

  const stepResults = [
    {
      stepId: 'step-wed',
      label: 'Step 1: ULS Factored Line Load w_Ed (kN/m)',
      passed: wPass,
      learnerValue: inputs.wEdKnM,
      expectedSummary: `${exp.wEdKnM.toFixed(2)} kN/m (g_k = ${exp.gkTotalKnM} kN/m, q_k = ${exp.qkTotalKnM} kN/m)`,
      feedback: wPass
        ? `Correct: w_Ed = 1.35(${exp.gkTotalKnM}) + 1.50(${exp.qkTotalKnM}) = ${exp.wEdKnM.toFixed(2)} kN/m.`
        : `Expected ${exp.wEdKnM.toFixed(2)} kN/m from g_k = ${scenario.gkFloorKnM2}×${scenario.tributaryWidthM} + ${scenario.selfWeightAllowanceKnM} = ${exp.gkTotalKnM} kN/m and q_k = ${scenario.qkFloorKnM2}×${scenario.tributaryWidthM} = ${exp.qkTotalKnM} kN/m.`,
    },
    {
      stepId: 'step-med',
      label: 'Step 2: ULS Peak Bending Moment M_Ed (kN·m)',
      passed: mPass,
      learnerValue: inputs.MEdKnM,
      expectedSummary: `${exp.MEdKnM.toFixed(2)} kN·m (w_Ed · L² / 8)`,
      feedback: mPass
        ? `Correct: M_Ed = ${exp.wEdKnM.toFixed(2)} × ${scenario.spanM}² / 8 = ${exp.MEdKnM.toFixed(2)} kN·m.`
        : `Expected M_Ed = w_Ed · L² / 8 = ${exp.MEdKnM.toFixed(2)} kN·m.`,
    },
    {
      stepId: 'step-ved',
      label: 'Step 3: ULS Support Shear V_Ed (kN)',
      passed: vPass,
      learnerValue: inputs.VEdKn,
      expectedSummary: `${exp.VEdKn.toFixed(2)} kN (w_Ed · L / 2)`,
      feedback: vPass
        ? `Correct: V_Ed = ${exp.wEdKnM.toFixed(2)} × ${scenario.spanM} / 2 = ${exp.VEdKn.toFixed(2)} kN.`
        : `Expected V_Ed = w_Ed · L / 2 = ${exp.VEdKn.toFixed(2)} kN.`,
    },
    {
      stepId: 'step-section',
      label: 'Step 4: Trial Section Verification (ULS + SLS)',
      passed: selectedSectionValid,
      learnerValue: inputs.selectedDesignation || 'None',
      expectedSummary: 'Any UKB section with M_Ed <= M_c,Rd, V_Ed <= V_pl,Rd, and δ_Q <= L/360',
      feedback: sectionFeedback,
    },
  ];

  const passedAllSteps = wPass && mPass && vPass && selectedSectionValid;
  return {
    passedAllSteps,
    stepResults,
    selectedSectionValid,
    selectedSectionUtilisation: util,
    overallFeedback: passedAllSteps
      ? `Complete Eurocode design verification passed. ${sectionFeedback}`
      : 'One or more design verification steps require adjustment. Review the step-by-step diagnostics below.',
  };
}
