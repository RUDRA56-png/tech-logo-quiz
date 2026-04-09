import axios from 'axios';

// Base URL – change for production deployment
const BASE_URL = "https://tech-logo-quiz.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// Quiz APIs
export const quizAPI = {
  getQuestions: (count = 10) => api.get(`/questions?count=${count}`),
  checkAnswer:  (questionId, answer) => api.post('/questions/check', { questionId, answer }),
};

// Score APIs
export const scoreAPI = {
  submit:      (data)        => api.post('/scores', data),
  leaderboard: (limit = 20)  => api.get(`/scores/leaderboard?limit=${limit}`),
  userScores:  (userId)      => api.get(`/scores/user/${userId}`),
};

export default api;
