<template>
  <div ref="gameViewRef" class="game-view" :class="gameViewClasses">
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
            <div
              ref="exerciseCardRef"
              class="smartick-card exercise-body"
              :style="exerciseScaleStyle"
            >
            <div class="smartick-card-head">
              <div class="smartick-topbar">
                <div class="smartick-progress">
                  <div class="avatar-chip" :class="{ 'avatar-chip--celebrate': celebrateAvatar }">
                    <img :src="characterImage" alt="Avatar" />
                    <span v-if="celebrateAvatar" class="avatar-reward" aria-hidden="true">⭐</span>
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
                <div class="smartick-stage">
                  <div class="stage-pill">
                    <span>{{ stageLabel }}</span>
                  </div>
                  <div v-if="exerciseCounterLabel" class="exercise-counter-pill">
                    {{ exerciseCounterLabel }}
                  </div>
                </div>
                <div class="smartick-actions">
                  <RouterLink class="map-only-link" to="/mapview" aria-label="Volver al mapa">
                    <img src="/icons/mapa.PNG" alt="Mapa" class="map-only-icon" />
                  </RouterLink>
                  <button class="icon-btn" type="button" @click="handlePrev" aria-label="Anterior">
                    <img src="/icons/back.PNG" alt="" aria-hidden="true" class="action-icon-img" />
                  </button>
                  <button class="icon-btn" type="button" @click="handleSkip" aria-label="Saltar">
                    <img src="/icons/next.PNG" alt="" aria-hidden="true" class="action-icon-img" />
                  </button>
                </div>
              </div>

            </div>
            <div class="smartick-card-content space-y-4">
            <CelebrationCard
              v-if="currentStatus === 'ok'"
              :character-img="characterImage"
              :message="currentSuccessMessage"
            />
            <div v-else-if="progressiveFeedbackText" class="status-banner fail-banner" role="status" aria-live="polite">
              <span class="status-soft-dot" aria-hidden="true"></span>
              <span>{{ progressiveFeedbackText }}</span>
            </div>
            <GuidedTutor
              v-if="guidedTutor"
              :character-img="characterImage"
              :step="guidedTutor"
              :steps="tutorSteps"
              :step-index="tutorStepIndex"
              @play="playTutorCue"
            />
            <div v-if="conceptMiniLesson" class="concept-mini-lesson" aria-label="Mini lección visual">
              <span
                v-for="item in conceptMiniLesson"
                :key="item.label"
                class="concept-mini-lesson__item"
              >
                <span aria-hidden="true">{{ item.icon }}</span>
                <strong>{{ item.label }}</strong>
                <small v-if="item.note">{{ item.note }}</small>
              </span>
            </div>
            <!-- ========= VISUAL COMÚN (todos los niveles) ========= -->
            <div
              v-if="
                hasVisual &&
                !['L4-TW-1', 'L4-TW-2', 'L4-TW-3'].includes(current.id) &&
                (!isVerbTenseExercise(current) || current.image) &&
                (current.id !== 'L5-FE-2' || current.image) &&
                !(mobileViewport && isHabitatVisualMobile) &&
                current.type !== 'CHOOSE_CORRECT_WORD' &&
                current.type !== 'IMAGE_WORD_MATCH' &&
                current.type !== 'COMPLETE_WORD' &&
                current.type !== 'audio_question' &&
                current.type !== 'sentence_selection' &&
                !(current.type === 'text_write' && current.image) &&
                !(current.type === 'order_sentence' && current.image) &&
                !(current.type === 'audio_write' && current.image) &&
                !(current.type === 'SYLLABLE_ORDER' && current.image) &&
                (current.type !== 'pair_synonyms' || current.image) &&
                (current.type !== 'pair_antonyms' || current.image) &&
                (current.type !== 'singular_plural' || current.image) &&
                (current.type !== 'accent_game' || current.image) &&
                (current.type !== 'punctuation_game' || current.image) &&
                !(current.type === 'complete_sentence' && current.image) &&
                !(current.type === 'multiple_choice' && (current.image || current.emoji))
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
                <ExerciseOptions
                  :options="current.options || []"
                  :status="currentStatus"
                  :correct-answers="currentCorrectAnswers"
                  :word-highlight-enabled="choiceTextHighlightEnabled"
                  :active-word-token="choiceActiveKaraokeToken"
                  aria-label="Opciones de respuesta para la frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : 'idle'"
                  success-text="¡Muy bien! 🎉"
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

                <ExerciseOptions
                  :options="current.options || []"
                  :status="currentStatus"
                  :correct-answers="currentCorrectAnswers"
                  :word-highlight-enabled="choiceTextHighlightEnabled"
                  :active-word-token="choiceActiveKaraokeToken"
                  aria-label="Opciones para completar la frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : 'idle'"
                  success-text="¡Muy bien! 🎉"
                />
              </BaseExerciseLayout>
            </section>

            <!-- Ordenar frase (L1) -->
            <section v-else-if="current.type === 'order_sentence'">
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || current.sentence || current.hint || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <DragDropBoard
                prompt=""
                :words="current.words"
                :correct="current.correct || current.correctOrder"
                :hide-submit="level === 1 && stage === 1"
                @result="handleSimpleOrder"
              />
            </section>

            <!-- Leer con o sin audio (L1) -->
            <section v-else-if="current.type === 'read_with_audio'" class="space-y-4">
              <p v-if="!readWithAudioTextInTutor" class="audio-visible-text">
                <KaraokeText
                  :text="readingText"
                  :enabled="audioSyllableHighlightEnabled"
                  granularity="syllable"
                  :active-index="activeSyllable"
                />
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
                  <div class="choice-visual guided-word-visual">
                    <img
                      v-if="current.image"
                      :src="resolveAsset(current.image)"
                      :alt="current.imageAlt || current.question || 'Ilustración del ejercicio'"
                      class="choice-visual-img"
                      @error="$event.target.style.display = 'none'"
                    />
                    <div v-else class="choice-emoji" aria-hidden="true">{{ current.emoji }}</div>
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  :status="currentStatus"
                  :correct-answers="currentCorrectAnswers"
                  :word-highlight-enabled="choiceTextHighlightEnabled"
                  :active-word-token="choiceActiveKaraokeToken"
                  aria-label="Opciones de respuesta"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : 'idle'"
                  success-text="¡Muy bien! 🎉"
                />
              </BaseExerciseLayout>
            </section>

            <!-- Sinónimos (L2) -->
            <section v-else-if="current.type === 'pair_synonyms'">
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
                    <KaraokeText
                      :text="word"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
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
                    <KaraokeText
                      :text="option"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
                  </button>
                </div>
              </div>
            </section>

            <!-- Antónimos (L2) -->
            <section v-else-if="current.type === 'pair_antonyms'">
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
                    <KaraokeText
                      :text="word"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
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
                    <KaraokeText
                      :text="option"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
                  </button>
                </div>
              </div>
            </section>

            <!-- ========== NUEVOS TIPOS ========== -->

            <section v-else-if="current.type === 'UNSCRAMBLE_WORD'">
              <div class="options-row" :class="optionLayout(current.letters)">
                <button
                  v-for="(letter, idx) in current.letters"
                  :key="`letter-${idx}-${letter}`"
                  :class="['btn-option', 'letter-option', { 'letter-option--selected': lastUnscrambleLetterIndex === idx }]"
                  type="button"
                  @click="handleUnscramble(letter, idx)"
                >
                  {{ letter }}
                </button>
              </div>
              <div class="mt-3 text-center">
                <p class="word-build-preview">{{ unscrambleAttempt || '...' }}</p>
                <button class="btn btn-primary mt-2" type="button" @click="submitUnscramble">
                  Confirmar
                </button>
                <button class="btn btn-secondary mt-2 ml-2" type="button" @click="resetUnscramble">
                  Reiniciar
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'COMPLETE_WORD'">
              <CompleteWordVisual
                :image-src="resolveAsset(current.image || '')"
                :image-alt="current.imageAlt || completeWordSpokenText"
                :target-word="completeWordSpokenText"
                :slots="completeWordSlots"
                :values="completeWordInputs"
                :letters="completeWordLetterChoices"
                :letter-style="completeWordLetterStyle"
                @select-letter="fillNextCompleteWordBlank"
                @submit="handleTextSubmit"
                @reset="resetCompleteWordInputs"
              />
            </section>

            <section v-else-if="current.type === 'CHOOSE_CORRECT_WORD'">
              <div v-if="current.image" class="choice-visual guided-word-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || guidedTargetWord || 'Ilustración'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="(option, optionIdx) in current.options"
                  :key="option"
                  :class="guidedChoiceOptionClass(option, optionIdx)"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <KaraokeText
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'SYLLABLE_ORDER'">
              <div v-if="current.image" class="choice-visual syllable-order-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || current.hint || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
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
              <div v-if="current.image" class="choice-visual guided-word-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || guidedTargetWord || 'Ilustración'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="(option, optionIdx) in current.options"
                  :key="option"
                  :class="guidedChoiceOptionClass(option, optionIdx)"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <KaraokeText
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
                </button>
              </div>
            </section>

            <section v-else-if="current.type === 'READ_AND_ANSWER'">
              <p v-if="readAndAnswerText && !readAndAnswerTextInTutor" class="audio-visible-text reading-paragraph">
                <KaraokeText
                  :text="readAndAnswerText"
                  :enabled="audioSyllableHighlightEnabled"
                  granularity="syllable"
                  :active-index="activeAudioTextSyllable"
                />
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <KaraokeText
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 3: comprensión auditiva / lectura ========== -->

            <!-- Seleccionar frase que tiene sentido -->
            <section v-else-if="current.type === 'sentence_selection'">
              <BaseExerciseLayout aria-label="Seleccionar frase con sentido">
                <template #media v-if="current.image">
                  <div class="choice-visual guided-word-visual">
                    <img
                      :src="resolveAsset(current.image)"
                      :alt="current.imageAlt || current.prompt || 'Ilustración del ejercicio'"
                      class="choice-visual-img"
                      @error="$event.target.style.display = 'none'"
                    />
                  </div>
                </template>

                <ExerciseOptions
                  :options="current.options || []"
                  :status="currentStatus"
                  :correct-answers="currentCorrectAnswers"
                  :word-highlight-enabled="choiceTextHighlightEnabled"
                  :active-word-token="choiceActiveKaraokeToken"
                  aria-label="Opciones de frase"
                  @select="handleSimpleOption"
                />

                <ExerciseFeedback
                  :status="currentStatus === 'ok' ? 'success' : 'idle'"
                  success-text="¡Muy bien! 🎉"
                />
              </BaseExerciseLayout>
            </section>

            <!-- Pregunta con contexto / audio -->
            <section v-else-if="current.type === 'audio_question'">
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
                  <KaraokeText
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 4: producción escrita ========== -->

            <!-- Dictado / escribir palabra o frase -->
            <section v-else-if="current.type === 'audio_write'">
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || current.fallbackText || current.instruction || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
              <textarea
                v-model="textAnswer"
                rows="2"
                class="w-full border rounded-xl p-2 text-xl font-bold"
                :placeholder="current.placeholder || 'Escribe aquí...'"
              />
              <div class="mt-3 flex justify-end">
                <button class="btn btn-primary" type="button" @click="handleTextSubmit">
                  Continuar
                </button>
              </div>
            </section>

            <!-- Escritura creativa / guiada -->
            <section v-else-if="current.type === 'text_write'">
              <div v-if="current.image" class="choice-visual">
                <img
                  :src="resolveAsset(current.image)"
                  :alt="current.imageAlt || current.instruction || 'Ilustración del ejercicio'"
                  class="choice-visual-img"
                  @error="$event.target.style.display = 'none'"
                />
              </div>
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
              <div class="mt-3 flex justify-end">
                <button class="btn btn-primary" type="button" @click="handleTextSubmit">
                  Continuar
                </button>
              </div>
            </section>

            <!-- ========== NIVEL 5: tiempos, tildes y signos ========== -->

            <!-- Clasificar tiempos verbales -->
            <section v-else-if="current.type === 'tense_classify'">
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <KaraokeText
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
                </button>
              </div>
            </section>

            <!-- Singular / plural -->
            <section v-else-if="current.type === 'singular_plural'">
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
                    <KaraokeText
                      :text="word"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
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
                    <KaraokeText
                      :text="option"
                      :enabled="choiceTextHighlightEnabled"
                      :active-token="choiceActiveKaraokeToken"
                    />
                  </button>
                </div>
              </div>
            </section>

            <!-- Tildes mágicas -->
            <section v-else-if="current.type === 'accent_game'">
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
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <span class="punctuation-option">
                    <span class="punctuation-option__face" aria-hidden="true">
                      {{ punctuationOptionMeta(option).face }}
                    </span>
                    <span class="punctuation-option__sign">{{ option }}</span>
                    <span class="sr-only">{{ punctuationOptionMeta(option).label }}</span>
                  </span>
                </button>
              </div>
            </section>

            <!-- Examen final (opción múltiple) -->
            <section v-else-if="current.type === 'final_exam'">
              <p
                v-if="finalExamDisplayText"
                class="audio-visible-text"
              >
                <KaraokeText
                  :text="finalExamDisplayText"
                  :enabled="audioSyllableHighlightEnabled"
                  granularity="syllable"
                  :active-index="activeAudioTextSyllable"
                />
              </p>
              <div class="options-row" :class="optionLayout(current.options)">
                <button
                  v-for="option in current.options"
                  :key="option"
                  class="btn-option"
                  type="button"
                  @click="handleSimpleOption(option)"
                >
                  <span v-if="current.id === 'L5-FE-2'" class="punctuation-option">
                    <span class="punctuation-option__face" aria-hidden="true">
                      {{ punctuationOptionMeta(option).face }}
                    </span>
                    <span class="punctuation-option__sign">{{ option }}</span>
                    <span class="sr-only">{{ punctuationOptionMeta(option).label }}</span>
                  </span>
                  <KaraokeText
                    v-else
                    :text="option"
                    :enabled="choiceTextHighlightEnabled"
                    :active-token="choiceActiveKaraokeToken"
                  />
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
import { useProfileStore } from '../store/profileStore'
import { useExerciseEngine } from '../engine/logic/ExerciseEngine'
import { listLevels } from '../engine/logic/utils/validateTemplates'
import { getExerciseNarrationText } from '../utils/getExerciseNarrationText'
import { getAudioSettings, playSfx, playVoice, playVoiceCue, stopVoice, unlockAudio, stopMusic } from '../engine/audio/audioManager'
import { resolveExerciseAudioRoute } from '../engine/audio/exerciseVoiceRoutes'

import ExerciseShell from '../components/ExerciseShell.vue'
import DragDropBoard from '../components/DragDropBoard.vue'
import BaseExerciseLayout from '../components/exercises/BaseExerciseLayout.vue'
import ExerciseImage from '../components/exercises/ExerciseImage.vue'
import ExerciseOptions from '../components/exercises/ExerciseOptions.vue'
import ExerciseFeedback from '../components/exercises/ExerciseFeedback.vue'
import GuidedTutor from '../components/exercises/GuidedTutor.vue'
import CompleteWordVisual from '../components/exercises/CompleteWordVisual.vue'
import CelebrationCard from '../components/exercises/CelebrationCard.vue'
import KaraokeText from '../components/accessibility/KaraokeText.vue'

import Perezoso from '../assets/characters/Sloth.png'
import Zorro from '../assets/characters/Fox.png'
import Oso from '../assets/characters/Bear.png'
import Mono from '../assets/characters/Mono.png'
import Elefante_graduado from '../assets/characters/elephant.png'

const route = useRoute()
const router = useRouter()
const billing = useBillingStore()
const game = useGameStore()
const profile = useProfileStore()
const confettiPieces = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: (i % 6) * 0.12,
  duration: 4 + Math.random() * 3
}))
const showConfetti = ref(false)
const celebrateAvatar = ref(false)
let confettiTimer = null
let avatarCelebrateTimer = null
const readingHighlight = ref(false)
const activeKaraokeWordIndex = ref(-1)
let readingTimer = null
let syllableTimer = null
let syllableStepTimeouts = []
let activeAudioEl = null
let audioTimeUpdateHandler = null
let audioPlayingHandler = null
let audioLoadedMetadataHandler = null
let audioProgressRaf = null
let lastReadingProgress = 0
let lastTimelineIndex = -1
const READING_AUDIO_PACE = 0.82
const prefersReducedMotion = ref(false)
let previousBodyOverflow = ''
let previousHtmlOverflow = ''
let previousBodyOverscroll = ''
const gameViewRef = ref(null)
const exerciseCardRef = ref(null)
const mobileViewport = ref(false)

function updateMobileViewportFlag() {
  if (typeof window === 'undefined') return
  mobileViewport.value = window.matchMedia('(max-width: 768px)').matches
}

const exerciseScaleStyle = computed(() => null)

function lockExerciseScrollOnMobile() {
  if (typeof window === 'undefined') return
  if (!mobileViewport.value) return
  previousBodyOverflow = document.body.style.overflow || ''
  previousHtmlOverflow = document.documentElement.style.overflow || ''
  previousBodyOverscroll = document.body.style.overscrollBehavior || ''
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overscrollBehavior = 'none'
}

function restoreExerciseScrollLock() {
  if (typeof window === 'undefined') return
  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
  document.body.style.overscrollBehavior = previousBodyOverscroll
}

billing.load?.()
game.load?.()

onMounted(() => {
  if (typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    updateMobileViewportFlag()
    window.addEventListener('resize', updateMobileViewportFlag, { passive: true })
  }
  // Silencia la música global al entrar al modo ejercicios
  stopMusic(260)
  lockExerciseScrollOnMobile()
  profile.loadProfile?.()
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
  total,
  current,
  currentStatus,
  index,
  canNext,
  lastResult,
  progressiveFeedback,
  stageContext,
  checkAnswer,
  recordResult,
  skip,
  next,
  prev,
  repeat,
  stopAllMedia
} = engine

const progressiveFeedbackText = computed(() => {
  if (currentStatus.value !== 'fail') return ''
  return progressiveFeedback.value?.message || '¡Casi! Vamos juntos 💪'
})

const currentSuccessMessage = computed(() => {
  return current.value?.successMessage || '¡Muy bien!'
})
const readAndAnswerText = computed(() => {
  if (current.value?.type !== 'READ_AND_ANSWER') return ''
  return normalizeReadingText(current.value?.text || current.value?.context || current.value?.reading || '')
})
const readAndAnswerTextInTutor = computed(() => {
  return current.value?.type === 'READ_AND_ANSWER' && guidedTutor.value?.message === readAndAnswerText.value
})
const readWithAudioTextInTutor = computed(() => {
  return current.value?.type === 'read_with_audio' && guidedTutor.value?.message === readingText.value
})

const tutorStepIndex = ref(0)
const guidedOptionIndex = ref(-1)
const selectedOptionText = ref('')
const tutorAutoAudioPlayedFor = ref('')
let tutorStepTimer = null
let tutorAutoAudioTimer = null
let guidedOptionTimer = null
let tutorScheduleTimer = null

const guidedChoiceTypes = new Set(['CHOOSE_CORRECT_WORD', 'IMAGE_WORD_MATCH'])
const isGuidedWordChoice = computed(() => guidedChoiceTypes.has(String(current.value?.type || '')))
const isCompleteWordExercise = computed(() => current.value?.type === 'COMPLETE_WORD')
const completeWordLetterStyle = computed(() => {
  if (['L4-TW-4', 'L4-TW-5'].includes(current.value?.id)) return 'speech-bubble'
  return Number(level.value) === 2 && Number(stage.value) === 5 ? 'square-yellow' : 'default'
})
const guidedTargetWord = computed(() => {
  const exercise = current.value
  if (!exercise) return ''
  return resolveOptionText(
    exercise.solution ?? exercise.correct ?? exercise.answer ?? exercise.word ?? exercise.options?.[0]
  )
})
const TUTOR_ACTION_COPY_BY_TYPE = {
  question_sentence: 'Elige la respuesta.',
  complete_sentence: 'Completa la frase.',
  order_sentence: 'Pon las palabras en orden.',
  read_with_audio: 'Lee con calma.',
  multiple_choice: 'Elige una opción.',
  pair_synonyms: 'Une las parejas.',
  pair_antonyms: 'Une los opuestos.',
  UNSCRAMBLE_WORD: 'Forma la palabra.',
  COMPLETE_WORD: 'Completa la palabra.',
  CHOOSE_CORRECT_WORD: 'Elige el nombre.',
  SYLLABLE_ORDER: 'Ordena las sílabas.',
  PUZZLE_ORDER: 'Ordena las piezas.',
  IMAGE_WORD_MATCH: 'Elige el nombre.',
  READ_AND_ANSWER: 'Lee y responde.',
  sentence_selection: 'Elige la frase.',
  audio_question: 'Escucha y responde.',
  audio_write: 'Escucha y escribe.',
  text_write: 'Escribe tu respuesta.',
  tense_classify: '¿Cuándo pasa?',
  singular_plural: 'Une las parejas.',
  accent_game: 'Escucha la parte fuerte.',
  punctuation_game: 'Elige el signo que va.',
  final_exam: 'Elige la respuesta.'
}

const TUTOR_LISTEN_TYPES = new Set([
  'audio_question',
  'audio_write',
  'read_with_audio',
  'READ_AND_ANSWER'
])

const blankSymbol = '_____'
const blankRegex = /_{2,}/g

function isVerbTenseExercise(exercise) {
  const id = String(exercise?.id || '')
  return exercise?.type === 'tense_classify' || id === 'L5-FE-1' || id.startsWith('L5-FE-TCOMP-')
}

function isPunctuationExercise(exercise) {
  return exercise?.type === 'punctuation_game' || exercise?.id === 'L5-FE-2'
}

function hasExerciseVisual(exercise) {
  if ((isVerbTenseExercise(exercise) || exercise?.id === 'L5-FE-2') && !exercise?.image) return false
  return Boolean(exercise?.image || exercise?.emoji)
}

function hasExerciseAudioCue(exercise) {
  if (!exercise) return false
  return Boolean(exercise.audio || cueForExercise(exercise) || TUTOR_LISTEN_TYPES.has(String(exercise.type || '')))
}

function getTutorActionCopy(exercise) {
  if (!exercise) return 'Haz el ejercicio.'
  return TUTOR_ACTION_COPY_BY_TYPE[exercise.type] || 'Haz el ejercicio.'
}

function getTutorInstructionSteps(exercise) {
  if (!exercise || currentStatus.value === 'skipped') return []
  if (currentStatus.value === 'ok' && !isPunctuationExercise(exercise)) return []

  const steps = []
  const cue = cueForExercise(exercise) || exercise.audio || null
  if (exercise.type === 'READ_AND_ANSWER') {
    return [{
      key: 'act',
      message: normalizeReadingText(exercise.text || exercise.context || exercise.reading || getReadableExerciseText(exercise)),
      cue,
      focus: 'options'
    }]
  }
  if (isVerbTenseExercise(exercise)) {
    return [{
      key: 'act',
      message: getReadableExerciseText(exercise) || getTutorActionCopy(exercise),
      cue,
      focus: 'options'
    }]
  }
  if (isPunctuationExercise(exercise)) {
    return [{
      key: 'act',
      message: punctuationDisplayText(exercise),
      cue,
      focus: 'options'
    }]
  }
  if (exercise.id === 'L5-FE-3') {
    return [{
      key: 'act',
      message: exercise.question,
      cue,
      focus: 'options'
    }]
  }
  if (exercise.type === 'read_with_audio') {
    return [{
      key: 'act',
      message: getReadableExerciseText(exercise) || getTutorActionCopy(exercise),
      cue,
      focus: 'audio'
    }]
  }

  if (hasExerciseVisual(exercise)) {
    steps.push({
      key: 'look',
      message: 'Mira la imagen.',
      cue,
      focus: 'visual'
    })
  }

  if (hasExerciseAudioCue(exercise)) {
    steps.push({
      key: 'listen',
      message: 'Escucha con calma.',
      cue,
      focus: 'audio'
    })
  }

  steps.push({
    key: 'act',
    message: getTutorActionCopy(exercise),
    cue,
    focus: 'options'
  })

  return steps.slice(-3)
}

const tutorSteps = computed(() => {
  return getTutorInstructionSteps(current.value)
})

const guidedTutor = computed(() => tutorSteps.value[tutorStepIndex.value] ?? null)

const conceptMiniLesson = computed(() => {
  if (!current.value || currentStatus.value === 'ok' || Number(level.value) !== 5) return null
  if (current.value.type === 'tense_classify') {
    return [
      { icon: 'Ayer', label: 'Pasado', note: 'Ya ocurrió' },
      { icon: 'Hoy', label: 'Presente', note: 'Pasa ahora' },
      { icon: 'Mañana', label: 'Futuro', note: 'Pasará después' }
    ]
  }
  if (current.value.type === 'accent_game' || current.value.id === 'L5-FE-3') {
    return [
      { icon: '👏', label: 'Sílaba' },
      { icon: '🔊', label: 'Fuerte' },
      { icon: '´', label: 'Tilde' }
    ]
  }
  if (current.value.type === 'punctuation_game' || current.value.id === 'L5-FE-2') {
    return [
      { icon: '🤔 ¿?', label: 'Pregunta' },
      { icon: '😮 ¡!', label: 'Emoción' },
      { icon: '😌 .', label: 'Punto' }
    ]
  }
  return null
})

function clearTutorTimers() {
  if (tutorScheduleTimer) {
    clearTimeout(tutorScheduleTimer)
    tutorScheduleTimer = null
  }
  if (tutorStepTimer) {
    clearTimeout(tutorStepTimer)
    tutorStepTimer = null
  }
  if (tutorAutoAudioTimer) {
    clearTimeout(tutorAutoAudioTimer)
    tutorAutoAudioTimer = null
  }
  if (guidedOptionTimer) {
    clearInterval(guidedOptionTimer)
    guidedOptionTimer = null
  }
}

function playTutorCue() {
  playTutorStatementAudio()
}

function playTutorStatementAudio() {
  const audioSettings = getAudioSettings()
  const exercise = current.value
  const audioSequence = Array.isArray(exercise?.audioSequence)
    ? exercise.audioSequence.filter((src) => String(src || '').trim())
    : []
  if (audioSequence.length) {
    unlockAudio()
    playVoiceSequence(audioSequence, {
      forceVoiceEnabled: true,
      volume: audioSettings.voiceVolume
    })
    return
  }
  const exerciseAudio = exercise?.audio ? resolveExerciseAudioRoute(exercise) : ''
  const voiceKey = exerciseAudio || guidedTutor.value?.cue || cueForExercise(exercise) || ''
  if (voiceKey) {
    unlockAudio()
    const cue = cueForExercise(exercise)
    if (exerciseAudio) {
      playVoice(exerciseAudio, {
        interrupt: true,
        forceVoiceEnabled: true,
        volume: audioSettings.voiceVolume
      })
    } else if (audioSettings.voiceEnabled && cue && voiceKey === cue) {
      playVoiceCue(cue, {
        filenameFallback: exercise?.id,
        volume: audioSettings.voiceVolume
      })
    } else if (audioSettings.voiceEnabled) {
      playVoice(voiceKey, {
        interrupt: true,
        volume: audioSettings.voiceVolume
      })
    }
    return
  }
}

function playVoiceSequence(sources = [], options = {}) {
  const queue = Array.isArray(sources) ? sources.filter((src) => String(src || '').trim()) : []
  const playNext = (index = 0) => {
    const source = queue[index]
    if (!source) return
    playVoice(source, {
      ...options,
      interrupt: index === 0,
      onEnd: () => playNext(index + 1)
    })
  }
  playNext()
}

function scheduleTutorStep() {
  clearTutorTimers()
  if (!guidedTutor.value) return

  const exerciseId = String(current.value?.id || '')
  if (exerciseId && tutorAutoAudioPlayedFor.value !== exerciseId) {
    tutorAutoAudioPlayedFor.value = exerciseId
    tutorAutoAudioTimer = setTimeout(() => {
      playTutorCue()
    }, 320)
  }

  if (tutorStepIndex.value < tutorSteps.value.length - 1) {
    tutorStepTimer = setTimeout(() => {
      tutorStepIndex.value += 1
      scheduleTutorStep()
    }, prefersReducedMotion.value ? 3600 : 3200)
  } else if (guidedTutor.value?.key === 'act') {
    startGuidedOptionHighlight()
  }
}

function scheduleTutorSoon(delay = 180) {
  if (tutorScheduleTimer) clearTimeout(tutorScheduleTimer)
  tutorScheduleTimer = setTimeout(() => {
    tutorScheduleTimer = null
    scheduleTutorStep()
  }, delay)
}

const gameViewClasses = computed(() => ({
  'option-status-ok': currentStatus.value === 'ok',
  'option-status-fail': currentStatus.value === 'fail',
  'tutor-focus-visual': guidedTutor.value?.focus === 'visual',
  'tutor-focus-audio': guidedTutor.value?.focus === 'audio',
  'tutor-focus-options': guidedTutor.value?.focus === 'options',
  'compact-mobile': mobileViewport.value,
  'ultra-compact-mobile': mobileViewport.value,
  'game-view--mono-3-3-centered': isMonoStage3of3.value || isMonoExerciseThirdOfThree.value
}))

const isMonoStage3of3 = computed(() => {
  const isLevelThree = Number(level.value) === 3
  const isStageThree = Number(stage.value) === 3
  const total = Number(stageContext.value?.totalStages ?? 0)
  return isLevelThree && isStageThree && (total === 3 || total === 0)
})

const isMonoExerciseThirdOfThree = computed(() => {
  const id = String(current.value?.id || '').toUpperCase()
  return /^L3-[A-Z_]+-3$/.test(id)
})

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
const currentCorrectAnswers = computed(() => {
  const exercise = current.value
  if (!exercise) return []
  const raw = exercise.correct ?? exercise.answer ?? exercise.expectedAnswer ?? exercise.solution
  const values = Array.isArray(raw) ? raw : [raw]
  return values.map((entry) => resolveOptionText(entry)).filter(Boolean)
})
const PUNCTUATION_OPTION_META = {
  '¿': { face: '🤔', label: 'Duda, signo de interrogación inicial' },
  '?': { face: '🤔', label: 'Duda, signo de interrogación final' },
  '¡': { face: '😮', label: 'Sorpresa, signo de exclamación inicial' },
  '!': { face: '😮', label: 'Sorpresa, signo de exclamación final' },
  '.': { face: '😌', label: 'Final de la frase, punto' },
  ',': { face: '🙂', label: 'Pausa breve, coma' }
}
function punctuationOptionMeta(option) {
  return PUNCTUATION_OPTION_META[resolveOptionText(option)] || {
    face: '🙂',
    label: `Signo ${resolveOptionText(option)}`
  }
}
function punctuationDisplayText(exercise) {
  const text = exercise?.sentence || exercise?.question || ''
  const replacement = selectedOptionText.value
  if (replacement) {
    return text
      .replace(blankRegex, replacement)
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([¿¡])\s+/g, '$1')
  }
  return text
}
const finalExamDisplayText = computed(() => {
  const exercise = current.value
  if (!exercise) return ''
  if (exercise.type === 'final_exam' && isVerbTenseExercise(exercise)) return ''
  if (isPunctuationExercise(exercise)) {
    return [exercise.question, punctuationDisplayText(exercise)]
      .filter(Boolean)
      .join(': ')
  }
  return exercise.question || exercise.sentence || exercise.prompt || ''
})
function optionLayout(list) {
  const count = Array.isArray(list) ? list.length : 0
  return count > 2 ? 'options-column' : ''
}

function normalizeReadingText(text = '') {
  return text.replace(/\s+/g, ' ').trim()
}

function getTutorStatementText(exercise) {
  if (!exercise) return ''
  const values = [
    exercise.narrationText,
    exercise.prompt,
    exercise.question,
    exercise.instruction,
    exercise.sentence,
    exercise.text,
    exercise.context,
    exercise.phrase,
    exercise.targetText,
    exercise.hint
  ]
  const text = values.find((value) => typeof value === 'string' && value.trim())
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function getReadableExerciseText(exercise) {
  if (!exercise) return ''
  const mainText = getExerciseNarrationText(exercise) || getTutorStatementText(exercise)
  if (!mainText) return ''
  const answer = resolveOptionText(exercise.solution ?? exercise.correct ?? exercise.answer ?? exercise.expectedAnswer)
  if (answer) {
    return normalizeReadingText(String(mainText).replace(blankRegex, answer))
  }
  return normalizeReadingText(mainText)
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

function splitWordIntoSyllables(word = '', vowels = '') {
  const source = String(word || '')
  if (!source) return []

  const normalized = source.toLowerCase()
  const isVowel = (char) => vowels.includes(char)
  const strongVowels = new Set(['a', 'e', 'o', 'á', 'é', 'ó'])
  const weakVowels = new Set(['i', 'u', 'ü', 'í', 'ú'])
  const inseparableOnsets = new Set([
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'tl', 'ch', 'll', 'rr'
  ])

  const breaksDiphthong = (a, b) => {
    if (!a || !b) return true
    const aStrong = strongVowels.has(a)
    const bStrong = strongVowels.has(b)
    if (aStrong && bStrong) return true
    if ((a === 'í' || a === 'ú') || (b === 'í' || b === 'ú')) return true
    return false
  }

  const pieces = []
  let i = 0
  while (i < source.length) {
    let nucleusStart = i
    while (nucleusStart < source.length && !isVowel(normalized[nucleusStart])) nucleusStart += 1
    if (nucleusStart >= source.length) {
      if (pieces.length) {
        pieces[pieces.length - 1] += source.slice(i)
      } else {
        pieces.push(source.slice(i))
      }
      break
    }

    let nucleusEnd = nucleusStart
    while (nucleusEnd + 1 < source.length && isVowel(normalized[nucleusEnd + 1])) {
      const prev = normalized[nucleusEnd]
      const next = normalized[nucleusEnd + 1]
      if (breaksDiphthong(prev, next)) break
      nucleusEnd += 1
    }

    let consonantRunEnd = nucleusEnd + 1
    while (consonantRunEnd < source.length && !isVowel(normalized[consonantRunEnd])) consonantRunEnd += 1

    const consonantRun = source.slice(nucleusEnd + 1, consonantRunEnd)
    let splitInRun = consonantRun.length
    if (consonantRun.length <= 1) {
      splitInRun = 0
    } else if (consonantRun.length === 2) {
      splitInRun = inseparableOnsets.has(consonantRun.toLowerCase()) ? 0 : 1
    } else if (consonantRun.length === 3) {
      splitInRun = inseparableOnsets.has(consonantRun.slice(1).toLowerCase()) ? 1 : 2
    } else if (consonantRun.length >= 4) {
      splitInRun = 2
    }

    const chunkEnd = nucleusEnd + 1 + splitInRun
    pieces.push(source.slice(i, chunkEnd))
    i = chunkEnd
  }

  return pieces.filter(Boolean)
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

function isFuerzaTranquilaStage2of6Now() {
  const stageNumber = Number(stage.value ?? 0)
  const totalStages = Number(stageContext.value?.totalStages ?? 0)
  const levelName = String(stageContext.value?.levelMeta?.levelName || '').trim().toLowerCase()
  const isTargetLevel = level.value === 1 || levelName === 'la fuerza tranquila'
  const isTargetStage = stageNumber === 2
  const isTargetTotal = totalStages === 0 || totalStages === 6
  return isTargetLevel && isTargetStage && isTargetTotal
}

const readingText = computed(() => {
  return getReadableExerciseText(current.value)
})

const AUDIO_TEXT_HIGHLIGHT_ENABLED = false
const audioSyllableHighlightEnabled = computed(() => false)
const wordByWordHighlightEnabled = audioSyllableHighlightEnabled
const choiceTextHighlightEnabled = computed(() => false)
const choiceActiveKaraokeToken = computed(() => '')
const activeAudioTextSyllable = computed(() =>
  audioSyllableHighlightEnabled.value ? activeSyllable.value : -1
)

const exerciseKaraokeText = computed(() => {
  const exercise = current.value
  if (!exercise) return ''

  const mainText = getReadableExerciseText(exercise)
  const options = Array.isArray(exercise.options)
    ? exercise.options.map(resolveOptionText).filter(Boolean)
    : []
  const pairs = Array.isArray(exercise.pairs)
    ? exercise.pairs.flatMap((pair) => [
      pair.word || pair.singular || pair.statement,
      pair.match || pair.synonym || pair.antonym || pair.plural || pair.response
    ]).filter(Boolean)
    : []

  return normalizeReadingText([mainText, ...options, ...pairs].filter(Boolean).join(' '))
})

const spokenWordSegmentsForHighlight = computed(() =>
  segmentTextIntoWords(exerciseKaraokeText.value)
    .map((segment, idx) => ({ ...segment, idx }))
    .filter((segment) => !segment.isGap && normalizeWordToken(segment.text))
)

const spokenWordTimeline = computed(() => {
  const spoken = spokenWordSegmentsForHighlight.value
  if (!spoken.length) return []

  const weights = spoken.map((segment) => {
    const base = Math.max(1, String(segment.text || '').length)
    const punctuationBoost = /[.,;:!?]/.test(String(segment.text || '')) ? 1.2 : 0
    return base + punctuationBoost
  })
  const totalWeight = weights.reduce((acc, value) => acc + value, 0)
  if (totalWeight <= 0) return []

  let cumulative = 0
  return spoken.map((segment, i) => {
    cumulative += weights[i]
    return {
      idx: i,
      token: normalizeWordToken(segment.text),
      endProgress: cumulative / totalWeight
    }
  })
})

const syllableSegments = computed(() => {
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

const spokenSyllableTimeline = computed(() => {
  const full = syllableSegments.value
  const spoken = spokenSegments.value
  if (!spoken.length) return []

  const weights = spoken.map((segment) => {
    // Base por sílaba + pausa natural al final de palabra para seguir mejor la voz.
    const base = Math.max(1, String(segment.text || '').length)
    const nextFull = full[segment.idx + 1]
    const nextText = String(nextFull?.text || '')
    const isWordEnd = Boolean(nextFull?.isGap)
    const gapBoost = isWordEnd ? Math.min(3.4, 1.55 + nextText.length * 0.45) : 0
    const punctuationBoost = /[.,;:!?]/.test(String(segment.text || '') + nextText) ? 1.6 : 0
    return base + gapBoost + punctuationBoost
  })

  const introPauseWeight = 1.4
  const endingHoldWeight = 1.1
  const totalWeight = weights.reduce((acc, value) => acc + value, introPauseWeight + endingHoldWeight)
  if (totalWeight <= 0) return []

  let cumulative = introPauseWeight
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
  3: Oso,
  4: Mono,
  5: Elefante_graduado
}

watch(
  () => currentStatus.value,
  (status) => {
    if (status === 'ok') {
      unlockAudio()
      playSfx('correct')
      if (current.value?.successAudio) {
        const audioSettings = getAudioSettings()
        playVoice(current.value.successAudio, {
          interrupt: false,
          volume: audioSettings.voiceVolume
        })
      }
      showConfetti.value = true
      celebrateAvatar.value = true
      if (confettiTimer) clearTimeout(confettiTimer)
      if (avatarCelebrateTimer) clearTimeout(avatarCelebrateTimer)
      confettiTimer = setTimeout(() => {
        showConfetti.value = false
      }, 4500)
      avatarCelebrateTimer = setTimeout(() => {
        celebrateAvatar.value = false
      }, 950)
    } else if (status === 'fail') {
      celebrateAvatar.value = false
    }
  }
)

const EXERCISE_VOICE_CUE_BY_TYPE = {
  IMAGE_WORD_MATCH: 'select-image-word'
}

const EXERCISE_VOICE_CUE_BY_ID = {
  'L1-OS-1': 'l1-os-1',
  'L1-OS-2': 'l1-os-2',
  'L1-OS-3': 'l1-os-3',
  'L1-OS-4': 'l1-os-4',
  'L1-CS-1': 'l1-cs-1',
  'L1-CS-2': 'l1-cs-2',
  'L1-CS-3': 'l1-cs-3',
  'L1-CS-4': 'l1-cs-4',
  'L1-CS-5': 'l1-cs-5',
  'L1-CS-6': 'l1-cs-6',
  'L1-CS-7': 'l1-cs-7',
  'L1-CS-8': 'l1-cs-8',
  'L1-QS-1': 'l1-fs-1',
  'L1-QS-2': 'l1-fs-2',
  'L1-QS-3': 'l1-fs-3',
  'L1-QS-4': 'l1-fs-4',
  'L2-MC-1': 'l1-voc-1',
  'L2-MC-2': 'l1-voc-2',
  'L2-MC-3': 'l1-voc-3',
  'L2-MC-4': 'l1-voc-4',
  'L2-MC-5': 'l1-voc-5',
  'L2-MC-6': 'l1-voc-6',
  'L2-MC-7': 'l1-voc-7',
  'L2-PA-1': 'l2-pa-1',
  'L2-PA-2': 'l2-pa-2',
  'L2-PS-1': 'l2-ps-1',
  'L2-PS-2': 'l2-ps-2',
  'L2-PS-3': 'l2-ps-3',
  'L3-AQ-1': 'l3-aq-1',
  'L3-AQ-2': 'l3-aq-2',
  'L3-AQ-3': 'l3-aq-3',
  'L3-SO-1': 'prompt-ordena-las-palabras',
  'L3-SO-2': 'prompt-ordena-las-palabras',
  'L3-SS-1': 'l3-ss-1-prompt',
  'L3-SS-2': 'l3-ss-2-prompt',
  'L3-SS-3': 'l3-ss-3-prompt',
  'L4-AW-1': 'l1-write-1',
  'L4-AW-2': 'l4-aw-2-instruction',
  'L4-RA-1': 'l4-ra-1-question',
  'L4-RA-2': 'l4-ra-2-question',
  'L5-TC-1': 'l5-tc-1-sentence',
  'L5-TC-2': 'l5-tc-2-sentence',
  'L5-TC-3': 'l5-tc-3-sentence',
  'L5-AG-1': 'l1-grammar-1',
  'L5-AG-2': 'l1-grammar-2',
  'L5-PG-1': 'l5-pg-1-sentence',
  'L5-PG-2': 'l5-pg-2-sentence',
  'L5-PG-3': 'l5-pg-3-sentence',
  'L5-FE-1': 'l1-grammar-3',
  'L5-FE-2': 'l1-grammar-4',
  'L5-FE-3': 'l1-grammar-5'
}

const EXERCISE_VOICE_CUE_BY_QUESTION = {
  'encierra el nombre correcto del dibujo sol': 'l1-voc-1',
  'encierra el nombre correcto del dibujo sapo': 'l1-voc-2',
  'encierra el nombre correcto del dibujo sopa': 'l1-voc-3',
  'encierra el nombre correcto del dibujo mesa': 'l1-voc-4',
  'encierra el nombre correcto del dibujo oso': 'l1-voc-5',
  'encierra el nombre correcto del dibujo pato': 'l1-voc-6',
  'encierra el nombre correcto del dibujo luna': 'l1-voc-7'
}

const EXERCISE_VOICE_CUE_BY_TEXT = {
  'une palabras que significan lo contrario': 'l2-pa-1',
  'recuerda el opuesto crea equilibrio magico': 'l2-pa-2',
  'busca parejas que compartan significado': 'l2-ps-1',
  'observa como cada palabra describe lo mismo': 'l2-ps-2',
  'une el numero con su nombre escrito': 'l2-ps-3'
}

function normalizeExerciseText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cueForExercise(exercise) {
  if (!exercise) return null
  const exerciseId = String(exercise.id || '').trim().toUpperCase()
  if (exerciseId && EXERCISE_VOICE_CUE_BY_ID[exerciseId]) {
    return EXERCISE_VOICE_CUE_BY_ID[exerciseId]
  }
  const questionKey = normalizeExerciseText(exercise.question || exercise.prompt)
  if (questionKey && EXERCISE_VOICE_CUE_BY_QUESTION[questionKey]) {
    return EXERCISE_VOICE_CUE_BY_QUESTION[questionKey]
  }
  const textKey = normalizeExerciseText(exercise.hint || exercise.instruction || exercise.question || exercise.prompt)
  if (textKey && EXERCISE_VOICE_CUE_BY_TEXT[textKey]) {
    return EXERCISE_VOICE_CUE_BY_TEXT[textKey]
  }
  const type = String(exercise.type || '').trim()
  return EXERCISE_VOICE_CUE_BY_TYPE[type] || null
}

const isFuerzaTranquilaStage4of6 = computed(() => isFuerzaTranquilaStage4of6Now())
const isFuerzaTranquilaStage2of6 = computed(() => isFuerzaTranquilaStage2of6Now())
const isStage1of4 = computed(() => {
  const stageNumber = Number(stage.value ?? 0)
  const totalStages = Number(stageContext.value?.totalStages ?? 0)
  return stageNumber === 1 && totalStages === 4
})

watch(
  () => stage.value,
  () => {
    unlockAudio()
    playSfx('click')
    playVoiceCue('start')
  }
)

watch(
  () => current.value?.id,
  () => {
    const exercise = current.value
    const id = exercise?.id
    if (!id) return
    const audioSettings = getAudioSettings()
    if (!audioSettings.voiceEnabled) return
    unlockAudio()
    if (tutorSteps.value.length) return
    const cue = cueForExercise(exercise)
    if (cue) {
      playVoiceCue(cue, {
        filenameFallback: exercise?.audio || exercise?.id
      })
      return
    }
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
  if (isGuidedWordChoice.value) return ''
  if (hideHeaders.value) return ''
  return meta.value?.title ?? current.value?.title ?? 'Ejercicio mágico'
})
const shellInstructions = computed(() => {
  if (isGuidedWordChoice.value) return ''
  if (hideHeaders.value) return ''
  return current.value?.instructions ?? meta.value?.description ?? 'Sigue las indicaciones con calma.'
})
const stageLabel = computed(() => {
  const context = stageContext.value
  if (meta.value?.stageLabel) return meta.value.stageLabel
  if (context?.stageMeta?.title) return context.stageMeta.title
  return `Etapa ${stage.value}`
})
const exerciseCounterLabel = computed(() => {
  const count = Number(total.value || 0)
  if (!count) return ''
  return `Ejercicio ${Number(index.value || 0) + 1}/${count}`
})

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

const showCompleteWordSupport = computed(() =>
  current.value?.type === 'COMPLETE_WORD' &&
  currentStatus.value === 'fail' &&
  Boolean(completeWordSpokenText.value)
)

const missingLetterPieces = computed(() => {
  if (current.value?.type !== 'COMPLETE_WORD') return []
  return completeWordMissingLetters.value
})

const completeWordMissingLetters = computed(() => {
  if (current.value?.type !== 'COMPLETE_WORD') return []
  const solution = completeWordSpokenText.value.toLowerCase()
  const pattern = completeWordPattern.value
  if (!solution || !pattern) return []
  return pattern
    .split('')
    .map((char, idx) => (char === '_' ? solution[idx] : ''))
    .filter((char) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/u.test(char))
})

const completeWordLetterChoices = computed(() => {
  if (current.value?.type !== 'COMPLETE_WORD') return []
  const base = Array.from(new Set(completeWordMissingLetters.value.map((letter) => letter.toUpperCase())))
  const vowels = ['A', 'E', 'I', 'O', 'U']
  for (const vowel of vowels) {
    if (base.length >= 5) break
    if (!base.includes(vowel)) base.push(vowel)
  }
  return base
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

const fallbackIcon = computed(() => stageContext.value?.levelMeta?.icon || '🪄')
const fallbackLabel = computed(() => stageContext.value?.levelMeta?.animal || 'Animal sabio')
const currentImageSrc = computed(() => resolveAsset(current.value?.image))
const isHabitatVisualMobile = computed(() => {
  const src = String(currentImageSrc.value || '').toLowerCase()
  return src.includes('/habitats/')
})
const fallbackCharacterImage = computed(() => levelCharacters[level.value] || Perezoso)
const hasVisual = computed(() => Boolean(currentImageSrc.value || fallbackCharacterImage.value))
const imageLoadFailed = ref(false)

const questionMaskedSentence = computed(() => {
  if (current.value?.type !== 'question_sentence') return current.value?.sentence || ''
  return maskSentence(current.value.sentence, current.value.correct || current.value.answer)
})

// UNSCRAMBLE
const unscrambleAttempt = ref('')
const lastUnscrambleLetterIndex = ref(null)
function handleUnscramble(letter, index = null) {
  unlockAudio()
  playSfx('click')
  lastUnscrambleLetterIndex.value = index
  unscrambleAttempt.value += letter
}
function resetUnscramble() {
  unscrambleAttempt.value = ''
  lastUnscrambleLetterIndex.value = null
}
function submitUnscramble() {
  if (!current.value) return
  unlockAudio()
  playSfx('click')
  checkAnswer(unscrambleAttempt.value, {
    autoAdvance: true,
    playPositive: false,
    awaitPositiveCue: false,
    advanceDelay: current.value?.successAudio ? 1800 : 450
  })
  unscrambleAttempt.value = ''
  lastUnscrambleLetterIndex.value = null
}

function fillNextCompleteWordBlank(letter) {
  const nextIndex = completeWordInputs.value.findIndex((value) => !String(value || '').trim())
  const targetIndex = nextIndex >= 0 ? nextIndex : 0
  completeWordInputs.value[targetIndex] = String(letter || '').slice(0, 1).toLowerCase()
  focusCompleteWordInput(targetIndex + 1)
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

async function handleStageComplete(summary) {
  try {
    await game.setStageResult?.(summary.level, summary.stage, {
      ...summary,
      done: true
    })
  } catch (err) {
    console.error('[Game] No se pudo guardar el progreso de la etapa antes de navegar:', err)
  }
  unlockAudio()
  playSfx('unlock')

  const isFinalLevel = summary.level === 5
  const finishedLastStage = summary.totalStages
    ? summary.stage >= summary.totalStages
    : false
  const nextTarget = resolveNextStageTarget(summary)

  router.push({
    name: 'Congrats',
    query: {
      level: summary.level,
      stage: summary.stage,
      totalStages: summary.totalStages,
      stars: summary.stars,
      stageTitle: stageContext.value?.stageMeta?.title ?? meta.value?.title ?? '',
      nextLevel: nextTarget?.level ?? '',
      nextStage: nextTarget?.stage ?? '',
      completedGame: isFinalLevel && finishedLastStage ? '1' : '0'
    }
  }).catch((err) => {
    console.error('[Game] No se pudo abrir la pantalla de felicitación:', err)
    router.push('/mapview').catch(() => {})
  })
}

function resolveNextStageTarget(summary) {
  const currentLevel = Number(summary?.level || level.value || 1)
  const currentStage = Number(summary?.stage || stage.value || 1)
  const totalInLevel = Number(summary?.totalStages || stageContext.value?.totalStages || 0)

  if (totalInLevel && currentStage < totalInLevel) {
    return {
      level: currentLevel,
      stage: currentStage + 1
    }
  }

  const nextLevel = listLevels()
    .map((levelId) => Number(levelId))
    .filter((levelId) => Number.isFinite(levelId) && levelId > currentLevel)
    .sort((a, b) => a - b)[0]

  if (!nextLevel) return null

  return {
    level: nextLevel,
    stage: 1
  }
}

function handleSimpleOption(option) {
  unlockAudio()
  playSfx('click')
  selectedOptionText.value = resolveOptionText(option)
  checkAnswer(option, {
    autoAdvance: true,
    advanceDelay: isPunctuationExercise(current.value) ? 1300 : 450
  })
}

function startGuidedOptionHighlight() {
  if (!isGuidedWordChoice.value || !Array.isArray(current.value?.options) || current.value.options.length === 0) {
    guidedOptionIndex.value = -1
    return
  }
  guidedOptionIndex.value = 0
  if (prefersReducedMotion.value) return
  guidedOptionTimer = setInterval(() => {
    const total = current.value?.options?.length || 0
    if (!total) {
      guidedOptionIndex.value = -1
      return
    }
    guidedOptionIndex.value = (guidedOptionIndex.value + 1) % total
  }, 780)
}

function guidedChoiceOptionClass(option, optionIdx) {
  const optionText = resolveOptionText(option)
  const selected = selectedOptionText.value && normalizeStringLoose(selectedOptionText.value) === normalizeStringLoose(optionText)
  const isCorrect = currentCorrectAnswers.value.some(
    (answer) => normalizeStringLoose(answer) === normalizeStringLoose(optionText)
  )
  return [
    'btn-option',
    'guided-choice-option',
    {
      'guided-choice-option--spotlight': guidedTutor.value?.key === 'act' && optionIdx === guidedOptionIndex.value,
      'guided-choice-option--selected': selected,
      'guided-choice-option--correct': currentStatus.value === 'ok' && isCorrect,
      'guided-choice-option--incorrect': currentStatus.value === 'fail' && selected && !isCorrect
    }
  ]
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
    option.value ||
    ''
  )
}

function normalizeStringLoose(value) {
  return String(value ?? '').trim().toLowerCase()
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
  unlockAudio()
  clearAudioListeners()
  stopAllMedia()
  resetReadingHighlight()
  const shouldSyncHighlight = AUDIO_TEXT_HIGHLIGHT_ENABLED && audioSyllableHighlightEnabled.value && Boolean(readingText.value)
  const playbackRate = shouldSyncHighlight ? READING_AUDIO_PACE : 1
  const audio = playVoice(src, {
    interrupt: true,
    forceVoiceEnabled: true,
    playbackRate,
    onEnd: () => {
      clearAudioListeners()
      activeAudioEl = null
      resetReadingHighlight()
      onEnd?.()
    }
  })
  activeAudioEl = audio || null
  if (audio && shouldSyncHighlight) {
    bindReadingProgressToAudio(audio, playbackRate)
  }
  return audio
}

function bindReadingProgressToAudio(audioEl, playbackRate = 1) {
  if (!audioEl || !AUDIO_TEXT_HIGHLIGHT_ENABLED || !audioSyllableHighlightEnabled.value) return
  clearAudioListeners()
  const estimate = getEstimatedReadingDurationMs()
  const effectiveEstimate = getEffectiveDurationMs(estimate, playbackRate)
  let pulseStarted = false

  const updateFromAudio = () => {
    if (!pulseStarted && audioEl.currentTime > 0) {
      startPulseFromCurrentAudioTime()
    }
    if (!pulseStarted) return
    const durationSec =
      isFinite(audioEl.duration) && audioEl.duration > 0
        ? audioEl.duration
        : effectiveEstimate / 1000
    if (durationSec > 0) {
      const progress = Math.min(1, Math.max(0, audioEl.currentTime / durationSec))
      syncActiveSyllableByProgress(progress)
    }
  }
  const startPulseFromCurrentAudioTime = () => {
    if (pulseStarted) return
    const durationMs = isFinite(audioEl.duration) && audioEl.duration > 0
      ? audioEl.duration * 1000
      : estimate
    const effectiveDuration = getEffectiveDurationMs(durationMs, playbackRate)
    startReadingPulse(effectiveDuration)
    pulseStarted = true
    updateFromAudio()
  }
  const runProgressLoop = () => {
    updateFromAudio()
    if (!audioEl.paused && !audioEl.ended && readingHighlight.value) {
      audioProgressRaf = requestAnimationFrame(runProgressLoop)
    } else {
      audioProgressRaf = null
    }
  }
  audioTimeUpdateHandler = updateFromAudio
  audioPlayingHandler = () => {
    startPulseFromCurrentAudioTime()
    runProgressLoop()
  }
  audioLoadedMetadataHandler = () => {
    if (audioEl.currentTime > 0 || !audioEl.paused) {
      startPulseFromCurrentAudioTime()
    }
  }
  audioEl.addEventListener('timeupdate', updateFromAudio)
  audioEl.addEventListener('playing', audioPlayingHandler)
  audioEl.addEventListener('loadedmetadata', audioLoadedMetadataHandler)
  if (!audioEl.paused && !audioEl.ended) {
    startPulseFromCurrentAudioTime()
    runProgressLoop()
  }
}

function startReadingPulse(autoStopMs) {
  if (readingTimer) clearTimeout(readingTimer)
  const firstIdx = syllableSegments.value.findIndex((segment) => !segment.isGap)
  lastReadingProgress = 0
  activeSyllable.value = firstIdx
  activeKaraokeWordIndex.value = wordByWordHighlightEnabled.value && spokenWordTimeline.value.length ? 0 : -1
  const firstTimelinePos = spokenSyllableTimeline.value.findIndex((entry) => entry.idx === firstIdx)
  lastTimelineIndex = firstTimelinePos >= 0 ? firstTimelinePos : -1
  readingHighlight.value = true
  if (Number.isFinite(autoStopMs) && autoStopMs > 0) {
    readingTimer = window.setTimeout(() => {
      stopReadingPulse()
    }, autoStopMs)
  }
}

function stopReadingPulse() {
  stopVoice()
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
  activeKaraokeWordIndex.value = -1
  lastReadingProgress = 0
  lastTimelineIndex = -1
  clearSyllableTicker()
  if (readingTimer) {
    clearTimeout(readingTimer)
    readingTimer = null
  }
}

function handleReadingPlay() {
  if (!AUDIO_TEXT_HIGHLIGHT_ENABLED || !audioSyllableHighlightEnabled.value) return
  // En ejercicios con audio real, la sílaba activa debe venir solo del progreso del audio.
  clearSyllableTicker()
  const estimate = getEstimatedReadingDurationMs()
  const effective = getEffectiveDurationMs(estimate, READING_AUDIO_PACE)
  lastReadingProgress = 0
  startReadingPulse(effective)
}

function handleReadingProgress(payload = {}) {
  if (!AUDIO_TEXT_HIGHLIGHT_ENABLED || !audioSyllableHighlightEnabled.value) return
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
  if (activeAudioEl && audioPlayingHandler) {
    activeAudioEl.removeEventListener('playing', audioPlayingHandler)
    audioPlayingHandler = null
  }
  if (activeAudioEl && audioLoadedMetadataHandler) {
    activeAudioEl.removeEventListener('loadedmetadata', audioLoadedMetadataHandler)
    audioLoadedMetadataHandler = null
  }
  if (audioProgressRaf) {
    cancelAnimationFrame(audioProgressRaf)
    audioProgressRaf = null
  }
}

function syncActiveSyllableByProgress(progress) {
  syncActiveWordByProgress(progress)
  const timeline = spokenSyllableTimeline.value
  if (!timeline.length) return
  const clamped = Math.min(1, Math.max(0, progress))
  // Evita saltos hacia atrás por jitter del reproductor.
  const monotonic = Math.max(lastReadingProgress, clamped)
  lastReadingProgress = monotonic
  const rawTarget =
    timeline.findIndex((entry) => monotonic <= entry.endProgress)
  const targetPos = rawTarget >= 0 ? rawTarget : timeline.length - 1
  const steppedTarget =
    lastTimelineIndex >= 0 ? Math.min(targetPos, lastTimelineIndex + 1) : targetPos
  const safePos = Math.max(0, steppedTarget)
  lastTimelineIndex = Math.max(lastTimelineIndex, safePos)
  activeSyllable.value = timeline[safePos].idx
}

function syncActiveWordByProgress(progress) {
  if (!wordByWordHighlightEnabled.value) {
    activeKaraokeWordIndex.value = -1
    return
  }
  const timeline = spokenWordTimeline.value
  if (!timeline.length) {
    activeKaraokeWordIndex.value = -1
    return
  }
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0))
  const target = timeline.findIndex((entry) => clamped <= entry.endProgress)
  activeKaraokeWordIndex.value = target >= 0 ? target : timeline.length - 1
}

watch(
  () => current.value?.id,
  () => {
    // Limpieza fuerte al cambiar ejercicio para evitar timers/audio residuales fuera de fase.
    clearTutorTimers()
    tutorStepIndex.value = 0
    tutorAutoAudioPlayedFor.value = ''
    guidedOptionIndex.value = -1
    selectedOptionText.value = ''
    resetReadingHighlight()
    stopVoice()
    clearAudioListeners()
    lastReadingProgress = 0
    activeSyllable.value = -1
    activeKaraokeWordIndex.value = -1
    resetCompleteWordInputs()
    resetLetterBuild()
    scheduleTutorSoon(180)
  }
)

watch(
  () => currentStatus.value,
  (status) => {
    clearTutorTimers()
    if (status === 'pending' || status === 'fail') {
      if (status === 'pending') tutorStepIndex.value = 0
      scheduleTutorSoon(status === 'fail' ? 420 : 180)
    }
  },
  { immediate: true }
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
  clearTutorTimers()
  if (confettiTimer) clearTimeout(confettiTimer)
  if (avatarCelebrateTimer) clearTimeout(avatarCelebrateTimer)
  if (readingTimer) clearTimeout(readingTimer)
  stopVoice()
  clearSyllableTicker()
  clearAudioListeners()
  restoreExerciseScrollLock()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateMobileViewportFlag)
  }
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
.game-view {
  padding: 1.5rem;
  font-family: var(--font-readable, 'Lexend', 'Nunito Sans', 'Segoe UI', sans-serif);
  --exercise-image-radius: var(--square-image-radius, 25px);
}
.btn-option {
  display: inline-flex;
  width: auto;
  min-width: clamp(96px, 24vw, 180px);
  max-width: min(100%, 320px);
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 0.68rem 1.05rem;
  min-height: 56px;
  border-radius: 18px;
  border: 2px solid rgba(14, 165, 233, 0.22);
  background: #ffffff;
  font-weight: 900;
  font-size: clamp(1.14rem, 4.4vw, 1.38rem);
  line-height: 1.18;
  color: #0f172a;
  text-transform: none;
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
  box-shadow: 0 8px 0 rgba(14, 165, 233, 0.16), 0 13px 20px rgba(15, 23, 42, 0.1);
  transform: scale(1);
}
.btn-option:hover {
  border-color: #0ea5e9;
  background: #f8fdff;
  box-shadow: 0 10px 0 rgba(14, 165, 233, 0.18), 0 16px 24px rgba(14, 165, 233, 0.16);
  transform: translateY(-2px);
}
.btn-option:focus-visible {
  outline: 3px solid #0ea5e9;
  outline-offset: 2px;
}
.btn-option:active {
  transform: translateY(5px) scale(0.99);
  box-shadow: 0 3px 0 rgba(14, 165, 233, 0.18), 0 8px 12px rgba(15, 23, 42, 0.1);
}
.btn-option.btn-active {
  border-color: #38bdf8;
  background: #f2fbff;
  box-shadow: 0 8px 0 rgba(56, 189, 248, 0.22), 0 14px 22px rgba(56, 189, 248, 0.18);
}
.letter-option {
  min-width: 72px;
  max-width: 92px;
  min-height: 64px;
  padding: 0.55rem 0.7rem;
  font-size: clamp(2rem, 8vw, 2.7rem);
  line-height: 1;
  font-weight: 900;
}
.letter-option--selected {
  border-color: #22c55e;
  background: linear-gradient(180deg, #ecfccb 0%, #bbf7d0 100%);
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 14px 24px rgba(34, 197, 94, 0.22);
}

.game-view.option-status-ok .btn-option.btn-active {
  border-color: rgba(132, 204, 22, 0.42);
  background: #f0fdf4;
  color: #0f172a;
  box-shadow: 0 8px 0 rgba(132, 204, 22, 0.22), 0 14px 22px rgba(132, 204, 22, 0.18);
}

.game-view.option-status-fail .btn-option.btn-active {
  border-color: rgba(245, 158, 11, 0.42);
  background: #fff8db;
  color: #334155;
  box-shadow: 0 8px 0 rgba(245, 158, 11, 0.18), 0 14px 22px rgba(245, 158, 11, 0.12);
}
.options-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
}
.word-build-preview {
  min-height: 48px;
  margin: 0;
  font-size: clamp(2rem, 8vw, 2.8rem);
  line-height: 1.1;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0.08em;
}
.audio-visible-text,
.word-support {
  width: min(100%, 680px);
  margin: 0.35rem auto 0.85rem;
  padding: 0.8rem 1rem;
  border-radius: 18px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  font-size: clamp(1.45rem, 6vw, 2.1rem);
  line-height: 1.35;
  font-weight: 850;
  text-align: center;
}
.punctuation-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}
.punctuation-option__face {
  font-size: 1.65em;
  line-height: 1;
}
.punctuation-option__sign {
  font-size: 1.5em;
  line-height: 1;
  font-weight: 900;
}
.missing-letter-pieces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 0.8rem;
}
.missing-letter-piece {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border: 2px solid #93c5fd;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%);
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 900;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
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
  min-height: 60px;
  padding: 0.8rem 1rem;
  font-size: 1.12rem;
}
.syllable-order-target {
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: 0.08em;
}
.read-answer-question {
  margin: 0.4rem 0 0.85rem;
  text-align: left;
  color: #0b6e4f;
  font-weight: 800;
  font-size: clamp(1.2rem, 4.9vw, 1.45rem);
  line-height: 1.55;
  max-width: 100%;
  text-wrap: pretty;
}
.tense-guide {
  margin: 0 0 0.65rem;
  text-align: left;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 1.02rem;
}
.options-column {
  flex-direction: row;
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
  width: auto;
  min-width: clamp(110px, 28vw, 210px);
}
.choice-visual {
  display: grid;
  place-items: center;
  margin: 0 auto 0.45rem;
  width: min(100%, 250px);
  max-width: 100%;
  min-height: clamp(115px, 20vh, 170px);
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
}
.choice-visual-img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: min(170px, 26vh);
  object-fit: contain;
  object-position: center;
  display: block;
  background: transparent;
  box-shadow: none;
  border-radius: var(--exercise-image-radius);
}
.guided-word-visual {
  width: min(100%, 250px);
  max-width: 100%;
  margin-bottom: 0.45rem;
}
.guided-word-visual .choice-visual-img {
  animation: guidedImageBounce 2.2s ease-in-out infinite;
  transform-origin: center bottom;
  cursor: pointer;
}
.guided-word-visual .choice-visual-img:hover {
  transform: scale(1.04);
  filter: drop-shadow(0 12px 20px rgba(14, 165, 233, 0.2));
}
.syllable-order-visual {
  width: min(100%, 300px);
  min-height: clamp(115px, 18vh, 165px);
  margin-bottom: 0.6rem;
}
.syllable-order-visual .choice-visual-img {
  max-height: min(165px, 24vh);
}
.guided-choice-option--spotlight {
  border-color: #38bdf8;
  background: linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%);
  box-shadow: 0 0 0 7px rgba(56, 189, 248, 0.14), 0 12px 22px rgba(14, 165, 233, 0.18);
  transform: translateY(-2px) scale(1.02);
}
.guided-choice-option--selected {
  border-color: #f59e0b;
  background: linear-gradient(180deg, #fff8db 0%, #fef3c7 100%);
}
.guided-choice-option--correct {
  border-color: #84cc16;
  background: linear-gradient(135deg, #d9f99d 0%, #bef264 48%, #fde68a 100%);
  box-shadow: 0 12px 22px rgba(132, 204, 22, 0.24);
}
.guided-choice-option--incorrect {
  border-color: #fb923c;
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
  box-shadow: 0 10px 18px rgba(251, 146, 60, 0.16);
}
.choice-emoji {
  font-size: 3rem;
  line-height: 1;
}
.exercise-visual {
  width: min(100%, 250px);
  max-width: 100%;
  margin: 0 auto 0.45rem;
  border-radius: var(--exercise-image-radius);
  box-shadow: none;
  background: transparent;
  display: grid;
  place-items: center;
  padding: 0;
  aspect-ratio: auto;
  overflow: visible;
}
.exercise-visual img {
  width: auto;
  max-width: 100%;
  max-height: min(175px, 26vh);
  height: auto;
  object-fit: contain;
  object-position: center;
  display: block;
  border-radius: var(--exercise-image-radius);
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
.reading-animated {
  background: linear-gradient(135deg, #fff7d0, #ffe8a3);
  box-shadow: 0 10px 24px rgba(251, 191, 36, 0.3);
  color: #92400e;
}
.audio-panel {
  gap: 0.5rem;
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
  .guided-word-visual .choice-visual-img,
  .avatar-chip--celebrate,
  .avatar-reward {
    animation: none;
    transform: none;
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
  background: linear-gradient(180deg, #fff8e7 0%, #eef9ff 100%);
  color: #334155;
  border: 1px solid rgba(251, 191, 36, 0.28);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}
.status-soft-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #facc15;
  box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.18);
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
@keyframes tutorHighlight {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(56, 189, 248, 0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.12);
  }
}
@keyframes tutorButtonGlow {
  0%,
  100% {
    filter: none;
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.2));
  }
}
@keyframes guidedImageBounce {
  0%,
  100% {
    transform: scale(1);
  }
  45% {
    transform: translateY(-4px) scale(1.045);
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
  width: min(100%, 760px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
}
.smartick-progress {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: start;
}
.avatar-chip {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  display: grid;
  place-items: center;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.avatar-chip img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.avatar-chip--celebrate {
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 16px 28px rgba(245, 158, 11, 0.36);
}
.avatar-reward {
  position: absolute;
  right: -8px;
  top: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f59e0b;
  color: #fff;
  font-size: 0.85rem;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.38);
  animation: avatarRewardPop 0.65s ease;
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
  align-items: center;
}
.map-only-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  line-height: 0;
}
.map-only-icon {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
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
.icon-btn:active {
  transform: scale(0.95);
}
.action-icon-img {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
  margin: 0 auto;
}
.smartick-stage {
  display: grid;
  justify-content: center;
  gap: 0.35rem;
  margin: 0;
  justify-self: center;
  text-align: center;
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
.exercise-counter-pill {
  width: max-content;
  justify-self: center;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  background: #fcefb4;
  color: #7c4a03;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}
.smartick-card {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
}
.smartick-card-head {
  margin-bottom: 0.9rem;
  padding-bottom: 0;
  border-bottom: none;
}
.smartick-card-content {
  position: relative;
}
.smartick-card-content.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.45rem;
}
.smartick-card-content.space-y-4 > :deep(.guided-tutor-card) + section {
  margin-top: 0.1rem;
}
.concept-mini-lesson {
  width: min(100%, 760px);
  margin: 0 auto 0.55rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(84px, 96px));
  justify-content: center;
  gap: 0.5rem;
}
.concept-mini-lesson__item {
  width: 100%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.15rem;
  padding: 0.35rem;
  border-radius: 18px;
  background: #e0f2fe;
  border: 1px solid rgba(14, 165, 233, 0.22);
  box-shadow: none;
  color: #0ea5e9;
  min-width: 0;
  overflow: hidden;
}
.concept-mini-lesson__item span {
  max-width: 100%;
  font-size: clamp(0.78rem, 2.6vw, 1.08rem);
  line-height: 1.05;
  text-align: center;
  overflow-wrap: anywhere;
}
.concept-mini-lesson__item strong {
  max-width: 100%;
  font-size: clamp(0.62rem, 2.1vw, 0.72rem);
  line-height: 1.05;
  text-align: center;
  color: #0ea5e9;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.concept-mini-lesson__item small {
  max-width: 100%;
  font-size: clamp(0.45rem, 1.65vw, 0.54rem);
  line-height: 1.08;
  text-align: center;
  color: #0369a1;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.tutor-focus-audio .sentence-audio-btn {
  outline: 4px solid rgba(56, 189, 248, 0.34);
  outline-offset: 6px;
  border-radius: 20px;
  animation: tutorHighlight 1.5s ease-in-out infinite;
}
.tutor-focus-options .btn-option,
.tutor-focus-options :deep(.exercise-options__button) {
  animation: tutorButtonGlow 1.5s ease-in-out infinite;
}
:deep(.exercise-layout) {
  width: 100%;
  margin: 0;
  padding: 0;
  gap: 0.55rem;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
:deep(.exercise-layout__media) {
  min-height: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
:deep(.exercise-layout__prompt),
:deep(.exercise-layout__content) {
  width: 100%;
}
:deep(.exercise-image) {
  width: min(100%, 250px);
  margin: 0 auto;
  border: none;
  border-radius: var(--exercise-image-radius);
  background: transparent;
  min-height: clamp(115px, 20vh, 170px);
  max-height: min(180px, 28vh);
}
:deep(.exercise-image__img) {
  padding: 0;
  border-radius: var(--exercise-image-radius);
}
:deep(.exercise-options) {
  width: min(100%, 760px);
  margin: 0 auto;
}
:deep(.exercise-options__button) {
  border-color: rgba(14, 165, 233, 0.22);
  background: #ffffff;
  box-shadow: 0 8px 0 rgba(14, 165, 233, 0.16), 0 13px 20px rgba(15, 23, 42, 0.1);
}
:deep(.exercise-options__button.exercise-options__button--correct) {
  border-color: rgba(132, 204, 22, 0.42);
  background: #f0fdf4;
  color: #0f172a;
  box-shadow: 0 8px 0 rgba(132, 204, 22, 0.22), 0 14px 22px rgba(132, 204, 22, 0.18);
}
:deep(.exercise-options__button.exercise-options__button--incorrect) {
  border-color: rgba(245, 158, 11, 0.42);
  background: #fff8db;
  color: #334155;
  box-shadow: 0 8px 0 rgba(245, 158, 11, 0.18), 0 14px 22px rgba(245, 158, 11, 0.12);
}
.smartick-card .exercise-visual {
  max-width: 250px;
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
  min-width: 1.8rem;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: lowercase;
}
.cw-input {
  width: clamp(3rem, 12vw, 4rem);
  height: clamp(3.2rem, 13vw, 4.2rem);
  border-radius: 1rem;
  border: 2px solid #93c5fd;
  background: #eff6ff;
  text-align: center;
  font-size: clamp(1.8rem, 7vw, 2.45rem);
  font-weight: 800;
  text-transform: lowercase;
  color: #1e3a8a;
  outline: none;
}
.cw-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2);
}
.audio-prompt-instruction {
  margin: 0.45rem 0 0;
  font-size: clamp(1.02rem, 3.8vw, 1.2rem);
  line-height: 1.58;
  color: #1e293b;
}
.audio-prompt-stack {
  width: min(100%, 760px);
  display: grid;
  gap: 0.15rem;
  margin: 0 auto;
}
.audio-prompt-enunciado {
  margin: 0.45rem 0 0;
  font-size: clamp(1.14rem, 4.2vw, 1.34rem);
  line-height: 1.52;
  font-weight: 760;
  color: #0f172a;
}
.complete-prompt-box {
  width: min(100%, 760px);
  margin: 0 auto 0.2rem;
  padding: 0.9rem 0.95rem;
  border: 2px solid rgba(14, 165, 233, 0.26);
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef7ff 100%);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.12);
}
.complete-prompt-box__text {
  margin: 0;
  font-size: clamp(1.18rem, 4.1vw, 1.42rem);
  line-height: 1.5;
  font-weight: 760;
  color: #0f172a;
}
.game-view--mono-3-3-centered :deep(.exercise-layout__prompt),
.game-view--mono-3-3-centered :deep(.audio-prompt-stack),
.game-view--mono-3-3-centered :deep(.audio-prompt-enunciado),
.game-view--mono-3-3-centered :deep(.audio-prompt-instruction),
.game-view--mono-3-3-centered :deep(.exercise-layout__title),
.game-view--mono-3-3-centered :deep(.exercise-layout__subtitle),
.game-view--mono-3-3-centered :deep(.text-left) {
  text-align: center !important;
  justify-items: center;
}
@keyframes avatarRewardPop {
  0% {
    transform: scale(0.2);
    opacity: 0;
  }
  70% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@media (max-width: 768px) {
  .concept-mini-lesson {
    grid-template-columns: repeat(3, minmax(72px, 1fr));
    gap: 0.35rem;
  }
  .concept-mini-lesson__item {
    padding: 0.25rem;
    border-radius: 15px;
  }
  .game-view {
    padding: 0;
    margin: 0;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: auto;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
  .smartick-shell {
    padding: 0;
    border-radius: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 100dvh;
  }
  .smartick-card {
    display: grid;
    grid-template-rows: auto minmax(0, auto);
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
    margin: 0;
    width: 100%;
    max-width: 100%;
    padding: 0.46rem 0.52rem 0.58rem;
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
  .options-row {
    gap: 0.42rem;
  }
  .btn-option {
    width: auto;
    max-width: none;
    min-width: min(46%, 170px);
    min-height: 46px;
    font-size: clamp(0.98rem, 4.3vw, 1.15rem);
    line-height: 1.18;
    padding: 0.46rem 0.58rem;
  }
  .smartick-card-head {
    margin-bottom: 0.38rem;
    padding-bottom: 0.18rem;
  }
  .smartick-card-content {
    min-height: 0;
    overflow: visible;
    display: grid;
    align-content: start;
    gap: 0.4rem;
  }
  :deep(.exercise-options) {
    gap: 0.42rem;
  }
  :deep(.exercise-options__button) {
    min-width: min(46%, 158px);
    min-height: 42px;
    padding: 0.4rem 0.52rem;
    border-radius: 14px;
    font-size: clamp(0.92rem, 4vw, 1.05rem);
    line-height: 1.16;
    box-shadow: 0 5px 0 rgba(14, 165, 233, 0.16), 0 8px 12px rgba(15, 23, 42, 0.08);
  }
  .pair-board {
    gap: 0.45rem;
    margin-top: 0.2rem;
  }
  .pair-column {
    gap: 0.42rem;
  }
  .pair-column .btn-option {
    min-width: min(44vw, 150px);
  }
  .game-view.compact-mobile .smartick-card {
    padding: 0.42rem 0.48rem 0.52rem;
  }
  .game-view.compact-mobile .smartick-card-head {
    margin-bottom: 0.28rem;
    padding-bottom: 0.14rem;
  }
  .smartick-topbar {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto auto;
    justify-items: stretch;
    gap: 0.35rem;
  }
  .smartick-progress {
    gap: 0.38rem;
    min-width: 0;
  }
  .score-track {
    gap: 0.08rem;
    min-width: 0;
  }
  .score-stars {
    gap: 0.16rem;
  }
  .star-dot {
    width: 12px;
    height: 12px;
    border-radius: 4px;
  }
  .score-points {
    font-size: 0.72rem;
    line-height: 1;
    white-space: nowrap;
  }
  .smartick-stage {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    gap: 0.25rem;
    min-width: 0;
  }
  .stage-pill,
  .exercise-counter-pill {
    width: auto;
    white-space: nowrap;
    line-height: 1;
  }
  .smartick-actions {
    justify-self: end;
    gap: 0.28rem;
  }
  .game-view.compact-mobile .avatar-chip {
    width: 34px;
    height: 34px;
    border-radius: 12px;
  }
  .game-view.compact-mobile .avatar-chip img {
    width: 28px;
    height: 28px;
  }
  .game-view.compact-mobile .icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 13px;
  }
  .game-view.compact-mobile .stage-pill {
    padding: 0.18rem 0.45rem;
    font-size: 0.68rem;
  }
  .game-view.compact-mobile .exercise-counter-pill {
    padding: 0.16rem 0.36rem;
    font-size: 0.64rem;
  }
  .game-view.compact-mobile .exercise-visual {
    width: min(100%, 170px);
    max-width: min(170px, 48vw);
    margin-bottom: 0.22rem;
  }
  .game-view.compact-mobile .exercise-visual img {
    max-height: min(130px, 22vh);
  }
  .game-view.compact-mobile .choice-visual {
    width: min(100%, 180px);
    min-height: clamp(95px, 17vh, 130px);
    margin-bottom: 0.35rem;
  }
  .game-view.compact-mobile .choice-visual-img {
    max-height: min(130px, 22vh);
  }
  .game-view.compact-mobile :deep(.exercise-image) {
    width: min(100%, 180px);
    min-height: clamp(95px, 17vh, 130px);
    max-height: min(136px, 22vh);
  }
  .game-view.compact-mobile .btn-option {
    min-height: 42px;
    font-size: clamp(0.92rem, 4vw, 1.05rem);
    line-height: 1.16;
    padding: 0.4rem 0.5rem;
  }
  .game-view.ultra-compact-mobile .smartick-card {
    padding: 0.34rem 0.4rem 0.42rem;
  }
  .game-view.ultra-compact-mobile .smartick-card-head {
    margin-bottom: 0.35rem;
    padding-bottom: 0.18rem;
  }
  .game-view.ultra-compact-mobile .stage-pill {
    font-size: 0.64rem;
    padding: 0.16rem 0.38rem;
  }
  .game-view.ultra-compact-mobile .exercise-counter-pill {
    font-size: 0.6rem;
    padding: 0.14rem 0.32rem;
  }
  .game-view.ultra-compact-mobile .btn-option {
    min-height: 38px;
    font-size: clamp(0.86rem, 3.8vw, 0.98rem);
    line-height: 1.14;
    padding: 0.5rem 0.58rem;
    border-radius: 12px;
  }
  .game-view.ultra-compact-mobile :deep(.exercise-options__button) {
    min-height: 38px;
    padding: 0.38rem 0.46rem;
    border-radius: 12px;
    font-size: clamp(0.86rem, 3.8vw, 0.98rem);
  }
  .game-view.ultra-compact-mobile .exercise-visual {
    width: min(100%, 150px);
    max-width: min(150px, 44vw);
  }
  .game-view.ultra-compact-mobile .exercise-visual img {
    max-height: min(112px, 19vh);
  }
  .game-view.ultra-compact-mobile .choice-visual {
    width: min(100%, 150px);
    min-height: clamp(82px, 15vh, 112px);
  }
  .game-view.ultra-compact-mobile .choice-visual-img {
    max-height: min(112px, 19vh);
  }
  .game-view.ultra-compact-mobile :deep(.exercise-image) {
    width: min(100%, 150px);
    min-height: clamp(82px, 15vh, 112px);
    max-height: min(118px, 19vh);
  }
  .game-view.compact-mobile .map-only-icon {
    width: 34px;
    height: 34px;
  }
  .game-view.compact-mobile .action-icon-img {
    width: 20px;
    height: 20px;
  }
  .game-view.ultra-compact-mobile .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 12px;
  }
  .game-view.ultra-compact-mobile .map-only-icon {
    width: 32px;
    height: 32px;
  }
  .game-view.ultra-compact-mobile .action-icon-img {
    width: 18px;
    height: 18px;
  }
  .map-only-icon {
    width: 34px;
    height: 34px;
  }
  .icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 14px;
  }
  .action-icon-img {
    width: 20px;
    height: 20px;
  }
}
</style>
