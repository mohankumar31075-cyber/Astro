import { describe, expect, it } from 'vitest';
import {
  activate,
  canAsk,
  describePlan,
  EMPTY_USAGE,
  FREE_LIMITS,
  hasPack,
  PACKS,
  profileLimit,
  questionsLeft,
  reportSectionLimit,
  rollUsage,
  spendQuestion,
  todayKey,
  type Usage,
} from './packs';

const DAY = '2026-10-26';
const usageOn = (asked: number, packCredits = 0, day = DAY): Usage => ({ day, asked, packCredits });

describe('pack catalogue', () => {
  it('offers the three packs plus a bundle, with unique ids', () => {
    const ids = PACKS.map((pack) => pack.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(['questions', 'reports', 'family', 'everything']);
  });

  it('covers every individual pack with the bundle', () => {
    const bundle = PACKS.find((pack) => pack.id === 'everything')!;
    expect(bundle.covers.sort()).toEqual(['family', 'questions', 'reports']);
  });

  it('describes each pack with at least three benefits', () => {
    for (const pack of PACKS) {
      expect(pack.name.length).toBeGreaterThan(0);
      expect(pack.tagline.length).toBeGreaterThan(0);
      expect(pack.includes.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('free tier limits', () => {
  it('allows three questions a day and one saved profile', () => {
    expect(FREE_LIMITS.questionsPerDay).toBe(3);
    expect(FREE_LIMITS.profiles).toBe(1);
    expect(FREE_LIMITS.reportSections).toBe(2);
  });

  it('counts down through the daily allowance', () => {
    expect(questionsLeft(usageOn(0), DAY)).toBe(3);
    expect(questionsLeft(usageOn(1), DAY)).toBe(2);
    expect(questionsLeft(usageOn(3), DAY)).toBe(0);
    expect(canAsk(usageOn(2), DAY)).toBe(true);
    expect(canAsk(usageOn(3), DAY)).toBe(false);
  });

  it('resets on a new local day without losing pack credits', () => {
    const yesterday = usageOn(3, 40, '2026-10-25');
    expect(rollUsage(yesterday, DAY)).toEqual({ day: DAY, asked: 0, packCredits: 40 });
    expect(questionsLeft(yesterday, DAY)).toBe(43);
  });

  it('counts pack credits on top of the daily allowance', () => {
    expect(questionsLeft(usageOn(0, 10), DAY)).toBe(13);
  });

  it('never reports a negative allowance', () => {
    expect(questionsLeft(usageOn(9), DAY)).toBe(0);
    expect(canAsk(usageOn(9), DAY)).toBe(false);
  });
});

describe('spending questions', () => {
  it('uses the daily allowance before touching pack credits', () => {
    expect(spendQuestion(usageOn(0, 5), DAY)).toEqual({ day: DAY, asked: 1, packCredits: 5 });
    expect(spendQuestion(usageOn(2, 5), DAY)).toEqual({ day: DAY, asked: 3, packCredits: 5 });
    expect(spendQuestion(usageOn(3, 5), DAY)).toEqual({ day: DAY, asked: 3, packCredits: 4 });
  });

  it('rolls the day over first, then spends from the new day', () => {
    expect(spendQuestion(usageOn(3, 0, '2026-10-25'), DAY)).toEqual({ day: DAY, asked: 1, packCredits: 0 });
  });

  it('is a no-op when nothing is left', () => {
    const spent = usageOn(3, 0);
    expect(spendQuestion(spent, DAY)).toEqual(spent);
  });

  it('never mutates the object it was given', () => {
    const usage = usageOn(0, 5);
    const next = spendQuestion(usage, DAY);
    expect(usage).toEqual(usageOn(0, 5));
    expect(next).not.toBe(usage);
  });
});

describe('activation', () => {
  it('adds 50 credits for a question pack', () => {
    const result = activate([], EMPTY_USAGE, 'questions');
    expect(result.packs).toEqual(['questions']);
    expect(result.usage.packCredits).toBe(50);
  });

  it('adds the same credits through the bundle', () => {
    const result = activate([], EMPTY_USAGE, 'everything');
    expect(result.packs).toEqual(['everything']);
    expect(result.usage.packCredits).toBe(50);
  });

  it('does not add credits for the report or family packs', () => {
    expect(activate([], EMPTY_USAGE, 'reports').usage.packCredits).toBe(0);
    expect(activate([], EMPTY_USAGE, 'family').usage.packCredits).toBe(0);
  });

  it('is idempotent, so a double click cannot double the credits', () => {
    const once = activate([], EMPTY_USAGE, 'questions');
    const twice = activate(once.packs, once.usage, 'questions');
    expect(twice.packs).toEqual(['questions']);
    expect(twice.usage.packCredits).toBe(50);
  });

  it('keeps credits already earned when another pack is added', () => {
    const first = activate([], EMPTY_USAGE, 'questions');
    const second = activate(first.packs, { ...first.usage, packCredits: 12 }, 'family');
    expect(second.packs).toEqual(['questions', 'family']);
    expect(second.usage.packCredits).toBe(12);
  });
});

describe('what a pack unlocks', () => {
  it('treats the bundle as every pack', () => {
    expect(hasPack(['everything'], 'questions')).toBe(true);
    expect(hasPack(['everything'], 'reports')).toBe(true);
    expect(hasPack(['everything'], 'family')).toBe(true);
    expect(hasPack([], 'family')).toBe(false);
    expect(hasPack(['reports'], 'family')).toBe(false);
  });

  it('raises the profile and report limits', () => {
    expect(profileLimit([])).toBe(1);
    expect(profileLimit(['questions'])).toBe(1);
    expect(profileLimit(['family'])).toBe(8);
    expect(profileLimit(['everything'])).toBe(8);

    expect(reportSectionLimit([])).toBe(2);
    expect(reportSectionLimit(['family'])).toBe(2);
    expect(reportSectionLimit(['reports'])).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('plan summary', () => {
  it('names the free tier and the questions left', () => {
    expect(describePlan([], EMPTY_USAGE, DAY)).toBe('Free tier · 3 questions left today');
    expect(describePlan([], usageOn(2), DAY)).toBe('Free tier · 1 question left today');
  });

  it('names the packs the reader owns', () => {
    expect(describePlan(['everything'], EMPTY_USAGE, DAY)).toBe('Everything pack · all features unlocked');
    expect(describePlan(['questions', 'reports'], usageOn(0, 50), DAY)).toBe(
      'Question pack + Report pack · 53 questions left',
    );
  });
});

describe('today key', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
    expect(todayKey(new Date(2026, 9, 26, 0, 1))).toBe('2026-10-26');
  });
});
