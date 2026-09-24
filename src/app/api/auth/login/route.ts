import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGetUserByEmail } from '@/lib/db';
import { signSessionToken, setSessionCookie } from '@/lib/auth';
import { sendAuthNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'Unknown';
}

async function safeParseJson(request: Request): Promise<any> {
  let rawText = '';
  try {
    rawText = await request.text();
  } catch {
    return null;
  }
  if (!rawText || !rawText.trim()) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    try {
      return JSON.parse(rawText.replace(/\\/g, '\\\\'));
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await safeParseJson(request);
    if (body === null) {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload. Please check your details and try again.' },
        { status: 400 }
      );
    }
    const { email, password } = body || {};

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // 1. Validation
    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Password is required.' },
        { status: 400 }
      );
    }

    // 2. Database User Lookup
    const user = dbGetUserByEmail(cleanEmail);
    if (!user) {
      await sendAuthNotification({
        event: 'FAILED_LOGIN',
        name: 'Unknown User',
        email: cleanEmail,
        ip,
        userAgent,
        details: 'Non-existent account email',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    // 3. Strict Password Verification (STRICT: NO BYPASS LOGIC)
    let isMatch = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    } else {
      isMatch = user.password_hash === cleanPassword;
    }

    if (!isMatch) {
      await sendAuthNotification({
        event: 'FAILED_LOGIN',
        name: user.name,
        email: user.email,
        ip,
        userAgent,
        details: 'Incorrect password',
      });

      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    // 4. Record Live Activity Log
    try {
      const { dbRecordActivity } = await import('@/lib/db');
      dbRecordActivity(user.id, user.name, user.email, 'LOGIN', 'User logged in to platform', ip);
    } catch {}

    // 5. Trigger Notifications ONLY on Successful Login
    await sendAuthNotification({
      event: 'LOGIN',
      name: user.name,
      email: user.email,
      ip,
      userAgent,
    });

    // 5. Create Session Token & Cookie
    const token = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      billingCycle: user.billingCycle,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionRenewalDate: user.subscriptionRenewalDate,
      charityId: user.charityId,
      charityContributionPct: user.charityContributionPct,
      handicap: user.handicap,
      homeClub: user.homeClub,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: userProfile,
    });

    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('[Login API Error]:', err);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
