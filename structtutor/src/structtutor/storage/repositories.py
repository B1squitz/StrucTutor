"""Data-access repositories for curriculum, Master Rebuild Syllabus (Modules 0–19), and learner state."""

from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Dict, List, Optional, Tuple

from structtutor.config import MasteryState, ProvenanceType
from structtutor.domain.curriculum import LearningObjective, MisconceptionDef
from structtutor.domain.syllabus import (
    ContentAvailabilityStatus,
    LessonStage,
    ReferenceProvenance,
    ReferenceVerificationStatus,
    compute_quality_badges,
)
from structtutor.storage.database import DatabaseManager


@dataclass(frozen=True)
class DomainProgressSummary:
    """Aggregated progress and practice availability for a curriculum domain (A–H)."""

    domain_code: str
    domain_title: str
    total_objectives: int
    assessed_objectives: int
    secure_objectives: int
    provisional_objectives: int
    developing_objectives: int
    emerging_objectives: int
    not_assessed_objectives: int
    practice_question_count: int
    first_practice_objective_id: Optional[str]
    lead_objective_id: str
    lead_objective_title: str


@dataclass(frozen=True)
class RecentActivityItem:
    """A single recorded attempt joined with question and objective metadata for the dashboard."""

    attempt_id: int
    attempted_at: str
    question_id: str
    question_title: str
    objective_id: str
    objective_title: str
    domain_code: str
    task_type: str
    is_correct: bool
    hints_used: int
    user_answer: str
    misconception_id: Optional[str]


@dataclass(frozen=True)
class WorkedExampleRecord:
    """Persisted worked example, capstone project, worked project, or practical exercise."""

    id: str
    module_number: int
    code: str
    title: str
    kind: str
    description: str
    linked_objective_id: str
    linked_question_ids: Tuple[str, ...]
    requires_calc_note: bool
    content_status: ContentAvailabilityStatus
    learner_status: str
    completed_at: Optional[str]
    lesson_stage: LessonStage = LessonStage.OUTLINE_ONLY
    worked_example_verified: bool = False
    interactive_practice_available: bool = False
    reference_verification_status: ReferenceVerificationStatus = (
        ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES
    )
    provenance: ReferenceProvenance = ReferenceProvenance()
    plain_explanation: str = ""
    portfolio_category: str = ""

    @property
    def quality_badges(self) -> Tuple[str, ...]:
        return compute_quality_badges(
            self.lesson_stage,
            self.worked_example_verified,
            self.interactive_practice_available,
            self.reference_verification_status,
        )

    @property
    def is_lesson_complete(self) -> bool:
        """
        A worked example / lesson counts as complete only when:
        1. lesson_stage is LESSON_COMPLETE,
        2. worked_example_verified is True,
        3. learner_status is 'Completed',
        4. reference_verification_status is not REFERENCE_VERIFICATION_REQUIRED.
        """
        return (
            self.lesson_stage == LessonStage.LESSON_COMPLETE
            and self.worked_example_verified
            and self.learner_status == "Completed"
            and self.reference_verification_status
            != ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
        )


@dataclass(frozen=True)
class SyllabusModuleSummary:
    """Complete syllabus metadata and live learner progress for one of the 20 modules (0–19)."""

    module_number: int
    code: str
    title: str
    short_title: str
    suggested_duration: str
    year_pathway: str
    year1_months: str
    why_it_matters: str
    prerequisite_module_numbers: Tuple[int, ...]
    mapped_objective_ids: Tuple[str, ...]
    learn_topics: Tuple[str, ...]
    resources: Tuple[str, ...]
    gate_requirements: Tuple[str, ...]
    content_status: ContentAvailabilityStatus
    verification_note: str
    total_objectives: int
    assessed_objectives: int
    secure_objectives: int
    provisional_objectives: int
    worked_example_count: int
    interactive_question_count: int
    first_practice_objective_id: Optional[str]
    lead_objective_id: str
    lead_objective_title: str
    prerequisites_satisfied: bool
    pathway_status_label: str
    lesson_stage: LessonStage = LessonStage.OUTLINE_ONLY
    worked_example_verified: bool = False
    interactive_practice_available: bool = False
    reference_verification_status: ReferenceVerificationStatus = (
        ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES
    )
    provenance: ReferenceProvenance = ReferenceProvenance()
    plain_explanation: str = ""
    completed_worked_examples: int = 0
    is_module_complete: bool = False

    @property
    def quality_badges(self) -> Tuple[str, ...]:
        return compute_quality_badges(
            self.lesson_stage,
            self.worked_example_verified,
            self.interactive_practice_available,
            self.reference_verification_status,
        )


@dataclass(frozen=True)
class PortfolioMilestoneRecord:
    """One of the six integrated portfolio milestones (Milestones A–F) with status."""

    id: str
    code: str
    title: str
    description: str
    required_items: Tuple[Dict[str, object], ...]
    pass_condition: str
    prerequisite_module_numbers: Tuple[int, ...]
    learner_status: str
    completed_at: Optional[str]


@dataclass(frozen=True)
class SyllabusProgressionRecommendation:
    """Deadlock-free recommendation aligned with Module 0 -> Modules 1–8 -> Modules 9–19."""

    recommended_module: SyllabusModuleSummary
    recommended_objective: LearningObjective
    recommended_worked_example: Optional[WorkedExampleRecord]
    interactive_practice_objective_id: Optional[str]
    interactive_practice_question_id: Optional[str]
    rationale: str


class CurriculumRepository:
    """Queries curriculum objectives, Master Syllabus modules (0–19), milestones (A–F), and progress."""

    def __init__(self, db: DatabaseManager) -> None:
        self.db = db

    def list_objectives(self, domain_code: Optional[str] = None) -> List[LearningObjective]:
        with self.db.connect() as conn:
            prereq_rows = conn.execute(
                "SELECT objective_id, prerequisite_id FROM objective_prerequisites ORDER BY prerequisite_id;"
            ).fetchall()
            prereq_map: Dict[str, List[str]] = {}
            for r in prereq_rows:
                prereq_map.setdefault(r["objective_id"], []).append(r["prerequisite_id"])

            query = """
                SELECT
                    o.id, o.domain_code, o.domain_title, o.title,
                    o.observable_competency, o.why_it_matters, o.target_balance, o.provenance,
                    COALESCE(s.mastery_state, 'Not assessed') AS mastery_state
                FROM curriculum_objectives o
                LEFT JOIN learner_objective_states s ON s.objective_id = o.id
            """
            params: tuple = ()
            if domain_code:
                query += " WHERE o.domain_code = ?"
                params = (domain_code,)
            query += " ORDER BY o.domain_code, o.id;"

            rows = conn.execute(query, params).fetchall()
            result: List[LearningObjective] = []
            for row in rows:
                result.append(
                    LearningObjective(
                        id=row["id"],
                        domain_code=row["domain_code"],
                        domain_title=row["domain_title"],
                        title=row["title"],
                        observable_competency=row["observable_competency"],
                        why_it_matters=row["why_it_matters"],
                        prerequisite_ids=prereq_map.get(row["id"], []),
                        target_balance=row["target_balance"],
                        provenance=ProvenanceType(row["provenance"]),
                        mastery_state=MasteryState(row["mastery_state"]),
                    )
                )
            return result

    def get_objective_primary_module_map(self) -> Dict[str, int]:
        """Return a mapping of objective_id -> earliest mapped syllabus module_number (0–19)."""
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabus_objective_map';"
            ).fetchone()
            if tbl is None:
                return {}
            rows = conn.execute(
                """
                SELECT objective_id, MIN(module_number) AS primary_mod
                FROM syllabus_objective_map
                GROUP BY objective_id
                ORDER BY primary_mod, objective_id;
                """
            ).fetchall()
            return {str(r["objective_id"]): int(r["primary_mod"]) for r in rows}

    def list_misconceptions(self) -> List[MisconceptionDef]:
        with self.db.connect() as conn:
            rows = conn.execute(
                "SELECT id, category, title, description, remediation_strategy FROM misconceptions ORDER BY id;"
            ).fetchall()
            return [
                MisconceptionDef(
                    id=r["id"],
                    category=r["category"],
                    title=r["title"],
                    description=r["description"],
                    remediation_strategy=r["remediation_strategy"],
                )
                for r in rows
            ]

    def list_domain_summaries(self) -> List[DomainProgressSummary]:
        """Return real, database-driven progress summaries for every curriculum domain (A–H)."""
        objectives = self.list_objectives()
        with self.db.connect() as conn:
            q_rows = conn.execute(
                """
                SELECT objective_id, COUNT(*) AS q_count
                FROM questions
                WHERE id LIKE 'P2-%'
                GROUP BY objective_id
                ORDER BY objective_id;
                """
            ).fetchall()
        q_counts_by_obj: Dict[str, int] = {r["objective_id"]: int(r["q_count"]) for r in q_rows}

        grouped: Dict[str, List[LearningObjective]] = {}
        for obj in objectives:
            grouped.setdefault(obj.domain_code, []).append(obj)

        summaries: List[DomainProgressSummary] = []
        for domain_code in sorted(grouped.keys()):
            dom_objs = grouped[domain_code]
            domain_title = dom_objs[0].domain_title
            total = len(dom_objs)
            secure = sum(1 for o in dom_objs if o.mastery_state == MasteryState.SECURE)
            provisional = sum(1 for o in dom_objs if o.mastery_state == MasteryState.PROVISIONAL)
            developing = sum(1 for o in dom_objs if o.mastery_state == MasteryState.DEVELOPING)
            emerging = sum(1 for o in dom_objs if o.mastery_state == MasteryState.EMERGING)
            not_assessed = sum(1 for o in dom_objs if o.mastery_state == MasteryState.NOT_ASSESSED)
            assessed = total - not_assessed

            practice_q_count = sum(q_counts_by_obj.get(o.id, 0) for o in dom_objs)
            first_practice_obj = next(
                (o.id for o in dom_objs if q_counts_by_obj.get(o.id, 0) > 0),
                None,
            )
            lead_obj = next(
                (o for o in dom_objs if o.mastery_state != MasteryState.SECURE),
                dom_objs[0],
            )

            summaries.append(
                DomainProgressSummary(
                    domain_code=domain_code,
                    domain_title=domain_title,
                    total_objectives=total,
                    assessed_objectives=assessed,
                    secure_objectives=secure,
                    provisional_objectives=provisional,
                    developing_objectives=developing,
                    emerging_objectives=emerging,
                    not_assessed_objectives=not_assessed,
                    practice_question_count=practice_q_count,
                    first_practice_objective_id=first_practice_obj,
                    lead_objective_id=lead_obj.id,
                    lead_objective_title=lead_obj.title,
                )
            )
        return summaries

    def get_module_objective_states(
        self, module_number: Optional[int] = None
    ) -> Dict[Tuple[int, str], MasteryState]:
        """Return module-isolated mastery states keyed by (module_number, objective_id)."""
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='module_objective_states';"
            ).fetchone()
            if tbl is None:
                return {}
            query = "SELECT module_number, objective_id, mastery_state FROM module_objective_states"
            params: tuple = ()
            if module_number is not None:
                query += " WHERE module_number = ?"
                params = (int(module_number),)
            rows = conn.execute(query, params).fetchall()
        result: Dict[Any, MasteryState] = {
            (int(r["module_number"]), str(r["objective_id"])): MasteryState(str(r["mastery_state"]))
            for r in rows
        }
        if module_number is not None:
            for r in rows:
                result[str(r["objective_id"])] = MasteryState(str(r["mastery_state"]))
        return result

    def list_worked_examples(self, module_number: Optional[int] = None) -> List[WorkedExampleRecord]:
        """Return seeded syllabus worked examples/projects in module order with explicit quality states."""
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabus_worked_examples';"
            ).fetchone()
            if tbl is None:
                return []
            cols = {
                str(r[1])
                for r in conn.execute("PRAGMA table_info(syllabus_worked_examples);").fetchall()
            }
            has_m2_cols = "lesson_stage" in cols
            if has_m2_cols:
                query = """
                    SELECT
                        id, module_number, code, title, kind, description,
                        linked_objective_id, linked_questions_json, requires_calc_note,
                        content_status, learner_status, completed_at,
                        lesson_stage, worked_example_verified, interactive_practice_available,
                        reference_verification_status, provenance_json, plain_explanation, portfolio_category
                    FROM syllabus_worked_examples
                """
            else:
                query = """
                    SELECT
                        id, module_number, code, title, kind, description,
                        linked_objective_id, linked_questions_json, requires_calc_note,
                        content_status, learner_status, completed_at
                    FROM syllabus_worked_examples
                """
            params: tuple = ()
            if module_number is not None:
                query += " WHERE module_number = ?"
                params = (int(module_number),)
            query += " ORDER BY module_number ASC, id ASC;"
            rows = conn.execute(query, params).fetchall()

        records: List[WorkedExampleRecord] = []
        for r in rows:
            linked_qs = tuple(json.loads(r["linked_questions_json"]))
            if has_m2_cols:
                prov_raw = json.loads(r["provenance_json"] or "{}")
                records.append(
                    WorkedExampleRecord(
                        id=str(r["id"]),
                        module_number=int(r["module_number"]),
                        code=str(r["code"]),
                        title=str(r["title"]),
                        kind=str(r["kind"]),
                        description=str(r["description"]),
                        linked_objective_id=str(r["linked_objective_id"]),
                        linked_question_ids=linked_qs,
                        requires_calc_note=bool(r["requires_calc_note"]),
                        content_status=ContentAvailabilityStatus(r["content_status"]),
                        learner_status=str(r["learner_status"]),
                        completed_at=r["completed_at"],
                        lesson_stage=LessonStage(str(r["lesson_stage"])),
                        worked_example_verified=bool(r["worked_example_verified"]),
                        interactive_practice_available=bool(r["interactive_practice_available"]),
                        reference_verification_status=ReferenceVerificationStatus(
                            str(r["reference_verification_status"])
                        ),
                        provenance=ReferenceProvenance.from_dict(prov_raw),
                        plain_explanation=str(r["plain_explanation"] or ""),
                        portfolio_category=str(r["portfolio_category"] or ""),
                    )
                )
            else:
                records.append(
                    WorkedExampleRecord(
                        id=str(r["id"]),
                        module_number=int(r["module_number"]),
                        code=str(r["code"]),
                        title=str(r["title"]),
                        kind=str(r["kind"]),
                        description=str(r["description"]),
                        linked_objective_id=str(r["linked_objective_id"]),
                        linked_question_ids=linked_qs,
                        requires_calc_note=bool(r["requires_calc_note"]),
                        content_status=ContentAvailabilityStatus(r["content_status"]),
                        learner_status=str(r["learner_status"]),
                        completed_at=r["completed_at"],
                    )
                )
        return records

    def list_syllabus_modules(self, year_pathway: Optional[str] = None) -> List[SyllabusModuleSummary]:
        """Return all 20 syllabus modules (0–19) with module-isolated mastery, quality flags, and completion status."""
        objectives_by_id = {o.id: o for o in self.list_objectives()}
        mod_obj_states = self.get_module_objective_states()
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabus_modules';"
            ).fetchone()
            if tbl is None:
                return []

            has_qml = (
                conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_module_links';"
                ).fetchone()
                is not None
            )

            q_rows = conn.execute(
                """
                SELECT objective_id, COUNT(*) AS q_count
                FROM questions
                WHERE id LIKE 'P2-%'
                GROUP BY objective_id;
                """
            ).fetchall()
            q_counts_by_obj: Dict[str, int] = {str(r["objective_id"]): int(r["q_count"]) for r in q_rows}

            q_counts_by_mod_obj: Dict[Tuple[int, str], int] = {}
            if has_qml:
                qml_rows = conn.execute(
                    """
                    SELECT module_number, objective_id, COUNT(*) AS q_count
                    FROM question_module_links
                    GROUP BY module_number, objective_id;
                    """
                ).fetchall()
                for qr in qml_rows:
                    q_counts_by_mod_obj[(int(qr["module_number"]), str(qr["objective_id"]))] = int(
                        qr["q_count"]
                    )

            ex_rows = conn.execute(
                """
                SELECT
                    module_number,
                    COUNT(*) AS ex_count,
                    SUM(CASE WHEN learner_status = 'Completed' THEN 1 ELSE 0 END) AS completed_ex_count
                FROM syllabus_worked_examples
                GROUP BY module_number;
                """
            ).fetchall()
            ex_counts_by_mod: Dict[int, int] = {
                int(r["module_number"]): int(r["ex_count"]) for r in ex_rows
            }
            comp_ex_counts_by_mod: Dict[int, int] = {
                int(r["module_number"]): int(r["completed_ex_count"] or 0) for r in ex_rows
            }

            mod_cols = {
                str(r[1]) for r in conn.execute("PRAGMA table_info(syllabus_modules);").fetchall()
            }
            has_m2_cols = "lesson_stage" in mod_cols

            if has_m2_cols:
                query = """
                    SELECT
                        module_number, code, title, short_title, suggested_duration,
                        year_pathway, year1_months, why_it_matters,
                        prerequisite_modules_json, mapped_objectives_json,
                        learn_topics_json, resources_json, gate_requirements_json,
                        content_status, verification_note,
                        lesson_stage, worked_example_verified, interactive_practice_available,
                        reference_verification_status, provenance_json, plain_explanation
                    FROM syllabus_modules
                """
            else:
                query = """
                    SELECT
                        module_number, code, title, short_title, suggested_duration,
                        year_pathway, year1_months, why_it_matters,
                        prerequisite_modules_json, mapped_objectives_json,
                        learn_topics_json, resources_json, gate_requirements_json,
                        content_status, verification_note
                    FROM syllabus_modules
                """
            params: tuple = ()
            if year_pathway:
                query += " WHERE year_pathway = ?"
                params = (year_pathway,)
            query += " ORDER BY module_number ASC;"
            rows = conn.execute(query, params).fetchall()

        def _mod_obj_state(m_num: int, oid: str) -> MasteryState:
            if (m_num, oid) in mod_obj_states:
                return mod_obj_states[(m_num, oid)]
            return objectives_by_id[oid].mastery_state

        module_satisfied: Dict[int, bool] = {}
        all_mod_rows = rows
        if year_pathway:
            with self.db.connect() as conn:
                all_mod_rows = conn.execute(
                    "SELECT module_number, mapped_objectives_json FROM syllabus_modules ORDER BY module_number ASC;"
                ).fetchall()

        for r in all_mod_rows:
            m_num = int(r["module_number"])
            mapped_ids = [str(x) for x in json.loads(r["mapped_objectives_json"])]
            valid_ids = [oid for oid in mapped_ids if oid in objectives_by_id]
            module_satisfied[m_num] = bool(valid_ids) and all(
                _mod_obj_state(m_num, oid) in (MasteryState.PROVISIONAL, MasteryState.SECURE)
                for oid in valid_ids
            )

        summaries: List[SyllabusModuleSummary] = []
        for r in rows:
            m_num = int(r["module_number"])
            prereq_mods = tuple(int(p) for p in json.loads(r["prerequisite_modules_json"]))
            mapped_ids = tuple(str(x) for x in json.loads(r["mapped_objectives_json"]))
            dom_objs = [objectives_by_id[oid] for oid in mapped_ids if oid in objectives_by_id]

            total = len(dom_objs)
            states_in_mod = [_mod_obj_state(m_num, o.id) for o in dom_objs]
            secure = sum(1 for st in states_in_mod if st == MasteryState.SECURE)
            provisional = sum(1 for st in states_in_mod if st == MasteryState.PROVISIONAL)
            not_assessed = sum(1 for st in states_in_mod if st == MasteryState.NOT_ASSESSED)
            assessed = total - not_assessed

            if q_counts_by_mod_obj:
                practice_q_count = sum(q_counts_by_mod_obj.get((m_num, o.id), 0) for o in dom_objs)
                first_practice_obj = next(
                    (o.id for o in dom_objs if q_counts_by_mod_obj.get((m_num, o.id), 0) > 0),
                    None,
                )
            else:
                practice_q_count = sum(q_counts_by_obj.get(o.id, 0) for o in dom_objs)
                first_practice_obj = next(
                    (o.id for o in dom_objs if q_counts_by_obj.get(o.id, 0) > 0),
                    None,
                )

            lead_obj = next(
                (o for o in dom_objs if _mod_obj_state(m_num, o.id) != MasteryState.SECURE),
                dom_objs[0] if dom_objs else None,
            )

            prereqs_ready = (m_num == 0) or all(module_satisfied.get(p, False) for p in prereq_mods)
            if m_num == 0:
                pathway_status = "Starting Point (Year 1 Foundation)"
            elif prereqs_ready:
                pathway_status = "Prerequisites Satisfied — Ready"
            else:
                missing_prereqs = [f"Mod {p}" for p in prereq_mods if not module_satisfied.get(p, False)]
                pathway_status = f"Gated by {', '.join(missing_prereqs[:3])}"

            ex_total = ex_counts_by_mod.get(m_num, 0)
            ex_completed = comp_ex_counts_by_mod.get(m_num, 0)

            if has_m2_cols:
                l_stage = LessonStage(str(r["lesson_stage"]))
                w_verified = bool(r["worked_example_verified"])
                i_avail = bool(r["interactive_practice_available"]) or (practice_q_count > 0)
                ref_status = ReferenceVerificationStatus(str(r["reference_verification_status"]))
                prov = ReferenceProvenance.from_dict(json.loads(r["provenance_json"] or "{}"))
                plain_exp = str(r["plain_explanation"] or "")
            else:
                l_stage = LessonStage.OUTLINE_ONLY
                w_verified = False
                i_avail = practice_q_count > 0
                ref_status = ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
                prov = ReferenceProvenance()
                plain_exp = ""

            # Strict module completion rule: never marked complete merely from seeded syllabus metadata
            is_complete = (
                l_stage == LessonStage.LESSON_COMPLETE
                and w_verified
                and ref_status != ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
                and module_satisfied.get(m_num, False)
                and ex_total > 0
                and ex_completed >= ex_total
            )

            summaries.append(
                SyllabusModuleSummary(
                    module_number=m_num,
                    code=str(r["code"]),
                    title=str(r["title"]),
                    short_title=str(r["short_title"]),
                    suggested_duration=str(r["suggested_duration"]),
                    year_pathway=str(r["year_pathway"]),
                    year1_months=str(r["year1_months"]),
                    why_it_matters=str(r["why_it_matters"]),
                    prerequisite_module_numbers=prereq_mods,
                    mapped_objective_ids=mapped_ids,
                    learn_topics=tuple(str(x) for x in json.loads(r["learn_topics_json"])),
                    resources=tuple(str(x) for x in json.loads(r["resources_json"])),
                    gate_requirements=tuple(str(x) for x in json.loads(r["gate_requirements_json"])),
                    content_status=ContentAvailabilityStatus(r["content_status"]),
                    verification_note=str(r["verification_note"]),
                    total_objectives=total,
                    assessed_objectives=assessed,
                    secure_objectives=secure,
                    provisional_objectives=provisional,
                    worked_example_count=ex_total,
                    interactive_question_count=practice_q_count,
                    first_practice_objective_id=first_practice_obj,
                    lead_objective_id=lead_obj.id if lead_obj else "",
                    lead_objective_title=lead_obj.title if lead_obj else "",
                    prerequisites_satisfied=prereqs_ready,
                    pathway_status_label=pathway_status,
                    lesson_stage=l_stage,
                    worked_example_verified=w_verified,
                    interactive_practice_available=i_avail,
                    reference_verification_status=ref_status,
                    provenance=prov,
                    plain_explanation=plain_exp,
                    completed_worked_examples=ex_completed,
                    is_module_complete=is_complete,
                )
            )
        return summaries

    def get_milestone_a_portfolio_progress(self) -> Dict[str, Any]:
        """
        Compute real learner progress toward Integrated Milestone A:
        - beam_reactions (equilibrium/reaction problems): 3 required
        - sfd_bmd (SFD/BMD problems): 3 required
        - section_properties_bending (bending-stress/section-property problems): 2 required
        - deflection_check (deflection problems): 1 required
        - column_buckling (buckling/stability checks): 1 required
        Counts distinct independent correct questions (hints_used == 0 and is_correct == 1)
        in each category.
        """
        alias_map = {
            "beam_reactions": "beam_reactions",
            "equilibrium_reactions": "beam_reactions",
            "sfd_bmd": "sfd_bmd",
            "section_properties_bending": "section_properties_bending",
            "bending_section": "section_properties_bending",
            "deflection_check": "deflection_check",
            "deflection": "deflection_check",
            "column_buckling": "column_buckling",
            "buckling_stability_sketches": "column_buckling",
        }
        categories: Dict[str, Dict[str, Any]] = {
            "beam_reactions": {
                "label": "Equilibrium & Support Reaction Calculations",
                "required": 3,
                "completed": 0,
                "is_met": False,
                "items": [],
            },
            "sfd_bmd": {
                "label": "Shear Force & Bending Moment (SFD/BMD) Problems",
                "required": 3,
                "completed": 0,
                "is_met": False,
                "items": [],
            },
            "section_properties_bending": {
                "label": "Section Properties (I, Z) & Bending Stress Checks",
                "required": 2,
                "completed": 0,
                "is_met": False,
                "items": [],
            },
            "deflection_check": {
                "label": "Beam Deflection & Serviceability Stiffness Check",
                "required": 1,
                "completed": 0,
                "is_met": False,
                "items": [],
            },
            "column_buckling": {
                "label": "Column Buckling & Effective Length Stability Check",
                "required": 1,
                "completed": 0,
                "is_met": False,
                "items": [],
            },
        }
        with self.db.connect() as conn:
            has_qml = (
                conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_module_links';"
                ).fetchone()
                is not None
            )
            if has_qml:
                rows = conn.execute(
                    """
                    SELECT DISTINCT qml.portfolio_category, a.question_id
                    FROM attempt_evidence a
                    JOIN question_module_links qml ON qml.question_id = a.question_id
                    WHERE a.is_correct = 1 AND a.hints_used = 0 AND qml.portfolio_category != ''
                    ORDER BY a.question_id;
                    """
                ).fetchall()
                for r in rows:
                    raw_cat = str(r["portfolio_category"])
                    cat = alias_map.get(raw_cat, raw_cat)
                    qid = str(r["question_id"])
                    if cat in categories and qid not in categories[cat]["items"]:
                        categories[cat]["items"].append(qid)

        total_completed = 0
        total_required = 0
        for cat_data in categories.values():
            req = int(cat_data["required"])
            comp = len(cat_data["items"])
            cat_data["completed"] = comp
            cat_data["is_met"] = comp >= req
            total_required += req
            total_completed += min(comp, req)

        return {
            "categories": categories,
            "total_completed": total_completed,
            "total_required": total_required,
            "is_complete": all(bool(c["is_met"]) for c in categories.values()),
            **categories,
        }

    def list_portfolio_milestones(self) -> List[PortfolioMilestoneRecord]:
        """Return all 6 integrated portfolio milestones (Milestones A–F)."""
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='portfolio_milestones';"
            ).fetchone()
            if tbl is None:
                return []
            rows = conn.execute(
                """
                SELECT
                    id, code, title, description, required_items_json,
                    pass_condition, prerequisite_modules_json, learner_status, completed_at
                FROM portfolio_milestones
                ORDER BY id ASC;
                """
            ).fetchall()

        return [
            PortfolioMilestoneRecord(
                id=str(r["id"]),
                code=str(r["code"]),
                title=str(r["title"]),
                description=str(r["description"]),
                required_items=tuple(json.loads(r["required_items_json"])),
                pass_condition=str(r["pass_condition"]),
                prerequisite_module_numbers=tuple(int(x) for x in json.loads(r["prerequisite_modules_json"])),
                learner_status=str(r["learner_status"]),
                completed_at=r["completed_at"],
            )
            for r in rows
        ]

    def get_study_framework(self) -> Dict[str, object]:
        """Return the 5-step study rules, 9-part calculation-note structure, 4-week study rhythm, and reference library."""
        with self.db.connect() as conn:
            tbl = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabus_metadata';"
            ).fetchone()
            if tbl is None:
                return {}
            rows = conn.execute("SELECT key, value_json FROM syllabus_metadata;").fetchall()
        return {str(r["key"]): json.loads(r["value_json"]) for r in rows}

    def get_syllabus_recommendation(self) -> Optional[SyllabusProgressionRecommendation]:
        """
        Compute the next priority study step strictly following the 27 July 2026 Rebuild Syllabus:
        1. Module 0 is the starting point, followed by Modules 1–8 (Year 1 pathway), then Modules 9–19.
        2. Uses module-isolated mastery (module_objective_states) so mastering a shared objective ID
           in an earlier module (e.g. MAT-02 in Module 5) never marks a later module (e.g. Module 6) as mastered.
        3. Never marks missing teaching content as complete, and never deadlocks when a module's interactive
           questions are not yet authored.
        """
        modules = self.list_syllabus_modules()
        if not modules:
            return None

        objectives_by_id = {o.id: o for o in self.list_objectives()}
        mod_obj_states = self.get_module_objective_states()
        worked_examples = self.list_worked_examples()
        ex_by_mod: Dict[int, List[WorkedExampleRecord]] = {}
        for ex in worked_examples:
            ex_by_mod.setdefault(ex.module_number, []).append(ex)

        def _mod_state(m_num: int, oid: str) -> MasteryState:
            if (m_num, oid) in mod_obj_states:
                return mod_obj_states[(m_num, oid)]
            return objectives_by_id[oid].mastery_state

        # 1st pass: Find the lowest-numbered module (0 -> 8 first, then 9 -> 19) whose prerequisites
        # are satisfied and that still has at least one objective not yet Provisional or Secure in THIS module.
        chosen_mod: Optional[SyllabusModuleSummary] = None
        for mod in modules:
            mod_oids = [oid for oid in mod.mapped_objective_ids if oid in objectives_by_id]
            needs_initial_mastery = any(
                _mod_state(mod.module_number, oid) not in (MasteryState.PROVISIONAL, MasteryState.SECURE)
                for oid in mod_oids
            )
            if needs_initial_mastery and mod.prerequisites_satisfied:
                chosen_mod = mod
                break

        # 2nd pass: If all prerequisite-ready modules are at least Provisional, pick the earliest
        # prerequisite-ready module that has objectives awaiting 24h delayed retrieval to reach Secure.
        if chosen_mod is None:
            for mod in modules:
                mod_oids = [oid for oid in mod.mapped_objective_ids if oid in objectives_by_id]
                has_unsecured = any(
                    _mod_state(mod.module_number, oid) != MasteryState.SECURE for oid in mod_oids
                )
                if has_unsecured and mod.prerequisites_satisfied:
                    chosen_mod = mod
                    break

        # Fallback if a module's prerequisites are Developing/Emerging (not yet Provisional):
        if chosen_mod is None:
            for mod in modules:
                mod_oids = [oid for oid in mod.mapped_objective_ids if oid in objectives_by_id]
                if any(
                    _mod_state(mod.module_number, oid)
                    not in (MasteryState.PROVISIONAL, MasteryState.SECURE)
                    for oid in mod_oids
                ):
                    chosen_mod = mod
                    break

        if chosen_mod is None:
            chosen_mod = modules[0]

        mod_objs = [objectives_by_id[oid] for oid in chosen_mod.mapped_objective_ids if oid in objectives_by_id]
        chosen_obj_base: LearningObjective = mod_objs[0]
        for candidate in mod_objs:
            if _mod_state(chosen_mod.module_number, candidate.id) != MasteryState.SECURE:
                prereqs_ok = all(
                    objectives_by_id[p].mastery_state in (MasteryState.PROVISIONAL, MasteryState.SECURE)
                    for p in candidate.prerequisite_ids
                    if p in objectives_by_id
                )
                if prereqs_ok or not candidate.prerequisite_ids:
                    chosen_obj_base = candidate
                    break
        else:
            chosen_obj_base = next(
                (o for o in mod_objs if _mod_state(chosen_mod.module_number, o.id) != MasteryState.SECURE),
                mod_objs[0],
            )

        # Reflect module-specific mastery state on the recommended objective
        mod_specific_state = _mod_state(chosen_mod.module_number, chosen_obj_base.id)
        chosen_obj = LearningObjective(
            id=chosen_obj_base.id,
            domain_code=chosen_obj_base.domain_code,
            domain_title=chosen_obj_base.domain_title,
            title=chosen_obj_base.title,
            observable_competency=chosen_obj_base.observable_competency,
            why_it_matters=chosen_obj_base.why_it_matters,
            prerequisite_ids=list(chosen_obj_base.prerequisite_ids),
            target_balance=chosen_obj_base.target_balance,
            provenance=chosen_obj_base.provenance,
            mastery_state=mod_specific_state,
        )

        mod_examples = ex_by_mod.get(chosen_mod.module_number, [])
        chosen_ex = next(
            (
                ex
                for ex in mod_examples
                if ex.linked_objective_id == chosen_obj.id and ex.learner_status != "Completed"
            ),
            next(
                (ex for ex in mod_examples if ex.linked_objective_id == chosen_obj.id),
                mod_examples[0] if mod_examples else None,
            ),
        )

        # Find the best interactive practice question without ever deadlocking on missing content
        with self.db.connect() as conn:
            has_qml = (
                conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='question_module_links';"
                ).fetchone()
                is not None
            )
            mod_q_rows = []
            if has_qml:
                mod_q_rows = conn.execute(
                    """
                    SELECT q.objective_id, q.id, COUNT(a.id) AS attempt_n, MAX(a.id) AS last_id
                    FROM questions q
                    JOIN question_module_links qml ON qml.question_id = q.id
                    LEFT JOIN attempt_evidence a ON a.question_id = q.id
                    WHERE qml.module_number = ? AND q.objective_id = ?
                    GROUP BY q.objective_id, q.id
                    ORDER BY attempt_n ASC, COALESCE(last_id, 0) ASC, q.id ASC;
                    """,
                    (chosen_mod.module_number, chosen_obj.id),
                ).fetchall()

            avail_q_rows = conn.execute(
                """
                SELECT q.objective_id, q.id, COUNT(a.id) AS attempt_n, MAX(a.id) AS last_id
                FROM questions q
                LEFT JOIN attempt_evidence a ON a.question_id = q.id
                WHERE q.id LIKE 'P2-%'
                GROUP BY q.objective_id, q.id
                ORDER BY attempt_n ASC, COALESCE(last_id, 0) ASC, q.id ASC;
                """
            ).fetchall()

        q_by_obj: Dict[str, List[str]] = {}
        for r in avail_q_rows:
            q_by_obj.setdefault(str(r["objective_id"]), []).append(str(r["id"]))

        interactive_obj_id: Optional[str] = None
        interactive_q_id: Optional[str] = None

        if mod_q_rows:
            interactive_obj_id = str(mod_q_rows[0]["objective_id"])
            interactive_q_id = str(mod_q_rows[0]["id"])
        elif chosen_obj.id in q_by_obj:
            interactive_obj_id = chosen_obj.id
            interactive_q_id = q_by_obj[chosen_obj.id][0]
        else:
            # Walk modules in strict 0 -> 19 order to find the earliest unmastered objective with interactive questions
            for mod in modules:
                for oid in mod.mapped_objective_ids:
                    if oid in q_by_obj and _mod_state(mod.module_number, oid) != MasteryState.SECURE:
                        interactive_obj_id = oid
                        interactive_q_id = q_by_obj[oid][0]
                        break
                if interactive_obj_id:
                    break
            if interactive_obj_id is None and q_by_obj:
                first_oid = next(iter(q_by_obj.keys()))
                interactive_obj_id = first_oid
                interactive_q_id = q_by_obj[first_oid][0]

        if chosen_mod.module_number == 0:
            rationale = (
                f"Module 0 ({chosen_mod.short_title}) is the mandatory starting point of the Year 1 pathway "
                f"({chosen_mod.year1_months}). Complete '{chosen_obj.id}' and its Module 0 gate before advancing."
            )
        else:
            rationale = (
                f"{chosen_mod.title} ({chosen_mod.year_pathway}, {chosen_mod.suggested_duration}) is the next "
                f"unmastered module in sequence whose prerequisite foundations are ready."
            )
        if not chosen_mod.interactive_practice_available:
            rationale += (
                f" Note: Full interactive questions for {chosen_mod.code} are marked "
                f"'{chosen_mod.content_status.human_label}'; follow the 5-step study rule and worked example "
                f"outline while using available interactive practice for spaced review."
            )

        return SyllabusProgressionRecommendation(
            recommended_module=chosen_mod,
            recommended_objective=chosen_obj,
            recommended_worked_example=chosen_ex,
            interactive_practice_objective_id=interactive_obj_id,
            interactive_practice_question_id=interactive_q_id,
            rationale=rationale,
        )

    def list_recent_activity(self, limit: int = 5) -> List[RecentActivityItem]:
        """Return the most recent recorded learning attempts joined with question and objective titles."""
        safe_limit = max(1, min(int(limit), 50))
        with self.db.connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    a.id AS attempt_id,
                    a.attempted_at,
                    a.question_id,
                    COALESCE(q.title, a.question_id) AS question_title,
                    a.objective_id,
                    COALESCE(o.title, a.objective_id) AS objective_title,
                    COALESCE(o.domain_code, '') AS domain_code,
                    a.task_type,
                    a.is_correct,
                    a.hints_used,
                    COALESCE(a.user_answer, '') AS user_answer,
                    a.misconception_id
                FROM attempt_evidence a
                LEFT JOIN questions q ON q.id = a.question_id
                LEFT JOIN curriculum_objectives o ON o.id = a.objective_id
                ORDER BY a.id DESC
                LIMIT ?;
                """,
                (safe_limit,),
            ).fetchall()

        return [
            RecentActivityItem(
                attempt_id=int(r["attempt_id"]),
                attempted_at=str(r["attempted_at"]),
                question_id=str(r["question_id"]),
                question_title=str(r["question_title"]),
                objective_id=str(r["objective_id"]),
                objective_title=str(r["objective_title"]),
                domain_code=str(r["domain_code"]),
                task_type=str(r["task_type"]),
                is_correct=bool(r["is_correct"]),
                hints_used=int(r["hints_used"]),
                user_answer=str(r["user_answer"]),
                misconception_id=r["misconception_id"],
            )
            for r in rows
        ]

    def get_dashboard_summary(self) -> Dict[str, object]:
        objectives = self.list_objectives()
        state_counts: Dict[str, int] = {s.value: 0 for s in MasteryState}
        for obj in objectives:
            state_counts[obj.mastery_state.value] = state_counts.get(obj.mastery_state.value, 0) + 1

        syl_rec = self.get_syllabus_recommendation()
        if syl_rec is not None:
            recommended: Optional[LearningObjective] = syl_rec.recommended_objective
        else:
            # Fallback when syllabus tables are not seeded
            obj_by_id = {o.id: o for o in objectives}
            recommended = None
            for obj in objectives:
                if obj.mastery_state != MasteryState.SECURE:
                    prereqs_ready = all(
                        obj_by_id[p].mastery_state in (MasteryState.PROVISIONAL, MasteryState.SECURE)
                        for p in obj.prerequisite_ids
                        if p in obj_by_id
                    )
                    if prereqs_ready or not obj.prerequisite_ids:
                        recommended = obj
                        break

        with self.db.connect() as conn:
            sources_count = int(conn.execute("SELECT COUNT(*) FROM sources;").fetchone()[0])
            attempts_count = int(conn.execute("SELECT COUNT(*) FROM attempt_evidence;").fetchone()[0])
            q_titles = {
                str(r["id"]): str(r["title"])
                for r in conn.execute("SELECT id, title FROM questions WHERE id LIKE 'P2-%';").fetchall()
            }

        total_objectives = len(objectives)
        assessed_objectives = total_objectives - state_counts.get(MasteryState.NOT_ASSESSED.value, 0)
        domain_summaries = self.list_domain_summaries()
        syllabus_modules = self.list_syllabus_modules()
        portfolio_milestones = self.list_portfolio_milestones()
        recent_activity = self.list_recent_activity(limit=5)

        return {
            "total_objectives": total_objectives,
            "assessed_objectives": assessed_objectives,
            "state_counts": state_counts,
            "recommended_objective": recommended,
            "syllabus_recommendation": syl_rec,
            "syllabus_modules": syllabus_modules,
            "portfolio_milestones": portfolio_milestones,
            "sources_count": sources_count,
            "attempts_count": attempts_count,
            "fts5_available": self.db.fts5_available,
            "domain_summaries": domain_summaries,
            "recent_activity": recent_activity,
            "question_titles": q_titles,
        }