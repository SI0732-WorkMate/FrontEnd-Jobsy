<script>
import Chart from 'primevue/chart';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: 'Analiticas',
  components: { Chart },
  data() {
    return {
      publicaciones: [],
      isLoading: true,
      chartData1: { labels: [], datasets: [{ label: 'Postulaciones', backgroundColor: ['#10b981', '#059669', '#006c49', '#34d399', '#6ee7b7'], borderRadius: 8, borderSkipped: false, data: [] }] },
      chartData2: { labels: [], datasets: [{ label: 'Estado', backgroundColor: ['#6366f1', '#4f46e5', '#4338ca', '#818cf8', '#a5b4fc'], borderRadius: 8, borderSkipped: false, data: [] }] },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a3d2b', padding: 12, cornerRadius: 10,
            titleFont: { family: 'Sora, sans-serif', size: 13, weight: 'bold' },
            bodyFont: { family: 'DM Sans, sans-serif', size: 13 }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'DM Sans, sans-serif', weight: '500', size: 12 }, color: '#6b7280' }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: '#f3f4f6', drawTicks: false }, ticks: { font: { family: 'DM Sans, sans-serif', size: 11 }, color: '#9ca3af', padding: 10, stepSize: 1 }, border: { display: false, dash: [4, 4] } }
        }
      }
    };
  },
  computed: {
    totalPostulaciones() {
      return this.publicaciones.reduce((sum, p) => sum + p.application_count, 0);
    },
    totalPublicaciones() {
      return this.publicaciones.length;
    },
    publicacionMasPopular() {
      if (!this.publicaciones.length) return '—';
      return [...this.publicaciones].sort((a, b) => b.application_count - a.application_count)[0]?.title || '—';
    }
  },
  methods: {
    async cargarAnaliticas() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/applications/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        this.publicaciones = data;

        const labels = data.map(p => p.title);
        const appCounts = data.map(p => p.application_count);
        // Para el segundo gráfico usamos el número de postulaciones también
        // pero diferenciando activas vs inactivas visualmente
        const activeCounts = data.map(p => p.status === 'Activa' ? p.application_count : 0);

        this.chartData1 = { ...this.chartData1, labels, datasets: [{ ...this.chartData1.datasets[0], data: appCounts }] };
        this.chartData2 = { ...this.chartData2, labels, datasets: [{ ...this.chartData2.datasets[0], data: activeCounts }] };
      } catch (error) {
        console.error("Error al cargar analíticas:", error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() { this.cargarAnaliticas(); }
};
</script>

<template>
  <div class="analiticas-wrapper">

    <!-- Cabecera -->
    <div class="analiticas-header">
      <div>
        <h2 class="titulo">Rendimiento y Analíticas</h2>
        <p class="subtitulo">Datos reales de tus publicaciones de empleo.</p>
      </div>
      <span class="chip-live">
        <span class="dot-pulse"></span>
        Datos en tiempo real
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando analíticas...</p>
    </div>

    <template v-else>

      <!-- KPIs -->
      <div class="kpis-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total Publicaciones</span>
          <span class="kpi-value">{{ totalPublicaciones }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Postulaciones</span>
          <span class="kpi-value kpi-value--green">{{ totalPostulaciones }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Más Popular</span>
          <span class="kpi-value kpi-value--sm">{{ publicacionMasPopular }}</span>
        </div>
      </div>

      <!-- Sin datos -->
      <div v-if="publicaciones.length === 0" class="empty-state">
        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <p>Aún no tienes publicaciones. ¡Crea una oferta para ver tus analíticas!</p>
      </div>

      <!-- Gráficos -->
      <div v-else class="charts-grid">

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-icon chart-icon--green">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="chart-label">Volumen de Candidatos</p>
              <h3 class="chart-titulo">Postulaciones por Publicación</h3>
            </div>
          </div>
          <div class="chart-container">
            <Chart type="bar" :data="chartData1" :options="chartOptions" class="chart-inner" />
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-icon chart-icon--indigo">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="chart-label">Ofertas Activas</p>
              <h3 class="chart-titulo">Postulaciones en Ofertas Activas</h3>
            </div>
          </div>
          <div class="chart-container">
            <Chart type="bar" :data="chartData2" :options="chartOptions" class="chart-inner" />
          </div>
        </div>

      </div>

      <!-- Tabla resumen -->
      <div v-if="publicaciones.length > 0" class="tabla-card">
        <h3 class="tabla-titulo">Resumen por Publicación</h3>
        <div class="tabla-inner">
          <div class="tabla-head">
            <span>Título</span>
            <span>Estado</span>
            <span>Postulaciones</span>
          </div>
          <div v-for="p in publicaciones" :key="p.job_offer_id" class="tabla-row">
            <span class="row-title">{{ p.title }}</span>
            <span class="chip" :class="p.status === 'Activa' ? 'chip--green' : 'chip--gray'">{{ p.status }}</span>
            <span class="row-count">{{ p.application_count }}</span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.analiticas-wrapper { font-family: 'Sora', sans-serif; padding: 2rem 2.5rem; }

.analiticas-header {
  display: flex; flex-direction: column; gap: 16px;
  margin-bottom: 28px; padding-bottom: 24px;
  border-bottom: 1.5px solid #e5e7eb;
}
@media (min-width: 768px) {
  .analiticas-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
}

.titulo { font-size: 2rem; font-weight: 800; color: #111827; margin: 0 0 6px 0; letter-spacing: -0.02em; }
.subtitulo { font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: #6b7280; margin: 0; }

.chip-live {
  display: inline-flex; align-items: center; gap: 8px;
  background: #f5f4f0; border: 1.5px solid #e5e7eb;
  border-radius: 999px; padding: 8px 18px;
  font-size: 0.72rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;
}
.dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

/* KPIs */
.kpis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px;
  padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.kpi-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
.kpi-value { font-size: 2rem; font-weight: 800; color: #111827; }
.kpi-value--green { color: #10b981; }
.kpi-value--sm { font-size: 1rem; font-weight: 700; color: #111827; }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 4rem; color: #6b7280; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #0a3d2b; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 4rem; color: #9ca3af; text-align: center; background: #fff; border-radius: 16px; border: 1.5px solid #e5e7eb; }

/* Charts */
.charts-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 24px; }
@media (min-width: 1280px) { .charts-grid { grid-template-columns: 1fr 1fr; } }

.chart-card {
  background: #fff; border-radius: 20px; padding: 28px;
  border: 1.5px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,.05);
  display: flex; flex-direction: column; gap: 24px;
  transition: box-shadow 0.25s, border-color 0.25s;
}
.chart-card:hover { box-shadow: 0 8px 28px rgba(10,61,43,.09); border-color: rgba(16,185,129,.2); }
.chart-card-header { display: flex; align-items: center; gap: 14px; }
.chart-icon { width: 48px; height: 48px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chart-icon--green { background: rgba(16,185,129,.1); border: 1.5px solid rgba(16,185,129,.25); color: #10b981; }
.chart-icon--indigo { background: rgba(99,102,241,.1); border: 1.5px solid rgba(99,102,241,.25); color: #6366f1; }
.chart-label { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin: 0 0 4px 0; }
.chart-titulo { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.chart-container { position: relative; height: 280px; width: 100%; }
.chart-inner { height: 100%; width: 100%; }

/* Tabla resumen */
.tabla-card { background: #fff; border-radius: 20px; padding: 24px; border: 1.5px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,.05); }
.tabla-titulo { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 16px 0; }
.tabla-inner { display: flex; flex-direction: column; gap: 8px; }
.tabla-head { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; padding: 8px 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
.tabla-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px; align-items: center; padding: 12px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; transition: background 0.15s; }
.tabla-row:hover { background: #f0fdf4; }
.row-title { font-size: 0.88rem; font-weight: 600; color: #111827; }
.row-count { font-size: 1rem; font-weight: 700; color: #10b981; }
.chip { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; }
.chip--green { background: #dcfce7; color: #15803d; }
.chip--gray { background: #f3f4f6; color: #6b7280; }
</style>