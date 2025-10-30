// src/stores/types.ts

// انواع داده‌ای برای تنظیمات کاربر
export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'fa';

export interface UserSettings {
    name: string;
    theme: Theme;
    locale: Locale;
}

// تعریف ساختار یک آیتم Todo
export interface TodoItem {
    id: number;
    text: string;
    isDone: boolean; // برای قابلیت علامت‌گذاری به عنوان انجام شده
}

// تعریف ساختار داده‌های شهرها برای Autocomplete آب و هوا
export interface CityData {
    name_en: string; // نام انگلیسی برای جستجو
    name_fa: string; // نام فارسی برای نمایش
    latitude: number;
    longitude: number;
}