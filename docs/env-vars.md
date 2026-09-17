# Environment o'zgaruvchilari

Barcha o'zgaruvchilar `.env` faylida saqlanadi. **Hech qachon** sirlarni kodga, Git'ga, yoki xato xabarlariga yozmang.

## Majburiy

| O'zgaruvchi | Tavsif | Misol |
|------------|--------|-------|
| `DATABASE_URL` | PostgreSQL ulanish satri | `postgresql://postgres:postgres@localhost:5432/jpilot` |
| `CLERK_PUBLISHABLE_KEY` | Clerk autentifikatsiya ochiq kaliti | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk autentifikatsiya maxfiy kaliti | `sk_test_...` |
| `REDIS_URL` | Redis ulanish satri (BullMQ uchun) | `redis://localhost:6379` |

## YouTube integratsiyasi

| O'zgaruvchi | Tavsif |
|------------|--------|
| `YOUTUBE_CLIENT_ID` | Google Cloud Console'dan OAuth 2.0 Client ID |
| `YOUTUBE_CLIENT_SECRET` | Google Cloud Console'dan OAuth 2.0 Client Secret |
| `YOUTUBE_REDIRECT_URI` | OAuth callback URL (default: `http://localhost:3000/api/youtube/callback`) |

YouTube sozlash bo'yicha batafsil: [youtube-oauth.md](youtube-oauth.md)

## AI provider

| O'zgaruvchi | Tavsif |
|------------|--------|
| `GEMINI_API_KEY` | Google AI Studio'dan Gemini API kaliti |

## Telegram bot

| O'zgaruvchi | Tavsif |
|------------|--------|
| `TELEGRAM_BOT_TOKEN` | @BotFather'dan olingan bot token |

Telegram sozlash bo'yicha batafsil: [telegram-setup.md](telegram-setup.md)

## Ilova sozlamalari

| O'zgaruvchi | Tavsif | Default |
|------------|--------|---------|
| `NODE_ENV` | Muhit | `development` |
| `PORT` | Server porti | `3000` |
| `FRONTEND_URL` | Frontend URL (CORS uchun) | `http://localhost:5173` |
| `STORAGE_PATH` | Media fayllar yo'li | `./storage` |

## Xavfsizlik eslatmalari

- `.env` faylni `.gitignore`'ga qo'shing (allaqachon qo'shilgan)
- Sirlarni hech qachon log'larga yozmang
- Production muhitida environment o'zgaruvchilarini platform sirlar tizimi orqali boshqaring
- API kalitlarini chat'ga yozmang — platform sozlamalari orqali kiriting
