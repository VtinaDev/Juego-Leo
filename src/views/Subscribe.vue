<template>
  <section>
    <h1 class="text-3xl font-extrabold mb-6">Suscripción</h1>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="card">
        <h3 class="text-xl font-bold">Prueba</h3>
        <p class="text-sm">7 días gratuitos</p>
        <button class="btn btn-primary mt-3" type="button" @click="trial">Activar prueba</button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Mensual</h3>
        <p class="text-sm">8,99 €/mes</p>
        <button class="btn btn-primary mt-3" type="button" @click="monthly">Suscribirme</button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Anual</h3>
        <p class="text-sm">49,99 €/año</p>
        <button class="btn btn-primary mt-3" type="button" @click="annual">Suscribirme</button>
      </div>
      <div class="card">
        <h3 class="text-xl font-bold">Vitalicia</h3>
        <p class="text-sm">89,99 € pago único</p>
        <button class="btn btn-primary mt-3" type="button" @click="lifetime">Comprar</button>
      </div>
    </div>

    <p class="mt-6 text-sm text-gray-600">
      Mock local: los pagos reales (Stripe/PayPal) se integrarán más adelante.
    </p>
  </section>
</template>

<script setup>
import { useBillingStore } from '../store/billingStore'

const billing = useBillingStore()
billing.load()

function trial() {
  billing.startTrial()
}
function monthly() {
  billing.subscribeMonthly()
}
function annual() {
  billing.subscribeAnnual()
}
function lifetime() {
  billing.buyLifetime()
}
</script>
