<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n as useI18nGlobal } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18nGlobal()
const settingsStore = useSettingsStore()
const emit = defineEmits<{ (e: 'toggle-drawer'): void }>()

const currentThemeIsLight = computed(() => settingsStore.currentTheme === 'light')
const isRtl = computed(() => settingsStore.currentLocale === 'fa')

const handleThemeToggle = () => {
    settingsStore.toggleTheme()
}
</script>

<template>
    <v-app-bar app color="primary" class="elevation-4">
        <template v-slot:prepend>
            <v-btn v-if="!isRtl" icon @click="emit('toggle-drawer')" color="white" class="ms-2"
                data-testid="nav-toggle">
                <v-icon>mdi-menu</v-icon>
            </v-btn>
            <v-btn v-else icon @click="handleThemeToggle" color="white" class="ms-2" data-testid="theme-toggle">
                <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
                <v-tooltip activator="parent" location="bottom" :offset="[0, 8]" close-delay="50">
                    {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
                </v-tooltip>
            </v-btn>
        </template>

        <v-app-bar-title class="text-center">
            <RouterLink to="/" class="text-decoration-none text-white font-weight-bold">
                {{ t('APP BAR') }}
            </RouterLink>
        </v-app-bar-title>

        <template v-slot:append>
            <v-btn v-if="!isRtl" icon @click="handleThemeToggle" color="white" class="me-2" data-testid="theme-toggle">
                <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
                <v-tooltip activator="parent" location="bottom" :offset="[0, 8]" close-delay="50">
                    {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
                </v-tooltip>
            </v-btn>
            <v-app-bar-nav-icon v-else @click="emit('toggle-drawer')" color="white" class="me-2"
                data-testid="nav-toggle" />
        </template>
    </v-app-bar>
</template>

<style scoped>
.app-bar-title a {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

@media (max-width: 360px) {
    .app-bar-title a {
        font-size: 1.1rem;
    }
}
</style>
