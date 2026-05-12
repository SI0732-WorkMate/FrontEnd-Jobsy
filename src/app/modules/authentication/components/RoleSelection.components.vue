<script>
import { selectRole } from "../services/roles.service.js";

export default {
  name: "RoleSelection.components",
  methods: {
    selectRole
  }
};
</script>

<template>
  <div class="roles-root">
    <div class="roles-card">

      <!-- Acento superior -->
      <div class="top-accent"></div>

      <!-- Logo -->
      <div class="logo-wrap">
        <img src="../../../../app/assets/logo.png" alt="Jobsy Logo" class="logo-img" />
      </div>

      <!-- Header -->
      <div class="roles-header">
        <h1 class="roles-title">¡Bienvenido a Jobsy!</h1>
        <p class="roles-sub">Elige tu rol para comenzar a conectar talento con oportunidades.</p>
      </div>

      <!-- Cards -->
      <div class="roles-grid">

        <!-- Postulante -->
        <div class="role-card" @click="selectRole('postulante')">
          <div class="role-img-wrap">
            <img
                src="../../../../app/assets/Postulantesss.png"
                alt="Postulante"
                class="role-img"
            />
          </div>
          <div class="role-body">
            <h2 class="role-name">Postulante</h2>
            <p class="role-desc">Busca empleo y conecta con empresas de forma sencilla.</p>
          </div>
          <button class="role-btn">
            <span>Seleccionar</span>
            <svg viewBox="0 0 20 20" fill="none" class="role-arrow">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Reclutador -->
        <div class="role-card" @click="selectRole('reclutador')">
          <div class="role-img-wrap">
            <img
                src="../../../../app/assets/Reclutador.png"
                alt="Reclutador"
                class="role-img"
            />
          </div>
          <div class="role-body">
            <h2 class="role-name">Reclutador</h2>
            <p class="role-desc">Publica vacantes y encuentra el mejor talento rápido.</p>
          </div>
          <button class="role-btn">
            <span>Seleccionar</span>
            <svg viewBox="0 0 20 20" fill="none" class="role-arrow">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.roles-root {
  min-height: 100vh;
  background: #f5f4f0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1.5rem;
  font-family: 'DM Sans', sans-serif;
}

.roles-card {
  width: 100%;
  max-width: 860px;
  background: #ffffff;
  border-radius: 28px;
  padding: 3rem 3rem 3.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.09);
  border: 1px solid rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
  animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.top-accent {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(90deg, #10b981, #0a3d2b);
}

.logo-wrap { margin-bottom: 2.5rem; }
.logo-img { height: 34px; width: auto; display: block; }

.roles-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.roles-title {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  color: #0f1a13;
  letter-spacing: -0.03em;
  margin-bottom: 0.6rem;
}
.roles-sub {
  font-size: 1rem;
  color: #7a8a80;
  font-weight: 400;
  max-width: 420px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── GRID DE ROLES ─── */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.role-card {
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s, background 0.25s;
}
.role-card:hover {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12);
  transform: translateY(-4px);
}

.role-img-wrap {
  width: 100%;
  height: 180px;
  background: #f0fdf4;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: background 0.25s;
}
.role-card:hover .role-img-wrap {
  background: #dcfce7;
}
.role-img {
  height: 130px;
  width: auto;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.role-card:hover .role-img {
  transform: scale(1.06);
}

.role-body { margin-bottom: 1.5rem; }
.role-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f1a13;
  letter-spacing: -0.02em;
  margin-bottom: 0.4rem;
}
.role-desc {
  font-size: 0.9rem;
  color: #7a8a80;
  line-height: 1.6;
  font-weight: 400;
}

.role-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0a3d2b;
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: auto;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(10, 61, 43, 0.25);
}
.role-btn:hover {
  background: #10b981;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}
.role-card:hover .role-btn {
  background: #10b981;
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}
.role-arrow {
  width: 16px; height: 16px;
  transition: transform 0.2s;
}
.role-card:hover .role-arrow {
  transform: translateX(3px);
}
</style>