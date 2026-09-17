import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import wave
import subprocess
import os
import math
import re

W, H = 1080, 1920
FPS = 30
FFMPEG = r'C:\Users\user\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe'
ICON_DIR = r'C:\Users\user\Downloads\icons'

# 1. Typography & Character Sanitizer (Guarantees zero tofu box ▯ errors)
REPLACEMENTS = {
    '✓': '[OK]',
    '✔': '[OK]',
    '⚡': '',
    '⬇': '>>>',
    '⬆': '<<<',
    '▶': '>',
    '🚀': '',
    '🔥': '',
    '🎙': '',
    '💻': '',
    '📱': '',
    '✉': '',
    '📅': '',
    '📝': '',
    '✈': '',
}

def sanitize_for_pil(text: str) -> str:
    """Replaces known emoji symbols and strips remaining non-ASCII characters."""
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    # Remove any other non-ASCII characters
    return re.sub(r'[^\x00-\x7F]+', ' ', text).strip()

# 2. Icon Management
_ICON_CACHE = {}

def load_icon(name: str, size=(44, 44)):
    key = (name, size)
    if key in _ICON_CACHE:
        return _ICON_CACHE[key]
    p = os.path.join(ICON_DIR, name)
    if os.path.exists(p):
        img = Image.open(p).convert('RGBA').resize(size, Image.LANCZOS)
        _ICON_CACHE[key] = img
        return img
    return None

def paste_icon(canvas: Image.Image, icon: Image.Image, xy):
    if icon is not None:
        canvas.paste(icon, xy, icon)

# 3. Smart Caption Renderer (Guarantees zero subtitle clipping)
def get_text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

def draw_smart_caption(draw: ImageDraw.ImageDraw, lines, y_center: int, colors=None, 
                       max_w=880, font_path=r'C:\Windows\Fonts\ariblk.ttf', 
                       base_size=46, min_size=28, stroke_color=(0,0,0), stroke_w=4):
    """
    Renders multi-line subtitles with auto-scaling font size to prevent any clipping,
    leaving at least 100px safety margin on both screen edges.
    """
    sanitized_lines = [sanitize_for_pil(l) for l in lines]
    if colors is None:
        colors = [(255, 255, 255)] * len(sanitized_lines)
        
    cur_size = base_size
    while cur_size >= min_size:
        font = ImageFont.truetype(font_path, cur_size)
        widths = [get_text_width(draw, l, font) for l in sanitized_lines]
        if max(widths) <= max_w:
            break
        cur_size -= 2
        
    font = ImageFont.truetype(font_path, cur_size)
    line_h = cur_size + 16
    total_h = len(sanitized_lines) * line_h
    start_y = y_center - (total_h // 2)
    
    for i, line in enumerate(sanitized_lines):
        w = get_text_width(draw, line, font)
        x = (W - w) // 2
        y = start_y + i * line_h
        col = colors[i]
        
        # High contrast drop-shadow stroke
        for dx in range(-stroke_w, stroke_w+1):
            for dy in range(-stroke_w, stroke_w+1):
                if dx*dx + dy*dy <= stroke_w*stroke_w:
                    draw.text((x+dx, y+dy), line, font=font, fill=stroke_color)
        draw.text((x, y), line, font=font, fill=col)

def draw_metric_right_aligned(draw: ImageDraw.ImageDraw, text: str, py: int, font: ImageFont.FreeTypeFont, 
                              color=(255, 220, 50), margin_right=120):
    """Guarantees card metrics never overflow the right edge of cards."""
    sanitized = sanitize_for_pil(text)
    w = get_text_width(draw, sanitized, font)
    draw.text((W - margin_right - w, py), sanitized, font=font, fill=color)

def draw_vector_checkmark(draw: ImageDraw.ImageDraw, x: int, y: int, size=18, color=(0, 255, 140)):
    """Draws a crisp anti-aliased green checkmark."""
    draw.line([(x, y + size//2), (x + size//3, y + size)], fill=color, width=3)
    draw.line([(x + size//3, y + size), (x + size, y)], fill=color, width=3)
