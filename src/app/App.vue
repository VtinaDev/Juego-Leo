<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur sticky top-0 z-20 shadow-soft">
      <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <RouterLink class="font-extrabold text-xl text-azul" to="/">Juego Leo</RouterLink>

        <div class="ml-auto flex gap-3">
          <!-- ✅ Corrige las rutas según tu router -->
          <RouterLink class="btn btn-secondary" to="/mapview">Mapa</RouterLink>
          <RouterLink class="btn btn-secondary" to="/levels">Niveles</RouterLink>
          <RouterLink class="btn btn-secondary" to="/profile">Perfil</RouterLink>
          <RouterLink class="btn btn-primary" to="/subscribe">Suscripción</RouterLink>
        </div>
      </nav>
    </header>

    <!-- Main router outlet -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <!-- 👇 Asegúrate de que este router-view esté presente -->
      <RouterView />
      <RouterLink :to="{ path: '/', hash: '#sobre-el-juego' }">Sobre el juego</RouterLink>

    </main>
    


    <!-- Footer -->
    <footer class="bg-white mt-10 border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500 text-center">
        © {{ new Date().getFullYear() }} Juego Leo · Todos los derechos reservados
      </div>
    </footer>
  </div>
</template>

<script setup>
// Sin lógica global aquí por ahora
</script>
