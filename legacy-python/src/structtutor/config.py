"""Central configuration, provenance definitions, and structural sign conventions."""

from __future__ import annotations

import os
from dataclasses import dataclass
from enum import Enum
from pathlib import Path


class ProvenanceType(str, Enum):
    """Explicit classification of where content or claims originate."""

    UNKNOWN = "UNKNOWN"
    VERIFIED_USER_SOURCE = "VERIFIED_USER_SOURCE"
    PYTHON_DETERMINISTIC = "PYTHON_DETERMINISTIC"
    STARTER_CURRICULUM_UNRECONCILED = "STARTER_CURRICULUM_UNRECONCILED"
    AI_GENERAL_KNOWLEDGE = "AI_GENERAL_KNOWLEDGE"
    AI_GENERATED_DRAFT_UNVERIFIED = "AI_GENERATED_DRAFT_UNVERIFIED"

    @property
    def human_label(self) -> str:
        labels = {
            ProvenanceType.UNKNOWN: "Unknown / Not Recorded",
            ProvenanceType.VERIFIED_USER_SOURCE: "Verified User Source (Textbook / Standard)",
            ProvenanceType.PYTHON_DETERMINISTIC: "Verified Python Deterministic Solver",
            ProvenanceType.STARTER_CURRICULUM_UNRECONCILED: "Starter Baseline (Unreconciled with User Library)",
            ProvenanceType.AI_GENERAL_KNOWLEDGE: "Model General Knowledge (Unsourced Synthesis)",
            ProvenanceType.AI_GENERATED_DRAFT_UNVERIFIED: "Unverified Draft / Requires Review",
        }
        return labels[self]


class MasteryState(str, Enum):
    """Competency mastery states tracked per learning objective."""

    NOT_ASSESSED = "Not assessed"
    EMERGING = "Emerging"
    DEVELOPING = "Developing"
    PROVISIONAL = "Provisional"
    SECURE = "Secure"


@dataclass(frozen=True)
class SignConventionSpec:
    """Explicit UK structural engineering sign and plotting convention."""

    id: str = "UK_TENSION_FACE_STANDARD"
    name: str = "UK Structural Convention (BMD on Tension Face)"
    bending_positive_meaning: str = "Sagging (+)"
    bending_negative_meaning: str = "Hogging (-)"
    bmd_plot_positive_direction: str = "Downward (Tension Face of Horizontal Beam)"
    bmd_plot_negative_direction: str = "Upward (Top Face in Tension)"
    shear_positive_meaning: str = "Upward on Left Cut Face / Downward on Right Cut Face (+)"
    axial_positive_meaning: str = "Tension (+), Compression (-)"
    summary_banner: str = (
        "Convention: Sagging = +M (plotted downward on tension face) | "
        "Hogging = -M (plotted upward) | Shear: Left ↑ / Right ↓ = +V"
    )


DEFAULT_SIGN_CONVENTION = SignConventionSpec()


@dataclass
class AppConfig:
    """Runtime configuration and local storage paths."""

    app_name: str = "StructTutor"
    version: str = "0.1.0"
    data_dir: Path = Path("data")
    db_filename: str = "structtutor.db"
    ai_enabled: bool = False
    ollama_host: str = "http://127.0.0.1:11434"
    ollama_model: str = ""

    @classmethod
    def load(cls, custom_data_dir: Path | None = None) -> "AppConfig":
        env_dir = os.environ.get("STRUCTTUTOR_DATA_DIR")
        if custom_data_dir is not None:
            resolved_dir = Path(custom_data_dir)
        elif env_dir:
            resolved_dir = Path(env_dir)
        else:
            project_root = Path(__file__).resolve().parents[2]
            resolved_dir = project_root / "data"

        resolved_dir.mkdir(parents=True, exist_ok=True)
        (resolved_dir / "backups").mkdir(parents=True, exist_ok=True)
        return cls(data_dir=resolved_dir)

    @property
    def db_path(self) -> Path:
        return self.data_dir / self.db_filename

    @property
    def backup_dir(self) -> Path:
        return self.data_dir / "backups"

    @property
    def starter_curriculum_path(self) -> Path:
        return Path(__file__).resolve().parent / "content" / "starter_curriculum.json"

    @property
    def master_syllabus_path(self) -> Path:
        return Path(__file__).resolve().parent / "content" / "master_syllabus_2026.json"

    @property
    def phase2_questions_path(self) -> Path:
        return Path(__file__).resolve().parent / "content" / "phase2_questions.json"

    @property
    def milestone2_questions_path(self) -> Path:
        return Path(__file__).resolve().parent / "content" / "milestone2_mechanics_questions.json"