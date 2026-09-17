# Xavfsizlik modeli

## Autentifikatsiya

Jpilot **Clerk** boshqariladigan autentifikatsiya xizmatidan foydalanadi. Hech qanday maxsus parol saqlash, bcrypt, yoki JWT yaratish kodlari yo'q.

- Clerk barcha foydalanuvchi sessiyalarini boshqaradi
- Har bir API so'rovi Clerk middleware orqali tekshiriladi
- Frontend Clerk React komponentlarini ishlatadi
- Ruxsatsiz so'rovlar 401 javob oladi

## Avtorizatsiya

- Har bir himoyalangan endpoint foydalanuvchi autentifikatsiyasini tekshiradi
- Workspace egalik tekshiruvi: foydalanuvchi faqat o'zining workspace'lariga kirishga ruxsat oladi
- Workspace a'zo roli tekshiriladi (owner, admin, editor, viewer)
- YouTube tokenlar faqat server tomonida saqlanadi va frontend'ga hech qachon berilmaydi

## OAuth tokenlarni saqlash

- YouTube OAuth refresh tokenlar ma'lumotlar bazasida shifrlangan holda saqlanadi
- Access tokenlar faqat kerak bo'lganda yangilanadi va xotirada saqlanadi
- Token ma'lumotlari log'larga, xato xabarlariga, yoki API javoblariga hech qachon yozilmaydi
- Frontend hech qachon tokenlarni ko'rmaydi

## Kirish tekshiruvi

- Barcha kirishlar Zod bilan tekshiriladi
- Fayl turi va hajmi cheklangan
- SQL injection'ga qarshi Drizzle ORM parametrlangan so'rovlardan foydalanadi
- XSS'ga qarshi HTML tozalanadi
- CSRF himoyasi mavjud

## Tashqi ma'lumotlardan himoya

- YouTube'dan kelgan sarlavhalar, tavsiflar, va izohlar tozalanadi
- AI prompt injection'ga qarshi import qilingan ma'lumotlar sanitizatsiya qilinadi
- Zararli metadata aniqlanadi va ogohlantirish beriladi

## Rate limiting

- API endpointlar tezlik cheklangandan foydalanadi
- YouTube API kvota chegaralari kuzatiladi va xabar beriladi
- Qayta urinishlar eksponensial kechikish bilan cheklangan
- Muvaffaqiyatsiz so'rovlar ham kvotadan hisoblanadi

## Audit log

Quyidagi amallar log'ga yoziladi:
- YouTube kanalni ulash/uzish
- Token yangilash/muddati tugash
- Kontent yaratish/o'zgartirish/o'chirish
- Tasdiqlash/rad etish
- Nashr qilish (muvaffaqiyatli va muvaffaqiyatsiz)
- Telegram ulash/uzish
- Sozlamalar o'zgartirish

## Sirlarni himoya qilish

Sirlar hech qachon quyidagi joylarda bo'lmasligi kerak:
- Manba kodi
- Git repository
- Frontend bundlelari
- Xato xabarlari
- Skrinshots
- Ma'lumotlar bazasi seed fayllar
- README yoki hujjatlar
- Chat yoki log fayllar

## Ma'lumotlarni o'chirish

- Foydalanuvchi workspace'ni o'chirishi mumkin
- O'chirish barcha bog'liq ma'lumotlarni o'chiradi
- YouTube OAuth tokenlar bekor qilinadi
- Telegram ulanish uziladi
- Audit loglar belgilangan muddat saqlanadi
