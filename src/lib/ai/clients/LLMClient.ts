import type {
  PromptInput,
  GenerationOptions,
  LLMTextResponse,
  LLMJsonResponse,
  LLMError
} from '../types'

export interface ILLMClient {
  generateText(input: PromptInput, options?: GenerationOptions): Promise<LLMTextResponse>

  generateStructuredJson<TData = unknown>(
    input: PromptInput,
    options?: GenerationOptions
  ): Promise<LLMJsonResponse<TData>>
}

export class LLMClientNotImplementedError extends Error implements LLMError {
  code = 'LLM_CLIENT_NOT_IMPLEMENTED'
  provider?: string
  details?: unknown

  constructor(message = 'LLM client is not implemented yet.', details?: unknown) {
    super(message)
    this.name = 'LLMClientNotImplementedError'
    this.details = details
  }
}
