# AI High-CTR Thumbnail & Cover Generator for Neural Pulse AI
import sys, os, argparse
from PIL import Image, ImageDraw, ImageFont

def get_font(paths, size):
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

def strip_emojis(text):
    if not text:
        return ""
    import re
    text = re.sub(r"[‘’ʻʼ`]", "'", text)
    clean = ''
    for char in text:
        if ord(char) < 0x2000 or (0x2000 <= ord(char) <= 0x206F) or (0x20A0 <= ord(char) <= 0x20CF):
            clean += char
        else:
            clean += ' '
    return ' '.join(clean.split())

def draw_text_with_outline(draw, pos, text, font, fill_color, outline_color, outline_width=6):
    x, y = pos
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx * dx + dy * dy <= outline_width * outline_width:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)
    draw.text((x, y), text, font=font, fill=fill_color)

def generate_thumbnail(output_path, width=1080, height=1920, headline='STOP CODING NOW', badge='! CRITICAL 2026 !', style='neon', brand='NEURAL PULSE AI', host_avatar_path=None):
    if style == 'versus':
        bg_color = (8, 14, 24)
        glow_color = (6, 182, 212)
        badge_bg = (16, 185, 129)
        text_accent = (56, 189, 248)
    elif style == 'mystery':
        bg_color = (15, 8, 28)
        glow_color = (168, 85, 247)
        badge_bg = (236, 72, 153)
        text_accent = (216, 180, 254)
    elif style == 'gold':
        bg_color = (12, 10, 8)
        glow_color = (234, 179, 8)
        badge_bg = (202, 138, 4)
        text_accent = (254, 240, 138)
    else:
        bg_color = (10, 10, 16)
        glow_color = (239, 68, 68)
        badge_bg = (220, 38, 38)
        text_accent = (251, 191, 36)

    headline_clean = strip_emojis(headline).upper()
    badge_clean = strip_emojis(badge).upper()
    brand_clean = strip_emojis(brand).upper()

    img = Image.new('RGB', (width, height), bg_color)
    glow_overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_overlay)
    center_x = width // 2
    center_y = int(height * 0.42)
    radius = int(min(width, height) * 0.75)
    
    for r in range(radius, 0, -25):
        alpha = int(45 * (1 - r / radius))
        glow_draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(glow_color[0], glow_color[1], glow_color[2], alpha))
    
    img = Image.alpha_composite(img.convert('RGBA'), glow_overlay).convert('RGB')
    draw = ImageDraw.Draw(img)

    grid_color = (glow_color[0] // 5, glow_color[1] // 5, glow_color[2] // 5)
    grid_step = 80
    for x in range(0, width, grid_step):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, grid_step):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)

    border_margin = 28
    draw.rounded_rectangle([(border_margin, border_margin), (width - border_margin, height - border_margin)], radius=36, outline=glow_color, width=5)

    font_bold = ['C:\\Windows\\Fonts\\ariblk.ttf', 'C:\\Windows\\Fonts\\impact.ttf', 'C:\\Windows\\Fonts\\arialbd.ttf']
    font_regular = ['C:\\Windows\\Fonts\\arialbd.ttf', 'C:\\Windows\\Fonts\\segoeuib.ttf']

    badge_font_size = 32 if width >= 1080 else 24
    badge_font = get_font(font_bold, badge_font_size)
    badge_bbox = draw.textbbox((0, 0), badge_clean, font=badge_font)
    badge_w = badge_bbox[2] - badge_bbox[0]
    badge_h = badge_bbox[3] - badge_bbox[1]
    
    pill_w = badge_w + 72
    pill_h = badge_h + 32
    pill_x1 = (width - pill_w) // 2
    pill_y1 = int(height * 0.16) if height > 1000 else int(height * 0.14)
    
    draw.rounded_rectangle([(pill_x1, pill_y1), (pill_x1 + pill_w, pill_y1 + pill_h)], radius=pill_h // 2, fill=badge_bg, outline=(255, 255, 255), width=3)
    draw.text((pill_x1 + 36, pill_y1 + 14), badge_clean, font=badge_font, fill=(255, 255, 255))

    max_text_width = int(width * 0.82)
    words = headline_clean.split()
    if len(words) <= 3:
        lines = [' '.join(words)]
    elif len(words) <= 6:
        mid = len(words) // 2
        lines = [' '.join(words[:mid]), ' '.join(words[mid:])]
    else:
        p1 = len(words) // 3
        p2 = 2 * len(words) // 3
        lines = [' '.join(words[:p1]), ' '.join(words[p1:p2]), ' '.join(words[p2:])]

    target_font_size = 94 if width >= 1080 else 64
    if len(lines) >= 3:
        target_font_size = int(target_font_size * 0.85)

    while target_font_size > 32:
        test_font = get_font(font_bold, target_font_size)
        fits = True
        for l in lines:
            bb = draw.textbbox((0, 0), l, font=test_font)
            if (bb[2] - bb[0]) > max_text_width:
                fits = False
                break
        if fits:
            break
        target_font_size -= 4

    headline_font = get_font(font_bold, target_font_size)
    total_text_h = 0
    line_metrics = []
    for l in lines:
        bb = draw.textbbox((0, 0), l, font=headline_font)
        lw = bb[2] - bb[0]
        lh = bb[3] - bb[1]
        line_metrics.append((lw, lh))
        total_text_h += lh + 24
    
    cur_y = int(height * 0.40) - (total_text_h // 2)
    for idx, l in enumerate(lines):
        lw, lh = line_metrics[idx]
        tx = (width - lw) // 2
        fill_col = text_accent if (idx == 0 or idx == len(lines) - 1) and len(lines) > 1 else (255, 255, 255)
        draw_text_with_outline(draw, (tx, cur_y), l, headline_font, fill_color=fill_col, outline_color=(0, 0, 0), outline_width=8)
        cur_y += lh + 24

    brand_font = get_font(font_regular, 24 if width >= 1080 else 18)
    brand_text = f'{brand_clean} - 2026 BLUEPRINT'
    bbb = draw.textbbox((0, 0), brand_text, font=brand_font)
    bw = bbb[2] - bbb[0]
    bh = bbb[3] - bbb[1]
    
    bar_y = int(height * 0.82)
    bar_w = bw + 60
    bar_h = bh + 24
    bar_x = (width - bar_w) // 2
    draw.rounded_rectangle([(bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h)], radius=14, fill=(10, 14, 24), outline=glow_color, width=2)
    draw.text((bar_x + 30, bar_y + 10), brand_text, font=brand_font, fill=(255, 255, 255))

    stamp_font = get_font(font_bold, 18)
    stamp_text = 'EST. 13.8% CTR - TOP 1%'
    s_bbox = draw.textbbox((0, 0), stamp_text, font=stamp_font)
    sw = s_bbox[2] - s_bbox[0]
    stamp_x = (width - sw) // 2
    stamp_y = bar_y + bar_h + 16
    draw.text((stamp_x, stamp_y), stamp_text, font=stamp_font, fill=glow_color)

    if host_avatar_path and os.path.exists(host_avatar_path):
        try:
            avatar_size = 140 if width >= 1080 else 100
            avatar_img = Image.open(host_avatar_path).convert('RGBA')
            avatar_img = avatar_img.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)
            mask = Image.new('L', (avatar_size, avatar_size), 0)
            ImageDraw.Draw(mask).ellipse((0, 0, avatar_size, avatar_size), fill=255)
            av_x = width - border_margin - avatar_size - 24
            av_y = height - border_margin - avatar_size - 24
            ring_margin = 6
            draw.ellipse([(av_x - ring_margin, av_y - ring_margin), (av_x + avatar_size + ring_margin, av_y + avatar_size + ring_margin)], outline=glow_color, width=4)
            img.paste(avatar_img, (av_x, av_y), mask)
        except Exception:
            pass

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img.save(output_path, 'JPEG', quality=95)
    print(f'OK: Saved thumbnail to {output_path}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--width', type=int, default=1080)
    parser.add_argument('--height', type=int, default=1920)
    parser.add_argument('--headline', default='STOP CODING NOW')
    parser.add_argument('--badge', default='! CRITICAL 2026 !')
    parser.add_argument('--style', default='neon')
    parser.add_argument('--brand', default='NEURAL PULSE AI')
    parser.add_argument('--host_avatar', default=None)
    args = parser.parse_args()

    generate_thumbnail(args.output, args.width, args.height, args.headline, args.badge, args.style, args.brand, args.host_avatar)
