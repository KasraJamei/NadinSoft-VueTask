<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n as useI18nGlobal } from 'vue-i18n';
import { RouterLink } from 'vue-router';

// Get translation function
const { t } = useI18nGlobal();

// Access settings store
const settingsStore = useSettingsStore();

// Emit event to toggle drawer
const emit = defineEmits<{
    (e: 'toggle-drawer'): void
}>();

// Computed: true if current theme is 'light'
const currentThemeIsLight = computed(() => settingsStore.currentTheme === 'light');
</script>

<template>
    <v-app-bar app color="primary" class="elevation-4">

        <!-- Drawer toggle – visible only on mobile (below lg breakpoint) -->
        <v-app-bar-nav-icon @click="emit('toggle-drawer')" color="white" class="mr-2 d-lg-none"></v-app-bar-nav-icon>

        <!-- Theme toggle button – positioned absolutely on the right -->
        <v-btn icon @click="settingsStore.toggleTheme" color="white" class="theme-toggle-btn">
            <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
            <v-tooltip activator="parent" location="bottom">
                {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
            </v-tooltip>
        </v-btn>

        <!-- Centered title – absolutely positioned for perfect centering -->
        <div class="app-bar-title">
            <RouterLink to="/" class="text-decoration-none text-white font-weight-bold">
                APP BAR
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
    /* Prevent blocking clicks behind */
}

.app-bar-title a {
    pointer-events: auto;
    /* Allow clicking the link */
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
        /* Offset by half the icon width + margin */
    }
}

/* Optional: improve visual spacing on very small screens */
@media (max-width: 360px) {
    .app-bar-title a {
        font-size: 1.1rem;
    }
}
</style>