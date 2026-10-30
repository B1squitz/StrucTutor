# Changelog

## Version 0.1.0 - Checkpoint 1: Consolidate and Clean Up (2026-10-29)

### Added
- `README.md`: Added project documentation describing StructTutor, `run_windows.bat`, `npm run dev`, `npm run build`, `npm test`, and features planned for later stages (PDF import and optional local AI tutor).
- `docs/KNOWN_LIMITATIONS.md`: Recorded the five broad `except Exception` blocks in `legacy-python` and unbuilt planned features.
- `CHANGELOG.md`: Added project changelog recording all additions, modifications, moves and deletions.
- `dist/StructTutor.html` build pipeline in `vite.config.ts`: Added `singleFileHtmlPlugin` so `npm run build` produces a single self-contained HTML file (`dist/StructTutor.html`).

### Changed
- `src/components/QuestionDiagram.tsx` and `src/utils/tutorEngine.ts`: Ported support ground-bearing baseline ticks, the simply supported point-load beam schematic with span dimensions (`simply-supported-point-load`), and the smooth vertical wall roller schematic (`wall-roller-support`) from `StructuralDiagram.tsx` before deleting `StructuralDiagram.tsx`. Added `APP_VERSION` (`0.1.0`) and `APP_BUILD_DATE` (`2026-10-29`).
- `src/App.tsx`: Added version and build date display (`v0.1.0`, `2026-10-29`) in the sidebar summary and main workspace footer.
- `package.json`: Renamed package from `react-example` to `structtutor`, set version to `0.1.0`, added `npm test` script, and removed unused dependencies (`@google/genai`, `express`, `dotenv`, `motion`, `@types/express`).
- `index.html` and `metadata.json`: Replaced outdated "StructTutor Phase 2 Audit & Practice Workbench" title, description, OpenGraph tags, and Gemini capability entry with accurate StructTutor metadata.
- `run_windows.bat`: Replaced with a single launcher script that opens `dist\StructTutor.html` (building it first if needed).
- `legacy-python/README.md`: Replaced with a concise note stating that `legacy-python` is a frozen numerical reference and is not shipped, removing hard-coded test counts.

### Moved
- `structtutor/` -> `legacy-python/`: Moved the Python desktop prototype unchanged into `legacy-python/` as a frozen numerical reference.
- `public/assets/aistudio/StructTutor_Gemini4Argon_Master_Build_Prompt_a6d2233d.md` -> `docs/StructTutor_Gemini4Argon_Master_Build_Prompt_a6d2233d.md`.
- `public/assets/aistudio/Claude_Feedback_6880263b.md` -> `docs/Claude_Feedback_6880263b.md`.
- `public/assets/aistudio/image_*.png` (7 screenshots) -> `docs/screenshots/image_*.png`.

### Removed
- `src/utils/auditData.ts`: Unused data file from the earlier Phase 2 audit workbench page.
- `src/components/StructuralDiagram.tsx`: Unused diagram component from the earlier Phase 2 workbench (useful diagram modes ported to `src/components/QuestionDiagram.tsx`).
- `src/utils/practiceEngine.ts`: Unused legacy practice engine (only referenced by the unused `StructuralDiagram.tsx`).
- `src/utils/practiceEngine.test.ts`: Unit tests for the deleted unused `practiceEngine.ts`.
- `StructTutor_App.html`, `public/StructTutor_App.html`, `structtutor/StructTutor_App.html`: Three committed duplicate copies of the 673 KB generated HTML bundle, replaced by `npm run build` generating `dist/StructTutor.html`.
- `launch_app.vbs`, `structtutor/launch_app.vbs`, `structtutor/run_windows.bat`, `structtutor/run_legacy_python_desktop.bat`, `legacy-python/setup_windows.bat`: Duplicate and conflicting launcher scripts, replaced by the single root `run_windows.bat`.
- `.env.example`: Leftover Google AI Studio and Gemini API key template not used by StructTutor.
- `public/assets/aistudio/StructTutor_Milestone1_Master_Syllabus_Aligned.zip`, `StructTutor_Milestone2_Core_Mechanics.zip`, `StructTutor_MilestoneA_Dashboard.zip`, `StructTutor_Phase2_Practice_f5c8234b.zip`, `StructTutor_Syllabus_Milestone1.zip`: Five nested historical zip archives cluttering the project.
- `public/assets/aistudio/Paste_October_29__2026_-_3_33PM_9cc3e4cb`: Extensionless duplicate paste of the syllabus text (the structured syllabus is preserved in `legacy-python/src/structtutor/content/master_syllabus_2026.json`).
