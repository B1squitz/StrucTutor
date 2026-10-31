import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  Copy,
  Check,
  Scale,
  BookOpen,
  Play,
  ShieldCheck,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  SyllabusModuleItem,
  ObjectiveItem,
  runSelfVerificationChecks,
  APP_VERSION,
  APP_BUILD_DATE,
} from '../utils/tutorEngine';
import { formatEngineeringNumber, solveWorkedExampleGolden, WORKED_EXAMPLE_GOLDEN_IDS } from '../utils/beamEngine';
import type { CourseProgressState, NormalizedSyllabusModule, ReviewStatus } from '../types/syllabus';
import { exportCourseProgressJson, importCourseProgressJson } from '../utils/assessmentEngine';

export interface CalculatorPopoverProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onCopyResultToInput?: (val: string) => void;
  onCopyToAnswer?: (val: string) => void;
}

export const CalculatorPopover: React.FC<CalculatorPopoverProps> = ({
  isOpen,
  open,
  onClose,
  onCopyResultToInput,
  onCopyToAnswer,
}) => {
  const visible = Boolean(isOpen ?? open);
  const [expr, setExpr] = useState('18 * 1e6 / (6.67e5)');
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  let evalResult: string = '-';
  let rawNumeric: string = '';
  try {
    const sanitized = expr.replace(/[^0-9+\-*/().eE^\s]/g, '').replace(/\^/g, '**');
    if (sanitized.trim()) {
      // Safe arithmetic evaluation of sanitized numeric expression
      const val = Function(`"use strict"; return (${sanitized});`)();
      if (typeof val === 'number' && Number.isFinite(val)) {
        evalResult = formatEngineeringNumber(val, 4);
        rawNumeric = Number(val.toPrecision(4)).toString();
      }
    }
  } catch {
    evalResult = 'Syntax';
  }

  const handleCopy = () => {
    if (!rawNumeric) return;
    onCopyResultToInput?.(rawNumeric);
    onCopyToAnswer?.(rawNumeric);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const presets = [
    { label: 'wL / 2 (R_A)', code: '4 * 6 / 2' },
    { label: 'wL² / 8 (M_max)', code: '4 * (6 ** 2) / 8' },
    { label: 'M / W_el (σ_max)', code: '(18 * 1e6) / (4e6 / 6)' },
    { label: '5wL⁴ / 384EI (δ)', code: '(5 * 4 * (6000 ** 4)) / (384 * 210000 * 8.1e7)' },
  ];

  return (
    <div
      className="fixed bottom-5 right-5 z-50 w-96 rounded-2xl border border-slate-700 bg-[#0F172A] p-4 shadow-2xl"
      role="dialog"
      aria-label="Engineering Scratchpad Calculator"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            SI Scratchpad Calculator
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close calculator"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Expression (supports +, -, *, /, ^, e6):
          </label>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono text-white focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setExpr(p.code)}
              className="rounded border border-slate-700/80 bg-slate-800/80 px-2 py-1 text-[11px] font-mono text-slate-300 hover:border-sky-500/40 hover:text-sky-300"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2.5">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Result (3–4 sig figs)</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{evalResult}</div>
          </div>
          <button
            type="button"
            disabled={!rawNumeric}
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Send to Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const UnitsReferenceDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const conversions = [
    { from: '1 kN', to: '1,000 N (10³ N)', note: 'Standard structural force to Newtons' },
    { from: '1 kN·m', to: '1,000,000 N·mm (10⁶ N·mm)', note: 'Crucial before dividing by W_el (mm³) or I (mm⁴)' },
    { from: '1 MPa', to: '1 N/mm² (identically equal)', note: 'Direct output when Force is in N and Length is in mm' },
    { from: '1 GPa', to: '1,000 MPa = 1,000 N/mm²', note: 'Structural steel E = 210 GPa = 210,000 N/mm²' },
    { from: '1 kN/m', to: '1 N/mm (identically equal)', note: 'Line load intensity for beam deflection 5wL⁴/(384EI)' },
    { from: '1 cm³', to: '1,000 mm³ (10³ mm³)', note: 'Blue Book section modulus W_el / W_pl conversion' },
    { from: '1 cm⁴', to: '10,000 mm⁴ (10⁴ mm⁴)', note: 'Blue Book second moment of area I_yy / I_zz conversion' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-[#0B1120] p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">SI Structural Units &amp; Sign Reference</h2>
              <p className="text-xs text-slate-400">Rule M: Strict SI metric consistency (N, mm, MPa, kN, m)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400">
            Essential Power-of-Ten Conversions
          </h3>
          {conversions.map((c) => (
            <div key={c.from} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-white">
                <span>{c.from}</span>
                <span className="text-emerald-400">≡ {c.to}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{c.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300">
            UK Structural Sign &amp; Plotting Conventions
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-200 list-disc pl-4">
            <li>Upward support reactions (+R_y) are positive.</li>
            <li>Sagging bending moment (+M) causes tension in the bottom fibre.</li>
            <li>Bending Moment Diagrams (BMDs) are plotted on the tension face of the member.</li>
            <li>Report final engineering values to 3 significant figures (e.g. W_el = 6.67 × 10⁵ mm³).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const SyllabusInspectorDrawer: React.FC<{
  moduleItem: SyllabusModuleItem | null;
  objectiveItem: ObjectiveItem | null;
  onClose: () => void;
  onStartTopic: () => void;
}> = ({ moduleItem, objectiveItem, onClose, onStartTopic }) => {
  if (!moduleItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-[#0B1120] p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-xs font-mono text-sky-400">{moduleItem.code}</span>
              <h2 className="text-base font-bold text-white">{moduleItem.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">{moduleItem.summary}</p>

        {objectiveItem && (
          <div className="mt-5 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
            <div className="text-xs font-mono text-sky-300">Selected Objective {objectiveItem.code}</div>
            <div className="mt-1 text-sm font-semibold text-white">{objectiveItem.title}</div>
            <p className="mt-1.5 text-xs text-slate-300">{objectiveItem.summary}</p>
            <div className="mt-3 rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-xs text-amber-300">
              {objectiveItem.formulaPreview}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              onStartTopic();
              onClose();
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
          >
            <Play className="w-4 h-4" />
            Open in Stepped Practice Coach
          </button>
        </div>
      </div>
    </div>
  );
};

export interface VerificationSelfTestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  progressState?: CourseProgressState;
  modules?: NormalizedSyllabusModule[];
  onImportProgressState?: (newState: CourseProgressState) => void;
  onUpdateQuestionReviewStatus?: (questionId: string, status: ReviewStatus, note?: string) => void;
}

export const VerificationSelfTestDrawer: React.FC<VerificationSelfTestDrawerProps> = ({
  isOpen,
  onClose,
  progressState,
  modules = [],
  onImportProgressState,
  onUpdateQuestionReviewStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'review-queue' | 'diagnostics'>('backup');
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReviewStatus>('ALL');

  const selfChecks = useMemo(() => runSelfVerificationChecks(), []);
  const goldenChecks = useMemo(
    () => WORKED_EXAMPLE_GOLDEN_IDS.map((id) => solveWorkedExampleGolden(id)),
    []
  );

  const allQuestions = useMemo(() => {
    const list: Array<{
      id: string;
      moduleCode: string;
      prompt: string;
      effectiveStatus: ReviewStatus;
      solverVerificationId?: string;
    }> = [];
    for (const mod of modules) {
      for (const top of mod.topics) {
        for (const q of top.assessmentQuestions) {
          const override = progressState?.questionReviewOverrides?.[q.id];
          list.push({
            id: q.id,
            moduleCode: mod.code,
            prompt: q.prompt,
            effectiveStatus: override ?? q.reviewStatus,
            solverVerificationId: q.solverVerificationId,
          });
        }
      }
      for (const q of mod.moduleAssessmentQuestions) {
        const override = progressState?.questionReviewOverrides?.[q.id];
        list.push({
          id: q.id,
          moduleCode: mod.code,
          prompt: q.prompt,
          effectiveStatus: override ?? q.reviewStatus,
          solverVerificationId: q.solverVerificationId,
        });
      }
    }
    return list;
  }, [modules, progressState?.questionReviewOverrides]);

  const filteredQuestions = useMemo(() => {
    return allQuestions
      .filter((q) => (statusFilter === 'ALL' ? true : q.effectiveStatus === statusFilter))
      .filter(
        (q) =>
          !searchQuery.trim() ||
          q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 40);
  }, [allQuestions, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    if (!progressState) return;
    const json = exportCourseProgressJson(progressState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StructTutor_Progress_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      setImportFeedback({ ok: false, msg: 'Paste a JSON backup string or upload a file first.' });
      return;
    }
    const res = importCourseProgressJson(importJsonText, modules);
    if (!res.ok) {
      setImportFeedback({ ok: false, msg: res.error });
      return;
    }
    onImportProgressState?.(res.state);
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
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Data Backup, Question Review Queue & Engine Diagnostics"
    >
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-[#0B1120] p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Data Backup, Question Review Queue &amp; Engine Verification
              </h2>
              <p className="text-xs text-slate-400">
                StructTutor v{APP_VERSION} ({APP_BUILD_DATE}) • Local-First Storage &amp; Golden Solver Audit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        {/* Sub-navigation */}
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'backup'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Backup &amp; Restore JSON (C8)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review-queue')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'review-queue'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Question Review Queue ({allQuestions.length} items)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'diagnostics'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Golden Mechanics Solvers ({goldenChecks.length})
          </button>
        </div>

        {activeTab === 'backup' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-white">Export Local Progress &amp; Tutor Session (JSON)</h3>
              <p className="mt-1 text-xs text-slate-400">
                Saves all 20 module exam records, 62 topic gate records, stepped tutor progress, and question review overrides into a portable JSON file (also mirrored in browser IndexedDB).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Progress Backup (.json)
                </button>
                {progressState && (
                  <button
                    type="button"
                    onClick={() => setImportJsonText(exportCourseProgressJson(progressState))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Preview Current JSON
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-white">Restore / Import Progress Backup (JSON)</h3>
              <p className="mt-1 text-xs text-slate-400">
                Upload a previously exported `.json` file or paste its contents below. Non-destructive schema migration preserves progress across syllabus revisions.
              </p>
              <div className="mt-2.5">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sky-300 hover:file:bg-slate-700"
                />
              </div>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"schema": "StructTutorCourseProgressBackup", ...}'
                className="mt-2.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
              <div className="mt-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-500"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Validate &amp; Restore Backup
                </button>
                {importFeedback && (
                  <span
                    className={`text-xs font-medium ${
                      importFeedback.ok ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {importFeedback.msg}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review-queue' && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by Question ID (e.g. MOD01-T1-Q1) or keyword..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ReviewStatus)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="ALL">All Statuses ({allQuestions.length})</option>
                <option value="Verified">
                  Solver-Verified ({allQuestions.filter((q) => q.effectiveStatus === 'Verified').length})
                </option>
                <option value="Draft">
                  Draft ({allQuestions.filter((q) => q.effectiveStatus === 'Draft').length})
                </option>
                <option value="Corrected">
                  Corrected ({allQuestions.filter((q) => q.effectiveStatus === 'Corrected').length})
                </option>
              </select>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/75 p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-sky-400">{q.id}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                          q.effectiveStatus === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {q.effectiveStatus}
                      </span>
                      {q.solverVerificationId && (
                        <span className="text-[10px] font-mono text-slate-400">
                          [{q.solverVerificationId}]
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-300 line-clamp-2">{q.prompt}</p>
                  </div>
                  <select
                    value={q.effectiveStatus}
                    onChange={(e) =>
                      onUpdateQuestionReviewStatus?.(q.id, e.target.value as ReviewStatus)
                    }
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200"
                    aria-label={`Review status for ${q.id}`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Corrected">Corrected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400">
                Core Grader &amp; Unit Engine Invariants
              </h3>
              {selfChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{chk.label}</div>
                    <div className="text-[11px] text-slate-400">{chk.detail}</div>
                  </div>
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Python Mechanics Golden Parity Suite (17 Worked Examples)
              </h3>
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {goldenChecks.map((g) => (
                  <div
                    key={g.exampleId}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-semibold text-sky-300">{g.exampleId}</span>{' '}
                      <span className="text-slate-300">Module {g.moduleNumber} ({formatEngineeringNumber(g.primaryAnswer)} {g.primaryUnit})</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {Object.entries(g.results)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}=${formatEngineeringNumber(v)}`)
                        .join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
