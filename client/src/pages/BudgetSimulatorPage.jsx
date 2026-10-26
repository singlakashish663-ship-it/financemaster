import React, { useReducer, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, RefreshCw, Lightbulb, Info, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';

const INITIAL_SALARY = 45000;
const MONTHS = 12;

const EXPENSE_CATEGORIES = [
  { id: 'rent',      label: 'Rent / Housing',   emoji: '🏠', min: 5000,  max: 20000, default: 12000, type: 'need' },
  { id: 'food',      label: 'Food & Groceries', emoji: '🍱', min: 2000,  max: 8000,  default: 4000,  type: 'need' },
  { id: 'transport', label: 'Transport',        emoji: '🚗', min: 1000,  max: 6000,  default: 2500,  type: 'need' },
  { id: 'utilities', label: 'Utilities',        emoji: '⚡', min: 500,   max: 3000,  default: 1500,  type: 'need' },
  { id: 'health',    label: 'Health & Medical', emoji: '🏥', min: 0,     max: 5000,  default: 500,   type: 'need' },
  { id: 'phone',     label: 'Phone / Internet', emoji: '📱', min: 300,   max: 2000,  default: 800,   type: 'want' },
  { id: 'dining',    label: 'Dining Out',       emoji: '🍽️',min: 0,     max: 6000,  default: 2000,  type: 'want' },
  { id: 'shopping',  label: 'Shopping',         emoji: '🛍️',min: 0,     max: 8000,  default: 2000,  type: 'want' },
  { id: 'savings',   label: 'Savings / SIP',    emoji: '💰', min: 0,     max: 20000, default: 5000,  type: 'saving' },
  { id: 'emergency', label: 'Emergency Fund',   emoji: '🛡️',min: 0,     max: 10000, default: 2000,  type: 'saving' },
];

const RANDOM_EVENTS = [
  { title: 'Car Breakdown!',         desc: 'Unexpected repair cost.',        amount: -4500,  emoji: '🔧' },
  { title: 'Medical Emergency!',     desc: 'Urgent treatment needed.',       amount: -8000,  emoji: '🏥' },
  { title: 'Performance Bonus! 🎉',  desc: 'Your manager appreciated you!',  amount: 10000,  emoji: '🎁' },
  { title: 'Electricity Spike',      desc: 'Summer heat spike.',             amount: -1200,  emoji: '⚡' },
  { title: 'Freelance Project!',     desc: 'Extra income this month.',       amount: 6000,   emoji: '💼' },
  { title: 'Phone Stolen!',          desc: 'Need to buy a replacement.',     amount: -12000, emoji: '📱' },
  { title: 'Investment Returns!',    desc: 'Mutual fund dividend credited.', amount: 2500,   emoji: '📈' },
  { title: 'Slow Month',             desc: 'Lower than usual income.',       amount: -3000,  emoji: '📉' },
];

const ENDINGS = [
  { minNetWorth: 50000,  title: '🏆 Financial Champion!', desc: 'Outstanding! You saved ₹50,000+ and built an emergency fund. Excellent discipline.', color: 'emerald' },
  { minNetWorth: 20000,  title: '🥈 Solid Saver',         desc: 'Great job! You ended the year with positive savings and smart spending choices.',   color: 'cyan' },
  { minNetWorth: 5000,   title: '🥉 Getting There',       desc: 'You stayed afloat. A few better choices could have boosted your net worth significantly.', color: 'gold' },
  { minNetWorth: -10000, title: '😅 Tight Month',         desc: 'You ended close to zero. Review your wants spending — small cuts add up.',           color: 'gold' },
  { minNetWorth: -999999,title: '⚠️ In the Red',          desc: 'You overspent significantly. Prioritise needs and build an emergency fund first.',   color: 'coral' },
];

const COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#a78bfa','#34d399','#fbbf24','#fb7185','#60a5fa'];

function reducer(state, action) {
  switch (action.type) {
    case 'SET_EXPENSE': return { ...state, expenses: { ...state.expenses, [action.id]: action.value } };
    case 'START':       return { ...state, phase: 'playing', cashBalance: 0, month: 1, monthlyHistory: [], decisions: [] };
    case 'NEXT_MONTH': {
      const totalExp  = Object.values(state.expenses).reduce((s, v) => s + v, 0);
      const cashFlow  = state.salary - totalExp;
      const newBal    = state.cashBalance + cashFlow;
      const history   = [...state.monthlyHistory, { month: state.month, income: state.salary, expenses: totalExp, cashFlow, balance: newBal }];
      if (state.month % 3 === 0 && state.month < MONTHS) {
        const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        return { ...state, cashBalance: newBal, monthlyHistory: history, activeEvent: event, phase: 'event' };
      }
      const next = state.month + 1;
      return { ...state, cashBalance: newBal, monthlyHistory: history, month: next, phase: next > MONTHS ? 'summary' : 'playing', netWorth: newBal };
    }
    case 'HANDLE_EVENT': {
      const newBal = state.cashBalance + (state.activeEvent?.amount || 0);
      const next   = state.month + 1;
      return {
        ...state, cashBalance: newBal, activeEvent: null,
        decisions: [...state.decisions, { month: state.month, event: state.activeEvent.title, impact: state.activeEvent.amount }],
        month: next, phase: next > MONTHS ? 'summary' : 'playing', netWorth: newBal,
      };
    }
    case 'RESET': return { ...initialState };
    default: return state;
  }
}

const initialState = {
  phase: 'setup', month: 1, salary: INITIAL_SALARY, cashBalance: 0, netWorth: 0,
  expenses: Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c.id, c.default])),
  monthlyHistory: [], activeEvent: null, decisions: [],
};

export default function BudgetSimulatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const totalExpenses = Object.values(state.expenses).reduce((s, v) => s + v, 0);
  const monthlyCashFlow = state.salary - totalExpenses;
  const needsTotal   = EXPENSE_CATEGORIES.filter((c) => c.type === 'need').reduce((s, c) => s + state.expenses[c.id], 0);
  const wantsTotal   = EXPENSE_CATEGORIES.filter((c) => c.type === 'want').reduce((s, c) => s + state.expenses[c.id], 0);
  const savingsTotal = EXPENSE_CATEGORIES.filter((c) => c.type === 'saving').reduce((s, c) => s + state.expenses[c.id], 0);

  const ending = ENDINGS.find((e) => state.netWorth >= e.minNetWorth) || ENDINGS[ENDINGS.length - 1];

  const pieData = EXPENSE_CATEGORIES.map((cat, i) => ({
    name: cat.label, value: state.expenses[cat.id] || 0, color: COLORS[i % COLORS.length],
  })).filter((d) => d.value > 0);

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Budget Simulator</h1>
          <p className="text-slate-400 max-w-2xl">Manage a fictional ₹45,000/month salary across 12 months. Make spending decisions, handle surprise events, and see how your choices compound.</p>
          <div className="badge-violet mt-2 inline-flex">All money is fictional — educational simulation only</div>
        </motion.div>

        {/* ── SETUP ── */}
        {state.phase === 'setup' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <h2 className="font-display font-bold text-xl text-white mb-2">Set Your Monthly Budget</h2>
              <p className="text-slate-400 text-sm mb-6">Monthly Salary: <span className="text-emerald-400 font-bold">₹{state.salary.toLocaleString()}</span></p>

              {['need','want','saving'].map((type) => (
                <div key={type} className="mb-6">
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${type === 'need' ? 'text-violet-300' : type === 'want' ? 'text-cyan-300' : 'text-emerald-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${type === 'need' ? 'bg-violet-400' : type === 'want' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                    {type === 'need' ? 'Needs (Essential)' : type === 'want' ? 'Wants (Lifestyle)' : 'Savings & Protection'}
                  </h3>
                  {EXPENSE_CATEGORIES.filter((c) => c.type === type).map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3 mb-3">
                      <span className="text-xl w-8 text-center flex-shrink-0">{cat.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{cat.label}</span>
                          <span className="font-mono text-white">₹{(state.expenses[cat.id] || 0).toLocaleString()}</span>
                        </div>
                        <input type="range" min={cat.min} max={cat.max} step={100} value={state.expenses[cat.id] || 0}
                          onChange={(e) => dispatch({ type: 'SET_EXPENSE', id: cat.id, value: +e.target.value })}
                          className="w-full accent-violet-500 h-1.5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-display font-bold text-white mb-4">Monthly Overview</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {[
                    { label: 'Salary',   value: state.salary,      color: 'text-emerald-400' },
                    { label: 'Needs',    value: -needsTotal,        color: 'text-violet-400' },
                    { label: 'Wants',    value: -wantsTotal,        color: 'text-cyan-400' },
                    { label: 'Savings',  value: -savingsTotal,      color: 'text-gold-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className={`font-mono font-semibold ${color}`}>{value > 0 ? '+' : ''}₹{Math.abs(value).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-1.5 flex justify-between">
                    <span className="font-semibold text-white text-sm">Monthly Cash Flow</span>
                    <span className={`font-display font-bold ${monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                      {monthlyCashFlow >= 0 ? '+' : ''}₹{monthlyCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 border border-gold-500/20">
                <div className="text-gold-400 font-semibold text-sm mb-2 flex items-center gap-2"><Info className="w-4 h-4" />50/30/20 Guideline</div>
                <div className="space-y-1 mt-1">
                  {[
                    { label: 'Needs',   actual: needsTotal,   target: state.salary * 0.5 },
                    { label: 'Wants',   actual: wantsTotal,   target: state.salary * 0.3 },
                    { label: 'Savings', actual: savingsTotal, target: state.salary * 0.2 },
                  ].map(({ label, actual, target }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${actual <= target ? 'bg-emerald-400' : 'bg-coral-400'}`} />
                      <span className="text-slate-400 w-14">{label}</span>
                      <span className={actual <= target ? 'text-emerald-400' : 'text-coral-400'}>
                        {actual <= target ? '✓' : `+₹${(actual - target).toLocaleString()} over`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => dispatch({ type: 'START' })} className="btn-primary w-full justify-center">
                Start 12-Month Simulation <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {state.phase === 'playing' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Month {state.month} of {MONTHS}</h2>
                  <p className="text-slate-400 text-sm">Income: ₹{state.salary.toLocaleString()} · Expenses: ₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`font-display font-bold text-lg ${monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                  {monthlyCashFlow >= 0 ? '+' : ''}₹{monthlyCashFlow.toLocaleString()} / month
                </div>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  animate={{ width: `${((state.month - 1) / MONTHS) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>

              {state.monthlyHistory.length > 0 && (
                <div className="glass-card p-5 mb-4">
                  <h3 className="font-semibold text-white text-sm mb-3">Savings Progress</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={state.monthlyHistory}>
                        <defs>
                          <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                        <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="balance" name="Balance" stroke="#8b5cf6" fill="url(#balGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="glass-card p-5">
                <h3 className="font-semibold text-white text-sm mb-3">This Month's Spending</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                      <span className="text-lg">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 truncate">{cat.label}</div>
                        <div className="text-sm font-mono text-white">₹{(state.expenses[cat.id] || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5 border border-emerald-500/20">
                <h3 className="font-semibold text-white mb-2">Savings Balance</h3>
                <div className={`font-display font-bold text-3xl ${state.cashBalance >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                  ₹{state.cashBalance.toLocaleString('en-IN')}
                </div>
                <p className="text-slate-500 text-xs mt-1">After {state.month - 1} months</p>
              </div>

              <button onClick={() => dispatch({ type: 'NEXT_MONTH' })} className="btn-primary w-full justify-center text-sm">
                End Month {state.month} <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => dispatch({ type: 'RESET' })} className="btn-ghost w-full justify-center text-sm">
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </div>
          </div>
        )}

        {/* ── EVENT ── */}
        {state.phase === 'event' && state.activeEvent && (
          <div className="flex items-center justify-center min-h-64">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card border border-white/20 p-8 max-w-md w-full text-center">
              <div className="text-5xl mb-4">{state.activeEvent.emoji}</div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">{state.activeEvent.title}</h2>
              <p className="text-slate-400 mb-2">{state.activeEvent.desc}</p>
              <div className={`text-2xl font-display font-bold mb-6 ${state.activeEvent.amount >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                {state.activeEvent.amount >= 0 ? '+' : ''}₹{Math.abs(state.activeEvent.amount).toLocaleString()}
              </div>
              <div className="glass-card p-4 mb-6 text-left">
                <p className="text-slate-400 text-sm">
                  <span className="text-gold-400 font-semibold">💡 Why this matters: </span>
                  {state.activeEvent.amount < 0
                    ? 'Unexpected expenses are why financial advisors recommend keeping 3–6 months of expenses in an emergency fund. Did yours cover it?'
                    : 'Windfalls are great — direct extra income towards savings or debt repayment rather than lifestyle inflation.'}
                </p>
              </div>
              <button onClick={() => dispatch({ type: 'HANDLE_EVENT' })} className="btn-primary w-full justify-center">
                Continue to Month {state.month + 1} <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {state.phase === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className={`glass-card p-8 text-center border border-${ending.color}-500/30`}>
              <div className="text-5xl mb-4">{ending.color === 'emerald' ? '🏆' : ending.color === 'cyan' ? '🥈' : ending.color === 'gold' ? '🥉' : '⚠️'}</div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">{ending.title}</h2>
              <p className="text-slate-300 max-w-md mx-auto mb-4">{ending.desc}</p>
              <div className={`font-display font-bold text-4xl ${state.netWorth >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                ₹{state.netWorth.toLocaleString('en-IN')}
              </div>
              <div className="text-slate-500 text-sm">Net savings after 12 months</div>
            </div>

            {state.decisions.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-white mb-4">Events That Changed Your Plan</h3>
                <div className="space-y-2">
                  {state.decisions.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                      <div>
                        <span className="text-slate-300 text-sm font-medium">{d.event}</span>
                        <span className="text-slate-500 text-xs ml-2">(Month {d.month})</span>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${d.impact >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                        {d.impact >= 0 ? '+' : ''}₹{d.impact.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => dispatch({ type: 'RESET' })} className="btn-primary w-full justify-center">
              <RefreshCw className="w-4 h-4" /> Try Again with Different Choices
            </button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
