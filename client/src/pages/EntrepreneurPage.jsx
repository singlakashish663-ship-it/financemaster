import React, { useState, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RefreshCw, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/layout/AppLayout';

const INITIAL = {
  cash: 50000, salary: 12000, price: 299, marketingBudget: 3000, staff: 1,
  month: 1, history: [], phase: 'setup', lastEvent: null,
  businessName: 'UrbanBites Tiffin', product: 'Tiffin / Meal Box',
  unitCost: 80, capacity: 200,
};

const EVENTS = [
  { text: 'Food festival nearby — demand doubled this week!',    demandMultiplier: 1.8, cashImpact: 0 },
  { text: 'Competitor opened nearby — your sales drop 20%.',     demandMultiplier: 0.8, cashImpact: 0 },
  { text: 'Corporate bulk order! Extra ₹8,000 revenue.',         demandMultiplier: 1,   cashImpact: 8000 },
  { text: 'Ingredient costs up 15% this month.',                 demandMultiplier: 1,   cashImpact: 0, costMultiplier: 1.15 },
  { text: 'Equipment breakdown — ₹4,500 repair cost.',           demandMultiplier: 0.9, cashImpact: -4500 },
  { text: 'Positive food blog review — social media boost!',     demandMultiplier: 1.3, cashImpact: 0 },
  { text: 'Slow month — school holidays reduced office crowd.',  demandMultiplier: 0.7, cashImpact: 0 },
  { text: 'Health inspector visit — all clear! Trust rises.',    demandMultiplier: 1.1, cashImpact: -500 },
];

function calcDemand(price, marketing, staff) {
  const base       = 120;
  const priceEff   = Math.max(0, 1 - (price - 200) / 400);
  const marketEff  = 1 + marketing / 10000;
  const staffEff   = Math.min(staff * 0.8, 1);
  return Math.round(base * priceEff * marketEff * staffEff);
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET': return { ...state, [action.key]: action.value };
    case 'START': return { ...state, phase: 'playing' };
    case 'NEXT_MONTH': {
      const event       = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const demand      = Math.round(calcDemand(state.price, state.marketingBudget, state.staff) * (event.demandMultiplier || 1));
      const unitsSold   = Math.min(demand, state.capacity * state.staff);
      const costPerUnit = state.unitCost * (event.costMultiplier || 1);
      const revenue     = unitsSold * state.price;
      const cogs        = unitsSold * costPerUnit;
      const staffCost   = state.staff * state.salary;
      const otherExp    = state.marketingBudget + 3000;
      const totalExp    = cogs + staffCost + otherExp;
      const profit      = revenue - totalExp;
      const newCash     = state.cash + profit + (event.cashImpact || 0);
      const breakEven   = Math.ceil((staffCost + otherExp) / Math.max(state.price - costPerUnit, 1));
      const record      = { month: state.month, revenue, expenses: totalExp, profit, unitsSold, cash: newCash, breakEven };
      const next        = state.month + 1;
      return { ...state, cash: Math.max(0, newCash), history: [...state.history, record], month: next, lastEvent: event, phase: next > 12 ? 'summary' : 'playing' };
    }
    case 'RESET': return { ...INITIAL };
    default: return state;
  }
}

export default function EntrepreneurPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const demand         = calcDemand(state.price, state.marketingBudget, state.staff);
  const monthlyRevenue = Math.min(demand, state.capacity * state.staff) * state.price;
  const monthlyCOGS    = Math.min(demand, state.capacity * state.staff) * state.unitCost;
  const monthlyExp     = monthlyCOGS + (state.staff * state.salary) + state.marketingBudget + 3000;
  const projectedProfit= monthlyRevenue - monthlyExp;
  const breakEvenUnits = Math.ceil(((state.staff * state.salary) + state.marketingBudget + 3000) / Math.max(state.price - state.unitCost, 1));

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">🚀 Entrepreneur Tycoon</h1>
          <p className="text-slate-400 max-w-2xl">Run a fictional tiffin business. Set prices, manage staff, allocate marketing, and survive 12 months. All numbers are educational simulations.</p>
        </motion.div>

        {/* ── SETUP ── */}
        {state.phase === 'setup' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <h2 className="font-display font-bold text-xl text-white mb-1">{state.businessName}</h2>
              <p className="text-slate-400 text-sm mb-6">Product: {state.product} · Starting Cash: ₹{state.cash.toLocaleString()}</p>
              <div className="space-y-5">
                {[
                  { label: `Selling Price: ₹${state.price}`, key: 'price', min: 100, max: 600, step: 10, note: `Cost price: ₹${state.unitCost} → Margin: ₹${state.price - state.unitCost}` },
                  { label: `Marketing Budget: ₹${state.marketingBudget.toLocaleString()}`, key: 'marketingBudget', min: 0, max: 15000, step: 500, note: 'More marketing = more demand, but higher costs' },
                  { label: `Staff Members: ${state.staff} (capacity ${state.capacity * state.staff} units/month)`, key: 'staff', min: 1, max: 5, step: 1, note: `Each staff costs ₹${state.salary.toLocaleString()}/month` },
                ].map(({ label, key, min, max, step, note }) => (
                  <div key={key}>
                    <div className="text-sm text-slate-300 mb-1">{label}</div>
                    <input type="range" min={min} max={max} step={step} value={state[key]}
                      onChange={(e) => dispatch({ type: 'SET', key, value: +e.target.value })}
                      className="w-full accent-violet-500 h-2 rounded-full mb-1" />
                    <p className="text-slate-500 text-xs">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-display font-bold text-white mb-4">Projected P&L</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Est. Demand',   value: `${demand} units`,                  color: 'text-cyan-400' },
                    { label: 'Revenue',       value: `₹${monthlyRevenue.toLocaleString()}`, color: 'text-emerald-400' },
                    { label: 'COGS',          value: `−₹${monthlyCOGS.toLocaleString()}`, color: 'text-coral-400' },
                    { label: 'Staff Cost',    value: `−₹${(state.staff * state.salary).toLocaleString()}`, color: 'text-coral-400' },
                    { label: 'Marketing+Ops', value: `−₹${(state.marketingBudget + 3000).toLocaleString()}`, color: 'text-coral-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className={`font-mono ${color}`}>{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-1.5 flex justify-between">
                    <span className="font-semibold text-white">Net Profit</span>
                    <span className={`font-display font-bold ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>₹{projectedProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 border border-gold-500/20">
                <div className="text-gold-400 font-semibold text-sm mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Break-Even Point</div>
                <p className="text-slate-300 text-sm">Sell <span className="text-white font-bold">{breakEvenUnits} units</span> to cover all costs.</p>
                <p className={`text-xs mt-1 ${demand >= breakEvenUnits ? 'text-emerald-400' : 'text-gold-400'}`}>
                  {demand >= breakEvenUnits ? '✅ Projected to exceed break-even' : `⚠️ Demand (${demand}) below break-even (${breakEvenUnits})`}
                </p>
              </div>

              <button onClick={() => dispatch({ type: 'START' })} className="btn-primary w-full justify-center">
                Launch Business! <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {state.phase === 'playing' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Month {state.month} of 12</h2>
                  <p className="text-slate-400 text-sm">{state.businessName}</p>
                </div>
                <div className={`font-display font-bold text-xl ${state.cash >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                  ₹{state.cash.toLocaleString()} cash
                </div>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  animate={{ width: `${((state.month-1)/12)*100}%` }} transition={{ duration: 0.5 }} />
              </div>

              {state.lastEvent && (
                <div className="glass-card p-4 border border-cyan-500/20">
                  <div className="text-cyan-400 text-sm font-semibold mb-1">📋 Last Month's Event</div>
                  <p className="text-slate-300 text-sm">{state.lastEvent.text}</p>
                </div>
              )}

              {state.history.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white text-sm mb-3">Performance</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={state.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                        <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="revenue"  name="Revenue"  fill="#10b981" radius={[2,2,0,0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[2,2,0,0]} />
                        <Bar dataKey="profit"   name="Profit"   fill="#8b5cf6" radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="glass-card p-5">
                <h3 className="font-semibold text-white text-sm mb-4">Adjust for Next Month</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: `Price: ₹${state.price}`,                  key: 'price',           min: 100, max: 600,   step: 10 },
                    { label: `Marketing: ₹${state.marketingBudget.toLocaleString()}`, key: 'marketingBudget', min: 0,   max: 15000, step: 500 },
                    { label: `Staff: ${state.staff}`,                   key: 'staff',           min: 1,   max: 5,     step: 1 },
                  ].map(({ label, key, min, max, step }) => (
                    <div key={key}>
                      <div className="text-xs text-slate-400 mb-1">{label}</div>
                      <input type="range" min={min} max={max} step={step} value={state[key]}
                        onChange={(e) => dispatch({ type: 'SET', key, value: +e.target.value })}
                        className="w-full accent-violet-500 h-1.5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white text-sm mb-3">This Month Projection</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Demand',      value: `${demand} units`,                           color: 'text-cyan-400' },
                    { label: 'Revenue',     value: `₹${monthlyRevenue.toLocaleString()}`,        color: 'text-emerald-400' },
                    { label: 'Total Costs', value: `₹${monthlyExp.toLocaleString()}`,            color: 'text-coral-400' },
                    { label: 'Break-even',  value: `${breakEvenUnits} units`,                   color: 'text-gold-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className={`font-mono font-semibold ${color}`}>{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-1.5 flex justify-between">
                    <span className="font-semibold text-white">Net Profit</span>
                    <span className={`font-display font-bold ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>₹{projectedProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'NEXT_MONTH' })} className="btn-primary w-full justify-center text-sm">
                Run Month {state.month} <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => dispatch({ type: 'RESET' })} className="btn-ghost w-full justify-center text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5" /> Restart
              </button>
            </div>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {state.phase === 'summary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card p-8 text-center border border-violet-500/30">
              <div className="text-5xl mb-4">{state.cash > 50000 ? '🏆' : state.cash > 0 ? '🥈' : '📉'}</div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">Year 1 Complete!</h2>
              <div className={`font-display font-bold text-4xl mb-2 ${state.cash >= 50000 ? 'text-emerald-400' : state.cash >= 0 ? 'text-gold-400' : 'text-coral-400'}`}>
                ₹{state.cash.toLocaleString()}
              </div>
              <p className="text-slate-400">Final cash balance</p>
              <p className="text-slate-400 mt-1 text-sm">
                {state.cash > 50000
                  ? `+₹${(state.cash - 50000).toLocaleString()} profit from initial capital`
                  : `₹${(50000 - state.cash).toLocaleString()} below initial capital`}
              </p>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3">Monthly Profit History</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={state.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="profit" name="Monthly Profit" fill="#8b5cf6" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button onClick={() => dispatch({ type: 'RESET' })} className="btn-primary w-full justify-center">
              <RefreshCw className="w-4 h-4" /> Run Another Year
            </button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
