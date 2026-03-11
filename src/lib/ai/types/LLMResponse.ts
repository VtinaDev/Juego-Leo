export interface LLMUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface LLMTextResponse {
  text: string
  model?: string
  usage?: LLMUsage
  raw?: unknown
}

export interface LLMJsonResponse<TData = unknown> {
  data: TData
  model?: string
  usage?: LLMUsage
  raw?: unknown
}
