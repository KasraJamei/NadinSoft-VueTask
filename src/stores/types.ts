// Data types for user settings
export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'fa';

/** Defines the structure for user settings (persisted in Local Storage). */
export interface UserSettings {
    name: string;
    theme: Theme;
    locale: Locale;
}

/** Defines the structure for a single Todo item. */
export interface TodoItem {
    id: number;
    text: string;
    isDone: boolean; // Flag to indicate if the task is completed
}

/** * Defines the structure for city data, primarily used for weather lookup.
 * Contains necessary geographical coordinates.
 */
export interface CityData {
    name_en: string; // English name for searching/display
    name_fa: string; // Farsi name for display
    latitude: number;
    longitude: number;
}