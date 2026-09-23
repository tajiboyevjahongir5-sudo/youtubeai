# Jpilot Studio — Production Xavfsizlik va Konfiguratsiya Qo‘llanmasi

Ushbu hujjat audit natijasida amalga oshirilgan xavfsizlik va arxitektura o‘zgarishlari, production muhiti talablari va sozlamalarini tavsiflaydi.

---

## 1. Environment O‘zgaruvchilari (Tavsiya va Majburiyatlar)

| O‘zgaruvchi | Muhit | Tavsif | Majburiy |
|---|---|---|---|
| `NODE_ENV` | Production / Dev | `production` yoki `development` | Ha |
| `PORT` | Production | Server tinglaydigan port (sukut bo‘yicha: `3000`) | Yo‘q |
| `JWT_SECRET` | Production | Tokenlarni imzolash uchun sirli kalit (**Kamida 32 ta belgi bo‘lishi shart!**) | **Ha (Prod)** |
| `FRONTEND_URL` | Production | Ruxsat etilgan frontend domeni (masalan: `https://jpilot.uz`) | Ha |
| `DATABASE_URL` | Production | PostgreSQL ulanish manzili | Tavsiya etiladi |
| `YOUTUBE_CLIENT_ID` | Production | Google Cloud OAuth Client ID | Integratsiya uchun |
| `YOUTUBE_CLIENT_SECRET` | Production | Google Cloud OAuth Client Secret | Integratsiya uchun |
| `YOUTUBE_REDIRECT_URI` | Production | OAuth callback URL (masalan: `https://jpilot.uz/api/youtube/callback`) | Integratsiya uchun |
| `YOUTUBE_MOCK_MODE` | Test / Local | Faqat test muhitida soxta mockni yoqish (`true`). **Productionda taqiqlangan!** | Yo‘q |

---

## 2. Autentifikatsiya va Sessiya Xavfsizligi

1. **Yagona JWT Tizimi:**
   - Clerk yoki noaniq dev fallbacklar butunlay olib tashlandi.
   - Har bir token `HS256` algoritmi bilan `crypto.timingSafeEqual` orqali tekshiriladi.
   - Token ichida `sub`, `iss: 'jpilot'`, `aud: 'jpilot-app'`, `iat` va `exp` (7 kun) mavjud.

2. **httpOnly Cookie (XSS Himoyasi):**
   - Brauzer sessiyasi uchun token `localStorage` da saqlanmaydi!
   - Login va Register vaqtida backend `Set-Cookie: jpilot_token=...; HttpOnly; SameSite=Lax; Secure` orqali yuboradi.
   - Brauzerdagi XSS skriptlar tokenni o‘g‘irlay olmaydi.
   - Frontend barcha API so‘rovlarni `credentials: 'include'` bilan yuboradi.
   - `POST /api/auth/logout` chaqirilganda cookie tozalanadi.

3. **Parol Siyosati va Backdoor Bartaraf Etilishi:**
   - Minimal parol uzunligi: **10 ta belgi**.
   - Parol sifatida foydalanuvchi ismi yoki emailini kiritish taqiqlangan.
   - **Kritik:** Tizim egasi (owner) uchun noto‘g‘ri parolda parolni avtomatik o‘zgartiruvchi xavfsizlik teshigi butunlay o‘chirildi.
   - Parolni o‘zgartirish uchun joriy eski parol `timingSafeEqual` bilan qat’iy tekshiriladi.
   - Noto‘g‘ri email yoki parol kiritilganda bir xil xabar qaytariladi (user enumeration himoyasi).

4. **Brute-Force va Rate Limiting:**
   - Har bir IP va email kombinatsiyasi uchun 15 daqiqa ichida maksimal 5 ta muvaffaqiyatsiz urinishdan so‘ng vaqtinchalik bloklanadi (`429 Too Many Requests`).

---

## 3. Workspace va Multi-Tenant Izolyatsiyasi

1. **Ruxsatlar Tekshiruvi:**
   - Har bir himoyalangan yo‘l (`/api/workspaces/:id/*`) `requireAuth` va `requireWorkspace` orqali o‘tadi.
   - `default` yoki `ws_` bilan boshlangan workspace IDlar uchun tekshiruvsiz o‘tish (bypass) butunlay olib tashlandi.
   - Foydalanuvchi faqat o‘ziga tegishli yoki a’zo bo‘lgan workspace ma’lumotlariga kira oladi. Begona workspace uchun qat’iy **`403 Forbidden`** qaytariladi.

---

## 4. YouTube Integratsiyasi

1. **Productionda Mock Taqiqlanishi:**
   - Production rejimida YouTube sozlanmagan bo‘lsa, tizim soxta muvaffaqiyat qaytarmaydi.
   - `uploadVideo` yoki integratsiya chaqirilganda aniq konfiguratsiya xatoligi (`YouTube API sozlanmagan`) qaytariladi.
   - Mock xizmat faqat lokal test muhitida explicit `YOUTUBE_MOCK_MODE=true` bayrog‘i orqali yoqilishi mumkin.
2. **Xavfsiz OAuth Callback:**
   - Faqat `/api/youtube/callback` ochiq qoldirildi. Barcha boshqa YouTube boshqaruv endpointlari autentifikatsiya va workspace tekshiruvi ostida.

---

## 5. Scheduler va Vaqt Zonalari

1. **Dinamik Workspacelar:**
   - Hardcoded `['ws_j7ktjxw0', 'default']` ro‘yxati olib tashlandi.
   - Scheduler barcha ro‘yxatdan o‘tgan foydalanuvchilar va faol tokenli workspacelarni dinamik aniqlaydi.
2. **Vaqt Zonasi:**
   - Yuklash vaqtlari (masalan, 14:00, 20:00) serverning UTC vaqtiga emas, workspacening saqlangan vaqt zonasiga (`Asia/Tashkent`, UTC+5) muvofiq hisoblanadi.

---

## 6. Repository va Katta Media Fayllar

1. **Git Tozaligi:**
   - 366 MB li barcha `.mp4`, `.webm` va og‘ir audio keshlari Git kuzatuvidan (`git rm --cached`) chiqarildi.
   - `.gitignore` ga barcha render, video va kesh yo‘llari qo‘shildi.
   - Loyiha hajmi yengillashdi va deploy jarayoni bir necha soniyada bajariladi.

---

## 7. Servis Monitoring Endpointlari

- **`GET /health`**: Server jarayoni holati, mahsulot nomi va database ulanish holatini qaytaradi.
- **`GET /ready`**: Database so‘rovlarga to‘liq tayyorligini tekshiradi (Kubernetes / Railway readiness probe uchun).
