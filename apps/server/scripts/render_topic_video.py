#!/usr/bin/env python3
"""
Neural Pulse AI - Master Viral Video Synthesis Engine (Production Grade)
Strictly adheres to AGENTS.md & GEMINI.md quality & viral standards:
- Pure Azure Neural Speech (en-US-ChristopherNeural, +14% pacing, +1Hz pitch)
- Pure procedural cyberpunk background beat (Kick, Hi-hat, Synth Bass) - ZERO PREVIOUS SPEECH!
- Synchronized SFX: sub_drop, whoosh at cuts, bell_ding at subscribe
- Multi-scene dynamic visual B-Roll (Datacenter, Cyberpunk Hailuo, Matrix Rain, Hologram)
- Host Alex with explosive punch zoom (1.22x -> 1.05x), 100% clean face (y=100..1240)
- Auto-scaling kinetic smart captions (draw_smart_caption, zero clipping, 100px margins)
- Interactive UI cards with authentic PNG vector icons
- Live reactive frequency audio equalizer
- Animated YouTube Subscribe Pill with state change
- White flash transitions on cuts
- H.264 Faststart MP4 output
"""

import sys
import os
import json
import argparse
import asyncio
import re
import wave
import subprocess
import shutil
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FPS = 30

# Character Sanitizer (Prevents tofu boxes in PIL)
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
    '💬': '',
    '🤖': '',
    '🚨': '',
    '🔔': '',
    '📈': '',
    '📊': '',
    '🧠': '',
    '✨': '',
    '🛠': '',
    '💡': '',
}

EMOJI_PATTERN = re.compile(
    "["
    "\U00010000-\U0010ffff"
    "\u2600-\u27bf"
    "\u2300-\u23ff"
    "\u2b50\u2b55\u2934\u2935\u25aa\u25ab\u25fe\u25fd\u25fb\u25fc\u25b6\u25c0"
    "\ufe0f\ufe0e\u200d"
    "]+", flags=re.UNICODE
)

def sanitize_text(text: str) -> str:
    if not text:
        return ""
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    text = re.sub(r"[‘’ʻʼ`]", "'", text)
    text = EMOJI_PATTERN.sub('', text)
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text).strip()

def get_ffmpeg_bin() -> str:
    path_bin = shutil.which('ffmpeg')
    if path_bin:
        return path_bin
    win_paths = [
        r'C:\Users\user\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe',
        r'C:\ffmpeg\bin\ffmpeg.exe',
        r'C:\Program Files\ffmpeg\bin\ffmpeg.exe'
    ]
    for p in win_paths:
        if os.path.exists(p):
            return p
    return 'ffmpeg'

def get_font(size: int, bold=False):
    font_names = ['ariblk.ttf', 'arialbd.ttf', 'segoeuib.ttf', 'DejaVuSans-Bold.ttf', 'Arial.ttf']
    win_dirs = [r'C:\Windows\Fonts', '/usr/share/fonts/truetype/dejavu', '/usr/share/fonts']
    for wd in win_dirs:
        for fn in font_names:
            p = os.path.join(wd, fn)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return ImageFont.load_default()

def get_mono_font(size: int):
    font_names = ['lucon.ttf', 'consola.ttf', 'DejaVuSansMono.ttf', 'Courier.ttf']
    win_dirs = [r'C:\Windows\Fonts', '/usr/share/fonts/truetype/dejavu']
    for wd in win_dirs:
        for fn in font_names:
            p = os.path.join(wd, fn)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
    return get_font(size)

_ICON_CACHE = {}
def load_icon(name: str, size=(44, 44)):
    key = (name, size)
    if key in _ICON_CACHE:
        return _ICON_CACHE[key]
    search_dirs = [
        os.path.join(os.path.dirname(__file__), '../public/assets/icons'),
        r'C:\Users\user\Downloads\icons',
        os.path.join(os.path.dirname(__file__), '../public/icons'),
        r'C:\Users\user\Downloads\jpilot\apps\server\public\assets\icons'
    ]
    for d in search_dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            try:
                img = Image.open(p).convert('RGBA').resize(size, Image.LANCZOS)
                _ICON_CACHE[key] = img
                return img
            except Exception:
                pass
    return None

def paste_icon(canvas: Image.Image, icon: Image.Image, xy):
    if icon is not None:
        canvas.paste(icon, xy, icon)

def get_text_width(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

POWER_WORDS = {'2026', 'AI', 'FREE', 'SECRET', 'REVOLUTION', 'AUTOMATIC', 'ILLEGAL', 'PROFIT', 'CODE', 'AUTONOMOUS', 'MONEY', 'STOP', 'NEVER', 'TOOLS', 'TOOL', 'POWER', 'FAST', 'URGENT', 'NEW'}

def draw_smart_caption(draw: ImageDraw.ImageDraw, lines, y_center: int, colors=None, 
                       max_w=880, base_size=46, min_size=28, stroke_color=(0,0,0), stroke_w=4,
                       x_center=None):
    sanitized_lines = [sanitize_text(l) for l in lines]
    if colors is None:
        colors = [(255, 255, 255)] * len(sanitized_lines)
        
    cur_size = base_size
    while cur_size >= min_size:
        font = get_font(cur_size, bold=True)
        widths = [get_text_width(draw, l, font) for l in sanitized_lines]
        if max(widths) <= max_w:
            break
        cur_size -= 2
        
    font = get_font(cur_size, bold=True)
    line_h = cur_size + 16
    total_h = len(sanitized_lines) * line_h
    start_y = y_center - (total_h // 2)
    space_w = get_text_width(draw, " ", font)
    target_cx = (W // 2) if x_center is None else x_center
    
    for i, line in enumerate(sanitized_lines):
        col = colors[i]
        words = line.split()
        total_line_w = get_text_width(draw, line, font)
        start_x = target_cx - (total_line_w // 2)
        cur_x = start_x
        y = start_y + i * line_h
        
        for word in words:
            w_clean = re.sub(r'[^a-zA-Z0-9]', '', word).upper()
            word_col = (255, 225, 45) if (w_clean in POWER_WORDS and col == (255, 255, 255)) else col
            
            for dx in range(-stroke_w, stroke_w+1):
                for dy in range(-stroke_w, stroke_w+1):
                    if dx*dx + dy*dy <= stroke_w*stroke_w:
                        draw.text((cur_x+dx, y+dy), word, font=font, fill=stroke_color)
            draw.text((cur_x, y), word, font=font, fill=word_col)
            cur_x += get_text_width(draw, word, font) + space_w

def clean_script_for_tts(script: str) -> str:
    lines = []
    for line in script.split('\n'):
        line = line.strip()
        if not line:
            continue
        cleaned = re.sub(r'\[\d+:\d+[^\]]*\]', '', line)
        cleaned = re.sub(r'CHAPTER \d+:[^"]*', '', cleaned)
        cleaned = re.sub(r'HOOK[^:]*:', '', cleaned)
        cleaned = re.sub(r'TOOL \d+[^:]*:', '', cleaned)
        cleaned = re.sub(r'SCENE \d+[^:]*:', '', cleaned)
        cleaned = re.sub(r'OUTRO[^:]*:', '', cleaned)
        cleaned = cleaned.replace('"', '').strip()
        if cleaned:
            lines.append(cleaned)
    return ' '.join(lines)

def parse_timed_subtitles(script: str, total_duration: float):
    chunks = []
    pattern = re.compile(r'\[(\d+):(\d+)\s*-\s*(\d+):(\d+)\]\s*([^:\n]+)?:?\s*(.+?)(?=\[\d+:\d+|\Z)', re.DOTALL)
    matches = list(pattern.finditer(script))
    
    if matches:
        parsed_items = []
        max_script_time = 0.0
        for m in matches:
            s_min, s_sec, e_min, e_sec, tag, text = m.groups()
            st = float(s_min) * 60 + float(s_sec)
            et = float(e_min) * 60 + float(e_sec)
            if et > max_script_time:
                max_script_time = et
            parsed_items.append((st, et, text.strip()))

        # Scale timestamps proportionally if script timestamps differ from actual audio duration
        scale = 1.0
        if max_script_time > 0 and (max_script_time > total_duration or abs(max_script_time - total_duration) > 5.0):
            scale = total_duration / max_script_time

        for st, et, raw_text in parsed_items:
            scaled_st = st * scale
            scaled_et = min(total_duration, et * scale)
            if scaled_st >= total_duration or scaled_et <= scaled_st:
                continue

            # Extract spoken narration (inside quotes) or strip chapter headers
            quotes = re.findall(r'"([^"]+)"', raw_text)
            if quotes:
                speech_text = ' '.join(quotes).strip()
            else:
                lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
                speech_text = ' '.join(lines[1:]) if len(lines) > 1 else ' '.join(lines)
            clean_t = re.sub(r'CHAPTER \d+:[^"]*', '', speech_text)
            clean_t = re.sub(r'HOOK[^:]*:', '', clean_t)
            clean_t = re.sub(r'TOOL \d+[^:]*:', '', clean_t)
            clean_t = re.sub(r'SCENE \d+[^:]*:', '', clean_t)
            clean_t = re.sub(r'OUTRO[^:]*:', '', clean_t)
            clean_t = clean_t.replace('"', '').strip()
            if not clean_t:
                clean_t = raw_text.replace('"', '').strip()

            sentences = [s.strip() for s in re.split(r'[\.\!\?]+', clean_t) if s.strip()]
            if not sentences:
                sentences = [clean_t]
            
            sub_dur = (scaled_et - scaled_st) / max(1, len(sentences))
            for s_idx, sent in enumerate(sentences):
                c_st = scaled_st + s_idx * sub_dur
                c_et = min(total_duration, c_st + sub_dur)
                if c_st >= total_duration or c_et <= c_st:
                    continue
                words = sent.split()
                if len(words) > 7:
                    mid = len(words) // 2
                    line1 = ' '.join(words[:mid]).upper()
                    line2 = ' '.join(words[mid:]).upper()
                else:
                    line1 = sent.upper()
                    line2 = ""
                lines = [line1] if not line2 else [line1, line2]
                colors = [(255, 255, 255), (255, 230, 0)] if len(lines) > 1 else [(255, 230, 0)]
                chunks.append((c_st, c_et, lines, colors))

        if chunks and chunks[-1][1] < total_duration:
            last = chunks[-1]
            chunks[-1] = (last[0], total_duration, last[2], last[3])
    else:
        clean_text = clean_script_for_tts(script)
        words = clean_text.split()
        chunk_size = 6
        num_chunks = max(1, math.ceil(len(words) / chunk_size))
        step = total_duration / num_chunks
        for i in range(num_chunks):
            c_st = i * step
            c_et = min(total_duration, (i + 1) * step)
            cw = words[i * chunk_size : (i + 1) * chunk_size]
            if len(cw) > 3:
                mid = len(cw) // 2
                l1 = ' '.join(cw[:mid]).upper()
                l2 = ' '.join(cw[mid:]).upper()
                lines = [l1, l2]
                colors = [(255, 255, 255), (255, 230, 0) if i % 2 == 0 else (0, 240, 255)]
            else:
                lines = [' '.join(cw).upper()]
                colors = [(255, 230, 0)]
            chunks.append((c_st, c_et, lines, colors))
            
    return chunks

def generate_pure_cyberpunk_beat(duration: float, sr=24000, mood='neon_pulse') -> np.ndarray:
    n_samples = int(sr * duration)
    mood_lower = (mood or 'neon_pulse').lower()
    if 'phonk' in mood_lower:
        bpm = 138
        bass_notes = [49.0, 49.0, 58.2, 43.6]
        kick_freq_boost = 120.0
    elif 'synthwave' in mood_lower:
        bpm = 118
        bass_notes = [65.4, 55.0, 49.0, 41.2]
        kick_freq_boost = 85.0
    elif 'cinematic' in mood_lower or 'epic' in mood_lower:
        bpm = 124
        bass_notes = [43.6, 43.6, 51.9, 38.8]
        kick_freq_boost = 110.0
    elif 'chill' in mood_lower or 'lofi' in mood_lower:
        bpm = 92
        bass_notes = [65.4, 73.4, 58.2, 49.0]
        kick_freq_boost = 70.0
    else:
        bpm = 124
        bass_notes = [55.0, 55.0, 65.4, 49.0]
        kick_freq_boost = 95.0

    beat_interval = int(sr * (60.0 / bpm))
    music = np.zeros(n_samples, dtype=np.float32)

    num_beats = int(duration * (bpm / 60.0))
    for b in range(num_beats):
        idx = b * beat_interval
        kick_len = int(0.22 * sr)
        if idx + kick_len < n_samples:
            kt = np.linspace(0, 0.22, kick_len, endpoint=False)
            freq = 42.0 + kick_freq_boost * np.exp(-kt * 26.0)
            kick_env = np.exp(-kt * 19.0)
            phase = 2 * np.pi * np.cumsum(freq) / sr
            music[idx:idx+kick_len] += 0.38 * np.sin(phase) * kick_env

    for b in range(num_beats * 2):
        idx = int(b * (beat_interval / 2))
        hat_len = int(0.05 * sr)
        if idx + hat_len < n_samples:
            noise = np.random.uniform(-1, 1, hat_len)
            hat_env = np.exp(-np.linspace(0, 0.05, hat_len) * 65.0)
            music[idx:idx+hat_len] += 0.07 * noise * hat_env

    bass_notes = [55.0, 55.0, 65.4, 49.0]
    for b in range(num_beats):
        idx = b * beat_interval
        note_freq = bass_notes[(b // 4) % len(bass_notes)]
        plk_len = int(0.38 * sr)
        if idx + plk_len < n_samples:
            bt = np.linspace(0, 0.38, plk_len, endpoint=False)
            bass_env = np.exp(-bt * 6.5)
            bass = 0.16 * (np.sin(2 * np.pi * note_freq * bt) + 0.35 * np.sin(2 * np.pi * note_freq * 2 * bt)) * bass_env
            music[idx:idx+plk_len] += bass

    max_val = np.max(np.abs(music))
    if max_val > 0:
        music = (music / max_val) * 0.13
    return music

def load_sfx_sample(name: str, target_sr=24000) -> np.ndarray:
    search_dirs = [
        os.path.join(os.path.dirname(__file__), '../public/assets/sfx'),
        r'C:\Users\user\Downloads\sfx',
        os.path.join(os.path.dirname(__file__), '../public/sfx'),
        r'C:\Users\user\Downloads\jpilot\apps\server\public\assets\sfx'
    ]
    for d in search_dirs:
        p = os.path.join(d, name)
        if os.path.exists(p):
            try:
                with wave.open(p, 'rb') as w:
                    frames = w.readframes(w.getnframes())
                    data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
                    if w.getnchannels() == 2:
                        data = data[::2]
                    return data
            except Exception:
                pass
    return np.zeros(0, dtype=np.float32)

async def synthesize_speech(text: str, output_wav: str, ffmpeg_bin: str, voice_name: str = "en-US-ChristopherNeural", voice_preset: str = "energetic") -> float:
    temp_mp3 = output_wav.replace('.wav', '_temp.mp3')
    try:
        import edge_tts
        preset_lower = (voice_preset or 'energetic').lower()
        if 'mysterious' in preset_lower or 'deep' in preset_lower:
            rate = "-5%"
            pitch = "-2Hz"
        elif 'authoritative' in preset_lower or 'confident' in preset_lower:
            rate = "+10%"
            pitch = "+1Hz"
        elif 'calm' in preset_lower or 'story' in preset_lower:
            rate = "+0%"
            pitch = "+0Hz"
        else:
            rate = "+16%"
            pitch = "+2Hz"

        if voice_name.startswith("uz-") or voice_name.startswith("es-"):
            if 'mysterious' in preset_lower:
                rate = "-2%"
                pitch = "-1Hz"
            elif 'authoritative' in preset_lower:
                rate = "+5%"
                pitch = "+1Hz"
            elif 'calm' in preset_lower:
                rate = "+0%"
                pitch = "+0Hz"
            else:
                rate = "+8%"
                pitch = "+1Hz"

        communicate = edge_tts.Communicate(text, voice_name, rate=rate, pitch=pitch)
        await communicate.save(temp_mp3)

        cmd = [
            ffmpeg_bin, '-y', '-i', temp_mp3,
            '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le',
            output_wav
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if os.path.exists(temp_mp3):
            os.remove(temp_mp3)

        with wave.open(output_wav, 'rb') as w:
            frames = w.getnframes()
            rate = w.getframerate()
            return frames / float(rate)
    except Exception as e:
        print(f"⚠️ TTS synthesis error: {e}, falling back to speech simulator", file=sys.stderr)
        sr = 24000
        dur = 35.0
        n_frames = int(sr * dur)
        data = (np.sin(2 * np.pi * 300 * np.arange(n_frames) / sr) * 1000).astype(np.int16)
        with wave.open(output_wav, 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(data.tobytes())
        return dur

def apply_ken_burns(img_bgr: np.ndarray, progress: float, motion_type: int) -> np.ndarray:
    ih, iw = img_bgr.shape[:2]
    target_w, target_h = W, H
    scale = max(target_w / iw, target_h / ih) * 1.15
    base_w, base_h = int(iw * scale), int(ih * scale)
    base_img = cv2.resize(img_bgr, (base_w, base_h), interpolation=cv2.INTER_LANCZOS4)

    max_x = max(0, base_img.shape[1] - target_w)
    max_y = max(0, base_img.shape[0] - target_h)

    if motion_type == 0:
        # Dynamic punch zoom (Hook)
        if progress < 0.25:
            p = progress / 0.25
            zoom = 1.15 - 0.08 * math.sin(p * math.pi / 2)
        else:
            zoom = 1.07 + 0.04 * ((progress - 0.25) / 0.75)
        start_x = int(max_x * 0.5)
        start_y = int(max_y * (0.35 + 0.15 * progress))
    elif motion_type == 1:
        # Smooth slow pan left to right
        zoom = 1.05 + 0.03 * progress
        start_x = int(max_x * (0.25 + 0.50 * progress))
        start_y = int(max_y * 0.5)
    elif motion_type == 2:
        # Slow cinematic zoom in on center
        zoom = 1.02 + 0.08 * progress
        start_x = int(max_x * (0.65 - 0.30 * progress))
        start_y = int(max_y * (0.45 + 0.10 * progress))
    else:
        # Outro dynamic framing
        zoom = 1.08 - 0.05 * progress
        start_x = int(max_x * 0.5)
        start_y = int(max_y * (0.40 + 0.10 * progress))

    crop = base_img[start_y:start_y+target_h, start_x:start_x+target_w]
    if crop.shape[0] != target_h or crop.shape[1] != target_w:
        crop = cv2.resize(crop, (target_w, target_h))
    return crop

def classify_topic_category(item_id: str, title: str, tags: list = None, keywords: list = None, script: str = "") -> str:
    tags_str = ' '.join(tags) if isinstance(tags, list) else ''
    kw_str = ' '.join(str(k) for k in keywords) if isinstance(keywords, list) else ''
    text = f"{item_id} {title} {tags_str} {kw_str} {script[:500]}".lower()
    if any(k in text for k in ['prompt', 'dev', 'developer', 'code', 'coding', 'typescript', 'python', 'github', 'git', 'fullstack', 'css', 'tailwind', 'vitest', 'drizzle', 'senior architect', 'junior']):
        return 'coding_prompts'
    elif any(k in text for k in ['vs', 'deepseek', 'gemini', 'o3', 'gpt', 'claude', 'benchmark', 'model', 'reasoning', 'r1', 'llm', 'smarter', 'ai battle', 'duel']):
        return 'model_duel'
    elif any(k in text for k in ['illegal', 'website', 'dark', 'secret site', 'free tools', 'web', 'browser', 'extensions', 'tools', 'hacker']):
        return 'secret_tools'
    elif any(k in text for k in ['agent', 'crewai', 'autogen', 'swarm', 'autonomous', 'workflow', 'bot', 'multi-agent']):
        return 'agent_swarm'
    return 'tech_breakthrough'

def generate_topic_procedural_scenes(item_id: str, title: str, scenes_data: list, high_cpm_keywords: list, save_dirs: list, script: str = "", tags: list = None) -> dict:
    topic_cat = classify_topic_category(item_id, title, tags, high_cpm_keywords, script)
    
    # Category-tailored color palettes & identity
    if topic_cat == 'coding_prompts':
        pal_name = 'matrix_emerald'
        primary = (0, 255, 140)
        secondary = (0, 220, 255)
        bg_top = (6, 20, 24)
        bg_bot = (3, 10, 14)
        accent = (255, 200, 50)
        badge_prefix = "[ 2026 DEVELOPER BLUEPRINT ]"
    elif topic_cat == 'model_duel':
        pal_name = 'crimson_alert'
        primary = (255, 50, 75)
        secondary = (0, 240, 255)
        bg_top = (24, 10, 16)
        bg_bot = (10, 5, 8)
        accent = (255, 185, 40)
        badge_prefix = "[ 2026 AI BENCHMARK DUEL ]"
    elif topic_cat == 'secret_tools':
        pal_name = 'cyber_amber'
        primary = (255, 185, 40)
        secondary = (190, 60, 255)
        bg_top = (18, 12, 28)
        bg_bot = (8, 6, 14)
        accent = (0, 255, 200)
        badge_prefix = "[ RESTRICTED SITES ARCHIVE ]"
    elif topic_cat == 'agent_swarm':
        pal_name = 'ultraviolet'
        primary = (220, 70, 255)
        secondary = (0, 230, 255)
        bg_top = (20, 10, 32)
        bg_bot = (8, 5, 16)
        accent = (0, 255, 160)
        badge_prefix = "[ AUTONOMOUS AGENT PROTOCOL ]"
    else:
        pal_name = 'quantum_cyan'
        primary = (0, 235, 255)
        secondary = (40, 130, 255)
        bg_top = (8, 16, 32)
        bg_bot = (4, 8, 16)
        accent = (255, 200, 40)
        badge_prefix = "! 2026 EXCLUSIVE AI REPORT !"

    font_hero = get_font(52, bold=True)
    font_sub = get_font(28, bold=False)
    font_mono = get_mono_font(24)
    font_title = get_font(36, bold=True)
    font_badge = get_font(22, bold=True)

    scenes_res = {}
    is_landscape = (W > H)

    for s_idx in range(1, 6):
        canvas = np.zeros((H, W, 3), dtype=np.uint8)
        for y in range(H):
            ratio = y / float(H)
            r = int(bg_top[0] * (1 - ratio) + bg_bot[0] * ratio)
            g = int(bg_top[1] * (1 - ratio) + bg_bot[1] * ratio)
            b = int(bg_top[2] * (1 - ratio) + bg_bot[2] * ratio)
            canvas[y, :] = (r, g, b)

        grid_start = int(H * 0.45) if is_landscape else 800
        for gy in range(grid_start, H, 50 if is_landscape else 60):
            p_val = (gy - grid_start) / float(max(1, H - grid_start))
            col_grid = (int(secondary[0] * 0.25 * p_val), int(secondary[1] * 0.25 * p_val), int(secondary[2] * 0.25 * p_val))
            cv2.line(canvas, (0, gy), (W, gy), col_grid, 1)
        
        vanish_x = W // 2
        vanish_y = int(H * 0.40) if is_landscape else 750
        for gx in range(0, W + 1, 90):
            col_grid = (int(primary[0] * 0.18), int(primary[1] * 0.18), int(primary[2] * 0.18))
            cv2.line(canvas, (vanish_x, vanish_y), (gx, H), col_grid, 1)

        img_pil = Image.fromarray(canvas)
        draw = ImageDraw.Draw(img_pil, 'RGBA')

        if s_idx == 1:
            # === SCENE 1: TOPIC HOOK CARD ===
            if is_landscape:
                cx, cy = int(W * 0.28), int(H * 0.48)
                draw.rounded_rectangle([60, int(H * 0.18), int(W * 0.48), int(H * 0.82)], radius=24, fill=(10, 16, 26, 235), outline=(*primary, 180), width=2)
                draw.text((90, int(H * 0.22)), badge_prefix, font=font_badge, fill=(*accent, 255))
                draw.text((90, int(H * 0.30)), "PRODUCTION SYSTEM PROMPT", font=font_title, fill=(255, 255, 255))
                draw.text((90, int(H * 0.40)), "> /act-as: Principal Engineer L7", font=font_mono, fill=(*primary, 240))
                draw.text((90, int(H * 0.48)), "> /critique: Concurrency & memory leaks", font=font_mono, fill=(*secondary, 240))
                draw.text((90, int(H * 0.56)), "> /reverse: 5 questions before code", font=font_mono, fill=(*accent, 240))
                
                card_box = [int(W * 0.52), int(H * 0.18), int(W * 0.94), int(H * 0.82)]
                draw.rounded_rectangle(card_box, radius=24, fill=(12, 16, 26, 230), outline=(*secondary, 160), width=2)
                draw.text((card_box[0] + 30, card_box[1] + 30), "VERIFIED BLUEPRINT", font=font_badge, fill=(*primary, 255))
                clean_t = sanitize_text(title).upper()
                draw.text((card_box[0] + 30, card_box[1] + 90), clean_t[:36], font=font_title, fill=(255, 255, 255))
            else:
                if topic_cat == 'coding_prompts':
                    draw.rounded_rectangle([70, 360, W - 70, 780], radius=24, fill=(10, 18, 26, 240), outline=(*primary, 180), width=2)
                    draw.rounded_rectangle([70, 360, W - 70, 420], radius=24, fill=(16, 26, 36, 240))
                    draw.ellipse([95, 382, 115, 402], fill=(255, 75, 75))
                    draw.ellipse([125, 382, 145, 402], fill=(255, 200, 50))
                    draw.ellipse([155, 382, 175, 402], fill=(50, 220, 100))
                    draw.text((200, 382), "prompt://principal-engineer/v2026", font=font_mono, fill=(120, 200, 160))
                    
                    draw.text((100, 440), badge_prefix, font=font_badge, fill=(*accent, 255))
                    draw.text((100, 485), '> SYSTEM: "Act as Google Principal Engineer"', font=font_mono, fill=(255, 255, 255))
                    draw.text((100, 535), '  "Critique TypeScript for edge-case memory leaks"', font=font_mono, fill=(*secondary, 240))
                    draw.text((100, 595), '> REVERSE: "Ask 5 clarifying questions first"', font=font_mono, fill=(*primary, 255))
                    draw.text((100, 645), '  "Before writing a single line of production code"', font=font_mono, fill=(200, 210, 230))
                    
                    pills = ["[ TypeScript 5.8 ]", "[ Vitest 100% ]", "[ Zero-Runtime ]"]
                    for pi, p_txt in enumerate(pills):
                        px = 100 + pi * 270
                        draw.rounded_rectangle([px, 710, px + 250, 755], radius=12, fill=(*primary, 30), outline=(*primary, 140), width=1)
                        draw.text((px + 18, 722), p_txt, font=font_badge, fill=(*primary, 255))
                elif topic_cat == 'model_duel':
                    draw.rounded_rectangle([70, 360, W - 70, 780], radius=24, fill=(18, 12, 22, 240), outline=(*primary, 180), width=2)
                    draw.text((100, 390), badge_prefix, font=font_badge, fill=(*accent, 255))
                    draw.rounded_rectangle([95, 440, W // 2 - 20, 680], radius=18, fill=(30, 12, 20, 230), outline=(*primary, 180), width=2)
                    draw.text((115, 465), "DEEPSEEK R1", font=font_title, fill=(255, 255, 255))
                    draw.text((115, 520), "Reasoning: 99.4%", font=font_sub, fill=(*primary, 255))
                    draw.text((115, 570), "Open Source Local", font=font_mono, fill=(200, 200, 200))
                    draw.text((115, 620), "$0.14 / 1M Tokens", font=font_mono, fill=(50, 255, 120))
                    
                    draw.rounded_rectangle([W // 2 + 20, 440, W - 95, 680], radius=18, fill=(10, 22, 35, 230), outline=(*secondary, 180), width=2)
                    draw.text((W // 2 + 40, 465), "OPENAI o3", font=font_title, fill=(255, 255, 255))
                    draw.text((W // 2 + 40, 520), "Logic: 99.7%", font=font_sub, fill=(*secondary, 255))
                    draw.text((W // 2 + 40, 570), "Cloud Proprietary", font=font_mono, fill=(200, 200, 200))
                    draw.text((W // 2 + 40, 620), "$200 / Month", font=font_mono, fill=(255, 80, 80))
                    
                    draw.ellipse([W // 2 - 35, 535, W // 2 + 35, 605], fill=(12, 10, 20, 255), outline=(255, 220, 50), width=3)
                    draw.text((W // 2 - 18, 555), "VS", font=font_title, fill=(255, 220, 50))
                else:
                    cx, cy = W // 2, 570
                    for radius in [240, 190, 140]:
                        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(*primary, 80), width=2)
                    draw.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(*bg_top, 220), outline=(*accent, 220), width=3)
                    draw.line([(cx - 260, cy), (cx + 260, cy)], fill=(*primary, 90), width=2)
                    draw.line([(cx, cy - 260), (cx, cy + 260)], fill=(*primary, 90), width=2)
                    draw.rounded_rectangle([cx - 180, cy - 25, cx + 180, cy + 25], radius=14, fill=(10, 12, 20, 230), outline=(*primary, 240), width=2)
                    draw.text((cx - 140, cy - 10), badge_prefix, font=font_badge, fill=(*primary, 255))

                card_box = [70, 830, W - 70, 1160]
                draw.rounded_rectangle(card_box, radius=24, fill=(12, 16, 26, 235), outline=(*primary, 160), width=2)
                tag_box = [card_box[0] + 25, card_box[1] + 25, card_box[0] + 260, card_box[1] + 68]
                draw.rounded_rectangle(tag_box, radius=12, fill=(*primary, 40), outline=(*primary, 200), width=1)
                draw.text((tag_box[0] + 20, tag_box[1] + 10), "TARGET TOPIC", font=font_badge, fill=(*primary, 255))
                
                clean_t = sanitize_text(title).upper()
                w_words = clean_t.split()
                lines = []
                cur_line = ""
                max_line_w = card_box[2] - card_box[0] - 50
                for word in w_words:
                    test = f"{cur_line} {word}".strip()
                    if get_text_width(draw, test, font_title) < max_line_w:
                        cur_line = test
                    else:
                        if cur_line: lines.append(cur_line)
                        cur_line = word
                if cur_line: lines.append(cur_line)
                lines = lines[:3]
                for li, line_str in enumerate(lines):
                    draw.text((card_box[0] + 25, card_box[1] + 90 + li * 48), line_str, font=font_title, fill=(255, 255, 255))

        elif s_idx == 2:
            # === SCENE 2: CORE BREAKDOWN & METRIC CARDS ===
            sc2_title = sanitize_text(scenes_data[1].get('title', 'PILLAR 1: ARCHITECTURE') if len(scenes_data) > 1 else 'PILLAR 1: ARCHITECTURE').upper()[:34]
            draw.rounded_rectangle([70, 240, W - 70, 360], radius=24, fill=(12, 16, 28, 235), outline=(*secondary, 180), width=2)
            draw.text((105, 265), "DEEP ANALYSIS & STRATEGY", font=font_badge, fill=(*accent, 255))
            draw.text((105, 305), sc2_title, font=font_title, fill=(255, 255, 255))

            if topic_cat == 'coding_prompts':
                card1_title = "PROMPT 1: SENIOR ARCHITECT"
                card1_sub = "Full TypeScript edge-case & memory leak audit"
                card1_metric = "10x Speed"
                card2_title = "PROMPT 2: REVERSE PROMPT"
                card2_sub = "5 Clarifying questions before writing single line"
                card2_metric = "100% Precision"
            elif topic_cat == 'model_duel':
                card1_title = "ROUND 1: LEETCODE HARD"
                card1_sub = "Recursive DP chain-of-thought optimization"
                card1_metric = "18s Solver"
                card2_title = "ROUND 2: COST PER TOKEN"
                card2_sub = "Open source local inference vs cloud pricing"
                card2_metric = "95% Savings"
            else:
                card1_title = sanitize_text(str(high_cpm_keywords[0])).upper()[:24] if len(high_cpm_keywords) > 0 else "AUTONOMOUS PIPELINE"
                card1_sub = "Performance: 10x Efficiency Multiplier"
                card1_metric = "99.4%"
                card2_title = sanitize_text(str(high_cpm_keywords[1])).upper()[:24] if len(high_cpm_keywords) > 1 else "ZERO LATENCY CLUSTER"
                card2_sub = "Verification: Production Ready Systems"
                card2_metric = "100%"

            draw.rounded_rectangle([70, 420, W - 70, 620], radius=20, fill=(10, 18, 30, 235), outline=(*primary, 160), width=2)
            draw.text((105, 450), card1_title, font=font_title, fill=(255, 255, 255))
            draw.text((105, 510), card1_sub, font=font_sub, fill=(*accent, 230))
            draw.text((W - 270, 540), card1_metric, font=font_hero, fill=(*primary, 255))

            draw.rounded_rectangle([70, 660, W - 70, 860], radius=20, fill=(10, 18, 30, 235), outline=(*secondary, 160), width=2)
            draw.text((105, 690), card2_title, font=font_title, fill=(255, 255, 255))
            draw.text((105, 750), card2_sub, font=font_sub, fill=(*accent, 230))
            draw.text((W - 270, 780), card2_metric, font=font_hero, fill=(*secondary, 255))

        elif s_idx == 3:
            # === SCENE 3: TEST RUNNER / BENCHMARK / DEEP TECHNIQUE ===
            sc3_title = sanitize_text(scenes_data[2].get('title', 'PILLAR 2: DEEP TECHNIQUE') if len(scenes_data) > 2 else 'PILLAR 2: DEEP TECHNIQUE').upper()[:34]
            card_box = [70, 240, W - 70, 1100]
            draw.rounded_rectangle(card_box, radius=26, fill=(10, 14, 24, 240), outline=(*primary, 160), width=2)
            draw.text((card_box[0] + 35, card_box[1] + 30), sc3_title, font=font_title, fill=(*primary, 255))
            draw.text((card_box[0] + 35, card_box[1] + 80), "Production Verification & Coverage Audit", font=font_sub, fill=(180, 200, 220))

            if topic_cat == 'coding_prompts':
                draw.rounded_rectangle([card_box[0] + 35, card_box[1] + 130, card_box[2] - 35, card_box[1] + 180], radius=12, fill=(18, 26, 38, 240))
                draw.text((card_box[0] + 55, card_box[1] + 145), "vitest://test-runner/boundary-mutation", font=font_mono, fill=(120, 210, 160))
                
                test_items = [
                    ("PASS src/memory-leak.spec.ts (18 tests)", (50, 255, 120)),
                    ("PASS src/architecture-audit.spec.ts (24 tests)", (50, 255, 120)),
                    ("PASS src/boundary-mutations.spec.ts (36 tests)", (50, 255, 120)),
                    ("--------------------------------------------------", (100, 120, 140)),
                    ("Statements: 100% | Branches: 98.6% | Funcs: 100%", (*accent, 255)),
                    ("[OK] Zero Memory Leaks in V8 Heap Profiler", (50, 255, 120)),
                    ("[OK] Boundary Mutation Coverage: 100% Passed", (50, 255, 120)),
                    (">>> SAVE THIS VIDEO TO KEEP EXACT PROMPT SYNTAX <<<", (*secondary, 255))
                ]
                for ti, (t_txt, t_col) in enumerate(test_items):
                    draw.text((card_box[0] + 55, card_box[1] + 210 + ti * 68), t_txt, font=font_mono, fill=t_col)
            else:
                nodes = [
                    (200, 480), (200, 620), (200, 760), (200, 900),
                    (540, 420), (540, 560), (540, 700), (540, 840), (540, 980),
                    (880, 520), (880, 680), (880, 840)
                ]
                for n1 in nodes[:4]:
                    for n2 in nodes[4:9]:
                        draw.line([n1, n2], fill=(*secondary, 60), width=2)
                for n1 in nodes[4:9]:
                    for n2 in nodes[9:]:
                        draw.line([n1, n2], fill=(*primary, 60), width=2)
                for (nx, ny) in nodes:
                    draw.ellipse([nx - 22, ny - 22, nx + 22, ny + 22], fill=(*bg_top, 240), outline=(*accent, 230), width=3)
                    draw.ellipse([nx - 8, ny - 8, nx + 8, ny + 8], fill=(*primary, 255))

        elif s_idx == 4:
            # === SCENE 4: PRODUCTION CLUSTER / PIPELINE EXECUTION ===
            sc4_title = sanitize_text(scenes_data[3].get('title', 'PILLAR 3: PRODUCTION DEPLOY') if len(scenes_data) > 3 else 'PILLAR 3: PRODUCTION DEPLOY').upper()[:34]
            card_box = [70, 240, W - 70, 1140]
            draw.rounded_rectangle(card_box, radius=24, fill=(6, 12, 10, 245), outline=(*accent, 160), width=2)
            draw.ellipse([card_box[0] + 35, card_box[1] + 30, card_box[0] + 55, card_box[1] + 50], fill=(255, 70, 70))
            draw.ellipse([card_box[0] + 70, card_box[1] + 30, card_box[0] + 90, card_box[1] + 50], fill=(255, 200, 50))
            draw.ellipse([card_box[0] + 105, card_box[1] + 30, card_box[0] + 125, card_box[1] + 50], fill=(50, 220, 100))
            draw.text((card_box[0] + 150, card_box[1] + 28), f"terminal://neuralpulse/{topic_cat}", font=font_mono, fill=(120, 180, 140))
            draw.line([(card_box[0], card_box[1] + 65), (card_box[2], card_box[1] + 65)], fill=(*accent, 80), width=1)

            if topic_cat == 'coding_prompts':
                t_lines = [
                    (f"$ pnpm run deploy:production --target \"{sanitize_text(title)[:24]}\"", (*primary, 255)),
                    ("[DRIZZLE] Synthesizing zero-downtime schema migrations...", (180, 190, 200)),
                    ("[TAILWIND] Compiling zero-runtime CSS tokens & layouts...", (*secondary, 255)),
                    ("[VITEST] 128 / 128 Boundary Unit Tests Passed (14ms)", (50, 255, 120)),
                    ("[STATUS] Clean architecture deployed with zero memory leaks", (50, 255, 120)),
                    ("[DEPLOY] Cloud edge workers synchronized globally", (*accent, 255)),
                    (">>> 100% PRODUCTION VERIFIED <<<", (50, 255, 120))
                ]
            else:
                t_lines = [
                    (f"$ run-engine --topic \"{sanitize_text(title)[:28]}\"", (*primary, 255)),
                    ("[INIT] Loading neural weights & models...", (180, 190, 200)),
                    ("[BENCHMARK] Executing high-throughput inference test...", (*secondary, 255)),
                    ("[PASSED] 128 / 128 Test Suites Succeeded in 18ms", (50, 255, 120)),
                    ("[STATUS] Zero-latency distributed inference active", (50, 255, 120)),
                    ("[DEPLOY] Live production cluster ready and verified", (*accent, 255)),
                    (">>> 100% PRODUCTION VERIFIED <<<", (50, 255, 120))
                ]
            for li, (txt, col) in enumerate(t_lines):
                draw.text((card_box[0] + 35, card_box[1] + 95 + li * 95), txt, font=font_mono, fill=col)

        else:
            # === SCENE 5: OUTRO / COMMUNITY QUESTION (ZERO STATIC DUPLICATE BUTTONS!) ===
            q_text = ""
            if script:
                q_matches = re.findall(r'([A-Z][a-zA-Z0-9\s,\'\"\-]{10,65}\?)', script)
                if q_matches:
                    q_text = sanitize_text(q_matches[-1]).strip().upper()
            if not q_text:
                if topic_cat == 'coding_prompts':
                    q_text = "WHICH PROMPT WILL YOU TEST FIRST?"
                elif topic_cat == 'model_duel':
                    q_text = "WHICH AI MODEL DO YOU PREFER?"
                elif topic_cat == 'secret_tools':
                    q_text = "WHICH TOOL WILL YOU BOOKMARK?"
                else:
                    q_text = "SHARE YOUR THOUGHTS IN THE COMMENTS!"

            cx, cy = (W // 2, int(H * 0.44)) if is_landscape else (W // 2, 600)
            box_hw = 380 if is_landscape else 420
            box_hh = 120 if is_landscape else 130
            q_box = [cx - box_hw, cy - box_hh, cx + box_hw, cy + box_hh]
            draw.rounded_rectangle(q_box, radius=24, fill=(14, 18, 30, 240), outline=(*primary, 180), width=3)
            
            badge_txt = "[ COMMUNITY QUESTION ]"
            bw = get_text_width(draw, badge_txt, font_badge)
            draw.rounded_rectangle([cx - bw // 2 - 20, q_box[1] + 20, cx + bw // 2 + 20, q_box[1] + 60], radius=10, fill=(*primary, 40), outline=(*primary, 180), width=1)
            draw.text((cx - bw // 2, q_box[1] + 28), badge_txt, font=font_badge, fill=(*primary, 255))
            
            qw_words = q_text.split()
            qlines = []
            cur_ql = ""
            max_ql_w = (box_hw * 2) - 60
            for qw in qw_words:
                test = f"{cur_ql} {qw}".strip()
                if get_text_width(draw, test, font_title) < max_ql_w:
                    cur_ql = test
                else:
                    if cur_ql: qlines.append(cur_ql)
                    cur_ql = qw
            if cur_ql: qlines.append(cur_ql)
            qlines = qlines[:2]
            
            for qli, q_line in enumerate(qlines):
                tw = get_text_width(draw, q_line, font_title)
                draw.text((cx - tw // 2, q_box[1] + 80 + qli * 46), q_line, font=font_title, fill=(255, 255, 255))
                
            sub_cta = "> Drop a comment below & save this video <"
            sc_w = get_text_width(draw, sub_cta, font_sub)
            draw.text((cx - sc_w // 2, q_box[1] + 80 + len(qlines) * 46 + 10), sub_cta, font=font_sub, fill=(*accent, 240))

        out_rgb = img_pil.convert('RGB')
        out_bgr = cv2.cvtColor(np.array(out_rgb), cv2.COLOR_RGB2BGR)

        for sd in save_dirs:
            try:
                os.makedirs(sd, exist_ok=True)
                out_path = os.path.join(sd, f"scene_{s_idx}.jpg")
                cv2.imwrite(out_path, out_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
            except Exception:
                pass

        scenes_res[s_idx] = out_bgr

    print(f"✨ Automatically generated 5 unique topic-isolated procedural scenes for [{item_id}] (Category: {topic_cat}, Palette: {pal_name})!", flush=True)
    return scenes_res

def generate_smart_thumbnail(data: dict, output_thumb_path: str, host_path: str = None, palette_info=None):
    """
    Creates Ultra-High CTR 1080x1920 (Vertical Shorts) & 1280x720 (YouTube Landscape) thumbnails:
    - Bold 3D Kinetic Hook typography with thick stroke & shadow
    - Glowing neon alert pill at the top
    - High-contrast background with radial vignette & topic visual accents
    - Prominent Host Alex placement with edge lighting
    - High-CTR ROI badge
    """
    is_long = data.get('videoFormat') == 'long_form'
    W_T, H_T = (1920, 1080) if is_long else (1080, 1920)
    canvas = Image.new('RGB', (W_T, H_T), (10, 12, 20))
    draw = ImageDraw.Draw(canvas, 'RGBA')

    pri = (0, 240, 255)
    sec = (255, 60, 100)
    acc = (255, 215, 0)
    if palette_info and len(palette_info) >= 5:
        pri = palette_info[1]
        sec = palette_info[2]
        acc = palette_info[3]

    for y in range(H_T):
        prog = y / H_T
        r = int(12 + prog * 18)
        g = int(14 + prog * 10)
        b = int(24 + prog * 28)
        draw.line([(0, y), (W_T, y)], fill=(r, g, b))

    cx, cy = (int(W_T * 0.72), int(H_T * 0.50)) if is_long else (W_T // 2, 680)
    for rad in range(380, 40, -25):
        alpha = int(35 * (1.0 - rad / 380))
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(*pri, alpha))

    if host_path and os.path.exists(host_path):
        try:
            h_img = Image.open(host_path).convert('RGBA')
            target_h = int(H_T * 0.92) if is_long else int(H_T * 0.58)
            ratio = target_h / h_img.height
            target_w = int(h_img.width * ratio)
            h_resized = h_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            pos_x = (W_T - target_w - 60) if is_long else ((W_T - target_w) // 2)
            pos_y = H_T - target_h
            canvas.paste(h_resized, (pos_x, pos_y), h_resized if h_resized.mode == 'RGBA' else None)
        except Exception:
            pass

    draw = ImageDraw.Draw(canvas, 'RGBA')

    grad_top_h = int(H_T * 0.28) if is_long else 580
    for y in range(0, grad_top_h):
        alpha = int(230 * (1.0 - y / grad_top_h))
        draw.line([(0, y), (W_T, y)], fill=(8, 10, 16, alpha))

    grad_bot_y = int(H_T * 0.78) if is_long else 1380
    for y in range(grad_bot_y, H_T):
        alpha = int(240 * ((y - grad_bot_y) / (H_T - grad_bot_y)))
        draw.line([(0, y), (W_T, y)], fill=(8, 10, 16, alpha))

    pill_text = "! 2026 AI MASTERCLASS !" if is_long else "! 2026 AI BLUEPRINT !"
    f_badge = get_font(34, bold=True)
    tw = draw.textlength(pill_text, font=f_badge) if hasattr(draw, 'textlength') else 380
    px = 80 if is_long else (W_T // 2 - int(tw) // 2)
    py = 80 if is_long else 120
    draw.rounded_rectangle([px - 20, py, px + int(tw) + 20, py + 70], radius=24, fill=(230, 25, 45, 240), outline=(255, 220, 50, 240), width=3)
    draw.text((px, py + 14), pill_text, font=f_badge, fill=(255, 255, 255))

    raw_title = sanitize_text(data.get('title', 'Top AI Tools That Work While You Sleep'))
    clean_title_no_tags = re.sub(r'#\w+', '', raw_title).strip()
    words = clean_title_no_tags.split()

    lines = []
    if len(words) <= 4:
        lines = [" ".join(words[:2]).upper(), " ".join(words[2:]).upper()]
    elif len(words) <= 7:
        lines = [" ".join(words[:2]).upper(), " ".join(words[2:5]).upper(), " ".join(words[5:]).upper()]
    else:
        lines = [" ".join(words[:3]).upper(), " ".join(words[3:6]).upper(), " ".join(words[6:9]).upper()]
    lines = [l for l in lines if l.strip()]

    f_huge = get_font(74 if not is_long else 68, bold=True)
    y_start = 220 if is_long else 240
    max_title_w = int(W_T * 0.58) if is_long else (W_T - 140)

    for i, line in enumerate(lines[:3]):
        lw = draw.textlength(line, font=f_huge) if hasattr(draw, 'textlength') else 500
        curr_f = f_huge
        if lw > max_title_w:
            scale_f_size = int(68 * max_title_w / max(1, lw))
            curr_f = get_font(max(38, scale_f_size), bold=True)
            lw = draw.textlength(line, font=curr_f) if hasattr(draw, 'textlength') else max_title_w

        lx = 80 if is_long else ((W_T - int(lw)) // 2)
        ly = y_start + i * (95 if is_long else 105)

        for off in range(6, 0, -1):
            draw.text((lx + off, ly + off), line, font=curr_f, fill=(0, 0, 0, 240))
        fill_color = (255, 255, 255) if i == 0 else ((*pri, 255) if i == 1 else (255, 225, 40))
        draw.text((lx, ly), line, font=curr_f, fill=fill_color, stroke_width=4, stroke_fill=(10, 10, 15))

    proof_text = ">>> 100% PRODUCTION MASTERCLASS <<<" if is_long else ">>> 100% AUTONOMOUS <<<"
    f_proof = get_font(30 if is_long else 32, bold=True)
    pw = draw.textlength(proof_text, font=f_proof) if hasattr(draw, 'textlength') else 360
    p_box_x = 80 if is_long else (W_T // 2 - int(pw)//2)
    p_box_y = int(H_T * 0.82) if is_long else 1720
    draw.rounded_rectangle([p_box_x - 15, p_box_y, p_box_x + int(pw) + 25, p_box_y + 75], radius=20, fill=(15, 25, 45, 230), outline=(*pri, 220), width=3)
    draw.text((p_box_x, p_box_y + 18), proof_text, font=f_proof, fill=(*pri, 255))

    os.makedirs(os.path.dirname(output_thumb_path), exist_ok=True)
    canvas.save(output_thumb_path, format='JPEG', quality=95)
    print(f"🖼️ [Smart Thumbnail] {W_T}x{H_T} High-CTR Thumbnail saqlandi: {output_thumb_path}", flush=True)

    landscape_path = output_thumb_path.replace('_thumb.jpg', '_thumb_landscape.jpg')
    if not is_long:
        try:
            crop_area = canvas.crop((0, 140, 1080, 1080 + 140)).resize((1280, 720), Image.Resampling.LANCZOS)
            crop_area.save(landscape_path, format='JPEG', quality=92)
        except Exception:
            pass
    else:
        try:
            canvas.resize((1280, 720), Image.Resampling.LANCZOS).save(landscape_path, format='JPEG', quality=92)
        except Exception:
            pass

def render_video(data: dict, output_mp4: str, voice_override: str = None, host_override: str = None, music_mood_override: str = None, voice_preset_override: str = None, beat_sync: bool = True, format_override: str = None):
    global W, H
    ffmpeg_bin = get_ffmpeg_bin()
    is_long = (format_override == 'landscape') or (data.get('videoFormat') == 'long_form')
    if is_long:
        W, H = 1920, 1080
        print(f"📺 [16:9 Long-Form Masterclass Mode] Rendering Full HD {W}x{H} Landscape Video...", flush=True)
    else:
        W, H = 1080, 1920
        print(f"⚡ [9:16 Shorts Mode] Rendering Ultra-HD {W}x{H} Vertical Video...", flush=True)
    
    title = data.get('title', 'Neural Pulse AI')
    clean_title = sanitize_text(title)
    item_id = str(data.get('id', '') or 'item_render')
    script = data.get('script', '')
    binge_teaser = sanitize_text(data.get('bingeTeaser') or data.get('seriesNextTeaser') or '')

    voice_name = voice_override or data.get('voiceModel') or data.get('voice') or "en-US-ChristopherNeural"
    voice_preset = voice_preset_override or data.get('voiceEmotionPreset') or data.get('voicePreset') or 'energetic'

    temp_dir = os.path.join(os.path.dirname(output_mp4), f"tmp_{data.get('id', 'render')}")
    os.makedirs(temp_dir, exist_ok=True)

    voice_wav = os.path.join(temp_dir, 'voice.wav')
    final_audio = os.path.join(temp_dir, 'final_audio.wav')
    raw_video = os.path.join(temp_dir, 'raw_video.mp4')

    print(f"🎙️ Step 1/3: Synthesizing Azure Neural Voice [{voice_name}] (Preset: {voice_preset}) for '{clean_title}'...", flush=True)
    tts_text = clean_script_for_tts(script)
    if not tts_text:
        tts_text = f"Welcome to Neural Pulse AI. Today we analyze: {clean_title}."

    duration = asyncio.run(synthesize_speech(tts_text, voice_wav, ffmpeg_bin, voice_name=voice_name, voice_preset=voice_preset))
    if not is_long and duration > 58.0:
        duration = 58.0
    elif not is_long and duration < 24.0:
        duration = 28.0

    print(f"🎵 Step 2/3: Generating pure cyberpunk beat and mixing audio (Duration: {duration:.2f}s)...", flush=True)
    
    sr = 24000
    with wave.open(voice_wav, 'rb') as w:
        speech_raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

    total_samples = int(duration * sr)
    if len(speech_raw) < total_samples:
        speech = np.pad(speech_raw, (0, total_samples - len(speech_raw)))
    else:
        speech = speech_raw[:total_samples]

    music_mood = (music_mood_override or data.get('backgroundMusicMood') or data.get('musicMood') or 'neon_pulse').strip().lower()
    beat = generate_pure_cyberpunk_beat(duration, sr=sr, mood=music_mood)

    sfx_track = np.zeros(total_samples, dtype=np.float32)
    sfx_sub = load_sfx_sample('sub_drop.wav', sr)
    sfx_whoosh = load_sfx_sample('whoosh.wav', sr)
    sfx_bell = load_sfx_sample('bell_ding.wav', sr)

    def add_sfx(target, sfx, t_pos, vol=0.5):
        if len(sfx) == 0: return
        start_idx = int(t_pos * sr)
        end_idx = min(len(target), start_idx + len(sfx))
        copy_len = end_idx - start_idx
        if copy_len > 0:
            target[start_idx:end_idx] += sfx[:copy_len] * vol

    add_sfx(sfx_track, sfx_sub, 0.15, vol=0.60)
    add_sfx(sfx_track, sfx_whoosh, 0.15, vol=0.45)
    add_sfx(sfx_track, sfx_bell, max(0.0, duration - 4.5), vol=0.55)

    subtitles = parse_timed_subtitles(script, duration)

    # Dynamic scene boundaries derived from script timestamps or scenes metadata
    scenes_meta = data.get('scenes', []) if isinstance(data.get('scenes'), list) else []
    script_time_pattern = re.compile(r'\[(\d+):(\d+)\s*-\s*(\d+):(\d+)\]')
    script_intervals = list(script_time_pattern.finditer(script))

    found_cuts = []
    if len(script_intervals) >= 4:
        last_m = script_intervals[-1]
        script_max_sec = float(last_m.group(3)) * 60 + float(last_m.group(4))
        scale = (duration / script_max_sec) if script_max_sec > 10 else 1.0
        for m in script_intervals[1:]:
            st = (float(m.group(1)) * 60 + float(m.group(2))) * scale
            if 1.0 < st < duration - 1.0:
                found_cuts.append(st)
    elif len(scenes_meta) >= 4 and any(isinstance(s, dict) and s.get('time', 0) > 0 for s in scenes_meta):
        times = [float(s.get('time', 0)) for s in scenes_meta if isinstance(s, dict)]
        meta_dur = max(times[-1] + 8.0, float(data.get('durationSeconds', duration)))
        scale = (duration / meta_dur) if meta_dur > 10 else 1.0
        for t in times[1:]:
            st = t * scale
            if 1.0 < st < duration - 1.0:
                found_cuts.append(st)

    if len(found_cuts) >= 4:
        sc1_end = found_cuts[0]
        sc2_end = found_cuts[1]
        sc3_end = found_cuts[2]
        sc4_end = found_cuts[3]
        sc5_end = found_cuts[4] if len(found_cuts) > 4 else duration * 0.96
    elif len(found_cuts) == 3:
        sc1_end, sc2_end, sc3_end = found_cuts
        sc4_end = sc3_end + (duration - sc3_end) * 0.5
        sc5_end = duration * 0.96
    else:
        sc1_end = duration * 0.18
        sc2_end = duration * 0.38
        sc3_end = duration * 0.58
        sc4_end = duration * 0.78
        sc5_end = duration * 0.95

    sc6_start = sc4_end  # Outro CTA starts with Scene 5
    scene_cuts = [sc1_end, sc2_end, sc3_end, sc4_end]

    if beat_sync:
        bpm = 138 if 'phonk' in music_mood else (118 if 'synthwave' in music_mood else (92 if ('chill' in music_mood or 'lofi' in music_mood) else 124))
        beat_dur = 60.0 / bpm
        snapped_cuts = []
        for c in scene_cuts:
            beat_c = round(c / beat_dur) * beat_dur
            if abs(beat_c - c) <= 0.45:
                snapped_cuts.append(beat_c)
            else:
                snapped_cuts.append(c)
        sc1_end, sc2_end, sc3_end, sc4_end = snapped_cuts
        sc6_start = sc4_end
        scene_cuts = snapped_cuts
        print(f"🥁 [Beat-Sync] Sahna o'tishlari musiqa zarbasiga (BPM: {bpm}) sinxronlandi: {[round(c, 2) for c in scene_cuts]}", flush=True)

    for cut in scene_cuts:
        add_sfx(sfx_track, sfx_whoosh, cut, vol=0.35)

    # Dynamic Audio Auto-Ducking:
    # Compute vocal energy envelope and smoothly duck background beat by ~10dB during active speech
    speech_env = np.abs(speech)
    win_samples = int(0.12 * sr)
    if win_samples > 1:
        kernel = np.ones(win_samples, dtype=np.float32) / win_samples
        speech_env = np.convolve(speech_env, kernel, mode='same')

    # duck_gain drops down to 0.32 when speech is active, rises to 1.0 during natural pauses
    duck_gain = np.clip(1.0 - (speech_env * 12.0), 0.32, 1.0)
    ducked_beat = beat * 0.16 * duck_gain

    mixed_audio = speech * 0.92 + ducked_beat + sfx_track * 0.45
    mixed_audio = np.clip(mixed_audio, -0.98, 0.98)
    mixed_int16 = (mixed_audio * 32767.0).astype(np.int16)

    with wave.open(final_audio, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(mixed_int16.tobytes())

    def find_file(candidates):
        for c in candidates:
            if os.path.exists(c):
                return c
        return None

    host_name = (host_override or data.get('hostAvatar') or data.get('host') or 'alex').strip().lower()
    host_candidates = []
    if os.path.exists(host_name):
        host_candidates.append(host_name)
    else:
        host_candidates.extend([
            os.path.join(os.path.dirname(__file__), f'../public/hosts/{host_name}.jpg'),
            os.path.join(os.path.dirname(__file__), f'../public/hosts/{host_name}.png'),
            os.path.join(os.path.dirname(__file__), f'../public/host_{host_name}.jpg'),
            os.path.join(os.path.dirname(__file__), '../public/host_alex.jpg'),
            r'C:\Users\user\Downloads\neural_pulse_host_alex.jpg',
            r'C:\Users\user\Downloads\jpilot\apps\server\public\host_alex.jpg'
        ])
    host_path = find_file(host_candidates)
    host_orig = cv2.imread(host_path) if host_path else np.zeros((H, W, 3), dtype=np.uint8)
    if host_orig is not None:
        h_orig, w_orig = host_orig.shape[:2]
        scale_cover = max(W / w_orig, H / h_orig) * 1.05
        nw, nh = int(w_orig * scale_cover), int(h_orig * scale_cover)
        host_scaled = cv2.resize(host_orig, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    else:
        host_scaled = np.zeros((H, W, 3), dtype=np.uint8)

    # Video B-Rolls Pool (Real 60FPS Video Footage)
    datacenter_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/assets/clip_datacenter.mp4'),
        r'C:\Users\user\Downloads\clip_datacenter.mp4',
        r'C:\Users\user\Downloads\clip_datacenter.webm',
        os.path.join(os.path.dirname(__file__), '../public/assets/clip_ai.webm'),
        r'C:\Users\user\Downloads\clip_ai.webm'
    ])
    cap_datacenter = cv2.VideoCapture(datacenter_path) if datacenter_path else None

    hailuo_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/assets/cyberpunk_hailuo.webm'),
        r'C:\Users\user\Downloads\cyberpunk_hailuo.webm'
    ])
    cap_hailuo = cv2.VideoCapture(hailuo_path) if hailuo_path else None

    ai_clip_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/assets/clip_ai.webm'),
        r'C:\Users\user\Downloads\clip_ai.webm'
    ])
    cap_ai = cv2.VideoCapture(ai_clip_path) if ai_clip_path else None

    storm_path = find_file([
        r'C:\Users\user\Downloads\stormlight-over-fields.3840x2160.mp4',
        r'C:\Users\user\Downloads\1774861278.mp4'
    ])
    cap_storm = cv2.VideoCapture(storm_path) if storm_path else None

    # Dynamic Topic B-Roll footage (Pexels HD 9:16 or custom topic scenes)
    broll_scene1_path = find_file([
        os.path.join(os.path.dirname(__file__), f'../public/assets/broll/{item_id}_scene_1.mp4'),
        os.path.join(os.getcwd(), f'apps/server/public/assets/broll/{item_id}_scene_1.mp4'),
        os.path.join(os.getcwd(), f'public/assets/broll/{item_id}_scene_1.mp4')
    ])
    cap_broll_1 = cv2.VideoCapture(broll_scene1_path) if broll_scene1_path else None

    broll_scene2_path = find_file([
        os.path.join(os.path.dirname(__file__), f'../public/assets/broll/{item_id}_scene_2.mp4'),
        os.path.join(os.getcwd(), f'apps/server/public/assets/broll/{item_id}_scene_2.mp4'),
        os.path.join(os.getcwd(), f'public/assets/broll/{item_id}_scene_2.mp4')
    ])
    cap_broll_2 = cv2.VideoCapture(broll_scene2_path) if broll_scene2_path else None

    def read_looped_frame(cap, target_w, target_h):
        if cap is None:
            return None
        ret, frame = cap.read()
        if not ret or frame is None:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
        if ret and frame is not None:
            fh, fw = frame.shape[:2]
            scale = max(target_w / fw, target_h / fh)
            nw, nh = int(fw * scale), int(fh * scale)
            resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)
            cx, cy = max(0, (nw - target_w) // 2), max(0, (nh - target_h) // 2)
            crop = resized[cy:cy+target_h, cx:cx+target_w]
            if crop.shape[0] != target_h or crop.shape[1] != target_w:
                crop = cv2.resize(crop, (target_w, target_h))
            return crop
        return None

    icon_alert_36 = load_icon('alert.png', (36, 36))
    icon_zap_36 = load_icon('zap.png', (36, 36))
    icon_code_36 = load_icon('code.png', (36, 36))
    icon_rocket_36 = load_icon('rocket.png', (36, 36))
    icon_fire_36 = load_icon('fire.png', (36, 36))
    icon_bell_36 = load_icon('bell.png', (36, 36))
    icon_mic = load_icon('mic.png', (44, 44))
    icon_mic_lg = load_icon('mic.png', (64, 64))
    icon_gmail = load_icon('gmail.png', (44, 44))
    icon_calendar = load_icon('calendar.png', (44, 44))
    icon_notion = load_icon('notion.png', (44, 44))
    icon_telegram = load_icon('telegram.png', (44, 44))
    icon_youtube = load_icon('youtube.png', (44, 44))
    icon_tiktok = load_icon('tiktok.png', (44, 44))
    icon_x = load_icon('x.png', (44, 44))

    font_title = get_font(38, bold=True)
    font_brand = get_font(26, bold=False)
    font_brand_bold = get_font(26, bold=True)
    font_mono = get_mono_font(24)
    font_card = get_font(30, bold=True)
    font_metric = get_font(36, bold=True)

    item_id = data.get('id', '')
    topic_scenes_dirs = [
        os.path.join(os.path.dirname(__file__), f'../public/assets/scenes/{item_id}'),
        os.path.join(os.path.dirname(__file__), f'../../web/public/assets/scenes/{item_id}'),
        os.path.join(os.getcwd(), f'apps/server/public/assets/scenes/{item_id}'),
        os.path.join(os.getcwd(), f'apps/web/public/assets/scenes/{item_id}'),
        os.path.join(os.getcwd(), f'public/assets/scenes/{item_id}')
    ]
    # Always generate 100% fresh, topic-tailored procedural scenes for every render
    scenes_data_init = data.get('scenes', []) if isinstance(data.get('scenes'), list) else []
    high_cpm_init = data.get('highCpmKeywords', []) if isinstance(data.get('highCpmKeywords'), list) else []
    topic_scenes = generate_topic_procedural_scenes(
        item_id, clean_title, scenes_data_init, high_cpm_init, topic_scenes_dirs,
        script=script, tags=data.get('tags', [])
    )
    has_topic_scenes = len(topic_scenes) >= 3
    if has_topic_scenes:
        print(f"🌟 Activated 100% Topic-Isolated Visual Engine with {len(topic_scenes)} unique scenes for [{item_id}]!", flush=True)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(raw_video, fourcc, FPS, (W, H))

    total_frames = int(duration * FPS)
    print(f"🎬 Step 3/3: Rendering {total_frames} cinematic multi-scene frames ({W}x{H} @ {FPS} FPS)...", flush=True)

    scenes_data = data.get('scenes', []) if isinstance(data.get('scenes'), list) else []
    high_cpm_keywords = data.get('highCpmKeywords', []) if isinstance(data.get('highCpmKeywords'), list) else []

    def get_scene_title(idx, default):
        if idx < len(scenes_data) and isinstance(scenes_data[idx], dict):
            t = scenes_data[idx].get('title')
            if t and isinstance(t, str) and len(t.strip()) > 0:
                return sanitize_text(t).upper()[:32]
        return default.upper()

    def get_scene_overlay(idx, default):
        if idx < len(scenes_data) and isinstance(scenes_data[idx], dict):
            ov = scenes_data[idx].get('overlayText')
            if ov and isinstance(ov, str) and len(ov.strip()) > 0:
                return sanitize_text(ov)
        return default

    # Dynamic subcard labels for legacy Scene 2
    card_labels = []
    if len(high_cpm_keywords) >= 4:
        for kw in high_cpm_keywords[:4]:
            card_labels.append((sanitize_text(str(kw))[:16], "Active Module"))
    elif len(high_cpm_keywords) > 0:
        for kw in high_cpm_keywords:
            card_labels.append((sanitize_text(str(kw))[:16], "Verified Engine"))
        defaults = [("Neural Pipeline", "100% Autonomous"), ("Data Stream", "Realtime Sync"), ("Core Optimizer", "Low Latency"), ("Agent Swarm", "Multi-Threaded")]
        for d in defaults:
            if len(card_labels) < 4:
                card_labels.append(d)
    else:
        card_labels = [
            ("Core Architecture", "High Throughput"),
            ("Data Pipeline", "Zero Latency"),
            ("Neural Logic", "Production Ready"),
            ("Cloud Dispatch", "Realtime Sync")
        ]

    topic_cat = classify_topic_category(item_id, clean_title, data.get('tags', []), high_cpm_keywords, script)
    print(f"🎯 Dynamic B-Roll Orchestration: Category [{topic_cat.upper()}] for [{item_id}]", flush=True)

    if cap_broll_1 or cap_broll_2:
        print(f"🎬 [Pexels Dynamic Footage] Topic video clips loaded for all scenes of [{item_id}]!", flush=True)
        b1 = cap_broll_1 or cap_broll_2
        b2 = cap_broll_2 or cap_broll_1
        scene_caps = [
            b1,
            b2,
            b1,
            b2,
            b1
        ]
    elif topic_cat == 'coding_prompts':
        # Pure computational, high-tech AI & datacenter vibe (NO umbrella rain guy!)
        scene_caps = [
            cap_ai or cap_datacenter,
            cap_datacenter or cap_ai,
            cap_storm or cap_datacenter,
            cap_datacenter or cap_ai,
            cap_ai or cap_datacenter
        ]
    elif topic_cat == 'model_duel':
        # Epic showdown between titans
        scene_caps = [
            cap_storm or cap_datacenter,
            cap_datacenter or cap_ai,
            cap_ai or cap_datacenter,
            cap_datacenter or cap_storm,
            cap_storm or cap_datacenter
        ]
    elif topic_cat == 'secret_tools':
        # Underground cyberpunk hacker vibe (hailuo ONLY in hook!)
        scene_caps = [
            cap_hailuo or cap_ai,
            cap_datacenter or cap_ai,
            cap_ai or cap_datacenter,
            cap_storm or cap_datacenter,
            cap_datacenter or cap_ai
        ]
    elif topic_cat == 'agent_swarm':
        # Autonomous multi-agent network
        scene_caps = [
            cap_datacenter or cap_ai,
            cap_ai or cap_datacenter,
            cap_storm or cap_ai,
            cap_hailuo or cap_datacenter,
            cap_ai or cap_datacenter
        ]
    else:
        all_caps = [c for c in [cap_datacenter, cap_ai, cap_storm, cap_hailuo] if c is not None]
        if all_caps:
            s_seed = sum(ord(c) for c in f"{item_id}_{clean_title}")
            off = s_seed % len(all_caps)
            scene_caps = [all_caps[(off + i) % len(all_caps)] for i in range(5)]
            if scene_caps[0] == scene_caps[4] and len(all_caps) > 1:
                scene_caps[4] = all_caps[(off + 2) % len(all_caps)]
        else:
            scene_caps = [None] * 5

    for frame_idx in range(total_frames):
        t_sec = frame_idx / FPS
        if frame_idx % 120 == 0 or frame_idx == total_frames - 1:
            pct = int(50 + (frame_idx / max(1, total_frames)) * 35)
            print(f"Step 3/3: Frame {frame_idx}/{total_frames} ({pct}%) tayyorlanmoqda...", flush=True)

        if has_topic_scenes:
            if t_sec < sc1_end:
                prog = t_sec / max(0.1, sc1_end)
                s_img = topic_scenes.get(1, list(topic_scenes.values())[0])
                cur_sc_idx = 0
                target_cap = scene_caps[0]
            elif sc1_end <= t_sec < sc2_end:
                prog = (t_sec - sc1_end) / max(0.1, sc2_end - sc1_end)
                s_img = topic_scenes.get(2, list(topic_scenes.values())[1 if len(topic_scenes) > 1 else 0])
                cur_sc_idx = 1
                target_cap = scene_caps[1]
            elif sc2_end <= t_sec < sc3_end:
                prog = (t_sec - sc2_end) / max(0.1, sc3_end - sc2_end)
                s_img = topic_scenes.get(3, list(topic_scenes.values())[2 if len(topic_scenes) > 2 else 0])
                cur_sc_idx = 2
                target_cap = scene_caps[2]
            elif sc3_end <= t_sec < sc4_end:
                prog = (t_sec - sc3_end) / max(0.1, sc4_end - sc3_end)
                s_img = topic_scenes.get(4, list(topic_scenes.values())[3 if len(topic_scenes) > 3 else 0])
                cur_sc_idx = 3
                target_cap = scene_caps[3]
            else:
                prog = (t_sec - sc4_end) / max(0.1, duration - sc4_end)
                s_img = topic_scenes.get(5, list(topic_scenes.values())[-1])
                cur_sc_idx = 4
                target_cap = scene_caps[4]

            # --- REAL 60FPS MOTION VIDEO FOOTAGE INTEGRATION ---
            motion_frame = read_looped_frame(target_cap, W, H)

            if s_img is not None:
                kb_frame = apply_ken_burns(s_img, prog, cur_sc_idx % 4)
                if motion_frame is not None:
                    # Seamless blend: 55% real 60fps moving video footage + 45% topic-specific visual
                    # This guarantees real movement (lights shifting, servers flashing, characters moving) in every frame!
                    frame = cv2.addWeighted(motion_frame, 0.55, kb_frame, 0.45, 0)
                else:
                    frame = kb_frame
            elif motion_frame is not None:
                frame = motion_frame
            else:
                frame = np.zeros((H, W, 3), dtype=np.uint8)

            # Continuous 60FPS procedural cyber particles & live motion
            for p_idx in range(14):
                p_seed = (p_idx * 173 + cur_sc_idx * 59) % 1000
                px = int((p_seed * 11 + t_sec * 60 * (1 if p_idx % 2 == 0 else -1)) % W)
                py = int((H - ((p_seed * 23 + t_sec * 90) % (H - 280))))
                p_col = (0, 240, 255) if p_idx % 2 == 0 else (255, 140, 50)
                cv2.circle(frame, (px, py), 2 if p_idx % 3 == 0 else 1, p_col, -1)

            # White flash transition on beat cuts
            dist_to_cut = min(abs(t_sec - sc1_end), abs(t_sec - sc2_end), abs(t_sec - sc3_end), abs(t_sec - sc4_end))
            if dist_to_cut < 0.12 and t_sec > 0.5:
                flash_alpha = max(0.0, 1.0 - (dist_to_cut / 0.12)) * 0.35
                white_overlay = np.full((H, W, 3), 255, dtype=np.uint8)
                cv2.addWeighted(white_overlay, flash_alpha, frame, 1.0 - flash_alpha, 0, frame)

            # Subtle top & bottom vignette to enhance subtitle & badge contrast
            grad = np.zeros((H, W, 3), dtype=np.uint8)
            cv2.rectangle(grad, (0, 0), (W, int(H * 0.14)), (0, 0, 0), -1)
            cv2.rectangle(grad, (0, int(H * 0.74)), (W, H), (0, 0, 0), -1)
            cv2.addWeighted(grad, 0.42, frame, 0.58, 0, frame)

            img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            draw = ImageDraw.Draw(img_pil, 'RGBA')

            # Dynamic Top Scene Pill
            sc_title = get_scene_title(cur_sc_idx, f"CHAPTER {cur_sc_idx + 1}" if is_long else f"SCENE {cur_sc_idx + 1}")
            bw = get_text_width(draw, sc_title, font_brand) + 80
            bx1 = (W - bw) // 2
            pill_y1 = int(H * 0.04)
            pill_y2 = pill_y1 + 56
            draw.rounded_rectangle([bx1, pill_y1, bx1 + bw, pill_y2], radius=18, fill=(12, 16, 26, 225), outline=(255, 60, 80, 210) if cur_sc_idx == 0 else (0, 220, 255, 190), width=2)
            paste_icon(img_pil, icon_alert_36 if cur_sc_idx == 0 else icon_zap_36, (bx1 + 18, pill_y1 + 10))
            draw.text((bx1 + 62, pill_y1 + 15), sc_title, font=font_brand, fill=(255, 255, 255))
        else:
            if t_sec < sc1_end or t_sec >= sc6_start:
                if t_sec < sc1_end:
                    if t_sec < 1.2:
                        p = t_sec / 1.2
                        zoom = 1.22 - 0.17 * math.sin(p * math.pi / 2)
                    else:
                        zoom = 1.05 + 0.04 * ((t_sec - 1.2) / max(0.1, sc1_end - 1.2))
                else:
                    p = (t_sec - sc6_start) / max(0.1, duration - sc6_start)
                    zoom = 1.03 + 0.05 * p

                cur_w, cur_h = int(W * zoom), int(H * zoom)
                crop_x = max(0, (host_scaled.shape[1] - cur_w) // 2)
                crop_y = max(0, (host_scaled.shape[0] - cur_h) // 2)
                cropped = host_scaled[crop_y:crop_y+cur_h, crop_x:crop_x+cur_w]
                frame = cv2.resize(cropped, (W, H))

                top_grad = np.zeros((H, W, 3), dtype=np.uint8)
                cv2.rectangle(top_grad, (0, 0), (W, 210), (0, 0, 0), -1)
                cv2.rectangle(top_grad, (0, 1340), (W, H), (0, 0, 0), -1)
                cv2.addWeighted(top_grad, 0.45, frame, 0.55, 0, frame)

            elif sc1_end <= t_sec < sc2_end:
                bg_ready = False
                if cap_datacenter is not None:
                    ret, bg_v = cap_datacenter.read()
                    if not ret or bg_v is None:
                        cap_datacenter.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, bg_v = cap_datacenter.read()
                    if ret and bg_v is not None:
                        v_res = cv2.resize(bg_v, (W, H))
                        frame = (v_res * 0.38).astype(np.uint8)
                        bg_ready = True
                if not bg_ready:
                    frame = np.zeros((H, W, 3), dtype=np.uint8)
                    for y in range(H):
                        r = y / H
                        frame[y, :] = (int(25 * (1-r) + 12 * r), int(16 * (1-r) + 18 * r), int(10 * (1-r) + 8 * r))
                    grid_off = int((t_sec * 80) % 60)
                    for gy in range(400, H, 60):
                        cv2.line(frame, (0, gy + grid_off), (W, gy + grid_off), (45, 38, 22), 1)
                    for gx in range(0, W, 90):
                        cv2.line(frame, (gx, 400), (int((gx - W/2)*2.2 + W/2), H), (50, 42, 22), 1)

            elif sc2_end <= t_sec < sc3_end:
                bg_ready = False
                if cap_hailuo is not None:
                    ret, bg_v = cap_hailuo.read()
                    if not ret or bg_v is None:
                        cap_hailuo.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, bg_v = cap_hailuo.read()
                    if ret and bg_v is not None:
                        v_res = cv2.resize(bg_v, (2400, 1920))
                        prog = (t_sec - sc2_end) / max(0.1, sc3_end - sc2_end)
                        pan = int(prog * (2400 - W) * 0.6)
                        frame = (v_res[:, pan:pan+W] * 0.40).astype(np.uint8)
                        bg_ready = True
                if not bg_ready:
                    frame = np.zeros((H, W, 3), dtype=np.uint8)
                    for y in range(H):
                        r = y / H
                        frame[y, :] = (int(36 * r + 15), int(16 * r + 10), int(22 * r + 12))

            elif sc3_end <= t_sec < sc4_end:
                frame = np.zeros((H, W, 3), dtype=np.uint8)
                for y in range(H):
                    r = y / H
                    frame[y, :] = (int(14 * r + 5), int(32 * r + 12), int(10 * r + 5))
                for col_x in range(40, W, 70):
                    drop_y = int((t_sec * 320 + col_x * 9) % H)
                    cv2.line(frame, (col_x, max(0, drop_y - 140)), (col_x, drop_y), (40, 130, 40), 2)

            elif sc4_end <= t_sec < sc5_end:
                frame = np.zeros((H, W, 3), dtype=np.uint8)
                for y in range(H):
                    r = y / H
                    frame[y, :] = (int(48 * r + 20), int(10 * r + 8), int(40 * r + 18))
                for p in range(18):
                    px = int((p * 65 + t_sec * 35) % W)
                    py = int((H - ((p * 110 + t_sec * 95) % (H - 350))))
                    cv2.circle(frame, (px, py), 3, (180, 50, 240), -1)

            img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            draw = ImageDraw.Draw(img_pil, 'RGBA')

            # Single cleanly rendered Brand/Alert Pill
            if t_sec < 3.5:
                pulse = math.sin(t_sec * 14.0) * 0.5 + 0.5
                r_val = int(220 + 35 * pulse)
                alert_topic = clean_title.upper()[:20] if clean_title else "AI BLUEPRINT"
                alert_text = f"! URGENT: {alert_topic} !"
                w_txt = get_text_width(draw, alert_text, font_brand_bold)
                pill_half = max(260, (w_txt + 100) // 2)
                draw.rounded_rectangle([W//2 - pill_half, 60, W//2 + pill_half, 126], radius=22, fill=(r_val, 25, 35, 245), outline=(255, 220, 50, 220), width=3)
                paste_icon(img_pil, icon_alert_36, (W//2 - pill_half + 20, 75))
                paste_icon(img_pil, icon_alert_36, (W//2 + pill_half - 56, 75))
                draw.text((W//2 - w_txt//2, 78), alert_text, font=font_brand_bold, fill=(255, 255, 255))
            else:
                draw.rounded_rectangle([W//2 - 190, 60, W//2 + 190, 120], radius=18, fill=(10, 12, 20, 200), outline=(255, 255, 255, 45), width=2)
                dot_col = (255, 40, 60) if int(t_sec * 4) % 2 == 0 else (180, 20, 35)
                draw.ellipse([W//2 - 160, 82, W//2 - 138, 104], fill=dot_col)
                draw.text((W//2 - 120, 76), "NEURAL PULSE AI", font=font_brand, fill=(255, 255, 255))

            if sc1_end <= t_sec < sc2_end:
                sc2_hdr = get_scene_title(1, "1. CORE ARCHITECTURE")
                draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(15, 25, 45, 235), outline=(0, 240, 255, 180), width=3)
                draw.text((110, 205), sc2_hdr, font=font_title, fill=(255, 255, 255))
                paste_icon(img_pil, icon_zap_36, (W - 390, 215))
                draw.text((W - 345, 220), "24/7 AUTONOMOUS", font=font_brand, fill=(0, 255, 160))

                core_name = (clean_title.upper()[:16] + " CORE") if clean_title else "AUTONOMOUS CORE"
                cw = max(460, get_text_width(draw, core_name, font_card) + 160)
                draw.rounded_rectangle([W//2 - cw//2, 560, W//2 + cw//2, 720], radius=28, fill=(18, 42, 75, 245), outline=(0, 240, 255, 240), width=4)
                paste_icon(img_pil, icon_zap_36, (W//2 - cw//2 + 30, 588))
                draw.text((W//2 - cw//2 + 80, 590), core_name, font=font_card, fill=(255, 255, 255))
                prog = (t_sec - sc1_end) / max(0.1, sc2_end - sc1_end)
                tasks_done = int(prog * 48) + 12
                status_txt = f"Status: {tasks_done} Ops Completed"
                draw.text((W//2 - get_text_width(draw, status_txt, font_brand)//2, 655), status_txt, font=font_brand, fill=(0, 240, 255))

                # Card 1 (top-left)
                draw.rounded_rectangle([80, 380, 440, 500], radius=20, fill=(18, 22, 38, 230), outline=(255, 70, 70, 160), width=2)
                paste_icon(img_pil, icon_code_36, (105, 400))
                draw.text((160, 405), card_labels[0][0], font=font_card, fill=(255, 255, 255))
                draw.text((105, 455), card_labels[0][1], font=font_brand, fill=(200, 210, 230))

                # Card 2 (top-right)
                draw.rounded_rectangle([W - 440, 380, W - 80, 500], radius=20, fill=(18, 22, 38, 230), outline=(70, 140, 255, 160), width=2)
                paste_icon(img_pil, icon_zap_36, (W - 415, 400))
                draw.text((W - 360, 405), card_labels[1][0], font=font_card, fill=(255, 255, 255))
                draw.text((W - 415, 455), card_labels[1][1], font=font_brand, fill=(200, 210, 230))

                # Card 3 (bottom-left)
                draw.rounded_rectangle([80, 780, 440, 900], radius=20, fill=(18, 22, 38, 230), outline=(255, 255, 255, 90), width=2)
                paste_icon(img_pil, icon_fire_36, (105, 800))
                draw.text((160, 805), card_labels[2][0], font=font_card, fill=(255, 255, 255))
                draw.text((105, 855), card_labels[2][1], font=font_brand, fill=(200, 210, 230))

                # Card 4 (bottom-right)
                draw.rounded_rectangle([W - 440, 780, W - 80, 900], radius=20, fill=(18, 22, 38, 230), outline=(0, 210, 255, 160), width=2)
                paste_icon(img_pil, icon_rocket_36, (W - 415, 800))
                draw.text((W - 360, 805), card_labels[3][0], font=font_card, fill=(255, 255, 255))
                draw.text((W - 415, 855), card_labels[3][1], font=font_brand, fill=(0, 255, 160))

            elif sc2_end <= t_sec < sc3_end:
                sc3_hdr = get_scene_title(2, "2. DEEP BENCHMARK")
                draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(35, 22, 16, 235), outline=(255, 180, 40, 180), width=3)
                draw.text((110, 205), sc3_hdr, font=font_title, fill=(255, 255, 255))
                paste_icon(img_pil, icon_mic, (W - 400, 212))
                draw.text((W - 345, 220), "30s SPEED BENCH", font=font_brand, fill=(255, 200, 50))

                cx, cy = W // 2, 490
                cur_vol = float(np.mean(np.abs(mixed_audio[max(0, int(t_sec * sr) - 256):min(len(mixed_audio), int(t_sec * sr) + 256)])))
                for sp in range(32):
                    angle = (sp / 32) * 2 * math.pi + t_sec * 0.8
                    bar_len = int(cur_vol * 260 * (math.sin(sp * 0.5 + t_sec * 10) * 0.5 + 0.5)) + 18
                    x1 = cx + int(85 * math.cos(angle))
                    y1 = cy + int(85 * math.sin(angle))
                    x2 = cx + int((85 + bar_len) * math.cos(angle))
                    y2 = cy + int((85 + bar_len) * math.sin(angle))
                    draw.line([(x1, y1), (x2, y2)], fill=(255, 180, 40, 220), width=4)

                draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(255, 160, 30), outline=(255, 255, 255, 200), width=3)
                paste_icon(img_pil, icon_mic_lg, (cx - 32, cy - 32))

                draw.rounded_rectangle([80, 680, W - 80, 800], radius=22, fill=(18, 18, 30, 240), outline=(255, 255, 255, 60), width=2)
                paste_icon(img_pil, icon_mic, (105, 696))
                input_label = f"INPUT: {clean_title[:32]}"
                draw.text((160, 702), input_label, font=font_brand, fill=(255, 180, 50))
                sc3_snippet = get_scene_overlay(2, f"Analyzing {clean_title} performance and architecture...")
                draw.text((105, 745), f'"{sc3_snippet[:46]}..."', font=font_mono, fill=(230, 230, 230))

                bench_banner = f">>> BENCHMARK RUN: {clean_title.upper()[:24]} <<<"
                bb_w = get_text_width(draw, bench_banner, font_brand)
                draw.text((W//2 - bb_w//2, 820), bench_banner, font=font_brand, fill=(0, 240, 255))

                draw.rounded_rectangle([80, 870, W - 80, 1050], radius=22, fill=(15, 25, 38, 245), outline=(0, 255, 180, 180), width=3)
                paste_icon(img_pil, icon_code_36, (105, 888))
                draw.text((155, 895), "OUTPUT: Production Pipeline & Results", font=font_brand, fill=(0, 255, 180))
                draw.line([(108, 960), (116, 968), (130, 950)], fill=(0, 255, 160), width=3)
                draw.text((140, 945), "Zero-Latency Architecture Verified", font=font_mono, fill=(255, 255, 255))
                draw.line([(108, 1005), (116, 1013), (130, 995)], fill=(0, 255, 160), width=3)
                draw.text((140, 990), "Auto-generated Test Suites (48 / 48 Passed)", font=font_mono, fill=(255, 255, 255))

            elif sc3_end <= t_sec < sc4_end:
                sc4_hdr = get_scene_title(3, "3. AUTONOMOUS RUNNER")
                draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(10, 32, 20, 235), outline=(0, 255, 120, 180), width=3)
                draw.text((110, 205), sc4_hdr, font=font_title, fill=(255, 255, 255))
                paste_icon(img_pil, icon_code_36, (W - 390, 215))
                draw.text((W - 345, 220), "AI PIPELINE RUN", font=font_brand, fill=(0, 255, 140))

                draw.rounded_rectangle([70, 330, W - 70, 1140], radius=26, fill=(6, 16, 10, 248), outline=(0, 255, 120, 120), width=2)
                draw.ellipse([100, 360, 120, 380], fill=(255, 70, 70))
                draw.ellipse([135, 360, 155, 380], fill=(255, 200, 50))
                draw.ellipse([170, 360, 190, 380], fill=(50, 220, 100))
                cmd_slug = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())[:16] or "system"
                draw.text((220, 358), f"agent-engine --target {cmd_slug}", font=font_brand, fill=(120, 180, 140))

                terminal_lines = [
                    (f"$ run-engine --analyze --target {cmd_slug}", (0, 255, 200)),
                    (f"Scanning target architecture: {clean_title[:28]}...", (180, 180, 180)),
                    ("[INIT] Neural weights & pipeline initialized", (0, 255, 120)),
                    ("[OPTIMIZE] Evaluating high-throughput performance...", (255, 200, 50)),
                    (f"[OK] Core pipeline validated successfully", (0, 255, 120)),
                    ("Executing 48 automated test suites & benchmarks...", (180, 180, 180)),
                    ("[OK] 48 / 48 BENCHMARKS PASSED in 240ms", (0, 255, 120)),
                    (f"Deploying production model to live cluster...", (255, 200, 50)),
                    (">>> 100% VERIFIED & PRODUCTION READY <<<", (0, 255, 120))
                ]
                prog_d = (t_sec - sc3_end) / max(0.1, sc4_end - sc3_end)
                num_visible = min(len(terminal_lines), int(prog_d * (len(terminal_lines) + 2)) + 1)
                for l_idx in range(num_visible):
                    txt, col = terminal_lines[l_idx]
                    draw.text((100, 420 + l_idx * 70), txt, font=font_mono, fill=col)

            elif sc4_end <= t_sec < sc5_end:
                sc5_hdr = get_scene_title(4, "4. 10X IMPACT MATRIX")
                draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(35, 15, 45, 235), outline=(255, 80, 240, 180), width=3)
                draw.text((110, 205), sc5_hdr, font=font_title, fill=(255, 255, 255))
                paste_icon(img_pil, icon_rocket_36, (W - 390, 215))
                draw.text((W - 345, 220), "VIRAL SCALE", font=font_brand, fill=(255, 120, 255))

                platforms = [
                    (icon_youtube, "YouTube Shorts", "4.2M Views", "+380% CPM Revenue"),
                    (icon_tiktok, "TikTok Viral", "1.8M Views", "+14.2K Followers"),
                    (icon_x, "Twitter / X Clip", "850K Views", "+1,200 Reposts")
                ]
                for p_idx, (p_icon, p_name, p_views, p_sub) in enumerate(platforms):
                    py = 340 + p_idx * 160
                    draw.rounded_rectangle([80, py, W - 80, py + 130], radius=22, fill=(20, 10, 32, 240), outline=(255, 80, 240, 120), width=2)
                    paste_icon(img_pil, p_icon, (105, py + 22))
                    draw.text((165, py + 25), p_name, font=font_card, fill=(255, 255, 255))
                    draw.text((165, py + 72), p_sub, font=font_brand, fill=(180, 150, 200))
                    mw = get_text_width(draw, p_views, font_metric)
                    draw.text((W - 120 - mw, py + 38), p_views, font=font_metric, fill=(255, 220, 50))

                draw.rounded_rectangle([80, 860, W - 80, 970], radius=20, fill=(15, 10, 25, 240), outline=(0, 255, 180, 140), width=2)
                paste_icon(img_pil, icon_fire_36, (105, 875))
                draw.text((155, 882), "Viral Hook Retention Score: 98.4 / 100", font=font_brand, fill=(255, 180, 50))
                paste_icon(img_pil, icon_zap_36, (105, 920))
                draw.text((155, 928), f"High-Retention Target: {clean_title[:32]}", font=font_brand, fill=(0, 255, 180))

        cur_sub = None
        for (c_st, c_et, lines, colors) in subtitles:
            if c_st <= t_sec < c_et:
                cur_sub = (lines, colors)
                break

        if cur_sub:
            if is_long and t_sec >= sc6_start:
                # 16:9 Outro: position subtitle neatly on left half to never collide with Subscribe card on right
                sub_y = int(H * 0.82)
                sub_cx = int(W * 0.28)
                max_cap_w = int(W * 0.48)
                draw_smart_caption(draw, cur_sub[0], sub_y, colors=cur_sub[1], max_w=max_cap_w, x_center=sub_cx)
            else:
                sub_y = int(H * 0.83) if (is_long or t_sec < sc6_start) else 1310
                max_cap_w = int(W * 0.80) if is_long else 880
                draw_smart_caption(draw, cur_sub[0], sub_y, colors=cur_sub[1], max_w=max_cap_w)

        if t_sec >= sc6_start:
            card_w = min(780, int(W * 0.44)) if is_long else 780
            card_h = 88
            cx1 = (W - card_w - 60) if is_long else (W - card_w) // 2
            cy1 = int(H * 0.78) if is_long else 1430
            draw.rounded_rectangle([cx1, cy1, cx1 + card_w, cy1 + card_h], radius=24, fill=(18, 22, 35, 240), outline=(255, 255, 255, 50), width=2)
            paste_icon(img_pil, icon_youtube, (cx1 + 20, cy1 + 22))
            draw.text((cx1 + 75, cy1 + 28), "@NeuralPulseAI-m3e", font=font_brand, fill=(255, 255, 255))

            bw, bh = 240, 54
            bx1 = cx1 + card_w - bw - 18
            by1 = cy1 + 17
            is_clicked = t_sec >= (duration - 4.5)

            if not is_clicked:
                draw.rounded_rectangle([bx1, by1, bx1 + bw, by1 + bh], radius=16, fill=(225, 30, 45))
                tx, ty = bx1 + 24, by1 + 17
                draw.polygon([(tx, ty), (tx, ty + 20), (tx + 16, ty + 10)], fill=(255, 255, 255))
                draw.text((bx1 + 54, by1 + 12), "SUBSCRIBE", font=font_brand, fill=(255, 255, 255))
            else:
                draw.rounded_rectangle([bx1, by1, bx1 + bw, by1 + bh], radius=16, fill=(48, 52, 65))
                cx, cy = bx1 + 20, by1 + 15
                draw.line([(cx, cy + 12), (cx + 8, cy + 22)], fill=(0, 255, 140), width=3)
                draw.line([(cx + 8, cy + 22), (cx + 22, cy + 6)], fill=(0, 255, 140), width=3)
                draw.text((bx1 + 52, by1 + 12), "SUBSCRIBED", font=font_brand, fill=(210, 220, 235))
                paste_icon(img_pil, icon_bell_36, (bx1 - 42, by1 + 9))

            if binge_teaser and t_sec >= (duration - 3.2):
                btw = min(640, int(W * 0.44))
                btx1 = cx1 if is_long else (W - btw) // 2
                bty1 = cy1 - 54 if is_long else (cy1 + card_h + 16)
                draw.rounded_rectangle([btx1, bty1, btx1 + btw, bty1 + 46], radius=14, fill=(12, 18, 30, 235), outline=(0, 240, 255, 180), width=2)
                teaser_txt = f">> {binge_teaser.upper()} <<"
                f_t = get_font(20, bold=True)
                tw = draw.textlength(teaser_txt, font=f_t) if hasattr(draw, 'textlength') else 380
                draw.text(((btx1 + (btw - int(tw)) // 2), bty1 + 12), teaser_txt, font=f_t, fill=(0, 240, 255))

        audio_sample_idx = min(len(mixed_audio) - 1, int(t_sec * sr))
        win = mixed_audio[max(0, audio_sample_idx - 512):min(len(mixed_audio), audio_sample_idx + 512)]
        vol = float(np.mean(np.abs(win))) if len(win) > 0 else 0.05

        num_bars = 48 if is_long else 36
        bar_w = 18 if is_long else 16
        spacing = 10
        start_x = (W - (num_bars * (bar_w + spacing))) // 2
        base_eq_y = int(H * 0.97)

        for b in range(num_bars):
            bar_factor = math.sin(b * 0.38 + t_sec * 14.0) * 0.5 + 0.5
            bh = int(8 + vol * (200 if is_long else 380) * bar_factor)
            bx = start_x + b * (bar_w + spacing)
            by = base_eq_y - bh
            c_r = int(255 * (b / num_bars))
            c_g = int(220 * (1 - b / num_bars) + 40)
            c_b = int(255 * (1 - b / num_bars))
            draw.rounded_rectangle([bx, by, bx + bar_w, base_eq_y], radius=6, fill=(c_r, c_g, c_b, 230))

        frame_final = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

        for cut in scene_cuts:
            if 0 <= (t_sec - cut) < 0.15:
                flash = (0.15 - (t_sec - cut)) / 0.15
                white = np.full((H, W, 3), 255, dtype=np.uint8)
                cv2.addWeighted(white, flash * 0.45, frame_final, 1.0 - flash * 0.45, 0, frame_final)

        writer.write(frame_final)

    writer.release()
    if cap_datacenter: cap_datacenter.release()
    if cap_hailuo: cap_hailuo.release()
    if cap_ai: cap_ai.release()
    if cap_storm: cap_storm.release()

    print("🎬 Video stream rendered. Muxing with FFmpeg...", flush=True)

    mux_cmd = [
        ffmpeg_bin, '-y',
        '-i', raw_video,
        '-i', final_audio,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-pix_fmt', 'yuv420p',
        '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart',
        output_mp4
    ]
    try:
        subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception:
        # Fallback without loudnorm if audio filter fails
        mux_fallback = [
            ffmpeg_bin, '-y', '-i', raw_video, '-i', final_audio,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
            '-movflags', '+faststart', output_mp4
        ]
        subprocess.run(mux_fallback, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # Automatic High-CTR Smart Thumbnail generation (Vertical 1080x1920 & Landscape 1280x720)
    thumb_path = output_mp4.replace('.mp4', '_thumb.jpg')
    try:
        generate_smart_thumbnail(data, thumb_path, host_path=host_path)
        print(f"📸 Smart High-CTR Thumbnail generated: {thumb_path}", flush=True)
    except Exception as thumb_err:
        print(f"⚠️ Smart Thumbnail generation error, falling back to frame extraction: {thumb_err}", flush=True)
        try:
            thumb_cmd = [
                ffmpeg_bin, '-y',
                '-ss', str(min(2.5, duration * 0.1)),
                '-i', output_mp4,
                '-vframes', '1',
                '-q:v', '2',
                thumb_path
            ]
            subprocess.run(thumb_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    try:
        shutil.rmtree(temp_dir)
    except Exception:
        pass

    print(f"✅ Video generated successfully: {output_mp4} ({duration:.2f}s)", flush=True)
    return duration

def main():
    parser = argparse.ArgumentParser(description="Render topic video")
    parser.add_argument('--input', type=str, help="JSON input file path")
    parser.add_argument('--json', type=str, help="Raw JSON string input")
    parser.add_argument('--item-id', type=str, help="Specific item ID if input contains multiple items")
    parser.add_argument('--output', type=str, required=True, help="Output MP4 path")
    parser.add_argument('--voice', type=str, default=None, help="Azure Neural Voice name")
    parser.add_argument('--host', type=str, default=None, help="Host Avatar name or path")
    parser.add_argument('--music-mood', type=str, default=None, help="Background music mood preset")
    parser.add_argument('--voice-preset', type=str, default=None, help="Voice emotion and pace preset")
    parser.add_argument('--format', type=str, default=None, help="Video format: landscape (16:9) or portrait (9:16)")
    parser.add_argument('--beat-sync', type=lambda x: str(x).lower() in ['true', '1', 'yes'], default=True, help="Enable beat-synced jumpcuts")
    args = parser.parse_args()

    if args.json:
        data = json.loads(args.json)
    elif args.input and os.path.exists(args.input):
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        print("❌ Error: Must provide --json or --input", file=sys.stderr)
        sys.exit(1)

    if isinstance(data, dict) and 'title' not in data:
        if args.item_id and args.item_id in data:
            data = data[args.item_id]
        else:
            for k, v in data.items():
                if isinstance(v, dict) and 'title' in v:
                    data = v
                    break

    dur = render_video(data, args.output, voice_override=args.voice, host_override=args.host, music_mood_override=args.music_mood, voice_preset_override=args.voice_preset, beat_sync=args.beat_sync, format_override=args.format)
    print(json.dumps({"success": True, "output": args.output, "duration": dur}))

if __name__ == '__main__':
    main()
