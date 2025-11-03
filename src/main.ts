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


// Use the Vue I18n global scope as the Vuetify locale adapter for message and locale synchronization
const vuetifyI18nAdapter = i18n.global as unknown as LocaleInstance;


// --- CREATE VUETIFY INSTANCE ---
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  // Configure Vuetify locale to use the Vue I18n adapter
  locale: {
    adapter: vuetifyI18nAdapter,
  },
});
// ------------------------------

// --- DYNAMIC RTL SYNCHRONIZATION ---
// Watch the i18n locale and update Vuetify's RTL setting
watch(
  // Use a getter function to securely access the locale value
  () => i18n.global.locale,
  (newLocale) => {
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