#!/usr/bin/env python3
"""
Remove white floor ellipse from penlight_empty.png.

Algorithm
---------
1. Only process pixels at row >= FLOOR_START_ROW (handle bottom ring, row 877).
2. Build a protection mask:
   - Any opaque pixel in the floor region with brightness < DARK_THRESHOLD (0.70)
     is a structural pixel (cord shadow / charm outline / cast shadow).
   - Dilate that mask by PROTECT_RADIUS (10 px) using distance transform.
   - Pixels within that zone are kept regardless of brightness.
3. Outside the protection zone:
   - brightness >= BRIGHTNESS_FULL (0.95) → fully transparent
   - brightness in [BRIGHTNESS_MID (0.88), BRIGHTNESS_FULL) → partial (gradual)
   - saturation must be <= SAT_MAX (0.06)
   - optional smoothness guard: opaque-weighted local std <= SMOOTH_MAX (0.10)
"""

import os
import numpy as np
from PIL import Image
from scipy.ndimage import uniform_filter, distance_transform_edt

REPO_ROOT   = os.path.join(os.path.dirname(__file__), '..')
INPUT_PATH  = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty.png')
OUTPUT_PATH = INPUT_PATH

FLOOR_START_ROW = 877
BRIGHTNESS_FULL = 0.95
BRIGHTNESS_MID  = 0.72   # lowered to also remove gray shadow band (0.72-0.88)
SAT_MAX         = 0.06
DARK_THRESHOLD  = 0.70   # structural-pixel brightness ceiling
PROTECT_RADIUS  = 10     # px — dilate structural pixels by this radius
WINDOW          = 11
SMOOTH_MAX      = 0.10


def brightness_arr(rgb):
    return np.max(rgb, axis=2)


def saturation_arr(rgb):
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    with np.errstate(invalid='ignore', divide='ignore'):
        return np.where(max_c > 0, (max_c - min_c) / max_c, 0.0)


def opaque_weighted_local_std(brightness, alpha):
    n  = WINDOW * WINDOW
    w  = (alpha > 10).astype(np.float32)
    bw = brightness * w
    wsum   = uniform_filter(w,       size=WINDOW) * n
    bsum   = uniform_filter(bw,      size=WINDOW) * n
    bsqsum = uniform_filter(bw ** 2, size=WINDOW) * n
    with np.errstate(invalid='ignore', divide='ignore'):
        lmean = np.where(wsum > 0, bsum   / wsum, 0.0)
        lmsq  = np.where(wsum > 0, bsqsum / wsum, 0.0)
    return np.sqrt(np.maximum(lmsq - lmean ** 2, 0.0))


def remove_floor(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)

    rgb   = arr[:, :, :3] / 255.0
    alpha = arr[:, :, 3].copy()

    brightness = brightness_arr(rgb)
    saturation = saturation_arr(rgb)
    local_std  = opaque_weighted_local_std(brightness, alpha)

    row_mask = np.zeros(arr.shape[:2], dtype=bool)
    row_mask[FLOOR_START_ROW:, :] = True

    # Protection zone: structural pixels (dark) + dilation
    struct_px       = (brightness < DARK_THRESHOLD) & (alpha > 10) & row_mask
    dist_to_struct  = distance_transform_edt(~struct_px)
    protected       = dist_to_struct <= PROTECT_RADIUS

    candidate = (
        row_mask &
        (alpha      >  10) &
        (saturation <= SAT_MAX) &
        (local_std  <= SMOOTH_MAX) &
        ~protected
    )

    is_full    = candidate & (brightness >= BRIGHTNESS_FULL)
    is_partial = candidate & (brightness >= BRIGHTNESS_MID) & ~is_full

    new_alpha = alpha.copy()
    new_alpha[is_full] = 0.0
    t = (brightness[is_partial] - BRIGHTNESS_MID) / (BRIGHTNESS_FULL - BRIGHTNESS_MID)
    new_alpha[is_partial] = new_alpha[is_partial] * (1.0 - t)

    arr[:, :, 3] = new_alpha
    result = Image.fromarray(arr.astype(np.uint8))
    result.save(output_path, optimize=False)

    total = int(is_full.sum() + is_partial.sum())
    print(f"Saved  → {output_path}")
    print(f"  fully removed  : {int(is_full.sum())} px")
    print(f"  partially faded: {int(is_partial.sum())} px")
    print(f"  total affected : {total} px")
    print(f"  protected zone : {int((protected & row_mask & (alpha > 10)).sum())} px kept")


def make_preview(edited_path, preview_path):
    """3-panel: white / light-pink (#FFF7FA) / dark (#333), bottom crop."""
    img  = Image.open(edited_path).convert('RGBA')
    # Show rows 700-1024 of the original 1024×1024 image
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
    backup_path = INPUT_PATH.replace('penlight_empty.png', 'penlight_empty_before_floor.png')
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy(INPUT_PATH, backup_path)
        print(f"Backup  → {backup_path}")
    else:
        print(f"Backup already exists: {backup_path}")

    remove_floor(INPUT_PATH, OUTPUT_PATH)

    preview_path = os.path.join(REPO_ROOT, 'scripts/preview_floor_removal.png')
    make_preview(OUTPUT_PATH, preview_path)
