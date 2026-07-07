<script setup>
import { ref, onMounted } from 'vue';
import FormularioEditarPerfilReclutador from '../components/FormularioEditarPerfilReclutador.component.vue';
import { updateUserProfile } from '../../authentication/services/roles.service.js';

defineOptions({ name: 'PerfilReclutador' });

const perfil = ref({ id: null, companyName: '', email: '', description: '', ruc: '', verification_status: '' });
const modoEdicion = ref(false);

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData) {
    perfil.value = {
      id: userData.id,
      companyName: userData.name,
      email: userData.email,
      description: userData.description || '',
      ruc: userData.ruc || '',
      verification_status: userData.verification_status || 'PENDING',
    };
  }
});

const activarModoEdicion    = () => modoEdicion.value = true;
const desactivarModoEdicion = () => modoEdicion.value = false;

const procesarGuardado = async (payload) => {
  const { datosFormulario } = payload;
  try {
    const perfilActualizado = await updateUserProfile({
      name:        datosFormulario.companyName,
      description: datosFormulario.description,
      email:       datosFormulario.email,
      ruc:         datosFormulario.ruc,
    });
    perfil.value.companyName = perfilActualizado.name;
    perfil.value.email       = perfilActualizado.email;
    perfil.value.description = perfilActualizado.description;
    perfil.value.ruc         = perfilActualizado.ruc;
    perfil.value.verification_status = perfilActualizado.verification_status;
    alert('Perfil actualizado correctamente.');
    desactivarModoEdicion();
  } catch {
    alert('No se pudo actualizar el perfil.');
  }
};
</script>

<template>
  <div class="pr-root">

    <div v-if="!modoEdicion" class="pr-card">
      <div class="pr-luz" aria-hidden="true"></div>

      <!-- Cabecera -->
      <div class="pr-header">
        <div class="pr-header__left">
          <div class="pr-icon-box">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h1 class="pr-titulo">{{ $t('perfil') }}</h1>
            <p class="pr-subtitulo">Información pública de la empresa para los candidatos.</p>
          </div>
        </div>

        <button class="btn-editar" @click="activarModoEdicion">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          {{ $t('editar_perfil') }}
        </button>
      </div>

      <!-- Datos -->
      <div class="pr-datos">

        <div class="dato">
          <span class="dato-label">{{ $t('nombre_empresa') }}</span>
          <div class="dato-valor">
            <svg class="dato-icono" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            {{ perfil.companyName || '—' }}
          </div>
        </div>

        <div class="dato">
          <span class="dato-label">{{ $t('correo_electronico') }}</span>
          <div class="dato-valor">
            <svg class="dato-icono" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ perfil.email || '—' }}
          </div>
        </div>

        <div class="dato">
          <span class="dato-label">RUC</span>
          <div class="dato-valor">
            {{ perfil.ruc || 'Pendiente de registrar' }}
          </div>
        </div>

        <div class="dato">
          <span class="dato-label">Verificacion</span>
          <div class="dato-valor">
            {{ perfil.verification_status || 'PENDING' }}
          </div>
        </div>

        <div class="dato">
          <span class="dato-label">{{ $t('descripcion') }}</span>
          <div class="dato-valor dato-valor--tall">
            {{ perfil.description || 'Sin descripción aún. Haz clic en Editar perfil para añadir una.' }}
          </div>
        </div>

      </div>
    </div>

    <FormularioEditarPerfilReclutador
        v-if="modoEdicion"
        :datosInicialesPerfil="perfil"
        @guardar-cambios="procesarGuardado"
        @cancelar-edicion="desactivarModoEdicion"
    />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.pr-root {
  font-family: 'DM Sans', sans-serif;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  padding: 2.5rem 1rem;
}

/* ── Card ── */
.pr-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 2rem 1.75rem;
  box-shadow: 0 4px 32px rgba(10,61,43,0.08);
  border: 1px solid rgba(10,61,43,0.08);
  position: relative;
  overflow: hidden;
  animation: cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (min-width: 768px) { .pr-card { padding: 2.5rem 3rem; } }

/* Luz decorativa */
.pr-luz {
  position: absolute;
  top: -80px; right: -80px;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Header ── */
.pr-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(10,61,43,0.08);
  position: relative;
  z-index: 1;
}
@media (min-width: 600px) {
  .pr-header { flex-direction: row; align-items: center; justify-content: space-between; }
}

.pr-header__left { display: flex; align-items: center; gap: 1rem; }

.pr-icon-box {
  width: 48px; height: 48px;
  background: #ecfdf5;
  border: 1px solid rgba(16,185,129,0.22);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: #10b981;
  flex-shrink: 0;
}

.pr-titulo {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.4rem, 3.5vw, 2.1rem);
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.03em;
  margin: 0 0 0.2rem;
}
.pr-subtitulo { font-size: 0.875rem; color: #6b7280; margin: 0; }

/* ── BOTÓN EDITAR — hardcoded para garantizar visibilidad ── */
.btn-editar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0a3d2b;   /* verde profundo sólido */
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.72rem 1.4rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(10,61,43,0.32);
  transition: background-color 0.2s ease, transform 0.18s ease, box-shadow 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.btn-editar:hover {
  background-color: #10b981;   /* verde acento al hover */
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16,185,129,0.38);
}
.btn-editar:active { transform: translateY(0); }
.btn-editar:focus { outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.3); }

/* ── Datos ── */
.pr-datos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.dato { display: flex; flex-direction: column; gap: 0.4rem; }

.dato-label {
  font-family: 'Sora', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
}

.dato-valor {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: #f5f4f0;
  border: 1px solid rgba(10,61,43,0.08);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.dato-valor--tall {
  align-items: flex-start;
  font-weight: 400;
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.65;
  white-space: pre-wrap;
  min-height: 100px;
}

.dato-icono { color: #c4c9cc; flex-shrink: 0; }
</style>
