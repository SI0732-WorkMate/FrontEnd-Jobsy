<script>
import {getTextPDF} from "../services/apiPDF.service.js";
import {resumenSimple, clasificarCV} from "../services/clasificarCV.service.js";

export default {
  name: "Result.component",
  data() {
    return {
      visible: false,
      linkPDF: '',
      resumen: '',
      estado: '',
      cargando: false,
      error: ''
    }
  },
  methods: {
    async analizarCV() {
      this.cargando = true;
      this.error = '';
      this.resumen = '';
      this.estado = '';
      try {
        const texto = await getTextPDF(this.linkPDF);
        if (!texto || texto.trim().length < 20) {
          this.error = 'El PDF no contiene texto suficiente.';
          this.cargando = false;
          return;
        }
        this.resumen = resumenSimple(texto);
        this.estado = clasificarCV(texto);
      } catch (e) {
        this.error = 'Error al analizar el CV: ' + e.message;
      }
      this.cargando = false;
    }
  }
}
</script>

<template>
  <!-- Botón disparador -->
  <button @click="visible = true" class="btn-ia">
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
    </svg>
    Analizar con IA
  </button>

  <!-- Modal -->
  <div v-if="visible" class="modal-overlay" @click.self="visible = false">
    <div class="modal-card">

      <!-- Cerrar -->
      <button class="btn-cerrar" @click="visible = false" aria-label="Cerrar">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Ícono IA -->
      <div class="modal-icon-ia">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
        </svg>
      </div>

      <h2 class="modal-titulo">Analizar CV con IA</h2>
      <p class="modal-sub">Nuestra inteligencia artificial resumirá y clasificará al candidato.</p>

      <!-- Input URL -->
      <div v-if="!resumen && !cargando" class="campo">
        <label class="campo-label">Enlace del Documento (PDF)</label>
        <div class="input-icon-wrap">
          <div class="input-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <input
              v-model="linkPDF"
              placeholder="https://ejemplo.com/curriculum.pdf"
              class="campo-input"
              :disabled="cargando"
          />
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert-error">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <!-- Acciones previas -->
      <div v-if="!resumen && !cargando" class="modal-footer-btns">
        <button @click="visible = false" class="btn-secondary">Cancelar</button>
        <button @click="analizarCV" :disabled="!linkPDF" class="btn-primary">Analizar</button>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">La IA está procesando el CV...</p>
      </div>

      <!-- Resultados -->
      <div v-if="resumen && estado && !cargando" class="resultado-box">

        <div class="resultado-header">
          <div class="resultado-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div>
            <p class="resultado-label">Clasificación IA</p>
            <p class="resultado-estado">{{ estado }}</p>
          </div>
        </div>

        <div class="resultado-resumen">
          <p class="resultado-label" style="margin-bottom:10px;">Resumen del Perfil</p>
          <div class="resultado-texto" v-html="resumen"></div>
        </div>

        <button @click="visible = false" class="btn-primary" style="width:100%;">Aceptar y Cerrar</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --vp: #0a3d2b; --vm: #006c49; --va: #10b981;
  --fondo: #f5f4f0; --input-bg: #f9fafb; --card: #ffffff;
  --txt: #111827; --muted: #6b7280; --border: #e5e7eb;
}

/* ——— Botón disparador ——— */
.btn-ia {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--vp);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
  border: none; border-radius: 12px;
  padding: 12px 22px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s;
}
.btn-ia:hover { background: var(--va); transform: translateY(-1px); }
.btn-ia:focus { outline: none; }

/* ——— Overlay ——— */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10,61,43,0.3);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; padding: 16px;
  font-family: 'Sora', sans-serif;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ——— Card ——— */
.modal-card {
  position: relative; width: 100%; max-width: 500px;
  background: var(--card); border-radius: 24px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(10,61,43,0.18);
  display: flex; flex-direction: column; gap: 0;
  animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (min-width: 640px) { .modal-card { padding: 48px; } }

/* ——— Cerrar ——— */
.btn-cerrar {
  position: absolute; top: 18px; right: 18px;
  background: var(--fondo); border: 1.5px solid var(--border);
  border-radius: 50%; width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted); cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.btn-cerrar:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; transform: scale(1.08); }
.btn-cerrar:focus { outline: none; }

/* ——— Ícono IA ——— */
.modal-icon-ia {
  width: 56px; height: 56px;
  background: rgba(16,185,129,0.1);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--va); margin: 0 auto 20px auto;
}

.modal-titulo {
  font-size: 1.5rem; font-weight: 800;
  color: var(--txt); text-align: center;
  margin: 0 0 8px 0; letter-spacing: -0.01em;
}

.modal-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem; color: var(--muted);
  text-align: center; margin: 0 0 28px 0;
}

/* ——— Campo ——— */
.campo { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }

.campo-label {
  font-size: 0.7rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--muted);
}

.input-icon-wrap { position: relative; }

.input-icon {
  position: absolute; inset-y: 0; left: 14px;
  display: flex; align-items: center;
  pointer-events: none; color: var(--muted);
  transition: color 0.2s;
}

.campo-input {
  width: 100%; background: var(--input-bg);
  border: 1.5px solid var(--border); border-radius: 12px;
  padding: 13px 16px 13px 42px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem; color: var(--txt); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
}
.campo-input::placeholder { color: var(--muted); font-weight: 300; }
.campo-input:focus { border-color: var(--va); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
.campo-input:disabled { opacity: 0.6; cursor: not-allowed; }

/* ——— Error ——— */
.alert-error {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  border-radius: 12px; padding: 14px 16px;
  margin-bottom: 20px;
  color: #dc2626;
}
.alert-error p { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; margin: 0; }

/* ——— Footer botones ——— */
.modal-footer-btns { display: flex; gap: 10px; }

.btn-primary {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: var(--vp); color: #fff;
  font-family: 'Sora', sans-serif; font-size: 0.8rem;
  font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  border: none; border-radius: 12px; padding: 14px 24px;
  cursor: pointer; box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover { background: var(--va); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-primary:focus { outline: none; }

.btn-secondary {
  flex: 1; background: var(--card); color: var(--txt);
  font-family: 'Sora', sans-serif; font-size: 0.8rem;
  font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  border: 1.5px solid var(--border); border-radius: 12px;
  padding: 14px 24px; cursor: pointer;
  transition: background 0.2s;
}
.btn-secondary:hover { background: var(--fondo); }
.btn-secondary:focus { outline: none; }

/* ——— Loading ——— */
.loading-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 0; gap: 16px;
}

.spinner {
  width: 44px; height: 44px;
  border: 3px solid var(--border);
  border-top-color: var(--va);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem; color: var(--va); font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* ——— Resultado ——— */
.resultado-box {
  background: var(--fondo); border: 1.5px solid var(--border);
  border-radius: 16px; padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
  margin-top: 8px;
}

.resultado-header {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1.5px solid var(--border);
}

.resultado-icon {
  width: 46px; height: 46px;
  background: rgba(16,185,129,0.1);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--va); flex-shrink: 0;
}

.resultado-label {
  font-size: 0.68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--muted); margin: 0 0 4px 0;
}

.resultado-estado {
  font-size: 1.2rem; font-weight: 700;
  color: var(--txt); margin: 0;
}

.resultado-resumen {}

.resultado-texto {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem; color: #374151;
  line-height: 1.65; font-weight: 400;
}
</style>