# Carthage research paper

A three-page research paper on ancient Carthage, with a separate Works Cited
page, built from public-domain English translations of the primary sources
listed in `sources.md`.

## Deliverables

| File | What it is |
|---|---|
| `paper.pdf` | Formatted paper: 12 pt Times, double-spaced, 1-inch margins, page numbers. 3 pages of text + Works Cited. |
| `paper.docx` | Same paper in Word format (editable). |
| `paper.md` | Markdown source of the paper. |
| `sources/` | Full texts of every primary source, downloadable and citable. |
| `sources.md` | The original source list (its links were Google redirects). |

The paper argues that Carthage must be reconstructed from hostile Greek and
Roman sources, and that the *Periplus of Hanno* is the closest thing to a
Carthaginian voice that survives.

## Primary sources downloaded

All texts are public domain. Files are citation-tagged where the edition allows
it, in the form `<book>.<chapter>.<section>  <text>`.

| Author / work | Translation | Local file | Citation form used |
|---|---|---|---|
| Polybius, *Histories* 1–3, 6 | W. R. Paton, Loeb, 1922 | `sources/polybius_book{1,2,3,6}.txt` | `Polybius, Histories 1.10.5` |
| Livy, *Ab Urbe Condita* 21–30 | Rev. Canon Roberts, 1912 | `sources/livy_books21-30.txt` | `Livy, Ab Urbe Condita 21.4` |
| Appian, *Punic Wars* | Horace White, Loeb, 1912 | `sources/appian_punic_wars.txt` | `Appian, Punic Wars 132` |
| *Periplus of Hanno* | Wilfred H. Schoff, 1912 | `sources/hanno_periplus.txt` | `Hanno, Periplus 1` |
| Aristotle, *Politics* 2 | Benjamin Jowett | `sources/aristotle_politics_book2.txt` | `Aristotle, Politics 2.11` |
| Diodorus Siculus, *Library of History* 13–14, 19–20 | C. H. Oldfather / Russel M. Geer, Loeb | `sources/diodorus_book{13,14,19,20}.txt` | `Diodorus, Library of History 13.43.3` |

The Livius.org edition of Hanno, with Jona Lendering's commentary interleaved,
is kept separately as `sources/hanno_periplus_livius_commentary.txt`.

## Notes on the texts

- `sources.md` gave redirect URLs rather than direct links; each was resolved to
  its real destination before downloading.
- The MIT page for Livy now only points to Perseus, so the Livy text was taken
  from ToposText (the other Livy link on the list).
- Polybius and Diodorus come from LacusCurtius (Thayer). Their HTML carries
  explicit book/chapter/section anchors, which were used to produce the
  citation-tagged files; site navigation and printed page numbers were removed.
- ToposText supplied Livy 21–30 and the translation-only Hanno. Inline link tags
  split words across lines in a naive extraction, so the text was rebuilt from
  the HTML with flowing spacing and then reflowed.
- Appian's 28 chapter pages on Livius each repeat the same site introduction;
  it was stripped so the files contain only the ancient text.
- Appian's bracketed numbers `[1]`–`[136]` are the consecutive section numbers
  of the Livius edition and correspond to the traditional citation divisions.

## Rebuilding

```bash
python3 fetch_lacus.py       # Polybius + Diodorus, plain text
python3 structure_lacus.py   # citation-tagged Polybius + Diodorus (final)
python3 clean_texts.py       # Appian + Hanno
python3 fix_livy.py          # Livy 21-30 (downloads the page if not cached)
python3 build_paper.py       # paper.pdf
python3 make_docx.py         # paper.docx
```

`sources/` is already populated; the fetch scripts only need re-running if you
want fresh copies.

## Checking a quotation

```bash
python3 find_quote.py sources/polybius_book1.txt "reduced Libya to subjection"
```
