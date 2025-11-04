import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { UserSettings, Theme, Locale } from './types';
import { useNotificationStore, type NotificationType } from '@/stores/notification';

const STORAGE_KEY = 'userSettings';
const DEFAULT_SETTINGS: UserSettings = {
    name: '',
    theme: 'light',
    locale: 'en',
    memberSince: '',
};

function loadSettings(): UserSettings {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as UserSettings;
        } catch (e) {
            console.error('Error loading user settings:', e);
        }
    }
    return { ...DEFAULT_SETTINGS };
}

export const useSettingsStore = defineStore('settings', () => {
    const { locale: i18nLocale } = useI18n({ useScope: 'global' });
    const { t } = useI18n();

    // State
    const settings = ref<UserSettings>(loadSettings());

    // Getters
    const userName = computed(() => settings.value.name);
    const currentTheme = computed(() => settings.value.theme);
    const currentLocale = computed(() => settings.value.locale);
    const memberSince = computed(() => settings.value.memberSince);

    // Helpers
    function _showThemeNotification(theme: Theme) {
        const notify = useNotificationStore();
        const message = t('notification.theme_changed', { theme: t(theme) });
        const type: NotificationType = theme === 'light' ? 'theme_light' : 'theme_dark';
        notify.info(message, type);
    }

    // Actions
    function updateName(newName: string) {
        const trimmed = newName.trim();
        settings.value.name = trimmed;
        if (trimmed && !settings.value.memberSince) {
            settings.value.memberSince = new Date().toISOString();
        }
    }

    function updateTheme(newTheme: Theme) {
        if (settings.value.theme === newTheme) return;
        settings.value.theme = newTheme;
        _showThemeNotification(newTheme);
    }

    function updateLocale(newLocale: Locale) {
        settings.value.locale = newLocale;
        i18nLocale.value = newLocale;
    }

    function toggleTheme() {
        const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light';
        updateTheme(newTheme);
    }

    // Persistence
    watch(settings, newSettings => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }, { deep: true });

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