import { ALL_SYLLABUS_MODULES } from '../data/fullSyllabus';

export interface ReferenceDocumentChunk {
  chunkId: string;
  docId: string;
  docTitle: string;
  citationLabel: string;
  moduleNumber?: number;
  content: string;
  keywords: string[];
  isUserUploaded: boolean;
}

export interface UserUploadedReferenceDoc {
  docId: string;
  title: string;
  sourceCitation: string;
  moduleNumber?: number;
  uploadedAt: string;
  rawText: string;
}

export interface GroundedRetrievalResult {
  query: string;
  synthesisedAnswer: string;
  citations: {
    chunkId: string;
    docTitle: string;
    citationLabel: string;
    excerpt: string;
    relevanceScore: number;
  }[];
  generatedPracticePrompt?: {
    prompt: string;
    answerSummary: string;
    sourceCitation: string;
  };
}

export const USER_DOCS_STORAGE_KEY = 'structtutor_reference_library_v1';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where',
  'how', 'why', 'are', 'was', 'were', 'into', 'over', 'under', 'between', 'used',
  'can', 'must', 'should', 'does', 'have', 'has', 'had', 'not', 'but',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_²³⁴·/-]+/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 2 && !STOP_WORDS.has(tok));
}

export function chunkUserDocument(doc: UserUploadedReferenceDoc): ReferenceDocumentChunk[] {
  const paragraphs = doc.rawText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 25);

  if (paragraphs.length === 0 && doc.rawText.trim().length > 0) {
    paragraphs.push(doc.rawText.trim());
  }

  return paragraphs.map((para, idx) => ({
    chunkId: `${doc.docId}-C${idx + 1}`,
    docId: doc.docId,
    docTitle: doc.title,
    citationLabel: `${doc.sourceCitation} (Passage ${idx + 1})`,
    moduleNumber: doc.moduleNumber,
    content: para,
    keywords: tokenize(`${doc.title} ${doc.sourceCitation} ${para}`),
    isUserUploaded: true,
  }));
}

let cachedBuiltInChunks: ReferenceDocumentChunk[] | null = null;

export function getBuiltInSyllabusChunks(): ReferenceDocumentChunk[] {
  if (cachedBuiltInChunks) return cachedBuiltInChunks;
  const chunks: ReferenceDocumentChunk[] = [];

  for (const mod of ALL_SYLLABUS_MODULES) {
    chunks.push({
      chunkId: `SYL-MOD${mod.moduleNumber}-OVERVIEW`,
      docId: `SYL-MOD-${mod.moduleNumber}`,
      docTitle: `Module ${mod.moduleNumber}: ${mod.title}`,
      citationLabel: `${mod.code} Overview & Learning Gate`,
      moduleNumber: mod.moduleNumber,
      content: `${mod.whyItMatters} ${mod.introduction} Learning Gate: ${mod.learningGate}`,
      keywords: tokenize(`${mod.title} ${mod.whyItMatters} ${mod.learningGate}`),
      isUserUploaded: false,
    });

    for (const we of mod.workedExamples) {
      const stepsText = we.keySteps.join(' ');
      chunks.push({
        chunkId: `SYL-${we.id}`,
        docId: `SYL-MOD-${mod.moduleNumber}`,
        docTitle: `Module ${mod.moduleNumber}: ${mod.title}`,
        citationLabel: `Worked Example ${we.id}: ${we.title}`,
        moduleNumber: mod.moduleNumber,
        content: `Scenario: ${we.scenario}. Steps: ${stepsText} Verification check: ${we.checkMethod}`,
        keywords: tokenize(`${we.title} ${we.scenario} ${stepsText} ${we.checkMethod}`),
        isUserUploaded: false,
      });
    }

    for (const topic of mod.topics) {
      chunks.push({
        chunkId: `SYL-${topic.id}`,
        docId: `SYL-MOD-${mod.moduleNumber}`,
        docTitle: `Module ${mod.moduleNumber}: ${mod.title}`,
        citationLabel: `Topic ${topic.code}: ${topic.title}`,
        moduleNumber: mod.moduleNumber,
        content: `${topic.summary} Key subtopics: ${topic.subtopics.join('; ')}.`,
        keywords: tokenize(`${topic.title} ${topic.summary} ${topic.subtopics.join(' ')}`),
        isUserUploaded: false,
      });
    }
  }

  cachedBuiltInChunks = chunks;
  return chunks;
}

export function loadUserReferenceDocs(storage?: Storage): UserUploadedReferenceDoc[] {
  const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!target) return [];
  try {
    const raw = target.getItem(USER_DOCS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserReferenceDocs(
  docs: UserUploadedReferenceDoc[],
  storage?: Storage
): void {
  const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!target) return;
  try {
    target.setItem(USER_DOCS_STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // Ignore quota errors
  }
}

export function queryGroundedReferenceLibrary(
  query: string,
  userDocs: UserUploadedReferenceDoc[] = [],
  filterModuleNumber?: number,
  topK = 4
): GroundedRetrievalResult {
  const queryTokens = tokenize(query);
  const allChunks: ReferenceDocumentChunk[] = [
    ...userDocs.flatMap((d) => chunkUserDocument(d)),
    ...getBuiltInSyllabusChunks(),
  ].filter((c) => filterModuleNumber === undefined || c.moduleNumber === filterModuleNumber);

  if (queryTokens.length === 0) {
    const fallback = allChunks.slice(0, topK);
    return {
      query,
      synthesisedAnswer:
        'Enter a structural engineering term, formula, or Eurocode concept (e.g. "lateral torsional buckling", "padstone bearing", "effective stress", "shear area") to retrieve citation-grounded passages.',
      citations: fallback.map((c) => ({
        chunkId: c.chunkId,
        docTitle: c.docTitle,
        citationLabel: c.citationLabel,
        excerpt: c.content,
        relevanceScore: 1,
      })),
    };
  }

  const scored = allChunks.map((chunk) => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = `${chunk.docTitle} ${chunk.citationLabel}`.toLowerCase();

    for (const qt of queryTokens) {
      if (titleLower.includes(qt)) score += 4.5;
      if (chunk.keywords.includes(qt)) score += 2.5;
      else if (contentLower.includes(qt)) score += 1.5;
    }
    if (chunk.isUserUploaded && score > 0) {
      score += 2.0; // Boost user-uploaded textbook extracts when relevant
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((s) => s.score > 0).slice(0, topK);

  if (best.length === 0) {
    return {
      query,
      synthesisedAnswer: `No exact match found in the local reference library for "${query}". Try searching for core structural terms such as "bending moment", "Euler buckling", "LTB", "pad foundation", or upload your textbook notes below.`,
      citations: [],
    };
  }

  const topCitations = best.map((item) => ({
    chunkId: item.chunk.chunkId,
    docTitle: item.chunk.docTitle,
    citationLabel: item.chunk.citationLabel,
    excerpt: item.chunk.content,
    relevanceScore: Number(item.score.toFixed(1)),
  }));

  const primary = topCitations[0];
  const secondary = topCitations[1];

  const synthesisedAnswer =
    `Grounded in ${primary.citationLabel} (${primary.docTitle}): ${primary.excerpt}` +
    (secondary
      ? ` Complementary reference (${secondary.citationLabel}): ${secondary.excerpt}`
      : '');

  return {
    query,
    synthesisedAnswer,
    citations: topCitations,
    generatedPracticePrompt: {
      prompt: `Based on ${primary.citationLabel}, explain the governing assumptions and perform a self-check for: "${primary.docTitle}".`,
      answerSummary: primary.excerpt,
      sourceCitation: primary.citationLabel,
    },
  };
}
