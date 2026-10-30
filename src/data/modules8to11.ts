import { SyllabusModule } from '../types/syllabus';
import { qMcq, qNum } from './questionHelpers';

export const MODULES_8_TO_11: SyllabusModule[] = [
  /* ======================================================================== */
  /* MODULE 8: BASIC STEEL DESIGN TO EC3: LATERALLY RESTRAINED BEAMS          */
  /* ======================================================================== */
  {
    moduleNumber: 8,
    code: 'MOD-08',
    title: 'Module 8: Basic steel design to EC3: laterally restrained beams',
    shortTitle: 'Basic steel design to EC3: laterally restrained beams',
    suggestedDuration: '12–16 weeks',
    yearPathway: 'Year 1',
    year1Months: 'Months 11–12',
    whyItMatters:
      'This is your Year 1 capstone. It brings together tributary load takedown, ULS/SLS combinations, statics, SFDs/BMDs, section classification, bending, shear, deflection, bearing, restraint detailing, and independent checking into a complete 17-part engineering calculation package.',
    introduction:
      'Covers the complete design workflow for a laterally restrained simply supported Universal Beam to BS EN 1993-1-1: steel grades and thickness effect on yield strength fy, cross-section classification (Classes 1 to 4), plastic vs elastic bending resistance Mc,Rd, shear area Av and plastic shear resistance Vpl,Rd, high-shear moment interaction awareness, SLS deflection checks, web bearing/buckling, padstone/support detailing, what "laterally restrained" truly requires on site, and the 17-item Capstone Project.',
    objectives: [
      'Select a trial UB section, account for self-weight and thickness-dependent yield strength fy, and understand section classification (Classes 1, 2, 3, and 4).',
      'Calculate cross-section bending resistance Mc,Rd, shear resistance Vpl,Rd, and serviceability deflection for a laterally restrained beam.',
      'Specify practical bearing lengths, padstones, web stiffener awareness, connection assumptions, lateral restraint details, and independent checking items for the 17-item Capstone Project.',
    ],
    learningGate: [
      'Explain why the characteristic and design line loads in your calculation note are correct.',
      'Explain physically and practically why the beam is assumed laterally restrained.',
      'State clearly whether bending, shear, or serviceability deflection governs the chosen section.',
      'Explain what the support, padstone, and bearing arrangement physically needs.',
      'Identify what site or design change could make your calculation invalid.',
      'List what must be independently checked before real-world use.',
    ],
    prerequisiteModuleNumbers: [0, 1, 2, 3, 4, 5, 6, 7],
    topics: [
      {
        id: 'MOD08-T1',
        moduleNumber: 8,
        code: '8.1',
        title: 'Steel Grades, Section Tables & EC3 Section Classification (Classes 1–4)',
        summary:
          'Covers steel grades (S235, S275, S355), why nominal yield strength fy reduces for thicker flange/web plates, parameter ε = √(235/fy), and the physical meaning of Cross-Section Classes 1, 2, 3, and 4.',
        subtopics: [
          'Steel grades S275 and S355 and thickness reduction of fy (e.g. t ≤ 16 mm vs 16 < t ≤ 40 mm)',
          'Section tables (serial size, mass per metre kg/m -> self-weight kN/m, h, b, tw, tf, r, Iy, Wel,y, Wpl,y, Av)',
          'Material strain parameter ε = √(235 / fy)',
          'Class 1 (plastic hinge rotation capacity), Class 2 (full plastic moment Wpl·fy), Class 3 (elastic extreme-fibre yield Wel·fy), Class 4 (local buckling before yield, effective section W_eff)',
        ],
        learningObjectives: [
          'Convert beam mass per metre (kg/m) into characteristic self-weight line load (kN/m) and explain thickness effect on fy.',
          'Distinguish EC3 Section Classes 1, 2, 3, and 4 and state which section modulus each class permits.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Outstand flange c/tf and internal web c/tw slenderness limits walkthrough.',
          workedExamplesPlanned: 'Classifying a UB section in pure bending vs combined axial compression and bending.',
          calculationsPlanned: 'Computing ε = √(235/fy) and checking c/tf.',
          sourceReferencesNeeded: 'BS EN 1993-1-1, UK National Annex, and SCI P363 (Blue Book).',
        },
        questions: [
          qNum(
            'MOD08-T1-Q1',
            8,
            'MOD08-T1',
            'Convert UB mass per metre (kg/m) into characteristic self-weight (kN/m)',
            'A trial Universal Beam serial size has a tabulated mass per metre of 46.1 kg/m (for example, a 305×165×46 UB). Using g = 9.81 m/s², calculate its characteristic self-weight line load g_k,sw in kN/m (to 2 decimal places).',
            0.45,
            'kN/m',
            'g_k,sw = 46.1 kg/m × 9.81 m/s² = 452.24 N/m = 0.452 kN/m ≈ 0.45 kN/m.',
            'In hand calculations, engineers often round 0.452 kN/m up slightly to 0.50 kN/m as a conservative self-weight allowance.'
          ),
          qNum(
            'MOD08-T1-Q2',
            8,
            'MOD08-T1',
            'Calculate EC3 section classification parameter ε = √(235 / f_y)',
            'In BS EN 1993-1-1 cross-section classification, the plate slenderness limits are scaled by ε = √(235 / f_y). Calculate ε for grade S355 steel with f_y = 355 N/mm² (to 2 decimal places).',
            0.81,
            'ratio',
            'ε = √(235 / 355) = √0.66197 = 0.8136 ≈ 0.81.',
            'Because ε < 1.0 for S355, the maximum c/t ratio allowed before local buckling occurs is stricter (smaller) for S355 than for S235/S275!'
          ),
          qMcq(
            'MOD08-T1-Q3',
            8,
            'MOD08-T1',
            'Distinguish EC3 Section Classes 1, 2, 3, and 4',
            'In BS EN 1993-1-1, what is the purpose of classifying a cross-section into Class 1, 2, 3, or 4, and which section modulus is used for bending resistance M_c,Rd in each class?',
            [
              'It identifies the extent to which local plate buckling of the compression flange or web limits resistance: Classes 1 and 2 reach full plastic moment (W_pl · f_y / γ_M0), Class 3 is limited to first elastic yield at the extreme fibre (W_el,min · f_y / γ_M0), and Class 4 buckles locally in the elastic range (requiring effective modulus W_eff)',
              'Class 1 is for timber, Class 2 is for concrete, Class 3 is for masonry, and Class 4 is for soil',
              'Class 4 sections are the stockiest and use W_pl',
              'Section classification checks global Lateral Torsional Buckling over the 5 m span',
            ],
            0,
            'Section classification checks local plate buckling (c/t ratios of flange and web), not global member buckling.',
            'Core EC3 concept.'
          ),
          qMcq(
            'MOD08-T1-Q4',
            8,
            'MOD08-T1',
            'Explain why yield strength f_y reduces as plate/flange thickness t increases',
            'Why do steel product standards (such as BS EN 10025) and Eurocode 3 specify a lower nominal yield strength f_y for thick flanges (e.g. t = 25 mm) than for thin flanges (e.g. t = 12 mm) of the same steel grade S355?',
            [
              'Thicker steel plates cool more slowly during hot rolling and experience less mechanical grain refinement through the core thickness, resulting in a coarser grain microstructure with a slightly lower yield strength',
              'Thicker steel has a lower Young’s modulus E',
              'Gravity pulls harder on thicker flanges',
              'Thicker flanges are made of aluminium',
            ],
            0,
            'Metallurgical cooling rate and rolling reduction govern grain size (Hall-Petch relationship); always check the governing element thickness t before writing down fy!'
          ),
          qMcq(
            'MOD08-T1-Q5',
            8,
            'MOD08-T1',
            'Explain why higher yield strength S355 has stricter c/t local buckling limits (ε = 0.81)',
            'Why can a thin-walled section that is Class 2 in S275 steel become Class 3 in S355 steel?',
            [
              'Because reaching the higher yield stress of S355 (355 N/mm² vs 275 N/mm²) requires a larger compressive yield strain (ε_y = f_y/E) while the elastic plate buckling stiffness E remains unchanged, making local buckling occur earlier relative to yield',
              'Because S355 has a lower Young’s modulus E than S275',
              'Because S355 flanges are always thinner',
              'Because Class 3 is stronger than Class 1',
            ],
            0,
            'Higher fy demands greater compressive strain to reach yield while E is unchanged, hence ε = √(235/fy) reduces the allowable c/t ratio.',
            'Physical understanding behind ε = √(235/fy).'
          ),
        ],
      },
      {
        id: 'MOD08-T2',
        moduleNumber: 8,
        code: '8.2',
        title: 'Bending Resistance, Shear Resistance & High-Shear Interaction',
        summary:
          'Covers cross-section bending resistance M_c,Rd, shear area A_v and plastic shear resistance V_pl,Rd = A_v(f_y/√3)/γ_M0, checking V_Ed / V_c,Rd ≤ 0.50 so bending resistance is not reduced by high shear, and SLS deflection checks on the 5.0 m Capstone beam.',
        subtopics: [
          'Plastic design bending resistance for Class 1/2 sections: M_c,Rd = M_pl,Rd = W_pl,y · f_y / γ_M0',
          'Elastic design bending resistance for Class 3 sections: M_c,Rd = M_el,Rd = W_el,y,min · f_y / γ_M0',
          'Shear area A_v of a rolled I-section (approximated by web depth × web thickness plus root fillets)',
          'Plastic shear resistance: V_pl,Rd = A_v · (f_y / √3) / γ_M0 (von Mises shear yield τ_y = f_y / √3)',
          'Bending and shear interaction: if V_Ed ≤ 0.5 V_pl,Rd, no reduction in bending moment resistance is required',
        ],
        learningObjectives: [
          'Calculate M_c,Rd and V_pl,Rd for a laterally restrained steel beam using supplied section properties.',
          'Check whether V_Ed exceeds 50% of V_pl,Rd and explain why √3 appears in the shear resistance formula.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Von Mises yield criterion (τ_y = fy/√3 ≈ 0.577 fy) and shear buckling awareness (hw/tw > 72ε/η).',
          workedExamplesPlanned: 'Items 8 to 12 of the Module 8 Capstone 5.0 m beam calculation.',
          calculationsPlanned: 'Full ULS and SLS check comparison showing which limit state governs.',
          sourceReferencesNeeded: 'BS EN 1993-1-1 + UK NA and SCI Steelwork Design Guide to EC3.',
        },
        questions: [
          qNum(
            'MOD08-T2-Q1',
            8,
            'MOD08-T2',
            'Calculate ULS design bending moment M_Ed on the Module 8 Capstone beam',
            'In the Module 8 Capstone project, a laterally restrained simply supported steel beam spans L = 5.0 m and supports a floor over a 3.0 m tributary width. Suppose the total factored ULS design line load (including self-weight) is w_Ed = 24.0 kN/m. Calculate the maximum ULS design bending moment M_Ed = w_Ed · L² / 8 in kN·m.',
            75,
            'kN·m',
            'M_Ed = (24.0 × 5.0²) / 8 = 600 / 8 = 75.0 kN·m.',
            'Simply supported beam under uniform design load.'
          ),
          qNum(
            'MOD08-T2-Q2',
            8,
            'MOD08-T2',
            'Calculate design plastic bending resistance M_c,Rd of a Class 1 UB',
            'A trial Class 1 Universal Beam in S355 steel (f_y = 355 N/mm², γ_M0 = 1.00) has a major-axis plastic section modulus W_pl,y = 320 cm³ (320,000 mm³). Calculate its cross-section design bending resistance M_c,Rd = W_pl,y · f_y / γ_M0 in kN·m.',
            113.6,
            'kN·m',
            'M_c,Rd = (320,000 mm³ × 355 N/mm²) / 1.00 = 113,600,000 N·mm = 113.6 kN·m.',
            'Since M_Ed = 75.0 kN·m ≤ M_c,Rd = 113.6 kN·m (utilisation = 0.66), the section passes cross-section bending.'
          ),
          qNum(
            'MOD08-T2-Q3',
            8,
            'MOD08-T2',
            'Calculate design plastic shear resistance V_pl,Rd',
            'The same S355 Universal Beam (f_y = 355 N/mm², γ_M0 = 1.00) has a shear area A_v = 1,800 mm². Calculate its design plastic shear resistance V_pl,Rd = A_v · (f_y / √3) / γ_M0 in kN (to 1 decimal place).',
            368.9,
            'kN',
            'f_y / √3 = 355 / 1.73205 = 204.96 N/mm². V_pl,Rd = 1,800 mm² × 204.96 N/mm² / 1.00 = 368,926 N ≈ 368.9 kN.',
            'With V_Ed = 24.0 × 5.0 / 2 = 60.0 kN, V_Ed / V_pl,Rd = 60 / 368.9 = 0.163 ≤ 0.50 (low shear).'
          ),
          qMcq(
            'MOD08-T2-Q4',
            8,
            'MOD08-T2',
            'Understand bending and shear interaction threshold (V_Ed ≤ 0.5 V_pl,Rd)',
            'In BS EN 1993-1-1, why do we check whether the design shear force V_Ed is less than or equal to 50% of the plastic shear resistance V_pl,Rd?',
            [
              'When V_Ed ≤ 0.5 V_pl,Rd, the coexisting shear stress in the web is small enough that its effect on the plastic bending moment resistance M_c,Rd can be neglected; if V_Ed > 0.5 V_pl,Rd, a reduced yield strength must be applied to the web area when calculating bending resistance',
              'Because beams are not allowed to carry any shear force above 0.5 V_pl,Rd',
              'Because deflection doubles when V_Ed = 0.5 V_pl,Rd',
              'Because bolts fail at 0.5 V_pl,Rd',
            ],
            0,
            'Because the flanges carry almost all the bending moment while the web carries the shear, moderate web shear (≤ 50% of V_pl,Rd) barely reduces the total plastic moment of an I-section.',
            'Important EC3 cross-section interaction rule.'
          ),
          qMcq(
            'MOD08-T2-Q5',
            8,
            'MOD08-T2',
            'Explain why √3 appears in the steel plastic shear resistance formula V_pl,Rd = A_v(f_y/√3)/γ_M0',
            'Where does the factor 1/√3 (≈ 0.577) in the steel shear yield strength τ_y = f_y / √3 come from?',
            [
              'From the von Mises (distortion energy) yield criterion for ductile metals under pure shear stress, which shows that yielding in pure shear occurs at τ_y = f_y / √3',
              'From the geometry of an equilateral triangle support symbol',
              'From the ratio of concrete density to steel density',
              'From a conversion between inches and millimetres',
            ],
            0,
            'Under pure shear (σ_x = σ_y = 0, τ_xy = τ), von Mises equivalent stress is σ_eq = √(3 τ²); setting σ_eq = f_y gives τ_y = f_y / √3.',
            'Connects Module 3 mechanics to Module 8 EC3 formulas.'
          ),
        ],
      },
      {
        id: 'MOD08-T3',
        moduleNumber: 8,
        code: '8.3',
        title: 'Restraint Reality, Bearing/Padstones, Connections & The 17-Item Capstone',
        summary:
          'Covers what "laterally restrained" physically requires on site, end bearing length and padstone checks, web bearing/buckling awareness, simple connection concepts (fin plates, flexible end plates), corrosion/fire/tolerance awareness, and independent checking of the 17-item Capstone calculation note.',
        subtopics: [
          'What "laterally restrained" physically requires: positive restraint to the compression flange tied to a bracing system, plus torsional restraint at supports',
          'Support and bearing considerations: stiff bearing length, web crushing/crippling, masonry padstone sizing',
          'Simple connection concepts: why nominal pin connections must allow end rotation θ without inducing unintended moment',
          'Construction awareness: corrosion protection (C1–C5 environments), fire protection (intumescent/board), fabrication/erection tolerances',
          'The 17-item Capstone checklist and independent checking requirements (Module 8 Gate)',
        ],
        learningObjectives: [
          'Evaluate whether a real floor detail satisfies the "laterally restrained" assumption.',
          'Check support padstone bearing stresses and explain every item in the 17-part Capstone calculation note.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Detailed guide to all 17 sections of the Module 8 Capstone calculation package.',
          workedExamplesPlanned: 'Complete 17-item worked calculation note for the 5.0 m span, 3.0 m tributary width beam.',
          calculationsPlanned: 'Padstone bearing area and web stiffener screening checks.',
          sourceReferencesNeeded: 'SCI Steelwork Design Guide to EC3, SCI P363, and anonymised office beam calculation.',
        },
        questions: [
          qMcq(
            'MOD08-T3-Q1',
            8,
            'MOD08-T3',
            'Evaluate what makes a beam truly "laterally restrained" (Module 8 Gate)',
            'Your Module 8 calculation designs a 5.0 m steel beam using the full cross-section bending resistance M_c,Rd (with no LTB reduction χ_LT) on the assumption that the beam is "fully laterally restrained". Which site condition could invalidate this calculation?',
            [
              'Any of the following: (a) the floor slab/joists are supported on bottom-flange shelf angles without restraining the top compression flange; (b) a large stairwell/service void is cut adjacent to the compression flange removing restraint over part of the span; or (c) heavy wet concrete/construction loads are placed on the beam before the restraining floor deck is fixed',
              'Painting the steel beam with primer',
              'Using S355 steel instead of S275 steel',
              'Making the concrete padstone 50 mm longer',
            ],
            0,
            'If the compression flange is unrestrained over part of the span (due to a floor opening) or during construction, LTB can govern and M_b,Rd can be much lower than M_c,Rd!',
            'Directly tests the Module 8 Learning Gate ("what could make your calculation invalid").'
          ),
          qNum(
            'MOD08-T3-Q2',
            8,
            'MOD08-T3',
            'Calculate required padstone plan area for a masonry support bearing',
            'The 5.0 m steel beam delivers a ULS end support reaction of F_Ed = 60 kN onto a concrete padstone bedded on a load-bearing masonry wall. If the design compressive bearing resistance of the masonry beneath the padstone is f_d = 1.5 N/mm², and the wall leaf thickness (padstone width) is 100 mm, what minimum padstone length L_pad (in mm) along the wall is required assuming uniform pressure beneath the padstone?',
            400,
            'mm',
            'Required padstone area A_req = F_Ed / f_d = 60,000 N / 1.5 N/mm² = 40,000 mm². Since width b = 100 mm, minimum length L_pad = 40,000 / 100 = 400 mm.',
            'Shows why sitting the narrow steel beam flange directly on the brick without a 400 mm padstone would crush the brickwork.'
          ),
          qMcq(
            'MOD08-T3-Q3',
            8,
            'MOD08-T3',
            'Understand what a "simple support / nominal pin connection" requires in detailing',
            'In the Module 8 beam analysis, the end supports are idealised as simple pins (M = 0 at supports, so the beam ends rotate by angle θ = wL³/(24EI) under load). What must the physical steel connection detail (such as a fin plate or flexible partial-depth end plate) provide to match this assumption?',
            [
              'It must safely transfer the vertical shear reaction V_Ed (and required tying force) while having sufficient rotational flexibility (ductility) to allow the beam end to rotate without developing large unintended fixing moments that could overload the bolts, welds, or supporting column',
              'It must be full-penetration butt welded to both flanges to prevent any rotation',
              'It must allow the beam to fall off the support vertically',
              'It must have zero shear capacity',
            ],
            0,
            'If a "pinned" connection is detailed too stiffly without designing the bolts/supporting column for the resulting moment, the connection or column can fail prematurely.',
            'Connects analysis assumptions to connection detailing.'
          ),
          qMcq(
            'MOD08-T3-Q4',
            8,
            'MOD08-T3',
            'Identify when web bearing / web buckling checks and stiffeners are needed at supports',
            'When a steel Universal Beam rests directly on a bottom-flange bearing (such as a masonry padstone or steel seating bracket) rather than being supported via web cleats bolted to the web, what additional local check is required at the support?',
            [
              'The concentrated reaction F_Ed enters through the bottom flange into the thin web over a short stiff bearing length, so the web must be checked for local crushing and vertical web buckling (crippling), and bearing stiffeners must be added if the unstiffened web resistance is exceeded',
              'Only midspan deflection needs to be checked',
              'Bottom-flange seating eliminates shear force at the support',
              'Web stiffeners are only used for appearance',
            ],
            0,
            'When supported by web cleats/end-plates, the reaction is transferred directly by shear into the web depth; when seated on the bottom flange, the reaction must pass vertically through the thin web root.',
            'Module 8 bearing/web effects awareness.'
          ),
          qMcq(
            'MOD08-T3-Q5',
            8,
            'MOD08-T3',
            'Identify essential items in the 17-part Capstone calculation note (Module 8 Gate)',
            'An engineer’s beam calculation sheet shows only "w = 24 kN/m, M = 75 kN·m, 254×146×31 UB passes". Compared to the 17-item Module 8 Capstone standard, what critical engineering information is missing?',
            [
              'All context that makes the number verifiable and buildable: design brief/scope, annotated sketch, load path, breakdown of characteristic permanent/imposed loads & self-weight, ULS/SLS combinations, reactions, section classification, shear check, SLS deflection check, support/padstone bearing, lateral restraint detail, connection concept, and assumptions/limitations requiring independent check',
              'Nothing; three lines of numbers are sufficient for construction',
              'Only the price of the steel per tonne is missing',
              'Only a 3D finite element mesh is missing',
            ],
            0,
            'A calculation note is a communication document for a checking engineer and detailer; equations without load paths, restraint details, and stated assumptions are incomplete and unsafe.',
            'Directly reflects the 17-item Module 8 Capstone and Milestone B pass condition.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'PROJ-8.1',
        code: 'Capstone worked project',
        title: 'Laterally restrained simply supported steel beam (5.0 m span, 3.0 m tributary width)',
        kind: 'capstone_project',
        description:
          'A laterally restrained simply supported steel beam spans 5.0 m and supports a floor over a 3.0 m tributary width. Complete all 17 items: (1) design brief and scope; (2) annotated sketch; (3) load path; (4) characteristic actions; (5) ULS/SLS combinations; (6) reactions; (7) moment/shear; (8) trial UB selection; (9) section classification; (10) bending resistance; (11) shear resistance; (12) deflection; (13) bearing/support considerations; (14) restraint assumption; (15) simple connection concept; (16) conclusion; (17) assumptions, limitations, and required checking.',
        requiresCalcNote: true,
        statusLabel: 'Year 1 Capstone Project (Linked to Milestone B; Requires Independent Review)',
        selfReviewChecklist: [
          'Verify items 1–7: load path, characteristic actions + self-weight, ULS/SLS combinations, reactions, M_Ed and V_Ed.',
          'Verify items 8–12: trial UB from controlled table, classification, M_c,Rd, V_pl,Rd (and V_Ed ≤ 0.5 V_pl,Rd), and SLS deflection.',
          'Verify items 13–17: bearing/padstone, compression-flange restraint detail, simple connection concept, governing check conclusion, and limitations/checking list.',
        ],
      },
    ],
    resources: [
      'SCI Steelwork Design Guide to EC3.',
      'SCI P363 (Steel Building Design: Design Data) if accessible.',
      'SteelConstruction.info.',
      'An anonymised, checked office beam calculation—ideal if you can obtain one responsibly.',
    ],
    standardsNotice:
      'Year 1 Capstone module. Section property values and partial factors in assessment problems are explicitly stated in each prompt. For real design, always use controlled copies of BS EN 1993-1-1, the UK National Annex, and SCI P363.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD08-E01',
        8,
        'MOD08-T1',
        'Calculate characteristic permanent line load for the 5.0 m Capstone beam (3.0 m tributary width)',
        'A simply supported steel floor beam spans L = 5.0 m and supports a one-way floor over a tributary width of b_trib = 3.0 m. The floor has characteristic permanent load g_k,floor = 3.5 kN/m² and the steel beam self-weight allowance is 0.5 kN/m. Calculate the total characteristic permanent line load g_k (in kN/m) on the beam.',
        11,
        'kN/m',
        'g_k = (3.5 kN/m² × 3.0 m) + 0.5 kN/m = 10.5 + 0.5 = 11.0 kN/m.',
        'Capstone item 4: characteristic actions including self-weight.'
      ),
      qNum(
        'MOD08-E02',
        8,
        'MOD08-T1',
        'Calculate characteristic imposed line load for the 5.0 m Capstone beam',
        'For the same 5.0 m beam with a 3.0 m tributary width, if the floor carries a characteristic imposed action q_k,floor = 2.5 kN/m² (plus 0.5 kN/m² movable partitions = 3.0 kN/m² total imposed), calculate the characteristic imposed line load q_k in kN/m.',
        9,
        'kN/m',
        'q_k = 3.0 kN/m² × 3.0 m = 9.0 kN/m.',
        'Tributary width multiplication.'
      ),
      qNum(
        'MOD08-E03',
        8,
        'MOD08-T2',
        'Calculate ULS design line load w_Ed for the Capstone beam',
        'Using g_k = 11.0 kN/m and q_k = 9.0 kN/m with supplied partial factors γ_G = 1.35 and γ_Q = 1.50, calculate the ULS design line load w_Ed = 1.35·g_k + 1.50·q_k in kN/m.',
        28.35,
        'kN/m',
        'w_Ed = (1.35 × 11.0) + (1.50 × 9.0) = 14.85 + 13.50 = 28.35 kN/m.',
        'Capstone item 5: ULS combination.'
      ),
      qNum(
        'MOD08-E04',
        8,
        'MOD08-T2',
        'Calculate ULS support reaction R_Ed (= V_Ed) for the 5.0 m Capstone beam',
        'For the 5.0 m simply supported beam carrying w_Ed = 28.35 kN/m, calculate the ULS end reaction R_Ed (and maximum shear force V_Ed) at each support in kN (to 2 decimal places).',
        70.88,
        'kN',
        'R_Ed = V_Ed = (28.35 × 5.0) / 2 = 70.875 kN ≈ 70.88 kN.',
        'Capstone items 6 and 7.'
      ),
      qNum(
        'MOD08-E05',
        8,
        'MOD08-T2',
        'Calculate ULS design bending moment M_Ed for the 5.0 m Capstone beam',
        'For the 5.0 m simply supported beam carrying w_Ed = 28.35 kN/m, calculate the maximum ULS design bending moment M_Ed = w_Ed · L² / 8 at midspan in kN·m (to 2 decimal places).',
        88.59,
        'kN·m',
        'M_Ed = (28.35 × 5.0²) / 8 = 708.75 / 8 = 88.59375 kN·m ≈ 88.59 kN·m.',
        'Capstone item 7.'
      ),
      qNum(
        'MOD08-E06',
        8,
        'MOD08-T2',
        'Calculate minimum required plastic section modulus W_pl,req for S355 steel',
        'To resist M_Ed = 88.59 kN·m in a laterally restrained Class 1 S355 steel beam (with f_y = 355 N/mm² and γ_M0 = 1.00), calculate the minimum required plastic section modulus W_pl,y,req = M_Ed · γ_M0 / f_y in cm³ (to 1 decimal place).',
        249.5,
        'cm³',
        'W_pl,req = (88.59 × 10⁶ N·mm) / 355 N/mm² = 249,549 mm³ ≈ 249.5 cm³.',
        'Capstone item 8: used to enter the section table and pick a trial UB.'
      ),
      qNum(
        'MOD08-E07',
        8,
        'MOD08-T2',
        'Calculate bending utilisation ratio for a selected trial UB',
        'Suppose you select a trial Class 1 S355 Universal Beam with W_pl,y = 329 cm³ (so M_c,Rd = 329,000 × 355 / 1.0 = 116.80 kN·m) to resist M_Ed = 88.59 kN·m. Calculate the bending utilisation ratio M_Ed / M_c,Rd (to 2 decimal places).',
        0.76,
        'ratio',
        '88.59 / 116.80 = 0.7585 ≈ 0.76 (76% utilisation).',
        'Capstone item 10.'
      ),
      qNum(
        'MOD08-E08',
        8,
        'MOD08-T2',
        'Calculate variable-load SLS deflection of the selected trial UB',
        'The selected trial UB has major-axis I_y = 4,250 cm⁴ (42.5 × 10⁶ mm⁴) and E = 210,000 N/mm². Under the unfactored variable imposed line load q_k = 9.0 kN/m (9.0 N/mm) over span L = 5,000 mm, calculate the midspan variable-load deflection δ_Q = 5 q_k L⁴ / (384 E I_y) in mm (to 2 decimal places).',
        8.2,
        'mm',
        'Numerator = 5 × 9.0 × 5,000⁴ = 2.8125 × 10¹⁶. Denominator = 384 × 210,000 × 42.5 × 10⁶ = 3.4272 × 10¹⁵. δ_Q = 28.125 / 3.4272 = 8.206 mm ≈ 8.20 mm (compared to L/360 = 13.89 mm, so it passes!).',
        'Capstone item 12.'
      ),
      qNum(
        'MOD08-E09',
        8,
        'MOD08-T2',
        'Determine which check has the highest utilisation ratio (bending, shear, or SLS deflection)',
        'For our trial beam: ULS bending utilisation is 88.59 / 116.80 = 0.76; ULS shear utilisation is 70.88 / 350.0 = 0.20; SLS variable-load deflection utilisation is 8.20 mm / 13.89 mm = 0.59. Enter the numerical value of the highest (governing) utilisation ratio among the three (to 2 decimal places).',
        0.76,
        'ratio',
        'max(0.76, 0.20, 0.59) = 0.76 (ULS bending governs this 5.0 m span beam, with SLS deflection second at 0.59).',
        'Directly answers the Module 8 Gate question ("whether bending, shear, or deflection governs").'
      ),
      qNum(
        'MOD08-E10',
        8,
        'MOD08-T1',
        'Calculate c/t_f outstand flange slenderness ratio',
        'A rolled I-section has overall flange width b = 165 mm, web thickness t_w = 6.0 mm, root fillet radius r = 10.2 mm, and flange thickness t_f = 10.2 mm. The clear outstand width of each flange half is c = (b − t_w − 2r) / 2. Calculate the flange slenderness ratio c / t_f (to 2 decimal places).',
        6.79,
        'ratio',
        'c = (165 − 6.0 − 2 × 10.2) / 2 = (165 − 26.4) / 2 = 138.6 / 2 = 69.3 mm. Ratio c / t_f = 69.3 / 10.2 = 6.794 ≈ 6.79.',
        'For Class 1 outstand compression flange in EC3, the limit is 9ε (for S355, 9 × 0.81 = 7.32). Since 6.79 ≤ 7.32, the flange is Class 1!'
      ),
      qMcq(
        'MOD08-E11',
        8,
        'MOD08-T1',
        'Understand why the root radius r is subtracted when finding clear web depth c_w and flange outstand c_f',
        'When checking EC3 section classification for a hot-rolled Universal Beam, why are the root fillets (radius r where the web meets the flanges) excluded from the slender plate width c?',
        [
          'Because the thick curved root fillets stiffen the junction between the web and flanges, so local plate buckling only occurs over the flat clear plate width c between the fillets',
          'Because the root fillets carry zero stress',
          'Because root fillets are made of plastic',
          'To make the section appear more slender than it really is',
        ],
        0,
        'Local plate buckling depends on the flat unsupported plate width between stiffened boundaries.',
        'Detail of EC3 section classification.'
      ),
      qMcq(
        'MOD08-E12',
        8,
        'MOD08-T2',
        'Identify when shear buckling of a slender web must be checked',
        'In standard hot-rolled UK Universal Beams, the web depth-to-thickness ratio h_w / t_w is relatively stocky (typically < 55), so web shear resistance is governed by plastic shear yielding V_pl,Rd. When does elastic/inelastic web SHEAR BUCKLING become a critical check in BS EN 1993-1-1 / EN 1993-1-5?',
        [
          'In deep fabricated plate girders with thin, slender webs where h_w / t_w exceeds 72ε / η (for unstiffened webs)',
          'In solid square steel bars',
          'Whenever the beam span is less than 1.0 m',
          'Only when the beam is in pure tension',
        ],
        0,
        'Hot-rolled UBs rarely suffer web shear buckling, whereas deep thin-webbed plate girders require shear buckling checks and transverse stiffeners.',
        'Important boundary of simple beam shear checks.'
      ),
      qMcq(
        'MOD08-E13',
        8,
        'MOD08-T3',
        'Evaluate whether timber joists notched into the web restrain the top compression flange',
        'Incoming timber floor joists sit inside the web of a steel I-beam on bottom-flange timber bearers, and there is a 25 mm clearance gap between the top of the joists and the underside of the steel top flange, with no strapping or packing to the top flange. Does this detail provide positive lateral restraint to the steel top flange?',
        [
          'No; if the top flange is not positively packed/strapped to the joists or diaphragm, the top compression flange can move sideways within the gap before engaging the floor, so positive restraint detailing (such as tight timber blocking/nogging and strapping tied to a floor diaphragm) is required',
          'Yes; air gaps transmit lateral compression without displacement',
          'Yes; bottom-flange bearers prevent top-flange lateral movement automatically',
          'Steel beams supporting timber joists never experience compression in the top flange',
        ],
        0,
        'Restraint assumptions in calculations must be backed up by physical contact/fixing details on drawings (Module 8 & Module 17 Gate).',
        'Real-world domestic/commercial alteration detail.'
      ),
      qMcq(
        'MOD08-E14',
        8,
        'MOD08-T3',
        'Understand eccentric loading on a beam flange (torsion risk)',
        'A builder proposes supporting a heavy brick outer leaf on a wide steel plate welded to one side of a Universal Beam so the brickwork load sits 120 mm eccentric to the beam’s web centreline. Why does this invalidate a standard major-axis bending calculation?',
        [
          'An eccentric vertical load offset from the shear centre (web centreline) induces significant twisting torque (torsion and warping stresses) along the open I-section, which has very low torsional stiffness and must either be torsionally restrained along its span or replaced by a torsionally stiff hollow box / twin-beam arrangement',
          'Open I-sections have infinite torsional stiffness so eccentricity never matters',
          'Eccentric loads reduce the vertical reaction to zero',
          'Welding a plate increases Young’s modulus E',
        ],
        0,
        'Standard EC3 major-axis bending assumes loads act through the shear centre (in the plane of the web) without inducing torsion.',
        'Critical limitation of simple beam design.'
      ),
      qMcq(
        'MOD08-E15',
        8,
        'MOD08-T3',
        'Identify minimum practical connection information required on a drawing/calculation handover',
        'When a structural engineer designs a beam assuming simple connections and passes the design to a steelwork fabricator for connection detailing, what minimum connection design information must be stated clearly?',
        [
          'The ULS vertical shear reaction V_Ed, the required structural integrity tying force (horizontal tie force), whether torsional support restraint is required, and any axial force or special bearing/notch constraint',
          'Only the serial size of the beam with no reaction forces',
          'Only the unfactored imposed load per square metre',
          'No forces are needed because all connections carry 1,000 kN',
        ],
        0,
        'In UK practice, fabricators cannot safely design fin plates or end plates unless the engineer states the ULS end reactions and tying forces on the GA drawings/schedules.',
        'Module 8 construction and detailing awareness.'
      ),
      qMcq(
        'MOD08-E16',
        8,
        'MOD08-T3',
        'Understand fire resistance and corrosion protection awareness for steel beams',
        'Why must fire resistance period (e.g. R30, R60, R120) and exposure environment (corrosion category) be identified early in a steel beam design?',
        [
          'Because unprotected structural steel loses roughly half its strength and stiffness at temperatures around 550–600°C (requiring intumescent coating, fire board, or encasement that affects architectural zones), and damp/external environments require appropriate protective coatings or galvanising (which adds weight and requires vent/drain holes)',
          'Because steel melts at 80°C',
          'Because intumescent paint doubles the second moment of area I at room temperature',
          'Because corrosion protection replaces lateral restraint',
        ],
        0,
        'Module 8 Learn item: corrosion/fire requirements awareness.',
        'Practical permanent-works context.'
      ),
      qNum(
        'MOD08-E17',
        8,
        'MOD08-T2',
        'Calculate elastic bending resistance M_el,Rd of a Class 3 section',
        'A slender fabricated steel I-section is classified as Class 3 in bending. It has major-axis plastic modulus W_pl,y = 480 cm³, elastic modulus W_el,y = 420 cm³, f_y = 355 N/mm², and γ_M0 = 1.00. What is its design cross-section bending resistance M_c,Rd in kN·m?',
        149.1,
        'kN·m',
        'Because the section is Class 3, local buckling prevents full plastification so W_el,y (420 cm³) MUST be used instead of W_pl,y: M_c,Rd = 420,000 mm³ × 355 N/mm² / 1.00 = 149.1 kN·m.',
        'Using W_pl,y (170.4 kN·m) on a Class 3 section would overestimate capacity by 14%!'
      ),
      qNum(
        'MOD08-E18',
        8,
        'MOD08-T3',
        'Check web bearing stress under a concentrated support reaction',
        'At a simple support, a steel beam with web thickness t_w = 8.0 mm distributes an end reaction F_Ed = 80 kN over an effective stiff dispersion length at the web root of L_eff = 100 mm. Calculate the local vertical compressive stress σ_z,Ed = F_Ed / (L_eff × t_w) at the web root in N/mm².',
        100,
        'N/mm²',
        'Area of web root resisting bearing = 100 mm × 8.0 mm = 800 mm². σ_z,Ed = 80,000 N / 800 mm² = 100 N/mm².',
        'Illustrates how support bearing length disperses through the flange thickness and root fillet into the web.'
      ),
      qMcq(
        'MOD08-E19',
        8,
        'MOD08-T3',
        'Understand fabrication and erection tolerances in beam-to-column interfaces',
        'Why are steel beams connected between column flanges typically detailed slightly shorter (e.g. 2–5 mm clearance at each end) than the theoretical grid-to-grid clear distance between columns, with packing shims provided where necessary?',
        [
          'To accommodate normal rolling tolerances on column depth, column plumb tolerances during erection, and crane drop-in clearance so the beam does not jam between the columns on site',
          'Because steel shrinks by 50 mm after bolting',
          'To eliminate shear force at the connections',
          'Because bolts cannot fit in round holes',
        ],
        0,
        'Module 8 Learn item: fabrication and erection tolerances awareness.',
        'Practical site/erection buildability.'
      ),
      qMcq(
        'MOD08-E20',
        8,
        'MOD08-T3',
        'Identify what must be independently checked before a learning calculation is used in practice (Module 8 Gate)',
        'You have completed your 17-item Module 8 Capstone calculation note. Before any such calculation could ever be used for real construction, what must happen?',
        [
          'Every input and assumption (actual site dimensions, floor loading, supporting wall/column and foundation capacity, lateral restraint detail, connection design, fire/durability spec, and compliance with current controlled standards and UK National Annexes) must be verified and independently checked by a suitably qualified engineer under a formal checking procedure',
          'Passing the app’s 90% quiz is sufficient legal approval to build',
          'Only the spelling needs to be checked',
          'Only the midspan deflection needs to be checked',
        ],
        0,
        'Final requirement of the Module 8 Learning Gate.',
        'Professional safety boundary.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 9: DEEPER STEEL DESIGN: COLUMNS, LTB, CONNECTIONS AND FRAMES      */
  /* ======================================================================== */
  {
    moduleNumber: 9,
    code: 'MOD-09',
    title: 'Module 9: Deeper steel design: columns, LTB, connections and frames',
    shortTitle: 'Deeper steel design: columns, LTB, connections and frames',
    suggestedDuration: '16–20 weeks',
    yearPathway: 'Years 2–3',
    year1Months: 'Years 2–3',
    whyItMatters:
      'Real steel structures are 3D assemblages of unrestrained beams, columns under combined axial and eccentric moments, bolted/welded connections, and braced or portal frames where stability and connection stiffness govern the whole model.',
    introduction:
      'Extends EC3 steel design to unrestrained beams (Lateral Torsional Buckling M_b,Rd = χ_LT·W_pl·f_y/γ_M1, non-dimensional slenderness λ_LT, restraint spacing, load-height effects, web stiffeners), compression members (flexural buckling N_b,Rd = χ·A·f_y/γ_M1, buckling curves a0 to d, beam-column interaction), bolted and welded connections (shear, bearing, tension, block tearing, simple vs moment connections, base plates), and braced vs portal frame stability (second-order P-Δ awareness).',
    objectives: [
      'Follow the EC3 LTB calculation workflow for unrestrained beams and evaluate design alternatives to improve LTB capacity (Project 9.1).',
      'Carry out EC3 column buckling checks using non-dimensional slenderness λ_bar and reduction factor χ, and understand beam-column interaction (Project 9.2).',
      'Understand bolted and welded connection load paths, simple vs moment connection stiffness assumptions, base plates, and braced/portal frame stability (Project 9.3).',
    ],
    learningGate: [
      'Distinguish a cross-section beam strength problem from a Lateral Torsional Buckling (LTB) problem.',
      'Distinguish material crushing/yielding (squash load) from column flexural/torsional buckling.',
      'Identify whether the global lateral stability system of a steel frame is credible.',
      'Explain why connection rotational stiffness assumptions affect the internal force distribution of the whole structural model.',
    ],
    prerequisiteModuleNumbers: [6, 8],
    topics: [
      {
        id: 'MOD09-T1',
        moduleNumber: 9,
        code: '9.1',
        title: 'Unrestrained Steel Beams, LTB Workflow & Web Stiffeners (Project 9.1)',
        summary:
          'Covers the EC3 LTB workflow (M_cr -> λ_LT = √(W_y·f_y/M_cr) -> χ_LT -> M_b,Rd), moment gradient factor C_1, destabilising top-flange loads, restraint spacing, and web bearing/buckling stiffeners.',
        subtopics: [
          'Elastic critical moment M_cr and non-dimensional LTB slenderness λ_bar,LT = √(W_y · f_y / M_cr)',
          'LTB reduction factor χ_LT (0 < χ_LT ≤ 1.0) and buckling resistance M_b,Rd = χ_LT · W_y · f_y / γ_M1',
          'Effect of bending moment diagram shape (uniform moment C_1 = 1.0 is most severe; linear/steep moment gradient increases M_cr)',
          'Destabilising loads on unrestrained top flanges and how adding intermediate restraints or using a UKC/SHS improves capacity (Project 9.1)',
          'Web bearing, web buckling, and transverse stiffeners at heavy concentrated loads or supports',
        ],
        learningObjectives: [
          'Calculate M_b,Rd and λ_bar,LT from supplied parameters and explain Project 9.1.',
          'Explain why uniform bending moment over an unrestrained span is more severe for LTB than a steep moment gradient.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Full EC3 LTB curve selection and C1 factor explanation.',
          workedExamplesPlanned: 'Project 9.1: re-checking the Module 8 beam with continuous restraint removed.',
          calculationsPlanned: 'Comparing a tall narrow UB vs a wider UKC/SHS over an unrestrained span.',
          sourceReferencesNeeded: 'BS EN 1993-1-1, UK National Annex, SCI P363, and SteelConstruction.info.',
        },
        questions: [
          qNum(
            'MOD09-T1-Q1',
            9,
            'MOD09-T1',
            'Calculate non-dimensional LTB slenderness λ_bar,LT',
            'An unrestrained Class 1 S355 steel beam (f_y = 355 N/mm²) has plastic section modulus W_pl,y = 600 cm³ (600,000 mm³, so M_pl = W_pl,y · f_y = 213.0 kN·m) and an elastic critical LTB moment of M_cr = 148.0 kN·m. Calculate its non-dimensional LTB slenderness λ_bar,LT = √(W_pl,y · f_y / M_cr) (to 2 decimal places).',
            1.2,
            'ratio',
            'λ_bar,LT = √(213.0 / 148.0) = √1.4392 = 1.1997 ≈ 1.20.',
            'When λ_bar,LT > 1.0, the elastic critical buckling moment M_cr is smaller than the full plastic moment M_pl, so LTB heavily governs!'
          ),
          qNum(
            'MOD09-T1-Q2',
            9,
            'MOD09-T1',
            'Calculate LTB design buckling resistance M_b,Rd',
            'For the unrestrained beam in the previous question (W_pl,y · f_y = 213.0 kN·m), if the EC3 LTB buckling curve gives a reduction factor χ_LT = 0.52 and γ_M1 = 1.00, calculate the LTB design buckling moment resistance M_b,Rd = χ_LT · W_pl,y · f_y / γ_M1 in kN·m (to 1 decimal place).',
            110.8,
            'kN·m',
            'M_b,Rd = 0.52 × 213.0 / 1.00 = 110.76 kN·m ≈ 110.8 kN·m (nearly half of its laterally restrained capacity of 213.0 kN·m!).',
            'Directly illustrates Project 9.1: removing continuous lateral restraint slashes the safe bending capacity.'
          ),
          qMcq(
            'MOD09-T1-Q3',
            9,
            'MOD09-T1',
            'Explain why moment gradient affects LTB resistance (C_1 factor)',
            'Two identical unrestrained beams of length L have the exact same peak bending moment M_max. Beam A has a constant uniform bending moment M_max along its entire length, while Beam B has a moment that varies linearly from +M_max at one end to 0 at the other. Why does Beam B have a significantly higher elastic critical moment M_cr against LTB?',
            [
              'In Beam A, the entire length of the compression flange is stressed at the peak compressive force simultaneously, whereas in Beam B only one end experiences peak compression while the less-stressed portion of the flange helps restrain lateral buckling',
              'Beam B has a higher Young’s modulus E',
              'Beam A has zero shear modulus G',
              'Uniform bending moment prevents twisting',
            ],
            0,
            'Uniform compression over the entire unrestrained length (C_1 = 1.0) is the worst case for LTB; a moment gradient leaves most of the flange at lower compression.',
            'Physical explanation of moment gradient factor C_1.'
          ),
          qMcq(
            'MOD09-T1-Q4',
            9,
            'MOD09-T1',
            'Identify effective design alternatives when an unrestrained beam fails LTB (Project 9.1)',
            'In Syllabus Project 9.1, removing the continuous floor restraint causes your trial Universal Beam to fail in Lateral Torsional Buckling. Which set of design or detailing alternatives would genuinely improve its LTB resistance?',
            [
              'Provide intermediate lateral restraints tied to a braced bay (reducing unrestrained length L_LT), or switch to a section with much higher minor-axis stiffness I_z and torsional stiffness J (such as a wider Universal Column UKC section or a closed Rectangular Hollow Section RHS)',
              'Keep the exact same UB and remove the torsional restraints at the end supports',
              'Apply the load to the top flange via a tall unstiffened packing block',
              'Cut slots in the compression flange',
            ],
            0,
            'UKC sections have wide flanges (large I_z) and RHS box sections have huge torsional constant J (so RHS beams are virtually immune to LTB at normal spans).',
            'Project 9.1 core engineering judgement.'
          ),
          qMcq(
            'MOD09-T1-Q5',
            9,
            'MOD09-T1',
            'Identify the purpose of transverse web stiffeners at supports and heavy point loads',
            'Why are full-depth transverse steel plates (web stiffeners) welded between the top and bottom flanges on both sides of an I-beam web at heavy column transfer points or unrestrained beam ends?',
            [
              'They prevent local web crushing and vertical web buckling under concentrated forces, and at beam supports they prevent the top flange from twisting relative to the bottom flange (providing torsional support restraint)',
              'They increase the major-axis second moment of area I_y at midspan by 300%',
              'They reduce the self-weight of the beam',
              'They allow the web to be omitted completely',
            ],
            0,
            'Load-bearing and torsional stiffeners reinforce the thin web against local out-of-plane buckling and cross-sectional distortion.',
            'Module 9 web bearing/buckling and stiffeners.'
          ),
        ],
      },
      {
        id: 'MOD09-T2',
        moduleNumber: 9,
        code: '9.2',
        title: 'Steel Columns, Buckling Curves & Beam-Column Interaction (Project 9.2)',
        summary:
          'Covers EC3 axial compression buckling resistance N_b,Rd = χ·A·f_y/γ_M1, non-dimensional slenderness λ_bar = √(A·f_y/N_cr), why imperfection curves (a0, a, b, c, d) differ by axis and fabrication, effective lengths in braced vs unbraced frames, and combined axial compression plus biaxial bending (beam-columns).',
        subtopics: [
          'Squash load N_pl,Rd = A·f_y/γ_M0 vs flexural buckling resistance N_b,Rd = χ·A·f_y/γ_M1',
          'Non-dimensional slenderness λ_bar = √(A·f_y / N_cr) = (L_cr / i) / (π √(E / f_y))',
          'Why EC3 has multiple buckling curves (a0, a, b, c, d): residual stresses and geometric imperfections',
          'Why Universal Column (UKC) sections have much higher minor-axis radius of gyration i_z than narrow UB sections',
          'Nominal eccentricity moments at simple connections (e.g. 100 mm from column face) and beam-column interaction (N_Ed/N_b,Rd + k_y M_y,Ed/M_b,Rd + k_z M_z,Ed/M_z,Rd ≤ 1.0)',
        ],
        learningObjectives: [
          'Calculate λ_bar and N_b,Rd for a steel column (Project 9.2) and explain why N_b,Rd < N_pl,Rd.',
          'Explain why simple beam connections still induce nominal eccentric moments in columns.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Step-by-step guide to EC3 Clause 6.3.1 buckling curves and simple column nominal moments.',
          workedExamplesPlanned: 'Project 9.2 complete column buckling check.',
          calculationsPlanned: 'Comparing UKC 203×203 vs UB 305×127 of similar mass per metre as a column.',
          sourceReferencesNeeded: 'BS EN 1993-1-1, UK National Annex, and SCI column design guides.',
        },
        questions: [
          qNum(
            'MOD09-T2-Q1',
            9,
            'MOD09-T2',
            'Calculate non-dimensional column slenderness λ_bar (Project 9.2)',
            'A steel column (Project 9.2) has cross-sectional area A = 5,800 mm², yield strength f_y = 355 N/mm² (so squash load A·f_y = 2,059 kN), and elastic critical Euler buckling load N_cr = 1,430 kN about its governing minor axis. Calculate its non-dimensional slenderness λ_bar = √(A·f_y / N_cr) (to 2 decimal places).',
            1.2,
            'ratio',
            'λ_bar = √(2,059 / 1,430) = √1.4399 = 1.20.',
            'When λ_bar ≤ 0.2, buckling effects may be ignored (χ = 1.0); at λ_bar = 1.20, buckling strongly reduces capacity.'
          ),
          qNum(
            'MOD09-T2-Q2',
            9,
            'MOD09-T2',
            'Calculate EC3 design buckling resistance N_b,Rd (Project 9.2)',
            'For the column in the previous question (A·f_y = 2,059 kN), if buckling curve "c" gives a reduction factor χ = 0.434 and γ_M1 = 1.00, calculate the design buckling resistance N_b,Rd = χ · A · f_y / γ_M1 in kN (to 1 decimal place).',
            893.6,
            'kN',
            'N_b,Rd = 0.434 × 2,059 / 1.00 = 893.6 kN (only 43.4% of the 2,059 kN squash load!).',
            'Directly answers Project 9.2 ("explain why the result is lower than squash-load capacity").'
          ),
          qMcq(
            'MOD09-T2-Q3',
            9,
            'MOD09-T2',
            'Explain why EC3 assigns different buckling curves (a0, a, b, c, d) to different sections and axes',
            'Why does a hot-rolled H-section (UKC) use a more favourable buckling curve (curve "b") for buckling about its major axis y-y than for buckling about its minor axis z-z (curve "c")?',
            [
              'During cooling after hot rolling, the tips of the flanges cool faster than the web-flange junction, locking in compressive residual stresses at the flange tips; these flange tips lie furthest from the minor axis z-z, causing earlier yielding and greater stiffness loss when buckling about the minor axis',
              'Because the column is longer about its minor axis',
              'Because gravity acts sideways on the minor axis',
              'Because Young’s modulus E is smaller in the flanges than in the web',
            ],
            0,
            'Compressive residual stresses at the flange tips reduce the effective minor-axis flexural stiffness I_z much more rapidly than major-axis I_y once compression increases.',
            'Physical reason behind the multiple Perry-Robertson curves in EC3.'
          ),
          qNum(
            'MOD09-T2-Q4',
            9,
            'MOD09-T2',
            'Calculate nominal eccentricity bending moment on a column in simple construction',
            'In UK "simple construction" design, a floor beam delivers a ULS vertical reaction of R_Ed = 180 kN to the flange face of a 203×203 UKC column (depth h = 203.2 mm, so distance from column centroid to flange face is h/2 ≈ 101.6 mm). Assuming the reaction acts at a nominal eccentricity of 100 mm beyond the column flange face, what total eccentricity lever arm e (in mm) from the column centreline is used, and what moment M_y,Ed (in kN·m) is induced? Enter M_y,Ed in kN·m (to 1 decimal place).',
            36.3,
            'kN·m',
            'Total lever arm from column centreline e = (203.2 / 2) + 100 = 101.6 + 100 = 201.6 mm = 0.2016 m. Nominal moment M_y,Ed = 180 kN × 0.2016 m = 36.29 kN·m ≈ 36.3 kN·m.',
            'Even in "pinned" simple construction, unbalanced floor beams on one side of a column induce eccentric moments that must be checked in combined axial + bending!'
          ),
          qMcq(
            'MOD09-T2-Q5',
            9,
            'MOD09-T2',
            'Compare effective lengths in braced (non-sway) vs unbraced (sway) frames',
            'How does the effective buckling length L_cr of a column in an unbraced sway frame compare to that of the same column of storey height L in a braced non-sway frame?',
            [
              'In a braced frame, horizontal translation of the storey tops is prevented so L_cr ≤ 1.0 L (typically 0.7 L to 1.0 L); in an unbraced sway frame, the top of the column translates sideways during buckling so L_cr > 1.0 L (often 1.5 L to 2.0 L or more), drastically reducing buckling resistance',
              'Unbraced sway frames always have L_cr = 0.5 L',
              'Braced frames always have L_cr = 3.0 L',
              'Sway has no effect on column buckling',
            ],
            0,
            'Preventing sway via diagonal bracing or shear cores keeps column effective lengths ≤ storey height L.',
            'Connects column design to global frame stability.'
          ),
        ],
      },
      {
        id: 'MOD09-T3',
        moduleNumber: 9,
        code: '9.3',
        title: 'Bolted & Welded Connections, Base Plates & Frame Behaviour (Project 9.3)',
        summary:
          'Covers bolted connection behaviour (shear, bearing, tension, prying, block tearing), fillet and butt weld basics, simple vs moment-resisting connection stiffness, column base plates, braced frame analysis (Project 9.3), portal frame basics, and second-order (P-Δ) awareness.',
        subtopics: [
          'Bolted connections: bolt shear, plate bearing, tension & prying action, block tearing around bolt groups',
          'Welded connections: full-penetration butt welds vs fillet welds (throat thickness a ≤ 0.7 × leg length s)',
          'Connection classification by stiffness and strength: nominally pinned, semi-rigid/partial-strength, rigid/full-strength',
          'Column base plates: spreading axial load N_Ed over concrete foundation bedding grout, and holding-down bolts for uplift/temporary erection stability',
          'Braced frames (Project 9.3), portal frames (haunches and eaves/apex moments), and second-order P-Δ sway amplification awareness',
        ],
        learningObjectives: [
          'Calculate fillet weld throat thickness, bolt group forces, and column baseplate pressures.',
          'Explain why connection stiffness assumptions affect the entire structural analysis model (Module 9 Gate).',
        ],
        futureExpansion: {
          lessonsPlanned: 'SCI Green Book connection design concepts (fin plate, flexible end plate, moment end plate, base plate).',
          workedExamplesPlanned: 'Project 9.3 braced steel frame load path and member forces.',
          calculationsPlanned: 'Eccentric bolt group shear and block tearing checks.',
          sourceReferencesNeeded: 'BS EN 1993-1-8, UK National Annex, and SCI Connection Design Guides (P358 / P398).',
        },
        questions: [
          qNum(
            'MOD09-T3-Q1',
            9,
            'MOD09-T3',
            'Calculate effective throat thickness a of a symmetric 45° fillet weld',
            'A standard mitre (flat-faced 45°) fillet weld has equal leg lengths of s = 8.0 mm. Calculate its theoretical effective throat thickness a = s / √2 (≈ 0.707 s) in mm (to 2 decimal places).',
            5.66,
            'mm',
            'a = 8.0 × cos(45°) = 8.0 × 0.7071 = 5.657 mm ≈ 5.66 mm (often taken conservatively as 0.7 × 8.0 = 5.6 mm).',
            'Fillet weld capacity per mm length is governed by throat thickness a, not leg length s.'
          ),
          qMcq(
            'MOD09-T3-Q2',
            9,
            'MOD09-T3',
            'Understand block tearing failure in a bolted beam-end or gusset connection',
            'What is "block tearing" at a bolted connection (such as a notched beam web or tension gusset plate)?',
            [
              'A combined shear-and-tension tear-out failure where a block of plate material rips out along the perimeter of the bolt group—failing simultaneously by shear along the longitudinal bolt row(s) and tension across the transverse end bolt line',
              'A failure where the concrete foundation cracks 10 m away',
              'Pure Euler buckling of the column flange',
              'Melting of the bolt heads',
            ],
            0,
            'Block tearing is particularly critical when a beam top flange is notched (coped) at a connection, leaving a free top edge above the bolt group.',
            'Module 9 Learn item: block tearing awareness.'
          ),
          qMcq(
            'MOD09-T3-Q3',
            9,
            'MOD09-T3',
            'Understand why connection assumptions affect the whole structural model (Module 9 Gate)',
            'Suppose an engineer analyses a steel frame assuming beam-to-column joints are frictionless pins (so columns receive zero end moment from the beams), but on the drawings specifies deep, heavily stiffened extended end-plate moment connections welded/bolted to the column flanges. What is the danger of this mismatch?',
            [
              'The stiff connections restrain beam end rotation and attract large hogging bending moments into both the connection bolts/welds and the supporting columns—moments that the columns and foundations were never designed to resist',
              'The beams will deflect more at midspan than calculated',
              'Stiff connections never attract bending moment',
              'The frame becomes a mechanism',
            ],
            0,
            'In structural mechanics, force follows stiffness! If a connection is detailed stiffly, it will attract moment whether the analysis model assumed a pin or not.',
            'Direct Module 9 Gate requirement.'
          ),
          qMcq(
            'MOD09-T3-Q4',
            9,
            'MOD09-T3',
            'Understand why pitched-roof steel portal frames have haunches at the eaves',
            'In a single-storey pitched-roof steel portal frame, why is the rafter typically deepened with a fabricated haunch at the eaves (beam-to-column knee) connection?',
            [
              'Because the largest bending moment in a portal frame occurs at the eaves knee (hogging under gravity load), and deepening the lever arm at the eaves increases bending resistance, increases frame flexural stiffness, and provides room for a multi-row bolted moment end-plate connection',
              'Because bending moment is zero at the eaves knee',
              'To make the roof heavier at the supports',
              'Because rafters are pinned at the eaves',
            ],
            0,
            'Note also that under hogging at the eaves haunch, the BOTTOM flange of the haunch is in compression and requires torsional fly-bracing from the purlins/side rails!',
            'Portal frame basics awareness.'
          ),
          qMcq(
            'MOD09-T3-Q5',
            9,
            'MOD09-T3',
            'Understand second-order (P-Δ) sway effects in frames',
            'What are "second-order (P-Δ) effects" in a multi-storey or portal steel frame subjected to combined vertical gravity loads P and horizontal wind sway Δ?',
            [
              'When the frame sways horizontally by Δ under lateral load, the heavy vertical gravity loads P acting on the displaced nodes create additional overturning moments (P × Δ) that cause further sway and amplify the internal moments and forces beyond first-order elastic analysis',
              'The effect of painting the steel with a second coat of paint',
              'Thermal contraction during the night',
              'A reduction in bending moment when axial compression is high',
            ],
            0,
            'When a frame is flexible in sway (e.g. α_cr = F_cr / F_Ed < 10 in EC3), second-order P-Δ amplification must be accounted for in the analysis.',
            'Module 9 second-order effects introductory awareness.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'PROJ-9.1',
        code: 'Project 9.1',
        title: 'Unrestrained beam',
        kind: 'worked_project',
        description:
          'Take your Module 8 beam and remove the continuous lateral restraint assumption. Identify: compression flange; unrestrained length; restraint points; why LTB may govern; what design/detailing alternatives could improve capacity.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 9.1 & Module 9 Assessment',
        selfReviewChecklist: [
          'Identify top flange in compression over L_LT = 5.0 m.',
          'Compare M_b,Rd = χ_LT M_pl,Rd against M_Ed.',
          'List practical alternatives: intermediate tie beams, wider UKC section, or closed RHS section.',
        ],
      },
      {
        id: 'PROJ-9.2',
        code: 'Project 9.2',
        title: 'Compression member',
        kind: 'worked_project',
        description:
          'Use a simple steel column under axial compression: select trial section; establish effective length; calculate slenderness; follow an EC3 column buckling check from a recognised example; explain why the result is lower than squash-load capacity.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 9.2 & Module 9 Assessment (Verify against controlled EC3)',
        selfReviewChecklist: [
          'Check BOTH major and minor axis effective lengths L_cr,y and L_cr,z.',
          'Compute λ_bar, select the correct buckling curve (a, b, c, d), and determine χ.',
          'Explain why initial bow imperfections and residual stresses reduce N_b,Rd below A·f_y.',
        ],
      },
      {
        id: 'PROJ-9.3',
        code: 'Project 9.3',
        title: 'Braced steel frame',
        kind: 'worked_project',
        description:
          'Analyse a simple braced frame: vertical load path; lateral load path; bracing force concept; column loads; beam/column idealisations; construction-stage stability.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 9.3 & Module 9 Assessment',
        selfReviewChecklist: [
          'Trace vertical gravity load path and horizontal wind load path through roof diaphragm and vertical bracing.',
          'Calculate brace tension, leeward column additional compression, and windward column uplift.',
          'State how the frame is kept stable during erection before all roof bracing is bolted.',
        ],
      },
    ],
    resources: [
      'SCI Steelwork Design Guide to EC3 & SCI P363.',
      'SteelConstruction.info (LTB, columns, connections, bracing).',
      'Current EN 1993-1-1 and EN 1993-1-8 + UK National Annexes.',
    ],
    standardsNotice:
      'Years 2–3 steel design module. All buckling reduction factors (χ, χ_LT) and section parameters in assessment questions are explicitly supplied; real design requires controlled copies of BS EN 1993-1-1, BS EN 1993-1-8, UK National Annexes, and SCI guides.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD09-E01',
        9,
        'MOD09-T1',
        'Calculate non-dimensional LTB slenderness λ_bar,LT',
        'A Class 1 steel beam has plastic moment capacity M_pl,y = W_pl,y · f_y = 300 kN·m and an elastic critical LTB moment M_cr = 192 kN·m. Calculate its non-dimensional LTB slenderness λ_bar,LT = √(M_pl,y / M_cr) (to 2 decimal places).',
        1.25,
        'ratio',
        'λ_bar,LT = √(300 / 192) = √1.5625 = 1.25.',
        'Non-dimensional LTB slenderness.'
      ),
      qNum(
        'MOD09-E02',
        9,
        'MOD09-T1',
        'Calculate LTB design resistance M_b,Rd',
        'If the beam in the previous question (M_pl,y = 300 kN·m) has an LTB reduction factor χ_LT = 0.48 and γ_M1 = 1.00, calculate its design LTB moment resistance M_b,Rd in kN·m.',
        144,
        'kN·m',
        'M_b,Rd = 0.48 × 300 / 1.00 = 144.0 kN·m.',
        'Compare against M_Ed to verify unrestrained bending safety.'
      ),
      qNum(
        'MOD09-E03',
        9,
        'MOD09-T2',
        'Calculate column non-dimensional slenderness λ_bar',
        'A steel column has squash capacity A·f_y = 1,800 kN and governing minor-axis Euler critical load N_cr,z = 2,000 kN. Calculate its non-dimensional slenderness λ_bar = √(A·f_y / N_cr,z) (to 2 decimal places).',
        0.95,
        'ratio',
        'λ_bar = √(1,800 / 2,000) = √0.90 = 0.9487 ≈ 0.95.',
        'At λ_bar = 0.95 (near λ_bar = 1.0), interaction between yielding, residual stresses, and elastic buckling is greatest.'
      ),
      qNum(
        'MOD09-E04',
        9,
        'MOD09-T2',
        'Calculate column design buckling resistance N_b,Rd',
        'For the column with A·f_y = 1,800 kN, if the applicable EC3 buckling curve gives χ = 0.58 and γ_M1 = 1.00, calculate the design buckling resistance N_b,Rd in kN.',
        1044,
        'kN',
        'N_b,Rd = 0.58 × 1,800 / 1.00 = 1,044 kN.',
        'EC3 Clause 6.3.1 compression check.'
      ),
      qNum(
        'MOD09-E05',
        9,
        'MOD09-T2',
        'Evaluate simplified combined axial compression and biaxial bending utilisation',
        'A column in simple construction is subjected to ULS axial force N_Ed = 500 kN (with N_b,z,Rd = 1,000 kN), major-axis nominal moment M_y,Ed = 30 kN·m (with M_b,Rd = 150 kN·m), and minor-axis nominal moment M_z,Ed = 10 kN·m (with M_c,z,Rd = 50 kN·m). Using the simplified interaction expression (N_Ed / N_b,z,Rd) + (M_y,Ed / M_b,Rd) + 1.5·(M_z,Ed / M_c,z,Rd), calculate the combined interaction value.',
        1,
        'ratio',
        '(500 / 1,000) + (30 / 150) + 1.5 × (10 / 50) = 0.50 + 0.20 + 0.30 = 1.00 (just at the limit of 1.00).',
        'Notice that even though axial utilisation alone is only 50%, adding the biaxial nominal moments brings the total interaction to 100%!'
      ),
      qNum(
        'MOD09-E06',
        9,
        'MOD09-T3',
        'Calculate design shear force per bolt in a concentric bolt group',
        'A double-angle cleat connection uses 6 identical M20 bolts to transfer a concentric vertical shear reaction of V_Ed = 270 kN. Assuming equal shear distribution among the bolts, what is the shear force F_v,Ed per bolt in kN?',
        45,
        'kN',
        'F_v,Ed = 270 kN / 6 = 45.0 kN per bolt.',
        'Valid when the line of action passes through the centroid of the bolt group; eccentric bolt groups also experience torsional shear forces!'
      ),
      qNum(
        'MOD09-E07',
        9,
        'MOD09-T3',
        'Calculate required length of fillet weld to resist an axial tie force',
        'A flat steel tie bar carrying a ULS tension force of N_Ed = 180 kN is welded to a gusset plate by longitudinal fillet welds that have a design resistance of f_vw,d × a = 1.25 kN per mm of weld length. Neglecting end returns, what total effective length of fillet weld L_w,req (in mm) is required?',
        144,
        'mm',
        'L_w,req = 180 kN / (1.25 kN/mm) = 144 mm (e.g. 72 mm effective length along each of the two edges of the flat bar).',
        'Weld capacity is proportional to throat thickness a × effective weld length L_w.'
      ),
      qNum(
        'MOD09-E08',
        9,
        'MOD09-T3',
        'Calculate average bearing pressure under a square column baseplate',
        'A steel column transfers a concentric ULS axial compression force of N_Ed = 1,225 kN through a 350 mm × 350 mm square steel baseplate onto concrete bedding grout. Assuming uniform bearing over the full baseplate area in a preliminary sizing check, what is the average compressive stress (in N/mm²) on the bedding?',
        10,
        'N/mm²',
        'Area = 350 × 350 = 122,500 mm². Stress = 1,225,000 N / 122,500 mm² = 10.0 N/mm².',
        'Note: in detailed EC3 baseplate design (effective area method), bearing is concentrated over an effective T-shaped strip around the column profile.'
      ),
      qNum(
        'MOD09-E09',
        9,
        'MOD09-T3',
        'Calculate horizontal wind shear per braced bay in a symmetric building (Project 9.3)',
        'A rectangular industrial building experiences a total ULS horizontal wind load of 160 kN perpendicular to its long elevation. The roof plan bracing acts as a rigid diaphragm transferring this load equally to 2 identical vertical cross-braced bays (one in each gable end wall). What horizontal wind shear force (in kN) must each gable braced bay resist?',
        80,
        'kN',
        '160 kN / 2 = 80.0 kN per braced gable wall.',
        'Project 9.3 lateral load path.'
      ),
      qNum(
        'MOD09-E10',
        9,
        'MOD09-T3',
        'Calculate axial compression in the leeward column of a braced bay (Project 9.3)',
        'One vertical braced bay of width B = 5.0 m and height H = 4.0 m carries a horizontal lateral load of H_Ed = 80 kN at roof level (and a tension-only diagonal brace running from bottom-left to top-right). In addition to its vertical roof gravity reaction of G_Ed = 90 kN, how much extra axial compression ΔN_wind (in kN) does the horizontal load induce in the leeward (right-hand) column? Enter the total leeward column compression (G_Ed + ΔN_wind) in kN.',
        154,
        'kN',
        'Overturning moment about windward base = 80 kN × 4.0 m = 320 kN·m. Extra compression in leeward column ΔN_wind = 320 / 5.0 = 64 kN (also equal to vertical component of diagonal tension). Total leeward column compression = 90 + 64 = 154 kN.',
        'Remember: horizontal wind on a braced bay increases compression in the leeward column and reduces compression (or causes uplift) in the windward column!'
      ),
      qMcq(
        'MOD09-E11',
        9,
        'MOD09-T2',
        'Explain why Universal Column (UKC) sections are preferred over Universal Beam (UB) sections for columns',
        'Compare a 254×254×73 UKC and a 457×152×74 UB, which have almost identical cross-sectional area and weight per metre. Why is the 254×254 UKC far superior as an unbraced compression column?',
        [
          'The wide-flange square-ish profile of the UKC gives it a minor-axis second moment of area I_z and radius of gyration i_z roughly double to triple that of the narrow-flanged UB, dramatically reducing minor-axis slenderness λ_z and increasing buckling resistance N_b,z,Rd',
          'The UKC is made of a steel with twice the Young’s modulus E',
          'Columns only buckle about their major axis',
          'The UB has zero cross-sectional area',
        ],
        0,
        'For unbraced columns, minor-axis buckling almost always governs; UKC sections have b ≈ h to maximise minor-axis radius of gyration i_z.',
        'Core section-selection judgement.'
      ),
      qMcq(
        'MOD09-E12',
        9,
        'MOD09-T3',
        'Understand prying action in bolted T-stub / end-plate tension connections',
        'When a flexible bolted end plate is pulled in tension (for example at the tension flange of a moment connection), what is "prying action"?',
        [
          'Bending deformation of the flexible end plate causes its outer edges to bear hard against the supporting column flange, acting like a crowbar lever that increases the tension force in the bolts beyond the externally applied tension',
          'A reduction in bolt tension to zero',
          'Pure shear failure of the column web',
          'Corrosion of the bolt threads',
        ],
        0,
        'Prying forces must either be accounted for in bolt tension capacity (EC3 T-stub model) or minimised by using a sufficiently thick end plate and placing bolts close to the tension flange/web.',
        'Module 9 connection behaviour.'
      ),
      qMcq(
        'MOD09-E13',
        9,
        'MOD09-T3',
        'Explain why every steel column needs at least 4 holding-down bolts for erection safety',
        'Even if a permanent-works analysis models a steel column base as a pure pin with compressive downward reaction only, why is a 4-bolt holding-down arrangement strongly preferred over a 2-bolt arrangement on site?',
        [
          'During construction erection, before beams and bracing are connected, the freestanding column must stand safely as a vertical cantilever under wind and crane release; 4 bolts in a square pattern provide two-way overturning stability during erection',
          'Because 2 bolts cannot resist vertical compression in grout',
          'Because Eurocode requires 40 bolts per column',
          'Because holding-down bolts increase the height of the roof',
        ],
        0,
        'Construction-stage stability of freestanding columns is a classic temporary/permanent works interface (Project 9.3).',
        'Practical site safety.'
      ),
      qMcq(
        'MOD09-E14',
        9,
        'MOD09-T3',
        'Understand how tension-only cross-bracing (X-bracing) works under reversible wind',
        'Many steel frames use slender flat-bar or rod X-bracing (two diagonals in the same bay) designed as a "tension-only" system. How does an X-braced bay resist wind blowing from the left vs wind blowing from the right?',
        [
          'Because slender rods/flats buckle harmlessly at negligible compressive load, whichever diagonal is put into tension carries 100% of the horizontal shear for that wind direction, while the compressed diagonal is ignored in the analysis',
          'Both slender diagonals carry equal compression without buckling',
          'X-bracing only works if wind blows from one direction',
          'The diagonals resist wind by bending about their minor axis',
        ],
        0,
        'In a tension-only braced bay, only the active tension diagonal is included in the stiffness/equilibrium model for a given load direction.',
        'Project 9.3 bracing force concept.'
      ),
      qMcq(
        'MOD09-E15',
        9,
        'MOD09-T1',
        'Recognise torsional and LTB hazard at cantilevered beam overhangs',
        'A steel roof beam is supported on two columns and cantilevers 2.5 m past the outer column to support a canopy. What is the most common restraint mistake made when checking the 2.5 m cantilever overhang for LTB?',
        [
          'Assuming the roof purlins on the top tension flange restrain the bottom compression flange, or assuming an effective length factor of 1.0 L instead of accounting for the unrestrained free tip and warping/twist conditions of a cantilever',
          'Assuming the top flange is in tension',
          'Checking the vertical reaction at the outer column',
          'Including the weight of the canopy',
        ],
        0,
        'In a gravity cantilever, the bottom flange is in compression and the free tip can twist and translate laterally unless specifically braced at the tip and bottom flange.',
        'Module 9 unrestrained beam judgement.'
      ),
      qMcq(
        'MOD09-E16',
        9,
        'MOD09-T3',
        'Understand bolt bearing vs bolt shear in thin-plate connections',
        'An M20 class 8.8 bolt connects two thin 5 mm S275 steel straps in single shear. Which failure mode is much more likely to govern the connection capacity: shear fracture of the 20 mm high-strength bolt shaft, or bearing crushing/tear-out of the 5 mm mild steel strap against the bolt?',
        [
          'Bearing crushing/tear-out of the thin 5 mm S275 plate against the bolt (which depends on plate thickness t, bolt diameter d, and edge/pitch distances e_1, p_1)',
          'Shear fracture of the 20 mm diameter high-strength bolt',
          'Euler buckling of the bolt head',
          'Both always have identical capacity regardless of plate thickness',
        ],
        0,
        'A bolted joint is a chain of links: connection resistance is the minimum of bolt shear resistance F_v,Rd and plate bearing resistance F_b,Rd.',
        'EC3 bolted connection fundamentals.'
      ),
      qNum(
        'MOD09-E17',
        9,
        'MOD09-T3',
        'Calculate maximum bolt force in an eccentrically loaded shear bolt group',
        'Two bolts are arranged vertically at a pitch spacing of p = 200 mm (so each bolt is r = 100 mm from the group centroid). The connection resists a vertical shear force V = 40 kN and an in-plane torsion moment T = 6.0 kN·m (= 6,000 kN·mm). The vertical shear per bolt is F_y = 40 / 2 = 20 kN, and the horizontal force per bolt from the moment couple is F_x = T / p = 6,000 / 200 = 30 kN. Calculate the resultant shear force √(F_x² + F_y²) on each bolt in kN (to 1 decimal place).',
        36.1,
        'kN',
        'Resultant bolt shear F_res = √(30² + 20²) = √(900 + 400) = √1,300 = 36.056 kN ≈ 36.1 kN.',
        'Vector combination of direct vertical shear and torsional moment shear in an eccentric bolt group.'
      ),
      qMcq(
        'MOD09-E18',
        9,
        'MOD09-T2',
        'Understand why column splices in multi-storey buildings are placed above floor level',
        'In multi-storey steel frames, why are column splices typically located 500 mm to 1,000 mm above the floor beam level rather than right at the beam-to-column floor junction?',
        [
          'To keep the splice clear of the congested beam-to-column connection zone, locate it away from maximum frame moments, and provide a convenient waist-height working position for steel erectors standing on the floor deck',
          'Because axial force is zero 600 mm above the floor',
          'Because steel columns cannot be cut in lengths over 1.0 m',
          'To maximise second-order sway',
        ],
        0,
        'Note: even when ends are machined for direct bearing in compression, EC3 requires column splices to be designed for nominal continuity bending and tying tension.',
        'Practical steelwork detailing and construction interface.'
      ),
      qMcq(
        'MOD09-E19',
        9,
        'MOD09-T3',
        'Identify how horizontal forces at the base of a portal frame or braced bay are resisted',
        'A portal frame column base or a vertical braced bay base exerts a substantial horizontal shear force H_Ed onto its pad foundation. How can this horizontal base reaction be safely resisted in the permanent structure?',
        [
          'By a horizontal steel/concrete tie beam cast into the floor slab connecting opposing column bases (especially in portal frames to resist outward eaves spread thrust), passive earth pressure on the side of the foundation/shear key, and/or base friction under minimum vertical load',
          'By assuming horizontal forces disappear once they reach the baseplate',
          'By using frictionless PTFE sliding bearings at both bases',
          'By ignoring ΣFx = 0 at foundation level',
        ],
        0,
        'Pitched-roof portal frames push outwards at the bases under gravity load; tying the bases together across the floor slab is standard UK practice to avoid large horizontal foundation thrusts.',
        'Connects Module 9 frames to Module 13 foundations.'
      ),
      qMcq(
        'MOD09-E20',
        9,
        'MOD09-T3',
        'Synthesise the Module 9 Learning Gate on global stability and connection assumptions',
        'When reviewing a 3D steel frame design, which four questions form the Module 9 Learning Gate check?',
        [
          '(1) Are unrestrained beams checked for LTB rather than just cross-section strength? (2) Are columns checked for flexural/torsional buckling and eccentric moments rather than just squash load? (3) Is there a complete, credible 3D lateral stability system (diaphragms + vertical bracing/moment frames) in both permanent and erection stages? (4) Do the physical connection details match the pinned or rigid stiffness assumptions of the analysis model?',
          'Only whether the steel is painted blue',
          'Only whether the bolts are M16 or M20',
          'Only whether the roof slope is 5° or 10°',
        ],
        0,
        'Summarises all four pillars of the Module 9 Learning Gate.',
        'Module 9 Gate synthesis.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 10: TIMBER DESIGN TO EC5                                          */
  /* ======================================================================== */
  {
    moduleNumber: 10,
    code: 'MOD-10',
    title: 'Module 10: Timber design to EC5',
    shortTitle: 'Timber design to EC5',
    suggestedDuration: '12–16 weeks',
    yearPathway: 'Years 2–3',
    year1Months: 'Years 2–3',
    whyItMatters:
      'Timber is heavily used in both UK residential/refurbishment permanent works (floor joists, rafters, lintels, engineered glulam/LVL) and site temporary works (soleboards, bearers, walings, hoardings), and behaves very differently from isotropic steel.',
    introduction:
      'Covers solid softwood/hardwood and engineered timber products (glulam, LVL, CLT), strength classes (e.g. C16, C24, GL24h), orthotropic grain direction dependence, moisture Service Classes (1, 2, and 3), load-duration classes and modification factor k_mod, design strength f_d = k_mod · f_k / γ_M, bending, shear, bearing perpendicular to grain, tension perpendicular to grain (splitting at notches and holes), lateral restraint, creep deformation factor k_def, connections, durability, and char-rate fire awareness.',
    objectives: [
      'Explain why timber is anisotropic and how moisture Service Class and load duration modify design strength via k_mod and long-term deflection via k_def.',
      'Design and check a simple timber floor joist or lintel for bending, shear, deflection, and bearing perpendicular to the grain (Projects 10.1 and 10.2).',
      'Identify why bottom-face notches near supports and holes/connections inducing tension perpendicular to the grain can trigger sudden brittle splitting.',
    ],
    learningGate: [
      'Explain physically why timber is not isotropic and how parallel vs perpendicular to grain properties differ.',
      'Explain why bearing compression perpendicular to the grain at supports matters and often governs.',
      'Explain why notches (especially on the tension side near supports) can critically reduce shear capacity.',
      'Explain why moisture content (Service Class) and load duration affect both design strength (k_mod) and long-term deflection (k_def).',
      'Set out the complete check sequence for a simple timber member.',
    ],
    prerequisiteModuleNumbers: [5, 7, 8],
    topics: [
      {
        id: 'MOD10-T1',
        moduleNumber: 10,
        code: '10.1',
        title: 'Timber Products, Grain Anisotropy, Service Classes & Load Duration (k_mod)',
        summary:
          'Covers solid timber (C16, C24) vs engineered timber (glulam, LVL, CLT), parallel vs perpendicular to grain properties, Service Classes 1, 2, and 3, load-duration classes, and calculating EC5 design strength f_d = k_mod · f_k / γ_M.',
        subtopics: [
          'Solid timber strength classes (C16, C24) and engineered wood (Glulam, LVL, CLT) homogenisation of defects',
          'Grain anisotropy: high strength/stiffness parallel to grain (0°) vs very low strength/stiffness perpendicular to grain (90°)',
          'Moisture Service Classes: SC1 (dry heated interior ≤12% MC), SC2 (covered unheated/humid ≤20% MC), SC3 (exposed external >20% MC)',
          'Load-duration classes: permanent (>10 yrs), long-term, medium-term, short-term, instantaneous',
          'EC5 design strength formula: f_d = k_mod · (f_k / γ_M) and system strength factor k_sys for load-sharing joists',
        ],
        learningObjectives: [
          'Calculate EC5 design strength f_d from supplied f_k, k_mod, k_sys, and γ_M.',
          'Select the correct Service Class and explain why short-term loads have a higher k_mod than permanent loads.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Guide to C16 vs C24 grading, defect dispersion in Glulam/LVL, and CLT cross-lamination.',
          workedExamplesPlanned: 'Establishing design material properties for a domestic floor joist vs an external hoarding post.',
          calculationsPlanned: 'Determining governing load-duration class in combined G + Q combinations.',
          sourceReferencesNeeded: 'BS EN 1995-1-1 (EC5), UK National Annex, TRADA, and Wood Campus guides.',
        },
        questions: [
          qNum(
            'MOD10-T1-Q1',
            10,
            'MOD10-T1',
            'Calculate EC5 design bending strength f_m,d using k_mod and γ_M',
            'A C24 solid timber joist has a characteristic bending strength f_m,k = 24.0 N/mm². For Service Class 1 under a medium-term governing load combination, the supplied modification factor is k_mod = 0.80 and the partial material factor is γ_M = 1.30 (with k_sys = 1.0). Calculate the design bending strength f_m,d = k_mod · f_m,k / γ_M in N/mm² (to 2 decimal places).',
            14.77,
            'N/mm²',
            'f_m,d = (0.80 × 24.0) / 1.30 = 19.2 / 1.30 = 14.769 N/mm² ≈ 14.77 N/mm².',
            'Notice how k_mod and γ_M reduce the 24.0 N/mm² characteristic value to 14.77 N/mm² for design.'
          ),
          qNum(
            'MOD10-T1-Q2',
            10,
            'MOD10-T1',
            'Apply load-sharing system factor k_sys = 1.1 to closely spaced floor joists',
            'When parallel timber floor joists spaced at ≤ 600 mm centres are connected by a continuous floor deck capable of redistributing load horizontally, BS EN 1995-1-1 allows a system strength factor k_sys = 1.10. Using f_m,d,base = 14.77 N/mm², calculate the enhanced design bending strength k_sys · f_m,d,base in N/mm² (to 2 decimal places).',
            16.25,
            'N/mm²',
            '1.10 × 14.769 = 16.246 N/mm² ≈ 16.25 N/mm².',
            'Because natural knots/defects are randomly distributed between joists, a stiff deck shares load away from any single weaker joist.'
          ),
          qMcq(
            'MOD10-T1-Q3',
            10,
            'MOD10-T1',
            'Explain why load duration and moisture affect timber design strength (Module 10 Gate)',
            'Why does BS EN 1995-1-1 assign a smaller strength modification factor k_mod to permanent loads (e.g. k_mod = 0.60 in SC1) than to instantaneous wind gusts (e.g. k_mod = 1.10 in SC1), and smaller k_mod values in wet Service Class 3 than in dry Service Class 1?',
            [
              'Timber exhibits viscoelastic creep-rupture (duration-of-load effect) where sustained stress over years causes microscopic cell-wall damage accumulation at lower stress than a brief gust, and higher moisture content weakens hydrogen bonding between cellulose polymer chains',
              'Because gravity is stronger on dry timber',
              'Because wind loads last for 50 years continuously',
              'Because k_mod only applies to steel bolts',
            ],
            0,
            'Note: when a load combination contains actions of different durations (e.g. Permanent G + Medium-term Q), k_mod is chosen corresponding to the action with the shortest duration in that combination!',
            'Core Module 10 Gate requirement.'
          ),
          qMcq(
            'MOD10-T1-Q4',
            10,
            'MOD10-T1',
            'Identify which action governs k_mod in a combined load case',
            'In EC5, when checking ULS Combination 1 (1.35 G_k alone, permanent duration, k_mod = 0.60) versus ULS Combination 2 (1.35 G_k + 1.50 Q_k, where Q_k is medium-term imposed floor load with k_mod = 0.80), why must you check BOTH combinations rather than only Combination 2?',
            [
              'Because although Combination 1 (permanent load only) has a smaller design load, it also has a smaller k_mod (0.60 vs 0.80, reducing timber strength by 25%); in heavy dead-load structures (like green roofs or heavy masonry supports), permanent load alone with k_mod = 0.60 can govern over G + Q with k_mod = 0.80!',
              'Because 1.35 G_k is always numerically larger than 1.35 G_k + 1.50 Q_k',
              'Because k_mod is always 1.0 for permanent loads',
              'Because EC5 prohibits imposed loads on timber',
            ],
            0,
            'Classic EC5 subtlety: utilisation is E_d / R_d(k_mod), so a lower load divided by a lower k_mod can give a higher utilisation ratio!',
            'Important timber design check habit.'
          ),
          qMcq(
            'MOD10-T1-Q5',
            10,
            'MOD10-T1',
            'Compare engineered timber (Glulam / LVL) with solid sawn timber',
            'Why do glued laminated timber (Glulam) and Laminated Veneer Lumber (LVL) achieve higher and more consistent characteristic strengths and larger member sizes than single pieces of solid sawn softwood?',
            [
              'Laminating dried timber boards or thin veneers disperses natural knots and grain defects so no single defect runs across the whole cross-section, and reduces splitting/warping from seasoning shrinkage',
              'Because Glulam is made of solid steel',
              'Because LVL has isotropic grain in all three directions like glass',
              'Because glue eliminates self-weight',
            ],
            0,
            'Defect dispersion and controlled kiln drying prior to lamination reduce statistical variability and enable long-span beams.',
            'Module 10 introductory behaviour of glulam, LVL, and CLT.'
          ),
        ],
      },
      {
        id: 'MOD10-T2',
        moduleNumber: 10,
        code: '10.2',
        title: 'Bending, Shear (3V/2A), Bearing Perpendicular to Grain & Notches (Project 10.1)',
        summary:
          'Covers rectangular timber bending stress σ_m,d = M_d/Z, parabolic rectangular shear stress distribution τ_d = 1.5 V_d / (b·h_eff), compression perpendicular to grain σ_c,90,d at bearings, and why notches on the tension edge near supports cause severe splitting (Project 10.1).',
        subtopics: [
          'Bending check: σ_m,d = M_d / W_el ≤ f_m,d (timber uses elastic section modulus bd²/6, never plastic modulus, because tension failure in timber is brittle!)',
          'Rectangular shear stress formula: τ_max = 1.5 V_d / (b·h) = 3V_d / (2A) at the neutral axis (50% higher than average V/A!)',
          'Compression perpendicular to the grain at supports and under temporary works prop/soleboard bearings',
          'Notches and holes near supports: why a bottom (tension-side) notch creates severe tension perpendicular to grain splitting (reduced by factor k_v < 1.0)',
        ],
        learningObjectives: [
          'Calculate peak rectangular shear stress τ = 1.5 V / (bd) and bearing stress σ_c,90,d (Project 10.1).',
          'Explain why timber beams use elastic modulus Z = bd²/6 and why notches at supports are critical.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Derivation of parabolic shear distribution τ(y) = (3V/2A)(1 - (2y/d)²) and notch factor k_v.',
          workedExamplesPlanned: 'Project 10.1 complete timber floor joist design.',
          calculationsPlanned: 'Checking a timber soleboard under a steel prop baseplate for compression perpendicular to grain.',
          sourceReferencesNeeded: 'BS EN 1995-1-1, UK National Annex, and TRADA guidance.',
        },
        questions: [
          qNum(
            'MOD10-T2-Q1',
            10,
            'MOD10-T2',
            'Calculate peak shear stress τ_d = 1.5 V_d / (b·d) in a rectangular timber joist',
            'A rectangular timber floor joist of breadth b = 50 mm and depth d = 200 mm (area A = 10,000 mm²) resists a ULS support shear force of V_d = 12.0 kN (12,000 N). Calculate the maximum longitudinal/vertical shear stress τ_d = 1.5 × V_d / (b × d) at the neutral axis in N/mm².',
            1.8,
            'N/mm²',
            'Average shear V/A = 12,000 / 10,000 = 1.20 N/mm². For a rectangular cross-section, peak parabolic shear stress at mid-depth is 1.5 × (V/A) = 1.5 × 1.20 = 1.80 N/mm².',
            'Never forget the 1.5 factor (3V / 2A) for shear in a rectangular section! (Note: EC5 also applies a crack factor k_cr to effective width b_ef).'
          ),
          qNum(
            'MOD10-T2-Q2',
            10,
            'MOD10-T2',
            'Calculate bearing stress perpendicular to the grain σ_c,90,d',
            'The same 50 mm wide timber joist transfers its ULS reaction F_c,90,d = 12.0 kN onto a timber wall plate providing an effective contact length parallel to the grain of l_eff = 90 mm. Calculate the compressive bearing stress perpendicular to the grain σ_c,90,d = F_c,90,d / (b × l_eff) in N/mm² (to 2 decimal places).',
            2.67,
            'N/mm²',
            'Contact area = 50 mm × 90 mm = 4,500 mm². σ_c,90,d = 12,000 N / 4,500 mm² = 2.667 N/mm² ≈ 2.67 N/mm².',
            'Characteristic compression strength perpendicular to grain f_c,90,k for C24 softwood is only ~2.5 N/mm², showing how easily bearing perpendicular to grain governs!'
          ),
          qMcq(
            'MOD10-T2-Q3',
            10,
            'MOD10-T2',
            'Explain why notches near supports are critical in timber beams (Module 10 Gate)',
            'A plumber or carpenter cuts a rectangular notch out of the bottom edge of a timber joist right at the support to sit it over a steel flange (or run a pipe). Why is a bottom-edge notch at a support much more dangerous than simply using the reduced depth d_eff in a standard shear check?',
            [
              'At the sharp re-entrant corner of a bottom-face notch, the sudden change in cross-section forces the tensile fibre stresses and shear flow to deviate, inducing high tensile stresses PERPENDICULAR to the grain (where timber has almost zero strength, f_t,90,k ≈ 0.4 N/mm²), causing a horizontal split to zip along the grain from the notch corner',
              'Because notches increase the self-weight of the joist',
              'Because shear force is zero near the support',
              'Because timber is strongest in tension perpendicular to the grain',
            ],
            0,
            'EC5 accounts for this mode-I splitting fracture by applying a severe notch reduction factor k_v < 1.0 to the shear strength of the remaining depth h_ef.',
            'Direct Module 10 Gate requirement.'
          ),
          qMcq(
            'MOD10-T2-Q4',
            10,
            'MOD10-T2',
            'Explain why timber bending design uses elastic modulus Z_el = bd²/6 rather than plastic modulus W_pl = bd²/4',
            'In Module 8 we used the plastic section modulus W_pl for Class 1 steel beams. Why does timber design (EC5) use the elastic section modulus W_el = bd²/6 for rectangular timber beams?',
            [
              'Because timber fails in a brittle manner in extreme-fibre tension without a long ductile tension yield plateau, so full rectangular plastic stress blocks cannot develop reliably across the tension zone',
              'Because timber has a shape factor of 0.5',
              'Because W_el is larger than W_pl',
              'Because timber cannot bend',
            ],
            0,
            'Full plastic hinge theory requires ductile yielding in both tension and compression; timber tension rupture is sudden and brittle.',
            'Connects Module 3/4 material & section theory to Module 10.'
          ),
          qMcq(
            'MOD10-T2-Q5',
            10,
            'MOD10-T2',
            'Identify the safest zone for small service holes in a uniformly loaded timber joist',
            'If a small circular hole for an electrical cable must be drilled through a simply supported timber floor joist carrying a UDL, where in the joist is the least damaging location, and where should holes NEVER be drilled?',
            [
              'Least damaging: on the neutral axis (mid-depth) in the middle third of the span (where shear V is low and bending stress at mid-depth is zero); NEVER drill near the top/bottom extreme edges (where bending stress is peak) or close to the supports without a specific check (where shear V is peak)',
              'Drill right through the bottom tension edge at midspan',
              'Drill a large square cut-out right at the support bearing',
              'Location makes no difference in timber',
            ],
            0,
            'Following industry guidance (e.g. TRADA / NHBC), small holes are restricted to the neutral axis zone within 0.25L to 0.4L from supports where both mid-depth bending stress and shear are moderate.',
            'Practical refurbishment and site alteration knowledge.'
          ),
        ],
      },
      {
        id: 'MOD10-T3',
        moduleNumber: 10,
        code: '10.3',
        title: 'Deflection with Creep (k_def), Lateral Restraint, Connections & Fire/Durability (Project 10.2)',
        summary:
          'Covers instantaneous and final long-term timber deflection δ_fin = δ_inst(1 + k_def), lateral torsional stability of slender joists (herringbone/solid strutting), mechanical dowel-type connections (splitting, edge/end distances), moisture decay/durability, and predictable charring rate in fire (Project 10.2).',
        subtopics: [
          'Instantaneous deflection δ_inst (using E_0,mean) and final creep deflection δ_fin = δ_inst × (1 + k_def)',
          'Lateral restraint of deep joists: floorboards/decking on compression edge and intermediate herringbone/solid block strutting',
          'Timber connections: nails, screws, bolts, dowels; why minimum end/edge distances and spacing prevent brittle splitting along the grain',
          'Moisture, fungal decay (wet/dry rot above ~20% moisture content), and preservative treatment / ventilation detailing',
          'Fire behaviour of heavy timber: predictable charring rate (≈ 0.65–0.8 mm/min) leaving a cool residual structural core',
        ],
        learningObjectives: [
          'Calculate final long-term deflection of a timber beam using k_def (Projects 10.1 and 10.2).',
          'Explain why connection edge/end distances, ventilation against rot, and residual section charring govern practical timber engineering.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Johansen yield theory for dowel connections and reduced cross-section method in fire.',
          workedExamplesPlanned: 'Project 10.2 timber lintel/beam assessment over an opening.',
          calculationsPlanned: 'Combined permanent and variable long-term deflection with k_def and ψ_2.',
          sourceReferencesNeeded: 'BS EN 1995-1-1, BS EN 1995-1-2 (Fire), and TRADA guides.',
        },
        questions: [
          qNum(
            'MOD10-T3-Q1',
            10,
            'MOD10-T3',
            'Calculate final long-term permanent deflection δ_fin,G using k_def',
            'A solid timber beam in Service Class 2 (covered unheated roof/canopy) has an instantaneous deflection under permanent dead load of δ_inst,G = 5.0 mm. Given a supplied EC5 deformation creep factor of k_def = 0.80 for Service Class 2, calculate the final long-term dead-load deflection δ_fin,G = δ_inst,G × (1 + k_def) in mm.',
            9,
            'mm',
            'δ_fin,G = 5.0 mm × (1 + 0.80) = 5.0 × 1.80 = 9.0 mm.',
            'In wet Service Class 3, k_def rises to 2.00 (tripling permanent-load deflection!).'
          ),
          qMcq(
            'MOD10-T3-Q2',
            10,
            'MOD10-T3',
            'Explain why minimum bolt/screw end and edge distances are much larger in timber than in steel',
            'In a bolted timber connection loaded parallel to the grain, why does EC5 require a large minimum end distance (typically ≥ 7d or 80 mm) and pre-drilled holes compared to ~1.5d in steel?',
            [
              'Because the bolt acts like a wedge pushing against the wood fibres; if placed too close to the end of the member, the low shear and perpendicular-to-grain tensile strength of timber allows a brittle plug or split to shear out ahead of the bolt before ductile dowel bearing develops',
              'Because timber bolts are made of rubber',
              'Because timber has higher shear strength than steel',
              'To increase the weight of the joint',
            ],
            0,
            'Preventing premature brittle row shear-out or splitting is essential so the connection fails ductilely by dowel embedding and bolt bending.',
            'Module 10 timber connections.'
          ),
          qMcq(
            'MOD10-T3-Q3',
            10,
            'MOD10-T3',
            'Understand fungal decay risk at embedded timber joist/lintel ends (Project 10.2)',
            'When inspecting an existing Victorian building or detailing a timber joist built into an external solid masonry wall (Project 10.2), why are the embedded bearing ends of the timber joists the most common point of structural failure?',
            [
              'Dampness penetrating the external masonry keeps the embedded timber end above ~20% moisture content without ventilation, creating ideal conditions for fungal decay (wet or dry rot) that destroys the bearing capacity and shear strength right where V_Ed is maximum',
              'Because bending moment is maximum at a simple support',
              'Because fungal decay only attacks dry timber at midspan',
              'Because brickwork cools the timber below 0°C',
            ],
            0,
            'Keeping timber dry (below ~20% moisture content) by DPC wrapping, joist hangers, or ventilated air gaps is the primary defence against fungal rot.',
            'Links Module 10 to Module 11 and Module 18.'
          ),
          qMcq(
            'MOD10-T3-Q4',
            10,
            'MOD10-T3',
            'Understand how heavy timber resists fire (charring concept)',
            'Unlike unprotected thin steel which heats rapidly throughout its cross-section in a fire, how does a large-section glulam or solid timber beam resist fire exposure?',
            [
              'The outer surface chars at a slow, predictable rate (roughly 0.65 to 0.8 mm per minute), and the insulating charcoal layer protects the inner uncharred core, which retains most of its ambient strength and stiffness as a reduced residual cross-section',
              'Timber never burns or chars at any temperature',
              'Timber increases its cross-sectional area during a fire',
              'Timber conducts heat 100 times faster than steel',
            ],
            0,
            'Note, however, that any exposed steel connector plates/bolts in timber joints will conduct heat into the wood unless recessed and plugged or fire-protected!',
            'Module 10 fire introductory awareness.'
          ),
          qMcq(
            'MOD10-T3-Q5',
            10,
            'MOD10-T3',
            'Understand the role of solid blocking / herringbone strutting between floor joists',
            'Why are rows of solid timber blocking or herringbone strutting installed at midspan (and at supports) between deep narrow timber floor joists?',
            [
              'They prevent the deep narrow joists from twisting/rolling over (lateral torsional buckling), help distribute concentrated point loads across adjacent joists, and stiffen the floor against twisting vibration',
              'They eliminate the vertical reactions at the end walls',
              'They increase the span of the room',
              'They replace the floorboards',
            ],
            0,
            'Deep narrow joists (e.g. 47 × 220 mm) have high depth-to-breadth ratios (d/b ≈ 4.7) and rely on top decking plus rotational strutting at supports and midspan.',
            'Project 10.1 lateral restraint.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'PROJ-10.1',
        code: 'Project 10.1',
        title: 'Timber floor joist',
        kind: 'worked_project',
        description:
          'Design a simple floor joist: tributary width; permanent/imposed loading; bending; shear; deflection; bearing; notches and holes; restraint; service class/load duration.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topics 10.1–10.3 & Module 10 Assessment (Verify against controlled EC5)',
        selfReviewChecklist: [
          'Establish joist spacing (tributary width), Service Class, load duration, k_mod, k_sys, and k_def.',
          'Check bending σ_m,d ≤ f_m,d, shear τ_d = 1.5V/(b_ef·d) ≤ f_v,d, bearing σ_c,90,d ≤ k_c,90·f_c,90,d, and final deflection δ_fin.',
          'State rules for notches, service holes, and support/midspan lateral restraint.',
        ],
      },
      {
        id: 'PROJ-10.2',
        code: 'Project 10.2',
        title: 'Timber lintel/beam',
        kind: 'worked_project',
        description:
          'Assess a timber beam over an opening: load path; bearings; deflection; wall interaction; temporary support considerations.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topic 10.3 & Module 10 Assessment',
        selfReviewChecklist: [
          'Trace wall/floor load path onto the lintel and check bearing lengths and moisture/rot condition at embedded ends.',
          'Check strict deflection limit under masonry and plan temporary propping before any repair/replacement.',
        ],
      },
    ],
    resources: [
      'TRADA.',
      'Wood Campus.',
      'Current EC5 (BS EN 1995-1-1) and UK National Annex.',
    ],
    standardsNotice:
      'Years 2–3 timber module. All k_mod, k_def, k_cr, and material properties in assessment questions are explicitly supplied in each prompt. Always consult controlled copies of BS EN 1995-1-1 and the UK National Annex for practice.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD10-E01',
        10,
        'MOD10-T1',
        'Calculate ULS line load on a timber floor joist at 400 mm centres (Project 10.1)',
        'Timber floor joists span L = 4.0 m and are spaced at s = 400 mm (0.40 m) centres. If the floor has characteristic permanent load g_k = 0.85 kN/m² (including joist self-weight) and imposed load q_k = 1.50 kN/m², calculate the ULS design line load w_d on one joist using γ_G = 1.35 and γ_Q = 1.50, in kN/m (to 3 decimal places).',
        1.359,
        'kN/m',
        'Factored surface load = (1.35 × 0.85) + (1.50 × 1.50) = 1.1475 + 2.250 = 3.3975 kN/m². Multiplying by tributary spacing 0.40 m gives w_d = 3.3975 × 0.40 = 1.359 kN/m.',
        'Project 10.1 loading takedown.'
      ),
      qNum(
        'MOD10-E02',
        10,
        'MOD10-T2',
        'Calculate ULS bending moment M_d on the 4.0 m floor joist',
        'For the 4.0 m simply supported floor joist carrying w_d = 1.359 kN/m, calculate the maximum ULS design bending moment M_d = w_d · L² / 8 in kN·m (to 2 decimal places).',
        2.72,
        'kN·m',
        'M_d = (1.359 × 4.0²) / 8 = 21.744 / 8 = 2.718 kN·m ≈ 2.72 kN·m.',
        'Midspan design bending moment.'
      ),
      qNum(
        'MOD10-E03',
        10,
        'MOD10-T2',
        'Calculate extreme-fibre bending stress σ_m,d in a 47 × 195 mm C24 joist',
        'A regularised C24 timber joist has breadth b = 47 mm and depth d = 195 mm (so elastic section modulus W_el = b·d²/6 = 47 × 195² / 6 = 297,862.5 mm³). Under M_d = 2.718 kN·m, calculate the design bending stress σ_m,d = M_d / W_el in N/mm² (to 2 decimal places).',
        9.12,
        'N/mm²',
        'σ_m,d = (2.718 × 10⁶ N·mm) / 297,862.5 mm³ = 9.125 N/mm² ≈ 9.12 N/mm².',
        'With f_m,d = 1.1 × 0.8 × 24 / 1.3 = 16.25 N/mm², bending utilisation is 9.12 / 16.25 = 0.56 (passes).'
      ),
      qNum(
        'MOD10-E04',
        10,
        'MOD10-T2',
        'Calculate design shear stress τ_d in a timber joist using effective crack width factor k_cr',
        'EC5 reduces the effective shear width of solid timber by a crack factor k_cr = 0.67 (so b_ef = k_cr × b) to account for longitudinal seasoning fissures. For a joist of breadth b = 47 mm (so b_ef = 0.67 × 47 = 31.49 mm) and depth d = 195 mm under a ULS shear force V_d = 2.72 kN (2,720 N), calculate the design shear stress τ_d = 1.5 V_d / (b_ef × d) in N/mm² (to 2 decimal places).',
        0.66,
        'N/mm²',
        'τ_d = (1.5 × 2,720 N) / (31.49 mm × 195 mm) = 4,080 / 6,140.55 = 0.664 N/mm² ≈ 0.66 N/mm².',
        'Shows how the EC5 crack factor k_cr = 0.67 modifies the effective breadth in shear.'
      ),
      qNum(
        'MOD10-E05',
        10,
        'MOD10-T1',
        'Compare permanent-only vs medium-term utilisation ratio in EC5',
        'A heavy timber beam supporting a green roof has ULS bending stress σ_m,d = 8.4 N/mm² under Permanent load alone (where k_mod = 0.60 gives f_m,d = 11.08 N/mm²) and σ_m,d = 10.5 N/mm² under Permanent + Medium-term snow load (where k_mod = 0.80 gives f_m,d = 14.77 N/mm²). Calculate the utilisation ratio (σ_m,d / f_m,d) for the Permanent-only case (to 2 decimal places).',
        0.76,
        'ratio',
        'Permanent-only utilisation = 8.4 / 11.08 = 0.758 ≈ 0.76, which is HIGHER than the combined snow case utilisation of 10.5 / 14.77 = 0.711! Thus the permanent-only case governs.',
        'Proves numerically why the permanent load case with k_mod = 0.60 can govern over a larger combined load with k_mod = 0.80.'
      ),
      qNum(
        'MOD10-E06',
        10,
        'MOD10-T2',
        'Calculate bearing stress under a steel prop on a timber soleboard (Temporary Works)',
        'A temporary works prop baseplate of dimensions 150 mm × 150 mm transfers a ULS vertical force of 54 kN onto a C24 timber soleboard (loading the timber perpendicular to the grain). Neglecting effective length extensions, calculate the direct contact bearing stress σ_c,90,d under the 150 × 150 mm baseplate in N/mm².',
        2.4,
        'N/mm²',
        'Area = 150 × 150 = 22,500 mm². σ_c,90,d = 54,000 N / 22,500 mm² = 2.40 N/mm².',
        'In temporary works, timber soleboards and bearers under steel props/beams are frequently governed by compression perpendicular to the grain!'
      ),
      qNum(
        'MOD10-E07',
        10,
        'MOD10-T3',
        'Calculate final creep deflection δ_fin under combined permanent and variable loads',
        'In EC5, the final deflection under permanent action G is δ_fin,G = δ_inst,G × (1 + k_def) and under variable action Q is δ_fin,Q = δ_inst,Q × (1 + ψ_2 · k_def). Given δ_inst,G = 4.0 mm, δ_inst,Q = 6.0 mm, k_def = 0.60 (Service Class 1), and ψ_2 = 0.30, calculate the total final deflection δ_fin = δ_fin,G + δ_fin,Q in mm (to 2 decimal places).',
        13.48,
        'mm',
        'δ_fin,G = 4.0 × (1 + 0.60) = 6.40 mm. δ_fin,Q = 6.0 × (1 + 0.30 × 0.60) = 6.0 × 1.18 = 7.08 mm. Total δ_fin = 6.40 + 7.08 = 13.48 mm.',
        'Complete EC5 final deflection formula.'
      ),
      qNum(
        'MOD10-E08',
        10,
        'MOD10-T3',
        'Calculate residual width of a timber beam after 30 minutes of fire charring',
        'A glulam beam of initial width b = 140 mm is exposed to fire on its two vertical sides (and underside) for t = 30 minutes. Using a supplied notional charring rate of β_n = 0.70 mm/min on each exposed face, what residual uncharred width b_fi (in mm) remains after 30 minutes?',
        98,
        'mm',
        'Char depth on each side d_char = 0.70 mm/min × 30 min = 21.0 mm. Since both left and right sides are exposed, b_fi = 140 − (2 × 21.0) = 140 − 42 = 98 mm.',
        'Illustrates the EC5 Part 1-2 reduced cross-section concept.'
      ),
      qNum(
        'MOD10-E09',
        10,
        'MOD10-T2',
        'Calculate reduced shear capacity of a notched timber beam using k_v',
        'A 50 mm wide timber beam of overall depth 200 mm has a 50 mm deep bottom-face notch at its support, leaving an effective depth h_ef = 150 mm. If the design shear strength is f_v,d = 2.0 N/mm², k_cr = 0.67 (so b_ef = 33.5 mm), and the EC5 notch reduction factor is calculated as k_v = 0.45, calculate the maximum allowable design shear force V_Rd = (2/3) · b_ef · h_ef · k_v · f_v,d in kN (to 2 decimal places).',
        3.02,
        'kN',
        'V_Rd = (2/3) × 33.5 × 150 × 0.45 × 2.0 = 3,015 N ≈ 3.02 kN (compared to 8.93 kN un-notched—a 66% loss of shear capacity from a 25% notch!).',
        'Demonstrates why bottom-face notches at supports are so destructive to timber shear capacity.'
      ),
      qNum(
        'MOD10-E10',
        10,
        'MOD10-T1',
        'Compare parallel vs perpendicular to grain compressive strength ratio in C24 softwood',
        'For C24 softwood, the characteristic compressive strength parallel to the grain is f_c,0,k = 21.0 N/mm², while the characteristic compressive strength perpendicular to the grain is f_c,90,k = 2.5 N/mm². Calculate the ratio f_c,0,k / f_c,90,k.',
        8.4,
        'ratio',
        '21.0 / 2.5 = 8.40.',
        'Compressive strength parallel to the wood fibres is more than 8 times the strength perpendicular to the fibres.'
      ),
      qMcq(
        'MOD10-T1-Q11-EXAM',
        10,
        'MOD10-T1',
        'Select the appropriate EC5 Service Class for different structural environments',
        'How should (a) a heated internal bedroom floor joist, (b) a covered unheated open-sided agricultural barn roof truss, and (c) an external uncovered timber footbridge or site hoarding post be classified in BS EN 1995-1-1?',
        [
          '(a) Service Class 1, (b) Service Class 2, and (c) Service Class 3',
          'All three are Service Class 1',
          '(a) Service Class 3, (b) Service Class 2, and (c) Service Class 1',
          'Service Classes depend on span length rather than temperature and humidity',
        ],
        0,
        'Service Class 1 = dry heated interior; Service Class 2 = covered/protected but unheated ambient humidity; Service Class 3 = exposed to weather/high moisture.',
        'Correct Service Class selection sets both k_mod and k_def.'
      ),
      qMcq(
        'MOD10-E12',
        10,
        'MOD10-T2',
        'Understand how tapered/bevelled notches reduce splitting stress concentration',
        'If a small bottom-face notch at a timber beam support cannot be avoided, how can its detailing be improved to reduce the tension-perpendicular-to-grain splitting concentration?',
        [
              'Taper (chamfer) the notch gradually with a gentle slope (e.g. 1:3 to 1:5) instead of cutting a sharp 90° vertical step, or reinforce the notch zone with fully threaded screws installed perpendicular to the grain',
              'Cut the notch twice as deep with a sharp square saw cut',
              'Drill a large hole right above the notch corner',
              'Soak the notch in water',
            ],
        0,
        'EC5 gives a higher (less penalising) notch factor k_v when the notch is tapered smoothly, or fully threaded screws can carry the perpendicular tensile splitting force.',
        'Practical timber detailing solution.'
      ),
      qMcq(
        'MOD10-E13',
        10,
        'MOD10-T3',
        'Recognise tension-perpendicular-to-grain splitting risk at low-slung connections',
        'A heavy secondary beam is hung from the side of a primary glulam beam using a bolted bracket attached near the BOTTOM (tension) edge of the primary glulam beam rather than near the top edge. What brittle failure mode can occur in the primary glulam beam?',
        [
          'The downward load hanging from the bottom part of the web pulls the lower fibres downwards away from the upper fibres, inducing tension perpendicular to the grain and splitting the glulam beam horizontally along the bolt line',
          'The top edge of the glulam beam melts',
          'The bolts fail in compression',
          'Hanging loads near the bottom edge increases the splitting capacity by 500%',
        ],
        0,
        'Connections delivering downward loads into the side of a timber beam should be positioned near the top zone (or use full-depth hangers/reinforcing screws) to avoid pulling the timber apart perpendicular to the grain.',
        'Crucial EC5 connection detailing rule.'
      ),
      qMcq(
        'MOD10-E14',
        10,
        'MOD10-T1',
        'Understand why Cross-Laminated Timber (CLT) panels work as two-way slabs and shear walls',
        'How is Cross-Laminated Timber (CLT) constructed, and how does its layup affect its structural behaviour?',
        [
          'CLT is formed from stacked layers of timber boards glued at 90° to each other in alternating layers (like giant plywood); the orthogonal layers provide two-way bending capability, high in-plane shear wall stiffness, and dimensional stability against moisture movement in the panel plane',
          'All boards in CLT run in the exact same direction like glulam',
          'CLT is made of chipped sawdust with no directional fibres',
          'Layers oriented perpendicular to the span carry 100% of the longitudinal bending stress',
        ],
        0,
        'Note that in out-of-plane bending of CLT, rolling shear in the cross-layers (shear perpendicular to the grain of the transverse boards) is often a governing check!',
        'Module 10 CLT introductory awareness.'
      ),
      qMcq(
        'MOD10-E15',
        10,
        'MOD10-T3',
        'Distinguish E_0,mean and E_0,05 in EC5 serviceability vs stability checks',
        'BS EN 1995-1-1 tabulates two values of Young’s modulus parallel to the grain for each timber strength class: the mean modulus E_0,mean and the 5th-percentile modulus E_0,05. Where is each value typically used?',
        [
          'E_0,mean is used for standard Serviceability Limit State (SLS) deflection calculations, while the cautious lower-bound E_0,05 is used for Ultimate Limit State (ULS) buckling and stability calculations (column buckling and LTB)',
          'E_0,05 is used for paint thickness and E_0,mean is never used',
          'E_0,05 is numerically larger than E_0,mean',
          'Both values are equal to 210,000 N/mm²',
        ],
        0,
        'Because buckling is a ULS safety collapse mode, EC5 uses the 5th-percentile stiffness E_0,05 to compute critical buckling stresses, whereas average floor deflection uses E_0,mean.',
        'Important EC5 distinction.'
      ),
      qMcq(
        'MOD10-E16',
        10,
        'MOD10-T3',
        'Assess temporary support considerations when replacing a decayed timber lintel (Project 10.2)',
        'In Project 10.2, an existing timber lintel over a ground-floor window in a load-bearing brick wall has rotted at its bearings and must be replaced. What must be considered before removing the old timber lintel?',
        [
          'Trace all floor joists and masonry loads resting on the wall above the lintel; install temporary propping (such as Acrow props with soleboards supporting floor joists and/or needle beams supporting the brickwork above) before cutting out the old lintel so the masonry does not drop or collapse',
          'Knock the timber lintel out with a sledgehammer first and prop the wall the next day',
          'Assume old brickwork floats in mid-air without support',
          'Only prop the window glass',
        ],
        0,
        'Project 10.2 explicitly highlights load path, bearings, wall interaction, and temporary support considerations.',
        'Temporary works sequencing in alterations.'
      ),
      qNum(
        'MOD10-E17',
        10,
        'MOD10-T2',
        'Calculate enhanced bearing capacity perpendicular to grain using k_c,90',
        'When a timber joist rests on a continuous support where rail/sill crushing is partially confined by adjacent unloaded fibres, EC5 allows the design compressive strength perpendicular to grain f_c,90,d to be multiplied by a factor k_c,90 (e.g. k_c,90 = 1.25 for solid softwood on discrete bearings). If f_c,90,d = 1.54 N/mm² and k_c,90 = 1.25, what is the maximum allowable bearing stress (in N/mm², to 2 decimal places)?',
        1.93,
        'N/mm²',
        'k_c,90 × f_c,90,d = 1.25 × 1.54 = 1.925 N/mm² ≈ 1.93 N/mm².',
        'Adjacent unloaded wood fibres act like tension ties ("hammock effect") helping support the loaded bearing zone.'
      ),
      qMcq(
        'MOD10-E18',
        10,
        'MOD10-T3',
        'Understand moisture movement (shrinkage/swelling) across the grain in timber detailing',
        'Timber shrinks and swells significantly perpendicular to the grain as its moisture content changes (e.g. drying after installation), whereas longitudinal movement parallel to the grain is tiny. What detailing problem occurs if a multi-storey platform-frame building stacks deep solid timber floor joists between wall studs at every floor, while an adjacent masonry chimney or steel core does not shrink?',
        [
          'Cumulative cross-grain drying shrinkage of the timber floor zones at each storey causes the timber floors to settle relative to the rigid masonry/steel core, inducing differential movement, sloping floors near the core, and cracked service pipes/finishes',
          'The timber joists expand vertically by 100 mm per floor when drying',
          'Cross-grain shrinkage is zero in solid softwood',
          'The steel core shrinks more than the timber',
        ],
        0,
        'Cross-grain shrinkage is roughly 20–40 times greater than parallel-to-grain shrinkage; platform joints accumulate cross-grain movement over multiple storeys.',
        'Practical timber detailing awareness.'
      ),
      qMcq(
        'MOD10-E19',
        10,
        'MOD10-T3',
        'Identify corrosion hazard of steel fasteners in wet or treated timber',
        'Why must stainless steel or hot-dip galvanised fasteners/joist hangers be specified in Service Class 3 (external) or in certain preservative-treated / high-tannin timbers (like green oak)?',
        [
          'Moisture and organic acids (or copper-based preservative salts) in damp timber cause rapid electrochemical corrosion of unprotected mild steel nails/bolts, which can destroy the connection capacity unseen inside the joint',
          'Stainless steel nails increase the k_mod of the timber',
          'Galvanised steel has zero shear strength',
          'Dry internal Service Class 1 softwood dissolves stainless steel',
        ],
        0,
        'Module 10 durability and connections interface.',
        'Practical specification habit.'
      ),
      qMcq(
        'MOD10-E20',
        10,
        'MOD10-T2',
        'Summarise the complete check sequence for a simple timber member (Module 10 Gate)',
        'Which sequence covers the essential checks for a simple timber floor joist or lintel under BS EN 1995-1-1?',
        [
          'Define geometry, support bearing, lateral restraint, Service Class, and load durations -> establish characteristic and ULS/SLS combinations -> determine f_d (with k_mod, γ_M, k_sys) and k_def -> check ULS bending, ULS shear (including k_cr and any notches k_v), ULS bearing perpendicular to grain, and LTB if unrestrained -> check SLS instantaneous, final creep (k_def), and vibration performance -> specify connections, durability, and hole/notch rules',
          'Only check σ = M/Z using W_pl and ignore moisture, shear, bearing, and creep',
          'Use steel yield strength 355 N/mm² for C16 timber',
          'Only check the weight of the nails',
        ],
        0,
        'Complete synthesis of the Module 10 Learning Gate.',
        'Module 10 Gate.'
      ),
    ],
  },

  /* ======================================================================== */
  /* MODULE 11: MASONRY, LINTELS AND EXISTING BUILDING ALTERATIONS            */
  /* ======================================================================== */
  {
    moduleNumber: 11,
    code: 'MOD-11',
    title: 'Module 11: Masonry, lintels and existing building alterations',
    shortTitle: 'Masonry, lintels and existing building alterations',
    suggestedDuration: '10–14 weeks',
    yearPathway: 'Years 2–3',
    year1Months: 'Years 2–3',
    whyItMatters:
      'Forming a new opening in an existing load-bearing masonry wall is one of the most common UK engineering tasks—and where temporary works (needling, propping, sequencing) and permanent works (beam, bearings, padstones, piers, foundations, lateral restraint) are inseparable.',
    introduction:
      'Covers masonry units (clay bricks, concrete blocks, stone), mortar designations, solid vs cavity wall behaviour, compression-dominated resistance and low tensile strength, concentrated bearing loads and padstone design, wall slenderness and lateral floor/roof restraint, lintels and arching action, movement joints and cracking diagnosis, existing building survey uncertainty, temporary needling/propping sequences, and why "sizing the steel beam" alone is never a complete alteration design (Project 11.1).',
    objectives: [
      'Understand how unit strength, mortar strength, slenderness, and eccentricity govern masonry compressive resistance.',
      'Check concentrated bearing stresses beneath lintels/beams and design padstones to spread loads safely into masonry piers.',
      'Execute the 10-element whole-system assessment for forming a new opening in an existing load-bearing wall, including temporary propping and construction sequencing (Project 11.1).',
    ],
    learningGate: [
      'Explain clearly why "sizing the steel beam" alone is NOT a complete alteration design.',
      'Account systematically for all 10 system elements: (1) beam, (2) bearings, (3) wall/pier capacity, (4) padstone, (5) support below, (6) foundations, (7) lateral restraint, (8) temporary works, (9) survey uncertainty, and (10) construction sequence.',
    ],
    prerequisiteModuleNumbers: [1, 6, 8],
    topics: [
      {
        id: 'MOD11-T1',
        moduleNumber: 11,
        code: '11.1',
        title: 'Masonry Behaviour, Units, Mortar, Slenderness & Lateral Restraint',
        summary:
          'Covers how masonry units and mortar work together, why mortar is softer than the brick, characteristic compressive strength f_k, wall types (solid bonded vs cavity walls with wall ties), slenderness ratio h_ef/t_ef, load eccentricity, and horizontal lateral restraint from floors and roofs.',
        subtopics: [
          'Masonry units (bricks, blocks) and mortar: why mortar provides uniform bedding and why over-strong mortar causes bricks to crack rather than joints',
          'Characteristic compressive strength f_k (function of unit strength f_b and mortar strength f_m) and high partial factor γ_M (varying by execution control)',
          'Cavity walls: inner load-bearing leaf, outer cladding leaf, and stainless steel wall ties sharing lateral wind load',
          'Slenderness ratio (h_ef / t_ef) and eccentricity reduction factor Φ at top/bottom and mid-height of a wall',
          'Lateral restraint details: joist hangers, tension straps at ≤ 2 m centres tying walls to floor/roof diaphragms',
        ],
        learningObjectives: [
          'Explain how unit strength, mortar, slenderness, eccentricity, and wall ties govern masonry wall behaviour.',
          'Explain what happens to a cavity wall or slender wall if wall ties corrode or floor restraint straps are omitted.',
        ],
        futureExpansion: {
          lessonsPlanned: 'EC6 (BS EN 1996-1-1) f_k formula and capacity reduction factor Φ walkthrough.',
          workedExamplesPlanned: 'Checking a masonry pier between two window openings.',
          calculationsPlanned: 'Effective height h_ef and effective thickness t_ef of a cavity wall.',
          sourceReferencesNeeded: 'BS EN 1996-1-1, UK National Annex, and IStructE / PD 6697 masonry guides.',
        },
        questions: [
          qMcq(
            'MOD11-T1-Q1',
            11,
            'MOD11-T1',
            'Understand the physical role of mortar in load-bearing masonry',
            'Why should structural mortar generally be slightly weaker and more deformable than the masonry units (bricks or blocks) it beds together?',
            [
              'Mortar beds out surface irregularities between units to distribute compressive stress evenly, and allows slight thermal/moisture movement to be accommodated by micro-cracking in the sacrificial joints rather than fracturing the bricks themselves',
              'Because bricks have zero compressive strength and mortar carries 100% of the vertical load',
              'Because mortar acts as high-strength tensile glue stronger than steel',
              'Because mortar thickness is 200 mm per course',
            ],
            0,
            'Using overly dense, rigid cement mortar on soft historic bricks traps moisture and forces thermal/settlement cracks right through the bricks.',
            'Fundamental masonry materials understanding.'
          ),
          qNum(
            'MOD11-T1-Q2',
            11,
            'MOD11-T1',
            'Calculate design compressive resistance per metre run of a masonry wall',
            'A 100 mm thick load-bearing masonry inner leaf has characteristic compressive strength f_k = 4.5 N/mm², partial material factor γ_M = 3.0 (so design strength f_d = f_k / γ_M = 1.50 N/mm²), and a capacity reduction factor for slenderness and eccentricity of Φ = 0.70. Calculate the vertical design resistance N_Rd = Φ · t · f_d per metre run of wall (b = 1,000 mm) in kN/m.',
            105,
            'kN/m',
            'N_Rd = 0.70 × 100 mm × 1,000 mm/m × 1.50 N/mm² = 105,000 N/m = 105.0 kN/m.',
            'Shows how γ_M (often 2.3 to 3.0 in masonry depending on manufacturing/execution category) and Φ govern wall resistance.'
          ),
          qMcq(
            'MOD11-T1-Q3',
            11,
            'MOD11-T1',
            'Understand the role of cavity wall ties and the hazard of wall-tie corrosion',
            'In a traditional two-leaf masonry cavity wall where the floors and roof sit only on the 100 mm inner leaf, what is the structural purpose of the metal cavity wall ties connecting the inner and outer leaves?',
            [
              'They tie the unrestrained outer leaf to the laterally restrained inner leaf so both leaves share horizontal wind loads and increase the effective thickness (and reduce the slenderness) of the wall against buckling',
              'They transfer 100% of the roof gravity dead load into the foundation soil directly',
              'They prevent water from touching the outer face of the building',
              'They act as electrical earthing straps only',
            ],
            0,
            'When older mild-steel wall ties corrode, the outer leaf loses its lateral tie to the inner leaf (becoming dangerously slender under wind suction) and expansive rust causes regular horizontal bed-joint cracking every ~450 mm!',
            'Connects cavity wall mechanics to defect recognition.'
          ),
          qMcq(
            'MOD11-T1-Q4',
            11,
            'MOD11-T1',
            'Understand why floor joists running parallel to a masonry wall require restraint straps',
            'When timber floor joists span ONTO a masonry wall, the joist bearings help restrain the wall horizontally. What happens along the perpendicular flank walls where the floor joists run PARALLEL to the wall without touching it?',
            [
              'Unless metal tension restraint straps (with solid timber nogging/blocking between the first 3 joists) are installed at regular intervals, the flank wall receives zero lateral restraint at floor level and spans vertically across two full storeys (doubling its slenderness and buckling risk)',
              'Parallel joists restrain the wall by magnetic attraction across the air gap',
              'Flank walls never experience wind loads',
              'Slenderness is independent of effective height h_ef',
            ],
            0,
            'Missing lateral restraint straps on flank walls parallel to joists is one of the most frequent structural defects found in domestic surveys.',
            'Crucial lateral restraint concept.'
          ),
          qNum(
            'MOD11-T1-Q5',
            11,
            'MOD11-T1',
            'Calculate wall slenderness ratio h_ef / t_ef',
            'A single-leaf solid brick wall of thickness t = 215 mm has a clear storey height of h = 3,200 mm and is laterally restrained at top and bottom by concrete floors (giving an effective height factor of 0.75, so h_ef = 0.75 × 3,200 = 2,400 mm). Calculate the wall slenderness ratio h_ef / t (to 2 decimal places).',
            11.16,
            'ratio',
            'h_ef / t = 2,400 / 215 = 11.163 ≈ 11.16 (well within the EC6 maximum slenderness limit of 27).',
            'If the top floor restraint were removed during alterations, h_ef would jump to 2 × 3,200 = 6,400 mm, giving h_ef / t = 29.8 > 27 (unsafe!).'
          ),
        ],
      },
      {
        id: 'MOD11-T2',
        moduleNumber: 11,
        code: '11.2',
        title: 'Concentrated Loads, Bearings, Padstones, Lintels & Movement Joints',
        summary:
          'Covers how concentrated beam reactions bear on masonry, why padstones are needed, load dispersion at 45°/60° through padstones and walls, lintel load triangles (arching action vs floor loads), and movement joints/cracking diagnosis.',
        subtopics: [
          'Concentrated bearing stress beneath a steel beam flange vs spread bearing beneath a stiff padstone',
          'Why a padstone must be stiff enough in bending and shear not to snap when spreading a point load',
          'Load dispersion downward through masonry (typically 45° or 60° from horizontal) to lower storeys and foundations',
          'Lintels over openings: when a 45°/60° masonry triangle applies vs when full floor/roof loads above must be taken',
          'Movement joints and cracking: clay brick irreversible moisture expansion vs calcium silicate/concrete block drying shrinkage',
        ],
        learningObjectives: [
          'Size a concrete or stone padstone for a steel beam end reaction and check local bearing stress.',
          'Determine when a lintel can rely on masonry arching vs when it must carry full floor and wall loads.',
        ],
        futureExpansion: {
          lessonsPlanned: 'EC6 concentrated load enhancement factor β and padstone bending/shear checks.',
          workedExamplesPlanned: 'Padstone and pier check for a residential knock-through.',
          calculationsPlanned: 'Comparing line load on a pier before and after forming a 3.6 m opening.',
          sourceReferencesNeeded: 'BS EN 1996-1-1, UK National Annex, and IStructE / BDA guides.',
        },
        questions: [
          qNum(
            'MOD11-T2-Q1',
            11,
            'MOD11-T2',
            'Calculate bearing stress beneath a padstone and check against masonry design strength',
            'A new steel lintel beam transfers a ULS end reaction of R_Ed = 54 kN onto a precast concrete padstone measuring 100 mm wide (wall leaf thickness) × 300 mm long × 215 mm deep. Calculate the average compressive stress beneath the padstone in N/mm².',
            1.8,
            'N/mm²',
            'Padstone plan area = 100 mm × 300 mm = 30,000 mm². Bearing stress = 54,000 N / 30,000 mm² = 1.80 N/mm².',
            'If the existing masonry has design bearing resistance 1.80 N/mm² or greater, the 300 mm padstone suffices; if not, a longer padstone or spreader beam is required.'
          ),
          qNum(
            'MOD11-T2-Q2',
            11,
            'MOD11-T2',
            'Calculate dispersed width of a concentrated load at foundation level',
            'A padstone of length 300 mm sits at a height of 2.4 m above the top of a strip foundation in a continuous solid wall (with no openings below the padstone). Assuming the concentrated reaction disperses downwards through the brickwork at an angle of 30° to the vertical (i.e. 60° to the horizontal, so horizontal spread on each side is 2,400 × tan 30° = 1,386 mm) when not cut off by a wall end, what would be the total dispersed length (in m, to 2 decimal places) if the padstone sits right at the end corner of the wall (so it can only disperse to ONE side)?',
            1.69,
            'm',
            'Because the padstone is at the end of the wall, dispersion can only occur in one direction along the wall: L_disp = 0.30 m + (2.4 m × tan 30°) = 0.30 + 1.3856 = 1.6856 m ≈ 1.69 m.',
            'Crucial geometry check: a bearing near the end of a wall or next to a doorway cannot disperse past the free vertical edge!'
          ),
          qMcq(
            'MOD11-T2-Q3',
            11,
            'MOD11-T2',
            'Identify when the "45°/60° arching triangle" assumption over a lintel is INVALID',
            'For small window lintels in a tall uninterrupted masonry wall, engineers sometimes take only a triangle of brickwork above the opening on the assumption that the wall above arches around the triangle. When is this arching-triangle assumption completely INVALID and unsafe?',
            [
              'When there is insufficient uninterrupted masonry height above the lintel to form an arch, when there are window/door openings in the wall above, when floor or roof joists bear within or just above the zone, or when the piers at the ends of the opening are too narrow to resist the horizontal arch thrust',
              'When the lintel is made of steel',
              'When the wall is plastered',
              'Arching always reduces all floor and roof loads to zero',
            ],
            0,
            'In domestic alterations (such as knocking out a ground-floor wall under first-floor joists and upper windows), arching cannot be relied upon and the full tributary height of walls, floors, and roof must be taken!',
            'Prevents gross under-estimation of alteration beam loads.'
          ),
          qMcq(
            'MOD11-T2-Q4',
            11,
            'MOD11-T2',
            'Understand why a very long thin padstone can crack in bending/shear',
            'An engineer needs a 600 mm long bearing on weak masonry for a 100 mm wide steel beam sitting at the centre of the bearing, and specifies a 600 mm long × 65 mm high unreinforced concrete brick as a "padstone". Why will this fail to distribute the load over the 600 mm length?',
            [
              'The 250 mm unreinforced projections either side of the 100 mm steel flange act as shallow cantilevers under upward masonry pressure and will snap in flexural tension/shear unless the padstone is deep enough (e.g. ≥ 215–300 mm so dispersion stays within a ~45° strut angle) or reinforced as a steel/RC spreader beam',
              'Concrete bricks are heavier than steel',
              'Long padstones have zero compressive strength',
              'A 65 mm brick is too stiff',
            ],
            0,
            'A padstone works by steep compression strut dispersion (~45°); if the projection beyond the steel flange exceeds the padstone depth, tensile bending stress develops in the padstone.',
            'Practical padstone proportioning rule.'
          ),
          qMcq(
            'MOD11-T2-Q5',
            11,
            'MOD11-T2',
            'Distinguish clay brickwork vs concrete blockwork moisture movement',
            'How does the long-term moisture movement of fired clay brickwork differ from that of concrete blockwork (or calcium silicate bricks), and why are vertical movement joints needed?',
            [
              'Fired clay bricks undergo long-term irreversible moisture EXPANSION after leaving the kiln, whereas concrete blockwork undergoes drying SHRINKAGE; without movement joints at appropriate intervals, restrained expansion causes buckling/cracking and restrained shrinkage causes vertical tensile cracks',
              'Clay bricks shrink by 5% and concrete blocks expand by 5%',
              'Neither material changes length with moisture or temperature',
              'Movement joints are used to transfer bending moments across walls',
            ],
            0,
            'Note also that wherever a vertical movement joint cuts a wall, it interrupts horizontal diaphragm continuity, so lateral restraint on both sides of the joint must be checked!',
            'Module 11 movement joints and cracking awareness.'
          ),
        ],
      },
      {
        id: 'MOD11-T3',
        moduleNumber: 11,
        code: '11.3',
        title: 'Existing Building Alterations, Temporary Propping & Whole-System Design (Project 11.1)',
        summary:
          'Covers the complete 10-element system assessment for forming a new opening in an existing load-bearing wall (Project 11.1): survey uncertainty, temporary propping/needling concept, construction sequence, lateral buttressing loss, pier/wall capacity, padstones, support below, and foundation implications.',
        subtopics: [
          'Why "sizing the steel beam" is only 10% of an alteration design (Module 11 Gate)',
          'The 10 system elements: beam, bearings, wall/pier capacity, padstone, support below, foundations, lateral restraint, temporary works, survey uncertainty, construction sequence',
          'Loss of lateral buttressing when a cross-wall (return wall) is removed to create an open-plan room',
          'Concentrating uniform wall loads into two heavy point loads on existing shallow strip foundations',
          'Temporary works propping and needling sequence: propping floors and needling upper walls onto sound bearing before demolition',
        ],
        learningObjectives: [
          'Explain why removing an internal return wall can destabilise the external wall it previously buttressed.',
          'Plan a safe step-by-step temporary propping and installation sequence for Project 11.1.',
        ],
        futureExpansion: {
          lessonsPlanned: 'Case studies of domestic knock-throughs, box-frames, and needle-and-prop arrangements.',
          workedExamplesPlanned: 'Project 11.1 full 10-element calculation and sequencing package.',
          calculationsPlanned: 'Checking increased strip foundation pressure under a remaining masonry pier.',
          sourceReferencesNeeded: 'IStructE Guide to Structural Alterations and BS 5975.',
        },
        questions: [
          qMcq(
            'MOD11-T3-Q1',
            11,
            'MOD11-T3',
            'Explain why "sizing the steel beam" alone is NOT a complete alteration design (Module 11 Gate)',
            'A homeowner asks you to "just give me the steel beam size" to knock down a 4.0 m internal load-bearing wall in a two-storey terraced house. Why is sizing the steel beam alone an incomplete and potentially dangerous piece of engineering?',
            [
              'Because removing the wall converts a gentle uniform line load into two concentrated point reactions at the ends of the beam and removes lateral buttressing from the external wall; you must verify the whole 10-part system: beam, end bearings, padstones, remaining masonry piers, structure below (e.g. cellar/suspended timber floor), existing shallow foundations, lateral sway stability, survey uncertainties, temporary propping/needling, and construction sequence',
              'Because steel beams cannot span 4.0 m',
              'Because internal walls never carry floor or roof loads',
              'Because only the paint specification matters in alterations',
            ],
            0,
            'Exact statement of the Module 11 Learning Gate.',
            'Module 11 Gate & Milestone D.'
          ),
          qMcq(
            'MOD11-T3-Q2',
            11,
            'MOD11-T3',
            'Identify lateral stability loss when removing a buttressing return wall',
            'In a traditional masonry house, an internal cross-wall bonded perpendicular to the front/rear external walls is removed completely to create an open-plan ground floor, leaving only a 150 mm nib at the external wall. Apart from supporting the vertical load above, what critical stability function did that cross-wall perform?',
            [
              'It acted as a vertical buttress (shear wall / return flange) restraining the external walls against horizontal wind loads and out-of-plane buckling; removing it can leave the external wall unbuttressed over a long length unless a wind-post, box/goalpost portal frame, or deeper bonded pier is provided',
              'It kept the roof tiles from sliding down the roof pitch',
              'It prevented groundwater from rising',
              'Internal cross-walls have zero effect on lateral stability',
            ],
            0,
            'Loss of lateral buttressing is one of the most frequently overlooked hazards in domestic open-plan alterations.',
            'Links Module 6 stability to Module 11 alterations.'
          ),
          qNum(
            'MOD11-T3-Q3',
            11,
            'MOD11-T3',
            'Calculate increased line load on a remaining masonry pier after forming an opening (Project 11.1)',
            'Before alteration, a solid masonry wall carried a uniform ULS vertical line load of w = 30 kN/m along its entire length (so a 0.6 m wide section carried 30 × 0.6 = 18 kN). A 3.4 m wide opening is now cut beside a 0.6 m remaining masonry pier, so the new lintel transfers half of the 3.4 m opening load (1.7 m × 30 kN/m = 51 kN) onto that 0.6 m pier in addition to the pier’s own direct load (18 kN). What is the new average ULS vertical force per metre run (in kN/m) at the base of the 0.6 m pier?',
            115,
            'kN/m',
            'Total vertical force on the 0.6 m pier = 18 kN (direct) + 51 kN (from beam reaction) = 69 kN. Average force per metre run of the 0.6 m pier = 69 kN / 0.6 m = 115 kN/m (nearly 4 times the original 30 kN/m!).',
            'Shows vividly why both the remaining masonry pier AND the existing strip foundation beneath that pier must be checked!'
          ),
          qMcq(
            'MOD11-T3-Q4',
            11,
            'MOD11-T3',
            'Specify a safe temporary propping and construction sequence for a masonry opening (Project 11.1)',
            'Which construction sequence is required when forming a new opening in a load-bearing wall supporting first-floor joists and an upper-storey brick wall?',
            [
              '(1) Expose and verify existing bearings/foundations; (2) install temporary props on soleboards to support first-floor joists (and backprop suspended timber floors to firm ground) AND core needle beams with strongboys/props at close centres to support the upper brickwork; (3) pre-wedge/tighten temporary supports; (4) carefully demolish masonry below needles and cast/cure padstones; (5) install new steel beam and pack tightly with dry-pack mortar/steel shims between beam top flange and upper brickwork; (6) only remove needles/props after dry-pack and padstones have cured',
              'Demolish the entire wall first, wait three days, and then prop the sagging ceiling',
              'Stand Acrow props directly on middle-span floorboards with no soleboards and no backpropping to the ground',
              'Cut out both end piers at the same time before installing the beam',
            ],
            0,
            'Dry-packing the gap between the top of the new steel beam and the underside of the existing brickwork before striking the needles is essential to prevent the wall above dropping onto the beam!',
            'Core temporary works & alteration sequencing engineering.'
          ),
          qMcq(
            'MOD11-T3-Q5',
            11,
            'MOD11-T3',
            'Recognise hidden-condition risks in existing masonry buildings',
            'When surveying an existing plastered brick wall prior to designing a new opening, which hidden conditions commonly invalidate desktop assumptions if not checked by trial holes/opening-up?',
            [
              'Any of the following: floor joists spanning the opposite way to assumed, concealed chimney flues or voids inside piers, soft lime/rubble core infill inside thick walls, timber bonding timbers that have rotted, shallow/corbelled brick footings with no concrete strip foundation, or piers resting on suspended timber beams over a basement',
              'The exact colour of the wallpaper',
              'Existing buildings always match architectural sales brochures 100%',
              'Brickwork strength increases to 500 N/mm² behind plaster',
            ],
            0,
            'Never finalise an alteration design on unverified guesses when simple opening-up (lifting a floorboard, exposing a pier/footing trial pit) can establish the real load path.',
            'Bridges Module 11 to Module 18.'
          ),
        ],
      },
    ],
    workedExamples: [
      {
        id: 'PROJ-11.1',
        code: 'Project 11.1',
        title: 'New opening in load-bearing masonry',
        kind: 'worked_project',
        description:
          'Use a textbook/recognised worked example or anonymised office calculation. Assess: existing wall arrangement; loading onto wall; beam loading; bearing lengths; padstone need; wall compression/bearing considerations; effects on lower storey walls/foundations; lateral restraint; temporary propping concept; construction sequencing; unknown-information risk.',
        requiresCalcNote: true,
        statusLabel: 'Covered in Topics 11.1–11.3 & Module 11 Assessment (Linked to Milestones C & D)',
        selfReviewChecklist: [
          'Verify all 10 system elements from the Module 11 Gate.',
          'Include a step-by-step temporary propping, needling, dry-packing, and striking sequence.',
          'List survey items that must be confirmed on site before construction.',
        ],
      },
    ],
    resources: [
      'IStructE guidance on structural alterations and masonry, where available.',
      'Masonry industry technical guidance (BDA / Concrete Block Association).',
      'Current EC6 (BS EN 1996-1-1) and UK National Annex through work/library.',
    ],
    standardsNotice:
      'Years 2–3 masonry and alterations module. Characteristic and design masonry strengths in assessment problems are explicitly stated; real design must consult BS EN 1996-1-1, the UK National Annex, PD 6697, and BS 5975.',
    moduleAssessmentQuestions: [
      qNum(
        'MOD11-E01',
        11,
        'MOD11-T2',
        'Calculate total ULS load and end reactions on a new masonry opening lintel (Project 11.1)',
        'A new steel beam of clear span 3.6 m (effective span between bearing centres L_eff = 3.8 m) is installed to form an opening in a load-bearing wall. The beam carries a total ULS line load (upper wall + first floor + roof + self-weight) of w_Ed = 32.0 kN/m. Calculate the ULS vertical reaction R_Ed at each end bearing in kN.',
        60.8,
        'kN',
        'R_Ed = (w_Ed × L_eff) / 2 = (32.0 × 3.8) / 2 = 60.8 kN.',
        'Note the use of effective span (clear span + one bearing length = 3.6 + 0.2 = 3.8 m).'
      ),
      qNum(
        'MOD11-E02',
        11,
        'MOD11-T2',
        'Calculate required padstone length on existing brickwork (Project 11.1)',
        'The end reaction R_Ed = 60.8 kN is supported on a concrete padstone bedded on a 102.5 mm thick brick leaf. If the design local bearing resistance of the brickwork beneath the padstone (including any applicable concentrated load factor) is f_b,Rd = 1.60 N/mm², calculate the minimum required padstone length L_pad (in mm, to the nearest mm).',
        371,
        'mm',
        'Required bearing area A_req = 60,800 N / 1.60 N/mm² = 38,000 mm². Required length L_pad = 38,000 / 102.5 = 370.7 mm ≈ 371 mm (so a standard 400 mm or 440 mm long padstone would be specified).',
        'Project 11.1 padstone sizing.'
      ),
      qNum(
        'MOD11-E03',
        11,
        'MOD11-T2',
        'Check tight L/500 serviceability deflection limit for a beam supporting brittle masonry',
        'For the L_eff = 3,800 mm steel beam supporting existing brickwork above the opening, the engineer limits the total unfactored SLS deflection to Span / 500. What is the maximum allowable SLS deflection in mm?',
        7.6,
        'mm',
        'δ_lim = 3,800 mm / 500 = 7.60 mm.',
        'Tight deflection limits (L/500) prevent cracking of the stiff brittle masonry wall above.'
      ),
      qNum(
        'MOD11-E04',
        11,
        'MOD11-T2',
        'Calculate required I to satisfy L/500 under unfactored SLS load',
        'If the unfactored total SLS line load on the 3,800 mm effective span beam is w_SLS = 22.0 kN/m (22.0 N/mm) and E = 210,000 N/mm², calculate the minimum second moment of area I_req (in cm⁴, to the nearest 10 cm⁴) required so that δ = 5 w_SLS L⁴ / (384 E I) does not exceed 7.60 mm.',
        3740,
        'cm⁴',
        'I_req = (5 × 22.0 × 3,800⁴) / (384 × 210,000 × 7.60) = (2.2936 × 10¹⁶) / (6.12864 × 10⁸) = 37,424,000 mm⁴ = 3,742 cm⁴ ≈ 3,740 cm⁴.',
        'Often SLS deflection (L/500) rather than ULS bending strength governs steel beams supporting masonry walls!'
      ),
      qNum(
        'MOD11-E05',
        11,
        'MOD11-T3',
        'Calculate temporary needle beam spacing and load per needle (Project 11.1)',
        'Before demolishing the 3.6 m wall opening, temporary needle beams with props are installed at 0.90 m horizontal centres along the wall. If the unfactored characteristic weight of the upper wall and propped floors during the alteration stage is w_temp = 16.0 kN/m, what vertical wall load (in kN) is carried by each temporary needle assembly?',
        14.4,
        'kN',
        'Load per needle = w_temp × spacing = 16.0 kN/m × 0.90 m = 14.4 kN.',
        'If the needle is supported by one prop on the inside and one prop on the outside (equally spaced from the wall), each prop carries 14.4 / 2 = 7.2 kN.'
      ),
      qNum(
        'MOD11-E06',
        11,
        'MOD11-T3',
        'Calculate asymmetric prop leg reactions on an offset temporary needle beam',
        'In a boundary wall alteration, the inner prop A can be placed 0.50 m from the wall centreline, while the outer prop B must be placed 1.00 m from the wall centreline to clear an exterior drain (total needle span between props = 1.50 m). If the wall applies a vertical load of P = 15.0 kN onto the needle at the wall centreline, calculate the vertical reaction carried by the closer inner prop A in kN.',
        10,
        'kN',
        'Taking moments about outer prop B: R_A × 1.50 m = 15.0 kN × 1.00 m => R_A = 10.0 kN (and R_B = 5.0 kN).',
        'Notice that the prop closer to the wall carries two-thirds of the needle load!'
      ),
      qNum(
        'MOD11-E07',
        11,
        'MOD11-T3',
        'Calculate maximum bending moment in the temporary needle beam',
        'For the temporary needle beam in the previous question (span 1.50 m, P = 15.0 kN at 0.50 m from prop A, so R_A = 10.0 kN and R_B = 5.0 kN), calculate the bending moment in the needle beam directly beneath the wall centreline in kN·m.',
        5,
        'kN·m',
        'M_needle = R_A × 0.50 m = 10.0 kN × 0.50 m = 5.0 kN·m (checked from right: 5.0 kN × 1.00 m = 5.0 kN·m).',
        'Both the needle beam in bending and the props/soleboards in compression/bearing must be checked.'
      ),
      qNum(
        'MOD11-E08',
        11,
        'MOD11-T3',
        'Calculate new soil bearing pressure under an existing strip foundation after forming an opening',
        'An existing 450 mm (0.45 m) wide concrete strip foundation originally carried a uniform characteristic load of 27 kN/m (giving a soil pressure of 27 / 0.45 = 60 kN/m²). After forming a large opening, the remaining pier transfers a concentrated characteristic load that averages 63 kN/m over the effective dispersed foundation length. What is the new characteristic bearing pressure on the soil beneath the 0.45 m wide strip foundation in kN/m²?',
        140,
        'kN/m²',
        'q_soil = 63 kN/m / 0.45 m = 140 kN/m² (more than double the original 60 kN/m²!).',
        'If the existing soil allowable bearing pressure is e.g. 100 kN/m², the existing strip foundation is now overloaded and requires a new pad foundation or ground-beam spreader!'
      ),
      qNum(
        'MOD11-E09',
        11,
        'MOD11-T1',
        'Calculate design compressive strength f_d of masonry from f_k and γ_M',
        'A concrete blockwork wall is built with units and mortar giving a characteristic compressive strength f_k = 3.5 N/mm². If the applicable UK National Annex partial material factor for the execution class is γ_M = 2.50, calculate the design compressive strength f_d = f_k / γ_M in N/mm².',
        1.4,
        'N/mm²',
        'f_d = 3.5 / 2.50 = 1.40 N/mm².',
        'Masonry partial factors γ_M are significantly higher than steel (1.0) or concrete (1.5) due to site workmanship variability.'
      ),
      qNum(
        'MOD11-E10',
        11,
        'MOD11-T1',
        'Calculate eccentricity e of a floor joist bearing on the inner edge of a wall',
        'A floor slab or joist hanger applies its vertical reaction near the inner face of a 102.5 mm thick masonry leaf, taken at a distance of t/6 from the inner face (i.e. at distance t/2 − t/6 = t/3 from the wall centreline). For t = 102.5 mm, calculate this load eccentricity e = t / 3 from the wall centreline in mm (to 1 decimal place).',
        34.2,
        'mm',
        'e = 102.5 / 3 = 34.17 mm ≈ 34.2 mm.',
        'Eccentric loading at the top of a wall reduces the capacity reduction factor Φ = 1 − 2(e/t).'
      ),
      qMcq(
        'MOD11-E11',
        11,
        'MOD11-T3',
        'Identify the danger of propping onto a suspended timber ground floor without backpropping',
        'In many older UK houses, the ground floor is a suspended timber floor (100 mm joists spanning onto low sleeper walls over a sub-floor void) rather than a ground-bearing concrete slab. What happens if temporary Acrow props supporting the upper floor and brickwork are stood on a soleboard on the ground-floor floorboards without lifting a board to prop directly down to the oversite/foundations?',
        [
          'The heavy prop loads can overload and shear/snap the small ground-floor timber joists or crush the fragile honeycombed sleeper walls below, causing sudden collapse of both the ground floor and the propped upper structure',
          'Suspended timber ground floors have infinite load capacity',
          'Acrow props do not transmit vertical force to their base',
          'Carpet acts as a structural reinforced concrete raft',
        ],
        0,
        'Always verify whether the ground floor is ground-bearing concrete or suspended timber/basement before landing temporary props!',
        'Vital UK domestic temporary works rule.'
      ),
      qMcq(
        'MOD11-E12',
        11,
        'MOD11-T3',
        'Understand why twin steel beams bolted together with tubular spacers are used under 215 mm solid walls',
        'When forming an opening in a 215 mm (9-inch) solid brick wall (or a 300 mm cavity wall), why do engineers often specify TWO parallel steel beams bolted together with tubular steel spacers/diaphragms (or a wide flange plate) rather than a single narrow 102 mm wide UB?',
        [
          'A single narrow 102 mm beam leaves over half the 215 mm wall width overhanging unsupported (or requires a heavy wide plate subject to torsion), whereas twin parallel beams directly support both halves/leaves of the masonry wall across its full thickness and double the torsional/lateral stability during installation',
          'Because one beam is prohibited by the laws of statics',
          'Because tubular spacers reduce the span of the opening',
          'Because twin beams do not need padstones',
        ],
        0,
        'Note: when twin beams are bolted together with spacers at regular centres so they deflect together, ensure the bolts/spacers are detailed to share any asymmetric leaf loads.',
        'Practical UK alteration detailing.'
      ),
      qMcq(
        'MOD11-E13',
        11,
        'MOD11-T1',
        'Distinguish stepped diagonal cracking vs uniform vertical cracking in masonry walls',
        'During a visual appraisal of a masonry wall, what causes a crack that steps diagonally along mortar bed and perpend joints (wider at the top and tapering towards the bottom near a building corner) compared to a vertical crack of uniform width down a long concrete block wall?',
        [
          'A diagonal stepped crack widening towards the top at a corner typically indicates downward differential foundation settlement/subsidence of the corner, whereas a uniform-width vertical crack in a long block wall typically indicates horizontal tensile drying shrinkage or thermal contraction restraint',
          'All cracks in masonry are caused by roof uplift',
          'Shrinkage cracks are always 100 mm wide and diagonal',
          'Foundation subsidence only causes horizontal bed-joint expansion',
        ],
        0,
        'Understanding the tension stress trajectory that opened the crack tells you the direction of relative movement.',
        'Connects Module 11 cracking to Module 12/18.'
      ),
      qMcq(
        'MOD11-E14',
        11,
        'MOD11-T3',
        'Understand the purpose of a steel "box frame" or "goalpost frame" in alterations',
        'When a client wants to remove almost the entire rear ground-floor wall of a house (leaving no masonry piers wide enough to act as shear walls or carry vertical loads), why does the engineer design a steel "goalpost" (moment portal frame) or "box frame" (beams + columns + bottom ground beam)?',
        [
          'Because without masonry piers, the steel frame itself must provide both the vertical support columns AND the in-plane lateral sway resistance (via moment-resisting bolted knee joints), while a bottom steel ground beam spreads the column reactions along the existing foundation and resists the portal base moments',
          'Because goalpost frames do not require bolts or foundations',
          'Because moment frames have zero deflection',
          'Because masonry walls are never load-bearing',
        ],
        0,
        'When masonry piers are removed, both the vertical load path and the lateral stability system must be replaced by the new steelwork.',
        'Connects Module 6/9 frames to Module 11 alterations.'
      ),
      qMcq(
        'MOD11-E15',
        11,
        'MOD11-T2',
        'Understand why dry-pack mortar is packed between the top of a new beam and existing masonry before removing needles',
        'After lifting a new steel lintel beam onto its padstones beneath an existing brick wall (which is held up by temporary needles), why is a stiff semi-dry non-shrink mortar ("dry-pack") rammed tightly into the 20–30 mm gap above the top flange and allowed to cure BEFORE the temporary needles are removed?',
        [
          'To ensure continuous, immediate load transfer from the underside of the existing brickwork onto the new steel beam along its full length; if the needles were removed with an unfilled gap or only loose point wedges, the brickwork would drop, crack, and lose its mortar bond',
          'To glue the beam up to the bricks so padstones can be removed',
          'To waterproof the interior living room',
          'Because dry-pack mortar has a Young’s modulus higher than diamond',
        ],
        0,
        'Pre-loading or tight dry-packing before de-propping is essential to transfer load without settlement.',
        'Critical construction sequence step.'
      ),
      qMcq(
        'MOD11-E16',
        11,
        'MOD11-T1',
        'Identify why chasing deep horizontal slots into a thin load-bearing masonry wall is dangerous',
        'An electrician or plumber chases a 45 mm deep horizontal groove all the way across a 100 mm thick load-bearing blockwork inner leaf to bury a waste pipe. Why is this severely detrimental to the wall?',
        [
          'It removes nearly half the effective thickness of the wall along a continuous horizontal hinge line, drastically increasing local eccentricity and reducing both the vertical compressive resistance and out-of-plane flexural/buckling capacity of the wall',
          'Horizontal chases increase the strength of blockwork',
          'Plastic pipes carry the full weight of the house in compression',
          'Chasing only affects the paint',
        ],
        0,
        'Building Regulations Approved Document A and EC6 strictly limit vertical and especially horizontal chase depths in load-bearing walls.',
        'Practical site inspection awareness.'
      ),
      qMcq(
        'MOD11-E17',
        11,
        'MOD11-T2',
        'Understand lateral restraint of a steel beam supporting a masonry wall',
        'When a new steel beam is installed inside an opening to support a solid brick wall above (with no concrete floor slab cast onto the top flange), can you automatically assume the brick wall sitting on the top flange provides full continuous lateral restraint against LTB?',
        [
          'No; unbonded masonry sitting on top of a steel flange (especially during installation or if only resting on a damp-proof course/dry-pack) offers limited lateral shear restraint and is actually a destabilising top-flange gravity load unless positive restraint (such as incoming floor joists strapped/blocked to the beam or torsional end restraints with conservative L_LT) is verified',
          'Yes; loose bricks on a top flange always provide infinite lateral restraint',
          'Yes; a damp-proof course (DPC) membrane is a high-friction structural weld',
          'Steel beams under brick walls are in pure tension',
        ],
        0,
        'In UK practice (SCI / IStructE guidance), beams supporting masonry walls without tied floor diaphragms are checked conservatively as unrestrained (often with destabilising load factor) between effective lateral restraints.',
        'Crucial link between Module 8/9 LTB and Module 11.'
      ),
      qNum(
        'MOD11-E18',
        11,
        'MOD11-T1',
        'Calculate capacity reduction factor Φ at the top of a wall for a given eccentricity',
        'In BS EN 1996-1-1, the capacity reduction factor at the top or bottom of a wall due to load eccentricity e_i is given by Φ_i = 1 − 2 × (e_i / t). If a 100 mm thick wall has a resultant load eccentricity at its top of e_i = 15 mm, calculate Φ_i.',
        0.7,
        'ratio',
        'Φ_i = 1 − 2 × (15 / 100) = 1 − 0.30 = 0.70.',
        'Notice that if e_i reaches t/2 = 50 mm, Φ_i drops to zero because a zero-tension material cannot resist a load outside its cross-section!'
      ),
      qMcq(
        'MOD11-E19',
        11,
        'MOD11-T3',
        'Identify party wall and adjacent structure considerations in domestic alterations',
        'When designing a steel beam pocketed into a shared masonry party wall between two terraced or semi-detached houses, what practical and structural issues must be considered at the party wall bearing?',
        [
          'Party wall thickness (often only 215 mm solid brick shared by both houses), avoiding cutting through more than half the wall thickness, checking what loads from the neighbour’s floors/chimneys already bear on that pier, fire/acoustic separation, temporary propping access, and statutory Party Wall Act notice requirements',
          'You can demolish the neighbour’s side of the party wall without checking',
          'Party walls never carry the neighbour’s floor joists',
          'Padstones are not needed on party walls',
        ],
        0,
        'A 215 mm party wall normally allows only a ~100 mm deep pocket on your side; if a longer bearing or wider spread is needed, an eccentric spreader padstone or column against the wall face is often used.',
        'Real-world UK domestic alteration constraint.'
      ),
      qMcq(
        'MOD11-E20',
        11,
        'MOD11-T3',
        'Verify all 10 elements of the Module 11 Learning Gate',
        'Which checklist contains all 10 system elements required by the Module 11 Learning Gate to prove that an existing-building masonry alteration has been properly engineered?',
        [
          '(1) Beam, (2) Bearings, (3) Wall/pier capacity, (4) Padstone, (5) Support below, (6) Foundations, (7) Lateral restraint, (8) Temporary works, (9) Survey uncertainty, and (10) Construction sequence',
          '(1) Beam size only',
          '(1) Beam size and (2) Padstone length only',
          '(1) Paint colour and (2) Plaster thickness only',
        ],
        0,
        'Complete 10-element Module 11 Learning Gate.',
        'Module 11 Gate.'
      ),
    ],
  },
];
