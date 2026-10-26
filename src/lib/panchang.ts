/**
 * Panchang — the five limbs of the Vedic day: tithi, vara, nakshatra, yoga and
 * karana, plus sunrise/sunset, the inauspicious kaal segments and the moon's
 * phase. All values are derived from real geocentric positions for the place
 * and date supplied; nothing is looked up from a static table.
 */
import { Body, Observer, SearchRiseSet } from 'astronomy-engine';
import {
  GULIKA_PART,
  KARANA_FIXED,
  KARANA_MOVABLE,
  NAKSHATRAS,
  PLANETS,
  RAHU_KAAL_PART,
  TITHI_NAMES,
  WEEKDAYS,
  YAMAGANDA_PART,
  YOGA_NAMES,
  nakshatraOfLongitude,
  normaliseDegree,
  padaOfLongitude,
  rashiOfLongitude,
  type PlanetKey,
} from './constants';
import { planetLongitude } from './astro';
import { addDays, startOfZonedDay, utcToZonedParts, zonedWeekday, type BirthInput } from './time';

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface AngularLimb {
  index: number;
  name: string;
  /** Instant when this limb ends, in the local day. */
  endsAt: Date | null;
}

export interface Panchang {
  dateISO: string;
  timeZone: string;
  place: string;
  sunrise: Date | null;
  sunset: Date | null;
  nextSunrise: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  dayLengthMinutes: number | null;
  weekday: { index: number; name: string; english: string; lord: PlanetKey };
  tithi: AngularLimb & { paksha: 'Shukla' | 'Krishna'; number: number; progress: number };
  nakshatra: AngularLimb & { pada: number; lord: PlanetKey };
  yoga: AngularLimb;
  karana: AngularLimb;
  phaseAngle: number;
  illumination: number;
  rahuKaal: TimeWindow | null;
  yamaganda: TimeWindow | null;
  gulika: TimeWindow | null;
  abhijit: TimeWindow | null;
  moonSign: number;
  sunSign: number;
}

/** Remaining degrees, forward, from `current` to `target` (0-360). */
const remaining = (current: number, target: number) => normaliseDegree(target - normaliseDegree(current));

/**
 * Find the next instant at which `angleFn` reaches `target` degrees.
 * Steps forward in 6-hour blocks, then bisects to the second.
 */
function findCrossing(angleFn: (date: Date) => number, start: Date, target: number, maxDays = 3): Date | null {
  const stepMs = 6 * 3_600_000;
  const initial = remaining(angleFn(start), target);
  if (initial < 1e-6) return start;
  let previous = initial;
  let lo = start.getTime();
  for (let i = 1; i <= maxDays * 4; i += 1) {
    const t = start.getTime() + i * stepMs;
    const r = remaining(angleFn(new Date(t)), target);
    if (r > previous + 1) {
      // Crossed between lo and t.
      let low = lo;
      let high = t;
      for (let k = 0; k < 24; k += 1) {
        const mid = (low + high) / 2;
        const midRemaining = remaining(angleFn(new Date(mid)), target);
        if (midRemaining < 180) low = mid;
        else high = mid;
      }
      return new Date(Math.round((low + high) / 2));
    }
    previous = r;
    lo = t;
  }
  return null;
}

const observerFor = (latitude: number, longitude: number) => new Observer(latitude, longitude, 0);

const panchangCache = new Map<string, Panchang>();

export function computePanchang(instant: Date, place: Pick<BirthInput, 'latitude' | 'longitude' | 'timeZone' | 'place'>): Panchang {
  const dayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: place.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
  const cacheKey = `${dayKey}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}|${place.timeZone}|${place.place}`;
  const cached = panchangCache.get(cacheKey);
  if (cached) return cached;
  const computed = computePanchangUncached(instant, place);
  if (panchangCache.size > 60) panchangCache.clear();
  panchangCache.set(cacheKey, computed);
  return computed;
}

function computePanchangUncached(instant: Date, place: Pick<BirthInput, 'latitude' | 'longitude' | 'timeZone' | 'place'>): Panchang {
  const { latitude, longitude, timeZone } = place;
  const dayStart = startOfZonedDay(instant, timeZone);
  const nextDayStart = addDays(dayStart, 1);
  const observer = observerFor(latitude, longitude);

  const sunrise = SearchRiseSet(Body.Sun, observer, +1, dayStart, 1.2)?.date ?? null;
  const sunset = SearchRiseSet(Body.Sun, observer, -1, dayStart, 1.2)?.date ?? null;
  const nextSunrise = SearchRiseSet(Body.Sun, observer, +1, nextDayStart, 1.2)?.date ?? null;
  const moonrise = SearchRiseSet(Body.Moon, observer, +1, dayStart, 1.2)?.date ?? null;
  const moonset = SearchRiseSet(Body.Moon, observer, -1, dayStart, 1.2)?.date ?? null;

  const ref = sunrise ?? instant;
  const sun = planetLongitude('sun', ref);
  const moon = planetLongitude('moon', ref);
  const sunFn = (d: Date) => planetLongitude('sun', d);
  const moonFn = (d: Date) => planetLongitude('moon', d);
  const angleFn = (d: Date) => normaliseDegree(moonFn(d) - sunFn(d));

  const phaseAngle = normaliseDegree(moon - sun);
  const tithiNumber = Math.floor(phaseAngle / 12) + 1; // 1..30
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const withinPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  const tithiName =
    withinPaksha === 15
      ? paksha === 'Shukla'
        ? 'Purnima'
        : 'Amavasya'
      : TITHI_NAMES[withinPaksha - 1];
  const tithiEndTarget = (Math.floor(phaseAngle / 12) + 1) * 12;
  const tithiEnd = findCrossing(angleFn, ref, tithiEndTarget % 360, 2);

  const nakshatraIndex = nakshatraOfLongitude(moon);
  const nakshatraEndTarget = (Math.floor(moon / (360 / 27)) + 1) * (360 / 27);
  const nakshatraEnd = findCrossing(moonFn, ref, normaliseDegree(nakshatraEndTarget), 2);

  const yogaAngle = normaliseDegree(moon + sun);
  const yogaIndex = Math.floor(yogaAngle / (360 / 27)) % 27;
  const yogaEndTarget = (Math.floor(yogaAngle / (360 / 27)) + 1) * (360 / 27);
  const yogaEnd = findCrossing((d) => normaliseDegree(moonFn(d) + sunFn(d)), ref, normaliseDegree(yogaEndTarget), 2);

  const karanaIndex = Math.floor(phaseAngle / 6); // 0..59
  const karanaName = karanaNameFor(karanaIndex);
  const karanaEndTarget = (Math.floor(phaseAngle / 6) + 1) * 6;
  const karanaEnd = findCrossing(angleFn, ref, karanaEndTarget % 360, 1);

  const weekdayIndex = zonedWeekday(sunrise ?? instant, timeZone);
  const weekday = WEEKDAYS[weekdayIndex];

  const dayWindows = (start: Date | null, end: Date | null) => {
    if (!start || !end || end <= start) return null;
    const part = (end.getTime() - start.getTime()) / 8;
    return { start, end, part };
  };
  const day = dayWindows(sunrise, sunset);
  const segment = (partIndex: number): TimeWindow | null => {
    if (!day) return null;
    const startOffset = day.part * partIndex;
    return {
      start: new Date(day.start.getTime() + startOffset),
      end: new Date(day.start.getTime() + startOffset + day.part),
    };
  };
  const rahuKaal = segment(RAHU_KAAL_PART[weekdayIndex] - 1);
  const yamaganda = segment(YAMAGANDA_PART[weekdayIndex] - 1);
  const gulika = segment(GULIKA_PART[weekdayIndex] - 1);
  const abhijit =
    sunrise && sunset
      ? (() => {
          const midday = (sunrise.getTime() + sunset.getTime()) / 2;
          const halfWidth = (sunset.getTime() - sunrise.getTime()) / 30;
          return { start: new Date(midday - halfWidth), end: new Date(midday + halfWidth) };
        })()
      : null;

  const local = utcToZonedParts(instant, timeZone);

  return {
    dateISO: `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`,
    timeZone,
    place: place.place,
    sunrise,
    sunset,
    nextSunrise,
    moonrise,
    moonset,
    dayLengthMinutes: sunrise && sunset ? Math.round((sunset.getTime() - sunrise.getTime()) / 60_000) : null,
    weekday: { index: weekdayIndex, name: weekday.name, english: weekday.english, lord: weekday.lord },
    tithi: {
      index: tithiNumber,
      number: tithiNumber,
      name: tithiName,
      paksha,
      progress: (phaseAngle % 12) / 12,
      endsAt: tithiEnd,
    },
    nakshatra: {
      index: nakshatraIndex,
      name: NAKSHATRAS[nakshatraIndex].name,
      pada: padaOfLongitude(moon),
      lord: NAKSHATRAS[nakshatraIndex].lord,
      endsAt: nakshatraEnd,
    },
    yoga: { index: yogaIndex, name: YOGA_NAMES[yogaIndex], endsAt: yogaEnd },
    karana: { index: karanaIndex, name: karanaName, endsAt: karanaEnd },
    phaseAngle,
    illumination: ((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100,
    rahuKaal,
    yamaganda,
    gulika,
    abhijit,
    moonSign: rashiOfLongitude(moon),
    sunSign: rashiOfLongitude(sun),
  };
}

export function karanaNameFor(index: number): string {
  if (index === 0) return 'Kimstughna';
  if (index >= 57) return KARANA_FIXED[index - 57];
  return KARANA_MOVABLE[(index - 1) % 7];
}

/** Describe the moon phase in words. */
export function phaseName(phaseAngle: number): string {
  const angle = normaliseDegree(phaseAngle);
  if (angle < 8 || angle > 352) return 'New Moon';
  if (angle < 82) return 'Waxing Crescent';
  if (angle < 98) return 'First Quarter';
  if (angle < 172) return 'Waxing Gibbous';
  if (angle < 188) return 'Full Moon';
  if (angle < 262) return 'Waning Gibbous';
  if (angle < 278) return 'Last Quarter';
  return 'Waning Crescent';
}

export const planetName = (key: PlanetKey) => PLANETS[key].name;
