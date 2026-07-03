<script>
import { InterviewService } from '../../postulante/services/interview.service.js'

export default {
  name: 'Entrevistas',
  data() {
    return {
      entrevistas: [],
      isLoading: true,
      editandoId: null,
      editFecha: '',
      editHora: '',
      editDuracion: 30,
      editNotas: '',
      editError: '',
      guardandoEdicion: false
    };
  },
  computed: {
    entrevistasOrdenadas() {
      return [...this.entrevistas].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    }
  },
  methods: {
    async cargarEntrevistas() {
      this.isLoading = true;
      try {
        this.entrevistas = await InterviewService.obtenerMisEntrevistas();
      } catch (error) {
        console.error('Error al cargar entrevistas:', error);
        alert('No se pudieron cargar las entrevistas.');
      } finally {
        this.isLoading = false;
      }
    },
    etiquetaFecha(fechaIso) {
      const fecha = new Date(fechaIso);
      const hoy = new Date();
      const manana = new Date();
      manana.setDate(hoy.getDate() + 1);

      const esMismoDia = (a, b) =>
          a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

      if (esMismoDia(fecha, hoy)) return 'Hoy';
      if (esMismoDia(fecha, manana)) return 'Mañana';
      return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    },
    formatearHora(fechaIso) {
      return new Date(fechaIso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    },
    async cambiarEstado(entrevista, nuevoEstado) {
      try {
        await InterviewService.actualizarEstadoEntrevista(entrevista.interview_id, nuevoEstado);
        entrevista.status = nuevoEstado;
      } catch (error) {
        alert('No se pudo actualizar la entrevista.');
        console.error(error);
      }
    },

    // ── Edición ──
    abrirEdicion(entrevista) {
      this.editandoId = entrevista.interview_id;
      const fecha = new Date(entrevista.scheduled_at);
      this.editFecha = fecha.toISOString().split('T')[0] === 'Invalid' ? '' : this.aFechaInput(fecha);
      this.editHora = this.aHoraInput(fecha);
      this.editDuracion = entrevista.duration_minutes;
      this.editNotas = entrevista.notes || '';
      this.editError = '';
    },
    aFechaInput(fecha) {
      const pad = n => String(n).padStart(2, '0');
      return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
    },
    aHoraInput(fecha) {
      const pad = n => String(n).padStart(2, '0');
      return `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
    },
    cancelarEdicion() {
      this.editandoId = null;
      this.editError = '';
    },
    async guardarEdicion(entrevista) {
      this.editError = '';
      if (!this.editFecha || !this.editHora) {
        this.editError = 'Selecciona fecha y hora.';
        return;
      }

      this.guardandoEdicion = true;
      try {
        const resultado = await InterviewService.reprogramarEntrevista(entrevista.interview_id, {
          scheduled_at: `${this.editFecha}T${this.editHora}:00`,
          duration_minutes: Number(this.editDuracion) || 30,
          notes: this.editNotas.trim() || null
        });
        entrevista.scheduled_at = resultado.scheduled_at;
        entrevista.duration_minutes = resultado.duration_minutes;
        entrevista.notes = resultado.notes;
        this.editandoId = null;
      } catch (error) {
        this.editError = error.response?.data?.error || 'No se pudo guardar el cambio.';
      } finally {
        this.guardandoEdicion = false;
      }
    }
  },
  mounted() {
    this.cargarEntrevistas();
  }
}
</script>

<template>
  <div class="jobsy-wrap">
    <div class="jobsy-header">
      <div class="jobsy-header__left">
        <div class="jobsy-icon-box">
          <svg class="jobsy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h2 class="jobsy-title">Entrevistas</h2>
          <p class="jobsy-subtitle">Agenda de entrevistas con tus candidatos.</p>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="jobsy-loading">
      <p class="jobsy-loading__title">Cargando entrevistas...</p>
    </div>

    <div v-else-if="!entrevistasOrdenadas.length" class="jobsy-loading">
      <p class="jobsy-loading__title">Aún no tienes entrevistas agendadas.</p>
      <p class="jobsy-loading__sub">Agenda una desde el perfil de un candidato aceptado.</p>
    </div>

    <div v-else class="entrevistas-lista">
      <div v-for="e in entrevistasOrdenadas" :key="e.interview_id" class="entrevista-card" :class="'entrevista-card--' + e.status">
        <div class="entrevista-fecha">
          <span class="entrevista-fecha__dia">{{ etiquetaFecha(e.scheduled_at) }}</span>
          <span class="entrevista-fecha__hora">{{ formatearHora(e.scheduled_at) }}</span>
        </div>
        <div class="entrevista-info">
          <p class="entrevista-nombre">{{ e.candidate_name }}</p>
          <p class="entrevista-oferta">{{ e.job_title }} · {{ e.duration_minutes }} min</p>
          <p v-if="e.notes" class="entrevista-notas">📝 {{ e.notes }}</p>
        </div>
        <div class="entrevista-estado">
          <span class="entrevista-badge" :class="'entrevista-badge--' + e.status">
              {{ e.status === 'scheduled' ? 'Programada' : e.status === 'completed' ? 'Completada' : 'Cancelada' }}
          </span>
          <div v-if="e.status === 'scheduled'" class="entrevista-acciones">
            <button class="entrevista-btn entrevista-btn--editar" @click="abrirEdicion(e)">✏️ Editar</button>
            <button class="entrevista-btn entrevista-btn--ok" @click="cambiarEstado(e, 'completed')">✓ Completar</button>
            <button class="entrevista-btn entrevista-btn--cancel" @click="cambiarEstado(e, 'cancelled')">✗ Cancelar</button>
          </div>
        </div>

        <div v-if="editandoId === e.interview_id" class="entrevista-edit">
          <div class="agendar-fila">
            <input type="date" v-model="editFecha" class="campo-input" />
            <input type="time" v-model="editHora" class="campo-input" />
            <input type="number" v-model="editDuracion" min="15" step="15" class="campo-input" style="max-width: 90px;" />
          </div>
          <textarea v-model="editNotas" class="campo-textarea" rows="2" placeholder="Notas..."></textarea>
          <p v-if="editError" class="agendar-error">{{ editError }}</p>
          <div class="agendar-fila">
            <button class="entrevista-btn entrevista-btn--ok" :disabled="guardandoEdicion" @click="guardarEdicion(e)">
              {{ guardandoEdicion ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button class="entrevista-btn" @click="cancelarEdicion">Cancelar</button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.jobsy-wrap { font-family: 'DM Sans', sans-serif; max-width: 1280px; margin: 0 auto; width: 100%; padding-bottom: 5rem; }

.jobsy-header { display: flex; align-items: flex-end; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(10,61,43,0.08); }
.jobsy-header__left { display: flex; align-items: center; gap: 1.25rem; }
.jobsy-icon-box {
  width: 56px; height: 56px; background: #ecfdf5; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 1px rgba(16,185,129,0.18); flex-shrink: 0;
}
.jobsy-icon { width: 26px; height: 26px; color: #10b981; }
.jobsy-title { font-family: 'Sora', sans-serif; font-size: clamp(2rem, 4vw, 2.75rem); font-weight: 800; color: #111827; letter-spacing: -0.03em; margin: 0 0 0.25rem; }
.jobsy-subtitle { font-size: 1rem; color: #6b7280; margin: 0; }

.jobsy-loading { text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 24px; box-shadow: 0 4px 24px rgba(10,61,43,0.07); border: 1px solid rgba(10,61,43,0.06); }
.jobsy-loading__title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.1rem; color: #111827; margin: 0 0 0.35rem; }
.jobsy-loading__sub { font-size: 0.9rem; color: #6b7280; margin: 0; }

.entrevistas-lista { display: flex; flex-direction: column; gap: 1rem; }

.entrevista-card { display: flex; align-items: center; gap: 1.5rem; background: #fff; border: 1px solid rgba(10,61,43,0.08); border-radius: 18px; padding: 1.1rem 1.4rem; box-shadow: 0 2px 12px rgba(10,61,43,0.05); }
.entrevista-card--cancelled { opacity: 0.55; }

.entrevista-fecha { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ecfdf5; border-radius: 14px; padding: 0.6rem 1rem; min-width: 84px; }
.entrevista-fecha__dia { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.85rem; color: #065f46; }
.entrevista-fecha__hora { font-size: 0.8rem; color: #059669; }

.entrevista-info { flex: 1; min-width: 0; }
.entrevista-nombre { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; color: #111827; margin: 0 0 0.15rem; }
.entrevista-oferta { font-size: 0.85rem; color: #6b7280; margin: 0; }
.entrevista-notas { font-size: 0.8rem; color: #9ca3af; margin: 0.25rem 0 0; }

.entrevista-estado { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
.entrevista-badge { font-family: 'Sora', sans-serif; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em; }
.entrevista-badge--scheduled { background: #dbeafe; color: #1e40af; }
.entrevista-badge--completed { background: #d1fae5; color: #065f46; }
.entrevista-badge--cancelled { background: #fee2e2; color: #991b1b; }

.entrevista-acciones { display: flex; gap: 0.4rem; }
.entrevista-btn { font-family: 'Sora', sans-serif; font-size: 0.75rem; font-weight: 700; border-radius: 8px; padding: 0.3rem 0.6rem; border: none; cursor: pointer; transition: opacity 0.15s; }
.entrevista-btn--ok { background: #d1fae5; color: #065f46; }
.entrevista-btn--cancel { background: #fee2e2; color: #991b1b; }
.entrevista-btn:hover { opacity: 0.8; }


.entrevista-btn--editar { background: #e0e7ff; color: #3730a3; }
.entrevista-edit {
  margin-top: 0.75rem;
  padding: 0.9rem;
  background: #f9fafb;
  border: 1.5px dashed #d1d5db;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.agendar-fila { display: flex; gap: 0.5rem; }
.campo-input {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 8px 10px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; flex: 1;
}
.campo-textarea {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 8px 10px; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; resize: vertical;
}
.agendar-error { color: #dc2626; font-size: 0.8rem; margin: 0; }
</style>