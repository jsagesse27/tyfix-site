'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, X, Send, Bot, User, Sparkles, Car, Calendar, Phone, ChevronRight, RefreshCw } from 'lucide-react';

/* ── Quick‑reply suggestion chips ─────────────── */
const SUGGESTIONS = [
  { label: 'Browse Cars', icon: Car, message: 'What cars do you have available right now?' },
  { label: 'Book a Visit', icon: Calendar, message: "I'd like to schedule a visit to see some cars." },
  { label: 'Contact Info', icon: Phone, message: 'What are your hours and how do I get to the lot?' },
];

const DEFAULT_GREETING = "Hey! 👋 I'm Ty from TyFix Used Cars. Whether you're looking for a specific ride or just browsing, I got you. What's on your mind?";

/* ── Safety timeout (ms) — auto-recover from stuck states ── */
const STUCK_TIMEOUT_MS = 30_000;

/**
 * Strip raw tool/function call artifacts that may leak from the LLM.
 */
function cleanBotMessage(text: string): string {
  let cleaned = text.replace(/<function=\w+[^>]*>\s*\{[^}]*\}\s*<\/function>/gi, '');
  cleaned = cleaned.replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '');
  cleaned = cleaned.replace(/<\/?function[^>]*>/gi, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [stuckError, setStuckError] = useState(false);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [botEnabled, setBotEnabled] = useState(true);

  // Fetch greeting + enabled state from bot_settings on mount
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('bot_settings')
          .select('greeting_message, bot_enabled')
          .limit(1)
          .single();
        if (data) {
          if (data.greeting_message) setGreeting(data.greeting_message);
          if (data.bot_enabled === false) setBotEnabled(false);
        }
      } catch { /* use defaults */ }
    })();
  }, []);

  // If the bot is disabled via admin, don't render anything
  if (!botEnabled) return null;

  // Queue for messages typed while the bot is responding
  const queuedMessageRef = useRef<string | null>(null);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => {
      console.error('[ChatBot] Stream error:', err);
      clearStuckTimer();
    },
    onFinish: () => {
      clearStuckTimer();
    },
  });

  const isReady = status === 'ready';
  const isBusy = status === 'submitted' || status === 'streaming';
  const showTypingBubble = isBusy && !stuckError;

  /* ── Stuck-state safety timer ─────────────────── */
  const clearStuckTimer = useCallback(() => {
    if (stuckTimerRef.current) {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    }
  }, []);

  const startStuckTimer = useCallback(() => {
    clearStuckTimer();
    stuckTimerRef.current = setTimeout(() => {
      console.warn('[ChatBot] Response timed out — recovering');
      setStuckError(true);
      try { stop(); } catch { /* ignore */ }
    }, STUCK_TIMEOUT_MS);
  }, [clearStuckTimer, stop]);

  // Clear stuck error when status goes back to ready
  useEffect(() => {
    if (isReady && stuckError) {
      // Small delay so the error message is visible briefly
      const t = setTimeout(() => setStuckError(false), 100);
      return () => clearTimeout(t);
    }
  }, [isReady, stuckError]);

  // When status goes busy, start the safety timer
  useEffect(() => {
    if (isBusy) {
      startStuckTimer();
    } else {
      clearStuckTimer();
    }
  }, [isBusy, startStuckTimer, clearStuckTimer]);

  // When the bot finishes and we have a queued message, send it
  useEffect(() => {
    if (isReady && queuedMessageRef.current) {
      const queued = queuedMessageRef.current;
      queuedMessageRef.current = null;
      // Small delay to let the UI settle
      setTimeout(() => {
        sendMessage({ text: queued });
      }, 150);
    }
  }, [isReady, sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearStuckTimer();
  }, [clearStuckTimer]);

  /* ── Auto-scroll ─────────────────────────────── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, showTypingBubble, isOpen, scrollToBottom]);

  // Flash notification when new message arrives while closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  /* ── Send handler ────────────────────────────── */
  const handleSend = (overrideText?: string) => {
    const text = typeof overrideText === 'string' ? overrideText : input;
    const trimmed = text.trim();
    if (!trimmed) return;

    // Clear input immediately for snappy UX
    if (!overrideText || overrideText === input) setInput('');
    setShowSuggestions(false);
    setStuckError(false);

    // If the bot is busy, queue the message to send when it finishes
    if (!isReady) {
      queuedMessageRef.current = queuedMessageRef.current
        ? `${queuedMessageRef.current}\n\n${trimmed}`
        : trimmed;
      return;
    }

    // Send immediately — no artificial delay
    sendMessage({ text: trimmed });
  };

  const handleSuggestionClick = (message: string) => {
    handleSend(message);
  };

  const handleRetry = () => {
    setStuckError(false);
    regenerate();
  };

  /* ── Extract clean text from message parts ───── */
  const getMessageText = (msg: typeof messages[0]): string => {
    const raw =
      msg.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') || '';

    if (msg.role === 'assistant') {
      return cleanBotMessage(raw);
    }
    return raw;
  };

  // Show error for real errors or stuck timeouts (skip AbortErrors)
  const shouldShowError = stuckError || (error && error.name !== 'AbortError');

  return (
    <>
      {/* ── Floating Trigger Button ─────────────── */}
      <button
        id="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div
          className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #4B0000, #6B0000)'
              : 'linear-gradient(135deg, #8B0000, #B91C1C)',
            boxShadow: '0 8px 32px rgba(139, 0, 0, 0.4)',
          }}
        >
          {isOpen ? (
            <X size={24} color="white" />
          ) : (
            <>
              <MessageSquare size={24} color="white" className="group-hover:rotate-12 transition-transform duration-300" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </>
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && (
          <span
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-100"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
          >
            Chat with Ty 💬
          </span>
        )}
      </button>

      {/* ── Chat Window ─────────────────────────── */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed z-50 flex flex-col overflow-hidden"
          style={{
            bottom: '100px',
            right: '24px',
            width: 'min(400px, calc(100vw - 48px))',
            height: 'min(560px, calc(100vh - 140px))',
            borderRadius: '20px',
            boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            animation: 'chatWindowIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            background: '#FAFBFC',
          }}
        >
          {/* ── Header ──────────────────────────── */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8B0000 0%, #6B0000 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">Ty — TyFix AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: showTypingBubble ? '#FBBF24' : '#34D399',
                      animation: showTypingBubble ? 'pulse 1s ease-in-out infinite' : 'none',
                      boxShadow: showTypingBubble
                        ? '0 0 6px rgba(251, 191, 36, 0.6)'
                        : '0 0 6px rgba(52, 211, 153, 0.6)',
                    }}
                  />
                  <span className="text-white/60 text-[11px] font-medium">
                    {showTypingBubble ? 'Typing...' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={18} color="white" />
            </button>
          </div>

          {/* ── Messages Area ───────────────────── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Welcome message (static) */}
            <div
              className="flex justify-start"
              style={{ animation: 'messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                style={{ background: 'linear-gradient(135deg, #8B0000, #B91C1C)' }}
              >
                <Bot size={14} color="white" />
              </div>
              <div
                className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: 'white',
                  color: '#1E293B',
                  borderRadius: '18px 18px 18px 4px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                }}
              >
                {greeting}
              </div>
            </div>

            {messages.map((msg) => {
              const text = getMessageText(msg);
              if (!text) return null;

              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  style={{ animation: 'messageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                  {/* Bot avatar */}
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
                      style={{
                        background: 'linear-gradient(135deg, #8B0000, #B91C1C)',
                      }}
                    >
                      <Bot size={14} color="white" />
                    </div>
                  )}

                  <div
                    className="max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      isUser
                        ? {
                            background: 'linear-gradient(135deg, #8B0000, #A91C1C)',
                            color: 'white',
                            borderRadius: '18px 18px 4px 18px',
                            boxShadow: '0 2px 8px rgba(139, 0, 0, 0.2)',
                          }
                        : {
                            background: 'white',
                            color: '#1E293B',
                            borderRadius: '18px 18px 18px 4px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                          }
                    }
                  >
                    {text}
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-2 mt-1"
                      style={{ background: '#E2E8F0' }}
                    >
                      <User size={14} color="#64748B" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {showTypingBubble && (
              <div className="flex justify-start" style={{ animation: 'messageIn 0.3s ease forwards' }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2"
                  style={{ background: 'linear-gradient(135deg, #8B0000, #B91C1C)' }}
                >
                  <Bot size={14} color="white" />
                </div>
                <div
                  className="px-4 py-3 flex gap-1.5 items-center"
                  style={{
                    background: 'white',
                    borderRadius: '18px 18px 18px 4px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Error state */}
            {shouldShowError && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FEE2E2',
                  color: '#991B1B',
                }}
              >
                <span>{stuckError ? 'Response took too long.' : 'Something went wrong.'}</span>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 font-semibold underline hover:no-underline"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick-Reply Suggestions ──────────── */}
          {showSuggestions && messages.length === 0 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.message)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    color: '#8B0000',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <s.icon size={14} />
                  {s.label}
                  <ChevronRight size={12} className="opacity-50" />
                </button>
              ))}
            </div>
          )}

          {/* ── Input Area ──────────────────────── */}
          <div
            className="px-4 py-3 shrink-0 flex gap-2 items-center"
            style={{
              borderTop: '1px solid #E2E8F0',
              background: 'white',
            }}
          >
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isBusy ? 'Ty is typing...' : 'Type your message...'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              style={{ color: '#1E293B' }}
              autoComplete="off"
            />
            <button
              id="chatbot-send"
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shrink-0"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #8B0000, #B91C1C)'
                  : '#E2E8F0',
                color: input.trim() ? 'white' : '#94A3B8',
                boxShadow: input.trim()
                  ? '0 4px 12px rgba(139, 0, 0, 0.3)'
                  : 'none',
              }}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>

          {/* ── Powered-by footer ───────────────── */}
          <div
            className="text-center py-1.5 text-[10px] font-medium shrink-0"
            style={{
              color: '#94A3B8',
              borderTop: '1px solid #F1F5F9',
              background: 'white',
              borderRadius: '0 0 20px 20px',
            }}
          >
            Powered by TyFix AI
          </div>
        </div>
      )}

      {/* ── Inline Styles ───────────────────────── */}
      <style jsx global>{`
        @keyframes chatWindowIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile full-screen */
        @media (max-width: 480px) {
          #chatbot-window {
            bottom: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: calc(100vh - 60px) !important;
            border-radius: 20px 20px 0 0 !important;
          }

          #chatbot-trigger {
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
