<!-- src/components/language-switcher.vue -->
<script setup>
import { useI18n } from 'vue-i18n';
const { locale, availableLocales } = useI18n();
</script>

<template>
  <div class="lang-wrap">
    <!-- Ícono globo -->
    <svg class="lang-icon lang-icon--left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
    </svg>

    <select v-model="locale" class="lang-select">
      <option v-for="lang in availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>
    </select>

    <!-- Ícono flecha -->
    <svg class="lang-icon lang-icon--right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap');

.lang-wrap {
  position: relative;
  width: 100%;
  font-family: 'Sora', sans-serif;
}

.lang-select {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.5rem;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.3);
  background-color: #ecfdf5;
  color: #006c49;
  text-align: center;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.lang-select:hover,
.lang-select:focus {
  background-color: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

/* Íconos posicionados */
.lang-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  pointer-events: none;
  color: #006c49;
  transition: color 0.2s ease;
}

.lang-wrap:hover .lang-icon,
.lang-select:focus ~ .lang-icon {
  color: #ffffff;
}

.lang-icon--left  { left: 0.65rem; }
.lang-icon--right { right: 0.65rem; }
</style>