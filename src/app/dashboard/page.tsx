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
import { ScoreChart } from '@/components/common/Chart';
import DrawCountdown from '@/components/common/Countdown';
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
  Check,
  Plus,
  Compass,
  Award,
  Circle,
  RefreshCw,
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
      setPledgePct(currentUser.charityContributionPct || 15);
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

  // Session restore loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[65vh]">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Loading Golf Command Center...</p>
      </div>
    );
  }

  // Unauthenticated Welcome State
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 bg-golf-atmosphere min-h-screen">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/20 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 font-black text-2xl">
            §
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Digital Heroes Golfer Command Center
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Log your rolling 5 Stableford golf scores, enter monthly championship jackpot draws, and automatically support verified youth sports charities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl text-xs transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => setSubModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Subscribe & Start Playing</span>
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
    <div className="min-h-screen bg-golf-atmosphere py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. PREMIUM DASHBOARD HEADER / HERO BANNER (Item #4) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/25 relative overflow-hidden bg-gradient-to-r from-[#0c241b]/90 via-[#0a1b14]/90 to-[#07130e]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED GOLFER MEMBER
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block">WELCOME BACK</span>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {user.name.toUpperCase()}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Compass className="w-4 h-4" /> {user.homeClub || 'Royal Melbourne Golf Club'}
                </span>
                <span>·</span>
                <span className="text-amber-300 font-mono">Handicap: {user.handicap || 14.5}</span>
                <span>·</span>
                <span className="text-slate-400">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-center">
              <button
                onClick={() => setSubModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl text-xs transition shadow-xl shadow-emerald-500/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Manage Plan Tier</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. DASHBOARD STATISTICS SYSTEM (4 MAIN KPI MODULES) (Item #7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Membership Status */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>MEMBERSHIP</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 uppercase flex items-center gap-2">
              {user.subscriptionStatus}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Renews: {user.subscriptionRenewalDate ? user.subscriptionRenewalDate.split('T')[0] : 'Oct 23, 2026'}
            </div>
          </div>

          {/* Module 2: Charity Impact */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>CHARITY IMPACT</span>
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {user.charityContributionPct || 15}% OF FEE
            </div>
            <div className="text-[11px] text-rose-300 font-semibold truncate">
              {charity?.name || 'Fairway for Kids'}
            </div>
          </div>

          {/* Module 3: Golf Qualification */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>GOLF QUALIFICATION</span>
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {scores.length} / 5
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {scores.length === 5 ? '5/5 Full Entry Ready' : `${5 - scores.length} More Rounds Logged`}
            </div>
          </div>

          {/* Module 4: Prize Winnings */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <span>PRIZE WINNINGS</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-gradient-gold">
              ${totalWon.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-300 font-medium">
              {userWinners.length} Winning Tier Matches
            </div>
          </div>
        </div>

        {/* 3. NEXT DRAW & CHAMPIONSHIP PRIZE POOL SECTION (Item #8 & #9) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#14231b] to-[#0a1510] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" /> CURRENT CHAMPIONSHIP DRAW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{upcomingDraw?.name}</h2>
              <p className="text-xs text-slate-400">
                Draw Date: <strong className="text-white">{upcomingDraw?.drawDate.split('T')[0]}</strong> · Mode: <strong className="text-emerald-400 capitalize">{upcomingDraw?.drawLogic || 'Algorithmic'}</strong>
              </p>
            </div>

            {/* Countdown Component */}
            <DrawCountdown targetDate={upcomingDraw?.drawDate || '2026-09-30T20:00:00Z'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-black/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ESTIMATED GRAND JACKPOT</span>
              <div className="text-4xl font-black text-gradient-gold">${upcomingDraw?.jackpotPool.toLocaleString()}</div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Includes ${upcomingDraw?.rolloverFromPrevious.toLocaleString()} Rollover
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">TIER 4 (4-MATCH POOL)</span>
              <div className="text-2xl font-extrabold text-emerald-400">${upcomingDraw?.tier4Pool.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Split among 4-match scorecards</div>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">TIER 3 (3-MATCH POOL)</span>
              <div className="text-2xl font-extrabold text-emerald-400">${upcomingDraw?.tier3Pool.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Split among 3-match scorecards</div>
            </div>
          </div>
        </div>

        {/* 4. QUALIFICATION / 5-SCORE PROGRESSION TRACKER (Item #10) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CORE QUALIFICATION SYSTEM</span>
              <h3 className="text-xl font-black text-white mt-1">5-Round Stableford Qualification Progression</h3>
            </div>

            <Link
              href="/scores"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto"
            >
              <span>LOG YOUR NEXT ROUND →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const score = scores[idx];
              const isFilled = !!score;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                    isFilled
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-slate-950/40 border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>ROUND {idx + 1}</span>
                    {isFilled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-black text-lg ${
                    isFilled ? 'ball-matched text-white' : 'bg-slate-900 border border-white/10 text-slate-600'
                  }`}>
                    {isFilled ? score.score : '—'}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {isFilled ? `${score.date.slice(5)} · ${score.courseName || 'Local'}` : 'Pending Entry'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. SCORE PROGRESSION CHART (Item #12 & #30) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <ScoreChart scores={scores} />
        </div>

        {/* 6. SCORE MANAGER CRUD SECTION */}
        <div className="space-y-4">
          <ScoreManager userId={user.id} onScoresChanged={loadData} />
        </div>

        {/* 7. CHARITY & MY IMPACT SECTION (Item #13 & #14) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 space-y-6 bg-gradient-to-b from-[#1f121d] to-[#0a0f18]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" /> YOUR PHILANTHROPIC PLEDGE
              </span>
              <h3 className="text-xl font-black text-white mt-1">Your Selected Cause & Pledge</h3>
            </div>

            <button
              onClick={() => setEditingPledge(!editingPledge)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              {editingPledge ? 'Cancel Adjustments' : 'Adjust Charity or Pledge %'}
            </button>
          </div>

          {editingPledge ? (
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/15 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Change Charity Recipient
                </label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white"
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
                  <span className="text-rose-400 font-bold">{pledgePct}% of subscription</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={pledgePct}
                  onChange={(e) => setPledgePct(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSavePledge}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-500/20"
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

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Contribution</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {user.charityContributionPct || 15}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">of your membership fee</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
