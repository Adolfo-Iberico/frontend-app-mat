// Provides an interactive chat widget for asking the AI assistant questions.
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaUser, FaTrash, FaGraduationCap } from 'react-icons/fa';
import { sendMessage, resetChat } from '../../api/ai';
import { useLanguage } from '../../contexts/LanguageContext';

const EULER_SVG = () => (
  <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
    <circle cx="20" cy="20" r="19" fill="#1a1a2e" stroke="#e0aaff" strokeWidth="1.5"/>
    <circle cx="20" cy="17" r="9" fill="#f5e6ca"/>
    <circle cx="17" cy="15.5" r="1.5" fill="#2d2d2d"/>
    <circle cx="23" cy="15.5" r="1.5" fill="#2d2d2d"/>
    <path d="M17 19.5 Q20 22 23 19.5" stroke="#c9184a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M11 11 Q14 8 17 12" stroke="#2d2d2d" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M23 12 Q26 8 29 11" stroke="#2d2d2d" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <ellipse cx="20" cy="27" rx="7" ry="4" fill="#5a189a"/>
    <rect x="14" y="25" width="12" height="2" rx="1" fill="#7b2cbf"/>
    <text x="20" y="35" textAnchor="middle" fill="#e0aaff" fontSize="5" fontFamily="serif" fontStyle="italic">Euler</text>
  </svg>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: 'assistant',
          text: t('chat.welcome'),
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await sendMessage(text, (partialText, isDone) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, text: partialText, isStreaming: !isDone }
              : msg
          )
        );
      });
    } catch (error) {
      const errorMsg = error.message || t('chat.error');
      // Consejo acorde a la causa real (el backend la clasifica en `code`),
      // en lugar de sugerir siempre revisar la API key.
      let detail = '';
      if (error.code === 'auth' || error.code === 'not_configured') {
        detail = t('chat.errorDetail');
      } else if (error.code === 'network') {
        detail = t('chat.errorNetwork');
      } else if (error.code === 'rate_limit') {
        detail = t('chat.errorRateLimit');
      }
      const errorText = `**${t('common.error')}:** ${errorMsg}${detail ? `\n\n${detail}` : ''}`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                text: errorText,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    resetChat();
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        text: t('chat.resetMessage'),
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    let html = escapeHtml(text);

    html = html
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 rounded-lg p-3 my-2 text-sm overflow-x-auto font-mono">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-3 mb-1 text-gray-800">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2 text-gray-900">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2 text-gray-900">$1</h1>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">&bull; $1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><span class="font-bold text-[var(--primary)]">$1.</span> $2</li>')
      .replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow md:bottom-8"
            aria-label={t('chat.openChat') || 'Abrir chat con profesor Euler'}
          >
            <FaGraduationCap className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 z-50 w-full h-full sm:w-[400px] sm:h-[600px] sm:bottom-6 sm:right-6 sm:rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            role="dialog"
            aria-label={t('chat.title') || 'Chat con profesor Euler'}
            aria-modal="true"
          >
            {/* Header */}
            <div className="bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                  <EULER_SVG />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{t('chat.professorName')}</h3>
                  <p className="text-[10px] text-[#e0aaff]">{t('chat.tutorSubtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  title={t('chat.clearChat')}
                  aria-label={t('chat.clearChat') || 'Limpiar chat'}
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={t('chat.closeChat') || 'Cerrar chat'}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-1">
                      <EULER_SVG />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary)] text-white rounded-br-md'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(msg.text)}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-[var(--primary)] ml-1 animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-300 rounded-lg flex items-center justify-center shrink-0 mt-1">
                      <FaUser className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                  disabled={isLoading}
                  aria-label={t('chat.inputLabel') || 'Escribe tu mensaje'}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t('chat.sendMessage') || 'Enviar mensaje'}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaPaperPlane className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
