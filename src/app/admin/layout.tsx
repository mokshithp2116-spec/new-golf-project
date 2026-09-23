'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Heart,
  FileCheck,
  DollarSign,
  BarChart3,
  History,
  LogOut,
  Menu,
  X,
  User,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const fetchAdminSession = async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store' });
        const data = await res.json();
        if (data.authenticated && data.user && data.user.role === 'admin') {
          setAdminUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };
    fetchAdminSession();
  }, [pathname, router]);

  // If on /admin/login, render without admin layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: t('admin_overview'), icon: LayoutDashboard },
    { href: '/admin/users', label: t('admin_users'), icon: Users },
    { href: '/admin/subscriptions', label: t('pricing'), icon: CreditCard },
    { href: '/admin/draws', label: t('admin_draws'), icon: Trophy },
    { href: '/admin/charities', label: t('admin_charities'), icon: Heart },
    { href: '/admin/winners', label: t('admin_winners'), icon: FileCheck },
    { href: '/admin/payouts', label: t('admin_payouts'), icon: DollarSign },
    { href: '/admin/reports', label: t('admin_reports'), icon: BarChart3 },
    { href: '/admin/audit', label: t('admin_audit'), icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c101a]/95 backdrop-blur-md px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
              §
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                DIGITAL<span className="text-amber-400">.HEROES.</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                {t('admin_panel')}
              </div>
            </div>
          </Link>
        </div>

        {/* Top-Right Online Badge & Profile Dropdown */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Administrator ● {t('active')}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">{adminUser?.name || 'Administrator'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111622] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white">{adminUser?.name || 'Master Admin'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{adminUser?.email || 'admin@digitalheroes.com'}</div>
                </div>

                <Link
                  href="/admin/audit"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  {t('admin_audit')}
                </Link>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 transition font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#090d15] p-4 space-y-2 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2">
            Operations Console
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0c101a]">
              <span className="font-bold text-amber-400 text-sm">DIGITAL.HEROES. ADMIN</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto flex-1 bg-[#090d15]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                      isActive ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-amber-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Dynamic Admin Module Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#07090e]">
          {children}
        </main>
      </div>
    </div>
  );
}
