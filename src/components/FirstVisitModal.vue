<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const settingsStore = useSettingsStore();

const showModal = ref(false);
const userName = ref('');
const showWelcome = ref(false);
const welcomeKey = ref(0);

onMounted(() => {
    if (!settingsStore.userName || settingsStore.userName === 'User' || settingsStore.userName.trim() === '') {
        showModal.value = true;
    }
});

async function saveName() {
    if (userName.value.trim()) {
        settingsStore.updateName(userName.value.trim());
        showModal.value = false;
        await nextTick();

        // Force re-render
        welcomeKey.value++;
        showWelcome.value = true;

        // صبر کن تا DOM کامل رندر بشه
        await nextTick();

        // شروع انیمیشن با requestAnimationFrame
        requestAnimationFrame(() => {
            setTimeout(() => {
                showWelcome.value = false;
                window.dispatchEvent(new CustomEvent('welcome-animation-complete'));
            }, 3500);
        });
    }
}

function onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') saveName();
}
</script>

<template>
    <!-- 1. Name Input -->
    <teleport to="body">
        <div v-if="showModal" class="modal-backdrop">
            <v-card class="modal-card mx-auto pa-6 pa-md-8 rounded-xl" max-width="460" elevation="24">
                <div class="text-center mb-6">
                    <v-avatar size="72" color="primary" class="mb-4">
                        <v-icon size="40" color="white">mdi-account-circle</v-icon>
                    </v-avatar>
                    <h1 class="text-h4 font-weight-bold primary--text">{{ t('Welcome!') }}</h1>
                    <p class="text-body-1 text-medium-emphasis mt-3">
                        {{ t('Please enter your name to personalize your experience.') }}
                    </p>
                </div>

                <v-text-field v-model="userName" :label="t('Your Name')" variant="solo" hide-details rounded
                    prepend-inner-icon="mdi-account" autofocus class="mb-5 elegant-input" density="comfortable"
                    @keyup="onEnter"></v-text-field>

                <v-btn color="primary" size="x-large" block rounded :disabled="!userName.trim()" @click="saveName"
                    class="text-uppercase font-weight-bold" elevation="6">
                    {{ t('Continue') }}
                    <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
            </v-card>
        </div>
    </teleport>

    <!-- 2. Welcome Animation -->
    <teleport to="body">
        <div v-if="showWelcome" :key="welcomeKey" class="welcome-backdrop">
            <div class="welcome-content">
                <h1 class="welcome-title">
                    <span class="wave" v-for="(l, i) in 'Welcome,'.split('')" :key="'w' + i" :style="{ '--i': i }">{{ l
                        }}</span>
                    &nbsp;
                    <span class="name-pop">{{ userName }}!</span>
                </h1>

                <div class="fireworks">
                    <div class="firework" v-for="n in 8" :key="n" :style="{ '--n': n }"></div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    z-index: 3000;
}

.modal-card {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px);
    max-width: 460px;
    width: 90%;
}

.elegant-input :deep(.v-field--focused) {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

.welcome-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 3001;
}

.welcome-content {
    text-align: center;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.welcome-title {
    font-size: 3.8rem;
    font-weight: 900;
    letter-spacing: 2px;
}

@media (max-width: 600px) {
    .welcome-title {
        font-size: 2.6rem;
    }

    .modal-card {
        margin: 16px;
        max-width: none !important;
        width: calc(100% - 32px);
    }
}

.wave {
    display: inline-block;
    animation: wave 0.7s ease-in-out;
    animation-delay: calc(0.08s * var(--i));
}

@keyframes wave {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-25px);
    }
}

.name-pop {
    display: inline-block;
    color: #ffd700;
    font-size: 1.3em;
    animation: pop 0.8s ease-out 1.2s both;
}

@keyframes pop {
    0% {
        transform: scale(0) rotate(-10deg);
        opacity: 0;
    }

    70% {
        transform: scale(1.3) rotate(5deg);
    }

    100% {
        transform: scale(1) rotate(0);
        opacity: 1;
    }
}

.fireworks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.firework {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    animation: firework 2.8s ease-out forwards;
    animation-delay: calc(0.2s * var(--n));
    --color: #ff6b6b;
}

.firework:nth-child(1) {
    top: 25%;
    left: 15%;
    --color: #ff6b6b;
}

.firework:nth-child(2) {
    top: 35%;
    left: 75%;
    --color: #4ecdc4;
}

.firework:nth-child(3) {
    top: 55%;
    left: 25%;
    --color: #ffe66d;
}

.firework:nth-child(4) {
    top: 45%;
    left: 80%;
    --color: #a8e6cf;
}

.firework:nth-child(5) {
    top: 30%;
    left: 50%;
    --color: #95e1d3;
}

.firework:nth-child(6) {
    top: 65%;
    left: 70%;
    --color: #f38181;
}

.firework:nth-child(7) {
    top: 40%;
    left: 30%;
    --color: #fce38a;
}

.firework:nth-child(8) {
    top: 60%;
    left: 45%;
    --color: #eaffd0;
}

.firework::before,
.firework::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--color);
    border-radius: 50%;
    animation: explode 2.8s ease-out forwards;
    animation-delay: calc(0.2s * var(--n));
}

@keyframes firework {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(0);
        opacity: 0;
    }
}

@keyframes explode {
    0% {
        transform: scale(0);
        opacity: 1;
    }

    70% {
        transform: scale(10);
        opacity: 0.7;
    }

    100% {
        transform: scale(15);
        opacity: 0;
    }
}
</style>