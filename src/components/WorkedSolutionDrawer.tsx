import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Lock, Unlock, X } from 'lucide-react';
import { QuestionSpec } from '../utils/tutorEngine';

interface WorkedSolutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionSpec;
  fullSolutionUnlocked: boolean;
  onUnlockFullSolution: () => void;
}

export const WorkedSolutionDrawer: React.FC<WorkedSolutionDrawerProps> = ({
  isOpen,
  onClose,
  question,
  fullSolutionUnlocked,
  onUnlockFullSolution,
}) => {
  const [mode, setMode] = useState<'parallel' | 'full'>('parallel');

  if (!isOpen) return null;

  const activeMode = mode === 'full' && fullSolutionUnlocked ? 'full' : mode;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Worked Solution and Parallel Example Drawer"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <BookOpen className="w-4 h-4" />
                <span>STEP-BY-STEP ENGINEERING DERIVATION</span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                {question.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close worked solution drawer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Tabs: Parallel Example vs Full Solution */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('parallel')}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'parallel'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Parallel Example (Same Method)
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'full'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {fullSolutionUnlocked ? (
                <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>Full Solution for This Question</span>
            </button>
          </div>

          {/* Tab 1: Parallel Example (Never Spoils Active Attempt) */}
          {activeMode === 'parallel' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 p-4 space-y-1.5">
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  {question.parallelExample.title}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {question.parallelExample.givenText}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Study this identical method with different numbers so you can still earn unassisted mastery on your active question.
                </p>
              </div>

              <div className="space-y-3">
                {question.parallelExample.steps.map((st) => (
                  <div
                    key={st.stepNum}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Step {st.stepNum}: {st.heading}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {st.unitCancelNote}
                      </span>
                    </div>
                    <div className="font-mono text-sm text-blue-700 dark:text-sky-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                      {st.formulaLatex}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
                      <span>Substitution: {st.substitution}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        → {st.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Verified Parallel Result:
                </span>
                <span className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">
                  {question.parallelExample.finalAnswer}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Full Solution for This Question */}
          {activeMode === 'full' && (
            <div className="space-y-4">
              {!fullSolutionUnlocked ? (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 space-y-3">
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Reveal Full Solution for Active Question?
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    Viewing the exact numerical solution before submitting will mark this step as{' '}
                    <strong>Assisted (Amber)</strong> rather than First-Try Mastered. If you want to solve it yourself first, use the{' '}
                    <strong>Parallel Example</strong> tab above.
                  </p>
                  <button
                    type="button"
                    onClick={onUnlockFullSolution}
                    className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Unlock Full Solution Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 p-3.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Full derivation unlocked with explicit (mm, N) unit cancellation.
                    </span>
                  </div>

                  {question.fullSolutionSteps.map((st) => (
                    <div
                      key={st.stepNum}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Step {st.stepNum}: {st.heading}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                          {st.unitCancelNote}
                        </span>
                      </div>
                      <div className="font-mono text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        {st.substitution}
                      </div>
                      <div className="text-right font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        = {st.result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            Return to Question
          </button>
        </div>
      </div>
    </div>
  );
};
