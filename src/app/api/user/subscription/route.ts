import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbUpdateUser, dbGetUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billingCycle, charityId, charityContributionPct, subscriptionStatus } = body;

    const renewalDate = new Date();
    if (billingCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const updated = dbUpdateUser({
      id: session.id,
      billingCycle: billingCycle || 'monthly',
      subscriptionStatus: subscriptionStatus || 'active',
      subscriptionRenewalDate: renewalDate.toISOString(),
      charityId: charityId || 'charity-1',
      charityContributionPct: Math.max(10, Number(charityContributionPct) || 15),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully.',
      user: updated,
    });
  } catch (err: any) {
    console.error('[POST /api/user/subscription Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error updating subscription' }, { status: 500 });
  }
}
