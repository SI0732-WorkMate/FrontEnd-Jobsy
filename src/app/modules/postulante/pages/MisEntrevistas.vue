<script>
import { InterviewService } from '../services/interview.service.js'

export default {
  name: 'MisEntrevistas',
  data() {
    return {
      entrevistas: [],
      isLoading: true
    };
  },
  computed: {
    entrevistasOrdenadas() {
      return [...this.entrevistas].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    }
  },
  methods: {
    async cargarAgenda() {
      this.isLoading = true;
      try {
        this.entrevistas = await InterviewService.obtenerMiAgenda();
      } catch (error) {
        console.error('Error al cargar tu agenda:', error);
      } finally {
        this.isLoading = false;
      }
    },
    formatearFechaHora(fechaIso) {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  },
  mounted() {
    this.cargarAgenda();
  }
}
</script>

<template>
  <div class="jobsy-wrap">
    <div class="jobsy-header">
      <h2 class="jobsy-title">Mis Entrevistas</h2>
      <p class="jobsy-subtitle">Revisa tus entrevistas programadas.</p>
    </div>

    <div v-if="isLoading" class="jobsy-loading">Cargando...</div>

    <div v-else-if="!entrevistasOrdenadas.length" class="jobsy-loading">
      Aún no tienes entrevistas programadas.
    </div>

    <div v-else class="entrevistas-lista">
      <div v-for="e in entrevistasOrdenadas" :key="e.interview_id" class="entrevista-card" :class="'entrevista-card--' + e.status">
        <div class="entrevista-info">
          <p class="entrevista-oferta-titulo">{{ e.job_title }}</p>
          <p class="entrevista-fecha-texto">📅 {{ formatearFechaHora(e.scheduled_at) }} · {{ e.duration_minutes }} min</p>
          <p v-if="e.notes" class="entrevista-notas">📝 {{ e.notes }}</p>
        </div>
        <span class="entrevista-badge" :class="'entrevista-badge--' + e.status">
          {{ e.status === 'scheduled' ? 'Programada' : e.status === 'completed' ? 'Completada' : 'Cancelada' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.jobsy-wrap { font-family: 'DM Sans', sans-serif; max-width: 1000px; margin: 0 auto; width: 100%; padding-bottom: 5rem; }
.jobsy-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(10,61,43,0.08); }
.jobsy-title { font-family: 'Sora', sans-serif; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; color: #111827; margin: 0 0 0.25rem; }
.jobsy-subtitle { font-size: 1rem; color: #6b7280; margin: 0; }
.jobsy-loading { text-align: center; padding: 3rem; color: #6b7280; background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(10,61,43,0.07); }

.entrevistas-lista { display: flex; flex-direction: column; gap: 1rem; }
.entrevista-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: #fff; border: 1px solid rgba(10,61,43,0.08); border-radius: 18px; padding: 1.1rem 1.4rem; box-shadow: 0 2px 12px rgba(10,61,43,0.05); }
.entrevista-card--cancelled { opacity: 0.55; }
.entrevista-oferta-titulo { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #111827; margin: 0 0 0.2rem; }
.entrevista-fecha-texto { font-size: 0.85rem; color: #059669; margin: 0; font-weight: 600; }
.entrevista-notas { font-size: 0.8rem; color: #9ca3af; margin: 0.25rem 0 0; }
.entrevista-badge { font-family: 'Sora', sans-serif; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; text-transform: uppercase; flex-shrink: 0; }
.entrevista-badge--scheduled { background: #dbeafe; color: #1e40af; }
.entrevista-badge--completed { background: #d1fae5; color: #065f46; }
.entrevista-badge--cancelled { background: #fee2e2; color: #991b1b; }
</style>