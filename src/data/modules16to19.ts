import { SyllabusModule } from '../types/syllabus';
import { qNum, qMcq } from './questionHelpers';

export const MODULES_16_TO_19: SyllabusModule[] = [
  {
    id: 'MOD-16',
    moduleNumber: 16,
    title: 'Software Modelling and Model Validation',
    shortTitle: 'Software Modelling & Validation',
    summary: 'Idealising real structures into 1D/2D/3D analytical models, member releases, local axes, support and spring stiffness sensitivity, load combinations, model warnings, and the 7 mandatory validation checks.',
    whyItMatters: 'Structural analysis software solves the mathematical model you input, not necessarily the real building you intend to build. Every model must be bounded by hand calculations and verified against the 7 mandatory gate questions before any output is trusted.',
    objectives: [
      'Translate physical structural framing and connections into appropriate 1D/2D/3D elements, local axes, member releases, and boundary restraints.',
      'Configure load cases, combinations, member offsets, floor diaphragm assumptions, and realistic support/rotational spring stiffness bounds.',
      'Interrogate solver warnings (mechanisms, zero-stiffness nodes, ill-conditioned matrices) and verify global equilibrium.',
      'Execute the 7 Mandatory Model Validation Questions on every software model.'
    ],
    learningGate: 'Never accept a software model without passing all 7 validation questions.',
    WorkedExamples: [
      {
        id: 'EX-16.1',
        title: 'Project 16.1: 2D Portal / Frame Model vs Hand-Calculation Validation',
        brief: 'Build a 2D frame model, run sensitivity checks on pinned vs partially fixed bases and member releases, and verify all 7 mandatory validation questions against hand bounds.',
        checklist: [
          'Verify total vertical and horizontal reaction sums match applied loads within 1% for every load case.',
          'Check deflected shape continuity, expected order of magnitude, and absence of unintended mechanisms.',
          'Compare software bending moments against pinned (wL^2/8) and fixed (wL^2/12) hand bounds.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-16.2',
        title: 'Project 16.2: Debugging Flawed Software Models (Releases, Offsets & Diaphragms)',
        brief: 'Diagnose three classic software modelling errors: torsional mechanism from pinning both ends in torsion, unintended frame action from forgetting beam end releases, and rigid-diaphragm axial force masking.',
        checklist: [
          'Identify why releasing torsional restraint (Mx) at both ends of a 3D beam creates a rigid-body spin instability.',
          'Identify why omitting moment releases on nominal fin-plate secondary beams underestimates midspan sagging and overloads connections.',
          'Check sensitivity when a rigid floor diaphragm is replaced by semi-rigid or flexible collector beams.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD16-T1',
        code: '16.1',
        title: 'Idealisation, Local Axes, Member Releases, Supports & Springs',
        summary: 'Centreline representation, local x-y-z member axes, major vs minor axis orientation (beta angle), end moment releases, torsional restraint, and rotational/translational spring sensitivity.',
        subtopics: [
          'Centreline geometry, local member axes, and checking 90-degree column orientation (beta angle)',
          'End releases: pinned (My = Mz = 0) vs moment-resisting joints, while keeping torsional restraint (Mx) at least at one end',
          'Support conditions: never assuming infinite soil/base fixity without sensitivity bounds'
        ],
        futureContentNote: 'Future expansion slot for semi-rigid connection rotational stiffness Sj,ini and spring subgrade modulus k_s sensitivity.',
        assessmentQuestions: [
          qNum('MOD16-T1-Q1', 'MOD16-T1', 'Quantify midspan moment error when a pinned beam is accidentally modelled with fixed ends.', 'A 8.0 m simply supported steel beam carries a factored UDL w = 30 kN/m. The true midspan sagging moment (with pinned end releases) is wL^2/8 = 240 kNm. If the modeller forgets to apply end moment releases so the beam is analysed as fully fixed into rigid columns (giving midspan sagging wL^2/24), calculate the midspan sagging moment reported by the flawed software model.', 'Use M_flawed = w * L^2 / 24.', 80, 'kNm', 0.5, 'M_flawed = 30 * 8.0^2 / 24 = 1920 / 24 = 80.0 kNm (underestimating the true midspan moment of 240 kNm by a factor of 3, while transferring 160 kNm hogging into connections not designed for moment!).'),
          qNum('MOD16-T1-Q2', 'MOD16-T1', 'Calculate vertical spring stiffness k_z for a pad foundation on elastic ground.', 'A 2.0 m x 2.0 m pad foundation (area A = 4.0 m^2) is modelled as a vertical spring. If the estimated modulus of subgrade reaction is k_s = 25,000 kN/m^3 (25 MN/m^3), calculate the vertical translational spring stiffness K_z = k_s * A (in kN/m).', 'Use K_z = 25,000 * 4.0.', 100000, 'kN/m', 500, 'K_z = 25,000 kN/m^3 * 4.0 m^2 = 100,000 kN/m (or 100 kN/mm).'),
          qNum('MOD16-T1-Q3', 'MOD16-T1', 'Calculate vertical settlement of the modelled spring support.', 'Under a service column load N = 800 kN on the vertical spring of stiffness K_z = 100,000 kN/m (100 kN/mm), calculate the elastic vertical displacement delta_z (in mm).', 'Use delta_z = N / K_z.', 8, 'mm', 0.1, 'delta_z = 800 kN / (100 kN/mm) = 8.0 mm.'),
          qMcq('MOD16-T1-Q4', 'MOD16-T1', 'Diagnose a solver instability warning caused by torsional releases.', 'In a 3D frame model (6 degrees of freedom per node), the engineer releases both major and minor bending (My, Mz) AND torsion (Mx) at BOTH ends of a secondary beam. The solver reports a "zero stiffness / mechanism warning in Rx". Why?', 'Consider rotational equilibrium of the 1D bar about its own longitudinal x-axis.', [
            'Releasing torsion Mx at both ends leaves the beam free to spin about its own longitudinal axis like a rolling pin with zero torsional restraint',
            'The beam is too heavy for the computer memory',
            'Releasing My and Mz deletes the vertical shear stiffness',
            'Young’s modulus E was set too high'
          ], 0, 'A 3D beam element must have torsional rotation Rx restrained at least at one end; releasing Mx at both ends creates a rigid-body rotational mechanism about the member axis.'),
          qMcq('MOD16-T1-Q5', 'MOD16-T1', 'Verify local axis orientation (beta angle) of columns in a 3D model.', 'Why must an engineer always visually inspect the rendered 3D section orientation or local axis triad of every column and beam before running design checks?', 'Compare major-axis Iyy vs minor-axis Izz of an I-section.', [
            'A 90-degree local-axis rotation error swaps the major and minor axes, which can change flexural stiffness and moment capacity by 300% to 800% without changing the stick-model line geometry',
            'Local axes only affect the colour of the plot on screen',
            'I-sections have identical stiffness in all directions',
            'Software automatically rotates columns to match architectural doors'
          ], 0, 'On a wireframe stick view, a column rotated by 90 degrees looks identical, yet bending about the minor axis has vastly lower stiffness and strength.')
        ]
      },
      {
        id: 'MOD16-T2',
        code: '16.2',
        title: 'Load Cases, Combinations, Offsets, Diaphragms, 2D/3D Models & Meshing',
        summary: 'Primary load cases vs combinations, superposition limits in non-linear P-Delta/tension-only models, rigid floor diaphragms, eccentric offsets, and 2D shell finite element meshing.',
        subtopics: [
          'Superposition rule: linear combinations vs direct non-linear/P-Delta/tension-only load combinations',
          'Rigid vs semi-rigid floor diaphragm constraints and how rigid diaphragms hide axial collector forces',
          '2D shell meshing: aspect ratios, singularities at point loads/columns, and wood-armer slab integration'
        ],
        futureContentNote: 'Future expansion slot for Wood-Armer twisting moment Mxy reinforcement integration in FE slabs.',
        assessmentQuestions: [
          qNum('MOD16-T2-Q1', 'MOD16-T2', 'Calculate parasitic bending moment induced by an eccentric member offset.', 'A bracing diagonal carrying an axial tension force N = 250 kN is modelled with a rigid end offset e = 120 mm (0.12 m) from the column-beam node centreline. Calculate the parasitic bending moment M_ecc = N * e introduced into the joint.', 'Use M_ecc = 250 * 0.12.', 30, 'kNm', 0.2, 'M_ecc = 250 kN * 0.12 m = 30.0 kNm.'),
          qNum('MOD16-T2-Q2', 'MOD16-T2', 'Calculate total applied floor load from area pressure to verify software load decomposition.', 'A rectangular floor bay measuring 12.0 m by 7.5 m is loaded with a 2D area patch load of 6.0 kPa. What must the total vertical load reported in the software’s Load Case Audit equal?', 'Use F_total = area * pressure = 12.0 * 7.5 * 6.0.', 540, 'kN', 1.0, 'Area = 12.0 * 7.5 = 90.0 m^2. Total vertical load = 90.0 * 6.0 = 540.0 kN (always check this in the solver table to ensure no area panel load was lost due to an unclosed polygon or wrong span direction).'),
          qMcq('MOD16-T2-Q3', 'MOD16-T2', 'Identify what a "master-slave rigid floor diaphragm" constraint hides in a 3D frame model.', 'When a modeller applies a "rigid horizontal diaphragm" constraint across all nodes of a floor level in a 3D steel frame, what important internal force is automatically suppressed (set to zero) in the beams lying within that floor plane?', 'Consider relative in-plane axial elongation between two nodes locked into a rigid body.', [
            'Axial tension and compression forces in the floor beams (including wind drag/collector tie forces and thermal restraint forces), because rigid diaphragm nodes cannot move relative to each other in plane',
            'Vertical shear force from gravity loads',
            'Major-axis bending moment under vertical UDL',
            'Column axial loads below the floor'
          ], 0, 'A rigid diaphragm locks relative in-plane distance between nodes, meaning floor beams report zero axial force even when acting as wind drag struts or bracing collectors.'),
          qMcq('MOD16-T2-Q4', 'MOD16-T2', 'Explain why linear superposition of individual load cases is invalid in a tension-only bracing or P-Delta analysis.', 'If a 3D model contains tension-only cross-bracing or second-order P-Delta effects, why is it invalid to run Dead, Live, and Wind as separate linear cases and simply add their factored results afterwards?', 'Consider member compression cut-off and stiffness dependence on axial load.', [
            'Because the active structural stiffness matrix changes depending on which braces go slack and how much vertical gravity load P is present simultaneously with lateral drift Delta',
            'Because computers cannot multiply by 1.35 and 1.50',
            'Because wind load only acts at night',
            'Linear superposition is always exact for buckling and slack cables'
          ], 0, 'In non-linear (tension-only or P-Delta) analysis, the stiffness depends on the combined load state; full factored combinations must be solved directly.'),
          qMcq('MOD16-T2-Q5', 'MOD16-T2', 'Interpret finite element stress singularities over point supports in 2D slab meshes.', 'In a 2D linear-elastic finite element plate model of a flat slab where columns are modelled as single point supports (pin nodes), what happens to the calculated hogging moment directly at the column node as the mesh size is refined smaller and smaller?', 'Recall the theoretical elasticity solution over a zero-area point support.', [
            'The elastic peak moment at the zero-area point node tends toward infinity (a mathematical singularity); practical design integrates moments over a realistic strip width or models the finite column/drop size',
            'The moment converges to zero',
            'The total reaction of the building changes by 50%',
            'The slab thickness doubles'
          ], 0, 'A concentrated reaction at a single node creates a theoretical stress singularity; engineers use finite column footprints/rigid links or integrate design moments across EC2 column strip widths.')
        ]
      },
      {
        id: 'MOD16-T3',
        code: '16.3',
        title: 'Model Warnings, Equilibrium Checks, Sensitivity & The 7 Mandatory Gate Questions',
        summary: 'Auditing reaction sums, order-of-magnitude deflection checks, sensitivity to boundary assumptions, and the syllabus’s 7 Mandatory Software Validation Questions.',
        subtopics: [
          'Global equilibrium check: sum of reactions vs sum of applied loads for every load case',
          'Sensitivity testing: bounding pinned vs fixed supports and cracked vs uncracked concrete stiffness',
          'The 7 Mandatory Validation Questions from the syllabus'
        ],
        futureContentNote: 'Future expansion slot for automated model audit checklists and QA verification sign-off templates.',
        assessmentQuestions: [
          qNum('MOD16-T3-Q1', 'MOD16-T3', 'Audit global vertical equilibrium of a software model.', 'A 3D building model has 4 floors, each 15 m x 20 m (300 m^2 per floor, 1200 m^2 total), loaded with an unfactored imposed load of 4.0 kPa. The software reaction table reports a total vertical reaction sum ofSigma_Fz = 3600 kN for the Imposed Load case. Calculate the missing vertical load (in kN) that failed to transfer to the supports.', 'Expected load = 1200 * 4.0 kN; subtract 3600 kN.', 1200, 'kN', 5.0, 'Expected total imposed load = 1200 m^2 * 4.0 kPa = 4800 kN. Reported reaction = 3600 kN. Missing load = 4800 - 3600 = 1200 kN (exactly one full floor of load is missing or unrestrained!).'),
          qNum('MOD16-T3-Q2', 'MOD16-T3', 'Audit global overturning equilibrium of a lateral wind load case.', 'A 12 m high frame (3 storeys of 4.0 m) has horizontal wind loads of 20 kN at Level 1 (z = 4 m), 40 kN at Level 2 (z = 8 m), and 30 kN at Roof (z = 12 m). Calculate the total global overturning moment about the base (z = 0 m) that the base reactions must resist.', 'Sum F_i * z_i.', 760, 'kNm', 1.0, 'M_ovt = (20 * 4) + (40 * 8) + (30 * 12) = 80 + 320 + 360 = 760.0 kNm.'),
          qMcq('MOD16-T3-Q3', 'MOD16-T3', 'Identify all 7 Mandatory Model Validation Questions required by the syllabus.', 'According to the course syllabus (Module 16), which of the following lists the 7 mandatory questions you must answer before trusting any structural analysis software model?', 'Recall the 7 questions from Module 16 of the syllabus.', [
            '(1) Do reactions sum to applied loads? (2) Are supports/releases physically buildable? (3) Does the deflected shape make physical sense? (4) Are moments/shears/axial forces in the hand-calculated range? (5) Which assumption is the model most sensitive to? (6) What failure mode is the software NOT checking? (7) Could someone build what I have modelled?',
            '(1) Is the screen 4K? (2) Is the plot in 3D? (3) Are utilization ratios below 0.99? (4) Did the solver finish in 2 seconds? (5) Are colours green? (6) Is the logo on the PDF? (7) Did I save the file?',
            'Only checking that no member is coloured red in the code-check post-processor',
            'Checking only self-weight reactions'
          ], 0, 'The 7 mandatory syllabus validation questions verify equilibrium, physical buildability of releases/supports, deflected shape, hand-calculation bounds, parameter sensitivity, unmodelled failure modes, and site constructability.'),
          qMcq('MOD16-T3-Q4', 'MOD16-T3', 'Answer Validation Question 6: "What failure mode is the software NOT checking?"', 'Even when a linear-elastic 3D frame program reports that all steel members have a strength utilization ratio below 0.85, which critical failure modes are frequently NOT checked automatically by a basic centreline stick model?', 'Consider local buckling, connection tear-out, construction stage instability, and bearing.', [
            'Connection bolt/weld failure, web crippling/bearing at supports, local buckling at notched ends, temporary instability during erection before decking is fixed, and foundation bearing failure',
            'Axial tension force F / A',
            'Simple Euler formula arithmetic',
            'Self-weight of the modelled steel elements'
          ], 0, 'Stick models check member cross-section/buckling rules based on assumed effective lengths, but cannot see local connection geometry, notches, bearing stiffener requirements, or temporary erection stability.'),
          qMcq('MOD16-T3-Q5', 'MOD16-T3', 'Diagnose a wildly unrealistic software deflection (e.g. 42,000 mm on a 6 m beam).', 'A 6 m steel beam in a frame model reports a vertical deflection of 42,500 mm (42.5 metres!) without crashing the solver. What is the most likely cause?', 'Consider near-mechanisms or unit mismatch in input parameters.', [
            'A partial mechanism (such as an unrestrained pin/roller or collinear internal hinges restrained only by tiny numerical dummy stiffness) or a gross units error in E, I, or load',
            'Normal elastic behaviour of S355 steel',
            'Shear deformation in a compact UB section',
            'Temperature change of 5 degrees Celsius'
          ], 0, 'Displacements of metres or kilometres in a linear elastic solver indicate either a near-mechanism (stabilised only by solver spring tolerance) or a 10^3 / 10^6 unit error.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD16-E01', 'MOD16-T1', 'Compare midspan deflection of a pinned-pinned vs fixed-fixed beam in a software model.', 'A uniform beam has simply supported midspan deflection delta_pinned = 5*w*L^4 / (384*E*I) = 25.0 mm. If the ends are accidentally modelled as fully fixed against rotation (delta_fixed = w*L^4 / (384*E*I)), what deflection will the software report?', 'Use delta_fixed = delta_pinned / 5.', 5, 'mm', 0.1, 'delta_fixed = 25.0 / 5 = 5.0 mm (a 500% unconservative underestimation of deflection if the real site connection is a simple fin plate!).'),
      qNum('MOD16-E02', 'MOD16-T1', 'Compare cantilever tip deflection when rotational base flexibility is neglected.', 'A 4.0 m high vertical post carries a lateral tip load such that elastic cantilever bending gives delta_bend = 12.0 mm assuming a 100% rigid base. If the foundation/baseplate actually rotates by theta_base = 0.0035 rad (3.5 mrad), calculate the total tip deflection delta_total = delta_bend + theta_base * L.', 'theta_base * L = 0.0035 * 4000 mm = 14.0 mm; add 12.0 mm.', 26, 'mm', 0.2, 'Base rotation contribution = 0.0035 * 4000 = 14.0 mm. Total tip deflection = 12.0 + 14.0 = 26.0 mm (more than double the rigid-base model prediction).'),
      qNum('MOD16-E03', 'MOD16-T1', 'Calculate rotational spring stiffness K_theta for a pinned vs nominal baseplate check.', 'A column base develops a bending moment M = 45 kNm at a base rotation theta = 0.005 rad. Calculate the secant rotational spring stiffness K_theta = M / theta (in kNm/rad).', 'Use K_theta = 45 / 0.005.', 9000, 'kNm/rad', 20, 'K_theta = 45 / 0.005 = 9000 kNm/rad.'),
      qNum('MOD16-E04', 'MOD16-T1', 'Quantify stiffness reduction of cracked vs uncracked RC sections in FE models.', 'An uncracked concrete beam has gross second moment of area I_gross = 4.0 x 10^9 mm^4. In accordance with EC2 serviceability/lateral drift modelling where cracked flexural stiffness is taken as 50% of gross stiffness, calculate I_eff (in 10^9 mm^4).', 'Use I_eff = 0.50 * 4.0.', 2, '10^9 mm^4', 0.05, 'I_eff = 0.50 * 4.0 = 2.0 x 10^9 mm^4 (ignoring cracking in RC models overestimates stiffness and underestimates deflections by ~100%).'),
      qNum('MOD16-E05', 'MOD16-T2', 'Verify total horizontal wind reaction in a 3D model audit.', 'A building elevation 30 m wide by 16 m high is loaded with a net wind pressure of 1.25 kPa. What must the sum of horizontal support reactions Sigma_Fx equal in the Wind X load case?', 'Use F_x = 30 * 16 * 1.25.', 600, 'kN', 1.0, 'Area = 30 * 16 = 480 m^2. Total horizontal wind force = 480 * 1.25 = 600.0 kN.'),
      qNum('MOD16-E06', 'MOD16-T2', 'Check tributary load on an internal secondary beam in a one-way deck model.', 'One-way composite floor decking spans 3.0 m between secondary beams of length 9.0 m. Under a total floor pressure of 8.0 kPa, what total vertical reaction sum (R_A + R_B) must an internal secondary beam transfer to the primary girders?', 'Tributary width = 3.0 m, length = 9.0 m, pressure = 8.0 kPa.', 216, 'kN', 0.5, 'Line load w = 8.0 * 3.0 = 24.0 kN/m. Total beam load = 24.0 * 9.0 = 216.0 kN.'),
      qNum('MOD16-E07', 'MOD16-T2', 'Calculate Wood-Armer design moment M_x* in a 2D FE slab element.', 'At a node in a 2D finite element slab model, the bottom sagging moments per unit width are M_x = +42 kNm/m, M_y = +28 kNm/m, and twisting moment is M_xy = 15 kNm/m. Using the basic Wood-Armer equation M_x* = M_x + |M_xy|, calculate the required bottom reinforcement design moment M_x* in the x-direction.', 'Use M_x* = 42 + 15.', 57, 'kNm/m', 0.5, 'M_x* = 42 + |15| = 57.0 kNm/m (ignoring twisting moment M_xy in a 2D FE slab plot is unconservative!).'),
      qNum('MOD16-E08', 'MOD16-T3', 'Check hand-bound bracket for an internal continuous beam span.', 'A 7.5 m span beam in a frame model carries a factored UDL w = 32 kN/m. Calculate the simply supported free moment M_0 = w * L^2 / 8 which serves as the absolute static equilibrium height (M_sag + M_hog_avg) for checking the software output.', 'Use M_0 = 32 * 7.5^2 / 8.', 225, 'kNm', 1.0, 'M_0 = 32 * 56.25 / 8 = 225.0 kNm. In the software output, the midspan sagging moment plus the average of the two end hogging moments MUST equal 225.0 kNm.'),
      qNum('MOD16-E09', 'MOD16-T3', 'Verify static moment height from software output values.', 'For a beam span with free moment M_0 = 225 kNm, the software reports left support hogging M_L = 90 kNm and right support hogging M_R = 110 kNm (average hogging = 100 kNm). What midspan sagging moment must the software report if no intermediate loads are missing?', 'Use M_sag = M_0 - 0.5 * (M_L + M_R).', 125, 'kNm', 0.5, 'Average support hogging = (90 + 110) / 2 = 100 kNm. Therefore midspan sagging = 225 - 100 = 125.0 kNm.'),
      qNum('MOD16-E10', 'MOD16-T3', 'Check axial load takedown in a ground-floor column against tributary area hand estimate.', 'An internal column supports 5 identical floors, each with tributary area 36 m^2 and total factored ULS floor load 12.5 kPa. Calculate the hand-estimated ULS axial compression force at the base of the column.', 'Use N_Ed = 5 * 36 * 12.5.', 2250, 'kN', 5.0, 'Load per floor = 36 * 12.5 = 450 kN. Over 5 floors, N_Ed = 5 * 450 = 2250.0 kN.'),
      qMcq('MOD16-E11', 'MOD16-T1', 'Explain the danger of leaving default "fully fixed" member end conditions on all steel beams in a 3D frame.', 'Many 3D structural analysis programs default new beam elements to rigidly fixed ends (continuous moment connections). What happens if a designer models a braced steel frame with default rigid joints, but details simple fin-plate connections on the drawings?', 'Compare the model’s load path with the physical building.', [
            'The model relies on non-existent moment frame action for lateral stability and underestimates beam midspan sagging moments and deflections, while the real building has pinned joints that may lack stability or overstress the beams',
            'The beams become 50% stronger on site',
            'Fin plates automatically turn into full-penetration butt welds on site',
            'Nothing changes because end releases only affect timber'
          ], 0, 'Every member release in the analytical model must match the connection detail shown on the structural drawings.'),
      qMcq('MOD16-E12', 'MOD16-T1', 'Identify what happens when two nodes are accidentally created 2 mm apart without merging.', 'In a 3D model imported from CAD, a secondary beam stops 2 mm short of the primary girder centreline so the nodes are not merged. What happens when the model is analysed?', 'Consider connectivity across disconnected nodes.', [
            'No load is transferred from the secondary beam to the primary girder; the beam either cantilevers wildly or triggers a mechanism error',
            'The software welds the 2 mm gap using Bluetooth',
            'The primary girder receives double the load',
            'The concrete strength increases'
          ], 0, 'Finite element and frame solvers only transfer force through shared nodes, intersecting split elements, or explicit rigid/master-slave links. Unmerged CAD tolerance gaps break the load path.'),
      qMcq('MOD16-E13', 'MOD16-T2', 'Explain why Wood-Armer or Denton-Burgoyne moments are required when designing reinforcement from 2D FE slab models.', 'Why is it unsafe to design orthogonal x and y slab reinforcement solely for the principal bending moments M_x and M_y from a 2D finite element plate model while ignoring the twisting moment M_xy?', 'Consider equilibrium on a crack inclined to the reinforcement grid.', [
            'Because orthogonal reinforcement along x and y must resist both the normal moments (M_x, M_y) and the twisting shear moment (M_xy); ignoring M_xy leaves principal diagonal moments under-reinforced',
            'Because M_xy is measured in kilograms',
            'Because FE slabs have zero thickness',
            'Because twisting moments only occur in timber'
          ], 0, 'Principal moments act at an angle to the orthogonal bar grid; Wood-Armer resolves M_x, M_y, and M_xy into safe orthogonal design moments M_x* and M_y*.'),
      qMcq('MOD16-E14', 'MOD16-T2', 'Identify when a 2D planar frame model is insufficient and a 3D model (or torsional hand calculation) is needed.', 'For which building configuration is a single 2D planar frame analysis insufficient on its own to capture the true lateral load behaviour?', 'Consider asymmetry between centre of mass/wind and centre of stiffness.', [
            'A building with an eccentric RC core in one corner where lateral wind load induces global plan torsion across all perimeter frames',
            'A perfectly regular rectangular shed with identical braced bays on both sides',
            'A single simply supported timber joist',
            'A concentric axially loaded stub column'
          ], 0, 'Plan asymmetry between the line of action of lateral loads and the centre of lateral stiffness creates plan torsion that couples frames in 3D.'),
      qMcq('MOD16-E15', 'MOD16-T3', 'Explain Validation Question 5: "Which assumption is the model most sensitive to?"', 'How should an engineer handle a boundary condition (such as foundation rotational stiffness or connection semi-rigidity) whose exact value is uncertain?', 'Consider upper- and lower-bound sensitivity runs.', [
            'Run upper-bound and lower-bound sensitivity analyses (e.g. pinned base vs stiff spring base) and design the structure and foundations to be safe across the credible range of stiffnesses',
            'Guess a single number to 6 decimal places and never vary it',
            'Set all stiffnesses to infinity',
            'Delete the foundations from the model'
          ], 0, 'Bounding uncertain parameters (e.g. pinned vs fixed, cracked vs uncracked, stiff vs soft soil) reveals which elements are sensitive and ensures safe design across both bounds.'),
      qMcq('MOD16-E16', 'MOD16-T3', 'Interpret an "ill-conditioned stiffness matrix" warning.', 'What does an "ill-conditioned stiffness matrix" or "large diagonal decay ratio" solver warning indicate?', 'Consider extreme stiffness contrasts or near-mechanisms.', [
            'A huge disparity in stiffness between adjacent elements (e.g. an artificially rigid link 10^8 times stiffer than a beam) or a structure on the verge of a geometric mechanism, causing severe numerical round-off error',
            'The computer monitor needs calibration',
            'The concrete grade is C30/37',
            'The load combination factor is 1.35'
          ], 0, 'Extreme stiffness ratios or near-mechanisms cause loss of numerical precision when inverting/factorising the global stiffness matrix.'),
      qMcq('MOD16-E17', 'MOD16-T2', 'Check automatic self-weight status in a software load case.', 'What is one of the most common errors when setting up the Permanent (Dead) Load case in structural analysis software?', 'Consider whether self-weight gravity multiplier (-1.0g in Z) is turned on, turned off, or applied twice.', [
            'Either forgetting to activate the self-weight gravity multiplier (omitting member weight entirely) or activating it while also manually applying member self-weights (double-counting)',
            'Self-weight always acts horizontally along the X-axis',
            'Steel has zero density in all software libraries',
            'Self-weight only applies to wind load cases'
          ], 0, 'Checking the Permanent Load reaction sum against a manual tonnage/volume estimate immediately catches omitted or double-counted self-weight.'),
      qMcq('MOD16-E18', 'MOD16-T1', 'Verify effective buckling length factors (L_cr / L) in automated code-check post-processors.', 'Why is accepting a software post-processor’s default effective length factor of 1.0 * L_element for every member dangerous?', 'Consider physical restraint vs mesh subdivision.', [
            'If a physical 8 m column is split into four 2 m finite elements, a default of 1.0 * L_element checks buckling over 2 m instead of 8 m (or conversely underestimates unbraced cantilevers where L_cr = 2.0 * L)',
            'Because 1.0 * L is always too conservative for cantilevers',
            'Because effective length has no effect on column buckling or LTB',
            'Because software automatically reads site erection drawings'
          ], 0, 'Subdividing a member at intermediate nodes reduces the element length L_el; unless the physical unbraced restraint spacing is assigned, buckling capacity will be grossly overestimated.'),
      qMcq('MOD16-E19', 'MOD16-T3', 'Evaluate graphical deflected shape discontinuities.', 'While inspecting the exaggerated deflected shape of a floor grillage under gravity load, you notice one secondary beam remains completely flat at zero deflection while the slab and adjacent beams deflect by 18 mm. What does this tell you immediately?', 'Use visual deflected-shape debugging.', [
            'Either the floor load was not applied/decomposed onto that beam, or intermediate nodes along that beam were accidentally restrained as vertical supports',
            'That beam is made of magic zero-deflection steel',
            'The adjacent beams have failed',
            'The deflected shape plot is irrelevant'
          ], 0, 'Visual inspection of the deflected shape is the fastest way to spot accidental nodal restraints, disconnected members, or missed load assignments.'),
      qMcq('MOD16-E20', 'MOD16-T3', 'Pass the Module 16 Learning Gate: Never accept a software model without passing all 7 validation questions.', 'Why is a 1-page hand-calculation validation summary mandatory alongside any structural software output in a professional calculation package?', 'Synthesise engineering accountability and model verification.', [
            'Because the engineer—not the software vendor—is legally and professionally responsible for the design; independent hand bounds on reactions, equilibrium, moments, and stability prove the model reflects physical reality',
            'To make the PDF file larger',
            'Because building control officers do not know what computers are',
            'To avoid drawing structural details'
          ], 0, 'Software is a calculator, not an engineer. Hand equilibrium and bounding checks prove that the model’s geometry, loads, and boundary conditions are trustworthy.')
    ]
  },
  {
    id: 'MOD-17',
    moduleNumber: 17,
    title: 'Design Detailing, Drawings and Construction Interface',
    shortTitle: 'Detailing, Drawings & Interface',
    summary: 'General arrangement (GA) drawings, member schedules, connection and reinforcement detailing, tolerances, movement joints, erection sequence, temporary stability, RFIs, and making calculation assumptions come true on drawings.',
    whyItMatters: 'Contractors do not build your calculations; they build your drawings and schedules. If a critical assumption in your calculation (such as a bracing bay, bearing length, or restraint) is missing from the drawings, it will not exist on site.',
    objectives: [
      'Read and produce clear General Arrangement (GA) drawings, steel/timber schedules, and RC bar bending/reinforcement details.',
      'Detail realistic construction tolerances, minimum bearing lengths, movement joints, and safe erection sequences.',
      'Manage architecture and MEP coordination interfaces (service penetrations, slab drops, facade brackets, RFIs, and hold points).',
      'Audit drawings against calculations so that every assumed restraint, release, grade, and camber is explicitly communicated.'
    ],
    learningGate: 'Audit a calculation against its drawing and confirm that every assumption in the calculation is made true by the drawing.',
    WorkedExamples: [
      {
        id: 'EX-17.1',
        title: 'Exercise 17.1: Calculation-to-Drawing Audit & Precast/Lifting Interface Check ([UI1])',
        brief: 'Cross-check a structural calculation package against a General Arrangement drawing and precast stair/plank installation interface, identifying missing restraints, bearing tolerances, and lifting/temporary propping hold points.',
        checklist: [
          'Verify material grades (e.g. S355 vs S275, C32/40 vs C25/30, bolt class 8.8), camber, and connection fixity assumptions on the GA.',
          'Check precast plank minimum end bearing length after deducting construction tolerances and spalling allowance.',
          'Verify lifting insert checks (dynamic amplification, sling angle increase in tension, early-age concrete pull-out strength) and temporary propping hold points.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD17-T1',
        code: '17.1',
        title: 'GA Drawings, Member Schedules, Connection, Reinforcement & Timber Details',
        summary: 'General Arrangement plans/sections/elevations, gridlines, levels (SSL vs FFL), steel connection coding, RC curtailment/lap detailing, and timber bearing/fastener notes.',
        subtopics: [
          'GA clarity: Structural Slab Level (SSL) vs Finished Floor Level (FFL), grid dimensions, and stability bracing bays',
          'Communicating connection forces (shear, axial tie force, moment) clearly to the steelwork fabricator',
          'Reinforcement congestion prevention at beam-column junctions and cranked laps'
        ],
        futureContentNote: 'Future expansion slot for BS 8666 reinforcement shape codes and SCI green-book connection force schedules.',
        assessmentQuestions: [
          qNum('MOD17-T1-Q1', 'MOD17-T1', 'Calculate Structural Slab Level (SSL) from Finished Floor Level (FFL) and screed/finish build-up.', 'An architectural drawing specifies First Floor Finished Floor Level (FFL) as +14.250 m AOD. If the floor finish and insulation/screed zone is 115 mm (0.115 m) thick above the structural concrete slab, calculate the top-of-concrete Structural Slab Level (SSL).', 'Use SSL = FFL - 0.115.', 14.135, 'm AOD', 0.002, 'SSL = 14.250 - 0.115 = +14.135 m AOD.'),
          qNum('MOD17-T1-Q2', 'MOD17-T1', 'Calculate Top of Steelwork (TOS) level beneath a composite deck.', 'The finished concrete top of a 130 mm deep composite metal deck slab is at +18.500 m AOD. If the steel beam top flange sits directly beneath the 130 mm slab (with zero haunch), calculate the Top of Steel (TOS) level.', 'Use TOS = 18.500 - 0.130.', 18.37, 'm AOD', 0.002, 'TOS = 18.500 - 0.130 = +18.370 m AOD.'),
          qNum('MOD17-T1-Q3', 'MOD17-T1', 'Check minimum structural robustness tie force communicated on a steel GA.', 'Under UK Building Regulations / Eurocode robustness rules, an internal floor beam must be tied for a minimum horizontal robustness tie force of 75 kN (or 0.5 * W_f if greater). If the beam’s factored ULS vertical end shear reaction is 180 kN and the tie requirement is 0.5 * 180 kN, calculate the axial tie force N_tie that must be stated on the connection schedule.', 'Use N_tie = 0.5 * 180 (since 90 kN > 75 kN).', 90, 'kN', 0.5, 'N_tie = 0.5 * 180 = 90.0 kN (exceeding the 75 kN minimum).'),
          qMcq('MOD17-T1-Q4', 'MOD17-T1', 'Identify why beam-column RC junctions fail buildability on site when top bars are in the same plane.', 'An orthogonal RC perimeter beam and an internal RC beam of identical depth 500 mm and identical cover 30 mm both frame into the same column. If both beams are detailed with their top main bars at the exact same vertical level (h - 35 mm), what happens on site?', 'Visualise two perpendicular layers of H25 bars trying to occupy the same space inside the column head.', [
            'The two orthogonal layers of top bars clash physically inside the column cage; the steel fixer is forced to push one layer down (reducing effective depth d) or bend bars out of position',
            'The bars pass through each other like ghosts',
            'The concrete strength doubles',
            'No links are needed in the column'
          ], 0, 'Orthogonal intersecting beams must be detailed with layered effective depths (e.g. d_1 and d_2 differed by one bar diameter) so bars pass cleanly over/under each other.'),
          qMcq('MOD17-T1-Q5', 'MOD17-T1', 'Explain what happens if a calculation assumes a rigid moment connection, but the GA drawing shows no moment symbol or connection forces.', 'In the UK, steelwork fabricators typically design connections from the engineer’s GA drawings. What happens if your frame analysis relies on a rigid portal joint at Grid B3, but your GA drawing does not show a moment-connection symbol or state the design moment M_Ed?', 'Consider standard fabricator practice for unlabelled beam-to-column joints.', [
            'The fabricator will detail a standard nominal simple shear connection (e.g. a fin plate or flexible end plate) that cannot resist the moment, invalidating the frame stability and deflection design',
            'The fabricator will automatically read the engineer’s mind and provide a full-strength haunched moment weld',
            'Simple fin plates can carry 500 kNm of moment without rotation',
            'The column will not need a baseplate'
          ], 0, 'Unless moment connections and their explicit M, V, N forces (or required rotational stiffness) are scheduled on the GA, the fabricator will provide a pinned simple connection.')
        ]
      },
      {
        id: 'MOD17-T2',
        code: '17.2',
        title: 'Tolerances, Bearings, Movement Joints, Erection Sequence & Temporary Stability',
        summary: 'Precast and masonry bearing lengths after tolerances [UI1], lifting sling angle amplification [UI1], thermal/shrinkage movement joints, and temporary erection bracing.',
        subtopics: [
          'Effective bearing length: deducting spalling distance and setting-out/manufacturing tolerances from nominal bearing',
          'Lifting and handling checks [UI1]: sling angle factor 1/cos(theta), dynamic amplification factor, and early-age strength',
          'Erection sequence: why an unbraced steel or precast frame is unstable until the stability core/bracing bay is erected first'
        ],
        futureContentNote: 'Future expansion slot for BS 5606 / National Structural Steelwork Specification (NSSS) tolerance tables and EC2 Clause 10.9.5.2 precast bearing design.',
        assessmentQuestions: [
          qNum('MOD17-T2-Q1', 'MOD17-T2', 'Calculate net effective bearing length of a precast concrete floor plank after tolerances ([UI1]).', 'A precast hollowcore floor plank is detailed with a nominal bearing length a_nom = 100 mm on a supporting steel shelf angle. After deducting 15 mm for edge spalling/chamfer at the support and 20 mm for combined construction setting-out and plank length tolerances, calculate the net effective bearing length a_eff remaining to carry the bearing stress.', 'Use a_eff = 100 - 15 - 20.', 65, 'mm', 0.5, 'a_eff = 100 - 15 - 20 = 65.0 mm (highlighting why tiny 50 mm nominal bearings on site can leave almost zero effective bearing after realistic tolerances!).'),
          qNum('MOD17-T2-Q2', 'MOD17-T2', 'Calculate lifting sling tension amplification due to sling angle ([UI1]).', 'A precast concrete beam of mass 6.0 tonnes (static weight W = 60 kN) is lifted by a two-leg crane chain sling with a dynamic lifting amplification factor psi_dyn = 1.30 (total factored vertical lift load = 78 kN). Each of the two sling legs is inclined at 60 degrees to the vertical (so cos 60 deg = 0.50). Calculate the axial tension force T in EACH sling leg.', 'Vertical share per leg = 78 / 2 = 39 kN; divide by cos(60 deg) = 0.50.', 78, 'kN', 0.5, 'Factored vertical load per leg = (60 * 1.30) / 2 = 39.0 kN. Sling tension T = 39.0 / cos(60 deg) = 39.0 / 0.50 = 78.0 kN (at 60 deg from vertical, each sling leg carries the ENTIRE factored weight of the unit, and induces a horizontal compression force of 39*tan(60)=67.5 kN into the beam!).'),
          qNum('MOD17-T2-Q3', 'MOD17-T2', 'Calculate unrestrained thermal expansion over a long steel roof run.', 'A 60 m long steel roof structure experiences a seasonal temperature range delta_T = 40 degC. Taking the coefficient of linear thermal expansion of steel as alpha = 12 x 10^-6 /degC, calculate the free horizontal thermal movement delta_L (in mm).', 'Use delta_L = alpha * L * delta_T.', 28.8, 'mm', 0.2, 'delta_L = 12e-6 * 60,000 mm * 40 = 28.8 mm.'),
          qMcq('MOD17-T2-Q4', 'MOD17-T2', 'Explain why the permanent stability system is often not active during erection.', 'A 4-storey steel frame relies on a composite concrete floor diaphragm to transfer wind loads horizontally to an RC lift core at one end of the building. Why is the bare steelwork frame at risk of collapse during erection before the concrete floor slabs are poured?', 'Trace the horizontal wind load path when only bare steel beams and ungrouted metal decking exist.', [
            'Before the concrete is poured and cured (or before decking is fully shear-stud welded/fixed as a diaphragm), there is no rigid floor diaphragm to connect the remote steel bays to the core; temporary plan bracing and erection guys/braced bays are required',
            'Wind never blows on construction sites before handover',
            'A single holding-down bolt per column makes a 4-storey frame fully fixed',
            'Steel beams have zero wind area'
          ], 0, 'Every stage of erection must have a complete, self-stable 3D load path. Erection should start from a braced stability bay, with temporary plan/vertical bracing until permanent diaphragms are active.'),
          qMcq('MOD17-T2-Q5', 'MOD17-T2', 'Identify the cantilever overhang hazard when lifting a precast beam inward from its ends ([UI1]).', 'A precast beam designed only as a simply supported sagging member (with heavy bottom steel and minimal nominal top steel) is lifted on site using two crane lifting points located 2.0 m inboard from each end. What structural hazard must be checked?', 'Draw the bending moment diagram during lifting.', [
            'The 2.0 m overhanging ends act as cantilevers under self-weight (and dynamic jerk), inducing top-face hogging tension when the precast concrete is still at early age',
            'Lifting inboard reduces top tension to zero',
            'The beam is in pure axial tension during lifting',
            'Concrete cannot crack while suspended from a crane'
          ], 0, 'Lifting points inboard from the ends change the static scheme from a single span to a double-cantilevered beam, putting the top face into hogging tension at early concrete age.')
        ]
      },
      {
        id: 'MOD17-T3',
        code: '17.3',
        title: 'Architecture/MEP Interfaces, RFIs, Design Changes, Hold Points & Drawing Audit',
        summary: 'Service penetrations through beams and slabs, facade bracket eccentricities, RFI handling, temporary works Hold Points (Permit to Load / Strike), and calculation-to-drawing audits.',
        subtopics: [
          'MEP penetrations: why web holes near supports (high shear) are far more critical than small holes at midspan (low shear, near neutral axis)',
          'Technical RFIs and Site Non-Conformances (NCRs): re-checking load path impact before approving site variations',
          'Construction Hold Points: reinforcement inspection before pour, cube strength before striking, and temporary works sign-off'
        ],
        futureContentNote: 'Future expansion slot for SCI P355 web openings in composite beams and trimmers around slab risers.',
        assessmentQuestions: [
          qNum('MOD17-T3-Q1', 'MOD17-T3', 'Evaluate remaining shear area of a steel beam web pierced by an unreinforced circular MEP duct hole.', 'A UB section has web thickness t_w = 10.0 mm and overall depth between fillets d_w = 450 mm (gross web shear area = 4500 mm^2). If an MEP contractor proposes cutting a 200 mm diameter circular duct opening through the web, calculate the net vertical web shear area A_v,net remaining at the centreline of the hole.', 'Use A_v,net = (d_w - D_hole) * t_w.', 2500, 'mm^2', 10, 'A_v,net = (450 - 200) * 10.0 = 2500 mm^2 (a 44.4% loss of shear area, plus secondary Vierendeel bending across the top and bottom tees of the opening!).'),
          qNum('MOD17-T3-Q2', 'MOD17-T3', 'Calculate torsional moment induced on a perimeter spandrel beam by an eccentric facade brick-support bracket.', 'Heavy masonry cladding weighing w_facade = 14 kN/m is supported on an outrigged bracket at a horizontal eccentricity e = 250 mm (0.25 m) from the shear centre of a perimeter steel edge beam. Calculate the uniform torque t_Ed (in kNm/m) applied along the perimeter beam.', 'Use t_Ed = w_facade * e.', 3.5, 'kNm/m', 0.05, 't_Ed = 14 kN/m * 0.25 m = 3.50 kNm/m (open I-sections are weak in torsion and will twist severely unless restrained by the floor slab or detailed with a closed RHS/kick-brace back to the soffit!).'),
          qMcq('MOD17-T3-Q3', 'MOD17-T3', 'Determine the safest location for a small unreinforced service hole in a simply supported beam web.', 'If an MEP pipe must pass through the web of a simply supported uniformly loaded beam, where along the span and depth is the least damaging location?', 'Consider where shear force V(x) is lowest and where bending normal stress sigma(y) is near zero.', [
            'Near midspan (where vertical shear force V is near zero) and on the mid-depth neutral axis (where longitudinal bending stress is near zero)',
            'Right next to the support bearing (maximum shear) and cut through the bottom tension flange (maximum tension)',
            'Cut through the top compression flange at midspan',
            'Through the column shear connection bolts'
          ], 0, 'At midspan of a UDL-loaded beam, shear V is minimal (limiting Vierendeel bending across the opening), and at mid-depth along the neutral axis, bending strains are minimal.'),
          qMcq('MOD17-T3-Q4', 'MOD17-T3', 'Evaluate a site RFI requesting a late slab opening right next to a flat-slab column.', 'During site construction, the M&E contractor submits an RFI asking to form a 400 mm x 400 mm vertical drainage riser opening immediately against the face of an internal RC flat-slab column. Why must the structural engineer refuse or redesign this location?', 'Consider the basic punching shear perimeter u_0 and u_1 around a flat-slab column.', [
            'An opening directly against the column face cuts away a large sector of the critical punching shear perimeter, drastically reducing punching shear capacity and risking sudden brittle slab collapse',
            'Holes next to columns increase punching shear strength',
            'Flat slabs have zero shear near columns',
            'Drainage pipes carry the column load'
          ], 0, 'Openings within 6d of a flat-slab column project radially to reduce the effective control perimeter u_1 and amplify unbalanced moment transfer.'),
          qMcq('MOD17-T3-Q5', 'MOD17-T3', 'Define the purpose of a formal Construction Hold Point on a structural drawing.', 'What is a "Hold Point" on a structural or temporary works drawing (for example: "HOLD POINT: Do not tension anchors / strike falsework until concrete cube strength >= 25 MPa is verified by the TWC")?', 'Consider quality assurance and safety-critical sequencing.', [
            'A mandatory stage in construction beyond which work must not proceed without documented inspection, test verification, or written sign-off by the designated competent person',
            'A suggestion that the contractor can ignore if behind programme',
            'A place on site to park mobile cranes',
            'An architectural paint specification'
          ], 0, 'Hold points prevent safety-critical irreversible actions (pouring concrete over uninspected rebar, striking props on green concrete, cutting a loadbearing wall before needles are jacked) until verified.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD17-E01', 'MOD17-T1', 'Calculate underside of steel baseplate (grout pocket top) level from column schedule.', 'Top of foundation concrete pad is at +9.450 m AOD. If a 50 mm nominal non-shrink grout bed is specified beneath the column baseplate, what is the Underside of Baseplate (USB) level?', 'Use USB = 9.450 + 0.050.', 9.5, 'm AOD', 0.002, 'USB = 9.450 + 0.050 = +9.500 m AOD.'),
      qNum('MOD17-E02', 'MOD17-T1', 'Calculate total length of an L-bar (Shape Code 11) reinforcement bar approximation.', 'A simplified preliminary bar estimate adds legs A = 600 mm and B = 2400 mm (ignoring bend deduction). Calculate the approximate cut length A + B.', 'Sum 600 + 2400.', 3000, 'mm', 5.0, 'Approximate length = 600 + 2400 = 3000 mm.'),
      qNum('MOD17-E03', 'MOD17-T1', 'Check clear spacing between parallel reinforcing bars in a beam.', 'A 300 mm wide RC beam has 35 mm nominal cover to 10 mm links on both sides, and contains 4 main H25 bars in a single horizontal layer. Calculate the clear horizontal gap s_clear between adjacent H25 bars.', 'Internal width inside links = 300 - 2*(35 + 10) = 210 mm; subtract 4*25 = 100 mm; divide by 3 gaps.', 36.7, 'mm', 0.5, 'Width inside links = 300 - 90 = 210 mm. Remaining space after 4*25 mm bars = 210 - 100 = 110 mm. Across 3 gaps, s_clear = 110 / 3 = 36.7 mm (which exceeds max(d_bar=25, d_g+5=25, 20 mm), so concrete can be compacted cleanly!).'),
      qNum('MOD17-E04', 'MOD17-T2', 'Calculate net effective bearing length of a steel beam on a masonry padstone.', 'A steel beam has a nominal seating length of 150 mm on a concrete padstone. After deducting a 20 mm front edge chamfer/spalling allowance and a 15 mm erection tolerance, calculate the net effective bearing length.', 'Use a_eff = 150 - 20 - 15.', 115, 'mm', 0.5, 'a_eff = 150 - 20 - 15 = 115.0 mm.'),
      qNum('MOD17-E05', 'MOD17-T2', 'Calculate horizontal compression induced in a lifted precast unit by inclined slings ([UI1]).', 'A precast lintel is lifted by a two-leg sling where each leg carries a vertical load component V_leg = 25 kN at an angle of 45 degrees to the vertical (tan 45 deg = 1.0). Calculate the horizontal compression force H_comp = V_leg * tan(45 deg) induced into the precast unit between the lifting hooks.', 'Use H_comp = 25 * 1.0.', 25, 'kN', 0.2, 'H_comp = 25 * tan(45 deg) = 25.0 kN (which is why spreader beams are used when slender units cannot resist sling-induced compression!).'),
      qNum('MOD17-E06', 'MOD17-T2', 'Calculate crane radius overturning moment check awareness ([UI1]).', 'A mobile crane lifts a total hook load (precast unit + rigging + hook block) of W = 80 kN at a horizontal operating radius R = 18.0 m from the crane slewing centre. Calculate the gross load moment M_load = W * R.', 'Use M_load = 80 * 18.0.', 1440, 'kNm', 5.0, 'M_load = 80 kN * 18.0 m = 1440.0 kNm.'),
      qNum('MOD17-E07', 'MOD17-T2', 'Calculate maximum outrigger mat ground bearing pressure under a crane outrigger ([UI1]).', 'During a heavy lift, the maximum vertical reaction on a single crane outrigger jack is P_jack = 360 kN. If the outrigger sits on a stiff timber/steel spreader mat of plan dimensions 1.5 m x 1.5 m (area A = 2.25 m^2) distributing load uniformly, calculate the ground bearing pressure q_mat.', 'Use q_mat = 360 / 2.25.', 160, 'kPa', 1.0, 'q_mat = 360 kN / 2.25 m^2 = 160.0 kPa.'),
      qNum('MOD17-E08', 'MOD17-T3', 'Calculate secondary Vierendeel shear moment across a rectangular web opening.', 'A rectangular service opening of length L_o = 400 mm (0.40 m) is cut at the mid-depth of a steel beam web where the global vertical shear force is V_Ed = 90 kN. Assuming the top and bottom tees share the shear equally and points of contraflexure occur at mid-length of the opening, calculate the total secondary Vierendeel moment M_vier = V_Ed * (L_o / 2) developed across the opening ends.', 'Use M_vier = 90 * 0.20.', 18, 'kNm', 0.2, 'Each tee carries V_Ed / 2 = 45 kN over lever arm L_o / 2 = 0.20 m (giving 9.0 kNm per tee, or 18.0 kNm total Vierendeel moment across the opening ends).'),
      qNum('MOD17-E09', 'MOD17-T3', 'Calculate reduction in punching shear perimeter due to a service opening near a column.', 'An internal column has a basic control perimeter u_1 = 4200 mm. A service opening near the column subtends a radial projection width of 550 mm across the control perimeter. Calculate the reduced effective control perimeter u_1,red.', 'Use u_1,red = 4200 - 550.', 3650, 'mm', 5.0, 'u_1,red = 4200 - 550 = 3650 mm.'),
      qMcq('MOD17-E10', 'MOD17-T1', 'Explain why pre-cambering must be clearly specified with direction and stage on steel drawings.', 'A long-span composite steel floor beam is designed with a 35 mm upward workshop pre-camber to offset wet-concrete dead-load deflection. What happens if the drawing fails to state that the 35 mm is an UPWARD fabrication camber prior to pouring concrete?', 'Consider misinterpretation in the workshop or on site.', [
            'The beam could be omitted from cambering (leaving a 35 mm ponding dip in the floor), installed upside-down, or concreted to a constant thickness vs constant level without coordination',
            'Steel beams camber themselves upward after delivery',
            'Camber has no effect on floor flatness or ponding',
            '35 mm camber doubles the yield strength of steel'
          ], 0, 'Pre-camber notes must explicitly state upward camber magnitude at midspan, datum condition (unloaded in shop), and whether concrete is poured to constant slab thickness or laser-levelled datum.'),
      qMcq('MOD17-E11', 'MOD17-T1', 'Identify why slotted holes in bracing or movement connections need explicit bolt-tightening notes.', 'An expansion joint on a drawing shows "M20 bolts in 22 x 40 mm long slotted holes to allow thermal movement". What critical installation note must accompany this detail?', 'Consider what happens if a site erector torques a high-strength bolt fully tight across a movement slot.', [
            'A note specifying shoulder bolts / locknuts or "tighten to snug and back off half a turn / threads burred" with low-friction washers so the joint can actually slide instead of being clamped solid',
            'Weld the washer to the slot on site after erection',
            'Preload with HSFG bolts to 170 kN clamping force',
            'Fill the slot with structural epoxy'
          ], 0, 'If a sliding movement joint is fully torqued or painted/welded shut on site, thermal movement is locked up and induces large unintended horizontal forces.'),
      qMcq('MOD17-E12', 'MOD17-T2', 'Explain why precast concrete stairs and hollowcore units often require temporary propping or sequence notes.', 'A precast concrete stair flight or landing is detailed to bear onto an in-situ concrete edge strip or grouted dowel joint. Why must the drawing identify temporary propping requirements until the grout/in-situ stitch reaches specified strength?', 'Compare dry erection state vs composite permanent state.', [
            'During initial crane placement, dry ungrouted bearings or wet stitch joints have zero tensile/rotational capacity and reduced bearing area until the structural grout/concrete cures',
            'Precast concrete has zero weight until grouted',
            'Cranes stay attached to every stair for 28 days',
            'Grout reaches 50 MPa in 3 seconds'
          ], 0, 'Temporary works propping must support precast elements whose permanent load path relies on wet in-situ stitches or cured structural mortar beds.'),
      qMcq('MOD17-E13', 'MOD17-T2', 'Identify the hazard of placing crane outriggers directly above buried drainage or basement vaults ([UI1]).', 'Before approving a mobile crane lifting plan on a congested urban site, why must the engineer check for buried cellars, brick arches, manholes, and shallow utility trenches beneath the proposed outrigger positions?', 'Consider concentrated outrigger load vs shallow underground voids.', [
            'A single crane outrigger can apply 200 to 800+ kN; punching through an unrecorded cellar vault or collapsing a shallow trench causes immediate crane overturning',
            'Underground voids increase bearing capacity',
            'Outriggers only carry tension',
            'Timber mats make underground vaults infinitely strong'
          ], 0, 'Outrigger punching into buried voids/services is one of the primary causes of catastrophic mobile crane overturning.'),
      qMcq('MOD17-E14', 'MOD17-T2', 'Explain why erection of a braced steel building must begin at a braced bay.', 'Why do the National Structural Steelwork Specification and safe erection method statements require steel erection to start by assembling and plumbing a fully braced box bay first?', 'Consider 3D stability of columns on two/four holding-down bolts.', [
            'Individual columns on nominal holding-down bolts have minimal overturning resistance; assembling a complete braced box bay creates a stable 3D nucleus from which subsequent bays can be tied and stabilised progressively',
            'Because cranes can only lift diagonal members on Monday',
            'To use up all the bolts first',
            'Because unbraced frames never collapse in wind'
          ], 0, 'A completed braced box bay provides an immediately stable 3D reference structure to restrain progressive erection.'),
      qMcq('MOD17-E15', 'MOD17-T3', 'Explain how an unscheduled full-height brick infill wall can alter the behaviour of a concrete or steel frame.', 'The structural engineer designs a moment-resisting frame assuming lightweight flexible partitions. On site, the contractor builds stiff full-height solid masonry blockwork walls tight up to the column faces, leaving only a 600 mm high strip window at the top of one column. What structural hazard does this create?', 'Consider the "captive short column" effect.', [
            'The stiff masonry wall restrains the lower part of the column, turning the top 600 mm window zone into a very stiff "short column" that attracts huge lateral shear forces and can fail in brittle shear',
            'The column becomes more flexible',
            'The masonry wall removes all gravity load from the foundation',
            'Wind load on the building drops to zero'
          ], 0, 'Tight masonry infills alter frame stiffness distribution; partial-height infills create captive short columns with high shear demand unless isolated by movement gaps and flexible head restraints.'),
      qMcq('MOD17-E16', 'MOD17-T3', 'Identify the correct engineering response when a site contractor reports that holding-down bolts are cast 45 mm out of position.', 'On site, the concrete subcontractor casts a group of four M24 holding-down bolts 45 mm eccentric to the column gridline. The steel erector asks permission to flame-cut a 60 mm oversized slot in the baseplate on site with no washer plate. What should the engineer do?', 'Follow formal NCR/RFI engineering review principles.', [
            'Stop the unapproved flame-cutting, request an accurate as-built survey of all bolts, and check the eccentric bending/bearing on the baseplate and foundation before issuing a designed remedial detail (e.g. welded structural plate washer, enlarged baseplate, or tested post-installed anchors)',
            'Verbally approve burning away half the baseplate over the phone without calculations',
            'Tell the erector to bend the M24 bolts by 45 mm with a sledgehammer',
            'Omit the bolts entirely'
          ], 0, 'Site non-conformances require an accurate survey, a structural check of the eccentric load path, and a formally detailed remedial solution.'),
      qMcq('MOD17-E17', 'MOD17-T1', 'Verify timber truss and joist hanger nail population notes on drawings.', 'Why must a timber engineering drawing explicitly state "Fill ALL round holes in joist hangers with specified 30 x 3.75 mm square-twist sherardised connector nails" rather than just saying "Fix with joist hanger"?', 'Consider how proprietary hanger capacity is tested and rated.', [
            'Proprietary joist hangers only achieve their published characteristic capacity when every designated nail hole is filled with the exact nail diameter, length, and corrosion coating tested by the manufacturer',
            'Four plasterboard screws are stronger than 24 connector nails',
            'Nails are only needed during transport',
            'Joist hangers work by friction alone'
          ], 0, 'Using drywall screws or filling only half the holes in a timber hanger invalidates its tested shear capacity.'),
      qMcq('MOD17-E18', 'MOD17-T2', 'Explain why long masonry walls require vertical movement joints.', 'Why are vertical movement joints (with debonded shear ties across the joint) detailed at regular intervals (e.g. every 6 m to 12 m depending on clay vs calcium silicate/concrete blockwork) in long masonry walls?', 'Consider irreversible moisture expansion of clay brick vs drying shrinkage of concrete blockwork.', [
            'To accommodate thermal and moisture expansion/shrinkage without inducing tensile or compressive restraint stresses that crack the wall, while debonded ties maintain out-of-plane lateral continuity',
            'To let wind blow through the building',
            'To avoid building foundations under the wall',
            'Because bricklayers cannot lay more than 6 m of brick'
          ], 0, 'Movement joints relieve in-plane restraint strains while sleeved/debonded flat ties preserve out-of-plane wind stability across the joint.'),
      qMcq('MOD17-E19', 'MOD17-T3', 'Verify restraint assumptions for compression flanges in roof purlin details.', 'A portal frame rafter calculation assumes the bottom flange (which is in compression under wind uplift or near the eaves haunch) is laterally restrained at 1.8 m centres. What must be shown on the structural drawings to make this calculation assumption true?', 'Look at the physical connection between top-flange purlins and the bottom flange of a deep rafter.', [
            'Diagonal knee braces (stays) bolted from the purlins down to the bottom flange of the rafter at the exact braced locations assumed in the calculation',
            'Nothing; top-flange purlins automatically restrain a bottom flange 600 mm below them without stays',
            'A coat of intumescent paint',
            'Gutter brackets on the fascia'
          ], 0, 'Purlins sit on the top flange; to restrain the bottom compression flange against lateral-torsional buckling, diagonal knee stays from the purlins to the bottom flange must be explicitly detailed on the drawings.'),
      qMcq('MOD17-E20', 'MOD17-T3', 'Pass the Module 17 Learning Gate: Audit a calculation against its drawing.', 'What is the golden rule of the Module 17 Learning Gate when auditing a calculation package against the issue drawings?', 'Synthesise calculation-to-drawing fidelity.', [
            'Every engineering assumption made in the calculation (material grades, section sizes, restraint spacings, connection fixity/releases, bearing lengths, sequence hold points, and foundation strata) must be explicitly made true by the drawings and specifications',
            'Calculations and drawings are produced by different people and never need to match',
            'If a restraint is assumed in the software, the contractor will guess where it goes',
            'Drawings only need to show architectural room names'
          ], 0, 'A calculation is only valid for the structure shown on the drawings. Auditing ensures complete alignment between analytical assumptions and built reality.')
    ]
  },
  {
    id: 'MOD-18',
    moduleNumber: 18,
    title: 'Existing Structures, Surveys and Uncertainty',
    shortTitle: 'Existing Structures & Surveys',
    summary: 'Record drawings vs site reality, visual and intrusive structural appraisals, material identification and deterioration, crack diagnosis, temporary stability during alterations, and refusing to guess when opening-up is required.',
    whyItMatters: 'Existing buildings frequently differ from historic drawings, have hidden alterations, and use older materials (wrought iron, cast iron, mild steel, unreinforced masonry). Safe refurbishment and temporary works design depend on systematic investigation and conservative engineering judgement.',
    objectives: [
      'Plan and interpret visual structural surveys and targeted intrusive opening-up investigations.',
      'Identify historic materials (cast iron vs wrought iron vs steel, historic timber, lime vs cement mortar) and diagnose deterioration mechanisms.',
      'Distinguish structural movement cracks (foundation subsidence, lintel failure, lateral wall bulge, corrosion jacking) from minor thermal/shrinkage crazing.',
      'Design safe temporary support sequences for knock-throughs and alterations, and know when to refuse to guess and specify opening-up or specialist investigation.'
    ],
    learningGate: 'Produce a structural appraisal checklist and state what you would refuse to assume without opening up.',
    WorkedExamples: [
      {
        id: 'EX-18.1',
        title: 'Exercise 18.1: Structural Appraisal, Opening-Up Scope & Loadbearing Wall Knock-Through Sequence',
        brief: 'Prepare a structural appraisal and temporary works sequence for removing a 3.6 m length of ground-floor loadbearing masonry wall in an 1890s Victorian building.',
        checklist: [
          'Trace all floor joists, roof loads, and chimney breasts bearing onto the wall from loft to basement.',
          'Specify mandatory pre-construction opening-up (joist span direction, existing foundation width/depth, masonry thickness/bonding, hidden flues or timber lintels).',
          'Detail the step-by-step temporary needling, propping, sole plate bearing, dry-packing, and Hold Points before any masonry is demolished.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD18-T1',
        code: '18.1',
        title: 'Record Drawings vs Reality, Visual Surveys & Intrusive Investigation',
        summary: 'Why record drawings are hypotheses until verified on site, visual survey methodology, plumblines and level surveys, and specifying targeted opening-up.',
        subtopics: [
          'Treating record drawings as a starting hypothesis rather than guaranteed as-built fact',
          'Visual inspection: load paths, floor joist span direction (floorboard orientation, ceiling cracks), wall plumb, and historic alterations',
          'Targeted intrusive opening-up: trial pits at foundations, local plaster removal at bearings, and ferroscan/break-out of rebar'
        ],
        futureContentNote: 'Future expansion slot for IStructE "Appraisal of Existing Structures" methodology and non-destructive testing (NDT) limits.',
        assessmentQuestions: [
          qNum('MOD18-T1-Q1', 'MOD18-T1', 'Evaluate out-of-plumb masonry wall eccentricity from a verticality survey.', 'A visual and plumb-line survey of an existing 215 mm thick solid brick wall of height h = 3.2 m measures an outward lean (out-of-plumb displacement) of delta = 32 mm at first-floor level relative to the base. Express this lean as a fraction of the wall thickness (delta / t).', 'Calculate 32 / 215.', 0.149, 'ratio', 0.005, 'delta / t = 32 / 215 = 0.149 (nearly t/6, where the line of vertical thrust approaches the middle-third boundary of the wall thickness!).'),
          qNum('MOD18-T1-Q2', 'MOD18-T1', 'Calculate actual bearing stress under a new steel beam on an existing brick pier verified by opening up.', 'Opening up reveals an existing solid brick pier is 330 mm wide, and a new steel beam will bear over a net length of 150 mm using a concrete padstone of plan area 330 mm x 200 mm (A_pad = 66,000 mm^2). Under a factored ULS beam reaction R_Ed = 79.2 kN (79,200 N), calculate the average bearing stress sigma_b beneath the padstone.', 'Use sigma_b = 79,200 / 66,000.', 1.2, 'MPa', 0.02, 'sigma_b = 79,200 N / 66,000 mm^2 = 1.20 MPa.'),
          qMcq('MOD18-T1-Q3', 'MOD18-T1', 'State the engineering status of historic "Record" or "For Construction" drawings of an existing building.', 'When an engineer is handed a set of 1970s "For Construction" drawings for a building undergoing major structural alterations, how must those drawings be treated?', 'Consider unrecorded site changes and subsequent tenant alterations.', [
            'As a helpful starting hypothesis that MUST be verified on site by dimensional checks and targeted intrusive opening-up before relying on them for safety-critical design',
            'As 100% guaranteed legal proof of what is hidden inside the walls without ever visiting site',
            'As completely useless paper that should be burned unread',
            'As proof that the concrete is C50/60'
          ], 0, 'Historic drawings frequently omit site substitutions, builder shortcuts, or later structural knock-throughs; critical loadbearing assumptions must be verified on site.'),
          qMcq('MOD18-T1-Q4', 'MOD18-T1', 'Identify non-invasive visual clues to floor joist span direction before lifting floorboards.', 'During an initial walkover survey of a domestic timber floor where carpets cannot yet be lifted, what visual clue strongly indicates the span direction of the timber joists?', 'Consider traditional tongue-and-groove floorboard laying practice.', [
            'Traditional timber floorboards are laid perpendicular to the supporting floor joists (so nail lines run along the joists), and joists typically span the shorter room dimension onto loadbearing walls',
            'Joists always span parallel to the floorboards',
            'Joists always span North-South regardless of room shape',
            'Radiator colour indicates joist depth'
          ], 0, 'Floorboards span across joists; however, because double-boarding or modern sheet subfloors can exist, intrusive lifting of a board is still required to confirm joist size, spacing, and bearing.'),
          qMcq('MOD18-T1-Q5', 'MOD18-T1', 'Explain why trial pits alongside existing foundations must be small and backfilled promptly.', 'When excavating a hand-dug trial pit alongside an existing shallow strip foundation to measure its depth, projection, and bearing stratum, what precaution is essential?', 'Consider undermining or removing lateral support from an existing loaded footing.', [
            'Keep the trial pit narrow, never undercut beneath the underside of the existing footing, avoid placing pits at heavily loaded narrow piers without assessment, and backfill/compact promptly',
            'Excavate a 10 m long trench 1 m deeper than the footing along the entire wall at once',
            'Use a 20-tonne excavator to pull the corner of the foundation out',
            'Flood the trial pit with water for two weeks'
          ], 0, 'Undercutting or excavating long trenches below the base level of an existing shallow foundation removes its bearing wedge and triggers immediate settlement or collapse.')
        ]
      },
      {
        id: 'MOD18-T2',
        code: '18.2',
        title: 'Material Identification, Deterioration, Corrosion, Timber Rot & Masonry Cracking',
        summary: 'Cast iron vs wrought iron vs modern steel, concrete carbonation/chloride corrosion spalling, wet/dry rot in timber ends, and diagnosing masonry crack patterns.',
        subtopics: [
          'Historic metals: brittle cast iron (weak in tension, thick tension flange) vs fibrous wrought iron vs steel',
          'Concrete deterioration: carbonation, chloride ingress, expansive rust jacking, and reinforcement section loss',
          'Timber decay at damp built-in masonry pockets and masonry crack width/taper diagnosis'
        ],
        futureContentNote: 'Future expansion slot for BRE Digest 251 crack width damage categories (0 to 5) and historic structural material testing.',
        assessmentQuestions: [
          qNum('MOD18-T2-Q1', 'MOD18-T2', 'Calculate percentage loss of tensile area due to reinforcement corrosion.', 'A corroded H20 reinforcing bar (original nominal diameter 20.0 mm, original area 314.2 mm^2) is cleaned of rust during an intrusive survey and found to have a remaining minimum effective diameter of 17.0 mm (remaining area = pi * 17^2 / 4 = 227.0 mm^2). Calculate the percentage loss of cross-sectional steel area.', 'Use ((314.2 - 227.0) / 314.2) * 100%.', 27.8, '%', 0.3, 'Loss = (314.2 - 227.0) / 314.2 = 87.2 / 314.2 = 27.75% (note how a seemingly modest 1.5 mm radius loss removes nearly 28% of the bar’s strength!).'),
          qNum('MOD18-T2-Q2', 'MOD18-T2', 'Calculate reduced section modulus of a timber joist after damp rot is cut back.', 'A 50 mm x 200 mm timber joist (original Wy = 333.3 x 10^3 mm^3) has suffered surface wet rot along its bottom edge near a damp wall, reducing its sound depth to h_eff = 170 mm. Calculate the remaining elastic section modulus Wy,eff = b * h_eff^2 / 6 (in 10^3 mm^3).', 'Use 50 * 170^2 / 6 / 1000.', 240.8, '10^3 mm^3', 1.0, 'Wy,eff = 50 * 28,900 / 6 = 240,833 mm^3 = 240.8 x 10^3 mm^3 (a 15% depth loss causes a 27.7% loss of bending capacity and a 38.6% loss of stiffness I!).'),
          qMcq('MOD18-T2-Q3', 'MOD18-T2', 'Distinguish a 19th-century brittle cast-iron beam from a rolled steel I-beam on site.', 'During a survey of an 1870s mill building, how can you visually identify that a floor beam is likely brittle Cast Iron rather than modern rolled steel, and why does it matter?', 'Compare tension vs compression strength of cast iron and how Victorian founders shaped the flanges.', [
            'Cast-iron beams typically have a much larger, wider bottom tension flange than the top compression flange, variable web depth, cast-in stiffener ribs, and blowholes/mould seams; cast iron is brittle and very weak in tension and must NEVER be site-welded or overloaded dynamically',
            'Cast iron has identical top and bottom flanges with modern UKB mill markings',
            'Cast iron is more ductile than S355 steel and can be site-welded easily',
            'Cast iron only exists in buildings built after 1995'
          ], 0, 'Cast iron has tensile strength only ~20%–25% of its compressive strength, so Victorian beams were cast with large bottom tension flanges and small top compression flanges.'),
          qMcq('MOD18-T2-Q4', 'MOD18-T2', 'Diagnose a stepped diagonal crack in an external brick wall that is wider at the top than at the bottom.', 'An external masonry gable wall exhibits a stepped diagonal crack following the mortar joints near the corner of the building. A crack-width gauge shows the crack is 8 mm wide near eaves level and tapers down to 1 mm near ground level. What movement mechanism does this taper indicate?', 'Draw the rigid-body rotation of the end corner dropping and tilting outward.', [
            'Subsidence or downward/outward rotation of the corner foundation relative to the rest of the wall, causing the corner panel to tilt outward and open widest at the top',
            'Uniform thermal expansion of the roof tiles',
            'Upward heave at the exact corner',
            'Pure vertical compression crushing at the base'
          ], 0, 'When the end of a wall subsides downward and rotates outward, the crack acts like a hinge near the base and opens widest at the top.'),
          qMcq('MOD18-T2-Q5', 'MOD18-T2', 'Explain why corroding steel embedded in masonry or concrete causes "rust jacking" and spalling.', 'Why does corroding reinforcement in concrete or a rusting wrought-iron cramp/beam end built into brickwork crack and heave the surrounding masonry or spall the concrete cover?', 'Compare the volume of iron oxides (rust) to the volume of the original steel.', [
            'Hydrated iron oxides (rust) occupy 4 to 7 times the volume of the original steel consumed, generating immense internal bursting pressure that splits concrete cover and jacks masonry courses apart',
            'Rust shrinks and creates a vacuum',
            'Corrosion cools the concrete below freezing',
            'Rust turns brickwork into timber'
          ], 0, 'Expansive corrosion products exert high radial/vertical jacking pressures, producing horizontal bed-joint cracking in masonry and delamination spalling in RC.')
        ]
      },
      {
        id: 'MOD18-T3',
        code: '18.3',
        title: 'Temporary Stability During Alterations, Refusing to Guess & Specialist Escalation',
        summary: 'Needling and propping sequences for loadbearing wall knock-throughs, backpropping existing timber/RC floors, refusing to make unsafe unverified assumptions, and escalating specialist hazards.',
        subtopics: [
          'Temporary needling and propping sequence: load path down to competent ground or backpropped floors BEFORE demolition',
          'Refusing to guess: documenting mandatory Hold Points when concealed bearings, prestressing tendons, or foundations are unverified',
          'Escalation triggers: post-tensioned slabs, RAAC, deleterious concrete (HAC, ASR), and complex party-wall excavations'
        ],
        futureContentNote: 'Future expansion slot for BS 5975 temporary works procedures, TWC/TWS roles, and RAAC/HAC identification.',
        assessmentQuestions: [
          qNum('MOD18-T3-Q1', 'MOD18-T3', 'Calculate axial load in temporary Acrow props supporting a needle beam during a wall knock-through.', 'To form a new opening in a loadbearing wall, temporary needle beams are inserted at 1.0 m centres. Each needle beam supports an unfactored wall + floor line load of 42 kN/m (so 42 kN per needle). If each symmetrical needle beam is supported on two vertical props (one inside the room, one outside), calculate the working axial load in each prop.', 'Divide the 42 kN needle load equally between its two supporting props.', 21, 'kN', 0.2, 'Load per prop = 42.0 / 2 = 21.0 kN (which must then be checked against the prop capacity at the actual extended height and eccentricity, AND the bearing capacity of the floor/ground beneath the sole plate!).'),
          qNum('MOD18-T3-Q2', 'MOD18-T3', 'Check bearing pressure beneath a timber sole plate supporting temporary props.', 'Two temporary props each carrying 21 kN sit on a 1.5 m long by 0.225 m wide timber sole plate (plan area A = 0.3375 m^2) resting on a ground-bearing slab. Calculate the average vertical bearing pressure beneath the sole plate.', 'Use q = (2 * 21) / 0.3375.', 124.4, 'kPa', 0.5, 'Total load on sole plate = 42 kN. Bearing pressure q = 42 / 0.3375 = 124.4 kPa.'),
          qMcq('MOD18-T3-Q3', 'MOD18-T3', 'State the mandatory sequence for removing a loadbearing wall and installing a new steel beam.', 'Which sequence is mandatory when demolishing a ground-floor loadbearing brick wall to install a new steel lintel beam under an occupied first floor?', 'Trace the load path at every minute of the operation.', [
            '(1) Verify foundations/backpropping below; (2) Core small holes and insert needle beams above the proposed beam level; (3) Erect and snug-tighten props on sole plates with head/base restraints; (4) Demolish wall below needles and cast padstones; (5) Install new steel beam and pack tight with dry-pack mortar; (6) Only remove needles/props after padstones and dry-pack have cured',
            '(1) Knock the entire brick wall down with sledgehammers; (2) Put up one prop if the ceiling starts falling; (3) Push the beam in next week',
            'Prop the ceiling off a floating chipboard floor without checking what is underneath',
            'Remove the needles before the dry-pack mortar is placed'
          ], 0, 'The overhead load path must be supported continuously before demolition, and transferred fully via cured padstones and dry-pack mortar before temporary needles are struck.'),
          qMcq('MOD18-T3-Q4', 'MOD18-T3', 'Identify what an engineer must refuse to assume without opening up or specialist verification.', 'A client asks you to sign off cutting a 2.5 m x 2.5 m stair opening through a 1970s concrete floor slab tomorrow morning with no record drawings and no intrusive survey. Why must you refuse to issue a construction drawing until the slab is investigated?', 'Consider post-tensioned tendons, two-way/flat-slab action, and hidden ribs.', [
            'Without opening up/ferroscanning or record drawings, the slab could be post-tensioned (where cutting live tendons causes explosive release and collapse), a waffle/ribbed slab, or a flat slab where the opening severs primary support strips',
            'Because concrete from the 1970s cannot be cut with a diamond saw',
            'Because stair openings never affect slab bending moments',
            'You should just guess 200 mm slab with H12 @ 200 and mark the drawing "Contractor to check"'
          ], 0, 'Never guess hidden structural systems or delegate structural engineering design responsibility via vague "Contractor to verify" notes on uninvestigated critical elements.'),
          qMcq('MOD18-T3-Q5', 'MOD18-T3', 'Recognise specialist escalation triggers in existing buildings (RAAC, HAC, Post-Tensioned Concrete).', 'During an inspection of a 1960s roof, you observe lightweight bubbly grey precast planks with wide chamfers, no coarse aggregate, and shear cracks near a 45 mm end bearing. What material hazard should you suspect and escalate immediately?', 'Recall the UK structural safety alerts on Reinforced Autoclaved Aerated Concrete (RAAC).', [
            'Reinforced Autoclaved Aerated Concrete (RAAC), which has low shear/bond strength, high creep deflection, and is prone to sudden brittle failure at short end bearings',
            'Ultra-High-Performance Fibre-Reinforced Concrete (UHPFRC)',
            'Solid granite slabs',
            'Grade S460 structural steel decking'
          ], 0, 'RAAC panels (common in 1950s–1980s roofs) lack coarse aggregate, rely on transverse welded anchorage bars near the ends, and require specialist appraisal and often immediate propping.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD18-E01', 'MOD18-T1', 'Calculate masonry pier compressive stress before and after forming an adjacent doorway.', 'An existing 215 mm thick solid brick wall of length 3.0 m carries a uniform service load of 90 kN/m (total load 270 kN). If a 2.0 m wide opening is cut so that half the opening load plus the remaining 1.0 m wall load (total 180 kN) is channelled into a 1.0 m long pier (plan area 1000 mm x 215 mm = 215,000 mm^2), calculate the new service compressive stress in the pier.', 'Use sigma = 180,000 N / 215,000 mm^2.', 0.837, 'MPa', 0.02, 'sigma = 180,000 / 215,000 = 0.837 MPa (nearly double the original 0.419 MPa stress).'),
      qNum('MOD18-E02', 'MOD18-T1', 'Calculate needle beam bending moment during temporary propping.', 'A temporary steel needle beam spans L = 1.6 m between two vertical props placed on either side of a demolished wall. The needle carries a central point load P = 48 kN from the wall above. Calculate the unfactored midspan bending moment M = P * L / 4 in the needle beam.', 'Use M = 48 * 1.6 / 4.', 19.2, 'kNm', 0.2, 'M = 48 * 1.6 / 4 = 19.2 kNm.'),
      qNum('MOD18-E03', 'MOD18-T1', 'Verify existing strip footing bearing pressure under increased column/pier load.', 'A trial pit confirms an existing brick wall sits on a 650 mm wide concrete strip footing (area 0.65 m^2 per metre run). After alterations, the characteristic vertical load on this strip is 117 kN/m. Calculate the resulting ground bearing pressure.', 'Use q = 117 / 0.65.', 180, 'kPa', 1.0, 'q = 117 / 0.65 = 180.0 kPa.'),
      qNum('MOD18-E04', 'MOD18-T2', 'Calculate remaining web thickness after double-sided atmospheric corrosion of an existing steel beam.', 'An ultrasonic/micrometer survey of a corroded steel beam in a damp basement shows the original 10.2 mm web has lost 1.6 mm of steel thickness on EACH face. Calculate the remaining sound web thickness t_w,rem.', 'Use t_w,rem = 10.2 - (2 * 1.6).', 7, 'mm', 0.1, 't_w,rem = 10.2 - 3.2 = 7.0 mm (a 31.4% reduction in web shear and bearing area).'),
      qNum('MOD18-E05', 'MOD18-T2', 'Calculate reduced second moment of area of a notched existing timber joist.', 'A plumber notches 50 mm out of the top of an existing 50 mm x 200 mm timber joist at midspan, leaving an effective depth h_eff = 150 mm. Calculate the ratio of remaining second moment of area to original second moment of area: (150 / 200)^3.', 'Calculate 0.75^3.', 0.422, 'ratio', 0.005, '(150 / 200)^3 = 0.75^3 = 0.4219 (a 25% notch at midspan destroys nearly 58% of the joist’s bending stiffness and 44% of its bending strength!).'),
      qNum('MOD18-E06', 'MOD18-T3', 'Calculate required number of temporary props for a given needle line load.', 'A 4.0 m long wall opening carries a total vertical load (including 1.5 dynamic/construction safety allowance) of 168 kN. If each pair of temporary props (supporting one needle) has a safe working capacity of 42 kN per pair (21 kN per prop), calculate the minimum number of needle-and-prop pairs required.', 'Divide 168 by 42.', 4, 'pairs', 0.1, '168 / 42 = 4.0 needle pairs (8 props in total).'),
      qMcq('MOD18-E07', 'MOD18-T1', 'Explain why existing suspended timber ground floors fail when temporary props are placed directly on them.', 'During a ground-floor wall knock-through in a Victorian terrace, why is it dangerous to stand temporary Acrow props directly on the ground-floor floorboards without lifting a board to inspect below?', 'Consider typical Victorian ground-floor construction.', [
            'Victorian ground floors are typically suspended 100 mm x 50 mm timber joists spanning onto tiny sleeper walls over a sub-floor void, which will snap under concentrated prop loads unless propped directly down to solid oversite concrete/ground through the floor void',
            'Victorian floorboards are 500 mm thick reinforced concrete',
            'Acrow props weigh nothing',
            'Sleeper walls are designed for 200 kN point loads'
          ], 0, 'Never assume a ground floor is a solid concrete slab; lifting a floorboard frequently reveals a suspended timber floor over a void that must be bypassed onto solid ground.'),
      qMcq('MOD18-E08', 'MOD18-T1', 'Identify the structural role of historic timber "bonding timbers" or built-in lintels hidden behind plaster.', 'When surveying an early 19th-century Georgian or Victorian brick building, what hidden hazard is frequently discovered on the inner face of solid brick walls above openings or along floor levels?', 'Consider timber embedded inside damp historic brickwork.', [
            'Unseasoned or decayed timber lintels and horizontal "bonding timbers" built into the inner leaf of the brickwork, which may have rotted away from dampness, leaving the outer brick arch/wall eccentrically loaded',
            'Pre-stressed carbon fibre laminates installed in 1840',
            'Grade B500B ribbed reinforcement bars',
            'Solid titanium columns'
          ], 0, 'Historic masonry buildings often used timber inner lintels behind decorative outer brick arches; when the timber rots, the inner wall loses support.'),
      qMcq('MOD18-E09', 'MOD18-T2', 'Distinguish active progressive foundation movement from historic dormant settlement.', 'During a structural appraisal of a cracked masonry wall, what observation helps distinguish an old, dormant historic crack from active, ongoing movement?', 'Examine the crack edges, mortar repointing, and monitoring.', [
            'Clean, sharp, unweathered fracture edges, freshly cracked brittle plaster/decorations or cracked recent cement repointing (verified over time by tell-tale or precise level monitoring) indicate recent/active movement, whereas rounded, dust-filled, painted-over edges that remain stable over seasonal monitoring suggest historic movement',
            'All cracks wider than 0.5 mm mean the building will collapse in 10 minutes',
            'Active cracks only appear on internal walls',
            'Dormant cracks glow in the dark'
          ], 0, 'Inspecting edge freshness, previous repair history, and seasonal tell-tale/level monitoring differentiates active subsidence/heave from historic initial settlement.'),
      qMcq('MOD18-E10', 'MOD18-T2', 'Explain why repointing soft historic lime-mortar brickwork with hard modern dense cement mortar causes damage.', 'Why is it bad practice to repoint or render soft historic solid brickwork (originally laid in breathable, flexible lime mortar) using a strong, dense 1:3 Portland cement mortar?', 'Compare vapour permeability and stiffness of hard cement vs soft brick.', [
            'Hard, impermeable cement mortar traps moisture inside the bricks and is stiffer than the brick itself, causing frost spalling of the brick faces and cracking through the bricks rather than harmlessly along the mortar joints',
            'Lime mortar is stronger than S355 steel',
            'Cement mortar dissolves in dry air',
            'Historic bricks require high water pressure inside them'
          ], 0, 'In traditional lime masonry, mortar is softer and more permeable than the brick, acting as a sacrificial cushion and evaporation path.'),
      qMcq('MOD18-E11', 'MOD18-T2', 'Diagnose horizontal cracking every 450 mm along the bed joints of a 1970s cavity wall.', 'An exposed 1970s brick cavity wall displays regular horizontal cracks along the mortar bed joints every 450 mm up the height of the wall, accompanied by outward bowing and vertical rising of the outer leaf. What is the classic cause?', 'Consider spacing of traditional strip cavity wall ties (450 mm vertically).', [
            'Cavity wall tie corrosion: galvanized mild-steel strip ties corrode and expand ("rust jacking") in every 6th course bed joint, while simultaneously losing tensile capacity to tie the outer leaf against wind suction',
            'Foundation heave lifting every 6th brick separately',
            'Roof truss uplift pushing down on the wall',
            'Thermal shrinkage of the windows'
          ], 0, 'Pre-1981 galvanized steel fishtail/strip wall ties had thin zinc coatings; when they rust, expansive oxide bursts the bed joints every 450 mm and leaves the outer leaf unrestrained.'),
      qMcq('MOD18-E12', 'MOD18-T2', 'Identify the structural hazard of removing a ground-floor chimney breast while leaving the upper stack corbelled.', 'Why do many UK Local Authority Building Control departments prohibit or tightly restrict supporting an upper-floor masonry chimney breast on thin steel gallows brackets fixed into an old party wall?', 'Consider eccentricity, questionable Victorian mortar/flue voids, and neighbour demolition.', [
            'Gallows brackets apply heavy eccentric tension and shear into aged, often weak lime-mortar brickwork honeycombed with soot-lined flue voids, and rely on the neighbour’s chimney breast remaining in place for counterbalance',
            'Chimney breasts are made of lightweight polystyrene',
            'Steel brackets cannot be bolted',
            'Soot increases mortar tensile strength'
          ], 0, 'Old chimney breasts contain hollow flues and weak mortar; gallows brackets induce pull-out tension and overturning unless a full-span steel beam bears onto verified piers/walls.'),
      qMcq('MOD18-E13', 'MOD18-T3', 'Explain why lateral stability of the whole building must be checked before removing an internal cross-wall.', 'A homeowner wants to remove an internal masonry wall perpendicular to the front and rear facades to create an open-plan ground floor. Even after you design a steel beam to carry the vertical load from above, what global structural function of that wall must be checked?', 'Consider buttressing of external walls and horizontal wind racking resistance.', [
            'The removed cross-wall may be acting as a vital lateral return buttress for the front/rear facade piers and as a primary racking shear wall for overall building stability',
            'Internal walls never carry horizontal wind or buttressing forces',
            'A horizontal steel beam at ceiling level automatically resists horizontal wind sway without columns or moment frames',
            'Open-plan rooms have zero wind load'
          ], 0, 'Removing internal return walls can leave external walls unbuttressed (exceeding slenderness limits) or remove the building’s lateral racking stability; a sway portal frame or retained piers may be required.'),
      qMcq('MOD18-E14', 'MOD18-T3', 'Explain the purpose of "dry-pack" non-shrink mortar above a newly installed steel beam in an existing wall.', 'When a new steel beam is inserted beneath existing brickwork on needles, why is a 25 mm to 50 mm gap above the top flange tightly rammed with stiff semi-dry non-shrink cementitious mortar ("dry-pack") or steel slate wedges before striking the needles?', 'Consider what happens if a 20 mm gap is left above the beam when the needles are removed.', [
            'To establish continuous, pre-wedged vertical contact between the new steel beam and the underside of the existing brickwork so the wall does not drop and crack when the temporary needles are removed',
            'To insulate the steel beam from sound',
            'Because wet slop mortar shrinks by 0%',
            'To glue the brick wall to the ceiling'
          ], 0, 'Without tight dry-packing/wedging and curing before needle removal, the overhead masonry drops onto the beam to take up slack, cracking the superstructure.'),
      qMcq('MOD18-E15', 'MOD18-T3', 'Check temporary prop slenderness, verticality, and lacing in high-bay knock-throughs.', 'When temporary adjustable steel props (Acrow props) are extended to 3.8 m height to support heavy needle beams, what critical temporary works details are required?', 'Consider buckling, eccentric pin loading, and accidental impact.', [
            'Use manufacturer load-vs-height derating charts (which drop sharply with extension and plumb eccentricity), ensure concentric bearing via forkheads/beams, provide horizontal/diagonal tube-and-fitting lacing in both directions, and protect against site impact',
            'Stack two Acrow props end-to-end on a pile of loose bricks with no bracing',
            'Use a bent reinforcing bar instead of the manufacturer’s high-tensile prop pin',
            'Assume every prop carries 100 kN at any height'
          ], 0, 'Adjustable steel props are slender compression struts whose capacity drops rapidly with height and eccentricity (~1.5 deg out-of-plumb or eccentric loading); lacing and proper pins/sole plates are vital.'),
      qMcq('MOD18-E16', 'MOD18-T1', 'Distinguish wrought iron from modern mild steel in an existing structure.', 'How does 19th-century Wrought Iron differ from modern structural steel when assessing an existing riveted girder?', 'Consider slag inclusions, laminar structure, and weldability.', [
            'Wrought iron has a fibrous, wood-like grain containing elongated slag inclusions (making it weak in through-thickness tension and generally unsuitable for conventional structural welding), with lower yield strength than modern steel',
            'Wrought iron is brittle cast iron with 4% carbon',
            'Wrought iron has a yield strength of 500 MPa',
            'Wrought iron was never riveted'
          ], 0, 'Wrought iron is ductile along the direction of rolling but contains laminar slag stringers that delaminate under welding thermal stresses or through-thickness pull.'),
      qMcq('MOD18-E17', 'MOD18-T2', 'Identify High Alumina Cement (HAC) concrete hazard awareness.', 'Why are pre-1975 prestressed concrete beams made with High Alumina Cement (HAC) flagged as a high-risk deleterious material in structural appraisals?', 'Recall the mineralogical "conversion" of HAC.', [
            'HAC undergoes a time-, temperature-, and moisture-dependent crystalline "conversion" that increases porosity, reduces compressive and shear strength significantly, and leaves tendons vulnerable to chemical attack',
            'HAC concrete grows 20% larger every year',
            'HAC is magnetic',
            'HAC only affects timber roofs'
          ], 0, 'HAC conversion (especially in warm/humid environments like roofs, kitchens, and pools) causes severe loss of concrete compressive/shear strength.'),
      qMcq('MOD18-E18', 'MOD18-T2', 'Diagnose arch-shaped stepped cracking above a ground-floor window opening.', 'A ground-floor window opening in a brick wall displays stepped diagonal cracks rising from both top corners of the window frame toward a peak above mid-span, accompanied by sagging of the window head. What is the local failure mechanism?', 'Look at the masonry triangle above the lintel.', [
            'Failure, rot, or excessive deflection of the window lintel (or replacement of a structural window frame with an unreinforced uPVC frame without adding a lintel), causing the triangle of brickwork inside the natural masonry arch to drop',
            'Deep foundation settlement 10 metres away',
            'Wind uplift on the roof ridge',
            'Sulfate attack in the ground floor slab'
          ], 0, 'When a lintel sags or is missing above a replacement window, the triangular wedge of masonry below the natural corbelled arch detaches and drops.'),
      qMcq('MOD18-E19', 'MOD18-T3', 'Manage uncertainty when foundation depth cannot be verified before tender.', 'If an existing building’s foundation dimensions cannot be exposed until the contractor takes possession of the site, how should the engineer issue the tender drawings safely?', 'Apply transparent engineering risk management.', [
            'State explicit, conservative provisional assumptions on the drawings, highlight them as a mandatory pre-construction Hold Point ("Trial pit verification required prior to steel fabrication / demolition"), and define the trigger criteria for design review',
            'Pretend the foundations were inspected and show no notes',
            'Tell the contractor to design the whole building themselves',
            'Omit foundations from the drawings'
          ], 0, 'Clearly separating verified facts from provisional assumptions with a mandatory Hold Point protects safety, cost transparency, and buildability.'),
      qMcq('MOD18-E20', 'MOD18-T3', 'Pass the Module 18 Learning Gate: Produce a structural appraisal checklist and state what you would refuse to assume without opening up.', 'Which summary best meets the Module 18 Learning Gate for appraising and altering an existing structure?', 'Synthesise inspection, load-path tracing, temporary stability, and refusal to guess.', [
            'Trace vertical and lateral load paths from roof to ground, diagnose existing defects, design the temporary works propping sequence alongside the permanent works, and explicitly refuse to guess hidden joist directions, bearing lengths, foundation capacities, or post-tensioning without intrusive verification',
            'Assume every wall is non-loadbearing unless it is 500 mm thick',
            'Copy the estate agent’s floor plan into FE software and issue for construction',
            'Assume temporary propping is never the permanent engineer’s concern'
          ], 0, 'Permanent and temporary works in refurbishment are inseparable; safe engineering requires verifying what is actually there before cutting into the load path.')
    ]
  },
  {
    id: 'MOD-19',
    moduleNumber: 19,
    title: 'Professional Practice, Checking and Business Readiness',
    shortTitle: 'Professional Practice & Checking',
    summary: 'Scope definition, exclusions, pre-design information, design responsibility, checking categories (Cat 0/1/2/3 principles) [UI1], independent calculation and drawing checking, CDM design risk management, document control, and competence boundaries.',
    whyItMatters: 'Technical calculations are only safe when embedded in rigorous professional practice: clear scope boundaries, independent checking that catches load-path and drawing mismatches, proactive risk elimination, and knowing your competence limits.',
    objectives: [
      'Define clear engineering scopes of service, exclusions, required pre-design information, and design assumptions.',
      'Explain design checking levels (Category 0, 1, 2, and 3 principles, noting scheme-specific definitions such as BS 5975 vs DMRB CS 450) [UI1] and perform an independent Category 2 check.',
      'Apply design risk management (eliminate, reduce, inform) and maintain strict document revision control.',
      'Recognise professional competence boundaries and escalate specialist geotechnical, dynamic, fire, or complex temporary works problems.'
    ],
    learningGate: 'Perform an independent check on one of your own earlier designs after a break and document any errors or unclear assumptions found.',
    WorkedExamples: [
      {
        id: 'EX-19.1',
        title: 'Skill 19.1: Independent Category 2 Check & Scope/Risk Register Package ([UI1])',
        brief: 'Conduct an independent Category 2 check on a structural calculation and drawing package (without looking at the original designer’s working until after forming your own independent hand model), and prepare a Scope, Assumptions & Design Risk Register.',
        checklist: [
          'Verify which checking framework applies to the project (e.g. BS 5975 temporary works checking categories vs National Highways DMRB CS 450 permanent highway structures vs Building Safety Act / project QA plan) without guessing ambiguous labels.',
          'Derive independent load takedown, equilibrium reactions, and governing member/connection checks from the drawings and design brief alone.',
          'Audit the drawings against the calculation to verify that every restraint, bearing, grade, and Hold Point is shown.',
          'Document a clear Scope of Services, Explicit Exclusions, Pre-Design Information Needed, and Residual Design Risks.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD19-T1',
        code: '19.1',
        title: 'Scope Definition, Exclusions, Required Pre-Design Information, Assumptions & Constraints',
        summary: 'Writing unambiguous scopes of service, explicit exclusions, pre-design information checklists, and documenting design assumptions and client constraints.',
        subtopics: [
          'Defining deliverables, design stages, and interfaces (e.g. connection design, temporary works, below-ground drainage, party wall awards)',
          'Listing required Pre-Design Information (topographical survey, GI report, measured survey, utilities search)',
          'Recording assumptions clearly on the front sheet of calculations and in the general notes of drawings'
        ],
        futureContentNote: 'Future expansion slot for ACE / IStructE appointment scope schedules and Building Safety Act Golden Thread documentation.',
        assessmentQuestions: [
          qNum('MOD19-T1-Q1', 'MOD19-T1', 'Verify calculation package completeness across the 9 mandatory syllabus sections.', 'According to the course syllabus ("How every calculation note must be written"), how many mandatory structural sections must every professional calculation note contain (from 1. Title & Scope through to 9. Conclusion & Utilisation)?', 'Count the 9 mandatory sections specified in the syllabus.', 9, 'sections', 0, 'Every calculation note in the syllabus has 9 mandatory sections: (1) Title/Scope, (2) Design Basis/Standards, (3) Geometry/Materials, (4) Actions/Combinations, (5) Load Path/Static Scheme, (6) Step-by-Step Calculations, (7) Independent Sanity Check, (8) Assumptions/Limitations, and (9) Conclusion & Utilisation.'),
          qNum('MOD19-T1-Q2', 'MOD19-T1', 'Check maximum acceptable utilisation ratio for a compliant design conclusion.', 'In Section 9 (Conclusion) of a structural calculation note, what is the maximum allowable design utilisation ratio (Demand / Capacity) for an ultimate or serviceability limit state check to pass without documented concession?', 'Demand must not exceed Capacity (1.00).', 1, 'ratio', 0.01, 'A compliant design check requires Demand / Capacity <= 1.00 (100% utilisation).'),
          qMcq('MOD19-T1-Q3', 'MOD19-T1', 'Explain why explicit exclusions and interface boundaries must be stated in an engineering scope.', 'Why must a structural engineer’s fee proposal and scope document explicitly state interfaces and exclusions (such as specialist steel connection design, temporary works design, geotechnical site investigation, or party wall surveyor duties)?', 'Consider how dangerous "scope gaps" occur on construction projects.', [
            'Because unstated interfaces create dangerous scope gaps where the client or contractor assumes the permanent-works engineer has checked something (like temporary propping or ground gas) that has not actually been designed',
            'To avoid doing any calculations at all',
            'Because exclusions make concrete stronger',
            'So that no drawings need to be issued'
          ], 0, 'Many construction failures and disputes happen in the gap between disciplines (e.g. between permanent and temporary works, or structure and geotechnics). Clear interface schedules ensure every item has an assigned owner.'),
          qMcq('MOD19-T1-Q4', 'MOD19-T1', 'Identify essential Pre-Design Information required before finalising foundation design.', 'Which piece of Pre-Design Information is essential before issuing final "For Construction" foundation drawings for a new multi-storey building?', 'Consider ground uncertainty and underground hazards.', [
            'A site-specific Ground Investigation (GI) report, topographical survey, and buried utilities/obstructions search',
            'The final interior paint colour chart',
            'The brand of coffee machine in the reception',
            'A verbal assurance from a neighbour that the ground is "probably fine"'
          ], 0, 'Finalising foundation construction drawings without site-specific ground investigation and utility searches exposes the project to bearing failure, settlement, or striking live utilities.'),
          qMcq('MOD19-T1-Q5', 'MOD19-T1', 'Explain how provisional assumptions must be tracked on drawings.', 'If a preliminary GA drawing must be issued for costing before a beam bearing is opened up on site, how should the unverified bearing assumption be presented on the drawing?', 'Consider visual clarity and prevention of premature construction.', [
            'Clouded and clearly labelled "PRELIMINARY / FOR COSTING ONLY — NOT FOR CONSTRUCTION: Subject to intrusive opening-up at Grid B2 (Hold Point)", and tracked on the Assumptions & Risk Register',
            'Hidden in 4-point font on page 84 of the calculation appendix while the drawing is stamped "FOR CONSTRUCTION"',
            'Remembered only in the engineer’s head',
            'Deleted so the drawing looks cleaner'
          ], 0, 'Assumptions that require site verification must be visibly flagged on the drawing itself and prevented from being built unverified via status stamps and Hold Points.')
        ]
      },
      {
        id: 'MOD19-T2',
        code: '19.2',
        title: 'Design Responsibility, Checking Levels (Cat 0/1/2/3 Principles), Checking & Risk Management',
        summary: 'Design checking levels (Cat 0, 1, 2, 3 principles across BS 5975 and DMRB CS 450 without guessing ambiguous project definitions) [UI1], independent calculation vs drawing checking, and CDM design risk elimination.',
        subtopics: [
          'Checking categories [UI1]: distinguishing self/peer check (Cat 0/1), independent check within same/different team using Design Brief + Drawings (Cat 2), and fully independent external organization check (Cat 3)',
          'Why a true Category 2 check derives independent loads and calculations from the brief and drawings BEFORE inspecting the original designer’s calculation numbers',
          'Design Risk Management (Eliminate -> Reduce -> Inform) for buildability, maintenance, and demolition'
        ],
        futureContentNote: 'Future expansion slot for BS 5975 Table 1 Temporary Works Checking Categories vs DMRB CS 450 Highway Structures Checking Categories.',
        assessmentQuestions: [
          qNum('MOD19-T2-Q1', 'MOD19-T2', 'Spot a load-takedown error during an independent Category 2 check.', 'During an independent check of a 2-storey commercial building, the original designer’s calculation takes a roof beam span as L = 6.0 m and applies a factored ULS line load w_Ed = 25 kN/m, calculating a midspan moment M_Ed = 112.5 kNm and reaction R_Ed = 75 kN. However, when you measure the General Arrangement drawing, the actual column grid span is L = 7.2 m! Calculate the true ULS midspan moment M_Ed = w_Ed * L^2 / 8 that the 7.2 m beam must resist.', 'Use M_Ed = 25 * 7.2^2 / 8.', 162, 'kNm', 0.5, 'M_Ed = 25 * 51.84 / 8 = 162.0 kNm (the original calculation underestimated the bending moment by 44% because the designer used an outdated 6.0 m span instead of the 7.2 m span on the drawing!).'),
          qNum('MOD19-T2-Q2', 'MOD19-T2', 'Spot a tributary width factor-of-two error during an independent check.', 'An internal floor beam is spaced at 4.0 m centres from the beams on either side, and spans L = 8.0 m. Under a factored floor pressure q_Ed = 10 kPa, the original designer mistakenly used a tributary width of 2.0 m (half-bay only!) instead of the full 4.0 m tributary width. Calculate the true factored ULS total load W_true (in kN) on the internal beam.', 'Use W_true = q_Ed * 4.0 m * 8.0 m.', 320, 'kN', 1.0, 'True tributary width for an internal beam is 2.0 + 2.0 = 4.0 m. True line load = 10 * 4.0 = 40 kN/m. True total load W_true = 40 * 8.0 = 320.0 kN (twice the designer’s 160 kN!).'),
          qMcq('MOD19-T2-Q3', 'MOD19-T2', 'Explain the fundamental principle of a Category 2 design check ([UI1]).', 'While exact category definitions depend on the governing standard or client procedure (e.g. BS 5975 for temporary works vs DMRB CS 450 for highway structures, which must always be confirmed in the project brief), what is the defining engineering principle of a Category 2 independent check?', 'Compare proof-reading arithmetic vs independent analytical verification from the brief and drawings.', [
            'The checker assesses the design independently—working from the design brief, ground data, and drawings using independent calculations/methods rather than merely proof-reading or ticking the original designer’s arithmetic—and is independent of the original design preparation',
            'The original designer runs a spell-checker on their own Word document',
            'The checker only checks that page numbers are in order without doing any structural calculations',
            'Category 2 means no drawings are checked'
          ], 0, 'Merely following the original designer’s lines of arithmetic ("tick-and-bash") leads to confirmation bias and misses omitted failure modes or drawing mismatches. A Category 2 check verifies the structure independently from the brief and drawings (and the project’s specific governing standard must always be confirmed).'),
          qMcq('MOD19-T2-Q4', 'MOD19-T2', 'Explain why checking the drawings is at least as important as checking the calculations.', 'During a design check, why must the checker spend as much effort auditing the structural drawings and schedules as checking the calculation equations?', 'Consider what gets built on site.', [
            'Because a mathematically flawless calculation is useless if the wrong beam size, missing bracing, wrong concrete cover, or unbuildable connection is shown on the drawings issued to site',
            'Because drawings are only used by architects',
            'Because site operatives build directly from differential equations',
            'Drawings never contain transcription errors'
          ], 0, 'Transcription errors between calculations and drawings (or calculation assumptions not reflected on drawings) are among the most common sources of structural defects.'),
          qMcq('MOD19-T2-Q5', 'MOD19-T2', 'Apply the hierarchy of Design Risk Management (Eliminate -> Reduce -> Inform).', 'Under UK design risk management principles (CDM), what is the correct order of priority when a structural designer identifies a significant construction or maintenance hazard (such as working at height over water or cutting chases into dust-producing concrete)?', 'Recall Eliminate -> Reduce -> Inform.', [
            'First seek to ELIMINATE the hazard by design (if reasonably practicable); second REDUCE the remaining risk by design detailing; third INFORM the contractor/end-user of significant unusual residual risks on the drawings and risk register',
            'Put a generic 50-page photocopied list of everyday site hazards at the back of the calculation file and change nothing in the design',
            'Assume all construction safety is 100% the contractor’s problem',
            'Only consider risks after the building has been occupied for 10 years'
          ], 0, 'Designers must first try to eliminate hazards at source (e.g. prefabrication at ground level, cast-in sockets instead of overhead drilling), then reduce risk, and clearly communicate significant residual site-specific risks on the drawings.')
        ]
      },
      {
        id: 'MOD19-T3',
        code: '19.3',
        title: 'Document Control, CPD, Competence Boundaries, Communication & Escalation',
        summary: 'Revision control (P01, C01), managing late changes across linked calculations and drawings, professional competence boundaries, and escalating beyond one’s experience.',
        subtopics: [
          'Document control: status codes (Preliminary vs For Construction), revision clouds, and updating calculations when drawings change',
          'Competence boundaries: knowing what you know, knowing what you do not know, and escalating specialist problems',
          'Clear technical communication with clients, architects, contractors, and checking engineers'
        ],
        futureContentNote: 'Future expansion slot for ISO 19650 document status codes and IStructE Code of Conduct ethics case studies.',
        assessmentQuestions: [
          qNum('MOD19-T3-Q1', 'MOD19-T3', 'Trace the cascade impact of a late architectural load change across linked calculations.', 'Late in design, a client changes a first-floor office room (previously q_k = 2.5 kPa) into a dense mobile-racking archive store (q_k = 7.5 kPa) over a tributary area of 30 m^2. Using gamma_Q = 1.50, calculate the additional ULS vertical load delta_F_Ed (in kN) that must be re-checked in the floor slab, supporting beams, columns, AND foundations.', 'Use delta_F_Ed = 1.50 * (7.5 - 2.5) * 30.', 225, 'kN', 1.0, 'Increase in characteristic imposed load = 7.5 - 2.5 = 5.0 kPa. Over 30 m^2 with gamma_Q = 1.50, delta_F_Ed = 1.50 * 5.0 * 30 = 225.0 kN (a change at floor level cascades all the way down the load path to the foundations!).'),
          qMcq('MOD19-T3-Q2', 'MOD19-T3', 'Identify mandatory document control practice when revising an issued "For Construction" drawing.', 'After Drawing S-101 Rev C01 ("For Construction") has been issued to site, a steel beam on Grid 4 is upsized from 406x178x54 UB to 457x191x67 UB. How must this change be issued?', 'Consider site traceability and prevention of building from superseded drawings.', [
            'Increment the revision code (e.g. to Rev C02), cloud the changed beam on the drawing, record the specific change and date in the revision table, update the linked calculation and connection schedule, and formally issue the new revision to the project team',
            'Secretly overwrite the PDF file with the same revision number C01 and hope nobody already ordered the steel',
            'Send a WhatsApp message with no drawing update',
            'Change the calculation only and leave the old beam size on the drawing'
          ], 0, 'Never reissue a modified document under the same revision code; revision clouds, incremented revision numbers, and transmittal records prevent contractors fabricating from superseded information.'),
          qMcq('MOD19-T3-Q3', 'MOD19-T3', 'Define professional engineering competence boundaries.', 'A sole practitioner or junior engineer experienced in low-rise domestic steel, timber, and masonry is asked to design a 14-metre-deep contiguous piled basement excavation next to a live railway tunnel or a post-tensioned bridge deck. What is the professionally and ethically required response?', 'Apply the IStructE / Engineering Council Code of Conduct on competence.', [
            'Recognise that the work falls outside their current area of competence, decline to undertake it unsupervised, and escalate/refer the work to a suitably qualified specialist engineer or peer reviewer',
            'Download a free trial of finite element software and issue construction drawings without specialist experience',
            'Copy details from a random internet forum',
            'Accept the commission and mark every drawing "Contractor to verify stability"'
          ], 0, 'Working strictly within your verified competence—and escalating geotechnical, dynamic, prestressed, complex temporary works, or high-risk structures to specialists—is a core ethical duty.'),
          qMcq('MOD19-T3-Q4', 'MOD19-T3', 'Apply the Five Study & Engineering Rules across the whole course.', 'What are the five core engineering study and practice rules established at the very beginning of this syllabus and applied across Modules 0 to 19?', 'Recall the Five Study Rules from page 1 of the syllabus.', [
            '(1) Explain the concept in plain English; (2) Sketch the structural system, loads, supports, and deflected shape; (3) Calculate a real example with full units; (4) Check the answer against a reliable source or hand bound; and (5) State the assumptions and limitations',
            '(1) Memorise clause numbers; (2) Skip sketches; (3) Trust software blindly; (4) Hide assumptions; (5) Round all scores up',
            'Only use multiple-choice guesses without units',
            'Never check reactions or units'
          ], 0, 'Explain, Sketch, Calculate with units, Check against a reliable source/bound, and State assumptions and limitations.'),
          qMcq('MOD19-T3-Q5', 'MOD19-T3', 'Pass the Module 19 Learning Gate: Self-checking after a break and independent review.', 'Why does the Module 19 Learning Gate require you to put your own design aside for a break and then perform a fresh check starting from the drawing and design brief?', 'Consider cognitive fresh eyes vs familiarity blindness.', [
            'Stepping away and re-checking from the drawing back to the calculation breaks confirmation bias and exposes silent assumptions, transcription errors, and missing load paths that you overlooked while writing the calculation',
            'Because calculations evaporate after 24 hours',
            'To avoid writing conclusions',
            'Because independent review is never required in engineering'
          ], 0, 'Checking from the drawing back to an independent hand calculation after a break catches the errors that familiarity hides.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD19-E01', 'MOD19-T2', 'Perform an independent load takedown check on a roof trimmer beam.', 'A checker reviews Drawing S-201 showing a 6.0 m span roof trimmer beam supporting a point load at midspan from a secondary beam of span 5.0 m (which carries 12 kN/m total factored load, so reaction on the trimmer is 12 * 5.0 / 2 = 30 kN). Ignoring trimmer self-weight, calculate the midspan bending moment M = P * L / 4 on the 6.0 m trimmer beam.', 'Use M = 30 * 6.0 / 4.', 45, 'kNm', 0.5, 'Reaction transferred at midspan P = 30.0 kN. Trimmer midspan moment M = 30.0 * 6.0 / 4 = 45.0 kNm.'),
      qNum('MOD19-E02', 'MOD19-T2', 'Catch a unit conversion error during a calculation check.', 'An engineer calculates a beam’s required second moment of area as I_req = 42.5 x 10^6 mm^4. In the steel section table, I_yy is listed in cm^4. Since 1 cm^4 = 10^4 mm^4, what is the correct value of I_req expressed in cm^4?', 'Divide 42.5 x 10^6 by 10^4.', 4250, 'cm^4', 5.0, '42.5 x 10^6 mm^4 / 10^4 = 4250 cm^4 (a classic checking error is misreading 10^3 instead of 10^4 when converting mm^4 to cm^4!).'),
      qNum('MOD19-E03', 'MOD19-T2', 'Check utilisation ratio from independent demand and capacity.', 'An independent check finds a column’s design axial load is N_Ed = 1140 kN and its buckling resistance is N_b,Rd = 1200 kN. Calculate the utilisation ratio N_Ed / N_b,Rd.', 'Divide 1140 by 1200.', 0.95, 'ratio', 0.005, 'Utilisation = 1140 / 1200 = 0.950 (95% <= 1.00, Pass).'),
      qNum('MOD19-E04', 'MOD19-T2', 'Detect an overloaded member where utilisation exceeds 1.00.', 'In the same check, the checker discovers that an eccentric roof load adds a bending moment M_y,Ed = 36 kNm (where M_b,Rd = 180 kNm). Using a simplified linear interaction check (N_Ed / N_b,Rd) + (M_y,Ed / M_b,Rd) = 0.95 + (36 / 180), calculate the combined interaction ratio.', 'Calculate 0.95 + 0.20.', 1.15, 'ratio', 0.01, '0.95 + (36 / 180) = 0.95 + 0.20 = 1.15 (> 1.00, FAIL — the independent check caught an omitted eccentric moment that pushed the column over capacity!).'),
      qNum('MOD19-E05', 'MOD19-T1', 'Verify reaction equilibrium in Section 7 (Independent Sanity Check) of a calculation note.', 'A 10 m beam carries a full-span UDL of 18 kN/m plus a point load of 50 kN at 3 m from the left support. In the Independent Sanity Check section of the calculation note, what must the sum of the two vertical support reactions (R_A + R_B) equal?', 'Use R_A + R_B = (18 * 10) + 50.', 230, 'kN', 0.5, 'Total applied vertical load = (18 * 10) + 50 = 180 + 50 = 230.0 kN.'),
      qNum('MOD19-E06', 'MOD19-T3', 'Quantify foundation pad area increase required after a late design change.', 'A pad foundation was originally sized for a service column load of 450 kN on soil with allowable bearing pressure 150 kPa (requiring A = 3.0 m^2). A late plant-room change increases the service column load to 600 kN. Calculate the new minimum required pad plan area A_new.', 'Use A_new = 600 / 150.', 4, 'm^2', 0.05, 'A_new = 600 / 150 = 4.00 m^2 (e.g. increasing from 1.75 m square to 2.00 m square).'),
      qMcq('MOD19-E07', 'MOD19-T1', 'Identify why every calculation note must state its Design Basis, Codes, and National Annexes.', 'Why is Section 2 (Design Basis, Standards & Partial Factors) mandatory at the start of every structural calculation note?', 'Consider code compatibility and partial factor differences.', [
            'Because partial factors, material strengths, and buckling/shear equations depend on the coherent standard suite and UK National Annex used; mixing clauses from incompatible codes (e.g. permissible stress BS 449/BS 5268 with limit-state Eurocodes) is invalid and dangerous',
            'To fill up the first page with text',
            'Because all codes in the world use identical partial factors',
            'So the client has to buy the standards'
          ], 0, 'Stating the governing code suite and UK National Annex parameters upfront ensures consistent partial factors and prevents dangerous mixing of permissible-stress and ultimate-limit-state rules.'),
      qMcq('MOD19-E08', 'MOD19-T2', 'Clarify the syllabus requirement on Category 2 checking ([UI1]).', 'The syllabus includes a margin comment asking for Category 2 checking to be covered through straightforward examples. Why must an engineer always confirm which specific checking standard or procedure is referenced on a given project rather than assuming a single universal definition of "Category 2"?', 'Compare BS 5975 (Temporary Works), DMRB CS 450 (Highways), and project-specific QA schemes.', [
            'Because different UK industry standards define checking categories differently (for example, in BS 5975 Category 2 is an independent check where the checker may belong to the same organisation if not involved in the original design, whereas in DMRB CS 450 Category 2 is an independent team within the same organisation with NO access to the designer’s calculations); you must never guess an ambiguous checking level without checking the contract/standard',
            'Because Category 2 means zero checking in all standards',
            'Because Category 2 only applies to plumbing',
            'Because checking categories are illegal in the UK'
          ], 0, 'Checking categories (Cat 0, 1, 2, 3) have precise legal/procedural meanings that vary slightly between BS 5975, DMRB CS 450, Network Rail, and Building Control procedures; always verify the governing scheme and provide an independent check from brief and drawings.'),
      qMcq('MOD19-E09', 'MOD19-T2', 'Perform a drawing-to-calculation check: identify a critical transcription error.', 'A calculation package designs a heavily loaded lintel as a 203x203x60 UC (S355), achieving a utilisation of 0.92. On the General Arrangement drawing, the draughtsperson accidentally labels the member "203x203x46 UC". Which checking workflow catches this error reliably?', 'Compare checking only the calculation PDF vs cross-checking the drawing against the calculation.', [
            'Highlighting/marking off every member size, grade, reaction, and note on the GA drawing directly against the calculation conclusions (or checking from the drawing first)',
            'Only re-checking the arithmetic inside the calculation PDF',
            'Running spell-check on the cover letter',
            'Assuming the draughtsperson never makes a typo'
          ], 0, 'A line-by-line yellow/green highlighter mark-up of the issue drawings against the calculation summary catches transcription mismatches before steel is ordered.'),
      qMcq('MOD19-E10', 'MOD19-T2', 'Identify what information should be withheld initially in a strict independent design check.', 'In a strict independent design check (such as DMRB CS 450 Category 2/3 or best-practice blind checking), why is the checker given the Design Brief, GI report, and Drawings, but NOT the original designer’s calculation file?', 'Consider how seeing someone else’s calculation biases the checker.', [
            'To force the checker to idealise the structure, trace the load paths, and calculate member demands independently, avoiding "anchoring" or copying a flawed modelling assumption from the original calculation',
            'To save printer paper',
            'Because the original designer never writes calculations',
            'To make the check take 10 years'
          ], 0, 'Blind independent checking from the brief and drawings ensures that two independent engineering minds derive the load paths and capacities separately.'),
      qMcq('MOD19-E11', 'MOD19-T2', 'Apply CDM design risk reduction to deep foundation construction.', 'On a congested urban site with contaminated groundwater and adjacent shallow foundations, which foundation design decision best demonstrates "Eliminating or Reducing Risk by Design"?', 'Compare open hand-dug deep caissons vs auger-bored/CFA piles with cropped heads above water.', [
            'Selecting remote machine-installed piles (e.g. CFA) with mechanical pile cropping above groundwater level instead of requiring operatives to enter deep hand-dug excavations or trim piles inside flooded trenches',
            'Requiring operatives to hand-dig 8 m deep unshored shafts without ventilation',
            'Writing "Wear a hard hat" on the drawing and changing nothing',
            'Ignoring the adjacent building foundations'
          ], 0, 'Eliminating the need for workers to enter deep excavations or use hand-held breakers in confined spaces addresses the hazard at the design stage.'),
      qMcq('MOD19-E12', 'MOD19-T2', 'Identify what belongs on a Drawing "Design Risk / Residual Hazard Note".', 'Which of the following is a useful, actionable residual design risk note to place prominently on a structural refurbishment drawing?', 'Compare specific hidden structural instability warnings vs generic site trivia.', [
            '"WARNING — STABILITY CRITICAL: Existing steel truss on Grid B relies on the first-floor timber diaphragm for lateral restraint. Do NOT strip more than 2 bays of floorboards simultaneously without installing temporary plan bracing per Sequence Drawing S-005."',
            '"Note: Gravity acts downward and concrete is heavy."',
            '"Note: Contractor must obey all UK laws."',
            '"Note: Cement can irritate skin."'
          ], 0, 'Residual risk notes on drawings should highlight non-obvious, project-specific structural hazards (temporary instability, prestressed tendons, fragile elements, sequence constraints) rather than generic boilerplate.'),
      qMcq('MOD19-E13', 'MOD19-T1', 'Distinguish between a Temporary Works Designer (TWD) and a Temporary Works Coordinator (TWC) under BS 5975.', 'In UK construction practice to BS 5975, how does the role of the Temporary Works Coordinator (TWC) relate to the Temporary Works Designer (TWD)?', 'Recall BS 5975 procedural roles.', [
            'The TWC manages the site temporary works procedure (maintaining the register, ensuring a design brief is issued, verifying the appropriate design check is completed, and issuing Permits to Load/Strike), while the TWD carries out the technical engineering design of the temporary works',
            'The TWC personally welds all falsework props on site with no drawings',
            'The TWD is only allowed to look at permanent works after demolition',
            'BS 5975 abolishes all design checks for temporary works'
          ], 0, 'BS 5975 separates procedural coordination/control on site (TWC) from technical engineering design (TWD) and independent design checking (TW Checker).'),
      qMcq('MOD19-E14', 'MOD19-T3', 'Manage a situation where a contractor builds something on site before the design check is completed.', 'A site contractor phones to say they want to pour concrete into a heavily reinforced transfer beam in 30 minutes, before the required independent Category 2 check and pre-pour rebar inspection Hold Point have been completed. What is the correct professional response?', 'Prioritise structural safety and Hold Point governance over programme pressure.', [
            'Refuse to waive the Hold Point or sign off the pour until the design check is closed out and the reinforcement as-fixed on site has been inspected against the checked drawing',
            'Tell them to pour the concrete now and check the calculation next month',
            'Sign the inspection sheet from the office without looking at the rebar',
            'Delete the transfer beam from the register'
          ], 0, 'Once concrete is poured, misplaced or unverified reinforcement is buried permanently; safety-critical Hold Points must never be waived under time pressure.'),
      qMcq('MOD19-E15', 'MOD19-T3', 'Communicate technical findings clearly to a non-engineer client.', 'When writing a structural appraisal report for a homeowner or commercial client who is not an engineer, how should the findings and recommendations be structured?', 'Consider executive clarity plus technical rigour.', [
            'Start with a clear, plain-English Executive Summary stating what was inspected, whether the structure is safe, what actions/investigations are required, and key constraints, supported by clear photographs, sketches, and technical appendices',
            'Send 40 pages of raw finite element stiffness matrices with no explanation or conclusion',
            'Use ambiguous phrases so the client cannot tell whether the wall is safe or dangerous',
            'Omit all limitations and exclusions'
          ], 0, 'Clients need clear, unambiguous plain-English conclusions first, backed up by rigorous technical evidence and clearly stated limitations.'),
      qMcq('MOD19-E16', 'MOD19-T1', 'Explain why "Engineering Judgement" is not a synonym for "Guessing".', 'Throughout this 20-module syllabus, engineering judgement is emphasised alongside calculation. What is the true distinction between sound Engineering Judgement and mere guessing?', 'Synthesise physical principles, bounding calculations, and conservative risk management.', [
            'Engineering judgement is grounded in physical mechanics, load-path equilibrium, simplified hand bounds, material behaviour, and explicit conservative bounds where data is uncertain—whereas guessing ignores equilibrium and conceals uncertainty',
            'Engineering judgement means picking beam sizes by intuition without ever calculating loads or reactions',
            'Engineering judgement means ignoring Eurocodes whenever a member fails',
            'Guessing and engineering judgement are identical'
          ], 0, 'Sound engineering judgement uses mechanics, upper/lower bounds, and physical insight to frame problems, validate calculations, and manage uncertainty safely.'),
      qMcq('MOD19-E17', 'MOD19-T3', 'Identify how the Integrated Project Milestones (A to F) complement the module assessments.', 'In the syllabus structure, how do the six Integrated Project Milestones (Milestones A to F, from the single-bay warehouse to the full calculation & drawing portfolio) relate to the module assessments?', 'Review the syllabus Integrated Project Milestones section.', [
            'They serve as cumulative, real-world engineering design projects where you apply multiple modules together (load paths, stability, materials, geotechnics, detailing, and independent checking) to build a checked calculation and drawing portfolio',
            'They replace the need to learn basic statics or soil mechanics',
            'They are automatically completed without doing any work',
            'They only cover multiple-choice trivia'
          ], 0, 'Milestones A to F integrate the individual syllabus modules into realistic end-to-end engineering design and checking projects.'),
      qMcq('MOD19-E18', 'MOD19-T2', 'Check unit consistency as the first step of any calculation audit.', 'When auditing a colleague’s hand or spreadsheet calculation, why is checking dimensional and unit consistency (e.g. N vs kN, mm vs m, MPa vs kPa) one of the highest-value checks you can perform?', 'Consider order-of-magnitude errors ($10^3$, $10^6$).', [
            'Because unit conversion mistakes typically introduce errors of 10^3 or 10^6 (1,000% to 100,000,000%), which dwarf minor 5% refinement differences in code clauses',
            'Because units are optional in spreadsheet cells',
            'Because 1 kN/m^2 equals 1 N/mm^2',
            'Units only matter in academic exams'
          ], 0, 'A 10^3 unit error is catastrophic; tracking units explicitly at every line of a calculation prevents order-of-magnitude blunders.'),
      qMcq('MOD19-E19', 'MOD19-T3', 'Maintain Continuing Professional Development (CPD) and technical currency.', 'Why must a practising structural engineer maintain ongoing CPD and verify current revisions of standards, National Annexes, and industry safety alerts (such as SCOSS/CROSS reports)?', 'Consider evolving failure lessons and regulatory updates.', [
            'Because structural failure reports (CROSS), material alerts, and standard revisions continually capture critical lessons from real-world near-misses and collapses',
            'Because laws of physics change every Tuesday',
            'CPD is only for engineers with less than 1 month of experience',
            'CROSS reports are only for architects'
          ], 0, 'Learning from Confidential Reporting on Structural Safety (CROSS) alerts and updated guidance prevents repeating industry mistakes.'),
      qMcq('MOD19-E20', 'MOD19-T2', 'Pass the Module 19 Learning Gate: Complete the 20-module foundation with independent verification discipline.', 'Which statement encapsulates the professional mindset required to graduate from Module 19 of StrucTutor?', 'Synthesise the entire syllabus from Module 0 to Module 19.', [
            'I can trace every vertical, lateral, and torsional load path from point of application into the ground; justify my analysis with hand bounds; detail buildable connections and reinforcement on clear drawings; verify my work through independent checking; and state my assumptions, limitations, and competence boundaries honestly',
            'I can pass 4-question quizzes by memorising answers without units',
            'I rely 100% on finite element software colours without drawing free-body diagrams',
            'I never need independent checks or site opening-up'
          ], 0, 'Well-rounded structural engineering competence combines load-path clarity, first-principles hand calculation, material & geotechnical understanding, buildable detailing, and rigorous independent checking.')
    ]
  }
];
