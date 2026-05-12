<script>
import axios from 'axios'

const API_URL = 'import.meta.env.VITE_API_URL/api'

export default {
  name: 'AsitenciaAI',
  data() {
    return {
      modo: 'score',
      score: {
        pdfFile: null,
        pdfError: '',
        oferta: null,
        ofertas: [],
        resultado: null,
        loading: false,
        loadingStep: ''
      },
      suggest: {
        oferta: null,
        misOfertas: [],
        candidatos: [],
        resultado: null,
        loading: false
      }
    }
  },
  computed: {
    modos() {
      return [
        { key: 'score',     label: 'Puntuar CV',          icon: '📊', desc: 'Evalúa un CV contra una oferta' },
        { key: 'suggest',   label: 'Sugerencia de Evaluación', icon: '🎙️', desc: 'Cómo entrevistar a tus postulantes' }
      ]
    }
  },
  methods: {
    // ── Carga inicial ──────────────────────────────
    async cargarDatos() {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const myId = Number(user.id) // forzar número para comparación segura

        const [offersRes, appsRes] = await Promise.all([
          axios.get(`${API_URL}/joboffers`, { headers }),
          axios.get(`${API_URL}/applications/my-offers`, { headers }).catch(() => ({ data: [] }))
        ])

        const todasOfertas = offersRes.data || []
        const misOfertas = todasOfertas.filter(o => Number(o.employer_id) === myId)

        this.score.ofertas = misOfertas
        this.suggest.misOfertas = misOfertas
        this.suggest.candidatos = appsRes.data || []

        console.log(`Cargado: ${misOfertas.length} mis ofertas de ${todasOfertas.length} total | myId: ${myId}`)
      } catch (e) {
        console.error('Error cargando datos:', e)
      }
    },

    // ── Validación PDF ─────────────────────────────
    onPdfChange(e) {
      const file = e.target.files[0]
      this.score.pdfError = ''
      this.score.pdfFile = null
      if (!file) return

      if (file.type !== 'application/pdf') {
        this.score.pdfError = 'Solo se aceptan archivos PDF.'
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        this.score.pdfError = `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 5 MB.`
        return
      }
      this.score.pdfFile = file
    },

    // ── US012: Puntuar CV → via backend ───────────
    async puntuarCV() {
      if (!this.score.pdfFile || !this.score.oferta) return
      this.score.loading = true
      this.score.resultado = null

      try {
        const token = localStorage.getItem('token')
        const oferta = this.score.ofertas.find(o => o.id === this.score.oferta)

        this.score.loadingStep = 'extracting'

        const formData = new FormData()
        formData.append('file', this.score.pdfFile)
        formData.append('offerTitle', oferta?.title || '')
        formData.append('offerDescription', oferta?.description || '')
        formData.append('offerRequirements', oferta?.requirements || '')
        formData.append('viewerRole', 'recruiter')

        this.score.loadingStep = 'analyzing'

        const res = await fetch(`${API_URL}/document/analyze-cv`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })

        const data = await res.json()

        if (!res.ok) {
          this.score.resultado = `❌ ${data.error || 'Error al procesar el CV.'}`
          return
        }

        this.score.resultado = data.result

      } catch (e) {
        this.score.resultado = '❌ Error al conectar con el backend. Verifica que esté corriendo.'
        console.error(e)
      } finally {
        this.score.loading = false
        this.score.loadingStep = ''
      }
    },

    // ── US011: Recomendar vacantes → via backend ──
    async sugerirCandidatos() {
      if (!this.suggest.oferta) return
      this.suggest.loading = true
      this.suggest.resultado = null

      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        const oferta = this.suggest.misOfertas.find(o => o.id === this.suggest.oferta)
        const candidatosFiltrados = this.suggest.candidatos
            .filter(c => c.job_offer_id === this.suggest.oferta)

        const totalCandidatos = candidatosFiltrados.length

        if (totalCandidatos === 0) {
          this.suggest.resultado = `## Sin postulantes aún\n\nNo hay candidatos postulados a **${oferta?.title}** todavía.\n\nCompartí la vacante para empezar a recibir postulaciones.`
          return
        }

        // Traer nombre real de cada candidato
        const candidatosConNombre = await Promise.all(
            candidatosFiltrados.map(async (c, i) => {
              let nombre = `Candidato ${i + 1}`
              try {
                const res = await axios.get(`${API_URL}/User/${c.candidate_id}`, { headers })
                nombre = res.data?.name || nombre
              } catch {}

              const estadoLabel = c.status === 'accepted' ? 'Aceptado'
                  : c.status === 'rejected' ? 'Rechazado'
                      : 'Pendiente'

              const fechaPostulacion = c.application_date
                  ? new Date(c.application_date).toLocaleDateString('es-PE')
                  : 'No disponible'

              return `- ${nombre} | Estado: ${estadoLabel} | Postulado: ${fechaPostulacion} | CV: ${c.cv_url || 'No disponible'}`
            })
        )

        const listaCandidatos = candidatosConNombre.join('\n')

        const prompt = `Eres un consultor experto en procesos de selección de personal.
Tu tarea es generar una guía de entrevista profesional para el reclutador.

REGLAS:
1. Hay EXACTAMENTE ${totalCandidatos} postulante(s). No inventes más.
2. Usa los nombres reales de la lista. Nunca uses IDs.
3. NO analices ni supongas habilidades de los candidatos — no tienes su CV.
4. Enfócate en CÓMO evaluar, no en quién es mejor.
5. Responde en español, tono profesional y directo.

FORMATO EXACTO:

## Guía de Evaluación — ${oferta?.title}

### 📋 Postulantes a entrevistar (${totalCandidatos})
[Lista cada postulante con su nombre y fecha de postulación. Sin juicios.]

### 🎯 Preguntas clave para la entrevista
[5 a 7 preguntas específicas para el puesto "${oferta?.title}". Que revelen competencias reales.]

### ✅ Criterios de evaluación
[4 criterios concretos para puntuar a cada candidato durante la entrevista. Sin mencionar sus CVs.]

### 🗓️ Orden de entrevistas sugerido
[Sugiere el orden en que entrevistarlos basado en fecha de postulación, y cuánto tiempo dedicar a cada uno.]

### 💬 Cierre recomendado
[1 párrafo breve: qué comunicarles al finalizar la entrevista y cuándo dar feedback.]

---
OFERTA: ${oferta?.title}
DESCRIPCIÓN: ${oferta?.description || "Sin descripción"}
POSTULANTES:
${listaCandidatos}\`
[Preguntas clave según el puesto]

OFERTA LABORAL:
Título: ${oferta?.title}
Descripción: ${oferta?.description}

CANDIDATOS POSTULADOS (${totalCandidatos} en total, no hay más):
${listaCandidatos}`

        const res = await fetch(`${API_URL}/document/ask-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ prompt })
        })

        const data = await res.json()
        this.suggest.resultado = res.ok ? data.result : `❌ ${data.error}`

      } catch {
        this.suggest.resultado = '❌ Error al conectar con la IA.'
      } finally {
        this.suggest.loading = false
      }
    },

    // ── Renderizar Markdown básico ─────────────────
    formatMarkdown(text) {
      if (!text) return ''
      return text
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          // Convertir tablas Markdown a HTML
          .replace(/^\|(.+)\|$/gm, (_, row) => {
            const cells = row.split('|').map(c => c.trim())
            return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>'
          })
          .replace(/(<tr>.*<\/tr>\n?)+/gs, match => {
            const rows = match.trim().split('\n').filter(r => !r.match(/^<tr><td>[-| ]+<\/td><\/tr>$/))
            if (rows.length === 0) return ''
            const [header, ...body] = rows
            const headerHtml = header.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')
            return `<table>${headerHtml}${body.join('')}</table>`
          })
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
          .replace(/\n\n/g, '<br><br>')
          .replace(/\n/g, '<br>')
    },
  },
  mounted() {
    this.cargarDatos()
  }
}
</script>

<template>
  <div class="ai-page">

    <!-- Header -->
    <div class="ai-header">
      <div class="ai-header__left">
        <div class="ai-icon-box">
          <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
          </svg>
        </div>
        <div>
          <h1 class="ai-title">Asistencia IA</h1>
          <p class="ai-sub">Inteligencia artificial para optimizar tu proceso de reclutamiento</p>
        </div>
      </div>
      <div class="ai-badge">
        <span class="ai-badge__dot"></span>
        <span>Powered by Gemini AI</span>
      </div>
    </div>

    <!-- Selector de modo -->
    <div class="modo-grid">
      <button
          v-for="m in modos" :key="m.key"
          @click="modo = m.key"
          class="modo-card"
          :class="{ 'modo-card--active': modo === m.key }"
      >
        <span class="modo-emoji">{{ m.icon }}</span>
        <div class="modo-info">
          <span class="modo-label">{{ m.label }}</span>
          <span class="modo-desc">{{ m.desc }}</span>
        </div>
        <div v-if="modo === m.key" class="modo-check">✓</div>
      </button>
    </div>

    <!-- ══ US012: Puntuar CV ══ -->
    <div v-if="modo === 'score'" class="panel">
      <div class="panel-header">
        <span class="panel-emoji">📊</span>
        <div>
          <h2 class="panel-title">Puntaje automático de CV</h2>
          <p class="panel-desc">Sube el CV en PDF y selecciona la oferta para obtener una evaluación IA</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label">Oferta a comparar</label>
          <select v-model="score.oferta" class="field-select">
            <option value="" disabled selected>Elige una oferta laboral...</option>
            <option v-for="o in score.ofertas" :key="o.id" :value="o.id">{{ o.title }}</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">CV del candidato (PDF)</label>
          <label class="upload-zone" :class="{ 'upload-zone--ok': score.pdfFile, 'upload-zone--error': score.pdfError }">
            <input type="file" accept="application/pdf" @change="onPdfChange" class="u-hidden" />
            <template v-if="!score.pdfFile">
              <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="upload-main">Sube el CV en PDF</span>
              <span class="upload-sub">Máx. 5 MB · Solo .pdf</span>
            </template>
            <template v-else>
              <svg width="22" height="22" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <span class="upload-main upload-main--ok">{{ score.pdfFile.name }}</span>
                <span class="upload-sub">{{ (score.pdfFile.size / 1024 / 1024).toFixed(2) }} MB · listo para analizar</span>
              </div>
            </template>
          </label>
          <p v-if="score.pdfError" class="field-error">⚠ {{ score.pdfError }}</p>
        </div>
      </div>

      <div v-if="score.loading" class="loading-steps">
        <div class="loading-step" :class="{ 'loading-step--active': score.loadingStep === 'extracting', 'loading-step--done': score.loadingStep === 'analyzing' }">
          <div class="step-dot"></div>
          <span>Extrayendo texto del PDF...</span>
        </div>
        <div class="loading-step" :class="{ 'loading-step--active': score.loadingStep === 'analyzing' }">
          <div class="step-dot"></div>
          <span>Analizando con Gemini AI...</span>
        </div>
      </div>

      <button
          v-if="!score.loading"
          @click="puntuarCV"
          :disabled="!score.pdfFile || !score.oferta || !!score.pdfError"
          class="btn-run"
      >
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
        </svg>
        Evaluar CV con IA
      </button>

      <div v-if="score.resultado" class="resultado-box resultado-box--score">
        <div class="resultado-header">
          <div class="resultado-avatar">📊</div>
          <h4>Resultado del análisis</h4>
        </div>
        <div class="resultado-texto" v-html="formatMarkdown(score.resultado)"></div>
      </div>
    </div>

    <!-- ══ US010: Sugerir candidatos ══ -->
    <div v-if="modo === 'suggest'" class="panel">
      <div class="panel-header">
        <span class="panel-emoji">🎙️</span>
        <div>
          <h2 class="panel-title">Sugerencia de evaluación</h2>
          <p class="panel-desc">Selecciona tu oferta y obtén una guía profesional para entrevistar a tus postulantes</p>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Tu oferta laboral</label>
        <select v-model="suggest.oferta" class="field-select">
          <option value="" disabled selected>Selecciona una de tus ofertas...</option>
          <option v-for="o in suggest.misOfertas" :key="o.id" :value="o.id">
            {{ o.title }} ({{ suggest.candidatos.filter(c => c.job_offer_id === o.id).length }} postulantes)
          </option>
        </select>
        <div v-if="suggest.misOfertas.length === 0" class="field-hint field-hint--warn">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          No tienes ofertas publicadas aún
        </div>
      </div>

      <button
          @click="sugerirCandidatos"
          :disabled="suggest.loading || !suggest.oferta"
          class="btn-run btn-run--dark"
      >
        <svg v-if="!suggest.loading" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <div v-else class="btn-spinner"></div>
        {{ suggest.loading ? 'Generando guía de entrevista...' : 'Generar guía de entrevista' }}
      </button>

      <div v-if="suggest.resultado" class="resultado-box resultado-box--dark">
        <div class="resultado-header">
          <div class="resultado-avatar resultado-avatar--dark">🎙️</div>
          <h4>Guía de evaluación</h4>
        </div>
        <div class="resultado-texto" v-html="formatMarkdown(suggest.resultado)"></div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.ai-page {
  font-family: 'DM Sans', sans-serif;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding-bottom: 4rem;
}

.ai-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1.5px solid #e5e7eb;
}
.ai-header__left { display: flex; align-items: center; gap: 1rem; }
.ai-icon-box {
  width: 56px; height: 56px; flex-shrink: 0;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1.5px solid rgba(16,185,129,0.3);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: #10b981;
  box-shadow: 0 4px 14px rgba(16,185,129,0.15);
}
.ai-title { font-family: 'Sora', sans-serif; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; color: #111827; letter-spacing: -0.02em; margin: 0 0 4px; }
.ai-sub { font-size: 0.88rem; color: #6b7280; margin: 0; }
.ai-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1.5px solid #e5e7eb; padding: 7px 14px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: #6b7280; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.ai-badge__dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: pulse-green 2s infinite; }
@keyframes pulse-green { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

.modo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.modo-card { display: flex; align-items: center; gap: 12px; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px; padding: 16px 18px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); position: relative; }
.modo-card:hover { border-color: rgba(16,185,129,0.4); box-shadow: 0 4px 16px rgba(10,61,43,0.08); }
.modo-card--active { background: #ecfdf5; border-color: #10b981; box-shadow: 0 4px 16px rgba(16,185,129,0.15); }
.modo-emoji { font-size: 1.6rem; flex-shrink: 0; }
.modo-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.modo-label { font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700; color: #111827; }
.modo-desc { font-size: 0.72rem; color: #6b7280; }
.modo-check { width: 22px; height: 22px; border-radius: 50%; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }

.panel { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; box-shadow: 0 4px 20px rgba(10,61,43,0.06); animation: fadeUp 0.3s ease both; }
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.panel-header { display: flex; align-items: flex-start; gap: 14px; }
.panel-emoji { font-size: 2rem; flex-shrink: 0; margin-top: 2px; }
.panel-title { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.panel-desc { font-size: 0.88rem; color: #6b7280; margin: 0; }

.form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.72rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; }
.field-select { width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: #111827; outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
.field-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.field-textarea { width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 14px; font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: #111827; outline: none; resize: vertical; line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
.field-textarea:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.field-textarea::placeholder { color: #b0bab5; }
.field-hint { display: flex; align-items: center; gap: 5px; font-size: 0.76rem; color: #6b7280; }
.field-hint--warn { color: #b45309; }

.btn-run { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #0a3d2b; color: #fff; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700; border: none; border-radius: 12px; padding: 13px 24px; cursor: pointer; align-self: flex-start; box-shadow: 0 4px 14px rgba(10,61,43,0.28); transition: background 0.2s, transform 0.15s; }
.btn-run:hover { background: #10b981; transform: translateY(-1px); }
.btn-run:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-run--teal { background: #0891b2; box-shadow: 0 4px 14px rgba(8,145,178,0.28); }
.btn-run--teal:hover { background: #06b6d4; }
.btn-run--dark { background: #1e293b; box-shadow: 0 4px 14px rgba(30,41,59,0.28); }
.btn-run--dark:hover { background: #334155; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.resultado-box { border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 14px; animation: fadeUp 0.3s ease both; }
.resultado-box--score { background: rgba(16,185,129,0.05); border: 1.5px solid rgba(16,185,129,0.2); }
.resultado-box--teal  { background: rgba(8,145,178,0.05);  border: 1.5px solid rgba(8,145,178,0.2); }
.resultado-box--dark  { background: rgba(30,41,59,0.04);   border: 1.5px solid rgba(30,41,59,0.15); }
.resultado-header { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.07); }
.resultado-avatar { width: 40px; height: 40px; border-radius: 12px; background: #10b981; color: #fff; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
.resultado-avatar--teal { background: #0891b2; }
.resultado-avatar--dark { background: #1e293b; }
.resultado-header h4 { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }
.resultado-texto { font-family: 'DM Sans', sans-serif; font-size: 0.92rem; color: #374151; line-height: 1.75; }
.resultado-texto :deep(h2) { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: #111827; margin: 1rem 0 0.5rem; }
.resultado-texto :deep(h3) { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0a3d2b; margin: 0.75rem 0 0.4rem; }
.resultado-texto :deep(strong) { font-weight: 700; color: #111827; }
.resultado-texto :deep(ul) { padding-left: 1.25rem; margin: 0.4rem 0; }
.resultado-texto :deep(li) { margin: 0.25rem 0; }

.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; border: 2px dashed #e5e7eb; border-radius: 14px; padding: 1.5rem 1rem; cursor: pointer; background: #f9fafb; transition: all 0.2s; min-height: 110px; }
.upload-zone:hover { border-color: #10b981; background: #f0fdf4; }
.upload-zone--ok { border-color: #10b981; background: #f0fdf4; border-style: solid; flex-direction: row; gap: 12px; }
.upload-zone--error { border-color: #f87171; background: #fef2f2; }
.u-hidden { display: none; }
.upload-main { font-size: 0.85rem; font-weight: 600; color: #374151; display: block; }
.upload-main--ok { color: #0a3d2b; }
.upload-sub { font-size: 0.7rem; color: #9ca3af; display: block; }
.field-error { font-size: 0.76rem; color: #dc2626; margin: 4px 0 0; }

.loading-steps { display: flex; flex-direction: column; gap: 10px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.25rem 1.5rem; }
.loading-step { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #9ca3af; transition: color 0.3s; }
.loading-step--active { color: #10b981; font-weight: 600; }
.loading-step--done { color: #10b981; }
.step-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.loading-step--active .step-dot { animation: pulse-green 1s infinite; }

.resultado-texto :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.85rem;
}
.resultado-texto :deep(th) {
  background: #f0fdf4;
  color: #0a3d2b;
  font-weight: 700;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid #d1fae5;
}
.resultado-texto :deep(td) {
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  vertical-align: top;
  line-height: 1.5;
}
.resultado-texto :deep(tr:nth-child(even) td) {
  background: #f9fafb;
}

</style>