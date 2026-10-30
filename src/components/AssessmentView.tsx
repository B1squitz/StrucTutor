import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Award,
  ShieldAlert,
  BookOpen,
  Info,
  CheckSquare,
} from 'lucide-react';
import {
  AssessmentQuestion,
  AssessmentSubmissionResult,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from '../types/syllabus';
import {
  evaluateAssessmentSubmission,
  formatAssessmentPercentage,
} from '../utils/assessmentEngine';

interface AssessmentViewProps {
  module: NormalizedSyllabusModule;
  topic?: SyllabusTopic; // undefined when taking the End-of-Module assessment
  questions: AssessmentQuestion[];
  previousBestScorePercent: number | null;
  previousPassed: boolean;
  previousAttemptsCount: number;
  onCompleteAttempt: (result: AssessmentSubmissionResult) => void;
  onBackToModule: () => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  module,
  topic,
  questions,
  previousBestScorePercent,
  previousPassed,
  previousAttemptsCount,
  onCompleteAttempt,
  onBackToModule,
}) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submissionResult, setSubmissionResult] =
    useState<AssessmentSubmissionResult | null>(null);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);

  const isTopicAssessment = Boolean(topic);
  const assessmentId = topic ? `TOPIC-${topic.id}` : `MODULE-${module.id}`;
  const assessmentTitle = topic
    ? `Topic ${topic.code} Assessment: ${topic.title}`
    : `Module ${module.moduleNumber} End-of-Module Assessment: ${module.title}`;

  const answeredCount = questions.filter((q) => {
    const val = answers[q.id];
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return true;
  }).length;

  const minRequiredCorrect = Math.ceil(questions.length * 0.9);

  const handleAnswerChange = (questionId: string, value: string | number) => {
    if (submissionResult) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setShowUnansweredConfirm(false);
  };

  const executeSubmit = () => {
    const result = evaluateAssessmentSubmission(
      assessmentId,
      questions,
      answers
    );
    setSubmissionResult(result);
    setShowUnansweredConfirm(false);
    onCompleteAttempt(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrySubmit = () => {
    if (answeredCount < questions.length && !showUnansweredConfirm) {
      setShowUnansweredConfirm(true);
      return;
    }
    executeSubmit();
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmissionResult(null);
    setShowUnansweredConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[920px] mx-auto space-y-6">
      {/* Top Assessment Header Card */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToModule}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Module {module.moduleNumber}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
              {isTopicAssessment
                ? 'End-of-Topic Assessment'
                : 'End-of-Module Assessment'}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              Pass Mark: 90% ({minRequiredCorrect}/{questions.length} Correct)
            </span>
            {previousAttemptsCount > 0 && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  previousPassed
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Previous Best:{' '}
                {previousBestScorePercent !== null
                  ? `${previousBestScorePercent.toFixed(1)}%`
                  : '0%'}{' '}
                ({previousAttemptsCount}{' '}
                {previousAttemptsCount === 1 ? 'attempt' : 'attempts'})
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-sky-400 font-semibold">
            Module {module.moduleNumber} ({module.id}){' '}
            {topic
              ? `• Topic ${topic.code}`
              : '• Full Module Gate Verification'}
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {assessmentTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Answer all {questions.length} engineering questions below. Numeric
            questions are graded deterministically within their stated
            engineering tolerance in the required unit. A score of at least{' '}
            <strong className="text-slate-900 dark:text-white">
              90% ({minRequiredCorrect} out of {questions.length})
            </strong>{' '}
            is required to pass.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p>
              <strong className="text-slate-900 dark:text-white">
                Syllabus Learning Gate:
              </strong>{' '}
              {module.learningGate}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Apply the Five Study Rules: explain physically, sketch the load
              path and deformed shape, calculate in consistent SI units, check
              against equilibrium bounds, and state assumptions.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Result Banner */}
      {submissionResult && (
        <div
          data-testid="assessment-result-banner"
          className={`rounded-2xl border p-6 shadow-xs space-y-4 ${
            submissionResult.passed
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100'
              : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-slate-900 dark:text-slate-100'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {submissionResult.passed ? (
                <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    data-testid="assessment-pass-status"
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      submissionResult.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {submissionResult.passed
                      ? 'PASSED (≥90%)'
                      : 'NOT PASSED (<90%)'}
                  </span>
                  <span
                    data-testid="assessment-score-display"
                    className="text-lg font-bold font-mono text-slate-900 dark:text-white"
                  >
                    Score: {submissionResult.correctCount} /{' '}
                    {submissionResult.totalQuestions} (
                    {submissionResult.displayPercentage})
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                  {submissionResult.passed
                    ? `Congratulations! You achieved ${submissionResult.displayPercentage}, meeting the 90% mastery threshold (${minRequiredCorrect}/${submissionResult.totalQuestions} required). Review the full worked explanations below.`
                    : `You scored ${submissionResult.displayPercentage} (${submissionResult.correctCount}/${submissionResult.totalQuestions}). A minimum of 90% (${minRequiredCorrect}/${submissionResult.totalQuestions} correct) is required to pass this assessment. Study the worked explanations below and retake when ready.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                data-testid="retake-assessment-btn"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
              <button
                type="button"
                onClick={onBackToModule}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-2xs"
              >
                <span>Return to Module {module.moduleNumber}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Sticky Bar while answering */}
      {!submissionResult && (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-3 z-20">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Answered:{' '}
              <strong className="font-mono text-slate-900 dark:text-white">
                {answeredCount} / {questions.length}
              </strong>{' '}
              questions
            </span>
            <div className="w-28 sm:w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-200"
                style={{
                  width: `${
                    questions.length > 0
                      ? (answeredCount / questions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTrySubmit}
              data-testid="submit-assessment-top-btn"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              Submit Assessment ({answeredCount}/{questions.length})
            </button>
          </div>
        </div>
      )}

      {/* Unanswered Warning Confirmation */}
      {showUnansweredConfirm && !submissionResult && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              You have answered{' '}
              <strong>
                {answeredCount} of {questions.length}
              </strong>{' '}
              questions. Unanswered questions will be marked incorrect. Submit
              anyway?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUnansweredConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Continue Answering
            </button>
            <button
              type="button"
              onClick={executeSubmit}
              data-testid="confirm-submit-unanswered-btn"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
            >
              Confirm Submit
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const itemResult = submissionResult?.itemResults.find(
            (r) => r.questionId === q.id
          );
          const currentAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              data-testid={`assessment-question-card-${idx + 1}`}
              className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors ${
                itemResult
                  ? itemResult.isCorrect
                    ? 'border-emerald-300 dark:border-emerald-500/40'
                    : 'border-rose-300 dark:border-rose-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Question Top Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    Question {idx + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                    {q.questionType.toUpperCase()}
                  </span>
                  {q.type === 'numeric' && (q.unit || q.requiredUnit) && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/10 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/20">
                      Required Unit: {q.unit ?? q.requiredUnit}
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                    {q.reviewStatus}
                  </span>
                </div>

                {itemResult && (
                  <div className="flex items-center gap-1.5">
                    {itemResult.isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-500/30">
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Question Prompt */}
              <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                {q.prompt}
              </p>

              {/* Input Control: Numeric vs MCQ */}
              {q.type === 'numeric' ? (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Numerical Answer{' '}
                    {q.unit || q.requiredUnit
                      ? `(in ${q.unit ?? q.requiredUnit})`
                      : ''}
                    :
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={Boolean(submissionResult)}
                      value={
                        currentAnswer !== undefined ? String(currentAnswer) : ''
                      }
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder={`Enter value${
                        q.unit || q.requiredUnit
                          ? ` in ${q.unit ?? q.requiredUnit}`
                          : ''
                      }`}
                      data-testid={`numeric-input-${idx + 1}`}
                      className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white disabled:opacity-60"
                    />
                    {(q.unit || q.requiredUnit) && (
                      <span className="text-xs font-mono font-semibold px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {q.unit ?? q.requiredUnit}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {(q.options ?? []).map((opt, optIdx) => {
                    const isSelected = Number(currentAnswer) === optIdx;
                    const isCorrectOption =
                      submissionResult && q.correctOptionIndex === optIdx;
                    const isWrongSelected =
                      submissionResult && isSelected && !isCorrectOption;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={Boolean(submissionResult)}
                        onClick={() => handleAnswerChange(q.id, optIdx)}
                        data-testid={`mcq-option-${idx + 1}-${optIdx}`}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-colors flex items-start gap-3 cursor-pointer disabled:cursor-default ${
                          isCorrectOption
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-500/60 text-emerald-950 dark:text-emerald-100 font-medium'
                            : isWrongSelected
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-500/60 text-rose-950 dark:text-rose-100'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-sky-500/15 border-blue-500 dark:border-sky-500 text-blue-950 dark:text-white font-medium'
                            : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                            isCorrectOption
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : isWrongSelected
                              ? 'bg-rose-600 text-white border-rose-500'
                              : isSelected
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Post-Submission Detailed Engineering Explanation */}
              {itemResult && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      Your Answer:{' '}
                      <strong
                        className={
                          itemResult.isCorrect
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-rose-700 dark:text-rose-300'
                        }
                      >
                        {itemResult.submittedValue}
                      </strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Expected Answer:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-300">
                        {itemResult.expectedDisplay}
                      </strong>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-sky-300">
                      <Info className="w-3.5 h-3.5" />
                      <span>Worked Explanation &amp; Engineering Principle</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {itemResult.explanation}
                    </p>
                    {q.reviewNotice && (
                      <p className="text-xs text-amber-800 dark:text-amber-300/90 pt-1">
                        <strong>Source &amp; Verification Note:</strong>{' '}
                        {q.reviewNotice}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!submissionResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Ready to grade your assessment? You need{' '}
            <strong className="text-slate-900 dark:text-white">
              {minRequiredCorrect} out of {questions.length} (90%)
            </strong>{' '}
            correct to pass.
          </div>
          <button
            type="button"
            onClick={handleTrySubmit}
            data-testid="submit-assessment-bottom-btn"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            Submit Assessment for Grading
          </button>
        </div>
      )}
    </div>
  );
};
