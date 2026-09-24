import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { User, GolfScore, Charity, Draw, Winner } from '@/types';
import { INITIAL_CHARITIES } from './mockData';

import os from 'os';

declare global {
  var _sqliteDbInstance: Database.Database | null | undefined;
  var _sqliteIsInitialized: boolean | undefined;
}

export function getDb(): Database.Database {
  if (globalThis._sqliteDbInstance) {
    return globalThis._sqliteDbInstance;
  }

  const possiblePaths = [
    path.join(process.cwd(), 'data', 'digitalheroes.db'),
    path.join(process.cwd(), 'digitalheroes.db'),
    path.join(os.tmpdir(), 'digitalheroes.db'),
  ];

  let db: Database.Database | null = null;

  for (const dbPath of possiblePaths) {
    try {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      db = new Database(dbPath, { timeout: 10000 });
      try {
        db.pragma('journal_mode = WAL');
      } catch {
        try {
          db.pragma('journal_mode = DELETE');
        } catch {}
      }
      try {
        db.pragma('busy_timeout = 10000');
      } catch {}
      break;
    } catch (err) {
      console.warn(`[DB Connection Warning] Could not open database at ${dbPath}:`, err);
    }
  }

  if (!db) {
    console.warn('[DB Fallback] Initializing in-memory SQLite database');
    db = new Database(':memory:');
  }

  globalThis._sqliteDbInstance = db;

  if (!globalThis._sqliteIsInitialized) {
    try {
      initDb(db);
    } catch (err) {
      console.error('[DB Init Error]:', err);
    }
    globalThis._sqliteIsInitialized = true;
  }

  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'subscriber',
      subscription_status TEXT NOT NULL DEFAULT 'active',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      subscription_start_date TEXT,
      subscription_renewal_date TEXT,
      charity_id TEXT DEFAULT 'charity-1',
      charity_contribution_pct INTEGER DEFAULT 15,
      handicap REAL DEFAULT 15.0,
      home_club TEXT DEFAULT 'City Links Club',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS golf_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      score_date TEXT NOT NULL,
      course_name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, score_date)
    );

    CREATE TABLE IF NOT EXISTS charities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      impact_story TEXT NOT NULL,
      image_url TEXT NOT NULL,
      website_url TEXT NOT NULL,
      is_spotlight INTEGER DEFAULT 0,
      total_raised REAL DEFAULT 0,
      supporter_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS draws (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      draw_date TEXT NOT NULL,
      month_year TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      draw_logic TEXT NOT NULL DEFAULT 'algorithmic',
      winning_numbers TEXT NOT NULL,
      total_prize_pool REAL NOT NULL DEFAULT 50000,
      jackpot_pool REAL NOT NULL DEFAULT 40700,
      tier4_pool REAL NOT NULL DEFAULT 16975,
      tier3_pool REAL NOT NULL DEFAULT 12125,
      rollover_from_previous REAL NOT NULL DEFAULT 0,
      rollover_to_next REAL NOT NULL DEFAULT 0,
      total_subscribers_entered INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS winners (
      id TEXT PRIMARY KEY,
      draw_id TEXT NOT NULL,
      draw_name TEXT NOT NULL,
      draw_date TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      match_type TEXT NOT NULL,
      matched_numbers TEXT NOT NULL,
      user_scores_at_draw TEXT NOT NULL,
      prize_amount REAL NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      proof_image_url TEXT,
      proof_uploaded_at TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      paid_at TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(draw_id) REFERENCES draws(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      email TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT
    );
  `);

  // Seed / Ensure Required Admin Accounts
  const adminAccounts = [
    {
      id: 'admin-mokshith',
      name: 'Mokshith P',
      email: 'mokshithp@gmail.com',
      pass: '16421642',
    },
    {
      id: 'admin-mokshith1642',
      name: 'Mokshith P 1642',
      email: 'mokshithp1642@gmail.com',
      pass: '16421642',
    },
    {
      id: 'admin-digitalheroes',
      name: 'Digital Heroes Admin',
      email: 'Digital Heroes@gmail.com',
      pass: 'Digiital Password12345',
    },
    {
      id: 'admin-digitalheroes-clean',
      name: 'Digital Heroes Admin',
      email: 'digitalheroes@gmail.com',
      pass: 'Digiital Password12345',
    },
  ];

  try {
    const upsertUser = db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, subscription_status, billing_cycle,
        subscription_start_date, subscription_renewal_date, charity_id,
        charity_contribution_pct, handicap, home_club, created_at
      ) VALUES (?, ?, ?, ?, 'admin', 'active', 'yearly', ?, ?, 'charity-1', 25, 4.0, 'Royal Club', ?)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        role = 'admin'
    `);

    const now = new Date().toISOString();
    const renewal = new Date(Date.now() + 365 * 86400000).toISOString();

    db.transaction(() => {
      for (const adm of adminAccounts) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(adm.pass, salt);
        upsertUser.run(adm.id, adm.name, adm.email.toLowerCase(), hash, now, renewal, now);
      }

      // Seed Charities if empty
      const charityCount = (db.prepare('SELECT COUNT(*) as count FROM charities').get() as any)?.count || 0;
      if (charityCount === 0) {
        const insertCharity = db.prepare(`
          INSERT INTO charities (
            id, name, tagline, category, description, impact_story, image_url, website_url,
            is_spotlight, total_raised, supporter_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const c of INITIAL_CHARITIES) {
          insertCharity.run(
            c.id, c.name, c.tagline, c.category, c.description, c.impactStory,
            c.imageUrl, c.websiteUrl, c.isSpotlight ? 1 : 0, c.totalRaised, c.supporterCount,
            now
          );
        }
      }

      // Seed Initial Active Scheduled Draw if empty
      const drawCount = (db.prepare('SELECT COUNT(*) as count FROM draws').get() as any)?.count || 0;
      if (drawCount === 0) {
        db.prepare(`
          INSERT INTO draws (
            id, name, draw_date, month_year, status, draw_logic, winning_numbers,
            total_prize_pool, jackpot_pool, tier4_pool, tier3_pool, rollover_from_previous,
            rollover_to_next, total_subscribers_entered, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'draw-current-championship',
          'Current Live Championship Draw',
          new Date(Date.now() + 7 * 86400000).toISOString(),
          '2026-09',
          'scheduled',
          'algorithmic',
          JSON.stringify([9, 17, 28, 36, 42]),
          50000,
          40700,
          16975,
          12125,
          21300,
          0,
          1,
          now
        );
      }
    })();
  } catch (err) {
    console.error('[DB Init Error]:', err);
  }
}

// ----------------- USER DATABASE OPERATIONS -----------------

export function dbGetUserByEmail(email: string): (User & { password_hash: string }) | null {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  
  // Also handle spaces inside email strings if user types e.g. "Digital Heroes@gmail.com"
  let row = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;
  if (!row) {
    const strippedEmail = cleanEmail.replace(/\s+/g, '');
    row = db.prepare("SELECT * FROM users WHERE REPLACE(LOWER(email), ' ', '') = ?").get(strippedEmail) as any;
  }
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role as any,
    subscriptionStatus: row.subscription_status as any,
    billingCycle: row.billing_cycle as any,
    subscriptionStartDate: row.subscription_start_date,
    subscriptionRenewalDate: row.subscription_renewal_date,
    charityId: row.charity_id,
    charityContributionPct: row.charity_contribution_pct,
    handicap: row.handicap,
    homeClub: row.home_club,
    createdAt: row.created_at,
  };
}

export function dbGetUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as any,
    subscriptionStatus: row.subscription_status as any,
    billingCycle: row.billing_cycle as any,
    subscriptionStartDate: row.subscription_start_date,
    subscriptionRenewalDate: row.subscription_renewal_date,
    charityId: row.charity_id,
    charityContributionPct: row.charity_contribution_pct,
    handicap: row.handicap,
    homeClub: row.home_club,
    createdAt: row.created_at,
  };
}

export function dbEnsureUserExists(user: Partial<User> & { id: string; email: string; name?: string }): User {
  const db = getDb();
  const existing = dbGetUserById(user.id) || dbGetUserByEmail(user.email);
  if (existing) return existing;

  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('defaultPass123', salt);

  db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, subscription_status, billing_cycle,
      subscription_start_date, subscription_renewal_date, charity_id,
      charity_contribution_pct, handicap, home_club, created_at
    ) VALUES (?, ?, ?, ?, 'subscriber', 'active', 'monthly', ?, ?, 'charity-1', 15, 15.0, 'City Links Club', ?)
  `).run(
    user.id,
    (user.name || user.email.split('@')[0]).trim(),
    user.email.trim().toLowerCase(),
    hash,
    now,
    renewalDate,
    now
  );

  return dbGetUserById(user.id)!;
}

export function dbCreateUser(
  name: string,
  email: string,
  passwordHash: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  charityId: string = 'charity-1',
  charityContributionPct: number = 15
): User {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const id = `user-${Date.now()}`;
  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, subscription_status, billing_cycle,
      subscription_start_date, subscription_renewal_date, charity_id,
      charity_contribution_pct, handicap, home_club, created_at
    ) VALUES (?, ?, ?, ?, 'subscriber', 'active', ?, ?, ?, ?, ?, 15.0, 'City Links Club', ?)
  `);

  stmt.run(
    id,
    name.trim(),
    cleanEmail,
    passwordHash,
    billingCycle,
    now,
    renewalDate,
    charityId,
    Math.max(10, charityContributionPct),
    now
  );

  dbRecordActivity(id, name.trim(), cleanEmail, 'SIGNUP', `Registered with ${billingCycle} plan`);

  return {
    id,
    name: name.trim(),
    email: cleanEmail,
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle,
    subscriptionStartDate: now,
    subscriptionRenewalDate: renewalDate,
    charityId,
    charityContributionPct: Math.max(10, charityContributionPct),
    handicap: 15.0,
    homeClub: 'City Links Club',
    createdAt: now,
  };
}

export function dbUpdateUser(user: Partial<User> & { id: string }): User | null {
  const db = getDb();
  const existing = dbGetUserById(user.id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      subscription_status = COALESCE(?, subscription_status),
      billing_cycle = COALESCE(?, billing_cycle),
      subscription_renewal_date = COALESCE(?, subscription_renewal_date),
      charity_id = COALESCE(?, charity_id),
      charity_contribution_pct = COALESCE(?, charity_contribution_pct),
      handicap = COALESCE(?, handicap),
      home_club = COALESCE(?, home_club)
    WHERE id = ?
  `);

  stmt.run(
    user.name ?? null,
    user.subscriptionStatus ?? null,
    user.billingCycle ?? null,
    user.subscriptionRenewalDate ?? null,
    user.charityId ?? null,
    user.charityContributionPct ?? null,
    user.handicap ?? null,
    user.homeClub ?? null,
    user.id
  );

  const updated = dbGetUserById(user.id);
  if (updated && user.subscriptionStatus) {
    dbRecordActivity(updated.id, updated.name, updated.email, 'SUBSCRIBE', `Updated status to ${user.subscriptionStatus}`);
  }

  return updated;
}

export function dbGetAllUsers(): User[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, email, role, subscription_status, billing_cycle, subscription_start_date, subscription_renewal_date, charity_id, charity_contribution_pct, handicap, home_club, created_at FROM users').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    subscriptionStatus: r.subscription_status,
    billingCycle: r.billing_cycle,
    subscriptionStartDate: r.subscription_start_date,
    subscriptionRenewalDate: r.subscription_renewal_date,
    charityId: r.charity_id,
    charityContributionPct: r.charity_contribution_pct,
    handicap: r.handicap,
    homeClub: r.home_club,
    createdAt: r.created_at,
  }));
}

// ----------------- LIVE ACTIVITY & AUDIT LOGS -----------------

export function dbRecordActivity(
  userId: string,
  userName: string,
  email: string,
  action: string,
  details?: string,
  ipAddress?: string
) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO user_activity (id, user_id, user_name, email, action, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName,
      email,
      action,
      details || '',
      ipAddress || '127.0.0.1',
      new Date().toISOString()
    );
  } catch (err) {
    console.error('[DB Activity Log Error]:', err);
  }
}

export function dbGetActivities(limit = 20): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM user_activity ORDER BY timestamp DESC LIMIT ?').all(limit);
}

export function dbRecordAuditLog(
  adminName: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue?: string,
  newValue?: string,
  ipAddress?: string
) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, admin_name, action, entity, entity_id, old_value, new_value, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${Date.now()}`,
      new Date().toISOString(),
      adminName,
      action,
      entity,
      entityId,
      oldValue || null,
      newValue || null,
      ipAddress || '127.0.0.1'
    );
  } catch (err) {
    console.error('[DB Audit Log Error]:', err);
  }
}

export function dbGetAuditLogs(limit = 50): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
}

// ----------------- DRAWS & WINNERS OPERATIONS -----------------

export function dbGetAllDraws(): Draw[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM draws ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    drawDate: r.draw_date,
    monthYear: r.month_year,
    status: r.status,
    drawLogic: r.draw_logic,
    winningNumbers: JSON.parse(r.winning_numbers || '[]'),
    totalPrizePool: r.total_prize_pool,
    jackpotPool: r.jackpot_pool,
    tier4Pool: r.tier4_pool,
    tier3Pool: r.tier3_pool,
    rolloverFromPrevious: r.rollover_from_previous,
    rolloverToNext: r.rollover_to_next,
    totalSubscribersEntered: r.total_subscribers_entered,
    publishedAt: r.published_at,
  }));
}

export function dbSaveDraw(draw: Draw): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO draws (
      id, name, draw_date, month_year, status, draw_logic, winning_numbers,
      total_prize_pool, jackpot_pool, tier4_pool, tier3_pool, rollover_from_previous,
      rollover_to_next, total_subscribers_entered, published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      draw_date = excluded.draw_date,
      month_year = excluded.month_year,
      status = excluded.status,
      draw_logic = excluded.draw_logic,
      winning_numbers = excluded.winning_numbers,
      total_prize_pool = excluded.total_prize_pool,
      jackpot_pool = excluded.jackpot_pool,
      tier4_pool = excluded.tier4_pool,
      tier3_pool = excluded.tier3_pool,
      rollover_from_previous = excluded.rollover_from_previous,
      rollover_to_next = excluded.rollover_to_next,
      total_subscribers_entered = excluded.total_subscribers_entered,
      published_at = excluded.published_at
  `).run(
    draw.id,
    draw.name,
    draw.drawDate,
    draw.monthYear,
    draw.status,
    draw.drawLogic,
    JSON.stringify(draw.winningNumbers || []),
    draw.totalPrizePool,
    draw.jackpotPool,
    draw.tier4Pool,
    draw.tier3Pool,
    draw.rolloverFromPrevious,
    draw.rolloverToNext,
    draw.totalSubscribersEntered,
    draw.publishedAt || null,
    now
  );
}

export function dbGetAllWinners(): Winner[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM winners ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    drawId: r.draw_id,
    drawName: r.draw_name,
    drawDate: r.draw_date,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    matchType: r.match_type,
    matchedNumbers: JSON.parse(r.matched_numbers || '[]'),
    userScoresAtDraw: JSON.parse(r.user_scores_at_draw || '[]'),
    prizeAmount: r.prize_amount,
    verificationStatus: r.verification_status,
    proofImageUrl: r.proof_image_url,
    proofUploadedAt: r.proof_uploaded_at,
    paymentStatus: r.payment_status,
    paidAt: r.paid_at,
    adminNotes: r.admin_notes,
    createdAt: r.created_at,
  }));
}

export function dbSaveWinners(winners: Winner[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO winners (
      id, draw_id, draw_name, draw_date, user_id, user_name, user_email,
      match_type, matched_numbers, user_scores_at_draw, prize_amount,
      verification_status, proof_image_url, proof_uploaded_at, payment_status,
      paid_at, admin_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      verification_status = excluded.verification_status,
      proof_image_url = excluded.proof_image_url,
      proof_uploaded_at = excluded.proof_uploaded_at,
      payment_status = excluded.payment_status,
      paid_at = excluded.paid_at,
      admin_notes = excluded.admin_notes
  `);

  db.transaction(() => {
    for (const w of winners) {
      stmt.run(
        w.id,
        w.drawId,
        w.drawName,
        w.drawDate,
        w.userId,
        w.userName,
        w.userEmail,
        w.matchType,
        JSON.stringify(w.matchedNumbers || []),
        JSON.stringify(w.userScoresAtDraw || []),
        w.prizeAmount,
        w.verificationStatus || 'pending',
        w.proofImageUrl || null,
        w.proofUploadedAt || null,
        w.paymentStatus || 'pending',
        w.paidAt || null,
        w.adminNotes || null,
        w.createdAt || new Date().toISOString()
      );
    }
  })();
}

// ----------------- METRICS & ANALYTICS -----------------

export function dbGetLiveMetrics() {
  const db = getDb();

  const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'subscriber'").get() as any)?.count || 0;
  const activeSubscribers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'subscriber' AND subscription_status = 'active'").get() as any)?.count || 0;
  
  const currentDraw = db.prepare("SELECT * FROM draws WHERE status = 'scheduled' ORDER BY created_at DESC LIMIT 1").get() as any;
  const jackpot = currentDraw ? currentDraw.jackpot_pool : 40700;

  const totalCharityContributions = (db.prepare('SELECT SUM(total_raised) as sum FROM charities').get() as any)?.sum || 5000;
  const pendingWinnersCount = (db.prepare("SELECT COUNT(*) as count FROM winners WHERE verification_status = 'pending'").get() as any)?.count || 0;
  const approvedUnpaidCount = (db.prepare("SELECT COUNT(*) as count FROM winners WHERE verification_status = 'approved' AND payment_status != 'paid'").get() as any)?.count || 0;

  return {
    totalUsers,
    activeSubscribers,
    jackpotPool: jackpot,
    totalCharityContributions,
    pendingWinnersCount,
    approvedUnpaidCount,
    mrr: activeSubscribers * 19,
    arr: activeSubscribers * 19 * 12,
  };
}
