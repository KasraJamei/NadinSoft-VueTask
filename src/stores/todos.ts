// todos.ts

import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import type { TodoItem } from './types';

// Key used for storing the todo list in Local Storage
const STORAGE_KEY = 'todoList';

function loadTodos(): TodoItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as TodoItem[];
        } catch (e) {
            console.error("Failed to load todo list from Local Storage. Using empty list.", e);
            return [];
        }
    }
    return [];
}

export const useTodoStore = defineStore('todos', () => {

    // =======================================================================
    // 1. STATE
    // =======================================================================
    const todos = ref<TodoItem[]>(loadTodos());

    // =======================================================================
    // 2. GETTERS
    // =======================================================================
    const completedTodos = computed(() => todos.value.filter(todo => todo.isDone).length);
    const totalTodos = computed(() => todos.value.length);

    // =======================================================================
    // 3. ACTIONS
    // =======================================================================

    /**
     * Checks if a todo with the same text (case-insensitive, trimmed) already exists.
     * @param {string} text - The text content to check.
     * @returns {boolean} True if a duplicate exists.
     */
    function isDuplicate(text: string): boolean {
        const normalizedNewText = text.trim().toLowerCase();
        return todos.value.some(todo => todo.text.trim().toLowerCase() === normalizedNewText);
    }

    /**
     * Adds a new todo item to the beginning of the list.
     * @param {string} text - The text content of the new todo.
     * @returns {boolean} True if added successfully, false if duplicate or empty.
     */
    function addTodo(text: string): boolean {
        const trimmedText = text.trim();
        if (!trimmedText) return false;

        // Check for duplicates before adding
        if (isDuplicate(trimmedText)) {
            console.warn(`Todo '${trimmedText}' already exists and was not added.`);
            return false;
        }

        const newTodo: TodoItem = {
            id: Date.now(),
            text: trimmedText,
            isDone: false,
        };
        todos.value.unshift(newTodo);
        return true;
    }

    function removeTodo(id: number) {
        todos.value = todos.value.filter(todo => todo.id !== id);
    }

    function toggleTodo(id: number) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) {
            todo.isDone = !todo.isDone;
        }
    }

    function editTodo(id: number, newText: string) {
        const todo = todos.value.find(t => t.id === id);
        if (todo && newText.trim()) {

            const trimmedNewText = newText.trim();
            if (todo.text.trim().toLowerCase() !== trimmedNewText.toLowerCase() && isDuplicate(trimmedNewText)) {
                console.warn(`Cannot edit to '${trimmedNewText}'. A todo with that name already exists.`);
                return;
            }

            todo.text = trimmedNewText;
        }
    }

    /**
     * UPDATED: Updates both the text and the 'isDone' status of a todo item.
     * @param id - ID of the todo item.
     * @param newText - The new text content.
     * @param newIsDone - The new completion status.
     * @returns {boolean} True if update was successful, False if the text was a duplicate.
     */
    function updateTodo(id: number, newText: string, newIsDone: boolean): boolean {
        const todo = todos.value.find(t => t.id === id);
        const trimmedNewText = newText.trim();

        if (todo && trimmedNewText) {
            // Check for duplicate only if the text has actually changed
            const isTextNew = todo.text.trim().toLowerCase() !== trimmedNewText.toLowerCase();
            if (isTextNew && isDuplicate(trimmedNewText)) {
                console.warn(`Cannot save changes. A todo with the name '${trimmedNewText}' already exists.`);
                return false;
            }

            // Apply changes
            todo.text = trimmedNewText;
            todo.isDone = newIsDone;
            return true;
        }
        return false;
    }

    function clearAllTodos() {
        todos.value = [];
    }

    // =======================================================================
    // 4. PERSISTENCE
    // =======================================================================
    watch(
        todos,
        (newTodos) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
        },
        { deep: true }
    );

    return {
        todos,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodo,
        updateTodo,
        clearAllTodos,
        completedTodos,
        totalTodos
    };
});