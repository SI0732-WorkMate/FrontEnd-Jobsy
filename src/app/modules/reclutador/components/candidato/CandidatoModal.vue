<script>
import { InterviewService } from '../../../postulante/services/interview.service.js'
import { CandidatoService } from '../../../postulante/services/candidato.service.js'

export default {
  name: 'CandidatoModal',
  props: {
    candidato: Object
  },
  data() {
    return {
      estadoLocal: this.candidato?.backendStatus || 'pending',
      mostrarConfirmacionDescarte: false,
      motivoDescarte: '',

      // US020 - Agendar entrevista
      mostrarAgendarEntrevista: false,
      fechaEntrevista: '',
      horaEntrevista: '',
      duracionEntrevista: 30,
      notasEntrevista: '',
      agendandoEntrevista: false,
      errorEntrevista: '',
      entrevistaAgendadaOk: false,

      // ==========================================
      // ADICIONADO: US016 - Match Score
      // ==========================================
      mostrarCalcularMatch: false,
      matchPdfFile: null,
      matchPdfError: '',
      calculandoMatch: false,
      errorMatch: '',
      matchScoreLocal: this.candidato?.matchScore ?? null,
      mostrarDetalleMatch: false,
      detalleMatch: null,
      cargandoDetalleMatch: false,
      // ==========================================
    };
  },
  computed: {
    labelEstado() {
      switch (this.estadoLocal) {
        case 'accepted': return 'Aceptado';
        case 'rejected': return 'Rechazado';
        default:         return 'Pendiente';
      }
    },
    textoBotonPrimario() {
      return this.mostrarConfirmacionDescarte ? 'Confirmar descarte' : this.$t("actualizar_estado");
    }
  },
  methods: {
    setEstado(nuevoBackendStatus) {
      this.estadoLocal = nuevoBackendStatus;
      this.mostrarConfirmacionDescarte = false;
    },
    cancelarDescarte() {
      this.mostrarConfirmacionDescarte = false;
      this.motivoDescarte = '';
    },
    confirmar() {
      if (this.estadoLocal === 'rejected' && !this.mostrarConfirmacionDescarte) {
        this.mostrarConfirmacionDescarte = true;
        return;
      }

      const updated = {
        ...this.candidato,
        backendStatus: this.estadoLocal,
        status: this.labelEstado,
        motivo: this.estadoLocal === 'rejected' ? this.motivoDescarte.trim() : null,
      };
      this.$emit('actualizar', updated);
    },

    // ── US020 - Agendar entrevista ──
    toggleAgendarEntrevista() {
      this.mostrarAgendarEntrevista = !this.mostrarAgendarEntrevista;
      this.errorEntrevista = '';
      this.entrevistaAgendadaOk = false;
    },
    async agendarEntrevista() {
      this.errorEntrevista = '';

      if (!this.fechaEntrevista || !this.horaEntrevista) {
        this.errorEntrevista = 'Selecciona una fecha y hora.';
        return;
      }

      const scheduledAtTexto = `${this.fechaEntrevista}T${this.horaEntrevista}:00`;
      const scheduledAtValidacion = new Date(scheduledAtTexto);
      if (isNaN(scheduledAtValidacion.getTime()) || scheduledAtValidacion < new Date()) {
        this.errorEntrevista = 'La fecha y hora deben ser válidas y futuras.';
        return;
      }

      this.agendandoEntrevista = true;
      try {
        await InterviewService.scheduleInterview({
          application_id: this.candidato.id,
          scheduled_at: scheduledAtTexto, // sin conversión a UTC — se guarda tal cual
          duration_minutes: Number(this.duracionEntrevista) || 30,
          notes: this.notasEntrevista.trim() || null
        });
        this.entrevistaAgendadaOk = true;
        this.fechaEntrevista = '';
        this.horaEntrevista = '';
        this.notasEntrevista = '';
      } catch (error) {
        this.errorEntrevista = error.response?.data?.error || 'No se pudo agendar la entrevista. Intenta de nuevo.';
      } finally {
        this.agendandoEntrevista = false;
      }
    },

    // ==========================================
    // ADICIONADO: ── US016 - Match Score ──
    // ==========================================
    onMatchPdfChange(e) {
      const file = e.target.files[0];
      this.matchPdfError = '';
      this.matchPdfFile = null;
      if (!file) return;
      if (file.type !== 'application/pdf') {
        this.matchPdfError = 'Solo se aceptan archivos PDF.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.matchPdfError = `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 5 MB.`;
        return;
      }
      this.matchPdfFile = file;
    },
    toggleCalcularMatch() {
      this.mostrarCalcularMatch = !this.mostrarCalcularMatch;
      this.errorMatch = '';
    },
    async calcularMatch() {
      this.errorMatch = '';
      if (!this.candidato.hasCvPdf && !this.matchPdfFile) {
        this.errorMatch = 'Sube el PDF del CV de este candidato para calcular el Match Score.';
        return;
      }
      this.calculandoMatch = true;
      try {
        const resultado = await CandidatoService.calcularMatchScore(this.candidato.id, this.matchPdfFile);
        this.matchScoreLocal = resultado.match_score;
        this.mostrarCalcularMatch = false;
        this.matchPdfFile = null;
      } catch (error) {
        this.errorMatch = error.response?.data?.error || 'No se pudo calcular el Match Score. Intenta de nuevo.';
      } finally {
        this.calculandoMatch = false;
      }
    },
    async verDetalleMatch() {
      this.mostrarDetalleMatch = !this.mostrarDetalleMatch;
      if (!this.mostrarDetalleMatch || this.detalleMatch) return;
      this.cargandoDetalleMatch = true;
      try {
        this.detalleMatch = await CandidatoService.obtenerDetalleMatch(this.candidato.id);
      } catch (error) {
        this.detalleMatch = { summary: 'No se pudo cargar el detalle del match.', matched_skills: [], missing_skills: [] };
      } finally {
        this.cargandoDetalleMatch = false;
      }
    }
    // ==========================================
  }
};
</script>

<template>
  <div class="modal-overlay">

    <div class="modal-card">

      <button class="btn-cerrar" @click="$emit('cerrar')" aria-label="Cerrar">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="modal-icon">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>

      <h3 class="modal-titulo">{{ $t("titulo_candidatos") }}</h3>

      <div class="campos">

        <div class="campo">
          <label class="campo-label">{{ $t("nombre_candidato") }}</label>
          <div class="campo-valor">{{ candidato.name }}</div>
        </div>

        <div class="campo">
          <label class="campo-label">{{ $t("puesto_postula") }}</label>
          <div class="campo-valor">{{ candidato.publicationNumber }}</div>
        </div>

        <div class="campo">
          <label class="campo-label">{{ $t("curriculum_vitae") }}</label>
          <div class="campo-cv-row">
            <div class="campo-cv-text">{{ candidato.cv }}</div>
            <a :href="candidato.cv" target="_blank" class="btn-descargar">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ $t("descargar") }}
            </a>
          </div>
        </div>

        <div class="campo">
          <label class="campo-label">{{ $t("estado_postulante") }}</label>
          <div class="estado-btns">
            <button
                @click="setEstado('accepted')"
                class="btn-estado"
                :class="estadoLocal === 'accepted' ? 'btn-estado--activo-verde' : 'btn-estado--inactivo'"
            >
              ✓ Aceptado
            </button>
            <button
                @click="setEstado('pending')"
                class="btn-estado"
                :class="estadoLocal === 'pending' ? 'btn-estado--activo-amarillo' : 'btn-estado--inactivo'"
            >
              ⏳ Pendiente
            </button>
            <button
                @click="setEstado('rejected')"
                class="btn-estado"
                :class="estadoLocal === 'rejected' ? 'btn-estado--activo-rojo' : 'btn-estado--inactivo'"
            >
              ✗ Rechazado
            </button>
          </div>

          <div v-if="mostrarConfirmacionDescarte" class="campo campo-descarte">
            <label class="campo-label">Motivo del descarte (opcional)</label>
            <textarea
                v-model="motivoDescarte"
                class="campo-textarea"
                rows="3"
                placeholder="Ej: El perfil no cumple con los años de experiencia requeridos..."
                maxlength="300"
            ></textarea>
            <button class="btn-secondary" @click="cancelarDescarte" style="align-self: flex-start;">
              Cancelar descarte
            </button>
          </div>
        </div>
      </div>

      <div v-if="estadoLocal === 'accepted'" class="campo">
        <button class="btn-secondary btn-agendar" @click="toggleAgendarEntrevista">
          📅 {{ mostrarAgendarEntrevista ? 'Ocultar agenda' : 'Agendar entrevista' }}
        </button>

        <div v-if="mostrarAgendarEntrevista" class="campo-agendar">
          <div class="agendar-fila">
            <div class="agendar-campo">
              <label class="campo-label">Fecha</label>
              <input type="date" v-model="fechaEntrevista" class="campo-input" :min="new Date().toISOString().split('T')[0]" />
            </div>
            <div class="agendar-campo">
              <label class="campo-label">Hora</label>
              <input type="time" v-model="horaEntrevista" class="campo-input" />
            </div>
            <div class="agendar-campo agendar-campo--corto">
              <label class="campo-label">Duración (min)</label>
              <input type="number" v-model="duracionEntrevista" min="15" step="15" class="campo-input" />
            </div>
          </div>

          <label class="campo-label">Notas (opcional)</label>
          <textarea
              v-model="notesEntrevista"
              class="campo-textarea"
              rows="2"
              placeholder="Ej: Entrevista técnica vía Google Meet..."
              maxlength="500"
          ></textarea>

          <p v-if="errorEntrevista" class="agendar-error">{{ errorEntrevista }}</p>
          <p v-if="entrevistaAgendadaOk" class="agendar-ok">✓ Entrevista agendada y notificada al candidato.</p>

          <button class="btn-primary" :disabled="agendandoEntrevista" @click="agendarEntrevista">
            {{ agendandoEntrevista ? 'Agendando...' : 'Confirmar entrevista' }}
          </button>
        </div>
      </div>

      <div class="campo">
        <label class="campo-label">🎯 Match Score</label>

        <div v-if="matchScoreLocal !== null" class="match-score-row">
          <span class="match-score-numero" :class="{
            'match-score-numero--alto': matchScoreLocal >= 70,
            'match-score-numero--medio': matchScoreLocal >= 40 && matchScoreLocal < 70,
            'match-score-numero--bajo': matchScoreLocal < 40
          }">{{ matchScoreLocal }}/100</span>
          <button class="btn-secondary" @click="verDetalleMatch">
            {{ mostrarDetalleMatch ? 'Ocultar detalle' : 'Ver detalle' }}
          </button>
        </div>
        <p v-else class="match-sin-calcular">Aún no se ha calculado el Match Score de este candidato.</p>

        <div v-if="mostrarDetalleMatch" class="match-detalle">
          <p v-if="cargandoDetalleMatch" class="match-cargando">Cargando detalle...</p>
          <template v-else-if="detalleMatch">
            <p class="match-summary">{{ detalleMatch.summary }}</p>
            <div class="match-skills-col">
              <p class="match-skills-titulo match-skills-titulo--ok">✅ Coincide con:</p>
              <ul class="match-skills-lista">
                <li v-for="(skill, i) in detalleMatch.matched_skills" :key="'m'+i">{{ skill }}</li>
              </ul>
            </div>
            <div class="match-skills-col">
              <p class="match-skills-titulo match-skills-titulo--falta">⚠️ Falta / no evidenciado:</p>
              <ul class="match-skills-lista">
                <li v-for="(skill, i) in detalleMatch.missing_skills" :key="'f'+i">{{ skill }}</li>
              </ul>
            </div>
          </template>
        </div>

        <button class="btn-secondary btn-agendar" @click="toggleCalcularMatch">
          {{ mostrarCalcularMatch ? 'Ocultar' : (matchScoreLocal !== null ? '🔄 Recalcular Match Score' : '📊 Calcular Match Score') }}
        </button>

        <div v-if="mostrarCalcularMatch" class="campo-agendar">
          <label class="campo-label">
            {{ candidato.hasCvPdf ? 'PDF ya guardado (opcional: sube otro para reemplazarlo)' : 'Sube el PDF del CV de este candidato' }}
          </label>
          <input type="file" accept="application/pdf" @change="onMatchPdfChange" class="campo-input" />
          <p v-if="matchPdfError" class="agendar-error">{{ matchPdfError }}</p>
          <p v-if="errorMatch" class="agendar-error">{{ errorMatch }}</p>
          <button class="btn-primary" :disabled="calculandoMatch" @click="calcularMatch">
            {{ calculandoMatch ? 'Calculando...' : 'Calcular' }}
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" @click="confirmar">
          {{ textoBotonPrimario }}
        </button>
        <button class="btn-secondary" @click="$emit('cerrar')">
          {{ $t("cerrar") }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --vp: #0a3d2b;
  --vm: #006c49;
  --va: #10b981;
  --fondo: #f5f4f0;
  --input-bg: #f9fafb;
  --card: #ffffff;
  --txt: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(10,61,43,0.3);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  font-family: 'Sora', sans-serif;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--card);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(10,61,43,0.18), 0 4px 16px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (min-width: 640px) { .modal-card { padding: 48px; } }

/* ——— Cerrar ——— */
.btn-cerrar {
  position: absolute;
  top: 18px; right: 18px;
  background: var(--fondo);
  border: 1.5px solid var(--border);
  border-radius: 50%;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.btn-cerrar:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; transform: scale(1.08); }
.btn-cerrar:focus { outline: none; }

/* ——— Ícono ——— */
.modal-icon {
  width: 50px; height: 50px;
  background: rgba(16,185,129,0.1);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: var(--va);
  margin-bottom: 18px;
}

.modal-titulo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--txt);
  margin: 0 0 24px 0;
  padding-right: 32px;
}

/* ——— Campos ——— */
.campos { display: flex; flex-direction: column; gap: 18px; }

.campo { display: flex; flex-direction: column; gap: 8px; }

.campo-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.campo-valor {
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--txt);
}

.campo-cv-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.campo-cv-text {
  flex: 1;
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-descargar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--txt);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.btn-descargar:hover { background: rgba(16,185,129,0.08); color: var(--vp); border-color: rgba(16,185,129,0.3); }

/* ——— Estado botones ——— */
.estado-btns { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-estado {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.2s;
}

.btn-estado--inactivo {
  background: var(--card);
  color: var(--muted);
  border-color: var(--border);
}
.btn-estado--inactivo:hover { background: var(--fondo); color: var(--txt); }

.btn-estado--activo-verde {
  background: var(--va);
  color: #fff;
  border-color: var(--va);
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

.btn-estado--activo-amarillo {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245,158,11,0.3);
}

.btn-estado--activo-rojo {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}

/* ——— Footer ——— */
.modal-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1.5px solid var(--border);
}

@media (min-width: 480px) { .modal-footer { flex-direction: row-reverse; } }

.btn-primary {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover { background: var(--va); transform: translateY(-1px); }
.btn-primary:focus { outline: none; }

.btn-secondary {
  flex: 1;
  background: var(--card);
  color: var(--txt);
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-secondary:hover { background: var(--fondo); border-color: #d1d5db; }
.btn-secondary:focus { outline: none; }

.campo-textarea {
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--txt);
  resize: vertical;
}
.campo-descarte { animation: fadeIn 0.2s ease; }

.btn-agendar { width: 100%; text-align: center; }
.campo-agendar {
  margin-top: 0.75rem;
  padding: 0.9rem;
  background: #f9fafb;
  border: 1.5px dashed #d1d5db;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: fadeIn 0.2s ease;
}
.agendar-fila { display: flex; gap: 0.6rem; }
.agendar-campo { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.agendar-campo--corto { flex: 0.7; }
.campo-input {
  background: #ffffff;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--txt);
}
.agendar-error { color: #dc2626; font-size: 0.8rem; margin: 0; }
.agendar-ok { color: #059669; font-size: 0.8rem; margin: 0; font-weight: 600; }

/* ========================================================== */
/* ADICIONADO: Estilos para la sección de Match Score        */
/* ========================================================== */
.match-score-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.match-score-numero {
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  padding: 6px 16px;
  border-radius: 12px;
}
.match-score-numero--alto  { background: #dcfce7; color: #15803d; }
.match-score-numero--medio { background: #fefce8; color: #92400e; }
.match-score-numero--bajo  { background: #fef2f2; color: #dc2626; }
.match-sin-calcular {
  font-size: 0.85rem;
  color: var(--muted);
  font-style: italic;
  margin: 0;
}
.match-detalle {
  margin-top: 0.75rem;
  padding: 0.9rem;
  background: #f9fafb;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.match-cargando { font-size: 0.85rem; color: var(--muted); margin: 0; }
.match-summary { font-size: 0.85rem; color: var(--txt); margin: 0; font-style: italic; }
.match-skills-titulo { font-size: 0.75rem; font-weight: 700; margin: 0 0 4px; }
.match-skills-titulo--ok    { color: #15803d; }
.match-skills-titulo--falta { color: #b45309; }
.match-skills-lista { margin: 0; padding-left: 1.1rem; font-size: 0.82rem; color: var(--txt); }
.match-skills-lista li { margin-bottom: 2px; }
</style>