import React from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { ALL_SYLLABUS_MODULES } from '../data/fullSyllabus';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from '../types/syllabus';
import {
  getModuleStage,
  InspectorDrawerTarget,
  MainView,
  toLegacyModuleItem,
} from '../hooks/useStructTutorWorkspace';

export interface LearningMapViewProps {
  mapStageFilter: 'all' | 1 | 2 | 3;
  setMapStageFilter: (stage: 'all' | 1 | 2 | 3) => void;
  mapSearchQuery: string;
  setMapSearchQuery: (q: string) => void;
  mapStatusFilter: 'all' | 'not-started' | 'in-progress' | 'passed';
  setMapStatusFilter: (
    status: 'all' | 'not-started' | 'in-progress' | 'passed'
  ) => void;
  selectedModuleNumber: number;
  setSelectedModuleNumber: (modNum: number) => void;
  expandedMapModules: Record<number, boolean>;
  setExpandedMapModules: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
  filteredMapModules: NormalizedSyllabusModule[];
  progressState: CourseProgressState;
  setInspectorDrawerTarget: (target: InspectorDrawerTarget | null) => void;
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
}

export const LearningMapView: React.FC<LearningMapViewProps> = ({
  mapStageFilter,
  setMapStageFilter,
  mapSearchQuery,
  setMapSearchQuery,
  mapStatusFilter,
  setMapStatusFilter,
  selectedModuleNumber,
  setSelectedModuleNumber,
  expandedMapModules,
  setExpandedMapModules,
  filteredMapModules,
  progressState,
  setInspectorDrawerTarget,
  handleSelectModuleAndTopic,
  handleStartTopicAssessment,
  handleStartModuleAssessment,
}) => {
  return (
    <div
      className="max-w-[1200px] mx-auto space-y-6"
      data-testid="learning-map-view"
    >
      {/* Top Header, Stage 1–3 Tabs & Search/Filter Controls */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              Complete 20-Module Rebuild Curriculum
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Unified Visual Learning Map (Modules 0 to 19)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Structured around all 20 syllabus modules across 3 stages. Expand
              any module to study its topics, inspect its learning gate, or take
              its End-of-Topic Assessments and 20-question End-of-Module
              Exam (90% pass mark).
            </p>
          </div>

          {/* Stage Filter Tabs */}
          <div
            role="tablist"
            aria-label="Curriculum Stage Filter"
            className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start"
          >
            {(
              [
                { id: 'all', label: 'All 20 Modules (0–19)' },
                { id: 1, label: 'Stage 1: Core Mechanics (0–8)' },
                { id: 2, label: 'Stage 2: Materials & Geotech (9–14)' },
                { id: 3, label: 'Stage 3: Analysis & Practice (15–19)' },
              ] as const
            ).map((tab, idx, arr) => {
              const isSelected = mapStageFilter === tab.id;
              return (
                <button
                  key={String(tab.id)}
                  type="button"
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  aria-selected={isSelected}
                  data-testid={`map-stage-tab-${String(tab.id)}`}
                  onClick={() => setMapStageFilter(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const nextIdx =
                        e.key === 'ArrowRight'
                          ? (idx + 1) % arr.length
                          : (idx - 1 + arr.length) % arr.length;
                      const nextId = arr[nextIdx].id;
                      setMapStageFilter(nextId);
                      const nextBtn = document.querySelector<HTMLButtonElement>(
                        `[data-testid="map-stage-tab-${String(nextId)}"]`
                      );
                      nextBtn?.focus();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Module Selector Strip (Mod 0 .. Mod 19) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ALL_SYLLABUS_MODULES.map((mod) => {
            const isPassed = Boolean(progressState.modules[mod.id]?.passed);
            const isExpanded = Boolean(expandedMapModules[mod.moduleNumber]);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModuleNumber(mod.moduleNumber);
                  setMapStageFilter('all');
                  setExpandedMapModules((prev) => ({
                    ...prev,
                    [mod.moduleNumber]: true,
                  }));
                }}
                data-testid={`module-selector-${mod.moduleNumber}`}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border shrink-0 transition-colors cursor-pointer ${
                  selectedModuleNumber === mod.moduleNumber && isExpanded
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isPassed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Mod {mod.moduleNumber}
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              placeholder="Search modules, topics, or learning gates..."
              aria-label="Search syllabus modules and topics"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All Statuses' },
                { id: 'not-started', label: 'Not Started' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'passed', label: 'Passed (≥90%)' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setMapStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  mapStatusFilter === st.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VERTICAL TIMELINE CONNECTOR & NESTED MODULE -> TOPIC ACCORDION */}
      <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700/70">
        {filteredMapModules.map((mod) => {
          const modProg = progressState.modules[mod.id];
          const passedTopicsCount = mod.topics.filter(
            (t) => progressState.topics[t.id]?.passed
          ).length;
          const anyAttempted =
            (modProg?.attemptsCount ?? 0) > 0 ||
            mod.topics.some(
              (t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
            );
          const isPassed = Boolean(modProg?.passed);
          const isExpanded = Boolean(expandedMapModules[mod.moduleNumber]);
          const stageNum = getModuleStage(mod.moduleNumber);
          const modulePct = isPassed
            ? 100
            : mod.topics.length > 0
            ? Math.round((passedTopicsCount / mod.topics.length) * 100)
            : 0;

          return (
            <div
              key={mod.id}
              data-testid={`map-module-card-${mod.moduleNumber}`}
              className="relative"
            >
              {/* Timeline Node Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-6 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border-2 z-10 ${
                  isPassed
                    ? 'bg-emerald-600 text-white border-emerald-300'
                    : anyAttempted || mod.moduleNumber === 0
                    ? 'bg-blue-600 text-white border-blue-300'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isPassed ? '✓' : mod.moduleNumber}
              </div>

              {/* Module Accordion Card */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                {/* Accordion Header */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div
                    className="space-y-1.5 flex-1 cursor-pointer"
                    onClick={() =>
                      setExpandedMapModules((prev) => ({
                        ...prev,
                        [mod.moduleNumber]: !prev[mod.moduleNumber],
                      }))
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                        Stage {stageNum} • Module {mod.moduleNumber}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {mod.suggestedDuration ?? mod.yearPathway ?? '6–10 weeks'}
                      </span>
                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg ${
                          isPassed
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : anyAttempted
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isPassed
                          ? `Module Passed (${modProg.bestScorePercent.toFixed(
                              0
                            )}%)`
                          : anyAttempted
                          ? 'In Progress'
                          : 'Not Started'}
                      </span>
                    </div>

                    <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectorDrawerTarget({
                            moduleItem: toLegacyModuleItem(mod, progressState),
                            objectiveItem: null,
                            moduleNumber: mod.moduleNumber,
                          });
                        }}
                        data-testid={`module-title-info-btn-${mod.moduleNumber}`}
                        className="text-left hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                        title="Click to inspect module syllabus details"
                      >
                        {mod.title}
                      </button>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {mod.summary}
                    </p>
                  </div>

                  {/* Header Actions & Progress */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Topics: {passedTopicsCount}/{mod.topics.length} •{' '}
                        {modulePct}%
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-blue-600 dark:bg-sky-500"
                          style={{ width: `${modulePct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectModuleAndTopic(
                          mod.moduleNumber,
                          mod.topics[0]?.id,
                          'tutor'
                        )
                      }
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 cursor-pointer"
                    >
                      Open in Tutor
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartModuleAssessment(mod)}
                      data-testid={
                        mod.moduleNumber === selectedModuleNumber
                          ? 'start-module-assessment-btn'
                          : `start-module-assessment-btn-${mod.moduleNumber}`
                      }
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs cursor-pointer"
                    >
                      20-Q Module Exam
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMapModules((prev) => ({
                          ...prev,
                          [mod.moduleNumber]: !prev[mod.moduleNumber],
                        }))
                      }
                      aria-label={`Toggle Module ${mod.moduleNumber} topics`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Module Body: Learning Gate, Nested Topics & End-of-Module Exam */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-4">
                    {/* Learning Gate Banner */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-mono font-bold uppercase text-blue-600 dark:text-sky-400">
                          What you&apos;ll be able to do after this module:
                        </span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">
                          {mod.learningGate}
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {mod.workedExamples.length} Worked Examples •{' '}
                        {mod.moduleAssessment.length} Exam Qs
                      </span>
                    </div>

                    {/* Nested Topics List */}
                    <div className="space-y-2.5">
                      {mod.topics.map((topic) => {
                        const tProg = progressState.topics[topic.id];
                        const tPassed = Boolean(tProg?.passed);
                        const tAttempted = (tProg?.attemptsCount ?? 0) > 0;
                        const legacyMod = toLegacyModuleItem(mod, progressState);
                        const legacyObj =
                          legacyMod.objectives.find(
                            (o) => o.code === topic.code
                          ) ?? null;

                        return (
                          <div
                            key={topic.id}
                            data-testid={`topic-card-${topic.id}`}
                            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300">
                                  Topic {topic.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInspectorDrawerTarget({
                                      moduleItem: legacyMod,
                                      objectiveItem: legacyObj,
                                      moduleNumber: mod.moduleNumber,
                                      topicId: topic.id,
                                    })
                                  }
                                  className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 text-left cursor-pointer"
                                  title="Click to inspect topic subtopics & syllabus notes"
                                >
                                  {topic.title}
                                </button>
                                <span
                                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                                    tPassed
                                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                      : tAttempted
                                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {tPassed
                                    ? `Passed (${tProg.bestScorePercent.toFixed(
                                        0
                                      )}%)`
                                    : tAttempted
                                    ? `Best: ${tProg.bestScorePercent.toFixed(
                                        0
                                      )}% (<90%)`
                                    : 'Not Started'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {topic.summary}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectModuleAndTopic(
                                    mod.moduleNumber,
                                    topic.id,
                                    'tutor'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                              >
                                Study Topic
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleStartTopicAssessment(mod, topic)
                                }
                                data-testid={`start-topic-assessment-${topic.id}`}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                              >
                                Topic Assessment (
                                {topic.assessmentQuestions.length} Qs)
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* End-of-Module Assessment Callout Bar */}
                    <div className="rounded-xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold uppercase text-blue-700 dark:text-sky-300">
                          End-of-Module {mod.moduleNumber} Gate Assessment • 90%
                          Pass Mark (18/20 Required)
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          Comprehensive 20-question engineering exam covering
                          all topics, calculations, load paths, and assumptions
                          in {mod.shortTitle}.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartModuleAssessment(mod)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs cursor-pointer"
                      >
                        Start 20-Question Module Exam →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
