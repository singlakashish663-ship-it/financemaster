import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading your adventure...' }) {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50">
      {/* Animated Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative mb-8"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl scale-150 animate-pulse-glow" />

        {/* Logo mark */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-lg">
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
            <path d="M8 32L20 8L32 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 24H28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="20" cy="8" r="3" fill="#fbbf24"/>
          </svg>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="font-display font-bold text-2xl text-white mb-1">FinanceQuest</h1>
        <p className="text-slate-500 text-sm">{message}</p>
      </motion.div>

      {/* Progress dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
