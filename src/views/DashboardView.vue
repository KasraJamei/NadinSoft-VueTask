<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'; // watch added here
import { useTodoStore } from '@/stores/todos';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const todoStore = useTodoStore();
const settingsStore = useSettingsStore();
const { t } = useI18n();

const pendingTasksCount = computed(() => todoStore.todos.filter(t => !t.isDone).length);
const userName = computed(() => settingsStore.userName);

// Reading the current theme to apply dual-theme colors conditionally
const currentTheme = computed(() => settingsStore.currentTheme);

// --- Time and Greeting Logic ---
const currentTime = ref(new Date());
let timer: number | undefined;

const formattedTime = computed(() => {
    // Displaying time in 24-hour format (HH:MM), seconds removed
    return currentTime.value.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
});

const greeting = computed(() => {
    const hour = currentTime.value.getHours();

    if (hour >= 5 && hour < 12) {
        return 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
        return 'Good Afternoon';
    } else {
        return 'Good Evening';
    }
});
// -------------------------------------

// --- NEW: Typewriter Effect Logic ---
const typedGreeting = ref('');
const greetingText = computed(() => `${greeting.value}, ${userName.value}`); // Final text to type

let typingTimeout: number | undefined;
const isTypingComplete = ref(false);

const startTyping = (textToType: string) => {
    // Clear previous timeouts and reset state
    if (typingTimeout !== undefined) {
        clearTimeout(typingTimeout);
    }
    typedGreeting.value = '';
    isTypingComplete.value = false;
    let charIndex = 0;

    const typeChar = () => {
        if (charIndex < textToType.length) {
            typedGreeting.value += textToType.charAt(charIndex);
            charIndex++;
            // Typing speed: 50ms per character
            typingTimeout = window.setTimeout(typeChar, 50);
        } else {
            isTypingComplete.value = true;
        }
    };

    // Start the typing process
    typeChar();
};

onMounted(() => {
    // Start clock timer
    timer = window.setInterval(() => {
        currentTime.value = new Date();
    }, 1000);

    // Start typing the initial greeting
    startTyping(greetingText.value);
});

// Watch for changes in the final greeting text (e.g., username change or time passing midnight)
watch(greetingText, (newText) => {
    startTyping(newText);
});

onUnmounted(() => {
    if (timer !== undefined) {
        clearInterval(timer);
    }
    // Clear typing timeout when leaving the view
    if (typingTimeout !== undefined) {
        clearTimeout(typingTimeout);
    }
});
</script>

<template>
    <v-container class="text-center">

        <v-row class="mt-4 justify-center">

            <v-col cols="12" sm="6" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast"
                    :color="currentTheme === 'light' ? 'light-blue-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">
                        <v-icon left :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'"
                            class="mr-2">mdi-format-list-checks</v-icon>
                        {{ t('Remaining Tasks') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-blue-lighten-3' : 'primary--text'">{{
                                pendingTasksCount }}</p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'blue-lighten-3' : 'primary'" variant="tonal"
                            :to="{ name: 'todos' }" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('View Tasks') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast"
                    :color="currentTheme === 'light' ? 'orange-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">
                        <v-icon left :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'"
                            class="mr-2">mdi-weather-sunny-alert</v-icon>
                        {{ t('Weather Status') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-orange-lighten-3' : 'orange-darken-2'">25°C</p>
                        <p class="subtitle-2 text-medium-emphasis">آفتابی</p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'orange-lighten-3' : 'orange-darken-2'"
                            variant="tonal" :to="{ name: 'weather' }" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('Weather Details') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="3">
                <v-card elevation="8" class="pa-4 rounded-xl hover-scale transition-fast"
                    :color="currentTheme === 'light' ? 'green-lighten-5' : 'surface'">
                    <v-card-title class="headline text-h6 font-weight-bold justify-center"
                        :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">
                        <v-icon left :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'"
                            class="mr-2">mdi-cog</v-icon>
                        {{ t('Settings') }}
                    </v-card-title>
                    <v-card-text class="pt-2">
                        <p class="text-h4 font-weight-black"
                            :class="currentTheme === 'dark' ? 'text-green-lighten-3' : 'green-darken-2'">{{
                                settingsStore.currentLocale.toUpperCase()
                            }}</p>
                        <p class="subtitle-2 text-medium-emphasis">{{ settingsStore.currentTheme }} Theme</p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn text :color="currentTheme === 'dark' ? 'green-lighten-3' : 'green-darken-2'"
                            variant="tonal" :to="{ name: 'profile' }" rounded="lg" size="small">
                            <v-icon start>mdi-arrow-right-circle</v-icon>
                            {{ t('Go to Profile') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

        </v-row>

        <div class="mb-8 mt-12">

            <p class="text-h5 text-md-h4 font-weight-black text-medium-emphasis mb-4">
                {{ formattedTime }}
            </p>

            <p class="text-h3 text-md-h2 font-weight-medium primary--text">
                {{ typedGreeting }}
                <span v-if="!isTypingComplete" class="typing-cursor">|</span>
            </p>
        </div>

    </v-container>
</template>

<style scoped>
/* Styles retained for Hover/Scale effect */
.hover-scale {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-scale:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.20) !important;
}

.typing-cursor {
    display: inline-block;
    animation: blink 0.7s infinite;
    opacity: 1;
    font-weight: 300;
    margin-left: 2px;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}
</style>