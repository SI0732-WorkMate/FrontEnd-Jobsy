<script>
import { getMyInboxMessages } from "../services/Notification.service.js";
import axios from "axios";

const API_URL = "import.meta.env.VITE_API_URL/api";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default {
  name: "BandejaEntrada",
  data() {
    return { messages: [], isLoading: true, mensajeActivo: null };
  },
  methods: {
    async cargarMensajes() {
      this.isLoading = true;
      try {
        const messagesFromApi = await getMyInboxMessages();

        this.messages = await Promise.all(
            messagesFromApi.map(async (msg) => {
              let senderLabel = `Empleador #${msg.sender_id}`;
              try {
                const userRes = await axios.get(
                    `${API_URL}/User/${msg.sender_id}`,
                    getAuthHeaders()
                );
                const u = userRes.data;
                senderLabel = u.description
                    ? `${u.name} — ${u.description}`
                    : u.name;
              } catch {}

              return {
                id: msg.id,
                publicationTitle: senderLabel,
                content: msg.content,
                sent_at: msg.sent_at,
              };
            })
        );
      } catch (error) {
        console.error("Error al cargar la bandeja de entrada:", error);
        alert("No se pudieron cargar los mensajes.");
      } finally {
        this.isLoading = false;
      }

    },
  },
  mounted() {
    this.cargarMensajes();
  },
};
</script>

<template>
  <div class="be-root">

    <!-- Cabecera -->
    <div class="be-header">
      <div class="be-header__icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <h2 class="be-title">Bandeja de Entrada</h2>
        <p class="be-subtitle">Gestiona los mensajes y actualizaciones de tus empleadores.</p>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="isLoading" class="be-state">
      <div class="spinner">
        <div class="spinner-track"></div>
        <div class="spinner-fill"></div>
      </div>
      <p class="state-label">Cargando mensajes...</p>
    </div>

    <!-- Lista de mensajes -->
    <div v-else-if="messages.length > 0" class="be-list">
      <div v-for="(notification, index) in messages" :key="notification.id" class="msg-card" :style="{ animationDelay: index * 0.06 + 's' }" @click="mensajeActivo = notification" role="button" tabindex="0" @keyup.enter="mensajeActivo = notification">

        <div class="msg-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>

        <div class="msg-body">
          <div class="msg-top">
            <p class="msg-title">{{ notification.publicationTitle }}</p>
            <span v-if="notification.sent_at" class="msg-date">
              {{ new Date(notification.sent_at).toLocaleDateString() }}
            </span>
          </div>
          <p class="msg-content">{{ notification.content }}</p>
        </div>

        <div class="msg-arrow">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

      </div>
    </div>

    <!-- Vacío -->
    <div v-else class="be-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="state-title">{{ $t("sin_notificaciones") }}</p>
      <p class="state-label">Aquí aparecerán los mensajes de los reclutadores.</p>
    </div>

    <!-- Modal mensaje completo -->
    <Transition name="msg-modal">
      <div v-if="mensajeActivo" class="be-overlay" @click.self="mensajeActivo = null">
        <div class="be-modal">

          <button class="be-modal__close" @click="mensajeActivo = null" aria-label="Cerrar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Avatar + remitente -->
          <div class="be-modal__sender">
            <div class="be-modal__avatar">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div>
              <p class="be-modal__name">{{ mensajeActivo.publicationTitle }}</p>
              <p class="be-modal__date" v-if="mensajeActivo.sent_at">
                {{ new Date(mensajeActivo.sent_at).toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) }}
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="be-modal__divider"></div>

          <!-- Mensaje completo -->
          <div class="be-modal__body">
            <p class="be-modal__content">{{ mensajeActivo.content }}</p>
          </div>

          <button @click="mensajeActivo = null" class="be-modal__btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Entendido
          </button>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.be-root {
  --c-deep:   #0a3d2b;
  --c-mid:    #006c49;
  --c-accent: #10b981;
  --c-bg:     #f5f4f0;
  --c-card:   #ffffff;
  --c-text:   #111827;
  --c-muted:  #6b7280;

  max-width: 760px;
  margin: 2.5rem auto;
  padding: 0 1.25rem 4rem;
  font-family: 'DM Sans', sans-serif;
}

/* ── CABECERA ── */
.be-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.75rem;
  border-bottom: 1.5px solid rgba(10,61,43,0.08);
}

.be-header__icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-mid);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16,185,129,0.18);
}
.be-header__icon svg { width: 26px; height: 26px; }

.be-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
  line-height: 1.1;
}
.be-subtitle {
  font-size: 0.875rem;
  color: var(--c-muted);
  margin: 0;
}

/* ── ESTADO GENÉRICO ── */
.be-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
  background: var(--c-card);
  border-radius: 20px;
  border: 1.5px dashed #d1d5db;
}

.state-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}
.state-label {
  font-size: 0.875rem;
  color: var(--c-muted);
  margin: 0;
}

/* ── SPINNER ── */
.spinner { position: relative; width: 48px; height: 48px; }
.spinner-track, .spinner-fill {
  position: absolute; inset: 0;
  border-radius: 50%; border: 3px solid transparent;
}
.spinner-track { border-color: rgba(10,61,43,0.08); }
.spinner-fill { border-top-color: var(--c-accent); animation: spin 0.75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── EMPTY ICON ── */
.empty-icon {
  width: 64px; height: 64px;
  background: var(--c-bg);
  border: 1.5px solid #e5e7eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #d1d5db;
}
.empty-icon svg { width: 28px; height: 28px; }

/* ── LISTA ── */
.be-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--c-card);
  border-radius: 20px;
  border: 1px solid rgba(10,61,43,0.08);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(10,61,43,0.05), 0 8px 32px rgba(10,61,43,0.06);
}

/* ── MENSAJE ── */
.msg-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(10,61,43,0.06);
  cursor: pointer;
  transition: background 0.18s;
  position: relative;
  border-left: 3px solid transparent;
  animation: slide-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
.msg-card:last-child { border-bottom: none; }
.msg-card:hover {
  background: #fafdf9;
  border-left-color: var(--c-accent);
}

/* Avatar */
.msg-avatar {
  flex-shrink: 0;
  width: 46px; height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0a3d2b 0%, #10b981 100%);
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 3px 10px rgba(10,61,43,0.22);
  transition: transform 0.2s, box-shadow 0.2s;
}
.msg-card:hover .msg-avatar {
  transform: scale(1.06);
  box-shadow: 0 5px 14px rgba(10,61,43,0.28);
}
.msg-avatar svg { width: 22px; height: 22px; }

/* Body */
.msg-body { flex: 1; min-width: 0; }
.msg-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.msg-title {
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-text);
  transition: color 0.18s;
}
.msg-card:hover .msg-title { color: var(--c-deep); }

.msg-date {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--c-muted);
  background: var(--c-bg);
  border: 1px solid #e5e7eb;
  padding: 3px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.msg-content {
  font-size: 0.855rem;
  color: var(--c-muted);
  line-height: 1.55;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Arrow */
.msg-arrow {
  flex-shrink: 0;
  color: #d1d5db;
  transition: color 0.18s, transform 0.18s;
}
.msg-arrow svg { width: 18px; height: 18px; }
.msg-card:hover .msg-arrow {
  color: var(--c-accent);
  transform: translateX(3px);
}

/* ── MODAL MENSAJE ── */
.msg-modal-enter-active, .msg-modal-leave-active { transition: opacity 0.22s ease; }
.msg-modal-enter-from, .msg-modal-leave-to { opacity: 0; }
.msg-modal-enter-active .be-modal, .msg-modal-leave-active .be-modal { transition: transform 0.26s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease; }
.msg-modal-enter-from .be-modal, .msg-modal-leave-to .be-modal { transform: translateY(18px) scale(0.96); opacity: 0; }

.be-overlay {
  position: fixed; inset: 0;
  background: rgba(10,61,43,0.28);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
  overflow-y: auto;
}

.be-modal {
  position: relative;
  width: 100%; max-width: 520px;
  background: #fff;
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 24px 80px rgba(10,61,43,0.18);
  max-height: 90vh;
  overflow-y: auto;
}

.be-modal__close {
  position: absolute; top: 18px; right: 18px;
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.be-modal__close:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

.be-modal__sender { display: flex; align-items: center; gap: 14px; margin-bottom: 1.25rem; }

.be-modal__avatar {
  width: 50px; height: 50px; flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #0a3d2b 0%, #10b981 100%);
  display: flex; align-items: center; justify-content: center;
  color: white; box-shadow: 0 4px 12px rgba(10,61,43,0.22);
}
.be-modal__avatar svg { width: 24px; height: 24px; }

.be-modal__name { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0 0 4px; }
.be-modal__date { font-size: 0.72rem; color: #9ca3af; margin: 0; text-transform: capitalize; }

.be-modal__divider { height: 1px; background: #f0f0ee; margin-bottom: 1.25rem; }

.be-modal__body {
  background: #f9fafb; border: 1.5px solid #e5e7eb;
  border-radius: 14px; padding: 1.25rem;
  margin-bottom: 1.5rem; min-height: 100px;
}
.be-modal__content {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem; color: #374151;
  line-height: 1.7; margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.be-modal__btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px;
  background: #0a3d2b; color: #fff;
  font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
  border: none; border-radius: 12px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(10,61,43,0.25);
  transition: background 0.2s, transform 0.15s;
}
.be-modal__btn:hover { background: #10b981; transform: translateY(-1px); }
</style>