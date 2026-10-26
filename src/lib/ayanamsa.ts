/**
 * Ayanamsa — the precession offset between the tropical zodiac and the
 * sidereal zodiac used in Jyotisha.
 *
 * AstroSutra uses the Lahiri (Chitrapaksha) ayanamsa, the standard adopted by
 * the Indian Calendar Reform Committee in 1956, which fixes the star Chitra
 * (Spica) at 180° of the sidereal zodiac.
 *
 * The value is anchored at the J2000 epoch to the internationally used Lahiri
 * constant (23.853222°) and propagated with the IAU 2006 general precession in
 * longitude, which keeps it smooth and within about half an arc-minute of
 * published almanac values across 1900–2100:
 *
 *   1900 ≈ 22°27′   1950 ≈ 23°09′   2000 ≈ 23°51′
 *   2024 ≈ 24°11′   2025 ≈ 24°13′   2050 ≈ 24°34′
 *
 * Note: the true Chitrapaksha definition measured directly from Spica differs
 * from the Lahiri constant by roughly 1′ (the 1956 committee's reference
 * offset). AstroSutra follows Lahiri because that is what Indian panchangs,
 * and therefore most Vedic software, report.
 */
import { normaliseDegree } from './constants';

/** Lahiri ayanamsa at J2000.0 (1 Jan 2000, 12:00 TT), in degrees. */
export const LAHIRI_AT_J2000 = 23.853222;

const J2000_JD = 2451545.0;

/**
 * Lahiri ayanamsa in degrees for a given instant.
 * Smooth by construction, so daily values never wobble with nutation.
 */
export function lahiriAyanamsa(date: Date): number {
  const jd = date.getTime() / 86_400_000 + 2440587.5;
  const t = (jd - J2000_JD) / 36525;
  const precessionArcsec =
    5028.796195 * t +
    1.1054348 * t * t +
    0.00007964 * t * t * t -
    0.000023857 * t * t * t * t;
  return LAHIRI_AT_J2000 + precessionArcsec / 3600;
}

/** Convert a tropical ecliptic longitude to sidereal (Vedic) longitude. */
export function toSidereal(tropicalLongitude: number, date: Date): number {
  return normaliseDegree(tropicalLongitude - lahiriAyanamsa(date));
}

/** Ayanamsa as degrees / arc-minutes / arc-seconds for display. */
export function ayanamsaParts(date: Date): { degree: number; minute: number; second: number } {
  const value = lahiriAyanamsa(date);
  const degree = Math.floor(value);
  const minuteFloat = (value - degree) * 60;
  const minute = Math.floor(minuteFloat);
  return { degree, minute, second: Math.round((minuteFloat - minute) * 60) };
}

export const AYANAMSA_INFO = {
  name: 'Lahiri (Chitrapaksha)',
  description:
    'The sidereal zodiac is anchored to the star Chitra (Spica) at 180°. AstroSutra uses the Lahiri constant for J2000 propagated with IAU 2006 precession. Other ayanamsas (Raman, KP, True Chitra) differ by several arc-minutes, which can move a planet sitting right on a sign or nakshatra boundary.',
};
