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
  const [guestName, setGuestName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answers, setAnswers] = useState([]);
  const [startTime] = useState(Date.now());

  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  // Load questions
  useEffect(() => {
    quizAPI.getQuestions(QUESTION_COUNT)
      .then(res => {
        const data = res.data.data || [];
        setQuestions(data);
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
      setTimeLeft(t => t - 1);
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
    }, 1000);
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
    } catch {
      correct = false;
    }

    if (correct) {
      setFeedback('correct');
      setScore(s => s + POINTS_PER_CORRECT);
      setCorrectCount(c => c + 1);
    } else {
      setFeedback('wrong');
    }

    setAnswers(a => [...a, { questionId: q.id, answer: option, correct }]);
    advanceQuestion();
  }, [selected, phase, questions, currentIdx, advanceQuestion]);

  const finishGame = useCallback(async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    setPhase('finished');

    try {
      await scoreAPI.submit({
        userId: user?.userId || null,
        guestName: isGuest ? (guestName || 'Guest') : null,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
      });
    } catch {}

    navigate('/result', {
      state: {
        score,
        correctCount,
        totalQuestions: questions.length,
        timeTaken,
        playerName: user?.name || guestName || 'Guest',
      },
    });
  }, [score, correctCount, questions.length, user, guestName, isGuest, startTime, navigate]);

  // Prevent crash if no data
  if (!questions.length) {
    return <div style={{ color: "white", textAlign: "center" }}>Loading questions...</div>;
  }

  const q = questions[currentIdx];

  return (
    <div className="game-page">

      <h2>Question {currentIdx + 1} / {questions.length}</h2>
      <h3>Score: {score}</h3>

      {/* LOGO */}
      <img
        src={q?.logoUrl}
        alt="logo"
        style={{ width: "150px", margin: "20px" }}
      />

      {/* OPTIONS */}
      <div>
        {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={selected !== null}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "200px"
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* TIMER */}
      <p>Time left: {timeLeft}s</p>

    </div>
  );
}