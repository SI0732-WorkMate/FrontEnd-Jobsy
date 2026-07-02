<script>
import CandidatoFiltro from '../components/candidato/CandidatoFiltro.vue'
import CandidatoTabla from '../components/candidato/CandidatoTabla.vue'
import CandidatoModal from '../components/candidato/CandidatoModal.vue'
import ContactarModal from '../components/candidato/ContactarModal.vue'
import { CandidatoService } from '../../postulante/services/candidato.service.js'
import { MessageService } from '../services/Message.service.js'

export default {
  name: 'Candidatos',
  components: {
    CandidatoFiltro,
    CandidatoTabla,
    CandidatoModal,
    ContactarModal
  },
  data() {
    return {
      filtroNombre: '',
      candidatos: [],
      isLoading: true,
      mostrarModal: false,
      modalData: {},
      mostrarModalContacto: false,
      candidatoParaContactar: {}
    }
  },
  computed: {
    candidatosFiltrados() {
      if (!this.filtroNombre) {
        return this.candidatos;
      }
      return this.candidatos.filter(c =>
          c.name.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    },
  },
  methods: {
    async cargarCandidatos() {
      this.isLoading = true;
      this.candidatos = [];
      try {
        const datosDesdeServicio = await CandidatoService.obtenerCandidatosParaMisOfertas();
        this.candidatos = datosDesdeServicio;
      } catch (error) {
        console.error("Error en el componente Candidatos.vue al cargar datos:", error);
        alert("No se pudieron cargar los candidatos.");
      } finally {
        this.isLoading = false;
      }
    },
    abrirModal(candidato) {
      this.modalData = { ...candidato };
      this.mostrarModal = true;
    },
    cerrarModal() {
      this.mostrarModal = false;
    },
    async actualizarEstado(candidatoActualizado) {
      const index = this.candidatos.findIndex(c => c.id === candidatoActualizado.id);
      if (index === -1) { this.cerrarModal(); return; }

      try {
        await CandidatoService.actualizarEstadoCandidato(
            candidatoActualizado.id,
            candidatoActualizado.backendStatus,
            candidatoActualizado.motivo
        );
        this.candidatos[index].status = candidatoActualizado.status;
        this.candidatos[index].backendStatus = candidatoActualizado.backendStatus;
      } catch (error) {
        alert('Error al actualizar el estado. Intenta de nuevo.');
        console.error(error);
      }
      this.cerrarModal();
    },
    abrirModalContacto(candidato) {
      this.candidatoParaContactar = candidato;
      this.mostrarModalContacto = true;
    },
    cerrarModalContacto() {
      this.mostrarModalContacto = false;
    },
    async enviarMensaje(mensaje) {
      if (!this.candidatoParaContactar) return;
      const messageData = {
        receiver_id: this.candidatoParaContactar.user_id,
        content: mensaje
      };
      try {
        await MessageService.sendMessage(messageData);
        alert('¡Mensaje enviado con éxito!');
        this.cerrarModalContacto();
      } catch (error) {
        alert('Hubo un error al enviar el mensaje.');
      }
    }
  },
  mounted() {
    this.cargarCandidatos();
  }
}
</script>

<template>
  <div class="jobsy-wrap">

    <!-- Cabecera -->
    <div class="jobsy-header">
      <div class="jobsy-header__left">
        <div class="jobsy-icon-box">
          <svg class="jobsy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="jobsy-title">Candidatos</h2>
          <p class="jobsy-subtitle">Gestiona los postulantes de tus ofertas de empleo.</p>
        </div>
      </div>

      <div v-if="!isLoading" class="jobsy-badge">
        <span class="jobsy-badge__dot"></span>
        <span class="jobsy-badge__text">{{ candidatosFiltrados.length }} Resultados</span>
      </div>
    </div>

    <!-- Filtro -->
    <div class="jobsy-filter-wrap">
      <CandidatoFiltro v-model:filtro="filtroNombre" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="jobsy-loading">
      <div class="jobsy-spinner">
        <div class="jobsy-spinner__track"></div>
        <div class="jobsy-spinner__fill"></div>
      </div>
      <p class="jobsy-loading__title">Cargando candidatos...</p>
      <p class="jobsy-loading__sub">Obteniendo la base de datos de talento.</p>
    </div>

    <!-- Tabla -->
    <div v-else class="jobsy-table-wrap">
      <CandidatoTabla
          :candidatos="candidatosFiltrados"
          @verMas="abrirModal"
          @contactar="abrirModalContacto"
      />
    </div>

    <!-- Modales -->
    <CandidatoModal
        v-if="mostrarModal"
        :candidato="modalData"
        @actualizar="actualizarEstado"
        @cerrar="cerrarModal"
    />

    <ContactarModal
        v-if="mostrarModalContacto"
        :candidato="candidatoParaContactar"
        @cerrar="cerrarModalContacto"
        @enviar="enviarMensaje"
    />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Variables ── */
:root {
  --fondo-calido:  #f5f4f0;
  --fondo-input:   #f9fafb;
  --blanco-card:   #ffffff;
  --texto-principal: #111827;
  --texto-muted:   #6b7280;
  --radio-card:    24px;
  --radio-btn:     12px;
  --sombra-card:   0 4px 24px rgba(10,61,43,0.07);

}

.jobsy-wrap {
  font-family: 'DM Sans', sans-serif;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 5rem;
}

/* ── Cabecera ── */
.jobsy-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(10,61,43,0.08);
}

@media (min-width: 768px) {
  .jobsy-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.jobsy-header__left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.jobsy-icon-box {
  width: 56px;
  height: 56px;
  background: #ecfdf5;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px rgba(16,185,129,0.18);
  flex-shrink: 0;
}

.jobsy-icon {
  width: 26px;
  height: 26px;
  color: var(--verde-acento);
}

.jobsy-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--texto-principal);
  letter-spacing: -0.03em;
  margin: 0 0 0.25rem;
}

.jobsy-subtitle {
  font-size: 1rem;
  color: var(--texto-muted);
  font-weight: 400;
  margin: 0;
}

/* Badge */
.jobsy-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--blanco-card);
  border: 1px solid rgba(10,61,43,0.1);
  padding: 0.5rem 1rem;
  border-radius: 99px;
  box-shadow: var(--sombra-card);
}

.jobsy-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--verde-acento);
}

.jobsy-badge__text {
  font-family: 'Sora', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--texto-principal);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* ── Filtro ── */
.jobsy-filter-wrap {
  margin-bottom: 2rem;
}

/* ── Loading ── */
.jobsy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  background: var(--blanco-card);
  border-radius: var(--radio-card);
  box-shadow: var(--sombra-card);
  border: 1px solid rgba(10,61,43,0.06);
}

.jobsy-spinner {
  position: relative;
  width: 52px;
  height: 52px;
  margin-bottom: 1.5rem;
}

.jobsy-spinner__track,
.jobsy-spinner__fill {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.jobsy-spinner__track {
  border-color: rgba(16,185,129,0.15);
}

.jobsy-spinner__fill {
  border-top-color: var(--verde-acento);
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.jobsy-loading__title {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--texto-principal);
  margin: 0 0 0.35rem;
}

.jobsy-loading__sub {
  font-size: 0.9rem;
  color: var(--texto-muted);
  margin: 0;
}

/* ── Tabla ── */
.jobsy-table-wrap {
  width: 100%;
  animation: fadeUp 0.4s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>