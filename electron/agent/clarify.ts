import type { Settings, AgentQuestion } from '../types'
import { createClient } from './client'

const SYSTEM_PROMPT = `You are a coding agent gathering requirements before writing code.
Generate 3-5 clarifying questions with 2-4 option choices each.
Return ONLY a valid JSON array — no markdown fences, no explanation:
[{"question": "...", "options": ["option1", "option2"]}]`

function parseQuestions(raw: string): AgentQuestion[] {
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('not an array')
  return parsed.map((q) => {
    if (!q.question || !Array.isArray(q.options)) throw new Error('invalid question shape')
    return {
      question: String(q.question),
      options: q.options.map(String),
    }
  })
}

export async function runClarify(settings: Settings, prompt: string): Promise<AgentQuestion[]> {
  const client = createClient(settings)
  let lastRaw = ''

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.chat.completions.create({
      model: settings.modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    })
    lastRaw = response.choices[0]?.message?.content ?? ''
    try {
      return parseQuestions(lastRaw)
    } catch {
      // retry: same prompt, LLM may self-correct on second attempt
    }
  }

  throw new Error(`Failed to parse clarification questions. Raw: ${lastRaw}`)
}
