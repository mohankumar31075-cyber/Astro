/**
 * Daily horoscope generation.
 *
 * These readings are composed from actual sky data for the day — the Moon's
 * transit house, its nakshatra, the weekday lord, the tithi and the positions
 * of Venus, Mars, Mercury, Jupiter and Saturn — combined with original sign
 * profiles written for AstroSutra. Nothing here is copied from another app,
 * and the same inputs always produce the same reading.
 */
import {
  NAKSHATRAS,
  PLANETS,
  RASHIS,
  WEEKDAYS,
  nakshatraOfLongitude,
  padaOfLongitude,
  rashiOfLongitude,
} from './constants';
import { planetLongitude, type BirthChart } from './astro';
import { computePanchang, type Panchang } from './panchang';

export interface SignProfile {
  index: number;
  tagline: string;
  essence: string;
  strengths: string[];
  watchouts: string[];
  career: string;
  love: string;
  wellbeing: string;
}

export const SIGN_PROFILES: SignProfile[] = [
  {
    index: 0,
    tagline: 'First light',
    essence:
      'Aries is the zodiac\'s opening move: direct, warm, and allergic to waiting. You tend to learn by starting rather than by preparing, and your honesty is usually kinder than your timing suggests.',
    strengths: ['courage under pressure', 'fast decisions', 'restarting after setbacks'],
    watchouts: ['finishing what you begin', 'reading the room before speaking', 'patience with slower processes'],
    career: 'You do your best work when there is a real problem to attack and room to own the outcome. Long approval chains wear you down faster than hard deadlines do.',
    love: 'You fall fast and honestly. The relationship skill to practise is staying curious after the chase is over.',
    wellbeing: 'Your energy arrives in bursts. Build recovery into the plan instead of waiting for the crash to schedule it for you.',
  },
  {
    index: 1,
    tagline: 'The slow yes',
    essence:
      'Taurus builds things that last. You prefer a considered yes to a quick maybe, and you notice quality — in food, in work, in people — that others walk past.',
    strengths: ['steadiness', 'sensory intelligence', 'loyalty that compounds'],
    watchouts: ['stubbornness dressed as principle', 'avoiding necessary change', 'over-attachment to comfort'],
    career: 'You are the person a team relies on when something must actually ship. Value your pace: it is a feature, but deadlines still need negotiating.',
    love: 'You love in practical acts and long horizons. Say the affectionate thing out loud as often as you demonstrate it.',
    wellbeing: 'Routine is your medicine. Movement, meals at regular hours and time outdoors do more for you than intense short-lived regimes.',
  },
  {
    index: 2,
    tagline: 'Two threads, one mind',
    essence:
      'Gemini is curiosity in motion — words, connections, tabs open in the browser and in the mind. You are often the translator between people who cannot hear each other.',
    strengths: ['quick learning', 'adaptable language', 'genuine range of interests'],
    watchouts: ['scattered attention', 'saying the clever thing instead of the true one', 'starting more than you finish'],
    career: 'Roles that reward communication, research and variety suit you. The risk is being everywhere and known for nothing, so pick a lane to be excellent in.',
    love: 'You need conversation more than grand gestures. Tell your partner what you are thinking before it becomes a story you have already rehearsed.',
    wellbeing: 'Your nervous system runs hot. Screens off an hour earlier does more for your sleep than any supplement.',
  },
  {
    index: 3,
    tagline: 'The shell and the tide',
    essence:
      'Cancer reads the emotional temperature of a room before anyone speaks. You are protective, nostalgic, and far tougher than the people who mistake softness for fragility realise.',
    strengths: ['emotional memory', 'care that anticipates needs', 'fierce loyalty to your people'],
    watchouts: ['holding onto old hurts', 'indirect communication', 'mood-driven decisions'],
    career: 'You work best in teams that feel like a place you belong. Naming your boundaries early prevents the resentment that builds silently.',
    love: 'You build a home around people. Ask directly for what you need instead of hoping it is noticed.',
    wellbeing: 'Water, sleep and familiar food are not indulgences for you — they are maintenance. Protect your evenings.',
  },
  {
    index: 4,
    tagline: 'The hearth',
    essence:
      'Leo is generative warmth: the impulse to make something, host something, be seen making it. Your generosity is real, and so is the need to have it noticed.',
    strengths: ['presence', 'loyalty to the people you claim', 'creative courage'],
    watchouts: ['pride before repair', 'needing applause to continue', 'taking feedback as identity'],
    career: 'You are built for ownership and visibility. The growth edge is sharing credit as fluently as you accept it.',
    love: 'You love generously and want to be chosen out loud. Romance matters to you; say so.',
    wellbeing: 'Your heart leads your body. Joyful movement — dance, sport, play — regulates you better than punishing workouts.',
  },
  {
    index: 5,
    tagline: 'The craftsperson',
    essence:
      'Virgo improves things: sentences, systems, recipes, selves. You notice the small flaw and also the small improvement that would make everything work.',
    strengths: ['precision', 'service without fanfare', 'learning through iteration'],
    watchouts: ['perfectionism as procrastination', 'self-criticism', 'correcting people who did not ask'],
    career: 'You are the quality bar in any team. Make your standards visible early so they read as care rather than criticism.',
    love: 'You show love by solving problems. Ask whether your partner wants a solution or company before you offer one.',
    wellbeing: 'Digestion and routine respond to your attention. A ten-minute walk after meals is worth more than an elaborate plan.',
  },
  {
    index: 6,
    tagline: 'The weighing scale',
    essence:
      'Libra is the art of the fair middle: aesthetics, negotiation, and an instinct for how things look from the other chair. You are often the reason a room stays civil.',
    strengths: ['diplomacy', 'design sense', 'seeing both sides honestly'],
    watchouts: ['indecision', 'conflict avoidance', 'outsourcing your opinion to the room'],
    career: 'You excel where relationships are the work — partnerships, design, law, client-facing roles. Decide before you are forced to.',
    love: 'Partnership is a core theme for you, not a side quest. The practice is stating a preference without polling the room first.',
    wellbeing: 'Balance is literal for you: sleep, sugar, screens, and time alone versus time with people.',
  },
  {
    index: 7,
    tagline: 'Still water',
    essence:
      'Scorpio goes to the bottom of things. You do not do shallow, and you can hold intensity that would make other people leave the room. Trust, once given, is total.',
    strengths: ['depth of focus', 'reading what is unspoken', 'regenerating after loss'],
    watchouts: ['control disguised as care', 'testing people', 'holding grudges past their usefulness'],
    career: 'Research, strategy, crisis work and anything with real stakes suit you. Conserve your energy for what deserves it.',
    love: 'You want an all-in partner. Practise saying what you want before you test whether they can guess it.',
    wellbeing: 'Your resilience is real but not infinite. Deliberate decompression keeps intensity from turning inward.',
  },
  {
    index: 8,
    tagline: 'The open road',
    essence:
      'Sagittarius needs the horizon. You are honest to a fault and generous with meaning — the friend who reframes a bad week into a lesson you can actually use.',
    strengths: ['optimism that is contagious', 'big-picture thinking', 'courage to be direct'],
    watchouts: ['bluntness', 'committing then needing an exit', 'promising more than your calendar allows'],
    career: 'Teaching, travel, publishing and growth work feed you. Beware the offer that looks like freedom but is just a longer leash.',
    love: 'You love honestly and need space inside closeness. Say what the space is for, so it does not read as distance.',
    wellbeing: 'Outdoors and movement keep your mood upright. Watch the tendency to overdo everything in a good week.',
  },
  {
    index: 9,
    tagline: 'The long climb',
    essence:
      'Capricorn builds in the dark: patient, structural, allergic to shortcuts. You feel responsible earlier than your peers, and you are usually right about what will last.',
    strengths: ['endurance', 'strategic patience', 'responsibility without applause'],
    watchouts: ['hardness toward yourself', 'deferring happiness', 'mistaking control for safety'],
    career: 'You are on a long curve and it favours you. Make sure the ladder is against the right wall before year three.',
    love: 'You show commitment through reliability. Add warmth and words — reliability alone can read as reserve.',
    wellbeing: 'Knees, joints and time off. Schedule recovery as seriously as you schedule deliverables.',
  },
  {
    index: 10,
    tagline: 'The signal',
    essence:
      'Aquarius thinks in systems and futures. You notice the pattern under the conversation, and you would rather be accurate than agreeable.',
    strengths: ['original thinking', 'principled independence', 'community-minded imagination'],
    watchouts: ['detachment when intimacy is needed', 'contrarianism', 'ideas without follow-through'],
    career: 'Technology, policy, design and anything that improves a system suit you. Ship something small before perfecting the grand plan.',
    love: 'You need a partner who is also a collaborator. Explain your need for space as a need, not as a philosophy.',
    wellbeing: 'Your mind runs ahead of your body. Regular sleep and unplugged time keep that gap from becoming exhaustion.',
  },
  {
    index: 11,
    tagline: 'The ocean',
    essence:
      'Pisces dissolves boundaries: imagination, empathy, music, and the ability to feel someone else\'s weather as your own. You understand things before you can explain them.',
    strengths: ['imagination', 'compassion without conditions', 'artistic instinct'],
    watchouts: ['escaping instead of deciding', 'absorbing other people\'s moods', 'vague boundaries'],
    career: 'Creative, healing and human-facing work suits you. Add one structure — a calendar, a collaborator, a deadline — to make the talent visible.',
    love: 'You love deeply and can lose yourself in it. Keep a few things that are only yours.',
    wellbeing: 'Rest, art and water restore you. Notice when empathy has become depletion and step back without guilt.',
  },
];

const HOUSE_THEME: Array<{ theme: string; do: string; careful: string }> = [
  { theme: 'body, identity and first impressions', do: 'make the first move on something you have been circling', careful: 'mistaking busyness for direction' },
  { theme: 'money, family and the things you own', do: 'review a number you have been avoiding', careful: 'spending to change your mood' },
  { theme: 'skills, siblings and short journeys', do: 'send the message you have been drafting', careful: 'scattering your effort across five open tabs' },
  { theme: 'home, feelings and the past', do: 'make one corner of your space feel intentional', careful: 'replaying an old conversation' },
  { theme: 'creativity, romance and children', do: 'make something small and unfinished', careful: 'needing it to be perfect before anyone sees it' },
  { theme: 'work, health and daily friction', do: 'fix the small recurring annoyance', careful: 'treating rest as a reward you have not earned' },
  { theme: 'partnership and negotiation', do: 'have the conversation you have been postponing', careful: 'agreeing just to keep the peace' },
  { theme: 'depth, secrets and shared resources', do: 'look at what you are actually afraid of', careful: 'confusing intensity with intimacy' },
  { theme: 'meaning, travel and belief', do: 'book, apply, or say yes to the thing that expands you', careful: 'big promises your calendar cannot keep' },
  { theme: 'career, status and public work', do: 'put your name on the work', careful: 'chasing visibility instead of competence' },
  { theme: 'income, networks and wishes', do: 'ask someone for what you actually want', careful: 'collecting contacts instead of building relationships' },
  { theme: 'rest, release and the invisible', do: 'protect an hour that belongs to nobody else', careful: 'sleeping your way out of a decision' },
];

type ToneCategory = 'self' | 'resources' | 'effort' | 'emotional' | 'creative' | 'partnership' | 'depth' | 'meaning' | 'release';

const categoryOf = (house: number): ToneCategory => {
  if (house === 1) return 'self';
  if (house === 2 || house === 11) return 'resources';
  if (house === 3 || house === 6 || house === 10) return 'effort';
  if (house === 4) return 'emotional';
  if (house === 5) return 'creative';
  if (house === 7) return 'partnership';
  if (house === 8) return 'depth';
  if (house === 9) return 'meaning';
  return 'release';
};

const PLANET_TONE: Record<'venus' | 'mars' | 'mercury' | 'saturn' | 'jupiter', Record<ToneCategory, string>> = {
  venus: {
    self: 'softens how you come across — let charm do the work instead of force',
    resources: 'turns attention to comfort and worth: spend on quality once rather than quantity twice',
    effort: 'brings ease to daily work through better relationships rather than longer hours',
    emotional: 'makes home and belonging the place where your best energy wants to go',
    creative: 'adds colour to whatever you make — finish something for the pleasure of it',
    partnership: 'is one of the best influences on partnership; say the appreciative thing out loud',
    depth: 'asks for honesty about what you want from closeness, not just what you can tolerate',
    meaning: 'makes learning and travel more beautiful than productive — both are allowed',
    release: 'favours rest, art and quiet company over performing for anyone',
  },
  mars: {
    self: 'raises your presence and your impatience in equal measure — move, then decide',
    resources: 'pushes you to earn, negotiate or defend what is yours',
    effort: 'gives stamina for difficult work; watch how you speak to people who slow you down',
    emotional: 'stirs up the home front — address the irritation instead of storing it',
    creative: 'makes creative work competitive and physical; use the energy, do not aim it at people',
    partnership: 'brings heat into relationships — good for honesty, poor for scorekeeping',
    depth: 'amplifies intensity; the useful practice is naming anger early and small',
    meaning: 'sends you looking for a fight worth having, ideally a cause rather than a person',
    release: 'can make rest feel unsafe — schedule recovery anyway, ideally something physical',
  },
  mercury: {
    self: 'sharpens your words and your perception — use both on a plan, not on a person',
    resources: 'favours paperwork, negotiation and the boring conversation that saves money',
    effort: 'brings a run of small tasks to a finish; batch them',
    emotional: 'asks you to say the feeling plainly instead of explaining it in circles',
    creative: 'turns ideas into drafts — lower the bar and get one down',
    partnership: 'makes conversation the main event; ask one better question',
    depth: 'suits research and the honest audit of a situation you have been guessing at',
    meaning: 'is a good influence for study, applications and anything with a form to fill',
    release: 'settles a busy mind; write the list, then close the tab',
  },
  saturn: {
    self: 'asks for patience with your own pace — the body keeps the calendar',
    resources: 'rewards budgeting and consistency over windfalls',
    effort: 'makes workloads heavier and competence more visible; do less, better',
    emotional: 'brings responsibility for family matters; boundaries are the kind response',
    creative: 'slows output and improves craft — keep the practice, lower the expectation',
    partnership: 'tests commitment and rewards the unglamorous maintenance of a relationship',
    depth: 'asks for an honest reckoning; the way through is structure, not avoidance',
    meaning: 'turns belief into practice; a course or routine matters more than a revelation',
    release: 'makes rest feel earned; schedule it like an obligation and keep it',
  },
  jupiter: {
    self: 'adds confidence that others can feel — spend it on opportunity, not ego',
    resources: 'often coincides with growth in resources; invest rather than inflate',
    effort: 'rewards work that teaches you something; say yes to the stretch assignment',
    emotional: 'brings warmth and support to the home front; let yourself receive it',
    creative: 'expands creative ambition; choose one big thing rather than five medium ones',
    partnership: 'favours commitment, teachers and people who widen your world',
    depth: 'brings perspective on something that has felt enormous',
    meaning: 'is at home here — study, travel and faith in a larger plan',
    release: 'makes retreat restorative; take the rest without justifying it',
  },
};

const COLOUR_BY_WEEKDAY = [
  { name: 'Gold', hex: '#d9b26a' },
  { name: 'Pearl white', hex: '#e7e9f2' },
  { name: 'Coral red', hex: '#d95d4a' },
  { name: 'Emerald green', hex: '#4fae86' },
  { name: 'Saffron', hex: '#e39b3b' },
  { name: 'Rose pink', hex: '#e6a8c8' },
  { name: 'Indigo', hex: '#5b5f9e' },
];

const TITHI_TONE: Record<'growth' | 'peak' | 'release' | 'dark', string> = {
  growth: 'The waxing Moon supports starting, asking and building.',
  peak: 'The Moon is near full: things come to the surface, including things you meant to leave buried.',
  release: 'The waning Moon favours finishing, clearing and letting go rather than launching.',
  dark: 'The new Moon is a quiet slate — better for reflection than announcement.',
};

const tithiMood = (number: number): 'growth' | 'peak' | 'release' | 'dark' => {
  if (number === 30) return 'dark';
  if (number === 15) return 'peak';
  if (number < 15) return number < 5 ? 'growth' : 'growth';
  return number >= 25 ? 'release' : 'release';
};

export interface DailyHoroscope {
  sign: number;
  dateISO: string;
  headline: string;
  summary: string;
  sections: Array<{ key: string; title: string; body: string }>;
  stars: number;
  lucky: { number: number; colour: { name: string; hex: string }; hour: string };
  moon: { sign: number; nakshatra: number; pada: number; house: number };
  tone: string;
  panchang: Panchang;
}

const hash = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const houseFrom = (planetSign: number, sign: number) => ((planetSign - sign + 12) % 12) + 1;

const HEADLINES = [
  'Move the small thing first',
  'Say the true version',
  'Let the day be ordinary',
  'One conversation changes the week',
  'Build, do not announce',
  'The answer is in the routine',
  'Make room before you fill it',
  'Choose depth over speed',
  'The useful yes is a small one',
  'Ask for the thing',
  'Finish something quietly',
  'Leave a little space in the plan',
];

const STARS_SUPPORT = [1, 2, 3, 5, 6, 7, 9, 10, 11];

export function dailyHoroscope(
  sign: number,
  date: Date,
  place: { latitude: number; longitude: number; timeZone: string; place: string },
): DailyHoroscope {
  const panchang = computePanchang(date, place);
  const profile = SIGN_PROFILES[sign];
  const seed = `${sign}-${panchang.dateISO}`;
  const dayHash = hash(seed);

  const ayanamsaDate = date;
  const moonLongitude = planetLongitude('moon', ayanamsaDate);
  const moonSign = rashiOfLongitude(moonLongitude);
  const moonNak = nakshatraOfLongitude(moonLongitude);
  const moonHouse = houseFrom(moonSign, sign);

  const planetHouses = {
    venus: houseFrom(rashiOfLongitude(planetLongitude('venus', ayanamsaDate)), sign),
    mars: houseFrom(rashiOfLongitude(planetLongitude('mars', ayanamsaDate)), sign),
    mercury: houseFrom(rashiOfLongitude(planetLongitude('mercury', ayanamsaDate)), sign),
    saturn: houseFrom(rashiOfLongitude(planetLongitude('saturn', ayanamsaDate)), sign),
    jupiter: houseFrom(rashiOfLongitude(planetLongitude('jupiter', ayanamsaDate)), sign),
  };

  const ownHouse = HOUSE_THEME[moonHouse - 1];
  const mood = tithiMood(panchang.tithi.number);
  const dayLord = WEEKDAYS[panchang.weekday.index].lord;
  const dayLordHouse = houseFrom(rashiOfLongitude(planetLongitude(dayLord, ayanamsaDate)), sign);

  let support = 0;
  if (STARS_SUPPORT.includes(moonHouse)) support += 2;
  if ([1, 4, 7, 10].includes(planetHouses.jupiter)) support += 1;
  if ([1, 2, 4, 5, 7, 9, 11].includes(planetHouses.venus)) support += 1;
  if ([3, 6, 8, 12].includes(planetHouses.saturn)) support += 1;
  if ([3, 6, 10, 11].includes(planetHouses.mars)) support += 1;
  const stars = Math.max(2, Math.min(5, Math.round(support * 0.8) + 1));

  const venusTone = PLANET_TONE.venus[categoryOf(planetHouses.venus)];
  const marsTone = PLANET_TONE.mars[categoryOf(planetHouses.mars)];
  const mercuryTone = PLANET_TONE.mercury[categoryOf(planetHouses.mercury)];
  const saturnTone = PLANET_TONE.saturn[categoryOf(planetHouses.saturn)];
  const jupiterTone = PLANET_TONE.jupiter[categoryOf(planetHouses.jupiter)];

  const nakshatra = NAKSHATRAS[moonNak];
  const dayLordInfo = PLANETS[dayLord];

  const summary = [
    `The Moon is moving through ${RASHIS[moonSign].english}, your ${ordinal(moonHouse)} house of ${ownHouse.theme}, in ${nakshatra.name} — the nakshatra of ${nakshatra.keywords}.`,
    TITHI_TONE[mood],
    `${dayLordInfo.name}, the lord of ${panchang.weekday.english}, is itself transiting your ${ordinal(dayLordHouse)} house, which is why ${categoryOf(dayLordHouse)} themes keep surfacing today.`,
  ].join(' ');

  const sections = [
    {
      key: 'focus',
      title: 'Today\'s focus',
      body: `${ownHouse.do.charAt(0).toUpperCase() + ownHouse.do.slice(1)}. With the Moon in your ${ordinal(moonHouse)} house, the day rewards ${ownHouse.theme} rather than grand gestures. Be careful of ${ownHouse.careful}. ${nakshatra.keywords.split(',')[0].charAt(0).toUpperCase() + nakshatra.keywords.split(',')[0].slice(1)} is the note ${nakshatra.name} keeps playing.`,
    },
    {
      key: 'career',
      title: 'Work & career',
      body: `${profile.career} Mercury ${mercuryTone}; Mars ${marsTone}.`,
    },
    {
      key: 'love',
      title: 'Love & relationships',
      body: `${profile.love} Venus ${venusTone}, and the Moon in your ${ordinal(moonHouse)} house makes ${ownHouse.theme.includes('partnership') ? 'the conversation itself the main event' : 'the emotional weather easy to read — for you and for them'}.`,
    },
    {
      key: 'money',
      title: 'Money',
      body: `Jupiter ${jupiterTone}. Saturn ${saturnTone}. Keep the plan simple: one number reviewed, one recurring cost questioned.`,
    },
    {
      key: 'wellbeing',
      title: 'Energy & wellbeing',
      body: `${profile.wellbeing} ${mood === 'release' || mood === 'dark' ? 'The waning Moon favours sleep and winding down early.' : 'The waxing Moon favours movement and daylight.'}`,
    },
  ];

  const colour = COLOUR_BY_WEEKDAY[panchang.weekday.index];
  const luckyNumber = ((dayHash + moonNak + sign) % 9) + 1;

  return {
    sign,
    dateISO: panchang.dateISO,
    headline: HEADLINES[dayHash % HEADLINES.length],
    summary,
    sections,
    stars,
    lucky: {
      number: luckyNumber,
      colour,
      hour: panchang.abhijit
        ? `${new Intl.DateTimeFormat('en-GB', { timeZone: place.timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(panchang.abhijit.start)}–${new Intl.DateTimeFormat('en-GB', { timeZone: place.timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(panchang.abhijit.end)}`
        : 'Sunrise–sunset midpoint',
    },
    moon: { sign: moonSign, nakshatra: moonNak, pada: padaOfLongitude(moonLongitude), house: moonHouse },
    tone: TITHI_TONE[mood],
    panchang,
  };
}

/**
 * Personalised note: the same day, measured from the user's own natal Moon
 * instead of their Sun sign.
 */
export function personalisedNote(chart: BirthChart, at: Date): { moonHouse: number; text: string } {
  const transitSign = rashiOfLongitude(planetLongitude('moon', at));
  const house = ((transitSign - chart.moonSign + 12) % 12) + 1;
  const nak = NAKSHATRAS[chart.birthNakshatra];
  return {
    moonHouse: house,
    text: `Your natal Moon is in ${RASHIS[chart.moonSign].english} in ${nak.name}. Today the Moon transits your ${ordinal(house)} house from it — ${HOUSE_THEME[house - 1].theme}.`,
  };
}

export function ordinal(n: number): string {
  const suffix = n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
  return `${n}${suffix}`;
}
