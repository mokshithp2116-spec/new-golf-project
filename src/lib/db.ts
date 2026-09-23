import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { User, GolfScore, Charity, Draw, Winner, DirectDonation } from '@/types';
import {
  INITIAL_USERS,
  INITIAL_CHARITIES,
  INITIAL_GOLF_SCORES,
} from './mockData';

let dbInstance: Database.Database | null = null;
let isInitialized = false;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'digitalheroes.db');
    dbInstance = new Database(dbPath, { timeout: 10000 });
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('busy_timeout = 10000');
  }

  if (!isInitialized) {
    initDb(dbInstance);
    isInitialized = true;
  }

  return dbInstance;
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
      charity_contribution_pct INTEGER DEFAULT 10,
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
  `);

  // Seed initial users if empty
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number })?.count || 0;
    if (userCount === 0) {
      console.log('[DB] Seeding initial database records...');
      const insertUser = db.prepare(`
        INSERT INTO users (
          id, name, email, password_hash, role, subscription_status, billing_cycle,
          subscription_start_date, subscription_renewal_date, charity_id,
          charity_contribution_pct, handicap, home_club, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      db.transaction(() => {
        for (const u of INITIAL_USERS) {
          const plainPass = 'password123';
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(plainPass, salt);

          insertUser.run(
            u.id,
            u.name,
            u.email.toLowerCase(),
            hash,
            u.role,
            u.subscriptionStatus,
            u.billingCycle,
            u.subscriptionStartDate,
            u.subscriptionRenewalDate,
            u.charityId || 'charity-1',
            u.charityContributionPct || 15,
            u.handicap || 14.5,
            u.homeClub || 'City Links Club',
            u.createdAt
          );
        }

        // Seed Charities
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
            new Date().toISOString()
          );
        }

        // Seed Scores
        const insertScore = db.prepare(`
          INSERT INTO golf_scores (id, user_id, score, score_date, course_name, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const s of INITIAL_GOLF_SCORES) {
          insertScore.run(s.id, s.userId, s.score, s.date, s.courseName || 'Local Course', s.notes || '', s.createdAt);
        }
      })();
      console.log('[DB] Initial records successfully seeded!');
    }
  } catch (err) {
    // Ignore duplicate/lock errors during concurrent seeding
  }
}

// ----------------- USER DATABASE OPERATIONS -----------------

export function dbGetUserByEmail(email: string): (User & { password_hash: string }) | null {
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;
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
  const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString();

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

  return dbGetUserById(user.id);
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
