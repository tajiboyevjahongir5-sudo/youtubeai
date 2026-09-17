# Neural Pulse AI - YouTube Video Production Standards (SOP)

This document defines the strict quality, rendering, and viral retention standards for all automated and assisted video generation for **Neural Pulse AI** (@NeuralPulseAI-m3e).

---

## 1. Zero-Defect Typography & Icon Standards
* **NEVER USE UNICODE EMOJIS IN PIL TEXT:**
  Windows TrueType fonts (e.g. Arial Black, Segoe UI) lack color emoji tables, causing PIL to render emojis as broken rectangular tofu boxes (`[]`).
  - **Rule:** Strip all emojis from strings passed to `draw.text`.
  - **Rule:** Always paste authentic transparent PNG vector icons from `icons/` using `canvas.paste(icon, xy, icon)`.
  - **Rule:** For checkmarks or arrows, draw clean vector primitives (`draw.line`) or use standard ASCII like `[OK]`, `>>>`.

* **ZERO SUBTITLE / TEXT CLIPPING:**
  - **Rule:** Never use fixed large font sizes for variable text length.
  - **Rule:** Always use dynamic font auto-scaling with a maximum width constraint of `max_w = 880px` (on 1080px canvas).
  - **Rule:** Maintain at least 100px safety margin on left and right borders.
  - **Rule:** Right-align all card metrics using `W - 120 - text_width`.

* **100% UNOBSTRUCTED HOST FACE:**
  - Host Alex is the consistent human face of Neural Pulse AI.
  - Alex's face, eyes, hair, and upper body (y = 100 to y = 1240) must remain **100% clean and unobstructed**.
  - All subtitles belong in the lower third (y = 1350 - 1550).
  - Brand badges belong at the top (y = 60 - 120).

---

## 2. Viral Retention Formula ("Rekga Chiqadigan" Standards)
To maximize YouTube Shorts algorithm performance (APV > 90%, VVSA > 80%):
1. **The 0-3 Second Pattern Interrupt Hook:**
   - **Visual:** Pulsing red/amber alert pill at top (`! URGENT: 2026 AI BLUEPRINT !`).
   - **Camera Movement:** Explosive Punch Zoom (snap from 1.22x down to 1.05x in 1.2s).
   - **Audio SFX:** Deep sub-bass drop (`sub_drop.wav`) + fast whoosh (`whoosh.wav`) at t=0.15s.
   - **Script Delivery:** High tempo (+14%), direct call-to-action addressing viewer's immediate pain or curiosity.
2. **Visual Pacing & B-Roll:**
   - Scene cuts every 6 to 9 seconds.
   - Flash transitions (`0.15s white flash`) and synchronized sound effects on every cut.
   - Real high-resolution footage (datacenter, cyberpunk street, particle effects) rather than static images.
3. **Interactive Visual Proof:**
   - Dynamic radial audio waveforms, scrolling terminal rain, platform multiplier cards.
   - Live audio frequency equalizer bars at the bottom reacting to the soundtrack.
4. **High-Conversion Outro (CTA):**
   - Question hook: Ask the audience which tool they'll try to drive comments.
   - Animated YouTube Subscribe Pill: Smooth state change to "SUBSCRIBED" with green checkmark and ringing gold bell at ~51s.

---

## 3. Audio & Voice Standards
* **Voice Model:** Microsoft Azure Neural Speech (`en-US-ChristopherNeural`).
* **Pacing:** `rate='+14%'`, `pitch='+1Hz'` for crisp, confident, and energetic delivery.
* **Music & SFX Mix:**
  - Speech volume: 0.88
  - SFX track: 0.45
  - Background beat: 0.11
  - Max peak limiter: -0.98 to prevent clipping.

---

## 4. Reusable Engine Location
All video production must utilize or follow `C:\Users\user\Downloads\viral_video_engine.py`.
