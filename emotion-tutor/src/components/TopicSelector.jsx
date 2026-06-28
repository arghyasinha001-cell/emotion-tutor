import React from 'react';

const TOPICS = [
  'Mathematics','Physics','Chemistry','Biology',
  'History','Geography','Computer Science',
  'English Literature','Economics','Philosophy',
];

export default function TopicSelector({ topic, onTopicChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
        Subject
      </label>
      <select
        value={topic}
        onChange={e => onTopicChange(e.target.value)}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '6px 10px', outline: 'none', cursor: 'pointer' }}
      >
        <option value="">— Pick a subject —</option>
        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
