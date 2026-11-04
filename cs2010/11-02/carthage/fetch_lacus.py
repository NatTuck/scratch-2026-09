#!/usr/bin/env python3
"""Re-download just the LacusCurtius files (Polybius + Diodorus)."""

import os
import re
import time
import urllib.request

from bs4 import BeautifulSoup

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sources")
UA = "Mozilla/5.0 (X11; Linux x86_64) research-paper-downloader/1.0"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()


def html_to_text(raw):
    soup = BeautifulSoup(raw, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer", "noscript"]):
        tag.decompose()
    text = soup.get_text("\n")
    lines = [re.sub(r"[ \t\u00a0]+", " ", ln).strip() for ln in text.splitlines()]
    out, blank = [], 0
    for ln in lines:
        if not ln:
            blank += 1
            if blank > 1:
                continue
        else:
            blank = 0
        out.append(ln)
    return "\n".join(out).strip() + "\n"


def save(name, text, note):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        fh.write(f"SOURCE: {note}\n" + text)
    print(f"  -> {name} ({len(text):,} chars)")


def strip_thayer(text, marker):
    """Drop Thayer's per-page header, printed page numbers, and footer."""
    lines = text.splitlines()
    start = 0
    for i in range(min(120, len(lines)) - 1, -1, -1):
        if lines[i].strip() == marker:      # last one = end of header block
            start = i + 1
            break
    out = []
    for ln in lines[start:]:
        s = ln.strip()
        if re.fullmatch(r"p\d+[a-z]?", s):
            continue
        if re.fullmatch(r"(Up|UP|next:|previous:|Home|Help|mail:)", s):
            continue
        out.append(ln)
    txt = "\n".join(out)
    txt = txt.split("Page updated:")[0]
    txt = txt.split("Copyright")[0]
    return re.sub(r"\n{3,}", "\n\n", txt).strip() + "\n"


for n in (1, 2, 3):
    url = f"https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/{n}*.html"
    save(f"polybius_book{n}.txt",
         strip_thayer(html_to_text(get(url)), "The Histories"), url)
    time.sleep(1)

DIOD = {13: "ABCDE", 14: "ABCDEFG", 19: "ABCDEF", 20: "ABCDE"}
for book, parts in DIOD.items():
    joined = []
    for p in parts:
        url = ("https://penelope.uchicago.edu/Thayer/E/Roman/Texts/"
               f"Diodorus_Siculus/{book}{p}*.html")
        joined.append(strip_thayer(html_to_text(get(url)), "Library of History"))
        time.sleep(0.8)
    save(f"diodorus_book{book}.txt", "\n\n".join(joined),
         f"LacusCurtius, Diodorus Siculus book {book}")
