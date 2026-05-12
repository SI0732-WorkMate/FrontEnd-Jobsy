<script>
import { register } from "../services/roles.service.js";
import router from '../../../routers/router.js';

export default {
  name: "Register.component",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      showPassword: false,
      selectedRole: null,
      errorMessage: "",
      esEmailDuplicado: false,
      cargando: false, // FIX: flag para evitar doble envío al hacer clic varias veces
    };
  },
  computed: {
    esReclutador() { return this.selectedRole === 'reclutador'; },
    rolLabel()     { return this.esReclutador ? 'Reclutador / Empresa' : 'Postulante'; },
    rolIcon()      { return this.esReclutador ? '🏢' : '👤'; },
    namePlaceholder() { return this.esReclutador ? 'Nombre de la empresa' : 'Tu nombre completo'; },

    /* ── Reglas de contraseña ── */
    rules() {
      const p = this.password;
      return {
        length:  p.length >= 8,
        upper:   /[A-Z]/.test(p),
        lower:   /[a-z]/.test(p),
        number:  /[0-9]/.test(p),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
      };
    },
    passwordStrength() {
      const passed = Object.values(this.rules).filter(Boolean).length;
      if (passed <= 1) return { level: 0, label: 'Muy débil',  color: '#ef4444' };
      if (passed === 2) return { level: 1, label: 'Débil',      color: '#f97316' };
      if (passed === 3) return { level: 2, label: 'Regular',    color: '#eab308' };
      if (passed === 4) return { level: 3, label: 'Fuerte',     color: '#10b981' };
      return              { level: 4, label: 'Muy fuerte', color: '#0a3d2b' };
    },
    passwordValid() {
      return Object.values(this.rules).every(Boolean);
    },
    showChecklist() {
      return this.password.length > 0;
    }
  },
  mounted() {
    this.selectedRole = localStorage.getItem('selectedRole');
    if (!this.selectedRole) router.push('/select-role');
  },
  methods: {
    async handleRegister() {
      // FIX: Si ya hay una petición en curso, ignorar clics adicionales
      if (this.cargando) return;

      this.errorMessage = "";
      this.esEmailDuplicado = false;

      if (!this.name || !this.email || !this.password) {
        this.errorMessage = "Por favor, completa todos los campos.";
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(this.email)) {
        this.errorMessage = "El correo electronico no tiene un formato valido.";
        return;
      }

      if (!this.passwordValid) {
        this.errorMessage = "La contraseña no cumple los requisitos de seguridad.";
        return;
      }

      // FIX: Bloquear el botón antes de lanzar el request
      this.cargando = true;

      try {
        const userData = { name: this.name, email: this.email, password: this.password };
        await register(userData);
        router.push('/login');
      } catch (error) {
        const backendMsg = error?.response?.data?.mensaje || error?.response?.data?.message || error?.message || "";

        if (backendMsg.toLowerCase().includes("ya existe")) {
          this.errorMessage = "Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?";
          this.esEmailDuplicado = true;
        } else {
          this.errorMessage = backendMsg || "Ocurrió un error al registrarse. Inténtalo de nuevo.";
          this.esEmailDuplicado = false;
        }
      } finally {
        // FIX: Siempre liberar el flag al terminar, haya error o no
        this.cargando = false;
      }
    }
  }
};
</script>

<template>
  <div class="register-root">

    <!-- ─── LADO IZQUIERDO ─── -->
    <div class="reg-left" :class="esReclutador ? 'reg-left--employer' : 'reg-left--candidate'">
      <div class="left-noise"></div>
      <div class="left-orb left-orb--1"></div>
      <div class="left-orb left-orb--2"></div>

      <div class="left-content">
        <div class="left-badge">
          <span class="badge-dot"></span>
          {{ esReclutador ? 'Publica ofertas y encuentra talento' : 'Únete a más de 50,000 profesionales' }}
        </div>
        <h1 class="left-headline">
          <template v-if="esReclutador">
            Encuentra el talento<br /><em>que tu empresa</em><br />necesita.
          </template>
          <template v-else>
            Tu próxima gran<br /><em>oportunidad</em><br />empieza aquí.
          </template>
        </h1>
        <p class="left-sub">
          <template v-if="esReclutador">Publica ofertas, revisa postulaciones y conecta con los mejores candidatos en minutos.</template>
          <template v-else>Crea tu perfil y empieza a explorar un mundo de posibilidades ilimitadas con la tecnología de Jobsy.</template>
        </p>

        <div class="left-steps">
          <template v-if="esReclutador">
            <div class="step"><div class="step-num">01</div><div class="step-info"><span class="step-title">Crea tu empresa</span><span class="step-desc">Registro en 2 minutos</span></div></div>
            <div class="step"><div class="step-num">02</div><div class="step-info"><span class="step-title">Publica ofertas</span><span class="step-desc">Llega a miles de candidatos</span></div></div>
            <div class="step"><div class="step-num">03</div><div class="step-info"><span class="step-title">Elige al mejor</span><span class="step-desc">Filtra y contacta fácilmente</span></div></div>
          </template>
          <template v-else>
            <div class="step"><div class="step-num">01</div><div class="step-info"><span class="step-title">Crea tu cuenta</span><span class="step-desc">Solo te toma 2 minutos</span></div></div>
            <div class="step"><div class="step-num">02</div><div class="step-info"><span class="step-title">Completa tu perfil</span><span class="step-desc">Destaca ante los reclutadores</span></div></div>
            <div class="step"><div class="step-num">03</div><div class="step-info"><span class="step-title">Aplica a empleos</span><span class="step-desc">Con un solo clic</span></div></div>
          </template>
        </div>
      </div>
    </div>

    <!-- ─── LADO DERECHO ─── -->
    <div class="reg-right">
      <div class="form-card">

        <router-link to="/select-role" class="logo-link">
          <img src="../../../../app/assets/logo.png" alt="Jobsy Logo" class="logo-img" />
        </router-link>

        <!-- Badge de rol -->
        <div class="role-badge" :class="esReclutador ? 'role-badge--employer' : 'role-badge--candidate'">
          <span class="role-badge__icon">{{ rolIcon }}</span>
          <span class="role-badge__text">Registrándote como <strong>{{ rolLabel }}</strong></span>
          <router-link to="/select-role" class="role-badge__change">Cambiar</router-link>
        </div>

        <div class="form-header">
          <h2 class="form-title">Crea tu cuenta</h2>
          <p class="form-subtitle">Empieza gratis, sin tarjeta de crédito</p>
        </div>

        <!-- ── Alerta de error ── -->
        <div v-if="errorMessage" class="alert-error">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <div class="alert-body">
            <span>{{ errorMessage }}</span>
            <router-link v-if="esEmailDuplicado" to="/login" class="alert-link">Ir al login →</router-link>
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="form-body" autocomplete="off">

          <!-- Nombre -->
          <div class="field">
            <label for="name" class="field-label">{{ esReclutador ? 'Nombre o empresa' : 'Nombre completo' }}</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input id="name" v-model="name" type="text" :placeholder="namePlaceholder" required class="field-input" autocomplete="off" :disabled="cargando" />
            </div>
          </div>

          <!-- Email -->
          <div class="field">
            <label for="reg-email" class="field-label">Correo electrónico</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.5L10 11.5L17.5 6.5M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input id="reg-email" v-model="email" type="email" placeholder="ejemplo@email.com" required class="field-input" autocomplete="off" :disabled="cargando" />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="field">
            <label for="reg-password" class="field-label">Contraseña</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M7 9V7a3 3 0 016 0v2M5 9h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                  id="reg-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Crea una contraseña segura"
                  required
                  class="field-input field-input--password"
                  autocomplete="new-password"
                  :disabled="cargando"
              />
              <button type="button" class="btn-eye" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'">
                <svg v-if="!showPassword" width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>

            <!-- ── Barra de fuerza ── -->
            <div v-if="showChecklist" class="strength-bar-wrap">
              <div class="strength-bar">
                <div
                    class="strength-fill"
                    :style="{ width: ((passwordStrength.level + 1) / 5 * 100) + '%', background: passwordStrength.color }"
                ></div>
              </div>
              <span class="strength-label" :style="{ color: passwordStrength.color }">{{ passwordStrength.label }}</span>
            </div>

            <!-- ── Checklist de requisitos ── -->
            <ul v-if="showChecklist" class="pwd-checklist">
              <li :class="rules.length  ? 'rule--ok' : 'rule--fail'"><span class="rule-icon">{{ rules.length  ? '✓' : '✕' }}</span> Mínimo 8 caracteres</li>
              <li :class="rules.upper   ? 'rule--ok' : 'rule--fail'"><span class="rule-icon">{{ rules.upper   ? '✓' : '✕' }}</span> Al menos una mayúscula (A–Z)</li>
              <li :class="rules.lower   ? 'rule--ok' : 'rule--fail'"><span class="rule-icon">{{ rules.lower   ? '✓' : '✕' }}</span> Al menos una minúscula (a–z)</li>
              <li :class="rules.number  ? 'rule--ok' : 'rule--fail'"><span class="rule-icon">{{ rules.number  ? '✓' : '✕' }}</span> Al menos un número (0–9)</li>
              <li :class="rules.special ? 'rule--ok' : 'rule--fail'"><span class="rule-icon">{{ rules.special ? '✓' : '✕' }}</span> Al menos un carácter especial (!@#$…)</li>
            </ul>
          </div>

          <!-- FIX: Botón deshabilitado mientras carga + texto/spinner de feedback -->
          <button
              type="submit"
              class="btn-register"
              :class="esReclutador ? 'btn-register--employer' : ''"
              :disabled="!passwordValid || cargando"
          >
            <!-- Estado normal -->
            <template v-if="!cargando">
              <span>Crear cuenta {{ rolIcon }}</span>
              <svg viewBox="0 0 20 20" fill="none" class="btn-arrow">
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            <!-- Estado cargando -->
            <template v-else>
              <svg class="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4" stroke-dashoffset="10"/>
              </svg>
              <span>Creando cuenta…</span>
            </template>
          </button>

          <p class="terms-note">
            Al registrarte aceptas nuestros
            <a href="#">Términos de servicio</a> y
            <a href="#">Política de privacidad</a>.
          </p>

        </form>

        <p class="login-link">
          ¿Ya tienes una cuenta?
          <router-link to="/login">Inicia sesión</router-link>
        </p>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.register-root { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }

/* ─── LADO IZQUIERDO ─── */
.reg-left { display:none; position:relative; width:50%; background:#0a3d2b; flex-direction:column; justify-content:center; align-items:flex-start; padding:5rem 4rem; overflow:hidden; transition:background 0.4s; }
.reg-left--employer { background:#1a2a4a; }
@media (min-width:1024px) { .reg-left { display:flex; } }

.left-noise { position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); opacity:0.4; pointer-events:none; }
.left-orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
.left-orb--1 { width:350px; height:350px; background:#10b981; opacity:0.12; top:-80px; right:-80px; }
.left-orb--2 { width:280px; height:280px; background:#006c49; opacity:0.3; bottom:-60px; left:-40px; }
.reg-left--employer .left-orb--1 { background:#3b82f6; }
.reg-left--employer .left-orb--2 { background:#1e40af; }

.left-content { position:relative; z-index:1; max-width:480px; }
.left-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#6ee7b7; font-size:0.78rem; font-weight:500; padding:6px 14px; border-radius:100px; margin-bottom:2rem; }
.reg-left--employer .left-badge { background:rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.3); color:#93c5fd; }
.badge-dot { width:6px; height:6px; background:#10b981; border-radius:50%; animation:pulse-dot 2s infinite; }
.reg-left--employer .badge-dot { background:#3b82f6; }
@keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.4} }

.left-headline { font-family:'Sora',sans-serif; font-size:clamp(2rem,3vw,2.8rem); font-weight:800; color:#fff; line-height:1.15; letter-spacing:-0.03em; margin-bottom:1.25rem; }
.left-headline em { font-style:italic; font-weight:300; color:#6ee7b7; }
.reg-left--employer .left-headline em { color:#93c5fd; }
.left-sub { color:#a7c4b5; font-size:1rem; line-height:1.7; font-weight:300; margin-bottom:2.5rem; max-width:380px; }
.reg-left--employer .left-sub { color:#94a3b8; }

.left-steps { display:flex; flex-direction:column; gap:1.25rem; }
.step { display:flex; align-items:center; gap:16px; }
.step-num { font-family:'Sora',sans-serif; font-size:0.7rem; font-weight:700; color:#10b981; letter-spacing:0.05em; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.reg-left--employer .step-num { color:#3b82f6; background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.25); }
.step-info { display:flex; flex-direction:column; gap:2px; }
.step-title { font-size:0.9rem; font-weight:500; color:#fff; }
.step-desc { font-size:0.78rem; color:#7aa890; }
.reg-left--employer .step-desc { color:#64748b; }

/* ─── LADO DERECHO ─── */
.reg-right { width:100%; display:flex; justify-content:center; align-items:center; padding:2rem 1.5rem; background:#f5f4f0; overflow-y:auto; }
@media (min-width:1024px) { .reg-right { width:50%; } }

.form-card { width:100%; max-width:440px; background:#fff; border-radius:24px; padding:2.5rem; box-shadow:0 4px 6px rgba(0,0,0,0.04),0 20px 60px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.06); margin:1.5rem 0; animation:card-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes card-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

.logo-link { display:block; margin-bottom:1.5rem; }
.logo-img { height:36px; width:auto; display:block; transition:opacity 0.2s; }
.logo-img:hover { opacity:0.75; }

/* ─── BADGE ROL ─── */
.role-badge { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:12px; margin-bottom:1.5rem; font-size:0.85rem; }
.role-badge--candidate { background:#ecfdf5; border:1.5px solid #a7f3d0; color:#065f46; }
.role-badge--employer  { background:#eff6ff; border:1.5px solid #bfdbfe; color:#1e40af; }
.role-badge__icon { font-size:1.1rem; }
.role-badge__text { flex:1; }
.role-badge__change { font-size:0.75rem; font-weight:600; text-decoration:none; padding:3px 8px; border-radius:6px; background:rgba(0,0,0,0.06); color:inherit; transition:background 0.2s; }
.role-badge__change:hover { background:rgba(0,0,0,0.12); }

.form-header { margin-bottom:1.25rem; }
.form-title { font-family:'Sora',sans-serif; font-size:1.65rem; font-weight:700; color:#0f1a13; letter-spacing:-0.02em; margin-bottom:0.35rem; }
.form-subtitle { font-size:0.9rem; color:#7a8a80; }

/* ─── ALERTA ERROR ─── */
.alert-error {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  border-radius: 12px; padding: 12px 14px;
  margin-bottom: 1rem;
  font-size: 0.85rem; color: #dc2626; font-weight: 500;
  line-height: 1.45;
}
.alert-error svg { flex-shrink: 0; margin-top: 1px; }
.alert-body { display: flex; flex-direction: column; gap: 4px; }
.alert-link { font-weight: 700; color: #dc2626; text-decoration: underline; width: fit-content; }

/* ─── FORM ─── */
.form-body { display:flex; flex-direction:column; gap:1.1rem; }
.field { display:flex; flex-direction:column; gap:0.45rem; }
.field-label { font-size:0.78rem; font-weight:600; color:#374151; letter-spacing:0.02em; text-transform:uppercase; }
.input-wrap { position:relative; display:flex; align-items:center; }
.input-icon { position:absolute; left:14px; width:18px; height:18px; color:#9ca3af; pointer-events:none; transition:color 0.2s; }
.field-input { width:100%; background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:12px; padding:13px 16px 13px 42px; font-size:0.95rem; font-family:'DM Sans',sans-serif; color:#111827; outline:none; transition:border-color 0.2s,box-shadow 0.2s,background 0.2s; }
.field-input--password { padding-right: 44px; }
.field-input::placeholder { color:#b0bab5; }
.field-input:focus { border-color:#10b981; background:#fff; box-shadow:0 0 0 4px rgba(16,185,129,0.1); }
.field-input:disabled { opacity: 0.6; cursor: not-allowed; }
.input-wrap:focus-within .input-icon { color:#10b981; }

/* ─── Toggle ojo ─── */
.btn-eye { position: absolute; right: 14px; background: none; border: none; padding: 0; cursor: pointer; color: #9ca3af; display: flex; align-items: center; transition: color 0.2s; }
.btn-eye:hover { color: #10b981; }
.btn-eye:focus { outline: none; }

/* ─── Barra de fuerza ─── */
.strength-bar-wrap { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.strength-bar { flex: 1; height: 5px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 99px; transition: width 0.35s ease, background 0.35s ease; }
.strength-label { font-size: 0.75rem; font-weight: 600; white-space: nowrap; transition: color 0.3s; }

/* ─── Checklist ─── */
.pwd-checklist { list-style: none; display: flex; flex-direction: column; gap: 5px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 12px 14px; margin-top: 4px; }
.pwd-checklist li { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; font-weight: 400; transition: color 0.2s; }
.rule-icon { font-size: 0.7rem; font-weight: 700; width: 16px; text-align: center; }
.rule--ok   { color: #10b981; }
.rule--fail { color: #9ca3af; }

/* ─── Botón submit ─── */
.btn-register { margin-top:0.5rem; width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#0a3d2b; color:#fff; font-family:'Sora',sans-serif; font-size:0.95rem; font-weight:600; padding:14px 24px; border:none; border-radius:12px; cursor:pointer; transition:background 0.2s,transform 0.15s,box-shadow 0.2s; box-shadow:0 4px 15px rgba(10,61,43,0.3); }
.btn-register--employer { background:#1e40af; box-shadow:0 4px 15px rgba(30,64,175,0.3); }
.btn-register:hover:not(:disabled) { background:#10b981; transform:translateY(-1px); box-shadow:0 6px 20px rgba(16,185,129,0.35); }
.btn-register--employer:hover:not(:disabled) { background:#3b82f6; box-shadow:0 6px 20px rgba(59,130,246,0.35); }
.btn-register:active:not(:disabled) { transform:translateY(0); }
.btn-register:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-arrow { width:18px; height:18px; transition:transform 0.2s; }
.btn-register:hover:not(:disabled) .btn-arrow { transform:translateX(3px); }

/* ─── Spinner de carga ─── */
.spinner {
  width: 18px; height: 18px;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.terms-note { font-size:0.78rem; color:#9ca3af; text-align:center; line-height:1.5; }
.terms-note a { color:#10b981; text-decoration:none; }

.login-link { margin-top:1.75rem; text-align:center; font-size:0.875rem; color:#6b7280; }
.login-link a { color:#10b981; font-weight:600; text-decoration:none; margin-left:4px; }
.login-link a:hover { color:#0a3d2b; }
</style>