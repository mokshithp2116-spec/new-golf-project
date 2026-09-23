import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbGetUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const user = dbGetUserById(session.id);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error('[Session API Error]:', err);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
