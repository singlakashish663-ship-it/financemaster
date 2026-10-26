import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

const SCENARIOS = [
  {
    id: 1,
    name: 'Rahul\'s First Salary',
    salary: 40000,
    description: 'Rahul just got his first job paying ₹40,000/month in Mumbai. Help him allocate his budget wisely.',
    categories: [
      { id: 'rent',     label: '🏠 Rent',       recommended: [30, 40], unit: '%', min: 0, max: 100 },
      { id: 'food',     label: '🍱 Food',        recommended: [10, 20], unit: '%', min: 0, max: 100 },
      { id: 'transport',label: '🚌 Transport',   recommended: [5, 10],  unit: '%', min: 0, max: 100 },
      { id: 'savings',  label: '💰 Savings',     recommended: [20, 30], unit: '%', min: 0, max: 100 },
      { id: 'wants',    label: '🎮 Entertainment',recommended: [5, 15], unit: '%', min: 0, max: 100 },
    ],
  },
  {
    id: 2,
    name: 'Priya\'s Freelance Month',
    salary: 60000,
    description: 'Priya earned ₹60,000 freelancing this month. Her income varies — she needs a careful budget.',
    categories: [
      { id: 'rent',        label: '🏠 Rent & Bills',  recommended: [30, 40], unit: '%', min: 0, max: 100 },
      { id: 'food',        label: '🍱 Food',           recommended: [10, 15], unit: '%', min: 0, max: 100 },
      { id: 'emergency',   label: '🛡️ Emergency Fund', recommended: [15, 25], unit: '%', min: 0, max: 100 },
      { id: 'savings',     label: '💰 Savings/Invest', recommended: [15, 25], unit: '%', min: 0, max: 100 },
      { id: 'wants',       label: '🎯 Personal',       recommended: [5, 15],  unit: '%', min: 0, max: 100 },
    ],
  },
];

export default function BudgetAllocator({ onGameEnd }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [allocs,      setAllocs]      = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const [totalScore,  setTotalScore]  = useState(0);

  const scenario = SCENARIOS[scenarioIdx];
  const total    = Object.values(allocs).reduce((s, v) => s + (v || 0), 0);
  const remaining = 100 - total;

  const handleSlider = (id, value) => {
    setAllocs((a) => ({ ...a, [id]: parseInt(value) }));
  };

  const evaluate = () => {
    let score = 0;
    const feedback = scenario.categories.map((cat) => {
      const alloc = allocs[cat.id] || 0;
      const [lo, hi] = cat.recommended;
      if (alloc >= lo && alloc <= hi) {
        score += 20;
        return { ...cat, alloc, status: 'good', msg: `✓ Great! ${alloc}% is within the recommended ${lo}–${hi}%.` };
      } else if (alloc < lo) {
        score += 8;
        return { ...cat, alloc, status: 'low',  msg: `↑ A bit low — try ${lo}–${hi}% for ${cat.label}.` };
      } else {
        score += 5;
        return { ...cat, alloc, status: 'high', msg: `↓ Too high — try ${lo}–${hi}% for ${cat.label}.` };
      }
    });
    return { score, feedback };
  };

  const handleSubmit = () => {
    if (Math.abs(remaining) > 5) return;
    setSubmitted(true);
    const { score } = evaluate();
    setTotalScore((s) => s + score);
  };

  const nextScenario = () => {
    if (scenarioIdx + 1 < SCENARIOS.length) {
      setScenarioIdx((i) => i + 1);
      setAllocs({});
      setSubmitted(false);
    } else {
      onGameEnd?.(totalScore);
    }
  };

  const { score: evalScore, feedback } = submitted ? evaluate() : { score: 0, feedback: [] };

  return (
    <div>
      {/* Scenario header */}
      <div className="glass-card p-4 mb-4 border border-violet-500/20">
        <div className="flex items-center justify-between mb-1">
          <span className="badge-violet text-xs">Scenario {scenarioIdx + 1}/{SCENARIOS.length}</span>
          <span className="font-game font-bold text-gold-400 text-lg">₹{scenario.salary.toLocaleString()}/month</span>
        </div>
        <h3 className="font-display font-bold text-white">{scenario.name}</h3>
        <p className="text-slate-400 text-xs mt-1">{scenario.description}</p>
      </div>

      {/* Budget remaining indicator */}
      <div className={`flex items-center justify-between mb-3 p-3 rounded-xl border ${
        Math.abs(remaining) <= 5 ? 'bg-emerald-500/10 border-emerald-500/30' :
        remaining < 0 ? 'bg-coral-500/10 border-coral-500/30' : 'bg-gold-500/10 border-gold-500/30'
      }`}>
        <span className="text-sm font-semibold text-white">Budget allocated: {total}%</span>
        <span className={`text-sm font-bold ${Math.abs(remaining) <= 5 ? 'text-emerald-400' : remaining < 0 ? 'text-coral-400' : 'text-gold-400'}`}>
          {remaining >= 0 ? `${remaining}% remaining` : `${Math.abs(remaining)}% over budget!`}
        </span>
      </div>

      {/* Sliders */}
      <div className="space-y-3 mb-4">
        {scenario.categories.map((cat) => {
          const alloc = allocs[cat.id] || 0;
          const amount = Math.round((alloc / 100) * scenario.salary);
          const fb = feedback.find((f) => f.id === cat.id);
          return (
            <div key={cat.id} className={`glass-card p-3 ${submitted ? (fb?.status === 'good' ? 'border border-emerald-500/30' : fb?.status === 'low' ? 'border border-gold-500/30' : 'border border-coral-500/30') : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{cat.label}</span>
                <div className="text-right">
                  <span className="font-mono text-white font-bold">{alloc}%</span>
                  <span className="text-slate-500 text-xs ml-2">₹{amount.toLocaleString()}</span>
                </div>
              </div>
              <input
                type="range" min={0} max={80} step={5}
                value={alloc}
                onChange={(e) => !submitted && handleSlider(cat.id, e.target.value)}
                disabled={submitted}
                className="w-full accent-violet-500 h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>Recommended: {cat.recommended[0]}–{cat.recommended[1]}%</span>
              </div>
              {submitted && fb && (
                <div className={`text-xs mt-1 ${fb.status === 'good' ? 'text-emerald-400' : fb.status === 'low' ? 'text-gold-400' : 'text-coral-400'}`}>
                  {fb.msg}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Math.abs(remaining) > 5}
          className="btn-primary w-full justify-center disabled:opacity-40"
        >
          {Math.abs(remaining) > 5
            ? `Allocate remaining ${remaining > 0 ? remaining : Math.abs(remaining)}% first`
            : 'Submit Budget Plan'
          }
        </button>
      ) : (
        <div>
          <div className="glass-card p-4 mb-3 text-center">
            <div className="font-display font-bold text-2xl text-gold-400 mb-1">{evalScore} / 100</div>
            <div className="text-slate-400 text-sm">Budget Score</div>
          </div>
          <button
            onClick={nextScenario}
            className="btn-primary w-full justify-center"
          >
            {scenarioIdx + 1 < SCENARIOS.length ? 'Next Scenario →' : 'Finish Game'}
          </button>
        </div>
      )}
    </div>
  );
}
