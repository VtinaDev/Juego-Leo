import type { AIProvider, AIProviderConfig } from '../config'

export interface ProviderClientPlaceholder {
  provider: AIProvider
  status: 'not_implemented'
  reason: string
}

export function resolveAIProviderClient(config: AIProviderConfig): ProviderClientPlaceholder {
  if (config.provider === 'vertex-ai') {
    return {
      provider: 'vertex-ai',
      status: 'not_implemented',
      reason: 'Vertex AI client integration is pending.'
    }
  }

  return {
    provider: 'gemini-developer-api',
    status: 'not_implemented',
    reason: 'Gemini Developer API client integration is pending.'
  }
}
