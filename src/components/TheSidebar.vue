<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme, useDisplay } from 'vuetify';

const drawerModel = defineModel<boolean>('drawer', { required: true });

const { t, locale } = useI18n();
const vuetifyTheme = useTheme();
const display = useDisplay();
const settingsStore = useSettingsStore();

const isRtl = computed(() => locale.value === 'fa');
const isMobile = computed(() => display.smAndDown.value);

const isModal = computed(() => isMobile.value);

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
            <v-list-item class="mb-4 rounded-lg elevation-2 mt-2"
                :class="[isLightTheme ? 'bg-grey-lighten-4' : 'bg-surface']" :to="{ name: 'profile' }" height="80">
                <template v-slot:prepend>
                    <v-avatar color="primary" size="48" :class="isRtl ? 'ms-3' : 'me-3'">
                        <v-icon color="white" size="32">mdi-account-circle</v-icon>
                    </v-avatar>
                </template>
                <v-list-item-title class="text-subtitle-1 font-weight-bold text-center">
                    {{ settingsStore.userName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-center">
                    {{ t('User Profile') }}
                </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="mb-2"></v-divider>

            <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" :title="item.title"
                :prepend-icon="!isRtl ? item.icon : undefined" :append-icon="isRtl ? item.icon : undefined" link
                rounded="lg" class="my-1 font-weight-medium" :class="{ 'text-right': isRtl }"
                active-class="bg-primary elevation-2 text-white">
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped>
.v-navigation-drawer {
    transition: transform 0.3s ease;
}

.v-list-item.text-right {
    text-align: right;
}
</style>
