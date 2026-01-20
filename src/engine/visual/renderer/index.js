import { renderQuestionSentence } from './renderQuestionSentence'
import { renderCompleteSentence } from './renderCompleteSentence'
import { renderOrderSentence } from './renderOrderSentence'
import { renderMultipleChoice } from './renderMultipleChoice'
import { renderPairs } from './renderPairs'
import { renderCorrectPhrase } from './renderCorrectPhrase'
import { renderAudioChoice } from './renderAudioChoice'
import { renderAudioWrite } from './renderAudioWrite'
import { renderTenseClassify } from './renderTenseClassify'
import { renderSingularPlural } from './renderSingularPlural'
import { renderDescribeImage } from './renderDescribeImage'
import { renderAudioSentence } from './renderAudioSentence'
import { renderAudioQuestionAnswer } from './renderAudioQuestionAnswer'
import { renderAccents } from './renderAccents'
import { renderImageScene } from './renderImageScene'
import { renderAudioQuestion } from './renderAudioQuestion'
import { renderSentenceSelection } from './renderSentenceSelection'
import { renderPunctuationGame } from './renderPunctuationGame'
import { renderFinalExam } from './renderFinalExam'
import { renderReadWithAudio } from './renderReadWithAudio'
import { renderTextWrite } from './renderTextWrite'

const RENDERERS = {
  question_sentence: renderQuestionSentence,
  complete_sentence: renderCompleteSentence,
  order_sentence: renderOrderSentence,
  read_with_audio: renderReadWithAudio,
  multiple_choice: renderMultipleChoice,
  synonyms: renderPairs,
  pair_synonyms: renderPairs,
  antonyms: renderPairs,
  pair_antonyms: renderPairs,
  correct_phrase: renderCorrectPhrase,
  audio_choice: renderAudioChoice,
  audio_write: renderAudioWrite,
  text_write: renderTextWrite,
  tense_classify: renderTenseClassify,
  singular_plural: renderSingularPlural,
  describe_image: renderDescribeImage,
  audio_sentence: renderAudioSentence,
  audio_question_answer: renderAudioQuestionAnswer,
  audio_question: renderAudioQuestion,
  sentence_selection: renderSentenceSelection,
  accents: renderAccents,
  accent_game: renderAccents,
  punctuation_game: renderPunctuationGame,
  final_exam: renderFinalExam,
  image_scene: renderImageScene
}

export function renderExercise(app, exercise, handlers = {}) {
  if (!exercise?.type) {
    console.error('❌ Ejercicio sin `type`. Verifica templates.json.')
    return
  }

  const renderer = RENDERERS[exercise.type]
  if (!renderer) {
    console.warn(`⚠️ Tipo de ejercicio no reconocido: ${exercise.type}`)
    return
  }

  renderer(app, exercise, handlers)
}

export default renderExercise
