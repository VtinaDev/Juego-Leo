export interface LLMError {
  code: string
  message: string
  provider?: string
  details?: unknown
}
