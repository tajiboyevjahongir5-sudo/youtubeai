# Mahalliy ishlab chiqish muhiti

## Talablar

- **Node.js** 20.0.0 yoki undan yuqori
- **pnpm** 9.15.0 yoki undan yuqori
- **PostgreSQL** 15 yoki undan yuqori
- **Redis** 7 yoki undan yuqori

## Bosqichma-bosqich sozlash

### 1. Bog'liqliklarni o'rnatish

```bash
pnpm install
```

### 2. Environment sozlash

```bash
cp .env.example .env
```

`.env` faylni oching va quyidagi o'zgaruvchilarni to'ldiring:

- `DATABASE_URL` — PostgreSQL ulanish satri
- `CLERK_PUBLISHABLE_KEY` — Clerk dashboard'dan
- `CLERK_SECRET_KEY` — Clerk dashboard'dan
- `REDIS_URL` — Redis ulanish satri

Ixtiyoriy (ishlab chiqish uchun mock adapterlar ishlaydi):
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `TELEGRAM_BOT_TOKEN`

### 3. Ma'lumotlar bazasini yaratish

```bash
createdb jpilot
pnpm db:push
```

### 4. Ishga tushirish

```bash
pnpm dev
```

Bu buyruq quyidagilarni ishga tushiradi:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Telegram bot (agar token berilgan bo'lsa)

### 5. Ma'lumotlar bazasini boshqarish

```bash
# Schema o'zgarishlarini qo'llash
pnpm db:push

# Migratsiya yaratish
pnpm db:generate

# Drizzle Studio (GUI)
pnpm db:studio
```

## Development adapters

Agar YouTube yoki AI API kalitlari bo'lmasa, mock adapterlar avtomatik ishlatiladi. Mock adapterlar rivojlanish uchun namuna ma'lumotlarni qaytaradi.

Ishlab chiqish muhitida `NODE_ENV=development` bo'lganda:
- **AI Service** → MockAIProvider (namuna skriptlar va metadata)
- **YouTube Service** → MockYouTubeProvider (yuklash simulyatsiyasi)
- **Video Provider** → MockVideoProvider (video generatsiya simulyatsiyasi)

## Foydali buyruqlar

```bash
pnpm typecheck    # TypeScript tekshirish
pnpm lint         # ESLint
pnpm test         # Vitest testlar
pnpm build        # Production build
pnpm clean        # node_modules va dist tozalash
```
