import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Map, BookOpen, TrendingUp, Calculator, Trophy,
  Target, Flame, ArrowRight, Star, ChevronRight, Play,
  BarChart2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

function ProgressRing({ progress = 0, size = 60, stroke = 5, color = '#8b5cf6' }) {
  const r = (size - stroke * 2) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.7s ease-in-out' }} />
    </svg>
  );
}

function XPBar({ xp, level }) {
  const base = (level - 1) * 500;
  const next = level * 500;
  const pct  = ((xp - base) / (next - base)) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{xp - base} / {next - base} XP</span>
        <span>Level {level + 1}</span>
      </div>
      <div className="xp-bar h-2">
        <motion.div className="xp-bar-fill" initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
      </div>
    </div>
  );
}

const AVATAR_EMOJIS = { explorer: '🧭', investor: '📈', scholar: '📚', trader: '⚡', creator: '🚀', guardian: '🛡️' };

export default function DashboardPage() {
  const { userProfile, firebaseUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const user = data?.user || {
    username: userProfile?.username || firebaseUser?.displayName || 'Adventurer',
    level: userProfile?.level || 1,
    xp: userProfile?.xp || 0,
    streak: userProfile?.streak || 0,
    avatar: userProfile?.avatar || 'explorer',
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <AppLayout>
      <div className="section-container py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-3xl shadow-glow-sm">
                {AVATAR_EMOJIS[user.avatar] || '🧭'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bg-card border-2 border-bg-primary flex items-center justify-center">
                <span className="text-xs font-game font-bold text-violet-400">{user.level}</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">{greeting()},</p>
              <h1 className="font-display font-bold text-2xl text-white">{user.username}!</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
                <Flame className="w-5 h-5 text-gold-400" />
                <span className="font-display font-bold text-gold-400">{user.streak}</span>
                <span className="text-gold-500/70 text-sm">day streak</span>
              </div>
            )}
            <Link to="/worlds" className="btn-primary text-sm">
              <Play className="w-4 h-4" /> Continue Learning
            </Link>
          </div>
        </motion.div>

        {/* XP bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 border border-violet-500/20 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold-400" />
              <span className="font-semibold text-white text-sm">Level {user.level}</span>
            </div>
            <span className="text-slate-500 text-sm">{user.xp} total XP</span>
          </div>
          <XPBar xp={user.xp} level={user.level} />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target,   label: 'Missions Done',    value: data?.progress?.totalMissionsCompleted ?? '—',  color: 'violet' },
            { icon: BookOpen, label: 'Academy Level',    value: data?.progress?.stockAcademyLevel ?? 0,          color: 'cyan' },
            { icon: BarChart2,label: 'Portfolio Value',  value: data?.portfolio ? `₹${(data.portfolio.portfolioValue/1000).toFixed(0)}K` : '₹100K', color: 'green' },
            { icon: Trophy,   label: 'Worlds Started',   value: data?.progress?.worldsStarted ?? 0,             color: 'gold' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <div className={`glass-card p-5 border border-${s.color}-500/20`}>
                <s.icon className={`w-6 h-6 text-${s.color}-400 mb-2`} />
                <div className="font-display font-bold text-2xl text-white">{s.value}</div>
                <div className="text-slate-500 text-sm mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Quests */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold-400" /> Daily Quests
                </h2>
                <span className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
              ) : data?.quests?.length ? (
                <div className="space-y-3">
                  {data.quests.map(({ quest, completed, claimed, progress, target }) => (
                    <div key={quest._id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/3'}`}>
                      <span className="text-2xl">{quest.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">{quest.title}</div>
                        <div className="text-slate-500 text-xs">{quest.description}</div>
                        {!completed && (
                          <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden w-32">
                            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min((progress/target)*100,100)}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gold-400 text-xs font-semibold">+{quest.xpReward} XP</span>
                        {completed ? claimed
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          : <button className="btn-gold text-xs py-1 px-3">Claim</button>
                          : <span className="text-slate-600 text-xs">{progress}/{target}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Start the backend server to load quests</p>
                  <Link to="/worlds" className="btn-primary mt-4 text-sm inline-flex">Start Learning</Link>
                </div>
              )}
            </motion.div>

            {/* Quick Access */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-card p-6">
              <h2 className="font-display font-bold text-white mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'World Map',      emoji: '🗺️', href: '/worlds' },
                  { label: 'Stock Academy',  emoji: '📊', href: '/stock-academy' },
                  { label: 'Trading',        emoji: '💹', href: '/trading' },
                  { label: 'Calculators',    emoji: '🔢', href: '/tools' },
                  { label: 'Platformer',     emoji: '🎮', href: '/games/platformer' },
                  { label: 'Achievements',   emoji: '🏆', href: '/achievements' },
                ].map(({ label, emoji, href }) => (
                  <Link key={href} to={href} className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-medium text-slate-300">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Portfolio */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="glass-card p-6 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-white text-sm">Virtual Portfolio</h2>
                <div className="badge-green text-xs">Simulation</div>
              </div>
              {data?.portfolio ? (
                <>
                  <div className="text-2xl font-display font-bold text-white mb-1">
                    ₹{data.portfolio.portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <div className={`text-sm font-medium ${data.portfolio.totalReturn >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                    {data.portfolio.totalReturn >= 0 ? '+' : ''}₹{Math.abs(data.portfolio.totalReturn).toLocaleString()} total
                  </div>
                  <div className="divider my-4" />
                  <div className="flex justify-between text-sm">
                    <div><div className="text-slate-500">Total Trades</div><div className="text-white font-semibold">{data.portfolio.totalTrades}</div></div>
                    <div className="text-right"><div className="text-slate-500">Cash</div><div className="text-white font-semibold">₹{(data.portfolio.cashBalance/1000).toFixed(0)}K</div></div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-400/40" />
                  <p className="text-slate-500 text-sm">₹1,00,000 virtual cash ready</p>
                  <Link to="/trading" className="btn-primary mt-3 text-xs w-full justify-center">Start Trading</Link>
                </div>
              )}
              <Link to="/trading" className="btn-ghost text-xs mt-3 w-full justify-center">
                View Terminal <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-white text-sm">Recent Achievements</h2>
                <Link to="/achievements" className="text-violet-400 text-xs hover:text-violet-300">View all</Link>
              </div>
              {data?.recentAchievements?.length ? (
                <div className="space-y-3">
                  {data.recentAchievements.map((ua) => (
                    <div key={ua._id} className="flex items-center gap-3">
                      <span className="text-xl">{ua.achievementId?.emoji || '🏅'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{ua.achievementId?.title}</div>
                        <div className="text-xs text-slate-500">{new Date(ua.earnedAt).toLocaleDateString()}</div>
                      </div>
                      <div className={`badge text-xs ${ua.achievementId?.rarity === 'legendary' ? 'badge-gold' : ua.achievementId?.rarity === 'epic' ? 'badge-violet' : 'badge-green'}`}>
                        {ua.achievementId?.rarity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-gold-400/30" />
                  <p className="text-slate-500 text-sm">Complete missions to earn achievements</p>
                </div>
              )}
            </motion.div>

            {/* Academy progress */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="glass-card p-6 border border-cyan-500/20">
              <h2 className="font-display font-bold text-white text-sm mb-4">Stock Academy Progress</h2>
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <ProgressRing progress={(data?.progress?.stockAcademyLevel || 0) / 10 * 100} size={64} stroke={5} color="#06b6d4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-game font-bold text-cyan-400 text-sm">{data?.progress?.stockAcademyLevel || 0}/10</span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {data?.progress?.stockAcademyLevel ? `Level ${data.progress.stockAcademyLevel} Complete` : 'Not Started'}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">10 levels total</div>
                </div>
              </div>
              <Link to="/stock-academy" className="btn-secondary text-xs w-full justify-center">
                {data?.progress?.stockAcademyLevel ? 'Continue Academy' : 'Enter Academy'}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
