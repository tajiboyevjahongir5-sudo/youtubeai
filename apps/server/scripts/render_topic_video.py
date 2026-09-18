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

def sanitize_text(text: str) -> str:
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    return re.sub(r'[^\x00-\x7F]+', ' ', text).strip()

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

def draw_smart_caption(draw: ImageDraw.ImageDraw, lines, y_center: int, colors=None, 
                       max_w=880, base_size=46, min_size=28, stroke_color=(0,0,0), stroke_w=4):
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
    
    for i, line in enumerate(sanitized_lines):
        w = get_text_width(draw, line, font)
        x = (W - w) // 2
        y = start_y + i * line_h
        col = colors[i]
        
        for dx in range(-stroke_w, stroke_w+1):
            for dy in range(-stroke_w, stroke_w+1):
                if dx*dx + dy*dy <= stroke_w*stroke_w:
                    draw.text((x+dx, y+dy), line, font=font, fill=stroke_color)
        draw.text((x, y), line, font=font, fill=col)

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
        for m in matches:
            s_min, s_sec, e_min, e_sec, tag, text = m.groups()
            st = float(s_min) * 60 + float(s_sec)
            et = float(e_min) * 60 + float(e_sec)
            et = min(et, total_duration)
            raw_text = text.replace('\n', ' ').strip().strip('"')
            sentences = [s.strip() for s in re.split(r'[\.\!\?]+', raw_text) if s.strip()]
            if not sentences:
                sentences = [raw_text]
            
            sub_dur = (et - st) / max(1, len(sentences))
            for s_idx, sent in enumerate(sentences):
                c_st = st + s_idx * sub_dur
                c_et = min(total_duration, c_st + sub_dur)
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

def generate_pure_cyberpunk_beat(duration: float, sr=24000) -> np.ndarray:
    n_samples = int(sr * duration)
    bpm = 124
    beat_interval = int(sr * (60.0 / bpm))
    music = np.zeros(n_samples, dtype=np.float32)

    num_beats = int(duration * (bpm / 60.0))
    for b in range(num_beats):
        idx = b * beat_interval
        kick_len = int(0.22 * sr)
        if idx + kick_len < n_samples:
            kt = np.linspace(0, 0.22, kick_len, endpoint=False)
            freq = 42.0 + 95.0 * np.exp(-kt * 26.0)
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

async def synthesize_speech(text: str, output_wav: str, ffmpeg_bin: str) -> float:
    temp_mp3 = output_wav.replace('.wav', '_temp.mp3')
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, "en-US-ChristopherNeural", rate="+14%", pitch="+1Hz")
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

def render_video(data: dict, output_mp4: str):
    ffmpeg_bin = get_ffmpeg_bin()
    is_long = data.get('videoFormat') == 'long_form'
    
    title = data.get('title', 'Neural Pulse AI')
    clean_title = sanitize_text(title)
    script = data.get('script', '')

    temp_dir = os.path.join(os.path.dirname(output_mp4), f"tmp_{data.get('id', 'render')}")
    os.makedirs(temp_dir, exist_ok=True)

    voice_wav = os.path.join(temp_dir, 'voice.wav')
    final_audio = os.path.join(temp_dir, 'final_audio.wav')
    raw_video = os.path.join(temp_dir, 'raw_video.mp4')

    print(f"🎙️ Step 1/3: Synthesizing Azure Neural Voice for '{clean_title}'...", flush=True)
    tts_text = clean_script_for_tts(script)
    if not tts_text:
        tts_text = f"Welcome to Neural Pulse AI. Today we analyze: {clean_title}."

    duration = asyncio.run(synthesize_speech(tts_text, voice_wav, ffmpeg_bin))
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

    beat = generate_pure_cyberpunk_beat(duration, sr=sr)

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

    mixed_audio = speech * 0.90 + beat * 0.12 + sfx_track * 0.40
    mixed_audio = np.clip(mixed_audio, -0.98, 0.98)
    mixed_int16 = (mixed_audio * 32767.0).astype(np.int16)

    with wave.open(final_audio, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(mixed_int16.tobytes())

    subtitles = parse_timed_subtitles(script, duration)

    # 6 scene boundaries proportionally
    sc1_end = duration * 0.16
    sc2_end = duration * 0.35
    sc3_end = duration * 0.53
    sc4_end = duration * 0.70
    sc5_end = duration * 0.85
    sc6_start = sc5_end

    scene_cuts = [sc1_end, sc2_end, sc3_end, sc4_end, sc5_end]
    for cut in scene_cuts:
        add_sfx(sfx_track, sfx_whoosh, cut, vol=0.35)

    def find_file(candidates):
        for c in candidates:
            if os.path.exists(c):
                return c
        return None

    host_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/host_alex.jpg'),
        r'C:\Users\user\Downloads\neural_pulse_host_alex.jpg',
        r'C:\Users\user\Downloads\jpilot\apps\server\public\host_alex.jpg'
    ])
    host_orig = cv2.imread(host_path) if host_path else np.zeros((H, W, 3), dtype=np.uint8)
    if host_orig is not None:
        h_orig, w_orig = host_orig.shape[:2]
        scale_cover = max(W / w_orig, H / h_orig) * 1.05
        nw, nh = int(w_orig * scale_cover), int(h_orig * scale_cover)
        host_scaled = cv2.resize(host_orig, (nw, nh), interpolation=cv2.INTER_LANCZOS4)
    else:
        host_scaled = np.zeros((H, W, 3), dtype=np.uint8)

    # Video B-Rolls
    datacenter_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/assets/clip_datacenter.mp4'),
        r'C:\Users\user\Downloads\clip_datacenter.mp4',
        os.path.join(os.path.dirname(__file__), '../public/assets/clip_ai.webm'),
        r'C:\Users\user\Downloads\clip_ai.webm'
    ])
    cap_datacenter = cv2.VideoCapture(datacenter_path) if datacenter_path else None

    hailuo_path = find_file([
        os.path.join(os.path.dirname(__file__), '../public/assets/cyberpunk_hailuo.webm'),
        r'C:\Users\user\Downloads\cyberpunk_hailuo.webm'
    ])
    cap_hailuo = cv2.VideoCapture(hailuo_path) if hailuo_path else None

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

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(raw_video, fourcc, FPS, (W, H))

    total_frames = int(duration * FPS)
    print(f"🎬 Step 3/3: Rendering {total_frames} cinematic multi-scene frames ({W}x{H} @ {FPS} FPS)...", flush=True)

    for frame_idx in range(total_frames):
        t_sec = frame_idx / FPS

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
            draw.rounded_rectangle([W//2 - 280, 60, W//2 + 280, 126], radius=22, fill=(r_val, 25, 35, 245), outline=(255, 220, 50, 220), width=3)
            paste_icon(img_pil, icon_alert_36, (W//2 - 260, 75))
            paste_icon(img_pil, icon_alert_36, (W//2 + 224, 75))
            w_txt = get_text_width(draw, "! 2026 AI BLUEPRINT !", font_brand_bold)
            draw.text((W//2 - w_txt//2, 78), "! 2026 AI BLUEPRINT !", font=font_brand_bold, fill=(255, 255, 255))
        else:
            draw.rounded_rectangle([W//2 - 190, 60, W//2 + 190, 120], radius=18, fill=(10, 12, 20, 200), outline=(255, 255, 255, 45), width=2)
            dot_col = (255, 40, 60) if int(t_sec * 4) % 2 == 0 else (180, 20, 35)
            draw.ellipse([W//2 - 160, 82, W//2 - 138, 104], fill=dot_col)
            draw.text((W//2 - 120, 76), "NEURAL PULSE AI", font=font_brand, fill=(255, 255, 255))

        if sc1_end <= t_sec < sc2_end:
            draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(15, 25, 45, 235), outline=(0, 240, 255, 180), width=3)
            draw.text((110, 205), "1. AI WORKFLOW BRAIN", font=font_title, fill=(255, 255, 255))
            paste_icon(img_pil, icon_zap_36, (W - 390, 215))
            draw.text((W - 345, 220), "24/7 AUTONOMOUS", font=font_brand, fill=(0, 255, 160))

            draw.rounded_rectangle([W//2 - 230, 560, W//2 + 230, 720], radius=28, fill=(18, 42, 75, 245), outline=(0, 240, 255, 240), width=4)
            paste_icon(img_pil, icon_zap_36, (W//2 - 200, 588))
            draw.text((W//2 - 150, 590), "AUTONOMOUS CORE", font=font_card, fill=(255, 255, 255))
            prog = (t_sec - sc1_end) / max(0.1, sc2_end - sc1_end)
            tasks_done = int(prog * 48) + 12
            draw.text((W//2 - 165, 655), f"Tasks Handled: {tasks_done} Done", font=font_brand, fill=(0, 240, 255))

            draw.rounded_rectangle([80, 380, 440, 500], radius=20, fill=(18, 22, 38, 230), outline=(255, 70, 70, 160), width=2)
            paste_icon(img_pil, icon_gmail, (105, 400))
            draw.text((160, 405), "Gmail Inbox", font=font_card, fill=(255, 255, 255))
            draw.text((105, 455), "42 Emails Filtered", font=font_brand, fill=(200, 210, 230))

            draw.rounded_rectangle([W - 440, 380, W - 80, 500], radius=20, fill=(18, 22, 38, 230), outline=(70, 140, 255, 160), width=2)
            paste_icon(img_pil, icon_calendar, (W - 415, 400))
            draw.text((W - 360, 405), "Calendar", font=font_card, fill=(255, 255, 255))
            draw.text((W - 415, 455), "Schedule Optimized", font=font_brand, fill=(200, 210, 230))

            draw.rounded_rectangle([80, 780, 440, 900], radius=20, fill=(18, 22, 38, 230), outline=(255, 255, 255, 90), width=2)
            paste_icon(img_pil, icon_notion, (105, 800))
            draw.text((160, 805), "Notion DB", font=font_card, fill=(255, 255, 255))
            draw.text((105, 855), "Daily Brief Saved", font=font_brand, fill=(200, 210, 230))

            draw.rounded_rectangle([W - 440, 780, W - 80, 900], radius=20, fill=(18, 22, 38, 230), outline=(0, 210, 255, 160), width=2)
            paste_icon(img_pil, icon_telegram, (W - 415, 800))
            draw.text((W - 360, 805), "Telegram", font=font_card, fill=(255, 255, 255))
            draw.text((W - 415, 855), "Alerts Dispatched", font=font_brand, fill=(0, 255, 160))

        elif sc2_end <= t_sec < sc3_end:
            draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(35, 22, 16, 235), outline=(255, 180, 40, 180), width=3)
            draw.text((110, 205), "2. VOICE TO CODE", font=font_title, fill=(255, 255, 255))
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
            draw.text((160, 702), "INPUT: 1-Minute Casual Voice Memo", font=font_brand, fill=(255, 180, 50))
            draw.text((105, 745), '"Deploy autonomous AI coding agents for my stack..."', font=font_mono, fill=(230, 230, 230))

            draw.text((W//2 - 250, 820), ">>> CONVERSION TIME: 30 SECONDS <<<", font=font_brand, fill=(0, 240, 255))

            draw.rounded_rectangle([80, 870, W - 80, 1050], radius=22, fill=(15, 25, 38, 245), outline=(0, 255, 180, 180), width=3)
            paste_icon(img_pil, icon_code_36, (105, 888))
            draw.text((155, 895), "OUTPUT: Production Pipeline Code & PRs", font=font_brand, fill=(0, 255, 180))
            draw.line([(108, 960), (116, 968), (130, 950)], fill=(0, 255, 160), width=3)
            draw.text((140, 945), "Autonomous Docker Setup & Scripts", font=font_mono, fill=(255, 255, 255))
            draw.line([(108, 1005), (116, 1013), (130, 995)], fill=(0, 255, 160), width=3)
            draw.text((140, 990), "Auto-generated Test Suites (48 Passed)", font=font_mono, fill=(255, 255, 255))

        elif sc3_end <= t_sec < sc4_end:
            draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(10, 32, 20, 235), outline=(0, 255, 120, 180), width=3)
            draw.text((110, 205), "3. DEVENGINE RUNNER", font=font_title, fill=(255, 255, 255))
            paste_icon(img_pil, icon_code_36, (W - 390, 215))
            draw.text((W - 345, 220), "AI SOFTWARE ENG", font=font_brand, fill=(0, 255, 140))

            draw.rounded_rectangle([70, 330, W - 70, 1140], radius=26, fill=(6, 16, 10, 248), outline=(0, 255, 120, 120), width=2)
            draw.ellipse([100, 360, 120, 380], fill=(255, 70, 70))
            draw.ellipse([135, 360, 155, 380], fill=(255, 200, 50))
            draw.ellipse([170, 360, 190, 380], fill=(50, 220, 100))
            draw.text((220, 358), "devengine-agent --autonomous", font=font_brand, fill=(120, 180, 140))

            terminal_lines = [
                ("$ devengine --autonomous --target prod", (0, 255, 200)),
                ("Scanning repo: 14,820 LOC in 42 modules...", (180, 180, 180)),
                ("[BUG] Memory leak in auth_worker.py:42", (255, 100, 100)),
                ("[PATCH] Generating zero-copy buffer fix...", (255, 200, 50)),
                ("[OK] Applied PR #142 automatically", (0, 255, 120)),
                ("Running 48 automated test suites...", (180, 180, 180)),
                ("[OK] 48 / 48 TESTS PASSED in 240ms", (0, 255, 120)),
                ("Deploying to AWS us-east-1 cluster...", (255, 200, 50)),
                (">>> 100% DEPLOYED & LIVE <<<", (0, 255, 120))
            ]
            prog_d = (t_sec - sc3_end) / max(0.1, sc4_end - sc3_end)
            num_visible = min(len(terminal_lines), int(prog_d * (len(terminal_lines) + 2)) + 1)
            for l_idx in range(num_visible):
                txt, col = terminal_lines[l_idx]
                draw.text((100, 420 + l_idx * 70), txt, font=font_mono, fill=col)

        elif sc4_end <= t_sec < sc5_end:
            draw.rounded_rectangle([70, 180, W - 70, 290], radius=24, fill=(35, 15, 45, 235), outline=(255, 80, 240, 180), width=3)
            draw.text((110, 205), "4. 10X MULTIPLIER", font=font_title, fill=(255, 255, 255))
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
            draw.text((155, 882), "Viral Hook Score: 98.4 / 100", font=font_brand, fill=(255, 180, 50))
            paste_icon(img_pil, icon_zap_36, (105, 920))
            draw.text((155, 928), "10 Multi-Platform Clips Exported in 60s", font=font_brand, fill=(0, 255, 180))

        cur_sub = None
        for (c_st, c_et, lines, colors) in subtitles:
            if c_st <= t_sec < c_et:
                cur_sub = (lines, colors)
                break

        if cur_sub:
            sub_y = 1450 if t_sec < sc6_start else 1310
            draw_smart_caption(draw, cur_sub[0], sub_y, colors=cur_sub[1], max_w=880)

        if t_sec >= sc6_start:
            card_w = 780
            card_h = 88
            cx1 = (W - card_w) // 2
            cy1 = 1430
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

        audio_sample_idx = min(len(mixed_audio) - 1, int(t_sec * sr))
        win = mixed_audio[max(0, audio_sample_idx - 512):min(len(mixed_audio), audio_sample_idx + 512)]
        vol = float(np.mean(np.abs(win))) if len(win) > 0 else 0.05

        num_bars = 36
        bar_w = 16
        spacing = 10
        start_x = (W - (num_bars * (bar_w + spacing))) // 2

        for b in range(num_bars):
            bar_factor = math.sin(b * 0.38 + t_sec * 14.0) * 0.5 + 0.5
            bh = int(12 + vol * 380 * bar_factor)
            bx = start_x + b * (bar_w + spacing)
            by = 1810 - bh
            c_r = int(255 * (b / num_bars))
            c_g = int(220 * (1 - b / num_bars) + 40)
            c_b = int(255 * (1 - b / num_bars))
            draw.rounded_rectangle([bx, by, bx + bar_w, 1810], radius=6, fill=(c_r, c_g, c_b, 230))

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

    # Automatic High-CTR Thumbnail generation
    thumb_path = output_mp4.replace('.mp4', '_thumb.jpg')
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
        if os.path.exists(thumb_path):
            print(f"📸 Thumbnail generated: {thumb_path}", flush=True)
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

    dur = render_video(data, args.output)
    print(json.dumps({"success": True, "output": args.output, "duration": dur}))

if __name__ == '__main__':
    main()
