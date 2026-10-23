"""
Builds src/app/_fonts/amiri-arabic-400-subset.woff2: the Amiri font cut down to the
Arabic characters the site actually shows (the bismillah in the hero and the two
calligraphy lines in Courses), so visitors download ~32 KB instead of ~106 KB.

Re-run after adding or changing any Arabic text, otherwise new letters fall back to
another font:

    pip install fonttools brotli
    python scripts/subset-arabic-font.py
"""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "src/components/courses.tsx", ROOT / "src/components/introduction.tsx"]
FULL = ROOT / "src/app/_fonts/amiri-arabic-400.woff2"
OUT = ROOT / "src/app/_fonts/amiri-arabic-400-subset.woff2"


def is_arabic(ch: str) -> bool:
    return "؀" <= ch <= "ۿ" or "ݐ" <= ch <= "ݿ" or "ﭐ" <= ch <= "﻿" or ch in "‌‍"


text = "".join(sorted({ch for path in SOURCES for ch in path.read_text(encoding="utf-8") if is_arabic(ch)})) + " "

options = subset.Options()
options.layout_features = ["*"]  # keep every shaping rule: joining forms, ligatures (Allah), mark positioning
options.flavor = "woff2"
options.name_IDs = ["*"]
options.notdef_outline = True

font = TTFont(FULL)
subsetter = subset.Subsetter(options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = "woff2"
font.save(OUT)
print(f"{len(text) - 1} characters, {FULL.stat().st_size // 1024} KB -> {OUT.stat().st_size // 1024} KB")
