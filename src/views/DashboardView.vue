<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useTodoStore } from '@/stores/todos'
import { useSettingsStore } from '@/stores/settings'
import { useWeatherStore } from '@/stores/weather'
import type { CityData } from '@/stores/types'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const weatherStore = useWeatherStore()
const { t, locale } = useI18n()
const router = useRouter()

const isRtl = computed(() => locale.value === 'fa')
const pendingTasksCount = computed(() => todoStore.todos.filter(t => !t.isDone).length)
const userName = computed(() => settingsStore.userName?.trim() || 'User')
const currentTheme = computed(() => settingsStore.currentTheme)
const savedCity = computed(() => weatherStore.getSavedCity)

const getDisplayText = (value: string, map: { [key: string]: string }) => {
    return map[value] || value.charAt(0).toUpperCase() + value.slice(1)
}
const themeMap = { light: t('light'), dark: t('dark') }
const localeMap = { en: t('english'), fa: t('farsi') }

const currentTime = ref(new Date())
let timer: number | undefined

const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString(locale.value, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
})

const greetingText = computed(() => {
    const h = currentTime.value.getHours()
    const key = h >= 5 && h < 12 ? 'good_morning' :
        h >= 12 && h < 18 ? 'good_afternoon' :
            h >= 18 && h < 22 ? 'good_evening' : 'good_night'
    return t(key)
})

const comma = computed(() => (isRtl.value ? '، ' : ', '))
const fullText = computed(() => `${greetingText.value}${comma.value}${userName.value}`)
const typedGreeting = ref('')
let typingTimeout: number | undefined

const startTyping = (text: string) => {
    if (typingTimeout) clearTimeout(typingTimeout)
    typedGreeting.value = ''
    let i = 0
    const type = () => {
        if (i < text.length) {
            typedGreeting.value += text.charAt(i)
            i++
            typingTimeout = window.setTimeout(type, 80)
        }
    }
    type()
}

onMounted(() => {
    timer = window.setInterval(() => (currentTime.value = new Date()), 1000)
    startTyping(fullText.value)

    const handleWelcome = () => startTyping(fullText.value)
    window.addEventListener('welcome-animation-complete', handleWelcome)

    onUnmounted(() => {
        if (timer) clearInterval(timer)
        if (typingTimeout) clearTimeout(typingTimeout)
        window.removeEventListener('welcome-animation-complete', handleWelcome)
    })
})

watch(fullText, startTyping)

const displayedPendingTasks = ref(0)
const animationDuration = 1000
let startTimes = new Map<string, number>()
let animationFrames = new Map<string, number>()

function animateNumber(refToAnimate: any, targetValue: number, key: string) {
    if (animationFrames.has(key)) cancelAnimationFrame(animationFrames.get(key)!)
    const startValue = refToAnimate.value
    const startTime = performance.now()
    startTimes.set(key, startTime)
    const step = (now: number) => {
        const elapsed = now - startTimes.get(key)!
        const progress = Math.min(elapsed / animationDuration, 1)
        const interpolated = startValue + (targetValue - startValue) * progress
        refToAnimate.value = Math.floor(interpolated)
        if (progress < 1) {
            animationFrames.set(key, requestAnimationFrame(step))
        } else {
            refToAnimate.value = targetValue
            animationFrames.delete(key)
            startTimes.delete(key)
        }
    }
    animationFrames.set(key, requestAnimationFrame(step))
}

watch(pendingTasksCount, (newVal) => {
    animateNumber(displayedPendingTasks, newVal, 'pendingTasks')
}, { immediate: true })

const dashboardWeather = ref<any>(null)
const dashboardWeatherError = ref<string | null>(null)

const getDashboardWeatherMapping = (temp: number) => {
    if (temp > 30) return { text: t('weather.status_very_hot'), icon: 'mdi-weather-sunny' }
    if (temp > 20) return { text: t('weather.status_warm'), icon: 'mdi-weather-partly-cloudy' }
    if (temp > 10) return { text: t('weather.status_mild'), icon: 'mdi-weather-cloudy' }
    if (temp > 0) return { text: t('weather.status_cool_rainy'), icon: 'mdi-weather-rainy' }
    return { text: t('weather.status_cold'), icon: 'mdi-weather-snowy' }
}

async function fetchSavedCityWeather(city: CityData) {
    dashboardWeather.value = null
    dashboardWeatherError.value = null
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true`
    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        dashboardWeather.value = data
    } catch {
        dashboardWeatherError.value = t('alert.error_fetching_weather')
    }
}

const displayTemp = computed(() => {
    return dashboardWeather.value?.current_weather?.temperature !== undefined
        ? `${Math.round(dashboardWeather.value.current_weather.temperature)}°C`
        : '--'
})

const displayCityName = computed(() => {
    const city = savedCity.value
    if (!city) return t('weather.status_select_city')
    return locale.value === 'fa' && city.name_fa ? city.name_fa : city.city
})

const weatherIcon = computed(() => {
    const temp = dashboardWeather.value?.current_weather?.temperature
    if (temp === undefined || !savedCity.value) return 'mdi-cloud-question'
    return getDashboardWeatherMapping(temp).icon
})

const noCityMessage = computed(() => {
    if (!savedCity.value) return t('alert.select_city_prompt')
    if (dashboardWeatherError.value) return `${t('alert.error_fetching_weather')}. ${t('nav_weather')}.`
    return ''
})

watch(savedCity, (city) => {
    if (city) fetchSavedCityWeather(city)
    else dashboardWeather.value = null
}, { immediate: true })

const goToWeatherPage = () => router.push({ name: 'weather' })
</script>

<template>
    <v-container class="text-center">
        <v-row class="mt-4 justify-center align-stretch" :class="isRtl ? 'flex-row-reverse' : ''">
            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card mx-auto"
                    :style="{ maxWidth: '320px' }"
                    :color="currentTheme === 'light' ? 'light-blue-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-center"
                        :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                        <v-icon size="large" :class="isRtl ? 'ms-2' : 'me-2'">mdi-format-list-checks</v-icon>
                        {{ t('nav_todos') }}
                    </v-card-title>
                    <v-card-text class="pt-2 text-center">
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
                            {{ t('nav_todos') }}
                            <v-icon :class="isRtl ? 'me-1' : 'ms-1'">mdi-arrow-right-circle</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card mx-auto"
                    :style="{ maxWidth: '320px' }" :color="currentTheme === 'light' ? 'orange-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-center"
                        :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                        <v-icon size="large" :class="isRtl ? 'ms-2' : 'me-2'">{{ weatherIcon }}</v-icon>
                        {{ t('nav_weather') }}
                    </v-card-title>
                    <v-card-text class="pt-2 text-center">
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
                                <span :dir="isRtl ? 'rtl' : 'ltr'">
                                    {{ getDashboardWeatherMapping(dashboardWeather?.current_weather?.temperature)?.text
                                    }}
                                    {{ isRtl ? t('weather.in_preposition') : t('in') }}
                                    <span dir="ltr">{{ displayCityName }}</span>
                                </span>
                            </p>
                        </div>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn @click="goToWeatherPage" rounded="lg" size="small" variant="tonal"
                            :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'">
                            {{ savedCity ? t('nav_weather') : t('button.save_default_city') }}
                            <v-icon :class="isRtl ? 'me-1' : 'ms-1'">mdi-arrow-right-circle</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="4" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale dashboard-card mx-auto"
                    :style="{ maxWidth: '320px' }" :color="currentTheme === 'light' ? 'green-lighten-5' : 'surface'">
                    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-center"
                        :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">
                        <v-icon size="large" :class="isRtl ? 'ms-2' : 'me-2'">mdi-cog</v-icon>
                        {{ t('nav_profile') }}
                    </v-card-title>
                    <v-card-text class="pt-2 text-center">
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
                            {{ t('nav_profile') }}
                            <v-icon :class="isRtl ? 'me-1' : 'ms-1'">mdi-arrow-right-circle</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <div class="mt-12 mb-8">
            <p class="text-h5 text-md-h4 font-weight-black text-medium-emphasis mb-4">
                {{ formattedTime }}
            </p>
            <p class="text-h3 text-md-h2 font-weight-medium primary--text" :dir="isRtl ? 'rtl' : 'ltr'">
                <span>{{ typedGreeting }}</span>
                <span v-if="typedGreeting.length < fullText.length" class="typing-cursor">|</span>
            </p>
        </div>
    </v-container>
</template>

<style scoped>
.dashboard-card {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
    margin-inline-start: 2px;
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
