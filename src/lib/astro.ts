/**
 * AstroSutra — sidereal astronomy layer.
 *
 * Computes real planetary positions (JPL-derived ephemeris through the
 * Astronomy Engine library, MIT) and converts them to the sidereal zodiac using
 * the Chitrapaksha ayanamsa. House system: whole-sign (rashi) houses, the
 * classical default of Vedic astrology.
 */
import { Body, Ecliptic, EclipticGeoMoon, GeoVector, MakeTime, SiderealTime } from 'astronomy-engine';
import {
  PLANETS,
  RASHIS,
  NAKSHATRAS,
  NAKSHATRA_SPAN,
  GRAHA_ORDER,
  nakshatraOfLongitude,
  normaliseDegree,
  padaOfLongitude,
  rashiOfLongitude,
  type PlanetKey,
} from './constants';
import { lahiriAyanamsa } from './ayanamsa';
import { zonedToUtc, type BirthInput } from './time';

export type Dignity =
  | 'Exalted'
  | 'Moolatrikona'
  | 'Own sign'
  | 'Friendly'
  | 'Neutral'
  | 'Enemy'
  | 'Debilitated';

export interface GrahaPosition {
  key: PlanetKey;
  /** Sidereal longitude, 0-360. */
  longitude: number;
  tropicalLongitude: number;
  /** Degrees travelled per day; negative means retrograde. */
  speed: number;
  retrograde: boolean;
  combust: boolean;
  sign: number;
  degreeInSign: number;
  nakshatra: number;
  pada: number;
  dignity: Dignity;
  house: number;
  /** Sign indices aspected by whole-sign graha drishti (includes own sign). */
  aspects: number[];
  description: string;
}

export interface LagnaInfo {
  longitude: number;
  sign: number;
  degreeInSign: number;
  nakshatra: number;
  pada: number;
  lord: PlanetKey;
  midheaven: number;
}

export interface BirthChart {
  input: BirthInput;
  utc: Date;
  ayanamsa: number;
  julianDay: number;
  siderealTimeHours: number;
  ascendant: LagnaInfo;
  positions: Record<PlanetKey, GrahaPosition>;
  /** Sign index for each house 1..12 (whole-sign houses). */
  houseSigns: number[];
  /** House index (1..12) for each planet. */
  houseOf: Record<PlanetKey, number>;
  moonSign: number;
  sunSign: number;
  /** Nakshatra of the Moon — the anchor of the Vimshottari cycle. */
  birthNakshatra: number;
  /** Unelapsed fraction of the birth nakshatra (0 → just started). */
  nakshatraElapsed: number;
  timePrecision: 'exact' | 'unknown';
}

const NATURAL_FRIENDS: Record<PlanetKey, PlanetKey[]> = {
  sun: ['moon', 'mars', 'jupiter'],
  moon: ['sun', 'mercury'],
  mars: ['sun', 'moon', 'jupiter'],
  mercury: ['sun', 'venus'],
  jupiter: ['sun', 'moon', 'mars'],
  venus: ['mercury', 'saturn'],
  saturn: ['mercury', 'venus'],
  rahu: ['mercury', 'venus', 'saturn'],
  ketu: ['mars', 'venus', 'saturn'],
};

const NATURAL_ENEMIES: Record<PlanetKey, PlanetKey[]> = {
  sun: ['venus', 'saturn', 'rahu', 'ketu'],
  moon: ['rahu', 'ketu'],
  mars: ['mercury', 'rahu'],
  mercury: ['moon'],
  jupiter: ['mercury', 'venus', 'rahu', 'ketu'],
  venus: ['sun', 'moon'],
  saturn: ['sun', 'moon', 'mars'],
  rahu: ['sun', 'moon', 'mars'],
  ketu: ['sun', 'moon'],
};

const MOOLATRIKONA: Partial<Record<PlanetKey, { sign: number; from: number; to: number }>> = {
  sun: { sign: 4, from: 0, to: 20 },
  moon: { sign: 1, from: 4, to: 30 },
  mars: { sign: 0, from: 0, to: 12 },
  mercury: { sign: 5, from: 16, to: 20 },
  jupiter: { sign: 8, from: 0, to: 10 },
  venus: { sign: 6, from: 0, to: 15 },
  saturn: { sign: 10, from: 0, to: 20 },
};

export const COMBUSTION_ORB: Partial<Record<PlanetKey, { direct: number; retrograde: number }>> = {
  moon: { direct: 12, retrograde: 12 },
  mars: { direct: 17, retrograde: 17 },
  mercury: { direct: 14, retrograde: 12 },
  jupiter: { direct: 11, retrograde: 11 },
  venus: { direct: 10, retrograde: 8 },
  saturn: { direct: 15, retrograde: 15 },
};

export function julianDay(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/** Mean obliquity of the ecliptic in degrees (Meeus, 22.2). */
function obliquity(date: Date): number {
  const t = (julianDay(date) - 2451545.0) / 36525;
  return (
    23.439291111 -
    0.0130041667 * t -
    1.6388889e-7 * t * t +
    5.0361111e-7 * t * t * t
  );
}

function siderealLongitudeOfBody(body: Body, date: Date, ayanamsa: number): number {
  if (body === Body.Moon) {
    const moon = EclipticGeoMoon(date);
    return normaliseDegree(moon.lon - ayanamsa);
  }
  const vector = GeoVector(body, MakeTime(date), true);
  const ecliptic = Ecliptic(vector);
  return normaliseDegree(ecliptic.elon - ayanamsa);
}

/** Mean lunar node (Rahu) in the tropical zodiac of date (Meeus, 47.7). */
function meanNodeTropical(date: Date): number {
  const t = (julianDay(date) - 2451545.0) / 36525;
  return normaliseDegree(
    125.0445479 -
      1934.1362891 * t +
      0.0020754 * t * t +
      (t * t * t) / 467441 -
      (t * t * t * t) / 60616000,
  );
}

/** Sidereal longitude of a single graha at an instant (cheap; no full chart). */
export function planetLongitude(key: PlanetKey, date: Date, ayanamsa = lahiriAyanamsa(date)): number {
  if (key === 'rahu') return normaliseDegree(meanNodeTropical(date) - ayanamsa);
  if (key === 'ketu') return normaliseDegree(meanNodeTropical(date) - ayanamsa + 180);
  return siderealLongitudeOfBody(BODY_FOR[key], date, ayanamsa);
}

const BODY_FOR: Record<Exclude<PlanetKey, 'rahu' | 'ketu'>, Body> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mars: Body.Mars,
  mercury: Body.Mercury,
  jupiter: Body.Jupiter,
  venus: Body.Venus,
  saturn: Body.Saturn,
};

export function dignityOf(key: PlanetKey, sign: number, degreeInSign: number): Dignity {
  const info = PLANETS[key];
  if (info.exaltation && info.exaltation.sign === sign) return 'Exalted';
  if (info.debilitation && info.debilitation.sign === sign) return 'Debilitated';
  const mt = MOOLATRIKONA[key];
  if (mt && mt.sign === sign && degreeInSign >= mt.from && degreeInSign < mt.to) return 'Moolatrikona';
  if (info.owns.includes(sign)) return 'Own sign';
  const lord = RASHIS[sign].lord;
  if (NATURAL_FRIENDS[key].includes(lord)) return 'Friendly';
  if (NATURAL_ENEMIES[key].includes(lord)) return 'Enemy';
  return 'Neutral';
}

export function naturalRelation(a: PlanetKey, b: PlanetKey): 'friend' | 'enemy' | 'neutral' {
  if (NATURAL_FRIENDS[a].includes(b)) return 'friend';
  if (NATURAL_ENEMIES[a].includes(b)) return 'enemy';
  return 'neutral';
}

/** Whole-sign graha drishti: every graha sees the 7th; Mars/Jupiter/Saturn have extras. */
export function aspectsOf(key: PlanetKey, sign: number): number[] {
  const offsets = [7];
  if (key === 'mars') offsets.push(4, 8);
  if (key === 'jupiter') offsets.push(5, 9);
  if (key === 'saturn') offsets.push(3, 10);
  if (key === 'rahu' || key === 'ketu') offsets.push(5, 9);
  return offsets.map((offset) => (sign + offset - 1) % 12);
}

export function computePositions(date: Date, ayanamsa: number): Record<PlanetKey, Omit<GrahaPosition, 'house'>> {
  const positions = {} as Record<PlanetKey, Omit<GrahaPosition, 'house'>>;
  const sunLongitude = siderealLongitudeOfBody(Body.Sun, date, ayanamsa);
  const hourMs = 3_600_000;

  for (const key of GRAHA_ORDER) {
    let longitude: number;
    let speed: number;
    let retrograde = false;

    if (key === 'rahu' || key === 'ketu') {
      const rahu = normaliseDegree(meanNodeTropical(date) - ayanamsa);
      longitude = key === 'rahu' ? rahu : normaliseDegree(rahu + 180);
      const next = normaliseDegree(meanNodeTropical(new Date(date.getTime() + 86_400_000)) - ayanamsa);
      speed = signedDelta(longitude, key === 'rahu' ? next : normaliseDegree(next + 180));
      retrograde = true;
    } else {
      const body = BODY_FOR[key];
      longitude = siderealLongitudeOfBody(body, date, ayanamsa);
      const before = siderealLongitudeOfBody(body, new Date(date.getTime() - hourMs * 6), ayanamsa);
      const after = siderealLongitudeOfBody(body, new Date(date.getTime() + hourMs * 6), ayanamsa);
      speed = signedDelta(before, after) / 0.5;
      retrograde = key !== 'sun' && key !== 'moon' && speed < 0;
    }

    const sign = rashiOfLongitude(longitude);
    const degreeInSign = normaliseDegree(longitude) % 30;
    const nakshatra = nakshatraOfLongitude(longitude);
    const pada = padaOfLongitude(longitude);
    const separation = Math.abs(signedDelta(longitude, sunLongitude));
    const orbs = COMBUSTION_ORB[key];
    const combust = Boolean(orbs && key !== 'sun' && key !== 'moon' && separation <= (retrograde ? orbs.retrograde : orbs.direct));

    positions[key] = {
      key,
      longitude,
      tropicalLongitude: normaliseDegree(longitude + ayanamsa),
      speed,
      retrograde,
      combust,
      sign,
      degreeInSign,
      nakshatra,
      pada,
      dignity: dignityOf(key, sign, degreeInSign),
      aspects: aspectsOf(key, sign),
      description: PLANETS[key].description,
    };
  }
  return positions;
}

function signedDelta(from: number, to: number): number {
  let delta = normaliseDegree(to - from);
  if (delta > 180) delta -= 360;
  return delta;
}

export interface AscendantOptions {
  latitude: number;
  longitude: number;
  timeZone: string;
}

export function computeAscendant(date: Date, options: AscendantOptions): LagnaInfo {
  const gast = SiderealTime(MakeTime(date)); // hours
  const ramc = normaliseDegree(gast * 15 + options.longitude);
  const eps = (obliquity(date) * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;
  const latRad = (options.latitude * Math.PI) / 180;

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps));
  let tropical = (Math.atan2(y, x) * 180) / Math.PI;
  if (tropical < 0) tropical += 360;

  const mcTropical = normaliseDegree(
    (Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eps)) * 180) / Math.PI,
  );

  const ayanamsa = lahiriAyanamsa(date);
  const longitude = normaliseDegree(tropical - ayanamsa);
  const sign = rashiOfLongitude(longitude);
  return {
    longitude,
    sign,
    degreeInSign: longitude % 30,
    nakshatra: nakshatraOfLongitude(longitude),
    pada: padaOfLongitude(longitude),
    lord: RASHIS[sign].lord,
    midheaven: normaliseDegree(mcTropical - ayanamsa),
  };
}

const chartCache = new Map<string, BirthChart>();

export function buildBirthChart(input: BirthInput): BirthChart {
  const cacheKey = `${input.date}T${input.time}|${input.timeZone}|${input.latitude.toFixed(4)}|${input.longitude.toFixed(4)}|${input.timeUnknown ? 'u' : 'e'}`;
  const cached = chartCache.get(cacheKey);
  if (cached) return cached;

  const utc = zonedToUtc(input.date, input.time, input.timeZone);
  const ayanamsa = lahiriAyanamsa(utc);
  const positionsBase = computePositions(utc, ayanamsa);
  const ascendant = computeAscendant(utc, {
    latitude: input.latitude,
    longitude: input.longitude,
    timeZone: input.timeZone,
  });

  const houseSigns = Array.from({ length: 12 }, (_, i) => (ascendant.sign + i) % 12);
  const houseOf = {} as Record<PlanetKey, number>;
  const positions = {} as Record<PlanetKey, GrahaPosition>;

  for (const key of GRAHA_ORDER) {
    const house = ((positionsBase[key].sign - ascendant.sign + 12) % 12) + 1;
    houseOf[key] = house;
    positions[key] = { ...positionsBase[key], house };
  }

  const moonLongitude = positions.moon.longitude;
  const birthNakshatra = nakshatraOfLongitude(moonLongitude);
  const nakshatraElapsed = (normaliseDegree(moonLongitude) % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;

  const chart: BirthChart = {
    input,
    utc,
    ayanamsa,
    julianDay: julianDay(utc),
    siderealTimeHours: SiderealTime(MakeTime(utc)),
    ascendant,
    positions,
    houseSigns,
    houseOf,
    moonSign: positions.moon.sign,
    sunSign: positions.sun.sign,
    birthNakshatra,
    nakshatraElapsed,
    timePrecision: input.timeUnknown ? 'unknown' : 'exact',
  };

  chartCache.set(cacheKey, chart);
  return chart;
}

/**
 * Navamsa (D9) sign for a sidereal longitude.
 *
 * Each sign divides into nine parts of 3°20′. The classical Parashari rule
 * starts the navamsa sequence in the sign itself for movable (chara) signs,
 * in the 9th from it for fixed (sthira) signs and in the 5th for dual
 * (dvisvabhava) signs — which is exactly what a continuous division of the
 * zodiac by 3°20′ produces.
 */
export function navamsaSign(longitude: number): number {
  return Math.floor(normaliseDegree(longitude) / (30 / 9)) % 12;
}

export function nakshatraName(index: number): string {
  return NAKSHATRAS[index].name;
}

/** Human summary of a graha, e.g. "Jupiter · Sagittarius 8°42′ · Mula pada 2". */
export function grahaSummary(position: GrahaPosition): string {
  const rashi = RASHIS[position.sign].english;
  const degree = Math.floor(position.degreeInSign);
  const minutes = Math.floor((position.degreeInSign - degree) * 60);
  return `${PLANETS[position.key].name} · ${rashi} ${degree}°${String(minutes).padStart(2, '0')}′ · ${NAKSHATRAS[position.nakshatra].name} pada ${position.pada}`;
}

export function houseLordOf(chart: BirthChart, house: number): PlanetKey {
  return RASHIS[chart.houseSigns[house - 1]].lord;
}

/** Planets sitting in a given house. */
export function planetsInHouse(chart: BirthChart, house: number): PlanetKey[] {
  return GRAHA_ORDER.filter((key) => chart.houseOf[key] === house);
}

/** House counted from the Moon (Chandra lagna). */
export function houseFromMoon(chart: BirthChart, sign: number): number {
  return ((sign - chart.moonSign + 12) % 12) + 1;
}
