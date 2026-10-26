import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Lock, CheckCircle, ChevronRight, Play,
  BarChart3, Zap, Star, Shield, TrendingUp
} from 'lucide-react';
import { getStockModules, getStockAcademyProgress } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

const MODULE_ICONS = ['🏛️','⚖️','📊','🔍','⚡','🎯','📈','🏦','🔮','🧠'];

function LessonTypeIcon({ type }) {
  const map = { lesson: BookOpen, 'chart-lab': BarChart3, interactive: Zap };
  const Icon = map[type] || BookOpen;
  return <Icon className="w-4 h-4" />;
}

function ModuleCard({ module, currentLevel, index }) {
  const [expanded, setExpanded] = useState(false);
  const isUnlocked  = currentLevel >= module.level - 1;
  const isCompleted = currentLevel >= module.level;
  const isCurrent   = currentLevel === module.level - 1;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`glass-card border overflow-hidden transition-all duration-300 ${
        isCompleted ? 'border-emerald-500/30' :
        isCurrent   ? 'border-violet-500/50 shadow-glow-sm' :
        isUnlocked  ? 'border-white/15' : 'border-white/5 opacity-60'
      }`}>
      <button
        onClick={() => isUnlocked && setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
        disabled={!isUnlocked}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${
          isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20' :
          isCurrent   ? 'bg-violet-500/20 border border-violet-500/30 shadow-glow-sm' :
          isUnlocked  ? 'bg-white/5 border border-white/10' :
                        'bg-white/3 border border-white/5'
        }`}>
          {MODULE_ICONS[index]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-slate-500 font-game">LEVEL {module.level}</span>
            {module.isFree ? <span className="badge-green text-xs">Free</span> : <span className="badge-violet text-xs">Premium</span>}
            {isCurrent && <span className="badge-cyan text-xs animate-pulse">Current</span>}
          </div>
          <h3 className="font-display font-semibold text-white truncate">{module.title}</h3>
          <p className="text-slate-500 text-sm truncate">{module.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-gold-400 text-sm font-semibold">{module.xpReward} XP</div>
            <div className="text-slate-600 text-xs">{module.lessons?.length || 0} lessons</div>
          </div>
          {isCompleted
            ? <CheckCircle className="w-6 h-6 text-emerald-400" />
            : !isUnlocked
            ? <Lock className="w-5 h-5 text-slate-600" />
            : <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && isUnlocked && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-2">
              {module.lessons?.map((lesson) => (
                <Link key={lesson.id} to={`/stock-academy/lessons/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <LessonTypeIcon type={lesson.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors truncate">{lesson.title}</div>
                    <div className="text-xs text-slate-500 capitalize">{lesson.type?.replace('-',' ')}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Zap className="w-3 h-3 text-gold-400" />
                    <span className="text-gold-400">{lesson.xpReward}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:text-violet-400 transition-colors" />
                  </div>
                </Link>
              ))}
              <Link to={`/stock-academy/lessons/${module.lessons?.[0]?.id}`}
                className="btn-primary w-full justify-center text-sm mt-2">
                <Play className="w-4 h-4" />
                {isCompleted ? 'Review Level' : 'Start Level'} {module.level}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StockAcademyPage() {
  const [modules, setModules]           = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      getStockModules().catch(() => ({ modules: [] })),
      getStockAcademyProgress().catch(() => ({ currentLevel: 0 })),
    ]).then(([mRes, pRes]) => {
      setModules(mRes.modules || []);
      setCurrentLevel(pRes.currentLevel || 0);
    }).finally(() => setLoading(false));
  }, []);

  const completedLevels = modules.filter((m) => currentLevel >= m.level).length;
  const progressPercent = modules.length > 0 ? (completedLevels / modules.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <BarChart3 className="w-4 h-4" /><span>Stock Market Academy</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl text-white mb-2">The Complete Stock Market Academy</h1>
              <p className="text-slate-400 max-w-2xl">10 structured levels from basics to advanced concepts, using fictional educational examples.</p>
            </div>
            <Link to="/trading" className="btn-secondary text-sm flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Paper Trading
            </Link>
          </div>
        </motion.div>

        {currentLevel > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card border border-violet-500/30 p-5 mb-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <span className="font-game font-bold text-violet-400 text-lg">{currentLevel}</span>
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-white mb-1">Level {currentLevel} Complete — Keep going!</div>
              <div className="text-slate-400 text-sm mb-2">{completedLevels} of {modules.length} levels completed</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="font-display font-bold text-2xl text-white">{Math.round(progressPercent)}%</div>
              <div className="text-slate-500 text-xs">Progress</div>
            </div>
          </motion.div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Levels',  value: '10',  emoji: '📚' },
            { label: 'Lessons',       value: `${modules.reduce((s,m) => s+(m.lessons?.length||0),0)}+`, emoji: '📖' },
            { label: 'Total XP',      value: modules.reduce((s,m) => s+(m.xpReward||0),0).toString(), emoji: '⚡' },
            { label: 'Free Levels',   value: modules.filter(m=>m.isFree).length.toString() || '3', emoji: '🎁' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-display font-bold text-xl text-white">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="glass-card border border-gold-500/20 p-4 mb-8 flex gap-3">
          <Shield className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400">
            <span className="text-gold-400 font-semibold">Educational Content Only. </span>
            All companies, prices, and market scenarios are entirely fictional. This is not financial advice.
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : modules.length > 0 ? (
          <div className="space-y-3">
            {modules.map((module, i) => (
              <ModuleCard key={module.level} module={module} currentLevel={currentLevel} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-violet-400/30" />
            <h3 className="font-display font-bold text-xl text-white mb-2">Academy loading...</h3>
            <p className="text-slate-400 mb-6">Run <code className="text-violet-300">npm run seed --workspace=server</code> to populate the academy.</p>
            <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
