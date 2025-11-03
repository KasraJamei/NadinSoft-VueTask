<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const notifyStore = useNotificationStore();
const { notifications } = storeToRefs(notifyStore);
const { locale } = useI18n();

const isRtl = computed(() => locale.value === 'fa');

// --- Configuration ---
const NOTIFY_VISIBLE_DURATION = 3500;
const activeTimeouts = new Map<number, number>();

const getConfig = (type: string) => {
    const configs: Record<string, any> = {
        add: { color: '#4caf50', icon: 'mdi-plus-circle', bgGradient: 'to right, #4caf50, #66bb6a' },
        edit: { color: '#2196f3', icon: 'mdi-pencil', bgGradient: 'to right, #2196f3, #42a5f5' },
        complete: { color: '#ff9800', icon: 'mdi-check-circle', bgGradient: 'to right, #ff9800, #ffb74d' },
        reopen: { color: '#ff5722', icon: 'mdi-undo', bgGradient: 'to right, #ff5722, #ff8a65' },
        delete: { color: '#d32f2f', icon: 'mdi-delete', bgGradient: 'to right, #d32f2f, #f44336' },
        name: { color: '#9c27b0', icon: 'mdi-account', bgGradient: 'to right, #9c27b0, #ba68c8' },
        locale: { color: '#0d47a1', icon: 'mdi-web', bgGradient: 'to right, #0d47a1, #1976d2' },
        theme_light: { color: '#ffc107', icon: 'mdi-white-balance-sunny', bgGradient: 'to right, #ffc107, #ffd54f' },
        theme_dark: { color: '#795548', icon: 'mdi-weather-night', bgGradient: 'to right, #795548, #a1887f' },
        city: { color: '#00acc1', icon: 'mdi-content-save', bgGradient: 'to right, #00acc1, #26c6da' },
        error: { color: '#d32f2f', icon: 'mdi-close-circle', bgGradient: 'to right, #d32f2f, #ef5350' },
    };
    return configs[type] || configs.error;
};

const removeNotification = (id: number) => {
    activeTimeouts.delete(id);
    notifyStore.remove(id);
};

const removeManually = (id: number) => {
    const timeoutId = activeTimeouts.get(id);
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    removeNotification(id);
};

watch(notifications, (newNotifications) => {
    const newIds = new Set(newNotifications.map(n => n.id));

    activeTimeouts.forEach((timeoutId, id) => {
        if (!newIds.has(id)) {
            clearTimeout(timeoutId);
            activeTimeouts.delete(id);
        }
    });

    newNotifications.forEach(n => {
        if (!activeTimeouts.has(n.id)) {
            const timeoutId = window.setTimeout(() => {
                if (notifications.value.some(item => item.id === n.id)) {
                    removeNotification(n.id);
                }
            }, NOTIFY_VISIBLE_DURATION);

            activeTimeouts.set(n.id, timeoutId);
        }
    });
}, { deep: true });

</script>

<template>
    <div class="notification-container" :class="{ 'rtl-mode': isRtl }">
        <transition-group name="notify" tag="div" class="notify-group">
            <div v-for="n in notifications" :key="n.id" class="notify-item" @click="removeManually(n.id)">
                <v-card class="d-flex align-center pa-3 rounded-pill elevation-8"
                    :style="{ background: `linear-gradient(${getConfig(n.type).bgGradient}) !important` }">

                    <v-icon v-if="!isRtl" start size="24" color="white" class="mr-3">
                        {{ getConfig(n.type).icon }}
                    </v-icon>

                    <span class="text-white font-weight-regular">{{ n.message }}</span>
                    <v-spacer />

                    <v-btn icon variant="text" size="small" @click.stop="removeManually(n.id)" class="ml-2">
                        <v-icon color="white" size="20">mdi-close</v-icon>
                    </v-btn>

                    <v-icon v-if="isRtl" end size="24" color="white" class="ml-3">
                        {{ getConfig(n.type).icon }}
                    </v-icon>
                </v-card>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.notification-container {
    position: fixed;
    top: 80px;
    right: 16px;
    /* Default LTR positioning */
    z-index: 10000;
    max-width: 420px;
}

/* RTL-specific positioning and animation overrides */
.notification-container.rtl-mode {
    left: 16px;
    right: auto;
}

.notify-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notify-item {
    cursor: pointer;
    will-change: transform, opacity;
}

/* --- Vue Transition Classes (LTR) --- */
.notify-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notify-enter-from {
    opacity: 0;
    transform: translateX(100%);
    /* Enter from right */
}

.notify-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0.0, 1.0, 1.0);
}

.notify-leave-to {
    opacity: 0;
    transform: translateX(100%);
    /* Leave to right */
}

.notify-move {
    transition: transform 0.4s ease;
}

/* --- Vue Transition Classes (RTL - Override) --- */
.rtl-mode .notify-enter-from {
    transform: translateX(-100%);
    /* Enter from left */
}

.rtl-mode .notify-leave-to {
    transform: translateX(-100%);
    /* Leave to left */
}
</style>