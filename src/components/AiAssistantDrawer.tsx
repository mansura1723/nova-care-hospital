import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MessageSquare, Send, ShieldAlert, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  urgent?: boolean;
}

export const AiAssistantDrawer: React.FC = () => {
  const { assistantOpen, setAssistantOpen, language, t, cookieConsent } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        language === 'bn'
          ? 'স্বাগতম! আমি নোভা কেয়ার হাসপাতালের বিভাগ, ডাক্তার, হেলথ প্যাকেজ এবং অ্যাপয়েন্টমেন্ট নিয়ম সম্পর্কে সাধারণ তথ্য দিয়ে সহায়তা করতে পারি। আমি কোনো রোগ নির্ণয় বা ওষুধের পরামর্শ দিই না।'
          : 'Hello. I can help you navigate Nova Care Hospital’s 30 departments, find specialists, compare preventive health checkups, and understand appointment request steps. Informational guidance only — never a substitute for a licensed physician.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language }),
      });
      const data = (await res.json()) as {
        reply?: string;
        urgent?: boolean;
        error?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text:
            data.reply ||
            data.error ||
            'Unable to reach the hospital guide service right now. Please browse our Specialities or Contact page.',
          urgent: Boolean(data.urgent),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: 'Network interruption while reaching the guide assistant. Please explore our Specialities directory or visit Emergency Services if urgent.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          aria-label="Open Hospital Guide Assistant"
          className={`fixed right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0F2942] dark:bg-teal-600 text-white text-sm font-medium shadow-lg hover:bg-[#173c5f] dark:hover:bg-teal-500 transition-all hover:-translate-y-0.5 ${
            cookieConsent === 'unset' ? 'bottom-36 md:bottom-5' : 'bottom-5'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-teal-300 dark:text-white" aria-hidden="true" />
          <span className="whitespace-nowrap">Care Guide</span>
        </button>
      )}

      {assistantOpen && (
        <aside
          aria-label="Hospital Guide Assistant"
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md h-[76vh] max-h-[600px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3.5 bg-[#0F2942] text-white flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold">{t.aiAssistantTitle}</h2>
              <p className="text-xs text-teal-200">
                Informational Guidance · Not Medical Diagnosis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              aria-label="Close Hospital Guide Assistant"
              className="p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              For urgent symptoms (chest pain, breathing difficulty), visit{' '}
              <Link
                to="/emergency"
                onClick={() => setAssistantOpen(false)}
                className="underline font-semibold"
              >
                Emergency Care
              </Link>{' '}
              immediately.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.urgent
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                      : msg.role === 'user'
                        ? 'bg-[#0F2942] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {msg.urgent && (
                    <div className="flex items-center gap-1.5 font-semibold mb-1 text-rose-700 dark:text-rose-300 text-xs">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      Urgent Care Alert
                    </div>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preparing informational response...
              </p>
            )}
          </div>

          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950/50">
            {[
              'Which department handles cardiac checkups?',
              'How do I book an appointment?',
              'Compare health checkup packages',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-500"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.aiAssistantPrompt}
              aria-label={t.aiAssistantPrompt}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-lg bg-[#0F2942] dark:bg-teal-600 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
