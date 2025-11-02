export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'fa';

export interface UserSettings {
    name: string;
    theme: Theme;
    locale: Locale;
    memberSince: string;
}

export interface TodoItem {
    id: number;
    text: string;
    isDone: boolean;
}

export interface CityData {
    city: string;
    name_fa?: string;
    lat: string;
    lng: string;
}

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