#!/usr/bin/env python3
"""Clean the downloaded texts: strip site boilerplate, repair spacing, and
build tidy reading copies in ./sources/.

Usage:
    python3 clean_texts.py            # everything
    python3 clean_texts.py lacus      # only the LacusCurtius files
"""

import os
import re
import sys
import urllib.request

from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "sources")
UA = "Mozilla/5.0 (X11; Linux x86_64) research-paper-downloader/1.0"

LACUS_FILES = [
    "polybius_book1.txt", "polybius_book2.txt", "polybius_book3.txt",
    "diodorus_book13.txt", "diodorus_book14.txt",
    "diodorus_book19.txt", "diodorus_book20.txt",
]


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()


def flow(raw):
    """HTML -> single flowing string, with inline tags not splitting words."""
    soup = BeautifulSoup(raw, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer",
                     "noscript", "aside"]):
        tag.decompose()
    text = soup.get_text(" ")
    return re.sub(r"[\u00a0\s]+", " ", text).strip()


def tidy(text):
    text = re.sub(r"\s+([,.;:?!])", r"\1", text)
    text = re.sub(r"\s+('(?:s|t|re|ve|ll|d|m)\b)", r"\1", text)
    text = re.sub(r"\s+(')", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    text = re.sub(r"\s+([\]])", r"\1", text)
    return text


def write(name, text, note=""):
    path = os.path.join(SRC, name)
    with open(path, "w", encoding="utf-8") as fh:
        if note:
            fh.write(note.rstrip() + "\n\n")
        fh.write(text.strip() + "\n")
    print(f"  -> {name} ({len(text):,} chars)")


def lacus_clean(name):
    path = os.path.join(SRC, name)
    lines = open(path, encoding="utf-8").read().splitlines()
    start = 0
    for i, ln in enumerate(lines[:120]):
        if ln.strip() == "The Histories":       # Polybius header block
            start = i + 1
            break
    else:
        for i, ln in enumerate(lines):
            if re.match(r"^(Book|BOOK)\s+[IVXLC]+\b", ln.strip()) and i > 5:
                start = i
                break

    out = []
    for ln in lines[start:]:
        if re.fullmatch(r"p\d+[a-z]?", ln.strip()):     # printed page numbers
            continue
        if re.fullmatch(r"(Up|UP|next:|previous:|Home|Help|mail:)", ln.strip()):
            continue
        out.append(ln)
    txt = "\n".join(out)
    txt = re.split(r"(?m)^\s*Copyright", txt)[0]
    txt = re.sub(r"\n{3,}", "\n\n", txt).strip()
    write(name, txt)


def do_appian():
    print("[Appian] re-extracting 28 chapter pages")
    parts = []
    for n in range(1, 29):
        url = ("https://www.livius.org/sources/content/appian/"
               f"appian-the-punic-wars/appian-the-punic-wars-{n}/")
        soup = BeautifulSoup(get(url), "html.parser")
        art = soup.find("article") or soup.find("body")
        txt = re.sub(r"[\u00a0\s]+", " ", art.get_text(" ")).strip()
        # Drop Livius' repeated introduction, keep the ancient text only.
        marker = txt.find("notes by Jona Lendering.")
        if marker != -1:
            txt = txt[marker + len("notes by Jona Lendering."):]
        txt = txt.split("This page was created in")[0]
        parts.append(f"[{n}]\n{tidy(txt)}")

    write(
        "appian_punic_wars.txt", "\n\n".join(parts),
        "Appian of Alexandria, The Punic Wars (Roman History, Book 8.1).\n"
        "Translated by Horace White (Loeb Classical Library, 1912). Public domain.\n"
        "Source: https://www.livius.org/sources/content/appian/appian-the-punic-wars/\n"
        "Bracketed numbers mark the consecutive sections of Livius' edition.",
    )


def do_hanno():
    print("[Hanno] translation-only text (ToposText)")
    h = flow(get("https://topostext.org/work/247"))
    h = re.sub(r"Event Date: -?\d+\s+GR\s*", "", h)
    h = re.sub(r"\s*(?=§ \d+)", "\n\n", h)
    h = tidy(h)
    h = "§ 1 " + h.split("§ 1 ", 1)[-1]
    write(
        "hanno_periplus.txt", h,
        "The Periplus of Hanno, king of the Carthaginians.\n"
        "Translated by Wilfred H. Schoff (Commercial Museum, Philadelphia, 1912).\n"
        "Public domain. Source: https://topostext.org/work/247\n"
        "A Greek translation of a Carthaginian inscription set up in the "
        "temple of Kronos.",
    )

    print("[Hanno] commentary edition (Livius)")
    liv = flow(get("https://www.livius.org/articles/person/hanno-1-the-navigator/"
                   "hanno-1-the-navigator-2/"))
    write(
        "hanno_periplus_livius_commentary.txt", tidy(liv),
        "Hanno the Navigator: translation with interleaved commentary by Jona "
        "Lendering.\nSource: https://www.livius.org/articles/person/"
        "hanno-1-the-navigator/",
    )


def main():
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "appian"):
        do_appian()
    if what in ("all", "hanno"):
        do_hanno()
    if what in ("all", "lacus"):
        for f in LACUS_FILES:
            lacus_clean(f)
    print("Done.")


if __name__ == "__main__":
    main()
