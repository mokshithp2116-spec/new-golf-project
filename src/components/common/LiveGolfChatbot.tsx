'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  Trophy,
  Heart,
  CreditCard,
  Target,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: 'Hello! Welcome to Digital Heroes. I am your Live AI Caddy & Support Assistant. Ask me anything about score logging, jackpot draws, charity pledges, or subscription plans!',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_QUESTIONS = [
  'How do I enter the $50k monthly jackpot draw?',
  'How does my charity contribution pledge work?',
  'How can I switch between Monthly ($19) and Annual ($190) plans?',
  'How are my 5 Stableford golf scores recorded?',
];

export default function LiveGolfChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateAIResponse = (userText: string): string => {
    const q = userText.toLowerCase();

    if (q.includes('draw') || q.includes('jackpot') || q.includes('prize') || q.includes('enter')) {
      return '🏆 **Monthly Championship Draw**: To qualify for the $50,000+ prize pool, make sure your subscription is Active and log at least 5 rolling Stableford golf scores! Draws execute automatically on the last day of every month.';
    }

    if (q.includes('charity') || q.includes('pledge') || q.includes('impact') || q.includes('donate')) {
      return '💚 **Charity Pledge**: Every member selects a verified charity partner (like Fairway for Kids). Between 10% and 50% of your subscription fee is directed straight to your chosen charity every month!';
    }

    if (q.includes('subscription') || q.includes('plan') || q.includes('switch') || q.includes('$19') || q.includes('$190') || q.includes('yearly') || q.includes('monthly')) {
      return '💳 **Subscription Management**: You can switch between Monthly ($19/mo) and Annual ($190/yr) anytime! Go to the "Subscription" page or click "Manage Plan Tier" on your dashboard. If you already have an active plan, your account status is automatically retained!';
    }

    if (q.includes('score') || q.includes('stableford') || q.includes('log') || q.includes('qualify') || q.includes('handicap')) {
      return '⛳ **Golf Score Logging**: Go to "My Scores" on your navigation bar to enter your latest round (Stableford score between 1 and 45). The system maintains your 5 most recent rolling scores to enter upcoming draws!';
    }

    if (q.includes('admin') || q.includes('login') || q.includes('account') || q.includes('sign in')) {
      return '🔐 **Account & Sign In**: When you log in with your email, your subscription state and active plan are saved to your account. You will remain logged in with full access to your golfer dashboard!';
    }

    return `Thanks for asking! As your Digital Heroes AI Caddy, I can confirm that your account features full Stableford score tracking, automatic jackpot draw entries, and verified charity pledges. Feel free to check out "My Scores" or "Subscription" from the top menu!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = generateAIResponse(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-2xl shadow-orange-500/30 hover:scale-105 transition duration-300 flex items-center gap-2.5 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline">
            Live AI Caddy Chat
          </span>
          <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-black uppercase tracking-wider">
            ONLINE
          </span>
        </button>
      )}

      {/* Live Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 bg-[#0f1422]/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl text-slate-100 flex flex-col overflow-hidden max-h-[550px] h-[520px] animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-emerald-500/20 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Digital Heroes AI Support
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400">Golf, Draw & Subscription Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-tr-none shadow-md'
                      : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs leading-relaxed">{msg.text}</p>
                  <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <Bot className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                <span className="text-[11px] animate-pulse">AI Caddy is writing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-white/5 border-t border-white/5 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-[10px] text-slate-300 hover:text-orange-300 transition shrink-0 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0b0e17] border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Caddy anything..."
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
