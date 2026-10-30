"""Unit and integration tests for Milestone 1: Master Syllabus Alignment (27 July 2026)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import sqlite3
import tempfile
import unittest

from structtutor.config import AppConfig, MasteryState, ProvenanceType
from structtutor.domain.practice_core import PracticeService
from structtutor.domain.syllabus import (
    ContentAvailabilityStatus,
    SyllabusValidationError,
    load_master_syllabus,
    validate_master_syllabus,
)
from structtutor.domain.units import convert_value
from structtutor.storage.database import DatabaseManager, MigrationSafetyError
from structtutor.storage.migrations import apply_migrations
from structtutor.storage.repositories import CurriculumRepository


class Milestone1MasterSyllabusTests(unittest.TestCase):
    """Verifies curriculum completeness, objective mapping, migration backup/copy-safety, and progression."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.data_dir = Path(self.temp_dir.name)
        self.config = AppConfig.load(custom_data_dir=self.data_dir)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_all_20_modules_and_6_milestones_encoded_verbatim(self) -> None:
        """Verify all 20 modules (0-19), 6 milestones (A-F), study method, calc-note, and rhythm."""
        syllabus = load_master_syllabus(self.config.master_syllabus_path)
        self.assertEqual(syllabus.syllabus_title, "Comprehensive Structural Engineering Rebuild Syllabus")
        self.assertEqual(syllabus.syllabus_date_display, "27 July 2026")
        self.assertEqual(len(syllabus.modules), 20)
        self.assertEqual([m.module_number for m in syllabus.modules], list(range(20)))

        expected_titles = [
            "Module 0 — Engineering maths, units and physical quantities",
            "Module 1 — Statics, equilibrium and load paths",
            "Module 2 — Internal actions, shear force and bending moment",
            "Module 3 — Stress, strain, stiffness and material behaviour",
            "Module 4 — Section properties, bending theory and member shape",
            "Module 5 — Deflection, serviceability and vibration",
            "Module 6 — Failure modes, buckling, restraint and stability",
            "Module 7 — Basis of design, actions and Eurocode philosophy",
            "Module 8 — Basic steel design to EC3: laterally restrained beams",
            "Module 9 — Deeper steel design: columns, LTB, connections and frames",
            "Module 10 — Timber design to EC5",
            "Module 11 — Masonry, lintels and existing building alterations",
            "Module 12 — Soil mechanics and geotechnical fundamentals",
            "Module 13 — Foundations and retaining structures",
            "Module 14 — Reinforced concrete design to EC2",
            "Module 15 — Structural analysis beyond simple beams",
            "Module 16 — Software modelling and model validation",
            "Module 17 — Design detailing, drawings and construction interface",
            "Module 18 — Existing structures, surveys and uncertainty",
            "Module 19 — Professional practice, checking and business readiness",
        ]
        self.assertEqual([m.title for m in syllabus.modules], expected_titles)

        # Verify Year 1 pathway is Modules 0-8 and Modules 9-19 are advanced pathways
        for m in syllabus.modules[:9]:
            self.assertEqual(m.year_pathway, "Year 1")
        for m in syllabus.modules[9:15]:
            self.assertEqual(m.year_pathway, "Years 2–3")
        for m in syllabus.modules[15:]:
            self.assertEqual(m.year_pathway, "Years 3–4+")

        # Verify 5-step study method and 9-part calculation-note structure
        self.assertEqual(len(syllabus.five_step_study_method), 5)
        self.assertEqual(
            [s.title for s in syllabus.five_step_study_method],
            [
                "Explain it plainly",
                "Sketch it",
                "Calculate a simple case by hand",
                "Check it against a reliable source",
                "State assumptions and limits",
            ],
        )
        self.assertEqual(len(syllabus.calculation_note_structure), 9)
        self.assertEqual(len(syllabus.weekly_sessions), 3)
        self.assertEqual(syllabus.fourth_week_review.rule, "Do not start new content.")
        self.assertEqual(len(syllabus.fourth_week_review.tasks), 4)

        # Verify all 6 integrated portfolio milestones (A-F)
        self.assertEqual(len(syllabus.portfolio_milestones), 6)
        self.assertEqual(
            [ms.code for ms in syllabus.portfolio_milestones],
            ["Milestone A", "Milestone B", "Milestone C", "Milestone D", "Milestone E", "Milestone F"],
        )
        ms_a_counts = {r.category: r.required_count for r in syllabus.portfolio_milestones[0].required_items}
        self.assertEqual(
            ms_a_counts,
            {
                "equilibrium_reactions": 10,
                "sfd_bmd": 10,
                "bending_section": 5,
                "deflection": 5,
                "buckling_stability_sketches": 5,
            },
        )

    def test_pre_migration_backup_and_copy_verification_preserves_learner_progress(self) -> None:
        """
        Verify Requirement #2 & #4:
        1. Create a pre-Milestone-1 SQLite DB with Phase 1 + Phase 2 schema and real learner progress.
        2. Run DatabaseManager.initialize() to apply the Milestone 1 Master Syllabus migration.
        3. Confirm a timestamped backup was created before migration.
        4. Confirm all attempts, objective states, questions, and saved calculations are preserved intact.
        """
        db = DatabaseManager(self.config.db_path)
        with db.connect() as conn:
            apply_migrations(conn)
            db._seed_starter_curriculum(conn, self.config.starter_curriculum_path)
            conn.execute(
                "INSERT INTO saved_calculations (calc_type, title, inputs_json, results_json, sign_convention_id, solver_version, provenance) "
                "VALUES ('beam', 'Saved User Calc', '{}', '{}', 'UK_TENSION_FACE_STANDARD', '0.1', 'PYTHON_DETERMINISTIC');"
            )
            conn.commit()

        practice_svc = PracticeService(db.connect, convert_value)
        q_path = self.config.starter_curriculum_path.parent / "phase2_questions.json"
        practice_svc.seed(q_path)

        t0 = datetime(2026, 7, 27, 9, 0, tzinfo=timezone.utc)
        practice_svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, "High", now=t0)
        practice_svc.submit("P2-UNITS-02", "27", "MPa", 0, "High", now=t0 + timedelta(minutes=10))
        practice_svc.submit("P2-FBD-01", "c", None, 1, "Low", now=t0 + timedelta(minutes=20))

        # Capture pre-migration learner state
        with db.connect() as conn:
            before_attempts = conn.execute("SELECT COUNT(*) FROM attempt_evidence;").fetchone()[0]
            before_math01_state = conn.execute(
                "SELECT mastery_state, attempts_count, correct_count FROM learner_objective_states WHERE objective_id='MATH-01';"
            ).fetchone()
            before_stat01_state = conn.execute(
                "SELECT mastery_state, attempts_count, correct_count FROM learner_objective_states WHERE objective_id='STAT-01';"
            ).fetchone()
        self.assertEqual(before_attempts, 3)
        self.assertEqual(tuple(before_math01_state), ("Provisional", 2, 2))
        self.assertEqual(tuple(before_stat01_state), ("Emerging", 1, 0))

        # Now run DatabaseManager.initialize() which must back up, test on copy, and migrate
        db.initialize(
            starter_curriculum_path=self.config.starter_curriculum_path,
            master_syllabus_path=self.config.master_syllabus_path,
        )

        # Verify timestamped backup was created and is a valid SQLite database with the 3 attempts
        self.assertIsNotNone(db.last_backup_path)
        assert db.last_backup_path is not None
        self.assertTrue(db.last_backup_path.exists())
        with sqlite3.connect(db.last_backup_path) as b_conn:
            b_attempts = b_conn.execute("SELECT COUNT(*) FROM attempt_evidence;").fetchone()[0]
            self.assertEqual(b_attempts, 3)

        # Verify temporary copy file was cleaned up
        copy_files = list(self.data_dir.glob("*_migration_verify_copy*"))
        self.assertEqual(copy_files, [])

        # Verify live database preserved all attempts, mastery states, questions, and saved calculations
        with db.connect() as conn:
            after_attempts = conn.execute("SELECT COUNT(*) FROM attempt_evidence;").fetchone()[0]
            after_math01_state = conn.execute(
                "SELECT mastery_state, attempts_count, correct_count FROM learner_objective_states WHERE objective_id='MATH-01';"
            ).fetchone()
            after_stat01_state = conn.execute(
                "SELECT mastery_state, attempts_count, correct_count FROM learner_objective_states WHERE objective_id='STAT-01';"
            ).fetchone()
            saved_calcs = conn.execute("SELECT title FROM saved_calculations;").fetchall()
            mod_count = conn.execute("SELECT COUNT(*) FROM syllabus_modules;").fetchone()[0]
            ms_count = conn.execute("SELECT COUNT(*) FROM portfolio_milestones;").fetchone()[0]

        self.assertEqual(after_attempts, 3)
        self.assertEqual(tuple(after_math01_state), ("Provisional", 2, 2))
        self.assertEqual(tuple(after_stat01_state), ("Emerging", 1, 0))
        self.assertEqual([r[0] for r in saved_calcs], ["Saved User Calc"])
        self.assertEqual(mod_count, 20)
        self.assertEqual(ms_count, 6)

    def test_migration_safety_guard_detects_progress_tampering(self) -> None:
        """Verify _assert_progress_preserved raises MigrationSafetyError if any attempt or state is lost."""
        before = {
            "attempt_evidence": [(1, "P2-UNITS-01", "MATH-01", "calculation", 1, 1, 0, None, "High", "3000000 N·mm", "deterministic_numeric", "2026-07-27 09:00:00")],
            "learner_objective_states": [("MATH-01", "Provisional", 2, 2, '["calculation","transfer"]', "2026-07-27", "2026-08-03", None)],
            "questions": [],
            "sources": [],
            "saved_calculations": [],
        }
        after_missing_attempt = {
            "attempt_evidence": [],
            "learner_objective_states": before["learner_objective_states"],
            "questions": [],
            "sources": [],
            "saved_calculations": [],
        }
        with self.assertRaises(MigrationSafetyError):
            DatabaseManager._assert_progress_preserved(before, after_missing_attempt)

        after_reset_state = {
            "attempt_evidence": before["attempt_evidence"],
            "learner_objective_states": [("MATH-01", "Not assessed", 0, 0, "[]", None, None, None)],
            "questions": [],
            "sources": [],
            "saved_calculations": [],
        }
        with self.assertRaises(MigrationSafetyError):
            DatabaseManager._assert_progress_preserved(before, after_reset_state)

    def test_prerequisite_ordering_and_deadlock_free_recommendations(self) -> None:
        """
        Verify Requirement #3, #5, #8:
        1. All 20 modules (including Modules 9-19) are visible in the Learning Map from the beginning.
        2. Module 0 is the initial starting point.
        3. Advanced modules (9-19) are gated behind Year 1 prerequisites and never recommended prematurely.
        4. Missing teaching content is never marked as Secure/Complete and never deadlocks recommendations.
        """
        db = DatabaseManager(self.config.db_path)
        db.initialize(
            starter_curriculum_path=self.config.starter_curriculum_path,
            master_syllabus_path=self.config.master_syllabus_path,
        )
        practice_svc = PracticeService(db.connect, convert_value)
        practice_svc.seed(self.config.starter_curriculum_path.parent / "phase2_questions.json")

        repo = CurriculumRepository(db)

        # 1. All 20 modules (0-19) are visible from the beginning
        all_modules = repo.list_syllabus_modules()
        self.assertEqual(len(all_modules), 20)
        advanced_modules = [m for m in all_modules if m.module_number >= 9]
        self.assertEqual(len(advanced_modules), 11)
        for adv_mod in advanced_modules:
            self.assertFalse(adv_mod.prerequisites_satisfied)
            self.assertIn("Gated by", adv_mod.pathway_status_label)
            self.assertEqual(adv_mod.secure_objectives, 0)

        # 2. On fresh database, Module 0 (MATH-01) is the recommended starting point
        rec0 = repo.get_syllabus_recommendation()
        self.assertIsNotNone(rec0)
        assert rec0 is not None
        self.assertEqual(rec0.recommended_module.module_number, 0)
        self.assertEqual(rec0.recommended_objective.id, "MATH-01")
        self.assertEqual(rec0.interactive_practice_objective_id, "MATH-01")
        self.assertEqual(rec0.interactive_practice_question_id, "P2-UNITS-01")

        # 3. Advance Module 0 objectives (MATH-01, MATH-02, MATH-03) to Provisional:
        # Recommendation must advance to Module 1 (Statics, equilibrium and load paths), NOT Module 9+
        with db.connect() as conn:
            for oid in ("MATH-01", "MATH-02", "MATH-03"):
                conn.execute(
                    "UPDATE learner_objective_states SET mastery_state = ? WHERE objective_id = ?;",
                    (MasteryState.PROVISIONAL.value, oid),
                )
            conn.commit()

        rec1 = repo.get_syllabus_recommendation()
        assert rec1 is not None
        self.assertEqual(rec1.recommended_module.module_number, 1)
        self.assertEqual(rec1.recommended_objective.id, "STAT-01")
        self.assertEqual(rec1.interactive_practice_objective_id, "STAT-01")

        # 4. Now advance Module 1 objectives (STAT-01, STAT-02, STAT-03) to Provisional:
        # Module 2 has content_status = CURRICULUM_MAPPED_AWAITING_QUESTIONS (0 interactive questions yet).
        # Verify the recommendation engine does NOT deadlock and does NOT mark Module 2 complete!
        with db.connect() as conn:
            for oid in ("STAT-01", "STAT-02", "STAT-03"):
                conn.execute(
                    "UPDATE learner_objective_states SET mastery_state = ? WHERE objective_id = ?;",
                    (MasteryState.PROVISIONAL.value, oid),
                )
            conn.commit()

        rec2 = repo.get_syllabus_recommendation()
        assert rec2 is not None
        self.assertEqual(rec2.recommended_module.module_number, 2)
        self.assertEqual(
            rec2.recommended_module.content_status,
            ContentAvailabilityStatus.CURRICULUM_MAPPED_AWAITING_QUESTIONS,
        )
        self.assertEqual(rec2.recommended_objective.mastery_state, MasteryState.NOT_ASSESSED)
        # Interactive practice fallback remains available without deadlocking
        self.assertIsNotNone(rec2.interactive_practice_objective_id)
        self.assertIsNotNone(rec2.interactive_practice_question_id)

    def test_existing_19_objectives_preserved_and_mapped(self) -> None:
        """Verify all 19 existing objective IDs are preserved in SQLite and mapped to syllabus modules."""
        db = DatabaseManager(self.config.db_path)
        db.initialize(
            starter_curriculum_path=self.config.starter_curriculum_path,
            master_syllabus_path=self.config.master_syllabus_path,
        )
        repo = CurriculumRepository(db)
        objectives = repo.list_objectives()
        self.assertEqual(len(objectives), 19)

        obj_map = repo.get_objective_primary_module_map()
        self.assertEqual(set(obj_map.keys()), {o.id for o in objectives})
        self.assertEqual(obj_map["MATH-01"], 0)
        self.assertEqual(obj_map["STAT-01"], 1)
        self.assertEqual(obj_map["BEAM-01"], 2)
        self.assertEqual(obj_map["SECT-01"], 4)
        self.assertEqual(obj_map["CODE-01"], 7)
        self.assertEqual(obj_map["CODE-02"], 8)
        self.assertEqual(obj_map["TEMP-01"], 11)

    def test_honest_content_status_and_awaiting_verification_flags(self) -> None:
        """
        Verify Requirement #3, #5, #8:
        Distinguish complete curriculum metadata from actual available teaching content,
        and mark Eurocode/standard-dependent modules as awaiting verification.
        """
        db = DatabaseManager(self.config.db_path)
        db.initialize(
            starter_curriculum_path=self.config.starter_curriculum_path,
            master_syllabus_path=self.config.master_syllabus_path,
        )
        repo = CurriculumRepository(db)
        modules = {m.module_number: m for m in repo.list_syllabus_modules()}

        # Only Modules 0 and 1 have active interactive Phase 2 questions today
        for m_num in (0, 1):
            self.assertEqual(
                modules[m_num].content_status,
                ContentAvailabilityStatus.INTERACTIVE_QUESTIONS_AVAILABLE,
            )

        # Eurocode / controlled-standard dependent modules must be marked AWAITING_CONTROLLED_STANDARD_OR_REFERENCE
        for m_num in (7, 8, 9, 10, 11, 13, 14):
            self.assertEqual(
                modules[m_num].content_status,
                ContentAvailabilityStatus.AWAITING_CONTROLLED_STANDARD_OR_REFERENCE,
                f"Module {m_num} should be marked AWAITING_CONTROLLED_STANDARD_OR_REFERENCE",
            )

        # Mechanics & practice modules without interactive questions yet must be marked CURRICULUM_MAPPED_AWAITING_QUESTIONS
        for m_num in (2, 3, 4, 5, 6, 12, 15, 16, 17, 18, 19):
            self.assertEqual(
                modules[m_num].content_status,
                ContentAvailabilityStatus.CURRICULUM_MAPPED_AWAITING_QUESTIONS,
                f"Module {m_num} should be marked CURRICULUM_MAPPED_AWAITING_QUESTIONS",
            )


if __name__ == "__main__":
    unittest.main()

