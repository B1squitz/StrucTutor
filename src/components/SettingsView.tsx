import React, { useState } from 'react';
import {
  Database,
  Download,
  Moon,
  RotateCcw,
  Settings,
  Sun,
  Upload,
} from 'lucide-react';
import type {
  CourseProgressState,
  NormalizedSyllabusModule,
} from '../types/syllabus';
import { APP_BUILD_DATE, APP_VERSION } from '../utils/tutorEngine';
import {
  exportCourseProgressJson,
  IDB_DB_NAME,
  importCourseProgressJson,
  PROGRESS_STORAGE_KEY,
} from '../utils/assessmentEngine';
import { THEME_STORAGE_KEY } from '../hooks/useStructTutorWorkspace';

export interface SettingsViewProps {
  progressState: CourseProgressState;
  modules: NormalizedSyllabusModule[];
  hybridLightCards: boolean;
  setHybridLightCards: React.Dispatch<React.SetStateAction<boolean>>;
  onImportProgressState: (newState: CourseProgressState) => void;
  onResetAllProgress: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  progressState,
  modules,
  hybridLightCards,
  setHybridLightCards,
  onImportProgressState,
  onResetAllProgress,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

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
      setImportFeedback({ ok: false, msg: res.error });
      return;
    }
    onImportProgressState(res.state);
    setImportFeedback({
      ok: true,
      msg: `Restored progress backup (${res.state.attemptHistory.length} logged attempts + tutor session state).`,
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
            Workspace Settings &amp; Local Storage Management
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Settings, Data Backup &amp; Storage Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Manage your appearance theme, inspect local persistence keys, export or
          import portable JSON backups, or reset all course progress to 0%.
        </p>
      </div>

      {/* Build & Storage Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-sky-400">
            Build &amp; Theme Configuration
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">
                Build Version
              </dt>
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
              <dt className="text-slate-500 dark:text-slate-400">
                localStorage Key
              </dt>
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
  );
};
