import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export type NotificationType =
    | 'info' | 'success' | 'error'
    | 'add' | 'edit' | 'complete' | 'reopen' | 'delete'
    | 'theme_light' | 'theme_dark' | 'name_update' | 'locale_change';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration: number;
}

const DEFAULT_DURATION = 5000;

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([]);

    function _autoRemove(id: number) {
        const notif = notifications.value.find(n => n.id === id);
        const duration = notif ? notif.duration : DEFAULT_DURATION;
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }, duration);
    }

    function info(message: string, type: NotificationType = 'info', duration = DEFAULT_DURATION) {
        const n: Notification = { id: Date.now(), message, type, duration };
        notifications.value.push(n);
        _autoRemove(n.id);
    }

    function success(message: string, duration = DEFAULT_DURATION) { info(message, 'success', duration); }
    function error(message: string, duration = DEFAULT_DURATION) { info(message, 'error', duration); }

    // Todo-specific shortcuts
    function addTodo(message: string) { info(message, 'add'); }
    function editTodo(message: string) { info(message, 'edit'); }
    function completeTodo(message: string) { info(message, 'complete'); }
    function reopenTodo(message: string) { info(message, 'reopen'); }
    function deleteTodo(message: string) { info(message, 'delete'); }

    // Settings shortcuts
    function updateName(message: string) { info(message, 'name_update'); }
    function changeLocale(message: string) { info(message, 'locale_change'); }

    function remove(id: number) {
        notifications.value = notifications.value.filter(n => n.id !== id);
    }

    const currentNotifications = computed(() => notifications.value);

    return {
        currentNotifications,
        info, success, error,
        addTodo, editTodo, completeTodo, reopenTodo, deleteTodo,
        updateName, changeLocale,
        remove,
    };
});