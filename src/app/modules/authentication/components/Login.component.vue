<script>
import { login } from "../services/roles.service.js";

export default {
  name: "Login.component",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    async handleLogin() {
      try {
        const credentials = { email: this.email, password: this.password };
        await login(credentials);
      } catch (error) {
        alert(error.message || "Credenciales incorrectas.");
      }
    }
  }
};
</script>

<template>
  <div class="login-root">

    <!-- LADO IZQUIERDO - Marca -->
    <div class="login-left">
      <div class="left-noise"></div>
      <div class="left-orb left-orb--1"></div>
      <div class="left-orb left-orb--2"></div>

      <div class="left-content">
        <div class="left-badge">
          <span class="badge-dot"></span>
          Más de 10,000 empresas confían en Jobsy
        </div>
        <h1 class="left-headline">
          Encuentra el trabajo<br />
          <em>de tus sueños.</em>
        </h1>
        <p class="left-sub">
          Descubre oportunidades, conecta con las mejores empresas y lleva tu carrera al siguiente nivel.
        </p>

        <div class="left-stats">
          <div class="stat">
            <span class="stat-num">50K+</span>
            <span class="stat-label">Empleos activos</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">98%</span>
            <span class="stat-label">Satisfacción</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">3x</span>
            <span class="stat-label">Más rápido</span>
          </div>
        </div>
      </div>
    </div>

    <!-- LADO DERECHO - Formulario -->
    <div class="login-right">
      <div class="form-card">

        <!-- Logo -->
        <router-link to="/select-role" class="logo-link">
          <img src="../../../../app/assets/logo.png" alt="Jobsy Logo" class="logo-img" />
        </router-link>

        <div class="form-header">
          <h2 class="form-title">Bienvenido de vuelta</h2>
          <p class="form-subtitle">Ingresa tus datos para continuar</p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="form-body">

          <div class="field">
            <label for="email" class="field-label">Correo electrónico</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.5L10 11.5L17.5 6.5M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="ejemplo@email.com"
                  required
                  class="field-input"
              />
            </div>
          </div>

          <div class="field">
            <label for="password" class="field-label">Contraseña</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M7 9V7a3 3 0 016 0v2M5 9h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  class="field-input"
              />
            </div>
          </div>

          <button type="submit" class="btn-login">
            <span>Iniciar Sesión</span>
            <svg viewBox="0 0 20 20" fill="none" class="btn-arrow">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

        </form>

        <p class="register-link">
          ¿No tienes una cuenta?
          <router-link to="/register">Regístrate aquí</router-link>
        </p>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-root {
  min-height: 100vh;
  display: flex;
  font-family: 'DM Sans', sans-serif;
  background: #f5f4f0;
}

/* ─── LADO IZQUIERDO ─── */
.login-left {
  display: none;
  position: relative;
  width: 50%;
  background: #0a3d2b;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 5rem 4rem;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .login-left { display: flex; }
}

.left-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.4;
  pointer-events: none;
}

.left-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.left-orb--1 {
  width: 400px; height: 400px;
  background: #10b981;
  opacity: 0.12;
  top: -100px; right: -100px;
}
.left-orb--2 {
  width: 300px; height: 300px;
  background: #006c49;
  opacity: 0.3;
  bottom: -80px; left: -60px;
}

.left-content { position: relative; z-index: 1; max-width: 480px; }

.left-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 6px 14px;
  border-radius: 100px;
  margin-bottom: 2rem;
}
.badge-dot {
  width: 6px; height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.left-headline {
  font-family: 'Sora', sans-serif;
  font-size: clamp(2.2rem, 3.5vw, 3.2rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
}
.left-headline em {
  font-style: italic;
  font-weight: 300;
  color: #6ee7b7;
}

.left-sub {
  color: #a7c4b5;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 300;
  margin-bottom: 2.5rem;
  max-width: 380px;
}

.left-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-num {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}
.stat-label {
  font-size: 0.72rem;
  color: #7aa890;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-divider {
  width: 1px; height: 36px;
  background: rgba(255,255,255,0.12);
}

/* ─── LADO DERECHO ─── */
.login-right {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1.5rem;
  background: #f5f4f0;
}
@media (min-width: 1024px) {
  .login-right { width: 50%; }
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem 2.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  animation: card-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.logo-link { display: block; margin-bottom: 2rem; }
.logo-img {
  height: 36px;
  width: auto;
  display: block;
  transition: opacity 0.2s;
}
.logo-img:hover { opacity: 0.75; }

.form-header { margin-bottom: 2rem; }
.form-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  color: #0f1a13;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}
.form-subtitle {
  font-size: 0.9rem;
  color: #7a8a80;
  font-weight: 400;
}

.form-body { display: flex; flex-direction: column; gap: 1.25rem; }

.field { display: flex; flex-direction: column; gap: 0.5rem; }
.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  width: 18px; height: 18px;
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s;
}
.field-input {
  width: 100%;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 13px 16px 13px 42px;
  font-size: 0.95rem;
  font-family: 'DM Sans', sans-serif;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.field-input::placeholder { color: #b0bab5; }
.field-input:focus {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.input-wrap:focus-within .input-icon { color: #10b981; }

.btn-login {
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #0a3d2b;
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(10, 61, 43, 0.3);
}
.btn-login:hover {
  background: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}
.btn-login:active { transform: translateY(0); }
.btn-arrow { width: 18px; height: 18px; transition: transform 0.2s; }
.btn-login:hover .btn-arrow { transform: translateX(3px); }

.register-link {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}
.register-link a {
  color: #10b981;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}
.register-link a:hover { color: #0a3d2b; }
</style>