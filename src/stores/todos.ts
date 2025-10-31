import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import type { TodoItem } from './types';

// Local Storage Key for the todo list
const STORAGE_KEY = 'todoList';

/**
 * Helper function to load the todo list from Local Storage.
 * @returns {TodoItem[]} The loaded todo list or an empty array.
 */
function loadTodos(): TodoItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored) as TodoItem[];
        } catch (e) {
            console.error("Error loading todo list from Local Storage:", e);
            return [];
        }
    }
    return [];
}

export const useTodoStore = defineStore('todos', () => {
    
    // =======================================================================
    // 1. STATE (using ref from Vue)
    // =======================================================================
    const todos = ref<TodoItem[]>(loadTodos());

    // =======================================================================
    // 2. GETTERS (using computed from Vue)
    // =======================================================================
    /** Returns the number of completed todos. */
    const completedTodos = computed(() => todos.value.filter(todo => todo.isDone).length);

    /** Returns the number of total todos. */
    const totalTodos = computed(() => todos.value.length);
    
    // =======================================================================
    // 3. ACTIONS (using simple functions)
    // =======================================================================

    /**
     * Adds a new todo item to the beginning of the list.
     * @param text The text content of the new todo.
     */
    function addTodo(text: string) {
        if (!text.trim()) return;

        const newTodo: TodoItem = {
            id: Date.now(), 
            text: text.trim(),
            isDone: false,
        };
        todos.value.unshift(newTodo); // Mutate state
    }

    /**
     * Removes a todo item based on its ID.
     * @param id The ID of the todo to remove.
     */
    function removeTodo(id: number) {
        todos.value = todos.value.filter(todo => todo.id !== id); // Mutate state
    }

    /**
     * Toggles the completion status (isDone) of a specific todo item.
     * @param id The ID of the todo to toggle.
     */
    function toggleTodo(id: number) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) {
            todo.isDone = !todo.isDone; // Mutate state
        }
    }
    
    /**
     * Edits the text content of a specific todo item.
     * @param id The ID of the todo to edit.
     * @param newText The new text content.
     */
    function editTodo(id: number, newText: string) {
        const todo = todos.value.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim(); // Mutate state
        }
    }

    // =======================================================================
    // 4. PERSISTENCE (using watch from Vue)
    // =======================================================================
    watch(
        todos,
        (newTodos) => {
            // Saves changes to Local Storage whenever the todos array or its items change
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
        },
        { deep: true } // Monitor deep changes within the array and its items
    );

    // Return everything needed by components
    return {
        todos,
        addTodo,
        removeTodo,
        toggleTodo,
        editTodo,
        completedTodos,
        totalTodos
    };
});