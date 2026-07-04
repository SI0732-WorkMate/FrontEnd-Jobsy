<script>
export default {
  name: 'CandidatoTabla',
  props: {
    candidatos: {
      type: Array,
      required: true
    }
  },
  emits: ['verMas', 'contactar']
};
</script>

<template>
  <div class="tabla-wrapper">

    <!-- Encabezados desktop -->
    <div class="tabla-head">
      <div class="th">{{ $t("nombre") }}</div>
      <div class="th">Oferta</div>
      <div class="th">Match Score</div>
      <div class="th">{{ $t("curriculum_vitae") }}</div>
      <div class="th">{{ $t("estado") }}</div>
      <div class="th">{{ $t("acciones") }}</div>
    </div>

    <!-- Filas -->
    <div class="tabla-body">
      <template v-if="candidatos.length > 0">
        <div v-for="candidato in candidatos" :key="candidato.id" class="tabla-row">

          <!-- Nombre -->
          <div class="cell cell--nombre">
            <div class="avatar">{{ candidato.name?.charAt(0)?.toUpperCase() || '?' }}</div>
            <div class="nombre-info">
              <span class="nombre-txt">{{ candidato.name }}</span>
              <span class="nombre-sub">Postulante</span>
            </div>
          </div>

          <!-- Publicación -->
          <div class="cell cell--center">
            <span class="cell-label-mobile">{{ $t('nro_publicacion') }}</span>
            <span class="oferta-chip">{{ candidato.publicationTitle }}</span>
          </div>

          <!-- Match Score -->
          <div class="cell cell--center">
            <span class="cell-label-mobile">Match Score</span>
            <span
                v-if="candidato.matchScore !== null && candidato.matchScore !== undefined"
                class="match-badge"
                :class="{
                  'match-badge--alto': candidato.matchScore >= 70,
                  'match-badge--medio': candidato.matchScore >= 40 && candidato.matchScore < 70,
                  'match-badge--bajo': candidato.matchScore < 40
                }"
                @click="$emit('verMas', candidato)"
                title="Ver detalle del match"
            >
              🎯 {{ candidato.matchScore }}
            </span>
            <span v-else class="chip chip-gray">Sin calcular</span>
          </div>

          <!-- CV -->
          <div class="cell cell--center">
            <span class="cell-label-mobile">{{ $t('curriculum_vitae') }}</span>
            <a v-if="candidato.cv" :href="candidato.cv" target="_blank" rel="noopener noreferrer" class="btn-cv">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver CV
            </a>
            <span v-else class="chip chip-gray">Sin CV</span>
          </div>

          <!-- Estado -->
          <div class="cell cell--center">
            <span class="cell-label-mobile">{{ $t('estado') }}</span>
            <span class="chip" :class="{
              'chip-green':  candidato.status === 'Aceptado',
              'chip-red':    candidato.status === 'Rechazado',
              'chip-yellow': candidato.status === 'Pendiente',
              'chip-blue':   candidato.status !== 'Aceptado' && candidato.status !== 'Rechazado' && candidato.status !== 'Pendiente'
            }">{{ candidato.status }}</span>
          </div>

          <!-- Acciones -->
          <div class="cell cell--acciones">
            <button @click="$emit('verMas', candidato)" class="btn-ver">Detalles</button>
            <button @click="$emit('contactar', candidato)" class="btn-contactar">Contactar</button>
          </div>

        </div>
      </template>

      <!-- Empty -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <p class="empty-titulo">No hay candidatos aún</p>
        <p class="empty-sub">Cuando alguien postule a tus ofertas, aparecerá aquí.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabla-wrapper {
  font-family: 'DM Sans', sans-serif;
  width: 100%;
}

/* Head */
.tabla-head { display: none; }

@media (min-width: 768px) {
  .tabla-head {
    display: grid;
    /* REEMPLAZADO: Ahora tiene 6 columnas en lugar de 5 */
    grid-template-columns: 2fr 1.3fr 1fr 1fr 1fr 1.5fr;
    gap: 10px;
    margin-bottom: 10px;
    padding: 0 4px;
  }
}

.th {
  background: #f5f4f0;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 11px 14px;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

/* Body */
.tabla-body { display: flex; flex-direction: column; gap: 10px; }

/* Row */
.tabla-row {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

@media (min-width: 768px) {
  .tabla-row {
    display: grid;
    /* REEMPLAZADO: Ajustado para alinearse perfectamente con la cabecera */
    grid-template-columns: 2fr 1.3fr 1fr 1fr 1fr 1.5fr;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
  }
}

.tabla-row:hover {
  box-shadow: 0 6px 20px rgba(10,61,43,0.09);
  border-color: rgba(16,185,129,0.35);
  transform: translateY(-1px);
}

/* Cells */
.cell { display: flex; justify-content: space-between; align-items: center; }

@media (min-width: 768px) {
  .cell { justify-content: flex-start; }
  .cell--center { justify-content: center; }
  .cell--acciones { justify-content: center; gap: 8px; }
}

.cell-label-mobile {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}
@media (min-width: 768px) { .cell-label-mobile { display: none; } }

/* Nombre con avatar */
.cell--nombre { gap: 12px; }
.avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d1fae5, #6ee7b7);
  color: #0a3d2b;
  font-family: 'Sora', sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.nombre-info { display: flex; flex-direction: column; gap: 2px; }
.nombre-txt { font-weight: 700; font-size: 0.9rem; color: #111827; }
.nombre-sub { font-size: 0.72rem; color: #6b7280; }

/* Oferta chip */
.oferta-chip {
  background: #f5f4f0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  font-family: monospace;
}

/* Chips */
.chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.chip-green  { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.chip-red    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.chip-yellow { background: #fefce8; color: #92400e; border: 1px solid #fde68a; }
.chip-blue   { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.chip-gray   { background: #f5f4f0; color: #6b7280; border: 1px solid #e5e7eb; }

/* ========================================================== */
/* ADICIONADO: Estilos para el nuevo badge de Match Score     */
/* ========================================================== */
.match-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s;
}
.match-badge:hover { transform: scale(1.06); }
.match-badge--alto  { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.match-badge--medio { background: #fefce8; color: #92400e; border: 1px solid #fde68a; }
.match-badge--bajo  { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
/* ========================================================== */

/* CV btn */
.btn-cv {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgba(16,185,129,0.08);
  color: #0a3d2b;
  border: 1.5px solid rgba(16,185,129,0.3);
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.btn-cv:hover { background: #10b981; color: #fff; border-color: #10b981; }

/* Acciones */
.cell--acciones { gap: 8px; }

.btn-ver {
  flex: 1;
  padding: 8px 12px;
  background: rgba(16,185,129,0.08);
  color: #0a3d2b;
  border: 1.5px solid rgba(16,185,129,0.25);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}
.btn-ver:hover { background: #10b981; color: #fff; border-color: #10b981; transform: translateY(-1px); }

.btn-contactar {
  flex: 1;
  padding: 8px 12px;
  background: #ffffff;
  color: #111827;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
}
.btn-contactar:hover { background: #0a3d2b; color: #fff; border-color: #0a3d2b; transform: translateY(-1px); }

/* Empty */
.empty-state {
  padding: 72px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px dashed #e5e7eb;
}
.empty-icon {
  width: 60px; height: 60px;
  background: #f5f4f0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  border: 1.5px solid #e5e7eb;
  color: #d1d5db;
}
.empty-titulo { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 6px 0; }
.empty-sub { font-size: 0.88rem; color: #6b7280; margin: 0; }
</style>