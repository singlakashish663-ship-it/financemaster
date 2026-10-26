import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Play, TrendingUp, Shield, BookOpen, Gamepad2,
  Trophy, Star, CheckCircle, ChevronDown, Zap, Target,
  BarChart3, Globe, Users, Award, ChevronRight, ChevronLeft,
  Lock, Sparkles, Brain, DollarSign, PieChart, LineChart, Calculator
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { WORLDS } from '../data/worlds';

// ---- Animated Counter ----
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ---- Floating Coin ----
function FloatingCoin({ style, delay = 0 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={style}
      animate={{ y: [-15, 15, -15], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow-gold border-2 border-gold-300/30">
        <span className="text-navy-900 font-bold text-sm">₹</span>
      </div>
    </motion.div>
  );
}

// ---- Hero Section ----
function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const y2 = useTransform(scrollY, [0, 500], [0, -40]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Parallax orbs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      {/* Floating coins */}
      <FloatingCoin style={{ top: '20%', left: '12%' }} delay={0} />
      <FloatingCoin style={{ top: '35%', right: '15%' }} delay={1.5} />
      <FloatingCoin style={{ bottom: '30%', left: '18%' }} delay={0.8} />
      <FloatingCoin style={{ top: '60%', right: '10%' }} delay={2.2} />

      {/* Hero content */}
      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            New: Stock Market Academy is Live!
            <ArrowRight className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Your Money Journey
            <br />
            <span className="gradient-text">Starts Here.</span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Learn budgeting, investing, stock markets, and money management by playing your way through extraordinary financial adventures.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-2xl shadow-glow-md group">
              <Gamepad2 className="w-5 h-5" />
              Start Playing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/stock-academy" className="btn-secondary text-base px-8 py-4 rounded-2xl group">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Explore the Stock Market
            </Link>
          </div>

          {/* Live stats preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: 'Financial Worlds', value: 10, suffix: '' },
              { label: 'Learning Missions', value: 100, suffix: '+' },
              { label: 'Academy Levels', value: 10, suffix: '' },
              { label: 'Virtual Portfolio', value: 100000, prefix: '₹', suffix: '' },
            ].map(({ label, value, prefix, suffix }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className="font-display font-bold text-2xl text-white">
                  <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
                </div>
                <div className="text-slate-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Ticker Tape ----
function TickerTape() {
  const items = [
    { name: 'NovaTech', price: '₹2,847', change: '+3.2%', up: true },
    { name: 'GrowthBank', price: '₹1,234', change: '-1.1%', up: false },
    { name: 'EcoEnergy', price: '₹567', change: '+5.8%', up: true },
    { name: 'UrbanRetail', price: '₹890', change: '+0.9%', up: true },
    { name: 'HealthFirst', price: '₹3,456', change: '-0.4%', up: false },
    { name: 'TechVenture', price: '₹1,890', change: '+2.1%', up: true },
    { name: 'MetalCorp', price: '₹456', change: '-2.3%', up: false },
    { name: 'FoodBasket', price: '₹234', change: '+1.7%', up: true },
  ];

  const doubled = [...items, ...items];

  return (
    <div className="bg-bg-secondary/50 border-y border-white/5 py-3 overflow-hidden" aria-label="Simulated stock ticker">
      <div className="badge-violet text-xs px-3 mr-4 inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        SIMULATION MODE
      </div>
      <div className="ticker-wrap inline-block w-full">
        <div className="ticker-inner gap-8">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mr-8 text-sm">
              <span className="text-slate-400 font-medium">{item.name}</span>
              <span className="text-white font-mono">{item.price}</span>
              <span className={`font-medium ${item.up ? 'text-emerald-400' : 'text-coral-400'}`}>
                {item.change}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- World Preview ----
function WorldsSection() {
  const [active, setActive] = useState(0);
  const worlds = WORLDS.slice(0, 6);

  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-violet mx-auto mb-4">10 Financial Worlds</div>
          <h2 className="section-title mb-4">Explore the Financial Worlds</h2>
          <p className="section-subtitle mx-auto text-center">
            Journey through beautifully crafted worlds, each teaching a complete financial topic through story, gameplay, and simulation.
          </p>
        </motion.div>

        {/* World tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {worlds.map((world, i) => (
            <button
              key={world.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === i
                  ? 'bg-violet-600 text-white shadow-glow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {world.emoji} {world.name}
            </button>
          ))}
        </div>

        {/* Active world card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            {/* World visual */}
            <div
              className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-white/10"
              style={{ background: worlds[active].gradient }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">{worlds[active].emoji}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-slate-300">{worlds[active].missionCount} missions available</span>
                </div>
              </div>
            </div>

            {/* World info */}
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">{worlds[active].name}</h3>
              <p className="text-slate-400 mb-6">{worlds[active].description}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {worlds[active].topics.slice(0, 4).map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {topic}
                  </div>
                ))}
              </div>
              <Link
                to={`/worlds`}
                className="btn-primary"
              >
                Start World {active + 1}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ---- Features Section ----
function FeaturesSection() {
  const features = [
    {
      icon: Gamepad2,
      color: 'violet',
      title: 'Mario-Style Platformer',
      desc: 'Jump, collect coins, and make real financial decisions in a fully playable side-scroller. Each level teaches a new money concept through gameplay.',
      link: '/games/platformer',
    },
    {
      icon: BarChart3,
      color: 'cyan',
      title: 'Stock Market Academy',
      desc: 'From absolute beginner to advanced concepts — 10 complete learning levels with interactive chart labs, company analysis, and order book simulators.',
      link: '/stock-academy',
    },
    {
      icon: TrendingUp,
      color: 'emerald',
      title: 'Virtual Trading Terminal',
      desc: 'Practice with ₹1,00,000 in virtual money. Place buy/sell orders, track your portfolio, and learn from real market scenarios — risk free.',
      link: '/trading',
    },
    {
      icon: PieChart,
      color: 'gold',
      title: 'Budget Simulator',
      desc: 'Manage a fictional monthly salary across 12 months. Make housing, food, transport, and savings decisions and see long-term consequences.',
      link: '/budget-simulator',
    },
    {
      icon: Brain,
      color: 'coral',
      title: 'Scam Detective',
      desc: 'Investigate fictional financial scams, identify red flags in fake investment offers, and build the skills to protect yourself and others.',
      link: '/scam-detective',
    },
    {
      icon: Calculator,
      color: 'violet',
      title: 'Financial Calculators',
      desc: 'EMI, compound interest, inflation, SIP returns — fully working calculators with explanations, amortization schedules, and charts.',
      link: '/tools',
    },
  ];

  const colorMap = {
    violet: 'from-violet-600 to-violet-400 shadow-glow-sm',
    cyan: 'from-cyan-600 to-cyan-400 shadow-glow-cyan',
    emerald: 'from-emerald-600 to-emerald-400 shadow-glow-green',
    gold: 'from-gold-600 to-gold-400 shadow-glow-gold',
    coral: 'from-coral-600 to-coral-400',
  };
  const bgMap = {
    violet: 'bg-violet-500/10 border-violet-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    gold: 'bg-gold-500/10 border-gold-500/20',
    coral: 'bg-coral-500/10 border-coral-500/20',
  };

  return (
    <section className="section-padding bg-bg-secondary/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-cyan mx-auto mb-4">Everything in One Place</div>
          <h2 className="section-title mb-4">One Platform. Complete Financial Education.</h2>
          <p className="section-subtitle mx-auto text-center">
            FinanceQuest brings together games, simulations, real market education, and practical tools — all designed to make you financially confident.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc, link }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={link}
                className={`glass-card-hover p-6 flex flex-col gap-4 h-full border ${bgMap[color]}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-sm font-medium text-violet-400">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Stock Academy Preview ----
function StockAcademySection() {
  const levels = [
    { num: 1, title: 'Stock Market Fundamentals', desc: 'What is a share, stock exchanges, IPOs, market cap', icon: '🏛️', free: true },
    { num: 2, title: 'How Trading Works', desc: 'Demat accounts, order types, bid-ask, settlement', icon: '⚖️', free: true },
    { num: 3, title: 'Candlestick Chart Masterclass', desc: 'OHLC, patterns, indicators, chart lab', icon: '📊', free: true },
    { num: 4, title: 'Fundamental Analysis', desc: 'P/E, P/B, EPS, balance sheets, company comparison', icon: '🔍', free: false },
    { num: 5, title: 'Investing vs Trading', desc: 'Long-term, swing, intraday, emotional discipline', icon: '⚡', free: false },
    { num: 6, title: 'Valuation Workshop', desc: 'Intrinsic value, margin of safety, DCF concepts', icon: '🎯', free: false },
    { num: 7, title: 'Technical Analysis', desc: 'MA, RSI, MACD, volume, pattern identification', icon: '📈', free: false },
    { num: 8, title: 'Mutual Funds & Index Investing', desc: 'SIP, NAV, expense ratios, ETFs, compounding', icon: '🏦', free: false },
    { num: 9, title: 'Derivatives & Advanced Concepts', desc: 'Futures, options, hedging, payoff diagrams', icon: '🔮', free: false },
    { num: 10, title: 'Market Psychology & Risk', desc: 'Fear, greed, FOMO, position sizing, fraud prevention', icon: '🧠', free: false },
  ];

  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge-gold mb-4">Complete Curriculum</div>
            <h2 className="section-title mb-4">
              The Stock Market Academy
            </h2>
            <p className="section-subtitle mb-8">
              10 complete learning levels take you from "what is a share?" to understanding derivatives, market psychology, and long-term wealth building.
            </p>
            <div className="flex gap-4">
              <Link to="/stock-academy" className="btn-primary">
                <BookOpen className="w-5 h-5" /> Enter Academy
              </Link>
              <Link to="/trading" className="btn-secondary">
                <TrendingUp className="w-4 h-4" /> Paper Trading
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-2"
          >
            {levels.map((level, i) => (
              <motion.div
                key={level.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-sm font-game text-violet-400 font-bold flex-shrink-0">
                  {level.num}
                </div>
                <span className="text-xl">{level.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{level.title}</div>
                  <div className="text-xs text-slate-500 truncate">{level.desc}</div>
                </div>
                {level.free ? (
                  <span className="badge-green text-xs flex-shrink-0">Free</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Gamification Preview ----
function GamificationSection() {
  return (
    <section className="section-padding bg-bg-secondary/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-gold mx-auto mb-4">Earn While You Learn</div>
          <h2 className="section-title mb-4">Your Progress, Rewarded</h2>
          <p className="section-subtitle mx-auto text-center">
            Every lesson, game, and simulation earns you XP, badges, and cosmetics. Compete on leaderboards and celebrate milestones.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, color: 'gold', title: 'Earn XP', desc: 'Level up by completing missions, games, and stock market challenges.', emoji: '⚡' },
            { icon: Award, color: 'violet', title: 'Unlock Badges', desc: 'Over 50 unique achievement badges for financial milestones.', emoji: '🏅' },
            { icon: Trophy, color: 'cyan', title: 'Leaderboards', desc: 'Compete with learners across daily, weekly, and world-specific boards.', emoji: '🏆' },
            { icon: Star, color: 'emerald', title: 'Daily Quests', desc: 'Fresh challenges every day keep learning engaging and habitual.', emoji: '⭐' },
          ].map(({ icon: Icon, color, title, desc, emoji }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="font-display font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Calculators Preview ----
function CalculatorsSection() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = principal * Math.pow(1 + rate / 100, years);
  const growth = result - principal;

  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge-green mb-4">Interactive Calculators</div>
            <h2 className="section-title mb-4">
              Real Numbers, Real Understanding
            </h2>
            <p className="section-subtitle mb-8">
              Try our compound interest calculator right now. Then explore EMI calculations, inflation adjustments, savings goals, and investment return projections.
            </p>
            <Link to="/tools" className="btn-primary">
              <Calculator className="w-5 h-5" /> Open All Calculators
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-semibold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold-400" />
              Compound Interest Calculator
              <span className="badge-green text-xs ml-auto">Live Preview</span>
            </h3>

            <div className="space-y-5">
              {[
                { label: `Principal: ₹${principal.toLocaleString()}`, value: principal, setter: setPrincipal, min: 1000, max: 1000000, step: 1000 },
                { label: `Annual Return: ${rate}%`, value: rate, setter: setRate, min: 1, max: 30, step: 1 },
                { label: `Duration: ${years} years`, value: years, setter: setYears, min: 1, max: 40, step: 1 },
              ].map(({ label, value, setter, min, max, step }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>{label}</span>
                  </div>
                  <input
                    type="range"
                    min={min} max={max} step={step}
                    value={value}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="w-full accent-violet-500 h-2 rounded-full"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 text-xs">Future Value</div>
                  <div className="font-display font-bold text-xl text-emerald-400">
                    ₹{Math.round(result).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Total Growth</div>
                  <div className="font-display font-bold text-xl text-gold-400">
                    ₹{Math.round(growth).toLocaleString()}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                * Hypothetical illustration only. Actual returns vary and are not guaranteed.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Pricing Section ----
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      color: 'border-white/10',
      badge: null,
      features: [
        'Core finance curriculum',
        'Worlds 1–3 (Coin Valley, Budget City, Savings Forest)',
        'Basic platformer levels',
        'Daily challenges',
        'Basic calculators',
        'Introductory Stock Market Academy (Levels 1–3)',
        'Limited paper-trading scenarios',
      ],
      cta: 'Start Free',
      href: '/register',
      primary: false,
    },
    {
      name: 'Premium',
      price: '₹299',
      period: 'per month',
      color: 'border-violet-500/50',
      badge: 'Most Popular',
      features: [
        'Everything in Free',
        'All 10 financial worlds',
        'Full Stock Market Academy (all 10 levels)',
        'Advanced simulations & scenarios',
        'Advanced portfolio analysis',
        'Market event simulator',
        'Personalized learning plans',
        'Advanced financial reports',
        'Extra cosmetic rewards',
        'Priority support',
      ],
      cta: 'Start Premium',
      href: '/pricing',
      primary: true,
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-bg-secondary/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-violet mx-auto mb-4">Simple Pricing</div>
          <h2 className="section-title mb-4">Start Free. Go Deeper with Premium.</h2>
          <p className="section-subtitle mx-auto text-center">
            Essential financial education is always free. Premium unlocks the complete adventure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-card p-8 border ${plan.color} ${plan.primary ? 'shadow-glow-sm' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-violet text-xs px-4 py-1">{plan.badge}</span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl text-white">{plan.price}</span>
                  <span className="text-slate-500">/{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={plan.primary ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- FAQ ----
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Is FinanceQuest suitable for beginners?', a: 'Absolutely. FinanceQuest starts from "what is money?" and gradually builds to advanced stock market concepts. The onboarding process customizes your learning path based on your current knowledge.' },
    { q: 'Is the virtual money real?', a: 'No. All virtual money, paper trading balances, and in-game coins are entirely fictional and used only for learning purposes. They have no real-world cash value and cannot be withdrawn or transferred.' },
    { q: 'Does the Stock Market Academy use real stock prices?', a: 'By default, all prices are synthetic simulation data clearly labeled as "Simulation Mode." The academy teaches using fictional companies and reproducible datasets. Real market data integration is available as an optional configuration.' },
    { q: 'Are the financial calculators accurate?', a: 'The calculators use standard financial formulas (compound interest, EMI amortization, inflation adjustment) and are tested for accuracy. All results clearly indicate that inputs are assumptions and past performance does not guarantee future results.' },
    { q: 'What age group is FinanceQuest designed for?', a: 'FinanceQuest is designed for anyone from age 14 upward — school learners, college students, first-job professionals, and adult beginners. Learning paths and difficulty adjust to your experience level.' },
    { q: 'Can I delete my account and data?', a: 'Yes. You can request full account deletion and data export from your profile settings. Your personal financial records and learning data will be permanently removed.' },
  ];

  return (
    <section className="section-padding">
      <div className="section-container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card border border-white/10 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg-secondary/50">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M5 19L12 5L19 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="12" cy="5" r="1.5" fill="#fbbf24"/>
                </svg>
              </div>
              <span className="font-display font-bold text-white">FinanceQuest</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Play Your Way to Financial Freedom.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Learn</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Explore Worlds', href: '/worlds' },
                { label: 'Stock Market Academy', href: '/stock-academy' },
                { label: 'Financial Tools', href: '/tools' },
                { label: 'Budget Simulator', href: '/budget-simulator' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Play */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Play</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Platformer Game', href: '/games/platformer' },
                { label: 'Paper Trading', href: '/trading' },
                { label: 'Scam Detective', href: '/scam-detective' },
                { label: 'Entrepreneur Tycoon', href: '/entrepreneur' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'Leaderboard', href: '/leaderboard' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Accessibility', href: '/accessibility' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © 2026 FinanceQuest. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Simulation Mode Active
            </span>
            <span>•</span>
            <span>Not financial advice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- Main Landing Page ----
export default function LandingPage() {
  return (
    <div className="relative">
      <Navbar transparent />
      <main>
        <HeroSection />
        <TickerTape />
        <WorldsSection />
        <FeaturesSection />
        <StockAcademySection />
        <GamificationSection />
        <CalculatorsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
