import React, { useState } from 'react';
import {
  X,
  Calculator,
  Copy,
  Check,
  Scale,
  BookOpen,
  Play,
} from 'lucide-react';
import {
  SyllabusModuleItem,
  ObjectiveItem,
} from '../utils/tutorEngine';
import { formatEngineeringNumber } from '../utils/beamEngine';

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
