import axios from 'axios';
import { getIdToken } from './firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* unauthenticated */ }
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred';
    const error = new Error(message);
    error.status = err.response?.status;
    error.data = err.response?.data;
    return Promise.reject(error);
  }
);

// ---- Auth / Profile ----
export const getMe          = ()       => api.get('/auth/me');
export const getProfile     = ()       => api.get('/profile');
export const updateProfile  = (data)   => api.patch('/profile', data);
export const deleteProfile  = ()       => api.delete('/profile');
export const saveOnboarding = (data)   => api.post('/auth/onboarding', data);
export const exportData     = ()       => api.post('/auth/export');

// ---- Worlds & Missions ----
export const getWorlds       = ()            => api.get('/worlds');
export const getWorld        = (id)          => api.get(`/worlds/${id}`);
export const getMission      = (id)          => api.get(`/missions/${id}`);
export const startMission    = (id)          => api.post(`/missions/${id}/start`);
export const completeMission = (id, data)    => api.post(`/missions/${id}/complete`, data);

// ---- Learning Progress ----
export const getMyProgress      = ()   => api.get('/progress/me');
export const getMastery         = ()   => api.get('/progress/mastery');
export const getHistory         = ()   => api.get('/progress/history');
export const getRecommendations = ()   => api.get('/learning/recommendations');

// ---- Stock Academy ----
export const getStockModules        = ()          => api.get('/stock-academy/modules');
export const getStockLesson         = (id)        => api.get(`/stock-academy/lessons/${id}`);
export const completeStockLesson    = (id, data)  => api.post(`/stock-academy/lessons/${id}/complete`, data);
export const getStockAcademyProgress= ()          => api.get('/stock-academy/progress');

// ---- Paper Trading ----
export const getStocks             = ()            => api.get('/market/stocks');
export const getStock              = (id)          => api.get(`/market/stocks/${id}`);
export const getStockHistory       = (id, params)  => api.get(`/market/stocks/${id}/history`, { params });
export const getPortfolio          = ()            => api.get('/paper-trading/portfolio');
export const placeOrder            = (data)        => api.post('/paper-trading/orders', data);
export const getOrders             = ()            => api.get('/paper-trading/orders');
export const cancelOrder           = (id)          => api.post(`/paper-trading/orders/${id}/cancel`);
export const getTransactions       = ()            => api.get('/paper-trading/transactions');
export const getPerformance        = ()            => api.get('/paper-trading/performance');
export const getWatchlist          = ()            => api.get('/paper-trading/watchlist');
export const addToWatchlist        = (data)        => api.post('/paper-trading/watchlist', data);
export const removeFromWatchlist   = (id)          => api.delete(`/paper-trading/watchlist/${id}`);
export const resetPortfolio        = ()            => api.post('/paper-trading/reset');

// ---- Calculators ----
export const calcEMI               = (data) => api.post('/calculators/emi', data);
export const calcCompoundInterest  = (data) => api.post('/calculators/compound-interest', data);
export const calcInflation         = (data) => api.post('/calculators/inflation', data);
export const calcInvestmentReturns = (data) => api.post('/calculators/investment-returns', data);

// ---- Quests & Rewards ----
export const getTodayQuests = ()   => api.get('/quests/today');
export const claimQuest     = (id) => api.post(`/quests/${id}/claim`);
export const getRewards     = ()   => api.get('/rewards');

// ---- Dashboard & Social ----
export const getDashboard   = ()        => api.get('/dashboard');
export const getLeaderboard = (params)  => api.get('/leaderboard', { params });

export default api;
