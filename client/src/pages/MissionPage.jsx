import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  Lightbulb, Zap, Star, Shield, BookOpen
} from 'lucide-react';
import { getMission, startMission, completeMission } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';

// Static mission content fallback (when backend doesn't have the mission)
const STATIC_MISSIONS = {
  'coin-valley': {
    1: {
      title: 'What Is Money?',
      xpReward: 50,
      content: {
        sections: [
          { title: 'Before money existed', body: 'Imagine trying to trade a banana for shoes. This is the barter system — trading goods directly. It worked poorly because of the "double coincidence of wants" problem: both parties had to want exactly what the other had.' },
          { title: 'What money solves', body: 'Money is a universally accepted medium of exchange. It acts as: a store of value (save for later), a unit of account (measure prices), and a medium of exchange (facilitate transactions). Without money, complex modern economies would be impossible.', tip: 'Fun fact: Over 90% of money in modern economies is digital, not physical notes and coins.' },
          { title: 'Types of money', body: 'Commodity money (gold, silver), fiat money (₹, $), digital money (UPI, cards). Today, most money exists as digital entries in bank systems.' },
        ],
        keyTakeaways: ['Money solves the barter problem.', 'Money = medium of exchange + store of value + unit of account.', 'Modern money is mostly digital.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Which problem does money solve that the barter system could not?', options: [{ id: 'a', text: 'Inflation' }, { id: 'b', text: 'The double coincidence of wants' }, { id: 'c', text: 'Banking fees' }, { id: 'd', text: 'Credit scores' }], correctAnswer: 'b', explanation: 'The barter system required both parties to want exactly what the other had. Money removes this requirement.' },
      ],
    },
    2: {
      title: 'Needs vs Wants',
      xpReward: 60,
      content: {
        sections: [
          { title: 'Defining needs', body: 'Needs are essentials for survival and basic functioning: food, shelter, clothing, healthcare, transport to work.' },
          { title: 'Defining wants', body: 'Wants are things that improve quality of life but are not essential: dining out, streaming subscriptions, the latest phone, vacations.' },
          { title: 'The grey zone', body: 'Many expenses are context-dependent. A car might be a need in a city with poor public transport, but a want in a city with excellent metro connectivity.', tip: "This distinction doesn't mean wants are bad. It's about conscious spending choices." },
        ],
        keyTakeaways: ['Needs are essentials; wants improve quality of life.', 'The distinction varies by context.', 'Recognising the difference enables intentional spending.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Rahul earns ₹30,000/month. He spends ₹12,000 on rent, ₹4,000 on groceries, ₹3,000 on streaming + gaming, ₹2,000 on transport. Which is a "want"?', options: [{ id: 'a', text: 'Rent ₹12,000' }, { id: 'b', text: 'Groceries ₹4,000' }, { id: 'c', text: 'Streaming bundle ₹3,000' }, { id: 'd', text: 'Transport ₹2,000' }], correctAnswer: 'c', explanation: 'Streaming and gaming are entertainment — wants, not essentials.' },
      ],
    },
    3: {
      title: 'Income: How Money Comes In',
      xpReward: 50,
      content: {
        sections: [
          { title: 'Earned income', body: 'Earned income is money you receive for your time and labor: salary, freelance fees, wages.' },
          { title: 'Passive income', body: 'Passive income requires an initial investment of time, money, or both, but then generates income with less ongoing effort: rental income, dividends, royalties.' },
          { title: 'Income diversity', body: 'Relying on a single income source is risky. Job loss, medical emergencies, or economic downturns can cut your income suddenly.', tip: 'Most passive income sources require significant upfront capital or effort — they are not "free money."' },
        ],
        keyTakeaways: ['Earned income = money for time.', 'Passive income = money from assets.', 'Diversifying income reduces financial risk.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Priya earns a monthly salary, receives ₹2,000 quarterly from savings interest, and earns from freelance design. How many income streams?', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }, { id: 'c', text: '3' }, { id: 'd', text: '4' }], correctAnswer: 'c', explanation: 'Three income streams: salary, savings interest, and freelance income.' },
      ],
    },
  },
  'budget-city': {
    1: {
      title: 'Your First Budget',
      xpReward: 70,
      content: {
        sections: [
          { title: 'The 50/30/20 Rule', body: 'A popular budgeting framework: 50% of take-home pay on needs, 30% on wants, 20% on savings and debt repayment. This is a starting point, not a rigid rule.' },
          { title: 'Creating your budget', body: 'List all income → List all fixed expenses (rent, EMI, insurance) → List variable expenses (food, transport, entertainment) → Calculate savings.' },
        ],
        keyTakeaways: ['50% needs, 30% wants, 20% savings is a useful starting framework.', 'Every rupee should have a plan.', 'A budget is only useful if you track it.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: "Shreya earns ₹40,000 take-home. Using 50/30/20, how much should go to needs?", options: [{ id: 'a', text: '₹8,000' }, { id: 'b', text: '₹12,000' }, { id: 'c', text: '₹20,000' }, { id: 'd', text: '₹24,000' }], correctAnswer: 'c', explanation: '50% of ₹40,000 = ₹20,000 for needs.' },
      ],
    },
    2: {
      title: 'Fixed vs Variable Expenses',
      xpReward: 60,
      content: {
        sections: [
          { title: 'Fixed expenses', body: 'Fixed expenses are the same amount every month: rent/EMI, insurance premium, loan EMIs, subscriptions at fixed rates.' },
          { title: 'Variable expenses', body: 'Variable expenses change month to month: groceries, dining out, transport, entertainment, utilities. These are typically easier to cut when needed.' },
        ],
        keyTakeaways: ['Fixed expenses are constant and predictable.', 'Variable expenses fluctuate — identify which can be reduced.', 'Tracking both is essential to accurate budgeting.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Which expense is FIXED?', options: [{ id: 'a', text: 'Monthly grocery bill' }, { id: 'b', text: 'Electricity bill' }, { id: 'c', text: 'Home loan EMI' }, { id: 'd', text: 'Restaurant spending' }], correctAnswer: 'c', explanation: 'A home loan EMI is a fixed amount every month.' },
      ],
    },
  },
};

export default function MissionPage() {
  const { worldId, missionId } = useParams();
  const [mission,   setMission]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState(0); // 0=content 1=questions 2=complete
  const [answers,    setAnswers]    = useState({});
  const [revealed,   setRevealed]   = useState({});

  useEffect(() => {
    // Try API first, then fall back to static content
    const loadMission = async () => {
      setLoading(true);
      try {
        // Try loading by order number (e.g. /worlds/coin-valley/missions/1)
        const order = parseInt(missionId);
        if (!isNaN(order)) {
          const res = await fetch(`/api/v1/worlds/${worldId}/missions/${order}`);
          if (res.ok) {
            const data = await res.json();
            setMission(data.mission);
            setLoading(false);
            return;
          }
        }
        // Try loading by ObjectId
        const data = await getMission(missionId);
        setMission(data.mission);
        setLoading(false);
      } catch {
        // Fallback to static content
        const staticData = STATIC_MISSIONS[worldId]?.[missionId];
        if (staticData) {
          setMission(staticData);
        }
        setLoading(false);
      }
    };
    loadMission();
  }, [worldId, missionId]);

  if (loading) return (
    <AppLayout>
      <div className="section-container py-12 text-center">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading mission…</p>
      </div>
    </AppLayout>
  );

  if (!mission) return (
    <AppLayout>
      <div className="section-container py-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h2 className="font-display font-bold text-2xl text-white mb-4">Mission not found</h2>
        <p className="text-slate-400 mb-4">This mission hasn't been seeded in the database yet. Run the seed script to populate it.</p>
        <Link to="/worlds" className="btn-primary">Back to World Map</Link>
      </div>
    </AppLayout>
  );

  const sections  = mission.content?.sections || [];
  const questions = mission.questions || [];
  const hasQ      = questions.length > 0;
  const allRevealed = questions.every((q) => revealed[q.id]);

  const score = questions.length > 0
    ? Math.round(questions.filter((q) => answers[q.id] === q.correctAnswer).length / questions.length * 100)
    : 100;

  const handleComplete = async () => {
    setStep(2);
    // Try to save to backend, ignore errors
    try { await completeMission(mission._id || missionId, { score, timeSpentSeconds: 120 }); } catch {}
  };

  return (
    <AppLayout>
      <div className="section-container py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/worlds" className="btn-ghost p-2"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <div className="text-slate-500 text-xs mb-0.5">Mission · World {worldId}</div>
            <h1 className="font-display font-bold text-xl text-white">{mission.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 text-gold-400 text-sm font-semibold">
            <Zap className="w-4 h-4" />{mission.xpReward || 50} XP
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Content step */}
          {step === 0 && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {sections.map((section, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card p-6 mb-4">
                  <h3 className="font-display font-bold text-white mb-3">{section.title}</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{section.body}</p>
                  {section.tip && (
                    <div className="mt-4 flex gap-2 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
                      <Lightbulb className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <p className="text-gold-300/80 text-sm">{section.tip}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {mission.content?.keyTakeaways?.length > 0 && (
                <div className="glass-card border border-cyan-500/20 p-5 mb-6">
                  <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-cyan-400" />Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {mission.content.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-white/5 mb-6 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 flex-shrink-0 text-violet-400/60" />
                Educational content. Not financial advice.
              </div>

              <button onClick={() => setStep(hasQ ? 1 : 2)} className="btn-primary w-full justify-center">
                {hasQ ? 'Continue to Questions' : 'Complete Mission'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Questions step */}
          {step === 1 && hasQ && (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="font-display font-bold text-xl text-white">Knowledge Check</h2>

              {questions.map((q, i) => (
                <div key={q.id} className="glass-card p-6 border border-white/10">
                  <p className="text-white font-medium mb-4">Q{i+1}: {q.question}</p>
                  <div className="space-y-2 mb-4">
                    {q.options?.map((opt) => {
                      let cls = 'border-white/10 bg-white/3 text-slate-300 hover:border-violet-500/40';
                      if (revealed[q.id]) {
                        if (opt.id === q.correctAnswer)            cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
                        else if (opt.id === answers[q.id])         cls = 'border-coral-500/50 bg-coral-500/10 text-coral-300';
                      } else if (answers[q.id] === opt.id) {
                        cls = 'border-violet-500/50 bg-violet-500/10 text-white';
                      }
                      return (
                        <button key={opt.id} onClick={() => !revealed[q.id] && setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                          disabled={!!revealed[q.id]}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${cls}`}>
                          <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {opt.id.toUpperCase()}
                          </span>
                          <span className="text-sm">{opt.text}</span>
                          {revealed[q.id] && opt.id === q.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                  {!revealed[q.id] ? (
                    <button onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))} disabled={!answers[q.id]}
                      className="btn-primary text-sm disabled:opacity-40">Submit</button>
                  ) : (
                    <div className="p-3 rounded-xl border bg-white/5 border-white/10">
                      <p className="text-sm text-slate-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={handleComplete} disabled={!allRevealed}
                className="btn-primary w-full justify-center disabled:opacity-50">
                Complete Mission
              </button>
            </motion.div>
          )}

          {/* Complete step */}
          {step === 2 && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">Mission Complete!</h2>
              <p className="text-slate-400 mb-6">{mission.title}</p>
              <div className="flex justify-center gap-6 mb-8">
                {hasQ && <div><div className="font-display font-bold text-2xl text-white">{score}%</div><div className="text-slate-500 text-sm">Score</div></div>}
                <div><div className="font-display font-bold text-2xl text-gold-400">+{mission.xpReward || 50}</div><div className="text-slate-500 text-sm">XP</div></div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link to="/worlds" className="btn-secondary"><ArrowLeft className="w-4 h-4" />World Map</Link>
                <Link to="/stock-academy" className="btn-primary">Stock Academy <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
