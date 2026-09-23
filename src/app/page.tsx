'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCharities,
  getDraws,
  getAnalytics,
  getCurrentUser,
} from '@/lib/storage';
import { Charity, Draw, PlatformAnalytics, User } from '@/types';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import AuthModal from '@/components/auth/AuthModal';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Users,
  ExternalLink,
  ChevronRight,
  Target,
  Sparkle,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics>(getAnalytics());
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonationCharityId, setSelectedDonationCharityId] = useState<string | undefined>();

  // Calculator state
  const [calcCycle, setCalcCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [calcCharityPct, setCalcCharityPct] = useState<number>(15);

  const isSubscribed = authUser?.subscriptionStatus === 'active';

  useEffect(() => {
    setAnalytics(getAnalytics());
    setCharities(getCharities());
    setDraws(getDraws());
    setCurrentUser(authUser);

    // Smooth anchor scrolling to avoid page jumps on refresh
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [authUser]);

  const spotlightCharities = charities.filter((c) => c.isSpotlight);
  const publishedDraw = draws.find((d) => d.status === 'published') || draws[0];
  const upcomingDraw = draws.find((d) => d.status === 'scheduled') || draws[1];

  // Dynamic calculator calculations
  const price = calcCycle === 'monthly' ? 19 : 190;
  const charityImpact = (price * (calcCharityPct / 100)).toFixed(2);
  const prizePoolShare = (price * 0.5).toFixed(2);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION (§ 12: Feel, not fairway. Emotion-driven, leading with impact) */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            {t('hero_title')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isSubscribed ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl text-base transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
              >
                <Trophy className="w-5 h-5 text-amber-300" />
                <span>View Active Entry & Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl text-base transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
              >
                <span>{t('btn_subscribe_draw')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            )}

            <button
              onClick={() => setDonationModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-base transition flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{t('btn_direct_donate')}</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('pledge_min')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('logic_stableford')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-orange-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('jackpot_guarantee')}
            </span>
          </div>
        </div>

        {/* Live Platform KPI Banner */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Rollover Jackpot</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gradient-gold mt-1">
              ${upcomingDraw?.jackpotPool.toLocaleString() || '40,700'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Includes ${upcomingDraw?.rolloverFromPrevious.toLocaleString()} rolled over!
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Charity Donated</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gradient-impact mt-1">
              ${analytics.totalCharityContributions.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              100% distributed to verified partners
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Golfers</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {analytics.activeSubscribers.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Compete across 180+ clubs
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Winners Verified & Paid</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {analytics.totalWinnersPaid} Golfers
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Attested scorecard proof required
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS & DRAW MECHANICS (§ 01, § 05, § 06, § 07) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
            {t('how_section_tag')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t('how_section_title')}
          </h2>
          <p className="text-sm text-slate-400">
            No golf jargon, no traditional cliches. Digital Heroes turns your real rounds into charitable momentum and monthly lottery-style rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-white/10 hover:border-orange-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="text-xl font-bold text-white">{t('step1_title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('step1_desc')}
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-orange-400 font-semibold">
              <span>Stableford 1–45</span>
              <span>·</span>
              <span>Rolling 5 Retention</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-white/10 hover:border-rose-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="text-xl font-bold text-white">{t('step2_title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('step2_desc')}
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
              <span>{t('pledge_min')}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-white/10 hover:border-amber-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="text-xl font-bold text-white">{t('step3_title')}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('step3_desc')}
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>{t('jackpot_guarantee')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE IMPACT & SUBSCRIPTION CALCULATOR */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left description */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
                  Interactive Impact Engine (§ 08.1)
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                  Calculate Your Monthly Ripple Effect
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  See exactly how your subscription fee is split between charitable giving, our monthly cash prize pool, and continuous platform development.
                </p>
              </div>

              {/* Plan Switcher */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCalcCycle('monthly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    calcCycle === 'monthly'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Monthly ($19/mo)
                </button>
                <button
                  onClick={() => setCalcCycle('yearly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    calcCycle === 'yearly'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Yearly ($190/yr)
                  <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-extrabold">Save 17%</span>
                </button>
              </div>

              {/* Slider for pledge */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Charity Pledge:</span>
                  <span className="text-orange-400 font-bold">{calcCharityPct}% of your subscription</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={calcCharityPct}
                  onChange={(e) => setCalcCharityPct(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% (Required PRD Baseline)</span>
                  <span>25%</span>
                  <span>50% (Heroic Pledge)</span>
                </div>
              </div>
            </div>

            {/* Right card breakdown */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Your Selected Rate</span>
                  <div className="text-3xl font-extrabold text-white">${price}</div>
                </div>
                <span className="text-xs text-slate-400 font-medium capitalize">
                  Per {calcCycle === 'monthly' ? 'Month' : 'Year'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-slate-300">Direct to Chosen Charity:</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-base">${charityImpact}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Monthly Draw Prize Pool:</span>
                  </div>
                  <span className="font-bold text-amber-400 text-base">${prizePoolShare}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Operations & Verification:</span>
                  </div>
                  <span className="font-bold text-slate-300 text-base">
                    ${(price - parseFloat(charityImpact) - parseFloat(prizePoolShare)).toFixed(2)}
                  </span>
                </div>
              </div>

              {isSubscribed ? (
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Manage Subscription & Pledge in Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!authUser) setAuthModalOpen(true);
                    else setSubModalOpen(true);
                  }}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  <span>Lock In This Impact & Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE DRAWS & JACKPOT ROLLOVER SHOWCASE (§ 06 & § 07) */}
      <section id="draws" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
              {t('draw_section_tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              {t('draw_section_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-400 max-w-md">
            {t('draw_section_desc')}
          </div>
        </div>

        {/* Two-card display: Last Month vs Next Month */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Published Past Draw */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  {t('pub_results')}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{publishedDraw?.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Conducted on {publishedDraw?.drawDate.split('T')[0]} · {publishedDraw?.totalSubscribersEntered.toLocaleString()} Golfers Entered
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                Completed
              </span>
            </div>

            {/* Winning numbers display */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2">
                {t('winning_numbers')}
              </span>
              <div className="flex gap-2.5 flex-wrap">
                {publishedDraw?.winningNumbers.map((num) => (
                  <div key={num} className="ball-number ball-winning">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Tier breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_5')}</div>
                <div className="text-amber-400 font-bold mt-0.5">
                  ${publishedDraw?.jackpotPool.toLocaleString()}
                </div>
                <div className="text-[10px] text-orange-400 mt-1 font-semibold">{t('rolled_over')}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_4')}</div>
                <div className="text-emerald-400 font-bold mt-0.5">
                  ${publishedDraw?.tier4Pool.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">Sarah J. ($5,600)</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_3')}</div>
                <div className="text-emerald-400 font-bold mt-0.5">
                  ${publishedDraw?.tier3Pool.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-300 mt-1">4 Winners ($2,000 ea)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-center gap-2">
              <Flame className="w-4 h-4 shrink-0" />
              <span>
                <strong>Rollover in effect:</strong> ${publishedDraw?.rolloverToNext.toLocaleString()} was added directly into the March 2026 Jackpot pool!
              </span>
            </div>
          </div>

          {/* Upcoming Scheduled Draw */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-orange-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> {t('next_draw')}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{upcomingDraw?.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Draw Scheduled for {upcomingDraw?.drawDate.split('T')[0]} · Cadence: Monthly
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold pulse-glow">
                Live Entries Open
              </span>
            </div>

            {/* Jackpot highlight */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                {t('total_jackpot')}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-gradient-gold mt-1">
                ${upcomingDraw?.jackpotPool.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                Base pool ($19,400) + ${upcomingDraw?.rolloverFromPrevious.toLocaleString()} rolled over from February because no one claimed all 5 numbers!
              </div>
            </div>

            {/* Estimated Tiers */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-[10px]">{t('match_4')}</span>
                <div className="text-white font-bold mt-0.5">
                  ${upcomingDraw?.tier4Pool.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Match 4 of 5 numbers</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-[10px]">{t('match_3')}</span>
                <div className="text-white font-bold mt-0.5">
                  ${upcomingDraw?.tier3Pool.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Match 3 of 5 numbers</div>
              </div>
            </div>

            {isSubscribed ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>View Active Entry & Golfer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-center text-emerald-400 font-semibold">
                  ✓ Active Subscription! Your latest 5 rounds are qualified for this draw.
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <span>{t('btn_subscribe_draw')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 5. CHARITY SPOTLIGHT & UPCOMING EVENTS (§ 08.2: "Featured charity section on the homepage") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
              {t('charity_section_tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              {t('charity_section_title')}
            </h2>
          </div>
          <Link
            href="/charities"
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 self-start md:self-auto"
          >
            <span>{t('view_all_charities')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlightCharities.map((charity) => (
            <div
              key={charity.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={charity.imageUrl}
                  alt={charity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                  {charity.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-500/80 text-white text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Spotlight
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
                    {charity.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {charity.tagline}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Funds Raised:</span>
                    <span className="font-bold text-emerald-400">
                      ${charity.totalRaised.toLocaleString()}
                    </span>
                  </div>

                  {charity.upcomingEvents.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] space-y-1">
                      <div className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-orange-400" />
                        Next Charity Golf Event:
                      </div>
                      <div className="font-semibold text-white truncate">
                        {charity.upcomingEvents[0].title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {charity.upcomingEvents[0].date} · {charity.upcomingEvents[0].location}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedDonationCharityId(charity.id);
                        setDonationModalOpen(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-rose-300 text-xs font-semibold transition text-center"
                    >
                      Give Direct
                    </button>

                    {isSubscribed ? (
                      <Link
                        href="/dashboard"
                        className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition text-center flex items-center justify-center gap-1"
                      >
                        Manage Pledge
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (!authUser) setAuthModalOpen(true);
                          else setSubModalOpen(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition text-center"
                      >
                        Pledge via Golf
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SUBSCRIPTION PRICING PLANS (§ 04) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
            § 04 · Subscription & Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Transparent Membership. Compelling Rewards.
          </h2>
          <p className="text-sm text-slate-400">
            Cancel anytime. Every tier includes rolling 5-score entry, partner charity allocations, and full draw eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Card */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Membership
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$19</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Flexible month-to-month billing.</div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Entry into all 12 monthly draws each year</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Customizable charity pledge (min. 10% to 50%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rolling 5-score Stableford tracking (1–45)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Eligible for 5-match, 4-match & 3-match payouts</span>
                </li>
              </ul>
            </div>

            {isSubscribed ? (
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center font-bold text-sm transition block"
              >
                Active Member (Manage in Dashboard)
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition"
              >
                Choose Monthly Plan
              </button>
            )}
          </div>

          {/* Annual Card */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border border-amber-500/40 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-amber-500/10">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
              Most Popular · 2 Months Free
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Annual Membership
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$190</span>
                  <span className="text-xs text-slate-400">/ year</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  Save 17% (Equivalent to just $15.83 / month)
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">Includes 2 months free per year</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Automatic rollover ticket preservation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Direct charity donation impact boosted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Fast-track score verification and priority payout</span>
                </li>
              </ul>
            </div>

            {isSubscribed ? (
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center font-bold text-sm transition block"
              >
                Active Member (Manage in Dashboard)
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-orange-500/25"
              >
                Get Annual Access ($190)
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        onNeedSubscribe={() => setSubModalOpen(true)}
      />

      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSuccess={() => {
          window.location.href = '/dashboard';
        }}
      />

      <DirectDonationModal
        isOpen={donationModalOpen}
        onClose={() => {
          setDonationModalOpen(false);
          setSelectedDonationCharityId(undefined);
        }}
        defaultCharityId={selectedDonationCharityId}
      />
    </div>
  );
}
