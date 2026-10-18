"""Separates the portrait from the poster background with GrabCut (no generative editing)."""
import sys

import cv2
import numpy as np

src, out_png, preview = sys.argv[1], sys.argv[2], sys.argv[3]
img = cv2.imread(src)  # 1280x720 poster frame
# Region containing her upper body, above the poster's lettering (starts ~y565).
x0, y0, x1, y1 = 12, 12, 700, 560
crop = img[y0:y1, x0:x1].copy()
h, w = crop.shape[:2]

mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
# Probable foreground: the figure's central column.
cv2.rectangle(mask, (int(w * 0.10), int(h * 0.06)), (int(w * 0.80), h - 1), cv2.GC_PR_FGD, -1)
# Definite foreground: face and the dark hijab around it.
cv2.ellipse(mask, (int(w * 0.38), int(h * 0.48)), (int(w * 0.13), int(h * 0.20)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.rectangle(mask, (int(w * 0.20), int(h * 0.80)), (int(w * 0.62), h - 1), cv2.GC_FGD, -1)
# Definite background: the outer margins and the flag at the right.
mask[:, : int(w * 0.02)] = cv2.GC_BGD
mask[: int(h * 0.03), :] = cv2.GC_BGD
mask[:, int(w * 0.90):] = cv2.GC_BGD
# The red flag behind her right shoulder (crop coordinates).
flag = np.array([[452, 0], [w, 0], [w, 448], [560, 448], [495, 385], [462, 290], [450, 160]], np.int32)
cv2.fillPoly(mask, [flag], cv2.GC_BGD)

bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(crop, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# Keep the largest connected shape (the figure) and fill small holes.
n, labels, stats, _ = cv2.connectedComponentsWithStats(fg, 8)
largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
fg = np.where(labels == largest, 255, 0).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))

# Soft edge so the figure sits naturally on a new background.
alpha = cv2.GaussianBlur(fg, (0, 0), 1.6)
rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = alpha
cv2.imwrite(out_png, rgba)

# Preview on the site's deep green and ivory to judge the edges.
def on(bg):
    a = alpha[..., None] / 255.0
    return (crop * a + np.array(bg, np.float64) * (1 - a)).astype(np.uint8)

cv2.imwrite(preview, np.hstack([on((46, 61, 31)), on((236, 244, 248))]))
print("size", w, h, "foreground share", round(float((fg > 0).mean()), 3))
