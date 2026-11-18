#!/usr/bin/env python3
"""
Fix semi-transparent handle pixels caused by floor removal script.

Algorithm
---------
1. Backup current penlight_empty.png → penlight_empty_before_handlefix.png
2. Use handle bounds from row 876 (unaffected by floor removal): cols 445–578
3. For rows 877–882, within those bounds:
   - Restore ONLY semi-transparent pixels: orig_alpha >= 200 AND 10 < proc_alpha < 220
   - Leave fully-transparent pixels (floor shadow correctly removed) untouched
   - Leave fully-opaque pixels untouched
4. Write output + 3-panel preview
"""

import os
import shutil
import numpy as np
from PIL import Image

REPO_ROOT    = os.path.join(os.path.dirname(__file__), '..')
ORIG_PATH    = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty_before_floor.png')
PROC_PATH    = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty.png')
BACKUP_PATH  = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty_before_handlefix.png')
OUTPUT_PATH  = PROC_PATH

# Handle bounds from row 876 (last unaffected row above floor start)
HANDLE_LEFT  = 445
HANDLE_RIGHT = 578

ROW_START = 877
ROW_END   = 883  # exclusive

# Semi-transparent detection thresholds
ORIG_ALPHA_MIN = 200   # pixel must have been opaque in original
PROC_ALPHA_MIN = 10    # pixel must not be fully transparent now
PROC_ALPHA_MAX = 220   # pixel must be below fully-opaque (semi-transparent)


def fix_handle(orig_path, proc_path, output_path):
    orig_img = Image.open(orig_path).convert('RGBA')
    proc_img = Image.open(proc_path).convert('RGBA')

    orig_arr = np.array(orig_img, dtype=np.float32)
    proc_arr = np.array(proc_img, dtype=np.float32)
    out_arr  = proc_arr.copy()

    total_restored = 0
    for r in range(ROW_START, ROW_END):
        for c in range(HANDLE_LEFT, HANDLE_RIGHT + 1):
            orig_a = orig_arr[r, c, 3]
            proc_a = proc_arr[r, c, 3]
            if orig_a >= ORIG_ALPHA_MIN and PROC_ALPHA_MIN < proc_a < PROC_ALPHA_MAX:
                out_arr[r, c, 3] = orig_a
                total_restored += 1

    result = Image.fromarray(out_arr.astype(np.uint8))
    result.save(output_path, optimize=False)
    print(f"Saved  → {output_path}")
    print(f"  pixels restored: {total_restored}")
    return total_restored


def make_preview(edited_path, preview_path):
    """3-panel: white / light-pink (#FFF7FA) / dark (#333), bottom crop."""
    img  = Image.open(edited_path).convert('RGBA')
    crop = img.crop((250, 700, 780, 1024))
    cw, ch = crop.size

    bgs = [(255, 255, 255), (255, 247, 250), (51, 51, 51)]
    gap = 10
    out = Image.new('RGB', (cw * 3 + gap * 2, ch), (200, 200, 200))

    for i, bg in enumerate(bgs):
        base      = Image.new('RGBA', (cw, ch), bg + (255,))
        composite = Image.alpha_composite(base, crop)
        out.paste(composite.convert('RGB'), (i * (cw + gap), 0))

    out.save(preview_path)
    print(f"Preview → {preview_path}")


if __name__ == '__main__':
    # Step 1: backup (skip if exists)
    if not os.path.exists(BACKUP_PATH):
        shutil.copy(PROC_PATH, BACKUP_PATH)
        print(f"Backup  → {BACKUP_PATH}")
    else:
        print(f"Backup already exists: {BACKUP_PATH}")

    # Step 2 & 3: fix handle
    fix_handle(ORIG_PATH, PROC_PATH, OUTPUT_PATH)

    # Step 4: preview
    preview_path = os.path.join(REPO_ROOT, 'scripts/preview_handle_fix.png')
    make_preview(OUTPUT_PATH, preview_path)
