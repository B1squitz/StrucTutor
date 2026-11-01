import type { ChatMessage } from './buildQuestionContext';

export interface QuestionChatState {
  history: ChatMessage[];
  attachedPdfText?: string;
  attachedFileName?: string;
}

const STORAGE_PREFIX = 'structtutor:chat:';
const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

/**
 * Loads the persisted chat state for a specific question from localStorage.
 */
export function load(questionId: string): QuestionChatState {
  const key = `${STORAGE_PREFIX}${questionId}`;
  try {
    const storage = getStorage();
    const raw = storage ? storage.getItem(key) : memoryStore.get(key);
    if (!raw) {
      return { history: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      attachedPdfText:
        typeof parsed.attachedPdfText === 'string'
          ? parsed.attachedPdfText
          : undefined,
      attachedFileName:
        typeof parsed.attachedFileName === 'string'
          ? parsed.attachedFileName
          : undefined,
    };
  } catch (err) {
    console.warn(`Failed to load chat state for ${questionId}:`, err);
    return { history: [] };
  }
}

/**
 * Persists the chat state for a specific question in localStorage.
 */
export function save(questionId: string, state: QuestionChatState): void {
  const key = `${STORAGE_PREFIX}${questionId}`;
  try {
    const payload = JSON.stringify({
      history: state.history || [],
      attachedPdfText: state.attachedPdfText,
      attachedFileName: state.attachedFileName,
    });
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, payload);
    } else {
      memoryStore.set(key, payload);
    }
  } catch (err) {
    console.warn(`Failed to save chat state for ${questionId}:`, err);
  }
}

/**
 * Clears the chat state for a specific question from localStorage.
 */
export function clear(questionId: string): void {
  const key = `${STORAGE_PREFIX}${questionId}`;
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    } else {
      memoryStore.delete(key);
    }
  } catch (err) {
    console.warn(`Failed to clear chat state for ${questionId}:`, err);
  }
}
