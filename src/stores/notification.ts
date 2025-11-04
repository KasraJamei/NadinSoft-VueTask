import { ref, watch, computed } from 'vue'; // 🟢 'computed' اضافه شد
import { defineStore } from 'pinia';

// فرض می‌کنیم انواع نوتیفیکیشن شما شامل 'info', 'success', 'error' و انواع کاستوم تم باشد
export type NotificationType = 'info' | 'success' | 'error' | 'theme_light' | 'theme_dark' | 'name_update' | 'locale_change';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration: number;
}

const DEFAULT_DURATION = 5000; // 5 ثانیه

export const useNotificationStore = defineStore('notification', () => {
    // ────────────────────── STATE ──────────────────────
    const notifications = ref<Notification[]>([]);

    // ───────────────────── INTERNAL ────────────────────
    function _autoRemove(id: number) {
        // Find the notification to get its duration
        const notif = notifications.value.find(n => n.id === id);
        const duration = notif ? notif.duration : DEFAULT_DURATION;

        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }, duration);
    }

    // ───────────────────── ACTIONS ─────────────────────

    // 🟢 تغییر ضروری: اضافه کردن آرگومان اختیاری 'type' به متد info
    function info(message: string, type: NotificationType = 'info', duration: number = DEFAULT_DURATION) {
        const newNotification: Notification = {
            id: Date.now(),
            message,
            type,
            duration,
        };
        notifications.value.push(newNotification);
        _autoRemove(newNotification.id);
    }

    function success(message: string, duration: number = DEFAULT_DURATION) {
        info(message, 'success', duration);
    }

    function error(message: string, duration: number = DEFAULT_DURATION) {
        info(message, 'error', duration);
    }

    // متدهای اختصاصی که در ProfileView استفاده شده‌اند
    function updateName(message: string, duration: number = DEFAULT_DURATION) {
        info(message, 'name_update', duration);
    }

    function changeLocale(message: string, duration: number = DEFAULT_DURATION) {
        info(message, 'locale_change', duration);
    }


    // ───────────────────── GETTERS ─────────────────────
    const currentNotifications = computed(() => notifications.value);


    return {
        currentNotifications,
        info,
        success,
        error,
        updateName,
        changeLocale,
    };
});