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
    isDone: boolean;
}

/** * Defines the structure for city data, matching the JSON structure but adding Farsi name. */
export interface CityData {
    city: string; // English name (matches JSON's 'city' field)
    name_fa?: string; // Farsi name: Made OPTIONAL with '?'
    lat: string; // Latitude (matches JSON's 'lat' field, as a string)
    lng: string; // Longitude (matches JSON's 'lng' field, as a string)
    // The rest of the fields (country, iso2, admin_name, etc.) are ignored for simplicity.
}
// =======================================================================
// Weather Data Types
// =======================================================================

/** Defines the core structure of the current weather data from Open-Meteo API. */
export interface CurrentWeather {
    time: string; 
    temperature: number; 
    weathercode: number; 
    windspeed: number; 
}

/** Defines the full API response structure for current weather. */
export interface WeatherApiResponse {
    latitude: number;
    longitude: number;
    current_weather: CurrentWeather;
}