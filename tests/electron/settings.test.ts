import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('electron-store', () => {
  return {
    default: class {
      private data: Record<string, unknown> = {}
      get(key: string, def: unknown) { return this.data[key] ?? def }
      set(key: string, val: unknown) { this.data[key] = val }
    },
  }
})

describe('settings', () => {
  beforeEach(() => vi.resetModules())

  it('returns defaults when nothing saved', async () => {
    const { getSettings } = await import('../../electron/settings')
    const s = getSettings()
    expect(s.modelEndpoint).toBe('http://localhost:11434/v1')
    expect(s.modelName).toBe('qwen2.5-coder:7b')
    expect(s.workspaceDir).toContain('vibe-projects')
    expect(s.apiKey).toBe('')
    expect(s.openInVSCode).toBe(true)
  })

  it('saves and retrieves updated settings', async () => {
    const { getSettings, saveSettings } = await import('../../electron/settings')
    saveSettings({ ...getSettings(), modelName: 'llama3.2:3b' })
    expect(getSettings().modelName).toBe('llama3.2:3b')
  })
})
