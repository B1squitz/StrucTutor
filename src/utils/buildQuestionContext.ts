export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citations?: Array<{ sourceDoc: string; similarity: number; preview: string }>;
}

export interface QuestionContextItem {
  id: string;
  title?: string;
  learningObjective?: string;
  prompt: string;
  type?: string;
  options?: string[];
  unit?: string;
  assumptions?: string | string[];
}

export interface BuildQuestionContextArgs {
  question: QuestionContextItem | any;
  userDraft?: string;
  revealedHints?: string[];
  solutionUnlocked: boolean;
  attachedPdfText?: string;
  history: ChatMessage[];
}

export const VERBATIM_LATEX_INSTRUCTION =
  "You are tutoring this specific question. Reference the user's current working where relevant. Write all mathematics as LaTeX using \\[ … \\] for display equations and \\( … \\) for inline maths. Do NOT use $…$, $$…$$, or markdown code fences around maths. Do NOT emit JSON, arrays, or [{ … }] wrappers.";

export const MAX_ATTACHED_PDF_LENGTH = 4000;

/**
 * Builds the system prompt and conversation messages for tutoring a specific question.
 */
export function buildQuestionContext(args: BuildQuestionContextArgs): {
  systemPrompt: string;
  messages: ChatMessage[];
} {
  const {
    question,
    userDraft,
    revealedHints = [],
    solutionUnlocked,
    attachedPdfText,
    history = [],
  } = args;

  const sections: string[] = [];

  // Question ID, Title, and Full Question Text
  const qId = question?.id || 'Unknown Question';
  const qTitle = question?.title || question?.learningObjective || qId;
  sections.push(`Question ID: ${qId}`);
  sections.push(`Title: ${qTitle}`);
  sections.push(`Full Question Text:\n${question?.prompt || ''}`);

  // Options and/or Units
  if (Array.isArray(question?.options) && question.options.length > 0) {
    const opts = question.options
      .map((opt: string, i: number) => `  ${String.fromCharCode(65 + i)}) ${opt}`)
      .join('\n');
    sections.push(`Options:\n${opts}`);
  }
  if (question?.unit) {
    sections.push(`Required Unit: ${question.unit}`);
  }

  // User's current draft working
  if (userDraft && userDraft.trim()) {
    sections.push(`User's Current Draft Working:\n${userDraft.trim()}`);
  } else {
    sections.push(`User's Current Draft Working: None`);
  }

  // Hints already revealed
  if (revealedHints && revealedHints.length > 0) {
    const hintsFormatted = revealedHints
      .map((h, i) => `Hint ${i + 1}: ${h}`)
      .join('\n');
    sections.push(`Hints Already Revealed:\n${hintsFormatted}`);
  } else {
    sections.push(`Hints Already Revealed: None`);
  }

  // Solution status & answer reveal restriction
  if (solutionUnlocked) {
    sections.push(
      `Solution Status: UNLOCKED.\nThe full worked solution is unlocked. You may explain the full solution and confirm the final answer if asked.`
    );
  } else {
    sections.push(
      `Solution Status: LOCKED.\nThe solution is locked. Do not reveal the final answer or the correct option choice under any circumstances. Guide the user step by step through mechanics principles, equilibrium equations, and intermediate steps without stating the final answer.`
    );
  }

  // Attached PDF text (truncated if very long)
  if (attachedPdfText && attachedPdfText.trim()) {
    let pdfText = attachedPdfText.trim();
    if (pdfText.length > MAX_ATTACHED_PDF_LENGTH) {
      pdfText = pdfText.slice(0, MAX_ATTACHED_PDF_LENGTH) + '\n[truncated]';
    }
    sections.push(`Attached Reference Material (PDF):\n${pdfText}`);
  }

  // Verbatim LaTeX instruction
  sections.push(VERBATIM_LATEX_INSTRUCTION);

  const systemPrompt = sections.join('\n\n');

  return {
    systemPrompt,
    messages: history,
  };
}
