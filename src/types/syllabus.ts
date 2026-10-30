export type QuestionType = 'numeric' | 'mcq' | 'scenario';

export type QuestionReviewStatus =
  | 'Self-Checked Calculation'
  | 'Foundation Assessment (Requires Technical Review)'
  | 'Awaiting Controlled Standard Verification';

export interface AssessmentQuestion {
  id: string;
  moduleNumber: number; // 0 to 19 inclusive
  topicId: string;
  learningObjective: string;
  questionType: QuestionType;
  type: QuestionType;
  prompt: string;
  assumptionsAndLimitations: string;
  assumptions: string;
  explanation: string;
  reviewStatus: QuestionReviewStatus;
  reviewNotice: string;
  // Numeric fields + unified answer field
  correctAnswer: number;
  requiredUnit?: string;
  unit?: string;
  tolerance?: number;
  toleranceAbs?: number;
  // MCQ / Scenario fields
  options?: string[];
  correctOptionIndex?: number;
}

export interface FutureExpansionSpace {
  lessonsPlanned: string;
  workedExamplesPlanned: string;
  calculationsPlanned: string;
  sourceReferencesNeeded: string;
}

/**
 * Raw topic shape used in module data files (supports both Modules 0-11 and 12-19).
 */
export interface SyllabusTopicInput {
  id: string;
  moduleNumber?: number;
  code: string;
  title: string;
  summary: string;
  subtopics: string[];
  learningObjectives?: string[];
  futureExpansion?: FutureExpansionSpace;
  futureContentNote?: string;
  questions?: AssessmentQuestion[];
  assessmentQuestions?: AssessmentQuestion[];
}

/**
 * Normalized topic shape guaranteed by fullSyllabus.ts.
 */
export interface NormalizedSyllabusTopic extends SyllabusTopicInput {
  futureContentNote: string;
  questions: AssessmentQuestion[];
  assessmentQuestions: AssessmentQuestion[];
}

export interface WorkedExampleItemInput {
  id: string;
  code?: string;
  title: string;
  kind?: 'worked_example' | 'worked_project' | 'capstone_project' | 'practical_exercise';
  description?: string;
  brief?: string;
  requiresCalcNote?: boolean;
  statusLabel?: string;
  selfReviewChecklist?: string[];
  checklist?: string[];
  requiresSelfReview?: boolean;
}

export interface NormalizedWorkedExampleItem extends WorkedExampleItemInput {
  brief: string;
  checklist: string[];
  requiresSelfReview: boolean;
}

/**
 * Raw module shape used in module data files (modules0to3.ts .. modules16to19.ts).
 */
export interface SyllabusModule {
  id?: string;
  code?: string;
  moduleNumber: number; // 0 to 19 inclusive
  title: string;
  shortTitle: string;
  suggestedDuration?: string;
  yearPathway?: 'Year 1' | 'Years 2–3' | 'Years 3–4+';
  year1Months?: string;
  whyItMatters: string;
  introduction?: string;
  summary?: string;
  objectives: string[];
  learningGate: string | string[];
  learningGateItems?: string[];
  prerequisiteModuleNumbers?: number[];
  topics: SyllabusTopicInput[];
  workedExamples?: WorkedExampleItemInput[];
  WorkedExamples?: WorkedExampleItemInput[];
  resources?: string[];
  standardsNotice?: string;
  moduleAssessmentQuestions?: AssessmentQuestion[];
  moduleAssessment?: AssessmentQuestion[];
}

/**
 * Normalized module shape guaranteed by ALL_SYLLABUS_MODULES in fullSyllabus.ts.
 */
export interface NormalizedSyllabusModule extends SyllabusModule {
  id: string;
  code: string;
  summary: string;
  introduction: string;
  learningGate: string;
  learningGateItems: string[];
  topics: NormalizedSyllabusTopic[];
  workedExamples: NormalizedWorkedExampleItem[];
  WorkedExamples: NormalizedWorkedExampleItem[];
  moduleAssessmentQuestions: AssessmentQuestion[];
  moduleAssessment: AssessmentQuestion[];
}

export type SyllabusTopic = NormalizedSyllabusTopic;

export interface StudyRuleItem {
  stepNumber: number;
  number: number;
  id: string;
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

export interface IntegratedMilestoneItem {
  id: string;
  code: string;
  title: string;
  Timing: string;
  afterModule: number;
  description: string;
  brief: string;
  deliverables: string[];
  requiredItems: {
    category: string;
    label: string;
    requiredCount: number;
  }[];
  passCondition: string;
  prerequisiteModuleNumbers: number[];
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

export interface QuestionSubmissionResult {
  questionId: string;
  topicId: string;
  submittedValue: string;
  isCorrect: boolean;
  correctAnswerDisplay: string;
  expectedDisplay: string;
  explanation: string;
  assumptionsAndLimitations: string;
}

export interface AssessmentSubmissionResult {
  assessmentId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  displayPercentage: string;
  passed: boolean;
  submittedAtIso: string;
  itemResults: QuestionSubmissionResult[];
}

export interface AssessmentAttemptRecord {
  attemptId: string;
  assessmentId: string;
  assessmentType: 'topic' | 'module';
  assessmentKind: 'topic' | 'module';
  moduleId: string;
  moduleNumber: number;
  topicId?: string;
  title: string;
  timestampIso: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  exactPercentage: number;
  displayPercentage: string;
  passed: boolean;
}

export interface TopicOrModuleProgressEntry {
  attemptsCount: number;
  bestScorePercent: number;
  passed: boolean;
  lastAttemptIso: string | null;
}

export interface CourseProgressState {
  schemaVersion: 2;
  courseRevisionId: string;
  createdAtIso: string;
  updatedAtIso: string;
  modules: Record<string, TopicOrModuleProgressEntry>;
  topics: Record<string, TopicOrModuleProgressEntry>;
  attemptHistory: AssessmentAttemptRecord[];
}

export interface ModuleCoverageReport {
  moduleId: string;
  moduleNumber: number;
  title: string;
  topicCount: number;
  totalTopicQuestions: number;
  moduleAssessmentQuestions: number;
  topics: {
    topicId: string;
    code: string;
    title: string;
    topicQuestionCount: number;
    moduleQuestionCount: number;
    questionIds: string[];
  }[];
}
