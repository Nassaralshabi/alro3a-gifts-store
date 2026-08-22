# قالب متغيرات البيئة

انسخ القيم التالية يدوياً إلى ملف `.env` محلي أو إلى لوحة أسرار منصة الاستضافة. لا ترفع ملف `.env` ولا تستخدم قيماً حقيقية في هذا الملف.

```dotenv
NODE_ENV=production
PORT=3000

DATABASE_URL=mysql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:3306/DATABASE_NAME
JWT_SECRET=replace-with-a-long-random-secret

# مطلوبة فقط عند الإبقاء على OAuth الحالي خارج Manus.
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=

# مطلوبة عند الإبقاء على Forge/S3 والتخزين الوسيط الحالي.
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# اختيارية لتكامل واجهة Shopify.
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_API_ACCESS_TOKEN=

# إعدادات عامة اختيارية.
VITE_APP_TITLE=مطبعة الروعة للهدايا
VITE_APP_LOGO=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```
