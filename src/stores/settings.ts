import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { UserSettings, Theme, Locale } from './types';

const STORAGE_KEY = 'userSettings';

const DEFAULT_SETTINGS: UserSettings = {
    name: '',
    theme: 'light',
    locale: 'en',
    memberSince: '', // فقط اولین بار ست میشه
};

function loadSettings(): UserSettings {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored) as UserSettings;
            return parsed;
        } catch (e) {
            console.error('Error loading user settings:', e);
        }
    }
    return { ...DEFAULT_SETTINGS };
}

export const useSettingsStore = defineStore('settings', () => {
    const { locale: i18nLocale } = useI18n({ useScope: 'global' });

    // ────────────────────── STATE ──────────────────────
    const settings = ref<UserSettings>(loadSettings());

    // ───────────────────── GETTERS ─────────────────────
    const userName = computed(() => settings.value.name);
    const currentTheme = computed(() => settings.value.theme);
    const currentLocale = computed(() => settings.value.locale);
    const memberSince = computed(() => settings.value.memberSince);

    // ───────────────────── ACTIONS ─────────────────────
    function updateName(newName: string) {
        const trimmed = newName.trim();
        settings.value.name = trimmed;

        // فقط اولین بار که نام وارد شد → memberSince ثبت کن
        if (trimmed && !settings.value.memberSince) {
            settings.value.memberSince = new Date().toISOString();
        }
    }

    function updateTheme(newTheme: Theme) {
        settings.value.theme = newTheme;
    }

    function updateLocale(newLocale: Locale) {
        settings.value.locale = newLocale;
        i18nLocale.value = newLocale;
    }

    function toggleTheme() {
        const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light';
        updateTheme(newTheme);
    }

    // ─────────────────── PERSISTENCE ───────────────────
    watch(
        settings,
        (newSettings) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        },
        { deep: true }
    );

    return {
        settings,
        userName,
        currentTheme,
        currentLocale,
        memberSince,
        updateName,
        updateTheme,
        updateLocale,
        toggleTheme,
    };
});