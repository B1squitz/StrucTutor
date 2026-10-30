import { SyllabusModule } from '../types/syllabus';
import { qMcq, qNum } from './questionHelpers';

export const MODULES_4_TO_7: SyllabusModule[] = [
  /* ======================================================================== */
  /* MODULE 4: SECTION PROPERTIES, BENDING THEORY AND MEMBER SHAPE            */
  /* ======================================================================== */
  {
    moduleNumber: 4,
    code: 'MOD-04',
    title: 'Module 4: Section properties, bending theory and member shape',
    shortTitle: 'Section properties, bending theory and member shape',
    suggestedDuration: '10–12 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 5–8',
    whyItMatters:
      'This is one of your most important modules. Cross-sectional shape (A, I, Z_el, W_pl, i) explains why I-beams are shaped the way they are, why section depth dominates stiffness and strength, and why orienting a section on its weak axis can be catastrophic.',
    introduction:
      'Covers centroids and composite areas, second moment of area I and the parallel-axis theorem, elastic section modulus Z = I/y, Engineer’s bending equation σ = My/I = M/Z, plastic section modulus W_pl and plastic hinge formation, radius of gyration i = √(I/A), and major vs minor axis efficiency of Universal Beams.',
    objectives: [
      'Calculate centroids, second moment of area I, elastic section modulus Z, and bending stress σ for rectangular and composite sections (Examples 4.1 and 4.2).',
      'Compare major-axis and minor-axis properties of I-sections and explain why section orientation and restraint matter (Example 4.3).',
      'Distinguish elastic and plastic stress distributions, plastic modulus, shape factor, and why local buckling or LTB can prevent full plastic resistance (Example 4.4).',
    ],
    learningGate: [
      'Calculate I, Z, and bending stress for simple sections without hesitation.',
      'Use the parallel-axis theorem (I = Σ(I_0 + A·d²)) accurately for built-up sections.',
      'Explain major and minor axes and the danger of loading a UB about its minor axis.',
      'Explain why I-sections are structurally efficient in bending.',
      'Distinguish second moment of area I, elastic section modulus Z, and plastic section modulus W_pl.',
      'Explain why choosing a deeper beam is usually far more effective than simply specifying a higher steel grade when deflection governs.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2, 3],
    topics: [
      {
        id: 'MOD04-T1',
        moduleNumber: 4,
        code: '4.1',
        title: 'Centroids, Second Moment of Area I & Parallel-Axis Theorem',
        summary:
          'Covers area centroids, neutral axis location in elastic bending, I = bd³/12 for rectangles (Example 4.1), and the parallel-axis theorem I = I_self + A·d² for composite/built-up shapes (Example 4.2).',
        subtopics: [
          'Area A, first moment of area, and centroid location y_bar = Σ(A_i y_i) / ΣA_i',
          'Why the elastic neutral axis passes through the centroid under pure bending',
          'Second moment of area I = bd³/12 for a rectangle and why units are mm⁴',
          'Parallel-axis theorem: I_xx = Σ(I_0,i + A_i d_i²) for flanges and asymmetric sections (Example 4.2)',
          'Radius of gyration i = √(I/A) and its role in column buckling slenderness',
        ],
        learningObjectives: [
          'Calculate centroids and second moments of area for rectangles and built-up sections.',
          'Explain why the A·d² parallel-axis term makes I-section flanges so effective.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Step-by-step tabular method for T-beams and asymmetric crane girders.',
          workedExamplesPlanned: 'Examples 4.1 and 4.2 complete hand-calculation sheets.',
          calculationsPlanned: 'Radius of gyration i_y vs i_z comparisons.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials: centroids and moments of inertia.',
        },
        questions: [
          qNum(
            'MOD04-T1-Q1',
            4,
            'MOD04-T1',
            'Calculate second moment of area of 75 × 225 mm timber section (Example 4.1)',
            'For a 75 mm wide × 225 mm deep rectangular timber joist bent about its major axis (Syllabus Example 4.1), calculate the second moment of area I = bd³/12 in units of 10⁶ mm⁴ (to 3 significant figures).',
            71.19,
            '10⁶ mm⁴',
            'I = (75 × 225³) / 12 = (75 × 11,390,625) / 12 = 71,191,406 mm⁴ ≈ 71.19 × 10⁶ mm⁴.',
            'Major axis means depth d = 225 mm is cubed.'
          ),
          qNum(
            'MOD04-T1-Q2',
            4,
            'MOD04-T1',
            'Calculate increased I when timber depth increases from 225 mm to 300 mm (Example 4.1)',
            'When the depth of the 75 mm wide timber joist in Syllabus Example 4.1 is increased from 225 mm to 300 mm, calculate the new major-axis second moment of area I = bd³/12 in units of 10⁶ mm⁴.',
            168.75,
            '10⁶ mm⁴',
            'I = (75 × 300³) / 12 = (75 × 27,000,000) / 12 = 168,750,000 mm⁴ = 168.75 × 10⁶ mm⁴.',
            'Increasing depth by a factor of 300/225 = 4/3 (33%) increases I by (4/3)³ = 64/27 = 2.37 times!'
          ),
          qNum(
            'MOD04-T1-Q3',
            4,
            'MOD04-T1',
            'Apply parallel-axis theorem to a symmetric built-up I-section (Example 4.2)',
            'A symmetric steel I-section is fabricated from two 150 mm × 10 mm flanges and a 180 mm × 10 mm vertical web (overall depth D = 200 mm). Calculate the major-axis second moment of area I_xx in units of 10⁶ mm⁴.',
            31.96,
            '10⁶ mm⁴',
            'Web: I_web = 10 × 180³ / 12 = 4.86 × 10⁶ mm⁴. Each flange has A_f = 1,500 mm² with centroid at d = 95 mm from NA: 2 × [150 × 10³ / 12 + 1,500 × 95²] = 2 × [0.0125 × 10⁶ + 13.5375 × 10⁶] = 27.10 × 10⁶ mm⁴. Total I_xx = 4.86 + 27.10 = 31.96 × 10⁶ mm⁴ (checked by outer-minus-inner box: (150 × 200³ − 140 × 180³)/12 = 31.96 × 10⁶ mm⁴).',
            'Both the parallel-axis summation and outer-minus-inner rectangle subtraction give 31.96 × 10⁶ mm⁴.'
          ),
          qNum(
            'MOD04-T1-Q4',
            4,
            'MOD04-T1',
            'Calculate centroid height of an unsymmetrical T-section',
            'A concrete T-beam cross-section consists of a top flange 400 mm wide × 50 mm thick and a vertical web 100 mm wide × 150 mm deep below the flange (overall height = 200 mm). Calculate the height y_bar of the centroid measured up from the bottom of the web in mm (to 1 decimal place).',
            132.1,
            'mm',
            'Take moments of area about the bottom (y = 0): A_web = 100 × 150 = 15,000 mm² at y_1 = 75 mm. A_flange = 400 × 50 = 20,000 mm² at y_2 = 150 + 25 = 175 mm. Total A = 35,000 mm². y_bar = (15,000 × 75 + 20,000 × 175) / 35,000 = 4,625,000 / 35,000 = 132.14 mm ≈ 132.1 mm.',
            'Centroid shifts toward the larger flange area.'
          ),
          qNum(
            'MOD04-T1-Q5',
            4,
            'MOD04-T1',
            'Calculate radius of gyration i from I and A',
            'A steel column section has cross-sectional area A = 5,000 mm² and minor-axis second moment of area I_z = 11.25 × 10⁶ mm⁴. Calculate its minor-axis radius of gyration i_z = √(I_z / A) in mm.',
            47.43,
            'mm',
            'i_z = √(11,250,000 / 5,000) = √2,250 = 47.434 mm ≈ 47.43 mm.',
            'Radius of gyration i has units of length (mm) and governs buckling slenderness λ = L_cr / i.'
          ),
        ],
      },
      {
        id: 'MOD04-T2',
        moduleNumber: 4,
        code: '4.2',
        title: 'Elastic Section Modulus, Bending Stress & Plastic Bending',
        summary:
          'Covers Z = I/y, elastic bending stress σ = My/I = M/Z (Example 4.1), elastic vs plastic stress distributions, plastic section modulus W_pl, shape factor, and why local buckling or LTB can prevent full plastic capacity (Example 4.4).',
        subtopics: [
          'Elastic section modulus Z_el = I / y_max (= bd²/6 for a rectangle)',
          'Elastic bending stress distribution σ(y) = M·y / I (zero at neutral axis, linear to extreme fibres)',
          'Syllabus Example 4.1: σ for 75 × 225 mm vs 75 × 300 mm timber section under M = 8 kN·m',
          'Syllabus Example 4.4: progression from elastic triangle to first yield (M_el = Z_el·fy) to full plastic stress block (M_pl = W_pl·fy)',
          'Plastic section modulus of a rectangle W_pl = bd²/4 (shape factor = 1.5) vs I-section (shape factor ≈ 1.15)',
          'Why Class 3/4 local buckling or unrestrained LTB prevents reaching M_pl',
        ],
        learningObjectives: [
          'Calculate Z_el, W_pl, and elastic bending stress σ for rectangular and I-sections.',
          'Explain the three stages of Example 4.4 and why stability can limit plastic hinge development.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Visual stress-block diagrams from elastic to elasto-plastic to fully plastic.',
          workedExamplesPlanned: 'Examples 4.1 and 4.4 full comparison notes.',
          calculationsPlanned: 'Biaxial bending stress superposition σ = Mx/Zx + My/Zy.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials and SteelConstruction.info.',
        },
        questions: [
          qNum(
            'MOD04-T2-Q1',
            4,
            'MOD04-T2',
            'Calculate elastic section modulus Z of 75 × 225 mm timber section (Example 4.1)',
            'Calculate the major-axis elastic section modulus Z = bd²/6 for the 75 mm × 225 mm rectangular timber section in Syllabus Example 4.1, in units of 10³ mm³ (cm³).',
            632.8,
            'cm³',
            'Z = (75 × 225²) / 6 = (75 × 50,625) / 6 = 632,812.5 mm³ ≈ 632.8 × 10³ mm³ (632.8 cm³).',
            'Also equal to I / (d/2) = 71.191 × 10⁶ / 112.5 = 632.8 × 10³ mm³.'
          ),
          qNum(
            'MOD04-T2-Q2',
            4,
            'MOD04-T2',
            'Calculate bending stress in 75 × 225 mm section under M = 8 kN·m (Example 4.1)',
            'For the 75 mm × 225 mm timber section (Z = 632,812.5 mm³) subjected to a bending moment M = 8.0 kN·m (Syllabus Example 4.1), calculate the maximum extreme-fibre bending stress σ in N/mm².',
            12.64,
            'N/mm²',
            'σ = M / Z = (8.0 × 10⁶ N·mm) / 632,812.5 mm³ = 12.642 N/mm² ≈ 12.64 N/mm².',
            'When depth increases to 300 mm (Z = 1,125,000 mm³), σ drops to 8×10⁶ / 1.125×10⁶ = 7.11 N/mm²!'
          ),
          qNum(
            'MOD04-T2-Q3',
            4,
            'MOD04-T2',
            'Calculate plastic section modulus W_pl of a rectangular steel plate',
            'A solid rectangular steel bar has width b = 60 mm and depth d = 100 mm. Calculate its major-axis plastic section modulus W_pl = bd²/4 in cm³ (10³ mm³).',
            150,
            'cm³',
            'W_pl = (60 × 100²) / 4 = 600,000 / 4 = 150,000 mm³ = 150 cm³ (whereas Z_el = bd²/6 = 100 cm³, giving shape factor W_pl / Z_el = 1.5).',
            'Equal tension and compression rectangular stress blocks each of area bd/2 with lever arm d/2 between their centroids.'
          ),
          qMcq(
            'MOD04-T2-Q4',
            4,
            'MOD04-T2',
            'Explain why local buckling or LTB prevents full plastic moment M_pl (Example 4.4)',
            'In Syllabus Example 4.4, as bending moment increases beyond first yield of the extreme fibres toward the full plastic stress block, what can prevent a thin-walled steel I-beam from reaching its full plastic moment resistance M_pl = W_pl·f_y?',
            [
              'High compressive strains in the yielded flange/web can trigger local plate buckling (Class 3 or 4 section), or an unrestrained compression flange can buckle sideways and twist (Lateral Torsional Buckling) before full plastification develops',
              'Steel loses its mass when the extreme fibre yields',
              'The neutral axis moves outside the beam cross-section',
              'Plastic hinges can only form in brittle materials like glass',
            ],
            0,
            'Reaching and rotating at M_pl requires the compression elements to be sufficiently stocky (Class 1 or 2) to sustain compressive yield strains without local buckling, and the beam to be laterally restrained against LTB.',
            'Directly answers Syllabus Example 4.4.'
          ),
          qMcq(
            'MOD04-T2-Q5',
            4,
            'MOD04-T2',
            'Distinguish I, Z_el, and W_pl (Module 4 Gate)',
            'Which statement accurately distinguishes the roles of second moment of area I, elastic section modulus Z_el, and plastic section modulus W_pl?',
            [
              'I (mm⁴) governs elastic flexural stiffness and deflection (EI); Z_el = I/y_max (mm³) governs extreme-fibre elastic stress at first yield; W_pl (mm³) governs the full plastic hinge moment capacity when the whole section yields',
              'I, Z_el, and W_pl all have units of mm⁴ and are numerically equal',
              'W_pl is used to calculate serviceability deflection',
              'Z_el is always larger than W_pl',
            ],
            0,
            'I measures stiffness (second moment), Z_el measures elastic bending strength, and W_pl measures full plastic bending strength.',
            'Core Module 4 Gate requirement.'
          ),
        ],
      },
      {
        id: 'MOD04-T3',
        moduleNumber: 4,
        code: '4.3',
        title: 'Why I-Sections Work & Major vs Minor Axis Orientation',
        summary:
          'Explains why I-sections concentrate area in the flanges far from the neutral axis, why the web resists shear, why orienting a UB on its minor axis drastically reduces stiffness and strength (Example 4.3), and why depth beats steel grade for deflection.',
        subtopics: [
          'Why I-sections work: flanges placed at distance y_max resist bending couple; web separates flanges and resists vertical shear V',
          'Major axis (y-y in Eurocode) vs minor axis (z-z in Eurocode) of a Universal Beam (Example 4.3)',
          'Typical UB ratios: I_major / I_minor is often 10:1 to 25:1, and Z_major / Z_minor is often 5:1 to 10:1',
          'Why using an I-beam on its flat (minor axis) or leaving it unrestrained is dangerous',
          'Why increasing beam depth is far more effective than increasing steel grade when deflection governs',
        ],
        learningObjectives: [
          'Explain why I-sections are efficient and what happens if a UB is loaded about its minor axis (Example 4.3).',
          'Prove quantitatively why beam depth governs stiffness while steel grade does not.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Interactive Universal Beam orientation comparator.',
          workedExamplesPlanned: 'Example 4.3 major/minor axis ratio investigation using controlled section data.',
          calculationsPlanned: 'Web shear stress vs flange bending stress partitioning in an I-beam.',
          sourceReferencesNeeded: 'SCI P363 / SteelConstruction.info section property tables (awaiting user reference copy).',
        },
        questions: [
          qMcq(
            'MOD04-T3-Q1',
            4,
            'MOD04-T3',
            'Explain why I-sections are structurally efficient in bending (Module 4 Gate)',
            'Why is an I-section much more efficient in major-axis bending than a solid rectangular bar of the exact same cross-sectional area (and weight per metre)?',
            [
              'Because elastic bending stress increases linearly with distance from the neutral axis, so placing most of the steel area in two flanges far from the neutral axis maximises the A·d² parallel-axis contribution to I and Z, while a thin web suffices to keep the flanges apart and carry shear',
              'Because the web carries 100% of the bending moment and the flanges carry 100% of the vertical shear',
              'Because material near the neutral axis carries the highest bending stress',
              'Because I-sections have a higher Young’s modulus E than rectangular bars',
            ],
            0,
            'Material near the neutral axis is lightly stressed in bending; moving mass to the extreme fibres maximises lever arm and second moment of area per kilogram of steel.',
            'Module 4 Gate requirement.'
          ),
          qNum(
            'MOD04-T3-Q2',
            4,
            'MOD04-T3',
            'Compare major vs minor axis elastic bending capacity of a UB (Example 4.3)',
            'A representative steel Universal Beam has major-axis elastic section modulus W_el,y = 600 cm³ and minor-axis elastic section modulus W_el,z = 75 cm³. By what factor is its elastic bending capacity reduced if it is accidentally installed flat (loaded about its minor axis instead of its major axis)?',
            8,
            'factor',
            'Ratio = W_el,y / W_el,z = 600 / 75 = 8.0. Installed flat, it can only carry one-eighth of the bending moment!',
            'Representative values illustrating Syllabus Example 4.3 (consult SCI P363 for exact serial size tables).'
          ),
          qNum(
            'MOD04-T3-Q3',
            4,
            'MOD04-T3',
            'Compare major vs minor axis flexural stiffness of a UB (Example 4.3)',
            'If the same Universal Beam has major-axis I_y = 9,000 cm⁴ and minor-axis I_z = 450 cm⁴, how many times greater is the elastic deflection under the same load if the beam is oriented on its minor axis (flat) instead of its major axis?',
            20,
            'times',
            'Since deflection δ is inversely proportional to I, δ_minor / δ_major = I_y / I_z = 9,000 / 450 = 20 times greater deflection!',
            'Explains why using a UB in the wrong orientation is dangerous for both strength and deflection (Example 4.3).'
          ),
          qMcq(
            'MOD04-T3-Q4',
            4,
            'MOD04-T3',
            'Explain why a deeper beam beats a higher steel grade when deflection governs (Module 4 Gate)',
            'A steel floor beam passes bending strength checks in S275 steel, but fails the serviceability deflection limit by 35%. Why is choosing a slightly deeper beam section effective, whereas changing the steel grade from S275 to S355 does not solve the deflection problem?',
            [
              'Elastic deflection depends on flexural stiffness EI (not yield strength f_y); increasing depth increases I roughly with the cube/square of depth, whereas changing from S275 to S355 leaves E (210 GPa) and I completely unchanged',
              'S355 steel has a lower Young’s modulus E than S275 steel',
              'Deeper beams always weigh three times more than shallower beams',
              'Steel grade only affects shear modulus G',
            ],
            0,
            'In δ = 5wL⁴/(384EI), f_y does not appear at all! Only geometry (I) or support/span arrangement can reduce elastic deflection for a given material E.',
            'Final requirement of the Module 4 Learning Gate.'
          ),
          qNum(
            'MOD04-T3-Q5',
            4,
            'MOD04-T3',
            'Compare major vs minor axis bending stiffness of a 75 × 225 mm timber joist',
            'A 75 mm × 225 mm rectangular timber joist is meant to be installed on edge (depth = 225 mm, width = 75 mm), but a site operative lays it flat (depth = 75 mm, width = 225 mm). By what factor is its second moment of area I reduced when laid flat?',
            9,
            'factor',
            'I_edge / I_flat = (75 × 225³ / 12) / (225 × 75³ / 12) = (225 / 75)² = 3² = 9.0.',
            'A 3:1 aspect ratio plank laid flat has 9 times less stiffness and 3 times less bending strength than on edge.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-4.1',
        code: 'Example 4.1',
        title: 'Rectangle section properties (75 × 225 mm vs 75 × 300 mm)',
        kind: 'worked_example',
        description:
          'For a 75 mm × 225 mm rectangular timber section: I = bd³/12. Calculate I, Z, and bending stress for M = 8 kNm. Repeat with depth increased to 300 mm. Write what changed: bending stress, stiffness, likely deflection, practical limitations.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topics 4.1 & 4.2 & Module 4 Assessment',
        selfReviewChecklist: [
          'For 75×225: I = 71.19×10⁶ mm⁴, Z = 632.8×10³ mm³, σ = 12.64 N/mm².',
          'For 75×300: I = 168.75×10⁶ mm⁴ (+137% stiffness), Z = 1,125×10³ mm³, σ = 7.11 N/mm² (-44% stress).',
          'Note practical limitations of deeper sections: ceiling/floor zone headroom, lateral stability/strutting need, and timber availability.',
        ],
      },
      {
        id: 'EX-4.2',
        code: 'Example 4.2',
        title: 'Parallel-axis theorem',
        kind: 'worked_example',
        description:
          'Calculate the second moment of area of a simple built-up section made from two rectangular flanges and a web.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 4.1 & Module 4 Assessment',
        selfReviewChecklist: [
          'Show I_total = I_web + 2 × (I_flange,self + A_flange × d²).',
          'Verify using the enclosing rectangle minus side voids method.',
        ],
      },
      {
        id: 'EX-4.3',
        code: 'Example 4.3',
        title: 'Major/minor axis of a UB',
        kind: 'worked_example',
        description:
          'Use a section table from SCI/SteelConstruction.info. Choose one UB and identify: major-axis I; minor-axis I; major/minor elastic section modulus; ratio between them; why using the section in the wrong orientation is dangerous.',
        requiresCalcNote: false,
        statusLabel: 'Awaiting Controlled SCI / Blue Book Section Table Reference',
        selfReviewChecklist: [
          'Look up a standard UB in an official SCI P363 or SteelConstruction.info table.',
          'Compute Iy / Iz and Wel,y / Wel,z and note why minor-axis bending or unrestrained compression causes large deflections/buckling.',
        ],
      },
      {
        id: 'EX-4.4',
        code: 'Example 4.4',
        title: 'Elastic versus plastic bending',
        kind: 'practical_exercise',
        description:
          'Sketch a rectangular steel section under increasing bending: (1) elastic stress distribution; (2) first yield at extreme fibres; (3) fully plastic stress block. Then write why local buckling or LTB may prevent full plastic resistance being used.',
        requiresCalcNote: true,
        statusLabel: 'Self-Review / Independent Review Practice Activity',
        selfReviewChecklist: [
          'Sketch linear double-triangle elastic distribution, first yield at σ = fy, and rectangular plastic blocks.',
          'Explain why slender outstand flanges/webs buckle locally or the compression flange buckles laterally before full plasticity.',
        ],
      },
    ],
    resources: [
      'Hibbeler Mechanics of Materials: centroids, moments of inertia, bending.',
      'Jeff Hanson: centroid, moment of inertia, flexural stress.',
      'SteelConstruction.info: steel section properties and section classification introductions.',
    ],
    standardsNotice:
      'Calculations use exact geometric formulas (bd³/12, bd²/6, bd²/4, parallel-axis theorem). For specific rolled steel serial sizes (Example 4.3), always consult controlled SCI P363 / BS EN 10365 tables.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD04-E01',
        4,
        'MOD04-T1',
        'Calculate I for 75 × 225 mm rectangular section (Example 4.1)',
        'Calculate the major-axis second moment of area I = bd³/12 for a 75 mm × 225 mm rectangular timber beam in units of 10⁶ mm⁴.',
        71.19,
        '10⁶ mm⁴',
        'I = 75 × 225³ / 12 = 71.191 × 10⁶ mm⁴.',
        'Rectangle bent about its strong axis.'
      ),
      qNum(
        'MOD04-E02',
        4,
        'MOD04-T2',
        'Calculate bending stress for 75 × 300 mm section under M = 8 kN·m (Example 4.1)',
        'When the 75 mm wide timber beam depth is increased to 300 mm (so Z = bd²/6 = 1,125,000 mm³), calculate the maximum bending stress under M = 8.0 kN·m in N/mm².',
        7.11,
        'N/mm²',
        'σ = (8.0 × 10⁶ N·mm) / 1,125,000 mm³ = 7.111 N/mm² ≈ 7.11 N/mm².',
        'Compare with 12.64 N/mm² for the 225 mm deep section.'
      ),
      qNum(
        'MOD04-E03',
        4,
        'MOD04-T1',
        'Calculate factor decrease in deflection when depth increases from 225 mm to 300 mm (Example 4.1)',
        'When the rectangular beam depth increases from 225 mm to 300 mm (at constant width 75 mm, span, and load), what is the ratio of the new second moment of area I_300 to the original I_225?',
        2.37,
        'ratio',
        'I_300 / I_225 = (300 / 225)³ = (4 / 3)³ = 64 / 27 = 2.370.',
        'Thus elastic deflection reduces to 27/64 = 42.2% of its original value.'
      ),
      qNum(
        'MOD04-E04',
        4,
        'MOD04-T1',
        'Calculate minor-axis second moment of area of a rectangular section',
        'For a 100 mm wide × 200 mm deep rectangular timber post, calculate its MINOR-axis second moment of area I_minor = db³/12 in units of 10⁶ mm⁴.',
        16.67,
        '10⁶ mm⁴',
        'About the minor axis, the dimension parallel to bending is 100 mm: I_minor = 200 × 100³ / 12 = 16.667 × 10⁶ mm⁴ (compared to I_major = 100 × 200³ / 12 = 66.67 × 10⁶ mm⁴).',
        'Minor axis always has the smaller dimension cubed.'
      ),
      qNum(
        'MOD04-E05',
        4,
        'MOD04-T1',
        'Apply parallel-axis theorem to a single flange plate',
        'A horizontal flange plate of width 200 mm and thickness 15 mm (area A = 3,000 mm²) has its own centroid located at a vertical distance d = 150 mm from the neutral axis of a composite girder. Calculate the parallel-axis transfer term A·d² alone in units of 10⁶ mm⁴.',
        67.5,
        '10⁶ mm⁴',
        'A × d² = 3,000 mm² × (150 mm)² = 3,000 × 22,500 = 67,500,000 mm⁴ = 67.5 × 10⁶ mm⁴.',
        'Notice the flange’s self-inertia b·t³/12 = 200 × 15³ / 12 = 0.056 × 10⁶ mm⁴ is less than 0.1% of the A·d² transfer term!'
      ),
      qNum(
        'MOD04-E06',
        4,
        'MOD04-T1',
        'Calculate I of a symmetric hollow box section (RHS/SHS)',
        'A square hollow steel section (SHS) has outer dimensions 200 mm × 200 mm and inner hollow dimensions 180 mm × 180 mm (uniform wall thickness 10 mm). Calculate its second moment of area I in units of 10⁶ mm⁴ (to 2 decimal places).',
        45.85,
        '10⁶ mm⁴',
        'I = (B·D³ − b·d³) / 12 = (200⁴ − 180⁴) / 12 = (1,600,000,000 − 1,049,760,000) / 12 = 550,240,000 / 12 = 45.853 × 10⁶ mm⁴ ≈ 45.85 × 10⁶ mm⁴.',
        'Outer rectangle I minus inner hollow rectangle I.'
      ),
      qNum(
        'MOD04-E07',
        4,
        'MOD04-T2',
        'Calculate bending stress at an interior point y from the neutral axis',
        'A symmetric beam with second moment of area I = 80 × 10⁶ mm⁴ and overall depth 300 mm (so y_max = 150 mm) is subjected to a sagging moment M = 40 kN·m. Calculate the longitudinal bending stress σ at a point located y = 60 mm below the neutral axis, in N/mm².',
        30,
        'N/mm²',
        'σ(y) = M × y / I = (40 × 10⁶ N·mm × 60 mm) / (80 × 10⁶ mm⁴) = 30.0 N/mm² (tension).',
        'At the extreme fibre (y = 150 mm), σ_max = 40×150/80 = 75 N/mm².'
      ),
      qNum(
        'MOD04-E08',
        4,
        'MOD04-T2',
        'Calculate elastic yield moment M_el of a section',
        'A steel beam has an elastic section modulus Z_el = 500 cm³ (500,000 mm³) and yield strength f_y = 355 N/mm². Calculate the bending moment M_el (in kN·m) at which the extreme fibres first reach yield.',
        177.5,
        'kN·m',
        'M_el = Z_el × f_y = 500,000 mm³ × 355 N/mm² = 177,500,000 N·mm = 177.5 kN·m.',
        'Corresponds to Stage 2 of Syllabus Example 4.4 (first yield at extreme fibres).'
      ),
      qNum(
        'MOD04-E09',
        4,
        'MOD04-T2',
        'Calculate full plastic moment M_pl of a Class 1 steel section',
        'If the same steel beam (f_y = 355 N/mm²) is Class 1 and has a plastic section modulus W_pl = 575 cm³ (575,000 mm³), calculate its full plastic moment resistance M_pl in kN·m (with γ_M0 = 1.0).',
        204.13,
        'kN·m',
        'M_pl = W_pl × f_y = 575,000 mm³ × 355 N/mm² = 204,125,000 N·mm ≈ 204.13 kN·m.',
        'Shape factor W_pl / Z_el = 575 / 500 = 1.15, typical for a steel Universal Beam.'
      ),
      qNum(
        'MOD04-E10',
        4,
        'MOD04-T2',
        'Calculate extreme fibre stresses in an unsymmetrical T-section',
        'An unsymmetrical cast-iron or concrete T-beam has second moment of area I = 120 × 10⁶ mm⁴. Its neutral axis lies 80 mm below the top fibre and 160 mm above the bottom fibre. Under a sagging moment of M = 30 kN·m, calculate the maximum tensile stress at the bottom fibre in N/mm².',
        40,
        'N/mm²',
        'σ_bot = M × y_bot / I = (30 × 10⁶ × 160) / (120 × 10⁶) = 40.0 N/mm² tension (while the top fibre has σ_top = 30 × 80 / 120 = 20.0 N/mm² compression).',
        'In an unsymmetrical section, the fibre furthest from the centroidal neutral axis experiences the largest elastic bending stress.'
      ),
      qMcq(
        'MOD04-E11',
        4,
        'MOD04-T1',
        'Explain why the neutral axis passes through the centroid in pure elastic bending',
        'In pure elastic bending (with zero axial force N = 0) of a homogeneous beam, why must the neutral axis pass through the geometric centroid of the cross-section?',
        [
          'Because longitudinal normal stress varies linearly with distance y from the neutral axis (σ = E·κ·y), so setting the resultant axial force ∫ σ dA = E·κ ∫ y dA = 0 requires the first moment of area about the neutral axis to be zero',
          'Because shear stress is zero at the centroid',
          'Because the centroid is always at half the overall depth even for a T-section',
          'Because plastic hinges only form at the centroid',
        ],
        0,
        'Zero first moment of area ∫ y dA = 0 is the exact definition of the centroidal axis.',
        'Note: once a non-symmetric section yields plastically, the plastic neutral axis (equal area axis) shifts away from the elastic centroid!'
      ),
      qMcq(
        'MOD04-E12',
        4,
        'MOD04-T2',
        'Distinguish elastic centroidal axis from plastic equal-area axis in an asymmetric section',
        'In a fully plastic T-section made of homogeneous steel (yield strength f_y in both tension and compression) under pure bending (N = 0), how is the position of the plastic neutral axis determined?',
        [
          'It divides the cross-section into two equal areas (A_tension = A_compression = A/2) so that the tensile yield force A_t·f_y balances the compressive yield force A_c·f_y',
          'It always remains at the elastic centroid',
          'It moves to the top extreme fibre',
          'It depends on Young’s modulus E',
        ],
        0,
        'When the entire section reaches ±f_y, horizontal force equilibrium C = T requires A_c·f_y = A_t·f_y, so A_c = A_t = A/2 (the equal-area axis).',
        'Deepens understanding of elastic vs plastic behaviour in Module 4.'
      ),
      qMcq(
        'MOD04-E13',
        4,
        'MOD04-T3',
        'Understand how bending moment and shear force are carried across an I-section',
        'In a thin-walled steel I-beam bent about its major axis, how are the internal bending moment M and vertical shear force V primarily resisted across the cross-section?',
        [
          'The flanges resist the vast majority of the bending moment M (as a tension-compression force couple), while the vertical web resists almost all of the vertical shear force V',
          'The web resists 95% of the bending moment and the flanges resist 95% of the vertical shear',
          'Bending stress and vertical shear stress are both uniform across the flanges and web',
          'Only the bottom flange resists vertical shear',
        ],
        0,
        'Flanges have large area at maximum lever arm from the NA (carrying M), whereas vertical shear stress τ = VQ/(It) is concentrated in the narrow vertical web.',
        'Explains the functional anatomy of an I-section.'
      ),
      qMcq(
        'MOD04-E14',
        4,
        'MOD04-T3',
        'Identify practical limitations of choosing a much deeper beam section (Example 4.1)',
        'Increasing beam depth reduces bending stress and deflection strongly. In real building or temporary works design, what practical constraints can limit how deep a beam section you can use?',
        [
          'Restricted floor-to-ceiling headroom/service zones, increased slenderness of the web/compression flange (requiring lateral restraint or web stiffeners to prevent buckling), and standard timber/steel stock sizes',
          'Deeper beams always have lower second moment of area I',
          'Deeper beams increase Young’s modulus E to unsafe levels',
          'There are never any practical limits on beam depth',
        ],
        0,
        'Directly addresses the final question in Syllabus Example 4.1 ("Write what changed: bending stress; stiffness; likely deflection; practical limitations").',
        'Connects section theory to practical engineering judgement.'
      ),
      qMcq(
        'MOD04-E15',
        4,
        'MOD04-T2',
        'State the core assumptions of Engineer’s Simple Bending Theory (σ = My/I)',
        'Which of the following is a foundational kinematic assumption of Euler-Bernoulli (Engineer’s) bending theory σ = My/I?',
        [
          'Plane cross-sections normal to the beam axis before bending remain plane and normal to the deformed axis after bending (yielding a linear strain distribution ε = y/R), and the material is homogeneous and linearly elastic',
          'Cross-sections warp freely and normal stress is constant over the depth',
          'The beam depth must be greater than its span (deep beam action)',
          'The material must be fully yielded across its entire depth',
        ],
        0,
        'Plane sections remain plane gives linear strain ε ∝ y; combined with Hooke’s law σ = Eε, this produces the linear stress distribution σ = My/I.',
        'Note: in very deep beams (span/depth < 2 to 3), shear deformation causes non-linear stress distribution so simple beam theory no longer holds.'
      ),
      qNum(
        'MOD04-E16',
        4,
        'MOD04-T2',
        'Calculate combined axial and bending stress at an extreme fibre',
        'A rectangular steel strut of area A = 4,000 mm² and elastic section modulus Z = 200,000 mm³ carries a concentric axial compression force N = 240 kN and a bending moment M = 10 kN·m. Using elastic superposition (ignoring second-order buckling amplification), calculate the maximum compressive stress at the extreme fibre in N/mm².',
        110,
        'N/mm²',
        'σ_axial = N / A = 240,000 / 4,000 = 60 N/mm² (compression). σ_bending = M / Z = 10,000,000 / 200,000 = 50 N/mm². Maximum compression = 60 + 50 = 110 N/mm² (minimum stress on opposite face = 60 − 50 = 10 N/mm² compression).',
        'Elastic superposition σ = N/A ± M/Z.'
      ),
      qNum(
        'MOD04-E17',
        4,
        'MOD04-T3',
        'Estimate flange axial force in an I-beam using the lever-arm approximation',
        'A plate girder has a distance between flange centroids (lever arm z) of 500 mm (0.50 m) and is subjected to a bending moment M = 350 kN·m. Assuming the flanges carry the entire bending moment as a tension-compression couple (F_flange = M / z), calculate the axial force in each flange in kN.',
        700,
        'kN',
        'F_flange = M / z = 350 kN·m / 0.50 m = 700 kN (top flange in 700 kN compression, bottom flange in 700 kN tension under sagging).',
        'Powerful hand-check method used by practising engineers to size flanges and flange splices.'
      ),
      qMcq(
        'MOD04-E18',
        4,
        'MOD04-T3',
        'Identify why a square hollow section (SHS) resists torsion and minor-axis bending better than an I-section',
        'Why is a closed Square Hollow Section (SHS) or Circular Hollow Section (CHS) often preferred over an open Universal Beam (UB) for a freestanding unbraced compression post or a member subjected to torsion?',
        [
          'An SHS/CHS has equal second moment of area and radius of gyration about both axes (I_y = I_z, no weak minor axis) and a closed cell wall that provides vastly superior St Venant torsional stiffness compared to an open I-section',
          'An SHS has zero self-weight',
          'Open I-sections have higher torsional stiffness than closed box sections',
          'SHS sections cannot carry axial compression',
        ],
        0,
        'Open sections made of thin rectangles have very low torsional constant J = Σ(b·t³/3) and a weak minor axis z-z, whereas closed hollow sections resist torsion by shear flow around the enclosed area and have symmetric flexural stiffness.',
        'Connects member shape to structural application.'
      ),
      qNum(
        'MOD04-E19',
        4,
        'MOD04-T2',
        'Calculate shape factor of a solid rectangular section',
        'For any solid rectangular cross-section of breadth b and depth d, calculate the geometric shape factor W_pl / Z_el = (bd²/4) / (bd²/6).',
        1.5,
        'ratio',
        '(bd²/4) / (bd²/6) = 6 / 4 = 1.50.',
        'Shows that a rectangular section has 50% reserve moment capacity beyond first yield, whereas an I-section has ~15% reserve because most of its area is already concentrated in the outer flanges.'
      ),
      qMcq(
        'MOD04-E20',
        4,
        'MOD04-T3',
        'Recognise consequences of cutting holes in I-beam flanges vs web at midspan',
        'A services contractor asks to drill a large cable hole at midspan of a heavily loaded simply supported steel I-beam. Which location is far more damaging to the beam’s bending resistance, and why?',
        [
          'Cutting the tension or compression flange at midspan is far more damaging because the flanges sit at y_max where bending stress and the A·d² contribution to Z are greatest, whereas a small hole centred on the neutral axis of the web removes material where bending stress is near zero',
          'Cutting a hole at the neutral axis of the web at midspan reduces bending resistance to zero',
          'Flanges carry zero stress at midspan so cutting them has no effect',
          'Shear force is maximum at midspan of a UDL beam',
        ],
        0,
        'At midspan of a UDL beam, M is maximum and V is zero; removing flange area directly reduces Z where bending stress is peak, whereas the neutral axis at mid-depth has σ ≈ 0 (though any web opening must still be checked for local Vierendeel/shear action).',
        'Practical site engineering judgement.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 5: DEFLECTION, SERVICEABILITY AND VIBRATION                       */
  /* ======================================================================== */
  {
    moduleNumber: 5,
    code: 'MOD-05',
    title: 'Module 5: Deflection, serviceability and vibration',
    shortTitle: 'Deflection, serviceability and vibration',
    suggestedDuration: '6–8 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 7–8',
    whyItMatters:
      'A beam can be completely safe against collapse (ULS) and still fail in service (SLS) because it cracks brittle partitions, binds doors and windows, ponds rainwater on flat roofs, or feels bouncy underfoot.',
    introduction:
      'Covers beam curvature κ = M/EI, flexural rigidity EI, standard elastic deflection formulae, the fourth-power sensitivity to span L⁴ (Example 5.1), method of superposition, Ultimate Limit State (ULS) vs Serviceability Limit State (SLS) consequences (Example 5.2), long-term creep/moisture effects, and floor vibration awareness.',
    objectives: [
      'Calculate elastic deflections of simply supported and cantilever beams under standard UDL and point loadings (Example 5.1).',
      'Quantify the effect of changing span L, section depth d, and steel grade on elastic deflection (Example 5.1).',
      'Explain the physical consequences of SLS exceedance and why both ULS and SLS checks are mandatory (Example 5.2).',
    ],
    learningGate: [
      'Calculate standard beam deflections in consistent units without power-of-ten errors.',
      'Explain mathematically and physically why span L is so influential on deflection (L⁴ for UDL, L³ for point load).',
      'Distinguish flexural stiffness EI from bending strength M_Rd.',
      'Explain why ULS and SLS checks are both required and what physical problem each prevents.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4],
    topics: [
      {
        id: 'MOD05-T1',
        moduleNumber: 5,
        code: '5.1',
        title: 'Curvature, Flexural Stiffness EI & Standard Deflection Formulae',
        summary:
          'Covers the moment–curvature relation 1/R = M/EI, double integration physical meaning, standard deflection formulas (5wL⁴/384EI, PL³/48EI, wL⁴/8EI, PL³/3EI), and superposition.',
        subtopics: [
          'Moment–curvature relationship: κ = d²y/dx² ≈ M / (EI)',
          'Flexural rigidity EI (N·mm² or kN·m²)',
          'Simply supported beam deflections: δ_max = 5wL⁴/(384EI) for UDL; δ_max = PL³/(48EI) for central point load',
          'Cantilever tip deflections: δ_max = wL⁴/(8EI) for UDL; δ_max = PL³/(3EI) for tip point load',
          'Principle of superposition for combined loads within the linear elastic range',
        ],
        learningObjectives: [
          'Compute midspan and cantilever tip deflections in mm using consistent (mm, N) units.',
          'Combine UDL and point-load deflections using linear elastic superposition.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Derivation of deflection coefficients by moment-area theorem and Macaulay’s method.',
          workedExamplesPlanned: 'Example 5.1 full parametric study.',
          calculationsPlanned: 'Precambering steel beams to offset permanent dead-load deflection.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials: beam deflection chapters.',
        },
        questions: [
          qNum(
            'MOD05-T1-Q1',
            5,
            'MOD05-T1',
            'Calculate midspan deflection of a simply supported beam under UDL (Example 5.1)',
            'A simply supported steel beam of span L = 4,000 mm has E = 210,000 N/mm² and I = 80 × 10⁶ mm⁴. Under an unfactored serviceability UDL of w = 6.0 kN/m (6.0 N/mm), calculate the midspan deflection δ = 5wL⁴ / (384EI) in mm.',
            1.19,
            'mm',
            'Numerator = 5 × 6.0 × 4,000⁴ = 30 × 2.56 × 10¹⁴ = 7.68 × 10¹⁵ N·mm³. Denominator = 384 × 210,000 × 80 × 10⁶ = 6.4512 × 10¹⁵ N·mm². δ = 7.68 / 6.4512 = 1.190 mm.',
            'Using N/mm, mm, N/mm², and mm⁴ yields δ directly in mm.'
          ),
          qNum(
            'MOD05-T1-Q2',
            5,
            'MOD05-T1',
            'Calculate midspan deflection under a central point load',
            'If the same 4,000 mm span steel beam (E = 210,000 N/mm², I = 80 × 10⁶ mm⁴) carries a central serviceability point load P = 25.2 kN (25,200 N) at midspan, calculate the additional midspan deflection δ = PL³ / (48EI) in mm.',
            2,
            'mm',
            'Numerator = 25,200 × 4,000³ = 1.6128 × 10¹⁵ N·mm³. Denominator = 48 × 210,000 × 80 × 10⁶ = 8.064 × 10¹⁴ N·mm². δ = 1.6128×10¹⁵ / 8.064×10¹⁴ = 2.00 mm.',
            'By superposition, if both loads act together, total midspan deflection = 1.19 + 2.00 = 3.19 mm.'
          ),
          qNum(
            'MOD05-T1-Q3',
            5,
            'MOD05-T1',
            'Calculate tip deflection of a cantilever under a tip point load',
            'A 2,000 mm long steel cantilever (E = 200,000 N/mm², I = 40 × 10⁶ mm⁴) supports a downward service point load of P = 12 kN (12,000 N) at its free tip. Calculate the vertical tip deflection δ = PL³ / (3EI) in mm.',
            4,
            'mm',
            'δ = (12,000 × 2,000³) / (3 × 200,000 × 40 × 10⁶) = (9.6 × 10¹³) / (2.4 × 10¹³) = 4.0 mm.',
            'Notice a cantilever with a tip load (PL³/3EI) deflects 16 times more than a simply supported beam of the same length L with a central point load (PL³/48EI)!'
          ),
          qNum(
            'MOD05-T1-Q4',
            5,
            'MOD05-T1',
            'Calculate required second moment of area I to satisfy an L/360 deflection limit',
            'A 6,000 mm simply supported beam carries an imposed service UDL of w_q = 8.0 kN/m (8.0 N/mm) with E = 210,000 N/mm². If the imposed-load deflection must not exceed L/360 = 16.67 mm, what minimum I (in units of 10⁶ mm⁴) is required?',
            38.57,
            '10⁶ mm⁴',
            'I_req = 5 w L⁴ / (384 E δ_lim) = (5 × 8.0 × 6,000⁴) / (384 × 210,000 × 16.667) = (5.184 × 10¹⁶) / (1.344 × 10⁹) = 38.57 × 10⁶ mm⁴.',
            'Rearrangement of standard UDL deflection formula.'
          ),
          qMcq(
            'MOD05-T1-Q5',
            5,
            'MOD05-T1',
            'Understand conditions required for deflection superposition',
            'When can the total deflection of a beam under multiple loads be found simply by adding the deflections caused by each load acting separately (superposition)?',
            [
              'When the material remains linearly elastic and deformations are small enough that the geometry of equilibrium is not significantly altered (first-order linear behaviour)',
              'Only after a plastic hinge has formed at midspan',
              'When the column or beam is buckling inelastically',
              'Only when all loads are point loads',
            ],
            0,
            'Superposition requires linearity of both the constitutive law (Hooke’s law) and kinematics (small displacements, no P-Δ second-order amplification).',
            'Important limitation of elastic superposition.'
          ),
        ],
      },
      {
        id: 'MOD05-T2',
        moduleNumber: 5,
        code: '5.2',
        title: 'Span Effects, Depth Sensitivity & Steel Grade Comparison (Example 5.1)',
        summary:
          'Examines the parametric sensitivity of δ = 5wL⁴/(384EI) in Syllabus Example 5.1: increasing span from 4 m to 5 m, increasing depth by 25%, and why changing steel grade leaves elastic deflection unchanged.',
        subtopics: [
          'Fourth-power span sensitivity under UDL: δ ∝ L⁴ (doubling span increases UDL deflection by 16×)',
          'Syllabus Example 5.1 Case A: increasing span from 4.0 m to 5.0 m increases UDL deflection by (5/4)⁴ = 2.44×',
          'Syllabus Example 5.1 Case B: increasing rectangular section depth by 25% (×1.25) increases I by 1.25³ = 1.95×, nearly halving deflection',
          'Syllabus Example 5.1 Case C: increasing steel grade (e.g. S275 to S355) does not change E, so elastic deflection is unchanged',
          'Span-to-depth ratios (L/d) as a rapid preliminary sizing rule of thumb',
        ],
        learningObjectives: [
          'Complete all three parametric comparisons in Syllabus Example 5.1 accurately.',
          'Explain why span L has a fourth-power effect under a UDL.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Physical breakdown of L⁴: L¹ from total load wL, L¹ from moment lever arm, and L² from double integration of curvature.',
          workedExamplesPlanned: 'Example 5.1 full comparative table.',
          calculationsPlanned: 'Span-to-depth preliminary sizing checks.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials and Jeff Hanson beam deflection videos.',
        },
        questions: [
          qNum(
            'MOD05-T2-Q1',
            5,
            'MOD05-T2',
            'Calculate deflection multiplier when span increases from 4 m to 5 m under UDL (Example 5.1)',
            'In Syllabus Example 5.1, a simply supported beam carries a constant UDL w per metre. If the span is increased from 4.0 m to 5.0 m without changing the cross-section or w, by what factor (δ_5m / δ_4m) does the maximum elastic deflection increase?',
            2.44,
            'factor',
            'Since δ = 5wL⁴/(384EI) with w, E, and I constant, δ_5m / δ_4m = (5.0 / 4.0)⁴ = 1.25⁴ = 2.4414 ≈ 2.44.',
            'A 25% increase in span causes a 144% increase in UDL deflection!'
          ),
          qNum(
            'MOD05-T2-Q2',
            5,
            'MOD05-T2',
            'Calculate deflection reduction factor when rectangular depth increases by 25% (Example 5.1)',
            'In Syllabus Example 5.1, if the depth d of a rectangular section is increased by 25% (d_new = 1.25 d_old) while keeping breadth, span, and UDL constant, what is the ratio of the new deflection to the old deflection (δ_new / δ_old)?',
            0.512,
            'ratio',
            'Since I = bd³/12, I_new = 1.25³ I_old = 1.953125 I_old. Therefore δ_new / δ_old = 1 / 1.25³ = 0.8³ = 0.512 (nearly halving the deflection).',
            'Demonstrates the cubic leverage of section depth on flexural stiffness.'
          ),
          qMcq(
            'MOD05-T2-Q3',
            5,
            'MOD05-T2',
            'Explain why span L appears to the fourth power (L⁴) under a UDL',
            'Why does the maximum deflection of a beam under a uniform distributed load w vary with the FOURTH power of the span (L⁴), whereas under a single point load P it varies with L³?',
            [
              'Because under a constant UDL w (kN/m), increasing L also increases the total load W = wL proportionally to L (making M ∝ wL²), and integrating curvature M/EI twice over length L introduces two further powers of L (L² × L² = L⁴)',
              'Because Young’s modulus E decreases as L increases',
              'Because shear deformation is proportional to L⁴',
              'It is an arbitrary empirical curve fit with no mathematical derivation',
            ],
            0,
            'M_max ∝ wL² (or PL for point load), and double integration of curvature d²y/dx² = M/EI over [0, L] multiplies by L², giving wL⁴/(EI) for UDL and PL³/(EI) for point load.',
            'Module 5 Gate requirement: explain why span is so influential.'
          ),
          qMcq(
            'MOD05-T2-Q4',
            5,
            'MOD05-T2',
            'Explain why higher steel grade does not alter elastic deflection (Example 5.1)',
            'Why does upgrading a steel beam from S275 to S355 (or S460) while keeping the exact same section size not reduce its elastic deflection under service loads?',
            [
              'Because elastic deflection is governed solely by Young’s modulus E and second moment of area I, and all grades of structural carbon steel share the same Young’s modulus E ≈ 210,000 N/mm²',
              'Because S355 is heavier than S275',
              'Because S355 only works at the Ultimate Limit State',
              'Because higher steel grade reduces the second moment of area I',
            ],
            0,
            'Yield strength fy determines when elastic behaviour ends, not the slope E of the elastic line.',
            'Syllabus Example 5.1 key takeaway.'
          ),
          qNum(
            'MOD05-T2-Q5',
            5,
            'MOD05-T2',
            'Compare deflection when span is doubled under a UDL',
            'If the span L of a simply supported beam carrying a uniform distributed load w is doubled (from L to 2L) without changing the beam section, by what factor does the midspan deflection increase?',
            16,
            'factor',
            '(2L / L)⁴ = 2⁴ = 16.',
            'Highlights why long-span beams are almost always governed by serviceability deflection or vibration rather than ULS shear.'
          ),
        ],
      },
      {
        id: 'MOD05-T3',
        moduleNumber: 5,
        code: '5.3',
        title: 'Serviceability Limit State (SLS), Damage Consequences & Vibration (Example 5.2)',
        summary:
          'Covers ULS vs SLS distinction, physical consequences of excessive deflection (cracking brittle finishes/partitions, binding doors/windows, rainwater ponding on flat roofs, sag appearance, floor bounce), creep/moisture effects, and floor vibration awareness.',
        subtopics: [
          'ULS (safety against collapse, rupture, buckling, overturning) vs SLS (normal use, comfort, appearance, durability)',
          'Syllabus Example 5.2: physical consequences of SLS failure (cracked plaster/glazing, binding doors, flat-roof ponding, bouncy floors)',
          'Why total deflection vs deflection occurring after installation of brittle finishes are distinguished',
          'Long-term deflection modifiers: concrete creep/shrinkage and timber moisture creep (k_def)',
          'Floor vibration introductory awareness: natural frequency f_n increases with stiffness and decreases with mass',
        ],
        learningObjectives: [
          'Distinguish ULS and SLS checks and state the physical consequences each check prevents (Example 5.2).',
          'Explain flat-roof ponding instability and why post-construction deflection matters for brittle partitions.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Guide to variable-action vs total-load deflection checks and precambering.',
          workedExamplesPlanned: 'Example 5.2 ULS vs SLS engineering note.',
          calculationsPlanned: 'Fundamental natural frequency estimation f ≈ 18 / √δ_static.',
          sourceReferencesNeeded: 'SCI, Concrete Centre, and TRADA guidance on deflection limits.',
        },
        questions: [
          qMcq(
            'MOD05-T3-Q1',
            5,
            'MOD05-T3',
            'Distinguish ULS and SLS physical consequences (Example 5.2 & Module 5 Gate)',
            'A steel transfer beam supporting a glazed masonry facade above a shopfront is checked at both ULS and SLS. What physical consequences do the ULS check and the SLS deflection check respectively guard against?',
            [
              'The ULS check prevents catastrophic structural collapse (yielding, plastic mechanism, LTB, shear or bearing failure under factored extreme loads), while the SLS deflection check prevents cracking of the masonry/plaster, shattering or jamming of the shopfront glazing/doors, and visible sag under normal working loads',
              'The ULS check prevents paint peeling, while the SLS check prevents collapse in an earthquake',
              'Both ULS and SLS check only the ultimate fracture strength of the bolts',
              'SLS checks use higher partial safety factors on loads than ULS checks',
            ],
            0,
            'A beam can easily pass ULS strength checks (especially in high-strength S355 steel) yet deflect enough under unfactored working loads to crack masonry and jam glazing.',
            'Directly addresses Syllabus Example 5.2 and Module 5 Gate.'
          ),
          qMcq(
            'MOD05-T3-Q2',
            5,
            'MOD05-T3',
            'Explain rainwater ponding risk on flexible flat roofs',
            'Why is excessive elastic deflection particularly dangerous on a long-span, low-pitch or flat roof beam?',
            [
              'Deflection creates a dish (saucer) where rainwater collects; the weight of the pooled water causes further deflection, which holds still more water (progressive ponding), potentially escalating an SLS deflection issue into a ULS overload collapse',
              'Rainwater increases the Young’s modulus of steel',
              'Flat roofs never experience imposed snow or rain loads',
              'Ponding only occurs on vertical columns',
            ],
            0,
            'Ponding is a classic interaction where insufficient flexural stiffness leads to progressive gravity load accumulation.',
            'Key understanding item in Module 5 syllabus.'
          ),
          qMcq(
            'MOD05-T3-Q3',
            5,
            'MOD05-T3',
            'Understand why deflection occurring AFTER erection of brittle partitions is checked separately',
            'In building design, why do engineers often check the deflection due to imposed actions (and permanent finishes applied after framing) against a stricter limit (such as span/360) than the initial self-weight deflection of the bare structural frame?',
            [
              'Because the bare steel or concrete frame deflects under its own self-weight before the brittle plasterboard partitions, ceilings, and glazing are installed, so only the subsequent deflection after installation deforms and cracks those finishes',
              'Because structural self-weight does not cause any deflection',
              'Because imposed loads act upwards',
              'Because self-weight is only checked at ULS',
            ],
            0,
            'Finishes installed after the dead load of the bare slab/beam has already taken place only experience the incremental deflection from subsequent finishes, partitions, creep, and variable imposed loads.',
            'Practical serviceability engineering judgement.'
          ),
          qMcq(
            'MOD05-T3-Q4',
            5,
            'MOD05-T3',
            'Understand floor vibration fundamentals',
            'A long-span lightweight steel or timber floor passes static strength checks but feels uncomfortably bouncy when people walk across it. How is the fundamental natural frequency of a floor related to its static deflection δ under self-weight?',
            [
              'Higher static deflection corresponds to a lower natural frequency (f_n ≈ 18 / √δ_mm Hz); when the natural frequency drops too low (e.g. below 4–8 Hz), it approaches harmonics of human walking pace and resonates noticeably',
              'More flexible floors with larger static deflection have a higher natural frequency',
              'Floor vibration depends only on ultimate tensile strength f_u',
              'Adding heavy partition loads without increasing stiffness always increases natural frequency',
            ],
            0,
            'For a single-degree-of-freedom oscillator, ω_n = √(k/m) = √(g / δ_static), so larger static deflection means lower natural frequency and greater susceptibility to footfall resonance.',
            'Module 5 floor vibration introductory awareness.'
          ),
          qNum(
            'MOD05-T3-Q5',
            5,
            'MOD05-T3',
            'Calculate span/360 serviceability deflection limit',
            'For a 7.2 m span floor beam supporting brittle plaster finishes, calculate the allowable deflection limit (in mm) if the project specification sets the limit for imposed-load deflection at Span / 360.',
            20,
            'mm',
            'δ_lim = 7,200 mm / 360 = 20.0 mm.',
            'Note: deflection limits in UK practice should always be verified against the UK National Annex and project/client specification.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-5.1',
        code: 'Example 5.1',
        title: 'Deflection under UDL parametric comparison',
        kind: 'worked_example',
        description:
          'For a simply supported beam: δmax = 5wL⁴/(384EI). Compare the effect of: increasing span from 4 m to 5 m; increasing depth by 25%; using a higher steel grade without changing section geometry. Explain why increased steel grade does not materially alter elastic deflection.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topics 5.1 & 5.2 & Module 5 Assessment',
        selfReviewChecklist: [
          'Show (5/4)⁴ = 2.44× increase when span increases from 4 m to 5 m.',
          'Show 1 / 1.25³ = 0.512× reduction when rectangular depth increases by 25%.',
          'State clearly that E is invariant across S235/S275/S355/S460 so elastic deflection is unchanged.',
        ],
      },
      {
        id: 'EX-5.2',
        code: 'Example 5.2',
        title: 'SLS note',
        kind: 'practical_exercise',
        description:
          'Take one beam example and write: likely ULS concern; likely SLS concern; what physical consequence each check addresses.',
        requiresCalcNote: true,
        statusLabel: 'Self-Review / Independent Review Practice Activity',
        selfReviewChecklist: [
          'State ULS concerns: flexural yielding/plastification, LTB, web shear, support bearing crushing.',
          'State SLS concerns: cracking partitions/masonry, jamming doors/windows, roof ponding, visual sag, footfall bounce.',
        ],
      },
    ],
    resources: [
      'Hibbeler Mechanics of Materials: beam deflection chapters.',
      'Jeff Hanson: beam deflection.',
      'SCI, Concrete Centre, and TRADA guidance on deflection limits later.',
    ],
    standardsNotice:
      'Elastic deflection formulas are exact first-principles mechanics. Specific numeric deflection ratios (such as L/200, L/250, L/360, or L/500 for lintels supporting masonry) depend on the UK National Annex and client/project brief.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD05-E01',
        5,
        'MOD05-T1',
        'Calculate midspan deflection of simply supported beam under UDL',
        'A 5,000 mm simply supported steel beam (E = 200,000 N/mm², I = 125 × 10⁶ mm⁴) carries an unfactored service UDL of w = 9.6 kN/m (9.6 N/mm). Calculate the midspan deflection δ = 5wL⁴ / (384EI) in mm.',
        3.125,
        'mm',
        '5 × 9.6 × 5,000⁴ = 48 × 6.25 × 10¹⁴ = 3.0 × 10¹⁶. 384 × 200,000 × 125 × 10⁶ = 9.6 × 10¹⁵. δ = 3.0×10¹⁶ / 9.6×10¹⁵ = 3.125 mm.',
        'Consistent (mm, N) units.'
      ),
      qNum(
        'MOD05-E02',
        5,
        'MOD05-T1',
        'Calculate midspan deflection under a central point load',
        'A 6,000 mm simply supported beam (E = 210,000 N/mm², I = 180 × 10⁶ mm⁴) carries a central serviceability point load of P = 42 kN (42,000 N). Calculate the midspan deflection δ = PL³ / (48EI) in mm.',
        5,
        'mm',
        'Numerator = 42,000 × 6,000³ = 9.072 × 10¹⁵. Denominator = 48 × 210,000 × 180 × 10⁶ = 1.8144 × 10¹⁵. δ = 9.072 / 1.8144 = 5.0 mm.',
        'Elastic small-deflection formula.'
      ),
      qNum(
        'MOD05-E03',
        5,
        'MOD05-T1',
        'Calculate cantilever tip deflection under UDL',
        'A 2,400 mm cantilever beam (E = 200,000 N/mm², I = 36 × 10⁶ mm⁴) carries a service UDL of w = 5.0 kN/m (5.0 N/mm). Calculate the free-tip deflection δ = wL⁴ / (8EI) in mm.',
        2.88,
        'mm',
        'Numerator = 5.0 × 2,400⁴ = 5.0 × 3.31776 × 10¹³ = 1.65888 × 10¹⁴. Denominator = 8 × 200,000 × 36 × 10⁶ = 5.76 × 10¹³. δ = 1.65888 / 5.76 = 2.88 mm.',
        'Cantilever UDL tip deflection.'
      ),
      qNum(
        'MOD05-E04',
        5,
        'MOD05-T1',
        'Calculate combined deflection by superposition',
        'If the 2,400 mm cantilever in the previous question (δ_UDL = 2.88 mm, E = 200,000 N/mm², I = 36 × 10⁶ mm⁴) also carries a downward service point load of P = 4.5 kN (4,500 N) at its free tip, calculate the TOTAL tip deflection in mm.',
        5.76,
        'mm',
        'δ_point = PL³ / (3EI) = (4,500 × 2,400³) / (3 × 200,000 × 36 × 10⁶) = (6.2208 × 10¹³) / (2.16 × 10¹³) = 2.88 mm. By superposition, δ_total = 2.88 + 2.88 = 5.76 mm.',
        'Linear elastic superposition.'
      ),
      qNum(
        'MOD05-E05',
        5,
        'MOD05-T2',
        'Calculate factor increase in UDL deflection when span increases from 4 m to 5 m (Example 5.1)',
        'What is the exact numerical ratio (5 / 4)⁴ representing the factor increase in UDL deflection when a simply supported span increases from 4.0 m to 5.0 m (to 2 decimal places)?',
        2.44,
        'ratio',
        '(5 / 4)⁴ = 625 / 256 = 2.4414 ≈ 2.44.',
        'Syllabus Example 5.1.'
      ),
      qNum(
        'MOD05-E06',
        5,
        'MOD05-T2',
        'Calculate factor increase in point-load deflection when span increases from 4 m to 5 m',
        'If a simply supported beam carries a single fixed central point load P (instead of a UDL w), by what factor (5 / 4)³ does its midspan deflection increase when the span is increased from 4.0 m to 5.0 m (to 2 decimal places)?',
        1.95,
        'ratio',
        'For a fixed point load P, δ = PL³/(48EI) ∝ L³, so (5 / 4)³ = 125 / 64 = 1.953 ≈ 1.95.',
        'Contrast L³ for a constant point load with L⁴ for a constant UDL intensity w.'
      ),
      qNum(
        'MOD05-E07',
        5,
        'MOD05-T1',
        'Calculate radius of curvature R and curvature κ of a bent beam',
        'A steel beam segment with E = 200,000 N/mm² and I = 50 × 10⁶ mm⁴ is subjected to a constant bending moment M = 25 kN·m. Calculate its curvature κ = M / (EI) in units of 10⁻⁶ mm⁻¹.',
        2.5,
        '10⁻⁶ mm⁻¹',
        'EI = 200,000 × 50 × 10⁶ = 1.0 × 10¹³ N·mm². M = 25 × 10⁶ N·mm. κ = M / (EI) = 25×10⁶ / 10¹³ = 2.5 × 10⁻⁶ mm⁻¹ (radius of curvature R = 1/κ = 400,000 mm = 400 m).',
        'Curvature κ is the rate of change of slope dθ/dx along the beam.'
      ),
      qNum(
        'MOD05-E08',
        5,
        'MOD05-T3',
        'Calculate effective long-term deflection of timber/concrete using a creep factor',
        'A beam has an instantaneous elastic deflection under permanent actions of δ_inst,G = 6.0 mm. If long-term creep under permanent load amplifies the permanent-load deflection by a creep factor (1 + φ) = 2.5, and the instantaneous deflection under variable imposed load is δ_inst,Q = 4.0 mm, what is the total long-term deflection in mm?',
        19,
        'mm',
        'δ_total,long-term = δ_inst,G × (1 + φ) + δ_inst,Q = (6.0 × 2.5) + 4.0 = 15.0 + 4.0 = 19.0 mm.',
        'Illustrates how long-term creep in concrete or timber amplifies permanent-load deflections.'
      ),
      qNum(
        'MOD05-E09',
        5,
        'MOD05-T3',
        'Estimate fundamental natural frequency of a floor beam from static deflection',
        'Using the engineering rule-of-thumb formula f_n ≈ 18 / √δ_mm (where δ_mm is the instantaneous static deflection in mm under the self-weight and permanent mass participating in vibration), estimate the natural frequency in Hz if δ_mm = 9.0 mm.',
        6,
        'Hz',
        'f_n ≈ 18 / √9.0 = 18 / 3.0 = 6.0 Hz.',
        'Derived from f_n = (1 / 2π) √(g / δ) with g = 9,810 mm/s².'
      ),
      qNum(
        'MOD05-E10',
        5,
        'MOD05-T3',
        'Calculate required precamber to offset permanent dead-load sag',
        'A long-span steel roof beam has a calculated permanent dead-load deflection of 22 mm and an imposed snow/live load deflection of 18 mm. If the engineer specifies a workshop upward precamber equal to 100% of the permanent dead-load deflection, what is the net downward sag below the horizontal datum under full permanent + imposed service load?',
        18,
        'mm',
        'Net sag below datum = 22 mm (dead) + 18 mm (imposed) − 22 mm (upward precamber) = 18 mm.',
        'Precambering offsets visual dead-load sag, though it does not reduce the live-load movement range or floor bounce.'
      ),
      qMcq(
        'MOD05-E11',
        5,
        'MOD05-T3',
        'Understand why precambering does NOT cure a bouncy floor or brittle partition cracking',
        'Why does upward precambering of a steel beam NOT solve a problem with excessive live-load deflection cracking brittle partitions or causing footfall vibration?',
        [
          'Because precamber only builds in an initial upward curve before loading; it does not increase the beam’s flexural stiffness EI, so the incremental movement Δδ when live loads are applied and removed (and the natural frequency) remains identical',
          'Because precamber reduces the Young’s modulus E of the steel by 50%',
          'Because precambered beams cannot carry any dead load',
          'Because precamber reverses the direction of gravity',
        ],
        0,
        'Brittle finishes built onto the beam after erection feel the subsequent movement Δδ, and vibration depends on dynamic stiffness EI, neither of which is improved by initial precamber.',
        'Important practical engineering distinction.'
      ),
      qMcq(
        'MOD05-E12',
        5,
        'MOD05-T2',
        'Compare deflection of a cantilever vs a simply supported beam of equal length L',
        'Two identical beams of length L and flexural rigidity EI each carry the same uniform distributed load w. Beam 1 is simply supported at both ends (δ = 5wL⁴/384EI), while Beam 2 is a cantilever fixed at one end (δ = wL⁴/8EI = 48wL⁴/384EI). How does the cantilever tip deflection compare to the simply supported midspan deflection?',
        [
          'The cantilever tip deflects 9.6 times (48 / 5) as much as the simply supported beam of the same length L',
          'The cantilever deflects less because it has a fixed support',
          'Both beams have the exact same maximum deflection',
          'The simply supported beam deflects 8 times more than the cantilever',
        ],
        0,
        '(1/8) / (5/384) = 384 / 40 = 9.6. Cantilevers are nearly an order of magnitude more flexible for a given length L.',
        'Explains why cantilevers require much deeper sections or stricter span-to-depth ratios.'
      ),
      qMcq(
        'MOD05-E13',
        5,
        'MOD05-T1',
        'Understand the effect of end rotational restraint on midspan deflection',
        'If the ends of a simply supported beam under a full-span UDL are changed from frictionless pins (δ = 5wL⁴/384EI) to fully fixed supports (δ = wL⁴/384EI), how does the midspan deflection change?',
        [
          'It reduces to one-fifth (20%) of the simply supported deflection because the hogging end moments reduce the net sagging curvature in the span',
          'It increases by a factor of 5',
          'It remains unchanged because span L is the same',
          'It becomes negative (upwards)',
        ],
        0,
        'Rotational end fixity introduces hogging moments (-wL²/12) at the supports, reducing midspan sagging moment to +wL²/24 and slashing midspan deflection by a factor of 5.',
        'Shows the strong influence of support boundary conditions on stiffness.'
      ),
      qMcq(
        'MOD05-E14',
        5,
        'MOD05-T3',
        'Identify why lintels supporting new openings in existing masonry walls need tight deflection control',
        'When installing a new steel beam to form an opening in an existing load-bearing brick wall (Module 11 / Module 5 interface), why do UK engineers typically limit the beam deflection to a very tight value (often span/500 or max a few millimetres) rather than only checking ULS bending strength?',
        [
          'Because existing brickwork above the opening is brittle and stiff; if the steel beam deflects appreciably before carrying its load, the masonry above cracks, arches unpredictably, or jams upper-floor windows and doors',
          'Because steel beams under masonry walls have a lower yield strength',
          'Because masonry walls apply upward suction loads',
          'Because deflection limits replace the need for padstones',
        ],
        0,
        'Stiffness compatibility: a flexible beam underneath stiff brittle masonry cannot pick up the wall load without first allowing the wall above to settle and crack.',
        'Crucial link between temporary/alteration works and SLS design.'
      ),
      qMcq(
        'MOD05-E15',
        5,
        'MOD05-T3',
        'Explain why ULS and SLS use different load combinations',
        'Why are Serviceability Limit State (SLS) deflection checks normally carried out using unfactored characteristic (or frequent/quasi-permanent) actions (γ_F = 1.0) rather than the heavily factored ULS load combinations (e.g. 1.35G + 1.5Q)?',
        [
          'Because SLS assesses realistic everyday deformation, comfort, and appearance under working conditions, whereas ULS partial factors account for rare extreme overloads and collapse risk',
          'Because beams only deflect when partial factors are 1.0',
          'Because Eurocode prohibits calculating moments at SLS',
          'Because ULS combinations give smaller loads than SLS combinations',
        ],
        0,
        'SLS checks realistic in-service behaviour; ULS checks low-probability collapse survival.',
        'Bridges Module 5 to Module 7 (Eurocode philosophy).'
      ),
      qMcq(
        'MOD05-E16',
        5,
        'MOD05-T3',
        'Identify moisture effect on timber beam deflection',
        'A timber roof beam is installed in an unheated, damp semi-external canopy (high service class) rather than a dry heated living room. How does the higher moisture environment affect its long-term deflection under permanent load?',
        [
          'Higher moisture content increases mechano-sorptive creep in timber (represented by a larger deformation factor k_def in EC5), causing significantly greater long-term sag',
          'Higher moisture content makes timber stiffer and eliminates creep',
          'Moisture only affects steel beams, not timber beams',
          'Long-term deflection is always zero in timber',
        ],
        0,
        'Moisture plasticises wood cell walls and accelerates long-term creep deformation under sustained stress.',
        'Module 5 moisture movement in timber awareness.'
      ),
      qNum(
        'MOD05-E17',
        5,
        'MOD05-T1',
        'Calculate end rotation slope θ of a simply supported UDL beam',
        'For a simply supported beam of span L = 4,000 mm, E = 200,000 N/mm², and I = 80 × 10⁶ mm⁴ carrying a service UDL of w = 6.0 N/mm, calculate the end rotation angle θ = wL³ / (24EI) at the supports in milliradians (10⁻³ rad).',
        1,
        'mrad',
        'θ = (6.0 × 4,000³) / (24 × 200,000 × 80 × 10⁶) = (3.84 × 10¹¹) / (3.84 × 10¹⁴) = 0.0010 rad = 1.0 mrad.',
        'End rotation must be accommodated by simple fin-plate/flexible end-plate connections.'
      ),
      qNum(
        'MOD05-E18',
        5,
        'MOD05-T2',
        'Calculate required percentage increase in I to reduce deflection from 24 mm to 16 mm',
        'A preliminary beam trial gives an elastic deflection of 24 mm under service load, whereas the allowable limit is 16 mm. By what minimum factor (I_new / I_old) must the second moment of area I be increased (ignoring small self-weight change) to meet the 16 mm limit?',
        1.5,
        'factor',
        'Since δ ∝ 1/I, I_new / I_old = δ_old / δ_lim = 24 / 16 = 1.50 (a 50% increase in I).',
        'Direct scaling for section re-selection.'
      ),
      qMcq(
        'MOD05-E19',
        5,
        'MOD05-T1',
        'Identify when shear deflection becomes non-negligible compared to bending deflection',
        'Standard beam deflection formulas like δ = 5wL⁴/(384EI) include only flexural (bending) deformation and neglect shear deformation. In which situation can shear deflection become a significant fraction of total deflection?',
        [
          'In very short, deep beams (low span-to-depth ratio L/d < 5) or beams with very thin/perforated webs (such as cellular beams or plywood box beams)',
          'In very long, slender beams with span-to-depth ratio L/d > 30',
          'Whenever the load is zero',
          'Only when the beam is made of solid square bar at L/d = 40',
        ],
        0,
        'Bending deflection scales as L³ or L⁴ whereas shear deflection scales as L¹, so as L/d becomes very small (deep beams) or web shear stiffness GA_v is low, shear deformation is no longer negligible.',
        'Important assumption/limitation of Euler-Bernoulli deflection theory.'
      ),
      qMcq(
        'MOD05-E20',
        5,
        'MOD05-T3',
        'Connect stiffness vs strength to temporary works propping',
        'When jacking or wedging a temporary works needle beam to pick up load from an existing wall before removing masonry below, why is the elastic deflection of the needle beam critical?',
        [
          'Unless the needle beam is stiff enough (or pre-loaded/wedged to take up its elastic deflection), the wall above must drop by the beam’s deflection δ = PL³/(48EI) before the beam develops the full reaction P, allowing the wall to settle and crack',
          'Because temporary needle beams do not obey Hooke’s law',
          'Because deflection only occurs after the permanent beam is removed',
          'Because temporary works never require SLS checks',
        ],
        0,
        'Load transfer requires deformation compatibility; passive propping without pre-wedging/stiffness control allows settlement equal to the elastic shortening/deflection of the temporary support.',
        'Direct temporary works engineering application.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 6: FAILURE MODES, BUCKLING, RESTRAINT AND STABILITY               */
  /* ======================================================================== */
  {
    moduleNumber: 6,
    code: 'MOD-06',
    title: 'Module 6: Failure modes, buckling, restraint and stability',
    shortTitle: 'Failure modes, buckling, restraint and stability',
    suggestedDuration: '10–12 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 7–8',
    whyItMatters:
      'Most real structural collapses—especially during construction and temporary works stages—are stability or buckling failures (Euler column buckling, LTB, missing bracing, overturning) rather than simple material overstress.',
    introduction:
      'Contrasts material-related failure modes (yielding, rupture, crushing, shear, bearing, fatigue, brittle fracture) against stability-related failure modes (local buckling, flexural/torsional buckling, Lateral Torsional Buckling, global sway, overturning, sliding). Covers Euler critical load P_cr = π²EI/L_cr², effective lengths, compression-flange restraint against LTB, building stability systems, and why intermediate construction stages are often more vulnerable than the completed structure.',
    objectives: [
      'Distinguish material strength failures from geometric stability/buckling failures across beams, columns, frames, connections, walls, and foundations.',
      'Calculate Euler buckling loads and explain how end restraints and intermediate bracing change effective length L_cr and critical load P_cr (Example 6.1).',
      'Explain the physical mechanism of Lateral Torsional Buckling (LTB) and what constitutes effective compression-flange or torsional restraint (Example 6.2).',
      'Trace lateral stability systems (braced frames, moment frames, shear walls, diaphragms) and identify construction-stage stability risks (Examples 6.3 and 6.4).',
    ],
    learningGate: [
      'List credible failure modes for a beam, column, frame, connection, wall, and foundation.',
      'Distinguish strength failure from stability failure clearly.',
      'Explain Lateral Torsional Buckling (LTB) in your own words without relying on code jargon.',
      'Identify effective length and restraint assumptions and what makes them valid in reality.',
      'Identify a complete lateral load path from wind/notional load to the foundations.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4, 5],
    topics: [
      {
        id: 'MOD06-T1',
        moduleNumber: 6,
        code: '6.1',
        title: 'Material Failure vs Stability Failure & Euler Column Buckling (Example 6.1)',
        summary:
          'Contrasts material failures (yielding, crushing, rupture, shear, bearing) with stability failures, derives/applies Euler critical load P_cr = π²EI/L_cr² (Example 6.1), and explains effective length L_cr, slenderness λ = L_cr/i, and why increasing area A alone may not efficiently solve a buckling problem.',
        subtopics: [
          'Material failure modes: yielding, tensile rupture, compression crushing, shear, bearing, fatigue, brittle fracture',
          'Stability failure modes: local plate buckling, flexural column buckling, torsional/flexural-torsional buckling',
          'Euler critical buckling load: P_cr = π² E I / L_cr² (governed by minor-axis I_min unless restrained)',
          'Effective length factors (L_cr / L): pinned-pinned (1.0), fixed-fixed non-sway (0.5), fixed-pinned (0.7), fixed-free cantilever column (2.0)',
          'Syllabus Example 6.1: comparing pinned-pinned vs fixed-fixed columns of equal section and length',
          'Imperfection sensitivity and why real columns buckle below the ideal Euler curve',
        ],
        learningObjectives: [
          'Compare Euler buckling loads for different end restraints (Example 6.1) and identify which axis governs.',
          'Explain why increasing second moment of area I (or reducing L_cr) is far more efficient than adding solid area A for slender struts.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Perry-Robertson imperfection curves and residual stress effects in rolled steel columns.',
          workedExamplesPlanned: 'Example 6.1 full comparison and slenderness ratio λ = L_cr / i calculation.',
          calculationsPlanned: 'Biaxial effective length checks when minor axis has intermediate tie restraints.',
          sourceReferencesNeeded: 'Hibbeler Mechanics of Materials: columns/buckling.',
        },
        questions: [
          qNum(
            'MOD06-T1-Q1',
            6,
            'MOD06-T1',
            'Compare Euler buckling load of fixed-fixed vs pinned-pinned column (Example 6.1)',
            'Compare two ideal elastic columns of identical cross-section (EI) and physical length L (Syllabus Example 6.1). Column 1 is pinned-pinned (L_cr = 1.0 L) and Column 2 is ideal fixed-fixed non-sway (L_cr = 0.5 L). What is the ratio of their Euler critical loads (P_cr,fixed / P_cr,pinned)?',
            4,
            'ratio',
            'Since P_cr = π²EI / L_cr², halving the effective length from 1.0 L to 0.5 L multiplies P_cr by 1 / (0.5)² = 4.0.',
            'Note: in practical steel design (EN 1993-1-1 / BS 5975), a conservative effective length factor of 0.7L is often used instead of the theoretical 0.5L because real connections are never infinitely rigid.'
          ),
          qNum(
            'MOD06-T1-Q2',
            6,
            'MOD06-T1',
            'Calculate Euler critical load P_cr of a pinned-pinned strut',
            'A 3,000 mm long pin-ended steel strut has E = 210,000 N/mm² and minor-axis second moment of area I_z = 4.5 × 10⁶ mm⁴ (with major-axis I_y = 18.0 × 10⁶ mm⁴ and no intermediate restraints). Calculate its Euler critical buckling load P_cr = π² E I_min / L_cr² in kN (to 1 decimal place).',
            1036.3,
            'kN',
            'An unrestrained pin-ended strut buckles about its weakest axis (I_z = 4.5 × 10⁶ mm⁴). P_cr = (π² × 210,000 × 4.5 × 10⁶) / 3,000² = (9.8696 × 9.45 × 10¹¹) / (9.0 × 10⁶) = 1,036,308 N ≈ 1,036.3 kN.',
            'Always use the minimum I_z (or largest slenderness L_cr / i) when effective lengths about both axes are equal.'
          ),
          qNum(
            'MOD06-T1-Q3',
            6,
            'MOD06-T1',
            'Calculate Euler buckling load of a freestanding flagpole/cantilever column',
            'If the same 3,000 mm long column (P_cr,pinned = 1,036.3 kN for L_cr = L) is instead fixed at its base and completely free to sway and rotate at its top (so L_cr = 2.0 L = 6,000 mm), what does its Euler critical load P_cr drop to in kN?',
            259.1,
            'kN',
            'Doubling L_cr from 1.0 L to 2.0 L divides P_cr by 2² = 4: 1,036.3 / 4 = 259.08 kN ≈ 259.1 kN.',
            'Shows why unbraced freestanding cantilever columns have 4 times lower elastic buckling capacity than braced pin-ended columns.'
          ),
          qMcq(
            'MOD06-T1-Q4',
            6,
            'MOD06-T1',
            'Explain why increasing area A alone may not efficiently solve a buckling problem',
            'A slender solid round steel rod is failing by elastic Euler buckling under compression. Why is switching to a hollow circular tube of larger outer diameter (even with the same or slightly smaller cross-sectional area A) much more effective than simply using a slightly thicker solid rod?',
            [
              'Because elastic buckling is governed by second moment of area I (and radius of gyration i = √(I/A)), not area A alone; moving the steel outward into a hollow tube dramatically increases I and i without adding weight',
              'Because hollow tubes have a higher Young’s modulus E than solid rods',
              'Because Euler’s formula P_cr = π²EI/L_cr² does not depend on I',
              'Because solid rods cannot carry compression',
            ],
            0,
            'In Euler buckling, yield strength fy does not appear and area A only helps to the extent that it increases I = A·i². Spreading material away from the centroid maximises i.',
            'Explicit syllabus Learn point under Buckling fundamentals.'
          ),
          qMcq(
            'MOD06-T1-Q5',
            6,
            'MOD06-T1',
            'Explain why real columns fail below the ideal Euler buckling load',
            'Why does a real structural steel column of intermediate slenderness buckle at an axial load significantly lower than both the squash load (A·f_y) and the theoretical Euler load (π²EI/L_cr²)?',
            [
              'Because real columns contain initial geometric out-of-straightness (bow imperfections), residual stresses locked in from hot-rolling/welding, and minor load eccentricities that induce bending and early yielding on the concave side before P_cr is reached',
              'Because gravity acts horizontally on intermediate columns',
              'Because π² is smaller for steel than for timber',
              'Because real columns have zero flexural stiffness',
            ],
            0,
            'Initial bow e₀ creates a second-order bending moment P·(e₀ + δ) that causes the concave compression flange to yield and lose tangent stiffness E_t before reaching the elastic bifurcation load P_cr.',
            'Imperfection sensitivity in column buckling.'
          ),
        ],
      },
      {
        id: 'MOD06-T2',
        moduleNumber: 6,
        code: '6.2',
        title: 'Lateral Torsional Buckling (LTB) & Effective Restraint (Example 6.2)',
        summary:
          'Covers the physical mechanism of Lateral Torsional Buckling (compression flange buckling sideways accompanied by twisting of the cross-section), effective restraint points, torsional restraint at supports, and destabilising top-flange loads (Example 6.2).',
        subtopics: [
          'Physical mechanism of LTB: the compression flange behaves like a strut, buckles laterally between restraints, and twists the beam cross-section',
          'Syllabus Example 6.2: sketching tension flange, compression flange, lateral displacement, twisting, and restraint points',
          'What constitutes true lateral restraint: must restrain the COMPRESSION flange (or prevent twist) back to a braced node',
          'Why bottom-flange restraint alone does not prevent top-flange LTB in a sagging beam (unless combined with stiff web/torsional restraint)',
          'Destabilising loads applied to the top compression flange without lateral restraint',
        ],
        learningObjectives: [
          'Explain LTB in plain physical terms and identify which flange requires restraint in sagging vs hogging regions (Example 6.2).',
          'Recognise when a floor/purlin detail does or does not provide effective LTB restraint.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Annotated diagrams of restrained vs unrestrained compression flanges in floor and roof steelwork.',
          workedExamplesPlanned: 'Example 6.2 complete annotated LTB sketch and restraint checklist.',
          calculationsPlanned: 'Unrestrained length L_LT identification across beams with secondary joists.',
          sourceReferencesNeeded: 'SteelConstruction.info LTB and bracing guidance.',
        },
        questions: [
          qMcq(
            'MOD06-T2-Q1',
            6,
            'MOD06-T2',
            'Explain Lateral Torsional Buckling (LTB) physically (Example 6.2 & Module 6 Gate)',
            'When a long, deep steel I-beam is bent about its strong (major) axis under downward gravity load without intermediate lateral bracing, what happens physically during Lateral Torsional Buckling (LTB)?',
            [
              'The top flange is in axial compression and behaves like a slender column; it buckles sideways (laterally) about its weak minor axis while the tension bottom flange stays straighter, forcing the whole cross-section to twist torsionally and lose bending capacity before reaching full yield',
              'The bottom tension flange buckles sideways while the top flange stretches',
              'The beam shears cleanly in half vertically at the support without any sideways movement',
              'The beam elongates axially by 10% without bending',
            ],
            0,
            'LTB is a coupled lateral-buckling and twisting instability of a beam bent about its major axis when its compression flange is not adequately restrained laterally.',
            'Core Module 6 Gate requirement and Example 6.2.'
          ),
          qMcq(
            'MOD06-T2-Q2',
            6,
            'MOD06-T2',
            'Identify what is required for a restraint to effectively prevent LTB',
            'A simply supported steel beam is in sagging bending under gravity load. An engineer claims the beam is "fully laterally restrained" because timber joists rest loose on top of the top flange with no fixings and no bracing bay at the ends of the building. Why is this assumption unsafe?',
            [
              'Effective LTB restraint requires both positive connection to the compression flange (or torsional restraint) AND a stiff lateral load path (diaphragm or plan bracing) that transfers the restraint force (e.g. 2.5% of flange force) back to a braced line; unfixed loose members can simply slide or move sideways with the buckling flange',
              'Timber joists can never touch steel flanges',
              'Sagging beams only require restraint to the bottom tension flange',
              'LTB only occurs in concrete beams',
            ],
            0,
            'A restraint is only as good as its connection to the compression flange and the stiffness of the bracing system it ties back to.',
            'Directly links Module 6 LTB to Module 8 and Module 17 detailing.'
          ),
          qMcq(
            'MOD06-T2-Q3',
            6,
            'MOD06-T2',
            'Identify which flange is the compression flange in a cantilever or hogging region',
            'In a cantilever steel beam under downward gravity load (or over the internal support of a continuous beam), which flange is in compression and therefore vulnerable to Lateral Torsional Buckling?',
            [
              'The bottom flange (so a roof deck fixed only to the top tension flange does NOT automatically restrain the bottom compression flange against LTB unless torsional fly-bracing is provided)',
              'The top flange',
              'Neither flange is in compression in hogging',
              'Only the neutral axis is in compression',
            ],
            0,
            'In hogging (-M), the bottom flange is in compression and the top flange is in tension. Assuming top-flange roof decking restrains the bottom flange in a hogging portal haunch or cantilever without fly-stays is a classic design error!',
            'High-value practical steelwork insight.'
          ),
          qMcq(
            'MOD06-T2-Q4',
            6,
            'MOD06-T2',
            'Understand destabilising load-height effect on an unrestrained top flange',
            'Why is a gravity point load applied to the TOP flange of an unrestrained steel beam (with no lateral restraint at the load point) more severe for LTB than the same load suspended from the BOTTOM tension flange?',
            [
              'When the beam begins to twist during LTB, a vertical load sitting on the top flange moves sideways outside the shear centre and creates an additional twisting torque that amplifies the rotation (destabilising load), whereas a load hanging from the bottom flange pulls it back toward vertical',
              'Because the top flange is closer to the ceiling',
              'Because loads on the top flange double the vertical support reactions',
              'Because bottom-flange loads eliminate vertical shear force',
            ],
            0,
            'Top-flange loading above the shear centre creates a destabilising overturning torque P·(y_top · θ) as the section twists by angle θ.',
            'Crucial concept in temporary works runway beams and unrestrained lintels.'
          ),
          qNum(
            'MOD06-T2-Q5',
            6,
            'MOD06-T2',
            'Determine unrestrained buckling length L_LT between positive lateral restraints',
            'A 9.0 m simply supported steel beam is in sagging bending and has incoming secondary beams positively bolted to its top compression flange (and tied into a braced floor diaphragm) at the one-third points (x = 3.0 m and x = 6.0 m) as well as torsional/lateral restraints at both end supports (x = 0 and x = 9.0 m). What is the unrestrained segment length L_LT between lateral restraints?',
            3,
            'm',
            'The intermediate restraints divide the 9.0 m span into three equal laterally restrained sub-spans of 9.0 / 3 = 3.0 m.',
            'Reducing L_LT from 9.0 m to 3.0 m dramatically increases the LTB resistance of the beam.'
          ),
        ],
      },
      {
        id: 'MOD06-T3',
        moduleNumber: 6,
        code: '6.3',
        title: 'Building Stability, Frame Bracing & Construction-Stage Vulnerability (Examples 6.3 & 6.4)',
        summary:
          'Covers how single- and multi-storey buildings resist lateral wind and notional loads (braced frames, moment frames, shear walls, floor/roof diaphragms, ties) and why intermediate construction or alteration stages frequently lack permanent restraints (Examples 6.3 and 6.4).',
        subtopics: [
          'Syllabus Example 6.3: single-storey frame under horizontal load with (1) no bracing, (2) diagonal bracing, (3) rigid moment frame',
          'Building lateral load paths: cladding -> floor/roof diaphragm (or plan bracing) -> vertical braced bays / shear walls / cores -> foundations',
          'Overturning and sliding global stability of walls, frames, and foundations',
          'Syllabus Example 6.4: temporary vs permanent stability (bare steel frame before floor slab diaphragm; fresh masonry wall before roof restraint; wet concrete on deck before curing; precast units before permanent structural topping/ties)',
        ],
        learningObjectives: [
          'Explain how diagonal bracing vs moment frames resist horizontal sway (Example 6.3).',
          'Identify temporary construction stages where permanent restraints do not yet exist (Example 6.4).',
        ],
        futureExpansion: {
          lessonsPlanned: 'Complete 3D lateral load path tracing from wind on gable wall to foundation ground beams.',
          workedExamplesPlanned: 'Examples 6.3 and 6.4 annotated diagrams and temporary stability risk register.',
          calculationsPlanned: 'Bracing diagonal tension force and column uplift in a braced bay.',
          sourceReferencesNeeded: 'IStructE / SCI temporary stability guidance and BS 5975.',
        },
        questions: [
          qMcq(
            'MOD06-T3-Q1',
            6,
            'MOD06-T3',
            'Compare sway resistance in unbraced, diagonally braced, and moment frames (Example 6.3)',
            'In Syllabus Example 6.3, a horizontal wind load H acts at roof level on three single-storey frames with pinned bases: (1) pinned beam-to-column joints with no bracing; (2) pinned joints with a diagonal tension brace; (3) rigid moment-resisting beam-to-column joints. How does each system behave?',
            [
              'Frame 1 collapses sideways as a four-hinge sway mechanism; Frame 2 resists H efficiently via axial tension in the diagonal brace and axial forces in the columns/rafter (truss action); Frame 3 resists H by developing bending moments and shear in the columns and beam via the rigid knee joints',
              'All three frames resist H purely by axial compression in the beam',
              'Frame 1 is the stiffest because it has no diagonal brace',
              'Frame 3 carries zero bending moment in its columns',
            ],
            0,
            'Braced frames resist sway by axial triangulation (stiff and efficient), while moment frames resist sway by flexural bending of columns and beams (requiring stiff moment connections and deeper columns/beams).',
            'Directly answers Syllabus Example 6.3.'
          ),
          qMcq(
            'MOD06-T3-Q2',
            6,
            'MOD06-T3',
            'Identify temporary vs permanent stability risk during construction (Example 6.4)',
            'A steel composite floor beam is designed for the permanent condition assuming its top compression flange is continuously laterally restrained by the hardened concrete floor slab. At what intermediate stage is this beam at high risk of Lateral Torsional Buckling (Syllabus Example 6.4)?',
            [
              'During construction when heavy bundles of decking/rebar or wet concrete are placed on the bare steel beam before the concrete has cured (unless the metal decking or temporary plan bracing positively restrains the flange during the pour)',
              'Ten years after the concrete slab has hardened and bonded to the shear studs',
              'After the building is demolished',
              'Only when the floor carries zero load',
            ],
            0,
            'Wet concrete has zero shear stiffness to act as a diaphragm; during the pour it is a heavy gravity load (plus construction live load) acting on the steel beam before composite or slab diaphragm action exists!',
            'Directly addresses Syllabus Example 6.4 and Comment [UI1].'
          ),
          qMcq(
            'MOD06-T3-Q3',
            6,
            'MOD06-T3',
            'Identify temporary stability risk of precast concrete elements (Example 6.4 & Comment [UI1])',
            'Precast concrete hollowcore floor planks or precast columns/walls are erected onto bearings before structural screed, grouted joints, and perimeter tie bars are cast and cured. What governs stability in this temporary state?',
            [
              'Individual precast elements rely on friction/nominal bearings and temporary raking props or erection ties; without temporary bracing and sequenced grouting, horizontal wind, crane bump, or eccentric construction loads can cause overturning, bearing loss, or progressive collapse',
              'Precast elements automatically develop full monolithic diaphragm action the instant they touch the crane hook',
              'Temporary propping is never needed for precast walls',
              'Wind loads are zero during precast erection',
            ],
            0,
            'In the permanent state, grouted shear keys and perimeter ties create a monolithic floor diaphragm and tied wall system; in the temporary erection state, elements are discrete blocks requiring explicit temporary stability measures.',
            'Addresses Syllabus Example 6.4 and Syllabus Comment [UI1] (precast).'
          ),
          qNum(
            'MOD06-T3-Q4',
            6,
            'MOD06-T3',
            'Calculate tension in a diagonal brace of a single-storey braced bay',
            'A single-storey braced bay of width B = 4.0 m and height H = 3.0 m (diagonal length D = 5.0 m) resists a horizontal wind load of F_w = 24 kN at eaves level via a single tension diagonal running from the bottom-left pin to the top-right eaves node. Calculate the axial tension force T in the diagonal brace in kN.',
            30,
            'kN',
            'Horizontal equilibrium at the top node: T × cos(θ) = F_w, where cos(θ) = B / D = 4.0 / 5.0 = 0.80. Thus T = 24 / 0.80 = 30.0 kN.',
            'The vertical component T × sin(θ) = 30 × (3/5) = 18 kN induces uplift at the windward column base and compression in the leeward column.'
          ),
          qMcq(
            'MOD06-T3-Q5',
            6,
            'MOD06-T3',
            'Trace the role of a floor or roof diaphragm in building stability',
            'In a multi-storey building where vertical cross-bracing is provided in only two perimeter bays, how do horizontal wind loads acting on the intermediate unbraced frames reach the vertical braced bays?',
            [
              'The floor and roof slabs (or horizontal plan bracing) act as stiff horizontal deep beams (diaphragms) in their own plane, collecting horizontal loads from every frame line and transferring them horizontally to the vertical braced bays or shear cores',
              'The intermediate columns bend about their minor axis to carry 100% of the wind to the ground',
              'Wind loads vanish on intermediate frames',
              'Gravity loads cancel out the horizontal wind loads on intermediate frames',
            ],
            0,
            'A complete 3D lateral stability system requires BOTH vertical bracing/cores AND horizontal roof/floor diaphragms (or plan bracing) to tie every frame line into the vertical cores.',
            'Module 6 Gate: identify a complete lateral load path.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-6.1',
        code: 'Example 6.1',
        title: 'Euler column comparison',
        kind: 'worked_example',
        description:
          'Compare pinned-pinned and fixed-fixed columns of equal section and length. Use Pcr = π²EI/Lcr². Explain what changes when effective length reduces.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 6.1 & Module 6 Assessment',
        selfReviewChecklist: [
          'Sketch deflected buckling mode shapes and inflection points for Lcr = 1.0L vs Lcr = 0.5L.',
          'Show that halving Lcr quadruples theoretical Pcr.',
          'Note why practical design uses conservative effective length factors (e.g. 0.7L instead of 0.5L).',
        ],
      },
      {
        id: 'EX-6.2',
        code: 'Example 6.2',
        title: 'LTB sketch',
        kind: 'practical_exercise',
        description:
          'Take a long steel beam under gravity load. Draw: tension flange; compression flange; sideways compression-flange movement; twisting; possible restraint points from slab/deck/purlins; torsional restraint at supports.',
        requiresCalcNote: true,
        statusLabel: 'Self-Review / Independent Review Practice Activity',
        selfReviewChecklist: [
          'Label top flange (compression) bowing sideways and cross-section twisting at midspan.',
          'Show torsional restraint at supports (e.g. full-depth end cleats/stiffeners preventing twist).',
          'Show intermediate lateral restraints tied back to a plan bracing / diaphragm system.',
        ],
      },
      {
        id: 'EX-6.3',
        code: 'Example 6.3',
        title: 'Frame stability',
        kind: 'practical_exercise',
        description:
          'Draw a simple single-storey frame: (1) no bracing; (2) diagonal bracing; (3) moment frame. Apply a horizontal load and explain what prevents sway in each case.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 6.3 & Self-Review Practice Activity',
        selfReviewChecklist: [
          'Sketch sway collapse mechanism of Case 1 (pinned joints, no bracing).',
          'Sketch axial force flow in Case 2 (diagonal brace + column uplift/compression).',
          'Sketch BMD and double-curvature/knee bending in Case 3 (moment frame).',
        ],
      },
      {
        id: 'EX-6.4',
        code: 'Example 6.4',
        title: 'Temporary versus permanent stability',
        kind: 'practical_exercise',
        description:
          'Identify a temporary condition where a completed structure is stable but an intermediate stage is not (steel frame before permanent bracing/floor diaphragm; masonry wall before floor/roof restraint; slab during wet concrete loading; precast elements before permanent tying).',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 6.3 & Self-Review Practice Activity',
        selfReviewChecklist: [
          'Compare the permanent load path/restraints with the intermediate construction-stage arrangement.',
          'Specify the temporary works required (e.g. temporary erection bracing, raking shores, propping, holding-down bolts).',
        ],
      },
    ],
    resources: [
      'Hibbeler Mechanics of Materials: columns/buckling.',
      'Jeff Hanson: column buckling.',
      'SteelConstruction.info: LTB, bracing, steel stability.',
      'IStructE/SCI temporary stability material where available.',
    ],
    standardsNotice:
      'Euler buckling P_cr = π²EI/L_cr² is the theoretical elastic upper bound. Real steel/timber/concrete column and LTB checks must use the imperfection reduction factors (χ, χ_LT) in EN 1993-1-1 / EN 1995-1-1 / BS 5975.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD06-E01',
        6,
        'MOD06-T1',
        'Calculate Euler critical load ratio when effective length is halved (Example 6.1)',
        'If adding an intermediate lateral brace at mid-height of a pin-ended column reduces its minor-axis effective length from L_cr = 4.0 m to L_cr = 2.0 m, by what factor does its theoretical minor-axis Euler critical load P_cr = π²EI_z/L_cr² increase?',
        4,
        'factor',
        '(4.0 / 2.0)² = 2² = 4.0.',
        'Halving effective length quadruples elastic Euler buckling load.'
      ),
      qNum(
        'MOD06-E02',
        6,
        'MOD06-T1',
        'Calculate slenderness ratio λ = L_cr / i of a column',
        'A pin-ended steel column has an effective buckling length L_cr = 3,600 mm and a minor-axis radius of gyration i_z = 45 mm. Calculate its geometric slenderness ratio λ = L_cr / i_z (dimensionless).',
        80,
        'ratio',
        'λ = 3,600 mm / 45 mm = 80.',
        'Dimensionless slenderness ratio.'
      ),
      qNum(
        'MOD06-E03',
        6,
        'MOD06-T1',
        'Calculate Euler buckling stress σ_cr = π²E / λ²',
        'For the steel column with slenderness ratio λ = L_cr / i = 100 and Young’s modulus E = 210,000 N/mm², calculate the theoretical Euler critical buckling stress σ_cr = P_cr / A = π² E / λ² in N/mm² (to 1 decimal place).',
        207.3,
        'N/mm²',
        'σ_cr = (π² × 210,000) / 100² = 2,072,616 / 10,000 = 207.26 N/mm² ≈ 207.3 N/mm².',
        'Notice that at λ = 100, even a perfect elastic column buckles at 207.3 N/mm², well below the 355 N/mm² yield strength of S355 steel!'
      ),
      qNum(
        'MOD06-E04',
        6,
        'MOD06-T1',
        'Identify governing axis when major and minor axes have different effective lengths',
        'A steel H-column of height 6.0 m has major-axis radius of gyration i_y = 90 mm (unbraced over the full 6,000 mm height, so L_cr,y = 6,000 mm) and minor-axis radius of gyration i_z = 50 mm (braced at mid-height so L_cr,z = 3,000 mm). Calculate the larger (governing) slenderness ratio max(L_cr,y/i_y, L_cr,z/i_z) to 1 decimal place.',
        66.7,
        'ratio',
        'λ_y = 6,000 / 90 = 66.67. λ_z = 3,000 / 50 = 60.0. Because the minor axis is braced at mid-height, the major axis actually has the higher slenderness (66.7 > 60.0) and governs!',
        'Always check BOTH axes when intermediate restraints differ between y-y and z-z.'
      ),
      qNum(
        'MOD06-E05',
        6,
        'MOD06-T1',
        'Calculate squash load N_pl = A·f_y vs buckling awareness',
        'A short stocky S275 steel stub column (f_y = 275 N/mm²) has cross-sectional area A = 4,000 mm². Calculate its theoretical full plastic squash load A·f_y in kN.',
        1100,
        'kN',
        'N_pl = 4,000 mm² × 275 N/mm² = 1,100,000 N = 1,100 kN.',
        'Only very stocky columns (low slenderness λ) can reach their full squash load without buckling reduction.'
      ),
      qNum(
        'MOD06-E06',
        6,
        'MOD06-T3',
        'Calculate column uplift reaction in a tall narrow braced bay under wind',
        'A vertical braced bay of width B = 3.0 m and height H = 9.0 m is subjected to a horizontal wind force of H_w = 40 kN at the top (9.0 m level). Taking moments about the leeward column base, calculate the upward tension (uplift) force induced at the windward column base due to wind alone (in kN).',
        120,
        'kN',
        'Overturning moment about leeward base = 40 kN × 9.0 m = 360 kN·m. Resisted by vertical couple at column spacing B = 3.0 m: Uplift = 360 kN·m / 3.0 m = 120 kN.',
        'Holding-down bolts and foundation dead weight at the windward column base must be checked for net uplift!'
      ),
      qNum(
        'MOD06-E07',
        6,
        'MOD06-T3',
        'Calculate sliding factor of safety of a gravity retaining block',
        'A concrete kentledge block of weight W = 80 kN rests on a horizontal surface with a friction coefficient μ = 0.45 and resists a horizontal lateral load of H = 20 kN. Calculate the ratio of frictional sliding resistance (μ·W) to the applied horizontal load H.',
        1.8,
        'ratio',
        'Sliding resistance F_f = μ × W = 0.45 × 80 = 36 kN. Ratio = 36 kN / 20 kN = 1.80.',
        'Sliding is one of the fundamental global stability failure modes.'
      ),
      qNum(
        'MOD06-E08',
        6,
        'MOD06-T2',
        'Estimate lateral restraint force using a 2.5% flange force rule of thumb',
        'A laterally restrained steel beam develops a maximum compressive force of N_c = 600 kN in its top compression flange at ULS. If the lateral restraint system is checked for a nominal restraint force equal to 2.5% of the compression flange force, what horizontal force (in kN) must the restraint system resist?',
        15,
        'kN',
        '2.5% of 600 kN = 0.025 × 600 = 15.0 kN.',
        'Illustrates that lateral restraints carry real horizontal forces and cannot be flimsy or unanchored.'
      ),
      qMcq(
        'MOD06-E09',
        6,
        'MOD06-T1',
        'Distinguish local plate buckling from global member flexural buckling',
        'What is the physical difference between local buckling and global flexural buckling in a thin-walled steel I-column?',
        [
          'In local buckling, individual thin plate elements (an outstand flange tip or slender web) ripple/wave locally over a short wavelength without the overall column axis deflecting sideways, whereas in global flexural buckling the entire column cross-section bows sideways over its length L_cr',
          'Local buckling only occurs in concrete foundations',
          'Global flexural buckling only deforms the paint layer',
          'Local buckling is prevented by reducing the column length while keeping the flange paper-thin',
        ],
        0,
        'Local buckling depends on plate width-to-thickness ratio (b/t or c/t, covered by Section Classification Class 1–4), whereas global buckling depends on member length-to-radius-of-gyration ratio (L_cr / i).',
        'Crucial distinction in Module 6 and Module 8.'
      ),
      qMcq(
        'MOD06-E10',
        6,
        'MOD06-T1',
        'Identify credible failure modes for a bolted connection',
        'When a steel tension tie is connected to a gusset plate by bolts, which of the following is a credible set of connection failure modes that must be checked?',
        [
          'Bolt shear rupture, bearing crushing/tear-out of the plate wall at the bolt holes, net-section tensile rupture of the tie across the holes, and block tearing around the bolt group',
          'Lateral torsional buckling of the bolt threads only',
          'Consolidation settlement of the bolts',
          'Euler buckling of the tension force',
        ],
        0,
        'Module 6 Gate requires listing credible failure modes for beams, columns, frames, connections, walls, and foundations.',
        'Module 6 Gate requirement.'
      ),
      qMcq(
        'MOD06-E11',
        6,
        'MOD06-T1',
        'Identify credible failure modes for a masonry wall',
        'Which combination of failure modes is credible for a slender unreinforced masonry wall supporting vertical and wind loads?',
        [
          'Compressive crushing under concentrated bearing loads, out-of-plane flexural cracking/buckling due to slenderness or missing lateral floor/roof restraint, overturning under wind, and shear cracking along mortar joints',
          'Ductile plastic hinge formation with 20% tensile elongation',
          'Lateral torsional twisting of individual clay bricks',
          'Punching shear of steel reinforcement',
        ],
        0,
        'Slender masonry walls are particularly vulnerable to out-of-plane stability loss if horizontal ties at floor/roof levels are missing or corroded.',
        'Module 6 Gate + Example 6.4.'
      ),
      qMcq(
        'MOD06-E12',
        6,
        'MOD06-T2',
        'Evaluate whether torsional restraint at beam supports is required (Example 6.2)',
        'Standard LTB resistance checks assume that at both end supports of a beam, the cross-section is prevented from twisting about its longitudinal axis (torsional restraint). What happens if a deep steel beam simply sits on top of a narrow elastomeric pad with no web cleats, no stiffeners, and nothing holding the top flange sideways at the supports?',
        [
          'The beam can roll/tip sideways at its supports at a fraction of its normal LTB capacity because the fundamental boundary condition (preventing twist and lateral movement of the compression flange at supports) is missing',
          'The beam capacity increases by 50%',
          'Torsional restraint at supports has no effect on LTB',
          'The elastomeric pad converts the beam into a fixed-ended portal frame',
        ],
        0,
        'Without torsional restraint at the supports, the effective LTB length increases dramatically or the beam simply rolls over on its bearings during erection.',
        'Syllabus Example 6.2 key detail.'
      ),
      qMcq(
        'MOD06-E13',
        6,
        'MOD06-T3',
        'Understand why "bracing every column to its neighbour" without a braced bay is a mechanism',
        'An engineer ties five steel columns in a row together at eaves level with horizontal tie struts, but forgets to put diagonal cross-bracing (or a moment frame/core) in any bay of the row. Does tying the columns to each other make the row stable against longitudinal sway?',
        [
          'No; tying five unstable pendulums together simply causes all five columns to sway and collapse together in unison unless the horizontal ties are anchored back to a triangulated braced bay or shear core',
          'Yes; horizontal ties alone create a triangulated truss without any diagonals',
          'Yes, provided the ties are painted',
          'Only if the columns have pinned bases',
        ],
        0,
        'Restraint ties only work if they terminate at a stiff braced node (a triangulated braced bay, shear wall, or rigid frame). Otherwise the whole row sways collectively.',
        'Classic structural stability trap.'
      ),
      qMcq(
        'MOD06-E14',
        6,
        'MOD06-T3',
        'Identify construction-stage vulnerability of freestanding masonry walls (Example 6.4)',
        'In the completed building, an external masonry cavity wall spans vertically 2.7 m between the ground floor and the first-floor timber joists (restrained at top and bottom). During construction, before the first-floor joists are installed and tied in, the freshly laid 2.7 m wall is hit by a strong wind gust. Why is it far more vulnerable during construction?',
        [
          'Because without the top horizontal restraint from the first-floor diaphragm, the wall acts as a freestanding vertical cantilever (doubling its effective height/slenderness and quadrupling its bending moment under wind) while its fresh mortar has not yet gained full bond strength',
          'Because wind loads are ignored in permanent works design',
          'Because first-floor joists reduce the thickness of the bricks',
          'Because mortar is stronger when wet than when cured',
        ],
        0,
        'A wall propped at top and bottom has M_max = wH²/8, whereas an unrestrained freestanding wall of height H is a cantilever with M_max = wH²/2 (4 times the bending moment!) and L_cr = 2H.',
        'Syllabus Example 6.4 application.'
      ),
      qMcq(
        'MOD06-E15',
        6,
        'MOD06-T1',
        'Understand web bearing and web buckling at concentrated loads',
        'When a heavy secondary beam or hydraulic jack sits directly on the flange of a steel I-beam without web stiffeners, what local failure modes can occur in the thin vertical web directly beneath the concentrated load?',
        [
          'Local web crushing/bearing at the root fillet and vertical compression buckling (crippling) of the slender web acting as a vertical strut',
          'Tensile rupture of the compression flange',
          'Consolidation settlement of the steel web',
          'Pure torsion of the bolts',
        ],
        0,
        'Concentrated patch loads must transfer through the flange into the thin web; if the web is too thin, it crushes locally at the fillet or buckles out-of-plane like a vertical plate strut, requiring load-bearing web stiffeners.',
        'Connects Module 6 failure modes to Module 8/9 web stiffener awareness.'
      ),
      qNum(
        'MOD06-E16',
        6,
        'MOD06-T1',
        'Calculate effective length of a fixed-pinned column',
        'A 4,000 mm long column is rigidly fixed against rotation and translation at its base and pinned (held in position but free to rotate) at its top. Using the standard theoretical effective length factor k = 0.70, calculate its effective buckling length L_cr in mm.',
        2800,
        'mm',
        'L_cr = 0.70 × 4,000 mm = 2,800 mm.',
        'Standard fixed-pinned non-sway effective length factor.'
      ),
      qNum(
        'MOD06-E17',
        6,
        'MOD06-T1',
        'Calculate critical buckling load change when column length is tripled',
        'A modular temporary works prop assembly is extended from an effective length of 2.0 m to 6.0 m (3 times longer) using the same tubular cross-section. By what factor is its theoretical elastic Euler buckling capacity P_cr reduced?',
        9,
        'factor',
        'Since P_cr ∝ 1 / L_cr², tripling L_cr reduces P_cr by a factor of 3² = 9.0.',
        'Explains why tall temporary works props require intermediate lacing and bracing in both orthogonal planes.'
      ),
      qMcq(
        'MOD06-E18',
        6,
        'MOD06-T3',
        'Explain why falsework towers require plan bracing and diagonal lacing in TWO orthogonal directions',
        'A temporary works engineer designs a row of heavily loaded falsework props laced together with diagonal bracing in the North–South plane, but omits bracing in the East–West plane. What will happen under vertical concrete load?',
        [
          'The props will buckle effortlessly out-of-plane in the unbraced East–West direction at their full unbraced height',
          'Bracing in one plane automatically restrains buckling in the perpendicular plane',
          'The props will fail in pure tension',
          'Nothing; compression struts only buckle in one direction',
        ],
        0,
        'A 3D column or prop will always seek the path of least resistance (largest L_cr / i); bracing in one plane leaves the perpendicular plane completely unrestrained unless braced in both x and y planes.',
        'Essential 3D stability principle.'
      ),
      qMcq(
        'MOD06-E19',
        6,
        'MOD06-T1',
        'Recognise brittle fracture risk in thick welded steelwork at low temperature',
        'Why do steelwork standards specify minimum Charpy V-notch impact toughness (sub-grade JR, J0, J2, K2) for thick welded steel sections exposed to low winter service or erection temperatures?',
        [
          'Because low temperatures, thick plates (triaxial stress state), weld defects/notches, and dynamic loading reduce steel fracture toughness and can trigger sudden brittle cleavage fracture at stresses below yield',
          'Because cold temperatures reduce Young’s modulus E to zero',
          'Because sub-grade J2 has twice the density of JR',
          'Because brittle fracture only happens at temperatures above 500°C',
        ],
        0,
        'Module 6 Learn item: brittle fracture awareness.',
        'Connects material selection to fracture prevention.'
      ),
      qMcq(
        'MOD06-E20',
        6,
        'MOD06-T2',
        'Verify whether bottom-flange shelf angles restrain top-flange LTB',
        'Precast concrete floor units sit on shelf angles welded near the BOTTOM tension flange of a simply supported steel spine beam, with a 40 mm gap left ungrouted between the ends of the precast units and the TOP compression flange of the steel beam. Is the top compression flange laterally restrained before grouting?',
        [
          'No; the load and contact are at the bottom tension flange while the top compression flange is free to displace laterally into the ungrouted gap, so the beam must be checked as unrestrained (LTB) for the construction stage',
          'Yes; supporting units on the bottom tension flange always locks the top flange against lateral buckling',
          'Yes, because precast units eliminate gravity',
          'No, because the bottom flange is in compression at midspan',
        ],
        0,
        'Classic precast shelf-angle beam check (Syllabus Comment [UI1] & Module 6 LTB): until structural grout fills the gap and ties the top flange into a diaphragm, the top compression flange is unrestrained.',
        'Real-world UK steel/precast design scenario.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 7: BASIS OF DESIGN, ACTIONS AND EUROCODE PHILOSOPHY               */
  /* ======================================================================== */
  {
    moduleNumber: 7,
    code: 'MOD-07',
    title: 'Module 7: Basis of design, actions and Eurocode philosophy',
    shortTitle: 'Basis of design, actions and Eurocode philosophy',
    suggestedDuration: '8–10 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 9–10',
    whyItMatters:
      'Connects first-principles structural mechanics to the semi-probabilistic Eurocode reliability framework (BS EN 1990 and BS EN 1991 + UK National Annexes) and establishes the 9-step engineering calculation workflow.',
    introduction:
      'Covers the Eurocode philosophy of limit states (ULS and SLS), characteristic values (F_k, X_k), partial safety factors (γ_F, γ_M), design values (F_d, X_d), design action effects vs design resistance (E_d ≤ R_d), classification of actions (permanent, variable imposed, snow, wind, construction, accidental, thermal, earth/water), combination factors (ψ_0, ψ_1, ψ_2), the role of National Annexes, and the 9-step calculation workflow (Example 7.1).',
    objectives: [
      'Distinguish characteristic values from design values and explain why partial factors γ_F and γ_M exist.',
      'Classify permanent, variable, and accidental actions and explain why ULS and SLS combinations differ.',
      'Apply the 9-step Eurocode calculation workflow to take a floor beam from characteristic surface loads to ULS and SLS design action effects (Example 7.1).',
    ],
    learningGate: [
      'Explain why characteristic actions are not automatically the same as design actions.',
      'Explain why ULS and SLS use different load combinations.',
      'Explain clearly what "design action effect" (E_d) and "design resistance" (R_d) mean.',
      'Set out a complete, structured 9-step design basis for a simple structural element.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4, 5, 6],
    topics: [
      {
        id: 'MOD07-T1',
        moduleNumber: 7,
        code: '7.1',
        title: 'Eurocode Design Philosophy, Characteristic vs Design Values & National Annexes',
        summary:
          'Covers characteristic values (F_k, X_k), partial factors for actions (γ_F) and materials (γ_M), design action effects E_d vs design resistance R_d, design situations, reliability, model uncertainty, and why the UK National Annex must always be checked.',
        subtopics: [
          'Characteristic action F_k and characteristic material property X_k (statistical fractiles, e.g. 95% or 5%)',
          'Partial safety factors: γ_F (action uncertainty + model uncertainty) and γ_M (material + geometric uncertainty)',
          'Design value of an action F_d = γ_F · ψ · F_k and design material strength X_d = X_k / γ_M',
          'Fundamental ULS inequality: Design Action Effect E_d ≤ Design Resistance R_d',
          'Design situations: persistent, transient (e.g. construction/temporary works), accidental, seismic',
          'Role of National Annexes (Nationally Determined Parameters, NDPs)',
        ],
        learningObjectives: [
          'Explain E_d ≤ R_d and why characteristic values are multiplied or divided by partial factors.',
          'Explain why a Eurocode part must always be read alongside its applicable National Annex.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Guide to navigating BS EN 1990 and the UK National Annex.',
          workedExamplesPlanned: 'Setting out a formal Design Basis statement.',
          calculationsPlanned: 'Favourable vs unfavourable permanent actions in overturning (EQU) vs strength (STR).',
          sourceReferencesNeeded: 'Current controlled copies of BS EN 1990 and UK National Annex.',
        },
        questions: [
          qMcq(
            'MOD07-T1-Q1',
            7,
            'MOD07-T1',
            'Explain why characteristic actions differ from design actions (Module 7 Gate)',
            'In Eurocode design (BS EN 1990), why is a characteristic action F_k multiplied by a partial factor γ_F to obtain the design action F_d = γ_F · F_k for Ultimate Limit State checks?',
            [
              'To account for the possibility of unfavourable deviations of actions from their representative characteristic values, inaccurate load modelling assumptions, and uncertainties in assessing the action effects',
              'To convert imperial units into metric units',
              'Because characteristic actions are always zero',
              'To calculate the instantaneous serviceability deflection',
            ],
            0,
            'γ_F = γ_f × γ_Sd covers both statistical variability of the load magnitude (γ_f) and uncertainty in the structural/load model (γ_Sd).',
            'Direct Module 7 Gate requirement.'
          ),
          qMcq(
            'MOD07-T1-Q2',
            7,
            'MOD07-T1',
            'Distinguish Design Action Effect E_d from Design Resistance R_d (Module 7 Gate)',
            'In the fundamental Ultimate Limit State verification E_d ≤ R_d, what do E_d and R_d specifically represent?',
            [
              'E_d is the internal force, moment, or stress (e.g. M_Ed, V_Ed, N_Ed) produced in the member by the factored design actions, while R_d is the maximum capacity (e.g. M_Rd, V_Rd, N_b,Rd) of the member calculated using design material strengths X_k / γ_M',
              'E_d is Young’s modulus and R_d is the support reaction',
              'E_d is the unfactored floor pressure in kN/m² and R_d is the span length',
              'E_d and R_d both represent serviceability deflection in mm',
            ],
            0,
            'Action -> Factored Design Action (F_d) -> Structural Analysis -> Design Action Effect (E_d), which is compared against Member Capacity -> Design Resistance (R_d).',
            'Core Module 7 Gate requirement.'
          ),
          qMcq(
            'MOD07-T1-Q3',
            7,
            'MOD07-T1',
            'Understand the mandatory role of the National Annex in Eurocode design',
            'When designing a structure in the UK to a Eurocode (such as BS EN 1990, BS EN 1991, or BS EN 1993), why is it insufficient to read only the main Eurocode text without its UK National Annex?',
            [
              'Because safety levels, partial factors, combination factors, climatic maps (wind, snow, thermal), and choice of alternative design methods are Nationally Determined Parameters (NDPs) legally set by the UK National Annex, which often differ from the recommended values in the main Eurocode text',
              'Because the main Eurocode text is written in imperial units',
              'Because the National Annex replaces the laws of static equilibrium',
              'Because the National Annex only applies to bridges over 500 m span',
            ],
            0,
            'Whenever a Eurocode clause permits a Nationally Determined Parameter (NDP), the value or method in the UK National Annex governs for UK projects.',
            'Essential standards navigation habit.'
          ),
          qMcq(
            'MOD07-T1-Q4',
            7,
            'MOD07-T1',
            'Distinguish persistent, transient, and accidental design situations',
            'How are "persistent", "transient", and "accidental" design situations defined in BS EN 1990?',
            [
              'Persistent refers to normal long-term in-service use; transient refers to temporary conditions of limited duration such as construction stages, temporary works, or repair; accidental refers to exceptional events such as fire, explosion, or vehicle impact',
              'Persistent means self-weight, transient means wind, and accidental means rain',
              'Transient situations never require structural calculations',
              'Accidental situations are checked with the highest partial safety factors on permanent dead loads',
            ],
            0,
            'Temporary works and construction-stage checks fall under transient design situations.',
            'Connects Eurocode design situations to temporary works engineering.'
          ),
          qNum(
            'MOD07-T1-Q5',
            7,
            'MOD07-T1',
            'Calculate design material strength from characteristic strength and partial factor γ_M',
            'If a structural material has a characteristic compressive strength f_k = 30 N/mm² and the applicable partial material factor for the limit state is given as γ_M = 1.50, calculate the design strength f_d = f_k / γ_M in N/mm².',
            20,
            'N/mm²',
            'f_d = f_k / γ_M = 30 / 1.50 = 20.0 N/mm².',
            'Material strengths are divided by γ_M (≥ 1.0), whereas unfavourable actions are multiplied by γ_F.'
          ),
        ],
      },
      {
        id: 'MOD07-T2',
        moduleNumber: 7,
        code: '7.2',
        title: 'Classification of Actions, Limit States & Load Combinations',
        summary:
          'Covers permanent (G), variable (Q: imposed, wind, snow, construction, thermal), and accidental (A) actions, favourable vs unfavourable permanent actions, combination factors (ψ_0, ψ_1, ψ_2), and ULS vs SLS combinations.',
        subtopics: [
          'Permanent actions (G): self-weight of structure, fixed partitions, surfacing, permanent earth pressure',
          'Variable actions (Q): imposed floor loads, wind, snow, construction loads, temperature changes',
          'Favourable vs unfavourable actions (e.g. dead weight resisting uplift/overturning is favourable and uses a reduced factor γ_G,fav < 1.0)',
          'Accompanying variable actions and combination factors ψ_0 (combination), ψ_1 (frequent), ψ_2 (quasi-permanent)',
          'Why ULS and SLS combinations differ (characteristic, frequent, and quasi-permanent SLS combinations)',
        ],
        learningObjectives: [
          'Classify actions correctly and explain why simultaneous unrelated variable actions use a combination factor ψ_0.',
          'Explain why favourable dead weight in an uplift or overturning check must be multiplied by a factor ≤ 1.0 (never 1.35!).',
        ],
        futureExpansion: {
          lessonsPlanned: 'Comparison of BS EN 1990 Equation 6.10 vs Equations 6.10a/6.10b and EQU vs STR/GEO.',
          workedExamplesPlanned: 'Multi-variable action combinations (imposed floor load + wind).',
          calculationsPlanned: 'Overturning vs uplift combination exercises.',
          sourceReferencesNeeded: 'Current BS EN 1990, BS EN 1991-1-1, and UK National Annexes.',
        },
        questions: [
          qMcq(
            'MOD07-T2-Q1',
            7,
            'MOD07-T2',
            'Recognise dangerous error of applying γ_G,unfav = 1.35 to a favourable stabilising dead load',
            'When checking whether a light roof or temporary hoarding block will uplift or overturn under wind load, the self-weight G_k of the roof/block resists the wind uplift. What error occurs if an engineer multiplies the stabilising self-weight G_k by 1.35?',
            [
              'Multiplying a stabilising (favourable) permanent action by 1.35 artificially inflates the restoring weight by 35%, which is non-conservative and dangerous; favourable permanent actions must use the reduced factor γ_G,fav (e.g. 1.0 or 0.9 in EQU) in accordance with BS EN 1990',
              'Multiplying by 1.35 is always safe for every load',
              'Self-weight is a variable action Q_k',
              'Wind uplift only occurs at the Serviceability Limit State',
            ],
            0,
            'When permanent weight helps prevent failure (favourable action), overestimating its weight is unsafe; BS EN 1990 assigns a lower partial factor (γ_G,fav) to favourable permanent actions.',
            'Critical Eurocode safety concept for both permanent and temporary works.'
          ),
          qMcq(
            'MOD07-T2-Q2',
            7,
            'MOD07-T2',
            'Explain physical rationale for combination factor ψ_0 on accompanying variable actions',
            'When a building is subjected to two independent variable actions (for example, imposed office floor live load Q_1 and extreme 50-year wind load Q_2), why is the accompanying variable action multiplied by a reduction factor ψ_0 (typically 0.5 to 0.7) rather than applying full unreduced peak values of both simultaneously?',
            [
              'Because the statistical probability that two independent time-varying actions both reach their rare 50-year extreme peak values at the exact same instant is much lower than either one peaking while the other is at its combination value ψ_0·Q_k',
              'Because wind stops blowing whenever people enter an office building',
              'Because ψ_0 converts kN into MN',
              'Because Eurocode ignores wind on multi-storey buildings',
            ],
            0,
            'Turkstra’s rule in structural reliability: one variable action is taken as the leading variable action at full γ_Q·Q_k,1 while accompanying independent variable actions are taken at γ_Q·ψ_0,i·Q_k,i.',
            'Explains accompanying actions in BS EN 1990.'
          ),
          qMcq(
            'MOD07-T2-Q3',
            7,
            'MOD07-T2',
            'Distinguish characteristic, frequent, and quasi-permanent SLS combinations',
            'In BS EN 1990, three Serviceability Limit State (SLS) combinations are defined: characteristic, frequent (ψ_1), and quasi-permanent (ψ_2). What is the quasi-permanent combination (G_k + ψ_2·Q_k) primarily used for?',
            [
              'Assessing long-term effects such as concrete creep deflection, long-term settlement of foundations on clay, and long-term visual appearance of sag',
              'Checking ultimate plastic collapse of a steel column',
              'Checking accidental bomb blast resistance',
              'Calculating bolt shear rupture',
            ],
            0,
            'ψ_2·Q_k represents the time-averaged sustained portion of variable load that acts over a large fraction of the structure’s life, driving creep and consolidation.',
            'Links Module 7 SLS combinations to Module 5, 12, and 14.'
          ),
          qNum(
            'MOD07-T2-Q4',
            7,
            'MOD07-T2',
            'Calculate ULS design load with one leading and one accompanying variable action',
            'Given a permanent action G_k = 20 kN, leading variable action Q_k,1 = 30 kN, and accompanying variable action Q_k,2 = 15 kN, calculate the ULS design load F_d using the supplied factors γ_G = 1.35, γ_Q = 1.50, and ψ_0,2 = 0.60: F_d = γ_G·G_k + γ_Q·Q_k,1 + γ_Q·ψ_0,2·Q_k,2.',
            85.5,
            'kN',
            'F_d = (1.35 × 20) + (1.50 × 30) + (1.50 × 0.60 × 15) = 27.0 + 45.0 + 13.5 = 85.5 kN.',
            'Note: in design, you also check the reverse case where Q_2 is leading and Q_1 is accompanying (with ψ_0,1) to find the governing combination.'
          ),
          qMcq(
            'MOD07-T2-Q5',
            7,
            'MOD07-T2',
            'Classify earth, groundwater, thermal, and construction loads',
            'How should wet concrete placement loads and temporary storage of materials on a floor during construction be classified in a Eurocode design check?',
            [
              'As construction actions (variable actions applied during a transient design situation, in accordance with BS EN 1991-1-6 and the UK National Annex)',
              'As favourable permanent self-weight that remains forever',
              'They are exempt from partial safety factors and equilibrium checks',
              'As seismic actions',
            ],
            0,
            'Construction loads (personnel, concreting equipment, stacked materials) are variable actions in a transient design situation covered by BS EN 1991-1-6.',
            'Connects Eurocode action classification to site and temporary works practice.'
          ),
        ],
      },
      {
        id: 'MOD07-T3',
        moduleNumber: 7,
        code: '7.3',
        title: 'The 9-Step Calculation Workflow & Floor Beam Action Effects (Example 7.1)',
        summary:
          'Walks through the 9-step Eurocode calculation workflow and applies it to the Module 1 floor beam (4 m slab span, 5 m beam length, g_k = 1.0 kN/m², q_k = 1.5 kN/m², plus beam self-weight) to establish ULS and SLS line loads, moments, shears, and deflection actions (Example 7.1).',
        subtopics: [
          '9-step calculation workflow: (1) define system, (2) establish actions, (3) identify combinations, (4) calculate design action effects, (5) determine design resistance, (6) compare E_d ≤ R_d, (7) check SLS, (8) provide detailing/restraints, (9) document assumptions/limitations',
          'Syllabus Example 7.1: taking the Module 1 floor beam from characteristic actions to ULS/SLS line loads, M_Ed, V_Ed, and SLS deflection loads',
          'Including allowance for beam self-weight in permanent actions',
          'Mapping which line load feeds into which subsequent check (ULS bending/shear/bearing vs SLS deflection)',
        ],
        learningObjectives: [
          'Complete every step of Syllabus Example 7.1 accurately.',
          'Order and explain the 9 steps of a professional structural calculation.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Full annotated template for the 9-step Eurocode workflow.',
          workedExamplesPlanned: 'Example 7.1 complete calculation note ready to feed directly into Module 8.',
          calculationsPlanned: 'Comparison of Eq 6.10 vs Eq 6.10a/b on the Example 7.1 floor beam.',
          sourceReferencesNeeded: 'Current BS EN 1990, BS EN 1991-1-1, UK National Annexes, and SCI guides.',
        },
        questions: [
          qNum(
            'MOD07-T3-Q1',
            7,
            'MOD07-T3',
            'Calculate total characteristic permanent line load including beam self-weight (Example 7.1)',
            'In Syllabus Example 7.1 (using the Module 1 floor beam: 5.0 m span, 2.0 m tributary width, floor g_k = 1.0 kN/m², floor q_k = 1.5 kN/m²), suppose we allow 0.4 kN/m for the self-weight of the steel beam itself. What is the total characteristic permanent line load g_k,total (in kN/m) on the beam?',
            2.4,
            'kN/m',
            'Floor permanent line load = 1.0 kN/m² × 2.0 m = 2.0 kN/m. Adding beam self-weight allowance of 0.4 kN/m gives g_k,total = 2.0 + 0.4 = 2.4 kN/m.',
            'Never forget to include member self-weight in the permanent action G_k.'
          ),
          qNum(
            'MOD07-T3-Q2',
            7,
            'MOD07-T3',
            'Calculate basic ULS design line load w_Ed (Example 7.1)',
            'For the Example 7.1 floor beam with g_k,total = 2.4 kN/m and imposed line load q_k = 1.5 kN/m² × 2.0 m = 3.0 kN/m, calculate the basic ULS design line load w_Ed = γ_G·g_k,total + γ_Q·q_k using supplied partial factors γ_G = 1.35 and γ_Q = 1.50 (in kN/m).',
            7.74,
            'kN/m',
            'w_Ed = (1.35 × 2.4) + (1.50 × 3.0) = 3.24 + 4.50 = 7.74 kN/m.',
            'Consult current BS EN 1990 UK NA for applicable partial factors (Eq 6.10 vs 6.10a/b); here γ_G = 1.35 and γ_Q = 1.50 are supplied explicitly for the exercise.'
          ),
          qNum(
            'MOD07-T3-Q3',
            7,
            'MOD07-T3',
            'Calculate ULS design bending moment M_Ed on the 5 m floor beam (Example 7.1)',
            'Using the ULS design line load w_Ed = 7.74 kN/m on the 5.0 m simply supported floor beam (Syllabus Example 7.1), calculate the maximum ULS design bending moment M_Ed = w_Ed · L² / 8 in kN·m (to 2 decimal places).',
            24.19,
            'kN·m',
            'M_Ed = (7.74 × 5.0²) / 8 = (7.74 × 25) / 8 = 193.5 / 8 = 24.1875 kN·m ≈ 24.19 kN·m.',
            'This M_Ed is the design action effect compared against M_c,Rd (or M_b,Rd) at ULS.'
          ),
          qNum(
            'MOD07-T3-Q4',
            7,
            'MOD07-T3',
            'Calculate ULS design shear force V_Ed on the 5 m floor beam (Example 7.1)',
            'For the same 5.0 m floor beam under w_Ed = 7.74 kN/m (Syllabus Example 7.1), calculate the ULS design support shear force V_Ed = w_Ed · L / 2 in kN.',
            19.35,
            'kN',
            'V_Ed = (7.74 × 5.0) / 2 = 19.35 kN.',
            'Used for both the ULS web shear check and the ULS end-connection/bearing reaction check.'
          ),
          qMcq(
            'MOD07-T3-Q5',
            7,
            'MOD07-T3',
            'Match ULS and SLS line loads to their respective design checks (Example 7.1)',
            'In Syllabus Example 7.1, we obtain a factored ULS line load (7.74 kN/m), an unfactored characteristic total SLS line load (g_k + q_k = 5.4 kN/m), and an unfactored characteristic variable SLS line load (q_k = 3.0 kN/m). Which line load is used for which check?',
            [
              'The ULS line load (7.74 kN/m) is used for bending resistance, shear resistance, web bearing, and support connection strength checks; the unfactored SLS line loads (3.0 kN/m variable and 5.4 kN/m total) are used for serviceability deflection checks',
              'The unfactored 3.0 kN/m line load is used for ULS collapse checks and the 7.74 kN/m load is used for SLS deflection',
              'Only the 2.4 kN/m permanent load is used for all checks',
              'All checks use 7.74 kN/m multiplied by another factor of 1.5',
            ],
            0,
            'Directly answers the final prompt of Syllabus Example 7.1 ("state which checks the line loads will be used for").',
            'Completes the bridge from Module 7 to Module 8.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'EX-7.1',
        code: 'Example 7.1',
        title: 'Floor beam from characteristic action to ULS/SLS',
        kind: 'worked_example',
        description:
          'Use the floor beam from Module 1 (4 m slab span, 5 m beam length, permanent 1.0 kN/m², imposed 1.5 kN/m²). Classify permanent and imposed actions; add beam self-weight; establish basic ULS design line load; establish basic SLS line load; calculate ULS moment/shear; calculate SLS deflection action; state which checks the line loads will be used for.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 7.3 & Module 7 Assessment (Verify against controlled EC0/EC1 NA)',
        selfReviewChecklist: [
          'Classify floor g_k = 2.0 kN/m + beam self-weight (e.g. 0.4 kN/m) = 2.4 kN/m permanent; q_k = 3.0 kN/m variable imposed.',
          'Compute ULS w_Ed = 1.35(2.4) + 1.50(3.0) = 7.74 kN/m (and compare with UK NA Eq 6.10a/b if using controlled standard).',
          'Compute M_Ed = 24.19 kN·m and V_Ed = 19.35 kN, and state ULS vs SLS usage.',
        ],
      },
    ],
    resources: [
      'Current EC0, EC1, National Annexes.',
      'SCI/IStructE/Concrete Centre introductory Eurocode material.',
      'SteelConstruction.info searches: Eurocode load combinations; ULS SLS structural steel design; actions on buildings Eurocode.',
    ],
    standardsNotice:
      'All partial factors and combination factors in assessment questions are explicitly supplied in the question prompt for calculation purposes. For real engineering work, always verify the current controlled edition of BS EN 1990, BS EN 1991, and the UK National Annex.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD07-E01',
        7,
        'MOD07-T3',
        'Calculate ULS design line load for Example 7.1 floor beam',
        'A floor beam carries a total characteristic permanent line load g_k = 2.4 kN/m and a single variable imposed line load q_k = 3.0 kN/m. Using supplied partial factors γ_G = 1.35 and γ_Q = 1.50 (BS EN 1990 Eq 6.10), calculate the ULS design line load w_Ed in kN/m.',
        7.74,
        'kN/m',
        'w_Ed = 1.35 × 2.4 + 1.50 × 3.0 = 3.24 + 4.50 = 7.74 kN/m.',
        'Supplied partial factors for Example 7.1.'
      ),
      qNum(
        'MOD07-E02',
        7,
        'MOD07-T3',
        'Compare ULS line load under twin expressions 6.10a and 6.10b',
        'Suppose a National Annex uses the twin expressions 6.10a (1.35·g_k + 1.5·ψ_0·q_k) and 6.10b (ξ·1.35·g_k + 1.5·q_k) with supplied values ξ = 0.925 and ψ_0 = 0.70. For g_k = 2.4 kN/m and q_k = 3.0 kN/m, calculate the governing (larger) ULS line load in kN/m (to 2 decimal places).',
        7.5,
        'kN/m',
        'Eq 6.10a = 1.35(2.4) + 1.5(0.7)(3.0) = 3.24 + 3.15 = 6.39 kN/m. Eq 6.10b = 0.925 × 1.35 × 2.4 + 1.5(3.0) = 2.997 + 4.50 = 7.497 kN/m ≈ 7.50 kN/m. Governing is max(6.39, 7.50) = 7.50 kN/m.',
        'Illustrates how Equations 6.10a/b work when specified by a National Annex.'
      ),
      qNum(
        'MOD07-E03',
        7,
        'MOD07-T3',
        'Calculate characteristic SLS total line load (Example 7.1)',
        'For the Example 7.1 floor beam with g_k = 2.4 kN/m and q_k = 3.0 kN/m, what is the unfactored characteristic SLS total line load (g_k + q_k) in kN/m?',
        5.4,
        'kN/m',
        'w_SLS,char = 2.4 + 3.0 = 5.4 kN/m.',
        'Used for characteristic total serviceability checks.'
      ),
      qNum(
        'MOD07-E04',
        7,
        'MOD07-T2',
        'Calculate quasi-permanent SLS line load for long-term creep',
        'For a beam carrying permanent load g_k = 10.0 kN/m and variable office floor load q_k = 6.0 kN/m, with a supplied quasi-permanent factor ψ_2 = 0.30, calculate the quasi-permanent line load w_QP = g_k + ψ_2·q_k in kN/m.',
        11.8,
        'kN/m',
        'w_QP = 10.0 + (0.30 × 6.0) = 11.8 kN/m.',
        'Represents sustained load level for creep and long-term settlement.'
      ),
      qNum(
        'MOD07-E05',
        7,
        'MOD07-T2',
        'Calculate net ULS uplift force on a canopy tie',
        'A light steel canopy roof has a characteristic permanent downward self-weight G_k = 40 kN and experiences a characteristic upward wind suction Q_k,wind = 36 kN. Using supplied ULS factors γ_G,fav = 1.00 (favourable permanent load) and γ_Q = 1.50 (unfavourable variable wind uplift), calculate the net ULS upward tension force N_Ed in the holding-down tie in kN.',
        14,
        'kN',
        'N_Ed = γ_Q · Q_k,wind − γ_G,fav · G_k = (1.50 × 36) − (1.00 × 40) = 54 − 40 = 14.0 kN upward tension.',
        'Notice that unfactored G_k (40 kN) > Q_k,wind (36 kN) looks as if there is no uplift, yet at ULS there is a 14 kN net tension!'
      ),
      qNum(
        'MOD07-E06',
        7,
        'MOD07-T1',
        'Calculate utilisation ratio E_d / R_d',
        'A beam has a calculated ULS design bending moment M_Ed = 144 kN·m and a design moment resistance M_Rd = 160 kN·m. Calculate its bending utilisation ratio M_Ed / M_Rd (as a decimal to 2 decimal places).',
        0.9,
        'ratio',
        'Utilisation = M_Ed / M_Rd = 144 / 160 = 0.90 (≤ 1.00, so the check passes with 10% spare capacity).',
        'Engineers routinely express E_d ≤ R_d as a utilisation ratio E_d / R_d ≤ 1.0.'
      ),
      qNum(
        'MOD07-E07',
        7,
        'MOD07-T3',
        'Calculate midspan deflection of Example 7.1 floor beam under variable SLS load',
        'For the 5,000 mm span floor beam in Example 7.1 under the unfactored variable imposed line load q_k = 3.0 kN/m (3.0 N/mm), if a trial steel section has E = 210,000 N/mm² and I = 45 × 10⁶ mm⁴, calculate the variable-load midspan deflection δ_Q = 5 q_k L⁴ / (384 E I) in mm (to 2 decimal places).',
        2.58,
        'mm',
        'Numerator = 5 × 3.0 × 5,000⁴ = 9.375 × 10¹⁵. Denominator = 384 × 210,000 × 45 × 10⁶ = 3.6288 × 10¹⁵. δ_Q = 9.375 / 3.6288 = 2.583 mm ≈ 2.58 mm.',
        'Compare against L/360 = 5,000 / 360 = 13.89 mm (comfortably passes).'
      ),
      qNum(
        'MOD07-E08',
        7,
        'MOD07-T2',
        'Identify governing ULS combination when swapping leading and accompanying variable actions',
        'A column supports G_k = 100 kN, floor live load Q_k,floor = 80 kN (with ψ_0,floor = 0.70), and snow load Q_k,snow = 60 kN (with ψ_0,snow = 0.50). Using γ_G = 1.35 and γ_Q = 1.50, calculate the larger (governing) ULS axial load N_Ed by comparing Combination A (floor leading, snow accompanying) and Combination B (snow leading, floor accompanying), in kN.',
        309,
        'kN',
        'Comb A (floor leading): 1.35(100) + 1.50(80) + 1.50(0.50)(60) = 135 + 120 + 45 = 300 kN. Comb B (snow leading): 1.35(100) + 1.50(60) + 1.50(0.70)(80) = 135 + 90 + 84 = 309 kN. Governing is max(300, 309) = 309 kN.',
        'Shows why every variable action must be tested in turn as the leading variable action.'
      ),
      qMcq(
        'MOD07-E09',
        7,
        'MOD07-T3',
        'Identify the correct sequence of the 9-step Eurocode calculation workflow',
        'In the 9-step calculation workflow listed in Module 7 of the syllabus, which step must come BEFORE calculating design action effects (Step 4) and determining design resistance (Step 5)?',
        [
          'Step 1: Define the structural system (geometry, supports, load path, restraints), Step 2: Establish characteristic actions, and Step 3: Identify governing ULS/SLS combinations',
          'Step 8: Write the final conclusion before knowing the loads',
          'Pick a random steel section and skip equilibrium',
          'Check serviceability deflection before knowing the span or actions',
        ],
        0,
        'You cannot calculate internal action effects (M_Ed, V_Ed) until the structural system, actions, and combinations are defined.',
        'Module 7 Calculation Workflow.'
      ),
      qMcq(
        'MOD07-E10',
        7,
        'MOD07-T3',
        'Explain why Step 8 (Detailing/restraint requirements) and Step 9 (Assumptions/limitations) are part of the calculation workflow',
        'Why does the Module 7 calculation workflow include "8. provide detailing/restraint requirements" and "9. document assumptions and limitations" after the numerical ULS and SLS checks pass?',
        [
          'Because the numerical checks are only valid if the assumed supports, bearing lengths, lateral restraints, and connections are actually detailed on the drawings, and any missing site/ground data or exclusions are explicitly recorded for checking',
          'To make the calculation pad heavier',
          'Because Eurocode does not use numbers in Steps 1 to 7',
          'Because detailing is unrelated to structural behaviour',
        ],
        0,
        'A calculation assuming a "laterally restrained simply supported beam" is invalid on site unless the drawings specify the restraint detail and simple connection.',
        'Core syllabus philosophy.'
      ),
      qMcq(
        'MOD07-E11',
        7,
        'MOD07-T1',
        'Understand model uncertainty in Eurocode partial factors',
        'What does the "model uncertainty" component inside partial safety factors represent?',
        [
          'The difference between idealised mathematical calculation models (e.g. frictionless pins, uniform stress blocks, 1D line elements) and the complex behaviour of real physical structures',
          'Arithmetic mistakes made by the engineer when typing numbers into a calculator',
          'Using an out-of-date building layout drawing',
          'Omitting gravity from the calculation',
        ],
        0,
        'Note: partial factors cover statistical variability and idealisation model uncertainty; they do NOT cover gross human errors or unit mistakes!',
        'Important distinction in reliability theory.'
      ),
      qMcq(
        'MOD07-E12',
        7,
        'MOD07-T1',
        'Understand why partial safety factors do not protect against gross human error',
        'Does applying Eurocode partial safety factors (γ_G = 1.35, γ_Q = 1.50) protect a structure if an engineer makes a 10³ unit conversion error or forgets to provide lateral bracing?',
        [
          'No; partial safety factors only cover normal statistical variations in loads, materials, and idealised models—gross errors (wrong load path, missing stability bracing, or unit conversion mistakes) must be prevented by competence, first-principles sanity checks, and independent checking',
          'Yes; γ_Q = 1.50 automatically corrects a factor of 1,000 unit mistake',
          'Yes; partial factors make bracing unnecessary',
          'Partial factors only apply to timber structures',
        ],
        0,
        'BS EN 1990 explicitly states that gross human errors are mitigated by quality management, competence, and independent checking, not by partial factors.',
        'Connects Module 0, Module 7, and Module 19.'
      ),
      qMcq(
        'MOD07-E13',
        7,
        'MOD07-T2',
        'Distinguish EQU, STR, and GEO ultimate limit states in BS EN 1990',
        'In BS EN 1990, what is the distinction between the EQU, STR, and GEO ultimate limit states?',
        [
          'EQU checks loss of static equilibrium of the structure as a rigid body (overturning, uplift, sliding); STR checks internal failure or excessive deformation of structural members/connections; GEO checks failure or excessive deformation of the supporting ground',
          'EQU is for earthquakes, STR is for streets, and GEO is for geometry',
          'EQU, STR, and GEO are three Serviceability Limit States',
          'GEO applies only to roof purlins',
        ],
        0,
        'EQU, STR, and GEO use specific sets of partial factors tailored to rigid-body equilibrium, structural strength, and geotechnical resistance respectively.',
        'Foundation for Module 8 (STR) and Modules 12–13 (GEO/EQU).'
      ),
      qMcq(
        'MOD07-E14',
        7,
        'MOD07-T2',
        'Identify when thermal actions and earth/water pressures must be considered',
        'In which of the following structures would neglecting earth/water pressure or thermal actions invalidate the design basis?',
        [
          'A basement retaining wall or temporary excavation propping frame subjected to soil and groundwater behind the wall and seasonal temperature variations in the steel props',
          'An internal domestic timber cupboard shelf',
          'A short internal pin-roller partition lintel in a climate-controlled room',
          'None; thermal and water pressures are never structural actions',
        ],
        0,
        'Basement/excavation props experience primary load from soil and groundwater (often dominating soil pressure!) plus significant axial force changes from seasonal temperature swings.',
        'Temporary works and permanent works awareness.'
      ),
      qMcq(
        'MOD07-E15',
        7,
        'MOD07-T1',
        'Understand characteristic material value fractiles (5% vs 95%)',
        'Why are characteristic material strengths (such as concrete cylinder strength f_ck or timber bending strength f_m,k) generally defined as the lower 5% fractile (95% probability of being exceeded) rather than the mean (50%) value?',
        [
          'Because using the mean value would mean half of all material batches are weaker than assumed; starting from a conservative lower 5% fractile before applying γ_M ensures a consistently high reliability against failure',
          'Because 95% of concrete cubes fail during testing',
          'Because material strength is always zero for 5% of the day',
          'Because Young’s modulus is always negative above the 5% fractile',
        ],
        0,
        'Characteristic strengths represent a cautious lower bound (typically 5th percentile), whereas characteristic unfavourable actions represent a cautious upper bound.',
        'Eurocode statistical basis.'
      ),
      qNum(
        'MOD07-E16',
        7,
        'MOD07-T1',
        'Calculate design resistance of a steel cross-section using γ_M0 = 1.00',
        'A Class 1 steel beam has plastic section modulus W_pl = 800 cm³ (800,000 mm³), characteristic yield strength f_y = 275 N/mm², and partial material factor γ_M0 = 1.00. Calculate the design plastic moment resistance M_pl,Rd = W_pl · f_y / γ_M0 in kN·m.',
        220,
        'kN·m',
        'M_pl,Rd = (800,000 × 275) / 1.00 = 220,000,000 N·mm = 220 kN·m.',
        'Preview of Module 8 EC3 cross-section resistance.'
      ),
      qNum(
        'MOD07-E17',
        7,
        'MOD07-T2',
        'Calculate characteristic line load from lightweight movable partitions',
        'BS EN 1991-1-1 allows movable lightweight partitions to be treated as an equivalent uniformly distributed imposed floor load q_k,part (in kN/m²). If a floor has a base office imposed load of 2.5 kN/m² plus an equivalent partition allowance of 0.8 kN/m² over a beam tributary width of 3.0 m, what is the total characteristic imposed line load q_k on the beam in kN/m?',
        9.9,
        'kN/m',
        'Total imposed surface load = 2.5 + 0.8 = 3.3 kN/m². Line load q_k = 3.3 kN/m² × 3.0 m = 9.9 kN/m.',
        'Movable partitions are included as an imposed action allowance.'
      ),
      qMcq(
        'MOD07-E18',
        7,
        'MOD07-T1',
        'Understand design working life and return periods',
        'Why does BS EN 1990 define a "design working life" (e.g. 50 years for normal building structures, 120 years for bridges, or shorter for temporary structures)?',
        [
          'Because time-dependent performance (fatigue, durability/corrosion, creep) and the statistical return period of climatic actions (wind, snow) depend on the intended duration of service',
          'Because buildings automatically collapse on the exact last day of their design working life',
          'Because gravity increases every 50 years',
          'Because design working life replaces equilibrium equations',
        ],
        0,
        'Design working life sets the exposure window for durability specifications, fatigue cycles, and environmental action return periods.',
        'BS EN 1990 basis of design.'
      ),
      qMcq(
        'MOD07-E19',
        7,
        'MOD07-T3',
        'Identify why standard editions and National Annexes must never be guessed',
        'When preparing a calculation note for a real UK project or checking an office example, what should you do if you do not have the current controlled standard or UK National Annex in front of you?',
        [
          'Never guess or invent clause numbers, partial factors, or National Annex parameters from memory; obtain the controlled standard and UK National Annex from your employer/BSI library and clearly flag any unverified assumptions for review',
          'Make up a plausible clause number so the calculation looks formal',
          'Use US imperial factors without stating them',
          'Omit all partial factors',
        ],
        0,
        'Directly enforces the syllabus rule: do not try to memorise or invent standards; consult controlled copies and state what requires verification.',
        'Core professional practice discipline.'
      ),
      qMcq(
        'MOD07-E20',
        7,
        'MOD07-T3',
        'Synthesise the purpose of Module 7 before starting Module 8',
        'What is the complete output of the Module 7 workflow (Example 7.1) that feeds into the Module 8 EC3 steel beam design?',
        [
          'A clearly defined structural idealisation (span, supports, restraint assumption, load path), classified characteristic permanent and variable actions (including self-weight), and verified ULS design action effects (M_Ed, V_Ed, support reactions) alongside unfactored SLS deflection actions',
          'Only the paint colour of the beam',
          'A reinforcement bar schedule for a concrete pile',
          'A soil borehole log',
        ],
        0,
        'Module 7 establishes the entire "action and action-effect" side (E_d and SLS loads) so Module 8 can focus on EC3 member resistance (R_d), serviceability, and detailing.',
        'Completes Module 7.'
      ),
    ],
  },
];
