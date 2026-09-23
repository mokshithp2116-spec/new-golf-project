'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCurrentUser,
  getCharities,
  getCharityById,
  getUserGolfScores,
  getDraws,
  getWinners,
  updateUser,
} from '@/lib/storage';
import { User, Charity, Draw, Winner, GolfScore } from '@/types';
import ScoreManager from '@/components/scores/ScoreManager';
import WinnerProofModal from '@/components/winners/WinnerProofModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import AuthModal from '@/components/auth/AuthModal';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Trophy,
  Heart,
  Calendar,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Flame,
  ArrowRight,
  Target,
  DollarSign,
  Users,
  LogIn,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user: authUser, isLoading, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [userWinners, setUserWinners] = useState<Winner[]>([]);

  // Modals
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<Winner | null>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Charity pledge editing
  const [editingPledge, setEditingPledge] = useState(false);
  const [pledgePct, setPledgePct] = useState(15);
  const [selectedCharityId, setSelectedCharityId] = useState('');

  const loadData = () => {
    const currentUser = authUser || getCurrentUser();
    if (authUser) {
      updateUser(authUser);
    }
    setUser(currentUser);
    const allCharities = getCharities();
    setCharities(allCharities);

    if (currentUser) {
      const c = getCharityById(currentUser.charityId || 'charity-1');
      setCharity(c || allCharities[0] || null);
      setPledgePct(currentUser.charityContributionPct || 10);
      setSelectedCharityId(currentUser.charityId || allCharities[0]?.id || '');

      const userScores = getUserGolfScores(currentUser.id);
      setScores(userScores);

      const allWinners = getWinners();
      const myWinners = allWinners.filter((w) => w.userId === currentUser.id);
      setUserWinners(myWinners);
    }

    setDraws(getDraws());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    window.addEventListener('dh-language-change', loadData);
    return () => {
      window.removeEventListener('dh-storage-update', loadData);
      window.removeEventListener('dh-language-change', loadData);
    };
  }, [authUser]);

  const handleSavePledge = async () => {
    if (!user) return;
    const newPct = Math.max(10, pledgePct);
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionStatus: user.subscriptionStatus,
          billingCycle: user.billingCycle,
          charityId: selectedCharityId,
          charityContributionPct: newPct,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setUser(data.user);
        await refreshUser();
      }
    } catch {
      const updated: User = {
        ...user,
        charityId: selectedCharityId,
        charityContributionPct: newPct,
      };
      updateUser(updated);
      setUser(updated);
    }
    setEditingPledge(false);
  };

  const handleToggleSubscription = async () => {
    if (!user) return;
    const nextStatus = user.subscriptionStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionStatus: nextStatus,
          billingCycle: user.billingCycle,
          charityId: user.charityId,
          charityContributionPct: user.charityContributionPct,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setUser(data.user);
        await refreshUser();
      }
    } catch {
      const updated: User = {
        ...user,
        subscriptionStatus: nextStatus,
      };
      updateUser(updated);
      setUser(updated);
    }
  };

  // Prevent flash while restoring user session
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Restoring session...</p>
      </div>
    );
  }

  // If user is not signed in, display Golf Information & Prices instead of an empty box!
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Header Preview */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
            <Target className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t('dashboard_unauth_title')}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('dashboard_unauth_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('sign_in')}</span>
            </button>

            <button
              onClick={() => setSubModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('btn_subscribe_draw')}</span>
            </button>
          </div>
        </div>

        {/* Feature & Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-white">{t('logic_stableford')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('step2_desc')}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-white">{t('pledge_min')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('step1_desc')}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-white">{t('jackpot_guarantee')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('step3_desc')}
            </p>
          </div>
        </div>

        {/* Pricing Tiers Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('monthly_membership')}</span>
            <div className="text-3xl font-extrabold text-white">$19 <span className="text-xs text-slate-400 font-normal">{t('per_month')}</span></div>
            <button
              onClick={() => setSubModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
            >
              {t('choose_monthly')}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t('annual_membership')}</span>
            <div className="text-3xl font-extrabold text-white">$190 <span className="text-xs text-slate-400 font-normal">{t('per_year')}</span></div>
            <button
              onClick={() => setSubModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs transition"
            >
              {t('choose_annual')}
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="login"
          onNeedSubscribe={() => setSubModalOpen(true)}
        />

        <SubscriptionModal
          isOpen={subModalOpen}
          onClose={() => setSubModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    );
  }

  const isRestricted = user.subscriptionStatus !== 'active';
  const upcomingDraw = draws.find((d) => d.status === 'scheduled') || draws[0];
  const totalWon = userWinners.reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('dashboard_welcome', { name: user.name })}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                user.subscriptionStatus === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {user.subscriptionStatus} {t('active')}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span>{user.homeClub || 'St. Andrews Old Course'}</span>
            <span>·</span>
            <span>Handicap: {user.handicap || 14.5}</span>
            <span>·</span>
            <span>{user.email}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('pricing')}
          </button>
        </div>
      </div>

      {/* Restricted Access Warning */}
      {isRestricted && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm block">
                Subscription {user.subscriptionStatus.toUpperCase()}
              </strong>
              Your membership has lapsed or is inactive. Your scores are currently excluded from upcoming monthly prize draws until reactivated.
            </div>
          </div>
          <button
            onClick={handleToggleSubscription}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition shadow-md whitespace-nowrap"
          >
            Reactivate Membership Now
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Subscription Status */}
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Subscription Status</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-white capitalize flex items-center gap-2">
            {user.subscriptionStatus}
            <span className="text-xs font-normal text-slate-400">({user.billingCycle})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Renews: {user.subscriptionRenewalDate ? user.subscriptionRenewalDate.split('T')[0] : 'Auto-renews next month'}
          </div>
        </div>

        {/* Module 2: Charity Pledge */}
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>{t('charities_impact')}</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {user.charityContributionPct}% of fee
          </div>
          <div className="text-[11px] text-slate-300 truncate font-medium">
            Recipient: {charity?.name || 'Fairway for Kids'}
          </div>
        </div>

        {/* Module 3: Active Rolling Scores */}
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>{t('logic_stableford')}</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {scores.length}/5 Rounds Logged
          </div>
          <div className="text-[11px] text-slate-400">
            {scores.length === 5 ? 'Fully entered in next draw' : `${5 - scores.length} more needed to qualify`}
          </div>
        </div>

        {/* Module 4: Winnings Overview */}
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Total Prize Winnings</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-gradient-gold">
            ${totalWon.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {userWinners.length} Winning Tier Matches
          </div>
        </div>
      </div>

      {/* WINNINGS & VERIFICATION OVERVIEW */}
      {userWinners.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-400" /> Winner Verification & Payout Center
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Your Draw Rewards</h3>
            </div>
            <span className="text-xs text-slate-400">
              Scorecard proof is reviewed by admins before payment release
            </span>
          </div>

          <div className="space-y-3">
            {userWinners.map((win) => (
              <div
                key={win.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{win.drawName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                      {win.matchType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                    <span>
                      Prize Amount: <strong className="text-emerald-400 font-bold">${win.prizeAmount.toLocaleString()}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Matched Numbers: <strong className="text-white font-mono">[{win.matchedNumbers?.join(', ') || ''}]</strong>
                    </span>
                  </div>

                  {win.adminNotes && (
                    <div className="text-[11px] text-slate-400 italic">
                      Admin Notes: “{win.adminNotes}”
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Verification:</div>
                    <span
                      className={`text-xs font-bold capitalize px-2 py-0.5 rounded-lg inline-block ${
                        win.verificationStatus === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : win.verificationStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {win.verificationStatus === 'approved' ? 'Verified' : win.verificationStatus}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Payment:</div>
                    <span
                      className={`text-xs font-bold capitalize px-2 py-0.5 rounded-lg inline-block ${
                        win.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {win.paymentStatus}
                    </span>
                  </div>

                  {win.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => setSelectedWinnerForProof(win)}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {win.proofImageUrl ? 'Update Proof' : 'Upload Score Proof'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PARTICIPATION SUMMARY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
              {t('draw_section_tag')}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{upcomingDraw?.name}</h3>
            <div className="text-xs text-slate-400">
              Draw Date: {upcomingDraw?.drawDate.split('T')[0]} · Cadence: Monthly
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Estimated Jackpot: ${upcomingDraw?.jackpotPool.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">
              Your Official Active Ticket Numbers for this Draw:
            </span>
            <span className="text-slate-400">Derived from your latest 5 rounds</span>
          </div>

          {scores.length === 5 ? (
            <div className="flex items-center gap-3 flex-wrap">
              {scores.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className="ball-number ball-matched">{s.score}</div>
                  <span className="text-[10px] text-slate-400">{s.date.slice(5)}</span>
                </div>
              ))}
              <div className="ml-4 pl-4 border-l border-white/10 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Valid 5-Number Entry Active!
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-400 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You currently have {scores.length} of 5 scores recorded. Log {5 - scores.length} more round(s) below to complete your ticket entry.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SCORE ENTRY & MANAGEMENT SYSTEM */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">
            {t('logic_stableford')}
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Your 5 Rolling Stableford Scores</h2>
          <p className="text-xs text-slate-400">
            Log each golf round with date and Stableford points (1–45). Only 1 round per date is permitted. A new round will automatically replace the oldest stored round.
          </p>
        </div>

        <ScoreManager userId={user.id} onScoresChanged={loadData} />
      </div>

      {/* SELECTED CHARITY & PLEDGE PERCENTAGE */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
              {t('charities_impact')}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">Your Selected Cause & Pledge</h3>
          </div>

          <button
            onClick={() => setEditingPledge(!editingPledge)}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editingPledge ? 'Cancel Adjustments' : 'Adjust Charity or Pledge %'}
          </button>
        </div>

        {editingPledge ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/15 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Change Charity Recipient
              </label>
              <select
                value={selectedCharityId}
                onChange={(e) => setSelectedCharityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Pledge Percentage:</span>
                <span className="text-orange-400 font-bold">{pledgePct}% of subscription</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={pledgePct}
                onChange={(e) => setPledgePct(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10% (PRD Baseline)</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <button
              onClick={handleSavePledge}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20"
            >
              Save New Charity Settings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 flex items-center gap-4">
              {charity?.imageUrl && (
                <img
                  src={charity.imageUrl}
                  alt={charity.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                />
              )}
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  {charity?.category}
                </span>
                <h4 className="text-lg font-bold text-white">{charity?.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{charity?.tagline}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Contribution</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {user.charityContributionPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">of your membership fee</div>
            </div>
          </div>
        )}
      </div>

      {/* Proof Upload Modal */}
      {selectedWinnerForProof && (
        <WinnerProofModal
          winner={selectedWinnerForProof}
          isOpen={!!selectedWinnerForProof}
          onClose={() => setSelectedWinnerForProof(null)}
          onSuccess={loadData}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
