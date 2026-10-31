import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Filter,
  ListChecks,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sun,
  Upload,
  Wrench,
} from 'lucide-react';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
  ReviewStatus,
} from '../types/syllabus';
import { APP_BUILD_DATE, APP_VERSION } from '../utils/tutorEngine';
import {
  exportCourseProgressJson,
  IDB_DB_NAME,
  importCourseProgressJson,
  PROGRESS_STORAGE_KEY,
} from '../utils/assessmentEngine';
import { THEME_STORAGE_KEY } from '../hooks/useStructTutorWorkspace';
import { ALL_SYLLABUS_MODULES } from '../data/fullSyllabus';
import {
  WORKED_EXAMPLE_GOLDEN_IDS,
  solveWorkedExampleGolden,
} from '../utils/beamEngine';

export interface SettingsViewProps {
  progressState: CourseProgressState;
  modules: NormalizedSyllabusModule[];
  hybridLightCards: boolean;
  setHybridLightCards: React.Dispatch<React.SetStateAction<boolean>>;
  onImportProgressState: (newState: CourseProgressState) => void;
  onResetAllProgress: () => void;
}

type SettingsTab = 'backup' | 'reviewQueue' | 'goldenSolvers';

const PAGE_SIZE = 30;

export const SettingsView: React.FC<SettingsViewProps> = ({
  progressState,
  modules,
  hybridLightCards,
  setHybridLightCards,
  onImportProgressState,
  onResetAllProgress,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('backup');
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Review Queue state
  const [localOverrides, setLocalOverrides] = useState<Record<string, ReviewStatus>>(
    () => progressState.questionReviewOverrides ?? {}
  );
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'Draft' | 'Verified'>('all');
  const [queuePage, setQueuePage] = useState(1);

  // Extract all questions from modules
  const allQuestions = useMemo(() => {
    const source = modules && modules.length > 0 ? modules : ALL_SYLLABUS_MODULES;
    return source.flatMap((m) => [
      ...m.topics.flatMap((t) =>
        t.questions.map((q) => ({
          ...q,
          moduleNumber: m.moduleNumber,
          topicTitle: t.title,
        }))
      ),
      ...m.moduleAssessment.map((q) => ({
        ...q,
        moduleNumber: m.moduleNumber,
        topicTitle: 'Module Assessment',
      })),
    ]);
  }, [modules]);

  const handleOverrideStatus = (questionId: string, newStatus: ReviewStatus) => {
    const updated = {
      ...(progressState.questionReviewOverrides ?? {}),
      ...localOverrides,
      [questionId]: newStatus,
    };
    setLocalOverrides(updated);
    if (onImportProgressState) {
      onImportProgressState({
        ...progressState,
        questionReviewOverrides: updated,
        lastUpdatedAtIso: new Date().toISOString(),
      });
    }
  };

  const filteredQuestions = useMemo(() => {
    const term = queueSearch.trim().toLowerCase();
    return allQuestions.filter((q) => {
      const currentStatus = localOverrides[q.id] ?? q.reviewStatus;
      if (queueFilter !== 'all' && currentStatus !== queueFilter) return false;
      if (!term) return true;
      return (
        q.id.toLowerCase().includes(term) ||
        q.prompt.toLowerCase().includes(term) ||
        `module ${q.moduleNumber}`.toLowerCase().includes(term) ||
        q.topicTitle.toLowerCase().includes(term)
      );
    });
  }, [allQuestions, localOverrides, queueFilter, queueSearch]);

  const queueStats = useMemo(() => {
    let verified = 0;
    let draft = 0;
    for (const q of allQuestions) {
      const status = localOverrides[q.id] ?? q.reviewStatus;
      if (status === 'Verified') verified++;
      else draft++;
    }
    return {
      total: allQuestions.length,
      verified,
      draft,
      overridden: Object.keys(localOverrides).length,
    };
  }, [allQuestions, localOverrides]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const currentPage = Math.min(queuePage, totalPages);
  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  // Golden Solvers
  const goldenResults = useMemo(() => {
    return WORKED_EXAMPLE_GOLDEN_IDS.map((id) => solveWorkedExampleGolden(id));
  }, []);

  const goldenStats = useMemo(() => {
    const passed = goldenResults.filter((r) => r.independentCheckPassed).length;
    return {
      total: goldenResults.length,
      passed,
      allPassed: passed === goldenResults.length,
    };
  }, [goldenResults]);

  const handleExportJson = () => {
    const json = exportCourseProgressJson(progressState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StructTutor_Progress_Backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      setImportFeedback({
        ok: false,
        msg: 'Paste a JSON backup string or select a JSON file first.',
      });
      return;
    }
    const res = importCourseProgressJson(importJsonText, modules);
    if (!res.ok) {
      const errorMsg = 'error' in res ? res.error : 'Failed to parse JSON backup.';
      setImportFeedback({ ok: false, msg: errorMsg });
      return;
    }
    const state = 'state' in res ? res.state : null;
    if (!state) return;
    onImportProgressState(state);
    setLocalOverrides(state.questionReviewOverrides ?? {});
    setImportFeedback({
      ok: true,
      msg: `Restored progress backup (${state.attemptHistory.length} logged attempts + tutor session state).`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportJsonText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="max-w-[960px] mx-auto space-y-6"
      data-testid="settings-view"
    >
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-blue-600 dark:text-sky-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Workspace Settings &amp; Diagnostics
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Settings, Review Queue &amp; Solvers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Manage backup &amp; reset persistence, inspect and override question review
          statuses, and verify closed-form golden solver parity benchmarks.
        </p>

        {/* Tab Navigation System */}
        <div
          role="tablist"
          className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'backup'}
            data-testid="settings-tab-backup"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup &amp; Reset</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviewQueue'}
            data-testid="settings-tab-review-queue"
            onClick={() => setActiveTab('reviewQueue')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'reviewQueue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {queueStats.total}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'goldenSolvers'}
            data-testid="settings-tab-golden-solvers"
            onClick={() => setActiveTab('goldenSolvers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'goldenSolvers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Golden Solvers</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              {goldenStats.passed}/{goldenStats.total}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: BACKUP & RESET (EXISTING CONTENT) */}
      {activeTab === 'backup' && (
        <div className="space-y-6" data-testid="settings-backup-section">
          {/* Build & Storage Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-sky-400">
                Build &amp; Theme Configuration
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">Build Version</dt>
                  <dd
                    className="font-mono font-semibold text-slate-900 dark:text-white"
                    data-testid="settings-build-version"
                  >
                    v{APP_VERSION}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">Build Date</dt>
                  <dd
                    className="font-mono font-semibold text-slate-900 dark:text-white"
                    data-testid="settings-build-date"
                  >
                    {APP_BUILD_DATE}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Active Theme ({THEME_STORAGE_KEY})
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span
                      className="font-mono font-semibold text-slate-900 dark:text-white"
                      data-testid="settings-active-theme"
                    >
                      {hybridLightCards ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHybridLightCards((prev) => !prev)}
                      data-testid="settings-theme-toggle-btn"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {hybridLightCards ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>Toggle Theme</span>
                    </button>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                <Database className="w-3.5 h-3.5" />
                <span>Offline Persistence Keys</span>
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">localStorage Key</dt>
                  <dd
                    className="font-mono font-semibold text-blue-600 dark:text-sky-400"
                    data-testid="settings-localstorage-key"
                  >
                    {PROGRESS_STORAGE_KEY}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">
                    IndexedDB Database
                  </dt>
                  <dd
                    className="font-mono font-semibold text-emerald-600 dark:text-emerald-400"
                    data-testid="settings-idb-name"
                  >
                    {IDB_DB_NAME}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Last Saved Timestamp
                  </dt>
                  <dd className="font-mono text-slate-700 dark:text-slate-300">
                    {progressState.lastUpdatedAtIso}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Export / Import / Reset Controls */}
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Export or Reset Course Progress
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Download a full JSON snapshot of your module assessments, topic
                  scores, and guided tutor progress, or reset everything to 0%.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportJson}
                  data-testid="settings-export-json-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setImportJsonText(exportCourseProgressJson(progressState))
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <span>Load Current JSON into Editor</span>
                </button>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    data-testid="settings-reset-progress-btn"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Progress</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllProgress();
                        setConfirmReset(false);
                        setImportFeedback({
                          ok: true,
                          msg: 'All course progress has been reset to 0%.',
                        });
                      }}
                      data-testid="settings-confirm-reset-btn"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white cursor-pointer"
                    >
                      Confirm Reset to 0%
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Import JSON Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Import JSON Backup
                </h3>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  aria-label="Upload JSON backup file"
                  className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 dark:file:text-sky-300 cursor-pointer"
                />
              </div>

              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"schema": "StructTutorCourseProgressBackup", ...}'
                data-testid="settings-import-json-textarea"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleImportJson}
                  data-testid="settings-import-json-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                </button>

                {importFeedback && (
                  <span
                    data-testid="settings-import-feedback"
                    className={`text-xs font-semibold ${
                      importFeedback.ok
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {importFeedback.msg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW QUEUE */}
      {activeTab === 'reviewQueue' && (
        <div className="space-y-4" data-testid="settings-review-queue-section">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-mono uppercase text-slate-500">Total Questions</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {queueStats.total}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="text-[11px] font-mono uppercase text-emerald-700 dark:text-emerald-400">
                Verified
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                {queueStats.verified}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="text-[11px] font-mono uppercase text-amber-700 dark:text-amber-400">
                Draft
              </div>
              <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1">
                {queueStats.draft}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="text-[11px] font-mono uppercase text-blue-700 dark:text-blue-400">
                Active Overrides
              </div>
              <div className="text-xl font-bold font-mono text-blue-700 dark:text-sky-300 mt-1">
                {queueStats.overridden}
              </div>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by ID, prompt, or module..."
                value={queueSearch}
                onChange={(e) => {
                  setQueueSearch(e.target.value);
                  setQueuePage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                aria-label="Filter by review status"
                value={queueFilter}
                onChange={(e) => {
                  setQueueFilter(e.target.value as 'all' | 'Draft' | 'Verified');
                  setQueuePage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
              >
                <option value="all">All Statuses ({queueStats.total})</option>
                <option value="Verified">Verified Only ({queueStats.verified})</option>
                <option value="Draft">Draft Only ({queueStats.draft})</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing {filteredQuestions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)} of {filteredQuestions.length} questions
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-slate-700 dark:text-slate-300 px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setQueuePage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {pagedQuestions.map((q) => {
                const currentStatus = localOverrides[q.id] ?? q.reviewStatus;
                const isOverridden = Boolean(localOverrides[q.id]);
                return (
                  <div
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {q.id}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Mod {q.moduleNumber}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800">
                          {q.type}
                        </span>
                        {isOverridden && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Overridden
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                        {q.prompt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label htmlFor={`override-status-${q.id}`} className="sr-only">
                        Review status override for {q.id}
                      </label>
                      <select
                        id={`override-status-${q.id}`}
                        aria-label={`Override status for ${q.id}`}
                        value={currentStatus}
                        onChange={(e) =>
                          handleOverrideStatus(q.id, e.target.value as ReviewStatus)
                        }
                        className={`px-2.5 py-1.5 rounded-lg font-mono font-semibold text-xs border cursor-pointer focus:outline-none ${
                          currentStatus === 'Verified'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Verified">Verified</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleOverrideStatus(
                            q.id,
                            currentStatus === 'Verified' ? 'Draft' : 'Verified'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                        title="Toggle Draft / Verified"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOLDEN SOLVERS */}
      {activeTab === 'goldenSolvers' && (
        <div className="space-y-4" data-testid="settings-golden-solvers-section">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Deterministic Golden Solver Verification Suite</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Evaluates 17 canonical Python-parity worked examples against the 1D Beam Engine.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono ${
                  goldenStats.allPassed
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {goldenStats.passed} / {goldenStats.total} Benchmarks Passed
                </span>
              </span>
            </div>
          </div>

          {/* Grid of Golden Solvers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goldenResults.map((gr) => (
              <div
                key={gr.exampleId}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {gr.exampleId}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Module {gr.moduleNumber}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      gr.independentCheckPassed
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {gr.independentCheckPassed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Passed</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>Failed</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    Primary Answer:
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-sky-400">
                    {typeof gr.primaryAnswer === 'number'
                      ? Number(gr.primaryAnswer.toFixed(4)).toString()
                      : gr.primaryAnswer}{' '}
                    {gr.primaryUnit}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Engine Results Breakdown:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {Object.entries(gr.results).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-slate-500 dark:text-slate-400 truncate mr-1">
                          {key}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {typeof val === 'number'
                            ? Number(val.toFixed(4)).toString()
                            : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
