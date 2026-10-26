/**
 * Entitlements and the pack model.
 *
 * AstroSutra ships as a commercial-shaped product with a free tier and
 * optional packs. This build is open source and has no payment processor
 * connected, so `activatePack` is a local, reversible demo — nothing is
 * charged, and no card details are ever asked for. The *rules* below are the
 * real rules the UI enforces, so the free/paid split can be reviewed and
 * tested rather than described.
 *
 * All functions here are pure so the gating logic can be unit-tested without
 * a browser.
 */
export type PackId = 'questions' | 'reports' | 'family' | 'everything';

export interface Pack {
  id: PackId;
  name: string;
  tagline: string;
  includes: string[];
  /** Packs this one supersedes, for display only. */
  covers: PackId[];
}

export const PACKS: Pack[] = [
  {
    id: 'questions',
    name: 'Question pack',
    tagline: 'Keep asking Sutra',
    includes: [
      '50 additional chart-based questions',
      'Runs until used — the allowance does not expire',
      'Follow-up questions included',
    ],
    covers: ['questions'],
  },
  {
    id: 'reports',
    name: 'Report pack',
    tagline: 'The full written reports',
    includes: [
      'All five reports in full: career, love, health, money, life',
      'Every section, not just the free preview',
      'Printable pages that keep the source chart attached',
    ],
    covers: ['reports'],
  },
  {
    id: 'family',
    name: 'Family pack',
    tagline: 'Charts for the whole household',
    includes: [
      'Up to eight saved profiles instead of one',
      'Member switching everywhere in the app',
      'Compatibility between any two saved people',
    ],
    covers: ['family'],
  },
  {
    id: 'everything',
    name: 'Everything',
    tagline: 'All three packs',
    includes: ['Question pack', 'Report pack', 'Family pack', 'One activation, no renewals'],
    covers: ['questions', 'reports', 'family'],
  },
];

export const FREE_LIMITS = {
  /** Questions the free tier allows per calendar day. */
  questionsPerDay: 3,
  /** Saved profiles the free tier allows, including the main chart. */
  profiles: 1,
  /** Report sections readable before the report pack is needed. */
  reportSections: 2,
} as const;

/** Questions added by a pack on top of the daily allowance. */
const PACK_QUESTIONS = 50;

export interface Usage {
  /** Local date (YYYY-MM-DD) the counter belongs to. */
  day: string;
  /** Questions asked on that day. */
  asked: number;
  /** Questions left in a purchased pack. */
  packCredits: number;
}

export const EMPTY_USAGE: Usage = { day: '', asked: 0, packCredits: 0 };

/** Local calendar date key, YYYY-MM-DD, in the reader's own time zone. */
export function todayKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function hasPack(packs: readonly PackId[], id: PackId): boolean {
  return packs.includes('everything') || packs.includes(id);
}

export function profileLimit(packs: readonly PackId[]): number {
  return hasPack(packs, 'family') ? 8 : FREE_LIMITS.profiles;
}

export function reportSectionLimit(packs: readonly PackId[]): number {
  return hasPack(packs, 'reports') ? Number.POSITIVE_INFINITY : FREE_LIMITS.reportSections;
}

/** Rolls a stale daily counter over without mutating the stored object. */
export function rollUsage(usage: Usage, today: string): Usage {
  if (usage.day === today) return usage;
  return { ...usage, day: today, asked: 0 };
}

/** Questions still available today, including any pack credits. */
export function questionsLeft(usage: Usage, today: string): number {
  const current = rollUsage(usage, today);
  const daily = Math.max(0, FREE_LIMITS.questionsPerDay - current.asked);
  return daily + current.packCredits;
}

export function canAsk(usage: Usage, today: string): boolean {
  return questionsLeft(usage, today) > 0;
}

/**
 * Records one answered question, spending the daily allowance first and pack
 * credits only after that.
 */
export function spendQuestion(usage: Usage, today: string): Usage {
  const current = rollUsage(usage, today);
  const dailyLeft = Math.max(0, FREE_LIMITS.questionsPerDay - current.asked);
  if (dailyLeft > 0) return { ...current, asked: current.asked + 1 };
  if (current.packCredits > 0) return { ...current, packCredits: current.packCredits - 1 };
  return current;
}

/** Credits added when a pack is activated; already-held credits are kept. */
export function activate(packs: readonly PackId[], usage: Usage, id: PackId): { packs: PackId[]; usage: Usage } {
  if (packs.includes(id)) return { packs: [...packs], usage };
  const next = [...packs, id];
  if (!hasPack([id], 'questions')) return { packs: next, usage };
  return { packs: next, usage: { ...usage, packCredits: usage.packCredits + PACK_QUESTIONS } };
}

/** Human summary of what the reader currently owns. */
export function describePlan(packs: readonly PackId[], usage: Usage, today: string): string {
  if (packs.length === 0) {
    const left = questionsLeft(usage, today);
    return `Free tier · ${left} question${left === 1 ? '' : 's'} left today`;
  }
  if (hasPack(packs, 'everything')) return 'Everything pack · all features unlocked';
  const names = PACKS.filter((pack) => pack.id !== 'everything' && packs.includes(pack.id)).map((pack) => pack.name);
  return `${names.join(' + ')} · ${questionsLeft(usage, today)} questions left`;
}
