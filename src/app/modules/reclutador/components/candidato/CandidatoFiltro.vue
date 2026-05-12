<script>
export default {
  name: 'CandidatoFiltro',
  props: {
    filtro: String
  }
};
</script>

<template>
  <div class="filtro-wrapper">
    <div class="input-wrapper">
      <div class="search-icon">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <input
          :value="filtro"
          @input="$emit('update:filtro', $event.target.value)"
          @keyup.enter="$emit('filtrar')"
          type="text"
          class="search-input"
          :placeholder="$t('buscar_por_nombre')"
      />
    </div>
    <button @click="$emit('filtrar')" class="btn-filtrar">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
      </svg>
      {{ $t('filtrar') }}
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.filtro-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  font-family: 'Sora', sans-serif;
  width: 100%;
}

@media (min-width: 640px) {
  .filtro-wrapper {
    flex-direction: row;
    align-items: center;
  }
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  inset-y: 0;
  left: 0;
  padding-left: 16px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #a7c4b5;
  transition: color 0.2s;
}

.input-wrapper:focus-within .search-icon {
  color: #10b981;
}

.search-input {
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 20px 14px 48px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #6b7280;
  font-weight: 300;
}

.search-input:hover {
  border-color: #d1d5db;
}

.search-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.btn-filtrar { display: none; }
.btn-filtrar-hidden {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0a3d2b;
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(10, 61, 43, 0.3);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.btn-filtrar:hover {
  background: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.btn-filtrar:active {
  transform: translateY(0);
}

.btn-filtrar:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}
</style>