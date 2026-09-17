# Jpilot

AI yordamida YouTube kanalni boshqarish tizimi.

> **Ogohlantirish:** Jpilot mavjud analitikaga asoslanib kontentni optimizatsiya qilishi mumkin, lekin YouTube tavsiyalari, viral natijalar, ko'rishlar, obunachilar yoki daromadni kafolatlay olmaydi.

## Xususiyatlar

- YouTube kanal ulanishi (rasmiy OAuth)
- AI yordamida kontent g'oyalari yaratish
- Ingliz tilida skript va SEO metadata generatsiyasi
- Kontent tasdiqlash tizimi
- Kuniga 2 ta video rejalashtirish va nashr qilish
- Analitika va strategiya o'rganish tizimi
- Telegram bot orqali bildirishnomalar va boshqarish
- Barcha interfeys o'zbek tilida

## Texnologiyalar

| Qism | Texnologiya |
|------|------------|
| Til | TypeScript |
| Frontend | React 18 + Vite |
| Backend | Express.js |
| Ma'lumotlar bazasi | PostgreSQL + Drizzle ORM |
| Autentifikatsiya | Clerk |
| AI | Gemini API |
| YouTube | YouTube Data API v3 + Analytics API |
| Telegram | grammy |
| Vazifalar | BullMQ + Redis |
| Stillar | Tailwind CSS 4 |

## Tezkor boshlash

### Talablar

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+

### O'rnatish

```bash
# Repozitoriyani klonlash
git clone <repo-url>
cd jpilot

# Bog'liqliklarni o'rnatish
pnpm install

# Environment sozlash
cp .env.example .env
# .env faylni tahrirlang va kerakli kalitlarni qo'shing

# Ma'lumotlar bazasini yaratish
createdb jpilot
pnpm db:push

# Ishlab chiqish serverni ishga tushirish
pnpm dev
```

### Environment o'zgaruvchilari

`.env.example` faylida barcha kerakli o'zgaruvchilar ro'yxati bor. Hech qachon sirlarni kodga yozmang.

Batafsil sozlash uchun: [docs/env-vars.md](docs/env-vars.md)

## Loyiha tuzilishi

```
jpilot/
├── packages/
│   └── shared/          # Umumiy tiplar, enumlar, konstantalar
├── apps/
│   ├── web/             # React frontend
│   ├── server/          # Express backend
│   └── telegram/        # Telegram bot
└── docs/                # Hujjatlar
```

## Hujjatlar

- [Mahalliy ishlab chiqish](docs/setup.md)
- [Environment o'zgaruvchilari](docs/env-vars.md)
- [YouTube OAuth sozlash](docs/youtube-oauth.md)
- [Telegram bot sozlash](docs/telegram-setup.md)
- [API arxitekturasi](docs/api-architecture.md)
- [Xavfsizlik modeli](docs/security.md)
- [Provider adapterlar](docs/providers.md)

## Litsenziya

Xususiy dasturiy ta'minot. Barcha huquqlar himoyalangan.
