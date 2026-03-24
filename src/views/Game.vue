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
            <div
              v-if="
                hasVisual &&
                !hideLevelVisuals &&
                !isLevelFour &&
                current.type !== 'IMAGE_WORD_MATCH' &&
                !(current.type === 'complete_sentence' && current.image) &&
                !(current.type === 'multiple_choice' && (current.image || current.emoji)) &&
                !(current.type === 'sentence_selection' && current.image)
              "
              class="exercise-visual"
            >
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
              <BaseExerciseLayout aria-label="Pregunta sobre frase">
                <template #prompt>
                  <ExercisePrompt
                    :title="questionMaskedSentence || current.prompt || 'Elige la respuesta correcta'"
                    instruction="Escucha la frase y selecciona una sola respuesta."
                  />
                  <div class="mt-2 flex justify-center">
                    <AudioButton
                      :exercise="current"
                      :narration-text="current.sentence"
                      :audio-src="current.audio"
                      aria-label="Escuchar frase"
                      @fallback-audio="(src) => playSimpleAudio(src)"
                    />
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  aria-label="Opciones de respuesta para la frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : currentStatus === 'fail' ? 'error' : 'idle'"
                  success-text="¡Excelente!"
                  error-text="Inténtalo de nuevo con calma."
                />
              </BaseExerciseLayout>
            </section>

            <!-- Completar frase (L1) -->
            <section v-else-if="current.type === 'complete_sentence'">
              <BaseExerciseLayout aria-label="Ejercicio de completar frase">
                <template #media v-if="current.image">
                  <ExerciseImage
                    :src="resolveAsset(current.image)"
                    :alt="current.imageAlt || current.prompt || 'Ilustración del ejercicio'"
                  />
                </template>

                <template #prompt>
                  <ExercisePrompt
                    :title="current.prompt || 'Completa la frase'"
                    instruction="Elige una sola palabra para completar correctamente."
                  />
                  <div class="mt-2 flex justify-center">
                    <AudioButton
                      :exercise="current"
                      :narration-text="fillBlank(current.prompt, current.correct || current.answer)"
                      :audio-src="current.audio"
                      aria-label="Escuchar frase"
                      @fallback-audio="(src) => playSimpleAudio(src)"
                    />
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  aria-label="Opciones para completar la frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : currentStatus === 'fail' ? 'error' : 'idle'"
                  success-text="¡Excelente!"
                  error-text="Inténtalo de nuevo con calma."
                />
              </BaseExerciseLayout>
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
              <div
                class="reading-box"
                :class="{
                  'reading-box--flat': isFuerzaTranquilaStage4of6
                }"
              >
                <SyllableHighlighter
                  :text="readingText"
                  :segments="syllableSegments"
                  :highlight="-1"
                  :jump-mode="false"
                />
                <div class="reading-audio-inline inside-box">
                  <AudioPlayer
                    v-if="current.audio"
                    :src="readingAudioSrc"
                    :rate="READING_AUDIO_PACE"
                    aria-label="Escuchar frase"
                    @play="handleReadingPlay"
                    @pause="handleReadingPause"
                    @ended="handleReadingEnded"
                    @progress="handleReadingProgress"
                  />
                  <button
                    v-else
                    class="btn btn-ghost reading-cta icon-only"
                    type="button"
                    aria-label="Escuchar frase"
                    @click="handleReadingIconClick"
                  >
                    <img src="/icons/audio.PNG" alt="" class="audio-icon-static" />
                  </button>
                </div>
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
              <BaseExerciseLayout aria-label="Ejercicio de opción múltiple">
                <template #media v-if="current.image || current.emoji">
                  <div class="choice-visual">
                    <ExerciseImage
                      v-if="current.image"
                      :src="resolveAsset(current.image)"
                      :alt="current.imageAlt || current.question || 'Ilustración del ejercicio'"
                    />
                    <div v-else class="choice-emoji" aria-hidden="true">{{ current.emoji }}</div>
                  </div>
                </template>

                <template #prompt>
                  <ExercisePrompt
                    :title="current.question || current.prompt || 'Elige la opción correcta'"
                    instruction="Selecciona una sola respuesta."
                  />
                  <div class="mt-2 flex justify-center">
                    <AudioButton
                      :exercise="current"
                      :audio-src="current.audio"
                      aria-label="Escuchar pregunta"
                      @fallback-audio="(src) => playSimpleAudio(src)"
                    />
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  aria-label="Opciones de respuesta"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : currentStatus === 'fail' ? 'error' : 'idle'"
                  success-text="¡Excelente!"
                  error-text="Inténtalo de nuevo con calma."
                />
              </BaseExerciseLayout>
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
              <SentenceAudioRow
                :text="current.prompt || 'Completa la palabra'"
                :speak-text="completeWordSpokenText"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-xl font-semibold mb-3 leading-snug text-center"
                :align-center="true"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div class="text-center">
                <div class="complete-word-pattern" aria-label="Completa la palabra por casillas">
                  <template v-for="(slot, idx) in completeWordSlots" :key="`cw-slot-${idx}`">
                    <span v-if="slot.type === 'fixed'" class="cw-fixed">{{ slot.char }}</span>
                    <input
                      v-else
                      :ref="(el) => setCompleteWordInputRef(el, slot.blankIndex)"
                      v-model="completeWordInputs[slot.blankIndex]"
                      type="text"
                      inputmode="text"
                      autocomplete="off"
                      autocapitalize="none"
                      spellcheck="false"
                      maxlength="1"
                      class="cw-input"
                      aria-label="Letra faltante"
                      @input="handleCompleteWordInput(slot.blankIndex, $event)"
                      @keydown.backspace="handleCompleteWordBackspace(slot.blankIndex, $event)"
                      @keydown.enter.prevent="handleTextSubmit"
                    />
                  </template>
                </div>
              </div>
              <div class="flex justify-center mt-4">
                <button class="btn btn-primary" type="button" @click="handleTextSubmit">
                  Confirmar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'CHOOSE_CORRECT_WORD'">
              <SentenceAudioRow
                :text="current.prompt || current.question"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-2xl font-semibold mb-3 leading-snug text-center"
                :align-center="true"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'SYLLABLE_ORDER'">
              <p class="text-xl font-semibold mb-3 leading-snug text-center">
                Ordena las sílabas
              </p>
              <div class="options-row syllable-order-source" :class="optionLayout(current.syllables)">
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
                <p class="text-lg font-semibold tracking-wide syllable-order-target">
                  {{ syllableAttempt.join(' ') }}
                </p>
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
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || 'Ilustración'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <SentenceAudioRow
                :text="current.prompt || 'Elige la palabra correcta'"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-xl font-semibold mb-3 leading-snug text-center"
                :align-center="true"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'READ_AND_ANSWER'">
              <SentenceAudioRow
                :text="current.text || current.context || current.reading"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-lg font-semibold mb-3 leading-snug text-left reading-paragraph"
                :align-center="true"
                aria-label="Escuchar texto"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <p v-if="current.question" class="read-answer-question">
                {{ current.question }}
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 3: comprensión auditiva / lectura ========== -->

            <!-- Seleccionar frase que tiene sentido -->
            <section v-else-if="current.type === 'sentence_selection'">
              <BaseExerciseLayout aria-label="Seleccionar frase con sentido">
                <template #media v-if="current.image && !isLevelThreeStageOne">
                  <ExerciseImage
                    :src="resolveAsset(current.image)"
                    :alt="current.imageAlt || current.prompt || 'Ilustración del ejercicio'"
                  />
                </template>

                <template #prompt>
                  <ExercisePrompt
                    :title="current.prompt || 'Elige la frase que tenga más sentido.'"
                    instruction="Elige la frase que tenga más sentido."
                  />
                  <div class="mt-2 flex justify-center">
                    <AudioButton
                      :exercise="current"
                      :audio-src="current.audio"
                      aria-label="Escuchar enunciado"
                      @fallback-audio="(src) => playSimpleAudio(src)"
                    />
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  aria-label="Opciones de frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : currentStatus === 'fail' ? 'error' : 'idle'"
                  success-text="¡Excelente!"
                  error-text="Inténtalo de nuevo con calma."
                />
              </BaseExerciseLayout>
            </section>

            <!-- Pregunta con contexto / audio -->
            <section v-else-if="current.type === 'audio_question'">
              <SentenceAudioRow
                :text="current.question"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-2xl font-semibold mb-3 leading-snug text-slate-700"
                :align-center="true"
                aria-label="Escuchar pregunta"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
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
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
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
              <p v-if="(current.fallbackText || current.instruction) && !isLevelFourStageOne" class="audio-context">
                {{ current.fallbackText || current.instruction }}
              </p>
              <textarea
                v-model="textAnswer"
                rows="2"
                class="w-full border rounded-xl p-2 text-xl font-bold"
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
              <SentenceAudioRow
                :text="current.instruction || 'Escribe una frase.'"
                :speak-text="current.narrationText || ''"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-xl font-semibold mb-3 leading-snug"
                :align-center="true"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div v-if="isLetterBuildExercise" class="letter-build">
                <div class="options-row letter-build-tiles">
                  <button
                    v-for="tile in letterBuildTiles"
                    :key="`letter-build-${tile.index}`"
                    class="btn-option letter-build-btn"
                    type="button"
                    :disabled="tile.used"
                    @click="handleLetterBuildSelect(tile)"
                  >
                    {{ tile.char }}
                  </button>
                </div>
                <input
                  v-model="textAnswer"
                  type="text"
                  readonly
                  class="w-full border rounded-xl p-2 text-xl font-bold letter-build-input"
                  :placeholder="current.placeholder || 'Forma la palabra aquí...'"
                />
                <div class="mt-2 flex justify-center">
                  <button class="btn btn-secondary" type="button" @click="resetLetterBuild">
                    Reiniciar letras
                  </button>
                </div>
              </div>
              <textarea
                v-else
                v-model="textAnswer"
                rows="2"
                class="w-full border rounded-xl p-2 text-xl font-bold"
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
              <p v-if="current.prompt" class="tense-guide">
                {{ current.prompt }}
              </p>
              <SentenceAudioRow
                :text="current.sentence || ''"
                :speak-text="current.prompt || ''"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-2xl font-semibold mb-4 leading-snug"
                :align-center="true"
                aria-label="Escuchar frase"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
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
                  @mouseenter="handleOptionPreview(syllable)"
                  @focus="handleOptionPreview(syllable)"
                >
                  {{ syllable }}
                </button>
              </div>
            </section>

            <!-- Signos de puntuación -->
            <section v-else-if="current.type === 'punctuation_game'">
              <SentenceAudioRow
                :text="current.sentence"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-2xl font-semibold mb-4 leading-snug"
                :align-center="true"
                aria-label="Escuchar frase"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
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
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
                >
                  {{ option }}
                </button>
              </div>
            </section>

            <!-- Examen final (opción múltiple) -->
            <section v-else-if="current.type === 'final_exam'">
              <SentenceAudioRow
                :text="current.question || current.prompt"
                :exercise="current"
                :audio-src="current.audio"
                text-class="text-2xl font-semibold mb-4 leading-snug"
                :align-center="true"
                aria-label="Escuchar enunciado"
                @fallback-audio="(src) => playSimpleAudio(src)"
              />
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                  @mouseenter="handleOptionPreview(option)"
                  @focus="handleOptionPreview(option)"
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
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillingStore } from '../store/billingStore'
import { useGameStore } from '../store/gameStore'
import { useExerciseEngine } from '../engine/logic/ExerciseEngine'
import { useTTS, isTTSSupported } from '../composables/useTTS'
import exerciseWordTimings from '../engine/logic/audio/exerciseWordTimings.json'
import { getExerciseNarrationText } from '../utils/getExerciseNarrationText'
import { getAudioSettings, playSfx, playVoice, playVoiceCue, unlockAudio, stopMusic } from '../engine/audio/audioManager'
import { VOICE_PRESET } from '../engine/audio/voiceProfile'

import ExerciseShell from '../components/ExerciseShell.vue'
import DragDropBoard from '../components/DragDropBoard.vue'
import AudioButton from '../components/AudioButton.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import SyllableHighlighter from '../components/SyllableHighlighter.vue'
import SentenceAudioRow from '../components/SentenceAudioRow.vue'
import BaseExerciseLayout from '../components/exercises/BaseExerciseLayout.vue'
import ExerciseImage from '../components/exercises/ExerciseImage.vue'
import ExercisePrompt from '../components/exercises/ExercisePrompt.vue'
import ExerciseOptions from '../components/exercises/ExerciseOptions.vue'
import ExerciseFeedback from '../components/exercises/ExerciseFeedback.vue'

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
const readingHighlight = ref(false)
let readingTimer = null
let syllableTimer = null
let syllableStepTimeouts = []
let activeAudioEl = null
let audioTimeUpdateHandler = null
let lastReadingProgress = 0
const READING_AUDIO_PACE = 0.76
const TTS_SLOW_RATE = 0.82
const TTS_CHEERFUL_PITCH = 1.3
const { speak, stop: stopTts, isSpeaking } = useTTS()
const prefersReducedMotion = ref(false)
let lastOptionPreviewAt = 0

billing.load?.()
game.load?.()

onMounted(() => {
  if (typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  // Silencia la música global al entrar al modo ejercicios
  stopMusic(260)
})

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
    resetReadingHighlight()
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

function segmentTextIntoWords(text = '') {
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
    segments.push({ text: part, isGap: false, start: cursor, end: cursor + part.length })
    cursor += part.length
  }

  return segments
}

function isFuerzaTranquilaStage4of6Now() {
  const stageNumber = Number(stage.value ?? 0)
  const totalStages = Number(stageContext.value?.totalStages ?? 0)
  const levelName = String(stageContext.value?.levelMeta?.levelName || '').trim().toLowerCase()
  const isTargetLevel = level.value === 1 || levelName === 'la fuerza tranquila'
  const isTargetStage = stageNumber === 4
  const isTargetTotal = totalStages === 0 || totalStages === 6
  return isTargetLevel && isTargetStage && isTargetTotal
}

const readingText = computed(() => {
  return normalizeReadingText(current.value?.text || current.value?.sentence || current.value?.prompt || '')
})

const readingAudioSrc = computed(() => resolveAsset(current.value?.audio))

const syllableSegments = computed(() => {
  if (isFuerzaTranquilaStage4of6Now()) {
    return segmentTextIntoWords(readingText.value)
  }
  return segmentTextIntoSyllables(readingText.value)
})
const spokenSegments = computed(() =>
  syllableSegments.value.map((segment, idx) => ({ ...segment, idx })).filter((segment) => !segment.isGap)
)

function normalizeWordToken(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function normalizeSentenceForLookup(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const resolvedWordTimingEntry = computed(() => {
  const timings = exerciseWordTimings || {}
  const lineIdCandidates = [
    current.value?.lineId,
    current.value?.line_id,
    current.value?.rowId,
    current.value?.row_id
  ]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)

  for (const lineId of lineIdCandidates) {
    if (timings[lineId]) return timings[lineId]
  }

  const currentNormalizedText = normalizeSentenceForLookup(readingText.value)
  if (!currentNormalizedText) return null

  const entries = Object.values(timings)
  const byText = entries.find(
    (entry) => normalizeSentenceForLookup(entry?.text || '') === currentNormalizedText
  )
  return byText || null
})

const resolvedWordTimingMap = computed(() => {
  const entry = resolvedWordTimingEntry.value
  const timingWords = Array.isArray(entry?.wordTimings) ? entry.wordTimings : []
  if (!timingWords.length) return []

  const segments = spokenSegments.value
  if (!segments.length) return []

  const mapped = []
  let segCursor = 0
  let fallbackCursor = 0

  for (const timing of timingWords) {
    const target = normalizeWordToken(timing?.word || '')
    if (!target) continue

    let matchIdx = -1
    for (let i = segCursor; i < segments.length; i += 1) {
      if (normalizeWordToken(segments[i].text) === target) {
        matchIdx = i
        break
      }
    }

    if (matchIdx === -1) {
      matchIdx = Math.min(fallbackCursor, segments.length - 1)
    }

    const segment = segments[matchIdx]
    if (!segment) continue

    mapped.push({
      idx: segment.idx,
      start: Number(timing.start),
      end: Number(timing.end)
    })

    segCursor = Math.max(segCursor, matchIdx + 1)
    fallbackCursor = Math.max(fallbackCursor, matchIdx + 1)
  }

  return mapped.filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))
})

const isFaroReadingExercise = computed(() => {
  const exerciseId = String(current.value?.id || '').trim().toUpperCase()
  const normalizedText = normalizeReadingText(current.value?.text || '')
    .toLowerCase()
    .replace(/\.$/, '')
  return exerciseId === 'L1-RW-1' || normalizedText === 'el faro guía a los barcos perdidos'
})

const spokenSyllableTimeline = computed(() => {
  const full = syllableSegments.value
  const spoken = spokenSegments.value
  if (!spoken.length) return []

  const weights = spoken.map((segment) => {
    // Base por longitud de sílaba + micro pausa por espacios/puntuación cercanos.
    const base = Math.max(1, String(segment.text || '').length)
    const nextFull = full[segment.idx + 1]
    const gapBoost = nextFull?.isGap ? Math.min(2, String(nextFull.text || '').length * 0.35) : 0
    const punctuationBoost = /[.,;:!?]/.test(String(segment.text || '')) ? 0.8 : 0
    return base + gapBoost + punctuationBoost
  })

  const totalWeight = weights.reduce((acc, value) => acc + value, 0)
  if (totalWeight <= 0) return []

  let cumulative = 0
  return spoken.map((segment, i) => {
    cumulative += weights[i]
    return {
      idx: segment.idx,
      endProgress: cumulative / totalWeight
    }
  })
})

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
      unlockAudio()
      playSfx('correct')
      showConfetti.value = true
      if (confettiTimer) clearTimeout(confettiTimer)
      confettiTimer = setTimeout(() => {
        showConfetti.value = false
      }, 4500)
    } else if (status === 'fail') {
      unlockAudio()
      playSfx('wrong')
    }
  }
)

function cueForExerciseType(type) {
  const map = {
    audio_question: 'listen',
    audio_choice: 'listen',
    audio_sentence: 'listen',
    audio_question_answer: 'listen',
    read_with_audio: 'read',
    audio_write: 'read'
  }
  return map[type] || 'choose'
}

const isFuerzaTranquilaStage4of6 = computed(() => isFuerzaTranquilaStage4of6Now())
const isStage1of4 = computed(() => {
  const stageNumber = Number(stage.value ?? 0)
  const totalStages = Number(stageContext.value?.totalStages ?? 0)
  return stageNumber === 1 && totalStages === 4
})

function shouldPlayListenCueAtStageStart() {
  return isFuerzaTranquilaStage4of6.value
}

watch(
  () => stage.value,
  () => {
    unlockAudio()
    playSfx('click')
    playVoiceCue('start')
    if (shouldPlayListenCueAtStageStart()) {
      playVoiceCue('listen')
    }
  }
)

watch(
  () => current.value?.id,
  () => {
    const id = current.value?.id
    if (!id) return
    const audioSettings = getAudioSettings()
    if (!audioSettings.voiceEnabled) return
    const cue = cueForExerciseType(current.value?.type)
    if (cue === 'listen') return
    unlockAudio()
    playVoiceCue(cue)
  },
  { immediate: true }
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
const blankRegex = /_{3,}/g
const textAnswer = ref('')
const completeWordInputs = ref([])
const completeWordInputRefs = ref([])
const letterBuildUsedIndices = ref([])

const isLetterBuildExercise = computed(() =>
  current.value?.type === 'text_write' &&
  Array.isArray(current.value?.letters) &&
  current.value.letters.length > 0
)

const letterBuildTiles = computed(() => {
  if (!isLetterBuildExercise.value) return []
  const used = new Set(letterBuildUsedIndices.value)
  return current.value.letters.map((letter, index) => ({
    index,
    char: String(letter ?? ''),
    used: used.has(index)
  }))
})

const completeWordPattern = computed(() => {
  if (current.value?.type !== 'COMPLETE_WORD') return ''
  const explicitPattern = String(current.value?.pattern || '').trim()
  if (explicitPattern.includes('_')) return explicitPattern
  const prompt = String(current.value?.prompt || '')
  const match = prompt.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]*_[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]*/u)
  return match?.[0] || ''
})

const completeWordSlots = computed(() => {
  const source = completeWordPattern.value
  if (!source) return []
  let blankIndex = 0
  return source.split('').map((char) => {
    if (char === '_') {
      const slot = { type: 'blank', blankIndex }
      blankIndex += 1
      return slot
    }
    return { type: 'fixed', char }
  })
})

const completeWordSpokenText = computed(() => {
  if (current.value?.type !== 'COMPLETE_WORD') return ''
  return String(current.value?.solution || current.value?.correct || current.value?.answer || current.value?.prompt || '')
})

const levelHeading = computed(() => {
  const context = stageContext.value
  return context?.levelMeta?.levelName ?? meta.value?.title ?? 'Etapa sin título'
})

const levelTitleLabel = computed(() => {
  const context = stageContext.value
  return context?.levelMeta?.levelName ?? 'Escuela Mágica'
})

function fillBlank(text, replacement) {
  if (!text || !replacement) return text
  return text.replace(blankRegex, replacement)
}

function normalizeLetterInput(value = '') {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-zÑñÜü]/g, '')
    .slice(0, 1)
    .toLowerCase()
}

function setCompleteWordInputRef(el, idx) {
  if (!el || !Number.isInteger(idx) || idx < 0) return
  completeWordInputRefs.value[idx] = el
}

function focusCompleteWordInput(idx) {
  if (!Number.isInteger(idx) || idx < 0) return
  completeWordInputRefs.value[idx]?.focus?.()
}

function handleCompleteWordInput(blankIndex, event) {
  const target = event?.target
  const value = normalizeLetterInput(target?.value)
  completeWordInputs.value[blankIndex] = value
  if (target && target.value !== value) target.value = value
  if (value) focusCompleteWordInput(blankIndex + 1)
}

function handleCompleteWordBackspace(blankIndex, event) {
  const currentValue = completeWordInputs.value[blankIndex] || ''
  if (!currentValue) {
    event.preventDefault()
    focusCompleteWordInput(blankIndex - 1)
  }
}

function resetCompleteWordInputs() {
  const blankCount = completeWordSlots.value.filter((slot) => slot.type === 'blank').length
  completeWordInputs.value = Array.from({ length: blankCount }, () => '')
  completeWordInputRefs.value = []
}

function buildCompleteWordAnswer() {
  const pattern = completeWordPattern.value
  if (!pattern) return textAnswer.value || ''
  let blankCursor = 0
  return pattern
    .split('')
    .map((char) => {
      if (char !== '_') return char
      const value = completeWordInputs.value[blankCursor] || ''
      blankCursor += 1
      return value
    })
    .join('')
}

function handleLetterBuildSelect(tile) {
  if (!tile || tile.used) return
  letterBuildUsedIndices.value = [...letterBuildUsedIndices.value, tile.index]
  textAnswer.value = `${textAnswer.value || ''}${tile.char || ''}`
}

function resetLetterBuild() {
  letterBuildUsedIndices.value = []
  textAnswer.value = ''
}

const showExerciseNarration = computed(() => {
  // Oculta el recuadro de audio en nivel 1 (La fuerza tranquila), en la etapa 1/4 (nivel 4) y 1/5 (nivel 5)
  if (level.value === 1) return false
  if (level.value === 3 && [1, 2].includes(stage.value)) return false
  if (level.value === 2 && stage.value === 1) return false
  if (level.value === 2 && stage.value === 5) return false
  if (level.value === 4 && [1, 2, 3].includes(stage.value)) return false
  if (level.value === 5 && stage.value === 4) return false
  if (level.value === 5 && stage.value === 5) return false
  if ((level.value === 4 || level.value === 5) && stage.value === 1) return false
  return true
})

const isLevelThreeStageOne = computed(() => level.value === 3 && stage.value === 1)
const isLevelFourStageOne = computed(() => level.value === 4 && stage.value === 1)
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
  unlockAudio()
  playSfx('click')
  unscrambleAttempt.value += letter
}
function resetUnscramble() {
  unscrambleAttempt.value = ''
}
function submitUnscramble() {
  if (!current.value) return
  unlockAudio()
  playSfx('click')
  checkAnswer(unscrambleAttempt.value, { autoAdvance: true })
  unscrambleAttempt.value = ''
}

// SYLLABLE ORDER
const syllableAttempt = ref([])
function handleSyllableSelect(syllable) {
  unlockAudio()
  playSfx('click')
  syllableAttempt.value = [...syllableAttempt.value, syllable]
}
function resetSyllableAttempt() {
  syllableAttempt.value = []
}
function submitSyllableOrder() {
  if (!current.value) return
  unlockAudio()
  playSfx('click')
  checkAnswer(syllableAttempt.value, { autoAdvance: true })
  syllableAttempt.value = []
}

// PUZZLE ORDER
const puzzleAttempt = ref([])
function handlePuzzleSelect(segment) {
  unlockAudio()
  playSfx('click')
  puzzleAttempt.value = [...puzzleAttempt.value, segment]
}
function resetPuzzleAttempt() {
  puzzleAttempt.value = []
}
function submitPuzzleOrder() {
  if (!current.value) return
  unlockAudio()
  playSfx('click')
  checkAnswer(puzzleAttempt.value, { autoAdvance: true })
  puzzleAttempt.value = []
}

function handleStageComplete(summary) {
  game.setStageResult?.(summary.level, summary.stage, {
    ...summary,
    done: true
  })
  unlockAudio()
  playSfx('unlock')

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
  unlockAudio()
  playSfx('click')
  checkAnswer(option, { autoAdvance: true })
}

function resolveOptionText(option) {
  if (typeof option === 'string' || typeof option === 'number') return String(option)
  if (!option) return ''
  return (
    option.label ||
    option.text ||
    option.word ||
    option.sentence ||
    option.prompt ||
    option.title ||
    ''
  )
}

function handleOptionPreview(option) {
  const now = Date.now()
  if (now - lastOptionPreviewAt < 420) return
  lastOptionPreviewAt = now
  const audioSettings = getAudioSettings()
  if (!audioSettings.voiceEnabled) return
  const text = resolveOptionText(option)
  if (!text) return
  unlockAudio()
  playVoice(text, { rate: VOICE_PRESET.rate, pitch: VOICE_PRESET.pitch, lang: VOICE_PRESET.lang, volume: audioSettings.voiceVolume })
}

function handleSimpleOrder(ok) {
  if (ok) {
    const expected = current.value?.correctOrder ?? current.value?.correct ?? []
    checkAnswer(expected, { autoAdvance: true })
    return
  }
  recordResult('fail', {
    awardPoints: false,
    incrementAttempt: true,
    triggerCelebration: false,
    showFeedback: true
  })
}

function handleReadConfirm() {
  const expected = current.value?.correct ?? 'done'
  unlockAudio()
  playSfx('click')
  checkAnswer(expected, { autoAdvance: true })
}

function handlePairClick(pair) {
  if (!pair) return
  unlockAudio()
  playSfx('click')
  const left = pair.word || pair.singular || pair.statement || ''
  const right = pair.match || pair.synonym || pair.antonym || pair.plural || pair.response || ''
  checkAnswer({ left, right }, { autoAdvance: true })
}

function selectLeft(word) {
  unlockAudio()
  playSfx('click')
  selectedLeft.value = word
}

function handlePairMatch(option) {
  if (!selectedLeft.value) return
  unlockAudio()
  playSfx('click')
  const pairTypes = ['singular_plural', 'pair_synonyms', 'pair_antonyms']
  const isPairType = pairTypes.includes(current.value?.type)
  const payload = { left: selectedLeft.value, right: option }

  if (isPairType) {
    const expected = pairAnswerMap.value[selectedLeft.value]
    const isCorrect = expected === option

    if (isCorrect) {
      playSfx('correct')
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
    playSfx('wrong')
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
  const value = current.value.type === 'COMPLETE_WORD'
    ? buildCompleteWordAnswer()
    : (textAnswer.value || '')
  checkAnswer(value, { autoAdvance: true })
  if (isLetterBuildExercise.value) {
    resetLetterBuild()
  } else {
    textAnswer.value = ''
  }
  if (current.value.type === 'COMPLETE_WORD') {
    resetCompleteWordInputs()
  }
}

function playSimpleAudio(src, onEnd) {
  if (!src) {
    onEnd?.()
    return
  }
  const audioSettings = getAudioSettings()
  if (!audioSettings.voiceEnabled) {
    onEnd?.()
    return
  }
  unlockAudio()
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
  const audioSettings = getAudioSettings()
  if (!audioSettings.voiceEnabled) return
  unlockAudio()
  playSfx('click')
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
  readingHighlight.value = true
  if (Number.isFinite(autoStopMs) && autoStopMs > 0) {
    readingTimer = window.setTimeout(() => {
      stopReadingPulse()
    }, autoStopMs)
  }
}

function stopReadingPulse() {
  stopTts()
  if (activeAudioEl) {
    clearAudioListeners()
    activeAudioEl.pause()
    activeAudioEl.currentTime = 0
    activeAudioEl = null
  }
  resetReadingHighlight()
}

function resetReadingHighlight() {
  readingHighlight.value = false
  activeSyllable.value = -1
  lastReadingProgress = 0
  clearSyllableTicker()
  if (readingTimer) {
    clearTimeout(readingTimer)
    readingTimer = null
  }
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
  unlockAudio()
  playSfx('click')
  const audioSettings = getAudioSettings()
  if (!audioSettings.voiceEnabled) return

  if (isSpeaking.value) {
    stopReadingPulse()
    return
  }

  const text = readingText.value
  const canUseTts = text && isTTSSupported()

  if (canUseTts) {
    const estimate = Math.round(getEstimatedReadingDurationMs() * 1.15)
    const rate = TTS_SLOW_RATE
    const pitch = VOICE_PRESET.pitch
    const effectiveEstimate = getEffectiveDurationMs(estimate, rate || 1)
    const useFixedFaroSchedule = isFaroReadingExercise.value
    // En TTS, el fin real lo marca onend; evitamos cortar antes por estimación.
    startReadingPulse()
    clearSyllableTicker()
    let gotBoundary = false
    let ttsFallbackTimer = null

    if (useFixedFaroSchedule) {
      // Margen extra para que el salto no se "caiga" antes de terminar la locución.
      startFaroSyllableSchedule(Math.round(effectiveEstimate * 1.22))
      gotBoundary = true
    } else {
      ttsFallbackTimer = window.setTimeout(() => {
        if (!gotBoundary) {
          startSyllableTickerForDuration(effectiveEstimate)
        }
      }, 450)
    }

    await speak(text, {
      lang: VOICE_PRESET.lang,
      rate,
      pitch,
      volume: audioSettings.voiceVolume,
      onBoundary: (event) => {
        if (useFixedFaroSchedule) return
        gotBoundary = true
        if (ttsFallbackTimer) {
          clearTimeout(ttsFallbackTimer)
          ttsFallbackTimer = null
        }
        handleTtsBoundary(event)
      }
    })
    if (ttsFallbackTimer) {
      clearTimeout(ttsFallbackTimer)
      ttsFallbackTimer = null
    }
    stopReadingPulse()
    return
  }

  if (current.value?.audio) {
    handleAudioClick(current.value.audio)
  }
}

function handleReadingPlay() {
  // En ejercicios con audio real, la sílaba activa debe venir solo del progreso del audio.
  clearSyllableTicker()
  const estimate = getEstimatedReadingDurationMs()
  const effective = getEffectiveDurationMs(estimate, READING_AUDIO_PACE)
  lastReadingProgress = 0
  startReadingPulse(effective)
}

function handleReadingProgress(payload = {}) {
  if (!readingHighlight.value) return
  // Evita que un ticker residual (de otros modos) compita con la sincronía real del audio.
  if (syllableTimer) clearSyllableTicker()
  const progress = Number(payload?.progress)
  if (!Number.isFinite(progress)) return
  syncActiveSyllableByProgress(progress)
}

function handleReadingPause() {
  lastReadingProgress = 0
  resetReadingHighlight()
}

function handleReadingEnded() {
  lastReadingProgress = 0
  stopReadingPulse()
}

function clearSyllableTicker() {
  if (syllableTimer) {
    clearInterval(syllableTimer)
    syllableTimer = null
  }
  if (syllableStepTimeouts.length) {
    syllableStepTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    syllableStepTimeouts = []
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

function normalizeSyllableToken(token = '') {
  return String(token)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zñü]/gi, '')
    .toLowerCase()
}

function faroSyllableWeight(token = '') {
  const normalized = normalizeSyllableToken(token)
  const weights = {
    el: 1.0,
    faro: 1.35,
    guia: 1.4,
    a: 0.85,
    los: 0.95,
    barcos: 1.45,
    perdidos: 1.65
  }
  return weights[normalized] ?? Math.max(0.95, normalized.length * 0.2)
}

function startFaroSyllableSchedule(durationMs) {
  clearSyllableTicker()
  const segments = spokenSegments.value
  if (!segments.length || !durationMs) return

  const weights = segments.map((segment) => faroSyllableWeight(segment.text))
  const totalWeight = weights.reduce((acc, value) => acc + value, 0)
  if (totalWeight <= 0) return

  activeSyllable.value = segments[0].idx
  let elapsed = 0
  for (let i = 1; i < segments.length; i += 1) {
    elapsed += (weights[i - 1] / totalWeight) * durationMs
    const timeoutId = window.setTimeout(() => {
      activeSyllable.value = segments[i].idx
    }, Math.round(elapsed))
    syllableStepTimeouts.push(timeoutId)
  }
}

function syncActiveSyllableByProgress(progress) {
  const timingMap = resolvedWordTimingMap.value
  if (timingMap.length && isFuerzaTranquilaStage4of6Now()) {
    const lastTimedWord = timingMap[timingMap.length - 1]
    const audioDuration = Number(lastTimedWord?.end ?? 0)
    if (audioDuration > 0) {
      const clamped = Math.min(1, Math.max(0, progress))
      const monotonic = Math.max(lastReadingProgress, clamped)
      lastReadingProgress = monotonic
      const timeSec = monotonic * audioDuration
      const active =
        timingMap.find((item) => timeSec >= item.start && timeSec < item.end) ||
        timingMap.find((item) => timeSec < item.start) ||
        timingMap[timingMap.length - 1]
      if (active) {
        activeSyllable.value = active.idx
        return
      }
    }
  }

  const timeline = spokenSyllableTimeline.value
  if (!timeline.length) return
  const clamped = Math.min(1, Math.max(0, progress))
  // Evita saltos hacia atrás por jitter del reproductor.
  const monotonic = Math.max(lastReadingProgress, clamped)
  lastReadingProgress = monotonic
  const next = timeline.find((entry) => monotonic <= entry.endProgress) || timeline[timeline.length - 1]
  activeSyllable.value = next.idx
}

watch(
  () => current.value?.id,
  () => {
    // Limpieza fuerte al cambiar ejercicio para evitar timers/audio residuales fuera de fase.
    resetReadingHighlight()
    stopTts()
    clearAudioListeners()
    lastReadingProgress = 0
    activeSyllable.value = -1
    resetCompleteWordInputs()
    resetLetterBuild()
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
  if (isLetterBuildExercise.value) {
    resetLetterBuild()
  } else {
    textAnswer.value = ''
  }
  resetCompleteWordInputs()
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

  // Rutas absolutas de public
  if (path.startsWith('/')) return path

  // Si empieza por /public → cargar desde el servidor
  if (path.startsWith('public/')) {
    return '/' + path.replace('public/', '')
  }

  // Si empieza por audio/ o icons/ → cargar desde public
  if (path.startsWith('audio/') || path.startsWith('icons/')) {
    return '/' + path
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
  padding: 0.85rem 1rem;
  min-height: 64px;
  border-radius: 14px;
  border: 2px solid #cfd8e3;
  background: #ffffff;
  font-weight: 700;
  font-size: clamp(1.05rem, 2.2vw, 1.18rem);
  line-height: 1.35;
  color: #0f172a;
  text-transform: none;
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
}
.btn-option:hover {
  border-color: #0ea5e9;
  background: #f7fcff;
}
.btn-option:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}
.btn-option:active {
  transform: translateY(1px);
}
.btn-option.btn-active {
  border-color: #0ea5e9;
  background: #f7fcff;
}
.options-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}
.letter-build {
  width: 100%;
}
.letter-build-tiles {
  margin-bottom: 0.7rem;
}
.letter-build-btn {
  min-width: 86px;
  max-width: 120px;
  min-height: 54px;
  font-size: 1.2rem;
  text-transform: lowercase;
}
.letter-build-btn[disabled] {
  opacity: 0.45;
}
.letter-build-input {
  text-align: center;
  letter-spacing: 0.08em;
}
.syllable-order-source .btn-option {
  min-width: 150px;
  max-width: 220px;
  min-height: 54px;
  padding: 0.65rem 1rem;
  font-size: 1rem;
}
.syllable-order-target {
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: 0.08em;
}
.read-answer-question {
  margin: 0.4rem 0 0.85rem;
  text-align: center;
  color: #0b6e4f;
  font-weight: 800;
  font-size: 1.15rem;
}
.tense-guide {
  margin: 0 0 0.65rem;
  text-align: center;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 1.02rem;
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
  width: auto;
  max-width: 340px;
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 24px;
  overflow: hidden;
}
.choice-visual-img {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  background: transparent;
  box-shadow: none;
  border-radius: 24px;
}
.choice-emoji {
  font-size: 3rem;
  line-height: 1;
}
.exercise-visual {
  width: 100%;
  max-width: 340px;
  margin: 0 auto 1rem;
  border-radius: 24px;
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
  border-radius: 24px;
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
.reading-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  flex-wrap: wrap;
}
.reading-audio-inline.inside-box {
  margin-left: auto;
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
  gap: 0.40rem;
  padding: 0.7rem 0.7rem;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 10px rgba(251, 191, 36, 0.14);
}
.reading-box--flat {
  background: transparent;
  box-shadow: none;
  padding: 0;
  border-radius: 0;
  justify-content: center;
  flex-wrap: wrap;
}
.reading-box--flat :deep(.reading-phrase) {
  width: 100%;
  text-align: center;
}
.reading-box--flat .reading-audio-inline.inside-box {
  margin-left: 0;
}
.reading-box .audio-button {
  flex-shrink: 0;
}
.reading-audio-inline {
  display: flex;
  align-items: center;
}
.reading-cta {
  gap: 0.5rem;
  min-height: 0;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}
.reading-cta.icon-only {
  padding: 0;
  min-height: unset;
  background: transparent;
  border: none;
  box-shadow: none;
  opacity: 0.78;
  transition: opacity 0.15s ease, transform 0.15s ease;
  margin: 0;
}
.reading-cta.icon-only:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.reading-cta.icon-only:active {
  opacity: 0.95;
  transform: translateY(0);
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
@media (prefers-reduced-motion: reduce) {
  .reading-animated {
    animation: none;
  }
}
@media (max-width: 768px) {
  .reading-row {
    flex-direction: column;
    align-items: stretch;
  }
  .reading-audio-inline {
    justify-content: flex-start;
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
.complete-word-pattern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.4rem 0 0.2rem;
}
.cw-fixed {
  min-width: 1.4rem;
  font-size: 1.7rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: lowercase;
}
.cw-input {
  width: 2.2rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  border: 2px solid #93c5fd;
  background: #eff6ff;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  text-transform: lowercase;
  color: #1e3a8a;
  outline: none;
}
.cw-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2);
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
