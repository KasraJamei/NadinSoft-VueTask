// src/stores/weather.ts

import { defineStore } from 'pinia';
import type { CityData } from './types'; 

const LOCAL_STORAGE_KEY = 'weather_store_city';

interface WeatherState {
    savedCity: CityData | null;
}

// تابع کمکی برای بارگذاری وضعیت از localStorage
const loadState = (): WeatherState => {
    try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            return { savedCity: JSON.parse(storedData) as CityData };
        }
    } catch (error) {
        console.error("Could not load weather state from localStorage:", error);
    }
    return { savedCity: null };
};

// تابع کمکی برای ذخیره وضعیت در localStorage
const saveState = (city: CityData | null) => {
    try {
        if (city) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(city));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    } catch (error) {
        console.error("Could not save weather state to localStorage:", error);
    }
};

export const useWeatherStore = defineStore('weather', {
    // هنگام بارگذاری Store، وضعیت از localStorage لود می‌شود
    state: loadState,

    actions: {
        /**
         * شهر انتخاب شده را ذخیره کرده و در localStorage ماندگار می‌کند.
         */
        saveWeatherCity(city: CityData | null) {
            this.savedCity = city;
            // ذخیره در localStorage
            saveState(city);
        },
    },

    getters: {
        getSavedCity: (state) => state.savedCity,
    }
});