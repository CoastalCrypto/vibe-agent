import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Settings, FilePlanEntry } from '../../../electron/types'

const mockCreate = vi.fn()
vi.mock('../../../electron/agent/client', () => ({
  createClient: () => ({ chat: { completions: { create: mockCreate } } }),
}))

const settings: Settings = {
  modelEndpoint: 'http://localhost:11434/v1',
  modelName: 'test-model',
  apiKey: '',
  workspaceDir: '/tmp/vibe',
  openInVSCode: false,
}

const file: FilePlanEntry = { filename: 'index.js', description: 'Entry', language: 'javascript' }
const plan: FilePlanEntry[] = [file]

describe('runStream', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls onToken for each non-null delta', async () => {
    const chunks = [
      { choices: [{ delta: { content: 'const ' } }] },
      { choices: [{ delta: { content: 'x = 1' } }] },
      { choices: [{ delta: { content: null } }] },
    ]
    mockCreate.mockResolvedValueOnce({
      [Symbol.asyncIterator]: async function* () { yield* chunks },
    })
    const { runStream } = await import('../../../electron/agent/stream')
    const tokens: string[] = []
    await runStream(settings, 'build', ['Node.js'], plan, file, (t) => tokens.push(t))
    expect(tokens).toEqual(['const ', 'x = 1'])
  })

  it('skips chunks with missing delta content', async () => {
    const chunks = [
      { choices: [{ delta: { content: 'hello' } }] },
      { choices: [{ delta: {} }] },
    ]
    mockCreate.mockResolvedValueOnce({
      [Symbol.asyncIterator]: async function* () { yield* chunks },
    })
    const { runStream } = await import('../../../electron/agent/stream')
    const tokens: string[] = []
    await runStream(settings, 'build', [], plan, file, (t) => tokens.push(t))
    expect(tokens).toEqual(['hello'])
  })
})
