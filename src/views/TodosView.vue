<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTodoStore } from '@/stores/todos';
import { useSettingsStore } from '@/stores/settings';
import { useNotificationStore } from '@/stores/notification';
import type { TodoItem } from '@/stores/types';

const { t } = useI18n();
const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const notify = useNotificationStore();

const newTodoText = ref('');
const editingTodo = ref<TodoItem | null>(null);
const editDialog = ref(false);
const deleteSingleDialog = ref(false);
const deleteAllDialog = ref(false);
const todoToDelete = ref<number | null>(null);

const filterMode = ref<'all' | 'pending' | 'completed'>('all');
const sortBy = ref<'createdAt' | 'text'>('createdAt');
const sortDesc = ref(false);

const filteredTodos = computed(() => {
  let list = todoStore.todos;
  if (filterMode.value === 'pending') list = list.filter(t => !t.isDone);
  else if (filterMode.value === 'completed') list = list.filter(t => t.isDone);

  return list.slice().sort((a, b) => {
    let diff = 0;
    if (sortBy.value === 'createdAt') diff = a.id - b.id;
    else if (sortBy.value === 'text') diff = a.text.localeCompare(b.text);
    return sortDesc.value ? -diff : diff;
  });
});

const handleAddTodo = () => {
  const txt = newTodoText.value.trim();
  if (!txt) return;
  const ok = todoStore.addTodo(txt);
  if (ok) {
    newTodoText.value = '';
    notify.addTodo(t('notification.task_added', { task: txt }));
  } else {
    notify.error(t('notification.task_already_exists', { task: txt }));
  }
};

const startEditing = (todo: TodoItem) => {
  editingTodo.value = { ...todo };
  editDialog.value = true;
};

const cancelEdit = () => {
  editingTodo.value = null;
  editDialog.value = false;
};

const saveEdit = () => {
  if (!editingTodo.value) return;

  const txt = editingTodo.value.text.trim();
  const orig = todoStore.todos.find(t => t.id === editingTodo.value!.id);
  const wasDone = orig?.isDone ?? false;

  if (!txt) {
    confirmRemoveSingle(editingTodo.value.id);
    editDialog.value = false;
    editingTodo.value = null;
    return;
  }

  const ok = todoStore.updateTodo(editingTodo.value.id, txt, editingTodo.value.isDone);
  if (ok) {
    if (!wasDone && editingTodo.value.isDone) {
      notify.completeTodo(t('notification.task_completed', { task: txt }));
    } else {
      notify.editTodo(t('notification.task_updated', { task: txt }));
    }
  } else {
    notify.error(t('notification.cannot_save_edit'));
  }

  editDialog.value = false;
  editingTodo.value = null;
};

const toggleAndNotify = (id: number) => {
  const todo = todoStore.todos.find(t => t.id === id);
  if (!todo) return;
  const wasDone = todo.isDone;
  todoStore.toggleTodo(id);
  if (wasDone) {
    notify.reopenTodo(t('notification.task_reopened', { task: todo.text }));
  } else {
    notify.completeTodo(t('notification.task_completed', { task: todo.text }));
  }
};

const filterOptions = computed(() => [
  { text: t('filter_options.all'), value: 'all', icon: 'mdi-list-box-outline' },
  { text: t('filter_options.pending'), value: 'pending', icon: 'mdi-timer-sand' },
  { text: t('filter_options.completed'), value: 'completed', icon: 'mdi-check-all' },
]);

const confirmRemoveSingle = (id: number) => {
  todoToDelete.value = id;
  deleteSingleDialog.value = true;
};

const executeRemoveSingle = () => {
  if (todoToDelete.value === null) return;
  const txt = todoStore.todos.find(t => t.id === todoToDelete.value)?.text || '';
  todoStore.removeTodo(todoToDelete.value);
  notify.deleteTodo(t('notification.task_deleted', { task: txt }));
  deleteSingleDialog.value = false;
  todoToDelete.value = null;
};

const confirmRemoveAll = () => {
  if (todoStore.todos.length > 0) deleteAllDialog.value = true;
};

const executeRemoveAll = () => {
  todoStore.clearAllTodos();
  notify.deleteTodo(t('notification.all_tasks_deleted'));
  deleteAllDialog.value = false;
};

const getTodoItemColor = (done: boolean) =>
  settingsStore.currentTheme === 'dark'
    ? (done ? 'green-darken-4' : 'blue-grey-darken-3')
    : (done ? 'light-green-lighten-4' : 'surface');

const getTodoTextColor = (done: boolean) =>
  settingsStore.currentTheme === 'dark'
    ? (done ? 'text-white' : 'text-blue-grey-lighten-5')
    : (done ? 'text-black' : 'text-grey-darken-3');

const getEditButtonColor = () =>
  settingsStore.currentTheme === 'dark' ? 'amber-darken-3' : 'amber-lighten-2';

const getAddButtonColor = () =>
  settingsStore.currentTheme === 'dark' ? 'cyan-lighten-2' : 'primary';
</script>

<template>
  <v-container>
    <div class="text-center mb-6">
      <h1 class="text-h4 font-weight-bold d-inline-flex align-center"
        :class="todoStore.todos.length ? 'primary--text' : 'text-medium-emphasis'">
        <v-icon size="large" class="mr-2">mdi-format-list-checks</v-icon>
        {{ t('title.todo_list') }}
      </h1>
    </div>

    <v-card class="mx-auto pa-4 pa-sm-6 elevation-8 rounded-xl" max-width="900">
      <v-card-title class="text-h5 text-center mb-6 font-weight-bold">
        {{ t('heading.manage_tasks') }}
      </v-card-title>

      <!-- Add Todo -->
      <v-row no-gutters class="mb-8 align-center">
        <v-col cols="12" sm="9" md="10" class="pr-sm-3">
          <v-text-field v-model="newTodoText" :label="t('todo.placeholder')" variant="solo-filled" density="compact"
            hide-details clearable rounded="lg" @keyup.enter="handleAddTodo" data-testid="todo-input">
            <template #append-inner>
              <v-icon size="small" color="medium-emphasis">mdi-keyboard-return</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="3" md="2" class="d-flex justify-end mt-4 mt-sm-0">
          <v-btn :color="getAddButtonColor()" size="large" rounded="lg" block @click="handleAddTodo"
            :disabled="!newTodoText.trim()" elevation="4" data-testid="add-todo-btn">
            <v-icon start>mdi-plus-circle</v-icon>
            {{ t('button.add') }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filters & Sort -->
      <v-row v-if="todoStore.todos.length" class="mb-4 align-center">
        <v-col cols="12" sm="4" md="3">
          <v-select v-model="filterMode" :items="filterOptions" :label="t('todo.filter_by')" item-title="text"
            item-value="value" density="compact" variant="outlined" rounded="lg" hide-details
            prepend-inner-icon="mdi-filter-variant" />
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-select v-model="sortBy" :items="[
            { text: t('sort_options.creation_time'), value: 'createdAt' },
            { text: t('sort_options.alphabetical'), value: 'text' }
          ]" :label="t('todo.sort_by')" item-title="text" item-value="value" density="compact" variant="outlined"
            rounded="lg" hide-details prepend-inner-icon="mdi-sort" />
        </v-col>
        <v-col cols="12" sm="4" md="6" class="text-sm-end mt-4 mt-sm-0">
          <v-btn icon variant="text" @click="sortDesc = !sortDesc" :title="t('todo.toggle_sort_direction')"
            class="mr-2">
            <v-icon>{{ sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}</v-icon>
          </v-btn>
          <v-chip color="secondary" size="small" class="mr-4">
            {{ filteredTodos.length }} {{ t('todo.tasks_shown') }}
          </v-chip>
          <v-btn color="error" variant="tonal" @click="confirmRemoveAll" size="small" rounded="lg"
            :title="t('todo.delete_all_tasks_title')">
            <v-icon start>mdi-delete-sweep-outline</v-icon>
            {{ t('button.delete_all') }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Todo List -->
      <div class="todo-list-container">
        <v-card v-for="todo in filteredTodos" :key="todo.id" class="todo-item my-4 pa-3 rounded-xl elevation-3"
          :color="getTodoItemColor(todo.isDone)" :class="{ 'completed-item': todo.isDone }">
          <div class="d-flex align-center">
            <v-checkbox-btn :model-value="todo.isDone" color="primary" @click.stop="toggleAndNotify(todo.id)"
              class="flex-shrink-0 mr-1" />
            <div class="flex-grow-1 mx-3 py-1">
              <p class="text-body-1 font-weight-medium"
                :class="[getTodoTextColor(todo.isDone), { 'text-decoration-line-through text-medium-emphasis': todo.isDone }]"
                @click="toggleAndNotify(todo.id)" style="cursor: pointer">
                {{ todo.text }}
              </p>
            </div>
            <div class="d-flex align-center flex-shrink-0 ml-auto">
              <v-chip :color="todo.isDone ? 'success' : 'info'" size="small" label
                class="font-weight-medium mr-4 d-none d-sm-flex">
                <v-icon start size="small">{{ todo.isDone ? 'mdi-check' : 'mdi-timer-sand' }}</v-icon>
                {{ todo.isDone ? t('status.completed') : t('status.pending') }}
              </v-chip>
              <v-btn icon variant="flat" size="small" :color="getEditButtonColor()" @click.stop="startEditing(todo)"
                class="ml-2 mr-1" data-testid="edit-todo-btn">
                <v-icon size="small">mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('button.edit') }}</v-tooltip>
              </v-btn>
              <v-btn icon variant="flat" size="small"
                :color="settingsStore.currentTheme === 'dark' ? 'red-darken-4' : 'red-lighten-4'"
                @click.stop="confirmRemoveSingle(todo.id)" data-testid="delete-todo-btn">
                <v-icon size="small" color="error">mdi-delete-outline</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('button.delete') }}</v-tooltip>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Empty / No Match -->
      <v-alert v-if="!todoStore.todos.length" density="comfortable" type="info" variant="tonal" class="mt-6 rounded-lg"
        :icon="false">
        <div class="d-flex align-center">
          <v-icon start>mdi-list-status</v-icon>
          {{ t('alert.empty_list') }}
        </div>
      </v-alert>
      <v-alert v-else-if="!filteredTodos.length" density="comfortable" type="warning" variant="tonal"
        class="mt-6 rounded-lg" :icon="false">
        <div class="d-flex align-center">
          <v-icon start>mdi-filter-off</v-icon>
          {{ t('alert.no_tasks_match_filter') }}
        </div>
      </v-alert>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center">
          <v-icon color="amber" class="mr-2">mdi-pencil-box-multiple-outline</v-icon>
          {{ t('dialog.edit_task_title') }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-if="editingTodo" v-model="editingTodo.text" :label="t('todo.task_title_label')"
            variant="solo-filled" hide-details autofocus rounded="lg" @keyup.enter="saveEdit" class="mt-4"
            data-testid="edit-todo-input" />
          <v-checkbox v-if="editingTodo" v-model="editingTodo.isDone" :label="t('todo.mark_as_completed')"
            color="success" hide-details class="mt-4" />
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn variant="text" @click="cancelEdit">{{ t('button.cancel') }}</v-btn>
          <v-btn color="success" variant="flat" @click="saveEdit" :disabled="!editingTodo?.text.trim()"
            data-testid="save-edit-btn">
            <v-icon start>mdi-check</v-icon>
            {{ t('button.save_changes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Single -->
    <v-dialog v-model="deleteSingleDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
          {{ t('dialog.confirm_deletion_title') }}
        </v-card-title>
        <v-card-text>
          {{ t('dialog.delete_single_prompt') }}
          <div v-if="todoToDelete !== null" class="mt-2 font-weight-medium text-error">
            "{{todoStore.todos.find(t => t.id === todoToDelete)?.text}}"
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteSingleDialog = false">{{ t('button.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveSingle">{{ t('button.delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete All -->
    <v-dialog v-model="deleteAllDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-delete-sweep-outline</v-icon>
          {{ t('dialog.confirm_delete_all_title') }}
        </v-card-title>
        <v-card-text>
          {{ t('dialog.delete_all_prompt_1') }} {{ t('dialog.delete_all_prompt_2') }}
          <div class="mt-2 font-weight-medium text-error">
            {{ t('dialog.total_tasks_to_delete') }} {{ todoStore.totalTodos }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteAllDialog = false">{{ t('button.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveAll">{{ t('button.delete_all') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.todo-list-container {
  padding: 8px 0;
}

.todo-item {
  transition: all .2s ease-in-out;
  cursor: default;
}

.todo-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, .1);
  transform: translateY(-2px);
}

.completed-item {
  opacity: .9;
}
</style>