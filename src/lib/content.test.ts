import { describe, expect, it } from 'vitest';
import { buildBirthChart } from './astro';
import { CITIES, cityLabel, searchCities } from './cities';
import { dailyHoroscope } from './horoscope';
import { computeMatch } from './matching';
import { askSutra, classifyQuestion, SUGGESTED_QUESTIONS } from './sutra';

const DELHI = { latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata', place: 'New Delhi, India' };

const person = (name: string, date: string, time: string) => ({
  name,
  date,
  time,
  timeZone: 'Asia/Kolkata',
  latitude: 28.6139,
  longitude: 77.209,
  place: 'New Delhi, India',
});

const asha = buildBirthChart(person('Asha', '1992-08-14', '22:45'));
const rohan = buildBirthChart(person('Rohan', '1990-02-03', '05:10'));

describe('city list', () => {
  it('contains no duplicate place names', () => {
    const names = CITIES.map((city) => `${city.name}|${city.region}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it('stores coordinates inside the valid range and a usable time zone', () => {
    for (const city of CITIES) {
      expect(city.latitude).toBeGreaterThanOrEqual(-90);
      expect(city.latitude).toBeLessThanOrEqual(90);
      expect(city.longitude).toBeGreaterThanOrEqual(-180);
      expect(city.longitude).toBeLessThanOrEqual(180);
      // Throws RangeError for an invalid IANA zone, which fails the test.
      expect(() => new Intl.DateTimeFormat('en-GB', { timeZone: city.timeZone })).not.toThrow();
    }
  });

  it('ranks an exact name first', () => {
    expect(searchCities('Mumbai')[0].name).toBe('Mumbai');
    expect(searchCities('Tokyo')[0].name).toBe('Tokyo');
  });

  it('ignores case and surrounding whitespace', () => {
    expect(searchCities('   bEnGaLuRu  ')[0].name).toBe('Bengaluru');
  });

  it('matches on region and country as well as name', () => {
    const inKarnataka = searchCities('Karnataka');
    expect(inKarnataka.some((city) => city.name === 'Bengaluru')).toBe(true);

    const inNepal = searchCities('Nepal');
    expect(inNepal.length).toBeGreaterThan(0);
    expect(inNepal.every((city) => city.country === 'Nepal')).toBe(true);
  });

  it('puts a prefix match ahead of a mid-string match', () => {
    const results = searchCities('new');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase().startsWith('new')).toBe(true);
  });

  it('returns the head of the list for an empty query and honours the limit', () => {
    expect(searchCities('')).toHaveLength(8);
    expect(searchCities('', 3)).toHaveLength(3);
    expect(searchCities('a', 4)).toHaveLength(4);
  });

  it('returns nothing for a query that matches no place', () => {
    expect(searchCities('zzzzzz')).toEqual([]);
  });

  it('labels a city with its country', () => {
    expect(cityLabel(CITIES[0])).toBe(`${CITIES[0].name}, ${CITIES[0].country}`);
  });
});

describe('daily horoscope', () => {
  const date = new Date('2026-03-14T04:00:00Z');

  it('is deterministic for the same sign, day and place', () => {
    const first = dailyHoroscope(4, date, DELHI);
    const second = dailyHoroscope(4, date, DELHI);
    expect(second.headline).toBe(first.headline);
    expect(second.summary).toBe(first.summary);
    expect(second.stars).toBe(first.stars);
    expect(second.lucky.number).toBe(first.lucky.number);
  });

  it('gives different signs different readings', () => {
    const aries = dailyHoroscope(0, date, DELHI);
    const libra = dailyHoroscope(6, date, DELHI);
    expect(aries.summary).not.toBe(libra.summary);
    expect(aries.moon.house).not.toBe(libra.moon.house);
  });

  it('dates the reading for the given place, not for UTC', () => {
    // 19:00 UTC on 1 January is already 00:30 on 2 January in India.
    const reading = dailyHoroscope(2, new Date('2026-01-01T19:00:00Z'), DELHI);
    expect(reading.dateISO).toBe('2026-01-02');
  });

  it('keeps every score inside its advertised range', () => {
    for (let sign = 0; sign < 12; sign += 1) {
      const reading = dailyHoroscope(sign, date, DELHI);
      expect(reading.sign).toBe(sign);
      expect(reading.stars).toBeGreaterThanOrEqual(1);
      expect(reading.stars).toBeLessThanOrEqual(5);
      expect(reading.lucky.number).toBeGreaterThanOrEqual(1);
      expect(reading.lucky.number).toBeLessThanOrEqual(9);
      expect(reading.lucky.colour.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(reading.moon.house).toBeGreaterThanOrEqual(1);
      expect(reading.moon.house).toBeLessThanOrEqual(12);
      expect(reading.moon.pada).toBeGreaterThanOrEqual(1);
      expect(reading.moon.pada).toBeLessThanOrEqual(4);
    }
  });

  it('always produces headed sections with prose in them', () => {
    const reading = dailyHoroscope(9, date, DELHI);
    expect(reading.sections.length).toBeGreaterThanOrEqual(3);
    for (const section of reading.sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(40);
    }
    expect(reading.headline.length).toBeGreaterThan(0);
    expect(reading.tone.length).toBeGreaterThan(20);
  });

  it('carries the panchang for the same day', () => {
    const reading = dailyHoroscope(0, date, DELHI);
    expect(reading.panchang.dateISO).toBe(reading.dateISO);
    expect(reading.lucky.hour).toBeTruthy();
  });
});

describe('Sutra answers', () => {
  const now = new Date('2026-05-20T12:00:00Z');

  it('routes every suggested question to a specific intent', () => {
    const intents = SUGGESTED_QUESTIONS.map((question) => classifyQuestion(question));
    expect(intents).not.toContain('general');
  });

  it('classifies keyword families in the expected direction', () => {
    expect(classifyQuestion('Should I switch jobs this year?')).toBe('career');
    expect(classifyQuestion('When will I get married?')).toBe('marriage');
    expect(classifyQuestion('Why did my relationship end?')).toBe('love');
    expect(classifyQuestion('How do I save more money?')).toBe('money');
    expect(classifyQuestion('My sleep has been terrible')).toBe('health');
    expect(classifyQuestion('Should I do a PhD?')).toBe('education');
    expect(classifyQuestion('Is this a good year to move abroad?')).toBe('travel');
    expect(classifyQuestion('How can I help my parents?')).toBe('family');
    expect(classifyQuestion('What is my purpose?')).toBe('spiritual');
    expect(classifyQuestion('How do I work with the current Saturn transit?')).toBe('timing');
    expect(classifyQuestion('What is my current dasha?')).toBe('timing');
    expect(classifyQuestion('Tell me something')).toBe('general');
  });

  it('answers a chart question from the chart', () => {
    const answer = askSutra('Should I change jobs?', asha, now);
    expect(answer.mode).toBe('chart');
    expect(answer.intent).toBe('career');
    expect(answer.sections).toHaveLength(5);
    expect(answer.factors.length).toBeGreaterThan(0);
    expect(answer.followUps.length).toBeGreaterThan(0);
    for (const section of answer.sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(40);
    }
  });

  it('is deterministic and specific to the chart', () => {
    const first = askSutra('Should I change jobs?', asha, now);
    const again = askSutra('Should I change jobs?', asha, now);
    const other = askSutra('Should I change jobs?', rohan, now);
    expect(first.mode).toBe('chart');
    expect(again.sections[0].body).toBe(first.sections[0].body);
    expect(other.sections[0].body).not.toBe(first.sections[0].body);
  });

  it('has a dedicated answer for timing questions', () => {
    const answer = askSutra('How do I work with the current Saturn transit?', asha, now);
    expect(answer.mode).toBe('chart');
    expect(answer.intent).toBe('timing');
    expect(answer.title).toBe('Timing: dasha and transits');
    expect(answer.sections.map((section) => section.title)).toContain('Timing');
  });

  it('drops astrology entirely for a crisis message and gives real helplines', () => {
    const answer = askSutra('I want to kill myself', asha, now);
    expect(answer.mode).toBe('care');
    const text = answer.sections.map((section) => `${section.title} ${section.body}`).join(' ');
    expect(text).toContain('14416');
    expect(text).toContain('+91-9820466726');
    expect(text).not.toContain('mahadasha');
  });

  it('refuses to read a medical question as a diagnosis', () => {
    const answer = askSutra('Do I have cancer?', asha, now);
    expect(answer.mode).toBe('care');
    expect(answer.intent).toBe('general');
    expect(answer.title).toBe('Astrology cannot diagnose');
    expect(answer.factors).toEqual([]);
  });

  it('refuses legal questions and redirects to a lawyer', () => {
    const answer = askSutra('What are my chances in this court case?', asha, now);
    expect(answer.mode).toBe('care');
    expect(answer.sections[0].body.toLowerCase()).toContain('lawyer');
  });
});

describe('compatibility scoring', () => {
  const result = computeMatch(asha, rohan);

  it('scores eight kootas out of a maximum of 36', () => {
    expect(result.kootas).toHaveLength(8);
    expect(result.max).toBe(36);
    expect(result.kootas.reduce((sum, koota) => sum + koota.max, 0)).toBe(36);
    expect(['varna', 'vashya', 'tara', 'yoni', 'grahaMaitri', 'gana', 'bhakoot', 'nadi']).toEqual(
      result.kootas.map((koota) => koota.key),
    );
  });

  it('never awards more than a koota is worth', () => {
    for (const koota of result.kootas) {
      expect(koota.score).toBeGreaterThanOrEqual(0);
      expect(koota.score).toBeLessThanOrEqual(koota.max);
      expect(koota.detail.length).toBeGreaterThan(20);
    }
    expect(result.total).toBe(result.kootas.reduce((sum, koota) => sum + koota.score, 0));
    expect(result.total).toBeLessThanOrEqual(36);
  });

  it('reports a percentage and a verdict that agree with the total', () => {
    expect(result.percentage).toBeCloseTo((result.total / 36) * 100, 4);
    expect(['excellent', 'good', 'mixed', 'challenging']).toContain(result.verdict.tone);
    expect(result.verdict.text.length).toBeGreaterThan(40);
  });

  it('includes the supporting analysis the page renders', () => {
    expect(result.mangal.a).toBeTruthy();
    expect(result.mangal.b).toBeTruthy();
    expect(result.mangal.note.length).toBeGreaterThan(10);
    expect(result.extra.moonSignPair).toBeTruthy();
    expect(result.extra.seventhLord.a).toBeTruthy();
    expect(result.extra.venus.a).toBeTruthy();
    expect(result.extra.dashaNote.length).toBeGreaterThan(10);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.frictions)).toBe(true);
  });

  it('is deterministic and stable when the same charts are scored twice', () => {
    const again = computeMatch(asha, rohan);
    expect(again.total).toBe(result.total);
    expect(again.kootas.map((koota) => koota.score)).toEqual(result.kootas.map((koota) => koota.score));
  });

  it('scores a chart against itself consistently', () => {
    const self = computeMatch(asha, asha);
    expect(self.total).toBeLessThanOrEqual(36);
    expect(self.mangal.a.manglik).toBe(self.mangal.b.manglik);
    expect(self.mangal.a.name).toBe(self.mangal.b.name);
  });

  it('lets the caller decide which side is the groom', () => {
    const swapped = computeMatch(asha, rohan, { groomSide: 'a' });
    // Exactly the same pair, so the total cannot exceed the maximum.
    expect(swapped.max).toBe(36);
    expect(swapped.total).toBeLessThanOrEqual(36);
    // Varna is directional, so flipping the groom can only keep or lower it.
    const varnaDefault = result.kootas.find((koota) => koota.key === 'varna')!;
    const varnaSwapped = swapped.kootas.find((koota) => koota.key === 'varna')!;
    expect(varnaDefault.detail).not.toBe(varnaSwapped.detail);
  });
});
