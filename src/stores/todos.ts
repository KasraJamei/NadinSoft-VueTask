import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import type { TodoItem } from './types';

const STORAGE_KEY = 'todoList';

function loadTodos(): TodoItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as TodoItem[];
        } catch (e) {
            console.error('Failed to load todo list from Local Storage.', e);
            return [];
        }
    }
    return [];
}

export const useTodoStore = defineStore('todos', () => {
    // State
    const todos = ref<TodoItem[]>(loadTodos());

    // Getters
    const completedTodos = computed(() => todos.value.filter(t => t.isDone).length);
    const totalTodos = computed(() => todos.value.length);

    // Helpers
    function isDuplicate(text: string): boolean {
        const norm = text.trim().toLowerCase();
        return todos.value.some(t => t.text.trim().toLowerCase() === norm);
    }

    // Actions
    function addTodo(text: string): boolean {
        const trimmed = text.trim();
        if (!trimmed) return false;
        if (isDuplicate(trimmed)) {
            console.warn(`Todo '${trimmed}' already exists.`);
            return false;
        }
        const newTodo: TodoItem = { id: Date.now(), text: trimmed, isDone: false };
        todos.value.unshift(newTodo);
        return true;
    }

    function removeTodo(id: number) {
        todos.value = todos.value.filter(t => t.id !== id);
    }

    function toggleTodo(id: number) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) todo.isDone = !todo.isDone;
    }

    function editTodo(id: number, newText: string) {
        const todo = todos.value.find(t => t.id === id);
        if (!todo || !newText.trim()) return;
        const trimmed = newText.trim();
        if (todo.text.trim().toLowerCase() !== trimmed.toLowerCase() && isDuplicate(trimmed)) {
            console.warn(`Cannot edit to '${trimmed}'. Duplicate exists.`);
            return;
        }
        todo.text = trimmed;
    }

    function updateTodo(id: number, newText: string, newIsDone: boolean): boolean {
        const todo = todos.value.find(t => t.id === id);
        const trimmed = newText.trim();
        if (!todo || !trimmed) return false;

        const textChanged = todo.text.trim().toLowerCase() !== trimmed.toLowerCase();
        if (textChanged && isDuplicate(trimmed)) {
            console.warn(`Cannot save. Duplicate '${trimmed}'.`);
            return false;
        }

        todo.text = trimmed;
        todo.isDone = newIsDone;
        return true;
    }

    function clearAllTodos() {
        todos.value = [];
    }

    // Persistence
    watch(todos, newTodos => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
    }, { deep: true });

    return {
        todos,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodo,
        updateTodo,
        clearAllTodos,
        completedTodos,
        totalTodos,
    };
});