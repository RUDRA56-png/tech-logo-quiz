import React, { useState, useEffect } from 'react';
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

  const [phase, setPhase] = useState('loading');
  const [guestName, setGuestName] = useState('');

  // 🔹 LOAD QUESTIONS
  useEffect(() => {
    quizAPI.getQuestions(QUESTION_COUNT)
      .then(res => {
        const data = res.data.data || [];
        setQuestions(data);

        if (isGuest) {
          setPhase('name');
        } else {
          setPhase('playing');
          sounds.start();
        }
      })
      .catch(() => toast.error('Failed to load questions'));
  }, []);

  // 🔹 START GAME
  const startGame = () => {
    if (!guestName.trim()) {
      alert("Enter your name");
      return;
    }
    setPhase('playing');
    sounds.start();
  };

  // 🔥 TIMER (setTimeout safe version)
  useEffect(() => {
    if (!questions.length || phase !== 'playing') return;

    if (timeLeft === 0) {
      goNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [timeLeft, currentIdx, phase]);

  // 🔹 NEXT QUESTION
  const goNext = () => {
    if (currentIdx + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIMER_SECONDS);
    }
  };

  // 🔹 HANDLE ANSWER
  const handleAnswer = async (option) => {

    if (selected !== null) return;

    setSelected(option);

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
        guestName: isGuest ? guestName : null,
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

  // 🔥 MODERN NAME SCREEN
  if (phase === 'name') {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #020617)"
      }}>

        <div style={{
          backgroundColor: "#111827",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 0 30px rgba(0,0,0,0.6)",
          textAlign: "center",
          width: "320px"
        }}>

          <h2 style={{
            color: "white",
            marginBottom: "20px"
          }}>
            Enter Your Name
          </h2>

          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              backgroundColor: "#020617",
              color: "white",
              fontSize: "16px",
              marginBottom: "20px",
              outline: "none"
            }}
          />

          <button
            onClick={startGame}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.3s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            Start Game 🚀
          </button>

        </div>
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
        loading="lazy"
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
                cursor: "pointer",
                transition: "0.2s"
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