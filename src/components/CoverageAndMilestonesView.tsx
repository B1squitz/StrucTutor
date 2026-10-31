import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileSpreadsheet,
  FileText,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
} from '../types/syllabus';
import { getTopicById } from '../data/fullSyllabus';
import {
  CALCULATION_NOTE_STRUCTURE,
  COURSE_DEVELOPMENT_REQUIREMENTS,
  FIVE_STUDY_RULES,
  INTEGRATED_PROJECT_MILESTONES,
  PROFESSIONAL_SAFEGUARD_NOTICE,
} from '../data/syllabusMetadata';
import {
  buildSyllabusCoverageMap,
  computeAdaptiveStudyPlan,
} from '../utils/assessmentEngine';
import {
  EUROCODE_DESIGN_SCENARIOS,
  evaluateEurocodeDesignScenario,
  type ScenarioEvaluationResult,
} from '../utils/questionGenerators';
import {
  loadUserReferenceDocs,
  queryGroundedReferenceLibrary,
  saveUserReferenceDocs,
  type UserUploadedReferenceDoc,
} from '../utils/localRagEngine';

export interface CoverageAndMilestonesViewProps {
  modules: NormalizedSyllabusModule[];
  progressState: CourseProgressState;
  onSelectModule: (moduleNumber: number, topicId?: string) => void;
  onUpdateProgressState?: (next: CourseProgressState) => void;
}

export const CoverageAndMilestonesView: React.FC<
  CoverageAndMilestonesViewProps
> = ({
  modules,
  progressState,
  onSelectModule,
  onUpdateProgressState,
}) => {
  const [activeSubtab, setActiveSubtab] = useState<
    'coverage' | 'milestones' | 'standards' | 'workbench'
  >('coverage');

  const coverageRows = useMemo(
    () => buildSyllabusCoverageMap(modules),
    [modules]
  );

  // Workbench: 1. Multi-Step Eurocode Scenarios (Section 5)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    EUROCODE_DESIGN_SCENARIOS[0].id
  );
  const activeScenario =
    EUROCODE_DESIGN_SCENARIOS.find((s) => s.id === selectedScenarioId) ??
    EUROCODE_DESIGN_SCENARIOS[0];

  const [wEdInput, setWEdInput] = useState<string>(
    String(activeScenario.expectedGoverningValues.wEdKnM)
  );
  const [mEdInput, setMEdInput] = useState<string>(
    String(activeScenario.expectedGoverningValues.MEdKnM)
  );
  const [vEdInput, setVEdInput] = useState<string>(
    String(activeScenario.expectedGoverningValues.VEdKn)
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    activeScenario.candidateSections[1]?.designation ??
      activeScenario.candidateSections[0].designation
  );
  const [scenarioResult, setScenarioResult] =
    useState<ScenarioEvaluationResult | null>(null);

  const handleScenarioSwitch = (id: string) => {
    setSelectedScenarioId(id);
    const next = EUROCODE_DESIGN_SCENARIOS.find((s) => s.id === id);
    if (next) {
      setWEdInput(String(next.expectedGoverningValues.wEdKnM));
      setMEdInput(String(next.expectedGoverningValues.MEdKnM));
      setVEdInput(String(next.expectedGoverningValues.VEdKn));
      setSelectedSection(
        next.candidateSections[1]?.designation ??
          next.candidateSections[0].designation
      );
      setScenarioResult(null);
    }
  };

  const handleVerifyScenario = () => {
    const res = evaluateEurocodeDesignScenario(activeScenario, {
      wEdKnM: Number.parseFloat(wEdInput) || 0,
      MEdKnM: Number.parseFloat(mEdInput) || 0,
      VEdKn: Number.parseFloat(vEdInput) || 0,
      selectedDesignation: selectedSection,
    });
    setScenarioResult(res);
    if (
      res.passedAllSteps &&
      onUpdateProgressState &&
      !progressState.completedDesignScenarios.includes(activeScenario.id)
    ) {
      onUpdateProgressState({
        ...progressState,
        completedDesignScenarios: [
          ...progressState.completedDesignScenarios,
          activeScenario.id,
        ],
      });
    }
  };

  // Workbench: 2. Adaptive Study Plan
  const adaptivePlan = useMemo(
    () => computeAdaptiveStudyPlan(progressState, modules),
    [progressState, modules]
  );

  // Workbench: 3. Offline Citation-Grounded RAG Reference Library
  const [userDocs, setUserDocs] = useState<UserUploadedReferenceDoc[]>(() =>
    loadUserReferenceDocs()
  );
  const [ragQuery, setRagQuery] = useState<string>(
    'lateral torsional buckling restraint'
  );
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocCitation, setNewDocCitation] = useState<string>('');
  const [newDocText, setNewDocText] = useState<string>('');

  const ragResult = useMemo(
    () => queryGroundedReferenceLibrary(ragQuery, userDocs),
    [ragQuery, userDocs]
  );

  const handleAddUserReferenceDoc = () => {
    if (!newDocTitle.trim() || !newDocText.trim()) return;
    const doc: UserUploadedReferenceDoc = {
      docId: `USER-DOC-${Date.now()}`,
      title: newDocTitle.trim(),
      sourceCitation:
        newDocCitation.trim() || 'User Uploaded Structural Reference Note',
      uploadedAt: new Date().toISOString(),
      rawText: newDocText.trim(),
    };
    const next = [doc, ...userDocs];
    setUserDocs(next);
    saveUserReferenceDocs(next);
    setNewDocTitle('');
    setNewDocCitation('');
    setNewDocText('');
  };

  return (
    <div
      className="max-w-[1200px] mx-auto space-y-6"
      data-testid="coverage-milestones-view"
    >
      {/* Top Header & Subtab Selector */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Syllabus Architecture, Project checkpoints &amp; Eurocode Workbench
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Syllabus Coverage Map, Project checkpoints &amp; Design Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-4xl leading-relaxed">
            {PROFESSIONAL_SAFEGUARD_NOTICE}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubtab('coverage')}
            data-testid="subtab-coverage"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubtab === 'coverage'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Coverage Map (20 Modules)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab('milestones')}
            data-testid="subtab-milestones"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubtab === 'milestones'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Project checkpoints &amp; Extra practice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab('standards')}
            data-testid="subtab-standards"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubtab === 'standards'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>5 Study Rules &amp; 9-Part Calc Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubtab('workbench')}
            data-testid="subtab-workbench"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubtab === 'workbench'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Eurocode Scenarios &amp; Local RAG</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: COVERAGE MAP */}
      {activeSubtab === 'coverage' && (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Complete 20-Module Assessment &amp; Topic Coverage Matrix
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {coverageRows.reduce((a, r) => a + r.totalQuestions, 0)} Verified
              &amp; Schema-Validated Questions Across 62 Topics
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase">
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">Syllabus Title</th>
                  <th className="py-3 px-3">Topics</th>
                  <th className="py-3 px-3">Topic Qs</th>
                  <th className="py-3 px-3">Module Exam</th>
                  <th className="py-3 px-3">Gate Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {coverageRows.map((row) => {
                  const modProg = progressState.modules[row.moduleId];
                  const isPassed = Boolean(modProg?.passed);
                  return (
                    <tr
                      key={row.moduleId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-sky-400">
                        {row.code}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {row.title}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {row.topicsCount} topics
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {row.totalTopicQuestions} Qs
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {row.moduleAssessmentQuestions} Qs
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {isPassed ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Passed ({modProg.bestScorePercent.toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">0% (Pending)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectModule(row.moduleNumber)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-sky-300 font-semibold hover:bg-blue-100 cursor-pointer"
                        >
                          Open →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTEGRATED MILESTONES A–F & [UI1] REQUIREMENTS */}
      {activeSubtab === 'milestones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATED_PROJECT_MILESTONES.map((ms) => (
              <div
                key={ms.id}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300">
                    Project checkpoint {ms.code} • {ms.Timing}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectModule(ms.afterModule)}
                    className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Go to Module {ms.afterModule} →
                  </button>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {ms.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ms.description}
                </p>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {ms.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Pass Condition: {ms.passCondition}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Extra practice Course Development Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COURSE_DEVELOPMENT_REQUIREMENTS.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-sky-400">
                      Extra practice ({req.id}): {req.topic}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Modules: {req.targetModules.join(', ')}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {req.title}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {req.statusNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: FIVE STUDY RULES & 9-SECTION CALCULATION NOTE */}
      {activeSubtab === 'standards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              The Five Mandatory Study Rules
            </h2>
            <div className="space-y-3">
              {FIVE_STUDY_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-1 text-xs"
                >
                  <div className="font-mono font-bold text-blue-600 dark:text-sky-400">
                    Rule {rule.stepNumber}: {rule.title}
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {rule.instruction}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              9-Section Professional Calculation Note Structure
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CALCULATION_NOTE_STRUCTURE.map((sec) => (
                <div
                  key={sec.key}
                  className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1 text-xs"
                >
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Section {sec.sectionNumber}: {sec.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.requirement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INTERACTIVE EUROCODE WORKBENCH, ADAPTIVE PLANNER & LOCAL RAG */}
      {activeSubtab === 'workbench' && (
        <div className="space-y-6">
          {/* 1. Multi-step Eurocode Design Scenarios */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-sky-400">
                  Multi-Step Eurocode Design Verification (Non-Unique Valid Sections)
                </span>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {activeScenario.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {EUROCODE_DESIGN_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleScenarioSwitch(sc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                      selectedScenarioId === sc.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sc.title}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeScenario.brief}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                  1. ULS Load w_Ed (kN/m)
                </label>
                <input
                  type="text"
                  value={wEdInput}
                  onChange={(e) => setWEdInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                  2. ULS Moment M_Ed (kN·m)
                </label>
                <input
                  type="text"
                  value={mEdInput}
                  onChange={(e) => setMEdInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                  3. ULS Shear V_Ed (kN)
                </label>
                <input
                  type="text"
                  value={vEdInput}
                  onChange={(e) => setVEdInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 mb-1">
                  4. Select Candidate UKB Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 font-mono text-xs"
                >
                  {activeScenario.candidateSections.map((s) => (
                    <option key={s.designation} value={s.designation}>
                      {s.designation} (W_pl={s.WplYCm3} cm³, I_y={s.IyCm4} cm⁴)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleVerifyScenario}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Verify Eurocode Design Steps
              </button>
            </div>

            {scenarioResult && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2 text-xs">
                <div className="font-bold text-sm flex items-center gap-2">
                  {scenarioResult.passedAllSteps ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{scenarioResult.overallFeedback}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scenarioResult.stepResults.map((st) => (
                    <div
                      key={st.stepId}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
                    >
                      <div className="font-semibold flex justify-between">
                        <span>{st.label}</span>
                        <span
                          className={
                            st.passed ? 'text-emerald-500' : 'text-rose-500'
                          }
                        >
                          {st.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{st.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Adaptive Study Planner & Spaced Review */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Adaptive Pace &amp; Spaced Retention Queue
                </span>
                <h3 className="font-display text-base font-bold">
                  Recommended Next Topic: Module{' '}
                  {adaptivePlan.nextRecommendedTopic.moduleNumber} (
                  {adaptivePlan.nextRecommendedTopic.title})
                </h3>
                <p className="text-xs text-slate-500">
                  {adaptivePlan.nextRecommendedTopic.rationale} • Pace Mode:{' '}
                  {adaptivePlan.learnerPaceMode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const resolved = getTopicById(
                    adaptivePlan.nextRecommendedTopic.topicId
                  );
                  if (resolved) {
                    onSelectModule(
                      resolved.module.moduleNumber,
                      resolved.topic.id
                    );
                  } else {
                    onSelectModule(
                      adaptivePlan.nextRecommendedTopic.moduleNumber,
                      adaptivePlan.nextRecommendedTopic.topicId
                    );
                  }
                }}
                data-testid="open-recommended-topic-btn"
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Recommended Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Offline Citation-Grounded RAG Reference Library */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                  Offline Citation-Grounded Reference Library (RAG)
                </span>
                <h3 className="font-display text-base font-bold">
                  Search Across All 20 Syllabus Modules &amp; Personal Excerpts
                </h3>
              </div>
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Search local engineering index (e.g. 'padstone bearing', 'Euler buckling')"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs sm:text-sm"
              />
            </div>

            <div className="rounded-xl bg-blue-50/70 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 p-4 text-xs space-y-1.5">
              <div className="font-mono font-bold text-blue-700 dark:text-sky-400">
                Grounded Synthesis ({ragResult.citations.length} matched chunks):
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {ragResult.synthesisedAnswer}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Note title (e.g. EC3 LTB Summary)"
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs"
              />
              <input
                type="text"
                value={newDocCitation}
                onChange={(e) => setNewDocCitation(e.target.value)}
                placeholder="Source / Clause (e.g. BS EN 1993-1-1 Cl. 6.3.2)"
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  placeholder="Paste excerpt text..."
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddUserReferenceDoc}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
