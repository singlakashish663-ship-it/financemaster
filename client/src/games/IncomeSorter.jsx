import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const INCOME_ITEMS = [
  { id: 1,  label: '💼 Monthly Salary',    category: 'earned',   emoji: '💼', hint: 'You work 9-5 every day for this' },
  { id: 2,  label: '🏘️ Rental Income',    category: 'passive',  emoji: '🏘️', hint: 'Money comes in while you sleep' },
  { id: 3,  label: '💻 Freelance Project', category: 'earned',   emoji: '💻', hint: 'You actively work on each project' },
  { id: 4,  label: '📈 Dividend Income',   category: 'passive',  emoji: '📈', hint: 'Companies pay you for owning shares' },
  { id: 5,  label: '🛒 Part-time Job',     category: 'earned',   emoji: '🛒', hint: 'You exchange time for money' },
  { id: 6,  label: '📚 Royalties',         category: 'passive',  emoji: '📚', hint: 'Earn from a book you wrote once' },
  { id: 7,  label: '🎓 Tuition Teaching',  category: 'earned',   emoji: '🎓', hint: 'You actively teach each session' },
  { id: 8,  label: '🏦 Bank Interest',     category: 'passive',  emoji: '🏦', hint: 'Your savings earn this automatically' },
  { id: 9,  label: '🚗 Driving Uber',      category: 'earned',   emoji: '🚗', hint: 'You drive — you earn' },
  { id: 10, label: '💰 Stock Dividends',   category: 'passive',  emoji: '💰', hint: 'Paid quarterly for your investment' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function IncomeSorter({ onGameEnd }) {
  const [items,    setItems]    = useState(() => shuffle(INCOME_ITEMS));
  const [sorted,   setSorted]   = useState({ earned: [], passive: [] });
  const [feedback, setFeedback] = useState(null);
  const [score,    setScore]    = useState(0);
  const [phase,    setPhase]    = useState('playing'); // playing | result

  const currentItem = items[0] || null;

  const handleSort = (category) => {
    if (!currentItem) return;
    const correct = currentItem.category === category;
    if (correct) {
      setScore((s) => s + 15);
      setFeedback({ correct: true, text: `✓ Correct! ${currentItem.label} is ${category} income.` });
      setSorted((s) => ({ ...s, [category]: [...s[category], currentItem] }));
    } else {
      setFeedback({ correct: false, text: `✗ Actually, ${currentItem.label} is ${currentItem.category} income. ${currentItem.hint}` });
      setSorted((s) => ({ ...s, [currentItem.category]: [...s[currentItem.category], { ...currentItem, wrong: true }] }));
    }
    setTimeout(() => {
      setFeedback(null);
      setItems((prev) => {
        const next = prev.slice(1);
        if (next.length === 0) setPhase('result');
        return next;
      });
    }, 1500);
  };

  const restart = () => {
    setItems(shuffle(INCOME_ITEMS));
    setSorted({ earned: [], passive: [] });
    setFeedback(null);
    setScore(0);
    setPhase('playing');
  };

  if (phase === 'result') {
    const total   = INCOME_ITEMS.length;
    const correct = sorted.earned.filter((i) => !i.wrong).length + sorted.passive.filter((i) => !i.wrong).length;
    return (
      <div className="text-center py-4">
        <div className="text-6xl mb-4">{score >= 100 ? '🏆' : score >= 60 ? '😊' : '📚'}</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Sorted!</h2>
        <div className="grid grid-cols-2 gap-4 mb-4 max-w-xs mx-auto">
          <div className="glass-card p-4"><div className="font-display font-bold text-xl text-gold-400">{score}</div><div className="text-slate-500 text-xs">Score</div></div>
          <div className="glass-card p-4"><div className="font-display font-bold text-xl text-emerald-400">{correct}/{total}</div><div className="text-slate-500 text-xs">Correct</div></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4 text-left">
          <div className="glass-card p-3">
            <div className="text-violet-400 font-semibold text-sm mb-2">💼 Earned Income</div>
            {sorted.earned.map((i) => <div key={i.id} className={`text-xs mb-1 ${i.wrong ? 'text-coral-400' : 'text-emerald-400'}`}>{i.wrong ? '✗' : '✓'} {i.label}</div>)}
          </div>
          <div className="glass-card p-3">
            <div className="text-cyan-400 font-semibold text-sm mb-2">🏦 Passive Income</div>
            {sorted.passive.map((i) => <div key={i.id} className={`text-xs mb-1 ${i.wrong ? 'text-coral-400' : 'text-emerald-400'}`}>{i.wrong ? '✗' : '✓'} {i.label}</div>)}
          </div>
        </div>
        <div className="glass-card p-3 mb-4 text-left">
          <p className="text-xs text-slate-300">
            <span className="text-gold-400 font-semibold">💡 Key difference: </span>
            Earned income requires your active time and effort. Passive income continues even when you're not actively working — but usually requires upfront capital or effort to set up.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Play Again</button>
          {onGameEnd && <button onClick={() => onGameEnd(score)} className="btn-primary">Done</button>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-sm">{INCOME_ITEMS.length - items.length}/{INCOME_ITEMS.length} sorted</div>
        <div className="font-game text-gold-400 font-bold">{score} pts</div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${((INCOME_ITEMS.length - items.length) / INCOME_ITEMS.length) * 100}%` }} />
      </div>

      {/* Current card to sort */}
      <AnimatePresence mode="wait">
        {currentItem && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="glass-card border border-white/20 p-6 text-center mb-4"
          >
            <div className="text-5xl mb-3">{currentItem.emoji}</div>
            <div className="font-display font-bold text-xl text-white mb-2">{currentItem.label}</div>
            <div className="text-slate-400 text-sm">{currentItem.hint}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl mb-3 flex items-start gap-2 text-sm ${feedback.correct ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-coral-500/15 border border-coral-500/30 text-coral-300'}`}
          >
            {feedback.correct ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSort('earned')}
          disabled={!!feedback || !currentItem}
          className="p-4 rounded-2xl border-2 border-violet-500/40 bg-violet-600/20 hover:bg-violet-600/30 transition-all text-center disabled:opacity-40"
        >
          <div className="text-2xl mb-1">💼</div>
          <div className="font-bold text-violet-300">Earned Income</div>
          <div className="text-xs text-violet-400/70 mt-0.5">Requires active effort</div>
        </button>
        <button
          onClick={() => handleSort('passive')}
          disabled={!!feedback || !currentItem}
          className="p-4 rounded-2xl border-2 border-cyan-500/40 bg-cyan-600/20 hover:bg-cyan-600/30 transition-all text-center disabled:opacity-40"
        >
          <div className="text-2xl mb-1">🏦</div>
          <div className="font-bold text-cyan-300">Passive Income</div>
          <div className="text-xs text-cyan-400/70 mt-0.5">Earns without active work</div>
        </button>
      </div>
    </div>
  );
}
