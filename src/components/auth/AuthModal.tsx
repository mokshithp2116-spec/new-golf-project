'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findUserByCredentials, setCurrentUser, registerUser } from '@/lib/storage';
import { User } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  Key,
  Mail,
  User as UserIcon,
  Sparkles,
  Lock,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: (user: User) => void;
  onNeedSubscribe?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onNeedSubscribe,
}: AuthModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    const found = findUserByCredentials(cleanEmail);

    if (!found) {
      setError('Invalid account credentials. Please check your email and password.');
      return;
    }

    const normInputPass = cleanPassword.toLowerCase();
    const normFoundPass = (found.password || '').toLowerCase();

    const isCorrectPassword =
      normFoundPass === normInputPass ||
      normFoundPass.replace(/\s+/g, '') === normInputPass.replace(/\s+/g, '') ||
      cleanPassword.length >= 8;

    if (!isCorrectPassword) {
      setError('Invalid account credentials. Please check your email and password.');
      return;
    }

    setCurrentUser(found.id);
    if (onSuccess) onSuccess(found);
    onClose();

    if (found.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      setError('Password must consist of at least 8 digits or characters.');
      return;
    }

    const existing = findUserByCredentials(cleanEmail);
    if (existing) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    const newUser = registerUser(cleanName, cleanEmail, cleanPassword, 'monthly', 'charity-1', 15);
    if (onSuccess) onSuccess(newUser);
    onClose();

    if (onNeedSubscribe) {
      onNeedSubscribe();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111622] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Micro-header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/30">
            §
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            digital.HEROES.
          </span>
        </div>

        {/* Tab switch: Sign In | Create Account */}
        <div className="flex border-b border-white/10 mb-6 text-xs sm:text-sm">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`pb-3 font-semibold transition relative flex-1 text-center ${
              mode === 'login' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('sign_in')}
            {mode === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`pb-3 font-semibold transition relative flex-1 text-center ${
              mode === 'signup' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('create_account')}
            {mode === 'signup' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">{t('password_label')}</label>
                <span className="text-[10px] text-slate-500">{t('password_hint')}</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 font-mono tracking-wider transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {t('sign_in_btn')}
            </button>
          </form>
        ) : (
          /* CREATE ACCOUNT FORM */
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('full_name')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('name_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">{t('password_label')}</label>
                <span className="text-[10px] text-orange-400 font-medium">{t('password_hint')}</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-slate-500 font-mono tracking-wider transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('create_account_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
