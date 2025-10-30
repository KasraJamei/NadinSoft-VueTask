// src/i18n/index.ts

import { createI18n } from 'vue-i18n';

// پیام‌های فارسی (Farsi)
const fa = {
    // پیام‌های خوش‌آمدگویی زمان‌بندی شده
    welcome: 'خوش آمدید، {name}.',
    good_morning: 'صبح بخیر، {name}.',
    good_afternoon: 'عصر بخیر، {name}.',
    good_evening: 'شب بخیر، {name}.',

    // منو و عناوین اصلی
    dashboard: 'داشبورد',
    todos: 'لیست کارها',
    weather: 'آب و هوا',
    profile: 'پروفایل',

    // تنظیمات (ProfileView)
    name: 'نام',
    theme: 'پوسته',
    locale: 'زبان',
    save: 'ذخیره',
    light: 'روشن',
    dark: 'تیره',
    english: 'انگلیسی',
    farsi: 'فارسی',
    settings_saved: 'تنظیمات با موفقیت ذخیره شد.',

    // لیست کارها (TodosView)
    add_todo: 'اضافه کردن کار جدید',
    todo_placeholder: 'عنوان کار...',
    todo_list_title: 'لیست کارهای من',

    // آب و هوا (WeatherView)
    enter_city: 'نام شهر را وارد کنید',
    temperature: 'دما',
    weather_status: 'وضعیت جوی',
    city_not_selected: 'لطفاً شهر مورد نظر را انتخاب کنید.',
    loading_weather: 'در حال دریافت اطلاعات آب و هوا...',
};

// پیام‌های انگلیسی (English)
const en = {
    // Time-based Greetings
    welcome: 'Welcome, {name}.',
    good_morning: 'Good morning, {name}.',
    good_afternoon: 'Good afternoon, {name}.',
    good_evening: 'Good evening, {name}.',

    // Menu and Main Titles
    dashboard: 'Dashboard',
    todos: 'Todos',
    weather: 'Weather',
    profile: 'Profile',

    // Settings (ProfileView)
    name: 'Name',
    theme: 'Theme',
    locale: 'Language',
    save: 'Save',
    light: 'Light',
    dark: 'Dark',
    english: 'English',
    farsi: 'Farsi',
    settings_saved: 'Settings saved successfully.',

    // Todo List (TodosView)
    add_todo: 'Add New Task',
    todo_placeholder: 'Task title...',
    todo_list_title: 'My ToDo List',

    // Weather (WeatherView)
    enter_city: 'Enter city name',
    temperature: 'Temperature',
    weather_status: 'Weather Status',
    city_not_selected: 'Please select a city.',
    loading_weather: 'Fetching weather data...',
};


const i18n = createI18n({
    locale: 'en', // زبان پیش‌فرض
    fallbackLocale: 'en',
    messages: {
        en,
        fa,
    },
    legacy: false, // اجباری برای استفاده از Composition API در Vue 3
    globalInjection: true, // تزریق $t به کامپوننت‌ها (اختیاری)
});

export default i18n;