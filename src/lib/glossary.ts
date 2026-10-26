/**
 * Astropedia — original explanations of the terms AstroSutra uses.
 * Classical terminology is public domain; every definition here is written for
 * this project and released under CC BY 4.0.
 */
export interface GlossaryEntry {
  term: string;
  sanskrit?: string;
  category: 'Foundations' | 'Chart' | 'Time' | 'Interpretation' | 'Compatibility';
  short: string;
  body: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Jyotisha',
    sanskrit: 'ज्योतिष',
    category: 'Foundations',
    short: 'The classical Indian system of astronomy and astrology.',
    body:
      'Jyotisha literally means "the science of light". It covers mathematical astronomy (calculating positions, eclipses and calendars) as well as interpretation. AstroSutra uses the former rigorously and treats the latter as a reflective practice rather than a predictive science.',
  },
  {
    term: 'Ayanamsa',
    sanskrit: 'अयनांश',
    category: 'Foundations',
    short: 'The offset between the tropical and sidereal zodiacs.',
    body:
      'Because Earth\'s axis precesses, the point where the Sun crosses the equator drifts about 50.3 arc-seconds per year relative to the fixed stars. The accumulated difference is the ayanamsa — about 24°13′ in the 2020s. AstroSutra uses the Lahiri (Chitrapaksha) value, the standard behind Indian panchangs.',
  },
  {
    term: 'Graha',
    sanskrit: 'ग्रह',
    category: 'Chart',
    short: 'A "planet" — nine in Vedic astrology, including the lunar nodes.',
    body:
      'The nine grahas are the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu. The Sun and Moon are treated as planets for chart purposes; Rahu and Ketu are the lunar nodes, mathematical points rather than physical bodies.',
  },
  {
    term: 'Rashi',
    sanskrit: 'राशि',
    category: 'Chart',
    short: 'A zodiac sign — twelve divisions of 30° each.',
    body:
      'Rashis are the sidereal signs. Each has a ruling planet, an element (fire, earth, air, water) and a modality (movable, fixed, dual). Your "Moon sign" (rashi) is the sign the Moon occupied at birth, which Vedic readings prioritise over the Sun sign.',
  },
  {
    term: 'Nakshatra',
    sanskrit: 'नक्षत्र',
    category: 'Chart',
    short: 'One of 27 lunar mansions of 13°20′ each.',
    body:
      'Nakshatras subdivide the zodiac by the Moon\'s daily motion. Each has a ruling planet, a deity, a symbolic animal (yoni), a temperament class (gana) and a constitutional channel (nadi) — which is why they carry so much weight in compatibility and dasha calculations.',
  },
  {
    term: 'Pada',
    sanskrit: 'पाद',
    category: 'Chart',
    short: 'A quarter of a nakshatra, 3°20′ wide.',
    body:
      'Each nakshatra has four padas, and each pada maps onto a Navamsha sign. Padas refine a placement considerably: two people with the Moon in the same nakshatra can experience it differently depending on the pada.',
  },
  {
    term: 'Lagna',
    sanskrit: 'लग्न',
    category: 'Chart',
    short: 'The ascendant — the sign rising on the eastern horizon at birth.',
    body:
      'The lagna sets the template of the chart: the first house is your body and identity, and every other house is counted from it. It is extremely sensitive to birth time — roughly one degree every four minutes, a whole sign every two hours.',
  },
  {
    term: 'Bhava',
    sanskrit: 'भाव',
    category: 'Chart',
    short: 'A house — one of twelve domains of life.',
    body:
      'Houses describe where planetary energy plays out: body, money, siblings, home, creativity, work, partnership, depth, meaning, career, gains and release. AstroSutra uses whole-sign houses, where each house is exactly one rashi counted from the lagna.',
  },
  {
    term: 'Yoga',
    sanskrit: 'योग',
    category: 'Interpretation',
    short: 'A named combination of planets with a recognised meaning.',
    body:
      'Yogas like Gajakesari or Hamsa describe specific arrangements of planets. Hundreds exist in the classical texts, with varying definitions. AstroSutra implements a small, well-attested set and states which rule it applied rather than implying certainty.',
  },
  {
    term: 'Dosha',
    sanskrit: 'दोष',
    category: 'Interpretation',
    short: 'A combination traditionally considered challenging.',
    body:
      'Doshas such as Mangal dosha or Kaal Sarpa are patterns associated with friction. AstroSutra presents them with their classical cancellations and avoids the fear-based framing that often surrounds them.',
  },
  {
    term: 'Vimshottari dasha',
    sanskrit: 'विंशोत्तरी दशा',
    category: 'Time',
    short: 'The 120-year planetary period system.',
    body:
      'The most widely used dasha system in Vedic astrology. It starts from the lord of the Moon\'s birth nakshatra and cycles through nine planetary periods totalling 120 years. Periods nest: mahadasha (major), antardasha (sub), pratyantardasha (sub-sub).',
  },
  {
    term: 'Mahadasha',
    sanskrit: 'महादशा',
    category: 'Time',
    short: 'The major planetary period, from 6 to 20 years.',
    body:
      'The mahadasha lord sets the theme of a chapter of life — the house it occupies and the sign it sits in colour the whole period. Within it, antardashas act as shorter chapters of nine sub-periods.',
  },
  {
    term: 'Antardasha',
    sanskrit: 'अंतर्दशा',
    category: 'Time',
    short: 'A sub-period inside a mahadasha.',
    body:
      'Each mahadasha divides into nine antardashas, weighted by the sub-lord\'s own dasha length. The combination of mahadasha and antardasha lords is the most common timing tool in practical Jyotisha.',
  },
  {
    term: 'Gochara',
    sanskrit: 'गोचर',
    category: 'Time',
    short: 'Transits — where the planets are now, relative to your chart.',
    body:
      'Transit readings compare current planetary positions to natal ones, usually measured from the natal Moon. They describe the weather rather than the terrain: the natal chart shows the structure, transits show the timing.',
  },
  {
    term: 'Sade Sati',
    sanskrit: 'साढ़े साती',
    category: 'Time',
    short: 'The 7½-year Saturn transit over the natal Moon.',
    body:
      'When Saturn transits the 12th, 1st and 2nd houses from your natal Moon, the sequence is called Sade Sati (rising, peak and setting phases). It is associated with consolidation rather than catastrophe, and the classical advice is patience and structure.',
  },
  {
    term: 'Tithi',
    sanskrit: 'तिथि',
    category: 'Time',
    short: 'A lunar day — the time for the Moon to gain 12° on the Sun.',
    body:
      'There are 30 tithis in a lunar month, split into the waxing (Shukla) and waning (Krishna) fortnights. Tithis form the backbone of the panchang and of festival dates; they do not align with 24-hour days, which is why their end times are given precisely.',
  },
  {
    term: 'Karana',
    sanskrit: 'करण',
    category: 'Time',
    short: 'Half a tithi — one of eleven ritual time units.',
    body:
      'Karanas divide the day into 60 half-tithi units and cycle through eleven names. Vishti (Bhadra) is the one most commonly avoided for auspicious beginnings.',
  },
  {
    term: 'Muhurta',
    sanskrit: 'मुहूर्त',
    category: 'Time',
    short: 'An auspicious window chosen for an important act.',
    body:
      'Traditionally 48 minutes (one thirtieth of a day), muhurtas are selected by combining panchang factors with the charts of the people involved. Abhijit, around local noon, is considered broadly supportive.',
  },
  {
    term: 'Panchang',
    sanskrit: 'पंचांग',
    category: 'Time',
    short: 'The almanac of five limbs: tithi, vara, nakshatra, yoga, karana.',
    body:
      'Panchang literally means "five limbs". It is the daily calendar used to choose timings, and every element in it is derived from the positions of the Sun and Moon for a specific place.',
  },
  {
    term: 'Rahu',
    sanskrit: 'राहु',
    category: 'Chart',
    short: 'The north lunar node — hunger, ambition and the unfamiliar.',
    body:
      'Rahu is not a physical planet but the point where the Moon\'s orbit crosses the ecliptic going north. It is associated with amplification, unconventional desire and rapid growth, and is always taken with Ketu, exactly 180° away.',
  },
  {
    term: 'Ketu',
    sanskrit: 'केतु',
    category: 'Chart',
    short: 'The south lunar node — detachment and past mastery.',
    body:
      'Ketu is the descending node. It often describes skill that arrives without obvious effort, alongside a tendency to withdraw from what others chase.',
  },
  {
    term: 'Retrograde',
    sanskrit: 'वक्री',
    category: 'Chart',
    short: 'Apparent backward motion as seen from Earth.',
    body:
      'A planet appears to reverse direction when Earth overtakes it in orbit. In interpretation, retrogradation is often read as internalised or revisited energy. The nodes are always retrograde by definition.',
  },
  {
    term: 'Combustion',
    sanskrit: 'अस्त',
    category: 'Chart',
    short: 'A planet too close to the Sun to be seen.',
    body:
      'When a planet sits within a few degrees of the Sun it is "combust" and its independent expression is considered weakened. Orbs differ by planet — AstroSutra uses the commonly cited values and notes the retrograde variants.',
  },
  {
    term: 'Guna Milan',
    sanskrit: 'गुण मिलान',
    category: 'Compatibility',
    short: 'The eight-factor compatibility score out of 36.',
    body:
      'Ashtakoot Guna Milan compares the Moon\'s nakshatra and rashi in two charts across eight kootas. Eighteen of 36 is the traditional threshold, though the breakdown matters far more than the total and traditions disagree on weighting.',
  },
  {
    term: 'Koota',
    sanskrit: 'कूट',
    category: 'Compatibility',
    short: 'One of the eight compatibility factors.',
    body:
      'The eight kootas are Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7) and Nadi (8), summing to 36. Each reads a different layer: temperament, magnetism, wellbeing, instinct, mental wavelength, nature, direction and constitution.',
  },
  {
    term: 'Nadi',
    sanskrit: 'नाड़ी',
    category: 'Compatibility',
    short: 'Constitutional channel: Adi, Madhya or Antya.',
    body:
      'Nadi is the highest-weighted koota (8 points). Same-nadi pairs score zero in the classical scheme, a rule with several recognised exceptions — for instance when the Moon signs differ.',
  },
  {
    term: 'Mangal dosha',
    sanskrit: 'मंगल दोष',
    category: 'Compatibility',
    short: 'Mars in the 1st, 4th, 7th, 8th or 12th house.',
    body:
      'Also called Kuja dosha. It is read as friction or intensity in partnership. Classical texts list cancellations: Mars in its own sign or exalted, Jupiter\'s aspect, and matching dosha in both charts, among others.',
  },
  {
    term: 'Gana',
    sanskrit: 'गण',
    category: 'Compatibility',
    short: 'Temperament class: Deva, Manushya or Rakshasa.',
    body:
      'Gana groups nakshatras by disposition. Same-gana pairs score six points; Deva–Manushya pairs five; Deva–Rakshasa one; Manushya–Rakshasa zero in the strict reading.',
  },
  {
    term: 'Yoni',
    sanskrit: 'योनि',
    category: 'Compatibility',
    short: 'The animal symbol of a nakshatra, used for physical compatibility.',
    body:
      'Each nakshatra has an animal yoni, and the classical table scores pairs from 0 (sworn enemies) to 4 (same animal). AstroSutra uses a conservative 4/2/0 scale where published tables disagree.',
  },
];

export const GLOSSARY_CATEGORIES = ['Foundations', 'Chart', 'Time', 'Interpretation', 'Compatibility'] as const;
