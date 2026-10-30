import { SyllabusModule } from '../types/syllabus';
import { qNum, qMcq } from './questionHelpers';

export const MODULES_12_TO_15: SyllabusModule[] = [
  {
    id: 'MOD-12',
    moduleNumber: 12,
    title: 'Soil Mechanics and Geotechnical Fundamentals',
    shortTitle: 'Soil Mechanics & Geotechnics',
    summary: 'Phase relationships, total vs pore-water vs effective stress, drained vs undrained shear strength, settlement mechanisms, and critical reading of Ground Investigation (GI) reports.',
    whyItMatters: 'Every structure ultimately transfers its load into the ground. Understanding Terzaghi’s effective stress principle, water table sensitivity, and the difference between short-term undrained clay behaviour and long-term drained behaviour is essential for both permanent foundations and temporary works.',
    objectives: [
      'Differentiate soil classifications, grading, plasticity index, and phase relationships (void ratio, moisture content, bulk and submerged unit weights).',
      'Calculate total vertical stress (sigma), pore-water pressure (u), and effective vertical stress (sigma\' = sigma - u) for layered ground profiles.',
      'Distinguish drained (c\', phi\') and undrained (cu) shear strength and calculate Mohr-Coulomb shear capacity.',
      'Critically read a geotechnical report to identify water strike uncertainty, made ground variability, and settlement risks.'
    ],
    learningGate: 'Explain why water level changes can govern stability and bearing.',
    WorkedExamples: [
      {
        id: 'EX-12.1',
        title: 'Example 12.1: Effective Stress Profile with Rising Water Table',
        brief: 'Calculate vertical total stress, pore-water pressure, and effective stress at 4 m depth in sand (gamma = 19 kN/m^3, gamma_sat = 20 kN/m^3) when the water table rises from 4 m depth to ground level.',
        checklist: [
          'Calculate total stress sigma, pore pressure u, and effective stress sigma\' with water table at 4 m depth.',
          'Recalculate sigma, u, and sigma\' when the water table rises to ground level (0 m depth).',
          'Explain why rising groundwater reduces effective stress and frictional shear strength by approximately 50%.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-12.2',
        title: 'Example 12.2: Drained vs Undrained Excavation & Bearing Assessment',
        brief: 'Identify whether short-term undrained (cu) or long-term drained (c\', phi\') parameters govern for a newly loaded pad footing vs a newly excavated clay slope.',
        checklist: [
          'State why compression loading under a new footing is critical in the short term (positive excess pore pressure).',
          'State why unloading in a temporary clay cutting/excavation softens over time as negative pore pressure dissipates.',
          'Calculate Mohr-Coulomb shear resistance under both conditions.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-12.3',
        title: 'Example 12.3: Ground Investigation Report Critical Review',
        brief: 'Review a borehole log showing 1.8 m Made Ground over soft alluvial clay and sand, and list five questions to ask before designing shallow pad foundations.',
        checklist: [
          'Identify why Made Ground is generally unsuitable as a bearing stratum without ground improvement.',
          'Check groundwater monitoring standpipe records vs drilling water strikes.',
          'Check consolidation and differential settlement risks in the underlying soft alluvial clay.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD12-T1',
        code: '12.1',
        title: 'Soil Types, Grading, Plasticity & Phase Relationships',
        summary: 'Coarse vs fine soils, Atterberg limits (Liquid Limit, Plastic Limit, Plasticity Index), void ratio, saturation, and dry/bulk/saturated unit weights.',
        subtopics: [
          'Gravel and sand (coarse, cohesionless) vs silt and clay (fine, cohesive)',
          'Liquid Limit (LL), Plastic Limit (PL), and Plasticity Index (PI = LL - PL)',
          'Moisture content w, void ratio e, and bulk/dry unit weight relationships'
        ],
        futureContentNote: 'Future expansion slot for particle size distribution (PSD) curves, A-line plasticity chart, and shrink-swell volume change guidance near trees.',
        assessmentQuestions: [
          qNum('MOD12-T1-Q1', 'MOD12-T1', 'Calculate Plasticity Index (PI) from Liquid Limit and Plastic Limit.', 'A clay sample has a Liquid Limit LL = 58% and a Plastic Limit PL = 22%. Calculate the Plasticity Index PI (in %).', 'Assume standard Atterberg limit test results to BS 1377.', 36, '%', 0.1, 'PI = LL - PL = 58 - 22 = 36%.'),
          qNum('MOD12-T1-Q2', 'MOD12-T1', 'Calculate dry unit weight from bulk unit weight and moisture content.', 'A soil has a bulk unit weight gamma_b = 19.8 kN/m^3 and a moisture content w = 10% (0.10). Calculate its dry unit weight gamma_d.', 'Use gamma_d = gamma_b / (1 + w).', 18, 'kN/m^3', 0.05, 'gamma_d = 19.8 / (1 + 0.10) = 19.8 / 1.10 = 18.0 kN/m^3.'),
          qNum('MOD12-T1-Q3', 'MOD12-T1', 'Calculate buoyant (submerged) unit weight of soil below the water table.', 'A saturated sand has a saturated bulk unit weight gamma_sat = 20.31 kN/m^3. Taking the unit weight of water gamma_w = 9.81 kN/m^3, calculate the submerged (buoyant) unit weight gamma\'.', 'Use gamma\' = gamma_sat - gamma_w.', 10.5, 'kN/m^3', 0.05, 'gamma\' = 20.31 - 9.81 = 10.50 kN/m^3.'),
          qNum('MOD12-T1-Q4', 'MOD12-T1', 'Calculate moisture content from wet and dry specimen masses.', 'A moist soil sample has a total mass of 240 g. After oven drying to constant mass, its dry mass is 200 g. Calculate the moisture content w (in %).', 'Use w = ((m_wet - m_dry) / m_dry) * 100%.', 20, '%', 0.1, 'Mass of water = 240 - 200 = 40 g. Moisture content w = (40 / 200) * 100 = 20%.'),
          qMcq('MOD12-T1-Q5', 'MOD12-T1', 'Distinguish the engineering behaviour of coarse vs fine soils.', 'Why do clean sands and gravels generally respond in a drained manner under normal construction loading rates, whereas intact clays respond in an undrained manner?', 'Compare hydraulic conductivity (permeability) relative to rate of loading.', [
            'Clean sands and gravels have high permeability so excess pore water drains rapidly during loading, whereas clays have very low permeability so pore water cannot escape immediately',
            'Sands and gravels contain no pore water below the water table',
            'Clays have infinite shear strength immediately after loading',
            'Sands and gravels are compressible purely by long-term primary consolidation'
          ], 0, 'High permeability in coarse soils allows excess pore pressures to dissipate almost immediately during static construction loading, whereas low permeability in clays traps pore water in the short term.')
        ]
      },
      {
        id: 'MOD12-T2',
        code: '12.2',
        title: 'Total Stress, Pore-Water Pressure & Effective Stress',
        summary: 'Terzaghi’s effective stress equation sigma\' = sigma - u, layered soil profiles, groundwater level changes, and upward seepage/liquefaction awareness.',
        subtopics: [
          'Total vertical overburden stress sigma_v = sum(gamma_i * z_i)',
          'Hydrostatic pore-water pressure u = gamma_w * z_w',
          'Effective vertical stress sigma\'_v = sigma_v - u and why soil skeleton stiffness and friction depend on sigma\''
        ],
        futureContentNote: 'Future expansion slot for artesian pore pressures, excavation base heave checks, and upward hydraulic gradient piping.',
        assessmentQuestions: [
          qNum('MOD12-T2-Q1', 'MOD12-T2', 'Calculate total vertical stress in a dry single-layer soil profile.', 'A soil layer has a bulk unit weight gamma = 18.5 kN/m^3. Calculate the total vertical stress sigma_v at a depth z = 4.0 m below ground level (no surface surcharge).', 'Assume uniform bulk unit weight with depth.', 74, 'kPa', 0.2, 'sigma_v = gamma * z = 18.5 * 4.0 = 74.0 kPa.'),
          qNum('MOD12-T2-Q2', 'MOD12-T2', 'Calculate hydrostatic pore-water pressure below the groundwater table.', 'The groundwater table is at 1.5 m depth below ground level. Calculate the hydrostatic pore-water pressure u at a depth of 5.5 m below ground level (take gamma_w = 10.0 kN/m^3).', 'Depth below water table z_w = 5.5 - 1.5 m.', 40, 'kPa', 0.2, 'Depth below water table z_w = 5.5 - 1.5 = 4.0 m. Pore-water pressure u = 10.0 * 4.0 = 40.0 kPa.'),
          qNum('MOD12-T2-Q3', 'MOD12-T2', 'Calculate effective vertical stress using Terzaghi’s principle.', 'At 5.5 m depth, the total vertical stress is sigma_v = 107 kPa and the pore-water pressure is u = 40 kPa. Calculate the vertical effective stress sigma\'_v.', 'Use Terzaghi’s principle: sigma\'_v = sigma_v - u.', 67, 'kPa', 0.2, 'sigma\'_v = sigma_v - u = 107 - 40 = 67.0 kPa.'),
          qNum('MOD12-T2-Q4', 'MOD12-T2', 'Evaluate reduction in effective stress when the water table rises to the surface.', 'A sand deposit (gamma_dry = 18 kN/m^3, gamma_sat = 20 kN/m^3) is 4.0 m deep. Taking gamma_w = 10 kN/m^3, calculate the vertical effective stress sigma\'_v at 4.0 m depth when the water table rises all the way to ground level (0.0 m depth).', 'sigma_v = 20 * 4.0 kPa and u = 10 * 4.0 kPa.', 40, 'kPa', 0.2, 'Total stress sigma_v = 20 * 4.0 = 80 kPa. Pore pressure u = 10 * 4.0 = 40 kPa. Effective stress sigma\'_v = 80 - 40 = 40.0 kPa (down from 72 kPa when dry).'),
          qMcq('MOD12-T2-Q5', 'MOD12-T2', 'Explain why effective stress governs soil shear strength and volume change.', 'Why does Terzaghi’s effective stress (sigma\' = sigma - u) govern the frictional shear strength and compression of a soil skeleton?', 'Consider what pore water can and cannot resist.', [
            'Water cannot sustain static shear stress; intergranular friction and skeletal compression depend on the normal forces transmitted directly between solid soil particles',
            'Pore water carries 100% of the shear stress in sand',
            'Total stress is always zero below the water table',
            'Effective stress only applies to dry rock'
          ], 0, 'Static pore water carries isotropic pressure with zero shear stiffness. Only the solid mineral skeleton (governed by interparticle effective stress sigma\') provides frictional resistance and skeletal stiffness.')
        ]
      },
      {
        id: 'MOD12-T3',
        code: '12.3',
        title: 'Permeability, Seepage, Drained vs Undrained Behaviour & Shear Strength',
        summary: 'Mohr-Coulomb drained strength tau = c\' + sigma\'*tan(phi\'), undrained shear strength tau = cu, Darcy’s law seepage, and short-term vs long-term critical states.',
        subtopics: [
          'Drained Mohr-Coulomb shear strength: tau_f = c\' + sigma\' * tan(phi\')',
          'Undrained clay shear strength: tau_f = cu (total stress analysis for short-term loading)',
          'Darcy’s law q = k * i * A and upward seepage critical hydraulic gradient'
        ],
        futureContentNote: 'Future expansion slot for triaxial testing (UU, CU, CD), shear box interpretation, and critical state soil mechanics.',
        assessmentQuestions: [
          qNum('MOD12-T3-Q1', 'MOD12-T3', 'Calculate drained shear strength of a cohesionless sand.', 'At a potential slip plane in dense sand (c\' = 0 kPa, phi\' = 35 deg), the effective normal stress is sigma\'_n = 100 kPa. Taking tan(35 deg) = 0.700, calculate the drained shear strength tau_f.', 'Use tau_f = c\' + sigma\'_n * tan(phi\').', 70, 'kPa', 0.5, 'tau_f = 0 + 100 * 0.700 = 70.0 kPa.'),
          qNum('MOD12-T3-Q2', 'MOD12-T3', 'Calculate drained shear strength when effective cohesion is present.', 'An overconsolidated clay in the long-term drained condition has c\' = 8 kPa and phi\' = 26.57 deg (so tan(phi\') = 0.500). If the effective normal stress on a plane is sigma\'_n = 80 kPa, calculate the drained shear strength tau_f.', 'Use tau_f = c\' + sigma\'_n * tan(phi\').', 48, 'kPa', 0.5, 'tau_f = 8 + 80 * 0.500 = 8 + 40 = 48.0 kPa.'),
          qNum('MOD12-T3-Q3', 'MOD12-T3', 'Calculate seepage flow rate using Darcy’s Law.', 'Water flows through a sand layer of cross-sectional area A = 12 m^2 under a hydraulic gradient i = 0.25. If the coefficient of permeability is k = 0.002 m/s, calculate the steady seepage flow rate Q (in L/s, noting 1 m^3/s = 1000 L/s).', 'Use Q = k * i * A in m^3/s, then multiply by 1000 for L/s.', 6, 'L/s', 0.1, 'Q = 0.002 * 0.25 * 12 = 0.006 m^3/s = 6.0 L/s.'),
          qMcq('MOD12-T3-Q4', 'MOD12-T3', 'Identify why temporary excavations in clay can fail after standing open for weeks.', 'A steep temporary trench or cutting is excavated in stiff clay. It stands safely on day 1, but collapses three weeks later after heavy rain. What is the primary geotechnical mechanism?', 'Compare unloading pore pressure response in clay from short term to long term.', [
            'Excavation unloading initially creates negative pore-water pressure (suction) that temporarily holds the clay together; over time water inflows, suction dissipates, effective stress drops, and the clay softens toward its lower drained strength',
            'The clay grains dissolve chemically in nitrogen from the air',
            'Gravity increases over the three-week period',
            'Clay always gains strength when unloaded and soaked'
          ], 0, 'Unloading a low-permeability clay induces negative excess pore pressures (suction) which temporarily maintain high effective stress. As water seeps in and suction dissipates, effective stress falls and the slope can fail.'),
          qMcq('MOD12-T3-Q5', 'MOD12-T3', 'Select the governing condition for a new pad foundation on saturated soft clay.', 'When a new pad foundation applies vertical compression load rapidly onto a saturated low-permeability soft clay, which bearing stability condition is normally most critical?', 'Consider positive excess pore water pressure generation under compression.', [
            'Short-term undrained bearing capacity (using cu), because positive excess pore pressures have not yet dissipated to increase effective stress',
            'Long-term condition 50 years later after full consolidation has strengthened the clay',
            'Purely dry rock mechanics',
            'Wind uplift on the clay'
          ], 0, 'Under rapid compressive loading of normal/lightly overconsolidated clay, positive excess pore pressures develop; as the clay consolidates over time, water drains out, void ratio decreases, and effective stress/strength increases. Hence short-term undrained bearing is normally critical.')
        ]
      },
      {
        id: 'MOD12-T4',
        code: '12.4',
        title: 'Immediate, Consolidation & Differential Settlement & Reading GI Reports',
        summary: 'Immediate elastic settlement vs long-term primary consolidation, angular distortion limits, differential settlement damage, and critical review of borehole logs and GI reports.',
        subtopics: [
          'Immediate (undrained/elastic) vs consolidation (time-dependent volume change) settlement',
          'Total settlement vs differential settlement and angular distortion beta = delta_s / L',
          'Critical reading of GI reports: Made Ground, water strikes, SPT N-values, and shrinkable clay hazards'
        ],
        futureContentNote: 'Future expansion slot for 1D oedometer mv and Cc calculations and Terzaghi time factor Tv consolidation rate.',
        assessmentQuestions: [
          qNum('MOD12-T4-Q1', 'MOD12-T4', 'Calculate 1D consolidation settlement using coefficient of volume compressibility mv.', 'A 3.0 m thick clay layer experiences an average vertical effective stress increase delta_sigma\' = 60 kPa due to a new foundation. If the coefficient of volume compressibility is mv = 0.25 m^2/MN (i.e. 0.00025 m^2/kN), calculate the primary consolidation settlement s_c (in mm).', 'Use s_c = mv * delta_sigma\' * H.', 45, 'mm', 0.5, 's_c = 0.00025 m^2/kN * 60 kN/m^2 * 3.0 m = 0.045 m = 45.0 mm.'),
          qNum('MOD12-T4-Q2', 'MOD12-T4', 'Calculate differential settlement between two adjacent column footings.', 'Column A settles by 28 mm and adjacent Column B (spaced 6.0 m away) settles by 10 mm. Calculate the differential settlement delta_s between the two columns.', 'Use delta_s = |s_A - s_B|.', 18, 'mm', 0.2, 'delta_s = 28 - 10 = 18.0 mm.'),
          qNum('MOD12-T4-Q3', 'MOD12-T4', 'Calculate the span-to-differential-settlement ratio (L / delta_s) for serviceability checking.', 'Two columns are spaced at L = 6.0 m (6000 mm) and experience a differential settlement delta_s = 12 mm. Express the angular distortion as the denominator N in the ratio 1 / N (where N = L / delta_s).', 'Calculate N = 6000 / 12.', 500, 'ratio', 2, 'N = 6000 mm / 12 mm = 500 (an angular distortion of 1/500, which is a common threshold for limiting cracking in framed buildings).'),
          qMcq('MOD12-T4-Q4', 'MOD12-T4', 'Explain why differential settlement is usually more damaging to structures than uniform settlement.', 'Why is differential settlement between adjacent foundations typically far more critical for structural distress and cracking than a uniform settlement of the entire building?', 'Consider induced bending moments, shears, and racking strains in the superstructure.', [
            'Differential settlement distorts the structural frame and masonry panels, inducing secondary bending moments, shear forces, and diagonal cracking, whereas modest uniform settlement moves the structure as a rigid body',
            'Uniform settlement always causes immediate roof collapse',
            'Differential settlement never affects brittle finishes or services',
            'Services entering the building are completely unaffected by 500 mm of movement'
          ], 0, 'Relative vertical movement between supports (angular distortion) racks infill panels and induces parasitic moments and shears in continuous frames.'),
          qMcq('MOD12-T4-Q5', 'MOD12-T4', 'Critically interpret Made Ground and single water-strike records in a GI report.', 'A site investigation report shows 1.6 m of variable Made Ground (brick rubble, ash, and soft clay pockets) and records "no water encountered during 2-hour cable percussion boring in October". Which engineering conclusion is valid?', 'Apply conservative geotechnical judgement.', [
            'Variable Made Ground should not be relied upon for unimproved shallow pad foundations, and absence of a water strike during a short drilling window does not prove groundwater will remain absent seasonally',
            'Made Ground has guaranteed uniform bearing capacity of 300 kPa',
            'A dry borehole during drilling guarantees the site will never have groundwater up to ground level in winter',
            'Standpipe monitoring is unnecessary in cohesive soils'
          ], 0, 'Uncontrolled Made Ground is highly heterogeneous and prone to collapse compression or differential settlement, and short-term drilling observations in low-permeability soils can miss seasonal or perched water tables.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD12-E01', 'MOD12-T1', 'Calculate Plasticity Index.', 'A high-plasticity clay has LL = 68% and PL = 25%. Calculate the Plasticity Index PI.', 'PI = LL - PL.', 43, '%', 0.1, 'PI = 68 - 25 = 43%.'),
      qNum('MOD12-E02', 'MOD12-T1', 'Calculate dry unit weight from bulk unit weight and moisture content.', 'A soil sample has bulk unit weight gamma_b = 20.7 kN/m^3 and moisture content w = 15% (0.15). Calculate the dry unit weight gamma_d.', 'gamma_d = gamma_b / (1 + w).', 18, 'kN/m^3', 0.05, 'gamma_d = 20.7 / 1.15 = 18.0 kN/m^3.'),
      qNum('MOD12-E03', 'MOD12-T1', 'Calculate submerged unit weight.', 'A saturated gravel has gamma_sat = 21.31 kN/m^3. Taking gamma_w = 9.81 kN/m^3, calculate the submerged unit weight gamma\'.', 'gamma\' = gamma_sat - gamma_w.', 11.5, 'kN/m^3', 0.05, 'gamma\' = 21.31 - 9.81 = 11.50 kN/m^3.'),
      qNum('MOD12-E04', 'MOD12-T1', 'Calculate porosity n from void ratio e.', 'A sand deposit has a void ratio e = 0.60. Calculate its porosity n = e / (1 + e).', 'Use n = e / (1 + e).', 0.375, 'ratio', 0.005, 'n = 0.60 / (1 + 0.60) = 0.60 / 1.60 = 0.375.'),
      qNum('MOD12-E05', 'MOD12-T2', 'Calculate total vertical stress in a two-layer ground profile.', 'Ground profile: 0 to 2.0 m dry sand (gamma = 17.5 kN/m^3); 2.0 m to 5.0 m saturated clay (gamma_sat = 19.5 kN/m^3). Calculate total vertical stress sigma_v at 5.0 m depth.', 'Sum gamma * thickness for each layer.', 93.5, 'kPa', 0.2, 'sigma_v = (17.5 * 2.0) + (19.5 * 3.0) = 35.0 + 58.5 = 93.5 kPa.'),
      qNum('MOD12-E06', 'MOD12-T2', 'Calculate pore-water pressure at depth in the two-layer profile.', 'In the same profile, the groundwater table is at 2.0 m depth. Taking gamma_w = 10.0 kN/m^3, calculate hydrostatic pore-water pressure u at 5.0 m depth.', 'u = gamma_w * (5.0 - 2.0).', 30, 'kPa', 0.2, 'u = 10.0 * 3.0 = 30.0 kPa.'),
      qNum('MOD12-E07', 'MOD12-T2', 'Calculate vertical effective stress in the two-layer profile.', 'With total vertical stress sigma_v = 93.5 kPa and pore-water pressure u = 30.0 kPa at 5.0 m depth, calculate the vertical effective stress sigma\'_v.', 'sigma\'_v = sigma_v - u.', 63.5, 'kPa', 0.2, 'sigma\'_v = 93.5 - 30.0 = 63.5 kPa.'),
      qNum('MOD12-E08', 'MOD12-T2', 'Calculate effective stress when a surface surcharge is applied.', 'If an extensive surface fill surcharge q = 20 kPa is placed over the site and pore-water pressures have fully returned to hydrostatic (u = 30.0 kPa), what is the new vertical effective stress sigma\'_v at 5.0 m depth (previously 63.5 kPa)?', 'Add the drained surcharge delta_sigma\' = q.', 83.5, 'kPa', 0.2, 'sigma\'_v = 63.5 + 20.0 = 83.5 kPa.'),
      qNum('MOD12-E09', 'MOD12-T3', 'Calculate drained Mohr-Coulomb shear strength of sand.', 'At 4 m depth in sand (c\' = 0, phi\' = 32 deg, tan(32 deg) = 0.625), the vertical effective stress is sigma\'_v = 64 kPa. Calculate the drained horizontal shear strength tau_f.', 'tau_f = sigma\'_v * tan(phi\').', 40, 'kPa', 0.5, 'tau_f = 64 * 0.625 = 40.0 kPa.'),
      qNum('MOD12-E10', 'MOD12-T3', 'Calculate reduced drained shear strength when groundwater rises.', 'If groundwater rises so that vertical effective stress at 4 m depth drops from 64 kPa to 36 kPa (with c\' = 0, tan(phi\') = 0.625), calculate the new drained shear strength tau_f.', 'tau_f = 36 * 0.625.', 22.5, 'kPa', 0.3, 'tau_f = 36 * 0.625 = 22.5 kPa (a 43.8% loss of frictional strength due to rising groundwater).'),
      qNum('MOD12-E11', 'MOD12-T3', 'Calculate undrained shear force capacity across a clay shear plane.', 'A firm clay has undrained shear strength cu = 55 kPa. Calculate the ultimate undrained horizontal shear resistance across a pad base of plan area A = 4.0 m^2.', 'Use V_u = cu * A.', 220, 'kN', 0.5, 'V_u = 55 kPa * 4.0 m^2 = 220.0 kN.'),
      qNum('MOD12-E12', 'MOD12-T3', 'Calculate critical upward hydraulic gradient for boiling/heave in sand.', 'A sand has saturated unit weight gamma_sat = 19.62 kN/m^3 and water has gamma_w = 9.81 kN/m^3. Calculate the critical upward hydraulic gradient i_c = gamma\' / gamma_w at which vertical effective stress becomes zero.', 'Use i_c = (gamma_sat - gamma_w) / gamma_w.', 1, 'ratio', 0.02, 'gamma\' = 19.62 - 9.81 = 9.81 kN/m^3. Therefore i_c = 9.81 / 9.81 = 1.00.'),
      qNum('MOD12-E13', 'MOD12-T4', 'Calculate primary consolidation settlement of a clay stratum.', 'A 4.0 m thick compressible clay layer (mv = 0.20 m^2/MN = 0.00020 m^2/kN) experiences an average effective stress increase of 75 kPa. Calculate the primary consolidation settlement (in mm).', 's_c = mv * delta_sigma\' * H.', 60, 'mm', 0.5, 's_c = 0.00020 * 75 * 4.0 = 0.060 m = 60.0 mm.'),
      qNum('MOD12-E14', 'MOD12-T4', 'Calculate angular distortion between two pad foundations.', 'Two pad foundations spaced at L = 7.5 m (7500 mm) settle by 25 mm and 10 mm respectively. Calculate the angular distortion beta = delta_s / L.', 'beta = (25 - 10) / 7500.', 0.002, 'rad', 0.0001, 'delta_s = 15 mm. beta = 15 / 7500 = 0.0020 rad (or 1/500).'),
      qMcq('MOD12-E15', 'MOD12-T1', 'Identify soil susceptibility to seasonal shrink-swell movement near trees.', 'Which soil property extracted from a Ground Investigation report is the primary indicator of volume change potential (shrinkage and heave) near trees and hedgerows?', 'Recall NHBC / BRE Digest 240 classification principles.', [
            'Plasticity Index (PI = LL - PL, adjusted for percentage passing the 425 micron sieve)',
            'Dry gravel boulder diameter',
            'Colour of the borehole log header',
            'Concrete cube strength'
          ], 0, 'High Plasticity Index clays undergo significant seasonal moisture volume changes and tree-root desiccation shrinkage or post-felling heave.'),
      qMcq('MOD12-E16', 'MOD12-T2', 'Explain why pumping from an unlined excavation in sand can trigger base instability.', 'If water is pumped directly from the sump of a sheet-piled excavation in fine sand with a high external water table, what hazard can occur at the excavation base?', 'Consider upward seepage and pore pressure gradient.', [
            'Upward seepage into the excavation reduces vertical effective stress at the base; if the upward hydraulic gradient approaches i_c, piping or boiling (liquefaction of the base) occurs',
            'The sand turns into solid granite',
            'Effective stress at the base doubles',
            'Sheet pile bending moments drop to zero'
          ], 0, 'Upward seepage exerts an upward drag on the soil grains, reducing sigma\'_v and risking base boiling/heave.'),
      qMcq('MOD12-E17', 'MOD12-T3', 'Select parameters for long-term stability of a permanent cut slope in overconsolidated clay.', 'Which shear strength parameters must be used to verify the long-term (50-year) stability of a permanent cutting in stiff overconsolidated clay?', 'Consider dissipation of excavation-induced negative pore pressures.', [
            'Effective stress parameters (c\' and phi\') with realistic long-term equilibrium pore-water pressures',
            'Initial short-term undrained shear strength cu measured before excavation',
            'Unconfined compressive strength of steel',
            'Zero pore-water pressure regardless of winter rainfall'
          ], 0, 'Long-term slope stability in clay is governed by drained effective stress parameters (c\', phi\') and worst-case credible pore-water pressures.'),
      qMcq('MOD12-E18', 'MOD12-T4', 'Identify the time-dependency difference between sand and clay settlement.', 'How does the timing of foundation settlement on clean sand compare with that on a thick saturated clay layer?', 'Compare permeability and drainage path timescales.', [
            'Settlement on clean sand occurs almost immediately as construction load is applied, whereas primary consolidation settlement in thick low-permeability clay takes months or years as pore water slowly drains',
            'Clean sand takes 50 years to start settling whereas clay finishes in 2 seconds',
            'Neither sand nor clay ever settles under load',
            'Both occur exclusively 10 years after demolition'
          ], 0, 'High permeability in sand allows immediate drainage and grain rearrangement during construction, while low permeability in clay delays consolidation settlement.'),
      qMcq('MOD12-E19', 'MOD12-T4', 'Evaluate foundation strategy when a structure straddles two different ground conditions.', 'A proposed building footprint sits half on shallow bedrock and half on 4 m of compressible clay. Why is placing simple shallow strip footings across both halves without mitigation bad engineering practice?', 'Consider differential settlement at the transition.', [
            'The half on compressible clay will settle significantly more than the half on rock, causing severe differential settlement and structural cracking at the transition',
            'Bedrock settles more than soft clay',
            'Strip footings cannot be cast in concrete',
            'The building will float upward on the rock side'
          ], 0, 'Mixed foundations or abrupt changes in bearing stratum stiffness cause severe differential settlement unless mitigated by piling, ground improvement, movement joints, or stiffened raft/transfer design.'),
      qMcq('MOD12-E20', 'MOD12-T2', 'Pass the Module 12 Learning Gate: Explain why water level changes can govern stability and bearing.', 'Which statement best summarises why groundwater level changes can govern foundation bearing capacity, slope stability, and retaining wall design?', 'Synthesise Terzaghi’s effective stress principle and hydrostatic loading.', [
            'Rising groundwater simultaneously increases pore-water pressure u (reducing effective stress sigma\' = sigma - u and frictional shear strength in the soil skeleton) and adds direct hydrostatic water thrusts onto retaining structures and slabs',
            'Groundwater changes only affect paint colours above roof level',
            'Rising groundwater increases effective stress and makes slopes steeper',
            'Water pressure is resisted by soil friction with zero effect on total thrust'
          ], 0, 'Groundwater rises both penalise resistance (by reducing effective stress and soil shear strength) and increase actions (hydrostatic uplift and lateral water pressure).')
    ]
  },
  {
    id: 'MOD-13',
    moduleNumber: 13,
    title: 'Foundations and Retaining Structures',
    shortTitle: 'Foundations & Retaining Walls',
    summary: 'Shallow vs deep foundation selection, pad foundation sizing and checks (bearing, eccentricity, sliding, overturning, bending, one-way shear, punching shear), and retaining wall earth pressure and stability.',
    whyItMatters: 'Pad foundations, strip footings, ground beams, and retaining walls sit at the boundary between structural engineering and geotechnics. A safe design must satisfy both external geotechnical stability and internal structural strength.',
    objectives: [
      'Select appropriate foundation types (strip, pad, raft, piles, ground beams, underpinning awareness) for given ground and load conditions.',
      'Size a pad foundation for concentric and eccentric loading, including the middle-third rule, sliding, and overturning checks.',
      'Calculate Rankine active (Ka), passive (Kp), and at-rest (K0) lateral earth pressures plus hydrostatic water pressures.',
      'Verify retaining wall global stability (sliding, overturning, bearing) and internal RC stem/base design actions.'
    ],
    learningGate: 'Size a pad foundation and explain every stability check on a gravity or cantilever retaining wall.',
    WorkedExamples: [
      {
        id: 'EX-13.1',
        title: 'Project 13.1: Pad Foundation Design & Gravity/Cantilever Retaining Wall Stability',
        brief: 'Size a square pad foundation for axial load + moment, verify middle-third bearing pressures, and check a 3.0 m high cantilever retaining wall for sliding, overturning, and base bearing.',
        checklist: [
          'Size pad plan area B x L so peak bearing pressure q_max <= allowable bearing pressure (including self-weight of pad and backfill).',
          'Check eccentricity e = M / N <= B / 6 so no uplift occurs under service loads.',
          'Check internal pad bending moment at column face, one-way beam shear at d from column face, and punching shear at 2d perimeter.',
          'For the retaining wall, compute Rankine Ka = (1 - sin phi\') / (1 + sin phi\'), active thrust Pa, overturning factor of safety, sliding resistance, and base bearing.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD13-T1',
        code: '13.1',
        title: 'Foundation Types: Strip, Pad, Raft, Piles, Ground Beams & Underpinning',
        summary: 'Selecting shallow vs deep foundations, tree proximity on shrinkable clay, ground beams with void formers, and sequence-critical underpinning hazards.',
        subtopics: [
          'Shallow foundations: strip footings, isolated pads, combined pads, and stiffened rafts',
          'Deep foundations: bored and driven piles (end-bearing vs skin friction) and pile caps with ground beams',
          'Underpinning awareness: hit-and-miss sequence, temporary support, and excavation safety'
        ],
        futureContentNote: 'Future expansion slot for pile group efficiency, negative skin friction (downdrag), and NHBC Chapter 4.2 heave protection detailing.',
        assessmentQuestions: [
          qNum('MOD13-T1-Q1', 'MOD13-T1', 'Determine minimum square pad width for concentric serviceability bearing.', 'A column transmits a characteristic vertical service load N_k = 540 kN (including pad self-weight allowance). If the allowable net bearing pressure of the ground is q_allow = 150 kPa, calculate the minimum required square pad width B.', 'Use A_req = N_k / q_allow and B = sqrt(A_req).', 1.9, 'm', 0.05, 'A_req = 540 / 150 = 3.60 m^2. Square width B = sqrt(3.60) = 1.897 m (approx 1.90 m).'),
          qNum('MOD13-T1-Q2', 'MOD13-T1', 'Calculate ultimate shaft friction capacity of a bored pile in clay.', 'A bored pile of diameter D = 0.60 m has an effective shaft length L = 10.0 m in firm-to-stiff clay with average ultimate unit shaft skin friction f_su = 35 kPa (taking pi = 3.1416). Calculate the ultimate shaft friction capacity R_su.', 'Use R_su = pi * D * L * f_su.', 659.7, 'kN', 2.0, 'Perimeter = 3.1416 * 0.60 = 1.885 m. Shaft area A_s = 1.885 * 10.0 = 18.85 m^2. R_su = 18.85 * 35 = 659.7 kN.'),
          qMcq('MOD13-T1-Q3', 'MOD13-T1', 'Select an appropriate foundation system for deep soft clay over dense gravel.', 'A multi-storey framed building has column loads of 1800 kN. The ground profile consists of 6.0 m of very soft alluvial peat and clay overlying dense sandy gravel. Which foundation solution is most appropriate?', 'Consider bearing capacity and settlement in 6 m of peat/soft clay.', [
            'Piled foundations transferring loads through the soft alluvium into the dense gravel stratum, with suspended ground beams and floor slab',
            'Shallow 0.6 m deep pad footings founded directly in the soft peat',
            'Unreinforced 100 mm ground-bearing slab on top of the peat',
            'Removing all columns'
          ], 0, 'Shallow pads in 6 m of soft peat/clay would fail in bearing or suffer excessive settlement; piles bypass the weak upper strata into the competent gravel.'),
          qMcq('MOD13-T1-Q4', 'MOD13-T1', 'Explain the purpose of compressible void formers beneath ground beams in high-plasticity clay.', 'When piles and ground beams are constructed in desiccated high-plasticity clay where trees have been removed, why is a compressible void former (or void) installed beneath the ground beams and suspended slab?', 'Consider clay swelling (heave) as moisture returns.', [
            'To allow the clay to swell upward without exerting massive upward heave forces onto the underside of the ground beams and floor slab',
            'To make the concrete cure faster',
            'To increase skin friction on the underside of the slab',
            'To store rainwater under the building'
          ], 0, 'As desiccated clay rehydrates, it swells upward with high pressure; void formers compress at low stress to isolate the suspended structure from heave forces.'),
          qMcq('MOD13-T1-Q5', 'MOD13-T1', 'Identify why traditional mass concrete underpinning is executed in strict "hit-and-miss" bays.', 'Why must traditional mass concrete underpinning beneath an existing loadbearing brick wall be excavated and cast in short alternating bays (e.g. 1.0 m to 1.2 m wide, with only a small fraction of the wall length open at once)?', 'Consider temporary vertical support of the existing wall.', [
            'So the existing wall can arch safely across each short excavated bay onto the adjacent unexcavated ground or cured pins without losing support and collapsing',
            'Because ready-mix concrete trucks can only carry 0.5 m^3',
            'To allow the whole wall to settle by 100 mm',
            'To avoid using formwork on the vertical faces'
          ], 0, 'Continuous trenching under an existing foundation removes its vertical support and causes collapse; short sequenced pins preserve load-arching into adjacent supported lengths.')
        ]
      },
      {
        id: 'MOD13-T2',
        code: '13.2',
        title: 'Pad Foundation Checks: Bearing, Eccentricity, Sliding, Bending & Shear',
        summary: 'Eccentric base pressure distribution, middle-third rule (e <= B/6), cantilever bending at column face, one-way beam shear at d, and punching shear at 2d perimeter.',
        subtopics: [
          'Eccentric bearing pressure: q = N/A +/- 6*N*e / (B * L^2) when e <= L/6',
          'Cantilever bending moment in pad projection at the column face',
          'One-way wide-beam shear at distance d from column face and two-way punching shear around column'
        ],
        futureContentNote: 'Future expansion slot for Eurocode 7 Design Approach 1 Combination 1 and Combination 2 partial factors.',
        assessmentQuestions: [
          qNum('MOD13-T2-Q1', 'MOD13-T2', 'Check load eccentricity against the middle-third limit.', 'A square pad foundation of width B = 2.4 m carries a vertical load N = 600 kN and an overturning moment M = 180 kNm. Calculate the load eccentricity e = M / N.', 'Use e = M / N and compare against B/6 = 0.40 m.', 0.3, 'm', 0.01, 'e = 180 / 600 = 0.30 m (which is <= B/6 = 2.4/6 = 0.40 m, so the full base remains in compression).'),
          qNum('MOD13-T2-Q2', 'MOD13-T2', 'Calculate maximum edge bearing pressure under eccentric loading within the middle third.', 'For the 2.4 m x 2.4 m square pad carrying N = 600 kN with eccentricity e = 0.30 m (in one direction), calculate the maximum edge bearing pressure q_max.', 'Use q_max = (N / B^2) * (1 + 6*e / B).', 182.3, 'kPa', 0.5, 'Average pressure N / B^2 = 600 / 5.76 = 104.17 kPa. Multiplier (1 + 6*0.30 / 2.4) = 1 + 0.75 = 1.75. Therefore q_max = 104.17 * 1.75 = 182.3 kPa.'),
          qNum('MOD13-T2-Q3', 'MOD13-T2', 'Calculate ULS cantilever bending moment at the face of a column in a pad foundation.', 'A square pad foundation B = 2.4 m supports a central 0.40 m square column. Under ULS loads, the uniform upward net ground bearing pressure is q_Ed = 200 kPa. Calculate the total ULS bending moment M_Ed across the full 2.4 m pad width at the face of the column.', 'Cantilever projection c = (2.4 - 0.40) / 2 = 1.0 m. Use M_Ed = q_Ed * B * c^2 / 2.', 240, 'kNm', 1.0, 'Projection c = (2.4 - 0.40)/2 = 1.0 m. Upward load per metre of projection = q_Ed * B = 200 * 2.4 = 480 kN/m. Moment at column face M_Ed = 480 * 1.0^2 / 2 = 240.0 kNm.'),
          qNum('MOD13-T2-Q4', 'MOD13-T2', 'Calculate ULS one-way wide-beam shear force at distance d from the column face.', 'In the same 2.4 m square pad (column width 0.40 m, cantilever projection c = 1.0 m, upward net pressure q_Ed = 200 kPa), the effective depth of the pad is d = 0.45 m. Calculate the ULS one-way shear force V_Ed across the full 2.4 m width at a section located at distance d from the column face.', 'Shear strip width remaining outside d is (c - d) = 1.0 - 0.45 = 0.55 m. Use V_Ed = q_Ed * B * (c - d).', 264, 'kN', 1.0, 'Remaining strip width = 1.0 - 0.45 = 0.55 m. Shear area = 2.4 m * 0.55 m = 1.32 m^2. V_Ed = 200 kPa * 1.32 m^2 = 264.0 kN.'),
          qMcq('MOD13-T2-Q5', 'MOD13-T2', 'Distinguish pad self-weight treatment in serviceability bearing vs ULS bending.', 'Why does a uniform pad foundation’s own concrete self-weight increase the gross ground bearing pressure beneath the pad, yet produce zero net bending moment in the pad slab when the ground reaction is uniform?', 'Consider the upward reaction directly opposing the downward self-weight.', [
            'Because the uniform downward self-weight of the concrete pad is locally balanced point-for-point by an equal and opposite uniform upward ground pressure, producing no net shear or bending in the pad',
            'Because concrete is weightless at the Ultimate Limit State',
            'Because pad foundations never experience upward reaction from soil',
            'Because column loads bypass the soil'
          ], 0, 'Gross bearing pressure on the soil must support both the column load and the pad self-weight, but internal pad bending is driven by the net upward pressure from the concentrated column load.')
        ]
      },
      {
        id: 'MOD13-T3',
        code: '13.3',
        title: 'Retaining Structures: Earth Pressures, Water Pressure, Drainage & Global Stability',
        summary: 'Rankine Ka, Kp, and K0 earth pressure coefficients, surcharge pressures, hydrostatic water pressures behind undrained walls, and sliding, overturning, and bearing checks.',
        subtopics: [
          'Active (Ka), passive (Kp), and at-rest (K0 = 1 - sin phi\') lateral earth pressure states',
          'Triangular soil pressure (0.5 * Ka * gamma * H^2) vs uniform surcharge pressure (Ka * q * H)',
          'Global stability modes: overturning about toe, horizontal sliding on base, bearing capacity, and deep slip'
        ],
        futureContentNote: 'Future expansion slot for embedded sheet-pile walls, propped basement walls (K0), and wall drainage detailing.',
        assessmentQuestions: [
          qNum('MOD13-T3-Q1', 'MOD13-T3', 'Calculate Rankine active earth pressure coefficient Ka.', 'A granular backfill behind a smooth vertical retaining wall has a horizontal surface and an effective angle of shearing resistance phi\' = 30 deg (sin 30 deg = 0.50). Calculate the Rankine active earth pressure coefficient Ka.', 'Use Ka = (1 - sin phi\') / (1 + sin phi\').', 0.333, 'ratio', 0.005, 'Ka = (1 - 0.50) / (1 + 0.50) = 0.50 / 1.50 = 0.333.'),
          qNum('MOD13-T3-Q2', 'MOD13-T3', 'Calculate total active horizontal earth thrust per metre run of wall.', 'A vertical retaining wall retains H = 3.0 m of dry granular backfill with unit weight gamma = 18 kN/m^3 and Ka = 0.3333 (1/3). Calculate the total horizontal active earth force P_a (in kN/m run of wall).', 'Use P_a = 0.5 * Ka * gamma * H^2.', 27, 'kN/m', 0.2, 'P_a = 0.5 * (1/3) * 18 * 3.0^2 = 3.0 * 9.0 = 27.0 kN/m.'),
          qNum('MOD13-T3-Q3', 'MOD13-T3', 'Calculate overturning moment about the wall base from triangular active earth pressure.', 'For the H = 3.0 m wall with triangular active thrust P_a = 27.0 kN/m acting at H / 3 above the base, calculate the overturning moment M_ovt about the base per metre run.', 'Use M_ovt = P_a * (H / 3).', 27, 'kNm/m', 0.2, 'Lever arm z = 3.0 / 3 = 1.0 m. M_ovt = 27.0 * 1.0 = 27.0 kNm/m.'),
          qNum('MOD13-T3-Q4', 'MOD13-T3', 'Calculate horizontal thrust from a uniform surface surcharge behind a retaining wall.', 'A uniform surcharge q = 10 kPa acts on top of the retained backfill behind a H = 3.0 m wall with Ka = 0.3333 (1/3). Calculate the additional horizontal active thrust P_q per metre run caused by the surcharge.', 'Use P_q = Ka * q * H.', 10, 'kN/m', 0.2, 'P_q = (1/3) * 10 * 3.0 = 10.0 kN/m (acting at mid-height H/2 = 1.5 m).'),
          qMcq('MOD13-T3-Q5', 'MOD13-T3', 'Explain when at-rest earth pressure (K0) must be used instead of active pressure (Ka).', 'Why must a rigid basement wall propped at ground floor level be designed for at-rest earth pressure (K0 ≈ 1 - sin phi\') rather than the lower active earth pressure (Ka)?', 'Consider the horizontal wall movement required to mobilise the active state.', [
            'Mobilising the lower active pressure Ka requires the wall to yield/tilt outward slightly; a stiff propped basement wall cannot move outward sufficiently to let the soil expand into the active state',
            'Propped basement walls only retain air',
            'Active pressure Ka is always larger than K0',
            'Soil friction disappears next to basements'
          ], 0, 'Active pressure Ka is a lower-bound limit state requiring outward wall movement (~0.1% to 0.4% of wall height). Unyielding propped walls experience higher at-rest pressures K0.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD13-E01', 'MOD13-T1', 'Calculate required width of a strip footing.', 'A masonry wall applies a characteristic vertical service load of 135 kN/m (including footing weight). If the allowable ground bearing pressure is 150 kPa, calculate the minimum strip footing width B.', 'Use B = N / q_allow.', 0.9, 'm', 0.02, 'B = 135 / 150 = 0.90 m.'),
      qNum('MOD13-E02', 'MOD13-T1', 'Calculate ultimate end-bearing capacity of a bored pile.', 'A 0.60 m diameter pile (base area A_b = 0.2827 m^2) is founded in stiff clay with cu = 150 kPa. Using bearing capacity factor N_c = 9, calculate the ultimate base resistance R_bu = N_c * cu * A_b.', 'Use R_bu = 9 * 150 * 0.2827.', 381.6, 'kN', 2.0, 'R_bu = 9 * 150 * 0.2827 = 1350 * 0.2827 = 381.6 kN.'),
      qNum('MOD13-E03', 'MOD13-T2', 'Calculate middle-third limiting eccentricity for a rectangular pad.', 'A rectangular pad foundation has length L = 3.0 m in the plane of bending. What is the maximum load eccentricity e_max before uplift (zero pressure) begins at the heel edge?', 'Use e_max = L / 6.', 0.5, 'm', 0.01, 'e_max = 3.0 / 6 = 0.50 m.'),
      qNum('MOD13-E04', 'MOD13-T2', 'Calculate minimum edge pressure under eccentric loading within the middle third.', 'A 3.0 m x 2.0 m pad (area A = 6.0 m^2, L = 3.0 m) carries vertical load N = 600 kN at eccentricity e = 0.25 m along the 3.0 m direction. Calculate the minimum edge bearing pressure q_min.', 'Use q_min = (N / A) * (1 - 6*e / L).', 50, 'kPa', 0.5, 'N / A = 600 / 6.0 = 100 kPa. Factor (1 - 6*0.25 / 3.0) = 1 - 0.50 = 0.50. q_min = 100 * 0.50 = 50.0 kPa.'),
      qNum('MOD13-E05', 'MOD13-T2', 'Calculate maximum edge bearing pressure when eccentricity exceeds L/6 (triangular bearing block).', 'A rectangular pad of width B = 2.0 m and length L = 3.0 m carries N = 450 kN at an eccentricity e = 0.75 m (so distance from load to compressed edge is c = L/2 - e = 0.75 m). Since e > L/6, the bearing block is triangular over length 3*c = 2.25 m. Calculate peak edge pressure q_max.', 'Use q_max = 2 * N / (3 * c * B).', 200, 'kPa', 1.0, 'Compressed length = 3 * 0.75 = 2.25 m. Compressed area = 2.25 * 2.0 = 4.50 m^2. Average pressure on compressed zone = 450 / 4.50 = 100 kPa; peak triangular pressure q_max = 2 * 100 = 200.0 kPa.'),
      qNum('MOD13-E06', 'MOD13-T2', 'Calculate basic punching shear perimeter u_1 at 2d from a square column.', 'A 0.40 m x 0.40 m internal square column sits on a pad foundation with effective depth d = 0.40 m. Calculate the length of the EC2 basic control perimeter u_1 at distance 2d from the column face (using pi = 3.1416).', 'Use u_1 = 4 * c_col + 2 * pi * (2 * d).', 6.63, 'm', 0.05, '2*d = 0.80 m. u_1 = 4*(0.40) + 2 * 3.1416 * 0.80 = 1.60 + 5.0265 = 6.63 m.'),
      qNum('MOD13-E07', 'MOD13-T2', 'Check horizontal sliding resistance of a pad foundation.', 'A pad foundation carries a minimum vertical effective load N\'_d = 400 kN and a horizontal design shear H_d = 120 kN. If the base interface friction angle is delta_d = 24 deg (tan 24 deg = 0.445), calculate the horizontal sliding resistance R_hd = N\'_d * tan(delta_d).', 'Use R_hd = 400 * 0.445.', 178, 'kN', 0.5, 'R_hd = 400 * 0.445 = 178.0 kN (which exceeds H_d = 120 kN).'),
      qNum('MOD13-E08', 'MOD13-T3', 'Calculate Rankine passive earth pressure coefficient Kp.', 'For a granular soil with phi\' = 30 deg (sin 30 deg = 0.50), calculate the Rankine passive earth pressure coefficient Kp = (1 + sin phi\') / (1 - sin phi\').', 'Use Kp = (1 + 0.50) / (1 - 0.50).', 3, 'ratio', 0.02, 'Kp = 1.50 / 0.50 = 3.00.'),
      qNum('MOD13-E09', 'MOD13-T3', 'Calculate at-rest earth pressure coefficient K0 using Jaky’s formula.', 'For a normally consolidated granular backfill with phi\' = 30 deg (sin 30 deg = 0.50), calculate K0 = 1 - sin(phi\').', 'Use K0 = 1 - 0.50.', 0.5, 'ratio', 0.01, 'K0 = 1 - 0.50 = 0.50.'),
      qNum('MOD13-E10', 'MOD13-T3', 'Calculate active earth thrust on a 4.0 m high retaining wall.', 'A 4.0 m high retaining wall retains dry backfill with gamma = 18 kN/m^3 and Ka = 0.30. Calculate the horizontal active earth thrust P_a per metre run.', 'Use P_a = 0.5 * Ka * gamma * H^2.', 43.2, 'kN/m', 0.2, 'P_a = 0.5 * 0.30 * 18 * 4.0^2 = 2.7 * 16 = 43.2 kN/m.'),
      qNum('MOD13-E11', 'MOD13-T3', 'Calculate overturning moment at the base of the 4.0 m wall.', 'With active thrust P_a = 43.2 kN/m acting at H / 3 = 1.3333 m above the base of the 4.0 m wall, calculate the overturning moment M_ovt per metre run.', 'Use M_ovt = P_a * (H / 3).', 57.6, 'kNm/m', 0.3, 'M_ovt = 43.2 * (4.0 / 3) = 57.6 kNm/m.'),
      qNum('MOD13-E12', 'MOD13-T3', 'Compare total horizontal thrust when weepholes clog and groundwater rises to the top of the wall.', 'A 3.0 m high wall retains saturated sand (gamma_sat = 20 kN/m^3, gamma_w = 10 kN/m^3, so gamma\' = 10 kN/m^3, and Ka = 1/3). If drainage fails and water rises to the full 3.0 m height, calculate the combined horizontal thrust P_total = P\'_soil + P_water per metre run.', 'P\'_soil = 0.5 * Ka * gamma\' * H^2 and P_water = 0.5 * gamma_w * H^2.', 60, 'kN/m', 0.5, 'Effective soil thrust P\'_soil = 0.5 * (1/3) * 10 * 3.0^2 = 15.0 kN/m. Hydrostatic water thrust P_water = 0.5 * 10 * 3.0^2 = 45.0 kN/m. Total thrust P_total = 15.0 + 45.0 = 60.0 kN/m (more than double the 27 kN/m dry thrust!).'),
      qNum('MOD13-E13', 'MOD13-T3', 'Calculate stabilising moment about the toe of a gravity retaining wall.', 'A gravity retaining wall has total vertical weight W = 120 kN/m acting at a lever arm x_W = 1.15 m behind the front toe. Calculate the stabilising moment M_stab about the toe.', 'Use M_stab = W * x_W.', 138, 'kNm/m', 0.5, 'M_stab = 120 * 1.15 = 138.0 kNm/m.'),
      qNum('MOD13-E14', 'MOD13-T3', 'Locate the resultant vertical reaction on a retaining wall base.', 'A retaining wall base of width B = 2.4 m has total vertical load N = 150 kN/m, stabilising moment about the toe M_stab = 225 kNm/m, and overturning moment M_ovt = 75 kNm/m. Calculate the distance x_R from the toe to the vertical resultant.', 'Use x_R = (M_stab - M_ovt) / N.', 1, 'm', 0.02, 'Net moment about toe = 225 - 75 = 150 kNm/m. Distance from toe x_R = 150 / 150 = 1.00 m (eccentricity from base centreline e = 1.20 - 1.00 = 0.20 m <= B/6 = 0.40 m).'),
      qMcq('MOD13-E15', 'MOD13-T3', 'Explain why passive resistance in front of a shallow retaining wall toe is often ignored or heavily reduced.', 'Why do engineers frequently ignore or conservatively discount the passive earth pressure in front of the shallow toe of a cantilever retaining wall when checking sliding stability?', 'Consider excavation disturbance, utility trenches, and large strain needed to mobilise Kp.', [
            'The shallow soil in front of the toe may be dug up later for services/landscaping, shrinks/softens seasonally, and requires large horizontal wall movement to mobilise full passive resistance',
            'Passive earth pressure acts in the same direction as active pressure',
            'Soil in front of a wall has zero mass',
            'Passive resistance is only present in water'
          ], 0, 'Full passive resistance requires large horizontal displacement (often 1%–4% of embedment depth) and shallow front cover is vulnerable to future utility trenching or shrinkage cracks.'),
      qMcq('MOD13-E16', 'MOD13-T3', 'Identify the structural role of a shear key beneath a cantilever retaining wall base.', 'When a cantilever retaining wall has insufficient sliding resistance along its horizontal base interface, how does a projecting downward concrete shear key (heel nib) improve sliding stability?', 'Consider the failure plane and passive wedge engaged by the nib.', [
            'It forces the sliding failure plane deeper into undisturbed soil and mobilises additional passive resistance over the depth of the shear key',
            'It reduces the weight of the backfill above the heel',
            'It eliminates bending in the vertical stem',
            'It drains water through the concrete'
          ], 0, 'A base key shifts the potential sliding surface down into intact ground (soil-on-soil shearing) and engages a deeper passive resistance zone.'),
      qMcq('MOD13-E17', 'MOD13-T3', 'Locate the primary tension reinforcement face in an L-shaped cantilever retaining wall stem.', 'In a reinforced concrete L-shaped cantilever retaining wall supporting backfill behind its vertical stem, on which face of the vertical stem must the primary vertical tension reinforcement be placed?', 'Visualise the stem bending as a vertical cantilever fixed into the base slab.', [
            'On the rear (earth-retaining) face of the stem, where the horizontal earth pressure puts the stem into tension',
            'On the front (exposed) face only',
            'Along the neutral axis at mid-thickness only',
            'Only in the top 50 mm capping beam'
          ], 0, 'Horizontal earth pressure pushes the stem forward as a vertical cantilever fixed at the base, placing the rear (backfill) face in vertical tension.'),
      qMcq('MOD13-E18', 'MOD13-T3', 'Locate the primary tension reinforcement face in the heel slab of a cantilever retaining wall.', 'In a cantilever retaining wall with a long rear heel slab supporting heavy backfill above it, which face of the rear heel slab is typically in tension when the upward soil bearing pressure beneath the heel is smaller than the downward weight of the backfill and heel?', 'Draw the free-body diagram of the heel cantilevering backward from the stem.', [
            'The top face of the heel slab, because the heavy overburden soil pushes the heel downward relative to the stem root',
            'The bottom face only, identical to the front toe',
            'Neither face experiences bending',
            'Only the vertical end face of the heel'
          ], 0, 'The front toe bends upward (bottom tension), whereas the rear heel is typically weighed down by the heavy prism of backfill above it while bearing pressure at the heel is low, bending the heel downward (top tension).'),
      qMcq('MOD13-E19', 'MOD13-T1', 'Identify when a combined pad or strap footing is used.', 'When is a combined pad foundation (supporting two columns) or a strap beam footing typically chosen over an isolated square pad?', 'Consider a perimeter column immediately adjacent to a site boundary.', [
            'When an edge column sits hard against a property boundary so the pad cannot project symmetrically, or when two columns are so close that isolated pads would overlap',
            'Only when column loads are less than 5 kN',
            'To avoid using reinforcement in the foundation',
            'When the building has no columns'
          ], 0, 'Boundary constraints force an isolated pad to be heavily eccentric; combining it with an internal column or linking via a stiff strap beam centres the ground reaction.'),
      qMcq('MOD13-E20', 'MOD13-T2', 'Pass the Module 13 Learning Gate: Synthesise external geotechnical stability and internal structural checks.', 'Which set of checks is required to fully verify both a pad foundation and a cantilever retaining wall?', 'Combine external GEO/EQU limit states with internal STR limit states.', [
            'External geotechnical stability (bearing capacity, eccentricity/overturning, horizontal sliding, global slip, and settlement) AND internal structural capacity (bending, one-way shear, punching shear, and reinforcement anchorage)',
            'Only checking that average bearing pressure is below 150 kPa',
            'Only checking the stem bending moment without checking sliding or bearing',
            'Checking only self-weight of the concrete'
          ], 0, 'A structurally strong pad or wall can still slide, overturn, or punch into weak soil, and a geotechnically large base can still snap in bending or shear if under-reinforced.')
    ]
  },
  {
    id: 'MOD-14',
    moduleNumber: 14,
    title: 'Reinforced Concrete Design to EC2',
    shortTitle: 'Reinforced Concrete (EC2)',
    summary: 'Composite steel-concrete behaviour, strain compatibility, ductile under-reinforced flexural design, shear links, anchorage and lap lengths, slabs, punching shear, columns, durability cover, and temporary propping/backpropping.',
    whyItMatters: 'Reinforced concrete relies on tension steel and compression concrete working together with adequate bond, anchorage, cover, and ductility. Furthermore, early-age RC slabs are often critical during construction striking and backpropping.',
    objectives: [
      'Explain RC composite behaviour, cracked vs uncracked sections, neutral axis depth limit (x/d <= 0.45), and ductile under-reinforced design.',
      'Design singly and doubly reinforced beams for flexure, variable-strut shear links, anchorage, laps, curtailment, and span-to-effective-depth deflection control.',
      'Analyse one-way and two-way slabs, flat slab punching shear, and RC columns under axial load plus moment (including slenderness awareness).',
      'Assess construction-stage formwork striking, prop loads, and multi-storey backpropping onto immature RC slabs.'
    ],
    learningGate: 'Produce a complete beam and slab design including reinforcement sketch, cover, laps and buildability check.',
    WorkedExamples: [
      {
        id: 'EX-14.1',
        title: 'Project 14.1: Simply Supported & Continuous RC Beam Design to EC2',
        brief: 'Design a 6.5 m span RC beam (300 mm x 550 mm, C30/37, fyk = 500 MPa) for flexure, shear links, curtailment, anchorage, cover, and span/d check.',
        checklist: [
          'Calculate effective depth d = h - c_nom - d_link - d_bar/2.',
          'Compute K = M_Ed / (b * d^2 * fck), compare against K\' = 0.168 (for x/d <= 0.45), and find lever arm z and As_req.',
          'Check concrete strut capacity V_Rd,max and size vertical shear links Asw/s.',
          'Verify basic span-to-effective-depth ratio L/d and sketch bar curtailment and lap zones.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-14.2',
        title: 'Project 14.2: One-Way Solid Slab & Flat Slab Punching Shear Check',
        brief: 'Design a 1.0 m wide strip of a one-way spanning RC slab for flexure, minimum/secondary reinforcement, deflection, and check punching shear around a column.',
        checklist: [
          'Design flexural steel As per metre width and check minimum reinforcement As,min and maximum bar spacing.',
          'Provide 20% secondary transverse distribution reinforcement.',
          'Evaluate punching shear stress v_Ed on the basic control perimeter u_1 at 2d from the column face.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-14.3',
        title: 'Project 14.3: Construction Stage Backpropping of RC Slabs (Syllabus [UI1] Requirement)',
        brief: 'Assess the construction load shared between two existing suspended RC slabs when falsework props for casting Level 3 are supported on Level 2 and backpropped to Level 1.',
        checklist: [
          'Sum wet concrete slab weight, formwork/falsework weight, and construction live load (minimum 0.75 to 1.5 kPa per BS 5975 / EC1-1-6).',
          'Distribute prop loads between supporting slabs in proportion to their relative flexural stiffnesses, accounting for early-age concrete strength and creep/cracking.',
          'Compare total construction-stage load on each supporting slab against its early-age capacity and permanent-works design load.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD14-T1',
        code: '14.1',
        title: 'RC Behaviour, Strain Compatibility, Neutral Axis, Lever Arm & Ductility',
        summary: 'Concrete compression vs steel tension, EC2 rectangular stress block, fcd and fyd design strengths, neutral axis ratio x/d <= 0.45, K-factor method, and why over-reinforced brittle failure is avoided.',
        subtopics: [
          'Material design strengths: fcd = alpha_cc * fck / gamma_c and fyd = fyk / gamma_s',
          'Strain compatibility: ultimate concrete compressive strain eps_cu = 0.0035 and steel yielding',
          'Singly reinforced limit K\' = 0.168 (UK NA x/d <= 0.45 without redistribution), lever arm z <= 0.95d, and As = M_Ed / (0.87 * fyk * z)'
        ],
        futureContentNote: 'Future expansion slot for doubly reinforced compression steel design when K > K\' and moment redistribution limits.',
        assessmentQuestions: [
          qNum('MOD14-T1-Q1', 'MOD14-T1', 'Calculate effective depth d of a reinforced concrete beam.', 'An RC beam has overall depth h = 550 mm, nominal cover c_nom = 30 mm, shear link diameter d_link = 10 mm, and single-layer main tension bar diameter d_bar = 25 mm. Calculate the effective depth d to the centroid of the main tension bars.', 'Use d = h - c_nom - d_link - d_bar/2.', 497.5, 'mm', 0.5, 'd = 550 - 30 - 10 - (25 / 2) = 510 - 12.5 = 497.5 mm.'),
          qNum('MOD14-T1-Q2', 'MOD14-T1', 'Calculate the dimensionless flexural factor K = M_Ed / (b * d^2 * fck).', 'A rectangular RC beam has width b = 300 mm, effective depth d = 500 mm, and concrete cylinder strength fck = 30 MPa. Under an ultimate bending moment M_Ed = 225 kNm (225 x 10^6 Nmm), calculate K.', 'Use K = M_Ed / (b * d^2 * fck).', 0.1, 'ratio', 0.002, 'b * d^2 * fck = 300 * 500^2 * 30 = 2.25 x 10^9 Nmm. Therefore K = (225 x 10^6) / (2.25 x 10^9) = 0.100 (which is <= K\' = 0.168, so singly reinforced).'),
          qNum('MOD14-T1-Q3', 'MOD14-T1', 'Calculate required tension reinforcement area As_req.', 'For the beam with M_Ed = 225 kNm, effective depth d = 500 mm, lever arm z = 0.909 * d = 454.5 mm, and fyk = 500 MPa (so fyd = 0.87 * fyk = 435 MPa), calculate the required tension steel area As_req.', 'Use As_req = M_Ed / (0.87 * fyk * z).', 1138, 'mm^2', 5.0, 'As_req = (225 x 10^6 Nmm) / (435 N/mm^2 * 454.5 mm) = 225,000,000 / 197,707.5 = 1138.0 mm^2 (e.g. 3H25 provides 1473 mm^2).'),
          qMcq('MOD14-T1-Q4', 'MOD14-T1', 'Explain why Eurocode 2 limits the neutral axis depth ratio x/d (e.g. x/d <= 0.45 in the UK NA).', 'Why does reinforced concrete design limit the neutral axis depth ratio x/d (to 0.45 for fck <= 50 MPa with zero redistribution in the UK NA) before requiring compression reinforcement?', 'Consider strain compatibility between eps_cu = 0.0035 at the top fibre and tensile strain in the bottom steel.', [
            'To guarantee an under-reinforced section where the tension steel yields with large visible deflections and cracking before the compression concrete crushes suddenly and brittlely',
            'To make sure the tension steel never reaches yield',
            'To eliminate all micro-cracking in the tension zone',
            'Because concrete has higher tensile strength than steel'
          ], 0, 'Limiting x/d ensures that by the time the extreme concrete compression fibre reaches its ultimate crushing strain (0.0035), the tension steel has yielded well into its ductile plateau.'),
          qMcq('MOD14-T1-Q5', 'MOD14-T1', 'Identify what happens when K exceeds K\' (0.168) in a rectangular beam.', 'If a beam’s factored moment gives K = M_Ed / (b * d^2 * fck) = 0.210 > K\' = 0.168 and the section size cannot be increased, what must the engineer provide?', 'Consider singly vs doubly reinforced concrete sections.', [
            'Compression reinforcement (As2) in the top compression zone restrained by links, together with additional tension reinforcement to balance the couple above K\'',
            'Simply add more tension steel in the bottom without any compression steel, letting x/d exceed 0.75',
            'Reduce the concrete strength fck to 12 MPa',
            'Remove all shear links'
          ], 0, 'When K > K\', the concrete compression block alone cannot balance the moment while keeping x/d <= 0.45; top compression steel (restrained against buckling by links) is required.')
        ]
      },
      {
        id: 'MOD14-T2',
        code: '14.2',
        title: 'RC Beams: Shear Links, Anchorage, Laps, Cover, Deflection & Cracking',
        summary: 'Variable-angle truss model for shear links, V_Rd,c vs V_Rd,s vs V_Rd,max, anchorage and lap lengths, durability/fire cover, and L/d deflection control.',
        subtopics: [
          'EC2 variable-strut truss model: V_Rd,s = (Asw / s) * z * fywd * cot(theta)',
          'Bond, anchorage length l_bd, tension vs compression lap lengths, and staggered laps',
          'Nominal cover c_nom = c_min + delta_c,dev for durability, fire, and bond; basic L/d deflection checks'
        ],
        futureContentNote: 'Future expansion slot for shift rule (a_l) curtailment diagrams and side-face reinforcement in deep beams (>1000 mm).',
        assessmentQuestions: [
          qNum('MOD14-T2-Q1', 'MOD14-T2', 'Calculate shear resistance V_Rd,s of vertical links using the EC2 truss model.', 'An RC beam has lever arm z = 450 mm, two-leg H10 vertical links (Asw = 157 mm^2) at spacing s = 200 mm, design yield strength fywd = 435 MPa, and strut angle cot(theta) = 2.5. Calculate the shear resistance V_Rd,s.', 'Use V_Rd,s = (Asw / s) * z * fywd * cot(theta) in N, then divide by 1000 for kN.', 384.1, 'kN', 1.5, 'Asw / s = 157 / 200 = 0.785 mm^2/mm. V_Rd,s = 0.785 * 450 * 435 * 2.5 = 384,129 N = 384.1 kN.'),
          qNum('MOD14-T2-Q2', 'MOD14-T2', 'Calculate required shear link ratio Asw/s for a given ULS shear force.', 'A beam with lever arm z = 400 mm and fywd = 435 MPa must resist a ULS shear force V_Ed = 261 kN (261,000 N) using strut angle cot(theta) = 2.5. Calculate the required link area-to-spacing ratio Asw/s (in mm^2/mm).', 'Use Asw/s = V_Ed / (z * fywd * cot(theta)).', 0.6, 'mm^2/mm', 0.02, 'z * fywd * cot(theta) = 400 * 435 * 2.5 = 435,000 N/mm. Therefore Asw/s = 261,000 / 435,000 = 0.600 mm^2/mm.'),
          qNum('MOD14-T2-Q3', 'MOD14-T2', 'Calculate required tension anchorage length in multiples of bar diameter.', 'If a ribbed H20 bar (diameter d_bar = 20 mm) requires a design tension anchorage length of 36 bar diameters (36 * phi) in good bond conditions, calculate the required anchorage length l_bd (in mm).', 'Use l_bd = 36 * 20.', 720, 'mm', 2.0, 'l_bd = 36 * 20 = 720 mm.'),
          qNum('MOD14-T2-Q4', 'MOD14-T2', 'Calculate nominal concrete cover c_nom from minimum cover and fixing tolerance.', 'For an external exposed RC beam (Exposure Class XC3/XC4), the minimum cover for durability is c_min,dur = 30 mm (which exceeds c_min,b = 20 mm). With standard cast-in-situ fixing tolerance delta_c,dev = 10 mm, calculate the nominal cover c_nom.', 'Use c_nom = c_min + delta_c,dev.', 40, 'mm', 0.5, 'c_nom = 30 + 10 = 40 mm.'),
          qMcq('MOD14-T2-Q5', 'MOD14-T2', 'Identify best practice for locating reinforcement laps in RC beams and slabs.', 'Where should tension reinforcement lap splices ideally be located in a flexural member, and why?', 'Consider bond demand, cracking, and congestion.', [
            'Away from plastic hinges and peak bending moment zones (staggering laps where possible), because lapping all bars at the point of maximum tensile stress creates severe congestion and high splitting bond demand',
            'Always 100% lapped at exact midspan of a simply supported beam with zero cover',
            'Inside unreinforced concrete with a 20 mm overlap',
            'Outside the formwork'
          ], 0, 'Lapping bars in regions of lower bending stress and staggering laps reduces local tensile bond splitting forces and concrete placement congestion.')
        ]
      },
      {
        id: 'MOD14-T3',
        code: '14.3',
        title: 'Slabs, Punching Shear, Columns, Durability & Temporary Propping/Backpropping',
        summary: 'One-way vs two-way slab action (Ly/Lx), minimum reinforcement, flat slab punching shear at u_1, column N-M interaction, and construction-stage backpropping [UI1].',
        subtopics: [
          'One-way vs two-way spanning slabs (two-way when Ly / Lx <= 2.0 supported on all four edges)',
          'Flat slab punching shear stress v_Ed = beta * V_Ed / (u_1 * d) and shear stud rails / links',
          'Construction stage striking, prop loads, and backpropping distribution across immature RC slabs'
        ],
        futureContentNote: 'Future expansion slot for EC2 column biaxial bending interaction charts and nominal curvature second-order moments.',
        assessmentQuestions: [
          qNum('MOD14-T3-Q1', 'MOD14-T3', 'Calculate minimum tension reinforcement area As,min per metre width of an RC slab.', 'A solid RC slab has width b = 1000 mm, effective depth d = 170 mm, fctm = 2.9 MPa (C30/37), and fyk = 500 MPa. Calculate As,min = 0.26 * (fctm / fyk) * b * d (noting this exceeds 0.0013 * b * d = 221 mm^2/m).', 'Use As,min = 0.26 * (2.9 / 500) * 1000 * 170.', 256.4, 'mm^2/m', 2.0, 'As,min = 0.26 * 0.0058 * 170,000 = 0.001508 * 170,000 = 256.4 mm^2/m.'),
          qNum('MOD14-T3-Q2', 'MOD14-T3', 'Calculate punching shear stress v_Ed on the basic control perimeter u_1.', 'An internal flat-slab column transfers an ultimate punching force V_Ed = 550 kN (550,000 N) with eccentricity factor beta = 1.15. If the slab effective depth is d = 200 mm and the control perimeter at 2d is u_1 = 3800 mm, calculate the punching shear stress v_Ed (in MPa).', 'Use v_Ed = (beta * V_Ed) / (u_1 * d).', 0.832, 'MPa', 0.01, 'v_Ed = (1.15 * 550,000 N) / (3800 mm * 200 mm) = 632,500 / 760,000 = 0.832 MPa.'),
          qNum('MOD14-T3-Q3', 'MOD14-T3', 'Calculate total construction-stage wet concrete + construction live load on falsework props.', 'A 250 mm thick wet RC slab (unit weight 25 kN/m^3, including reinforcement and ponding allowance) is cast on formwork weighing 0.50 kPa, with a construction working live load of 1.50 kPa. Calculate the total unfactored vertical construction pressure q_con supported by the falsework props.', 'q_con = (0.25 * 25) + 0.50 + 1.50.', 8.25, 'kPa', 0.05, 'Wet concrete = 0.25 * 25 = 6.25 kPa. Total construction pressure q_con = 6.25 + 0.50 + 1.50 = 8.25 kPa.'),
          qNum('MOD14-T3-Q4', 'MOD14-T3', 'Evaluate load shared by each supporting floor during two-level equal-stiffness backpropping.', 'During multi-storey RC frame construction, wet Level 3 (imposing 8.0 kPa on its props) is propped onto Level 2, which is continuously backpropped down to Level 1. Assuming rigid props and that Level 2 and Level 1 have equal flexural stiffness, each supporting slab already carries its own self-weight of 6.0 kPa and shares 50% of the 8.0 kPa prop load. Calculate the total load carried by the Level 2 slab during the pour.', 'Total load on Level 2 = own self-weight (6.0 kPa) + 0.50 * prop load (8.0 kPa).', 10, 'kPa', 0.1, 'Total load on Level 2 = 6.0 + (0.50 * 8.0) = 10.0 kPa (which must be checked against the early-age strength of the Level 2 slab!).'),
          qMcq('MOD14-T3-Q5', 'MOD14-T3', 'Identify why construction-stage propping and backpropping frequently govern RC flat slab design.', 'Why is construction-stage propping/backpropping of multi-storey RC flat slabs a critical permanent- and temporary-works interface check?', 'Consider early-age concrete strength vs high wet-pour prop loads.', [
            'Supporting a newly poured wet slab on the floor below can impose total loads comparable to or exceeding the permanent service load while the supporting concrete is only days old (lower tensile/punching strength and higher creep)',
            'Wet concrete floats in the air until it reaches 28-day strength',
            'Backprops transfer 100% of the load into the roof above',
            'Early-age concrete at 3 days is twice as strong as at 28 days'
          ], 0, 'Wet concrete + falsework + construction live load transferred through props onto a young slab (e.g. 7–14 days old) can cause early-age cracking, excessive long-term creep deflection, or punching shear failure if not properly backpropped and checked.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD14-E01', 'MOD14-T1', 'Calculate design compressive strength fcd of C30/37 concrete to EC2 (UK NA).', 'For C30/37 concrete (fck = 30 MPa) with UK NA alpha_cc = 0.85 and partial factor gamma_c = 1.50, calculate fcd = alpha_cc * fck / gamma_c.', 'Use fcd = 0.85 * 30 / 1.50.', 17, 'MPa', 0.1, 'fcd = 25.5 / 1.50 = 17.0 MPa.'),
      qNum('MOD14-E02', 'MOD14-T1', 'Calculate design yield strength fyd of B500B reinforcement.', 'For B500B reinforcement (fyk = 500 MPa) with partial factor gamma_s = 1.15, calculate fyd = fyk / gamma_s.', 'Use fyd = 500 / 1.15.', 434.8, 'MPa', 0.5, 'fyd = 500 / 1.15 = 434.8 MPa (commonly written 0.87 * fyk = 435 MPa).'),
      qNum('MOD14-E03', 'MOD14-T1', 'Calculate effective depth d of a slab.', 'A 225 mm thick RC slab has nominal bottom cover c_nom = 25 mm and main bottom bar diameter d_bar = 16 mm (no shear links). Calculate the effective depth d for the outer layer of bars.', 'Use d = h - c_nom - d_bar/2.', 192, 'mm', 0.5, 'd = 225 - 25 - 8 = 192.0 mm.'),
      qNum('MOD14-E04', 'MOD14-T1', 'Calculate maximum singly reinforced moment capacity M_Rd,max at K\' = 0.168.', 'A rectangular RC beam has width b = 300 mm, effective depth d = 450 mm, and fck = 30 MPa. Using K\' = 0.168, calculate the maximum singly reinforced moment capacity M_Rd,max (in kNm).', 'Use M_Rd,max = 0.168 * b * d^2 * fck in Nmm, then divide by 10^6.', 306.2, 'kNm', 1.0, 'b * d^2 * fck = 300 * 450^2 * 30 = 1.8225 x 10^9 Nmm. M_Rd,max = 0.168 * 1.8225 x 10^9 = 306.18 x 10^6 Nmm = 306.2 kNm.'),
      qNum('MOD14-E05', 'MOD14-T1', 'Calculate required tension reinforcement area for a slab strip.', 'A 1.0 m wide slab strip (d = 180 mm, lever arm z = 0.95 * d = 171 mm) resists an ultimate bending moment M_Ed = 45 kNm/m. Taking 0.87 * fyk = 435 MPa, calculate As_req (in mm^2/m).', 'Use As_req = M_Ed / (435 * z).', 605, 'mm^2/m', 3.0, 'As_req = (45 x 10^6 Nmm) / (435 * 171) = 45,000,000 / 74,385 = 605.0 mm^2/m (e.g. H12 @ 175 c/c = 646 mm^2/m).'),
      qNum('MOD14-E06', 'MOD14-T1', 'Calculate provided steel area per metre width for H12 bars at 150 mm centres.', 'One H12 bar has cross-sectional area 113.1 mm^2. Calculate the provided reinforcement area per metre width (As,prov in mm^2/m) when H12 bars are spaced at s = 150 mm centres.', 'Use As,prov = 113.1 * (1000 / 150).', 754, 'mm^2/m', 2.0, 'As,prov = 113.1 * (1000 / 150) = 754.0 mm^2/m.'),
      qNum('MOD14-E07', 'MOD14-T2', 'Calculate cross-sectional area of two legs of H8 shear links.', 'One H8 bar has area 50.3 mm^2. What is the total shear link area Asw for a single two-leg H8 closed link?', 'Use Asw = 2 * 50.3.', 100.6, 'mm^2', 0.5, 'Asw = 2 * 50.3 = 100.6 mm^2.'),
      qNum('MOD14-E08', 'MOD14-T2', 'Calculate maximum longitudinal spacing s_l,max of shear links in an RC beam.', 'In EC2, the maximum longitudinal spacing of vertical shear link legs along a beam is s_l,max = 0.75 * d. For a beam with effective depth d = 480 mm, calculate s_l,max (often rounded down to a practical multiple on drawings).', 'Use s_l,max = 0.75 * 480.', 360, 'mm', 1.0, 's_l,max = 0.75 * 480 = 360 mm (typically detailed at <= 300 mm in UK practice).'),
      qNum('MOD14-E09', 'MOD14-T2', 'Calculate modified allowable span-to-effective-depth ratio L/d when excess tension steel is provided.', 'A lightly stressed one-way continuous slab has a basic allowable L/d ratio of 26. If the engineer provides As,prov = 754 mm^2/m where As,req = 580 mm^2/m (giving modification factor 754 / 580 = 1.30), calculate the modified allowable L/d ratio.', 'Multiply basic L/d = 26 by 1.30.', 33.8, 'ratio', 0.2, 'Allowable L/d = 26 * 1.30 = 33.8.'),
      qNum('MOD14-E10', 'MOD14-T3', 'Determine whether a rectangular slab panel acts one-way or two-way.', 'A rectangular slab supported on four beams has long span Ly = 7.2 m and short span Lx = 3.0 m. Calculate the aspect ratio Ly / Lx.', 'Use Ly / Lx = 7.2 / 3.0.', 2.4, 'ratio', 0.02, 'Ly / Lx = 7.2 / 3.0 = 2.40 (since Ly / Lx > 2.0, the slab spans predominantly one-way across the short 3.0 m span).'),
      qNum('MOD14-E11', 'MOD14-T3', 'Calculate punching shear load magnification factor beta for an internal column with unbalanced moment.', 'Using standard simplified EC2 factors for braced frames, what default magnification factor beta is applied to V_Ed for an internal column where lateral stability does not depend on frame action and adjacent spans do not differ by more than 25%?', 'Recall EC2 Clause 6.4.3(6) standard values (1.15 internal, 1.4 edge, 1.5 corner).', 1.15, 'ratio', 0.01, 'For an internal column in a braced frame with regular bays, beta = 1.15.'),
      qNum('MOD14-E12', 'MOD14-T3', 'Calculate nominal first-order moment on a short braced RC column.', 'An RC column carries an ultimate axial load N_Ed = 1800 kN at a total eccentricity (initial moment + geometric imperfection, exceeding h/30 >= 20 mm) of e_tot = 35 mm (0.035 m). Calculate the design moment M_Ed.', 'Use M_Ed = N_Ed * e_tot.', 63, 'kNm', 0.5, 'M_Ed = 1800 kN * 0.035 m = 63.0 kNm.'),
      qNum('MOD14-E13', 'MOD14-T3', 'Calculate prop force in an individual falsework prop on a regular grid.', 'Wet concrete + falsework + construction live load totals q_con = 8.5 kPa. If vertical falsework props are set out on a 1.2 m x 1.2 m square grid (tributary area 1.44 m^2), calculate the unfactored axial compression load in one prop.', 'Use P_prop = q_con * 1.44.', 12.24, 'kN', 0.1, 'P_prop = 8.5 kPa * 1.44 m^2 = 12.24 kN.'),
      qMcq('MOD14-E14', 'MOD14-T1', 'Explain why top reinforcement is needed over internal supports of continuous RC beams.', 'In a three-span continuous RC beam, why is heavy longitudinal tension reinforcement required in the TOP face over the internal columns?', 'Consider the bending moment diagram of a continuous beam.', [
            'Continuous beams experience hogging bending over internal supports, placing the top face in tension and the bottom face in compression',
            'Top bars are only there to hold the concrete down against wind',
            'Internal supports experience zero bending moment',
            'Concrete is stronger in tension at the top face'
          ], 0, 'Hogging moments over internal supports induce tension in the top fibres of the beam.'),
      qMcq('MOD14-E15', 'MOD14-T2', 'Explain why concrete compression strut capacity V_Rd,max must be checked even when shear links are provided.', 'Why can you not simply keep adding more and more vertical shear links to carry an arbitrarily large shear force in a thin-webbed RC beam?', 'Consider Diagonal Compression Failure of the concrete web.', [
            'If the diagonal compressive stress in the concrete web struts exceeds V_Rd,max, the concrete web crushes before the steel shear links yield',
            'Shear links reduce the weight of the beam to zero',
            'EC2 prohibits links closer than 1000 mm',
            'Vertical links only carry bending moment'
          ], 0, 'The truss model relies on diagonal concrete compression struts balanced by vertical tension links; if V_Ed > V_Rd,max, the concrete web crushes in diagonal compression.'),
      qMcq('MOD14-E16', 'MOD14-T2', 'Explain why bottom reinforcement must be anchored past the centreline of a simple support.', 'Why does EC2 require a proportion of the bottom span tension reinforcement to be carried into and anchored at a simple support (due to the shift rule / truss tension tie)?', 'Consider the horizontal component of the diagonal compression strut at the support.', [
            'Diagonal shear struts arriving at the support push outward horizontally, creating a tensile force in the bottom chord right up to the support bearing that must be anchored',
            'To make the bars easier to cut on site',
            'Because bending moment is maximum at a pin support',
            'To prevent the column below from shrinking'
          ], 0, 'In the truss analogy, inclined compression struts meeting the support reaction require a horizontal tension tie force Delta_Ftd in the bottom bars anchored beyond the support edge.'),
      qMcq('MOD14-E17', 'MOD14-T3', 'Explain why top U-bars or bent-down bars are detailed at the edges of flat slabs.', 'At the free perimeter edge of an RC flat slab or where a slab frames into an edge column, why are U-bars (closed hairpins) detailed around the slab edge?', 'Consider torsional and hogging transfer plus anchorage at a shallow free edge.', [
            'To provide full tension anchorage within the limited slab depth, resist edge torsion, and enclose the perimeter bars against splitting at the slab edge',
            ' purely for architectural appearance before cladding is fixed',
            'To replace all bottom midspan reinforcement',
            'To stop rain from wetting the top of the slab'
          ], 0, 'Straight bars cannot develop full tension anchorage perpendicular to a thin slab edge; closed U-bars anchor hogging/torsional forces and confine the edge zone.'),
      qMcq('MOD14-E18', 'MOD14-T2', 'Identify what governs concrete cover in an underground RC retaining wall face cast directly against blinding vs earth.', 'Why is a larger nominal concrete cover (e.g. 50 mm against blinding or 75 mm directly against earth) specified for buried foundation faces compared with an internal heated office slab (e.g. 20–25 mm)?', 'Consider exposure class, ground moisture, and uneven casting tolerances.', [
            'Buried concrete faces are exposed to damp ground/groundwater and greater casting surface irregularity (delta_c,dev), requiring higher cover to protect steel from corrosion and ensure bond',
            'Underground concrete is exposed to direct sunlight',
            'Internal office slabs never contain reinforcement',
            'Cover is chosen purely at random'
          ], 0, 'Nominal cover combines durability requirements (exposure class XC/XD/XS) with larger construction tolerance delta_c,dev when casting against blinding or uneven ground.'),
      qMcq('MOD14-E19', 'MOD14-T3', 'Identify the consequence of premature formwork striking without checking concrete maturity.', 'What is the primary structural consequence of striking slab soffit formwork too early (before the concrete has achieved the specified striking strength and stiffness) and without adequate backpropping?', 'Consider early-age elastic modulus E_cm(t), tensile strength fctm(t), and creep.', [
            'Early-age cracking, excessive permanent sagging deflection amplified by high early-age creep, and potential punching shear failure around columns',
            'The slab becomes permanently cambered upward',
            'The reinforcement diameter increases',
            'Concrete cube strength doubles immediately'
          ], 0, 'Young concrete has lower tensile strength (causing early cracking and loss of uncracked stiffness) and undergoes much higher creep strain under sustained load.'),
      qMcq('MOD14-E20', 'MOD14-T1', 'Pass the Module 14 Learning Gate: Produce a buildable, code-compliant RC design.', 'Which checklist confirms that a reinforced concrete beam or slab design is buildable on site as well as mathematically sufficient on paper?', 'Consider bar spacing, vibrator poker access, laps, cover, and intersections.', [
            'Clear bar spacing allows aggregate flow and poker vibrator access, laps are staggered away from peak stress/congestion zones, cover and link bend radii fit inside the section, and beam-column junction layers do not clash',
            'Providing 14 layers of H40 bars in a 200 mm wide beam',
            'Specifying 5 mm cover on all external faces',
            'Omitting all links and distribution steel to save weight'
          ], 0, 'A calculation is useless if the reinforcement cannot be fixed with required cover or if concrete cannot be compacted around congested beam-column nodes.')
    ]
  },
  {
    id: 'MOD-15',
    moduleNumber: 15,
    title: 'Structural Analysis Beyond Simple Beams',
    shortTitle: 'Advanced Structural Analysis',
    summary: 'Determinate trusses, plane frames, three-pinned arches, indeterminate continuous beams, relative stiffness distribution, moment redistribution, influence lines, and hand bounds for software validation.',
    whyItMatters: 'Real buildings involve frames, trusses, continuous members, and moving loads. Even when software is used, an engineer must understand how stiffness attracts load and how to bound any indeterminate structure using pinned vs fixed hand models.',
    objectives: [
      'Solve axial forces in determinate trusses (method of joints and method of sections) and bending in plane frames and three-pinned arches.',
      'Explain static indeterminacy, compatibility of deformations, and how relative flexural stiffness (EI/L) governs moment distribution.',
      'Apply moment redistribution concepts and qualitative influence lines to find worst-case pattern loading.',
      'Bound indeterminate member forces between simply supported (wL^2/8) and fully fixed-end (wL^2/12 hogging, wL^2/24 sagging) hand limits.'
    ],
    learningGate: 'Predict qualitative deflected shapes and moment diagrams before running software.',
    WorkedExamples: [
      {
        id: 'EX-15.1',
        title: 'Example 15.1: Pratt & Warren Truss Analysis by Joints and Sections',
        brief: 'Calculate chord and diagonal forces in a 12 m span roof/bridge truss using the Method of Sections at midspan and Method of Joints at supports, identifying zero-force members.',
        checklist: [
          'Find global support reactions from vertical and horizontal equilibrium.',
          'Cut a section through three members to find top chord compression, bottom chord tension, and web diagonal force directly.',
          'Identify zero-force members at unloaded joints by inspection.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-15.2',
        title: 'Example 15.2: Portal Frame & Three-Pinned Arch Equilibrium',
        brief: 'Draw the axial force, shear force, and bending moment diagrams for a three-pinned portal frame under vertical roof load and horizontal wind load.',
        checklist: [
          'Use global equilibrium plus the internal crown pin condition (M_crown = 0) to solve horizontal base thrust H.',
          'Plot the bending moment on the tension side of columns and rafters.',
          'Explain how eaves haunches and base fixity alter the moment distribution.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-15.3',
        title: 'Example 15.3: Continuous Beam Stiffness Distribution & Pattern Loading',
        brief: 'Bound and calculate support hogging and span sagging moments in a two-span and three-span continuous beam under permanent + pattern variable loading.',
        checklist: [
          'Verify that total static moment height at midspan (average support hogging + midspan sagging) equals the free bending moment wL^2/8.',
          'Identify which spans must carry variable load Q to maximise midspan sagging vs internal support hogging.',
          'Apply up to 15%–20% moment redistribution where ductility permits.'
        ],
        requiresSelfReview: true
      },
      {
        id: 'EX-15.4',
        title: 'Example 15.4: Hand Bounding of a Frame Model Before Software Analysis',
        brief: 'Before opening FE/frame software, bracket the beam moments, column axial loads, and drift of a two-bay portal using simple hand bounds.',
        checklist: [
          'Bracket beam moments between pinned ends (M_sag = wL^2/8, M_hog = 0) and fixed ends (M_sag = wL^2/24, M_hog = wL^2/12).',
          'Check sum of vertical reactions equals total applied vertical load.',
          'Sketch the deflected shape showing tension faces and points of contraflexure.'
        ],
        requiresSelfReview: true
      }
    ],
    topics: [
      {
        id: 'MOD15-T1',
        code: '15.1',
        title: 'Determinate Trusses, Plane Frames, Portal Frames & Arches',
        summary: 'Method of joints, method of sections, zero-force members, plane frame moment diagrams, and three-pinned arches/portals (H = wL^2 / 8f).',
        subtopics: [
          'Truss analysis: method of joints (2 equations per pin) and method of sections (3 equations per cut)',
          'Zero-force member rules at two-member and three-member unloaded joints',
          'Three-pinned arch/portal horizontal thrust H using M_crown = 0'
        ],
        futureContentNote: 'Future expansion slot for Space trusses and virtual work truss deflection calculation (sum(N * n * L / EA)).',
        assessmentQuestions: [
          qNum('MOD15-T1-Q1', 'MOD15-T1', 'Calculate top chord force in a parallel-chord truss using the Method of Sections.', 'A simply supported parallel-chord truss of span L = 12 m and truss depth h = 2.0 m carries a uniform equivalent load such that the global bending moment at midspan is M_mid = 180 kNm. Using a vertical section cut at midspan, calculate the magnitude of the axial compression force in the top chord.', 'Use F_chord = M_mid / h.', 90, 'kN', 0.5, 'Taking moments about the bottom chord node at midspan: F_top * h = M_mid => F_top = 180 / 2.0 = 90.0 kN (compression).'),
          qNum('MOD15-T1-Q2', 'MOD15-T1', 'Calculate web diagonal force from panel vertical shear in a parallel-chord truss.', 'In a parallel-chord truss of depth h = 2.0 m and panel length p = 2.0 m (so diagonals are at 45 deg, sin 45 deg = 0.7071), the vertical shear force in the panel is V = 50 kN. Calculate the axial force magnitude in the 45-degree web diagonal.', 'Use F_diag = V / sin(45 deg).', 70.7, 'kN', 0.5, 'Vertical equilibrium across the cut: F_diag * sin(45 deg) = V => F_diag = 50 / 0.7071 = 70.71 kN.'),
          qNum('MOD15-T1-Q3', 'MOD15-T1', 'Calculate horizontal support thrust in a symmetrical three-pinned arch.', 'A symmetrical three-pinned arch of span L = 16 m and crown rise f = 4.0 m carries a uniform horizontal projection load w = 15 kN/m across the full span. Using the crown hinge condition (M_crown = 0), calculate the horizontal thrust H at each pinned support.', 'Use H = w * L^2 / (8 * f).', 120, 'kN', 0.5, 'Free-body moment at crown = w*L^2/8 - H*f = 0 => H = (15 * 16^2) / (8 * 4.0) = 3840 / 32 = 120.0 kN.'),
          qNum('MOD15-T1-Q4', 'MOD15-T1', 'Calculate eaves corner bending moment in a pinned-base portal frame under horizontal load.', 'A symmetrical pinned-base portal frame of height h = 4.0 m and span L = 10.0 m carries a horizontal point load H = 30 kN at eaves level. If the horizontal base reactions share the load equally (H_A = H_B = 15 kN), calculate the magnitude of the bending moment at each eaves corner.', 'Use M_eaves = H_base * h.', 60, 'kNm', 0.5, 'Looking at one column of height h = 4.0 m pinned at the base with horizontal base shear 15 kN: M_eaves = 15 kN * 4.0 m = 60.0 kNm.'),
          qMcq('MOD15-T1-Q5', 'MOD15-T1', 'Identify zero-force members at an unloaded truss joint.', 'At an unloaded pin joint in a planar truss where two collinear chord members meet a single inclined web member at 60 degrees, what is the axial force in the inclined web member?', 'Apply equilibrium perpendicular to the two collinear chord members.', [
            'Zero, because there is no external load or other member with a force component perpendicular to the two collinear chord members',
            'Equal to the chord force',
            'Infinite compression',
            'Twice the support reaction'
          ], 0, 'Summing forces perpendicular to the collinear line of the two chord members gives F_web * sin(60 deg) = 0, so F_web = 0.')
        ]
      },
      {
        id: 'MOD15-T2',
        code: '15.2',
        title: 'Indeterminate Continuous Beams, Compatibility, Relative Stiffness & Redistribution',
        summary: 'Fixed-end moments (wL^2/12), two-span continuous beams (M_hog = wL^2/8), relative flexural stiffness (k = EI/L), and ductile moment redistribution.',
        subtopics: [
          'Fixed-end beam bounds: M_hog = wL^2/12 at supports and M_sag = wL^2/24 at midspan',
          'Two-span symmetrical continuous beam under UDL: M_B = wL^2/8 hogging over central support',
          'Stiffness distribution at a joint: moments distribute in proportion to rotational stiffness k_i = alpha * E_i * I_i / L_i'
        ],
        futureContentNote: 'Future expansion slot for Hardy Cross moment distribution tables and slope-deflection equations.',
        assessmentQuestions: [
          qNum('MOD15-T2-Q1', 'MOD15-T2', 'Calculate fixed-end hogging moment of a fully fixed beam under UDL.', 'A single-span beam of length L = 6.0 m is fully fixed against rotation at both ends and carries a uniform load w = 20 kN/m. Calculate the magnitude of the fixed-end hogging moment at each support.', 'Use M_FEM = w * L^2 / 12.', 60, 'kNm', 0.5, 'M_FEM = 20 * 6.0^2 / 12 = 720 / 12 = 60.0 kNm.'),
          qNum('MOD15-T2-Q2', 'MOD15-T2', 'Calculate midspan sagging moment of a fully fixed beam under UDL.', 'For the same L = 6.0 m fixed-end beam under w = 20 kN/m (where free moment wL^2/8 = 90 kNm and end hogging moments are 60 kNm), calculate the midspan sagging moment.', 'Use M_sag = (w * L^2 / 8) - (w * L^2 / 12) = w * L^2 / 24.', 30, 'kNm', 0.5, 'M_sag = 90.0 - 60.0 = 30.0 kNm (or 20 * 36 / 24 = 30.0 kNm).'),
          qNum('MOD15-T2-Q3', 'MOD15-T2', 'Calculate central support hogging moment of a two-span continuous beam under UDL.', 'A symmetrical two-span continuous beam has two equal spans of L = 8.0 m and carries a uniform load w = 15 kN/m across both spans. Calculate the magnitude of the elastic hogging moment over the central internal support.', 'By symmetry, the central support does not rotate, acting like a fixed end: M_B = w * L^2 / 8.', 120, 'kNm', 0.5, 'M_B = 15 * 8.0^2 / 8 = 120.0 kNm.'),
          qNum('MOD15-T2-Q4', 'MOD15-T2', 'Calculate support hogging moment after 15% downward moment redistribution.', 'In a continuous RC beam, the elastic hogging moment over an internal support is M_elastic = 200 kNm. If the designer applies a 15% downward moment redistribution (and increases the adjacent span sagging moments to maintain static equilibrium), calculate the redistributed support hogging moment M_redist.', 'Use M_redist = 0.85 * M_elastic.', 170, 'kNm', 0.5, 'M_redist = (1 - 0.15) * 200 = 170.0 kNm.'),
          qMcq('MOD15-T2-Q5', 'MOD15-T2', 'Explain how relative stiffness affects load attraction in indeterminate structures.', 'In a statically indeterminate structure where two parallel load paths or framing members share a common deformation, which member attracts the larger share of the internal force or bending moment?', 'Consider compatibility of displacement and F = k * delta.', [
            'The stiffer member attracts the larger share of the load, in proportion to its relative stiffness',
            'The more flexible member always carries 100% of the load',
            'Load distribution in indeterminate structures is completely independent of EI or EA',
            'Only the heaviest member by colour attracts moment'
          ], 0, 'In indeterminate systems, compatibility forces connected members to deform together; therefore internal forces distribute in proportion to stiffness ("stiffness attracts load").')
        ]
      },
      {
        id: 'MOD15-T3',
        code: '15.3',
        title: 'Influence Lines, Second-Order Effects, Dynamic Awareness & Hand vs Software Bounds',
        summary: 'Influence lines for moving loads, pattern loading on continuous beams, P-Delta / P-delta second-order effects, human-induced floor vibration awareness, and hand bounds.',
        subtopics: [
          'Influence lines vs bending moment diagrams and Muller-Breslau qualitative sketching',
          'Pattern loading: alternating variable loads for maximum span sagging vs adjacent loaded spans for support hogging',
          'Global P-Delta and member P-delta second-order amplification and natural frequency f_n awareness'
        ],
        futureContentNote: 'Future expansion slot for crane gantry girder moving wheel train envelopes and footbridge resonance.',
        assessmentQuestions: [
          qNum('MOD15-T3-Q1', 'MOD15-T3', 'Use an influence line ordinate to calculate midspan bending moment under a moving point load.', 'For a simply supported beam of span L = 10 m, the influence line ordinate for bending moment at midspan (x = 5 m) is L / 4 = 2.5 mNm/N when the unit load is at midspan, and 1.5 mNm/N when the load is at x = 3 m. If a two-axle vehicle with axle loads of 80 kN (placed at midspan) and 40 kN (placed at x = 3 m) crosses the beam, calculate the resulting midspan bending moment.', 'Use M_mid = sum(P_i * eta_i).', 260, 'kNm', 1.0, 'M_mid = (80 kN * 2.5 m) + (40 kN * 1.5 m) = 200 + 60 = 260.0 kNm.'),
          qNum('MOD15-T3-Q2', 'MOD15-T3', 'Verify static equilibrium height (M_free = wL^2/8) in a continuous span.', 'An internal span of length L = 8.0 m carries a UDL w = 24 kN/m (so the free simply supported parabolic height is wL^2/8 = 192 kNm). If the left and right support hogging moments are both 110 kNm, calculate the midspan sagging moment required by static equilibrium.', 'Use M_sag = (w * L^2 / 8) - M_hog_avg.', 82, 'kNm', 0.5, 'Free height = 24 * 64 / 8 = 192.0 kNm. Subtracting average support hogging (110.0 kNm) gives M_sag = 192.0 - 110.0 = 82.0 kNm.'),
          qNum('MOD15-T3-Q3', 'MOD15-T3', 'Estimate fundamental natural frequency of a floor beam from static midspan deflection.', 'Using the standard engineering approximation f_n ≈ 18 / sqrt(delta_mm) Hz (where delta_mm is the instantaneous static midspan deflection in mm under self-weight and permanent mass), calculate the natural frequency f_n of a floor beam with delta_mm = 9.0 mm.', 'Use f_n = 18 / sqrt(9.0).', 6, 'Hz', 0.1, 'f_n = 18 / 3.0 = 6.0 Hz.'),
          qMcq('MOD15-T3-Q4', 'MOD15-T3', 'Identify the variable load pattern that maximises hogging moment over an internal support.', 'In a multi-span continuous beam, which arrangement of variable live load Q produces the maximum hogging bending moment over a specific internal support B?', 'Apply the Muller-Breslau qualitative influence line for support moment.', [
            'Full factored permanent + variable load on the two spans immediately adjacent to support B, with alternating spans beyond unloaded of variable action',
            'Variable load placed only on spans three bays away while the two spans touching support B are unloaded',
            'Zero load on the entire beam',
            'Upward load on both adjacent spans'
          ], 0, 'Pushing down on both spans immediately left and right of support B tries to rotate both beam ends downward into the support, maximising the hogging moment over B.'),
          qMcq('MOD15-T3-Q5', 'MOD15-T3', 'Identify the variable load pattern that maximises midspan sagging moment in an internal span.', 'In a multi-span continuous beam, which arrangement of variable live load Q produces the maximum sagging bending moment at the middle of Span 2?', 'Consider how unloading adjacent spans reduces hogging restraint at the ends of Span 2.', [
            'Factored permanent + variable load on Span 2 (and alternate spans 4, etc.), with only permanent load on the adjacent Spans 1 and 3 ("checkerboard / alternate span" loading)',
            'Variable load on Spans 1 and 3 only, with zero variable load on Span 2',
            'Removing permanent dead load from Span 2',
            'Applying horizontal load only'
          ], 0, 'Loading Span 2 while leaving adjacent Spans 1 and 3 without variable load allows the supports of Span 2 to rotate more freely, reducing support hogging and maximising Span 2 midspan sagging.')
        ]
      }
    ],
    moduleAssessment: [
      qNum('MOD15-E01', 'MOD15-T1', 'Calculate support reaction of a symmetrical truss.', 'A 16 m span roof truss has 8 panels of 2.0 m and carries a vertical point load of 12 kN at each of the 7 internal top-chord panel nodes. Calculate each vertical support reaction.', 'Total load = 7 * 12 kN; divide by 2 for symmetry.', 42, 'kN', 0.2, 'Total vertical load = 7 * 12 = 84 kN. Each support reaction R = 84 / 2 = 42.0 kN.'),
      qNum('MOD15-E02', 'MOD15-T1', 'Calculate bottom chord tension force by Method of Sections.', 'At a vertical section through a parallel-chord Warren truss of depth h = 2.5 m, the bending moment at the top-chord node is M = 350 kNm. Calculate the axial tension force in the bottom chord.', 'Use F_bot = M / h.', 140, 'kN', 0.5, 'F_bot = 350 / 2.5 = 140.0 kN (tension).'),
      qNum('MOD15-E03', 'MOD15-T1', 'Calculate diagonal force at a support joint by Method of Joints.', 'At a pinned truss support with upward vertical reaction R_A = 45 kN and no external load directly on the support pin, the end diagonal rises at 36.87 deg to the horizontal (sin 36.87 deg = 0.60, cos 36.87 deg = 0.80). Calculate the magnitude of the compression force in the end diagonal.', 'Vertical equilibrium at pin A: F_diag * sin(theta) = R_A.', 75, 'kN', 0.5, 'F_diag = 45 / 0.60 = 75.0 kN (compression).'),
      qNum('MOD15-E04', 'MOD15-T1', 'Calculate horizontal chord force at the same truss support pin.', 'Using the same support pin where the end diagonal carries 75 kN compression at cos(theta) = 0.80, calculate the axial tension force in the horizontal bottom chord meeting the pin.', 'Horizontal equilibrium at pin A: F_bot = F_diag * cos(theta).', 60, 'kN', 0.5, 'F_bot = 75 * 0.80 = 60.0 kN (tension).'),
      qNum('MOD15-E05', 'MOD15-T1', 'Calculate horizontal thrust in a three-pinned portal frame under vertical roof UDL.', 'A symmetrical three-pinned portal frame has span L = 20 m, ridge crown hinge height f = 5.0 m above the base pins, and carries a vertical roof UDL w = 12 kN/m across the 20 m span. Calculate the horizontal base thrust H.', 'Use M_crown = 0 => H = w * L^2 / (8 * f).', 120, 'kN', 0.5, 'H = (12 * 20^2) / (8 * 5.0) = 4800 / 40 = 120.0 kN.'),
      qNum('MOD15-E06', 'MOD15-T1', 'Calculate eaves bending moment in the three-pinned portal frame.', 'In the same three-pinned portal frame with vertical column height h_col = 4.0 m and inward horizontal base thrust H = 120 kN (and zero horizontal wind load on the column), calculate the magnitude of the bending moment at the eaves corner.', 'Use M_eaves = H * h_col.', 480, 'kNm', 1.0, 'M_eaves = 120 kN * 4.0 m = 480.0 kNm.'),
      qNum('MOD15-E07', 'MOD15-T2', 'Calculate fixed-end moment of a fixed-fixed beam under a central point load.', 'A beam of span L = 8.0 m is fully fixed at both ends and carries a central point load P = 96 kN. Calculate the magnitude of the fixed-end hogging moment at each support (M_FEM = P * L / 8).', 'Use M_FEM = P * L / 8.', 96, 'kNm', 0.5, 'M_FEM = 96 * 8.0 / 8 = 96.0 kNm (and midspan sagging is also P*L/8 = 96.0 kNm).'),
      qNum('MOD15-E08', 'MOD15-T2', 'Calculate prop reaction in a propped cantilever under UDL.', 'A propped cantilever of span L = 6.0 m (fixed at A, roller prop at B) carries a uniform load w = 16 kN/m (total load 96 kN). Using standard elastic compatibility (R_B = 3 * w * L / 8), calculate the vertical reaction at the roller prop B.', 'Use R_B = 3 * w * L / 8.', 36, 'kN', 0.5, 'R_B = 3 * 16 * 6.0 / 8 = 288 / 8 = 36.0 kN (and fixed support A carries 5/8 of the load = 60.0 kN).'),
      qNum('MOD15-E09', 'MOD15-T2', 'Calculate fixed-end hogging moment in the propped cantilever.', 'For the same L = 6.0 m propped cantilever under w = 16 kN/m with roller reaction R_B = 36 kN at the free end, calculate the magnitude of the hogging moment at the fixed support A.', 'Use M_A = (w * L^2 / 2) - (R_B * L), which equals w * L^2 / 8.', 72, 'kNm', 0.5, 'M_A = (16 * 36 / 2) - (36 * 6.0) = 288 - 216 = 72.0 kNm (which equals wL^2/8).'),
      qNum('MOD15-E10', 'MOD15-T2', 'Calculate distribution factor at a two-member rigid joint.', 'Two beams of identical E and I meet at an internal roller support, with far ends fixed. Span AB has length L_1 = 4.0 m and Span BC has length L_2 = 6.0 m. Since rotational stiffness is proportional to I / L, calculate the moment distribution factor DF_BA = (1/L_1) / (1/L_1 + 1/L_2) for Span AB.', 'Use DF_BA = L_2 / (L_1 + L_2).', 0.6, 'ratio', 0.01, '1/L_1 = 0.25; 1/L_2 = 0.1667; sum = 0.4167. DF_BA = 0.25 / 0.4167 = 6.0 / (4.0 + 6.0) = 0.600.'),
      qNum('MOD15-E11', 'MOD15-T3', 'Calculate maximum support reaction using a reaction influence line.', 'For a simply supported beam of span L = 12 m, the influence line for vertical reaction R_A has ordinate 1.0 at A (x = 0) and decreases linearly to 0.0 at B (x = 12 m). If two point loads of 100 kN (at x = 0 m) and 60 kN (at x = 3 m, where ordinate is 9/12 = 0.75) act on the beam, calculate R_A.', 'Use R_A = 100 * 1.0 + 60 * 0.75.', 145, 'kN', 0.5, 'R_A = 100 + 45 = 145.0 kN.'),
      qNum('MOD15-E12', 'MOD15-T3', 'Verify hand bounds for midspan sagging moment in an indeterminate span.', 'A beam of span L = 10 m carries a factored UDL w = 24 kN/m. Calculate the upper-bound simply supported midspan moment M_free = w * L^2 / 8 (which bounds the maximum possible sagging moment if rotational restraint at the supports is zero).', 'Use M_free = 24 * 10^2 / 8.', 300, 'kNm', 1.0, 'M_free = 2400 / 8 = 300.0 kNm (whereas full fixity at both ends would give a lower bound of wL^2/24 = 100.0 kNm at midspan).'),
      qNum('MOD15-E13', 'MOD15-T3', 'Calculate second-order P-Delta overturning moment from storey drift.', 'A building storey carries a total factored vertical gravity load P_tot = 6000 kN. Under lateral wind load, the storey drifts horizontally by delta_h = 15 mm (0.015 m). Calculate the additional second-order P-Delta overturning moment M_2 = P_tot * delta_h.', 'Use M_2 = 6000 * 0.015.', 90, 'kNm', 0.5, 'M_2 = 6000 kN * 0.015 m = 90.0 kNm.'),
      qMcq('MOD15-E14', 'MOD15-T1', 'Distinguish between an arch and a flat beam of the same span.', 'Why can a parabolic arch carry a uniform vertical load across a long span with much smaller bending moments than a straight horizontal beam of the same span?', 'Consider the line of thrust H * y(x) vs w*x*(L-x)/2.', [
            'The curved geometry and horizontal abutment thrust H create an internal compression arch action whose vertical offset H*y(x) counteracts the free bending moment wL^2/8, carrying load primarily in axial compression',
            'Arches have zero weight',
            'Gravity does not act on curved structures',
            'Arches do not require horizontal restraint at their supports'
          ], 0, 'In an arch, the horizontal support thrust H multiplied by the arch rise y(x) opposes the gravity bending moment M_0(x), converting bending into axial compression.'),
      qMcq('MOD15-E15', 'MOD15-T1', 'Identify the structural consequence if an arch abutment spreads horizontally.', 'What happens if the foundations or tie-rod of a tied/abutted arch yield and move outward horizontally under the arch thrust H?', 'Consider loss of horizontal thrust H andcrown drop.', [
            'The horizontal thrust H drops, causing the crown to sag downward and inducing large positive bending moments throughout the arch rib',
            'The arch rises upward at the crown',
            'Bending moments in the arch remain zero',
            'The vertical reactions disappear'
          ], 0, 'Arch action relies critically on stiff horizontal support (abutments or a tension tie); outward spread releases H and turns the arch back into a curved beam in heavy bending.'),
      qMcq('MOD15-E16', 'MOD15-T2', 'Explain why differential support settlement induces bending moments in indeterminate continuous beams.', 'Why does a 20 mm vertical settlement of one support induce zero bending moment in a statically determinate simply supported beam, but induces large parasitic bending moments in a stiff continuous beam?', 'Compare rigid-body rotation vs forced curvature.', [
            'A determinate beam rotates freely on its pins as a rigid body without bending, whereas a continuous beam must bend over the remaining supports to maintain geometric compatibility with the settled support',
            'Simply supported beams have infinite EI',
            'Continuous beams have hinges at every 100 mm',
            'Settlement only affects axial load'
          ], 0, 'In a continuous beam, support settlement forces curvature (proportional to EI / L^2), generating significant hogging and sagging moments.'),
      qMcq('MOD15-E17', 'MOD15-T2', 'State the prerequisite for applying plastic or inelastic moment redistribution.', 'What physical property must a structural section possess at the peak-moment location (such as an internal support) to safely allow moment redistribution to adjacent zones?', 'Consider rotation capacity without brittle fracture or local buckling.', [
            'Sufficient rotational ductility (e.g. Class 1 plastic steel section or under-reinforced RC section with low x/d) so it can rotate at near-constant moment while load redistributes',
            'A brittle over-reinforced concrete section or slender Class 4 steel web',
            'Zero shear capacity',
            'Complete absence of reinforcement'
          ], 0, 'Moment redistribution requires the peak-moment region to yield and rotate ductilely without losing strength while stiffer elastic regions pick up the additional moment.'),
      qMcq('MOD15-E18', 'MOD15-T3', 'Distinguish an influence line from a bending moment diagram.', 'What is the fundamental difference between an influence line for bending moment at Point C and a standard bending moment diagram (BMD)?', 'Compare what varies along the horizontal x-axis.', [
            'A BMD shows the bending moment at all points x along the beam for a fixed load position, whereas an influence line shows the bending moment at one fixed point C as a unit load moves across x',
            'They are identical in all cases',
            'Influence lines only apply to columns',
            'BMDs only apply to moving trains'
          ], 0, 'In an influence line for response R_C, the abscissa x is the position of the moving unit load, and the ordinate is the value of R_C caused by the unit load at x.'),
      qMcq('MOD15-E19', 'MOD15-T3', 'Explain why long-span lightweight floors are checked for human-induced vibration.', 'Why can a modern long-span composite steel or timber floor satisfy both ULS strength and static L/360 deflection limits, yet still feel unacceptably lively or bouncy under human footfall?', 'Consider low mass, low damping, and natural frequency approaching walking harmonics (1.6 to 2.2 Hz and their multiples).', [
            'If the floor’s fundamental natural frequency is low (e.g. below 3 to 4 Hz) or its modal mass and damping are low, harmonics of human walking pace excite resonant dynamic accelerations',
            'Because static deflection formulas ignore gravity',
            'Because long-span floors weigh too much',
            'Because steel loses Young’s modulus when walked on'
          ], 0, 'Human walking generates periodic force harmonics (~2 Hz, 4 Hz, 6 Hz, 8 Hz); floors with low natural frequency and low modal mass require dynamic acceleration/response factor checks.'),
      qMcq('MOD15-E20', 'MOD15-T3', 'Pass the Module 15 Learning Gate: Predict qualitative deflected shapes and moment diagrams before running software.', 'Why must a structural engineer sketch the expected deflected shape, points of contraflexure, and tension faces of a frame before trusting finite element software output?', 'Consider how deflected curvature maps directly to bending moment sign.', [
            'Because curvature and bending moment are directly linked (M = EI * kappa); if the software’s deflected shape or moment sign contradicts the physical boundary conditions and hand bounds (wL^2/12 to wL^2/8), a modelling release or restraint error is immediately exposed',
            'Because software cannot draw lines',
            'To avoid checking reactions',
            'Because deflected shapes are unrelated to bending moments'
          ], 0, 'The concave/convex side of the deflected shape immediately identifies the compression/tension faces, points of zero moment (inflection points), and whether joints are acting as pinned or fixed.')
    ]
  }
];
