<script setup>
import { ref, watch } from 'vue';

defineOptions({ name: 'FormularioEditarPerfilReclutador' });

const props = defineProps({
  datosInicialesPerfil: { type: Object, required: true }
});

const emit = defineEmits(['guardar-cambios', 'cancelar-edicion']);

const datosEditables = ref({ companyName: '', email: '', description: '' });
const errorEmail = ref('');

watch(() => props.datosInicialesPerfil, (n) => {
  datosEditables.value.companyName = n.companyName || '';
  datosEditables.value.email       = n.email       || '';
  datosEditables.value.description = n.description || '';
}, { immediate: true, deep: true });

const validarEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,4}$/;
  const partes = datosEditables.value.correo.split('@');
  const dominio = partes[1] || '';
  const tld = dominio.split('.').pop();

  if (!datosEditables.value.correo) {
    errorEmail.value = 'El correo es obligatorio.';
    return false;
  }
  if (!emailRegex.test(datosEditables.value.correo)) {
    errorEmail.value = 'Ingresa un correo válido (ej: tu@correo.com).';
    return false;
  }
  if (tld.length > 4 || !/^[a-zA-Z]+$/.test(tld)) {
    errorEmail.value = 'El dominio del correo no es válido.';
    return false;
  }
  errorEmail.value = '';
  return true;
};

const accionCancelar = () => emit('cancelar-edicion');
const accionGuardar  = () => {
  if (!validarEmail()) return;
  emit('guardar-cambios', { datosFormulario: { ...datosEditables.value } });
};
</script>

<template>
  <div class="frec-wrap">

    <!-- Header -->
    <div class="frec-header">
      <div class="frec-header__izq">
        <div class="frec-icono-box">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </div>
        <div>
          <h2 class="frec-titulo">{{ $t('editar_perfil') }}</h2>
          <p class="frec-sub">Actualiza la información visible de tu empresa.</p>
        </div>
      </div>
      <button class="frec-cerrar" @click="accionCancelar" aria-label="Cancelar">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Campos -->
    <div class="frec-campos">

      <div class="campo">
        <label for="frec_nombre" class="campo-label">{{ $t('nombre_empresa') }}</label>
        <div class="campo-wrap">
          <svg class="campo-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <input id="frec_nombre" v-model="datosEditables.companyName" type="text"
                 class="campo-input" :placeholder="$t('nombre_empresa')" />
        </div>
      </div>

      <div class="campo">
        <label for="frec_email" class="campo-label">{{ $t('correo_electronico') }}</label>
        <div class="campo-wrap">
          <svg class="campo-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <input id="frec_email" v-model="datosEditables.email" type="text"
                 class="campo-input" :class="{ 'campo-input--error': errorEmail }"
                 placeholder="empresa@correo.com"
                 @blur="validarEmail" />
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
        <label for="frec_desc" class="campo-label">{{ $t('descripcion') }}</label>
        <textarea id="frec_desc" v-model="datosEditables.description" rows="5"
                  class="campo-textarea" :placeholder="$t('descripcion')"></textarea>
        <span class="campo-hint">Describe tu empresa, cultura y lo que buscas en candidatos.</span>
      </div>

    </div>

    <!-- Footer -->
    <div class="frec-footer">
      <button class="btn-cancelar" @click="accionCancelar">{{ $t('cancelar') }}</button>
      <button class="btn-guardar" @click="accionGuardar">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
        </svg>
        {{ $t('guardar_cambios') }}
      </button>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.frec-wrap {
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem 1.75rem;
  box-shadow: 0 4px 32px rgba(10,61,43,0.08);
  border: 1px solid rgba(10,61,43,0.08);
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
@media (min-width: 768px) { .frec-wrap { padding: 2.5rem 3rem; } }

.frec-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 2rem; padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(10,61,43,0.08);
}
.frec-header__izq { display: flex; align-items: center; gap: 0.85rem; flex: 1; min-width: 0; }
.frec-icono-box {
  width: 44px; height: 44px;
  background: #ecfdf5; border: 1px solid rgba(16,185,129,0.22);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #10b981; flex-shrink: 0;
}
.frec-titulo { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 800; color: #111827; letter-spacing: -0.02em; margin: 0 0 0.15rem; }
.frec-sub { font-size: 0.85rem; color: #6b7280; margin: 0; }
.frec-cerrar {
  width: 36px; height: 36px; background: #f5f4f0;
  border: 1px solid rgba(10,61,43,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; cursor: pointer; flex-shrink: 0;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
}
.frec-cerrar:hover { background-color: #fee2e2; color: #dc2626; border-color: #fca5a5; transform: scale(1.08); }
.frec-cerrar:focus { outline: none; }

.frec-campos { display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 2rem; }
.campo { display: flex; flex-direction: column; gap: 0.45rem; }
.campo-label { font-family: 'Sora', sans-serif; font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
.campo-wrap { position: relative; display: flex; align-items: center; }
.campo-icon { position: absolute; left: 14px; color: #d1d5db; pointer-events: none; transition: color 0.2s; }
.campo-wrap:focus-within .campo-icon { color: #10b981; }
.campo-input {
  width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px;
  padding: 13px 16px 13px 42px; font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem; font-weight: 500; color: #111827; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}
.campo-input::placeholder { color: #c4c9cc; font-weight: 300; }
.campo-input:hover { border-color: #d1d5db; }
.campo-input:focus { border-color: #10b981; background-color: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.campo-input--error { border-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important; }

.campo-error {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.78rem; color: #dc2626; font-weight: 500;
}

.campo-textarea {
  width: 100%; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px;
  padding: 13px 16px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
  font-weight: 400; color: #111827; outline: none; resize: vertical; min-height: 130px;
  line-height: 1.65; transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}
.campo-textarea::placeholder { color: #c4c9cc; font-weight: 300; }
.campo-textarea:hover { border-color: #d1d5db; }
.campo-textarea:focus { border-color: #10b981; background-color: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.campo-hint { font-size: 0.75rem; color: #9ca3af; line-height: 1.5; }

.frec-footer {
  display: flex; flex-direction: column-reverse; gap: 0.75rem;
  padding-top: 1.5rem; border-top: 1px solid rgba(10,61,43,0.08);
}
@media (min-width: 480px) { .frec-footer { flex-direction: row; justify-content: flex-end; } }

.btn-cancelar {
  padding: 0.72rem 1.4rem; border-radius: 12px; border: 1.5px solid #e5e7eb;
  background-color: #f5f4f0; font-family: 'Sora', sans-serif; font-size: 0.82rem;
  font-weight: 600; color: #6b7280; cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s; letter-spacing: 0.02em;
}
.btn-cancelar:hover { background-color: #f3f4f6; border-color: #d1d5db; color: #111827; }
.btn-cancelar:focus { outline: none; }

.btn-guardar {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background-color: #0a3d2b; color: #ffffff; font-family: 'Sora', sans-serif;
  font-size: 0.82rem; font-weight: 700; padding: 0.72rem 1.6rem; border-radius: 12px;
  border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(10,61,43,0.32);
  transition: background-color 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease; letter-spacing: 0.02em;
}
.btn-guardar:hover { background-color: #10b981; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.38); }
.btn-guardar:active { transform: translateY(0); }
.btn-guardar:focus { outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.3); }
</style>