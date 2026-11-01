import React from 'react';
import {
  BookOpen,
  Bot,
  Calculator,
  Compass,
  FileSpreadsheet,
  Layers,
  LayoutDashboard,
  Map,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
} from 'lucide-react';
import { APP_BUILD_DATE, APP_VERSION } from '../utils/tutorEngine';
import type { MainView } from '../hooks/useStructTutorWorkspace';

export interface SidebarNavigationProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  activeView: MainView;
  setActiveView: (view: MainView) => void;
  hybridLightCards: boolean;
  setHybridLightCards: React.Dispatch<React.SetStateAction<boolean>>;
  setUnitsDrawerOpen: (open: boolean) => void;
  setCalculatorOpen: (open: boolean) => void;
  progressSummary: {
    overallProgressPercent: number;
    completedModulesCount: number;
    totalModulesCount: number;
    passedTopicsCount: number;
    totalTopicsCount: number;
    totalAttemptsCount: number;
  };
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeView,
  setActiveView,
  hybridLightCards,
  setHybridLightCards,
  setUnitsDrawerOpen,
  setCalculatorOpen,
  progressSummary,
}) => {
  return (
    <aside
      data-testid="sidebar-navigation"
      className={`${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } shrink-0 bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/90 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-all duration-200 sticky top-0 h-screen z-30`}
    >
      {/* Top Brand + Primary Nav */}
      <div className="p-3 space-y-6">
        {/* Brand Header */}
        <div
          className={
            sidebarCollapsed
              ? 'flex flex-col items-center gap-2 pt-1'
              : 'flex items-center justify-between gap-2 px-1 pt-1'
          }
        >
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
                <div className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  StructTutor
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Home Dashboard (Alt+1)"
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
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Tutor & Guided Practice (Alt+2)"
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
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Unified Visual Learning Map (Modules 0 to 19, Alt+3)"
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
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Syllabus Coverage Map & Project checkpoints (Alt+4)"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Coverage &amp; Checkpoints</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('ai-tutor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            data-testid="nav-ai-tutor"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'ai-tutor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="AI Engineering Tutor (Ollama)"
          >
            <Bot className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>AI Tutor</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            data-testid="nav-settings"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
            title="Settings & Data Backup (Alt+5)"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        {/* Quick Utilities & Full-Page Theme Switch */}
        {!sidebarCollapsed && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workbench Utilities
            </div>
            <button
              type="button"
              onClick={() => setUnitsDrawerOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>Units Reference Drawer</span>
            </button>
            <button
              type="button"
              onClick={() => setCalculatorOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Scratchpad Calculator</span>
            </button>
            <button
              type="button"
              onClick={() => setHybridLightCards((prev) => !prev)}
              data-testid="theme-toggle-btn"
              aria-pressed={hybridLightCards}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                {hybridLightCards ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span>
                  {hybridLightCards ? 'Light Mode Theme' : 'Dark Mode Theme'}
                </span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Switch
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sidebar Course Progress & Version Summary */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/90 space-y-2.5 text-xs">
        {!sidebarCollapsed ? (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/90 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300">
              <span>Overall Mastery</span>
              <span className="font-bold text-blue-600 dark:text-sky-400">
                {progressSummary.overallProgressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{
                  width: `${progressSummary.overallProgressPercent}%`,
                }}
              />
            </div>
            <div className="space-y-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-0.5">
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
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 leading-snug">
              <div>
                StructTutor v{APP_VERSION} ({APP_BUILD_DATE})
              </div>
              <div>
                Educational portfolio only. Independent check required.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center font-mono text-[11px] font-bold text-blue-600 dark:text-sky-400">
            {progressSummary.overallProgressPercent}%
          </div>
        )}
      </div>
    </aside>
  );
};
