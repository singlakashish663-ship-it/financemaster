import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Search, CheckCircle, XCircle,
  ChevronRight, RefreshCw, Flag, Lightbulb
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const CASES = [
  {
    id: 1, title: 'The Guaranteed Returns WhatsApp Group', emoji: '📱', difficulty: 'Easy',
    scenario: 'You receive a WhatsApp message from an unknown number: "Join our exclusive investment group! Our expert traders GUARANTEE 30% monthly returns with ZERO RISK. We\'ve already helped 5,000+ members become crorepatis! Limited slots — ₹10,000 minimum to join. Pay now before midnight tonight!"',
    clues: [
      { id: 'c1', text: 'Guarantees 30% monthly returns (360% annual)', isRedFlag: true, explanation: 'No legitimate investment guarantees returns. Even the best equity funds average 12–15% annually. 30% monthly is impossible to sustain.' },
      { id: 'c2', text: 'Claims "ZERO RISK"', isRedFlag: true, explanation: '"Zero risk" is mathematically impossible for any investment offering high returns. This is a deliberate lie.' },
      { id: 'c3', text: 'Creates artificial urgency ("before midnight")', isRedFlag: true, explanation: 'Legitimate investments don\'t disappear in hours. Urgency is a manipulation tactic to prevent critical thinking.' },
      { id: 'c4', text: 'Claims 5,000+ members are already earning', isRedFlag: true, explanation: 'Fake social proof is a classic Ponzi tactic. Earlier investors are paid using money from later investors, until it collapses.' },
      { id: 'c5', text: 'Arrived as unsolicited message from unknown number', isRedFlag: true, explanation: 'Legitimate financial advisors are SEBI-registered and don\'t cold-message strangers on WhatsApp.' },
      { id: 'c6', text: 'Requires minimum upfront payment', isRedFlag: true, explanation: 'Real investment accounts are opened through regulated brokers with proper documentation.' },
    ],
    correctAction: 'Block and report the number. Never invest.',
    lesson: 'This is a classic Ponzi scheme recruitment. Guaranteed returns, zero risk, urgency, and unsolicited contact are all bright red flags.',
  },
  {
    id: 2, title: 'The Dream Job Offer', emoji: '💼', difficulty: 'Medium',
    scenario: 'You see a LinkedIn ad: "Work from home — earn ₹50,000/month! No experience needed. Our company (registered in UK) is expanding to India. To get started, pay a ₹3,000 registration and training fee. You\'ll earn it back in your first week! 200 spots only." The website looks professional with stock photos.',
    clues: [
      { id: 'c1', text: 'Requires upfront payment to "get a job"', isRedFlag: true, explanation: 'Legitimate employers NEVER charge you to work for them. Any job requiring upfront fees is a scam.' },
      { id: 'c2', text: '"No experience needed" for ₹50,000/month', isRedFlag: true, explanation: '₹50,000/month for unskilled remote work is far above market rate.' },
      { id: 'c3', text: 'Stock photo website with vague company information', isRedFlag: true, explanation: 'Fraudsters buy professional website templates. Always verify: registration, physical address, and employee reviews.' },
      { id: 'c4', text: '"Registered in UK" but hiring in India', isRedFlag: true, explanation: 'Foreign registration makes legal action harder. Legitimate international companies hire through proper HR processes.' },
      { id: 'c5', text: '"200 spots only" — artificial scarcity', isRedFlag: true, explanation: 'Real employers don\'t have arbitrary spot caps for legitimate remote work.' },
      { id: 'c6', text: '"Earn it back in your first week" promise', isRedFlag: false, explanation: 'While suspicious in context, this alone is not a definitive red flag — but combined with others it confirms the pattern.' },
    ],
    correctAction: 'Do not pay. Report to cybercrime.gov.in.',
    lesson: 'This is a "job scam." The ₹3,000 upfront fee is the primary goal. Once paid, you\'ll receive nothing or be pressured to pay more.',
  },
  {
    id: 3, title: 'The Stock Tip Telegram Channel', emoji: '📊', difficulty: 'Medium',
    scenario: 'A Telegram channel with 45,000 subscribers posts: "🚀 INSIDER TIP: Buy SMALLTECHCO (BSE: 594XXX) NOW! Our sources confirm a major announcement in 48 hours. Target: 3x in 3 days. Share with friends to unlock our premium signals FREE for 30 days."',
    clues: [
      { id: 'c1', text: 'Claims "insider information"', isRedFlag: true, explanation: 'Trading on insider information is illegal (SEBI Act). If real, they are committing a crime — and so would you for acting on it.' },
      { id: 'c2', text: '3x return in 3 days prediction', isRedFlag: true, explanation: 'Predicting exact 3x returns in 3 days is not possible.' },
      { id: 'c3', text: 'Small, low-liquidity BSE stock', isRedFlag: true, explanation: 'Pump-and-dump schemes target illiquid small-cap stocks because small buying creates large price movements.' },
      { id: 'c4', text: '"Share with friends" to unlock rewards', isRedFlag: true, explanation: 'This is a pyramid mechanism — spreading the tip creates more buyers to push the price higher so organisers can sell.' },
      { id: 'c5', text: '45,000 subscribers gives false credibility', isRedFlag: true, explanation: 'Telegram subscribers can be purchased cheaply. Large follower counts are social proof manipulation.' },
      { id: 'c6', text: 'Premium signals "FREE for 30 days"', isRedFlag: true, explanation: 'The real business model is selling subscriptions or profiting from the price manipulation.' },
    ],
    correctAction: 'Do not buy the stock. Report the channel to SEBI at scores.sebi.gov.in.',
    lesson: 'This is a classic pump-and-dump scheme. Organisers buy cheaply, use the channel to drive buying, then sell — followers are left holding a worthless position.',
  },
  {
    id: 4, title: 'The Fake Bank KYC Call', emoji: '🏦', difficulty: 'Hard',
    scenario: 'You receive a call from "SBI Customer Care": "Your account will be suspended in 2 hours due to incomplete KYC. Please provide your OTP to verify your identity. If we don\'t update KYC now, your debit card will be blocked." The caller mentions your approximate account balance.',
    clues: [
      { id: 'c1', text: 'Asks for OTP over phone', isRedFlag: true, explanation: 'NO bank EVER asks for your OTP over phone. OTPs authenticate YOU to the bank, not the bank to you. Sharing it gives complete account access.' },
      { id: 'c2', text: 'Artificial urgency — "2 hours or suspended"', isRedFlag: true, explanation: 'Banks send multiple written notices before any account action. "2 hours" is designed to create panic.' },
      { id: 'c3', text: 'Inbound call (you didn\'t initiate it)', isRedFlag: true, explanation: 'For security-sensitive matters, always call the bank\'s official number yourself. Never trust inbound calls claiming to be your bank.' },
      { id: 'c4', text: 'Knows approximate account balance', isRedFlag: true, explanation: 'Scammers buy stolen data from breaches. Knowing partial information creates false trust — real bank staff would never use this to pressure you.' },
      { id: 'c5', text: 'Threatens account blockage if you don\'t comply', isRedFlag: true, explanation: 'Threats are a classic pressure tactic. Legitimate banks have formal processes — they don\'t call threatening immediate suspension.' },
      { id: 'c6', text: 'Phone number looks like a local mobile number', isRedFlag: true, explanation: 'Official SBI numbers are toll-free. Caller ID can be spoofed — even "SBI" can appear as caller name.' },
    ],
    correctAction: 'Hang up immediately. Call SBI on 1800-11-2211. Report to 1930 (Cyber Crime Helpline).',
    lesson: 'This is a "vishing" (voice phishing) attack. The golden rule: NEVER share OTPs, passwords, or account numbers over an inbound call.',
  },
];

function CaseInvestigation({ caseData, onComplete, onBack }) {
  const [found,     setFound]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score,     setScore]     = useState(0);

  const totalRedFlags = caseData.clues.filter((c) => c.isRedFlag).length;
  const foundRedFlags = caseData.clues.filter((c) => c.isRedFlag && found[c.id]).length;

  const toggle = (id) => { if (!submitted) setFound((f) => ({ ...f, [id]: !f[id] })); };

  const handleSubmit = () => {
    let pts = 0;
    caseData.clues.forEach((c) => {
      if (c.isRedFlag && found[c.id])   pts += 10;
      if (!c.isRedFlag && found[c.id])  pts -= 5;
      if (c.isRedFlag && !found[c.id])  pts -= 3;
    });
    setScore(Math.max(0, pts));
    setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost p-2"><ChevronRight className="w-5 h-5 rotate-180" /></button>
        <span className="text-2xl">{caseData.emoji}</span>
        <h2 className="font-display font-bold text-xl text-white">{caseData.title}</h2>
        <div className={`badge text-xs ml-auto ${caseData.difficulty === 'Easy' ? 'badge-green' : caseData.difficulty === 'Medium' ? 'badge-gold' : 'badge-coral'}`}>{caseData.difficulty}</div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-5 border border-gold-500/20">
            <div className="text-gold-400 text-sm font-semibold mb-3">🕵️ The Scenario</div>
            <p className="text-slate-300 leading-relaxed">{caseData.scenario}</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-semibold text-sm flex items-center gap-2"><Flag className="w-4 h-4 text-coral-400" />Identify the Red Flags</div>
              {!submitted && <span className="text-slate-500 text-xs">{foundRedFlags}/{totalRedFlags} found</span>}
            </div>
            <p className="text-slate-500 text-xs mb-4">Click each clue to mark it as a 🚩 red flag if suspicious.</p>

            <div className="space-y-2">
              {caseData.clues.map((clue) => {
                const isMarked = !!found[clue.id];
                let bgClass = 'bg-white/3 border-white/10';
                if (submitted) {
                  if (clue.isRedFlag && isMarked)        bgClass = 'bg-emerald-500/10 border-emerald-500/30';
                  else if (clue.isRedFlag && !isMarked)  bgClass = 'bg-coral-500/10 border-coral-500/20';
                  else if (!clue.isRedFlag && isMarked)  bgClass = 'bg-gold-500/10 border-gold-500/20';
                } else if (isMarked) {
                  bgClass = 'bg-violet-500/10 border-violet-500/30';
                }
                return (
                  <div key={clue.id}>
                    <button onClick={() => toggle(clue.id)} disabled={submitted}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${bgClass}`}>
                      <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-xs ${isMarked ? 'bg-coral-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                        {isMarked ? '🚩' : '○'}
                      </div>
                      <span className="text-sm text-slate-300">{clue.text}</span>
                      {submitted && clue.isRedFlag && isMarked  && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
                      {submitted && clue.isRedFlag && !isMarked && <XCircle    className="w-4 h-4 text-coral-400 ml-auto flex-shrink-0" />}
                    </button>
                    {submitted && (
                      <div className="ml-8 mt-1 text-xs text-slate-400 leading-relaxed pb-1">{clue.explanation}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {!submitted ? (
              <button onClick={handleSubmit} disabled={Object.keys(found).length === 0}
                className="btn-primary w-full justify-center mt-4 text-sm disabled:opacity-40">
                <Search className="w-4 h-4" /> Submit Investigation
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="glass-card p-4 border border-gold-500/20">
                  <div className="text-gold-400 text-sm font-semibold mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Correct Action</div>
                  <p className="text-emerald-300 text-sm font-medium">{caseData.correctAction}</p>
                </div>
                <div className="glass-card p-4"><p className="text-slate-300 text-sm leading-relaxed">{caseData.lesson}</p></div>
                <button onClick={() => onComplete(score)} className="btn-primary w-full justify-center text-sm">
                  Case Closed — Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!submitted ? (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Detective Checklist</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {['Is there guaranteed or unrealistic return?','Is there urgency or a deadline?','Is payment required upfront?','Did this arrive unsolicited?','Can you verify the source independently?','Are there verifiable credentials?'].map((check) => (
                  <li key={check} className="flex items-start gap-2"><div className="w-5 h-5 rounded border border-white/20 flex-shrink-0 mt-0.5" />{check}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="glass-card p-5 border border-violet-500/30 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-display font-bold text-3xl text-white">{score}</div>
              <div className="text-slate-400 text-sm">Investigation Score</div>
              <div className="mt-3 text-xs text-slate-500">
                {score >= 50 ? '🏅 Excellent detective work!' : score >= 30 ? '👍 Good instincts!' : '📚 Study the explanations to improve your skills.'}
              </div>
            </div>
          )}
          <div className="glass-card p-4 border border-emerald-500/20">
            <div className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4" />If in doubt…</div>
            <ul className="text-slate-400 text-xs space-y-1.5">
              <li>• Never share OTPs — with anyone, ever</li>
              <li>• Verify advisors at sebi.gov.in</li>
              <li>• Report cybercrime at cybercrime.gov.in</li>
              <li>• Call 1930 for financial cybercrime</li>
              <li>• Pause 24 hours before any financial decision</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScamDetectivePage() {
  const [selected,  setSelected]  = useState(null);
  const [completed, setCompleted] = useState({});

  const totalScore = Object.values(completed).reduce((s, v) => s + v, 0);

  return (
    <AppLayout>
      <div className="section-container py-8">
        {!selected ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-display font-bold text-3xl text-white mb-2">🔍 Scam Detective</h1>
                  <p className="text-slate-400 max-w-2xl">Investigate fictional financial scams. Identify red flags, understand the tactics, and build the skills to protect yourself and others.</p>
                  <div className="badge-violet mt-2 inline-flex">All scenarios are fictional educational simulations</div>
                </div>
                {Object.keys(completed).length > 0 && (
                  <div className="glass-card p-4 text-center">
                    <div className="font-display font-bold text-2xl text-violet-400">{totalScore}</div>
                    <div className="text-slate-500 text-xs">Total Score</div>
                    <div className="text-slate-400 text-sm">{Object.keys(completed).length}/{CASES.length} cases solved</div>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {CASES.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div className="relative glass-card-hover p-5 cursor-pointer" onClick={() => setSelected(c)}>
                    {completed[c.id] !== undefined && (
                      <div className="absolute top-3 right-3 badge-green text-xs">✓ Solved — {completed[c.id]} pts</div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <span className={`badge text-xs ${c.difficulty === 'Easy' ? 'badge-green' : c.difficulty === 'Medium' ? 'badge-gold' : 'badge-coral'}`}>{c.difficulty}</span>
                    </div>
                    <h3 className="font-display font-semibold text-white mb-1">{c.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{c.scenario.substring(0, 100)}…</p>
                    <div className="flex items-center gap-1 text-violet-400 text-sm mt-3 font-medium">
                      Investigate <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <CaseInvestigation
            caseData={selected}
            onComplete={(score) => { setCompleted((c) => ({ ...c, [selected.id]: score })); setSelected(null); }}
            onBack={() => setSelected(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
