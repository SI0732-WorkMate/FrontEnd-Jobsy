<script>
export default {
  name: 'ContactarModal',
  props: {
    candidato: {
      type: Object,
      required: true
    }
  },
  emits: ['cerrar', 'enviar'],
  data() {
    return {
      mensaje: ''
    };
  },
  methods: {
    enviarMensaje() {
      if (!this.mensaje.trim()) {
        alert('Por favor, escribe un mensaje.');
        return;
      }
      this.$emit('enviar', this.mensaje);
      this.mensaje = '';
    }
  }
};
</script>

<template>
  <!-- Overlay -->
  <div class="modal-overlay" @click.self="$emit('cerrar')">

    <!-- Tarjeta del Modal -->
    <div class="modal-card">

      <!-- Botón Cerrar -->
      <button class="btn-cerrar" @click="$emit('cerrar')" aria-label="Cerrar">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Ícono decorativo -->
      <div class="modal-icon">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      </div>

      <!-- Cabecera -->
      <div class="modal-header">
        <h3 class="modal-titulo">
          {{ $t("contactar_a") }} {{ candidato.name }}
        </h3>
        <p class="modal-subtitulo">
          {{ $t("mensaje_inicial") }}
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="enviarMensaje" class="modal-form">

        <!-- Label -->
        <label class="campo-label">{{ $t('placeholder_mensaje') }}</label>

        <!-- Textarea -->
        <textarea
            v-model="mensaje"
            rows="5"
            :placeholder="$t('placeholder_mensaje')"
            required
            class="campo-textarea"
        ></textarea>

        <!-- Botón Enviar -->
        <button type="submit" class="btn-enviar">
          {{ $t("enviar_mensaje") }}
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>

      </form>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --verde-profundo: #0a3d2b;
  --verde-medio: #006c49;
  --verde-acento: #10b981;
  --fondo-calido: #f5f4f0;
  --input-fondo: #f9fafb;
  --blanco-card: #ffffff;
  --texto-principal: #111827;
  --texto-muted: #6b7280;
}

/* ——— Overlay ——— */
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 61, 43, 0.35);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  font-family: 'Sora', sans-serif;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ——— Card ——— */
.modal-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--blanco-card);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(10, 61, 43, 0.18), 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (min-width: 640px) {
  .modal-card {
    padding: 48px;
  }
}

/* ——— Botón cerrar ——— */
.btn-cerrar {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--fondo-calido);
  border: 1.5px solid #e5e7eb;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--texto-muted);
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

/* ——— Ícono decorativo ——— */
.modal-icon {
  width: 52px;
  height: 52px;
  background: rgba(16, 185, 129, 0.1);
  border: 1.5px solid rgba(16, 185, 129, 0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--verde-acento);
  margin-bottom: 20px;
}

/* ——— Cabecera ——— */
.modal-header {
  margin-bottom: 28px;
  padding-right: 32px;
}

.modal-titulo {
  font-family: 'Sora', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--texto-principal);
  line-height: 1.25;
  margin: 0 0 8px 0;
}

.modal-subtitulo {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--texto-muted);
  margin: 0;
}

/* ——— Formulario ——— */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campo-label {
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--texto-muted);
  display: block;
  margin-bottom: 4px;
}

.campo-textarea {
  width: 100%;
  background: var(--input-fondo);
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--texto-principal);
  resize: none;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 8px;
}

.campo-textarea::placeholder {
  color: var(--texto-muted);
  font-weight: 300;
}

.campo-textarea:hover {
  border-color: #d1d5db;
}

.campo-textarea:focus {
  border-color: var(--verde-acento);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), inset 0 1px 3px rgba(0,0,0,0.04);
}

/* ——— Botón Enviar ——— */
.btn-enviar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: var(--verde-profundo);
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10, 61, 43, 0.3);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  margin-top: 4px;
}

.btn-enviar:hover {
  background: var(--verde-acento);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.btn-enviar:active {
  transform: translateY(0);
}

.btn-enviar:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}
</style>