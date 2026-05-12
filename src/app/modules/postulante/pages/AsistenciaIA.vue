<script>
import { getJobBoardData } from '../services/JobBoard.service.js'

const API_URL = 'http://localhost:5195/api'

export default {
  name: 'AsistenciaIA',
  data() {
    return {
      pdfFile: null,
      pdfError: '',
      ofertaId: '',
      ofertas: [],
      resultado: null,
      loading: false,
      loadingStep: ''
    }
  },
  computed: {
    ofertaSeleccionada() {
      return this.ofertas.find(o => o.id === this.ofertaId)
    },
    canAnalizar() {
      return this.pdfFile && this.ofertaId && !this.pdfError
    }
  },
  methods: {
    async cargarOfertas() {
      try {
        const todas = await getJobBoardData()
        this.ofertas = todas.filter(o => o.status === 0 || o.status === 'Activa')
      } catch {
        this.ofertas = []
      }
    },

    onPdfChange(e) {
      const file = e.target.files[0]
      this.pdfError = ''
      this.pdfFile = null
      if (!file) return
      if (file.type !== 'application/pdf') {
        this.pdfError = 'Solo se aceptan archivos PDF.'
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.pdfError = `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 5 MB.`
        return
      }
      this.pdfFile = file
    },

    async evaluarCV() {
      if (!this.canAnalizar) return
      this.loading = true
      this.resultado = null

      try {
        const token = localStorage.getItem('token')
        const oferta = this.ofertaSeleccionada

        this.loadingStep = 'extracting'
        const formData = new FormData()
        formData.append('file', this.pdfFile)
        formData.append('offerTitle', oferta?.title || '')
        formData.append('offerDescription', oferta?.description || '')
        formData.append('offerRequirements', oferta?.requirements || '')
        formData.append('viewerRole', 'candidate')

        this.loadingStep = 'analyzing'

        const res = await fetch(`${API_URL}/document/analyze-cv`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })

        const data = await res.json()
        this.resultado = res.ok ? data.result : `❌ ${data.error || 'Error al procesar el CV.'}`

      } catch (e) {
        this.resultado = '❌ Error al conectar con el backend. Verifica que esté corriendo.'
        console.error(e)
      } finally {
        this.loading = false
        this.loadingStep = ''
      }
    },

    limpiar() {
      this.pdfFile = null
      this.pdfError = ''
      this.ofertaId = ''
      this.resultado = null
    },

    formatMarkdown(text) {
      if (!text) return ''
      return text
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
          .replace(/\n\n/g, '<br><br>')
          .replace(/\n/g, '<br>')
    }
  },
  mounted() {
    this.cargarOfertas()
  }
}
</script>

<template>
  <div class="ai-page">

    <!-- HEADER -->
    <div class="ai-header">
      <div class="ai-header__left">
        <div class="ai-icon-box">
          <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
          </svg>
        </div>
        <div>
          <h1 class="ai-title">Asistencia IA</h1>
          <p class="ai-sub">Descubre si tu CV es apto para la oferta que te interesa</p>
        </div>
      </div>
      <div class="ai-badge">
        <span class="ai-badge__dot"></span>
        <span>Powered by Claude AI</span>
      </div>
    </div>

    <!-- PANEL PRINCIPAL -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-emoji">📋</span>
        <div>
          <h2 class="panel-title">Evalúa tu CV contra una oferta</h2>
          <p class="panel-desc">Elige la oferta que te interesa, sube tu CV en PDF y la IA te dirá si eres apto, tus fortalezas y qué mejorar</p>
        </div>
      </div>

      <div class="form-grid">

        <!-- Selector de oferta -->
        <div class="field">
          <label class="field-label">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Oferta de trabajo
          </label>
          <select v-model="ofertaId" class="field-select">
            <option value="" disabled>Elige la oferta que te interesa...</option>
            <option v-for="o in ofertas" :key="o.id" :value="o.id">
              {{ o.title }}{{ o.location ? ` — ${o.location}` : '' }}
            </option>
          </select>
          <p v-if="ofertas.length === 0" class="field-warn">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            No hay ofertas disponibles en este momento
          </p>

          <!-- Preview oferta -->
          <div v-if="ofertaSeleccionada" class="oferta-preview">
            <div class="oferta-preview__head">
              <span class="oferta-preview__titulo">{{ ofertaSeleccionada.title }}</span>
              <span class="badge-activa">Activa</span>
            </div>
            <p class="oferta-preview__desc">
              {{ ofertaSeleccionada.description?.slice(0, 220) }}{{ (ofertaSeleccionada.description?.length || 0) > 220 ? '…' : '' }}
            </p>
            <div class="oferta-preview__meta">
              <span v-if="ofertaSeleccionada.location">📍 {{ ofertaSeleccionada.location }}</span>
              <span v-if="ofertaSeleccionada.salary_range">💰 S/. {{ ofertaSeleccionada.salary_range }}</span>
            </div>
          </div>
        </div>

        <!-- Upload PDF -->
        <div class="field">
          <label class="field-label">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Tu CV (PDF)
          </label>
          <label class="upload-zone" :class="{ 'upload-zone--ok': pdfFile, 'upload-zone--err': pdfError }">
            <input type="file" accept="application/pdf" @change="onPdfChange" class="u-hidden" />
            <template v-if="!pdfFile">
              <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="upload-main">Sube tu CV en PDF</span>
              <span class="upload-sub">Máx. 5 MB · Solo .pdf</span>
            </template>
            <template v-else>
              <svg width="26" height="26" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="upload-main upload-main--ok">{{ pdfFile.name }}</span>
              <span class="upload-sub">{{ (pdfFile.size / 1024 / 1024).toFixed(2) }} MB · listo para analizar</span>
            </template>
          </label>
          <p v-if="pdfError" class="field-error">⚠ {{ pdfError }}</p>
          <button v-if="pdfFile" @click="limpiar" class="btn-clear">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cambiar archivo
          </button>
        </div>

      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-steps">
        <div class="loading-step" :class="{ active: loadingStep === 'extracting', done: loadingStep === 'analyzing' }">
          <div class="step-dot"></div>
          <span>Leyendo tu CV...</span>
        </div>
        <div class="loading-step" :class="{ active: loadingStep === 'analyzing' }">
          <div class="step-dot"></div>
          <span>Analizando compatibilidad con la oferta...</span>
        </div>
      </div>

      <!-- Botón -->
      <button v-if="!loading" @click="evaluarCV" :disabled="!canAnalizar" class="btn-run">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
        </svg>
        Analizar mi CV con IA
      </button>

      <!-- Resultado -->
      <div v-if="resultado" class="resultado-box">
        <div class="resultado-header">
          <div class="resultado-avatar">📊</div>
          <div>
            <h4 class="resultado-titulo">Resultado del análisis</h4>
            <span class="resultado-oferta">{{ ofertaSeleccionada?.title }}</span>
          </div>
        </div>
        <div class="resultado-body" v-html="formatMarkdown(resultado)"></div>
        <div class="resultado-footer">
          <button @click="limpiar" class="btn-nueva">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Evaluar con otra oferta
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.ai-page { font-family: 'DM Sans', sans-serif; max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem; padding-bottom: 4rem; }

/* HEADER */
.ai-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1.5px solid #e5e7eb; }
.ai-header__left { display: flex; align-items: center; gap: 1rem; }
.ai-icon-box { width: 56px; height: 56px; flex-shrink: 0; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1.5px solid rgba(16,185,129,.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #10b981; box-shadow: 0 4px 14px rgba(16,185,129,.15); }
.ai-title { font-family: 'Sora', sans-serif; font-size: clamp(1.4rem,3vw,2rem); font-weight: 800; color: #111827; margin: 0 0 3px; letter-spacing: -.02em; }
.ai-sub { font-size: .87rem; color: #6b7280; margin: 0; }
.ai-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #e5e7eb; padding: 7px 14px; border-radius: 99px; font-size: .75rem; font-weight: 600; color: #6b7280; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.ai-badge__dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }

/* PANEL */
.panel { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 22px; box-shadow: 0 4px 20px rgba(0,0,0,.05); }
.panel-header { display: flex; align-items: flex-start; gap: 14px; }
.panel-emoji { font-size: 2rem; line-height: 1; flex-shrink: 0; }
.panel-title { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.panel-desc { font-size: .85rem; color: #6b7280; margin: 0; line-height: 1.6; }

/* FORM */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label { display: flex; align-items: center; gap: 6px; font-size: .78rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .05em; }
.field-select { width: 100%; padding: 11px 36px 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: .9rem; color: #111827; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center; appearance: none; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.field-select:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.12); }
.field-warn { display: flex; align-items: center; gap: 6px; font-size: .78rem; font-weight: 500; color: #d97706; background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 8px; margin: 0; }
.field-error { font-size: .78rem; color: #dc2626; font-weight: 500; margin: 0; }

/* Preview oferta */
.oferta-preview { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.oferta-preview__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.oferta-preview__titulo { font-weight: 700; font-size: .88rem; color: #111827; }
.badge-activa { background: #dcfce7; color: #15803d; font-size: .65rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; letter-spacing: .04em; flex-shrink: 0; }
.oferta-preview__desc { font-size: .8rem; color: #6b7280; line-height: 1.5; margin: 0; }
.oferta-preview__meta { display: flex; gap: 12px; font-size: .78rem; color: #9ca3af; flex-wrap: wrap; }

/* Upload */
.upload-zone { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 30px 20px; border: 2px dashed #d1d5db; border-radius: 14px; cursor: pointer; text-align: center; color: #9ca3af; background: #fafafa; transition: all .2s; }
.upload-zone:hover { border-color: #10b981; background: #f0fdf4; color: #10b981; }
.upload-zone--ok { border-style: solid; border-color: #10b981; background: #f0fdf4; }
.upload-zone--err { border-color: #dc2626; background: #fef2f2; }
.u-hidden { display: none; }
.upload-main { font-weight: 600; font-size: .9rem; color: #374151; }
.upload-main--ok { color: #10b981; }
.upload-sub { font-size: .75rem; color: #9ca3af; }
.btn-clear { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; padding: 0; font-size: .78rem; color: #9ca3af; cursor: pointer; transition: color .15s; }
.btn-clear:hover { color: #dc2626; }

/* Loading */
.loading-steps { display: flex; flex-direction: column; gap: 10px; padding: 16px; background: #f9fafb; border-radius: 12px; }
.loading-step { display: flex; align-items: center; gap: 12px; font-size: .85rem; color: #9ca3af; }
.loading-step.active { color: #10b981; font-weight: 600; }
.loading-step.done { color: #d1d5db; }
.step-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0; }
.loading-step.active .step-dot { border-color: #10b981; background: #10b981; animation: pulse-dot 1s infinite; }
.loading-step.done .step-dot { background: #d1d5db; border-color: #d1d5db; }

/* Botón */
.btn-run { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 13px 24px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 14px; font-family: 'Sora', sans-serif; font-size: .95rem; font-weight: 700; cursor: pointer; transition: all .2s; box-shadow: 0 4px 14px rgba(16,185,129,.35); width: 100%; }
.btn-run:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,.4); }
.btn-run:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }

/* Resultado */
.resultado-box { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
.resultado-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: #fff; border-bottom: 1.5px solid #e5e7eb; }
.resultado-avatar { width: 42px; height: 42px; font-size: 1.3rem; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1.5px solid rgba(16,185,129,.3); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.resultado-titulo { font-family: 'Sora', sans-serif; font-weight: 700; font-size: .95rem; color: #111827; margin: 0; }
.resultado-oferta { font-size: .78rem; color: #6b7280; }
.resultado-body { padding: 20px; font-size: .9rem; line-height: 1.75; color: #374151; }
.resultado-body :deep(h2) { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 800; color: #111827; margin: 1.2em 0 .5em; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
.resultado-body :deep(h3) { font-family: 'Sora', sans-serif; font-size: .92rem; font-weight: 700; color: #1a4d2e; margin: 1em 0 .4em; }
.resultado-body :deep(ul) { padding-left: 1.2em; margin: .5em 0; }
.resultado-body :deep(li) { margin: .35em 0; }
.resultado-body :deep(strong) { font-weight: 700; color: #111827; }
.resultado-footer { padding: 0 20px 18px; }
.btn-nueva { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1.5px solid #e5e7eb; color: #6b7280; border-radius: 10px; padding: 8px 16px; font-size: .82rem; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-nueva:hover { border-color: #10b981; color: #10b981; }
</style>