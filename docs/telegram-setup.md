# Telegram bot sozlash

## 1. Bot yaratish

1. Telegram'da [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting: `Jpilot Bot`
4. Username tanlang: `jpilot_bot` (yoki boshqa mavjud nom)
5. BotFather bergan tokenni ko'chirib oling

## 2. Environment sozlash

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## 3. Bot buyruqlari

BotFather'da `/setcommands` orqali quyidagi buyruqlarni sozlang:

```
start - Botni ishga tushirish
link - YouTube kanalni ulash
status - Kanal holati
approve - Kontent tasdiqlash
help - Yordam
```

## 4. Hisobni ulash jarayoni

1. Foydalanuvchi Jpilot web ilovasida **Integratsiyalar > Telegram** ga o'tadi
2. Tizim bir martalik 6 xonali kod yaratadi (5 daqiqa amal qiladi)
3. Foydalanuvchi Telegram botga `/link XXXXXX` buyrug'ini yuboradi
4. Bot kodni tekshiradi va hisobni ulaydi
5. Muvaffaqiyatli ulangandan keyin bildirishnomalar boshlanadi

## 5. Xavfsizlik

- Faqat ulangan Telegram foydalanuvchilari kanalni boshqarishi mumkin
- Ulanish kodi 5 daqiqadan keyin yaroqsiz bo'ladi
- Barcha Telegram amallari audit log'ga yoziladi
- Ruxsatsiz foydalanuvchilar rad etiladi
- Bot tokeni hech qachon frontendga berilmaydi

## 6. Bildirishnomalar

Bot quyidagi bildirishnomalarni yuboradi:
- Video tayyor — tasdiqlash so'rovi
- Yuklash muvaffaqiyatli
- Yuklash muvaffaqiyatsiz
- YouTube autentifikatsiya muddati tugagan
- Kunlik xulosa
- Haftalik analitika
- Siyosat yoki mualliflik huquqi xavfi aniqlanganda

## 7. Telegram orqali tasdiqlash

Bot tasdiqlash so'rovini inline tugmalar bilan yuboradi:
- ✅ Tasdiqlash
- ❌ Rad etish
- 🔄 Qayta yaratish

Har bir tugma bosilganda natija audit log'ga yoziladi.
