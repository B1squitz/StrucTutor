import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Map,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  Sliders,
  Sun,
} from 'lucide-react';
import {
  APP_BUILD_DATE,
  APP_VERSION,
  GradeOutcome,
  INITIAL_MILESTONE_A_BARS,
  MilestoneSkillBar,
  ObjectiveItem,
  SESSION_QUESTIONS,
  StepId,
  StepStatus,
  SyllabusModuleItem,
  computeAdaptiveTransition,
  convertEngineeringUnit,
  evaluateQuestionAttempt,
} from './utils/tutorEngine';
import {
  ALL_SYLLABUS_MODULES,
  getModuleByNumber,
  getTopicById,
} from './data/fullSyllabus';
import {
  COURSE_DEVELOPMENT_REQUIREMENTS,
  FIVE_STUDY_RULES,
} from './data/syllabusMetadata';
import {
  AssessmentSubmissionResult,
  CourseProgressState,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from './types/syllabus';
import {
  computeCourseProgressSummary,
  loadCourseProgressState,
  recordAssessmentAttempt,
  resetCourseProgressState,
  saveCourseProgressState,
} from './utils/assessmentEngine';
import { AssessmentView } from './components/AssessmentView';
import { CoverageAndMilestonesView } from './components/CoverageAndMilestonesView';
import { MathFraction, UnitBadge } from './components/MathFormula';
import { QuestionDiagram } from './components/QuestionDiagram';
import { WorkedSolutionDrawer } from './components/WorkedSolutionDrawer';
import {
  CalculatorPopover,
  SyllabusInspectorDrawer,
  UnitsReferenceDrawer,
} from './components/UtilityModals';

type MainView = 'dashboard' | 'tutor' | 'map' | 'coverage' | 'assessment';

interface ActiveAssessmentTarget {
  moduleNumber: number;
  topicId?: string; // undefined means End-of-Module Assessment
}

function getModuleStage(moduleNumber: number): 1 | 2 | 3 {
  if (moduleNumber <= 8) return 1;
  if (moduleNumber <= 14) return 2;
  return 3;
}

function toLegacyModuleItem(
  mod: NormalizedSyllabusModule,
  progressState: CourseProgressState
): SyllabusModuleItem {
  const modProg = progressState.modules[mod.id];
  const passedTopics = mod.topics.filter(
    (t) => progressState.topics[t.id]?.passed
  ).length;
  const anyAttempted =
    (modProg?.attemptsCount ?? 0) > 0 ||
    mod.topics.some((t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0);

  return {
    moduleNumber: mod.moduleNumber,
    stage: getModuleStage(mod.moduleNumber),
    title: mod.title,
    subtitle: mod.summary,
    durationWeeks: mod.suggestedDuration ?? mod.yearPathway ?? '6–10 weeks',
    status: modProg?.passed
      ? 'Mastered'
      : anyAttempted || mod.moduleNumber === 0
      ? 'In Progress'
      : 'Locked',
    progressPercent: modProg?.passed
      ? 100
      : mod.topics.length > 0
      ? Math.round((passedTopics / mod.topics.length) * 100)
      : 0,
    unlockRequirement: `Syllabus Gate: ${mod.learningGate}`,
    overview: `${mod.summary} ${mod.whyItMatters}`,
    eurocodeReference:
      mod.standardsNotice ??
      mod.topics[0]?.futureContentNote ??
      'Prepared for personal textbook and Eurocode / UK National Annex excerpts.',
    keyFormulas: mod.objectives.slice(0, 4),
    objectives: mod.topics.map((t) => {
      const tProg = progressState.topics[t.id];
      return {
        code: t.code,
        title: `${t.code} ${t.title}`,
        durationMins: 25,
        status: tProg?.passed
          ? 'Mastered'
          : (tProg?.attemptsCount ?? 0) > 0
          ? 'In Progress'
          : 'Up Next',
        questionsCount: t.assessmentQuestions.length,
        summary: t.summary,
        keyFormulas: t.subtopics.slice(0, 4),
        eurocodeContext: `Topic Assessment: ${t.assessmentQuestions.length} Questions (90% Pass Mark) • Module Gate: ${mod.learningGate}`,
      };
    }),
  };
}

export default function App() {
  // 1. Course Progress State (starts at 0% with 0 completed modules and 0 attempts on fresh load)
  const [progressState, setProgressState] = useState<CourseProgressState>(() =>
    loadCourseProgressState(ALL_SYLLABUS_MODULES)
  );

  useEffect(() => {
    saveCourseProgressState(progressState);
  }, [progressState]);

  const progressSummary = useMemo(
    () => computeCourseProgressSummary(progressState, ALL_SYLLABUS_MODULES),
    [progressState]
  );

  // 2. Shell Layout & Hybrid Light-Card Polish State (defaults to true for the signature white-card / dark-shell look)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [hybridLightCards, setHybridLightCards] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<MainView>('dashboard');
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // 3. Active Module & Topic Selection (across all 20 Modules 0..19)
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number>(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('M0-T1');
  const [topicSwitcherOpen, setTopicSwitcherOpen] = useState<boolean>(false);
  const [assessmentTarget, setAssessmentTarget] =
    useState<ActiveAssessmentTarget | null>(null);

  const activeModule = useMemo(
    () =>
      getModuleByNumber(selectedModuleNumber) ?? ALL_SYLLABUS_MODULES[0],
    [selectedModuleNumber]
  );

  const activeTopic = useMemo(
    () =>
      activeModule.topics.find((t) => t.id === selectedTopicId) ??
      activeModule.topics[0],
    [activeModule, selectedTopicId]
  );

  // 4. Interactive Unit & Bending Stress Sandbox State (Card 2 on [📖 Learn])
  const [sandboxMomentKnm, setSandboxMomentKnm] = useState<string>('18');
  const [sandboxWelMm3, setSandboxWelMm3] = useState<string>('666666.7');

  const sandboxComputed = useMemo(() => {
    const mVal = Number(sandboxMomentKnm);
    const wVal = Number(sandboxWelMm3);
    if (!Number.isFinite(mVal) || !Number.isFinite(wVal) || wVal <= 0) {
      return { momentNmm: '—', stressMpa: '—', stressGpa: '—' };
    }
    const nmm = convertEngineeringUnit(mVal, 'kN·m', 'N·mm');
    const sigma = nmm / wVal;
    return {
      momentNmm: nmm.toLocaleString('en-GB', { maximumFractionDigits: 0 }),
      stressMpa: Number(sigma.toPrecision(4)).toString(),
      stressGpa: Number((sigma / 1000).toPrecision(4)).toString(),
    };
  }, [sandboxMomentKnm, sandboxWelMm3]);

  // 5. Stepped Tutor State ([📖 Learn], [1a]..[5a], [🏁 Summary])
  const [currentStep, setCurrentStep] = useState<StepId>('learn');
  const [remedialInjected, setRemedialInjected] = useState<boolean>(false);
  const [stepStatuses, setStepStatuses] = useState<Record<StepId, StepStatus>>({
    learn: 'active',
    '1a': 'unseen',
    '1b': 'unseen',
    '2a': 'unseen',
    '2a-R': 'unseen',
    '2b': 'unseen',
    '2c': 'unseen',
    '3': 'unseen',
    '4': 'unseen',
    '5a': 'unseen',
    summary: 'unseen',
  });
  const [answerInput, setAnswerInput] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('N·mm');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [fullSolutionUnlockedByStep, setFullSolutionUnlockedByStep] = useState<
    Record<string, boolean>
  >({});
  const [failuresByStep, setFailuresByStep] = useState<Record<string, number>>(
    {}
  );
  const [gradeOutcome, setGradeOutcome] = useState<GradeOutcome | null>(null);
  const [adaptiveBanner, setAdaptiveBanner] = useState<string | null>(null);
  const [workedSolutionDrawerOpen, setWorkedSolutionDrawerOpen] =
    useState<boolean>(false);
  const [unitsDrawerOpen, setUnitsDrawerOpen] = useState<boolean>(false);
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);

  // 6. Milestone A Skill Bars (all start at 0, increment on genuine practice/assessments)
  const [milestoneBars, setMilestoneBars] = useState<MilestoneSkillBar[]>(
    INITIAL_MILESTONE_A_BARS
  );
  const [creditedQuestions, setCreditedQuestions] = useState<
    Record<string, boolean>
  >({});

  // 7. Unified Visual Learning Map State
  const [mapStageFilter, setMapStageFilter] = useState<'all' | 1 | 2 | 3>(
    'all'
  );
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapStatusFilter, setMapStatusFilter] = useState<
    'all' | 'not-started' | 'in-progress' | 'passed'
  >('all');
  const [expandedMapModules, setExpandedMapModules] = useState<
    Record<number, boolean>
  >({
    0: true,
  });
  const [inspectorDrawerTarget, setInspectorDrawerTarget] = useState<{
    moduleItem: SyllabusModuleItem;
    objectiveItem: ObjectiveItem | null;
    moduleNumber: number;
    topicId?: string;
  } | null>(null);

  const visibleSteps = useMemo<StepId[]>(() => {
    return [
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
  }, [remedialInjected]);

  const activeQuestion =
    currentStep !== 'learn' && currentStep !== 'summary'
      ? SESSION_QUESTIONS[currentStep]
      : SESSION_QUESTIONS['1a'];

  const completedStepsCount = useMemo(() => {
    return visibleSteps.filter(
      (s) => stepStatuses[s] === 'mastered' || stepStatuses[s] === 'assisted'
    ).length;
  }, [visibleSteps, stepStatuses]);

  const tutorProgressPercent = Math.round(
    (completedStepsCount / visibleSteps.length) * 100
  );

  // Navigation & Action Handlers
  const handleSelectModuleAndTopic = (
    moduleNumber: number,
    topicId?: string,
    targetView: MainView = 'tutor'
  ) => {
    const mod = getModuleByNumber(moduleNumber) ?? ALL_SYLLABUS_MODULES[0];
    setSelectedModuleNumber(mod.moduleNumber);
    const chosenTopic = topicId
      ? mod.topics.find((t) => t.id === topicId) ?? mod.topics[0]
      : mod.topics[0];
    if (chosenTopic) {
      setSelectedTopicId(chosenTopic.id);
    }
    setTopicSwitcherOpen(false);
    if (targetView === 'tutor') {
      setCurrentStep('learn');
      setGradeOutcome(null);
      setAdaptiveBanner(null);
    }
    if (targetView === 'map') {
      setExpandedMapModules((prev) => ({ ...prev, [mod.moduleNumber]: true }));
    }
    setActiveView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModuleInMap = (moduleNumber: number) => {
    const mod = getModuleByNumber(moduleNumber) ?? ALL_SYLLABUS_MODULES[0];
    setSelectedModuleNumber(mod.moduleNumber);
    if (mod.topics[0]) setSelectedTopicId(mod.topics[0].id);
    setMapStageFilter('all');
    setExpandedMapModules((prev) => ({ ...prev, [mod.moduleNumber]: true }));
    setActiveView('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTopicAssessment = (
    module: NormalizedSyllabusModule,
    topic: SyllabusTopic
  ) => {
    setSelectedModuleNumber(module.moduleNumber);
    setSelectedTopicId(topic.id);
    setAssessmentTarget({
      moduleNumber: module.moduleNumber,
      topicId: topic.id,
    });
    setActiveView('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartModuleAssessment = (module: NormalizedSyllabusModule) => {
    setSelectedModuleNumber(module.moduleNumber);
    if (module.topics[0]) setSelectedTopicId(module.topics[0].id);
    setAssessmentTarget({
      moduleNumber: module.moduleNumber,
      topicId: undefined,
    });
    setActiveView('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteAssessmentAttempt = (
    targetModule: NormalizedSyllabusModule,
    targetTopic: SyllabusTopic | undefined,
    result: AssessmentSubmissionResult
  ) => {
    const isTopic = Boolean(targetTopic);
    const title = targetTopic
      ? `Mod ${targetModule.moduleNumber} • Topic ${targetTopic.code}: ${targetTopic.title}`
      : `Module ${targetModule.moduleNumber} End-of-Module Assessment: ${targetModule.shortTitle}`;

    setProgressState((prev) =>
      recordAssessmentAttempt(prev, {
        assessmentId: result.assessmentId,
        assessmentType: isTopic ? 'topic' : 'module',
        moduleId: targetModule.id,
        moduleNumber: targetModule.moduleNumber,
        topicId: targetTopic?.id,
        title,
        scorePercent: result.scorePercent,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        passed: result.passed,
        timestampIso: result.submittedAtIso,
      })
    );
  };

  const handleResetAllProgress = () => {
    const fresh = resetCourseProgressState(ALL_SYLLABUS_MODULES);
    setProgressState(fresh);
    setMilestoneBars(INITIAL_MILESTONE_A_BARS);
    setCreditedQuestions({});
    setStepStatuses({
      learn: 'active',
      '1a': 'unseen',
      '1b': 'unseen',
      '2a': 'unseen',
      '2a-R': 'unseen',
      '2b': 'unseen',
      '2c': 'unseen',
      '3': 'unseen',
      '4': 'unseen',
      '5a': 'unseen',
      summary: 'unseen',
    });
    setRemedialInjected(false);
    setFailuresByStep({});
    setFullSolutionUnlockedByStep({});
    setGradeOutcome(null);
    setAdaptiveBanner(null);
    setConfirmResetOpen(false);
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckTutorAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 'learn' || currentStep === 'summary') return;
    const q = SESSION_QUESTIONS[currentStep];
    try {
      const outcome = evaluateQuestionAttempt(q, answerInput, selectedUnit);
      setGradeOutcome(outcome);
      const prevFails = failuresByStep[currentStep] ?? 0;
      const newFailCount = outcome.isCorrect ? prevFails : prevFails + 1;
      if (!outcome.isCorrect) {
        setFailuresByStep((prev) => ({ ...prev, [currentStep]: newFailCount }));
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
      if (transition.remedialInjected) setRemedialInjected(true);
      if (transition.autoRevealWorkedSolution) {
        setFullSolutionUnlockedByStep((prev) => ({
          ...prev,
          [currentStep]: true,
        }));
      }
      setAdaptiveBanner(transition.adaptiveBannerMessage);

      if (outcome.isCorrect && !creditedQuestions[currentStep]) {
        setCreditedQuestions((prev) => ({ ...prev, [currentStep]: true }));
        setMilestoneBars((prev) =>
          prev.map((bar) =>
            bar.id === q.milestoneCategory
              ? { ...bar, completed: Math.min(bar.target, bar.completed + 1) }
              : bar
          )
        );
      }
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
            : 'Enter a number before checking.',
        unitConversionNote: '',
      });
    }
  };

  const handleAdvanceToNextStep = () => {
    const idx = visibleSteps.indexOf(currentStep);
    if (idx >= 0 && idx < visibleSteps.length - 1) {
      if (currentStep === 'learn' && stepStatuses.learn === 'active') {
        setStepStatuses((prev) => ({ ...prev, learn: 'mastered' }));
      }
      goToTutorStep(visibleSteps[idx + 1]);
    }
  };

  // Resolve active assessment target if in 'assessment' view
  const resolvedAssessment = useMemo(() => {
    if (!assessmentTarget) return null;
    const mod = getModuleByNumber(assessmentTarget.moduleNumber);
    if (!mod) return null;
    if (assessmentTarget.topicId) {
      const top = mod.topics.find((t) => t.id === assessmentTarget.topicId);
      if (!top) return null;
      return {
        module: mod,
        topic: top,
        questions: top.assessmentQuestions,
      };
    }
    return {
      module: mod,
      topic: undefined,
      questions: mod.moduleAssessment,
    };
  }, [assessmentTarget]);

  // Filtered Modules for Unified Visual Learning Map
  const filteredMapModules = useMemo(() => {
    return ALL_SYLLABUS_MODULES.filter((mod) => {
      const stage = getModuleStage(mod.moduleNumber);
      if (mapStageFilter !== 'all' && stage !== mapStageFilter) return false;

      const modProg = progressState.modules[mod.id];
      const anyAttempted =
        (modProg?.attemptsCount ?? 0) > 0 ||
        mod.topics.some(
          (t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
        );
      const isPassed = Boolean(modProg?.passed);

      if (mapStatusFilter === 'passed' && !isPassed) return false;
      if (
        mapStatusFilter === 'in-progress' &&
        (!anyAttempted || isPassed)
      )
        return false;
      if (
        mapStatusFilter === 'not-started' &&
        (anyAttempted || isPassed)
      )
        return false;

      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase();
        const matchesModule =
          mod.title.toLowerCase().includes(q) ||
          mod.summary.toLowerCase().includes(q) ||
          mod.learningGate.toLowerCase().includes(q);
        const matchesTopic = mod.topics.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q)
        );
        if (!matchesModule && !matchesTopic) return false;
      }

      return true;
    });
  }, [mapStageFilter, mapStatusFilter, mapSearchQuery, progressState]);

  // Circular SVG Ring Geometry for Hero Card
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference -
    (progressSummary.overallProgressPercent / 100) * ringCircumference;

  return (
    <div className={hybridLightCards ? '' : 'dark'}>
      <div className="min-h-screen bg-[#0B1120] text-slate-100 flex font-sans">
        {/* ================================================================= */}
        {/* LEFT COLLAPSIBLE SIDEBAR (Original Polished Navigation Rail)      */}
        {/* ================================================================= */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } shrink-0 bg-slate-900/95 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-200 sticky top-0 h-screen z-30`}
        >
          {/* Top Brand + Primary Nav */}
          <div className="p-3 space-y-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                className="flex items-center gap-2.5 text-left cursor-pointer overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="font-display text-base font-bold tracking-tight text-white truncate">
                      StructTutor
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      UK Structural Mechanics
                    </div>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={
                  sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Primary Navigation Links */}
            <nav className="space-y-1.5" aria-label="Primary Navigation">
              <button
                type="button"
                onClick={() => setActiveView('dashboard')}
                data-testid="nav-dashboard"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Home Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Home Dashboard</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('tutor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-testid="nav-tutor"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'tutor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Tutor & Guided Practice"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Tutor / Practice</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-testid="nav-course"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'map' || activeView === 'assessment'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Unified Visual Learning Map (Modules 0 to 19)"
              >
                <Map className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Learning Map (Mod 0–19)</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('coverage');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-testid="nav-coverage"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'coverage'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Syllabus Coverage Map & Milestones A–F"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Coverage &amp; Milestones</span>}
              </button>
            </nav>

            {/* Quick Utilities & Card Theme Polish Switch */}
            {!sidebarCollapsed && (
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Workbench Utilities
                </div>
                <button
                  type="button"
                  onClick={() => setUnitsDrawerOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Units Reference Drawer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculatorOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Scratchpad Calculator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHybridLightCards((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {hybridLightCards ? (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <span>
                      {hybridLightCards ? 'Hybrid Light Cards' : 'Dark Cards'}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Switch
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Sidebar Course Progress & Version Summary */}
          <div className="p-3 border-t border-slate-800/90 space-y-2.5 text-xs">
            {!sidebarCollapsed ? (
              <div className="rounded-xl bg-slate-950/90 border border-slate-800/90 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Overall Mastery</span>
                  <span className="font-bold text-sky-400">
                    {progressSummary.overallProgressPercent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${progressSummary.overallProgressPercent}%`,
                    }}
                  />
                </div>
                <div className="space-y-0.5 text-[11px] font-mono text-slate-400 pt-0.5">
                  <div>
                    Modules Passed: {progressSummary.completedModulesCount}/
                    {progressSummary.totalModulesCount}
                  </div>
                  <div>
                    Topics Passed: {progressSummary.passedTopicsCount}/
                    {progressSummary.totalTopicsCount}
                  </div>
                  <div>
                    Saved Attempts: {progressSummary.totalAttemptsCount}
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 leading-snug">
                  <div>
                    StructTutor v{APP_VERSION} ({APP_BUILD_DATE})
                  </div>
                  <div>
                    Educational portfolio only. Independent check required.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center font-mono text-[11px] font-bold text-sky-400">
                {progressSummary.overallProgressPercent}%
              </div>
            )}
          </div>
        </aside>

        {/* ================================================================= */}
        {/* MAIN WORKSPACE CONTENT AREA                                       */}
        {/* ================================================================= */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8 overflow-y-auto">
          {/* =============================================================== */}
          {/* VIEW 1: CONSOLIDATED HOME DASHBOARD (max-w-[1200px] mx-auto)    */}
          {/* =============================================================== */}
          {activeView === 'dashboard' && (
            <div
              className="max-w-[1200px] mx-auto space-y-6"
              data-testid="dashboard-view"
            >
              {/* 1. HERO RESUME / START CARD WITH CIRCULAR SVG RING */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 border border-blue-500/30 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/15 text-sky-200 border border-white/15">
                      Stage {getModuleStage(activeModule.moduleNumber)} • Module{' '}
                      {activeModule.moduleNumber} Active
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950/40 text-slate-200 border border-white/10">
                      {activeModule.suggestedDuration ??
                        activeModule.yearPathway ??
                        '6–10 weeks'}{' '}
                      • 90% Assessment Pass Standard
                    </span>
                  </div>

                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {activeModule.title}
                    </h1>
                    <p className="text-sm text-blue-100/90 mt-1.5 leading-relaxed">
                      {activeModule.summary}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/35 border border-white/10 p-3.5 text-xs text-blue-100 space-y-1">
                    <div className="font-semibold text-sky-200">
                      Active Topic {activeTopic.code}: {activeTopic.title}
                    </div>
                    <div className="text-blue-100/80">
                      <strong>Syllabus Learning Gate:</strong>{' '}
                      {activeModule.learningGate}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep('learn');
                        setActiveView('tutor');
                      }}
                      data-testid="hero-start-tutor-btn"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-blue-900 hover:bg-blue-50 shadow-sm transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-blue-900" />
                      <span>
                        Start / Resume Module {activeModule.moduleNumber} Tutor
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleStartTopicAssessment(activeModule, activeTopic)
                      }
                      data-testid="hero-start-topic-exam-btn"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600/80 hover:bg-blue-500 text-white border border-white/20 transition-colors cursor-pointer"
                    >
                      <span>
                        Topic {activeTopic.code} Assessment (
                        {activeTopic.assessmentQuestions.length} Qs)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartModuleAssessment(activeModule)}
                      data-testid="hero-start-module-exam-btn"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900/70 hover:bg-slate-900 text-sky-200 border border-white/15 transition-colors cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>
                        Module {activeModule.moduleNumber} Exam (
                        {activeModule.moduleAssessment.length} Qs • 90% Pass)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenModuleInMap(selectedModuleNumber)}
                      data-testid="dashboard-open-syllabus-btn"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900/40 hover:bg-slate-900/70 text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      <span>Open in Learning Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Circular SVG Progress Ring (0% Initial Progress) */}
                <div className="flex items-center gap-5 bg-slate-950/40 border border-white/15 rounded-2xl p-5 shrink-0 self-start lg:self-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg
                      className="w-28 h-28 -rotate-90"
                      viewBox="0 0 112 112"
                      aria-label={`Overall course progress ${progressSummary.overallProgressPercent}%`}
                    >
                      <circle
                        cx="56"
                        cy="56"
                        r={ringRadius}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="9"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={ringRadius}
                        stroke="#38BDF8"
                        strokeWidth="9"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span
                        className="font-display text-2xl font-bold text-white tabular-nums"
                        data-testid="overall-progress-percent"
                      >
                        {progressSummary.overallProgressPercent}%
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-200">
                        Mastered
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-semibold text-white">
                      Course Gate Progress
                    </div>
                    <div className="font-mono text-sky-200">
                      <span data-testid="completed-modules-count">
                        {progressSummary.completedModulesCount} /{' '}
                        {progressSummary.totalModulesCount}
                      </span>{' '}
                      Modules
                    </div>
                    <div className="font-mono text-emerald-300">
                      <span data-testid="passed-topics-count">
                        {progressSummary.passedTopicsCount} /{' '}
                        {progressSummary.totalTopicsCount}
                      </span>{' '}
                      Topics
                    </div>
                    <div className="font-mono text-slate-300">
                      <span data-testid="total-attempts-count">
                        {progressSummary.totalAttemptsCount}
                      </span>{' '}
                      Attempts
                    </div>
                    <div className="pt-1">
                      {!confirmResetOpen ? (
                        <button
                          type="button"
                          onClick={() => setConfirmResetOpen(true)}
                          data-testid="reset-progress-trigger"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white underline cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Progress</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={handleResetAllProgress}
                            data-testid="confirm-reset-progress-btn"
                            className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                          >
                            Confirm 0%
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetOpen(false)}
                            className="px-1.5 py-0.5 rounded text-[11px] text-slate-300 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. TWO-COLUMN MIDDLE GRID: MILESTONE TRACKER & RECENT SESSIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card: Core Mechanics & Portfolio Milestones Tracker */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          Core Mechanics &amp; Portfolio Verification
                        </span>
                        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          Year 1 Mastery &amp; Milestone A–F Portfolio Tracker
                        </h2>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {milestoneBars.reduce((acc, b) => acc + b.completed, 0)}{' '}
                        / {milestoneBars.reduce((acc, b) => acc + b.target, 0)}{' '}
                        Core Checks
                      </span>
                    </div>

                    <div className="space-y-3">
                      {milestoneBars.map((bar) => {
                        const pct = Math.round(
                          (bar.completed / bar.target) * 100
                        );
                        return (
                          <div key={bar.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {bar.label}
                              </span>
                              <span className="font-mono text-slate-500 dark:text-slate-400">
                                {bar.completed}/{bar.target} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {bar.unitDescription}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {COURSE_DEVELOPMENT_REQUIREMENTS.slice(0, 3).map((req) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() =>
                            handleSelectModuleAndTopic(
                              req.targetModules[0],
                              undefined,
                              'tutor'
                            )
                          }
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          [UI1] {req.topic}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveView('coverage')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      <span>Inspect Milestones A–F &amp; Coverage Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Card: Recent Learning & Assessment Sessions (Zero Fabricated Activity) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                          Verified Activity Log
                        </span>
                        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          Recent Learning &amp; Assessment Sessions
                        </h2>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {progressState.attemptHistory.length} saved
                      </span>
                    </div>

                    {progressState.attemptHistory.length === 0 ? (
                      <div
                        data-testid="empty-attempt-history"
                        className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-6 text-center space-y-2.5"
                      >
                        <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No sessions or assessment attempts recorded yet
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          All course progress starts at 0% with zero fabricated
                          activity. Complete a guided lesson or submit any Topic
                          (5 Qs) or Module (20 Qs) Assessment to log your
                          progress here.
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentStep('learn');
                              setActiveView('tutor');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start First Lesson (Module 0)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1"
                        data-testid="attempt-history-list"
                      >
                        {progressState.attemptHistory.slice(0, 12).map((att) => (
                          <div
                            key={att.attemptId}
                            className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                                    att.passed
                                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                                  }`}
                                >
                                  {att.passed
                                    ? 'PASSED (≥90%)'
                                    : 'NOT PASSED (<90%)'}
                                </span>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                  {att.correctCount}/{att.totalQuestions} (
                                  {att.scorePercent.toFixed(0)}%)
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {att.title}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const mod = getModuleByNumber(att.moduleNumber);
                                if (!mod) return;
                                if (att.topicId) {
                                  const found = getTopicById(att.topicId);
                                  if (found) {
                                    handleStartTopicAssessment(
                                      found.module,
                                      found.topic
                                    );
                                    return;
                                  }
                                }
                                handleStartModuleAssessment(mod);
                              }}
                              className="text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline shrink-0 cursor-pointer"
                            >
                              Retake →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Pass threshold: 90% on all assessments</span>
                    <button
                      type="button"
                      onClick={() => setActiveView('map')}
                      className="font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Open Learning Map →
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. COMPLETE 20-MODULE SYLLABUS PATHWAY CARDS (Modules 0 to 19) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Active Syllabus Pathway: Modules 0 to 19
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Open any module in the Guided Tutor, inspect its topics in
                      the Unified Learning Map, or launch its 20-question
                      End-of-Module Exam (90% pass mark).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('map')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    <span>Open Unified Visual Learning Map (Stages 1–3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  data-testid="dashboard-modules-grid"
                >
                  {ALL_SYLLABUS_MODULES.map((mod) => {
                    const modProg = progressState.modules[mod.id];
                    const passedTopics = mod.topics.filter(
                      (t) => progressState.topics[t.id]?.passed
                    ).length;
                    const anyTopicAttempted = mod.topics.some(
                      (t) => (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
                    );
                    const isCompleted = Boolean(modProg?.passed);
                    const isAttempted =
                      (modProg?.attemptsCount ?? 0) > 0 || anyTopicAttempted;

                    return (
                      <div
                        key={mod.id}
                        data-testid={`dashboard-module-card-${mod.moduleNumber}`}
                        className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                          isCompleted
                            ? 'border-emerald-400 dark:border-emerald-500/50'
                            : isAttempted
                            ? 'border-amber-400 dark:border-amber-500/50'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                              Module {mod.moduleNumber}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg ${
                                isCompleted
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                  : isAttempted
                                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {isCompleted
                                ? `Passed (${modProg.bestScorePercent.toFixed(
                                    0
                                  )}%)`
                                : isAttempted
                                ? 'In Progress'
                                : 'Not Started'}
                            </span>
                          </div>

                          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {mod.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {mod.summary}
                          </p>
                        </div>

                        <div className="space-y-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span>
                              Topics: {passedTopics}/{mod.topics.length} passed
                            </span>
                            <span>
                              Exam:{' '}
                              {modProg?.attemptsCount
                                ? `${modProg.bestScorePercent.toFixed(0)}%`
                                : '0%'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectModuleAndTopic(
                                  mod.moduleNumber,
                                  mod.topics[0]?.id,
                                  'tutor'
                                )
                              }
                              data-testid={`open-module-btn-${mod.moduleNumber}`}
                              className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            >
                              Study Module
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartModuleAssessment(mod)}
                              data-testid={`quick-exam-btn-${mod.moduleNumber}`}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                              title={`Start Module ${mod.moduleNumber} End-of-Module Assessment (20 Questions)`}
                            >
                              20-Q Exam
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 2: POLISHED STEPPED TUTOR & PRACTICE (max-w-[920px])       */}
          {/* =============================================================== */}
          {activeView === 'tutor' && (
            <div
              className="max-w-[920px] mx-auto space-y-5"
              data-testid="tutor-view"
            >
              {/* 1. COMPACT TOP SESSION HEADER WITH TOPIC SWITCHER POPOVER */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 relative">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveView('dashboard')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTopicSwitcherOpen((prev) => !prev)}
                      data-testid="tutor-topic-switcher-btn"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <span className="font-mono font-bold">
                        Mod {activeModule.moduleNumber} • Topic{' '}
                        {activeTopic.code}
                      </span>
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {activeTopic.title}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    {/* Switch Module / Topic Popover (All 20 Modules & 62 Topics) */}
                    {topicSwitcherOpen && (
                      <div className="absolute left-0 mt-2 w-[340px] sm:w-[460px] max-h-[420px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-40 space-y-2">
                        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Switch Module or Topic (Modules 0 to 19)
                          </span>
                          <button
                            type="button"
                            onClick={() => setTopicSwitcherOpen(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                        {ALL_SYLLABUS_MODULES.map((mod) => (
                          <div
                            key={mod.id}
                            className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {mod.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTopicSwitcherOpen(false);
                                  handleStartModuleAssessment(mod);
                                }}
                                className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-500 shrink-0 cursor-pointer"
                              >
                                20-Q Exam
                              </button>
                            </div>
                            <div className="space-y-1">
                              {mod.topics.map((top) => {
                                const isCurrent =
                                  mod.moduleNumber ===
                                    activeModule.moduleNumber &&
                                  top.id === activeTopic.id;
                                const passed =
                                  progressState.topics[top.id]?.passed;
                                return (
                                  <div
                                    key={top.id}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectModuleAndTopic(
                                          mod.moduleNumber,
                                          top.id,
                                          'tutor'
                                        )
                                      }
                                      className={`flex-1 text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                        isCurrent
                                          ? 'bg-blue-50 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 font-semibold'
                                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      <span className="font-mono font-bold mr-1.5">
                                        {top.code}
                                      </span>
                                      <span>{top.title}</span>
                                      {passed && (
                                        <span className="ml-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                          ✓ 90%+
                                        </span>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTopicSwitcherOpen(false);
                                        handleStartTopicAssessment(mod, top);
                                      }}
                                      className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
                                    >
                                      5-Q Quiz
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Utilities: Topic Exam, Module Exam, Units Reference, Calculator */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleStartTopicAssessment(activeModule, activeTopic)
                    }
                    data-testid="tutor-launch-topic-exam-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  >
                    <span>
                      Topic {activeTopic.code} Exam (
                      {activeTopic.assessmentQuestions.length} Qs)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartModuleAssessment(activeModule)}
                    data-testid="tutor-launch-module-exam-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      Mod {activeModule.moduleNumber} Exam (
                      {activeModule.moduleAssessment.length} Qs)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitsDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                    <span className="hidden sm:inline">Units</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculatorOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Calculator</span>
                  </button>
                </div>
              </div>

              {/* 2. HORIZONTAL STEPPED QUESTION BAR + CONTINUOUS VISUAL PROGRESS BAR */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div
                    className="flex flex-wrap items-center gap-1.5"
                    role="tablist"
                    aria-label="Lesson and Practice Steps"
                  >
                    {visibleSteps.map((stepId) => {
                      const isCurrent = currentStep === stepId;
                      const status = stepStatuses[stepId];
                      return (
                        <button
                          key={stepId}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          onClick={() => goToTutorStep(stepId)}
                          data-testid={`tutor-step-${stepId}`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : status === 'mastered'
                              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : status === 'assisted'
                              ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {stepId === 'learn'
                            ? 'Learn'
                            : stepId === 'summary'
                            ? 'Summary'
                            : stepId === '2a-R'
                            ? '2a-R Warm-Up'
                            : stepId}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Session Progress: {tutorProgressPercent}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-sky-500 transition-all duration-300"
                    style={{ width: `${tutorProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3. STEP CONTENT: [📖 Learn] (3 DIGESTIBLE CONCEPT CARDS) */}
              {currentStep === 'learn' && (
                <div className="space-y-5" data-testid="tutor-learn-cards">
                  {/* CARD A: PLAIN-ENGLISH CONCEPT, SUBTOPICS & STRUCTURAL INTUITION */}
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                        Card 1 of 3 • Plain-English Concept &amp; Syllabus Scope
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Module {activeModule.moduleNumber} • Topic{' '}
                        {activeTopic.code}
                      </span>
                    </div>

                    <div>
                      <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {activeTopic.code}: {activeTopic.title}
                      </h1>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                        {activeTopic.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                          Why Module {activeModule.moduleNumber} Matters in
                          Practice
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {activeModule.whyItMatters}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          Topic {activeTopic.code} Technical Subtopics
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {activeTopic.subtopics.map((sub, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Topic Selector Pills within Active Module */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                          Module {activeModule.moduleNumber} Topics:
                        </span>
                        {activeModule.topics.map((t) => {
                          const isSelected = t.id === activeTopic.id;
                          const isPassed = progressState.topics[t.id]?.passed;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedTopicId(t.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {t.code} {isPassed ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleStartTopicAssessment(activeModule, activeTopic)
                        }
                        data-testid={`start-topic-assessment-${activeTopic.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        <span>
                          Take Topic {activeTopic.code} Assessment (5 Qs • 90%
                          Pass)
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CARD B: INTERACTIVE DIMENSIONAL SANDBOX & SYLLABUS LEARNING GATE */}
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        Card 2 of 3 • Interactive Unit &amp; Bending Stress
                        Sandbox
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        1 kN·m = 10⁶ N·mm • 1 MPa = 1 N/mm²
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1 max-w-xl">
                        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                          Live Consistent (mm, N) Stress Verifier
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          Adjust Bending Moment <strong>M</strong> (in kN·m) and
                          Elastic Section Modulus <strong>Wₑₗ</strong> (in mm³)
                          to see how converting to <strong>N·mm</strong>{' '}
                          produces stress directly in{' '}
                          <strong>N/mm² = MPa</strong>:
                        </p>
                      </div>
                      <MathFraction
                        lhs="σ"
                        num="M (in N·mm)"
                        den="Wₑₗ (in mm³)"
                        rhs={`${sandboxComputed.stressMpa} MPa`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Moment M (kN·m):
                        </label>
                        <input
                          type="text"
                          value={sandboxMomentKnm}
                          onChange={(e) => setSandboxMomentKnm(e.target.value)}
                          aria-label="Sandbox bending moment in kN·m"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white"
                        />
                        <div className="text-[11px] font-mono text-blue-600 dark:text-sky-400">
                          = {sandboxComputed.momentNmm} N·mm
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Section Modulus Wₑₗ (mm³):
                        </label>
                        <input
                          type="text"
                          value={sandboxWelMm3}
                          onChange={(e) => setSandboxWelMm3(e.target.value)}
                          aria-label="Sandbox elastic section modulus in mm³"
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm text-slate-900 dark:text-white"
                        />
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Major-axis elastic modulus
                        </div>
                      </div>

                      <div className="rounded-xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 p-3 flex flex-col justify-center">
                        <div className="text-[11px] font-mono uppercase text-blue-700 dark:text-sky-300">
                          Resulting Bending Stress σ
                        </div>
                        <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                          {sandboxComputed.stressMpa} MPa
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          = {sandboxComputed.stressMpa} N/mm² (
                          {sandboxComputed.stressGpa} GPa)
                        </div>
                      </div>
                    </div>

                    {/* Syllabus Learning Gate & Future Textbook Expansion Slot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5 space-y-1">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          Module {activeModule.moduleNumber} Syllabus Learning
                          Gate
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                          {activeModule.learningGate}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                          <span>Future Textbook &amp; Standard Expansion</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {activeTopic.futureContentNote ||
                            activeModule.standardsNotice ||
                            'Ready for your personal textbooks, worked examples, and Eurocode / UK National Annex references.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CARD C: STEP-BY-STEP WORKED EXAMPLES & TRANSITION TO QUESTIONS */}
                  <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                        Card 3 of 3 • Verified Worked Examples &amp; Self-Review
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {activeModule.workedExamples.length} Syllabus Worked{' '}
                        {activeModule.workedExamples.length === 1
                          ? 'Example'
                          : 'Examples'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {activeModule.workedExamples.map((ex) => (
                        <div
                          key={ex.id}
                          className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                        >
                          <div>
                            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {ex.title}
                            </h3>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                              <strong>Engineering Brief &amp; Scope:</strong>{' '}
                              {ex.brief}
                            </p>
                          </div>

                          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 text-xs">
                            <div className="font-bold text-emerald-700 dark:text-emerald-300">
                              Independent Verification &amp; Self-Review
                              Checklist:
                            </div>
                            <ul className="space-y-1 text-slate-600 dark:text-slate-300 pt-0.5">
                              {ex.checklist.map((chk, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1.5"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{chk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStartTopicAssessment(
                              activeModule,
                              activeTopic
                            )
                          }
                          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                        >
                          Take Topic {activeTopic.code} Assessment (5 Qs • 90%
                          Pass)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartModuleAssessment(activeModule)
                          }
                          data-testid="start-module-assessment-btn"
                          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          Module {activeModule.moduleNumber} Exam (20 Qs • 90%
                          Pass)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAdvanceToNextStep}
                        data-testid="continue-to-question-1a-btn"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Continue to Guided Question 1a</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. STEP CONTENT: GUIDED & INDEPENDENT QUESTIONS ([1a]..[5a]) */}
              {currentStep !== 'learn' && currentStep !== 'summary' && (
                <div
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5"
                  data-testid={`question-step-card-${currentStep}`}
                >
                  {/* Top Question Badge & Help Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                        {activeQuestion.badgeLabel}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Target Dimension:{' '}
                        {activeQuestion.dimension.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setHintsRevealed((prev) => Math.min(2, prev + 1))
                        }
                        data-testid="need-a-hint-btn"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Need a Hint ({hintsRevealed}/2)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkedSolutionDrawerOpen(true)}
                        data-testid="show-worked-solution-btn"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Show Worked Solution</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Prompt Lead */}
                  <div className="space-y-2">
                    <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {activeQuestion.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
                      {activeQuestion.promptLead}
                    </p>
                  </div>

                  {/* Formatted Engineering Math Fraction & Given Parameters */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    {activeQuestion.promptFormula && (
                      <MathFraction
                        lhs={activeQuestion.promptFormula.lhs}
                        num={activeQuestion.promptFormula.num}
                        den={activeQuestion.promptFormula.den}
                        rhs={activeQuestion.promptFormula.rhsNote}
                      />
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {activeQuestion.givenParameters.map((param, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                        >
                          <span className="font-bold text-blue-700 dark:text-sky-300">
                            {param.symbol}
                            {param.sub && <sub>{param.sub}</sub>}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {' '}
                            ({param.label}):{' '}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {param.valueDisplay}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive SVG Diagram with [🔍 Zoom] Modal */}
                  <QuestionDiagram
                    diagramType={activeQuestion.diagramType}
                    caption={activeQuestion.diagramCaption}
                  />

                  {/* Graduated Hints Box */}
                  {hintsRevealed > 0 && (
                    <div className="rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 space-y-2">
                      {activeQuestion.hints
                        .slice(0, hintsRevealed)
                        .map((h, i) => (
                          <p
                            key={i}
                            className="text-xs sm:text-sm text-amber-900 dark:text-amber-200"
                          >
                            <strong>Graduated Hint {i + 1}:</strong> {h}
                          </p>
                        ))}
                    </div>
                  )}

                  {/* Adaptive Routing Banner */}
                  {adaptiveBanner && (
                    <div className="rounded-xl bg-blue-50 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-500/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-blue-900 dark:text-sky-200">
                      <span>{adaptiveBanner}</span>
                      {remedialInjected && currentStep === '2a' && (
                        <button
                          type="button"
                          onClick={() => goToTutorStep('2a-R')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer"
                        >
                          Open 2a-R Warm-Up →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Compact Numeric Input (w-[200px]) + Unit Selector (w-[120px]) */}
                  <form
                    onSubmit={handleCheckTutorAnswer}
                    className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label
                        htmlFor="tutor-numeric-answer"
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300"
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
                        data-testid="tutor-answer-input"
                        className="w-[200px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-sky-400 focus:outline-none font-mono text-sm text-slate-900 dark:text-white"
                      />
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        aria-label="Select engineering unit"
                        data-testid="tutor-unit-select"
                        className="w-[120px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-sm font-semibold text-slate-900 dark:text-white"
                      >
                        {activeQuestion.unitChoices.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        data-testid="tutor-check-answer-btn"
                        className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-colors cursor-pointer"
                      >
                        Check Answer
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdvanceToNextStep}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Deterministic Diagnostic Feedback */}
                  {gradeOutcome && (
                    <div
                      data-testid="tutor-grade-feedback"
                      className={`rounded-xl p-4 border text-xs sm:text-sm space-y-1.5 ${
                        gradeOutcome.isCorrect
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200'
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {gradeOutcome.headline}
                      </div>
                      <p className="leading-relaxed">
                        {gradeOutcome.diagnosticDetail}
                      </p>
                      {gradeOutcome.unitConversionNote && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <UnitBadge unit={gradeOutcome.expectedCanonicalUnit} />
                          <span>{gradeOutcome.unitConversionNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 5. STEP CONTENT: [🏁 Summary] */}
              {currentStep === 'summary' && (
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Session Summary &amp; Formal Syllabus Gate
                    </span>
                    <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      Ready for Your 90% Pass-Mark Syllabus Assessments
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      You have completed {completedStepsCount} of{' '}
                      {visibleSteps.length} guided session steps. Now prove your
                      mastery on the formal End-of-Topic Assessments (5
                      questions each, 90% pass mark) or the 20-question
                      End-of-Module Assessment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeModule.topics.map((t) => {
                      const tProg = progressState.topics[t.id];
                      return (
                        <div
                          key={t.id}
                          className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">
                              Topic {t.code} Assessment
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              {t.title}
                            </div>
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                              {t.assessmentQuestions.length} Questions • 90%
                              Pass Mark
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleStartTopicAssessment(activeModule, t)
                            }
                            className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                          >
                            {tProg?.passed
                              ? `Retake (${tProg.bestScorePercent.toFixed(0)}%)`
                              : 'Start 5-Q Assessment'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => goToTutorStep('learn')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      ← Back to Concept Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartModuleAssessment(activeModule)}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Start Module {activeModule.moduleNumber} Exam (20 Qs • 90%
                      Pass) →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 3: UNIFIED VISUAL LEARNING MAP (max-w-[1200px] mx-auto)    */}
          {/* =============================================================== */}
          {activeView === 'map' && (
            <div
              className="max-w-[1200px] mx-auto space-y-6"
              data-testid="learning-map-view"
            >
              {/* Top Header, Stage 1–3 Tabs & Search/Filter Controls */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                      Complete 20-Module Rebuild Curriculum
                    </span>
                    <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Unified Visual Learning Map (Modules 0 to 19)
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Structured around all 20 syllabus modules across 3 stages.
                      Expand any module to study its topics, inspect its
                      learning gate, or take its 5-question Topic Assessments
                      and 20-question End-of-Module Exam (90% pass mark).
                    </p>
                  </div>

                  {/* Stage Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start">
                    {(
                      [
                        { id: 'all', label: 'All 20 Modules (0–19)' },
                        { id: 1, label: 'Stage 1: Core Mechanics (0–8)' },
                        { id: 2, label: 'Stage 2: Materials & Geotech (9–14)' },
                        { id: 3, label: 'Stage 3: Analysis & Practice (15–19)' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={String(tab.id)}
                        type="button"
                        onClick={() => setMapStageFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          mapStageFilter === tab.id
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Module Selector Strip (Mod 0 .. Mod 19) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {ALL_SYLLABUS_MODULES.map((mod) => {
                    const isPassed = Boolean(
                      progressState.modules[mod.id]?.passed
                    );
                    const isExpanded = Boolean(
                      expandedMapModules[mod.moduleNumber]
                    );
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          setSelectedModuleNumber(mod.moduleNumber);
                          setMapStageFilter('all');
                          setExpandedMapModules((prev) => ({
                            ...prev,
                            [mod.moduleNumber]: true,
                          }));
                        }}
                        data-testid={`module-selector-${mod.moduleNumber}`}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border shrink-0 transition-colors cursor-pointer ${
                          selectedModuleNumber === mod.moduleNumber &&
                          isExpanded
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        Mod {mod.moduleNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      placeholder="Search modules, topics, or learning gates..."
                      aria-label="Search syllabus modules and topics"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'All Statuses' },
                        { id: 'not-started', label: 'Not Started' },
                        { id: 'in-progress', label: 'In Progress' },
                        { id: 'passed', label: 'Passed (≥90%)' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setMapStatusFilter(st.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          mapStatusFilter === st.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* VERTICAL TIMELINE CONNECTOR & NESTED MODULE -> TOPIC ACCORDION */}
              <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-700/70">
                {filteredMapModules.map((mod) => {
                  const modProg = progressState.modules[mod.id];
                  const passedTopicsCount = mod.topics.filter(
                    (t) => progressState.topics[t.id]?.passed
                  ).length;
                  const anyAttempted =
                    (modProg?.attemptsCount ?? 0) > 0 ||
                    mod.topics.some(
                      (t) =>
                        (progressState.topics[t.id]?.attemptsCount ?? 0) > 0
                    );
                  const isPassed = Boolean(modProg?.passed);
                  const isExpanded = Boolean(
                    expandedMapModules[mod.moduleNumber]
                  );
                  const stageNum = getModuleStage(mod.moduleNumber);
                  const modulePct = isPassed
                    ? 100
                    : mod.topics.length > 0
                    ? Math.round((passedTopicsCount / mod.topics.length) * 100)
                    : 0;

                  return (
                    <div
                      key={mod.id}
                      data-testid={`map-module-card-${mod.moduleNumber}`}
                      className="relative"
                    >
                      {/* Timeline Node Marker */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-6 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border-2 z-10 ${
                          isPassed
                            ? 'bg-emerald-600 text-white border-emerald-300'
                            : anyAttempted || mod.moduleNumber === 0
                            ? 'bg-blue-600 text-white border-blue-300'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isPassed ? '✓' : mod.moduleNumber}
                      </div>

                      {/* Module Accordion Card */}
                      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                        {/* Accordion Header */}
                        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div
                            className="space-y-1.5 flex-1 cursor-pointer"
                            onClick={() =>
                              setExpandedMapModules((prev) => ({
                                ...prev,
                                [mod.moduleNumber]: !prev[mod.moduleNumber],
                              }))
                            }
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-500/30">
                                Stage {stageNum} • Module {mod.moduleNumber}
                              </span>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {mod.suggestedDuration ??
                                  mod.yearPathway ??
                                  '6–10 weeks'}
                              </span>
                              <span
                                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg ${
                                  isPassed
                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                    : anyAttempted
                                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {isPassed
                                  ? `Module Passed (${modProg.bestScorePercent.toFixed(
                                      0
                                    )}%)`
                                  : anyAttempted
                                  ? 'In Progress'
                                  : 'Not Started'}
                              </span>
                            </div>

                            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                              {mod.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {mod.summary}
                            </p>
                          </div>

                          {/* Header Actions & Progress */}
                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <div className="text-right mr-2 hidden sm:block">
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                Topics: {passedTopicsCount}/{mod.topics.length}{' '}
                                • {modulePct}%
                              </div>
                              <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-blue-600 dark:bg-sky-500"
                                  style={{ width: `${modulePct}%` }}
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setInspectorDrawerTarget({
                                  moduleItem: toLegacyModuleItem(
                                    mod,
                                    progressState
                                  ),
                                  objectiveItem: null,
                                  moduleNumber: mod.moduleNumber,
                                })
                              }
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              Syllabus Info
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectModuleAndTopic(
                                  mod.moduleNumber,
                                  mod.topics[0]?.id,
                                  'tutor'
                                )
                              }
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-slate-700 cursor-pointer"
                            >
                              Open in Tutor
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartModuleAssessment(mod)}
                              data-testid={
                                mod.moduleNumber === selectedModuleNumber
                                  ? 'start-module-assessment-btn'
                                  : `start-module-assessment-btn-${mod.moduleNumber}`
                              }
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs cursor-pointer"
                            >
                              20-Q Module Exam
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedMapModules((prev) => ({
                                  ...prev,
                                  [mod.moduleNumber]: !prev[mod.moduleNumber],
                                }))
                              }
                              aria-label={`Toggle Module ${mod.moduleNumber} topics`}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Module Body: Learning Gate, Nested Topics & End-of-Module Exam */}
                        {isExpanded && (
                          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-4">
                            {/* Learning Gate Banner */}
                            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <span className="font-mono font-bold uppercase text-blue-600 dark:text-sky-400">
                                  Syllabus Learning Gate:
                                </span>{' '}
                                <span className="text-slate-700 dark:text-slate-300">
                                  {mod.learningGate}
                                </span>
                              </div>
                              <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                                {mod.workedExamples.length} Worked Examples •{' '}
                                {mod.moduleAssessment.length} Exam Qs
                              </span>
                            </div>

                            {/* Nested Topics List */}
                            <div className="space-y-2.5">
                              {mod.topics.map((topic) => {
                                const tProg = progressState.topics[topic.id];
                                const tPassed = Boolean(tProg?.passed);
                                const tAttempted =
                                  (tProg?.attemptsCount ?? 0) > 0;
                                const legacyMod = toLegacyModuleItem(
                                  mod,
                                  progressState
                                );
                                const legacyObj =
                                  legacyMod.objectives.find(
                                    (o) => o.code === topic.code
                                  ) ?? null;

                                return (
                                  <div
                                    key={topic.id}
                                    data-testid={`topic-card-${topic.id}`}
                                    className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                  >
                                    <div className="space-y-1.5 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300">
                                          Topic {topic.code}
                                        </span>
                                        <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                          {topic.title}
                                        </h3>
                                        <span
                                          className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                                            tPassed
                                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                              : tAttempted
                                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                          }`}
                                        >
                                          {tPassed
                                            ? `Passed (${tProg.bestScorePercent.toFixed(
                                                0
                                              )}%)`
                                            : tAttempted
                                            ? `Best: ${tProg.bestScorePercent.toFixed(
                                                0
                                              )}% (<90%)`
                                            : 'Not Started'}
                                        </span>
                                      </div>

                                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {topic.summary}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setInspectorDrawerTarget({
                                            moduleItem: legacyMod,
                                            objectiveItem: legacyObj,
                                            moduleNumber: mod.moduleNumber,
                                            topicId: topic.id,
                                          })
                                        }
                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                                      >
                                        Details
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSelectModuleAndTopic(
                                            mod.moduleNumber,
                                            topic.id,
                                            'tutor'
                                          )
                                        }
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                      >
                                        Study Topic
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStartTopicAssessment(mod, topic)
                                        }
                                        data-testid={`start-topic-assessment-${topic.id}`}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                                      >
                                        Topic Assessment (
                                        {topic.assessmentQuestions.length} Qs)
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* End-of-Module Assessment Callout Bar */}
                            <div className="rounded-xl bg-blue-50/80 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
                              <div className="space-y-0.5">
                                <div className="text-xs font-mono font-bold uppercase text-blue-700 dark:text-sky-300">
                                  End-of-Module {mod.moduleNumber} Gate
                                  Assessment • 90% Pass Mark (18/20 Required)
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                  Comprehensive 20-question engineering exam
                                  covering all topics, calculations, load paths,
                                  and assumptions in {mod.shortTitle}.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStartModuleAssessment(mod)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs cursor-pointer"
                              >
                                Start 20-Question Module Exam →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 4: TOPIC OR END-OF-MODULE ASSESSMENT RUNNER                */}
          {/* =============================================================== */}
          {activeView === 'assessment' && resolvedAssessment && (
            <AssessmentView
              key={
                resolvedAssessment.topic
                  ? `TOPIC-${resolvedAssessment.topic.id}`
                  : `MODULE-${resolvedAssessment.module.id}`
              }
              module={resolvedAssessment.module}
              topic={resolvedAssessment.topic}
              questions={resolvedAssessment.questions}
              previousBestScorePercent={
                resolvedAssessment.topic
                  ? progressState.topics[resolvedAssessment.topic.id]
                      ?.bestScorePercent ?? null
                  : progressState.modules[resolvedAssessment.module.id]
                      ?.bestScorePercent ?? null
              }
              previousPassed={
                resolvedAssessment.topic
                  ? Boolean(
                      progressState.topics[resolvedAssessment.topic.id]?.passed
                    )
                  : Boolean(
                      progressState.modules[resolvedAssessment.module.id]
                        ?.passed
                    )
              }
              previousAttemptsCount={
                resolvedAssessment.topic
                  ? progressState.topics[resolvedAssessment.topic.id]
                      ?.attemptsCount ?? 0
                  : progressState.modules[resolvedAssessment.module.id]
                      ?.attemptsCount ?? 0
              }
              onCompleteAttempt={(res) =>
                handleCompleteAssessmentAttempt(
                  resolvedAssessment.module,
                  resolvedAssessment.topic,
                  res
                )
              }
              onBackToModule={() =>
                handleOpenModuleInMap(resolvedAssessment.module.moduleNumber)
              }
            />
          )}

          {/* =============================================================== */}
          {/* VIEW 5: COVERAGE MAP, MILESTONES A-F & STUDY STANDARDS          */}
          {/* =============================================================== */}
          {activeView === 'coverage' && (
            <CoverageAndMilestonesView
              modules={ALL_SYLLABUS_MODULES}
              progressState={progressState}
              onSelectModule={(modNum) =>
                handleSelectModuleAndTopic(modNum, undefined, 'tutor')
              }
            />
          )}
        </main>

        {/* ================================================================= */}
        {/* SLIDE-OVER DRAWERS & UTILITY MODALS                               */}
        {/* ================================================================= */}
        <WorkedSolutionDrawer
          isOpen={workedSolutionDrawerOpen}
          onClose={() => setWorkedSolutionDrawerOpen(false)}
          question={activeQuestion}
          fullSolutionUnlocked={Boolean(
            fullSolutionUnlockedByStep[currentStep]
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
          moduleItem={inspectorDrawerTarget?.moduleItem ?? null}
          objectiveItem={inspectorDrawerTarget?.objectiveItem ?? null}
          onClose={() => setInspectorDrawerTarget(null)}
          onStartTopic={() => {
            if (!inspectorDrawerTarget) return;
            handleSelectModuleAndTopic(
              inspectorDrawerTarget.moduleNumber,
              inspectorDrawerTarget.topicId,
              'tutor'
            );
          }}
        />
      </div>
    </div>
  );
}
