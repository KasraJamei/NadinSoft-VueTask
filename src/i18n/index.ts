import { createI18n, type I18nOptions } from 'vue-i18n';
import { en as vuetifyEn } from 'vuetify/locale';
import { fa as vuetifyFa } from 'vuetify/locale';


// Farsi (Persian) Messages
const fa = {
    $vuetify: vuetifyFa,
    "in": "در",

    // Time-based Greetings: Structured to work with the RTL/LTR splitting logic in DashboardView.vue
    welcome: 'خوش آمدید، {name}',
    good_morning: 'صبح بخیر، {name}',
    good_afternoon: 'عصر بخیر، {name}',
    good_evening: 'شب بخیر، {name}',

    // Menu and Main Titles
    dashboard: 'داشبورد',
    todos: 'لیست کارها',
    profile: 'پروفایل',

    // Navigation Menu
    nav_dashboard: 'داشبورد',
    nav_todos: 'کارها',
    nav_weather: 'آب و هوا',
    nav_profile: 'پروفایل',

    // Settings (ProfileView & Modals)
    'User Profile': 'پروفایل کاربری',
    'Account Details': 'جزئیات حساب',
    'Member Since': 'عضویت از',
    'Not set yet': 'هنوز تنظیم نشده',
    'Log Out': 'خروج',
    'Please enter your name to personalize your experience.': 'لطفاً نام خود را برای شخصی‌سازی تجربه وارد کنید.',
    'Continue': 'ادامه',
    'Your Name': 'نام شما',
    'Welcome!': 'خوش آمدید!',
    'Logging Out': 'در حال خروج',
    'Light': 'روشن',
    'Dark': 'تیره',

    name: 'نام',
    theme: 'پوسته',
    locale: 'زبان',
    save: 'ذخیره',
    light: 'روشن',
    dark: 'تیره',
    english: 'English',
    farsi: 'فارسی',
    settings_saved: 'تنظیمات با موفقیت ذخیره شد.',

    // Application Keys (Todos, Weather, Dialogs, Alerts, Notifications)
    "title": {
        "todo_list": "لیست کارها (TODO)",
        "weather_forecast": "پیش‌بینی آب و هوا"
    },
    "heading": {
        "manage_tasks": "مدیریت کارهای شما",
        "find_current_weather": "مشاهده آب و هوای فعلی"
    },
    "button": {
        "add": "افزودن",
        "edit": "ویرایش",
        "delete": "حذف",
        "cancel": "انصراف",
        "save_changes": "ذخیره تغییرات",
        "delete_all": "حذف همه",
        "save_default_city": "ذخیره به عنوان شهر پیش‌فرض"
    },
    "status": {
        "completed": "انجام شده",
        "pending": "در انتظار"
    },
    "todo": {
        "placeholder": "چه کاری باید انجام شود؟",
        "filter_by": "فیلتر بر اساس",
        "sort_by": "مرتب‌سازی بر اساس",
        "toggle_sort_direction": "تغییر جهت مرتب‌سازی",
        "tasks_shown": "کار در انتظار انجام شدن",
        "tasks_remaining": "تسک باقی مانده", // FIX: Removed {count}
        "delete_all_tasks_title": "حذف تمام کارها",
        "task_title_label": "عنوان کار",
        "mark_as_completed": "علامت‌گذاری به عنوان انجام شده"
    },
    "filter_options": {
        "all": "همه",
        "pending": "در انتظار",
        "completed": "انجام شده"
    },
    "sort_options": {
        "creation_time": "زمان ایجاد",
        "alphabetical": "حروف الفبا"
    },
    "dialog": {
        "edit_task_title": "ویرایش کار",
        "confirm_deletion_title": "تأیید حذف",
        "delete_single_prompt": "آیا از حذف این کار مطمئن هستید؟",
        "confirm_delete_all_title": "تأیید حذف همه",
        "delete_all_prompt_1": "آیا کاملاً مطمئن هستید که می‌خواهید **تمام** کارها را حذف کنید؟",
        "delete_all_prompt_2": "این عمل غیرقابل بازگشت است.",
        "total_tasks_to_delete": "تعداد کل کارهای حذف شدنی:"
    },
    "alert": {
        "empty_list": "لیست کارهای شما خالی است. برای شروع یک کار جدید اضافه کنید.",
        "no_tasks_match_filter": "کاری مطابق با فیلتر یا معیار مرتب‌سازی فعلی پیدا نشد.",
        "loading_weather": "در حال بارگذاری اطلاعات آب و هوا...",
        "select_city_prompt": "لطفاً یک شهر را برای مشاهده پیش‌بینی انتخاب کنید.",
        "error_fetching_weather": "خطا در دریافت اطلاعات آب و هوا."
    },
    "weather": {
        "enter_city_placeholder": "نام شهر را وارد کنید",
        "wind": "باد",
        "status_very_hot": "بسیار گرم",
        "status_warm": "گرم",
        "status_mild": "ملایم",
        "status_cool_rainy": "خنک و بارانی",
        "status_cold": "سرد",
        "status_select_city": "شهر را انتخاب کنید",
        "in_preposition": "در"
    },
    "notification": {
        "name_updated": "نام به {name} تغییر کرد",
        "locale_changed": "زبان به {locale} تغییر یافت",
        "theme_light": "تغییر به حالت روشن",
        "theme_dark": "تغییر به حالت تاریک",
        "task_added": "کار اضافه شد: {task}",
        "task_already_exists": "این کار از قبل وجود دارد: {task}",
        "task_updated": "کار به‌روزرسانی شد: {task}",
        "task_completed": "کار انجام شد: {task}",
        "task_reopened": "کار دوباره باز شد: {task}",
        "task_deleted": "کار حذف شد: {task}",
        "all_tasks_deleted": "همه کارها حذف شدند",
        "cannot_save_edit": "ذخیره تغییرات امکان‌پذیر نیست. کاری با این نام از قبل وجود دارد.",
        "default_city_saved": "شهر پیش‌فرض ذخیره شد: {city}",
        "successfully_logged_out": "با موفقیت خارج شدید."
    }
};

// English Messages
const en = {
    $vuetify: vuetifyEn,
    "in": "in",

    // Time-based Greetings
    welcome: 'Welcome, {name}',
    good_morning: 'Good morning, {name}',
    good_afternoon: 'Good afternoon, {name}',
    good_evening: 'Good evening, {name}',

    // Menu and Main Titles
    dashboard: 'Dashboard',
    todos: 'Todos',
    profile: 'Profile',

    // Navigation Menu
    nav_dashboard: 'Dashboard',
    nav_todos: 'Todos',
    nav_weather: 'Weather',
    nav_profile: 'Profile',

    // Settings (ProfileView & Modals)
    'User Profile': 'User Profile',
    'Account Details': 'Account Details',
    'Member Since': 'Member Since',
    'Not set yet': 'Not set yet',
    'Log Out': 'Log Out',
    'Please enter your name to personalize your experience.': 'Please enter your name to personalize your experience.',
    'Continue': 'Continue',
    'Your Name': 'Your Name',
    'Welcome!': 'Welcome!',
    'Logging Out': 'Logging Out',
    'Light': 'Light',
    'Dark': 'Dark',

    name: 'Name',
    theme: 'Theme',
    locale: 'Language',
    save: 'Save',
    light: 'Light',
    dark: 'Dark',
    english: 'English',
    farsi: 'فارسی',
    settings_saved: 'Settings saved successfully.',

    // Application Keys (Todos, Weather, Dialogs, Alerts, Notifications)
    "title": {
        "todo_list": "TODO List",
        "weather_forecast": "Weather Forecast"
    },
    "heading": {
        "manage_tasks": "Manage Your Tasks",
        "find_current_weather": "Find the current weather"
    },
    "button": {
        "add": "Add",
        "edit": "Edit",
        "delete": "Delete",
        "cancel": "Cancel",
        "save_changes": "Save Changes",
        "delete_all": "Delete All",
        "save_default_city": "Save as Default City"
    },
    "status": {
        "completed": "Completed",
        "pending": "Pending"
    },
    "todo": {
        "placeholder": "What needs to be done?",
        "filter_by": "Filter By",
        "sort_by": "Sort By",
        "toggle_sort_direction": "Toggle Sort Direction",
        "tasks_shown": "Pending Tasks",
        "tasks_remaining": "Pending Tasks", // FIX: Simplified
        "delete_all_tasks_title": "Delete All Tasks",
        "task_title_label": "Task Title",
        "mark_as_completed": "Mark as Completed"
    },
    "filter_options": {
        "all": "All",
        "pending": "Pending",
        "completed": "Completed"
    },
    "sort_options": {
        "creation_time": "Creation Time",
        "alphabetical": "Alphabetical"
    },
    "dialog": {
        "edit_task_title": "Edit Task",
        "confirm_deletion_title": "Confirm Deletion",
        "delete_single_prompt": "Are you sure you want to delete this task?",
        "confirm_delete_all_title": "Confirm Delete All",
        "delete_all_prompt_1": "Are you absolutely sure you want to delete ALL tasks?",
        "delete_all_prompt_2": "This action cannot be undone.",
        "total_tasks_to_delete": "Total tasks to delete:"
    },
    "alert": {
        "empty_list": "Your task list is empty. Please add a new task to get started.",
        "no_tasks_match_filter": "No tasks found matching the current filter or sort criteria.",
        "loading_weather": "Loading weather data...",
        "select_city_prompt": "Please select a city to view the forecast.",
        "error_fetching_weather": "Error fetching weather data."
    },
    "weather": {
        "enter_city_placeholder": "Enter City Name",
        "wind": "Wind",
        "status_very_hot": "Very Hot",
        "status_warm": "Warm",
        "status_mild": "Mild",
        "status_cool_rainy": "Cool & Rainy",
        "status_cold": "Cold",
        "status_select_city": "Select City",
        "in_preposition": "in"
    },
    "notification": {
        "name_updated": "Name updated to: {name}",
        "locale_changed": "Language changed to: {locale}",
        "theme_light": "Switched to Light Mode",
        "theme_dark": "Switched to Dark Mode",
        "task_added": "Task added: {task}",
        "task_already_exists": "Task already exists: {task}",
        "task_updated": "Task updated: {task}",
        "task_completed": "Task completed: {task}",
        "task_reopened": "Task reopened: {task}",
        "task_deleted": "Task deleted: {task}",
        "all_tasks_deleted": "All tasks deleted",
        "cannot_save_edit": "Cannot save changes. A todo with that name already exists.",
        "default_city_saved": "Default city saved: {city}",
        "successfully_logged_out": "Successfully logged out."
    }
};


const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en,
        fa,
    },
    legacy: false,
    globalInjection: true,
} as I18nOptions);

export default i18n;