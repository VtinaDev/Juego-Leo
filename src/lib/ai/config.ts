export type AIProvider = 'gemini-developer-api' | 'vertex-ai'

export interface AIProviderConfig {
  provider: AIProvider
  model?: string
  apiKey?: string
  projectId?: string
  location?: string
}

const DEFAULT_PROVIDER: AIProvider = 'gemini-developer-api'

export function getAIConfigFromEnv(env: Record<string, string | undefined> = import.meta.env): AIProviderConfig {
  const provider = (env.VITE_AI_PROVIDER as AIProvider | undefined) ?? DEFAULT_PROVIDER

  return {
    provider,
    model: env.VITE_AI_MODEL,
    apiKey: env.VITE_GEMINI_API_KEY,
    projectId: env.VITE_GCP_PROJECT_ID,
    location: env.VITE_GCP_LOCATION
  }
}
