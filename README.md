# 🚀 NADINSOFT-VUETASK | Advanced Vue 3 & TypeScript Application

> A robust Single Page Application (SPA) built with a modern Vue 3 ecosystem, focusing on superior **State Management**, full **TypeScript** safety, **responsive design**, and comprehensive **bilingual support**. This project demonstrates high-standard architecture for scalable frontend development.

## 🌟 Project Status & Technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.x-1867C0?style=for-the-badge&logo=vuetify)](https://vuetifyjs.com/)
[![Pinia](https://img.shields.io/badge/State_Management-Pinia-FFD300?style=for-the-badge&logo=pinia)](https://pinia.vuejs.org/)
[![i18n](https://img.shields.io/badge/i18n-Bilingual-E91E63?style=for-the-badge&logo=i18n)](https://vue-i18n.intlify.dev/)
[![Build Tool](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## 💎 Key Features & Implementation Highlights

| Feature Area | Description | Architectural Implementation |
| :--- | :--- | :--- |
| **Bilingual Support (i18n)** | Full support for **English (LTR)** and **Farsi (RTL)**, including dynamic switching of the document direction (`dir` attribute) based on the active locale. | `vue-i18n`, Vue Watchers, and `vuetify-i18n` integration. |
| **State Persistence** | All user settings (Name, Theme, Locale) are automatically stored in **Local Storage** upon change and retrieved upon page load. | Pinia Watchers in `settings.ts` manage persistence logic. |
| **Layout & Responsiveness** | Fully **Responsive** layout designed using Vuetify 3's grid system, ensuring a consistent experience across all device sizes. | Consolidated layout (`App Bar`, `Navigation Drawer`) within `App.vue`. |
| **Core Functionality** | Includes dedicated views for: **Dashboard** (personalized welcome), **Todos** (add/remove tasks), **Weather** (city search via Open-Meteo API), and **Profile** (settings management). | Pinia Stores (`todos.ts`, `settings.ts`) and Vue Router. |

---

## 🏗️ Technical Architecture

### 1. Vue & Language
* **Vue 3 Composition API:** Exclusive use of `<script setup>` for highly readable, performant, and easily testable components.
* **TypeScript:** Enforced **strict type checking** across the entire application, essential for Pinia stores, routing, and data structures.

### 2. State Management (Pinia)
* **Modular Stores:** Settings logic (`settings.ts`) and Todos logic (`todos.ts`) are completely separated.
* **Encapsulated Actions:** Actions like `toggleTheme` are defined within the store, ensuring that UI components only dispatch actions without containing business logic.

### 3. Styling & UI (Vuetify)
* **Vuetify 3:** Utilized for rapid development of a Material Design interface.
* **Theme Integration:** Vuetify's theme system is synchronized with the Pinia store for seamless global theme changes.

---


## ⚙️ Development Setup

### Prerequisites

* Node.js (LTS Version 18+)
* npm (or yarn/pnpm)

### 1. Installation

```sh
# Clone the repository
git clone https://github.com/KasraJamei/NadinSoft-VueTask.git
cd NadinSoft-VueTask

# Install dependencies
npm install

```

### 2. Available Scripts

```sh
npm run dev
Compiles and hot-reloads for development (Vite Dev Server).
npm run build
Compiles and minifies for production (Output in ./dist).
npm run preview
Serves the production build locally for verification.

```