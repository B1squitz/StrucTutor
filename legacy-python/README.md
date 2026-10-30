# StructTutor Legacy Python Reference (Frozen)

This folder holds the frozen Python prototype (`legacy-python`). It is kept strictly as a numerical and curriculum reference for test generation and is not shipped as part of the StructTutor web application.

## Status

- **Product status:** Frozen reference only. Do not edit or ship this folder.
- **Active product:** The React and Vite web application in the repository root is the single active product.
- **Role of this folder:** The deterministic mechanics solvers (`src/structtutor/domain/mechanics_solvers.py`) and unit conversion utilities (`src/structtutor/domain/units.py`) serve as an independent numerical reference for generating golden test values.
- **Known limitations:** See `../docs/KNOWN_LIMITATIONS.md` for details on unreviewed broad error-catching blocks in the frozen Python code.
