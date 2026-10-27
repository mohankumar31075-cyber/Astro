# Pre-publish review

A full read-through of the application before publishing: every route rendered
and inspected, every module read, the charts rasterised and looked at, contrast
measured, and the build, tests and licence gate re-run. This file records what
was found and what was changed, so the review is auditable rather than implied.

Reviewed 27 October 2026 against commit `957a4fb`.

---

## Method

| What | How |
| --- | --- |
| Every route | Server-rendered each of the 21 routes and machine-audited the HTML for heading structure, unnamed buttons and links, unlabelled inputs and duplicate `id`s |
| Charts | Rasterised both chart styles with resvg and inspected them visually, including a synthetic seven-planet stellium to test the worst case |
| Colour | Computed WCAG 2.1 contrast ratios for every token against every surface |
| Code | Read `store.ts`, `packs.ts`, `time.ts`, `matching.ts`, `sutra.ts`, `Charts.tsx`, `Layout.tsx`, `ProfileForm.tsx` and every page |
| Gates | `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `npm run license:audit` |

---

## Defects found and fixed

### 1. Chart labels overflowed the frame (visual, high)

In the North Indian chart, the label cluster was centred on each house's
centroid. Houses 2, 3, 5, 6, 8, 9, 11 and 12 are triangles that reach the frame
edge, so house 2's sign label ("Tau") and house 12's ("Pis") sat **above the
chart border and were clipped**. A seven-planet stellium made it far worse:
the column ran diagonally across the neighbouring house.

Fixed by clamping the cluster into the drawable band and, for crowded houses,
laying the grahas out as a small two-column grid with reduced type — the way
printed panchang charts do it. Degrees are dropped when there is no room and
restored when there is.

Covered by a new test file, `src/components/Charts.test.tsx` (7 tests), which
asserts every label coordinate is inside the frame for an ordinary chart **and**
for a seven-planet stellium.

### 2. `--muted-dim` failed WCAG AA (accessibility, high)

`#6f7595` measured **4.42:1** on the page background, **4.10:1** on cards and
**3.85:1** on raised cards — below the 4.5:1 minimum for normal text, and it was
used for the smallest type in the app (`.tiny` at 0.72 rem, `.dim`, hints,
labels) in **78 places**. Changed to `#8a91b4`, which measures 6.45 / 5.98 /
5.34 and clears AA on every surface. Every other token already passed.

### 3. No visible keyboard focus (accessibility, high)

Only text inputs had a focus style. Tabbing through the sidebar, the chart-style
toggle, the glossary filters or any ghost button gave **no visible cue at all**.
Added a `:focus-visible` ring for every interactive element.

### 4. No skip link, and the onboarding page had no `<h1>` (accessibility, medium)

Keyboard users had to tab past ten nav links on every screen; added a
"Skip to content" link and a `#main-content` target. `/welcome` rendered no
`<h1>` at all, so the page had no top-level heading — `ProfileForm` now takes a
`headingLevel` prop and the onboarding form supplies `h1` (it stays `h2` inside
`/family`, where a `PageHeader` already provides one).

### 5. Unlabelled controls (accessibility, medium)

- Horoscope and Panchang date pickers relied on context, not an accessible name.
- Glossary search relied on its placeholder.
- The horoscope print button contained only an icon — **no accessible name**.
- **`/settings` "Import a backup" was unreachable by keyboard**: it was a
  `<label>` styled as a button wrapping a `display:none` file input. Labels are
  not focusable. Replaced with a real `<button>` that opens a hidden input, and
  fixed a second bug there — re-importing the same file did nothing because the
  input never reset.

### 6. No error boundary (robustness, medium)

One unexpected input anywhere would unmount the entire tree and leave a blank
page with no way back. Added `ErrorBoundary` around the router with a reload
action, a "clear local data and restart" action and a collapsed technical
detail.

### 7. Horoscope sign did not persist (correctness, medium)

`settings.lastHoroscopeSign` was only written when a profile was **saved**, and
it wrote the profile's *Sun* sign while the page reads it as the default. So
choosing a sign on `/horoscope` was forgotten on navigation, and adding a family
member silently changed what the reader saw on their own daily page. Now the
page records the sign the reader actually picks, and `saveProfile` only seeds
the default for the very first chart.

### 8. The glyph font shipped 382 kB to render two characters (performance, high)

`@fontsource/noto-sans-symbols-2` was imported whole to supply the astrological
marks — but measurement showed it covers only **☉ and ★** of the 22 glyphs the
app renders. The remaining twenty (♈–♓ ♀ ♂ ♃ ♄ ☿ ☽ ☊ ☋) were silently coming
from the *reader's system font*, which is why the charts were fragile on
Android and Linux.

Fixed properly: `scripts/subset-symbols.py` subsets both Noto symbol faces,
merges them and writes a **14.6 kB** WOFF2 carrying all 22 glyphs, renamed under
OFL §3 with the upstream copyright verified on every run. Net effect: **-368 kB**
of download, and the chart glyphs no longer depend on the OS.

### 9. `℞` could render as a tofu box (correctness, medium)

No bundled font carries U+211E; it was falling back to the system. Switched the
retrograde marker to `R`, which every font has and which ephemeris tables have
used for centuries, and documented the reason in the code.

### 10. One 592 kB JavaScript chunk (performance, medium)

Split into `react` (258 kB), `index` (284 kB) and `astronomy` (53 kB) so the
shell paints while the ephemeris downloads and each chunk caches separately.

### 11. Small ones

- Every route shared the tab title `AstroSutra`; added per-route document titles
  (including report and sign slugs).
- Duplicate import of `dasha` in `MatchPage.tsx`.
- `.chart-frame svg` used `overflow: visible`, so any future layout slip would
  bleed into the card rather than clip.
- Added `robots.txt` and Open Graph / Twitter metadata. Deliberately **no**
  `canonical` or `og:url`: a wrong one is worse than none, and the deployment
  domain is not decided yet.
- `:disabled` had no visual treatment.

---

## Results after the review

| Gate | Before | After |
| --- | --- | --- |
| `npx tsc --noEmit` | clean | clean |
| `npx vitest run` | 116 passing | **123 passing** (6 files) |
| `npm run build` | 592 kB JS, 2.7 MB `dist` | 3 chunks, **1.0 MB `dist`** |
| No preview-breaking warnings | yes | yes |
| `npm run license:audit` | pass | pass, with the derived font documented |
| Route audit | 5 warnings | **0** (the one remaining marker is an intentionally hidden input) |

---

## Deliberately not changed

- **No payment processor.** Adding a checkout with no server would collect card
  details for a payment that cannot be processed. The entitlement rules are real
  and tested; the purchase step is stubbed and labelled in the UI, the Terms and
  the README.
- **No page-view analytics.** It would contradict the privacy policy, which
  states there are no analytics.
- **No route-level code splitting.** The three-way vendor split captures most of
  the win; splitting 21 small screens would add flicker for little gain.
- **No raster images.** The app ships none, which is why there is no social
  preview image and why every icon is an inline path.
- **British spelling in prose, `color` in CSS.** Mixed spellings look sloppy, but
  this split is correct: prose is British ("licence", "colour"), CSS properties
  are American by definition, and the two `licence`/`license` uses in the Legal
  page are deliberate — the proper noun "MIT License" versus the common noun
  "licence".

---

## Known limitations, stated for the record

These are product decisions, not defects, and the app discloses them at
`/how-it-works`:

- Birth time is the dominant error source; the app marks a chart approximate
  when the time is unknown.
- Ayanamsa and house-system choices are stated, not argued.
- Compatibility is classical rule-following, not a verdict.
- Interpretation is culturally situated and offered for reflection.
