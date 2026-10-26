/**
 * Report generation.
 *
 * Long-form readings assembled from the computed chart. Each report names the
 * placements it is reading, so the page reads like a considered consultation
 * rather than a horoscope column. All prose is original to AstroSutra.
 */
import { HOUSE_MEANINGS, NAKSHATRAS, PLANETS, RASHIS, type PlanetKey } from './constants';
import type { BirthChart } from './astro';
import { planetsInHouse } from './astro';
import { antardashasOf, dashaTreeAt, formatPeriodDate, mahadashaSequence } from './dasha';
import { ordinal, sadeSati } from './transits';
import { analyseChart, type ChartFactor } from './yogas';

export type ReportSlug = 'career' | 'love' | 'health' | 'money' | 'life';

export interface ReportDef {
  slug: ReportSlug;
  title: string;
  subtitle: string;
  description: string;
  minutes: number;
}

export const REPORT_DEFS: ReportDef[] = [
  {
    slug: 'career',
    title: 'Career & calling',
    subtitle: 'Work, ambition and the shape of your professional life',
    description:
      'Reads the 10th house and its lord, the 6th house of daily service, Saturn as the karaka of karma, and the dasha periods that govern the next few years of work.',
    minutes: 7,
  },
  {
    slug: 'love',
    title: 'Love & partnership',
    subtitle: 'How you attach, what you need, and where friction lives',
    description:
      'Reads the 7th house and its lord, Venus, the 5th house of romance and the Moon for emotional needs — plus Mangal dosha and the timing of relationship periods.',
    minutes: 6,
  },
  {
    slug: 'health',
    title: 'Energy & rhythm',
    subtitle: 'Your constitution, stress patterns and recovery',
    description:
      'Reads the ascendant and its lord, the 6th house of routine, the Moon for emotional regulation and Saturn for endurance. Framed as routine guidance, never diagnosis.',
    minutes: 5,
  },
  {
    slug: 'money',
    title: 'Money & resources',
    subtitle: 'Earning, keeping and the psychology of enough',
    description:
      'Reads the 2nd house of accumulated wealth, the 11th of gains and networks, the 8th of shared resources, and Jupiter and Saturn as the classical significators of growth and restraint.',
    minutes: 6,
  },
  {
    slug: 'life',
    title: 'Life direction',
    subtitle: 'The bigger picture, from lagna and Moon',
    description:
      'A whole-chart reading: ascendant, Moon nakshatra, the strongest yogas, the dasha arc you are in and where the next chapter begins.',
    minutes: 8,
  },
];

interface ReportSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface Report {
  def: ReportDef;
  intro: string;
  sections: ReportSection[];
  timeline: Array<{ title: string; span: string; current?: boolean }>;
  closing: string;
  factors: ChartFactor[];
}

const list = (items: string[]) => items.filter(Boolean).join(' ');
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function houseLordBrief(chart: BirthChart, house: number): string {
  const sign = chart.houseSigns[house - 1];
  const lord = RASHIS[sign].lord;
  const position = chart.positions[lord];
  return `Your ${ordinal(house)} house is ${RASHIS[sign].english} (${RASHIS[sign].name}), ruled by ${PLANETS[lord].name}, which sits in your ${ordinal(position.house)} house of ${HOUSE_MEANINGS[position.house - 1].english.toLowerCase()} in ${RASHIS[position.sign].english}.`;
}

function occupantsBrief(chart: BirthChart, house: number): string {
  const occupants = planetsInHouse(chart, house);
  if (occupants.length === 0) return 'No graha occupies it directly, so its lord and the running dasha carry the reading.';
  return `${occupants.map((planet) => `${PLANETS[planet].name} (${chart.positions[planet].dignity.toLowerCase()})`).join(', ')} ${occupants.length === 1 ? 'sits' : 'sit'} in it.`;
}

function dashaBrief(chart: BirthChart, at: Date): string {
  const tree = dashaTreeAt(chart, at);
  const maha = chart.positions[tree.maha.lord];
  const antar = chart.positions[tree.antar.lord];
  return `You are in ${PLANETS[tree.maha.lord].name} mahadasha (${formatPeriodDate(tree.maha.start)} to ${formatPeriodDate(tree.maha.end)}) with ${PLANETS[tree.antar.lord].name} antardasha until ${formatPeriodDate(tree.antar.end)}. ${PLANETS[tree.maha.lord].name} is placed in your ${ordinal(maha.house)} house; ${PLANETS[tree.antar.lord].name} is in your ${ordinal(antar.house)}.`;
}

function timelineFor(chart: BirthChart, at: Date, count = 5) {
  const tree = dashaTreeAt(chart, at);
  const antars = antardashasOf(chart, at).map((period) => ({
    title: `${PLANETS[period.lord].name} antardasha`,
    span: `${formatPeriodDate(period.start)} – ${formatPeriodDate(period.end)}`,
    current: period.lord === tree.antar.lord,
  }));
  const future = mahadashaSequence(chart)
    .filter((period) => period.start.getTime() > tree.maha.end.getTime())
    .slice(0, 3)
    .map((period) => ({
      title: `${PLANETS[period.lord].name} mahadasha`,
      span: `${formatPeriodDate(period.start)} – ${formatPeriodDate(period.end)}`,
    }));
  return [...antars.slice(0, count), ...future];
}

function planetReport(chart: BirthChart, key: PlanetKey): string {
  const position = chart.positions[key];
  return `${PLANETS[key].name} is ${position.dignity.toLowerCase()} in ${RASHIS[position.sign].english}, ${NAKSHATRAS[position.nakshatra].name} pada ${position.pada}, in your ${ordinal(position.house)} house${position.retrograde ? ' (retrograde)' : ''}.`;
}

export function generateReport(slug: ReportSlug, chart: BirthChart, at: Date): Report {
  const def = REPORT_DEFS.find((item) => item.slug === slug)!;
  const factors = analyseChart(chart);
  const sade = sadeSati(chart, at);
  const name = chart.input.name.split(' ')[0];
  const sections: ReportSection[] = [];
  let intro = '';

  if (slug === 'career') {
    intro = `${name}, a career reading in Jyotisha is less about job titles and more about the field your temperament is built for — and the seasons in which that field responds. This report reads three things: the 10th house of public work, the 6th house of daily service, and the periods currently governing your effort.`;
    sections.push(
      {
        title: 'The field you are built for',
        body: list([
          houseLordBrief(chart, 10),
          occupantsBrief(chart, 10),
          'In practice this describes the arena where your work becomes visible, not a specific designation. If the lord sits in a house of learning, teaching or publishing, the career tends to grow through knowledge; if it sits in a house of partnership, it usually grows through people.',
        ]),
      },
      {
        title: 'How you work day to day',
        body: list([
          houseLordBrief(chart, 6),
          occupantsBrief(chart, 6),
          'The 6th house also describes how you handle friction — competition, deadlines, difficult colleagues. A strong 6th makes you good in a crisis; a sensitive one means office politics cost you more energy than the work itself.',
        ]),
      },
      {
        title: 'Saturn, the karaka of work',
        body: `${planetReport(chart, 'saturn')} Saturn rewards structure and punishes shortcuts, which is why its periods often feel slow while they are happening and valuable in hindsight. Wherever Saturn sits, you tend to build something that outlasts the phase.`,
        bullets: [
          `Saturn's house (${chart.houseOf.saturn}) is where effort compounds.`,
          `Saturn's sign (${RASHIS[chart.positions.saturn.sign].english}) shows the style of that effort.`,
          chart.positions.saturn.dignity === 'Debilitated' || chart.positions.saturn.dignity === 'Enemy'
            ? 'A challenged Saturn asks for patience and external structure rather than more willpower.'
            : 'A well-placed Saturn is a genuine asset for long-term authority.',
        ],
      },
      {
        title: 'Timing',
        body: `${dashaBrief(chart, at)} For work decisions, the antardasha lord is the immediate manager of events and the mahadasha lord is the theme of the chapter. A good career period is not always a comfortable one — Saturn and Rahu periods often produce the biggest leaps and the most fatigue at the same time.`,
      },
      {
        title: 'What actually helps',
        body: 'Keep a written record of what you delivered. In charts with a prominent 10th house, recognition arrives through evidence rather than visibility alone. Choose one long game and let the shorter assignments feed it.',
      },
    );
  }

  if (slug === 'love') {
    intro = `${name}, relationship astrology is the most easily misused part of the tradition, so here is the honest version: the chart describes patterns you bring, not a person who is destined for you. Read this as a mirror, then go and have the conversation.`;
    sections.push(
      {
        title: 'What you bring to partnership',
        body: list([houseLordBrief(chart, 7), occupantsBrief(chart, 7)]),
      },
      {
        title: 'Venus and the love language',
        body: `${planetReport(chart, 'venus')} Venus shows what you find beautiful and how you negotiate closeness. ${chart.positions.venus.dignity === 'Exalted' || chart.positions.venus.dignity === 'Own sign' ? 'Well placed, it tends to make affection and aesthetics easy to express.' : 'When Venus is under stress, affection can be expressed indirectly — through acts, gifts or fixing things, rather than words.'}`,
        bullets: [
          `Romance house (5th): ${RASHIS[chart.houseSigns[4]].english}, lord ${PLANETS[RASHIS[chart.houseSigns[4]].lord].name}.`,
          `Venus in ${RASHIS[chart.positions.venus.sign].english}, house ${chart.houseOf.venus}.`,
        ],
      },
      {
        title: 'Emotional needs',
        body: `Your Moon is in ${RASHIS[chart.moonSign].english}, ${NAKSHATRAS[chart.birthNakshatra].name} pada ${chart.positions.moon.pada}. ${capitalise(NAKSHATRAS[chart.birthNakshatra].keywords)} is the emotional register you return to under stress. Partners who read that correctly feel like home; partners who do not can feel like effort even when they mean well.`,
      },
      {
        title: 'Mangal dosha, without the fear',
        body: (() => {
          const factor = factors.find((item) => item.id === 'mangal-dosha')!;
          return `${factor.detail} ${factor.guidance}`;
        })(),
      },
      {
        title: 'Timing',
        body: `${dashaBrief(chart, at)} Relationship periods are usually read from the 7th lord, Venus and the dasha lords that rule those houses. Use the timeline below to see when a new chapter begins — and remember that a favourable period still requires you to show up.`,
      },
    );
  }

  if (slug === 'health') {
    intro = `${name}, Jyotisha has no business diagnosing anything. What it can do is describe your constitution and the conditions under which you tend to thrive or fray. Treat this as a routine report, not a medical one.`;
    sections.push(
      {
        title: 'Constitution',
        body: `${houseLordBrief(chart, 1)} The ascendant lord's condition is the closest thing the chart has to a baseline vitality reading. ${planetReport(chart, chart.ascendant.lord).replace(/^[A-Z]/, (m) => m)}`,
      },
      {
        title: 'Stress and the 6th house',
        body: `${houseLordBrief(chart, 6)} ${occupantsBrief(chart, 6)} The 6th is the house of routine as much as of illness; classical readings emphasise what you do daily far more than what you fear occasionally.`,
      },
      {
        title: 'The mind is the Moon',
        body: `${planetReport(chart, 'moon')} Emotional regulation is physical: sleep, food timing and daylight move the Moon more reliably than willpower does. In Moon-ruled periods, protect the basics first.`,
      },
      {
        title: 'Endurance',
        body: `${planetReport(chart, 'saturn')} Saturn describes the joints, the bones and the cost of overwork — its transits are the classical markers of fatigue. ${
          sade.active
            ? `You are in a Sade Sati phase (${sade.phase}), which traditionally asks for slower pacing and more rest than ambition.`
            : 'Sade Sati is not currently active for your Moon.'
        }`,
      },
      {
        title: 'What helps',
        body: 'Choose the smallest intervention you would actually repeat: a fixed bedtime, a ten-minute walk, meals at regular hours. Charts reward consistency far more than intensity. If something is persistent or worrying, see a qualified doctor — that is not a gap in the reading, it is the correct order of operations.',
      },
    );
  }

  if (slug === 'money') {
    intro = `${name}, money in a Vedic chart is read from several houses at once: what you accumulate, what you earn, what you share and what you lose. None of them predict a number. They describe your relationship with enough — which is the part you can actually change.`;
    sections.push(
      {
        title: 'What you accumulate',
        body: `${houseLordBrief(chart, 2)} ${occupantsBrief(chart, 2)} The 2nd house is also speech and family resources, which is why financial patterns often echo family patterns.`,
      },
      {
        title: 'What you earn',
        body: `${houseLordBrief(chart, 11)} ${occupantsBrief(chart, 11)} The 11th is income and networks together — in practice, most gains arrive through people rather than through plans.`,
      },
      {
        title: 'What you share',
        body: `${houseLordBrief(chart, 8)} ${occupantsBrief(chart, 8)} The 8th covers joint accounts, inheritance, debt and other people's money. It rewards transparency and punishes vague arrangements.`,
      },
      {
        title: 'Jupiter and Saturn',
        body: `${planetReport(chart, 'jupiter')} ${planetReport(chart, 'saturn')} Jupiter expands and Saturn consolidates. A chart with both active at once usually produces a period of growth followed by a necessary discipline.`,
      },
      {
        title: 'Timing',
        body: `${dashaBrief(chart, at)} Use the timeline to see which lord governs the next twelve months. A 2nd-house period favours saving; an 11th-house period favours building networks; a 12th-house period is a poor time to over-leverage.`,
      },
    );
  }

  if (slug === 'life') {
    intro = `${name}, this is the whole-chart reading: the ascendant that sets the stage, the Moon that decides how you experience it, and the dasha arc that decides when each theme gets its turn. Read it slowly, and argue with it where it feels wrong — that argument is usually the useful part.`;
    sections.push(
      {
        title: 'The stage: your ascendant',
        body: `${RASHIS[chart.ascendant.sign].english} rises at ${chart.ascendant.degreeInSign.toFixed(1)}°, in ${NAKSHATRAS[chart.ascendant.nakshatra].name} pada ${chart.ascendant.pada}. ${capitalise(RASHIS[chart.ascendant.sign].keywords)} is the manner in which you meet the world, and the ascendant lord — ${PLANETS[chart.ascendant.lord].name} — is placed in your ${ordinal(chart.houseOf[chart.ascendant.lord])} house. ${planetReport(chart, chart.ascendant.lord)}`,
      },
      {
        title: 'The mind: your Moon',
        body: `${planetReport(chart, 'moon')} The nakshatra ${NAKSHATRAS[chart.birthNakshatra].name} is ruled by ${PLANETS[NAKSHATRAS[chart.birthNakshatra].lord].name} and sets the opening chapter of your Vimshottari cycle. Its keywords — ${NAKSHATRAS[chart.birthNakshatra].keywords} — describe the instinct you fall back on when the plan fails.`,
      },
      {
        title: 'The signature combinations',
        body: factors.filter((factor) => factor.kind === 'yoga').length
          ? factors
              .filter((factor) => factor.kind === 'yoga')
              .slice(0, 3)
              .map((factor) => `${factor.title}: ${factor.detail}`)
              .join(' ')
          : 'No major named yoga is formed by the tight conventional definitions AstroSutra uses. Charts without headline combinations are common, and they tend to show their strength in the dasha sequence instead.',
      },
      {
        title: 'What to watch',
        body: factors.filter((factor) => factor.kind === 'dosha').length
          ? factors
              .filter((factor) => factor.kind === 'dosha')
              .map((factor) => `${factor.title}: ${factor.guidance}`)
              .join(' ')
          : 'No dosha in the set AstroSutra checks. That does not mean an easy life; it means the work is elsewhere.',
      },
      {
        title: 'The chapter you are in',
        body: `${dashaBrief(chart, at)} ${sade.active ? `Sade Sati is in its ${sade.phase!.toLowerCase()} phase, traditionally a period of consolidation.` : 'Sade Sati is not active.'} The next mahadasha begins ${formatPeriodDate(mahadashaSequence(chart).find((period) => period.start.getTime() > at.getTime())?.start ?? at)}; the theme changes well before the exact date, and the classical advice is to prepare during the last antardasha rather than wait.`,
      },
    );
  }

  return {
    def,
    intro,
    sections,
    timeline: timelineFor(chart, at),
    factors,
    closing: `This report was generated on ${formatPeriodDate(at)} from ${chart.input.name}'s chart, using the Lahiri ayanamsa (${chart.ayanamsa.toFixed(3)}°), whole-sign houses and Vimshottari dashas. It is an interpretive reading, not a prediction, and it is not a substitute for professional medical, legal or financial advice.`,
  };
}

export function reportTitle(slug: string): string {
  return REPORT_DEFS.find((def) => def.slug === slug)?.title ?? 'Report';
}

export const treeSummary = (chart: BirthChart, at: Date) => {
  const tree = dashaTreeAt(chart, at);
  return `${PLANETS[tree.maha.lord].name} / ${PLANETS[tree.antar.lord].name}`;
};
