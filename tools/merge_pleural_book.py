#!/usr/bin/env python3
"""Merge native text + OCR pages into complete book; re-split into full chapters."""
import re, os

TXT = "/home/z/my-project/extracted/pleural_book.txt"
OCR = "/home/z/my-project/extracted/pleural_book_ocr.txt"
MERGED = "/home/z/my-project/extracted/pleural_full.txt"
OUTDIR = "/home/z/my-project/extracted/pleural-full-chapters"
os.makedirs(OUTDIR, exist_ok=True)

def parse_pages(path):
    d = {}
    for m in re.finditer(r"===== PAGE (\d+) =====\n(.*?)(?==== PAGE \d+ =====|\Z)", open(path, encoding="utf-8").read(), re.S):
        d[int(m.group(1))] = m.group(2)
    return d

txt = parse_pages(TXT)
ocr = parse_pages(OCR)
WATERMARKS = [r"tahir99\s*-?\s*UnitedVRG", r"vip\.persianss\.ir", r"UnitedVRG\s*", r"tahir99\s*-\s*United\s*VRG", r"tahir99", r"UnitedVRG\s*\.?", r"vip\.persianss\.ir"]
merged = {}
for p in sorted(set(txt) | set(ocr)):
    body = txt.get(p, "") if len(txt.get(p, "").strip()) > 80 else ocr.get(p, "")
    for w in WATERMARKS:
        body = re.sub(w, "", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    merged[p] = body

with open(MERGED, "w", encoding="utf-8") as f:
    for p in sorted(merged):
        f.write(f"\n===== PAGE {p} =====\n{merged[p]}\n")

# chapter map: book page = PDF page - 16
chapters = {
    "ch01-anatomy": (1, 7), "ch02-physiology": (8, 18), "ch03-phys-effects": (19, 30),
    "ch04-animal-models": (31, 51), "ch05-cytokines": (52, 63), "ch06-radiology": (64, 85),
    "ch07-clinical-tests": (86, 127), "ch08-approach": (128, 139), "ch09-transudates": (140, 152),
    "ch10-metastatic": (153, 188), "ch11-primary-tumors": (189, 208), "ch12-parapneumonic": (209, 246),
    "ch13-tuberculous": (247, 262), "ch14-fungal": (263, 270), "ch15-parasitic": (271, 276),
    "ch16-aids-viral": (277, 286), "ch17-PE": (287, 295), "ch18-GI": (296, 310),
    "ch19-heart": (311, 320), "ch20-OBGYN": (321, 328), "ch21-collagen": (329, 339),
    "ch22-drugs": (340, 347), "ch23-misc": (348, 362), "ch24-pneumothorax": (363, 404),
    "ch25-hemothorax": (405, 411), "ch26-chylothorax": (412, 430), "ch27-other": (431, 445),
    "ch28-thoracentesis": (446, 465), "ch29-chest-tubes": (466, 480), "ch30-thoracoscopy": (481, 490),
}
total = 0
for name, (p0, p1) in chapters.items():
    out = []
    for bp in range(p0, p1 + 1):
        pdfp = bp + 16
        if pdfp in merged:
            out.append(f"\n--- book p.{bp} ---\n{merged[pdfp]}")
    body = "".join(out)
    with open(os.path.join(OUTDIR, name + ".txt"), "w", encoding="utf-8") as f:
        f.write(body)
    total += len(body)
    print(f"{name}: {len(body)} chars")
print(f"TOTAL: {total} chars, merged {len(merged)} pages -> {MERGED}")
