// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { fa, en } from 'vuetify/locale' 
import '@mdi/font/css/materialdesignicons.css'

import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { fa, en },
  },
  rtl: {
    fa: true,
  },
  theme: {
      defaultTheme: 'light', 
  },
  icons: {
      defaultSet: 'mdi',
  }
})

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')