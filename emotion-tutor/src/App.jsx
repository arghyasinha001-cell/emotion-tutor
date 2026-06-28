import React, { useRef, useState, useEffect, useCallback } from 'react';
import CameraView      from './components/CameraView';
import ChatPanel       from './components/ChatPanel';
import EmotionTimeline from './components/EmotionTimeline';
import TopicSelector   from './components/TopicSelector';
import { useEmotionDetector } from './hooks/useEmotionDetector';
import { generateResponse }   from './utils/tutorEngine';

export default function App() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOn, setCameraOn]       = useState(false);
  const [topic, setTopic]             = useState('');
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [emotionLog, setEmotionLog]   = useState([]);

  const { emotion, hasCamera, error } = useEmotionDetector(videoRef, canvasRef, cameraOn);

  // Log emotion every 3 seconds
  useEffect(() => {
    if (!cameraOn || !hasCamera) return;
    const id = setInterval(() => setEmotionLog(prev => [...prev.slice(-299), emotion]), 3000);
    return () => clearInterval(id);
  }, [cameraOn, hasCamera, emotion]);

  const handleSend = useCallback((question) => {
    const snap = emotion;
    setHistory(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    // Small delay to feel natural, then generate locally
    setTimeout(() => {
      try {
        const reply = generateResponse(question, snap, topic);
        setHistory(prev => [...prev, { role: 'assistant', content: reply, emotion: snap }]);
      } catch (e) {
        setHistory(prev => [...prev, { role: 'assistant', content: `Something went wrong: ${e.message}`, emotion: snap }]);
      }
      setLoading(false);
    }, 600);
  }, [emotion, topic]);

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.logo}>
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={s.logoText}>Emotion-Aware Tutor</span>
        </div>
        <TopicSelector topic={topic} onTopicChange={setTopic} />
        {history.length > 0 && (
          <button onClick={() => { setHistory([]); setEmotionLog([]); }} style={s.clearBtn}>
            New Session
          </button>
        )}
      </header>

      <main style={s.main}>
        <aside style={s.sidebar}>
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            emotion={emotion}
            hasCamera={hasCamera}
            error={error}
            enabled={cameraOn}
            onToggle={() => setCameraOn(v => !v)}
          />
          <EmotionTimeline log={emotionLog} />
        </aside>

        <section style={s.chat}>
          <ChatPanel
            history={history}
            loading={loading}
            onSend={handleSend}
            emotion={emotion}
          />
        </section>
      </main>
    </div>
  );
}

const s = {
  app:      { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header:   { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, flexWrap: 'wrap' },
  logo:     { display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' },
  logoText: { fontWeight: 700, fontSize: 15, background: 'linear-gradient(135deg, #6c8fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  clearBtn: { fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' },
  main:     { flex: 1, display: 'grid', gridTemplateColumns: '290px 1fr', gap: 14, padding: 14, overflow: 'hidden' },
  sidebar:  { display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' },
  chat:     { overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};
