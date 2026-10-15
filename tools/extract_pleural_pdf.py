#!/usr/bin/env python3
"""Extract full text from Light's Pleural Diseases PDF with page markers."""
import sys, os

PDF = "/home/z/my-project/upload/lights pleural dz.pdf"
OUT = "/home/z/my-project/extracted/pleural_book.txt"

try:
    import fitz  # PyMuPDF
    doc = fitz.open(PDF)
    n = len(doc)
    print(f"PyMuPDF opened: {n} pages")
    with open(OUT, "w", encoding="utf-8") as f:
        for i in range(n):
            page = doc[i]
            txt = page.get_text("text")
            f.write(f"\n===== PAGE {i+1} =====\n")
            f.write(txt)
    print("done pymupdf")
    sys.exit(0)
except ImportError:
    print("PyMuPDF not available, trying pdfplumber")
except Exception as e:
    print(f"PyMuPDF failed: {e}; trying pdfplumber")

try:
    import pdfplumber
    with pdfplumber.open(PDF) as pdf:
        n = len(pdf.pages)
        print(f"pdfplumber opened: {n} pages")
        with open(OUT, "w", encoding="utf-8") as f:
            for i, page in enumerate(pdf.pages):
                txt = page.extract_text() or ""
                f.write(f"\n===== PAGE {i+1} =====\n")
                f.write(txt)
    print("done pdfplumber")
    sys.exit(0)
except Exception as e:
    print(f"pdfplumber failed: {e}")
    sys.exit(1)
