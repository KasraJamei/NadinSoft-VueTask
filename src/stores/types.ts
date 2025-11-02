// ─────────────────────────────────────────────────────────────────────────────
// Data types for user settings
// ─────────────────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'fa';

/** Persisted user settings (LocalStorage) */
export interface UserSettings {
    name: string;
    theme: Theme;
    locale: Locale;
    memberSince: string;               // ISO string – first save date
}

/** Single Todo item */
export interface TodoItem {
    id: number;
    text: string;
    isDone: boolean;
}

/** City data (matches JSON + optional Farsi name) */
export interface CityData {
    city: string;                    // English name
    name_fa?: string;                // Farsi name (optional)
    lat: string;
    lng: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Weather Data Types
// ─────────────────────────────────────────────────────────────────────────────
export interface CurrentWeather {
    time: string;
    temperature: number;
    weathercode: number;
    windspeed: number;
}

export interface WeatherApiResponse {
    latitude: number;
    longitude: number;
    current_weather: CurrentWeather;
}