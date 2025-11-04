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

// --- Local refs ---
const newUserName = ref(settingsStore.userName);
const newLocale = ref(settingsStore.currentLocale);
const newTheme = ref(settingsStore.currentTheme);

// --- For Save button (name only) ---
const isNameChanged = ref(false);
const showSaveButton = computed(() => isNameChanged.value && newUserName.value.trim() !== settingsStore.userName);

function saveName() {
    if (!newUserName.value.trim()) return;
    const trimmedName = newUserName.value.trim();
    settingsStore.updateName(trimmedName);
    isNameChanged.value = false;
    notify.updateName(t('notification.name_updated', { name: trimmedName }));
}

// --- Sync store → local refs ---
watch(() => settingsStore.userName, (v) => {
    newUserName.value = v;
    isNameChanged.value = false;
});
watch(() => settingsStore.currentLocale, (v) => (newLocale.value = v));
watch(() => settingsStore.currentTheme, (v) => (newTheme.value = v));

// --- Save instantly for locale & theme (Auto-Update) ---
watch(newLocale, (val) => {
    settingsStore.updateLocale(val);
    const localeName = t(val === 'fa' ? 'farsi' : 'english');
    notify.changeLocale(t('notification.locale_changed', { locale: localeName }));
});

watch(newTheme, (val) => {
    // فراخوانی اکشن store. نوتیفیکیشن از داخل settingsStore ارسال می‌شود.
    settingsStore.updateTheme(val);
    // به‌روزرسانی تم Vuetify
    theme.global.name.value = val;
    // ❌ حذف شد: منطق نوتیفیکیشن تم
});

// --- Detect name change ---
watch(newUserName, (val) => {
    isNameChanged.value = val.trim() !== settingsStore.userName;
});

// --- Member Since ---
const memberSinceFormatted = ref('');

function formatMemberSince() {
    if (!settingsStore.memberSince) {
        memberSinceFormatted.value = t('Not set yet');
        return;
    }

    const date = new Date(settingsStore.memberSince);
    const localeString = settingsStore.currentLocale === 'fa' ? 'fa-IR' : 'en-US';

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    const combinedOptions: Intl.DateTimeFormatOptions = { ...dateOptions, ...timeOptions, hour12: false };
    memberSinceFormatted.value = date.toLocaleString(localeString, combinedOptions);
}

onMounted(formatMemberSince);
watch(() => settingsStore.memberSince, formatMemberSince);
watch(() => settingsStore.currentLocale, formatMemberSince);
</script>

<template>
    <v-container fluid class="pa-4">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" class="text-center">
                <h1 class="text-h5 font-weight-bold primary--text d-flex align-center justify-center">
                    <v-icon size="x-large" :class="isRtl ? 'ml-2' : 'mr-2'">mdi-account-circle</v-icon>
                    {{ t('User Profile') }}
                </h1>
            </v-col>
        </v-row>

        <v-row justify="center">
            <v-col cols="12">
                <v-card elevation="12" class="pa-4 pa-sm-6 rounded-xl mx-auto"
                    :class="{ 'mx-2': $vuetify.display.mobile }" style="max-width: 600px;">

                    <v-card-title class="text-h6 font-weight-bold primary--text pb-4"
                        :class="isRtl ? 'text-right' : 'text-left'">
                        {{ t('Account Details') }}
                    </v-card-title>

                    <v-divider class="mb-6"></v-divider>

                    <v-card-text class="px-0">
                        <v-row dense>

                            <v-col cols="12">
                                <div class="d-flex align-center gap-2">
                                    <v-text-field v-model="newUserName" :label="t('Name')" variant="solo-filled"
                                        hide-details rounded prepend-inner-icon="mdi-account"
                                        class="flex-grow-1 mb-3" />

                                    <transition name="save-btn">
                                        <v-btn v-show="showSaveButton" color="primary" size="large" @click="saveName"
                                            class="mb-3 save-btn flex-shrink-0" elevation="4">
                                            {{ t('Save') }}
                                            <v-icon :start="isRtl" :end="!isRtl">mdi-content-save</v-icon>
                                        </v-btn>
                                    </transition>
                                </div>
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-select v-model="newLocale" :items="[
                                    { value: 'en', title: t('english') },
                                    { value: 'fa', title: t('farsi') }
                                ]" :label="t('Language')" item-title="title" item-value="value" variant="solo-filled"
                                    hide-details rounded prepend-inner-icon="mdi-web" class="mb-3" />
                            </v-col>

                            <v-col cols="12" sm="6">
                                <v-select v-model="newTheme" :items="[
                                    { value: 'light', title: t('light') },
                                    { value: 'dark', title: t('dark') }
                                ]" :label="t('Theme')" item-title="title" item-value="value" variant="solo-filled"
                                    hide-details rounded
                                    :prepend-inner-icon="newTheme === 'light' ? 'mdi-brightness-7' : 'mdi-brightness-4'"
                                    class="mb-3" />
                            </v-col>

                            <v-col cols="12" class="mt-4">
                                <div class="text-subtitle-1 font-weight-bold mb-2"
                                    :class="isRtl ? 'text-right' : 'text-left'">
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
.gap-2 {
    gap: 8px;
}

/* Save button animation */
.save-btn-enter-active,
.save-btn-leave-active {
    transition: all 0.3s ease;
}

.save-btn-enter-from,
.save-btn-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.save-btn-enter-to,
.save-btn-leave-from {
    opacity: 1;
    transform: translateX(0);
}

/* Media query remains for card margin on small screens */
@media (max-width: 600px) {
    .v-card {
        margin-left: 8px !important;
        margin-right: 8px !important;
    }
}
</style>