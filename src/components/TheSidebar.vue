<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n as useI18nGlobal } from 'vue-i18n';
import { useTheme } from 'vuetify';

// Define the prop for v-model (for drawer open/close state)
// Note: In Vue 3.4+, 'defineModel' is the preferred way for v-model.
const drawerModel = defineModel<boolean>('drawer', { required: true });

// Destructuring t for translation
const { t } = useI18nGlobal();
const vuetifyTheme = useTheme();

const settingsStore = useSettingsStore();

// Navigation items logic (moved here from App.vue)
const navItems = computed(() => [
  { title: t('Dashboard'), icon: 'mdi-view-dashboard', to: { name: 'dashboard' } },
  { title: t('Tasks'), icon: 'mdi-format-list-checks', to: { name: 'todos' } },
  { title: t('Weather'), icon: 'mdi-weather-sunny-alert', to: { name: 'weather' } },
  { title: t('Profile'), icon: 'mdi-account-circle', to: { name: 'profile' } },
]);

const isLightTheme = computed(() => vuetifyTheme.global.name.value === 'light');
</script>

<template>
  <v-navigation-drawer
    v-model="drawerModel"
    app
    :temporary="$vuetify.display.mdAndDown"
    width="250"
    :color="isLightTheme ? 'grey-lighten-4' : undefined"
  >
    <v-list class="pa-2">
        <v-list-item 
            :title="settingsStore.userName" 
            :subtitle="t('User Profile')"
            class="mb-4 text-center rounded-lg primary text-white"
            :to="{ name: 'profile' }"
        >
            <template v-slot:prepend>
                <v-avatar color="white" class="ml-2">
                    <v-icon color="primary">mdi-account-circle</v-icon>
                </v-avatar>
            </template>
        </v-list-item>
        
        <v-divider class="mb-2"></v-divider>

        <v-list-item
            v-for="item in navItems"
            :key="item.title"
            :to="item.to"
            :title="item.title"
            :prepend-icon="item.icon"
            link
            color="primary"
            rounded="lg"
            class="my-1 font-weight-medium"
            :active-class="'v-list-item--active elevation-2'"
        ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
/* Added general styling for the active state of list items */
.v-list-item--active {
  color: white !important;
  background-color: var(--v-theme-primary);
}
</style>