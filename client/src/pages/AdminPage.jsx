import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart2, Map, Users, Shield, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then((d) => setStats(d.analytics)).catch(() => {}); }, []);
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-white mb-6">Admin Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',  value: stats?.totalUsers  ?? '—', color: 'violet' },
          { label: 'Worlds',       value: stats?.totalWorlds ?? '—', color: 'cyan' },
          { label: 'Missions',     value: stats?.totalMissions ?? '—', color: 'green' },
          { label: 'Active Stocks',value: stats?.totalStocks ?? '—', color: 'gold' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`glass-card p-5 border border-${color}-500/20`}>
            <div className={`font-display font-bold text-2xl text-${color}-400`}>{value}</div>
            <div className="text-slate-500 text-sm">{label}</div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6 border border-gold-500/20">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-gold-400" />Admin Notes</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'All admin endpoints require authentication + admin role (server-side check)',
            'Run npm run seed --workspace=server to populate worlds, missions, stocks, and quests',
            'Set ADMIN_EMAIL in .env — that user gets admin role automatically on first login',
            'API routes: GET/POST/PATCH /api/v1/admin/worlds, /missions, /stocks, /users, /audit-logs',
          ].map((note) => (
            <li key={note} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/admin/users').then((d) => setUsers(d.users || [])).catch(() => {}); }, []);
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-white mb-6">Users ({users.length})</h2>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">{['Username','Email','Level','XP','Role','Joined'].map((h) => <th key={h} className="px-4 py-3 text-slate-500 text-left text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-4 py-2.5 text-white font-medium">{u.username}</td>
                <td className="px-4 py-2.5 text-slate-400">{u.email}</td>
                <td className="px-4 py-2.5 text-cyan-400">{u.level}</td>
                <td className="px-4 py-2.5 text-gold-400">{u.xp?.toLocaleString()}</td>
                <td className="px-4 py-2.5"><span className={`badge text-xs ${u.role === 'admin' ? 'badge-coral' : 'badge-violet'}`}>{u.role}</span></td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="text-center py-8 text-slate-500">No users found. Make sure the backend server is running.</p>}
      </div>
    </div>
  );
}

function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/admin/audit-logs').then((d) => setLogs(d.logs || [])).catch(() => {}); }, []);
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-white mb-6">Audit Log</h2>
      <div className="space-y-2">
        {logs.slice(0, 50).map((log) => (
          <div key={log._id} className="glass-card p-3 flex items-center gap-3 text-sm">
            <div className="badge-violet text-xs w-40 truncate flex-shrink-0">{log.action}</div>
            <div className="text-slate-400 text-xs flex-1 truncate">{log.userId?.username || 'system'}</div>
            <div className="text-slate-600 text-xs flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? 'bg-emerald-400' : 'bg-coral-400'}`} />
          </div>
        ))}
        {!logs.length && <p className="text-center py-8 text-slate-500">No audit logs found.</p>}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { path: '',     label: 'Overview',  icon: BarChart2 },
  { path: 'users', label: 'Users',   icon: Users },
  { path: 'audit', label: 'Audit Log', icon: Shield },
];

export default function AdminPage() {
  const { userProfile } = useAuth();
  const location = useLocation();

  if (userProfile?.role !== 'admin') return (
    <AppLayout>
      <div className="section-container py-16 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-coral-400/40" />
        <h2 className="font-display font-bold text-2xl text-white mb-2">Admin Access Only</h2>
        <p className="text-slate-400">Set ADMIN_EMAIL in your .env to grant access.</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="section-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-coral-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Protected area — admin only</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = path === '' ? location.pathname === '/admin' : location.pathname.includes(`/admin/${path}`);
            return (
              <Link key={path} to={`/admin${path ? '/'+path : ''}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${active ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </div>

        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="audit" element={<AdminAuditLog />} />
        </Routes>
      </div>
    </AppLayout>
  );
}
