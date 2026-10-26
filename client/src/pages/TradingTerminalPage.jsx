import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, BarChart2, Search,
  AlertTriangle, Wallet, Activity, ChevronRight
} from 'lucide-react';
import {
  getStocks, getStockHistory, getPortfolio,
  placeOrder, getOrders, getTransactions
} from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { createChart, ColorType } from 'lightweight-charts';
import toast from 'react-hot-toast';

/* ---- Candlestick chart ---- */
function CandlestickChart({ stockId }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);
  const [timeframe, setTimeframe] = useState('1d');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94a3b8' },
      grid:   { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale:       { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true },
      width:  containerRef.current.clientWidth,
      height: 300,
    });
    chartRef.current = chart;
    const series = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#f43f5e',
      borderUpColor: '#10b981', borderDownColor: '#f43f5e',
      wickUpColor: '#10b981', wickDownColor: '#f43f5e',
    });
    seriesRef.current = series;
    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.resize(containerRef.current.clientWidth, 300);
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); chart.remove(); };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !stockId) return;
    setLoading(true);
    getStockHistory(stockId, { timeframe, bars: 200 })
      .then((d) => { seriesRef.current?.setData(d.candles || []); chartRef.current?.timeScale().fitContent(); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stockId, timeframe]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {['1d','1h','15m'].map((tf) => (
          <button key={tf} onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${timeframe === tf ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {tf}
          </button>
        ))}
        {loading && <div className="w-4 h-4 border border-violet-500/30 border-t-violet-500 rounded-full animate-spin ml-2" />}
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

/* ---- Stock Row ---- */
function StockRow({ stock, onSelect, isSelected }) {
  const change    = stock.currentPrice - (stock.previousClose || stock.currentPrice);
  const changePct = stock.previousClose ? (change / stock.previousClose) * 100 : 0;
  return (
    <button onClick={() => onSelect(stock)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 ${isSelected ? 'bg-violet-500/10 border-l-2 border-violet-500' : 'border-l-2 border-transparent'}`}>
      <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center text-lg flex-shrink-0">{stock.logoEmoji || '🏢'}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{stock.symbol}</div>
        <div className="text-slate-500 text-xs truncate">{stock.name}</div>
      </div>
      <div className="text-right">
        <div className="text-white text-sm font-mono">₹{stock.currentPrice?.toLocaleString('en-IN')}</div>
        <div className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
          {change >= 0 ? '+' : ''}{changePct.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}

/* ---- Order Form ---- */
function OrderForm({ stock, portfolio, onOrderPlaced }) {
  const [side,       setSide]       = useState('buy');
  const [orderType,  setOrderType]  = useState('market');
  const [quantity,   setQuantity]   = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [loading,    setLoading]    = useState(false);

  const execPrice  = orderType === 'market' ? stock?.currentPrice : parseFloat(limitPrice) || stock?.currentPrice;
  const totalValue = quantity * (execPrice || 0);
  const estCost    = totalValue * (side === 'buy' ? 1.0015 : 0.9985);
  const holding    = portfolio?.holdings?.find((h) => h.symbol === stock?.symbol);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stock) return;
    setLoading(true);
    try {
      await placeOrder({
        stockId: stock._id, orderType, side,
        quantity: parseInt(quantity),
        limitPrice: orderType !== 'market' ? parseFloat(limitPrice) : undefined,
      });
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed for ${stock.symbol}!`);
      onOrderPlaced?.();
    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (!stock) return (
    <div className="text-center py-8 text-slate-500">
      <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="text-sm">Select a stock to trade</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-bg-secondary">
        {['buy','sell'].map((s) => (
          <button key={s} type="button" onClick={() => setSide(s)}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${side === s ? (s === 'buy' ? 'bg-emerald-600 text-white shadow-glow-green' : 'bg-coral-600 text-white') : 'text-slate-500 hover:text-white'}`}>
            {s === 'buy' ? '▲ Buy' : '▼ Sell'}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Order Type</label>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="input-field text-sm">
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
          <option value="stop-loss">Stop-Loss</option>
        </select>
      </div>

      {orderType !== 'market' && (
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">{orderType === 'limit' ? 'Limit Price (₹)' : 'Stop Price (₹)'}</label>
          <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={stock?.currentPrice?.toString()} className="input-field text-sm" min="0.01" step="0.01" required />
        </div>
      )}

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Quantity</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all">−</button>
          <input type="number" value={quantity} min={1} max={10000}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-field text-center flex-1 text-sm" />
          <button type="button" onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all">+</button>
        </div>
      </div>

      {/* Preview */}
      <div className={`p-3 rounded-xl border text-sm space-y-1.5 ${side === 'buy' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-coral-500/5 border-coral-500/20'}`}>
        <div className="flex justify-between text-slate-400">
          <span>Est. Price</span><span className="text-white font-mono">₹{execPrice?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Total Value</span><span className="text-white font-mono">₹{totalValue?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400 border-t border-white/10 pt-1.5">
          <span>Est. {side === 'buy' ? 'Cost' : 'Proceeds'}</span>
          <span className="text-white font-mono font-semibold">₹{estCost?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>{side === 'buy' ? 'Cash Available' : 'Shares Held'}</span>
          <span className={`font-semibold ${side === 'buy' ? (portfolio?.cashBalance >= estCost ? 'text-emerald-400' : 'text-coral-400') : (holding?.quantity >= quantity ? 'text-emerald-400' : 'text-coral-400')}`}>
            {side === 'buy' ? `₹${portfolio?.cashBalance?.toLocaleString() ?? '—'}` : `${holding?.quantity ?? 0} shares`}
          </span>
        </div>
      </div>

      {holding && (
        <div className="text-xs text-slate-500 flex justify-between">
          <span>Holding: {holding.quantity} shares</span>
          <span>Avg: ₹{holding.averageBuyPrice?.toFixed(2)}</span>
        </div>
      )}

      <button type="submit" disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all text-sm disabled:opacity-50 ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-coral-600 hover:bg-coral-500'}`}>
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          : `${side === 'buy' ? 'Place Buy' : 'Place Sell'} — ₹${estCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        }
      </button>
      <p className="text-xs text-slate-600 text-center">Virtual money only · Simulation mode</p>
    </form>
  );
}

/* ---- Main Page ---- */
export default function TradingTerminalPage() {
  const [stocks,        setStocks]        = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [portfolio,     setPortfolio]     = useState(null);
  const [orders,        setOrders]        = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [tab,           setTab]           = useState('chart');
  const [search,        setSearch]        = useState('');
  const [loading,       setLoading]       = useState(true);

  const loadPortfolio = useCallback(() =>
    getPortfolio().then(setPortfolio).catch(() => {}), []);

  useEffect(() => {
    Promise.all([
      getStocks().catch(() => ({ stocks: [] })),
      loadPortfolio(),
      getOrders().catch(() => ({ orders: [] })),
      getTransactions().catch(() => ({ transactions: [] })),
    ]).then(([sRes, _, oRes, tRes]) => {
      const list = sRes.stocks || [];
      setStocks(list);
      if (list.length) setSelectedStock(list[0]);
      setOrders(oRes.orders || []);
      setTransactions(tRes.transactions || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = stocks.filter((s) =>
    s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selChange    = selectedStock ? selectedStock.currentPrice - (selectedStock.previousClose || selectedStock.currentPrice) : 0;
  const selChangePct = selectedStock?.previousClose ? (selChange / selectedStock.previousClose) * 100 : 0;

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-bg-secondary/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="badge-green text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Simulation Mode
            </div>
            <span className="text-slate-500 text-xs hidden sm:block">Virtual Trading Terminal — Not Real Money</span>
          </div>
          {portfolio?.summary && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">Portfolio: </span>
                <span className="text-white font-mono">₹{(portfolio.summary.portfolioValue/1000).toFixed(1)}K</span>
              </div>
              <div className={portfolio.summary.totalReturn >= 0 ? 'text-emerald-400' : 'text-coral-400'}>
                {portfolio.summary.totalReturn >= 0 ? '+' : ''}₹{portfolio.summary.totalReturn?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Stock list */}
          <div className="w-48 lg:w-56 border-r border-white/5 flex flex-col flex-shrink-0 bg-bg-secondary/30">
            <div className="p-2 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/40" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading
                ? <div className="p-4 space-y-2">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
                : filtered.map((s) => <StockRow key={s._id} stock={s} onSelect={setSelectedStock} isSelected={selectedStock?._id === s._id} />)
              }
            </div>
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Stock header */}
            {selectedStock && (
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-4 flex-shrink-0">
                <div className="text-3xl">{selectedStock.logoEmoji}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-white">{selectedStock.symbol}</span>
                    <span className="text-slate-500 text-sm hidden sm:inline">{selectedStock.name}</span>
                    <span className="badge-violet text-xs">{selectedStock.sector}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-2xl text-white">₹{selectedStock.currentPrice?.toLocaleString('en-IN')}</span>
                    <span className={`flex items-center gap-1 text-sm font-semibold ${selChange >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                      {selChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selChange >= 0 ? '+' : ''}{selChange.toFixed(2)} ({selChangePct >= 0 ? '+' : ''}{selChangePct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-white/5 flex-shrink-0">
              {[
                { id: 'chart',    label: 'Chart' },
                { id: 'order',    label: 'Trade' },
                { id: 'holdings', label: 'Holdings' },
                { id: 'history',  label: 'History' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === 'chart' && selectedStock && (
                <div>
                  <CandlestickChart stockId={selectedStock._id} />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                    {[
                      { label: 'P/E',       value: selectedStock.peRatio?.toFixed(1) },
                      { label: 'P/B',       value: selectedStock.pbRatio?.toFixed(1) },
                      { label: 'EPS',       value: `₹${selectedStock.eps?.toFixed(0)}` },
                      { label: 'Div Yield', value: `${selectedStock.dividendYield?.toFixed(1)}%` },
                      { label: 'D/E',       value: selectedStock.debtToEquity?.toFixed(1) },
                      { label: 'ROE',       value: `${selectedStock.roe?.toFixed(1)}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="glass-card p-3 text-center">
                        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                        <div className="text-sm font-semibold text-white">{value ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card p-4 mt-4">
                    <h4 className="font-semibold text-white text-sm mb-2">{selectedStock.name}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{selectedStock.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500">Fictional company. Educational simulation only.</span>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'order' && (
                <div className="max-w-sm">
                  <OrderForm stock={selectedStock} portfolio={portfolio?.portfolio}
                    onOrderPlaced={() => { loadPortfolio(); getOrders().then((d) => setOrders(d.orders || [])); }} />
                </div>
              )}

              {tab === 'holdings' && (
                <div>
                  {portfolio?.portfolio?.holdings?.length > 0 ? (
                    <div className="space-y-2">
                      {portfolio.portfolio.holdings.map((h) => (
                        <div key={h.symbol} className="glass-card p-4 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-white">{h.symbol}</div>
                            <div className="text-slate-500 text-xs">{h.quantity} shares @ ₹{h.averageBuyPrice?.toFixed(2)} avg</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-mono">₹{(h.quantity * h.currentPrice).toLocaleString()}</div>
                            <div className={`text-sm ${h.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                              {h.unrealizedPnL >= 0 ? '+' : ''}₹{h.unrealizedPnL?.toFixed(0)} ({h.unrealizedPnLPercent?.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No holdings. Place a buy order to get started.</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'history' && (
                <div>
                  {transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.map((txn) => (
                        <div key={txn._id} className="glass-card p-4 flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${txn.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-coral-500/10 text-coral-400'}`}>
                            {txn.side === 'buy' ? '▲' : '▼'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm">{txn.side === 'buy' ? 'Bought' : 'Sold'} {txn.quantity} {txn.symbol}</div>
                            <div className="text-slate-500 text-xs">@ ₹{txn.price?.toFixed(2)} · {new Date(txn.createdAt).toLocaleDateString()}</div>
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
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No transaction history yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
