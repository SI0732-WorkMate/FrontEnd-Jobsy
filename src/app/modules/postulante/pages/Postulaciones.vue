<script>
import { getMyApplicationsData } from "../services/Application.service.js";
import { getMyInboxMessages } from "../services/Notification.service.js";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default {
  name: "Postulaciones",
  data() {
    return {
      misPostulaciones: [],
      filtroTitulo: "",
      postulacionSeleccionada: null,
      modalVer: false,
      isLoading: true,
      error: null,
    };
  },
  computed: {
    postulacionesFiltradas() {
      if (!this.filtroTitulo) return this.misPostulaciones;
      return this.misPostulaciones.filter((p) =>
          p.title.toLowerCase().includes(this.filtroTitulo.toLowerCase())
      );
    },
  },
  methods: {
    async cargarMisPostulaciones() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await getMyApplicationsData();
        const apps = response.data || [];

        // Traer inbox una sola vez
        let inbox = [];
        try { inbox = await getMyInboxMessages(); } catch {}

        this.misPostulaciones = await Promise.all(
            apps.map(async (app) => {
              // Obtener employer_id de la oferta
              let employerId = null;
              try {
                const ofertaRes = await axios.get(
                    `${API_URL}/joboffers/${app.job_offer_id}`,
                    getAuthHeaders()
                );
                employerId = ofertaRes.data?.employer_id;
              } catch {}

              // Contar mensajes de ese empleador
              const messageCount = employerId
                  ? inbox.filter((m) => m.sender_id === employerId).length
                  : 0;

              // Traer info completa de la oferta
              let location = null, salary_range = null, requirements = null;
              try {
                const ofertaRes2 = await axios.get(
                    `${API_URL}/joboffers/${app.job_offer_id}`,
                    getAuthHeaders()
                );
                location = ofertaRes2.data?.location;
                salary_range = ofertaRes2.data?.salary_range;
                requirements = ofertaRes2.data?.requirements;
              } catch {}

              return {
                applicationId: app.application_id,
                title: app.job_title,
                resultado: app.status,
                messageCount,
                description: app.job_description,
                cv_url: app.cv_url,
                application_date: app.application_date,
                location,
                salary_range,
                requirements,
              };
            })
        );
      } catch {
        this.error = "No se pudieron cargar tus postulaciones. Intenta de nuevo.";
        this.misPostulaciones = [];
      } finally {
        this.isLoading = false;
      }
    },
    abrirModalVer(postulacion) {
      this.postulacionSeleccionada = postulacion;
      this.modalVer = true;
    },
  },
  mounted() {
    this.cargarMisPostulaciones();
  },
};
</script>

<template>
  <div class="page-wrapper">

    <!-- Cabecera -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-titulo">{{ $t("postulaciones_titulo") }}</h1>
        <p class="page-subtitulo">Haz seguimiento al estado de tus candidaturas.</p>
      </div>

      <!-- Buscador -->
      <div class="search-wrapper">
        <div class="search-icon-wrap">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input
            v-model="filtroTitulo"
            type="text"
            :placeholder="$t('buscar_titulo_placeholder')"
            class="search-input"
        />
      </div>
    </div>

    <!-- Tabla -->
    <div class="tabla-scroll">
      <div class="tabla-inner">

        <!-- Cabeceras -->
        <div class="tabla-head">
          <div class="th">{{ $t("columna_titulo") }}</div>
          <div class="th">{{ $t("columna_resultado") }}</div>
          <div class="th">{{ $t("columna_mensajes") }}</div>
          <div class="th">{{ $t("columna_acciones") }}</div>
        </div>

        <!-- Filas -->
        <div class="tabla-body">

          <div v-if="isLoading" class="empty-state">
            <div class="spinner"></div>
            <p class="empty-sub" style="margin-top:12px">Cargando postulaciones...</p>
          </div>

          <div v-else-if="error" class="empty-state">
            <div class="empty-icon" style="color:#ef4444">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="empty-titulo">Error</p>
            <p class="empty-sub">{{ error }}</p>
          </div>

          <template v-else-if="postulacionesFiltradas.length > 0">
            <div
                v-for="postulacion in postulacionesFiltradas"
                :key="postulacion.applicationId"
                class="tabla-row"
            >
              <!-- Título -->
              <div class="cell-titulo">
                <span class="cell-titulo-text">{{ postulacion.title }}</span>
              </div>

              <!-- Resultado -->
              <div class="cell-center">
                <span class="chip chip-blue">{{ postulacion.resultado }}</span>
              </div>

              <!-- Mensajes -->
              <div class="cell-center">
                <div class="msg-badge-wrap">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="msg-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                  <span class="msg-count">{{ postulacion.messageCount }}</span>
                </div>
              </div>

              <!-- Acciones -->
              <div class="cell-acciones">
                <button @click="abrirModalVer(postulacion)" class="btn-ver">Ver Detalles</button>
              </div>
            </div>
          </template>

          <!-- Estado Vacío -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <p class="empty-titulo">{{ $t("sin_postulaciones") }}</p>
            <p class="empty-sub">Aún no tienes postulaciones que coincidan con tu búsqueda.</p>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Ver Detalles -->
    <Transition name="modal">
      <div v-if="modalVer" class="modal-overlay" @click.self="modalVer = false">
        <div class="modal-card">

          <button class="btn-cerrar" @click="modalVer = false" aria-label="Cerrar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Icon + título -->
          <div class="modal-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="modal-titulo">{{ postulacionSeleccionada.title }}</h3>

          <!-- Chips de estado, location, salary -->
          <div class="modal-chips">
            <span class="chip chip-blue">{{ postulacionSeleccionada.resultado }}</span>
            <span v-if="postulacionSeleccionada.application_date" class="modal-fecha">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {{ new Date(postulacionSeleccionada.application_date).toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric' }) }}
          </span>
          </div>

          <!-- Info chips: location y salary -->
          <div class="modal-meta" v-if="postulacionSeleccionada.location || postulacionSeleccionada.salary_range">
          <span v-if="postulacionSeleccionada.location" class="meta-chip">
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {{ postulacionSeleccionada.location }}
          </span>
            <span v-if="postulacionSeleccionada.salary_range" class="meta-chip meta-chip--green">
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            S/. {{ postulacionSeleccionada.salary_range }}
          </span>
          </div>

          <!-- Descripción -->
          <div class="modal-section" v-if="postulacionSeleccionada.description">
            <span class="modal-section-label">Descripción</span>
            <div class="modal-desc-box">
              <p class="modal-desc-text">{{ postulacionSeleccionada.description }}</p>
            </div>
          </div>

          <!-- Requisitos -->
          <div class="modal-section" v-if="postulacionSeleccionada.requirements">
            <span class="modal-section-label">Requisitos</span>
            <div class="modal-desc-box">
              <p class="modal-desc-text">{{ postulacionSeleccionada.requirements }}</p>
            </div>
          </div>

          <!-- CV -->
          <div v-if="postulacionSeleccionada.cv_url" class="modal-section">
            <span class="modal-section-label">CV enviado</span>
            <a :href="postulacionSeleccionada.cv_url" target="_blank" rel="noopener noreferrer" class="modal-cv-link">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Ver mi CV
            </a>
          </div>

          <button @click="modalVer = false" class="btn-primary w-full">Cerrar</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --vp: #0a3d2b;
  --vm: #006c49;
  --va: #10b981;
  --vc: #6ee7b7;
  --fondo: #f5f4f0;
  --input-bg: #f9fafb;
  --card: #ffffff;
  --txt: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
}

.page-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
  font-family: 'Sora', sans-serif;
}

/* ——— Header ——— */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1.5px solid var(--border);
}

@media (min-width: 768px) {
  .page-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.page-titulo {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--txt);
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitulo {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: var(--muted);
  margin: 0;
}

/* ——— Search ——— */
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 320px;
}

.search-icon-wrap {
  position: absolute;
  inset-y: 0;
  left: 14px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--muted);
}

.search-input {
  width: 100%;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px 12px 42px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--txt);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-input::placeholder { color: var(--muted); font-weight: 300; }
.search-input:focus {
  border-color: var(--va);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
}

/* ——— Tabla ——— */
.tabla-scroll { width: 100%; overflow-x: auto; padding-bottom: 16px; }
.tabla-inner { min-width: 820px; }

.tabla-head {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1.5fr;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.th {
  background: var(--fondo);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tabla-body { display: flex; flex-direction: column; gap: 10px; }

.tabla-row {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1.5fr;
  gap: 12px;
  align-items: center;
  background: var(--card);
  border-radius: 16px;
  padding: 16px;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
}

.tabla-row:hover {
  box-shadow: 0 6px 20px rgba(10,61,43,0.1);
  border-color: rgba(16,185,129,0.3);
  transform: translateY(-1px);
}

.cell-titulo { padding: 0 12px; border-right: 1px solid var(--border); }
.cell-titulo-text {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--txt);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-center {
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid var(--border);
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.chip-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.chip-green { background: rgba(16,185,129,0.1); color: var(--vp); border: 1px solid rgba(16,185,129,0.3); }
.chip-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.msg-badge-wrap { position: relative; display: inline-flex; }
.msg-icon { color: #d1d5db; transition: color 0.2s; }
.tabla-row:hover .msg-icon { color: var(--va); }
.msg-count {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--fondo);
  border: 1px solid var(--border);
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  color: var(--muted);
}

.cell-acciones { display: flex; gap: 8px; justify-content: center; padding: 0 8px; }

.btn-ver {
  flex: 1;
  padding: 10px 14px;
  background: rgba(16,185,129,0.08);
  color: var(--vp);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-ver:hover {
  background: var(--va);
  color: #fff;
  border-color: var(--va);
  transform: translateY(-1px);
}

.btn-eliminar {
  padding: 10px 12px;
  background: #fff;
  color: #ef4444;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-eliminar:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  transform: translateY(-1px);
}

/* ——— Empty ——— */
.empty-state {
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--card);
  border-radius: 20px;
  border: 1.5px solid var(--border);
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--fondo);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1.5px solid var(--border);
  color: #d1d5db;
}

.empty-titulo {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--txt);
  margin: 0 0 8px 0;
}

.empty-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--muted);
  margin: 0;
}

/* ——— Modal ——— */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,61,43,0.3);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 1.5rem;
  overflow-y: auto;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--card);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 24px 80px rgba(10,61,43,0.18);
  animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.btn-cerrar {
  position: absolute;
  top: 18px;
  right: 18px;
  background: var(--fondo);
  border: 1.5px solid var(--border);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-cerrar:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
  transform: scale(1.08);
}
.btn-cerrar:focus { outline: none; }

.modal-icon {
  width: 50px;
  height: 50px;
  background: rgba(16,185,129,0.1);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--va);
  margin-bottom: 18px;
}

.modal-titulo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--txt);
  margin: 0 0 18px 0;
  padding-right: 32px;
  line-height: 1.3;
}

.modal-desc-box {
  background: var(--fondo);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.modal-desc-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.65;
  margin: 0;
  white-space: pre-wrap;
}

/* ——— Meta chips ——— */
.modal-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; }
.meta-chip { display: inline-flex; align-items: center; gap: 5px; background: #f5f4f0; border: 1px solid var(--border); color: var(--muted); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.76rem; padding: 5px 10px; }
.meta-chip--green { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }

/* ——— Transition modal ——— */
.modal-enter-active, .modal-leave-active { transition: opacity 0.22s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: translateY(20px) scale(0.96); opacity: 0; }

/* ——— Modal extras ——— */
.modal-chips { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.modal-fecha { display: inline-flex; align-items: center; gap: 5px; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: var(--muted); background: var(--fondo); border: 1px solid var(--border); padding: 5px 12px; border-radius: 99px; }
.modal-section { margin-bottom: 18px; }
.modal-section-label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
.modal-cv-link { display: inline-flex; align-items: center; gap: 7px; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #0a3d2b; padding: 10px 16px; border-radius: 10px; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; text-decoration: none; transition: background 0.2s, transform 0.15s; }
.modal-cv-link:hover { background: #10b981; color: #fff; border-color: #10b981; transform: translateY(-1px); }

/* ——— Botón primario ——— */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--vp);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  background: var(--va);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16,185,129,0.35);
}

.btn-primary:focus { outline: none; }

.w-full { width: 100%; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #0a3d2b;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>