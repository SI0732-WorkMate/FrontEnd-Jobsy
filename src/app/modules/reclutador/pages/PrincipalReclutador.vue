<script>
import axios from 'axios';
import { getAllPublications } from "../services/Publication.service.js";

const API_URL = 'http://localhost:5195/api';

export default {
  name: "PrincipalReclutador",
  data() {
    return {
      user: null,
      publicacionesRecientes: [],
      postulacionesRecientes: [],
      totalPublicaciones: 0,
      publicacionesActivas: 0,
      loading: true,
      hora: '',
    };
  },
  computed: {
    saludo() {
      const h = new Date().getHours();
      if (h < 12) return 'Buenos días';
      if (h < 18) return 'Buenas tardes';
      return 'Buenas noches';
    },
    nombre() {
      return this.user?.name || 'Reclutador';
    },
  },
  methods: {
    async cargarDatos() {
      try {
        this.user = JSON.parse(localStorage.getItem('user'));
        if (!this.user?.id) return;

        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [pubRes, appsRes] = await Promise.all([
          getAllPublications(),
          axios.get(`${API_URL}/applications/my-offers`, { headers }).catch(() => ({ data: [] }))
        ]);

        const todas = pubRes.data.filter(p => p.employer_id == this.user.id);
        this.totalPublicaciones = todas.length;
        this.publicacionesActivas = todas.filter(p => p.status === 0 || p.status === 'Activa').length;
        this.publicacionesRecientes = todas
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);

        // Postulaciones recientes con nombre de oferta
        const ofertasMap = {};
        todas.forEach(o => { ofertasMap[o.id] = o.title; });
        this.postulacionesRecientes = (appsRes.data || [])
            .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
            .slice(0, 5)
            .map(app => ({
              ...app,
              ofertaTitulo: ofertasMap[app.job_offer_id] || 'Oferta desconocida'
            }));
      } catch (e) {
        console.error('Error cargando dashboard:', e);
      } finally {
        this.loading = false;
      }
    },
    irA(ruta) {
      this.$router.push(ruta);
    },
    estadoLabel(pub) {
      return (pub.status === 0 || pub.status === 'Activa') ? 'Activa' : 'Borrador';
    },
    estadoActiva(pub) {
      return pub.status === 0 || pub.status === 'Activa';
    },
    formatFecha(fecha) {
      if (!fecha) return '';
      return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    },
  },
  mounted() {
    this.cargarDatos();
  }
};
</script>

<template>
  <div class="dash">

    <!-- Skeleton loader -->
    <template v-if="loading">
      <div class="dash__skeleton">
        <div class="sk-bar sk-bar--wide"></div>
        <div class="sk-row">
          <div class="sk-card"></div>
          <div class="sk-card"></div>
          <div class="sk-card"></div>
        </div>
        <div class="sk-bar"></div>
        <div class="sk-bar sk-bar--med"></div>
      </div>
    </template>

    <template v-else>

      <!-- ── HEADER ── -->
      <div class="dash__header">
        <div class="dash__greeting">
          <span class="dash__hello">{{ saludo }},</span>
          <h1 class="dash__name">{{ nombre }} 👋</h1>
          <p class="dash__sub">Aquí tienes un resumen de tu actividad de hoy.</p>
        </div>
        <button class="dash__cta" @click="irA('/reclutador/publicaciones')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m8-8H4"/></svg>
          Nueva Publicación
        </button>
      </div>

      <!-- ── STATS ── -->
      <div class="stats">
        <div class="stat-card stat-card--green">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">Total publicaciones</span>
            <span class="stat-card__value">{{ totalPublicaciones }}</span>
          </div>
        </div>

        <div class="stat-card stat-card--teal">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">Ofertas activas</span>
            <span class="stat-card__value">{{ publicacionesActivas }}</span>
          </div>
        </div>

        <div class="stat-card stat-card--slate">
          <div class="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-card__label">En borrador</span>
            <span class="stat-card__value">{{ totalPublicaciones - publicacionesActivas }}</span>
          </div>
        </div>
      </div>

      <!-- ── GRID PRINCIPAL ── -->
      <div class="dash__grid">

        <!-- Columna izquierda -->
        <div class="dash__left-col">

          <!-- Publicaciones recientes -->
          <div class="panel">
            <div class="panel__head">
              <h2 class="panel__title">Publicaciones recientes</h2>
              <button class="panel__link" @click="irA('/reclutador/publicaciones')">Ver todas →</button>
            </div>

            <div v-if="publicacionesRecientes.length === 0" class="panel__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p>Aún no tienes publicaciones.<br>¡Crea tu primera oferta!</p>
              <button class="btn-crear" @click="irA('/reclutador/publicaciones')">Crear oferta</button>
            </div>

            <div v-else class="pub-list">
              <div v-for="pub in publicacionesRecientes" :key="pub.id" class="pub-item">
                <div class="pub-item__info">
                  <span class="pub-item__title">{{ pub.title }}</span>
                  <span class="pub-item__meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ pub.location || 'Sin ubicación' }}
                  <span class="sep">·</span>
                  {{ formatFecha(pub.created_at) }}
                </span>
                </div>
                <span class="pub-item__badge" :class="estadoActiva(pub) ? 'badge--activa' : 'badge--borrador'">
                {{ estadoLabel(pub) }}
              </span>
              </div>
            </div>
          </div>

          <!-- Postulaciones recientes (notificaciones) -->
          <div class="panel panel--notif">
            <div class="panel__head">
              <h2 class="panel__title">
                <span>Postulaciones recientes</span>
                <span v-if="postulacionesRecientes.length > 0" class="notif-badge">{{ postulacionesRecientes.length }}</span>
              </h2>
              <button class="panel__link" @click="irA('/reclutador/candidatos')">Ver todas →</button>
            </div>

            <div v-if="postulacionesRecientes.length === 0" class="panel__empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p>Aún no tienes postulaciones.<br>Cuando alguien aplique, aparecerá aquí.</p>
            </div>

            <div v-else class="notif-list">
              <div v-for="app in postulacionesRecientes" :key="app.application_id" class="notif-item">
                <div class="notif-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div class="notif-info">
                  <span class="notif-titulo">{{ app.candidate_name || ('Candidato #' + app.candidate_id) }}</span>
                  <span class="notif-oferta">postuló a <strong>{{ app.ofertaTitulo }}</strong></span>
                  <span class="notif-fecha">{{ formatFecha(app.application_date) }}</span>
                </div>
                <span class="notif-status" :class="{
                'notif-status--pending': app.status === 'pending',
                'notif-status--ok': app.status === 'Posible',
                'notif-status--no': app.status === 'Denegado'
              }">{{ app.status || 'pending' }}</span>
              </div>
            </div>
          </div>

        </div><!-- fin left col -->

        <!-- Acciones rápidas -->
        <div class="panel panel--acciones">
          <div class="panel__head">
            <h2 class="panel__title">Acceso rápido</h2>
          </div>

          <div class="acciones">
            <button class="accion" @click="irA('/reclutador/publicaciones')">
              <div class="accion__icon accion__icon--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Publicaciones</span>
                <span class="accion__desc">Gestiona tus ofertas</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/reclutador/candidatos')">
              <div class="accion__icon accion__icon--teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Candidatos</span>
                <span class="accion__desc">Revisa postulaciones</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/reclutador/analiticas')">
              <div class="accion__icon accion__icon--blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Analíticas</span>
                <span class="accion__desc">Ver métricas</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <button class="accion" @click="irA('/reclutador/asistencia-ia')">
              <div class="accion__icon accion__icon--purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
              <div class="accion__text">
                <span class="accion__label">Asistencia IA</span>
                <span class="accion__desc">Analiza documentos</span>
              </div>
              <svg class="accion__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

      </div><!-- fin dash__grid -->
    </template>
  </div>
</template>

<style scoped>
/* ── BASE ── */
.dash {
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f4f6f3;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* ── SKELETON ── */
.dash__skeleton { display: flex; flex-direction: column; gap: 1.25rem; }
.sk-bar { height: 32px; border-radius: 8px; background: #e2e8e0; animation: pulse 1.4s ease-in-out infinite; }
.sk-bar--wide { width: 55%; }
.sk-bar--med { width: 70%; }
.sk-row { display: flex; gap: 1rem; }
.sk-card { flex: 1; height: 100px; border-radius: 12px; background: #e2e8e0; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

/* ── HEADER ── */
.dash__header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
.dash__hello { display:block; font-size:.85rem; font-weight:500; color:#6b7c6e; letter-spacing:.03em; text-transform:uppercase; margin-bottom:.15rem; }
.dash__name { font-size:2rem; font-weight:700; color:#1a2e1c; margin:0 0 .25rem; line-height:1.1; }
.dash__sub { font-size:.92rem; color:#7a8f7d; margin:0; }
.dash__cta { display:flex; align-items:center; gap:.5rem; background:#1a4d2e; color:#fff; border:none; border-radius:10px; padding:.7rem 1.4rem; font-size:.9rem; font-weight:600; cursor:pointer; transition:background .18s,transform .12s; white-space:nowrap; }
.dash__cta svg { width:16px; height:16px; }
.dash__cta:hover { background:#15603a; transform:translateY(-1px); }

/* ── STATS ── */
.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.75rem; }
.stat-card { display:flex; align-items:center; gap:1rem; background:#fff; border-radius:14px; padding:1.25rem 1.5rem; border:1px solid #e8ede8; box-shadow:0 1px 4px rgba(0,0,0,.04); transition:transform .15s,box-shadow .15s; }
.stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.07); }
.stat-card__icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.stat-card__icon svg { width:22px; height:22px; }
.stat-card--green .stat-card__icon { background:#dcfce7; color:#16a34a; }
.stat-card--teal .stat-card__icon  { background:#ccfbf1; color:#0d9488; }
.stat-card--slate .stat-card__icon { background:#f1f5f9; color:#475569; }
.stat-card__label { display:block; font-size:.78rem; color:#7a8f7d; font-weight:500; margin-bottom:.2rem; text-transform:uppercase; letter-spacing:.04em; }
.stat-card__value { display:block; font-size:2rem; font-weight:700; color:#1a2e1c; line-height:1; }

/* ── GRID ── */
.dash__grid { display:grid; grid-template-columns:1fr 360px; gap:1.25rem; align-items:start; }
.dash__left-col { display:flex; flex-direction:column; gap:1.25rem; }

/* ── PANEL ── */
.panel { background:#fff; border-radius:14px; border:1px solid #e8ede8; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.panel__head { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem 1rem; border-bottom:1px solid #f0f4f0; }
.panel__title { font-size:.95rem; font-weight:700; color:#1a2e1c; margin:0; display:flex; align-items:center; gap:8px; }
.panel__link { background:none; border:none; font-size:.82rem; color:#1a4d2e; font-weight:600; cursor:pointer; padding:0; }
.panel__link:hover { opacity:.7; }
.panel__empty { display:flex; flex-direction:column; align-items:center; padding:2.5rem 1.5rem; color:#9aad9d; text-align:center; }
.panel__empty svg { width:40px; height:40px; margin-bottom:.75rem; color:#c5d5c7; }
.panel__empty p { font-size:.9rem; line-height:1.6; margin:0 0 1rem; }
.btn-crear { background:#1a4d2e; color:#fff; border:none; border-radius:8px; padding:.55rem 1.2rem; font-size:.85rem; font-weight:600; cursor:pointer; }
.btn-crear:hover { background:#15603a; }

/* pub list */
.pub-list { padding:.5rem 0; }
.pub-item { display:flex; align-items:center; justify-content:space-between; padding:.9rem 1.5rem; border-bottom:1px solid #f5f7f5; transition:background .12s; gap:1rem; }
.pub-item:last-child { border-bottom:none; }
.pub-item:hover { background:#f9fbf9; }
.pub-item__info { display:flex; flex-direction:column; gap:.2rem; min-width:0; }
.pub-item__title { font-size:.9rem; font-weight:600; color:#1a2e1c; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pub-item__meta { display:flex; align-items:center; gap:.35rem; font-size:.76rem; color:#9aad9d; }
.sep { color:#c5d5c7; }
.pub-item__badge { font-size:.72rem; font-weight:600; padding:.25rem .7rem; border-radius:999px; flex-shrink:0; }
.badge--activa  { background:#dcfce7; color:#15803d; }
.badge--borrador { background:#f1f5f9; color:#64748b; }

/* ── NOTIF BADGE ── */
.notif-badge {
  background: #10b981;
  color: #fff;
  font-size: .65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: .03em;
}

/* ── NOTIF LIST ── */
.notif-list { padding: .5rem 0; }
.notif-item {
  display: flex;
  align-items: center;
  gap: .85rem;
  padding: .85rem 1.5rem;
  border-bottom: 1px solid #f5f7f5;
  transition: background .12s;
  animation: slideIn .3s ease both;
}
@keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f9fbf9; }

.notif-avatar {
  width: 36px; height: 36px; flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a3d2b, #10b981);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.notif-avatar svg { width: 18px; height: 18px; }

.notif-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.notif-titulo { font-size: .85rem; font-weight: 700; color: #1a2e1c; }
.notif-oferta { font-size: .78rem; color: #7a8f7d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-oferta strong { color: #1a4d2e; }
.notif-fecha { font-size: .7rem; color: #b0bab5; }

.notif-status { font-size: .65rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; flex-shrink: 0; text-transform: uppercase; letter-spacing: .04em; }
.notif-status--pending { background: #fef9c3; color: #a16207; }
.notif-status--ok      { background: #dcfce7; color: #15803d; }
.notif-status--no      { background: #fef2f2; color: #dc2626; }

/* ── ACCIONES RÁPIDAS ── */
.acciones { padding:.5rem 0; }
.accion { width:100%; display:flex; align-items:center; gap:1rem; padding:.9rem 1.25rem; background:none; border:none; border-bottom:1px solid #f5f7f5; cursor:pointer; text-align:left; transition:background .12s; }
.accion:last-child { border-bottom:none; }
.accion:hover { background:#f9fbf9; }
.accion__icon { width:38px; height:38px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.accion__icon svg { width:18px; height:18px; }
.accion__icon--green  { background:#dcfce7; color:#16a34a; }
.accion__icon--teal   { background:#ccfbf1; color:#0d9488; }
.accion__icon--blue   { background:#dbeafe; color:#2563eb; }
.accion__icon--purple { background:#ede9fe; color:#7c3aed; }
.accion__text { flex:1; display:flex; flex-direction:column; gap:.1rem; }
.accion__label { font-size:.88rem; font-weight:600; color:#1a2e1c; }
.accion__desc  { font-size:.76rem; color:#9aad9d; }
.accion__arrow { width:16px; height:16px; color:#c5d5c7; flex-shrink:0; }

/* ── RESPONSIVE ── */
@media(max-width:900px) {
  .dash { padding:1.25rem 1rem; }
  .stats { grid-template-columns:1fr 1fr; }
  .dash__grid { grid-template-columns:1fr; }
  .dash__name { font-size:1.5rem; }
}
@media(max-width:540px) { .stats { grid-template-columns:1fr; } }

/* ── BASE ── */
.dash {
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f4f6f3;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* ── SKELETON ── */
.dash__skeleton { display: flex; flex-direction: column; gap: 1.25rem; }
.sk-bar { height: 32px; border-radius: 8px; background: #e2e8e0; animation: pulse 1.4s ease-in-out infinite; }
.sk-bar--wide { width: 55%; }
.sk-bar--med { width: 70%; }
.sk-row { display: flex; gap: 1rem; }
.sk-card { flex: 1; height: 100px; border-radius: 12px; background: #e2e8e0; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }

/* ── HEADER ── */
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
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7c6e;
  letter-spacing: 0.03em;
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
.dash__sub {
  font-size: 0.92rem;
  color: #7a8f7d;
  margin: 0;
}
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

/* ── STATS ── */
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
  font-size: 0.78rem;
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

/* ── GRID ── */
.dash__grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.25rem;
  align-items: start;
}

/* ── PANEL ── */
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
.panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2e1c;
  margin: 0;
}
.panel__link {
  background: none;
  border: none;
  font-size: 0.82rem;
  color: #1a4d2e;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.panel__link:hover { opacity: 0.7; }

/* empty state */
.panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.5rem;
  color: #9aad9d;
  text-align: center;
}
.panel__empty svg { width: 40px; height: 40px; margin-bottom: 0.75rem; color: #c5d5c7; }
.panel__empty p { font-size: 0.9rem; line-height: 1.6; margin: 0 0 1rem; }
.btn-crear {
  background: #1a4d2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-crear:hover { background: #15603a; }

/* pub list */
.pub-list { padding: 0.5rem 0; }
.pub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #f5f7f5;
  transition: background 0.12s;
  gap: 1rem;
}
.pub-item:last-child { border-bottom: none; }
.pub-item:hover { background: #f9fbf9; }
.pub-item__info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.pub-item__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2e1c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pub-item__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #9aad9d;
}
.sep { color: #c5d5c7; }

.pub-item__badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.badge--activa  { background: #dcfce7; color: #15803d; }
.badge--borrador { background: #f1f5f9; color: #64748b; }

/* ── ACCIONES RÁPIDAS ── */
.acciones { padding: 0.5rem 0; }
.accion {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 1px solid #f5f7f5;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.accion:last-child { border-bottom: none; }
.accion:hover { background: #f9fbf9; }
.accion__icon {
  width: 38px; height: 38px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.accion__icon svg { width: 18px; height: 18px; }
.accion__icon--green  { background: #dcfce7; color: #16a34a; }
.accion__icon--teal   { background: #ccfbf1; color: #0d9488; }
.accion__icon--blue   { background: #dbeafe; color: #2563eb; }
.accion__icon--purple { background: #ede9fe; color: #7c3aed; }
.accion__text { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.accion__label { font-size: 0.88rem; font-weight: 600; color: #1a2e1c; }
.accion__desc  { font-size: 0.76rem; color: #9aad9d; }
.accion__arrow { width: 16px; height: 16px; color: #c5d5c7; flex-shrink: 0; }

/* ── RESPONSIVE ── */
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