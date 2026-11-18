#!/usr/bin/env python3
"""
Flood-fill based floor shadow removal for penlight_empty.png.

「白っぽい色なら床」の閾値判定ではなく、透明エリアに隣接している
白っぽいピクセルから flood fill でたどって「床」を検出する。
ストラップ・チャームのふちで自動的に止まるため、ストラップが削れない。

Algorithm
---------
1. penlight_empty.png → penlight_empty_broken.png にバックアップ
2. penlight_empty_before_floor.png から作業開始
3. ROW_START (877) 以降のみ処理
4. シード: 透明ピクセルに隣接する bright>=0.90, sat<=0.08 のピクセル
5. Flood fill (4-connectivity):
   - 訪問条件: bright>=0.88, sat<=0.08
   - 停止条件: 明るさが GRADIENT_MAX (0.08) 以上下がる場合は伝播しない
6. 床マスクを透明化。ストラップとの境界 1px は alpha*=0.5 でなめらかに
7. 3-panel プレビューを生成して確認
"""

import os, shutil
import numpy as np
from PIL import Image
from collections import deque
from scipy.ndimage import binary_dilation

REPO_ROOT    = os.path.join(os.path.dirname(__file__), '..')
ORIG_PATH    = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty_before_floor.png')
PROC_PATH    = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty.png')
BROKEN_PATH  = os.path.join(REPO_ROOT, 'public/assets/hires/penlight_empty_broken.png')

ROW_START    = 877   # 持ち手最終リングのすぐ下（これより上は一切触らない）
BRIGHT_SEED  = 0.90  # シードの最低明るさ
BRIGHT_FILL  = 0.88  # flood fill 伝播の最低明るさ
SAT_MAX      = 0.08  # 彩度上限
GRADIENT_MAX = 0.08  # これ以上明るさが落ちたら伝播を止める


def compute_channels(arr):
    rgb = arr[:, :, :3] / 255.0
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    with np.errstate(invalid='ignore', divide='ignore'):
        sat = np.where(max_c > 0, (max_c - min_c) / max_c, 0.0)
    return max_c, sat  # brightness, saturation


def build_floor_mask(arr, bright, sat):
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]

    # 透明ピクセルに隣接しているかを判定
    transparent = alpha < 10
    struct4 = np.array([[0,1,0],[1,1,1],[0,1,0]], dtype=bool)
    trans_adj = binary_dilation(transparent, structure=struct4)

    # シード: ROW_START 以降、bright>=0.90, sat<=0.08、透明に隣接
    seed_mask = (
        (alpha > 10) &
        (bright >= BRIGHT_SEED) &
        (sat <= SAT_MAX) &
        trans_adj
    )
    seed_mask[:ROW_START, :] = False

    seeds = list(zip(*np.where(seed_mask)))
    print(f"  Seeds: {len(seeds)} px")

    # Flood fill (4-connectivity, ROW_START より上には伝播しない)
    floor_mask = np.zeros((h, w), dtype=bool)
    queue = deque()
    for r, c in seeds:
        if not floor_mask[r, c]:
            floor_mask[r, c] = True
            queue.append((r, c))

    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while queue:
        r, c = queue.popleft()
        b_cur = bright[r, c]
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if nr < ROW_START or nr >= h or nc < 0 or nc >= w:
                continue
            if floor_mask[nr, nc]:
                continue
            if alpha[nr, nc] < 5:
                continue
            b_next = bright[nr, nc]
            s_next = sat[nr, nc]
            if b_next < BRIGHT_FILL or s_next > SAT_MAX:
                continue
            # 明るさが急に落ちる = ふちや影 → 止まる
            if b_cur - b_next > GRADIENT_MAX:
                continue
            floor_mask[nr, nc] = True
            queue.append((nr, nc))

    print(f"  Floor pixels: {floor_mask.sum()}")
    return floor_mask


def apply_removal(arr, floor_mask):
    h, w = arr.shape[:2]
    result = arr.copy()
    alpha = arr[:, :, 3]

    # 境界: 床ピクセルのうち、非床・不透明ピクセルに隣接しているもの
    non_floor_opaque = (alpha > 20) & ~floor_mask
    struct4_no_center = np.array([[0,1,0],[1,0,1],[0,1,0]], dtype=bool)
    border = floor_mask & binary_dilation(non_floor_opaque, structure=struct4_no_center)
    inner  = floor_mask & ~border

    result[inner,  3] = 0
    result[border, 3] = (alpha[border] * 0.5).astype(np.float32)

    n_inner  = int(inner.sum())
    n_border = int(border.sum())
    print(f"  Fully removed : {n_inner} px")
    print(f"  Border faded  : {n_border} px")
    return result


def make_preview(output_path, preview_path):
    """3-panel: white / light-pink (#FFF7FA) / dark (#333), bottom crop."""
    img  = Image.open(output_path).convert('RGBA')
    crop = img.crop((150, 700, 870, 1024))
    cw, ch = crop.size
    bgs = [(255,255,255),(255,247,250),(51,51,51)]
    gap = 10
    out = Image.new('RGB', (cw*3+gap*2, ch), (200,200,200))
    for i, bg in enumerate(bgs):
        base = Image.new('RGBA', (cw,ch), bg+(255,))
        comp = Image.alpha_composite(base, crop)
        out.paste(comp.convert('RGB'), (i*(cw+gap), 0))
    out.save(preview_path)
    print(f"  Preview → {preview_path}")


if __name__ == '__main__':
    # Step 1: backup broken
    shutil.copy(PROC_PATH, BROKEN_PATH)
    print(f"Broken backup → {BROKEN_PATH}")

    # Step 2: load original (before floor)
    img = Image.open(ORIG_PATH).convert('RGBA')
    arr = np.array(img, dtype=np.float32)
    print(f"Loaded: {ORIG_PATH} {arr.shape}")

    # Step 3: compute
    bright, sat = compute_channels(arr)

    # Step 4: flood fill
    print("Building floor mask (flood fill)...")
    floor_mask = build_floor_mask(arr, bright, sat)

    # Step 5: apply
    print("Applying transparency...")
    result_arr = apply_removal(arr, floor_mask)
    result = Image.fromarray(result_arr.astype(np.uint8))

    # Step 6: save to temp, generate preview
    tmp_path = os.path.join(REPO_ROOT, 'scripts/floodfill_tmp.png')
    result.save(tmp_path, optimize=False)
    preview_path = os.path.join(REPO_ROOT, 'scripts/preview_floodfill.png')
    print("Generating preview...")
    make_preview(tmp_path, preview_path)

    # Step 7: replace
    result.save(PROC_PATH, optimize=False)
    print(f"Saved → {PROC_PATH}")

    # Cleanup tmp
    if os.path.exists(tmp_path):
        os.remove(tmp_path)
