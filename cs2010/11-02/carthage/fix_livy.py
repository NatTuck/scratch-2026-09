#!/usr/bin/env python3
"""Re-extract Livy Books 21-30 from the cached ToposText page with flowing text."""

import os
import re
import urllib.request

from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = "/tmp/t142.html"
URL = "https://topostext.org/work/142"
OUT = os.path.join(HERE, "sources", "livy_books21-30.txt")

if not os.path.exists(RAW):
    req = urllib.request.Request(URL, headers={"User-Agent": "research-paper/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(RAW, "wb") as fh:
        fh.write(r.read())

soup = BeautifulSoup(open(RAW, "rb").read(), "html.parser")
for tag in soup(["script", "style", "nav", "header", "footer", "noscript"]):
    tag.decompose()

# separator=" " keeps inline links from splitting words onto their own lines
text = soup.get_text(" ")
text = re.sub(r"[\u00a0\s]+", " ", text)

# Strip ToposText's inline metadata: "Event Date: -218 LA"
text = re.sub(r"Event Date: -?\d+\s+LA\s*", "", text)
# Strip stray "LA" / "Event Date" leftovers
text = re.sub(r"\bEvent Date: -?\d+\b", "", text)

# Repair spacing left by inline link tags: "Carthaginians ," / "Hannibal 's"
text = re.sub(r"\s+([,.;:?!])", r"\1", text)
text = re.sub(r"\s+('(?:s|t|re|ve|ll|d|m)\b)", r"\1", text)
text = re.sub(r"\s+(')", r"\1", text)

# One line per citation section (§ 21.1 ...)
text = re.sub(r"\s*(?=§ \d+\.)", "\n", text)

lines = text.splitlines()
start = next(i for i, ln in enumerate(lines) if ln.startswith("§ 21.1 "))
end = next(i for i, ln in enumerate(lines) if ln.startswith("§ 31.1 "))
body = "\n\n".join(ln.strip() for ln in lines[start:end] if ln.strip())

header = (
    "SOURCE: https://topostext.org/work/142\n"
    "Livy, The History of Rome, Books 21-30. Translated by Rev. Canon Roberts "
    "(1912), public domain.\n\n"
)
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(header + body + "\n")

print(f"{OUT}: {len(body):,} chars, {len(lines[start:end])} sections")
print(body[:600])
