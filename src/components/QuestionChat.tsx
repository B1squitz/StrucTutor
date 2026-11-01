import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  Square,
  Loader2,
  Trash2,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { RichMessage } from './RichMessage';
import {
  buildQuestionContext,
  type ChatMessage,
} from '../utils/buildQuestionContext';
import { load, save, clear } from '../utils/questionChatStore';
import { parsePdf } from '../utils/parsePdf';

export interface QuestionChatProps {
  question: any;
  userDraft?: string;
  revealedHints?: string[];
  solutionUnlocked?: boolean;
}

export const QuestionChat: React.FC<QuestionChatProps> = ({
  question,
  userDraft,
  revealedHints,
  solutionUnlocked = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedPdfText, setAttachedPdfText] = useState<string | undefined>();
  const [attachedFileName, setAttachedFileName] = useState<string | undefined>();
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryPrompt, setRetryPrompt] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questionId = question?.id || 'default-question';

  // Load per-question chat history on mount or when questionId changes
  useEffect(() => {
    if (!questionId) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setInputText('');
    const stored = load(questionId);
    setMessages(stored.history || []);
    setAttachedPdfText(stored.attachedPdfText);
    setAttachedFileName(stored.attachedFileName);
    setErrorMessage(null);
    setRetryPrompt(null);
  }, [questionId]);

  // Scroll to bottom when messages update or panel opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isStreaming]);

  // Handle Clear chat
  const handleClear = () => {
    if (!questionId) return;
    clear(questionId);
    setMessages([]);
    setAttachedPdfText(undefined);
    setAttachedFileName(undefined);
    setErrorMessage(null);
    setRetryPrompt(null);
  };

  // Handle PDF file attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsExtractingPdf(true);
    setErrorMessage(null);

    try {
      const text = await parsePdf(file);
      setAttachedPdfText(text);
      setAttachedFileName(file.name);

      save(questionId, {
        history: messages,
        attachedPdfText: text,
        attachedFileName: file.name,
      });
    } catch (err) {
      console.warn('PDF extraction failed:', err);
      setErrorMessage(
        `Failed to parse PDF "${file.name}". Please ensure it contains readable text.`
      );
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setAttachedPdfText(undefined);
    setAttachedFileName(undefined);
    save(questionId, {
      history: messages,
      attachedPdfText: undefined,
      attachedFileName: undefined,
    });
  };

  // Stop streaming response
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Send message to local Ollama instance
  const handleSend = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? inputText).trim();
    if (!textToSend || isStreaming) return;

    setErrorMessage(null);
    setRetryPrompt(null);
    setInputText('');

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);

    // Keep textarea focus while streaming
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const assistantId = `a-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([...updatedHistory, assistantPlaceholder]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { systemPrompt } = buildQuestionContext({
        question,
        userDraft,
        revealedHints,
        solutionUnlocked: Boolean(solutionUnlocked),
        attachedPdfText,
        history: updatedHistory,
      });

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3-vl:4b',
          prompt: textToSend,
          system: systemPrompt,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status code ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Readable stream not supported on this browser.');

      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed);
            if (chunk.response) {
              accumulatedText += chunk.response;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: accumulatedText } : m
                )
              );
            }
          } catch {
            // Wait for next chunk on partial JSON line
          }
        }
      }

      const finalMessages = [
        ...updatedHistory,
        {
          ...assistantPlaceholder,
          text: accumulatedText || 'No response generated.',
        },
      ];

      setMessages(finalMessages);
      save(questionId, {
        history: finalMessages,
        attachedPdfText,
        attachedFileName,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) => {
          save(questionId, {
            history: prev,
            attachedPdfText,
            attachedFileName,
          });
          return prev;
        });
      } else {
        console.warn('Ollama connection failed:', err);
        // Remove empty placeholder on error
        setMessages(updatedHistory);
        setErrorMessage(
          'Could not reach local Ollama at http://localhost:11434. Make sure Ollama is running with qwen3-vl:4b.'
        );
        setRetryPrompt(textToSend);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mt-3 font-sans border-t border-slate-200 dark:border-slate-800 pt-3">
      {/* Collapsed Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          data-testid={`open-question-chat-${questionId}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          <span>Ask AI Tutor about this question</span>
          {messages.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-600 text-white">
              {messages.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded Collapsible Chat Panel */}
      {isOpen && (
        <div
          data-testid={`question-chat-panel-${questionId}`}
          className="rounded-2xl border border-blue-200 dark:border-slate-750 bg-slate-50/70 dark:bg-slate-950/70 p-3 sm:p-4 space-y-3 shadow-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                AI Engineering Tutor • {question?.id || 'Question'}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Collapse panel (Escape)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {messages.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Have a question about this calculation or concept?
                </p>
                <p>
                  Ask below, reference your draft steps, or attach a textbook extract.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div aria-live={isStreaming ? 'polite' : undefined}>
                        {m.text ? (
                          <RichMessage text={m.text} />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span>Thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`text-[9px] font-mono mt-1 ${
                        isUser ? 'text-blue-200 text-right' : 'text-slate-400 text-left'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Inline Error with Retry */}
            {errorMessage && (
              <div className="rounded-xl p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
                {retryPrompt && (
                  <button
                    type="button"
                    onClick={() => handleSend(retryPrompt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached PDF Chip */}
          {attachedFileName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">{attachedFileName}</span>
              <button
                type="button"
                onClick={handleRemovePdf}
                title="Remove attached PDF"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input & Action Bar */}
          <div className="flex items-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Paperclip Button */}
            <button
              type="button"
              disabled={isExtractingPdf || isStreaming}
              onClick={() => fileInputRef.current?.click()}
              title="Attach reference PDF (extracts relevant textbook text)"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isExtractingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              placeholder="Ask a question... (Enter to send, Shift+Enter for newline, Esc to close)"
              className="flex-1 max-h-24 min-h-[38px] py-2 px-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none font-sans"
            />

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                title="Stop response"
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shrink-0"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleSend()}
                title="Send question"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
