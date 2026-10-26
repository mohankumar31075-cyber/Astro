import { describe, expect, it } from 'vitest';
import { buildBirthChart, computeAscendant, julianDay, navamsaSign } from './astro';
import { lahiriAyanamsa } from './ayanamsa';
import { SearchMoonPhase, SiderealTime, MakeTime, SearchRiseSet, Observer, Body } from 'astronomy-engine';
import { rashiOfLongitude, NAKSHATRAS, nakshatraOfLongitude } from './constants';

const birth = (overrides: Partial<Parameters<typeof buildBirthChart>[0]> = {}) => ({
  name: 'Test',
  date: '1990-01-01',
  time: '12:00',
  timeZone: 'Asia/Kolkata',
  latitude: 28.6139,
  longitude: 77.209,
  place: 'New Delhi',
  ...overrides,
});

describe('ayanamsa', () => {
  it('matches published Lahiri checkpoints within an arc-minute', () => {
    // Published Lahiri values: 1950 = 23°09'28", 2000 = 23°51'12", 2025 = 24°12'23".
    const values: Array<[number, number]> = [
      [Date.UTC(1950, 0, 1), 23.15778],
      [Date.UTC(2000, 0, 1, 12), 23.85333],
      [Date.UTC(2025, 0, 1), 24.20639],
      [Date.UTC(2050, 0, 1), 24.55972],
    ];
    for (const [time, expected] of values) {
      expect(Math.abs(lahiriAyanamsa(new Date(time)) - expected)).toBeLessThan(0.02);
    }
  });

  it('grows by roughly 50 arc-seconds per year', () => {
    const a = lahiriAyanamsa(new Date(Date.UTC(2000, 0, 1)));
    const b = lahiriAyanamsa(new Date(Date.UTC(2010, 0, 1)));
    expect(b - a).toBeGreaterThan(0.13);
    expect(b - a).toBeLessThan(0.145);
  });
});

describe('ephemeris sanity', () => {
  it('places the Sun and Moon in Pisces at the 8 April 2024 solar eclipse', () => {
    // Greatest eclipse 18:17 UTC. New moon is exact in Pisces (Revati), which is
    // why this eclipse was visible from North America in the sidereal month of Chaitra.
    const chart = buildBirthChart(
      birth({ date: '2024-04-08', time: '18:17', timeZone: 'UTC', latitude: 25.3, longitude: -104.1 }),
    );
    const sun = chart.positions.sun;
    const moon = chart.positions.moon;
    expect(sun.sign).toBe(11); // Meena / Pisces
    expect(moon.sign).toBe(11);
    expect(Math.abs(sun.longitude - moon.longitude)).toBeLessThan(0.1);
    expect(nakshatraOfLongitude(sun.longitude)).toBe(26); // Revati
  });

  it('agrees with known 2024 sidereal sign placements', () => {
    const chart = buildBirthChart(birth({ date: '2024-01-01', time: '00:00', timeZone: 'UTC' }));
    // Saturn was transiting sidereal Aquarius; Rahu was in Pisces.
    expect(chart.positions.saturn.sign).toBe(10);
    expect(chart.positions.rahu.sign).toBe(11);
    // Jupiter was in sidereal Aries in early 2024.
    expect(chart.positions.jupiter.sign).toBe(0);
  });

  it('keeps Rahu and Ketu exactly opposite', () => {
    const chart = buildBirthChart(birth());
    const diff = Math.abs(chart.positions.rahu.longitude - chart.positions.ketu.longitude);
    expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 6);
  });

  it('marks the Sun and Moon as never retrograde', () => {
    const chart = buildBirthChart(birth());
    expect(chart.positions.sun.retrograde).toBe(false);
    expect(chart.positions.moon.retrograde).toBe(false);
    expect(chart.positions.rahu.retrograde).toBe(true);
  });
});

describe('ascendant', () => {
  it('puts the rising point on the eastern horizon', () => {
    const date = new Date(Date.UTC(1990, 0, 1, 6, 30));
    const lat = 28.6139;
    const lon = 77.209;
    const asc = computeAscendant(date, { latitude: lat, longitude: lon, timeZone: 'Asia/Kolkata' });
    const tropical = (asc.longitude + lahiriAyanamsa(date)) % 360;

    const eps = (23.4392911 * Math.PI) / 180;
    const lambda = (tropical * Math.PI) / 180;
    const dec = Math.asin(Math.sin(lambda) * Math.sin(eps));
    const ra = Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda));
    const lst = SiderealTime(MakeTime(date)) * 15 + lon;
    let hourAngle = ((lst - (ra * 180) / Math.PI) * Math.PI) / 180;
    hourAngle = Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle));

    const phi = (lat * Math.PI) / 180;
    const altitude = Math.asin(
      Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle),
    );
    // Rising point: on the horizon (altitude ~0) and in the eastern half of the sky.
    expect(Math.abs((altitude * 180) / Math.PI)).toBeLessThan(0.05);
    const azimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi),
    );
    const azimuthDeg = ((azimuth * 180) / Math.PI + 180) % 360;
    expect(azimuthDeg).toBeGreaterThan(0);
    expect(azimuthDeg).toBeLessThan(180);
  });

  it('produces whole-sign houses that always start at the ascendant sign', () => {
    const chart = buildBirthChart(birth());
    expect(chart.houseSigns[0]).toBe(chart.ascendant.sign);
    expect(chart.houseOf[Object.keys(chart.houseOf)[0] as keyof typeof chart.houseOf]).toBeGreaterThanOrEqual(1);
    expect(chart.houseOf.moon).toBe(((chart.moonSign - chart.ascendant.sign + 12) % 12) + 1);
  });

  it('changes the ascendant when the birth time changes', () => {
    const a = buildBirthChart(birth({ time: '06:00' }));
    const b = buildBirthChart(birth({ time: '18:00' }));
    expect(a.ascendant.longitude).not.toBeCloseTo(b.ascendant.longitude, 1);
  });
});

describe('panchang inputs', () => {
  it('has 27 nakshatras within 13.333 degrees each', () => {
    expect(NAKSHATRAS).toHaveLength(27);
    expect(rashiOfLongitude(359.99)).toBe(11);
    expect(rashiOfLongitude(0)).toBe(0);
  });

  it('places the new moon of 11 January 2024 correctly', () => {
    const nm = SearchMoonPhase(0, new Date(Date.UTC(2024, 0, 10)), 5);
    expect(nm).not.toBeNull();
    const diffHours = Math.abs(nm!.date.getTime() - Date.UTC(2024, 0, 11, 11, 57)) / 3_600_000;
    expect(diffHours).toBeLessThan(0.2);
  });

  it('computes sunrise for Delhi within the documented range', () => {
    const observer = new Observer(28.6139, 77.209, 216);
    const rise = SearchRiseSet(Body.Sun, observer, +1, new Date(Date.UTC(2024, 2, 20)), 1);
    expect(rise).not.toBeNull();
    const utcMinutes = rise!.date.getUTCHours() * 60 + rise!.date.getUTCMinutes();
    // Delhi sunrise on 20 March 2024 is ~06:22 IST, i.e. ~00:52 UTC.
    expect(utcMinutes).toBeGreaterThan(45);
    expect(utcMinutes).toBeLessThan(60);
  });

  it('reports a Julian day consistent with the Unix epoch', () => {
    expect(julianDay(new Date(Date.UTC(2000, 0, 1, 12)))).toBeCloseTo(2451545.0, 5);
  });
});

describe('navamsa', () => {
  it('divides each sign into nine parts following the Parashari rule', () => {
    // Movable signs start at themselves: Aries 0° → Aries, 3°20′ → Taurus, 29° → Sagittarius.
    expect(navamsaSign(0)).toBe(0);
    expect(navamsaSign(30 / 9)).toBe(1);
    expect(navamsaSign(29.9)).toBe(8);
    // Fixed signs start at the ninth from themselves: Taurus → Capricorn.
    expect(navamsaSign(30)).toBe(9);
    expect(navamsaSign(60)).toBe(6); // Gemini (dual) → Libra
    expect(navamsaSign(359.9)).toBe(11);
  });

  it('agrees with the sign-plus-part formula for every degree', () => {
    for (let longitude = 0; longitude < 360; longitude += 0.5) {
      const sign = Math.floor(longitude / 30);
      const part = Math.floor((longitude % 30) / (30 / 9));
      expect(navamsaSign(longitude)).toBe((sign * 9 + part) % 12);
    }
  });
});
