import sys
import os
import argparse
import asyncio
import edge_tts

async def main():
    parser = argparse.ArgumentParser(description="Synthesize audio via edge_tts")
    parser.add_argument("--voice", default="uz-UZ-MadinaNeural", help="Voice model")
    parser.add_argument("--rate", default="+0%", help="Rate percentage, e.g. +14%")
    parser.add_argument("--pitch", default="+0Hz", help="Pitch, e.g. +1Hz")
    parser.add_argument("--text", default="", help="Text to speak")
    parser.add_argument("--text-file", default="", help="Path to text file")
    parser.add_argument("--output", required=True, help="Output mp3 path")

    args = parser.parse_args()

    text = args.text
    if not text and args.text_file and os.path.exists(args.text_file):
        with open(args.text_file, "r", encoding="utf-8") as f:
            text = f.read()

    if not text:
        text = "Hello from Neural Pulse AI voice synthesis."

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    rate = args.rate if args.rate.startswith(("+", "-")) else f"+{args.rate}"
    pitch = args.pitch if args.pitch.startswith(("+", "-")) else f"+{args.pitch}"

    communicate = edge_tts.Communicate(text, args.voice, rate=rate, pitch=pitch)
    await communicate.save(args.output)
    print(f"SUCCESS:{os.path.abspath(args.output)}")

if __name__ == "__main__":
    asyncio.run(main())
