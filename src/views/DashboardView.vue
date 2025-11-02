<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useTodoStore } from '@/stores/todos';
import { useSettingsStore } from '@/stores/settings';
import { useWeatherStore } from '@/stores/weather';
import type { CityData } from '@/stores/types';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const weatherStore = useWeatherStore();
const { t, locale } = useI18n();
const router = useRouter();

const pendingTasksCount = computed(() => todoStore.todos.filter(t => !t.isDone).length);
const userName = computed(() => settingsStore.userName);
const currentTheme = computed(() => settingsStore.currentTheme);
const savedCity = computed(() => weatherStore.getSavedCity);


// --- Time and Greeting Logic (Unchanged) ---
const currentTime = ref(new Date());
let timer: number | undefined;

const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
});

const greeting = computed(() => {
    const hour = currentTime.value.getHours();

    if (hour >= 5 && hour < 12) {
        return t('Good Morning');
    } else if (hour >= 12 && hour < 18) {
        return t('Good Afternoon');
    } else {
        return t('Good Evening');
    }
});
// -------------------------------------

// --- Animation State ---
// 💡 فقط برای تعداد وظایف باقی‌مانده
const displayedPendingTasks = ref(0);
const animationDuration = 1000; // 1 second animation

// --- Animation Logic ---
let startTimes: Map<string, number> = new Map();
let animationFrames: Map<string, number> = new Map();

/**
 * Functon to animate a number from its current ref value to a target value.
 */
function animateNumber(refToAnimate: Ref<number>, targetValue: number, key: string) {
    if (animationFrames.has(key)) {
        cancelAnimationFrame(animationFrames.get(key)!);
    }

    const startValue = refToAnimate.value;
    const startTime = performance.now();
    startTimes.set(key, startTime);

    const step = (currentTime: number) => {
        const elapsedTime = currentTime - startTimes.get(key)!;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        const interpolatedValue = startValue + (targetValue - startValue) * progress;

        refToAnimate.value = Math.floor(interpolatedValue);

        if (progress < 1) {
            animationFrames.set(key, requestAnimationFrame(step));
        } else {
            refToAnimate.value = targetValue;
            animationFrames.delete(key);
            startTimes.delete(key);
        }
    };

    animationFrames.set(key, requestAnimationFrame(step));
}

watch(pendingTasksCount, (newValue) => {
    animateNumber(displayedPendingTasks, newValue, 'pendingTasks');
}, { immediate: true });
// -------------------------------------


// --- Weather Logic for Dashboard ---
const dashboardWeather = ref<any>(null);
const dashboardWeatherError = ref<string | null>(null);

const getDashboardWeatherMapping = (temp: number) => {
    if (temp > 30) return { text: t('Very Hot'), icon: 'mdi-weather-sunny' };
    if (temp > 20) return { text: t('Warm'), icon: 'mdi-weather-partly-cloudy' };
    if (temp > 10) return { text: t('Mild'), icon: 'mdi-weather-cloudy' };
    if (temp > 0) return { text: t('Cool & Rainy'), icon: 'mdi-weather-rainy' };
    return { text: t('Cold'), icon: 'mdi-weather-snowy' };
};

async function fetchSavedCityWeather(city: CityData) {
    dashboardWeather.value = null;
    dashboardWeatherError.value = null;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch weather data.');
        const data = await response.json();
        dashboardWeather.value = data;
    } catch (err: any) {
        console.error('Dashboard Weather Error:', err);
        dashboardWeatherError.value = t('N/A');
    }
}

const displayTemp = computed(() => {
    return dashboardWeather.value?.current_weather?.temperature !== undefined
        ? `${Math.round(dashboardWeather.value.current_weather.temperature)}°C`
        : '--';
});

// ✅ FIX 1: از تابع کمکی برای نام شهر استفاده کنید (برای ترجمه)
const displayCityName = computed(() => {
    const city = savedCity.value;
    if (!city) return t('Unknown City');
    // چک می‌کند که آیا لوکال فارسی است و نام فارسی در دسترس است یا نه.
    return locale.value === 'fa' && city.name_fa ? city.name_fa : city.city;
});

/** ✅ FIX 2: این متن را برای استفاده مستقیم در تمپلیت آماده می‌کنیم. */
const displayWeatherStatusText = computed(() => {
    const temp = dashboardWeather.value?.current_weather?.temperature;
    if (temp === undefined) {
        return t('No Weather Status');
    }
    const statusText = getDashboardWeatherMapping(temp).text;
    const cityName = displayCityName.value;

    // 💡 ساختار مورد نظر شما: Mild در Mashhad
    // از کلید ترجمه weather_in_city استفاده نمی‌کنیم و مستقیماً متن را می‌سازیم.
    if (locale.value === 'fa') {
        // مثلاً: "ملایم در مشهد"
        return `${statusText} ${t('in')} ${cityName}`;
    } else {
        // مثلاً: "Mild in Mashhad"
        return `${statusText} ${t('in')} ${cityName}`;
    }
});

const weatherIcon = computed(() => {
    const temp = dashboardWeather.value?.current_weather?.temperature;
    if (temp === undefined || !savedCity.value) return 'mdi-cloud-question';
    return getDashboardWeatherMapping(temp).icon;
});

const noCityMessage = computed(() => {
    if (!savedCity.value) {
        return t('Please set your default city in the Weather page.');
    }
    if (dashboardWeatherError.value) {
        return t('Weather data unavailable. Tap for details.');
    }
    return '';
});

watch(savedCity, (newCity) => {
    if (newCity) {
        fetchSavedCityWeather(newCity);
    } else {
        dashboardWeather.value = null;
    }
}, { immediate: true });
// -------------------------------------


// --- Typewriter Effect Logic (Unchanged) ---
const typedGreeting = ref('');
const greetingText = computed(() => `${greeting.value}, ${userName.value}`);

let typingTimeout: number | undefined;
const isTypingComplete = ref(false);

const startTyping = (textToType: string) => {
    if (typingTimeout !== undefined) {
        clearTimeout(typingTimeout);
    }
    typedGreeting.value = '';
    isTypingComplete.value = false;
    let charIndex = 0;

    const typeChar = () => {
        if (charIndex < textToType.length) {
            typedGreeting.value += textToType.charAt(charIndex);
            charIndex++;
            typingTimeout = window.setTimeout(typeChar, 100);
        } else {
            isTypingComplete.value = true;
        }
    };
    typeChar();
};

onMounted(() => {
    timer = window.setInterval(() => {
        currentTime.value = new Date();
    }, 1000);

    startTyping(greetingText.value);
});

watch(greetingText, (newText) => {
    startTyping(newText);
});

onUnmounted(() => {
    if (timer !== undefined) {
        clearInterval(timer);
    }
    if (typingTimeout !== undefined) {
        clearTimeout(typingTimeout);
    }
    animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    animationFrames.clear();
});

const goToWeatherPage = () => {
    router.push({ name: 'weather' });
};
</script>

<template>
    <v-container class="text-center">

        <v-row class="mt-4 justify-center">

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast dashboard-card"
                    :color="currentTheme === 'light' ? 'light-blue-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                        <v-icon left :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'"
                            class="mr-2">mdi-format-list-checks</v-icon>
                        {{ t('Remaining Tasks') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                            {{ displayedPendingTasks }}
                        </p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'" variant="tonal"
                            :to="{ name: 'todos' }" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('View Tasks') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast dashboard-card"
                    :color="currentTheme === 'light' ? 'orange-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                        <v-icon left :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'"
                            class="mr-2">{{ weatherIcon }}</v-icon>
                        {{ t('Weather Status') }}
                    </v-card-title>
                    <v-card-text class="pt-2">

                        <div v-if="!savedCity || dashboardWeatherError">
                            <p class="text-subtitle-1 font-weight-medium text-error mb-2">
                                {{ savedCity ? t('No Weather Data') : t('No Default City Set') }}
                            </p>
                            <p class="text-caption text-medium-emphasis">
                                {{ noCityMessage }}
                            </p>
                        </div>

                        <div v-else>
                            <p class="text-h4 font-weight-black"
                                :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                                {{ displayTemp }}
                            </p>
                            <p class="subtitle-2 text-medium-emphasis">
                                {{ displayWeatherStatusText }}
                            </p>
                        </div>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'"
                            variant="tonal" @click="goToWeatherPage" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ savedCity ? t('Weather Details') : t('Set Default City') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast dashboard-card"
                    :color="currentTheme === 'light' ? 'green-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">
                        <v-icon left :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'"
                            class="mr-2">mdi-cog</v-icon>
                        {{ t('Settings') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">{{
                                settingsStore.currentLocale.toUpperCase()
                            }}</p>
                        <p class="subtitle-2 text-medium-emphasis">{{ settingsStore.currentTheme }} {{ t('Theme') }}</p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'"
                            variant="tonal" :to="{ name: 'profile' }" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('Go to Profile') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

        </v-row>

        <div class="mb-8 mt-12">

            <p class="text-h5 text-md-h4 font-weight-black text-medium-emphasis mb-4">
                {{ formattedTime }}
            </p>

            <p class="text-h3 text-md-h2 font-weight-medium primary--text">
                {{ typedGreeting }}
                <span v-if="!isTypingComplete" class="typing-cursor">|</span>
            </p>
        </div>

    </v-container>
</template>

<style scoped>
/* 💡 FIX 1: Ensures all cards are the same height */
.dashboard-card {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* FIX 2: Ensures the content area of the card has a minimum height to maintain card uniformity */
.v-card-text {
    /* flex-grow: 1; */
    /* این خط در صورت نیاز به رشد فضای میانی استفاده می‌شود */
    min-height: 70px;
    /* تنظیم یک ارتفاع حداقلی برای فضای متن کارت‌ها */
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.hover-scale {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-scale:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.20) !important;
}

.typing-cursor {
    display: inline-block;
    animation: blink 0.7s infinite;
    opacity: 1;
    font-weight: 300;
    margin-left: 2px;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}
</style>