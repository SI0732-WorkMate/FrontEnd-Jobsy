<script>
import axios from 'axios';
import { getAllPublications, deletePublication, addPublication, updatePublication } from "../services/Publication.service.js";
import { Publication } from "../model/Publication.entity.js";

export default {
  name: "Publicaciones",
  data() {
    return {
      publicaciones: [],
      filtroTitulo: '',
      modalVer: false,
      modalEditar: false,
      modalEliminar: false,
      publicacionSeleccionada: null,
      formulario: new Publication(),
      paginaActual: 1,
      publicacionesPorPagina: 5,
      salarioPrivado: false,
      salarioError: '',
    };
  },
  computed: {
    publicacionesFiltradas() {
      if (!this.filtroTitulo) return this.publicaciones;
      return this.publicaciones.filter(pub =>
          pub.title.toLowerCase().includes(this.filtroTitulo.toLowerCase())
      );
    },
    publicacionesPaginadas() {
      const inicio = (this.paginaActual - 1) * this.publicacionesPorPagina;
      return this.publicacionesFiltradas.slice(inicio, inicio + this.publicacionesPorPagina);
    },
    totalPaginas() {
      return Math.ceil(this.publicacionesFiltradas.length / this.publicacionesPorPagina);
    },

    // ── Checks individuales ──
    checks() {
      const t = this.formulario.title?.trim() || '';
      const d = this.formulario.description?.trim() || '';
      const r = this.formulario.requirements?.trim() || '';
      const l = this.formulario.location?.trim() || '';
      return {
        titulo:      { ok: t.length >= 10 && t.length <= 30,   label: `Título (10–30 caracteres, actual: ${t.length})` },
        descripcion: { ok: d.length >= 20 && d.length <= 600,  label: `Descripción (20–600 caracteres, actual: ${d.length})` },
        requisitos:  { ok: r.length === 0 || (r.length >= 10 && r.length <= 300), label: `Requisitos (opcional, máx. 300 caracteres, actual: ${r.length})` },
        ubicacion:   { ok: l.length >= 3 && l.length <= 20,    label: `Ubicación (3–20 caracteres, actual: ${l.length})` },
        salario:     { ok: this.salarioValido,                  label: 'Salario válido o marcado como privado' },
      };
    },

    salarioValido() {
      if (this.salarioPrivado) return true;
      const val = String(this.formulario.salary_range || '').trim();
      if (val === '') return false;
      return /^\d+(\.\d{1,2})?$/.test(val) && parseFloat(val) > 0;
    },

    formularioValido() {
      return Object.values(this.checks).every(c => c.ok) && !this.salarioError;
    },
  },
  watch: {
    'formulario.salary_range'(val) {
      if (this.salarioPrivado) { this.salarioError = ''; return; }
      if (!val) { this.salarioError = ''; return; }
      const str = String(val).trim();
      if (/[a-zA-Z]/.test(str)) this.salarioError = 'El salario no puede contener letras.';
      else if (/[^0-9.]/.test(str)) this.salarioError = 'Solo se permiten números y un punto decimal.';
      else if ((str.match(/\./g) || []).length > 1) this.salarioError = 'Solo se permite un punto decimal.';
      else if (parseFloat(str) <= 0 && str !== '') this.salarioError = 'El salario debe ser mayor a 0.';
      else this.salarioError = '';
    },
    salarioPrivado(val) {
      if (val) { this.formulario.salary_range = ''; this.salarioError = ''; }
    },
  },
  methods: {
    onSalarioKeydown(e) {
      const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End','.'];
      if (allowed.includes(e.key)) return;
      if (!/^\d$/.test(e.key)) { e.preventDefault(); this.salarioError = 'Solo se permiten números.'; }
    },

    async cargarPublicaciones() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser?.id) return;
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [offersResponse, appsResponse] = await Promise.all([
          getAllPublications(),
          axios.get('http://localhost:5195/api/applications/my-offers', { headers }).catch(() => ({ data: [] }))
        ]);
        const misPublicaciones = offersResponse.data.filter(pub => pub.employer_id === currentUser.id);
        const conteo = {};
        (appsResponse.data || []).forEach(app => { conteo[app.job_offer_id] = (conteo[app.job_offer_id] || 0) + 1; });
        this.publicaciones = misPublicaciones.map(pub => ({ ...pub, applicationCount: conteo[pub.id] || 0 }));
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      }
    },

    async guardarPublicacion() {
      if (!this.formularioValido) {
        alert('Por favor completa todos los campos correctamente antes de guardar.');
        return;
      }
      try {
        const salaryValue = this.salarioPrivado ? 0 : parseFloat(this.formulario.salary_range);
        if (this.formulario.id) {
          await updatePublication(this.formulario.id, { ...this.formulario, salary_range: salaryValue });
          alert('¡Publicación actualizada exitosamente!');
        } else {
          await addPublication({
            title: this.formulario.title,
            description: this.formulario.description,
            requirements: this.formulario.requirements,
            location: this.formulario.location,
            salary_range: salaryValue,
          });
          alert('¡Publicación creada exitosamente!');
        }
        this.cerrarModalEditar();
        this.cargarPublicaciones();
      } catch (error) {
        alert('Error al guardar la publicación.');
        console.error(error);
      }
    },

    async eliminarPublicacionConfirmada() {
      if (!this.publicacionSeleccionada?.id) return;
      try {
        await deletePublication(this.publicacionSeleccionada.id);
        this.modalEliminar = false;
        alert("Publicación eliminada exitosamente.");
        this.cargarPublicaciones();
      } catch (error) {
        alert("Error al eliminar la publicación.");
        console.error(error);
      }
    },

    abrirModalVer(publicacion) { this.publicacionSeleccionada = publicacion; this.modalVer = true; },
    abrirModalEditar(publicacion) {
      this.formulario = { ...publicacion };
      const sr = publicacion.salary_range;
      this.salarioPrivado = !sr || parseFloat(sr) === 0;
      if (!this.salarioPrivado) this.formulario.salary_range = String(parseFloat(sr));
      this.salarioError = '';
      this.modalEditar = true;
    },
    abrirModalEliminar(publicacion) { this.publicacionSeleccionada = publicacion; this.modalEliminar = true; },
    abrirModalNuevaPublicacion() {
      this.formulario = new Publication({ status: 'Activa' });
      this.salarioPrivado = false;
      this.salarioError = '';
      this.modalEditar = true;
    },
    cerrarModalEditar() { this.modalEditar = false; this.salarioError = ''; },
    cambiarPagina(n) { if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n; },
    formatSalario(val) {
      if (!val) return 'Privado';
      const num = parseFloat(val);
      if (isNaN(num) || num === 0) return 'Privado';
      return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
  },
  mounted() { this.cargarPublicaciones(); }
};
</script>

<template>
  <div class="pub-root">

    <!-- CABECERA -->
    <div class="pub-header">
      <div class="pub-header__left">
        <div class="pub-header__icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
          </svg>
        </div>
        <div>
          <h2 class="pub-header__title">{{ $t("publicaciones") }}</h2>
          <p class="pub-header__sub">Gestiona y crea tus ofertas de empleo.</p>
        </div>
      </div>
      <button class="btn-primary" @click="abrirModalNuevaPublicacion">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
        {{ $t("nueva_publicacion") }}
      </button>
    </div>

    <!-- BUSCADOR -->
    <div class="pub-search-wrap">
      <div class="pub-search">
        <svg class="pub-search__icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="filtroTitulo" type="text" :placeholder="$t('buscar_por_titulo')" class="pub-search__input" />
      </div>
    </div>

    <!-- TABLA -->
    <div class="pub-table">
      <div class="pub-table__head">
        <span>{{ $t("columna_titulo") }}</span>
        <span>{{ $t("columna_estado") }}</span>
        <span>{{ $t("columna_aplicaciones") }}</span>
        <span>{{ $t("columna_acciones") }}</span>
      </div>

      <template v-if="publicacionesPaginadas.length > 0">
        <div v-for="publicacion in publicacionesPaginadas" :key="publicacion.id" class="pub-row">
          <div class="pub-row__cell pub-row__cell--title">
            <span class="pub-row__label">{{ $t('columna_titulo') }}</span>
            <span class="pub-row__title-text">{{ publicacion.title }}</span>
          </div>
          <div class="pub-row__cell pub-row__cell--center">
            <span class="pub-row__label">{{ $t('columna_estado') }}</span>
            <span class="badge" :class="(publicacion.status === 'Activa' || publicacion.status === 0) ? 'badge--active' : 'badge--draft'">
              {{ (publicacion.status === 0 || publicacion.status === 'Activa') ? 'Activa' : 'Borrador' }}
            </span>
          </div>
          <div class="pub-row__cell pub-row__cell--center">
            <span class="pub-row__label">{{ $t('columna_aplicaciones') }}</span>
            <span class="pub-row__count">{{ publicacion.applicationCount || 0 }}</span>
          </div>
          <div class="pub-row__cell pub-row__cell--actions">
            <button class="btn-action btn-action--view"   @click="abrirModalVer(publicacion)">{{ $t("accion_ver") }}</button>
            <button class="btn-action btn-action--edit"   @click="abrirModalEditar(publicacion)">{{ $t("accion_editar") }}</button>
            <button class="btn-action btn-action--delete" @click="abrirModalEliminar(publicacion)">{{ $t("accion_eliminar") }}</button>
          </div>
        </div>
      </template>

      <div v-else class="pub-empty">
        <div class="pub-empty__icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <p class="pub-empty__title">{{ $t("no_publicaciones_para_mostrar") }}</p>
        <p class="pub-empty__sub">Intenta crear una nueva o buscar otro título.</p>
      </div>
    </div>

    <!-- PAGINACIÓN -->
    <div class="pub-pagination" v-if="totalPaginas > 1">
      <button class="pag-btn pag-btn--nav" @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">{{ $t("anterior") }}</button>
      <div class="pag-numbers">
        <button v-for="n in totalPaginas" :key="n" class="pag-btn" :class="{ 'pag-btn--active': paginaActual === n }" @click="cambiarPagina(n)">{{ n }}</button>
      </div>
      <button class="pag-btn pag-btn--nav" @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">{{ $t("siguiente") }}</button>
    </div>

    <!-- MODAL VER -->
    <div v-if="modalVer" class="modal-overlay" @click.self="modalVer = false">
      <div class="modal modal--ver">
        <div class="modal__head">
          <h3 class="modal__title">{{ $t("detalle_publicacion") }}</h3>
          <button class="modal__close" @click="modalVer = false">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <div class="detail-field"><span class="detail-label">{{ $t("titulo") }}</span><p class="detail-value">{{ publicacionSeleccionada.title }}</p></div>
          <div class="detail-field">
            <span class="detail-label">{{ $t("estado") }}</span>
            <span class="badge" :class="(publicacionSeleccionada.status === 0 || publicacionSeleccionada.status === 'Activa') ? 'badge--active' : 'badge--draft'">
              {{ (publicacionSeleccionada.status === 0 || publicacionSeleccionada.status === 'Activa') ? 'Activa' : 'Borrador' }}
            </span>
          </div>
          <div class="detail-row">
            <div class="detail-field"><span class="detail-label">{{ $t("ubicacion") }}</span><p class="detail-value">{{ publicacionSeleccionada.location || 'No especificada' }}</p></div>
            <div class="detail-field"><span class="detail-label">{{ $t("salario") }}</span><p class="detail-value">{{ formatSalario(publicacionSeleccionada.salary_range) }}</p></div>
          </div>
          <div class="detail-field"><span class="detail-label">{{ $t("descripcion") }}</span><p class="detail-value detail-value--multiline">{{ publicacionSeleccionada.description }}</p></div>
          <div class="detail-field"><span class="detail-label">{{ $t("requisitos") }}</span><p class="detail-value detail-value--multiline">{{ publicacionSeleccionada.requirements }}</p></div>
        </div>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal--delete">
        <div class="modal__delete-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 class="modal__title modal__title--center">{{ $t("confirmar_eliminar_titulo") }}</h3>
        <p class="modal__subtitle">{{ $t("confirmar_eliminar_texto") }}</p>
        <div class="delete-preview"><p>{{ publicacionSeleccionada.title }}</p></div>
        <div class="modal__actions">
          <button class="btn-ghost" @click="modalEliminar = false">{{ $t("cancelar") }}</button>
          <button class="btn-danger" @click="eliminarPublicacionConfirmada">{{ $t("confirmar") }}</button>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <div v-if="modalEditar" class="modal-overlay" @click.self="cerrarModalEditar">
      <div class="modal modal--form">
        <div class="modal__head">
          <h3 class="modal__title">{{ formulario.id ? $t("editar_publicacion") : $t("nueva_publicacion") }}</h3>
          <button class="modal__close" @click="cerrarModalEditar">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- ── CHECKS VISUALES ── -->
        <div class="checks-panel">
          <p class="checks-title">Requisitos del formulario</p>
          <div class="checks-list">
            <div v-for="(check, key) in checks" :key="key" class="check-item" :class="check.ok ? 'check-item--ok' : 'check-item--pending'">
              <span class="check-icon">{{ check.ok ? '✓' : '○' }}</span>
              <span class="check-label">{{ check.label }}</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="guardarPublicacion" class="modal__form">

          <!-- Título -->
          <div class="form-field">
            <label class="form-label">
              {{ $t("titulo_puesto") }}
              <span class="char-count" :class="{ 'char-count--ok': checks.titulo.ok, 'char-count--error': (formulario.title?.length || 0) > 30 }">
                {{ formulario.title?.length || 0 }}/30
              </span>
            </label>
            <input
                v-model="formulario.title"
                type="text"
                maxlength="30"
                placeholder="Ej: Desarrollador Frontend"
                class="form-input"
                :class="{ 'form-input--ok': checks.titulo.ok, 'form-input--error': (formulario.title?.length || 0) > 0 && !checks.titulo.ok }"
            />
            <p v-if="(formulario.title?.length || 0) > 0 && !checks.titulo.ok" class="field-hint-msg field-hint-msg--warn">Mínimo 10 caracteres, máximo 30</p>
          </div>

          <!-- Descripción -->
          <div class="form-field">
            <label class="form-label">
              {{ $t("descripcion") }}
              <span class="char-count" :class="{ 'char-count--ok': checks.descripcion.ok, 'char-count--error': (formulario.description?.length || 0) > 600 }">
                {{ formulario.description?.length || 0 }}/600
              </span>
            </label>
            <textarea
                v-model="formulario.description"
                rows="4"
                maxlength="600"
                placeholder="Describe el puesto, responsabilidades y beneficios..."
                class="form-input form-input--textarea"
                :class="{ 'form-input--ok': checks.descripcion.ok, 'form-input--error': (formulario.description?.length || 0) > 0 && !checks.descripcion.ok }"
            ></textarea>
            <p v-if="(formulario.description?.length || 0) > 0 && !checks.descripcion.ok" class="field-hint-msg field-hint-msg--warn">Mínimo 20 caracteres, máximo 600</p>
          </div>

          <!-- Requisitos -->
          <div class="form-field">
            <label class="form-label">
              {{ $t("requisitos") }}
              <span class="label-opcional">(opcional)</span>
              <span class="char-count" :class="{ 'char-count--ok': checks.requisitos.ok, 'char-count--error': (formulario.requirements?.length || 0) > 300 }">
                {{ formulario.requirements?.length || 0 }}/300
              </span>
            </label>
            <textarea
                v-model="formulario.requirements"
                rows="3"
                maxlength="300"
                placeholder="Ej: 2 años de experiencia, conocimientos en Vue.js..."
                class="form-input form-input--textarea"
                :class="{ 'form-input--ok': checks.requisitos.ok && (formulario.requirements?.length || 0) > 0 }"
            ></textarea>
            <p v-if="(formulario.requirements?.length || 0) > 0 && !checks.requisitos.ok" class="field-hint-msg field-hint-msg--warn">Mínimo 10 caracteres si lo llenas, máximo 300</p>
          </div>

          <div class="form-row">
            <!-- Ubicación -->
            <div class="form-field">
              <label class="form-label">
                {{ $t("ubicacion") }}
                <span class="char-count" :class="{ 'char-count--ok': checks.ubicacion.ok, 'char-count--error': (formulario.location?.length || 0) > 20 }">
                  {{ formulario.location?.length || 0 }}/20
                </span>
              </label>
              <input
                  v-model="formulario.location"
                  type="text"
                  maxlength="20"
                  placeholder="Ej: Lima, Perú"
                  class="form-input"
                  :class="{ 'form-input--ok': checks.ubicacion.ok, 'form-input--error': (formulario.location?.length || 0) > 0 && !checks.ubicacion.ok }"
              />
              <p v-if="(formulario.location?.length || 0) > 0 && !checks.ubicacion.ok" class="field-hint-msg field-hint-msg--warn">Mínimo 3 caracteres, máximo 20</p>
            </div>

            <!-- Salario -->
            <div class="form-field">
              <label class="form-label">
                {{ $t("rango_salarial") }}
                <span class="label-opcional" v-if="salarioPrivado">— Privado</span>
              </label>
              <div class="salary-toggle" @click="salarioPrivado = !salarioPrivado">
                <div class="salary-toggle__track" :class="{ 'salary-toggle__track--on': salarioPrivado }">
                  <div class="salary-toggle__thumb"></div>
                </div>
                <span class="salary-toggle__label">Salario privado</span>
              </div>
              <div v-if="!salarioPrivado" class="salary-input-wrap">
                <span class="salary-prefix">$</span>
                <input
                    v-model="formulario.salary_range"
                    type="text"
                    inputmode="decimal"
                    placeholder="Ej: 2500.00"
                    class="form-input salary-input"
                    :class="{ 'form-input--error': salarioError, 'form-input--ok': checks.salario.ok && !salarioPrivado }"
                    @keydown="onSalarioKeydown"
                    autocomplete="off"
                />
              </div>
              <div v-else class="salary-private-box">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>El salario no se mostrará a los candidatos</span>
              </div>
              <p v-if="salarioError" class="field-hint-msg field-hint-msg--warn">{{ salarioError }}</p>
            </div>
          </div>

          <!-- Estado -->
          <div class="form-field">
            <label class="form-label">{{ $t("estado") }}</label>
            <select v-model="formulario.status" class="form-input form-input--select">
              <option value="Activa">{{ $t("activa") }}</option>
              <option value="Borrador">{{ $t("borrador") }}</option>
            </select>
          </div>

          <div class="modal__actions modal__actions--form">
            <button type="button" class="btn-ghost" @click="cerrarModalEditar">{{ $t("cancelar") }}</button>
            <button type="submit" class="btn-primary" :disabled="!formularioValido">{{ $t("guardar") }}</button>
          </div>

        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.pub-root {
  --c-deep:#0a3d2b; --c-mid:#006c49; --c-accent:#10b981;
  --c-light:#6ee7b7; --c-mist:#a7c4b5; --c-bg:#f5f4f0;
  --c-input:#f9fafb; --c-card:#ffffff; --c-text:#111827; --c-muted:#6b7280;
  --r-btn:12px; --r-card:20px; --r-input:12px;
  --shadow-card:0 1px 4px rgba(10,61,43,0.06),0 4px 16px rgba(10,61,43,0.05);
  --shadow-btn:0 4px 15px rgba(10,61,43,0.3);
  font-family:'DM Sans',sans-serif; background:var(--c-bg);
  min-height:100vh; padding:2.5rem 1.5rem 5rem; max-width:920px; margin:0 auto; color:var(--c-text);
}

.pub-header { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; margin-bottom:2.5rem; padding-bottom:2rem; border-bottom:1.5px solid rgba(10,61,43,0.08); }
.pub-header__left { display:flex; align-items:center; gap:1.25rem; }
.pub-header__icon { width:56px; height:56px; background:linear-gradient(135deg,#d1fae5,#a7f3d0); border-radius:18px; display:flex; align-items:center; justify-content:center; color:var(--c-mid); flex-shrink:0; box-shadow:0 4px 12px rgba(16,185,129,0.18); }
.pub-header__title { font-family:'Sora',sans-serif; font-size:2rem; font-weight:800; color:var(--c-text); margin:0 0 .25rem; line-height:1.1; }
.pub-header__sub { font-size:.875rem; color:var(--c-muted); margin:0; }

.btn-primary { display:inline-flex; align-items:center; gap:.5rem; background:var(--c-deep); color:#fff; font-family:'Sora',sans-serif; font-weight:600; font-size:.875rem; padding:14px 24px; border-radius:var(--r-btn); border:none; cursor:pointer; box-shadow:var(--shadow-btn); transition:background .2s,transform .2s; white-space:nowrap; }
.btn-primary:hover { background:var(--c-accent); transform:translateY(-1px); }
.btn-primary:disabled { opacity:.4; cursor:not-allowed; transform:none; }

.pub-search-wrap { margin-bottom:2rem; }
.pub-search { position:relative; max-width:400px; }
.pub-search__icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--c-mist); pointer-events:none; }
.pub-search:focus-within .pub-search__icon { color:var(--c-accent); }
.pub-search__input { width:100%; background:var(--c-input); border:1.5px solid #e5e7eb; border-radius:var(--r-input); padding:12px 16px 12px 44px; font-size:.9rem; font-family:'DM Sans',sans-serif; color:var(--c-text); outline:none; transition:border-color .2s; box-sizing:border-box; }
.pub-search__input:focus { border-color:var(--c-accent); box-shadow:0 0 0 3px rgba(16,185,129,.15); }
.pub-search__input::placeholder { color:var(--c-mist); }

.pub-table { display:flex; flex-direction:column; }
.pub-table__head { display:none; }
@media(min-width:768px){
  .pub-table__head { display:grid; grid-template-columns:2.5fr 1fr 1fr 1.6fr; background:var(--c-card); border-radius:var(--r-card) var(--r-card) 0 0; border:1px solid rgba(10,61,43,.07); border-bottom:none; overflow:hidden; }
  .pub-table__head span { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--c-muted); text-align:center; padding:1rem 1.25rem; border-right:1px solid rgba(10,61,43,.05); background:#fafaf8; }
  .pub-table__head span:first-child { text-align:left; } .pub-table__head span:last-child { border-right:none; }
}

.pub-row { background:var(--c-card); padding:1.25rem 1.5rem; border:1px solid rgba(10,61,43,.07); border-top:none; display:flex; flex-direction:column; gap:1rem; transition:background .18s,border-left-color .18s; border-left:3px solid transparent; }
.pub-row:first-of-type { border-top:1px solid rgba(10,61,43,.07); }
.pub-row:last-of-type { border-radius:0 0 var(--r-card) var(--r-card); }
.pub-row:hover { background:#fdfdf9; border-left-color:var(--c-accent); }
@media(min-width:768px){ .pub-row { display:grid; grid-template-columns:2.5fr 1fr 1fr 1.6fr; align-items:center; gap:0; padding:0; } }

.pub-row__cell { display:flex; flex-direction:column; gap:.25rem; }
.pub-row__cell--center { flex-direction:row; justify-content:space-between; align-items:center; }
@media(min-width:768px){
  .pub-row__cell { padding:1.1rem 1.25rem; border-right:1px solid rgba(10,61,43,.05); height:100%; justify-content:center; }
  .pub-row__cell:last-child { border-right:none; }
  .pub-row__cell--center { align-items:center; flex-direction:column; gap:0; }
  .pub-row__cell--title { border-right:1px solid rgba(10,61,43,.07); }
}
.pub-row__label { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--c-muted); }
@media(min-width:768px){ .pub-row__label { display:none; } }
.pub-row__title-text { font-family:'Sora',sans-serif; font-weight:700; font-size:.95rem; color:var(--c-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pub-row__count { font-family:'Sora',sans-serif; font-weight:700; font-size:1rem; color:var(--c-text); background:var(--c-bg); border:1px solid #e5e7eb; border-radius:8px; padding:4px 14px; display:inline-block; }

.pub-row__cell--actions { flex-direction:row; flex-wrap:wrap; gap:.5rem; justify-content:flex-end; padding-top:.75rem; border-top:1px solid #f0f0ec; }
@media(min-width:768px){ .pub-row__cell--actions { padding-top:0; border-top:none; justify-content:center; } }
.btn-action { flex:1; min-width:70px; padding:8px 12px; border-radius:var(--r-btn); font-family:'Sora',sans-serif; font-weight:600; font-size:.78rem; cursor:pointer; border:1.5px solid transparent; transition:background .2s,color .2s; white-space:nowrap; text-align:center; }
@media(min-width:768px){ .btn-action { flex:0 0 auto; } }
.btn-action--view { background:var(--c-bg); color:var(--c-muted); border-color:#e5e7eb; }
.btn-action--view:hover { background:#e9e8e4; color:var(--c-text); }
.btn-action--edit { background:#e6f7f1; color:var(--c-mid); border-color:rgba(16,185,129,.3); }
.btn-action--edit:hover { background:var(--c-accent); color:#fff; border-color:var(--c-accent); }
.btn-action--delete { background:#fef2f2; color:#dc2626; border-color:#fecaca; }
.btn-action--delete:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

.badge { display:inline-block; padding:4px 12px; border-radius:8px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
.badge--active { background:#e6f7f1; color:var(--c-mid); border:1px solid rgba(16,185,129,.3); }
.badge--draft  { background:var(--c-bg); color:var(--c-muted); border:1px solid #e5e7eb; }

.pub-empty { background:var(--c-card); border-radius:var(--r-card); padding:5rem 2rem; display:flex; flex-direction:column; align-items:center; text-align:center; border:1.5px dashed #d1d5db; }
.pub-empty__icon { width:64px; height:64px; background:var(--c-bg); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#d1d5db; margin-bottom:1.25rem; border:1px solid #e5e7eb; }
.pub-empty__title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.2rem; color:var(--c-text); margin:0 0 .5rem; }
.pub-empty__sub { font-size:.875rem; color:var(--c-muted); margin:0; }

.pub-pagination { display:flex; justify-content:center; align-items:center; gap:.5rem; margin-top:2rem; flex-wrap:wrap; }
.pag-numbers { display:flex; gap:.5rem; }
.pag-btn { background:var(--c-card); border:1.5px solid #e5e7eb; color:var(--c-muted); font-family:'Sora',sans-serif; font-weight:700; font-size:.875rem; width:40px; height:40px; border-radius:var(--r-btn); cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
.pag-btn:hover:not(:disabled) { background:var(--c-bg); color:var(--c-text); }
.pag-btn:disabled { opacity:.4; cursor:not-allowed; }
.pag-btn--nav { width:auto; padding:0 1rem; }
.pag-btn--active { background:var(--c-accent); color:#fff; border-color:var(--c-accent); box-shadow:0 4px 15px rgba(16,185,129,.35); }

.modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
.modal { background:var(--c-card); border-radius:var(--r-card); box-shadow:0 24px 60px rgba(10,61,43,.18); width:100%; max-height:90vh; overflow-y:auto; border:1px solid rgba(10,61,43,.06); }
.modal--ver    { max-width:520px; padding:2rem; }
.modal--delete { max-width:400px; padding:2.5rem; display:flex; flex-direction:column; align-items:center; text-align:center; }
.modal--form   { max-width:640px; padding:2rem 2rem 1.5rem; }

.modal__head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
.modal__title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.4rem; color:var(--c-text); margin:0; }
.modal__title--center { text-align:center; margin-bottom:.5rem; }
.modal__subtitle { font-size:.9rem; color:var(--c-muted); margin:0 0 1.25rem; }
.modal__close { width:36px; height:36px; background:var(--c-bg); border:1.5px solid #e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--c-muted); cursor:pointer; transition:background .2s; flex-shrink:0; }
.modal__close:hover { background:#e9e8e4; color:var(--c-text); }
.modal__body { display:flex; flex-direction:column; gap:1rem; }

.detail-field { display:flex; flex-direction:column; gap:.35rem; }
.detail-row { display:flex; gap:1rem; flex-wrap:wrap; }
.detail-row .detail-field { flex:1; min-width:140px; }
.detail-label { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--c-muted); }
.detail-value { font-weight:600; font-size:.9rem; color:var(--c-text); background:var(--c-bg); border-radius:var(--r-input); padding:.75rem 1rem; margin:0; border:1px solid #e5e7eb; }
.detail-value--multiline { white-space:pre-wrap; font-weight:400; font-size:.875rem; line-height:1.6; color:#374151; }

.modal__delete-icon { width:64px; height:64px; background:#fef2f2; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#ef4444; margin-bottom:1.25rem; border:1px solid #fecaca; }
.delete-preview { background:var(--c-bg); border-radius:var(--r-input); border:1px solid #e5e7eb; padding:.875rem 1.25rem; width:100%; margin-bottom:1.5rem; font-weight:700; font-size:.9rem; color:var(--c-text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.modal__actions { display:flex; gap:.75rem; width:100%; }
.modal__actions--form { border-top:1px solid #f0f0ec; padding-top:1.5rem; margin-top:.5rem; }
.btn-ghost { flex:1; background:var(--c-bg); color:var(--c-muted); border:1.5px solid #e5e7eb; border-radius:var(--r-btn); padding:14px 24px; font-family:'Sora',sans-serif; font-weight:600; font-size:.875rem; cursor:pointer; transition:background .2s; }
.btn-ghost:hover { background:#e9e8e4; color:var(--c-text); }
.btn-danger { flex:1; background:#ef4444; color:#fff; border:1.5px solid #ef4444; border-radius:var(--r-btn); padding:14px 24px; font-family:'Sora',sans-serif; font-weight:600; font-size:.875rem; cursor:pointer; box-shadow:0 4px 15px rgba(239,68,68,.3); transition:background .2s; }
.btn-danger:hover { background:#dc2626; }

/* ── CHECKS PANEL ── */
.checks-panel { background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:14px; padding:1rem 1.25rem; margin-bottom:.5rem; }
.checks-title { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--c-muted); margin:0 0 .75rem; }
.checks-list { display:flex; flex-direction:column; gap:.45rem; }
.check-item { display:flex; align-items:center; gap:8px; font-size:.8rem; transition:color .2s; }
.check-item--ok { color:#15803d; }
.check-item--pending { color:#9ca3af; }
.check-icon { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:800; flex-shrink:0; transition:all .2s; }
.check-item--ok .check-icon { background:#dcfce7; color:#15803d; }
.check-item--pending .check-icon { background:#f3f4f6; color:#d1d5db; }
.check-label { font-family:'DM Sans',sans-serif; }

/* ── FORM ── */
.modal__form { display:flex; flex-direction:column; gap:1.25rem; }
.form-field { display:flex; flex-direction:column; gap:.5rem; }
.form-row { display:flex; gap:1rem; flex-wrap:wrap; }
.form-row .form-field { flex:1; min-width:160px; }
.form-label { font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--c-muted); display:flex; align-items:center; gap:6px; }
.label-opcional { font-weight:400; text-transform:none; letter-spacing:0; color:var(--c-accent); }
.char-count { margin-left:auto; font-size:.68rem; font-weight:600; color:#9ca3af; font-family:'DM Sans',sans-serif; }
.char-count--ok { color:#10b981; }
.char-count--error { color:#ef4444; }

.form-input { background:var(--c-input); border:1.5px solid #e5e7eb; border-radius:var(--r-input); padding:12px 14px; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:600; color:var(--c-text); outline:none; transition:border-color .2s,box-shadow .2s; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:var(--c-accent); box-shadow:0 0 0 3px rgba(16,185,129,.15); }
.form-input--textarea { font-weight:400; line-height:1.6; resize:vertical; }
.form-input--select { cursor:pointer; appearance:none; }
.form-input--ok { border-color:#10b981 !important; }
.form-input--error { border-color:#ef4444 !important; box-shadow:0 0 0 3px rgba(239,68,68,.12) !important; }

.field-hint-msg { font-size:.75rem; font-weight:500; margin-top:2px; }
.field-hint-msg--warn { color:#b45309; }

.salary-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; width:fit-content; padding:4px 0; }
.salary-toggle__track { width:40px; height:22px; border-radius:99px; background:#e5e7eb; position:relative; transition:background .2s; flex-shrink:0; }
.salary-toggle__track--on { background:var(--c-accent); }
.salary-toggle__thumb { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 1px 4px rgba(0,0,0,.2); }
.salary-toggle__track--on .salary-toggle__thumb { transform:translateX(18px); }
.salary-toggle__label { font-size:.82rem; font-weight:500; color:var(--c-muted); }

.salary-input-wrap { position:relative; display:flex; align-items:center; }
.salary-prefix { position:absolute; left:14px; font-weight:700; color:var(--c-muted); font-size:.9rem; pointer-events:none; }
.salary-input { padding-left:28px !important; }

.salary-private-box { display:flex; align-items:center; gap:8px; background:var(--c-bg); border:1.5px dashed #d1d5db; border-radius:var(--r-input); padding:12px 14px; font-size:.82rem; color:var(--c-muted); font-style:italic; }

.field-error { display:flex; align-items:center; gap:6px; font-size:.78rem; color:#dc2626; font-weight:500; margin-top:2px; }
</style>