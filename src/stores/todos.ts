import { ref, watch, computed } from 'vue';
import { defineStore } from 'pinia';
import type { TodoItem } from './types';

// Key used for storing the todo list in Local Storage
const STORAGE_KEY = 'todoList';

/**
 * Loads the todo list from Local Storage upon store initialization.
 * Returns an empty array if no data is found or if parsing fails.
 * @returns {TodoItem[]} The stored todo list or an empty array.
 */
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

/**
 * Defines the Todo Store using the Composition API pattern (Setup Store).
 * This store manages the list of tasks, including CRUD operations and persistence 
 * using Local Storage.
 */
export const useTodoStore = defineStore('todos', () => {
    
    // =======================================================================
    // 1. STATE: Reactive data representing the list of tasks
    // =======================================================================
    const todos = ref<TodoItem[]>(loadTodos());

    // =======================================================================
    // 2. GETTERS: Computed values for reactive data access (Equivalent to Store Getters)
    // =======================================================================
    
    /** Returns the total count of tasks marked as completed. */
    const completedTodos = computed(() => todos.value.filter(todo => todo.isDone).length);

    /** Returns the total number of tasks in the list. */
    const totalTodos = computed(() => todos.value.length);
    
    // =======================================================================
    // 3. ACTIONS: Functions containing business logic and state mutations
    // =======================================================================

    /**
     * Adds a new todo item to the beginning of the list.
     * @param {string} text - The text content of the new todo.
     */
    function addTodo(text: string) {
        if (!text.trim()) return;

        const newTodo: TodoItem = {
            id: Date.now(), 
            text: text.trim(),
            isDone: false,
        };
        todos.value.unshift(newTodo); // Mutate state by adding to the start
    }

    /**
     * Removes a todo item based on its ID.
     * @param {number} id - The ID of the todo to remove.
     */
    function removeTodo(id: number) {
        todos.value = todos.value.filter(todo => todo.id !== id); // Mutate state by filtering
    }

    /**
     * Toggles the completion status (isDone) of a specific todo item.
     * @param {number} id - The ID of the todo to toggle.
     */
    function toggleTodo(id: number) {
        const todo = todos.value.find(t => t.id === id);
        if (todo) {
            todo.isDone = !todo.isDone; // Mutate the item within the array
        }
    }
    
    /**
     * Edits the text content of a specific todo item.
     * @param {number} id - The ID of the todo to edit.
     * @param {string} newText - The new text content.
     */
    function editTodo(id: number, newText: string) {
        const todo = todos.value.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim(); // Mutate the item within the array
        }
    }

    // =======================================================================
    // 4. PERSISTENCE: Automatic saving to Local Storage via Vue watch
    // =======================================================================
    watch(
        todos,
        (newTodos) => {
            // Saves changes to Local Storage automatically upon any deep mutation to the array
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
        },
        { deep: true } // Crucial for monitoring changes within the todo items themselves
    );

    // Expose State, Getters, and Actions to components
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