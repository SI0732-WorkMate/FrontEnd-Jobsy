<script>
import { getMyInboxMessages } from "../services/Notification.service.js";
import { getMyApplicationsData } from "../services/Application.service.js";
import axios from "axios";

const API_URL = "import.meta.env.VITE_API_URL/api";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default {
  name: "PricipalPostulante",
  data() {
    return {
      user: null,
      postulacionesRecientes: [],
      vacantesRecientes: [],
      mensajes: [],
      isLoading: true,
    };
  },
  computed: {
    saludo() {
      const h = new Date().getHours();
      if (h < 12) return "Buenos días";
      if (h < 18) return "Buenas tardes";
      return "Buenas noches";
    },
    nombre() {
      return this.user?.name || "Candidato";
    },
  },
  methods: {
    async cargarDatosDelPanel() {
      this.isLoading = true;
      this.user = JSON.parse(localStorage.getItem("user"));

      try {
        const response = await getMyApplicationsData();
        const apps = response.data || [];
        this.postulacionesRecientes = apps.slice(0, 3).map((app) => ({
          titulo: app.job_title,
          estado: app.status || "pending",
        }));
      } catch {
        this.postulacionesRecientes = [];
      }

      try {
        const offersRes = await axios.get(`${API_URL}/joboffers`, getAuthHeaders());
        this.vacantesRecientes = (offersRes.data || [])
            .filter(o => o.status === 0 || o.status === 'Activa')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 4)
            .map(o => ({
              id: o.id,
              titulo: o.title,
              empresa: o.company_name || o.employer_name || '',
              ubicacion: o.location || 'Sin ubicación',
            }));
      } catch {
        this.vacantesRecientes = [];
      }

      try {
        const msgs = await getMyInboxMessages();

        this.mensajes = await Promise.all(
            msgs.slice(0, 4).map(async (msg) => {
              let de = `Empleador #${msg.sender_id}`;
              try {
                const userRes = await axios.get(
                    `${API_URL}/User/${msg.sender_id}`,
                    getAuthHeaders()
                );
                const u = userRes.data;
                de = u.description ? `${u.name} — ${u.description}` : u.name;
              } catch {}
              return { id: msg.id, de, contenido: msg.content };
            })
        );
      } catch {
        this.mensajes = [];
      } finally {
        this.isLoading = false;
      }
    },
    irA(ruta) {
      this.$router.push(ruta);
    },
  },
  mounted() {
    this.cargarDatosDelPanel();
  },
};
</script>

<template>
  <div class="dash">

    <!-- HEADER -->
    <div class="dash__header">
      <div class="dash__greeting">
        <span class="dash__hello">{{ saludo }},</span>
        <h1 class="dash__name">{{ nombre }} 👋</h1>
        <p class="dash__sub">Aquí tienes un resumen de tu actividad.</p>
      </div>
      <button class="dash__cta" @click="irA('/postulante/ofertas-empleo')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Buscar empleos
      </button>
    </div>

    <!-- STATS -->
    <div class="stats">
      <div class="stat-card stat-card--green">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">Postulaciones</span>
          <span class="stat-card__value">{{ postulacionesRecientes.length }}</span>
        </div>
      </div>

      <div class="stat-card stat-card--teal">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">Mensajes</span>
          <span class="stat-card__value">{{ mensajes.length }}</span>
        </div>
      </div>

      <div class="stat-card stat-card--slate">
        <div class="stat-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">Empleos disponibles</span>
          <span class="stat-card__value">
            <span @click="irA('/postulante/ofertas-empleo')" style="cursor:pointer;text-decoration:underline;font-size:1rem;color:#0d9488;">Ver →</span>
          </span>
        </div>
      </div>
    </div>

    <!-- GRID -->
    <div class="dash__grid">

      <!-- Columna izquierda: Postulaciones + Vacantes recientes -->
      <div class="dash__left-col">

        <!-- Postulaciones recientes -->
        <div class="panel">
          <div class="panel__head">
            <h2 class="panel__title">Postulaciones recientes</h2>
            <button class="panel__link" @click="irA('/postulante/postulaciones')">Ver todas →</button>
          </div>

          <div v-if="postulacionesRecientes.length === 0" class="panel__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p>Aún no has postulado a ninguna oferta.</p>
            <button class="btn-action" @click="irA('/postulante/ofertas-empleo')">Explorar empleos</button>
          </div>

          <div v-else class="item-list">
            <div v-for="(post, i) in postulacionesRecientes" :key="i" class="list-item">
              <div class="list-item__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              </div>
              <div class="list-item__info">
                <span class="list-item__title">{{ post.titulo }}</span>
                <span class="list-item__meta">Postulación enviada</span>
              </div>
              <span class="badge badge--blue">{{ post.estado }}</span>
            </div>
          </div>
        </div>

        <!-- Vacantes recientes -->
        <div class="panel panel--vacantes">
          <div class="panel__head">
            <h2 class="panel__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:#10b981"><path d="M21 13.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-5.5"/><path d="M12 12V3"/><path d="M7 8l5-5 5 5"/></svg>
              Vacantes recientes
            </h2>
            <button class="panel__link" @click="irA('/postulante/ofertas-empleo')">Ver todas →</button>
          </div>

          <div v-if="vacantesRecientes.length === 0" class="panel__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
            <p>No hay vacantes disponibles por el momento.</p>
          </div>

          <div v-else class="vacante-list">
            <div v-for="vacante in vacantesRecientes" :key="vacante.id" class="vacante-item" @click="irA('/postulante/ofertas-empleo')">
              <div class="vacante-item__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
              </div>
              <div class="vacante-item__info">
                <span class="vacante-item__title">{{ vacante.titulo }}</span>
                <span class="vacante-item__meta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ vacante.ubicacion }}
              </span>
              </div>
              <span class="vacante-item__badge">Nueva</span>
            </div>
          </div>
        </div>

      </div><!-- fin dash__left-col -->

      <!-- Acciones rápidas + Mensajes -->
      <div class="side-col">

        <!-- Acciones rápidas -->
        <div class="panel panel--acciones">
          <div class="panel__head">
            <h2 class="panel__title">Acceso rápido</h2>
          </div>
          <div class="acciones">
            <button class="accion" @click="irA('/postulante/ofertas-empleo')">
              <div class="accion__icon accion__icon--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Buscar Empleos</span>
                <span class="accion__desc">Ver ofertas disponibles</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/postulante/postulaciones')">
              <div class="accion__icon accion__icon--teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Mis Postulaciones</span>
                <span class="accion__desc">Seguimiento de aplicaciones</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/postulante/bandeja-entrada')">
              <div class="accion__icon accion__icon--blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Bandeja de Entrada</span>
                <span class="accion__desc">Ver mensajes de empleadores</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/postulante/perfil')">
              <div class="accion__icon accion__icon--purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Mi Perfil</span>
                <span class="accion__desc">Editar información personal</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <!-- Mensajes recientes -->
        <div class="panel">
          <div class="panel__head">
            <h2 class="panel__title">Mensajes recientes</h2>
            <button class="panel__link" @click="irA('/postulante/bandeja-entrada')">Ver todos →</button>
          </div>

          <div v-if="isLoading" class="panel__empty">
            <div class="spinner"></div>
          </div>

          <div v-else-if="mensajes.length === 0" class="panel__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"/></svg>
            <p>No tienes mensajes nuevos.</p>
          </div>

          <div v-else class="item-list">
            <div v-for="msg in mensajes" :key="msg.id" class="list-item">
              <div class="list-item__avatar">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <div class="list-item__info">
                <span class="list-item__title">{{ msg.de }}</span>
                <span class="list-item__meta">{{ msg.contenido }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.dash {
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f4f6f3;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* HEADER */
.dash__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.dash__hello {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: #6b7c6e;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.15rem;
}
.dash__name {
  font-size: 2rem;
  font-weight: 700;
  color: #1a2e1c;
  margin: 0 0 0.25rem;
  line-height: 1.1;
}
.dash__sub { font-size: 0.92rem; color: #7a8f7d; margin: 0; }
.dash__cta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1a4d2e;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  white-space: nowrap;
}
.dash__cta svg { width: 16px; height: 16px; }
.dash__cta:hover { background: #15603a; transform: translateY(-1px); }

/* STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e8ede8;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.07); }
.stat-card__icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card__icon svg { width: 22px; height: 22px; }
.stat-card--green .stat-card__icon { background: #dcfce7; color: #16a34a; }
.stat-card--teal .stat-card__icon  { background: #ccfbf1; color: #0d9488; }
.stat-card--slate .stat-card__icon { background: #f1f5f9; color: #475569; }
.stat-card__label {
  display: block;
  font-size: 0.75rem;
  color: #7a8f7d;
  font-weight: 500;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-card__value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1a2e1c;
  line-height: 1;
}

/* GRID */
.dash__grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.25rem;
  align-items: start;
}
.dash__left-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* PANEL */
.panel {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8ede8;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  overflow: hidden;
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid #f0f4f0;
}
.panel__title { font-size: 0.95rem; font-weight: 700; color: #1a2e1c; margin: 0; }
.panel__link {
  background: none; border: none;
  font-size: 0.82rem; color: #1a4d2e; font-weight: 600;
  cursor: pointer; padding: 0; transition: opacity 0.15s;
}
.panel__link:hover { opacity: 0.7; }

.panel__empty {
  display: flex; flex-direction: column;
  align-items: center; padding: 2rem 1.5rem;
  color: #9aad9d; text-align: center; gap: 0.5rem;
}
.panel__empty svg { width: 36px; height: 36px; color: #c5d5c7; }
.panel__empty p { font-size: 0.88rem; margin: 0; }

.btn-action {
  margin-top: 0.5rem;
  background: #1a4d2e; color: #fff;
  border: none; border-radius: 8px;
  padding: 0.5rem 1.1rem; font-size: 0.82rem;
  font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.btn-action:hover { background: #15603a; }

/* LIST */
.item-list { padding: 0.5rem 0; }
.list-item {
  display: flex; align-items: center;
  gap: 0.9rem; padding: 0.85rem 1.5rem;
  border-bottom: 1px solid #f5f7f5;
  transition: background 0.12s;
}
.list-item:last-child { border-bottom: none; }
.list-item:hover { background: #f9fbf9; }

.list-item__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #dcfce7; color: #16a34a;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.list-item__icon svg { width: 18px; height: 18px; }

.list-item__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #e8ede8; color: #6b7c6e;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.list-item__avatar svg { width: 20px; height: 20px; }

.list-item__info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.list-item__title {
  font-size: 0.88rem; font-weight: 600; color: #1a2e1c;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.list-item__meta {
  font-size: 0.76rem; color: #9aad9d;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.badge {
  font-size: 0.72rem; font-weight: 600;
  padding: 0.2rem 0.65rem; border-radius: 999px;
  flex-shrink: 0;
}
.badge--blue { background: #dbeafe; color: #2563eb; }

/* SIDE COL */
.side-col { display: flex; flex-direction: column; gap: 1.25rem; }

/* ACCIONES */
.acciones { padding: 0.5rem 0; }
.accion {
  width: 100%; display: flex; align-items: center;
  gap: 0.9rem; padding: 0.85rem 1.25rem;
  background: none; border: none;
  border-bottom: 1px solid #f5f7f5;
  cursor: pointer; text-align: left;
  transition: background 0.12s;
}
.accion:last-child { border-bottom: none; }
.accion:hover { background: #f9fbf9; }
.accion__icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.accion__icon svg { width: 17px; height: 17px; }
.accion__icon--green  { background: #dcfce7; color: #16a34a; }
.accion__icon--teal   { background: #ccfbf1; color: #0d9488; }
.accion__icon--blue   { background: #dbeafe; color: #2563eb; }
.accion__icon--purple { background: #ede9fe; color: #7c3aed; }
.accion__text { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.accion__label { font-size: 0.86rem; font-weight: 600; color: #1a2e1c; }
.accion__desc  { font-size: 0.74rem; color: #9aad9d; }
.accion__arrow { width: 15px; height: 15px; color: #c5d5c7; flex-shrink: 0; }

/* SPINNER */
.spinner {
  width: 28px; height: 28px;
  border: 3px solid #e8ede8;
  border-top-color: #1a4d2e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* VACANTES */
.vacante-list { padding: 0.5rem 0; }
.vacante-item {
  display: flex; align-items: center;
  gap: 0.9rem; padding: 0.85rem 1.5rem;
  border-bottom: 1px solid #f5f7f5;
  transition: background 0.12s;
  cursor: pointer;
}
.vacante-item:last-child { border-bottom: none; }
.vacante-item:hover { background: #f0fdf4; }
.vacante-item__icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: #ccfbf1; color: #0d9488;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.vacante-item__icon svg { width: 17px; height: 17px; }
.vacante-item__info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.vacante-item__title {
  font-size: 0.88rem; font-weight: 600; color: #1a2e1c;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.vacante-item__meta {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.74rem; color: #9aad9d;
}
.vacante-item__badge {
  font-size: 0.68rem; font-weight: 700;
  padding: 0.2rem 0.6rem; border-radius: 999px;
  background: #dcfce7; color: #15803d;
  flex-shrink: 0;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .dash { padding: 1.25rem 1rem; }
  .stats { grid-template-columns: 1fr 1fr; }
  .dash__grid { grid-template-columns: 1fr; }
  .dash__name { font-size: 1.5rem; }
}
@media (max-width: 540px) {
  .stats { grid-template-columns: 1fr; }
}
</style>