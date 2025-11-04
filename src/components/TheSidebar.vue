<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme, useDisplay } from 'vuetify';

// v-model for drawer
const drawerModel = defineModel<boolean>('drawer', { required: true });

const { t, locale } = useI18n();
const vuetifyTheme = useTheme();
const display = useDisplay();
const settingsStore = useSettingsStore();

const isRtl = computed(() => locale.value === 'fa');
const isMobile = computed(() => display.smAndDown.value);

// Modal فقط در موبایل
const isModal = computed(() => isMobile.value);

// در موبایل: temporary (مودال با overlay)
// در دسکتاپ: permanent (بدون overlay، همیشه باز/بسته با v-model)
const isTemporary = computed(() => isMobile.value);
const isPermanent = computed(() => !isMobile.value);

const sidebarLocation = computed(() => isRtl.value ? 'right' : 'left');

const navItems = computed(() => [
    { title: t('nav_dashboard'), icon: 'mdi-view-dashboard', to: { name: 'dashboard' } },
    { title: t('nav_todos'), icon: 'mdi-format-list-checks', to: { name: 'todos' } },
    { title: t('nav_weather'), icon: 'mdi-weather-sunny-alert', to: { name: 'weather' } },
    { title: t('nav_profile'), icon: 'mdi-account-circle', to: { name: 'profile' } },
]);

const isLightTheme = computed(() => vuetifyTheme.global.name.value === 'light');
</script>

<template>
    <v-navigation-drawer v-model="drawerModel" :temporary="isTemporary" :permanent="isPermanent" :modal="isModal"
        width="250" :color="isLightTheme ? 'white' : undefined" :location="sidebarLocation" disable-resize-watcher
        disable-route-watcher>
        <v-list class="pa-2">
            <v-list-item :title="settingsStore.userName" :subtitle="t('User Profile')"
                class="mb-4 rounded-lg elevation-2 mt-2"
                :class="[isLightTheme ? 'bg-grey-lighten-4' : 'bg-surface', isRtl ? 'text-right' : 'text-left']"
                :to="{ name: 'profile' }">
                <template v-slot:prepend>
                    <v-avatar color="primary" :class="isRtl ? 'mr-2' : 'ml-2'">
                        <v-icon color="white">mdi-account-circle</v-icon>
                    </v-avatar>
                </template>
            </v-list-item>

            <v-divider class="mb-2"></v-divider>

            <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" :title="item.title"
                :prepend-icon="item.icon" link rounded="lg" class="my-1 font-weight-medium"
                active-class="bg-primary elevation-2 text-white">
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped>
/* Optional: smooth transition when opening/closing */
.v-navigation-drawer {
    transition: transform 0.3s ease;
}
</style>