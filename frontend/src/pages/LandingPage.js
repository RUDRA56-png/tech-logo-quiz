import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LOGOS = [
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orbitRef = useRef(null);

  const handleStart = () => navigate('/auth');
  const handleGuest = () => navigate('/game?guest=true');
  const handleLeaderboard = () => navigate('/leaderboard');

  return (
    <div className="landing">
      <div className="bg-grid" />

      {/* Floating orbit logos */}
      <div className="orbit-ring" ref={orbitRef}>
        {LOGOS.map((src, i) => (
          <div
            key={i}
            className="orbit-logo"
            style={{ '--i': i, '--total': LOGOS.length }}
          >
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </div>

      {/* Hero content */}
      <div className="landing-hero animate-fadeInUp">
        <div className="hero-badge badge badge-cyan">
          🎮 Avyakti Tech Fest Edition
        </div>

        <h1 className="hero-title">
          Can You Name<br />
          <span className="gradient-text">Every Logo?</span>
        </h1>

        <p className="hero-subtitle">
          Test your tech knowledge — 10 logos, 10 seconds each.<br />
          Compete, score, and claim the top spot.
        </p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">20+</span>
            <span className="stat-label">Logos</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">10s</span>
            <span className="stat-label">Per Logo</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">Live</span>
            <span className="stat-label">Leaderboard</span>
          </div>
        </div>

        <div className="hero-cta">
          {user ? (
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/game')}>
              🚀 Start Quiz
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-xl" onClick={handleStart}>
                🚀 Play Now
              </button>
              <button className="btn btn-secondary btn-xl" onClick={handleGuest}>
                👤 Play as Guest
              </button>
            </>
          )}
        </div>

        <button className="leaderboard-peek" onClick={handleLeaderboard}>
          🏆 View Leaderboard →
        </button>
      </div>

      {/* Feature cards */}
      <div className="features animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {[
          { icon: '⚡', title: 'Lightning Fast', desc: '10 second timer keeps the heat up' },
          { icon: '🎯', title: 'Multiple Choice', desc: '4 options — only one is right' },
          { icon: '🏆', title: 'Live Rankings', desc: 'See where you stand in real-time' },
        ].map((f) => (
          <div className="feature-card card" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
