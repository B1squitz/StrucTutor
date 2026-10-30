"""Domain models and graph validation for the competency-based curriculum."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set

from structtutor.config import MasteryState, ProvenanceType


class CurriculumGraphError(ValueError):
    """Raised when the curriculum prerequisite graph is invalid or contains a cycle."""


@dataclass(frozen=True)
class MisconceptionDef:
    """Structured definition of a recurring structural engineering misconception."""

    id: str
    category: str
    title: str
    description: str
    remediation_strategy: str


@dataclass
class LearningObjective:
    """A single observable competency node in the curriculum DAG."""

    id: str
    domain_code: str
    domain_title: str
    title: str
    observable_competency: str
    why_it_matters: str
    prerequisite_ids: List[str] = field(default_factory=list)
    target_balance: str = "50% Conceptual / 50% Calculation"
    provenance: ProvenanceType = ProvenanceType.STARTER_CURRICULUM_UNRECONCILED
    mastery_state: MasteryState = MasteryState.NOT_ASSESSED


def validate_curriculum_dag(objectives: List[LearningObjective]) -> None:
    """
    Verify that:
    1. All objective IDs are unique.
    2. Every prerequisite_id references an existing objective ID.
    3. The prerequisite graph is a valid Directed Acyclic Graph (no circular dependencies).
    """
    by_id: Dict[str, LearningObjective] = {}
    for obj in objectives:
        if obj.id in by_id:
            raise CurriculumGraphError(f"Duplicate objective ID: '{obj.id}'.")
        by_id[obj.id] = obj

    for obj in objectives:
        for prereq_id in obj.prerequisite_ids:
            if prereq_id not in by_id:
                raise CurriculumGraphError(
                    f"Objective '{obj.id}' references unknown prerequisite '{prereq_id}'."
                )

    # Cycle detection via depth-first search (0=unvisited, 1=visiting, 2=visited)
    state: Dict[str, int] = {obj_id: 0 for obj_id in by_id}

    def dfs(node_id: str, path: Set[str]) -> None:
        state[node_id] = 1
        for prereq_id in by_id[node_id].prerequisite_ids:
            if state[prereq_id] == 1:
                raise CurriculumGraphError(
                    f"Circular prerequisite dependency detected involving '{node_id}' -> '{prereq_id}'."
                )
            if state[prereq_id] == 0:
                dfs(prereq_id, path | {prereq_id})
        state[node_id] = 2

    for obj_id in by_id:
        if state[obj_id] == 0:
            dfs(obj_id, {obj_id})