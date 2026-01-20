<template>
  <section class="grid md:grid-cols-2 gap-6 items-center">
    <div class="space-y-4">
      <h1 class="text-5xl font-extrabold leading-tight">Aprende a leer jugando</h1>
      <h2 class="text-xl text-slate-600 leading-relaxed">
        Empieza por el Nivel 1 (gratis) y desbloquea el resto con la suscripción.
      </h2>
      <div class="flex gap-2">
        <RouterLink to="/mapview" class="btn btn-primary btn-home-primary w-44 justify-center">¡Juega ahora!</RouterLink>
        <RouterLink to="/subscribe" class="btn btn-primary btn-home-primary w-44 justify-center">Suscríbete</RouterLink>
      </div>
    </div>
    <div class="flex justify-center">
      <img
        src="/home.characters.PNG"
        alt="Personajes de Juego & Leo"
        class="w-full max-w-md drop-shadow-lg"
        loading="lazy"
      />
    </div>
  </section>
</template>

<script setup>
</script>
