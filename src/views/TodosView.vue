<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodoStore } from '@/stores/todos'
import { useSettingsStore } from '@/stores/settings'
import { useNotificationStore } from '@/stores/notification'
import type { TodoItem } from '@/stores/types'

const { t, locale } = useI18n()
const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const notify = useNotificationStore()

const newTodoText = ref('')
const editingTodo = ref<TodoItem | null>(null)
const editDialog = ref(false)
const deleteSingleDialog = ref(false)
const deleteAllDialog = ref(false)
const todoToDelete = ref<number | null>(null)
const filterMode = ref<'all' | 'pending' | 'completed'>('all')
const sortBy = ref<'createdAt' | 'text'>('createdAt')
const sortDesc = ref(false)

const isRtl = computed(() => locale.value === 'fa')

// Filter and sort todos based on current settings
const filteredTodos = computed(() => {
  let list = todoStore.todos
  if (filterMode.value === 'pending') list = list.filter(t => !t.isDone)
  else if (filterMode.value === 'completed') list = list.filter(t => t.isDone)

  return list.slice().sort((a, b) => {
    let diff = 0
    if (sortBy.value === 'createdAt') diff = a.id - b.id
    else if (sortBy.value === 'text') diff = a.text.localeCompare(b.text)
    return sortDesc.value ? -diff : diff
  })
})

// Add new todo if text is valid and not duplicate
const handleAddTodo = () => {
  const txt = newTodoText.value.trim()
  if (!txt) return
  const ok = todoStore.addTodo(txt)
  if (ok) {
    newTodoText.value = ''
    notify.addTodo(t('notification.task_added', { task: txt }))
  } else {
    notify.error(t('notification.task_already_exists', { task: txt }))
  }
}

// Open edit dialog with a copy of the todo
const startEditing = (todo: TodoItem) => {
  editingTodo.value = { ...todo }
  editDialog.value = true
}

// Cancel editing
const cancelEdit = () => {
  editingTodo.value = null
  editDialog.value = false
}

// Save edited todo, handle empty text by deleting
const saveEdit = () => {
  if (!editingTodo.value) return
  const txt = editingTodo.value.text.trim()
  const orig = todoStore.todos.find(t => t.id === editingTodo.value!.id)
  const wasDone = orig?.isDone ?? false

  if (!txt) {
    confirmRemoveSingle(editingTodo.value.id)
    editDialog.value = false
    editingTodo.value = null
    return
  }

  const ok = todoStore.updateTodo(editingTodo.value.id, txt, editingTodo.value.isDone)
  if (ok) {
    if (!wasDone && editingTodo.value.isDone) {
      notify.completeTodo(t('notification.task_completed', { task: txt }))
    } else {
      notify.editTodo(t('notification.task_updated', { task: txt }))
    }
  } else {
    notify.error(t('notification.cannot_save_edit'))
  }
  editDialog.value = false
  editingTodo.value = null
}

// Toggle completion status and show notification
const toggleAndNotify = (id: number) => {
  const todo = todoStore.todos.find(t => t.id === id)
  if (!todo) return
  const wasDone = todo.isDone
  todoStore.toggleTodo(id)
  if (wasDone) {
    notify.reopenTodo(t('notification.task_reopened', { task: todo.text }))
  } else {
    notify.completeTodo(t('notification.task_completed', { task: todo.text }))
  }
}

// Filter options for the dropdown
const filterOptions = computed(() => [
  { text: t('filter_options.all'), value: 'all', icon: 'mdi-list-box-outline' },
  { text: t('filter_options.pending'), value: 'pending', icon: 'mdi-timer-sand' },
  { text: t('filter_options.completed'), value: 'completed', icon: 'mdi-check-all' },
])

// Confirm deletion of a single todo
const confirmRemoveSingle = (id: number) => {
  todoToDelete.value = id
  deleteSingleDialog.value = true
}

// Execute single todo deletion
const executeRemoveSingle = () => {
  if (todoToDelete.value === null) return
  const txt = todoStore.todos.find(t => t.id === todoToDelete.value)?.text || ''
  todoStore.removeTodo(todoToDelete.value)
  notify.deleteTodo(t('notification.task_deleted', { task: txt }))
  deleteSingleDialog.value = false
  todoToDelete.value = null
}

// Confirm deletion of all todos
const confirmRemoveAll = () => {
  if (todoStore.todos.length > 0) deleteAllDialog.value = true
}

// Execute deletion of all todos
const executeRemoveAll = () => {
  todoStore.clearAllTodos()
  notify.deleteTodo(t('notification.all_tasks_deleted'))
  deleteAllDialog.value = false
}

// Dynamic color for todo item background
const getTodoItemColor = (done: boolean) =>
  settingsStore.currentTheme === 'dark'
    ? (done ? 'green-darken-4' : 'blue-grey-darken-3')
    : (done ? 'light-green-lighten-4' : 'surface')

// Dynamic color for todo text
const getTodoTextColor = (done: boolean) =>
  settingsStore.currentTheme === 'dark'
    ? (done ? 'text-white' : 'text-blue-grey-lighten-5')
    : (done ? 'text-black' : 'text-grey-darken-3')

// Edit button color based on theme
const getEditButtonColor = () =>
  settingsStore.currentTheme === 'dark' ? 'amber-darken-3' : 'amber-lighten-2'

// Add button color based on theme
const getAddButtonColor = () =>
  settingsStore.currentTheme === 'dark' ? 'cyan-lighten-2' : 'primary'

// Button is enabled only if input has non-whitespace text
const canAddTodo = computed(() => newTodoText.value.trim().length > 0)
</script>

<template>
  <v-container>
    <div class="text-center mb-6">
      <h1 class="text-h4 font-weight-bold d-inline-flex align-center"
        :class="[todoStore.todos.length ? 'primary--text' : 'text-medium-emphasis', isRtl ? 'flex-row-reverse' : '']">
        <v-icon size="large" :class="isRtl ? 'ms-2' : 'me-2'">mdi-format-list-checks</v-icon>
        {{ t('title.todo_list') }}
      </h1>
    </div>

    <v-card class="mx-auto pa-4 pa-sm-6 elevation-8 rounded-xl" max-width="900">
      <v-card-title class="text-h5 text-center mb-6 font-weight-bold">
        {{ t('heading.manage_tasks') }}
      </v-card-title>

      <!-- Add Todo Input + Button -->
      <v-row no-gutters class="mb-8 align-center" :class="isRtl ? 'flex-row-reverse' : ''">
        <v-col cols="12" sm="9" md="10" :class="isRtl ? 'ps-sm-3' : 'pe-sm-3'">
          <v-text-field v-model="newTodoText" :label="t('todo.placeholder')" variant="solo-filled" density="compact"
            hide-details rounded="lg" @keyup.enter="handleAddTodo" data-testid="todo-input"
            :class="{ 'rtl-input': isRtl }">
            <template #append-inner>
              <v-icon size="small" color="medium-emphasis">mdi-keyboard-return</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" sm="3" md="2" class="d-flex mt-4 mt-sm-0" :class="isRtl ? 'justify-start' : 'justify-end'">
          <v-btn :color="getAddButtonColor()" size="large" rounded="lg" block @click="handleAddTodo"
            :disabled="!canAddTodo" elevation="4" data-testid="add-todo-btn">
            <v-icon :class="isRtl ? 'ms-1' : 'me-1'">mdi-plus-circle</v-icon>
            {{ t('button.add') }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Filters, Sort, and Delete All -->
      <v-row v-if="todoStore.todos.length" class="mb-4 align-center" :class="isRtl ? 'flex-row-reverse' : ''">
        <v-col cols="12" sm="4" md="3" :class="isRtl ? 'ps-sm-3' : 'pe-sm-3'">
          <v-select v-model="filterMode" :items="filterOptions" :label="t('todo.filter_by')" item-title="text"
            item-value="value" density="compact" variant="outlined" rounded="lg" hide-details
            prepend-inner-icon="mdi-filter-variant" :class="{ 'rtl-input': isRtl }" />
        </v-col>

        <v-col cols="12" sm="4" md="3" :class="isRtl ? 'ps-sm-3' : 'pe-sm-3'">
          <v-select v-model="sortBy" :items="[
            { text: t('sort_options.creation_time'), value: 'createdAt' },
            { text: t('sort_options.alphabetical'), value: 'text' }
          ]" :label="t('todo.sort_by')" item-title="text" item-value="value" density="compact" variant="outlined"
            rounded="lg" hide-details prepend-inner-icon="mdi-sort" :class="{ 'rtl-input': isRtl }" />
        </v-col>

        <v-col cols="12" sm="4" md="6" class="d-flex align-center" :class="isRtl ? 'justify-start' : 'justify-end'">
          <v-btn icon variant="text" @click="sortDesc = !sortDesc" :title="t('todo.toggle_sort_direction')">
            <v-icon>{{ sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}</v-icon>
          </v-btn>
          <v-chip color="secondary" size="small" class="mx-4">
            {{ filteredTodos.length }} {{ t('todo.tasks_shown') }}
          </v-chip>
          <v-btn color="error" variant="tonal" @click="confirmRemoveAll" size="small" rounded="lg">
            <v-icon :class="isRtl ? 'ms-1' : 'me-1'">mdi-delete-sweep-outline</v-icon>
            {{ t('button.delete_all') }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Todo List -->
      <div class="todo-list-container">
        <v-card v-for="todo in filteredTodos" :key="todo.id" class="todo-item my-4 pa-3 rounded-xl elevation-3"
          :color="getTodoItemColor(todo.isDone)" :class="{ 'completed-item': todo.isDone }">
          <div class="d-flex align-center" :dir="isRtl ? 'rtl' : 'ltr'">
            <v-checkbox-btn :model-value="todo.isDone" color="primary" @click.stop="toggleAndNotify(todo.id)"
              :class="['flex-shrink-0', isRtl ? 'ms-1' : 'me-1']" />
            <div class="flex-grow-1 mx-3 py-1" :style="{ textAlign: isRtl ? 'right' : 'left' }">
              <p class="text-body-1 font-weight-medium"
                :class="[getTodoTextColor(todo.isDone), { 'text-decoration-line-through text-medium-emphasis': todo.isDone }]"
                @click="toggleAndNotify(todo.id)" style="cursor: pointer">
                {{ todo.text }}
              </p>
            </div>
            <div class="d-flex align-center flex-shrink-0" :class="isRtl ? 'me-auto' : 'ms-auto'">
              <v-chip :color="todo.isDone ? 'success' : 'info'" size="small" label
                class="font-weight-medium d-none d-sm-flex mx-4">
                <v-icon size="small" :class="isRtl ? 'ms-1' : 'me-1'">
                  {{ todo.isDone ? 'mdi-check' : 'mdi-timer-sand' }}
                </v-icon>
                {{ todo.isDone ? t('status.completed') : t('status.pending') }}
              </v-chip>
              <v-btn icon variant="flat" size="small" :color="getEditButtonColor()" @click.stop="startEditing(todo)"
                data-testid="edit-todo-btn">
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

      <!-- Empty States -->
      <v-alert v-if="!todoStore.todos.length" density="comfortable" type="info" variant="tonal" class="mt-6 rounded-lg"
        :icon="false">
        <div class="d-flex align-center" :style="{ textAlign: isRtl ? 'right' : 'left' }">
          <v-icon :class="isRtl ? 'ms-2' : 'me-2'">mdi-list-status</v-icon>
          {{ t('alert.empty_list') }}
        </div>
      </v-alert>

      <v-alert v-else-if="!filteredTodos.length" density="comfortable" type="warning" variant="tonal"
        class="mt-6 rounded-lg" :icon="false">
        <div class="d-flex align-center" :style="{ textAlign: isRtl ? 'right' : 'left' }">
          <v-icon :class="isRtl ? 'ms-2' : 'me-2'">mdi-filter-off</v-icon>
          {{ t('alert.no_tasks_match_filter') }}
        </div>
      </v-alert>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h5 font-weight-bold d-flex align-center"
          :style="{ textAlign: isRtl ? 'right' : 'left' }">
          <v-icon color="amber" :class="isRtl ? 'ms-2' : 'me-2'">mdi-pencil-box-multiple-outline</v-icon>
          {{ t('dialog.edit_task_title') }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-if="editingTodo" v-model="editingTodo.text" :label="t('todo.task_title_label')"
            variant="solo-filled" hide-details autofocus rounded="lg" @keyup.enter="saveEdit" class="mt-4"
            :class="{ 'rtl-input': isRtl }" data-testid="edit-todo-input" />
          <v-checkbox v-if="editingTodo" v-model="editingTodo.isDone" :label="t('todo.mark_as_completed')"
            color="success" hide-details class="mt-4" />
        </v-card-text>
        <v-card-actions class="pt-0" :class="isRtl ? 'flex-row-reverse' : ''">
          <v-spacer v-if="!isRtl" />
          <v-btn variant="text" @click="cancelEdit">{{ t('button.cancel') }}</v-btn>
          <v-btn color="success" variant="flat" @click="saveEdit" :disabled="!editingTodo?.text.trim()"
            data-testid="save-edit-btn">
            <v-icon :class="isRtl ? 'ms-1' : 'me-1'">mdi-check</v-icon>
            {{ t('button.save_changes') }}
          </v-btn>
          <v-spacer v-if="isRtl" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Single Confirmation -->
    <v-dialog v-model="deleteSingleDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center" :style="{ textAlign: isRtl ? 'right' : 'left' }">
          <v-icon color="warning" :class="isRtl ? 'ms-2' : 'me-2'">mdi-alert-circle-outline</v-icon>
          {{ t('dialog.confirm_deletion_title') }}
        </v-card-title>
        <v-card-text :style="{ textAlign: isRtl ? 'right' : 'left' }">
          {{ t('dialog.delete_single_prompt') }}
          <div v-if="todoToDelete !== null" class="mt-2 font-weight-medium text-error">
            "{{todoStore.todos.find(t => t.id === todoToDelete)?.text}}"
          </div>
        </v-card-text>
        <v-card-actions :class="isRtl ? 'flex-row-reverse' : ''">
          <v-spacer v-if="!isRtl" />
          <v-btn variant="text" @click="deleteSingleDialog = false">{{ t('button.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveSingle">{{ t('button.delete') }}</v-btn>
          <v-spacer v-if="isRtl" />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete All Confirmation -->
    <v-dialog v-model="deleteAllDialog" max-width="400">
      <v-card rounded="lg" class="pa-2">
        <v-card-title class="text-h6 d-flex align-center" :style="{ textAlign: isRtl ? 'right' : 'left' }">
          <v-icon color="error" :class="isRtl ? 'ms-2' : 'me-2'">mdi-delete-sweep-outline</v-icon>
          {{ t('dialog.confirm_delete_all_title') }}
        </v-card-title>
        <v-card-text :style="{ textAlign: isRtl ? 'right' : 'left' }">
          {{ t('dialog.delete_all_prompt_1') }} {{ t('dialog.delete_all_prompt_2') }}
          <div class="mt-2 font-weight-medium text-error">
            {{ t('dialog.total_tasks_to_delete') }} {{ todoStore.totalTodos }}
          </div>
        </v-card-text>
        <v-card-actions :class="isRtl ? 'flex-row-reverse' : ''">
          <v-spacer v-if="!isRtl" />
          <v-btn variant="text" @click="deleteAllDialog = false">{{ t('button.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" @click="executeRemoveAll">{{ t('button.delete_all') }}</v-btn>
          <v-spacer v-if="isRtl" />
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

/* RTL input field adjustments */
.rtl-input :deep(input),
.rtl-input :deep(.v-field__input),
.rtl-input :deep(.v-select__selection) {
  direction: rtl;
  text-align: right;
}

.rtl-input :deep(.v-label) {
  right: 16px !important;
  left: auto !important;
  transform-origin: top right !important;
}

.rtl-input :deep(.v-label--active) {
  transform: translateY(-16px) scale(0.75);
}

.rtl-input :deep(.v-field__prepend-inner) {
  margin-right: 0 !important;
  margin-left: 8px !important;
}
</style>