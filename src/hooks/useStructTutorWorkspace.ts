import React, { useEffect, useMemo, useState } from 'react';
import {
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
} from '../utils/tutorEngine';
import {
  ALL_SYLLABUS_MODULES,
  getModuleByNumber,
} from '../data/fullSyllabus';
import {
  AssessmentSubmissionResult,
  CourseProgressState,
  NormalizedSyllabusModule,
  SyllabusTopic,
} from '../types/syllabus';
import {
  computeCourseProgressSummary,
  loadCourseProgressState,
  recordAssessmentAttempt,
  resetCourseProgressState,
  saveCourseProgressState,
} from '../utils/assessmentEngine';

export type MainView = 'dashboard' | 'tutor' | 'map' | 'coverage' | 'assessment';

export interface ActiveAssessmentTarget {
  moduleNumber: number;
  topicId?: string;
}

export interface InspectorDrawerTarget {
  moduleItem: SyllabusModuleItem;
  objectiveItem: ObjectiveItem | null;
  moduleNumber: number;
  topicId?: string;
}

export function getModuleStage(moduleNumber: number): 1 | 2 | 3 {
  if (moduleNumber <= 8) return 1;
  if (moduleNumber <= 14) return 2;
  return 3;
}

export function toLegacyModuleItem(
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
    durationWeeks: mod.suggestedDuration ?? mod.yearPathway ?? '6-10 weeks',
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

export function useStructTutorWorkspace() {
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

  // 2. Shell Layout & Theme State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    () => getModuleByNumber(selectedModuleNumber) ?? ALL_SYLLABUS_MODULES[0],
    [selectedModuleNumber]
  );

  const activeTopic = useMemo(
    () =>
      activeModule.topics.find((t) => t.id === selectedTopicId) ??
      activeModule.topics[0],
    [activeModule, selectedTopicId]
  );

  // 4. Interactive Unit & Bending Stress Sandbox State (Card 2 on [Learn])
  const [sandboxMomentKnm, setSandboxMomentKnm] = useState<string>('18');
  const [sandboxWelMm3, setSandboxWelMm3] = useState<string>('667000');

  const sandboxComputed = useMemo(() => {
    const mVal = Number(sandboxMomentKnm);
    const wVal = Number(sandboxWelMm3);
    if (!Number.isFinite(mVal) || !Number.isFinite(wVal) || wVal <= 0) {
      return { momentNmm: '-', stressMpa: '-', stressGpa: '-' };
    }
    const nmm = convertEngineeringUnit(mVal, 'kN·m', 'N·mm');
    const sigma = nmm / wVal;
    return {
      momentNmm: nmm.toLocaleString('en-GB', { maximumFractionDigits: 0 }),
      stressMpa: Number(sigma.toPrecision(3)).toString(),
      stressGpa: Number((sigma / 1000).toPrecision(3)).toString(),
    };
  }, [sandboxMomentKnm, sandboxWelMm3]);

  // 5. Stepped Tutor State ([Learn], [1a]..[5a], [Summary]) persisted via progressState.tutorPractice (B1)
  const [currentStep, setCurrentStep] = useState<StepId>(
    () => (progressState.tutorPractice?.currentStep as StepId) || 'learn'
  );
  const [remedialInjected, setRemedialInjected] = useState<boolean>(
    () => Boolean(progressState.tutorPractice?.remedialInjected)
  );
  const [stepStatuses, setStepStatuses] = useState<Record<StepId, StepStatus>>(
    () =>
      (progressState.tutorPractice?.stepStatuses as Record<StepId, StepStatus>) ?? {
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
      }
  );
  const [answerInput, setAnswerInput] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('kN');
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
  const [verificationDrawerOpen, setVerificationDrawerOpen] =
    useState<boolean>(false);

  // 6. Milestone A Skill Bars
  const [milestoneBars, setMilestoneBars] = useState<MilestoneSkillBar[]>(
    () =>
      progressState.tutorPractice?.milestoneBars
        ? progressState.tutorPractice.milestoneBars.map((b) => ({
            ...b,
            score: b.completed,
          }))
        : INITIAL_MILESTONE_A_BARS
  );
  const [creditedQuestions, setCreditedQuestions] = useState<
    Record<string, boolean>
  >(() => progressState.tutorPractice?.creditedQuestions ?? {});

  // Persist Stepped Tutor session state into CourseProgressState (B1)
  useEffect(() => {
    setProgressState((prev) => ({
      ...prev,
      lastUpdatedAtIso: new Date().toISOString(),
      tutorPractice: {
        currentStep,
        stepStatuses,
        remedialInjected,
        milestoneBars: milestoneBars.map((b) => ({
          id: b.id,
          label: b.label,
          completed: b.completed,
          target: b.target,
          unitDescription: b.unitDescription,
        })),
        creditedQuestions,
        lastUpdatedIso: new Date().toISOString(),
      },
    }));
  }, [currentStep, stepStatuses, remedialInjected, milestoneBars, creditedQuestions]);

  // 7. Unified Visual Learning Map State
  const [mapStageFilter, setMapStageFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [mapStatusFilter, setMapStatusFilter] = useState<
    'all' | 'not-started' | 'in-progress' | 'passed'
  >('all');
  const [expandedMapModules, setExpandedMapModules] = useState<
    Record<number, boolean>
  >({
    0: true,
  });
  const [inspectorDrawerTarget, setInspectorDrawerTarget] =
    useState<InspectorDrawerTarget | null>(null);

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
      if (mapStatusFilter === 'in-progress' && (!anyAttempted || isPassed))
        return false;
      if (mapStatusFilter === 'not-started' && (anyAttempted || isPassed))
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

  return {
    progressState,
    setProgressState,
    progressSummary,
    sidebarCollapsed,
    setSidebarCollapsed,
    hybridLightCards,
    setHybridLightCards,
    activeView,
    setActiveView,
    confirmResetOpen,
    setConfirmResetOpen,
    selectedModuleNumber,
    setSelectedModuleNumber,
    selectedTopicId,
    setSelectedTopicId,
    topicSwitcherOpen,
    setTopicSwitcherOpen,
    assessmentTarget,
    setAssessmentTarget,
    activeModule,
    activeTopic,
    sandboxMomentKnm,
    setSandboxMomentKnm,
    sandboxWelMm3,
    setSandboxWelMm3,
    sandboxComputed,
    currentStep,
    setCurrentStep,
    remedialInjected,
    stepStatuses,
    answerInput,
    setAnswerInput,
    selectedUnit,
    setSelectedUnit,
    hintsRevealed,
    setHintsRevealed,
    fullSolutionUnlockedByStep,
    setFullSolutionUnlockedByStep,
    gradeOutcome,
    adaptiveBanner,
    workedSolutionDrawerOpen,
    setWorkedSolutionDrawerOpen,
    unitsDrawerOpen,
    setUnitsDrawerOpen,
    calculatorOpen,
    setCalculatorOpen,
    verificationDrawerOpen,
    setVerificationDrawerOpen,
    milestoneBars,
    mapStageFilter,
    setMapStageFilter,
    mapSearchQuery,
    setMapSearchQuery,
    mapStatusFilter,
    setMapStatusFilter,
    expandedMapModules,
    setExpandedMapModules,
    inspectorDrawerTarget,
    setInspectorDrawerTarget,
    visibleSteps,
    activeQuestion,
    completedStepsCount,
    tutorProgressPercent,
    resolvedAssessment,
    filteredMapModules,
    handleSelectModuleAndTopic,
    handleOpenModuleInMap,
    handleStartTopicAssessment,
    handleStartModuleAssessment,
    handleCompleteAssessmentAttempt,
    handleResetAllProgress,
    goToTutorStep,
    handleCheckTutorAnswer,
    handleAdvanceToNextStep,
  };
}
