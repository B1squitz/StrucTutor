import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  Award,
  Layers,
  FileText,
  ArrowRight,
  Compass,
  FolderPlus,
  Wrench
} from 'lucide-react';
import {
  NormalizedSyllabusModule,
  SyllabusTopic,
  CourseProgressState
} from '../types/syllabus';

interface ModuleWorkspaceViewProps {
  modules: NormalizedSyllabusModule[];
  selectedModuleNumber: number;
  progressState: CourseProgressState;
  onSelectModule: (moduleNumber: number) => void;
  onStartTopicAssessment: (module: NormalizedSyllabusModule, topic: SyllabusTopic) => void;
  onStartModuleAssessment: (module: NormalizedSyllabusModule) => void;
  onOpenModule0GuidedSandbox: () => void;
}

export const ModuleWorkspaceView: React.FC<ModuleWorkspaceViewProps> = ({
  modules,
  selectedModuleNumber,
  progressState,
  onSelectModule,
  onStartTopicAssessment,
  onStartModuleAssessment,
  onOpenModule0GuidedSandbox,
}) => {
  const activeModule =
    modules.find((m) => m.moduleNumber === selectedModuleNumber) ?? modules[0];

  const activeModProgress = progressState.modules[activeModule.id];
  const passedTopicsInActiveModule = activeModule.topics.filter(
    (t) => progressState.topics[t.id]?.passed
  ).length;

  const getModuleStatus = (mod: NormalizedSyllabusModule): 'completed' | 'in_progress' | 'not_started' => {
    const mp = progressState.modules[mod.id];
    if (mp?.passed) return 'completed';
    const anyTopicAttempted = mod.topics.some(
      (t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
    );
    if ((mp?.attemptsCount ?? 0) > 0 || anyTopicAttempted) {
      return 'in_progress';
    }
    return 'not_started';
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: All 20 Modules (Module 0 to Module 19) */}
        <aside className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="px-2 pt-1 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Complete Syllabus (Modules 0–19)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              20 Modules • 90% Pass Mark on Topic &amp; Module Assessments
            </p>
          </div>

          <div
            className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1"
            data-testid="module-selector-list"
          >
            {modules.map((mod) => {
              const isSelected = mod.moduleNumber === activeModule.moduleNumber;
              const status = getModuleStatus(mod);
              const topicsPassedCount = mod.topics.filter(
                (t) => progressState.topics[t.id]?.passed
              ).length;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => onSelectModule(mod.moduleNumber)}
                  data-testid={`select-module-${mod.moduleNumber}`}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500/60 text-white'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : status === 'in_progress' ? (
                      <Clock className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-400">
                        Module {mod.moduleNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {status === 'completed'
                          ? 'Completed'
                          : status === 'in_progress'
                          ? 'In Progress'
                          : 'Not Started'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                      {mod.shortTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Topics: {topicsPassedCount}/{mod.topics.length} • Exam: 20 Qs
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content: Selected Module Workspace */}
        <main className="lg:col-span-8 space-y-6" data-testid="active-module-workspace">
          {/* 1. Module Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Module {activeModule.moduleNumber} • {activeModule.id}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {activeModule.topics.length} Topics ({passedTopicsInActiveModule}/{activeModule.topics.length} Passed)
                </span>
              </div>

              <span
                data-testid="active-module-status-badge"
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  activeModProgress?.passed
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : (activeModProgress?.attemptsCount ?? 0) > 0
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {activeModProgress?.passed
                  ? `Module Completed (Best: ${activeModProgress.bestScorePercent.toFixed(1)}%)`
                  : (activeModProgress?.attemptsCount ?? 0) > 0
                  ? `Module Assessment Attempted (Best: ${activeModProgress.bestScorePercent.toFixed(1)}%)`
                  : 'Module Not Started'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Module {activeModule.moduleNumber}: {activeModule.title}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {activeModule.summary}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Why This Module Matters in Engineering Practice
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeModule.whyItMatters}
              </p>
            </div>

            {/* Module Objectives */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Syllabus Learning Objectives
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {activeModule.objectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 bg-slate-950/40 border border-slate-800/70 rounded-lg p-3"
                  >
                    <span className="font-mono text-xs font-bold text-sky-400 mt-0.5">
                      {activeModule.moduleNumber}.{idx + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Syllabus Learning Gate Callout */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Mandatory Syllabus Learning Gate (Module {activeModule.moduleNumber})
                </p>
                <p className="text-sm font-medium text-white">
                  {activeModule.learningGate}
                </p>
                <p className="text-xs text-slate-400">
                  To complete Module {activeModule.moduleNumber} in your course progress, pass the 20-question End-of-Module Assessment below with a score of <strong>90% or higher (at least 18/20)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* 2. End-of-Module Assessment Action Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/40 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  End-of-Module Assessment
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {activeModule.moduleAssessment.length} Substantive Questions • 90% Pass Mark
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Module {activeModule.moduleNumber} Comprehensive Assessment
              </h2>
              <p className="text-xs text-slate-300">
                {activeModProgress?.attemptsCount
                  ? `Attempts recorded: ${activeModProgress.attemptsCount} • Best Score: ${activeModProgress.bestScorePercent.toFixed(1)}% • Status: ${
                      activeModProgress.passed ? 'PASSED (≥90%)' : 'Not Yet Passed (<90%)'
                    }`
                  : 'Status: Not Attempted (0 attempts recorded)'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {activeModule.moduleNumber === 0 && (
                <button
                  type="button"
                  onClick={onOpenModule0GuidedSandbox}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  Guided Unit Sandbox
                </button>
              )}
              <button
                type="button"
                onClick={() => onStartModuleAssessment(activeModule)}
                data-testid={`start-module-assessment-${activeModule.moduleNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <span>
                  {activeModProgress?.attemptsCount
                    ? 'Retake End-of-Module Assessment'
                    : 'Start End-of-Module Assessment (20 Qs)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Module Topics & End-of-Topic Assessments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>
                  Module {activeModule.moduleNumber} Topics &amp; End-of-Topic Assessments
                </span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Each topic has a 5-question assessment (90% pass mark)
              </span>
            </div>

            {activeModule.topics.map((topic) => {
              const tProg = progressState.topics[topic.id];
              return (
                <div
                  key={topic.id}
                  data-testid={`topic-card-${topic.id}`}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                          Topic {topic.code} ({topic.id})
                        </span>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded border ${
                            tProg?.passed
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : (tProg?.attemptsCount ?? 0) > 0
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700'
                          }`}
                        >
                          {tProg?.passed
                            ? `Topic Passed (${tProg.bestScorePercent.toFixed(0)}%)`
                            : (tProg?.attemptsCount ?? 0) > 0
                            ? `Attempted (Best: ${tProg.bestScorePercent.toFixed(0)}% • ${tProg.attemptsCount}x)`
                            : 'Not Attempted'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white pt-1">
                        {topic.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartTopicAssessment(activeModule, topic)}
                      data-testid={`start-topic-assessment-${topic.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shrink-0 transition-colors cursor-pointer"
                    >
                      <span>
                        {tProg?.attemptsCount
                          ? `Retake Topic ${topic.code} Assessment (${topic.assessmentQuestions.length} Qs)`
                          : `Topic ${topic.code} Assessment (${topic.assessmentQuestions.length} Qs)`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtopics Covered */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Syllabus Subtopics Covered:
                    </p>
                    <ul className="space-y-1">
                      {topic.subtopics.map((sub, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-sky-400 font-mono">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Future Expansion Architecture Slot */}
                  <div className="bg-slate-950/40 border border-dashed border-slate-700/80 rounded-lg px-3.5 py-2.5 flex items-start gap-2.5">
                    <FolderPlus className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Expandable Content Architecture:</strong>{' '}
                      {topic.futureContentNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Worked Examples, Projects & Self-Review Checklists */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">
                  Syllabus Worked Examples &amp; Self-Review Design Exercises
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Self-Review / Independent Review (Not Auto-Graded)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with the Five Study Rules, freehand sketches, load-path diagrams, and 9-part calculation notes require structured self-review or independent peer checking rather than automated multiple-choice grading.
            </p>

            <div className="space-y-3">
              {activeModule.WorkedExamples.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{ex.title}</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {ex.id} • Self-Review Checklist
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{ex.brief}</p>
                  <div className="pt-1 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Verification Checklist:
                    </p>
                    {ex.checklist.map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="font-mono text-amber-400">{idx + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
