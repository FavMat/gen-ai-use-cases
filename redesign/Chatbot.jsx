// Chatbot — full visual refresh, same API as your existing component
// In prod it still calls http://localhost:3002/api/chat with history.

const { useState: useChatState, useRef: useChatRef, useEffect: useChatEffect } = React;

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

function Chatbot({ lang, t = CHAT_DEFAULT_T }) {
  const T = { ...CHAT_DEFAULT_T, ...t };
  const [open, setOpen] = useChatState(false);
  const [messages, setMessages] = useChatState([{ role: 'assistant', content: T.welcome }]);
  const [input, setInput] = useChatState('');
  const [loading, setLoading] = useChatState(false);
  const [history, setHistory] = useChatState([]);
  const endRef = useChatRef(null);
  const inputRef = useChatRef(null);

  useChatEffect(() => { setMessages([{ role: 'assistant', content: T.welcome }]); setHistory([]); }, [T.welcome]);
  useChatEffect(() => {
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

    // Mock reply for the preview; in your real app this hits /api/chat
    try {
      let reply = '';
      try {
        const res = await fetch('http://localhost:3002/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history }),
        });
        const d = await res.json(); reply = d.reply;
      } catch {
        // demo fallback
        await new Promise(r => setTimeout(r, 800));
        reply = `Here are some relevant matches for **"${msg}"** drawn from the 1,400+ use case index. In the live build this response comes from the Groq-backed retrieval pipeline over the Supabase corpus.`;
      }
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

window.Chatbot = Chatbot;
