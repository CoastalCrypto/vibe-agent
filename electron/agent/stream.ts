import type { Settings, FilePlanEntry } from '../types'
import { createClient } from './client'

function buildSystemPrompt(plan: FilePlanEntry[]): string {
  const fileList = plan.map((f) => `- ${f.filename}: ${f.description}`).join('\n')
  return `You are a coding agent writing files for a project.
Project file plan:
${fileList}

Rules:
- Write ONLY the file being requested
- Raw code only — no markdown fences, no explanations
- Complete, working implementation`
}

export async function runStream(
  settings: Settings,
  prompt: string,
  answers: string[],
  plan: FilePlanEntry[],
  file: FilePlanEntry,
  onToken: (token: string) => void
): Promise<void> {
  const client = createClient(settings)

  const stream = await client.chat.completions.create({
    model: settings.modelName,
    stream: true,
    messages: [
      { role: 'system', content: buildSystemPrompt(plan) },
      {
        role: 'user',
        content: `Original prompt: ${prompt}\nAnswers: ${answers.join(', ')}\n\nWrite the file: ${file.filename}\n(${file.description})`,
      },
    ],
  })

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content
    if (token) onToken(token)
  }
}
