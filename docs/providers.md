# Provider adapter interfeyslari

Jpilot adapter naqshidan foydalanadi — tashqi xizmatlar almashtiriladigan adapterlar orqali ulanadi.

## AI Provider

AI provider kontent yaratish uchun ishlatiladi: g'oyalar, skriptlar, metadata, storyboardlar, sifat tekshiruvi.

### Interfeys

```typescript
interface AIProvider {
  generateIdea(context: IdeaContext): Promise<ContentIdea>;
  generateScript(context: ScriptContext): Promise<Script>;
  generateMetadata(context: MetadataContext): Promise<VideoMetadata>;
  generateStoryboard(context: StoryboardContext): Promise<Storyboard>;
  qualityReview(context: ReviewContext): Promise<QualityReview>;
}
```

### Mavjud adapterlar

| Adapter | Holat | Tavsif |
|---------|-------|--------|
| `GeminiAIProvider` | Production | Google Gemini API |
| `MockAIProvider` | Development | Namuna ma'lumotlarni qaytaradi |

### Yangi AI provider qo'shish

1. `apps/server/src/services/ai.service.ts` faylida `AIProvider` interfeysini implement qiling
2. `apps/server/src/env.ts` da yangi provider uchun environment o'zgaruvchilarini qo'shing
3. `apps/server/src/services/ai.service.ts` dagi factory funksiyasiga yangi provider qo'shing

---

## Video Provider

Video provider AI yordamida video generatsiya qilish uchun ishlatiladi.

### Interfeys

```typescript
interface VideoProvider {
  generateVideo(request: GenerateVideoRequest): Promise<string>; // operation ID
  getGenerationStatus(operationId: string): Promise<GenerateVideoResult>;
  cancelGeneration(operationId: string): Promise<void>;
  downloadResult(operationId: string): Promise<Buffer>;
  getProviderCapabilities(): VideoProviderCapabilities;
}
```

### Mavjud adapterlar

| Adapter | Holat | Tavsif |
|---------|-------|--------|
| `ManualVideoProvider` | Production | Foydalanuvchi qo'lda video yuklaydi |
| `MockVideoProvider` | Development | Video generatsiya simulyatsiyasi |

### Muhim eslatma

YouTube'ning o'z video generatsiya API'si (AI Playground) uchun ochiq API mavjud emas. Jpilot YouTube'dan video generatsiya qilishni taklif qilmaydi. Video provider faqat tashqi xizmatlar (Veo, Runway, va h.k.) uchun mo'ljallangan.

---

## YouTube Adapter

YouTube adapter rasmiy YouTube Data API v3 va YouTube Analytics API bilan ishlaydi.

### Interfeys

```typescript
interface YouTubeAdapter {
  // Channel
  getChannelInfo(accessToken: string): Promise<YouTubeChannel>;
  
  // Upload
  uploadVideo(params: UploadParams): Promise<string>; // video ID
  updateVideoMetadata(videoId: string, metadata: VideoMetadata): Promise<void>;
  setThumbnail(videoId: string, imagePath: string): Promise<void>;
  
  // Analytics
  getVideoAnalytics(videoId: string, dateRange: DateRange): Promise<AnalyticsSnapshot>;
  getChannelAnalytics(dateRange: DateRange): Promise<ChannelAnalytics>;
}
```

### Mavjud adapterlar

| Adapter | Holat | Tavsif |
|---------|-------|--------|
| `YouTubeAPIAdapter` | Production | Rasmiy YouTube API |
| `MockYouTubeAdapter` | Development | Yuklash simulyatsiyasi |

---

## Yangi provider qo'shish bo'yicha umumiy ko'rsatma

1. Provider interfeysini implement qiling
2. Environment o'zgaruvchilarini qo'shing
3. Factory funksiyasiga ro'yxatdan o'tkazing
4. `@jpilot/shared` paketdagi `AIProvider` yoki `VideoProvider` enumiga qo'shing
5. Settings UI'da tanlash imkoniyatini qo'shing
6. Testlar yozing
7. Hujjatlantiring
