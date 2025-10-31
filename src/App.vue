  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useSettingsStore } from '@/stores/settings';
  import { useI18n } from 'vue-i18n';
  import { useTheme, useLocale } from 'vuetify';
  import { useRouter, RouterView } from 'vue-router';

  // Import the new components (assuming these files exist)
  import TheAppBar from '@/components/TheAppBar.vue';
  import TheSidebar from '@/components/TheSidebar.vue';

  const settingsStore = useSettingsStore();
  const { locale } = useI18n();
  const vuetifyTheme = useTheme();
  const vuetifyLocale = useLocale();
  const router = useRouter();

  // State for controlling the sidebar visibility
  const drawer = ref(true);

  const isRtl = computed(() => settingsStore.currentLocale === 'fa');

  // --- Synchronization Logic ---
  watch(
    () => settingsStore.currentLocale,
    (newLocale) => {
      locale.value = newLocale;
      vuetifyLocale.current.value = newLocale;
    },
    { immediate: true }
  );

  watch(
    () => settingsStore.currentTheme,
    (newTheme) => {
      vuetifyTheme.global.name.value = newTheme;
    },
    { immediate: true }
  );

  watch(isRtl, (newRtl) => {
    document.documentElement.setAttribute('dir', newRtl ? 'rtl' : 'ltr');
  }, { immediate: true });
  // -----------------------------

  // Logic for prompting user name on first visit
  onMounted(() => {
    if (settingsStore.userName === 'User') {
      const nameInput = prompt('Welcome! Please enter your name:');

      if (nameInput && nameInput.trim()) {
        settingsStore.updateName(nameInput.trim());
      } else {
        router.push('/profile');
      }
    }
  });

  // Handler for the App Bar button
  function toggleDrawer() {
    drawer.value = !drawer.value;
  }
</script>

  <template>
    <v-app>
      <v-layout :dir="isRtl ? 'rtl' : 'ltr'">

        <TheAppBar @toggle-drawer="toggleDrawer" />

        <TheSidebar v-model:drawer="drawer" />

        <v-main>
          <v-container fluid class="pa-4 pa-sm-6" style="min-height: 100vh;">
            <RouterView />
          </v-container>
        </v-main>

      </v-layout>
    </v-app>
  </template>

<style>
/* CSS کلی برای پروژه (فقط استایل‌های عمومی) */
html {
  /* Prevent scrollbar from shifting content on some browsers */
  overflow-y: scroll !important;
}
</style>