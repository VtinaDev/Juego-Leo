const SETTINGS_KEY = 'juegoLeo_settings'
const DEFAULT_SETTINGS = { sfx: true }

export function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (!saved) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
      return { ...DEFAULT_SETTINGS }
    }
    const parsed = JSON.parse(saved)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (error) {
    console.warn('⚠️ No se pudieron cargar los ajustes. Se usarán los valores por defecto.', error)
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(next = {}) {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS, ...next }
  const merged = { ...DEFAULT_SETTINGS, ...next }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
  } catch (error) {
    console.warn('⚠️ No se pudieron guardar los ajustes.', error)
  }
  return merged
}

export default {
  loadSettings,
  saveSettings
}
