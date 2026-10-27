#!/usr/bin/env python3
"""
Build the single webfont the astrology glyphs actually need.

Why this exists
---------------
The app renders about 30 astrological characters: the twelve rashi signs
(♈–♓), the nine grahas (☉ ☽ ♂ ☿ ♃ ♀ ♄ ☊ ☋) and a star. No system font has all
of them everywhere, so they have to be bundled — but both obvious packages are
poor value on their own:

  @fontsource/noto-sans-symbols      covers 11 of them, 57 kB
  @fontsource/noto-sans-symbols-2    covers 2 of them (☉ ★), 382 kB

Shipping both costs 439 kB for 13 glyphs. This script subsets each one to the
astro block and merges them into a single ~10 kB file.

Licensing
---------
Both sources are SIL Open Font License 1.1 (Noto Project Authors). OFL §3 says
a modified version must not use a Reserved Font Name if one is declared; the
Noto Project declares none, but the merged face is renamed to "AstroSutra
Glyphs" anyway so compliance does not depend on that reading. The original
copyright notices (name IDs 0 and 7) are preserved by merging, which is what
OFL §1 asks for, and THIRD-PARTY-NOTICES.md credits both upstream projects.

Usage
-----
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/subset-symbols.py

Run after changing the glyphs in src/lib/constants.ts; then re-run
`node scripts/generate-notices.mjs && npm run license:audit`.
"""

from __future__ import annotations

import os
import sys
import tempfile

from fontTools import merge, subset
from fontTools.ttLib import TTFont

# Everything in the Misc Symbols block the app can render: zodiac, planets,
# nodes, star. Latin punctuation (° ′ ≈ −) stays with Manrope.
# Whitespace is included so the font never has to lean on fallback for a space
# between two glyphs it does provide.
ZODIAC_AND_PLANETS = list(range(0x2600, 0x2700)) + [0x0020, 0x00A0]

SOURCES = [
    # (path, codepoints)
    (
        "node_modules/@fontsource/noto-sans-symbols/files/noto-sans-symbols-symbols-400-normal.woff2",
        ZODIAC_AND_PLANETS,
    ),
    # Symbols 2 is the only one of the two with the Sun ☉ and the star ★.
    (
        "node_modules/@fontsource/noto-sans-symbols-2/files/noto-sans-symbols-2-symbols-400-normal.woff2",
        [0x2609, 0x2605, 0x0020],
    ),
]

OUT = "src/assets/fonts/astrosutra-glyphs.woff2"
FAMILY = "AstroSutra Glyphs"

# Every character the charts, legend, planet table and horoscope can print.
REQUIRED = {
    0x2648: "Aries",
    0x2649: "Taurus",
    0x264A: "Gemini",
    0x264B: "Cancer",
    0x264C: "Leo",
    0x264D: "Virgo",
    0x264E: "Libra",
    0x264F: "Scorpio",
    0x2650: "Sagittarius",
    0x2651: "Capricorn",
    0x2652: "Aquarius",
    0x2653: "Pisces",
    0x2609: "Sun",
    0x263D: "Moon",
    0x2642: "Mars",
    0x263F: "Mercury",
    0x2643: "Jupiter",
    0x2640: "Venus",
    0x2644: "Saturn",
    0x260A: "Rahu",
    0x260B: "Ketu",
    0x2605: "star",
}


def subset_font(path: str, codepoints: list[int], out: str) -> None:
    options = subset.Options()
    options.flavor = None  # merge wants a plain sfnt
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.notdef_outline = True
    font = subset.load_font(path, options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    font.save(out)
    font.close()


def rename(font: TTFont, family: str) -> None:
    for record in font["name"].names:
        if record.nameID in (1, 4, 16):
            record.string = family
        elif record.nameID == 6:
            record.string = "AstroSutraGlyphs-Regular"
        elif record.nameID == 3:
            record.string = "AstroSutraGlyphs-Regular-1.0"


def main() -> int:
    missing_sources = [p for p, _ in SOURCES if not os.path.exists(p)]
    if missing_sources:
        print("Run `npm ci` first; missing:\n  " + "\n  ".join(missing_sources), file=sys.stderr)
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for index, (path, codepoints) in enumerate(SOURCES):
            part = os.path.join(tmp, f"part{index}.ttf")
            subset_font(path, codepoints, part)
            parts.append(part)

        merged = merge.Merger().merge(parts)
        rename(merged, FAMILY)

        # Re-encode as woff2, which is what the browser wants.
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        encoded = os.path.join(tmp, "out.woff2")
        merged.flavor = "woff2"
        merged.save(encoded)

        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        with open(encoded, "rb") as handle:
            data = handle.read()
        with open(OUT, "wb") as handle:
            handle.write(data)

    # Verify the result rather than trusting it.
    check = TTFont(OUT)
    cmap = check.getBestCmap()
    missing = [f"U+{cp:04X} {name}" for cp, name in REQUIRED.items() if cp not in cmap]
    copyright_notice = check["name"].getDebugName(0) or ""
    family_name = check["name"].getDebugName(1) or ""

    total_source = sum(os.path.getsize(p) for p, _ in SOURCES)
    print(f"wrote {OUT}: {len(data):,} bytes (sources {total_source:,} bytes)")
    print(f"family: {family_name}")
    print(f"copyright preserved: {copyright_notice[:70]}{'…' if len(copyright_notice) > 70 else ''}")
    print(f"glyphs: {len(cmap)}")

    if missing:
        print("MISSING REQUIRED GLYPHS: " + ", ".join(missing), file=sys.stderr)
        return 1
    if "Noto" not in copyright_notice:
        print("The upstream copyright notice was lost in the merge — OFL §1 requires it.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
