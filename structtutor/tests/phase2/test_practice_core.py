"""Standalone Phase 2 tests; only the newly written core is imported.

The SQLite fixture reproduces the Phase 1 columns used by practice; it does not
execute the supplied Phase 1 migration or GUI. Python's unittest can run this
file without pytest or PySide6.
"""
from __future__ import annotations

import copy
import importlib.util
import json
import math
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

ROOT = Path(__file__).resolve().parents[2]
CORE = ROOT / "src/structtutor/domain/practice_core.py"
BANK = ROOT / "src/structtutor/content/phase2_questions.json"
spec = importlib.util.spec_from_file_location("phase2_standalone_core", CORE)
core = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = core
spec.loader.exec_module(core)

# An independently authored test converter for the bank's limited units.
UNITS = {
    "N·mm": ("moment", 1), "N·m": ("moment", 1000), "kN·m": ("moment", 1000000),
    "N": ("force", 1), "kN": ("force", 1000), "MN": ("force", 1000000),
    "MPa": ("stress", 1), "GPa": ("stress", 1000), "N/mm²": ("stress", 1),
    "mm²": ("area", 1), "cm²": ("area", 100), "m²": ("area", 1000000),
}


def convert(value, source, target):
    try:
        src_dim, src = UNITS[source]
        dst_dim, dst = UNITS[target]
    except KeyError as exc:
        raise ValueError("unknown unit") from exc
    if src_dim != dst_dim:
        raise ValueError("incompatible unit")
    return value * src / dst


SCHEMA = """
PRAGMA foreign_keys=ON;
CREATE TABLE curriculum_objectives (id TEXT PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE misconceptions (id TEXT PRIMARY KEY);
CREATE TABLE objective_prerequisites (objective_id TEXT NOT NULL, prerequisite_id TEXT NOT NULL, PRIMARY KEY(objective_id, prerequisite_id));
CREATE TABLE learner_objective_states (
 objective_id TEXT PRIMARY KEY, mastery_state TEXT NOT NULL DEFAULT 'Not assessed',
 attempts_count INTEGER NOT NULL DEFAULT 0, correct_count INTEGER NOT NULL DEFAULT 0,
 distinct_task_types_passed TEXT NOT NULL DEFAULT '[]', last_attempt_at TEXT, next_review_due_at TEXT, notes TEXT);
CREATE TABLE questions (
 id TEXT PRIMARY KEY, objective_id TEXT NOT NULL, title TEXT NOT NULL, task_type TEXT NOT NULL,
 difficulty INTEGER NOT NULL, payload_json TEXT NOT NULL, provenance TEXT NOT NULL,
 verification_status TEXT NOT NULL, version INTEGER NOT NULL,
 FOREIGN KEY(objective_id) REFERENCES curriculum_objectives(id));
CREATE TABLE attempt_evidence (
 id INTEGER PRIMARY KEY AUTOINCREMENT, question_id TEXT NOT NULL, objective_id TEXT NOT NULL,
 task_type TEXT NOT NULL, difficulty INTEGER NOT NULL, is_correct INTEGER NOT NULL,
 hints_used INTEGER NOT NULL DEFAULT 0, misconception_id TEXT, confidence_rating TEXT,
 user_answer TEXT, feedback_summary TEXT, marking_method TEXT NOT NULL,
 attempted_at TEXT NOT NULL, FOREIGN KEY(objective_id) REFERENCES curriculum_objectives(id));
"""


class Phase2CoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=ROOT / "tests")
        self.path = Path(self.temp.name) / "practice.db"
        with self.connect() as conn:
            conn.executescript(SCHEMA)
            conn.executemany("INSERT INTO curriculum_objectives (id,title) VALUES (?,?)", [
                ("MATH-01", "Units"), ("STAT-01", "Supports"), ("STAT-02", "Equilibrium")])
            conn.executemany("INSERT INTO misconceptions (id) VALUES (?)", [("MISC-STAT-FBD-OMITTED-REACTION",), ("MISC-STAT-MOMENT-ARM-TRIG",)])
            conn.executemany("INSERT INTO objective_prerequisites VALUES (?,?)", [
                ("STAT-01", "MATH-01"), ("STAT-01", "MATH-02"), ("STAT-02", "STAT-01")])
        self.svc = core.PracticeService(self.connect, convert)
        self.svc.seed(BANK)
        self.t0 = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)

    def tearDown(self):
        self.temp.cleanup()

    def connect(self):
        con = sqlite3.connect(self.path)
        con.execute("PRAGMA foreign_keys=ON")
        return con

    def item(self, qid):
        return next(q for q in core.load_bank(BANK, convert) if q["id"] == qid)

    def test_seed_has_nine_valid_unique_items(self):
        items = core.load_bank(BANK, convert)
        self.assertEqual(len(items), 9)
        self.assertEqual(len({q["id"] for q in items}), 9)
        self.assertEqual(len(self.svc.objectives()), 3)

    def test_all_numerical_expected_values_independently_calculated(self):
        expected = {"P2-UNITS-01": 3 * 1000 * 1000, "P2-UNITS-02": 27 / 1000,
                    "P2-UNITS-03": 4 * 10**2, "P2-EQ-01": 24 * 2 / 6,
                    "P2-EQ-02": 24 * 4 / 6}
        for qid, value in expected.items():
            q = self.item(qid)
            self.assertTrue(math.isclose(q["answer"], value), qid)
            self.assertTrue(core.mark(q, str(value), q["unit"], convert).correct)

    def test_choice_keys_and_hints(self):
        q = self.item("P2-FBD-01")
        self.assertTrue(core.mark(q, "a", None, convert).correct)
        wrong = core.mark(q, "c", None, convert)
        self.assertFalse(wrong.correct)
        self.assertEqual(wrong.misconception_id, "MISC-STAT-FBD-OMITTED-REACTION")
        self.assertGreaterEqual(len(q["hints"]), 2)

    def test_unknown_cause_not_overdiagnosed(self):
        f = core.mark(self.item("P2-FBD-01"), "b", None, convert)
        self.assertFalse(f.correct)
        self.assertIsNone(f.misconception_id)

    def test_equivalent_units_are_accepted(self):
        q = self.item("P2-UNITS-02")
        for value, unit in (("0.027", "GPa"), ("27", "MPa"), ("27", "N/mm²")):
            self.assertTrue(core.mark(q, value, unit, convert).correct)
        self.assertFalse(core.mark(q, "-27", "MPa", convert).correct)

    def test_real_unit_scale_error_detected_after_conversion(self):
        q = self.item("P2-UNITS-02")
        f = core.mark(q, "0.000027", "GPa", convert)
        self.assertFalse(f.correct)
        self.assertIn("10^-3", f.message)

    def test_invalid_numeric_and_units_never_saved(self):
        for answer, unit in (("nan", "MPa"), ("inf", "MPa"), ("abc", "MPa"), ("27", "kN")):
            with self.assertRaises(core.PracticeError):
                self.svc.submit("P2-UNITS-02", answer, unit, 0)
        self.assertEqual(self.svc.recent_attempts(), [])

    def test_choice_without_selection_not_saved(self):
        with self.assertRaises(core.PracticeError):
            self.svc.submit("P2-FBD-01", "", None, 0)
        self.assertEqual(self.svc.recent_attempts(), [])

    def test_attempt_survives_new_service_and_connection(self):
        feedback, state = self.svc.submit("P2-EQ-01", "8", "kN", 0, "High", self.t0)
        self.assertTrue(feedback.correct)
        self.assertEqual(state, "Developing")
        other = core.PracticeService(self.connect, convert)
        self.assertEqual(other.recent_attempts()[0][2], "P2-EQ-01")
        self.assertEqual(dict((a, c) for a, b, c in other.objectives())["STAT-02"], "Developing")

    def test_wrong_option_and_confidence_recorded(self):
        feedback, state = self.svc.submit("P2-FBD-01", "c", None, 0, "Low", self.t0)
        self.assertEqual(state, "Emerging")
        self.assertFalse(feedback.correct)
        with self.connect() as conn:
            row = conn.execute("SELECT misconception_id, confidence_rating, marking_method FROM attempt_evidence").fetchone()
        self.assertEqual(row, ("MISC-STAT-FBD-OMITTED-REACTION", "Low", "deterministic_choice"))

    def test_helped_correct_does_not_count_as_independent(self):
        _, state = self.svc.submit("P2-EQ-01", "8", "kN", 1, now=self.t0)
        self.assertEqual(state, "Emerging")
        self.assertEqual(self.svc.recent_attempts()[0][4], 1)

    def test_one_correct_never_secure(self):
        _, state = self.svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, now=self.t0)
        self.assertEqual(state, "Developing")

    def test_distinct_types_then_delayed_retrieval(self):
        self.svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, now=self.t0)
        _, state = self.svc.submit("P2-UNITS-02", "27", "MPa", 0, now=self.t0 + timedelta(minutes=1))
        self.assertEqual(state, "Provisional")
        _, state = self.svc.submit("P2-UNITS-03", "400", "mm²", 0, now=self.t0 + timedelta(minutes=2))
        self.assertEqual(state, "Provisional")
        _, state = self.svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, now=self.t0 + timedelta(hours=25))
        self.assertEqual(state, "Secure")
        _, state = self.svc.submit("P2-UNITS-01", "1000000", "N·mm", 0, now=self.t0 + timedelta(hours=26))
        self.assertNotEqual(state, "Secure")

    def test_repetition_of_one_question_does_not_give_secure(self):
        for hours in (0, 25, 50):
            _, state = self.svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, now=self.t0 + timedelta(hours=hours))
        self.assertEqual(state, "Developing")

    def test_unassessed_prerequisite_is_recommended_but_not_enforced(self):
        rec = self.svc.recommend("STAT-02")
        self.assertEqual(rec[0], "STAT-01")
        self.assertIn("prerequisite", rec[2])
        # The user can still answer the chosen advanced topic.
        self.assertTrue(self.svc.submit("P2-EQ-01", "8", "kN", 0, now=self.t0)[0].correct)

    def test_selects_unseen_item_after_attempt(self):
        first = self.svc.recommend("MATH-01")
        self.svc.submit(first[1], "3000000", "N·mm", 0, now=self.t0)
        second = self.svc.recommend("MATH-01")
        self.assertNotEqual(first[1], second[1])

    def test_invalid_bank_rejected_without_partial_seed(self):
        data = json.loads(BANK.read_text(encoding="utf-8"))
        data["questions"][1]["unit_choices"] = ["kN"]
        bad = Path(self.temp.name) / "bad.json"
        bad.write_text(json.dumps(data), encoding="utf-8")
        with self.connect() as conn:
            conn.execute("DELETE FROM questions")
        with self.assertRaises(core.PracticeError):
            self.svc.seed(bad)
        with self.connect() as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0], 0)

    def test_seeding_does_not_replace_existing_question(self):
        with self.connect() as conn:
            conn.execute("UPDATE questions SET title='Existing custom title' WHERE id='P2-UNITS-01'")
        self.svc.seed(BANK)
        with self.connect() as conn:
            title = conn.execute("SELECT title FROM questions WHERE id='P2-UNITS-01'").fetchone()[0]
        self.assertEqual(title, "Existing custom title")

    def test_missing_objective_rejected_without_inserts(self):
        data = json.loads(BANK.read_text(encoding="utf-8"))
        data["questions"][0]["objective_id"] = "NO-SUCH-OBJECTIVE"
        bad = Path(self.temp.name) / "missing.json"
        bad.write_text(json.dumps(data), encoding="utf-8")
        with self.assertRaises(core.PracticeError):
            self.svc.seed(bad)
        with self.connect() as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0], 9)

    def test_database_error_rolls_back_attempt_and_state(self):
        with self.connect() as conn:
            conn.execute("CREATE TRIGGER reject_state BEFORE UPDATE ON learner_objective_states BEGIN SELECT RAISE(ABORT, 'blocked'); END")
        with self.assertRaises(sqlite3.IntegrityError):
            self.svc.submit("P2-EQ-01", "8", "kN", 0, now=self.t0)
        self.assertEqual(self.svc.recent_attempts(), [])

    def test_unknown_misconception_mapping_is_rejected(self):
        data = json.loads(BANK.read_text(encoding="utf-8"))
        item = next(q for q in data["questions"] if q["id"] == "P2-FBD-01")
        item["wrong_misconceptions"]["c"] = "NO-SUCH-MISCONCEPTION"
        path = Path(self.temp.name) / "bad-misc.json"
        path.write_text(json.dumps(data), encoding="utf-8")
        with self.assertRaises(core.PracticeError):
            self.svc.seed(path)

    def test_tampered_stored_question_identity_is_rejected(self):
        with self.connect() as conn:
            raw = conn.execute("SELECT payload_json FROM questions WHERE id='P2-UNITS-01'").fetchone()[0]
            item = json.loads(raw)
            item["objective_id"] = "STAT-01"
            conn.execute("UPDATE questions SET payload_json=? WHERE id='P2-UNITS-01'", (json.dumps(item),))
        with self.assertRaises(core.PracticeError):
            self.svc.submit("P2-UNITS-01", "3000000", "N·mm", 0, now=self.t0)
        self.assertEqual(self.svc.recent_attempts(), [])

    def test_rejects_tampered_choice_and_bank_metadata(self):
        item = copy.deepcopy(self.item("P2-FBD-01"))
        item["answer"] = "missing"
        with self.assertRaises(core.PracticeError):
            core.validate_item(item, convert)
        item = copy.deepcopy(self.item("P2-FBD-01"))
        item["provenance"] = "VERIFIED_USER_SOURCE"
        with self.assertRaises(core.PracticeError):
            core.validate_item(item, convert)


if __name__ == "__main__":
    unittest.main()
