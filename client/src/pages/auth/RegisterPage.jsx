import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { registerWithEmail, loginWithGoogle } from '../../services/firebase';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['bg-coral-500', 'bg-gold-500', 'bg-gold-400', 'bg-emerald-500', 'bg-emerald-400'];

function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = passwordStrength(form.password);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.displayName.trim()) return 'Please enter your name.';
    if (!form.email) return 'Please enter your email.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(form.email, form.password, form.displayName.trim());
      toast.success('Account created! Please verify your email.');
      navigate('/onboarding');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 8 characters.'
        : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      toast.success('Account created with Google!');
      navigate('/onboarding');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 py-12">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
          <h1 className="font-display font-bold text-2xl text-white mb-2">Start your adventure</h1>
          <p className="text-slate-400 text-sm">Create a free account and begin your financial journey</p>
        </div>

        <div className="glass-card border border-white/10 p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-300 text-sm mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 active:scale-95 transition-all duration-200 mb-6 disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? 'Creating account...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1.5">Your name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="Adventurer's name"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength - 1 ? STRENGTH_COLORS[strength] : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{STRENGTH_LABELS[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="confirm"
                  name="confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="input-field pl-10 pr-10"
                  required
                />
                {form.confirm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirm
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <AlertCircle className="w-4 h-4 text-coral-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-violet-400 hover:text-violet-300">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
