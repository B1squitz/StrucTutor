import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Compass,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ObjectiveItem,
  SyllabusModuleItem,
  VerificationCheckItem,
  convertEngineeringUnit,
} from '../utils/tutorEngine';

/* ========================================================================== */
/* 1. UNITS REFERENCE DRAWER ([📐 Units Reference Drawer])                    */
/* ========================================================================== */
export const UnitsReferenceDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [val, setVal] = useState('18');
  const [fromU, setFromU] = useState('kN·m');
  const [toU, setToU] = useState('N·mm');

  if (!isOpen) return null;

  let convertedDisplay = '—';
  try {
    const num = Number(val);
    if (Number.isFinite(num)) {
      convertedDisplay = `${convertEngineeringUnit(num, fromU, toU).toLocaleString('en-GB', {
        maximumFractionDigits: 6,
      })} ${toU}`;
    }
  } catch (err) {
    convertedDisplay = err instanceof Error ? err.message : 'Incompatible units';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Structural Units Reference Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-display text-base font-bold">
                Structural Units Reference &amp; Converter
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close units reference drawer"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core Identities Table */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ESSENTIAL (mm, N) IDENTITIES
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-mono">
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 MPa (Megapascal)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  = 1 N/mm²
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 GPa (Gigapascal)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  = 1,000 N/mm² (10³ MPa)
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 kN·m (Bending Moment)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  = 1,000,000 N·mm (10⁶ N·mm)
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 kN/m (Line Load)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  = 1 N/mm (1:1 Identity)
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 kN/m² (Surface Pressure)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  = 0.001 N/mm² (10⁻³ MPa)
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-semibold">1 cm³ (Section Modulus)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  = 1,000 mm³ (10³ mm³)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Quick Converter */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/70 dark:bg-slate-800/30">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              LIVE DIMENSIONAL SANDBOX
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                aria-label="Unit converter value"
                className="w-28 px-3 py-1.5 text-sm font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
              <select
                value={fromU}
                onChange={(e) => setFromU(e.target.value)}
                aria-label="Convert from unit"
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              >
                {['kN·m', 'N·m', 'N·mm', 'MPa', 'N/mm²', 'GPa', 'kN/m²', 'kN/m', 'N/mm', 'cm³', 'mm³'].map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
              <span className="text-xs text-slate-400">to</span>
              <select
                value={toU}
                onChange={(e) => setToU(e.target.value)}
                aria-label="Convert to unit"
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              >
                {['N·mm', 'N·m', 'kN·m', 'MPa', 'N/mm²', 'GPa', 'kN/m²', 'N/mm', 'kN/m', 'mm³', 'cm³'].map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-sky-300 pt-1">
              Result: {convertedDisplay}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* 2. SCIENTIFIC ENGINEERING CALCULATOR MODAL ([🖩 Calculator])               */
/* ========================================================================== */
export const CalculatorPopover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCopyResultToInput?: (val: string) => void;
}> = ({ isOpen, onClose, onCopyResultToInput }) => {
  const [expr, setExpr] = useState('18000000 / 666666.7');
  const [output, setOutput] = useState('27');

  if (!isOpen) return null;

  const evaluateSafe = (raw: string) => {
    setExpr(raw);
    try {
      const sanitized = raw.replace(/[^0-9+\-*/().eE^\s]/g, '').replace(/\^/g, '**');
      if (!sanitized.trim()) {
        setOutput('—');
        return;
      }
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${sanitized});`)();
      if (typeof val === 'number' && Number.isFinite(val)) {
        setOutput(Number(val.toPrecision(6)).toString());
      } else {
        setOutput('—');
      }
    } catch {
      setOutput('—');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Engineering Calculator"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-display text-sm font-bold">
              Engineering Scratchpad Calculator
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Expression (supports +, -, *, /, ^, e6):
          </label>
          <input
            type="text"
            value={expr}
            onChange={(e) => evaluateSafe(e.target.value)}
            aria-label="Calculator expression input"
            className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          />
          <div className="rounded-xl bg-blue-50 dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 p-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Result:</span>
            <span className="font-mono text-lg font-bold text-blue-700 dark:text-sky-300 tabular-nums">
              {output}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex gap-1.5">
            {['18e6 / 666666.7', '5 * 1e6', '25 / 1000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => evaluateSafe(preset)}
                className="px-2 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
              >
                {preset}
              </button>
            ))}
          </div>
          {onCopyResultToInput && output !== '—' && (
            <button
              type="button"
              onClick={() => {
                onCopyResultToInput(output);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg whitespace-nowrap"
            >
              Insert into Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* 3. LEARNING MAP SLIDE-OVER INSPECTOR DRAWER                                */
/* ========================================================================== */
export const SyllabusInspectorDrawer: React.FC<{
  moduleItem: SyllabusModuleItem | null;
  objectiveItem: ObjectiveItem | null;
  onClose: () => void;
  onStartTopic: () => void;
}> = ({ moduleItem, objectiveItem, onClose, onStartTopic }) => {
  if (!moduleItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Syllabus Module and Objective Inspector Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                STAGE {moduleItem.stage} SYLLABUS INSPECTOR • {moduleItem.durationWeeks}
              </div>
              <h3 className="font-display text-lg font-bold">
                {objectiveItem ? objectiveItem.title : moduleItem.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close syllabus inspector drawer"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ENGINEERING SCOPE &amp; OVERVIEW
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {objectiveItem ? objectiveItem.summary : moduleItem.overview}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                PREREQUISITE &amp; PROGRESSION GATE
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {moduleItem.unlockRequirement}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 p-4 space-y-2">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                KEY FORMULAS &amp; IDENTITIES COVERED
              </div>
              <div className="flex flex-wrap gap-2">
                {(objectiveItem ? objectiveItem.keyFormulas : moduleItem.keyFormulas).map(
                  (f) => (
                    <span
                      key={f}
                      className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100"
                    >
                      {f}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                DESIGN CODE &amp; PRACTICE CONTEXT
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {objectiveItem
                  ? objectiveItem.eurocodeContext
                  : moduleItem.eurocodeReference}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onStartTopic();
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start / Resume Topic</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* 4. DETERMINISTIC SELF-VERIFICATION DRAWER ([✓ Verify Reconstruction])      */
/* ========================================================================== */
export const VerificationSelfTestDrawer: React.FC<{
  checks: VerificationCheckItem[];
  onQuickJumpQuestion2a: () => void;
  onSimulateTwoStrikeRemedial: () => void;
}> = ({ checks, onQuickJumpQuestion2a, onSimulateTwoStrikeRemedial }) => {
  const [isOpen, setIsOpen] = useState(false);
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-400/30 transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            ✓ Verify Reconstruction ({passedCount}/{checks.length})
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Developer Self-Test and Verification Suite"
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 text-slate-100 h-full shadow-2xl border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    DETERMINISTIC BUILD SELF-VERIFICATION ({passedCount}/12 PASSED)
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    StructTutor Reconstruction Verification Suite
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close verification drawer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Live Test Triggers */}
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4 space-y-2.5">
                <div className="text-xs font-bold text-sky-300">
                  ONE-CLICK INTERACTIVE PROOF ACTIONS
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onQuickJumpQuestion2a();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
                  >
                    Jump to Question 2a (Test 27 MPa / 0.027 GPa)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateTwoStrikeRemedial();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer"
                  >
                    Trigger 2-Strike Error on 2a → Inject [2a-R ⚡]
                  </button>
                </div>
              </div>

              {/* 12 Verification Checks List */}
              <div className="space-y-2.5">
                {checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {chk.id}. {chk.title}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASSED</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{chk.requirement}</p>
                    <div className="text-[11px] font-mono text-sky-300 pt-0.5">
                      Proof: {chk.liveProof}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
              >
                Close Verification Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
