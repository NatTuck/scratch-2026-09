#!/usr/bin/env python3
"""Build citation-tagged editions of the LacusCurtius texts.

Each line is "<book>.<chapter>.<section>  <text>", keyed off the
<a class="sec" name="C.S"> anchors in Thayer's HTML. That makes every
sentence directly citable in the classical manner.
"""

import os
import re
import time
import urllib.request

from bs4 import BeautifulSoup, NavigableString, Tag

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "sources")
UA = "Mozilla/5.0 (X11; Linux x86_64) research-paper-downloader/1.0"
BASE = "https://penelope.uchicago.edu/Thayer/E/Roman/Texts"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def skipped(node):
    """True if the string sits inside navigation / page-number / footnote markup."""
    parent = node.parent
    while parent is not None and parent.name != "body":
        cls = parent.get("class") or []
        if parent.name == "a" and any(c in cls for c in ("sec", "chapter",
                                                         "note", "ref")):
            return True
        if parent.name == "span" and "pagenum" in cls:
            return True
        parent = parent.parent
    return False


def structure(raw, book):
    soup = BeautifulSoup(raw, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer", "noscript"]):
        tag.decompose()

    current = None
    buf = {}

    for node in soup.descendants:
        if isinstance(node, Tag):
            cls = node.get("class") or []
            if node.name == "a" and "sec" in cls:
                current = node.get("name")          # e.g. "1.5" or "13.2"
                buf.setdefault(current, [])
            continue
        if not isinstance(node, NavigableString) or current is None:
            continue
        if skipped(node):
            continue
        text = str(node)
        if text.strip():
            buf[current].append(text)

    out = []
    for sec, chunks in buf.items():
        body = re.sub(r"[\u00a0\s]+", " ", " ".join(chunks)).strip()
        body = re.sub(r"\s+([,.;:?!])", r"\1", body)
        body = re.sub(r"\s+('(?:s|t|re|ve|ll|d|m)\b)", r"\1", body)
        if not body:
            continue
        out.append(f"{book}.{sec}  {body}")

    # Each page ends with a "Page updated: ..." footer; drop it here so that
    # joining several parts does not truncate the book.
    return "\n".join(out).split("Page updated:")[0].splitlines()


def build(url, book, name):
    lines = structure(get(url), book)
    text = "\n".join(lines)
    path = os.path.join(SRC, name)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(f"SOURCE: {url}\n")
        fh.write("Format: <book>.<chapter>.<section>  <text>\n\n")
        fh.write(text.strip() + "\n")
    print(f"  -> {name} ({len(lines)} sections, {len(text):,} chars)")


for n in (1, 2, 3, 6):
    build(f"{BASE}/Polybius/{n}*.html", n, f"polybius_book{n}.txt")
    time.sleep(1)

DIOD = {13: "ABCDE", 14: "ABCDEFG", 19: "ABCDEF", 20: "ABCDE"}
for book, parts in DIOD.items():
    lines = []
    for p in parts:
        url = f"{BASE}/Diodorus_Siculus/{book}{p}*.html"
        lines.extend(structure(get(url), book))
        time.sleep(0.8)
    text = "\n".join(lines).split("Page updated:")[0]
    name = f"diodorus_book{book}.txt"
    with open(os.path.join(SRC, name), "w", encoding="utf-8") as fh:
        fh.write(f"SOURCE: {BASE}/Diodorus_Siculus (book {book}, parts {parts})\n")
        fh.write("Format: <book>.<chapter>.<section>  <text>\n\n")
        fh.write(text.strip() + "\n")
    print(f"  -> {name} ({len(lines)} sections, {len(text):,} chars)")
