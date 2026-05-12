<script>
export default {
  name: 'CandidatoModal',
  props: {
    candidato: Object
  },
  data() {
    return {
      estadoLocal: this.candidato?.backendStatus || 'pending'
    };
  },
  computed: {
    labelEstado() {
      switch (this.estadoLocal) {
        case 'accepted': return 'Aceptado';
        case 'rejected': return 'Rechazado';
        default:         return 'Pendiente';
      }
    }
  },
  methods: {
    setEstado(nuevoBackendStatus) {
      this.estadoLocal = nuevoBackendStatus;
    },
    confirmar() {
      const updated = {
        ...this.candidato,
        backendStatus: this.estadoLocal,
        status: this.labelEstado,
      };
      this.$emit('actualizar', updated);
    }
  }
};
</script>

<template>
  <!-- Overlay -->
  <div class="modal-overlay">

    <!-- Card -->
    <div class="modal-card">

      <!-- Cerrar -->
      <button class="btn-cerrar" @click="$emit('cerrar')" aria-label="Cerrar">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Ícono decorativo -->
      <div class="modal-icon">
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>

      <h3 class="modal-titulo">{{ $t("titulo_candidatos") }}</h3>

      <!-- Campos -->
      <div class="campos">

        <div class="campo">
          <label class="campo-label">{{ $t("nombre_candidato") }}</label>
          <div class="campo-valor">{{ candidato.name }}</div>
        </div>

        <div class="campo">
          <label class="campo-label">{{ $t("puesto_postula") }}</label>
          <div class="campo-valor">{{ candidato.publicationNumber }}</div>
        </div>

        <div class="campo">
          <label class="campo-label">{{ $t("curriculum_vitae") }}</label>
          <div class="campo-cv-row">
            <div class="campo-cv-text">{{ candidato.cv }}</div>
            <a :href="candidato.cv" target="_blank" class="btn-descargar">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ $t("descargar") }}
            </a>
          </div>
        </div>

        <!-- Estado -->
        <div class="campo">
          <label class="campo-label">{{ $t("estado_postulante") }}</label>
          <div class="estado-btns">
            <button
                @click="setEstado('accepted')"
                class="btn-estado"
                :class="estadoLocal === 'accepted' ? 'btn-estado--activo-verde' : 'btn-estado--inactivo'"
            >
              ✓ Aceptado
            </button>
            <button
                @click="setEstado('pending')"
                class="btn-estado"
                :class="estadoLocal === 'pending' ? 'btn-estado--activo-amarillo' : 'btn-estado--inactivo'"
            >
              ⏳ Pendiente
            </button>
            <button
                @click="setEstado('rejected')"
                class="btn-estado"
                :class="estadoLocal === 'rejected' ? 'btn-estado--activo-rojo' : 'btn-estado--inactivo'"
            >
              ✗ Rechazado
            </button>
          </div>
        </div>

      </div>

      <!-- Footer acciones -->
      <div class="modal-footer">
        <button class="btn-primary" @click="confirmar">
          {{ $t("actualizar_estado") }}
        </button>
        <button class="btn-secondary" @click="$emit('cerrar')">
          {{ $t("cerrar") }}
        </button>
      </div>

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
  --input-bg: #f9fafb;
  --card: #ffffff;
  --txt: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(10,61,43,0.3);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  font-family: 'Sora', sans-serif;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--card);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 24px 80px rgba(10,61,43,0.18), 0 4px 16px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (min-width: 640px) { .modal-card { padding: 48px; } }

/* ——— Cerrar ——— */
.btn-cerrar {
  position: absolute;
  top: 18px; right: 18px;
  background: var(--fondo);
  border: 1.5px solid var(--border);
  border-radius: 50%;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.btn-cerrar:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; transform: scale(1.08); }
.btn-cerrar:focus { outline: none; }

/* ——— Ícono ——— */
.modal-icon {
  width: 50px; height: 50px;
  background: rgba(16,185,129,0.1);
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: var(--va);
  margin-bottom: 18px;
}

.modal-titulo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--txt);
  margin: 0 0 24px 0;
  padding-right: 32px;
}

/* ——— Campos ——— */
.campos { display: flex; flex-direction: column; gap: 18px; }

.campo { display: flex; flex-direction: column; gap: 8px; }

.campo-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.campo-valor {
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--txt);
}

.campo-cv-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.campo-cv-text {
  flex: 1;
  background: var(--input-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-descargar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--txt);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.btn-descargar:hover { background: rgba(16,185,129,0.08); color: var(--vp); border-color: rgba(16,185,129,0.3); }

/* ——— Estado botones ——— */
.estado-btns { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-estado {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.2s;
}

.btn-estado--inactivo {
  background: var(--card);
  color: var(--muted);
  border-color: var(--border);
}
.btn-estado--inactivo:hover { background: var(--fondo); color: var(--txt); }

.btn-estado--activo-verde {
  background: var(--va);
  color: #fff;
  border-color: var(--va);
  box-shadow: 0 4px 12px rgba(16,185,129,0.3);
}

.btn-estado--activo-amarillo {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245,158,11,0.3);
}

.btn-estado--activo-rojo {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}

/* ——— Footer ——— */
.modal-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1.5px solid var(--border);
}

@media (min-width: 480px) { .modal-footer { flex-direction: row-reverse; } }

.btn-primary {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  background: var(--vp);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(10,61,43,0.3);
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover { background: var(--va); transform: translateY(-1px); }
.btn-primary:focus { outline: none; }

.btn-secondary {
  flex: 1;
  background: var(--card);
  color: var(--txt);
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px 24px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn-secondary:hover { background: var(--fondo); border-color: #d1d5db; }
.btn-secondary:focus { outline: none; }
</style>