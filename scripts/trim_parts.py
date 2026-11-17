#!/usr/bin/env python3
"""
trim_parts.py
=============
Trim transparent padding from part PNG images and normalize to a square
with ~4% padding around the actual drawn content.

Usage:
    python3 scripts/trim_parts.py [--dry-run] [file1.png file2.png ...]

If no files are specified the script processes the default target list.
Originals are backed up to public/assets/stickers/_original/ before any change.
"""

import sys
import os
import shutil
import argparse
import numpy as np
from PIL import Image

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STICKERS_DIR = os.path.join(REPO_ROOT, 'public', 'assets', 'stickers')
BACKUP_DIR = os.path.join(STICKERS_DIR, '_original')

# Alpha threshold: pixels with alpha <= this value are considered transparent
ALPHA_THRESHOLD = 10

# Padding ratio: fraction of the longer content side to add on each edge
PAD_RATIO = 0.04


# Default target files (relative to STICKERS_DIR).
# Excludes insert images (heart_note_*), raw/backup variants, etc.
SKIP_PREFIXES = ('heart_note_', 'heart_frame_gem_raw', 'heart_note_new',
                 'heart_note_clean', 'heart_pop_', 'heart_crystal_',
                 'heart_gem_ruby', 'heart_sparkle_')
SKIP_SUFFIXES = ('_old.png', '_backup.png', '_new_backup.png')
SKIP_SUBSTR = ('_v1.', '_v2.', '_v3.', '_v4.', '_v5.', '_v6.', '_v7.', '_v8.')

DEFAULT_PATTERNS = [
    'heart_',
    'stone_',
    'rhinestone_',
    'star_',
]


def should_skip(fname: str) -> bool:
    if fname.startswith('_'):
        return True
    for p in SKIP_PREFIXES:
        if fname.startswith(p):
            return True
    for s in SKIP_SUFFIXES:
        if fname.endswith(s):
            return True
    for s in SKIP_SUBSTR:
        if s in fname:
            return True
    return False


def collect_default_targets():
    targets = []
    for fname in sorted(os.listdir(STICKERS_DIR)):
        if not fname.endswith('.png'):
            continue
        if should_skip(fname):
            continue
        for pat in DEFAULT_PATTERNS:
            if fname.startswith(pat):
                targets.append(os.path.join(STICKERS_DIR, fname))
                break
    return targets


def trim_to_square(path: str, dry_run: bool = False):
    img = Image.open(path).convert('RGBA')
    w, h = img.size
    arr = np.array(img)
    alpha = arr[:, :, 3]

    rows = np.any(alpha > ALPHA_THRESHOLD, axis=1)
    cols = np.any(alpha > ALPHA_THRESHOLD, axis=0)

    if not rows.any():
        print(f'  SKIP (fully transparent): {os.path.basename(path)}')
        return

    rmin, rmax = int(np.where(rows)[0][0]), int(np.where(rows)[0][-1])
    cmin, cmax = int(np.where(cols)[0][0]), int(np.where(cols)[0][-1])

    content_w = cmax - cmin + 1
    content_h = rmax - rmin + 1

    # Padding = PAD_RATIO * longer content side
    pad = max(1, round(PAD_RATIO * max(content_w, content_h)))

    # Expanded bounding box (clamped to image bounds)
    x0 = max(0, cmin - pad)
    y0 = max(0, rmin - pad)
    x1 = min(w, cmax + pad + 1)
    y1 = min(h, rmax + pad + 1)

    cropped = img.crop((x0, y0, x1, y1))
    cw, ch = cropped.size

    # Make square: pad the shorter axis symmetrically with transparent pixels
    side = max(cw, ch)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    paste_x = (side - cw) // 2
    paste_y = (side - ch) // 2
    square.paste(cropped, (paste_x, paste_y))

    fill_pct = round(content_w / side * 100)

    print(f'  {os.path.basename(path)}: {w}x{h} → {side}x{side}  '
          f'(content {content_w}x{content_h}, fill ~{fill_pct}%)')

    if dry_run:
        return

    # Backup original (only once, skip if already backed up)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    backup_path = os.path.join(BACKUP_DIR, os.path.basename(path))
    if not os.path.exists(backup_path):
        shutil.copy2(path, backup_path)

    square.save(path, 'PNG', optimize=False)


def main():
    parser = argparse.ArgumentParser(description='Trim transparent padding from part PNGs.')
    parser.add_argument('files', nargs='*', help='PNG files to process (default: all heart/stone/star/rhinestone)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without writing files')
    args = parser.parse_args()

    targets = args.files if args.files else collect_default_targets()
    if not targets:
        print('No target files found.')
        return

    print(f'{"[DRY RUN] " if args.dry_run else ""}Processing {len(targets)} files...\n')
    for path in targets:
        trim_to_square(path, dry_run=args.dry_run)

    if not args.dry_run:
        print(f'\nOriginals backed up to: {BACKUP_DIR}')
    print('Done.')


if __name__ == '__main__':
    main()
