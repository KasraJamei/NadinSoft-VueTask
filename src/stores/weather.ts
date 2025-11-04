import { defineStore } from 'pinia';
import type { CityData } from './types';

const LOCAL_STORAGE_KEY = 'weather_store_city';

interface WeatherState {
    savedCity: CityData | null;
}

const loadState = (): WeatherState => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? { savedCity: JSON.parse(data) as CityData } : { savedCity: null };
    } catch (e) {
        console.error('Failed to load weather city', e);
        return { savedCity: null };
    }
};

const saveState = (city: CityData | null) => {
    try {
        if (city) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(city));
        else localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to save weather city', e);
    }
};

export const useWeatherStore = defineStore('weather', {
    state: loadState,
    actions: {
        saveWeatherCity(city: CityData | null) {
            this.savedCity = city;
            saveState(city);
        },
    },
    getters: {
        getSavedCity: (state): CityData | null => state.savedCity,
    },
});