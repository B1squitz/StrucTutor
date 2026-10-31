# StructTutor Content & Question Schema Specification (`v0.2.0`)

## 1. Purpose

This document defines the unified external JSON schema for StructTutor modules (`src/content/modules/module-00.json` to `module-19.json`), the authoring rules for numeric and multiple-choice questions, and the contract for parametric question generators (`src/utils/questionGenerators.ts`).

All module JSON files are validated against this schema by `src/utils/schemaValidator.ts` during automated test runs (`npm test`).

## 2. Standing Authoring Rules

1. **Metric Only (Rule M)**: Every dimension, load, stress, section property, and soil parameter must use SI / metric engineering units (`mm`, `m`, `N`, `kN`, `MN`, `N/mm²`, `MPa`, `GPa`, `kPa`, `kN/m`, `kN·m`, `kN/m³`, `mm²`, `cm²`, `mm³`, `cm³`, `mm⁴`, `cm⁴`). Imperial units (`inch`, `ft`, `lb`, `psi`, `kip`) are strictly prohibited and rejected by the automated schema validator.
2. **British English & Punctuation**: Use British English spelling (`analyse`, `behaviour`, `centre`, `favourable`, `modelled`, `unfactored`). Do not use em dashes in any user-facing strings; use commas, colons, parentheses, or full stops instead.
3. **Self-Contained Prompts**: Every question must be completely self-contained so it can be drawn in any order during an assessment or spaced-review session. Never reference `"the same beam"`, `"previous question"`, `"above column"`, or an unstated `"Syllabus Example X.Y"`. State all geometry, support conditions, loads, and material properties explicitly in `prompt`.
4. **Honest Verification Status**:
   - Default `reviewStatus` to `"Draft"` for all authored questions.
   - Set `reviewStatus: "Verified"` **only** when the question's numerical answer is checked by an automated test against `src/utils/beamEngine.ts` or `legacy-python/` golden solvers, and include `solverVerificationId`.
5. **Unbiased Multiple-Choice Options**:
   - Provide 4 technically plausible options representing genuine structural engineering interpretations or misconceptions.
   - Balance option character lengths so the correct option is not systematically longer than distractors (across the bank, the correct option must be the longest in at most 35% of MCQs).
   - Runtime rendering shuffles option order deterministically per attempt seed via `shuffleMcqOptionsWithSeed`.

## 3. Unified `AssessmentQuestion` JSON Schema

Legacy duplicate fields (`questionType`, `requiredUnit`, `toleranceAbs`, `assumptionsAndLimitations`) are retired and rejected by the validator. Every question object must use the unified fields below:

```json
{
  "id": "MOD01-T2-Q1",
  "moduleNumber": 1,
  "topicId": "MOD01-T2",
  "learningObjective": "Calculate support reactions for a simply supported beam under a uniform distributed load",
  "type": "numeric",
  "prompt": "A 6.0 m simply supported beam carries a uniform distributed load of 10 kN/m over its full span. Calculate the vertical reaction at the left support R_A.",
  "assumptions": "Static equilibrium; self-weight included in the stated UDL; frictionless pin and roller supports.",
  "unit": "kN",
  "correctAnswer": 30,
  "tolerance": 0.1,
  "explanation": "Total vertical load W = w * L = 10 kN/m * 6.0 m = 60 kN. By symmetry (or taking moments about support B: R_A * 6.0 - 60 * 3.0 = 0), each support carries half the total load: R_A = R_B = 30 kN.",
  "citation": "StructTutor Syllabus Mod 1 (Support Reactions, Determinacy & Load Paths) & BS EN 1991-1-1",
  "hints": [
    "Identify the governing equilibrium equation and convert the distributed load w over span L into its resultant force W = w * L acting at midspan.",
    "Take moments about the right support B (sum of M_B = 0) and express your final numeric answer in kN."
  ],
  "caseFamilyId": "MOD01-T2-CF",
  "solverVerificationId": "SOLVER-MOD01-T2-Q1",
  "reviewStatus": "Verified",
  "reviewNotice": "Verified against independent StructTutor deterministic mechanics/code solver."
}
```

### Multiple-Choice Question Example

```json
{
  "id": "MOD08-T2-Q5",
  "moduleNumber": 8,
  "topicId": "MOD08-T2",
  "learningObjective": "Explain why root 3 appears in the steel plastic shear resistance formula",
  "type": "mcq",
  "prompt": "Where does the factor 1/sqrt(3) (approx 0.577) in the steel shear yield strength tau_y = f_y / sqrt(3) come from?",
  "assumptions": "Isotropic ductile structural steel obeying the distortion-energy yield criterion.",
  "options": [
    "Option 0 text...",
    "Option 1 text...",
    "Option 2 text...",
    "Option 3 text..."
  ],
  "correctOptionIndex": 2,
  "correctAnswer": 2,
  "explanation": "Under pure shear (sigma_x = sigma_y = 0, tau_xy = tau), the von Mises equivalent stress is sigma_eq = sqrt(3 * tau^2). Setting sigma_eq = f_y gives tau_y = f_y / sqrt(3).",
  "citation": "BS EN 1993-1-1:2005 (Eurocode 3: Design of Steel Structures, Cl. 5.5 & Cl. 6.2)",
  "hints": [
    "Consider multi-axial yield criteria for ductile metals under pure shear stress.",
    "Compare the distortion-energy (von Mises) yield criterion against uniaxial tensile yield f_y."
  ],
  "caseFamilyId": "MOD08-T2-CF",
  "reviewStatus": "Draft",
  "reviewNotice": "Draft study item: verify all clauses, partial factors, and calculations against controlled BSI/Eurocode standards and UK National Annexes before engineering use."
}
```
