import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import type { UserSettings, Theme, Locale } from './types'; 

/** Key used for storing the settings object in Local Storage. */
const STORAGE_KEY = 'userSettings';

/** Default values for application settings. */
const DEFAULT_SETTINGS: UserSettings = {
    name: 'User', 
    theme: 'light',
    locale: 'en',
};

/**
 * Helper function to load settings from Local Storage upon store initialization.
 * @returns {UserSettings} The loaded settings or default settings if loading fails.
 */
function loadSettings(): UserSettings {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as UserSettings;
        } catch (e) {
            console.error("Error loading user settings from Local Storage:", e);
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
}

/**
 * Defines the Settings Store using the Composition API pattern (Setup Store).
 * This store manages application-wide settings like theme, locale, and user name, 
 * and ensures they persist across sessions using Local Storage.
 */
export const useSettingsStore = defineStore('settings', () => {
    
    // =======================================================================
    // 1. STATE (Reactive data)
    // =======================================================================
    const settings = ref<UserSettings>(loadSettings());

    // =======================================================================
    // 2. GETTERS (Computed values for easy access)
    // =======================================================================
    const userName = computed(() => settings.value.name);
    const currentTheme = computed(() => settings.value.theme);
    const currentLocale = computed(() => settings.value.locale);

    // =======================================================================
    // 3. ACTIONS (Functions for modifying state)
    // =======================================================================

    /**
     * Updates the user's display name.
     * @param {string} newName - The new name string.
     */
    function updateName(newName: string) {
        settings.value.name = newName;
    }

    /**
     * Updates the application's theme.
     * @param {Theme} newTheme - The new theme ('light' or 'dark').
     */
    function updateTheme(newTheme: Theme) {
        settings.value.theme = newTheme;
    }

    /**
     * Updates the application's locale (language).
     * @param {Locale} newLocale - The new locale ('en' or 'fa').
     */
    function updateLocale(newLocale: Locale) {
        settings.value.locale = newLocale;
    }

    /** * Toggles the theme between the two available options: 'light' and 'dark'.
     */
    function toggleTheme() {
        const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light';
        updateTheme(newTheme); 
    }

    // =======================================================================
    // 4. PERSISTENCE (Saves state to Local Storage upon change)
    // =======================================================================
    watch(
        settings,
        (newSettings) => {
            // Saves changes to Local Storage whenever the settings object changes
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        },
        { deep: true } // Monitor deep changes within the settings object
    );

    // Return everything needed by components
    return {
        settings,
        userName,
        currentTheme,
        currentLocale,
        updateName,
        updateTheme,
        updateLocale,
        toggleTheme
    };
});