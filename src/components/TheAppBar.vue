<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n as useI18nGlobal } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';

const { t } = useI18nGlobal();
const settingsStore = useSettingsStore();
const notify = useNotificationStore();

const emit = defineEmits<{
    (e: 'toggle-drawer'): void
}>();

const currentThemeIsLight = computed(() => settingsStore.currentTheme === 'light');

const handleThemeToggle = () => {
    const wasLight = settingsStore.currentTheme === 'light';

    // Call the original toggle function from the store
    settingsStore.toggleTheme();

    // Send the notification using translated text
    const themeName = wasLight ? t('Dark') : t('Light');
    const msg = t('Theme changed to: ') + themeName;
    notify.changeTheme(!wasLight, msg);
};
</script>

<template>
    <v-app-bar app color="primary" class="elevation-4">

        <v-app-bar-nav-icon @click="emit('toggle-drawer')" color="white" class="mr-2 d-lg-none"></v-app-bar-nav-icon>

        <v-btn icon @click="handleThemeToggle" color="white" class="theme-toggle-btn">
            <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
            <v-tooltip activator="parent" location="bottom" :offset="[0, 8]" close-delay="50">
                {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
            </v-tooltip>
        </v-btn>

        <div class="app-bar-title">
            <RouterLink to="/" class="text-decoration-none text-white font-weight-bold">
                {{ t('dashboard') }}
            </RouterLink>
        </div>

    </v-app-bar>
</template>

<style scoped>
/* === Perfectly centered title in all screen sizes === */
.app-bar-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) translateX(-15px);
    z-index: 1;
    pointer-events: none;
}

.app-bar-title a {
    pointer-events: auto;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

/* === Theme button – fixed on the right === */
.theme-toggle-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
}

/* === Mobile adjustment: shift title slightly to compensate for drawer icon === */
@media (max-width: 960px) {
    .app-bar-title {
        left: calc(50% + 20px);
    }
}

/* Optional: improve visual spacing on very small screens */
@media (max-width: 360px) {
    .app-bar-title a {
        font-size: 1.1rem;
    }
}
</style>