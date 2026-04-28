import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Settings } from '../../../electron/types'

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

describe('runPlan', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns parsed file plan', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            { filename: 'index.js', description: 'Entry point', language: 'javascript' },
            { filename: 'utils/crypto.js', description: 'Price fetching', language: 'javascript' },
          ]),
        },
      }],
    })
    const { runPlan } = await import('../../../electron/agent/plan')
    const plan = await runPlan(settings, 'build a discord bot', ['Configurable', 'Node.js'])
    expect(plan).toHaveLength(2)
    expect(plan[0].filename).toBe('index.js')
    expect(plan[1].language).toBe('javascript')
  })

  it('strips markdown fences', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: '```json\n[{"filename":"app.ts","description":"App","language":"typescript"}]\n```',
        },
      }],
    })
    const { runPlan } = await import('../../../electron/agent/plan')
    const plan = await runPlan(settings, 'build', ['TypeScript'])
    expect(plan[0].filename).toBe('app.ts')
  })

  it('throws after two failed parse attempts', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'oops' } }] })
    const { runPlan } = await import('../../../electron/agent/plan')
    await expect(runPlan(settings, 'build', [])).rejects.toThrow('Failed to parse file plan')
  })
})
