<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n as useI18nGlobal } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import type { Theme } from '@/stores/types'

const { t } = useI18nGlobal()
const settingsStore = useSettingsStore()
const emit = defineEmits<{ (e: 'toggle-drawer'): void }>()

const isRtl = computed(() => settingsStore.currentLocale === 'fa')

const THEME_ICONS: Record<Theme, string> = {
    light: 'mdi-brightness-7',
    dark: 'mdi-brightness-4',
    glass: 'mdi-blur',
}

const currentThemeIcon = computed(() => THEME_ICONS[settingsStore.currentTheme])

const themeOptions = computed<{ value: Theme; icon: string; title: string }[]>(() => [
    { value: 'light', icon: THEME_ICONS.light, title: t('light') },
    { value: 'dark', icon: THEME_ICONS.dark, title: t('dark') },
    { value: 'glass', icon: THEME_ICONS.glass, title: t('glass') },
])

const selectTheme = (theme: Theme) => {
    settingsStore.updateTheme(theme)
}
</script>

<template>
    <v-app-bar app color="primary" class="elevation-4">
        <template v-slot:prepend>
            <v-btn v-if="!isRtl" icon @click="emit('toggle-drawer')" color="white" class="ms-2"
                data-testid="nav-toggle">
                <v-icon>mdi-menu</v-icon>
            </v-btn>
            <v-app-bar-nav-icon v-else @click="emit('toggle-drawer')" color="white" class="ms-2"
                data-testid="nav-toggle" />
        </template>

        <v-app-bar-title class="text-center">
            <RouterLink to="/" class="text-decoration-none text-white font-weight-bold">
                {{ t('APP BAR') }}
            </RouterLink>
        </v-app-bar-title>

        <template v-slot:append>
            <v-btn icon color="white" :class="isRtl ? 'ms-2' : 'me-2'" :title="t('Theme')" aria-label="Theme"
                data-testid="theme-toggle">
                <v-icon>{{ currentThemeIcon }}</v-icon>
                <v-menu activator="parent" location="bottom end" :offset="[0, 8]">
                    <v-list density="compact" min-width="160" nav>
                        <v-list-item v-for="opt in themeOptions" :key="opt.value"
                            :active="settingsStore.currentTheme === opt.value" @click="selectTheme(opt.value)"
                            :data-testid="`theme-option-${opt.value}`">
                            <template v-slot:prepend>
                                <v-icon>{{ opt.icon }}</v-icon>
                            </template>
                            <v-list-item-title>{{ opt.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
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
