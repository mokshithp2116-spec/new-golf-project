import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbUpdateUser, dbGetUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

const AVAILABLE_PLANS = [
  {
    id: 'plan-monthly',
    name: '1 Month Plan (Monthly)',
    billingCycle: 'monthly',
    price: 19,
    formattedPrice: '$19 / month',
    description: 'Flexible 1-month membership billing.',
  },
  {
    id: 'plan-yearly',
    name: '1 Year Plan (Annual)',
    billingCycle: 'yearly',
    price: 190,
    formattedPrice: '$190 / year',
    description: 'Equivalent to $15.83/mo (2 months free).',
    badge: 'Save 17%',
  },
];

// GET /api/user/subscription - Returns user membership & server-filtered eligible purchase plans
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({
        success: true,
        currentPlan: null,
        eligiblePlans: AVAILABLE_PLANS,
      });
    }

    const user = dbGetUserById(session.id);
    if (!user || user.subscriptionStatus !== 'active') {
      return NextResponse.json({
        success: true,
        currentPlan: null,
        eligiblePlans: AVAILABLE_PLANS,
      });
    }

    // SERVER-SIDE ELIGIBILITY ENFORCEMENT:
    // Hide any plan that the user already currently holds
    const activeCycle = user.billingCycle || 'monthly';
    const eligiblePlans = AVAILABLE_PLANS.filter((p) => p.billingCycle !== activeCycle);

    const activePlanObj = AVAILABLE_PLANS.find((p) => p.billingCycle === activeCycle) || {
      id: `plan-${activeCycle}`,
      name: activeCycle === 'yearly' ? '1 Year Plan (Annual)' : '1 Month Plan (Monthly)',
      billingCycle: activeCycle,
      price: activeCycle === 'yearly' ? 190 : 19,
      formattedPrice: activeCycle === 'yearly' ? '$190 / year' : '$19 / month',
      description: 'Active subscription tier',
    };

    return NextResponse.json({
      success: true,
      currentPlan: {
        ...activePlanObj,
        status: user.subscriptionStatus,
        renewalDate: user.subscriptionRenewalDate,
        charityId: user.charityId,
        charityContributionPct: user.charityContributionPct,
      },
      eligiblePlans,
    });
  } catch (err: any) {
    console.error('[GET /api/user/subscription Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error loading subscription plans' }, { status: 500 });
  }
}

// POST /api/user/subscription - Handles plan tier updates & prevents duplicate purchases
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billingCycle, charityId, charityContributionPct, subscriptionStatus } = body;

    const existingUser = dbGetUserById(session.id);

    // BACKEND DUPLICATE PURCHASE ENFORCEMENT:
    // Reject request if user already has an active subscription to the exact same plan tier
    if (
      existingUser &&
      existingUser.subscriptionStatus === 'active' &&
      existingUser.billingCycle === billingCycle &&
      !charityId &&
      !charityContributionPct
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `You already hold an active subscription for the ${billingCycle === 'yearly' ? '1 Year' : '1 Month'} plan. Duplicate purchases are not permitted.`,
        },
        { status: 400 }
      );
    }

    const newCycle = billingCycle || (existingUser ? existingUser.billingCycle : 'monthly');
    const renewalDate = new Date();
    if (newCycle === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const updated = dbUpdateUser({
      id: session.id,
      billingCycle: newCycle,
      subscriptionStatus: subscriptionStatus || 'active',
      subscriptionRenewalDate: renewalDate.toISOString(),
      charityId: charityId || (existingUser ? existingUser.charityId : 'charity-1'),
      charityContributionPct: Math.max(10, Number(charityContributionPct) || (existingUser ? existingUser.charityContributionPct : 15)),
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
