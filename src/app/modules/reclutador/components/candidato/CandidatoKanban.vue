<script>
export default {
  name: 'CandidatoKanban',
  props: {
    candidatos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dragId: null,
      columnaHover: null
    };
  },
  computed: {
    pendientes() {
      return this.candidatos.filter(c => c.backendStatus === 'pending');
    },
    aceptados() {
      return this.candidatos.filter(c => c.backendStatus === 'accepted');
    },
    descartados() {
      return this.candidatos.filter(c => c.backendStatus === 'rejected');
    }
  },
  methods: {
    onDragStart(candidato) {
      this.dragId = candidato.id;
    },
    onDragEnter(columna) {
      this.columnaHover = columna;
    },
    onDragLeave(columna) {
      if (this.columnaHover === columna) this.columnaHover = null;
    },
    onDrop(nuevoEstado) {
      this.columnaHover = null;
      if (!this.dragId) return;
      this.$emit('mover', { id: this.dragId, nuevoEstado });
      this.dragId = null;
    }
  }
};
</script>

<template>
  <div class="kanban-board">

    <!-- Columna: Pendiente -->
    <div
        class="kanban-columna"
        :class="{ 'kanban-columna--hover': columnaHover === 'pending' }"
        @dragover.prevent
        @dragenter.prevent="onDragEnter('pending')"
        @dragleave="onDragLeave('pending')"
        @drop="onDrop('pending')"
    >
      <div class="kanban-columna__header kanban-columna__header--amarillo">
        <span>⏳ Pendiente</span>
        <span class="kanban-columna__contador">{{ pendientes.length }}</span>
      </div>
      <div class="kanban-columna__body">
        <div
            v-for="candidato in pendientes"
            :key="candidato.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart(candidato)"
            @click="$emit('verMas', candidato)"
        >
          <p class="kanban-card__nombre">{{ candidato.name }}</p>
          <p class="kanban-card__oferta">{{ candidato.publicationTitle }}</p>
        </div>
        <p v-if="!pendientes.length" class="kanban-columna__vacio">Sin candidatos</p>
      </div>
    </div>

    <!-- Columna: Aceptado -->
    <div
        class="kanban-columna"
        :class="{ 'kanban-columna--hover': columnaHover === 'accepted' }"
        @dragover.prevent
        @dragenter.prevent="onDragEnter('accepted')"
        @dragleave="onDragLeave('accepted')"
        @drop="onDrop('accepted')"
    >
      <div class="kanban-columna__header kanban-columna__header--verde">
        <span>✓ Aceptado</span>
        <span class="kanban-columna__contador">{{ aceptados.length }}</span>
      </div>
      <div class="kanban-columna__body">
        <div
            v-for="candidato in aceptados"
            :key="candidato.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart(candidato)"
            @click="$emit('verMas', candidato)"
        >
          <p class="kanban-card__nombre">{{ candidato.name }}</p>
          <p class="kanban-card__oferta">{{ candidato.publicationTitle }}</p>
        </div>
        <p v-if="!aceptados.length" class="kanban-columna__vacio">Sin candidatos</p>
      </div>
    </div>

    <!-- Columna: Descartado -->
    <div
        class="kanban-columna"
        :class="{ 'kanban-columna--hover': columnaHover === 'rejected' }"
        @dragover.prevent
        @dragenter.prevent="onDragEnter('rejected')"
        @dragleave="onDragLeave('rejected')"
        @drop="onDrop('rejected')"
    >
      <div class="kanban-columna__header kanban-columna__header--rojo">
        <span>✗ Descartado</span>
        <span class="kanban-columna__contador">{{ descartados.length }}</span>
      </div>
      <div class="kanban-columna__body">
        <div
            v-for="candidato in descartados"
            :key="candidato.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart(candidato)"
            @click="$emit('verMas', candidato)"
        >
          <p class="kanban-card__nombre">{{ candidato.name }}</p>
          <p class="kanban-card__oferta">{{ candidato.publicationTitle }}</p>
        </div>
        <p v-if="!descartados.length" class="kanban-columna__vacio">Sin candidatos</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  font-family: 'DM Sans', sans-serif;
  width: 100%;
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

.kanban-columna {
  background: #f9fafb;
  border: 1.5px dashed #e5e7eb;
  border-radius: 20px;
  padding: 1rem;
  min-height: 320px;
  transition: background 0.15s, border-color 0.15s;
}

.kanban-columna--hover {
  background: #ecfdf5;
  border-color: #10b981;
}

.kanban-columna__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  margin-bottom: 0.9rem;
}

.kanban-columna__header--amarillo { background: #fef9c3; color: #92700c; }
.kanban-columna__header--verde    { background: #d1fae5; color: #065f46; }
.kanban-columna__header--rojo     { background: #fee2e2; color: #991b1b; }

.kanban-columna__contador {
  background: rgba(255,255,255,0.6);
  border-radius: 999px;
  padding: 0.1rem 0.55rem;
  font-size: 0.75rem;
}

.kanban-columna__body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.kanban-columna__vacio {
  text-align: center;
  color: #9ca3af;
  font-size: 0.8rem;
  padding: 1.5rem 0;
}

.kanban-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.12s, box-shadow 0.12s;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card__nombre {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #111827;
  margin: 0 0 0.2rem;
}

.kanban-card__oferta {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
}
</style>