"""SQLite database schema versioning and idempotent migrations."""

from __future__ import annotations

import sqlite3
from typing import List, Tuple

MIGRATIONS: List[Tuple[int, str, str]] = [
    (
        1,
        "Initial core schema: settings, curriculum, misconceptions, questions, learner evidence, sources, FTS5, and audit links",
        """
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS curriculum_objectives (
            id TEXT PRIMARY KEY,
            domain_code TEXT NOT NULL,
            domain_title TEXT NOT NULL,
            title TEXT NOT NULL,
            observable_competency TEXT NOT NULL,
            why_it_matters TEXT NOT NULL,
            target_balance TEXT NOT NULL,
            provenance TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS objective_prerequisites (
            objective_id TEXT NOT NULL,
            prerequisite_id TEXT NOT NULL,
            PRIMARY KEY (objective_id, prerequisite_id),
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE,
            FOREIGN KEY (prerequisite_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS misconceptions (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            remediation_strategy TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS learner_objective_states (
            objective_id TEXT PRIMARY KEY,
            mastery_state TEXT NOT NULL DEFAULT 'Not assessed',
            attempts_count INTEGER NOT NULL DEFAULT 0,
            correct_count INTEGER NOT NULL DEFAULT 0,
            distinct_task_types_passed TEXT NOT NULL DEFAULT '[]',
            last_attempt_at TEXT,
            next_review_due_at TEXT,
            notes TEXT,
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            objective_id TEXT NOT NULL,
            title TEXT NOT NULL,
            task_type TEXT NOT NULL,
            difficulty INTEGER NOT NULL DEFAULT 1,
            payload_json TEXT NOT NULL,
            provenance TEXT NOT NULL,
            verification_status TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS attempt_evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id TEXT NOT NULL,
            objective_id TEXT NOT NULL,
            task_type TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            is_correct INTEGER NOT NULL,
            hints_used INTEGER NOT NULL DEFAULT 0,
            misconception_id TEXT,
            confidence_rating TEXT,
            user_answer TEXT,
            feedback_summary TEXT,
            marking_method TEXT NOT NULL,
            attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sources (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author_or_org TEXT NOT NULL DEFAULT '',
            edition TEXT NOT NULL DEFAULT '',
            publication_year TEXT NOT NULL DEFAULT '',
            document_type TEXT NOT NULL DEFAULT 'textbook',
            jurisdiction TEXT NOT NULL DEFAULT 'UK',
            standard_number TEXT NOT NULL DEFAULT '',
            file_path TEXT NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 0,
            ocr_required_pages INTEGER NOT NULL DEFAULT 0,
            indexing_status TEXT NOT NULL DEFAULT 'PENDING',
            notes TEXT NOT NULL DEFAULT '',
            added_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS source_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id TEXT NOT NULL,
            pdf_page_index INTEGER NOT NULL,
            printed_page_label TEXT NOT NULL DEFAULT '',
            detected_headings TEXT NOT NULL DEFAULT '',
            extracted_text TEXT NOT NULL DEFAULT '',
            needs_ocr_or_review INTEGER NOT NULL DEFAULT 0,
            UNIQUE(source_id, pdf_page_index),
            FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS content_source_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            source_id TEXT NOT NULL,
            clause_or_section TEXT NOT NULL DEFAULT '',
            pdf_page_index INTEGER,
            printed_page_label TEXT NOT NULL DEFAULT '',
            excerpt_note TEXT NOT NULL DEFAULT '',
            verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
            FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS saved_calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            calc_type TEXT NOT NULL,
            title TEXT NOT NULL,
            inputs_json TEXT NOT NULL,
            results_json TEXT NOT NULL,
            sign_convention_id TEXT NOT NULL,
            solver_version TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """,
    ),
    (
        2,
        "Record provenance for saved calculations without attributing historical records",
        """
        ALTER TABLE saved_calculations ADD COLUMN provenance TEXT NOT NULL DEFAULT 'UNKNOWN'
            CHECK (provenance IN (
                'UNKNOWN', 'VERIFIED_USER_SOURCE', 'PYTHON_DETERMINISTIC',
                'STARTER_CURRICULUM_UNRECONCILED', 'AI_GENERAL_KNOWLEDGE',
                'AI_GENERATED_DRAFT_UNVERIFIED'
            ));
        """,
    ),
]


def apply_migrations(conn: sqlite3.Connection) -> bool:
    """
    Apply all pending SQLite migrations and configure FTS5 virtual table if supported.
    Returns True if FTS5 is available and active.
    """
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """
    )

    cur = conn.execute("SELECT COALESCE(MAX(version), 0) FROM schema_migrations;")
    current_version = int(cur.fetchone()[0])

    for version, description, sql_script in MIGRATIONS:
        if version > current_version:
            # executescript normally commits before running: explicitly begin
            # inside the script so schema changes and the version record commit
            # together, including the ALTER TABLE in migration 2.
            try:
                conn.executescript("BEGIN;\n" + sql_script)
                conn.execute(
                    "INSERT INTO schema_migrations (version, description) VALUES (?, ?);",
                    (version, description),
                )
                conn.commit()
            except Exception:
                conn.rollback()
                raise

    # Set up FTS5 virtual table for local full-text search
    fts5_enabled = False
    try:
        conn.execute(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS source_pages_fts USING fts5(
                source_id UNINDEXED,
                pdf_page_index UNINDEXED,
                detected_headings,
                extracted_text
            );
            """
        )
        conn.commit()
        fts5_enabled = True
    except sqlite3.OperationalError:
        fts5_enabled = False

    return fts5_enabled


SYLLABUS_MIGRATIONS: List[Tuple[int, str, str]] = [
    (
        1,
        "Master Rebuild Syllabus (27 July 2026) tables: modules 0-19, objective mapping, worked examples, portfolio milestones A-F, 9-part calculation notes, and 4-week study rhythm",
        """
        CREATE TABLE IF NOT EXISTS syllabus_metadata (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS syllabus_modules (
            module_number INTEGER PRIMARY KEY CHECK (module_number >= 0 AND module_number <= 19),
            code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            short_title TEXT NOT NULL,
            suggested_duration TEXT NOT NULL,
            year_pathway TEXT NOT NULL,
            year1_months TEXT NOT NULL,
            why_it_matters TEXT NOT NULL,
            prerequisite_modules_json TEXT NOT NULL DEFAULT '[]',
            mapped_objectives_json TEXT NOT NULL DEFAULT '[]',
            learn_topics_json TEXT NOT NULL DEFAULT '[]',
            resources_json TEXT NOT NULL DEFAULT '[]',
            gate_requirements_json TEXT NOT NULL DEFAULT '[]',
            content_status TEXT NOT NULL CHECK (content_status IN (
                'INTERACTIVE_QUESTIONS_AVAILABLE',
                'CURRICULUM_MAPPED_AWAITING_QUESTIONS',
                'AWAITING_CONTROLLED_STANDARD_OR_REFERENCE'
            )),
            verification_note TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS syllabus_objective_map (
            objective_id TEXT NOT NULL,
            module_number INTEGER NOT NULL,
            is_primary_module INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (objective_id, module_number),
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE,
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS syllabus_worked_examples (
            id TEXT PRIMARY KEY,
            module_number INTEGER NOT NULL,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            kind TEXT NOT NULL,
            description TEXT NOT NULL,
            linked_objective_id TEXT NOT NULL,
            linked_questions_json TEXT NOT NULL DEFAULT '[]',
            requires_calc_note INTEGER NOT NULL DEFAULT 0,
            content_status TEXT NOT NULL CHECK (content_status IN (
                'INTERACTIVE_QUESTIONS_AVAILABLE',
                'CURRICULUM_MAPPED_AWAITING_QUESTIONS',
                'AWAITING_CONTROLLED_STANDARD_OR_REFERENCE'
            )),
            learner_status TEXT NOT NULL DEFAULT 'Not started',
            completed_at TEXT,
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE CASCADE,
            FOREIGN KEY (linked_objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS portfolio_milestones (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            required_items_json TEXT NOT NULL DEFAULT '[]',
            pass_condition TEXT NOT NULL,
            prerequisite_modules_json TEXT NOT NULL DEFAULT '[]',
            learner_status TEXT NOT NULL DEFAULT 'Not started',
            completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS calculation_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_number INTEGER,
            worked_example_id TEXT,
            milestone_id TEXT,
            title TEXT NOT NULL,
            brief_and_sketch TEXT NOT NULL DEFAULT '',
            structural_arrangement_and_load_path TEXT NOT NULL DEFAULT '',
            design_assumptions TEXT NOT NULL DEFAULT '',
            loads_and_actions TEXT NOT NULL DEFAULT '',
            analysis TEXT NOT NULL DEFAULT '',
            checks TEXT NOT NULL DEFAULT '',
            detailing_and_restraint_requirements TEXT NOT NULL DEFAULT '',
            conclusion TEXT NOT NULL DEFAULT '',
            limitations_and_questions_requiring_review TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
                'DRAFT', 'SELF_CHECKED', 'READY_FOR_SENIOR_REVIEW'
            )),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS study_rhythm_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_number INTEGER NOT NULL UNIQUE CHECK (week_number >= 1),
            is_fourth_week_review INTEGER NOT NULL DEFAULT 0,
            module_number INTEGER,
            session_1_completed INTEGER NOT NULL DEFAULT 0,
            session_2_completed INTEGER NOT NULL DEFAULT 0,
            session_3_completed INTEGER NOT NULL DEFAULT 0,
            reflection_misunderstood TEXT NOT NULL DEFAULT '',
            reflection_physical_behaviour TEXT NOT NULL DEFAULT '',
            reflection_work_connection TEXT NOT NULL DEFAULT '',
            senior_engineer_questions TEXT NOT NULL DEFAULT '',
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE SET NULL
        );
        """,
    ),
    (
        2,
        "Milestone 2 safeguards: explicit content-quality flags, structured provenance, per-module objective mastery isolation, and portfolio evidence links",
        """
        ALTER TABLE syllabus_modules ADD COLUMN lesson_stage TEXT NOT NULL DEFAULT 'OUTLINE_ONLY'
            CHECK (lesson_stage IN ('OUTLINE_ONLY', 'LESSON_IN_PROGRESS', 'LESSON_COMPLETE'));
        ALTER TABLE syllabus_modules ADD COLUMN worked_example_verified INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE syllabus_modules ADD COLUMN interactive_practice_available INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE syllabus_modules ADD COLUMN reference_verification_status TEXT NOT NULL DEFAULT 'REFERENCE_VERIFICATION_REQUIRED'
            CHECK (reference_verification_status IN (
                'NOT_REQUIRED_FIRST_PRINCIPLES',
                'REFERENCE_VERIFICATION_REQUIRED',
                'VERIFIED_AGAINST_CONTROLLED_SOURCE'
            ));
        ALTER TABLE syllabus_modules ADD COLUMN provenance_json TEXT NOT NULL DEFAULT '{}';
        ALTER TABLE syllabus_modules ADD COLUMN plain_explanation TEXT NOT NULL DEFAULT '';

        ALTER TABLE syllabus_worked_examples ADD COLUMN lesson_stage TEXT NOT NULL DEFAULT 'OUTLINE_ONLY'
            CHECK (lesson_stage IN ('OUTLINE_ONLY', 'LESSON_IN_PROGRESS', 'LESSON_COMPLETE'));
        ALTER TABLE syllabus_worked_examples ADD COLUMN worked_example_verified INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE syllabus_worked_examples ADD COLUMN interactive_practice_available INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE syllabus_worked_examples ADD COLUMN reference_verification_status TEXT NOT NULL DEFAULT 'REFERENCE_VERIFICATION_REQUIRED'
            CHECK (reference_verification_status IN (
                'NOT_REQUIRED_FIRST_PRINCIPLES',
                'REFERENCE_VERIFICATION_REQUIRED',
                'VERIFIED_AGAINST_CONTROLLED_SOURCE'
            ));
        ALTER TABLE syllabus_worked_examples ADD COLUMN provenance_json TEXT NOT NULL DEFAULT '{}';
        ALTER TABLE syllabus_worked_examples ADD COLUMN plain_explanation TEXT NOT NULL DEFAULT '';
        ALTER TABLE syllabus_worked_examples ADD COLUMN intermediate_steps_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE syllabus_worked_examples ADD COLUMN portfolio_category TEXT NOT NULL DEFAULT '';

        CREATE TABLE IF NOT EXISTS module_objective_states (
            module_number INTEGER NOT NULL,
            objective_id TEXT NOT NULL,
            mastery_state TEXT NOT NULL DEFAULT 'Not assessed',
            attempts_count INTEGER NOT NULL DEFAULT 0,
            correct_count INTEGER NOT NULL DEFAULT 0,
            distinct_task_types_passed TEXT NOT NULL DEFAULT '[]',
            last_attempt_at TEXT,
            next_review_due_at TEXT,
            PRIMARY KEY (module_number, objective_id),
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE CASCADE,
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS question_module_links (
            question_id TEXT PRIMARY KEY,
            module_number INTEGER NOT NULL,
            objective_id TEXT NOT NULL,
            worked_example_id TEXT,
            teaching_stage TEXT NOT NULL DEFAULT 'guided'
                CHECK (teaching_stage IN ('guided', 'independent', 'remedial', 'transfer')),
            portfolio_category TEXT NOT NULL DEFAULT '',
            remedial_for_misconception_id TEXT,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE CASCADE,
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS attempt_module_links (
            attempt_id INTEGER PRIMARY KEY,
            module_number INTEGER NOT NULL,
            objective_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            worked_example_id TEXT,
            portfolio_category TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (attempt_id) REFERENCES attempt_evidence(id) ON DELETE CASCADE,
            FOREIGN KEY (module_number) REFERENCES syllabus_modules(module_number) ON DELETE CASCADE,
            FOREIGN KEY (objective_id) REFERENCES curriculum_objectives(id) ON DELETE CASCADE
        );

        CREATE TRIGGER IF NOT EXISTS trg_sync_primary_module_state_on_legacy_update
        AFTER UPDATE OF mastery_state ON learner_objective_states
        WHEN NEW.attempts_count = OLD.attempts_count
        BEGIN
            UPDATE module_objective_states
            SET mastery_state = NEW.mastery_state
            WHERE objective_id = NEW.objective_id
              AND attempts_count = 0
              AND module_number IN (
                  SELECT module_number
                  FROM syllabus_objective_map
                  WHERE objective_id = NEW.objective_id
                    AND is_primary_module = 1
              );
        END;
        """,
    ),
]


def has_pending_migrations(conn: sqlite3.Connection) -> bool:
    """Return True if either base schema migrations or syllabus schema migrations have unapplied versions."""
    cur = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations';"
    )
    if cur.fetchone() is None:
        return True
    base_ver = int(conn.execute("SELECT COALESCE(MAX(version), 0) FROM schema_migrations;").fetchone()[0])
    if any(v > base_ver for v, _, _ in MIGRATIONS):
        return True

    cur_syl = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabus_schema_migrations';"
    )
    if cur_syl.fetchone() is None:
        return True
    syl_ver = int(conn.execute("SELECT COALESCE(MAX(version), 0) FROM syllabus_schema_migrations;").fetchone()[0])
    return any(v > syl_ver for v, _, _ in SYLLABUS_MIGRATIONS)


def apply_syllabus_migrations(conn: sqlite3.Connection) -> None:
    """Apply Master Syllabus schema migrations atomically without altering Phase 1 schema_migrations."""
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS syllabus_schema_migrations (
            version INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        """
    )

    cur = conn.execute("SELECT COALESCE(MAX(version), 0) FROM syllabus_schema_migrations;")
    current_version = int(cur.fetchone()[0])

    for version, description, sql_script in SYLLABUS_MIGRATIONS:
        if version > current_version:
            try:
                conn.executescript("BEGIN;\n" + sql_script)
                conn.execute(
                    "INSERT INTO syllabus_schema_migrations (version, description) VALUES (?, ?);",
                    (version, description),
                )
                conn.commit()
            except Exception:
                conn.rollback()
                raise