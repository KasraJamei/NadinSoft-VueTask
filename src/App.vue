<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme, useLocale } from 'vuetify';
import { useRouter, RouterLink } from 'vue-router'; 
// t function must be imported to be used in the template and script.
import { useI18n as useI18nGlobal } from 'vue-i18n';

// Destructuring t from the global i18n instance
const { t } = useI18nGlobal();

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const vuetifyTheme = useTheme();
const vuetifyLocale = useLocale();
const router = useRouter();

// State for controlling the sidebar visibility
// On desktop, the drawer should be persistent/visible by default.
const drawer = ref(true); 

// لیست آیتم‌های منو برای سایدبار
const navItems = computed(() => [
  { title: t('Dashboard'), icon: 'mdi-view-dashboard', to: { name: 'dashboard' } },
  { title: t('Tasks'), icon: 'mdi-format-list-checks', to: { name: 'todos' } },
  { title: t('Weather'), icon: 'mdi-weather-sunny-alert', to: { name: 'weather' } },
  { title: t('Profile'), icon: 'mdi-account-circle', to: { name: 'profile' } },
]);


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

onMounted(() => {
  // Logic for prompting user name on first visit (using profile page as fallback)
  if (settingsStore.userName === 'User') {
    // We use a custom modal or component for user prompt in a real app, 
    // but for now, keep the prompt() as it was in the original code.
    const nameInput = prompt('Welcome! Please enter your name:');

    if (nameInput && nameInput.trim()) {
      settingsStore.updateName(nameInput.trim());
    } else {
      router.push('/profile');
    }
  }
});
</script>

<template>
  <v-app>
    <!-- Use v-layout to wrap the application structure (App Bar, Navigation Drawer, Main Content) -->
    <v-layout :dir="isRtl ? 'rtl' : 'ltr'">
      
      <!-- 1. Top App Bar (Header) -->
      <v-app-bar app color="primary" class="elevation-4">
        <!-- Toggles the sidebar on mobile (hidden on desktop) -->
        <v-app-bar-nav-icon 
            @click="drawer = !drawer" 
            color="white"
            class="d-lg-none" 
        ></v-app-bar-nav-icon> 
        
        <v-toolbar-title class="font-weight-bold ml-2">
            <!-- App Title linked to Dashboard -->
            <RouterLink to="/" class="text-decoration-none d-flex align-center text-white">
                <v-icon class="mr-3 ml-1">mdi-alpha-m-box-outline</v-icon>
                {{ t('MyAppTitle') }}
            </RouterLink>
        </v-toolbar-title>
        
        <v-spacer></v-spacer>
        
        <!-- Toggle Theme Button -->
        <v-btn 
            icon 
            @click="settingsStore.toggleTheme" 
            color="white" 
            class="mx-2"
        >
            <v-icon>{{ settingsStore.currentTheme === 'light' ? 'mdi-brightness-4' : 'mdi-brightness-7' }}</v-icon>
            <v-tooltip activator="parent" location="bottom">
                {{ t('Toggle Theme') }} ({{ settingsStore.currentTheme === 'light' ? t('Dark') : t('Light') }})
            </v-tooltip>
        </v-btn>
      </v-app-bar>

      <!-- 2. Navigation Drawer (Sidebar) -->
      <v-navigation-drawer
        v-model="drawer"
        app
        :temporary="$vuetify.display.mdAndDown"
        width="250"
        :color="vuetifyTheme.global.name.value === 'light' ? 'grey-lighten-4' : undefined"
      >
        <v-list class="pa-2">
            <!-- User Profile Summary (Mini Header) -->
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

            <!-- Navigation Links -->
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

      <!-- 3. Main Content Area -->
      <v-main>
        <!-- The RouterView renders the content of the current route (e.g., DashboardView, TodosView) -->
        <v-container fluid class="pa-4 pa-sm-6" style="min-height: 100vh;">
          <RouterView />
        </v-container>
      </v-main>

    </v-layout>
  </v-app>
</template>

<style>
/* CSS کلی برای پروژه */
html {
  /* Prevent scrollbar from shifting content on some browsers */
  overflow-y: scroll !important; 
}
/* Ensure the RouterLink looks like a clean title */
.v-toolbar-title .text-decoration-none {
  color: white;
}
/* Added general styling for the active state of list items */
.v-list-item--active {
  color: white !important;
  background-color: var(--v-theme-primary);
}
</style>
