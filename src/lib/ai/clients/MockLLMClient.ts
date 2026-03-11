import type { ILLMClient } from './LLMClient'
import type {
  PromptInput,
  GenerationOptions,
  LLMTextResponse,
  LLMJsonResponse
} from '../types'
import type { AIReadingExerciseBatch } from '../schemas/exerciseSchema'

export class MockLLMClient implements ILLMClient {
  async generateText(input: PromptInput, options?: GenerationOptions): Promise<LLMTextResponse> {
    const promptSnippet = input.user.slice(0, 80)

    return {
      text: `Mock response: content generated for prompt "${promptSnippet}".`,
      model: options?.model ?? 'mock-llm-v1',
      usage: {
        promptTokens: 40,
        completionTokens: 20,
        totalTokens: 60
      },
      raw: {
        source: 'mock',
        timestamp: new Date().toISOString()
      }
    }
  }

  async generateStructuredJson<TData = unknown>(
    _input: PromptInput,
    options?: GenerationOptions
  ): Promise<LLMJsonResponse<TData>> {
    const batch: AIReadingExerciseBatch = {
      exercises: [
        {
          id: 'mock-ex-1',
          ageRange: '4-6',
          title: 'El gato y la luna',
          text: 'El gato mira la luna desde la ventana.',
          question: '¿Qué mira el gato?',
          options: ['El sol', 'La luna', 'La mesa'],
          correctAnswer: 'La luna',
          skillType: 'reading_comprehension',
          difficulty: 'easy'
        },
        {
          id: 'mock-ex-2',
          ageRange: '6-8',
          title: 'Camino al parque',
          text: 'Ana lleva una pelota roja al parque para jugar con su hermano.',
          question: '¿Qué lleva Ana al parque?',
          options: ['Una pelota roja', 'Un libro azul', 'Una mochila verde'],
          correctAnswer: 'Una pelota roja',
          skillType: 'decoding',
          difficulty: 'easy'
        },
        {
          id: 'mock-ex-3',
          ageRange: '8-10',
          title: 'La linterna apagada',
          text: 'Pedro no encontró pilas, por eso su linterna no encendió durante la excursión nocturna.',
          question: '¿Por qué no encendió la linterna?',
          options: ['Porque estaba mojada', 'Porque no tenía pilas', 'Porque era de día'],
          correctAnswer: 'Porque no tenía pilas',
          skillType: 'inference',
          difficulty: 'medium'
        }
      ]
    }

    return {
      data: batch as TData,
      model: options?.model ?? 'mock-llm-v1',
      usage: {
        promptTokens: 120,
        completionTokens: 180,
        totalTokens: 300
      },
      raw: {
        source: 'mock',
        timestamp: new Date().toISOString()
      }
    }
  }
}

export default MockLLMClient
