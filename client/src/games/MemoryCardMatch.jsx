import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Clock, Star } from 'lucide-react';

const CARD_SETS = {
  'coin-valley': [
    { term: '💰 Income',         match: 'Money you earn' },
    { term: '🏠 Need',           match: 'Essential for survival' },
    { term: '🛍️ Want',          match: 'Nice to have, not essential' },
    { term: '🎯 Opportunity Cost', match: 'Value of what you give up' },
    { term: '📈 Compound Interest', match: 'Interest earned on interest' },
    { term: '💳 Expense',        match: 'Money you spend' },
  ],
  'budget-city': [
    { term: '📊 Budget',         match: 'Plan for income & spending' },
    { term: '🔒 Fixed Expense',  match: 'Same amount every month' },
    { term: '🔄 Variable Expense',match: 'Changes each month' },
    { term: '💸 Cash Flow',      match: 'Income minus expenses' },
    { term: '📱 Subscription',   match: 'Recurring monthly charge' },
    { term: '💰 Savings',        match: 'Money set aside for future' },
  ],
  'savings-forest': [
    { term: '🏦 Emergency Fund', match: '3-6 months of expenses saved' },
    { term: '📈 Interest Rate',  match: 'Cost of borrowing money (%)' },
    { term: '📉 Inflation',      match: 'Rise in prices over time' },
    { term: '🌱 SIP',           match: 'Systematic Investment Plan' },
    { term: '💹 Returns',        match: 'Profit from an investment' },
    { term: '🎯 Financial Goal', match: 'A specific savings target' },
  ],
  'investor-island': [
    { term: '📈 Stock',          match: 'Ownership share in a company' },
    { term: '🏛️ NSE',           match: 'National Stock Exchange India' },
    { term: '🎯 Diversification',match: 'Spread risk across assets' },
    { term: '⚖️ Risk',           match: 'Chance of losing money' },
    { term: '📊 Mutual Fund',    match: 'Pooled investment vehicle' },
    { term: '🔮 IPO',           match: 'First public sale of shares' },
  ],
  default: [
    { term: '💰 Asset',          match: 'Something of value you own' },
    { term: '💳 Liability',      match: 'Something you owe' },
    { term: '📊 Net Worth',      match: 'Assets minus liabilities' },
    { term: '🏦 Interest',       match: 'Cost of borrowing or reward for saving' },
    { term: '💸 Tax',            match: 'Compulsory payment to government' },
    { term: '📈 Dividend',       match: 'Share of company profits paid to shareholders' },
  ],
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryCardMatch({ worldSlug, onGameEnd }) {
  const cardSet = CARD_SETS[worldSlug] || CARD_SETS.default;

  const buildCards = useCallback(() => {
    const pairs = shuffle(cardSet).slice(0, 6);
    const cards = shuffle([
      ...pairs.map((p, i) => ({ id: `t${i}`, text: p.term,  pairId: i, type: 'term'  })),
      ...pairs.map((p, i) => ({ id: `m${i}`, text: p.match, pairId: i, type: 'match' })),
    ]);
    return cards.map((c) => ({ ...c, flipped: false, matched: false }));
  }, [cardSet]);

  const [cards,      setCards]      = useState(() => buildCards());
  const [selected,   setSelected]   = useState([]);
  const [moves,      setMoves]      = useState(0);
  const [matches,    setMatches]    = useState(0);
  const [phase,      setPhase]      = useState('playing'); // playing | checking | won
  const [wrongPair,  setWrongPair]  = useState([]);
  const [time,       setTime]       = useState(0);
  const totalPairs = 6;

  // Timer
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'checking') return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleCardClick = useCallback((card) => {
    if (phase === 'checking') return;
    if (card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0].id === card.id) return;

    const newSelected = [...selected, card];
    setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, flipped: true } : c));

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setPhase('checking');
      const [a, b] = newSelected;
      if (a.pairId === b.pairId && a.type !== b.type) {
        // Match!
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.pairId === a.pairId ? { ...c, matched: true } : c
          ));
          setMatches((m) => {
            if (m + 1 === totalPairs) setPhase('won');
            else setPhase('playing');
            return m + 1;
          });
          setSelected([]);
        }, 600);
      } else {
        // No match — flip back
        setWrongPair([a.id, b.id]);
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setWrongPair([]);
          setPhase('playing');
        }, 1000);
      }
      if (newSelected.length < 2) setSelected(newSelected);
      else setSelected([]);
    } else {
      setSelected(newSelected);
    }
  }, [phase, selected, totalPairs]);

  const restart = () => {
    setCards(buildCards());
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setPhase('playing');
    setWrongPair([]);
    setTime(0);
  };

  const scoreCalc = () => {
    const base   = totalPairs * 100;
    const penalty = moves * 5;
    const timeBonus = Math.max(0, 120 - time) * 2;
    return Math.max(0, base - penalty + timeBonus);
  };

  if (phase === 'won') {
    const score = scoreCalc();
    return (
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">All Pairs Matched!</h2>
        <div className="grid grid-cols-3 gap-4 mb-6 max-w-sm mx-auto">
          <div className="glass-card p-4"><div className="font-display font-bold text-xl text-gold-400">{score}</div><div className="text-slate-500 text-xs">Score</div></div>
          <div className="glass-card p-4"><div className="font-display font-bold text-xl text-cyan-400">{moves}</div><div className="text-slate-500 text-xs">Moves</div></div>
          <div className="glass-card p-4"><div className="font-display font-bold text-xl text-violet-400">{time}s</div><div className="text-slate-500 text-xs">Time</div></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Play Again</button>
          {onGameEnd && <button onClick={() => onGameEnd(score)} className="btn-primary">Next Game</button>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HUD */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Star className="w-4 h-4 text-gold-400" />
          <span>{matches}/{totalPairs} matched</span>
        </div>
        <div className="font-game text-violet-400 text-sm">{moves} moves</div>
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{time}s</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isWrong   = wrongPair.includes(card.id);
          const isFlipped = card.flipped || card.matched;
          return (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="cursor-pointer"
              style={{ perspective: 600 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', height: 80 }}
              >
                {/* Back */}
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)',
                    border: '2px solid rgba(139,92,246,0.3)',
                  }}>
                  <span className="text-2xl">❓</span>
                </div>
                {/* Front */}
                <div className="absolute inset-0 rounded-xl flex items-center justify-center p-2 text-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.matched
                      ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                      : isWrong
                      ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                      : card.type === 'term'
                      ? 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)'
                      : 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                    border: card.matched ? '2px solid #10b981' : isWrong ? '2px solid #f43f5e' : '2px solid rgba(255,255,255,0.2)',
                  }}>
                  <span className="text-xs text-white font-medium leading-tight">{card.text}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 text-center text-xs text-slate-500">
        Click cards to flip them. Match each term with its correct definition.
        <span className="text-violet-400 ml-1">Purple = term</span> · <span className="text-cyan-400">Blue = definition</span>
      </div>
    </div>
  );
}
