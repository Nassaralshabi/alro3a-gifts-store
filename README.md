# مطبعة الروعة — موقع ويب حقيقي متكامل (Full-Stack)

موقع متجر إلكتروني **حقيقي متكامل** بقاعدة بيانات فعلية ومصادقة خادم ولوحة تحكم كاملة — عربي/إنجليزي.

## 🔑 بيانات لوحة التحكم

| الحقل | القيمة |
|---|---|
| الرابط | `/#/admin` |
| اسم المستخدم | `admin` |
| كلمة المرور | `admin` |

> ⚠️ غيّر كلمة المرور من قاعدة البيانات بعد النشر (انظر الأسفل).

## ✨ ما يميز هذه النسخة (حقيقية 100%)

- **قاعدة بيانات فعلية** (SQLite + Prisma): المنتجات والأقسام والطلبات والإعدادات محفوظة فعلياً — تظهر لكل الزوار.
- **تسجيل دخول حقيقي**: مصادقة خادم (JWT + bcrypt) مع جلسة كوكي httpOnly.
- **رفع صور فعلي**: اسحب وأفلت أو اختر صورة → تُحفظ في `public/uploads` وتظهر فوراً.
- **لوحة تحكم كاملة**: إحصائيات حية + CRUD منتجات/أقسام (بالعربي والإنجليزي) + إدارة طلبات بحالات + إعدادات موقع (الشعار، الاسم، البانرات، التواصل) تنعكس فوراً على المتجر.
- **ثنائي اللغة**: عربي RTL / إنجليزي LTR بتبديل فوري في المتجر واللوحة.
- **شاشات كاملة**: رئيسية (سلايدر + أقسام + منتجات) / متجر بفلاتر وبحث / صفحة منتج / تواصل / سلة + إتمام طلب حقيقي.

## 🚀 التشغيل محلياً

```bash
bun install          # أو npm install
bun run db:push      # إنشاء قاعدة البيانات
bun run scripts/seed.ts   # بذر 262 منتجاً + 8 أقسام + admin/admin
bun run dev          # http://localhost:3000
```

## 🌐 النشر على استضافات Node.js

### Vercel (الأسهل)
1. ارفع المستودع إلى GitHub ثم اربطه بـ Vercel.
2. أضف متغيري البيئة: `DATABASE_URL` و `JWT_SECRET`.
3. انشر — Vercel يتعرف على Next.js تلقائياً.
> ملاحظة: Vercel سيرفرفس (serverless) — نظام الملفات مؤقت. الصور المرفوعة تختفي بعد إعادة النشر. الحل: اربط تخزيناً خارجياً (S3/UploadThing) أو استخدم Railway.

### Railway / Render (يحفظ الصور فعلياً) — مُوصى به
1. أنشئ خدمة من مستودع GitHub.
2. أضف متغيرات البيئة (`DATABASE_URL`, `JWT_SECRET`).
3. Railway يوفر قرصاً دائماً — الصور وSQLite يستمران.

### VPS (تحكم كامل)
```bash
git clone <repo> && cd alro3a-store
bun install && bun run db:push && bun run scripts/seed.ts
bun run build && bun run start   # أو استخدم pm2
# اربط Nginx كـ reverse proxy إلى المنفذ 3000
```

## 🔐 المتغيرات البيئية المطلوبة

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | `file:./db/custom.db` (أو رابط MySQL/PostgreSQL) |
| `JWT_SECRET` | سلسلة عشوائية طويلة — **غيّرها في الإنتاج** |

## 🛡️ تغيير كلمة المرور في الإنتاج

```bash
bun -e "const b=require('bcryptjs'); const {PrismaClient}=require('@prisma/client'); const db=new PrismaClient(); db.admin.update({where:{username:'admin'},data:{password:b.hashSync('كلمة_المرور_الجديدة',10)}}).then(()=>{console.log('done');process.exit(0)})"
```

## 🏗️ البنية التقنية

```
├── prisma/schema.prisma        # Admin, Category, Product, Order, OrderItem, Setting
├── scripts/seed.ts             # بذر البيانات (262 منتج + admin/admin)
├── public/uploads/             # الصور المرفوعة + 270 صورة كتالوج
├── src/lib/auth.ts             # JWT + bcrypt + حراسة المسارات
├── src/app/api/
│   ├── auth/{login,logout,me}  # مصادقة حقيقية
│   ├── catalog/                # المتجر العام
│   ├── orders/                 # إنشاء طلب (عام)
│   └── admin/                  # CRUD محمي: products/categories/orders/settings/upload
├── src/components/core.tsx     # الحالة + i18n + API client + router
├── src/components/storefront.tsx  # شاشات المتجر
└── src/components/adminpanel.tsx  # لوحة التحكم كاملة
```

## 📊 مقارنة مع النسخ السابقة

| الجانب | نسخة HTML السابقة | هذه النسخة |
|---|---|---|
| تخزين البيانات | localStorage (لكل جهاز) | **قاعدة بيانات حقيقية مشتركة** |
| تسجيل الدخول | رمز في المتصفح | **JWT + bcrypt على الخادم** |
| الصور | ثابتة | **رفع فعلي من اللوحة** |
| الطلبات | محلية مؤقتة | **محفوظة دائماً مع حالات** |
| التعديلات | لهذا الجهاز فقط | **لجميع الزوار فوراً** |
