#!/usr/bin/env python3
"""Build paper.docx (Times New Roman 12pt, double-spaced, 1-inch margins,
page numbers, Works Cited on its own page with hanging indents)."""

import os
import re
import zipfile
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
MD = os.path.join(HERE, "paper.md")
OUT = os.path.join(HERE, "paper.docx")

# ---------------------------------------------------------------- parse md
lines = open(MD, encoding="utf-8").read().splitlines()

blocks = []          # (kind, text)
buf = []
kind = "body"
for ln in lines:
    if ln.startswith("# "):
        title = ln[2:].strip()
        continue
    if ln.startswith("## "):
        if buf:
            blocks.append((kind, " ".join(buf).strip()))
            buf = []
        heading = ln[3:].strip()
        blocks.append(("heading", heading))
        kind = "works" if heading == "Works Cited" else "body"
        continue
    if not ln.strip():
        if buf:
            blocks.append((kind, " ".join(buf).strip()))
            buf = []
        continue
    buf.append(ln.strip())
if buf:
    blocks.append((kind, " ".join(buf).strip()))

# smart quotes / dashes
def smart(t):
    t = t.replace("---", "\u2014").replace("--", "\u2013")
    t = re.sub(r'"([^"]*)"', "\u201c\\1\u201d", t)
    t = re.sub(r"(^|[\s(\[])'", "\\1\u2018", t)
    t = t.replace("'", "\u2019")
    return t


def runs(text, bold=False, italic=False):
    """Split on *...* into italic runs."""
    out = []
    for i, part in enumerate(re.split(r"\*(.+?)\*", text)):
        if not part:
            continue
        is_it = italic or (i % 2 == 1)
        rpr = ""
        if bold or is_it:
            rpr = "<w:rPr>" + ("<w:b/>" if bold else "") + \
                  ("<w:i/>" if is_it else "") + "</w:rPr>"
        out.append(
            f'<w:r>{rpr}<w:t xml:space="preserve">{escape(part)}</w:t></w:r>'
        )
    return "".join(out)


def para(text, style=None, align=None, page_break=False, hanging=False):
    text = smart(text)
    ppr = "<w:pPr>"
    if style:
        ppr += f'<w:pStyle w:val="{style}"/>'
    if page_break:
        ppr += "<w:pageBreakBefore/>"
    if align:
        ppr += f'<w:jc w:val="{align}"/>'
    if hanging:
        ppr += '<w:ind w:left="720" w:hanging="720"/>'
    ppr += "</w:pPr>"
    return f"<w:p>{ppr}{runs(text)}</w:p>"


body_xml = [para(title, style="Title", align="center")]
for kind, text in blocks:
    if kind == "heading":
        body_xml.append(para(text, style="Heading1",
                             page_break=(text == "Works Cited")))
    elif kind == "works":
        body_xml.append(para(text, style="BodyText", hanging=True))
    else:
        body_xml.append(para(text, style="BodyText"))

sect = (
    '<w:sectPr><w:footerReference w:type="default" r:id="rIdFooter"/>'
    '<w:pgSz w:w="12240" w:h="15840"/>'
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
    'w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>'
)

document = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    "<w:body>" + "".join(body_xml) + sect + "</w:body></w:document>"
)

styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults>
 <w:rPrDefault><w:rPr>
  <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"
            w:cs="Times New Roman" w:eastAsia="Times New Roman"/>
  <w:sz w:val="24"/><w:szCs w:val="24"/>
 </w:rPr></w:rPrDefault>
 <w:pPrDefault><w:pPr>
  <w:spacing w:after="0" w:line="480" w:lineRule="auto"/>
 </w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
 <w:name w:val="Normal"/><w:qFormat/>
</w:style>
<w:style w:type="paragraph" w:styleId="BodyText">
 <w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:qFormat/>
 <w:pPr><w:ind w:firstLine="720"/></w:pPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Title">
 <w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
 <w:pPr><w:jc w:val="center"/><w:spacing w:after="120" w:line="480"
   w:lineRule="auto"/></w:pPr>
 <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading1">
 <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/>
 <w:pPr><w:keepNext/><w:spacing w:before="120" w:after="0" w:line="480"
   w:lineRule="auto"/><w:ind w:firstLine="0"/></w:pPr>
 <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
</w:style>
</w:styles>"""

footer = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
    '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
    '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
    '<w:r><w:t>1</w:t></w:r>'
    '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'
)

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="xml" ContentType="application/xml"/>
 <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
 <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
 <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
 <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/document.xml", document)
    z.writestr("word/styles.xml", styles)
    z.writestr("word/footer1.xml", footer)
    z.writestr("word/_rels/document.xml.rels", doc_rels)

print("built", OUT)
