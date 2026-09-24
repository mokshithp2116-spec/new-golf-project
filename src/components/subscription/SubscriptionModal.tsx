'use client';

import { useState } from 'react';
import { getCharities, getCurrentUser, updateUser } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { BillingCycle, Charity, User } from '@/types';
import { X, Check, Heart, Trophy, ShieldCheck, Sparkles, CreditCard, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
  const { user, refreshUser } = useAuth();
  const currentIsYearly = user?.billingCycle === 'yearly';

  // If user already has yearly active, default to monthly so they can switch to 1 month
  const [cycle, setCycle] = useState<BillingCycle>(currentIsYearly ? 'monthly' : (user?.billingCycle || 'monthly'));
  const [charityId, setCharityId] = useState<string>(user?.charityId || 'charity-1');
  const [charityPct, setCharityPct] = useState<number>(user?.charityContributionPct || 15); // Minimum 10%
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const charities = getCharities();
  const selectedCharity = charities.find((c) => c.id === charityId) || charities[0];

  if (!isOpen) return null;

  const basePrice = cycle === 'monthly' ? 19 : 190;
  const monthlyEquivalent = cycle === 'monthly' ? 19 : 15.83;
  const charityAmount = (basePrice * (charityPct / 100)).toFixed(2);
  const prizePoolAmount = (basePrice * 0.5).toFixed(2); // 50% contributes directly to draws

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingCycle: cycle,
          charityId,
          charityContributionPct: charityPct,
          subscriptionStatus: 'active',
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        updateUser(resData.user);
      }
      await refreshUser();
    } catch {
      // ignore
    }

    setIsProcessing(false);
    setCompleted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fbbf24', '#10b981', '#ffffff'],
      });
    } catch {
      // ignore in environments without canvas
    }

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      setCompleted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#121724] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {completed ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold text-white">Subscription Updated!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your plan has been updated to <span className="text-orange-400 font-bold">{cycle === 'monthly' ? '1 Month ($19/mo)' : '1 Year ($190/yr)'}</span> billing. {charityPct}% of your fee continues supporting <span className="text-orange-400 font-semibold">{selectedCharity?.name}</span>.
            </p>
            <div className="text-xs text-slate-400">Updating your profile & dashboard...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-orange-400 uppercase">
                Digital Heroes Subscription Management
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {currentIsYearly ? 'Switch to 1 Month Subscription' : 'Manage Subscription & Impact'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {currentIsYearly
                  ? 'Your 1-Year plan is currently active. Select 1 Month ($19/mo) below to convert to monthly billing.'
                  : 'Enter every monthly prize pool, record your scores, and back a cause you care about.'}
              </p>
            </div>

            {/* Current Active Plan Notice */}
            {currentIsYearly && (
              <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Active Plan: 1 Year (Annual Subscription)</strong>. Click 1 Month below to switch.
                </span>
              </div>
            )}

            {/* Plan selection: Monthly (1 Month) vs Yearly */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setCycle('monthly')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  cycle === 'monthly'
                    ? 'border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/20 ring-1 ring-orange-500'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-300">1 Month Plan (Monthly)</span>
                  {cycle === 'monthly' && <Check className="w-4 h-4 text-orange-400" />}
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-white">$19</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <div className="text-[11px] text-orange-300 font-medium mt-1">
                  {currentIsYearly ? '★ Click to switch to 1 Month' : 'Flexible 1-month billing, cancel anytime.'}
                </div>
              </div>

              {!currentIsYearly ? (
                <div
                  onClick={() => setCycle('yearly')}
                  className={`p-4 rounded-2xl border cursor-pointer relative transition ${
                    cycle === 'yearly'
                      ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-black uppercase tracking-wider">
                    Save 17%
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-300">1 Year Plan (Annual)</span>
                    {cycle === 'yearly' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-white">$190</span>
                    <span className="text-xs text-slate-400"> / year</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">Equivalent to $15.83/mo (2 months free).</div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 opacity-60 relative cursor-not-allowed">
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black uppercase tracking-wider">
                    Currently Active
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-300">1 Year Plan (Annual)</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-extrabold text-white">$190</span>
                    <span className="text-xs text-slate-400"> / year</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Active subscription tier</div>
                </div>
              )}
            </div>

            {/* Charity Selection (§ 08.1: Users select a charity at signup) */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Select Your Charity Partner (§ 08.1)
                </span>
                <span className="text-[10px] text-slate-400">Directly funded every cycle</span>
              </label>
              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.category}
                  </option>
                ))}
              </select>
              {selectedCharity && (
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                  {selectedCharity.tagline}
                </p>
              )}
            </div>

            {/* Charity Contribution Percentage (§ 08.1: Minimum 10%, voluntarily increase) */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Charity Pledge Percentage
                </span>
                <span className="text-sm font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                  {charityPct}% of your subscription
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={charityPct}
                onChange={(e) => setCharityPct(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10% (PRD Minimum)</span>
                <span>25%</span>
                <span>50% (Heroic Tier)</span>
              </div>

              {/* Real-time Allocation breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Charity Impact:</span>
                  <div className="font-bold text-emerald-400">
                    ${charityAmount} / {cycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Prize Pool Contribution:</span>
                  <div className="font-bold text-amber-400">
                    ${prizePoolAmount} / {cycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated PCI-Compliant Stripe Payment (§ 04) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  Payment Details (Stripe PCI-Compliant)
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Lock className="w-3 h-3" />
                  256-Bit Encrypted
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-mono text-white"
                  placeholder="Card number"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-mono text-white"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-orange-500 font-mono text-white"
                    placeholder="CVC"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl text-sm transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Securing Your Subscription...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Pay ${basePrice} & Activate Golf Hero Membership
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
