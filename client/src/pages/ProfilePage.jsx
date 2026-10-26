import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Edit2, Save, X, Shield, Trash2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile as updateApiProfile, exportData } from '../services/api';
import { updateUserProfile, changePassword } from '../services/firebase';
import AppLayout from '../components/layout/AppLayout';
import toast from 'react-hot-toast';

const AVATAR_OPTIONS = [
  { id: 'explorer', emoji: '🧭', name: 'Explorer'  },
  { id: 'investor', emoji: '📈', name: 'Investor'  },
  { id: 'scholar',  emoji: '📚', name: 'Scholar'   },
  { id: 'trader',   emoji: '⚡', name: 'Trader'    },
  { id: 'creator',  emoji: '🚀', name: 'Creator'   },
  { id: 'guardian', emoji: '🛡️', name: 'Guardian'  },
];

export default function ProfilePage() {
  const { userProfile, firebaseUser, refreshProfile } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ displayName: '', bio: '', avatar: 'explorer' });
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('profile');
  const [pwForm,   setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwLoad,   setPwLoad]   = useState(false);

  useEffect(() => {
    if (userProfile) setForm({ displayName: userProfile.displayName || '', bio: userProfile.bio || '', avatar: userProfile.avatar || 'explorer' });
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApiProfile(form);
      await updateUserProfile({ displayName: form.displayName });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwLoad(true);
    try { await changePassword(pwForm.current, pwForm.next); toast.success('Password changed!'); setPwForm({ current: '', next: '', confirm: '' }); }
    catch (err) { toast.error(err.code === 'auth/wrong-password' ? 'Current password is incorrect' : 'Password change failed'); }
    finally { setPwLoad(false); }
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'financequest-data.json'; a.click();
      toast.success('Data exported!');
    } catch { toast.error('Export failed'); }
  };

  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === (editing ? form.avatar : userProfile?.avatar)) || AVATAR_OPTIONS[0];

  return (
    <AppLayout>
      <div className="section-container py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="glass-card p-6 mb-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-4xl shadow-glow-sm">
              {currentAvatar.emoji}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-white">{userProfile?.displayName || userProfile?.username}</h1>
              <p className="text-slate-400 text-sm">@{userProfile?.username}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-violet text-xs">Level {userProfile?.level}</span>
                <span className="text-gold-400 text-xs font-semibold">{userProfile?.xp?.toLocaleString()} XP</span>
                {userProfile?.isPremium && <span className="badge-gold text-xs">Premium</span>}
              </div>
            </div>
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn-ghost text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
              : <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                    {saving ? '…' : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                </div>
            }
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }, { id: 'data', label: 'Data & Privacy' }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <div className="glass-card p-6 space-y-5">
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((a) => (
                      <button key={a.id} onClick={() => setForm((f) => ({ ...f, avatar: a.id }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${form.avatar === a.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20'}`}>
                        <div className="text-2xl">{a.emoji}</div>
                        <div className="text-xs text-slate-400 mt-1">{a.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
                {editing
                  ? <input type="text" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className="input-field text-sm" />
                  : <p className="text-slate-300 text-sm">{userProfile?.displayName || <span className="text-slate-600">Not set</span>}</p>
                }
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                {editing
                  ? <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} maxLength={200} rows={3} className="input-field resize-none text-sm" />
                  : <p className="text-slate-300 text-sm">{userProfile?.bio || <span className="text-slate-600">Not set</span>}</p>
                }
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</label>
                <p className="text-slate-400 text-sm">{firebaseUser?.email}</p>
                {!firebaseUser?.emailVerified && <p className="text-gold-400 text-xs mt-1">⚠️ Email not verified. Check your inbox.</p>}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2"><Shield className="w-5 h-5 text-violet-400" /> Change Password</h3>
              {firebaseUser?.providerData?.[0]?.providerId === 'google.com'
                ? <p className="text-slate-400 text-sm">You signed in with Google. Password management is handled through your Google account.</p>
                : (
                  <form onSubmit={handlePw} className="space-y-4">
                    {[{ label: 'Current Password', key: 'current' }, { label: 'New Password', key: 'next' }, { label: 'Confirm New Password', key: 'confirm' }].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
                        <input type="password" value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))} className="input-field text-sm" autoComplete="off" />
                      </div>
                    ))}
                    <button type="submit" disabled={pwLoad} className="btn-primary text-sm disabled:opacity-60">
                      {pwLoad ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                )
              }
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Download className="w-4 h-4 text-cyan-400" />Export Your Data</h3>
                <p className="text-slate-400 text-sm mb-4">Download a copy of your learning progress, preferences, and portfolio history.</p>
                <button onClick={handleExport} className="btn-secondary text-sm"><Download className="w-4 h-4" /> Export Data</button>
              </div>
              <div className="glass-card p-6 border border-coral-500/20">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4 text-coral-400" />Delete Account</h3>
                <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                <button onClick={() => toast.error('Use the API endpoint DELETE /api/v1/auth/account or contact support.')} className="btn-danger text-sm">
                  <Trash2 className="w-4 h-4" /> Delete My Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
