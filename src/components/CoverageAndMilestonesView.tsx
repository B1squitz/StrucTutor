import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  FolderKanban,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import {
  NormalizedSyllabusModule,
  CourseProgressState,
} from '../types/syllabus';
import { buildSyllabusCoverageMap } from '../utils/assessmentEngine';
import {
  INTEGRATED_PROJECT_MILESTONES,
  COURSE_DEVELOPMENT_REQUIREMENTS,
  FIVE_STUDY_RULES,
  CALCULATION_NOTE_STRUCTURE,
} from '../data/syllabusMetadata';

interface CoverageAndMilestonesViewProps {
  modules: NormalizedSyllabusModule[];
  progressState: CourseProgressState;
  onSelectModule: (moduleNumber: number) => void;
}

export const CoverageAndMilestonesView: React.FC<
  CoverageAndMilestonesViewProps
> = ({ modules, progressState, onSelectModule }) => {
  const [activeTab, setActiveTab] = useState<
    'coverage' | 'milestones' | 'standards'
  >('coverage');
  const coverageMap = buildSyllabusCoverageMap(modules);

  const totalTopics = coverageMap.reduce((acc, m) => acc + m.topicCount, 0);
  const totalTopicQuestions = coverageMap.reduce(
    (acc, m) => acc + m.totalTopicQuestions,
    0
  );
  const totalModuleQuestions = coverageMap.reduce(
    (acc, m) => acc + m.moduleAssessmentQuestions,
    0
  );
  const grandTotalQuestions = totalTopicQuestions + totalModuleQuestions;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-sky-400 font-semibold">
              Syllabus Verification &amp; Portfolio Architecture
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Coverage Map, Integrated Milestones (A–F) &amp; Study Standards
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Full traceability linking every syllabus module (0 to 19) and
              topic to its assessment question bank, integrated design
              milestones, and calculation note standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('coverage')}
              data-testid="subtab-coverage"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'coverage'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Coverage Map ({grandTotalQuestions} Qs)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('milestones')}
              data-testid="subtab-milestones"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'milestones'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Milestones A–F &amp; [UI1] Requirements</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('standards')}
              data-testid="subtab-standards"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'standards'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>5 Study Rules &amp; 9-Part Calc Note</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Syllabus Modules
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {coverageMap.length}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Modules 0–19)
              </span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assessed Syllabus Topics
            </p>
            <p className="text-xl font-bold font-mono text-blue-600 dark:text-sky-400 mt-0.5">
              {totalTopics}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (≥5 Qs each)
              </span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Topic Assessment Bank
            </p>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalTopicQuestions}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Questions
              </span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Module Exam Bank
            </p>
            <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
              {totalModuleQuestions}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Questions (20/mod)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: COVERAGE MAP */}
      {activeTab === 'coverage' && (
        <div className="space-y-4" data-testid="coverage-map-section">
          {coverageMap.map((report) => {
            const modState = progressState.modules[report.moduleId];
            const sourceModule = modules.find(
              (m) => m.moduleNumber === report.moduleNumber
            );
            return (
              <div
                key={report.moduleId}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                        Module {report.moduleNumber} ({report.moduleId})
                      </span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        {report.totalTopicQuestions} Topic Qs +{' '}
                        {report.moduleAssessmentQuestions} Module Qs
                      </span>
                      {modState?.passed && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                          Module Passed ({modState.bestScorePercent.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                      {report.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectModule(report.moduleNumber)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Open Module {report.moduleNumber} in Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Topics Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase">
                        <th className="py-2 pr-3">Topic Code</th>
                        <th className="py-2 px-3">Syllabus Topic Title</th>
                        <th className="py-2 px-3">Topic Assessment</th>
                        <th className="py-2 px-3">Module Exam Link</th>
                        <th className="py-2 pl-3 text-right">Pass Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60">
                      {report.topics.map((t) => {
                        const tProg = progressState.topics[t.topicId];
                        return (
                          <tr
                            key={t.topicId}
                            className="text-slate-700 dark:text-slate-300"
                          >
                            <td className="py-2.5 pr-3 font-mono font-bold text-blue-600 dark:text-sky-300 whitespace-nowrap">
                              Topic {t.code}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                              {t.title}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-300">
                              {t.topicQuestionCount} questions (90% pass)
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                              +{t.moduleQuestionCount} in Module Exam
                            </td>
                            <td className="py-2.5 pl-3 text-right font-mono">
                              {tProg?.passed ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  Passed ({tProg.bestScorePercent.toFixed(0)}%)
                                </span>
                              ) : tProg && tProg.attemptsCount > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                  Attempted ({tProg.bestScorePercent.toFixed(0)}
                                  %)
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">
                                  Not Started (0%)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {sourceModule && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>
                      <strong className="text-slate-900 dark:text-slate-200">
                        Learning Gate:
                      </strong>{' '}
                      {sourceModule.learningGate}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-300">
                      Worked Examples: {sourceModule.workedExamples.length} •
                      Module Exam: {report.moduleAssessmentQuestions} Qs (90%
                      Pass)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MILESTONES A-F & COURSE DEVELOPMENT REQUIREMENTS [UI1] */}
      {activeTab === 'milestones' && (
        <div className="space-y-6" data-testid="milestones-section">
          {/* Integrated Project Milestones A to F */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Integrated Project Milestones (Milestones A to F)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                From the Civil Engineering Syllabus: these six portfolio
                milestones turn theoretical modules into auditable engineering
                deliverables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATED_PROJECT_MILESTONES.map((ms) => {
                const isCompleted = ms.prerequisiteModuleNumbers.every(
                  (mNum) =>
                    progressState.modules[
                      `MOD-${String(mNum).padStart(2, '0')}`
                    ]?.passed
                );
                return (
                  <div
                    key={ms.id}
                    className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                          {ms.code} ({ms.Timing})
                        </span>
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-lg ${
                            isCompleted
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isCompleted ? 'Prereqs Passed' : 'Not Completed'}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {ms.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ms.description}
                      </p>

                      <div className="space-y-1 pt-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Required Deliverables:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          {ms.deliverables.map((deliv, i) => (
                            <li key={i}>{deliv}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                      <p className="text-xs text-amber-800 dark:text-amber-300/90">
                        <strong>Pass Condition:</strong> {ms.passCondition}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Linked Modules:
                        </span>
                        {ms.prerequisiteModuleNumbers.map((mNum) => (
                          <button
                            key={mNum}
                            type="button"
                            onClick={() => onSelectModule(mNum)}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            Mod {mNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Syllabus Comment [UI1] Course-Development Requirements */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Syllabus Comment [UI1] Course-Development Requirements &amp;
                  Source Boundaries
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  The syllabus includes comment [UI1] requesting straightforward
                  examples for precast, backpropping, lifting, geotechnical
                  reports, and Category 2 checking. Each item is tracked below
                  with explicit engineering scope and source-boundary safeguards:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {COURSE_DEVELOPMENT_REQUIREMENTS.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        {req.sourceRef}
                      </span>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {req.topic}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {req.targetModules.map((mNum) => (
                        <button
                          key={mNum}
                          type="button"
                          onClick={() => onSelectModule(mNum)}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          Open Module {mNum}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>Syllabus Requirement:</strong> {req.syllabusComment}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    <strong>Verification &amp; Source Boundary:</strong>{' '}
                    {req.handlingNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FIVE STUDY RULES & 9-PART CALCULATION NOTE STRUCTURE */}
      {activeTab === 'standards' && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          data-testid="standards-section"
        >
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-sky-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                The Five Mandatory Study Rules
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Every topic across Modules 0 to 19 must be studied using these
              five non-negotiable engineering steps:
            </p>
            <div className="space-y-3">
              {FIVE_STUDY_RULES.map((rule) => (
                <div
                  key={rule.number}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-sky-500/20 border border-blue-200 dark:border-sky-500/40 text-blue-700 dark:text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {rule.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rule.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Nine-Part Calculation-Note Structure
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Every worked example and portfolio milestone deliverable follows
              this industry-standard UK design office calculation structure:
            </p>
            <div className="space-y-2.5">
              {CALCULATION_NOTE_STRUCTURE.map((part) => (
                <div
                  key={part.sectionNumber}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">
                    {part.sectionNumber}. {part.title}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {part.requirement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
