// useEmotionDetector.js
//
// PRIVACY GUARANTEE:
//   - No video frames are saved, uploaded, or stored anywhere.
//   - MediaPipe runs 100% on-device inside the browser.
//   - We only read facial landmark COORDINATES (numbers like x:0.4, y:0.6).
//   - The camera stream is stopped the moment you click "Stop Camera".

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Geometry helpers ────────────────────────────────────────────────────────

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function eyeOpenRatio(lm, top, bot, left, right) {
  const h = dist(lm[top], lm[bot]);
  const w = dist(lm[left], lm[right]);
  return w > 0 ? h / w : 0;
}

function mouthAspectRatio(lm) {
  const h = dist(lm[13], lm[14]);
  const w = dist(lm[61], lm[291]);
  return w > 0 ? h / w : 0;
}

function browRaise(lm, faceH) {
  const l = dist(lm[105], lm[159]) / faceH;
  const r = dist(lm[334], lm[386]) / faceH;
  return (l + r) / 2;
}

function classifyEmotion(lm) {
  if (!lm || lm.length < 468) return 'neutral';

  const ys    = lm.map(p => p.y);
  const faceH = Math.max(...ys) - Math.min(...ys);
  if (faceH <= 0) return 'neutral';

  const mar  = mouthAspectRatio(lm);
  const brow = browRaise(lm, faceH);
  const noseTip = lm[4];
  const midFace = lm[168];
  const nod  = noseTip.y - midFace.y;

  const leftEAR  = eyeOpenRatio(lm, 159, 145, 33,  133);
  const rightEAR = eyeOpenRatio(lm, 386, 374, 362, 263);
  const ear = (leftEAR + rightEAR) / 2;

  if (mar > 0.55 && brow > 0.16)      return 'surprised';
  if (ear < 0.12)                      return 'tired';
  if (mar > 0.38 && ear > 0.22)        return 'confused';
  if (brow > 0.18 && mar < 0.25)       return 'focused';
  if (nod > 0.04 && ear > 0.20)        return 'engaged';
  if (ear < 0.18 && brow < 0.13)       return 'bored';
  if (mar > 0.30)                       return 'happy';
  return 'neutral';
}

// ─── Emotion metadata ────────────────────────────────────────────────────────

export const EMOTION_LABELS = {
  focused:   { emoji: '🧐', label: 'Focused',   color: '#6c8fff' },
  engaged:   { emoji: '😊', label: 'Engaged',   color: '#4ade80' },
  confused:  { emoji: '😕', label: 'Confused',  color: '#facc15' },
  bored:     { emoji: '😑', label: 'Bored',     color: '#94a3b8' },
  tired:     { emoji: '😴', label: 'Tired',     color: '#f87171' },
  surprised: { emoji: '😮', label: 'Surprised', color: '#c084fc' },
  happy:     { emoji: '😄', label: 'Happy',     color: '#34d399' },
  neutral:   { emoji: '😐', label: 'Neutral',   color: '#7b82a8' },
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEmotionDetector(videoRef, canvasRef, enabled) {
  const [emotion, setEmotion]     = useState('neutral');
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError]         = useState(null);

  const faceMeshRef = useRef(null);
  const cameraRef   = useRef(null);
  const streamRef   = useRef(null);
  const bufferRef   = useRef([]);
  const BUFFER      = 7;

  const FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,
    397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];

  const onResults = useCallback((results) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (!results.multiFaceLandmarks?.length) return;

    const lm  = results.multiFaceLandmarks[0];
    const raw = classifyEmotion(lm);

    bufferRef.current.push(raw);
    if (bufferRef.current.length > BUFFER) bufferRef.current.shift();

    const counts  = bufferRef.current.reduce((a, e) => { a[e] = (a[e] || 0) + 1; return a; }, {});
    const smoothed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    setEmotion(smoothed);

    // Draw minimal face oval dots only
    const { width, height } = canvasRef.current;
    const meta = EMOTION_LABELS[smoothed];
    ctx.fillStyle = meta?.color ?? '#6c8fff';
    FACE_OVAL.forEach(i => {
      const p = lm[i];
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [canvasRef]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function init() {
      try {
        // Camera permission — stream is never recorded
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCamera(true);

        // FaceMesh and Camera are loaded from CDN into window global
        const FaceMesh = window.FaceMesh;
        const Camera   = window.Camera;

        if (!FaceMesh || !Camera) {
          setError('MediaPipe failed to load. Check your internet connection.');
          return;
        }

        const faceMesh = new FaceMesh({
          locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640, height: 480,
        });
        await camera.start();
        cameraRef.current = camera;

      } catch (err) {
        if (!cancelled) {
          setError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Click the camera icon in your browser address bar to allow access.'
              : `Camera error: ${err.message}`
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      faceMeshRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setHasCamera(false);
      setEmotion('neutral');
      bufferRef.current = [];
    };
  }, [enabled, videoRef, canvasRef, onResults]);

  return { emotion, hasCamera, error };
}
