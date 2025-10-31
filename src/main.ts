import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 1. Vuetify imports
import 'vuetify/styles'; // Import the Vuetify CSS
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// 2. Custom theme/icon setup
import '@mdi/font/css/materialdesignicons.css'; // Ensure MDI icons are imported

// 3. Pinia setup
import { createPinia } from 'pinia';

// 4. i18n setup 
import i18n from './i18n';


// --- CREATE VUETIFY INSTANCE ---
const vuetify = createVuetify({
  components,
  directives,
  // Add other configurations like theme, icons, locales here
  icons: {
    defaultSet: 'mdi',
  },
});
// ------------------------------


// --- CREATE APP INSTANCE ---
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

// اتصال Vuetify به اپلیکیشن
app.use(vuetify);

app.mount('#app');
