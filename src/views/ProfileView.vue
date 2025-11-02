<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';

// --- Shared display function ---
const getDisplayText = (value: string, map: { [key: string]: string }) => {
    return map[value] || value.charAt(0).toUpperCase() + value.slice(1);
};
const themeMap = { light: 'Light', dark: 'Dark' };

// --- Stores & i18n ---
const { t } = useI18n();
const settingsStore = useSettingsStore();
const theme = useTheme();

// --- Local refs (always editable) ---
const newUserName = ref(settingsStore.userName);
const newLocale = ref(settingsStore.currentLocale);
const newTheme = ref(settingsStore.currentTheme);

// --- Sync store → local refs ---
watch(() => settingsStore.userName, (v) => (newUserName.value = v));
watch(() => settingsStore.currentLocale, (v) => (newLocale.value = v));
watch(() => settingsStore.currentTheme, (v) => (newTheme.value = v));

// --- Save instantly ---
watch(newUserName, (val) => settingsStore.updateName(val));
watch(newLocale, (val) => settingsStore.updateLocale(val));
watch(newTheme, (val) => {
    settingsStore.updateTheme(val);
    theme.global.name.value = val;
});

// --- Member Since (formatted) ---
const memberSinceFormatted = ref('');

function formatMemberSince() {
    const date = new Date(settingsStore.memberSince);
    memberSinceFormatted.value = date.toLocaleDateString(
        settingsStore.currentLocale === 'fa' ? 'fa-IR' : 'en-US',
        { year: 'numeric', month: '2-digit', day: '2-digit' }
    );
}

onMounted(formatMemberSince);
watch(() => settingsStore.currentLocale, formatMemberSince);
</script>

<template>
    <v-container fluid class="pa-4">
        <!-- Header -->
        <v-row justify="center" class="mb-6">
            <v-col cols="12" class="text-center">
                <h1 class="text-h5 font-weight-bold primary--text d-flex align-center justify-center">
                    <v-icon size="x-large" class="mr-2">mdi-account-circle</v-icon>
                    {{ t('User Profile') }}
                </h1>
            </v-col>
        </v-row>

        <!-- Main Card -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card elevation="12" class="pa-4 pa-sm-6 rounded-xl mx-auto"
                    :class="{ 'mx-2': $vuetify.display.mobile }" style="max-width: 600px;">
                    <v-card-title class="text-h6 font-weight-bold primary--text pb-4">
                        {{ t('Account Details') }}
                    </v-card-title>

                    <v-divider class="mb-6"></v-divider>

                    <v-card-text class="px-0">
                        <v-row dense>
                            <!-- Name Field -->
                            <v-col cols="12">
                                <v-text-field v-model="newUserName" :label="t('Name')" variant="solo-filled"
                                    hide-details rounded prepend-inner-icon="mdi-account" class="mb-3"></v-text-field>
                            </v-col>

                            <!-- Language Select -->
                            <v-col cols="12" sm="6">
                                <v-select v-model="newLocale" :items="[
                                    { value: 'en', title: 'English' },
                                    { value: 'fa', title: 'فارسی' }
                                ]" :label="t('Language')" item-title="title" item-value="value" variant="solo-filled"
                                    hide-details rounded prepend-inner-icon="mdi-web" class="mb-3"></v-select>
                            </v-col>

                            <!-- Theme Select -->
                            <v-col cols="12" sm="6">
                                <v-select v-model="newTheme" :items="[
                                    { value: 'light', title: getDisplayText('light', themeMap) },
                                    { value: 'dark', title: getDisplayText('dark', themeMap) }
                                ]" :label="t('Theme')" item-title="title" item-value="value" variant="solo-filled"
                                    hide-details rounded
                                    :prepend-inner-icon="newTheme === 'light' ? 'mdi-brightness-7' : 'mdi-brightness-4'"
                                    class="mb-3"></v-select>
                            </v-col>

                            <!-- Member Since -->
                            <v-col cols="12" class="mt-4">
                                <div class="text-subtitle-1 font-weight-bold mb-2">
                                    {{ t('Member Since') }}:
                                </div>
                                <v-chip color="secondary" label size="large" class="px-4">
                                    <v-icon start>mdi-calendar</v-icon>
                                    {{ memberSinceFormatted }}
                                </v-chip>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
/* Optional: Add subtle animation on mobile */
@media (max-width: 600px) {
    .v-card {
        margin-left: 8px !important;
        margin-right: 8px !important;
    }
}
</style>