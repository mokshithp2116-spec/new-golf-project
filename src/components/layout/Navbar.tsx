'use client';

import { useState, useEffect } from 'react';
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
  Bell,
  User as UserIcon,
  CreditCard,
  Target,
  History,
  HelpCircle,
  Award,
  CheckCircle2,
  Calendar,
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/draws', label: 'Draws' },
    { href: '/charities', label: 'Charity' },
    { href: '/winners', label: 'Winners' },
    { href: '/faq', label: 'FAQ' },
  ];

  const authLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Trophy },
    { href: '/scores', label: 'My Scores', icon: Target },
    { href: '/draws', label: 'My Draws', icon: Award },
    { href: '/impact', label: 'My Impact', icon: Heart },
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserIcon },
    { href: '/faq', label: 'Help & Support', icon: HelpCircle },
  ];

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
            href="/draws"
            className="underline hover:text-amber-200 transition text-[10px] uppercase tracking-wider font-bold ml-1"
          >
            {t('view_mechanics')}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              §
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1 leading-tight">
                digital<span className="text-orange-400">.HEROES.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium -mt-0.5">
                {t('brand_subtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
            {!user ? (
              publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-white transition ${
                    pathname === link.href ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:text-white transition flex items-center gap-1.5 ${
                    pathname === '/dashboard' ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-orange-400" />
                  Dashboard
                </Link>
                <Link
                  href="/scores"
                  className={`hover:text-white transition flex items-center gap-1.5 ${
                    pathname === '/scores' ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-orange-400" />
                  My Scores
                </Link>
                <Link
                  href="/draws"
                  className={`hover:text-white transition flex items-center gap-1.5 ${
                    pathname === '/draws' ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  My Draws
                </Link>
                <Link
                  href="/impact"
                  className={`hover:text-white transition flex items-center gap-1.5 ${
                    pathname === '/impact' ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  My Impact
                </Link>
                <Link
                  href="/subscription"
                  className={`hover:text-white transition flex items-center gap-1.5 ${
                    pathname === '/subscription' ? 'text-orange-400 font-bold' : ''
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Subscription
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold ${
                      pathname.startsWith('/admin') ? 'bg-amber-500/25 border-amber-400' : ''
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer text-slate-200"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#121824] text-white">
                    {l.flag} {l.nativeName}
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

            {/* Direct Donation button */}
            <button
              onClick={() => setDonationOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-500/10 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span className="hidden xl:inline">{t('give_directly')}</span>
            </button>

            {/* User Session / Auth Controls */}
            {isLoading ? (
              <div className="w-24 h-8 bg-white/5 animate-pulse rounded-xl border border-white/10" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10 relative">
                {/* Notifications Bell Button */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4 text-slate-300" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-[#121826] border border-white/15 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-orange-400" /> Notifications
                        </span>
                        <button
                          onClick={() => setUnreadNotifications(0)}
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <div className="font-bold text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Welcome to Digital Heroes!
                          </div>
                          <p className="text-[11px] text-slate-400">Your account and monthly draw entry are active.</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <div className="font-bold text-amber-300 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Upcoming Monthly Draw
                          </div>
                          <p className="text-[11px] text-slate-400">Ensure your 5 rolling golf scores are logged!</p>
                        </div>
                      </div>

                      <Link
                        href="/notifications"
                        className="block text-center text-xs text-orange-400 hover:underline font-semibold pt-1"
                      >
                        View All Notifications →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile Pill */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
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
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d121c] border-b border-white/10 px-5 py-6 space-y-4 animate-fadeIn">
            {user ? (
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-base">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {authLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ${
                          pathname === link.href
                            ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold text-center mt-2"
                  >
                    🛡️ Open Admin Operations Center
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2 border-b border-white/10 pb-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 text-sm font-semibold text-slate-300 ${
                      pathname === link.href ? 'text-orange-400 font-bold' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDonationOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                Give Directly to Charity
              </button>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs text-rose-400 font-bold hover:bg-rose-500/10 rounded-xl transition"
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
                    className="py-3 text-xs font-semibold bg-white/10 text-white rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSubOpen(true);
                    }}
                    className="py-3 text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl"
                  >
                    Subscribe & Play
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
