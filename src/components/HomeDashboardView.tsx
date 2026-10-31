import React from 'react';
import {
  ArrowRight,
  Award,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  ALL_SYLLABUS_MODULES,
  getModuleByNumber,
  getTopicById,
} from '../data/fullSyllabus';
import { COURSE_DEVELOPMENT_REQUIREMENTS } from '../data/syllabusMetadata';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from '../types/syllabus';
import type { MilestoneSkillBar, StepId } from '../utils/tutorEngine';
import { getModuleStage, MainView } from '../hooks/useStructTutorWorkspace';

export interface HomeDashboardViewProps {
  activeModule: NormalizedSyllabusModule;
  activeTopic: SyllabusTopic;
  selectedModuleNumber: number;
  progressState: CourseProgressState;
  progressSummary: {
    overallProgressPercent: number;
    completedModulesCount: number;
    totalModulesCount: number;
    passedTopicsCount: number;
    totalTopicsCount: number;
    totalAttemptsCount: number;
  };
  milestoneBars: MilestoneSkillBar[];
  confirmResetOpen: boolean;
  setConfirmResetOpen: (open: boolean) => void;
  setCurrentStep: (step: StepId) => void;
  setActiveView: (view: MainView) => void;
  handleStartTopicAssessment: (
    mod: NormalizedSyllabusModule,
    top: SyllabusTopic
  ) => void;
  handleStartModuleAssessment: (mod: NormalizedSyllabusModule) => void;
  handleOpenModuleInMap: (moduleNumber: number) => void;
  handleSelectModuleAndTopic: (
    moduleNumber: number,
    topicId?: string,
    targetView?: MainView
  ) => void;
  handleResetAllProgress: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  activeModule,
  activeTopic,
  selectedModuleNumber,
  progressState,
  progressSummary,
  milestoneBars,
  confirmResetOpen,
  setConfirmResetOpen,
  setCurrentStep,
  setActiveView,
  handleStartTopicAssessment,
  handleStartModuleAssessment,
  handleOpenModuleInMap,
  handleSelectModuleAndTopic,
  handleResetAllProgress,
}) => {
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference -
    (progressSummary.overallProgressPercent / 100) * ringCircumference;

  return (
    <div
      className="max-w-[1200px] mx-auto space-y-6"
      data-testid="dashboard-view"
    >
      {/* 1. HERO RESUME / START CARD WITH CIRCULAR SVG RING */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 border border-blue-500/30 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/15 text-sky-200 border border-white/15">
              Stage {getModuleStage(activeModule.moduleNumber)} • Module{' '}
              {activeModule.moduleNumber} Active
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950/40 text-slate-200 border border-white/10">
              {activeModule.suggestedDuration ??
                activeModule.yearPathway ??
                '6–10 weeks'}{' '}
              • 90% Assessment Pass Standard
            </span>
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeModule.title}
            </h1>
            <p className="text-sm text-blue-100/90 mt-1.5 leading-relaxed">
              {activeModule.summary}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/35 border border-white/10 p-3.5 text-xs text-blue-100 space-y-1">
            <div className="font-semibold text-sky-200">
              Active Topic {activeTopic.code}: {activeTopic.title}
            </div>
            <div className="text-blue-100/80">
              <strong>What you&apos;ll be able to do after this module:</strong>{' '}
              {activeModule.learningGate}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setCurrentStep('learn');
                setActiveView('tutor');
              }}
              data-testid="hero-start-tutor-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-blue-900 hover:bg-blue-50 shadow-sm transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-blue-900" />
              <span>
                Start / Resume Module {activeModule.moduleNumber} Tutor
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleStartTopicAssessment(activeModule, activeTopic)
              }
              data-testid="hero-start-topic-exam-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600/80 hover:bg-blue-500 text-white border border-white/20 transition-colors cursor-pointer"
            >
              <span>
                Topic {activeTopic.code} Assessment (
                {activeTopic.assessmentQuestions.length} Qs)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStartModuleAssessment(activeModule)}
              data-testid="hero-start-module-exam-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900/70 hover:bg-slate-900 text-sky-200 border border-white/15 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>
                Module {activeModule.moduleNumber} Exam (
                {activeModule.moduleAssessment.length} Qs • 90% Pass)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModuleInMap(selectedModuleNumber)}
              data-testid="dashboard-open-syllabus-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/40 hover:bg-slate-900/70 text-white border border-white/10 transition-colors cursor-pointer"
            >
              <span>Open in Learning Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Circular SVG Progress Ring (0% Initial Progress) */}
        <div className="flex items-center gap-5 bg-slate-950/40 border border-white/15 rounded-2xl p-5 shrink-0 self-start lg:self-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg
              className="w-28 h-28 -rotate-90"
              viewBox="0 0 112 112"
              aria-label={`Overall course progress ${progressSummary.overallProgressPercent}%`}
            >
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={ringRadius}
                stroke="#38BDF8"
                strokeWidth="9"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className="font-display text-2xl font-bold text-white tabular-nums"
                data-testid="overall-progress-percent"
              >
                {progressSummary.overallProgressPercent}%
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-200">
                Mastered
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="font-semibold text-white">
              Overall Course Progress
            </div>
            <div className="font-mono text-sky-200">
              <span data-testid="completed-modules-count">
                {progressSummary.completedModulesCount} /{' '}
                {progressSummary.totalModulesCount}
              </span>{' '}
              Modules
            </div>
            <div className="font-mono text-emerald-300">
              <span data-testid="passed-topics-count">
                {progressSummary.passedTopicsCount} /{' '}
                {progressSummary.totalTopicsCount}
              </span>{' '}
              Topics
            </div>
            <div className="font-mono text-slate-300">
              <span data-testid="total-attempts-count">
                {progressSummary.totalAttemptsCount}
              </span>{' '}
              Attempts
            </div>
            <div className="pt-1">
              {!confirmResetOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  data-testid="reset-progress-trigger"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Progress</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={handleResetAllProgress}
                    data-testid="confirm-reset-progress-btn"
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                  >
                    Confirm 0%
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(false)}
                    className="px-1.5 py-0.5 rounded text-[11px] text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN MIDDLE GRID: MILESTONE TRACKER & RECENT SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Core Mechanics & Portfolio Milestones Tracker */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  Core Mechanics &amp; Portfolio Verification
                </span>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Core Skills &amp; Project checkpoints
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {milestoneBars.reduce((acc, b) => acc + b.completed, 0)} /{' '}
                {milestoneBars.reduce((acc, b) => acc + b.target, 0)} Core
                Checks
              </span>
            </div>

            <div className="space-y-3">
              {milestoneBars.map((bar) => {
                const pct = Math.round((bar.completed / bar.target) * 100);
                return (
                  <div key={bar.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bar.label}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {bar.completed}/{bar.target} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {bar.unitDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {COURSE_DEVELOPMENT_REQUIREMENTS.slice(0, 3).map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() =>
                    handleSelectModuleAndTopic(
                      req.targetModules[0],
                      undefined,
                      'tutor'
                    )
                  }
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Extra practice: {req.topic}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveView('coverage')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              <span>Inspect Project checkpoints &amp; Coverage Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Recent Learning & Assessment Sessions */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  Recent Study &amp; Exam Activity
                </span>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Recent Learning &amp; Assessment Sessions
                </h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {progressState.attemptHistory.length} saved
              </span>
            </div>

            {progressState.attemptHistory.length === 0 ? (
              <div
                data-testid="empty-attempt-history"
                className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-2.5"
              >
                <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No sessions or assessment attempts recorded yet
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All course progress starts at 0% with zero fabricated
                  activity. Complete a guided lesson or submit any Topic (5 Qs)
                  or Module (20 Qs) Assessment to log your progress here.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('learn');
                      setActiveView('tutor');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start First Lesson (Module 0)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1"
                data-testid="attempt-history-list"
              >
                {progressState.attemptHistory.slice(0, 12).map((att) => (
                  <div
                    key={att.attemptId}
                    className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                            att.passed
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {att.passed
                            ? 'PASSED (≥90%)'
                            : 'NOT PASSED (<90%)'}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {att.correctCount}/{att.totalQuestions} (
                          {att.scorePercent.toFixed(0)}%)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {att.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const mod = getModuleByNumber(att.moduleNumber);
                        if (!mod) return;
                        if (att.topicId) {
                          const found = getTopicById(att.topicId);
                          if (found) {
                            handleStartTopicAssessment(
                              found.module,
                              found.topic
                            );
                            return;
                          }
                        }
                        handleStartModuleAssessment(mod);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline shrink-0 cursor-pointer"
                    >
                      Retake →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pass threshold: 90% on all assessments</span>
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className="font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Open Learning Map →
            </button>
          </div>
        </div>
      </div>

      {/* 3. COMPLETE 20-MODULE SYLLABUS PATHWAY CARDS (Modules 0 to 19) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Active Syllabus Pathway: Modules 0 to 19
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Open any module in the Guided Tutor, inspect its topics in the
              Unified Learning Map, or launch its 20-question End-of-Module Exam
              (90% pass mark).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('map')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            <span>Open Unified Visual Learning Map (Stages 1–3)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          data-testid="dashboard-modules-grid"
        >
          {ALL_SYLLABUS_MODULES.map((mod) => {
            const modProg = progressState.modules[mod.id];
            const passedTopics = mod.topics.filter(
              (t) => progressState.topics[t.id]?.passed
            ).length;
            const anyTopicAttempted = mod.topics.some(
              (t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
            );
            const isCompleted = Boolean(modProg?.passed);
            const isAttempted =
              (modProg?.attemptsCount ?? 0) > 0 || anyTopicAttempted;

            return (
              <div
                key={mod.id}
                data-testid={`dashboard-module-card-${mod.moduleNumber}`}
                className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isCompleted
                    ? 'border-emerald-400 dark:border-emerald-500/50'
                    : isAttempted
                    ? 'border-amber-400 dark:border-amber-500/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                      Module {mod.moduleNumber}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : isAttempted
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted
                        ? `Passed (${modProg.bestScorePercent.toFixed(0)}%)`
                        : isAttempted
                        ? 'In Progress'
                        : 'Not Started'}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {mod.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>
                      Topics: {passedTopics}/{mod.topics.length} passed
                    </span>
                    <span>
                      Exam:{' '}
                      {modProg?.attemptsCount
                        ? `${modProg.bestScorePercent.toFixed(0)}%`
                        : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectModuleAndTopic(
                          mod.moduleNumber,
                          mod.topics[0]?.id,
                          'tutor'
                        )
                      }
                      data-testid={`open-module-btn-${mod.moduleNumber}`}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      Study Module
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartModuleAssessment(mod)}
                      data-testid={`quick-exam-btn-${mod.moduleNumber}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                      title={`Start Module ${mod.moduleNumber} End-of-Module Assessment (20 Questions)`}
                    >
                      20-Q Exam
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
