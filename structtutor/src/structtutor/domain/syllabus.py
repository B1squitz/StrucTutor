"""Domain models and structural validation for the 27 July 2026 Master Syllabus."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Dict, List, Set, Tuple


class SyllabusValidationError(ValueError):
    """Raised when the master syllabus JSON violates structural or prerequisite rules."""


class ContentAvailabilityStatus(str, Enum):
    """Distinguishes complete curriculum metadata from actual available teaching content."""

    INTERACTIVE_QUESTIONS_AVAILABLE = "INTERACTIVE_QUESTIONS_AVAILABLE"
    CURRICULUM_MAPPED_AWAITING_QUESTIONS = "CURRICULUM_MAPPED_AWAITING_QUESTIONS"
    AWAITING_CONTROLLED_STANDARD_OR_REFERENCE = "AWAITING_CONTROLLED_STANDARD_OR_REFERENCE"

    @property
    def human_label(self) -> str:
        labels = {
            ContentAvailabilityStatus.INTERACTIVE_QUESTIONS_AVAILABLE: (
                "Interactive Practice Questions Active"
            ),
            ContentAvailabilityStatus.CURRICULUM_MAPPED_AWAITING_QUESTIONS: (
                "Curriculum Mapped — Interactive Questions Needs Development"
            ),
            ContentAvailabilityStatus.AWAITING_CONTROLLED_STANDARD_OR_REFERENCE: (
                "Curriculum Mapped — Awaiting Controlled Standard / UK NA Verification"
            ),
        }
        return labels[self]


class LessonStage(str, Enum):
    """Explicit stage of the written/guided lesson content (non-mutually-exclusive with practice/verification)."""

    OUTLINE_ONLY = "OUTLINE_ONLY"
    LESSON_IN_PROGRESS = "LESSON_IN_PROGRESS"
    LESSON_COMPLETE = "LESSON_COMPLETE"

    @property
    def human_label(self) -> str:
        labels = {
            LessonStage.OUTLINE_ONLY: "Outline only",
            LessonStage.LESSON_IN_PROGRESS: "Lesson content in progress",
            LessonStage.LESSON_COMPLETE: "Lesson complete",
        }
        return labels[self]


class ReferenceVerificationStatus(str, Enum):
    """Explicit verification status for standards, National Annexes, or section-table data."""

    NOT_REQUIRED_FIRST_PRINCIPLES = "NOT_REQUIRED_FIRST_PRINCIPLES"
    REFERENCE_VERIFICATION_REQUIRED = "REFERENCE_VERIFICATION_REQUIRED"
    VERIFIED_AGAINST_CONTROLLED_SOURCE = "VERIFIED_AGAINST_CONTROLLED_SOURCE"

    @property
    def human_label(self) -> str:
        labels = {
            ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES: (
                "First-principles mechanics (no code clause/table required)"
            ),
            ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED: (
                "Reference verification required"
            ),
            ReferenceVerificationStatus.VERIFIED_AGAINST_CONTROLLED_SOURCE: (
                "Verified against controlled source"
            ),
        }
        return labels[self]


DEFAULT_EDUCATIONAL_DISCLAIMER = (
    "Educational worked example and learning exercise only — not construction-ready structural design. "
    "Not a substitute for checking current applicable standards/National Annexes or review by a competent engineer."
)


@dataclass(frozen=True)
class ReferenceProvenance:
    """Consistent provenance record for engineering references, standards, and worked examples."""

    source_title: str = "Comprehensive Structural Engineering Rebuild Syllabus (First-Principles Mechanics)"
    author_or_publisher: str = "StructTutor Local Curriculum / R.C. Hibbeler (Background Reference)"
    edition_or_year: str = "27 July 2026 Syllabus Baseline"
    applicable_standard: str = ""
    national_annex: str = ""
    clause_or_page: str = ""
    verification_status: str = "FIRST_PRINCIPLES_DETERMINISTIC_SOLVER"
    educational_disclaimer: str = DEFAULT_EDUCATIONAL_DISCLAIMER

    def to_dict(self) -> Dict[str, str]:
        return {
            "source_title": self.source_title,
            "author_or_publisher": self.author_or_publisher,
            "edition_or_year": self.edition_or_year,
            "applicable_standard": self.applicable_standard,
            "national_annex": self.national_annex,
            "clause_or_page": self.clause_or_page,
            "verification_status": self.verification_status,
            "educational_disclaimer": self.educational_disclaimer,
        }

    @classmethod
    def from_dict(cls, raw: Dict[str, object] | None) -> "ReferenceProvenance":
        if not raw or not isinstance(raw, dict):
            return cls()
        return cls(
            source_title=str(raw.get("source_title", cls.source_title)),
            author_or_publisher=str(raw.get("author_or_publisher", cls.author_or_publisher)),
            edition_or_year=str(raw.get("edition_or_year", cls.edition_or_year)),
            applicable_standard=str(raw.get("applicable_standard", "")),
            national_annex=str(raw.get("national_annex", "")),
            clause_or_page=str(raw.get("clause_or_page", "")),
            verification_status=str(raw.get("verification_status", cls.verification_status)),
            educational_disclaimer=str(
                raw.get("educational_disclaimer", DEFAULT_EDUCATIONAL_DISCLAIMER)
            ),
        )


def compute_quality_badges(
    lesson_stage: LessonStage,
    worked_example_verified: bool,
    interactive_practice_available: bool,
    reference_verification_status: ReferenceVerificationStatus,
) -> Tuple[str, ...]:
    """
    Return the honest, non-mutually-exclusive quality status labels for a module, lesson, or worked example.
    At minimum distinguishes:
    - Outline only
    - Lesson content in progress
    - Lesson complete
    - Worked example verified
    - Interactive practice available
    - Reference verification required
    """
    badges: List[str] = [lesson_stage.human_label]
    if worked_example_verified:
        badges.append("Worked example verified")
    if interactive_practice_available:
        badges.append("Interactive practice available")
    if reference_verification_status == ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED:
        badges.append("Reference verification required")
    elif reference_verification_status == ReferenceVerificationStatus.VERIFIED_AGAINST_CONTROLLED_SOURCE:
        badges.append("Verified against controlled source")
    return tuple(badges)


@dataclass(frozen=True)
class StudyMethodStep:
    """One of the five mandatory study steps for every topic."""

    step_number: int
    id: str
    title: str
    instruction: str


@dataclass(frozen=True)
class CalculationNoteSectionSpec:
    """One of the nine required sections in a syllabus calculation note."""

    section_number: int
    key: str
    title: str
    prompt: str


@dataclass(frozen=True)
class WeeklySessionSpec:
    """One of the three weekly 45-60 minute study sessions."""

    session_number: int
    title: str
    duration: str
    tasks: Tuple[str, ...]


@dataclass(frozen=True)
class FourthWeekReviewSpec:
    """Consolidation and review protocol for every fourth study week."""

    frequency: str
    rule: str
    tasks: Tuple[str, ...]


@dataclass(frozen=True)
class SyllabusWorkedExample:
    """A worked example, capstone project, worked project, or practical exercise in the syllabus."""

    id: str
    code: str
    title: str
    kind: str
    description: str
    linked_objective_id: str
    linked_question_ids: Tuple[str, ...]
    requires_calc_note: bool
    content_status: ContentAvailabilityStatus
    lesson_stage: LessonStage = LessonStage.OUTLINE_ONLY
    worked_example_verified: bool = False
    interactive_practice_available: bool = False
    reference_verification_status: ReferenceVerificationStatus = (
        ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES
    )
    provenance: ReferenceProvenance = field(default_factory=ReferenceProvenance)
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


@dataclass(frozen=True)
class SyllabusModule:
    """One of the 20 modules (numbered 0–19) in the Rebuild Syllabus."""

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
    content_status: ContentAvailabilityStatus
    verification_note: str
    learn_topics: Tuple[str, ...]
    worked_examples: Tuple[SyllabusWorkedExample, ...]
    resources: Tuple[str, ...]
    gate_requirements: Tuple[str, ...]
    lesson_stage: LessonStage = LessonStage.OUTLINE_ONLY
    worked_example_verified: bool = False
    interactive_practice_available: bool = False
    reference_verification_status: ReferenceVerificationStatus = (
        ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES
    )
    provenance: ReferenceProvenance = field(default_factory=ReferenceProvenance)
    plain_explanation: str = ""

    @property
    def quality_badges(self) -> Tuple[str, ...]:
        return compute_quality_badges(
            self.lesson_stage,
            self.worked_example_verified,
            self.interactive_practice_available,
            self.reference_verification_status,
        )


@dataclass(frozen=True)
class PortfolioMilestoneRequirement:
    """A countable deliverable category inside one of the six portfolio milestones."""

    category: str
    label: str
    required_count: int


@dataclass(frozen=True)
class PortfolioMilestone:
    """One of the six integrated project milestones (Milestones A–F)."""

    id: str
    code: str
    title: str
    description: str
    required_items: Tuple[PortfolioMilestoneRequirement, ...]
    pass_condition: str
    prerequisite_module_numbers: Tuple[int, ...]


@dataclass(frozen=True)
class MasterSyllabus:
    """Validated in-memory representation of the 27 July 2026 Master Rebuild Syllabus."""

    schema_version: str
    syllabus_title: str
    syllabus_date: str
    syllabus_date_display: str
    purpose_and_intended_use: str
    professional_safeguard_notice: str
    study_rate: str
    year_one_outcome_statement: str
    five_step_study_method: Tuple[StudyMethodStep, ...]
    calculation_note_structure: Tuple[CalculationNoteSectionSpec, ...]
    weekly_sessions: Tuple[WeeklySessionSpec, ...]
    fourth_week_review: FourthWeekReviewSpec
    reference_library: Dict[str, object]
    first_12_month_sequence: Tuple[Dict[str, object], ...]
    modules: Tuple[SyllabusModule, ...] = field(default_factory=tuple)
    portfolio_milestones: Tuple[PortfolioMilestone, ...] = field(default_factory=tuple)


def validate_master_syllabus(
    syllabus: MasterSyllabus,
    known_objective_ids: Set[str] | None = None,
) -> None:
    """
    Validate completeness and structural invariants of the Master Syllabus:
    1. Exactly 20 modules numbered 0 through 19 in sequential order.
    2. Module 0 has no prerequisites; Modules 1–8 form Year 1; Modules 9–19 form Years 2–3 and Years 3–4+.
    3. Prerequisite module numbers form a valid acyclic graph and never depend on later-numbered modules.
    4. Every module defines learn topics, worked examples/projects, resources, suggested duration, and gate criteria.
    5. All 5 study rules and all 9 calculation-note sections are present.
    6. All 6 integrated portfolio milestones (A–F) are present with pass conditions and valid prerequisite modules.
    7. If known_objective_ids is supplied, every existing curriculum objective ID is mapped to at least one module.
    """
    if len(syllabus.five_step_study_method) != 5:
        raise SyllabusValidationError("Master syllabus must define all 5 study rules.")
    if [s.step_number for s in syllabus.five_step_study_method] != [1, 2, 3, 4, 5]:
        raise SyllabusValidationError("Five-step study method must be numbered 1 through 5.")

    if len(syllabus.calculation_note_structure) != 9:
        raise SyllabusValidationError("Master syllabus must define all 9 calculation-note sections.")
    if [s.section_number for s in syllabus.calculation_note_structure] != list(range(1, 10)):
        raise SyllabusValidationError("Calculation-note sections must be numbered 1 through 9.")

    if len(syllabus.weekly_sessions) != 3:
        raise SyllabusValidationError("Weekly study rhythm must define 3 sessions per week.")
    if not syllabus.fourth_week_review.tasks or len(syllabus.fourth_week_review.tasks) < 4:
        raise SyllabusValidationError("Fourth-week review must define its 4 consolidation tasks.")

    if len(syllabus.modules) != 20:
        raise SyllabusValidationError(f"Expected 20 modules (0–19), found {len(syllabus.modules)}.")

    expected_numbers = list(range(20))
    actual_numbers = [m.module_number for m in syllabus.modules]
    if actual_numbers != expected_numbers:
        raise SyllabusValidationError(
            f"Modules must be numbered 0 through 19 in order; got {actual_numbers}."
        )

    mod_by_num: Dict[int, SyllabusModule] = {m.module_number: m for m in syllabus.modules}

    if mod_by_num[0].prerequisite_module_numbers:
        raise SyllabusValidationError("Module 0 is the starting point and must have no prerequisites.")

    seen_example_ids: Set[str] = set()
    all_mapped_objectives: Set[str] = set()

    for mod in syllabus.modules:
        if not mod.title.startswith(f"Module {mod.module_number} — "):
            raise SyllabusValidationError(
                f"Module {mod.module_number} title '{mod.title}' does not preserve syllabus numbering format."
            )
        if not mod.suggested_duration.strip():
            raise SyllabusValidationError(f"Module {mod.module_number} is missing suggested_duration.")
        if not mod.learn_topics:
            raise SyllabusValidationError(f"Module {mod.module_number} has no learn_topics.")
        if not mod.worked_examples:
            raise SyllabusValidationError(f"Module {mod.module_number} has no worked_examples.")
        if not mod.resources:
            raise SyllabusValidationError(f"Module {mod.module_number} has no resources.")
        if not mod.gate_requirements:
            raise SyllabusValidationError(f"Module {mod.module_number} has no gate_requirements.")
        if not mod.mapped_objective_ids:
            raise SyllabusValidationError(f"Module {mod.module_number} has no mapped_objective_ids.")

        if mod.module_number <= 8 and mod.year_pathway != "Year 1":
            raise SyllabusValidationError(
                f"Module {mod.module_number} must belong to the 'Year 1' pathway."
            )
        if mod.module_number >= 9 and mod.year_pathway not in ("Years 2–3", "Years 3–4+"):
            raise SyllabusValidationError(
                f"Advanced Module {mod.module_number} must belong to 'Years 2–3' or 'Years 3–4+'."
            )
        if mod.module_number > 0 and not mod.prerequisite_module_numbers:
            raise SyllabusValidationError(
                f"Module {mod.module_number} must specify at least one prerequisite module."
            )

        for prereq_num in mod.prerequisite_module_numbers:
            if prereq_num not in mod_by_num:
                raise SyllabusValidationError(
                    f"Module {mod.module_number} references unknown prerequisite module {prereq_num}."
                )
            if prereq_num >= mod.module_number:
                raise SyllabusValidationError(
                    f"Module {mod.module_number} cannot depend on same or later module {prereq_num}."
                )

        all_mapped_objectives.update(mod.mapped_objective_ids)

        for ex in mod.worked_examples:
            if ex.id in seen_example_ids:
                raise SyllabusValidationError(f"Duplicate worked example ID: '{ex.id}'.")
            seen_example_ids.add(ex.id)

    if len(syllabus.portfolio_milestones) != 6:
        raise SyllabusValidationError(
            f"Expected 6 integrated portfolio milestones (A–F), found {len(syllabus.portfolio_milestones)}."
        )
    expected_ms_ids = [f"MILESTONE-{ch}" for ch in ("A", "B", "C", "D", "E", "F")]
    if [m.id for m in syllabus.portfolio_milestones] != expected_ms_ids:
        raise SyllabusValidationError("Portfolio milestones must be MILESTONE-A through MILESTONE-F.")

    for ms in syllabus.portfolio_milestones:
        if not ms.pass_condition.strip():
            raise SyllabusValidationError(f"Milestone {ms.id} is missing pass_condition.")
        if not ms.required_items:
            raise SyllabusValidationError(f"Milestone {ms.id} has no required_items.")
        for p_mod in ms.prerequisite_module_numbers:
            if p_mod not in mod_by_num:
                raise SyllabusValidationError(
                    f"Milestone {ms.id} references unknown module {p_mod}."
                )

    if known_objective_ids is not None:
        unknown_objs = all_mapped_objectives - known_objective_ids
        if unknown_objs:
            raise SyllabusValidationError(
                f"Syllabus maps unknown curriculum objective IDs: {sorted(unknown_objs)}"
            )
        unmapped_objs = known_objective_ids - all_mapped_objectives
        if unmapped_objs:
            raise SyllabusValidationError(
                f"Existing curriculum objectives are not mapped to any syllabus module: {sorted(unmapped_objs)}"
            )


_EXAMPLE_PORTFOLIO_CATEGORIES: Dict[str, str] = {
    "EX-0.1": "equilibrium_reactions",
    "EX-0.2": "equilibrium_reactions",
    "EX-0.3": "equilibrium_reactions",
    "EX-1.1": "equilibrium_reactions",
    "EX-1.2": "equilibrium_reactions",
    "EX-1.3": "equilibrium_reactions",
    "EX-1.4": "equilibrium_reactions",
    "EX-2.1": "sfd_bmd",
    "EX-2.2": "sfd_bmd",
    "EX-2.3": "sfd_bmd",
    "EX-3.1": "bending_section",
    "EX-3.2": "bending_section",
    "EX-3.3": "bending_section",
    "EX-4.1": "bending_section",
    "EX-4.2": "bending_section",
    "EX-4.3": "bending_section",
    "EX-4.4": "bending_section",
    "EX-5.1": "deflection",
    "EX-5.2": "deflection",
    "EX-6.1": "buckling_stability_sketches",
    "EX-6.2": "buckling_stability_sketches",
    "EX-6.3": "buckling_stability_sketches",
    "EX-6.4": "buckling_stability_sketches",
}

_MODULE_PLAIN_EXPLANATIONS: Dict[int, str] = {
    0: (
        "Before touching any structural formula, every quantity must carry its physical meaning and unit. "
        "A force pushes or pulls (N, kN); a moment turns about a pivot (N·mm, kN·m); a distributed line load "
        "spreads force along a length (kN/m = N/mm); and stress concentrates force over an area (N/mm² = MPa)."
    ),
    1: (
        "A stationary structure is in static equilibrium: all horizontal forces, vertical forces, and turning "
        "moments balance to zero. Free-body diagrams isolate the member and replace physical supports (pins, "
        "rollers, fixed ends) with the exact reaction forces or moments they are capable of resisting."
    ),
    2: (
        "When external loads act on a beam, the internal material must carry shear force V(x) to prevent vertical "
        "sliding and bending moment M(x) to prevent folding. Under the UK structural convention, positive sagging "
        "moment stretches the bottom fibres in tension and is plotted downward on the tension face."
    ),
    3: (
        "Internal axial force P produces normal stress σ = P/A across a section and axial strain ε = ΔL/L along "
        "the member. Within the linear-elastic range, Young's modulus E = σ/ε governs stiffness (how much a member "
        "stretches), which is distinct from material strength (when it yields or crushes)."
    ),
    4: (
        "How material is arranged relative to the neutral axis controls bending performance. Placing flange area "
        "far from the centroid maximises Second Moment of Area I (governing flexural stiffness EI) and Section "
        "Modulus Z = I/y_max (governing elastic extreme-fibre bending stress σ = M/Z)."
    ),
    5: (
        "Even when a beam has ample strength against collapse (ULS), excessive deflection under working loads (SLS) "
        "cracks brittle finishes, jams doors, ponds rainwater, and causes noticeable floor bounce. Because elastic "
        "deflection scales with L⁴/(EI), span and section depth dominate over steel yield grade."
    ),
    6: (
        "Slender compression columns and laterally unrestrained beams fail by geometric instability—buckling sideways "
        "or twisting (lateral-torsional buckling, LTB)—well before the material reaches its yield stress. Effective "
        "length L_cr and physical restraint of the compression flange control stability."
    ),
}


def _derive_example_quality_metadata(
    module_number: int,
    ex_raw: Dict[str, object],
    content_status: ContentAvailabilityStatus,
) -> Tuple[LessonStage, bool, bool, ReferenceVerificationStatus, ReferenceProvenance, str, str]:
    ex_id = str(ex_raw["id"])
    linked_q = tuple(str(q) for q in ex_raw.get("linked_question_ids", []))  # type: ignore[union-attr]
    portfolio_cat = str(ex_raw.get("portfolio_category") or _EXAMPLE_PORTFOLIO_CATEGORIES.get(ex_id, ""))
    plain_exp = str(ex_raw.get("plain_explanation") or _MODULE_PLAIN_EXPLANATIONS.get(module_number, ""))

    if ex_id == "EX-4.3":
        lesson_stage = LessonStage.LESSON_COMPLETE
        worked_verified = True
        interactive_avail = bool(ex_raw.get("interactive_practice_available", bool(linked_q)))
        ref_status = ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
        prov = ReferenceProvenance(
            source_title="SCI P363 / SteelConstruction.info Section Tables (User Verification Required)",
            author_or_publisher="Steel Construction Institute (SCI)",
            edition_or_year="Current UK Edition (User-Supplied Table Values)",
            applicable_standard="BS EN 1993-1-1 / BS EN 10365",
            national_annex="UK NA to BS EN 1993-1-1",
            clause_or_page="Universal Beam (UB) Section Property Tables",
            verification_status="MATHEMATICAL_RATIO_VERIFIED_TABLE_DATA_UNVERIFIED",
            educational_disclaimer=(
                "Mathematical formulas (Z = I/y_max and major/minor axis ratios) are verified deterministically. "
                "Actual Universal Beam dimensions and section properties must be read from a controlled SCI / "
                "SteelConstruction.info table and are never invented by StructTutor."
            ),
        )
        return lesson_stage, worked_verified, interactive_avail, ref_status, prov, plain_exp, portfolio_cat

    if 0 <= module_number <= 6:
        lesson_stage = LessonStage(str(ex_raw.get("lesson_stage", LessonStage.LESSON_COMPLETE.value)))
        worked_verified = bool(ex_raw.get("worked_example_verified", True))
        interactive_avail = bool(ex_raw.get("interactive_practice_available", bool(linked_q)))
        ref_status = ReferenceVerificationStatus(
            str(
                ex_raw.get(
                    "reference_verification_status",
                    ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES.value,
                )
            )
        )
        prov = ReferenceProvenance.from_dict(
            ex_raw.get("provenance")  # type: ignore[arg-type]
            if isinstance(ex_raw.get("provenance"), dict)
            else {
                "source_title": "R.C. Hibbeler — Structural Analysis / Mechanics of Materials (Background Reference)",
                "author_or_publisher": "Pearson / StructTutor Deterministic Python Solver",
                "edition_or_year": "9th Edition (2015) / 27 July 2026 Rebuild Syllabus",
                "applicable_standard": "First-Principles Structural Mechanics (UK Sign Convention)",
                "national_annex": "N/A (Pre-Code Mechanics Foundation)",
                "clause_or_page": f"Module {module_number} ({ex_id})",
                "verification_status": "WORKED_EXAMPLE_VERIFIED_DUAL_METHOD",
                "educational_disclaimer": DEFAULT_EDUCATIONAL_DISCLAIMER,
            }
        )
        return lesson_stage, worked_verified, interactive_avail, ref_status, prov, plain_exp, portfolio_cat

    # Modules 7–19: Honest Outline Only / Reference Verification Required where applicable
    lesson_stage = LessonStage(str(ex_raw.get("lesson_stage", LessonStage.OUTLINE_ONLY.value)))
    worked_verified = bool(ex_raw.get("worked_example_verified", False))
    interactive_avail = bool(ex_raw.get("interactive_practice_available", bool(linked_q)))
    if content_status == ContentAvailabilityStatus.AWAITING_CONTROLLED_STANDARD_OR_REFERENCE or module_number in (
        7, 8, 9, 10, 11, 13, 14
    ):
        default_ref = ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED.value
        std_label = "Eurocode / UK National Annex / Controlled Guidance Required"
    else:
        default_ref = ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES.value
        std_label = "Syllabus Project / Practice Outline"
    ref_status = ReferenceVerificationStatus(str(ex_raw.get("reference_verification_status", default_ref)))
    prov = ReferenceProvenance.from_dict(
        ex_raw.get("provenance")  # type: ignore[arg-type]
        if isinstance(ex_raw.get("provenance"), dict)
        else {
            "source_title": f"Comprehensive Structural Engineering Rebuild Syllabus — Module {module_number}",
            "author_or_publisher": "Authoritative User Syllabus (27 July 2026)",
            "edition_or_year": "2026",
            "applicable_standard": std_label,
            "national_annex": "UK National Annex (Verification Required before Design Use)",
            "clause_or_page": f"Module {module_number} ({ex_id})",
            "verification_status": default_ref,
            "educational_disclaimer": DEFAULT_EDUCATIONAL_DISCLAIMER,
        }
    )
    return lesson_stage, worked_verified, interactive_avail, ref_status, prov, plain_exp, portfolio_cat


def load_master_syllabus(
    path: Path,
    known_objective_ids: Set[str] | None = None,
) -> MasterSyllabus:
    """Load, parse, and validate master_syllabus_2026.json."""
    try:
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SyllabusValidationError(f"Cannot load master syllabus from '{path}': {exc}") from exc

    steps = tuple(
        StudyMethodStep(
            step_number=int(s["step_number"]),
            id=str(s["id"]),
            title=str(s["title"]),
            instruction=str(s["instruction"]),
        )
        for s in raw.get("five_step_study_method", [])
    )

    calc_sections = tuple(
        CalculationNoteSectionSpec(
            section_number=int(c["section_number"]),
            key=str(c["key"]),
            title=str(c["title"]),
            prompt=str(c["prompt"]),
        )
        for c in raw.get("calculation_note_structure", [])
    )

    rhythm_raw = raw.get("weekly_study_rhythm", {})
    weekly_sessions = tuple(
        WeeklySessionSpec(
            session_number=int(w["session_number"]),
            title=str(w["title"]),
            duration=str(w["duration"]),
            tasks=tuple(str(t) for t in w.get("tasks", [])),
        )
        for w in rhythm_raw.get("weekly_sessions", [])
    )
    fw_raw = rhythm_raw.get("fourth_week_review_process", {})
    fourth_week = FourthWeekReviewSpec(
        frequency=str(fw_raw.get("frequency", "Every fourth week")),
        rule=str(fw_raw.get("rule", "Do not start new content.")),
        tasks=tuple(str(t) for t in fw_raw.get("tasks", [])),
    )

    modules: List[SyllabusModule] = []
    for m in raw.get("modules", []):
        m_num = int(m["module_number"])
        m_status = ContentAvailabilityStatus(m["content_status"])
        parsed_examples: List[SyllabusWorkedExample] = []
        for ex in m.get("worked_examples", []):
            ex_status = ContentAvailabilityStatus(ex["content_status"])
            (
                ex_stage,
                ex_verified,
                ex_interactive,
                ex_ref_status,
                ex_prov,
                ex_plain,
                ex_port_cat,
            ) = _derive_example_quality_metadata(m_num, ex, ex_status)
            parsed_examples.append(
                SyllabusWorkedExample(
                    id=str(ex["id"]),
                    code=str(ex["code"]),
                    title=str(ex["title"]),
                    kind=str(ex["kind"]),
                    description=str(ex["description"]),
                    linked_objective_id=str(ex["linked_objective_id"]),
                    linked_question_ids=tuple(str(q) for q in ex.get("linked_question_ids", [])),
                    requires_calc_note=bool(ex.get("requires_calc_note", False)),
                    content_status=ex_status,
                    lesson_stage=ex_stage,
                    worked_example_verified=ex_verified,
                    interactive_practice_available=ex_interactive,
                    reference_verification_status=ex_ref_status,
                    provenance=ex_prov,
                    plain_explanation=ex_plain,
                    portfolio_category=ex_port_cat,
                )
            )
        examples = tuple(parsed_examples)

        if 0 <= m_num <= 6:
            mod_stage = LessonStage(str(m.get("lesson_stage", LessonStage.LESSON_COMPLETE.value)))
            mod_verified = bool(m.get("worked_example_verified", True))
        else:
            mod_stage = LessonStage(str(m.get("lesson_stage", LessonStage.OUTLINE_ONLY.value)))
            mod_verified = bool(m.get("worked_example_verified", False))

        mod_interactive = bool(
            m.get(
                "interactive_practice_available",
                m_status == ContentAvailabilityStatus.INTERACTIVE_QUESTIONS_AVAILABLE
                or any(e.interactive_practice_available for e in examples),
            )
        )
        if (
            m_status == ContentAvailabilityStatus.AWAITING_CONTROLLED_STANDARD_OR_REFERENCE
            or any(
                e.reference_verification_status
                == ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
                for e in examples
            )
        ):
            mod_ref_status = ReferenceVerificationStatus.REFERENCE_VERIFICATION_REQUIRED
        else:
            mod_ref_status = ReferenceVerificationStatus.NOT_REQUIRED_FIRST_PRINCIPLES

        mod_prov = ReferenceProvenance.from_dict(
            m.get("provenance")
            if isinstance(m.get("provenance"), dict)
            else (examples[0].provenance.to_dict() if examples else None)
        )
        mod_plain = str(m.get("plain_explanation") or _MODULE_PLAIN_EXPLANATIONS.get(m_num, m["why_it_matters"]))

        modules.append(
            SyllabusModule(
                module_number=m_num,
                code=str(m["code"]),
                title=str(m["title"]),
                short_title=str(m["short_title"]),
                suggested_duration=str(m["suggested_duration"]),
                year_pathway=str(m["year_pathway"]),
                year1_months=str(m["year1_months"]),
                why_it_matters=str(m["why_it_matters"]),
                prerequisite_module_numbers=tuple(int(p) for p in m.get("prerequisite_module_numbers", [])),
                mapped_objective_ids=tuple(str(oid) for oid in m.get("mapped_objective_ids", [])),
                content_status=m_status,
                verification_note=str(m.get("verification_note", "")),
                learn_topics=tuple(str(t) for t in m.get("learn_topics", [])),
                worked_examples=examples,
                resources=tuple(str(r) for r in m.get("resources", [])),
                gate_requirements=tuple(str(g) for g in m.get("gate_requirements", [])),
                lesson_stage=mod_stage,
                worked_example_verified=mod_verified,
                interactive_practice_available=mod_interactive,
                reference_verification_status=mod_ref_status,
                provenance=mod_prov,
                plain_explanation=mod_plain,
            )
        )

    milestones: List[PortfolioMilestone] = []
    for ms in raw.get("portfolio_milestones", []):
        req_items = tuple(
            PortfolioMilestoneRequirement(
                category=str(ri["category"]),
                label=str(ri["label"]),
                required_count=int(ri["required_count"]),
            )
            for ri in ms.get("required_items", [])
        )
        milestones.append(
            PortfolioMilestone(
                id=str(ms["id"]),
                code=str(ms["code"]),
                title=str(ms["title"]),
                description=str(ms["description"]),
                required_items=req_items,
                pass_condition=str(ms["pass_condition"]),
                prerequisite_module_numbers=tuple(
                    int(p) for p in ms.get("prerequisite_module_numbers", [])
                ),
            )
        )

    syllabus = MasterSyllabus(
        schema_version=str(raw.get("schema_version", "1.0.0")),
        syllabus_title=str(raw.get("syllabus_title", "")),
        syllabus_date=str(raw.get("syllabus_date", "")),
        syllabus_date_display=str(raw.get("syllabus_date_display", "")),
        purpose_and_intended_use=str(raw.get("purpose_and_intended_use", "")),
        professional_safeguard_notice=str(raw.get("professional_safeguard_notice", "")),
        study_rate=str(raw.get("study_rate", "")),
        year_one_outcome_statement=str(raw.get("year_one_outcome_statement", "")),
        five_step_study_method=steps,
        calculation_note_structure=calc_sections,
        weekly_sessions=weekly_sessions,
        fourth_week_review=fourth_week,
        reference_library=dict(raw.get("reference_library", {})),
        first_12_month_sequence=tuple(raw.get("first_12_month_sequence", [])),
        modules=tuple(modules),
        portfolio_milestones=tuple(milestones),
    )

    validate_master_syllabus(syllabus, known_objective_ids=known_objective_ids)
    return syllabus

