"""Application bootstrap for StructTutor."""

from __future__ import annotations

import sys
from pathlib import Path

from PySide6.QtWidgets import QApplication

from structtutor.config import AppConfig
from structtutor.domain.practice_core import PracticeError, PracticeService
from structtutor.domain.units import convert_value
from structtutor.storage.database import DatabaseManager
from structtutor.storage.repositories import CurriculumRepository
from structtutor.ui.main_window import MainWindow


def create_initialized_database(config: AppConfig) -> DatabaseManager:
    """Initialize SQLite schema and seed baseline curriculum + Master Syllabus idempotently."""
    db = DatabaseManager(config.db_path)
    db.initialize(
        starter_curriculum_path=config.starter_curriculum_path,
        master_syllabus_path=config.master_syllabus_path,
    )
    return db



def main(custom_data_dir: Path | None = None) -> int:
    """Launch the PySide6 StructTutor desktop application."""
    config = AppConfig.load(custom_data_dir=custom_data_dir)
    db = create_initialized_database(config)
    curriculum_repo = CurriculumRepository(db)
    practice_service = PracticeService(db.connect, convert_value)
    practice_error = ""
    try:
        practice_service.seed(config.phase2_questions_path)
        if config.milestone2_questions_path.exists():
            practice_service.seed_syllabus_bank(config.milestone2_questions_path)
    except PracticeError as exc:
        practice_error = str(exc)
        practice_service = None

    app = QApplication.instance() or QApplication(sys.argv)
    app.setApplicationName(config.app_name)
    app.setApplicationVersion(config.version)

    window = MainWindow(
        config=config,
        curriculum_repo=curriculum_repo,
        practice_service=practice_service,
        practice_error=practice_error,
    )
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())