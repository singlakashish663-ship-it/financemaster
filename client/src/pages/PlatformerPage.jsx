import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, Star, Zap, Trophy } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import NeedsWantsCatcher from '../games/NeedsWantsCatcher';
import MemoryCardMatch    from '../games/MemoryCardMatch';
import IncomeSorter       from '../games/IncomeSorter';
import BudgetAllocator    from '../games/BudgetAllocator';

// Which games appear for each world slug
const WORLD_GAMES = {
  'coin-valley': [
    {
      id: 'needs-wants-catcher',
      title: 'Needs vs Wants Catcher',
      emoji: '🎯',
      description: 'Items fall from the sky — sort them into NEED or WANT buckets before they hit the ground!',
      color: 'from-violet-600 to-violet-800',
      component: NeedsWantsCatcher,
      topic: 'Needs vs Wants',
    },
    {
      id: 'memory-match',
      title: 'Money Terms Memory Match',
      emoji: '🃏',
      description: 'Flip cards to match financial terms with their correct definitions. Test your memory!',
      color: 'from-cyan-600 to-cyan-800',
      component: (props) => <MemoryCardMatch worldSlug="coin-valley" {...props} />,
      topic: 'Financial Terms',
    },
    {
      id: 'income-sorter',
      title: 'Income Type Sorter',
      emoji: '💼',
      description: 'Classify each income source as Earned or Passive income. Learn the difference!',
      color: 'from-emerald-600 to-emerald-800',
      component: IncomeSorter,
      topic: 'Income Types',
    },
  ],
  'budget-city': [
    {
      id: 'budget-allocator',
      title: 'Budget Planner Challenge',
      emoji: '📊',
      description: 'Allocate a fictional salary across categories and see how your choices compare to expert recommendations.',
      color: 'from-gold-600 to-gold-800',
      component: BudgetAllocator,
      topic: 'Budgeting',
    },
    {
      id: 'memory-match',
      title: 'Budget Terms Match',
      emoji: '🃏',
      description: 'Match budgeting terms to their definitions in this memory flip game.',
      color: 'from-violet-600 to-violet-800',
      component: (props) => <MemoryCardMatch worldSlug="budget-city" {...props} />,
      topic: 'Budget Terms',
    },
  ],
  'savings-forest': [
    {
      id: 'memory-match',
      title: 'Savings & Interest Match',
      emoji: '🃏',
      description: 'Match savings and investment terms with their definitions.',
      color: 'from-emerald-600 to-emerald-800',
      component: (props) => <MemoryCardMatch worldSlug="savings-forest" {...props} />,
      topic: 'Savings Terms',
    },
    {
      id: 'needs-wants-catcher',
      title: 'Smart Spender Catcher',
      emoji: '🎯',
      description: 'Identify spending items as needs or wants — the foundation of every savings plan.',
      color: 'from-cyan-600 to-cyan-800',
      component: NeedsWantsCatcher,
      topic: 'Smart Spending',
    },
  ],
  'investor-island': [
    {
      id: 'memory-match',
      title: 'Investing Terms Match',
      emoji: '🃏',
      description: 'Match stock market and investing terms to their definitions.',
      color: 'from-violet-600 to-violet-800',
      component: (props) => <MemoryCardMatch worldSlug="investor-island" {...props} />,
      topic: 'Investing Terms',
    },
    {
      id: 'income-sorter',
      title: 'Investment Income Sorter',
      emoji: '💹',
      description: 'Sort investment returns into active vs passive categories.',
      color: 'from-gold-600 to-gold-800',
      component: IncomeSorter,
      topic: 'Investment Returns',
    },
  ],
};

// Default games for worlds without specific config
const DEFAULT_GAMES = [
  {
    id: 'needs-wants-catcher',
    title: 'Needs vs Wants Catcher',
    emoji: '🎯',
    description: 'Sort falling items into NEED or WANT buckets before time runs out!',
    color: 'from-violet-600 to-violet-800',
    component: NeedsWantsCatcher,
    topic: 'Needs vs Wants',
  },
  {
    id: 'memory-match',
    title: 'Financial Terms Memory Match',
    emoji: '🃏',
    description: 'Flip cards to match financial terms with their definitions.',
    color: 'from-cyan-600 to-cyan-800',
    component: MemoryCardMatch,
    topic: 'Financial Terms',
  },
  {
    id: 'budget-allocator',
    title: 'Budget Planner',
    emoji: '📊',
    description: 'Allocate a salary and see how your budget compares to expert advice.',
    color: 'from-gold-600 to-gold-800',
    component: BudgetAllocator,
    topic: 'Budgeting',
  },
];

// All available game types shown on the main hub
const ALL_GAME_TYPES = [
  {
    id: 'needs-wants-catcher',
    title: 'Needs vs Wants Catcher',
    emoji: '🎯',
    description: 'Items fall from the sky. Sort them into NEED or WANT buckets. 45 seconds. How many can you get right?',
    color: 'from-violet-600 to-violet-800',
    component: NeedsWantsCatcher,
    topic: 'Coin Valley',
    xp: 50,
  },
  {
    id: 'memory-match',
    title: 'Financial Memory Match',
    emoji: '🃏',
    description: 'Flip pairs of cards to match financial terms to their definitions. Race against time!',
    color: 'from-cyan-600 to-cyan-800',
    component: MemoryCardMatch,
    topic: 'All Worlds',
    xp: 60,
  },
  {
    id: 'income-sorter',
    title: 'Income Type Sorter',
    emoji: '💼',
    description: 'Earned or passive? Sort 10 income sources and learn the key difference.',
    color: 'from-emerald-600 to-emerald-800',
    component: IncomeSorter,
    topic: 'Coin Valley',
    xp: 55,
  },
  {
    id: 'budget-allocator',
    title: 'Budget Planner Challenge',
    emoji: '📊',
    description: 'Allocate a fictional salary across categories. Get as close to expert recommendations as possible.',
    color: 'from-gold-600 to-gold-800',
    component: BudgetAllocator,
    topic: 'Budget City',
    xp: 70,
  },
];

export default function PlatformerPage() {
  const { level: worldParam } = useParams();
  const navigate = useNavigate();

  // Determine which world's games to show
  const worldSlug   = worldParam || null;
  const worldGames  = worldSlug ? (WORLD_GAMES[worldSlug] || DEFAULT_GAMES) : ALL_GAME_TYPES;

  const [activeGame,   setActiveGame]   = useState(null);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [scores,       setScores]       = useState({});

  const handleGameEnd = (gameId, score) => {
    setCompletedIds((s) => new Set([...s, gameId]));
    setScores((s) => ({ ...s, [gameId]: Math.max(s[gameId] || 0, score) }));
    setActiveGame(null);
  };

  const ActiveComponent = activeGame?.component;

  return (
    <AppLayout>
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => activeGame ? setActiveGame(null) : navigate('/worlds')} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-0.5">
              <Gamepad2 className="w-4 h-4" />
              <span>{activeGame ? activeGame.title : 'Mini Games Hub'}</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              {activeGame ? activeGame.topic : worldSlug ? `${worldSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} Games` : 'Financial Mini Games'}
            </h1>
          </div>
        </div>

        {/* Active game or game selection */}
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div
              key={activeGame.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6"
            >
              {/* Game header */}
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r ${activeGame.color} bg-opacity-20`}>
                <span className="text-3xl">{activeGame.emoji}</span>
                <div>
                  <div className="font-display font-bold text-white">{activeGame.title}</div>
                  <div className="text-white/60 text-xs">{activeGame.description}</div>
                </div>
              </div>

              {/* Game component */}
              <ActiveComponent
                worldSlug={worldSlug}
                onGameEnd={(score) => handleGameEnd(activeGame.id, score)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="font-display font-bold text-white text-lg">{worldGames.length}</div>
                  <div className="text-slate-500 text-xs">Games Available</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-display font-bold text-white text-lg">{completedIds.size}</div>
                  <div className="text-slate-500 text-xs">Completed</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-display font-bold text-white text-lg">{Object.values(scores).reduce((s,v)=>s+v,0)}</div>
                  <div className="text-slate-500 text-xs">Total Score</div>
                </div>
              </div>

              {/* Game cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {worldGames.map((game, i) => {
                  const isCompleted = completedIds.has(game.id);
                  const bestScore   = scores[game.id];
                  return (
                    <motion.div
                      key={`${game.id}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => setActiveGame(game)}
                      className={`relative glass-card p-5 cursor-pointer border transition-all duration-300 hover:scale-[1.02] ${isCompleted ? 'border-emerald-500/30' : 'border-white/10 hover:border-violet-500/40'}`}
                    >
                      {isCompleted && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <span className="text-emerald-400 text-xs">✓</span>
                        </div>
                      )}

                      {/* Gradient banner */}
                      <div className={`w-full h-2 rounded-full bg-gradient-to-r ${game.color} mb-4 opacity-80`} />

                      <div className="flex items-start gap-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                          {game.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-white mb-1">{game.title}</h3>
                          <p className="text-slate-400 text-xs leading-relaxed">{game.description}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge-violet text-xs">{game.topic}</span>
                          {game.xp && (
                            <span className="flex items-center gap-1 text-gold-400 text-xs">
                              <Zap className="w-3 h-3" />{game.xp} XP
                            </span>
                          )}
                        </div>
                        {bestScore !== undefined ? (
                          <span className="text-emerald-400 text-xs font-semibold">Best: {bestScore}</span>
                        ) : (
                          <span className="text-violet-400 text-xs font-semibold">Play →</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 glass-card p-4 border border-gold-500/20">
                <p className="text-sm text-slate-300">
                  <span className="text-gold-400 font-semibold">💡 How these games help: </span>
                  Each mini-game is designed to teach a specific financial concept through gameplay rather than text. Sort items, match terms, allocate budgets — all real financial skills.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
