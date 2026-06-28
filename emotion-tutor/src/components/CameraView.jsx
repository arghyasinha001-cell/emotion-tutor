import React from 'react';
import { EMOTION_LABELS } from '../hooks/useEmotionDetector';

export default function CameraView({ videoRef, canvasRef, emotion, hasCamera, error, enabled, onToggle }) {
  const meta = EMOTION_LABELS[emotion] || EMOTION_LABELS.neutral;

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.title}>Live Emotion</span>
        <button onClick={onToggle} style={{ ...s.btn, ...(enabled ? s.btnStop : s.btnStart) }}>
          {enabled ? '⏹ Stop' : '▶ Start Camera'}
        </button>
      </div>

      <div style={s.camBox}>
        {!enabled && !error && (
          <div style={s.center}>
            <span style={{ fontSize: 34 }}>📷</span>
            <p style={s.muted}>Camera is off</p>
          </div>
        )}
        {error && (
          <div style={{ ...s.center, color: '#f87171', padding: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <p style={{ fontSize: 12, marginTop: 6 }}>{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          muted playsInline
          style={{ ...s.video, display: enabled && hasCamera ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          width={320} height={240}
          style={{ ...s.canvas, display: enabled && hasCamera ? 'block' : 'none' }}
        />
      </div>

      {enabled && hasCamera && (
        <div style={{ ...s.badge, borderColor: meta.color, background: `${meta.color}18` }}>
          <span style={{ fontSize: 20 }}>{meta.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, color: meta.color, fontSize: 13 }}>{meta.label}</div>
            <div style={s.muted}>Detected emotion</div>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        🔒 All processing is on-device. No video is stored or sent anywhere.
      </p>
    </div>
  );
}

const s = {
  wrapper: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  btn:     { fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999, border: '1px solid', background: 'transparent', transition: 'opacity 0.2s' },
  btnStart: { color: '#4ade80', borderColor: '#4ade80' },
  btnStop:  { color: '#f87171', borderColor: '#f87171' },
  camBox:  { position: 'relative', width: '100%', aspectRatio: '4/3', background: 'var(--surface-2)', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  center:  { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  muted:   { color: 'var(--text-muted)', fontSize: 12, marginTop: 6 },
  video:   { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  canvas:  { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' },
  badge:   { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid' },
};
