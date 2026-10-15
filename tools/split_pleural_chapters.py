#!/usr/bin/env python3
"""Split pleural_book.txt into chapter files based on book page = PDF page - 16."""
import re, os

SRC = "/home/z/my-project/extracted/pleural_book.txt"
OUTDIR = "/home/z/my-project/extracted/pleural-chapters"
os.makedirs(OUTDIR, exist_ok=True)

# chapter -> (book start page, book end page inclusive)
chapters = {
    "ch01-anatomy": (1, 7),
    "ch02-physiology": (8, 18),
    "ch03-phys-effects": (19, 30),
    "ch04-animal-models": (31, 51),
    "ch05-cytokines": (52, 63),
    "ch06-radiology": (64, 85),
    "ch07-clinical-tests": (86, 127),
    "ch08-approach": (128, 139),
    "ch09-transudates": (140, 152),
    "ch10-metastatic": (153, 188),
    "ch11-primary-tumors": (189, 208),
    "ch12-parapneumonic": (209, 246),
    "ch13-tuberculous": (247, 262),
    "ch14-fungal": (263, 270),
    "ch15-parasitic": (271, 276),
    "ch16-aids-viral": (277, 286),
    "ch17-PE": (287, 295),
    "ch18-GI": (296, 310),
    "ch19-heart": (311, 320),
    "ch20-OBGYN": (321, 328),
    "ch21-collagen": (329, 339),
    "ch22-drugs": (340, 347),
    "ch23-misc": (348, 362),
    "ch24-pneumothorax": (363, 404),
    "ch25-hemothorax": (405, 411),
    "ch26-chylothorax": (412, 430),
    "ch27-other": (431, 445),
    "ch28-thoracentesis": (446, 465),
    "ch29-chest-tubes": (466, 480),
    "ch30-thoracoscopy": (481, 490),
}

with open(SRC, encoding="utf-8") as f:
    raw = f.read()

# Split into pages
pages = {}
for m in re.finditer(r"===== PAGE (\d+) =====\n(.*?)(?==== PAGE \d+ =====|\Z)", raw, re.S):
    pages[int(m.group(1))] = m.group(2)

WATERMARKS = ["tahir99 - UnitedVRG", "vip.persianss.ir", "UnitedVRG"]

for name, (p0, p1) in chapters.items():
    out = []
    for bp in range(p0, p1 + 1):
        pdfp = bp + 16
        if pdfp in pages:
            txt = pages[pdfp]
            for w in WATERMARKS:
                txt = txt.replace(w + "\n", "").replace(w, "")
            out.append(f"\n--- book p.{bp} ---\n{txt.strip()}")
    body = "".join(out)
    body = re.sub(r"\n{3,}", "\n\n", body)
    with open(os.path.join(OUTDIR, name + ".txt"), "w", encoding="utf-8") as f:
        f.write(body)
    print(f"{name}: {len(body)} chars, book p.{p0}-{p1}")
