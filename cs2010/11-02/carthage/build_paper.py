#!/usr/bin/env python3
"""Build paper.pdf from paper.md with academic formatting:
12pt Times, double spacing, 1-inch margins, page numbers, Works Cited on a new page."""

import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
MD = os.path.join(HERE, "paper.md")
TEX = os.path.join(HERE, "paper.tex")

raw = subprocess.run(
    ["pandoc", MD, "-f", "markdown-auto_identifiers", "-t", "latex",
    "--top-level-division=section"],
    capture_output=True, text=True, check=True,
).stdout

# Split title (first \section) from the body.
m = re.match(r"\\section\{(.+?)\}\s*", raw, re.S)
title = m.group(1).replace("\\", "")
body = raw[m.end():]

# New page before Works Cited, and hanging indents for each entry.
body = body.replace("\\subsection{Works Cited}", "\\newpage\n\\section*{Works Cited}")
head, _, entries = body.partition("\\section*{Works Cited}")
blocks = [b.strip() for b in entries.strip().split("\n\n") if b.strip()]
entries = "\n\n".join(
    "\\noindent\\hangindent=0.5in\\hangafter=1 " + b for b in blocks
)
body = head + "\\section*{Works Cited}\n\n" + entries

preamble = r"""\documentclass[12pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{mathptmx}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{setspace}
\usepackage{microtype}
\usepackage{fancyhdr}
\usepackage[hidelinks]{hyperref}
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\doublespacing
\setcounter{secnumdepth}{0}
\setlength{\parindent}{0.5in}
\setlength{\parskip}{0pt}
\setlength{\emergencystretch}{2em}
\begin{document}
\begin{center}
{\large\bfseries """ + title + r"""}
\end{center}
\vspace{1em}
"""

doc = preamble + body + "\n\\end{document}\n"
with open(TEX, "w", encoding="utf-8") as fh:
    fh.write(doc)

for _ in range(2):
    r = subprocess.run(
        ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", TEX],
        cwd=HERE, capture_output=True, text=True,
    )
    if r.returncode != 0:
        print(r.stdout[-3000:])
        raise SystemExit("pdflatex failed")

print("built", os.path.join(HERE, "paper.pdf"))
