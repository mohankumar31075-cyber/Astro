# AstroSutra

**A Vedic astrology companion that runs entirely in your browser.** Real
astronomy, honest interpretation, no accounts, no tracking, no server.

AstroSutra computes a sidereal birth chart from your birth details, then reads
it back to you: a daily horoscope grounded in today's actual Moon, a
personalised question-and-answer companion, an Ashtakoot compatibility score,
five thematic reports, today's panchang, and profiles for the people in your
family.

It is an original implementation, not a clone: no code, copy, artwork or data
from any commercial astrology app is used. See
[Licensing](#licensing) and [Clean-room note](#clean-room-note).

---

## What it does

| | |
| --- | --- |
| **Kundli / birth chart** | Sidereal positions for the nine grahas plus the ascendant, whole-sign houses, nakshatra and pada, dignity, Navamsa, and a hand-drawn North- or South-Indian chart wheel. |
| **Daily horoscope** | Twelve sign readings that use the real Moon's sign and house, the current tithi, and the day's panchang — not a static paragraph per sign. |
| **Ask Vaani** | A deterministic reading engine that answers questions from *your* chart: dasha, house lords, occupants, transits and Sade Sati. Refuses medical, legal and crisis questions and hands off to real help. |
| **Compatibility** | Ashtakoot Guna Milan — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi — out of 36, plus Mangal dosha, the seventh lord and Venus. |
| **Reports** | Career, love, health, money and life guidance, each assembled from the chart's actual factors and printable. |
| **Panchang** | Tithi, nakshatra, yoga, karana, weekday, sunrise/sunset, moonrise/moonset, Rahu kaal, Yamaganda, Gulika and Abhijit muhurta for any date and place. |
| **Family profiles** | Keep charts for the people you care about, switch between them instantly. |
| **Astropedia** | 28 glossary entries across foundations, chart, time, interpretation and compatibility — searchable. |
| **Your data, your device** | JSON export/import, one-click erase, no network calls at runtime. |

## Screens

| Route | What it is |
| --- | --- |
| `/` | Landing page |
| `/welcome` | Onboarding: birth details, place search, sample chart |
| `/dashboard` | Today at a glance: chart summary, dasha, transits, panchang |
| `/chart` | Full kundli with the chart wheel |
| `/horoscope`, `/horoscope/:slug` | Daily horoscope for any sign |
| `/packs` | Free tier, packs, and the current entitlements |
| `/match` | Compatibility between two saved profiles |
| `/ask` | Ask Vaani |
| `/panchang` | Panchang and muhurta for a date |
| `/reports`, `/reports/:slug` | Reports index and individual reports |
| `/family` | Saved profiles |
| `/settings` | Chart style, panchang city, export/import/erase |
| `/learn` | Astropedia |
| `/how-it-works` | Methodology, conventions and validation |
| `/legal/:slug` | Privacy, terms, licensing, third-party notices |

## Quick start

Requires **Node 22.12+** (Vite 8 and Vitest 5 both need it).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build          # tsc -b && vite build  → dist/
npm run preview        # serve the production build
npm run typecheck      # tsc --noEmit
npm run test           # 116 unit, engine, entitlement and route tests (vitest)
npm run test:watch     # during development
npm run license:audit  # dependency licence gate (see below)
```

The dev server binds to `0.0.0.0:5173`. There is no backend and no environment
file: everything the app needs is in `localStorage`.

## How the astrology is computed

Every number in the app comes from code in `src/lib/`, not from a lookup table.

| Decision | Choice |
| --- | --- |
| Ephemeris | [Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1.19 (MIT), `e_tilt`/`geo` vectors — sub-arcminute for the Sun and Moon |
| Zodiac | Sidereal, Lahiri / Chitrapaksha ayanamsa |
| Ayanamsa model | J2000 constant 23.853222° plus the IAU-2006 style precession polynomial; ~50.29″/yr, matching published Lahiri values for 1900–2100 |
| Houses | Whole-sign (rashi = bhava), so the ascendant's sign is the first house |
| Node | Mean node (Rahu), Ketu opposite |
| Dasha | Vimshottari, 365.2425-day years, three levels deep |
| Panchang | Sunrise-to-sunrise day, tithi from the Moon–Sun elongation |
| Compatibility | Ashtakoot Guna Milan, 36 points |
| Time zones | IANA zones via `Intl`, historical offsets included |

Conventions, the validation checks and the stated limitations are all spelled
out in-app at `/how-it-works`, and the engine's assumptions are in the module
headers.

**What the engine is not.** Vaani is a deterministic rules engine — a very
careful one — not a language model and not a psychic. It reads the chart it is
given and says so. It refuses questions about diagnosis, legal outcomes and
self-harm, and routes crisis messages to Tele-MANAS (14416) and AASRA
(+91-9820466726). Nothing here is medical, legal or financial advice.

## Privacy

- No account, no email, no analytics, no cookies, no third-party scripts.
- No network request after the app loads — the fonts are bundled, not fetched
  from a CDN.
- Birth data lives in `localStorage` under `astrosutra.data.v1`, is readable
  only on this device, and can be exported as JSON or erased at any time from
  **Settings**.
- Because there is no server, deleting your browser storage really does delete
  your data. Export first if you want to keep it.

## Plans: free tier and packs

AstroSutra uses the pack model common to astrology apps — a generous free tier,
then one-off purchases instead of a subscription. The rules are real and
enforced by the UI and by `src/lib/packs.ts`:

| | Free | With packs |
| --- | --- | --- |
| Birth chart, dasha, panchang, horoscope | Included | Included |
| Saved profiles | 1 | 8 (family pack) |
| Vaani questions | 3 per day | +50, never expiring (question pack) |
| Reports | First 2 sections | Every section (report pack) |
| Compatibility, export, erase | Included | Included |

**This build has no payment processor connected.** Activating a pack is a local,
reversible demo: no card is requested, nothing is charged, and there is no
server to charge it on. The entitlement state lives in the same `localStorage`
record as your charts and resets with **Settings → Erase**. In a hosted
deployment, activation would be verified against a payment provider's webhook
and the entitlement would live server-side; that is the one piece deliberately
left out of the open-source build, and every upgrade screen says so.

## Testing

116 tests across five files, run with Vitest:

| File | What it covers |
| --- | --- |
| `src/lib/astro.test.ts` (15) | Time zones, ayanamsa, ascendant, positions, navamsa, house assignment |
| `src/lib/vedic.test.ts` (24) | Dasha tree, panchang against published values, yogas, Ashtakoot, transits, Sade Sati |
| `src/lib/content.test.ts` (30) | City search, daily horoscope, Vaani intent routing and safety refusals, compatibility invariants |
| `src/lib/packs.test.ts` (22) | Free-tier limits, daily rollover, question spending, pack activation, entitlements |
| `src/app.smoke.test.tsx` (25) | Server-renders every route and asserts the expected content appears |

```bash
npm run test
```

The panchang tests are pinned to published ephemeris values (for example the
8 April 2024 solar eclipse, where the Moon sat in Revati at the eclipse
instant), so a regression in the astronomy fails the build.

## Project structure

```
src/
  lib/            astronomy and domain logic — no React, fully unit-tested
    ayanamsa.ts   Lahiri ayanamsa model
    time.ts       IANA time zones ↔ UTC, Julian day
    astro.ts      charts: positions, ascendant, houses, Navamsa
    dasha.ts      Vimshottari dasha tree
    panchang.ts   tithi, nakshatra, yoga, karana, muhurta windows
    transits.ts   current transits and Sade Sati
    yogas.ts      classical yoga detection
    matching.ts   Ashtakoot Guna Milan
    horoscope.ts  sign profiles and the daily reading engine
    vaani.ts      question classification and chart-based answers
    reports.ts    report narratives
    glossary.ts   Astropedia entries
    packs.ts      free-tier limits and pack entitlements
    cities.ts     offline place list
    store.ts      localStorage state, export/import
  components/     Layout, icons, UI primitives, SVG charts
  pages/          one file per route
  styles/         the design system (CSS custom properties, no framework)
scripts/          licence audit and notices generator
docs/             licence report and content-licensing policy
```

## Licensing

AstroSutra is **MIT licensed** — see [`LICENSE`](LICENSE). In short:

| Material | Licence |
| --- | --- |
| Source code, styles, build config, tests | MIT |
| Editorial prose (readings, profiles, reports, glossary, methodology) | CC BY 4.0 |
| Name and logo | Project identifiers — no trademark rights granted |
| Third-party libraries and fonts | Their own permissive licences, reproduced in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) |

The full policy — including the CC BY 4.0 attribution format, the clean-room
statement, and what happens with forks — is in
[`docs/CONTENT-LICENSING.md`](docs/CONTENT-LICENSING.md). The third-party notices
are also rendered in-app at `/legal/notices`.

**Every dependency is permissively licensed; there is no copyleft in the tree.**
That claim is enforced, not asserted:

```bash
npm run license:audit
```

The audit walks the installed tree, fails on any licence outside the approved
allow-list (or on any GPL/AGPL/LGPL/SSPL/BUSL/CC-BY-NC licence), fails when a
runtime package is missing from the notices, and writes a machine-readable
inventory to [`docs/license-report.json`](docs/license-report.json). CI should
run it after `npm ci`.

## Clean-room note

AstroSutra is a **feature-comparable, independently implemented** product in the
same category as Melooha. It is not a fork, a copy, or a reskin.

- No Melooha code, bundle, copy, artwork, database, screenshot or API response
  was used.
- The feature set was derived from publicly visible product descriptions — what
  the product *does*, which is an idea. How it is expressed here is original.
- All prose was written for this project. All icons are hand-authored SVG paths.
  The visual design is original.
- The name, logo and voice are original. AstroSutra is **not affiliated with,
  endorsed by, or connected to** Melooha, Astroverse Technologies Pvt. Ltd., or
  any other astrology product.
- Traditional Jyotisha terms and classical rules are public domain; the modern
  explanations are new.

## Limitations worth knowing

- **Birth time matters.** A four-minute error moves the ascendant by about a
  degree. Without a birth time the app offers a solar-chart approximation and
  says so.
- **Ayanamsa choice is a choice.** Lahiri is the Indian national standard; other
  schools differ by up to a degree, which can move a planet across a sign
  boundary.
- **Time zones before 1970** rely on the browser's IANA database, which is good
  but not perfect for historical Indian local time.
- **Compatibility is tradition, not truth.** Ashtakoot scores 36 points of
  classical rule-following. They are not a verdict on a relationship.
- **No checkout.** The pack limits are real, but activation is local and free:
  there is no payment provider, no account and no subscription anywhere in the
  code.

## Contributing

Issues and pull requests are welcome. Before opening one:

```bash
npm run typecheck && npm run test && npm run license:audit
```

Write prose in your own words — terminology and classical rules are fine,
modern sentences lifted from another product are not. By contributing you agree
to licence code under MIT and prose under CC BY 4.0.

*Astrology is offered here for reflection, not prediction. It is not a
substitute for medical, legal, financial or mental-health care.*
