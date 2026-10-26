import { describe, expect, it } from 'vitest';
import { buildBirthChart } from './astro';
import { dashaAtBirth, dashaTreeAt, mahadashaSequence, antardashasOf } from './dasha';
import { computePanchang, karanaNameFor, phaseName } from './panchang';
import { analyseChart } from './yogas';
import { computeMatch, verdictFor } from './matching';
import { formatOffset, zonedToUtc, zoneOffsetMinutes, utcToZonedParts } from './time';
import { DASHA_YEARS, NAKSHATRAS, PLANETS } from './constants';
import { sadeSati, currentTransits } from './transits';

const person = (name: string, date: string, time: string, place = { lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' }) => ({
  name,
  date,
  time,
  timeZone: place.tz,
  latitude: place.lat,
  longitude: place.lon,
  place: 'Test place',
});

describe('time zone handling', () => {
  it('converts Indian civil time to UTC', () => {
    const utc = zonedToUtc('1990-01-01', '12:00', 'Asia/Kolkata');
    expect(utc.toISOString()).toBe('1990-01-01T06:30:00.000Z');
  });

  it('handles a US DST transition', () => {
    expect(zoneOffsetMinutes(new Date('2024-03-09T12:00:00Z'), 'America/New_York')).toBe(-300);
    expect(zoneOffsetMinutes(new Date('2024-03-11T12:00:00Z'), 'America/New_York')).toBe(-240);
    const before = zonedToUtc('2024-03-10', '01:30', 'America/New_York');
    expect(before.toISOString()).toBe('2024-03-10T06:30:00.000Z');
  });

  it('round-trips wall clock time in a zone', () => {
    const utc = zonedToUtc('2001-07-15', '04:17', 'Asia/Kolkata');
    const parts = utcToZonedParts(utc, 'Asia/Kolkata');
    expect(parts.hour).toBe(4);
    expect(parts.minute).toBe(17);
    expect(parts.day).toBe(15);
  });

  it('formats offsets', () => {
    expect(formatOffset(330)).toBe('UTC+05:30');
    expect(formatOffset(-240)).toBe('UTC-04:00');
  });
});

describe('vimshottari dasha', () => {
  const chart = buildBirthChart(person('Dasha', '1990-01-01', '12:00'));

  it('starts from the lord of the birth nakshatra', () => {
    const atBirth = dashaAtBirth(chart);
    expect(atBirth.lord).toBe(NAKSHATRAS[chart.birthNakshatra].lord);
    expect(atBirth.balanceYears).toBeGreaterThan(0);
    expect(atBirth.balanceYears).toBeLessThanOrEqual(DASHA_YEARS[atBirth.lord]);
  });

  it('reports the birth mahadasha for the birth instant', () => {
    const tree = dashaTreeAt(chart, chart.utc);
    expect(tree.maha.lord).toBe(dashaAtBirth(chart).lord);
    expect(tree.maha.start.getTime()).toBeLessThanOrEqual(chart.utc.getTime());
    expect(tree.maha.end.getTime()).toBeGreaterThan(chart.utc.getTime());
  });

  it('builds a contiguous 120-year cycle', () => {
    const sequence = mahadashaSequence(chart);
    expect(sequence).toHaveLength(27);
    const cycle = sequence.slice(0, 9);
    expect(cycle.reduce((sum, p) => sum + (p.end.getTime() - p.start.getTime()), 0) / (365.2425 * 86_400_000)).toBeCloseTo(120, 6);
    for (let i = 1; i < sequence.length; i += 1) {
      expect(sequence[i].start.getTime()).toBe(sequence[i - 1].end.getTime());
    }
  });

  it('divides a mahadasha into nine antardashas of the right lengths', () => {
    const tree = dashaTreeAt(chart, chart.utc);
    const antars = antardashasOf(chart, chart.utc);
    expect(antars).toHaveLength(9);
    expect(antars[0].lord).toBe(tree.maha.lord);
    const total = antars.reduce((sum, p) => sum + (p.end.getTime() - p.start.getTime()), 0);
    expect(total).toBeCloseTo(tree.maha.end.getTime() - tree.maha.start.getTime(), 0);
    const sunAntar = antars.find((p) => p.lord === 'sun')!;
    const proportion = (sunAntar.end.getTime() - sunAntar.start.getTime()) / total;
    expect(proportion).toBeCloseTo(DASHA_YEARS.sun / 120, 4);
  });

  it('changes dasha as time moves', () => {
    const now = new Date('2035-01-01T00:00:00Z');
    expect(dashaTreeAt(chart, now).maha.lord).not.toBe(dashaTreeAt(chart, chart.utc).maha.lord);
  });
});

describe('panchang', () => {
  const place = { latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata', place: 'New Delhi' };

  it('identifies Amavasya on 8 April 2024', () => {
    const p = computePanchang(new Date('2024-04-08T06:00:00Z'), place);
    expect(p.tithi.name).toBe('Amavasya');
    expect(p.tithi.paksha).toBe('Krishna');
    // At sunrise the Moon is ~10° before the eclipse degree, in the last pada of
    // Uttara Bhadrapada; it reaches Revati later in the day.
    expect(p.nakshatra.name).toBe('Uttara Bhadrapada');
    expect(p.sunrise).not.toBeNull();
    expect(p.sunset).not.toBeNull();
    expect(p.dayLengthMinutes!).toBeGreaterThan(700);
    expect(p.dayLengthMinutes!).toBeLessThan(800);
  });

  it('identifies Purnima on 25 March 2024', () => {
    const p = computePanchang(new Date('2024-03-25T06:00:00Z'), place);
    expect(p.tithi.name).toBe('Purnima');
    expect(p.tithi.paksha).toBe('Shukla');
    expect(p.illumination).toBeGreaterThan(98);
  });

  it('computes Rahu Kaal as the last eighth of a Sunday', () => {
    const p = computePanchang(new Date('2024-04-07T06:00:00Z'), place); // Sunday
    expect(p.weekday.english).toBe('Sunday');
    expect(p.rahuKaal).not.toBeNull();
    const { start, end } = p.rahuKaal!;
    expect(Math.abs(end.getTime() - p.sunset!.getTime())).toBeLessThan(1000);
    expect(end.getTime() - start.getTime()).toBeCloseTo((p.sunset!.getTime() - p.sunrise!.getTime()) / 8, -3);
  });

  it('maps karana indices to the classical eleven names', () => {
    expect(karanaNameFor(0)).toBe('Kimstughna');
    expect(karanaNameFor(1)).toBe('Bav');
    expect(karanaNameFor(8)).toBe('Bav');
    expect(karanaNameFor(57)).toBe('Shakuni');
    expect(karanaNameFor(58)).toBe('Chatushpada');
    expect(karanaNameFor(59)).toBe('Naga');
    const names = new Set(Array.from({ length: 60 }, (_, i) => karanaNameFor(i)));
    expect(names.size).toBe(11);
  });

  it('names moon phases', () => {
    expect(phaseName(1)).toBe('New Moon');
    expect(phaseName(90)).toBe('First Quarter');
    expect(phaseName(181)).toBe('Full Moon');
    expect(phaseName(300)).toBe('Waning Crescent');
  });

  it('returns the same tithi for a whole day except at boundaries', () => {
    const morning = computePanchang(new Date('2024-06-15T02:00:00Z'), place);
    const evening = computePanchang(new Date('2024-06-15T14:00:00Z'), place);
    expect(['Shukla', 'Krishna']).toContain(morning.tithi.paksha);
    expect(Math.abs(morning.tithi.number - evening.tithi.number)).toBeLessThanOrEqual(1);
  });
});

describe('matching', () => {
  const a = buildBirthChart(person('Asha', '1992-08-14', '22:45'));
  const b = buildBirthChart(person('Rohan', '1990-02-03', '05:10'));

  it('scores eight kootas out of 36 without rounding drift', () => {
    const match = computeMatch(a, b);
    expect(match.kootas).toHaveLength(8);
    expect(match.kootas.reduce((sum, k) => sum + k.max, 0)).toBe(36);
    expect(match.total).toBeCloseTo(match.kootas.reduce((sum, k) => sum + k.score, 0), 5);
    expect(match.percentage).toBeCloseTo((match.total / 36) * 100, 5);
  });

  it('is symmetric once the traditional bride/groom roles are held fixed', () => {
    // Varna is the one directional koota (the classical rule compares the
    // groom's varna against the bride's), so swapping partners while keeping
    // the role assignment must not change the total.
    const forward = computeMatch(a, b, { groomSide: 'b' });
    const reverse = computeMatch(b, a, { groomSide: 'a' });
    expect(forward.total).toBe(reverse.total);
  });

  it('applies classical koota rules', () => {
    const same = computeMatch(a, a);
    expect(same.kootas.find((k) => k.key === 'yoni')!.score).toBe(4);
    expect(same.kootas.find((k) => k.key === 'gana')!.score).toBe(6);
    expect(same.kootas.find((k) => k.key === 'nadi')!.score).toBe(0);
    expect(same.kootas.find((k) => k.key === 'bhakoot')!.score).toBe(7);
  });

  it('bands the verdict consistently', () => {
    expect(verdictFor(34).tone).toBe('excellent');
    expect(verdictFor(26).tone).toBe('excellent');
    expect(verdictFor(20).tone).toBe('good');
    expect(verdictFor(14).tone).toBe('mixed');
    expect(verdictFor(6).tone).toBe('challenging');
  });

  it('explains every koota', () => {
    const match = computeMatch(a, b);
    for (const koota of match.kootas) {
      expect(koota.detail.length).toBeGreaterThan(40);
      expect(koota.score).toBeGreaterThanOrEqual(0);
      expect(koota.score).toBeLessThanOrEqual(koota.max);
    }
  });
});

describe('yogas and doshas', () => {
  it('produces explained factors for a chart', () => {
    const chart = buildBirthChart(person('Yoga', '1988-11-11', '09:30'));
    const factors = analyseChart(chart);
    expect(factors.length).toBeGreaterThan(0);
    for (const factor of factors) {
      expect(factor.detail.length).toBeGreaterThan(30);
      expect(factor.guidance.length).toBeGreaterThan(20);
      expect(PLANETS[factor.planets[0]]).toBeDefined();
    }
  });

  it('flags Mangal dosha whenever Mars is in a flagged house', () => {
    // Search a spread of dates for a Mars placement that must trigger the rule.
    let found = false;
    for (let month = 0; month < 12 && !found; month += 1) {
      const chart = buildBirthChart(person('Mars', `1995-${String(month + 1).padStart(2, '0')}-15`, '10:00'));
      const factor = analyseChart(chart).find((f) => f.id === 'mangal-dosha')!;
      const marsHouse = chart.houseOf.mars;
      const fromMoon = ((chart.positions.mars.sign - chart.moonSign + 12) % 12) + 1;
      const shouldFlag = [1, 4, 7, 8, 12].includes(marsHouse) || [1, 4, 7, 8, 12].includes(fromMoon);
      expect(factor.present).toBe(shouldFlag);
      if (shouldFlag) found = true;
    }
    expect(found).toBe(true);
  });
});

describe('transits', () => {
  it('returns all nine grahas with houses from the Moon', () => {
    const chart = buildBirthChart(person('Transit', '1990-01-01', '12:00'));
    const transits = currentTransits(chart, new Date('2026-10-26T00:00:00Z'));
    expect(transits).toHaveLength(9);
    for (const t of transits) {
      expect(t.houseFromMoon).toBeGreaterThanOrEqual(1);
      expect(t.houseFromMoon).toBeLessThanOrEqual(12);
    }
  });

  it('detects Sade Sati only when Saturn is 12th, 1st or 2nd from the Moon', () => {
    const chart = buildBirthChart(person('Sade', '1990-01-01', '12:00'));
    const result = sadeSati(chart, new Date('2026-10-26T00:00:00Z'));
    expect([12, 1, 2]).toContain(result.houseFromMoon);
    expect(result.active).toBe(true);
    expect(result.phase).not.toBeNull();
    expect(result.phaseStart).not.toBeNull();
    expect(result.phaseEnd).not.toBeNull();
    expect(result.phaseStart!.getTime()).toBeLessThan(result.phaseEnd!.getTime());
  });
});
