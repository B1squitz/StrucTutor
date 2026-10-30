# StructTutor: Personal Structural Engineering Tutor

StructTutor is a personal, local-first structural engineering tutor built for a practising UK engineer. It follows the 20-module *Comprehensive Structural Engineering Rebuild Syllabus* (Modules 0 to 19) using metric SI units (`mm`, `m`, `N`, `kN`, `kN·m`, `N/mm²` / `MPa`, `GPa`, `cm³` / `mm³`, `cm⁴` / `mm⁴`) throughout.

It is an educational learning tool and not a certified structural design or checking package. Always verify calculations against current standards and checked references.

## Quick start on Windows

Double-click `run_windows.bat` in the project root folder.

- If `dist\StructTutor.html` has already been built, `run_windows.bat` opens `dist\StructTutor.html` directly in your default web browser.
- If `dist\StructTutor.html` does not exist yet, `run_windows.bat` installs dependencies (if needed), runs `npm run build` to produce `dist\StructTutor.html`, and opens it in your browser.

## Development, building and testing

Requirements: Node.js (version 20 or newer recommended) and `npm`.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server (port 3000):**
   ```bash
   npm run dev
   ```
3. **Build the standalone single-file HTML bundle (`dist/StructTutor.html`):**
   ```bash
   npm run build
   ```
4. **Run the automated unit test suite:**
   ```bash
   npm test
   ```
5. **Run TypeScript type-checking:**
   ```bash
   npm run lint
   ```

## Repository structure

- `src/`: Active React and TypeScript web application (`App.tsx`, `components/`, `utils/`).
- `dist/StructTutor.html`: Single standalone built HTML file produced by `npm run build`.
- `docs/`: Project documentation, known limitations (`docs/KNOWN_LIMITATIONS.md`), review report, build specification and reference screenshots (`docs/screenshots/`).
- `legacy-python/`: Frozen Python reference implementation (`structtutor`). It is not shipped and is kept strictly as a numerical reference for test verification.

## Features planned but not built in this stage

- **PDF source library import and page-level search:** Planned for a later stage and not built in Stage 1.
- **Optional local AI tutor (Ollama integration):** Planned for a later stage and not built in Stage 1.
