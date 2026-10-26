/**
 * Route smoke tests.
 *
 * Renders every screen with react-dom/server. This does not test pixel output;
 * it guarantees each route mounts, resolves its data and produces HTML without
 * throwing — including the chart, panchang and report generators.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { SAMPLE_DRAFT, saveProfile } from './lib/store';

const render = (path: string) =>
  renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

beforeAll(() => {
  saveProfile(SAMPLE_DRAFT);
});

const ROUTES: Array<[string, string[]]> = [
  ['/', ['AstroSutra', 'Free to use. Packs only if you want more.']],
  ['/welcome', ['Who is this chart for']],
  ['/how-it-works', ['How the numbers are made']],
  ['/legal/privacy', ['Privacy policy']],
  ['/legal/terms', ['Terms of use']],
  ['/legal/licensing', ['Licensing']],
  ['/legal/notices', ['Third-party notices']],
  ['/dashboard', ['Aarav']],
  ['/chart', ['Your birth chart']],
  ['/horoscope', ['Why this reading']],
  ['/horoscope/leo', ['Leo']],
  ['/ask', ['Ask Sutra', 'left today.']],
  ['/match', ['Compatibility']],
  ['/reports', ['Your reports']],
  ['/reports/career', ['The field you are built for']],
  ['/reports/love', ['What you bring to partnership']],
  ['/reports/health', ['Constitution']],
  ['/reports/money', ['What you accumulate']],
  ['/reports/life', ['The stage: your ascendant']],
  ['/panchang', ['Five limbs of the day']],
  ['/family', ['Your circle', 'on the free tier']],
  ['/settings', ['Reading preferences']],
  ['/learn', ['The vocabulary, explained']],
  ['/packs', ['Free forever, or packs that never expire', 'Free tier · 3 questions left today']],
  ['/not-a-real-page', ['This house is empty']],
];

describe('routes render', () => {
  for (const [path, expected] of ROUTES) {
    it(`renders ${path}`, () => {
      const html = render(path);
      expect(html.length).toBeGreaterThan(500);
      for (const needle of expected) expect(html).toContain(needle);
    });
  }
});
