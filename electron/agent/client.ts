import OpenAI from 'openai'
import type { Settings } from '../types'

export function createClient(settings: Settings): OpenAI {
  return new OpenAI({
    baseURL: settings.modelEndpoint,
    apiKey: settings.apiKey || 'local',
  })
}
