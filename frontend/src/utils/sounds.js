// Simple Web Audio API sound effects — no external files needed

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, type, duration, gainVal = 0.3) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(gainVal, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (_) {}
}

export const sounds = {
  correct() {
    playTone(523, 'sine', 0.1);
    setTimeout(() => playTone(659, 'sine', 0.15), 100);
    setTimeout(() => playTone(784, 'sine', 0.2), 200);
  },
  wrong() {
    playTone(200, 'sawtooth', 0.3, 0.2);
    setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.15), 150);
  },
  tick() {
    playTone(880, 'square', 0.05, 0.05);
  },
  gameOver() {
    [400, 350, 300, 250].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sawtooth', 0.3, 0.15), i * 150);
    });
  },
  start() {
    [300, 400, 500, 700].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.2), i * 100);
    });
  },
};
