export type QuestionType = 'numeric' | 'mcq' | 'scenario';

export type ReviewStatus = 'Verified' | 'Draft' | 'Pending Review' | 'Corrected' | 'Reviewed' | 'Flagged';
export type QuestionReviewStatus = ReviewStatus;

export interface QuestionCitation {
  moduleId: string;
  topicId: string;
  sourceTitle: string;
  authorOrBody: string;
  clauseOrSection: string;
  pageReference: string;
  formatted: string;
}

export interface AssessmentQuestion {
  id: string;
  moduleNumber: number;
  topicId: string;
  learningObjective: string;
  type: QuestionType;
  prompt: string;
  assumptions: string[] | string;
  unit?: string;
  correctAnswer: number;
  tolerance?: number;
  options?: string[];
  correctOptionIndex?: number;
  explanation: string;
  citation?: QuestionCitation | string;
  hints: string[];
  caseFamilyId?: string;
  solverVerificationId?: string;
  reviewStatus: ReviewStatus;
  reviewNotice: string;
}

export interface WorkedExampleItem {
  id: string;
  title: string;
  scenario: string;
  brief: string;
  keySteps: string[];
  checklist: string[];
  learningPurpose: string;
  checkMethod: string;
  status: string;
  reviewStatus?: ReviewStatus;
}

export interface SyllabusTopic {
  id: string;
  code: string;
  title: string;
  summary: string;
  subtopics: string[];
  futureExpansion: string[];
  futureContentNote: string;
  questions: AssessmentQuestion[];
  assessmentQuestions: AssessmentQuestion[];
}

export interface SyllabusModule {
  id: string;
  moduleNumber: number;
  code: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  introduction: string;
  whyItMatters: string;
  suggestedDuration?: string;
  yearPathway?: string;
  standardsNotice?: string;
  learningGate: string;
  learningGates: string[];
  objectives: string[];
  learningObjectives: string[];
  topics: SyllabusTopic[];
  workedExamples: WorkedExampleItem[];
  WorkedExamples: WorkedExampleItem[];
  studyRuleApplication: {
    explain: string;
    sketch: string;
    calculate: string;
    check: string;
    assumptions: string;
  };
  futureExpansion: {
    plannedTextbooks: string[];
    plannedStandards: string[];
    plannedWorkedExamples: string[];
    plannedDrawingTasks: string[];
  };
  moduleAssessment: AssessmentQuestion[];
  moduleAssessmentQuestions: AssessmentQuestion[];
}

export type NormalizedSyllabusModule = SyllabusModule;

export interface StudyRuleItem {
  id: string;
  stepNumber: number;
  number: number;
  title: string;
  instruction: string;
  description: string;
}

export interface CalcNoteSectionItem {
  sectionNumber: number;
  key: string;
  title: string;
  prompt: string;
  requirement: string;
}

export interface CourseDevelopmentRequirement {
  id: string;
  sourceRef: string;
  title: string;
  topic: string;
  targetModules: number[];
  syllabusComment: string;
  statusNote: string;
  requestedTopics: string[];
  handlingNote: string;
  status: string;
}

export interface IntegratedMilestoneItem {
  id: string;
  code: string;
  title: string;
  Timing: string;
  afterModule: number;
  description: string;
  brief: string;
  deliverables: string[];
  requiredItems: Array<{
    category: string;
    label: string;
    requiredCount: number;
  }>;
  passCondition: string;
  prerequisiteModuleNumbers: number[];
}

export interface TopicProgressRecord {
  topicId: string;
  moduleId: string;
  moduleNumber: number;
  attemptsCount: number;
  bestScorePercent: number;
  lastScorePercent: number | null;
  passed: boolean;
  lastAttemptIso: string | null;
}

export interface ModuleProgressRecord {
  moduleId: string;
  moduleNumber: number;
  attemptsCount: number;
  bestScorePercent: number;
  lastScorePercent: number | null;
  passed: boolean;
  lastAttemptIso: string | null;
}

export interface AssessmentAttemptLogItem {
  attemptId: string;
  assessmentId: string;
  assessmentType: 'topic' | 'module';
  moduleId: string;
  moduleNumber: number;
  topicId?: string;
  title: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  timestampIso: string;
}

export interface TutorPracticePersistedState {
  currentStep: string;
  stepStatuses: Record<string, string>;
  remedialInjected: boolean;
  milestoneBars: Array<{
    id: string;
    label: string;
    completed: number;
    target: number;
    unitDescription: string;
  }>;
  creditedQuestions: Record<string, boolean>;
  lastUpdatedIso: string;
}

export interface CourseProgressState {
  version: number;
  syllabusRevisionId: string;
  initializedAtIso: string;
  lastUpdatedAtIso: string;
  modules: Record<string, ModuleProgressRecord>;
  topics: Record<string, TopicProgressRecord>;
  attemptHistory: AssessmentAttemptLogItem[];
  tutorPractice?: TutorPracticePersistedState;
  completedDesignScenarios: string[];
  questionReviewOverrides: Record<string, ReviewStatus>;
}

export interface QuestionGradeOutcome {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string | number;
  expectedDisplay: string;
  explanation: string;
  unitRequired?: string;
  unitDiagnostic?: string;
  shuffledOptions?: string[];
  shuffledCorrectIndex?: number;
}

export interface AssessmentSubmissionResult {
  assessmentId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  passMarkPercent: number;
  questionOutcomes: Record<string, QuestionGradeOutcome>;
  submittedAtIso: string;
}
