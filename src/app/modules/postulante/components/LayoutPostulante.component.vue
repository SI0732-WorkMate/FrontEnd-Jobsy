<script>
import HeaderComponent from "../../../shared/Header.component.vue";
import PostulanteSidebar from "../../../shared/PostulanteSidebar.vue";

export default {
  name: "LayoutPostulante.component",
  components: {
    HeaderComponent,
    PostulanteSidebar,
  }
}
</script>

<template>
  <div class="layout-root">

    <!-- Header fijo -->
    <HeaderComponent class="layout-header" />

    <!-- Cuerpo: sidebar + contenido -->
    <div class="layout-body">

      <div class="layout-sidebar">
        <PostulanteSidebar />
      </div>

      <main class="layout-main">
        <div class="layout-inner">
          <router-view></router-view>
        </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.layout-root {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  font-family: 'DM Sans', sans-serif;
}

.layout-header {
  flex: none;
  position: relative;
  z-index: 30;
  border-bottom: 1px solid #f0f0ee;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-sidebar {
  flex: none;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #f0f0ee;
  background: #ffffff;
  z-index: 20;
  /* Scrollbar sutil */
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.layout-sidebar::-webkit-scrollbar { width: 4px; }
.layout-sidebar::-webkit-scrollbar-track { background: transparent; }
.layout-sidebar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.layout-main {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background: #f5f4f0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.layout-main::-webkit-scrollbar { width: 4px; }
.layout-main::-webkit-scrollbar-track { background: transparent; }
.layout-main::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.layout-inner {
  width: 100%;
  min-height: 100%;
}
</style>