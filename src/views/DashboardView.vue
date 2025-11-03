<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
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

const isRtl = computed(() => locale.value === 'fa');

const pendingTasksCount = computed(() => todoStore.todos.filter(t => !t.isDone).length);
const userName = computed(() => settingsStore.userName);
const currentTheme = computed(() => settingsStore.currentTheme);
const savedCity = computed(() => weatherStore.getSavedCity);

const getDisplayText = (value: string, map: { [key: string]: string }) => {
    return map[value] || value.charAt(0).toUpperCase() + value.slice(1);
};

const themeMap = { light: t('light'), dark: t('dark') };
const localeMap = { en: t('english'), fa: t('farsi') };

const currentTime = ref(new Date());
let timer: number | undefined;

const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString(locale.value, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
});

const greeting = computed(() => {
    const hour = currentTime.value.getHours();
    const name = userName.value || 'User';

    if (hour >= 5 && hour < 12) return t('good_morning', { name });
    if (hour >= 12 && hour < 18) return t('good_afternoon', { name });
    if (hour >= 18 && hour < 22) return t('good_evening', { name });
    return t('welcome', { name });
});

const typedGreeting = ref('');
const greetingText = computed(() => greeting.value);
let typingTimeout: number | undefined;
const isTypingComplete = ref(false);

const startTyping = (text: string) => {
    if (typingTimeout !== undefined) clearTimeout(typingTimeout);
    typedGreeting.value = '';
    isTypingComplete.value = false;
    let i = 0;
    const type = () => {
        if (i < text.length) {
            typedGreeting.value += text.charAt(i);
            i++;
            typingTimeout = window.setTimeout(type, 100);
        } else {
            isTypingComplete.value = true;
        }
    };
    type();
};

onMounted(() => {
    timer = window.setInterval(() => (currentTime.value = new Date()), 1000);

    if (userName.value?.trim() && userName.value !== 'User') {
        startTyping(greetingText.value);
    }

    const handleWelcome = () => {
        if (!isTypingComplete.value && userName.value?.trim()) {
            startTyping(greetingText.value);
        }
    };

    window.addEventListener('welcome-animation-complete', handleWelcome);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (typingTimeout) clearTimeout(typingTimeout);
});

watch(greetingText, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        startTyping(newVal);
    }
});

const displayedPendingTasks = ref(0);
const animationDuration = 1000;
let startTimes = new Map<string, number>();
let animationFrames = new Map<string, number>();

function animateNumber(refToAnimate: any, targetValue: number, key: string) {
    if (animationFrames.has(key)) cancelAnimationFrame(animationFrames.get(key)!);
    const startValue = refToAnimate.value;
    const startTime = performance.now();
    startTimes.set(key, startTime);

    const step = (now: number) => {
        const elapsed = now - startTimes.get(key)!;
        const progress = Math.min(elapsed / animationDuration, 1);
        const interpolated = startValue + (targetValue - startValue) * progress;
        refToAnimate.value = Math.floor(interpolated);
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

watch(pendingTasksCount, (newVal) => {
    animateNumber(displayedPendingTasks, newVal, 'pendingTasks');
}, { immediate: true });

const dashboardWeather = ref<any>(null);
const dashboardWeatherError = ref<string | null>(null);

const getDashboardWeatherMapping = (temp: number) => {
    if (temp > 30) return { text: t('weather.status_very_hot'), icon: 'mdi-weather-sunny' };
    if (temp > 20) return { text: t('weather.status_warm'), icon: 'mdi-weather-partly-cloudy' };
    if (temp > 10) return { text: t('weather.status_mild'), icon: 'mdi-weather-cloudy' };
    if (temp > 0) return { text: t('weather.status_cool_rainy'), icon: 'mdi-weather-rainy' };
    return { text: t('weather.status_cold'), icon: 'mdi-weather-snowy' };
};

async function fetchSavedCityWeather(city: CityData) {
    dashboardWeather.value = null;
    dashboardWeatherError.value = null;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        dashboardWeather.value = data;
    } catch (err) {
        dashboardWeatherError.value = t('alert.error_fetching_weather');
    }
}

const displayTemp = computed(() => {
    return dashboardWeather.value?.current_weather?.temperature !== undefined
        ? `${Math.round(dashboardWeather.value.current_weather.temperature)}°C`
        : '--';
});

const displayCityName = computed(() => {
    const city = savedCity.value;
    if (!city) return t('weather.status_select_city');
    return city.city;
});

const displayWeatherStatusText = computed(() => {
    const temp = dashboardWeather.value?.current_weather?.temperature;
    if (temp === undefined) return `${t('alert.loading_weather')}...`;
    const status = getDashboardWeatherMapping(temp).text;
    const city = displayCityName.value;

    // This returns the full string "Status Preposition City" for both LTR and RTL for template fallback
    if (isRtl.value) {
        return `${status} ${t('weather.in_preposition')} ${city}`;
    }
    return `${status} ${t('in')} ${city}`;
});

const weatherIcon = computed(() => {
    const temp = dashboardWeather.value?.current_weather?.temperature;
    if (temp === undefined || !savedCity.value) return 'mdi-cloud-question';
    return getDashboardWeatherMapping(temp).icon;
});

const noCityMessage = computed(() => {
    if (!savedCity.value) return t('alert.select_city_prompt');
    if (dashboardWeatherError.value) return `${t('alert.error_fetching_weather')}. ${t('nav_weather')}.`;
    return '';
});

watch(savedCity, (city) => {
    if (city) fetchSavedCityWeather(city);
    else dashboardWeather.value = null;
}, { immediate: true });

const goToWeatherPage = () => router.push({ name: 'weather' });

const finalGreetingText = computed(() => typedGreeting.value);

// Helper to reliably separate the greeting (RTL) and the name (LTR) for correct wrapping
const getGreetingParts = (text: string, isRtl: boolean) => {
    if (!isRtl) return { rtlPart: text, ltrPart: '' };

    // The i18n key structure is "عبارت فارسی، {name}"
    // Match[1] = RTL Text (e.g., "عصر بخیر")
    // Match[2] = LTR Name (e.g., "Kasra")
    const match = text.match(/(.*),\s*(.*)$/);

    if (match && match[2]) {
        // FIX: Put the comma with the LTR part for better alignment and remove extra spaces.
        const rtlText = match[1].trim();
        const ltrTextWithComma = `،${match[2].trim()}`;

        return { rtlPart: rtlText, ltrPart: ltrTextWithComma };
    }

    // Fallback logic
    return { rtlPart: text.trim(), ltrPart: '' };
};
</script>

<template>
    <v-container class="text-center">
        <v-row class="mt-4 justify-center">
            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card"
                    :color="currentTheme === 'light' ? 'light-blue-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                        <v-icon left
                            :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'">mdi-format-list-checks</v-icon>
                        {{ t('todos') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                            {{ displayedPendingTasks }}
                        </p>
                        <p class="subtitle-2 text-medium-emphasis">
                            {{ t('todo.tasks_remaining') }}
                        </p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn :to="{ name: 'todos' }" rounded="lg" size="small" variant="tonal"
                            :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('nav_todos') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card"
                    :color="currentTheme === 'light' ? 'orange-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                        <v-icon left :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'">{{
                            weatherIcon }}</v-icon>
                        {{ t('nav_weather') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <div v-if="!savedCity || dashboardWeatherError">
                            <p class="text-subtitle-1 font-weight-medium text-error mb-2">
                                {{ savedCity ? t('alert.error_fetching_weather') : t('weather.status_select_city') }}
                            </p>
                            <p class="text-caption text-medium-emphasis">{{ noCityMessage }}</p>
                        </div>
                        <div v-else>
                            <p class="text-h4 font-weight-black"
                                :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                                {{ displayTemp }}
                            </p>
                            <p class="subtitle-2 text-medium-emphasis">
                                <span v-if="isRtl" class="d-inline-flex" style="direction: rtl;">
                                    <span dir="rtl" class="d-inline-block">
                                        {{
                                            getDashboardWeatherMapping(dashboardWeather?.current_weather?.temperature)?.text
                                        }}
                                        {{ t('weather.in_preposition') }}&nbsp;
                                    </span>
                                    <span dir="ltr" class="d-inline-block">
                                        {{ displayCityName }}
                                    </span>
                                </span>
                                <span v-else>
                                    {{ displayWeatherStatusText }}
                                </span>
                            </p>
                        </div>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn @click="goToWeatherPage" rounded="lg" size="small" variant="tonal"
                            :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'">
                            {{ savedCity ? t('nav_weather') : t('button.save_default_city') }}
                            <v-icon class="ml-2">mdi-arrow-right-circle</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card"
                    :color="currentTheme === 'light' ? 'green-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">
                        <v-icon left
                            :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'">mdi-cog</v-icon>
                        {{ t('nav_profile') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">
                            {{ getDisplayText(settingsStore.currentLocale, localeMap) }}
                        </p>
                        <p class="subtitle-2 text-medium-emphasis">
                            {{ t('theme') }} {{ getDisplayText(settingsStore.currentTheme, themeMap) }}
                        </p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn :to="{ name: 'profile' }" rounded="lg" size="small" variant="tonal"
                            :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('nav_profile') }}
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
                <span v-if="isRtl" class="d-inline-flex" style="direction: rtl;">
                    <span dir="rtl" class="d-inline-block">
                        {{ getGreetingParts(finalGreetingText, isRtl).rtlPart }}&nbsp;
                    </span>
                    <span dir="ltr" class="d-inline-block">
                        {{ getGreetingParts(finalGreetingText, isRtl).ltrPart }}
                    </span>
                </span>
                <span v-else>
                    {{ typedGreeting }}
                </span>
                <span v-if="!isTypingComplete" class="typing-cursor">|</span>
            </p>
        </div>
    </v-container>
</template>

<style scoped>
/* Styles remain the same */
.dashboard-card {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.v-card-text {
    min-height: 70px;
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