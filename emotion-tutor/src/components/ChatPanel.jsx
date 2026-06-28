import React, { useRef, useEffect, useState } from 'react';
import { EMOTION_LABELS } from '../hooks/useEmotionDetector';

export default function ChatPanel({ history, loading, onSend, emotion }) {
  const [input, setInput]  = useState('');
  const bottomRef          = useRef(null);
  const meta               = EMOTION_LABELS[emotion] || EMOTION_LABELS.neutral;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    onSend(q);
  }

  return (
    <div style={s.wrapper}>
      <div style={s.messages}>
        {history.length === 0 && (
          <div style={s.empty}>
            <span style={{ fontSize: 38 }}>🎓</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              Ask any question. The tutor adapts to how you look.
              <br />Try: <em>"What is photosynthesis?"</em> or <em>"What is gravity?"</em>
            </p>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} style={{
            ...s.bubble,
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--accent-soft)' : 'var(--surface-2)',
            borderColor: msg.role === 'user' ? 'var(--accent)' : 'var(--border)',
          }}>
            {msg.role === 'assistant' && msg.emotion && (
              <div style={s.emotionTag}>
                <span>{EMOTION_LABELS[msg.emotion]?.emoji}</span>
                <span style={{ color: EMOTION_LABELS[msg.emotion]?.color }}>
                  Adapted for {EMOTION_LABELS[msg.emotion]?.label}
                </span>
              </div>
            )}
            <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.65 }}>{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div style={{ ...s.bubble, background: 'var(--surface-2)', borderColor: 'var(--border)', alignSelf: 'flex-start' }}>
            <Dots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputRow}>
        <span style={{ ...s.pill, borderColor: meta.color, background: `${meta.color}15`, color: meta.color }}>
          {meta.emoji}
        </span>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder="Ask a question... (Enter to send)"
          style={s.textarea}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.35 : 1 }}>
          ↑
        </button>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

const s = {
  wrapper:    { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' },
  messages:   { flex: 1, overflowY: 'auto', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
  empty:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 },
  bubble:     { maxWidth: '84%', padding: '11px 13px', borderRadius: 10, border: '1px solid', display: 'flex', flexDirection: 'column', gap: 5 },
  emotionTag: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' },
  inputRow:   { display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--border)' },
  pill:       { fontSize: 17, padding: '6px 7px', borderRadius: 8, border: '1px solid', lineHeight: 1, flexShrink: 0 },
  textarea:   { flex: 1, resize: 'none', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '9px 11px', outline: 'none', minHeight: 40, maxHeight: 110, lineHeight: 1.5 },
  sendBtn:    { width: 38, height: 38, borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 17, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' },
};
