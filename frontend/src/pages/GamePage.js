import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI, scoreAPI } from '../utils/api';
import { sounds } from '../utils/sounds';
import toast from 'react-hot-toast';
import './GamePage.css';

const QUESTION_COUNT = 10;
const TIMER_SECONDS = 10;
const POINTS_PER_CORRECT = 10;

export default function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isGuest = searchParams.get('guest') === 'true' || !user;

  const [phase, setPhase] = useState('loading'); // loading | name | playing | finished
  const [guestName, setGuestName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answers, setAnswers] = useState([]); // track each answer result
  const [startTime] = useState(Date.now());

  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  // Load questions
  useEffect(() => {
    quizAPI.getQuestions(QUESTION_COUNT)
      .then(res => {
        setQuestions(res.data.data || []);
        if (isGuest) setPhase('name');
        else { sounds.start(); setPhase('playing'); }
      })
      .catch(() => toast.error('Failed to load questions'));
  }, [isGuest]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    if (timeLeft === 0) { handleAnswer(null); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 3) sounds.tick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, timeLeft, selected]);

  const advanceQuestion = useCallback(() => {
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= questions.length) {
        finishGame();
      } else {
        setCurrentIdx(nextIdx);
        setSelected(null);
        setFeedback(null);
        setTimeLeft(TIMER_SECONDS);
      }
    }, 1200);
  }, [currentIdx, questions.length]);

  const handleAnswer = useCallback(async (option) => {
    if (selected !== null || phase !== 'playing') return;
    clearInterval(timerRef.current);
    setSelected(option);

    const q = questions[currentIdx];
    let correct = false;
    try {
      const res = await quizAPI.checkAnswer(q.id, option || '');
      correct = res.data.data;
    } catch (_) {
      correct = false;
    }

    if (correct) {
      setFeedback('correct');
      setScore(s => s + POINTS_PER_CORRECT);
      setCorrectCount(c => c + 1);
      sounds.correct();
    } else {
      setFeedback('wrong');
      sounds.wrong();
    }

    setAnswers(a => [...a, { questionId: q.id, answer: option, correct }]);
    advanceQuestion();
  }, [selected, phase, questions, currentIdx, advanceQuestion]);

  const finishGame = useCallback(async () => {
    sounds.gameOver();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = score + (answers[answers.length - 1]?.correct ? 0 : 0); // already updated via state

    setPhase('finished');

    // Submit score
    try {
      const payload = {
        userId: user?.userId || null,
        guestName: isGuest ? (guestName || 'Guest') : null,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
      };
      await scoreAPI.submit(payload);
    } catch (_) {
      // Silent fail — still show result
    }

    navigate('/result', {
      state: {
        score,
        correctCount,
        totalQuestions: questions.length,
        timeTaken,
        playerName: user?.name || guestName || 'Guest',
      },
    });
  }, [score, correctCount, questions.length, user, guestName, isGuest, startTime, answers, navigate]);

  // Trigger finish when last question answered
  useEffect(() => {
    if (answers.length === questions.length && questions.length > 0 && phase === 'playing') {
      finishGame();
    }
  }, [answers, questions.length]);

  // ---- Render phases ----
  if (phase === 'loading') {
    return (
      <div className="game-loading">
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p>Loading quiz…</p>
      </div>
    );
  }

  if (phase === 'name') {
    return (
      <div className="game-name-screen">
        <div className="bg-grid" />
        <div className="name-card card animate-fadeInUp">
          <div className="name-icon">👤</div>
          <h2>What's your name?</h2>
          <p>You're playing as a guest. Enter a name for the leaderboard.</p>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. TechWizard99"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            maxLength={30}
            autoFocus
          />
          <button
            className="btn btn-primary btn-full"
            onClick={() => { sounds.start(); setPhase('playing'); }}
            disabled={!guestName.trim()}
          >
            🚀 Let's Go!
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => { setGuestName('Guest'); sounds.start(); setPhase('playing'); }}>
            Skip — play anonymously
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 3 ? '#ef4444' : timeLeft <= 6 ? '#f97316' : 'var(--accent-cyan)';

  return (
    <div className="game-page">
      <div className="bg-grid" />

      {/* Header */}
      <div className="game-header animate-fadeIn">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="game-meta">
          <div className="q-counter">
            <span className="q-current">{currentIdx + 1}</span>
            <span className="q-sep">/</span>
            <span className="q-total">{questions.length}</span>
          </div>

          <div className="score-badge">
            ⭐ {score}
          </div>

          {/* Circular timer */}
          <div className="timer-ring" style={{ '--timer-color': timerColor }}>
            <svg viewBox="0 0 44 44" className="timer-svg">
              <circle cx="22" cy="22" r="18" className="timer-track" />
              <circle
                cx="22" cy="22" r="18"
                className="timer-fill"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - timerPct / 100)}`}
                style={{ stroke: timerColor }}
              />
            </svg>
            <span className="timer-num" style={{ color: timerColor }}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="question-area" key={currentIdx}>
        <div className="logo-card card animate-bounceIn">
          <div className="logo-wrapper">
            <img
              src={q.logoUrl}
              alt="Company logo"
              className="company-logo"
              onError={e => { e.target.src = 'https://via.placeholder.com/120?text=?'; }}
            />
          </div>
          <p className="logo-prompt">Which company/tech is this?</p>
          <div className={`difficulty-badge badge badge-${q.difficulty?.toLowerCase()}`}>
            {q.difficulty}
          </div>
        </div>

        {/* Options */}
        <div className="options-grid">
          {q.options?.map((opt, i) => {
            let optClass = 'option-btn';
            if (selected !== null) {
              if (feedback === 'correct' && opt === selected) optClass += ' correct';
              else if (feedback === 'wrong' && opt === selected) optClass += ' wrong';
            }
            return (
              <button
                key={opt}
                className={optClass}
                onClick={() => handleAnswer(opt)}
                disabled={selected !== null}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="opt-text">{opt}</span>
                {selected !== null && feedback === 'correct' && opt === selected && (
                  <span className="opt-icon">✓</span>
                )}
                {selected !== null && feedback === 'wrong' && opt === selected && (
                  <span className="opt-icon">✗</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
