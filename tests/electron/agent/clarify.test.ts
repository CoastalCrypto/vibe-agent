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

describe('runClarify', () => {
  beforeEach(() => vi.clearAllMocks())

  it('parses clean JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            { question: 'Which coins?', options: ['BTC/ETH', 'Configurable'] },
          ]),
        },
      }],
    })
    const { runClarify } = await import('../../../electron/agent/clarify')
    const questions = await runClarify(settings, 'build a discord bot')
    expect(questions).toHaveLength(1)
    expect(questions[0].question).toBe('Which coins?')
    expect(questions[0].options).toEqual(['BTC/ETH', 'Configurable'])
  })

  it('strips markdown fences and parses', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: '```json\n[{"question":"Lang?","options":["Node","Python"]}]\n```',
        },
      }],
    })
    const { runClarify } = await import('../../../electron/agent/clarify')
    const questions = await runClarify(settings, 'build a bot')
    expect(questions[0].question).toBe('Lang?')
  })

  it('throws after two failed parse attempts', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] })
    const { runClarify } = await import('../../../electron/agent/clarify')
    await expect(runClarify(settings, 'build')).rejects.toThrow('Failed to parse clarification questions')
  })
})
