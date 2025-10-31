<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n as useI18nGlobal } from 'vue-i18n';
import { RouterLink } from 'vue-router';

// Destructuring t for translation
const { t } = useI18nGlobal();

// Access the store and its computed properties/actions
const settingsStore = useSettingsStore();

// Define the events this component can emit
const emit = defineEmits<{
  (e: 'toggle-drawer'): void
}>();

const currentThemeIsLight = computed(() => settingsStore.currentTheme === 'light');
</script>

<template>
  <v-app-bar app color="primary" class="elevation-4">
    <v-app-bar-nav-icon 
        @click="emit('toggle-drawer')" 
        color="white"
        class="d-lg-none" 
    ></v-app-bar-nav-icon> 
    
    <v-toolbar-title class="font-weight-bold ml-2">
        <RouterLink to="/" class="text-decoration-none d-flex align-center text-white">
            <v-icon class="mr-3 ml-1">mdi-alpha-m-box-outline</v-icon>
            {{ t('MyAppTitle') }}
        </RouterLink>
    </v-toolbar-title>
    
    <v-spacer></v-spacer>
    
    <v-btn 
        icon 
        @click="settingsStore.toggleTheme" 
        color="white" 
        class="mx-2"
    >
        <v-icon>{{ currentThemeIsLight ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
            {{ t('Toggle Theme') }} ({{ currentThemeIsLight ? t('Dark') : t('Light') }})
        </v-tooltip>
    </v-btn>
  </v-app-bar>
</template>

<style scoped>
/* Ensure the RouterLink looks like a clean title */
.v-toolbar-title .text-decoration-none {
  color: white;
}
</style>