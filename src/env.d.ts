/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // اگر متغیرهای محیطی دیگری دارید که در فایل‌های .env تعریف شده‌اند، باید آنها را نیز در اینجا اعلام کنید.
  // مثال:
  // readonly VITE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}