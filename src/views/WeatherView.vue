<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CityData } from '@/stores/types';
import { useWeatherStore } from '@/stores/weather';
import { useNotificationStore } from '@/stores/notification';
import citiesRawData from '@/data/iran-cities.json';

const { t, locale } = useI18n();
const weatherStore = useWeatherStore();
const notify = useNotificationStore();

const selectedCity = ref<CityData | null>(weatherStore.getSavedCity);

const weatherData = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const cities = citiesRawData as CityData[];

// Mapping function 
const getWeatherMapping = (temp: number) => {
    if (temp > 30) return { icon: 'mdi-weather-sunny', text: t('Very Hot'), color: 'red', gradient: 'to top right, #f8d49a, #ff9800' };
    if (temp > 20) return { icon: 'mdi-weather-partly-cloudy', text: t('Warm'), color: 'orange', gradient: 'to top right, #ffb74d, #ffa726' };
    if (temp > 10) return { icon: 'mdi-weather-cloudy', text: t('Mild'), color: 'blue-grey', gradient: 'to top right, #90a4ae, #78909c' };
    if (temp > 0) return { icon: 'mdi-weather-rainy', text: t('Cool & Rainy'), color: 'indigo', gradient: 'to top right, #7986cb, #5c6bc0' };
    return { icon: 'mdi-weather-snowy', text: t('Cold'), color: 'cyan', gradient: 'to top right, #80deea, #4dd0e1' };
};

// Fetch function
async function fetchWeather(city: CityData) {
    isLoading.value = true;
    error.value = null;
    weatherData.value = null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch weather data.');
        const data = await response.json();
        weatherData.value = data;
    } catch (err: any) {
        console.error('Weather API Error:', err);
        error.value = t('Error fetching weather data.');
    } finally {
        isLoading.value = false;
    }
}

watch(selectedCity, (newCity) => {
    if (newCity) fetchWeather(newCity);
    else weatherData.value = null;
}, { immediate: true });

const saveCityToDashboard = () => {
    if (selectedCity.value) {
        weatherStore.saveWeatherCity(selectedCity.value);
        const cityNameDisplay = locale.value === 'fa' && selectedCity.value.name_fa ? selectedCity.value.name_fa : selectedCity.value.city;
        notify.saveCity(t('Default city saved: ') + cityNameDisplay);
    }
};

const canSaveCity = computed(() => !!selectedCity.value);

const cityName = computed(() => {
    return selectedCity.value
        ? (locale.value === 'fa' && selectedCity.value.name_fa ? selectedCity.value.name_fa : selectedCity.value.city)
        : '';
});

const temperature = computed(() => {
    return weatherData.value?.current_weather?.temperature !== undefined
        ? weatherData.value.current_weather.temperature
        : null;
});

const weatherDisplay = computed(() => {
    if (temperature.value !== null) return getWeatherMapping(temperature.value);
    return { icon: 'mdi-cloud-question', text: t('Select City'), color: 'grey', gradient: 'to top right, #e0e0e0, #bdbdbd' };
});

const formattedTemperature = computed(() => {
    return temperature.value !== null ? `${temperature.value} °C` : '--';
});

const windSpeed = computed(() => {
    return weatherData.value?.current_weather?.windspeed !== undefined
        ? `${weatherData.value.current_weather.windspeed} km/h`
        : '--';
});
</script>

<template>
    <v-container>
        <div class="d-flex align-center mb-6">
            <h1 class="text-h4 font-weight-bold primary--text">
                <v-icon size="large" class="mr-2">mdi-weather-sunny-alert</v-icon>
                {{ t('Weather Forecast') }}
            </h1>
        </div>

        <v-card class="mx-auto pa-6 elevation-8 rounded-xl" max-width="500">
            <v-card-title class="text-h5 mb-6 text-center font-weight-bold">
                {{ t('Find the current weather') }}
            </v-card-title>

            <v-autocomplete v-model="selectedCity" :items="cities" :label="t('enter_city')"
                :item-title="locale === 'fa' ? 'name_fa' : 'city'" item-value="city" return-object variant="solo-filled"
                density="comfortable" clearable rounded="lg" class="mb-4">
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.name_fa || item.raw.city" :subtitle="item.raw.city">
                        <template v-slot:prepend>
                            <v-icon color="primary">mdi-map-marker-outline</v-icon>
                        </template>
                    </v-list-item>
                </template>
            </v-autocomplete>

            <v-btn v-if="canSaveCity" @click="saveCityToDashboard" color="primary" variant="flat" rounded="lg" block
                class="mb-6 elevation-2 font-weight-bold">
                <v-icon start>mdi-content-save-outline</v-icon>
                {{ t('Save as Default City') }}
            </v-btn>

            <v-alert v-if="isLoading" type="info" variant="tonal" class="mb-4 rounded-lg">
                <v-progress-linear indeterminate color="info" class="mb-2"></v-progress-linear>
                {{ t('Loading weather data...') }}
            </v-alert>
            <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4 rounded-lg">
                <v-icon start>mdi-alert-circle</v-icon>
                {{ error }}
            </v-alert>
            <v-alert v-else-if="!selectedCity" type="warning" variant="tonal" class="mb-4 rounded-lg">
                <v-icon start>mdi-map-search</v-icon>
                {{ t('Please select a city to view the forecast.') }}
            </v-alert>

            <v-card v-if="selectedCity && !isLoading && temperature !== null" :color="weatherDisplay.color"
                :style="`background: linear-gradient(${weatherDisplay.gradient});`"
                class="pa-6 text-white rounded-xl elevation-12">
                <div class="text-h5 mb-4 font-weight-medium">{{ cityName }}</div>

                <v-row class="align-center">
                    <v-col cols="6" class="text-left">
                        <v-icon size="80" color="white">{{ weatherDisplay.icon }}</v-icon>
                    </v-col>
                    <v-col cols="6" class="text-right">
                        <div class="text-h3 font-weight-bold">
                            {{ formattedTemperature }}
                        </div>
                    </v-col>
                </v-row>

                <v-divider class="my-4 border-opacity-75"></v-divider>

                <v-row>
                    <v-col cols="6" class="text-left">
                        <v-icon size="small" class="mr-1">mdi-weather-windy</v-icon>
                        <span class="text-caption font-weight-medium">{{ t('Wind') }}: {{ windSpeed }}</span>
                    </v-col>
                    <v-col cols="6" class="text-right">
                        <v-chip size="default" color="white" variant="outlined" class="font-weight-bold">
                            {{ weatherDisplay.text }}
                        </v-chip>
                    </v-col>
                </v-row>
            </v-card>
        </v-card>
    </v-container>
</template>

<style scoped>
/* (Styles are good as they are) */
</style>