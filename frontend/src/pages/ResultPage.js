import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ResultPage.css';

function getResultMeta(score, total) {
  const pct = score / (total * 10);
  if (pct === 1)   return { emoji: '🏆', title: 'Perfect Score!',    color: '#eab308', msg: 'Absolute genius. You know your tech!' };
  if (pct >= 0.8)  return { emoji: '🔥', title: 'Outstanding!',      color: '#22c55e', msg: 'You really know your logos. Impressive!' };
  if (pct >= 0.6)  return { emoji: '👍', title: 'Great Job!',        color: '#00e5ff', msg: 'Solid knowledge. Keep practicing!' };
  if (pct >= 0.4)  return { emoji: '🤔', title: 'Not Bad!',          color: '#a855f7', msg: 'Room to grow. Try again?' };
  return           { emoji: '😅', title: 'Keep Learning!',           color: '#f97316', msg: 'Practice makes perfect. You\'ve got this!' };
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state;

  const [showScore, setShowScore] = useState(0);

  // Animate score counter
  useEffect(() => {
    if (!state?.score) return;
    let current = 0;
    const step = Math.ceil(state.score / 20);
    const interval = setInterval(() => {
      current = Math.min(current + step, state.score);
      setShowScore(current);
      if (current >= state.score) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [state?.score]);

  if (!state) {
    navigate('/');
    return null;
  }

  const { score, correctCount, totalQuestions, timeTaken, playerName } = state;
  const meta = getResultMeta(score, totalQuestions);
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="result-page">
      <div className="bg-grid" />

      <div className="result-card card animate-bounceIn">
        {/* Result header */}
        <div className="result-header">
          <div className="result-emoji" style={{ '--c': meta.color }}>{meta.emoji}</div>
          <h1 className="result-title" style={{ color: meta.color }}>{meta.title}</h1>
          <p className="result-msg">{meta.msg}</p>
        </div>

        {/* Score display */}
        <div className="score-circle" style={{ '--c': meta.color }}>
          <div className="score-inner">
            <span className="score-num">{showScore}</span>
            <span className="score-max">/ {totalQuestions * 10}</span>
          </div>
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="score-ring-track" />
            <circle
              cx="60" cy="60" r="52"
              className="score-ring-fill"
              stroke={meta.color}
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / (totalQuestions * 10))}`}
            />
          </svg>
        </div>

        {/* Stats */}
        <div className="result-stats">
          <div className="result-stat">
            <span className="rs-val">{correctCount}/{totalQuestions}</span>
            <span className="rs-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="rs-val">{accuracy}%</span>
            <span className="rs-label">Accuracy</span>
          </div>
          <div className="result-stat">
            <span className="rs-val">{timeTaken}s</span>
            <span className="rs-label">Time</span>
          </div>
        </div>

        <div className="result-player">
          Playing as <strong>{playerName}</strong>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => navigate('/game')}>
            🔄 Play Again
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/leaderboard')}>
            🏆 Leaderboard
          </button>
        </div>

        {!user && (
          <div className="result-register-cta">
            <p>Want to track your scores? Create a free account!</p>
            <button className="btn btn-ghost" onClick={() => navigate('/auth')}>
              ✨ Register Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
