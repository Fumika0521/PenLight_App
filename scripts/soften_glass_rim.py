#!/usr/bin/env python3
"""
Soften the outer edge of the glass ball in insert_empty_glass.png.
The glass ball is part of a large circle centered at approx (152, 256) with radius ~256px.
The visible arc comes from the boundary of this large circle in the upper part of the image.
Fix: radial fade at the outer rim of the glass ball circle.
"""

import numpy as np
from PIL import Image
from pathlib import Path

IMG_PATH = Path("public/assets/stickers/insert_empty_glass.png")
BACKUP_PATH = Path("public/assets/stickers/insert_empty_glass_before_rimfix.png")
PREVIEW_PATH = Path("scripts/preview_glass_rim_fixed.png")

img = Image.open(BACKUP_PATH).convert("RGBA")
arr = np.array(img, dtype=np.float32)
H, W = arr.shape[:2]

# Glass ball center and radius (computed from top-arc boundary analysis)
CX = 152.0
CY = 256.0
R = 258.0  # radius
FADE_WIDTH = 35.0  # pixels to fade over (at outer rim)

alpha = arr[:, :, 3].copy()

# Build pixel coordinate grids
rows = np.arange(H)[:, np.newaxis]  # (H,1)
cols = np.arange(W)[np.newaxis, :]  # (1,W)

# Radial distance from center
dist_from_center = np.sqrt((cols - CX)**2 + (rows - CY)**2)

# Distance from the outer rim (positive = inside, negative = outside)
dist_from_rim = R - dist_from_center  # positive inside the ball

# Pixels near the outer rim (within FADE_WIDTH of rim, inside the ball)
in_fade_zone = (dist_from_rim >= 0) & (dist_from_rim < FADE_WIDTH) & (alpha > 5)

# Fade factor: 0 at rim (dist_from_rim=0), 1 at FADE_WIDTH inside
fade_factor = (dist_from_rim / FADE_WIDTH) ** 1.3

# Only apply to top 75% of image (don't touch the rose gold decoration at bottom)
top_mask = rows < (H * 0.75)
apply_mask = in_fade_zone & top_mask

# Apply fade
arr[:, :, 3] = np.where(apply_mask, alpha * fade_factor, alpha)

n_changed = int(apply_mask.sum())
print(f"Modified {n_changed} pixels (radial rim fade)")

result = Image.fromarray(arr.astype(np.uint8))
result.save(IMG_PATH)
print(f"Saved: {IMG_PATH}")

# Preview
bg = Image.new('RGBA', (W * 2, H), (230, 200, 220, 255))
orig_img = Image.open(BACKUP_PATH).convert("RGBA")
bg.paste(orig_img, (0, 0), orig_img)
bg.paste(result, (W, 0), result)
bg.convert('RGB').save(PREVIEW_PATH)
print(f"Preview: {PREVIEW_PATH} (left=original, right=fixed)")

# Also save on white background for comparison
wbg = Image.new('RGBA', (W * 2, H), (255, 255, 255, 255))
wbg.paste(orig_img, (0, 0), orig_img)
wbg.paste(result, (W, 0), result)
wbg.convert('RGB').save("scripts/preview_glass_rim_white.png")
print("White bg preview: scripts/preview_glass_rim_white.png")
