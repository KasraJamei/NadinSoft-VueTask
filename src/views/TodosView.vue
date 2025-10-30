<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTodoStore } from '@/stores/todos';
import type { TodoItem } from '@/stores/types';

const { t } = useI18n();
const todoStore = useTodoStore();
const newTodoText = ref('');
const editingTodo = ref<TodoItem | null>(null);

const handleAddTodo = () => {
    if (newTodoText.value.trim()) {
        todoStore.addTodo(newTodoText.value);
        newTodoText.value = '';
    }
};

const startEditing = (todo: TodoItem) => {
    editingTodo.value = { ...todo };
};

const saveEdit = () => {
    if (editingTodo.value) {
        if (!editingTodo.value.text.trim()) {
            // If text is empty, remove the todo instead of saving empty
            todoStore.removeTodo(editingTodo.value.id);
        } else {
            todoStore.editTodo(editingTodo.value.id, editingTodo.value.text);
        }
        editingTodo.value = null;
    }
};
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-6">
        <h1 class="text-h4 font-weight-bold primary--text">
            <v-icon size="large" class="mr-2">mdi-format-list-checks</v-icon>
            {{ t('TODO List') }}
        </h1>
    </div>

    <v-card class="mx-auto pa-6 elevation-8 rounded-xl" max-width="700">
      <v-card-title class="text-h5 text-center mb-6 font-weight-bold">
        {{ t('Manage Your Tasks') }}
      </v-card-title>
      
      <!-- Input and Add Button -->
      <v-row no-gutters class="mb-8 align-center">
          <v-col cols="12" sm="9">
              <v-text-field
                  v-model="newTodoText"
                  :label="t('todo_placeholder')"
                  variant="solo-filled"
                  density="comfortable"
                  hide-details
                  clearable
                  rounded="lg"
                  @keyup.enter="handleAddTodo"
              ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3" class="d-flex justify-end mt-4 mt-sm-0">
              <v-btn
                  color="secondary"
                  size="large"
                  rounded="lg"
                  block
                  @click="handleAddTodo"
                  :disabled="!newTodoText.trim()"
              >
                  <v-icon start>mdi-plus-circle</v-icon>
                  {{ t('Add') }}
              </v-btn>
          </v-col>
      </v-row>

      <!-- To-do List Items -->
      <v-list lines="two" class="py-0 rounded-xl" bg-color="transparent">
        <v-list-item
          v-for="todo in todoStore.todos"
          :key="todo.id"
          class="todo-item my-2 pa-4 rounded-lg elevation-2"
          :class="{'bg-green-lighten-5': todo.isDone}"
          :ripple="false"
        >
          <!-- Checkbox for completion -->
          <template v-slot:prepend>
            <v-list-item-action class="mr-3">
                <v-checkbox-btn 
                    :model-value="todo.isDone"
                    color="primary"
                    @click.stop="todoStore.toggleTodo(todo.id)"
                ></v-checkbox-btn>
            </v-list-item-action>
          </template>

          <!-- Content (Text or Edit Field) -->
          <template v-if="editingTodo && editingTodo.id === todo.id">
              <v-text-field
                  v-model="editingTodo.text"
                  variant="plain"
                  hide-details
                  autofocus
                  @keyup.enter="saveEdit"
                  @blur="saveEdit"
                  class="pt-0 mt-0 text-h6"
                  :dir="$i18n.locale === 'fa' ? 'rtl' : 'ltr'"
              ></v-text-field>
          </template>
          
          <template v-else>
              <v-list-item-title 
                :class="{'text-decoration-line-through text-grey-darken-1': todo.isDone, 'text-body-1': true}"
              >
                {{ todo.text }}
              </v-list-item-title>
              
              <!-- Chip for Status -->
              <v-list-item-subtitle class="mt-1">
                <v-chip 
                    :color="todo.isDone ? 'success' : 'info'" 
                    size="small"
                    label
                    class="font-weight-medium"
                >
                    <v-icon start size="small">{{ todo.isDone ? 'mdi-check' : 'mdi-timer-sand' }}</v-icon>
                    {{ todo.isDone ? t('Completed') : t('Pending') }}
                </v-chip>
              </v-list-item-subtitle>
          </template>

          <!-- Actions (Edit/Delete) -->
          <template v-slot:append>
              <v-btn 
                icon 
                variant="flat" 
                size="small" 
                color="blue-grey-lighten-4"
                @click.stop="startEditing(todo)"
                :disabled="todo.isDone || (editingTodo !== null && editingTodo.id !== todo.id)"
                class="ml-2"
              >
                <v-icon size="small">mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">ویرایش</v-tooltip>
              </v-btn>

              <v-btn 
                icon 
                variant="flat" 
                size="small" 
                color="red-lighten-4"
                @click.stop="todoStore.removeTodo(todo.id)"
              >
                <v-icon size="small" color="error">mdi-delete-outline</v-icon>
                <v-tooltip activator="parent" location="top">حذف</v-tooltip>
              </v-btn>
          </template>
        </v-list-item>
      </v-list>
      
      <!-- Empty List Alert -->
      <v-alert v-if="todoStore.todos.length === 0" 
               density="comfortable" 
               type="warning" 
               variant="tonal" 
               class="mt-6 rounded-lg"
      >
          <v-icon start>mdi-list-status</v-icon>
          لیست کارها خالی است. لطفاً یک کار جدید اضافه کنید.
      </v-alert>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Custom styles for hover effect */
.todo-item {
  transition: all 0.2s ease-in-out;
  cursor: default; /* Remove pointer cursor as interaction is via checkbox/buttons */
}

/* Light background change on hover for better visibility */
.todo-item:hover {
  background-color: var(--v-theme-surface-lighten-1, #f5f5f5) !important;
}

/* Specific style for completed items */
.bg-green-lighten-5 {
    background-color: var(--v-theme-success-lighten-5) !important;
}
</style>
