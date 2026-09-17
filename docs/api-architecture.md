# API arxitekturasi

## Umumiy ko'rinish

Jpilot OpenAPI-first yondashuvdan foydalanadi. API kontrakt manbai — OpenAPI 3.1 spetsifikatsiyasi.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## Autentifikatsiya

Barcha himoyalangan endpointlar Clerk autentifikatsiyasini talab qiladi. Frontend Clerk SDK orqali `Authorization: Bearer <token>` sarlavhasini yuboradi.

## Endpointlar ro'yxati

### Foydalanuvchi
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/me` | Joriy foydalanuvchi |

### Workspace
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/api/workspaces` | Workspace yaratish |
| GET | `/api/workspaces/:id` | Workspace olish |
| PUT | `/api/workspaces/:id/settings` | Sozlamalarni yangilash |
| POST | `/api/workspaces/:id/onboarding` | Onboarding tugatish |

### Dashboard
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/workspaces/:id/dashboard` | Dashboard ma'lumotlari |

### YouTube
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/youtube/connect` | OAuth boshlash |
| GET | `/api/youtube/callback` | OAuth callback |
| POST | `/api/youtube/disconnect` | Kanalni uzish |
| GET | `/api/workspaces/:id/channel` | Kanal ma'lumotlari |

### Kontent
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/workspaces/:id/content` | Kontent ro'yxati |
| POST | `/api/workspaces/:id/content` | Kontent yaratish |
| GET | `/api/workspaces/:id/content/:cid` | Kontent olish |
| PUT | `/api/workspaces/:id/content/:cid` | Kontent yangilash |
| DELETE | `/api/workspaces/:id/content/:cid` | Kontent o'chirish |

### Generatsiya
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/api/workspaces/:id/ideas/generate` | G'oya yaratish |
| POST | `/api/workspaces/:id/content/:cid/generate-script` | Skript yaratish |
| POST | `/api/workspaces/:id/content/:cid/generate-metadata` | Metadata yaratish |
| POST | `/api/workspaces/:id/content/:cid/generate-storyboard` | Storyboard yaratish |
| POST | `/api/workspaces/:id/content/:cid/quality-review` | Sifat tekshiruvi |

### Tasdiqlash
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/workspaces/:id/approvals` | Tasdiqlash so'rovlari |
| POST | `/api/workspaces/:id/approvals/:aid/approve` | Tasdiqlash |
| POST | `/api/workspaces/:id/approvals/:aid/reject` | Rad etish |
| POST | `/api/workspaces/:id/content/:cid/request-approval` | Tasdiqlash so'rash |

### Nashr qilish
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/api/workspaces/:id/content/:cid/schedule` | Rejalashtirish |
| DELETE | `/api/workspaces/:id/content/:cid/schedule` | Rejalashtirishni bekor qilish |
| GET | `/api/workspaces/:id/publishing-jobs` | Nashr vazifalar |

### Analitika
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/workspaces/:id/analytics/summary` | Analitika xulosa |
| GET | `/api/workspaces/:id/analytics/videos/:vid` | Video analitika |
| GET | `/api/workspaces/:id/insights` | Tushunchalar |
| GET | `/api/workspaces/:id/strategy-memory` | Strategiya xotirasi |

### Telegram
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/api/workspaces/:id/telegram/link` | Ulanish kodi yaratish |
| POST | `/api/workspaces/:id/telegram/disconnect` | Uzish |
| POST | `/api/workspaces/:id/telegram/test` | Test xabar |

### Tizim
| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/workspaces/:id/audit-logs` | Audit loglar |
| GET | `/api/workspaces/:id/activity` | Faoliyat |
| GET | `/api/health` | Health check |

## Xato javoblari

Barcha xatolar quyidagi formatda qaytariladi:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Sarlavha kiritilishi shart",
    "details": {}
  }
}
```

Umumiy xato kodlari:
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `CONFLICT` (409)
- `RATE_LIMITED` (429)
- `INTERNAL_ERROR` (500)
- `YOUTUBE_QUOTA_EXCEEDED` (429)
- `YOUTUBE_AUTH_EXPIRED` (401)
