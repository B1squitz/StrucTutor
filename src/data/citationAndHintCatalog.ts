import type { AssessmentQuestion, QuestionCitation } from '../types/syllabus';

export interface TopicReferenceEntry {
  sourceTitle: string;
  authorOrBody: string;
  clauseOrSection: string;
  pageReference: string;
  pedagogicalConcept: string;
  symbolicRoadmap: string;
}

export const TOPIC_REFERENCE_CATALOG: Record<string, TopicReferenceEntry> = {
  'MOD00-T1': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & BS EN 1990:2002+A1',
    authorOrBody: 'R.C. Hibbeler (Pearson) / BSI',
    clauseOrSection: 'Ch. 1, §1.3–1.4 & BS EN 1990 Cl. 1.6, Annex C',
    pageReference: 'pp. 12–21 (Hibbeler) / pp. 21–24 (EN 1990)',
    pedagogicalConcept:
      'Write out each compound SI unit in base structural terms of Newtons (N) and millimetres (mm) before applying power-of-ten prefixes.',
    symbolicRoadmap:
      'Use the identities 1 kN = 10³ N, 1 MN = 10⁶ N, 1 m = 10³ mm, 1 m² = 10⁶ mm², 1 kN·m = 10⁶ N·mm, and 1 MPa = 1 N/mm²; cancel numerator and denominator length powers systematically.',
  },
  'MOD00-T2': {
    sourceTitle: 'Engineering Mechanics: Statics (14th SI ed.) & Structural and Stress Analysis (4th ed.)',
    authorOrBody: 'R.C. Hibbeler / T.H.G. Megson',
    clauseOrSection: 'Hibbeler Ch. 2, §2.1–2.4 & Megson Ch. 3, §3.4',
    pageReference: 'pp. 19–42 (Hibbeler) / pp. 58–66 (Megson)',
    pedagogicalConcept:
      'Sketch the right-angled geometry or differential load-shear-moment relationship first, identifying which side is adjacent, opposite, or the hypotenuse.',
    symbolicRoadmap:
      'Apply Pythagoras L = √(Δx² + Δy²), radian-degree conversion θ_deg = θ_rad × (180/π), or differential relations dV/dx = -w and dM/dx = V.',
  },
  'MOD00-T3': {
    sourceTitle: 'Engineering Mechanics: Statics (14th SI ed.)',
    authorOrBody: 'R.C. Hibbeler (Pearson)',
    clauseOrSection: 'Ch. 4, §4.1–4.9 (Force System Resultants & Distributed Loads)',
    pageReference: 'pp. 119–182',
    pedagogicalConcept:
      'Replace any distributed pressure diagram with an equivalent resultant force equal to the area of the loading diagram acting through its geometric centroid.',
    symbolicRoadmap:
      'For a rectangular UDL use R = w·L at x = L/2; for a triangular pressure distribution use R = 0.5·p_max·H acting at H/3 from the heavy base; for inclined forces resolve F_x = F·cos θ and F_y = F·sin θ.',
  },
  'MOD01-T1': {
    sourceTitle: 'Structural and Stress Analysis (4th ed.)',
    authorOrBody: 'T.H.G. Megson (Butterworth-Heinemann)',
    clauseOrSection: 'Ch. 2, §2.1–2.3 (Support Idealisation & Free-Body Diagrams)',
    pageReference: 'pp. 23–36',
    pedagogicalConcept:
      'Isolate the structural member from its supports and replace each physical restraint with the exact force or moment reactions it can develop.',
    symbolicRoadmap:
      'Count restraint components: a roller develops 1 reaction normal to the rolling surface, a pin develops 2 orthogonal force reactions (R_x, R_y), and a fixed support develops 3 reactions (R_x, R_y, M_fixed).',
  },
  'MOD01-T2': {
    sourceTitle: 'Structural and Stress Analysis (4th ed.) & Structural Analysis (10th SI ed.)',
    authorOrBody: 'T.H.G. Megson / R.C. Hibbeler',
    clauseOrSection: 'Megson Ch. 2, §2.4–2.5 & Hibbeler Ch. 2, §2.3',
    pageReference: 'pp. 37–49 (Megson) / pp. 39–54 (Hibbeler)',
    pedagogicalConcept:
      'Draw the complete free-body diagram showing all applied point loads, UDL resultants, and unknown support reactions before writing equilibrium equations.',
    symbolicRoadmap:
      'Take moments ΣM = 0 about one support pin to eliminate its unknown reaction and solve directly for the opposite reaction, then verify vertical equilibrium ΣF_y = 0.',
  },
  'MOD01-T3': {
    sourceTitle: 'Manual for the Design of Building Structures to Eurocode 1 & BS EN 1991-1-1:2002',
    authorOrBody: 'IStructE / BSI',
    clauseOrSection: 'IStructE Manual §2.3–2.5 & BS EN 1991-1-1 Cl. 6.3.1',
    pageReference: 'pp. 18–29 (IStructE) / pp. 26–31 (EN 1991-1-1)',
    pedagogicalConcept:
      'Trace the gravity load path from the one-way spanning floor slab to the supporting secondary and primary beams using tributary half-spans.',
    symbolicRoadmap:
      'Convert floor area loads (kN/m²) into beam line loads (kN/m) by multiplying by the tributary width b_trib, add member self-weight where specified, and transfer beam end reactions R = w·L/2 to supporting columns.',
  },
  'MOD01-T4': {
    sourceTitle: 'Structural Analysis (10th SI ed.) & BS 5975:2019 Temporary Works',
    authorOrBody: 'R.C. Hibbeler / BSI',
    clauseOrSection: 'Hibbeler Ch. 2, §2.4 & BS 5975:2019 Cl. 17.4',
    pageReference: 'pp. 55–64 (Hibbeler) / pp. 94–106 (BS 5975)',
    pedagogicalConcept:
      'Check both static determinacy (number of unknown reactions vs independent equilibrium equations) and geometric stability (non-concurrent, non-parallel restraint lines of action).',
    symbolicRoadmap:
      'Evaluate r - 3n for plane structures (or m + r - 2j for pin-jointed trusses) and ensure temporary works falsework has positive lateral bracing and soleplate bearing down to competent ground.',
  },
  'MOD02-T1': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.)',
    authorOrBody: 'R.C. Hibbeler (Pearson)',
    clauseOrSection: 'Ch. 6, §6.1 (Internal Shear and Moment by Method of Sections)',
    pageReference: 'pp. 269–277',
    pedagogicalConcept:
      'Make an imaginary vertical cut through the beam at the target distance x and isolate the left-hand free-body segment [0, x].',
    symbolicRoadmap:
      'Apply vertical equilibrium ΣF_y = 0 on the isolated segment to find internal shear V(x), and take moments ΣM_cut = 0 about the cut centroid to find internal bending moment M(x) (sagging positive when bottom fibre is in tension).',
  },
  'MOD02-T2': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & Structural and Stress Analysis (4th ed.)',
    authorOrBody: 'R.C. Hibbeler / T.H.G. Megson',
    clauseOrSection: 'Hibbeler Ch. 6, §6.2 & Megson Ch. 3, §3.3–3.5',
    pageReference: 'pp. 278–295 (Hibbeler) / pp. 58–82 (Megson)',
    pedagogicalConcept:
      'Relate the loading intensity w(x), shear force V(x), and bending moment M(x) through their differential and integral properties across each span segment.',
    symbolicRoadmap:
      'Use M_max = w·L²/8 for a simply supported beam under full-span UDL, M_fixed = w·L²/2 (hogging) for a cantilever under UDL, and M_max = P·a·b/L under a point load.',
  },
  'MOD02-T3': {
    sourceTitle: 'Understanding Structural Analysis (4th ed.)',
    authorOrBody: 'D. Brohn (New Paradigm Solutions)',
    clauseOrSection: 'Ch. 2–3 (Qualitative Deflected Shapes, Tension-Face BMDs & Contraflexure)',
    pageReference: 'pp. 15–54',
    pedagogicalConcept:
      'Match the sign of the bending moment to the curvature of the deflected shape: sagging (+M) stretches the bottom fibre, whereas hogging (-M) stretches the top fibre over cantilevers and internal supports.',
    symbolicRoadmap:
      'Locate stationary peak bending moments where shear V(x) passes through zero (x_0 = R_A / w under a UDL), and compute the peak moment by integrating the shear area M_peak = M(0) + ∫V(x)dx.',
  },
  'MOD03-T1': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.)',
    authorOrBody: 'R.C. Hibbeler (Pearson)',
    clauseOrSection: 'Ch. 1, §1.3–1.5 & Ch. 3, §3.1–3.4 (Normal Stress & Axial Strain)',
    pageReference: 'pp. 24–38, 85–102',
    pedagogicalConcept:
      'Distinguish external axial force F (in N or kN) from internal stress intensity σ (in N/mm² = MPa) and dimensionless normal strain ε = ΔL / L.',
    symbolicRoadmap:
      'Convert axial force into Newtons (1 kN = 10³ N), compute normal stress σ = F / A in N/mm², and evaluate axial strain ε = σ / E (multiply by 10³ if reporting in mm/m).',
  },
  'MOD03-T2': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.)',
    authorOrBody: 'R.C. Hibbeler (Pearson)',
    clauseOrSection: 'Ch. 3, §3.2, §3.6–3.7 & Ch. 4, §4.2 (Axial Deformation & Elastic Constants)',
    pageReference: 'pp. 89–114, 129–144',
    pedagogicalConcept:
      'In the linear-elastic regime below yield, axial extension is governed by axial rigidity E·A and member length L.',
    symbolicRoadmap:
      'Use ΔL = (F · L) / (E · A) with F in N, L in mm, E in N/mm², and A in mm² so ΔL emerges directly in mm; for isotropic materials relate shear modulus via G = E / [2(1 + ν)].',
  },
  'MOD03-T3': {
    sourceTitle: 'Construction Materials: Their Nature and Behaviour (4th ed.) & BS EN 1993-1-1:2005',
    authorOrBody: 'P. Domone & J. Illston (Spon Press) / BSI',
    clauseOrSection: 'Domone Parts 2–5 & BS EN 1993-1-1 Cl. 3.2',
    pageReference: 'pp. 75–340 (Domone) / pp. 26–28 (EN 1993-1-1)',
    pedagogicalConcept:
      'Compare structural materials by their ductility, tensile vs compressive strength symmetry, anisotropy, and time-dependent creep/shrinkage behaviour.',
    symbolicRoadmap:
      'Contrast ductile steel (symmetric yield f_y, E ≈ 210 GPa) with quasi-brittle concrete and masonry (high compressive strength, low tensile strength requiring reinforcement or precompression) and orthotropic timber (grain direction dependence).',
  },
  'MOD04-T1': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & Structural and Stress Analysis (4th ed.)',
    authorOrBody: 'R.C. Hibbeler / T.H.G. Megson',
    clauseOrSection: 'Hibbeler Appendix A, §A.1–A.3 & Megson Ch. 9, §9.4',
    pageReference: 'pp. 798–816 (Hibbeler) / pp. 252–264 (Megson)',
    pedagogicalConcept:
      'Second moment of area I measures how far cross-sectional area is distributed from the neutral axis of bending, scaling with the cube of depth d³.',
    symbolicRoadmap:
      'For a rectangle about its centroidal major axis use I = b·d³/12; for composite I-sections apply the Parallel-Axis Theorem I_total = Σ(I_i + A_i·d_i²); for radius of gyration use i = √(I / A).',
  },
  'MOD04-T2': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & BS EN 1993-1-1:2005',
    authorOrBody: 'R.C. Hibbeler / BSI',
    clauseOrSection: 'Hibbeler Ch. 6, §6.4, §6.9 & BS EN 1993-1-1 Cl. 6.2.5',
    pageReference: 'pp. 296–312, 344–356 (Hibbeler) / pp. 48–49 (EN 1993-1-1)',
    pedagogicalConcept:
      'Distinguish first-yield elastic bending resistance (governed by elastic section modulus W_el = I / y_max) from full plastic hinge resistance in Class 1/2 sections (governed by plastic section modulus W_pl).',
    symbolicRoadmap:
      'For a rectangle use W_el = b·d²/6 and W_pl = b·d²/4 (shape factor 1.5); compute extreme-fibre stress σ = M / W_el with M in N·mm (1 kN·m = 10⁶ N·mm) and W in mm³ (1 cm³ = 10³ mm³).',
  },
  'MOD04-T3': {
    sourceTitle: 'The Behaviour and Design of Steel Structures to EC3 (4th ed.) & SCI P363 Blue Book',
    authorOrBody: 'N.S. Trahair, M.A. Bradford, D.A. Nethercot & L. Gardner / SCI',
    clauseOrSection: 'Trahair Ch. 5, §5.1–5.3 & SCI P363 Section Tables',
    pageReference: 'pp. 135–152 (Trahair) / pp. B-12 to B-28 (SCI P363)',
    pedagogicalConcept:
      'An I-section concentrates flange area at maximum lever arm from the major axis (y-y) while the web resists vertical shear, making I_yy >> I_zz.',
    symbolicRoadmap:
      'Compare major-axis properties (I_y, W_el,y, W_pl,y) against minor-axis properties (I_z, W_el,z, i_z) and verify that primary gravity bending acts about the major axis.',
  },
  'MOD05-T1': {
    sourceTitle: 'Structural and Stress Analysis (4th ed.) & Mechanics of Materials (10th SI ed.)',
    authorOrBody: 'T.H.G. Megson / R.C. Hibbeler',
    clauseOrSection: 'Megson Ch. 13, §13.1–13.5 & Hibbeler Ch. 12, §12.1–12.2',
    pageReference: 'pp. 405–436 (Megson) / pp. 585–604 (Hibbeler)',
    pedagogicalConcept:
      'Elastic deflection is obtained by double integration of curvature κ = M(x) / (E·I) subject to support displacement and slope boundary conditions.',
    symbolicRoadmap:
      'Convert all inputs into consistent (N, mm) units: w in N/mm (1 kN/m = 1 N/mm), P in N, L in mm, E in N/mm², and I in mm⁴ (1 cm⁴ = 10⁴ mm⁴); then evaluate δ = 5wL⁴/(384EI), δ = PL³/(48EI), or cantilever δ = wL⁴/(8EI) + PL³/(3EI).',
  },
  'MOD05-T2': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & Behaviour and Design of Steel Structures to EC3 (4th ed.)',
    authorOrBody: 'R.C. Hibbeler / N.S. Trahair et al.',
    clauseOrSection: 'Hibbeler Ch. 12, §12.5 & Trahair Ch. 5, §5.7',
    pageReference: 'pp. 614–624 (Hibbeler) / pp. 168–174 (Trahair)',
    pedagogicalConcept:
      'Examine the exponents in the elastic deflection formula: deflection scales with the fourth power of span (L⁴) under a UDL and inversely with second moment of area (I ∝ d³), but is independent of steel yield strength f_y.',
    symbolicRoadmap:
      'For a span change at constant w and EI use δ_new / δ_old = (L_new / L_old)⁴; for a rectangular section depth change at constant b, L, and w use δ_new / δ_old = (d_old / d_new)³.',
  },
  'MOD05-T3': {
    sourceTitle: 'BS EN 1990:2002+A1 & SCI Publication P354 Design of Floors for Vibration',
    authorOrBody: 'BSI / Steel Construction Institute (SCI)',
    clauseOrSection: 'BS EN 1990 Cl. 3.4, Annex A1.4 & SCI P354 §2–4',
    pageReference: 'pp. 33–34, 65–68 (EN 1990) / pp. 7–32 (SCI P354)',
    pedagogicalConcept:
      'Serviceability Limit State (SLS) checks use unfactored actions to prevent cracking of brittle finishes, drainage ponding, glazing distress, and perceptible floor vibration.',
    symbolicRoadmap:
      'Check variable-load deflection against L/360 (brittle plaster/partitions) or L/200, and relate fundamental natural frequency to static deflection via f_0 ≈ 18 / √δ_mm.',
  },
  'MOD06-T1': {
    sourceTitle: 'Mechanics of Materials (10th SI ed.) & BS EN 1993-1-1:2005',
    authorOrBody: 'R.C. Hibbeler / BSI',
    clauseOrSection: 'Hibbeler Ch. 13, §13.1–13.3 & BS EN 1993-1-1 Cl. 6.3.1',
    pageReference: 'pp. 655–678 (Hibbeler) / pp. 56–60 (EN 1993-1-1)',
    pedagogicalConcept:
      'Slender compression struts fail by elastic flexural instability about the axis of highest slenderness λ = L_cr / i before reaching material yield strength f_y.',
    symbolicRoadmap:
      'Determine effective buckling length L_cr = k · L from end rotational/translational restraints, identify the governing minor-axis I_z (or i_z), and evaluate P_cr = π² · E · I_min / L_cr² (divide N by 10³ for kN).',
  },
  'MOD06-T2': {
    sourceTitle: 'The Behaviour and Design of Steel Structures to EC3 (4th ed.) & BS EN 1993-1-1:2005',
    authorOrBody: 'N.S. Trahair et al. / BSI',
    clauseOrSection: 'Trahair Ch. 6, §6.1–6.5 & BS EN 1993-1-1 Cl. 6.3.2',
    pageReference: 'pp. 183–218 (Trahair) / pp. 60–65 (EN 1993-1-1)',
    pedagogicalConcept:
      'In an unrestrained open I-beam bent about its major axis, the compression flange behaves like a strut that wants to buckle laterally between points of effective lateral restraint, twisting the cross-section.',
    symbolicRoadmap:
      'Identify which flange is in compression (top flange in sagging, bottom flange at hogging cantilevers/haunches) and verify that lateral restraint is connected to a stiff bracing system or floor diaphragm.',
  },
  'MOD06-T3': {
    sourceTitle: 'Stability of Buildings: Parts 1 & 2 & BS EN 1993-1-1:2005',
    authorOrBody: 'IStructE (2014) / BSI',
    clauseOrSection: 'IStructE Stability Guide §2–5 & BS EN 1993-1-1 Cl. 5.2–5.3',
    pageReference: 'pp. 11–58 (IStructE) / pp. 35–42 (EN 1993-1-1)',
    pedagogicalConcept:
      'A 3D building frame requires a continuous horizontal floor/roof diaphragm and at least three non-parallel, non-concurrent vertical stability planes (braced bays or shear cores) to resist sway and torsion.',
    symbolicRoadmap:
      'Trace horizontal wind and equivalent notional imperfection forces (EHF) from façade cladding into roof/floor diaphragms, down vertical bracing/cores, and into the foundations, including during temporary erection.',
  },
  'MOD07-T1': {
    sourceTitle: "Designers' Guide to EN 1990: Eurocode Basis of Structural Design & BS EN 1990:2002+A1",
    authorOrBody: 'H. Gulvanessian, J.-A. Calgaro & M. Holický (Thomas Telford) / BSI',
    clauseOrSection: 'Gulvanessian Ch. 2–4 & BS EN 1990 Cl. 1–4',
    pageReference: 'pp. 15–68 (Gulvanessian) / pp. 17–38 (EN 1990)',
    pedagogicalConcept:
      'Semi-probabilistic Limit State Design verifies E_d <= R_d by applying partial safety factors γ_F to characteristic actions (95% fractile) and γ_M to characteristic material strengths (5% fractile).',
    symbolicRoadmap:
      'Use F_d = γ_F · F_k for design actions and X_d = X_k / γ_M for design material properties, consulting the UK National Annex for Nationally Determined Parameters (NDPs).',
  },
  'MOD07-T2': {
    sourceTitle: 'BS EN 1990:2002+A1 & UK National Annex to BS EN 1990',
    authorOrBody: 'British Standards Institution (BSI)',
    clauseOrSection: 'BS EN 1990 Cl. 6.4.3.2 (Eq. 6.10, 6.10a/b), Cl. 6.5.3 & UK NA Table NA.A1.2(B)',
    pageReference: 'pp. 47–53 (EN 1990) / pp. 4–8 (UK NA)',
    pedagogicalConcept:
      'Distinguish Ultimate Limit State (ULS: STR, EQU, GEO, FAT) factored combinations from Serviceability Limit State (SLS: Characteristic, Frequent, Quasi-Permanent) combinations.',
    symbolicRoadmap:
      'For ULS STR evaluate w_Ed = γ_G·g_k + γ_Q·q_k (or the worse of Eq. 6.10a: 1.35·g_k + 1.5·ψ_0·q_k and Eq. 6.10b: ξ·1.35·g_k + 1.5·q_k); for SLS characteristic combination use g_k + q_k with partial factors of 1.0.',
  },
  'MOD07-T3': {
    sourceTitle: 'Manual for the Design of Steelwork Building Structures to Eurocode 3 & BS EN 1991-1-1:2002',
    authorOrBody: 'IStructE / BSI',
    clauseOrSection: 'IStructE Manual Ch. 2–3 & BS EN 1991-1-1 Cl. 6.3.1',
    pageReference: 'pp. 9–28 (IStructE) / pp. 26–31 (EN 1991-1-1)',
    pedagogicalConcept:
      'Follow the structured 9-part calculation workflow: convert characteristic area actions (kN/m²) via tributary width into line actions (kN/m), add self-weight, apply ULS/SLS factors, and compute design internal actions.',
    symbolicRoadmap:
      'Compute g_k,total = g_k,floor · b_trib + g_sw and q_k = q_k,floor · b_trib; then evaluate w_Ed = 1.35·g_k,total + 1.50·q_k, V_Ed = w_Ed·L/2, M_Ed = w_Ed·L²/8, and SLS δ = 5·q_k·L⁴/(384·E·I).',
  },
  'MOD08-T1': {
    sourceTitle: 'BS EN 1993-1-1:2005 (Eurocode 3) & The Behaviour and Design of Steel Structures to EC3 (4th ed.)',
    authorOrBody: 'BSI / N.S. Trahair et al.',
    clauseOrSection: 'BS EN 1993-1-1 Cl. 3.2 (Table 3.1), Cl. 5.5 (Table 5.2) & Trahair Ch. 4',
    pageReference: 'pp. 26–28, 42–46 (EN 1993-1-1) / pp. 95–116 (Trahair)',
    pedagogicalConcept:
      'Yield strength f_y decreases as plate thickness t increases, while local buckling resistance of flange outstands (c/t) and webs depends on ε = √(235 / f_y) and determines Cross-Section Class 1, 2, 3, or 4.',
    symbolicRoadmap:
      'Classify the section first: Class 1/2 sections develop full plastic moment M_pl,Rd using W_pl, Class 3 reaches first yield M_el,Rd using W_el, and Class 4 requires effective width W_eff due to local buckling before yield.',
  },
  'MOD08-T2': {
    sourceTitle: 'BS EN 1993-1-1:2005 (Eurocode 3) & SCI Publication P362 Concise Eurocodes',
    authorOrBody: 'BSI / Steel Construction Institute (SCI)',
    clauseOrSection: 'BS EN 1993-1-1 Cl. 6.2.5, Cl. 6.2.6, Cl. 6.2.8 & SCI P362 §4.2–4.5',
    pageReference: 'pp. 48–52 (EN 1993-1-1) / pp. 27–38 (SCI P362)',
    pedagogicalConcept:
      'For a laterally restrained beam, verify cross-sectional bending resistance M_c,Rd, plastic shear resistance V_pl,Rd of the web, and high-shear moment reduction if V_Ed exceeds 0.5 · V_pl,Rd.',
    symbolicRoadmap:
      'Use M_c,Rd = W_pl,y · f_y / (γ_M0 · 10⁶) [in kN·m with W_pl,y in mm³] and V_pl,Rd = A_v · (f_y / √3) / (γ_M0 · 10³) [in kN with A_v in mm²]; check whether V_Ed / V_pl,Rd <= 0.5.',
  },
  'MOD08-T3': {
    sourceTitle: 'SCI Publication P358 Simple Joints to EC3 & BS EN 1996-1-1:2005',
    authorOrBody: 'Steel Construction Institute (SCI) / BSI',
    clauseOrSection: 'SCI P358 §2–5 & BS EN 1996-1-1 Cl. 6.1.3',
    pageReference: 'pp. 11–88 (SCI P358) / pp. 62–65 (EN 1996-1-1)',
    pedagogicalConcept:
      'A beam design is incomplete until its compression flange restraint is verified in reality and its end reactions F_Ed are safely transferred through connections and padstones into the supporting structure.',
    symbolicRoadmap:
      'Size bearing padstones using required contact area A_pad = F_Ed / f_b,Rd = b_wall × L_pad (converting F_Ed from kN to N by multiplying by 10³ so dimensions are in mm and stress in N/mm²).',
  },
  'MOD09-T1': {
    sourceTitle: 'BS EN 1993-1-1:2005, BS EN 1993-1-5:2006 & SCI Publication P360',
    authorOrBody: 'BSI / Steel Construction Institute (SCI)',
    clauseOrSection: 'BS EN 1993-1-1 Cl. 6.3.2.1–6.3.2.3, EN 1993-1-5 Cl. 9 & SCI P360 §3–4',
    pageReference: 'pp. 60–64 (EN 1993-1-1) / pp. 19–48 (SCI P360)',
    pedagogicalConcept:
      'For laterally unrestrained beams, elastic critical moment M_cr governs non-dimensional LTB slenderness λ_bar,LT, which determines the buckling reduction factor χ_LT.',
    symbolicRoadmap:
      'Compute λ_bar,LT = √(W_pl,y · f_y / M_cr) using consistent moment units, obtain χ_LT from the appropriate LTB buckling curve, and evaluate M_b,Rd = χ_LT · W_pl,y · f_y / γ_M1.',
  },
  'MOD09-T2': {
    sourceTitle: 'BS EN 1993-1-1:2005 & The Behaviour and Design of Steel Structures to EC3 (4th ed.)',
    authorOrBody: 'BSI / N.S. Trahair et al.',
    clauseOrSection: 'BS EN 1993-1-1 Cl. 6.3.1, Cl. 6.3.3 (Eq. 6.61–6.62) & Trahair Ch. 3, Ch. 7',
    pageReference: 'pp. 56–60, 64–67 (EN 1993-1-1) / pp. 59–88, 231–268 (Trahair)',
    pedagogicalConcept:
      'Real steel columns contain residual stresses and initial bow imperfections (e_0 = L/1000), represented by the Ayrton-Perry buckling curves (a0, a, b, c, d) rather than the upper-bound Euler hyperbola.',
    symbolicRoadmap:
      'Calculate non-dimensional slenderness λ_bar = √(A · f_y / N_cr) about the governing axis (usually minor axis z-z), apply reduction factor χ to find N_b,Rd = χ · A · f_y / γ_M1, and check combined axial + bending interaction.',
  },
  'MOD09-T3': {
    sourceTitle: 'BS EN 1993-1-8:2005 (Eurocode 3: Design of Joints) & SCI Publication P358',
    authorOrBody: 'BSI / Steel Construction Institute (SCI)',
    clauseOrSection: 'BS EN 1993-1-8 Cl. 3.6, Cl. 4.5, Cl. 6.2.8 & SCI P358 §2–7',
    pageReference: 'pp. 27–35, 44–51, 92–101 (EN 1993-1-8) / pp. 15–120 (SCI P358)',
    pedagogicalConcept:
      'Every connection detail (fin plate, flexible end plate, haunched moment joint, or base plate) must match the rotational release or fixity assumed in the global frame analysis.',
    symbolicRoadmap:
      'Check bolt shear, plate bearing, block tearing, and fillet weld throat shear (throat thickness a = 0.7 · s for a 45° mitre fillet weld), and account for eccentric bolt-group shear + torsion.',
  },
  'MOD10-T1': {
    sourceTitle: 'Structural Timber Design to Eurocode 5 (2nd ed.) & BS EN 1995-1-1:2004+A2',
    authorOrBody: 'J. Porteous & A. Kermani (Wiley-Blackwell) / BSI',
    clauseOrSection: 'Porteous Ch. 1–2 & BS EN 1995-1-1 Cl. 2.3.1–2.4.1, Table 3.1',
    pageReference: 'pp. 1–64 (Porteous) / pp. 18–26 (EN 1995-1-1)',
    pedagogicalConcept:
      'Timber is an cellular, orthotropic material whose design strength f_d depends on moisture Service Class (1, 2, or 3), Load Duration Class, and the load-sharing system factor k_sys.',
    symbolicRoadmap:
      'Convert characteristic strength f_k into design strength using f_d = k_mod · f_k / γ_M, selecting k_mod for the shortest-duration action present in the load combination.',
  },
  'MOD10-T2': {
    sourceTitle: 'BS EN 1995-1-1:2004+A2 (Eurocode 5) & Structural Timber Design to EC5 (2nd ed.)',
    authorOrBody: 'BSI / J. Porteous & A. Kermani',
    clauseOrSection: 'BS EN 1995-1-1 Cl. 6.1.4, Cl. 6.1.6, Cl. 6.1.7, Cl. 6.5.2 & Porteous Ch. 4',
    pageReference: 'pp. 37–43, 52–54 (EN 1995-1-1) / pp. 73–112 (Porteous)',
    pedagogicalConcept:
      'In rectangular timber joists, longitudinal shear at the neutral axis is parabolic (peaking at 1.5× average shear), while bearing at supports acts perpendicular to the weak tubular grain.',
    symbolicRoadmap:
      'Use τ_d = 1.5 · V_d / (b_ef · d) for rectangular shear, σ_c,90,d = F_c,90,d / (b · l_eff) for bearing perpendicular to the grain (converting kN to N), and apply reduction factor k_v at notched supports.',
  },
  'MOD10-T3': {
    sourceTitle: 'BS EN 1995-1-1:2004+A2, BS EN 1995-1-2:2004 & Structural Timber Design to EC5 (2nd ed.)',
    authorOrBody: 'BSI / J. Porteous & A. Kermani',
    clauseOrSection: 'BS EN 1995-1-1 Cl. 2.2.3, Table 3.2, Cl. 6.3.3, Ch. 8 & EN 1995-1-2 Cl. 3.4',
    pageReference: 'pp. 16–17, 26, 48–50, 67–94 (EN 1995-1-1) / pp. 18–24 (EN 1995-1-2)',
    pedagogicalConcept:
      'Long-term timber deflection increases significantly due to moisture-dependent creep (k_def), while dowel-type connections require minimum edge/end distances to prevent brittle splitting along the grain.',
    symbolicRoadmap:
      'Compute final creep deflection using u_fin = u_inst · (1 + k_def) for permanent actions and u_inst,Q · (1 + ψ_2 · k_def) for variable actions; for fire design reduce cross-section by charring depth d_char = β_0 · t.',
  },
  'MOD11-T1': {
    sourceTitle: 'Design of Masonry Structures (3rd ed.) & BS EN 1996-1-1:2005+A1',
    authorOrBody: 'A.W. Hendry, B.P. Sinha & S.R. Davies (Spon Press) / BSI',
    clauseOrSection: 'Hendry Ch. 2–5 & BS EN 1996-1-1 Cl. 3.6, Cl. 5.5.1, Cl. 6.1.2',
    pageReference: 'pp. 18–112 (Hendry) / pp. 31–38, 52–61 (EN 1996-1-1)',
    pedagogicalConcept:
      'Unreinforced masonry has high compressive capacity but negligible reliable tensile strength, so stability relies on keeping the line of thrust within the wall thickness via lateral floor/roof restraints.',
    symbolicRoadmap:
      'Determine characteristic compressive strength f_k = K · f_b^α · f_m^β, compute design strength f_d = f_k / γ_M, and apply capacity reduction factor Φ_i,m for slenderness h_ef / t_ef and eccentricity.',
  },
  'MOD11-T2': {
    sourceTitle: 'BS EN 1996-1-1:2005+A1 & IStructE Manual for the Design of Plain Masonry to EC6 (2nd ed.)',
    authorOrBody: 'BSI / Institution of Structural Engineers (IStructE)',
    clauseOrSection: 'BS EN 1996-1-1 Cl. 6.1.3 & IStructE Masonry Manual §5.4–5.7',
    pageReference: 'pp. 62–65 (EN 1996-1-1) / pp. 45–64 (IStructE)',
    pedagogicalConcept:
      'Concentrated beam reactions can crush masonry locally beneath the bearing unless spread through a stiff concrete or steel padstone.',
    symbolicRoadmap:
      'Size padstone length using L_pad >= R_Ed / (t_wall · f_b,Rd) with R_Ed in N, t_wall in mm, and f_b,Rd = β · f_d in N/mm²; limit lintel SLS deflection to L/500 when supporting brittle existing masonry.',
  },
  'MOD11-T3': {
    sourceTitle: 'BS 5975:2019 Temporary Works & CIRIA Report C579 Retention of Masonry Facades',
    authorOrBody: 'BSI / CIRIA',
    clauseOrSection: 'BS 5975:2019 Cl. 19–20 & CIRIA C579 Ch. 4–6',
    pageReference: 'pp. 112–134 (BS 5975) / pp. 48–96 (CIRIA C579)',
    pedagogicalConcept:
      'Removing a load-bearing wall creates a temporary works load path where upper masonry, floors, and roof must be supported on needles, props, backprops, and soleplates before demolition begins.',
    symbolicRoadmap:
      'Solve the needle beam as a simply supported beam spanning between inner and outer props (taking moments about one prop to find the asymmetric prop reactions), and verify dry-pack mortar pre-loading.',
  },
  'MOD12-T1': {
    sourceTitle: "Craig's Soil Mechanics (9th ed.) & BS EN 1997-2:2007",
    authorOrBody: 'J.A. Knappett & R.F. Craig (CRC Press) / BSI',
    clauseOrSection: 'Craig Ch. 1, §1.1–1.5 & BS EN 1997-2 Cl. 4–5',
    pageReference: 'pp. 3–34 (Craig) / pp. 42–78 (EN 1997-2)',
    pedagogicalConcept:
      'Coarse-grained soils (sands/gravels) are governed by particle packing and relative density, whereas fine-grained soils (silts/clays) are governed by water content and Atterberg plasticity limits.',
    symbolicRoadmap:
      'Calculate Plasticity Index I_P = w_L - w_P, Liquidity Index I_L = (w - w_P) / I_P, and void ratio / unit weight phase relations from solid, water, and air volumes.',
  },
  'MOD12-T2': {
    sourceTitle: "Craig's Soil Mechanics (9th ed.) & BS EN 1997-1:2004+A1",
    authorOrBody: 'J.A. Knappett & R.F. Craig (CRC Press) / BSI',
    clauseOrSection: 'Craig Ch. 3, §3.1–3.2 (Terzaghi Effective Stress) & BS EN 1997-1 Cl. 2.4',
    pageReference: 'pp. 69–78 (Craig) / pp. 24–36 (EN 1997-1)',
    pedagogicalConcept:
      'Soil shear strength and compression are governed by intergranular effective stress σ_v′ = σ_v - u, not total overburden stress σ_v alone.',
    symbolicRoadmap:
      'Sum total vertical stress across soil layers σ_v = Σ(γ_i · Δz_i), compute hydrostatic pore-water pressure u = γ_w · (z - z_w) below the water table, and subtract to obtain σ_v′ = σ_v - u.',
  },
  'MOD12-T3': {
    sourceTitle: "Craig's Soil Mechanics (9th ed.)",
    authorOrBody: 'J.A. Knappett & R.F. Craig (CRC Press)',
    clauseOrSection: 'Ch. 2, §2.1–2.4 (Seepage) & Ch. 4, §4.1–4.6 (Mohr-Coulomb Shear Strength)',
    pageReference: 'pp. 35–68, 95–138',
    pedagogicalConcept:
      'High-permeability granular soils drain immediately during construction (governed by drained parameters c′, φ′), whereas low-permeability clays respond undrained in the short term (governed by s_u = c_u).',
    symbolicRoadmap:
      'Apply Mohr-Coulomb drained strength τ_f = c′ + (σ_n - u) · tan φ′ or short-term undrained strength τ_f = c_u, checking both short-term and long-term stability (e.g. unloaded excavations in clay).',
  },
  'MOD12-T4': {
    sourceTitle: "Craig's Soil Mechanics (9th ed.) & BS EN 1997-1:2004+A1",
    authorOrBody: 'J.A. Knappett & R.F. Craig / BSI',
    clauseOrSection: 'Craig Ch. 5, Ch. 8 & BS EN 1997-1 Cl. 6.6, Annex H',
    pageReference: 'pp. 139–174, 241–284 (Craig) / pp. 71–74, 152–154 (EN 1997-1)',
    pedagogicalConcept:
      'Superstructure cracking is driven by differential settlement and angular distortion β = Δs / L between adjacent columns rather than uniform settlement.',
    symbolicRoadmap:
      'Limit angular distortion β to 1/500 for normal frames with brittle finishes (per EC7 Annex H), and note that consolidation drainage time t scales with the square of drainage path length H_dr².',
  },
  'MOD13-T1': {
    sourceTitle: 'Foundation Design and Construction (7th ed.) & BS EN 1997-1:2004+A1',
    authorOrBody: 'M.J. Tomlinson & R. Boorman (Pearson) / BSI',
    clauseOrSection: 'Tomlinson Ch. 2–4 & BS EN 1997-1 Cl. 6.1–6.4',
    pageReference: 'pp. 39–158 (Tomlinson) / pp. 63–66 (EN 1997-1)',
    pedagogicalConcept:
      'Select foundation systems (strip, pad, raft, or piles with ground beams) to transfer building loads past compressible/shrinkable upper soils into a competent bearing stratum.',
    symbolicRoadmap:
      'Match foundation depth and type to the Ground Investigation profile, groundwater regime, clay shrinkage/tree-heave zone, and allowable differential settlement.',
  },
  'MOD13-T2': {
    sourceTitle: 'BS EN 1997-1:2004+A1, BS EN 1992-1-1:2004 & Decoding Eurocode 7',
    authorOrBody: 'BSI / A. Bond & A. Harris (Taylor & Francis)',
    clauseOrSection: 'BS EN 1997-1 Cl. 6.5, BS EN 1992-1-1 Cl. 6.4 & Bond Ch. 10',
    pageReference: 'pp. 66–71 (EN 1997-1) / pp. 99–111 (EN 1992-1-1) / pp. 255–292 (Bond)',
    pedagogicalConcept:
      'Pad foundations must satisfy geotechnical bearing and sliding under eccentric loading as well as structural RC cantilever bending, one-way beam shear (at d from column face), and punching shear (at 2d).',
    symbolicRoadmap:
      'Compute eccentricity e = M / N (middle-third rule e <= B/6 keeps full base in compression with q_max = (N/B²)·(1 + 6e/B)); for structural RC design use cantilever projection c = (B - b_col)/2, M_Ed = q_Ed·B·c²/2, and V_Ed = q_Ed·B·(c - d).',
  },
  'MOD13-T3': {
    sourceTitle: "Craig's Soil Mechanics (9th ed.) & BS EN 1997-1:2004+A1",
    authorOrBody: 'J.A. Knappett & R.F. Craig / BSI',
    clauseOrSection: 'Craig Ch. 11, §11.1–11.6 & BS EN 1997-1 Cl. 9',
    pageReference: 'pp. 359–398 (Craig) / pp. 103–114 (EN 1997-1)',
    pedagogicalConcept:
      'Retaining walls must resist lateral active earth pressure plus any un-drained hydrostatic water pressure against overturning about the toe, base sliding, and bearing failure.',
    symbolicRoadmap:
      'Use Rankine active coefficient K_a = (1 - sin φ′)/(1 + sin φ′), horizontal triangular soil thrust P_a = 0.5 · K_a · γ · H² acting at H/3 above the base, and overturning moment M_ovt = P_a · (H/3).',
  },
  'MOD14-T1': {
    sourceTitle: 'Reinforced Concrete Design to Eurocode 2 (7th ed.) & BS EN 1992-1-1:2004+A1',
    authorOrBody: 'B. Mosley, J. Bungey & R. Hulse (Palgrave) / BSI',
    clauseOrSection: 'Mosley Ch. 4, §4.1–4.6 & BS EN 1992-1-1 Cl. 3.1.7, Cl. 6.1',
    pageReference: 'pp. 66–94 (Mosley) / pp. 34–36, 83–86 (EN 1992-1-1)',
    pedagogicalConcept:
      'Reinforced concrete flexure equates the internal concrete compression block C_c and tension bar force T_s across lever arm z, limiting neutral axis depth x/d <= 0.45 (K <= K′ = 0.167) to ensure ductile steel yielding.',
    symbolicRoadmap:
      'Evaluate K = M_Ed / (b · d² · f_ck) in consistent (N, mm) units; verify K <= 0.167, determine lever arm z <= 0.95d, and calculate tension steel area A_s,req = M_Ed / (f_yd · z) where f_yd = f_yk / 1.15.',
  },
  'MOD14-T2': {
    sourceTitle: 'BS EN 1992-1-1:2004+A1 (Eurocode 2) & Reinforced Concrete Design to EC2 (7th ed.)',
    authorOrBody: 'BSI / B. Mosley, J. Bungey & R. Hulse',
    clauseOrSection: 'BS EN 1992-1-1 Cl. 6.2, Cl. 7.3–7.4, Cl. 8.4–8.7 & Mosley Ch. 5–6',
    pageReference: 'pp. 86–96, 121–133, 136–148 (EN 1992-1-1) / pp. 107–168 (Mosley)',
    pedagogicalConcept:
      'When ULS shear V_Ed exceeds unreinforced concrete shear capacity V_Rd,c, shear links act as tension ties in a variable-angle truss (1.0 <= cot θ <= 2.5) while concrete struts resist diagonal compression V_Rd,max.',
    symbolicRoadmap:
      'Use V_Rd,s = (A_sw / s) · z · f_ywd · cot θ for vertical shear links, provide anchorage/lap lengths l_bd, and verify SLS span-to-effective-depth (L/d) and crack-width limits.',
  },
  'MOD14-T3': {
    sourceTitle: 'BS EN 1992-1-1:2004+A1 & Concrete Society TR74 / CIRIA 108 Backpropping Guide',
    authorOrBody: 'BSI / Concrete Society & CIRIA',
    clauseOrSection: 'BS EN 1992-1-1 Cl. 4.4.1, Cl. 5.8, Cl. 6.4 & CIRIA Report 108',
    pageReference: 'pp. 47–55, 68–79, 99–111 (EN 1992-1-1) / pp. 12–44 (CIRIA 108)',
    pedagogicalConcept:
      'Two-way flat slabs concentrate shear around column heads (checked on the basic control perimeter u_1 at distance 2.0d from the column face) and require careful backpropping during multi-storey construction.',
    symbolicRoadmap:
      'Calculate nominal cover c_nom = c_min + Δc_dev, check punching shear perimeter u_1 = 2(c_1 + c_2) + 4πd, and assess construction-stage backprop loads against immature slab capacity.',
  },
  'MOD15-T1': {
    sourceTitle: 'Structural and Stress Analysis (4th ed.) & Structural Analysis (10th SI ed.)',
    authorOrBody: 'T.H.G. Megson / R.C. Hibbeler',
    clauseOrSection: 'Megson Ch. 4–5 & Hibbeler Ch. 3, Ch. 5',
    pageReference: 'pp. 87–134 (Megson) / pp. 85–138, 195–218 (Hibbeler)',
    pedagogicalConcept:
      'Pin-jointed trusses carry loads primarily by axial tension and compression, while three-pinned portal frames and arches introduce an internal crown hinge condition M_crown = 0 to solve horizontal base thrust H.',
    symbolicRoadmap:
      'For truss joints apply ΣF_y = 0 and ΣF_x = 0 using member inclination angle θ; for a symmetrical three-pinned portal under UDL w take moments about the crown hinge to obtain H = w·L² / (8·f) and eaves moment M_eaves = H · h_col.',
  },
  'MOD15-T2': {
    sourceTitle: 'Structural and Stress Analysis (4th ed.) & BS EN 1992-1-1:2004',
    authorOrBody: 'T.H.G. Megson / BSI',
    clauseOrSection: 'Megson Ch. 16, §16.1–16.6 & BS EN 1992-1-1 Cl. 5.5',
    pageReference: 'pp. 501–556 (Megson) / pp. 61–62 (EN 1992-1-1)',
    pedagogicalConcept:
      'Statically indeterminate beams cannot be solved by equilibrium alone; internal moments distribute in proportion to rotational stiffness EI/L and compatibility of support rotations.',
    symbolicRoadmap:
      'For a fixed-ended beam under UDL w use fixed-end hogging moment M_FEM = w·L²/12 and midspan sagging moment M_mid = w·L²/8 - w·L²/12 = w·L²/24; for a propped cantilever use R_prop = 3wL/8 and M_fixed = wL²/8.',
  },
  'MOD15-T3': {
    sourceTitle: 'Structural Analysis (10th SI ed.) & BS EN 1993-1-1:2005',
    authorOrBody: 'R.C. Hibbeler / BSI',
    clauseOrSection: 'Hibbeler Ch. 6, §6.1–6.4 (Influence Lines) & BS EN 1993-1-1 Cl. 5.2.1',
    pageReference: 'pp. 221–262 (Hibbeler) / pp. 35–38 (EN 1993-1-1)',
    pedagogicalConcept:
      'Influence lines plot how a specific reaction, shear, or moment varies as a unit load moves across a structure (Müller-Breslau principle), while second-order P-Δ effects amplify sway moments when α_cr < 10.',
    symbolicRoadmap:
      'Release the action of interest and apply a unit displacement to sketch its influence line; bound any indeterminate span moment between Fixed-End (wL²/12 hogging, wL²/24 sagging) and Simply Supported (wL²/8 sagging).',
  },
  'MOD16-T1': {
    sourceTitle: 'Modern Structural Analysis: Modelling Process and Guidance',
    authorOrBody: 'I.A. MacLeod (IStructE / Thomas Telford, 2005)',
    clauseOrSection: 'Ch. 3–5 (Element Selection, Local Axes, End Releases & Support Restraints)',
    pageReference: 'pp. 29–88',
    pedagogicalConcept:
      'Every finite-element or frame model is an idealisation: incorrect member end releases, local axis orientations, or unphysically rigid pin/fixed supports will produce wrong internal force paths.',
    symbolicRoadmap:
      'Verify that member end releases match physical connection detailing without creating unstable mechanisms (such as releasing torsional rotation θ_x at both ends of a 3D beam).',
  },
  'MOD16-T2': {
    sourceTitle: 'Modern Structural Analysis: Modelling Process and Guidance',
    authorOrBody: 'I.A. MacLeod (IStructE / Thomas Telford, 2005)',
    clauseOrSection: 'Ch. 6–8 (Load Cases, Floor Diaphragms, Offsets & Mesh Convergence)',
    pageReference: 'pp. 89–142',
    pedagogicalConcept:
      'Distinguish rigid vs flexible floor diaphragm assumptions, check mesh refinement near 2D slab singularities (columns/re-entrant corners), and recognize that superposition fails in non-linear P-Δ or tension-only analyses.',
    symbolicRoadmap:
      'Integrate FE slab moments across design strips rather than designing for unsmoothed single-node peak spikes, and run non-linear load combinations directly rather than superposing individual load cases.',
  },
  'MOD16-T3': {
    sourceTitle: 'Guidelines for the Use of Computers for Engineering Calculations & Modern Structural Analysis',
    authorOrBody: 'IStructE (2002) / I.A. MacLeod (2005)',
    clauseOrSection: 'MacLeod Ch. 9–10 (Verification, Validation, Equilibrium & Sensitivity Audits)',
    pageReference: 'pp. 143–178',
    pedagogicalConcept:
      'Never extract member forces from structural software until you have audited solver warnings, verified global reaction equilibrium (ΣF = Applied Loads), inspected deflected shapes, and checked hand-calculation bounds.',
    symbolicRoadmap:
      'Apply the 7 mandatory software gate checks: zero ill-conditioning warnings, exact reaction sum, continuous deflected shape, boundary-condition match, hand-formula bounding (wL²/8), and soil/connection stiffness sensitivity.',
  },
  'MOD17-T1': {
    sourceTitle: 'Standard Method of Detailing Structural Concrete (3rd ed.) & SCI Publication P358',
    authorOrBody: 'IStructE & Concrete Society (2006) / SCI',
    clauseOrSection: 'IStructE Detailing Manual §2–6 & SCI P358 §2',
    pageReference: 'pp. 7–96 (IStructE) / pp. 11–26 (SCI P358)',
    pedagogicalConcept:
      'Structural drawings and schedules are the primary instruction to site: a theoretically adequate calculation will fail if reinforcement is too congested to vibrate concrete or bolts cannot be installed.',
    symbolicRoadmap:
      'Coordinate bar bend radii, lap zones, and layer positions (B1/B2/T1/T2) on BS 8666 schedules, and state explicit connection forces and restraint requirements on steel GA drawings.',
  },
  'MOD17-T2': {
    sourceTitle: 'BS EN 1090-2:2018 Execution of Steel Structures & BS 5975:2019 Temporary Works',
    authorOrBody: 'British Standards Institution (BSI)',
    clauseOrSection: 'BS EN 1090-2 Cl. 11, Annex B & BS 5975:2019 Cl. 9–11',
    pageReference: 'pp. 74–82, 118–126 (EN 1090-2) / pp. 34–58 (BS 5975)',
    pedagogicalConcept:
      'Permanent works and temporary works interact at every stage of construction: a frame or precast floor that is stable when complete may be a mechanism during erection until temporary bracing and grouting are installed.',
    symbolicRoadmap:
      'Provide adjustable shims/slots to accommodate dimensional tolerances between concrete and steelwork, respect minimum end bearing lengths for precast units, and define erection stability sequences.',
  },
  'MOD17-T3': {
    sourceTitle: 'UK CDM Regulations 2015 (L153 Guidance) & IStructE Structural Plan of Work 2020',
    authorOrBody: 'Health and Safety Executive (HSE) / IStructE',
    clauseOrSection: 'CDM 2015 Reg. 9–10 & IStructE Plan of Work Stages 4–5',
    pageReference: 'pp. 26–34 (HSE L153) / pp. 18–35 (IStructE)',
    pedagogicalConcept:
      'Coordinate structural zones with architectural and MEP service penetrations early (placing web openings in low-shear zones), log residual construction hazards, and specify mandatory site Hold Points.',
    symbolicRoadmap:
      'Audit all outgoing drawings against calculation assumptions, re-verify load paths whenever an RFI or Late Design Change alters geometry or loading, and define Hold Points for foundation/temporary-works inspections.',
  },
  'MOD18-T1': {
    sourceTitle: 'Appraisal of Existing Structures (3rd ed.)',
    authorOrBody: 'Institution of Structural Engineers (IStructE, 2010)',
    clauseOrSection: 'Ch. 3–5 (Desk Study, Visual Inspection & Intrusive Investigation)',
    pageReference: 'pp. 19–62',
    pedagogicalConcept:
      'Historic record drawings are unverified hypotheses until confirmed on site: alterations, notches, and hidden bearings must be verified by targeted visual and intrusive opening-up surveys.',
    symbolicRoadmap:
      'Measure actual span geometry, section sizes, and support bearing conditions on site, and design temporary propping before cutting investigative trial pockets in load-bearing elements.',
  },
  'MOD18-T2': {
    sourceTitle: 'Appraisal of Existing Structures (3rd ed.) & BRE Digest 251',
    authorOrBody: 'IStructE (2010) / Building Research Establishment (BRE)',
    clauseOrSection: 'IStructE Appraisal Guide Ch. 6–8 & BRE Digest 251',
    pageReference: 'pp. 63–128 (IStructE) / pp. 1–12 (BRE Digest 251)',
    pedagogicalConcept:
      'Distinguish brittle historic cast iron (weak in tension, Thick tensile bottom flange) from wrought iron and modern steel, and diagnose active vs historic movement from crack width tapering and pathology.',
    symbolicRoadmap:
      'Account for section loss at corroded steel web ends and fungal rot in embedded timber joist ends, where support shear and bearing stresses are highest.',
  },
  'MOD18-T3': {
    sourceTitle: 'BS 5975:2019 Temporary Works & IStructE Appraisal of Existing Structures (3rd ed.)',
    authorOrBody: 'BSI / Institution of Structural Engineers (IStructE)',
    clauseOrSection: 'BS 5975:2019 Cl. 19 & IStructE Appraisal Guide Ch. 9–11',
    pageReference: 'pp. 112–120 (BS 5975) / pp. 129–164 (IStructE)',
    pedagogicalConcept:
      'Refuse to guess hidden structural capacity when stability is at stake: either specify intrusive opening-up with temporary propping, bound the worst credible load path conservatively, or escalate to a specialist.',
    symbolicRoadmap:
      'Verify how lateral restraint, arch thrust, and vertical load paths will be maintained at every step of an alteration before any existing structural element is cut or removed.',
  },
  'MOD19-T1': {
    sourceTitle: 'IStructE Structural Plan of Work 2020 & BS EN 1990:2002+A1',
    authorOrBody: 'Institution of Structural Engineers (IStructE) / BSI',
    clauseOrSection: 'IStructE Plan of Work Stages 1–3 & BS EN 1990 Cl. 1.3–1.4',
    pageReference: 'pp. 8–22 (IStructE) / pp. 18–20 (EN 1990)',
    pedagogicalConcept:
      'Define the exact scope of deliverables, design responsibilities, exclusions, and pre-design information (GI report, topographical survey) in writing before starting detailed calculations.',
    symbolicRoadmap:
      'Structure calculation notes with explicit Design Basis assumptions, load paths, Eurocode clauses, units, and Status A/B/C tracking so no unverified assumption reaches Construction Issue.',
  },
  'MOD19-T2': {
    sourceTitle: 'BS 5975:2019 Temporary Works & SCOSS / IStructE Guidance on Design Checking',
    authorOrBody: 'BSI / Standing Committee on Structural Safety (SCOSS)',
    clauseOrSection: 'BS 5975:2019 Cl. 11.2, Table 1 (Categories 0–3) & SCOSS Checking Guide',
    pageReference: 'pp. 42–46 (BS 5975) / pp. 1–16 (SCOSS)',
    pedagogicalConcept:
      'Independent Category 2 and Category 3 design checks must evaluate global stability, load paths, and member capacities from drawings and design briefs alone, without copying the original designer’s calculation file.',
    symbolicRoadmap:
      'Match check category to structural consequence and complexity (Cat 0/1 internal check, Cat 2 independent engineer in same organisation without original calcs, Cat 3 independent external organisation), and check combined interaction ratios.',
  },
  'MOD19-T3': {
    sourceTitle: 'IStructE Code of Conduct and Guidance Notes & BS EN 1990:2002+A1 Annex B',
    authorOrBody: 'Institution of Structural Engineers (IStructE) / BSI',
    clauseOrSection: 'IStructE Guidance Notes GN 1–4 & BS EN 1990 Annex B (Table B3)',
    pageReference: 'pp. 1–28 (IStructE) / pp. 71–75 (EN 1990)',
    pedagogicalConcept:
      'Maintain strict revision control on drawings and calculation packages, operate strictly within your verified competence boundary, and escalate immediately when a site defect or overload is discovered.',
    symbolicRoadmap:
      'Issue clear, unambiguous engineering instructions when calculations or site inspections reveal an unsafe condition, and never sign off a Construction Issue certificate while critical design checks remain outstanding.',
  },
};

/**
 * Builds a structured QuestionCitation with real book/standard title, author/body,
 * clause/section, and page reference for any syllabus question (N2).
 */
export function buildStructuredCitation(
  q: Pick<AssessmentQuestion, 'id' | 'moduleNumber' | 'topicId' | 'learningObjective' | 'prompt'>
): QuestionCitation {
  const modId = `MOD-${String(q.moduleNumber).padStart(2, '0')}`;
  const entry =
    TOPIC_REFERENCE_CATALOG[q.topicId] ??
    TOPIC_REFERENCE_CATALOG[`MOD${String(q.moduleNumber).padStart(2, '0')}-T1`] ??
    TOPIC_REFERENCE_CATALOG['MOD00-T1'];

  const formatted = `${entry.authorOrBody}, ${entry.sourceTitle}, ${entry.clauseOrSection}, ${entry.pageReference}`;

  return {
    moduleId: modId,
    topicId: q.topicId,
    sourceTitle: entry.sourceTitle,
    authorOrBody: entry.authorOrBody,
    clauseOrSection: entry.clauseOrSection,
    pageReference: entry.pageReference,
    formatted,
  };
}

/**
 * Generates all string representations of a numeric answer that must NEVER appear
 * as a leaked answer in a hint.
 */
export function getAnswerLeakTokens(ans: number): string[] {
  if (!Number.isFinite(ans)) return [];
  const abs = Math.abs(ans);
  const tokens = new Set<string>();
  tokens.add(String(ans));
  tokens.add(String(abs));
  tokens.add(ans.toLocaleString('en-GB'));
  tokens.add(abs.toLocaleString('en-GB'));
  tokens.add(Number(ans.toFixed(1)).toString());
  tokens.add(Number(ans.toFixed(2)).toString());
  tokens.add(Number(ans.toFixed(3)).toString());
  tokens.add(ans.toFixed(1));
  tokens.add(ans.toFixed(2));
  return Array.from(tokens).filter((t) => t.length > 0);
}

/**
 * Checks whether any hint in a question leaks the final numerical answer (or correct MCQ option).
 */
export function doesQuestionHintLeakAnswer(
  q: Pick<
    AssessmentQuestion,
    'id' | 'type' | 'prompt' | 'correctAnswer' | 'options' | 'correctOptionIndex' | 'hints' | 'unit'
  >
): { leaked: boolean; reason?: string } {
  if (!Array.isArray(q.hints) || q.hints.length < 2) {
    return { leaked: true, reason: 'Missing at least 2 progressive hints' };
  }

  const combinedHints = q.hints.join(' ');

  if (q.type === 'numeric') {
    const tokens = getAnswerLeakTokens(q.correctAnswer);
    for (const tok of tokens) {
      const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Check for `= <ans>` or `≈ <ans>` or `is <ans>` or standalone token not in prompt
      const eqRegex = new RegExp(`(?:=|≈|equals|is|obtain|gives)\\s*[-+]?${escaped}(?!\\d)`, 'i');
      if (eqRegex.test(combinedHints)) {
        return {
          leaked: true,
          reason: `Numeric hint leaks final result via "${tok}" in: "${combinedHints}"`,
        };
      }

      // Also check if the exact answer token appears anywhere in the hints when it was NOT a given input in the prompt
      const tokenRegex = new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`);
      const inPrompt = tokenRegex.test(q.prompt);
      if (!inPrompt && tokenRegex.test(combinedHints)) {
        return {
          leaked: true,
          reason: `Numeric hint contains unprompted final answer token "${tok}"`,
        };
      }
    }
  } else if (q.type === 'mcq' && Array.isArray(q.options)) {
    const cIdx = q.correctOptionIndex ?? q.correctAnswer ?? 0;
    const correctText = (q.options[cIdx] ?? '').trim();
    if (correctText.length > 15 && combinedHints.toLowerCase().includes(correctText.toLowerCase())) {
      return {
        leaked: true,
        reason: `MCQ hint quotes the exact correct option text`,
      };
    }
  }

  return { leaked: false };
}

/**
 * Scrubs any numeric answer tokens and trailing `= <number>` evaluations from a formula setup string.
 */
function sanitizeSetupSentence(
  rawSetup: string,
  correctAnswer: number,
  unit: string | undefined,
  fallbackRoadmap: string
): string {
  // Take only the part before the final `= <answer>` if present
  const tokens = getAnswerLeakTokens(correctAnswer);
  let cleaned = rawSetup;

  for (const tok of tokens) {
    const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(
      new RegExp(`(?:=|≈)\\s*[-+]?${escaped}[^.;]*`, 'gi'),
      '= ?'
    );
    cleaned = cleaned.replace(
      new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`, 'g'),
      '?'
    );
  }

  // If the sentence still contains no symbolic clue or was mostly just the answer, use the topic's symbolic roadmap
  if (cleaned.includes('?') && cleaned.length >= 25) {
    return `${cleaned.replace(/\s+/g, ' ').trim()} (express final result in ${unit || 'SI units'}).`;
  }
  return `${fallbackRoadmap} Express your final calculated value in ${unit || 'the required SI unit'}.`;
}

/**
 * Generates a two-step progressive pedagogical hint pair [hint1, hint2] for a question
 * that climbs in genuine engineering steps and NEVER leaks the final answer (N2).
 */
export function buildPedagogicalHintsForQuestion(
  q: Pick<
    AssessmentQuestion,
    | 'id'
    | 'moduleNumber'
    | 'topicId'
    | 'learningObjective'
    | 'type'
    | 'prompt'
    | 'unit'
    | 'correctAnswer'
    | 'options'
    | 'correctOptionIndex'
    | 'explanation'
  >
): [string, string] {
  const entry =
    TOPIC_REFERENCE_CATALOG[q.topicId] ??
    TOPIC_REFERENCE_CATALOG[`MOD${String(q.moduleNumber).padStart(2, '0')}-T1`] ??
    TOPIC_REFERENCE_CATALOG['MOD00-T1'];

  if (q.type === 'numeric') {
    const h1 = `First Hint (Physical Principle & Idealisation: ${q.learningObjective}): ${entry.pedagogicalConcept}`;

    // Extract the first equation setup clause from explanation if it has an `=` sign, then scrub any answer leak
    const firstSentence =
      q.explanation
        .split(/(?<=\.)\s+/)[0]
        ?.trim() ?? '';

    const candidateH2 = `Second Hint (Symbolic Formula & Unit Setup): ${sanitizeSetupSentence(
      firstSentence,
      q.correctAnswer,
      q.unit,
      entry.symbolicRoadmap
    )}`;

    // Final safety check: if candidateH2 or h1 still triggers any leak check, use a scrubbed symbolic roadmap
    const leakCheck = doesQuestionHintLeakAnswer({
      ...q,
      hints: [h1, candidateH2],
    });
    if (leakCheck.leaked) {
      const tokens = getAnswerLeakTokens(q.correctAnswer);
      const scrubTokens = (str: string) => {
        let out = str;
        for (const tok of tokens) {
          const escaped = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          out = out.replace(new RegExp(`(?:=|≈)\\s*[-+]?${escaped}`, 'gi'), 'is governed by');
          out = out.replace(new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`, 'g'), 'k');
        }
        return out;
      };
      const safeH1 = scrubTokens(`First Hint (Governing Mechanics Principle): ${entry.pedagogicalConcept}`);
      const safeH2 = scrubTokens(
        `Second Hint (Symbolic Equation & SI Units): Write out the governing equilibrium and compatibility equation in symbolic form, convert all given parameters into consistent SI base units, and evaluate the final numerical quantity in ${
          q.unit || 'SI units'
        }.`
      );
      return [safeH1, safeH2];
    }
    return [h1, candidateH2];
  }

  // MCQ / Scenario progressive hints
  const h1 = `First Hint (Governing Structural Principle: ${q.learningObjective}): ${entry.pedagogicalConcept}`;
  const h2 = `Second Hint (Analytical Elimination Criterion): ${entry.symbolicRoadmap} Eliminate distractors that violate equilibrium, confuse elastic stiffness (E·I) with yield strength (f_y), or misapply Eurocode limit-state rules (Ref: ${entry.clauseOrSection}).`;

  return [h1, h2];
}
