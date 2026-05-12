<script>
import { applyToJob, getJobBoardData } from "../services/JobBoard.service.js";
import PostularModal from '../components/PostularModal.vue';

export default {
  name: "OfertasEmpleo",
  components: { PostularModal },
  data() {
    return {
      jobOffers: [],
      myAppliedIds: [],
      isLoading: true,
      filtroBusqueda: '',
      mostrarModalPostular: false,
      ofertaSeleccionada: null,
      mostrarDetalles: false,
      ofertaDetalles: null,
    };
  },
  computed: {
    ofertasFiltradas() {
      if (!this.filtroBusqueda) return this.jobOffers;
      return this.jobOffers.filter(offer =>
          (offer.title ?? '').toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
          (offer.location ?? '').toLowerCase().includes(this.filtroBusqueda.toLowerCase())
      );
    }
  },
  methods: {
    async cargarOfertas() {
      this.isLoading = true;
      try {
        const offers = await getJobBoardData();
        this.jobOffers = offers;
        // Obtener postulaciones reales del candidato desde la API
        try {
          const { getMyApplicationsData } = await import('../services/Application.service.js');
          const response = await getMyApplicationsData();
          const misPostulaciones = response.data || [];
          this.myAppliedIds = misPostulaciones.map(app => String(app.job_offer_id));
        } catch {
          this.myAppliedIds = [];
        }
      } catch (error) {
        console.error("Error al cargar ofertas de empleo:", error);
      } finally {
        this.isLoading = false;
      }
    },
    abrirModalPostular(oferta) {
      this.ofertaSeleccionada = oferta;
      this.mostrarModalPostular = true;
    },
    cerrarModalPostular() {
      this.mostrarModalPostular = false;
      this.ofertaSeleccionada = null;
    },
    async postular(cvUrl) {
      if (!this.ofertaSeleccionada) return alert("Error al procesar la postulación.");
      const payloadAPI = { job_offer_id: this.ofertaSeleccionada.id, cv_url: cvUrl };
      try {
        await applyToJob(payloadAPI);
        alert("¡Has postulado exitosamente!");
        this.myAppliedIds.push(String(this.ofertaSeleccionada.id));
        this.cerrarModalPostular();
      } catch (error) {
        console.error("Error al postular:", error.response?.data || error.message);
        alert("Hubo un error al enviar tu postulación.");
      }
    }
  },
  mounted() {
    this.cargarOfertas();
  }
};
</script>

<template>
  <div class="oe-root">

    <!-- Hero + Buscador -->
    <div class="oe-hero">
      <div class="oe-hero__badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Ofertas disponibles
      </div>
      <h1 class="oe-hero-title">{{ $t("encuentra_desafio") }}</h1>
      <p class="oe-hero-sub">{{ $t("explora_oportunidades") }}</p>

      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
            v-model="filtroBusqueda"
            type="text"
            :placeholder="$t('placeholder_busqueda')"
            class="search-input"
        />
      </div>
    </div>

    <!-- Contador de resultados -->
    <div v-if="!isLoading && jobOffers.length > 0" class="oe-count">
      <span class="oe-count__num">{{ ofertasFiltradas.length }}</span>
      <span class="oe-count__label">oferta{{ ofertasFiltradas.length !== 1 ? 's' : '' }} encontrada{{ ofertasFiltradas.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Cargando -->
    <div v-if="isLoading" class="oe-state">
      <div class="spinner">
        <div class="spinner-track"></div>
        <div class="spinner-fill"></div>
      </div>
      <p class="state-label">Buscando oportunidades...</p>
    </div>

    <!-- Grid de ofertas -->
    <div v-else class="oe-grid">

      <div
          v-for="(offer, index) in ofertasFiltradas"
          :key="offer.id"
          class="offer-card"
          :style="{ animationDelay: index * 0.07 + 's' }"
      >
        <!-- Top: Ícono + título -->
        <div class="offer-top">
          <div class="offer-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span v-if="myAppliedIds.includes(String(offer.id))" class="applied-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Postulado
          </span>
        </div>

        <div class="offer-body">
          <h3 class="offer-title">{{ offer.title }}</h3>

          <div class="offer-location">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ offer.location }}</span>
          </div>

          <p class="offer-desc">{{ offer.description }}</p>
        </div>

        <div class="offer-footer">
          <span class="offer-salary" :class="(!offer.salary_range || offer.salary_range == 0 || offer.salary_range == '0') ? 'offer-salary--na' : ''">{{ (!offer.salary_range || offer.salary_range == 0 || offer.salary_range == '0') ? 'No especificado' : 'S/. ' + offer.salary_range }}</span>
          <div class="offer-actions">
            <button @click.stop="ofertaDetalles = offer; mostrarDetalles = true" class="offer-btn offer-btn--outline">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver más
            </button>
            <button
                @click.stop="abrirModalPostular(offer)"
                :disabled="myAppliedIds.includes(String(offer.id))"
                :class="['offer-btn', myAppliedIds.includes(String(offer.id)) ? 'offer-btn--applied' : 'offer-btn--active']"
            >
              <svg v-if="!myAppliedIds.includes(String(offer.id))" width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              {{ myAppliedIds.includes(String(offer.id)) ? 'Ya postulaste' : 'Postular' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-if="ofertasFiltradas.length === 0" class="oe-empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="empty-title">{{ $t("sin_resultados") }}</p>
        <p class="empty-sub">Intenta buscar con otros términos o palabras clave.</p>
      </div>

    </div>

    <!-- Modal postular -->
    <PostularModal
        v-if="mostrarModalPostular"
        :oferta="ofertaSeleccionada"
        @cerrar="cerrarModalPostular"
        @confirmar-postulacion="postular"
    />

    <!-- Modal ver detalles -->
    <Transition name="modal-det">
      <div v-if="mostrarDetalles && ofertaDetalles" class="det-overlay" @click.self="mostrarDetalles = false">
        <div class="det-card">

          <button class="det-close" @click="mostrarDetalles = false">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Badge -->
          <div class="det-badge">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Oferta de empleo
          </div>

          <h2 class="det-title">{{ ofertaDetalles.title }}</h2>

          <!-- Chips -->
          <div class="det-chips">
          <span v-if="ofertaDetalles.location" class="det-chip">
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {{ ofertaDetalles.location }}
          </span>
            <span :class="(!ofertaDetalles.salary_range || ofertaDetalles.salary_range == 0 || ofertaDetalles.salary_range == '0') ? 'det-chip' : 'det-chip det-chip--green'">
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ (!ofertaDetalles.salary_range || ofertaDetalles.salary_range == 0 || ofertaDetalles.salary_range == '0') ? 'No especificado' : 'S/. ' + ofertaDetalles.salary_range }}
          </span>
          </div>

          <!-- Descripción -->
          <div v-if="ofertaDetalles.description" class="det-section">
            <span class="det-label">Descripción</span>
            <div class="det-box"><p class="det-text">{{ ofertaDetalles.description }}</p></div>
          </div>

          <!-- Requisitos -->
          <div v-if="ofertaDetalles.requirements" class="det-section">
            <span class="det-label">Requisitos</span>
            <div class="det-box"><p class="det-text">{{ ofertaDetalles.requirements }}</p></div>
          </div>

          <!-- Acciones -->
          <div class="det-footer">
            <button @click="mostrarDetalles = false" class="det-btn-cancel">Cerrar</button>
            <button
                @click="mostrarDetalles = false; abrirModalPostular(ofertaDetalles)"
                :disabled="myAppliedIds.includes(String(ofertaDetalles.id))"
                class="det-btn-apply"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              {{ myAppliedIds.includes(String(ofertaDetalles.id)) ? 'Ya postulaste' : 'Postular ahora' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.oe-root {
  --c-deep:   #0a3d2b;
  --c-mid:    #006c49;
  --c-accent: #10b981;
  --c-bg:     #f5f4f0;
  --c-card:   #ffffff;
  --c-text:   #111827;
  --c-muted:  #6b7280;

  max-width: 1160px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
  font-family: 'DM Sans', sans-serif;
}

/* ── HERO ── */
.oe-hero {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.oe-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--c-mid);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 100px;
  padding: 6px 14px;
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(16,185,129,0.12);
}

.oe-hero-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.9rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.03em;
  line-height: 1.12;
  margin: 0 0 0.75rem;
}
.oe-hero-sub {
  font-size: 1rem;
  color: var(--c-muted);
  margin: 0 0 2rem;
  line-height: 1.6;
}

/* ── SEARCH ── */
.search-wrap {
  position: relative;
  max-width: 520px;
  margin: 0 auto;
}
.search-icon {
  position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
  width: 19px; height: 19px; color: #b0bab5; pointer-events: none;
  transition: color 0.2s;
}
.search-wrap:focus-within .search-icon { color: var(--c-accent); }
.search-input {
  width: 100%;
  background: var(--c-card);
  border: 1.5px solid #e5e7eb;
  border-radius: 100px;
  padding: 14px 22px 14px 50px;
  font-size: 0.925rem;
  font-family: 'DM Sans', sans-serif;
  color: var(--c-text);
  outline: none;
  box-shadow: 0 4px 20px rgba(10,61,43,0.06);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.search-input::placeholder { color: #b0bab5; }
.search-input:focus {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 4px rgba(16,185,129,0.1), 0 4px 20px rgba(10,61,43,0.06);
}

/* ── CONTADOR ── */
.oe-count {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding-left: 0.25rem;
}
.oe-count__num {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--c-deep);
}
.oe-count__label {
  font-size: 0.875rem;
  color: var(--c-muted);
}

/* ── LOADING ── */
.oe-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5rem 0; gap: 1rem; text-align: center;
}
.state-label { font-size: 0.875rem; color: var(--c-muted); }
.spinner { position: relative; width: 48px; height: 48px; }
.spinner-track, .spinner-fill {
  position: absolute; inset: 0;
  border-radius: 50%; border: 3px solid transparent;
}
.spinner-track { border-color: rgba(10,61,43,0.07); }
.spinner-fill { border-top-color: var(--c-accent); animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── GRID ── */
.oe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

/* ── CARD ── */
.offer-card {
  background: var(--c-card);
  border: 1.5px solid #e9e8e4;
  border-radius: 20px;
  padding: 1.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.2s;
  animation: card-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.offer-card:hover {
  border-color: var(--c-accent);
  box-shadow: 0 8px 32px rgba(16,185,129,0.12);
  transform: translateY(-3px);
}

/* Top row */
.offer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.offer-icon {
  width: 46px; height: 46px;
  background: var(--c-bg);
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-muted);
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}
.offer-card:hover .offer-icon {
  background: #e6f7f1;
  border-color: rgba(16,185,129,0.3);
  color: var(--c-accent);
  transform: rotate(-5deg) scale(1.05);
}
.offer-icon svg { width: 22px; height: 22px; }

.applied-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--c-mid);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 100px;
  padding: 4px 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Body */
.offer-body { flex: 1; }
.offer-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: -0.02em;
  margin: 0 0 0.6rem;
  line-height: 1.3;
  transition: color 0.2s;
}
.offer-card:hover .offer-title { color: var(--c-deep); }

.offer-location {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.72rem; font-weight: 700;
  color: var(--c-muted);
  background: var(--c-bg);
  border: 1px solid #e5e7eb;
  padding: 4px 10px; border-radius: 100px;
  margin-bottom: 0.875rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.offer-location svg { width: 12px; height: 12px; }

.offer-desc {
  font-size: 0.86rem; color: var(--c-muted); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; overflow: hidden;
}

/* Footer */
.offer-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(10,61,43,0.06);
  flex-wrap: wrap;
}
.offer-salary--na { color: #9ca3af !important; background: #f5f4f0 !important; border-color: #e5e7eb !important; font-style: italic; }
.offer-salary {
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem; font-weight: 700;
  color: var(--c-deep);
  background: #e6f7f1;
  border: 1px solid rgba(16,185,129,0.2);
  padding: 5px 14px; border-radius: 100px;
}
.offer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.835rem; font-weight: 700;
  border: none; cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}
.offer-btn--active {
  background: var(--c-deep); color: #fff;
  box-shadow: 0 3px 10px rgba(10,61,43,0.25);
}
.offer-btn--active:hover {
  background: var(--c-accent);
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(16,185,129,0.3);
}
.offer-btn--applied {
  background: #f3f4f6; color: #9ca3af;
  border: 1px solid #e5e7eb; cursor: not-allowed;
}

/* Empty */
.oe-empty {
  grid-column: 1 / -1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5rem 2rem; text-align: center;
  background: var(--c-card);
  border: 1.5px dashed #d1d5db;
  border-radius: 20px;
  gap: 0.75rem;
}
.empty-icon {
  width: 60px; height: 60px;
  background: var(--c-bg); border: 1.5px solid #e5e7eb; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: #d1d5db;
}
.empty-icon svg { width: 28px; height: 28px; }
.empty-title {
  font-family: 'Sora', sans-serif; font-size: 1.1rem;
  font-weight: 700; color: var(--c-text); margin: 0;
}
.empty-sub { font-size: 0.875rem; color: var(--c-muted); margin: 0; }

/* ── Botones footer ── */
.offer-actions { display: flex; gap: 8px; align-items: center; }
.offer-btn--outline {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 14px; border-radius: 10px;
  background: #f5f4f0; border: 1.5px solid #e5e7eb;
  color: #374151; font-family: 'Sora', sans-serif;
  font-size: 0.75rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.offer-btn--outline:hover { background: #ecfdf5; border-color: #a7f3d0; color: #0a3d2b; }

/* ── Modal detalles ── */
.modal-det-enter-active, .modal-det-leave-active { transition: opacity 0.22s ease; }
.modal-det-enter-from, .modal-det-leave-to { opacity: 0; }
.modal-det-enter-active .det-card, .modal-det-leave-active .det-card { transition: transform 0.26s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease; }
.modal-det-enter-from .det-card, .modal-det-leave-to .det-card { transform: translateY(16px) scale(0.97); opacity: 0; }

.det-overlay {
  position: fixed; inset: 0;
  background: rgba(10,61,43,0.3); backdrop-filter: blur(8px);
  display: flex; align-items: flex-start; justify-content: center;
  z-index: 1000; padding: 1.5rem; overflow-y: auto;
}
.det-card {
  position: relative; width: 100%; max-width: 560px;
  background: #fff; border-radius: 24px; padding: 2rem;
  box-shadow: 0 24px 80px rgba(10,61,43,0.16);
  border: 1px solid rgba(0,0,0,0.06); margin: auto;
}
.det-close {
  position: absolute; top: 1.1rem; right: 1.1rem;
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af; transition: all 0.2s;
}
.det-close:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

.det-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;
  border-radius: 99px; font-size: 0.7rem; font-weight: 700;
  padding: 5px 12px; margin-bottom: 1rem; letter-spacing: 0.03em;
}
.det-title {
  font-family: 'Sora', sans-serif; font-size: 1.4rem; font-weight: 800;
  color: #0f1a13; letter-spacing: -0.02em; line-height: 1.2;
  margin-bottom: 1rem; padding-right: 2rem;
}
.det-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.25rem; }
.det-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f5f4f0; border: 1px solid #e5e7eb; color: #6b7280;
  border-radius: 8px; font-size: 0.76rem; padding: 5px 10px;
}
.det-chip--green { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }
.det-section { margin-bottom: 1rem; }
.det-label {
  display: block; font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #9ca3af; margin-bottom: 6px;
}
.det-box {
  background: #f9fafb; border: 1.5px solid #e5e7eb;
  border-radius: 12px; padding: 14px;
}
.det-text {
  font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
  color: #374151; line-height: 1.65; margin: 0;
  white-space: pre-wrap; word-break: break-word;
}
.det-footer { display: flex; gap: 10px; margin-top: 1.5rem; }
.det-btn-cancel {
  flex: 1; padding: 12px; border-radius: 12px;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  color: #6b7280; font-family: 'Sora', sans-serif;
  font-size: 0.88rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.det-btn-cancel:hover { background: #f3f4f6; border-color: #d1d5db; }
.det-btn-apply {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px; border-radius: 12px; border: none;
  background: #0a3d2b; color: #fff;
  font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 14px rgba(10,61,43,0.25);
  transition: all 0.2s;
}
.det-btn-apply:hover { background: #10b981; transform: translateY(-1px); }
.det-btn-apply:disabled { background: #9ca3af; box-shadow: none; cursor: not-allowed; transform: none; }
</style>