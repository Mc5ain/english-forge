#!/usr/bin/env python3
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEMBERSHIP = ROOT / "data/source/xln-membership.tsv"
OUTPUT = ROOT / "data/source/xln-ecdict.json"
EXAM_TAGS = {
    "gk": "high",
    "cet4": "cet4",
    "cet6": "cet6",
    "ky": "kaoyan",
    "toefl": "toefl",
}
ALIASES = {
    "capital-driven": "capital driven",
    "cheat-proof": "cheat proof",
    "cyber-revolution": "cyber revolution",
    "emergency-room": "emergency room",
    "eye-liner": "eyeliner",
    "low-literacy": "low literacy",
    "on-file": "on file",
    "post-independence": "post independence",
    "rear-view": "rear view",
    "score-board": "scoreboard",
    "upper-scale": "upper scale",
}


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/build-xln-supplement.py <ecdict.csv>")

    membership = {}
    for line in MEMBERSHIP.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        word, books, units = (line.split("\t") + ["", ""])[:3]
        membership[word] = {
            "books": [value for value in books.split(",") if value],
            "units": [value for value in units.split(",") if value],
        }

    entries = {}
    lookup = {word: word for word in membership}
    for canonical, variant in ALIASES.items():
        if canonical in membership:
            lookup[variant] = canonical
    with open(sys.argv[1], encoding="utf-8", errors="replace", newline="") as source:
        for row in csv.DictReader(source):
            source_word = (row.get("word") or "").strip().lower()
            word = lookup.get(source_word)
            translation = (row.get("translation") or "").strip()
            if not word or word in entries or not translation:
                continue
            exam_tags = [
                EXAM_TAGS[tag]
                for tag in (row.get("tag") or "").split()
                if tag in EXAM_TAGS
            ]
            entries[word] = {
                "word": word,
                "phonetic": (row.get("phonetic") or "").strip(),
                "meaning": translation.replace("\\n", "; "),
                "exams": exam_tags,
                **membership[word],
            }

    payload = {
        "source": {
            "name": "ECDICT",
            "repository": "https://github.com/skywind3000/ECDICT",
            "license": "MIT",
        },
        "words": [entries[word] for word in sorted(entries)],
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {OUTPUT.relative_to(ROOT)}: {len(entries)} words")


if __name__ == "__main__":
    main()
