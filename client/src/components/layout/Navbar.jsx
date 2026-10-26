import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Zap, Map, BookOpen, Gamepad2, Calculator,
  Trophy, CreditCard, LogIn, User, LogOut, ChevronDown,
  Bell, Settings, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/firebase';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { label: 'Explore Worlds', href: '/worlds', icon: Map },
  { label: 'Stock Academy', href: '/stock-academy', icon: BookOpen },
  { label: 'Games', href: '/games/platformer', icon: Gamepad2 },
  { label: 'Financial Tools', href: '/tools', icon: Calculator },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Pricing', href: '/pricing', icon: CreditCard },
];

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isAuthenticated, userProfile, firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  const navClass = clsx(
    'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
    scrolled || !transparent
      ? 'bg-bg-primary/90 backdrop-blur-md border-b border-white/5 shadow-lg'
      : 'bg-transparent'
  );

  return (
    <nav className={navClass} role="navigation" aria-label="Main navigation">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="FinanceQuest Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M5 19L12 5L19 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="5" r="1.5" fill="#fbbf24"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white">FinanceQuest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(href)
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-ghost text-sm py-1.5">
                  <Zap className="w-4 h-4 text-gold-400" />
                  <span className="text-gold-400 font-semibold">{userProfile?.xp ?? 0} XP</span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                      {(firebaseUser?.displayName || firebaseUser?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-medium max-w-24 truncate">
                      {userProfile?.username || firebaseUser?.displayName || 'Player'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 shadow-card-hover overflow-hidden"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white font-semibold text-sm truncate">
                            {userProfile?.username || firebaseUser?.displayName}
                          </p>
                          <p className="text-slate-500 text-xs truncate">{firebaseUser?.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { label: 'Dashboard', href: '/dashboard', icon: Zap },
                            { label: 'Profile', href: '/profile', icon: User },
                            { label: 'Achievements', href: '/achievements', icon: Trophy },
                            { label: 'Settings', href: '/profile#settings', icon: Settings },
                            ...(userProfile?.role === 'admin' ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
                          ].map(({ label, href, icon: Icon }) => (
                            <Link
                              key={href}
                              to={href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                              role="menuitem"
                            >
                              <Icon className="w-4 h-4 text-slate-500" />
                              {label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-white/10 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-coral-400 hover:text-coral-300 hover:bg-coral-500/5 transition-colors"
                            role="menuitem"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Start Your Adventure
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-bg-primary/95 backdrop-blur-md"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive(href)
                      ? 'text-white bg-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="btn-secondary text-sm justify-center">Dashboard</Link>
                    <button onClick={handleLogout} className="btn-danger text-sm justify-center">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary text-sm justify-center">Sign In</Link>
                    <Link to="/register" className="btn-primary text-sm justify-center">Start Your Adventure</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
