import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play, Zap, Clock, ArrowRight, Map, X, BookOpen } from 'lucide-react';
import { WORLDS } from '../data/worlds';
import AppLayout from '../components/layout/AppLayout';
import { getWorlds } from '../services/api';

// Static mission previews for each world (used as fallback if backend not available)
const MISSION_PREVIEWS = {
  'coin-valley': [
    { title: 'What Is Money?', desc: 'Discover what money is and how it works as a medium of exchange.', xp: 50 },
    { title: 'Needs vs Wants', desc: 'Learn to distinguish between financial needs and wants.', xp: 60 },
    { title: 'Income Types', desc: 'Understand different types of income and why diversity matters.', xp: 50 },
    { title: 'Opportunity Cost', desc: 'Every financial choice means giving up something else.', xp: 70 },
    { title: 'SMART Financial Goals', desc: 'Set goals that are Specific, Measurable, Achievable, Relevant, Time-bound.', xp: 60 },
  ],
  'budget-city': [
    { title: 'Your First Budget', desc: 'Build your first monthly budget using the 50/30/20 rule.', xp: 70 },
    { title: 'Fixed vs Variable Expenses', desc: 'Understand constant vs fluctuating expenses.', xp: 60 },
    { title: 'Tracking Cash Flow', desc: 'Track income vs outflow and understand your cash flow.', xp: 80 },
  ],
  'savings-forest': [
    { title: 'Why Save?', desc: 'Discover the magic of saving for the future.', xp: 60 },
    { title: 'Emergency Fund', desc: 'Why 3-6 months of expenses should be saved.', xp: 70 },
    { title: 'Compound Interest Magic', desc: 'See how small amounts grow exponentially.', xp: 80 },
  ],
  'credit-canyon': [
    { title: 'What is Credit Score?', desc: 'Understand how credit scores work.', xp: 60 },
    { title: 'Credit Cards 101', desc: 'How credit cards work and their risks.', xp: 70 },
    { title: 'EMI Calculator', desc: 'Calculate loan repayments.', xp: 80 },
  ],
  'investor-island': [
    { title: 'What is Investing?', desc: 'Learn the fundamentals of growing wealth.', xp: 70 },
    { title: 'Risk vs Return', desc: 'Understand the trade-off between risk and reward.', xp: 80 },
    { title: 'Diversification', desc: 'Why not putting all eggs in one basket matters.', xp: 75 },
  ],
  'stock-market-city': [
    { title: 'Stock Exchange 101', desc: 'Learn NSE, BSE and how exchanges work.', xp: 80 },
    { title: 'Candlestick Charts', desc: 'Read OHLC candlestick patterns.', xp: 90 },
    { title: 'Order Types', desc: 'Market, limit, and stop-loss orders explained.', xp: 70 },
  ],
  'salary-kingdom': [
    { title: 'Understanding Your Payslip', desc: 'Every line item on a salary slip explained.', xp: 60 },
    { title: 'Income Tax Basics', desc: 'Indian tax fundamentals for beginners.', xp: 70 },
  ],
  'protection-peaks': [
    { title: 'Why Insurance?', desc: 'Understand the purpose of insurance.', xp: 60 },
    { title: 'Term Life Insurance', desc: 'The simplest and cheapest life insurance.', xp: 70 },
  ],
  'entrepreneur-island': [
    { title: 'Idea to Revenue', desc: 'Turn a business idea into actual income.', xp: 70 },
    { title: 'Profit & Loss', desc: 'Understand P&L statements for a small business.', xp: 80 },
  ],
  'future-galaxy': [
    { title: 'The Power of Compounding', desc: 'How time is your greatest ally.', xp: 80 },
    { title: 'Retirement Planning', desc: 'Plan for financial independence.', xp: 90 },
  ],
};

export default function WorldMapPage() {
  const [loading,        setLoading]        = useState(true);
  const [selectedWorld,   setSelectedWorld]   = useState(null);
  const [serverMissions,  setServerMissions]  = useState({});

  useEffect(() => {
    getWorlds()
      .then((res) => {
        const worlds = res.worlds || [];
        // Fetch missions for each world from the new endpoint
        return Promise.all(
          worlds.map((w) =>
            fetch(`/api/v1/worlds/${w.slug}/missions`)
              .then((r) => r.json())
              .then((d) => ({ slug: w.slug, missions: d.missions || [] }))
              .catch(() => ({ slug: w.slug, missions: [] }))
          )
        );
      })
      .then((results) => {
        const map = {};
        results.forEach(({ slug, missions }) => { map[slug] = missions; });
        setServerMissions(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleWorldClick = (world) => {
    setSelectedWorld(world);
  };

  const getMissions = (world) => {
    // Use server missions if available, otherwise static previews
    const server = serverMissions[world.slug];
    if (server && server.length > 0) {
      return server.map((m, i) => ({
        _id: m._id,
        title: m.title,
        desc: m.description,
        xp: m.xpReward,
        order: m.order || i + 1,
      }));
    }
    // Fallback to static
    const staticMissions = MISSION_PREVIEWS[world.slug] || [];
    return staticMissions.map((m, i) => ({
      _id: null,
      title: m.title,
      desc: m.desc,
      xp: m.xp,
      order: i + 1,
    }));
  };

  return (
    <AppLayout>
      <div className="section-container py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Map className="w-4 h-4" /><span>Adventure Map</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Financial Adventure Worlds</h1>
          <p className="text-slate-400">10 worlds, 50+ missions. Click a world to see its missions.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="font-display font-bold text-white text-lg">10</div>
            <div className="text-slate-500 text-xs">Worlds</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-display font-bold text-white text-lg">50+</div>
            <div className="text-slate-500 text-xs">Missions</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-display font-bold text-white text-lg">9,200</div>
            <div className="text-slate-500 text-xs">Total XP</div>
          </div>
        </div>

        {/* Worlds grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORLDS.map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleWorldClick(world)}
                className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:shadow-card-hover cursor-pointer group"
                style={{ background: world.gradient }}
              >
                <div className="p-5">
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center text-3xl">
                        {world.emoji}
                      </div>
                      <div>
                        <div className="text-white/50 text-xs font-game">WORLD {world.order}</div>
                        <h3 className="font-display font-bold text-white text-base">{world.name}</h3>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/40 transition-all">
                      <Play className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-xs mb-3 line-clamp-2">{world.description}</p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(world.topics || []).slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-black/20 text-white/50 text-xs">{t}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <Zap className="w-3 h-3" />{world.xpReward} XP
                    </div>
                    <div className="flex items-center gap-1 text-violet-300 text-xs font-semibold">
                      {(MISSION_PREVIEWS[world.slug] || []).length || 5} missions
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mission Modal */}
      <AnimatePresence>
        {selectedWorld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,4,26,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedWorld(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card border border-white/20 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              style={{ background: selectedWorld.gradient }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center text-3xl">
                    {selectedWorld.emoji}
                  </div>
                  <div>
                    <div className="text-white/50 text-xs font-game">WORLD {selectedWorld.order}</div>
                    <h2 className="font-display font-bold text-white text-xl">{selectedWorld.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorld(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-white/70 text-sm mb-4">{selectedWorld.description}</p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {(selectedWorld.topics || []).map((t) => (
                  <span key={t} className="px-2 py-1 rounded-md bg-black/30 text-white/60 text-xs">{t}</span>
                ))}
              </div>

              {/* Missions */}
              <div className="space-y-2">
                <h3 className="text-white/80 text-sm font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Missions
                </h3>
                {getMissions(selectedWorld).map((mission, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/10 hover:border-violet-500/40 hover:bg-black/30 transition-all cursor-pointer"
                    onClick={() => {
                      // Navigate to mission page using order number
                      if (mission._id) {
                        window.location.href = `/worlds/${selectedWorld.slug}/missions/${mission._id}`;
                      } else {
                        window.location.href = `/worlds/${selectedWorld.slug}/missions/${mission.order}`;
                      }
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs font-game text-violet-300 flex-shrink-0">
                      {mission.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{mission.title}</div>
                      <div className="text-white/50 text-xs truncate">{mission.desc}</div>
                    </div>
                    <div className="flex items-center gap-1 text-gold-400 text-xs flex-shrink-0">
                      <Zap className="w-3 h-3" />{mission.xp}
                    </div>
                    <Play className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Zap className="w-3 h-3 text-gold-400" />{selectedWorld.xpReward} XP on completion
                </div>
                {selectedWorld.slug === 'stock-market-city' && (
                  <Link
                    to="/stock-academy"
                    onClick={() => setSelectedWorld(null)}
                    className="flex items-center gap-1 text-cyan-300 text-xs font-semibold hover:text-cyan-200"
                  >
                    Go to Stock Academy <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
