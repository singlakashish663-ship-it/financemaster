import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '../../services/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M5 19L12 5L19 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="5" r="1.5" fill="#fbbf24"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white">FinanceQuest</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Reset your password</h1>
          <p className="text-slate-400 text-sm">We'll send a reset link to your email</p>
        </div>

        <div className="glass-card border border-white/10 p-8">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="font-display font-bold text-lg text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link to <span className="text-white">{email}</span>
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-300 text-sm mb-6">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 mt-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
