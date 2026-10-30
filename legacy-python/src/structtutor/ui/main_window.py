"""Main desktop window and Master Syllabus (Modules 0–19) Dashboard for StructTutor."""

from __future__ import annotations

from typing import Dict, List, Optional

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QComboBox,
    QDoubleSpinBox,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QMainWindow,
    QProgressBar,
    QPushButton,
    QScrollArea,
    QSplitter,
    QStackedWidget,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from structtutor.config import AppConfig, DEFAULT_SIGN_CONVENTION, MasteryState
from structtutor.domain.curriculum import LearningObjective
from structtutor.domain.practice_core import PracticeService
from structtutor.domain.quantities import (
    Quantity,
    QuantityKind,
    calculate_elastic_bending_stress,
)
from structtutor.domain.syllabus import ContentAvailabilityStatus
from structtutor.domain.units import DimensionalError, UNIT_REGISTRY, convert_value
from structtutor.storage.repositories import (
    CurriculumRepository,
    DomainProgressSummary,
    PortfolioMilestoneRecord,
    RecentActivityItem,
    SyllabusModuleSummary,
    SyllabusProgressionRecommendation,
)
from structtutor.ui.practice_page import PracticePage
from structtutor.ui.theme import (
    COLORS,
    DARK_STYLESHEET,
    NAV_ICONS,
    SPACING,
    format_mastery_badge_qss,
    format_mastery_badge_text,
    get_domain_accent,
)


class MainWindow(QMainWindow):
    """Primary PySide6 desktop shell and Master Rebuild Syllabus Dashboard for StructTutor."""

    def __init__(
        self,
        config: AppConfig,
        curriculum_repo: CurriculumRepository,
        practice_service: PracticeService | None = None,
        practice_error: str = "",
    ) -> None:
        super().__init__()
        self.config = config
        self.curriculum_repo = curriculum_repo
        self.practice_service = practice_service
        self.practice_error = practice_error
        self.nav_buttons: Dict[str, QPushButton] = {}
        self.objectives_cache: List[LearningObjective] = []
        self.modules_cache: List[SyllabusModuleSummary] = []

        self.setWindowTitle(
            f"{self.config.app_name} v{self.config.version} — Rebuild Syllabus (Modules 0–19)"
        )
        self.resize(1360, 880)
        self.setStyleSheet(DARK_STYLESHEET)

        root_widget = QWidget()
        root_layout = QVBoxLayout(root_widget)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # 1. Persistent Top Convention & Provenance Status Banner
        root_layout.addWidget(self._build_top_banner())

        # 2. Main Body (Sidebar + Stacked Pages)
        body_layout = QHBoxLayout()
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        body_layout.addWidget(self._build_sidebar())

        self.stack = QStackedWidget()
        self.page_indices: Dict[str, int] = {}

        self.practice_page = PracticePage(
            self.practice_service,
            self.practice_error,
            self.curriculum_repo,
        )

        self._add_page("home", self._build_home_page())
        self._add_page("map", self._build_learning_map_page())
        self._add_page("practice", self.practice_page)
        self._add_page("units", self._build_units_inspector_page())
        self._add_page("roadmap", self._build_roadmap_page())

        body_layout.addWidget(self.stack, stretch=1)
        root_layout.addLayout(body_layout, stretch=1)

        self.setCentralWidget(root_widget)
        self._switch_page("home")

    # ------------------------------------------------------------------
    # Shared Shell & Navigation
    # ------------------------------------------------------------------
    def _build_top_banner(self) -> QFrame:
        banner = QFrame()
        banner.setObjectName("TopConventionBanner")
        layout = QHBoxLayout(banner)
        layout.setContentsMargins(16, 6, 16, 6)

        conv_label = QLabel(DEFAULT_SIGN_CONVENTION.summary_banner)
        conv_label.setObjectName("Badge")

        ai_status = "AI: Disabled (Deterministic Python Core)" if not self.config.ai_enabled else "AI: Enabled"
        status_label = QLabel(f"Local SQLite: {self.config.db_path.name}  ·  {ai_status}")
        status_label.setObjectName("MonoMeta")

        layout.addWidget(conv_label)
        layout.addStretch()
        layout.addWidget(status_label)
        return banner

    def _build_sidebar(self) -> QFrame:
        sidebar = QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setFixedWidth(254)
        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(14, 18, 14, 18)
        layout.setSpacing(6)

        brand = QLabel("StructTutor")
        brand.setStyleSheet(
            f"font-size: 21px; font-weight: 800; color: {COLORS['accent_sky']}; padding-bottom: 2px;"
        )
        subtitle = QLabel("Rebuild Syllabus (27 July 2026)")
        subtitle.setStyleSheet(
            f"font-size: 11px; color: {COLORS['text_dim']}; padding-bottom: 14px;"
        )
        layout.addWidget(brand)
        layout.addWidget(subtitle)

        nav_items = [
            ("home", "Home Dashboard"),
            ("map", "Learning Map (Mod 0–19)"),
            ("practice", "Tutor & Practice"),
            ("units", "Units & Quantities Lab"),
            ("roadmap", "Study Rules & Portfolio"),
        ]

        for key, label in nav_items:
            icon = NAV_ICONS.get(key, "•")
            btn = QPushButton(f"{icon}   {label}")
            btn.setObjectName("NavButton")
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.clicked.connect(lambda checked=False, k=key: self._switch_page(k))
            self.nav_buttons[key] = btn
            layout.addWidget(btn)

        layout.addStretch()

        self.sidebar_status_label = QLabel()
        self.sidebar_status_label.setObjectName("MonoMeta")
        self.sidebar_status_label.setWordWrap(True)
        layout.addWidget(self.sidebar_status_label)

        footer = QLabel(
            "Educational learning portfolio only.\n"
            "Not construction-ready design. Independent checking required."
        )
        footer.setWordWrap(True)
        footer.setStyleSheet(f"color: {COLORS['text_dim']}; font-size: 11px; padding-top: 6px;")
        layout.addWidget(footer)
        return sidebar

    def _update_sidebar_status(self, summary: Dict[str, object]) -> None:
        total = int(summary.get("total_objectives", 19))  # type: ignore[arg-type]
        assessed = int(summary.get("assessed_objectives", 0))  # type: ignore[arg-type]
        attempts = int(summary.get("attempts_count", 0))  # type: ignore[arg-type]
        modules: List[SyllabusModuleSummary] = summary.get("syllabus_modules", [])  # type: ignore[assignment]
        self.sidebar_status_label.setText(
            f"Syllabus: {len(modules)} Modules (0–19)\n"
            f"Objectives: {assessed}/{total} assessed\n"
            f"Saved attempts: {attempts}"
        )

    def _add_page(self, key: str, widget: QWidget) -> None:
        idx = self.stack.addWidget(widget)
        self.page_indices[key] = idx

    def _switch_page(self, key: str) -> None:
        if key == "home":
            idx = self.page_indices["home"]
            old_page = self.stack.widget(idx)
            new_page = self._build_home_page()
            self.stack.removeWidget(old_page)
            self.stack.insertWidget(idx, new_page)
            old_page.deleteLater()
        elif key == "map":
            self._refresh_modules_table()
            self._refresh_objectives_table()
        for nav_key, btn in self.nav_buttons.items():
            btn.setProperty("active", "true" if nav_key == key else "false")
            btn.style().unpolish(btn)
            btn.style().polish(btn)
        self.stack.setCurrentIndex(self.page_indices[key])

    def open_practice_for(
        self,
        objective_id: Optional[str] = None,
        question_id: Optional[str] = None,
        module_number: Optional[int] = None,
    ) -> None:
        """Navigate directly to Tutor & Practice and pre-select the requested objective/question."""
        self.practice_page.open_objective_question(objective_id, question_id, module_number=module_number)
        self._switch_page("practice")

    def open_map_for_domain(self, domain_code: str = "") -> None:
        """Navigate directly to Learning Map filtered to the requested domain code."""
        idx = self.domain_filter.findData(domain_code)
        if idx >= 0:
            self.domain_filter.blockSignals(True)
            self.domain_filter.setCurrentIndex(idx)
            self.domain_filter.blockSignals(False)
        self._switch_page("map")

    def open_map_for_module(self, module_number: int) -> None:
        """Navigate directly to Learning Map and select the requested syllabus module (0–19)."""
        self.pathway_filter.blockSignals(True)
        self.pathway_filter.setCurrentIndex(0)
        self.pathway_filter.blockSignals(False)
        self._switch_page("map")
        for row_idx, mod in enumerate(self.modules_cache):
            if mod.module_number == module_number:
                self.mod_table.selectRow(row_idx)
                break

    # ------------------------------------------------------------------
    # Page 1: Master Syllabus Home Dashboard
    # ------------------------------------------------------------------
    def _build_home_page(self) -> QWidget:
        outer = QWidget()
        outer_layout = QVBoxLayout(outer)
        outer_layout.setContentsMargins(0, 0, 0, 0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        outer_layout.addWidget(scroll)

        page = QWidget()
        scroll.setWidget(page)
        layout = QVBoxLayout(page)
        layout.setContentsMargins(
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
        )
        layout.setSpacing(SPACING["section_gap"])

        summary = self.curriculum_repo.get_dashboard_summary()
        self._update_sidebar_status(summary)

        objectives_by_id = {o.id: o for o in self.curriculum_repo.list_objectives()}
        rec_obj: Optional[LearningObjective] = summary["recommended_objective"]  # type: ignore[assignment]
        syl_rec: Optional[SyllabusProgressionRecommendation] = summary.get("syllabus_recommendation")  # type: ignore[assignment]
        syllabus_modules: List[SyllabusModuleSummary] = summary.get("syllabus_modules", [])  # type: ignore[assignment]
        portfolio_milestones: List[PortfolioMilestoneRecord] = summary.get("portfolio_milestones", [])  # type: ignore[assignment]
        q_titles: Dict[str, str] = summary.get("question_titles", {})  # type: ignore[assignment]
        recent_activity: List[RecentActivityItem] = summary.get("recent_activity", [])  # type: ignore[assignment]
        domain_summaries: List[DomainProgressSummary] = summary.get("domain_summaries", [])  # type: ignore[assignment]
        attempts_count = int(summary.get("attempts_count", 0))  # type: ignore[arg-type]
        total_objectives = int(summary.get("total_objectives", 19))  # type: ignore[arg-type]
        assessed_objectives = int(summary.get("assessed_objectives", 0))  # type: ignore[arg-type]
        state_counts: Dict[str, int] = summary.get("state_counts", {})  # type: ignore[assignment]

        # Determine active interactive practice recommendation
        preferred_obj_id = recent_activity[0].objective_id if recent_activity else None
        recommendation = (
            self.practice_service.recommend(preferred_obj_id)
            if self.practice_service
            else None
        )
        rec_q_id: Optional[str] = None
        rec_q_title: str = ""
        rec_why: str = (
            syl_rec.rationale
            if syl_rec
            else "Foundation selection; practice recommendation unavailable."
        )
        if recommendation:
            rec_obj = objectives_by_id.get(recommendation[0], rec_obj)
            rec_q_id = recommendation[1]
            rec_q_title = q_titles.get(rec_q_id, rec_q_id)
            if syl_rec:
                rec_why = f"{syl_rec.rationale} ({recommendation[2]})"
            else:
                rec_why = recommendation[2]

        # --------------------------------------------------------------
        # Section 1: Welcoming Header & Primary Continue Learning Hero
        # --------------------------------------------------------------
        header_row = QHBoxLayout()
        title_box = QVBoxLayout()
        title_box.setSpacing(2)
        title = QLabel("Home Dashboard — Comprehensive Structural Engineering Rebuild Syllabus")
        title.setObjectName("PageTitle")
        subtitle = QLabel(
            "27 July 2026 Master Syllabus · 20 Modules (0–19) · 6 Portfolio Milestones (A–F) · 2–3 hrs/week Study Rhythm"
        )
        subtitle.setObjectName("PageSubtitle")
        title_box.addWidget(title)
        title_box.addWidget(subtitle)
        header_row.addLayout(title_box)
        header_row.addStretch()
        layout.addLayout(header_row)

        hero_card = QFrame()
        hero_card.setObjectName("HeroCard")
        hero_layout = QVBoxLayout(hero_card)
        hero_layout.setSpacing(10)

        active_mod_label = (
            f"STARTING POINT: {syl_rec.recommended_module.title.upper()} ({syl_rec.recommended_module.suggested_duration.upper()})"
            if syl_rec
            else "STARTING POINT: MODULE 0 — ENGINEERING MATHS, UNITS AND PHYSICAL QUANTITIES"
        )
        welcome_kicker = QLabel(active_mod_label)
        welcome_kicker.setObjectName("MonoMeta")

        if attempts_count > 0 and rec_obj:
            hero_headline = QLabel(
                f"Continue Year 1 Pathway: [{rec_obj.id}] {rec_obj.title}"
            )
            hero_desc_text = (
                f"You have recorded {attempts_count} practice attempt{'s' if attempts_count != 1 else ''} across "
                f"{assessed_objectives} of {total_objectives} core objectives. "
                f"Next verified check: {rec_q_id} ({rec_q_title}). {rec_why}"
            )
        else:
            hero_headline = QLabel(
                "Begin at Module 0, Build Year 1 Mechanics Foundations (Modules 1–8), and Progress Through Modules 9–19"
            )
            hero_desc_text = (
                f"Your progress is stored locally in '{self.config.db_path.name}'. "
                "Follow the 5-step study rule (Explain plainly -> Sketch -> Calculate by hand -> Check source -> "
                "State assumptions & limits) at 2–3 focused hours per week, with every 4th week reserved for consolidation."
            )

        hero_headline.setObjectName("HeroTitle")
        hero_headline.setWordWrap(True)

        hero_desc = QLabel(hero_desc_text)
        hero_desc.setWordWrap(True)
        hero_desc.setStyleSheet(f"color: {COLORS['text_secondary']}; font-size: 13px;")

        hero_actions = QHBoxLayout()
        hero_actions.setSpacing(10)

        continue_label = (
            f"Continue Learning: {rec_q_id} — {rec_q_title}"
            if (attempts_count > 0 and rec_q_id)
            else (
                f"Start Module 0 Practice: {rec_q_id} — {rec_q_title}"
                if rec_q_id
                else "Open Tutor & Practice"
            )
        )
        self.btn_continue_learning = QPushButton(continue_label)
        self.btn_continue_learning.setObjectName("PrimaryButton")
        self.btn_continue_learning.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_continue_learning.setEnabled(self.practice_service is not None)
        self.btn_continue_learning.clicked.connect(
            lambda checked=False, oid=(rec_obj.id if rec_obj else None), qid=rec_q_id: self.open_practice_for(oid, qid)
        )

        btn_explore_map = QPushButton("Explore All 20 Syllabus Modules (0–19)")
        btn_explore_map.setObjectName("SecondaryButton")
        btn_explore_map.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_explore_map.clicked.connect(lambda: self._switch_page("map"))

        btn_study_rules = QPushButton("5-Step Study Rules, Calc-Note & Milestones (A–F)")
        btn_study_rules.setObjectName("SecondaryButton")
        btn_study_rules.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_study_rules.clicked.connect(lambda: self._switch_page("roadmap"))

        btn_open_units = QPushButton("Units & Quantities Lab")
        btn_open_units.setObjectName("SecondaryButton")
        btn_open_units.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_open_units.clicked.connect(lambda: self._switch_page("units"))

        hero_actions.addWidget(self.btn_continue_learning)
        hero_actions.addWidget(btn_explore_map)
        hero_actions.addWidget(btn_study_rules)
        hero_actions.addWidget(btn_open_units)
        hero_actions.addStretch()

        hero_layout.addWidget(welcome_kicker)
        hero_layout.addWidget(hero_headline)
        hero_layout.addWidget(hero_desc)
        hero_layout.addLayout(hero_actions)
        layout.addWidget(hero_card)

        # --------------------------------------------------------------
        # Section 2: Curriculum Progress & Key Platform Metrics
        # --------------------------------------------------------------
        progress_card = QFrame()
        progress_card.setObjectName("Card")
        prog_layout = QVBoxLayout(progress_card)
        prog_layout.setSpacing(12)

        prog_header_row = QHBoxLayout()
        prog_title = QLabel("Curriculum Progress & Mastery Distribution")
        prog_title.setObjectName("SectionHeader")
        prog_summary_lbl = QLabel(
            f"20 Syllabus Modules (0–19)  ·  "
            f"{assessed_objectives} of {total_objectives} Core Objectives Assessed  ·  "
            f"{state_counts.get(MasteryState.SECURE.value, 0)} Secure  ·  "
            f"{attempts_count} Total Attempts"
        )
        prog_summary_lbl.setObjectName("MonoMeta")
        prog_header_row.addWidget(prog_title)
        prog_header_row.addStretch()
        prog_header_row.addWidget(prog_summary_lbl)
        prog_layout.addLayout(prog_header_row)

        self.curriculum_progress_bar = QProgressBar()
        self.curriculum_progress_bar.setObjectName("CurriculumProgress")
        self.curriculum_progress_bar.setRange(0, max(1, total_objectives))
        self.curriculum_progress_bar.setValue(assessed_objectives)
        pct = round((assessed_objectives / total_objectives) * 100) if total_objectives else 0
        self.curriculum_progress_bar.setFormat(
            f"Assessed Coverage: {assessed_objectives}/{total_objectives} ({pct}%)"
        )
        prog_layout.addWidget(self.curriculum_progress_bar)

        badges_row = QHBoxLayout()
        badges_row.setSpacing(8)
        for st in (
            MasteryState.SECURE,
            MasteryState.PROVISIONAL,
            MasteryState.DEVELOPING,
            MasteryState.EMERGING,
            MasteryState.NOT_ASSESSED,
        ):
            count = state_counts.get(st.value, 0)
            pill = QLabel(f"{format_mastery_badge_text(st)}: {count}")
            pill.setStyleSheet(format_mastery_badge_qss(st))
            badges_row.addWidget(pill)
        badges_row.addStretch()
        prog_layout.addLayout(badges_row)

        metrics_row = QHBoxLayout()
        metrics_row.setSpacing(12)
        year1_mods = [m for m in syllabus_modules if m.module_number <= 8]
        adv_mods = [m for m in syllabus_modules if m.module_number >= 9]
        metrics_data = [
            (
                "Master Syllabus Modules",
                f"{len(syllabus_modules)} Modules (0–19)",
                f"{len(year1_mods)} Year 1 (Mod 0–8) · {len(adv_mods)} Advanced (Mod 9–19)",
            ),
            (
                "Portfolio Milestones",
                f"{len(portfolio_milestones)} Milestones (A–F)",
                "35-problem Mechanics Portfolio -> Integrated Scheme",
            ),
            (
                "Recorded Attempts",
                str(attempts_count),
                "Stored in attempt_evidence" if attempts_count > 0 else "Honest zero-state until practice begins",
            ),
            (
                "Study Rhythm & Cadence",
                "2–3 hrs / week",
                "3 weekly sessions + Every 4th week consolidation",
            ),
        ]
        for m_title, m_val, m_sub in metrics_data:
            m_card = QFrame()
            m_card.setObjectName("MetricCard")
            m_lay = QVBoxLayout(m_card)
            m_lay.setSpacing(4)
            lbl_t = QLabel(m_title)
            lbl_t.setObjectName("MutedText")
            lbl_v = QLabel(m_val)
            lbl_v.setStyleSheet(f"font-size: 20px; font-weight: 800; color: {COLORS['text_primary']};")
            lbl_s = QLabel(m_sub)
            lbl_s.setStyleSheet(f"color: {COLORS['accent_sky']}; font-size: 11px;")
            m_lay.addWidget(lbl_t)
            m_lay.addWidget(lbl_v)
            m_lay.addWidget(lbl_s)
            metrics_row.addWidget(m_card)

        prog_layout.addLayout(metrics_row)
        layout.addWidget(progress_card)

        # --------------------------------------------------------------
        # Section 3: Recommended Next Lesson + Recent Activity (2-Col Split)
        # --------------------------------------------------------------
        middle_row = QHBoxLayout()
        middle_row.setSpacing(SPACING["grid_gap"])

        rec_card = QFrame()
        rec_card.setObjectName("Card")
        r_lay = QVBoxLayout(rec_card)
        r_lay.setSpacing(10)

        r_hdr_row = QHBoxLayout()
        r_hdr = QLabel("Recommended Next Lesson (Prerequisite-Gated)")
        r_hdr.setObjectName("SectionHeader")
        r_hdr_row.addWidget(r_hdr)
        r_hdr_row.addStretch()
        if rec_obj:
            state_badge = QLabel(format_mastery_badge_text(rec_obj.mastery_state))
            state_badge.setStyleSheet(format_mastery_badge_qss(rec_obj.mastery_state))
            r_hdr_row.addWidget(state_badge)
        r_lay.addLayout(r_hdr_row)

        if rec_obj:
            mod_header_txt = (
                f"{syl_rec.recommended_module.title.upper()} · {syl_rec.recommended_module.year1_months.upper()}"
                if syl_rec
                else f"DOMAIN {rec_obj.domain_code} · {rec_obj.domain_title.upper()}"
            )
            r_domain = QLabel(mod_header_txt)
            r_domain.setObjectName("MonoMeta")
            r_title = QLabel(f"[{rec_obj.id}] {rec_obj.title}")
            r_title.setObjectName("CardTitle")
            r_title.setWordWrap(True)

            r_comp = QLabel(f"Observable Competency: {rec_obj.observable_competency}")
            r_comp.setWordWrap(True)
            r_comp.setStyleSheet(f"color: {COLORS['text_secondary']};")

            r_why = QLabel(f"Why Recommended: {rec_why}")
            r_why.setWordWrap(True)
            r_why.setObjectName("MutedText")

            r_lay.addWidget(r_domain)
            r_lay.addWidget(r_title)
            if syl_rec and syl_rec.recommended_worked_example:
                ex = syl_rec.recommended_worked_example
                ex_lbl = QLabel(f"Syllabus Worked Example: {ex.code} — {ex.title}")
                ex_lbl.setStyleSheet(f"color: {COLORS['accent_sky']}; font-weight: 600;")
                r_lay.addWidget(ex_lbl)
            elif rec_q_id:
                r_item_lbl = QLabel(f"Suggested Practice Item: {rec_q_id} — {rec_q_title}")
                r_item_lbl.setStyleSheet(f"color: {COLORS['accent_sky']}; font-weight: 600;")
                r_lay.addWidget(r_item_lbl)
            r_lay.addWidget(r_comp)
            r_lay.addWidget(r_why)

            r_lay.addStretch()

            rec_btn_row = QHBoxLayout()
            btn_start_rec = QPushButton(
                f"Practice {rec_q_id}" if rec_q_id else f"Open {rec_obj.id} in Practice"
            )
            btn_start_rec.setObjectName("PrimaryButton")
            btn_start_rec.setCursor(Qt.CursorShape.PointingHandCursor)
            btn_start_rec.setEnabled(self.practice_service is not None)
            btn_start_rec.clicked.connect(
                lambda checked=False, oid=rec_obj.id, qid=rec_q_id: self.open_practice_for(oid, qid)
            )

            target_mod_num = syl_rec.recommended_module.module_number if syl_rec else 0
            btn_view_prereqs = QPushButton(f"Inspect Module {target_mod_num} Gate & Examples")
            btn_view_prereqs.setObjectName("SecondaryButton")
            btn_view_prereqs.setCursor(Qt.CursorShape.PointingHandCursor)
            btn_view_prereqs.clicked.connect(
                lambda checked=False, m=target_mod_num: self.open_map_for_module(m)
            )

            rec_btn_row.addWidget(btn_start_rec)
            rec_btn_row.addWidget(btn_view_prereqs)
            rec_btn_row.addStretch()
            r_lay.addLayout(rec_btn_row)

        middle_row.addWidget(rec_card, stretch=6)

        act_card = QFrame()
        act_card.setObjectName("Card")
        act_lay = QVBoxLayout(act_card)
        act_lay.setSpacing(10)

        act_hdr_row = QHBoxLayout()
        act_hdr = QLabel("Recent Learning Activity")
        act_hdr.setObjectName("SectionHeader")
        act_count_lbl = QLabel(f"Latest {len(recent_activity)} of {attempts_count} saved")
        act_count_lbl.setObjectName("MonoMeta")
        act_hdr_row.addWidget(act_hdr)
        act_hdr_row.addStretch()
        act_hdr_row.addWidget(act_count_lbl)
        act_lay.addLayout(act_hdr_row)

        if not recent_activity:
            empty_lbl = QLabel(
                "No practice attempts recorded yet. Your completed checks, unit conversions, "
                "and diagnosed misconceptions will appear here with one-click retry links."
            )
            empty_lbl.setWordWrap(True)
            empty_lbl.setObjectName("MutedText")
            act_lay.addWidget(empty_lbl)
            act_lay.addStretch()

            btn_first_attempt = QPushButton("Begin Module 0 Practice Question")
            btn_first_attempt.setObjectName("SecondaryButton")
            btn_first_attempt.setCursor(Qt.CursorShape.PointingHandCursor)
            btn_first_attempt.setEnabled(self.practice_service is not None)
            btn_first_attempt.clicked.connect(
                lambda checked=False, oid=(rec_obj.id if rec_obj else None), qid=rec_q_id: self.open_practice_for(oid, qid)
            )
            act_lay.addWidget(btn_first_attempt)
        else:
            for item in recent_activity:
                row_frame = QFrame()
                row_frame.setObjectName("ActivityRow")
                row_lay = QHBoxLayout(row_frame)
                row_lay.setContentsMargins(10, 8, 10, 8)

                info_col = QVBoxLayout()
                info_col.setSpacing(2)
                status_glyph = "✓ Correct" if item.is_correct else "✗ Incorrect"
                status_color = COLORS["success"] if item.is_correct else COLORS["danger"]
                top_line = QLabel(
                    f"<span style='color:{status_color}; font-weight:700;'>{status_glyph}</span>  ·  "
                    f"<b>{item.question_id}</b> — {item.question_title}"
                )
                top_line.setWordWrap(True)

                meta_parts = [
                    f"Obj: {item.objective_id}",
                    f"Ans: {item.user_answer}",
                    f"Help: {item.hints_used}",
                    f"{item.attempted_at} UTC",
                ]
                if item.misconception_id:
                    meta_parts.append(f"Misc: {item.misconception_id}")
                sub_line = QLabel("  ·  ".join(meta_parts))
                sub_line.setObjectName("MonoMeta")
                sub_line.setWordWrap(True)

                info_col.addWidget(top_line)
                info_col.addWidget(sub_line)

                btn_retry = QPushButton("Open")
                btn_retry.setObjectName("SecondaryButton")
                btn_retry.setCursor(Qt.CursorShape.PointingHandCursor)
                btn_retry.clicked.connect(
                    lambda checked=False, oid=item.objective_id, qid=item.question_id: self.open_practice_for(oid, qid)
                )

                row_lay.addLayout(info_col, stretch=1)
                row_lay.addWidget(btn_retry)
                act_lay.addWidget(row_frame)
            act_lay.addStretch()

        middle_row.addWidget(act_card, stretch=6)
        layout.addLayout(middle_row)

        # --------------------------------------------------------------
        # Section 4: Year 1 Learning Pathway Modules (Modules 0–8)
        # --------------------------------------------------------------
        if syllabus_modules:
            y1_hdr_row = QHBoxLayout()
            y1_hdr = QLabel("Year 1 Learning Pathway: Module 0 (Starting Point) -> Modules 1–8")
            y1_hdr.setObjectName("SectionHeader")
            y1_sub = QLabel(
                "Modules 9–19 are also visible in the Learning Map from the beginning, gated by prerequisite mastery."
            )
            y1_sub.setObjectName("MutedText")
            y1_hdr_row.addWidget(y1_hdr)
            y1_hdr_row.addStretch()
            y1_hdr_row.addWidget(y1_sub)
            layout.addLayout(y1_hdr_row)

            mod_grid = QGridLayout()
            mod_grid.setSpacing(SPACING["grid_gap"])
            for idx, mod in enumerate([m for m in syllabus_modules if m.module_number <= 8]):
                m_card = QFrame()
                m_card.setObjectName("TopicCard")
                m_lay = QVBoxLayout(m_card)
                m_lay.setSpacing(6)

                top_bar = QHBoxLayout()
                m_badge = QLabel(f"{mod.code} · {mod.year1_months} ({mod.suggested_duration})")
                m_badge.setObjectName("MonoMeta")
                status_color = (
                    COLORS["accent_sky"]
                    if mod.content_status == ContentAvailabilityStatus.INTERACTIVE_QUESTIONS_AVAILABLE
                    else COLORS["text_muted"]
                )
                status_lbl = QLabel(mod.content_status.human_label)
                status_lbl.setStyleSheet(f"color: {status_color}; font-size: 11px; font-weight: 600;")
                top_bar.addWidget(m_badge)
                top_bar.addStretch()
                top_bar.addWidget(status_lbl)
                m_lay.addLayout(top_bar)

                m_title = QLabel(mod.title)
                m_title.setObjectName("CardTitle")
                m_title.setWordWrap(True)
                m_lay.addWidget(m_title)

                m_stats = QLabel(
                    f"Pathway: {mod.pathway_status_label}  ·  "
                    f"Worked Examples: {mod.worked_example_count}  ·  "
                    f"Gate Checks: {len(mod.gate_requirements)}"
                )
                m_stats.setObjectName("MutedText")
                m_stats.setWordWrap(True)
                m_lay.addWidget(m_stats)

                btn_row = QHBoxLayout()
                if mod.interactive_question_count > 0 and mod.first_practice_objective_id:
                    btn_p = QPushButton(f"Practice ({mod.first_practice_objective_id})")
                    btn_p.setObjectName("PrimaryButton")
                    btn_p.setCursor(Qt.CursorShape.PointingHandCursor)
                    btn_p.clicked.connect(
                        lambda checked=False, oid=mod.first_practice_objective_id, m_num=mod.module_number: self.open_practice_for(oid, None, m_num)
                    )
                    btn_row.addWidget(btn_p)

                btn_inspect = QPushButton(f"Open {mod.code} Syllabus & Gate")
                btn_inspect.setObjectName("SecondaryButton")
                btn_inspect.setCursor(Qt.CursorShape.PointingHandCursor)
                btn_inspect.clicked.connect(
                    lambda checked=False, m_num=mod.module_number: self.open_map_for_module(m_num)
                )
                btn_row.addWidget(btn_inspect)
                btn_row.addStretch()
                m_lay.addLayout(btn_row)

                mod_grid.addWidget(m_card, idx // 3, idx % 3)
            layout.addLayout(mod_grid)

        # --------------------------------------------------------------
        # Section 5: Curriculum Domain & Topic Cards Grid (Domains A–H)
        # --------------------------------------------------------------
        topics_header_row = QHBoxLayout()
        topics_hdr = QLabel("Competency Domains & Topic Cards (A–H)")
        topics_hdr.setObjectName("SectionHeader")
        topics_sub = QLabel(
            "All 19 existing objectives (MATH-01..TEMP-01) preserved and mapped into Syllabus Modules 0–19."
        )
        topics_sub.setObjectName("MutedText")
        topics_header_row.addWidget(topics_hdr)
        topics_header_row.addStretch()
        topics_header_row.addWidget(topics_sub)
        layout.addLayout(topics_header_row)

        topics_grid = QGridLayout()
        topics_grid.setSpacing(SPACING["grid_gap"])

        for idx, dom in enumerate(domain_summaries):
            t_card = QFrame()
            t_card.setObjectName("TopicCard")
            t_lay = QVBoxLayout(t_card)
            t_lay.setSpacing(8)

            accent = get_domain_accent(dom.domain_code)
            top_bar = QHBoxLayout()
            dom_badge = QLabel(f"DOMAIN {dom.domain_code}")
            dom_badge.setStyleSheet(
                f"color: {accent}; font-family: {COLORS['text_primary']}; font-size: 11px; font-weight: 800;"
            )
            avail_text = (
                f"● {dom.practice_question_count} Practice Items Active"
                if dom.practice_question_count > 0
                else "○ Prerequisite Map Ready"
            )
            avail_color = COLORS["accent_sky"] if dom.practice_question_count > 0 else COLORS["text_muted"]
            avail_lbl = QLabel(avail_text)
            avail_lbl.setStyleSheet(f"color: {avail_color}; font-size: 11px; font-weight: 600;")

            top_bar.addWidget(dom_badge)
            top_bar.addStretch()
            top_bar.addWidget(avail_lbl)
            t_lay.addLayout(top_bar)

            dom_title_lbl = QLabel(dom.domain_title)
            dom_title_lbl.setObjectName("CardTitle")
            dom_title_lbl.setWordWrap(True)
            t_lay.addWidget(dom_title_lbl)

            lead_lbl = QLabel(f"Focus Objective: [{dom.lead_objective_id}] {dom.lead_objective_title}")
            lead_lbl.setObjectName("MutedText")
            lead_lbl.setWordWrap(True)
            t_lay.addWidget(lead_lbl)

            stats_lbl = QLabel(
                f"Objectives: {dom.assessed_objectives}/{dom.total_objectives} assessed  ·  "
                f"{dom.secure_objectives} Secure  ·  "
                f"{dom.provisional_objectives + dom.developing_objectives} In Progress"
            )
            stats_lbl.setObjectName("MonoMeta")
            t_lay.addWidget(stats_lbl)

            t_lay.addStretch()

            card_actions = QHBoxLayout()
            if dom.practice_question_count > 0 and dom.first_practice_objective_id:
                btn_prac = QPushButton(f"Practice ({dom.first_practice_objective_id})")
                btn_prac.setObjectName("PrimaryButton")
                btn_prac.setCursor(Qt.CursorShape.PointingHandCursor)
                btn_prac.setEnabled(self.practice_service is not None)
                btn_prac.clicked.connect(
                    lambda checked=False, oid=dom.first_practice_objective_id: self.open_practice_for(oid, None)
                )
                card_actions.addWidget(btn_prac)

            btn_map_dom = QPushButton(f"Inspect Domain {dom.domain_code} ({dom.total_objectives})")
            btn_map_dom.setObjectName("SecondaryButton")
            btn_map_dom.setCursor(Qt.CursorShape.PointingHandCursor)
            btn_map_dom.clicked.connect(
                lambda checked=False, code=dom.domain_code: self.open_map_for_domain(code)
            )
            card_actions.addWidget(btn_map_dom)
            card_actions.addStretch()
            t_lay.addLayout(card_actions)

            row_idx = idx // 2
            col_idx = idx % 2
            topics_grid.addWidget(t_card, row_idx, col_idx)

        layout.addLayout(topics_grid)
        layout.addStretch()
        return outer

    # ------------------------------------------------------------------
    # Page 2: Master Syllabus (Modules 0–19) & Competency Learning Map
    # ------------------------------------------------------------------
    def _build_learning_map_page(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
        )
        layout.setSpacing(12)

        header_row = QHBoxLayout()
        title = QLabel("Master Syllabus (Modules 0–19) & Competency Learning Map")
        title.setObjectName("PageTitle")
        header_row.addWidget(title)
        header_row.addStretch()

        pathway_lbl = QLabel("Filter Pathway:")
        self.pathway_filter = QComboBox()
        self.pathway_filter.addItem("All 20 Modules (0–19)", "")
        self.pathway_filter.addItem("Year 1 Pathway (Modules 0–8)", "Year 1")
        self.pathway_filter.addItem("Years 2–3 Pathway (Modules 9–14)", "Years 2–3")
        self.pathway_filter.addItem("Years 3–4+ Pathway (Modules 15–19)", "Years 3–4+")
        self.pathway_filter.currentIndexChanged.connect(self._refresh_modules_table)

        filter_label = QLabel("Filter Objective Domain:")
        self.domain_filter = QComboBox()
        self.domain_filter.addItem("All Domains (A–H)", "")
        for code, name in [
            ("A", "A: Mathematical Fluency & Units"),
            ("B", "B: Core Statics & Load Paths"),
            ("C", "C: Beam Behaviour, SFDs & BMDs"),
            ("D", "D: Trusses, Frames & Brackets"),
            ("E", "E: Section Properties"),
            ("F", "F: Stress, Deflection & Buckling"),
            ("G", "G: Eurocode Design (Steel & Timber)"),
            ("H", "H: Temporary Works & BS 5975"),
        ]:
            self.domain_filter.addItem(name, code)
        self.domain_filter.currentIndexChanged.connect(self._refresh_objectives_table)

        header_row.addWidget(pathway_lbl)
        header_row.addWidget(self.pathway_filter)
        header_row.addWidget(filter_label)
        header_row.addWidget(self.domain_filter)
        layout.addLayout(header_row)

        splitter = QSplitter(Qt.Orientation.Vertical)

        # Top Table: All 20 Syllabus Modules (0–19)
        self.mod_table = QTableWidget(0, 7)
        self.mod_table.setAlternatingRowColors(True)
        self.mod_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.mod_table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.mod_table.setHorizontalHeaderLabels(
            [
                "Module",
                "Pathway & Schedule",
                "Syllabus Module Title",
                "Duration",
                "Prerequisites",
                "Pathway Gate Status",
                "Content Availability",
            ]
        )
        m_hdr = self.mod_table.horizontalHeader()
        m_hdr.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        m_hdr.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        m_hdr.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        m_hdr.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        m_hdr.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)
        m_hdr.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)
        m_hdr.setSectionResizeMode(6, QHeaderView.ResizeMode.ResizeToContents)
        self.mod_table.itemSelectionChanged.connect(self._on_module_selected)
        splitter.addWidget(self.mod_table)

        # Middle Table: Mapped Competency Objectives (MATH-01..TEMP-01)
        self.obj_table = QTableWidget(0, 6)
        self.obj_table.setAlternatingRowColors(True)
        self.obj_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.obj_table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.obj_table.setHorizontalHeaderLabels(
            ["ID", "Domain", "Objective Title", "Prerequisites", "Mastery State", "Provenance"]
        )
        header = self.obj_table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)
        self.obj_table.itemSelectionChanged.connect(self._on_objective_selected)
        splitter.addWidget(self.obj_table)

        # Bottom Inspector: Full Syllabus Module / Objective Detail
        detail_card = QFrame()
        detail_card.setObjectName("Card")
        d_layout = QVBoxLayout(detail_card)
        d_hdr = QLabel("Selected Syllabus Module / Objective Inspector")
        d_hdr.setObjectName("SectionHeader")
        self.obj_detail_text = QTextEdit()
        self.obj_detail_text.setReadOnly(True)
        d_layout.addWidget(d_hdr)
        d_layout.addWidget(self.obj_detail_text)
        splitter.addWidget(detail_card)
        splitter.setSizes([280, 210, 260])

        layout.addWidget(splitter, stretch=1)
        self._refresh_modules_table()
        self._refresh_objectives_table()
        return page

    def _refresh_modules_table(self) -> None:
        pathway = self.pathway_filter.currentData()
        self.modules_cache = self.curriculum_repo.list_syllabus_modules(
            year_pathway=pathway if pathway else None
        )
        self.mod_table.setRowCount(len(self.modules_cache))
        for row_idx, mod in enumerate(self.modules_cache):
            prereq_str = (
                ", ".join(f"Mod {p}" for p in mod.prerequisite_module_numbers)
                if mod.prerequisite_module_numbers
                else "None (Start)"
            )
            values = [
                mod.code,
                f"{mod.year_pathway} ({mod.year1_months})",
                mod.title,
                mod.suggested_duration,
                prereq_str,
                mod.pathway_status_label,
                mod.content_status.human_label,
            ]
            for col_idx, text in enumerate(values):
                self.mod_table.setItem(row_idx, col_idx, QTableWidgetItem(text))
        if self.modules_cache:
            self.mod_table.selectRow(0)

    def _on_module_selected(self) -> None:
        selected_rows = self.mod_table.selectionModel().selectedRows()
        if not selected_rows:
            return
        idx = selected_rows[0].row()
        if 0 <= idx < len(self.modules_cache):
            mod = self.modules_cache[idx]
            examples = self.curriculum_repo.list_worked_examples(module_number=mod.module_number)
            mod_obj_states = self.curriculum_repo.get_module_objective_states(mod.module_number)
            ex_html = "".join(
                f"<li><b>{ex.code} — {ex.title}</b> "
                f"[{' · '.join(ex.quality_badges)}]: {ex.description}</li>"
                for ex in examples
            )
            gate_html = "".join(f"<li>You can {g}.</li>" for g in mod.gate_requirements)
            learn_html = "".join(f"<li>{t}</li>" for t in mod.learn_topics)
            res_html = "".join(f"<li>{r}</li>" for r in mod.resources)
            prereqs = (
                ", ".join(f"Module {p}" for p in mod.prerequisite_module_numbers)
                if mod.prerequisite_module_numbers
                else "None (Starting Point of Syllabus)"
            )
            obj_state_str = ", ".join(
                f"{oid}: {mod_obj_states.get(oid, MasteryState.NOT_ASSESSED).value}"
                for oid in mod.mapped_objective_ids
            )
            quality_str = " · ".join(mod.quality_badges)
            plain_block = (
                f"<b>Plain-Language Concept Summary:</b> {mod.plain_explanation}<br>"
                if mod.plain_explanation
                else ""
            )
            html = (
                f"<b>{mod.title}</b> &nbsp;|&nbsp; "
                f"<b>Pathway:</b> {mod.year_pathway} ({mod.year1_months}) &nbsp;|&nbsp; "
                f"<b>Suggested Time:</b> {mod.suggested_duration}<br>"
                f"<b>Prerequisites:</b> {prereqs} &nbsp;|&nbsp; "
                f"<b>Per-Module Objective Mastery:</b> {obj_state_str}<br>"
                f"<b>Content-Quality States:</b> {quality_str} &nbsp;|&nbsp; "
                f"<b>Module Complete:</b> {'Yes' if mod.is_module_complete else 'No'}<br><br>"
                f"{plain_block}"
                f"<b>Why It Matters:</b> {mod.why_it_matters}<br>"
                f"<b>Verification &amp; Source Safeguard:</b> {mod.verification_note}<br>"
                f"<b>Educational Disclaimer:</b> <i>{mod.educational_disclaimer}</i><br><br>"
                f"<b>Learn Topics:</b><ul>{learn_html}</ul>"
                f"<b>Stated Worked Examples &amp; Projects:</b><ul>{ex_html}</ul>"
                f"<b>Module Gate (Pass Conditions to Move On):</b><ul>{gate_html}</ul>"
                f"<b>Recommended Resources:</b><ul>{res_html}</ul>"
            )
            self.obj_detail_text.setHtml(html)

    def _refresh_objectives_table(self) -> None:
        domain_code = self.domain_filter.currentData()
        self.objectives_cache = self.curriculum_repo.list_objectives(
            domain_code=domain_code if domain_code else None
        )
        self.obj_table.setRowCount(len(self.objectives_cache))
        for row_idx, obj in enumerate(self.objectives_cache):
            prereq_str = ", ".join(obj.prerequisite_ids) if obj.prerequisite_ids else "None (Entry)"
            values = [
                obj.id,
                f"Domain {obj.domain_code}",
                obj.title,
                prereq_str,
                format_mastery_badge_text(obj.mastery_state),
                obj.provenance.human_label,
            ]
            for col_idx, text in enumerate(values):
                item = QTableWidgetItem(text)
                self.obj_table.setItem(row_idx, col_idx, item)

    def _on_objective_selected(self) -> None:
        selected_rows = self.obj_table.selectionModel().selectedRows()
        if not selected_rows:
            return
        idx = selected_rows[0].row()
        if 0 <= idx < len(self.objectives_cache):
            obj = self.objectives_cache[idx]
            prereqs = ", ".join(obj.prerequisite_ids) if obj.prerequisite_ids else "None (Entry Node)"
            html = (
                f"<b>[{obj.id}] {obj.title}</b> ({obj.domain_title})<br><br>"
                f"<b>Observable Competency:</b> {obj.observable_competency}<br><br>"
                f"<b>Why It Matters in Practice:</b> {obj.why_it_matters}<br><br>"
                f"<b>Prerequisites:</b> {prereqs} &nbsp;|&nbsp; "
                f"<b>Target Balance:</b> {obj.target_balance} &nbsp;|&nbsp; "
                f"<b>Provenance:</b> {obj.provenance.human_label}"
            )
            self.obj_detail_text.setHtml(html)

    # ------------------------------------------------------------------
    # Page 3: Units & Semantic Quantities Lab (Live Phase 1 Tool)
    # ------------------------------------------------------------------
    def _build_units_inspector_page(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
        )
        layout.setSpacing(14)

        title = QLabel("Units, Dimensional Checks & Semantic Quantities Lab")
        title.setObjectName("PageTitle")
        layout.addWidget(title)

        sem_card = QFrame()
        sem_card.setObjectName("Card")
        s_lay = QVBoxLayout(sem_card)
        s_hdr = QLabel("1. Conceptual Quantity Inspector (Why L³, L⁴, and F·L⁻² Quantities Are Distinct)")
        s_hdr.setObjectName("SectionHeader")
        s_lay.addWidget(s_hdr)

        self.kind_combo = QComboBox()
        for kind in QuantityKind:
            spec = kind.value
            self.kind_combo.addItem(
                f"{spec.name} [{', '.join(spec.symbols)}] — Dimension: {spec.dimension.format_exponents()}",
                kind,
            )
        self.kind_combo.currentIndexChanged.connect(self._update_quantity_kind_explanation)
        s_lay.addWidget(self.kind_combo)

        self.kind_explanation = QTextEdit()
        self.kind_explanation.setReadOnly(True)
        self.kind_explanation.setFixedHeight(110)
        s_lay.addWidget(self.kind_explanation)
        layout.addWidget(sem_card)

        conv_card = QFrame()
        conv_card.setObjectName("Card")
        c_lay = QVBoxLayout(conv_card)
        c_hdr = QLabel("2. Dimensional Unit Converter")
        c_hdr.setObjectName("SectionHeader")
        c_lay.addWidget(c_hdr)

        row = QHBoxLayout()
        self.conv_input = QDoubleSpinBox()
        self.conv_input.setRange(-1e15, 1e15)
        self.conv_input.setDecimals(4)
        self.conv_input.setValue(18.0)

        unit_keys = [u for u in UNIT_REGISTRY.keys() if u not in ("", "-")]
        self.conv_from = QComboBox()
        self.conv_from.addItems(unit_keys)
        self.conv_from.setCurrentText("kN·m")

        self.conv_to = QComboBox()
        self.conv_to.addItems(unit_keys)
        self.conv_to.setCurrentText("N·mm")

        btn_conv = QPushButton("Convert & Check Dimensions")
        btn_conv.setObjectName("PrimaryButton")
        btn_conv.clicked.connect(self._run_unit_conversion)

        row.addWidget(QLabel("Value:"))
        row.addWidget(self.conv_input)
        row.addWidget(QLabel("From:"))
        row.addWidget(self.conv_from)
        row.addWidget(QLabel("To:"))
        row.addWidget(self.conv_to)
        row.addWidget(btn_conv)
        row.addStretch()
        c_lay.addLayout(row)

        self.conv_result_label = QLabel("Select units and click Convert.")
        self.conv_result_label.setWordWrap(True)
        self.conv_result_label.setStyleSheet(f"font-weight: 600; color: {COLORS['accent_sky']}; padding-top: 6px;")
        c_lay.addWidget(self.conv_result_label)
        layout.addWidget(conv_card)

        stress_card = QFrame()
        stress_card.setObjectName("Card")
        st_lay = QVBoxLayout(stress_card)
        st_hdr = QLabel("3. Verified Elastic Bending Stress Check (σ = M / W_el)")
        st_hdr.setObjectName("SectionHeader")
        st_lay.addWidget(st_hdr)

        st_row = QHBoxLayout()
        self.m_spin = QDoubleSpinBox()
        self.m_spin.setRange(0.0, 1e12)
        self.m_spin.setDecimals(3)
        self.m_spin.setValue(45.0)

        self.m_unit = QComboBox()
        self.m_unit.addItems(["kN·m", "N·m", "N·mm"])

        self.w_spin = QDoubleSpinBox()
        self.w_spin.setRange(0.001, 1e12)
        self.w_spin.setDecimals(2)
        self.w_spin.setValue(250000.0)

        self.w_unit = QComboBox()
        self.w_unit.addItems(["mm³", "cm³", "m³"])

        btn_stress = QPushButton("Calculate Stress Trace")
        btn_stress.setObjectName("PrimaryButton")
        btn_stress.clicked.connect(self._run_bending_stress_check)

        st_row.addWidget(QLabel("Moment M:"))
        st_row.addWidget(self.m_spin)
        st_row.addWidget(self.m_unit)
        st_row.addWidget(QLabel("Elastic Section Modulus W_el:"))
        st_row.addWidget(self.w_spin)
        st_row.addWidget(self.w_unit)
        st_row.addWidget(btn_stress)
        st_row.addStretch()
        st_lay.addLayout(st_row)

        self.stress_trace_box = QTextEdit()
        self.stress_trace_box.setReadOnly(True)
        self.stress_trace_box.setFixedHeight(110)
        st_lay.addWidget(self.stress_trace_box)
        layout.addWidget(stress_card)

        self._update_quantity_kind_explanation()
        self._run_unit_conversion()
        self._run_bending_stress_check()
        layout.addStretch()
        return page

    def _update_quantity_kind_explanation(self) -> None:
        kind: QuantityKind = self.kind_combo.currentData()
        spec = kind.value
        html = (
            f"<b>{spec.name}</b> — Symbols: <code>{', '.join(spec.symbols)}</code> | "
            f"Default Display Unit: <code>{spec.default_display_unit or 'dimensionless'}</code> | "
            f"Internal Base Unit: <code>{spec.base_unit or 'dimensionless'}</code><br><br>"
            f"<b>Physical Meaning:</b> {spec.conceptual_meaning}<br>"
            f"<span style='color:#fbbf24;'><b>Common Pitfall / Distinction:</b> {spec.common_confusion_warning}</span>"
        )
        self.kind_explanation.setHtml(html)

    def _run_unit_conversion(self) -> None:
        val = self.conv_input.value()
        u_from = self.conv_from.currentText()
        u_to = self.conv_to.currentText()
        try:
            res = convert_value(val, u_from, u_to)
            self.conv_result_label.setStyleSheet("font-weight: 700; color: #4ade80; padding-top: 6px;")
            self.conv_result_label.setText(f"Verified Conversion: {val:g} {u_from}  =  {res:,.8g} {u_to}")
        except DimensionalError as exc:
            self.conv_result_label.setStyleSheet("font-weight: 700; color: #f87171; padding-top: 6px;")
            self.conv_result_label.setText(f"Rejected by Dimensional Guard: {exc}")

    def _run_bending_stress_check(self) -> None:
        try:
            m_q = Quantity(self.m_spin.value(), self.m_unit.currentText(), QuantityKind.MOMENT)
            w_q = Quantity(self.w_spin.value(), self.w_unit.currentText(), QuantityKind.ELASTIC_SECTION_MODULUS)
            trace = calculate_elastic_bending_stress(m_q, w_q, output_unit="MPa")
            lines = "<br>".join(trace.steps)
            self.stress_trace_box.setHtml(
                f"<b>Formula: {trace.formula_used}  →  Result: <span style='color:#4ade80;'>{trace.result.format()}</span></b><br>{lines}"
            )
        except Exception as exc:
            self.stress_trace_box.setHtml(f"<span style='color:#f87171;'><b>Error:</b> {exc}</span>")

    # ------------------------------------------------------------------
    # Page 4: Study Rules, 9-Part Calculation Note, Weekly Rhythm & Portfolio Milestones (A–F)
    # ------------------------------------------------------------------
    def _build_roadmap_page(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        layout.setContentsMargins(
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
            SPACING["page_margin_x"],
            SPACING["page_margin_y"],
        )
        layout.setSpacing(12)

        title = QLabel("Syllabus Study Method, Calculation-Note Structure & Portfolio Milestones (A–F)")
        title.setObjectName("PageTitle")
        layout.addWidget(title)

        framework = self.curriculum_repo.get_study_framework()
        milestones = self.curriculum_repo.list_portfolio_milestones()

        steps_html = "".join(
            f"<li><b>Step {s['step_number']} — {s['title']}:</b> {s['instruction']}</li>"
            for s in framework.get("five_step_study_method", [])  # type: ignore[union-attr]
        )
        calc_html = "".join(
            f"<li><b>{c['section_number']}. {c['title']}:</b> {c['prompt']}</li>"
            for c in framework.get("calculation_note_structure", [])  # type: ignore[union-attr]
        )
        sessions_html = "".join(
            f"<li><b>{w['title']} ({w['duration']}):</b> {' '.join(w['tasks'])}</li>"
            for w in framework.get("weekly_sessions", [])  # type: ignore[union-attr]
        )
        fw_rev = framework.get("fourth_week_review", {})
        fw_tasks = ", ".join(fw_rev.get("tasks", [])) if isinstance(fw_rev, dict) else ""
        ms_a_prog = self.curriculum_repo.get_milestone_a_portfolio_progress()
        ms_a_cats_html = "".join(
            f"<li><b>{cat_data['label']}:</b> {cat_data['completed']} / {cat_data['required']} "
            f"({'Complete' if cat_data['is_met'] else 'In progress'})</li>"
            for cat_data in ms_a_prog["categories"].values()
        )
        ms_html = "".join(
            f"<li><b>{ms.title}</b> (Prereq Modules: {', '.join(str(p) for p in ms.prerequisite_module_numbers)}): "
            f"{ms.description} <br><i>Pass condition:</i> {ms.pass_condition}</li>"
            for ms in milestones
        )

        card = QFrame()
        card.setObjectName("Card")
        c_lay = QVBoxLayout(card)
        info = QTextEdit()
        info.setReadOnly(True)
        info.setHtml(
            f"<h3>{framework.get('syllabus_title', 'Comprehensive Structural Engineering Rebuild Syllabus')} "
            f"({framework.get('syllabus_date_display', '27 July 2026')})</h3>"
            f"<p>{framework.get('purpose_and_intended_use', '')}</p>"
            f"<p style='color:#fbbf24;'><b>Professional Safeguard:</b> "
            f"{framework.get('professional_safeguard_notice', '')}</p>"
            f"<h3>Integrated Milestone A — Core Mechanics Foundation Portfolio Tracker "
            f"({ms_a_prog['total_completed']}/{ms_a_prog['total_required']} Verified)</h3>"
            f"<ul>{ms_a_cats_html}</ul>"
            f"<h3>The Five-Step Study Method (Mandatory for Every Topic)</h3>"
            f"<ol>{steps_html}</ol>"
            f"<h3>Nine-Part Calculation-Note Structure</h3>"
            f"<ol>{calc_html}</ol>"
            f"<h3>Weekly Study Rhythm ({framework.get('study_rate', '2–3 focused hours per week')})</h3>"
            f"<ul>{sessions_html}"
            f"<li><b>Every Fourth Week (Consolidation &amp; Review):</b> Do not start new content. {fw_tasks}</li></ul>"
            f"<h3>Six Integrated Portfolio Milestones (Proof Points A–F)</h3>"
            f"<ul>{ms_html}</ul>"
        )
        c_lay.addWidget(info)
        layout.addWidget(card, stretch=1)
        return page