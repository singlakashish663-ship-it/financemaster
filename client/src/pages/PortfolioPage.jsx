import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Wallet, Activity, ShieldCheck, ArrowRight, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPortfolio, getTransactions, resetPortfolio } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e','#a78bfa','#34d399','#fbbf24'];

export default function PortfolioPage() {
  const [portfolio,     setPortfolio]     = useState(null);
  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [resetting,     setResetting]     = useState(false);
  const [tab,           setTab]           = useState('overview');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getPortfolio().catch(() => null),
      getTransactions().catch(() => ({ transactions: [] })),
    ]).then(([port, txns]) => {
      setPortfolio(port);
      setTransactions(txns.transactions || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReset = async () => {
    if (!window.confirm('Reset your virtual portfolio to ₹1,00,000? All holdings and history will be cleared.')) return;
    setResetting(true);
    try { await resetPortfolio(); toast.success('Portfolio reset to ₹1,00,000'); load(); }
    catch { toast.error('Reset failed'); }
    finally { setResetting(false); }
  };

  const summary  = portfolio?.summary;
  const holdings = portfolio?.portfolio?.holdings || [];

  const sectorData = holdings.reduce((acc, h) => {
    const sector   = h.sector || 'Other';
    const existing = acc.find((a) => a.name === sector);
    const value    = h.quantity * (h.currentPrice || 0);
    if (existing) existing.value += value; else acc.push({ name: sector, value });
    return acc;
  }, []);

  return (
    <AppLayout>
      <div className="section-container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">Virtual Portfolio</h1>
            <div className="badge-green text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Simulation Mode — Not Real Money
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={load}     className="btn-ghost text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button onClick={handleReset} disabled={resetting} className="btn-danger text-sm">{resetting ? '…' : 'Reset'}</button>
            <Link to="/trading" className="btn-primary text-sm"><TrendingUp className="w-4 h-4" /> Trade</Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : summary ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Portfolio Value',    value: `₹${summary.portfolioValue?.toLocaleString('en-IN')}`,   color: 'text-white' },
                { label: 'Total Return',       value: `${summary.totalReturn >= 0 ? '+' : ''}₹${summary.totalReturn?.toLocaleString('en-IN')}`, color: summary.totalReturn >= 0 ? 'text-emerald-400' : 'text-coral-400' },
                { label: 'Realized P&L',       value: `₹${summary.realizedPnL?.toLocaleString()}`,            color: summary.realizedPnL >= 0 ? 'text-emerald-400' : 'text-coral-400' },
                { label: 'Transaction Costs',  value: `₹${summary.totalTransactionCosts?.toLocaleString()}`,   color: 'text-coral-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-5">
                  <div className="text-slate-400 text-xs mb-1">{label}</div>
                  <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-500/5 border border-gold-500/20 mb-6 text-xs text-gold-300/80">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              All balances, holdings, and returns are virtual simulation data. No real money is involved.
            </div>

            <div className="flex gap-2 mb-6">
              {['overview','holdings','transactions'].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white text-sm mb-4">Asset Allocation</h3>
                  {sectorData.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ name: 'Cash', value: summary.cashBalance }, ...sectorData]}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                            {[{ name: 'Cash' }, ...sectorData].map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background: '#12103a', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', fontSize: '12px' }} />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-500 text-sm">100% cash — start trading to build your portfolio</div>
                  )}
                </div>
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white text-sm mb-4">Portfolio Metrics</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Initial Capital',    value: `₹${portfolio.portfolio?.initialBalance?.toLocaleString()}` },
                      { label: 'Cash Balance',       value: `₹${summary.cashBalance?.toLocaleString()}` },
                      { label: 'Holdings Value',     value: `₹${summary.holdingsValue?.toLocaleString()}` },
                      { label: 'Unrealized P&L',     value: `₹${summary.unrealizedPnL?.toLocaleString()}`,     color: (summary.unrealizedPnL||0) >= 0 ? 'text-emerald-400' : 'text-coral-400' },
                      { label: 'Max Drawdown',       value: `${summary.maxDrawdown?.toFixed(2)}%`,              color: 'text-coral-400' },
                      { label: 'Total Trades',       value: summary.totalTrades },
                    ].map(({ label, value, color = 'text-white' }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-400">{label}</span>
                        <span className={`font-mono font-semibold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'holdings' && (
              holdings.length > 0 ? (
                <div className="space-y-2">
                  {holdings.map((h) => (
                    <div key={h.symbol} className="glass-card p-4 flex items-center gap-4 flex-wrap">
                      <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                      <div className="flex-1 min-w-32">
                        <div className="font-semibold text-white">{h.symbol}</div>
                        <div className="text-slate-500 text-xs">{h.quantity} shares @ ₹{h.averageBuyPrice?.toFixed(2)} avg</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">₹{(h.quantity * (h.currentPrice||0)).toLocaleString()}</div>
                        <div className={`text-xs ${(h.unrealizedPnL||0) >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                          {(h.unrealizedPnL||0) >= 0 ? '+' : ''}₹{(h.unrealizedPnL||0).toFixed(0)} ({(h.unrealizedPnLPercent||0).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-4">No holdings yet.</p>
                  <Link to="/trading" className="btn-primary text-sm">Open Trading Terminal</Link>
                </div>
              )
            )}

            {tab === 'transactions' && (
              transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((txn) => (
                    <div key={txn._id} className="glass-card p-4 flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${txn.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-coral-500/10 text-coral-400'}`}>
                        {txn.side === 'buy' ? '▲' : '▼'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm">{txn.side === 'buy' ? 'Bought' : 'Sold'} {txn.quantity} {txn.symbol}</div>
                        <div className="text-slate-500 text-xs">@ ₹{txn.price?.toFixed(2)} · {new Date(txn.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">₹{txn.totalValue?.toLocaleString()}</div>
                        {txn.realizedPnL !== 0 && (
                          <div className={`text-xs ${txn.realizedPnL >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                            {txn.realizedPnL >= 0 ? '+' : ''}₹{txn.realizedPnL?.toFixed(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No transactions yet.</p>
                </div>
              )
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="font-display font-bold text-2xl text-white mb-2">Portfolio not found</h3>
            <p className="text-slate-400 mb-6">Start the backend server and complete onboarding to initialise your portfolio.</p>
            <Link to="/trading" className="btn-primary">Open Trading Terminal <ArrowRight className="w-4 h-4" /></Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
