import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Flame,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import {
  APP_BUILD_DATE,
  APP_VERSION,
  INITIAL_MILESTONE_A_BARS,
  INITIAL_RECENT_SESSIONS,
  ObjectiveItem,
  SESSION_QUESTIONS,
  SYLLABUS_MODULES,
  StepId,
  StepStatus,
  SyllabusModuleItem,
  computeAdaptiveTransition,
  convertEngineeringUnit,
  evaluateQuestionAttempt,
  runSelfVerificationChecks,
  GradeOutcome,
} from './utils/tutorEngine';
import { MathFraction, UnitBadge } from './components/MathFormula';
import { QuestionDiagram } from './components/QuestionDiagram';
import { WorkedSolutionDrawer } from './components/WorkedSolutionDrawer';
import {
  CalculatorPopover,
  SyllabusInspectorDrawer,
  UnitsReferenceDrawer,
  VerificationSelfTestDrawer,
} from './components/UtilityModals';

type MainView = 'dashboard' | 'tutor' | 'map';

interface SessionAttemptLogItem {
  stepId: string;
  questionTitle: string;
  submittedDisplay: string;
  status: 'Mastered First-Try' | 'Completed (Assisted)' | 'Needs Retry';
  timeAgo: string;
}

export default function App() {
  // Primary Navigation View ('dashboard' | 'tutor' | 'map')
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [hybridLightCards, setHybridLightCards] = useState<boolean>(true);

  // Tutor Session State Machine
  const [currentStep, setCurrentStep] = useState<StepId>('learn');
  const [remedialInjected, setRemedialInjected] = useState<boolean>(false);
  const [stepStatuses, setStepStatuses] = useState<Record<StepId, StepStatus>>({
    learn: 'active',
    '1a': 'mastered',
    '1b': 'mastered',
    '2a': 'unseen',
    '2a-R': 'unseen',
    '2b': 'unseen',
    '2c': 'unseen',
    '3': 'unseen',
    '4': 'unseen',
    '5a': 'unseen',
    summary: 'unseen',
  });

  // Active Question Form State
  const [answerInput, setAnswerInput] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('MPa');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [fullSolutionUnlockedByStep, setFullSolutionUnlockedByStep] = useState<
    Record<string, boolean>
  >({});
  const [failuresByStep, setFailuresByStep] = useState<Record<string, number>>(
    {}
  );
  const [gradeOutcome, setGradeOutcome] = useState<GradeOutcome | null>(null);
  const [adaptiveBanner, setAdaptiveBanner] = useState<string | null>(null);
  const [fastTrackAvailable, setFastTrackAvailable] = useState<boolean>(false);
  const [xpPoints, setXpPoints] = useState<number>(1240);
  const [sessionHistory, setSessionHistory] = useState<SessionAttemptLogItem[]>([
    {
      stepId: '1a',
      questionTitle: 'Bending Moment Conversion to Base (mm, N) Units',
      submittedDisplay: '5,000,000 N·mm',
      status: 'Mastered First-Try',
      timeAgo: '8 mins ago',
    },
    {
      stepId: '1b',
      questionTitle: 'Surface Pressure Conversion (kN/m² to N/mm²)',
      submittedDisplay: '0.025 N/mm²',
      status: 'Mastered First-Try',
      timeAgo: '4 mins ago',
    },
  ]);

  // Learn Tab Sandbox State
  const [sandboxMomentKnM, setSandboxMomentKnM] = useState<number>(18);
  const [sandboxModulusMm3, setSandboxModulusMm3] = useState<number>(600000);

  // Modals & Drawers
  const [workedSolutionDrawerOpen, setWorkedSolutionDrawerOpen] =
    useState<boolean>(false);
  const [unitsDrawerOpen, setUnitsDrawerOpen] = useState<boolean>(false);
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [topicSwitcherOpen, setTopicSwitcherOpen] = useState<boolean>(false);
  const [activeTopicLabel, setActiveTopicLabel] = useState<string>(
    'Topic 0.1: Dimensional Homogeneity & Stress Units'
  );

  // Learning Map State
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3>(1);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapStatusFilter, setMapStatusFilter] = useState<
    'All' | 'In Progress' | 'Mastered' | 'Locked'
  >('All');
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    0: true, // Module 0 expanded by default per specification
  });
  const [inspectorTarget, setInspectorTarget] = useState<{
    moduleItem: SyllabusModuleItem;
    objectiveItem: ObjectiveItem | null;
  } | null>(null);

  // Visible Stepper Sequence
  const visibleSteps = useMemo<StepId[]>(() => {
    const base: StepId[] = [
      'learn',
      '1a',
      '1b',
      '2a',
      ...(remedialInjected ? (['2a-R'] as StepId[]) : []),
      '2b',
      '2c',
      '3',
      '4',
      '5a',
      'summary',
    ];
    return base;
  }, [remedialInjected]);

  // Continuous Session Progress %
  const sessionProgressPercent = useMemo(() => {
    const questionSteps = visibleSteps.filter(
      (s) => s !== 'learn' && s !== 'summary'
    );
    const completed = questionSteps.filter(
      (s) => stepStatuses[s] === 'mastered' || stepStatuses[s] === 'assisted'
    ).length;
    return Math.round((completed / questionSteps.length) * 100);
  }, [visibleSteps, stepStatuses]);

  // Dynamic Milestone A Portfolio Bars (updates live as questions are mastered)
  const milestoneABars = useMemo(() => {
    const extraSectionBending =
      (stepStatuses['2a'] === 'mastered' ? 1 : 0) +
      (stepStatuses['2b'] === 'mastered' ? 1 : 0);
    const extraDeflection = stepStatuses['4'] === 'mastered' ? 1 : 0;
    const extraSfdBmd = stepStatuses['5a'] === 'mastered' ? 1 : 0;
    const extraReactions = stepStatuses['3'] === 'mastered' ? 1 : 0;

    return INITIAL_MILESTONE_A_BARS.map((bar) => {
      if (bar.id === 'section_bending') {
        return {
          ...bar,
          completed: Math.min(bar.target, bar.completed + extraSectionBending),
        };
      }
      if (bar.id === 'deflection') {
        return {
          ...bar,
          completed: Math.min(bar.target, bar.completed + extraDeflection),
        };
      }
      if (bar.id === 'sfd_bmd') {
        return {
          ...bar,
          completed: Math.min(bar.target, bar.completed + extraSfdBmd),
        };
      }
      if (bar.id === 'reactions') {
        return {
          ...bar,
          completed: Math.min(bar.target, bar.completed + extraReactions),
        };
      }
      return bar;
    });
  }, [stepStatuses]);

  const activeQuestion =
    currentStep !== 'learn' && currentStep !== 'summary'
      ? SESSION_QUESTIONS[currentStep]
      : SESSION_QUESTIONS['2a'];

  // Navigate to a specific step in the Tutor Stepper
  const goToTutorStep = (targetStep: StepId) => {
    setCurrentStep(targetStep);
    setGradeOutcome(null);
    setAdaptiveBanner(null);
    setHintsRevealed(0);
    setAnswerInput('');
    if (targetStep !== 'learn' && targetStep !== 'summary') {
      setSelectedUnit(SESSION_QUESTIONS[targetStep].defaultUnit);
    }
    setActiveView('tutor');
  };

  // Start or Resume Practice Session from Dashboard / Map
  const startOrResumeTutor = (
    initialStep: StepId = 'learn',
    topicName?: string
  ) => {
    if (topicName) {
      setActiveTopicLabel(topicName);
    }
    goToTutorStep(initialStep);
  };

  // Handle Answer Check Submission
  const handleCheckAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 'learn' || currentStep === 'summary') return;

    const q = SESSION_QUESTIONS[currentStep];
    try {
      const outcome = evaluateQuestionAttempt(q, answerInput, selectedUnit);
      setGradeOutcome(outcome);

      const prevFails = failuresByStep[currentStep] ?? 0;
      const newFailCount = outcome.isCorrect ? prevFails : prevFails + 1;
      if (!outcome.isCorrect) {
        setFailuresByStep((prev) => ({
          ...prev,
          [currentStep]: newFailCount,
        }));
      }

      const usedHelp =
        hintsRevealed > 0 ||
        Boolean(fullSolutionUnlockedByStep[currentStep]) ||
        prevFails > 0;

      const transition = computeAdaptiveTransition(
        currentStep,
        outcome.isCorrect,
        newFailCount,
        usedHelp,
        stepStatuses,
        remedialInjected
      );

      setStepStatuses(transition.nextStepStatuses);
      if (transition.remedialInjected) {
        setRemedialInjected(true);
      }
      if (transition.autoRevealWorkedSolution) {
        setFullSolutionUnlockedByStep((prev) => ({
          ...prev,
          [currentStep]: true,
        }));
      }
      setAdaptiveBanner(transition.adaptiveBannerMessage);
      setFastTrackAvailable(transition.fastTrackEligible);

      if (outcome.isCorrect) {
        setXpPoints((prev) => prev + (usedHelp ? 25 : 50));
      }

      setSessionHistory((prev) => [
        {
          stepId: currentStep,
          questionTitle: q.title,
          submittedDisplay: `${answerInput.trim()} ${selectedUnit}`,
          status: outcome.isCorrect
            ? usedHelp
              ? 'Completed (Assisted)'
              : 'Mastered First-Try'
            : 'Needs Retry',
          timeAgo: 'Just now',
        },
        ...prev.filter((item) => item.stepId !== currentStep),
      ]);
    } catch (err) {
      setGradeOutcome({
        isCorrect: false,
        isEquivalentUnitMatch: false,
        userValueConvertedToCanonical: null,
        expectedCanonicalValue: q.canonicalAnswerInBaseUnit,
        expectedCanonicalUnit: q.canonicalUnit,
        scaleFactorError: null,
        headline: 'Please Enter a Numeric Value',
        diagnosticDetail:
          err instanceof Error
            ? err.message
            : 'Enter a number in the answer box before checking.',
        unitConversionNote: '',
      });
    }
  };

  // Advance to Next Step in Sequence
  const handleAdvanceToNextStep = () => {
    const idx = visibleSteps.indexOf(currentStep);
    if (idx >= 0 && idx < visibleSteps.length - 1) {
      if (currentStep === 'learn' && stepStatuses.learn === 'active') {
        setStepStatuses((prev) => ({ ...prev, learn: 'mastered' }));
      }
      goToTutorStep(visibleSteps[idx + 1]);
    } else {
      goToTutorStep('summary');
    }
  };

  // One-click simulator for 2-strike remedial injection on Question 2a
  const handleSimulateTwoStrikeOn2a = () => {
    setActiveView('tutor');
    setCurrentStep('2a');
    setAnswerInput('0.027');
    setSelectedUnit('MPa');
    const q2a = SESSION_QUESTIONS['2a'];
    const outcome = evaluateQuestionAttempt(q2a, '0.027', 'MPa');
    setGradeOutcome(outcome);
    setFailuresByStep((prev) => ({ ...prev, '2a': 2 }));
    const transition = computeAdaptiveTransition(
      '2a',
      false,
      2,
      false,
      stepStatuses,
      remedialInjected
    );
    setStepStatuses(transition.nextStepStatuses);
    setRemedialInjected(true);
    setFullSolutionUnlockedByStep((prev) => ({ ...prev, '2a': true }));
    setAdaptiveBanner(transition.adaptiveBannerMessage);
  };

  // Filtered Learning Map Modules
  const filteredSyllabusModules = useMemo(() => {
    return SYLLABUS_MODULES.filter((m) => {
      if (m.stage !== selectedStage) return false;
      if (mapStatusFilter !== 'All' && m.status !== mapStatusFilter) return false;
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchSub = m.subtitle.toLowerCase().includes(q);
        const matchObj = m.objectives.some((o) =>
          o.title.toLowerCase().includes(q)
        );
        return matchTitle || matchSub || matchObj;
      }
      return true;
    });
  }, [selectedStage, mapStatusFilter, mapSearchQuery]);

  const verificationChecks = useMemo(() => runSelfVerificationChecks(), []);

  // Card theme classes (Sparx-inspired Hybrid crisp white cards vs Deep Slate cards)
  const cardSurfaceClass = hybridLightCards
    ? 'bg-white text-slate-900 border border-slate-200/90 shadow-md'
    : 'bg-slate-900 text-slate-100 border border-slate-800 shadow-md';

  const subCardSurfaceClass = hybridLightCards
    ? 'bg-slate-50/90 text-slate-900 border border-slate-200'
    : 'bg-slate-800/60 text-slate-100 border border-slate-700/80';

  const mutedTextClass = hybridLightCards ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className={hybridLightCards ? '' : 'dark'}>
      <div className="min-h-screen flex bg-[#0B1120] text-slate-100 selection:bg-blue-600 selection:text-white">
        {/* ================================================================ */}
        {/* COLLAPSIBLE LEFT NAVIGATION RAIL (240px Expanded / 72px Compact) */}
        {/* ================================================================ */}
        <aside
          aria-label="Primary Sidebar Navigation"
          className={`${
            sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
          } shrink-0 bg-[#070B14] border-r border-slate-800/90 flex flex-col justify-between transition-all duration-150 select-none`}
        >
          <div className="p-4 space-y-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between gap-2 px-1">
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="text-left group cursor-pointer"
                >
                  <div className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 inline-flex items-center justify-center text-xs font-extrabold text-white">
                      ST
                    </span>
                    <span>StructTutor</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-9">
                    Structural Engineering
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={
                  sidebarCollapsed ? 'Expand navigation rail' : 'Collapse navigation rail'
                }
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Primary Nav Items */}
            <nav aria-label="Main Views" className="space-y-1.5">
              {(
                [
                  {
                    id: 'dashboard',
                    label: 'Home Dashboard',
                    icon: LayoutDashboard,
                  },
                  {
                    id: 'tutor',
                    label: 'Tutor & Practice',
                    icon: BookOpen,
                  },
                  {
                    id: 'map',
                    label: 'Learning Map',
                    icon: Map,
                  },
                ] as const
              ).map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'tutor') {
                        setActiveView('tutor');
                      } else {
                        setActiveView(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Engineering Utilities */}
            {!sidebarCollapsed && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="px-3 text-[11px] font-semibold text-slate-400">
                  Quick Engineering Tools
                </div>
                <button
                  type="button"
                  onClick={() => setUnitsDrawerOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Units Reference Drawer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculatorOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Scratchpad Calculator</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Theme Toggle & Learner Profile Summary */}
          <div className="p-4 border-t border-slate-800/80 space-y-3">
            <button
              type="button"
              onClick={() => setHybridLightCards((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                {hybridLightCards ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                {!sidebarCollapsed && (
                  <span>
                    {hybridLightCards ? 'Sparx Crisp Cards' : 'Dark Slate Cards'}
                  </span>
                )}
              </span>
            </button>

            {!sidebarCollapsed && (
              <div className="px-2 py-1 text-[11px] text-slate-400 space-y-0.5">
                <div className="font-semibold text-slate-200">
                  Year 1 Core Mechanics
                </div>
                <div>Sagging = +M (tension face)</div>
                <div className="pt-1 text-[10px] font-mono text-slate-400">
                  v{APP_VERSION} ({APP_BUILD_DATE})
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ================================================================ */}
        {/* MAIN WORKSPACE AREA                                              */}
        {/* ================================================================ */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ============================================================== */}
          {/* VIEW 1: TUTOR & PRACTICE WORKSPACE (SPARX MATHS FLOW)          */}
          {/* ============================================================== */}
          {activeView === 'tutor' && (
            <div className="flex-1 flex flex-col">
              {/* 1. TOP SESSION HEADER BAR (Replaces Mid-Page Filter Dropdowns) */}
              <header className="sticky top-0 z-30 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800 px-6 py-3">
                <div className="max-w-[920px] mx-auto flex flex-wrap items-center justify-between gap-4">
                  {/* Left: Exit to Dashboard + Clean Breadcrumb + Subtle Topic Switcher */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveView('dashboard')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Exit to Dashboard</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 truncate">
                      <span className="font-medium text-slate-400">
                        Module 0: Structural Units &amp; Stress
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {activeTopicLabel}
                      </span>
                    </div>

                    {/* Subtle [Switch Topic ▾] Popover in Top Header */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTopicSwitcherOpen((prev) => !prev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-sky-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      >
                        <span>Switch Topic</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {topicSwitcherOpen && (
                        <div className="absolute left-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 space-y-1">
                          <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400">
                            SELECT MODULE 0 PRACTICE TOPIC
                          </div>
                          {[
                            {
                              label:
                                'Topic 0.1: Dimensional Homogeneity & Stress Units',
                              step: 'learn' as StepId,
                            },
                            {
                              label:
                                'Topic 0.1 — Elastic Bending Stress (Question 2a)',
                              step: '2a' as StepId,
                            },
                            {
                              label:
                                'Topic 0.1 — Direct Axial Tie Stress (Question 3)',
                              step: '3' as StepId,
                            },
                            {
                              label:
                                'Topic 0.1 — Midspan UDL Bending Check (Question 5a)',
                              step: '5a' as StepId,
                            },
                          ].map((t) => (
                            <button
                              key={t.label}
                              type="button"
                              onClick={() => {
                                setActiveTopicLabel(t.label);
                                setTopicSwitcherOpen(false);
                                goToTutorStep(t.step);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Utility Buttons (Units Drawer, Calculator, XP Streak) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUnitsDrawerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>Units Reference</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Calculator</span>
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-950/80 border border-blue-800/70 text-sky-300 tabular-nums">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{xpPoints.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>

                {/* 2. HORIZONTAL QUESTION STEPPER BAR + VISUAL PROGRESS BAR */}
                <div className="max-w-[920px] mx-auto pt-3 space-y-2">
                  <div
                    role="tablist"
                    aria-label="Session question stepper"
                    className="flex items-center gap-1.5 overflow-x-auto pb-1"
                  >
                    {visibleSteps.map((stepId) => {
                      const isCurrent = currentStep === stepId;
                      const status = stepStatuses[stepId];
                      const isRemedial = stepId === '2a-R';

                      let pillStyle =
                        'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700';
                      if (isCurrent) {
                        pillStyle =
                          'bg-[#2563EB] text-white font-bold shadow-sm ring-2 ring-blue-400/50 border-blue-500';
                      } else if (status === 'mastered') {
                        pillStyle =
                          'bg-emerald-600/90 text-white font-semibold border border-emerald-500';
                      } else if (status === 'assisted' || isRemedial) {
                        pillStyle =
                          'bg-amber-500/90 text-slate-950 font-bold border border-amber-400';
                      }

                      const label =
                        stepId === 'learn'
                          ? '📖 Learn'
                          : stepId === 'summary'
                          ? '🏁 Summary'
                          : stepId === '2a-R'
                          ? '2a-R ⚡'
                          : stepId;

                      return (
                        <button
                          key={stepId}
                          role="tab"
                          aria-selected={isCurrent}
                          type="button"
                          onClick={() => goToTutorStep(stepId)}
                          className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${pillStyle}`}
                        >
                          <span>{label}</span>
                          {status === 'mastered' && stepId !== 'learn' && (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Continuous Smooth Progress Bar (0% to 100%) */}
                  <div className="flex items-center gap-3">
                    <div
                      role="progressbar"
                      aria-valuenow={sessionProgressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Session completion percentage"
                      className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-emerald-500 transition-all duration-200"
                        style={{ width: `${sessionProgressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums shrink-0">
                      {sessionProgressPercent}% Session Complete
                    </span>
                  </div>
                </div>
              </header>

              {/* CENTERED TUTOR WORKSPACE CONTAINER (max-width: 920px) */}
              <main className="flex-1 w-full max-w-[920px] mx-auto px-6 py-8">
                {/* ========================================================== */}
                {/* PHASE 1 — INFORMATION FIRST ([📖 Learn] Step)              */}
                {/* ========================================================== */}
                {currentStep === 'learn' && (
                  <div className={`${cardSurfaceClass} rounded-2xl p-7 space-y-8`}>
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                      <div className="text-xs font-bold text-blue-600 dark:text-sky-400">
                        CONCEPT WALKTHROUGH • MODULE 0: TOPIC 0.1
                      </div>
                      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                        Dimensional Homogeneity &amp; Structural Base Units (mm, N)
                      </h1>
                      <p
                        className={`text-base ${mutedTextClass} leading-relaxed max-w-[70ch]`}
                      >
                        Before substituting numbers into any beam or column equation, every quantity must speak the same unit language. In UK structural design, drawings specify dimensions in{' '}
                        <strong>millimetres (mm)</strong> and material strengths in{' '}
                        <strong>MPa (N/mm²)</strong>.
                      </p>
                    </div>

                    {/* Card A: Core Concept in Plain English */}
                    <section className="space-y-3">
                      <h2 className="font-display text-lg font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                          A
                        </span>
                        <span>Core Concept in Plain English: The Four Structural Quantities</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`${subCardSurfaceClass} rounded-xl p-4 space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold">
                              1. Force (Pushing or Pulling)
                            </span>
                            <UnitBadge unit="1 kN = 1,000 N" />
                          </div>
                          <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
                            Gravity loads and support reactions are measured in kilonewtons (kN), while section stress equations work in newtons (N).
                          </p>
                        </div>

                        <div className={`${subCardSurfaceClass} rounded-xl p-4 space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold">
                              2. Bending Moment (Force × Lever Arm)
                            </span>
                            <UnitBadge unit="1 kN·m = 10⁶ N·mm" />
                          </div>
                          <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
                            Because both Force (kN → 10³ N) and Lever Arm (m → 10³ mm) scale by 1,000, converting kN·m to N·mm multiplies by{' '}
                            <strong>1,000,000 (10⁶)</strong>.
                          </p>
                        </div>

                        <div className={`${subCardSurfaceClass} rounded-xl p-4 space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold">
                              3. Distributed Line Load (Force ÷ Length)
                            </span>
                            <UnitBadge unit="1 kN/m = 1 N/mm" />
                          </div>
                          <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
                            When dividing 1,000 N by 1,000 mm, the factors of 1,000 cancel out! A beam load of 7.5 kN/m is numerically identical to 7.5 N/mm.
                          </p>
                        </div>

                        <div className={`${subCardSurfaceClass} rounded-xl p-4 space-y-1.5`}>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold">
                              4. Stress &amp; Elastic Modulus (Force ÷ Area)
                            </span>
                            <UnitBadge unit="1 MPa = 1 N/mm²" />
                          </div>
                          <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
                            One Megapascal (10⁶ N/m²) divided by 10⁶ mm²/m² equals exactly 1 N/mm². And 1 GPa equals 1,000 N/mm².
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Card B: Interactive Unit Conversion Sandbox / Cheat Sheet */}
                    <section className="space-y-3">
                      <h2 className="font-display text-lg font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                          B
                        </span>
                        <span>Interactive Bending Stress Unit Sandbox</span>
                      </h2>
                      <div className={`${subCardSurfaceClass} rounded-xl p-5 space-y-4`}>
                        <p className={`text-sm ${mutedTextClass}`}>
                          Drag the sliders to see how converting bending moment{' '}
                          <strong>M (kN·m → N·mm)</strong> aligns cleanly with section modulus{' '}
                          <strong>Wₑₗ (mm³)</strong> to produce stress directly in{' '}
                          <strong>MPa (N/mm²)</strong>:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label
                              htmlFor="sandbox-moment-slider"
                              className="flex justify-between text-xs font-semibold"
                            >
                              <span>Applied Moment M:</span>
                              <span className="font-mono text-blue-600 dark:text-sky-400">
                                {sandboxMomentKnM} kN·m ={' '}
                                {(sandboxMomentKnM * 1_000_000).toLocaleString()} N·mm
                              </span>
                            </label>
                            <input
                              id="sandbox-moment-slider"
                              type="range"
                              min={5}
                              max={60}
                              step={1}
                              value={sandboxMomentKnM}
                              onChange={(e) =>
                                setSandboxMomentKnM(Number(e.target.value))
                              }
                              className="w-full accent-blue-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label
                              htmlFor="sandbox-modulus-slider"
                              className="flex justify-between text-xs font-semibold"
                            >
                              <span>Elastic Section Modulus Wₑₗ:</span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                {sandboxModulusMm3.toLocaleString()} mm³
                              </span>
                            </label>
                            <input
                              id="sandbox-modulus-slider"
                              type="range"
                              min={200000}
                              max={1000000}
                              step={50000}
                              value={sandboxModulusMm3}
                              onChange={(e) =>
                                setSandboxModulusMm3(Number(e.target.value))
                              }
                              className="w-full accent-emerald-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700/80">
                          <MathFraction
                            lhs="σ"
                            num={`${(sandboxMomentKnM * 1_000_000).toLocaleString()} N·mm`}
                            den={`${sandboxModulusMm3.toLocaleString()} mm³`}
                            rhs={`${(
                              (sandboxMomentKnM * 1_000_000) /
                              sandboxModulusMm3
                            ).toFixed(1)} N/mm² (MPa)`}
                          />
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            Equivalent in GPa:{' '}
                            <strong>
                              {(
                                (sandboxMomentKnM * 1_000_000) /
                                sandboxModulusMm3 /
                                1000
                              ).toFixed(4)}{' '}
                              GPa
                            </strong>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Card C: Step-by-Step Verified Worked Example */}
                    <section className="space-y-3">
                      <h2 className="font-display text-lg font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                          C
                        </span>
                        <span>Step-by-Step Worked Example: Four Core Conversions</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            step: 'Step 1',
                            title: 'Young’s Modulus (200 GPa → N/mm²)',
                            work: '200 GPa × 1,000 (MPa/GPa) = 200,000 MPa',
                            ans: '200,000 N/mm²',
                          },
                          {
                            step: 'Step 2',
                            title: 'Surface Pressure (25 kN/m² → N/mm²)',
                            work: '(25 × 10³ N) ÷ (10⁶ mm²) = 25 ÷ 1,000',
                            ans: '0.025 N/mm²',
                          },
                          {
                            step: 'Step 3',
                            title: 'Bending Moment (5 kN·m → N·mm)',
                            work: '5 × (10³ N) × (10³ mm) = 5 × 10⁶',
                            ans: '5,000,000 N·mm',
                          },
                          {
                            step: 'Step 4',
                            title: 'Line Load (7.5 kN/m → N/mm)',
                            work: '(7.5 × 10³ N) ÷ (10³ mm) = 1:1 ratio',
                            ans: '7.5 N/mm',
                          },
                        ].map((ex) => (
                          <div
                            key={ex.step}
                            className={`${subCardSurfaceClass} rounded-xl p-4 flex flex-col justify-between space-y-2`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-600 dark:text-sky-400">
                                {ex.step}
                              </span>
                              <span className="text-xs font-semibold">
                                {ex.title}
                              </span>
                            </div>
                            <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
                              {ex.work}
                            </div>
                            <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                              = {ex.ans}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Bottom Action Bar on Learn Card */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className={`text-xs ${mutedTextClass}`}>
                        Ready to apply these four rules? Start with guided Question 1a or jump to any step above.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStepStatuses((prev) => ({
                            ...prev,
                            learn: 'mastered',
                          }));
                          goToTutorStep('1a');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                      >
                        <span>Start Practice: Question 1a</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================== */}
                {/* PHASE 2 — FOCUSED QUESTION CARDS (1a..5a & 2a-R)           */}
                {/* ========================================================== */}
                {currentStep !== 'learn' && currentStep !== 'summary' && (
                  <div className={`${cardSurfaceClass} rounded-2xl p-7 space-y-6`}>
                    {/* Top Pill Row inside Question Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
                          {activeQuestion.badgeLabel}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            hintsRevealed === 0 &&
                            !fullSolutionUnlockedByStep[currentStep]
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {hintsRevealed === 0 &&
                          !fullSolutionUnlockedByStep[currentStep]
                            ? '★ First-Try Mastery Eligible'
                            : 'Assisted Mode (Hints / Solution Active)'}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Calculator Allowed</span>
                      </span>
                    </div>

                    {/* Clear Problem Statement & Formatted Math */}
                    <div className="space-y-4">
                      <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                        {activeQuestion.title}
                      </h1>
                      <p className="text-base sm:text-[17px] leading-relaxed max-w-[70ch]">
                        {activeQuestion.promptLead}
                      </p>

                      {activeQuestion.promptFormula && (
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <MathFraction
                            size="lg"
                            lhs={activeQuestion.promptFormula.lhs}
                            num={activeQuestion.promptFormula.num}
                            den={activeQuestion.promptFormula.den}
                          />
                          {activeQuestion.promptFormula.rhsNote && (
                            <span className={`text-xs ${mutedTextClass}`}>
                              {activeQuestion.promptFormula.rhsNote}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Given Parameters Bar */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {activeQuestion.givenParameters.map((param) => (
                          <div
                            key={param.label}
                            className={`${subCardSurfaceClass} px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs`}
                          >
                            <span className={mutedTextClass}>{param.label}:</span>
                            <span className="font-mono font-bold text-blue-700 dark:text-sky-300">
                              {param.symbol}
                              {param.sub && <sub>{param.sub}</sub>} ={' '}
                              {param.valueDisplay}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive SVG Structural Diagram + [🔍 Zoom] Lightbox */}
                    <QuestionDiagram
                      diagramType={activeQuestion.diagramType}
                      caption={activeQuestion.diagramCaption}
                    />

                    {/* Focused Input Cluster (180-240px input + 120px unit selector) */}
                    <form
                      onSubmit={handleCheckAnswer}
                      className={`${subCardSurfaceClass} rounded-2xl p-5 space-y-4`}
                    >
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <label
                          htmlFor="tutor-numeric-answer"
                          className="text-sm font-bold shrink-0"
                        >
                          Your Answer:
                        </label>
                        <input
                          id="tutor-numeric-answer"
                          type="text"
                          inputMode="decimal"
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          placeholder={activeQuestion.placeholder}
                          className="w-[200px] px-3.5 py-2.5 text-base font-mono font-semibold rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none tabular-nums"
                        />
                        <select
                          aria-label="Select engineering unit"
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          className="w-[120px] px-3 py-2.5 text-sm font-mono font-bold rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer"
                        >
                          {activeQuestion.unitChoices.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick-Fill Evaluator Presets on Question 2a for Instant Equivalence Testing */}
                      {currentStep === '2a' && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                          <span className={mutedTextClass}>
                            Quick-fill test values:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerInput('27');
                              setSelectedUnit('MPa');
                            }}
                            className="px-2.5 py-1 rounded-md font-mono bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 cursor-pointer"
                          >
                            27 MPa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerInput('27');
                              setSelectedUnit('N/mm²');
                            }}
                            className="px-2.5 py-1 rounded-md font-mono bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 cursor-pointer"
                          >
                            27 N/mm²
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerInput('0.027');
                              setSelectedUnit('GPa');
                            }}
                            className="px-2.5 py-1 rounded-md font-mono bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 cursor-pointer"
                          >
                            0.027 GPa (Equivalent!)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerInput('0.027');
                              setSelectedUnit('MPa');
                            }}
                            className="px-2.5 py-1 rounded-md font-mono bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700 hover:bg-amber-100 cursor-pointer"
                          >
                            0.027 MPa (×10⁻³ Scale Error)
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Progressive Graduated Hints Callout */}
                    {hintsRevealed > 0 && (
                      <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>
                              Progressive Engineering Hints ({hintsRevealed}/2)
                            </span>
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-amber-950 dark:text-amber-100">
                          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-amber-200/60 dark:border-amber-800/50">
                            <strong>Hint 1 (Unit Alignment):</strong>{' '}
                            {activeQuestion.hints[0]}
                          </div>
                          {hintsRevealed >= 2 && (
                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-amber-200/60 dark:border-amber-800/50">
                              <strong>Hint 2 (Formula Substitution):</strong>{' '}
                              {activeQuestion.hints[1]}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deterministic Grading & Misconception Feedback Banner */}
                    {gradeOutcome && (
                      <div
                        role="status"
                        className={`rounded-xl p-5 border space-y-3 ${
                          gradeOutcome.isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-display text-base font-bold flex items-center gap-2">
                              {gradeOutcome.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : (
                                <HelpCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                              )}
                              <span>{gradeOutcome.headline}</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {gradeOutcome.diagnosticDetail}
                            </p>
                          </div>
                          {gradeOutcome.unitConversionNote && (
                            <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shrink-0">
                              {gradeOutcome.unitConversionNote}
                            </span>
                          )}
                        </div>

                        {/* Automatic Pedagogical State Machine Routing Banner */}
                        {adaptiveBanner && (
                          <div className="rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 p-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-950 dark:text-amber-100">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{adaptiveBanner}</span>
                            </div>
                            {fastTrackAvailable && (
                              <button
                                type="button"
                                onClick={() => goToTutorStep('3')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer"
                              >
                                Fast-Track to Question 3 →
                              </button>
                            )}
                          </div>
                        )}

                        {/* Auto-Revealed Inline Worked Solution after 2 Failed Attempts */}
                        {fullSolutionUnlockedByStep[currentStep] &&
                          !gradeOutcome.isCorrect && (
                            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-slate-900 dark:text-slate-100">
                              <div className="text-xs font-bold text-blue-600 dark:text-sky-400">
                                AUTOMATICALLY UNLOCKED STEP-BY-STEP WORKED SOLUTION
                              </div>
                              {activeQuestion.fullSolutionSteps.map((st) => (
                                <div
                                  key={st.stepNum}
                                  className="text-xs font-mono flex flex-wrap items-center justify-between gap-2 py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                                >
                                  <span>
                                    <strong>Step {st.stepNum}:</strong>{' '}
                                    {st.substitution}
                                  </span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    = {st.result}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* BOTTOM ACTION BAR (Sparx Maths Layout) */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      {/* Bottom-Left Secondary Support Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setHintsRevealed((prev) => Math.min(2, prev + 1))
                          }
                          disabled={hintsRevealed >= 2}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Need a Hint ({hintsRevealed}/2)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setWorkedSolutionDrawerOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                          <span>Show Worked Solution</span>
                        </button>
                      </div>

                      {/* Bottom-Right Primary CTA */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleCheckAnswer()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Check Answer</span>
                        </button>

                        {(gradeOutcome?.isCorrect ||
                          (failuresByStep[currentStep] ?? 0) >= 2) && (
                          <button
                            type="button"
                            onClick={handleAdvanceToNextStep}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                          >
                            <span>
                              {currentStep === '2a' &&
                              remedialInjected &&
                              stepStatuses['2a-R'] === 'unseen'
                                ? 'Next: Warm-Up 2a-R ⚡ →'
                                : 'Next Question →'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================== */}
                {/* PHASE 3 — END-OF-SESSION [🏁 Summary] TAB                  */}
                {/* ========================================================== */}
                {currentStep === 'summary' && (
                  <div className={`${cardSurfaceClass} rounded-2xl p-7 space-y-7`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          SESSION SUMMARY &amp; PORTFOLIO CREDIT
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold">
                          Topic 0.1 Practice Summary
                        </h1>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            Session Progress
                          </div>
                          <div className="font-display text-xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                            {sessionProgressPercent}%
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                          <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                            Time Spent
                          </div>
                          <div className="font-display text-xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                            14 mins
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestone A Portfolio Progress Bars */}
                    <section className="space-y-3">
                      <h2 className="font-display text-base font-bold">
                        Milestone A Core Mechanics Portfolio Progress
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {milestoneABars.map((bar) => {
                          const pct = Math.round(
                            (bar.completed / bar.target) * 100
                          );
                          return (
                            <div
                              key={bar.id}
                              className={`${subCardSurfaceClass} rounded-xl p-4 space-y-2`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>{bar.label}</span>
                                <span className="font-mono text-blue-600 dark:text-sky-400 tabular-nums">
                                  {bar.completed}/{bar.target}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-200"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className={`text-[11px] ${mutedTextClass}`}>
                                {bar.unitDescription}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Human-Readable Questions Attempted in This Session */}
                    <section className="space-y-3">
                      <h2 className="font-display text-base font-bold">
                        Questions Attempted in This Session
                      </h2>
                      <div className="space-y-2">
                        {sessionHistory.map((item, idx) => (
                          <div
                            key={`${item.stepId}-${idx}`}
                            className={`${subCardSurfaceClass} rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold">
                                Step {item.stepId}: {item.questionTitle}
                              </div>
                              <div className={`text-xs font-mono ${mutedTextClass}`}>
                                Submitted: {item.submittedDisplay} • {item.timeAgo}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                  item.status === 'Mastered First-Try'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : item.status === 'Completed (Assisted)'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {item.status}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  goToTutorStep(item.stepId as StepId)
                                }
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Primary CTA to Next Objective */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveView('dashboard')}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                      >
                        Return to Home Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicLabel(
                            'Topic 0.2: Right-Trigonometry, Force Resolution & Slope Ratios'
                          );
                          goToTutorStep('1a');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                      >
                        <span>Continue to Next Objective (0.2) →</span>
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: HOME DASHBOARD (LEARNER-FRIENDLY ANCHOR, <= 1200px)    */}
          {/* ============================================================== */}
          {activeView === 'dashboard' && (
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 space-y-8">
              {/* 1. SINGLE HERO "UP NEXT / RESUME" CARD */}
              <section
                aria-labelledby="hero-resume-heading"
                className="rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E293B] to-[#0F172A] border border-blue-500/40 p-7 text-white shadow-xl space-y-5"
              >
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-sky-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>YEAR 1 PATHWAY • MODULE 0: CORE MECHANICS</span>
                  </div>
                  <h1
                    id="hero-resume-heading"
                    className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white"
                  >
                    0.1 Structural Units, Dimensional Homogeneity &amp; Stress Scaling
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 pt-1">
                    <span>⏱️ ~12 mins remaining</span>
                    <span>•</span>
                    <span>📝 Step 2a of 5a</span>
                    <span>•</span>
                    <span>🎯 Unlocks Milestone A Credit</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => startOrResumeTutor('2a')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-blue-500 text-white shadow-md transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Practice Session (Question 2a)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startOrResumeTutor('learn')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-600/80 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Review Concept Notes</span>
                  </button>
                </div>
              </section>

              {/* 2. VISUAL PROGRESS & MILESTONE A PORTFOLIO GRID (2-Column Middle Section) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Card — Year 1 Mastery & Milestone A Portfolio Tracker */}
                <div
                  className={`lg:col-span-7 ${cardSurfaceClass} rounded-2xl p-6 flex flex-col justify-between space-y-6`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="font-display text-lg font-bold">
                        Year 1 Mastery &amp; Milestone A Portfolio Tracker
                      </h2>
                      <p className={`text-xs ${mutedTextClass}`}>
                        Complete verified independent calculations across all 5 core mechanics pillars.
                      </p>
                    </div>

                    {/* Circular Progress Ring */}
                    <div className="flex items-center gap-3">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200 dark:text-slate-800"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-emerald-500"
                          strokeDasharray="45, 100"
                          strokeWidth="3.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div>
                        <div className="font-display text-lg font-bold tabular-nums">
                          45%
                        </div>
                        <div className={`text-[11px] ${mutedTextClass}`}>
                          Module 0 Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5 Skill Progress Bars for Milestone A Verification */}
                  <div className="space-y-3.5">
                    {milestoneABars.map((bar) => {
                      const pct = Math.round(
                        (bar.completed / bar.target) * 100
                      );
                      return (
                        <div key={bar.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{bar.label}</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-sky-400 tabular-nums">
                              [{bar.completed}/{bar.target}]
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-200 ${
                                pct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.max(8, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Card — Recent Learning Sessions (Humanized) */}
                <div
                  className={`lg:col-span-5 ${cardSurfaceClass} rounded-2xl p-6 flex flex-col justify-between space-y-5`}
                >
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                      <h2 className="font-display text-lg font-bold">
                        Recent Learning Sessions
                      </h2>
                      <p className={`text-xs ${mutedTextClass}`}>
                        Jump back into any recent topic with 1 click.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {INITIAL_RECENT_SESSIONS.map((sess) => (
                        <div
                          key={sess.id}
                          className={`${subCardSurfaceClass} rounded-xl p-3.5 flex items-center justify-between gap-3`}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="text-sm font-bold truncate">
                              {sess.topicTitle}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className={`font-semibold ${
                                  sess.badgeTone === 'emerald'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {sess.badgeText}
                              </span>
                              <span className={mutedTextClass}>•</span>
                              <span className={mutedTextClass}>
                                {sess.relativeTime}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              startOrResumeTutor(
                                sess.targetStepId,
                                sess.topicTitle
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className={mutedTextClass}>
                      Study Rhythm: 3 focused sessions / week
                    </span>
                    <button
                      type="button"
                      onClick={() => startOrResumeTutor('summary')}
                      className="font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      View Session Summary →
                    </button>
                  </div>
                </div>
              </section>

              {/* 3. 3-CARD "ACTIVE PATHWAY" STRIP (Replaces the 20-Module Bottom Wall) */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Active Year 1 Learning Pathway
                    </h2>
                    <p className="text-xs text-slate-400">
                      Focused 3-module progression window — complete Module 0 to unlock Statics &amp; Equilibrium.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('map')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Explore Full 20-Module Learning Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1 (Active): Module 0 */}
                  <div
                    className={`${cardSurfaceClass} rounded-2xl p-6 flex flex-col justify-between space-y-5 ring-2 ring-blue-500/80`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-600 dark:text-sky-400">
                          ACTIVE MODULE • 45% COMPLETE
                        </span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          In Progress
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold">
                        Module 0: Engineering Maths, Units &amp; Physical Quantities
                      </h3>
                      <p className={`text-xs ${mutedTextClass} leading-relaxed`}>
                        Dimensional homogeneity, (mm, N) base unit conversions, right-triangle force resolution, and visual slope/area calculus.
                      </p>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: '45%' }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startOrResumeTutor('learn')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    >
                      Continue Module 0 →
                    </button>
                  </div>

                  {/* Card 2 (Next Up - Locked): Module 1 */}
                  <div
                    className={`${cardSurfaceClass} rounded-2xl p-6 flex flex-col justify-between space-y-5 opacity-90`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>NEXT UP • PREREQUISITE GATED</span>
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold">
                        🔒 Module 1: Statics, Equilibrium &amp; Load Paths
                      </h3>
                      <p className={`text-xs ${mutedTextClass} leading-relaxed`}>
                        Free-body diagrams, roller/pin/fixed support reactions, tributary floor loading, and vertical/lateral load paths.
                      </p>
                    </div>

                    <div className={`${subCardSurfaceClass} rounded-xl p-3 text-xs font-medium text-center ${mutedTextClass}`}>
                      Unlocks after mastering Module 0 Gate
                    </div>
                  </div>

                  {/* Card 3 (Upcoming - Locked): Module 2 */}
                  <div
                    className={`${cardSurfaceClass} rounded-2xl p-6 flex flex-col justify-between space-y-5 opacity-85`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>UPCOMING • STAGE 1 CORE</span>
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold">
                        🔒 Module 2: Internal Actions, Shear Force &amp; Bending Moment
                      </h3>
                      <p className={`text-xs ${mutedTextClass} leading-relaxed`}>
                        Method of sections, SFD/BMD construction, load-shear-moment relationships, and tension-face plotting.
                      </p>
                    </div>

                    <div className={`${subCardSurfaceClass} rounded-xl p-3 text-xs font-medium text-center ${mutedTextClass}`}>
                      Unlocks after Module 0 &amp; Module 1
                    </div>
                  </div>
                </div>
              </section>
            </main>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: LEARNING MAP & MASTER SYLLABUS (VISUAL ROADMAP)        */}
          {/* ============================================================== */}
          {activeView === 'map' && (
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-sky-400">
                    INTERACTIVE CURRICULUM ROADMAP • 20 MODULES
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Learning Map &amp; Master Syllabus
                  </h1>
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      placeholder="Search modules or topics..."
                      aria-label="Search modules or topics"
                      className="pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    {(['All', 'In Progress', 'Mastered', 'Locked'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setMapStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            mapStatusFilter === st
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* 1. STAGE FILTER TABS AT THE TOP */}
              <div
                role="tablist"
                aria-label="Syllabus Stage Filter Tabs"
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {(
                  [
                    {
                      stage: 1 as const,
                      title: 'Stage 1: Core Mechanics (Modules 0–6)',
                      sub: 'Units, Statics, SFD/BMD, Stress, Sections, Deflection & Buckling',
                    },
                    {
                      stage: 2 as const,
                      title: 'Stage 2: Structural Design & Eurocodes (Modules 7–11)',
                      sub: 'EN 1990 Combinations, EC3 Steel, EC5 Timber & EC6 Masonry',
                    },
                    {
                      stage: 3 as const,
                      title: 'Stage 3: Geotechnics & Advanced Structures (Modules 12–19)',
                      sub: 'Soil Mechanics, Foundations, EC2 Concrete, Frames & Temporary Works',
                    },
                  ]
                ).map((tab) => {
                  const isSelected = selectedStage === tab.stage;
                  return (
                    <button
                      key={tab.stage}
                      role="tab"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => setSelectedStage(tab.stage)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-display text-sm font-bold">
                        {tab.title}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {tab.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 2. UNIFIED ACCORDION ROADMAP (With Vertical Flow Connectors) */}
              <div className="space-y-0">
                {filteredSyllabusModules.map((mod, idx) => {
                  const isExpanded = Boolean(expandedModules[mod.moduleNumber]);
                  const isUnlocked = mod.status !== 'Locked';

                  return (
                    <React.Fragment key={mod.moduleNumber}>
                      {/* Vertical Prerequisite Connector Line (│ and ▼) */}
                      {idx > 0 && (
                        <div
                          aria-hidden="true"
                          className="flex flex-col items-center py-1 text-slate-600 select-none"
                        >
                          <div className="w-0.5 h-5 bg-slate-700" />
                          <div className="text-[10px] leading-none text-slate-500">
                            ▼
                          </div>
                        </div>
                      )}

                      <div
                        className={`${cardSurfaceClass} rounded-2xl overflow-hidden transition-all`}
                      >
                        {/* Module Accordion Header */}
                        <div
                          onClick={() =>
                            setExpandedModules((prev) => ({
                              ...prev,
                              [mod.moduleNumber]: !prev[mod.moduleNumber],
                            }))
                          }
                          className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-sm font-bold shrink-0 ${
                                isUnlocked
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isUnlocked ? (
                                `M${mod.moduleNumber}`
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-display text-base sm:text-lg font-bold">
                                  {mod.title}
                                </h2>
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                    mod.status === 'In Progress'
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300'
                                      : mod.status === 'Mastered'
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  {mod.status === 'In Progress'
                                    ? `In Progress • ${mod.progressPercent}%`
                                    : mod.status}
                                </span>
                              </div>
                              <p className={`text-xs ${mutedTextClass}`}>
                                {mod.subtitle} • {mod.durationWeeks} •{' '}
                                {mod.unlockRequirement}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectorTarget({
                                  moduleItem: mod,
                                  objectiveItem: null,
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              Details / Syllabus Info
                            </button>
                            <span className="p-1.5 text-slate-400">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Nested Learning Objectives (Inside the Module Accordion) */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/60 dark:bg-slate-950/40 space-y-2.5">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              NESTED LEARNING OBJECTIVES ({mod.objectives.length})
                            </div>
                            {mod.objectives.map((obj) => {
                              const objUnlocked = obj.status !== 'Locked';
                              return (
                                <div
                                  key={obj.code}
                                  className={`${subCardSurfaceClass} rounded-xl p-4 flex flex-wrap items-center justify-between gap-3`}
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-display text-sm font-bold">
                                        {obj.title}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                          obj.status === 'Mastered'
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                            : obj.status === 'Up Next' ||
                                              obj.status === 'In Progress'
                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {obj.status === 'Mastered'
                                          ? '✅ Mastered'
                                          : obj.status === 'Up Next'
                                          ? '🎯 Up Next'
                                          : '🔒 Locked'}
                                      </span>
                                    </div>
                                    <p className={`text-xs ${mutedTextClass}`}>
                                      {obj.summary}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setInspectorTarget({
                                          moduleItem: mod,
                                          objectiveItem: obj,
                                        })
                                      }
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                                    >
                                      Details / Syllabus Info
                                    </button>
                                    {objUnlocked && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startOrResumeTutor(
                                            obj.code === '0.1' ? 'learn' : '1a',
                                            obj.title
                                          )
                                        }
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white cursor-pointer"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>Practice</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </main>
          )}

          <footer className="mt-auto border-t border-slate-800/80 px-6 py-3 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>StructTutor personal structural engineering tutor</span>
            <span className="font-mono">
              Version {APP_VERSION}, built {APP_BUILD_DATE}
            </span>
          </footer>
        </div>

        {/* ================================================================ */}
        {/* SLIDE-OVER DRAWERS & SELF-VERIFICATION SUITE                     */}
        {/* ================================================================ */}
        <WorkedSolutionDrawer
          isOpen={workedSolutionDrawerOpen}
          onClose={() => setWorkedSolutionDrawerOpen(false)}
          question={activeQuestion}
          fullSolutionUnlocked={Boolean(
            fullSolutionUnlockedByStep[currentStep] || gradeOutcome?.isCorrect
          )}
          onUnlockFullSolution={() =>
            setFullSolutionUnlockedByStep((prev) => ({
              ...prev,
              [currentStep]: true,
            }))
          }
        />

        <UnitsReferenceDrawer
          isOpen={unitsDrawerOpen}
          onClose={() => setUnitsDrawerOpen(false)}
        />

        <CalculatorPopover
          isOpen={calculatorOpen}
          onClose={() => setCalculatorOpen(false)}
          onCopyResultToInput={
            activeView === 'tutor' &&
            currentStep !== 'learn' &&
            currentStep !== 'summary'
              ? (val) => setAnswerInput(val)
              : undefined
          }
        />

        <SyllabusInspectorDrawer
          moduleItem={inspectorTarget?.moduleItem ?? null}
          objectiveItem={inspectorTarget?.objectiveItem ?? null}
          onClose={() => setInspectorTarget(null)}
          onStartTopic={() => {
            const title =
              inspectorTarget?.objectiveItem?.title ??
              inspectorTarget?.moduleItem.title;
            startOrResumeTutor('learn', title);
          }}
        />

        <VerificationSelfTestDrawer
          checks={verificationChecks}
          onQuickJumpQuestion2a={() => goToTutorStep('2a')}
          onSimulateTwoStrikeRemedial={handleSimulateTwoStrikeOn2a}
        />
      </div>
    </div>
  );
}
