# StructTutor — Milestone A: Professional Dashboard & Design System

A local-first, modular PySide6 learning application. This checkpoint implements **Milestone A (Professional Dashboard and Design System)** on top of the verified Phase 1 Foundation and Phase 2 Practice vertical slice. It is educational software, not a certified structural design package.

## Windows 10 setup

Requirements: a writable project folder, Python 3.11 available via the Windows `py` launcher, and internet access for Python package installation.

Extract the project and open PowerShell in the `structtutor` folder containing `pyproject.toml`. Run:

```powershell
py -3.11 --version
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m structtutor
```

If Python 3.11 is unavailable, install it and repeat the version check. Existing batch launchers (`setup_windows.bat`, `run_windows.bat`) remain available; the explicit commands above give clearer error reporting.

Expected full suite: **50 tests**:
- **21 Phase 1 tests** (`tests/unit/test_units_and_quantities.py`, `test_database_and_curriculum.py`, `test_phase1_corrections.py`)
- **6 Milestone A Dashboard & Design System tests** (`tests/unit/test_milestone_a_dashboard.py`)
- **23 Phase 2 Practice Core tests** (`tests/phase2/test_practice_core.py`)

To run the Milestone A and Phase 2 tests with Python's built-in `unittest` runner:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests/phase2 -v
.\.venv\Scripts\python.exe -m unittest tests/unit/test_milestone_a_dashboard.py -v
```

## What Milestone A Adds

1. **Shared Visual Design System (`src/structtutor/ui/theme.py`)**:
   - Centralised colour palette (`COLORS`), typography scale (`TYPOGRAPHY`), spacing tokens (`SPACING`), navigation glyphs (`NAV_ICONS`), domain accent colours (`DOMAIN_ACCENT_COLORS`), and non-colour-only mastery state badge specifications (`MASTERY_BADGE_SPECS` pairing distinct geometric symbols `○`, `◔`, `◑`, `◕`, `●` with high-contrast badges).
   - Expanded Qt stylesheet (`DARK_STYLESHEET`) defining `HeroCard`, `Card`, `MetricCard`, `TopicCard`, `ActivityRow`, `PrimaryButton`, `SecondaryButton`, `NavButton`, and `CurriculumProgress`.
2. **Redesigned Modern Learning Platform Dashboard (`src/structtutor/ui/main_window.py`)**:
   - **Welcoming Header & Hero Banner**: Adapts dynamically between first-run onboarding ("Start First Lesson") and returning sessions ("Continue Learning"), wired directly to the recommended practice question in `PracticePage`.
   - **Curriculum Progress & Mastery Distribution**: Real SQLite-backed progress bar (`assessed_objectives / 19`), 5-stage mastery badge breakdown, and 4 key platform metrics.
   - **Recommended Next Lesson Card**: Displays the adaptive engine's suggested objective, mastery state badge, specific practice question title, observable competency, and recommendation rationale, with direct buttons to start the question or inspect the domain in the Learning Map.
   - **Recent Learning Activity Feed**: Displays the latest recorded attempts from `attempt_evidence` joined with question and objective titles, including correctness, hints used, diagnosed misconception IDs, and one-click **"Open"** buttons to retry any question.
   - **Curriculum Domain & Topic Cards (Domains A–H)**: 8 domain cards showing real objective counts, assessed/secure progress, active practice item counts, and working navigation buttons (`Practice` for Domains A & B; `Inspect Domain in Map` for all Domains A–H).
3. **Repository & Deep-Linking Enhancements (`src/structtutor/storage/repositories.py` & `src/structtutor/ui/practice_page.py`)**:
   - Added `CurriculumRepository.list_domain_summaries()` and `CurriculumRepository.list_recent_activity(limit=5)` and extended `get_dashboard_summary()` while preserving all Phase 1 keys.
   - Added `PracticePage.open_objective_question(objective_id, question_id)` and `MainWindow.open_practice_for(...)` / `MainWindow.open_map_for_domain(...)` so every dashboard control triggers real navigation.
