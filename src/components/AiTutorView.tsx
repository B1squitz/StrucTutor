import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  ingestPdfTextbook,
  generateEmbedding,
  findSimilarChunks,
  getStoredChunksCount,
  clearRagIndex,
  type IngestionProgress,
  type ChunkSimilarityResult,
} from '../utils/ragIndexer';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Array<{ sourceDoc: string; similarity: number; preview: string }>;
}

export const AiTutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am StructTutor, your structural engineering AI assistant. You can ask me general engineering questions or click "Upload Textbook" to index your PDFs for RAG retrieval.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState<IngestionProgress | null>(null);
  const [indexedChunksCount, setIndexedChunksCount] = useState<number>(0);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshChunksCount = async () => {
    try {
      const count = await getStoredChunksCount();
      setIndexedChunksCount(count);
    } catch (e) {
      console.warn('Failed to get chunks count:', e);
    }
  };

  useEffect(() => {
    refreshChunksCount();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isIngesting]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-uploaded if desired
    e.target.value = '';

    setIsIngesting(true);
    setStatusNotice(null);

    try {
      const storedCount = await ingestPdfTextbook(file, (p) => {
        setIngestProgress(p);
      });

      await refreshChunksCount();
      setStatusNotice(`Indexed ${storedCount} passages from "${file.name}".`);

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'ai',
          text: `📚 Textbook Ingestion Complete: Successfully indexed "${file.name}" (${storedCount} passages stored in local vector index). I will now reference these excerpts when answering your questions!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest PDF.';
      setStatusNotice(`Ingestion error: ${msg}`);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Ingestion failed for "${file.name}": ${msg}. Make sure Ollama is running and nomic-embed-text is available.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsIngesting(false);
      setIngestProgress(null);
    }
  };

  const handleClearIndex = async () => {
    if (!window.confirm('Clear all stored textbook embeddings from local storage?')) return;
    try {
      await clearRagIndex();
      await refreshChunksCount();
      setStatusNotice('Textbook index cleared.');
      setMessages((prev) => [
        ...prev,
        {
          id: `clear-${Date.now()}`,
          sender: 'ai',
          text: 'RAG index has been cleared. I will now answer without textbook excerpts.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      console.error('Failed to clear RAG index:', e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptText = inputText.trim();
    if (!promptText || isLoading || isIngesting) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Step 6: Query vector search & RAG augmentation
      let systemPrompt =
        'You are StructTutor, an expert structural engineering tutor helping a UK engineer. You explain concepts clearly, focus on statics, load paths, and Eurocodes, and use SI units (kN, mm, MPa).';
      let augmentedPrompt = promptText;
      let matchedCitations: Array<{ sourceDoc: string; similarity: number; preview: string }> = [];

      try {
        const storedCount = await getStoredChunksCount();
        if (storedCount > 0) {
          // Generate embedding for query using nomic-embed-text
          const queryEmbedding = await generateEmbedding(promptText);
          // Retrieve top 3 most similar textbook chunks
          const topMatches: ChunkSimilarityResult[] = await findSimilarChunks(queryEmbedding, 3);

          if (topMatches.length > 0) {
            matchedCitations = topMatches.map((m) => ({
              sourceDoc: m.chunk.sourceDoc,
              similarity: m.similarity,
              preview: m.chunk.text.slice(0, 160) + '...',
            }));

            // Add instruction to system prompt as required
            systemPrompt +=
              ' Use the following textbook excerpts to inform your answer. If the answer isn\'t in the excerpts, say so.';

            const excerptsBlock = topMatches
              .map(
                (m, idx) =>
                  `--- Textbook Excerpt ${idx + 1} (${m.chunk.sourceDoc}) ---\n${m.chunk.text}`
              )
              .join('\n\n');

            augmentedPrompt = `Reference Textbook Excerpts:\n${excerptsBlock}\n\nUser Question:\n${promptText}`;
          }
        }
      } catch (ragErr) {
        console.warn('RAG retrieval fallback to standard prompt:', ragErr);
      }

      // Send to Qwen 3 model via Ollama
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-vl:4b',
          prompt: augmentedPrompt,
          system: systemPrompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama server returned status ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.response ?? 'No response received from tutor.';

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: matchedCitations.length > 0 ? matchedCitations : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Could not connect to Ollama. Make sure Ollama is running at http://localhost:11434.';
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error connecting to AI Tutor: ${errorMsg}. Please ensure Ollama is running locally with qwen3-vl:4b and nomic-embed-text.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-[960px] mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4"
      data-testid="ai-tutor-view"
    >
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                AI Engineering Tutor
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                qwen3-vl:4b
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Interactive structural engineering assistant powered by local Ollama &amp; Textbook RAG
            </p>
          </div>
        </div>

        {/* RAG Index Status & Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border ${
              indexedChunksCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {indexedChunksCount > 0
                ? `${indexedChunksCount} Passages Indexed`
                : 'No Textbooks Indexed'}
            </span>
          </span>

          {indexedChunksCount > 0 && (
            <button
              type="button"
              onClick={handleClearIndex}
              title="Clear Textbook RAG Index"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-slate-500 pl-1 border-l border-slate-200 dark:border-slate-800">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[11px]">RAG Ready</span>
          </div>
        </div>
      </div>

      {/* PDF Processing Progress Banner */}
      {isIngesting && (
        <div
          data-testid="rag-ingestion-banner"
          className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-xs flex items-center gap-3 shrink-0"
        >
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-sky-400 animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-100">
              Processing Textbook PDF &amp; Generating Embeddings...
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 truncate mt-0.5">
              {ingestProgress?.message || 'Extracting and embedding passages with nomic-embed-text...'}
            </div>
          </div>
        </div>
      )}

      {/* Message History Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto shadow-xs space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 text-xs ${
                  isUser ? 'bg-slate-700 dark:bg-slate-600' : 'bg-blue-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-750 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <p>{msg.text}</p>

                  {/* Textbook Excerpts Citation Pill */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] text-blue-700 dark:text-sky-300 font-mono">
                        <FileText className="w-3 h-3" />
                        <span>Referenced Textbook Passages:</span>
                      </div>
                      <div className="space-y-1 mt-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                        {msg.citations.map((c, i) => (
                          <div key={i} className="flex items-center justify-between gap-2">
                            <span className="truncate">• {c.sourceDoc}</span>
                            <span className="text-slate-400 shrink-0">
                              {(c.similarity * 100).toFixed(0)}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      isUser ? 'text-blue-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 rounded-2xl rounded-tl-xs px-4 py-3 text-xs sm:text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="font-medium animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box, File Ingestion & Send Controls */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs flex items-center gap-2 shrink-0"
      >
        {/* Hidden PDF File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload PDF Textbook"
        />

        {/* Upload Textbook Button */}
        <button
          type="button"
          disabled={isIngesting || isLoading}
          onClick={() => fileInputRef.current?.click()}
          data-testid="upload-textbook-btn"
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title="Upload and index a PDF textbook for RAG grounding"
        >
          {isIngesting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          )}
          <span className="hidden sm:inline">Upload Textbook</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about bending moments, shear forces, section modulus, Eurocode 3..."
          disabled={isLoading || isIngesting}
          data-testid="ai-tutor-input"
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading || isIngesting}
          data-testid="ai-tutor-send-btn"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
