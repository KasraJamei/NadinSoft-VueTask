<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n as useI18nGlobal } from 'vue-i18n';
import { RouterLink } from 'vue-router';
// import { useNotificationStore } from '@/stores/notification'; // نیاز به import این نیست

const { t } = useI18nGlobal();
const settingsStore = useSettingsStore();

const emit = defineEmits<{
    (e: 'toggle-drawer'): void
}>();

const currentThemeIsLight = computed(() => settingsStore.currentTheme === 'light');

const handleThemeToggle = () => {
    // فقط فراخوانی اکشن store. نوتیفیکیشن از داخل settingsStore ارسال می‌شود.
    settingsStore.toggleTheme();
    // ❌ حذف شد: منطق نوتیفیکیشن تم
};
</script>

<template>
    <v-app-bar app color="primary" class="elevation-4">

        <v-app-bar-nav-icon @click="emit('toggle-drawer')" color="white" class="mr-2"></v-app-bar-nav-icon>

        <v-btn icon @click="handleThemeToggle" color="white" class="theme-toggle-btn">
            <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
            <v-tooltip activator="parent" location="bottom" :offset="[0, 8]" close-delay="50">
                {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
            </v-tooltip>
        </v-btn>

        <div class="app-bar-title">
            <RouterLink to="/" class="text-decoration-none text-white font-weight-bold">
                {{ t('APP BAR') }}
            </RouterLink>
        </div>

    </v-app-bar>
</template>

<style scoped>
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

.theme-toggle-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
}

@media (max-width: 360px) {
    .app-bar-title a {
        font-size: 1.1rem;
    }
}
</style>