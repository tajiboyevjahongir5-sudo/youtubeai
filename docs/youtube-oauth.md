# YouTube OAuth sozlash

## 1. Google Cloud Console'da loyiha yaratish

1. [Google Cloud Console](https://console.cloud.google.com) ga kiring
2. Yangi loyiha yarating yoki mavjudini tanlang
3. **APIs & Services > Library** ga o'ting
4. Quyidagi API'larni yoqing:
   - **YouTube Data API v3**
   - **YouTube Analytics API**

## 2. OAuth 2.0 credentials yaratish

1. **APIs & Services > Credentials** ga o'ting
2. **Create Credentials > OAuth 2.0 Client ID** bosing
3. Application type: **Web application**
4. Name: `Jpilot`
5. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/youtube/callback`
   - Production: `https://your-domain.com/api/youtube/callback`
6. **Create** bosing
7. Client ID va Client Secret'ni ko'chirib oling

## 3. OAuth consent screen sozlash

1. **OAuth consent screen** ga o'ting
2. User Type: **External** (test uchun) yoki **Internal** (Google Workspace)
3. App name: `Jpilot`
4. Kerakli ma'lumotlarni to'ldiring
5. Scopes qo'shing:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/yt-analytics.readonly`
6. Test users qo'shing (development uchun)

## 4. Environment o'zgaruvchilarini sozlash

```env
YOUTUBE_CLIENT_ID=your-client-id-here
YOUTUBE_CLIENT_SECRET=your-client-secret-here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

## 5. Kvota chegaralari

| Amal | Narx | Kunlik limit |
|------|------|-------------|
| `videos.insert` (yuklash) | 1 unit | 100 ta (alohida bucket) |
| `videos.update` | 50 unit | Umumiy pooldan |
| `videos.list` | 1 unit | Umumiy pooldan |
| `search.list` | 1 unit | 100 ta (alohida bucket) |
| **Umumiy pool** | — | 10,000 unit/kun |

Jpilot kuniga 2 ta video yuklaydi = kuniga 2 unit (100 ta limitdan).

## 6. Muhim eslatmalar

- Test rejimida faqat ro'yxatdan o'tgan foydalanuvchilar OAuth orqali ulanishi mumkin
- Production uchun Google'ning app tekshiruv jarayonidan o'tish kerak
- Refresh tokenlarni xavfsiz saqlang — hech qachon frontendga bermang
- Token muddati tugaganda avtomatik yangilanish mexanizmi ishlaydi
- Foydalanuvchi har doim YouTube kanalini uzish imkoniyatiga ega bo'lishi kerak
