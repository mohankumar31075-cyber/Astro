/**
 * Gochara (transits) — where the grahas are right now, measured against a
 * natal chart. Includes Sade Sati detection, the 7½-year Saturn transit over
 * the natal Moon.
 */
import { GRAHA_ORDER, NAKSHATRAS, RASHIS, nakshatraOfLongitude, padaOfLongitude, rashiOfLongitude, type PlanetKey } from './constants';
import { planetLongitude, type BirthChart } from './astro';
import { lahiriAyanamsa } from './ayanamsa';

export interface TransitPosition {
  key: PlanetKey;
  longitude: number;
  sign: number;
  nakshatra: number;
  pada: number;
  retrograde: boolean;
  houseFromMoon: number;
  houseFromLagna: number;
}

const houseFrom = (sign: number, reference: number) => ((sign - reference + 12) % 12) + 1;

export function currentTransits(chart: BirthChart, at: Date): TransitPosition[] {
  const ayanamsa = lahiriAyanamsa(at);
  return GRAHA_ORDER.map((key) => {
    const longitude = planetLongitude(key, at, ayanamsa);
    const sign = rashiOfLongitude(longitude);
    const now = planetLongitude(key, at, ayanamsa);
    const soon = planetLongitude(key, new Date(at.getTime() + 86_400_000), ayanamsa);
    let delta = soon - now;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return {
      key,
      longitude,
      sign,
      nakshatra: nakshatraOfLongitude(longitude),
      pada: padaOfLongitude(longitude),
      retrograde: key === 'rahu' || key === 'ketu' || delta < 0,
      houseFromMoon: houseFrom(sign, chart.moonSign),
      houseFromLagna: houseFrom(sign, chart.ascendant.sign),
    };
  });
}

export const transitLabel = (t: TransitPosition) =>
  `${RASHIS[t.sign].english} · ${NAKSHATRAS[t.nakshatra].name} ${t.pada}`;

export type SadeSatiPhase = 'Rising' | 'Peak' | 'Setting';

export interface SadeSatiResult {
  active: boolean;
  phase: SadeSatiPhase | null;
  saturnSign: number;
  phaseStart: Date | null;
  phaseEnd: Date | null;
  /** Houses from the natal Moon covered by the current phase. */
  houseFromMoon: number;
}

const sadeSatiCache = new Map<string, SadeSatiResult>();

function signAt(date: Date, ayanamsaCache: Map<number, number>): number {
  const dayKey = Math.floor(date.getTime() / 86_400_000);
  let ay = ayanamsaCache.get(dayKey);
  if (ay === undefined) {
    ay = lahiriAyanamsa(date);
    ayanamsaCache.set(dayKey, ay);
  }
  return rashiOfLongitude(planetLongitude('saturn', date, ay));
}

/** Find the boundary where Saturn changes sign, searching from `from` in `direction` days. */
function findSignBoundary(
  from: Date,
  direction: 1 | -1,
  knownSign: number,
  ayanamsaCache: Map<number, number>,
  limitDays = 1400,
): Date | null {
  let prev = from;
  for (let d = 7; d <= limitDays; d += 7) {
    const probe = new Date(from.getTime() + direction * d * 86_400_000);
    if (signAt(probe, ayanamsaCache) !== knownSign) {
      let low = prev.getTime();
      let high = probe.getTime();
      for (let i = 0; i < 30; i += 1) {
        const mid = (low + high) / 2;
        if (signAt(new Date(mid), ayanamsaCache) === knownSign) low = mid;
        else high = mid;
      }
      const boundary = new Date((low + high) / 2);
      return direction === 1 ? boundary : boundary;
    }
    prev = probe;
  }
  return null;
}

export function sadeSati(chart: BirthChart, at: Date): SadeSatiResult {
  const key = `${chart.input.date}-${chart.input.time}-${chart.moonSign}-${Math.floor(at.getTime() / 86_400_000)}`;
  const cached = sadeSatiCache.get(key);
  if (cached) return cached;

  const ayanamsaCache = new Map<number, number>();
  const saturnSign = signAt(at, ayanamsaCache);
  const houseFromMoon = houseFrom(saturnSign, chart.moonSign);
  const phase: SadeSatiPhase | null =
    houseFromMoon === 12 ? 'Rising' : houseFromMoon === 1 ? 'Peak' : houseFromMoon === 2 ? 'Setting' : null;

  const result: SadeSatiResult = {
    active: phase !== null,
    phase,
    saturnSign,
    houseFromMoon,
    phaseStart: phase ? findSignBoundary(at, -1, saturnSign, ayanamsaCache) : null,
    phaseEnd: phase ? findSignBoundary(at, 1, saturnSign, ayanamsaCache) : null,
  };
  sadeSatiCache.set(key, result);
  return result;
}

/** Short, human-readable transit highlights used on dashboards and reports. */
export function transitHighlights(chart: BirthChart, at: Date): string[] {
  const transits = currentTransits(chart, at);
  const jupiter = transits.find((t) => t.key === 'jupiter')!;
  const saturn = transits.find((t) => t.key === 'saturn')!;
  const rahu = transits.find((t) => t.key === 'rahu')!;
  const sade = sadeSati(chart, at);
  const highlights: string[] = [];

  highlights.push(
    `Jupiter is transiting ${RASHIS[jupiter.sign].english} — your ${ordinal(jupiter.houseFromMoon)} house from the Moon.`,
  );
  highlights.push(
    `Saturn is transiting ${RASHIS[saturn.sign].english} — your ${ordinal(saturn.houseFromMoon)} house from the Moon.`,
  );
  if (sade.active) {
    highlights.push(
      `Sade Sati is in its ${sade.phase!.toLowerCase()} phase: Saturn is moving over the ${ordinal(sade.houseFromMoon)} house from your natal Moon.`,
    );
  }
  highlights.push(
    `Rahu is in ${RASHIS[rahu.sign].english}, your ${ordinal(rahu.houseFromMoon)} house from the Moon.`,
  );
  return highlights;
}

export function ordinal(n: number): string {
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${n}${suffix}`;
}
