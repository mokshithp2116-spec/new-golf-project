'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCurrentUser,
  getUsers,
  getDraws,
  getWinners,
  getAnalytics,
  getAuditLogs,
} from '@/lib/storage';
import { User, Draw, Winner, PlatformAnalytics } from '@/types';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Trophy,
  Heart,
  FileCheck,
  DollarSign,
  TrendingUp,
  Flame,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [winnersList, setWinnersList] = useState<Winner[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics>(getAnalytics());
  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  const loadData = () => {
    setCurrentUserState(getCurrentUser());
    setUsersList(getUsers());
    setDrawsList(getDraws());
    setWinnersList(getWinners());
    setAnalytics(getAnalytics());
    setRecentAudits(getAuditLogs().slice(0, 5));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const activeSubscribers = usersList.filter((u) => u.subscriptionStatus === 'active');
  const pendingWinners = winnersList.filter((w) => w.verificationStatus === 'pending');
  const approvedUnpaid = winnersList.filter(
    (w) => w.verificationStatus === 'approved' && w.paymentStatus !== 'paid'
  );
  const mrr = activeSubscribers.length * 19;
  const arr = mrr * 12;

  const currentDraw = drawsList.find((d) => d.status === 'scheduled') || drawsList[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            DIGITAL HEROES OPERATIONS COMMAND CENTER
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Full control.</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor users, subscriptions, draws, winners and charity impact from one operational center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/draws"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Launch Draw Command Center</span>
          </Link>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TOTAL USERS */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>TOTAL USERS</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-white">{usersList.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +12% growth this month
          </div>
        </div>

        {/* ACTIVE SUBSCRIPTIONS */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>ACTIVE SUBSCRIPTIONS</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{activeSubscribers.length}</div>
          <div className="text-[11px] text-slate-400">100% Eligible for Monthly Draws</div>
        </div>

        {/* ACTIVE MRR / ARR */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>ACTIVE MRR / ARR</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">${mrr.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">ARR Pace: ${(arr).toLocaleString()}/yr</div>
        </div>

        {/* CURRENT PRIZE POOL */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>CURRENT PRIZE POOL</span>
            <Trophy className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-gradient-gold">
            ${currentDraw?.jackpotPool.toLocaleString() || '40,700'}
          </div>
          <div className="text-[11px] text-orange-400 flex items-center gap-1">
            <Flame className="w-3 h-3" /> ${currentDraw?.rolloverFromPrevious.toLocaleString()} Rollover Active
          </div>
        </div>

        {/* CHARITY IMPACT */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>CHARITY IMPACT</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-gradient-impact">
            ${analytics.totalCharityContributions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">100% Verified Disbursements</div>
        </div>

        {/* PENDING WINNERS */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>PENDING WINNERS</span>
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{pendingWinners.length}</div>
          <div className="text-[11px] text-amber-400 font-semibold">
            {approvedUnpaid.length} Approved Awaiting Payout
          </div>
        </div>
      </div>

      {/* QUICK COMMAND CENTER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Draw Status Launcher */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-5 bg-gradient-to-b from-[#131926] to-[#0a0e17]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                Live Draw Operations Center (§ 06 & § 07)
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {currentDraw?.name || 'March 2026 Grand Draw'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mode: <strong className="text-slate-200 capitalize">{currentDraw?.drawLogic || 'Algorithmic'}</strong> · Eligible Golfers: <strong className="text-emerald-400">{activeSubscribers.length}</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
              {currentDraw?.status || 'Scheduled'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Estimated Grand Jackpot</div>
              <div className="text-2xl font-black text-gradient-gold">${currentDraw?.jackpotPool.toLocaleString()}</div>
            </div>

            <Link
              href="/admin/draws"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <span>Run Simulation & Publish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Verification & Payout Queue Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Verification Queue
            </h3>
            <Link href="/admin/winners" className="text-xs text-amber-400 hover:underline font-semibold">
              View All Queue →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {winnersList.slice(0, 3).map((w) => (
              <div key={w.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{w.userName}</div>
                  <div className="text-[10px] text-slate-400">Prize: <strong className="text-amber-300">${w.prizeAmount.toLocaleString()}</strong> ({(w.matchedNumbers?.length || 5)}-Match)</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                  w.verificationStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {w.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT AUDIT TRAIL */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Recent Audit Activity Trail
            </h3>
            <p className="text-xs text-slate-400">Immutable log of all administrative actions and parameter changes.</p>
          </div>
          <Link href="/admin/audit" className="text-xs text-amber-400 hover:underline font-semibold">
            Full Audit Log →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Administrator</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Entity</th>
                <th className="px-4 py-2.5">Mutation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {recentAudits.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-2.5 text-slate-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="px-4 py-2.5 text-amber-300 font-sans font-semibold">{log.adminName}</td>
                  <td className="px-4 py-2.5 text-white font-sans font-bold">{log.action}</td>
                  <td className="px-4 py-2.5 text-indigo-400">{log.entity}</td>
                  <td className="px-4 py-2.5 text-slate-400 truncate max-w-xs">{log.newValue || log.oldValue || 'Exec'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
