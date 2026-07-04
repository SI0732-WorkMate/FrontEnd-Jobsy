<script>
import { EvaluationService } from '../services/evaluation.service.js'

export default {
  name: 'EvaluacionGamificada',
  data() {
    return {
      applicationId: this.$route.params.applicationId,
      escenarios: [],
      indice: 0,
      respuestas: [],
      opcionSeleccionada: null,
      feedbackActual: null,
      cargando: true,
      enviando: false,
      finalizado: false,
      resultadoFinal: null,
      yaCompletada: false,
      error: ''
    };
  },
  computed: {
    escenarioActual() {
      return this.escenarios[this.indice] || null;
    },
    progreso() {
      return this.escenarios.length ? Math.round(((this.indice) / this.escenarios.length) * 100) : 0;
    },
    esUltimo() {
      return this.indice === this.escenarios.length - 1;
    }
  },
  methods: {
    async cargarInicial() {
      this.cargando = true;
      this.error = '';
      try {
        const estado = await EvaluationService.obtenerEstado(this.applicationId);
        if (estado.completed) {
          this.yaCompletada = true;
          return;
        }
        this.escenarios = await EvaluationService.obtenerEscenarios();
      } catch (e) {
        this.error = 'No se pudo cargar la evaluación. Intenta de nuevo.';
      } finally {
        this.cargando = false;
      }
    },
    async seleccionarOpcion(opcion) {
      if (this.feedbackActual) return; // ya respondió este escenario
      this.opcionSeleccionada = opcion.id;
      try {
        const resultado = await EvaluationService.obtenerFeedback(this.escenarioActual.id, opcion.id);
        this.feedbackActual = resultado;
        this.respuestas.push({ scenario_id: this.escenarioActual.id, option_id: opcion.id });
      } catch (e) {
        this.error = 'No se pudo procesar tu respuesta. Intenta de nuevo.';
        this.opcionSeleccionada = null;
      }
    },
    siguiente() {
      if (!this.esUltimo) {
        this.indice++;
        this.opcionSeleccionada = null;
        this.feedbackActual = null;
      } else {
        this.finalizarEvaluacion();
      }
    },
    async finalizarEvaluacion() {
      this.enviando = true;
      try {
        this.resultadoFinal = await EvaluationService.enviarRespuestas(this.applicationId, this.respuestas);
        this.finalizado = true;
      } catch (e) {
        this.error = e.response?.data?.error || 'No se pudo guardar tu evaluación. Intenta de nuevo.';
      } finally {
        this.enviando = false;
      }
    },
    volver() {
      this.$router.push({ name: 'PostulantePostulaciones' });
    }
  },
  mounted() {
    this.cargarInicial();
  }
}
</script>

<template>
  <div class="eval-wrap">

    <div v-if="cargando" class="eval-card eval-card--centro">
      <p>Cargando evaluación...</p>
    </div>

    <div v-else-if="error && !escenarios.length" class="eval-card eval-card--centro">
      <p class="eval-error">{{ error }}</p>
      <button class="btn-primary" @click="volver">Volver a Postulaciones</button>
    </div>

    <div v-else-if="yaCompletada" class="eval-card eval-card--centro">
      <div class="eval-icon-ok">✅</div>
      <h2 class="eval-titulo">Ya completaste esta evaluación</h2>
      <p class="eval-sub">El reclutador ya puede ver tus resultados en tu perfil.</p>
      <button class="btn-primary" @click="volver">Volver a Postulaciones</button>
    </div>

    <!-- Resultados finales -->
    <div v-else-if="finalizado" class="eval-card">
      <div class="eval-icon-ok">🎉</div>
      <h2 class="eval-titulo">¡Evaluación completada!</h2>
      <div class="eval-score-final">{{ resultadoFinal.overall_score }}<span>/100</span></div>
      <p class="eval-sub">Puntaje general de habilidades blandas</p>

      <div class="eval-skills">
        <div v-for="(score, skill) in resultadoFinal.skill_scores" :key="skill" class="eval-skill-row">
          <span class="eval-skill-nombre">{{ skill.replaceAll('_', ' ') }}</span>
          <div class="eval-skill-barra-track">
            <div class="eval-skill-barra-fill" :style="{ width: score + '%' }"></div>
          </div>
          <span class="eval-skill-num">{{ score }}</span>
        </div>
      </div>

      <button class="btn-primary" @click="volver">Volver a Postulaciones</button>
    </div>

    <!-- Escenario actual -->
    <div v-else class="eval-card">
      <div class="eval-progreso-track">
        <div class="eval-progreso-fill" :style="{ width: progreso + '%' }"></div>
      </div>
      <p class="eval-contador">Escenario {{ indice + 1 }} de {{ escenarios.length }}</p>

      <span class="eval-skill-tag">{{ escenarioActual.skill_label }}</span>
      <h2 class="eval-situacion">{{ escenarioActual.situation }}</h2>

      <div class="eval-opciones">
        <button
            v-for="opcion in escenarioActual.options"
            :key="opcion.id"
            class="eval-opcion"
            :class="{
              'eval-opcion--seleccionada': opcionSeleccionada === opcion.id,
              'eval-opcion--disabled': feedbackActual && opcionSeleccionada !== opcion.id
            }"
            :disabled="!!feedbackActual"
            @click="seleccionarOpcion(opcion)"
        >
          {{ opcion.text }}
        </button>
      </div>

      <Transition name="fade">
        <div v-if="feedbackActual" class="eval-feedback">
          <p class="eval-feedback-texto">{{ feedbackActual.feedback }}</p>
          <button class="btn-primary" :disabled="enviando" @click="siguiente">
            {{ enviando ? 'Guardando...' : (esUltimo ? 'Ver resultados' : 'Siguiente escenario →') }}
          </button>
        </div>
      </Transition>

      <p v-if="error" class="eval-error">{{ error }}</p>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.eval-wrap {
  font-family: 'DM Sans', sans-serif;
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1rem 5rem;
}

.eval-card {
  background: #fff;
  border-radius: 24px;
  padding: 2.2rem;
  box-shadow: 0 4px 24px rgba(10,61,43,0.07);
  border: 1px solid rgba(10,61,43,0.06);
}
.eval-card--centro { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; }

.eval-icon-ok { font-size: 2.5rem; }
.eval-titulo { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.5rem; color: #111827; margin: 0; }
.eval-sub { color: #6b7280; font-size: 0.95rem; margin: 0 0 1rem; }

.eval-progreso-track { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-bottom: 0.5rem; }
.eval-progreso-fill { height: 100%; background: #10b981; transition: width 0.3s ease; }
.eval-contador { font-size: 0.8rem; color: #9ca3af; margin: 0 0 1.25rem; }

.eval-skill-tag {
  display: inline-block; background: #ecfdf5; color: #065f46;
  font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.72rem;
  padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;
  margin-bottom: 0.9rem;
}
.eval-situacion { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1.25rem; color: #111827; margin: 0 0 1.5rem; line-height: 1.4; }

.eval-opciones { display: flex; flex-direction: column; gap: 0.7rem; }
.eval-opcion {
  text-align: left; padding: 0.9rem 1.1rem; border-radius: 14px;
  border: 1.5px solid #e5e7eb; background: #f9fafb; color: #374151;
  font-family: 'DM Sans', sans-serif; font-size: 0.92rem; cursor: pointer;
  transition: all 0.15s;
}
.eval-opcion:hover:not(:disabled) { border-color: #10b981; background: #ecfdf5; }
.eval-opcion--seleccionada { border-color: #10b981; background: #d1fae5; color: #065f46; font-weight: 600; }
.eval-opcion--disabled { opacity: 0.5; cursor: default; }

.eval-feedback {
  margin-top: 1.25rem; padding: 1rem 1.2rem;
  background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px;
  display: flex; flex-direction: column; gap: 0.9rem;
}
.eval-feedback-texto { margin: 0; font-size: 0.9rem; color: #065f46; }

.eval-error { color: #dc2626; font-size: 0.85rem; margin-top: 1rem; }

.btn-primary {
  background: #0a3d2b; color: #fff; border: none; border-radius: 12px;
  padding: 12px 20px; font-family: 'Sora', sans-serif; font-weight: 600;
  font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer;
}
.btn-primary:hover { background: #10b981; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.eval-score-final { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 3rem; color: #10b981; text-align: center; }
.eval-score-final span { font-size: 1.2rem; color: #9ca3af; }

.eval-skills { display: flex; flex-direction: column; gap: 0.8rem; margin: 1.5rem 0 2rem; }
.eval-skill-row { display: flex; align-items: center; gap: 0.8rem; }
.eval-skill-nombre { flex: 0 0 140px; font-size: 0.82rem; color: #374151; text-transform: capitalize; }
.eval-skill-barra-track { flex: 1; height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.eval-skill-barra-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); }
.eval-skill-num { flex: 0 0 32px; text-align: right; font-weight: 700; font-size: 0.82rem; color: #111827; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>