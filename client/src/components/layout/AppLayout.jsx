import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, BookOpen, TrendingUp, Calculator, Trophy,
  Gamepad2, User, Menu, ChevronRight, Zap, Flame, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/firebase';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',       icon: Home },
  { label: 'World Map',    href: '/worlds',           icon: Map },
  { label: 'Stock Academy',href: '/stock-academy',   icon: BookOpen },
  { label: 'Trading',      href: '/trading',          icon: TrendingUp },
  { label: 'Games',        href: '/games/platformer', icon: Gamepad2 },
  { label: 'Tools',        href: '/tools',            icon: Calculator },
  { label: 'Achievements', href: '/achievements',     icon: Trophy },
  { label: 'Profile',      href: '/profile',          icon: User },
];

function SidebarItem({ href, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      to={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
        active
          ? 'bg-violet-600/20 text-white border border-violet-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={clsx('w-5 h-5 flex-shrink-0', active ? 'text-violet-400' : 'group-hover:text-white')} />
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
      {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />}
    </Link>
  );
}

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); toast.success('Logged out'); navigate('/'); }
    catch { toast.error('Failed to log out'); }
  };

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  const SidebarContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center gap-2 p-4 mb-4', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M5 19L12 5L19 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 14H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="5" r="1.5" fill="#fbbf24"/>
          </svg>
        </div>
        {!collapsed && <span className="font-display font-bold text-white">FinanceQuest</span>}
      </div>

      {/* User info */}
      {!collapsed && userProfile && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
              {(userProfile.username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{userProfile.username}</div>
              <div className="text-slate-500 text-xs">Level {userProfile.level}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gold-400">
              <Zap className="w-3 h-3" /><span>{userProfile.xp} XP</span>
            </div>
            {userProfile.streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-3 h-3" /><span>{userProfile.streak}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-coral-400 hover:bg-coral-500/5 transition-all',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-bg-secondary/80 backdrop-blur-sm border-r border-white/5 transition-all duration-300 relative',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-4 -right-2.5 w-5 h-5 rounded-full bg-bg-card border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors z-10"
        >
          <ChevronRight className={clsx('w-3 h-3 transition-transform', sidebarCollapsed ? '' : 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-bg-secondary z-50 lg:hidden"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M5 19L12 5L19 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-sm">FinanceQuest</span>
          </div>
          {userProfile && (
            <div className="flex items-center gap-1 text-gold-400 text-sm font-semibold">
              <Zap className="w-4 h-4" />{userProfile.xp}
            </div>
          )}
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center border-t border-white/5 bg-bg-secondary/90 backdrop-blur-sm h-16 flex-shrink-0">
          {[
            { href: '/dashboard',     icon: Home,       label: 'Home' },
            { href: '/worlds',        icon: Map,        label: 'Worlds' },
            { href: '/stock-academy', icon: BookOpen,   label: 'Academy' },
            { href: '/trading',       icon: TrendingUp, label: 'Trade' },
            { href: '/profile',       icon: User,       label: 'Profile' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} to={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
                isActive(href) ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
