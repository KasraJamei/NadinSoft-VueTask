<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

const notifyStore = useNotificationStore();
const { notifications } = storeToRefs(notifyStore);

// --- Configuration ---
// Total time the notification should be visible before starting the exit transition.
const NOTIFY_VISIBLE_DURATION = 3500; // 3.5 seconds visible time

/**
 * Gets the style configuration (color, icon, gradient) for each notification type.
 */
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

// --- FIX: Implement automatic removal using setTimeout (The core fix for 'too fast') ---

// We watch the list of notifications to set a timeout for any new ones.
// Since we cannot use timeoutId in the store, we manage the state *within* the component
// using a temporary Map to track the timeouts, keyed by notification ID.
const activeTimeouts = new Map<number, number>();

// Function to handle removal after timeout
const removeNotification = (id: number) => {
    // Clear timeout reference and remove from store
    activeTimeouts.delete(id);
    notifyStore.remove(id);
};

// Function to manually remove (on click)
const removeManually = (id: number) => {
    const timeoutId = activeTimeouts.get(id);
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    removeNotification(id);
};

// Watch for changes in the list of notifications
watch(notifications, (newNotifications) => {
    // Get IDs of currently displayed notifications
    const newIds = new Set(newNotifications.map(n => n.id));

    // 1. Clear timeouts for notifications that were manually dismissed or already removed
    activeTimeouts.forEach((timeoutId, id) => {
        if (!newIds.has(id)) {
            clearTimeout(timeoutId);
            activeTimeouts.delete(id);
        }
    });

    // 2. Set timeouts for newly added notifications
    newNotifications.forEach(n => {
        if (!activeTimeouts.has(n.id)) {
            // Set the timeout
            const timeoutId = window.setTimeout(() => {
                // Ensure the element is still in the list before trying to remove (prevent race condition)
                if (notifications.value.some(item => item.id === n.id)) {
                    removeNotification(n.id);
                }
            }, NOTIFY_VISIBLE_DURATION);

            // Store the timeout ID
            activeTimeouts.set(n.id, timeoutId);
        }
    });
}, { deep: true });

</script>

<template>
    <div class="notification-container">
        <transition-group name="notify" tag="div" class="notify-group">
            <div v-for="n in notifications" :key="n.id" class="notify-item" @click="removeManually(n.id)">
                <v-card class="d-flex align-center pa-3 rounded-pill elevation-8"
                    :style="{ background: `linear-gradient(${getConfig(n.type).bgGradient}) !important` }">
                    <v-icon start size="24" color="white" class="mr-3">
                        {{ getConfig(n.type).icon }}
                    </v-icon>
                    <span class="text-white font-weight-regular">{{ n.message }}</span>
                    <v-spacer />
                    <v-btn icon variant="text" size="small" @click.stop="removeManually(n.id)" class="ml-2">
                        <v-icon color="white" size="20">mdi-close</v-icon>
                    </v-btn>
                </v-card>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
/* Container: Positioned fixed at the top right */
.notification-container {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 10000;
    max-width: 420px;
}

/* Group: Ensures vertical stacking and spacing */
.notify-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notify-item {
    cursor: pointer;
    will-change: transform, opacity;
}

/* --- Vue Transition Classes --- */

/* Entering animation (Slide in from right) */
.notify-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notify-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

/* 1. FIX: Removed Delay from CSS. Delay is now handled by setTimeout in JS. */
/* 2. FIX: Removed position: absolute to prevent sticking and allow smooth vertical movement. */
.notify-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0.0, 1.0, 1.0);
    /* Note: position: absolute removed to allow notify-move to function correctly */
}

.notify-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* FIX: Moving animation (Smoothly slides elements below up when an item is removed) */
/* This prevents the "jumping" effect. */
.notify-move {
    transition: transform 0.4s ease;
}
</style>