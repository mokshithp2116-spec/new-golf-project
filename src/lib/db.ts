import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { User, GolfScore, Charity, Draw, Winner } from '@/types';
import { INITIAL_CHARITIES } from './mockData';

// Pure JavaScript In-Memory & File-Backed Persistent Store
// Replaces SQLite completely to eliminate native database lock & file opening errors

interface DBStore {
  users: Array<User & { password_hash: string }>;
  scores: GolfScore[];
  charities: Charity[];
  draws: Draw[];
  winners: Winner[];
  activities: any[];
  auditLogs: any[];
}

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

const INITIAL_ADMIN_ACCOUNTS = [
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
    email: 'digital heroes@gmail.com',
    pass: 'Digiital Password12345',
  },
  {
    id: 'admin-digitalheroes-clean',
    name: 'Digital Heroes Admin',
    email: 'digitalheroes@gmail.com',
    pass: 'Digiital Password12345',
  },
];

function createInitialStore(): DBStore {
  const now = new Date().toISOString();
  const renewal = new Date(Date.now() + 365 * 86400000).toISOString();

  const users: Array<User & { password_hash: string }> = INITIAL_ADMIN_ACCOUNTS.map((adm) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adm.pass, salt);
    return {
      id: adm.id,
      name: adm.name,
      email: adm.email.toLowerCase(),
      password_hash: hash,
      role: 'admin',
      subscriptionStatus: 'active',
      billingCycle: 'yearly',
      subscriptionStartDate: now,
      subscriptionRenewalDate: renewal,
      charityId: 'charity-1',
      charityContributionPct: 25,
      handicap: 4.0,
      homeClub: 'Royal Club',
      createdAt: now,
    };
  });

  const draws: Draw[] = [
    {
      id: 'draw-current-championship',
      name: 'Current Live Championship Draw',
      drawDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      monthYear: '2026-09',
      status: 'scheduled',
      drawLogic: 'algorithmic',
      winningNumbers: [9, 17, 28, 36, 42],
      totalPrizePool: 50000,
      jackpotPool: 40700,
      tier4Pool: 16975,
      tier3Pool: 12125,
      rolloverFromPrevious: 21300,
      rolloverToNext: 0,
      totalSubscribersEntered: 1,
      publishedAt: undefined,
    },
  ];

  return {
    users,
    scores: [],
    charities: INITIAL_CHARITIES as any[],
    draws,
    winners: [],
    activities: [],
    auditLogs: [],
  };
}

let storeInstance: DBStore | null = null;

function loadStore(): DBStore {
  if (storeInstance) return storeInstance;

  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      storeInstance = JSON.parse(data);
      // Ensure admins are present
      if (storeInstance) {
        for (const adm of INITIAL_ADMIN_ACCOUNTS) {
          const cleanEmail = adm.email.toLowerCase();
          const existing = storeInstance.users.find(
            (u) => u.email.toLowerCase() === cleanEmail || u.email.replace(/\s+/g, '').toLowerCase() === cleanEmail.replace(/\s+/g, '')
          );
          if (!existing) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(adm.pass, salt);
            storeInstance.users.push({
              id: adm.id,
              name: adm.name,
              email: cleanEmail,
              password_hash: hash,
              role: 'admin',
              subscriptionStatus: 'active',
              billingCycle: 'yearly',
              subscriptionStartDate: new Date().toISOString(),
              subscriptionRenewalDate: new Date(Date.now() + 365 * 86400000).toISOString(),
              charityId: 'charity-1',
              charityContributionPct: 25,
              handicap: 4.0,
              homeClub: 'Royal Club',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
      return storeInstance!;
    }
  } catch (err) {
    console.warn('[Store Load Warning]:', err);
  }

  storeInstance = createInitialStore();
  saveStore();
  return storeInstance;
}

function saveStore(): void {
  if (!storeInstance) return;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeInstance, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store Save Warning]:', err);
  }
}

// Backward compatibility handle
export function getDb(): any {
  return {
    exec: () => {},
    prepare: () => ({ run: () => {}, get: () => null, all: () => [] }),
  };
}

// ----------------- USER OPERATIONS -----------------

export function dbGetUserByEmail(email: string): (User & { password_hash: string }) | null {
  const store = loadStore();
  const cleanEmail = email.trim().toLowerCase();
  const strippedEmail = cleanEmail.replace(/\s+/g, '');

  const user = store.users.find((u) => {
    const uEmail = u.email.trim().toLowerCase();
    return uEmail === cleanEmail || uEmail.replace(/\s+/g, '') === strippedEmail;
  });

  return user || null;
}

export function dbGetUserById(id: string): User | null {
  const store = loadStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;

  const { password_hash, ...rest } = user;
  return rest;
}

export function dbEnsureUserExists(user: Partial<User> & { id: string; email: string; name?: string }): User {
  const existing = dbGetUserById(user.id) || dbGetUserByEmail(user.email);
  if (existing) return existing;

  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + 30 * 86400000).toISOString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('defaultPass123', salt);

  const newUser: User & { password_hash: string } = {
    id: user.id,
    name: (user.name || user.email.split('@')[0]).trim(),
    email: user.email.trim().toLowerCase(),
    password_hash: hash,
    role: (user.role as any) || 'subscriber',
    subscriptionStatus: user.subscriptionStatus || 'active',
    billingCycle: user.billingCycle || 'monthly',
    subscriptionStartDate: now,
    subscriptionRenewalDate: renewalDate,
    charityId: user.charityId || 'charity-1',
    charityContributionPct: user.charityContributionPct || 15,
    handicap: user.handicap || 15.0,
    homeClub: user.homeClub || 'City Links Club',
    createdAt: now,
  };

  const store = loadStore();
  store.users.push(newUser);
  saveStore();

  const { password_hash, ...rest } = newUser;
  return rest;
}

export function dbCreateUser(
  name: string,
  email: string,
  passwordHash: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  charityId: string = 'charity-1',
  charityContributionPct: number = 15
): User {
  const store = loadStore();
  const cleanEmail = email.trim().toLowerCase();
  const id = `user-${Date.now()}`;
  const now = new Date().toISOString();
  const renewalDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString();

  const newUser: User & { password_hash: string } = {
    id,
    name: name.trim(),
    email: cleanEmail,
    password_hash: passwordHash,
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

  store.users.push(newUser);
  dbRecordActivity(id, name.trim(), cleanEmail, 'SIGNUP', `Registered with ${billingCycle} plan`);
  saveStore();

  const { password_hash, ...rest } = newUser;
  return rest;
}

export function dbUpdateUser(user: Partial<User> & { id: string }): User | null {
  const store = loadStore();
  const index = store.users.findIndex((u) => u.id === user.id);
  if (index === -1) return null;

  const existing = store.users[index];
  const updated: User & { password_hash: string } = {
    ...existing,
    name: user.name !== undefined ? user.name : existing.name,
    subscriptionStatus: user.subscriptionStatus !== undefined ? user.subscriptionStatus : existing.subscriptionStatus,
    billingCycle: user.billingCycle !== undefined ? user.billingCycle : existing.billingCycle,
    subscriptionRenewalDate: user.subscriptionRenewalDate !== undefined ? user.subscriptionRenewalDate : existing.subscriptionRenewalDate,
    charityId: user.charityId !== undefined ? user.charityId : existing.charityId,
    charityContributionPct: user.charityContributionPct !== undefined ? user.charityContributionPct : existing.charityContributionPct,
    handicap: user.handicap !== undefined ? user.handicap : existing.handicap,
    homeClub: user.homeClub !== undefined ? user.homeClub : existing.homeClub,
  };

  store.users[index] = updated;
  if (user.subscriptionStatus) {
    dbRecordActivity(updated.id, updated.name, updated.email, 'SUBSCRIBE', `Updated status to ${user.subscriptionStatus}`);
  }
  saveStore();

  const { password_hash, ...rest } = updated;
  return rest;
}

export function dbGetAllUsers(): User[] {
  const store = loadStore();
  return store.users.map(({ password_hash, ...rest }) => rest);
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
    const store = loadStore();
    const act = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      user_name: userName,
      email,
      action,
      details: details || '',
      ip_address: ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    store.activities.unshift(act);
    if (store.activities.length > 200) store.activities.pop();
    saveStore();
  } catch (err) {
    console.error('[DB Activity Log Error]:', err);
  }
}

export function dbGetActivities(limit = 20): any[] {
  const store = loadStore();
  return store.activities.slice(0, limit);
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
    const store = loadStore();
    const log = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin_name: adminName,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue || null,
      new_value: newValue || null,
      ip_address: ipAddress || '127.0.0.1',
    };
    store.auditLogs.unshift(log);
    if (store.auditLogs.length > 200) store.auditLogs.pop();
    saveStore();
  } catch (err) {
    console.error('[DB Audit Log Error]:', err);
  }
}

export function dbGetAuditLogs(limit = 50): any[] {
  const store = loadStore();
  return store.auditLogs.slice(0, limit);
}

// ----------------- DRAWS & WINNERS -----------------

export function dbGetAllDraws(): Draw[] {
  const store = loadStore();
  return store.draws;
}

export function dbSaveDraw(draw: Draw): void {
  const store = loadStore();
  const index = store.draws.findIndex((d) => d.id === draw.id);
  if (index >= 0) {
    store.draws[index] = draw;
  } else {
    store.draws.unshift(draw);
  }
  saveStore();
}

export function dbGetAllWinners(): Winner[] {
  const store = loadStore();
  return store.winners;
}

export function dbSaveWinners(winners: Winner[]): void {
  const store = loadStore();
  for (const w of winners) {
    const index = store.winners.findIndex((x) => x.id === w.id);
    if (index >= 0) {
      store.winners[index] = w;
    } else {
      store.winners.unshift(w);
    }
  }
  saveStore();
}

// ----------------- METRICS & ANALYTICS -----------------

export function dbGetLiveMetrics() {
  const store = loadStore();

  const subscribers = store.users.filter((u) => u.role === 'subscriber');
  const totalUsers = subscribers.length;
  const activeSubscribers = subscribers.filter((u) => u.subscriptionStatus === 'active').length;

  const currentDraw = store.draws.find((d) => d.status === 'scheduled') || store.draws[0];
  const jackpot = currentDraw ? currentDraw.jackpotPool : 40700;

  const totalCharityContributions = store.charities.reduce((sum, c) => sum + (c.totalRaised || 0), 0) || 5000;
  const pendingWinnersCount = store.winners.filter((w) => w.verificationStatus === 'pending').length;
  const approvedUnpaidCount = store.winners.filter((w) => w.verificationStatus === 'approved' && w.paymentStatus !== 'paid').length;

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

// ----------------- GOLF SCORES OPERATIONS -----------------

function sortScores(a: GolfScore, b: GolfScore): number {
  const timeA = new Date(a.createdAt || a.date).getTime();
  const timeB = new Date(b.createdAt || b.date).getTime();
  if (timeA !== timeB) return timeB - timeA;
  return b.id.localeCompare(a.id);
}

export function dbGetUserScores(userId: string): GolfScore[] {
  const store = loadStore();
  if (!store.scores) store.scores = [];
  return store.scores
    .filter((s) => s.userId === userId)
    .sort(sortScores)
    .slice(0, 5);
}

export function dbAddGolfScore(
  userId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; message?: string; score?: GolfScore } {
  const store = loadStore();
  if (!store.scores) store.scores = [];

  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  const now = new Date().toISOString();

  const finalScore: GolfScore = {
    id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    score,
    date: cleanDate,
    courseName: courseName || 'Local Course',
    notes: notes || '',
    createdAt: now,
  };

  store.scores.push(finalScore);

  // Rolling 5 rule (§ 05): keep latest 5 recorded scores for user (most recent first)
  const userScoresSorted = store.scores
    .filter((s) => s.userId === userId)
    .sort(sortScores);

  if (userScoresSorted.length > 5) {
    const keepIds = new Set(userScoresSorted.slice(0, 5).map((s) => s.id));
    store.scores = store.scores.filter((s) => s.userId !== userId || keepIds.has(s.id));
  }

  saveStore();
  return { success: true, score: finalScore };
}

export function dbUpdateGolfScore(
  scoreId: string,
  userId: string,
  score: number,
  date: string,
  courseName?: string,
  notes?: string
): { success: boolean; message?: string } {
  const store = loadStore();
  if (!store.scores) store.scores = [];

  const target = store.scores.find((s) => s.id === scoreId && s.userId === userId);
  if (!target) {
    return { success: false, message: 'Score record not found or access denied.' };
  }

  const cleanDate = date.includes('T') ? date.split('T')[0] : date;
  target.score = score;
  target.date = cleanDate;
  if (courseName !== undefined) target.courseName = courseName;
  if (notes !== undefined) target.notes = notes;

  saveStore();
  return { success: true };
}

export function dbDeleteGolfScore(scoreId: string, userId: string): { success: boolean; message?: string } {
  const store = loadStore();
  if (!store.scores) store.scores = [];

  const initialCount = store.scores.length;
  store.scores = store.scores.filter((s) => !(s.id === scoreId && s.userId === userId));

  if (store.scores.length === initialCount) {
    return { success: false, message: 'Score not found or unauthorized.' };
  }

  saveStore();
  return { success: true };
}

