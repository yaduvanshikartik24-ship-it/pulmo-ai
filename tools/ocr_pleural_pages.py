#!/usr/bin/env python3
"""Resumable OCR of image-only pages of Light's Pleural Diseases PDF.
Saves each page result to extracted/ocr_pages/p<N>.txt as checkpoint."""
import fitz, subprocess, os, sys, re
from concurrent.futures import ProcessPoolExecutor

PDF = "/home/z/my-project/upload/lights pleural dz.pdf"
OUTDIR = "/home/z/my-project/extracted/ocr_pages"
TMP = "/home/z/my-project/extracted/ocr_tmp"
FINAL = "/home/z/my-project/extracted/pleural_book_ocr.txt"
os.makedirs(OUTDIR, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

raw = open("/home/z/my-project/extracted/pleural_book.txt", encoding="utf-8").read()
content = {}
for m in re.finditer(r"===== PAGE (\d+) =====\n(.*?)(?==== PAGE \d+ =====|\Z)", raw, re.S):
    body = re.sub(r"tahir99\s*-?\s*UnitedVRG|vip\.persianss\.ir|UnitedVRG", "", m.group(2))
    content[int(m.group(1))] = body.strip()
have = {p for p, t in content.items() if len(t) > 80}

doc = fitz.open(PDF)
n = len(doc)
missing = [p for p in range(1, n + 1) if p not in have and not os.path.exists(os.path.join(OUTDIR, f"p{p}.txt"))]
print(f"pages total {n}, have text {len(have)}, remaining to OCR {len(missing)}", flush=True)
if not missing:
    # assemble final file from checkpoints
    allp = [p for p in range(1, n + 1) if p not in have]
    with open(FINAL, "w", encoding="utf-8") as f:
        for pp in sorted(allp):
            fp = os.path.join(OUTDIR, f"p{pp}.txt")
            if os.path.exists(fp):
                f.write(f"\n===== PAGE {pp} =====\n" + open(fp, encoding="utf-8").read() + "\n")
    print("ASSEMBLED ->", FINAL, flush=True)
    sys.exit(0)

def ocr_page(pdfpage):
    out = os.path.join(OUTDIR, f"p{pdfpage}.txt")
    if os.path.exists(out):
        return pdfpage, None
    d = fitz.open(PDF)
    pg = d[pdfpage - 1]
    pix = pg.get_pixmap(dpi=220)
    img = os.path.join(TMP, f"p{pdfpage}.png")
    pix.save(img)
    d.close()
    try:
        r = subprocess.run(["tesseract", img, os.path.join(TMP, f"p{pdfpage}"), "--psm", "3", "-l", "eng"],
                           capture_output=True, text=True, timeout=120)
        txt = open(os.path.join(TMP, f"p{pdfpage}.txt"), encoding="utf-8", errors="replace").read()
    except Exception as e:
        txt = f"[OCR FAILED: {e}]"
    txt = re.sub(r"tahir99\s*-?\s*UnitedVRG|vip\.persianss\.ir|UnitedVRG", "", txt)
    txt = re.sub(r"\n{3,}", "\n\n", txt).strip()
    with open(out, "w", encoding="utf-8") as f:
        f.write(txt)
    for ext in (".png", ".txt"):
        try: os.remove(os.path.join(TMP, f"p{pdfpage}{ext}"))
        except OSError: pass
    return pdfpage, len(txt)

done = 0
with ProcessPoolExecutor(max_workers=6) as ex:
    for pp, ln in ex.map(ocr_page, missing):
        done += 1
        if done % 20 == 0:
            print(f"  {done}/{len(missing)} done", flush=True)
print(f"completed {done} pages this run", flush=True)
