import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-gradient opacity-40" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
        <div className="font-game font-bold text-8xl sm:text-9xl text-violet-500/20 mb-4 leading-none">404</div>
        <div className="text-6xl mb-6">🗺️</div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Lost in the Adventure?</h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">This page doesn't exist on the adventure map. Head back to start your financial journey.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"          className="btn-secondary text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <Link to="/dashboard" className="btn-primary  text-sm"><Home       className="w-4 h-4" /> Dashboard</Link>
        </div>
      </motion.div>
    </div>
  );
}
