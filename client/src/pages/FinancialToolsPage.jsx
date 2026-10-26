import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { calcEMI, calcCompoundInterest, calcInflation } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 p-3 text-xs">
      <p className="text-slate-400 mb-1">Year {label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

/* ---- EMI ---- */
function EMICalculator() {
  const [form, setForm]   = useState({ principal: 500000, annualRate: 9, tenureMonths: 60 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const calc = async () => {
    setLoading(true);
    try { setResult(await calcEMI({ principal: +form.principal, annualRate: +form.annualRate, tenureMonths: +form.tenureMonths })); }
    catch (err) { toast.error(err.message || 'Calculation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Loan Amount (₹)', key: 'principal',    min: 1000,  max: 10000000, step: 10000 },
          { label: 'Interest Rate (%)', key: 'annualRate',  min: 0.1,   max: 50,       step: 0.1 },
          { label: 'Tenure (months)',  key: 'tenureMonths', min: 1,     max: 360,      step: 1 },
        ].map(({ label, key, min, max, step }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
            <input type="number" value={form[key]} min={min} max={max} step={step}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="input-field text-sm" />
          </div>
        ))}
      </div>
      <button onClick={calc} disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Calculate EMI'}
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Monthly EMI',   value: `₹${result.emi.toLocaleString('en-IN')}`,          color: 'text-violet-400' },
              { label: 'Total Payment', value: `₹${result.totalPayment.toLocaleString('en-IN')}`,  color: 'text-white' },
              { label: 'Total Interest',value: `₹${result.totalInterest.toLocaleString('en-IN')}`, color: 'text-coral-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
                <div className="text-slate-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
          <div className="glass-card p-4">
            <div className="flex gap-4 text-sm mb-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-violet-500" /><span className="text-slate-400">Principal</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-coral-500" /><span className="text-slate-400">Interest</span></div>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex">
              <div className="bg-violet-500" style={{ width: `${(form.principal / result.totalPayment) * 100}%` }} />
              <div className="bg-coral-500 flex-1" />
            </div>
          </div>
          <button onClick={() => setShowSchedule(!showSchedule)} className="btn-ghost text-sm">
            {showSchedule ? 'Hide' : 'Show'} amortization schedule
          </button>
          {showSchedule && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/10">{['Month','EMI','Principal','Interest','Balance'].map((h) => <th key={h} className="px-4 py-3 text-slate-500 text-left">{h}</th>)}</tr></thead>
                <tbody>
                  {result.schedule.slice(0, 24).map((row) => (
                    <tr key={row.month} className="border-b border-white/5 hover:bg-white/3">
                      <td className="px-4 py-2 text-slate-400">{row.month}</td>
                      <td className="px-4 py-2 text-white">₹{row.emi.toLocaleString()}</td>
                      <td className="px-4 py-2 text-violet-400">₹{row.principalPaid.toLocaleString()}</td>
                      <td className="px-4 py-2 text-coral-400">₹{row.interestPaid.toLocaleString()}</td>
                      <td className="px-4 py-2 text-slate-300">₹{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.schedule.length > 24 && <p className="text-center text-slate-600 text-xs py-3">Showing first 24 of {result.schedule.length} months</p>}
            </div>
          )}
          <p className="text-xs text-slate-600">{result.disclaimer}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---- Compound Interest ---- */
function CompoundInterestCalculator() {
  const [form, setForm]     = useState({ principal: 100000, annualRate: 12, years: 15, monthlyContribution: 5000, inflationRate: 6 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calc = async () => {
    setLoading(true);
    try { setResult(await calcCompoundInterest({ principal: +form.principal, annualRate: +form.annualRate, years: +form.years, monthlyContribution: +form.monthlyContribution, inflationRate: +form.inflationRate })); }
    catch (err) { toast.error(err.message || 'Calculation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Initial Investment (₹)', key: 'principal',           min: 0,      max: 10000000, step: 10000 },
          { label: 'Monthly Contribution (₹)',key: 'monthlyContribution', min: 0,      max: 100000,   step: 1000 },
          { label: 'Annual Return (%)',       key: 'annualRate',          min: 0,      max: 50,       step: 0.5 },
          { label: 'Duration (years)',        key: 'years',               min: 1,      max: 50,       step: 1 },
          { label: 'Inflation Rate (%)',      key: 'inflationRate',       min: 0,      max: 20,       step: 0.5 },
        ].map(({ label, key, min, max, step }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
            <input type="number" value={form[key]} min={min} max={max} step={step}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="input-field text-sm" />
          </div>
        ))}
      </div>
      <button onClick={calc} disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Calculate Growth'}
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Final Value',         value: `₹${result.finalValue.toLocaleString('en-IN')}`,              color: 'text-emerald-400' },
              { label: 'Total Contributions', value: `₹${result.totalContributions.toLocaleString('en-IN')}`,     color: 'text-violet-400' },
              { label: 'Total Growth',        value: `₹${result.totalGrowth.toLocaleString('en-IN')}`,            color: 'text-gold-400' },
              { label: 'Inflation-Adjusted',  value: `₹${result.inflationAdjustedValue.toLocaleString('en-IN')}`, color: 'text-cyan-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-3 text-center">
                <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="glass-card p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.dataPoints}>
                <defs>
                  <linearGradient id="cgGrow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cgCont" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Area type="monotone" dataKey="value"         name="Total Value"    stroke="#10b981" fill="url(#cgGrow)" strokeWidth={2} />
                <Area type="monotone" dataKey="contributions" name="Contributions"  stroke="#8b5cf6" fill="url(#cgCont)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-600">{result.disclaimer}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---- Inflation ---- */
function InflationCalculator() {
  const [form, setForm]     = useState({ amount: 100000, inflationRate: 6, years: 10 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calc = async () => {
    setLoading(true);
    try { setResult(await calcInflation({ amount: +form.amount, inflationRate: +form.inflationRate, years: +form.years })); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Current Amount (₹)',    key: 'amount',        min: 100, max: 10000000, step: 1000 },
          { label: 'Inflation Rate (% p.a.)',key: 'inflationRate', min: 0,   max: 30,       step: 0.5 },
          { label: 'Years Ahead',           key: 'years',         min: 1,   max: 50,       step: 1 },
        ].map(({ label, key, min, max, step }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
            <input type="number" value={form[key]} min={min} max={max} step={step}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="input-field text-sm" />
          </div>
        ))}
      </div>
      <button onClick={calc} disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Calculate Inflation Impact'}
      </button>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-3 gap-4">
          {[
            { label: `₹${result.originalAmount.toLocaleString()} today needs…`, value: `₹${result.futureEquivalent.toLocaleString('en-IN')} in ${form.years}y`, color: 'text-coral-400' },
            { label: 'Purchasing power in future',   value: `₹${result.purchasingPower.toLocaleString('en-IN')}`,             color: 'text-gold-400' },
            { label: 'Purchasing power lost',        value: `${result.purchasingPowerLossPercent.toFixed(1)}%`,               color: 'text-slate-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="text-slate-500 text-xs mb-1">{label}</div>
              <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ---- Page ---- */
const TOOLS = [
  { id: 'emi',      title: 'EMI Calculator',      emoji: '🏠', desc: 'Monthly loan payments, total interest, and amortization schedule.',  component: EMICalculator },
  { id: 'compound', title: 'Compound Interest',   emoji: '📈', desc: 'See how investments grow with contributions and inflation adjustment.', component: CompoundInterestCalculator },
  { id: 'inflation',title: 'Inflation Calculator', emoji: '💸', desc: 'Understand how inflation erodes purchasing power over time.',          component: InflationCalculator },
];

export default function FinancialToolsPage() {
  const [active, setActive] = useState('emi');
  const ActiveTool = TOOLS.find((t) => t.id === active)?.component;
  const activeMeta = TOOLS.find((t) => t.id === active);

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Financial Calculators</h1>
          <p className="text-slate-400">Working calculators with explanations and charts. All results are hypothetical — clearly labeled.</p>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === t.id ? 'bg-violet-600 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
              <span>{t.emoji}</span>{t.title}
            </button>
          ))}
        </div>

        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="font-display font-bold text-xl text-white mb-1">{activeMeta?.title}</h2>
            <p className="text-slate-400 text-sm">{activeMeta?.desc}</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20 mb-6 text-xs text-gold-300/80">
            <Shield className="w-4 h-4 flex-shrink-0" />
            All calculations are hypothetical illustrations. Returns are not guaranteed. Consult a qualified financial advisor for personal advice.
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {ActiveTool && <ActiveTool />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
