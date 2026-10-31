# Changelog

All notable changes to StructTutor are documented in this file.

## [0.2.0] - 2026-10-30

### Added
- **Externalized Schema-Validated Content Architecture (`B3, B9, N2, N12`)**:
  - Migrated all 20 syllabus modules and 710 assessment questions into externalized JSON files under `src/content/modules/module-00.json` through `src/content/modules/module-19.json`.
  - Added `src/utils/schemaValidator.ts` and `docs/CONTENT_TEMPLATE.md` enforcing unified `AssessmentQuestion` fields (`type`, `unit`, `tolerance`, `assumptions`, `hints`, `citation`, `caseFamilyId`, `solverVerificationId`, `reviewStatus`) with zero legacy duplicate keys.
- **Deterministic 1D Beam & Mechanics Engine (`B6, N8, C5`)**:
  - Added `src/utils/beamEngine.ts` implementing a general 1D determinate beam solver (`solveDeterminateBeam`), Simpson's 1/3 numerical integration check (`simpsonIntegrate`), 3-significant-figure engineering formatter (`formatEngineeringNumber`), and all 17 worked-example golden solvers (`EX-0.1` to `EX-6.1`) verified against `legacy-python/src/structtutor/domain/mechanics_solvers.py`.
- **Safe Persistence, Non-Destructive Migration & JSON/IndexedDB Backup (`B1, C8, N7`)**:
  - Added `migrateCourseProgressState`, `exportCourseProgressJson`, `importCourseProgressJson`, and IndexedDB synchronization in `src/utils/assessmentEngine.ts`.
  - Added `VerificationSelfTestDrawer` (`Backup & Review Queue` in the sidebar) for exporting/restoring JSON progress backups, auditing the 710-item Question Review Queue, and running the 17 golden solver checks.
- **Section 5 Capabilities (`src/utils/questionGenerators.ts`, `src/utils/localRagEngine.ts`)**:
  - Added seeded parametric question generators (`generateParametricQuestionVariants`).
  - Added multi-step Eurocode design scenarios (`EUROCODE_DESIGN_SCENARIOS`, `evaluateEurocodeDesignScenario`) supporting non-unique valid UKB sections.
  - Added adaptive pace and spaced-repetition study planner (`computeAdaptiveStudyPlan`).
  - Added offline citation-grounded reference & textbook search engine (`queryGroundedReferenceLibrary`).
- **Bundled Offline Typography (`A12`)**:
  - Bundled `IBM Plex Mono`, `Outfit`, and `Plus Jakarta Sans` `.woff2` fonts in `public/fonts/` and `src/fonts.css` with zero external requests to `fonts.googleapis.com`.

### Changed
- **MCQ Fairness & Distractor Parity (`N1`)**:
  - Added seeded runtime option shuffling (`shuffleMcqOptionsWithSeed`) and rebalanced all 320 MCQs so the correct option is longest in only 29.7% (`95/320`, well below the 35% ceiling) and stored `correctOptionIndex` is evenly distributed across `0, 1, 2, 3`.
- **Self-Contained & Metric-Pure Prompts (`N10, N12`)**:
  - Rewrote all 88 cross-question dependent prompts (`"the same beam"`, `"previous question"`, `"Syllabus Example"` without inline values) to be 100% self-contained.
  - Removed imperial references in `MOD08-T2-Q5` and `MOD11-E12`.
- **Unit-Aware Grader & Significant Figure Hygiene (`N4, A8, N9`)**:
  - Added equivalent SI unit conversion and power-of-ten (`10³` / `10⁶`) diagnostic feedback to `gradeAssessmentQuestion`.
  - Replaced `666,666.7 mm³` false precision with `6.67 × 10⁵ mm³ (667 cm³)`.
  - Fixed `<MathFraction>` in `src/App.tsx` so `rhsNote` renders as a helper caption outside the equation block (`N9`).
- **Build & Dependency Hygiene (`N11, C1`)**:
  - Removed conflicting `"esbuild": "^0.25.0"` pin from `package.json` and generated `package-lock.json`.

### Removed (Replaced by Externalized JSON Content Files)
- `src/data/modules0to3.ts` (replaced by `src/content/modules/module-00.json` .. `module-03.json`).
- `src/data/modules4to7.ts` (replaced by `src/content/modules/module-04.json` .. `module-07.json`).
- `src/data/modules8to11.ts` (replaced by `src/content/modules/module-08.json` .. `module-11.json`).
- `src/data/modules12to15.ts` (replaced by `src/content/modules/module-12.json` .. `module-15.json`).
- `src/data/modules16to19.ts` (replaced by `src/content/modules/module-16.json` .. `module-19.json`).
