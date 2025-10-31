    import { ref, watch, computed } from 'vue';
    import { defineStore } from 'pinia';
    import type { UserSettings, Theme, Locale } from './types'; 

    // Local Storage Key
    const STORAGE_KEY = 'userSettings';

    // Default values
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

    // Define the Store using the Composition API pattern (Setup Store)
    export const useSettingsStore = defineStore('settings', () => {
        
        // =======================================================================
        // 1. STATE (using ref/reactive from Vue)
        // =======================================================================
        const settings = ref<UserSettings>(loadSettings());

        // =======================================================================
        // 2. GETTERS (using computed from Vue)
        // =======================================================================
        const userName = computed(() => settings.value.name);
        const currentTheme = computed(() => settings.value.theme);
        const currentLocale = computed(() => settings.value.locale);

        // =======================================================================
        // 3. ACTIONS (using simple functions)
        // =======================================================================

        /**
         * Updates the user's name. Persistence is handled by the global watch.
         * @param newName The new name string.
         */
        function updateName(newName: string) {
            settings.value.name = newName;
        }

        /**
         * Updates the application's theme.
         * @param newTheme The new theme ('light' or 'dark').
         */
        function updateTheme(newTheme: Theme) {
            settings.value.theme = newTheme;
        }

        /**
         * Updates the application's locale (language).
         * @param newLocale The new locale ('en' or 'fa').
         */
        function updateLocale(newLocale: Locale) {
            settings.value.locale = newLocale;
        }

        /** * Toggles the theme between the two available options: 'light' and 'dark'.
         */
        function toggleTheme() {
            // Accessing the computed getter via .value
            const newTheme: Theme = currentTheme.value === 'light' ? 'dark' : 'light';
            updateTheme(newTheme); 
            console.log(`Theme toggled to: ${newTheme}`);
        }

        // =======================================================================
        // 4. PERSISTENCE (using watch from Vue)
        // =======================================================================
        watch(
            settings,
            (newSettings) => {
                // Saves changes to Local Storage whenever settings object changes
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