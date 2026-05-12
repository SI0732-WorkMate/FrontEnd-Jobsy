<script setup>
import { ref, watch } from 'vue';

defineOptions({ name: 'FormularioEditarPerfilPostulante' });

const props = defineProps({
  datosInicialesPerfil: { type: Object, required: true }
});

const emit = defineEmits(['guardar-cambios-postulante', 'cancelar-edicion-postulante']);

const datosEditables = ref({ nombre: '', correo: '', descripcion: '' });
const errorEmail = ref('');
const guardando = ref(false);

watch(() => props.datosInicialesPerfil, (nuevosDatos) => {
  datosEditables.value = {
    nombre:      nuevosDatos.name        || nuevosDatos.nombre      || '',
    correo:      nuevosDatos.email       || nuevosDatos.correo      || '',
    descripcion: nuevosDatos.description || nuevosDatos.descripcion || '',
  };
}, { immediate: true, deep: true });

const validarEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
  if (!datosEditables.value.correo) {
    errorEmail.value = 'El correo es obligatorio.';
    return false;
  }
  if (!emailRegex.test(datosEditables.value.correo)) {
    errorEmail.value = 'Ingresa un correo válido (ej: tu@correo.com).';
    return false;
  }
  errorEmail.value = '';
  return true;
};

const accionCancelar = () => emit('cancelar-edicion-postulante');

const accionGuardar = () => {
  if (!validarEmail()) return;
  emit('guardar-cambios-postulante', { datosFormulario: { ...datosEditables.value } });
};
</script>

<template>
  <div class="fpost-wrap">

    <!-- Cabecera -->
    <div class="fpost-header">
      <div class="fpost-header__icon">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </div>
      <div class="fpost-header__texto">
        <h2 class="fpost-titulo">Editar perfil</h2>
        <p class="fpost-subtitulo">Actualiza tu información personal y profesional.</p>
      </div>
      <button class="fpost-cerrar" @click="accionCancelar" aria-label="Cancelar">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Campos -->
    <div class="fpost-campos">

      <div class="campo">
        <label for="fPost_nombre" class="campo-label">Nombre completo</label>
        <div class="campo-input-wrap">
          <svg class="campo-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <input
              id="fPost_nombre"
              v-model="datosEditables.nombre"
              type="text"
              class="campo-input"
              placeholder="Tu nombre completo"
          />
        </div>
      </div>

      <div class="campo">
        <label for="fPost_correo" class="campo-label">Correo electrónico</label>
        <div class="campo-input-wrap">
          <svg class="campo-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <input
              id="fPost_correo"
              v-model="datosEditables.correo"
              type="text"
              class="campo-input"
              :class="{ 'campo-input--error': errorEmail }"
              placeholder="tu@correo.com"
              @blur="validarEmail"
          />
        </div>
        <div v-if="errorEmail" class="campo-error">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          {{ errorEmail }}
        </div>
      </div>

      <div class="campo">
        <label for="fPost_desc" class="campo-label">Descripción profesional</label>
        <textarea
            id="fPost_desc"
            v-model="datosEditables.descripcion"
            rows="5"
            class="campo-textarea"
            placeholder="Ej: Busco oportunidades en desarrollo web, apasionado por..."
        ></textarea>
        <span class="campo-hint">Cuéntale a las empresas quién eres y qué buscas profesionalmente.</span>
      </div>

    </div>

    <!-- Footer -->
    <div class="fpost-footer">
      <button class="btn-cancelar" @click="accionCancelar">Cancelar</button>
      <button class="btn-guardar" @click="accionGuardar" :disabled="guardando">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
        Guardar cambios
      </button>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --vp: #0a3d2b;
  --vm: #006c49;
  --va: #10b981;
  --fondo: #f5f4f0;
  --card: #ffffff;
  --input-bg: #f9fafb;
  --txt: #111827;
  --muted: #6b7280;
  --border: rgba(10,61,43,0.1);
  --shadow: 0 4px 32px rgba(10,61,43,0.08);
}

.fpost-wrap {
  background: var(--card);
  border-radius: 24px;
  padding: 2rem 1.75rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  font-family: 'DM Sans', sans-serif;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  animation: cardIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 768px) {
  .fpost-wrap { padding: 2.5rem 3rem; }
}

.fpost-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.fpost-header__icon {
  width: 44px; height: 44px;
  background: #ecfdf5;
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--va);
  flex-shrink: 0;
}

.fpost-header__texto { flex: 1; min-width: 0; }

.fpost-titulo {
  font-family: 'Sora', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--txt);
  letter-spacing: -0.02em;
  margin: 0 0 0.2rem;
}

.fpost-subtitulo { font-size: 0.875rem; color: var(--muted); margin: 0; }

.fpost-cerrar {
  width: 36px; height: 36px;
  background: var(--fondo);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.fpost-cerrar:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; transform: scale(1.08); }
.fpost-cerrar:focus { outline: none; }

.fpost-campos { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2rem; }

.campo { display: flex; flex-direction: column; gap: 0.5rem; }

.campo-label {
  font-family: 'Sora', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.campo-input-wrap { position: relative; display: flex; align-items: center; }

.campo-icon {
  position: absolute; left: 14px;
  color: #d1d5db;
  pointer-events: none;
  transition: color 0.2s;
}
.campo-input-wrap:focus-within .campo-icon { color: var(--va); }

.campo-input {
  width: 100%;
  background: var(--input-bg);
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 13px 16px 13px 42px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--txt);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.campo-input::placeholder { color: #c4c9cc; font-weight: 300; }
.campo-input:hover { border-color: #d1d5db; }
.campo-input:focus { border-color: var(--va); background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.campo-input--error { border-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important; }

.campo-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 500;
}

.campo-textarea {
  width: 100%;
  background: var(--input-bg);
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 13px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--txt);
  outline: none;
  resize: vertical;
  min-height: 130px;
  line-height: 1.65;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.campo-textarea::placeholder { color: #c4c9cc; font-weight: 300; }
.campo-textarea:hover { border-color: #d1d5db; }
.campo-textarea:focus { border-color: var(--va); background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }

.campo-hint { font-size: 0.75rem; color: #9ca3af; line-height: 1.5; }

.fpost-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}
@media (min-width: 480px) { .fpost-footer { flex-direction: row; justify-content: flex-end; } }

.btn-cancelar {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: var(--fondo);
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  letter-spacing: 0.02em;
}
.btn-cancelar:hover { background: #f3f4f6; border-color: #d1d5db; color: var(--txt); }
.btn-cancelar:focus { outline: none; }

.btn-guardar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  border: none;
  background: var(--vp);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn-guardar:hover:not(:disabled) { background: var(--va); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
.btn-guardar:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-guardar:focus { outline: none; }
</style>