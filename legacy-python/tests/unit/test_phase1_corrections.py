"""Regression coverage for the focused Phase 1 correction pass."""

import math
import sqlite3

import pytest

from structtutor.config import ProvenanceType
from structtutor.domain.quantities import (
    Quantity,
    QuantityKind,
    SemanticQuantityMismatchError,
    diagnose_unit_scale_error,
)
from structtutor.domain.units import DimensionalError, UnitParseError
from structtutor.storage import migrations


def test_youngs_and_shear_modulus_have_distinct_semantics():
    e = Quantity(210, "GPa", QuantityKind.YOUNGS_MODULUS)
    g = Quantity(81, "GPa", QuantityKind.SHEAR_MODULUS)
    assert QuantityKind.YOUNGS_MODULUS is QuantityKind.ELASTIC_MODULUS
    assert e.kind is not g.kind
    assert e.kind.value.symbols == ("E",)
    assert g.kind.value.symbols == ("G",)
    assert math.isclose(e.to("N/mm²").value, 210000)
    assert math.isclose(g.to("MPa").value, 81000)


def test_youngs_and_shear_moduli_cannot_be_combined():
    e = Quantity(210, "GPa", QuantityKind.ELASTIC_MODULUS)
    g = Quantity(81, "GPa", QuantityKind.SHEAR_MODULUS)
    with pytest.raises(SemanticQuantityMismatchError):
        _ = e + g
    with pytest.raises(SemanticQuantityMismatchError):
        _ = e - g
    with pytest.raises(SemanticQuantityMismatchError):
        _ = e + Quantity(355, "MPa", QuantityKind.STRESS)


def test_moduli_reject_incompatible_and_unknown_units():
    for kind in (QuantityKind.ELASTIC_MODULUS, QuantityKind.SHEAR_MODULUS):
        with pytest.raises(DimensionalError):
            Quantity(1, "kN", kind)
        with pytest.raises(UnitParseError):
            Quantity(1, "not-a-unit", kind)


def test_scale_diagnostic_recognises_equivalent_units():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    assert diagnose_unit_scale_error(27, expected, learner_unit="MPa") is None
    assert diagnose_unit_scale_error(0.027, expected, learner_unit="GPa") is None
    assert diagnose_unit_scale_error(27000, expected, learner_unit="kPa") is None
    expected_gpa = expected.to("GPa")
    assert diagnose_unit_scale_error(27, expected_gpa, learner_unit="N/mm²") is None


def test_scale_diagnostic_detects_real_error_after_conversion():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    message = diagnose_unit_scale_error(0.000027, expected, learner_unit="GPa")
    assert message is not None and "10³" in message


def test_scale_diagnostic_old_call_and_tolerance_still_work():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    assert "10⁶" in diagnose_unit_scale_error(2.7e-5, expected)
    assert diagnose_unit_scale_error(27.27, expected, 0.02) is None


def test_scale_diagnostic_validates_supplied_units_even_for_zero():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    with pytest.raises(DimensionalError):
        diagnose_unit_scale_error(0, expected, learner_unit="kN")
    with pytest.raises(UnitParseError):
        diagnose_unit_scale_error(27, expected, learner_unit="nope")


def test_scale_diagnostic_is_not_a_complete_answer_checker():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    assert diagnose_unit_scale_error(-27, expected, learner_unit="MPa") is None
    assert diagnose_unit_scale_error(0, expected, learner_unit="MPa") is None
    assert diagnose_unit_scale_error(0, Quantity(0, "MPa", QuantityKind.STRESS)) is None


def test_scale_diagnostic_rejects_nonfinite_values_and_bad_tolerance():
    expected = Quantity(27, "MPa", QuantityKind.STRESS)
    for value in (float("nan"), float("inf"), -float("inf")):
        with pytest.raises(ValueError):
            diagnose_unit_scale_error(value, expected)
    with pytest.raises(ValueError):
        diagnose_unit_scale_error(27, expected, -0.1)


def _insert_saved(conn, title, provenance=None):
    columns = "calc_type, title, inputs_json, results_json, sign_convention_id, solver_version"
    values = ("bending", title, "{}", "{}", "UK_TENSION_FACE_STANDARD", "0.1")
    if provenance is None:
        conn.execute(f"INSERT INTO saved_calculations ({columns}) VALUES (?, ?, ?, ?, ?, ?)", values)
    else:
        conn.execute(f"INSERT INTO saved_calculations ({columns}, provenance) VALUES (?, ?, ?, ?, ?, ?, ?)", values + (provenance,))


def test_fresh_database_has_provenance_and_migrations_are_idempotent():
    with sqlite3.connect(":memory:") as conn:
        migrations.apply_migrations(conn)
        migrations.apply_migrations(conn)
        versions = [row[0] for row in conn.execute("SELECT version FROM schema_migrations ORDER BY version")]
        assert versions == [1, 2]
        _insert_saved(conn, "Explicit", ProvenanceType.PYTHON_DETERMINISTIC.value)
        _insert_saved(conn, "Unspecified")
        rows = list(conn.execute("SELECT title, provenance FROM saved_calculations ORDER BY id"))
        assert rows == [("Explicit", "PYTHON_DETERMINISTIC"), ("Unspecified", "UNKNOWN")]
        assert ProvenanceType("UNKNOWN").human_label == "Unknown / Not Recorded"


def test_upgrade_from_migration_one_preserves_records_and_marks_unknown():
    with sqlite3.connect(":memory:") as conn:
        conn.execute("CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, description TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (datetime('now')))")
        conn.executescript(migrations.MIGRATIONS[0][2])
        conn.execute("INSERT INTO schema_migrations (version, description) VALUES (1, 'already applied')")
        _insert_saved(conn, "Legacy")
        conn.commit()
        migrations.apply_migrations(conn)
        assert conn.execute("SELECT title, provenance FROM saved_calculations").fetchone() == ("Legacy", "UNKNOWN")
        assert list(conn.execute("SELECT version FROM schema_migrations ORDER BY version")) == [(1,), (2,)]
        migrations.apply_migrations(conn)
        assert conn.execute("SELECT COUNT(*) FROM saved_calculations").fetchone()[0] == 1


def test_saved_calculation_provenance_rejects_invalid_values():
    with sqlite3.connect(":memory:") as conn:
        migrations.apply_migrations(conn)
        for value in ("invented", ""):
            with pytest.raises(sqlite3.IntegrityError):
                _insert_saved(conn, "Bad", value)
        with pytest.raises(sqlite3.IntegrityError):
            conn.execute("INSERT INTO saved_calculations (calc_type, title, inputs_json, results_json, sign_convention_id, solver_version, provenance) VALUES ('x', 'x', '{}', '{}', 'x', 'x', NULL)")


def test_failing_migration_rolls_back_schema_and_version(monkeypatch):
    with sqlite3.connect(":memory:") as conn:
        migrations.apply_migrations(conn)
        bad = (3, "test failure", "ALTER TABLE saved_calculations ADD COLUMN temporary_test TEXT; INSERT INTO no_such_table VALUES (1);")
        monkeypatch.setattr(migrations, "MIGRATIONS", migrations.MIGRATIONS + [bad])
        with pytest.raises(sqlite3.OperationalError):
            migrations.apply_migrations(conn)
        names = [row[1] for row in conn.execute("PRAGMA table_info(saved_calculations)")]
        assert "temporary_test" not in names
        assert conn.execute("SELECT COUNT(*) FROM schema_migrations WHERE version=3").fetchone()[0] == 0
