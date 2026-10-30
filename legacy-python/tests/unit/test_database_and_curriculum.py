"""Automated unit tests for SQLite initialization, DAG validation, and non-destructive seeding."""

from __future__ import annotations

from pathlib import Path
import pytest

from structtutor.config import AppConfig, MasteryState, ProvenanceType
from structtutor.domain.curriculum import (
    CurriculumGraphError,
    LearningObjective,
    validate_curriculum_dag,
)
from structtutor.storage.database import DatabaseManager
from structtutor.storage.repositories import CurriculumRepository


def test_curriculum_dag_cycle_detection() -> None:
    """Verify that circular prerequisite dependencies are rejected."""
    cyclic_objectives = [
        LearningObjective(
            id="OBJ-1",
            domain_code="A",
            domain_title="Test",
            title="One",
            observable_competency="Comp 1",
            why_it_matters="Why 1",
            prerequisite_ids=["OBJ-2"],
        ),
        LearningObjective(
            id="OBJ-2",
            domain_code="A",
            domain_title="Test",
            title="Two",
            observable_competency="Comp 2",
            why_it_matters="Why 2",
            prerequisite_ids=["OBJ-1"],
        ),
    ]
    with pytest.raises(CurriculumGraphError, match="Circular prerequisite"):
        validate_curriculum_dag(cyclic_objectives)


def test_database_initialization_and_idempotent_seeding(tmp_path: Path) -> None:
    """
    Verify that:
    1. Database initializes cleanly and seeds all 8 domains (A-H).
    2. Re-initializing does NOT overwrite existing learner mastery state.
    """
    config = AppConfig.load(custom_data_dir=tmp_path)
    db = DatabaseManager(config.db_path)
    db.initialize(starter_curriculum_path=config.starter_curriculum_path)

    repo = CurriculumRepository(db)
    objectives = repo.list_objectives()
    assert len(objectives) == 19

    domain_codes = {o.domain_code for o in objectives}
    assert domain_codes == {"A", "B", "C", "D", "E", "F", "G", "H"}

    # Verify starter provenance is marked explicitly as unreconciled baseline
    assert all(o.provenance == ProvenanceType.STARTER_CURRICULUM_UNRECONCILED for o in objectives)

    # Simulate learner progressing on MATH-01 to Provisional
    with db.connect() as conn:
        conn.execute(
            "UPDATE learner_objective_states SET mastery_state = ? WHERE objective_id = 'MATH-01';",
            (MasteryState.PROVISIONAL.value,),
        )
        conn.commit()

    # Re-run initialization (simulating app restart)
    db.initialize(starter_curriculum_path=config.starter_curriculum_path)

    updated_objectives = {o.id: o for o in repo.list_objectives()}
    assert updated_objectives["MATH-01"].mastery_state == MasteryState.PROVISIONAL