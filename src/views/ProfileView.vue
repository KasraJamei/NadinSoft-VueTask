<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { useNotificationStore } from '@/stores/notification';

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();
const theme = useTheme();
const notify = useNotificationStore();

const isRtl = computed(() => locale.value === 'fa');

const newUserName = ref(settingsStore.userName);
const newLocale = ref(settingsStore.currentLocale);
const newTheme = ref(settingsStore.currentTheme);

const localeOptions = computed(() => [
    { value: 'en', title: t('english') },
    { value: 'fa', title: t('farsi') }
]);

const themeOptions = computed(() => [
    { value: 'light', title: t('light') },
    { value: 'dark', title: t('dark') }
]);

const isNameChanged = ref(false);
const showSaveButton = computed(
    () => isNameChanged.value && newUserName.value.trim() !== '' && newUserName.value.trim() !== settingsStore.userName
);

function saveName() {
    const trimmed = newUserName.value.trim();
    if (!trimmed) return;
    settingsStore.updateName(trimmed);
    isNameChanged.value = false;
    notify.updateName(t('notification.name_updated', { name: trimmed }));
}

watch(() => settingsStore.userName, v => {
    newUserName.value = v;
    isNameChanged.value = false;
});

watch(() => settingsStore.currentLocale, v => (newLocale.value = v));
watch(() => settingsStore.currentTheme, v => (newTheme.value = v));

watch(newLocale, val => {
    settingsStore.updateLocale(val);
    const localeName = t(val === 'fa' ? 'farsi' : 'english');
    notify.changeLocale(t('notification.locale_changed', { locale: localeName }));
});

watch(newTheme, val => {
    settingsStore.updateTheme(val);
    theme.global.name.value = val;
});

watch(newUserName, val => {
    isNameChanged.value = val.trim() !== settingsStore.userName;
});

const memberSinceFormatted = ref('');

function formatMemberSince() {
    if (!settingsStore.memberSince) {
        memberSinceFormatted.value = t('Not set yet');
        return;
    }
    const date = new Date(settingsStore.memberSince);
    const loc = settingsStore.currentLocale === 'fa' ? 'fa-IR' : 'en-US';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
    memberSinceFormatted.value = date.toLocaleString(loc, opts);
}

onMounted(formatMemberSince);
watch(() => settingsStore.memberSince, formatMemberSince);
watch(() => settingsStore.currentLocale, formatMemberSince);
</script>

<template>
    <v-container fluid class="pa-4">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" class="text-center">
                <h1 class="text-h5 font-weight-bold d-flex align-center justify-center">
                    <v-icon size="x-large" :class="isRtl ? 'ms-2' : 'me-2'">mdi-account-circle</v-icon>
                    {{ t('User Profile') }}
                </h1>
            </v-col>
        </v-row>

        <v-row justify="center">
            <v-col cols="12">
                <v-card elevation="12" class="pa-4 pa-sm-6 rounded-xl mx-auto" style="max-width: 600px;">
                    <v-card-title class="text-h6 font-weight-bold pb-4"
                        :style="{ textAlign: isRtl ? 'right' : 'left' }">
                        {{ t('Account Details') }}
                    </v-card-title>

                    <v-divider class="mb-6" />

                    <v-card-text class="px-0">
                        <v-row dense>
                            <!-- Name Field -->
                            <v-col cols="12">
                                <v-text-field v-model="newUserName" :label="t('profile.name_label')"
                                    variant="solo-filled" hide-details rounded class="mb-3"
                                    :class="{ 'rtl-input': isRtl }"
                                    :prepend-inner-icon="!isRtl ? 'mdi-account' : undefined"
                                    :append-inner-icon="isRtl ? 'mdi-account' : undefined">
                                </v-text-field>
                            </v-col>

                            <!-- Save Button (appears below name field) -->
                            <v-col v-if="showSaveButton" cols="12">
                                <transition name="save-fade" appear>
                                    <v-btn color="primary" elevation="2" class="save-btn w-100" @click="saveName">
                                        <v-icon :class="isRtl ? 'ms-2' : 'me-2'">mdi-content-save</v-icon>
                                        {{ t('Save') }}
                                    </v-btn>
                                </transition>
                            </v-col>

                            <!-- Language Field -->
                            <v-col cols="12" sm="6">
                                <v-select v-model="newLocale" :items="localeOptions" :label="t('Language')"
                                    item-title="title" item-value="value" variant="solo-filled" hide-details rounded
                                    class="mb-3" :class="{ 'rtl-input': isRtl, 'rtl-select': isRtl }"
                                    prepend-inner-icon="mdi-web">
                                </v-select>
                            </v-col>

                            <!-- Theme Field -->
                            <v-col cols="12" sm="6">
                                <v-select v-model="newTheme" :items="themeOptions" :label="t('Theme')"
                                    item-title="title" item-value="value" variant="solo-filled" hide-details rounded
                                    class="mb-3" :class="{ 'rtl-input': isRtl, 'rtl-select': isRtl }"
                                    :prepend-inner-icon="newTheme === 'light' ? 'mdi-brightness-7' : 'mdi-brightness-4'">
                                </v-select>
                            </v-col>

                            <!-- Member Since -->
                            <v-col cols="12" class="mt-4">
                                <div class="text-subtitle-1 font-weight-bold mb-2"
                                    :style="{ textAlign: isRtl ? 'right' : 'left' }">
                                    {{ t('Member Since') }}:
                                </div>
                                <v-chip color="secondary" label size="large" class="px-4">
                                    <v-icon start>mdi-calendar-clock</v-icon>
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
/* Save button styles */
.save-btn {
    justify-content: center;
    text-transform: none;
}

.save-fade-enter-active,
.save-fade-leave-active {
    transition: opacity .2s ease, transform .2s ease;
}

.save-fade-enter-from,
.save-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* General RTL typography for all inputs */
.rtl-input :deep(input),
.rtl-input :deep(.v-select__selection-text) {
    direction: rtl;
    text-align: right;
}

.rtl-input :deep(.v-label) {
    right: 16px !important;
    left: auto !important;
    transform-origin: top right !important;
}

.rtl-input :deep(.v-label--active) {
    transform: translateY(-16px) scale(0.75);
}

/* RTL alignment for v-select */
.rtl-select :deep(.v-field__input) {
    justify-content: flex-end;
}

.rtl-select :deep(.v-select__selection) {
    text-align: right !important;
}

.w-100 {
    width: 100%;
}
</style>
