#!/usr/bin/env python3
"""
持ち手の底より下に残る白い帯を除去する。

Algorithm
---------
- 固定 boundary = row 876（FLOOR_START_ROW=877 の1行前 = ハンドル最終行）
- cols 445–578（持ち手範囲のみ）
- boundary + 1 以降の行で、明るさ >= 0.85 かつ 彩度 <= 0.08 のピクセルを削除
  - dist == 1（row 877）: alpha *= 0.5（ふちギザギザ防止フェード）
  - dist >= 2（row 878 以降）: alpha = 0
"""

import os, shutil
import numpy as np
from PIL import Image

REPO_ROOT   = os.path.join(os.path.dirname(__file__), '..')
PROC_PATH   = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty.png')
BACKUP_PATH = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty_before_bottomfix.png')
OUTPUT_PATH = PROC_PATH

HANDLE_LEFT  = 445
HANDLE_RIGHT = 578
BOUNDARY_ROW = 876   # 最終ハンドル行（floor start = 877 の1行前）

BRIGHT_MIN = 0.85    # 白い帯ピクセルの最低明るさ
SAT_MAX    = 0.08    # 白い帯ピクセルの最大彩度


def fix_bottom_white(proc_path, output_path):
    img = Image.open(proc_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)

    rgb   = arr[:, :, :3] / 255.0
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    with np.errstate(invalid='ignore', divide='ignore'):
        sat = np.where(max_c > 0, (max_c - min_c) / max_c, 0.0)
    bright = max_c

    total_faded   = 0
    total_removed = 0

    for c in range(HANDLE_LEFT, HANDLE_RIGHT + 1):
        for row in range(BOUNDARY_ROW + 1, arr.shape[0]):
            a = arr[row, c, 3]
            if a <= 0:
                continue
            b = bright[row, c]
            s = sat[row, c]
            if b >= BRIGHT_MIN and s <= SAT_MAX:
                dist = row - BOUNDARY_ROW
                if dist == 1:
                    arr[row, c, 3] = a * 0.5
                    total_faded += 1
                else:
                    arr[row, c, 3] = 0.0
                    total_removed += 1

    result = Image.fromarray(arr.astype(np.uint8))
    result.save(output_path, optimize=False)
    print(f"Saved  → {output_path}")
    print(f"  faded  (dist=1): {total_faded} px")
    print(f"  removed (dist≥2): {total_removed} px")
    return arr


def make_preview(output_path, preview_path):
    """3-panel: white / light-pink / dark, bottom crop rows 700-1024."""
    img  = Image.open(output_path).convert('RGBA')
    crop = img.crop((250, 700, 780, 1024))
    cw, ch = crop.size
    bgs = [(255, 255, 255), (255, 247, 250), (51, 51, 51)]
    gap = 10
    out = Image.new('RGB', (cw * 3 + gap * 2, ch), (200, 200, 200))
    for i, bg in enumerate(bgs):
        base = Image.new('RGBA', (cw, ch), bg + (255,))
        comp = Image.alpha_composite(base, crop)
        out.paste(comp.convert('RGB'), (i * (cw + gap), 0))
    out.save(preview_path)
    print(f"Preview → {preview_path}")


if __name__ == '__main__':
    # Step 1: backup
    if not os.path.exists(BACKUP_PATH):
        shutil.copy(PROC_PATH, BACKUP_PATH)
        print(f"Backup  → {BACKUP_PATH}")
    else:
        print(f"Backup already exists: {BACKUP_PATH}")

    # Step 2-3: fix
    fix_bottom_white(PROC_PATH, OUTPUT_PATH)

    # Step 5: preview
    preview_path = os.path.join(REPO_ROOT, 'scripts/preview_bottom_fix.png')
    make_preview(OUTPUT_PATH, preview_path)
