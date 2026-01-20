<template>
  <div class="p-6">
    <!-- Estado: cargando -->
    <div v-if="loading" class="text-center text-gray-500">
      Cargando etapa...
    </div>

    <!-- Estado: error -->
    <div v-else-if="error">
      <p class="text-center text-red-600 font-semibold">
        ❌ No se pudo cargar el contenido del juego.
      </p>
      <p class="text-center text-gray-500 text-sm">{{ errorMessage }}</p>
    </div>

    <!-- Estado: sin acceso -->
    <div v-else-if="!allowed">
      <p class="text-center text-red-600 font-semibold">
        🔒 Necesitas una suscripción para acceder a esta etapa.
      </p>
    </div>

    <!-- Estado: datos cargados -->
    <div v-else>
      <div v-if="showConfetti" class="confetti-overlay" aria-hidden="true">
        <div
          v-for="piece in confettiPieces"
          :key="piece.id"
          class="confetti-piece"
          :style="{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }"
        />
      </div>

      <!-- Ejercicio actual -->
      <ExerciseShell
        v-if="current"
        :title="shellTitle"
        :instructions="shellInstructions"
        :levelTitle="levelTitleLabel"
        :stageLabel="stageLabel"
        :stars="game.stars"
        :points="game.points"
        :characterImg="characterImage"
        @prev="handlePrev"
        @repeat="handleRepeat"
        @skip="handleSkip"
      >
        <template #default>
          <div class="smartick-shell">
            <div class="smartick-topbar">
              <div class="smartick-progress">
                <div class="avatar-chip">
                  <img :src="characterImage" alt="Avatar" />
                </div>
                <div class="score-track">
                  <div class="score-stars">
                    <span
                      v-for="(filled, idx) in starTrack"
                      :key="`star-${idx}`"
                      :class="['star-dot', { 'star-dot--filled': filled }]"
                    />
                  </div>
                  <div class="score-points">{{ game.points || 0 }} pts</div>
                </div>
              </div>
              <div class="smartick-actions">
                <button class="icon-btn" type="button" @click="handlePrev" aria-label="Anterior">
                  ←
                </button>
                <button class="icon-btn" type="button" @click="handleRepeat" aria-label="Repetir">
                  ↺
                </button>
                <button class="icon-btn" type="button" @click="handleSkip" aria-label="Saltar">
                  ▶
                </button>
              </div>
            </div>

            <div class="smartick-stage">
              <div class="stage-pill">
                <span>{{ stageLabel }}</span>
              </div>
            </div>

            <div class="smartick-card space-y-4 exercise-body">
            <div class="exercise-narration" v-if="exerciseNarrationText && showExerciseNarration">
              <AudioButton
                :exercise="current"
                :narration-text="exerciseNarrationText"
                :audio-src="current?.audio || null"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <span class="narration-label">Escuchar enunciado</span>
            </div>
            <div v-if="currentStatus === 'ok'" class="status-banner success-banner">
              <img src="/icons/celebration.png" alt="Celebración" class="status-icon" />
              <span>¡Excelente!</span>
            </div>
            <div v-else-if="currentStatus === 'fail'" class="status-banner fail-banner">
              <img src="/icons/back.PNG" alt="Respuesta incorrecta" class="status-icon" />
            </div>
            <!-- ========= VISUAL COMÚN (todos los niveles) ========= -->
            <div v-if="hasVisual && !hideLevelVisuals && !isLevelFour" class="exercise-visual">
              <img
                v-if="currentImageSrc && !imageLoadFailed"
                :src="currentImageSrc"
                :alt="current.title || 'Ilustración del ejercicio'"
                @error="imageLoadFailed = true"
              />
              <div v-else class="visual-fallback">
                <div v-if="fallbackCharacterImage" class="visual-character">
                  <img :src="fallbackCharacterImage" alt="Personaje del nivel" />
                </div>
                <div class="visual-meta">
                  <span class="visual-icon">{{ fallbackIcon }}</span>
                  <p class="visual-label">{{ fallbackLabel }}</p>
                </div>
              </div>
            </div>

            <!-- ========== NIVEL 1: tipos base ========== -->

            <!-- Pregunta sobre frase (L1) -->
            <section v-if="current.type === 'question_sentence'">
              <p class="text-2xl font-semibold mb-4 leading-snug text-slate-700">
                {{ questionMaskedSentence }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Completar frase (L1) -->
            <section v-else-if="current.type === 'complete_sentence'">
              <p class="text-2xl font-semibold mb-4 leading-snug">{{ current.prompt }}</p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Ordenar frase (L1) -->
            <section v-else-if="current.type === 'order_sentence'">
              <DragDropBoard
                :prompt="current.instructions || ''"
                :words="current.words"
                :correct="current.correct || current.correctOrder"
                :hide-submit="level === 1 && stage === 1"
                @result="handleSimpleOrder"
              />
            </section>

            <!-- Leer con o sin audio (L1) -->
            <section v-else-if="current.type === 'read_with_audio'" class="space-y-4">
              <div class="reading-box" :class="{ 'reading-animated': readingPulse }">
                <img
                  src="/icons/audio.PNG"
                  alt="Audio"
                  class="audio-icon-static"
                  role="button"
                  tabindex="0"
                  @click="handleReadingIconClick"
                  @keyup.enter.space="handleReadingIconClick"
                />
                <p class="reading-phrase m-0">
                  <span
                    v-for="(syllable, idx) in syllableSegments"
                    :key="`${idx}-${syllable.text}`"
                    class="reading-syllable"
                    :class="{
                      'reading-syllable--active': idx === activeSyllable && !syllable.isGap,
                      'reading-syllable--gap': syllable.isGap
                    }"
                  >
                    {{ syllable.text }}
                  </span>
                </p>
              </div>
              <p v-if="!current.audio" class="text-sm text-gray-500">
                Lee la frase tú mismo 🪄
              </p>
              <button class="btn btn-primary" type="button" @click="handleReadConfirm">
                Ya la leí
              </button>
            </section>

            <!-- ========== NIVEL 2: vocabulario y significados ========== -->

            <!-- Opción múltiple genérica (L2, L3, L5...) -->
            <section v-else-if="current.type === 'multiple_choice'">
              <p class="text-2xl font-semibold mb-3 leading-snug">
                {{ current.question || current.prompt }}
              </p>
              <div v-if="current.image || current.emoji" class="choice-visual">
                <img
                  v-if="current.image"
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || current.question || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
                <div v-else class="choice-emoji" aria-hidden="true">{{ current.emoji }}</div>
              </div>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Sinónimos (L2) -->
            <section v-else-if="current.type === 'pair_synonyms'">
              <p class="text-base text-center text-gray-600 mb-2">Elige la palabra y luego su sinónimo.</p>
              <div class="pair-board">
                <div class="pair-column">
                  <button
                    v-for="word in leftOptions"
                    :key="`left-${word}`"
                    class="btn-option"
                    :class="{ 'btn-active': selectedLeft === word }"
                    type="button"
                    @click="selectLeft(word)"
                  >
                    {{ word }}
                  </button>
                </div>
                <div class="pair-column">
                  <button
                    v-for="option in rightOptions"
                    :key="`right-${option}`"
                    class="btn-option"
                    type="button"
                    @click="handlePairMatch(option)"
                    :disabled="!selectedLeft"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </section>

            <!-- Antónimos (L2) -->
            <section v-else-if="current.type === 'pair_antonyms'">
              <p class="text-base text-center text-gray-600 mb-2">Elige la palabra y luego su opuesto.</p>
              <div class="pair-board">
                <div class="pair-column">
                  <button
                    v-for="word in leftOptions"
                    :key="`left-${word}`"
                    class="btn-option"
                    :class="{ 'btn-active': selectedLeft === word }"
                    type="button"
                    @click="selectLeft(word)"
                  >
                    {{ word }}
                  </button>
                </div>
                <div class="pair-column">
                  <button
                    v-for="option in rightOptions"
                    :key="`right-${option}`"
                    class="btn-option"
                    type="button"
                    @click="handlePairMatch(option)"
                    :disabled="!selectedLeft"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </section>

            <!-- ========== NUEVOS TIPOS ========== -->

            <section v-else-if="current.type === 'UNSCRAMBLE_WORD'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                Ordena las letras para formar la palabra
              </p>
              <div class="options-row" :class="optionLayout(current.letters)">
                <button
                  v-for="(letter, idx) in current.letters"
                  :key="`letter-${idx}-${letter}`"
                  class="btn-option"
                  type="button"
                  @click="handleUnscramble(letter)"
                >
                  {{ letter }}
                </button>
              </div>
              <div class="mt-3 text-center">
                <p class="text-lg font-semibold tracking-wide">{{ unscrambleAttempt }}</p>
                <button class="btn btn-primary mt-2" type="button" @click="submitUnscramble">
                  Confirmar
                </button>
                <button class="btn btn-secondary mt-2 ml-2" type="button" @click="resetUnscramble">
                  Reiniciar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'COMPLETE_WORD'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                {{ current.prompt || 'Completa la palabra' }}
              </p>
              <div class="text-center">
                <input
                  v-model="textAnswer"
                  type="text"
                  class="w-full border rounded-xl p-3 text-center text-xl"
                  placeholder="Escribe aquí"
                />
                <button class="btn btn-primary mt-3" type="button" @click="handleTextSubmit">
                  Confirmar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'CHOOSE_CORRECT_WORD'">
              <p class="text-2xl font-semibold mb-3 leading-snug text-center">
                {{ current.prompt || current.question }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'SYLLABLE_ORDER'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                Ordena las sílabas
              </p>
              <div class="options-row" :class="optionLayout(current.syllables)">
                <button
                  v-for="syllable in current.syllables"
                  :key="`syllable-${syllable}`"
                  class="btn-option"
                  type="button"
                  @click="handleSyllableSelect(syllable)"
                >
                  {{ syllable }}
                </button>
              </div>
              <div class="mt-3 text-center">
                <p class="text-lg font-semibold tracking-wide">{{ syllableAttempt.join(' ') }}</p>
                <button class="btn btn-primary mt-2" type="button" @click="submitSyllableOrder">
                  Confirmar
                </button>
                <button class="btn btn-secondary mt-2 ml-2" type="button" @click="resetSyllableAttempt">
                  Reiniciar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'PUZZLE_ORDER'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                {{ current.prompt || 'Ordena las piezas del rompecabezas' }}
              </p>
              <div class="options-row" :class="optionLayout(current.segments)">
                <button
                  v-for="segment in current.segments"
                  :key="`segment-${segment}`"
                  class="btn-option"
                  type="button"
                  @click="handlePuzzleSelect(segment)"
                >
                  {{ segment }}
                </button>
              </div>
              <div class="mt-3 text-center">
                <p class="text-lg font-semibold tracking-wide">{{ puzzleAttempt.join(' | ') }}</p>
                <button class="btn btn-primary mt-2" type="button" @click="submitPuzzleOrder">
                  Confirmar
                </button>
                <button class="btn btn-secondary mt-2 ml-2" type="button" @click="resetPuzzleAttempt">
                  Reiniciar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'IMAGE_WORD_MATCH'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                {{ current.prompt || 'Elige la palabra correcta' }}
              </p>
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || 'Ilustración'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'READ_AND_ANSWER'">
              <p class="text-lg font-semibold mb-3 leading-snug text-left reading-paragraph">
                {{ current.text || current.context || current.reading }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 3: comprensión auditiva / lectura ========== -->

            <!-- Seleccionar frase que tiene sentido -->
            <section v-else-if="current.type === 'sentence_selection'">
              <p class="text-2xl font-semibold mb-4 leading-snug">
                {{ current.prompt || 'Elige la frase que tenga más sentido.' }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Pregunta con contexto / audio -->
            <section v-else-if="current.type === 'audio_question'">
              <p class="text-2xl font-semibold mb-3 leading-snug text-slate-700">
                {{ current.question }}
              </p>
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 4: producción escrita ========== -->

            <!-- Dictado / escribir palabra o frase -->
            <section v-else-if="current.type === 'audio_write'">
              <p class="text-xl font-semibold mb-3 leading-snug">
                {{ current.instruction || current.fallbackText || 'Escribe lo que escuchas.' }}
              </p>
              <div class="audio-icon-wrapper">
                <AudioButton
                  :exercise="current"
                  :audio-src="current.audio"
                  @fallback-audio="(src) => playSimpleAudio(src)"
                />
              </div>
              <p v-if="current.fallbackText || current.instruction" class="audio-context">
                {{ current.fallbackText || current.instruction }}
              </p>
              <textarea
                v-model="textAnswer"
                rows="3"
                class="w-full border rounded-xl p-3 text-base"
                placeholder="Escribe aquí..."
              />
              <div class="mt-3 flex justify-end">
                <button class="btn btn-primary" type="button" @click="handleTextSubmit">
                  Continuar
                </button>
              </div>
            </section>

            <!-- Escritura creativa / guiada -->
            <section v-else-if="current.type === 'text_write'">
              <p class="text-xl font-semibold mb-3 leading-snug">
                {{ current.instruction || 'Escribe una frase.' }}
              </p>
              <textarea
                v-model="textAnswer"
                rows="3"
                class="w-full border rounded-xl p-3 text-base"
                :placeholder="current.placeholder || 'Escribe aquí tu frase mágica...'"
              />
              <p class="text-sm text-gray-600 mt-1">
                {{ current.hint || 'Completa la frase con la palabra que mejor encaje.' }}
              </p>
              <div class="mt-3 flex justify-end">
                <button class="btn btn-primary" type="button" @click="handleTextSubmit">
                  Continuar
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 5: tiempos, tildes y signos ========== -->

            <!-- Clasificar tiempos verbales -->
            <section v-else-if="current.type === 'tense_classify'">
              <p class="text-2xl font-semibold mb-4 leading-snug">
                {{ current.sentence || current.prompt }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Singular / plural -->
            <section v-else-if="current.type === 'singular_plural'">
              <p class="text-base text-center text-gray-600 mb-2">Elige el singular y luego su plural.</p>
              <div class="pair-board">
                <div class="pair-column">
                  <button
                    v-for="word in leftOptions"
                    :key="`singular-${word}`"
                    class="btn-option"
                    :class="{ 'btn-active': selectedLeft === word }"
                    type="button"
                    @click="selectLeft(word)"
                  >
                    {{ word }}
                  </button>
                </div>
                <div class="pair-column">
                  <button
                    v-for="option in rightOptions"
                    :key="`plural-${option}`"
                    class="btn-option"
                    type="button"
                    @click="handlePairMatch(option)"
                    :disabled="!selectedLeft"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </section>

            <!-- Tildes mágicas -->
            <section v-else-if="current.type === 'accent_game'">
              <p class="text-2xl font-semibold mb-3 leading-snug">
                ¿Dónde va la tilde en: <strong>{{ current.word }}</strong>?
              </p>
              <div class="options-row" :class="optionLayout(current.syllables)">
                <button
                  v-for="syllable in current.syllables"
                  :key="syllable"
                  class="btn-option"
                  type="button"
                  @click="handleAccentClick(syllable)"
                >
                  {{ syllable }}
                </button>
              </div>
            </section>

            <!-- Signos de puntuación -->
            <section v-else-if="current.type === 'punctuation_game'">
              <p class="text-2xl font-semibold mb-4 leading-snug">
                {{ current.sentence }}
              </p>
              <p class="text-sm text-gray-500 mb-2">
                Elige el signo correcto para esta frase.
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Examen final (opción múltiple) -->
            <section v-else-if="current.type === 'final_exam'">
              <p class="text-2xl font-semibold mb-4 leading-snug">
                {{ current.question || current.prompt }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Fallback para tipos desconocidos -->
            <section v-else class="text-sm text-gray-500">
              Vista no disponible para este tipo de ejercicio ({{ current.type }}).
            </section>

            <!-- Mensajes de resultado -->
            <p v-if="currentStatus === 'skipped'" class="text-yellow-600 mt-4">
              Ejercicio saltado para revisión.
            </p>
            </div>
          </div>
        </template>
      </ExerciseShell>

      <!-- Navegación alternativa -->
      <div v-if="!current" class="mt-6 flex justify-center gap-3">
        <button class="btn btn-secondary" type="button" @click="handlePrev">← Anterior</button>
        <button class="btn btn-primary" type="button" :disabled="!canNext" @click="handleNext">
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillingStore } from '../store/billingStore'
import { useGameStore } from '../store/gameStore'
import { useExerciseEngine } from '../engine/logic/ExerciseEngine'
import { useTTS, isTTSSupported } from '../composables/useTTS'
import { getExerciseNarrationText } from '../utils/getExerciseNarrationText'

import ExerciseShell from '../components/ExerciseShell.vue'
import DragDropBoard from '../components/DragDropBoard.vue'
import AudioButton from '../components/AudioButton.vue'

import Perezoso from '../assets/characters/Perezoso.png'
import Zorro from '../assets/characters/Zorro.png'
import Mono from '../assets/characters/Mono.png'
import Elefante from '../assets/characters/Elefante.png'
import ElefanteGraduado from '../assets/characters/Elefante-graduado.png'

const route = useRoute()
const router = useRouter()
const billing = useBillingStore()
const game = useGameStore()
const confettiPieces = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: (i % 6) * 0.12,
  duration: 4 + Math.random() * 3
}))
const showConfetti = ref(false)
let confettiTimer = null
const readingPulse = ref(false)
let readingTimer = null
let syllableTimer = null
let activeAudioEl = null
let audioTimeUpdateHandler = null
const READING_AUDIO_PACE = 0.85
const TTS_SLOW_RATE = 0.82
const TTS_CHEERFUL_PITCH = 1.3
const { speak, stop: stopTts, isSpeaking } = useTTS()

billing.load?.()
game.load?.()

// Permite leer /game/:level/:stage o /game/:levelId/:stageId
const level = computed(() => Number(route.params.levelId ?? route.params.level ?? 1))
const stage = computed(() => Number(route.params.stageId ?? route.params.stage ?? 1))
const starTrack = computed(() => Array.from({ length: 5 }, (_, i) => i < (game.stars ?? 0)))
const exerciseNarrationText = computed(() => getExerciseNarrationText(current.value) || '')

function handleAccessDenied() {
  router.push('/subscribe')
}

const engine = useExerciseEngine({
  level,
  stage,
  canAccessLevel: (lvl) => billing.canAccessLevel?.(lvl) ?? true,
  rewardService: game,
  onAccessDenied: handleAccessDenied,
  onStageComplete: handleStageComplete
})

const {
  loading,
  allowed,
  error,
  errorMessage,
  meta,
  current,
  currentStatus,
  index,
  canNext,
  lastResult,
  stageContext,
  checkAnswer,
  recordResult,
  skip,
  next,
  prev,
  repeat,
  stopAllMedia
} = engine

const selectedLeft = ref('')
const currentPairs = ref([])
const pairAnswerMap = ref({})
const leftOptionsShuffled = ref([])
const rightOptionsShuffled = ref([])
const activeSyllable = ref(-1)
const extractWords = (pairs) =>
  pairs.map((p) => p.word || p.singular || p.statement).filter(Boolean)
const extractMatches = (pairs) =>
  pairs.map((p) => p.match || p.synonym || p.antonym || p.plural || p.response).filter(Boolean)
function refreshPairOptionsFromCurrent(pairs = currentPairs.value) {
  const words = extractWords(pairs)
  const matches = extractMatches(pairs)
  leftOptionsShuffled.value = shuffleArray(Array.from(new Set(words)))
  rightOptionsShuffled.value = shuffleArray(Array.from(new Set(matches)))
}
function rebuildPairState(pairs = []) {
  const list = pairs.map((p) => ({ ...p }))
  currentPairs.value = list
  pairAnswerMap.value = list.reduce((acc, p) => {
    const key = p.word || p.singular || p.statement
    const value = p.match || p.synonym || p.antonym || p.plural || p.response
    if (key && value) acc[key] = value
    return acc
  }, {})
  refreshPairOptionsFromCurrent(list)
}
watch(
  () => current.value?.pairs,
  (pairs) => {
    rebuildPairState(pairs || [])
  },
  { immediate: true }
)

watch(
  () => current.value?.id,
  () => {
    activeSyllable.value = -1
  }
)
const leftOptions = computed(() => leftOptionsShuffled.value)
const rightOptions = computed(() => rightOptionsShuffled.value)
function optionLayout(list) {
  const count = Array.isArray(list) ? list.length : 0
  return count > 2 ? 'options-column' : ''
}

function normalizeReadingText(text = '') {
  return text.replace(/\s+/g, ' ').trim()
}

function getEstimatedReadingDurationMs() {
  return Math.min(26000, Math.max(5000, readingText.value.length * 170))
}

function getEffectiveDurationMs(durationMs, pace = 1) {
  if (!durationMs || pace <= 0) return durationMs
  return Math.round(durationMs / pace)
}

function segmentTextIntoSyllables(text = '') {
  const vowels = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ'
  const segments = []
  let cursor = 0
  const parts = text.split(/(\s+)/)

  for (const part of parts) {
    if (!part) continue

    if (/^\s+$/.test(part)) {
      segments.push({ text: part, isGap: true, start: cursor, end: cursor + part.length })
      cursor += part.length
      continue
    }

    const syllables = splitWordIntoSyllables(part, vowels)
    let localCursor = 0
    for (const syllable of syllables) {
      const start = cursor + localCursor
      segments.push({ text: syllable, isGap: false, start, end: start + syllable.length })
      localCursor += syllable.length
    }
    cursor += part.length
  }

  return segments
}

function splitWordIntoSyllables(word = '', vowels = '') {
  const syllables = []
  let buffer = ''

  for (let i = 0; i < word.length; i += 1) {
    const char = word[i]
    const next = word[i + 1]
    buffer += char

    const isVowel = vowels.includes(char)
    const nextIsVowel = next ? vowels.includes(next) : false
    const isLast = i === word.length - 1

    if (isLast) {
      syllables.push(buffer)
      buffer = ''
      continue
    }

    if (!isVowel) continue

    if (nextIsVowel) {
      syllables.push(buffer)
      buffer = ''
      continue
    }

    const upcoming = word.slice(i + 1)
    const nextVowelIndex = upcoming.slice(1).search(/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/)
    if (nextVowelIndex >= 0) {
      syllables.push(buffer)
      buffer = ''
    }
  }

  if (buffer) syllables.push(buffer)

  return syllables
}

const readingText = computed(() => {
  return normalizeReadingText(current.value?.text || current.value?.sentence || current.value?.prompt || '')
})

const syllableSegments = computed(() => {
  return segmentTextIntoSyllables(readingText.value)
})
const spokenSegments = computed(() =>
  syllableSegments.value.map((segment, idx) => ({ ...segment, idx })).filter((segment) => !segment.isGap)
)

const levelCharacters = {
  1: Perezoso,
  2: Zorro,
  3: Mono,
  4: Mono,
  5: ElefanteGraduado
}

watch(
  () => currentStatus.value,
  (status) => {
    if (status === 'ok') {
      showConfetti.value = true
      if (confettiTimer) clearTimeout(confettiTimer)
      confettiTimer = setTimeout(() => {
        showConfetti.value = false
      }, 4500)
    }
  }
)

const sadCharacters = {
  3: Mono
}

const characterImage = computed(() => {
  const base = levelCharacters[level.value] || Perezoso
  if (stageContext.value?.levelMeta?.completed) {
    return base
  }
  if (lastResult.value === 'fail' && sadCharacters[level.value]) {
    return sadCharacters[level.value]
  }
  return base
})

const hideHeaders = computed(() => (level.value === 1 && stage.value === 1) || [2, 3, 4, 5].includes(level.value))
const shellTitle = computed(() => {
  if (hideHeaders.value) return ''
  return meta.value?.title ?? current.value?.title ?? 'Ejercicio mágico'
})
const shellInstructions = computed(() => {
  if (hideHeaders.value) return ''
  return current.value?.instructions ?? meta.value?.description ?? 'Sigue las indicaciones con calma.'
})
const stageLabel = computed(() => {
  const context = stageContext.value
  if (meta.value?.stageLabel) return meta.value.stageLabel
  if (context?.stageMeta?.title) return context.stageMeta.title
  return `Etapa ${stage.value}`
})

const blankSymbol = '_____'
const textAnswer = ref('')

const levelHeading = computed(() => {
  const context = stageContext.value
  return context?.levelMeta?.levelName ?? meta.value?.title ?? 'Etapa sin título'
})

const levelTitleLabel = computed(() => {
  const context = stageContext.value
  return context?.levelMeta?.levelName ?? 'Escuela Mágica'
})

const showExerciseNarration = computed(() => {
  // Oculta el recuadro de audio en nivel 1 (La fuerza tranquila) y en la etapa 1/4 (nivel 4) y 1/5 (nivel 5)
  if (level.value === 1) return false
  if ((level.value === 4 || level.value === 5) && stage.value === 1) return false
  return true
})

const hideLevelVisuals = computed(() => [2, 3, 4, 5].includes(level.value))
const isLevelFour = computed(() => level.value === 4)
const fallbackIcon = computed(() => stageContext.value?.levelMeta?.icon || '🪄')
const fallbackLabel = computed(() => stageContext.value?.levelMeta?.animal || 'Animal sabio')
const currentImageSrc = computed(() => resolveAsset(current.value?.image))
const fallbackCharacterImage = computed(() => levelCharacters[level.value] || Perezoso)
const hasVisual = computed(() => Boolean(currentImageSrc.value || fallbackCharacterImage.value))
const imageLoadFailed = ref(false)

const questionMaskedSentence = computed(() => {
  if (current.value?.type !== 'question_sentence') return current.value?.sentence || ''
  return maskSentence(current.value.sentence, current.value.correct || current.value.answer)
})

// UNSCRAMBLE
const unscrambleAttempt = ref('')
function handleUnscramble(letter) {
  unscrambleAttempt.value += letter
}
function resetUnscramble() {
  unscrambleAttempt.value = ''
}
function submitUnscramble() {
  if (!current.value) return
  checkAnswer(unscrambleAttempt.value, { autoAdvance: true })
  unscrambleAttempt.value = ''
}

// SYLLABLE ORDER
const syllableAttempt = ref([])
function handleSyllableSelect(syllable) {
  syllableAttempt.value = [...syllableAttempt.value, syllable]
}
function resetSyllableAttempt() {
  syllableAttempt.value = []
}
function submitSyllableOrder() {
  if (!current.value) return
  checkAnswer(syllableAttempt.value, { autoAdvance: true })
  syllableAttempt.value = []
}

// PUZZLE ORDER
const puzzleAttempt = ref([])
function handlePuzzleSelect(segment) {
  puzzleAttempt.value = [...puzzleAttempt.value, segment]
}
function resetPuzzleAttempt() {
  puzzleAttempt.value = []
}
function submitPuzzleOrder() {
  if (!current.value) return
  checkAnswer(puzzleAttempt.value, { autoAdvance: true })
  puzzleAttempt.value = []
}

function handleStageComplete(summary) {
  game.setStageResult?.(summary.level, summary.stage, {
    ...summary,
    done: true
  })

  const isFinalLevel = summary.level === 5
  const finishedLastStage = summary.totalStages
    ? summary.stage >= summary.totalStages
    : false

  router.push({
    name: 'Congrats',
    query: {
      level: summary.level,
      stage: summary.stage,
      totalStages: summary.totalStages,
      stars: summary.stars,
      stageTitle: stageContext.value?.stageMeta?.title ?? meta.value?.title ?? '',
      completedGame: isFinalLevel && finishedLastStage ? '1' : '0'
    }
  })
}

function handleSimpleOption(option) {
  checkAnswer(option, { autoAdvance: true })
}

function handleSimpleOrder(ok) {
  recordResult(ok ? 'ok' : 'fail', {
    awardPoints: ok,
    incrementAttempt: true,
    triggerCelebration: ok,
    showFeedback: !ok
  })
  if (ok) {
    setTimeout(() => next(), 450)
  }
}

function handleReadConfirm() {
  const expected = current.value?.correct ?? 'done'
  checkAnswer(expected, { autoAdvance: true })
}

function handlePairClick(pair) {
  if (!pair) return
  const left = pair.word || pair.singular || pair.statement || ''
  const right = pair.match || pair.synonym || pair.antonym || pair.plural || pair.response || ''
  checkAnswer({ left, right }, { autoAdvance: true })
}

function selectLeft(word) {
  selectedLeft.value = word
}

function handlePairMatch(option) {
  if (!selectedLeft.value) return
  const pairTypes = ['singular_plural', 'pair_synonyms', 'pair_antonyms']
  const isPairType = pairTypes.includes(current.value?.type)
  const payload = { left: selectedLeft.value, right: option }

  if (isPairType) {
    const expected = pairAnswerMap.value[selectedLeft.value]
    const isCorrect = expected === option

    if (isCorrect) {
      const remaining = currentPairs.value.filter((p) => {
        const left = p.word || p.singular || p.statement || ''
        const right = p.match || p.synonym || p.antonym || p.plural || p.response || ''
        return !(left === selectedLeft.value && right === option)
      })
      rebuildPairState(remaining)
      const shouldAdvance = remaining.length === 0
      checkAnswer(payload, { autoAdvance: shouldAdvance })
      selectedLeft.value = ''
      return
    }
    checkAnswer(payload, { autoAdvance: false })
    selectedLeft.value = ''
    return
  }

  checkAnswer(payload, { autoAdvance: true })
  selectedLeft.value = ''
}

function handleAccentClick(syllable) {
  if (!current.value) return
  checkAnswer(
    {
      syllable,
      accentType: current.value.accentType
    },
    { autoAdvance: true }
  )
}

function handleTextSubmit() {
  if (!current.value) return
  const value = textAnswer.value || ''
  checkAnswer(value, { autoAdvance: true })
  textAnswer.value = ''
}

function playSimpleAudio(src, onEnd) {
  if (!src) {
    onEnd?.()
    return
  }
  stopAllMedia()
  if (activeAudioEl) {
    activeAudioEl.pause()
    activeAudioEl.currentTime = 0
  }
  const audio = new Audio(src)
  audio.playbackRate = READING_AUDIO_PACE
  activeAudioEl = audio
  audio.addEventListener('ended', () => {
    activeAudioEl = null
    onEnd?.()
  })
  audio.play().catch(() => {
    activeAudioEl = null
    onEnd?.()
  })
  return audio
}

function handleAudioClick(audio) {
  clearAudioListeners()
  const estimate = getEstimatedReadingDurationMs()
  const effectiveEstimate = getEffectiveDurationMs(estimate, READING_AUDIO_PACE)
  startReadingPulse(effectiveEstimate)
  startSyllableTickerForDuration(effectiveEstimate)

  const audioEl = playSimpleAudio(audio, () => {
    stopReadingPulse()
  })

  if (audioEl) {
    const updateFromAudio = () => {
      const durationSec =
        isFinite(audioEl.duration) && audioEl.duration > 0
          ? audioEl.duration / READING_AUDIO_PACE
          : effectiveEstimate / 1000
      if (durationSec > 0) {
        const progress = Math.min(1, Math.max(0, audioEl.currentTime / durationSec))
        syncActiveSyllableByProgress(progress)
      }
    }
    audioTimeUpdateHandler = updateFromAudio
    audioEl.addEventListener('timeupdate', updateFromAudio)
    audioEl.addEventListener('loadedmetadata', () => {
      const durationMs = isFinite(audioEl.duration) ? audioEl.duration * 1000 : estimate
      const effectiveDuration = getEffectiveDurationMs(durationMs, READING_AUDIO_PACE)
      startReadingPulse(effectiveDuration)
      startSyllableTickerForDuration(effectiveDuration)
      updateFromAudio()
    })
  }
}

function startReadingPulse(autoStopMs) {
  if (readingTimer) clearTimeout(readingTimer)
  const firstIdx = syllableSegments.value.findIndex((segment) => !segment.isGap)
  activeSyllable.value = firstIdx
  readingPulse.value = true
  const duration = autoStopMs ?? getEstimatedReadingDurationMs()
  readingTimer = window.setTimeout(() => {
    stopReadingPulse()
  }, duration)
}

function stopReadingPulse() {
  stopTts()
  if (activeAudioEl) {
    clearAudioListeners()
    activeAudioEl.pause()
    activeAudioEl.currentTime = 0
    activeAudioEl = null
  }
  clearSyllableTicker()
  if (readingTimer) {
    clearTimeout(readingTimer)
    readingTimer = null
  }
  readingPulse.value = false
  activeSyllable.value = -1
}

function handleTtsBoundary(event) {
  if (!event || typeof event.charIndex !== 'number') return
  const segments = syllableSegments.value
  if (!segments || !segments.length) return
  const idx = segments.findIndex(
    (segment) => !segment.isGap && event.charIndex >= segment.start && event.charIndex < segment.end
  )
  if (idx >= 0) {
    activeSyllable.value = idx
    return
  }
  advanceSyllable()
}

async function handleReadingIconClick() {
  if (isSpeaking.value) {
    stopReadingPulse()
    return
  }

  const text = readingText.value
  const ttsConfig = current.value?.tts || {}
  const canUseTts = text && isTTSSupported()

  if (canUseTts) {
    const estimate = Math.round(getEstimatedReadingDurationMs() * 1.15)
    const rate = ttsConfig.rate ?? TTS_SLOW_RATE
    const pitch = ttsConfig.pitch ?? TTS_CHEERFUL_PITCH
    const effectiveEstimate = getEffectiveDurationMs(estimate, rate || 1)
    startReadingPulse(effectiveEstimate)
    startSyllableTickerForDuration(effectiveEstimate)
    await speak(text, {
      lang: ttsConfig.lang,
      rate,
      pitch,
      onBoundary: handleTtsBoundary
    })
    stopReadingPulse()
    return
  }

  if (current.value?.audio) {
    handleAudioClick(current.value.audio)
  }
}

function clearSyllableTicker() {
  if (syllableTimer) {
    clearInterval(syllableTimer)
    syllableTimer = null
  }
}

function clearAudioListeners() {
  if (activeAudioEl && audioTimeUpdateHandler) {
    activeAudioEl.removeEventListener('timeupdate', audioTimeUpdateHandler)
    audioTimeUpdateHandler = null
  }
}

function advanceSyllable() {
  const segments = spokenSegments.value
  if (!segments.length) return
  const currentIdx = segments.findIndex((seg) => seg.idx === activeSyllable.value)
  const next = segments[Math.min(currentIdx + 1, segments.length - 1)]
  activeSyllable.value = next.idx
}

function startSyllableTickerForDuration(durationMs) {
  clearSyllableTicker()
  const segments = spokenSegments.value
  if (!segments.length || !durationMs) return
  let cursor = 0
  activeSyllable.value = segments[cursor].idx
  const interval = Math.max(160, durationMs / segments.length)
  syllableTimer = window.setInterval(() => {
    cursor += 1
    if (cursor >= segments.length) {
      clearSyllableTicker()
      return
    }
    activeSyllable.value = segments[cursor].idx
  }, interval)
}

function syncActiveSyllableByProgress(progress) {
  const segments = spokenSegments.value
  if (!segments.length) return
  const clamped = Math.min(1, Math.max(0, progress))
  const idx = Math.min(segments.length - 1, Math.floor(clamped * segments.length))
  activeSyllable.value = segments[idx].idx
}

watch(
  () => current.value?.id,
  () => {
    // reset highlighting when exercise changes
    activeSyllable.value = -1
  }
)

function handleSkip() {
  skip()
}

function handleNext() {
  next()
}

function handlePrev() {
  prev()
}

function handleRepeat() {
  repeat()
  textAnswer.value = ''
}

onBeforeUnmount(() => {
  stopAllMedia()
  if (confettiTimer) clearTimeout(confettiTimer)
  if (readingTimer) clearTimeout(readingTimer)
  stopTts()
  clearSyllableTicker()
  clearAudioListeners()
})

watch(
  () => currentImageSrc.value,
  () => {
    imageLoadFailed.value = false
  }
)

function resolveAsset(path) {
  if (!path) return ''

  // Permite URLs absolutas y data URIs
  if (/^(https?:|data:)/i.test(path)) return path

  // Si empieza por /public → cargar desde el servidor
  if (path.startsWith('public/')) {
    return '/' + path.replace('public/', '')
  }

  // Si empieza por images/ o /images → cargar desde public/images
  if (path.startsWith('images/') || path.startsWith('/images/')) {
    return '/' + path.replace(/^\//, '')
  }

  // INTENTO FINAL: buscar en src/assets como antes
  try {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path
    return new URL(`../assets/${normalizedPath}`, import.meta.url).href
  } catch (err) {
    console.warn('[Juego Leo] No se pudo resolver la ruta de imagen:', path, err)
    return ''
  }
}

function maskSentence(sentence, target) {
  if (!sentence) return ''
  if (!target) return sentence
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'i')
  if (regex.test(sentence)) {
    return sentence.replace(regex, blankSymbol)
  }
  return sentence
}

function shuffleArray(arr) {
  const clone = [...arr]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}
</script>

<style scoped>
.btn-option {
  display: inline-flex;
  min-width: 240px;
  max-width: 360px;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 1rem 2rem;
  min-height: 72px;
  border-radius: 18px;
  border: none;
  background: #ffde7b;
  font-weight: 700;
  font-size: 1.3rem;
  line-height: 1.05;
  color: var(--color-text);
  text-transform: uppercase;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.btn-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.75);
  background: linear-gradient(135deg, #ffe388, #ffd14a);
  color: #0f172a;
}
.btn-option.btn-active {
  background: var(--color-green);
}
.options-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}
.options-column {
  flex-direction: column;
  align-items: center;
}
.btn-audio {
  padding: 0.85rem 1.6rem;
  min-height: 62px;
  border-radius: 18px;
  border: none;
  color: var(--color-text);
  font-weight: 600;
  background: linear-gradient(145deg, var(--color-green-light), var(--color-green));
  box-shadow: none;
  opacity: 0.85;
  font-size: 1.15rem;
  color: var(--color-cream);
  text-transform: uppercase;
}
.btn-audio[disabled] {
  border-color: #d1d5db;
  color: #9ca3af;
  background: #f3f4f6;
}
.pair-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: stretch;
  margin-top: 0.5rem;
}
.pair-column {
  display: grid;
  gap: 0.65rem;
  justify-items: center;
}
.pair-column .btn-option {
  width: 100%;
  min-width: 0;
}
.choice-visual {
  display: grid;
  place-items: center;
  margin: 0 auto 1rem;
  width: 100%;
  max-width: 520px;
  padding: 0;
  background: transparent;
  box-shadow: none;
}
.choice-visual-img {
  width: 100%;
  max-height: 340px;
  object-fit: contain;
  background: transparent;
  box-shadow: none;
}
.choice-emoji {
  font-size: 3rem;
  line-height: 1;
}
.exercise-visual {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  border-radius: 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
  background: #f8fafc;
  display: block;
  padding: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.exercise-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 0;
}
.visual-fallback {
  background: linear-gradient(135deg, rgba(147, 197, 253, 0.8), rgba(165, 180, 252, 0.95));
  color: #0f172a;
  text-align: center;
  padding: 2.5rem 1rem;
  display: grid;
  place-items: center;
  gap: 0.75rem;
}
.visual-icon {
  font-size: 3rem;
  display: block;
}
.visual-character {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  display: grid;
  place-items: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
}
.visual-character img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}
.visual-meta {
  display: grid;
  gap: 0.2rem;
}
.visual-label {
  margin-top: 0.5rem;
  font-weight: 600;
}
.reading-phrase {
  font-size: clamp(1.2rem, 2.6vw, 1.6rem);
  line-height: 1.35;
  font-weight: 700;
  color: #0f172a;
  padding: 0;
  margin: 0;
  text-align: left;
  white-space: pre-wrap;
  flex: 1;
}
.reading-animated {
  animation: syllablePulse 0.8s ease-in-out infinite;
}
.reading-syllable {
  display: inline-block;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}
.reading-syllable--active {
  border-bottom-color: #f59e0b;
  background: rgba(255, 243, 196, 0.85);
  color: #b45309;
  border-radius: 10px;
  padding: 2px 4px;
}
.reading-syllable--gap {
  border-bottom-color: transparent;
  padding: 0;
}
.reading-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(251, 191, 36, 0.16);
}
.reading-box .audio-button {
  flex-shrink: 0;
}
.audio-icon-static {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 14px rgba(15, 23, 42, 0.12));
  cursor: pointer;
}
.reading-animated {
  background: linear-gradient(135deg, #fff7d0, #ffe8a3);
  box-shadow: 0 10px 24px rgba(251, 191, 36, 0.3);
  color: #92400e;
}
.audio-panel {
  gap: 0.5rem;
}
.audio-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.85rem;
}
.audio-context {
  background: #fff8e1;
  color: #92400e;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  margin: 0 0 1rem;
  font-size: 1rem;
  line-height: 1.5;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 8px 18px rgba(251, 191, 36, 0.2);
}
@keyframes syllablePulse {
  0%,
  100% {
    transform: scale(1);
    text-shadow: 0 2px 8px rgba(255, 206, 86, 0.55);
  }
  50% {
    transform: scale(1.02);
    text-shadow: 0 3px 12px rgba(255, 206, 86, 0.7);
  }
}
.exercise-body {
  position: relative;
}
.status-banner {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translate(-50%, -100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 1.25rem;
  border-radius: 18px;
  padding: 0.6rem 1rem;
}
.success-banner {
  background: linear-gradient(135deg, #fdf7ec, #f2e7d1);
  color: #3f6212;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.18);
}
.fail-banner {
  background: #fff1f2;
  color: #b91c1c;
  box-shadow: 0 10px 24px rgba(248, 113, 113, 0.18);
}
.status-icon {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.18));
}
.success-announcement {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}
.success-icon {
  width: 72px;
  height: 72px;
  filter: drop-shadow(0 10px 24px rgba(15, 23, 42, 0.25));
}
.audio-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.6rem;
}
.audio-panel img {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.18));
  transition: transform 0.15s ease, filter 0.15s ease;
}
.audio-panel img:hover {
  transform: translateY(-1px) scale(1.03);
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.2));
}
.confetti-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 30;
}
.confetti-piece {
  position: absolute;
  top: -20vh;
  width: 10px;
  height: 16px;
  background: #ffde7b;
  border-radius: 4px;
  animation-name: confettiFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.confetti-piece:nth-child(3n) {
  background: #8fd47e;
}
.confetti-piece:nth-child(3n + 1) {
  background: #ffc8d0;
}
.confetti-piece:nth-child(4n) {
  background: #cce9ff;
}
@keyframes confettiFall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 130vh, 0) rotate(540deg);
    opacity: 0;
  }
}
.smartick-shell {
  background: linear-gradient(180deg, #f8fbff 0%, #fdfaf5 100%);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.15);
}
.smartick-topbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
}
.smartick-progress {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: center;
}
.avatar-chip {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  display: grid;
  place-items: center;
}
.avatar-chip img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.score-track {
  display: grid;
  gap: 0.2rem;
}
.score-stars {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.star-dot {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.star-dot--filled {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #f59e0b;
  box-shadow: 0 6px 12px rgba(249, 158, 11, 0.25);
}
.score-points {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}
.smartick-actions {
  display: inline-flex;
  gap: 0.5rem;
  justify-self: end;
}
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #fff;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.1);
  font-weight: 700;
  color: #0f172a;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.15);
}
.smartick-stage {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0 0.5rem;
}
.stage-pill {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0ea5e9;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}
.smartick-card {
  background: #fff;
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 12px 26px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.smartick-card .exercise-visual {
  max-width: 420px;
}
.smartick-card .options-row {
  margin-top: 0.5rem;
}
.exercise-narration {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid rgba(14, 165, 233, 0.15);
}
.exercise-narration .audio-button {
  width: 42px;
  height: 42px;
}
.narration-label {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
}
@media (max-width: 768px) {
  .smartick-shell {
    padding: 1rem;
  }
  .smartick-topbar {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .smartick-actions {
    justify-self: center;
  }
}
</style>
