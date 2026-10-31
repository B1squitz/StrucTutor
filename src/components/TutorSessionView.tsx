import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileText,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ALL_SYLLABUS_MODULES } from '../data/fullSyllabus';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from '../types/syllabus';
import type {
  GradeOutcome,
  StepId,
  StepStatus,
} from '../utils/tutorEngine';
import { SESSION_QUESTIONS } from '../utils/tutorEngine';
import type { MainView } from '../hooks/useStructTutorWorkspace';
import { MathFraction, UnitBadge } from './MathFormula';
import { QuestionDiagram } from './QuestionDiagram';

export interface TutorSessionViewProps {
  activeModule: NormalizedSyllabusModule;
  activeTopic: SyllabusTopic;
  progressState: CourseProgressState;
  topicSwitcherOpen: boolean;
  setTopicSwitcherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveView: (view: MainView) => void;
  setSelectedTopicId: (topicId: string) => void;
  handleSelectModuleAndTopic: (
    moduleNumber: number,
    topicId?: string,
    targetView?: MainView
  ) => void;
  handleStartTopicAssessment: (
    mod: NormalizedSyllabusModule,
    top: SyllabusTopic
  ) => void;
  handleStartModuleAssessment: (mod: NormalizedSyllabusModule) => void;
  setUnitsDrawerOpen: (open: boolean) => void;
  setCalculatorOpen: (open: boolean) => void;
  setWorkedSolutionDrawerOpen: (open: boolean) => void;
  visibleSteps: StepId[];
  currentStep: StepId;
  stepStatuses: Record<StepId, StepStatus>;
  tutorProgressPercent: number;
  completedStepsCount: number;
  goToTutorStep: (step: StepId) => void;
  sandboxMomentKnm: string;
  setSandboxMomentKnm: (val: string) => void;
  sandboxWelMm3: string;
  setSandboxWelMm3: (val: string) => void;
  sandboxComputed: {
    momentNmm: string;
    stressMpa: string;
    stressGpa: string;
  };
  activeQuestion: (typeof SESSION_QUESTIONS)[keyof typeof SESSION_QUESTIONS];
  hintsRevealed: number;
  setHintsRevealed: React.Dispatch<React.SetStateAction<number>>;
  adaptiveBanner: string | null;
  remedialInjected: boolean;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  handleCheckTutorAnswer: (e?: React.FormEvent) => void;
  handleAdvanceToNextStep: () => void;
  gradeOutcome: GradeOutcome | null;
}

export const TutorSessionView: React.FC<TutorSessionViewProps> = ({
  activeModule,
  activeTopic,
  progressState,
  topicSwitcherOpen,
  setTopicSwitcherOpen,
  setActiveView,
  setSelectedTopicId,
  handleSelectModuleAndTopic,
  handleStartTopicAssessment,
  handleStartModuleAssessment,
  setUnitsDrawerOpen,
  setCalculatorOpen,
  setWorkedSolutionDrawerOpen,
  visibleSteps,
  currentStep,
  stepStatuses,
  tutorProgressPercent,
  completedStepsCount,
  goToTutorStep,
  sandboxMomentKnm,
  setSandboxMomentKnm,
  sandboxWelMm3,
  setSandboxWelMm3,
  sandboxComputed,
  activeQuestion,
  hintsRevealed,
  setHintsRevealed,
  adaptiveBanner,
  remedialInjected,
  answerInput,
  setAnswerInput,
  selectedUnit,
  setSelectedUnit,
  handleCheckTutorAnswer,
  handleAdvanceToNextStep,
  gradeOutcome,
}) => {
  const handleStepKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    let targetIdx = -1;
    if (e.key === 'ArrowRight') {
      targetIdx = (idx + 1) % visibleSteps.length;
    } else if (e.key === 'ArrowLeft') {
      targetIdx = (idx - 1 + visibleSteps.length) % visibleSteps.length;
    } else if (e.key === 'Home') {
      targetIdx = 0;
    } else if (e.key === 'End') {
      targetIdx = visibleSteps.length - 1;
    }
    if (targetIdx >= 0) {
      e.preventDefault();
      const nextStep = visibleSteps[targetIdx];
      goToTutorStep(nextStep);
      const btn = document.querySelector<HTMLButtonElement>(
        `[data-testid="tutor-step-${nextStep}"]`
      );
      btn?.focus();
    }
  };

  return (
    <div
      className="max-w-[920px] mx-auto space-y-3"
      data-testid="tutor-view"
    >
      {/* 1. UNIFIED COMPACT SESSION HEADER + STEP BAR (A6: <= 88px at 1366x768) */}
      <div
        data-testid="tutor-compact-header"
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-xs space-y-2 relative"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setTopicSwitcherOpen((prev) => !prev)}
              data-testid="tutor-topic-switcher-btn"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span className="font-mono font-bold">
                Mod {activeModule.moduleNumber} • {activeTopic.code}
              </span>
              <span className="truncate max-w-[160px] lg:max-w-[210px]">
                {activeTopic.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Switch Module / Topic Popover (All 20 Modules & 62 Topics) */}
            {topicSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-[340px] sm:w-[460px] max-h-[420px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-40 space-y-2">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Switch Module or Topic (Modules 0 to 19)
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopicSwitcherOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                {ALL_SYLLABUS_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {mod.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTopicSwitcherOpen(false);
                          handleStartModuleAssessment(mod);
                        }}
                        className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-500 shrink-0 cursor-pointer"
                      >
                        20-Q Exam
                      </button>
                    </div>
                    <div className="space-y-1">
                      {mod.topics.map((top) => {
                        const isCurrent =
                          mod.moduleNumber === activeModule.moduleNumber &&
                          top.id === activeTopic.id;
                        const passed = progressState.topics[top.id]?.passed;
                        return (
                          <div
                            key={top.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectModuleAndTopic(
                                  mod.moduleNumber,
                                  top.id,
                                  'tutor'
                                )
                              }
                              className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-blue-50 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-mono font-bold mr-1.5">
                                {top.code}
                              </span>
                              <span>{top.title}</span>
                              {passed && (
                                <span className="ml-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                  ✓ 90%+
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTopicSwitcherOpen(false);
                                handleStartTopicAssessment(mod, top);
                              }}
                              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
                            >
                              5-Q Quiz
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Utilities: Topic Exam, Module Exam, Units Reference, Calculator */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              handleStartTopicAssessment(activeModule, activeTopic)
            }
            data-testid="tutor-launch-topic-exam-btn"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            <span>
              Topic {activeTopic.code} ({activeTopic.assessmentQuestions.length}Q)
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleStartModuleAssessment(activeModule)}
            data-testid="tutor-launch-module-exam-btn"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              Mod {activeModule.moduleNumber} Exam (
              {activeModule.moduleAssessment.length}Q)
            </span>
          </button>
          <button
            type="button"
            onClick={() => setUnitsDrawerOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Units</span>
          </button>
          <button
            type="button"
            onClick={() => setCalculatorOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Calculator</span>
          </button>
          </div>
        </div>

        {/* Row 2: Compact Horizontal Step Bar + Inline Progress */}
        <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div
            className="flex flex-wrap items-center gap-1"
            role="tablist"
            aria-label="Lesson and Practice Steps"
          >
            {visibleSteps.map((stepId, idx) => {
              const isCurrent = currentStep === stepId;
              const status = stepStatuses[stepId];
              return (
                <button
                  key={stepId}
                  type="button"
                  role="tab"
                  tabIndex={isCurrent ? 0 : -1}
                  aria-selected={isCurrent}
                  onClick={() => goToTutorStep(stepId)}
                  onKeyDown={(e) => handleStepKeyDown(e, idx)}
                  data-testid={`tutor-step-${stepId}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : status === 'mastered'
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                      : status === 'assisted'
                      ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {stepId === 'learn'
                    ? 'Learn'
                    : stepId === 'summary'
                    ? 'Summary'
                    : stepId === '2a-R'
                    ? '2a-R Warm-Up'
                    : stepId}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Progress: {tutorProgressPercent}%
            </span>
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-300"
                style={{ width: `${tutorProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. STEP CONTENT: [Learn] (3 DIGESTIBLE CONCEPT CARDS) */}
      {currentStep === 'learn' && (
        <div className="space-y-5" data-testid="tutor-learn-cards">
          {/* CARD A: PLAIN-ENGLISH CONCEPT, SUBTOPICS & STRUCTURAL INTUITION */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                Card 1 of 3 • Plain-English Concept &amp; Syllabus Scope
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Module {activeModule.moduleNumber} • Topic {activeTopic.code}
              </span>
            </div>

            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {activeTopic.code}: {activeTopic.title}
              </h1>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                {activeTopic.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                  Why Module {activeModule.moduleNumber} Matters in Practice
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeModule.whyItMatters}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Topic {activeTopic.code} Technical Subtopics
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {activeTopic.subtopics.map((sub, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Topic Selector Pills within Active Module */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Module {activeModule.moduleNumber} Topics:
                </span>
                {activeModule.topics.map((t) => {
                  const isSelected = t.id === activeTopic.id;
                  const isPassed = progressState.topics[t.id]?.passed;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.code} {isPassed ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  handleStartTopicAssessment(activeModule, activeTopic)
                }
                data-testid={`start-topic-assessment-${activeTopic.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                <span>
                  Take Topic {activeTopic.code} Assessment (5 Qs • 90% Pass)
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CARD B: INTERACTIVE DIMENSIONAL SANDBOX & SYLLABUS LEARNING GATE */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                Card 2 of 3 • Interactive Unit &amp; Bending Stress Sandbox
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                1 kN·m = 10⁶ N·mm • 1 MPa = 1 N/mm²
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Live Consistent (mm, N) Stress Verifier
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Adjust Bending Moment <strong>M</strong> (in kN·m) and Elastic
                  Section Modulus <strong>Wₑₗ</strong> (in mm³) to see how
                  converting to <strong>N·mm</strong> produces stress directly
                  in <strong>N/mm² = MPa</strong>:
                </p>
              </div>
              <MathFraction
                lhs="σ"
                num="M (in N·mm)"
                den="Wₑₗ (in mm³)"
                rhs={`${sandboxComputed.stressMpa} MPa`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Moment M (kN·m):
                </label>
                <input
                  type="text"
                  value={sandboxMomentKnm}
                  onChange={(e) => setSandboxMomentKnm(e.target.value)}
                  aria-label="Sandbox bending moment in kN·m"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white"
                />
                <div className="text-[11px] font-mono text-blue-600 dark:text-sky-400">
                  = {sandboxComputed.momentNmm} N·mm
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Section Modulus Wₑₗ (mm³):
                </label>
                <input
                  type="text"
                  value={sandboxWelMm3}
                  onChange={(e) => setSandboxWelMm3(e.target.value)}
                  aria-label="Sandbox elastic section modulus in mm³"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white"
                />
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Major-axis elastic modulus
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 p-3 flex flex-col justify-center">
                <div className="text-[11px] font-mono uppercase text-blue-700 dark:text-sky-300">
                  Resulting Bending Stress σ
                </div>
                <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {sandboxComputed.stressMpa} MPa
                </div>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  = {sandboxComputed.stressMpa} N/mm² ({sandboxComputed.stressGpa}{' '}
                  GPa)
                </div>
              </div>
            </div>

            {/* Syllabus Learning Gate & Future Textbook Expansion Slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5 space-y-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Module {activeModule.moduleNumber} Syllabus Learning Gate
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                  {activeModule.learningGate}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  <span>Future Textbook &amp; Standard Expansion</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeTopic.futureContentNote ||
                    activeModule.standardsNotice ||
                    'Ready for your personal textbooks, worked examples, and Eurocode / UK National Annex references.'}
                </p>
              </div>
            </div>
          </div>

          {/* CARD C: STEP-BY-STEP WORKED EXAMPLES & TRANSITION TO QUESTIONS */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                Card 3 of 3 • Verified Worked Examples &amp; Self-Review
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {activeModule.workedExamples.length} Syllabus Worked{' '}
                {activeModule.workedExamples.length === 1
                  ? 'Example'
                  : 'Examples'}
              </span>
            </div>

            <div className="space-y-4">
              {activeModule.workedExamples.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                >
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {ex.title}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      <strong>Engineering Brief &amp; Scope:</strong> {ex.brief}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 text-xs">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">
                      Independent Verification &amp; Self-Review Checklist:
                    </div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 pt-0.5">
                      {ex.checklist.map((chk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{chk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleStartTopicAssessment(activeModule, activeTopic)
                  }
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  Take Topic {activeTopic.code} Assessment (5 Qs • 90% Pass)
                </button>
                <button
                  type="button"
                  onClick={() => handleStartModuleAssessment(activeModule)}
                  data-testid="start-module-assessment-btn"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Module {activeModule.moduleNumber} Exam (20 Qs • 90% Pass)
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdvanceToNextStep}
                data-testid="continue-to-question-1a-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue to Guided Question 1a</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. STEP CONTENT: GUIDED & INDEPENDENT QUESTIONS ([1a]..[5a]) */}
      {currentStep !== 'learn' && currentStep !== 'summary' && (
        <div
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
          data-testid={`question-step-card-${currentStep}`}
        >
          {/* Top Question Badge & Help Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                {activeQuestion.badgeLabel}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Target Dimension: {activeQuestion.dimension.replace('_', ' ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setHintsRevealed((prev) => Math.min(2, prev + 1))
                }
                data-testid="need-a-hint-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Need a Hint ({hintsRevealed}/2)</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkedSolutionDrawerOpen(true)}
                data-testid="show-worked-solution-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Show Worked Solution</span>
              </button>
            </div>
          </div>

          {/* Title & Prompt Lead */}
          <div className="space-y-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {activeQuestion.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {activeQuestion.promptLead}
            </p>
          </div>

          {/* Formatted Engineering Math Fraction & Given Parameters (N9 Fixed) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {activeQuestion.promptFormula && (
              <div className="flex flex-wrap items-center gap-3">
                <MathFraction
                  lhs={activeQuestion.promptFormula.lhs}
                  num={activeQuestion.promptFormula.num}
                  den={activeQuestion.promptFormula.den}
                />
                {activeQuestion.promptFormula.rhsNote && (
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ({activeQuestion.promptFormula.rhsNote})
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {activeQuestion.givenParameters.map((param, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                >
                  <span className="font-bold text-blue-700 dark:text-sky-300">
                    {param.symbol}
                    {param.sub && <sub>{param.sub}</sub>}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {' '}
                    ({param.label}):{' '}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {param.valueDisplay}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive SVG Diagram with [Zoom] Modal */}
          <QuestionDiagram
            diagramType={activeQuestion.diagramType}
            caption={activeQuestion.diagramCaption}
          />

          {/* Graduated Hints Box */}
          {hintsRevealed > 0 && (
            <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 space-y-2">
              {activeQuestion.hints.slice(0, hintsRevealed).map((h, i) => (
                <p
                  key={i}
                  className="text-xs sm:text-sm text-amber-900 dark:text-amber-200"
                >
                  <strong>Graduated Hint {i + 1}:</strong> {h}
                </p>
              ))}
            </div>
          )}

          {/* Adaptive Routing Banner */}
          {adaptiveBanner && (
            <div className="rounded-xl bg-blue-50 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-500/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-blue-900 dark:text-sky-200">
              <span>{adaptiveBanner}</span>
              {remedialInjected && currentStep === '2a' && (
                <button
                  type="button"
                  onClick={() => goToTutorStep('2a-R')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer"
                >
                  Open 2a-R Warm-Up →
                </button>
              )}
            </div>
          )}

          {/* Compact Numeric Input + Unit Selector */}
          <form
            onSubmit={handleCheckTutorAnswer}
            className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <label
                htmlFor="tutor-numeric-answer"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Your Answer:
              </label>
              <input
                id="tutor-numeric-answer"
                type="text"
                inputMode="decimal"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder={activeQuestion.placeholder}
                data-testid="tutor-answer-input"
                className="w-[200px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-400 focus:outline-none font-mono text-sm text-slate-900 dark:text-white"
              />
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                aria-label="Select engineering unit"
                data-testid="tutor-unit-select"
                className="w-[120px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-sm font-semibold text-slate-900 dark:text-white"
              >
                {activeQuestion.unitChoices.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                data-testid="tutor-check-answer-btn"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-colors cursor-pointer"
              >
                Check Answer
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdvanceToNextStep}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Deterministic Diagnostic Feedback */}
          {gradeOutcome && (
            <div
              data-testid="tutor-grade-feedback"
              className={`rounded-xl p-4 border text-xs sm:text-sm space-y-1.5 ${
                gradeOutcome.isCorrect
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200'
              }`}
            >
              <div className="font-bold text-sm">{gradeOutcome.headline}</div>
              <p className="leading-relaxed">{gradeOutcome.diagnosticDetail}</p>
              {gradeOutcome.unitConversionNote && (
                <div className="pt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <UnitBadge unit={gradeOutcome.expectedCanonicalUnit} />
                  <span>{gradeOutcome.unitConversionNote}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. STEP CONTENT: [Summary] */}
      {currentStep === 'summary' && (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Session Summary &amp; Formal Syllabus Gate
            </span>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Ready for Your 90% Pass-Mark Syllabus Assessments
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              You have completed {completedStepsCount} of {visibleSteps.length}{' '}
              guided session steps. Now prove your mastery on the formal
              End-of-Topic Assessments (5 questions each, 90% pass mark) or the
              20-question End-of-Module Assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeModule.topics.map((t) => {
              const tProg = progressState.topics[t.id];
              return (
                <div
                  key={t.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">
                      Topic {t.code} Assessment
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {t.title}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                      {t.assessmentQuestions.length} Questions • 90% Pass Mark
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartTopicAssessment(activeModule, t)}
                    className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  >
                    {tProg?.passed
                      ? `Retake (${tProg.bestScorePercent.toFixed(0)}%)`
                      : 'Start 5-Q Assessment'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToTutorStep('learn')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              ← Back to Concept Cards
            </button>
            <button
              type="button"
              onClick={() => handleStartModuleAssessment(activeModule)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              Start Module {activeModule.moduleNumber} Exam (20 Qs • 90% Pass) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
