import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveOnboarding } from '../services/api';
import toast from 'react-hot-toast';

const AVATARS = [
  { id: 'explorer', emoji: '🧭', name: 'Explorer',  desc: 'Curious & adventurous' },
  { id: 'investor', emoji: '📈', name: 'Investor',  desc: 'Strategic & patient' },
  { id: 'scholar',  emoji: '📚', name: 'Scholar',   desc: 'Methodical & thorough' },
  { id: 'trader',   emoji: '⚡', name: 'Trader',    desc: 'Quick & analytical' },
  { id: 'creator',  emoji: '🚀', name: 'Creator',   desc: 'Innovative & bold' },
  { id: 'guardian', emoji: '🛡️', name: 'Guardian',  desc: 'Cautious & safe' },
];

const LEARNING_PATHS = [
  { id: 'school',    label: 'School Learner',         desc: 'Building financial foundations early',              emoji: '🎒' },
  { id: 'college',   label: 'College Student',         desc: 'Managing student life and planning ahead',          emoji: '🎓' },
  { id: 'first-job', label: 'First Job Professional',  desc: 'Starting career and building wealth',               emoji: '💼' },
  { id: 'adult',     label: 'Adult Learner',           desc: 'Strengthening financial knowledge at any stage',    emoji: '🌟' },
];

const GOALS = [
  { id: 'understand-money',  label: 'Understand money',            emoji: '💰' },
  { id: 'learn-budgeting',   label: 'Learn budgeting',             emoji: '📊' },
  { id: 'build-savings',     label: 'Build savings',               emoji: '🏦' },
  { id: 'loans-credit',      label: 'Understand loans & credit',   emoji: '💳' },
  { id: 'share-market',      label: 'Learn share market basics',   emoji: '📈' },
  { id: 'investing',         label: 'Understand investing',        emoji: '🌱' },
  { id: 'trading',           label: 'Explore trading concepts',    emoji: '⚡' },
  { id: 'taxes-salary',      label: 'Learn about taxes & salary',  emoji: '💼' },
  { id: 'insurance',         label: 'Understand insurance',        emoji: '🛡️' },
  { id: 'long-term-plan',    label: 'Build long-term plans',       emoji: '🌌' },
];

const DAILY_TIMES = [
  { id: '5',   label: '5 minutes',    desc: 'Quick daily bite' },
  { id: '10',  label: '10 minutes',   desc: 'Steady learner' },
  { id: '20',  label: '20 minutes',   desc: 'Committed explorer' },
  { id: '30',  label: '30+ minutes',  desc: 'Deep diver' },
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',    desc: 'Gentle explanations, no rush',        emoji: '🌱' },
  { id: 'medium', label: 'Medium',  desc: 'Balanced challenge',                  emoji: '🔥' },
  { id: 'hard',   label: 'Hard',    desc: 'Deep dive, advanced concepts',        emoji: '⚡' },
];

const CURRENCIES = [
  { id: 'INR', label: 'Indian Rupee (₹)',   flag: '🇮🇳' },
  { id: 'USD', label: 'US Dollar ($)',       flag: '🇺🇸' },
  { id: 'GBP', label: 'British Pound (£)',  flag: '🇬🇧' },
  { id: 'EUR', label: 'Euro (€)',            flag: '🇪🇺' },
];

const STEPS = [
  { id: 'avatar',     title: 'Choose Your Character',   subtitle: 'Pick the adventurer that represents you' },
  { id: 'path',       title: 'Select Your Learning Path', subtitle: "We'll personalise your adventure" },
  { id: 'goals',      title: 'What Are Your Goals?',    subtitle: 'Choose up to 5 topics you want to master' },
  { id: 'daily-time', title: 'Daily Learning Time',     subtitle: 'How much time can you commit each day?' },
  { id: 'difficulty', title: 'Choose Your Difficulty',  subtitle: 'You can always change this later' },
  { id: 'currency',   title: 'Preferred Currency',      subtitle: 'For examples and calculations' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    avatar: '', learningPath: '', goals: [],
    dailyTime: '10', difficulty: 'medium', currency: 'INR',
  });
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep.id) {
      case 'avatar':     return !!selections.avatar;
      case 'path':       return !!selections.learningPath;
      case 'goals':      return selections.goals.length >= 1;
      case 'daily-time': return !!selections.dailyTime;
      case 'difficulty': return !!selections.difficulty;
      case 'currency':   return !!selections.currency;
      default:           return true;
    }
  };

  const toggleGoal = (id) => setSelections((s) => ({
    ...s,
    goals: s.goals.includes(id)
      ? s.goals.filter((g) => g !== id)
      : s.goals.length < 5 ? [...s.goals, id] : s.goals,
  }));

  const handleNext = async () => {
    if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
    setLoading(true);
    try {
      await saveOnboarding(selections);
      await refreshProfile();
      toast.success('Adventure begins! 🚀');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-gradient opacity-40" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-8 h-2 bg-violet-500' :
              i < step   ? 'w-2 h-2 bg-violet-500/60' :
                           'w-2 h-2 bg-white/20'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card border border-white/10 p-8"
          >
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-2xl text-white mb-2">{currentStep.title}</h2>
              <p className="text-slate-400">{currentStep.subtitle}</p>
            </div>

            {/* Avatar */}
            {currentStep.id === 'avatar' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVATARS.map((a) => (
                  <button key={a.id}
                    onClick={() => setSelections((s) => ({ ...s, avatar: a.id }))}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                      selections.avatar === a.id
                        ? 'border-violet-500 bg-violet-500/10 shadow-glow-sm'
                        : 'border-white/10 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <div className="text-4xl mb-2">{a.emoji}</div>
                    <div className="font-semibold text-white text-sm">{a.name}</div>
                    <div className="text-slate-500 text-xs mt-1">{a.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Path */}
            {currentStep.id === 'path' && (
              <div className="space-y-3">
                {LEARNING_PATHS.map((p) => (
                  <button key={p.id}
                    onClick={() => setSelections((s) => ({ ...s, learningPath: p.id }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selections.learningPath === p.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <span className="text-3xl">{p.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold text-white">{p.label}</div>
                      <div className="text-slate-500 text-sm">{p.desc}</div>
                    </div>
                    {selections.learningPath === p.id && <Check className="w-5 h-5 text-violet-400 ml-auto" />}
                  </button>
                ))}
              </div>
            )}

            {/* Goals */}
            {currentStep.id === 'goals' && (
              <div>
                <p className="text-slate-500 text-sm text-center mb-4">Selected {selections.goals.length}/5 goals</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => {
                    const selected = selections.goals.includes(g.id);
                    return (
                      <button key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        disabled={!selected && selections.goals.length >= 5}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-left disabled:opacity-40 ${
                          selected
                            ? 'border-violet-500 bg-violet-500/10 text-white'
                            : 'border-white/10 hover:border-white/20 bg-white/3 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{g.emoji}</span>
                        <span className="text-sm">{g.label}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-violet-400 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily time */}
            {currentStep.id === 'daily-time' && (
              <div className="grid grid-cols-2 gap-3">
                {DAILY_TIMES.map((t) => (
                  <button key={t.id}
                    onClick={() => setSelections((s) => ({ ...s, dailyTime: t.id }))}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                      selections.dailyTime === t.id
                        ? 'border-violet-500 bg-violet-500/10 shadow-glow-sm'
                        : 'border-white/10 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <div className="font-display font-bold text-xl text-white mb-1">{t.label}</div>
                    <div className="text-slate-500 text-sm">{t.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Difficulty */}
            {currentStep.id === 'difficulty' && (
              <div className="space-y-3">
                {DIFFICULTIES.map((d) => (
                  <button key={d.id}
                    onClick={() => setSelections((s) => ({ ...s, difficulty: d.id }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selections.difficulty === d.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <span className="text-3xl">{d.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold text-white">{d.label}</div>
                      <div className="text-slate-500 text-sm">{d.desc}</div>
                    </div>
                    {selections.difficulty === d.id && <Check className="w-5 h-5 text-violet-400 ml-auto" />}
                  </button>
                ))}
              </div>
            )}

            {/* Currency */}
            {currentStep.id === 'currency' && (
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map((c) => (
                  <button key={c.id}
                    onClick={() => setSelections((s) => ({ ...s, currency: c.id }))}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selections.currency === c.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-sm font-medium text-white text-left">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="btn-ghost disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <>🚀 Start Adventure</>
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
