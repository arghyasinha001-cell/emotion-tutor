# 🧠 Emotion-Aware Tutor

An adaptive tutor that reads your facial emotion in real time and adjusts
its teaching style accordingly — no paid APIs, no data stored, 100% free.

---

## How it works

| Component | What it does | Cost |
|---|---|---|
| **MediaPipe FaceMesh** | Detects 468 facial landmarks via CDN | Free |
| **Emotion classifier** | Rule-based geometry on landmarks | Free (local) |
| **Tutor engine** | Adaptive responses by emotion | Free (local) |

**Privacy:** No video is ever stored or transmitted. Only landmark
coordinates (numbers) are read — all processing happens inside your browser.

---

## Setup (3 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Run the app
```bash
npm start
```
Opens at **http://localhost:3000**

---

## How to use

1. Click **▶ Start Camera** and allow camera access when the browser asks.
2. Pick a subject from the dropdown (optional).
3. Ask any question in the chat box.
4. The tutor detects your emotion and adapts its explanation style:
   - 😕 Confused → simplified step-by-step
   - 😑 Bored → adds surprising facts
   - 😴 Tired → very short, bullet answers
   - 🧐 Focused → detailed, technical depth
   - 😊 Engaged → enthusiastic, examples
5. Watch the **Session Breakdown** panel grow as you study.

---

## Sample questions to try

- What is photosynthesis?
- What is gravity?
- What is osmosis?
- What is DNA?
- What is mitosis?
- What is Newton's first law?
- What is the Pythagorean theorem?
- What is climate change?
- What is the water cycle?

---

## Folder structure

```
emotion-tutor/
├── public/
│   └── index.html          ← Loads MediaPipe from free CDN
├── src/
│   ├── components/
│   │   ├── CameraView.jsx       ← Webcam + landmark overlay
│   │   ├── ChatPanel.jsx        ← Q&A interface
│   │   ├── EmotionTimeline.jsx  ← Session emotion chart
│   │   └── TopicSelector.jsx    ← Subject dropdown
│   ├── hooks/
│   │   └── useEmotionDetector.js ← MediaPipe + emotion logic
│   ├── utils/
│   │   └── tutorEngine.js       ← Local adaptive response engine
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── index.js
└── package.json
```

---

## To expand the knowledge base

Open `src/utils/tutorEngine.js` and add entries to the `KNOWLEDGE` object:

```js
'what is your topic': {
  core:       'Plain explanation...',
  detail:     'Deep explanation...',
  simple:     'Analogy for confused students...',
  surprising: 'Wow fact for bored students...',
  brief:      'One-liner for tired students...',
},
```
