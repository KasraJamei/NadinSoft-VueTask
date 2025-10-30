// src/stores/todos.ts
import { ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { TodoItem } from './types';

// کلید Local Storage برای لیست کارها
const STORAGE_KEY = 'todoList';

// تابع کمکی برای بارگذاری لیست کارها از Local Storage
function loadTodos(): TodoItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
         try {
            // اطمینان از اینکه خروجی آرایه است
            return JSON.parse(stored) as TodoItem[];
        } catch (e) {
             console.error("Error loading todo list from Local Storage:", e);
            return [];
        }
    }
    return [];
}

export const useTodoStore = defineStore('todos', () => {
    // State: لیست کارها
    const todos = ref<TodoItem[]>(loadTodos());

    // Action: اضافه کردن کار جدید
    function addTodo(text: string) {
        if (!text.trim()) return;

        const newTodo: TodoItem = {
            // استفاده از timestamp برای id منحصر به فرد
            id: Date.now(), 
            text: text.trim(),
            isDone: false,
        };
        todos.value.unshift(newTodo); // اضافه شدن به ابتدای لیست (جدیدترین کار بالا قرار می‌گیرد)
    }

    // Action: حذف یک کار
    function removeTodo(id: number) {
        todos.value = todos.value.filter(todo => todo.id !== id);
    }

    // Action: تغییر وضعیت انجام شده/نشده
    function toggleTodo(id: number) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) {
            todo.isDone = !todo.isDone;
        }
    }
    
    // Action: ویرایش متن یک کار
    function editTodo(id: number, newText: string) {
        const todo = todos.value.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
        }
    }

    // مشاهده تغییرات و ذخیره در Local Storage (Persistence)
    watch(
        todos,
        (newTodos) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
        },
        { deep: true } // نظارت بر تغییرات عمیق آرایه و آیتم‌های داخل آن
    );

    return {
        todos,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodo
    };
});