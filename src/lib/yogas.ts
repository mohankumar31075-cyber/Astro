/**
 * Yogas and doshas — named planetary combinations from classical Jyotisha.
 *
 * AstroSutra detects a deliberately small, well-understood set and explains
 * each in plain language. These are interpretive indicators, not predictions,
 * and the app never presents them as certainties.
 */
import { GRAHA_ORDER, NAKSHATRAS, PLANETS, RASHIS, type PlanetKey } from './constants';
import type { BirthChart } from './astro';

export interface ChartFactor {
  id: string;
  kind: 'yoga' | 'dosha';
  title: string;
  sanskrit: string;
  present: boolean;
  /** How clearly the classical condition is met. */
  strength: 'strong' | 'moderate' | 'mild' | 'cancelled';
  planets: PlanetKey[];
  houses: number[];
  detail: string;
  /** What to actually do with the information. */
  guidance: string;
}

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

const houseFromSign = (sign: number, reference: number) => ((sign - reference + 12) % 12) + 1;

const ownOrExalted = (chart: BirthChart, key: PlanetKey) =>
  chart.positions[key].dignity === 'Own sign' || chart.positions[key].dignity === 'Exalted';

function yogas(chart: BirthChart): ChartFactor[] {
  const factors: ChartFactor[] = [];
  const { positions, houseOf } = chart;
  const sameSign = (...keys: PlanetKey[]) => new Set(keys.map((k) => positions[k].sign)).size === 1;

  // Gajakesari — Jupiter in a kendra from the Moon.
  const jupiterFromMoon = houseFromSign(positions.jupiter.sign, chart.moonSign);
  if (KENDRA.includes(jupiterFromMoon)) {
    factors.push({
      id: 'gajakesari',
      kind: 'yoga',
      title: 'Gajakesari',
      sanskrit: 'Gaja-Kesari Yoga',
      present: true,
      strength: jupiterFromMoon === 1 ? 'strong' : 'moderate',
      planets: ['jupiter', 'moon'],
      houses: [jupiterFromMoon],
      detail: `Jupiter sits in the ${ordinal(jupiterFromMoon)} house from your Moon. Classically this is a reputation-building combination: it is associated with good counsel, steady judgment and people who help you keep perspective under pressure.`,
      guidance: 'Lean on mentors and peer networks. This is a placement that rewards thinking in public and teaching what you learn.',
    });
  }

  // Panch Mahapurusha — a strong planet in a kendra from the ascendant.
  const mahapurusha: Array<{ key: PlanetKey; name: string; note: string }> = [
    { key: 'mars', name: 'Ruchaka', note: 'physical courage, leadership under pressure, the will to finish what you begin' },
    { key: 'mercury', name: 'Bhadra', note: 'intelligence, articulate communication and a mind that likes detail' },
    { key: 'jupiter', name: 'Hamsa', note: 'ethics, learning and a reputation for generosity' },
    { key: 'venus', name: 'Malavya', note: 'refined taste, charm and the capacity to enjoy what you build' },
    { key: 'saturn', name: 'Shasha', note: 'discipline, endurance and a slow accumulation of authority' },
  ];
  for (const item of mahapurusha) {
    const house = houseOf[item.key];
    if (KENDRA.includes(house) && ownOrExalted(chart, item.key)) {
      factors.push({
        id: `mahapurusha-${item.key}`,
        kind: 'yoga',
        title: `${item.name} Yoga`,
        sanskrit: 'Panch Mahapurusha Yoga',
        present: true,
        strength: 'strong',
        planets: [item.key],
        houses: [house],
        detail: `${PLANETS[item.key].name} is ${positions[item.key].dignity.toLowerCase()} in a kendra (${ordinal(house)} house). One of the five "great person" combinations, associated with ${item.note}.`,
        guidance: 'This strength is only as useful as the work you put behind it. Choose one long game and let this planet compound.',
      });
    }
  }

  // Budhaditya — Sun and Mercury together.
  if (sameSign('sun', 'mercury') && positions.mercury.house !== 12) {
    factors.push({
      id: 'budhaditya',
      kind: 'yoga',
      title: 'Budhaditya',
      sanskrit: 'Budha-Aditya Yoga',
      present: true,
      strength: positions.mercury.combust ? 'mild' : 'moderate',
      planets: ['sun', 'mercury'],
      houses: [houseOf.mercury],
      detail:
        'Sun and Mercury share a sign, a classical intelligence combination. It tends to show up as a clear, analytical mind and a talent for explaining complicated things simply — though when Mercury is very close to the Sun the expression can be more private than public.',
      guidance: 'Write to think. Your ideas sharpen when they are structured on a page or explained to someone else.',
    });
  }

  // Chandra-Mangal — Moon and Mars together.
  if (sameSign('moon', 'mars')) {
    factors.push({
      id: 'chandra-mangal',
      kind: 'yoga',
      title: 'Chandra-Mangal',
      sanskrit: 'Chandra-Mangala Yoga',
      present: true,
      strength: 'moderate',
      planets: ['moon', 'mars'],
      houses: [houseOf.moon],
      detail:
        'The emotional Moon sits with action-oriented Mars. This combination carries drive, but the same wiring can make feelings move faster than logic. Financially it is often associated with the ability to earn through effort and initiative.',
      guidance: 'Build a pause between feeling and response. Physical movement is a reliable outlet for this placement.',
    });
  }

  // Kemadruma — an isolated Moon.
  const moonSign = chart.moonSign;
  const supporting = GRAHA_ORDER.filter((key) => key !== 'sun' && key !== 'moon' && key !== 'rahu' && key !== 'ketu');
  const neighbours = [(moonSign + 1) % 12, (moonSign + 11) % 12];
  const isolated = supporting.every((key) => !neighbours.includes(positions[key].sign) && positions[key].sign !== moonSign);
  if (isolated) {
    factors.push({
      id: 'kemadruma',
      kind: 'dosha',
      title: 'Kemadruma',
      sanskrit: 'Kemadruma Yoga',
      present: true,
      strength: 'mild',
      planets: ['moon'],
      houses: [houseOf.moon],
      detail:
        'No graha supports the Moon from the signs next to it or from its own sign. Classically this points to emotional self-reliance: you may cycle through phases of feeling unsupported before learning to build your own scaffolding.',
      guidance: 'Deliberately build a small circle you can call on. Routine, sleep and one trusted confidant matter more than usual for you.',
    });
  }

  // Shakata — Moon in a dusthana from Jupiter.
  const moonFromJupiter = houseFromSign(chart.moonSign, positions.jupiter.sign);
  if (DUSTHANA.includes(moonFromJupiter)) {
    factors.push({
      id: 'shakata',
      kind: 'dosha',
      title: 'Shakata',
      sanskrit: 'Shakata Yoga',
      present: true,
      strength: 'mild',
      planets: ['moon', 'jupiter'],
      houses: [moonFromJupiter],
      detail:
        'The Moon is placed in a difficult house from Jupiter, a combination traditionally called the "cart wheel" — fortunes that rise and fall in cycles rather than in a straight line.',
      guidance: 'Plan for cycles. Keep reserves in good years, and do not read a lean year as a permanent verdict.',
    });
  }

  // Kendra–Trikona Raja yoga.
  const kendraLords = KENDRA.map((h) => RASHIS[chart.houseSigns[h - 1]].lord);
  const trikonaLords = TRIKONA.map((h) => RASHIS[chart.houseSigns[h - 1]].lord);
  const rajaPairs: Array<[PlanetKey, PlanetKey]> = [];
  for (const k of new Set(kendraLords)) {
    for (const t of new Set(trikonaLords)) {
      if (k !== t && positions[k].sign === positions[t].sign) rajaPairs.push([k, t]);
    }
  }
  if (rajaPairs.length > 0) {
    const [a, b] = rajaPairs[0];
    factors.push({
      id: 'raja-yoga',
      kind: 'yoga',
      title: 'Kendra–Trikona Rajayoga',
      sanskrit: 'Raja Yoga',
      present: true,
      strength: 'strong',
      planets: [a, b],
      houses: [houseOf[a], houseOf[b]],
      detail: `The lords of an angular house and a trinal house (${PLANETS[a].name} and ${PLANETS[b].name}) sit together. Raja yogas are the classical signature of status that grows through a blend of effort (kendra) and merit (trikona).`,
      guidance: 'Position yourself where effort is visible. Recognition tends to arrive through responsibility rather than self-promotion.',
    });
  }

  // Vipreet Raja yoga — dusthana lords in dusthana houses.
  const vipreet = DUSTHANA.filter((house) => DUSTHANA.includes(houseOf[RASHIS[chart.houseSigns[house - 1]].lord]));
  if (vipreet.length > 0) {
    const house = vipreet[0];
    const lord = RASHIS[chart.houseSigns[house - 1]].lord;
    factors.push({
      id: 'vipreet',
      kind: 'yoga',
      title: 'Vipreet Rajayoga',
      sanskrit: 'Viparita Raja Yoga',
      present: true,
      strength: 'moderate',
      planets: [lord],
      houses: [house, houseOf[lord]],
      detail: `The lord of your ${ordinal(house)} house sits in another difficult house. Vipreet yogas turn reversal into advantage: gains that arrive after a setback, or through work others avoid.`,
      guidance: 'Do not rush to avoid difficulty. In your chart, the less obvious path often carries the better outcome.',
    });
  }

  // Guru-Chandala and Angarak — nodes with a benefic or Mars.
  if (sameSign('jupiter', 'rahu') || sameSign('jupiter', 'ketu')) {
    const node: PlanetKey = sameSign('jupiter', 'rahu') ? 'rahu' : 'ketu';
    factors.push({
      id: 'guru-chandala',
      kind: 'dosha',
      title: 'Guru-Chandala',
      sanskrit: 'Guru-Chandala Yoga',
      present: true,
      strength: 'mild',
      planets: ['jupiter', node],
      houses: [houseOf.jupiter],
      detail: `Jupiter is conjunct ${PLANETS[node].name}. Classically this suggests unconventional beliefs and a tendency to question teachers or received wisdom. Handled well it produces original thinking; handled poorly it produces cynicism.`,
      guidance: 'Test ideas against lived experience, and choose mentors for their conduct rather than their charisma.',
    });
  }
  if (sameSign('mars', 'rahu')) {
    factors.push({
      id: 'angarak',
      kind: 'dosha',
      title: 'Angarak',
      sanskrit: 'Angaraka Yoga',
      present: true,
      strength: 'mild',
      planets: ['mars', 'rahu'],
      houses: [houseOf.mars],
      detail:
        'Mars and Rahu share a sign, a combination associated with intensity and impulsive action. It can be a genuine engine for ambition when it has a physical or professional outlet.',
      guidance: 'Choose outlets with rules — sport, deadlines, structured competition — rather than letting the energy pick its own target.',
    });
  }

  // Kala Sarpa — all seven grahas inside one nodal half of the zodiac.
  const rahu = positions.rahu.longitude;
  const ketu = positions.ketu.longitude;
  const inArc = (lon: number, from: number, to: number) => {
    const span = (to - from + 360) % 360;
    const offset = (lon - from + 360) % 360;
    return offset > 0 && offset < span;
  };
  const seven: PlanetKey[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const allInRahuToKetu = seven.every((k) => inArc(positions[k].longitude, rahu, ketu));
  const allInKetuToRahu = seven.every((k) => inArc(positions[k].longitude, ketu, rahu));
  if (allInRahuToKetu || allInKetuToRahu) {
    factors.push({
      id: 'kala-sarpa',
      kind: 'dosha',
      title: 'Kala Sarpa',
      sanskrit: 'Kala Sarpa Yoga',
      present: true,
      strength: 'mild',
      planets: ['rahu', 'ketu'],
      houses: [houseOf.rahu, houseOf.ketu],
      detail:
        'All seven grahas fall within one half of the zodiac bounded by the nodes. This is a much-discussed but heavily reinterpreted pattern; AstroSutra treats it as a note about intensity and focus rather than a curse. Every chart with this pattern is also full of other combinations.',
      guidance: 'Work with a single long-term focus. Scattered effort is the main risk this pattern describes.',
    });
  }

  return factors;
}

function mangalDosha(chart: BirthChart): ChartFactor {
  const marsHouseLagna = chart.houseOf.mars;
  const marsHouseMoon = houseFromSign(chart.positions.mars.sign, chart.moonSign);
  const triggerHouses = [1, 4, 7, 8, 12];
  const hits = [marsHouseLagna, marsHouseMoon].filter((h) => triggerHouses.includes(h));
  const present = hits.length > 0;

  let strength: ChartFactor['strength'] = 'mild';
  const notes: string[] = [];
  if (chart.positions.mars.dignity === 'Own sign' || chart.positions.mars.dignity === 'Exalted') {
    strength = 'cancelled';
    notes.push('Mars is in its own sign or exalted, one of the classical cancellations.');
  }
  const jupiterAspectsMars = chart.positions.jupiter.aspects.includes(chart.positions.mars.sign);
  if (jupiterAspectsMars) {
    notes.push('Jupiter aspects Mars, which classical texts treat as a pacifying influence.');
  } else if (present && strength !== 'cancelled') {
    strength = 'moderate';
  }

  return {
    id: 'mangal-dosha',
    kind: 'dosha',
    title: 'Mangal Dosha',
    sanskrit: 'Kuja Dosha',
    present,
    strength,
    planets: ['mars'],
    houses: [...new Set(hits)],
    detail: present
      ? `Mars occupies ${hits.map(ordinal).join(' and ')} house${hits.length > 1 ? 's' : ''} counted from your ascendant and Moon. Mangal dosha is traditionally checked before marriage because Mars in these houses is associated with friction and impatience in close relationships.${notes.length ? ' ' + notes.join(' ') : ''}`
      : 'Mars is not in any of the houses (1st, 4th, 7th, 8th, 12th from the ascendant or Moon) that classical texts flag.',
    guidance: present
      ? 'Treat this as a description of temperament, not a verdict. Compatibility with a partner\'s Mars and Moon matters more than the label, and the tradition itself lists several cancellations.'
      : 'No specific action needed. Relationship patterns are better read from the 7th house, its lord and Venus in both charts.',
  };
}

export function analyseChart(chart: BirthChart): ChartFactor[] {
  const factors = yogas(chart);
  factors.push(mangalDosha(chart));
  return factors;
}

export function ordinal(n: number): string {
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${n}${suffix}`;
}

/** Strongest positive factor, used for dashboard copy. */
export function highlightFactor(chart: BirthChart): ChartFactor | undefined {
  return analyseChart(chart).find((factor) => factor.kind === 'yoga');
}

export const factorLabel = (factor: ChartFactor) =>
  `${factor.title} · ${factor.planets.map((p) => `${PLANETS[p].name}`).join(' + ')} · ${factor.houses.map(ordinal).join(', ')} house(s)`;

export const nakshatraOf = (chart: BirthChart) => NAKSHATRAS[chart.birthNakshatra];
