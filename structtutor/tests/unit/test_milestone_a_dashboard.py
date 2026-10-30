"""Automated unit and integration tests for Milestone A: Professional Dashboard and Design System."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
import tempfile
import unittest

from structtutor.config import MasteryState
from structtutor.domain.practice_core import PracticeService
from structtutor.domain.units import convert_value
from structtutor.storage.database import DatabaseManager
from structtutor.storage.repositories import (
    CurriculumRepository,
    DomainProgressSummary,
    RecentActivityItem,
)
from structtutor.ui.theme import (
    COLORS,
    DARK_STYLESHEET,
    DOMAIN_ACCENT_COLORS,
    MASTERY_BADGE_SPECS,
    NAV_ICONS,
    SPACING,
    TYPOGRAPHY,
    format_mastery_badge_qss,
    format_mastery_badge_text,
    get_domain_accent,
    get_mastery_badge_spec,
)

ROOT = Path(__file__).resolve().parents[2]
CURRICULUM_JSON = ROOT / "src" / "structtutor" / "content" / "starter_curriculum.json"
PHASE2_QUESTIONS_JSON = ROOT / "src" / "structtutor" / "content" / "phase2_questions.json"


class MilestoneADashboardTests(unittest.TestCase):
    """Verify Milestone A design system tokens, dashboard repository queries, and real progress reflection."""

    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp.name) / "structtutor_milestone_a.db"
        self.db = DatabaseManager(self.db_path)
        self.db.initialize(starter_curriculum_path=CURRICULUM_JSON)
        self.repo = CurriculumRepository(self.db)
        self.practice = PracticeService(self.db.connect, convert_value)
        self.practice.seed(PHASE2_QUESTIONS_JSON)
        self.t0 = datetime(2026, 4, 20, 9, 0, tzinfo=timezone.utc)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_design_system_tokens_and_stylesheet_completeness(self) -> None:
        """Ensure shared design tokens, navigation icons, and QSS selectors are defined."""
        for required_color in (
            "canvas",
            "surface",
            "surface_card",
            "sidebar",
            "border_default",
            "text_primary",
            "text_secondary",
            "text_muted",
            "primary",
            "accent_sky",
            "success",
            "warning",
            "danger",
        ):
            self.assertIn(required_color, COLORS)
            self.assertTrue(COLORS[required_color].startswith("#"))

        for required_nav in ("home", "map", "practice", "units", "roadmap"):
            self.assertIn(required_nav, NAV_ICONS)
            self.assertTrue(len(NAV_ICONS[required_nav]) >= 1)

        for selector in (
            "QFrame#HeroCard",
            "QFrame#Card",
            "QFrame#MetricCard",
            "QFrame#TopicCard",
            "QFrame#ActivityRow",
            "QPushButton#PrimaryButton",
            "QPushButton#SecondaryButton",
            "QPushButton#NavButton",
            "QProgressBar#CurriculumProgress",
        ):
            self.assertIn(selector, DARK_STYLESHEET)

        self.assertGreater(SPACING["page_margin_x"], 0)
        self.assertIn("font_sans", TYPOGRAPHY)
        self.assertIn("font_mono", TYPOGRAPHY)

    def test_mastery_badges_use_distinct_non_color_only_glyphs(self) -> None:
        """Verify each MasteryState has a distinct geometric glyph, label, and QSS rule."""
        glyphs = set()
        for state in MasteryState:
            spec = get_mastery_badge_spec(state)
            self.assertEqual(spec["label"], state.value)
            self.assertTrue(spec["glyph"])
            glyphs.add(spec["glyph"])
            text = format_mastery_badge_text(state)
            self.assertIn(spec["glyph"], text)
            self.assertIn(state.value, text)
            qss = format_mastery_badge_qss(state)
            self.assertIn(spec["bg"], qss)
            self.assertIn(spec["fg"], qss)

        # All 5 states must have distinct glyphs so state is never communicated by hue alone
        self.assertEqual(len(glyphs), 5)

    def test_domain_accent_colors_cover_all_eight_domains(self) -> None:
        """Verify all 8 curriculum domains A–H have dedicated accent colours."""
        for code in ("A", "B", "C", "D", "E", "F", "G", "H"):
            self.assertIn(code, DOMAIN_ACCENT_COLORS)
            self.assertTrue(get_domain_accent(code).startswith("#"))
        # Unknown domain falls back cleanly
        self.assertEqual(get_domain_accent("Z"), COLORS["accent_sky"])

    def test_zero_state_dashboard_summary_is_honest_and_complete(self) -> None:
        """Verify fresh database reports 0 assessed objectives, 0 attempts, and 8 domain summaries."""
        summary = self.repo.get_dashboard_summary()
        self.assertEqual(summary["total_objectives"], 19)
        self.assertEqual(summary["assessed_objectives"], 0)
        self.assertEqual(summary["attempts_count"], 0)
        self.assertEqual(summary["sources_count"], 0)
        self.assertEqual(summary["state_counts"][MasteryState.NOT_ASSESSED.value], 19)
        self.assertEqual(summary["state_counts"][MasteryState.SECURE.value], 0)
        self.assertEqual(summary["recent_activity"], [])

        domains = summary["domain_summaries"]
        self.assertEqual(len(domains), 8)
        self.assertTrue(all(isinstance(d, DomainProgressSummary) for d in domains))
        self.assertEqual([d.domain_code for d in domains], ["A", "B", "C", "D", "E", "F", "G", "H"])
        self.assertEqual(sum(d.total_objectives for d in domains), 19)
        self.assertEqual(sum(d.assessed_objectives for d in domains), 0)

        # Domain A has 3 Phase 2 questions (MATH-01); Domain B has 6 (STAT-01 and STAT-02); C-H have 0
        dom_by_code = {d.domain_code: d for d in domains}
        self.assertEqual(dom_by_code["A"].practice_question_count, 3)
        self.assertEqual(dom_by_code["A"].first_practice_objective_id, "MATH-01")
        self.assertEqual(dom_by_code["B"].practice_question_count, 6)
        self.assertEqual(dom_by_code["B"].first_practice_objective_id, "STAT-01")
        for code in ("C", "D", "E", "F", "G", "H"):
            self.assertEqual(dom_by_code[code].practice_question_count, 0)
            self.assertIsNone(dom_by_code[code].first_practice_objective_id)

    def test_dashboard_updates_from_real_attempts_and_persists_across_reopen(self) -> None:
        """Verify submitting practice attempts updates domain progress, recent activity, and mastery counts."""
        # 1. Submit an independent correct answer on P2-UNITS-01 (MATH-01, Domain A)
        fb1, state1 = self.practice.submit("P2-UNITS-01", "3000000", "N·mm", 0, "High", now=self.t0)
        self.assertTrue(fb1.correct)
        self.assertEqual(state1, MasteryState.DEVELOPING.value)

        # 2. Submit a wrong choice on P2-FBD-01 (STAT-01, Domain B)
        fb2, state2 = self.practice.submit(
            "P2-FBD-01", "c", None, 1, "Low", now=self.t0 + timedelta(minutes=5)
        )
        self.assertFalse(fb2.correct)
        self.assertEqual(state2, MasteryState.EMERGING.value)

        # Re-open repository on the same SQLite database to verify durable persistence
        fresh_db = DatabaseManager(self.db_path)
        fresh_repo = CurriculumRepository(fresh_db)
        summary = fresh_repo.get_dashboard_summary()

        self.assertEqual(summary["attempts_count"], 2)
        self.assertEqual(summary["assessed_objectives"], 2)
        self.assertEqual(summary["state_counts"][MasteryState.DEVELOPING.value], 1)
        self.assertEqual(summary["state_counts"][MasteryState.EMERGING.value], 1)
        self.assertEqual(summary["state_counts"][MasteryState.NOT_ASSESSED.value], 17)

        dom_by_code = {d.domain_code: d for d in summary["domain_summaries"]}
        self.assertEqual(dom_by_code["A"].assessed_objectives, 1)
        self.assertEqual(dom_by_code["A"].developing_objectives, 1)
        self.assertEqual(dom_by_code["B"].assessed_objectives, 1)
        self.assertEqual(dom_by_code["B"].emerging_objectives, 1)

        recent = summary["recent_activity"]
        self.assertEqual(len(recent), 2)
        self.assertTrue(all(isinstance(item, RecentActivityItem) for item in recent))
        # Ordered newest first
        self.assertEqual(recent[0].question_id, "P2-FBD-01")
        self.assertEqual(recent[0].question_title, "Pin and roller reactions")
        self.assertEqual(recent[0].objective_id, "STAT-01")
        self.assertFalse(recent[0].is_correct)
        self.assertEqual(recent[0].hints_used, 1)
        self.assertEqual(recent[0].misconception_id, "MISC-STAT-FBD-OMITTED-REACTION")

        self.assertEqual(recent[1].question_id, "P2-UNITS-01")
        self.assertEqual(recent[1].question_title, "Moment conversion")
        self.assertEqual(recent[1].objective_id, "MATH-01")
        self.assertTrue(recent[1].is_correct)
        self.assertEqual(recent[1].hints_used, 0)

    def test_recent_activity_limit_is_respected(self) -> None:
        """Verify list_recent_activity respects its limit parameter."""
        for idx, qid in enumerate(("P2-UNITS-01", "P2-UNITS-02", "P2-UNITS-03")):
            ans = "3000000" if qid == "P2-UNITS-01" else ("27" if qid == "P2-UNITS-02" else "400")
            unit = "N·mm" if qid == "P2-UNITS-01" else ("MPa" if qid == "P2-UNITS-02" else "mm²")
            self.practice.submit(qid, ans, unit, 0, now=self.t0 + timedelta(minutes=idx))

        limited = self.repo.list_recent_activity(limit=2)
        self.assertEqual(len(limited), 2)
        self.assertEqual([item.question_id for item in limited], ["P2-UNITS-03", "P2-UNITS-02"])


if __name__ == "__main__":
    unittest.main()
