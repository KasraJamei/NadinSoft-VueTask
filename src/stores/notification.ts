// src/stores/notification.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
    id: number;
    message: string;
    type: 'add' | 'edit' | 'complete' | 'reopen' | 'delete' | 'name' | 'locale' | 'theme_light' | 'theme_dark' | 'city' | 'error';
    timeout?: number;
}

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([]);
    let idCounter = 0;

    const add = (message: string, type: Notification['type'], timeout = 3500) => {
        const id = ++idCounter;
        notifications.value.push({ id, message, type, timeout });
        if (timeout > 0) setTimeout(() => remove(id), timeout);
    };

    const remove = (id: number) => {
        notifications.value = notifications.value.filter(n => n.id !== id);
    };

    const addTodo = (msg: string) => add(msg, 'add');
    const editTodo = (msg: string) => add(msg, 'edit');
    const completeTodo = (msg: string) => add(msg, 'complete');
    const reopenTodo = (msg: string) => add(msg, 'reopen');
    const deleteTodo = (msg: string) => add(msg, 'delete');
    const updateName = (msg: string) => add(msg, 'name');
    const changeLocale = (msg: string) => add(msg, 'locale');
    const changeTheme = (light: boolean, msg: string) => add(msg, light ? 'theme_light' : 'theme_dark');
    const saveCity = (msg: string) => add(msg, 'city');
    const error = (msg: string) => add(msg, 'error', 5000);

    return {
        notifications,
        add, remove,
        addTodo, editTodo, completeTodo, reopenTodo, deleteTodo,
        updateName, changeLocale, changeTheme, saveCity, error
    };
});