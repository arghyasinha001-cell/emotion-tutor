import React from 'react';
import { EMOTION_LABELS } from '../hooks/useEmotionDetector';

export default function EmotionTimeline({ log }) {
  if (!log.length) return null;

  const counts  = log.reduce((a, e) => { a[e] = (a[e]||0)+1; return a; }, {});
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0];
  const meta     = EMOTION_LABELS[dominant];

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.title}>Session Breakdown</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.length} readings</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {Object.entries(EMOTION_LABELS).map(([key, m]) => {
          const count = counts[key] || 0;
          const pct   = log.length ? (count / log.length) * 100 : 0;
          return (
            <div key={key} style={s.row}>
              <span style={{ fontSize: 12, color: 'var(--text)', minWidth: 100 }}>{m.emoji} {m.label}</span>
              <div style={s.track}>
                <div style={{ ...s.fill, width: `${pct}%`, background: m.color }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: m.color, minWidth: 30, textAlign: 'right' }}>
                {Math.round(pct)}%
              </span>
            </div>
          );
        })}
      </div>

      {dominant && (
        <div style={s.insight}>
          Most common: <strong style={{ color: meta?.color }}>{meta?.emoji} {meta?.label}</strong>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  row:     { display: 'grid', gridTemplateColumns: '108px 1fr 32px', alignItems: 'center', gap: 8 },
  track:   { height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: 999, transition: 'width 0.5s ease', minWidth: 2 },
  insight: { fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 },
};
