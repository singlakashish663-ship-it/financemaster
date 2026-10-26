import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const FREE_FEATURES    = ['Core finance curriculum (Worlds 1–3)','Money fundamentals, budgeting, savings','Introductory platformer game (Level 1–2)','Daily learning challenges','Budget, compound interest & EMI calculators','Stock Market Academy Levels 1–3','Limited paper-trading (3 stocks)','Basic leaderboard','Achievement system'];
const PREMIUM_FEATURES = ['Everything in Free','All 10 financial adventure worlds','Full Stock Market Academy (all 10 levels)','Advanced simulations & valuation workshop','Market Psychology Arena','Full virtual trading terminal (all stocks)','Advanced portfolio analysis and reports','Market event simulator','Budget simulator (12 months)','Scam Detective (all 4 cases)','Entrepreneur Tycoon simulation','Personalized weekly learning plans','Inflation & investment return calculators','Priority support','Exclusive cosmetic rewards','Ad-free experience'];

const FAQ = [
  { q: 'Can I try Premium before paying?',   a: 'Yes — all free content is permanently available. Some premium modules offer a preview lesson before requiring a subscription.' },
  { q: 'Is this real financial advice?',      a: 'No. FinanceQuest is an educational simulation platform. Nothing constitutes financial, investment, or tax advice.' },
  { q: 'Is the virtual money real?',          a: 'No. All virtual currencies and paper-trading balances are entirely fictional with no real-world cash value.' },
  { q: 'Can I cancel anytime?',               a: 'Yes. Subscriptions can be cancelled at any time. You retain access until the end of your billing period.' },
  { q: 'Is there a student discount?',        a: 'Contact us at support@financequest.app with a valid student ID for details.' },
];

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const monthly  = 299;
  const annual   = Math.round(monthly * 12 * 0.8);
  const perMonth = Math.round(annual / 12);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="section-container pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="badge-violet mx-auto mb-4">Simple, Transparent Pricing</div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
            Start Free. Go Deeper with <span className="gradient-text">Premium.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Essential financial education is always free. Premium unlocks the complete adventure.</p>
        </motion.div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            {['monthly','annual'].map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${billing === b ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {b} {b === 'annual' && <span className="ml-1 badge-green text-xs">Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* Free */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-8 border border-white/10">
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Free</h2>
              <div className="flex items-baseline gap-1"><span className="font-display font-extrabold text-4xl text-white">₹0</span><span className="text-slate-500">/ forever</span></div>
              <p className="text-slate-400 text-sm mt-2">No credit card required. No expiry.</p>
            </div>
            <ul className="space-y-2.5 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <Link to="/register" className="btn-secondary w-full justify-center">Get Started Free</Link>
          </motion.div>

          {/* Premium */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-8 border border-violet-500/50 shadow-glow-sm relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="badge-gold text-xs px-4 py-1 flex items-center gap-1"><Star className="w-3 h-3" />Most Popular</span>
            </div>
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Premium</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-4xl text-white">₹{billing === 'annual' ? perMonth : monthly}</span>
                <span className="text-slate-500">/ month</span>
              </div>
              {billing === 'annual' && <p className="text-emerald-400 text-sm mt-1">₹{annual} billed annually — save ₹{monthly*12-annual}/year</p>}
            </div>
            <ul className="space-y-2.5 mb-8">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />{f}</li>
              ))}
            </ul>
            <div className="glass-card p-3 border border-gold-500/20 mb-4 text-xs text-gold-300/80 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              Payment integration is a placeholder. Configure RAZORPAY_KEY or STRIPE_SECRET_KEY in .env to enable real checkout.
            </div>
            <button disabled className="btn-primary w-full justify-center opacity-70 cursor-not-allowed">
              <Zap className="w-4 h-4" /> Subscribe — Coming Soon
            </button>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="glass-card p-5">
                <h3 className="font-semibold text-white mb-2 text-sm">{q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
