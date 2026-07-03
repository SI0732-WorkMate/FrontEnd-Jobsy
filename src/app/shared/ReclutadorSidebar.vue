<script>
import { logout } from '../modules/authentication/services/roles.service.js';
import LanguageSwitcher from "../../components/languague-switcher.vue";

export default {
  name: "ReclutadorSidebar",
  components: { LanguageSwitcher },
  data() {
    return {
      isMobileMenuOpen: false
    };
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
    <button
        ref="hamburger"
        @click="toggleMobileMenu"
        class="hamburger-btn"
        aria-label="Abrir menú"
    >
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
            <router-link to="/reclutador/panel-principal" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
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
            <router-link to="/reclutador/publicaciones" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("publicaciones") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/reclutador/candidatos" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("candidatos") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/reclutador/entrevistas" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </span>
              <span class="nav-link__label">Entrevistas</span>
            </router-link>
          </li>

          <li>
            <router-link to="/reclutador/analiticas" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("analiticas") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/reclutador/asistencia-ia" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.28 8.6l-.7-1.74-1.74-.7c-.32-.13-.32-.6 0-.72l1.74-.7.7-1.74c.13-.32.6-.32.72 0l.7 1.74 1.74.7c.32.13.32.6 0 .72l-1.74.7-.7 1.74c-.13.32-.6.32-.72 0zm-4.28 1.4L12.5 4.5c-.18-.44-.82-.44-1 0L9 10l-5.5 2.5c-.44.18-.44.82 0 1L9 16l2.5 5.5c.18.44.82.44 1 0l2.5-5.5 5.5-2.5c.44-.18.44-.82 0-1L15 10z"/>
                </svg>
              </span>
              <span class="nav-link__label">{{ $t("asistencia_ia") }}</span>
            </router-link>
          </li>

          <li>
            <router-link to="/reclutador/perfil" @click="closeMobileMenu" class="nav-link" active-class="nav-link--active">
              <span class="nav-link__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
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

/* ── Hamburger ── */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 60;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(10,61,43,0.1);
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(10,61,43,0.1);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  padding: 0;
}
.hamburger-btn:hover {
  background: #ecfdf5;
  border-color: rgba(16,185,129,0.3);
}
@media (min-width: 769px) { .hamburger-btn { display: none; } }

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: #374151;
  border-radius: 99px;
  transition: transform 0.28s ease, opacity 0.2s ease;
  transform-origin: left center;
}
.hamburger-line--top-open { transform: rotate(45deg) translateX(2px); background: #10b981; }
.hamburger-line--mid-open { opacity: 0; transform: translateX(8px); }
.hamburger-line--bot-open { transform: rotate(-45deg) translateX(2px); background: #10b981; }

/* ── Overlay ── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(10,61,43,0.3);
  backdrop-filter: blur(4px);
  z-index: 40;
}
@media (max-width: 768px) { .sidebar-overlay { display: block; } }

/* ── Sidebar shell ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 220px;
  background: #ffffff;
  border-right: 1px solid rgba(10,61,43,0.08);
  box-shadow: 4px 0 30px rgba(10,61,43,0.06);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 5.5rem 0.875rem 1.5rem;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto;
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }
.sidebar--open { transform: translateX(0); }

@media (min-width: 769px) {
  .sidebar {
    position: static;
    transform: translateX(0);
    height: 100%;
    padding: 1.75rem 0.875rem 1.5rem;
    box-shadow: none;
    flex-shrink: 0;
  }
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.625rem;
  margin-bottom: 1.5rem;
}
.sidebar-brand__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
  animation: pulse-dot 2.5s infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(16,185,129,0.08); }
}
.sidebar-brand__text {
  font-family: 'Sora', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #6b7280;
}

/* ── Nav ── */
.sidebar-nav { flex-grow: 1; overflow-y: auto; scrollbar-width: none; }
.sidebar-nav::-webkit-scrollbar { display: none; }
.sidebar-nav__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

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
  position: relative;
  border: 1px solid transparent;
}
.nav-link:hover {
  background: rgba(16,185,129,0.07);
  color: #111827;
  border-color: rgba(16,185,129,0.12);
}

/* ── ACTIVE STATE — el fix principal ── */
.nav-link--active,
.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, #0a3d2b 0%, #006c49 100%) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 16px rgba(10,61,43,0.28), inset 0 1px 0 rgba(255,255,255,0.1) !important;
}

/* ── Icono ── */
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

/* ── Language ── */
.sidebar-lang {
  margin: 1.25rem 0 0.5rem;
  padding: 0 0.25rem;
}

/* ── Logout ── */
.sidebar-logout-wrap {
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(10,61,43,0.07);
  flex-shrink: 0;
}
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(239,68,68,0.15);
  background: transparent;
  font-family: 'Sora', sans-serif;
  font-size: 0.855rem;
  font-weight: 700;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s;
  outline: none;
}
.logout-btn:hover {
  background: #fef2f2;
  border-color: rgba(239,68,68,0.3);
}
.logout-btn__icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.logout-btn:hover .logout-btn__icon { transform: translateX(-3px); }
</style>