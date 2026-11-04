#!/usr/bin/env python3
"""Locate a phrase in a downloaded primary source and show surrounding numbering.

Usage: python3 find_quote.py <file> "<phrase>" [context_lines]
"""
import sys

path, phrase = sys.argv[1], sys.argv[2]
ctx = int(sys.argv[3]) if len(sys.argv) > 3 else 25

lines = open(path, encoding="utf-8").read().splitlines()
for i, ln in enumerate(lines):
    if phrase.lower() in ln.lower():
        lo, hi = max(0, i - ctx), min(len(lines), i + ctx)
        print(f"--- {path} line {i + 1} ---")
        for j in range(lo, hi):
            print(f"{j + 1:6}: {lines[j]}")
        print()
