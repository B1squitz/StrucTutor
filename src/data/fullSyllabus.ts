import {
  AssessmentQuestion,
  NormalizedSyllabusModule,
  NormalizedSyllabusTopic,
  NormalizedWorkedExampleItem,
  SyllabusModule,
} from '../types/syllabus';
import { MODULES_0_TO_3 } from './modules0to3';
import { MODULES_4_TO_7 } from './modules4to7';
import { MODULES_8_TO_11 } from './modules8to11';
import { MODULES_12_TO_15 } from './modules12to15';
import { MODULES_16_TO_19 } from './modules16to19';

function normalizeModule(raw: SyllabusModule): NormalizedSyllabusModule {
  const moduleNumber: number = raw.moduleNumber;
  const padded = String(moduleNumber).padStart(2, '0');
  const id: string = raw.id ?? raw.code ?? `MOD-${padded}`;
  const code: string = raw.code ?? raw.id ?? `MOD-${padded}`;

  const rawTitle: string = raw.title ?? '';
  const cleanTitle = rawTitle.replace(/^Module\s+\d+\s*:\s*/i, '');

  const summary: string = raw.summary ?? raw.introduction ?? '';
  const introduction: string = raw.introduction ?? raw.summary ?? '';

  const learningGateItems: string[] = Array.isArray(raw.learningGate)
    ? raw.learningGate
    : [String(raw.learningGate ?? '')];
  const learningGate: string = Array.isArray(raw.learningGate)
    ? raw.learningGate.join(' ')
    : String(raw.learningGate ?? '');

  const topics: NormalizedSyllabusTopic[] = (raw.topics ?? []).map((t) => {
    const qs: AssessmentQuestion[] = t.assessmentQuestions ?? t.questions ?? [];
    const futureNote: string =
      t.futureContentNote ??
      (t.futureExpansion
        ? `${t.futureExpansion.lessonsPlanned} ${t.futureExpansion.workedExamplesPlanned} (${t.futureExpansion.sourceReferencesNeeded})`
        : 'Expandable slot for future textbook derivations, worked examples, and standard clauses.');

    return {
      id: t.id,
      moduleNumber,
      code: t.code,
      title: t.title,
      summary: t.summary,
      subtopics: t.subtopics ?? [],
      learningObjectives: t.learningObjectives ?? [],
      futureExpansion: t.futureExpansion ?? {
        lessonsPlanned: futureNote,
        workedExamplesPlanned: futureNote,
        calculationsPlanned: futureNote,
        sourceReferencesNeeded: 'Controlled BSI/Eurocode standards and textbook references.',
      },
      futureContentNote: futureNote,
      questions: qs,
      assessmentQuestions: qs,
    };
  });

  const rawWorked = raw.WorkedExamples ?? raw.workedExamples ?? [];
  const workedExamples: NormalizedWorkedExampleItem[] = rawWorked.map((w) => {
    const brief = w.brief ?? w.description ?? '';
    const checklist = w.checklist ?? w.selfReviewChecklist ?? [];
    return {
      id: w.id,
      code: w.code ?? w.id,
      title: w.title,
      kind: w.kind ?? 'worked_example',
      description: brief,
      brief,
      requiresCalcNote: w.requiresCalcNote ?? true,
      statusLabel: w.statusLabel ?? 'Self-Review Practice Activity',
      selfReviewChecklist: checklist,
      checklist,
      requiresSelfReview: true,
    };
  });

  const modExamQs: AssessmentQuestion[] =
    raw.moduleAssessment ?? raw.moduleAssessmentQuestions ?? [];

  return {
    id,
    code,
    moduleNumber,
    title: cleanTitle,
    shortTitle: raw.shortTitle ?? cleanTitle,
    suggestedDuration: raw.suggestedDuration ?? '4–8 weeks',
    yearPathway: raw.yearPathway ?? 'Year 1',
    year1Months: raw.year1Months ?? '',
    whyItMatters: raw.whyItMatters ?? '',
    introduction,
    summary,
    objectives: raw.objectives ?? [],
    learningGate,
    learningGateItems,
    prerequisiteModuleNumbers: raw.prerequisiteModuleNumbers ?? [],
    topics,
    workedExamples,
    WorkedExamples: workedExamples,
    resources: raw.resources ?? [],
    standardsNotice:
      raw.standardsNotice ??
      'Educational foundation material — verify code clauses and partial factors against controlled BSI/Eurocode standards and UK National Annexes.',
    moduleAssessmentQuestions: modExamQs,
    moduleAssessment: modExamQs,
  };
}

export const ALL_SYLLABUS_MODULES: NormalizedSyllabusModule[] = [
  ...MODULES_0_TO_3,
  ...MODULES_4_TO_7,
  ...MODULES_8_TO_11,
  ...MODULES_12_TO_15,
  ...MODULES_16_TO_19,
].map(normalizeModule);

/**
 * Looks up a module by its exact moduleNumber (0 to 19 inclusive).
 * Explicitly preserves 0 as a valid module number.
 */
export function getModuleByNumber(
  moduleNumber: number
): NormalizedSyllabusModule | undefined {
  if (typeof moduleNumber !== 'number' || !Number.isInteger(moduleNumber)) {
    return undefined;
  }
  return ALL_SYLLABUS_MODULES.find((m) => m.moduleNumber === moduleNumber);
}

/**
 * Looks up a module by its string ID (e.g. 'MOD-00' to 'MOD-19').
 */
export function getModuleById(
  moduleId: string
): NormalizedSyllabusModule | undefined {
  return ALL_SYLLABUS_MODULES.find(
    (m) => m.id === moduleId || m.code === moduleId
  );
}

/**
 * Looks up a topic across all 20 modules by topic ID (e.g. 'MOD00-T1').
 */
export function getTopicById(
  topicId: string
): { module: NormalizedSyllabusModule; topic: NormalizedSyllabusTopic } | undefined {
  for (const mod of ALL_SYLLABUS_MODULES) {
    const found = mod.topics.find((t) => t.id === topicId);
    if (found) {
      return { module: mod, topic: found };
    }
  }
  return undefined;
}
