<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTodoStore } from '@/stores/todos';
import { useSettingsStore } from '@/stores/settings';
import type { TodoItem } from '@/stores/types';

const { t } = useI18n();
const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const newTodoText = ref('');

// --- State for Editing Modal ---
const editingTodo = ref<TodoItem | null>(null);
const editDialog = ref(false);

// --- State for Confirmation Modals ---
const deleteSingleDialog = ref(false);
const deleteAllDialog = ref(false);
const todoToDelete = ref<number | null>(null);

// --- State for Snackbar Notification ---
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

// --- State for Filtering and Sorting ---
const filterMode = ref('all');
const sortBy = ref('createdAt');
const sortDesc = ref(false);

const filteredTodos = computed(() => {
  let list = todoStore.todos;
  if (filterMode.value === 'pending') {
    list = list.filter(todo => !todo.isDone);
  } else if (filterMode.value === 'completed') {
    list = list.filter(todo => todo.isDone);
  }
  return list.slice().sort((a, b) => {
    let result = 0;
    if (sortBy.value === 'createdAt') {
      result = a.id - b.id;
    } else if (sortBy.value === 'text') {
      result = a.text.localeCompare(b.text);
    }
    return sortDesc.value ? -result : result;
  });
});

// --- Todo Actions ---
const handleAddTodo = () => {
  const addedSuccessfully = todoStore.addTodo(newTodoText.value);

  if (addedSuccessfully) {
    newTodoText.value = '';
  } else {
    const trimmedText = newTodoText.value.trim();
    if (trimmedText) {
      snackbarText.value = t('Task already exists: ') + trimmedText;
      snackbarColor.value = 'warning';
      showSnackbar.value = true;
    }
  }
};

const startEditing = (todo: TodoItem) => {
  // یک کپی از وظیفه را برای ویرایش در Modal ذخیره می‌کنیم
  editingTodo.value = { ...todo };
  editDialog.value = true;
};

const cancelEdit = () => {
  editingTodo.value = null;
  editDialog.value = false;
};

// 💡 تابع saveEdit (بدون تغییر از مرحله قبل)
const saveEdit = () => {
  if (editingTodo.value) {
    const trimmedText = editingTodo.value.text.trim();

    if (!trimmedText) {
      // اگر کاربر متن را پاک کرد، تأیید حذف را می‌خواهیم.
      confirmRemoveSingle(editingTodo.value.id);
      editDialog.value = false;
    } else {
      const success = todoStore.updateTodo(
        editingTodo.value.id,
        trimmedText,
        editingTodo.value.isDone
      );

      if (!success) {
        snackbarText.value = t('Cannot save changes. A todo with that name already exists.');
        snackbarColor.value = 'warning';
        showSnackbar.value = true;
      }
      editDialog.value = false;
    }
    editingTodo.value = null;
  }
};

const filterOptions = computed(() => [
  { text: t('All'), value: 'all', icon: 'mdi-list-box-outline' },
  { text: t('Pending'), value: 'pending', icon: 'mdi-timer-sand' },
  { text: t('Completed'), value: 'completed', icon: 'mdi-check-all' },
]);

// --- Confirmation Functions (بدون تغییر) ---
const confirmRemoveSingle = (id: number) => {
  todoToDelete.value = id;
  deleteSingleDialog.value = true;
};

const executeRemoveSingle = () => {
  if (todoToDelete.value !== null) {
    todoStore.removeTodo(todoToDelete.value);
  }
  deleteSingleDialog.value = false;
  todoToDelete.value = null;
};

const confirmRemoveAll = () => {
  if (todoStore.todos.length > 0) {
    deleteAllDialog.value = true;
  }
};

const executeRemoveAll = () => {
  todoStore.clearAllTodos();
  deleteAllDialog.value = false;
};

// --- Helper for dynamic colors (بدون تغییر) ---
const getTodoItemColor = (isDone: boolean) => {
  if (settingsStore.currentTheme === 'dark') {
    return isDone ? 'green-darken-4' : 'blue-grey-darken-3';
  }
  return isDone ? 'light-green-lighten-4' : 'surface';
};

const getTodoTextColor = (isDone: boolean) => {
  if (settingsStore.currentTheme === 'dark') {
    return isDone ? 'text-white' : 'text-blue-grey-lighten-5';
  }
  return isDone ? 'text-black' : 'text-grey-darken-3';
};

const getEditButtonColor = () => {
  if (settingsStore.currentTheme === 'dark') {
    return 'amber-darken-3';
  }
  return 'amber-lighten-2';
};

const getAddButtonColor = () => {
  if (settingsStore.currentTheme === 'dark') {
    return 'cyan-lighten-2';
  }
  return 'primary';
};
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold"
        :class="todoStore.todos.length > 0 ? 'primary--text' : 'text-medium-emphasis'">
        <v-icon size="large" class="mr-2">mdi-format-list-checks</v-icon>
        {{ t('TODO List') }}
      </h1>
    </div>

    <v-card class="mx-auto pa-4 pa-sm-6 elevation-8 rounded-xl" max-width="900">
      <v-card-title class="text-h5 text-center mb-6 font-weight-bold">
        {{ t('Manage Your Tasks') }}
      </v-card-title>

      <v-row no-gutters class="mb-8 align-center">
        <v-col cols="12" sm="9" md="10" class="pr-sm-3">
          <v-text-field v-model="newTodoText" :label="t('todo_placeholder')" variant="solo-filled" density="compact"
            hide-details clearable rounded="lg" @keyup.enter="handleAddTodo">
            <template v-slot:append-inner>
              <v-icon size="small" color="medium-emphasis">mdi-keyboard-return</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="3" md="2" class="d-flex justify-end mt-4 mt-sm-0">
          <v-btn :color="getAddButtonColor()" size="large" rounded="lg" block @click="handleAddTodo"
            :disabled="!newTodoText.trim()" elevation="4">
            <v-icon start>mdi-plus-circle</v-icon>
            {{ t('Add') }}
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="todoStore.todos.length > 0" class="mb-4 align-center">
        <v-col cols="12" sm="4" md="3">
          <v-select v-model="filterMode" :items="filterOptions" :label="t('Filter By')" item-title="text"
            item-value="value" density="compact" variant="outlined" rounded="lg" hide-details
            prepend-inner-icon="mdi-filter-variant"></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-select v-model="sortBy"
            :items="[{ text: t('Creation Time'), value: 'createdAt' }, { text: t('Alphabetical'), value: 'text' }]"
            :label="t('Sort By')" item-title="text" item-value="value" density="compact" variant="outlined" rounded="lg"
            hide-details prepend-inner-icon="mdi-sort"></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="6" class="text-sm-end mt-4 mt-sm-0">
          <v-btn icon variant="text" @click="sortDesc = !sortDesc" :title="t('Toggle Sort Direction')" class="mr-2">
            <v-icon>{{ sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}</v-icon>
          </v-btn>
          <v-chip color="secondary" size="small" class="mr-4">
            {{ filteredTodos.length }} {{ t('Tasks Shown') }}
          </v-chip>

          <v-btn color="error" variant="tonal" @click="confirmRemoveAll" size="small" rounded="lg"
            :title="t('Delete All Tasks')">
            <v-icon start>mdi-delete-sweep-outline</v-icon>
            {{ t('Delete All') }}
          </v-btn>
        </v-col>
      </v-row>

      <div class="todo-list-container">
        <v-card v-for="todo in filteredTodos" :key="todo.id" class="todo-item my-4 pa-3 rounded-xl elevation-3"
          :color="getTodoItemColor(todo.isDone)" :class="{ 'completed-item': todo.isDone }">
          <div class="d-flex align-center">

            <v-checkbox-btn :model-value="todo.isDone" color="primary" @click.stop="todoStore.toggleTodo(todo.id)"
              class="flex-shrink-0 mr-1"></v-checkbox-btn>

            <div class="flex-grow-1 mx-3 py-1">
              <p class="text-body-1 font-weight-medium"
                :class="[getTodoTextColor(todo.isDone), { 'text-decoration-line-through text-medium-emphasis': todo.isDone }]"
                @click="todoStore.toggleTodo(todo.id)" style="cursor: pointer;">
                {{ todo.text }}
              </p>
            </div>

            <div class="d-flex align-center flex-shrink-0 ml-auto">

              <v-chip :color="todo.isDone ? 'success' : 'info'" size="small" label
                class="font-weight-medium mr-4 d-none d-sm-flex">
                <v-icon start size="small">{{ todo.isDone ? 'mdi-check' : 'mdi-timer-sand' }}</v-icon>
                {{ todo.isDone ? t('Completed') : t('Pending') }}
              </v-chip>

              <v-btn icon variant="flat" size="small" :color="getEditButtonColor()" @click.stop="startEditing(todo)"
                class="ml-2 mr-1">
                <v-icon size="small">mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('Edit') }}</v-tooltip>
              </v-btn>

              <v-btn icon variant="flat" size="small"
                :color="settingsStore.currentTheme === 'dark' ? 'red-darken-4' : 'red-lighten-4'"
                @click.stop="confirmRemoveSingle(todo.id)">
                <v-icon size="small" color="error">mdi-delete-outline</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('Delete') }}</v-tooltip>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
      <v-alert v-if="todoStore.todos.length === 0" density="comfortable" type="info" variant="tonal"
        class="mt-6 rounded-lg" :icon="false">
        <div class="d-flex align-center">
          <v-icon start>mdi-list-status</v-icon>
          {{ t('Your task list is empty. Please add a new task to get started.') }}
        </div>
      </v-alert>

      <v-alert v-else-if="filteredTodos.length === 0" density="comfortable" type="warning" variant="tonal"
        class="mt-6 rounded-lg" :icon="false">
        <div class="d-flex align-center">
          <v-icon start>mdi-filter-off</v-icon>
          {{ t('No tasks found matching the current filter or sort criteria.') }}
        </div>
      </v-alert>
    </v-card>

    <v-dialog v-model="editDialog" max-width="500">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center">
          <v-icon color="amber" class="mr-2">mdi-pencil-box-multiple-outline</v-icon>
          {{ t('Edit Task') }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-if="editingTodo" v-model="editingTodo.text" :label="t('Task Title')" variant="solo-filled"
            hide-details autofocus rounded="lg" @keyup.enter="saveEdit" class="mt-4" />
          <v-checkbox v-if="editingTodo" v-model="editingTodo.isDone" :label="t('Mark as Completed')" color="success"
            hide-details class="mt-4" />
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn variant="text" @click="cancelEdit">
            {{ t('Cancel') }}
          </v-btn>
          <v-btn color="success" variant="flat" @click="saveEdit" :disabled="!editingTodo?.text.trim()">
            <v-icon start>mdi-check</v-icon>
            {{ t('Save Changes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteSingleDialog" max-width="400" :persistent="false">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
          {{ t('Confirm Deletion') }}
        </v-card-title>
        <v-card-text>
          {{ t('Are you sure you want to delete this task?') }}
          <div v-if="todoToDelete !== null" class="mt-2 font-weight-medium text-error">
            "{{todoStore.todos.find(t => t.id === todoToDelete)?.text}}"
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteSingleDialog = false">
            {{ t('Cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveSingle">
            {{ t('Delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteAllDialog" max-width="400" :persistent="false">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-delete-sweep-outline</v-icon>
          {{ t('Confirm Delete All') }}
        </v-card-title>
        <v-card-text>
          {{ t('Are you absolutely sure you want to delete ALL tasks?') }}
          {{ t('This action cannot be undone.') }}
          <div class="mt-2 font-weight-medium text-error">
            {{ t('Total tasks to delete:') }} {{ todoStore.totalTodos }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteAllDialog = false">
            {{ t('Cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveAll">
            {{ t('Delete All') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" :timeout="4000" :color="snackbarColor" location="bottom right" rounded="lg">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">
          {{ t('Close') }}
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<style scoped>
/* (Styles remain unchanged) */
.todo-list-container {
  padding-top: 8px;
  padding-bottom: 8px;
}

.todo-item {
  transition: all 0.2s ease-in-out;
  cursor: default;
}

.todo-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.completed-item {
  opacity: 0.9;
}

.v-text-field.v-input--density-default {
  --v-input-control-height: auto;
}
</style>