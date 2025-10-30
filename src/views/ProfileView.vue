<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';

const { t } = useI18n();
const settingsStore = useSettingsStore();
const theme = useTheme();

const newUserName = ref(settingsStore.userName);
const newLocale = ref(settingsStore.currentLocale);
const newTheme = ref(settingsStore.currentTheme);
const isEditing = ref(false);

const availableThemes = [
    { value: 'light', title: t('Light'), icon: 'mdi-brightness-7' },
    { value: 'dark', title: t('Dark'), icon: 'mdi-brightness-4' },
];

const availableLocales = [
    { value: 'fa', title: 'فارسی', icon: 'mdi-web' },
    { value: 'en', title: 'English', icon: 'mdi-web-box' },
];

const saveSettings = () => {
    settingsStore.updateName(newUserName.value);
    settingsStore.updateLocale(newLocale.value);
    settingsStore.updateTheme(newTheme.value);
    isEditing.value = false;
};

// Ensure local refs are updated when store changes (e.g., if another component changes the theme)
// Note: In a real app, use watch/computed to keep this in sync for better reactivity.
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-6">
        <h1 class="text-h4 font-weight-bold primary--text">
            <v-icon size="large" class="mr-2">mdi-account-circle</v-icon>
            {{ t('User Profile') }}
        </h1>
    </div>
    <v-card class="mx-auto pa-6 elevation-8 rounded-xl" max-width="600">
      
      <v-card-title class="d-flex justify-space-between align-center text-h5 font-weight-bold primary--text">
        {{ t('Account Details') }}
        <v-btn 
            :color="isEditing ? 'error' : 'primary'" 
            variant="tonal" 
            size="small"
            rounded="lg"
            @click="isEditing = !isEditing"
        >
            <v-icon start>{{ isEditing ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
            {{ isEditing ? t('Cancel') : t('Edit Profile') }}
        </v-btn>
      </v-card-title>

      <v-divider class="my-4"></v-divider>

      <v-card-text>
        <v-row dense>
            <!-- User Name Field -->
            <v-col cols="12">
                <v-text-field
                    v-model="newUserName"
                    :label="t('Name')"
                    :variant="isEditing ? 'solo-filled' : 'outlined'"
                    :readonly="!isEditing"
                    hide-details
                    rounded="lg"
                    :prepend-inner-icon="isEditing ? 'mdi-pencil' : 'mdi-account'"
                    class="mb-4"
                ></v-text-field>
            </v-col>
            
            <!-- Locale Select -->
            <v-col cols="12" sm="6">
                <v-select
                    v-model="newLocale"
                    :items="availableLocales"
                    :label="t('Language')"
                    item-title="title"
                    item-value="value"
                    :variant="isEditing ? 'solo-filled' : 'outlined'"
                    :readonly="!isEditing"
                    hide-details
                    rounded="lg"
                    prepend-inner-icon="mdi-web"
                ></v-select>
            </v-col>
            
            <!-- Theme Select -->
            <v-col cols="12" sm="6">
                <v-select
                    v-model="newTheme"
                    :items="availableThemes"
                    :label="t('Theme')"
                    item-title="title"
                    item-value="value"
                    :variant="isEditing ? 'solo-filled' : 'outlined'"
                    :readonly="!isEditing"
                    hide-details
                    rounded="lg"
                    :prepend-inner-icon="newTheme === 'light' ? 'mdi-brightness-7' : 'mdi-brightness-4'"
                ></v-select>
            </v-col>

            <!-- Other Read-only Info -->
            <v-col cols="12" class="mt-4">
                <div class="text-subtitle-1 font-weight-bold">{{ t('Member Since') }}:</div>
                <v-chip color="secondary" label rounded="lg">
                    <v-icon start>mdi-calendar</v-icon>
                    ۱۴۰۲/۰۱/۰۱ (Mock Data)
                </v-chip>
            </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pt-4">
        <v-spacer></v-spacer>
        <v-btn 
            v-if="isEditing"
            color="success" 
            size="large"
            rounded="lg"
            @click="saveSettings"
        >
            <v-icon start>mdi-content-save</v-icon>
            {{ t('Save Changes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Vuetify handles most styling */
</style>
