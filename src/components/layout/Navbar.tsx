'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { SupportedLanguage } from '@/lib/translations';
import {
  Sparkles,
  Heart,
  Trophy,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const { user, logout, isLoading } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [subOpen, setSubOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0e14]/90 backdrop-blur-xl">
        {/* Top Mini-Banner: Active Rollover Jackpot Alert */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white text-[11px] font-semibold py-1 px-4 text-center flex items-center justify-center gap-2">
          <Flame className="w-3.5 h-3.5 fill-white text-white animate-bounce" />
          <span>
            {t('banner_jackpot')} <strong>$40,700+</strong>
          </span>
          <Link
            href="/#draws"
            className="underline hover:text-amber-200 transition text-[10px] uppercase tracking-wider font-bold ml-1"
          >
            {t('view_mechanics')}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo (§ 00 Digital Heroes) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              §
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                digital<span className="text-orange-400">.HEROES.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium -mt-1">
                {t('brand_subtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <Link
              href="/#how-it-works"
              className="hover:text-white transition hover:scale-105 transform"
            >
              {t('how_it_works')}
            </Link>
            <Link
              href="/charities"
              className={`hover:text-white transition ${
                pathname === '/charities' ? 'text-orange-400 font-bold' : ''
              }`}
            >
              {t('charities_impact')}
            </Link>
            <Link
              href="/#draws"
              className="hover:text-white transition hover:scale-105 transform"
            >
              {t('draw_engine')}
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-white transition hover:scale-105 transform"
            >
              {t('pricing')}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`hover:text-white transition flex items-center gap-1.5 ${
                  pathname === '/dashboard' ? 'text-orange-400 font-bold' : ''
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                {t('golfer_dashboard')}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`hover:text-white transition flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 ${
                  pathname === '/admin' ? 'bg-amber-500/20 font-bold' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {t('admin_panel')}
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-200"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#121824] text-white">
                    {l.flag} {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
              title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Direct donation button (§ 08.1) */}
            <button
              onClick={() => setDonationOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-500/10 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              {t('give_directly')}
            </button>

            {isLoading ? (
              <div className="w-28 h-9 bg-white/5 animate-pulse rounded-xl border border-white/10" />
            ) : user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  {t('sign_in')}
                </button>
                <button
                  onClick={() => setSubOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-orange-500/25 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('subscribe_play')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#121824] border-b border-white/10 px-4 py-5 space-y-3">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 py-1"
            >
              How It Works
            </Link>
            <Link
              href="/charities"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 py-1"
            >
              Charities & Impact
            </Link>
            <Link
              href="/#draws"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 py-1"
            >
              Draw Engine
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-300 py-1"
            >
              Pricing
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-orange-400 py-1"
              >
                Golfer Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-amber-300 py-1"
              >
                Admin Panel
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDonationOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                Give Directly
              </button>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('login');
                      setAuthOpen(true);
                    }}
                    className="py-2.5 text-xs font-semibold bg-white/5 text-white rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSubOpen(true);
                    }}
                    className="py-2.5 text-xs font-bold bg-orange-500 text-white rounded-xl"
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onNeedSubscribe={() => setSubOpen(true)}
      />

      <SubscriptionModal
        isOpen={subOpen}
        onClose={() => setSubOpen(false)}
        onSuccess={() => {
          window.location.href = '/dashboard';
        }}
      />

      <DirectDonationModal isOpen={donationOpen} onClose={() => setDonationOpen(false)} />
    </>
  );
}
