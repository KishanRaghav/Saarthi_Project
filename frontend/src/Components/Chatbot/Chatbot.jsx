
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

// ✅ BACKEND URL
const BASE = import.meta.env.VITE_API_URL;

// ─── QUICK PROMPTS ─────────────────
const QUICK_PROMPTS = [
  'How do I book an appointment?',
  'Which doctor should I see for a fever?',
  'How do I cancel my appointment?',
  'I have a headache, what should I do?',
];

// ─── SIDEBAR ─────────────────
const Sidebar = ({ sessions, activeId, onSelect, onNew, isMobileOpen, onMobileClose }) => {
  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed md:relative top-0 left-0 h-full z-30 flex flex-col w-72 bg-white border-r p-4 transition-transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Chat History</h2>
          <button onClick={onNew}><PencilSquareIcon className="h-5 w-5" /></button>
        </div>

        <button onClick={onNew} className="bg-[#7C6A9B] text-white px-3 py-2 rounded mb-4 flex gap-2">
          <PlusCircleIcon className="h-4 w-4" /> New Chat
        </button>

        {sessions.map(s => (
          <button key={s.id} onClick={() => onSelect(s.id)} className="text-left p-2 hover:bg-gray-100 rounded">
            {s.title}
          </button>
        ))}
      </aside>
    </>
  );
};

// ─── MAIN COMPONENT ─────────────────
const Chatbot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: "Hello! I'm Saarthi. How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ BACKEND CALL
  const callBackend = async (text) => {
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    return data.reply;
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text) return;

    const userMsg = { text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callBackend(text);
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { text: "⚠️ Server error", sender: 'bot' }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">

      {/* NAVBAR */}
      <div className="flex justify-between p-3 border-b">
        <button onClick={() => navigate('/UserDashboard')}>
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1>Saarthi AI</h1>
        <UserCircleIcon className="h-6 w-6" />
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded ${msg.sender === 'user' ? 'bg-purple-500 text-white ml-auto' : 'bg-gray-200'}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <p>Typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type message..."
        />
        <button onClick={() => handleSend()} className="bg-[#7C6A9B] text-white px-3 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

