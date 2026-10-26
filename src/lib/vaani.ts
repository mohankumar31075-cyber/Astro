/**
 * Vaani — the in-app guide.
 *
 * Vaani is a transparent, offline rules engine, not a language model. It reads
 * the computed chart (dasha periods, house lords, occupants, dignities and
 * transits), selects the factors relevant to your question and assembles an
 * answer from original, hand-written interpretation text.
 *
 * Two consequences worth knowing:
 *  • No question ever leaves your device. There is no API call.
 *  • Answers are limited to combinations AstroSutra understands. When a
 *    question falls outside that, Vaani says so rather than inventing.
 */
import { HOUSE_MEANINGS, NAKSHATRAS, PLANETS, PLANET_ORDER, RASHIS, type PlanetKey } from './constants';
import { houseLordOf, planetsInHouse, type BirthChart } from './astro';
import { dashaTreeAt, formatPeriodDate, nextMahaChange, type DashaTree } from './dasha';
import { currentTransits, sadeSati } from './transits';

export type Intent =
  | 'career'
  | 'love'
  | 'marriage'
  | 'money'
  | 'health'
  | 'education'
  | 'travel'
  | 'family'
  | 'spiritual'
  | 'timing'
  | 'general';

export interface VaaniAnswer {
  mode: 'chart' | 'care';
  intent: Intent;
  title: string;
  sections: Array<{ title: string; body: string }>;
  factors: Array<{ label: string; value: string }>;
  followUps: string[];
}

const KEYWORDS: Array<{ intent: Intent; words: string[] }> = [
  { intent: 'career', words: ['career', 'job', 'work', 'business', 'promotion', 'promoted', 'office', 'boss', 'switch', 'resign', 'interview', 'salary hike', 'profession', 'company', 'startup'] },
  { intent: 'marriage', words: ['marriage', 'married', 'wedding', 'spouse', 'wife', 'husband', 'partner', 'settle down', 'engagement', 'kundli match', 'compatibility', 'match'] },
  { intent: 'love', words: ['love', 'relationship', 'girlfriend', 'boyfriend', 'romance', 'breakup', 'break up', 'crush', 'dating', 'ex'] },
  { intent: 'money', words: ['money', 'finance', 'financial', 'wealth', 'rich', 'loan', 'debt', 'invest', 'investment', 'savings', 'expenses', 'property', 'buy a house', 'gold'] },
  { intent: 'health', words: ['health', 'energy', 'sleep', 'stress', 'anxiety', 'tired', 'fatigue', 'body', 'gym', 'diet', 'burnout'] },
  { intent: 'education', words: ['study', 'studies', 'exam', 'education', 'college', 'university', 'course', 'degree', 'research', 'phd', 'scholarship', 'learn'] },
  { intent: 'travel', words: ['travel', 'abroad', 'visa', 'relocate', 'relocation', 'move to', 'foreign', 'onsite', 'trip', 'settle abroad'] },
  { intent: 'family', words: ['family', 'mother', 'father', 'parents', 'child', 'children', 'sibling', 'brother', 'sister', 'home', 'house'] },
  { intent: 'spiritual', words: ['spiritual', 'meditation', 'purpose', 'meaning', 'guru', 'faith', 'devotion', 'moksha', 'destiny', 'karma'] },
  { intent: 'timing', words: ['transit', 'transits', 'dasha', 'sade sati', 'saturn', 'gochar', 'antardasha'] },
];

const CRISIS_WORDS = ['suicide', 'kill myself', 'end my life', 'self harm', 'self-harm', 'want to die', 'no reason to live'];
const MEDICAL_WORDS = ['cancer', 'tumour', 'tumor', 'diagnosis', 'diagnosed', 'surgery', 'chemotherapy', 'pregnant', 'pregnancy', 'depression', 'bipolar', 'medicine', 'dosage'];
const LEGAL_WORDS = ['lawsuit', 'court case', 'legal case', 'divorce papers', 'fir', 'custody battle'];

export const SUGGESTED_QUESTIONS = [
  'When is a good time to change jobs?',
  'What does my chart say about marriage?',
  'How can I improve my finances this year?',
  'Why has my energy been low?',
  'Should I study further or start working?',
  'Is this a good year to move abroad?',
  'What does my chart say about love?',
  'How do I work with the current Saturn transit?',
];

export function classifyQuestion(question: string): Intent {
  const q = ` ${question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ')} `;
  let best: { intent: Intent; score: number } = { intent: 'general', score: 0 };
  for (const group of KEYWORDS) {
    let score = 0;
    for (const word of group.words) {
      if (q.includes(` ${word} `) || q.includes(` ${word}s `)) score += word.includes(' ') ? 2 : 1;
    }
    if (score > best.score) best = { intent: group.intent, score };
  }
  return best.intent;
}

const DASHA_GIST: Record<PlanetKey, string> = {
  sun: 'Sun periods put authority, visibility and your relationship with recognition at the centre. They reward standing behind your own name and tend to expose where you have been waiting for permission.',
  moon: 'Moon periods are about the mind, care and belonging. They soften the outer push and make emotional security the thing that actually decides your choices.',
  mars: 'Mars periods raise heat and momentum. They are productive for competition, property and hard problems, and unproductive when the energy gets aimed at people instead of work.',
  jupiter: 'Jupiter periods widen the frame: learning, mentors, ethics and opportunity. The risk in a Jupiter period is over-committing because everything looks possible.',
  mercury: 'Mercury periods sharpen communication, trade and analysis. They favour negotiation, writing, study and the small logistical decisions that compound.',
  venus: 'Venus periods bring relationships, comfort, aesthetics and negotiation into focus. They tend to make both pleasure and compromise more visible.',
  saturn: 'Saturn periods teach structure. They slow things down, remove shortcuts and reward consistent, unglamorous effort more than any single leap.',
  rahu: 'Rahu periods amplify hunger for the unfamiliar — ambition, reinvention, foreign things. They are excellent for breaking out of a pattern and dangerous for chasing something purely because it is shiny.',
  ketu: 'Ketu periods turn attention inward. They often bring detachment from something you thought you needed, and real progress in work that does not require an audience.',
};

const INTENT_CONFIG: Record<Intent, {
  title: string;
  houses: number[];
  advice: string[];
  watch: string;
  followUps: string[];
}> = {
  career: {
    title: 'Career and work',
    houses: [10, 6, 2],
    advice: [
      'Name the outcome you want in one sentence, then look for the smallest visible step that moves toward it this month.',
      'In career questions the chart is most useful for timing and temperament, not job titles: use it to choose when to push and when to prepare.',
      'Keep a written record of your results. Your chart emphasises visible work, and evidence is what converts effort into recognition.',
    ],
    watch: 'Do not read a slow phase as a permanent ceiling. Dasha periods change, and the 10th house describes the field you are built for, not your market value this quarter.',
    followUps: ['What kind of work suits my chart?', 'When does my current period change?', 'How is my money situation looking?'],
  },
  love: {
    title: 'Love and connection',
    houses: [7, 5, 11],
    advice: [
      'Say the honest, specific thing rather than the impressive one. Your chart rewards clarity over performance in relationships.',
      'Ask what the other person actually needs before offering what you are good at giving.',
      'Regularity beats intensity: the small consistent gesture is the one that changes how safe someone feels with you.',
    ],
    watch: 'The 7th house describes partnership patterns, not a specific person. AstroSutra will never tell you whether someone is "the one".',
    followUps: ['What does my chart say about marriage?', 'How compatible are our charts?', 'What is my love pattern?'],
  },
  marriage: {
    title: 'Marriage and long-term partnership',
    houses: [7, 2, 11],
    advice: [
      'Look at the person, not only the score. Guna Milan reads the Moon; a full reading also needs both 7th houses, Venus and Jupiter, and the dashas running in the years you plan to marry.',
      'Have the practical conversation early: money, family expectations, where you will live. Charts describe tendencies; agreements decide outcomes.',
      'If a compatibility score is low, read the individual koota breakdown before drawing a conclusion. Most pairs have two or three strong factors.',
    ],
    watch: 'Compatibility is not a gate. Classical practice treats Guna Milan as one input among many, and lists several cancellations for each dosha.',
    followUps: ['How compatible are two charts?', 'What does my 7th house say?', 'When is a favourable marriage window?'],
  },
  money: {
    title: 'Money and resources',
    houses: [2, 11, 8],
    advice: [
      'Separate earning from keeping. Charts that emphasise the 2nd house tend to reward saving discipline more than income spikes.',
      'Review one recurring expense and one long-term commitment this month. Small structural changes compound faster than windfalls.',
      'Avoid decisions made to change a mood rather than a number.',
    ],
    watch: 'AstroSutra does not give investment advice and cannot tell you what to buy or when to sell.',
    followUps: ['Is this a good time to invest?', 'What does my chart say about property?', 'How do I handle debt?'],
  },
  health: {
    title: 'Energy, rest and routine',
    houses: [6, 1, 12],
    advice: [
      'Treat the 6th house as the house of routine rather than disease. The useful question is what your daily rhythm is asking for right now.',
      'Protect sleep and food timing first. Most chart-based energy dips respond to schedule before they respond to effort.',
      'Schedule recovery the way you schedule work; in a Saturn period, rest that is not planned tends not to happen.',
    ],
    watch: 'Astrology cannot diagnose illness. If something is persistent or worrying, speak to a qualified doctor — that is not a limitation of the reading, it is the correct order of operations.',
    followUps: ['How do I handle stress better?', 'What does my chart say about my energy?', 'What is Sade Sati?'],
  },
  education: {
    title: 'Study, learning and exams',
    houses: [4, 5, 9],
    advice: [
      'Match the subject to how you think rather than only to the outcome. Your 5th house shows the intelligence style you naturally trust.',
      'Build a visible practice: a fixed study slot beats a brilliant plan with no repetition.',
      'Ask one person who already does the work what the actual day-to-day is like, before committing years to it.',
    ],
    watch: 'A weak-looking 5th house rarely means "not intelligent". It more often describes a learning style that needs structure, movement or a different medium.',
    followUps: ['Should I study further or work?', 'What kind of learner am I?', 'When is a good exam window?'],
  },
  travel: {
    title: 'Travel, relocation and foreign lands',
    houses: [9, 12, 4],
    advice: [
      'The 12th house relates to foreign places and life away from the familiar; the 9th to journeys that expand your belief system. Decide which kind of move you are actually making.',
      'Check the practical layer too: visa rules, money runway and the people you will rely on. A supportive chart does not shorten a waiting list.',
      'If you are moving, keep one anchor habit from home. It makes the transition far less disorienting.',
    ],
    watch: 'A favourable period does not guarantee an outcome you have not applied for. Timing opens doors; it does not walk through them.',
    followUps: ['Is relocation favoured this year?', 'What does my 12th house hold?', 'How is my current period going?'],
  },
  family: {
    title: 'Family and home',
    houses: [4, 2, 9],
    advice: [
      'The 4th house describes what home means to you, not just where it is. Get specific about what you need in order to feel settled.',
      'Say the boundary early and kindly, rather than late and sharply.',
      'If there is a family matter in play, check the Moon-sign compatibility of the charts involved — emotional pacing clashes are often visible there.',
    ],
    watch: 'You cannot read another person\'s feelings from your own chart. Use theirs, with their consent, or ask them directly.',
    followUps: ['What does my 4th house say?', 'How are my family relationships?', 'How do I set better boundaries?'],
  },
  spiritual: {
    title: 'Meaning and practice',
    houses: [9, 12, 5],
    advice: [
      'The 9th house is belief and teachers, the 12th is dissolution and release. A steady practice suits you more than a dramatic breakthrough.',
      'Pick one practice and keep it for a full dasha season. Consistency is the variable that changes outcomes here.',
      'Study the tradition you are drawn to before adopting its aesthetics.',
    ],
    watch: 'Spiritual bypassing is a real risk in Rahu and Ketu periods — using insight to avoid a practical obligation. Apply the teaching somewhere concrete.',
    followUps: ['What is my birth nakshatra?', 'What is my life theme?', 'How do I handle Ketu periods?'],
  },
  timing: {
    title: 'Timing: dasha and transits',
    houses: [1, 10],
    advice: [
      'Read the dasha as the chapter and the transit as the weather. A difficult transit inside a supportive dasha is a busy week, not a lost year.',
      'Put a date on the next period change and work backwards from it: what has to be finished before the chapter turns?',
      'Saturn rewards what is already built. If a Saturn transit feels heavy, look for the structure you have been avoiding rather than the luck you have been missing.',
    ],
    watch: 'No dasha or transit determines an event. The useful question is not "what will happen" but "what does this period ask me to practise".',
    followUps: ['What is my current dasha?', 'When does my next mahadasha start?', 'Why has my energy been low?'],
  },
  general: {
    title: 'Your chart right now',
    houses: [1, 10, 4],
    advice: [
      'Pick one area where you want movement and give it a visible, dated next step.',
      'Use the timing layer rather than fighting it: build during Saturn, expand during Jupiter, communicate during Mercury.',
      'Re-read your chart factors after the decision. They are more useful as reflection than as instruction.',
    ],
    watch: 'A chart describes tendencies and timing, never certainty. AstroSutra deliberately avoids fatalistic claims.',
    followUps: SUGGESTED_QUESTIONS.slice(0, 3),
  },
};

const ORD = (n: number) => {
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${n}${suffix}`;
};

function crisisAnswer(): VaaniAnswer {
  return {
    mode: 'care',
    intent: 'general',
    title: 'Let\'s pause on astrology',
    sections: [
      {
        title: 'You matter more than the reading',
        body:
          'What you described sounds heavier than a chart question should carry. AstroSutra is not a crisis service, and no planetary position is a reason to stay in pain or to act on it.',
      },
      {
        title: 'Please reach out now',
        body:
          'If you are in immediate danger, contact your local emergency number. In India, Tele-MANAS is on 14416 (24×7), and the AASRA helpline is +91-9820466726. Outside India, your national emergency line can connect you. If there is one person you trust, tell them tonight — you do not need the right words.',
      },
      {
        title: 'When you want to come back',
        body: 'AstroSutra will still be here. Charts are for reflection, not for deciding whether you deserve to stay.',
      },
    ],
    factors: [],
    followUps: [],
  };
}

function careAnswer(title: string, body: string, followUps: string[] = []): VaaniAnswer {
  return { mode: 'care', intent: 'general', title, sections: [{ title: 'A careful answer', body }], factors: [], followUps };
}

export function askVaani(question: string, chart: BirthChart, at: Date): VaaniAnswer {
  const q = question.toLowerCase();
  if (CRISIS_WORDS.some((w) => q.includes(w))) return crisisAnswer();
  if (MEDICAL_WORDS.some((w) => q.includes(w))) {
    return careAnswer(
      'Astrology cannot diagnose',
      'I can talk about rest, routine and the emotional weather around a health question, but I will not name an illness or interpret a diagnosis — that is a doctor\'s job, and charts are the wrong tool for it. If something is persistent, please have it looked at. What I can do is show you the 6th house themes in your chart and help you think about routine and recovery.',
      ['What does my 6th house say?', 'How do I build a steadier routine?'],
    );
  }
  if (LEGAL_WORDS.some((w) => q.includes(w))) {
    return careAnswer(
      'Legal questions need a lawyer',
      'I can describe the timing themes in your chart, but I cannot advise on a court matter, a filing or a custody decision. Those carry consequences a chart cannot be responsible for. Please consult a qualified lawyer; astrology is, at most, a way to think about your own patience and judgment while the process unfolds.',
      ['How do I handle stress during this period?', 'What is my current dasha?'],
    );
  }

  const intent = classifyQuestion(question);
  const config = INTENT_CONFIG[intent];
  const tree: DashaTree = dashaTreeAt(chart, at);
  const transits = currentTransits(chart, at);
  const sade = sadeSati(chart, at);
  const mahaLord = tree.maha.lord;
  const antarLord = tree.antar.lord;
  const pratyantarLord = tree.pratyantar.lord;
  const mahaPos = chart.positions[mahaLord];
  const antarPos = chart.positions[antarLord];

  const primaryHouse = config.houses[0];
  const primaryLord = houseLordOf(chart, primaryHouse);
  const lordPos = chart.positions[primaryLord];
  const occupants = planetsInHouse(chart, primaryHouse);
  const houseInfo = HOUSE_MEANINGS[primaryHouse - 1];

  const dashaLine = `You are in ${PLANETS[mahaLord].name} mahadasha and ${PLANETS[antarLord].name} antardasha (${formatPeriodDate(tree.antar.start)} – ${formatPeriodDate(tree.antar.end)}), with ${PLANETS[pratyantarLord].name} as the current pratyantardasha lord. ${PLANETS[mahaLord].name} sits in your ${ORD(mahaPos.house)} house in ${RASHIS[mahaPos.sign].english}; ${PLANETS[antarLord].name} sits in your ${ORD(antarPos.house)} house.`;

  const houseLine = `The ${ORD(primaryHouse)} house (${houseInfo.english.toLowerCase()}, ${houseInfo.domain}) is ${RASHIS[chart.houseSigns[primaryHouse - 1]].english}, ruled by ${PLANETS[primaryLord].name}, which is ${lordPos.dignity.toLowerCase()} in your ${ORD(lordPos.house)} house of ${HOUSE_MEANINGS[lordPos.house - 1].english.toLowerCase()}.${
    occupants.length > 0
      ? ` It holds ${occupants.map((p) => `${PLANETS[p].name} (${chart.positions[p].dignity.toLowerCase()})`).join(', ')}.`
      : ' No graha occupies it directly, so the reading leans on its lord and on the dasha periods.'
  }`;

  const jupiter = transits.find((t) => t.key === 'jupiter')!;
  const saturn = transits.find((t) => t.key === 'saturn')!;
  const transitLine = `As of today, Jupiter is transiting your ${ORD(jupiter.houseFromMoon)} house from the Moon and Saturn your ${ORD(saturn.houseFromMoon)}. ${
    sade.active
      ? `Saturn is in the ${sade.phase!.toLowerCase()} phase of Sade Sati, which adds weight and patience to this stretch${sade.phaseEnd ? ` until about ${formatPeriodDate(sade.phaseEnd)}` : ''}.`
      : 'Sade Sati is not active for your natal Moon right now.'
  }`;

  const nextAntar = nextAntarFromTree(tree);
  const nextMaha = nextMahaChange(chart, at);
  const timingLine = [
    `The current ${PLANETS[antarLord].name} antardasha runs until ${formatPeriodDate(tree.antar.end)}.`,
    nextAntar ? `After that, ${PLANETS[nextAntar.lord].name} takes over the antardasha, which shifts emphasis toward ${DASHA_GIST[nextAntar.lord].split('.')[0].toLowerCase()}.` : '',
    nextMaha ? `Your next mahadasha begins ${formatPeriodDate(nextMaha.start)} with ${PLANETS[nextMaha.lord].name} — the larger chapter.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const dashaAdvice = `${DASHA_GIST[mahaLord]} ${DASHA_GIST[antarLord]}`;

  const sections: Array<{ title: string; body: string }> = [
    {
      title: 'What your chart emphasises',
      body: `${houseLine} ${dashaLine}`,
    },
    {
      title: 'The active weather',
      body: `${transitLine} ${dashaAdvice}`,
    },
    {
      title: 'Timing',
      body: timingLine,
    },
    {
      title: 'What tends to work',
      body: config.advice.join(' '),
    },
    {
      title: 'What to keep in mind',
      body: config.watch,
    },
  ];

  return {
    mode: 'chart',
    intent,
    title: config.title,
    sections,
    factors: [
      { label: 'Current mahadasha', value: `${PLANETS[mahaLord].name} · until ${formatPeriodDate(tree.maha.end)}` },
      { label: 'Antardasha', value: `${PLANETS[antarLord].name} · until ${formatPeriodDate(tree.antar.end)}` },
      { label: 'Focus house', value: `${ORD(primaryHouse)} · ${RASHIS[chart.houseSigns[primaryHouse - 1]].name}, lord ${PLANETS[primaryLord].name} in ${ORD(lordPos.house)}` },
      { label: 'Transit Jupiter', value: `${RASHIS[jupiter.sign].english} · ${ORD(jupiter.houseFromMoon)} from Moon` },
      { label: 'Transit Saturn', value: `${RASHIS[saturn.sign].english} · ${ORD(saturn.houseFromMoon)} from Moon` },
      { label: 'Sade Sati', value: sade.active ? `${sade.phase} phase` : 'Not active' },
      { label: 'Dasha anchor', value: `${NAKSHATRAS[chart.birthNakshatra].name} · ${NAKSHATRAS[chart.birthNakshatra].lord} lord` },
    ],
    followUps: config.followUps.filter((f) => f.toLowerCase() !== question.toLowerCase()).slice(0, 3),
  };
}

/**
 * The next antardasha lord after the current one. Antardashas follow the fixed
 * Vimshottari order inside every mahadasha, so the successor is simply the next
 * lord in the sequence.
 */
function nextAntarFromTree(tree: DashaTree): { lord: PlanetKey; start: Date } | null {
  const index = PLANET_ORDER.indexOf(tree.antar.lord);
  if (index < 0) return null;
  return { lord: PLANET_ORDER[(index + 1) % PLANET_ORDER.length], start: tree.antar.end };
}
