<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const notifyStore = useNotificationStore();
const { currentNotifications: notifications } = storeToRefs(notifyStore);
const { locale } = useI18n();
const isRtl = computed(() => locale.value === 'fa');

const NOTIFY_VISIBLE_DURATION = 3500;
const activeTimeouts = new Map<number, number>();

const getConfig = (type: string) => {
    const cfg: Record<string, any> = {
        add: { color: '#4caf50', icon: 'mdi-plus-circle', bgGradient: 'to right, #4caf50, #66bb6a' },
        edit: { color: '#2196f3', icon: 'mdi-pencil', bgGradient: 'to right, #2196f3, #42a5f5' },
        complete: { color: '#ff9800', icon: 'mdi-check-circle', bgGradient: 'to right, #ff9800, #ffb74d' },
        reopen: { color: '#ff5722', icon: 'mdi-undo', bgGradient: 'to right, #ff5722, #ff8a65' },
        delete: { color: '#d32f2f', icon: 'mdi-delete', bgGradient: 'to right, #d32f2f, #f44336' },
        name_update: { color: '#9c27b0', icon: 'mdi-account', bgGradient: 'to right, #9c27b0, #ba68c8' },
        locale_change: { color: '#0d47a1', icon: 'mdi-web', bgGradient: 'to right, #0d47a1, #1976d2' },
        theme_light: { color: '#ffc107', icon: 'mdi-white-balance-sunny', bgGradient: 'to right, #ffc107, #ffd54f' },
        theme_dark: { color: '#795548', icon: 'mdi-weather-night', bgGradient: 'to right, #795548, #a1887f' },
        error: { color: '#d32f2f', icon: 'mdi-close-circle', bgGradient: 'to right, #d32f2f, #ef5350' },
        info: { color: '#2196f3', icon: 'mdi-information', bgGradient: 'to right, #2196f3, #42a5f5' },
        success: { color: '#4caf50', icon: 'mdi-check-circle', bgGradient: 'to right, #4caf50, #66bb6a' },
    };
    return cfg[type] ?? cfg.info;
};

const removeNotification = (id: number) => {
    activeTimeouts.delete(id);
    notifyStore.remove(id);
};

const removeManually = (id: number) => {
    const tid = activeTimeouts.get(id);
    if (tid) clearTimeout(tid);
    removeNotification(id);
};

watch(notifications, newNotifs => {
    const ids = new Set(newNotifs.map(n => n.id));
    activeTimeouts.forEach((tid, id) => {
        if (!ids.has(id)) {
            clearTimeout(tid);
            activeTimeouts.delete(id);
        }
    });

    newNotifs.forEach(n => {
        if (!activeTimeouts.has(n.id)) {
            const tid = window.setTimeout(() => {
                if (notifications.value.some(i => i.id === n.id)) removeNotification(n.id);
            }, NOTIFY_VISIBLE_DURATION);
            activeTimeouts.set(n.id, tid);
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
    z-index: 10000;
    max-width: 420px;
}

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

.notify-enter-active {
    transition: all .4s cubic-bezier(.25, .8, .25, 1);
}

.notify-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.notify-leave-active {
    transition: all .4s cubic-bezier(.4, 0, 1, 1);
}

.notify-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.notify-move {
    transition: transform .4s ease;
}

.rtl-mode .notify-enter-from {
    transform: translateX(-100%);
}

.rtl-mode .notify-leave-to {
    transform: translateX(-100%);
}
</style>