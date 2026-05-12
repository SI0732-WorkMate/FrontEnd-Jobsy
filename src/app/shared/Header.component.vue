<script>
export default {
  name: "Header.component"
}
</script>

<template>
  <header class="jobsy-header">
    <div class="jobsy-header__inner">
      <div class="jobsy-header__logo-wrap">
        <img
            src="../assets/logo.png"
            alt="Jobsy Logo"
            class="jobsy-header__logo"
        />
      </div>

      <!-- Accent line animado -->
      <div class="jobsy-header__accent"></div>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.jobsy-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(245, 244, 240, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(10, 61, 43, 0.08);
  box-shadow:
      0 1px 0 rgba(255,255,255,0.8) inset,
      0 2px 16px rgba(10, 61, 43, 0.05);
  transition: box-shadow 0.3s ease, background 0.3s ease;
}

.jobsy-header__inner {
  width: 100%;
  padding: 0.55rem 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}

@media (min-width: 768px) {
  .jobsy-header__inner {
    padding: 0.45rem 1.5rem;
    justify-content: flex-start;
  }
}

@media (min-width: 1024px) {
  .jobsy-header__inner {
    padding: 0.45rem 2rem;
  }
}

/* Línea de acento verde en la parte inferior del header */
.jobsy-header__accent {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(16,185,129,0.0) 10%,
      rgba(16,185,129,0.35) 40%,
      rgba(16,185,129,0.35) 60%,
      rgba(16,185,129,0.0) 90%,
      transparent 100%
  );
  pointer-events: none;
}

.jobsy-header__logo-wrap {
  display: flex;
  align-items: center;
  opacity: 1;
  transition: opacity 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}
.jobsy-header__logo-wrap:hover {
  opacity: 0.82;
  transform: translateY(-1px);
}

.jobsy-header__logo {
  height: 52px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(10, 61, 43, 0.12));
}

@media (min-width: 768px) {
  .jobsy-header__logo { height: 46px; }
}

@media (min-width: 1024px) {
  .jobsy-header__logo { height: 52px; }
}
</style>