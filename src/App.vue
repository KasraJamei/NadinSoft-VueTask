<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import TheAppBar from '@/components/TheAppBar.vue';
import TheSidebar from '@/components/TheSidebar.vue';
import FirstVisitModal from '@/components/FirstVisitModal.vue';
import NotificationSystem from '@/components/NotificationSystem.vue';

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const vuetifyTheme = useTheme();

const drawer = ref(false);
const isRtl = computed(() => settingsStore.currentLocale === 'fa');

watch(() => settingsStore.currentTheme, (t) => {
  vuetifyTheme.global.name.value = t;
}, { immediate: true });

watch(() => settingsStore.currentLocale, (l) => {
  locale.value = l;
}, { immediate: true });

watch(isRtl, (rtl) => {
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
}, { immediate: true });

function toggleDrawer() {
  drawer.value = !drawer.value;
}
</script>

<template>
  <v-app>
    <v-layout>
      <TheAppBar @toggle-drawer="toggleDrawer" />
      <TheSidebar v-model:drawer="drawer" />
      <FirstVisitModal />

      <!-- Notification System: ALWAYS ON TOP -->
      <NotificationSystem />

      <!-- Main Content -->
      <v-main>
        <v-container fluid class="pa-4 pa-sm-6" style="min-height: 100vh">
          <RouterView />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style>
html {
  overflow-y: scroll !important;
}
</style>