import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiTutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am StructTutor, your structural engineering AI assistant. How can I help you with statics, load paths, Eurocode design, or beam calculations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptText = inputText.trim();
    if (!promptText || isLoading) return;

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
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3:latest',
          prompt: promptText,
          system: 'You are StructTutor, an expert structural engineering tutor helping a UK engineer. You explain concepts clearly, focus on statics, load paths, and Eurocodes, and use SI units (kN, mm, MPa).',
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
        text: `Error connecting to AI Tutor: ${errorMsg}. Please ensure Ollama is running locally with the llama3 model.`,
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
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3 shrink-0">
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
                llama3:latest
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Interactive structural engineering assistant powered by local Ollama (UK Eurocodes &amp; SI units)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Local &amp; Offline</span>
        </div>
      </div>

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

        {/* Loading Indicator */}
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

      {/* Input Box & Send Button */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about bending moments, shear forces, section modulus, Eurocode 3..."
          disabled={isLoading}
          data-testid="ai-tutor-input"
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
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
