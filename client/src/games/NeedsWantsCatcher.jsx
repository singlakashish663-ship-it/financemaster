import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { RotateCcw, Heart, Clock, CheckCircle, XCircle } from 'lucide-react';

const FALLING_ITEMS = [
  { id: 1,  label: 'Rice & Dal',      category: 'need',  emoji: '🍚', color: '#7c3aed' },
  { id: 2,  label: 'Medicine',        category: 'need',  emoji: '💊', color: '#7c3aed' },
  { id: 3,  label: 'Rent',            category: 'need',  emoji: '🏠', color: '#7c3aed' },
  { id: 4,  label: 'Water Bill',      category: 'need',  emoji: '💧', color: '#7c3aed' },
  { id: 5,  label: 'Bus Pass',        category: 'need',  emoji: '🚌', color: '#7c3aed' },
  { id: 6,  label: 'Electricity',     category: 'need',  emoji: '�', color: '#7c3aed' },
  { id: 7,  label: 'School Fees',     category: 'need',  emoji: '📚', color: '#7c3aed' },
  { id: 8,  label: 'Vegetables',      category: 'need',  emoji: '🥗', color: '#7c3aed' },
  { id: 9,  label: 'New iPhone',      category: 'want',  emoji: '📱', color: '#0891b2' },
  { id: 10, label: 'PlayStation 5',   category: 'want',  emoji: '�', color: '#0891b2' },
  { id: 11, label: 'Nike Shoes',      category: 'want',  emoji: '�', color: '#0891b2' },
  { id: 12, label: 'Netflix',         category: 'want',  emoji: '🎬', color: '#0891b2' },
  { id: 13, label: 'Pizza',           category: 'want',  emoji: '�', color: '#0891b2' },
  { id: 14, label: 'Designer Bag',    category: 'want',  emoji: '�', color: '#0891b2' },
  { id: 15, label: 'Theme Park',      category: 'want',  emoji: '🎡', color: '#0891b2' },
  { id: 16, label: 'Gaming Chair',    category: 'want',  emoji: '�', color: '#0891b2' },
];

const GAME_DURATION = 60;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function NeedsWantsCatcher({ onGameEnd }) {
  const [queue,       setQueue]       = useState(() => shuffle(FALLING_ITEMS));
  const [current,     setCurrent]     = useState(null);
  const [score,       setScore]       = useState(0);
  const [lives,       setLives]       = useState(3);
  const [timeLeft,    setTimeLeft]    = useState(GAME_DURATION);
  const [phase,       setPhase]       = useState('playing');
  const [feedback,    setFeedback]    = useState(null);
  const [history,     setHistory]     = useState([]);
  const [dragOver,    setDragOver]    = useState(null); // 'need' | 'want' | null
  const [itemPos,     setItemPos]     = useState({ x: 0, y: 0 });
  const [isDragging,  setIsDragging]  = useState(false);

  // Spawn next item
  const spawnNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) {
        setPhase('result');
        return prev;
      }
      const shuffled = prev.length <= 3 ? shuffle([...FALLING_ITEMS]) : prev;
      const next = shuffled[0];
      setCurrent({ ...next, uid: Date.now() });
      return shuffled.slice(1);
    });
  }, []);

  useEffect(() => {
    spawnNext();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('result'); return; }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  // Lives check
  useEffect(() => {
    if (lives <= 0) setPhase('result');
  }, [lives]);

  const handleDrop = useCallback((bucket) => {
    if (!current || phase !== 'playing') return;
    const correct = current.category === bucket;
    if (correct) {
      setScore((s) => s + 10);
      setFeedback({ correct: true, text: `✓ Correct! "${current.label}" is a ${bucket.toUpperCase()}.`, emoji: current.emoji });
    } else {
      setLives((l) => l - 1);
      setFeedback({ correct: false, text: `✗ "${current.label}" is a ${current.category.toUpperCase()}, not a ${bucket.toUpperCase()}.`, emoji: current.emoji });
    }
    setHistory((h) => [...h, { ...current, correct, bucket }]);
    setIsDragging(false);
    setDragOver(null);
    setCurrent(null);
    setTimeout(() => {
      setFeedback(null);
      spawnNext();
    }, 1200);
  }, [current, phase, spawnNext]);

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(null);
  };
  const handleDragOver = (e, bucket) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(bucket);
  };
  const handleDragLeave = () => setDragOver(null);
  const handleDropZone = (e, bucket) => {
    e.preventDefault();
    handleDrop(bucket);
  };

  // Touch drag support
  const touchItem = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchItem.current = current;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const zone = el.closest('[data-dropzone]');
      setDragOver(zone ? zone.dataset.dropzone : null);
    }
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = el?.closest('[data-dropzone]');
    if (zone) {
      handleDrop(zone.dataset.dropzone);
    } else {
      setIsDragging(false);
      setDragOver(null);
    }
  };

  if (phase === 'result') {
    const correct = history.filter((h) => h.correct).length;
    const pct = history.length > 0 ? Math.round((correct / history.length) * 100) : 0;
    return (
      <div className="text-center py-4">
        <div className="text-6xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '😊' : '💪'}</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Game Over!</h2>
        <div className="grid grid-cols-3 gap-3 mb-4 max-w-xs mx-auto">
          <div className="glass-card p-3 text-center"><div className="font-display font-bold text-xl text-gold-400">{score}</div><div className="text-slate-500 text-xs">Score</div></div>
          <div className="glass-card p-3 text-center"><div className="font-display font-bold text-xl text-emerald-400">{correct}/{history.length}</div><div className="text-slate-500 text-xs">Correct</div></div>
          <div className="glass-card p-3 text-center"><div className="font-display font-bold text-xl text-violet-400">{pct}%</div><div className="text-slate-500 text-xs">Accuracy</div></div>
        </div>

        {/* Wrong answers review */}
        {history.filter((h) => !h.correct).length > 0 && (
          <div className="glass-card p-4 mb-4 text-left max-w-sm mx-auto">
            <div className="text-coral-400 font-semibold text-sm mb-2">Review your mistakes:</div>
            {history.filter((h) => !h.correct).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                <span>{h.emoji}</span>
                <span className="font-medium">{h.label}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400 font-semibold">{h.category.toUpperCase()}</span>
                <span className="text-slate-500">(you said {h.bucket.toUpperCase()})</span>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card p-3 mb-4 text-left max-w-sm mx-auto">
          <p className="text-xs text-slate-300">
            <span className="text-gold-400 font-semibold">💡 Key rule: </span>
            NEEDS are essentials for survival — food, medicine, shelter, utilities, transport to work.
            WANTS improve your life but you can live without them.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => {
            setQueue(shuffle(FALLING_ITEMS)); setScore(0); setLives(3);
            setTimeLeft(GAME_DURATION); setHistory([]); setFeedback(null);
            setPhase('playing'); setCurrent(null);
            setTimeout(spawnNext, 100);
          }} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Play Again</button>
          {onGameEnd && <button onClick={() => onGameEnd(score)} className="btn-primary">Continue →</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_,i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-coral-400 fill-coral-400' : 'text-slate-700'}`} />
          ))}
        </div>
        <div className="font-game font-bold text-gold-400">{score} pts</div>
        <div className={`flex items-center gap-1 font-game font-bold ${timeLeft <= 10 ? 'text-coral-400 animate-pulse' : 'text-cyan-400'}`}>
          <Clock className="w-4 h-4" />{timeLeft}s
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-slate-400 mb-4">
        Drag the item into the correct bucket 👇
      </div>

      {/* Current draggable item */}
      <div className="flex justify-center mb-6" style={{ minHeight: 100 }}>
        <AnimatePresence mode="wait">
          {current && !feedback && (
            <motion.div
              key={current.uid}
              initial={{ opacity: 0, scale: 0.5, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'shadow-glow-md scale-110 opacity-90' : 'hover:scale-105'}`}
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)',
                borderColor: isDragging ? '#a78bfa' : 'rgba(139,92,246,0.4)',
                touchAction: 'none',
              }}
            >
              <div className="text-5xl">{current.emoji}</div>
              <div className="text-white font-bold text-base">{current.label}</div>
              <div className="text-slate-400 text-xs">← drag to sort →</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 ${feedback.correct ? 'border-emerald-500/60 bg-emerald-500/15' : 'border-coral-500/60 bg-coral-500/15'}`}
            >
              <div className="text-3xl">{feedback.emoji}</div>
              {feedback.correct
                ? <CheckCircle className="w-8 h-8 text-emerald-400" />
                : <XCircle    className="w-8 h-8 text-coral-400" />
              }
              <div className={`text-sm font-semibold text-center ${feedback.correct ? 'text-emerald-300' : 'text-coral-300'}`}>
                {feedback.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-4">
        {/* NEED drop zone */}
        <div
          data-dropzone="need"
          onDragOver={(e) => handleDragOver(e, 'need')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropZone(e, 'need')}
          onClick={() => !isDragging && current && !feedback && handleDrop('need')}
          className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            dragOver === 'need'
              ? 'border-violet-400 bg-violet-500/30 scale-105 shadow-glow-sm'
              : 'border-violet-500/40 bg-violet-500/10 hover:border-violet-400 hover:bg-violet-500/20'
          }`}
          style={{ minHeight: 120 }}
        >
          <div className="text-4xl">🏠</div>
          <div className="font-display font-bold text-violet-300 text-lg">NEED</div>
          <div className="text-violet-400/70 text-xs text-center">Essentials for survival</div>
          {dragOver === 'need' && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute inset-0 rounded-2xl border-2 border-violet-400 bg-violet-400/10"
            />
          )}
        </div>

        {/* WANT drop zone */}
        <div
          data-dropzone="want"
          onDragOver={(e) => handleDragOver(e, 'want')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropZone(e, 'want')}
          onClick={() => !isDragging && current && !feedback && handleDrop('want')}
          className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            dragOver === 'want'
              ? 'border-cyan-400 bg-cyan-500/30 scale-105 shadow-glow-cyan'
              : 'border-cyan-500/40 bg-cyan-500/10 hover:border-cyan-400 hover:bg-cyan-500/20'
          }`}
          style={{ minHeight: 120 }}
        >
          <div className="text-4xl">💎</div>
          <div className="font-display font-bold text-cyan-300 text-lg">WANT</div>
          <div className="text-cyan-400/70 text-xs text-center">Nice to have, not essential</div>
          {dragOver === 'want' && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute inset-0 rounded-2xl border-2 border-cyan-400 bg-cyan-400/10"
            />
          )}
        </div>
      </div>

      {/* Tap hint for mobile */}
      <div className="mt-3 text-center text-xs text-slate-600">
        Desktop: drag the card · Mobile: tap a bucket to sort
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span>Sorted: {history.length}</span>
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(history.length / FALLING_ITEMS.length) * 100}%` }} />
        </div>
        <span>{FALLING_ITEMS.length} items</span>
      </div>
    </div>
  );
}
