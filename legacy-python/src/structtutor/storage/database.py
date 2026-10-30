"""SQLite connection manager, pre-migration backup & copy-verification, and syllabus seeding."""

from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import sqlite3
from typing import Dict, List, Optional, Set, Tuple

from structtutor.config import MasteryState, ProvenanceType
from structtutor.domain.curriculum import (
    LearningObjective,
    MisconceptionDef,
    validate_curriculum_dag,
)
from structtutor.domain.syllabus import load_master_syllabus
from structtutor.storage.migrations import (
    apply_migrations,
    apply_syllabus_migrations,
    has_pending_migrations,
)


class MigrationSafetyError(RuntimeError):
    """Raised if pre-migration verification on a database copy detects data loss or corruption."""


class DatabaseManager:
    """Manages local SQLite connections, timestamped backups, copy-tested migrations, and seeding."""

    def __init__(self, db_path: Path) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.fts5_available: bool = False
        self.last_backup_path: Optional[Path] = None

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

    def create_timestamped_backup(self, label: str = "pre_migration") -> Optional[Path]:
        """
        Create a timestamped backup of the existing SQLite database in the backups directory
        using SQLite's online backup API. Returns the backup path, or None if the DB does not exist yet.
        """
        if not self.db_path.exists() or self.db_path.stat().st_size == 0:
            return None

        backup_dir = self.db_path.parent / "backups"
        backup_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
        backup_path = backup_dir / f"{self.db_path.stem}_{label}_{stamp}{self.db_path.suffix}"

        with sqlite3.connect(self.db_path) as src_conn:
            with sqlite3.connect(backup_path) as dst_conn:
                src_conn.backup(dst_conn)

        self.last_backup_path = backup_path
        return backup_path

    def restore_from_backup(self, backup_path: Path) -> None:
        """
        Restore the live SQLite database from a verified backup file using SQLite's online backup API.
        Raises MigrationSafetyError if the backup file is missing, empty, or fails integrity check.
        """
        b_path = Path(backup_path)
        if not b_path.exists() or b_path.stat().st_size == 0:
            raise MigrationSafetyError(f"Backup file does not exist or is empty: '{b_path}'.")

        try:
            with sqlite3.connect(b_path) as src_conn:
                integrity = src_conn.execute("PRAGMA integrity_check;").fetchone()
                if not integrity or str(integrity[0]).lower() != "ok":
                    raise MigrationSafetyError(
                        f"Backup file failed SQLite integrity check: {integrity!r}"
                    )
                self.db_path.parent.mkdir(parents=True, exist_ok=True)
                with sqlite3.connect(self.db_path) as dst_conn:
                    src_conn.backup(dst_conn)
            return self.db_path
        except sqlite3.DatabaseError as exc:
            raise MigrationSafetyError(f"Cannot restore invalid SQLite backup '{b_path}': {exc}") from exc

    @staticmethod
    def _snapshot_learner_progress(conn: sqlite3.Connection) -> Dict[str, List[Tuple]]:
        """Capture existing learner progress rows for pre/post migration verification."""
        tables_and_queries = {
            "attempt_evidence": (
                "SELECT id, question_id, objective_id, task_type, difficulty, is_correct, "
                "hints_used, misconception_id, confidence_rating, user_answer, marking_method, attempted_at "
                "FROM attempt_evidence ORDER BY id;"
            ),
            "learner_objective_states": (
                "SELECT objective_id, mastery_state, attempts_count, correct_count, "
                "distinct_task_types_passed, last_attempt_at, next_review_due_at, notes "
                "FROM learner_objective_states ORDER BY objective_id;"
            ),
            "questions": (
                "SELECT id, objective_id, title, task_type, difficulty, provenance, verification_status, version "
                "FROM questions ORDER BY id;"
            ),
            "sources": "SELECT id, title, file_path FROM sources ORDER BY id;",
            "saved_calculations": "SELECT id, calc_type, title FROM saved_calculations ORDER BY id;",
        }
        existing_tables = {
            row[0]
            for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        }
        snapshot: Dict[str, List[Tuple]] = {}
        for tbl, query in tables_and_queries.items():
            if tbl in existing_tables:
                snapshot[tbl] = [tuple(r) for r in conn.execute(query).fetchall()]
            else:
                snapshot[tbl] = []
        return snapshot

    @staticmethod
    def _assert_progress_preserved(
        before: Dict[str, List[Tuple]],
        after: Dict[str, List[Tuple]],
    ) -> None:
        """Verify that every pre-existing learner record is preserved after migration and seeding."""
        # Exact row preservation for attempts, questions, sources, and saved calculations
        for strict_table in ("attempt_evidence", "questions", "sources", "saved_calculations"):
            before_rows = before.get(strict_table, [])
            after_rows = after.get(strict_table, [])
            if len(after_rows) < len(before_rows):
                raise MigrationSafetyError(
                    f"Migration lost rows in '{strict_table}': had {len(before_rows)}, now {len(after_rows)}."
                )
            after_set = set(after_rows)
            for row in before_rows:
                if row not in after_set:
                    raise MigrationSafetyError(
                        f"Migration altered or deleted existing record in '{strict_table}': {row!r}"
                    )

        # For learner_objective_states, new objectives may be inserted, but all pre-existing
        # objective states must remain completely unchanged.
        before_states = {row[0]: row for row in before.get("learner_objective_states", [])}
        after_states = {row[0]: row for row in after.get("learner_objective_states", [])}
        for obj_id, before_row in before_states.items():
            if obj_id not in after_states:
                raise MigrationSafetyError(
                    f"Migration deleted learner_objective_states row for '{obj_id}'."
                )
            if after_states[obj_id] != before_row:
                raise MigrationSafetyError(
                    f"Migration modified existing learner_objective_states for '{obj_id}': "
                    f"before={before_row!r}, after={after_states[obj_id]!r}"
                )

    def _verify_migration_on_copy(
        self,
        starter_curriculum_path: Path | None,
        master_syllabus_path: Path | None,
    ) -> None:
        """
        Test pending migrations and seeding against a temporary copy of the existing database first,
        and verify that all pre-existing attempts, objective states, and user records remain intact.
        """
        if not self.db_path.exists() or self.db_path.stat().st_size == 0:
            return

        temp_copy_path = self.db_path.parent / f"{self.db_path.stem}_migration_verify_copy{self.db_path.suffix}"
        try:
            with sqlite3.connect(self.db_path) as src_conn:
                before_snapshot = self._snapshot_learner_progress(src_conn)
                with sqlite3.connect(temp_copy_path) as copy_conn:
                    src_conn.backup(copy_conn)

            with sqlite3.connect(temp_copy_path) as test_conn:
                test_conn.row_factory = sqlite3.Row
                test_conn.execute("PRAGMA foreign_keys = ON;")
                apply_migrations(test_conn)
                apply_syllabus_migrations(test_conn)
                if starter_curriculum_path and starter_curriculum_path.exists():
                    self._seed_starter_curriculum(test_conn, starter_curriculum_path)
                if master_syllabus_path and master_syllabus_path.exists():
                    self._seed_master_syllabus(test_conn, master_syllabus_path)
                after_snapshot = self._snapshot_learner_progress(test_conn)

            self._assert_progress_preserved(before_snapshot, after_snapshot)
        finally:
            for suffix in ("", "-wal", "-shm"):
                candidate = Path(str(temp_copy_path) + suffix)
                if candidate.exists():
                    try:
                        candidate.unlink()
                    except OSError:
                        pass

    def initialize(
        self,
        starter_curriculum_path: Path | None = None,
        master_syllabus_path: Path | None = None,
    ) -> None:
        """
        Safely back up existing database if migrations are pending, verify migrations on a copy first,
        apply base and syllabus migrations, and idempotently seed starter curriculum + Master Syllabus.
        """
        if master_syllabus_path is None and starter_curriculum_path is not None:
            candidate = starter_curriculum_path.parent / "master_syllabus_2026.json"
            if candidate.exists():
                master_syllabus_path = candidate

        db_existed = self.db_path.exists() and self.db_path.stat().st_size > 0
        if db_existed:
            with self.connect() as check_conn:
                needs_migration = has_pending_migrations(check_conn)
            if needs_migration:
                self.create_timestamped_backup(label="pre_migration")
                self._verify_migration_on_copy(starter_curriculum_path, master_syllabus_path)

        with self.connect() as conn:
            before_live = self._snapshot_learner_progress(conn) if db_existed else None
            self.fts5_available = apply_migrations(conn)
            apply_syllabus_migrations(conn)
            if starter_curriculum_path and starter_curriculum_path.exists():
                self._seed_starter_curriculum(conn, starter_curriculum_path)
            if master_syllabus_path and master_syllabus_path.exists():
                self._seed_master_syllabus(conn, master_syllabus_path)
            if before_live is not None:
                after_live = self._snapshot_learner_progress(conn)
                self._assert_progress_preserved(before_live, after_live)

    def _seed_starter_curriculum(self, conn: sqlite3.Connection, json_path: Path) -> None:
        raw = json.loads(json_path.read_text(encoding="utf-8"))
        default_prov = ProvenanceType(
            raw.get("provenance", ProvenanceType.STARTER_CURRICULUM_UNRECONCILED.value)
        )

        # Parse and validate DAG before touching the database
        objectives: List[LearningObjective] = []
        for item in raw.get("objectives", []):
            objectives.append(
                LearningObjective(
                    id=item["id"],
                    domain_code=item["domain_code"],
                    domain_title=item["domain_title"],
                    title=item["title"],
                    observable_competency=item["observable_competency"],
                    why_it_matters=item["why_it_matters"],
                    prerequisite_ids=list(item.get("prerequisite_ids", [])),
                    target_balance=item.get("target_balance", "50% Conceptual / 50% Calculation"),
                    provenance=default_prov,
                )
            )
        validate_curriculum_dag(objectives)

        # Insert misconceptions idempotently
        for misc in raw.get("misconceptions", []):
            m = MisconceptionDef(
                id=misc["id"],
                category=misc["category"],
                title=misc["title"],
                description=misc["description"],
                remediation_strategy=misc["remediation_strategy"],
            )
            conn.execute(
                """
                INSERT OR IGNORE INTO misconceptions (id, category, title, description, remediation_strategy)
                VALUES (?, ?, ?, ?, ?);
                """,
                (m.id, m.category, m.title, m.description, m.remediation_strategy),
            )

        # Insert objectives and initial learner states without overwriting existing progress
        for obj in objectives:
            conn.execute(
                """
                INSERT OR IGNORE INTO curriculum_objectives (
                    id, domain_code, domain_title, title, observable_competency,
                    why_it_matters, target_balance, provenance
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    obj.id,
                    obj.domain_code,
                    obj.domain_title,
                    obj.title,
                    obj.observable_competency,
                    obj.why_it_matters,
                    obj.target_balance,
                    obj.provenance.value,
                ),
            )
            conn.execute(
                """
                INSERT OR IGNORE INTO learner_objective_states (objective_id, mastery_state)
                VALUES (?, ?);
                """,
                (obj.id, MasteryState.NOT_ASSESSED.value),
            )

        for obj in objectives:
            for prereq_id in obj.prerequisite_ids:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO objective_prerequisites (objective_id, prerequisite_id)
                    VALUES (?, ?);
                    """,
                    (obj.id, prereq_id),
                )

        conn.commit()

    def _seed_master_syllabus(self, conn: sqlite3.Connection, json_path: Path) -> None:
        """Validate and idempotently seed the 27 July 2026 Master Syllabus without overwriting user data."""
        known_objectives: Set[str] = {
            str(r[0]) for r in conn.execute("SELECT id FROM curriculum_objectives;").fetchall()
        }
        syllabus = load_master_syllabus(
            json_path,
            known_objective_ids=known_objectives if known_objectives else None,
        )

        # 1. Store syllabus-level framework metadata
        metadata_entries = {
            "syllabus_title": syllabus.syllabus_title,
            "syllabus_date": syllabus.syllabus_date,
            "syllabus_date_display": syllabus.syllabus_date_display,
            "purpose_and_intended_use": syllabus.purpose_and_intended_use,
            "professional_safeguard_notice": syllabus.professional_safeguard_notice,
            "study_rate": syllabus.study_rate,
            "year_one_outcome_statement": syllabus.year_one_outcome_statement,
            "five_step_study_method": [
                {
                    "step_number": s.step_number,
                    "id": s.id,
                    "title": s.title,
                    "instruction": s.instruction,
                }
                for s in syllabus.five_step_study_method
            ],
            "calculation_note_structure": [
                {
                    "section_number": c.section_number,
                    "key": c.key,
                    "title": c.title,
                    "prompt": c.prompt,
                }
                for c in syllabus.calculation_note_structure
            ],
            "weekly_sessions": [
                {
                    "session_number": w.session_number,
                    "title": w.title,
                    "duration": w.duration,
                    "tasks": list(w.tasks),
                }
                for w in syllabus.weekly_sessions
            ],
            "fourth_week_review": {
                "frequency": syllabus.fourth_week_review.frequency,
                "rule": syllabus.fourth_week_review.rule,
                "tasks": list(syllabus.fourth_week_review.tasks),
            },
            "reference_library": syllabus.reference_library,
            "first_12_month_sequence": list(syllabus.first_12_month_sequence),
        }
        for key, value in metadata_entries.items():
            conn.execute(
                """
                INSERT INTO syllabus_metadata (key, value_json, updated_at)
                VALUES (?, ?, datetime('now'))
                ON CONFLICT(key) DO UPDATE SET
                    value_json = excluded.value_json,
                    updated_at = datetime('now');
                """,
                (key, json.dumps(value, ensure_ascii=False)),
            )

        # 2. Seed all 20 syllabus modules (0–19), explicit quality flags, and objective mappings
        primary_assigned: Set[str] = set()
        for mod in syllabus.modules:
            conn.execute(
                """
                INSERT INTO syllabus_modules (
                    module_number, code, title, short_title, suggested_duration,
                    year_pathway, year1_months, why_it_matters,
                    prerequisite_modules_json, mapped_objectives_json,
                    learn_topics_json, resources_json, gate_requirements_json,
                    content_status, verification_note,
                    lesson_stage, worked_example_verified, interactive_practice_available,
                    reference_verification_status, provenance_json, plain_explanation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(module_number) DO UPDATE SET
                    code = excluded.code,
                    title = excluded.title,
                    short_title = excluded.short_title,
                    suggested_duration = excluded.suggested_duration,
                    year_pathway = excluded.year_pathway,
                    year1_months = excluded.year1_months,
                    why_it_matters = excluded.why_it_matters,
                    prerequisite_modules_json = excluded.prerequisite_modules_json,
                    mapped_objectives_json = excluded.mapped_objectives_json,
                    learn_topics_json = excluded.learn_topics_json,
                    resources_json = excluded.resources_json,
                    gate_requirements_json = excluded.gate_requirements_json,
                    content_status = CASE
                        WHEN syllabus_modules.interactive_practice_available = 1
                             AND excluded.content_status = 'CURRICULUM_MAPPED_AWAITING_QUESTIONS'
                        THEN 'INTERACTIVE_QUESTIONS_AVAILABLE'
                        ELSE excluded.content_status
                    END,
                    verification_note = excluded.verification_note,
                    lesson_stage = excluded.lesson_stage,
                    worked_example_verified = excluded.worked_example_verified,
                    interactive_practice_available = MAX(syllabus_modules.interactive_practice_available, excluded.interactive_practice_available),
                    reference_verification_status = excluded.reference_verification_status,
                    provenance_json = excluded.provenance_json,
                    plain_explanation = excluded.plain_explanation;
                """,
                (
                    mod.module_number,
                    mod.code,
                    mod.title,
                    mod.short_title,
                    mod.suggested_duration,
                    mod.year_pathway,
                    mod.year1_months,
                    mod.why_it_matters,
                    json.dumps(list(mod.prerequisite_module_numbers)),
                    json.dumps(list(mod.mapped_objective_ids)),
                    json.dumps(list(mod.learn_topics), ensure_ascii=False),
                    json.dumps(list(mod.resources), ensure_ascii=False),
                    json.dumps(list(mod.gate_requirements), ensure_ascii=False),
                    mod.content_status.value,
                    mod.verification_note,
                    mod.lesson_stage.value,
                    1 if mod.worked_example_verified else 0,
                    1 if mod.interactive_practice_available else 0,
                    mod.reference_verification_status.value,
                    json.dumps(mod.provenance.to_dict(), ensure_ascii=False),
                    mod.plain_explanation,
                ),
            )

            for obj_id in mod.mapped_objective_ids:
                if obj_id in known_objectives:
                    is_primary = 1 if obj_id not in primary_assigned else 0
                    primary_assigned.add(obj_id)
                    conn.execute(
                        """
                        INSERT OR IGNORE INTO syllabus_objective_map (
                            objective_id, module_number, is_primary_module
                        ) VALUES (?, ?, ?);
                        """,
                        (obj_id, mod.module_number, is_primary),
                    )
                    conn.execute(
                        """
                        INSERT OR IGNORE INTO module_objective_states (
                            module_number, objective_id, mastery_state
                        ) VALUES (?, ?, ?);
                        """,
                        (mod.module_number, obj_id, MasteryState.NOT_ASSESSED.value),
                    )

            # 3. Seed worked examples/projects without overwriting learner_status or completed_at
            for ex in mod.worked_examples:
                if ex.linked_objective_id in known_objectives:
                    conn.execute(
                        """
                        INSERT INTO syllabus_worked_examples (
                            id, module_number, code, title, kind, description,
                            linked_objective_id, linked_questions_json,
                            requires_calc_note, content_status, learner_status,
                            lesson_stage, worked_example_verified, interactive_practice_available,
                            reference_verification_status, provenance_json, plain_explanation, portfolio_category
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not started', ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            module_number = excluded.module_number,
                            code = excluded.code,
                            title = excluded.title,
                            kind = excluded.kind,
                            description = excluded.description,
                            linked_objective_id = excluded.linked_objective_id,
                            requires_calc_note = excluded.requires_calc_note,
                            lesson_stage = excluded.lesson_stage,
                            worked_example_verified = excluded.worked_example_verified,
                            interactive_practice_available = MAX(syllabus_worked_examples.interactive_practice_available, excluded.interactive_practice_available),
                            reference_verification_status = excluded.reference_verification_status,
                            provenance_json = excluded.provenance_json,
                            plain_explanation = excluded.plain_explanation,
                            portfolio_category = excluded.portfolio_category;
                        """,
                        (
                            ex.id,
                            mod.module_number,
                            ex.code,
                            ex.title,
                            ex.kind,
                            ex.description,
                            ex.linked_objective_id,
                            json.dumps(list(ex.linked_question_ids)),
                            1 if ex.requires_calc_note else 0,
                            ex.content_status.value,
                            ex.lesson_stage.value,
                            1 if ex.worked_example_verified else 0,
                            1 if ex.interactive_practice_available else 0,
                            ex.reference_verification_status.value,
                            json.dumps(ex.provenance.to_dict(), ensure_ascii=False),
                            ex.plain_explanation,
                            ex.portfolio_category,
                        ),
                    )

        # 4. Link any pre-existing Phase 2 starter questions (P2-UNITS-*, P2-FBD-*, P2-EQ-*) and their
        # historical attempts ONLY to their true primary module (Module 0 or Module 1), never to secondary modules.
        starter_q_links = [
            ("P2-UNITS-01", 0, "MATH-01", "EX-0.1", "guided", "equilibrium_reactions", None),
            ("P2-UNITS-02", 0, "MATH-01", "EX-0.1", "transfer", "equilibrium_reactions", "MISC-UNIT-MOMENT-STRESS"),
            ("P2-UNITS-03", 0, "MATH-01", "EX-0.1", "independent", "equilibrium_reactions", None),
            ("P2-FBD-01", 1, "STAT-01", "EX-1.2", "guided", "equilibrium_reactions", "MISC-STAT-FBD-OMITTED-REACTION"),
            ("P2-FBD-02", 1, "STAT-01", "EX-1.2", "independent", "equilibrium_reactions", "MISC-STAT-FBD-OMITTED-REACTION"),
            ("P2-FBD-03", 1, "STAT-01", "EX-1.2", "transfer", "equilibrium_reactions", None),
            ("P2-EQ-01", 1, "STAT-02", "EX-1.2", "guided", "equilibrium_reactions", None),
            ("P2-EQ-02", 1, "STAT-02", "EX-1.2", "transfer", "equilibrium_reactions", None),
            ("P2-EQ-03", 1, "STAT-02", "EX-1.2", "independent", "equilibrium_reactions", "MISC-STAT-MOMENT-ARM-TRIG"),
        ]
        existing_q_ids = {str(r[0]) for r in conn.execute("SELECT id FROM questions;").fetchall()}
        for qid, m_num, oid, ex_id, stage, port_cat, rem_misc in starter_q_links:
            if qid in existing_q_ids and oid in known_objectives:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO question_module_links (
                        question_id, module_number, objective_id, worked_example_id,
                        teaching_stage, portfolio_category, remedial_for_misconception_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?);
                    """,
                    (qid, m_num, oid, ex_id, stage, port_cat, rem_misc),
                )

        # Backfill attempt_module_links for any pre-existing attempts whose question is in question_module_links
        conn.execute(
            """
            INSERT OR IGNORE INTO attempt_module_links (
                attempt_id, module_number, objective_id, question_id, worked_example_id, portfolio_category
            )
            SELECT
                a.id, qml.module_number, a.objective_id, a.question_id, qml.worked_example_id, qml.portfolio_category
            FROM attempt_evidence a
            JOIN question_module_links qml ON qml.question_id = a.question_id;
            """
        )

        # Sync module_objective_states ONLY for non-shared objectives in Module 0 & 1 (MATH-01..03, STAT-01..02)
        # where legacy progress exists, ensuring shared objectives (e.g. STAT-03, MAT-02, CODE-01, CODE-02, TEMP-01, SYS-02)
        # never transfer legacy progress to secondary modules (e.g. Module 6 or Module 12).
        conn.execute(
            """
            UPDATE module_objective_states
            SET
                mastery_state = (
                    SELECT s.mastery_state FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                ),
                attempts_count = (
                    SELECT s.attempts_count FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                ),
                correct_count = (
                    SELECT s.correct_count FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                ),
                distinct_task_types_passed = (
                    SELECT s.distinct_task_types_passed FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                ),
                last_attempt_at = (
                    SELECT s.last_attempt_at FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                ),
                next_review_due_at = (
                    SELECT s.next_review_due_at FROM learner_objective_states s
                    WHERE s.objective_id = module_objective_states.objective_id
                )
            WHERE module_objective_states.attempts_count = 0
              AND module_objective_states.module_number IN (0, 1)
              AND module_objective_states.objective_id IN ('MATH-01', 'MATH-02', 'MATH-03', 'STAT-01', 'STAT-02')
              AND EXISTS (
                  SELECT 1 FROM learner_objective_states s
                  WHERE s.objective_id = module_objective_states.objective_id
                    AND s.mastery_state != 'Not assessed'
              );
            """
        )

        # 5. Seed all 6 integrated portfolio milestones (A–F) without overwriting learner_status
        for ms in syllabus.portfolio_milestones:
            conn.execute(
                """
                INSERT OR IGNORE INTO portfolio_milestones (
                    id, code, title, description, required_items_json,
                    pass_condition, prerequisite_modules_json, learner_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Not started');
                """,
                (
                    ms.id,
                    ms.code,
                    ms.title,
                    ms.description,
                    json.dumps(
                        [
                            {
                                "category": r.category,
                                "label": r.label,
                                "required_count": r.required_count,
                            }
                            for r in ms.required_items
                        ],
                        ensure_ascii=False,
                    ),
                    ms.pass_condition,
                    json.dumps(list(ms.prerequisite_module_numbers)),
                ),
            )

        # 6. Seed Week 1 initial study rhythm row if empty (Module 0 starting point)
        conn.execute(
            """
            INSERT OR IGNORE INTO study_rhythm_log (
                week_number, is_fourth_week_review, module_number
            ) VALUES (1, 0, 0);
            """
        )

        conn.commit()