import {
  CalcNoteSectionItem,
  CourseDevelopmentRequirement,
  IntegratedMilestoneItem,
  StudyRuleItem,
} from '../types/syllabus';

export const SYLLABUS_TITLE = 'Comprehensive Structural Engineering Rebuild Syllabus';
export const SYLLABUS_DATE_DISPLAY = '27 July 2026';
export const SYLLABUS_REVISION_ID = '2026-10-30-v0.2.0';

export const SYLLABUS_PURPOSE_SUMMARY =
  'For a UK temporary works engineer rebuilding permanent-works fundamentals, Eurocode fluency, and long-term capability for tightly scoped structural work. This is a multi-year syllabus designed to give a complete map, a realistic sequence, and clear proof of understanding at each stage.';

export const PROFESSIONAL_SAFEGUARD_NOTICE =
  'Educational learning programme and assessment tool only: not construction-ready design advice. All initial assessment questions are learning material that may require technical review. Always consult current controlled standards, UK National Annexes, verified project information, and independent checking before any engineering use.';

export const FIVE_STUDY_RULES: StudyRuleItem[] = [
  {
    stepNumber: 1,
    number: 1,
    id: 'STEP-1-EXPLAIN',
    title: 'Explain it plainly',
    instruction: 'No equations at first. Explain what is physically happening.',
    description: 'State the physical load path, mechanism, and engineering behaviour in plain English before writing equations.',
  },
  {
    stepNumber: 2,
    number: 2,
    id: 'STEP-2-SKETCH',
    title: 'Sketch the system',
    instruction:
      'Draw load paths, support conditions, deformed shape, compression/tension zones, and failure mode.',
    description: 'Draw the free-body diagram, support restraints, deflected shape, tension/compression faces, and failure mode.',
  },
  {
    stepNumber: 3,
    number: 3,
    id: 'STEP-3-CALCULATE',
    title: 'Calculate by hand with units',
    instruction: 'No software and no copied method.',
    description: 'Work through a first-principles hand calculation carrying explicit SI/structural units at every step.',
  },
  {
    stepNumber: 4,
    number: 4,
    id: 'STEP-4-CHECK-SOURCE',
    title: 'Check against a reliable source',
    instruction:
      'A textbook worked answer, recognised professional guidance, or a checked/anonymised office example.',
    description: 'Verify the result against an independent equilibrium bound, textbook benchmark, or checked reference example.',
  },
  {
    stepNumber: 5,
    number: 5,
    id: 'STEP-5-ASSUMPTIONS-LIMITS',
    title: 'State assumptions & limitations',
    instruction:
      'What must be true for the calculation to be valid? What information is missing? What could change the answer?',
    description: 'Document what site conditions, restraints, or standard clauses must hold true and what requires independent review.',
  },
];

export const CALCULATION_NOTE_STRUCTURE: CalcNoteSectionItem[] = [
  {
    sectionNumber: 1,
    key: 'brief_and_sketch',
    title: 'Brief and sketch',
    prompt:
      'Define the engineering problem, geometry, support idealisations, and an annotated structural sketch.',
    requirement:
      'Define the engineering problem, geometry, support idealisations, and an annotated structural sketch.',
  },
  {
    sectionNumber: 2,
    key: 'structural_arrangement_and_load_path',
    title: 'Structural arrangement and load path',
    prompt:
      'Trace how vertical and lateral actions travel from point of application through members and supports to the ground.',
    requirement:
      'Trace how vertical and lateral actions travel from point of application through members and supports to the ground.',
  },
  {
    sectionNumber: 3,
    key: 'design_assumptions',
    title: 'Design assumptions',
    prompt:
      'State idealisations, support fixity, restraint conditions, material models, and governing code/standard assumptions.',
    requirement:
      'State idealisations, support fixity, restraint conditions, material models, and governing code/standard assumptions.',
  },
  {
    sectionNumber: 4,
    key: 'loads_and_actions',
    title: 'Loads and actions',
    prompt:
      'List permanent, imposed, and other characteristic actions, tributary widths/areas, self-weight, and ULS/SLS combinations.',
    requirement:
      'List permanent, imposed, and other characteristic actions, tributary widths/areas, self-weight, and ULS/SLS combinations.',
  },
  {
    sectionNumber: 5,
    key: 'analysis',
    title: 'Analysis',
    prompt:
      'Show equilibrium equations, support reactions, internal forces (N, V, M), SFDs, BMDs, and deflected shapes with explicit units.',
    requirement:
      'Show equilibrium equations, support reactions, internal forces (N, V, M), SFDs, BMDs, and deflected shapes with explicit units.',
  },
  {
    sectionNumber: 6,
    key: 'checks',
    title: 'Checks',
    prompt:
      'Carry out section/member resistance, buckling/stability, bearing, and serviceability deflection checks.',
    requirement:
      'Carry out section/member resistance, buckling/stability, bearing, and serviceability deflection checks.',
  },
  {
    sectionNumber: 7,
    key: 'detailing_and_restraint_requirements',
    title: 'Detailing and restraint requirements',
    prompt:
      'Specify the physical details required to make the calculation assumptions true (bearing lengths, padstones, lateral/torsional restraint, connections).',
    requirement:
      'Specify the physical details required to make the calculation assumptions true (bearing lengths, padstones, lateral/torsional restraint, connections).',
  },
  {
    sectionNumber: 8,
    key: 'conclusion',
    title: 'Conclusion',
    prompt:
      'State clearly what section or arrangement is proposed for learning purposes and which check governs.',
    requirement:
      'State clearly what section or arrangement is proposed for learning purposes and which check governs.',
  },
  {
    sectionNumber: 9,
    key: 'limitations_and_questions_requiring_review',
    title: 'Limitations and questions requiring review',
    prompt:
      'Record missing site/ground information, exclusions, model limits, and specific questions for a senior or specialist engineer.',
    requirement:
      'Record missing site/ground information, exclusions, model limits, and specific questions for a senior or specialist engineer.',
  },
];

export const COURSE_DEVELOPMENT_REQUIREMENTS: CourseDevelopmentRequirement[] = [
  {
    id: 'UI1-PRECAST',
    sourceRef: 'Civil Engineering Syllabus.pdf, Page 3 Margin Comment [UI1]',
    title: 'Precast Concrete Elements, Bearings & Temporary Stability',
    topic: 'Precast Concrete & Bearings',
    targetModules: [6, 14, 17],
    syllabusComment: 'Cover precast elements through straightforward examples (net bearing after tolerances, spalling, and temporary stability before grouting/tying).',
    statusNote: 'Assessed in Modules 6, 14 & 17 (effective bearing length deductions and temporary propping). Full code-clause bearing checks require EC2 Cl. 10.9.5.2 and manufacturer data.',
    requestedTopics: ['Net bearing length after tolerances', 'Temporary stability prior to grouting'],
    handlingNote: 'Included in Module 6 and Module 17 assessments; expand with manufacturer precast tables in Stage 2.',
    status: 'Foundation Assessed • Expandable for Stage 2 Worked Examples',
  },
  {
    id: 'UI1-BACKPROPPING',
    sourceRef: 'Civil Engineering Syllabus.pdf, Page 3 Margin Comment [UI1]',
    title: 'Backpropping & Early-Age Slab Construction Loads',
    topic: 'Slab Propping & Backpropping',
    targetModules: [7, 14, 18],
    syllabusComment: 'Cover backpropping and multi-level construction load sharing across immature RC slabs through straightforward examples.',
    statusNote: 'Assessed in Module 14 (Project 14.3 and Topic 14.3 questions on wet pour + falsework load distribution across backpropped slabs) and Module 18.',
    requestedTopics: ['Wet concrete + construction live load', 'Stiffness-based load sharing between backpropped floors'],
    handlingNote: 'Included in Module 14 Topic 14.3; full multi-level sequence design requires CIRIA C660 / BS 5975.',
    status: 'Foundation Assessed • Expandable for Stage 2 Worked Examples',
  },
  {
    id: 'UI1-LIFTING',
    sourceRef: 'Civil Engineering Syllabus.pdf, Page 3 Margin Comment [UI1]',
    title: 'Lifting, Sling Inclination & Crane Outrigger Load Paths',
    topic: 'Lifting & Sling Mechanics',
    targetModules: [0, 1, 17],
    syllabusComment: 'Cover lifting arrangements (inclined sling tension amplification, dynamic amplification factors, inboard lifting cantilever hogging, and outrigger mat pressures).',
    statusNote: 'Assessed in Module 0, Module 1 & Module 17 Topic 17.2 (1/cos(theta) sling tension, dynamic factor, induced horizontal compression, and outrigger bearing).',
    requestedTopics: ['Inclined sling force resolution', 'Dynamic lifting factors & outrigger spreader mats'],
    handlingNote: 'First-principles mechanics assessed in Modules 0, 1 & 17; lifting accessories require LOLER / BS 7121 verification.',
    status: 'Foundation Assessed • Expandable for Stage 2 Worked Examples',
  },
  {
    id: 'UI1-GI-REPORTS',
    sourceRef: 'Civil Engineering Syllabus.pdf, Page 3 Margin Comment [UI1]',
    title: 'Critical Reading of Ground Investigation (GI) Reports',
    topic: 'Geotechnical Reports (GI)',
    targetModules: [12, 13],
    syllabusComment: 'Cover critical interpretation of factual and interpretative geotechnical reports (Made Ground, water strikes vs standpipes, plasticity index, and settlement).',
    statusNote: 'Assessed in Module 12 (Example 12.3 & Topic 12.4) and Milestone E.',
    requestedTopics: ['Borehole logs & water strike uncertainty', 'Made Ground & shrinkable clay hazards'],
    handlingNote: 'Included in Module 12 Topic 12.4; site-specific foundation design requires Eurocode 7 / BS 5930.',
    status: 'Foundation Assessed • Expandable for Stage 2 Worked Examples',
  },
  {
    id: 'UI1-CAT2-CHECKING',
    sourceRef: 'Civil Engineering Syllabus.pdf, Page 3 Margin Comment [UI1]',
    title: 'Category 2 Independent Design Checking Principles',
    topic: 'Category 2 Checking',
    targetModules: [19],
    syllabusComment: 'Cover Category 2 checking through straightforward examples without guessing ambiguous project-specific definitions.',
    statusNote: 'Assessed in Module 19 (Topic 19.2 & Skill 19.1). Explicitly distinguishes BS 5975 Temporary Works Cat 2 vs DMRB CS 450 Highway Structures Cat 2 so ambiguous definitions are never guessed.',
    requestedTopics: ['Independent derivation from Brief + Drawings', 'Confirming governing standard (BS 5975 vs DMRB CS 450)'],
    handlingNote: 'Preserved in Module 19 with explicit safeguard against guessing contractual category definitions.',
    status: 'Foundation Assessed • Ambiguous Definitions Explicitly Flagged',
  },
];

export const INTEGRATED_PROJECT_MILESTONES: IntegratedMilestoneItem[] = [
  {
    id: 'MILESTONE-A',
    code: 'A',
    title: 'Milestone A: Structural Mechanics Portfolio',
    Timing: 'After Module 6',
    afterModule: 6,
    description:
      'Complete and file: 10 equilibrium/reaction problems; 10 SFD/BMD problems; 5 bending-stress/section-property problems; 5 deflection problems; 5 buckling/stability sketches.',
    brief:
      'Compile a hand-calculated structural mechanics portfolio covering equilibrium, SFD/BMD, section properties, deflections, and stability sketches.',
    deliverables: [
      '10 Equilibrium and support reaction hand calculations with FBD sketches',
      '10 Shear Force and Bending Moment Diagram problems with peak values',
      '5 Elastic/plastic section property and bending stress problems',
      '5 Beam deflection and stiffness scaling problems',
      '5 Buckling effective length and stability load-path sketches',
    ],
    requiredItems: [
      { category: 'equilibrium_reactions', label: 'Equilibrium and reaction problems', requiredCount: 10 },
      { category: 'sfd_bmd', label: 'SFD and BMD problems', requiredCount: 10 },
      { category: 'bending_section', label: 'Bending-stress and section-property problems', requiredCount: 5 },
      { category: 'deflection', label: 'Deflection problems', requiredCount: 5 },
      { category: 'buckling_stability_sketches', label: 'Buckling and stability sketches', requiredCount: 5 },
    ],
    passCondition: 'You can explain each one without notes.',
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'MILESTONE-B',
    code: 'B',
    title: 'Milestone B: First EC3 Restrained Steel Beam Package',
    Timing: 'After Module 8',
    afterModule: 8,
    description:
      'Produce a complete 17-item learning calculation package for a laterally restrained steel beam to BS EN 1993-1-1.',
    brief:
      'Produce a complete 9-section calculation note and restraint sketch for a laterally restrained steel UB floor beam.',
    deliverables: [
      'Characteristic and ULS/SLS factored load takedown including self-weight',
      'Cross-section classification, bending M_c,Rd, and shear V_pl,Rd checks',
      'Serviceability deflection and support bearing/padstone checks',
      'Physical lateral restraint detail and independent sanity check',
    ],
    requiredItems: [
      { category: 'ec3_restrained_beam_package', label: 'Complete 17-item learning calculation package', requiredCount: 1 },
    ],
    passCondition:
      'A senior engineer can read it and see coherent assumptions, correct workflow, sensible loading, credible restraint, and an understandable conclusion.',
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'MILESTONE-C',
    code: 'C',
    title: 'Milestone C: Construction-Stage Case Study',
    Timing: 'After Module 11',
    afterModule: 11,
    description:
      'Choose a real or historic temporary works situation. Prepare: permanent condition; temporary condition; load path; stability system; sequencing risk; controls/checks.',
    brief:
      'Compare the temporary construction condition against the permanent condition for a real or historic structural operation.',
    deliverables: [
      'Permanent vs temporary static scheme and load-path diagrams',
      'Temporary stability and bracing arrangement during erection/demolition',
      'Construction sequencing risks and mandatory Hold Points',
    ],
    requiredItems: [
      { category: 'construction_stage_case_study', label: 'Temporary vs permanent condition case study', requiredCount: 1 },
    ],
    passCondition:
      'You can articulate why the temporary condition may govern even where the permanent structure is safe.',
    prerequisiteModuleNumbers: [1, 6, 8, 11],
  },
  {
    id: 'MILESTONE-D',
    code: 'D',
    title: 'Milestone D: Timber & Masonry Alteration Study',
    Timing: 'After Module 11',
    afterModule: 11,
    description:
      'Produce a learning case for a straightforward opening in load-bearing masonry or a timber floor beam.',
    brief:
      'Design a complete domestic/commercial knock-through or timber floor trimmer system including bearings, piers, foundations, and temporary needling.',
    deliverables: [
      'Full vertical and lateral load takedown above the proposed opening',
      'Steel lintel/timber trimmer check plus padstone and masonry pier check',
      'Temporary needling, propping, and sole-plate bearing sequence',
    ],
    requiredItems: [
      { category: 'timber_masonry_alteration_study', label: 'Whole-system alteration learning case', requiredCount: 1 },
    ],
    passCondition: 'You identify the whole system, not just the new beam.',
    prerequisiteModuleNumbers: [10, 11],
  },
  {
    id: 'MILESTONE-E',
    code: 'E',
    title: 'Milestone E: Foundation & Ground Investigation Report Review',
    Timing: 'After Module 13',
    afterModule: 13,
    description:
      'Read one factual ground investigation report and prepare: ground profile; groundwater observations; limitations; implications for foundation design; questions requiring a geotechnical engineer.',
    brief:
      'Critically appraise a Ground Investigation report, derive a design ground profile and water table, and size a pad foundation and retaining wall.',
    deliverables: [
      'Stratigraphic summary, effective stress profile, and groundwater assessment',
      'Pad foundation sizing (bearing, eccentricity, bending, one-way & punching shear)',
      'List of geotechnical uncertainties and specialist escalation questions',
    ],
    requiredItems: [
      { category: 'gi_report_and_foundation_review', label: 'Factual GI report review and foundation note', requiredCount: 1 },
    ],
    passCondition:
      'Critical identification of strata, groundwater, report limitations, and geotechnical escalation triggers.',
    prerequisiteModuleNumbers: [12, 13],
  },
  {
    id: 'MILESTONE-F',
    code: 'F',
    title: 'Milestone F: Integrated Small-Building Scheme & Independent Check',
    Timing: 'After Module 19',
    afterModule: 19,
    description:
      'Complete a hypothetical small extension/alteration package: load path from roof/floor to ground; actions and combinations; steel/timber/masonry elements; foundation concept; temporary support concept; design risk register; assumptions and limitations; list of independent checks/specialist input.',
    brief:
      'Assemble an end-to-end learning portfolio package for a small building/alteration scheme and perform an independent Category 2 check after a break.',
    deliverables: [
      'Complete vertical and lateral stability load-path scheme from roof to foundation',
      'Element calculations (steel, RC, timber, masonry, and pad foundations)',
      'General Arrangement sketch, temporary works concept, and CDM Design Risk Register',
      'Independent Category 2 check report documenting assumptions and limitations',
    ],
    requiredItems: [
      { category: 'integrated_small_building_scheme', label: 'Hypothetical small extension/alteration learning portfolio', requiredCount: 1 },
    ],
    passCondition:
      'Coherent multi-element learning portfolio demonstrating full load path, temporary works concept, risk register, and checking schedule.',
    prerequisiteModuleNumbers: [8, 10, 11, 13, 17, 18, 19],
  },
];
