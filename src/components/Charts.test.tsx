/**
 * Chart rendering tests.
 *
 * The birth chart is drawn as text inside an SVG viewBox of 0 0 100 100. A
 * label that lands outside that box is either clipped by the frame or bleeds
 * into a neighbouring house, and both look like a calculation error to a
 * reader. These tests assert the geometry, not the pixels: every label must
 * sit inside the frame, including for a stellium in the narrowest houses.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NorthChart, SouthChart } from './Charts';
import { buildBirthChart, type BirthChart } from '../lib/astro';
import { PLANETS } from '../lib/constants';

const sample = buildBirthChart({
  name: 'Test',
  date: '1992-08-14',
  time: '22:45',
  timeZone: 'Asia/Kolkata',
  latitude: 19.076,
  longitude: 72.8777,
  place: 'Mumbai, India',
});

function crowdInto(chart: BirthChart, house: number, planets: Array<keyof BirthChart['positions']>): BirthChart {
  const next = structuredClone(chart);
  for (const key of planets) {
    next.positions[key].house = house;
    next.houseOf[key] = house;
  }
  return next;
}

const textPositions = (html: string) =>
  [...html.matchAll(/<text[^>]*\bx="([\d.]+)"[^>]*\by="([\d.]+)"/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));

describe('north indian chart', () => {
  it('keeps every label inside the frame for an ordinary chart', () => {
    const html = renderToStaticMarkup(<NorthChart chart={sample} />);
    const positions = textPositions(html);
    expect(positions.length).toBeGreaterThan(12);
    for (const { x, y } of positions) {
      expect(x).toBeGreaterThan(2);
      expect(x).toBeLessThan(98);
      expect(y).toBeGreaterThan(1);
      expect(y).toBeLessThan(99);
    }
  });

  it('keeps a seven-planet stellium inside the frame', () => {
    const chart = crowdInto(sample, 2, ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    const html = renderToStaticMarkup(<NorthChart chart={chart} />);
    for (const { x, y } of textPositions(html)) {
      expect(y).toBeGreaterThan(1);
      expect(y).toBeLessThan(99);
      expect(x).toBeGreaterThan(2);
      expect(x).toBeLessThan(98);
    }
  });

  it('renders every graha exactly once', () => {
    const html = renderToStaticMarkup(<NorthChart chart={sample} />);
    for (const [key, planet] of Object.entries(PLANETS)) {
      if (!(key in sample.positions)) continue;
      const occurrences = html.split(`>${planet.symbol}<`).length - 1;
      // Each glyph appears once in the wheel; the legend lives in ChartPage.
      expect(occurrences).toBe(1);
    }
  });

  it('labels the ascendant house with the lagna marker', () => {
    const html = renderToStaticMarkup(<NorthChart chart={sample} />);
    expect(html).toContain('LAGNA');
    expect(html.match(/LAGNA/g)).toHaveLength(1);
  });
});

describe('south indian chart', () => {
  it('draws twelve cells and every label inside the frame', () => {
    const html = renderToStaticMarkup(<SouthChart chart={sample} />);
    const cells = html.match(/<rect[^>]*width="24"/g) ?? [];
    expect(cells).toHaveLength(12);
    for (const { x, y } of textPositions(html)) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(100);
    }
  });

  it('names the reader and the core placements in the centre panel', () => {
    const html = renderToStaticMarkup(<SouthChart chart={sample} />);
    expect(html).toContain('TEST');
    expect(html).toContain('Lagna ');
    expect(html).toContain('Moon ');
    expect(html).toContain('Sun ');
  });

  it('marks the lagna cell with a diagonal stroke', () => {
    const html = renderToStaticMarkup(<SouthChart chart={sample} />);
    expect(html).toContain('stroke="var(--gold)"');
  });
});
