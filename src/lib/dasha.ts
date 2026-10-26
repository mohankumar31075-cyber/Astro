/**
 * Vimshottari dasha — the 120-year planetary period system.
 *
 * The sequence starts from the lord of the Moon's birth nakshatra, and the
 * balance of that lord's period at birth is proportional to the part of the
 * nakshatra already traversed. A solar year of 365.2425 days is used (the
 * Gregorian mean year); some traditions use 360-day "savana" years, which can
 * shift dates by a few weeks.
 */
import { DASHA_YEARS, NAKSHATRAS, PLANET_ORDER, VIMSHOTTARI_TOTAL, type PlanetKey } from './constants';
import type { BirthChart } from './astro';

const YEAR_MS = 365.2425 * 86_400_000;

export type DashaLevel = 'Maha' | 'Antar' | 'Pratyantar';

export interface DashaPeriod {
  lord: PlanetKey;
  level: DashaLevel;
  start: Date;
  end: Date;
}

export interface DashaTree {
  maha: DashaPeriod;
  antar: DashaPeriod;
  pratyantar: DashaPeriod;
}

export interface DashaAtBirth {
  lord: PlanetKey;
  nakshatra: number;
  /** Years remaining in the birth mahadasha. */
  balanceYears: number;
  /** Start of the running mahadasha (may be before birth). */
  mahaStart: Date;
  mahaEnd: Date;
}

export function dashaAtBirth(chart: BirthChart): DashaAtBirth {
  const lord = NAKSHATRAS[chart.birthNakshatra].lord;
  const elapsed = chart.nakshatraElapsed;
  const years = DASHA_YEARS[lord];
  const balanceYears = years * (1 - elapsed);
  const mahaStart = new Date(chart.utc.getTime() - elapsed * years * YEAR_MS);
  const mahaEnd = new Date(mahaStart.getTime() + years * YEAR_MS);
  return { lord, nakshatra: chart.birthNakshatra, balanceYears, mahaStart, mahaEnd };
}

/** 120-year mahadasha sequence starting at the birth mahadasha. */
export function mahadashaSequence(chart: BirthChart): DashaPeriod[] {
  const { lord, mahaStart } = dashaAtBirth(chart);
  const startIndex = PLANET_ORDER.indexOf(lord);
  const periods: DashaPeriod[] = [];
  let cursor = mahaStart.getTime();
  // Three full cycles cover every realistic lifetime around the birth date.
  for (let i = 0; i < 27; i += 1) {
    const cycleLord = PLANET_ORDER[(startIndex + i) % PLANET_ORDER.length];
    const length = DASHA_YEARS[cycleLord] * YEAR_MS;
    periods.push({ lord: cycleLord, level: 'Maha', start: new Date(cursor), end: new Date(cursor + length) });
    cursor += length;
  }
  return periods;
}

function subPeriods(parent: DashaPeriod, level: DashaLevel): DashaPeriod[] {
  const startIndex = PLANET_ORDER.indexOf(parent.lord);
  const parentLength = parent.end.getTime() - parent.start.getTime();
  const periods: DashaPeriod[] = [];
  let cursor = parent.start.getTime();
  for (let i = 0; i < PLANET_ORDER.length; i += 1) {
    const lord = PLANET_ORDER[(startIndex + i) % PLANET_ORDER.length];
    const length = (parentLength * DASHA_YEARS[lord]) / VIMSHOTTARI_TOTAL;
    periods.push({ lord, level, start: new Date(cursor), end: new Date(cursor + length) });
    cursor += length;
  }
  return periods;
}

function findPeriod(periods: DashaPeriod[], at: Date): DashaPeriod | undefined {
  const t = at.getTime();
  return periods.find((p) => t >= p.start.getTime() && t < p.end.getTime());
}

export function dashaTreeAt(chart: BirthChart, at: Date): DashaTree {
  const mahas = mahadashaSequence(chart);
  const maha = findPeriod(mahas, at) ?? mahas[mahas.length - 1];
  const antars = subPeriods(maha, 'Antar');
  const antar = findPeriod(antars, at) ?? antars[antars.length - 1];
  const pratyantars = subPeriods(antar, 'Pratyantar');
  const pratyantar = findPeriod(pratyantars, at) ?? pratyantars[pratyantars.length - 1];
  return { maha, antar, pratyantar };
}

export function antardashasOf(chart: BirthChart, at: Date): DashaPeriod[] {
  const { maha } = dashaTreeAt(chart, at);
  return subPeriods(maha, 'Antar');
}

export function pratyantardashasOf(chart: BirthChart, at: Date): DashaPeriod[] {
  const { antar } = dashaTreeAt(chart, at);
  return subPeriods(antar, 'Pratyantar');
}

export function nextMahaChange(chart: BirthChart, at: Date): DashaPeriod | undefined {
  const mahas = mahadashaSequence(chart);
  return mahas.find((p) => p.start.getTime() > at.getTime());
}

/** Years (fractional) until a period ends from a given instant. */
export function yearsUntil(end: Date, from: Date): number {
  return (end.getTime() - from.getTime()) / YEAR_MS;
}

export function formatPeriodDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
