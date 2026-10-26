import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { getRewards } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

const RARITY_STYLES = {
  common:    { badge: 'bg-slate-600/30 text-slate-300 border-slate-600/30', glow: '' },
  rare:      { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',    glow: 'shadow-glow-cyan' },
  epic:      { badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', glow: 'shadow-glow-sm' },
  legendary: { badge: 'bg-gold-500/20 text-gold-300 border-gold-500/30',    glow: 'shadow-glow-gold' },
};

const STATIC_ACHIEVEMENTS = [
  { slug: 'first-mission',    title: 'First Steps',        emoji: '🎯', category: 'learning', rarity: 'common',    xpReward: 100,  desc: 'Complete your first mission' },
  { slug: 'five-missions',    title: 'Quick Learner',      emoji: '⚡', category: 'learning', rarity: 'common',    xpReward: 150,  desc: 'Complete 5 missions' },
  { slug: 'first-trade',      title: 'Market Debut',       emoji: '📈', category: 'trading',  rarity: 'common',    xpReward: 100,  desc: 'Place your first simulated trade' },
  { slug: 'ten-trades',       title: 'Active Trader',      emoji: '🔄', category: 'trading',  rarity: 'rare',      xpReward: 200,  desc: 'Complete 10 simulated trades' },
  { slug: 'first-world',      title: 'World Conqueror',    emoji: '🌍', category: 'learning', rarity: 'rare',      xpReward: 300,  desc: 'Complete your first world' },
  { slug: 'streak-7',         title: 'Week Warrior',       emoji: '🔥', category: 'streak',   rarity: 'rare',      xpReward: 250,  desc: 'Maintain a 7-day learning streak' },
  { slug: 'streak-30',        title: 'Month Master',       emoji: '🌟', category: 'streak',   rarity: 'epic',      xpReward: 500,  desc: 'Maintain a 30-day learning streak' },
  { slug: 'stock-academy-1',  title: 'Market Freshman',    emoji: '🏛️', category: 'learning', rarity: 'common',    xpReward: 200,  desc: 'Complete Stock Market Fundamentals' },
  { slug: 'stock-academy-5',  title: 'Market Scholar',     emoji: '📚', category: 'learning', rarity: 'epic',      xpReward: 500,  desc: 'Complete 5 Stock Market Academy levels' },
  { slug: 'stock-academy-10', title: 'Market Maestro',     emoji: '🎓', category: 'learning', rarity: 'legendary', xpReward: 1000, desc: 'Complete all 10 Stock Market Academy levels' },
  { slug: 'scam-detector',    title: 'Scam Detector',      emoji: '🔍', category: 'special',  rarity: 'epic',      xpReward: 300,  desc: 'Identify all red flags in the Scam Detective' },
  { slug: 'diversified',      title: 'Diversifier',        emoji: '🎯', category: 'trading',  rarity: 'epic',      xpReward: 400,  desc: 'Hold stocks from 5 different sectors' },
  { slug: 'level-10',         title: 'Veteran Adventurer', emoji: '👑', category: 'special',  rarity: 'legendary', xpReward: 1000, desc: 'Reach Level 10' },
  { slug: 'hidden-easter-egg',title: '???',                emoji: '🥚', category: 'hidden',   rarity: 'legendary', xpReward: 500,  desc: 'Find the hidden easter egg', isHidden: true },
];

const CATEGORIES = ['all', 'learning', 'trading', 'streak', 'special', 'hidden'];

export default function AchievementsPage() {
  const [earned,   setEarned]   = useState(new Set());
  const [userXP,   setUserXP]   = useState(0);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getRewards()
      .then((d) => {
        setEarned(new Set((d.achievements || []).map((a) => a.achievementId?.slug).filter(Boolean)));
        setUserXP(d.xp || 0);
      })
      .catch(() => setEarned(new Set()))
      .finally(() => setLoading(false));
  }, []);

  const filtered = STATIC_ACHIEVEMENTS.filter((a) =>
    filter === 'all' ? (!a.isHidden || earned.has(a.slug)) : a.category === filter
  );
  const earnedCount = STATIC_ACHIEVEMENTS.filter((a) => earned.has(a.slug)).length;

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">🏆 Achievements</h1>
          <p className="text-slate-400">Complete missions, build streaks, and master finance to unlock badges.</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Earned',      value: `${earnedCount}/${STATIC_ACHIEVEMENTS.filter((a) => !a.isHidden).length}` },
            { label: 'Total XP',    value: userXP.toLocaleString() },
            { label: 'Legendaries', value: [...earned].filter((s) => STATIC_ACHIEVEMENTS.find((a) => a.slug === s)?.rarity === 'legendary').length },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="font-display font-bold text-2xl text-white">{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === cat ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((a, i) => {
              const isEarned = earned.has(a.slug);
              const style    = RARITY_STYLES[a.rarity] || RARITY_STYLES.common;
              return (
                <motion.div key={a.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className={`glass-card p-5 text-center relative overflow-hidden transition-all ${isEarned ? `border border-white/20 ${style.glow}` : 'border border-white/5 opacity-60'}`}>
                  {isEarned && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs">✓</span>
                    </div>
                  )}
                  <div className={`text-4xl mb-3 ${!isEarned ? 'grayscale opacity-40' : ''}`}>
                    {a.isHidden && !isEarned ? '🔒' : a.emoji}
                  </div>
                  <div className="font-display font-semibold text-white text-sm mb-1">
                    {a.isHidden && !isEarned ? '???' : a.title}
                  </div>
                  <div className="text-slate-500 text-xs mb-3 leading-relaxed">
                    {a.isHidden && !isEarned ? 'Hidden achievement' : a.desc}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`badge text-xs border ${style.badge}`}>{a.rarity}</span>
                    <div className="flex items-center gap-1 text-gold-400 text-xs"><Zap className="w-3 h-3" />{a.xpReward}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
