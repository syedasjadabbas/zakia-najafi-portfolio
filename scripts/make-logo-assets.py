"""Builds transparent logo variants and icons from the supplied ZB logo (black background)."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float64) / 255.0

# The artwork is composited over pure black, so each pixel = colour * alpha.
alpha = rgb.max(axis=2)
safe = np.where(alpha > 1e-4, alpha, 1.0)[..., None]
colour = np.clip(rgb / safe, 0, 1)

# Separate the gold leaves (saturated) from the near-white letters (unsaturated).
mx, mn = colour.max(axis=2), colour.min(axis=2)
saturation = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-4), 0)
leaf = np.clip((saturation - 0.08) / 0.14, 0, 1)[..., None]

# Tight crop around the mark, with a little breathing room.
ys, xs = np.where(alpha > 0.06)
pad = 18
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, alpha.shape[0] - 1)
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, alpha.shape[1] - 1)


def save(colour_map, name):
    rgba = np.dstack([colour_map, alpha])[y0 : y1 + 1, x0 : x1 + 1]
    Image.fromarray((rgba * 255).round().astype(np.uint8), "RGBA").save(out / name, optimize=True)


ink = np.array([0x1E, 0x1D, 0x1A]) / 255.0  # site charcoal

# Gold on black separates into a translucent yellow that fades on ivory. The leaves
# are solid, so treat their interiors as opaque and recover their true gold.
leaf_alpha = np.clip(alpha / 0.62, 0, 1)
light_alpha = leaf[..., 0] * leaf_alpha + (1 - leaf[..., 0]) * alpha
light_colour = np.clip(rgb / np.where(light_alpha > 1e-4, light_alpha, 1.0)[..., None], 0, 1)
gold = light_colour * 0.78  # slightly deeper so the leaves hold on a light background


def save_light(name):
    colour_map = leaf * gold + (1 - leaf) * ink
    rgba = np.dstack([colour_map, light_alpha])[y0 : y1 + 1, x0 : x1 + 1]
    Image.fromarray((rgba * 255).round().astype(np.uint8), "RGBA").save(out / name, optimize=True)


# Light backgrounds: charcoal letters, solid gold leaves.
save_light("zb-mark-on-light.png")
# Dark backgrounds: the original ivory letters and gold leaves.
save(colour, "zb-mark-on-dark.png")

# Icons: the original black square, cropped closer so the mark fills a small tab.
square = Image.open(src).convert("RGB")
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
half = max(x1 - x0, y1 - y0) / 2 + 60
box = (int(cx - half), int(cy - half), int(cx + half), int(cy + half))
icon = square.crop(box)
icon.resize((512, 512), Image.LANCZOS).save(out / "icon.png", optimize=True)
icon.resize((180, 180), Image.LANCZOS).save(out / "apple-icon.png", optimize=True)
icon.resize((48, 48), Image.LANCZOS).save(out / "favicon-48.png", optimize=True)
print("crop", (x0, y0, x1, y1), "icon box", box)
