/**
 * Ashtakoot Guna Milan — the classical eight-factor marriage compatibility
 * score, computed from the Moon's nakshatra and rashi in both charts.
 *
 * Notes on method:
 *  • Varna, Tara, Bhakoot and Nadi follow the standard classical rules.
 *  • Vashya and Yoni are deliberately simplified where published tables
 *    disagree; the app tells you which rules it applied.
 *  • Guna Milan only reads the Moon. A responsible reading also looks at the
 *    7th house, its lord, Venus, Jupiter and the running dashas — which is why
 *    AstroSutra shows additional context and never treats 36 as a verdict.
 */
import { NAKSHATRAS, PLANETS, RASHIS, type PlanetKey } from './constants';
import { analyseChart } from './yogas';
import { houseLordOf, type BirthChart } from './astro';

export type KootaKey = 'varna' | 'vashya' | 'tara' | 'yoni' | 'grahaMaitri' | 'gana' | 'bhakoot' | 'nadi';

export interface KootaScore {
  key: KootaKey;
  name: string;
  max: number;
  score: number;
  /** One-line explanation of the pair actually matched. */
  detail: string;
}

export interface MangalStatus {
  name: string;
  manglik: boolean;
  strength: string;
  houses: number[];
  detail: string;
}

export interface MatchResult {
  a: BirthChart;
  b: BirthChart;
  total: number;
  max: number;
  percentage: number;
  verdict: { label: string; tone: 'excellent' | 'good' | 'mixed' | 'challenging'; text: string };
  kootas: KootaScore[];
  mangal: { a: MangalStatus; b: MangalStatus; note: string };
  extra: {
    moonSignPair: string;
    seventhLord: { a: string; b: string };
    venus: { a: string; b: string };
    dashaNote: string;
  };
  strengths: string[];
  frictions: string[];
}

const VARNA_RANK: Record<'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra', number> = {
  Brahmin: 4,
  Kshatriya: 3,
  Vaishya: 2,
  Shudra: 1,
};

type VashyaGroup = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';

export function varnaOf(sign: number): keyof typeof VARNA_RANK {
  const element = RASHIS[sign].element;
  if (element === 'Water') return 'Brahmin';
  if (element === 'Fire') return 'Kshatriya';
  if (element === 'Earth') return 'Vaishya';
  return 'Shudra';
}

export function vashyaOf(sign: number, degreeInSign: number): VashyaGroup {
  if (sign === 0 || sign === 1) return 'Chatushpada';
  if (sign === 2 || sign === 5 || sign === 6 || sign === 10) return 'Manava';
  if (sign === 3 || sign === 11) return 'Jalachara';
  if (sign === 4) return 'Vanachara';
  if (sign === 7) return 'Keeta';
  if (sign === 8) return degreeInSign < 15 ? 'Manava' : 'Chatushpada';
  // Capricorn: first half quadruped, second half aquatic.
  return degreeInSign < 15 ? 'Chatushpada' : 'Jalachara';
}

const VASHYA_SCORE: Record<VashyaGroup, Record<VashyaGroup, number>> = {
  Chatushpada: { Chatushpada: 2, Manava: 1, Jalachara: 1, Vanachara: 0.5, Keeta: 0.5 },
  Manava: { Chatushpada: 1, Manava: 2, Jalachara: 0.5, Vanachara: 1, Keeta: 0.5 },
  Jalachara: { Chatushpada: 1, Manava: 0.5, Jalachara: 2, Vanachara: 0.5, Keeta: 1 },
  Vanachara: { Chatushpada: 0.5, Manava: 1, Jalachara: 0.5, Vanachara: 2, Keeta: 0.5 },
  Keeta: { Chatushpada: 0.5, Manava: 0.5, Jalachara: 1, Vanachara: 0.5, Keeta: 2 },
};

const SWORN_ENEMIES: Array<[string, string]> = [
  ['horse', 'buffalo'],
  ['elephant', 'lion'],
  ['sheep', 'monkey'],
  ['serpent', 'mongoose'],
  ['dog', 'deer'],
  ['cat', 'rat'],
  ['cow', 'tiger'],
];

const isSwornEnemy = (a: string, b: string) =>
  SWORN_ENEMIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function taraScore(fromNak: number, toNak: number): { score: number; remainder: number } {
  const count = ((toNak - fromNak + 27) % 27) + 1;
  const remainder = count % 9 === 0 ? 9 : count % 9;
  return { score: [3, 5, 7].includes(remainder) ? 0 : 1.5, remainder };
}

// Natural friendship table mirrored from the chart engine (kept local so the
// matching module has no dependency on private astro internals).
const FRIENDS: Record<PlanetKey, PlanetKey[]> = {
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
const ENEMIES: Record<PlanetKey, PlanetKey[]> = {
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

function relationOf(a: PlanetKey, b: PlanetKey): 'friend' | 'enemy' | 'neutral' {
  if (FRIENDS[a].includes(b)) return 'friend';
  if (ENEMIES[a].includes(b)) return 'enemy';
  return 'neutral';
}

function maitriPoints(a: PlanetKey, b: PlanetKey): number {
  const forward = relationOf(a, b);
  const reverse = relationOf(b, a);
  const pair = new Set([forward, reverse]);
  if (forward === 'friend' && reverse === 'friend') return 5;
  if (pair.has('friend') && pair.has('neutral')) return 4;
  if (forward === 'neutral' && reverse === 'neutral') return 3;
  if (pair.has('friend') && pair.has('enemy')) return 1;
  if (pair.has('neutral') && pair.has('enemy')) return 0.5;
  return 0;
}

export function computeMatch(a: BirthChart, b: BirthChart, options: { groomSide?: 'a' | 'b' } = {}): MatchResult {
  const groomSide = options.groomSide ?? 'b';
  const bride = groomSide === 'b' ? a : b;
  const groom = groomSide === 'b' ? b : a;

  const kootas: KootaScore[] = [];

  // 1. Varna — spiritual temperament (max 1).
  const brideVarna = varnaOf(bride.moonSign);
  const groomVarna = varnaOf(groom.moonSign);
  const varnaScore = VARNA_RANK[groomVarna] >= VARNA_RANK[brideVarna] ? 1 : 0;
  kootas.push({
    key: 'varna',
    name: 'Varna',
    max: 1,
    score: varnaScore,
    detail: `${groomVarna} (groom's Moon) against ${brideVarna} (bride's Moon). Varna looks at temperament: how each of you approaches duty and learning.`,
  });

  // 2. Vashya — mutual influence (max 2).
  const brideVashya = vashyaOf(bride.moonSign, bride.positions.moon.degreeInSign);
  const groomVashya = vashyaOf(groom.moonSign, groom.positions.moon.degreeInSign);
  kootas.push({
    key: 'vashya',
    name: 'Vashya',
    max: 2,
    score: VASHYA_SCORE[brideVashya][groomVashya],
    detail: `${brideVashya} and ${groomVashya}. Vashya describes magnetism and who tends to draw whom — useful for understanding negotiation in a relationship.`,
  });

  // 3. Tara — birth-star wellbeing (max 3).
  const brideNak = bride.birthNakshatra;
  const groomNak = groom.birthNakshatra;
  const taraForward = taraScore(brideNak, groomNak);
  const taraReverse = taraScore(groomNak, brideNak);
  kootas.push({
    key: 'tara',
    name: 'Tara',
    max: 3,
    score: taraForward.score + taraReverse.score,
    detail: `Counting from ${NAKSHATRAS[brideNak].name} to ${NAKSHATRAS[groomNak].name} gives the ${taraForward.remainder}th tara, and the reverse gives the ${taraReverse.remainder}th. The 3rd, 5th and 7th taras are considered weak.`,
  });

  // 4. Yoni — instinctive compatibility (max 4).
  const brideYoni = NAKSHATRAS[brideNak].yoni;
  const groomYoni = NAKSHATRAS[groomNak].yoni;
  const yoniScore = brideYoni === groomYoni ? 4 : isSwornEnemy(brideYoni, groomYoni) ? 0 : 2;
  kootas.push({
    key: 'yoni',
    name: 'Yoni',
    max: 4,
    score: yoniScore,
    detail: `Your Moon nakshatras map to the ${brideYoni} and ${groomYoni} yonis. Yoni reads physical and instinctive chemistry; it is the most literal of the eight factors.`,
  });

  // 5. Graha Maitri — friendship of Moon-sign lords (max 5).
  const brideLord = RASHIS[bride.moonSign].lord;
  const groomLord = RASHIS[groom.moonSign].lord;
  const maitri = maitriPoints(brideLord, groomLord);
  kootas.push({
    key: 'grahaMaitri',
    name: 'Graha Maitri',
    max: 5,
    score: maitri,
    detail: `${PLANETS[brideLord].name} rules the bride's Moon sign and ${PLANETS[groomLord].name} rules the groom's. Graha Maitri measures mental wavelength — how easily you understand each other's reasoning.`,
  });

  // 6. Gana — temperament class (max 6).
  const brideGana = NAKSHATRAS[brideNak].gana;
  const groomGana = NAKSHATRAS[groomNak].gana;
  const ganaScore = ganaPoints(brideGana, groomGana);
  kootas.push({
    key: 'gana',
    name: 'Gana',
    max: 6,
    score: ganaScore,
    detail: `${brideGana} and ${groomGana}. Gana compares basic nature — Deva (gentle), Manushya (mixed), Rakshasa (intense). It carries the largest single weight alongside Nadi.`,
  });

  // 7. Bhakoot — emotional and material direction (max 7).
  const fromBride = ((groom.moonSign - bride.moonSign + 12) % 12) + 1;
  const fromGroom = ((bride.moonSign - groom.moonSign + 12) % 12) + 1;
  const bhakootBad = [[2, 12], [5, 9], [6, 8]].some(
    ([x, y]) => (fromBride === x && fromGroom === y) || (fromBride === y && fromGroom === x),
  );
  kootas.push({
    key: 'bhakoot',
    name: 'Bhakoot',
    max: 7,
    score: bhakootBad ? 0 : 7,
    detail: bhakootBad
      ? `The Moons sit in the ${fromBride}/${fromGroom} axis — the 2-12, 5-9 or 6-8 pattern that classical texts call Bhakoot dosha. It is about differing emotional rhythms and money habits, and it has recognised exceptions.`
      : `The Moons sit in the ${fromBride}/${fromGroom} axis, which avoids the 2-12, 5-9 and 6-8 patterns. Emotional direction and financial instinct are easier to align.`,
  });

  // 8. Nadi — constitutional balance (max 8).
  const brideNadi = NAKSHATRAS[brideNak].nadi;
  const groomNadi = NAKSHATRAS[groomNak].nadi;
  const sameNadi = brideNadi === groomNadi;
  kootas.push({
    key: 'nadi',
    name: 'Nadi',
    max: 8,
    score: sameNadi ? 0 : 8,
    detail: `${brideNadi} and ${groomNadi}. Nadi refers to the three constitutional channels (Vata, Pitta, Kapha). Same-nadi pairs carry Nadi dosha in the classical scheme; health and temperament balance is the idea behind it.`,
  });

  const total = round(kootas.reduce((sum, k) => sum + k.score, 0));
  const percentage = (total / 36) * 100;

  const mangalFor = (chart: BirthChart): MangalStatus => {
    const factor = analyseChart(chart).find((f) => f.id === 'mangal-dosha')!;
    return {
      name: chart.input.name,
      manglik: factor.present,
      strength: factor.strength,
      houses: factor.houses,
      detail: factor.detail,
    };
  };
  const mangalA = mangalFor(a);
  const mangalB = mangalFor(b);
  const bothManglik = mangalA.manglik && mangalB.manglik;

  const seventhA = houseLordOf(a, 7);
  const seventhB = houseLordOf(b, 7);

  const strengths = kootas.filter((k) => k.score >= k.max * 0.75).map((k) => k.name);
  const frictions = kootas.filter((k) => k.score <= k.max * 0.34).map((k) => k.name);

  return {
    a,
    b,
    total,
    max: 36,
    percentage,
    verdict: verdictFor(total),
    kootas,
    mangal: {
      a: mangalA,
      b: mangalB,
      note: bothManglik
        ? 'Both charts carry Mangal dosha, which tradition treats as a mutual cancellation — and more importantly, as a shared temperament to manage together.'
        : mangalA.manglik || mangalB.manglik
          ? 'One chart carries Mangal dosha. Classical guidance asks for patience and clarity about conflict styles; it is not a reason to reject a match on its own.'
          : 'Neither chart carries Mangal dosha in the flagged houses.',
    },
    extra: {
      moonSignPair: `${RASHIS[a.moonSign].english} Moon and ${RASHIS[b.moonSign].english} Moon`,
      seventhLord: {
        a: `${PLANETS[seventhA].name} rules ${a.input.name}'s 7th house from a ${RASHIS[a.ascendant.sign].english} ascendant.`,
        b: `${PLANETS[seventhB].name} rules ${b.input.name}'s 7th house from a ${RASHIS[b.ascendant.sign].english} ascendant.`,
      },
      venus: {
        a: `Venus is ${a.positions.venus.dignity.toLowerCase()} in ${RASHIS[a.positions.venus.sign].english} for ${a.input.name}.`,
        b: `Venus is ${b.positions.venus.dignity.toLowerCase()} in ${RASHIS[b.positions.venus.sign].english} for ${b.input.name}.`,
      },
      dashaNote:
        'Timing matters as much as the score: read both charts\' current mahadasha and antardasha lords along with this comparison, especially around marriage decisions.',
    },
    strengths,
    frictions,
  };
}

function ganaPoints(a: string, b: string): number {
  if (a === b) return 6;
  const pair = new Set([a, b]);
  if (pair.has('Deva') && pair.has('Manushya')) return 5;
  if (pair.has('Deva') && pair.has('Rakshasa')) return 1;
  return 0;
}

function round(value: number): number {
  return Math.round(value * 2) / 2;
}

export function verdictFor(total: number): MatchResult['verdict'] {
  if (total >= 32) {
    return {
      label: 'Rare alignment',
      tone: 'excellent',
      text: 'A high Guna Milan score. Classical practice still asks for a full reading of both charts before any decision — a score is a starting point, not a conclusion.',
    };
  }
  if (total >= 25) {
    return {
      label: 'Very compatible',
      tone: 'excellent',
      text: 'A strong score across the eight factors. The practical work is to keep the habits that make the harmony visible day to day.',
    };
  }
  if (total >= 18) {
    return {
      label: 'Workable',
      tone: 'good',
      text: 'The classical threshold for a favourable match. Read the individual kootas to see where the ease is and where the effort needs to go.',
    };
  }
  if (total >= 12) {
    return {
      label: 'Mixed',
      tone: 'mixed',
      text: 'Below the traditional threshold, though the koota breakdown usually shows real strengths alongside the friction. Many astrologers would dig into the 7th house, Venus and the dashas before drawing any conclusion.',
    };
  }
  return {
    label: 'Challenging',
    tone: 'challenging',
    text: 'A low Guna Milan score. Traditions differ sharply on how much weight to give it; AstroSutra shows the full breakdown rather than a yes or no. Use it as a prompt for an honest conversation, not as a verdict on a relationship.',
  };
}

export const KOOTA_MAX = 36;

export function kootaPercent(koota: KootaScore): number {
  return (koota.score / koota.max) * 100;
}

/** Format a koota score without trailing .0 for whole numbers. */
export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
