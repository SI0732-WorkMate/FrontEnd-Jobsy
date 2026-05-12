<script>
import { logout } from '../modules/authentication/services/roles.service.js';
import LanguageSwitcher from "../../components/languague-switcher.vue";

export default {
  name: "PostulanteSidebar",
  components: { LanguageSwitcher },
  data() {
    return {
      isMobileMenuOpen: false
    }
  },
  methods: {
    logout,
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
  },
  mounted() {
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && this.isMobileMenuOpen) {
        const sidebar = this.$refs.sidebar;
        const hamburger = this.$refs.hamburger;
        if (sidebar && hamburger && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
          this.closeMobileMenu();
        }
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isMobileMenuOpen = false;
      }
    });
  }
}
</script>

<template>
  <div class="sidebar-root">

    <!-- Botón hamburguesa (solo móvil) -->
    <button ref="hamburger" @click="toggleMobileMenu" class="hamburger-btn" aria-label="Abrir menú">
      <span class="hamburger-line" :class="isMobileMenuOpen ? 'hamburger-line--top-open' : ''"></span>
      <span class="hamburger-line" :class="isMobileMenuOpen ? 'hamburger-line--mid-open' : ''"></span>
      <span class="hamburger-line" :class="isMobileMenuOpen ? 'hamburger-line--bot-open' : ''"></span>
    </button>

    <!-- Overlay (solo móvil) -->
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="closeMobileMenu"></div>

    <!-- Sidebar -->
    <aside ref="sidebar" class="sidebar" :class="isMobileMenuOpen ? 'sidebar--open' : ''">

      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="sidebar-brand__dot"></div>
        <span class="sidebar-brand__text">Menú</span>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <ul class="sidebar-nav__list">

          <li>
            <router-link to="/postulante/panel-principal" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("panel") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/postulante/ofertas-empleo" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("buscar_empleos") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/postulante/postulaciones" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("postulaciones") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/postulante/bandeja-entrada" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("bandeja") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/postulante/asistencia-ia" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                   </svg>
              </span>
              <span class="nav-link__label">Asistencia IA</span>
            </router-link>
          </li>

          <li>
            <router-link to="/postulante/perfil" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("perfil") }}</span>
            </router-link>
          </li>

        </ul>
      </nav>

      <!-- Logout -->
      <div class="sidebar-logout-wrap">
        <button @click="logout" class="logout-btn">
          <svg class="logout-btn__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {{ $t("cerrar_sesion") }}
        </button>
      </div>

    </aside>
  </div>
</template>

<style>
/* ⚠️  SIN scoped — permite que Vue Router aplique active-class correctamente */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Nav link base ── */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.875rem;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Sora', sans-serif;
  font-size: 0.855rem;
  font-weight: 600;
  color: #6b7280;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  border: 1px solid transparent;
}
.nav-link:hover {
  background: rgba(16,185,129,0.07);
  color: #111827;
  border-color: rgba(16,185,129,0.12);
}

/* ── ACTIVE STATE — fix principal ── */
.nav-link--active,
.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, #0a3d2b 0%, #006c49 100%) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 16px rgba(10,61,43,0.28), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

.nav-link__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.nav-link__icon svg { width: 100%; height: 100%; }
.nav-link:hover .nav-link__icon { transform: scale(1.1); }

.nav-link--active .nav-link__icon,
.nav-link.router-link-active .nav-link__icon,
.nav-link.router-link-exact-active .nav-link__icon {
  transform: scale(1.05);
  filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
}

.nav-link__label { line-height: 1; }
</style>