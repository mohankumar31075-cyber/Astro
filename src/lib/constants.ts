/**
 * AstroSutra — core reference data for Vedic (Jyotisha) calculations.
 *
 * All content in this file is original prose written for AstroSutra, built on
 * classical Jyotisha concepts (grahas, rashis, nakshatras, tithis, karanas,
 * yogas, kootas). Classical terminology is public domain; the explanations and
 * code here are original work released under the MIT licence.
 */

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export interface PlanetInfo {
  key: PlanetKey;
  name: string;
  sanskrit: string;
  short: string;
  symbol: string;
  colour: string;
  nature: 'benefic' | 'malefic' | 'neutral' | 'node';
  owns: number[]; // rashi indices (0 = Aries)
  exaltation?: { sign: number; degree: number };
  debilitation?: { sign: number; degree: number };
  description: string;
}

/** Order used across the app and in the Vimshottari cycle. */
export const PLANET_ORDER: PlanetKey[] = [
  'ketu',
  'venus',
  'sun',
  'moon',
  'mars',
  'rahu',
  'jupiter',
  'saturn',
  'mercury',
];

export const PLANETS: Record<PlanetKey, PlanetInfo> = {
  sun: {
    key: 'sun',
    name: 'Sun',
    sanskrit: 'Surya',
    short: 'Su',
    symbol: '\u2609',
    colour: '#e9a13b',
    nature: 'malefic',
    owns: [4],
    exaltation: { sign: 0, degree: 10 },
    debilitation: { sign: 6, degree: 10 },
    description:
      'The soul, vitality, authority and the meaning you give to recognition. In a chart the Sun shows where you are asked to stand in your own light.',
  },
  moon: {
    key: 'moon',
    name: 'Moon',
    sanskrit: 'Chandra',
    short: 'Mo',
    symbol: '\u263D',
    colour: '#c9d3ef',
    nature: 'benefic',
    owns: [3],
    exaltation: { sign: 1, degree: 3 },
    debilitation: { sign: 7, degree: 3 },
    description:
      'The mind, memory, emotional weather and what makes you feel safe. The Moon is the anchor of the Vedic chart: its nakshatra sets your dasha sequence.',
  },
  mars: {
    key: 'mars',
    name: 'Mars',
    sanskrit: 'Mangala',
    short: 'Ma',
    symbol: '\u2642',
    colour: '#d95d4a',
    nature: 'malefic',
    owns: [0, 7],
    exaltation: { sign: 9, degree: 28 },
    debilitation: { sign: 3, degree: 28 },
    description:
      'Drive, courage, competition and how you defend what matters. Mars is also the classical significator of siblings and property.',
  },
  mercury: {
    key: 'mercury',
    name: 'Mercury',
    sanskrit: 'Budha',
    short: 'Me',
    symbol: '\u263F',
    colour: '#7fc8a9',
    nature: 'neutral',
    owns: [2, 5],
    exaltation: { sign: 5, degree: 15 },
    debilitation: { sign: 11, degree: 15 },
    description:
      'Intellect, speech, commerce and the way you process information. Mercury is quick by nature, and its company shapes how a whole chart communicates.',
  },
  jupiter: {
    key: 'jupiter',
    name: 'Jupiter',
    sanskrit: 'Guru',
    short: 'Ju',
    symbol: '\u2643',
    colour: '#e3c46a',
    nature: 'benefic',
    owns: [8, 11],
    exaltation: { sign: 3, degree: 5 },
    debilitation: { sign: 9, degree: 5 },
    description:
      'Wisdom, growth, ethics and opportunity. Jupiter expands whatever it touches — sometimes generously, sometimes beyond what you can hold.',
  },
  venus: {
    key: 'venus',
    name: 'Venus',
    sanskrit: 'Shukra',
    short: 'Ve',
    symbol: '\u2640',
    colour: '#e6a8c8',
    nature: 'benefic',
    owns: [1, 6],
    exaltation: { sign: 11, degree: 27 },
    debilitation: { sign: 5, degree: 27 },
    description:
      'Love, aesthetics, comfort and the art of relating. Venus describes both what you find beautiful and how you negotiate closeness.',
  },
  saturn: {
    key: 'saturn',
    name: 'Saturn',
    sanskrit: 'Shani',
    short: 'Sa',
    symbol: '\u2644',
    colour: '#8f9bb8',
    nature: 'malefic',
    owns: [9, 10],
    exaltation: { sign: 6, degree: 20 },
    debilitation: { sign: 0, degree: 20 },
    description:
      'Time, discipline, limits and the rewards of patience. Saturn does not deny; it delays and asks for structure.',
  },
  rahu: {
    key: 'rahu',
    name: 'Rahu',
    sanskrit: 'Rahu',
    short: 'Ra',
    symbol: '\u260A',
    colour: '#9b8cc4',
    nature: 'node',
    owns: [],
    description:
      'The north node: hunger, ambition, taboo and the unfamiliar territory you are pulled towards. Rahu amplifies whatever house it occupies.',
  },
  ketu: {
    key: 'ketu',
    name: 'Ketu',
    sanskrit: 'Ketu',
    short: 'Ke',
    symbol: '\u260B',
    colour: '#b59b7c',
    nature: 'node',
    owns: [],
    description:
      'The south node: detachment, past mastery and the places you instinctively withdraw from. Ketu gives without needing an audience.',
  },
};

export const GRAHA_ORDER: PlanetKey[] = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
];

export interface RashiInfo {
  index: number;
  name: string;
  english: string;
  symbol: string;
  lord: PlanetKey;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Movable' | 'Fixed' | 'Dual';
  degreeStart: number;
  keywords: string;
}

export const RASHIS: RashiInfo[] = [
  { index: 0, name: 'Mesha', english: 'Aries', symbol: '\u2648', lord: 'mars', element: 'Fire', modality: 'Movable', degreeStart: 0, keywords: 'initiative, courage, self-assertion' },
  { index: 1, name: 'Vrishabha', english: 'Taurus', symbol: '\u2649', lord: 'venus', element: 'Earth', modality: 'Fixed', degreeStart: 30, keywords: 'stability, value, sensory patience' },
  { index: 2, name: 'Mithuna', english: 'Gemini', symbol: '\u264A', lord: 'mercury', element: 'Air', modality: 'Dual', degreeStart: 60, keywords: 'curiosity, language, exchange' },
  { index: 3, name: 'Karka', english: 'Cancer', symbol: '\u264B', lord: 'moon', element: 'Water', modality: 'Movable', degreeStart: 90, keywords: 'belonging, memory, care' },
  { index: 4, name: 'Simha', english: 'Leo', symbol: '\u264C', lord: 'sun', element: 'Fire', modality: 'Fixed', degreeStart: 120, keywords: 'dignity, generosity, visibility' },
  { index: 5, name: 'Kanya', english: 'Virgo', symbol: '\u264D', lord: 'mercury', element: 'Earth', modality: 'Dual', degreeStart: 150, keywords: 'craft, analysis, service' },
  { index: 6, name: 'Tula', english: 'Libra', symbol: '\u264E', lord: 'venus', element: 'Air', modality: 'Movable', degreeStart: 180, keywords: 'balance, partnership, taste' },
  { index: 7, name: 'Vrischika', english: 'Scorpio', symbol: '\u264F', lord: 'mars', element: 'Water', modality: 'Fixed', degreeStart: 210, keywords: 'depth, loyalty, transformation' },
  { index: 8, name: 'Dhanu', english: 'Sagittarius', symbol: '\u2650', lord: 'jupiter', element: 'Fire', modality: 'Dual', degreeStart: 240, keywords: 'meaning, freedom, faith' },
  { index: 9, name: 'Makara', english: 'Capricorn', symbol: '\u2651', lord: 'saturn', element: 'Earth', modality: 'Movable', degreeStart: 270, keywords: 'structure, ambition, endurance' },
  { index: 10, name: 'Kumbha', english: 'Aquarius', symbol: '\u2652', lord: 'saturn', element: 'Air', modality: 'Fixed', degreeStart: 300, keywords: 'systems, community, invention' },
  { index: 11, name: 'Meena', english: 'Pisces', symbol: '\u2653', lord: 'jupiter', element: 'Water', modality: 'Dual', degreeStart: 330, keywords: 'imagination, compassion, release' },
];

/** English name -> rashi index, for URL-friendly routes. */
export const RASHI_SLUGS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export interface NakshatraInfo {
  index: number;
  name: string;
  english: string;
  lord: PlanetKey;
  deity: string;
  symbol: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
  motivation: 'Dharma' | 'Artha' | 'Kama' | 'Moksha';
  keywords: string;
}

const NK = (
  index: number,
  name: string,
  english: string,
  lord: PlanetKey,
  deity: string,
  symbol: string,
  gana: NakshatraInfo['gana'],
  yoni: string,
  nadi: NakshatraInfo['nadi'],
  motivation: NakshatraInfo['motivation'],
  keywords: string,
): NakshatraInfo => ({ index, name, english, lord, deity, symbol, gana, yoni, nadi, motivation, keywords });

export const NAKSHATRAS: NakshatraInfo[] = [
  NK(0, 'Ashwini', 'The Horsewoman', 'ketu', 'Ashwini Kumaras', 'horse head', 'Deva', 'horse', 'Adi', 'Dharma', 'speed, healing, fresh starts'),
  NK(1, 'Bharani', 'The Bearer', 'venus', 'Yama', 'vulva / yoni', 'Manushya', 'elephant', 'Madhya', 'Artha', 'bearing, restraint, thresholds'),
  NK(2, 'Krittika', 'The Cutter', 'sun', 'Agni', 'razor, flame', 'Rakshasa', 'sheep', 'Antya', 'Kama', 'sharpening, purification, resolve'),
  NK(3, 'Rohini', 'The Red One', 'moon', 'Brahma / Prajapati', 'ox cart', 'Manushya', 'serpent', 'Antya', 'Moksha', 'fertility, beauty, growth'),
  NK(4, 'Mrigashira', 'The Deer', 'mars', 'Soma', 'deer head', 'Deva', 'serpent', 'Madhya', 'Moksha', 'seeking, gentleness, curiosity'),
  NK(5, 'Ardra', 'The Moist One', 'rahu', 'Rudra', 'teardrop', 'Manushya', 'dog', 'Adi', 'Kama', 'storm, clarity through crisis'),
  NK(6, 'Punarvasu', 'The Return of Light', 'jupiter', 'Aditi', 'bow and quiver', 'Deva', 'cat', 'Adi', 'Artha', 'renewal, optimism, return'),
  NK(7, 'Pushya', 'The Nourisher', 'saturn', 'Brihaspati', 'cow udder, lotus', 'Deva', 'sheep', 'Madhya', 'Dharma', 'nourishment, discipline, care'),
  NK(8, 'Ashlesha', 'The Coil', 'mercury', 'Nagas', 'coiled serpent', 'Rakshasa', 'cat', 'Antya', 'Dharma', 'insight, strategy, subtle power'),
  NK(9, 'Magha', 'The Great One', 'ketu', 'Pitris', 'royal throne', 'Rakshasa', 'rat', 'Antya', 'Artha', 'ancestry, authority, legacy'),
  NK(10, 'Purva Phalguni', 'The Front Legs', 'venus', 'Bhaga', 'hammock, front legs of cot', 'Manushya', 'rat', 'Madhya', 'Kama', 'pleasure, rest, generosity'),
  NK(11, 'Uttara Phalguni', 'The Back Legs', 'sun', 'Aryaman', 'back legs of cot', 'Manushya', 'cow', 'Antya', 'Moksha', 'partnership, patronage, steadiness'),
  NK(12, 'Hasta', 'The Hand', 'moon', 'Savitar', 'open hand', 'Deva', 'buffalo', 'Adi', 'Moksha', 'skill, craft, readiness'),
  NK(13, 'Chitra', 'The Bright One', 'mars', 'Tvashtar', 'jewel, bright light', 'Rakshasa', 'tiger', 'Madhya', 'Kama', 'design, charisma, craft'),
  NK(14, 'Swati', 'The Independent', 'rahu', 'Vayu', 'young sprout, sword', 'Deva', 'buffalo', 'Antya', 'Artha', 'independence, movement, balance'),
  NK(15, 'Vishakha', 'The Forked Branch', 'jupiter', 'Indra-Agni', 'triumphal arch', 'Rakshasa', 'tiger', 'Antya', 'Dharma', 'ambition, focused pursuit'),
  NK(16, 'Anuradha', 'The Following Star', 'saturn', 'Mitra', 'lotus', 'Deva', 'deer', 'Madhya', 'Dharma', 'devotion, friendship, persistence'),
  NK(17, 'Jyeshtha', 'The Eldest', 'mercury', 'Indra', 'earring, amulet', 'Rakshasa', 'deer', 'Adi', 'Artha', 'seniority, responsibility, protection'),
  NK(18, 'Mula', 'The Root', 'ketu', 'Nirriti', 'tied roots', 'Rakshasa', 'dog', 'Adi', 'Kama', 'getting to the root, investigation'),
  NK(19, 'Purva Ashadha', 'The Early Victory', 'venus', 'Apas', 'winnowing fan', 'Manushya', 'monkey', 'Madhya', 'Moksha', 'invincibility, persuasion'),
  NK(20, 'Uttara Ashadha', 'The Later Victory', 'sun', 'Vishvedevas', 'elephant tusk', 'Manushya', 'mongoose', 'Antya', 'Moksha', 'durable victory, integrity'),
  NK(21, 'Shravana', 'The Listener', 'moon', 'Vishnu', 'ear, three footprints', 'Deva', 'monkey', 'Antya', 'Artha', 'learning, listening, counsel'),
  NK(22, 'Dhanishta', 'The Wealthiest', 'mars', 'Vasus', 'drum', 'Rakshasa', 'lion', 'Madhya', 'Dharma', 'rhythm, wealth, coordination'),
  NK(23, 'Shatabhisha', 'The Hundred Healers', 'rahu', 'Varuna', 'empty circle', 'Rakshasa', 'horse', 'Antya', 'Dharma', 'healing, mystery, privacy'),
  NK(24, 'Purva Bhadrapada', 'The Front of the Blessed Foot', 'jupiter', 'Aja Ekapada', 'sword, front legs of cot', 'Manushya', 'lion', 'Madhya', 'Artha', 'intensity, higher vision'),
  NK(25, 'Uttara Bhadrapada', 'The Back of the Blessed Foot', 'saturn', 'Ahirbudhnya', 'back legs of cot', 'Manushya', 'cow', 'Antya', 'Kama', 'depth, patience, wisdom'),
  NK(26, 'Revati', 'The Wealthy', 'mercury', 'Pushan', 'fish, drum', 'Deva', 'elephant', 'Adi', 'Moksha', 'safe passage, completion'),
];

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'

export const DASHA_YEARS: Record<PlanetKey, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

export const VIMSHOTTARI_TOTAL = 120;

export const TITHI_NAMES = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
];

export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti',
];

export const KARANA_MOVABLE = ['Bav', 'Balav', 'Kaulav', 'Taitil', 'Gar', 'Vanij', 'Vishti'];
export const KARANA_FIXED = ['Shakuni', 'Chatushpada', 'Naga'];

export const WEEKDAYS = [
  { name: 'Ravivara', english: 'Sunday', lord: 'sun' as PlanetKey },
  { name: 'Somavara', english: 'Monday', lord: 'moon' as PlanetKey },
  { name: 'Mangalavara', english: 'Tuesday', lord: 'mars' as PlanetKey },
  { name: 'Budhavara', english: 'Wednesday', lord: 'mercury' as PlanetKey },
  { name: 'Guruvara', english: 'Thursday', lord: 'jupiter' as PlanetKey },
  { name: 'Shukravara', english: 'Friday', lord: 'venus' as PlanetKey },
  { name: 'Shanivara', english: 'Saturday', lord: 'saturn' as PlanetKey },
];

/** 1-indexed house positions from the Sun used by the classical kaal segments. */
export const RAHU_KAAL_PART = [8, 2, 7, 5, 6, 4, 3];
export const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];
export const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

export const HOUSE_MEANINGS = [
  { house: 1, name: 'Tanu Bhava', english: 'Self & body', domain: 'identity, appearance, vitality' },
  { house: 2, name: 'Dhana Bhava', english: 'Wealth & speech', domain: 'savings, family, voice, food' },
  { house: 3, name: 'Sahaja Bhava', english: 'Effort & siblings', domain: 'skill, courage, communication, short trips' },
  { house: 4, name: 'Sukha Bhava', english: 'Home & heart', domain: 'mother, property, inner peace, education' },
  { house: 5, name: 'Putra Bhava', english: 'Creativity & children', domain: 'romance, intelligence, speculation, teaching' },
  { house: 6, name: 'Ripu Bhava', english: 'Service & obstacles', domain: 'work routines, health, debts, competition' },
  { house: 7, name: 'Kalatra Bhava', english: 'Partnership', domain: 'marriage, business partners, public dealings' },
  { house: 8, name: 'Ayu Bhava', english: 'Depth & change', domain: 'inheritance, research, secrecy, transformation' },
  { house: 9, name: 'Dharma Bhava', english: 'Meaning & fortune', domain: 'teachers, travel, belief, mentors' },
  { house: 10, name: 'Karma Bhava', english: 'Career & action', domain: 'profession, status, public work' },
  { house: 11, name: 'Labha Bhava', english: 'Gains & community', domain: 'income, networks, wishes, elder siblings' },
  { house: 12, name: 'Vyaya Bhava', english: 'Release & retreat', domain: 'expenses, solitude, sleep, spirituality, foreign lands' },
];

export const NAKSHATRA_PADAS = 4;

export const isPlanetKey = (value: string): value is PlanetKey =>
  value in PLANETS;

export const rashiOfLongitude = (longitude: number): number =>
  Math.floor(normaliseDegree(longitude) / 30) % 12;

export function normaliseDegree(degree: number): number {
  const d = degree % 360;
  return d < 0 ? d + 360 : d;
}

export const nakshatraOfLongitude = (longitude: number): number =>
  Math.floor(normaliseDegree(longitude) / NAKSHATRA_SPAN) % 27;

export const padaOfLongitude = (longitude: number): number =>
  Math.floor((normaliseDegree(longitude) % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1;

/** Format a longitude as "12°34' in Simha" style parts. */
export function degreeParts(longitude: number): { degree: number; minute: number; second: number } {
  const within = normaliseDegree(longitude) % 30;
  const degree = Math.floor(within);
  const minuteFloat = (within - degree) * 60;
  const minute = Math.floor(minuteFloat);
  const second = Math.round((minuteFloat - minute) * 60);
  return second === 60 ? { degree, minute: minute + 1, second: 0 } : { degree, minute, second };
}

export function formatDms(longitude: number): string {
  const { degree, minute } = degreeParts(longitude);
  return `${degree}°${String(minute).padStart(2, '0')}′`;
}
