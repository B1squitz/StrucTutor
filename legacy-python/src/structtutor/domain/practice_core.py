"""Small deterministic Phase 2 practice engine; no GUI or external service.

The existing application supplies its SQLite connection factory and unit converter.
Original practice items are data, not executable code.
"""
from __future__ import annotations

import json
import math
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable

Converter = Callable[[float, str, str], float]
PROVENANCE = "AI_GENERAL_KNOWLEDGE"
STATUS = "SELF_CHECKED_NOT_INDEPENDENTLY_REVIEWED"


class PracticeError(ValueError):
    """Invalid practice content or user input; never recorded as an attempt."""


@dataclass(frozen=True)
class Feedback:
    correct: bool
    message: str
    misconception_id: str | None


def _nonempty_string(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate_item(item: object, convert: Converter) -> dict:
    """Validate a controlled original item, its marking method and dimensions."""
    if not isinstance(item, dict):
        raise PracticeError("A question must be a JSON object.")
    required = ("id", "objective_id", "title", "task_type", "prompt", "solution")
    if not all(_nonempty_string(item.get(k)) for k in required):
        raise PracticeError("Question is missing a required text field.")
    if item.get("provenance") != PROVENANCE or item.get("verification_status") != STATUS:
        raise PracticeError("Question provenance or review status is invalid.")
    if type(item.get("version")) is not int or item["version"] < 1:
        raise PracticeError("Question version must be a positive integer.")
    if type(item.get("difficulty")) is not int or not 1 <= item["difficulty"] <= 5:
        raise PracticeError("Difficulty must be an integer from 1 to 5.")
    if item["task_type"] not in {"concept", "calculation", "transfer"}:
        raise PracticeError("Unsupported task type.")
    hints = item.get("hints")
    if not isinstance(hints, list) or not hints or not all(_nonempty_string(h) for h in hints):
        raise PracticeError("At least one non-empty hint is required.")
    if not isinstance(item.get("reference", ""), str):
        raise PracticeError("Reference must be text.")
    if item.get("kind") == "choice":
        options = item.get("options")
        if not isinstance(options, dict) or len(options) < 2 or not all(
            _nonempty_string(k) and _nonempty_string(v) for k, v in options.items()
        ):
            raise PracticeError("A choice item needs at least two labelled options.")
        if not _nonempty_string(item.get("answer")) or item["answer"] not in options:
            raise PracticeError("Correct option is not present.")
        wrong = item.get("wrong_misconceptions", {})
        if not isinstance(wrong, dict) or any(k not in options or k == item["answer"] or not _nonempty_string(v) for k, v in wrong.items()):
            raise PracticeError("Invalid misconception mapping.")
    elif item.get("kind") == "numeric":
        answer = item.get("answer")
        if type(answer) not in (int, float) or not math.isfinite(answer):
            raise PracticeError("Numeric expected answer must be finite.")
        if not _nonempty_string(item.get("unit")):
            raise PracticeError("Numeric item needs a unit.")
        choices = item.get("unit_choices")
        if not isinstance(choices, list) or not choices or item["unit"] not in choices or not all(_nonempty_string(u) for u in choices):
            raise PracticeError("Numeric item has invalid unit choices.")
        for field in ("relative_tolerance", "absolute_tolerance"):
            value = item.get(field)
            if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
                raise PracticeError("Invalid numerical tolerance.")
        if item["relative_tolerance"] >= 1:
            raise PracticeError("Relative tolerance must be less than one.")
        try:
            for unit in choices:
                converted = convert(float(answer), item["unit"], unit)
                if not math.isfinite(converted):
                    raise ValueError("non-finite conversion")
        except (ValueError, TypeError, OverflowError) as exc:
            raise PracticeError("A listed unit is unknown or dimensionally incompatible.") from exc
    else:
        raise PracticeError("Unsupported marking method.")
    return item


def load_bank(path: Path, convert: Converter) -> list[dict]:
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise PracticeError("Cannot load the Phase 2 question bank.") from exc
    if not isinstance(data, dict) or data.get("schema_version") != 1 or not isinstance(data.get("questions"), list) or not data["questions"]:
        raise PracticeError("Invalid or empty question-bank schema.")
    items = [validate_item(q, convert) for q in data["questions"]]
    ids = [q["id"] for q in items]
    if len(ids) != len(set(ids)):
        raise PracticeError("Question IDs must be unique.")
    return items


def mark(item: dict, answer: str, unit: str | None, convert: Converter) -> Feedback:
    """Return explicit deterministic feedback; invalid inputs are not attempts."""
    validate_item(item, convert)
    if not isinstance(answer, str):
        raise PracticeError("Answer must be text.")
    if item["kind"] == "choice":
        if answer not in item["options"]:
            raise PracticeError("Select one of the listed answer options.")
        correct = answer == item["answer"]
        misc = item.get("wrong_misconceptions", {}).get(answer) if not correct else None
        return Feedback(correct, "Correct." if correct else "Not quite. Review the hint or solution; the cause is uncertain unless stated.", misc)
    if unit not in item["unit_choices"]:
        raise PracticeError("Select a listed unit.")
    try:
        numeric = float(answer.strip())
        if not math.isfinite(numeric):
            raise ValueError("not finite")
        actual = convert(numeric, unit, item["unit"])
        if not math.isfinite(actual):
            raise ValueError("not finite")
    except (ValueError, TypeError, OverflowError) as exc:
        raise PracticeError("Enter a finite number with a compatible listed unit.") from exc
    expected = float(item["answer"])
    correct = math.isclose(actual, expected, rel_tol=item["relative_tolerance"], abs_tol=item["absolute_tolerance"])
    if correct:
        return Feedback(True, "Correct after checking the supplied unit.", None)
    msg = "Not quite. Check your method, sign and units; the cause is uncertain."
    if actual != 0 and expected != 0:
        ratio = abs(actual / expected)
        if math.isfinite(ratio) and ratio > 0:
            exponent = round(math.log10(ratio))
            if exponent != 0 and abs(exponent) <= 300 and math.isclose(ratio, 10.0 ** exponent, rel_tol=0.02):
                msg += f" The magnitude is approximately 10^{exponent} times the expected magnitude; check unit conversion."
    return Feedback(False, msg, None)


def _as_utc(raw: str) -> datetime:
    value = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def mastery_from_evidence(rows: list[tuple]) -> str:
    """Conservative mastery from (question_id, task_type, correct, help, time).

    Secure requires three distinct independent correct items in two task types,
    at least one independent correct answer at least 24 hours after the first,
    and a latest attempt that was correct without help. This is not a full
    spaced-learning model.
    """
    if not rows:
        return "Not assessed"
    independent = [r for r in rows if r[2] and r[3] == 0]
    unique = {r[0] for r in independent}
    types = {r[1] for r in independent}
    latest_good = bool(rows[-1][2]) and rows[-1][3] == 0
    if len(unique) >= 3 and len(types) >= 2 and latest_good:
        times = sorted(_as_utc(r[4]) for r in independent)
        if times[-1] - times[0] >= timedelta(hours=24):
            return "Secure"
    if len(unique) >= 2 and len(types) >= 2 and latest_good:
        return "Provisional"
    if independent:
        return "Developing"
    return "Emerging"


class PracticeService:
    def __init__(self, connect: Callable, convert: Converter):
        self.connect = connect
        self.convert = convert

    def seed(self, path: Path) -> int:
        """Validate every item before any insert; never overwrite existing rows."""
        items = load_bank(path, self.convert)
        with closing(self.connect()) as conn:
            with conn:
                ids = {row[0] for row in conn.execute("SELECT id FROM curriculum_objectives")}
                missing = sorted({q["objective_id"] for q in items} - ids)
                if missing:
                    raise PracticeError("Question bank refers to unknown objectives: " + ", ".join(missing))
                known_misconceptions = {row[0] for row in conn.execute("SELECT id FROM misconceptions")}
                used_misconceptions = {m for q in items for m in q.get("wrong_misconceptions", {}).values()}
                unknown = sorted(used_misconceptions - known_misconceptions)
                if unknown:
                    raise PracticeError("Question bank refers to unknown misconceptions: " + ", ".join(unknown))
                for q in items:
                    conn.execute("INSERT OR IGNORE INTO questions (id, objective_id, title, task_type, difficulty, payload_json, provenance, verification_status, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (q["id"], q["objective_id"], q["title"], q["task_type"], q["difficulty"], json.dumps(q, ensure_ascii=False), q["provenance"], q["verification_status"], q["version"]))
        return len(items)

    @staticmethod
    def _has_syllabus_map(conn) -> bool:
        row = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='syllabus_objective_map'"
        ).fetchone()
        return row is not None

    @staticmethod
    def _has_module_isolation_tables(conn) -> bool:
        row = conn.execute(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' "
            "AND name IN ('module_objective_states', 'question_module_links', 'attempt_module_links')"
        ).fetchone()
        return bool(row and row[0] == 3)

    def seed_syllabus_bank(self, path: Path) -> int:
        """
        Seed the Milestone 2 module-linked question bank and populate question_module_links
        and honest content-quality flags for covered modules and worked examples.
        """
        count = self.seed(path)
        items = load_bank(path, self.convert)
        with closing(self.connect()) as conn:
            with conn:
                if not self._has_module_isolation_tables(conn):
                    return count
                covered_modules: set[int] = set()
                covered_examples: set[str] = set()
                for q in items:
                    mod_num = q.get("module_number")
                    if type(mod_num) is not int:
                        primary = conn.execute(
                            "SELECT module_number FROM syllabus_objective_map "
                            "WHERE objective_id = ? ORDER BY is_primary_module DESC, module_number ASC LIMIT 1",
                            (q["objective_id"],),
                        ).fetchone()
                        mod_num = int(primary[0]) if primary else 0
                    covered_modules.add(mod_num)
                    ex_id = str(q.get("worked_example_id") or "")
                    if ex_id:
                        covered_examples.add(ex_id)
                    stage = str(q.get("teaching_stage") or "independent")
                    port_cat = str(q.get("portfolio_category") or "")
                    rem_misc = str(q.get("remedial_for_misconception_id") or "")
                    conn.execute(
                        """
                        INSERT INTO question_module_links (
                            question_id, module_number, objective_id,
                            worked_example_id, teaching_stage, portfolio_category,
                            remedial_for_misconception_id
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(question_id) DO UPDATE SET
                            module_number = excluded.module_number,
                            objective_id = excluded.objective_id,
                            worked_example_id = excluded.worked_example_id,
                            teaching_stage = excluded.teaching_stage,
                            portfolio_category = excluded.portfolio_category,
                            remedial_for_misconception_id = excluded.remedial_for_misconception_id;
                        """,
                        (q["id"], mod_num, q["objective_id"], ex_id, stage, port_cat, rem_misc),
                    )
                for mod_num in sorted(covered_modules):
                    conn.execute(
                        """
                        UPDATE syllabus_modules
                        SET interactive_practice_available = 1,
                            lesson_stage = CASE
                                WHEN reference_verification_status = 'REFERENCE_VERIFICATION_REQUIRED'
                                THEN 'LESSON_IN_PROGRESS'
                                ELSE 'LESSON_COMPLETE'
                            END,
                            content_status = 'INTERACTIVE_QUESTIONS_AVAILABLE'
                        WHERE module_number = ?;
                        """,
                        (mod_num,),
                    )
                for ex_id in sorted(covered_examples):
                    conn.execute(
                        """
                        UPDATE syllabus_worked_examples
                        SET interactive_practice_available = 1,
                            worked_example_verified = 1,
                            lesson_stage = CASE
                                WHEN reference_verification_status = 'REFERENCE_VERIFICATION_REQUIRED'
                                THEN 'LESSON_IN_PROGRESS'
                                ELSE 'LESSON_COMPLETE'
                            END,
                            content_status = CASE
                                WHEN reference_verification_status = 'REFERENCE_VERIFICATION_REQUIRED'
                                THEN 'AWAITING_CONTROLLED_STANDARD_OR_REFERENCE'
                                ELSE 'INTERACTIVE_QUESTIONS_AVAILABLE'
                            END
                        WHERE id = ?;
                        """,
                        (ex_id,),
                    )
        return count

    def objectives(self, module_number: int | None = None) -> list[tuple]:
        with closing(self.connect()) as conn:
            if module_number is not None and self._has_module_isolation_tables(conn):
                query = (
                    "SELECT o.id, o.title, COALESCE(ms.mastery_state, 'Not assessed') "
                    "FROM syllabus_objective_map m "
                    "JOIN curriculum_objectives o ON o.id = m.objective_id "
                    "LEFT JOIN module_objective_states ms "
                    "  ON ms.module_number = m.module_number AND ms.objective_id = m.objective_id "
                    "WHERE m.module_number = ? "
                    "  AND EXISTS ("
                    "    SELECT 1 FROM question_module_links qml "
                    "    WHERE qml.module_number = m.module_number AND qml.objective_id = m.objective_id"
                    "  ) "
                    "ORDER BY o.id ASC"
                )
                rows = [tuple(r) for r in conn.execute(query, (int(module_number),))]
                if rows:
                    return rows
            if self._has_syllabus_map(conn):
                query = (
                    "SELECT o.id, o.title, COALESCE(s.mastery_state, 'Not assessed') "
                    "FROM curriculum_objectives o "
                    "JOIN questions q ON q.objective_id=o.id "
                    "LEFT JOIN learner_objective_states s ON s.objective_id=o.id "
                    "LEFT JOIN syllabus_objective_map m ON m.objective_id=o.id "
                    "WHERE q.id LIKE 'P2-%' "
                    "GROUP BY o.id, o.title, s.mastery_state "
                    "ORDER BY COALESCE(MIN(m.module_number), 999) ASC, o.id ASC"
                )
            else:
                query = (
                    "SELECT DISTINCT o.id, o.title, COALESCE(s.mastery_state, 'Not assessed') "
                    "FROM curriculum_objectives o "
                    "JOIN questions q ON q.objective_id=o.id "
                    "LEFT JOIN learner_objective_states s ON s.objective_id=o.id "
                    "WHERE q.id LIKE 'P2-%' ORDER BY o.id"
                )
            return [tuple(r) for r in conn.execute(query)]

    def module_objectives(self, module_number: int | None = None) -> list[tuple]:
        """Return (module_number, objective_id, objective_title, module_mastery_state) for supported modules."""
        with closing(self.connect()) as conn:
            if not self._has_module_isolation_tables(conn):
                return [(0, r[0], r[1], r[2]) for r in self.objectives()]
            params: tuple = ()
            where_clause = ""
            if module_number is not None:
                where_clause = "AND m.module_number = ? "
                params = (int(module_number),)
            rows = conn.execute(
                f"""
                SELECT m.module_number, o.id, o.title, COALESCE(ms.mastery_state, 'Not assessed')
                FROM syllabus_objective_map m
                JOIN curriculum_objectives o ON o.id = m.objective_id
                LEFT JOIN module_objective_states ms
                  ON ms.module_number = m.module_number AND ms.objective_id = m.objective_id
                WHERE EXISTS (
                    SELECT 1 FROM question_module_links qml
                    WHERE qml.module_number = m.module_number AND qml.objective_id = m.objective_id
                )
                {where_clause}
                ORDER BY m.module_number ASC, o.id ASC;
                """,
                params,
            ).fetchall()
            return [tuple(r) for r in rows]

    def items(self, objective_id: str, module_number: int | None = None) -> list[dict]:
        with closing(self.connect()) as conn:
            if module_number is not None and self._has_module_isolation_tables(conn):
                rows = conn.execute(
                    """
                    SELECT q.id, q.objective_id, q.payload_json
                    FROM questions q
                    JOIN question_module_links qml ON qml.question_id = q.id
                    WHERE q.objective_id = ? AND qml.module_number = ? AND q.id LIKE 'P2-%'
                    ORDER BY CASE qml.teaching_stage WHEN 'guided' THEN 0 ELSE 1 END ASC, q.id ASC
                    """,
                    (objective_id, int(module_number)),
                ).fetchall()
                if not rows:
                    rows = conn.execute(
                        "SELECT id, objective_id, payload_json FROM questions WHERE objective_id=? AND id LIKE 'P2-%' ORDER BY id",
                        (objective_id,),
                    ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT id, objective_id, payload_json FROM questions WHERE objective_id=? AND id LIKE 'P2-%' ORDER BY id",
                    (objective_id,),
                ).fetchall()
        try:
            items = [validate_item(json.loads(r[2]), self.convert) for r in rows]
            if any(item["id"] != row[0] or item["objective_id"] != row[1] for item, row in zip(items, rows)):
                raise PracticeError("Stored question identity does not match its database record.")
            return items
        except (json.JSONDecodeError, TypeError) as exc:
            raise PracticeError("Stored question is invalid.") from exc

    def submit(
        self,
        question_id: str,
        answer: str,
        unit: str | None,
        help_count: int,
        confidence: str = "",
        now: datetime | None = None,
        module_number: int | None = None,
    ) -> tuple[Feedback, str]:
        if type(help_count) is not int or help_count < 0:
            raise PracticeError("Help count must be a non-negative integer.")
        if confidence not in {"", "Low", "Medium", "High"}:
            raise PracticeError("Unsupported confidence value.")
        now = now or datetime.now(timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
        now = now.astimezone(timezone.utc)
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
        with closing(self.connect()) as conn:
            with conn:
                row = conn.execute(
                    "SELECT id, objective_id, payload_json FROM questions WHERE id=? AND id LIKE 'P2-%'",
                    (question_id,),
                ).fetchone()
                if row is None:
                    raise PracticeError("Question not found.")
                try:
                    item = json.loads(row[2])
                except (json.JSONDecodeError, TypeError) as exc:
                    raise PracticeError("Stored question is invalid.") from exc
                validate_item(item, self.convert)
                if item["id"] != row[0] or item["objective_id"] != row[1]:
                    raise PracticeError("Stored question identity does not match its database record.")
                feedback = mark(item, answer, unit, self.convert)
                response = answer if item["kind"] == "choice" else f"{answer.strip()} {unit}"
                cursor = conn.execute(
                    "INSERT INTO attempt_evidence (question_id, objective_id, task_type, difficulty, is_correct, hints_used, misconception_id, confidence_rating, user_answer, feedback_summary, marking_method, attempted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        item["id"],
                        item["objective_id"],
                        item["task_type"],
                        item["difficulty"],
                        int(feedback.correct),
                        help_count,
                        feedback.misconception_id,
                        confidence or None,
                        response,
                        feedback.message,
                        "deterministic_" + item["kind"],
                        timestamp,
                    ),
                )
                attempt_id = cursor.lastrowid
                rows = [
                    tuple(r)
                    for r in conn.execute(
                        "SELECT question_id, task_type, is_correct, hints_used, attempted_at FROM attempt_evidence WHERE objective_id=? ORDER BY attempted_at, id",
                        (item["objective_id"],),
                    )
                ]
                state = mastery_from_evidence(rows)
                correct_count = sum(bool(r[2]) for r in rows)
                passed_types = sorted({r[1] for r in rows if r[2] and r[3] == 0})
                due = (now + timedelta(days=7 if feedback.correct else 1)).strftime("%Y-%m-%d %H:%M:%S")
                conn.execute(
                    "INSERT OR IGNORE INTO learner_objective_states (objective_id) VALUES (?)",
                    (item["objective_id"],),
                )
                conn.execute(
                    "UPDATE learner_objective_states SET mastery_state=?, attempts_count=?, correct_count=?, distinct_task_types_passed=?, last_attempt_at=?, next_review_due_at=? WHERE objective_id=?",
                    (state, len(rows), correct_count, json.dumps(passed_types), timestamp, due, item["objective_id"]),
                )

                # Per-module mastery isolation (Safeguard Requirement #3 & User Approval Condition #1)
                if self._has_module_isolation_tables(conn):
                    qml_row = conn.execute(
                        "SELECT module_number, worked_example_id, portfolio_category "
                        "FROM question_module_links WHERE question_id = ?",
                        (item["id"],),
                    ).fetchone()
                    target_mod: int | None = None
                    ex_id = str(item.get("worked_example_id") or "")
                    port_cat = str(item.get("portfolio_category") or "")
                    if qml_row is not None:
                        target_mod = int(qml_row[0])
                        ex_id = str(qml_row[1] or ex_id)
                        port_cat = str(qml_row[2] or port_cat)
                    elif module_number is not None:
                        target_mod = int(module_number)
                    elif type(item.get("module_number")) is int:
                        target_mod = int(item["module_number"])
                    else:
                        prim = conn.execute(
                            "SELECT module_number FROM syllabus_objective_map "
                            "WHERE objective_id = ? ORDER BY is_primary_module DESC, module_number ASC LIMIT 1",
                            (item["objective_id"],),
                        ).fetchone()
                        if prim is not None:
                            target_mod = int(prim[0])

                    if target_mod is not None:
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO attempt_module_links (
                                attempt_id, module_number, objective_id,
                                question_id, worked_example_id, portfolio_category
                            ) VALUES (?, ?, ?, ?, ?, ?);
                            """,
                            (
                                attempt_id,
                                target_mod,
                                item["objective_id"],
                                item["id"],
                                ex_id,
                                port_cat,
                            ),
                        )
                        mod_rows = [
                            tuple(r)
                            for r in conn.execute(
                                """
                                SELECT a.question_id, a.task_type, a.is_correct, a.hints_used, a.attempted_at
                                FROM attempt_evidence a
                                JOIN attempt_module_links aml ON aml.attempt_id = a.id
                                WHERE aml.module_number = ? AND aml.objective_id = ?
                                ORDER BY a.attempted_at, a.id
                                """,
                                (target_mod, item["objective_id"]),
                            )
                        ]
                        mod_state = mastery_from_evidence(mod_rows)
                        mod_correct = sum(bool(r[2]) for r in mod_rows)
                        mod_passed_types = sorted({r[1] for r in mod_rows if r[2] and r[3] == 0})
                        conn.execute(
                            """
                            INSERT INTO module_objective_states (
                                module_number, objective_id, mastery_state,
                                attempts_count, correct_count, distinct_task_types_passed,
                                last_attempt_at, next_review_due_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(module_number, objective_id) DO UPDATE SET
                                mastery_state = excluded.mastery_state,
                                attempts_count = excluded.attempts_count,
                                correct_count = excluded.correct_count,
                                distinct_task_types_passed = excluded.distinct_task_types_passed,
                                last_attempt_at = excluded.last_attempt_at,
                                next_review_due_at = excluded.next_review_due_at;
                            """,
                            (
                                target_mod,
                                item["objective_id"],
                                mod_state,
                                len(mod_rows),
                                mod_correct,
                                json.dumps(mod_passed_types),
                                timestamp,
                                due,
                            ),
                        )
                        if ex_id and feedback.correct and help_count == 0:
                            conn.execute(
                                "UPDATE syllabus_worked_examples SET learner_status = 'Completed', completed_at = ? WHERE id = ?",
                                (timestamp, ex_id),
                            )
                        if mod_state in ("Provisional", "Secure"):
                            conn.execute(
                                """
                                UPDATE syllabus_worked_examples
                                SET learner_status = 'Completed',
                                    completed_at = COALESCE(completed_at, ?)
                                WHERE module_number = ?
                                  AND linked_objective_id = ?
                                  AND COALESCE(reference_verification_status, '') != 'REFERENCE_VERIFICATION_REQUIRED'
                                """,
                                (timestamp, target_mod, item["objective_id"]),
                            )
                        state = mod_state
        return feedback, state

    def get_misconception_detail(self, misconception_id: str | None) -> dict | None:
        """Fetch structured misconception explanation and remediation strategy."""
        if not misconception_id:
            return None
        with closing(self.connect()) as conn:
            row = conn.execute(
                "SELECT id, category, title, description, remediation_strategy FROM misconceptions WHERE id = ?",
                (misconception_id,),
            ).fetchone()
            if not row:
                return None
            return {
                "id": row[0],
                "category": row[1],
                "title": row[2],
                "description": row[3],
                "remediation_strategy": row[4],
            }

    def recommend_remedial(
        self,
        question_id: str,
        misconception_id: str | None = None,
        module_number: int | None = None,
    ) -> dict | None:
        """
        Recommend a targeted remedial or guided practice item when a learner makes an error
        or triggers a known misconception (Safeguard Requirement #5).
        """
        with closing(self.connect()) as conn:
            row = conn.execute(
                "SELECT objective_id, payload_json FROM questions WHERE id = ?",
                (question_id,),
            ).fetchone()
            if not row:
                return None
            obj_id = row[0]
            if self._has_module_isolation_tables(conn):
                if misconception_id:
                    rem_row = conn.execute(
                        """
                        SELECT q.payload_json
                        FROM questions q
                        JOIN question_module_links qml ON qml.question_id = q.id
                        WHERE q.id != ? AND qml.remedial_for_misconception_id = ?
                        ORDER BY CASE WHEN qml.module_number = COALESCE(?, qml.module_number) THEN 0 ELSE 1 END ASC,
                                 CASE qml.teaching_stage WHEN 'guided' THEN 0 ELSE 1 END ASC,
                                 q.difficulty ASC, q.id ASC
                        LIMIT 1
                        """,
                        (question_id, misconception_id, module_number),
                    ).fetchone()
                    if rem_row:
                        return validate_item(json.loads(rem_row[0]), self.convert)
                if module_number is not None:
                    mod_row = conn.execute(
                        """
                        SELECT q.payload_json
                        FROM questions q
                        JOIN question_module_links qml ON qml.question_id = q.id
                        WHERE q.id != ? AND qml.module_number = ? AND q.objective_id = ?
                        ORDER BY CASE qml.teaching_stage WHEN 'guided' THEN 0 ELSE 1 END ASC,
                                 q.difficulty ASC, q.id ASC
                        LIMIT 1
                        """,
                        (question_id, int(module_number), obj_id),
                    ).fetchone()
                    if mod_row:
                        return validate_item(json.loads(mod_row[0]), self.convert)
            fallback = conn.execute(
                "SELECT payload_json FROM questions WHERE id != ? AND objective_id = ? AND id LIKE 'P2-%' ORDER BY difficulty ASC, id ASC LIMIT 1",
                (question_id, obj_id),
            ).fetchone()
            if fallback:
                return validate_item(json.loads(fallback[0]), self.convert)
            return None

    def recent_attempts(self, limit: int = 10) -> list[tuple]:
        with closing(self.connect()) as conn:
            return [
                tuple(r)
                for r in conn.execute(
                    "SELECT attempted_at, objective_id, question_id, is_correct, hints_used, misconception_id FROM attempt_evidence ORDER BY id DESC LIMIT ?",
                    (max(1, min(int(limit), 100)),),
                )
            ]

    def recommend(self, selected_objective: str | None = None, module_number: int | None = None) -> tuple[str, str, str] | None:
        """Return objective, question and transparent rationale; learner can override."""
        with closing(self.connect()) as conn:
            if module_number is not None and self._has_module_isolation_tables(conn):
                avail_rows = conn.execute(
                    """
                    SELECT o.id, COALESCE(ms.mastery_state, 'Not assessed')
                    FROM syllabus_objective_map m
                    JOIN curriculum_objectives o ON o.id = m.objective_id
                    LEFT JOIN module_objective_states ms
                      ON ms.module_number = m.module_number AND ms.objective_id = m.objective_id
                    WHERE m.module_number = ?
                      AND EXISTS (
                        SELECT 1 FROM question_module_links qml
                        WHERE qml.module_number = m.module_number AND qml.objective_id = m.objective_id
                      )
                    ORDER BY o.id ASC
                    """,
                    (int(module_number),),
                ).fetchall()
                if avail_rows:
                    available = [tuple(r) for r in avail_rows]
                    states = dict(available)
                    chosen = (
                        selected_objective
                        if selected_objective in states
                        else next((o for o, st in available if st != "Secure"), available[0][0])
                    )
                    last = conn.execute(
                        """
                        SELECT a.is_correct, a.hints_used
                        FROM attempt_evidence a
                        JOIN attempt_module_links aml ON aml.attempt_id = a.id
                        WHERE aml.module_number = ? AND aml.objective_id = ?
                        ORDER BY a.id DESC LIMIT 1
                        """,
                        (int(module_number), chosen),
                    ).fetchone()
                    if last and not last[0]:
                        why = f"Module {module_number}: most recent attempt on {chosen} was incorrect; review the worked example or try a guided item."
                    elif last and last[1]:
                        why = f"Module {module_number}: most recent attempt on {chosen} used hints; complete an independent item without hints to advance mastery."
                    elif states[chosen] == "Not assessed":
                        why = f"Module {module_number}: objective {chosen} has not yet been assessed in this module."
                    else:
                        why = f"Module {module_number}: continue practising {chosen} across guided and independent task types."
                    candidates = [
                        tuple(r)
                        for r in conn.execute(
                            """
                            SELECT q.id, COUNT(a.id) AS n, MAX(a.id) AS last_id
                            FROM questions q
                            JOIN question_module_links qml ON qml.question_id = q.id
                            LEFT JOIN attempt_evidence a ON a.question_id = q.id
                            WHERE qml.module_number = ? AND q.objective_id = ? AND q.id LIKE 'P2-%'
                            GROUP BY q.id
                            ORDER BY n ASC,
                                     CASE qml.teaching_stage WHEN 'guided' THEN 0 ELSE 1 END ASC,
                                     COALESCE(last_id, 0) ASC,
                                     q.id ASC
                            """,
                            (int(module_number), chosen),
                        )
                    ]
                    if candidates:
                        return chosen, candidates[0][0], why

            if self._has_syllabus_map(conn):
                avail_query = (
                    "SELECT o.id, COALESCE(s.mastery_state, 'Not assessed') "
                    "FROM curriculum_objectives o "
                    "JOIN questions q ON q.objective_id=o.id "
                    "LEFT JOIN learner_objective_states s ON s.objective_id=o.id "
                    "LEFT JOIN syllabus_objective_map m ON m.objective_id=o.id "
                    "WHERE q.id LIKE 'P2-%' "
                    "GROUP BY o.id, s.mastery_state "
                    "ORDER BY COALESCE(MIN(m.module_number), 999) ASC, o.id ASC"
                )
            else:
                avail_query = (
                    "SELECT DISTINCT o.id, COALESCE(s.mastery_state, 'Not assessed') "
                    "FROM curriculum_objectives o "
                    "JOIN questions q ON q.objective_id=o.id "
                    "LEFT JOIN learner_objective_states s ON s.objective_id=o.id "
                    "WHERE q.id LIKE 'P2-%' ORDER BY o.id"
                )
            available = [tuple(r) for r in conn.execute(avail_query)]
            if not available:
                return None
            states = dict(available)
            chosen = selected_objective if selected_objective in states else next((o for o, state in available if state != 'Secure'), available[0][0])
            prereqs = [r[0] for r in conn.execute("SELECT prerequisite_id FROM objective_prerequisites WHERE objective_id=? ORDER BY prerequisite_id", (chosen,))]
            weak = next((p for p in prereqs if p in states and states[p] in ('Not assessed', 'Emerging')), None)
            if weak:
                chosen = weak
                why = "A supported prerequisite is not yet assessed or is emerging; you can override this recommendation."
            else:
                last = conn.execute("SELECT is_correct, hints_used FROM attempt_evidence WHERE objective_id=? ORDER BY id DESC LIMIT 1", (chosen,)).fetchone()
                if last and not last[0]:
                    why = "The most recent attempt on this objective was incorrect; try a related item or revisit the explanation."
                elif last and last[1]:
                    why = "The most recent attempt used help; a related independent attempt can strengthen the evidence."
                elif states[chosen] == 'Not assessed':
                    why = "This supported objective has not yet been assessed."
                else:
                    why = "Continue with another item to collect evidence across task types."
                unsupported = [p for p in prereqs if p not in states]
                if unsupported:
                    why += " Some prerequisites have no Phase 2 practice items yet: " + ", ".join(unsupported) + "."
            candidates = [tuple(r) for r in conn.execute("SELECT q.id, COUNT(a.id) AS n, MAX(a.id) AS last_id FROM questions q LEFT JOIN attempt_evidence a ON a.question_id=q.id WHERE q.objective_id=? AND q.id LIKE 'P2-%' GROUP BY q.id ORDER BY n ASC, COALESCE(last_id, 0) ASC, q.id ASC", (chosen,))]
            if not candidates:
                return None
            return chosen, candidates[0][0], why


