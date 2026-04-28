import type { Settings, FilePlanEntry } from '../types'
import { createClient } from './client'
import { stripFences } from './utils'

const SYSTEM_PROMPT = `You are a coding agent planning a project.
Return a JSON array of files to create — ONLY JSON, no markdown, no explanation:
[{"filename": "path/to/file.ext", "description": "what this file does", "language": "javascript"}]
List files in dependency order. Always include README.md as the last file.`

function parsePlan(raw: string): FilePlanEntry[] {
  const cleaned = stripFences(raw)
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('not an array')
  return parsed.map((f) => {
    if (!f.filename || !f.language) throw new Error('invalid file entry shape')
    return {
      filename: String(f.filename),
      description: String(f.description ?? ''),
      language: String(f.language),
    }
  })
}

export async function runPlan(
  settings: Settings,
  prompt: string,
  answers: string[]
): Promise<FilePlanEntry[]> {
  const client = createClient(settings)
  const userMessage = `Prompt: ${prompt}\nAnswers: ${answers.join(', ')}`
  let lastRaw = ''

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.chat.completions.create({
      model: settings.modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })
    lastRaw = response.choices[0]?.message?.content ?? ''
    try {
      return parsePlan(lastRaw)
    } catch {
      // retry: same prompt, LLM may self-correct on second attempt
    }
  }

  throw new Error(`Failed to parse file plan. Raw: ${lastRaw}`)
}
