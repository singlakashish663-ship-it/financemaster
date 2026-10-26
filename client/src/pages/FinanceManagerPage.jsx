import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet,
  PiggyBank, Target, AlertCircle, CheckCircle, Edit2,
  Save, X, BarChart2, ArrowRight, Zap, Calendar,
  DollarSign, ShieldCheck
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';

// ─── Local Storage persistence ────────────────────────────────────────────────
const STORAGE_KEY = 'fq_finance_manager';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  income: 45000,
  currency: '₹',
  expenses: [
    { id: 1, name: 'Rent',          amount: 12000, category: 'Housing',       emoji: '🏠' },
    { id: 2, name: 'Groceries',     amount: 4000,  category: 'Food',          emoji: '🛒' },
    { id: 3, name: 'Transport',     amount: 2500,  category: 'Transport',     emoji: '🚌' },
    { id: 4, name: 'Electricity',   amount: 1200,  category: 'Utilities',     emoji: '💡' },
    { id: 5, name: 'Mobile',        amount: 600,   category: 'Utilities',     emoji: '📱' },
    { id: 6, name: 'Dining Out',    amount: 2000,  category: 'Food',          emoji: '🍽️' },
    { id: 7, name: 'Entertainment', amount: 1500,  category: 'Entertainment', emoji: '🎮' },
    { id: 8, name: 'SIP / Savings', amount: 5000,  category: 'Savings',       emoji: '💰' },
  ],
  goals: [
    { id: 1, name: 'Emergency Fund',  target: 150000, saved: 30000, emoji: '🛡️', deadline: '2026-12' },
    { id: 2, name: 'Laptop Upgrade',  target: 60000,  saved: 15000, emoji: '💻', deadline: '2026-06' },
  ],
  transactions: [],
};

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Savings', 'Other'];
const CATEGORY_EMOJIS = { Housing:'🏠', Food:'🍱', Transport:'🚌', Utilities:'💡', Entertainment:'🎮', Health:'💊', Shopping:'🛍️', Savings:'💰', Other:'📦' };
const CATEGORY_COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#a78bfa','#34d399','#fbbf24','#fb7185'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 p-3 text-xs">
      {label && <p className="text-slate-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Overview',    emoji: '📊' },
  { id: 'expenses',    label: 'Expenses',    emoji: '💸' },
  { id: 'goals',       label: 'Goals',       emoji: '🎯' },
  { id: 'insights',    label: 'Insights',    emoji: '💡' },
];

export default function FinanceManagerPage() {
  const [data,       setData]       = useState(() => loadData() || DEFAULT_STATE);
  const [tab,        setTab]        = useState('overview');
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Food', emoji: '🍱' });
  const [newGoal,    setNewGoal]    = useState({ name: '', target: '', saved: '', emoji: '🎯', deadline: '' });
  const [editIncome, setEditIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('');
  const [addExpOpen, setAddExpOpen] = useState(false);
  const [addGoalOpen,setAddGoalOpen]= useState(false);
  const [nextId,     setNextId]     = useState(100);

  // Persist on change
  useEffect(() => { saveData(data); }, [data]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const savings       = data.income - totalExpenses;
  const savingsRate   = data.income > 0 ? Math.round((savings / data.income) * 100) : 0;

  // Category breakdown
  const categoryMap = {};
  data.expenses.forEach((e) => {
    if (!categoryMap[e.category]) categoryMap[e.category] = 0;
    categoryMap[e.category] += Number(e.amount);
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // 50/30/20 analysis
  const needsCats   = ['Housing','Food','Transport','Utilities','Health'];
  const wantsCats   = ['Entertainment','Shopping','Other'];
  const savingsCats = ['Savings'];
  const needsTotal  = data.expenses.filter(e => needsCats.includes(e.category)).reduce((s,e) => s+Number(e.amount), 0);
  const wantsTotal  = data.expenses.filter(e => wantsCats.includes(e.category)).reduce((s,e) => s+Number(e.amount), 0);
  const savTotal    = data.expenses.filter(e => savingsCats.includes(e.category)).reduce((s,e) => s+Number(e.amount), 0);

  const needsPct  = data.income > 0 ? Math.round((needsTotal / data.income) * 100) : 0;
  const wantsPct  = data.income > 0 ? Math.round((wantsTotal / data.income) * 100) : 0;
  const savPct    = data.income > 0 ? Math.round((savTotal  / data.income) * 100) : 0;

  // Monthly projection for 12 months
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const projectionData = monthLabels.map((m, i) => ({
    month: m,
    income:   data.income,
    expenses: totalExpenses,
    savings:  Math.max(0, savings) * (i + 1),
  }));

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;
    const id = nextId; setNextId((n) => n + 1);
    setData((d) => ({
      ...d,
      expenses: [...d.expenses, {
        id,
        name:     newExpense.name,
        amount:   Number(newExpense.amount),
        category: newExpense.category,
        emoji:    CATEGORY_EMOJIS[newExpense.category] || '📦',
      }],
    }));
    setNewExpense({ name: '', amount: '', category: 'Food', emoji: '🍱' });
    setAddExpOpen(false);
  };

  const handleDeleteExpense = (id) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    const id = nextId; setNextId((n) => n + 1);
    setData((d) => ({
      ...d,
      goals: [...d.goals, {
        id,
        name:     newGoal.name,
        target:   Number(newGoal.target),
        saved:    Number(newGoal.saved) || 0,
        emoji:    newGoal.emoji || '🎯',
        deadline: newGoal.deadline,
      }],
    }));
    setNewGoal({ name: '', target: '', saved: '', emoji: '🎯', deadline: '' });
    setAddGoalOpen(false);
  };

  const handleDeleteGoal = (id) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  };

  const handleUpdateGoalSaved = (id, amount) => {
    setData((d) => ({
      ...d,
      goals: d.goals.map((g) => g.id === id ? { ...g, saved: Math.min(Number(amount), g.target) } : g),
    }));
  };

  const handleSaveIncome = () => {
    const n = Number(tempIncome);
    if (n > 0) setData((d) => ({ ...d, income: n }));
    setEditIncome(false);
  };

  const getInsights = () => {
    const insights = [];
    if (savingsRate < 10) insights.push({ type: 'warning', text: `You're saving only ${savingsRate}% of income. Aim for at least 20%.` });
    if (savingsRate >= 20) insights.push({ type: 'success', text: `Great! You're saving ${savingsRate}% of your income. You're on track.` });
    if (needsPct > 50) insights.push({ type: 'warning', text: `Needs are ${needsPct}% of income (above 50% rule). Review housing or food costs.` });
    if (wantsPct > 30) insights.push({ type: 'warning', text: `Wants spending is ${wantsPct}% (above recommended 30%). Consider cutting entertainment or shopping.` });
    const emergency = data.goals.find((g) => g.name.toLowerCase().includes('emergency'));
    if (!emergency) insights.push({ type: 'tip', text: 'You have no Emergency Fund goal. Add one — aim for 3–6 months of expenses (₹' + (totalExpenses * 4).toLocaleString() + ').' });
    if (savings < 0) insights.push({ type: 'danger', text: `You're spending ₹${Math.abs(savings).toLocaleString()} MORE than you earn. Reduce expenses immediately.` });
    if (insights.length === 0) insights.push({ type: 'success', text: 'Your budget looks healthy. Keep it up!' });
    return insights;
  };

  return (
    <AppLayout>
      <div className="section-container py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display font-bold text-3xl text-white mb-1">💰 Personal Finance Manager</h1>
          <p className="text-slate-400 text-sm">Track your income, expenses, and savings goals. All data stored locally on your device.</p>
        </motion.div>

        {/* Income card */}
        <div className="glass-card p-5 mb-6 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-sm mb-1">Monthly Take-Home Income</div>
              {editIncome ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={tempIncome} onChange={(e) => setTempIncome(e.target.value)}
                    className="input-field text-xl font-bold w-40 py-1" autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveIncome()} />
                  <button onClick={handleSaveIncome} className="btn-primary text-sm py-1.5 px-3"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditIncome(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-3xl text-emerald-400">₹{data.income.toLocaleString('en-IN')}</span>
                  <button onClick={() => { setTempIncome(data.income); setEditIncome(true); }}
                    className="btn-ghost p-1.5 text-slate-500 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <div className="text-slate-400 text-xs">Total Expenses</div>
                <div className="font-bold text-coral-400 text-lg">₹{totalExpenses.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Net Savings</div>
                <div className={`font-bold text-lg ${savings >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                  {savings >= 0 ? '+' : ''}₹{savings.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Savings rate bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Savings Rate</span>
              <span className={savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-gold-400' : 'text-coral-400'}>
                {savingsRate}% {savingsRate >= 20 ? '✓ Good' : savingsRate >= 10 ? '~ Ok' : '✗ Low'}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 10 ? 'bg-gold-500' : 'bg-coral-500'}`}
                style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-violet-600 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Income',    value: `₹${data.income.toLocaleString()}`,     color: 'text-emerald-400', icon: '💚' },
                  { label: 'Expenses',  value: `₹${totalExpenses.toLocaleString()}`,   color: 'text-coral-400',   icon: '🔴' },
                  { label: 'Savings',   value: `₹${Math.max(0,savings).toLocaleString()}`, color: 'text-gold-400', icon: '⭐' },
                  { label: 'Save Rate', value: `${savingsRate}%`,                       color: savingsRate>=20?'text-emerald-400':'text-gold-400', icon: '📊' },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="glass-card p-4 text-center">
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Spending breakdown pie */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
                  {pieData.length > 0 ? (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                            contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No expenses added yet</div>
                  )}
                </div>

                {/* 50/30/20 Rule check */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-4">50/30/20 Rule Check</h3>
                  <div className="space-y-4">
                    {[
                      { label: '🏠 Needs',   actual: needsPct, target: 50, amount: needsTotal,  color: 'bg-violet-500', desc: 'Housing, food, transport, utilities' },
                      { label: '🎮 Wants',   actual: wantsPct, target: 30, amount: wantsTotal,  color: 'bg-cyan-500',   desc: 'Entertainment, shopping, dining out' },
                      { label: '💰 Savings', actual: savPct,   target: 20, amount: savTotal,    color: 'bg-emerald-500',desc: 'Savings, investments, debt repayment' },
                    ].map(({ label, actual, target, amount, color, desc }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <div>
                            <span className="text-white font-medium">{label}</span>
                            <span className="text-slate-500 text-xs ml-2">{desc}</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${actual <= target ? 'text-emerald-400' : 'text-coral-400'}`}>{actual}%</span>
                            <span className="text-slate-500 text-xs ml-1">/ {target}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.min(actual, 100)}%` }} />
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">₹{amount.toLocaleString('en-IN')}/month</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                    Based on the 50/30/20 budgeting rule. Adjust to your situation.
                  </div>
                </div>
              </div>

              {/* Savings projection */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">12-Month Savings Projection</h3>
                {savings > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                        <defs>
                          <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="savings" name="Cumulative Savings" stroke="#10b981" fill="url(#savGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="w-10 h-10 text-coral-400 mx-auto mb-2" />
                      <p className="text-coral-300 text-sm font-semibold">You're spending more than you earn!</p>
                      <p className="text-slate-500 text-xs mt-1">Reduce expenses to start saving.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── EXPENSES ── */}
          {tab === 'expenses' && (
            <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Add expense button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-white">Monthly Expenses</h2>
                <button onClick={() => setAddExpOpen(true)} className="btn-primary text-sm py-2">
                  <Plus className="w-4 h-4" /> Add Expense
                </button>
              </div>

              {/* Add expense form */}
              <AnimatePresence>
                {addExpOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="glass-card p-5 mb-4 border border-violet-500/30 overflow-hidden">
                    <h3 className="font-semibold text-white mb-3">New Expense</h3>
                    <div className="grid sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Name</label>
                        <input value={newExpense.name} onChange={(e) => setNewExpense((n) => ({ ...n, name: e.target.value }))}
                          placeholder="e.g. Gym Membership" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Amount (₹)</label>
                        <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense((n) => ({ ...n, amount: e.target.value }))}
                          placeholder="1000" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Category</label>
                        <select value={newExpense.category} onChange={(e) => setNewExpense((n) => ({ ...n, category: e.target.value }))}
                          className="input-field text-sm">
                          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddExpense} className="btn-primary text-sm">Add</button>
                      <button onClick={() => setAddExpOpen(false)} className="btn-ghost text-sm">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expenses list grouped by category */}
              {CATEGORIES.map((cat) => {
                const catExpenses = data.expenses.filter((e) => e.category === cat);
                if (catExpenses.length === 0) return null;
                const catTotal = catExpenses.reduce((s, e) => s + Number(e.amount), 0);
                return (
                  <div key={cat} className="mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2 px-1">
                      <span>{CATEGORY_EMOJIS[cat]} {cat}</span>
                      <span className="font-mono text-white">₹{catTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-2">
                      {catExpenses.map((exp) => (
                        <motion.div key={exp.id} layout
                          className="glass-card p-4 flex items-center gap-3 hover:border-white/15 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                            {exp.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm">{exp.name}</div>
                            <div className="text-slate-500 text-xs">{exp.category} · {Math.round((exp.amount / data.income) * 100)}% of income</div>
                          </div>
                          <div className="font-mono font-bold text-white">₹{Number(exp.amount).toLocaleString('en-IN')}</div>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="btn-ghost p-1.5 text-slate-600 hover:text-coral-400 ml-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className={`glass-card p-4 flex items-center justify-between border ${savings >= 0 ? 'border-emerald-500/30' : 'border-coral-500/30'}`}>
                <div>
                  <div className="text-slate-400 text-sm">Total Expenses</div>
                  <div className="font-display font-bold text-xl text-coral-400">₹{totalExpenses.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm">Net Savings</div>
                  <div className={`font-display font-bold text-xl ${savings >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                    {savings >= 0 ? '+' : ''}₹{savings.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── GOALS ── */}
          {tab === 'goals' && (
            <motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-white">Savings Goals</h2>
                <button onClick={() => setAddGoalOpen(true)} className="btn-primary text-sm py-2">
                  <Plus className="w-4 h-4" /> Add Goal
                </button>
              </div>

              {/* Add goal form */}
              <AnimatePresence>
                {addGoalOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="glass-card p-5 mb-4 border border-violet-500/30 overflow-hidden">
                    <h3 className="font-semibold text-white mb-3">New Savings Goal</h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Goal Name</label>
                        <input value={newGoal.name} onChange={(e) => setNewGoal((n) => ({ ...n, name: e.target.value }))}
                          placeholder="e.g. Emergency Fund" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Target Amount (₹)</label>
                        <input type="number" value={newGoal.target} onChange={(e) => setNewGoal((n) => ({ ...n, target: e.target.value }))}
                          placeholder="100000" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Already Saved (₹)</label>
                        <input type="number" value={newGoal.saved} onChange={(e) => setNewGoal((n) => ({ ...n, saved: e.target.value }))}
                          placeholder="0" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Target Date</label>
                        <input type="month" value={newGoal.deadline} onChange={(e) => setNewGoal((n) => ({ ...n, deadline: e.target.value }))}
                          className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Emoji</label>
                        <input value={newGoal.emoji} onChange={(e) => setNewGoal((n) => ({ ...n, emoji: e.target.value }))}
                          placeholder="🎯" className="input-field text-sm" maxLength={2} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddGoal} className="btn-primary text-sm">Add Goal</button>
                      <button onClick={() => setAddGoalOpen(false)} className="btn-ghost text-sm">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Goals list */}
              <div className="space-y-4">
                {data.goals.map((goal) => {
                  const pct       = Math.round((goal.saved / goal.target) * 100);
                  const remaining = goal.target - goal.saved;
                  const monthsNeeded = savings > 0 ? Math.ceil(remaining / savings) : null;
                  return (
                    <div key={goal.id} className={`glass-card p-5 border ${pct >= 100 ? 'border-emerald-500/40' : 'border-white/10'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-2xl">{goal.emoji}</div>
                          <div>
                            <div className="font-display font-bold text-white">{goal.name}</div>
                            {goal.deadline && <div className="text-slate-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Target: {goal.deadline}</div>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="btn-ghost p-1.5 text-slate-600 hover:text-coral-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">₹{goal.saved.toLocaleString()} saved</span>
                          <span className={`font-bold ${pct >= 100 ? 'text-emerald-400' : 'text-violet-400'}`}>{Math.min(pct, 100)}%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>₹{goal.saved.toLocaleString()} / ₹{goal.target.toLocaleString()}</span>
                          {pct < 100 && <span>₹{remaining.toLocaleString()} remaining</span>}
                        </div>
                      </div>

                      {/* Update saved amount */}
                      {pct < 100 && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={goal.saved}
                            key={goal.saved}
                            onBlur={(e) => handleUpdateGoalSaved(goal.id, e.target.value)}
                            className="input-field text-sm py-1.5 flex-1"
                            placeholder="Update saved amount"
                          />
                          <div className="text-xs text-slate-500 flex-shrink-0">
                            {monthsNeeded && monthsNeeded > 0 && `~${monthsNeeded} months`}
                          </div>
                        </div>
                      )}
                      {pct >= 100 && (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" /> Goal Achieved! 🎉
                        </div>
                      )}
                    </div>
                  );
                })}

                {data.goals.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No goals yet. Add your first savings goal!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── INSIGHTS ── */}
          {tab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-xl text-white mb-2">Personalized Insights</h2>

              {/* Smart insights */}
              <div className="space-y-3">
                {getInsights().map((insight, i) => {
                  const styles = {
                    success: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-300', icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
                    warning: { bg: 'bg-gold-500/10 border-gold-500/30',       text: 'text-gold-300',   icon: <AlertCircle  className="w-5 h-5 text-gold-400" /> },
                    danger:  { bg: 'bg-coral-500/10 border-coral-500/30',     text: 'text-coral-300',  icon: <AlertCircle  className="w-5 h-5 text-coral-400" /> },
                    tip:     { bg: 'bg-violet-500/10 border-violet-500/30',   text: 'text-violet-300', icon: <Zap          className="w-5 h-5 text-violet-400" /> },
                  };
                  const s = styles[insight.type] || styles.tip;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg}`}>
                      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
                      <p className={`text-sm leading-relaxed ${s.text}`}>{insight.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Expense bar chart */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Expense Category Breakdown</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                        contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}>
                        {pieData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick tips */}
              <div className="glass-card p-5 border border-violet-500/20">
                <h3 className="font-semibold text-white mb-3">💡 Quick Financial Tips</h3>
                <div className="space-y-2">
                  {[
                    'Pay yourself first — transfer savings on salary day before spending.',
                    'Track every expense for 30 days. Awareness alone reduces spending.',
                    'Build an emergency fund of 3–6 months of expenses before investing.',
                    'Avoid lifestyle inflation — keep expenses stable when income grows.',
                    'Review subscriptions monthly — cancel what you haven\'t used in 30 days.',
                    'The 24-hour rule: wait a day before any non-essential purchase over ₹1,000.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-violet-400 font-bold flex-shrink-0">→</span> {tip}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-3">These are general educational tips, not personalised financial advice.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
