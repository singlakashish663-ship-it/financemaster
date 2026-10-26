import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { getLeaderboard } from '../services/api';
import Navbar from '../components/layout/Navbar';

const AVATAR_EMOJIS = { explorer: '🧭', investor: '📈', scholar: '📚', trader: '⚡', creator: '🚀', guardian: '🛡️' };

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('xp');

  useEffect(() => {
    setLoading(true);
    getLeaderboard({ type: period, limit: 50 })
      .then((d) => setLeaders(d.leaderboard || []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, [period]);

  const top3 = leaders.slice(0, 3);
  const rest  = leaders.slice(3);
  const PODIUM_COLORS = {
    1: 'from-gold-500 to-gold-400 border-gold-500/50 shadow-glow-gold',
    2: 'from-slate-400 to-slate-300 border-slate-400/50',
    3: 'from-amber-700 to-amber-600 border-amber-700/50',
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="section-container pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl text-white mb-3">🏆 Leaderboard</h1>
          <p className="text-slate-400">Top FinanceQuest adventurers. Only display names are shown — never emails or private data.</p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10">
          {[{ id: 'xp', label: '⚡ All-Time XP' }, { id: 'streak', label: '🔥 Streak' }].map(({ id, label }) => (
            <button key={id} onClick={() => setPeriod(id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${period === id ? 'bg-violet-600 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            {[...Array(10)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <span className="text-5xl block mb-4">🏆</span>
            <p>No data yet. Connect to backend and start learning to appear here!</p>
          </div>
        ) : (
          <>
            {top3.length === 3 && (
              <div className="flex items-end justify-center gap-4 mb-12 max-w-2xl mx-auto">
                {[top3[1], top3[0], top3[2]].map((leader, idx) => {
                  const rank   = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const height = rank === 1 ? 'h-40' : rank === 2 ? 'h-32' : 'h-24';
                  return (
                    <motion.div key={rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                      className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl border ${PODIUM_COLORS[rank]} ${leader.isCurrentUser ? 'ring-2 ring-violet-400' : ''}`}>
                        {AVATAR_EMOJIS[leader.avatar] || '🧭'}
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold text-sm">{leader.displayName}</div>
                        <div className="text-gold-400 text-xs">{leader.xp?.toLocaleString()} XP</div>
                      </div>
                      <div className={`w-full ${height} rounded-t-xl bg-gradient-to-t ${PODIUM_COLORS[rank]} flex items-start justify-center pt-2`}>
                        <span className="font-game font-bold text-xl text-white">#{rank}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 max-w-2xl mx-auto">
              {(top3.length === 3 ? rest : leaders).map((leader, i) => {
                const rank = top3.length === 3 ? i + 4 : i + 1;
                return (
                  <motion.div key={rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${leader.isCurrentUser ? 'border-violet-500/50 bg-violet-500/10' : 'glass-card border-white/5'}`}>
                    <div className="w-8 text-center font-game font-bold text-slate-500 text-sm">#{rank}</div>
                    <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-xl">{AVATAR_EMOJIS[leader.avatar] || '🧭'}</div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">
                        {leader.displayName}
                        {leader.isCurrentUser && <span className="badge-violet text-xs ml-2">You</span>}
                      </div>
                      <div className="text-slate-500 text-xs">Level {leader.level}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {leader.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-400 text-xs"><Flame className="w-3.5 h-3.5" />{leader.streak}</div>
                      )}
                      <div className="flex items-center gap-1 text-gold-400 text-sm font-semibold"><Zap className="w-3.5 h-3.5" />{leader.xp?.toLocaleString()}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
