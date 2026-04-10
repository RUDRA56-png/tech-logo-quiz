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

  const [phase, setPhase] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [startTime] = useState(Date.now());

  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  // Load questions
  useEffect(() => {
    quizAPI.getQuestions(QUESTION_COUNT)
      .then(res => {
        const data = res.data.data || [];
        setQuestions(data);
        setPhase('playing');
        sounds.start();
      })
      .catch(() => toast.error('Failed to load questions'));
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(null);
          return TIMER_SECONDS;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const advanceQuestion = () => {
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => {
      const nextIdx = currentIdx + 1;

      if (nextIdx >= questions.length) {
        finishGame();
      } else {
        setCurrentIdx(nextIdx);
        setSelected(null);
        setTimeLeft(TIMER_SECONDS);
      }
    }, 800);
  };

  const handleAnswer = async (option) => {
    if (selected !== null) return;

    setSelected(option);
    clearInterval(timerRef.current);

    const q = questions[currentIdx];
    let correct = false;

    try {
      const res = await quizAPI.checkAnswer(q.id, option || '');
      correct = res.data.data;
    } catch {}

    if (correct) {
      setScore(s => s + POINTS_PER_CORRECT);
      setCorrectCount(c => c + 1);
    }

    advanceQuestion();
  };

  const finishGame = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      await scoreAPI.submit({
        userId: user?.userId || null,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
      });
    } catch {}

    navigate('/result', {
      state: { score, correctCount, totalQuestions: questions.length, timeTaken }
    });
  };

  if (!questions.length) {
    return <div style={{ color: "white", textAlign: "center" }}>Loading...</div>;
  }

  const q = questions[currentIdx];

  return (
    <div className="game-page">

      <h2>Question {currentIdx + 1} / {questions.length}</h2>
      <h3>Score: {score}</h3>

      <img
        src={q.logoUrl}
        alt="logo"
        style={{ width: "150px", margin: "20px" }}
      />

      <div>
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "12px",
              width: "220px",
              backgroundColor: selected === opt ? "#444" : "#222",
              color: "white",
              border: "1px solid #555",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <p>Time left: {timeLeft}s</p>

    </div>
  );
}