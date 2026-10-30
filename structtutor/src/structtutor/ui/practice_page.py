"""Milestone 2 & Phase 2 Tutor & Practice page implementing the 7-Stage Teaching Cycle."""
from __future__ import annotations

from typing import TYPE_CHECKING, Any

from PySide6.QtWidgets import (
    QComboBox,
    QDoubleSpinBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from structtutor.domain.mechanics_solvers import (
    WORKED_EXAMPLE_SOLVERS,
    solve_ex_4_3_ub_major_minor_axis_comparison,
    solve_worked_example,
)
from structtutor.domain.practice_core import PracticeError, PracticeService
from structtutor.domain.syllabus import (
    DEFAULT_EDUCATIONAL_DISCLAIMER,
    _MODULE_PLAIN_EXPLANATIONS,
)

if TYPE_CHECKING:
    from structtutor.storage.repositories import CurriculumRepository


class PracticePage(QWidget):
    def __init__(
        self,
        service: PracticeService | None,
        unavailable_reason: str = "",
        curriculum_repo: "CurriculumRepository | None" = None,
    ):
        super().__init__()
        self.service = service
        self.curriculum_repo = curriculum_repo
        self.current: dict[str, Any] | None = None
        self.current_module_number: int | None = None
        self.last_remedial_item: dict[str, Any] | None = None
        self.help_count = 0
        self.hints_shown = 0
        self.solution_shown = False
        self.submitted = False

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        outer.addWidget(scroll)
        content = QWidget()
        scroll.setWidget(content)
        layout = QVBoxLayout(content)
        layout.setContentsMargins(28, 22, 28, 22)
        layout.setSpacing(14)

        heading = QLabel("Tutor & Practice — Modules 0–6 Core Mechanics Teaching Cycle")
        heading.setObjectName("PageTitle")
        layout.addWidget(heading)
        note = QLabel(
            "7-Stage Teaching Cycle: (1) Plain-language concept explanation → (2) Verified worked example with "
            "dual-method independent check → (3) Guided problem with graduated hints → (4) Independent problem → "
            "(5) Deterministic marking with misconception diagnosis → (6) Targeted remedial practice → "
            "(7) Per-module mastery & Integrated Milestone A portfolio tracking. "
            + DEFAULT_EDUCATIONAL_DISCLAIMER
        )
        note.setObjectName("PageSubtitle")
        note.setWordWrap(True)
        layout.addWidget(note)

        if service is None:
            msg = QLabel("Practice is unavailable: " + (unavailable_reason or "question bank could not be loaded."))
            msg.setWordWrap(True)
            layout.addWidget(msg)
            layout.addStretch()
            return

        # Stage 1 & 2 Card: Plain-Language Concept Explanation & Deterministic Worked Example Trace
        teaching_card = QFrame()
        teaching_card.setObjectName("Card")
        t_box = QVBoxLayout(teaching_card)
        t_box.setSpacing(8)

        t_hdr_row = QHBoxLayout()
        self.stage_badge = QLabel("STAGE 1–2: CONCEPT & VERIFIED WORKED EXAMPLE")
        self.stage_badge.setObjectName("SectionHeader")
        self.quality_status_label = QLabel()
        self.quality_status_label.setObjectName("MonoMeta")
        t_hdr_row.addWidget(self.stage_badge)
        t_hdr_row.addStretch()
        t_hdr_row.addWidget(self.quality_status_label)
        t_box.addLayout(t_hdr_row)

        self.plain_explanation_label = QLabel()
        self.plain_explanation_label.setWordWrap(True)
        t_box.addWidget(self.plain_explanation_label)

        # Optional custom UB section table input bar for Module 4 Example 4.3 (Reference Verification Safeguard)
        self.ub_input_frame = QFrame()
        ub_row = QHBoxLayout(self.ub_input_frame)
        ub_row.setContentsMargins(0, 4, 0, 4)
        ub_row.addWidget(QLabel("Ex 4.3 Custom UB Table Entry (optional): h (mm):"))
        self.ub_h_spin = QDoubleSpinBox()
        self.ub_h_spin.setRange(50.0, 2000.0)
        self.ub_h_spin.setValue(406.4)
        ub_row.addWidget(self.ub_h_spin)
        ub_row.addWidget(QLabel("b (mm):"))
        self.ub_b_spin = QDoubleSpinBox()
        self.ub_b_spin.setRange(30.0, 1000.0)
        self.ub_b_spin.setValue(177.8)
        ub_row.addWidget(self.ub_b_spin)
        ub_row.addWidget(QLabel("I_y (cm⁴):"))
        self.ub_iy_spin = QDoubleSpinBox()
        self.ub_iy_spin.setRange(10.0, 1e7)
        self.ub_iy_spin.setValue(21500.0)
        ub_row.addWidget(self.ub_iy_spin)
        ub_row.addWidget(QLabel("I_z (cm⁴):"))
        self.ub_iz_spin = QDoubleSpinBox()
        self.ub_iz_spin.setRange(1.0, 1e6)
        self.ub_iz_spin.setValue(1200.0)
        ub_row.addWidget(self.ub_iz_spin)
        self.ub_calc_btn = QPushButton("Verify Custom UB Properties")
        self.ub_calc_btn.setObjectName("SecondaryButton")
        self.ub_calc_btn.clicked.connect(self._run_custom_ub_example)
        ub_row.addWidget(self.ub_calc_btn)
        ub_row.addStretch()
        self.ub_input_frame.setVisible(False)
        t_box.addWidget(self.ub_input_frame)

        self.worked_example_box = QTextEdit()
        self.worked_example_box.setReadOnly(True)
        self.worked_example_box.setMinimumHeight(140)
        t_box.addWidget(self.worked_example_box)
        layout.addWidget(teaching_card)

        # Stage 3–6 Card: Interactive Guided & Independent Practice + Remedial Loop
        card = QFrame()
        card.setObjectName("Card")
        box = QVBoxLayout(card)
        box.setSpacing(10)

        selector_row = QHBoxLayout()
        self.module_selector = QComboBox()
        self.module_selector.addItem("All Supported Modules (0–6)", None)
        for m_num in range(7):
            self.module_selector.addItem(f"Module {m_num}", m_num)
        self.topic = QComboBox()
        self.item = QComboBox()

        selector_row.addWidget(QLabel("Module Filter:"))
        selector_row.addWidget(self.module_selector)
        selector_row.addWidget(QLabel("Choose an objective:"))
        selector_row.addWidget(self.topic, 1)
        box.addLayout(selector_row)

        box.addWidget(QLabel("Choose one question (Guided → Independent progression):"))
        box.addWidget(self.item)

        self.teaching_stage_banner = QLabel()
        self.teaching_stage_banner.setObjectName("MonoMeta")
        self.teaching_stage_banner.setWordWrap(True)
        box.addWidget(self.teaching_stage_banner)

        self.prompt = QLabel()
        self.prompt.setObjectName("CardTitle")
        self.prompt.setWordWrap(True)
        box.addWidget(self.prompt)

        self.reference = QLabel()
        self.reference.setObjectName("MutedText")
        self.reference.setWordWrap(True)
        box.addWidget(self.reference)

        self.choice = QComboBox()
        self.numeric = QLineEdit()
        self.numeric.setPlaceholderText("Enter a number, for example 8 or 8.0")
        self.unit = QComboBox()
        self.confidence = QComboBox()
        self.confidence.addItem("Not stated", "")
        for s in ("Low", "Medium", "High"):
            self.confidence.addItem(s, s)

        answer_row = QHBoxLayout()
        answer_row.addWidget(QLabel("Answer:"))
        answer_row.addWidget(self.choice, 1)
        answer_row.addWidget(self.numeric, 1)
        answer_row.addWidget(self.unit)
        box.addLayout(answer_row)

        conf_row = QHBoxLayout()
        conf_row.addWidget(QLabel("Confidence (optional):"))
        conf_row.addWidget(self.confidence)
        conf_row.addStretch()
        box.addLayout(conf_row)

        buttons = QHBoxLayout()
        self.hint_btn = QPushButton("Next hint")
        self.hint_btn.setObjectName("SecondaryButton")
        self.solution_btn = QPushButton("Show worked solution")
        self.solution_btn.setObjectName("SecondaryButton")
        self.submit_btn = QPushButton("Check and save attempt")
        self.submit_btn.setObjectName("PrimaryButton")
        self.remedial_btn = QPushButton("Open targeted remedial question")
        self.remedial_btn.setObjectName("SecondaryButton")
        self.remedial_btn.setEnabled(False)
        for button in (self.hint_btn, self.solution_btn, self.submit_btn, self.remedial_btn):
            buttons.addWidget(button)
        box.addLayout(buttons)

        self.output = QTextEdit()
        self.output.setReadOnly(True)
        self.output.setMinimumHeight(150)
        box.addWidget(self.output)
        layout.addWidget(card)

        # Stage 7: Adaptive Recommendation & Integrated Milestone A Portfolio Progress
        recommendation = QFrame()
        recommendation.setObjectName("Card")
        recbox = QVBoxLayout(recommendation)
        rec_hdr = QLabel("Adaptive Next-Step Recommendation & Integrated Milestone A Portfolio")
        rec_hdr.setObjectName("SectionHeader")
        recbox.addWidget(rec_hdr)
        self.rec_label = QLabel()
        self.rec_label.setWordWrap(True)
        recbox.addWidget(self.rec_label)
        self.portfolio_label = QLabel()
        self.portfolio_label.setObjectName("MonoMeta")
        self.portfolio_label.setWordWrap(True)
        recbox.addWidget(self.portfolio_label)
        self.rec_btn = QPushButton("Open recommended question")
        self.rec_btn.setObjectName("SecondaryButton")
        recbox.addWidget(self.rec_btn)
        layout.addWidget(recommendation)

        self.history = QTextEdit()
        self.history.setReadOnly(True)
        self.history.setMinimumHeight(100)
        layout.addWidget(QLabel("Recent saved attempts (UTC):"))
        layout.addWidget(self.history)
        layout.addStretch()

        self.module_selector.currentIndexChanged.connect(self._module_filter_changed)
        self.topic.currentIndexChanged.connect(self._topic_changed)
        self.item.currentIndexChanged.connect(self._item_changed)
        self.hint_btn.clicked.connect(self._hint)
        self.solution_btn.clicked.connect(self._solution)
        self.submit_btn.clicked.connect(self._submit)
        self.remedial_btn.clicked.connect(self._open_remedial)
        self.rec_btn.clicked.connect(self._open_recommendation)
        self._refresh_topics()
        self._refresh_history()
        self._refresh_recommendation()

    def open_objective_question(
        self,
        objective_id: str | None = None,
        question_id: str | None = None,
        module_number: int | None = None,
    ) -> bool:
        """Select a specific objective, optional question, and optional module when navigating from the Dashboard."""
        if self.service is None:
            return False
        if module_number is not None:
            mod_idx = self.module_selector.findData(module_number)
            if mod_idx >= 0:
                self.module_selector.blockSignals(True)
                self.module_selector.setCurrentIndex(mod_idx)
                self.module_selector.blockSignals(False)
                self.current_module_number = module_number
        else:
            self.module_selector.blockSignals(True)
            self.module_selector.setCurrentIndex(0)
            self.module_selector.blockSignals(False)
            self.current_module_number = None

        self._refresh_topics()
        self._refresh_history()
        if objective_id:
            topic_index = self.topic.findData(objective_id)
            if topic_index >= 0:
                self.topic.setCurrentIndex(topic_index)
        if question_id:
            for i in range(self.item.count()):
                item = self.item.itemData(i)
                if item and item.get("id") == question_id:
                    self.item.setCurrentIndex(i)
                    self._item_changed()
                    self._refresh_recommendation()
                    return True
        self._refresh_recommendation()
        return self.current is not None

    def _module_filter_changed(self, *_):
        self.current_module_number = self.module_selector.currentData()
        self._refresh_topics()
        self._refresh_recommendation()

    def _refresh_topics(self):
        old = self.topic.currentData()
        rows = self.service.objectives(module_number=self.current_module_number)
        self.topic.blockSignals(True)
        self.topic.clear()
        for oid, title, state in rows:
            prefix = f"[Mod {self.current_module_number}] " if self.current_module_number is not None else ""
            self.topic.addItem(f"{prefix}{oid} — {title} [{state}]", oid)
        idx = self.topic.findData(old)
        if idx >= 0:
            self.topic.setCurrentIndex(idx)
        self.topic.blockSignals(False)
        self._topic_changed()

    def _topic_changed(self, *_):
        self.item.blockSignals(True)
        self.item.clear()
        try:
            questions = self.service.items(
                self.topic.currentData(),
                module_number=self.current_module_number,
            )
            for q in questions:
                stage = str(q.get("teaching_stage") or "independent").upper()
                mod_tag = f"M{q['module_number']}·" if "module_number" in q else ""
                self.item.addItem(f"{q['id']} [{mod_tag}{stage}] — {q['title']} ({q['task_type']})", q)
        except PracticeError as exc:
            self.item.blockSignals(False)
            self.current = None
            self.submit_btn.setEnabled(False)
            self.output.setPlainText(str(exc))
            return
        self.item.blockSignals(False)
        self._item_changed()
        self._refresh_recommendation()

    def _item_changed(self, *_):
        self.current = self.item.currentData()
        self.help_count = 0
        self.hints_shown = 0
        self.solution_shown = False
        self.submitted = False
        self.last_remedial_item = None
        self.remedial_btn.setEnabled(False)
        self.numeric.clear()
        self.choice.clear()
        self.unit.clear()
        self.output.clear()
        self.confidence.setCurrentIndex(0)
        self.submit_btn.setEnabled(self.current is not None)
        self.hint_btn.setEnabled(self.current is not None)
        self.solution_btn.setEnabled(self.current is not None)
        if not self.current:
            self.prompt.setText("No practice items for this objective.")
            self.reference.clear()
            self.teaching_stage_banner.clear()
            self.plain_explanation_label.clear()
            self.worked_example_box.clear()
            self.ub_input_frame.setVisible(False)
            return

        q = self.current
        mod_num = q.get("module_number", self.current_module_number if self.current_module_number is not None else 0)
        ex_id = str(q.get("worked_example_id") or "")
        stage = str(q.get("teaching_stage") or "independent")
        port_cat = str(q.get("portfolio_category") or "")
        ref_status = str(q.get("reference_verification_status") or "NOT_REQUIRED_FIRST_PRINCIPLES")

        stage_desc = (
            "STAGE 3: GUIDED PRACTICE (Step-by-step scaffolding linked to worked example)"
            if stage == "guided"
            else "STAGE 4: INDEPENDENT PRACTICE (Solve without hints to credit module mastery & Milestone A portfolio)"
        )
        if port_cat:
            stage_desc += f"  ·  Milestone A Portfolio Category: [{port_cat}]"
        self.teaching_stage_banner.setText(stage_desc)

        self.prompt.setText(q["prompt"])
        self.reference.setText(q.get("reference") or "No specific source citation for this original units question.")

        # Populate Stage 1 & 2 Plain Explanation + Deterministic Worked Example Solver Trace
        plain_text = _MODULE_PLAIN_EXPLANATIONS.get(int(mod_num), "")
        self.plain_explanation_label.setText(
            f"Module {mod_num} Plain-Language Concept: {plain_text}" if plain_text else ""
        )

        if ref_status == "REFERENCE_VERIFICATION_REQUIRED" or ex_id == "EX-4.3":
            self.quality_status_label.setText(
                "Status: Lesson in progress · Worked example verified (math) · Reference verification required (UB table)"
            )
        else:
            self.quality_status_label.setText(
                "Status: Lesson complete · Worked example verified · Interactive practice available"
            )

        self.ub_input_frame.setVisible(ex_id == "EX-4.3")
        self._render_worked_example_trace(ex_id, int(mod_num))

        is_choice = q["kind"] == "choice"
        self.choice.setVisible(is_choice)
        self.numeric.setVisible(not is_choice)
        self.unit.setVisible(not is_choice)
        if is_choice:
            self.choice.addItem("Select an option", "")
            for key, text in q["options"].items():
                self.choice.addItem(f"{key.upper()}. {text}", key)
        else:
            self.unit.addItems(q["unit_choices"])
            self.unit.setCurrentText(q["unit"])

    def _render_worked_example_trace(self, ex_id: str, mod_num: int):
        target_ex = ex_id
        if not target_ex or target_ex not in WORKED_EXAMPLE_SOLVERS:
            default_map = {
                0: "EX-0.1",
                1: "EX-1.1",
                2: "EX-2.1",
                3: "EX-3.1",
                4: "EX-4.1",
                5: "EX-5.1",
                6: "EX-6.1",
            }
            target_ex = default_map.get(mod_num, "EX-0.1")
        try:
            sol = solve_worked_example(target_ex)
            self._set_solution_trace_text(sol)
        except Exception as exc:
            self.worked_example_box.setPlainText(f"Worked example trace unavailable: {exc}")

    def _run_custom_ub_example(self):
        try:
            sol = solve_ex_4_3_ub_major_minor_axis_comparison(
                depth_h_mm=self.ub_h_spin.value(),
                width_b_mm=self.ub_b_spin.value(),
                iy_cm4=self.ub_iy_spin.value(),
                iz_cm4=self.ub_iz_spin.value(),
                test_moment_knm=50.0,
            )
            self._set_solution_trace_text(sol)
        except Exception as exc:
            self.worked_example_box.setPlainText(f"Invalid UB parameters: {exc}")

    def _set_solution_trace_text(self, sol):
        lines = [
            f"[{sol.example_id}] {sol.title}",
            f"Problem: {sol.problem_statement}",
            f"Assumptions: {' | '.join(sol.assumptions)}",
            f"Sign Convention: {sol.sign_convention}",
            "Intermediate Steps:",
            *[f"  {s}" for s in sol.intermediate_steps],
            f"Independent Check ({sol.independent_check.method_name}): "
            f"{'PASSED' if sol.independent_check.passed else 'FAILED'} "
            f"(Primary = {sol.independent_check.primary_metric:.5g} {sol.independent_check.unit}, "
            f"Check = {sol.independent_check.check_metric:.5g} {sol.independent_check.unit})",
            *[f"  • {cs}" for cs in sol.independent_check.steps],
            f"Engineering Takeaway: {sol.engineering_interpretation}",
            f"Verification Status: {sol.reference_verification_status} — {sol.reference_verification_note}",
        ]
        self.worked_example_box.setPlainText("\n".join(lines))

    def _hint(self):
        if not self.current:
            return
        hints = self.current["hints"]
        if self.hints_shown >= len(hints):
            self.output.append("No further hints. You can show the worked solution.")
            return
        self.output.append(f"Hint {self.hints_shown + 1}: {hints[self.hints_shown]}")
        self.hints_shown += 1
        if not self.submitted:
            self.help_count += 1

    def _solution(self):
        if not self.current:
            return
        if not self.submitted and not self.solution_shown:
            self.help_count += 1
        self.solution_shown = True
        self.output.append("Worked solution:\n" + self.current["solution"])

    def _submit(self):
        if not self.current or self.submitted:
            return
        answer = self.choice.currentData() if self.current["kind"] == "choice" else self.numeric.text()
        unit = None if self.current["kind"] == "choice" else self.unit.currentText()
        mod_num = self.current.get("module_number", self.current_module_number)
        try:
            feedback, state = self.service.submit(
                self.current["id"],
                answer,
                unit,
                self.help_count,
                self.confidence.currentData(),
                module_number=mod_num if isinstance(mod_num, int) else None,
            )
        except PracticeError as exc:
            self.output.append("Not saved: " + str(exc))
            return
        self.submitted = True
        self.submit_btn.setEnabled(False)
        msg = feedback.message
        if feedback.misconception_id:
            msg += " Possible misconception associated with this option: " + feedback.misconception_id + "."
            detail = self.service.get_misconception_detail(feedback.misconception_id)
            if detail:
                msg += (
                    f"\nMisconception Diagnosis [{detail['id']} — {detail['title']}]: "
                    f"{detail['description']}\nRemediation Strategy: {detail['remediation_strategy']}"
                )
        msg += f"\nSaved. Objective state: {state}. Help used: {self.help_count}."

        if not feedback.correct or self.help_count > 0:
            rem = self.service.recommend_remedial(
                self.current["id"],
                misconception_id=feedback.misconception_id,
                module_number=mod_num if isinstance(mod_num, int) else None,
            )
            if rem:
                self.last_remedial_item = rem
                self.remedial_btn.setEnabled(True)
                msg += (
                    f"\nStage 6 Remedial Practice Ready: {rem['id']} — {rem['title']} "
                    f"(click 'Open targeted remedial question')."
                )

        self.output.append(msg)
        self._refresh_history()
        self.topic.blockSignals(True)
        for oid, title, objective_state in self.service.objectives(module_number=self.current_module_number):
            idx = self.topic.findData(oid)
            if idx >= 0:
                prefix = f"[Mod {self.current_module_number}] " if self.current_module_number is not None else ""
                self.topic.setItemText(idx, f"{prefix}{oid} — {title} [{objective_state}]")
        self.topic.blockSignals(False)
        self._refresh_recommendation()

    def _open_remedial(self):
        if not self.last_remedial_item:
            return
        rem = self.last_remedial_item
        self.open_objective_question(
            objective_id=rem["objective_id"],
            question_id=rem["id"],
            module_number=rem.get("module_number"),
        )

    def _refresh_history(self):
        rows = self.service.recent_attempts()
        if not rows:
            self.history.setPlainText("No attempts recorded yet.")
            return
        lines = [
            f"{ts} | {obj} | {qid} | {'correct' if ok else 'incorrect'} | help {help_count} | {misc or 'cause not identified'}"
            for ts, obj, qid, ok, help_count, misc in rows
        ]
        self.history.setPlainText("\n".join(lines))

    def _refresh_recommendation(self):
        if self.service is None:
            return
        rec = self.service.recommend(
            self.topic.currentData(),
            module_number=self.current_module_number,
        )
        if rec is None:
            self.rec_label.setText("No practice recommendation available.")
            self.rec_btn.setEnabled(False)
        else:
            self.rec_label.setText(f"Suggested next: {rec[0]} / {rec[1]}. {rec[2]}")
            self.rec_btn.setEnabled(True)

        if self.curriculum_repo is not None:
            port = self.curriculum_repo.get_milestone_a_portfolio_progress()
            cats = port["categories"]
            parts = [
                f"Reactions {cats['beam_reactions']['completed']}/{cats['beam_reactions']['required']}",
                f"SFD/BMD {cats['sfd_bmd']['completed']}/{cats['sfd_bmd']['required']}",
                f"Section/Bending {cats['section_properties_bending']['completed']}/{cats['section_properties_bending']['required']}",
                f"Deflection {cats['deflection_check']['completed']}/{cats['deflection_check']['required']}",
                f"Buckling {cats['column_buckling']['completed']}/{cats['column_buckling']['required']}",
            ]
            status_tag = "READY FOR SELF-AUDIT" if port["is_complete"] else f"{port['total_completed']}/{port['total_required']} verified"
            self.portfolio_label.setText(
                f"Integrated Milestone A Portfolio ({status_tag}): " + "  ·  ".join(parts)
            )

    def _open_recommendation(self):
        rec = self.service.recommend(
            self.topic.currentData(),
            module_number=self.current_module_number,
        )
        if not rec:
            return
        self.open_objective_question(rec[0], rec[1], module_number=self.current_module_number)
