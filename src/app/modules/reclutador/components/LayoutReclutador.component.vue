<script>
import HeaderComponent from "../../../shared/Header.component.vue";
import ReclutadorSidebar from "../../../shared/ReclutadorSidebar.vue";

export default {
  name: "LayoutReclutador.component",
  components: {
    HeaderComponent,
    ReclutadorSidebar,
  }
}
</script>

<template>
  <!--
    Contenedor raíz: h-screen y overflow-hidden evitan el scroll global de la ventana
    y mantienen el Header siempre visible en la parte superior.
  -->
  <div class="h-screen flex flex-col overflow-hidden" style="background-color: #f5f4f0; font-family: 'DM Sans', sans-serif;">

    <HeaderComponent />

    <!-- Contenedor del Dashboard (Sidebar + Contenido Principal) -->
    <div class="flex flex-1 overflow-hidden relative">

      <!-- Sidebar Estático -->
      <ReclutadorSidebar />

      <!-- Área principal de contenido (La única que hace Scroll) -->
      <main class="flex-1 relative overflow-y-auto transition-all duration-300">

        <!--
          Fondo cálido con textura sutil: sin imagen de fondo externa.
          Se usan capas de gradiente muy suaves para dar profundidad.
        -->
        <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <!-- Gradiente verde muy sutil en esquina superior izquierda -->
          <div
              class="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
              style="background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%); transform: translate(-30%, -30%);"
          ></div>
          <!-- Gradiente verde muy sutil en esquina inferior derecha -->
          <div
              class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
              style="background: radial-gradient(circle, rgba(10,61,43,0.05) 0%, transparent 70%); transform: translate(30%, 30%);"
          ></div>
          <!-- Patrón de puntos tenue -->
          <div
              class="absolute inset-0 opacity-[0.025] pointer-events-none"
              style="background-image: radial-gradient(circle, #0a3d2b 1px, transparent 1px); background-size: 28px 28px;"
          ></div>
        </div>

        <!-- Contenedor donde se inyectan las vistas (con el padding correcto) -->
        <div class="relative z-10 w-full min-h-full p-6 md:p-8 lg:p-10">
          <router-view></router-view>
        </div>

      </main>

    </div>
  </div>
</template>

<style scoped>
/* Importamos Sora y DM Sans desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

main {
  /* Scrollbar estilizado sutil */
  scrollbar-width: thin;
  scrollbar-color: #a7c4b5 transparent;
}

main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background-color: #a7c4b5;
  border-radius: 99px;
}

main::-webkit-scrollbar-thumb:hover {
  background-color: #10b981;
}
</style>