export const NO_NEEDS_VALUE = 'none_identified'
export const OTHER_NEED_VALUE = 'other'

export const learningNeedOptions = [
  { value: 'attention_difficulty', label: 'TDA / dificultad de atención' },
  { value: 'adhd', label: 'TDAH' },
  { value: 'dyslexia', label: 'Dislexia' },
  { value: 'slow_cognitive_development', label: 'Desarrollo cognitivo lento' },
  { value: 'intellectual_disability', label: 'Déficit intelectual' },
  { value: 'reading_comprehension_difficulty', label: 'Dificultades de comprensión lectora' },
  { value: 'sounds_letters_difficulty', label: 'Dificultades con sonidos o letras' },
  { value: 'sensory_sensitivity', label: 'Sensibilidad visual o auditiva' },
  { value: 'not_sure_yet', label: 'No lo sé todavía' },
  { value: NO_NEEDS_VALUE, label: 'Ninguna condición identificada' },
  { value: OTHER_NEED_VALUE, label: 'Otra' }
]

export const educationLevelOptions = [
  { value: 'infant_3_4', label: 'Infantil 3-4 años' },
  { value: 'infant_5', label: 'Infantil 5 años' },
  { value: 'primary_1', label: '1º Primaria' },
  { value: 'primary_2', label: '2º Primaria' },
  { value: 'primary_3_plus', label: '3º Primaria o más' },
  { value: 'not_schooled', label: 'Aún no escolarizado/a' }
]

export const readingLevelOptions = [
  { value: 'pre_reader', label: 'Aún no lee' },
  { value: 'letters', label: 'Reconoce letras' },
  { value: 'syllables', label: 'Lee sílabas' },
  { value: 'short_words', label: 'Lee palabras cortas' },
  { value: 'sentences', label: 'Lee frases sencillas' }
]

export const attentionSpanOptions = [
  { value: 'short', label: 'Sesiones de 3-5 min' },
  { value: 'medium', label: 'Sesiones de 5-10 min' },
  { value: 'long', label: 'Más de 10 min' },
  { value: 'variable', label: 'Depende del día' }
]

export const learningPaceOptions = [
  { value: 'slow', label: 'Necesita mucho repaso' },
  { value: 'steady', label: 'Avanza paso a paso' },
  { value: 'fast', label: 'Se aburre si es fácil' },
  { value: 'unknown', label: 'Aún no lo sé' }
]

export const behaviorOptions = [
  { value: 'gets_frustrated', label: 'Se frustra con facilidad' },
  { value: 'needs_movement', label: 'Necesita moverse' },
  { value: 'likes_challenges', label: 'Le gustan los retos' },
  { value: 'needs_company', label: 'Prefiere hacerlo acompañado/a' },
  { value: 'avoids_reading', label: 'Evita leer o escribir' },
  { value: 'enjoys_repetition', label: 'Le ayuda repetir' }
]

export const habitOptions = [
  { value: 'daily_short', label: 'Practica un poco cada día' },
  { value: 'few_times_week', label: 'Practica algunas veces por semana' },
  { value: 'mostly_weekend', label: 'Practica sobre todo fines de semana' },
  { value: 'needs_reminders', label: 'Necesita recordatorios' },
  { value: 'new_habit', label: 'Estamos creando el hábito' }
]

export const interestOptions = [
  { value: 'animals', label: 'Animales' },
  { value: 'music', label: 'Música' },
  { value: 'stories', label: 'Cuentos' },
  { value: 'puzzles', label: 'Puzles' },
  { value: 'drawing', label: 'Dibujar' },
  { value: 'nature', label: 'Naturaleza' },
  { value: 'adventure', label: 'Aventuras' }
]

export const supportPreferenceOptions = [
  { value: 'audio_first', label: 'Más audio e instrucciones habladas' },
  { value: 'visual_clues', label: 'Más apoyo visual' },
  { value: 'short_tasks', label: 'Ejercicios cortos' },
  { value: 'extra_repetition', label: 'Más repetición' },
  { value: 'calm_feedback', label: 'Feedback tranquilo' },
  { value: 'more_rewards', label: 'Más recompensas' }
]

export function createEmptyLearningProfile() {
  return {
    educationLevel: '',
    readingLevel: '',
    attentionSpan: '',
    learningPace: '',
    behaviorTraits: [],
    habits: [],
    interests: [],
    supportPreferences: []
  }
}

export function normalizeLearningProfile(value = {}) {
  const base = createEmptyLearningProfile()
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}

  return {
    ...base,
    ...source,
    behaviorTraits: normalizeArray(source.behaviorTraits),
    habits: normalizeArray(source.habits),
    interests: normalizeArray(source.interests),
    supportPreferences: normalizeArray(source.supportPreferences)
  }
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter(Boolean).map(String))]
}
