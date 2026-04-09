import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreAPI } from '../utils/api';
import './LeaderboardPage.css';

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchScores = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await scoreAPI.leaderboard(50);
      setScores(res.data.data || []);
      setLastRefresh(new Date());
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(() => fetchScores(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchScores]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--accent-yellow)';
    if (score >= 70) return 'var(--accent-green)';
    if (score >= 50) return 'var(--accent-cyan)';
    return 'var(--text-secondary)';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="leaderboard-page">
      <div className="bg-grid" />

      <div className="container-wide" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="lb-header animate-fadeInUp">
          <div className="lb-title-row">
            <h1 className="lb-title">
              <span className="gradient-text">Leaderboard</span>
            </h1>
            <button
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchScores(true)}
              title="Refresh"
            >
              🔄
            </button>
          </div>
          <p className="lb-subtitle">
            Top scorers from around the world • Last updated {formatTime(lastRefresh)}
          </p>

          <div className="lb-actions">
            <button className="btn btn-primary" onClick={() => navigate('/game')}>
              🚀 Play Now
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              ← Home
            </button>
          </div>
        </div>

        {/* Podium — top 3 */}
        {!loading && scores.length >= 3 && (
          <div className="podium animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            {/* 2nd place */}
            <div className="podium-spot podium-2">
              <div className="podium-avatar">🥈</div>
              <div className="podium-name">{scores[1].playerName}</div>
              <div className="podium-score">{scores[1].score}</div>
              <div className="podium-block p2-block">2</div>
            </div>
            {/* 1st place */}
            <div className="podium-spot podium-1">
              <div className="podium-crown">👑</div>
              <div className="podium-avatar">🥇</div>
              <div className="podium-name">{scores[0].playerName}</div>
              <div className="podium-score">{scores[0].score}</div>
              <div className="podium-block p1-block">1</div>
            </div>
            {/* 3rd place */}
            <div className="podium-spot podium-3">
              <div className="podium-avatar">🥉</div>
              <div className="podium-name">{scores[2].playerName}</div>
              <div className="podium-score">{scores[2].score}</div>
              <div className="podium-block p3-block">3</div>
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="lb-list animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="lb-loading">
              <div className="spinner" />
              <p>Loading scores…</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="lb-empty">
              <p>🎮 No scores yet. Be the first to play!</p>
              <button className="btn btn-primary" onClick={() => navigate('/game')}>
                Start Quiz
              </button>
            </div>
          ) : (
            <div className="lb-table">
              <div className="lb-table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Score</span>
                <span className="hide-sm">Correct</span>
                <span className="hide-sm">Time</span>
                <span>Type</span>
              </div>
              {scores.map((s, i) => (
                <div
                  key={s.id}
                  className={`lb-row ${i < 3 ? 'top-three' : ''}`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="rank-cell">
                    {i < 3 ? getRankIcon(i + 1) : <span className="rank-num">#{i + 1}</span>}
                  </span>
                  <span className="player-cell">
                    <span className="player-dot" style={{ background: `hsl(${(i * 47) % 360}, 70%, 60%)` }} />
                    {s.playerName}
                  </span>
                  <span className="score-cell" style={{ color: getScoreColor(s.score) }}>
                    {s.score}
                  </span>
                  <span className="hide-sm correct-cell">
                    {s.correctAnswers}/{s.totalQuestions}
                  </span>
                  <span className="hide-sm time-cell">
                    {s.timeTaken ? `${s.timeTaken}s` : '—'}
                  </span>
                  <span className={`type-badge badge ${s.playerType === 'registered' ? 'badge-cyan' : 'badge-medium'}`}>
                    {s.playerType === 'registered' ? '✓' : 'G'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="live-badge">
          <span className="live-dot" />
          Live • Auto-refreshes every 30s
        </div>
      </div>
    </div>
  );
}
