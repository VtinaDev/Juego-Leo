<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="header-transparent">
      <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <RouterLink class="brand brand-logo-link" to="/">
          <img class="brand-logo" src="/logo/app-icon.PNG" alt="Juego & Leo" />
        </RouterLink>

        <div v-if="$route.name === 'game'" class="stage-indicator-panel header-panel">
          <div class="indicator-row">
            <div class="indicator-title-block">
              <div class="stage-meta">
                <div class="stage-texts">
                  <span class="indicator-title">{{ levelNumber }} · Etapa {{ $route.params.stageId }}</span>
                </div>
              </div>
            </div>
            <div class="indicator-item">
              <img src="/icons/star.PNG" alt="Estrellas" />
              <div class="indicator-meta">
                <span class="indicator-label">Estrellas</span>
                <span class="indicator-count">12</span>
              </div>
            </div>
            <div class="indicator-item">
              <img src="/icons/trophy.png" alt="Trofeos" />
              <div class="indicator-meta">
                <span class="indicator-label">Trofeos</span>
                <span class="indicator-count">34</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ml-auto flex gap-3 nav-icons-wrapper">
          <RouterLink class="btn btn-icon" to="/levels" aria-label="Niveles">
            <img src="/icons/order.PNG" alt="Niveles" />
          </RouterLink>
          <RouterLink class="btn btn-icon" to="/mapview" aria-label="Mapa">
            <img src="/icons/mapa.PNG" alt="Mapa" />
          </RouterLink>
          <RouterLink class="btn btn-icon" to="/profile" aria-label="Perfil">
            <img src="/icons/perfil.PNG" alt="Perfil" />
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Main router outlet -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <!-- 👇 Asegúrate de que este router-view esté presente -->
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="footer-wave mt-10">
      <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-700 text-center space-y-2">
        <div class="flex justify-center gap-4 text-green-700">
          <RouterLink to="/subscribe" class="underline">Suscripción</RouterLink>
          <RouterLink to="/aboutgame" class="underline">Sobre el juego</RouterLink>
        </div>
        <div>© {{ new Date().getFullYear() }} Juego Leo · Todos los derechos reservados</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const levelNumber = computed(() => {
  const raw = route.params.levelId ?? route.params.level ?? 1
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
</script>

<style scoped>
 .stage-indicator-panel {
  background: rgba(248, 247, 232, 0.65);
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  padding: 0.65rem 0.9rem;
  border: 1px solid rgba(90, 59, 26, 0.12);
  backdrop-filter: blur(8px);
 }
 .header-panel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
 }
 .indicator-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: center;
  gap: 0.75rem;
  color: #5a3b1a;
  font-weight: 700;
  font-size: 0.9rem;
 }
 .indicator-title-block {
  display: flex;
  flex-direction: column;
  padding-right: 0.75rem;
  border-right: 1px solid rgba(90, 59, 26, 0.12);
 }
 .stage-meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
 }
 .stage-texts {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
 }
 .indicator-title {
  font-weight: 800;
  color: #5a3b1a;
 }
 .indicator-row img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(90, 59, 26, 0.25));
  animation: floatIcon 2.4s ease-in-out infinite alternate;
 }
 .indicator-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(90, 59, 26, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
 }
 .indicator-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
 }
 .indicator-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(90, 59, 26, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
 }
 .indicator-count {
  font-weight: 800;
  color: #5a3b1a;
  font-size: 1.05rem;
 }

@keyframes floatIcon {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-4px);
  }
}

</style>
