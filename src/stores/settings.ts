import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
// توجه: فرض می‌کنم فایل './types' شامل تعریفات Theme و Locale و UserSettings است.
// اگر این فایل وجود نداشته باشد، این بخش خطا خواهد داد.
import type { UserSettings, Theme, Locale } from './types'; 

// کلید Local Storage
const STORAGE_KEY = 'userSettings';

// مقادیر پیش‌فرض
const DEFAULT_SETTINGS: UserSettings = {
    name: 'User', // نام پیش‌فرض برای تشخیص اولین بازدید
    theme: 'light',
    locale: 'en',
};

// تابع کمکی برای بارگذاری تنظیمات از Local Storage
function loadSettings(): UserSettings {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        // مدیریت خطای احتمالی در هنگام خواندن JSON از Local Storage
        try {
            return JSON.parse(stored) as UserSettings;
        } catch (e) {
            console.error("Error loading user settings from Local Storage:", e);
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
}

// تعریف Store
export const useSettingsStore = defineStore('settings', () => {
    // بارگذاری تنظیمات هنگام ساخت Store
    const settings = ref<UserSettings>(loadSettings());

    // Computed Properties برای دسترسی راحت‌تر
    const userName = computed(() => settings.value.name);
    const currentTheme = computed(() => settings.value.theme);
    const currentLocale = computed(() => settings.value.locale);

    // توابع برای به‌روزرسانی مستقیم مقادیر
    function updateName(newName: string) {
        settings.value.name = newName;
    }

    function updateTheme(newTheme: Theme) {
        settings.value.theme = newTheme;
    }

    function updateLocale(newLocale: Locale) {
        settings.value.locale = newLocale;
    }

    // --- تابع جدید: Toggle Theme (برطرف کننده خطا در App.vue) ---
    function toggleTheme() {
        const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light';
        updateTheme(newTheme);
        console.log(`Theme toggled to: ${newTheme}`);
    }

    // مشاهده تغییرات و ذخیره در Local Storage (Persistence)
    watch(
        settings,
        (newSettings) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        },
        { deep: true } // نظارت بر تغییرات عمیق آبجکت
    );

    return {
        settings,
        userName,
        currentTheme,
        currentLocale,
        updateName,
        updateTheme,
        updateLocale,
        toggleTheme // <--- این متد اکنون در اینجا بازگردانده شده است
    };
});
