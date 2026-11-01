import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  Layers,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type {
  AssessmentQuestion,
  AssessmentSubmissionResult,
  NormalizedSyllabusModule,
  ReviewStatus,
  SyllabusTopic,
} from '../types/syllabus';
import {
  evaluateAssessmentSubmission,
  formatAssessmentPercentage,
  shuffleMcqOptionsWithSeed,
} from '../utils/assessmentEngine';
import { generateParametricQuestionVariants } from '../utils/questionGenerators';
import { QuestionChat } from './QuestionChat';

export interface AssessmentViewProps {
  module: NormalizedSyllabusModule;
  topic?: SyllabusTopic;
  questions: AssessmentQuestion[];
  previousBestScorePercent: number | null;
  previousPassed: boolean;
  previousAttemptsCount: number;
  questionReviewOverrides?: Record<string, ReviewStatus>;
  onCompleteAttempt: (result: AssessmentSubmissionResult) => void;
  onBackToModule: () => void;
}

const COMPATIBLE_UNITS_MAP: Record<string, string[]> = {
  kN: ['kN', 'N', 'MN'],
  N: ['N', 'kN', 'MN'],
  'kN·m': ['kN·m', 'kNm', 'N·mm', 'N·m'],
  kNm: ['kNm', 'kN·m', 'N·mm', 'N·m'],
  'N/mm²': ['N/mm²', 'MPa', 'GPa', 'kPa'],
  MPa: ['MPa', 'N/mm²', 'GPa', 'kPa'],
  kPa: ['kPa', 'MPa', 'N/mm²', 'kN/m²'],
  'kN/m²': ['kN/m²', 'kPa', 'MPa'],
  'kN/m': ['kN/m', 'N/mm', 'N/m'],
  mm: ['mm', 'm', 'cm'],
  m: ['m', 'mm', 'cm'],
  'mm²': ['mm²', 'cm²', 'm²'],
  'cm³': ['cm³', 'mm³', '10³ mm³'],
  'cm⁴': ['cm⁴', '10⁶ mm⁴', 'mm⁴'],
};

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  module,
  topic,
  questions,
  previousBestScorePercent,
  previousPassed,
  previousAttemptsCount,
  questionReviewOverrides = {},
  onCompleteAttempt,
  onBackToModule,
}) => {
  const [attemptSeed, setAttemptSeed] = useState<string>(
    () => `seed-${module.moduleNumber}-${topic?.id ?? 'exam'}-${Date.now()}`
  );
  const [includeParametricVariants, setIncludeParametricVariants] =
    useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>(
    {}
  );
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [submissionResult, setSubmissionResult] =
    useState<AssessmentSubmissionResult | null>(null);

  const activeQuestions = useMemo(() => {
    if (!includeParametricVariants) return questions;
    const numericSeed =
      attemptSeed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 42;
    const extra = generateParametricQuestionVariants(
      module.moduleNumber,
      numericSeed,
      2
    );
    return [...questions, ...extra];
  }, [questions, includeParametricVariants, module.moduleNumber, attemptSeed]);

  // Precompute deterministic shuffled options per MCQ for the current attemptSeed (N1)
  const shuffledMcqMap = useMemo(() => {
    const map: Record<
      string,
      ReturnType<typeof shuffleMcqOptionsWithSeed>
    > = {};
    for (const q of activeQuestions) {
      if (q.type === 'mcq') {
        map[q.id] = shuffleMcqOptionsWithSeed(q, attemptSeed);
      }
    }
    return map;
  }, [activeQuestions, attemptSeed]);

  const assessmentId = topic
    ? `TOPIC-${topic.id}`
    : `MODULE-${module.id}`;

  const title = topic
    ? `Topic ${topic.code} Assessment: ${topic.title}`
    : `Module ${module.moduleNumber} End-of-Module Exam: ${module.shortTitle}`;

  const subtitle = topic
    ? `${module.title} • ${activeQuestions.length} Questions • 90% Pass Standard`
    : `Comprehensive 20-Question Syllabus Gate Assessment • 90% Pass Standard (18/20 Required)`;

  const answeredCount = activeQuestions.filter(
    (q) =>
      userAnswers[q.id] !== undefined &&
      String(userAnswers[q.id]).trim() !== ''
  ).length;

  const draftCount = useMemo(
    () =>
      activeQuestions.filter(
        (q) => (questionReviewOverrides[q.id] ?? q.reviewStatus) === 'Draft'
      ).length,
    [activeQuestions, questionReviewOverrides]
  );
  const allDraft =
    activeQuestions.length > 0 && draftCount === activeQuestions.length;

  const handleSelectAnswer = (questionId: string, value: string | number) => {
    if (submissionResult) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const questionRenderGroups = useMemo(() => {
    const familyCounts: Record<string, number> = {};
    for (const q of activeQuestions) {
      if (q.caseFamilyId && q.caseFamilyId.trim()) {
        familyCounts[q.caseFamilyId] = (familyCounts[q.caseFamilyId] || 0) + 1;
      }
    }

    const groups: {
      type: 'scenario' | 'single';
      caseFamilyId?: string;
      items: {
        question: AssessmentQuestion;
        globalIndex: number;
        partLetter: string;
      }[];
    }[] = [];

    let currentGroup: (typeof groups)[0] | null = null;

    activeQuestions.forEach((q, idx) => {
      const isSharedFamily = Boolean(
        q.caseFamilyId &&
          q.caseFamilyId.trim() &&
          familyCounts[q.caseFamilyId] > 1
      );

      if (isSharedFamily) {
        if (
          currentGroup &&
          currentGroup.type === 'scenario' &&
          currentGroup.caseFamilyId === q.caseFamilyId
        ) {
          const partIndex = currentGroup.items.length;
          currentGroup.items.push({
            question: q,
            globalIndex: idx,
            partLetter: String.fromCharCode(65 + (partIndex % 26)),
          });
        } else {
          currentGroup = {
            type: 'scenario',
            caseFamilyId: q.caseFamilyId,
            items: [
              {
                question: q,
                globalIndex: idx,
                partLetter: 'A',
              },
            ],
          };
          groups.push(currentGroup);
        }
      } else {
        currentGroup = null;
        groups.push({
          type: 'single',
          items: [
            {
              question: q,
              globalIndex: idx,
              partLetter: '',
            },
          ],
        });
      }
    });

    return groups;
  }, [activeQuestions]);

  const handleSubmitAssessment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const evaluated = evaluateAssessmentSubmission(
      assessmentId,
      activeQuestions,
      userAnswers,
      {
        attemptSeed,
        selectedUnits,
        answerUsesShuffledIndex: true,
      }
    );
    setSubmissionResult(evaluated);
    onCompleteAttempt(evaluated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeNewAttempt = () => {
    setAttemptSeed(
      `seed-${module.moduleNumber}-${topic?.id ?? 'exam'}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`
    );
    setUserAnswers({});
    setSelectedUnits({});
    setRevealedHints({});
    setSubmissionResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut: Ctrl+Enter to submit when not yet submitted (A11)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !submissionResult) {
        e.preventDefault();
        handleSubmitAssessment();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const renderQuestionCard = (
    q: AssessmentQuestion,
    qIdx: number,
    partLetter?: string
  ) => {
    const outcome = submissionResult?.questionOutcomes[q.id];
    const shuffled = q.type === 'mcq' ? shuffledMcqMap[q.id] : undefined;
    const displayOptions = shuffled?.options ?? q.options ?? [];
    const effectiveReviewStatus: ReviewStatus =
      questionReviewOverrides[q.id] ?? q.reviewStatus;
    const hintCount = revealedHints[q.id] ?? 0;
    const compatibleUnits =
      q.unit && COMPATIBLE_UNITS_MAP[q.unit]
        ? COMPATIBLE_UNITS_MAP[q.unit]
        : q.unit
        ? [q.unit]
        : [];
    const currentUnit = selectedUnits[q.id] ?? q.unit ?? '';

    return (
      <div
        key={q.id}
        data-testid={`assessment-question-card-${q.id}`}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
      >
        {/* Question Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {partLetter && (
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-2xs">
                Part {partLetter}
              </span>
            )}
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              Q{qIdx + 1} of {activeQuestions.length}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300">
              {q.type === 'numeric'
                ? 'Numeric Hand Calculation'
                : 'Conceptual & Analytical MCQ'}
            </span>
            {/* Honest Verification Badge (N5) */}
            <span
              title={q.reviewNotice}
              className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${
                effectiveReviewStatus === 'Verified'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              }`}
            >
              {effectiveReviewStatus === 'Verified'
                ? 'Solver Verified'
                : effectiveReviewStatus}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ID: {q.id}
          </span>
        </div>

        {/* Objective & Citation */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
            <span>
              <strong>{partLetter ? `Part ${partLetter} Objective:` : 'Objective:'}</strong> {q.learningObjective}
            </span>
          </div>
          {q.citation && (
            <span
              data-testid={`assessment-citation-${q.id}`}
              className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
            >
              Ref:{' '}
              {typeof q.citation === 'string'
                ? q.citation
                : q.citation.formatted ||
                  `${q.citation.sourceTitle} (${q.citation.clauseOrSection}, ${q.citation.pageReference})`}
            </span>
          )}
        </div>

        {/* Prompt */}
        <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          {q.prompt}
        </p>

        {q.imageUrl && (
          <img
            src={q.imageUrl}
            alt={q.prompt || 'Question extract'}
            className="max-w-full h-auto rounded-xl my-4 border border-slate-200 dark:border-slate-800"
          />
        )}

        {/* Assumptions & Limitations */}
        {q.assumptions &&
          (Array.isArray(q.assumptions)
            ? q.assumptions.length > 0
            : Boolean(q.assumptions)) && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">
                  Assumptions &amp; Idealisation:{' '}
                </strong>
                {Array.isArray(q.assumptions)
                  ? q.assumptions.join('; ')
                  : q.assumptions}
              </div>
            </div>
          )}

        {/* Progressive Hints (N6) */}
        {q.hints && q.hints.length > 0 && !submissionResult && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                setRevealedHints((prev) => ({
                  ...prev,
                  [q.id]: Math.min(q.hints.length, (prev[q.id] ?? 0) + 1),
                }))
              }
              disabled={hintCount >= q.hints.length}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100 disabled:opacity-50 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {hintCount === 0
                  ? `Show Hint (1/${q.hints.length})`
                  : hintCount < q.hints.length
                  ? `Show Next Hint (${hintCount + 1}/${q.hints.length})`
                  : `All Hints Shown (${q.hints.length}/${q.hints.length})`}
              </span>
            </button>
            {hintCount > 0 && (
              <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {q.hints.slice(0, hintCount).map((h, i) => (
                  <div key={i}>
                    <strong>Hint {i + 1}:</strong>{' '}
                    {h.replace(/^(?:First|Second) Hint\s*/i, '')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Answer Input Area */}
        {q.type === 'numeric' ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label
              htmlFor={`input-${q.id}`}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Numerical Value:
            </label>
            <input
              id={`input-${q.id}`}
              type="text"
              inputMode="decimal"
              disabled={Boolean(submissionResult)}
              value={userAnswers[q.id] ?? ''}
              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
              placeholder={`Enter value in ${currentUnit || 'SI units'}`}
              data-testid={`assessment-input-${q.id}`}
              className="w-48 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
            />
            {compatibleUnits.length > 1 ? (
              <select
                aria-label={`Select unit for ${q.id}`}
                disabled={Boolean(submissionResult)}
                value={currentUnit}
                onChange={(e) =>
                  setSelectedUnits((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-semibold text-slate-900 dark:text-white"
              >
                {compatibleUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            ) : (
              q.unit && (
                <span className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {q.unit}
                </span>
              )
            )}
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={`Multiple choice options for question ${q.id}`}
            className="space-y-2 pt-1"
          >
            {displayOptions.map((optText, optIdx) => {
              const isSelected = Number(userAnswers[q.id]) === optIdx;
              const isCorrectOpt =
                submissionResult &&
                shuffled &&
                optIdx === shuffled.correctOptionIndex;

              let optionStyle =
                'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70';
              if (submissionResult) {
                if (isCorrectOpt) {
                  optionStyle =
                    'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/50 text-emerald-950 dark:text-emerald-100 font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle =
                    'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-500/50 text-rose-950 dark:text-rose-100';
                }
              } else if (isSelected) {
                optionStyle =
                  'bg-blue-50 dark:bg-sky-500/20 border-blue-500 dark:border-sky-400 text-blue-950 dark:text-white font-semibold';
              }

              return (
                <label
                  key={optIdx}
                  data-testid={`assessment-mcq-option-${q.id}-${optIdx}`}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer ${optionStyle}`}
                >
                  <input
                    type="radio"
                    name={`mcq-${q.id}`}
                    disabled={Boolean(submissionResult)}
                    checked={isSelected}
                    onChange={() => handleSelectAnswer(q.id, optIdx)}
                    className="mt-1 accent-blue-600"
                  />
                  <span className="leading-relaxed">
                    <strong className="font-mono mr-1.5">
                      {String.fromCharCode(65 + optIdx)}.
                    </strong>
                    {optText}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {/* Graded Explanation & Diagnostic Box */}
        {submissionResult && outcome && (
          <div
            className={`rounded-xl border p-4 text-xs sm:text-sm space-y-2 ${
              outcome.isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2 font-bold">
              <span className="inline-flex items-center gap-1.5">
                {outcome.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>
                  {outcome.isCorrect
                    ? 'Correct'
                    : `Incorrect - Expected: ${outcome.expectedDisplay}`}
                </span>
              </span>
            </div>
            {outcome.unitDiagnostic && (
              <p className="font-mono text-xs text-amber-800 dark:text-amber-300">
                Unit Diagnostic: {outcome.unitDiagnostic}
              </p>
            )}
            <p className="leading-relaxed text-slate-700 dark:text-slate-200">
              <strong>Worked Explanation:</strong> {outcome.explanation}
            </p>
          </div>
        )}

        {/* Inline Per-Question AI Tutor Chat */}
        <QuestionChat
          question={q}
          userDraft={
            q.type === 'numeric'
              ? (userAnswers[q.id] ? `${userAnswers[q.id]} ${currentUnit || q.unit || ''}`.trim() : undefined)
              : (userAnswers[q.id] !== undefined && displayOptions[Number(userAnswers[q.id])]
                  ? displayOptions[Number(userAnswers[q.id])]
                  : undefined)
          }
          revealedHints={q.hints ? q.hints.slice(0, revealedHints[q.id] ?? 0) : []}
          solutionUnlocked={Boolean(submissionResult)}
        />
      </div>
    );
  };

  return (
    <div
      className="max-w-[1000px] mx-auto space-y-6"
      data-testid="assessment-view"
    >
      {/* Top Assessment Header Card */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToModule}
            data-testid="assessment-back-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Module {module.moduleNumber}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIncludeParametricVariants((prev) => !prev);
                setSubmissionResult(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                includeParametricVariants
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>
                {includeParametricVariants
                  ? 'Parametric Generator Active (+2 Qs)'
                  : '+ Add Parametric Practice Variants'}
              </span>
            </button>

            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
              Pass Gate: 90% ({Math.ceil(activeQuestions.length * 0.9)}/
              {activeQuestions.length} Correct)
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs">
              <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Previous Best ({previousAttemptsCount} attempts)
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {previousBestScorePercent !== null
                  ? `${previousBestScorePercent.toFixed(0)}%`
                  : '0%'}{' '}
                {previousPassed && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ✓ PASSED
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/80 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 px-3.5 py-2 text-xs">
              <div className="text-[10px] font-mono uppercase text-blue-600 dark:text-sky-400">
                Answered
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {answeredCount} / {activeQuestions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Warning Banner */}
      {draftCount > 0 && (
        <div
          data-testid="assessment-draft-warning-banner"
          className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 p-4 flex items-center gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-200"
        >
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">
            {draftCount} of {activeQuestions.length} questions are Draft — results are practice feedback, not a pass gate.
          </span>
        </div>
      )}

      {/* Submission Result Banner */}
      {submissionResult && (
        <div
          data-testid="assessment-result-banner"
          className={`rounded-2xl border p-6 shadow-sm ${
            allDraft
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-100'
              : submissionResult.passed
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-xl text-white shrink-0 ${
                  allDraft
                    ? 'bg-amber-600'
                    : submissionResult.passed
                    ? 'bg-emerald-600'
                    : 'bg-rose-600'
                }`}
              >
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold uppercase tracking-wider">
                  {allDraft
                    ? 'Practice feedback only — no pass gate applied.'
                    : submissionResult.passed
                    ? 'ASSESSMENT PASSED (≥ 90% THRESHOLD MET)'
                    : 'NOT YET PASSED (90% REQUIRED TO PASS GATE)'}
                </div>
                <h2 className="font-display text-2xl font-bold">
                  Score:{' '}
                  {formatAssessmentPercentage(
                    submissionResult.correctCount,
                    submissionResult.totalQuestions
                  )}{' '}
                  ({submissionResult.correctCount} /{' '}
                  {submissionResult.totalQuestions} Correct)
                </h2>
                <p className="text-xs sm:text-sm opacity-90">
                  {allDraft
                    ? 'Practice feedback only — no pass gate applied.'
                    : submissionResult.passed
                    ? 'This syllabus gate has been recorded as Passed in your local course profile.'
                    : 'Review the detailed first-principles explanations and unit diagnostics below, then click Retake Assessment for a freshly shuffled attempt.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRetakeNewAttempt}
                data-testid="assessment-retake-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Assessment (Reshuffle Options)</span>
              </button>
              <button
                type="button"
                onClick={onBackToModule}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                <span>Return to Learning Map</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <form onSubmit={handleSubmitAssessment} className="space-y-6">
        {questionRenderGroups.map((group, groupIdx) => {
          if (group.type === 'single') {
            const item = group.items[0];
            return renderQuestionCard(item.question, item.globalIndex);
          }

          const firstQ = group.items[0].question;

          return (
            <div
              key={`case-family-${group.caseFamilyId}-${groupIdx}`}
              data-testid={`design-brief-group-${group.caseFamilyId}`}
              className="border-2 border-blue-200 dark:border-sky-800/70 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-7 shadow-xs space-y-6"
            >
              {/* Single "Design Brief" Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                        Multi-Step Design Scenario
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-100 dark:bg-sky-950 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800/50">
                        {group.caseFamilyId}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      Design Brief
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {group.items.length} Calculation Steps (Parts A–
                  {String.fromCharCode(64 + group.items.length)})
                </span>
              </div>

              {/* Larger text box for the "Scenario Brief" */}
              <div
                data-testid={`scenario-brief-${group.caseFamilyId}`}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-sky-800/80 p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-800 dark:text-sky-300">
                      Scenario Brief
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    Primary Design Context
                  </span>
                </div>
                <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {firstQ.prompt}
                </p>
                {firstQ.imageUrl && (
                  <img
                    src={firstQ.imageUrl}
                    alt={firstQ.prompt || 'Design scenario illustration'}
                    className="max-w-full h-auto rounded-xl my-4 border border-slate-200 dark:border-slate-800"
                  />
                )}
                {firstQ.assumptions &&
                  (Array.isArray(firstQ.assumptions)
                    ? firstQ.assumptions.length > 0
                    : Boolean(firstQ.assumptions)) && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">
                          Design Assumptions &amp; Idealisation:{' '}
                        </strong>
                        {Array.isArray(firstQ.assumptions)
                          ? firstQ.assumptions.join('; ')
                          : firstQ.assumptions}
                      </div>
                    </div>
                  )}
              </div>

              {/* Individual Calculation Steps / Sub-parts */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Individual Calculation Steps
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                {group.items.map(({ question: q, globalIndex: qIdx, partLetter }) =>
                  renderQuestionCard(q, qIdx, partLetter)
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Footer */}
        {!submissionResult && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Answered <strong>{answeredCount}</strong> of{' '}
              <strong>{activeQuestions.length}</strong> questions • Pass
              Threshold: <strong>90%</strong>
            </div>
            <button
              type="submit"
              data-testid="assessment-submit-btn"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              Submit Assessment &amp; Grade Against 90% Standard
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
