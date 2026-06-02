import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

const CHAT_DEFAULT_T = {
  name: 'GenAI Intelligence',
  powered: 'Powered by Groq · 1,400+ use cases',
  placeholder: 'Ask about the 1,400+ use cases...',
  suggestedLabel: 'Try asking',
  suggested: [
    'Which Healthcare companies use AI agents?',
    'Code Agents examples in Finance?',
    'How many use cases in Retail?',
    'What does Google Cloud do for Automotive?',
  ],
  welcome: "Hi — I'm your AI assistant for the **1,400+ GenAI use cases**. Ask me anything: industries, vendors, specific companies.",
  error: 'Connection error. Make sure the backend is running.',
};

export default function Chatbot({ lang, t = CHAT_DEFAULT_T }) {
  const T = { ...CHAT_DEFAULT_T, ...t };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: T.welcome }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const prevTRef = useRef(T.welcome);

  useEffect(() => {
    if (prevTRef.current !== T.welcome) {
      setMessages([{ role: 'assistant', content: T.welcome }]);
      setHistory([]);
      prevTRef.current = T.welcome;
    }
  }, [T.welcome]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollTo?.({ top: 1e6, behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const newHist = [...history, { role: 'user', content: msg }];
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      let reply = '';
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const d = await res.json(); 
      reply = d.reply || T.error;
      setMessages(p => [...p, { role: 'assistant', content: reply }]);
      setHistory([...newHist, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: T.error }]);
    } finally { setLoading(false); }
  };

  const fmt = (s) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="AI Assistant">
        {open ? Icons.X({ size: 20 }) : Icons.MessageCircle({ size: 20 })}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div className="chat-avatar">{Icons.Bot({ size: 18 })}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="chat-title">{T.name}</div>
              <div className="chat-status">{T.powered}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--ink-300)' }}>{Icons.X({ size: 16 })}</button>
          </div>

          <div className="chat-body" ref={endRef}>
            {messages.map((m, i) => (
              <div key={i} className={'msg ' + m.role}>
                <div className="msg-av">
                  {m.role === 'user' ? Icons.User({ size: 14 }) : Icons.Sparkles({ size: 14 })}
                </div>
                <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
              </div>
            ))}
            {loading && (
              <div className="msg bot">
                <div className="msg-av">{Icons.Sparkles({ size: 14 })}</div>
                <div className="msg-bubble">
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: 50, background: 'var(--plasma-cyan)',
                        animation: 'live-blink 1s ease-in-out infinite',
                        animationDelay: (i * 0.15) + 's',
                      }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="chat-suggested">
                <div className="chat-suggested-label">{T.suggestedLabel}</div>
                {T.suggested.map((s, i) => (
                  <button key={i} className="chat-sug-btn" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={T.placeholder}
            />
            <button className="chat-send" onClick={() => send()} disabled={!input.trim() || loading}>
              {Icons.Send({ size: 14 })}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
