import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb, dbGetUserById } from '@/lib/db';
import { GolfScore } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/scores - Retrieve latest 5 rolling golf scores for the authenticated user
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM golf_scores WHERE user_id = ? ORDER BY score_date DESC LIMIT 5')
      .all(session.id) as any[];

    const scores: GolfScore[] = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      score: r.score,
      date: r.score_date,
      courseName: r.course_name,
      notes: r.notes,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, scores });
  } catch (err: any) {
    console.error('[GET /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error loading scores' }, { status: 500 });
  }
}

// POST /api/scores - Add new golf score for authenticated user (strictly server-enforced userId)
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score, date, courseName, notes } = body;
    const scoreNum = parseInt(score, 10);

    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return NextResponse.json(
        { success: false, message: 'Stableford score must be an integer between 1 and 45.' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'A valid round date is required.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check duplicate date for THIS authenticated user
    const existingDate = db
      .prepare('SELECT id FROM golf_scores WHERE user_id = ? AND score_date = ?')
      .get(session.id, date);

    if (existingDate) {
      return NextResponse.json(
        { success: false, message: `A score for date ${date} already exists for your account.` },
        { status: 409 }
      );
    }

    const newId = `sc-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO golf_scores (id, user_id, score, score_date, course_name, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, session.id, scoreNum, date, courseName || 'Local Course', notes || '', now);

    // Evict oldest score if total exceeds 5 for this user
    const userScores = db
      .prepare('SELECT id FROM golf_scores WHERE user_id = ? ORDER BY score_date DESC')
      .all(session.id) as any[];

    if (userScores.length > 5) {
      const idsToKeep = userScores.slice(0, 5).map((s) => s.id);
      db.prepare(`DELETE FROM golf_scores WHERE user_id = ? AND id NOT IN (${idsToKeep.map(() => '?').join(',')})`)
        .run(session.id, ...idsToKeep);
    }

    return NextResponse.json({
      success: true,
      message: 'Score added successfully.',
      score: {
        id: newId,
        userId: session.id,
        score: scoreNum,
        date,
        courseName: courseName || 'Local Course',
        notes: notes || '',
        createdAt: now,
      },
    });
  } catch (err: any) {
    console.error('[POST /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error saving score' }, { status: 500 });
  }
}

// PUT /api/scores - Update score for authenticated user (strictly verifies ownership)
export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scoreId, score, date, courseName, notes } = body;
    const scoreNum = parseInt(score, 10);

    if (!scoreId) {
      return NextResponse.json({ success: false, message: 'Score ID is required.' }, { status: 400 });
    }

    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return NextResponse.json(
        { success: false, message: 'Stableford score must be an integer between 1 and 45.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify ownership: score MUST belong to session.id
    const target = db.prepare('SELECT * FROM golf_scores WHERE id = ? AND user_id = ?').get(scoreId, session.id);
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Score record not found or access denied.' },
        { status: 403 }
      );
    }

    // Check duplicate date on update
    const duplicate = db
      .prepare('SELECT id FROM golf_scores WHERE user_id = ? AND id != ? AND score_date = ?')
      .get(session.id, scoreId, date);

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: `Another score for date ${date} already exists.` },
        { status: 409 }
      );
    }

    db.prepare(`
      UPDATE golf_scores SET
        score = ?,
        score_date = ?,
        course_name = ?,
        notes = ?
      WHERE id = ? AND user_id = ?
    `).run(scoreNum, date, courseName ?? '', notes ?? '', scoreId, session.id);

    return NextResponse.json({ success: true, message: 'Score updated successfully.' });
  } catch (err: any) {
    console.error('[PUT /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error updating score' }, { status: 500 });
  }
}

// DELETE /api/scores - Delete score for authenticated user (strictly verifies ownership)
export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('id');

    if (!scoreId) {
      return NextResponse.json({ success: false, message: 'Score ID is required.' }, { status: 400 });
    }

    const db = getDb();
    const res = db.prepare('DELETE FROM golf_scores WHERE id = ? AND user_id = ?').run(scoreId, session.id);

    if (res.changes === 0) {
      return NextResponse.json(
        { success: false, message: 'Score not found or unauthorized.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: 'Score deleted successfully.' });
  } catch (err: any) {
    console.error('[DELETE /api/scores Error]:', err);
    return NextResponse.json({ success: false, message: 'Server error deleting score' }, { status: 500 });
  }
}
