<script setup lang="ts">
// استفاده از useTodoStore برای نمایش تعداد تسک‌های باقی‌مانده
import { computed } from 'vue';
import { useTodoStore } from '@/stores/todos';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const pendingTasksCount = computed(() => todoStore.todos.filter(t => !t.isDone).length);
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold primary--text">
          <v-icon size="large" class="mr-2">mdi-view-dashboard</v-icon>
          {{ t('Dashboard') }}
      </h1>
      <v-spacer></v-spacer>
      <!-- Display User Name in the header -->
      <v-chip color="info" size="large" class="font-weight-medium">
          <v-icon start>mdi-account</v-icon>
          {{ t('Welcome') }}, {{ settingsStore.userName }}
      </v-chip>
    </div>
    
    <v-row class="mt-4">
      
      <!-- Card: Remaining Tasks -->
      <v-col cols="12" md="4">
        <v-card elevation="6" class="pa-4 rounded-xl hover-scale transition-fast" color="light-blue-lighten-5">
          <v-card-title class="headline text-h5 font-weight-bold primary--text">
            <v-icon left color="primary">mdi-format-list-checks</v-icon>
            {{ t('Remaining Tasks') }}
          </v-card-title>
          <v-card-text class="pt-2">
            <p class="text-h3 font-weight-black primary--text">{{ pendingTasksCount }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" block variant="tonal" :to="{ name: 'todos' }" rounded="lg">
              <v-icon start>mdi-arrow-right-circle</v-icon>
              {{ t('View Tasks') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- Card: Weather Status -->
      <v-col cols="12" md="4">
        <v-card elevation="6" class="pa-4 rounded-xl hover-scale transition-fast" color="orange-lighten-5">
          <v-card-title class="headline text-h5 font-weight-bold orange-darken-2">
            <v-icon left color="orange-darken-2">mdi-weather-sunny-alert</v-icon>
            {{ t('Weather Status') }}
          </v-card-title>
          <v-card-text class="pt-2">
            <!-- Mock data for dashboard summary -->
            <p class="text-h3 font-weight-black orange-darken-2">25°C</p>
            <p class="subtitle-1 text-medium-emphasis">آفتابی</p>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="orange-darken-2" block variant="tonal" :to="{ name: 'weather' }" rounded="lg">
              <v-icon start>mdi-arrow-right-circle</v-icon>
              {{ t('Weather Details') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Card: Profile & Settings -->
      <v-col cols="12" md="4">
        <v-card elevation="6" class="pa-4 rounded-xl hover-scale transition-fast" color="green-lighten-5">
          <v-card-title class="headline text-h5 font-weight-bold green-darken-2">
            <v-icon left color="green-darken-2">mdi-cog</v-icon>
            {{ t('Settings') }}
          </v-card-title>
          <v-card-text class="pt-2">
            <p class="text-h3 font-weight-black green-darken-2">{{ settingsStore.currentLocale.toUpperCase() }}</p>
            <p class="subtitle-1 text-medium-emphasis">{{ settingsStore.currentTheme }} Theme</p>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="green-darken-2" block variant="tonal" :to="{ name: 'profile' }" rounded="lg">
              <v-icon start>mdi-arrow-right-circle</v-icon>
              {{ t('Go to Profile') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<style scoped>
.hover-scale {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-scale:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15) !important;
}
</style>
