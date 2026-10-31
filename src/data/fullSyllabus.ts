import type {
  NormalizedSyllabusModule,
  SyllabusTopic,
  WorkedExampleItem,
  AssessmentQuestion,
} from '../types/syllabus';
import { verifyQuestionWithSolver } from '../utils/verificationRegistry';

import mod00 from '../content/modules/module-00.json';
import mod01 from '../content/modules/module-01.json';
import mod02 from '../content/modules/module-02.json';
import mod03 from '../content/modules/module-03.json';
import mod04 from '../content/modules/module-04.json';
import mod05 from '../content/modules/module-05.json';
import mod06 from '../content/modules/module-06.json';
import mod07 from '../content/modules/module-07.json';
import mod08 from '../content/modules/module-08.json';
import mod09 from '../content/modules/module-09.json';
import mod10 from '../content/modules/module-10.json';
import mod11 from '../content/modules/module-11.json';
import mod12 from '../content/modules/module-12.json';
import mod13 from '../content/modules/module-13.json';
import mod14 from '../content/modules/module-14.json';
import mod15 from '../content/modules/module-15.json';
import mod16 from '../content/modules/module-16.json';
import mod17 from '../content/modules/module-17.json';
import mod18 from '../content/modules/module-18.json';
import mod19 from '../content/modules/module-19.json';

function normalizeQuestion(
  q: Record<string, unknown>,
  moduleNumber: number,
  fallbackTopicId: string
): AssessmentQuestion {
  const id = String(q.id ?? '');
  const type = q.type === 'mcq' ? 'mcq' : 'numeric';
  const correctOptionIndex =
    type === 'mcq'
      ? Number(q.correctOptionIndex ?? q.correctAnswer ?? 0)
      : undefined;
  const correctAnswer =
    type === 'mcq'
      ? Number(correctOptionIndex ?? 0)
      : Number(q.correctAnswer ?? 0);
  const tolerance =
    q.tolerance !== undefined ? Number(q.tolerance) : undefined;

  // Dynamically run the deterministic Solver Verification Registry (N5).
  // A question is ONLY marked 'Verified' if its solver spec dynamically computes
  // and matches `correctAnswer` within tolerance. Otherwise it strictly stays 'Draft'.
  const solverAudit = verifyQuestionWithSolver({
    id,
    type,
    correctAnswer,
    tolerance,
    solverVerificationId: q.solverVerificationId
      ? String(q.solverVerificationId)
      : undefined,
  });

  const reviewStatus: AssessmentQuestion['reviewStatus'] =
    solverAudit.isVerified ? 'Verified' : 'Draft';
  const solverVerificationId = solverAudit.isVerified
    ? solverAudit.solverId
    : undefined;

  const reviewNotice = solverAudit.isVerified
    ? solverAudit.reason
    : 'Draft study item: verify all clauses, partial factors, and calculations against controlled BSI/Eurocode standards and UK National Annexes before engineering use.';

  return {
    id,
    moduleNumber,
    topicId: String(q.topicId ?? fallbackTopicId),
    learningObjective: String(q.learningObjective ?? ''),
    type,
    prompt: String(q.prompt ?? ''),
    assumptions: Array.isArray(q.assumptions)
      ? (q.assumptions as string[])
      : typeof q.assumptions === 'string' && q.assumptions.trim()
      ? [q.assumptions.trim()]
      : ['Linear elastic behaviour and consistent SI units'],
    unit: q.unit ? String(q.unit) : undefined,
    correctAnswer,
    tolerance,
    options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
    correctOptionIndex,
    explanation: String(q.explanation ?? ''),
    citation: q.citation as AssessmentQuestion['citation'],
    hints:
      Array.isArray(q.hints) && q.hints.length > 0
        ? (q.hints as string[])
        : [
            'Identify the governing equilibrium or constitutive equation and convert all inputs to consistent SI units (N, mm, MPa).',
            'Check the boundary conditions, lever arm, and sign convention before computing the final numerical value.',
          ],
    caseFamilyId: q.caseFamilyId ? String(q.caseFamilyId) : undefined,
    solverVerificationId,
    reviewStatus,
    reviewNotice,
  };
}

function hydrateModule(raw: Record<string, unknown>): NormalizedSyllabusModule {
  const moduleNumber = Number(raw.moduleNumber ?? 0);
  const code = String(raw.code ?? `MOD-${String(moduleNumber).padStart(2, '0')}`);
  const id = `MOD-${String(moduleNumber).padStart(2, '0')}`;
  const title = String(raw.title ?? `Module ${moduleNumber}`);
  const shortTitle = String(
    raw.shortTitle ?? title.replace(/^Module\s+\d+\s*:\s*/i, '')
  );
  const subtitle = String(raw.subtitle ?? shortTitle);
  const introduction = String(raw.introduction ?? raw.summary ?? '');
  const whyItMatters = String(raw.whyItMatters ?? '');
  const summary = String(raw.summary ?? introduction);

  const rawTopics = Array.isArray(raw.topics)
    ? (raw.topics as Array<Record<string, unknown>>)
    : [];

  const topics: SyllabusTopic[] = rawTopics.map((t, tIdx) => {
    const topicId = String(t.id ?? `M${moduleNumber}-T${tIdx + 1}`);
    const rawQs = (
      Array.isArray(t.questions)
        ? t.questions
        : Array.isArray(t.assessmentQuestions)
        ? t.assessmentQuestions
        : []
    ) as Array<Record<string, unknown>>;

    const questions = rawQs.map((q) =>
      normalizeQuestion(q, moduleNumber, topicId)
    );
    const futureExpansion = Array.isArray(t.futureExpansion)
      ? (t.futureExpansion as string[])
      : [];
    const futureContentNote = String(
      t.futureContentNote ??
        (futureExpansion.length > 0
          ? futureExpansion.join('; ')
          : 'Planned expansion for textbook extracts and Eurocode / UK NA clause drills.')
    );

    return {
      id: topicId,
      code: String(t.code ?? `${moduleNumber}.${tIdx + 1}`),
      title: String(t.title ?? ''),
      summary: String(t.summary ?? ''),
      subtopics: Array.isArray(t.subtopics) ? (t.subtopics as string[]) : [],
      futureExpansion,
      futureContentNote,
      questions,
      assessmentQuestions: questions,
    };
  });

  const validTopicIds = new Set(topics.map((t) => t.id));

  const rawModuleAssessment = (
    Array.isArray(raw.moduleAssessment)
      ? raw.moduleAssessment
      : Array.isArray(raw.moduleAssessmentQuestions)
      ? raw.moduleAssessmentQuestions
      : []
  ) as Array<Record<string, unknown>>;

  const moduleAssessment: AssessmentQuestion[] = rawModuleAssessment.map(
    (mq, idx) => {
      const candidateTopicId = String(mq.topicId ?? '');
      const assignedTopicId = validTopicIds.has(candidateTopicId)
        ? candidateTopicId
        : topics[idx % Math.max(1, topics.length)]?.id ?? `M${moduleNumber}-T1`;
      return normalizeQuestion(mq, moduleNumber, assignedTopicId);
    }
  );

  const rawWorked = Array.isArray(raw.workedExamples)
    ? (raw.workedExamples as Array<Record<string, unknown>>)
    : Array.isArray(raw.WorkedExamples)
    ? (raw.WorkedExamples as Array<Record<string, unknown>>)
    : [];

  const workedExamples: WorkedExampleItem[] = rawWorked.map((we) => {
    const scenario = String(we.scenario ?? we.brief ?? '');
    const keySteps = Array.isArray(we.keySteps)
      ? (we.keySteps as string[])
      : Array.isArray(we.checklist)
      ? (we.checklist as string[])
      : [];
    return {
      id: String(we.id ?? ''),
      title: String(we.title ?? ''),
      scenario,
      brief: String(we.brief ?? scenario),
      keySteps,
      checklist: keySteps,
      learningPurpose: String(we.learningPurpose ?? ''),
      checkMethod: String(
        we.checkMethod ?? 'Independent equilibrium and dimensional check'
      ),
      status: String(we.status ?? 'Foundation Framework Ready'),
      reviewStatus:
        (we.reviewStatus as WorkedExampleItem['reviewStatus']) ?? 'Verified',
    };
  });

  const learningObjectives = Array.isArray(raw.learningObjectives)
    ? (raw.learningObjectives as string[])
    : Array.isArray(raw.objectives)
    ? (raw.objectives as string[])
    : [];

  const learningGates = Array.isArray(raw.learningGates)
    ? (raw.learningGates as string[])
    : typeof raw.learningGate === 'string' && raw.learningGate.trim()
    ? raw.learningGate
        .split(/\.,\s*/)
        .map((s, idx, arr) => (idx < arr.length - 1 && !s.endsWith('.') ? `${s.trim()}.` : s.trim()))
        .filter(Boolean)
    : ['Achieve >= 90% on all topic assessments and the 20-question module exam.'];

  const learningGate = learningGates.join(' • ');

  const rawStudyRule = (raw.studyRuleApplication ?? {}) as Record<string, string>;
  const rawFuture = (raw.futureExpansion ?? {}) as Record<string, string[]>;

  return {
    id,
    moduleNumber,
    code,
    title,
    shortTitle,
    subtitle,
    summary,
    introduction,
    whyItMatters,
    suggestedDuration: String(raw.suggestedDuration ?? '6 to 10 weeks'),
    yearPathway: String(raw.yearPathway ?? 'Core Rebuild Programme'),
    standardsNotice: String(
      raw.standardsNotice ??
        'Prepared for controlled Eurocode and UK National Annex extracts.'
    ),
    learningGate,
    learningGates,
    objectives: learningObjectives,
    learningObjectives,
    topics,
    workedExamples,
    WorkedExamples: workedExamples,
    studyRuleApplication: {
      explain: String(rawStudyRule.explain ?? ''),
      sketch: String(rawStudyRule.sketch ?? ''),
      calculate: String(rawStudyRule.calculate ?? ''),
      check: String(rawStudyRule.check ?? ''),
      assumptions: String(rawStudyRule.assumptions ?? ''),
    },
    futureExpansion: {
      plannedTextbooks: Array.isArray(rawFuture.plannedTextbooks)
        ? rawFuture.plannedTextbooks
        : [],
      plannedStandards: Array.isArray(rawFuture.plannedStandards)
        ? rawFuture.plannedStandards
        : [],
      plannedWorkedExamples: Array.isArray(rawFuture.plannedWorkedExamples)
        ? rawFuture.plannedWorkedExamples
        : [],
      plannedDrawingTasks: Array.isArray(rawFuture.plannedDrawingTasks)
        ? rawFuture.plannedDrawingTasks
        : [],
    },
    moduleAssessment,
    moduleAssessmentQuestions: moduleAssessment,
  };
}

const RAW_MODULES: Array<Record<string, unknown>> = [
  mod00,
  mod01,
  mod02,
  mod03,
  mod04,
  mod05,
  mod06,
  mod07,
  mod08,
  mod09,
  mod10,
  mod11,
  mod12,
  mod13,
  mod14,
  mod15,
  mod16,
  mod17,
  mod18,
  mod19,
] as unknown as Array<Record<string, unknown>>;

export const ALL_SYLLABUS_MODULES: NormalizedSyllabusModule[] = RAW_MODULES.map(
  hydrateModule
).sort((a, b) => a.moduleNumber - b.moduleNumber);

export function getModuleByNumber(
  moduleNumber: number
): NormalizedSyllabusModule | undefined {
  return ALL_SYLLABUS_MODULES.find((m) => m.moduleNumber === moduleNumber);
}

export function getModuleById(
  moduleId: string
): NormalizedSyllabusModule | undefined {
  return ALL_SYLLABUS_MODULES.find(
    (m) => m.id === moduleId || m.code === moduleId
  );
}

export function getTopicById(
  topicId: string
): { module: NormalizedSyllabusModule; topic: SyllabusTopic } | undefined {
  for (const mod of ALL_SYLLABUS_MODULES) {
    const topic = mod.topics.find((t) => t.id === topicId);
    if (topic) {
      return { module: mod, topic };
    }
  }
  return undefined;
}

export async function loadModuleByNumberAsync(
  moduleNumber: number
): Promise<NormalizedSyllabusModule | undefined> {
  return getModuleByNumber(moduleNumber);
}
