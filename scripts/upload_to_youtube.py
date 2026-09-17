import os
import sys
import json
import time
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def get_env_var(key, default=""):
    val = os.getenv(key)
    if val:
        return val
    env_file = os.path.join(os.path.dirname(__file__), "..", "apps", "server", ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith(f"{key}="):
                        return line.strip().split("=", 1)[1]
        except Exception:
            pass
    return default

CLIENT_ID = get_env_var("YOUTUBE_CLIENT_ID")
CLIENT_SECRET = get_env_var("YOUTUBE_CLIENT_SECRET")
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly"
]

TOKEN_FILES = [
    r"c:\Users\user\Downloads\jpilot\apps\server\data\youtube_token.json",
    r"c:\Users\user\Downloads\youtube_tokens.json"
]

VIDEO_PATH = r"C:\Users\user\Downloads\neural_pulse_short.mp4"
TITLE = "Top 5 AI Tools That Work While You Sleep in 2026 #shorts"
DESCRIPTION = """Stop trading your time for money. These 5 autonomous AI tools run 24/7 so you don't have to:
1. AutoFlow 2.0 - Connects email, calendar & Notion
2. VoicePilot - Turns 1-minute voice memos into code & scripts
3. DevEngine - Autonomous debugging & cloud deployment
4. Synthetix - Repurposes 1 video into 10 viral clips

Which AI tool will you try first? Comment below and subscribe to @NeuralPulseAI-m3e!

#ai #automation #artificialintelligence #productivity #techtok #shorts"""

TAGS = ["AI tools", "artificial intelligence", "automation", "productivity", "Neural Pulse AI", "ChatGPT", "AI productivity", "tech trends 2026", "shorts"]
CATEGORY_ID = "28"
PRIVACY_STATUS = "public"

def load_credentials():
    for fpath in TOKEN_FILES:
        if os.path.exists(fpath):
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                access_token = data.get("access_token")
                refresh_token = data.get("refresh_token")
                if access_token or refresh_token:
                    creds = Credentials(
                        token=access_token,
                        refresh_token=refresh_token,
                        token_uri="https://oauth2.googleapis.com/token",
                        client_id=CLIENT_ID,
                        client_secret=CLIENT_SECRET,
                        scopes=SCOPES
                    )
                    if creds.expired and creds.refresh_token:
                        creds.refresh(Request())
                        # Save refreshed token
                        data["access_token"] = creds.token
                        with open(fpath, "w", encoding="utf-8") as fw:
                            json.dump(data, fw, indent=2)
                    return creds
            except Exception as e:
                print(f"Token o'qishda ogohlantirish ({fpath}): {e}")
    return None

def upload_video(creds, video_path, title, description, tags, privacy_status="public"):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video fayli topilmadi: {video_path}")
    
    file_size_mb = os.path.getsize(video_path) / (1024 * 1024)
    print(f"🎬 Video yuklash boshlanmoqda: {video_path} ({file_size_mb:.2f} MB)")
    print(f"📌 Sarlavha: {title}")
    
    youtube = build("youtube", "v3", credentials=creds)
    
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": CATEGORY_ID,
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en"
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False
        }
    }
    
    media = MediaFileUpload(
        video_path,
        mimetype="video/mp4",
        chunksize=1024*1024*5, # 5MB chunks
        resumable=True
    )
    
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            print(f"⏳ Yuklanmoqda... {progress}%")
            
    video_id = response.get("id")
    shorts_url = f"https://youtube.com/shorts/{video_id}"
    print(f"\n🎉 TABRIKLAYMIZ! Video muvaffaqiyatli YouTube'ga yuklandi!")
    print(f"🆔 Video ID: {video_id}")
    print(f"🔗 Shorts Havolasi: {shorts_url}")
    return video_id, shorts_url

if __name__ == "__main__":
    creds = load_credentials()
    if not creds or not creds.valid:
        print("❌ YouTube token topilmadi yoki yaroqsiz!")
        print("Iltimos, brauzer orqali avtorizatsiyadan o'ting:")
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyt-analytics.readonly&response_type=code&client_id={CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fyoutube%2Fcallback"
        print(auth_url)
        sys.exit(1)
    
    upload_video(creds, VIDEO_PATH, TITLE, DESCRIPTION, TAGS, PRIVACY_STATUS)
