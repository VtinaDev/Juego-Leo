export interface PromptInput {
  system?: string
  user: string
  context?: Record<string, unknown>
}
