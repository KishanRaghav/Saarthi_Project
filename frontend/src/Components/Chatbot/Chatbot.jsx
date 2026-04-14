import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Paste your Gemini API key here OR set VITE_GEMINI_API_KEY in your .env file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are Saarthi, a friendly and intelligent healthcare assistant for a medical appointment booking platform called Saarthi. Your role is to help patients with:

1. Booking, cancelling, or rescheduling appointments
2. Understanding which type of doctor/specialist to see based on their symptoms
3. General health tips and wellness advice
4. Navigating the Saarthi app (e.g., how to view appointments, update profile)
5. Answering common medical FAQs

Important rules:
- Always be warm, empathetic, and easy to understand.
- Never provide definitive diagnoses — always recommend consulting a qualified doctor.
- If someone describes a medical emergency (chest pain, trouble breathing, severe bleeding, etc.), immediately tell them to call emergency services (102 in India) and stop the conversation there.
- Keep responses concise (2-4 sentences for most replies, slightly longer if explaining a process).
- If asked something outside healthcare or app navigation, politely redirect to what you can help with.
- Use simple language — avoid heavy medical jargon unless the patient seems medically literate.`;

// ─── QUICK PROMPT SUGGESTIONS ────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'How do I book an appointment?',
  'Which doctor should I see for a fever?',
  'How do I cancel my appointment?',
  'I have a headache, what should I do?',
];

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({ sessions, activeId, onSelect, onNew, isMobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-full z-30 md:z-auto
          flex flex-col w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto
          transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNew}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              title="New chat"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNew}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-[#7C6A9B] text-white text-sm font-medium hover:bg-[#5c4b7a] transition mb-4"
        >
          <PlusCircleIcon className="h-4 w-4" />
          New Chat
        </button>

        {/* Session List */}
        <div className="flex-1 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-6">No chats yet. Start one!</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => { onSelect(s.id); onMobileClose(); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm ${
                s.id === activeId
                  ? 'bg-[#ede9f7] text-[#5c4b7a] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-3.5 w-3.5 text-[#7C6A9B] shrink-0" />
                <span className="truncate">{s.title}</span>
              </div>
              <p className="text-xs text-gray-400 ml-5.5 mt-0.5 ml-6">{s.time}</p>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-[#7C6A9B] rounded-full block"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.sender === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#ede9f7] flex items-center justify-center shrink-0 mb-1">
          <SparklesIcon className="h-4 w-4 text-[#7C6A9B]" />
        </div>
      )}
      <div
        className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#7C6A9B] text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
};

// ─── MAIN CHATBOT COMPONENT ───────────────────────────────────────────────────
const Chatbot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sessions: array of { id, title, time, messages[] }
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m Saarthi, your healthcare assistant. How can I help you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Gemini API call with multi-turn history ──────────────────────────────
  const callGemini = async (userText, history) => {
    // Build conversation history in Gemini format
    // Prepend the system prompt as the first user message + model ack
    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Understood. I\'m Saarthi, ready to help patients with their healthcare needs.' }] },
      // Previous messages
      ...history.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      // Current message
      { role: 'user', parts: [{ text: userText }] },
    ];

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'Gemini API error');
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response. Please try again.';
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isLoading) return;

    const userMsg = { text, sender: 'user' };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Save session title from first user message
    if (messages.length <= 1 && !activeSessionId) {
      const newId = Date.now().toString();
      const title = text.length > 40 ? text.slice(0, 40) + '…' : text;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSessions((prev) => [{ id: newId, title, time: now, messages: updatedMessages }, ...prev]);
      setActiveSessionId(newId);
    }

    try {
      const botReply = await callGemini(text, messages);
      const botMsg = { text: botReply, sender: 'bot' };
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Update session messages
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: finalMessages } : s
        )
      );
    } catch (err) {
      console.error('Gemini error:', err);
      const errorText =
        err.message?.includes('API_KEY') || err.message?.includes('key')
          ? '⚠️ API key issue. Please check your VITE_GEMINI_API_KEY in .env and restart the dev server.'
          : '⚠️ Something went wrong. Please check your internet connection and try again.';
      setMessages((prev) => [...prev, { text: errorText, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // ── New chat ─────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([
      { text: 'Hello! I\'m Saarthi, your healthcare assistant. How can I help you today?', sender: 'bot' },
    ]);
    setInput('');
    setActiveSessionId(null);
    setIsSidebarOpen(false);
    inputRef.current?.focus();
  };

  // ── Load session ─────────────────────────────────────────────────────────
  const handleSelectSession = (id) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setMessages(session.messages);
      setActiveSessionId(id);
    }
  };

  // ── Keyboard submit ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered sessions for search ─────────────────────────────────────────
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNewChat = messages.length <= 1 && messages[0]?.sender === 'bot';

  return (
    <div className="flex flex-col h-screen w-full bg-white text-gray-800 overflow-hidden">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>

          {/* Back to dashboard */}
          <button
            onClick={() => navigate('/UserDashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#7C6A9B] transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-[#7C6A9B]" />
          <h1 className="text-base font-semibold text-gray-800">Saarthi AI</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Search chats"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="New chat"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
        </div>
      </nav>

      {/* ── SEARCH BAR (collapsible) ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="px-4 py-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat history…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C6A9B]/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <Sidebar
          sessions={searchQuery ? filteredSessions : sessions}
          activeId={activeSessionId}
          onSelect={handleSelectSession}
          onNew={handleNewChat}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        {/* ── CHAT AREA ── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

            {/* Welcome state */}
            {isNewChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-4 pb-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#ede9f7] flex items-center justify-center">
                  <SparklesIcon className="h-7 w-7 text-[#7C6A9B]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">How can I help you today?</h2>
                  <p className="text-sm text-gray-500 mt-1">Ask me anything about your health or appointments.</p>
                </div>

                {/* Quick prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mt-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-[#f3effa] hover:border-[#7C6A9B]/30 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message list */}
            {!isNewChat && (
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
              </AnimatePresence>
            )}

            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div className="px-4 py-4 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message… (Enter to send)"
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C6A9B]/40 text-sm text-gray-800 disabled:opacity-50 overflow-hidden"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-[#7C6A9B] text-white rounded-2xl hover:bg-[#5c4b7a] disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              >
                <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Saarthi AI can make mistakes. Always consult a qualified doctor for medical decisions.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chatbot;
