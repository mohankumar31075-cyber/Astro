# Content licensing

AstroSutra ships two different kinds of material under two different licences.
This document is the authoritative map of which is which, plus the reasoning
behind the provenance claims the app makes in its own Legal → Licensing screen.

- **Code — MIT.** The TypeScript/TSX source, the stylesheet, the build
  configuration and the test suite. See [`../LICENSE`](../LICENSE).
- **Editorial text — CC BY 4.0.** The prose that the app displays to a reader:
  sign profiles, daily-reading templates, career/love/health/money/life report
  narratives, glossary bodies, the Q&A answer library and the methodology copy.
  These strings live in `.ts` files for practical reasons, but they are content,
  not software, and they are licensed as content.

Generated output — a chart, a report, a compatibility score computed from the
reader's own birth data — belongs to the reader. AstroSutra claims no licence
over it.

---

## 1. What CC BY 4.0 means here

You may share and adapt the editorial text, including commercially, provided
you:

1. **Attribute** the source. Credit "AstroSutra" and link to
   <https://github.com/mohankumar31075-cyber/Astro>.
2. **Link the licence.** Include a link to
   <https://creativecommons.org/licenses/by/4.0/>.
3. **Indicate changes.** If you modified the text, say that you did.
4. **Add no restrictions.** Do not apply legal terms or technological measures
   that prevent others from doing what the licence allows.

This is the Creative Commons-recommended TASL form — *Title, Author, Source,
Licence* — and a one-line attribution such as:

> "Career report text" from AstroSutra, © 2026 AstroSutra contributors, is
> licensed CC BY 4.0. Adapted from the original.

CC BY 4.0 grants no trademark or publicity rights (section 2(b) of the licence
code), so attribution does not license the AstroSutra name or mark. See §4.

## 2. What is *not* original to this project

The app unavoidably uses domain vocabulary. The following are **not** claimed as
original work and are not encumbered by any claim from this project:

- **Sanskrit and Indian-language terms** for planets, signs, nakshatras, houses,
  yogas, dashas, kootas and panchang elements: *graha*, *rashi*, *nakshatra*,
  *lagna*, *bhava*, *dasha*, *yoga*, *koota*, *tithi*, *nitya yoga*, *karana*,
  and the rest. These are traditional terminology in the public domain.
- **Classical Jyotisha concepts and rules.** Ashtakoot Guna Milan and its eight
  kootas, Vimshottari dasha periods, whole-sign houses, the 27-nakshatra cycle,
  the five limbs of panchang, the classical yogas named in `src/lib/yogas.ts`.
  These are described in centuries-old Sanskrit texts — principally
  *Brihat Parashara Hora Shastra*, *Brihat Jataka*, *Sarvartha Chintamani* and
  *Muhurta Chintamani* — all well outside copyright.
- **Astronomical facts and algorithms.** Planetary positions, the Lahiri /
  Chitrapaksha ayanamsa definition, sunrise/sunset geometry and nutation are
  mathematics and observational data, not protected expression. The
  implementation here is independently written on top of the MIT-licensed
  Astronomy Engine library.
- **Zodiac sign names** — Aries…Pisces, Mesha…Meena — and nakshatra names.
- **Factual statements about a convention** ("Lahiri ayanamsa is the Indian
  national standard"), which are not protectable as expression.

What *is* original here is the **wording**: how those concepts are explained,
sequenced, illustrated and hedged. That wording is what CC BY 4.0 covers.

## 3. Provenance and clean-room statement

AstroSutra is a **feature-comparable, independently implemented** Vedic astrology
companion. It is not a clone of any product's code, database, design or copy.

- No source code, minified bundle, API response, database dump, image, font,
  audio or written text was taken from Melooha or any other commercial
  astrology app.
- The feature set (kundli, personalised Q&A, daily horoscope, Ashtakoot
  compatibility, thematic reports, family profiles, free/paid packs) was
  derived from **publicly visible product descriptions** — app-store listings
  and marketing pages — which describe *what* a product does. A feature list is
  an idea, and ideas are not copyrightable; the specific expression of them is.
- All prose in this repository was written for this project. Reading templates
  are assembled from original fragments by deterministic code in
  `src/lib/horoscope.ts`, `src/lib/reports.ts` and `src/lib/vaani.ts`.
- The visual design — palette, type scale, layout and the SVG chart renderers in
  `src/components/Charts.tsx` — is original to this project, built from a
  CSS design system in `src/styles/app.css`. No third-party UI kit, icon pack or
  illustration was copied; every icon is a hand-written path in
  `src/components/Icons.tsx`.
- The name **AstroSutra**, its mark and its copy voice are original and were not
  derived from any existing product's brand.

The app states this in-product on **Legal → Licensing → "What was deliberately
not done"**, so a reader never has to take it on trust from a README alone.

## 4. Name, logo and trademark

The MIT and CC BY 4.0 grants cover copyright only. They do **not** grant rights
to the AstroSutra name or mark.

- A fork or derivative may keep the attribution required by CC BY 4.0, but must
  not present itself as *the* AstroSutra project, and must not imply endorsement
  by it.
- Practical guidance for derivatives: rename the product, replace
  `public/favicon.svg` and the `Brand` component in `src/components/Layout.tsx`,
  and keep the licence notices.
- AstroSutra does not use, and has no right to use, the marks of any third
  party — including Melooha — and the app must never be described as
  affiliated with, endorsed by, or a successor to any other product.

No trademark registration is claimed for AstroSutra; the statement above is
about avoiding confusion, not about asserting a registered right.

## 5. Third-party software and fonts

Every bundled dependency is permissively licensed; none is copyleft. The full
texts and copyright lines are reproduced in
[`../THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md), which is generated from
the real installed tree and also ships inside the app bundle (reachable at
`/legal/notices`).

| Component | Licence | Role |
| --- | --- | --- |
| astronomy-engine | MIT | Ephemeris: planetary positions, rise/set, sidereal time |
| react, react-dom, scheduler | MIT | UI runtime |
| react-router, react-router-dom, cookie, set-cookie-parser | MIT | Routing |
| @fontsource/cormorant-garamond, @fontsource/manrope, @fontsource/noto-sans-symbols-2 | OFL-1.1 | Bundled typefaces |
| vite, @vitejs/plugin-react, vitest | MIT | Build and test tooling (dev only) |
| typescript | Apache-2.0 | Compiler (dev only) |
| @types/react, @types/react-dom | MIT | Type declarations (dev only) |

**Fonts and the OFL.** Cormorant Garamond, Manrope and Noto Sans Symbols 2 are
distributed under the SIL Open Font License 1.1. The OFL permits bundling and
redistribution with software; it requires that the fonts not be sold on their
own and that Reserved Font Names not be reused for modified versions. This
project ships the fonts **unmodified** as published by Fontsource, and does not
sell them. The complete OFL text is reproduced in the notices.

`astronomy-engine`, `react-router` and `react-router-dom` publish no LICENSE file
inside their npm tarballs. Their MIT texts and copyright lines were taken from
each project's canonical repository licence file, are reproduced verbatim in the
notices, and the source URLs are listed there so the claim can be checked.

## 6. Fonts, icons and imagery

- **Typefaces**: the three OFL families above. Nothing else is downloaded at
  runtime; there are no calls to Google Fonts or any third-party CDN.
- **Icons**: all inline SVG path data, hand-authored for this project
  (`src/components/Icons.tsx`). No icon-font or icon-pack licence applies.
- **Illustrations**: the chart wheel, the nakshatra band and the compatibility
  ring are procedurally drawn SVG in `src/components/Charts.tsx`. There are no
  raster images, stock photos or AI-generated illustrations in the bundle.
- **Favicon**: original SVG in `public/favicon.svg`.

## 7. No user data leaves the device

The app is entirely client-side. Birth details, saved profiles and exported
backups stay in `localStorage` on the reader's device; there is no server, no
analytics, no third-party script and no network request other than loading the
app's own assets. This matters for licensing too: there is no third-party
data-processing agreement to disclose, and no user content is stored or
relicensed by this project.

## 8. Contributions

By contributing you agree that:

- code contributions are licensed under the MIT licence in `../LICENSE`;
- prose contributions are licensed under CC BY 4.0;
- you have the right to submit the material — no copy-paste from another
  astrology product, its blog, its store listing or its app screenshots.

Write in your own words. Terminology and concepts from classical texts are
fine; lifted modern sentences are not.

## 9. How this is enforced

```bash
npm run license:audit
```

`scripts/license-audit.mjs` walks the installed dependency tree and fails the
build when it finds:

- a licence outside the allow-list (MIT, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD,
  OFL-1.1, CC0-1.0, Unlicense, BlueOak-1.0.0, Python-2.0, MPL-2.0);
- a denied licence (GPL, AGPL, LGPL, SSPL, BUSL, CC-BY-NC, Commons Clause);
- an unknown or unreviewed licence;
- a **runtime** package that is not credited in `THIRD-PARTY-NOTICES.md`.

It writes a machine-readable inventory to
[`./license-report.json`](./license-report.json), separating production from
development dependencies, and warns about packages that ship no licence file.

To regenerate the notices after adding a dependency:

```bash
node scripts/generate-notices.mjs
npm run license:audit
```

The report and the notices are both committed, so a licence change is visible
in review.

## 10. Reporting a problem

If you believe something here is misattributed, or that material belonging to a
third party has ended up in the repository or the bundle, open an issue with the
file and the concern. Reports of this kind are treated as priority bugs, and the
offending material is removed first and discussed afterwards.

---

*Last reviewed: 26 October 2026. This document is informational and is not legal
advice; obtain qualified counsel before relying on it commercially.*
