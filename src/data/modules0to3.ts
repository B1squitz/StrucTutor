import { SyllabusModule } from '../types/syllabus';
import { qMcq, qNum } from './questionHelpers';

export const MODULES_0_TO_3: SyllabusModule[] = [
  /* ======================================================================== */
  /* MODULE 0: ENGINEERING MATHS, UNITS AND PHYSICAL QUANTITIES               */
  /* ======================================================================== */
  {
    moduleNumber: 0,
    code: 'MOD-00',
    title: 'Module 0: Engineering maths, units and physical quantities',
    shortTitle: 'Engineering maths, units and physical quantities',
    suggestedDuration: '4–6 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 1–2',
    whyItMatters:
      'Almost every serious calculation error is either a wrong model, a wrong assumption, or a units/conversion error. You need units to feel automatic.',
    introduction:
      'Establishes fluent metric SI unit conversions in the (mm, N) and (m, kN) systems, vector resolution by trigonometry, differential/integral relationships between load, shear, and bending moment, and clear physical distinctions between force, mass, stress, pressure, and stiffness.',
    objectives: [
      'Convert fluently between N, kN, MN, mm, m, mm², m², mm⁴, m⁴, kN/m, N/mm, kN/m², N/mm² (MPa), GPa, kg/m³, and kN/m³.',
      'Rearrange structural equations, apply trigonometry and Pythagoras to inclined ties/struts, and interpret graph gradients and areas.',
      'Distinguish mass vs weight, force vs stress, distributed load vs resultant point load, and stiffness vs strength.',
    ],
    learningGate: [
      'Convert all common structural units without hesitation.',
      'Resolve inclined forces into orthogonal components without prompts.',
      'Calculate moments of forces about a point correctly.',
      'Replace a uniformly distributed load (UDL) with its equivalent resultant and line of action.',
      'Check whether any structural equation is dimensionally sensible.',
    ],
    prerequisiteModuleNumbers: [],
    topics: [
      {
        id: 'MOD00-T1',
        moduleNumber: 0,
        code: '0.1',
        title: 'Structural Units & Dimensional Homogeneity',
        summary:
          'Covers SI prefixes, area and second-moment-of-area unit powers, stress/modulus identities (1 MPa = 1 N/mm²), bending moment conversion (1 kN·m = 10⁶ N·mm), and dimensional checking.',
        subtopics: [
          'Force and length units: N, kN, MN; mm, m',
          'Section geometry units: mm², m² (10⁶); mm³, cm³ (10³); mm⁴, cm⁴ (10⁴), m⁴ (10¹²)',
          'Line load and surface pressure units: kN/m = N/mm; 1 kN/m² = 0.001 N/mm²',
          'Stress and elastic modulus units: N/mm² = MPa; 1 GPa = 1,000 N/mm²',
          'Unit weight vs mass density: kg/m³ and kN/m³ (using g = 9.81 m/s²)',
        ],
        learningObjectives: [
          'Convert bending moments, pressures, line loads, and section properties into consistent (mm, N) base units.',
          'Spot 10³ and 10⁶ power-of-ten errors before they invalidate stress or deflection calculations.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Full worked notes on Buckingham dimensional checks and multi-unit hand-calculation habits.',
          workedExamplesPlanned: 'Example 0.1 full walkthrough with common temporary works unit traps.',
          calculationsPlanned: 'Interactive unit-cancellation scratchpad exercises.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis opening chapters (awaiting user textbook copy).',
        },
        questions: [
          qNum(
            'MOD00-T1-Q1',
            0,
            'MOD00-T1',
            'Convert elastic modulus from GPa to N/mm² (Example 0.1)',
            'Convert a structural steel Young’s modulus of E = 200 GPa into N/mm².',
            200000,
            'N/mm²',
            '1 GPa = 10⁹ Pa = 1,000 MPa. Since 1 MPa = 1 N/mm², 200 GPa = 200 × 1,000 = 200,000 N/mm².',
            'Assumes standard SI prefixes (1 GPa = 10³ MPa = 10³ N/mm²).'
          ),
          qNum(
            'MOD00-T1-Q2',
            0,
            'MOD00-T1',
            'Convert floor surface pressure from kN/m² into N/mm² (Example 0.1)',
            'A concrete slab wet-pour pressure is 25 kN/m². Express this pressure in N/mm².',
            0.025,
            'N/mm²',
            '25 kN/m² = 25,000 N / (1,000 mm × 1,000 mm) = 25,000 N / 1,000,000 mm² = 0.025 N/mm².',
            '1 m² = 10⁶ mm², so converting kN/m² to N/mm² divides by 1,000.',
            0.001
          ),
          qNum(
            'MOD00-T1-Q3',
            0,
            'MOD00-T1',
            'Convert bending moment from kN·m into N·mm (Example 0.1)',
            'Convert a bending moment of M = 5 kN·m into N·mm.',
            5000000,
            'N·mm',
            '1 kN = 1,000 N and 1 m = 1,000 mm, so 1 kN·m = 10³ N × 10³ mm = 10⁶ N·mm. Thus 5 kN·m = 5,000,000 N·mm.',
            'Essential when substituting M into σ = M/Z with Z in mm³.'
          ),
          qNum(
            'MOD00-T1-Q4',
            0,
            'MOD00-T1',
            'Convert UDL line load from kN/m into N/mm (Example 0.1)',
            'A timber bearer carries a uniformly distributed load of w = 7.5 kN/m. What is this line load in N/mm?',
            7.5,
            'N/mm',
            '7.5 kN/m = (7.5 × 1,000 N) / (1,000 mm) = 7.5 N/mm. The 10³ factors in numerator and denominator cancel exactly.',
            '1 kN/m is identically 1 N/mm.'
          ),
          qMcq(
            'MOD00-T1-Q5',
            0,
            'MOD00-T1',
            'Verify dimensional homogeneity of beam deflection equations',
            'In the standard elastic deflection formula δ = 5wL⁴ / (384EI), if w is in N/mm, L is in mm, E is in N/mm², and I is in mm⁴, what are the resulting units of δ?',
            ['mm', 'm', 'N/mm', 'Dimensionless (rad)'],
            0,
            'Numerator [w][L⁴] = (N/mm) × mm⁴ = N·mm³. Denominator [E][I] = (N/mm²) × mm⁴ = N·mm². Ratio = (N·mm³) / (N·mm²) = mm.',
            'Using consistent (mm, N) units guarantees δ emerges directly in mm without extra conversion factors.'
          ),
        ],
      },
      {
        id: 'MOD00-T2',
        moduleNumber: 0,
        code: '0.2',
        title: 'Engineering Maths, Trigonometry & Calculus Meaning',
        summary:
          'Covers scientific notation, algebraic rearrangement, right-angle trigonometry, Pythagoras, simultaneous equations, and the physical meaning of derivatives (gradients) and integrals (areas) on load/shear/moment diagrams.',
        subtopics: [
          'Scientific notation and powers of 10 in section properties',
          'Algebraic rearrangement of design formulas (e.g. solving for required Z or I)',
          'Trigonometry (sin, cos, tan) and Pythagoras for inclined members and bracing geometry',
          'Simultaneous linear equations for two-unknown static equilibrium',
          'Graph gradients (dM/dx = V, dV/dx = -w) and graph areas (ΔM = ∫V dx)',
          'Radians and degrees in small-angle rotations (θ ≈ tan θ)',
        ],
        learningObjectives: [
          'Apply trigonometry and Pythagoras to find member lengths and force components.',
          'Relate the slope and area of structural diagrams to differentiation and integration.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Visual guide linking calculus slopes and areas directly to SFD and BMD shapes.',
          workedExamplesPlanned: 'Simultaneous equations in two-strut pin joint problems.',
          calculationsPlanned: 'Small-angle rotation approximations in beam end slopes.',
          sourceReferencesNeeded: 'Jeff Hanson statics introduction and Hibbeler opening chapters.',
        },
        questions: [
          qNum(
            'MOD00-T2-Q1',
            0,
            'MOD00-T2',
            'Use Pythagoras to determine inclined bracing length',
            'A temporary works raking shore spans a horizontal distance of 3.6 m and rises vertically 4.8 m to support a wall needle. What is the inclined length of the shore?',
            6,
            'm',
            'By Pythagoras, L = √(3.6² + 4.8²) = √(12.96 + 23.04) = √36.0 = 6.0 m (a 3-4-5 triangle scaled by 1.2).',
            'Assumes centreline node-to-node geometry.'
          ),
          qNum(
            'MOD00-T2-Q2',
            0,
            'MOD00-T2',
            'Convert rotation angle from radians to degrees',
            'A beam support rotation is calculated as θ = 0.005 radians. Convert this angle into degrees (to 3 significant figures).',
            0.286,
            'deg',
            'θ (deg) = 0.005 × (180 / π) = 0.28648° ≈ 0.286°.',
            'Remember θ = wL³/(24EI) gives θ in radians when consistent units are used.'
          ),
          qMcq(
            'MOD00-T2-Q3',
            0,
            'MOD00-T2',
            'Interpret differential/integral meaning on shear and moment diagrams',
            'What does the area under the shear force diagram V(x) between two points x₁ and x₂ physically represent?',
            [
              'The change in bending moment ΔM between x₁ and x₂',
              'The total vertical support reaction at x₁',
              'The maximum deflection δ between x₁ and x₂',
              'The intensity of the distributed load w at x₂',
            ],
            0,
            'Since V = dM/dx, integrating both sides gives M(x₂) − M(x₁) = ∫ V(x) dx, which is the signed area under the shear force diagram between x₁ and x₂.',
            'Assumes no external concentrated couple is applied strictly at the boundary unless included as a jump.'
          ),
          qNum(
            'MOD00-T2-Q4',
            0,
            'MOD00-T2',
            'Rearrange elastic bending equation to solve for required section modulus',
            'Given σ = M / Z, calculate the minimum elastic section modulus Z (in cm³) required to carry a bending moment M = 36 kN·m if the allowable bending stress is σ = 180 N/mm².',
            200,
            'cm³',
            'Rearranging gives Z = M / σ = (36 × 10⁶ N·mm) / (180 N/mm²) = 200,000 mm³ = 200 cm³.',
            '1 cm³ = 1,000 mm³.'
          ),
          qNum(
            'MOD00-T2-Q5',
            0,
            'MOD00-T2',
            'Solve simultaneous equilibrium equations',
            'In a symmetric V-sling lift, two identical legs satisfy 2·T·sin(60°) = 34.64 kN. Solve for the tension T in one sling leg.',
            20,
            'kN',
            'sin(60°) = 0.866025. Thus 2 × 0.866025 × T = 1.73205 × T = 34.64 kN, giving T = 34.64 / 1.73205 = 20.0 kN.',
            'Static equilibrium of a symmetric two-leg lifting arrangement (relates to Syllabus Comment [UI1] on lifting).'
          ),
        ],
      },
      {
        id: 'MOD00-T3',
        moduleNumber: 0,
        code: '0.3',
        title: 'Physical Quantities, Inclined Forces & UDL Resultants',
        summary:
          'Covers mass vs weight, resolving inclined forces into horizontal and vertical components (Example 0.2), replacing a UDL with its equivalent point load and centroid location (Example 0.3), and moments as Force × Perpendicular Lever Arm.',
        subtopics: [
          'Mass (kg) versus weight/gravity force (N, kN) using g = 9.81 m/s²',
          'Resolving inclined forces into horizontal (F cos θ) and vertical (F sin θ) components',
          'Moment of a force about a pivot: M = F × d_perp',
          'Equivalent resultant of a rectangular UDL (W = wL at x = L/2) and triangular load (W = ½wL at L/3 from heavy end)',
          'Physical distinction between force, stress, pressure, strain, and stiffness',
        ],
        learningObjectives: [
          'Complete Syllabus Worked Examples 0.2 and 0.3 accurately by hand.',
          'Convert mass in kg or tonnes into characteristic gravity weight in kN.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Detailed notes on lifting sling angles and why shallow sling angles cause huge tie tensions.',
          workedExamplesPlanned: 'Worked Examples 0.2 (20 kN tie at 35°) and 0.3 (6 m beam with 8 kN/m).',
          calculationsPlanned: 'Trapezoidal and triangular load resultants for retaining wall pressures.',
          sourceReferencesNeeded: 'EngineeringStatics.org free statics exercises.',
        },
        questions: [
          qNum(
            'MOD00-T3-Q1',
            0,
            'MOD00-T3',
            'Resolve inclined tie force into horizontal component (Example 0.2)',
            'A 20 kN tie is inclined at 35° to the horizontal (Syllabus Example 0.2). Calculate the magnitude of its horizontal force component F_x.',
            16.38,
            'kN',
            'F_x = F × cos(35°) = 20 kN × 0.81915 = 16.383 kN ≈ 16.38 kN.',
            'Angle is measured from the horizontal axis, so horizontal component uses cosine.'
          ),
          qNum(
            'MOD00-T3-Q2',
            0,
            'MOD00-T3',
            'Resolve inclined tie force into vertical component (Example 0.2)',
            'For the same 20 kN tie inclined at 35° to the horizontal (Syllabus Example 0.2), calculate the magnitude of its vertical force component F_y.',
            11.47,
            'kN',
            'F_y = F × sin(35°) = 20 kN × 0.57358 = 11.472 kN ≈ 11.47 kN.',
            'Check by Pythagoras: √(16.383² + 11.472²) = 20.0 kN.'
          ),
          qNum(
            'MOD00-T3-Q3',
            0,
            'MOD00-T3',
            'Calculate resultant point load of a UDL (Example 0.3)',
            'A 6 m beam carries a uniform distributed load of 8 kN/m over its full length (Syllabus Example 0.3). What is the total equivalent point load W?',
            48,
            'kN',
            'W = w × L = 8 kN/m × 6 m = 48 kN, acting at midspan (3.0 m from either end).',
            'Replacing a UDL with its resultant is valid for finding global external support reactions, not internal bending moments within the loaded span.'
          ),
          qNum(
            'MOD00-T3-Q4',
            0,
            'MOD00-T3',
            'Convert mass of a precast concrete unit into gravity weight in kN',
            'A precast concrete stair flight has a mass of 4,500 kg. Using g = 9.81 m/s², calculate its characteristic self-weight in kN.',
            44.15,
            'kN',
            'Weight W = m × g = 4,500 kg × 9.81 m/s² = 44,145 N = 44.145 kN ≈ 44.15 kN.',
            'Excludes dynamic lifting/hoisting amplification factors.'
          ),
          qMcq(
            'MOD00-T3-Q5',
            0,
            'MOD00-T3',
            'Understand limitations of replacing a UDL with a single resultant point load',
            'When is it valid to replace a uniformly distributed load w over span L with a single concentrated load W = wL at midspan?',
            [
              'When writing global equilibrium equations to find external support reactions of a determinate beam',
              'When calculating the internal bending moment at midspan without restoring the distributed load on the free-body cut',
              'When drawing the parabolic bending moment diagram as a triangular point-load diagram',
              'When checking local web bearing at midspan where no point load physically exists',
            ],
            0,
            'Statically equivalent resultants preserve external global equilibrium (reactions), but internal shear V(x) and moment M(x) within the loaded region depend on the actual load distribution (wL²/8 for UDL vs WL/4 = wL²/4 for a midspan point load).',
            'Crucial distinction between external equivalence and internal stress resultants.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-0.1',
        code: 'Example 0.1',
        title: 'Unit conversion',
        kind: 'worked_example',
        description:
          'Convert: 200 GPa into N/mm²; 25 kN/m² into N/mm²; 5 kNm into Nmm; 7.5 kN/m into N/mm.',
        requiresCalcNote: false,
        statusLabel: 'Interactive Practice & Assessment Active',
        selfReviewChecklist: [
          'Explain why 1 MPa equals 1 N/mm² from first principles.',
          'Show both 10³ multipliers when converting kN·m to N·mm.',
          'Verify why kN/m and N/mm have a 1:1 numerical ratio.',
        ],
      },
      {
        id: 'EX-0.2',
        code: 'Example 0.2',
        title: 'Resolving an inclined force',
        kind: 'worked_example',
        description:
          'A 20 kN tie is inclined at 35° to horizontal. Calculate horizontal and vertical components.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 0.3 & Module 0 Assessment',
        selfReviewChecklist: [
          'Sketch the force vector and orthogonal right-angled triangle.',
          'Compute Fx = 20 cos 35° = 16.38 kN and Fy = 20 sin 35° = 11.47 kN.',
          'Check resultant magnitude by Pythagoras: √(Fx² + Fy²) = 20.0 kN.',
        ],
      },
      {
        id: 'EX-0.3',
        code: 'Example 0.3',
        title: 'Resultant of UDL',
        kind: 'worked_example',
        description:
          'A 6 m beam carries 8 kN/m. Calculate the equivalent point load and where it acts.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 0.3 & Module 0 Assessment',
        selfReviewChecklist: [
          'Sketch the 6 m beam with uniform load block w = 8 kN/m.',
          'Calculate resultant W = 8 × 6 = 48 kN acting at centroid x = 3.0 m.',
          'State clearly that this resultant is for global equilibrium, not internal midspan moment.',
        ],
      },
    ],
    resources: [
      'Jeff Hanson: statics introduction and force vectors.',
      'Hibbeler Structural Analysis: opening statics chapters.',
      'EngineeringStatics.org: free statics exercises.',
    ],
    standardsNotice:
      'Foundation mathematics and SI units module. Material densities and gravity loads in real design must be verified against BS EN 1991-1-1 and the UK National Annex.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD00-E01',
        0,
        'MOD00-T1',
        'Convert steel elastic modulus from GPa to N/mm²',
        'A structural steel specification states E = 210 GPa. Express E in N/mm².',
        210000,
        'N/mm²',
        '1 GPa = 1,000 MPa = 1,000 N/mm². Therefore 210 GPa = 210,000 N/mm².',
        'Exact SI prefix conversion.'
      ),
      qNum(
        'MOD00-E02',
        0,
        'MOD00-T1',
        'Convert bending moment from kN·m to N·mm',
        'A floor beam resists a design bending moment of M = 42.5 kN·m. Express M in N·mm.',
        42500000,
        'N·mm',
        '42.5 kN·m × 10⁶ (N·mm per kN·m) = 42,500,000 N·mm.',
        '1 kN = 10³ N and 1 m = 10³ mm.'
      ),
      qNum(
        'MOD00-E03',
        0,
        'MOD00-T1',
        'Convert surface pressure from kN/m² to N/mm²',
        'A padstone bearing pressure is 1,500 kN/m². Convert this bearing stress into N/mm² (MPa).',
        1.5,
        'N/mm²',
        '1,500 kN/m² ÷ 1,000 = 1.5 N/mm² (1.5 MPa).',
        '1 kN/m² = 10⁻³ N/mm².'
      ),
      qNum(
        'MOD00-E04',
        0,
        'MOD00-T1',
        'Convert second moment of area from cm⁴ to mm⁴',
        'A steel universal beam has a major-axis second moment of area I_y = 8,500 cm⁴. Express I_y in mm⁴.',
        85000000,
        'mm⁴',
        'Since 1 cm = 10 mm, 1 cm⁴ = (10 mm)⁴ = 10⁴ mm⁴ = 10,000 mm⁴. Thus 8,500 × 10,000 = 85,000,000 mm⁴.',
        'Section tables often quote I in cm⁴; multiplying by 10⁴ converts to mm⁴.'
      ),
      qNum(
        'MOD00-E05',
        0,
        'MOD00-T1',
        'Convert elastic section modulus from cm³ to mm³',
        'A steel beam has an elastic section modulus W_el = 625 cm³. Express W_el in mm³.',
        625000,
        'mm³',
        'Since 1 cm = 10 mm, 1 cm³ = (10 mm)³ = 1,000 mm³. Thus 625 × 1,000 = 625,000 mm³.',
        '1 cm³ = 10³ mm³.'
      ),
      qNum(
        'MOD00-E06',
        0,
        'MOD00-T1',
        'Convert line load from kN/m to N/mm',
        'A masonry wall applies a characteristic line load of 18.4 kN/m onto a steel lintel. What is this load in N/mm?',
        18.4,
        'N/mm',
        '1 kN/m = 1,000 N / 1,000 mm = 1 N/mm, so 18.4 kN/m = 18.4 N/mm.',
        'Direct 1:1 identity between kN/m and N/mm.'
      ),
      qNum(
        'MOD00-E07',
        0,
        'MOD00-T1',
        'Convert mass density kg/m³ to unit weight kN/m³',
        'Unreinforced normal-weight concrete has a mass density of ρ = 2,400 kg/m³. Using g = 9.81 m/s², calculate its unit weight γ in kN/m³.',
        23.54,
        'kN/m³',
        'γ = ρ × g = 2,400 kg/m³ × 9.81 m/s² = 23,544 N/m³ = 23.544 kN/m³ ≈ 23.54 kN/m³.',
        'Note: BS EN 1991-1-1 tabulates nominal reinforced concrete unit weight as 25 kN/m³; this question tests first-principles ρg conversion.'
      ),
      qMcq(
        'MOD00-E08',
        0,
        'MOD00-T1',
        'Identify dimensional homogeneity in axial stiffness',
        'For an axially loaded bar of force P, length L, area A, and Young’s modulus E, the axial extension is ΔL = PL / (AE). What are the SI units of the axial stiffness term k = AE / L?',
        ['N/mm (or kN/m)', 'N·mm', 'N/mm²', 'mm/N'],
        0,
        '[A][E]/[L] = (mm² × N/mm²) / mm = N/mm, which is force per unit extension.',
        'Stiffness is force divided by displacement.'
      ),
      qNum(
        'MOD00-E09',
        0,
        'MOD00-T2',
        'Apply trigonometry to find horizontal tie reaction',
        'An inclined prop carries an axial compression force of 50 kN at an angle of 53.13° above the horizontal. Calculate the horizontal component of force transferred to the soleplate.',
        30,
        'kN',
        'F_x = 50 × cos(53.13°) = 50 × 0.600 = 30.0 kN.',
        'This horizontal component must be resisted by friction or a положительный restraint kick-plate at the base.'
      ),
      qNum(
        'MOD00-E10',
        0,
        'MOD00-T2',
        'Apply trigonometry to find vertical prop capacity component',
        'For the same prop carrying 50 kN axial compression at 53.13° above the horizontal, what vertical load component does it support?',
        40,
        'kN',
        'F_y = 50 × sin(53.13°) = 50 × 0.800 = 40.0 kN.',
        '3-4-5 triangle geometry: √(30² + 40²) = 50 kN.'
      ),
      qNum(
        'MOD00-E11',
        0,
        'MOD00-T2',
        'Calculate required inclined sling tension for a vertical lift',
        'A precast concrete beam weighing 60 kN is lifted by a symmetric two-leg chain sling where each leg is inclined at 45° to the horizontal. Assuming static equilibrium and equal leg sharing, what is the tension in each sling leg?',
        42.43,
        'kN',
        'Vertical equilibrium: 2 × T × sin(45°) = 60 kN => T = 30 / sin(45°) = 30 / 0.70711 = 42.426 kN ≈ 42.43 kN.',
        'Illustrates why inclined sling legs experience tension greater than half the lifted weight (Syllabus Comment [UI1] lifting context).'
      ),
      qNum(
        'MOD00-E12',
        0,
        'MOD00-T2',
        'Rearrange rectangular second moment of area equation',
        'For a rectangular section of breadth b = 100 mm and depth d = 300 mm, calculate the second moment of area I = bd³/12 in units of 10⁶ mm⁴.',
        225,
        '10⁶ mm⁴',
        'I = (100 × 300³) / 12 = (100 × 27,000,000) / 12 = 225,000,000 mm⁴ = 225 × 10⁶ mm⁴.',
        'Bending about the major axis.'
      ),
      qMcq(
        'MOD00-E13',
        0,
        'MOD00-T2',
        'Interpret gradient of bending moment diagram',
        'Along a beam segment where the bending moment M(x) is constant (zero slope on the BMD), what must be true about the shear force V(x) in that segment?',
        [
          'The shear force V(x) is zero throughout that segment (pure bending)',
          'The shear force V(x) is at its maximum constant value',
          'The distributed load w(x) is at its peak value',
          'The beam curvature is zero throughout that segment',
        ],
        0,
        'Because V(x) = dM/dx, a zero gradient on the bending moment diagram means V(x) = 0 (pure bending region).',
        'Classic example: the middle third of a symmetrically loaded four-point bending test.'
      ),
      qNum(
        'MOD00-E14',
        0,
        'MOD00-T3',
        'Calculate resultant of a full-span UDL',
        'A 7.5 m scaffold ledger carries a uniform distributed load of 4.0 kN/m. Calculate the magnitude of the equivalent resultant point load.',
        30,
        'kN',
        'W = w × L = 4.0 kN/m × 7.5 m = 30.0 kN.',
        'Acts at midspan (x = 3.75 m).'
      ),
      qNum(
        'MOD00-E15',
        0,
        'MOD00-T3',
        'Calculate resultant of a triangular hydrostatic/earth pressure distribution',
        'A 3.0 m high retaining wall stem experiences a triangular horizontal pressure increasing linearly from 0 kN/m² at the top to 18 kN/m² at the base. What is the resultant horizontal force per metre run of wall?',
        27,
        'kN/m',
        'Resultant = area of triangle = 0.5 × base × height = 0.5 × 18 kN/m² × 3.0 m = 27.0 kN/m.',
        'Acts at the centroid of the triangle, 1.0 m (H/3) above the base.'
      ),
      qNum(
        'MOD00-E16',
        0,
        'MOD00-T3',
        'Locate line of action of a triangular distributed load',
        'For the 3.0 m high wall with triangular pressure (0 at top to 18 kN/m² at base), at what height above the base does the resultant horizontal force act?',
        1,
        'm',
        'The centroid of a right-angled triangle lies at one-third of its height from the heavy (base) end: H/3 = 3.0 / 3 = 1.0 m above the base.',
        'Thus the overturning moment per metre run about the base is 27 kN/m × 1.0 m = 27 kN·m/m.'
      ),
      qNum(
        'MOD00-E17',
        0,
        'MOD00-T3',
        'Calculate moment of an eccentric vertical load',
        'A steel bracket attached to a column face supports a vertical crane rail load of 85 kN at a horizontal eccentricity of 220 mm from the column centreline. Calculate the bending moment induced in the column in kN·m.',
        18.7,
        'kN·m',
        'e = 220 mm = 0.22 m. Moment M = F × e = 85 kN × 0.22 m = 18.7 kN·m.',
        'Moment equals force multiplied by perpendicular lever arm.'
      ),
      qMcq(
        'MOD00-E18',
        0,
        'MOD00-T3',
        'Distinguish stiffness from strength in engineering terminology',
        'Which physical quantity measures a structural member’s resistance to elastic deformation under load (rather than the load at which it yields or fractures)?',
        [
          'Stiffness (governed by E, G, and section geometry A, I)',
          'Yield strength f_y',
          'Ultimate tensile strength f_u',
          'Ductility capacity',
        ],
        0,
        'Stiffness (such as AE/L in axial loading or EI/L³ in bending) relates force to elastic displacement, whereas strength (f_y, f_u) governs material failure.',
        'Increasing steel grade from S275 to S355 increases strength but does not change Young’s modulus E or elastic stiffness.'
      ),
      qMcq(
        'MOD00-E19',
        0,
        'MOD00-T1',
        'Detect common power-of-ten unit error in bending stress calculation',
        'An engineer calculates the bending stress for M = 18 kN·m and Z = 600,000 mm³ by writing σ = 18,000 / 600,000 = 0.03 N/mm². What error was made?',
        [
          'They converted kN·m to N·m (×10³) instead of N·mm (×10⁶), making the stress 1,000 times too small',
          'They divided Z by M instead of M by Z',
          'They used GPa instead of MPa',
          'The calculation is correct; 0.03 N/mm² is the true stress',
        ],
        0,
        '18 kN·m = 18 × 10⁶ N·mm. Dividing 18,000,000 N·mm by 600,000 mm³ gives 30 N/mm². Omitting the m-to-mm factor of 1,000 produced a dangerous 10⁻³ error.',
        'Always write units beside every number in hand calculations.'
      ),
      qNum(
        'MOD00-E20',
        0,
        'MOD00-T3',
        'Combine UDL resultant and point load moment about a support',
        'A 4.0 m cantilever carries a uniform load of 5.0 kN/m over its full length plus a 10 kN point load at the free tip. Calculate the total hogging moment magnitude at the fixed support.',
        80,
        'kN·m',
        'UDL resultant = 5 × 4 = 20 kN acting at 2.0 m from the fixed root (moment = 20 × 2 = 40 kN·m). Tip load moment = 10 × 4.0 = 40 kN·m. Total fixed-end moment = 40 + 40 = 80 kN·m.',
        'Cantilever equilibrium: M_root = wL²/2 + P·L.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 1: STATICS, EQUILIBRIUM AND LOAD PATHS                            */
  /* ======================================================================== */
  {
    moduleNumber: 1,
    code: 'MOD-01',
    title: 'Module 1: Statics, equilibrium and load paths',
    shortTitle: 'Statics, equilibrium and load paths',
    suggestedDuration: '8–10 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 1–4',
    whyItMatters:
      'Every structural design or temporary works check begins by isolating the structure in a clean free-body diagram, tracing the complete vertical and lateral load path to the ground, and verifying static equilibrium.',
    introduction:
      'Develops rigorous habits in drawing free-body diagrams, idealising support restraints (roller, pin, fixed, internal hinge), solving equilibrium equations (ΣFx = 0, ΣFy = 0, ΣM = 0), computing tributary floor/roof loads, and tracing complete permanent and temporary works load paths.',
    objectives: [
      'Draw complete free-body diagrams showing all external actions, support reactions, axes, and dimensions.',
      'Calculate support reactions on simply supported, overhanging, and cantilever determinate beams.',
      'Compute tributary areas and characteristic line loads on supporting beams.',
      'Trace complete vertical and lateral load paths through permanent structures and falsework/propping systems, identifying what could interrupt the load path.',
    ],
    learningGate: [
      'Draw a clean free-body diagram without omitting reactions or dimensions.',
      'Calculate reactions on standard determinate beams and check them by taking moments about a second point.',
      'Calculate tributary floor and roof loads accurately.',
      'Identify a complete vertical load path from roof/slab to foundation/soil.',
      'Identify the lateral stability system of a structure.',
      'Explain why a padstone, bearing, connection, or foundation may govern rather than the beam itself.',
    ],
    prerequisiteModuleNumbers: [0],
    topics: [
      {
        id: 'MOD01-T1',
        moduleNumber: 1,
        code: '1.1',
        title: 'Free-Body Diagrams & Support Restraints',
        summary:
          'Covers isolating members, choosing axes, and understanding what roller, pin, fixed, and internal hinge supports permit and restrain in 2D plane structures.',
        subtopics: [
          'Isolating a structure or member from its surroundings',
          'Roller support: 1 reaction component (perpendicular to rolling surface); permits rotation and parallel translation',
          'Pin support: 2 reaction components (Rx, Ry); permits rotation',
          'Fixed support: 3 reaction components (Rx, Ry, Mz); restrains translation and rotation',
          'Internal hinge (pin release): transmits shear/axial force but enforces M = 0 at the hinge',
        ],
        learningObjectives: [
          'Identify the exact number and direction of reaction components for any idealised support.',
          'Explain the physical approximations behind pinned, roller, and fixed support idealisations.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Comparison of textbook support symbols against real steelwork fin-plates, end-plates, and elastomeric bearings.',
          workedExamplesPlanned: 'Free-body diagrams of propped cantilevers and compound beams with internal hinges.',
          calculationsPlanned: 'Support reaction checklists.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis: reactions and equilibrium sections.',
        },
        questions: [
          qMcq(
            'MOD01-T1-Q1',
            1,
            'MOD01-T1',
            'Identify reaction components of a 2D fixed support',
            'How many independent unknown reaction components does a fully fixed (encastré) support provide in a 2D planar structure, and what are they?',
            [
              'Three: horizontal force Rx, vertical force Ry, and bending moment Mz',
              'Two: horizontal force Rx and vertical force Ry only',
              'One: vertical force Ry perpendicular to the support',
              'Two: vertical force Ry and bending moment Mz only',
            ],
            0,
            'A 2D fixed support prevents horizontal translation (Rx), vertical translation (Ry), and rotation in the plane (Mz).',
            'Real fixed bases require stiff baseplates, holding-down bolts, and a foundation capable of resisting the overturning moment.'
          ),
          qMcq(
            'MOD01-T1-Q2',
            1,
            'MOD01-T1',
            'Determine direction of reaction for a roller on a vertical wall',
            'An ideal frictionless roller at the end of a beam rests against a smooth vertical wall. Which reaction component(s) can the wall exert on the roller?',
            [
              'A horizontal force normal (perpendicular) to the vertical wall only',
              'A vertical shear force parallel to the wall only',
              'Both horizontal and vertical forces',
              'A horizontal force and a clamping moment',
            ],
            0,
            'An ideal roller transmits force only perpendicular (normal) to the contact surface and offers zero resistance to movement parallel to the surface or rotation.',
            'Plane statics idealisation.'
          ),
          qMcq(
            'MOD01-T1-Q3',
            1,
            'MOD01-T1',
            'Understand the condition provided by an internal hinge',
            'When an internal frictionless pin (hinge) is introduced into a beam at point C, what additional condition equation does it provide for static analysis?',
            [
              'The internal bending moment at C is zero (M_C = 0)',
              'The internal shear force at C is zero (V_C = 0)',
              'The beam slope is continuous and zero at C',
              'The vertical deflection at C is zero',
            ],
            0,
            'An internal pin cannot transmit bending moment, so the sum of moments of all forces to either the left or right of the hinge C about C must equal zero (M_C = 0).',
            'Used in Gerber beams and three-pinned arches/portals to render the structure statically determinate.'
          ),
          qMcq(
            'MOD01-T1-Q4',
            1,
            'MOD01-T1',
            'Identify what belongs on a free-body diagram',
            'When drawing the external free-body diagram of an entire simply supported truss to find its global support reactions, how should the internal axial forces in the truss web members be shown?',
            [
              'They are not shown on the whole-truss FBD because internal member forces occur in equal and opposite pairs within the isolated boundary',
              'Every internal web force must be drawn as an external load at the joints',
              'Only compression web members are shown on the global FBD',
              'The self-weight and external loads are omitted and only internal forces are drawn',
            ],
            0,
            'A free-body diagram shows only actions crossing the chosen isolation boundary. Internal forces only appear when a section cut passes through those members.',
            'Fundamental principle of isolation in statics.'
          ),
          qNum(
            'MOD01-T1-Q5',
            1,
            'MOD01-T1',
            'Count total unknown reactions for a simply supported beam',
            'A 2D beam is supported by a pin at support A and a horizontal roller at support B. How many total unknown support reaction components exist?',
            3,
            'reactions',
            'The pin at A provides 2 unknowns (Ax, Ay) and the roller at B provides 1 unknown (By), giving 2 + 1 = 3 unknowns, matching the 3 equations of 2D plane equilibrium.',
            'Provided the three reaction lines of action are not concurrent or all parallel, the beam is statically determinate and stable.'
          ),
        ],
      },
      {
        id: 'MOD01-T2',
        moduleNumber: 1,
        code: '1.2',
        title: 'Equations of Equilibrium & Beam Reactions',
        summary:
          'Applies ΣFx = 0, ΣFy = 0, and ΣM = 0 to calculate support reactions under UDLs, eccentric point loads, and combined loading (Syllabus Examples 1.1 and 1.2).',
        subtopics: [
          'Three planar equilibrium equations: ΣFx = 0, ΣFy = 0, ΣM_z = 0',
          'Symmetric beam under UDL (Example 1.1: 6 m beam with 10 kN/m)',
          'Eccentric point load reactions using moments about each support (Example 1.2: 5 m beam with 20 kN at 2 m)',
          'Independent check: taking moments about the opposite support first, then checking ΣFy = 0',
          'Beams with cantilevers/overhangs anduplift checks at backspans',
        ],
        learningObjectives: [
          'Solve Syllabus Examples 1.1 and 1.2 and verify reactions with an independent moment check.',
          'Detect when an overhanging load causes uplift (negative reaction) at an interior or backspan support.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Step-by-step guide on avoiding arithmetic sign errors in moment equilibrium.',
          workedExamplesPlanned: 'Examples 1.1 and 1.2 plus overhanging temporary works needle beams.',
          calculationsPlanned: 'Reaction sensitivity to load position.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis and Jeff Hanson statics videos.',
        },
        questions: [
          qNum(
            'MOD01-T2-Q1',
            1,
            'MOD01-T2',
            'Calculate total load and reactions on symmetric UDL beam (Example 1.1)',
            'A 6 m simply supported beam carries a uniform distributed load of 10 kN/m over its full span (Syllabus Example 1.1). Calculate the vertical reaction at the left support R_A.',
            30,
            'kN',
            'Total load W = 10 kN/m × 6 m = 60 kN. By symmetry of geometry, supports, and loading, R_A = R_B = 60 / 2 = 30 kN.',
            'Symmetry applies because both the support conditions and the loading are mirror-symmetric about midspan.'
          ),
          qNum(
            'MOD01-T2-Q2',
            1,
            'MOD01-T2',
            'Calculate left reaction under eccentric point load (Example 1.2)',
            'A 5 m simply supported beam carries a 20 kN point load at 2 m from the left support A (Syllabus Example 1.2). Taking moments about the right support B, calculate the left support reaction R_A.',
            12,
            'kN',
            'ΣM_B = 0 => R_A × 5 m − 20 kN × (5 − 2) m = 0 => 5 R_A = 60 => R_A = 12 kN.',
            'The support closer to the point load carries the larger share of the load (3/5 of 20 kN = 12 kN).'
          ),
          qNum(
            'MOD01-T2-Q3',
            1,
            'MOD01-T2',
            'Calculate right reaction under eccentric point load (Example 1.2)',
            'For the same 5 m beam carrying 20 kN at 2 m from the left support A (Syllabus Example 1.2), take moments about A to calculate the right support reaction R_B.',
            8,
            'kN',
            'ΣM_A = 0 => R_B × 5 m − 20 kN × 2 m = 0 => 5 R_B = 40 => R_B = 8 kN. Independent check: R_A + R_B = 12 + 8 = 20 kN = applied load.',
            'Always compute both reactions by moments and use ΣFy = 0 as an independent check.'
          ),
          qNum(
            'MOD01-T2-Q4',
            1,
            'MOD01-T2',
            'Calculate reactions on a beam with a cantilever overhang',
            'A beam is supported at A (x = 0 m) and B (x = 4.0 m) and overhangs to a free tip at C (x = 5.5 m). It carries a downward point load of 16 kN at the tip C only. Calculate the vertical reaction at B (upward positive).',
            22,
            'kN',
            'ΣM_A = 0 => R_B × 4.0 m − 16 kN × 5.5 m = 0 => 4.0 R_B = 88 => R_B = 22.0 kN upward.',
            'Notice R_B (22 kN) is greater than the applied load (16 kN) because support A must pull downward (R_A = -6 kN hold-down) to prevent overturning!'
          ),
          qNum(
            'MOD01-T2-Q5',
            1,
            'MOD01-T2',
            'Calculate hold-down uplift reaction on an overhanging needle beam',
            'For the overhanging beam in the previous question (supports at x = 0 m and x = 4.0 m, 16 kN downward load at x = 5.5 m), what is the vertical reaction R_A at x = 0 m (enter negative for downward hold-down force)?',
            -6,
            'kN',
            'ΣFy = 0 => R_A + 22.0 − 16.0 = 0 => R_A = −6.0 kN (downward hold-down required at A).',
            'Critical in temporary works needling/cantilever brackets: if support A cannot resist uplift, the beam tips over as a mechanism.'
          ),
        ],
      },
      {
        id: 'MOD01-T3',
        moduleNumber: 1,
        code: '1.3',
        title: 'Vertical Load Paths & Tributary Areas',
        summary:
          'Traces gravity loads from roofs and floors through secondary/primary beams and walls/columns to foundations, and calculates characteristic line loads from tributary widths (Syllabus Example 1.3).',
        subtopics: [
          'One-way vs two-way spanning floor and roof load-sharing assumptions',
          'Tributary width and tributary area takedown onto beams and columns',
          'Syllabus Example 1.3: 4 m floor span between 5 m long beams (g_k = 1.0 kN/m², q_k = 1.5 kN/m²)',
          'Why bearings, padstones, connections, or foundations frequently govern over main beam bending',
        ],
        learningObjectives: [
          'Calculate characteristic permanent and imposed line loads on beams from floor surface loads.',
          'Trace a complete vertical load path from slab to ground and identify governing support interfaces.',
        ],
        futureExpansion: {
          lessonsPlanned: 'One-way vs two-way slab tributary area diagrams (45° yield-line envelopes).',
          workedExamplesPlanned: 'Example 1.3 full calculation note with internal vs edge beam tributary widths.',
          calculationsPlanned: 'Column axial load takedown across multi-storey bays.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis and UK steel/concrete design guides.',
        },
        questions: [
          qNum(
            'MOD01-T3-Q1',
            1,
            'MOD01-T3',
            'Calculate tributary width for a one-way spanning floor (Example 1.3)',
            'A one-way floor spans 4.0 m simply supported between two parallel edge beams (Syllabus Example 1.3). What tributary width of floor is supported by each beam?',
            2,
            'm',
            'For a one-way spanning floor simply supported between two beams 4.0 m apart, each beam carries half the span: b_trib = 4.0 / 2 = 2.0 m.',
            'Assumes uniform floor loading and simple one-way spanning action between the two beams.'
          ),
          qNum(
            'MOD01-T3-Q2',
            1,
            'MOD01-T3',
            'Calculate characteristic permanent line load on supporting beam (Example 1.3)',
            'In Syllabus Example 1.3, the floor spans 4.0 m between two beams (tributary width 2.0 m per beam) and has a characteristic permanent action g_k = 1.0 kN/m² and imposed action q_k = 1.5 kN/m². Calculate the total characteristic line load (g_k + q_k) on one beam, excluding beam self-weight.',
            5,
            'kN/m',
            'Permanent line load = 1.0 kN/m² × 2.0 m = 2.0 kN/m. Imposed line load = 1.5 kN/m² × 2.0 m = 3.0 kN/m. Total unfactored characteristic line load = 2.0 + 3.0 = 5.0 kN/m.',
            'Excludes beam self-weight and ULS partial factors (which are applied in Module 7).'
          ),
          qNum(
            'MOD01-T3-Q3',
            1,
            'MOD01-T3',
            'Calculate total reaction transferred to each beam end bearing (Example 1.3)',
            'If the beam in Syllabus Example 1.3 is 5.0 m long and carries the total characteristic line load of 5.0 kN/m, what total unfactored vertical reaction is delivered to each end support of the beam?',
            12.5,
            'kN',
            'Total load on beam = 5.0 kN/m × 5.0 m = 25.0 kN. Each end bearing receives 25.0 / 2 = 12.5 kN.',
            'In real design, beam self-weight must also be added to this reaction.'
          ),
          qNum(
            'MOD01-T3-Q4',
            1,
            'MOD01-T3',
            'Calculate tributary area of an internal floor beam in a regular grid',
            'In a multi-bay floor where one-way slabs span 3.6 m between secondary beams spaced at 3.6 m centres, and each beam is 6.0 m long, what is the tributary floor area supported by one internal secondary beam?',
            21.6,
            'm²',
            'An internal beam receives half a bay from the left (1.8 m) plus half a bay from the right (1.8 m), giving tributary width = 3.6 m. Tributary area = 3.6 m × 6.0 m = 21.6 m².',
            'Assumes simply supported one-way slab strips.'
          ),
          qMcq(
            'MOD01-T3-Q5',
            1,
            'MOD01-T3',
            'Explain why bearings or padstones often govern over the beam itself',
            'Why can a masonry bearing, padstone, connection, or foundation govern the safe capacity of a structural alteration even when the steel beam itself has ample bending capacity?',
            [
              'Because the distributed floor load is concentrated into a small bearing area at the beam ends, creating high local compressive/shear stresses in weaker supporting masonry or soil',
              'Because steel beams lose their Young’s modulus near masonry supports',
              'Because bending moment is always maximum at a simple support',
              'Because tributary width doubles at the beam supports',
            ],
            0,
            'A beam gathers load over several square metres of floor and concentrates half of that total force onto a small support area (e.g. 100 mm × 200 mm), where masonry crushing strength is roughly two orders of magnitude lower than steel yield strength.',
            'Core Module 1 Gate requirement.'
          ),
        ],
      },
      {
        id: 'MOD01-T4',
        moduleNumber: 1,
        code: '1.4',
        title: 'Stability, Determinacy & Falsework Load Paths',
        summary:
          'Covers stable vs unstable arrangements, statically determinate vs indeterminate structures, why vertical load paths require lateral restraint, and complete temporary works falsework load paths (Syllabus Example 1.4).',
        subtopics: [
          'Static determinacy versus indeterminacy in beams and frames',
          'Geometric instability (parallel or concurrent reactions, unbraced mechanisms)',
          'Why a stable vertical load path is not enough if lateral restraint/bracing is missing',
          'Syllabus Example 1.4: wet concrete -> formwork -> primary/secondary beams -> forkheads -> props/towers -> baseplates -> soleboards -> ground',
          'Identifying what can interrupt a permanent or temporary load path on site',
        ],
        learningObjectives: [
          'Trace the complete falsework load path in Example 1.4 and identify critical failure links.',
          'Distinguish determinate, indeterminate, and geometrically unstable support arrangements.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Falsework and backpropping load path case studies (aligned with Syllabus Comment [UI1]).',
          workedExamplesPlanned: 'Example 1.4 annotated falsework diagram and inspection failure modes.',
          calculationsPlanned: 'Soleboard ground bearing pressure checks under prop legs.',
          sourceReferencesNeeded: 'BS 5975 and temporary works system manuals.',
        },
        questions: [
          qMcq(
            'MOD01-T4-Q1',
            1,
            'MOD01-T4',
            'Identify geometrically unstable support arrangements',
            'A horizontal beam is supported on three frictionless horizontal rollers (no pin or horizontal restraint anywhere). How is this structure classified?',
            [
              'Geometrically unstable (all three reaction lines of action are parallel vertical forces, offering zero resistance to any horizontal action)',
              'Statically determinate and stable',
              'Statically indeterminate to the first degree and stable',
              'Fully fixed against sway',
            ],
            0,
            'Even though there are 3 reaction components, all three are vertical (parallel), so ΣFx = 0 cannot be satisfied under any horizontal load or construction out-of-plumb.',
            'Parallel or concurrent reaction lines always create geometric instability.'
          ),
          qMcq(
            'MOD01-T4-Q2',
            1,
            'MOD01-T4',
            'Trace falsework vertical load path and identify interruptions (Example 1.4)',
            'In the falsework load path (wet concrete -> decking -> secondary/primary bearers -> forkheads -> props -> baseplates -> soleboards -> ground), what is the primary structural purpose of the timber soleboard at the bottom of the path?',
            [
              'To spread the concentrated baseplate force over a larger contact area so the underlying ground or slab bearing capacity is not exceeded',
              'To increase the Euler buckling resistance of the steel prop tube',
              'To convert the prop from a pin-ended strut into a moment frame',
              'To reduce the total weight of wet concrete above',
            ],
            0,
            'Without a properly bedded soleboard, the concentrated prop load punches into soft ground or overstresses a hollowcore/thin slab, interrupting the load path at its base.',
            'Syllabus Example 1.4 application.'
          ),
          qMcq(
            'MOD01-T4-Q3',
            1,
            'MOD01-T4',
            'Explain why a vertical load path alone is insufficient without lateral stability',
            'Why is a complete vertical gravity load path (columns and beams capable of carrying vertical load) not sufficient to guarantee a safe structure?',
            [
              'Because small initial out-of-plumb imperfections, wind, or horizontal construction loads will cause an unbraced pin-jointed system to sway and collapse sideways as a mechanism',
              'Because gravity acts horizontally at the Ultimate Limit State',
              'Because vertical columns cannot carry axial compression if bracing is present',
              'Because lateral bracing is only required in earthquake zones',
            ],
            0,
            'Every structure experiences horizontal actions (wind, notional horizontal forces from initial imperfections, concrete placement/equipment loads) and requires a continuous lateral load path to the foundations.',
            'Core Module 1 Gate requirement.'
          ),
          qNum(
            'MOD01-T4-Q4',
            1,
            'MOD01-T4',
            'Calculate degree of static indeterminacy of a propped cantilever',
            'A 2D beam is fully fixed at the left end A (3 reactions) and supported on a vertical roller at the right end B (1 reaction), with no internal hinges. What is its degree of static indeterminacy?',
            1,
            'degree',
            'Total unknown reactions r = 3 + 1 = 4. Available planar equilibrium equations = 3. Degree of static indeterminacy = 4 − 3 = 1.',
            'Requires compatibility of deformation (deflection at B = 0) in addition to statics.'
          ),
          qNum(
            'MOD01-T4-Q5',
            1,
            'MOD01-T4',
            'Calculate ground bearing pressure beneath a temporary works soleboard',
            'A temporary works prop carries a vertical leg load of 36 kN onto a centrally loaded timber soleboard of effective plan area 400 mm × 600 mm resting on firm ground. Calculate the average uniform bearing pressure on the ground in kN/m².',
            150,
            'kN/m²',
            'Area A = 0.4 m × 0.6 m = 0.24 m². Average pressure q = P / A = 36 kN / 0.24 m² = 150 kN/m².',
            'Assumes concentric load and rigid/effective distribution length along the soleboard.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-1.1',
        code: 'Example 1.1',
        title: 'Beam reactions under UDL',
        kind: 'worked_example',
        description:
          'A 6 m simply supported beam carries 10 kN/m. Calculate: total load; left reaction; right reaction; explain why symmetry applies.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 1.2 & Module 1 Assessment',
        selfReviewChecklist: [
          'Draw the isolated 6 m beam with pin at A, roller at B, and UDL w = 10 kN/m.',
          'Calculate total load W = 60 kN and reactions RA = RB = 30 kN.',
          'State why mirror symmetry of span, supports, and loading allows equal division.',
        ],
      },
      {
        id: 'EX-1.2',
        code: 'Example 1.2',
        title: 'Beam reactions under point load',
        kind: 'worked_example',
        description:
          'A 5 m beam carries 20 kN at 2 m from the left support. Calculate reactions using moments about each support.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 1.2 & Module 1 Assessment',
        selfReviewChecklist: [
          'Take ΣMB = 0 to find RA = 12 kN.',
          'Take ΣMA = 0 independently to find RB = 8 kN.',
          'Verify ΣFy = 12 + 8 − 20 = 0.',
        ],
      },
      {
        id: 'EX-1.3',
        code: 'Example 1.3',
        title: 'Tributary floor load',
        kind: 'worked_example',
        description:
          'A floor spans 4 m between two supporting beams. The beams are 5 m long. Floor actions: permanent 1.0 kN/m², imposed 1.5 kN/m². Calculate characteristic line loads to each beam, excluding beam self-weight.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 1.3 & Module 1 Assessment',
        selfReviewChecklist: [
          'Sketch plan and section showing 4 m slab span and 2 m tributary width per beam.',
          'Compute gk,line = 2.0 kN/m and qk,line = 3.0 kN/m (total 5.0 kN/m).',
          'Note that beam self-weight must be added before member checks.',
        ],
      },
      {
        id: 'EX-1.4',
        code: 'Example 1.4',
        title: 'Real-work load path',
        kind: 'practical_exercise',
        description:
          'Take a falsework arrangement you understand. Draw: wet concrete -> formwork -> primary beams -> secondary beams -> heads -> props/towers -> baseplates -> soleboards -> ground. Then list what could interrupt the load path.',
        requiresCalcNote: true,
        statusLabel: 'Self-Review / Independent Review Practice Activity',
        selfReviewChecklist: [
          'Sketch the complete 8-stage falsework vertical load path.',
          'Identify lateral bracing/lacing and tie paths resisting horizontal forces.',
          'List at least 5 interruptions: eccentric forkhead loading, missing prop pins, unbraced ledger level, undermined soleboard, or premature striking of backprops.',
        ],
      },
    ],
    resources: [
      'Hibbeler Structural Analysis: reactions and equilibrium sections.',
      'Jeff Hanson: statics, equilibrium, reactions.',
      'Your own drawings, RAMS, temporary works calculations, or system manuals.',
    ],
    standardsNotice:
      'First-principles equilibrium module. Temporary works procedural and stability checks in practice must comply with BS 5975 and relevant product manuals.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD01-E01',
        1,
        'MOD01-T2',
        'Calculate left support reaction for symmetric UDL (Example 1.1)',
        'A 6.0 m simply supported beam carries a uniform distributed load of 10 kN/m over its full length. Calculate the vertical support reaction at the left support.',
        30,
        'kN',
        'Total load W = 10 × 6 = 60 kN; by symmetry R_left = R_right = 30 kN.',
        'Simply supported determinate beam.'
      ),
      qNum(
        'MOD01-E02',
        1,
        'MOD01-T2',
        'Calculate left reaction for eccentric point load (Example 1.2)',
        'A 5.0 m simply supported beam carries a 20 kN point load at 2.0 m from the left support A. What is the vertical reaction R_A?',
        12,
        'kN',
        'ΣM_B = 0 => 5 R_A = 20 × 3 => R_A = 12 kN.',
        'Verified by ΣM_A = 0 giving R_B = 8 kN.'
      ),
      qNum(
        'MOD01-E03',
        1,
        'MOD01-T2',
        'Calculate right reaction under combined UDL and point load',
        'An 8.0 m simply supported beam (A at left, B at right) carries a full-span UDL of 6.0 kN/m plus a concentrated load of 32 kN at 6.0 m from the left support A. Calculate the vertical reaction R_B at the right support.',
        48,
        'kN',
        'ΣM_A = 0 => R_B × 8 = (6 × 8 × 4) + (32 × 6) = 192 + 192 = 384 kN·m => R_B = 384 / 8 = 48 kN.',
        'Check: R_A = (48 + 32) − 48 = 32 kN.'
      ),
      qNum(
        'MOD01-E04',
        1,
        'MOD01-T2',
        'Calculate fixed-end moment reaction on a cantilever with UDL and tip load',
        'A 3.0 m cantilever beam is fixed at the left wall A and free at the right tip B. It carries a UDL of 8.0 kN/m over its full length and a downward point load of 12 kN at the free tip B. Calculate the magnitude of the clamping moment reaction M_A at the fixed wall.',
        72,
        'kN·m',
        'M_A = (wL² / 2) + (P × L) = (8.0 × 3.0² / 2) + (12 × 3.0) = 36 + 36 = 72 kN·m.',
        'Fixed wall must resist both vertical shear (36 kN) and hogging overturning moment (72 kN·m).'
      ),
      qNum(
        'MOD01-E05',
        1,
        'MOD01-T2',
        'Calculate horizontal reaction at a pin support under inclined load',
        'A simply supported beam has a pin at A and a horizontal roller at B. It carries a single inclined load of 50 kN applied at midspan at 60° to the horizontal (pointing down and to the right). What is the magnitude of the horizontal reaction A_x at the pin?',
        25,
        'kN',
        'ΣFx = 0 => A_x = 50 × cos(60°) = 50 × 0.5 = 25 kN (acting to the left). The roller at B resists zero horizontal force.',
        'All horizontal force is taken by the pin support.'
      ),
      qNum(
        'MOD01-E06',
        1,
        'MOD01-T3',
        'Calculate characteristic permanent line load on an internal floor beam',
        'One-way precast floor planks span 5.0 m onto parallel supporting steel beams spaced at 5.0 m centres. What is the characteristic permanent line load g_k (in kN/m) on an INTERNAL steel beam (supporting planks from both sides) if the floor permanent action is 3.2 kN/m² (excluding beam self-weight)?',
        16,
        'kN/m',
        'An internal beam carries half the 5.0 m span from the left (2.5 m) plus half the 5.0 m span from the right (2.5 m) = 5.0 m tributary width. Line load = 3.2 kN/m² × 5.0 m = 16.0 kN/m.',
        'Distinguish carefully between an edge beam (2.5 m tributary width) and an internal beam (5.0 m tributary width).'
      ),
      qNum(
        'MOD01-E07',
        1,
        'MOD01-T3',
        'Calculate characteristic imposed line load on an edge beam (Example 1.3)',
        'In Syllabus Example 1.3, a floor spans 4.0 m between two edge beams and carries a characteristic imposed load q_k = 1.5 kN/m². What is the characteristic imposed line load on one edge beam?',
        3,
        'kN/m',
        'Tributary width for one edge beam = 4.0 / 2 = 2.0 m. Imposed line load = 1.5 kN/m² × 2.0 m = 3.0 kN/m.',
        'One-way spanning floor.'
      ),
      qNum(
        'MOD01-E08',
        1,
        'MOD01-T3',
        'Calculate column load from intersecting primary and secondary beams',
        'A corner column supports two roof edge beams that deliver vertical end reactions of 42 kN and 58 kN respectively, plus a column self-weight of 6 kN over the storey height. What is the total axial compression force at the base of the column?',
        106,
        'kN',
        'Total axial load = 42 + 58 + 6 = 106 kN.',
        'Vertical load takedown by summation of reactions.'
      ),
      qNum(
        'MOD01-E09',
        1,
        'MOD01-T3',
        'Calculate masonry bearing stress beneath a beam end reaction',
        'A steel beam delivers an end reaction of 90 kN onto a concrete padstone. Before considering dispersal through the padstone, if the steel beam bottom flange bears directly over a contact area of 150 mm width × 200 mm bearing length, what is the local contact stress under the flange?',
        3,
        'N/mm²',
        'Contact area A = 150 mm × 200 mm = 30,000 mm². Contact stress = 90,000 N / 30,000 mm² = 3.0 N/mm².',
        'If the underlying masonry can only safely carry e.g. 1.2 N/mm², a stiff padstone is essential to spread the load over a larger masonry area.'
      ),
      qNum(
        'MOD01-E10',
        1,
        'MOD01-T2',
        'Calculate reaction on a compound beam with an internal hinge',
        'A compound beam ABC is fixed at A (x = 0 m), has an internal frictionless hinge at B (x = 3.0 m), and rests on a vertical roller at C (x = 7.0 m). A downward point load of 24 kN acts at x = 5.0 m (midway between B and C). Calculate the vertical reaction at the roller C.',
        12,
        'kN',
        'Isolate sub-span BC and take moments about the internal hinge B (M_B = 0): R_C × (7.0 − 3.0) − 24 × (5.0 − 3.0) = 0 => 4 R_C = 48 => R_C = 12 kN.',
        'The internal hinge at B acts as a simple support for the suspended span BC.'
      ),
      qMcq(
        'MOD01-E11',
        1,
        'MOD01-T1',
        'Explain why one support of a simply supported beam is idealised as a roller',
        'If both ends of a steel bridge or long-span beam are bolted tightly against horizontal movement (pin-pin instead of pin-roller) and the beam undergoes a significant temperature rise, what physical effect occurs?',
        [
          'Restrained thermal expansion induces large axial compression forces in the beam and horizontal shear forces on the supports, which can buckle the member or damage the bearings',
          'Nothing changes because temperature does not affect statics',
          'The vertical reactions double',
          'The bending moment at midspan drops to zero',
        ],
        0,
        'A pin-pin beam is externally indeterminate axially; restraining thermal expansion ΔL = αΔTL generates axial compression P = EAαΔT.',
        'Real details use slotted holes or sliding bearings to realise the roller assumption.'
      ),
      qMcq(
        'MOD01-E12',
        1,
        'MOD01-T1',
        'Identify correct free-body diagram isolation at a support',
        'When an engineer replaces a physical pin support on a free-body diagram with unknown reaction arrows A_x and A_y, why must the support symbol itself be removed from the isolated sketch?',
        [
          'Because the reaction arrows represent the force exerted by the removed support on the isolated body; keeping both confuses external boundary actions with internal restraints',
          'To save space on the calculation sheet',
          'Because pin supports cannot carry vertical loads',
          'Because equilibrium equations only apply to unsupported bodies in free fall',
        ],
        0,
        'An FBD isolates the body and replaces every cut support or connected member with the internal/reaction forces acting across the boundary.',
        'Core FBD discipline.'
      ),
      qMcq(
        'MOD01-E13',
        1,
        'MOD01-T2',
        'Explain why taking moments about each support is superior to using ΣFy = 0 to find the second reaction',
        'When calculating beam reactions by hand, why is it best practice to find R_A by taking ΣM_B = 0, find R_B by taking ΣM_A = 0, and reserve ΣFy = 0 as a final check?',
        [
          'Because if an arithmetic mistake is made in R_A, using R_B = Total Load − R_A hides the mistake and guarantees ΣFy = 0 appears satisfied while both reactions are wrong',
          'Because ΣFy = 0 is only valid for cantilevers',
          'Because moment equations do not require lever arm dimensions',
          'Because roller supports do not appear in ΣFy = 0',
        ],
        0,
        'Computing R_A and R_B independently via two moment equations provides a genuine independent equilibrium check when verifying R_A + R_B = Total Vertical Load.',
        'Syllabus Study Rule 4 (independent check habit).'
      ),
      qMcq(
        'MOD01-E14',
        1,
        'MOD01-T3',
        'Distinguish one-way and two-way slab load paths',
        'A rectangular in-situ concrete floor bay measures 3.0 m × 9.0 m and is supported on beams along all four edges. How does the primary gravity load transfer occur?',
        [
          'Predominantly one-way across the short 3.0 m span onto the two long 9.0 m beams, because the shorter span is much stiffer',
          'Predominantly one-way along the 9.0 m span onto the two short 3.0 m beams',
          'Equally 25% of the total load to each of the four beams regardless of aspect ratio',
          'Directly to the four corner columns without loading any beams',
        ],
        0,
        'When aspect ratio Ly/Lx > 2, flexural stiffness along the short span Lx (proportional to 1/L³) dominates, so the slab spans primarily one-way across the 3.0 m direction.',
        'Compatability of deflection at mid-panel governs load sharing.'
      ),
      qMcq(
        'MOD01-E15',
        1,
        'MOD01-T4',
        'Identify what interrupts a falsework load path (Example 1.4)',
        'During an inspection of a falsework prop assembly before a concrete pour, you see the primary aluminium beam resting on only one lip of the U-head (forkhead) with no timber packing or centralising wedge. How does this affect the load path?',
        [
          'It introduces a severe eccentricity at the head of the prop, inducing bending moment and local crippling into a prop designed primarily for concentric axial compression',
          'It increases the safe axial load capacity of the prop',
          'It has no effect provided the soleboard is level',
          'It reduces the wet concrete weight by half',
        ],
        0,
        'Tubular props and falsework legs are sensitive to eccentric loading at forkheads and baseplates; eccentric load transfer can trigger premature buckling or head failure.',
        'Directly linked to Syllabus Example 1.4 and BS 5975 temporary works practice.'
      ),
      qMcq(
        'MOD01-E16',
        1,
        'MOD01-T4',
        'Identify lateral stability mechanism in a single-storey frame',
        'A single-storey steel building consists of four columns with pinned bases and beams connected with simple fin-plate (nominal pin) connections, with no diagonal bracing and no shear walls. What happens under horizontal wind load?',
        [
          'The frame is a mechanism (unstable) and sways sideways because pinned joints cannot resist the overturning moment of horizontal loads without bracing or shear cores',
          'The simple fin-plate connections automatically become full-strength rigid portal joints',
          'Gravity loads on the roof prevent any horizontal sway',
          'The pinned column bases resist the entire overturning moment',
        ],
        0,
        'A rectangular frame with 4 hinges in a single loop is a classic sway mechanism unless diagonal bracing, a shear wall/core, or moment-resisting joints are provided.',
        'Module 1 Gate: identify the lateral stability system.'
      ),
      qNum(
        'MOD01-E17',
        1,
        'MOD01-T2',
        'Calculate overturning stability factor of safety for a temporary freestanding block',
        'A temporary precast kentledge block for a site hoarding is 1.2 m wide at its base and weighs 30 kN (acting at the centre of the 1.2 m base, i.e. 0.6 m from the front toe). Wind on the hoarding applies a horizontal force of 5.0 kN at a height of 2.4 m above the base. Calculate the ratio of restoring moment to overturning moment about the front toe.',
        1.5,
        'ratio',
        'Restoring moment M_rest = 30 kN × 0.6 m = 18.0 kN·m. Overturning moment M_over = 5.0 kN × 2.4 m = 12.0 kN·m. Ratio = 18.0 / 12.0 = 1.50.',
        'Unfactored static equilibrium check; design to EN 1990 EQU requires appropriate partial factors on destabilising and stabilising actions.'
      ),
      qNum(
        'MOD01-E18',
        1,
        'MOD01-T3',
        'Calculate backpropping load share in a simplified two-level prop check',
        'A wet concrete pour applies a total vertical load of 24 kN per prop bay onto falsework standing on a recently cast Level 1 slab. If 50% of the prop load is carried by the Level 1 slab in bending and 50% is transferred straight through via aligned backprops to the ground slab, what axial force is carried by each backprop in the ground storey?',
        12,
        'kN',
        '50% of 24 kN = 12 kN transferred down through the aligned backprop to the ground floor.',
        'Simplified illustration of backpropping load path (Syllabus Comment [UI1]); real load sharing depends on relative slab flexural stiffness and prop axial stiffness.'
      ),
      qMcq(
        'MOD01-E19',
        1,
        'MOD01-T4',
        'Recognise punch-through risk of non-aligned temporary props',
        'Why must temporary works props across multiple suspended floor levels be stacked vertically in line (or landed over main beams/columns) rather than offset onto mid-bay slab panels?',
        [
          'Offsetting a prop onto an unpropped slab panel introduces a heavy concentrated point load that can cause punching shear or flexural failure of the supporting slab',
          'Aligned props weigh less than offset props',
          'Offsetting props increases the ceiling height',
          'Slabs have infinite punching shear resistance at mid-bay',
        ],
        0,
        'When props are stacked in line, axial force flows directly column-like from prop to prop through the slab thickness; offsetting interrupts the direct compression path and forces the slab to carry the point load in bending and punching shear.',
        'Critical temporary works load-path rule.'
      ),
      qMcq(
        'MOD01-E20',
        1,
        'MOD01-T1',
        'Evaluate determinacy of a two-span continuous beam',
        'A continuous beam spans across three vertical supports (pin at A, roller at B, roller at C) with no internal hinges. Is it possible to find the three vertical support reactions using only ΣFx = 0, ΣFy = 0, and ΣM = 0?',
        [
          'No; the beam has 4 reaction components (1 horizontal, 3 vertical) and only 3 equilibrium equations, making it statically indeterminate to the first degree',
          'Yes; each span can always be treated as an independent simply supported beam with zero moment over the central support B',
          'Yes; the central support B always carries exactly 50% of the total load regardless of span lengths',
          'No; the beam is geometrically unstable and will collapse',
        ],
        0,
        'A two-span continuous beam has 3 unknown vertical reactions and only 2 vertical/moment equilibrium equations (ΣFy = 0, ΣM = 0), so relative flexural stiffness EI and compatibility of slope over support B are required.',
        'Distinguishes determinate vs indeterminate beams.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 2: INTERNAL ACTIONS, SHEAR FORCE AND BENDING MOMENT               */
  /* ======================================================================== */
  {
    moduleNumber: 2,
    code: 'MOD-02',
    title: 'Module 2: Internal actions, shear force and bending moment',
    shortTitle: 'Internal actions, shear force and bending moment',
    suggestedDuration: '8–10 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 3–4',
    whyItMatters:
      'External loads and support reactions only tell half the story; designing a member requires cutting it open conceptually to find internal axial force N, shear force V, and bending moment M along its entire length.',
    introduction:
      'Covers the method of sections to expose internal axial force, shear force, and bending moment, standard UK structural engineering sign conventions (sagging positive, BMD plotted on the tension face), load–shear–moment differential relationships, deflected shapes, and locating tension and compression faces.',
    objectives: [
      'Cut a structural member at any section x and determine internal N(x), V(x), and M(x) by equilibrium.',
      'Construct accurate Shear Force Diagrams (SFDs) and Bending Moment Diagrams (BMDs) for simply supported, cantilever, and overhanging beams.',
      'Sketch deflected shapes, points of contraflexure, and tension/compression zones before calculating.',
    ],
    learningGate: [
      'Draw SFD and BMD diagrams without copying from a formula sheet.',
      'Calculate maximum bending moment and maximum shear force accurately.',
      'Predict the shape of the diagram and deflected curve before calculating it.',
      'Identify tension and compression zones for sagging, hogging, and cantilever beams.',
      'Explain why a beam may need shear checks close to supports even where bending moment is low.',
    ],
    prerequisiteModuleNumbers: [0, 1],
    topics: [
      {
        id: 'MOD02-T1',
        moduleNumber: 2,
        code: '2.1',
        title: 'Internal Actions, Section Cuts & Sign Conventions',
        summary:
          'Covers cutting a member to reveal internal axial force N, shear force V, and bending moment M, positive sagging vs negative hogging conventions, and checking equilibrium of left and right free-body segments.',
        subtopics: [
          'Method of sections: cutting a member to expose internal N, V, and M',
          'Physical meaning of axial tension (+N), axial compression (-N), shear V, and bending moment M',
          'Sagging (+M, bottom face in tension) vs hogging (-M, top face in tension)',
          'UK structural convention: plotting the BMD on the tension face of the member',
          'Consistency check: evaluating internal M(x) from the left segment vs the right segment',
        ],
        learningObjectives: [
          'Use an imaginary section cut to compute N, V, and M at any position along a beam.',
          'Identify which extreme fibre is in tension under sagging and hogging moments.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Interactive free-body cut explorer showing internal force pairs.',
          workedExamplesPlanned: 'Left-cut vs right-cut verification on asymmetric beams.',
          calculationsPlanned: 'Combined axial and bending internal action cuts.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis: shear and bending moment chapters.',
        },
        questions: [
          qMcq(
            'MOD02-T1-Q1',
            2,
            'MOD02-T1',
            'Identify tension and compression faces in sagging vs hogging',
            'When a horizontal beam undergoes positive (sagging) bending, which extreme fibres are in tension and which are in compression?',
            [
              'Bottom fibres are in tension and top fibres are in compression',
              'Top fibres are in tension and bottom fibres are in compression',
              'Both top and bottom fibres are in tension',
              'Stresses are uniform compression across the entire depth',
            ],
            0,
            'Sagging curves the beam concave upwards (like a smile), stretching the bottom fibres in tension and shortening the top fibres in compression.',
            'Under hogging (over an internal support or in a gravity-loaded cantilever), the top fibres are in tension and the bottom fibres are in compression.'
          ),
          qNum(
            'MOD02-T1-Q2',
            2,
            'MOD02-T1',
            'Calculate internal shear force at a section cut (Example 2.1)',
            'A 6.0 m simply supported beam carries a UDL of w = 10 kN/m (left reaction R_A = 30 kN). Cut the beam at x = 1.5 m from the left support A. What is the internal shear force V at x = 1.5 m?',
            15,
            'kN',
            'From the left free body of length 1.5 m: V(1.5) = R_A − w × x = 30 − (10 × 1.5) = 15 kN.',
            'Clockwise positive shear convention.'
          ),
          qNum(
            'MOD02-T1-Q3',
            2,
            'MOD02-T1',
            'Calculate internal bending moment at a section cut (Example 2.1)',
            'For the same 6.0 m simply supported beam with w = 10 kN/m (R_A = 30 kN), calculate the internal sagging bending moment M at x = 1.5 m from the left support.',
            33.75,
            'kN·m',
            'From the left free body: M(1.5) = R_A × 1.5 − (10 × 1.5) × (1.5 / 2) = 45.0 − 11.25 = 33.75 kN·m.',
            'Remember the UDL over the 1.5 m segment (15 kN) acts at its centroid 0.75 m from the cut.'
          ),
          qMcq(
            'MOD02-T1-Q4',
            2,
            'MOD02-T1',
            'Understand UK convention for plotting Bending Moment Diagrams',
            'In UK structural engineering practice (Eurocode / IStructE convention), on which side of the member axis is the Bending Moment Diagram plotted, and why?',
            [
              'On the tension face (bottom for sagging, top for hogging), so it immediately shows where tensile reinforcement in concrete or lateral restraint of the opposite compression flange in steel is needed',
              'Always above the beam regardless of load direction',
              'On the compression face only',
              'Only at the supports',
            ],
            0,
            'Plotting the BMD on the tension side directly visualises where main tension reinforcement is required in RC beams and reminds steel designers which flange is the opposite compression flange.',
            'Always state your sign/plotting convention on calculation sheets.'
          ),
          qMcq(
            'MOD02-T1-Q5',
            2,
            'MOD02-T1',
            'Verify equilibrium consistency between left-hand and right-hand free bodies',
            'If you cut a beam in equilibrium at section x and calculate internal bending moment M(x) using the left-hand free body, and then recalculate M(x) independently using the right-hand free body, how must the two results compare?',
            [
              'They must have the exact same magnitude and the same sagging/hogging sense (equal and opposite internal action-reaction pair at the cut)',
              'They must add up to the total applied load',
              'The right-hand free body always gives zero moment',
              'They only agree at midspan',
            ],
            0,
            'By Newton’s third law and static equilibrium, the internal moment exposed on the left face of the cut and the right face of the cut must match identically.',
            'Evaluating M(x) from the shorter side of the cut is a fast hand-calculation check.'
          ),
        ],
      },
      {
        id: 'MOD02-T2',
        moduleNumber: 2,
        code: '2.2',
        title: 'Shear Force & Bending Moment Diagrams (SFDs & BMDs)',
        summary:
          'Covers constructing SFDs and BMDs for simply supported UDLs (Example 2.1), cantilevers under UDL (Example 2.2), eccentric point loads (Example 2.3), and finding peak moments where shear passes through zero.',
        subtopics: [
          'Syllabus Example 2.1: 6 m simply supported beam with 10 kN/m (V_max = wL/2 = 30 kN, M_max = wL²/8 = 45 kN·m)',
          'Syllabus Example 2.2: 2 m cantilever with 5 kN/m (V_fixed = wL = 10 kN, M_fixed = wL²/2 = 10 kN·m hogging)',
          'Syllabus Example 2.3: 5 m beam with 20 kN point load at 2 m (M_max = 24 kN·m at the point load)',
          'Load–shear–moment differential relationships: dV/dx = -w and dM/dx = V',
          'Locating maximum bending moment where shear force V(x) passes through zero',
        ],
        learningObjectives: [
          'Solve Syllabus Examples 2.1, 2.2, and 2.3 and sketch their SFDs and BMDs.',
          'Locate the point of zero shear to find maximum bending moment under general loading.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Interactive SFD/BMD plotter for combined point loads, partial UDLs, and overhangs.',
          workedExamplesPlanned: 'Full worked notes for Examples 2.1, 2.2, and 2.3.',
          calculationsPlanned: 'Overhanging beams with points of contraflexure (M = 0).',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis and Jeff Hanson SFD/BMD videos.',
        },
        questions: [
          qNum(
            'MOD02-T2-Q1',
            2,
            'MOD02-T2',
            'Calculate maximum bending moment for simply supported UDL (Example 2.1)',
            'For the 6.0 m simply supported beam carrying a UDL of w = 10 kN/m (Syllabus Example 2.1), calculate the maximum sagging bending moment M_max = wL²/8.',
            45,
            'kN·m',
            'M_max = (10 × 6.0²) / 8 = 360 / 8 = 45.0 kN·m at midspan (x = 3.0 m, where V passes through zero).',
            'Also equal to the triangular area under the SFD from x = 0 to x = 3 m: 0.5 × 30 kN × 3.0 m = 45 kN·m.'
          ),
          qNum(
            'MOD02-T2-Q2',
            2,
            'MOD02-T2',
            'Calculate fixed-end shear on cantilever under UDL (Example 2.2)',
            'A 2.0 m cantilever carries a uniform downward load of 5.0 kN/m over its full length (Syllabus Example 2.2). Calculate the magnitude of the shear force at the fixed support.',
            10,
            'kN',
            'V_fixed = w × L = 5.0 kN/m × 2.0 m = 10.0 kN.',
            'Shear varies linearly from 0 at the free tip to 10 kN at the fixed root.'
          ),
          qNum(
            'MOD02-T2-Q3',
            2,
            'MOD02-T2',
            'Calculate fixed-end hogging moment on cantilever under UDL (Example 2.2)',
            'For the 2.0 m cantilever carrying 5.0 kN/m (Syllabus Example 2.2), calculate the magnitude of the fixed-end bending moment M_fixed = wL²/2.',
            10,
            'kN·m',
            'M_fixed = (5.0 × 2.0²) / 2 = 10.0 kN·m (hogging: top face in tension, parabolic BMD).',
            'At the fixed root of a gravity cantilever, the top flange/fibres are in tension.'
          ),
          qNum(
            'MOD02-T2-Q4',
            2,
            'MOD02-T2',
            'Calculate maximum bending moment under eccentric point load (Example 2.3)',
            'A 5.0 m simply supported beam carries a 20 kN point load at x = 2.0 m from the left support (R_A = 12 kN, R_B = 8 kN; Syllabus Example 2.3). Calculate the maximum bending moment M_max.',
            24,
            'kN·m',
            'Shear steps from +12 kN to -8 kN at x = 2.0 m. Thus M_max occurs at x = 2.0 m and equals R_A × 2.0 m = 12 kN × 2.0 m = 24.0 kN·m (checked from right: 8 kN × 3.0 m = 24.0 kN·m).',
            'Formula P·a·b / L = (20 × 2 × 3) / 5 = 24 kN·m.'
          ),
          qMcq(
            'MOD02-T2-Q5',
            2,
            'MOD02-T2',
            'Relate load type to SFD and BMD curve degree',
            'Over a beam span loaded by a constant downward UDL (w = constant), what are the mathematical shapes of the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD)?',
            [
              'The SFD is a sloping straight line (linear) and the BMD is a curve of second degree (parabola)',
              'Both the SFD and BMD are horizontal straight lines',
              'The SFD is a parabola and the BMD is a straight line',
              'The SFD is a step function and the BMD is triangular',
            ],
            0,
            'Integrating a constant w once gives a linear shear function V(x) = V₀ − wx; integrating a second time gives a quadratic (parabolic) moment function M(x).',
            'Under point loads only (w = 0 between loads), the SFD is piecewise constant (rectangular steps) and the BMD is piecewise linear (triangular).'
          ),
        ],
      },
      {
        id: 'MOD02-T3',
        moduleNumber: 2,
        code: '2.3',
        title: 'Deflected Shapes, Sagging/Hogging & Support Shear Checks',
        summary:
          'Connects the BMD to physical curvature, deflected shapes, points of contraflexure (M = 0), and explains why high shear near supports can govern short heavily-loaded beams even where bending moment is small.',
        subtopics: [
          'Curvature κ = M / EI: sagging curves concave up, hogging curves concave down',
          'Boundary conditions on deflected shapes: zero deflection at pins/rollers, zero deflection AND zero slope at fixed supports',
          'Points of contraflexure (inflection points where M = 0 and curvature reverses sign)',
          'Why beams need shear checks close to supports even where M approaches zero',
        ],
        learningObjectives: [
          'Sketch consistent deflected shapes matching support restraints and BMD signs.',
          'Calculate the location of a point of contraflexure in an overhanging beam.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Brohn-style qualitative deflected shape training exercises.',
          workedExamplesPlanned: 'Overhanging and continuous beam contraflexure examples.',
          calculationsPlanned: 'Support shear vs midspan bending governance transitions.',
          sourceReferencesNeeded: 'Hibbeler Structural Analysis and IStructE qualitative analysis guides.',
        },
        questions: [
          qMcq(
            'MOD02-T3-Q1',
            2,
            'MOD02-T3',
            'Enforce boundary conditions on a cantilever deflected shape',
            'When sketching the deflected shape of a horizontal cantilever fixed into a rigid wall at the left end A and loaded downward at the right tip B, what must be true of the curve at A?',
            [
              'Both the vertical displacement and the slope (rotation tangent) must be zero at the fixed wall A, curving smoothly downward to the right (hogging)',
              'The beam starts at A with an immediate downward kink (non-zero slope) like a pin support',
              'The vertical displacement is maximum at A and zero at B',
              'The top face is in compression at A',
            ],
            0,
            'A fixed support prevents both translation (y(0) = 0) and rotation (dy/dx(0) = 0), so the deflected curve must emerge horizontally from the wall before curving downward.',
            'Violating zero slope at a fixed support is one of the most common sketching mistakes.'
          ),
          qMcq(
            'MOD02-T3-Q2',
            2,
            'MOD02-T3',
            'Define a point of contraflexure on a beam',
            'What occurs physically and mathematically at a point of contraflexure along a beam?',
            [
              'The bending moment M(x) passes through zero and changes sign (from sagging to hogging or vice versa), so the curvature of the deflected shape reverses',
              'The shear force V(x) is always zero',
              'The vertical deflection δ(x) is always zero',
              'The axial force N(x) reaches its maximum value',
            ],
            0,
            'Since curvature κ = M/(EI), where M = 0 the curvature is zero and transitions between concave-up (sagging) and concave-down (hogging).',
            'Notice that deflection is generally NOT zero at a point of contraflexure.'
          ),
          qMcq(
            'MOD02-T3-Q3',
            2,
            'MOD02-T3',
            'Explain why shear checks are required near supports where moment is low (Module 2 Gate)',
            'At the pin or roller end support of a simply supported beam, the bending moment M is zero. Why must the engineer still check the beam closely at and near the support?',
            [
              'Because the shear force V is typically at its maximum at the supports, and heavy point loads located close to a support produce very large shear forces while generating only a small bending moment',
              'Because bending stress σ = M/Z becomes infinite when M = 0',
              'Because deflection is greatest at the support',
              'Because lateral torsional buckling only occurs where M = 0',
            ],
            0,
            'Shear force V and web bearing are greatest at the supports. In short-span transfer beams or where a column/needle lands close to a support, shear failure of the web or bearing failure governs well before midspan bending.',
            'Direct Module 2 Gate question.'
          ),
          qNum(
            'MOD02-T3-Q4',
            2,
            'MOD02-T3',
            'Locate where shear passes through zero under asymmetric loading',
            'A 6.0 m simply supported beam carries a full-span UDL of w = 10 kN/m plus a downward point load outside the span on a right-hand overhang such that the left support reaction at A is R_A = 22 kN. At what distance x from the left support A does the shear force V(x) pass through zero (where peak sagging moment occurs)?',
            2.2,
            'm',
            'In span AB: V(x) = R_A − w·x = 22 − 10x. Setting V(x) = 0 gives x = 22 / 10 = 2.2 m.',
            'Peak sagging moment in the span occurs at x = 2.2 m, not at midspan (3.0 m).'
          ),
          qNum(
            'MOD02-T3-Q5',
            2,
            'MOD02-T3',
            'Calculate peak sagging moment at point of zero shear',
            'For the beam in the previous question (R_A = 22 kN, w = 10 kN/m, zero shear at x = 2.2 m), calculate the maximum sagging bending moment M_max at x = 2.2 m.',
            24.2,
            'kN·m',
            'M(2.2) = R_A × 2.2 − 0.5 × w × 2.2² = (22 × 2.2) − (5 × 4.84) = 48.4 − 24.2 = 24.2 kN·m (also equal to area of shear triangle: 0.5 × 22 kN × 2.2 m = 24.2 kN·m).',
            'Demonstrates integrating the SFD triangle to find M_max.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-2.1',
        code: 'Example 2.1',
        title: 'Simply supported UDL',
        kind: 'worked_example',
        description:
          'Repeat the 6 m, 10 kN/m beam. Draw: SFD; BMD; deformed shape; tension/compression faces. Confirm: Vmax = wL/2 and Mmax = wL²/8.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 2.2 & Module 2 Assessment',
        selfReviewChecklist: [
          'Confirm Vmax = 10 × 6 / 2 = 30 kN at supports and V = 0 at midspan.',
          'Confirm Mmax = 10 × 6² / 8 = 45 kN·m sagging at midspan.',
          'Sketch linear SFD, parabolic BMD on bottom (tension) face, and sagging deflected curve.',
        ],
      },
      {
        id: 'EX-2.2',
        code: 'Example 2.2',
        title: 'Cantilever under UDL',
        kind: 'worked_example',
        description:
          'A 2 m cantilever carries 5 kN/m. Calculate: fixed-end shear; fixed-end moment; SFD; BMD; which face is in tension at the fixed end.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 2.2 & Module 2 Assessment',
        selfReviewChecklist: [
          'Calculate fixed-end shear V = 5 × 2 = 10 kN and fixed-end moment M = 5 × 2² / 2 = 10 kN·m.',
          'Sketch BMD on the top (tension) face with parabolic curve steepest at the fixed wall.',
          'State clearly that the TOP face is in tension at the fixed root.',
        ],
      },
      {
        id: 'EX-2.3',
        code: 'Example 2.3',
        title: 'Point load beam',
        kind: 'worked_example',
        description:
          'Use the 5 m beam with the 20 kN point load at 2 m from left support. Draw SFD/BMD and find the maximum moment from the diagram.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 2.2 & Module 2 Assessment',
        selfReviewChecklist: [
          'Plot SFD: +12 kN from x = 0 to 2 m, stepping down by 20 kN to -8 kN from x = 2 m to 5 m.',
          'Calculate Mmax from left shear rectangle area: 12 kN × 2 m = 24 kN·m.',
          'Check from right shear rectangle area: 8 kN × 3 m = 24 kN·m.',
        ],
      },
    ],
    resources: [
      'Hibbeler Structural Analysis: shear and bending moment chapters.',
      'Jeff Hanson: shear-force and bending-moment videos.',
      'EngineeringStatics.org.',
    ],
    standardsNotice:
      'First-principles internal mechanics module. Sign conventions follow UK practice (sagging positive, BMD plotted on tension face).',
    moduleAssessmentQuestions: [
      qNum(
        'MOD02-E01',
        2,
        'MOD02-T2',
        'Calculate maximum shear on 6 m simply supported UDL beam (Example 2.1)',
        'A 6.0 m simply supported beam carries w = 10 kN/m over its full length. Calculate the maximum shear force V_max.',
        30,
        'kN',
        'V_max = wL / 2 = (10 × 6.0) / 2 = 30 kN at the supports.',
        'Simply supported symmetric beam.'
      ),
      qNum(
        'MOD02-E02',
        2,
        'MOD02-T2',
        'Calculate maximum sagging moment on 6 m UDL beam (Example 2.1)',
        'For the 6.0 m simply supported beam carrying w = 10 kN/m, calculate the maximum sagging bending moment M_max = wL²/8.',
        45,
        'kN·m',
        'M_max = 10 × 36 / 8 = 45 kN·m at midspan.',
        'Occurs at x = 3.0 m where V = 0.'
      ),
      qNum(
        'MOD02-E03',
        2,
        'MOD02-T2',
        'Calculate fixed-end moment on 2 m cantilever under UDL (Example 2.2)',
        'A 2.0 m cantilever carries a UDL of 5.0 kN/m. Calculate the magnitude of the fixed-end bending moment.',
        10,
        'kN·m',
        'M = wL² / 2 = 5.0 × 4.0 / 2 = 10.0 kN·m hogging.',
        'Top fibres are in tension at the fixed end.'
      ),
      qNum(
        'MOD02-E04',
        2,
        'MOD02-T2',
        'Calculate maximum moment on 5 m beam with eccentric point load (Example 2.3)',
        'A 5.0 m simply supported beam carries a 20 kN point load at 2.0 m from the left support. Calculate the maximum bending moment.',
        24,
        'kN·m',
        'M_max = P·a·b / L = (20 × 2.0 × 3.0) / 5.0 = 24.0 kN·m under the point load.',
        'Triangular BMD peaking at x = 2.0 m.'
      ),
      qNum(
        'MOD02-E05',
        2,
        'MOD02-T1',
        'Calculate bending moment at quarter-span of a UDL beam',
        'An 8.0 m simply supported beam carries a UDL of w = 12 kN/m (R_A = R_B = 48 kN). Calculate the bending moment at x = 2.0 m (quarter-span).',
        72,
        'kN·m',
        'M(2.0) = R_A × 2.0 − (12 × 2.0) × 1.0 = 96 − 24 = 72 kN·m (which is 75% of the midspan moment wL²/8 = 96 kN·m).',
        'At quarter-span of a simply supported UDL beam, M is always 3/4 of M_max because the parabola is fuller than a triangle.'
      ),
      qNum(
        'MOD02-E06',
        2,
        'MOD02-T2',
        'Calculate midspan moment under combined UDL and central point load',
        'A 4.0 m simply supported beam carries a full-span UDL of w = 6.0 kN/m and a central point load P = 16 kN at midspan (x = 2.0 m). Calculate the total maximum bending moment at midspan.',
        28,
        'kN·m',
        'By superposition at midspan: M_max = (wL² / 8) + (PL / 4) = (6.0 × 16 / 8) + (16 × 4.0 / 4) = 12 + 16 = 28 kN·m.',
        'Both peak moments occur at x = 2.0 m so they add directly.'
      ),
      qNum(
        'MOD02-E07',
        2,
        'MOD02-T2',
        'Calculate constant bending moment in a symmetric four-point bending beam',
        'A 6.0 m simply supported beam carries two equal downward point loads of 15 kN each, located at x = 2.0 m and x = 4.0 m from the left support (ignoring self-weight). What is the constant bending moment throughout the central third (from x = 2.0 m to x = 4.0 m)?',
        30,
        'kN·m',
        'By symmetry R_A = R_B = 15 kN. Between x = 2.0 m and 4.0 m, shear V = 15 − 15 = 0, and M = 15 kN × 2.0 m = 30 kN·m constant.',
        'Pure bending region with zero shear.'
      ),
      qNum(
        'MOD02-E08',
        2,
        'MOD02-T2',
        'Calculate hogging moment over the support of a beam with an overhang',
        'A beam is simply supported at A (x = 0 m) and B (x = 6.0 m) and overhangs by 2.0 m to a free tip C (x = 8.0 m). The overhang BC carries a UDL of 10 kN/m and a tip point load of 15 kN at C. Calculate the magnitude of the hogging bending moment directly over support B.',
        50,
        'kN·m',
        'Cutting just to the right of support B and using the right-hand overhang free body (length 2.0 m): M_B = (10 kN/m × 2.0 m × 1.0 m) + (15 kN × 2.0 m) = 20 + 30 = 50 kN·m hogging.',
        'Evaluating M_B from the overhang free body does not even require solving for R_A and R_B first!'
      ),
      qNum(
        'MOD02-E09',
        2,
        'MOD02-T3',
        'Locate point of contraflexure in a beam with an overhanging tip load',
        'A beam is supported at A (x = 0 m) and B (x = 4.0 m) with an overhang to C (x = 6.0 m). Span AB carries a UDL of w = 10 kN/m (so R_A = 15 kN upward), and the overhang carries a tip load such that M(x) in span AB is M(x) = 15x − 5x². At what non-zero position x in span AB is the point of contraflexure (M = 0)?',
        3,
        'm',
        'Setting M(x) = 15x − 5x² = 0 gives 5x(3 − x) = 0 => x = 3.0 m. For 0 < x < 3.0 m the beam is in sagging; for 3.0 m < x ≤ 6.0 m the beam is in hogging.',
        'At x = 3.0 m the bending moment crosses zero.'
      ),
      qNum(
        'MOD02-E10',
        2,
        'MOD02-T1',
        'Calculate internal axial force in a horizontal beam with an inclined load',
        'A simply supported beam has a pin at the left end A and a horizontal roller at the right end B (span 4.0 m). A load Applied at midspan C (x = 2.0 m) has a downward vertical component of 20 kN and a rightward horizontal component of 14 kN. What is the internal axial tension force N in segment AC (between the pin A and midspan C)?',
        14,
        'kN',
        'Pin A resists 14 kN horizontally to the left. Cutting anywhere between A and C gives N = +14 kN (axial tension), while segment CB has N = 0 because the roller at B offers no horizontal restraint.',
        'Highlights why axial force changes at the point of application of a horizontal load.'
      ),
      qMcq(
        'MOD02-E11',
        2,
        'MOD02-T1',
        'Identify which face is in tension at the root of a cantilever (Example 2.2)',
        'A balcony cantilever beam projects from a building core and supports downward gravity loading. Which face of the cantilever experiences tension?',
        [
          'The top face throughout the cantilever length',
          'The bottom face throughout the cantilever length',
          'The top face at the free tip and the bottom face at the fixed support',
          'Neither face; a cantilever carries load purely by axial compression',
        ],
        0,
        'Downward gravity loads on a cantilever produce hogging bending throughout its length, curving the beam concave downwards and stretching the top fibres in tension.',
        'In reinforced concrete cantilevers, placing the main bars in the bottom instead of the top is a classic catastrophic detailing error.'
      ),
      qMcq(
        'MOD02-E12',
        2,
        'MOD02-T2',
        'Understand the effect of a concentrated downward point load on the SFD and BMD',
        'At the exact x-location where a downward concentrated point load P acts on a beam (with no support at that point), how do the SFD and BMD behave?',
        [
          'The SFD has a sudden vertical downward step of magnitude P, and the BMD has a sharp corner (change of slope) of Δ(dM/dx) = −P',
          'The BMD has a sudden vertical jump of magnitude P',
          'The SFD is zero and the BMD is zero',
          'Both the SFD and BMD remain smooth with continuous slope',
        ],
        0,
        'Because dM/dx = V, a step discontinuity of −P in the shear force V produces a sudden change in slope (kink/cusp) in the bending moment diagram.',
        'A vertical jump in the BMD only occurs where an external concentrated moment (couple) is applied.'
      ),
      qMcq(
        'MOD02-E13',
        2,
        'MOD02-T2',
        'Understand the effect of an applied concentrated couple on the SFD and BMD',
        'A horizontal beam has a bracket welded at midspan that applies a pure concentrated clockwise moment M₀ (with zero vertical force). How does this affect the SFD and BMD at midspan?',
        [
          'The BMD experiences an abrupt vertical step jump of magnitude M₀ at midspan, while the SFD has no step at midspan',
          'The SFD experiences a vertical step jump of M₀ at midspan',
          'Neither diagram is affected',
          'The bending moment becomes zero everywhere',
        ],
        0,
        'An applied concentrated couple enters moment equilibrium directly at the section cut, causing a vertical discontinuity of M₀ in the BMD without changing the shear force V.',
        'Useful when analysing column brackets or eccentric connections.'
      ),
      qMcq(
        'MOD02-E14',
        2,
        'MOD02-T3',
        'Predict when a heavy point load near a support governs in shear rather than bending',
        'A transfer beam of span L = 6.0 m carries a heavy column point load P = 600 kN located only a = 0.4 m away from the left support A. Which statement accurately describes the internal actions?',
        [
          'The left segment experiences a massive shear force V = 560 kN (93% of P), whereas the bending moment is relatively modest (M = 224 kN·m compared to 900 kN·m if P were at midspan), so web shear and support bearing are highly likely to govern',
          'The shear force in the left segment is near zero while bending moment is at its maximum possible value',
          'Both reactions are equal to 300 kN',
          'Shear checks are unnecessary because the load is close to the support',
        ],
        0,
        'R_A = P(L−a)/L = 600 × 5.6 / 6.0 = 560 kN, and M = 560 × 0.4 = 224 kN·m. Moving a heavy load close to a support reduces M but drives V toward P.',
        'Directly tests the final item of the Module 2 Learning Gate.'
      ),
      qMcq(
        'MOD02-E15',
        2,
        'MOD02-T3',
        'Identify tension face in an upward-loaded foundation ground beam',
        'A reinforced concrete ground beam spans between two pile caps and resists an upward net soil bearing pressure from below. In the midspan region between the piles, which face of the ground beam is in tension?',
        [
          'The top face (because upward distributed pressure between end supports bends the beam upward into hogging)',
          'The bottom face (because midspan is always in bottom tension regardless of load direction)',
          'Neither face',
          'Only the vertical web is in tension',
        ],
        0,
        'Upward pressure between end supports pushes the midspan upward (concave down = hogging), putting the top face in tension at midspan.',
        'Never memorise "bottom = tension at midspan" without checking the direction of the applied load and deflected shape!'
      ),
      qNum(
        'MOD02-E16',
        2,
        'MOD02-T2',
        'Compare maximum moment of a UDL vs an equal total point load at midspan',
        'A beam of span L carries a total load W = 40 kN over span L = 4.0 m. Calculate the ratio of the maximum bending moment if W is applied as a single central point load (WL/4) divided by the maximum bending moment if W is spread as a uniform UDL (WL/8).',
        2,
        'ratio',
        'Central point load M_max = WL/4 = 40 × 4 / 4 = 40 kN·m. Uniform UDL M_max = wL²/8 = WL/8 = 40 × 4 / 8 = 20 kN·m. Ratio = 40 / 20 = 2.0.',
        'Concentrating the same total load at midspan doubles the peak bending moment.'
      ),
      qNum(
        'MOD02-E17',
        2,
        'MOD02-T2',
        'Calculate shear force at midspan of an asymmetrically loaded beam',
        'A 4.0 m simply supported beam carries a single point load of 20 kN at x = 1.0 m from the left support A (so R_A = 15 kN and R_B = 5 kN). What is the internal shear force V at midspan (x = 2.0 m)?',
        -5,
        'kN',
        'For any section x > 1.0 m, V(x) = R_A − 20 = 15 − 20 = −5 kN.',
        'Notice V is non-zero at midspan because the loading is not symmetric.'
      ),
      qNum(
        'MOD02-E18',
        2,
        'MOD02-T2',
        'Calculate bending moment at midspan of an asymmetrically loaded beam',
        'For the same 4.0 m simply supported beam carrying 20 kN at x = 1.0 m (R_A = 15 kN, R_B = 5 kN), what is the bending moment at midspan (x = 2.0 m), and is it the maximum moment in the beam? Enter the numerical value at x = 2.0 m.',
        10,
        'kN·m',
        'From the right free body of length 2.0 m: M(2.0) = R_B × 2.0 = 5 × 2.0 = 10 kN·m. Note that the maximum moment is actually at x = 1.0 m (M_max = 15 × 1.0 = 15 kN·m), NOT at midspan!',
        'Maximum moment occurs where shear changes sign (x = 1.0 m), not necessarily at midspan.'
      ),
      qMcq(
        'MOD02-E19',
        2,
        'MOD02-T3',
        'Identify correct BMD and deflected shape for a propped cantilever',
        'A propped cantilever is fixed at the left end A, supported on a vertical roller at the right end B, and carries a downward UDL over its span. Which description matches its BMD and deflected shape?',
        [
          'Hogging moment (top tension) and zero slope at the fixed end A, a point of contraflexure (M = 0) within the span, sagging moment (bottom tension) in the right portion, and zero moment at roller B',
          'Sagging moment throughout the entire span with zero moment at both A and B',
          'Hogging moment throughout the entire span with maximum moment at roller B',
          'Zero shear at the fixed support A',
        ],
        0,
        'The fixed support A clamps rotation (hogging moment at A), while the simple roller at B has M_B = 0, so the moment transitions from hogging near A through a point of contraflexure to sagging in the span.',
        'Classic bridge to indeterminate behaviour.'
      ),
      qMcq(
        'MOD02-E20',
        2,
        'MOD02-T1',
        'Identify physical action of shear in a beam',
        'How does internal shear force V act physically on an element of a beam, and what accompanies vertical shear on a tiny square element to maintain rotational equilibrium?',
        [
          'Shear tries to slide adjacent cross-sections past one another vertically, and must be accompanied by equal complementary horizontal (longitudinal) shear stresses along horizontal planes',
          'Shear pulls the entire cross-section uniformly apart along its longitudinal axis',
          'Shear acts only at the extreme top and bottom fibres and is zero at the neutral axis',
          'Shear causes pure curvature without any sliding tendency',
        ],
        0,
        'By complementary shear (τ_xy = τ_yx), vertical shear across a cross-section is always accompanied by horizontal longitudinal shear (which is why horizontally stacked unglued timber planks slip relative to each other under bending).',
        'Fundamental physical understanding of shear.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 3: STRESS, STRAIN, STIFFNESS AND MATERIAL BEHAVIOUR               */
  /* ======================================================================== */
  {
    moduleNumber: 3,
    code: 'MOD-03',
    title: 'Module 3: Stress, strain, stiffness and material behaviour',
    shortTitle: 'Stress, strain, stiffness and material behaviour',
    suggestedDuration: '6–8 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 5–6',
    whyItMatters:
      'Internal forces must be normalised by cross-sectional geometry into stresses and strains so we can compare them against material properties (E, G, fy) and understand how steel, concrete, timber, and masonry behave and fail.',
    introduction:
      'Introduces axial normal stress (σ = F/A), normal strain (ε = ΔL/L), stress–strain curves (elastic range, yield plateau, strain hardening, ultimate strength, fracture), axial deformation (ΔL = PL/AE), Young’s modulus E, shear modulus G, Poisson’s ratio ν, and comparative material behaviour across structural steel, reinforced concrete, timber, and masonry.',
    objectives: [
      'Calculate axial normal stress, normal strain, and elastic extension (Examples 3.1 and 3.2).',
      'Distinguish material stiffness (E, G) from material strength (fy, fu) and ductility from brittleness.',
      'Explain why concrete needs tensile reinforcement, why steel can buckle before crushing, and why timber depends on grain direction and moisture.',
    ],
    learningGate: [
      'Calculate stress, strain, and extension accurately in consistent metric units.',
      'Distinguish strength from stiffness clearly.',
      'Explain the physical meaning of Young’s modulus E and shear modulus G.',
      'Explain yielding versus brittle fracture.',
      'Explain why a steel member’s material strength does not guarantee its compression stability.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2],
    topics: [
      {
        id: 'MOD03-T1',
        moduleNumber: 3,
        code: '3.1',
        title: 'Normal Stress, Axial Strain & Stress-Strain Curves',
        summary:
          'Covers normal stress σ = F/A, axial strain ε = ΔL/L, Hooke’s law σ = Eε, and key features of ductile vs brittle stress–strain curves (elastic limit, yield, plastic plateau, ultimate strength, fracture).',
        subtopics: [
          'Normal stress σ = F / A (N/mm² = MPa) and uniform stress assumption away from load concentrations',
          'Normal strain ε = ΔL / L (dimensionless or microstrain)',
          'Stress–strain curve of structural carbon steel: linear elastic region, yield strength fy, plastic plateau, strain hardening, ultimate strength fu, necking and fracture',
          'Yielding (ductile warning with large deformation) versus brittle fracture (sudden cleavage with minimal deformation)',
        ],
        learningObjectives: [
          'Calculate normal stress and strain for axial ties and struts (Syllabus Example 3.1).',
          'Interpret stress–strain curves and explain why ductility is vital for structural safety.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Comparison of hot-rolled vs cold-formed steel stress-strain curves (0.2% proof stress).',
          workedExamplesPlanned: 'Example 3.1 full step-by-step calculation note.',
          calculationsPlanned: 'Net section tension stress at bolt holes vs gross section yield.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials: axial loading and stress/strain.',
        },
        questions: [
          qNum(
            'MOD03-T1-Q1',
            3,
            'MOD03-T1',
            'Calculate normal stress in a steel tie (Example 3.1)',
            'A steel tie of length L = 3,000 mm and cross-sectional area A = 1,000 mm² carries an axial tension force of F = 100 kN (Syllabus Example 3.1). Calculate the normal tensile stress σ in N/mm².',
            100,
            'N/mm²',
            'F = 100 kN = 100,000 N. σ = F / A = 100,000 N / 1,000 mm² = 100 N/mm² (100 MPa).',
            'Assumes concentric axial load and uniform stress over the cross-section.'
          ),
          qNum(
            'MOD03-T1-Q2',
            3,
            'MOD03-T1',
            'Calculate axial strain in a steel tie (Example 3.1)',
            'For the steel tie in Syllabus Example 3.1 (σ = 100 N/mm² and E = 200,000 N/mm²), calculate the axial strain ε (as a dimensionless decimal, or enter in units of 10⁻³). Enter the value of ε × 1,000 (in mm/m).',
            0.5,
            'mm/m',
            'ε = σ / E = 100 / 200,000 = 0.0005 (dimensionless) = 0.5 × 10⁻³ = 0.5 mm/m.',
            '1 mm/m = 10⁻³ strain.'
          ),
          qNum(
            'MOD03-T1-Q3',
            3,
            'MOD03-T1',
            'Calculate axial extension of a steel tie (Example 3.1)',
            'For the 3,000 mm long steel tie in Syllabus Example 3.1 (F = 100 kN, A = 1,000 mm², E = 200,000 N/mm²), calculate the elastic extension ΔL in mm.',
            1.5,
            'mm',
            'ΔL = PL / (AE) = (100,000 N × 3,000 mm) / (1,000 mm² × 200,000 N/mm²) = 300,000,000 / 200,000,000 = 1.5 mm.',
            'Valid because σ = 100 N/mm² is well below the yield strength of structural steel.'
          ),
          qMcq(
            'MOD03-T1-Q4',
            3,
            'MOD03-T1',
            'Distinguish yielding from fracture',
            'What is the fundamental physical difference between yielding and fracture in a structural material?',
            [
              'Yielding is the onset of permanent plastic deformation at constant or near-constant stress without the material separating, whereas fracture is the physical separation/rupture of the material into pieces',
              'Yielding only happens in brittle materials like glass and cast iron',
              'Yielding means the member returns to its original length upon unloading',
              'Fracture always occurs at a stress lower than the proportional limit',
            ],
            0,
            'Ductile yielding allows stress redistribution and gives visible deformation warning before collapse, whereas brittle fracture is sudden and catastrophic.',
            'Core Module 3 Gate requirement.'
          ),
          qMcq(
            'MOD03-T1-Q5',
            3,
            'MOD03-T1',
            'Understand elastic vs plastic unloading behaviour',
            'If a mild steel bar is loaded beyond its yield strength fy into its plastic plateau and then the load is completely removed, what happens to its length?',
            [
              'It unloads parallel to the initial elastic slope E, recovering the elastic strain component but retaining a permanent plastic extension (permanent set)',
              'It returns to its exact original unstretched length',
              'It continues to stretch further after the load is removed',
              'Its Young’s modulus E drops to zero during unloading',
            ],
            0,
            'Elastic strain (σ/E) is recovered upon unloading, while plastic slip of crystal planes remains as permanent set.',
            'Fundamental elastoplastic mechanics.'
          ),
        ],
      },
      {
        id: 'MOD03-T2',
        moduleNumber: 3,
        code: '3.2',
        title: 'Stiffness, Young’s Modulus E, Shear Modulus G & Poisson’s Ratio',
        summary:
          'Covers axial deformation ΔL = PL/AE, comparing steel vs aluminium extensions (Example 3.2), shear stress and shear modulus G = τ/γ, Poisson’s ratio ν, and the isotropic relationship E = 2G(1 + ν).',
        subtopics: [
          'Axial deformation formula ΔL = PL / (AE) and axial stiffness AE / L',
          'Syllabus Example 3.2: comparing steel (E ≈ 210 GPa) vs aluminium (E ≈ 70 GPa) bars of identical geometry and load',
          'Shear stress τ and engineering shear strain γ: Hooke’s law in shear τ = Gγ',
          'Poisson’s ratio ν = -ε_lateral / ε_axial',
          'Isotropic elastic relationship: E = 2G(1 + ν)',
        ],
        learningObjectives: [
          'Compare axial deformations of different materials (Example 3.2) and explain E vs G.',
          'Apply the isotropic relationship E = 2G(1 + ν) accurately.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Physical visualisation of shear deformation γ vs axial strain ε.',
          workedExamplesPlanned: 'Example 3.2 comparative stiffness calculation note.',
          calculationsPlanned: 'Stepped bar and thermal restraint axial stress problems.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials and Jeff Hanson videos.',
        },
        questions: [
          qNum(
            'MOD03-T2-Q1',
            3,
            'MOD03-T2',
            'Compare extensions of steel and aluminium bars (Example 3.2)',
            'Two bars have the exact same cross-sectional area, length, and applied tension force (Syllabus Example 3.2). One is structural steel (E_steel = 210 GPa) and one is aluminium alloy (E_alu = 70 GPa). If the steel bar extends by 1.2 mm, by how many mm does the aluminium bar extend (assuming both remain elastic)?',
            3.6,
            'mm',
            'Since ΔL = PL/(AE) is inversely proportional to E, and E_steel / E_alu = 210 / 70 = 3.0, the aluminium bar extends 3 times as much: 3 × 1.2 mm = 3.6 mm.',
            'Notice that both bars carry the exact same stress σ = P/A, yet the aluminium bar has 3 times the strain and extension.'
          ),
          qNum(
            'MOD03-T2-Q2',
            3,
            'MOD03-T2',
            'Calculate shear modulus G from E and Poisson’s ratio ν',
            'An isotropic structural steel has Young’s modulus E = 210,000 N/mm² and Poisson’s ratio ν = 0.30. Using E = 2G(1 + ν), calculate the shear modulus G in N/mm² (to the nearest 100 N/mm²).',
            80800,
            'N/mm²',
            'G = E / [2(1 + ν)] = 210,000 / (2 × 1.30) = 210,000 / 2.60 = 80,769 N/mm² ≈ 80,800 N/mm² (EN 1993-1-1 rounds this to 81,000 N/mm²).',
            'Only valid for isotropic materials (not valid for timber, which is orthotropic).'
          ),
          qMcq(
            'MOD03-T2-Q3',
            3,
            'MOD03-T2',
            'Explain physical meaning of E and G (Module 3 Gate)',
            'What do Young’s modulus E and shear modulus G physically measure?',
            [
              'E measures material stiffness under direct normal stress (resistance to axial stretching/shortening), while G measures material stiffness under shear stress (resistance to angular distortion/sliding of planes)',
              'E measures ultimate tensile strength and G measures gravitational acceleration',
              'E applies only to steel and G applies only to concrete',
              'E and G both measure plastic hinge capacity',
            ],
            0,
            'E = σ/ε relates normal stress to axial strain, whereas G = τ/γ relates shear stress to angular shear strain.',
            'Module 3 Gate requirement.'
          ),
          qNum(
            'MOD03-T2-Q4',
            3,
            'MOD03-T2',
            'Calculate lateral contraction using Poisson’s ratio',
            'A steel plate of width b = 200 mm is subjected to an axial tensile strain of ε_axial = +0.0010 (1,000 microstrain) along its length. If Poisson’s ratio is ν = 0.30 and the plate is unrestrained laterally, by how many mm does its 200 mm width contract?',
            0.06,
            'mm',
            'ε_lat = −ν × ε_axial = −0.30 × 0.0010 = −0.0003. Width change Δb = 200 mm × 0.0003 = 0.06 mm contraction.',
            'Axial tension causes lateral contraction; axial compression causes lateral expansion.'
          ),
          qMcq(
            'MOD03-T2-Q5',
            3,
            'MOD03-T2',
            'Understand effect of steel grade on Young’s modulus E',
            'An engineer changes a steel tie from grade S275 to high-strength grade S460 without changing the cross-sectional area A or length L. How does this change the elastic extension ΔL under a working service load P?',
            [
              'It does not change the elastic extension at all, because all structural carbon steel grades have essentially the same Young’s modulus E (≈ 210,000 N/mm²)',
              'The elastic extension reduces by the ratio 275 / 460',
              'The elastic extension increases by the ratio 460 / 275',
              'The axial stress P/A reduces by 40%',
            ],
            0,
            'Higher steel grade increases yield strength fy (allowing higher load before yielding), but Young’s modulus E is an atomic-bond stiffness property that remains ~210 GPa across S235, S275, S355, and S460.',
            'Crucial concept across Modules 3, 4, and 5.'
          ),
        ],
      },
      {
        id: 'MOD03-T3',
        moduleNumber: 3,
        code: '3.3',
        title: 'Structural Materials: Steel, Concrete, Timber & Masonry Behaviour',
        summary:
          'Compares mechanical behaviour across the four primary structural materials (Syllabus Example 3.3): why concrete excels in compression but cracks in tension, why steel can buckle in compression, why timber is anisotropic and moisture-sensitive, and intro awareness of creep, shrinkage, and fatigue.',
        subtopics: [
          'Structural steel: isotropic, high E, high equal tensile/compressive yield strength, ductile, slender sections prone to buckling',
          'Reinforced concrete: strong in compression, weak/brittle in tension (~10% of compressive strength), requires steel reinforcement; creep and drying shrinkage',
          'Timber: anisotropic/orthotropic cellular structure (strong parallel to grain, weak perpendicular to grain), moisture and load-duration sensitive',
          'Masonry: composite of units and mortar; compression-dominated with very low tensile strength',
          'Introductory awareness of creep (long-term deformation under sustained stress), shrinkage, and fatigue (cyclic stress cracking)',
        ],
        learningObjectives: [
          'Answer all four questions in Syllabus Example 3.3 clearly and accurately.',
          'Explain why a steel member’s material strength does not guarantee its stability in compression.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Microstructure and failure appearance guide for steel, RC, timber, and masonry.',
          workedExamplesPlanned: 'Example 3.3 structured half-page comparison note.',
          calculationsPlanned: 'Long-term effective modulus of concrete under creep.',
          sourceReferencesNeeded: 'Concrete Centre and Wood Campus introductory material resources.',
        },
        questions: [
          qMcq(
            'MOD03-T3-Q1',
            3,
            'MOD03-T3',
            'Explain why reinforced concrete needs steel reinforcement (Example 3.3)',
            'Why is plain unreinforced concrete unsuitable for beams and suspended slabs without steel reinforcement?',
            [
              'Concrete has high compressive strength but very low, unreliable, and brittle tensile strength (roughly one-tenth of its compressive strength), so steel bars are required to carry tensile forces after the concrete cracks',
              'Concrete has zero compressive strength and relies on steel for all compression',
              'Steel reinforcement increases the Young’s modulus of concrete by a factor of 100 before cracking',
              'Concrete only works in tension and crushes immediately under small compression',
            ],
            0,
            'In reinforced concrete, compression is resisted primarily by the concrete and tension is carried by the bonded steel reinforcement.',
            'Syllabus Example 3.3 core principle.'
          ),
          qMcq(
            'MOD03-T3-Q2',
            3,
            'MOD03-T3',
            'Explain why a steel member’s strength does not guarantee its stability (Module 3 Gate)',
            'Structural steel has equally high yield strength in compression and tension. Why does a steel column or compression flange often fail at an average compressive stress far below its material yield strength f_y?',
            [
              'Because steel’s high strength allows members to be rolled into thin, slender walls and profiles, which bow sideways or twist out of plane by elastic/inelastic buckling before material crushing/yielding is reached',
              'Because steel has a lower Young’s modulus in compression than in tension',
              'Because steel dissolves under compressive stress',
              'Because Hooke’s law does not apply to compression',
            ],
            0,
            'Buckling is a geometric stability failure governed by stiffness (EI) and slenderness (L_cr / i), not purely by material yield strength f_y.',
            'Direct Module 3 Gate and Example 3.3 question.'
          ),
          qMcq(
            'MOD03-T3-Q3',
            3,
            'MOD03-T3',
            'Explain why timber properties vary with grain direction and moisture (Example 3.3)',
            'Why do the strength and stiffness of structural timber depend strongly on the angle of load relative to the grain and on the moisture content?',
            [
              'Timber is an anisotropic natural material made of tubular cellulose fibres aligned along the trunk (strong parallel to grain, easily crushed or split perpendicular to grain), and water absorbed in the cell walls plasticises and weakens the fibres',
              'Timber is a homogeneous isotropic crystal whose density doubles when dry',
              'Timber is stronger perpendicular to the grain than parallel to the grain',
              'Moisture only affects the colour of timber and never alters its stiffness or creep',
            ],
            0,
            'Loading timber parallel to the longitudinal wood fibres engages strong axial tracheid/fibre walls, whereas loading perpendicular to the grain crushes hollow cell tubes sideways.',
            'Syllabus Example 3.3 and foundation for Module 10 (EC5).'
          ),
          qMcq(
            'MOD03-T3-Q4',
            3,
            'MOD03-T3',
            'Distinguish creep from shrinkage in concrete and timber',
            'What is the difference between creep and drying shrinkage in structural concrete?',
            [
              'Creep is the gradual increase in strain over time under a sustained mechanical stress, whereas drying shrinkage is the volume reduction caused by moisture loss that occurs even at zero applied load',
              'Creep occurs instantaneously on loading, whereas shrinkage only occurs in steel',
              'Creep requires cyclic fatigue loading, whereas shrinkage requires freezing temperatures',
              'Creep and shrinkage are two names for elastic Hookean strain',
            ],
            0,
            'Both are time-dependent deformations, but creep is stress-driven (increasing long-term beam deflection under permanent load) while shrinkage is moisture/hydration-driven (causing restraint cracking).',
            'Introductory awareness required in Module 3.'
          ),
          qMcq(
            'MOD03-T3-Q5',
            3,
            'MOD03-T3',
            'Identify why unreinforced masonry is compression-dominated',
            'Why are traditional unreinforced masonry walls and arches proportioned to carry loads primarily in compression and avoid net tension?',
            [
              'Because the mortar bed joints and brick-to-mortar bond have very low and variable tensile strength, so net tensile stresses cause cracking or joint opening',
              'Because clay bricks have higher tensile strength than structural steel',
              'Because mortar cannot transmit compressive forces',
              'Because masonry has a Poisson’s ratio greater than 1.0',
            ],
            0,
            'Masonry acts as a compression-dominated assemblage; tensile flexural capacity across bed joints is very small and cannot be relied upon for primary tension.',
            'Foundation for Module 11.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-3.1',
        code: 'Example 3.1',
        title: 'Steel tie',
        kind: 'worked_example',
        description:
          'A steel tie: length 3,000 mm; area 1,000 mm²; tension force 100 kN; E = 200,000 N/mm². Calculate: stress; strain; extension.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 3.1 & Module 3 Assessment',
        selfReviewChecklist: [
          'Compute σ = 100,000 / 1,000 = 100 N/mm².',
          'Compute ε = 100 / 200,000 = 0.0005.',
          'Compute ΔL = 0.0005 × 3,000 = 1.5 mm.',
        ],
      },
      {
        id: 'EX-3.2',
        code: 'Example 3.2',
        title: 'Steel versus aluminium stiffness',
        kind: 'worked_example',
        description:
          'Two bars have the same area, length, and applied force. One is steel and one is aluminium. Calculate/compare extensions using representative Young’s moduli.',
        requiresCalcNote: false,
        statusLabel: 'Covered in Topic 3.2 & Module 3 Assessment',
        selfReviewChecklist: [
          'Using E_steel ≈ 210 GPa and E_alu ≈ 70 GPa, confirm ΔL_alu ≈ 3 × ΔL_steel.',
          'Note that normal stress σ = P/A is identical in both bars.',
        ],
      },
      {
        id: 'EX-3.3',
        code: 'Example 3.3',
        title: 'Material comparison note',
        kind: 'practical_exercise',
        description:
          'Write half a page explaining: why concrete works well in compression; why RC needs reinforcement; why steel may fail by buckling rather than material crushing; why timber properties vary with grain direction and moisture.',
        requiresCalcNote: true,
        statusLabel: 'Self-Review / Independent Review Practice Activity',
        selfReviewChecklist: [
          'Explain concrete compressive strength vs brittle low tensile strength.',
          'Explain steel slenderness and geometric buckling vs squash yield.',
          'Explain timber cellular anisotropy (parallel vs perpendicular to grain) and moisture effect.',
        ],
      },
    ],
    resources: [
      'Hibbeler Mechanics of Materials: axial loading and stress/strain.',
      'Jeff Hanson: Mechanics of Materials.',
      'Concrete Centre introductory RC resources.',
      'Wood Campus introductory timber material resources.',
    ],
    standardsNotice:
      'First-principles materials module. Representative moduli (e.g. E = 200,000 or 210,000 N/mm²) are used as stated in each problem; real design must use values from EN 1992, EN 1993, EN 1995, and EN 1996.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD03-E01',
        3,
        'MOD03-T1',
        'Calculate normal stress in steel tie (Example 3.1)',
        'A steel tie of area A = 1,000 mm² and length L = 3,000 mm carries a tension force of 100 kN. What is the normal stress σ in N/mm²?',
        100,
        'N/mm²',
        'σ = 100,000 N / 1,000 mm² = 100 N/mm².',
        'Uniform axial tension.'
      ),
      qNum(
        'MOD03-E02',
        3,
        'MOD03-T1',
        'Calculate elastic extension in steel tie (Example 3.1)',
        'For the steel tie of length 3,000 mm, area 1,000 mm², force 100 kN, and E = 200,000 N/mm², what is the elastic extension ΔL in mm?',
        1.5,
        'mm',
        'ΔL = PL / (AE) = (100,000 × 3,000) / (1,000 × 200,000) = 1.5 mm.',
        'Hooke’s law applies in the linear elastic range.'
      ),
      qNum(
        'MOD03-E03',
        3,
        'MOD03-T1',
        'Calculate axial compressive stress in a short concrete column',
        'A short plain concrete pier of cross-sectional dimensions 300 mm × 400 mm carries a concentric axial compression load of 1,440 kN. Calculate the uniform compressive stress in N/mm².',
        12,
        'N/mm²',
        'Area A = 300 × 400 = 120,000 mm². Stress σ = 1,440,000 N / 120,000 mm² = 12.0 N/mm².',
        'Assumes concentric load and short column (no buckling).'
      ),
      qNum(
        'MOD03-E04',
        3,
        'MOD03-T2',
        'Calculate required cross-sectional area to limit axial extension',
        'A 4,200 mm long steel hanger rod (E = 210,000 N/mm²) supports a service tension load of 150 kN. If the elastic extension ΔL must not exceed 2.0 mm, what minimum cross-sectional area A (in mm²) is required?',
        1500,
        'mm²',
        'Rearranging ΔL = PL / (AE) gives A = PL / (E × ΔL) = (150,000 × 4,200) / (210,000 × 2.0) = 630,000,000 / 420,000 = 1,500 mm².',
        'Check stress: σ = 150,000 / 1,500 = 100 N/mm² (stiffness governs here rather than yield strength).'
      ),
      qNum(
        'MOD03-E05',
        3,
        'MOD03-T2',
        'Compare extensions of steel and aluminium bars (Example 3.2)',
        'A steel tie (E = 210 GPa) and an aluminium tie (E = 70 GPa) have identical length, area, and axial load. What is the ratio of the aluminium extension to the steel extension (ΔL_alu / ΔL_steel)?',
        3,
        'ratio',
        'ΔL_alu / ΔL_steel = E_steel / E_alu = 210 / 70 = 3.0.',
        'Both remain within their linear elastic limits.'
      ),
      qNum(
        'MOD03-E06',
        3,
        'MOD03-T2',
        'Calculate average shear stress in a single-shear bolt',
        'A steel fin-plate connection transfers a vertical shear load of 90 kN through 3 identical bolts in single shear. If each bolt has a shear plane cross-sectional area of 245 mm², calculate the average shear stress τ in each bolt in N/mm².',
        122.45,
        'N/mm²',
        'Total shear area = 3 × 245 = 735 mm². Average shear stress τ = 90,000 N / 735 mm² = 122.449 N/mm² ≈ 122.45 N/mm².',
        'Assumes equal load sharing between the three bolts.'
      ),
      qNum(
        'MOD03-E07',
        3,
        'MOD03-T2',
        'Calculate average shear stress in a double-shear clevis pin',
        'A lifting shackle pin of diameter 20 mm (cross-sectional area A = 314.16 mm²) carries a sling force of 125.66 kN in DOUBLE shear (two shear planes). Calculate the average shear stress τ on the pin in N/mm².',
        200,
        'N/mm²',
        'In double shear, two cross-sections resist the force: Total shear area = 2 × 314.16 = 628.32 mm². τ = 125,660 N / 628.32 mm² = 200.0 N/mm².',
        'Double shear halves the average shear stress compared to single shear.'
      ),
      qNum(
        'MOD03-E08',
        3,
        'MOD03-T2',
        'Calculate shear strain from shear stress and shear modulus G',
        'An elastomeric bridge bearing pad of shear modulus G = 1.0 N/mm² is subjected to a horizontal shear stress of τ = 0.25 N/mm². What is the engineering shear strain γ (in radians)?',
        0.25,
        'rad',
        'γ = τ / G = 0.25 / 1.0 = 0.25 rad.',
        'If the rubber layer thickness is 40 mm, horizontal deflection is γ × t = 0.25 × 40 = 10 mm.'
      ),
      qNum(
        'MOD03-E09',
        3,
        'MOD03-T2',
        'Calculate Young’s modulus E from G and Poisson’s ratio ν',
        'An isotropic material has a shear modulus G = 80 GPa and Poisson’s ratio ν = 0.25. Using E = 2G(1 + ν), calculate its Young’s modulus E in GPa.',
        200,
        'GPa',
        'E = 2 × 80 × (1 + 0.25) = 160 × 1.25 = 200 GPa.',
        'Isotropic elasticity identity.'
      ),
      qNum(
        'MOD03-E10',
        3,
        'MOD03-T1',
        'Calculate axial shortening of a tubular temporary works prop',
        'A 3.5 m long steel tubular prop of cross-sectional area A = 1,400 mm² and E = 210,000 N/mm² carries an axial service compression load of 84 kN. Calculate its elastic axial shortening ΔL in mm.',
        1,
        'mm',
        'ΔL = PL / (AE) = (84,000 × 3,500) / (1,400 × 210,000) = 294,000,000 / 294,000,000 = 1.0 mm.',
        'Elastic axial shortening before any second-order bowing.'
      ),
      qMcq(
        'MOD03-E11',
        3,
        'MOD03-T1',
        'Distinguish stress vs internal force',
        'Two steel ties carry the exact same axial tension force of 150 kN. Tie A has area 1,000 mm² and Tie B has area 2,000 mm². Which statement is true?',
        [
          'Both ties carry the same internal force (150 kN), but Tie A experiences twice the normal stress (150 N/mm² vs 75 N/mm²) and twice the axial strain of Tie B',
          'Tie B experiences twice the normal stress because it has twice the area',
          'Both ties experience the same normal stress because the applied force is equal',
          'Tie A has twice the Young’s modulus of Tie B',
        ],
        0,
        'Internal force F is the total resultant (kN), whereas stress σ = F/A is force intensity per unit area (N/mm²).',
        'Why it matters: material yielding depends on stress σ, not total force F alone.'
      ),
      qMcq(
        'MOD03-E12',
        3,
        'MOD03-T1',
        'Identify why ductile failure modes are preferred in structural design',
        'Why do structural design codes strongly prefer ductile failure modes (such as steel yielding in tension or under-reinforced concrete beam flexure) over brittle failure modes (such as weld fracture, bolt shear rupture, or over-reinforced concrete crushing)?',
        [
          'Ductile members undergo large visible deformations before collapse (giving warning to occupants) and can redistribute internal forces to adjacent members in indeterminate structures',
          'Ductile materials never deform under load',
          'Brittle failures always give several days of large deflection warning',
          'Ductility increases Young’s modulus E after yielding',
        ],
        0,
        'Plastic plateau capacity provides energy absorption, warning, and plastic redistribution.',
        'Fundamental structural safety philosophy.'
      ),
      qMcq(
        'MOD03-E13',
        3,
        'MOD03-T3',
        'Explain why timber bearing perpendicular to the grain has much lower capacity than parallel to the grain',
        'When a timber floor joist sits on a wall plate or masonry hanger, why is the compressive bearing strength of the timber at the support much lower than its compressive strength along the length of the joist?',
        [
          'At the support, the reaction acts perpendicular to the timber grain, crushing the hollow wood cell tubes sideways like drinking straws rather than loading them end-on',
          'Because gravity is stronger at the supports',
          'Because timber has zero Young’s modulus parallel to the grain',
          'Because knots only exist at the supports',
        ],
        0,
        'Compressive strength perpendicular to grain (f_c,90,k) is typically an order of magnitude lower than parallel to grain (f_c,0,k).',
        'Bridges Module 3 material behaviour to Module 10 (EC5).'
      ),
      qMcq(
        'MOD03-E14',
        3,
        'MOD03-T3',
        'Understand the effect of sustained long-term loading (creep) on concrete deflection',
        'When a reinforced concrete beam supports a permanent dead load over several years, how does concrete creep affect the beam?',
        [
          'Compressive strains in the concrete increase gradually over time under constant sustained stress, reducing the effective elastic modulus E_c,eff and increasing long-term deflection to 2–3 times the initial instantaneous deflection',
          'Creep causes the beam to camber upwards over time',
          'Creep doubles the ultimate tensile strength of the steel reinforcement',
          'Creep only lasts for the first 10 seconds after striking propping',
        ],
        0,
        'Concrete creep increases curvature and long-term SLS deflection under quasi-permanent actions.',
        'Links Module 3 material awareness to Module 5 (SLS) and Module 14 (EC2).'
      ),
      qMcq(
        'MOD03-E15',
        3,
        'MOD03-T3',
        'Identify fatigue risk in temporary and permanent structures',
        'In which of the following structural applications is material fatigue (crack initiation and propagation under repeated stress cycles) most likely to be a governing design check?',
        [
          'A welded crane gantry girder, bridge deck, or tower crane tie/mast connection subjected to hundreds of thousands of fluctuating load cycles well below the static yield strength',
          'A domestic timber loft joist carrying static water tank storage',
          'A concrete pad foundation under a single-storey brick garage',
          'An internal partition wall lintel',
        ],
        0,
        'Fatigue fractures occur at stress concentrations (such as weld toes) under repeated cyclic stress ranges Δσ even when peak stress is below static yield.',
        'Module 3 fatigue introductory awareness.'
      ),
      qMcq(
        'MOD03-E16',
        3,
        'MOD03-T1',
        'Understand Saint-Venant’s principle near concentrated loads and holes',
        'The formula σ = F / A assumes stress is uniformly distributed across the cross-section. Where on a steel tie bar does this uniform stress assumption break down?',
        [
          'Locally around bolt holes, notches, and right at the point where concentrated connection forces enter the member (where local stress concentrations occur)',
          'At mid-length of a long uniform prismatic bar far from the connections',
          'Everywhere if the bar is vertical',
          'Whenever the stress is below 100 N/mm²',
        ],
        0,
        'Geometric discontinuities and point-load introductions cause local stress peaks; by Saint-Venant’s principle, stresses smooth out to F/A at a distance of roughly one member width away.',
        'Important assumption/limitation of σ = F/A.'
      ),
      qNum(
        'MOD03-E17',
        3,
        'MOD03-T1',
        'Calculate net section stress at a bolt hole in a tension flat bar',
        'A steel flat tie bar of gross width 100 mm and thickness 10 mm has a single 22 mm diameter bolt hole drilled through its centreline. Under an axial tension load of 156 kN, calculate the average tensile stress on the net cross-section at the hole in N/mm².',
        200,
        'N/mm²',
        'Net width = 100 − 22 = 78 mm. Net area A_net = 78 mm × 10 mm = 780 mm². Net stress σ_net = 156,000 N / 780 mm² = 200 N/mm².',
        'Gross stress away from the hole is 156,000 / 1,000 = 156 N/mm², so the net section at the hole experiences higher average stress.'
      ),
      qNum(
        'MOD03-E18',
        3,
        'MOD03-T2',
        'Calculate total extension of a two-segment stepped tie bar',
        'A vertical hanger consists of an upper steel rod (length 2,000 mm, area 1,000 mm²) connected in series to a lower steel rod (length 2,000 mm, area 500 mm²). Both have E = 200,000 N/mm². Under a tension load of 50 kN applied at the bottom, what is the total elastic extension of the 4,000 mm assembly in mm?',
        1.5,
        'mm',
        'ΔL_total = ΔL_1 + ΔL_2 = (50,000 × 2,000)/(1,000 × 200,000) + (50,000 × 2,000)/(500 × 200,000) = 0.5 mm + 1.0 mm = 1.5 mm.',
        'Members in series carry the same axial force P (ignoring self-weight) and their extensions add.'
      ),
      qMcq(
        'MOD03-E19',
        3,
        'MOD03-T3',
        'Explain why brittle materials are dangerous in tension or impact',
        'Why are unreinforced brittle materials (such as cast iron, glass, or unreinforced concrete/stone) never used as primary tension hangers without a backup load path?',
        [
          'Because a tiny surface flaw or notch creates a local stress concentration that cannot be relieved by local plastic yielding, triggering sudden unstable crack propagation across the entire section',
          'Because brittle materials have a Young’s modulus of zero',
          'Because brittle materials stretch by 50% before breaking',
          'Because tension forces cannot exist in vertical hangers',
        ],
        0,
        'Without local plastic yielding at a crack tip, stress concentration drives rapid cleavage fracture.',
        'Fracture mechanics intuition.'
      ),
      qMcq(
        'MOD03-E20',
        3,
        'MOD03-T3',
        'Connect material properties to the five syllabus study rules',
        'When stating the assumptions and limitations of the axial extension calculation ΔL = PL / (AE), which set of conditions must hold for the formula to be valid?',
        [
          'The member is prismatic (constant A), homogeneous, linearly elastic (stress remains below proportional/yield limit), loaded concentrically through the centroidal axis, and free from buckling',
          'The member must be beyond its yield point and bent into a curve',
          'The load P must be applied perpendicular to the member axis',
          'The formula is valid even after the bar fractures',
        ],
        0,
        'Every hand formula rests on physical idealisations; stating them explicitly is Study Rule 5 of the syllabus.',
        'Syllabus Study Rule 5.'
      ),
    ],
  },
];
