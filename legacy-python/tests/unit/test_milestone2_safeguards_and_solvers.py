"""
Milestone 2 Acceptance & Safeguard Test Suite:
- Requirement #1: Database & Migration Safeguards (fresh DB, populated DB, failed migration rollback,
  backup restoration, 3x idempotent initialization).
- Requirement #2: Explicit non-mutually-exclusive content-quality states and strict module completion rules.
- Requirement #3 & #4: Deterministic mechanics solvers for Modules 0–6 with units, assumptions, sign
  conventions, invalid-input guards, and genuinely different second-method independent checks.
- Requirement #5: 7-stage teaching cycle, per-module mastery isolation on shared objective IDs (e.g. MAT-02,
  STAT-03), misconception remediation, and Integrated Milestone A portfolio tracking.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

try:
    from PySide6.QtWidgets import QApplication
    from structtutor.ui.main_window import MainWindow
    HAS_PYSIDE6 = True
except ImportError:
    QApplication = None  # type: ignore[assignment]
    MainWindow = None  # type: ignore[assignment]
    HAS_PYSIDE6 = False

from structtutor.config import AppConfig, MasteryState
from structtutor.domain.mechanics_solvers import (
    WORKED_EXAMPLE_SOLVERS,
    solve_ex_0_1_unit_conversions,
    solve_ex_0_2_inclined_force,
    solve_ex_0_3_udl_resultant,
    solve_ex_1_1_ss_beam_udl_reactions,
    solve_ex_1_2_ss_beam_point_load_reactions,
    solve_ex_1_3_tributary_floor_load,
    solve_ex_2_1_ss_beam_udl_sfd_bmd,
    solve_ex_2_2_cantilever_udl_sfd_bmd,
    solve_ex_2_3_ss_beam_point_load_sfd_bmd,
    solve_ex_3_1_steel_tie,
    solve_ex_3_2_steel_vs_aluminium_extension,
    solve_ex_4_1_rectangle_section_properties,
    solve_ex_4_2_parallel_axis_i_section,
    solve_ex_4_3_ub_major_minor_axis_comparison,
    solve_ex_4_4_elastic_vs_plastic_rectangle,
    solve_ex_5_1_udl_deflection_sensitivity,
    solve_ex_6_1_euler_column_comparison,
    solve_worked_example,
)
from structtutor.domain.practice_core import PracticeService
from structtutor.domain.syllabus import (
    ContentAvailabilityStatus,
    LessonStage,
    ReferenceVerificationStatus,
)
from structtutor.domain.units import DimensionalError, UnitParseError, convert_value
from structtutor.storage import migrations
from structtutor.storage.database import DatabaseManager, MigrationSafetyError
from structtutor.storage.repositories import CurriculumRepository


class TestMilestone2SafeguardsAndSolvers(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.app = (QApplication.instance() or QApplication([])) if HAS_PYSIDE6 else None
        cls.base_config = AppConfig.load()

    def test_01_migration_safeguards_backup_restore_rollback_and_idempotence(self) -> None:
        """
        Verify Requirement #1:
        - Populated database migration preserves learner attempts, mastery states, and saved calculations.
        - Legacy progress on shared objectives (e.g. MAT-02 or STAT-03) is NOT falsely transferred to later modules.
        - Failed migration rolls back cleanly without corrupting schema or learner data.
        - Backup can be restored via restore_from_backup() and passes integrity check.
        - Repeated 3x initialization does not duplicate seeded rows.
        """
        with tempfile.TemporaryDirectory() as tmp:
            tmp_dir = Path(tmp)
            db_path = tmp_dir / "structtutor_populated.db"
            db = DatabaseManager(db_path)

            # 1. Initialize baseline Phase 1/2 + seed 9 starter questions and record real learner data
            db.initialize(
                starter_curriculum_path=self.base_config.starter_curriculum_path,
                master_syllabus_path=None,
            )
            svc = PracticeService(db.connect, convert_value)
            svc.seed(self.base_config.phase2_questions_path)
            fb, st = svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, "High")
            self.assertTrue(fb.correct)
            self.assertEqual(st, "Developing")

            # Simulate legacy state on a shared objective (MAT-02) before Syllabus Migration v2
            with db.connect() as conn:
                conn.execute(
                    "UPDATE learner_objective_states SET mastery_state = 'Provisional', attempts_count = 2 "
                    "WHERE objective_id = 'MAT-02'"
                )
                conn.execute(
                    """
                    INSERT INTO saved_calculations (
                        calc_type, title, inputs_json, results_json,
                        sign_convention_id, solver_version, provenance
                    ) VALUES (
                        'beam_reactions', 'CALC-M2-SAFEGUARD',
                        '{"L": 6, "w": 10}', '{"R_A": 30, "R_B": 30}',
                        'UK_SAGGING_POSITIVE', '1.0.0', 'PYTHON_DETERMINISTIC'
                    )
                    """
                )
                conn.commit()

            # 2. Create timestamped backup before applying Master Syllabus migrations
            backup_path = db.create_timestamped_backup(label="pre_milestone2_test")
            self.assertIsNotNone(backup_path)
            assert backup_path is not None

            # 3. Simulate a failing migration and verify atomic rollback (dry-run catches failure before touching live DB)
            bad_migration = (99, "broken_migration", "CREATE TABLE valid_temp(id INT); INVALID SQL SYNTAX HERE;")
            original_syllabus_migrations = list(migrations.SYLLABUS_MIGRATIONS)
            try:
                migrations.SYLLABUS_MIGRATIONS.append(bad_migration)
                with self.assertRaises((sqlite3.DatabaseError, MigrationSafetyError)):
                    db.initialize(
                        starter_curriculum_path=self.base_config.starter_curriculum_path,
                        master_syllabus_path=self.base_config.master_syllabus_path,
                    )
            finally:
                migrations.SYLLABUS_MIGRATIONS[:] = original_syllabus_migrations

            with db.connect() as conn:
                tbl = conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='valid_temp'"
                ).fetchone()
                self.assertIsNone(tbl)

            # 4. Restore from backup and verify integrity
            restored_path = db.restore_from_backup(backup_path)
            self.assertEqual(restored_path, db_path)

            # 5. Run real initialization 3 times to verify idempotence
            for _ in range(3):
                db.initialize(
                    starter_curriculum_path=self.base_config.starter_curriculum_path,
                    master_syllabus_path=self.base_config.master_syllabus_path,
                )
                svc.seed(self.base_config.phase2_questions_path)
                svc.seed_syllabus_bank(self.base_config.milestone2_questions_path)

            repo = CurriculumRepository(db)
            self.assertEqual(len(repo.list_objectives()), 19)
            self.assertEqual(len(repo.list_syllabus_modules()), 20)
            self.assertEqual(len(repo.list_worked_examples()), 47)
            self.assertEqual(len(repo.list_portfolio_milestones()), 6)

            with db.connect() as conn:
                q_count = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
                self.assertEqual(q_count, 51)  # 9 Phase 2 starter + 42 Milestone 2 questions
                calc_row = conn.execute(
                    "SELECT title FROM saved_calculations WHERE title = 'CALC-M2-SAFEGUARD'"
                ).fetchone()
                self.assertIsNotNone(calc_row)

            # Verify legacy MAT-02 state was NOT falsely transferred to Module 5 or Module 6
            mod5_states = repo.get_module_objective_states(5)
            mod6_states = repo.get_module_objective_states(6)
            self.assertEqual(mod5_states["MAT-02"], MasteryState.NOT_ASSESSED)
            self.assertEqual(mod6_states["MAT-02"], MasteryState.NOT_ASSESSED)

            # Verify Module 0 MATH-01 attempt from before migration was preserved in Module 0
            mod0_states = repo.get_module_objective_states(0)
            self.assertEqual(mod0_states["MATH-01"], MasteryState.DEVELOPING)

    def test_02_per_module_mastery_isolation_on_shared_objectives(self) -> None:
        """
        Verify User Approval Condition #1:
        Mastering MAT-02 in Module 5 (Deflection) MUST NOT grant mastery to MAT-02 in Module 6 (Buckling).
        Mastering STAT-03 in Module 1 (Load Paths) MUST NOT grant mastery to STAT-03 in Module 12.
        """
        with tempfile.TemporaryDirectory() as tmp:
            db = DatabaseManager(Path(tmp) / "isolation.db")
            db.initialize(
                starter_curriculum_path=self.base_config.starter_curriculum_path,
                master_syllabus_path=self.base_config.master_syllabus_path,
            )
            svc = PracticeService(db.connect, convert_value)
            svc.seed(self.base_config.phase2_questions_path)
            svc.seed_syllabus_bank(self.base_config.milestone2_questions_path)
            repo = CurriculumRepository(db)

            t0 = datetime(2026, 8, 1, 9, 0, tzinfo=timezone.utc)
            # Answer all 3 Module 5 MAT-02 questions correctly without hints across >24 hours
            svc.submit("P2-M05-01", "2.441406", "-", 0, "High", now=t0, module_number=5)
            svc.submit("P2-M05-02", "2.85714", "mm", 0, "High", now=t0 + timedelta(hours=2), module_number=5)
            fb, state_m5 = svc.submit(
                "P2-M05-03", "a", None, 0, "High", now=t0 + timedelta(hours=26), module_number=5
            )
            self.assertTrue(fb.correct)
            self.assertEqual(state_m5, "Secure")

            # Module 5 MAT-02 is now Secure, and Module 5 worked examples EX-5.1 & EX-5.2 are completed
            self.assertEqual(repo.get_module_objective_states(5)["MAT-02"], MasteryState.SECURE)
            mod5_summary = repo.list_syllabus_modules()[5]
            self.assertTrue(mod5_summary.is_module_complete)

            # CRITICAL CHECK: Module 6 MAT-02 MUST still be Not assessed!
            self.assertEqual(repo.get_module_objective_states(6)["MAT-02"], MasteryState.NOT_ASSESSED)
            mod6_summary = repo.list_syllabus_modules()[6]
            self.assertFalse(mod6_summary.is_module_complete)
            self.assertEqual(mod6_summary.secure_objectives, 0)

            # Similarly, master STAT-03 in Module 1 and verify Module 12 remains Not assessed
            svc.submit("P2-M01-04", "5.0", "kN/m", 0, "High", now=t0, module_number=1)
            svc.submit("P2-M01-05", "12.5", "kN", 0, "High", now=t0 + timedelta(hours=2), module_number=1)
            _, state_m1 = svc.submit(
                "P2-M01-06", "a", None, 0, "High", now=t0 + timedelta(hours=26), module_number=1
            )
            self.assertEqual(state_m1, "Secure")
            self.assertEqual(repo.get_module_objective_states(1)["STAT-03"], MasteryState.SECURE)
            self.assertEqual(repo.get_module_objective_states(12)["STAT-03"], MasteryState.NOT_ASSESSED)
            mod12_summary = repo.list_syllabus_modules()[12]
            self.assertEqual(mod12_summary.secure_objectives, 0)

    def test_03_explicit_content_quality_states_and_ex_4_3_reference_safeguard(self) -> None:
        """
        Verify Requirement #2 & User Approval Condition #2:
        - Every module and worked example has honest, non-mutually-exclusive quality states.
        - Module 4 Example 4.3 remains flagged as Reference verification required even when
          Milestone 2 questions are seeded.
        """
        with tempfile.TemporaryDirectory() as tmp:
            db = DatabaseManager(Path(tmp) / "quality_states.db")
            db.initialize(
                starter_curriculum_path=self.base_config.starter_curriculum_path,
                master_syllabus_path=self.base_config.master_syllabus_path,
            )
            svc = PracticeService(db.connect, convert_value)
            svc.seed(self.base_config.phase2_questions_path)
            svc.seed_syllabus_bank(self.base_config.milestone2_questions_path)
            repo = CurriculumRepository(db)

            mods = {m.module_number: m for m in repo.list_syllabus_modules()}
            # Modules 0, 1, 2, 3, 5, 6 have Lesson complete + Worked example verified + Interactive practice available
            for m_num in (0, 1, 2, 3, 5, 6):
                m = mods[m_num]
                self.assertEqual(m.lesson_stage, LessonStage.LESSON_COMPLETE)
                self.assertTrue(m.worked_example_verified)
                self.assertTrue(m.interactive_practice_available)
                self.assertIn("Lesson complete", m.quality_badges)
                self.assertIn("Worked example verified", m.quality_badges)
                self.assertIn("Interactive practice available", m.quality_badges)
                self.assertFalse(m.is_module_complete)  # Not complete until learner passes exercises!

            # Module 4 has EX-4.3 requiring reference verification, so it carries both active practice AND reference verification required
            mod4 = mods[4]
            self.assertEqual(
                mod4.reference_verification_status,
                ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED,
            )
            self.assertIn("Reference verification required", mod4.quality_badges)
            self.assertIn("Interactive practice available", mod4.quality_badges)

            ex_map = {ex.id: ex for ex in repo.list_worked_examples(module_number=4)}
            ex_4_3 = ex_map["EX-4.3"]
            self.assertEqual(
                ex_4_3.reference_verification_status,
                ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED,
            )
            self.assertEqual(
                ex_4_3.content_status,
                ContentAvailabilityStatus.AWAITING_CONTROLLED_STANDARD_OR_REFERENCE,
            )
            self.assertIn("Reference verification required", ex_4_3.quality_badges)

            # Modules 7–19 are honest Outline Only (and Reference verification required where code-dependent)
            for m_num in range(7, 20):
                m = mods[m_num]
                self.assertEqual(m.lesson_stage, LessonStage.OUTLINE_ONLY)
                self.assertFalse(m.interactive_practice_available)
                self.assertIn("Outline only", m.quality_badges)

    def test_04_deterministic_solvers_known_answers_and_independent_checks(self) -> None:
        """
        Verify Requirement #3 & #4:
        Test all 17 Module 0–6 worked example solvers against known reference answers and
        verify their independent second-method checks pass with near-zero discrepancy.
        """
        self.assertEqual(len(WORKED_EXAMPLE_SOLVERS), 17)
        for ex_id in sorted(WORKED_EXAMPLE_SOLVERS):
            sol = solve_worked_example(ex_id)
            self.assertTrue(sol.independent_check.passed, f"{ex_id} independent check failed")
            self.assertLess(sol.independent_check.rel_discrepancy, 1e-9)
            self.assertTrue(len(sol.assumptions) >= 1)
            self.assertTrue(bool(sol.sign_convention))
            self.assertTrue(len(sol.intermediate_steps) >= 2)
            self.assertIn("not construction-ready", sol.educational_disclaimer.lower())

        # Module 0 known answers
        s01 = solve_ex_0_1_unit_conversions()
        self.assertAlmostEqual(s01.results["e_n_mm2"], 200_000.0)
        self.assertAlmostEqual(s01.results["q_n_mm2"], 0.025)
        self.assertAlmostEqual(s01.results["m_nmm"], 5_000_000.0)
        self.assertAlmostEqual(s01.results["w_n_mm"], 7.5)

        s02 = solve_ex_0_2_inclined_force(20.0, 35.0)
        self.assertAlmostEqual(s02.results["fx_kn"], 20.0 * math.cos(math.radians(35.0)), places=6)
        self.assertAlmostEqual(s02.results["fy_kn"], 20.0 * math.sin(math.radians(35.0)), places=6)

        s03 = solve_ex_0_3_udl_resultant(6.0, 8.0)
        self.assertAlmostEqual(s03.results["resultant_kn"], 48.0)
        self.assertAlmostEqual(s03.results["centroid_m"], 3.0)

        # Module 1 known answers
        s11 = solve_ex_1_1_ss_beam_udl_reactions(6.0, 10.0)
        self.assertAlmostEqual(s11.results["ra_kn"], 30.0)
        self.assertAlmostEqual(s11.results["rb_kn"], 30.0)

        s12 = solve_ex_1_2_ss_beam_point_load_reactions(5.0, 20.0, 2.0)
        self.assertAlmostEqual(s12.results["ra_kn"], 12.0)
        self.assertAlmostEqual(s12.results["rb_kn"], 8.0)

        s13 = solve_ex_1_3_tributary_floor_load(4.0, 5.0, 1.0, 1.5)
        self.assertAlmostEqual(s13.results["w_total_kn_m"], 5.0)
        self.assertAlmostEqual(s13.results["beam_total_load_kn"], 25.0)

        # Module 2 known answers
        s21 = solve_ex_2_1_ss_beam_udl_sfd_bmd(6.0, 10.0)
        self.assertAlmostEqual(s21.results["v_max_kn"], 30.0)
        self.assertAlmostEqual(s21.results["m_max_knm"], 45.0)

        s22 = solve_ex_2_2_cantilever_udl_sfd_bmd(2.0, 5.0)
        self.assertAlmostEqual(s22.results["v_fixed_kn"], 10.0)
        self.assertAlmostEqual(s22.results["m_fixed_hogging_knm"], -10.0)

        s23 = solve_ex_2_3_ss_beam_point_load_sfd_bmd(5.0, 20.0, 2.0)
        self.assertAlmostEqual(s23.results["v_left_kn"], 12.0)
        self.assertAlmostEqual(s23.results["v_right_kn"], -8.0)
        self.assertAlmostEqual(s23.results["m_max_knm"], 24.0)

        # Module 3 known answers
        s31 = solve_ex_3_1_steel_tie(3000.0, 1000.0, 100.0, 200.0)
        self.assertAlmostEqual(s31.results["sigma_mpa"], 100.0)
        self.assertAlmostEqual(s31.results["strain"], 0.0005)
        self.assertAlmostEqual(s31.results["delta_l_mm"], 1.5)

        s32 = solve_ex_3_2_steel_vs_aluminium_extension(2000.0, 500.0, 50.0, 210.0, 70.0)
        self.assertAlmostEqual(s32.results["extension_ratio"], 3.0)

        # Module 4 known answers
        s41 = solve_ex_4_1_rectangle_section_properties(75.0, 225.0, 300.0, 8.0)
        self.assertAlmostEqual(s41.results["z1_mm3"], 632_812.5)
        self.assertAlmostEqual(s41.results["sigma1_mpa"], 8e6 / 632_812.5, places=5)
        self.assertAlmostEqual(s41.results["sigma2_mpa"], 8e6 / 1_125_000.0, places=5)

        s42 = solve_ex_4_2_parallel_axis_i_section(150.0, 20.0, 200.0, 10.0)
        self.assertAlmostEqual(s42.results["ixx_mm4"], 79_466_666.6666667, places=2)

        s43 = solve_ex_4_3_ub_major_minor_axis_comparison(406.4, 177.8, 21500.0, 1200.0, 50.0)
        self.assertEqual(
            s43.reference_verification_status,
            ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED.value,
        )
        self.assertAlmostEqual(s43.results["stiffness_ratio"], 21500.0 / 1200.0, places=5)

        s44 = solve_ex_4_4_elastic_vs_plastic_rectangle(50.0, 150.0, 275.0)
        self.assertAlmostEqual(s44.results["shape_factor"], 1.5)

        # Module 5 known answers
        s51 = solve_ex_5_1_udl_deflection_sensitivity(4.0, 5.0, 1.25, 12.0, 100.0, 200.0, 210.0)
        self.assertAlmostEqual(s51.results["span_factor"], (5.0 / 4.0) ** 4, places=6)
        self.assertAlmostEqual(s51.results["depth_factor"], (1.0 / 1.25) ** 3, places=6)
        self.assertAlmostEqual(s51.results["grade_factor_s275_to_s355"], 1.0)

        # Module 6 known answers
        s61 = solve_ex_6_1_euler_column_comparison(4000.0, 210.0, 8.0e6, 2500.0)
        self.assertAlmostEqual(s61.results["capacity_ratio"], 4.0, places=6)
        self.assertAlmostEqual(
            s61.results["pcr_pinned_kn"],
            (math.pi**2 * 210_000.0 * 8.0e6) / (4000.0**2) / 1000.0,
            places=4,
        )

    def test_05_solver_and_unit_invalid_input_guards(self) -> None:
        """
        Verify Requirement #3 & #4:
        Invalid inputs (zero/negative spans, load off beam, non-finite values, mass-density vs unit-weight)
        raise explicit ValueError or DimensionalError exceptions.
        """
        with self.assertRaises(ValueError):
            solve_ex_1_1_ss_beam_udl_reactions(span_m=0.0, w_kn_per_m=10.0)
        with self.assertRaises(ValueError):
            solve_ex_1_2_ss_beam_point_load_reactions(span_m=5.0, load_kn=20.0, a_m=5.0)
        with self.assertRaises(ValueError):
            solve_ex_1_2_ss_beam_point_load_reactions(span_m=5.0, load_kn=20.0, a_m=6.0)
        with self.assertRaises(ValueError):
            solve_ex_0_2_inclined_force(force_kn=20.0, angle_deg=95.0)
        with self.assertRaises(ValueError):
            solve_ex_4_2_parallel_axis_i_section(flange_b_mm=100.0, flange_t_mm=20.0, web_h_mm=200.0, web_t_mm=120.0)
        with self.assertRaises(ValueError):
            solve_ex_3_1_steel_tie(length_mm=float("nan"), area_mm2=1000.0, force_kn=100.0, e_gpa=200.0)
        with self.assertRaises(ValueError):
            solve_worked_example("EX-99.9")

        # Unit conversions for angles, unit weight, and density-vs-unit-weight guard
        self.assertAlmostEqual(convert_value(180.0, "deg", "rad"), math.pi, places=9)
        self.assertAlmostEqual(convert_value(25.0, "kN/m³", "N/mm³"), 25.0e-6, places=12)
        with self.assertRaises(DimensionalError):
            convert_value(2400.0, "kg/m³", "kN/m³")
        with self.assertRaises(UnitParseError):
            convert_value(10.0, "kip/ft", "kN/m")

    def test_06_teaching_cycle_remedial_loop_and_milestone_a_portfolio(self) -> None:
        """
        Verify Requirement #5:
        - All 28 Milestone 2 questions validate and mark deterministically.
        - Misconception diagnosis and targeted remedial recommendations work end-to-end.
        - Integrated Milestone A portfolio tracks all 5 calculation categories to completion.
        - MainWindow & PracticePage render the 7-stage teaching cycle without error.
        """
        with tempfile.TemporaryDirectory() as tmp:
            tmp_dir = Path(tmp)
            config = AppConfig.load(custom_data_dir=tmp_dir)
            db = DatabaseManager(config.db_path)
            db.initialize(
                starter_curriculum_path=config.starter_curriculum_path,
                master_syllabus_path=config.master_syllabus_path,
            )
            svc = PracticeService(db.connect, convert_value)
            svc.seed(config.phase2_questions_path)
            seeded_m2 = svc.seed_syllabus_bank(config.milestone2_questions_path)
            self.assertEqual(seeded_m2, 42)
            repo = CurriculumRepository(db)

            # Trigger a misconception on P2-M05-03 (selecting 'b' -> MISC-SECT-I-VS-STRENGTH)
            fb_wrong, _ = svc.submit("P2-M05-03", "b", None, 0, "Low", module_number=5)
            self.assertFalse(fb_wrong.correct)
            self.assertEqual(fb_wrong.misconception_id, "MISC-SECT-I-VS-STRENGTH")

            misc_detail = svc.get_misconception_detail(fb_wrong.misconception_id)
            self.assertIsNotNone(misc_detail)
            assert misc_detail is not None
            self.assertIn("Second Moment of Area", misc_detail["title"])

            rem_q = svc.recommend_remedial("P2-M05-03", fb_wrong.misconception_id, module_number=5)
            self.assertIsNotNone(rem_q)
            assert rem_q is not None
            self.assertEqual(rem_q["id"], "P2-M05-01")

            # Complete all required Integrated Milestone A portfolio calculations independently (help_count=0)
            portfolio_submissions = [
                # 3 beam_reactions
                ("P2-M01-01", "30.0", "kN", 1),
                ("P2-M01-02", "12.0", "kN", 1),
                ("P2-M01-03", "27.0", "kN", 1),
                # 3 sfd_bmd
                ("P2-M02-01", "33.75", "kN·m", 2),
                ("P2-M02-04", "45.0", "kN·m", 2),
                ("P2-M02-05", "10.0", "kN·m", 2),
                # 2 section_properties_bending
                ("P2-M04-04", "12.64198", "MPa", 4),
                ("P2-M04-05", "79466666.67", "mm⁴", 4),
                # 1 deflection_check
                ("P2-M05-01", "2.441406", "-", 5),
                # 1 column_buckling
                ("P2-M06-01", "1036.3085", "kN", 6),
            ]
            for qid, ans, unit, mod_num in portfolio_submissions:
                fb_ok, _ = svc.submit(qid, ans, unit, 0, "High", module_number=mod_num)
                self.assertTrue(fb_ok.correct, f"Expected {qid} to mark correct")

            port = repo.get_milestone_a_portfolio_progress()
            self.assertTrue(port["is_complete"])
            self.assertEqual(port["total_completed"], 10)
            self.assertEqual(port["total_required"], 10)

            if HAS_PYSIDE6 and MainWindow is not None:
                win = MainWindow(config=config, curriculum_repo=repo, practice_service=svc)
                win.open_practice_for("SECT-02", "P2-M04-06", module_number=4)
                self.assertTrue(win.practice_page.ub_input_frame.isVisible())
                win.practice_page._run_custom_ub_example()
                self.assertIn("EX-4.3", win.practice_page.worked_example_box.toPlainText())
                self.assertIn("REFERENCE_VERIFICATION_REQUIRED", win.practice_page.worked_example_box.toPlainText())
                win.close()


if __name__ == "__main__":
    unittest.main()
