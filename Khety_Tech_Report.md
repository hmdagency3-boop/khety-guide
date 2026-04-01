# تقرير تقني — تطبيق Khety Guide
**تاريخ التقرير:** مارس 2026

---

## 1. اللغات المدعومة في واجهة التطبيق

التطبيق يدعم **7 لغات** مع اكتشاف تلقائي للغة المتصفح:

| الكود | اللغة | العلم | الاتجاه |
|-------|-------|-------|---------|
| `ar`  | العربية | 🇪🇬 | RTL (يمين لشمال) |
| `en`  | English | 🇬🇧 | LTR |
| `fr`  | Français | 🇫🇷 | LTR |
| `es`  | Español | 🇪🇸 | LTR |
| `it`  | Italiano | 🇮🇹 | LTR |
| `zh`  | 中文 | 🇨🇳 | LTR |
| `ru`  | Русский | 🇷🇺 | LTR |

> اللغة العربية تأتي مع دعم كامل لـ RTL — كل عناصر الواجهة تنعكس تلقائياً، والخط يتغير، والاتجاه يتكيف في كل صفحة.

---

## 2. لغات البرمجة المستخدمة

| اللغة | الاستخدام |
|-------|----------|
| **TypeScript** | اللغة الأساسية — الـ Frontend والـ Backend كلهم |
| **JavaScript** | ملفات الإعداد (vite.config, postcss…) |
| **SQL (PostgreSQL)** | قاعدة البيانات — جميع الجداول والـ migrations والـ seed |
| **CSS** | Tailwind v4 — التصميم والـ animations |
| **HTML** | هيكل التطبيق عبر JSX |

---

## 3. التقنيات الأساسية

### 3.1 Frontend — واجهة المستخدم

| التقنية | الإصدار | الدور |
|---------|---------|------|
| **React** | v19 | مكتبة بناء الواجهات |
| **Vite** | v7 | أداة البناء والـ dev server |
| **TypeScript** | v5 | type safety على الـ Frontend |
| **Tailwind CSS** | v4 | نظام التصميم بالكامل |
| **Framer Motion** | latest | الـ animations والـ transitions |
| **Wouter** | v3.3 | الـ routing داخل التطبيق |
| **i18next** | v25 | نظام الترجمة (7 لغات) |
| **react-i18next** | v16 | ربط i18next مع React |
| **i18next-browser-languagedetector** | v8 | اكتشاف لغة المتصفح تلقائياً |
| **Lucide React** | latest | أيقونات التطبيق |
| **date-fns** | v3 | تنسيق التواريخ (مع دعم العربي) |
| **class-variance-authority** | latest | مكونات UI متغيرة |
| **clsx + tailwind-merge** | latest | دمج كلاسات Tailwind |

### 3.2 الخريطة والموقع الجغرافي

| التقنية | الدور |
|---------|------|
| **Leaflet** | v1.9 — مكتبة الخرائط التفاعلية |
| **react-leaflet** | v5 — ربط Leaflet مع React |
| **OpenStreetMap** | مزوّد بلاطات الخريطة (مجاني) |

### 3.3 المدفوعات والاشتراكات

| التقنية | الدور |
|---------|------|
| **Stripe** | SDK v21 — معالجة المدفوعات |
| **@stripe/react-stripe-js** | v6 — مكونات Stripe في React |
| **@stripe/stripe-js** | v9 — تهيئة Stripe على الـ Frontend |

### 3.4 PWA — تطبيق الجوال

| التقنية | الدور |
|---------|------|
| **vite-plugin-pwa** | v1.2 — تحويل التطبيق لـ PWA |
| **Workbox Core** | v7 — إدارة الـ Service Worker |
| **Workbox Precaching** | v7 — التخزين المؤقت offline |
| **Web Push (web-push)** | v3.6 — إشعارات الـ Push |

### 3.5 مكونات UI

| المكتبة | المكونات المستخدمة |
|---------|------------------|
| **Radix UI** | Dialog, Label, Scroll Area, Separator, Slot, Tabs, Toast, Toggle, Tooltip |
| **react-easy-crop** | v5 — قص الصور (صورة البروفايل) |

---

## 4. Backend — الخادم

| التقنية | الإصدار | الدور |
|---------|---------|------|
| **Node.js** | 22+ | بيئة تشغيل الـ Server |
| **Express** | v5 | إطار عمل الـ API |
| **TypeScript** | v5 | type safety على الـ Backend |
| **tsx** | latest | تشغيل TypeScript مباشرة بدون compile |
| **esbuild** | v0.27 | بناء الـ Backend للـ production |
| **cors** | v2 | سياسة مشاركة الموارد |
| **cookie-parser** | v1.4 | إدارة الـ Cookies |
| **web-push** | v3.6 | إرسال إشعارات للمستخدمين |

---

## 5. قاعدة البيانات والـ Backend-as-a-Service

### Supabase

| الخدمة | الاستخدام |
|--------|----------|
| **PostgreSQL** | قاعدة البيانات الرئيسية |
| **Supabase Auth** | نظام المصادقة وإدارة المستخدمين |
| **Supabase Storage** | تخزين الصور (صور المجتمع، الأفاتار) |
| **Supabase Edge Functions** | معالجة رسائل خيتي بالـ AI |
| **Row Level Security (RLS)** | صلاحيات أمان على مستوى الصفوف |
| **Realtime** | تحديثات فورية للـ chat polling |

---

## 6. الـ AI والذكاء الاصطناعي

| المكون | التفاصيل |
|--------|---------|
| **Supabase Edge Functions** | تستقبل الرسائل وترسلها للـ AI |
| **خيتي (Khety AI)** | المساعد الذكي للتخطيط والإجابة |
| **دعم الصور** | المستخدم يرفع صورة وخيتي يحللها |
| **السياق التاريخي** | آخر 10 رسائل مضمّنة في كل prompt |
| **تفضيلات المسافر** | ملف المستخدم يُضاف تلقائياً لـ prompt التخطيط |
| **دعم متعدد اللغات** | خيتي يرد بنفس لغة التطبيق المختارة |

---

## 7. هيكل المشروع

```
workspace/
├── artifacts/
│   ├── khety/          ← Frontend (React + Vite PWA)
│   └── api-server/     ← Backend (Express API)
├── packages/
│   ├── api-zod/        ← Shared Zod schemas
│   └── api-client-react/ ← React hooks للـ API
└── supabase/           ← SQL migrations & seed files
```

---

## 8. الصفحات الرئيسية

| الصفحة | الوظيفة |
|--------|--------|
| **Home** | الصفحة الرئيسية والـ onboarding |
| **Chat (خيتي)** | المحادثة مع الـ AI مع إدارة الجلسات |
| **Explore** | استكشاف المعالم السياحية |
| **Landmark Detail** | تفاصيل كل معلم + خريطة |
| **Map** | خريطة تفاعلية لكل المعالم |
| **Community** | الـ feed الاجتماعي مع بوستات ولايكات وكومنتات |
| **Safety** | نصائح الأمان وأرقام الطوارئ |
| **Profile** | الملف الشخصي وتفضيلات السفر |
| **Pricing / Billing** | الاشتراكات والمدفوعات |
| **Admin** | لوحة تحكم المنصة |

---

## 9. المميزات التقنية البارزة

| الميزة | الوصف |
|--------|------|
| **AR Camera Scanner** | تصوير الهيروغليف والمعالم والتعرف عليها |
| **Golden Age Modal** | تجربة تصور الحضارة المصرية القديمة |
| **Pinch-to-Zoom** | تكبير صور المجتمع بإيماءة الإصبعين |
| **Double-Tap Like** | لايك بلمستين على صور البوستات (مثل انستجرام) |
| **Official Posts Priority** | بوستات المنصة الرسمية تظهر أولاً في الـ feed |
| **Landmark Links in Chat** | أسماء المعالم في ردود خيتي تصبح روابط قابلة للنقر |
| **RTL Support** | دعم كامل للعربي مع عكس الواجهة |
| **Push Notifications** | إشعارات حتى لو التطبيق مغلق |
| **Offline Support** | بعض الصفحات تعمل بدون إنترنت (PWA) |
| **Session Management** | إدارة متعددة للمحادثات مع خيتي |
| **Travel Profile Injection** | تفضيلات المستخدم تُضاف تلقائياً لطلبات التخطيط |

---

*تم إنشاء هذا التقرير بناءً على تحليل شامل لكود المشروع — مارس 2026*
