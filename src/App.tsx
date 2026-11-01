import React from 'react';
import { ALL_SYLLABUS_MODULES } from './data/fullSyllabus';
import { useStructTutorWorkspace } from './hooks/useStructTutorWorkspace';
import { SidebarNavigation } from './components/SidebarNavigation';
import { HomeDashboardView } from './components/HomeDashboardView';
import { TutorSessionView } from './components/TutorSessionView';
import { LearningMapView } from './components/LearningMapView';
import { AssessmentView } from './components/AssessmentView';
import { CoverageAndMilestonesView } from './components/CoverageAndMilestonesView';
import { SettingsView } from './components/SettingsView';
import { WorkedSolutionDrawer } from './components/WorkedSolutionDrawer';
import {
  CalculatorPopover,
  SyllabusInspectorDrawer,
  UnitsReferenceDrawer,
} from './components/UtilityModals';

export default function App() {
  const ws = useStructTutorWorkspace();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', !ws.hybridLightCards);
  }, [ws.hybridLightCards]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (ws.topicSwitcherOpen) ws.setTopicSwitcherOpen(false);
        if (ws.workedSolutionDrawerOpen) ws.setWorkedSolutionDrawerOpen(false);
        if (ws.unitsDrawerOpen) ws.setUnitsDrawerOpen(false);
        if (ws.calculatorOpen) ws.setCalculatorOpen(false);
        if (ws.inspectorDrawerTarget) ws.setInspectorDrawerTarget(null);
        if (ws.confirmResetOpen) ws.setConfirmResetOpen(false);
      } else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          ws.setActiveView('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          ws.setActiveView('tutor');
        } else if (e.key === '3') {
          e.preventDefault();
          ws.setActiveView('map');
        } else if (e.key === '4') {
          e.preventDefault();
          ws.setActiveView('coverage');
        } else if (e.key === '5') {
          e.preventDefault();
          ws.setActiveView('settings');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ws]);

  return (
    <div className={ws.hybridLightCards ? '' : 'dark'}>
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-blue-600 focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Skip to main workspace
      </a>
      <div
        data-testid="app-shell"
        className={`min-h-screen flex font-sans transition-colors duration-200 ${
          ws.hybridLightCards
            ? 'bg-slate-100 text-slate-900'
            : 'bg-[#0B1120] text-slate-100'
        }`}
      >
        <SidebarNavigation
          sidebarCollapsed={ws.sidebarCollapsed}
          setSidebarCollapsed={ws.setSidebarCollapsed}
          activeView={ws.activeView}
          setActiveView={ws.setActiveView}
          hybridLightCards={ws.hybridLightCards}
          setHybridLightCards={ws.setHybridLightCards}
          setUnitsDrawerOpen={ws.setUnitsDrawerOpen}
          setCalculatorOpen={ws.setCalculatorOpen}
          progressSummary={ws.progressSummary}
        />

        <main
          id="main-workspace"
          tabIndex={-1}
          className={`flex-1 min-w-0 px-4 sm:px-8 ${
            ws.activeView === 'tutor' ? 'py-3 sm:py-4' : 'py-6 sm:py-8'
          } overflow-y-auto focus:outline-none`}
        >
          {ws.activeView === 'dashboard' && (
            <HomeDashboardView
              activeModule={ws.activeModule}
              activeTopic={ws.activeTopic}
              selectedModuleNumber={ws.selectedModuleNumber}
              progressState={ws.progressState}
              progressSummary={ws.progressSummary}
              milestoneBars={ws.milestoneBars}
              confirmResetOpen={ws.confirmResetOpen}
              setConfirmResetOpen={ws.setConfirmResetOpen}
              setCurrentStep={ws.setCurrentStep}
              setActiveView={ws.setActiveView}
              handleStartTopicAssessment={ws.handleStartTopicAssessment}
              handleStartModuleAssessment={ws.handleStartModuleAssessment}
              handleOpenModuleInMap={ws.handleOpenModuleInMap}
              handleSelectModuleAndTopic={ws.handleSelectModuleAndTopic}
              handleResetAllProgress={ws.handleResetAllProgress}
            />
          )}

          {ws.activeView === 'tutor' && (
            <TutorSessionView
              activeModule={ws.activeModule}
              activeTopic={ws.activeTopic}
              progressState={ws.progressState}
              topicSwitcherOpen={ws.topicSwitcherOpen}
              setTopicSwitcherOpen={ws.setTopicSwitcherOpen}
              setActiveView={ws.setActiveView}
              setSelectedTopicId={ws.setSelectedTopicId}
              handleSelectModuleAndTopic={ws.handleSelectModuleAndTopic}
              handleStartTopicAssessment={ws.handleStartTopicAssessment}
              handleStartModuleAssessment={ws.handleStartModuleAssessment}
              setUnitsDrawerOpen={ws.setUnitsDrawerOpen}
              setCalculatorOpen={ws.setCalculatorOpen}
              setWorkedSolutionDrawerOpen={ws.setWorkedSolutionDrawerOpen}
              visibleSteps={ws.visibleSteps}
              currentStep={ws.currentStep}
              stepStatuses={ws.stepStatuses}
              tutorProgressPercent={ws.tutorProgressPercent}
              completedStepsCount={ws.completedStepsCount}
              goToTutorStep={ws.goToTutorStep}
              sandboxMomentKnm={ws.sandboxMomentKnm}
              setSandboxMomentKnm={ws.setSandboxMomentKnm}
              sandboxWelMm3={ws.sandboxWelMm3}
              setSandboxWelMm3={ws.setSandboxWelMm3}
              sandboxComputed={ws.sandboxComputed}
              activeQuestion={ws.activeQuestion}
              hintsRevealed={ws.hintsRevealed}
              setHintsRevealed={ws.setHintsRevealed}
              adaptiveBanner={ws.adaptiveBanner}
              remedialInjected={ws.remedialInjected}
              answerInput={ws.answerInput}
              setAnswerInput={ws.setAnswerInput}
              selectedUnit={ws.selectedUnit}
              setSelectedUnit={ws.setSelectedUnit}
              handleCheckTutorAnswer={ws.handleCheckTutorAnswer}
              handleAdvanceToNextStep={ws.handleAdvanceToNextStep}
              gradeOutcome={ws.gradeOutcome}
            />
          )}

          {ws.activeView === 'map' && (
            <LearningMapView
              mapStageFilter={ws.mapStageFilter}
              setMapStageFilter={ws.setMapStageFilter}
              mapSearchQuery={ws.mapSearchQuery}
              setMapSearchQuery={ws.setMapSearchQuery}
              mapStatusFilter={ws.mapStatusFilter}
              setMapStatusFilter={ws.setMapStatusFilter}
              selectedModuleNumber={ws.selectedModuleNumber}
              setSelectedModuleNumber={ws.setSelectedModuleNumber}
              expandedMapModules={ws.expandedMapModules}
              setExpandedMapModules={ws.setExpandedMapModules}
              filteredMapModules={ws.filteredMapModules}
              progressState={ws.progressState}
              setInspectorDrawerTarget={ws.setInspectorDrawerTarget}
              handleSelectModuleAndTopic={ws.handleSelectModuleAndTopic}
              handleStartTopicAssessment={ws.handleStartTopicAssessment}
              handleStartModuleAssessment={ws.handleStartModuleAssessment}
            />
          )}

          {ws.activeView === 'assessment' && ws.resolvedAssessment && (
            <AssessmentView
              key={
                ws.resolvedAssessment.topic
                  ? `TOPIC-${ws.resolvedAssessment.topic.id}`
                  : `MODULE-${ws.resolvedAssessment.module.id}`
              }
              module={ws.resolvedAssessment.module}
              topic={ws.resolvedAssessment.topic}
              questions={ws.resolvedAssessment.questions}
              previousBestScorePercent={
                ws.resolvedAssessment.topic
                  ? ws.progressState.topics[ws.resolvedAssessment.topic.id]
                      ?.bestScorePercent ?? null
                  : ws.progressState.modules[ws.resolvedAssessment.module.id]
                      ?.bestScorePercent ?? null
              }
              previousPassed={
                ws.resolvedAssessment.topic
                  ? Boolean(
                      ws.progressState.topics[ws.resolvedAssessment.topic.id]
                        ?.passed
                    )
                  : Boolean(
                      ws.progressState.modules[ws.resolvedAssessment.module.id]
                        ?.passed
                    )
              }
              previousAttemptsCount={
                ws.resolvedAssessment.topic
                  ? ws.progressState.topics[ws.resolvedAssessment.topic.id]
                      ?.attemptsCount ?? 0
                  : ws.progressState.modules[ws.resolvedAssessment.module.id]
                      ?.attemptsCount ?? 0
              }
              questionReviewOverrides={ws.progressState.questionReviewOverrides}
              onCompleteAttempt={(res) =>
                ws.handleCompleteAssessmentAttempt(
                  ws.resolvedAssessment!.module,
                  ws.resolvedAssessment!.topic,
                  res
                )
              }
              onBackToModule={() =>
                ws.handleOpenModuleInMap(
                  ws.resolvedAssessment!.module.moduleNumber
                )
              }
            />
          )}

          {ws.activeView === 'coverage' && (
            <CoverageAndMilestonesView
              modules={ALL_SYLLABUS_MODULES}
              progressState={ws.progressState}
              onSelectModule={(modNum, topId) =>
                ws.handleSelectModuleAndTopic(modNum, topId, 'tutor')
              }
              onUpdateProgressState={(next) => ws.setProgressState(next)}
            />
          )}

          {ws.activeView === 'settings' && (
            <SettingsView
              progressState={ws.progressState}
              modules={ALL_SYLLABUS_MODULES}
              hybridLightCards={ws.hybridLightCards}
              setHybridLightCards={ws.setHybridLightCards}
              onImportProgressState={(newState) => ws.setProgressState(newState)}
              onResetAllProgress={ws.handleResetAllProgress}
            />
          )}
        </main>

        <WorkedSolutionDrawer
          isOpen={ws.workedSolutionDrawerOpen}
          onClose={() => ws.setWorkedSolutionDrawerOpen(false)}
          question={ws.activeQuestion}
          fullSolutionUnlocked={Boolean(
            ws.fullSolutionUnlockedByStep[ws.currentStep]
          )}
          onUnlockFullSolution={() =>
            ws.setFullSolutionUnlockedByStep((prev) => ({
              ...prev,
              [ws.currentStep]: true,
            }))
          }
        />

        <UnitsReferenceDrawer
          isOpen={ws.unitsDrawerOpen}
          onClose={() => ws.setUnitsDrawerOpen(false)}
        />

        <CalculatorPopover
          isOpen={ws.calculatorOpen}
          onClose={() => ws.setCalculatorOpen(false)}
          onCopyResultToInput={
            ws.activeView === 'tutor' &&
            ws.currentStep !== 'learn' &&
            ws.currentStep !== 'summary'
              ? (val) => ws.setAnswerInput(val)
              : undefined
          }
        />

        <SyllabusInspectorDrawer
          moduleItem={ws.inspectorDrawerTarget?.moduleItem ?? null}
          objectiveItem={ws.inspectorDrawerTarget?.objectiveItem ?? null}
          onClose={() => ws.setInspectorDrawerTarget(null)}
          onStartTopic={() => {
            if (!ws.inspectorDrawerTarget) return;
            ws.handleSelectModuleAndTopic(
              ws.inspectorDrawerTarget.moduleNumber,
              ws.inspectorDrawerTarget.topicId,
              'tutor'
            );
          }}
        />
      </div>
    </div>
  );
}
