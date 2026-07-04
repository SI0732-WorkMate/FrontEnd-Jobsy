<script>
export default {
  name: 'PostularModal',
  props: {
    oferta: { type: Object, required: true }
  },
  emits: ['cerrar', 'confirmar-postulacion'],
  data() {
    return { cvUrl: '', cvFile: null, cvFileError: '' };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      this.cvFileError = '';
      this.cvFile = null;
      if (!file) return;

      if (file.type !== 'application/pdf') {
        this.cvFileError = 'Solo se aceptan archivos PDF.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.cvFileError = `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo 5 MB.`;
        return;
      }
      this.cvFile = file;
    },
    confirmar() {
      if (!this.cvUrl.trim()) {
        alert('Por favor, introduce el enlace de tu CV.');
        return;
      }
      try {
        new URL(this.cvUrl);
      } catch (_) {
        alert('Por favor, introduce una URL válida (ej: https://...).');
        return;
      }
      this.$emit('confirmar-postulacion', { cvUrl: this.cvUrl, cvFile: this.cvFile });
    }
  }
};
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-card">

      <button class="modal-close" @click="$emit('cerrar')" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="oferta-section">
        <div class="oferta-badge">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Oferta de empleo
        </div>

        <h2 class="oferta-title">{{ oferta.title }}</h2>

        <div class="oferta-chips">
          <span v-if="oferta.location" class="info-chip">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ oferta.location }}
          </span>
          <span :class="(!oferta.salary_range || oferta.salary_range == 0 || oferta.salary_range == '0') ? 'info-chip' : 'info-chip info-chip--green'">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ (!oferta.salary_range || oferta.salary_range == 0 || oferta.salary_range == '0') ? 'No especificado' : 'S/. ' + oferta.salary_range }}
          </span>
        </div>

        <div v-if="oferta.description" class="oferta-block">
          <span class="block-label">Descripción</span>
          <p class="block-text">{{ oferta.description }}</p>
        </div>

        <div v-if="oferta.requirements" class="oferta-block">
          <span class="block-label">Requisitos</span>
          <p class="block-text">{{ oferta.requirements }}</p>
        </div>
      </div>

      <div class="modal-divider">
        <span class="modal-divider__label">Completa tu postulación</span>
      </div>

      <form @submit.prevent="confirmar" class="modal-form">

        <div class="field">
          <label for="cvUrl" class="field-label">Enlace a tu CV</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
                id="cvUrl"
                v-model="cvUrl"
                type="url"
                placeholder="https://drive.google.com/..."
                required
                class="field-input"
            />
          </div>
          <p class="field-hint">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px;color:#f59e0b;flex-shrink:0;">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Asegúrate de que el enlace sea público y no requiera permisos.
          </p>
        </div>

        <div class="field">
          <label for="cvFile" class="field-label">Adjunta tu CV en PDF (opcional, recomendado)</label>
          <input
              id="cvFile"
              type="file"
              accept="application/pdf"
              @change="onFileChange"
              class="field-input-file"
          />
          <p v-if="cvFileError" class="field-error">{{ cvFileError }}</p>
          <p v-else class="field-hint">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:13px;height:13px;color:#10b981;flex-shrink:0;">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Si lo adjuntas, el sistema calculará automáticamente tu afinidad con la oferta (Match Score) para el reclutador.
          </p>
        </div>
        <button type="submit" class="btn-submit">
          <span>Enviar postulación</span>
          <svg viewBox="0 0 20 20" fill="none" class="btn-arrow">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10,20,15,0.45);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: flex-start;
  z-index: 1000; padding: 1.5rem;
  overflow-y: auto;
  font-family: 'DM Sans', sans-serif;
  animation: overlay-in 0.22s ease both;
}
@keyframes overlay-in { from{opacity:0} to{opacity:1} }

.modal-card {
  position: relative;
  width: 100%; max-width: 560px;
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  border: 1px solid rgba(0,0,0,0.06);
  margin: auto;
  animation: card-in 0.32s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes card-in { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }

.modal-close {
  position: absolute; top: 1.1rem; right: 1.1rem;
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9ca3af;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}
.modal-close svg { width: 15px; height: 15px; }
.modal-close:hover { color: #dc2626; background: #fee2e2; border-color: #fca5a5; }

/* ── Sección oferta ── */
.oferta-section { margin-bottom: 1.5rem; }

.oferta-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ecfdf5; border: 1px solid #a7f3d0;
  color: #065f46; border-radius: 99px;
  font-size: 0.72rem; font-weight: 700;
  padding: 5px 12px; margin-bottom: 1rem;
  letter-spacing: 0.03em;
}

.oferta-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.4rem; font-weight: 800;
  color: #0f1a13; letter-spacing: -0.02em;
  line-height: 1.2; margin-bottom: 1rem;
  padding-right: 2rem;
}

.oferta-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.25rem; }

.info-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f5f4f0; border: 1px solid #e5e7eb;
  color: #6b7280; border-radius: 8px;
  font-size: 0.78rem; font-weight: 500;
  padding: 5px 10px;
}
.info-chip--green { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }

.oferta-block { margin-bottom: 1rem; }
.block-label {
  display: block; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #9ca3af; margin-bottom: 6px;
}
.block-text {
  background: #f9fafb; border: 1.5px solid #e5e7eb;
  border-radius: 12px; padding: 14px;
  font-size: 0.9rem; color: #374151;
  line-height: 1.65; white-space: pre-wrap;
  word-break: break-word;
}

/* ── Divider ── */
.modal-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 1.5rem 0;
}
.modal-divider::before, .modal-divider::after {
  content: ''; flex: 1; height: 1px; background: #e5e7eb;
}
.modal-divider__label {
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: #9ca3af; white-space: nowrap;
}

/* ── Formulario ── */
.modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.field-label { font-size: 0.78rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
.input-wrap { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; width: 17px; height: 17px; color: #9ca3af; pointer-events: none; transition: color 0.2s; }
.input-wrap:focus-within .input-icon { color: #10b981; }
.field-input {
  width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb;
  border-radius: 12px; padding: 13px 16px 13px 44px;
  font-size: 0.95rem; font-family: 'DM Sans', sans-serif; color: #111827;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.field-input::placeholder { color: #b0bab5; }
.field-input:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
.field-hint { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #9ca3af; line-height: 1.4; }

.btn-submit {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #0a3d2b; color: #fff;
  font-family: 'Sora', sans-serif; font-size: 0.92rem; font-weight: 700;
  padding: 14px 24px; border: none; border-radius: 12px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}
.btn-submit:hover { background: #10b981; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
.btn-arrow { width: 18px; height: 18px; transition: transform 0.2s; }
.btn-submit:hover .btn-arrow { transform: translateX(3px); }

.field-input-file {
  width: 100%;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 0.88rem;
  font-family: 'DM Sans', sans-serif;
  color: #374151;
}
.field-error { font-size: 0.78rem; color: #dc2626; }

</style>