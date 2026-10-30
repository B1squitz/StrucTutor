# Known Limitations

## 1. Frozen Python reference (`legacy-python`) broad error-catching blocks

The frozen Python application in `legacy-python/` contains five broad `except Exception` blocks that were not reviewed or narrowed before freezing the Python desktop codebase:

1. `legacy-python/src/structtutor/storage/migrations.py` (line 190): `except Exception:` during migration verification cleanup.
2. `legacy-python/src/structtutor/storage/migrations.py` (line 467): `except Exception:` during database rollback/cleanup handling.
3. `legacy-python/src/structtutor/ui/main_window.py` (line 1244): `except Exception as exc:` in the legacy Qt main window handler.
4. `legacy-python/src/structtutor/ui/practice_page.py` (line 431): `except Exception as exc:` in the legacy Qt practice page action handler.
5. `legacy-python/src/structtutor/ui/practice_page.py` (line 444): `except Exception as exc:` in the legacy Qt practice page remedial handler.

Because `legacy-python/` is frozen and not shipped with the web application, these handlers remain untouched. Only the pure deterministic domain solvers (`legacy-python/src/structtutor/domain/mechanics_solvers.py`) and unit conversion functions (`legacy-python/src/structtutor/domain/units.py`) are used as an offline numerical reference for test generation.

## 2. Features planned for later stages

- **PDF textbook import and full-text citation indexing:** Not built in Stage 1. Content in Stage 1 is loaded from structured JSON files.
- **Optional local AI tutor layer:** Not built in Stage 1. All grading, hints and worked solutions are deterministic.
