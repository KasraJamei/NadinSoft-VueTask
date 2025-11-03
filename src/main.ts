import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';

// 1. Vuetify imports
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import type { LocaleInstance } from 'vuetify';

// 2. Custom theme/icon setup
import '@mdi/font/css/materialdesignicons.css';

// 3. Pinia setup
import { createPinia } from 'pinia';

// 4. i18n setup 
import i18n from './i18n';
import { type I18n } from 'vue-i18n';


// Cast the i18n instance to LocaleInstance to satisfy Vuetify's adapter type check
const vuetifyI18nAdapter = i18n as unknown as LocaleInstance;


// --- CREATE VUETIFY INSTANCE ---
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  // Configuration for Vuetify locale integration with i18n
  locale: {
    adapter: vuetifyI18nAdapter,
  },
});
// ------------------------------

// --- DYNAMIC RTL SYNCHRONIZATION ---
// FIX: Use a getter function inside watch() to securely access the locale value
watch(
  () => i18n.global.locale, // Watch the getter function's return value (the string locale)
  (newLocale) => {
    // newLocale is the string value ('en' or 'fa')
    vuetify.locale.isRtl.value = newLocale === 'fa';
  },
  { immediate: true } // Run immediately on startup to set the initial direction
);
// -----------------------------------


// --- CREATE APP INSTANCE ---
const app = createApp(App);

app.use(createPinia());
app.use(router);
// Install i18n
app.use(i18n as unknown as I18n);

// Connect Vuetify to the application
app.use(vuetify);

app.mount('#app');