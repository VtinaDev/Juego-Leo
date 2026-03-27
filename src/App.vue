<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header v-if="!isGameRoute" class="header-transparent">
      <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <RouterLink class="brand brand-logo-link" to="/">
          <img class="brand-logo" src="/logo/app-icon.PNG" alt="Juego & Leo" />
        </RouterLink>

        <div class="ml-auto flex items-center gap-3 nav-icons-wrapper">
          <div class="tooltip-wrapper">
            <button
              class="btn btn-icon settings-btn"
              type="button"
              aria-label="Ajustes de audio"
              @click="toggleSettings"
              data-sfx="click"
              @mouseenter="setTip('settings', true)"
              @mouseleave="setTip('settings', false)"
              @focus="setTip('settings', true)"
              @blur="setTip('settings', false)"
            >
              ⚙️
            </button>
            <span v-if="tooltips.settings" class="tooltip" role="status">Ajustes</span>
          </div>
          <button
            v-if="canInstall"
            class="btn btn-ghost install-btn"
            type="button"
            @click="requestInstall"
            @mouseenter="setTip('install', true)"
            @mouseleave="setTip('install', false)"
            @focus="setTip('install', true)"
            @blur="setTip('install', false)"
          >
            <span>Instalar</span>
            <span v-if="tooltips.install" class="tooltip tooltip--below" role="status">Instalar app</span>
          </button>
          <div class="tooltip-wrapper">
            <RouterLink
              class="btn btn-icon"
              to="/mapview"
              aria-label="Mapa"
              @mouseenter="setTip('map', true)"
              @mouseleave="setTip('map', false)"
              @focus="setTip('map', true)"
              @blur="setTip('map', false)"
            >
              <img src="/icons/mapa.PNG" alt="Mapa" />
            </RouterLink>
            <span v-if="tooltips.map" class="tooltip tooltip--below" role="status">Mapa</span>
          </div>
          <div class="tooltip-wrapper">
            <button
              class="btn btn-icon"
              type="button"
              aria-label="Perfil"
              @click="openAuthModal"
              @mouseenter="setTip('profile', true)"
              @mouseleave="setTip('profile', false)"
              @focus="setTip('profile', true)"
              @blur="setTip('profile', false)"
            >
              <img src="/icons/perfil.PNG" alt="Perfil" />
            </button>
            <span v-if="tooltips.profile" class="tooltip tooltip--below" role="status">Perfil</span>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main router outlet -->
    <main
      class="flex-1 w-full"
      :class="isFullBleedRoute ? 'max-w-none mx-0 px-0 py-0' : 'max-w-6xl mx-auto px-4 py-6'"
    >
      <!-- 👇 Asegúrate de que este router-view esté presente -->
      <RouterView />
    </main>

    <!-- Footer -->
    <footer v-if="!isGameRoute" class="footer-wave mt-10">
      <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-700 text-center space-y-2">
        <div class="flex justify-center gap-4 text-green-700">
          <RouterLink to="/subscribe" class="underline">Suscripción</RouterLink>
          <RouterLink to="/aboutgame" class="underline">Sobre el juego</RouterLink>
        </div>
        <div class="footer-credits">
          Imágenes: <a href="https://www.pexels.com/photo/parents-teaching-their-child-to-read-in-the-living-room-8054841/" target="_blank" rel="noopener noreferrer">Pexels (familia)</a>,
          <a href="https://pikwizard.com/photos/tablet-woman-technology-daughter-girl_3cb86ca706bf34e24e0e4c7d3de0eb28--M" target="_blank" rel="noopener noreferrer">PikWizard (tablet)</a>
        </div>
        <div>© {{ new Date().getFullYear() }} Juego Leo · Todos los derechos reservados</div>
      </div>
    </footer>
  </div>

  <div
    v-if="showSettings"
    class="settings-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Ajustes de audio"
  >
    <div class="settings-panel">
      <div class="settings-head">
        <h3>Ajustes</h3>
        <button class="btn btn-icon" type="button" @click="toggleSettings" aria-label="Cerrar ajustes">
          ✕
        </button>
      </div>
      <p class="settings-hint">Controla música, voz y efectos. Persisten en este dispositivo.</p>
      <AudioToggles />
    </div>
  </div>

  <div
    v-if="showAuth"
    class="settings-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Acceso a la cuenta"
  >
    <div class="auth-panel">
      <div class="space-y-3">
        <div class="auth-header-row">
          <div class="auth-logo">
            <img src="/logo/app-icon.PNG" alt="Logo Juego & Leo" />
          </div>
          <button class="modal-close" type="button" aria-label="Cerrar" @click="closeAuth">×</button>
        </div>
        <header class="modal-header">
          <h3 class="modal-title">Tu cuenta</h3>
        </header>
        <label class="block space-y-1">
          <span class="text-sm text-slate-700">Email</span>
          <input
            v-model.trim="authForm.email"
            type="email"
            inputmode="email"
            class="w-full px-4 py-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            placeholder="familia@correo.com"
          />
        </label>
        <label class="block space-y-1">
          <span class="text-sm text-slate-700">Contraseña</span>
          <input
            v-model.trim="authForm.password"
            type="password"
            class="w-full px-4 py-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            placeholder="Mínimo 6 caracteres"
          />
        </label>
        <div class="flex flex-wrap gap-2 justify-center">
          <button class="btn btn-primary btn-compact" type="button" @click="handleLogin">
            Iniciar sesión
          </button>
          <button class="btn btn-secondary btn-compact" type="button" @click="handleRegister">
            Crear cuenta nueva
          </button>
        </div>
        <div class="auth-footer">
          <button class="link-forgot" type="button" @click="handleForgot">He olvidado mi contraseña</button>
        </div>
        <p v-if="authStatus" class="text-emerald-700 font-semibold text-sm">{{ authStatus }}</p>
        <p v-else-if="authError" class="text-red-600 font-semibold text-sm">{{ authError }}</p>
        <p class="text-xs text-slate-600 text-center">Usa esta cuenta para guardar perfil y generar informes.</p>

        <div v-if="resetMode" class="reset-block">
          <label class="block space-y-1">
            <span class="text-sm text-slate-700">Nueva contraseña</span>
            <input
              v-model.trim="newPassword"
              type="password"
              class="w-full px-4 py-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <label class="block space-y-1">
            <span class="text-sm text-slate-700">Confirmar contraseña</span>
            <input
              v-model.trim="confirmPassword"
              type="password"
              class="w-full px-4 py-3 border rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            />
          </label>
          <button class="btn btn-primary btn-compact" type="button" @click="handleResetPassword">
            Restablecer contraseña
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AudioToggles from './components/AudioToggles.vue'
import { unlockAudio, playSfx, getAudioSettings } from './engine/audio/audioManager.js'
import { useAuthStore } from './store/authStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
auth.load()

const authForm = ref({
  email: auth.userEmail || '',
  password: ''
})
const authStatus = ref('')
const authError = ref('')
const resetMode = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const showAuth = ref(false)
const canInstall = ref(false)
let deferredPrompt = null
const showSettings = ref(false)
const tooltips = ref({
  settings: false,
  install: false,
  map: false,
  profile: false
})
const levelNumber = computed(() => {
  const raw = route.params.levelId ?? route.params.level ?? 1
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
})
const isMapViewRoute = computed(() => route.name === 'MapView')
const isGameRoute = computed(() => route.name === 'game')
const isCongratsRoute = computed(() => route.name === 'Congrats')
const isFullBleedRoute = computed(() => isMapViewRoute.value || isGameRoute.value || isCongratsRoute.value)

function handleBeforeInstall(event) {
  event.preventDefault()
  deferredPrompt = event
  canInstall.value = true
}

function requestInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  deferredPrompt.userChoice?.finally?.(() => {
    canInstall.value = false
    deferredPrompt = null
  })
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const installed =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  if (installed) return
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    deferredPrompt = null
  })

  const handleGlobalClick = (event) => {
    const target = event.target?.closest?.('button, a, [role=\"button\"], [data-sfx]')
    if (!target) return
    const settings = getAudioSettings()
    if (!settings.sfxEnabled) return
    const custom = target.dataset?.sfx
    if (custom === 'none' || custom === 'off') return
    unlockAudio()
    playSfx(custom && custom !== 'click' ? custom : 'click')
  }
  window.addEventListener('pointerdown', handleGlobalClick, { passive: true, capture: true })
  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', handleGlobalClick, { capture: true })
  })
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
})

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function openAuthModal() {
  showAuth.value = true
  authStatus.value = ''
  authError.value = ''
}

function closeAuth() {
  showAuth.value = false
}

function handleRegister() {
  authStatus.value = ''
  authError.value = ''
  resetMode.value = false
  const ok = auth.register(authForm.value.email, authForm.value.password)
  if (ok) {
    authStatus.value = `Cuenta creada: ${auth.userEmail}`
    authForm.value.password = ''
    closeAuth()
    router.push('/profile')
  } else authError.value = auth.error
}

function handleLogin() {
  authStatus.value = ''
  authError.value = ''
  resetMode.value = false
  const ok = auth.login(authForm.value.email, authForm.value.password)
  if (ok) {
    authStatus.value = `Sesión iniciada: ${auth.userEmail}`
    authForm.value.password = ''
    closeAuth()
    router.push('/profile')
  } else authError.value = auth.error
}

function handleForgot() {
  authStatus.value = ''
  authError.value = ''
  const email = authForm.value.email?.trim?.() || ''
  const valid = /\S+@\S+\.\S+/.test(email)
  if (!valid) {
    authError.value = 'Ingresa tu email para enviar el enlace de recuperación.'
    return
  }
  const ok = auth.requestReset(email)
  if (!ok) {
    authError.value = auth.error
    return
  }
  resetMode.value = true
  authStatus.value = `Enviamos un enlace de recuperación a ${email} (demo). Introduce la nueva contraseña.`
}

function handleResetPassword() {
  authStatus.value = ''
  authError.value = ''
  if (!resetMode.value) {
    authError.value = 'Primero solicita el enlace de recuperación.'
    return
  }
  if (newPassword.value.length < 6) {
    authError.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    authError.value = 'Las contraseñas no coinciden.'
    return
  }
  const ok = auth.resetPassword(newPassword.value)
  if (!ok) {
    authError.value = auth.error
    return
  }
  authStatus.value = 'Contraseña restablecida. Inicia sesión con tu nueva contraseña.'
  resetMode.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  authForm.value.password = ''
}

function handleLogout() {
  auth.logout()
  authStatus.value = ''
  authError.value = ''
  authForm.value.password = ''
}

function setTip(key, value) {
  tooltips.value = { ...tooltips.value, [key]: value }
}
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
 .install-btn {
  min-height: auto;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.95rem;
  color: #0f172a !important;
  background: linear-gradient(145deg, #e0f2fe, #c7d2fe);
  border: 1px solid rgba(14, 165, 233, 0.35);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.15);
 }
 .header-transparent .install-btn {
  background: linear-gradient(145deg, #e0f2fe, #c7d2fe);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.18);
  border-color: rgba(14, 165, 233, 0.35);
 }

@keyframes floatIcon {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-4px);
  }
}

/* Ajustes modal */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 60;
}
.auth-panel {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  width: min(420px, 95vw);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.24);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.auth-logo {
  display: flex;
  justify-content: flex-start;
  margin: 0 0 0.25rem 0;
}
.auth-logo img {
  width: 90px;
  height: auto;
}

.auth-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: -0.4rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
}
.modal-title {
  margin: 0;
  font-weight: 800;
  font-size: 1.1rem;
  color: #0f172a;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}
.modal-close:hover {
  background: #e2e8f0;
}

.link-forgot {
  margin-top: 0.35rem;
  background: none;
  border: none;
  padding: 0;
  color: #0ea5e9;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: underline;
}
.auth-footer {
  display: flex;
  justify-content: center;
}
.link-forgot:hover {
  color: #0284c7;
}
.settings-panel {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  width: min(360px, 90vw);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.24);
}
.settings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.settings-head h3 {
  font-weight: 800;
  color: #0f172a;
  font-size: 1.1rem;
}
.settings-hint {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 12px;
}

.settings-btn {
  font-size: 1.6rem;
  width: 50px;
  height: 50px;
  line-height: 1;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}
.tooltip {
  position: absolute;
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: #f8fafc;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.25);
  animation: tooltipFade 0.12s ease;
}
@keyframes tooltipFade {
  from {
    opacity: 0;
    transform: translate(-50%, -2px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

</style>
