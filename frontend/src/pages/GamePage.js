import React, { useState, useEffect, useRef } from 'react';
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

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  // 🔥 NEW
  const [phase, setPhase] = useState('loading'); // loading | name | playing
  const [guestName, setGuestName] = useState('');

  const timerRef = useRef(null);

  // 🔹 LOAD QUESTIONS
  useEffect(() => {
    quizAPI.getQuestions(QUESTION_COUNT)
      .then(res => {
        const data = res.data.data || [];
        setQuestions(data);

        if (isGuest) {
          setPhase('name'); // 🔥 ask name first
        } else {
          setPhase('playing');
          sounds.start();
        }
      })
      .catch(() => toast.error('Failed to load questions'));
  }, []);

  // 🔥 START GAME AFTER NAME
  const startGame = () => {
    if (!guestName.trim()) {
      alert("Enter your name");
      return;
    }
    setPhase('playing');
    sounds.start();
  };

  // 🔥 TIMER (ONLY WHEN PLAYING)
  useEffect(() => {
    if (!questions.length || phase !== 'playing') return;

    clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          goNext();
          return TIMER_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);

  }, [currentIdx, phase]);

  // 🔹 NEXT QUESTION
  const goNext = () => {
    if (currentIdx + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setFeedback(null);
    }
  };

  // 🔹 HANDLE ANSWER
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
      setFeedback("correct");
      setScore(s => s + POINTS_PER_CORRECT);
      setCorrectCount(c => c + 1);
    } else {
      setFeedback("wrong");
    }

    setTimeout(goNext, 800);
  };

  // 🔹 FINISH GAME
  const finishGame = async () => {

    try {
      await scoreAPI.submit({
        userId: user?.userId || null,
        guestName: isGuest ? guestName : null, // 🔥 USE REAL NAME
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken: 0,
      });
    } catch {}

    navigate('/result', {
      state: {
        score,
        correctCount,
        totalQuestions: questions.length,
        playerName: user?.name || guestName || "Guest"
      }
    });
  };

  // 🔹 NAME INPUT SCREEN
  if (phase === 'name') {
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
        <h2>Enter Your Name</h2>

        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name"
          style={{ padding: "10px", width: "200px", marginBottom: "10px" }}
        />

        <br />

        <button onClick={startGame}>
          Start Game
        </button>
      </div>
    );
  }

  // 🔹 LOADING
  if (!questions.length || phase !== 'playing') {
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
        {q.options.map((opt, i) => {

          let bg = "#222";

          if (selected === opt) {
            bg = feedback === "correct" ? "green" : "red";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              style={{
                display: "block",
                margin: "10px auto",
                padding: "12px",
                width: "220px",
                backgroundColor: bg,
                color: "white",
                border: "1px solid #555",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p>Time left: {timeLeft}s</p>

    </div>
  );
}